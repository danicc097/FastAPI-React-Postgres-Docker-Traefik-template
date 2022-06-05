import asyncio
import json
from datetime import datetime
from typing import AsyncGenerator

from fastapi import Depends, Query, Request
from fastapi.routing import APIRouter
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from sse_starlette import EventSourceResponse

from app.api.dependencies.auth import get_user_from_token
from app.api.dependencies.database import get_new_async_conn
from app.api.routes.utils.errors import exception_handler
from app.core.config import is_testing
from app.services.global_notifications import GlobalNotificationsService
from app.services.personal_notifications import PersonalNotificationsService

router = APIRouter()


# https://amittallapragada.github.io/docker/fastapi/python/2020/12/23/server-side-events.html
# https://medium.com/tokopedia-engineering/implementing-server-sent-events-in-reactjs-c36661d89468
MESSAGE_STREAM_DELAY = 5
MESSAGE_STREAM_RETRY_TIMEOUT = 15000  # milisecond


async def event_publisher(
    *,
    max_messages,
    token,
    request: Request,
    global_notif_service: GlobalNotificationsService,
    personal_notif_service: PersonalNotificationsService,
    conn: AsyncConnection,
    send_stream=None,
) -> AsyncGenerator:
    i = 0
    try:
        while True and (not max_messages or i < max_messages):
            try:
                user = await get_user_from_token(request, token=token, conn=conn)  # dont use  request.app.state._conn
                if not user:
                    raise Exception
            except Exception as e:
                yield json.dumps(
                    dict(
                        message="Unauthenticated.",
                    )
                )
                return
            logger.debug(f"user: {user}")
            disconnected = await request.is_disconnected()
            if not user or disconnected:
                logger.info(f"Disconnecting client {request.client}.")
                break
            has_new_global_notifications = await global_notif_service.has_new_global_notifications(
                user_id=user.user_id, role=user.role
            )
            has_new_personal_notifications = await personal_notif_service.has_new_personal_notifications(
                last_personal_notification_at=user.last_personal_notification_at, user=user
            )
            yield json.dumps(
                dict(
                    id=f"{user.email}-{datetime.utcnow().isoformat()}",
                    has_new_global_notifications=f"{'true' if has_new_global_notifications else 'false'}",
                    has_new_personal_notifications=f"{'true' if has_new_personal_notifications else 'false'}",
                )
            )
            i += 1
            await conn.commit()
            await asyncio.sleep(MESSAGE_STREAM_DELAY)  # seconds
        logger.info(f"Disconnected from client {request.client}")
    except asyncio.CancelledError as e:
        logger.info(f"Disconnected from client (via refresh/close) {request.client}")
        # Do any other cleanup, if any
        await conn.rollback()
        raise e from e
    except Exception as e:
        logger.info(f"{request.client} - Exception: {e}")
        await conn.rollback()
        raise e from e
    finally:
        if conn and not is_testing():
            logger.critical(f"Closing conn in event_publisher: {id(conn)}")
            await conn.close()


# DEPRECATED
# TODO check test files: https://github.com/sysid/sse-starlette/tree/master/tests
# need to stop all tasks when shutting down the app
# For SSE to work properly, you must make sure nothing is getting cached or buffered:
# not in your script, not at your web server, and not at any intermediate proxies or firewalls.
@router.get(
    "/notifications-stream/",
    name="sse:notifications-stream",
    response_class=EventSourceResponse,
)
async def global_notifications_see(
    request: Request,
    token: str = Query("", description="token"),
    max_messages: int = Query(0, description="Max number of messages to return"),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    global_notif_service = GlobalNotificationsService(conn)
    personal_notif_service = PersonalNotificationsService(conn)
    async with exception_handler():
        return EventSourceResponse(
            event_publisher(
                max_messages=max_messages,
                token=token,
                request=request,
                global_notif_service=global_notif_service,
                personal_notif_service=personal_notif_service,
                conn=conn,
            ),
            media_type="text/event-stream",
        )
