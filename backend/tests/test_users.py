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
from pydantic import ValidationError
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

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_AUDIENCE,
    JWT_TOKEN_PREFIX,
    UNIQUE_KEY,
)
from app.db.repositories.users import (  # tests shouldnt know these exist -> bad implementation and tests; EmailAlreadyExistsError,; UserCreationError,; UsernameAlreadyExistsError,; UsersRepoException,
    UsersRepository,
)
from app.models.pwd_reset_req import (
    PasswordResetRequest,
    PasswordResetRequestCreate,
)
from app.models.token import JWTCreds, JWTMeta, JWTPayload
from app.models.user import UserCreate, UserInDB, UserPublic
from app.services import auth_service
from tests.conftest import TEST_USERS, test_user6

pytestmark = pytest.mark.asyncio


class TestUserRoutes:
    async def test_routes_exist(self, app: FastAPI, client: AsyncClient) -> None:
        new_user = {
            "email": "test@email.io",
            "username": "test_username",
            "password": "testpassword",
        }

        res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user})
        assert res.status_code != HTTP_404_NOT_FOUND

    async def test_only_verified_user_can_access_profile(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_unverified_user: UserInDB,
        test_user: UserPublic,
    ) -> None:
        authorized_client_unverified: AsyncClient = create_authorized_client(user=test_unverified_user)
        res = await authorized_client_unverified.get(app.url_path_for("users:get-current-user"))
        assert res.status_code == HTTP_403_FORBIDDEN

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
    async def test_users_can_register_successfully(
        self,
        app: FastAPI,
        client: AsyncClient,
        db: Database,
    ) -> None:
        user_repo = UsersRepository(db)
        new_user = {
            "email": "shakira@shakira.io",
            "username": "shakirashakira",
            "password": "chantaje",
        }
        assert new_user["email"] not in [user.email for user in TEST_USERS.values()]
        assert new_user["username"] not in [user.username for user in TEST_USERS.values()]
        # make sure user doesn't exist yet
        user_in_db = await user_repo.get_user_by_email(email=new_user["email"])  # type: ignore
        assert user_in_db is None
        # send post request to create user and ensure it is successful
        res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user})
        assert res.status_code == HTTP_201_CREATED
        # ensure that the user now exists in the db
        # [R1] requires populate to keep the same behavior we were expecting before.
        user_in_db = await user_repo.get_user_by_email(email=new_user["email"], to_public=False)  # type: ignore

        assert user_in_db is not None
        assert user_in_db.email == new_user["email"]
        assert user_in_db.username == new_user["username"]

        # check that the user returned in the response is equal to the user in the database
        # [R1] we need to also exclude the profile here
        created_user = UserPublic(**res.json()).dict(exclude={"access_token", "profile"})

        assert created_user == user_in_db.dict(exclude={"password", "salt"})

    @pytest.mark.parametrize(
        "attr, value, status_code, exception",
        (
            (
                "email",
                TEST_USERS["test_user"].email,
                HTTP_409_CONFLICT,
                None,
            ),  # it should NOT raise anything
            (
                "username",
                TEST_USERS["test_user"].username,
                HTTP_409_CONFLICT,
                None,
            ),  # it should NOT raise anything
            (
                "email",
                "invalid_email@one@two.io",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),  # handled by fastapi-pydantic
            (
                "password",
                "short",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),  # handled by fastapi-pydantic
            (
                "username",
                "shakira@#$%^<>",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),  # handled by fastapi-pydantic
            (
                "username",
                "ab",
                HTTP_422_UNPROCESSABLE_ENTITY,
                None,
            ),  # handled by fastapi-pydantic
        ),
    )
    async def test_user_registration_fail_with_taken_or_invalid_credentials(
        self,
        app: FastAPI,
        client: AsyncClient,
        attr: str,
        value: str,
        exception: Type[Exception],
        test_user: UserPublic,  # make sure our boy is registered first!
        status_code: int,
    ) -> None:
        new_user = {
            "email": "nottaken@email.io",
            "username": "not_taken_username",
            "password": "freepassword",
        }
        assert new_user["email"] not in [user.email for user in TEST_USERS.values()]
        assert new_user["username"] not in [user.username for user in TEST_USERS.values()]
        # check parametrized taken usernames or emails as well as invalid password
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

    async def test_users_saved_password_is_hashed_and_has_salt(
        self,
        app: FastAPI,
        client: AsyncClient,
        db: Database,
    ) -> None:
        user_repo = UsersRepository(db)
        new_user = {
            "email": "beyonce@knowles.io",
            "username": "queenbey",
            "password": "destinyschild",
        }
        # send post request to create user and ensure it is successful
        res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user})
        assert res.status_code == HTTP_201_CREATED

        # ensure that the users password is hashed in the db
        # and that we can verify it using our auth service
        # [R1] add populate here as well to keep the same behavior we were expecting before.
        user_in_db = await user_repo.get_user_by_email(email=new_user["email"], to_public=False)  # type: ignore
        assert isinstance(user_in_db, UserInDB)
        assert user_in_db is not None
        assert user_in_db.salt is not None
        assert user_in_db.password != new_user["password"]
        assert auth_service.verify_password(
            password=new_user["password"],
            salt=user_in_db.salt,
            hashed_pw=user_in_db.password,
        )


