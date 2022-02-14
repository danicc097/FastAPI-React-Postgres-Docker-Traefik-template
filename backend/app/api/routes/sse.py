import asyncio
import base64
import json
from datetime import datetime
from pprint import pprint
from typing import cast

from fastapi import Body, Depends, HTTPException, Path, Query, Request
from fastapi.routing import APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from sse_starlette import EventSourceResponse
from starlette.responses import Response
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

from app.api.dependencies.auth import (
    get_current_active_user,
    get_user_from_token,
)
from app.api.dependencies.database import get_repository
from app.api.routes.utils.errors import exception_handler
from app.db.repositories.global_notifications import (
    GlobalNotificationsRepository,
)
from app.db.repositories.users import UsersRepository
from app.models.user import UserPublic

router = APIRouter()


# https://amittallapragada.github.io/docker/fastapi/python/2020/12/23/server-side-events.html
# https://medium.com/tokopedia-engineering/implementing-server-sent-events-in-reactjs-c36661d89468
MESSAGE_STREAM_DELAY = 15
MESSAGE_STREAM_RETRY_TIMEOUT = 15000  # milisecond

# TODO check test files: https://github.com/sysid/sse-starlette/tree/master/tests
# need to stop all tasks when shutting down the app
@router.get(
    "/global-notifications-stream",
    name="sse:global-notifications-stream",
    response_class=EventSourceResponse,
)
async def global_notifications_stream(
    req: Request,
    token: str = Query("", description="token"),
    max_messages: int = Query(0, description="Max number of messages to return"),
    global_notif_repo: GlobalNotificationsRepository = Depends(get_repository(GlobalNotificationsRepository)),
    user_repo: UsersRepository = Depends(get_repository(UsersRepository)),
):
    async def event_publisher():
        i = 0
        try:
            while True and (not max_messages or i < max_messages):
                user = await get_user_from_token(token=token, user_repo=user_repo)
                if not user:
                    raise HTTPException(
                        status_code=HTTP_401_UNAUTHORIZED,
                        detail="Invalid token",
                    )
                logger.debug(f"user: {user}")
                # user = await users_repo.get_user_by_id(user_id=current_user.id, to_public=True)
                disconnected = await req.is_disconnected()
                if not user or disconnected:
                    logger.info(f"Disconnecting client {req.client}.")
                    break
                has_new_notifications = await global_notif_repo.has_new_notifications(
                    last_notification_at=user.last_notification_at, role=user.role
                )
                logger.info(f"{i} - {has_new_notifications}")
                yield json.dumps(
                    dict(
                        id=f"{user.email}-{datetime.utcnow().isoformat()}",
                        has_new_notifications=f"{'true' if has_new_notifications else 'false'}",
                    )
                )
                i += 1
                await asyncio.sleep(MESSAGE_STREAM_DELAY)  # seconds
            logger.info(f"Disconnected from client {req.client}")
        except asyncio.CancelledError as e:
            logger.info(f"Disconnected from client (via refresh/close) {req.client}")
            # Do any other cleanup, if any
            raise e from e
        except Exception as e:
            logger.info(f"{req.client} - Exception: {e}")
            raise e from e

    async with exception_handler():
        return EventSourceResponse(event_publisher(), media_type="text/event-stream")
