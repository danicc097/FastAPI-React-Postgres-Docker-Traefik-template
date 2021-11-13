from typing import Optional

from pydantic import EmailStr, constr

from app.models.core import CoreModel, DateTimeModelMixin, IDModelMixin

# ? until constr fixed
# mypy: ignore-errors


class UserNotification(CoreModel, DateTimeModelMixin, IDModelMixin):
    """
    Admins and authorized roles can send notifications to users based on role.
    """

    sender: str
    receiver_role: str
    title: str
    body: str
    label: str
    link: Optional[str] = ""


class UserNotificationCreate(CoreModel):

    sender: str
    receiver_role: str
    title: str
    body: str
    label: str
    link: Optional[str]