# ? do not use request.getfixturevalue, create a fixture
# ? that returns another fixture and use indirect on it
class TestUserUpdate:
    @pytest.mark.parametrize(
        "attr, value, user_fixture",
        (
            ("old_password", "ValidPassword123", "test_user6"),
            ("email", "thisisanontakenemail@me.io", "test_user6"),
            # TODO this is probably not the reason
            # if we use test_user6 again, it attempts to create it because
            # user_fixture_helper makes use of get_user_by_email and sees no
            # user matching the email we just changed
            ("username", "this_is_not_taken", "test_user7"),
        ),
        indirect=["user_fixture"],
    )
    async def test_user_can_update_self(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        user_fixture: UserInDB,
        attr: str,
        value: str,
        request,
    ) -> None:
        # authorized_client fixture only authorizes test_user, no one else, so we need to create it ourselves
        authorized_client: AsyncClient = create_authorized_client(user=user_fixture)

        # to update from a plaintext "password", get the salt and hashed password
        print("\n\nattr is ", attr)
        if attr == "old_password":
            hashed_password_and_salt = auth_service.create_salt_and_hashed_password(plaintext_password=value)
            hashed_password = hashed_password_and_salt.password
            salt = hashed_password_and_salt.salt
            res = await authorized_client.put(
                app.url_path_for("users:update-user-by-id"),
                json={
                    "user_update": {
                        "password": hashed_password,
                        "salt": salt,
                        "old_password": TEST_USERS["test_user6"].password,  # previous password should be sent alongside
                    }
                },
            )
        else:
            assert getattr(user_fixture, attr) != value
            res = await authorized_client.put(
                app.url_path_for("users:update-user-by-id"),
                json={"user_update": {attr: value}},
            )
        print("For ", attr, "we have:")
        print(res.json())
        assert res.status_code == HTTP_200_OK
        user = UserPublic(**res.json())

        if attr == "old_password":
            assert auth_service.verify_password(password=value, salt=salt, hashed_pw=hashed_password)
        else:
            assert getattr(user, attr) == value

    @pytest.mark.parametrize(
        "attr, value, status_code",
        (
            ("password", "short", HTTP_400_BAD_REQUEST),  # requires old_password
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

    async def test_user_can_update_multiple_params(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user5: UserPublic,
    ) -> None:
        assert "anewemail@mail.com" not in [user.email for user in TEST_USERS.values()]
        assert "anewname" not in [user.username for user in TEST_USERS.values()]

        authorized_client: AsyncClient = create_authorized_client(user=test_user5)
        res = await authorized_client.put(
            app.url_path_for("users:update-user-by-id"),
            json={
                "user_update": {
                    "password": "value",
                    "old_password": TEST_USERS["test_user5"].password,
                    "username": "anewname",
                    "email": "anewemail@mail.com",
                }
            },
        )
        assert res.status_code == HTTP_200_OK

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
            json={"user_update": {"password": "value"}},
        )
        assert res.status_code == HTTP_400_BAD_REQUEST

    @pytest.mark.parametrize(
        "attr, value, status_code, exception",
        (
            (
                "email",
                TEST_USERS["test_user"].email,
                HTTP_409_CONFLICT,
                None,
            ),  # no exception from the repo layer should arise
            (
                "username",
                TEST_USERS["test_user"].username,
                HTTP_409_CONFLICT,
                None,
            ),  # no exception from the repo layer should arise
        ),
    )
    async def test_user_cannot_update_to_existing_username_or_email(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user5: UserPublic,
        attr: str,
        value: str,
        exception: Type[Exception],
        status_code: int,
    ) -> None:

        authorized_client: AsyncClient = create_authorized_client(user=test_user5)
        # with pytest.raises(exception):
        res = await authorized_client.put(
            app.url_path_for("users:update-user-by-id"),
            json={
                "user_update": {
                    attr: value,
                }
            },
        )
        assert res.status_code == status_code


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


class TestUserLogin:
    async def test_user_can_login_successfully_and_receives_valid_token(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
    ) -> None:
        # we receive form data, not json -> edit content-type accordingly
        client.headers["content-type"] = "application/x-www-form-urlencoded"
        login_data = {
            "username": test_user.email,
            "password": TEST_USERS["test_user"].password,  # insert user's plaintext password
        }
        res = await client.post(app.url_path_for("users:login-email-and-password"), data=login_data)
        assert res.status_code == HTTP_200_OK
        # check that token exists in response and has user encoded within it
        token = res.json().get("access_token")
        creds = jwt.decode(token, str(UNIQUE_KEY), audience=JWT_AUDIENCE, algorithms=[JWT_ALGORITHM])
        assert "username" in creds
        assert creds["username"] == test_user.username
        assert "sub" in creds
        assert creds["sub"] == test_user.email
        # check that token is proper type
        assert "token_type" in res.json()
        assert res.json().get("token_type") == "bearer"

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
        user_data["password"] = TEST_USERS["test_user"].password  # insert user's plaintext password
        user_data[credential] = wrong_value
        login_data = {
            "username": user_data["email"],
            "password": user_data["password"],  # insert password from parameters
        }
        # we use data instead of json as parameter with our httpx client,
        # This is how httpx expects form data to be sent in our client.
        res = await client.post(app.url_path_for("users:login-email-and-password"), data=login_data)
        assert res.status_code == status_code
        assert "access_token" not in res.json()

    async def test_can_retrieve_username_from_token(
        self, app: FastAPI, client: AsyncClient, test_user: UserPublic
    ) -> None:
        token = auth_service.create_access_token_for_user(user=test_user, secret_key=str(UNIQUE_KEY))
        username = auth_service.get_username_from_token(token=token, secret_key=str(UNIQUE_KEY))  # type: ignore
        assert username == test_user.username

    @pytest.mark.parametrize(
        "secret, wrong_token",
        (
            (UNIQUE_KEY, "asdf"),  # use wrong token
            (UNIQUE_KEY, ""),  # use wrong token
            (UNIQUE_KEY, None),  # use wrong token
            ("ABC123", "use correct token"),  # use wrong secret
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


class TestUserMe:
    async def test_authenticated_user_can_retrieve_own_data(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: UserPublic,
    ) -> None:
        res = await authorized_client.get(app.url_path_for("users:get-current-user"))
        assert res.status_code == HTTP_200_OK
        user = UserPublic(**res.json())
        assert user.email == test_user.email
        assert user.username == test_user.username
        assert user.id == test_user.id

    async def test_user_cannot_access_own_data_if_not_authenticated(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserPublic,
    ) -> None:
        res = await client.get(app.url_path_for("users:get-current-user"))
        assert res.status_code == HTTP_401_UNAUTHORIZED

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


# No emailing service available. Otherwise better solutions are possible
class TestUserPasswordReset:
    async def test_user_cannot_request_password_reset_more_than_once(
        self, app: FastAPI, client: AsyncClient, test_user: UserPublic
    ) -> None:
        pwd_reset_req = PasswordResetRequestCreate(
            email=test_user.email,
            message=f"Help {test_user.username}, please",
        )
        res = await client.post(
            app.url_path_for("users:request-password-reset"),
            json={"password_request": pwd_reset_req.dict()},
        )
        assert res.status_code == HTTP_200_OK
        assert res.json()["email"] == pwd_reset_req.email
        assert res.json()["message"] == pwd_reset_req.message
        res = await client.post(
            app.url_path_for("users:request-password-reset"),
            json={"password_request": pwd_reset_req.dict()},
        )
        assert res.status_code == HTTP_409_CONFLICT

    async def test_user_cannot_request_password_reset_for_unexistent_email(
        self, app: FastAPI, client: AsyncClient, test_user: UserPublic
    ) -> None:
        pwd_reset_req = PasswordResetRequestCreate(email="imcertainthisdoesntexist@mail.com", message="Help me")
        res = await client.post(
            app.url_path_for("users:request-password-reset"),
            json={"password_request": pwd_reset_req.dict()},
        )
        assert res.status_code == HTTP_404_NOT_FOUND
