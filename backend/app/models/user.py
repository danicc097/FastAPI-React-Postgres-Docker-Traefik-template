import re
from typing import Optional

from pydantic import EmailStr, constr, validator

from app.db.gen.queries.models import Role
from app.db.gen.queries.users import GetUserRow
from app.models.core import CoreModel
from app.models.token import AccessToken

DOMAIN_REGEX = re.compile(r".*@(myappdomain|myapp|myappdomain2)\..*")


class UserCreate(CoreModel):

    email: EmailStr
    password: constr(min_length=7, max_length=100)  # type: ignore
    username: constr(min_length=3, max_length=50, regex="^[a-zA-Z0-9_-]+$")  # type: ignore

    @validator("email")
    def validate_email(cls, v):
        if not DOMAIN_REGEX.match(v):
            raise ValueError("Email domain unrecognized")
        return v.lower()

    # @root_validator
    # def _validate(cls, values: dict):
    #     if not EMAIL_REGEX.match(values.get("email")):
    #         raise ValueError("Invalid email address")
    #     if 5 > len(values.get("password")) > 250:
    #         raise ValueError("Password must be between 5 and 250 characters")
    #     if 3 > len(values.get("username")) > 20:
    #         raise ValueError("Username must be between 3 and 20 characters")
    #     return values


class UserPasswordRegistration(CoreModel):

    password: str
    salt: str


class UserUpdate(CoreModel):

    password: Optional[constr(min_length=7, max_length=100)]  # type: ignore
    old_password: Optional[constr(min_length=7, max_length=100)]  # type: ignore
    email: Optional[EmailStr]
    username: Optional[constr(min_length=3, max_length=50, regex="^[a-zA-Z0-9_-]+$")]  # type: ignore

    # @root_validator
    # def _validate(cls, values: dict):
    #     if values.get("email") and not EMAIL_REGEX.match(values.get("email")):
    #         raise ValueError("Invalid email address")
    #     if values.get("password") and 5 > len(values.get("password")) > 250:
    #         raise ValueError("Password must be between 5 and 250 characters")
    #     if values.get("username") and 3 > len(values.get("username")) > 20:
    #         raise ValueError("Username must be between 3 and 20 characters")
    #     return values


class RoleUpdate(CoreModel):

    email: str
    role: Role


class UserPublic(GetUserRow):
    # user_id: int
    access_token: Optional[AccessToken]
    # profile: Optional[ProfilePublic]
