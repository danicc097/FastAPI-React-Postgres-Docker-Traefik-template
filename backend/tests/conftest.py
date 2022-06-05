import os
from pathlib import Path
from typing import AsyncGenerator, Callable, Dict, Generator

import alembic.command
import pyfakefs.fake_filesystem
import pytest
import pytest_asyncio
from alembic.config import Config
from asgi_lifespan import LifespanManager
from fakeredis import FakeStrictRedis
from fastapi import FastAPI, Request
from httpx import AsyncClient
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncConnection

from app.api.dependencies.database import get_async_conn, get_new_async_conn
from app.db.gen.queries.models import Role
from app.db.gen.queries.users import RegisterNewUserRow
from app.models.user import RoleUpdate, UserCreate
from app.services import auth_service
from app.services.users import UsersService

os.environ["TESTING"] = "1"

from app.core import config as config  # noqa: E402

config.DATABASE_URL = config.TEST_DB_URL
config.MAX_OVERFLOW = 200
config.POOL_SIZE = 20
config.ECHO = False
# sys.stdout = sys.stderr  # xdist

############# CELERY #############


@pytest.fixture
def redis(monkeypatch):
    fake_redis = FakeStrictRedis()
    fake_redis.flushall()
    monkeypatch.setattr("celery_once.backends.redis.Redis.redis", fake_redis)
    return fake_redis


@pytest.fixture(scope="session")
def celery_enable_logging():
    return True


@pytest.fixture(scope="session")
def celery_config():
    os.environ["CELERY_BROKER_URL"] = "memory://"
    os.environ["CELERY_RESULT_BACKEND"] = "rpc"
    return {
        "broker_url": "memory://",
        "result_backend": "rpc",
        "task_always_eager": True,  # run in same thread, should enable mocking. Not recommended as per docs but give no alternative to mocking.
        "task_eager_propagates": True,
        "worker_send_task_events": True,  # remove  AttributeError("'NoneType' object has no attribute 'groups'")
        "task_send_sent_event": True,  # remove  AttributeError("'NoneType' object has no attribute 'groups'")
        "ONCE": {
            "backend": "celery_once.backends.Redis",
            "settings": {"url": "redis://", "default_timeout": 60 * 60},
        },
        "task_default_queue": f"myapp_queue_{config.APP_ENV}",
    }


# see https://www.distributedpython.com/2018/10/26/celery-execution-pool/
# @pytest.fixture(scope="session")
# def celery_worker_pool():
#     return "prefork"


@pytest.fixture(scope="session")
def celery_worker_parameters():
    """Redefine this fixture to change the init parameters of Celery workers.

    This can be used e. g. to define queues the worker will consume tasks from.

    The dict returned by your fixture will then be used
    as parameters when instantiating :class:`~celery.worker.WorkController`.
    """
    return {
        # For some reason this `celery.ping` is not registed IF our own worker is still
        # running. To avoid failing tests in that case, we disable the ping check.
        # see: https://github.com/celery/celery/issues/3642#issuecomment-369057682
        # here is the ping task: `from celery.contrib.testing.tasks import ping`
        "perform_ping_check": False,
        # "queues": ("high-prio", "low-prio"),
        # "exclude_queues": ("celery"),
    }


@pytest.fixture(scope="session")
def celery_includes():
    return ["app.celery.tasks"]


############# PYFAKEFS #############


@pytest.fixture
def pyfakefs_fs(
    fs: pyfakefs.fake_filesystem.FakeFilesystem,  # function-scoped
):
    yield fs


############# ASYNCIO #############


# @pytest.fixture(scope="session")
# def event_loop():
#     return asyncio.get_event_loop()


############# DATABASE #############


@pytest_asyncio.fixture(scope="module")
def apply_migrations():
    assert config.is_testing()

    cfg = Config("alembic.ini")
    alembic.command.upgrade(cfg, "head")
    yield
    alembic.command.downgrade(cfg, "base")


