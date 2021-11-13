from typing import List, Optional, Union, cast

from fastapi import Depends, Path
from fastapi.exceptions import HTTPException
from fastapi.param_functions import Body
from fastapi.routing import APIRouter
from loguru import logger
from pydantic.networks import EmailStr
from starlette import status

from app.api.dependencies.database import get_repository
from app.api.dependencies.users import verify_user_is_admin
from app.api.routes.utils.errors import exception_handler
from app.db.repositories.pwd_reset_req import (
    RequestDoesNotExistError,
    UserPwdReqRepository,
)
from app.db.repositories.user_notifications import UserNotificationsRepository
from app.db.repositories.users import (
    InvalidUpdateError,
    UserNotFoundError,
    UsersRepository,
)
from app.models.user_notifications import UserNotification, UserNotificationCreate
from app.models.pwd_reset_req import (
    PasswordResetRequest,
    PasswordResetRequestCreate,
)
from app.models.user import RoleUpdate, UserCreate, UserInDB, UserPublic, UserUpdate

router = APIRouter()


@router.get(
    "/users/",
    response_model=List[UserPublic],
    name="admin:list-users",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_user_is_admin)],
)
async def list_all_users(
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> List[Optional[Union[UserPublic, UserInDB]]]:
    """
    List all users in the database.
    """
    return await user_repo.list_all_users(to_public=True)


@router.get(
    "/users-unverified/",
    response_model=List[UserPublic],
    name="admin:list-unverified-users",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_user_is_admin)],
)
async def list_unverified_users(
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> List[Optional[Union[UserPublic, UserInDB]]]:
    """
    List all unverified users.
    """
    return await user_repo.list_all_non_verified_users(to_public=True)


@router.post(
    "/users-unverified/",
    response_model=List[UserPublic],
    name="admin:verify-users-by-email",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_user_is_admin)],
)
async def verify_user_by_email(
    user_emails: List[str] = Body(..., embed=True),  # consumer requires sending a data/payload/...: {user_emails: ...}
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> List[UserPublic]:
    """
    Verify registered users via an array of emails.
    """
    logger.info(f"Verifying users: {user_emails}")
    try:
        return await users_repo.verify_users(user_emails=user_emails)
    except Exception as e:
        exception_handler(e)


@router.get(
    "/reset-user-password/",
    response_model=List[PasswordResetRequest],
    name="admin:list-password-request-users",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_user_is_admin)],
)
async def list_password_request_users(
    user_pwd_req_repo: UserPwdReqRepository = Depends(get_repository(UserPwdReqRepository)),
) -> List[PasswordResetRequest]:
    """
    Return a list of users that have requested a password reset.
    """
    try:
        return await user_pwd_req_repo.list_all_password_request_users()
    except Exception as e:
        exception_handler(e)


@router.post(
    "/reset-user-password/",
    response_model=str,
    name="admin:reset-user-password-by-email",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_user_is_admin)],
)
async def reset_user_password_by_email(
    email: EmailStr = Body(..., embed=True),  # consumer requires sending a data/payload/...: {email: ...}
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> str:
    """
    Reset password for any user by email.
    """
    logger.info(f"Resetting password for user: {email}")
    try:
        new_password = await users_repo.reset_user_password(email=email)
    except Exception as e:
        exception_handler(e)

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
    dependencies=[Depends(verify_user_is_admin)],
)
async def delete_password_reset_request(
    id: int = Path(..., ge=1),
    user_pwd_req_repo: UserPwdReqRepository = Depends(get_repository(UserPwdReqRepository)),
):
    """
    Delete a password reset request with id: ``id``.
    """
    try:
        await user_pwd_req_repo.delete_password_reset_request(id=id)
    except RequestDoesNotExistError as e:
        exception_handler(e)


@router.post(
    "/create-notification/",
    name="admin:create-notification",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_user_is_admin)],
)
async def create_notification(
    notification: UserNotificationCreate = Body(..., embed=True),
    user_notif_repo: UserNotificationsRepository = Depends(get_repository(UserNotificationsRepository)),
) -> UserNotification:
    """
    Create a new notification for selected user roles to receive.
    """
    try:
        new_notification = await user_notif_repo.create_notification(notification=notification)
    except Exception as e:
        exception_handler(e)
    return new_notification


@router.post(
    "/change-user-role/",
    response_model=UserPublic,
    name="admin:change-user-role",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_user_is_admin)],
)
async def change_user_role(
    role_update: RoleUpdate = Body(..., embed=True),
    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),
) -> Optional[UserPublic]:
    """
    Change role of user
    """
    try:
        user = await users_repo.update_user_role(role_update=role_update)
    except Exception as e:
        exception_handler(e)
    return user
