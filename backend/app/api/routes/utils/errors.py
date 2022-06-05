from contextlib import asynccontextmanager, contextmanager
from typing import Optional, Union

from celery_once import AlreadyQueued
from fastapi import HTTPException
from loguru import logger
from sqlalchemy.exc import InterfaceError, ResourceClosedError
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette.status import (
    HTTP_409_CONFLICT,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_503_SERVICE_UNAVAILABLE,
)

from app.core.config import is_creating_initial_data, is_testing
from app.core.errors import BaseAppException

UNHANDLED_EXCEPTION = HTTPException(
    status_code=HTTP_500_INTERNAL_SERVER_ERROR,
    detail="An unknown error occurred.",
)


@asynccontextmanager
async def exception_handler(conn: Optional[AsyncConnection] = None, close_conn: bool = True):
    try:
        logger.warning(f"Using connection {id(conn)}")
        yield
    except Exception as e:
        if conn and not is_testing():
            logger.critical(f"Rolling back transaction for connection {id(conn)}")
            await conn.rollback()
        raise _exception_handler(e) from e
    finally:
        if conn and (not is_testing() and not is_creating_initial_data()):
            logger.critical(f"Closing connection {id(conn)}")  # back to pool
            await conn.commit()
            if close_conn:
                await conn.close()


@contextmanager
def task_exception_handler():
    try:
        yield
    except AlreadyQueued as e:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="Task already queued.",
        ) from e


def _exception_handler(exc: Union[Exception, HTTPException]) -> Union[Exception, HTTPException]:

    if isinstance(exc, HTTPException):
        logger.error(exc)
        return exc

    if isinstance(exc, BaseAppException):
        logger.error(f"{exc.user} - {exc.msg}")
        return HTTPException(
            status_code=exc.status_code,
            detail=exc.msg,
            headers=getattr(exc, "headers", None),
        )

    if isinstance(exc, InterfaceError) or isinstance(exc, ResourceClosedError):
        logger.error(f"{exc}")
        return HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database is unavailable: {exc.__class__.__name__}",
        )

    logger.error(exc)
    logger.opt(exception=True).error(exc)
    return UNHANDLED_EXCEPTION
