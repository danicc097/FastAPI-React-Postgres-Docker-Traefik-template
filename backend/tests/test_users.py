import re
from pathlib import Path
from typing import Callable, Optional, Set, Type, Union

import jwt
import pytest
from fastapi import FastAPI, HTTPException, status
from httpx import AsyncClient
from loguru import logger
from pydantic import EmailStr, ValidationError
from starlette.datastructures import Secret
from starlette.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_422_UNPROCESSABLE_ENTITY,
)

from app.api.routes.users import router as users_router
from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_AUDIENCE,
    UNIQUE_KEY,
)
from app.db.gen.queries.password_reset_requests import (
    CreatePasswordResetRequestParams,
)
from app.db.gen.queries.users import GetUserRow
from app.models.user import UserCreate, UserPublic, UserUpdate
from app.services import auth_service
from app.services.users import UsersService
from tests.conftest import TEST_USERS

pytestmark = pytest.mark.asyncio


ROUTES = [(route.name, route.methods, route.path) for route in users_router.routes]  # type: ignore


class TestUserRoutes:
    @pytest.mark.parametrize(
        "valid_status_codes, get_fixture",
        (
            ([status.HTTP_200_OK, status.HTTP_201_CREATED, status.HTTP_422_UNPROCESSABLE_ENTITY], "authorized_client"),
            ([status.HTTP_200_OK, status.HTTP_201_CREATED, status.HTTP_422_UNPROCESSABLE_ENTITY], "superuser_client"),
        ),
        indirect=["get_fixture"],
    )
    async def test_generic_access_level(
        self,
        app: FastAPI,
        valid_status_codes: Set[int],
        get_fixture: AsyncClient,
    ) -> None:
        client = get_fixture
        for name, methods, path in ROUTES:
            for method in methods:
                path_params = re.search(r"{(.*[^}])}", path)
                logger.critical(f"{path}---{name}---{method}---{path_params}")
                client_method = getattr(client, method.lower())
                if path_params:
                    _path_params = {k: v for k, v in zip(path_params.groups(), range(len(path_params.groups())))}
                    logger.critical(f"_path_params {_path_params}")
                    res = await client_method(app.url_path_for(name, **_path_params))
                else:
                    res = await client_method(app.url_path_for(name))
                assert res.status_code in valid_status_codes

        await app.state._conn.rollback()

    async def test_unverified_user_cannot_access_profile(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_unverified_user: GetUserRow,
        test_user: UserPublic,
    ) -> None:
        authorized_client_unverified: AsyncClient = create_authorized_client(user=test_unverified_user)
        res = await authorized_client_unverified.get(app.url_path_for("users:get-current-user"))
        assert res.status_code == HTTP_403_FORBIDDEN

    async def test_user_in_verified_list_gets_instant_verification_upon_registration(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
        test_admin_user: UserPublic,
    ) -> None:
        import initial_data

        with open(Path(initial_data.__file__).parent / "verified_emails.txt", "r") as f:
            verified_emails = f.read().splitlines()

        for i, email in enumerate(verified_emails):
            logger.critical(f"email is {email}")
            new_user = {
                "email": email,
                "username": f"randomusername{i}",
                "password": "mypassword",
            }
            res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user})
            assert res.status_code == HTTP_201_CREATED
            users_service = UsersService(app.state._conn)
            user_in_db = await users_service.get_user_by_email(email=new_user["email"], get_db_data=True)  # type: ignore
            assert user_in_db is not None
            assert user_in_db.is_verified

        await app.state._conn.rollback()

    async def test_verified_user_can_access_profile(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_unverified_user: GetUserRow,
        test_user: UserPublic,
    ) -> None:
        authorized_client: AsyncClient = create_authorized_client(user=test_user)
        res = await authorized_client.get(app.url_path_for("users:get-current-user"))
        assert res.status_code == HTTP_200_OK

    async def test_unregistered_user_cannot_access_profile(
        self,
        app: FastAPI,
        client: AsyncClient,
    ) -> None:
        res = await client.get(app.url_path_for("users:get-current-user"))
        assert res.status_code == HTTP_401_UNAUTHORIZED