async def get_async_conn_test(request: Request) -> AsyncGenerator[AsyncConnection, None]:
    yield request.app.state._conn


@pytest_asyncio.fixture(scope="function")
async def new_conn(app: FastAPI) -> AsyncGenerator[AsyncConnection, None]:
    async with app.state._engine.connect() as conn:
        try:
            yield conn
        finally:
            await conn.close()


############# FASTAPI #############


@pytest.fixture(scope="module")
def app(apply_migrations) -> Generator[FastAPI, None, None]:
    """
    For startup and shutdown events to happen, include at least a client in test functions.
    """
    from app.api.server import get_application

    app = get_application()
    # NOT commit'ing and rollback'ing in the exception handler is a must for tests
    app.dependency_overrides[get_async_conn] = get_async_conn_test
    app.dependency_overrides[get_new_async_conn] = get_async_conn_test

    yield app


@pytest_asyncio.fixture
async def client(app: FastAPI):
    async with LifespanManager(app):
        async with AsyncClient(
            app=app,
            base_url="http://test:8999",
            headers={"Content-Type": "application/json"},
        ) as client:
            # IMPORTANT: at this point, startup event has run
            app.state._conn = await app.state._engine.connect()
            yield client
            await app.state._conn.close()


@pytest_asyncio.fixture
async def admin_client(app: FastAPI):

    async with LifespanManager(app):
        async with AsyncClient(
            app=app,
            base_url="http://test:8999",
            headers={"Content-Type": "application/json"},
        ) as client:
            # IMPORTANT: at this point, startup event has run
            app.state._conn = await app.state._engine.connect()
            yield client
            await app.state._conn.close()


@pytest_asyncio.fixture
async def client_2(app: FastAPI):

    async with LifespanManager(app):
        async with AsyncClient(
            app=app,
            base_url="http://test:8999",
            headers={"Content-Type": "application/json"},
        ) as client:
            # IMPORTANT: at this point, startup event has run
            app.state._conn = await app.state._engine.connect()
            yield client
            await app.state._conn.close()


@pytest_asyncio.fixture
def get_fixture(request):

    return request.getfixturevalue(request.param)


@pytest_asyncio.fixture
def authorized_client(client: AsyncClient, test_user: RegisterNewUserRow) -> AsyncClient:

    access_token = auth_service.create_access_token_for_user(user=test_user, secret_key=str(config.UNIQUE_KEY))
    client.headers = {
        **client.headers,
        "Authorization": f"{config.JWT_TOKEN_PREFIX} {access_token}",
    }
    return client


@pytest_asyncio.fixture
def superuser_client(admin_client: AsyncClient, test_admin_user: RegisterNewUserRow) -> AsyncClient:

    access_token = auth_service.create_access_token_for_user(user=test_admin_user, secret_key=str(config.UNIQUE_KEY))
    admin_client.headers = {
        **admin_client.headers,
        "Authorization": f"{config.JWT_TOKEN_PREFIX} {access_token}",
    }
    return admin_client


@pytest_asyncio.fixture
def test_2_client(client_2: AsyncClient, test_user4: RegisterNewUserRow) -> AsyncClient:
    access_token = auth_service.create_access_token_for_user(user=test_user4, secret_key=str(config.UNIQUE_KEY))
    client_2.headers = {
        **client_2.headers,
        "Authorization": f"{config.JWT_TOKEN_PREFIX} {access_token}",
    }
    return client_2


@pytest_asyncio.fixture
def create_authorized_client(client: AsyncClient) -> Callable:
    def _create_authorized_client(*, user: RegisterNewUserRow) -> AsyncClient:
        access_token = auth_service.create_access_token_for_user(user=user, secret_key=str(config.UNIQUE_KEY))
        client.headers = {
            **client.headers,
            "Authorization": f"{config.JWT_TOKEN_PREFIX} {access_token}",
        }
        client.headers
        return client

    return _create_authorized_client


