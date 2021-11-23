from datetime import datetime, timedelta
from typing import List, Mapping, Optional, Set, Union, cast

from databases import Database
from loguru import logger
from pydantic import EmailStr
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.db.repositories.base import BaseRepository
from app.db.repositories.profiles import ProfilesRepository
from app.models.feed import GlobalNotificationFeedItem
from app.models.global_notifications import (
    GlobalNotification,
    GlobalNotificationCreate,
)
from app.models.profile import ProfileCreate
from app.models.user import Role
from app.services.authorization import ROLE_PERMISSIONS

# The OFFSET clause is going to cause your SQL query plan to read all the results
# anyway and then discard most of it until reaching the offset count.
# When paging through additional results, it’s less and less efficient
# with each additional page you fetch that way.
# We navigate around this pitfall by using the LIMIT and WHERE clauses to implement pagination.


def _fetch_notifications_query(date_condition: str) -> str:
    return f"""
SELECT
  *,
  ROW_NUMBER() OVER (ORDER BY event_timestamp DESC) AS row_number
FROM ((
    -- Rows where the notification has been updated at some point.
    SELECT
      *,
      updated_at AS event_timestamp,
      -- define a new column ``event_type`` and set its value
      'is_update' AS event_type
    FROM
      global_notifications
    WHERE
      updated_at {date_condition}
      AND receiver_role = ANY(:roles)
      AND updated_at != created_at
    ORDER BY
      updated_at DESC
    LIMIT :page_chunk_size)
UNION (
  -- All rows.
  SELECT
    *,
    created_at AS event_timestamp,
    -- define a new column ``event_type`` and set its value
    'is_create' AS event_type
  FROM
    global_notifications
  WHERE
    created_at {date_condition}
    AND receiver_role = ANY(:roles)
  ORDER BY
    created_at DESC
  LIMIT :page_chunk_size)) AS notifications_feed
ORDER BY
  event_timestamp DESC
LIMIT :page_chunk_size;
"""


CREATE_NOTIFICATION_QUERY = """
INSERT INTO global_notifications (sender, receiver_role, title, body, label, link)
VALUES (:sender, :receiver_role, :title, :body, :label, :link)
RETURNING *;
"""

DELETE_NOTIFICATION_QUERY = """
DELETE FROM global_notifications
WHERE id = :id
RETURNING *;
"""

# check where any :roles in a array of
# in the form ['admin', 'user'] is present
CHECK_NEW_NOTIFICATIONS_QUERY = """
SELECT
  EXISTS(
    SELECT
      1
    FROM
      global_notifications
    WHERE
      updated_at > :last_notification_at
      AND receiver_role = ANY(:roles)
  ) AS has_new_notifications;
"""

###############################################################


class GlobalNotificationsRepoException(Exception):  # do NOT use BaseException
    def __init__(self, msg="", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
        self.msg = msg


class InvalidGlobalNotificationError(GlobalNotificationsRepoException):
    def __init__(self, msg="Invalid notification format.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class InvalidParametersError(GlobalNotificationsRepoException):
    def __init__(self, msg="", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


###############################################################


class GlobalNotificationsRepository(BaseRepository):
    page_chunk_size = 10

    def __init__(self, db: Database) -> None:
        super().__init__(db)
        # self.users_repo = UsersRepository(db) # circular dep can be avoided so far

    async def create_notification(self, *, notification: GlobalNotificationCreate) -> GlobalNotificationFeedItem:
        new_notification = await self.db.fetch_one(
            CREATE_NOTIFICATION_QUERY,
            values=notification.dict(exclude_unset=True),
        )
        if not new_notification:
            raise InvalidGlobalNotificationError
        return GlobalNotificationFeedItem(**new_notification)

    async def delete_notification_by_id(self, *, id: int) -> Optional[GlobalNotificationFeedItem]:
        async with self.db.transaction():
            deleted_notification = await self.db.fetch_one(
                DELETE_NOTIFICATION_QUERY,
                values={"id": id},
            )
            if not deleted_notification:
                return None
            if deleted_notification["id"] != id:
                raise GlobalNotificationsRepoException(f"Could not delete notification with id {id}")
            return GlobalNotificationFeedItem(**deleted_notification)

    async def has_new_notifications(self, *, last_notification_at: datetime, role: Role) -> bool:
        return await self.db.fetch_val(
            CHECK_NEW_NOTIFICATIONS_QUERY,
            values={
                "last_notification_at": last_notification_at,
                "roles": ROLE_PERMISSIONS[role],
            },
        )

    async def fetch_notification_feed(
        self,
        *,
        last_notification_at: datetime = None,
        page_chunk_size: int = None,
        starting_date: datetime = None,
        role: Role = Role.user,
        by_last_read: bool = False,
    ) -> List[GlobalNotificationFeedItem]:
        """
        Fetch the notification feed for a given role.
        """
        if by_last_read and last_notification_at is not None:
            date_condition = "> :last_notification_at"
            notifications = [
                GlobalNotificationFeedItem(**notification)
                for notification in await self.db.fetch_all(
                    _fetch_notifications_query(date_condition),
                    values={
                        "last_notification_at": last_notification_at.replace(tzinfo=None),
                        "page_chunk_size": 99999,
                        "roles": ROLE_PERMISSIONS[role],
                    },
                )
            ]
            return notifications
        elif not by_last_read and starting_date is not None:
            date_condition = "< :starting_date"
            notifications = [
                GlobalNotificationFeedItem(**notification)
                for notification in await self.db.fetch_all(
                    _fetch_notifications_query(date_condition),
                    values={
                        "starting_date": starting_date.replace(tzinfo=None),
                        "page_chunk_size": page_chunk_size or self.page_chunk_size,
                        "roles": ROLE_PERMISSIONS[role],
                    },
                )
            ]
            logger.critical(f"{notifications=}")
            return notifications
        else:
            raise InvalidParametersError("Either last_notification_at or starting_date must be provided")
