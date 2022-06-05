import pathlib
from datetime import datetime, timedelta

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Path,
    Query,
    Response,
)
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette import status
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

import initial_data
from app.api.dependencies.auth import (
    email_is_verified,
    get_current_active_user,
)
from app.api.dependencies.database import get_new_async_conn
from app.api.routes.utils.errors import exception_handler
from app.core.config import ADMIN_EMAIL
from app.db.gen.queries.global_notifications import (
    GetGlobalNotificationsByStartingDateParams,
)
from app.db.gen.queries.models import PasswordResetRequest
from app.db.gen.queries.password_reset_requests import (
    CreatePasswordResetRequestParams,
)
from app.db.gen.queries.personal_notifications import (
    CreatePersonalNotificationParams,
    GetPersonalNotificationsByStartingDateParams,
)
from app.db.gen.queries.users import GetUserRow
from app.models.global_notifications import (
    GlobalNotificationFeedItem,
    PersonalNotificationFeedItem,
)
from app.models.token import AccessToken
from app.models.user import UserCreate, UserPublic, UserUpdate
from app.services import auth_service
from app.services.authorization import ROLE_PERMISSIONS
from app.services.global_notifications import GlobalNotificationsService
from app.services.password_reset_requests import PwdResetReqService
from app.services.personal_notifications import PersonalNotificationsService
from app.services.users import UsersService

router = APIRouter()


@router.post(
    "/",
    response_model=UserPublic,
    name="users:register-new-user",
    status_code=HTTP_201_CREATED,
    # dependencies=[Depends(RoleVerifier(Role.admin))]
)
async def register_new_user(
    new_user: UserCreate = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    pn_service = PersonalNotificationsService(conn)
    async with exception_handler(conn):
        created_user = await users_service.register_new_user(new_user=new_user)
        if not created_user:
            raise HTTPException(
                status_code=HTTP_409_CONFLICT,
                detail="User could not be created.",
            )

        access_token = auth_service.create_access_token_for_user(user=created_user)
        if not access_token:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Could not create access token for user.",
            )
        access_token = AccessToken(
            access_token=access_token,
            token_type="bearer",
        )
        await pn_service.create_personal_notification(
            notification=CreatePersonalNotificationParams(
                sender=ADMIN_EMAIL.lower(),
                receiver_email=created_user.email,
                title="Welcome to MYAPP",
                body="Here you can check out all news and updates from MYAPP. \nVisit the help page for more information.",
                label="news",
                link="/help",
            )
        )
        with open(pathlib.Path(initial_data.__file__).parent / "verified_emails.txt", "r") as f:
            verified_emails = [i.split("@")[0].lower() for i in f.read().splitlines()]
            if created_user.email.split("@")[0] in verified_emails:
                await users_service.verify_users(user_emails=[created_user.email])

        return jsonable_encoder(
            UserPublic(
                **created_user.dict(),
                access_token=access_token,
            )
        )


@router.get(
    "/me/",
    response_model=UserPublic,
    name="users:get-current-user",
    dependencies=[Depends(email_is_verified)],
)
async def get_currently_authenticated_user(
    current_user: GetUserRow = Depends(get_current_active_user),
) -> UserPublic:
    async with exception_handler():
        logger.info(f"User logged in: {current_user.email}")
        return jsonable_encoder(current_user)


@router.put(
    "/me/",
    response_model=UserPublic,
    name="users:update-user-by-id",
    status_code=HTTP_200_OK,
    dependencies=[Depends(email_is_verified)],
)
async def update_user_by_id(
    current_user: GetUserRow = Depends(get_current_active_user),
    user_update: UserUpdate = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        return await users_service.update_user(user_id=current_user.user_id, user_update=user_update)


@router.post(
    "/login/token/",
    # response_model=AccessToken,
    name="users:login-email-and-password",
)
async def user_login_with_email_and_password(
    form_data: OAuth2PasswordRequestForm = Depends(OAuth2PasswordRequestForm),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        user = await users_service.authenticate_user(email=form_data.username, password=form_data.password)  # type: ignore
        if not user:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="User could not be authenticated.",
            )
        access_token = auth_service.create_access_token_for_user(user=user)
        if not access_token:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Could not create access token for user.",
            )
        return AccessToken(
            access_token=access_token,
            token_type="bearer",
        )