async def user_fixture_helper(
    *,
    new_conn: AsyncConnection,
    new_user: UserCreate,
    get_db_data: bool = True,
    admin: bool = False,
    verified: bool = False,
):
    users_service = UsersService(new_conn)

    existing_user = await users_service.get_user_by_email(email=new_user.email, get_db_data=get_db_data)
    if existing_user:
        return existing_user

    user = await users_service.register_new_user(new_user=new_user, admin=admin, verified=verified)
    if not user:
        raise Exception("Failed to return user from fixture")
    if admin:
        await users_service.update_user_role(RoleUpdate(email=user.email, role=Role.ADMIN))
    await new_conn.commit()  # not using routes -> commit manually
    return await users_service.get_user_by_email(email=new_user.email, get_db_data=get_db_data)


###############################################################################


TEST_USERS: Dict[str, UserCreate] = {
    "test_user_db": UserCreate(
        email=EmailStr("user_db@myapp.com"),
        username="test_user_db",
        password="initialPassword",
    ),
    "test_admin_user": UserCreate(
        email=EmailStr("admin@myapp.com"),
        username="test_admin_user",
        password="initialPassword",
    ),
    "test_unverified_user": UserCreate(
        email=EmailStr("unverified@myapp.com"),
        username="test_unverified_user",
        password="initialPassword",
    ),
    "test_unverified_user2": UserCreate(
        email=EmailStr("unverified2@myapp.com"),
        username="test_unverified_user2",
        password="initialPassword",
    ),
    "test_user": UserCreate(
        email=EmailStr("user@myapp.com"),
        username="test_user",
        password="initialPassword",
    ),
    "test_user2": UserCreate(
        email=EmailStr("user2@myapp.com"),
        username="test_user2",
        password="initialPassword",
    ),
    "test_user3": UserCreate(
        email=EmailStr("user3@myapp.com"),
        username="test_user3",
        password="initialPassword",
    ),
    "test_user4": UserCreate(
        email=EmailStr("user4@myapp.com"),
        username="test_user4",
        password="initialPassword",
    ),
    "test_user5": UserCreate(
        email=EmailStr("user5@myapp.com"),
        username="test_user5",
        password="initialPassword",
    ),
    "test_user6": UserCreate(
        email=EmailStr("user6@myapp.com"),
        username="test_user6",
        password="initialPassword",
    ),
    "test_user7": UserCreate(
        email=EmailStr("user7@myapp.com"),
        username="test_user7",
        password="initialPassword",
    ),
}


@pytest_asyncio.fixture
async def test_user_db(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user_db"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, get_db_data=True)


@pytest_asyncio.fixture
async def test_admin_user(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_admin_user"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True, admin=True, get_db_data=True)


@pytest_asyncio.fixture
async def test_unverified_user(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_unverified_user"]

    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, get_db_data=True)


@pytest_asyncio.fixture
async def test_unverified_user2(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_unverified_user2"]

    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, get_db_data=True)


@pytest_asyncio.fixture
async def test_user(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True)


@pytest_asyncio.fixture
async def test_user2(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user2"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True)


@pytest_asyncio.fixture
async def test_user3(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user3"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True)


@pytest_asyncio.fixture
async def test_user4(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user4"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True)


@pytest_asyncio.fixture
async def test_user5(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user5"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True)


@pytest_asyncio.fixture
async def test_user6(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user6"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True)


@pytest_asyncio.fixture
async def test_user7(new_conn: AsyncConnection):
    new_user = TEST_USERS["test_user7"]
    return await user_fixture_helper(new_conn=new_conn, new_user=new_user, verified=True)


@pytest_asyncio.fixture
async def test_user_list(
    test_user3: RegisterNewUserRow,
    test_user4: RegisterNewUserRow,
    test_user5: RegisterNewUserRow,
    test_user6: RegisterNewUserRow,
) -> list[RegisterNewUserRow]:
    return [test_user3, test_user4, test_user5, test_user6]
