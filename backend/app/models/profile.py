from typing import Optional

from pydantic import HttpUrl

from app.models.core import CoreModel


class ProfileUpdate(CoreModel):
    full_name: Optional[str]
    phone_number: Optional[str]
    bio: Optional[str]
    image: Optional[HttpUrl]