class TestUserRegistration:
    async def test_users_can_register_successfully_and_input_is_normalized(
        self,
        app: FastAPI,
        client: AsyncClient,
    ) -> None:
        users_service = UsersService(app.state._conn)
        new_user = {
            "email": "EMAIL@MYAPP.IO",
            "username": "myusername",
            "password": "mypassword",
        }
        assert new_user["email"] not in [user.email for user in TEST_USERS.values()]
        assert new_user["username"] not in [user.username for user in TEST_USERS.values()]

        user_in_db = await users_service.get_user_by_email(email=new_user["email"])  # type: ignore
        assert user_in_db is None

        res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user})
        assert res.status_code == HTTP_201_CREATED

        user_in_db = await users_service.get_user_by_email(email=new_user["email"], get_db_data=True)  # type: ignore
        assert user_in_db is not None
        assert user_in_db.email == new_user["email"].lower()
        assert user_in_db.username == new_user["username"]
        assert user_in_db.salt is not None
        assert user_in_db.password is not None
        assert res.json()["access_token"] is not None

        created_user = UserPublic(**res.json()).dict(exclude={"access_token", "profile"}, exclude_none=True)
        assert created_user == user_in_db.dict(exclude={"password", "salt"}, exclude_none=True)

        await app.state._conn.rollback()

    @pytest.mark.parametrize(
        "attr, value, status_code, exception",
        (
            (
                "email",
                TEST_USERS["test_user"].email,
                HTTP_409_CONFLICT,
                None,
            ),
            (
                "username",
                TEST_USERS["test_user"].username,
                HTTP_409_CONFLICT,
                None,
            ),
            (
                "email",
                "invalid_email@one@two.io",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),
            (
                "password",
                "short",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),
            (
                "username",
                "random@#$%^<>",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),
            (
                "username",
                "ab",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),
            (
                "email",
                "user@baddomain.com",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),
        ),
    )
    async def test_user_registration_fail_with_taken_or_invalid_credentials(
        self,
        app: FastAPI,
        client: AsyncClient,
        attr: str,
        value: str,
        exception: Type[Exception],
        test_user: UserPublic,
        status_code: int,
    ) -> None:
        new_user = {
            "email": "nottaken@myapp.io",
            "username": "not_taken_username",
            "password": "freepassword",
        }
        assert new_user["email"] not in [user.email for user in TEST_USERS.values()]
        assert new_user["username"] not in [user.username for user in TEST_USERS.values()]

        new_user[attr] = value
        if exception:
            with pytest.raises(exception):
                res = await client.post(
                    app.url_path_for("users:register-new-user"),
                    json={"new_user": new_user},
                )
                assert res.status_code == status_code
        else:
            res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user})
            assert res.status_code == status_code

        await app.state._conn.rollback()

    async def test_users_saved_password_is_hashed_and_has_salt(
        self,
        app: FastAPI,
        client: AsyncClient,
    ) -> None:
        users_service = UsersService(app.state._conn)
        new_user = UserCreate(
            email=EmailStr("mark@myapp.io"),
            username="mark",
            password="markmark",
        )
        res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user.dict()})
        assert res.status_code == HTTP_201_CREATED

        user_in_db = await users_service.get_user_by_email(email=new_user.email, get_db_data=True)  # type: ignore
        assert isinstance(user_in_db, GetUserRow)
        assert user_in_db is not None
        assert user_in_db.salt is not None
        assert user_in_db.password != new_user.password
        assert auth_service.verify_password(
            password=new_user.password,
            salt=user_in_db.salt,
            hashed_pw=user_in_db.password,
        )

        await app.state._conn.rollback()


