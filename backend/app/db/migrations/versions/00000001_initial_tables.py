"""initial_tables

Revision ID: 00000001
Revises:
Create Date: 2022-03-01 18:08:34.743615

"""
import pathlib
import sys

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql.sqltypes import Date, DateTime

import app.db.migrations.sql as sql

sys.path.append(str(pathlib.Path(__file__).resolve().parents[4]))

from app.db.migrations.utils import (  # noqa: E402
    create_updated_at_trigger,
    datetoday,
    timestamps,
    utcnow,
)

SQL_DIR = pathlib.Path(sql.__file__).parent

# revision identifiers, used by Alembic
revision = "00000001"
down_revision = None
branch_labels = None
depends_on = None


ROLE = sa.Enum("user", "manager", "admin", name="role")


def create_users_table() -> None:
    op.create_table(
        "users",
        sa.Column("user_id", sa.Integer, primary_key=True),
        sa.Column("username", sa.Text, unique=True, nullable=False, index=True),
        sa.Column("email", sa.Text, unique=True, nullable=False, index=True),
        sa.Column(
            "role",
            ROLE,
            nullable=False,
            index=True,
            server_default="user",
        ),
        sa.Column("is_verified", sa.Boolean, nullable=False, server_default="False"),
        sa.Column("salt", sa.Text, nullable=False),
        sa.Column("password", sa.Text, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="True"),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default="False"),
        sa.Column("last_global_notification_at", DateTime, server_default=utcnow(), nullable=False, index=True),
        sa.Column("last_personal_notification_at", DateTime, server_default=utcnow(), nullable=False, index=True),
        *timestamps(),
    )

    op.execute(
        """
        CREATE TRIGGER update_user_modtime
            BEFORE UPDATE
            ON users
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """
    )


def create_profiles_table() -> None:

    op.create_table(
        "profiles",
        sa.Column("profile_id", sa.Integer, primary_key=True),
        sa.Column("full_name", sa.Text),
        sa.Column("phone_number", sa.Text),
        sa.Column("bio", sa.Text, server_default=""),
        sa.Column("image", sa.Text),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
    )


def create_password_reset_requests_table() -> None:

    op.create_table(
        "password_reset_requests",
        sa.Column("password_reset_request_id", sa.Integer, primary_key=True),
        sa.Column(
            "email",
            sa.Text,
            sa.ForeignKey("users.email", ondelete="CASCADE"),
            unique=True,
        ),
        sa.Column("message", sa.Text),
        *timestamps(),
    )
    op.execute(
        """
        CREATE TRIGGER update_user_request_modtime
            BEFORE UPDATE
            ON password_reset_requests
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """
    )


def create_global_notifications_table():
    op.create_table(
        "global_notifications",
        sa.Column("global_notification_id", sa.Integer, primary_key=True),
        sa.Column("sender", sa.Text, sa.ForeignKey("users.email", ondelete="CASCADE")),
        sa.Column("receiver_role", ROLE, index=True, nullable=False),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("label", sa.Text, nullable=False),
        sa.Column("link", sa.Text),
        *timestamps(indexed=True),
    )
    op.execute("""CREATE TYPE event_type AS ENUM ('is_update', 'is_create')""")


def create_personal_notifications_table():
    op.create_table(
        "personal_notifications",
        sa.Column("personal_notification_id", sa.Integer, primary_key=True),
        sa.Column("sender", sa.Text, sa.ForeignKey("users.email", ondelete="CASCADE")),
        sa.Column("receiver_email", sa.Text, sa.ForeignKey("users.email", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("label", sa.Text, nullable=False),
        sa.Column("link", sa.Text),
        *timestamps(indexed=True),
    )

def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS v")
    op.execute("CREATE SCHEMA IF NOT EXISTS cache")

    op.execute("CREATE EXTENSION IF NOT EXISTS rum")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_stat_statements")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gin")


    create_updated_at_trigger()

    create_users_table()
    create_profiles_table()
    create_password_reset_requests_table()
    create_global_notifications_table()
    create_personal_notifications_table()


def downgrade() -> None:

    op.execute("DROP TYPE IF EXISTS role CASCADE")
    op.execute("DROP TYPE IF EXISTS event_type CASCADE")

    op.execute("DROP TABLE IF EXISTS global_notifications CASCADE")
    op.execute("DROP TABLE IF EXISTS personal_notifications CASCADE")
    op.execute("DROP TABLE IF EXISTS password_reset_requests CASCADE")
    op.execute("DROP TABLE IF EXISTS profiles CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")

    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")
