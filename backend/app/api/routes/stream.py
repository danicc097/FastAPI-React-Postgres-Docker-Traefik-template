import asyncio
import json
from datetime import datetime
from typing import AsyncGenerator

import anyio
from fastapi import Depends, Query, Request
from fastapi.responses import StreamingResponse
from fastapi.routing import APIRouter
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.database import get_new_async_conn
from app.api.routes.utils.errors import exception_handler
from app.core.config import is_testing
from app.db.gen.queries.users import GetUserRow
from app.services.global_notifications import GlobalNotificationsService
from app.services.personal_notifications import PersonalNotificationsService

router = APIRouter()


MESSAGE_STREAM_DELAY = 5
MESSAGE_STREAM_RETRY_TIMEOUT = 15000  # milisecond


async def event_publisher(
    *,
    user: GetUserRow,
    max_messages,
    request: Request,
    global_notif_service: GlobalNotificationsService,
    personal_notif_service: PersonalNotificationsService,
    conn: AsyncConnection,
    send_stream=None,
) -> AsyncGenerator:
    i = 0
    try:
        while True and (not max_messages or i < max_messages):
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


@router.get(
    "/notifications/",
    name="stream:notifications",
    response_class=StreamingResponse,
)
async def global_notifications_stream(
    request: Request,
    current_user: GetUserRow = Depends(get_current_active_user),
    max_messages: int = Query(0, description="Max number of messages to return"),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    global_notif_service = GlobalNotificationsService(conn)
    personal_notif_service = PersonalNotificationsService(conn)
    async with exception_handler():
        return StreamingResponse(
            event_publisher(
                user=current_user,
                max_messages=max_messages,
                request=request,
                global_notif_service=global_notif_service,
                personal_notif_service=personal_notif_service,
                conn=conn,
            ),
            media_type="text/event-stream",
            headers={
                "Connection": "keep-alive",
                "Cache-Control": "no-cache",
                "Content-Type": "text/event-stream",
                "X-Accel-Buffering": "no",
            },
        )


@router.get(
    "/streaming-test/",
    name="stream:streaming-test",
)
async def bare_streaming():
    async def main():
        send_stream, receive_stream = anyio.create_memory_object_stream()

        async with anyio.create_task_group() as tg:
            async with send_stream:
                for num in range(5):
                    tg.start_soon(sometask, num, send_stream.clone())

            async with receive_stream:
                async for entry in receive_stream:
                    yield entry

    async def sometask(num, send_stream):
        async with send_stream:
            for i in range(3):
                await anyio.sleep(2)
                await send_stream.send(f"batch {i}: {num}\n")
                await send_stream.send(f"number {num}\n")

    return StreamingResponse(main())
