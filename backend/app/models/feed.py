import datetime
from typing import Literal, Optional

from app.models.core import CoreModel
from app.models.global_notifications import GlobalNotification


class FeedItem(CoreModel):
    """
    Generic item for a feed.
    """

    row_number: Optional[int]  # order for each item within a single page
    event_timestamp: Optional[datetime.datetime]


class GlobalNotificationFeedItem(GlobalNotification, FeedItem):
    # slightly more lightweight approach than using an Enum
    event_type: Optional[Literal["is_update", "is_create"]]
