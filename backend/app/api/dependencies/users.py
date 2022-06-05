from typing import cast

from fastapi import Depends, HTTPException, Path, Request, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.database import get_async_conn
from app.models.user import UserPublic


async def get_user_by_username_from_path(
    request: Request,
    username: str = Path(..., min_length=3, regex="^[a-zA-Z0-9_-]+$"),
    current_user: UserPublic = Depends(get_current_active_user),
    conn: AsyncConnection = Depends(get_async_conn),
) -> UserPublic:
    raise NotImplementedError
    users_service = UsersService(conn)
    user = await users_repo.get_user_by_username(username=username, get_db_data=True)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with that username.",
        )
    user = cast(UserPublic, user)
    return user