class TestUserUpdate:
    @pytest.mark.parametrize(
        "attr, value, get_fixture",
        (
            ("old_password", "ValidPassword123", "test_user6"),
            ("email", "thisisanontakenemail@myapp.io", "test_user6"),
            ("username", "this_is_not_taken", "test_user7"),
        ),
        indirect=["get_fixture"],
    )
    async def test_user_can_update_self(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        get_fixture: GetUserRow,
        attr: str,
        value: str,
        request,
    ) -> None:

        authorized_client: AsyncClient = create_authorized_client(user=get_fixture)
        if attr == "old_password":
            hashed_password_and_salt = auth_service.create_salt_and_hashed_password(plaintext_password=value)
            hashed_password = hashed_password_and_salt.password
            salt = hashed_password_and_salt.salt
            res = await authorized_client.put(
                app.url_path_for("users:update-user-by-id"),
                json={
                    "user_update": UserUpdate(
                        password=hashed_password,
                        old_password=TEST_USERS["test_user6"].password,  # previous password should be sent alongside
                    ).dict()
                },
            )
        else:
            assert getattr(get_fixture, attr) != value
            res = await authorized_client.put(
                app.url_path_for("users:update-user-by-id"),
                json={"user_update": {attr: value}},
            )
        assert res.status_code == HTTP_200_OK
        user = UserPublic(**res.json())

        if attr == "old_password":
            assert auth_service.verify_password(password=value, salt=salt, hashed_pw=hashed_password)
        else:
            assert getattr(user, attr) == value

        await app.state._conn.rollback()

    @pytest.mark.parametrize(
        "attr, value, status_code",
        (
            ("password", "justapassword", HTTP_400_BAD_REQUEST),
            ("email", "notanemail.io", HTTP_422_UNPROCESSABLE_ENTITY),
            ("username", "sh", HTTP_422_UNPROCESSABLE_ENTITY),
        ),
    )
    async def test_user_receives_error_for_invalid_update_params(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user5: UserPublic,
        attr: str,
        value: str,
        status_code: int,
    ) -> None:
        authorized_client: AsyncClient = create_authorized_client(user=test_user5)
        res = await authorized_client.put(
            app.url_path_for("users:update-user-by-id"),
            json={"user_update": {attr: value}},
        )
        assert res.status_code == status_code

        await app.state._conn.rollback()

    async def test_user_can_update_multiple_params(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user5: UserPublic,
    ) -> None:

        assert "anewemail@myapp.com" not in [user.email for user in TEST_USERS.values()]
        assert "anewname" not in [user.username for user in TEST_USERS.values()]

        authorized_client: AsyncClient = create_authorized_client(user=test_user5)
        res = await authorized_client.put(
            app.url_path_for("users:update-user-by-id"),
            json={
                "user_update": UserUpdate(
                    password="somevalue",
                    old_password=TEST_USERS["test_user5"].password,
                    username="anewname",
                    email=EmailStr("anewemail@myapp.com"),
                ).dict(),
            },
        )
        assert res.status_code == HTTP_200_OK

        await app.state._conn.rollback()

    async def test_user_cannot_update_password_without_old_password(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user: UserPublic,
        test_user5: UserPublic,
    ) -> None:

        authorized_client: AsyncClient = create_authorized_client(user=test_user5)
        res = await authorized_client.put(
            app.url_path_for("users:update-user-by-id"),
            json={"user_update": {"password": "somevalue"}},
        )
        assert res.status_code == HTTP_400_BAD_REQUEST
        await app.state._conn.rollback()

    @pytest.mark.parametrize(
        "attr, value, status_code, exception",
        (
            (
                "email",
                TEST_USERS["test_user"].email,
                HTTP_409_CONFLICT,
                None,
            ),
            (
                "username",
                TEST_USERS["test_user"].username,
                HTTP_409_CONFLICT,
                None,
            ),
        ),
    )
    async def test_user_cannot_update_to_existing_username_or_email(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user5: UserPublic,
        attr: str,
        value: str,
        exception: Exception,
        status_code: int,
    ) -> None:

        authorized_client: AsyncClient = create_authorized_client(user=test_user5)

        res = await authorized_client.put(
            app.url_path_for("users:update-user-by-id"),
            json={
                "user_update": {
                    attr: value,
                }
            },
        )
        assert res.status_code == status_code

        await app.state._conn.rollback()


