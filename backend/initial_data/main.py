import asyncio
import json
import os
import pathlib
import sys

import sqlalchemy
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from app.api.routes.celery import (
    get_status,
    run_vacuum_analyze_task,
)
from app.core.config import ADMIN_EMAIL
from app.db.gen.queries.personal_notifications import (
    CreatePersonalNotificationParams,
)
from app.services.personal_notifications import PersonalNotificationsService
from initial_data.data import (
    GLOBAL_NOTIFICATIONS,
    PASSWORD_RESET_REQUESTS,
    PERSONAL_NOTIFICATIONS,
    USERS,
    AppEnv,
)

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app.api.routes.admin import create_global_notification, update_user_role
from app.api.routes.users import (
    create_personal_notification,
    request_password_reset,
)
from app.db.tasks import connect_to_db
from app.models.user import RoleUpdate, UserCreate
from app.services.users import UsersService

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "myapp-client" / "myapp_client"))

os.environ["CREATING_INITIAL_DATA"] = "1"


async def init_database():

    initial_data = {
        "users": USERS,
        "password_reset_requests": PASSWORD_RESET_REQUESTS,
        "global_notifications": GLOBAL_NOTIFICATIONS,
        "personal_notifications": PERSONAL_NOTIFICATIONS,
    }
    for name, data in initial_data.items():
        if any(x not in data for x in {e.value for e in AppEnv}):
            raise ValueError(f"{name} must contain all AppEnv values")

    DATASET: AppEnv = os.environ["APP_ENV"] if not os.environ["DATASET"] else os.environ["DATASET"]  # type: ignore

    json_out = os.path.join(os.path.dirname(__file__), f"{DATASET}.json")
    with open(json_out, "w") as f:
        json.dump(
            {name: {k: v.dict() for k, v in data[DATASET].items()} for name, data in initial_data.items()},
            f,
            indent=4,
        )

    engine = connect_to_db()
    conn: AsyncConnection = await engine.connect()
    users_service = UsersService(conn)
    pn_service = PersonalNotificationsService(conn)

    for user in USERS[DATASET].values():
        await users_service.register_new_user(
            new_user=UserCreate(email=user.email, password=user.password, username=user.username),
            admin=user.admin,
            verified=user.verified,
        )
        existing_user = await users_service.get_user_by_email(email=user.email)
        if not existing_user:
            raise Exception("User was not created")
        await update_user_role(
            conn=conn,
            role_update=RoleUpdate(
                email=existing_user.email,
                role=user.role,
            ),
        )
        await pn_service.create_personal_notification(
            notification=CreatePersonalNotificationParams(
                sender=ADMIN_EMAIL.lower(),
                receiver_email=existing_user.email,
                title="Welcome to MYAPP",
                body="Here you can check out all news and updates from MYAPP. \nVisit the help page for more information.",
                label="news",
                link="/help",
            )
        )

    for reset_request in PASSWORD_RESET_REQUESTS[DATASET].values():
        await request_password_reset(conn=conn, reset_request=reset_request)

    for i, notification in enumerate(GLOBAL_NOTIFICATIONS[DATASET].values()):
        new_global_notification = await create_global_notification(conn=conn, notification=notification)
        assert new_global_notification.global_notification_id is not None

        await conn.execute(
            text(
                f"""
            UPDATE global_notifications
            SET created_at = created_at - interval '{i+1} hour',
                updated_at = updated_at - interval '{i+1} hour'
            WHERE global_notification_id = {i+1}
            """
            )
        )

    user = await users_service.get_user_by_email(email=ADMIN_EMAIL)
    for i, notification in enumerate(PERSONAL_NOTIFICATIONS[DATASET].values()):
        new_global_notification = await create_personal_notification(conn=conn, notification=notification, user=user)
        assert new_global_notification.personal_notification_id is not None

    n_notifications = (await conn.execute(sqlalchemy.text("""SELECT COUNT(*) FROM personal_notifications"""))).scalar()
    for i in range(n_notifications):
        await conn.execute(
            text(
                f"""
            UPDATE personal_notifications
            SET created_at = created_at - interval '{i+1} hour',
                updated_at = updated_at - interval '{i+1} hour'
            WHERE personal_notification_id = {i+1}
            """
            )
        )

    await conn.commit()

    if not DATASET == AppEnv.PROD:
        task_accepted = run_vacuum_analyze_task()
        task_status = get_status(task_accepted.task_id)
        while task_status.task_status != "SUCCESS":
            await asyncio.sleep(1)
            task_status = get_status(task_accepted.task_id)

    await conn.commit()
    await conn.close()


if __name__ == "__main__":
    asyncio.run(init_database())
