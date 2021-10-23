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
from app.db.repositories.profiles import ProfilesRepository
from app.models.profile import ProfileCreate
from app.models.pwd_reset_req import PasswordResetRequest

CREATE_PASSWORD_RESET_REQUEST = """
    INSERT INTO pwd_reset_req (email, message)
    VALUES (:email, :message)
    RETURNING id, email, message, created_at, updated_at;
"""

DELETE_PASSWORD_RESET_REQUEST = """
    DELETE FROM pwd_reset_req
    WHERE id = :id
    RETURNING id, email, message, created_at, updated_at;
"""

LIST_ALL_PASSWORD_REQUEST_USERS_QUERY = """
    SELECT id, email, message, created_at, updated_at
    FROM pwd_reset_req
"""

###############################################################


class UserPwdReqRepoException(Exception):  # do NOT use BaseException
    def __init__(self, msg="", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
        self.msg = msg


class UserAlreadyRequestedError(UserPwdReqRepoException):
    def __init__(self, msg="A request to reset your password already exists.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class RequestDoesNotExistError(UserPwdReqRepoException):
    def __init__(self, msg="The given password reset request does not exist.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


###############################################################


class UserPwdReqRepository(BaseRepository):
    def __init__(self, db: Database) -> None:
        super().__init__(db)
        self.profiles_repo = ProfilesRepository(db)
        # self.users_repo = UsersRepository(db) # circular dep can be avoided so far

    async def create_password_reset_request(self, *, email: EmailStr, message: str) -> Optional[PasswordResetRequest]:
        try:
            password_reset_request = await self.db.fetch_one(
                query=CREATE_PASSWORD_RESET_REQUEST,
                values={
                    "email": email,
                    "message": message,
                },
            )
        # non existent email is to be handled in route before requesting
        except Exception as e:
            raise UserAlreadyRequestedError

        if not password_reset_request:
            return None
        return PasswordResetRequest(**password_reset_request)

    async def list_all_password_request_users(self) -> List[PasswordResetRequest]:
        user_records = await self.db.fetch_all(query=LIST_ALL_PASSWORD_REQUEST_USERS_QUERY)
        return [PasswordResetRequest(**user) for user in user_records]

    async def delete_password_reset_request(self, *, id: int) -> None:
        # run in transaction to rollback if somehow the wrong id is deleted
        async with self.db.transaction():
            deleted_request = await self.db.fetch_one(
                query=DELETE_PASSWORD_RESET_REQUEST,
                values={
                    "id": id,
                },
            )
            if not deleted_request:
                raise RequestDoesNotExistError
            assert PasswordResetRequest(**deleted_request).id == id
