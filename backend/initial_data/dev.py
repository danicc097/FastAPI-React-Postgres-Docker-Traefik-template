import asyncio
import pathlib
import sys
from typing import Dict

from loguru import logger

from app.models.global_notifications import GlobalNotificationCreate
from app.models.pwd_reset_req import PasswordResetRequestCreate
from app.models.user import Roles, RoleUpdate, UserCreate
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
}


async def main():
    database = await init_database()

    ##################################################
    # USERS
    ##################################################

    err = await create_user(
        database,
        USERS["admin"],
        admin=True,
        verified=True,
    )
    logger.info(f'Created superuser {USERS["admin"].email}') if not err else logger.exception(err)
    err = await change_user_role(database, RoleUpdate(email=USERS["admin"].email, role=Roles.admin))
    logger.info(f'Changed role for {USERS["admin"].email}') if not err else logger.exception(err)

    err = await create_user(
        database,
        USERS["manager"],
        admin=False,
        verified=True,
    )
    logger.info(f'Created superuser {USERS["manager"].email}') if not err else logger.exception(err)
    err = await change_user_role(database, RoleUpdate(email=USERS["manager"].email, role=Roles.manager))
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

    for i in range(20):
        err = await create_user(
            database,
            UserCreate(
                username=f"testuser{i}",
                email=f"testuser{i}@mail.com",
                password="12341234",
            ),
            admin=False,
            verified=True,
        )
        logger.info(f"Created testuser{i}") if not err else logger.exception(err)

    ##################################################
    # PASSWORD RESET REQUESTS
    ##################################################

    err = await create_password_reset_request(
        database,
        PasswordResetRequestCreate(
            email="testuser1@mail.com",
            message="This is a test message",
        ),
    )
    logger.info("Created password reset request for testuser1@mail.com") if not err else logger.exception(err)

    ##################################################
    # GLOBAL NOTIFICATIONS
    ##################################################
    for i in range(20):
        notification = GlobalNotificationCreate(
            sender=USERS["admin"].email,
            receiver_role=Roles.user.value,
            title=f"Test notification {i}",
            body=f"""
                This is test notification {i}.\n
                As you can observe the title is getting longer as I write but it should
                come out nicely in the frontend.
                """,
            label=f"Test label {i}",
            link="https://www.google.com",
        )

        err = await create_global_notification(database, notification)
        logger.info(f"Created global notification {notification.title}") if not err else logger.exception(err)


if __name__ == "__main__":
    asyncio.run(main())