class TestAuthTokens:
    async def test_can_create_access_token_successfully(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
    ) -> None:

        access_token = auth_service.create_access_token_for_user(
            user=test_user,
            secret_key=str(UNIQUE_KEY),
            audience=JWT_AUDIENCE,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
        )
        assert access_token is not None

        creds = jwt.decode(
            access_token,
            str(UNIQUE_KEY),
            audience=JWT_AUDIENCE,
            algorithms=[JWT_ALGORITHM],
        )
        assert creds.get("username") is not None
        assert creds["username"] == test_user.username
        assert creds["aud"] == JWT_AUDIENCE

        await app.state._conn.rollback()

    async def test_token_missing_user_is_invalid(self, app: FastAPI, client: AsyncClient) -> None:

        access_token = auth_service.create_access_token_for_user(
            user=None,  # type: ignore
            secret_key=str(UNIQUE_KEY),
            audience=JWT_AUDIENCE,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
        )
        assert access_token is None
        with pytest.raises(jwt.PyJWTError):
            jwt.decode(access_token, str(UNIQUE_KEY), audience=JWT_AUDIENCE, algorithms=[JWT_ALGORITHM])  # type: ignore

        await app.state._conn.rollback()

    @pytest.mark.parametrize(
        "secret_key, jwt_audience, exception",
        (
            ("wrong-secret", JWT_AUDIENCE, jwt.InvalidSignatureError),
            (None, JWT_AUDIENCE, jwt.InvalidSignatureError),
            (UNIQUE_KEY, "othersite:auth", jwt.InvalidAudienceError),
            (UNIQUE_KEY, None, ValidationError),
        ),
    )
    async def test_invalid_token_content_raises_error(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
        secret_key: Optional[Union[str, Secret]],
        jwt_audience: str,
        exception: Type[Exception],
    ) -> None:

        with pytest.raises(exception):
            access_token = auth_service.create_access_token_for_user(
                user=test_user,
                secret_key=str(secret_key),
                audience=jwt_audience,
                expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
            )
            jwt.decode(access_token, str(UNIQUE_KEY), audience=JWT_AUDIENCE, algorithms=[JWT_ALGORITHM])  # type: ignore

        await app.state._conn.rollback()


class TestUserLogin:
    async def test_user_can_login_successfully_and_receives_valid_token(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
    ) -> None:

        client.headers["content-type"] = "application/x-www-form-urlencoded"
        login_data = {
            "username": test_user.email,
            "password": TEST_USERS["test_user"].password,
        }
        res = await client.post(app.url_path_for("users:login-email-and-password"), data=login_data)
        assert res.status_code == HTTP_200_OK

        token = res.json().get("access_token")
        creds = jwt.decode(token, str(UNIQUE_KEY), audience=JWT_AUDIENCE, algorithms=[JWT_ALGORITHM])
        assert "username" in creds
        assert creds["username"] == test_user.username
        assert "sub" in creds
        assert creds["sub"] == test_user.email

        assert "token_type" in res.json()
        assert res.json().get("token_type") == "bearer"

        await app.state._conn.rollback()

    @pytest.mark.parametrize(
        "credential, wrong_value, status_code",
        (
            ("email", "wrong@email.com", HTTP_401_UNAUTHORIZED),
            ("email", None, HTTP_422_UNPROCESSABLE_ENTITY),
            ("email", "notemail", HTTP_401_UNAUTHORIZED),
            ("password", "wrongpassword", HTTP_401_UNAUTHORIZED),
            ("password", None, HTTP_422_UNPROCESSABLE_ENTITY),
        ),
    )
    async def test_user_with_wrong_creds_doesnt_receive_token(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
        credential: str,
        wrong_value: str,
        status_code: int,
    ) -> None:

        client.headers["content-type"] = "application/x-www-form-urlencoded"
        user_data = test_user.dict()
        user_data["password"] = TEST_USERS["test_user"].password
        user_data[credential] = wrong_value
        login_data = {
            "username": user_data["email"],
            "password": user_data["password"],
        }

        res = await client.post(app.url_path_for("users:login-email-and-password"), data=login_data)
        assert res.status_code == status_code
        assert "access_token" not in res.json()

        await app.state._conn.rollback()

    async def test_can_retrieve_username_from_token(
        self, app: FastAPI, client: AsyncClient, test_user: UserPublic
    ) -> None:

        token = auth_service.create_access_token_for_user(user=test_user, secret_key=str(UNIQUE_KEY))
        username = auth_service.get_username_from_token(token=str(token), secret_key=str(UNIQUE_KEY))  # type: ignore
        assert username == test_user.username

        await app.state._conn.rollback()

    @pytest.mark.parametrize(
        "secret, wrong_token",
        (
            (UNIQUE_KEY, "asdf"),
            (UNIQUE_KEY, ""),
            (UNIQUE_KEY, None),
            ("ABC123", "use correct token"),
        ),
    )
    async def test_error_when_token_or_secret_is_wrong(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
        secret: Union[Secret, str],
        wrong_token: Optional[str],
    ) -> None:

        token = auth_service.create_access_token_for_user(user=test_user, secret_key=str(UNIQUE_KEY))
        if wrong_token == "use correct token":
            wrong_token = token
        with pytest.raises(HTTPException):
            username = auth_service.get_username_from_token(token=wrong_token, secret_key=str(secret))  # type: ignore

        await app.state._conn.rollback()


