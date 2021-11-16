from typing import Optional

from pydantic import EmailStr, constr

from app.models.core import CoreModel, DateTimeModelMixin, IDModelMixin
from app.models.user import Roles

# ? until constr fixed
# mypy: ignore-errors


class GlobalNotification(CoreModel, DateTimeModelMixin, IDModelMixin):
    """
    Admins and authorized roles can send notifications to users based on role.
    """

    sender: EmailStr
    receiver_role: Roles
    title: str
    body: str
    label: str
    link: Optional[str] = ""


class GlobalNotificationCreate(CoreModel):

    sender: EmailStr
    receiver_role: Roles
    title: str
    body: str
    label: str
    link: Optional[str]
