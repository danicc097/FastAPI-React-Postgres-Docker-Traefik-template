"""
NOTE

Some warnings to ignore because of 3.9, e.g. due to the code inside bcrypt:
/usr/local/lib/python3.9/site-packages/passlib/handlers/bcrypt.py:378: DeprecationWarning: NotImplemented should not be used in a boolean context


"""


from typing import Callable, Dict, List, Optional, Type, Union

import jwt
import pytest
from databases import Database
from fastapi import FastAPI, HTTPException, status
from httpx import AsyncClient
from loguru import logger
from pydantic import ValidationError
from sqlalchemy.orm import close_all_sessions
from starlette.datastructures import Secret
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_422_UNPROCESSABLE_ENTITY,
)

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_AUDIENCE,
    JWT_TOKEN_PREFIX,
    UNIQUE_KEY,
)
from app.db.repositories.users import UsersRepository
from app.models.pwd_reset_req import (
    PasswordResetRequest,
    PasswordResetRequestCreate,
)
from app.models.token import JWTCreds, JWTMeta, JWTPayload
from app.models.user import UserCreate, UserInDB, UserPublic
from app.services import auth_service
from tests.conftest import TEST_USERS

pytestmark = pytest.mark.asyncio


class TestAdminRoutes:
    async def test_routes_exist(self, app: FastAPI, client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("admin:list-unverified-users"))
        assert res.status_code != HTTP_404_NOT_FOUND

        res = await client.post(app.url_path_for("admin:verify-users-by-email"))
        assert res.status_code != HTTP_404_NOT_FOUND

    async def test_unregistered_user_cant_access_admin(self, app: FastAPI, client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("admin:list-unverified-users"))
        assert res.status_code == HTTP_401_UNAUTHORIZED  # authentication scope (unfortunate http code name)

    async def test_regular_user_cant_access_admin(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: UserPublic,
    ) -> None:
        res = await authorized_client.get(app.url_path_for("admin:list-unverified-users"))
        assert res.status_code == HTTP_403_FORBIDDEN  # authorization scope

    async def test_admin_can_access_admin(
        self,
        app: FastAPI,
        superuser_client: AsyncClient,
        test_admin_user: UserInDB,
    ) -> None:
        res = await superuser_client.get(app.url_path_for("admin:list-unverified-users"))

        assert res.status_code != HTTP_403_FORBIDDEN


class TestAdminUserlistAccess:
    async def test_admin_can_list_all_existing_users(
        self,
        app: FastAPI,
        superuser_client: AsyncClient,
        test_user: UserPublic,
    ) -> None:
        res = await superuser_client.get(
            app.url_path_for("admin:list-users"),
        )
        assert res.status_code == HTTP_200_OK
        assert len(res.json()) != 0


