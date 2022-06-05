import json
import re
from contextlib import _AsyncGeneratorContextManager
from datetime import datetime, timedelta
from typing import Callable, Dict, Set, cast

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient, Response
from loguru import logger
from sqlalchemy import text

from app.api.routes.admin import router as admin_router
from app.db.gen.queries import models
from app.db.gen.queries.global_notifications import (
    CreateGlobalNotificationParams,
)
from app.db.gen.queries.models import PasswordResetRequest, Role
from app.db.gen.queries.password_reset_requests import (
    CreatePasswordResetRequestParams,
)
from app.db.gen.queries.personal_notifications import (
    CreatePersonalNotificationParams,
)
from app.db.gen.queries.users import GetUserRow, RegisterNewUserRow
from app.models.user import RoleUpdate
from app.services.global_notifications import GlobalNotificationsService
from app.services.personal_notifications import PersonalNotificationsService
from app.services.users import UsersService
from tests.conftest import TEST_USERS

pytestmark = pytest.mark.asyncio


def parse_jsons(res: bytes) -> list[Dict]:
    s = res.decode("utf-8").strip()
    jsons = []
    start, end = s.find("{"), s.find("}")
    while True:
        try:
            jsons.append(json.loads(s[start : end + 1]))
        except ValueError:
            end = end + 1 + s[end + 1 :].find("}")
        else:
            s = s[end + 1 :]
            if not s:
                break
            start, end = s.find("{"), s.find("}")
    return jsons


ROUTES = [(route.name, route.methods, route.path) for route in admin_router.routes]  # type: ignore


