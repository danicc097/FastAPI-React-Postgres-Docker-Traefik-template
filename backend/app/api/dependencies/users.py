from typing import cast

from fastapi import Depends, HTTPException, Path, status
from loguru import logger

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.database import get_repository
from app.db.repositories.users import UsersRepository
from app.models.user import UserInDB


async def get_user_by_username_from_path(
    username: str = Path(..., min_length=3, regex="^[a-zA-Z0-9_-]+$"),
    current_user: UserInDB = Depends(get_current_active_user),
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> UserInDB:
    user = await users_repo.get_user_by_username(username=username, to_public=False)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with that username.",
        )
    user = cast(UserInDB, user)
    return user


async def verify_user_is_admin(
    current_user: UserInDB = Depends(get_current_active_user),
):
    if not current_user.is_superuser:
        logger.warning(f"{current_user.email} attempted access to admin resources")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current user is not an admin.",
        )


async def verify_email_is_verified(
    current_user: UserInDB = Depends(get_current_active_user),
):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current user is not verified. An administrator will approve your account soon.",
        )
