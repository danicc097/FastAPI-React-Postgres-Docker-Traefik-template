from app.db.gen.queries.global_notifications import (
    GetGlobalNotificationsByStartingDateRow,
)
from app.db.gen.queries.personal_notifications import (
    GetPersonalNotificationsByStartingDateRow,
)


class GlobalNotificationFeedItem(GetGlobalNotificationsByStartingDateRow):
    pass


class PersonalNotificationFeedItem(GetPersonalNotificationsByStartingDateRow):
    pass
