from typing import List, Mapping, Optional, Set, Union, cast

import loguru
from databases import Database
from pydantic import EmailStr
from starlette.status import HTTP_404_NOT_FOUND, HTTP_409_CONFLICT

from app.db.repositories.base import BaseRepoException, BaseRepository
from app.db.repositories.profiles import ProfilesRepository
from app.models.password_reset_requests import (
    PasswordResetRequest,
    PasswordResetRequestCreate,
)
from app.models.profile import ProfileCreate

CREATE_PASSWORD_RESET_REQUEST_QUERY = """
    INSERT INTO pwd_reset_req (email, message)
    VALUES (:email, :message)
    RETURNING *;
"""

DELETE_PASSWORD_RESET_REQUEST_QUERY = """
    DELETE FROM pwd_reset_req
    WHERE id = :id
    RETURNING *;
"""

LIST_ALL_PASSWORD_REQUEST_USERS_QUERY = """
    SELECT *
    FROM pwd_reset_req
"""

###############################################################


class UserAlreadyRequestedError(BaseRepoException):
    def __init__(
        self, msg="A request to reset your password already exists.", status_code=HTTP_409_CONFLICT, *args, **kwargs
    ):
        super().__init__(msg, status_code=status_code, *args, **kwargs)


class RequestDoesNotExistError(BaseRepoException):
    def __init__(
        self, msg="The given password reset request does not exist.", status_code=HTTP_404_NOT_FOUND, *args, **kwargs
    ):
        super().__init__(msg, status_code=status_code, *args, **kwargs)


###############################################################


class PwdResetReqRepository(BaseRepository):
    def __init__(self, db: Database) -> None:
        super().__init__(db)
        self.profiles_repo = ProfilesRepository(db)
        # self.users_repo = UsersRepository(db) # circular dep can be avoided so far

    async def create_password_reset_request(
        self, *, reset_request: PasswordResetRequestCreate
    ) -> Optional[PasswordResetRequest]:
        try:
            prr = await self.db.fetch_one(
                query=CREATE_PASSWORD_RESET_REQUEST_QUERY,
                values={
                    "email": reset_request.email,
                    "message": reset_request.message,
                },
            )
        # non existent email is to be handled in route before requesting
        except Exception as e:
            raise UserAlreadyRequestedError

        if not prr:
            return None
        return PasswordResetRequest(**prr)

    async def list_all_password_request_users(self) -> List[PasswordResetRequest]:
        user_records = await self.db.fetch_all(query=LIST_ALL_PASSWORD_REQUEST_USERS_QUERY)
        return [PasswordResetRequest(**user) for user in user_records]

    async def delete_password_reset_request(self, *, id: int) -> None:
        # run in transaction to rollback if somehow the wrong id is deleted
        async with self.db.transaction():
            deleted_request = await self.db.fetch_one(
                query=DELETE_PASSWORD_RESET_REQUEST_QUERY,
                values={
                    "id": id,
                },
            )
            if not deleted_request:
                raise RequestDoesNotExistError
            assert PasswordResetRequest(**deleted_request).id == id
