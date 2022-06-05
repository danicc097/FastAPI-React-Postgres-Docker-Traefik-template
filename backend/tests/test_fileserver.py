import io
import json
import os
from typing import Callable
from zipfile import ZipFile

import fitz
from loguru import logger
import pyfakefs.fake_filesystem
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from starlette.status import HTTP_200_OK

from app.models.user import UserPublic

pytestmark = pytest.mark.asyncio


class TestFileServer:
    async def test_can_get_directory_structure(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user6: UserPublic,
    ) -> None:

        import app.api.routes.fileserver as fileserver

        fileserver.FILES_PATH = os.path.join(os.path.dirname(__file__), "fileserver/files")

        authorized_client: AsyncClient = create_authorized_client(user=test_user6)

        res = await authorized_client.get(app.url_path_for("fileserver:get-files-structure"))

        assert res.status_code == HTTP_200_OK
        expected_text = open(os.path.join(os.path.dirname(__file__), "fileserver/expected.json")).read()
        expected = json.dumps(res.json(), sort_keys=True, separators=(",", ":"))
        wanted = json.dumps(json.loads(expected_text), sort_keys=True, separators=(",", ":"))
        assert expected == wanted
