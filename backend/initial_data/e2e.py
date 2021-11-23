import asyncio
import time
from typing import Dict

from loguru import logger

from app.models.global_notifications import GlobalNotificationCreate
from app.models.password_reset_requests import PasswordResetRequestCreate
from app.models.user import Role, RoleUpdate, UserCreate
from initial_data.utils import (
    change_user_role,
    create_global_notification,
    create_password_reset_request,
    create_user,
    init_database,
)

USERS: Dict[str, UserCreate] = {
    "admin": UserCreate(
        username="admin",
        email="admin@myapp.com",
        password="12341234",
    ),
    "manager": UserCreate(
        username="manager",
        email="manager@myapp.com",
        password="12341234",
    ),
    "verified": UserCreate(
        username="verified",
        email="verified@myapp.com",
        password="12341234",
    ),
    "unverified": UserCreate(
        username="unverified",
        email="unverified@myapp.com",
        password="12341234",
    ),
    "profileTestUser": UserCreate(
        username="thiscanbeupdated",
        email="thiscanbeupdated@myapp.com",
        password="thiscanbeupdated",
    ),
    "toBeVerified": UserCreate(
        username="toBeVerified",
        email="toBeVerified@myapp.com",
        password="12341234",
    ),
    "passwordResetTestUser": UserCreate(
        username="pwdresetuser1",
        email="pwdresetuser1@myapp.com",
        password="pwdresetuser1",
    ),
    "passwordResetTestUser2": UserCreate(
        username="pwdresetuser2",
        email="pwdresetuser2@myapp.com",
        password="pwdresetuser2",
    ),
}


async def main():
    database = await init_database()
    err = await create_user(
        database,
        USERS["admin"],
        admin=True,
        verified=True,
    )
    logger.info(f'Created superuser {USERS["admin"].email}') if not err else logger.exception(err)
    err = await change_user_role(database, RoleUpdate(email=USERS["admin"].email, role=Role.admin))
    logger.info(f'Changed role for {USERS["admin"].email}') if not err else logger.exception(err)

    err = await create_user(
        database,
        USERS["manager"],
        admin=False,
        verified=True,
    )
    logger.info(f'Created superuser {USERS["manager"].email}') if not err else logger.exception(err)
    err = await change_user_role(database, RoleUpdate(email=USERS["manager"].email, role=Role.manager))
    logger.info(f'Changed role for {USERS["manager"].email}') if not err else logger.exception(err)

    err = await create_user(
        database,
        USERS["verified"],
        admin=False,
        verified=True,
    )
    logger.info(f'Created verified user {USERS["verified"].email}') if not err else logger.exception(err)

    err = await create_user(
        database,
        USERS["unverified"],
        admin=False,
        verified=False,
    )
    logger.info(f'Created unverified user  {USERS["unverified"].email}') if not err else logger.exception(err)

    err = await create_user(
        database,
        USERS["toBeVerified"],
        admin=False,
        verified=False,
    )
    logger.info(f'Created unverified user  {USERS["toBeVerified"].email}') if not err else logger.exception(err)

    err = await create_user(
        database,
        USERS["profileTestUser"],
        admin=False,
        verified=True,
    )
    logger.info(f'Created profile update test user {USERS["profileTestUser"].email}') if not err else logger.exception(
        err
    )

    for user in (USERS["passwordResetTestUser"], USERS["passwordResetTestUser2"]):
        err = await create_user(
            database,
            user,
            admin=False,
            verified=True,
        )
        logger.info(f"Created profile update test user {user.email}") if not err else logger.exception(err)
        err = await create_password_reset_request(
            database,
            PasswordResetRequestCreate(
                email=user.email,
                message="This is a test message",
            ),
        )
        logger.info(f"Created password reset request for {user.email}") if not err else logger.exception(err)

    ##################################################
    # GLOBAL NOTIFICATIONS
    ##################################################
    for i in range(1, 21):
        notification = GlobalNotificationCreate(
            sender=USERS["admin"].email,
            receiver_role=Role.user.value,
            title=f"Test notification {i}",
            body=f"""
                This is test notification {i}.\n
                As you can observe the body is getting bigger as I write this unnecessarily long sentence but it should
                come out nicely in the frontend nevertheless.
                """,
            label=f"Test label {i}",
            link="https://www.google.com",
        )

        err = await create_global_notification(database, notification)
        logger.info(f"Created global notification {notification.title}") if not err else logger.exception(err)

        # fabricate time to make tests easier
        await database.execute(
            f"""
            UPDATE global_notifications
            SET created_at = created_at - interval '{i} hour',
                updated_at = updated_at - interval '{i} hour'
            WHERE id = {i}
            """
        )


if __name__ == "__main__":
    asyncio.run(main())
