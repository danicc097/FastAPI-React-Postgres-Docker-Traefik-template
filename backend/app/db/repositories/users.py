import secrets
import string
from datetime import datetime
from typing import List, Mapping, Optional, Set, Union, cast

import loguru
from databases import Database
from pydantic import EmailStr
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.db.repositories.base import BaseRepository
from app.db.repositories.global_notifications import (
    GlobalNotificationsRepository,
)
from app.db.repositories.profiles import ProfilesRepository
from app.db.repositories.pwd_reset_req import UserPwdReqRepository
from app.models.global_notifications import GlobalNotification
from app.models.profile import ProfileCreate
from app.models.user import (
    RoleUpdate,
    UserCreate,
    UserInDB,
    UserPublic,
    UserUpdate,
)
from app.services import auth_service

GET_USER_BY_EMAIL_QUERY = """
    SELECT *
    FROM users
    WHERE email = :email;
"""

GET_USER_BY_USERNAME_QUERY = """
    SELECT *
    FROM users
    WHERE username = :username;
"""

REGISTER_NEW_USER_QUERY = """
    INSERT INTO users (username, email, password, salt)
    VALUES (:username, :email, :password, :salt)
    RETURNING *;
"""

REGISTER_ADMIN_QUERY = """
    INSERT INTO users (username, email, password, salt, is_superuser, is_verified)
    VALUES (:username, :email, :password, :salt, TRUE, TRUE)
    RETURNING *;
"""

REGISTER_VERIFIED_USER_QUERY = """
    INSERT INTO users (username, email, password, salt, is_verified)
    VALUES (:username, :email, :password, :salt, TRUE)
    RETURNING *;
"""

GET_USER_BY_ID_QUERY = """
    SELECT *
    FROM users
    WHERE id = :id;
"""

UPDATE_USER_BY_ID_QUERY = """
    UPDATE users
    SET password     = :password,
        salt         = :salt,
        username     = :username,
        email        = :email
    WHERE id = :id
    RETURNING *;
"""

LIST_ALL_USERS_QUERY = """
    SELECT *
    FROM users;
"""

LIST_ALL_NON_VERIFIED_USERS_QUERY = """
    SELECT *
    FROM users
    WHERE is_verified = 'false';
"""

VERIFY_USER_BY_EMAIL_QUERY = """
    UPDATE users
    SET is_verified        = 'true'
    WHERE email = :email
    RETURNING *;
"""

RESET_USER_PASSWORD_QUERY = """
    UPDATE users
    SET password     = :password,
        salt         = :salt
    WHERE email = :email
    RETURNING *;
"""

UPDATE_LAST_NOTIFICATION_AT_QUERY = """
    UPDATE users
    SET last_notification_at = :last_notification_at
    WHERE id = :id
    RETURNING *;
"""

UPDATE_USER_ROLE_QUERY = """
    UPDATE users
    SET role = :role
    WHERE id = :id
    RETURNING *;
"""


###############################################################################


