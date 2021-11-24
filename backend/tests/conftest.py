import os
import random
import warnings
from typing import Callable, Dict, List, Union

import alembic.command
import pytest
import sqlalchemy
from alembic.config import Config
from asgi_lifespan import LifespanManager
from databases import Database
from fastapi import FastAPI
from httpx import AsyncClient

from app.core.config import JWT_TOKEN_PREFIX, UNIQUE_KEY, is_testing
from app.db.repositories.users import UsersRepository
from app.models.user import Role, RoleUpdate, UserCreate, UserInDB, UserPublic
from app.services import auth_service
from initial_data.utils import change_user_role

os.environ["TESTING"] = "1"


# Not recommended: persist db in "session" scope (don't apply_migrations on each test execution)
# That will cause tests to fail if we modify conftest state, e.g. verify a user that's used as an
# unverified user in another test.
# an alternative is to use ``async with app.state._db.transaction(force_rollback=True):``
# but it rolls back every single transaction, which won't allow us to test multiple queries
# that depend on each other for the test to be useful.
# "module" will persist db changes between tests files and is a nice balance
@pytest.fixture(scope="module")
def apply_migrations():
    """
    Determine when migrations should be applied
    """
    assert is_testing()
    config = Config("alembic.ini")
    alembic.command.upgrade(config, "head")

    # When using yield, the code block below is executed as teardown code regardless of the test(s) outcome
    yield
    # allow all tests to execute with the current scope, then roll back to prevent database changes propagating.
    # requires that all clients are closed.
    # ? foolish attempts to close connections that dont seem to work for some reason
    # await db.disconnect()
    # close_all_sessions()
    alembic.command.downgrade(config, "base")


# Create a new application for every executed test.
# When you include the fixture name in the parameter of a test function, module, class or project,
# pytest knows it has to run it before running the test.
# * `function` is the default scope -> the fixture is destroyed at the end of the test.
# * i.e. we're creating a new `app` for every test module (.py).
# * However, the same `app` is used anywhere this fixture is used, e.g. db(),
# * it doesn't create a new one since it knows it already exists.
@pytest.fixture
def app(apply_migrations) -> FastAPI:
    from app.api.server import get_application

    return get_application()


@pytest.fixture
def db(app: FastAPI) -> Database:
    """
    Current app's ``Database`` object to be used in other fixtures.
    NOTE: use app.state._db in a test instead or through a repository's ``db`` property.
    """
    return app.state._db


# TODO FIX: seems to override clients when we use create_authorized_client
# multiple times in the same test function
# NOTES on how to fix:
# - ``with`` cleans up afterwards...
# - Reference https://www.python-httpx.org/async/#opening-and-closing-clients
@pytest.fixture
async def client(app: FastAPI):
    """
    Creates a new unauthenticated ``client`` able to make requests.
    Note: every time we yield we override any other ``client`` instances
    IMPORTANT: the previous client that uses ``client``
    will be closed when a new one is generated.
    """
    async with LifespanManager(app):
        async with AsyncClient(
            app=app,
            base_url="http://testserver",
            headers={"Content-Type": "application/json"},
        ) as client:
            yield client
        # close the connect when done
        # await client.aclose()


# this will mess up apply_migrations on scope change due
# to having more than one client connected
# and requires force closing all sessions
@pytest.fixture
async def admin_client(app: FastAPI):
    """
    Creates a new unauthenticated ``admin_client`` able to make requests.
    IMPORTANT: the previous client that uses ``admin_client``
    will be closed when a new one is generated.
    """
    async with LifespanManager(app):
        async with AsyncClient(
            app=app,
            base_url="http://testserver",
            headers={"Content-Type": "application/json"},
        ) as client:
            yield client


@pytest.fixture
async def client_2(app: FastAPI):
    """
    Creates a new unauthenticated ``client_2`` able to make requests.
    IMPORTANT: the previous client that uses ``client_2``
    will be closed when a new one is generated.
    """
    async with LifespanManager(app):
        async with AsyncClient(
            app=app,
            base_url="http://testserver",
            headers={"Content-Type": "application/json"},
        ) as client:
            yield client


