"""create_main_tables

Revision ID: 72123f20bcb6
Revises:
Create Date: 2021-05-22 22:35:45.938830

"""
import pathlib
import sys
from typing import Tuple

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql.sqltypes import DateTime

# we're appending the app directory to our path here so that we can import config easily
sys.path.append(str(pathlib.Path(__file__).resolve().parents[4]))

from app.db.migrations.utils import (  # noqa: E402
    create_updated_at_trigger,
    timestamps,
    utcnow,
)

# revision identifiers, used by Alembic
revision = "72123f20bcb6"
down_revision = None
branch_labels = None
depends_on = None


def create_users_table() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.Text, unique=True, nullable=False, index=True),
        sa.Column("email", sa.Text, unique=True, nullable=False, index=True),
        sa.Column("role", sa.String(255), nullable=False, index=True, server_default="user"),
        sa.Column("is_verified", sa.Boolean, nullable=False, server_default="False"),
        sa.Column("salt", sa.Text, nullable=False),
        sa.Column("password", sa.Text, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="True"),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default="False"),
        sa.Column("last_notification_at", DateTime, server_default=utcnow(), nullable=False, index=True),
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
    """
    Stores supplementary information about a user. We're using the
    sa.ForeignKey table constraint to specify that each record in
    the profiles table belongs to a record in the users table.
    We'll keep authentication information in the users table and
    personal information in this profiles table
    """
    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("full_name", sa.Text, nullable=True),
        sa.Column("phone_number", sa.Text, nullable=True),
        sa.Column("bio", sa.Text, nullable=True, server_default=""),
        sa.Column("image", sa.Text, nullable=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE")),
        *timestamps(),
    )
    op.execute(
        """
        CREATE TRIGGER update_profiles_modtime
            BEFORE UPDATE
            ON profiles
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """
    )


def create_pwd_reset_req_table() -> None:
    """
    Stores password reset requests made by users.
    ``email`` can both have the constraint to be present in the users table and be unique,
    i.e. no more than one request per email, else an exception is raised by sqlalchemy
    """
    op.create_table(
        "pwd_reset_req",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "email",
            sa.Text,
            sa.ForeignKey("users.email", ondelete="CASCADE"),
            unique=True,  # don't allow more than one request per email
        ),
        sa.Column("message", sa.Text, nullable=True),
        *timestamps(),
    )
    op.execute(
        """
        CREATE TRIGGER update_user_request_modtime
            BEFORE UPDATE
            ON pwd_reset_req
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """
    )


def upgrade() -> None:
    """
    Make sure they're created in the proper order.
    """
    create_updated_at_trigger()
    create_users_table()
    create_profiles_table()
    create_pwd_reset_req_table()


def downgrade() -> None:
    """
    Drop them in inverse order of creation.
    """
    op.drop_table("pwd_reset_req")
    op.drop_table("profiles")
    op.drop_table("users")
    op.execute("DROP FUNCTION update_updated_at_column")
