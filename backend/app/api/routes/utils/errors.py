from fastapi import HTTPException
from loguru import logger
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


def exception_handler(e: Exception) -> HTTPException:
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
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=e.msg,
        )
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
        return BASE_EXCEPTION


def pwd_reset_req_repo_exception_to_response(e: Exception) -> HTTPException:
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


def global_notifications_repo_exception_to_response(e: Exception) -> HTTPException:
    """
    Map ``GlobalNotificationsRepoException`` to HTTP exceptions.
    """
    if isinstance(e, global_notif_repo.InvalidGlobalNotificationError):
        return HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=e.msg,
        )
    else:
        logger.opt(exception=True).error(e)
        return BASE_EXCEPTION
