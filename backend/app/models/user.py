from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import EmailStr, constr, validator
from pydantic.main import BaseModel

from app.models.core import CoreModel, DateTimeModelMixin, IDModelMixin
from app.models.profile import ProfilePublic
from app.models.token import AccessToken


class Role(str, Enum):
    """
    Access level for users.
    """

    user = "user"
    manager = "manager"
    admin = "admin"


class UserBase(CoreModel):
    """
    Leaving off password and salt from base model
    so they never leave the backend
    """

    email: Optional[EmailStr]
    username: Optional[str]
    is_verified: bool = False
    is_active: bool = True
    is_superuser: bool = False
    role: Role = Role.user
    last_notification_at: datetime = datetime.utcnow()

    @validator("last_notification_at", pre=True)
    def default_datetime(cls, value: datetime) -> datetime:
        return value or datetime.utcnow()


# ? until constr fixed
# mypy: ignore-errors


class UserCreate(CoreModel):
    """
    Email, username, and password are required for registering a new user
    """

    email: EmailStr
    password: constr(min_length=7, max_length=100)
    username: constr(min_length=3, max_length=50, regex="^[a-zA-Z0-9_-]+$")


class UserPasswordRegistration(CoreModel):
    """
    Mandatory password + salt combo for registration
    """

    password: constr(min_length=7, max_length=100)
    salt: str


class UserUpdate(CoreModel):
    """
    Users are allowed to update their email, username or password
    """

    password: Optional[str]
    old_password: Optional[constr(min_length=7, max_length=50)]
    email: Optional[EmailStr]
    username: Optional[constr(min_length=3, max_length=50, regex="^[a-zA-Z0-9_-]+$")]


class RoleUpdate(CoreModel):
    """
    Admin users can update the role of other users
    """

    email: EmailStr
    role: Role


class UserInDB(IDModelMixin, DateTimeModelMixin, UserBase):
    """
    Add in user's hashed password and salt
    """

    password: constr(min_length=7, max_length=100)
    salt: str


class UserPublic(IDModelMixin, DateTimeModelMixin, UserBase):
    """
    By accepting an optional access_token attribute, we can now return the
    user along with their token as soon as they've registered.
    We also have the ability to attach a user profile
    """

    access_token: Optional[AccessToken]
    profile: Optional[ProfilePublic]
