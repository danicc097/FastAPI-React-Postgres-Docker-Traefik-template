from contextlib import asynccontextmanager
from functools import wraps
from typing import Union

from fastapi import HTTPException
from loguru import logger
from starlette.responses import Response
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

import app.db.repositories.global_notifications as global_notif_repo
import app.db.repositories.pwd_reset_req as pwd_reset_req_repo
import app.db.repositories.users as users_repo

BASE_EXCEPTION = HTTPException(
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


def _exception_handler(e: Union[Exception, HTTPException]) -> Union[Exception, HTTPException]:
    """
    Handles repo errors by mapping them to HTTP exceptions.
    """
    # handle repo exceptions
    if isinstance(e, users_repo.UsersRepoException):
        return _users_repo_exception_handler(e)
    if isinstance(e, pwd_reset_req_repo.UserPwdReqRepoException):
        return _pwd_reset_req_repo_exception_handler(e)
    if isinstance(e, global_notif_repo.GlobalNotificationsRepoException):
        return _global_notifications_repo_exception_handler(e)
    else:
        # but return HTTPExceptions as they come (already handled elsewhere)
        if isinstance(e, HTTPException):
            return e
        # and return a base exception for any other Exceptions we didn't handle
        # for further analysis through its traceback
        else:
            logger.opt(exception=True).error(e)
            return BASE_EXCEPTION


def _users_repo_exception_handler(e: Exception) -> HTTPException:
    """
    Map ``UsersRepoException`` to HTTP exceptions.
    """
    if isinstance(e, users_repo.EmailAlreadyExistsError):
        return HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail=e.msg,
        )
    elif isinstance(e, users_repo.UsernameAlreadyExistsError):
        return HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail=e.msg,
        )
    elif isinstance(e, users_repo.UserNotFoundError):
        return HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=e.msg,
        )
    elif isinstance(e, users_repo.InvalidUpdateError):
        return HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        )
    elif isinstance(e, users_repo.IncorrectPasswordError):
        return HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        )
    else:
        logger.opt(exception=True).error(e)
        return BASE_EXCEPTION


def _pwd_reset_req_repo_exception_handler(e: Exception) -> HTTPException:
    """
    Map ``UsersRepoException`` to HTTP exceptions.
    """
    if isinstance(e, pwd_reset_req_repo.RequestDoesNotExistError):
        return HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=e.msg,
        )
    elif isinstance(e, pwd_reset_req_repo.UserAlreadyRequestedError):
        return HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail=e.msg,
        )
    else:
        logger.opt(exception=True).error(e)
        return BASE_EXCEPTION


def _global_notifications_repo_exception_handler(e: Exception) -> HTTPException:
    """
    Map ``GlobalNotificationsRepoException`` to HTTP exceptions.
    """
    if isinstance(e, global_notif_repo.InvalidGlobalNotificationError):
        return HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        )
    if isinstance(e, global_notif_repo.InvalidParametersError):
        return HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        )
    else:
        logger.opt(exception=True).error(e)
        return BASE_EXCEPTION