class TestUserMe:
    async def test_authenticated_user_can_retrieve_own_data(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: UserPublic,
    ) -> None:

        res = await authorized_client.get(app.url_path_for("users:get-current-user"))
        user = UserPublic(**res.json())
        assert res.status_code == HTTP_200_OK
        assert user.email == test_user.email
        assert user.username == test_user.username
        assert user.user_id == test_user.user_id

        await app.state._conn.rollback()

    async def test_user_cannot_access_own_data_if_not_authenticated(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
    ) -> None:

        res = await client.get(app.url_path_for("users:get-current-user"))
        assert res.status_code == HTTP_401_UNAUTHORIZED

        await app.state._conn.rollback()

    @pytest.mark.parametrize(
        "jwt_prefix",
        (
            ("",),
            ("value",),
            ("Token",),
            ("JWT",),
            ("Swearer",),
        ),
    )
    async def test_user_cannot_access_own_data_with_incorrect_jwt_prefix(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
        jwt_prefix: str,
    ) -> None:

        token = auth_service.create_access_token_for_user(user=test_user, secret_key=str(UNIQUE_KEY))
        res = await client.get(
            app.url_path_for("users:get-current-user"),
            headers={"Authorization": f"{jwt_prefix} {token}"},
        )
        assert res.status_code == HTTP_401_UNAUTHORIZED

        await app.state._conn.rollback()


class TestUserPasswordReset:
    async def test_user_cannot_request_password_reset_more_than_once(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
    ) -> None:

        password_reset_request = CreatePasswordResetRequestParams(
            email=test_user.email,
            message=f"Help {test_user.username}, please",
        )
        res = await client.post(
            app.url_path_for("users:request-password-reset"),
            json={"reset_request": password_reset_request.dict()},
        )
        assert res.status_code == HTTP_200_OK
        assert res.json()["email"] == password_reset_request.email
        assert res.json()["message"] == password_reset_request.message

        res = await client.post(
            app.url_path_for("users:request-password-reset"),
            json={"reset_request": password_reset_request.dict()},
        )
        assert res.status_code == HTTP_409_CONFLICT

        await app.state._conn.rollback()

    async def test_user_cannot_request_password_reset_for_unexistent_email(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
    ) -> None:

        password_reset_request = CreatePasswordResetRequestParams(
            email="imcertainthisdoesntexist@myapp.com", message="Help me"
        )
        res = await client.post(
            app.url_path_for("users:request-password-reset"),
            json={"reset_request": password_reset_request.dict()},
        )
        assert res.status_code == HTTP_404_NOT_FOUND

        await app.state._conn.rollback()