class TestAdminRoutes:
    @pytest.mark.parametrize(
        "valid_status_codes, get_fixture",
        (
            ([status.HTTP_401_UNAUTHORIZED], "client"),
            ([status.HTTP_403_FORBIDDEN], "authorized_client"),
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


class TestAdminUserlistAccess:
    async def test_admin_can_list_all_existing_users(
        self,
        app: FastAPI,
        superuser_client: AsyncClient,
        test_user: RegisterNewUserRow,
    ) -> None:
        res = await superuser_client.get(
            app.url_path_for("admin:list-users"),
        )
        users = [models.User(**user) for user in res.json()]
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == 2
        assert test_user.user_id in [user.user_id for user in users]

        await app.state._conn.rollback()


class TestAdminUserModification:
    async def test_admin_can_verify_users(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_unverified_user: RegisterNewUserRow,
        test_unverified_user2: RegisterNewUserRow,
        test_admin_user: RegisterNewUserRow,
    ) -> None:
        res = await superuser_client.get(app.url_path_for("admin:list-unverified-users"))
        unverified_user_emails = [models.User(**user).email for user in res.json()]
        assert res.status_code == status.HTTP_200_OK
        assert len(unverified_user_emails) == 2  # number of unverified fixtures used

        res = await superuser_client.post(
            app.url_path_for("admin:verify-users-by-email"),
            json={"user_emails": unverified_user_emails},
        )
        assert res.status_code == status.HTTP_204_NO_CONTENT

        res = await superuser_client.get(app.url_path_for("admin:list-unverified-users"))
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == 0

        await app.state._conn.rollback()

    async def test_admin_has_access_to_password_reset_requests(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_user7: RegisterNewUserRow,
        test_user6: RegisterNewUserRow,
        test_admin_user: RegisterNewUserRow,
    ) -> None:
        for test_user in (test_user6, test_user7):
            test_user_client: AsyncClient = create_authorized_client(user=test_user)
            password_reset_request = CreatePasswordResetRequestParams(
                email=test_user.email,
                message=f"Help {test_user.username}, please",
            )
            # actually any client can request it since the user won't know its own password
            await test_user_client.post(
                app.url_path_for("users:request-password-reset"),
                json={"reset_request": password_reset_request.dict()},
            )

        res = await superuser_client.get(app.url_path_for("admin:list-password-request-users"))
        pwd_request_emails = [PasswordResetRequest(**user).email for user in res.json()]
        assert res.status_code == status.HTTP_200_OK
        assert len(pwd_request_emails) == 2  # number of unverified fixtures used

        for test_user in (test_user6, test_user7):
            res = await superuser_client.post(
                app.url_path_for("admin:reset-user-password-by-email"),
                json={"email": test_user.email},
            )
            new_pwd = res.json()
            previous_pwd = TEST_USERS[test_user.username].password  # type: ignore
            assert res.status_code == status.HTTP_200_OK
            assert new_pwd != previous_pwd

            test_user_client: AsyncClient = create_authorized_client(user=test_user)  # type: ignore
            test_user_client.headers["content-type"] = "application/x-www-form-urlencoded"
            login_data = {
                "username": test_user.email,
                "password": new_pwd,
            }
            res = await test_user_client.post(app.url_path_for("users:login-email-and-password"), data=login_data)
            assert res.status_code == status.HTTP_200_OK

        await app.state._conn.rollback()

    async def test_admin_cannot_reset_password_with_bad_email(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_2_client: AsyncClient,
    ) -> None:
        res = await superuser_client.post(
            app.url_path_for("admin:reset-user-password-by-email"),
            json={"email": "unexistent@myapp.com"},
        )
        assert res.status_code != status.HTTP_200_OK

        res = await superuser_client.post(
            app.url_path_for("admin:reset-user-password-by-email"),
        )
        assert res.status_code != status.HTTP_200_OK

        await app.state._conn.rollback()

    async def test_admin_can_delete_a_user_password_reset_request(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_user: RegisterNewUserRow,
    ) -> None:
        password_reset_request = CreatePasswordResetRequestParams(
            email=test_user.email,
            message=f"Help {test_user.username}, please",
        )
        res = await superuser_client.post(
            app.url_path_for("users:request-password-reset"),
            json={"reset_request": password_reset_request.dict()},
        )
        request_id = res.json()["password_reset_request_id"]
        res = await superuser_client.delete(app.url_path_for("admin:delete-password-reset-request", id=request_id))
        assert res.status_code == status.HTTP_200_OK

        res = await superuser_client.get(app.url_path_for("admin:list-password-request-users"))
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == 0

        await app.state._conn.rollback()

    async def test_admin_can_change_a_user_role(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        superuser_client: AsyncClient,
        test_user7: RegisterNewUserRow,
    ) -> None:
        users_service = UsersService(app.state._conn)
        role_update = RoleUpdate(
            role=Role.MANAGER,
            email=test_user7.email,
        )
        res = await superuser_client.put(
            app.url_path_for("admin:update-user-role"),
            json={"role_update": role_update.dict()},
        )
        assert res.status_code == status.HTTP_200_OK

        updated_user = await users_service.get_user_by_email(email=role_update.email)
        assert cast(GetUserRow, updated_user).role == "manager"

        await app.state._conn.rollback()


class TestAdminGlobalNotifications:
    _n_notifications = 11

    async def test_admin_can_create_global_notifications(
        self,
        app: FastAPI,
        # create_authorized_client: Callable,
        # authorized_client: AsyncClient,
        superuser_client: AsyncClient,
        test_admin_user: RegisterNewUserRow,
        authorized_client: AsyncClient,
        # test_user: RegisterNewUserRow,
    ) -> None:

        gn_service = GlobalNotificationsService(app.state._conn)

        for i in range(self._n_notifications):
            notification = CreateGlobalNotificationParams(
                sender=test_admin_user.email,
                receiver_role=Role.USER,
                title=f"Test notification {i}",
                body=f"This is test notification {i}",
                label=f"Test label {i}",
                link=None,
            )
            res = await superuser_client.post(
                app.url_path_for("admin:create-global-notification"),
                json={"notification": notification.dict()},
            )
            assert res.status_code == status.HTTP_201_CREATED

        query = f"SELECT COUNT(*) FROM global_notifications WHERE receiver_role = '{Role.USER.value}'"
        n_notifications = (await app.state._conn.execute(text(query))).scalar()
        assert n_notifications == self._n_notifications

        await app.state._conn.commit()

        query = f"""
            SELECT global_notification_id
            FROM global_notifications
            WHERE receiver_role = '{Role.USER.value}'
            ORDER BY global_notification_id DESC
            LIMIT 1
        """
        notification_id = (await app.state._conn.execute(text(query))).fetchone()[0]
        assert notification_id is not None

        res = await superuser_client.delete(
            app.url_path_for("admin:delete-global-notification", id=notification_id),
        )
        assert res.status_code == status.HTTP_204_NO_CONTENT

        query = f"SELECT COUNT(*) FROM global_notifications WHERE receiver_role = '{Role.USER.value}'"
        n_notifications = (await app.state._conn.execute(text(query))).scalar()
        assert n_notifications == self._n_notifications - 1

        await app.state._conn.rollback()

        # in the event transaction rollback is not working again this should fail
        query = f"SELECT COUNT(*) FROM global_notifications WHERE receiver_role = '{Role.USER.value}'"
        n_notifications = (await app.state._conn.execute(text(query))).scalar()
        assert n_notifications == self._n_notifications

        await app.state._conn.commit()

        async def __fetch_stream(
            max_messages,
            stream_ctx_manager: _AsyncGeneratorContextManager[Response],
            expected_response,
        ):
            async with stream_ctx_manager as response:
                assert response.status_code == status.HTTP_200_OK
                assert "text/event-stream" in response.headers["Content-Type"]
                res = await response.aread()
                jsons = parse_jsons(res)
                logger.critical(f"jsons: {jsons}")
                assert len(jsons) == max_messages
                res_last_message = jsons[-1]
                assert res_last_message["has_new_global_notifications"] == expected_response

        import app.api.routes.sse as sse

        sse.MESSAGE_STREAM_DELAY = 0.2

        token = authorized_client.headers.get("Authorization").split(" ")[1]
        max_messages = 3
        url_path = app.url_path_for("sse:notifications-stream")
        async_gen_ctx_manager = authorized_client.stream(
            "get",
            url_path,
            params={"token": token, "max_messages": max_messages},
        )

        # user receives a new notification alert
        await __fetch_stream(max_messages, async_gen_ctx_manager, "true")

        # user can fetch all unread notifications
        res = await authorized_client.get(
            app.url_path_for("users:get-global-notifications"), params={"page_chunk_size": 50}
        )
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == self._n_notifications
        # user does not receive a has new notification alert for old notifications
        async_gen_ctx_manager = authorized_client.stream(
            "get",
            url_path,
            params={"token": token, "max_messages": max_messages},
        )
        await __fetch_stream(max_messages, async_gen_ctx_manager, "false")
        await app.state._conn.commit()

        # user can fetch notifications even if they're read
        res = await authorized_client.get(
            app.url_path_for("users:get-global-notifications"), params={"page_chunk_size": 5}
        )
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == 5

        await app.state._conn.commit()

    @pytest.mark.timeout(25)
    async def test_user_does_not_see_global_notifications_out_of_role_scope(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        authorized_client: AsyncClient,
        superuser_client: AsyncClient,
        test_admin_user: RegisterNewUserRow,
        test_user: RegisterNewUserRow,
    ) -> None:
        notification = CreateGlobalNotificationParams(
            sender=test_admin_user.email,
            receiver_role=Role.MANAGER,
            title="Test notification for manager",
            body="Manager info",
            label="Test label",
            link="https://www.google.com",
        )
        await superuser_client.post(
            app.url_path_for("admin:create-global-notification"),
            json={"notification": notification.dict()},
        )

        import app.api.routes.sse as sse

        sse.MESSAGE_STREAM_DELAY = 0.1

        token = authorized_client.headers.get("Authorization").split(" ")[1]
        max_messages = 2
        url_path = app.url_path_for("sse:notifications-stream")

        async_gen_ctx_manager = authorized_client.stream(
            "get",
            url_path,
            params={"token": token, "max_messages": max_messages},
        )
        async with async_gen_ctx_manager as response:
            assert response.status_code == status.HTTP_200_OK
            assert "text/event-stream" in response.headers["Content-Type"]
            res = await response.aread()
            # b'{"id": "user@myapp.com-2022-03-19T19:11:53.597102", "has_new_global_notifications": "false"}{"id": "user@myapp.com-2022-03-19T19:11:54.703096", "has_new_global_notifications": "false"}'
            jsons = parse_jsons(res)
            res_last_message = jsons[-1]
            assert res_last_message["has_new_global_notifications"] == "false"

        await app.state._conn.commit()

    async def test_user_can_arbitrarily_fetch_global_notification_feed_by_date(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: RegisterNewUserRow,
    ) -> None:
        # all have same create date up until ns, must update:
        for i in range(self._n_notifications):
            await app.state._conn.execute(
                text(
                    f"""
                UPDATE global_notifications
                SET created_at = created_at - interval '{i+1} hour',
                    updated_at = updated_at - interval '{i+1} hour'
                WHERE global_notification_id = {i}
                """
                )
            )

        # TODO server side cursor worth it?
        gn_service = GlobalNotificationsService(app.state._conn)
        res = await authorized_client.get(
            app.url_path_for("users:get-global-notifications"),
        )
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == gn_service.page_chunk_size

        page_chunk_size = 3
        total_feed_items_to_fetch = 9
        assert total_feed_items_to_fetch % page_chunk_size == 0
        assert self._n_notifications > total_feed_items_to_fetch

        starting_date = str(datetime.now() + timedelta(minutes=10))
        combos: list[Set[str]] = []
        for _ in range(total_feed_items_to_fetch // page_chunk_size):
            logger.critical(f"starting_date: {starting_date}")
            res = await authorized_client.get(
                app.url_path_for("users:get-global-notifications"),
                params={"starting_date": starting_date, "page_chunk_size": page_chunk_size},
            )
            paginated_json = res.json()
            id_and_event_combo = set(
                f"{item['global_notification_id']}-{item['event_type']}" for item in paginated_json
            )
            combos.append(id_and_event_combo)
            starting_date = paginated_json[-1]["event_timestamp"]
            assert res.status_code == status.HTTP_200_OK
            assert len(paginated_json) <= page_chunk_size

        length_of_all_id_combos = sum(len(combo) for combo in combos)
        id_set: Set[str] = set.union(*combos)
        assert len(id_set) == length_of_all_id_combos
        assert len(id_set) == total_feed_items_to_fetch

        await app.state._conn.rollback()


class TestAdminPersonalNotifications:
    _n_notifications = 11

    async def test_admin_can_create_and_delete_personal_notifications(
        self,
        app: FastAPI,
        # create_authorized_client: Callable,
        # authorized_client: AsyncClient,
        superuser_client: AsyncClient,
        test_admin_user: RegisterNewUserRow,
        test_user: RegisterNewUserRow,
        authorized_client: AsyncClient,
        # test_user: RegisterNewUserRow,
    ) -> None:

        for i in range(self._n_notifications):
            notification = CreatePersonalNotificationParams(
                sender=test_admin_user.email,
                receiver_email=test_user.email,
                title=f"Test notification {i}",
                body=f"This is test notification {i}",
                label=f"Test label {i}",
                link=None,
            )
            res = await superuser_client.post(
                app.url_path_for("users:create-personal-notification"),
                json={"notification": notification.dict()},
            )
            assert res.status_code == status.HTTP_201_CREATED

        query = f"SELECT COUNT(*) FROM personal_notifications WHERE receiver_email= '{test_user.email}'"
        n_notifications = (await app.state._conn.execute(text(query))).scalar()
        assert n_notifications == self._n_notifications

        await app.state._conn.commit()

        query = f"""
            SELECT personal_notification_id
            FROM personal_notifications
            WHERE receiver_email = '{test_user.email}'
            ORDER BY personal_notification_id DESC
            LIMIT 1
        """
        notification_id = (await app.state._conn.execute(text(query))).fetchone()[0]
        assert notification_id is not None

        res = await authorized_client.delete(
            app.url_path_for("users:delete-personal-notification", id=notification_id),
        )
        assert res.status_code == status.HTTP_403_FORBIDDEN

        res = await superuser_client.delete(
            app.url_path_for("users:delete-personal-notification", id=notification_id),
        )
        assert res.status_code == status.HTTP_204_NO_CONTENT

        query = f"SELECT COUNT(*) FROM personal_notifications WHERE receiver_email= '{test_user.email}'"
        n_notifications = (await app.state._conn.execute(text(query))).scalar()
        assert n_notifications == self._n_notifications - 1

        await app.state._conn.rollback()

        # in the event transaction rollback is not working again this should fail
        query = f"SELECT COUNT(*) FROM personal_notifications WHERE receiver_email= '{test_user.email}'"
        n_notifications = (await app.state._conn.execute(text(query))).scalar()
        assert n_notifications == self._n_notifications

        await app.state._conn.commit()

        async def __fetch_stream(
            max_messages,
            stream_ctx_manager: _AsyncGeneratorContextManager[Response],
            expected_response,
        ):
            async with stream_ctx_manager as response:
                assert response.status_code == status.HTTP_200_OK
                assert "text/event-stream" in response.headers["Content-Type"]
                res = await response.aread()
                jsons = parse_jsons(res)
                logger.critical(f"jsons: {jsons}")
                assert len(jsons) == max_messages
                res_last_message = jsons[-1]
                assert res_last_message["has_new_personal_notifications"] == expected_response

        import app.api.routes.sse as sse

        sse.MESSAGE_STREAM_DELAY = 0.2

        token = authorized_client.headers.get("Authorization").split(" ")[1]
        max_messages = 3
        url_path = app.url_path_for("sse:notifications-stream")
        async_gen_ctx_manager = authorized_client.stream(
            "get",
            url_path,
            params={"token": token, "max_messages": max_messages},
        )

        # user receives a new notification alert
        await __fetch_stream(max_messages, async_gen_ctx_manager, "true")

        # user can fetch all unread notifications
        res = await authorized_client.get(
            app.url_path_for("users:get-personal-notifications"), params={"page_chunk_size": 50}
        )
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == self._n_notifications
        # user does not receive a has new notification alert for old notifications
        async_gen_ctx_manager = authorized_client.stream(
            "get",
            url_path,
            params={"token": token, "max_messages": max_messages},
        )
        await __fetch_stream(max_messages, async_gen_ctx_manager, "false")
        await app.state._conn.commit()

        # user can fetch notifications even if they're read
        res = await authorized_client.get(
            app.url_path_for("users:get-personal-notifications"), params={"page_chunk_size": 5}
        )
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == 5

        await app.state._conn.commit()

    @pytest.mark.timeout(25)
    async def test_user_cannot_not_see_external_personal_notifications(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        authorized_client: AsyncClient,
        superuser_client: AsyncClient,
        test_admin_user: RegisterNewUserRow,
        test_user: RegisterNewUserRow,
    ) -> None:
        notification = CreatePersonalNotificationParams(
            sender=test_admin_user.email,
            receiver_email=test_user.email,
            title="Test notification for manager",
            body="Manager info",
            label="Test label",
            link="https://www.google.com",
        )
        await superuser_client.post(
            app.url_path_for("users:create-personal-notification"),
            json={"notification": notification.dict()},
        )

        import app.api.routes.sse as sse

        sse.MESSAGE_STREAM_DELAY = 0.1

        token = authorized_client.headers.get("Authorization").split(" ")[1]
        max_messages = 2
        url_path = app.url_path_for("sse:notifications-stream")

        async_gen_ctx_manager = authorized_client.stream(
            "get",
            url_path,
            params={"token": token, "max_messages": max_messages},
        )
        async with async_gen_ctx_manager as response:
            assert response.status_code == status.HTTP_200_OK
            assert "text/event-stream" in response.headers["Content-Type"]
            res = await response.aread()
            # b'{"id": "user@myapp.com-2022-03-19T19:11:53.597102", "has_new_personal_notifications": "false"}{"id": "user@myapp.com-2022-03-19T19:11:54.703096", "has_new_personal_notifications": "false"}'
            jsons = parse_jsons(res)
            res_last_message = jsons[-1]
            assert res_last_message["has_new_personal_notifications"] == "false"

        await app.state._conn.commit()

    async def test_user_can_arbitrarily_fetch_personal_notification_feed_by_date(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: RegisterNewUserRow,
    ) -> None:
        # all have same create date up until ns, must update:
        for i in range(self._n_notifications):
            await app.state._conn.execute(
                text(
                    f"""
                UPDATE personal_notifications
                SET created_at = created_at - interval '{i+1} hour',
                    updated_at = updated_at - interval '{i+1} hour'
                WHERE personal_notification_id = {i}
                """
                )
            )

        # TODO server side cursor worth it?
        pn_service = PersonalNotificationsService(app.state._conn)
        res = await authorized_client.get(
            app.url_path_for("users:get-personal-notifications"),
        )
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()) == pn_service.page_chunk_size

        page_chunk_size = 3
        total_feed_items_to_fetch = 9
        assert total_feed_items_to_fetch % page_chunk_size == 0
        assert self._n_notifications > total_feed_items_to_fetch

        starting_date = str(datetime.now() + timedelta(minutes=10))
        combos: list[Set[str]] = []
        for _ in range(total_feed_items_to_fetch // page_chunk_size):
            logger.critical(f"starting_date: {starting_date}")
            res = await authorized_client.get(
                app.url_path_for("users:get-personal-notifications"),
                params={"starting_date": starting_date, "page_chunk_size": page_chunk_size},
            )
            paginated_json = res.json()
            id_and_event_combo = set(
                f"{item['personal_notification_id']}-{item['event_type']}" for item in paginated_json
            )
            combos.append(id_and_event_combo)
            starting_date = paginated_json[-1]["event_timestamp"]
            assert res.status_code == status.HTTP_200_OK
            assert len(paginated_json) <= page_chunk_size

        length_of_all_id_combos = sum(len(combo) for combo in combos)
        id_set: Set[str] = set.union(*combos)
        assert len(id_set) == length_of_all_id_combos
        assert len(id_set) == total_feed_items_to_fetch

        await app.state._conn.rollback()