@pytest.fixture
def user_fixture(request):
    """
    Return an user fixture.
    """
    return request.getfixturevalue(request.param)


@pytest.fixture
def authorized_client(client: AsyncClient, test_user: UserPublic) -> AsyncClient:
    """
    Creates an authorized ``test_user`` to test authorized requests instead
    of the generic ``client`` fixture.
    A new database session is created when the fixture is called.
    """
    access_token = auth_service.create_access_token_for_user(user=test_user, secret_key=str(UNIQUE_KEY))
    client.headers = {
        **client.headers,  # type: ignore
        "Authorization": f"{JWT_TOKEN_PREFIX} {access_token}",
    }
    return client


@pytest.fixture
def superuser_client(admin_client: AsyncClient, test_admin_user: UserPublic) -> AsyncClient:
    """
    Creates an authorized ``superuser_client`` with admin privileges and its own
    admin_client to prevent overriding it in tests where multiple clients are needed.
    A new database session is created when the fixture is called.
    """
    access_token = auth_service.create_access_token_for_user(user=test_admin_user, secret_key=str(UNIQUE_KEY))
    admin_client.headers = {
        **admin_client.headers,  # type: ignore
        "Authorization": f"{JWT_TOKEN_PREFIX} {access_token}",
    }
    return admin_client


@pytest.fixture
def test_2_client(client_2: AsyncClient, test_user4: UserPublic) -> AsyncClient:
    access_token = auth_service.create_access_token_for_user(user=test_user4, secret_key=str(UNIQUE_KEY))
    client_2.headers = {
        **client_2.headers,  # type: ignore
        "Authorization": f"{JWT_TOKEN_PREFIX} {access_token}",
    }
    return client_2


@pytest.fixture
def create_authorized_client(client: AsyncClient) -> Callable:
    """
    Allows to authorize any user fixture (test_user[i], etc.)
    IMPORTANT: It will override other clients created with this function since we're using the
    same ``client`` fixture instance.
    """

    def _create_authorized_client(*, user: UserInDB) -> AsyncClient:
        access_token = auth_service.create_access_token_for_user(user=user, secret_key=str(UNIQUE_KEY))
        client.headers = {
            **client.headers,  # type: ignore
            "Authorization": f"{JWT_TOKEN_PREFIX} {access_token}",
        }
        client.headers
        return client

    return _create_authorized_client


async def user_fixture_helper(
    *,
    db: Database,
    new_user: UserCreate,
    to_public: bool = True,
    admin: bool = False,
    verified: bool = False,
) -> Union[UserInDB, UserPublic]:
    user_repo = UsersRepository(db)
    # when we call the fixture again, we don't want to create a new user
    existing_user = await user_repo.get_user_by_email(email=new_user.email, to_public=to_public)
    if existing_user:
        return existing_user
    # first time call will run this
    user = await user_repo.register_new_user(new_user=new_user, to_public=to_public, admin=admin, verified=verified)
    if not user:
        raise Exception("Failed to return user from fixture")
    if admin:
        await change_user_role(db, RoleUpdate(email=user.email, role=Role.admin))
    return user


###############################################################################

# * map usernames to keys for convenience
TEST_USERS: Dict[str, UserCreate] = {
    "test_user_db": UserCreate(
        email="user_db@myapp.com",
        username="test_user_db",
        password="initialPassword",
    ),
    "test_admin_user": UserCreate(
        email="admin@myapp.com",
        username="test_admin_user",
        password="initialPassword",
    ),
    "test_unverified_user": UserCreate(
        email="unverified@myapp.com",
        username="test_unverified_user",
        password="initialPassword",
    ),
    "test_unverified_user2": UserCreate(
        email="unverified2@myapp.com",
        username="test_unverified_user2",
        password="initialPassword",
    ),
    "test_user": UserCreate(
        email="user@myapp.com",
        username="test_user",
        password="initialPassword",
    ),
    "test_user2": UserCreate(
        email="user2@myapp.com",
        username="test_user2",
        password="initialPassword",
    ),
    "test_user3": UserCreate(
        email="user3@myapp.com",
        username="test_user3",
        password="initialPassword",
    ),
    "test_user4": UserCreate(
        email="user4@myapp.com",
        username="test_user4",
        password="initialPassword",
    ),
    "test_user5": UserCreate(
        email="user5@myapp.com",
        username="test_user5",
        password="initialPassword",
    ),
    "test_user6": UserCreate(
        email="user6@myapp.com",
        username="test_user6",
        password="initialPassword",
    ),
    "test_user7": UserCreate(
        email="user7@myapp.com",
        username="test_user7",
        password="initialPassword",
    ),
}


