from datetime import datetime
from typing import List, Mapping, Optional, Set, Union, cast

import loguru
from databases import Database
from pydantic import EmailStr
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.db.repositories.base import BaseRepository
from app.db.repositories.profiles import ProfilesRepository
from app.models.profile import ProfileCreate
from app.models.user_notifications import UserNotification, UserNotificationCreate

CREATE_NOTIFICATION_QUERY = """
INSERT INTO user_notifications (sender, receiver_role, title, body, label, link)
VALUES (:sender, :receiver_role, :title, :body, :label, :link)
RETURNING *;
"""

DELETE_NOTIFICATION_QUERY = """
DELETE FROM user_notifications
WHERE id = :id
RETURNING *;
"""

# The OFFSET clause is going to cause your SQL query plan to read all the results
# anyway and then discard most of it until reaching the offset count.
# When paging through additional results, it’s less and less efficient
# with each additional page you fetch that way.
# We navigate around this pitfall by using the LIMIT and WHERE clauses to implement pagination.
FETCH_NOTIFICATION_FEED_QUERY = """
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
    -- Rows where the cleaning job has been updated at some point.
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
      user_notifications
    WHERE
      updated_at < :last_notification_at
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
    user_notifications
  WHERE
    created_at < :last_notification_at
  ORDER BY
    created_at DESC
  LIMIT :page_chunk_size)) AS notifications_feed
ORDER BY
  event_timestamp DESC
LIMIT :page_chunk_size;
"""

# check with EXISTS if there are new notifications from :last_notification_at
CHECK_NEW_NOTIFICATIONS_QUERY = """
SELECT
  EXISTS(
    SELECT
      1
    FROM
      user_notifications
    WHERE
      updated_at > :last_notification_at
  ) AS has_new_notifications;
"""


###############################################################


class UserNotificationsRepoException(Exception):  # do NOT use BaseException
    def __init__(self, msg="", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
        self.msg = msg


class InvalidUserNotificationError(UserNotificationsRepoException):
    def __init__(self, msg="A request to reset your password already exists.", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


# class RequestDoesNotExistError(UserNotificationsRepoException):
#     def __init__(self, msg="The given password reset request does not exist.", *args, **kwargs):
#         super().__init__(msg, *args, **kwargs)


###############################################################


class UserNotificationsRepository(BaseRepository):
    page_chunk_size = 10

    def __init__(self, db: Database) -> None:
        super().__init__(db)
        # self.users_repo = UsersRepository(db) # circular dep can be avoided so far

    async def create_notification(self, *, notification: UserNotificationCreate) -> UserNotification:
        new_notification = await self.db.fetch_one(
            CREATE_NOTIFICATION_QUERY,
            values=notification.dict(exclude_unset=True),
        )
        if not new_notification:
            raise UserNotificationsRepoException
        return UserNotification(**new_notification)

    async def delete_notification_by_id(self, *, id: int) -> Optional[UserNotification]:
        pass

    async def check_for_new_notifications(self, *, last_notification_at: datetime) -> bool:
        pass

    async def fetch_notification_feed(
        self, *, last_notification_at: datetime, page_chunk_size: int = page_chunk_size
    ) -> List[UserNotification]:
        pass
