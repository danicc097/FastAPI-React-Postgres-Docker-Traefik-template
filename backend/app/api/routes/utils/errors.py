from contextlib import asynccontextmanager
from functools import wraps
from typing import Type, Union, cast

from fastapi import HTTPException
from loguru import logger
from starlette.responses import Response
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from app.db.repositories.base import BaseRepoException

import app.db.repositories.global_notifications as global_notif_repo
import app.db.repositories.password_reset_requests as pwd_reset_req_repo
import app.db.repositories.users as users_repo

UNHANDLED_EXCEPTION = HTTPException(
    status_code=HTTP_500_INTERNAL_SERVER_ERROR,
    detail="An unknown error occurred.",
)


@asynccontextmanager
async def exception_handler():
    """
    Context manager to handle route exceptions that arise from repositories
    """
    try:
        yield
    except Exception as e:
        raise _exception_handler(e) from e


def _exception_handler(exc: Union[Exception, HTTPException]) -> Union[Exception, HTTPException]:
    """
    Handles repo errors by mapping them to HTTP exceptions.
    """
    # return HTTPExceptions as they come (means they were already handled elsewhere)
    if isinstance(exc, HTTPException):
        return exc

    if isinstance(exc, BaseRepoException):
        return HTTPException(
            status_code=exc.status_code,
            detail=exc.msg,
        )
    # log unhandled exceptions for further investigation
    else:
        logger.opt(exception=True).error(exc)
        return UNHANDLED_EXCEPTION
