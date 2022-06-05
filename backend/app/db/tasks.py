import gc
from typing import Optional, Type

from fastapi import FastAPI
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.pool import Pool, QueuePool

from app.core import config


def connect_to_db(
    *,
    app: Optional[FastAPI] = None,
    isolation_level: str = "READ COMMITTED",
    poolclass: Type[Pool] = QueuePool,
) -> AsyncEngine:
    pool_config = (
        {"max_overflow": config.MAX_OVERFLOW, "pool_size": config.POOL_SIZE} if isinstance(poolclass, QueuePool) else {}
    )
    engine: AsyncEngine = create_async_engine(
        config.DATABASE_URL,
        future=True,
        pool_pre_ping=True,
        isolation_level=isolation_level,
        echo=config.ECHO,
        connect_args={"server_settings": {"jit": "off"}},
        poolclass=poolclass,
        **pool_config,
    )
    if isinstance(app, FastAPI):
        app.state._engine = engine
    return engine


async def close_db_connection(app: FastAPI) -> None:
    try:
        await app.state._engine.dispose()  # especially for tests, where conns are short-lived
        gc.collect()

    except Exception as e:
        logger.warning("--- DB DISCONNECT ERROR ---")
        logger.warning(e)
        logger.warning("--- END DB DISCONNECT ERROR ---")
