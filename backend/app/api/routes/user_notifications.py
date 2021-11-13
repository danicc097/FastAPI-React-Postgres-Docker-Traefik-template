import datetime
from typing import List

from fastapi import APIRouter, Depends, Query

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.database import get_repository
from app.db.repositories.user_notifications import UserNotificationsRepository
from app.models.user_notifications import UserNotification

router = APIRouter()


@router.get(
    "/notifications/",
    response_model=List[UserNotification],
    name="user-notifications:get-feed",
    dependencies=[Depends(get_current_active_user)],
)
async def get_notification_feed_for_user(
    # add some validation and metadata with Query
    page_chunk_size: int = Query(
        UserNotificationsRepository.page_chunk_size,
        ge=1,
        le=50,
        description="Number of notifications to retrieve",
    ),
    starting_date: datetime.datetime = Query(
        datetime.datetime.now() + datetime.timedelta(minutes=10),
        description="Used to determine the timestamp at which to begin querying for notification feed items.",
    ),
    user_notif_repo: UserNotificationsRepository = Depends(get_repository(UserNotificationsRepository)),
) -> List[UserNotification]:
    return await user_notif_repo.fetch_notification_feed(
        starting_date=starting_date,
        page_chunk_size=page_chunk_size,
    )