class UsersRepoException(Exception):  # do NOT use BaseException
    def __init__(self, msg="", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
        self.msg = msg


class EmailAlreadyExistsError(UsersRepoException):
    def __init__(self, msg="Email already exists.", email="", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
        self.email = email


class UsernameAlreadyExistsError(UsersRepoException):
    def __init__(self, msg="Username already exists.", username="", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class UserCreationError(UsersRepoException):
    def __init__(self, msg="Could not create user.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class UserNotFoundError(UsersRepoException):
    def __init__(self, msg="Could not find user.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class IncorrectPasswordError(UsersRepoException):
    def __init__(self, msg="Incorrect password.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class InvalidUpdateError(UsersRepoException):
    def __init__(self, msg="Invalid update.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


###############################################################################


class UsersRepository(BaseRepository):
    def __init__(self, db: Database) -> None:
        super().__init__(db)
        self.auth_service = auth_service
        # make sure that when a new user is created, our UsersRepository
        # will also create_profile_for_user below
        self.profiles_repo = ProfilesRepository(db)
        self.user_pwd_req_repo = UserPwdReqRepository(db)
        self.global_notif_repo = GlobalNotificationsRepository(db)

    # ? Exceptions are to be raised outside
    async def get_user_by_email(
        self, *, email: EmailStr, to_public: bool = True
    ) -> Optional[Union[UserPublic, UserInDB]]:
        user_record = await self.db.fetch_one(query=GET_USER_BY_EMAIL_QUERY, values={"email": email})
        if not user_record:
            return None
        user = UserInDB(**user_record)
        # when we don't need the user's profile or actually want to access
        # the user's password and salt - like in our authenticate_user method -
        # we can set to_public=False and only get the UserInDB model back.
        if to_public:
            return await self.populate_user(user=user)
        return user

    # ? Exceptions are to be raised outside
    async def get_user_by_username(
        self, *, username: str, to_public: bool = True
    ) -> Optional[Union[UserPublic, UserInDB]]:
        user_record = await self.db.fetch_one(query=GET_USER_BY_USERNAME_QUERY, values={"username": username})
        if not user_record:
            return None
        user = UserInDB(**user_record)
        if to_public:
            return await self.populate_user(user=user)
        return user

    # ? Exceptions are to be raised outside
    async def get_user_by_id(self, *, user_id: int, to_public: bool = True) -> Optional[Union[UserPublic, UserInDB]]:
        user_record = await self.db.fetch_one(query=GET_USER_BY_ID_QUERY, values={"id": user_id})
        if not user_record:
            return None
        user = UserInDB(**user_record)
        if to_public:
            return await self.populate_user(user=user)
        return user

    async def register_new_user(
        self,
        *,
        new_user: UserCreate,
        to_public: bool = True,
        admin: bool = False,
        verified: bool = False,
    ) -> Optional[Union[UserPublic, UserInDB]]:
        if await self.get_user_by_email(email=new_user.email):
            raise EmailAlreadyExistsError(f"User with email {new_user.email} already exists.")

        if await self.get_user_by_username(username=new_user.username):
            raise UsernameAlreadyExistsError(f"User with username {new_user.username} already exists.")

        # do not pass actual password to models
        user_password_update = self.auth_service.create_salt_and_hashed_password(plaintext_password=new_user.password)
        new_user_params = new_user.copy(update=user_password_update.dict())

        if admin:
            query = REGISTER_ADMIN_QUERY
            loguru.logger.warning("Created new admin user.")
        elif verified:
            query = REGISTER_VERIFIED_USER_QUERY
            loguru.logger.warning("Created new verified user.")
        else:
            query = REGISTER_NEW_USER_QUERY

        created_user = await self.db.fetch_one(query=query, values=new_user_params.dict())
        if not created_user:
            return None
        # ProfilesRepository is a sub-repo of the UsersRepository, so we can insert any
        # profile-related logic directly into our user-related logic.
        # Create profile for new user (UserPublic.profile model)
        await self.profiles_repo.create_profile_for_user(profile_create=ProfileCreate(user_id=created_user["id"]))
        if to_public:
            return await self.populate_user(user=UserInDB(**created_user))
        return UserInDB(**created_user)

    # something smells here, wont refactor
    async def update_user(self, *, user_id: int, user_update: UserUpdate) -> Optional[UserPublic]:
        user = await self.get_user_by_id(user_id=user_id, to_public=False)
        if not user:
            raise UserNotFoundError
        user = cast(UserInDB, user)

        update = user_update.dict(exclude_unset=True)
        user_to_update = user.copy(update=update)

        if len(update) == 1 and ("password" in update or "old_password" in update):
            raise IncorrectPasswordError("Both current and new passwords are required to update.")

        if user_update.password and user_update.old_password:
            # check previous password is correct
            if not auth_service.verify_password(
                password=user_update.old_password,
                salt=user.salt,
                hashed_pw=user.password,
            ):
                raise IncorrectPasswordError

            user_password_update = self.auth_service.create_salt_and_hashed_password(
                plaintext_password=user_update.password
            ).dict()

            # manually pass id else we get None as a response (WHERE id = :id will not match anything)
            user_to_update = user_to_update.copy(
                update={**user_password_update, "id": user_id}, exclude={"old_password"}
            )

        if user_update.email:
            if await self.get_user_by_email(email=user_update.email):
                raise EmailAlreadyExistsError(f"User with email {user_update.email} already exists.")

        if user_update.username:
            if await self.get_user_by_username(username=user_update.username):
                raise UsernameAlreadyExistsError(f"User with username {user_update.username} already exists.")

        updated_user = await self.db.fetch_one(
            query=UPDATE_USER_BY_ID_QUERY,
            values=user_to_update.dict(
                include={"id", "password", "salt", "email", "username"}
            ),  # rest of fields are skipped
        )
        if updated_user is None:
            raise InvalidUpdateError("Could not update user.")

        return UserPublic(**updated_user)

    async def verify_users(self, *, user_emails: List[str]) -> List[UserPublic]:
        query = VERIFY_USER_BY_EMAIL_QUERY
        updated_users = [await self.db.fetch_one(query=query, values={"email": email}) for email in user_emails]
        if len(updated_users) != len(user_emails):
            raise InvalidUpdateError("Could not verify all users.")

        return [UserPublic(**user) for user in updated_users if user is not None]

    async def authenticate_user(self, *, email: EmailStr, password: str) -> Optional[UserInDB]:
        # make user user exists in db
        user = await self.get_user_by_email(email=email, to_public=False)
        if not user:
            return None
        user = cast(UserInDB, user)

        # if submitted password doesn't match
        if not self.auth_service.verify_password(password=password, salt=user.salt, hashed_pw=user.password):
            return None
        return user

    async def populate_user(self, *, user: UserInDB) -> UserPublic:
        """
        Unpacks a UserInDB into the UserPublic model,
        which will remove "password" and "salt".
        It also fetches the user's profile from the profiles repo and attaches it to the user.
        """
        return UserPublic(
            **user.dict(),
            profile=await self.profiles_repo.get_profile_by_user_id(user_id=user.id),
        )

    async def list_all_users(self, *, to_public: bool = True) -> List[Optional[Union[UserPublic, UserInDB]]]:
        user_records = await self.db.fetch_all(query=LIST_ALL_USERS_QUERY)
        if to_public:
            return [await self.populate_user(user=UserInDB(**user)) for user in user_records]
        return [UserInDB(**user) for user in user_records]

    async def list_all_non_verified_users(
        self, *, to_public: bool = True
    ) -> List[Optional[Union[UserPublic, UserInDB]]]:
        user_records = await self.db.fetch_all(query=LIST_ALL_NON_VERIFIED_USERS_QUERY)
        if to_public:
            return [await self.populate_user(user=UserInDB(**user)) for user in user_records]
        return [UserInDB(**user) for user in user_records]

    async def reset_user_password(self, *, email: EmailStr, id: int = None) -> str:
        user = await self.get_user_by_email(email=email, to_public=False)
        if not user:
            raise UserNotFoundError
        user = cast(UserInDB, user)

        alphabet = string.ascii_letters + string.digits
        new_password = "".join(secrets.choice(alphabet) for _ in range(20))
        user_password_update = self.auth_service.create_salt_and_hashed_password(plaintext_password=new_password)
        new_user_params = user.copy(update=user_password_update.dict())

        updated_user = await self.db.fetch_one(
            query=RESET_USER_PASSWORD_QUERY,
            values={
                "email": new_user_params.email,
                "salt": new_user_params.salt,
                "password": new_user_params.password,
            },
        )
        if not updated_user:
            raise InvalidUpdateError(f"Could not update user password for {user.email}.")

        # ! won't be used like this
        # remove the request from its own table if (it was a request)
        # it might be useful to let us reset a password without a existing request
        if id:
            try:
                await self.user_pwd_req_repo.delete_password_reset_request(id=id)
            except AssertionError as e:
                raise e
            # no need to handle any other error
            except Exception as e:
                pass
        return new_password

    async def fetch_has_new_notifications(self, *, user_id: int) -> None:
        user = await self.get_user_by_id(user_id=user_id, to_public=False)
        if not user:
            raise UserNotFoundError
        async with self.db.transaction():

            await self.global_notif_repo.has_new_notifications(last_notification_at=user.last_notification_at)

    async def fetch_notifications(
        self, *, user_id: int, last_notification_at: datetime, now: datetime
    ) -> List[GlobalNotification]:
        async with self.db.transaction():
            notifications = await self.global_notif_repo.fetch_notification_feed_by_last_read(
                last_notification_at=last_notification_at
            )
            await self.db.execute(
                query=UPDATE_LAST_NOTIFICATION_AT_QUERY,
                values={"id": user_id, "last_notification_at": now},
            )
            return notifications

    async def update_user_role(self, *, role_update: RoleUpdate) -> None:
        user = await self.get_user_by_email(email=role_update.email, to_public=False)
        if not user:
            raise UserNotFoundError
        async with self.db.transaction():
            await self.db.execute(
                query=UPDATE_USER_ROLE_QUERY,
                values={"id": user.id, "role": role_update.role},
            )
