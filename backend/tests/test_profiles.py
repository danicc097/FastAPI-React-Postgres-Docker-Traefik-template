import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

from app.db.gen.queries.models import Profile
from app.models.user import GetUserRow
from app.services.profiles import ProfilesService

pytestmark = pytest.mark.asyncio


class TestProfilesRoutes:
    async def test_profile_created_for_new_users(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_admin_user,
    ) -> None:

        profiles_repo = ProfilesService(app.state._conn)
        new_user = {
            "email": "dwayne@myapp.io",
            "username": "therock",
            "password": "dwaynetherockjohnson",
        }
        res = await client.post(app.url_path_for("users:register-new-user"), json={"new_user": new_user})
        assert res.status_code == HTTP_201_CREATED
        created_user = GetUserRow(**res.json())
        user_profile = await profiles_repo.get_profile_by_user_id(user_id=created_user.user_id)
        assert user_profile is not None
        assert isinstance(user_profile, Profile)
        await app.state._conn.commit()


# not really worth it
# class TestProfileView:
#     async def test_authenticated_user_can_view_other_users_profile(
#         self,
#         app: FastAPI,
#         authorized_client: AsyncClient,
#         test_user: GetUserRow ,
#         test_user2: GetUserRow ,
#     ) -> None:
#         """
#         Check if test_user (authorized by fixture authorized_client) can access the profile of test_user2.
#         """
#         res = await authorized_client.get(
#             app.url_path_for("profiles:get-profile-by-username", username=test_user2.username)  # type: ignore
#         )
#         assert res.status_code == HTTP_200_OK
#         profile = ProfilePublic(**res.json())
#         assert profile.username == test_user2.username

#     async def test_unregistered_users_cannot_access_other_users_profile(
#         self, app: FastAPI, client: AsyncClient, test_user2: GetUserRow
#     ) -> None:
#         res = await client.get(app.url_path_for("profiles:get-profile-by-username", username=test_user2.username))  # type: ignore
#         assert res.status_code == HTTP_401_UNAUTHORIZED  # authentication scope

#     async def test_no_profile_is_returned_when_username_matches_no_user(
#         self, app: FastAPI, authorized_client: AsyncClient
#     ) -> None:
#         res = await authorized_client.get(
#             app.url_path_for("profiles:get-profile-by-username", username="username_doesnt_match")
#         )
#         assert res.status_code == HTTP_404_NOT_FOUND


class TestProfileManagement:
    @pytest.mark.parametrize(
        "attr, value",
        (
            ("full_name", "Lebron James"),
            ("phone_number", "555-333-1000"),
            ("bio", "This is a test bio"),
            ("image", "http://testimages.com/testimage"),
        ),
    )
    async def test_user_can_update_own_profile(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: GetUserRow,
        attr: str,
        value: str,
    ) -> None:
        assert getattr(test_user, attr) != value
        res = await authorized_client.put(
            app.url_path_for("profiles:update-own-profile"),
            json={"profile_update": {attr: value}},
        )
        assert res.status_code == HTTP_200_OK
        profile = Profile(**res.json())
        assert getattr(profile, attr) == value
        await app.state._conn.commit()

    @pytest.mark.parametrize(
        "attr, value, status_code",
        (
            ("full_name", [], 422),
            ("bio", {}, 422),
            ("image", "./image-string.png", 422),
            ("image", 5, 422),
        ),
    )
    async def test_user_receives_error_for_invalid_update_params(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: GetUserRow,
        attr: str,
        value: str,
        status_code: int,
    ) -> None:

        res = await authorized_client.put(
            app.url_path_for("profiles:update-own-profile"),
            json={"profile_update": {attr: value}},
        )
        assert res.status_code == status_code
        await app.state._conn.commit()