@pytest.fixture
async def test_user_db(db: Database) -> UserInDB:
    new_user = UserCreate(
        email=TEST_USERS["test_user_db"].email,
        username=TEST_USERS["test_user_db"].username,
        password=TEST_USERS["test_user_db"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, to_public=False)  # type: ignore


@pytest.fixture
async def test_admin_user(db: Database) -> UserInDB:
    new_user = UserCreate(
        email=TEST_USERS["test_admin_user"].email,
        username=TEST_USERS["test_admin_user"].username,
        password=TEST_USERS["test_admin_user"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, admin=True, to_public=False)  # type: ignore


@pytest.fixture
async def test_unverified_user(db: Database) -> UserInDB:
    new_user = UserCreate(
        email=TEST_USERS["test_unverified_user"].email,
        username=TEST_USERS["test_unverified_user"].username,
        password=TEST_USERS["test_unverified_user"].password,
    )

    return await user_fixture_helper(db=db, new_user=new_user, to_public=False)  # type: ignore


@pytest.fixture
async def test_unverified_user2(db: Database) -> UserInDB:
    new_user = UserCreate(
        email=TEST_USERS["test_unverified_user2"].email,
        username=TEST_USERS["test_unverified_user2"].username,
        password=TEST_USERS["test_unverified_user2"].password,
    )

    return await user_fixture_helper(db=db, new_user=new_user, to_public=False)  # type: ignore


@pytest.fixture
async def test_user(db: Database) -> UserPublic:
    new_user = UserCreate(
        email=TEST_USERS["test_user"].email,
        username=TEST_USERS["test_user"].username,
        password=TEST_USERS["test_user"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, verified=True)  # type: ignore


@pytest.fixture
async def test_user2(db: Database) -> UserPublic:
    new_user = UserCreate(
        email=TEST_USERS["test_user2"].email,
        username=TEST_USERS["test_user2"].username,
        password=TEST_USERS["test_user2"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, verified=True)  # type: ignore


@pytest.fixture
async def test_user3(db: Database) -> UserPublic:
    new_user = UserCreate(
        email=TEST_USERS["test_user3"].email,
        username=TEST_USERS["test_user3"].username,
        password=TEST_USERS["test_user3"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, verified=True)  # type: ignore


@pytest.fixture
async def test_user4(db: Database) -> UserPublic:
    new_user = UserCreate(
        email=TEST_USERS["test_user4"].email,
        username=TEST_USERS["test_user4"].username,
        password=TEST_USERS["test_user4"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, verified=True)  # type: ignore


@pytest.fixture
async def test_user5(db: Database) -> UserPublic:
    new_user = UserCreate(
        email=TEST_USERS["test_user5"].email,
        username=TEST_USERS["test_user5"].username,
        password=TEST_USERS["test_user5"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, verified=True)  # type: ignore


@pytest.fixture
async def test_user6(db: Database) -> UserPublic:
    new_user = UserCreate(
        email=TEST_USERS["test_user6"].email,
        username=TEST_USERS["test_user6"].username,
        password=TEST_USERS["test_user6"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, verified=True)  # type: ignore


@pytest.fixture
async def test_user7(db: Database) -> UserPublic:
    new_user = UserCreate(
        email=TEST_USERS["test_user7"].email,
        username=TEST_USERS["test_user7"].username,
        password=TEST_USERS["test_user7"].password,
    )
    return await user_fixture_helper(db=db, new_user=new_user, verified=True)  # type: ignore


@pytest.fixture
async def test_user_list(
    test_user3: UserPublic,
    test_user4: UserPublic,
    test_user5: UserPublic,
    test_user6: UserPublic,
) -> List[UserPublic]:
    return [test_user3, test_user4, test_user5, test_user6]
