from typing import List, Optional, Union, cast

from fastapi import Depends, Path
from fastapi.exceptions import HTTPException
from fastapi.param_functions import Body
from fastapi.routing import APIRouter
from loguru import logger
from pydantic.networks import EmailStr
from starlette import status

from app.api.dependencies.auth import RoleVerifier
from app.api.dependencies.database import get_repository
from app.api.routes.utils.errors import exception_handler
from app.db.repositories.global_notifications import (
    GlobalNotificationsRepository,
)
from app.db.repositories.password_reset_requests import (
    RequestDoesNotExistError,
    PwdResetReqRepository,
)
from app.db.repositories.users import (
    InvalidUpdateError,
    UserNotFoundError,
    UsersRepository,
)
from app.models.global_notifications import (
    GlobalNotification,
    GlobalNotificationCreate,
)
from app.models.password_reset_requests import (
    PasswordResetRequest,
    PasswordResetRequestCreate,
)
from app.models.user import (
    Role,
    RoleUpdate,
    UserCreate,
    UserInDB,
    UserPublic,
    UserUpdate,
)

router = APIRouter()


@router.get(
    "/users/",
    response_model=List[UserPublic],
    name="admin:list-users",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def list_all_users(
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> List[Optional[Union[UserPublic, UserInDB]]]:
    """
    List all users in the database.
    """
    async with exception_handler():
        return await user_repo.list_all_users(to_public=True)


@router.get(
    "/users-unverified/",
    response_model=List[UserPublic],
    name="admin:list-unverified-users",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def list_unverified_users(
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> List[Optional[Union[UserPublic, UserInDB]]]:
    """
    List all unverified users.
    """
    async with exception_handler():
        return await user_repo.list_all_non_verified_users(to_public=True)


@router.post(
    "/users-unverified/",
    response_model=List[UserPublic],
    name="admin:verify-users-by-email",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def verify_user_by_email(
    user_emails: List[str] = Body(..., embed=True),  # consumer requires sending a data/payload/...: {user_emails: ...}
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> Optional[List[UserPublic]]:
    """
    Verify registered users via an array of emails.
    """
    async with exception_handler():
        logger.info(f"Verifying users: {user_emails}")
        return await users_repo.verify_users(user_emails=user_emails)


@router.get(
    "/reset-user-password/",
    response_model=List[PasswordResetRequest],
    name="admin:list-password-request-users",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def list_password_request_users(
    user_pwd_req_repo: PwdResetReqRepository = Depends(get_repository(PwdResetReqRepository)),
) -> Optional[List[PasswordResetRequest]]:
    """
    Return a list of users that have requested a password reset.
    """
    async with exception_handler():
        return await user_pwd_req_repo.list_all_password_request_users()


@router.post(
    "/reset-user-password/",
    response_model=str,
    name="admin:reset-user-password-by-email",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def reset_user_password_by_email(
    email: EmailStr = Body(..., embed=True),  # consumer requires sending a data/payload/...: {email: ...}
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> str:
    """
    Reset password for any user by email.
    """
    async with exception_handler():
        logger.info(f"Resetting password for user: {email}")
        async with users_repo.db.transaction():
            new_password = await users_repo.reset_user_password(email=email)

            # do not return empty string or None.
            if not new_password:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Could not reset password for user with email: {email}",
                )

            return new_password


@router.delete(
    "/delete-password-reset-request/{id}/",
    response_model=List[PasswordResetRequest],
    name="admin:delete-password-reset-request",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def delete_password_reset_request(
    id: int = Path(..., ge=1),
    user_pwd_req_repo: PwdResetReqRepository = Depends(get_repository(PwdResetReqRepository)),
):
    """
    Delete a password reset request with id: ``id``.
    """
    async with exception_handler():
        await user_pwd_req_repo.delete_password_reset_request(id=id)


@router.post(
    "/create-notification/",
    name="admin:create-notification",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def create_notification(
    notification: GlobalNotificationCreate = Body(..., embed=True),
    global_notif_repo: GlobalNotificationsRepository = Depends(get_repository(GlobalNotificationsRepository)),
) -> Optional[GlobalNotification]:
    """
    Create a new notification for selected user roles to receive.
    """
    async with exception_handler():
        return await global_notif_repo.create_notification(notification=notification)


@router.delete(
    "/delete-notification/{id}/",
    name="admin:delete-notification",
    response_model=GlobalNotification,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def delete_notification(
    id: int = Path(..., ge=1),
    global_notif_repo: GlobalNotificationsRepository = Depends(get_repository(GlobalNotificationsRepository)),
):
    """
    Delete a notification with id: ``id``.
    """
    async with exception_handler():
        return await global_notif_repo.delete_notification_by_id(id=id)


@router.put(
    "/update-user-role/",
    response_model=UserPublic,
    name="admin:update-user-role",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.admin))],
)
async def change_user_role(
    role_update: RoleUpdate = Body(..., embed=True),
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> Optional[UserPublic]:
    """
    Change role of user
    """
    async with exception_handler():
        return await users_repo.update_user_role(role_update=role_update)
