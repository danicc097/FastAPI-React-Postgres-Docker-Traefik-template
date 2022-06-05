import os

from starlette.config import Config
from starlette.datastructures import Secret

APP_ENV = os.environ.get("APP_ENV") or ""


def is_e2e():
    return os.environ.get("APP_ENV") == "e2e"


def is_dev():
    return os.environ.get("APP_ENV") == "dev"


def is_prod():
    return os.environ.get("APP_ENV") == "prod"


def is_testing():
    return bool(os.environ.get("TESTING"))


def is_cicd():
    return bool(os.environ.get("CICD"))


def is_creating_initial_data():
    return bool(os.environ.get("CREATING_INITIAL_DATA"))


PROJECT_NAME = "MYAPP"
VERSION = "1.0.0"
API_PREFIX = "/v1"
ROOT_PATH = os.getenv("ROOT_PATH") or "/api"


if is_cicd():
    config = Config(".env.ci")
elif is_prod():
    config = Config(".env.prod")
else:
    config = Config(".env.dev")

UNIQUE_KEY = config("UNIQUE_KEY", cast=Secret, default="supersecret")

ACCESS_TOKEN_EXPIRE_MINUTES = config("ACCESS_TOKEN_EXPIRE_MINUTES", cast=int, default=7 * 24 * 60)
JWT_ALGORITHM = config("JWT_ALGORITHM", cast=str, default="HS256")
JWT_AUDIENCE = config("JWT_AUDIENCE", cast=str, default="myapp:auth")
JWT_TOKEN_PREFIX = config("JWT_TOKEN_PREFIX", cast=str, default="Bearer")

POSTGRES_USER = config("POSTGRES_USER", cast=str, default="postgres")
POSTGRES_PASSWORD = config("POSTGRES_PASSWORD", cast=Secret, default="postgres")
POSTGRES_PORT = config("POSTGRES_PORT", cast=str, default="5432")
POSTGRES_DB = config("POSTGRES_DB", cast=str, default="postgres")
POSTGRES_SERVER = config("POSTGRES_SERVER", cast=str, default="localhost")

os.environ["POSTGRES_SERVER"] = POSTGRES_SERVER

DOMAIN = "https://" + config("DOMAIN", cast=str, default="myapp.dev.localhost")

DATABASE_URL = config(
    "DATABASE_URL",
    default=f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}",
)
# postgres creates a db with name $USER by default, in our case it's "postgres"
POSTGRES_DATABASE_URL = config(
    "POSTGRES_DATABASE_URL",
    default=f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/postgres",
)
ADMIN_USERNAME = config("ADMIN_USERNAME", cast=str, default="admin")
ADMIN_EMAIL = config("ADMIN_EMAIL", cast=str, default="admin@myapp.com")
ADMIN_PASSWORD = config("ADMIN_PASSWORD", cast=str, default="admin")

MAX_OVERFLOW = 10
POOL_SIZE = 20

# TODO override in conftest and not pollute config
PYTEST_WORKER = os.environ.get("PYTEST_XDIST_WORKER") or "0"
POSTGRES_DB_TEST = f"{POSTGRES_DB}_test_{PYTEST_WORKER}"
TEST_DB_URL = f"{DATABASE_URL}_test_{PYTEST_WORKER}"

ECHO = False
