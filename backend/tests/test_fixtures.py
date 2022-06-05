from typing import Callable

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from app.db.gen.queries.users import RegisterNewUserRow

pytestmark = pytest.mark.asyncio


async def test_client_fixtures(
    app: FastAPI,
    create_authorized_client: Callable,
    superuser_client: AsyncClient,
    test_user6: RegisterNewUserRow,
    test_admin_user: RegisterNewUserRow,
) -> None:
    test_user_client: AsyncClient = create_authorized_client(user=test_user6)
    assert test_user_client != superuser_client  # type: ignore

    await app.state._conn.rollback()
