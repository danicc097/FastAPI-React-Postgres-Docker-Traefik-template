from typing import cast

from fastapi import Depends, HTTPException, Path, status
from loguru import logger

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.database import get_repository
from app.db.repositories.users import UsersRepository
from app.models.user import UserInDB, UserPublic


async def get_user_by_username_from_path(
    username: str = Path(..., min_length=3, regex="^[a-zA-Z0-9_-]+$"),
    current_user: UserPublic = Depends(get_current_active_user),
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> UserPublic:
    user = await users_repo.get_user_by_username(username=username, to_public=False)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with that username.",
        )
    user = cast(UserPublic, user)
    return user