class TestAdminUserModification:
    async def test_admin_can_verify_users(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_unverified_user,
        test_unverified_user2,
        test_admin_user: UserInDB,
    ) -> None:
        # async with app.state._db.transaction(force_rollback=True):
        res = await superuser_client.get(app.url_path_for("admin:list-unverified-users"))
        assert res.status_code == HTTP_200_OK
        unverified_user_emails = [UserPublic(**user).email for user in res.json()]
        assert len(unverified_user_emails) == 2  # number of unverified fixtures used

        res = await superuser_client.post(
            app.url_path_for("admin:verify-users-by-email"),
            json={"user_emails": unverified_user_emails},
        )
        assert res.status_code == HTTP_200_OK
        verified_users = [UserPublic(**user) for user in res.json()]
        assert verified_users[0].email_verified
        assert verified_users[1].email_verified

        # requests should be empty
        res = await superuser_client.get(app.url_path_for("admin:list-unverified-users"))
        assert res.status_code == HTTP_200_OK
        assert len(res.json()) == 0

    async def test_admin_has_access_to_password_reset_requests(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_user7: UserPublic,
        test_user6: UserPublic,
        test_admin_user: UserInDB,
    ) -> None:
        # make 2 users request a password reset
        for test_user in (test_user6, test_user7):
            test_user_client: AsyncClient = create_authorized_client(user=test_user)
            pwd_reset_req = PasswordResetRequestCreate(
                email=test_user.email,
                message=f"Help {test_user.username}, please",
            )
            # actually any client can request it since the user won't know its own password
            # but there's no email server so this is as secure as we get
            res = await test_user_client.post(
                app.url_path_for("users:request-password-reset"),
                json={"password_request": pwd_reset_req.dict()},
            )

        # ensure we didn't break conftest client generators somehow
        assert test_user_client != superuser_client

        # get all users who requested a password reset
        # superuser_client: AsyncClient = create_authorized_client(user=test_admin_user)
        res = await superuser_client.get(app.url_path_for("admin:list-password-request-users"))
        assert res.status_code == HTTP_200_OK
        pwd_request_emails = [PasswordResetRequest(**user).email for user in res.json()]
        assert len(pwd_request_emails) == 2  # number of unverified fixtures used

        # reset their passwords
        for test_user in (test_user6, test_user7):
            # superuser_client: AsyncClient = create_authorized_client(user=test_admin_user)  # type: ignore
            print("str(superuser_client)")
            print(str(superuser_client))
            res = await superuser_client.post(
                app.url_path_for("admin:reset-user-password-by-email"),
                json={"email": test_user.email},
            )
            assert res.status_code == HTTP_200_OK
            new_pwd = res.json()
            previous_pwd = TEST_USERS[test_user.username].password  # type: ignore
            assert new_pwd != previous_pwd
            print(f"{new_pwd=} - The previous password was {previous_pwd}")
            # cannot create multiple clients to test login, that will override the admin one
            # until create_authorized_client is fixed
            test_user_client: AsyncClient = create_authorized_client(user=test_user)  # type: ignore
            test_user_client.headers["content-type"] = "application/x-www-form-urlencoded"
            print("str(test_user_client)")
            print(str(test_user_client))
            login_data = {
                "username": test_user.email,
                "password": new_pwd,  # insert user's plaintext password
            }
            res = await test_user_client.post(app.url_path_for("users:login-email-and-password"), data=login_data)
            assert res.status_code == HTTP_200_OK

    async def test_admin_cannot_reset_password_with_bad_email(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        # test_admin_user: UserInDB,
        test_2_client: AsyncClient,
        # test_user4: UserPublic,
    ) -> None:
        res = await superuser_client.post(
            app.url_path_for("admin:reset-user-password-by-email"),
            json={"email": "unexistent@myapp.com"},
        )
        # {'detail': 'User with email unexistent@myapp.com does not exist.'}
        assert res.status_code != HTTP_200_OK
        res = await superuser_client.post(
            app.url_path_for("admin:reset-user-password-by-email"),
        )
        # * notice why we need error extracting utils for frontend for multiple formats
        # {'detail': [{'loc': ['body', 'email'], 'msg': 'field required', 'type': 'value_error.missing'}]}
        assert res.status_code != HTTP_200_OK

    async def test_admin_can_delete_a_user_password_reset_request(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_user: UserPublic,
    ) -> None:
        pwd_reset_req = PasswordResetRequestCreate(
            email=test_user.email,
            message=f"Help {test_user.username}, please",
        )

        # actually any client can request it since the user won't know its own password
        # but there's no email server so this is as secure as we get
        res = await superuser_client.post(
            app.url_path_for("users:request-password-reset"),
            json={"password_request": pwd_reset_req.dict()},
        )
        request_id = res.json()["id"]
        # delete the made request
        res = await superuser_client.delete(app.url_path_for("admin:delete-password-reset-request", id=request_id))

        assert res.status_code == HTTP_200_OK

        # requests should be empty
        res = await superuser_client.get(app.url_path_for("admin:list-unverified-users"))
        assert res.status_code == HTTP_200_OK
        assert len(res.json()) == 0
