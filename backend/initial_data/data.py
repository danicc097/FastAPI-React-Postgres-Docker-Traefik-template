import enum
import pathlib
import sys
from typing import Dict

from pydantic import EmailStr

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME
from app.db.gen.queries.personal_notifications import (
    CreatePersonalNotificationParams,
)
from initial_data.models import User

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app.db.gen.queries.global_notifications import (
    CreateGlobalNotificationParams,
)
from app.db.gen.queries.models import Role
from app.db.gen.queries.password_reset_requests import (
    CreatePasswordResetRequestParams,
)

"""
TODO

source of data for all envs:
    - users, global notifications, password reset requests...

"""


class AppEnv(str, enum.Enum):
    DEV = "dev"
    PROD = "prod"
    E2E = "e2e"


USERS: Dict[AppEnv, Dict[str, User]] = {
    AppEnv.DEV: {
        "admin": User(
            username="admin",
            email=EmailStr("admin@myapp.com").lower(),
            password="12341234",
            role=Role.ADMIN,
            verified=True,
            admin=True,
        ),
        "manager": User(
            username="manager",
            email=EmailStr("manager@myapp.com").lower(),
            password="12341234",
            role=Role.MANAGER,
            verified=True,
            admin=False,
        ),
        "verified": User(
            username="verified",
            email=EmailStr("verified@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=True,
            admin=False,
        ),
        "unverified": User(
            username="unverified",
            email=EmailStr("unverified@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=False,
            admin=False,
        ),
        "unverified2": User(
            username="unverified2",
            email=EmailStr("unverified2@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=False,
            admin=False,
        ),
        **{
            f"testuser{i}": User(
                username=f"testuser{i}",
                email=EmailStr(f"testuser{i}@myapp.com").lower(),
                password="12341234",
                admin=False,
                verified=True,
                role=Role.USER,
            )
            for i in range(10)
        },
    },
    AppEnv.E2E: {
        "admin": User(
            username="admin",
            email=EmailStr("admin@myapp.com").lower(),
            password="12341234",
            role=Role.ADMIN,
            verified=True,
            admin=True,
        ),
        "manager": User(
            username="manager",
            email=EmailStr("manager@myapp.com").lower(),
            password="12341234",
            role=Role.MANAGER,
            verified=True,
            admin=False,
        ),
        "verified": User(
            username="verified",
            email=EmailStr("verified@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=True,
            admin=False,
        ),
        "unverified": User(
            username="unverified",
            email=EmailStr("unverified@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=False,
            admin=False,
        ),
        "unverified2": User(
            username="unverified2",
            email=EmailStr("unverified2@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=False,
            admin=False,
        ),
        "profileTestUser": User(
            username="thiscanbeupdated",
            email=EmailStr("thiscanbeupdated@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=True,
            admin=False,
        ),
        "toBeVerified": User(
            username="toBeVerified",
            email=EmailStr("tobeverified@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=False,
            admin=False,
        ),
        "passwordResetTestUser0": User(
            username="passwordResetTestUser0",
            email=EmailStr("passwordresettestuser0@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=True,
            admin=False,
        ),
        "passwordResetTestUser1": User(
            username="passwordResetTestUser1",
            email=EmailStr("passwordresettestuser1@myapp.com").lower(),
            password="12341234",
            role=Role.USER,
            verified=True,
            admin=False,
        ),
        **{
            f"testuser{i}": User(
                username=f"testuser{i}",
                email=EmailStr(f"testuser{i}@myapp.com").lower(),
                password="12341234",
                admin=False,
                verified=True,
                role=Role.USER,
            )
            for i in range(10)
        },
    },
    AppEnv.PROD: {
        "admin": User(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL.lower(),
            password=ADMIN_PASSWORD,
            admin=True,
            verified=True,
            role=Role.ADMIN,
        ),
    },
}

GLOBAL_NOTIFICATIONS: Dict[AppEnv, Dict[str, CreateGlobalNotificationParams]] = {
    AppEnv.DEV: {
        **{
            f"testnotification{i}": CreateGlobalNotificationParams(
                sender=ADMIN_EMAIL.lower(),
                receiver_role=Role.ADMIN,
                title=f"Test notification {i}",
                body=f"Test notification {i} body",
                label=f"label {i}",
                link="https://www.google.com",
            )
            for i in range(1, 10)
        },
    },
    AppEnv.E2E: {
        **{
            f"testnotification{i}": CreateGlobalNotificationParams(
                sender=ADMIN_EMAIL.lower(),
                receiver_role=Role.ADMIN,
                title=f"Test notification {i}",
                body=f"Test notification {i} body",
                label=f"label {i}",
                link="https://www.google.com",
            )
            for i in range(1, 10)
        },
    },
    AppEnv.PROD: {
        **{
            "Welcome": CreateGlobalNotificationParams(
                sender=ADMIN_EMAIL.lower(),
                receiver_role=Role.ADMIN,
                title="Welcome to MYAPP",
                body="Here you can check out all news and updates from MYAPP. \nVisit the help page for more information.",
                label="news",
                link="/help",
            )
        },
    },
}

PERSONAL_NOTIFICATIONS: Dict[AppEnv, Dict[str, CreatePersonalNotificationParams]] = {
    AppEnv.DEV: {
        **{
            f"testnotification{i}": CreatePersonalNotificationParams(
                sender=ADMIN_EMAIL.lower(),
                receiver_email="admin@myapp.com",
                title=f"Test personal notification {i}",
                body=f"Test personal notification {i} body",
                label=f"label {i}",
                link="https://www.google.com",
            )
            for i in range(1, 10)
        },
    },
    AppEnv.E2E: {
        **{
            f"testnotification{i}": CreatePersonalNotificationParams(
                sender=ADMIN_EMAIL.lower(),
                receiver_email="admin@myapp.com",
                title=f"Test personal notification {i}",
                body=f"Test personal notification {i} body",
                label=f"label {i}",
                link="https://www.google.com",
            )
            for i in range(1, 10)
        },
    },
    AppEnv.PROD: {},
}

PASSWORD_RESET_REQUESTS: Dict[AppEnv, Dict[str, CreatePasswordResetRequestParams]] = {
    AppEnv.DEV: {
        **{
            f"testpasswordresetrequest{i}": CreatePasswordResetRequestParams(
                email=f"testuser{i}@myapp.com".lower(),
                message=f"This is test message {i}",
            )
            for i in range(5)
        },
    },
    AppEnv.E2E: {
        **{
            f"testpasswordresetrequest{i}": CreatePasswordResetRequestParams(
                email=f"passwordresettestuser{i}@myapp.com".lower(),
                message=f"This is test message {i}",
            )
            for i in range(2)
        },
    },
    AppEnv.PROD: {},
}