@router.post(
    "/request-password-reset/",
    name="users:request-password-reset",
    status_code=HTTP_200_OK,
    response_model=PasswordResetRequest,
)
async def request_password_reset(
    reset_request: CreatePasswordResetRequestParams = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    password_reset_requests_service = PwdResetReqService(conn)
    async with exception_handler(conn):
        user = await users_service.get_user_by_email(email=reset_request.email, get_db_data=True)
        if not user:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND,
                detail=f"User with email {reset_request.email} not found",
            )
        return await password_reset_requests_service.create_password_reset_request(reset_request=reset_request)


@router.get(
    "/global-notifications/",
    response_model=list[GlobalNotificationFeedItem],
    name="users:get-global-notifications",
)
async def get_notification_feed_for_user_by_date(
    page_chunk_size: int = Query(
        GlobalNotificationsService.page_chunk_size,
        ge=1,
        le=50,
        description="Number of notifications to retrieve",
    ),
    starting_date: datetime = Query(
        datetime.utcnow() + timedelta(minutes=1),
        description="Used to determine the timestamp at which to begin querying for notification feed items.",
    ),
    user: GetUserRow = Depends(get_current_active_user),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        return jsonable_encoder(
            await users_service.fetch_global_notifications_by_date(
                params=GetGlobalNotificationsByStartingDateParams(
                    roles=ROLE_PERMISSIONS[user.role],
                    starting_date=starting_date.replace(tzinfo=None),
                    page_chunk_size=page_chunk_size,
                ),
                user_id=user.user_id,
            )
        )


@router.get(
    "/personal-notifications/",
    response_model=list[PersonalNotificationFeedItem],
    name="users:get-personal-notifications",
)
async def get_personal_notification_feed_for_user_by_date(
    page_chunk_size: int = Query(
        PersonalNotificationsService.page_chunk_size,
        ge=1,
        le=50,
        description="Number of notifications to retrieve",
    ),
    starting_date: datetime = Query(
        datetime.utcnow() + timedelta(minutes=1),
        description="Used to determine the timestamp at which to begin querying for notification feed items.",
    ),
    user: GetUserRow = Depends(get_current_active_user),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        return jsonable_encoder(
            await users_service.fetch_personal_notifications_by_date(
                params=GetPersonalNotificationsByStartingDateParams(
                    receiver_email=user.email,
                    starting_date=starting_date.replace(tzinfo=None),
                    page_chunk_size=page_chunk_size,
                ),
                user_id=user.user_id,
            )
        )


@router.post(
    "/create-personal-notification/",
    name="users:create-personal-notification",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(email_is_verified)],
)
async def create_personal_notification(
    notification: CreatePersonalNotificationParams = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
    user: GetUserRow = Depends(get_current_active_user),
):
    if user.email != notification.sender:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="You cannot send a notification as a different user.",
        )
    pn_service = PersonalNotificationsService(conn)
    async with exception_handler(conn):
        return await pn_service.create_personal_notification(notification=notification)


@router.delete(
    "/delete-personal-notification/{id}/",
    name="users:delete-personal-notification",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(email_is_verified)],
)
async def delete_personal_notification(
    id: int = Path(..., ge=1),
    conn: AsyncConnection = Depends(get_new_async_conn),
    current_user: GetUserRow = Depends(get_current_active_user),
):
    pn_service = PersonalNotificationsService(conn)
    async with exception_handler(conn):
        await pn_service.delete_notification_by_id(user=current_user, id=id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
