import logging
from datetime import datetime, timedelta
from logging.config import dictConfig
from typing import List, Optional, cast

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.database import get_repository
from app.api.dependencies.users import (
    verify_email_is_verified,
    verify_user_is_admin,
)
from app.api.routes.utils.errors import exception_handler
from app.db.repositories.global_notifications import (
    GlobalNotificationsRepository,
)
from app.db.repositories.pwd_reset_req import (
    UserAlreadyRequestedError,
    UserPwdReqRepository,
)
from app.db.repositories.users import UsersRepository
from app.models.global_notifications import GlobalNotification
from app.models.pwd_reset_req import (
    PasswordResetRequest,
    PasswordResetRequestCreate,
)
from app.models.token import AccessToken
from app.models.user import UserCreate, UserInDB, UserPublic, UserUpdate
from app.services import auth_service

router = APIRouter()


@router.post(
    "/",
    response_model=UserPublic,
    name="users:register-new-user",
    status_code=HTTP_201_CREATED,
)
async def register_new_user(
    new_user: UserCreate = Body(..., embed=True),
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> UserPublic:
    created_user = None
    try:
        created_user = await user_repo.register_new_user(new_user=new_user, to_public=True)
    # only way to bubble up correctly
    except Exception as e:
        exception_handler(e)

    if not created_user:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="User could not be created.",
        )
    created_user = cast(UserPublic, created_user)

    access_token = AccessToken(
        access_token=auth_service.create_access_token_for_user(user=created_user),
        token_type="bearer",
    )
    # we can return the access_token because we added it as
    # an optional property in UserPublic
    return created_user.copy(update={"access_token": access_token})


# we only know the user is logged in by the token passed to our routes
# in the Authentication header.
# Instead of parsing the request ourselves and searching
# for that token, we're going to hand that responsibility over to FastAPI.
# We'll create an auth dependency that grabs the currently authenticated
# user from our database and injects that user into our route.
@router.get(
    "/me/",
    response_model=UserPublic,
    name="users:get-current-user",
    dependencies=[Depends(verify_email_is_verified)],
)
async def get_currently_authenticated_user(
    current_user: UserPublic = Depends(get_current_active_user),
) -> UserPublic:
    logger.info(f"User logged in: {current_user.email}")
    return current_user


@router.put(
    "/me/",
    response_model=UserPublic,
    name="users:update-user-by-id",
    status_code=HTTP_200_OK,
    dependencies=[Depends(verify_email_is_verified)],
)
async def update_user_by_id(
    current_user: UserPublic = Depends(get_current_active_user),
    user_update: UserUpdate = Body(..., embed=True),
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> Optional[UserPublic]:
    """
    Update the user's profile.
    """
    try:
        updated_user = await users_repo.update_user(user_id=current_user.id, user_update=user_update)
    except Exception as e:
        exception_handler(e)

    return updated_user if updated_user else None


@router.post("/login/token/", response_model=AccessToken, name="users:login-email-and-password")
async def user_login_with_email_and_password(
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
    form_data: OAuth2PasswordRequestForm = Depends(OAuth2PasswordRequestForm),
) -> AccessToken:
    # OAuth2 spec requires the exact field name "username"
    user = await user_repo.authenticate_user(email=form_data.username, password=form_data.password)  # type: ignore
    if not user:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Authentication was unsuccessful.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = AccessToken(
        access_token=auth_service.create_access_token_for_user(user=user),
        token_type="bearer",
    )

    return access_token


@router.post(
    "/request-password-reset/",
    name="users:request-password-reset",
    status_code=HTTP_200_OK,
    response_model=PasswordResetRequest,
)
async def request_password_reset(
    password_request: PasswordResetRequestCreate = Body(..., embed=True),
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
    user_pwd_req_repo: UserPwdReqRepository = Depends(get_repository(UserPwdReqRepository)),
):
    """
    Any client, including unauthorized, can request a password reset that needs admin approval.
    """
    logger.warning(password_request)
    user = await users_repo.get_user_by_email(email=password_request.email, to_public=True)
    if not user:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=f"User with email {password_request.email} not found",
        )
    try:
        pwd_reset_req = await user_pwd_req_repo.create_password_reset_request(
            email=password_request.email,
            message=password_request.message,
        )
    except Exception as e:
        exception_handler(e)
    return pwd_reset_req


@router.post(
    "/notifications/",
    response_model=List[GlobalNotification],
    name="users:get-feed",
    dependencies=[Depends(get_current_active_user)],
)
async def get_notification_feed_for_user(
    # add some validation and metadata with Query
    page_chunk_size: int = Query(
        GlobalNotificationsRepository.page_chunk_size,
        ge=1,
        le=50,
        description="Number of notifications to retrieve",
    ),
    last_notification_at: datetime = Query(
        datetime.utcnow(),
        description="Used to determine the timestamp at which to begin querying for notification feed items.",
    ),
    user: UserPublic = Depends(get_current_active_user),
    global_notif_repo: GlobalNotificationsRepository = Depends(get_repository(GlobalNotificationsRepository)),
) -> List[GlobalNotification]:
    return await global_notif_repo.fetch_notification_feed(
        last_notification_at=user.last_notification_at,
        page_chunk_size=page_chunk_size,
    )
