from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette import status

from app.core.errors import BaseAppException
from app.db.gen.queries import global_notifications
from app.db.gen.queries.global_notifications import (
    CheckHasNewGlobalNotificationsParams,
    CreateGlobalNotificationParams,
)
from app.db.gen.queries.models import Role
from app.services.authorization import ROLE_PERMISSIONS
from app.services.base import BaseService


class GlobalNotificationsError(BaseAppException):
    def __init__(self, msg, *, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(msg, status_code=status_code)


class GlobalNotificationsService(BaseService):
    page_chunk_size = 10

    def __init__(self, conn: AsyncConnection) -> None:
        super().__init__(conn)
        logger.warning(f"GlobalNotificationsService connection: {id(conn)}")
        self.gn_querier = global_notifications.AsyncQuerier(conn)

    async def create_global_notification(self, *, notification: CreateGlobalNotificationParams):
        new_global_notification = await self.gn_querier.create_global_notification(arg=notification)
        if not new_global_notification:
            raise GlobalNotificationsError("Failed to create notification", status_code=status.HTTP_400_BAD_REQUEST)
        return new_global_notification

    async def delete_notification_by_id(self, *, id: int):
        await self.gn_querier.delete_global_notification(global_notification_id=id)

    async def has_new_global_notifications(self, *, user_id: int, role: Role):
        has_new_global_notifications = await self.gn_querier.check_has_new_global_notifications(
            arg=CheckHasNewGlobalNotificationsParams(
                roles=ROLE_PERMISSIONS[role],
                user_id=user_id,
            )
        )
        if has_new_global_notifications is None:
            raise GlobalNotificationsError("Failed to check for new notifications")
        return has_new_global_notifications
