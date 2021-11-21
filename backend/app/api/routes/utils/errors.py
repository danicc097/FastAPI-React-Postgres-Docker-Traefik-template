from fastapi import HTTPException
from loguru import logger
from starlette.responses import Response
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from functools import wraps
import app.db.repositories.global_notifications as global_notif_repo
import app.db.repositories.pwd_reset_req as pwd_reset_req_repo
import app.db.repositories.users as users_repo

BASE_EXCEPTION = HTTPException(
    status_code=HTTP_500_INTERNAL_SERVER_ERROR,
    detail="An unknown error occurred.",
)


async def exception_handler(f):
    """
    Wrapper for routes to handle its exceptions.
    """

    @wraps(f)
    async def _wrapper(*args, **kwargs):
        try:
            return await f(*args, **kwargs)
        except Exception as e:
            raise _exception_handler(e) from e

    return _wrapper


def _exception_handler(e: Exception) -> HTTPException:
    """
    Handles repo errors by mapping them to HTTP exceptions.
    """
    # ensure to check for origin repo first to avoid unnecessary checks
    if isinstance(e, users_repo.UsersRepoException):
        raise users_repo_exception_to_response(e) from e
    if isinstance(e, pwd_reset_req_repo.UserPwdReqRepoException):
        raise pwd_reset_req_repo_exception_to_response(e) from e
    if isinstance(e, global_notif_repo.GlobalNotificationsRepoException):
        raise global_notifications_repo_exception_to_response(e) from e
    else:
        logger.opt(exception=True).error(e)
        raise BASE_EXCEPTION from e


def users_repo_exception_to_response(e: Exception) -> HTTPException:
    """
    Map ``UsersRepoException`` to HTTP exceptions.
    """
    if isinstance(e, users_repo.EmailAlreadyExistsError):
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail=e.msg,
        ) from e
    elif isinstance(e, users_repo.UsernameAlreadyExistsError):
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail=e.msg,
        ) from e
    elif isinstance(e, users_repo.UserNotFoundError):
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=e.msg,
        ) from e
    elif isinstance(e, users_repo.InvalidUpdateError):
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        ) from e
    elif isinstance(e, users_repo.IncorrectPasswordError):
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        ) from e
    else:
        logger.opt(exception=True).error(e)
        raise BASE_EXCEPTION from e


def pwd_reset_req_repo_exception_to_response(e: Exception) -> HTTPException:
    """
    Map ``UsersRepoException`` to HTTP exceptions.
    """
    if isinstance(e, pwd_reset_req_repo.RequestDoesNotExistError):
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=e.msg,
        ) from e
    elif isinstance(e, pwd_reset_req_repo.UserAlreadyRequestedError):
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail=e.msg,
        ) from e
    else:
        logger.opt(exception=True).error(e)
        raise BASE_EXCEPTION from e


def global_notifications_repo_exception_to_response(e: Exception) -> HTTPException:
    """
    Map ``GlobalNotificationsRepoException`` to HTTP exceptions.
    """
    if isinstance(e, global_notif_repo.InvalidGlobalNotificationError):
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        ) from e
    if isinstance(e, global_notif_repo.InvalidParametersError):
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        ) from e
    else:
        logger.opt(exception=True).error(e)
        raise BASE_EXCEPTION from e
