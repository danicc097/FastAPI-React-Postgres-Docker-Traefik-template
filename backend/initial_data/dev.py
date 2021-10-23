import asyncio
import pathlib
import sys
from typing import Dict

from loguru import logger

from app.models.pwd_reset_req import PasswordResetRequestCreate
from app.models.user import UserCreate
from initial_data.utils import (
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
    err = await create_user(
        database,
        USERS["admin"],
        admin=True,
        verified=True,
    )
    logger.info(f'Created superuser {USERS["admin"].email}') if not err else logger.exception(err)

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

    err = await create_password_reset_request(
        database,
        PasswordResetRequestCreate(
            email="testuser1@mail.com",
            message="This is a test message",
        ),
    )
    logger.info("Created password reset request for testuser1@mail.com") if not err else logger.exception(err)


if __name__ == "__main__":
    asyncio.run(main())
