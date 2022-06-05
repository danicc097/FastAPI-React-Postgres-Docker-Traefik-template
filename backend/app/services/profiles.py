from fastapi import status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.core.errors import BaseAppException
from app.db.gen.queries import profiles
from app.db.gen.queries.profiles import (
    CreateProfileParams,
    UpdateProfileParams,
)
from app.services.base import BaseService


class ProfilesError(BaseAppException):
    def __init__(self, msg, *, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(msg, status_code=status_code)


class ProfilesService(BaseService):
    def __init__(self, conn: AsyncConnection) -> None:
        super().__init__(conn)
        self.profiles_querier = profiles.AsyncQuerier(conn)

    async def create_profile_for_user(self, *, profile_create: CreateProfileParams):
        return await self.profiles_querier.create_profile(arg=profile_create)

    async def get_profile_by_user_id(self, *, user_id: int):
        return await self.profiles_querier.get_profile_by_id(user_id=user_id)

    async def get_profile_by_username(self, *, username: str):
        return await self.get_profile_by_username(username=username)

    async def update_profile(self, *, profile_update: UpdateProfileParams):
        return await self.profiles_querier.update_profile(arg=profile_update)
