from fastapi import APIRouter, Body, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.database import get_async_conn
from app.api.routes.utils.errors import exception_handler
from app.db.gen.queries.models import Profile
from app.db.gen.queries.profiles import UpdateProfileParams
from app.db.gen.queries.users import GetUserRow
from app.models.profile import ProfileUpdate
from app.services.profiles import ProfilesService

router = APIRouter()


@router.get(
    "/{username}/",
    response_model=Profile,
    name="profiles:get-profile-by-username",
)
async def get_profile_by_username(
    username: str = Path(..., min_length=3, regex="^[a-zA-Z0-9_-]+$"),
    conn: AsyncConnection = Depends(get_async_conn),
):
    profiles_service = ProfilesService(conn)
    async with exception_handler(conn):
        profile = await profiles_service.get_profile_by_username(username=username)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No profile found with that username.",
            )
        return profile


@router.put(
    "/me/",
    response_model=Profile,
    name="profiles:update-own-profile",
)
async def update_own_profile(
    profile_update: ProfileUpdate = Body(..., embed=True),
    current_user: GetUserRow = Depends(get_current_active_user),
    conn: AsyncConnection = Depends(get_async_conn),
):
    profiles_service = ProfilesService(conn)
    async with exception_handler(conn):
        updated_profile = await profiles_service.update_profile(
            profile_update=UpdateProfileParams(**profile_update.dict(), user_id=current_user.user_id)
        )
        if not updated_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No profile found for user")
        return updated_profile
