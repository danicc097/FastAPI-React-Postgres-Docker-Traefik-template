from typing import Optional, cast

from fastapi import Depends, HTTPException, params, status
from fastapi.security import OAuth2PasswordBearer
from starlette.requests import Request
from app.api.dependencies.database import get_repository
from app.core.config import API_PREFIX, UNIQUE_KEY
from app.db.repositories.users import UsersRepository
from app.models.user import Role, UserInDB, UserPublic
from app.services import auth_service
from app.services.authorization import ROLE_PERMISSIONS

# This class simply informs FastAPI that the URL provided is the
# one used to get a token. That information is used in OpenAPI
# and in FastAPI's interactive docs.
# For us that path is located at /api/users/login/token/, and is our login route.
# ? By injecting the oauth2_scheme as a dependency, FastAPI will inspect the request
# ? for an Authorization header, check if the value is Bearer plus some token,
# ? and return the token as a str. Else, it returns a HTTP_401_UNAUTHORIZED
# Background on JWT: https://softwareengineering.stackexchange.com/a/338356

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{API_PREFIX}/users/login/token/")


async def get_user_from_token(
    *,
    token: str = Depends(oauth2_scheme),
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> Optional[UserPublic]:
    try:
        username = auth_service.get_username_from_token(token=token, secret_key=str(UNIQUE_KEY))
        if not username:
            return None
        user = await user_repo.get_user_by_username(username=username)
        if not user:
            return None
    except Exception as e:
        raise e
    user = cast(UserPublic, user)
    return user


def get_current_active_user(
    current_user: UserPublic = Depends(get_user_from_token),
) -> Optional[UserPublic]:
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
    current_user: UserPublic = Depends(get_current_active_user),
):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current user is not verified. An administrator will approve your account soon.",
        )


class RoleVerifier:
    def __init__(self, required_role):
        self.required_role = required_role

    def __call__(self, request: Request, current_user: UserPublic = Depends(get_user_from_token)) -> None:
        if self.required_role not in ROLE_PERMISSIONS[current_user.role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have the necessary access level for this resource.",
            )
