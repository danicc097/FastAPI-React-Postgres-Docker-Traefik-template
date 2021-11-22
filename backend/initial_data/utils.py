import asyncio
import logging
import os
import pathlib
import sys
from time import sleep
from typing import Optional

from databases import Database
from loguru import logger

from app.core.config import DATABASE_URL, is_testing
from app.db.repositories.global_notifications import (
    GlobalNotificationsRepository,
)
from app.db.repositories.pwd_reset_req import UserPwdReqRepository
from app.db.repositories.users import UsersRepository
from app.models.global_notifications import GlobalNotificationCreate
from app.models.pwd_reset_req import PasswordResetRequestCreate
from app.models.user import Role, RoleUpdate, UserCreate


async def init_database():
    pytest_worker = os.environ.get("PYTEST_XDIST_WORKER") or "0"
    DB_URL = f"{DATABASE_URL}_test_{pytest_worker}" if is_testing() else DATABASE_URL

    database = Database(DB_URL, min_size=2, max_size=10)
    connected = False
    while not connected:
        try:
            await database.connect()
            connected = True
        except Exception as e:
            logger.warning("--- DB CONNECTION ERROR ---")
            logger.warning(e)
            logger.warning("--- END DB CONNECTION ERROR ---")
            sleep(5)
    return database


async def create_user(database: Database, new_user: UserCreate, admin=False, verified=False) -> Optional[str]:
    user_repo = UsersRepository(database)
    try:
        created_user = await user_repo.register_new_user(new_user=new_user, admin=admin, verified=verified)
        if not created_user:
            return f"Failed to create user {new_user.email}"
        assert created_user.email == new_user.email
        assert created_user.username == new_user.username
        return None
    except Exception as e:
        return f"REGISTRATION ERROR FOR {new_user.email}: \n{e}"


async def create_password_reset_request(database: Database, request: PasswordResetRequestCreate) -> Optional[str]:
    user_pwd_reset_req_repo = UserPwdReqRepository(database)
    try:
        created_request = await user_pwd_reset_req_repo.create_password_reset_request(
            email=request.email, message=request.message
        )
        if not created_request:
            return f"Failed to create password reset request for {request.email}"
        assert created_request.email == request.email
        assert created_request.message == request.message
        return None
    except Exception as e:
        return f"PASSWORD RESET REQUEST ERROR FOR {request.email}: \n{e}"


async def change_user_role(database: Database, role_update: RoleUpdate) -> Optional[str]:
    user_repo = UsersRepository(database)
    try:
        await user_repo.update_user_role(role_update=role_update)
    except Exception as e:
        return f"UPDATING USER ROLE ERROR FOR {role_update.email}: \n{e}"
    return None


async def create_global_notification(database: Database, notification: GlobalNotificationCreate) -> Optional[str]:
    global_notifications_repo = GlobalNotificationsRepository(database)
    try:
        await global_notifications_repo.create_notification(notification=notification)
    except Exception as e:
        return f"COULD NOT CREATE GLOBAL NOTIFICATION: \n{e}"
    return None
