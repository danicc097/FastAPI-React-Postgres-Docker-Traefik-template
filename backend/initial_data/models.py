import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app.db.gen.queries.models import Role
from app.models.core import CoreModel


class User(CoreModel):
    email: str
    password: str
    username: str
    role: Role
    verified: bool
    admin: bool
