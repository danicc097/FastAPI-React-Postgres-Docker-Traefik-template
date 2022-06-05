from datetime import datetime

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette import status

from app.core.errors import BaseAppException
from app.db.gen.queries import personal_notifications
from app.db.gen.queries.personal_notifications import (
    CreatePersonalNotificationParams,
)
from app.db.gen.queries.users import GetUserRow
from app.services.base import BaseService


class PersonalNotificationsError(BaseAppException):
    def __init__(self, msg, *, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(msg, status_code=status_code)


class PersonalNotificationsService(BaseService):
    page_chunk_size = 10

    def __init__(self, conn: AsyncConnection) -> None:
        super().__init__(conn)
        logger.warning(f"PersonalNotificationsService connection: {id(conn)}")
        self.gn_querier = personal_notifications.AsyncQuerier(conn)

    async def create_personal_notification(self, *, notification: CreatePersonalNotificationParams):
        new_personal_notification = await self.gn_querier.create_personal_notification(arg=notification)
        if not new_personal_notification:
            raise PersonalNotificationsError("Failed to create notification", status_code=status.HTTP_400_BAD_REQUEST)
        return new_personal_notification

    async def delete_notification_by_id(self, *, user: GetUserRow, id: int):
        notification = await self.get_notification_by_id(id=id)
        if not notification:
            raise PersonalNotificationsError("Notification not found", status_code=status.HTTP_404_NOT_FOUND)
        if notification.sender != user.email:
            raise PersonalNotificationsError(
                "You are not allowed to delete this notification", status_code=status.HTTP_403_FORBIDDEN
            )
        await self.gn_querier.delete_personal_notification(personal_notification_id=id)

    async def get_notification_by_id(self, *, id: int):
        return await self.gn_querier.get_personal_notification_by_id(personal_notification_id=id)

    async def has_new_personal_notifications(self, *, last_personal_notification_at: datetime, user: GetUserRow):
        has_new_personal_notifications = await self.gn_querier.check_has_new_personal_notifications(
            receiver_email=user.email
        )
        if has_new_personal_notifications is None:
            raise PersonalNotificationsError("Failed to check for new notifications")
        return has_new_personal_notifications
