import secrets
import string
from datetime import datetime, timedelta
from typing import Optional

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.core.config import is_prod
from app.core.errors import BaseAppException
from app.db.gen.queries import (
    global_notifications,
    personal_notifications,
    profiles,
    users,
)
from app.db.gen.queries.models import Role
from app.models.user import RoleUpdate, UserCreate, UserUpdate
from app.services import auth_service
from app.services.base import BaseService


class UsersError(BaseAppException):
    def __init__(self, msg, *, status_code=HTTP_500_INTERNAL_SERVER_ERROR, user=""):
        super().__init__(msg, status_code=status_code, user=user)


class UsersService(BaseService):
    def __init__(self, conn: AsyncConnection) -> None:
        super().__init__(conn)
        # self.users_repo = UsersRepository(conn)
        self.users_querier = users.AsyncQuerier(conn)
        self.profiles_querier = profiles.AsyncQuerier(conn)
        self.global_notifications_querier = global_notifications.AsyncQuerier(conn)
        self.personal_notifications_querier = personal_notifications.AsyncQuerier(conn)

    async def update_user_role(self, role_update: RoleUpdate):
        user = await self.users_querier.get_user(
            arg=users.GetUserParams(
                email=role_update.email,
                get_db_data=True,
            )  # type: ignore
        )
        if not user:
            raise UsersError(f"User with email {role_update.email} not found", status_code=HTTP_404_NOT_FOUND)
        if user.is_superuser and is_prod() and role_update.role != Role.ADMIN:
            raise UsersError("Cannot downgrade admin user", status_code=HTTP_400_BAD_REQUEST)
        logger.critical(f"Updating role for user {role_update} with id {user.user_id}")
        await self.users_querier.update_user_role(
            arg=users.UpdateUserRoleParams(user_id=user.user_id, role=role_update.role)
        )

    async def get_user_by_email(self, *, email: str, get_db_data: bool = True):
        return await self.users_querier.get_user(
            arg=users.GetUserParams(
                email=email,
                get_db_data=get_db_data,
            )  # type: ignore
        )

    async def get_user_by_username(self, *, username: str, get_db_data: bool = True):
        return await self.users_querier.get_user(
            arg=users.GetUserParams(
                username=username,
                get_db_data=get_db_data,
            )  # type: ignore
        )

    async def get_user_by_id(self, *, user_id: int, get_db_data: bool = True):
        return await self.users_querier.get_user(
            arg=users.GetUserParams(
                user_id=user_id,
                get_db_data=get_db_data,
            )  # type: ignore
        )

    async def register_new_user(
        self,
        *,
        new_user: UserCreate,
        admin: bool = False,
        verified: bool = False,
    ):
        logger.critical(f"Registering new user {new_user}")
        if await self.get_user_by_email(email=new_user.email):
            raise UsersError(f"User with email {new_user.email} already exists", status_code=HTTP_409_CONFLICT)

        if await self.get_user_by_username(username=new_user.username):
            raise UsersError(f"User with username {new_user.username} already exists", status_code=HTTP_409_CONFLICT)

        user_password_update = auth_service.create_salt_and_hashed_password(plaintext_password=new_user.password)

        if admin:
            logger.critical(f"Created new admin user {new_user.email}")
        elif verified:
            logger.warning(f"Created new verified user {new_user.email}")

        new_user_params = users.RegisterNewUserParams(
            username=new_user.username,
            email=new_user.email,
            password=user_password_update.password,
            salt=user_password_update.salt,
            is_superuser=admin,
            is_verified=verified,
        )
        created_user = await self.users_querier.register_new_user(arg=new_user_params)
        if not created_user:
            return None

        await self.profiles_querier.create_profile(
            arg=profiles.CreateProfileParams(
                user_id=created_user.user_id,
                full_name=None,
                phone_number=None,
                bio=None,
                image=None,
            )
        )
        return created_user

    async def update_user(self, *, user_id: int, user_update: UserUpdate):
        user = await self.get_user_by_id(user_id=user_id, get_db_data=True)
        if not user:
            raise UsersError("User not found", status_code=HTTP_404_NOT_FOUND)

        update = user_update.dict(exclude_unset=True)
        if ("password" in update or "old_password" in update) and not (
            "password" in update and "old_password" in update
        ):
            raise UsersError("Both current and new passwords are required to update", status_code=HTTP_400_BAD_REQUEST)

        user_to_update = users.UpdateUserByIdParams(
            password=None,
            salt=None,
            username=user_update.username,
            email=user_update.email,
            user_id=user.user_id,
        )

        if user_update.password and user_update.old_password:

            if not auth_service.verify_password(
                password=user_update.old_password,
                salt=user.salt,
                hashed_pw=user.password,
            ):
                raise UsersError("Incorrect current password", user=user.email, status_code=HTTP_400_BAD_REQUEST)

            user_password_update = auth_service.create_salt_and_hashed_password(
                plaintext_password=user_update.password
            ).dict()
            user_to_update = user.copy(update=user_password_update)

        logger.critical(f"update_user: user {user_to_update} with id {user_id}")

        if user_update.email and await self.get_user_by_email(email=user_update.email):
            raise UsersError(
                f"User with email {user_update.email} already exists", user=user.email, status_code=HTTP_409_CONFLICT
            )

        if user_update.username and await self.get_user_by_username(username=user_update.username):
            raise UsersError(
                f"User with username {user_update.username} already exists",
                user=user.email,
                status_code=HTTP_409_CONFLICT,
            )

        updated_user = await self.users_querier.update_user_by_id(
            arg=users.UpdateUserByIdParams(**user_to_update.dict())
        )
        if updated_user is None:
            raise UsersError("Could not update user", user=user.email, status_code=HTTP_400_BAD_REQUEST)

        return updated_user

    async def verify_users(self, *, user_emails: list[str]):
        updated_users = [await self.users_querier.verify_user_by_email(email=email) for email in user_emails]
        if not_updated_users := [email for email in user_emails if email not in updated_users]:
            raise UsersError(f"Could not verify users {not_updated_users}", status_code=HTTP_400_BAD_REQUEST)

    async def authenticate_user(self, *, email: str, password: str):
        user = await self.get_user_by_email(email=email, get_db_data=True)
        if not user:
            return None

        if not auth_service.verify_password(password=password, salt=user.salt, hashed_pw=user.password):
            return None
        return user

    async def list_all_users(self, is_verified: Optional[bool] = None):
        return [i async for i in self.users_querier.list_all_users(is_verified=is_verified)]

    async def reset_user_password(self, *, email: str) -> str:
        user = await self.get_user_by_email(email=email, get_db_data=True)
        if not user:
            raise UsersError(f"User with email {email} not found", status_code=HTTP_404_NOT_FOUND)

        alphabet = string.ascii_letters + string.digits
        new_password = "".join(secrets.choice(alphabet) for _ in range(20))
        user_password_update = auth_service.create_salt_and_hashed_password(plaintext_password=new_password)
        new_user_params = user.copy(update=user_password_update.dict())

        await self.users_querier.reset_user_password(
            arg=users.ResetUserPasswordParams(
                email=new_user_params.email,
                salt=new_user_params.salt,
                password=new_user_params.password,
            )
        )

        return new_password

    async def fetch_global_notifications_by_date(
        self, *, params: global_notifications.GetGlobalNotificationsByStartingDateParams, user_id: int
    ):
        notifications = [
            i async for i in self.global_notifications_querier.get_global_notifications_by_starting_date(arg=params)
        ]
        now = datetime.utcnow()
        if params.starting_date + timedelta(seconds=10) > now:
            await self.users_querier.update_global_last_notification_at(
                arg=users.UpdateGlobalLastNotificationAtParams(
                    user_id=user_id,
                    last_global_notification_at=params.starting_date,
                )
            )
        return notifications

    async def fetch_personal_notifications_by_date(
        self, *, params: personal_notifications.GetPersonalNotificationsByStartingDateParams, user_id: int
    ):
        notifications = [
            i async for i in self.personal_notifications_querier.get_personal_notifications_by_starting_date(arg=params)
        ]
        now = datetime.utcnow()
        if params.starting_date + timedelta(seconds=10) > now:
            await self.users_querier.update_personal_last_notification_at(
                arg=users.UpdatePersonalLastNotificationAtParams(
                    user_id=user_id,
                    last_personal_notification_at=params.starting_date,
                )
            )
        return notifications
