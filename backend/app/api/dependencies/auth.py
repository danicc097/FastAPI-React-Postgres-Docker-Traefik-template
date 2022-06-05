from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette.requests import Request

from app.api.dependencies.database import get_new_async_conn
from app.core.config import API_PREFIX, DOMAIN, ROOT_PATH, UNIQUE_KEY
from app.db.gen.queries import models
from app.db.gen.queries.users import GetUserRow
from app.services import auth_service
from app.services.authorization import ROLE_PERMISSIONS
from app.services.users import UsersService

token_url = ""
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{DOMAIN}{ROOT_PATH}{API_PREFIX}/users/login/token/", scheme_name="token"
)


async def get_user_from_token(
    request: Request,
    *,
    token: str = Depends(oauth2_scheme),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    try:
        username = auth_service.get_username_from_token(token=str(token), secret_key=str(UNIQUE_KEY))
        if not username:
            return None
        user = await users_service.get_user_by_username(username=username)
        if not user:
            return None
    except Exception as e:
        logger.info(f"Could not get user from token: {e}")
        raise e from e
    return user


async def get_current_active_user(
    request: Request,
    current_user: GetUserRow = Depends(get_user_from_token),
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not an authenticated user.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not an active user.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return current_user


async def email_is_verified(
    request: Request,
    current_user: GetUserRow = Depends(get_current_active_user),
):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current user is not verified. An administrator will approve your account soon.",
        )


class RoleVerifier:
    def __init__(self, required_role: models.Role):
        self.required_role = required_role

    def __call__(self, request: Request, current_user: GetUserRow = Depends(get_user_from_token)) -> None:
        if self.required_role not in ROLE_PERMISSIONS[current_user.role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have the necessary access level for this resource.",
            )
