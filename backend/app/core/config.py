"""
Any config variable that does not have a default MUST
be provided a value in the .env file or an error will be thrown.
"""

import os

from databases import DatabaseURL
from loguru import logger
from starlette.config import Config
from starlette.datastructures import Secret

APP_ENV = os.environ.get("APP_ENV") or ""


def is_e2e():
    return os.environ.get("APP_ENV") == "e2e"


def is_dev():
    return os.environ.get("APP_ENV") == "development"


def is_prod():
    return os.environ.get("APP_ENV") == "production"


def is_testing():
    return bool(os.environ.get("TESTING"))


def is_cicd():
    return bool(os.environ.get("CICD"))


PROJECT_NAME = "MY APP"
VERSION = "1.0.0"
API_PREFIX = "/api"

# notice we forcefully need an env file regardless of environment.
# setting os.environ[*] is not enough
if is_prod() or is_dev():
    config = Config(".env")
elif is_e2e():
    config = Config(".env.e2e")
elif is_cicd():  # CICD needs to be explicitly set in compose.ci (confirmed)
    config = Config(".env.ci")


# openssl rand -hex 32 for UNIQUE_KEY in .env file
UNIQUE_KEY = config("UNIQUE_KEY", cast=Secret)  # or os.environ.get("UNIQUE_KEY")

ACCESS_TOKEN_EXPIRE_MINUTES = config("ACCESS_TOKEN_EXPIRE_MINUTES", cast=int, default=7 * 24 * 60)  # one week
JWT_ALGORITHM = config("JWT_ALGORITHM", cast=str, default="HS256")
JWT_AUDIENCE = config("JWT_AUDIENCE", cast=str, default="myapp:auth")
JWT_TOKEN_PREFIX = config("JWT_TOKEN_PREFIX", cast=str, default="Bearer")

POSTGRES_USER = config("POSTGRES_USER", cast=str)  # or os.environ.get("POSTGRES_USER")
POSTGRES_PASSWORD = config("POSTGRES_PASSWORD", cast=Secret)  # or os.environ.get("POSTGRES_PASSWORD")

if is_dev():
    POSTGRES_SERVER = config("POSTGRES_SERVER_DEV", cast=str)  # or os.environ.get("POSTGRES_SERVER_DEV")
elif is_prod():
    POSTGRES_SERVER = config("POSTGRES_SERVER_PROD", cast=str)  # or os.environ.get("POSTGRES_SERVER_PROD")
elif is_e2e():
    POSTGRES_SERVER = config("POSTGRES_SERVER_E2E", cast=str)  # or os.environ.get("POSTGRES_SERVER_E2E")
elif is_cicd():
    POSTGRES_SERVER = config("POSTGRES_SERVER_CI", cast=str)  # or os.environ.get("POSTGRES_SERVER_CI")

os.environ["POSTGRES_SERVER"] = POSTGRES_SERVER

POSTGRES_PORT = config("POSTGRES_PORT", cast=str, default="5432")  # or os.environ.get("POSTGRES_PORT")
POSTGRES_DB = config("POSTGRES_DB", cast=str)

DATABASE_URL = config(
    "DATABASE_URL",
    cast=DatabaseURL,
    default=f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}",
)

ADMIN_USERNAME = config("ADMIN_USERNAME", cast=str)
ADMIN_EMAIL = config("ADMIN_EMAIL", cast=str)
ADMIN_PASSWORD = config("ADMIN_PASSWORD", cast=str)
