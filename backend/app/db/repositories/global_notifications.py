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
from app.models.user import Roles

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

# The OFFSET clause is going to cause your SQL query plan to read all the results
# anyway and then discard most of it until reaching the offset count.
# When paging through additional results, it’s less and less efficient
# with each additional page you fetch that way.
# We navigate around this pitfall by using the LIMIT and WHERE clauses to implement pagination.


def get_notifications_query(date_condition: str = "> :last_notification_at") -> str:
    return f"""
    SELECT
    id,
    sender,
    receiver_role,
    title,
    body,
    label,
    link,
    created_at,
    updated_at,
    event_type,
    event_timestamp,
    ROW_NUMBER() OVER (ORDER BY event_timestamp DESC) AS row_number
    FROM ((
        -- Rows where the notification has been updated at some point.
        SELECT
        id,
        sender,
        receiver_role,
        title,
        body,
        label,
        link,
        created_at,
        updated_at,
        updated_at AS event_timestamp,
        -- define a new column ``event_type`` and set its value
        'is_update' AS event_type
        FROM
        global_notifications
        WHERE
        updated_at {date_condition}
        AND receiver_role = :role
        AND updated_at != created_at
        ORDER BY
        updated_at DESC
        LIMIT :page_chunk_size)
    UNION (
    -- All rows.
    SELECT
        id,
        sender,
        receiver_role,
        title,
        body,
        label,
        link,
        created_at,
        updated_at,
        created_at AS event_timestamp,
        -- define a new column ``event_type`` and set its value
        'is_create' AS event_type
    FROM
        global_notifications
    WHERE
        created_at {date_condition}
        AND receiver_role = :role
    ORDER BY
        created_at DESC
    LIMIT :page_chunk_size)) AS notifications_feed
    ORDER BY
    event_timestamp DESC
    LIMIT :page_chunk_size;
    """


CHECK_NEW_NOTIFICATIONS_QUERY = """
SELECT
  EXISTS(
    SELECT
      1
    FROM
      global_notifications
    WHERE
      updated_at > :last_notification_at
      AND receiver_role = :role
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


# class RequestDoesNotExistError(GlobalNotificationsRepoException):
#     def __init__(self, msg="The given password reset request does not exist.", *args, **kwargs):
#         super().__init__(msg, *args, **kwargs)


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
        pass

    async def has_new_notifications(self, *, last_notification_at: datetime, role: Roles) -> bool:
        return await self.db.fetch_val(
            CHECK_NEW_NOTIFICATIONS_QUERY,
            values={
                "last_notification_at": last_notification_at,
                "role": role,
            },
        )

    async def fetch_notification_feed(
        self,
        *,
        last_notification_at: datetime = None,
        starting_date: datetime = None,
        role: Roles = Roles.user,
        by_last_read: bool = False,
    ) -> List[GlobalNotificationFeedItem]:
        """
        Fetch the notification feed for a given role.
        """
        logger.critical(f"Role is {role.value}")
        if by_last_read:
            date_condition = "> :last_notification_at"
            return [
                GlobalNotificationFeedItem(**notification)
                for notification in await self.db.fetch_all(
                    get_notifications_query(date_condition),
                    values={
                        "last_notification_at": last_notification_at,
                        "page_chunk_size": self.page_chunk_size,
                        "role": role.value,
                    },
                )
            ]
        else:
            date_condition = "< :starting_date"
            return [
                GlobalNotificationFeedItem(**notification)
                for notification in await self.db.fetch_all(
                    get_notifications_query(date_condition),
                    values={
                        "starting_date": starting_date,
                        "page_chunk_size": self.page_chunk_size,
                        "role": role.value,
                    },
                )
            ]
