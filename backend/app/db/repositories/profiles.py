from typing import Optional

from app.db.repositories.base import BaseRepository
from app.models.profile import ProfileCreate, ProfilePublic, ProfileUpdate
from app.models.user import UserInDB

CREATE_PROFILE_FOR_USER_QUERY = """
    INSERT INTO profiles (full_name, phone_number, bio, image, user_id)
    VALUES (:full_name, :phone_number, :bio, :image, :user_id)
    RETURNING *;
"""

GET_PROFILE_BY_USER_ID_QUERY = """
    SELECT *
    FROM profiles
    WHERE user_id = :user_id;
"""

GET_PROFILE_BY_USERNAME_QUERY = """
    SELECT p.id,
           u.email AS email,
           u.username AS username,
           full_name,
           phone_number,
           bio,
           image,
           user_id,
           p.created_at,
           p.updated_at
    FROM profiles p
        INNER JOIN users u
        ON p.user_id = u.id
    WHERE user_id = (SELECT id FROM users WHERE username = :username);
"""

UPDATE_PROFILE_QUERY = """
    UPDATE profiles
    SET full_name    = :full_name,
        phone_number = :phone_number,
        bio          = :bio,
        image        = :image
    WHERE user_id = :user_id
    RETURNING *;
"""

###############################################################################


class ProfilesRepository(BaseRepository):
    async def create_profile_for_user(self, *, profile_create: ProfileCreate):
        created_profile = await self.db.fetch_one(query=CREATE_PROFILE_FOR_USER_QUERY, values=profile_create.dict())

        return created_profile

    async def get_profile_by_user_id(self, *, user_id: int) -> Optional[ProfilePublic]:
        profile_record = await self.db.fetch_one(query=GET_PROFILE_BY_USER_ID_QUERY, values={"user_id": user_id})

        if not profile_record:
            return None

        return ProfilePublic(**profile_record)

    async def get_profile_by_username(self, *, username: str) -> Optional[ProfilePublic]:
        """
        Select the username and email from the users table,
        while selecting all fields from the profiles table.
        """
        profile_record = await self.db.fetch_one(query=GET_PROFILE_BY_USERNAME_QUERY, values={"username": username})
        if not profile_record:
            return None
        return ProfilePublic(**profile_record)

    async def update_profile(
        self, *, profile_update: ProfileUpdate, requesting_user: UserInDB
    ) -> Optional[ProfilePublic]:
        profile = await self.get_profile_by_user_id(user_id=requesting_user.id)
        if not profile:
            return None
        update_params = profile.copy(update=profile_update.dict(exclude_unset=True))
        updated_profile = await self.db.fetch_one(
            query=UPDATE_PROFILE_QUERY,
            # throw in exactly the fields that the query SETs
            # important to also set values that remain the same, and not override with '', None, etc.
            values=update_params.dict(exclude={"id", "created_at", "updated_at", "username", "email"}),
        )
        if not updated_profile:
            return None
        return ProfilePublic(**updated_profile)
