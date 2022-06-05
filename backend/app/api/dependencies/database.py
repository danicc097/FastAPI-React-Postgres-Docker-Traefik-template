from typing import AsyncGenerator

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette.requests import Request


def get_engine(request: Request) -> AsyncGenerator[None, None]:
    return request.app.state._engine


async def get_new_async_conn(request: Request) -> AsyncGenerator[AsyncConnection, None]:
    async with request.app.state._engine.connect() as conn:
        try:
            yield conn
        finally:
            logger.critical(f"closing connection in get_new_async_conn: {id(conn)}")
            await conn.close()


async def get_async_conn(request: Request) -> AsyncGenerator[AsyncConnection, None]:
    yield request.app.state._conn
