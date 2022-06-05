import io
import json
import os
import zipfile
from glob import glob

from fastapi import Body, Depends, HTTPException, Query, Request, status
from fastapi.routing import APIRouter
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette.responses import Response

from app.api.dependencies.auth import (
    email_is_verified,
    get_current_active_user,
)
from app.api.dependencies.database import get_new_async_conn
from app.api.routes.utils.errors import exception_handler
from app.core import config
from app.models.user import UserPublic

router = APIRouter()

FILES_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../files"))


@router.get("/files", name="fileserver:get-files-structure")
async def get_files_structure(
    request: Request,
    current_user: UserPublic = Depends(get_current_active_user),
    conn: AsyncConnection = Depends(get_new_async_conn),
):
    # sourcery skip: assign-if-exp, dict-comprehension, inline-immediately-returned-variable
    # TODO somehow need access to the conn used in get_current_active_user so we can close, else too many clients error
    # return a dict from the dependency! or save conn to current request object https://fastapi.tiangolo.com/advanced/using-request-directly/
    async with exception_handler(conn):
        logger.info(f"{current_user.username} is requesting the files structure")
        if not current_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Current user is not verified. An administrator will approve your account soon.",
            )
        ALL_FILES = {}
        for root, dirs, files in os.walk(FILES_PATH):
            for name in files:
                path = os.path.join(root, name)
                url = os.path.relpath(path, FILES_PATH)
                ALL_FILES[url] = {
                    "name": name,
                    "depth": len(os.path.relpath(path, FILES_PATH).split(os.sep)),
                    "type": "file",
                    "ext": os.path.splitext(path)[-1] or "",
                    "size_kb": os.path.getsize(path) // (1024),
                    "url": url,
                }

            for name in dirs:
                path = os.path.join(root, name)
                url = os.path.relpath(path, FILES_PATH)
                ALL_FILES[url] = {
                    "name": name,
                    "depth": len(os.path.relpath(path, FILES_PATH).split(os.sep)),
                    "type": "directory",
                    "ext": "",
                    "size_kb": "",
                    "url": url,
                }

        return Response(
            content=json.dumps(ALL_FILES),  # TODO pydantic
            media_type="application/json",
        )
