from typing import Optional
from databases.core import Database
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
from app.core.config import is_prod
from app.core.errors import BaseAppException
from app.db.repositories.users import UsersRepository
from app.models.user import RoleUpdate, UserPublic

from app.services.base import BaseService


class UsersException(BaseAppException):
    def __init__(self, msg, status_code=HTTP_500_INTERNAL_SERVER_ERROR, *args, **kwargs):
        super().__init__(msg, status_code=status_code, *args, **kwargs)


class UsersService(BaseService):
    def __init__(self, db: Database) -> None:
        super().__init__(db)
        self.users_repo = UsersRepository(db)

    async def update_user_role(self, role_update: RoleUpdate):
        user = await self.users_repo.get_user_by_email(email=role_update.email, to_public=False)
        if not user:
            raise UsersException(f"User with email {role_update.email} not found", status_code=HTTP_404_NOT_FOUND)
        if user.is_superuser and is_prod():
            raise UsersException("Cannot update role for a superuser", status_code=HTTP_400_BAD_REQUEST)
        await self.users_repo.update_user_role(id=user.id, role=role_update.role)
