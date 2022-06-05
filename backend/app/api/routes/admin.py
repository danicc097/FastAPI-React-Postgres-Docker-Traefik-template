from fastapi import Depends, Path, Response
from fastapi.exceptions import HTTPException
from fastapi.param_functions import Body
from fastapi.routing import APIRouter
from loguru import logger
from pydantic.networks import EmailStr
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette import status

from app.api.dependencies.auth import RoleVerifier
from app.api.dependencies.database import get_new_async_conn
from app.api.routes.utils.errors import exception_handler
from app.db.gen.queries import models
from app.db.gen.queries.global_notifications import (
    CreateGlobalNotificationParams,
)
from app.db.gen.queries.models import PasswordResetRequest, Role
from app.models.user import RoleUpdate
from app.services.global_notifications import GlobalNotificationsService
from app.services.password_reset_requests import PwdResetReqService
from app.services.users import UsersService

router = APIRouter()


@router.get(
    "/users/",
    response_model=list[models.User],
    name="admin:list-users",
    status_code=status.HTTP_200_OK,
)
async def list_all_users(
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        return await users_service.list_all_users()


@router.get(
    "/users-unverified/",
    response_model=list[models.User],
    name="admin:list-unverified-users",
    status_code=status.HTTP_200_OK,
)
async def list_unverified_users(
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        return await users_service.list_all_users(is_verified=False)


@router.post(
    "/users-unverified/",
    name="admin:verify-users-by-email",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def verify_user_by_email(
    user_emails: list[str] = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        await users_service.verify_users(user_emails=user_emails)
        return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/reset-user-password/",
    response_model=list[PasswordResetRequest],
    name="admin:list-password-request-users",
    status_code=status.HTTP_200_OK,
)
async def list_password_request_users(
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    prr_service = PwdResetReqService(conn)
    async with exception_handler(conn):
        return await prr_service.list_all_password_request_users()


@router.post(
    "/reset-user-password/",
    response_model=str,
    name="admin:reset-user-password-by-email",
    status_code=status.HTTP_200_OK,
)
async def reset_user_password_by_email(
    email: EmailStr = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
) -> str:
    users_service = UsersService(conn)
    async with exception_handler(conn):
        logger.info(f"Resetting password for user: {email}")
        new_password = await users_service.reset_user_password(email=email)

        if not new_password:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not reset password for user with email: {email}",
            )

        return new_password


@router.delete(
    "/delete-password-reset-request/{id}/",
    name="admin:delete-password-reset-request",
    status_code=status.HTTP_200_OK,
)
async def delete_password_reset_request(
    id: int = Path(..., ge=1),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    prr_service = PwdResetReqService(conn)
    async with exception_handler(conn):
        await prr_service.delete_password_reset_request(id=id)


@router.post(
    "/create-global-notification/",
    name="admin:create-global-notification",
    status_code=status.HTTP_201_CREATED,
)
async def create_global_notification(
    notification: CreateGlobalNotificationParams = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    gn_service = GlobalNotificationsService(conn)
    async with exception_handler(conn):
        return await gn_service.create_global_notification(notification=notification)


@router.delete(
    "/delete-global-notification/{id}/",
    name="admin:delete-global-notification",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_global_notification(
    id: int = Path(..., ge=1),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    gn_service = GlobalNotificationsService(conn)
    async with exception_handler(conn):
        await gn_service.delete_notification_by_id(id=id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put(
    "/update-user-role/",
    name="admin:update-user-role",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(RoleVerifier(Role.ADMIN))],
)
async def update_user_role(
    role_update: RoleUpdate = Body(..., embed=True),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    users_service = UsersService(conn)
    async with exception_handler(conn):
        await users_service.update_user_role(role_update=role_update)
