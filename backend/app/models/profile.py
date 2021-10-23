from typing import Optional

from pydantic import EmailStr, HttpUrl

from app.models.core import CoreModel, DateTimeModelMixin, IDModelMixin


class ProfileBase(CoreModel):
    full_name: Optional[str]
    phone_number: Optional[str]
    bio: Optional[str]
    image: Optional[HttpUrl]


class ProfileCreate(ProfileBase):
    """
    The only field required to create a profile is the users id
    """

    user_id: int


class ProfileUpdate(ProfileBase):
    """
    Allow users to update any or no fields, as long as it's not user_id
    """

    pass


# Though our profiles table doesn't have a username or email field,
# we still add them. Depending on the situation, this may be useful
# for displaying user profiles in our UI.
class ProfileInDB(IDModelMixin, DateTimeModelMixin, ProfileBase):
    user_id: int
    username: Optional[str]
    email: Optional[EmailStr]


class ProfilePublic(ProfileInDB):
    pass
