from typing import Optional

from pydantic import EmailStr, constr

from app.models.core import CoreModel, DateTimeModelMixin, IDModelMixin

# ? until constr fixed
# mypy: ignore-errors


class PasswordResetRequest(CoreModel, DateTimeModelMixin, IDModelMixin):
    """
    Users can request a password reset to an administrator.
    """

    email: EmailStr
    message: str


class PasswordResetRequestCreate(CoreModel):
    """
    Users can request a password reset to an administrator.
    """

    email: EmailStr
    message: str
