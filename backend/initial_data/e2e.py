import asyncio
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


if __name__ == "__main__":
    asyncio.run(main())
