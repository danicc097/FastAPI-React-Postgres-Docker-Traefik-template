"""create notifications table

Revision ID: 824585145a4a
Revises: 72123f20bcb6
Create Date: 2021-11-12 22:55:26.663684

"""
import pathlib
import sys

import sqlalchemy as sa
from alembic import op

# we're appending the app directory to our path here so that we can import config easily
sys.path.append(str(pathlib.Path(__file__).resolve().parents[4]))  # change depth to root accordingly

from app.db.migrations.utils import timestamps  # noqa: E402

# revision identifiers, used by Alembic
revision = "824585145a4a"
down_revision = "72123f20bcb6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Create notifications table targetted based on roles
    """

    op.create_table(
        "global_notifications",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("sender", sa.Text, sa.ForeignKey("users.email", ondelete="CASCADE")),
        sa.Column("receiver_role", sa.String(255), index=True, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.String(255), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("link", sa.String(255)),
        *timestamps(indexed=True),
        # we will filter by date AND receiver_role mostly
        sa.Index("notifications_created_at_receiver_role", "created_at", "receiver_role"),
    )


def downgrade() -> None:
    op.drop_table("global_notifications")
