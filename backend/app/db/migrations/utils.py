from typing import Tuple

import sqlalchemy as sa
from alembic import op
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import expression
from sqlalchemy.types import DateTime


class utcnow(expression.FunctionElement):
    type = DateTime().with_variant(DateTime, "postgresql")


@compiles(utcnow, "postgresql")
def pg_utcnow(element, compiler, **kw):
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"


def create_updated_at_trigger() -> None:
    """
    ``PL/pgSQL`` trigger. To be created for every table.
    Will run whenever a row in a given table is updated
    and set the ``updated_at`` column to that moment in time.
    """
    op.execute(
        """
        CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS
        $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        """
    )


def timestamps(indexed: bool = False) -> Tuple[sa.Column, sa.Column]:
    """
    Returns two columns - ``created_at`` and ``updated_at``
    that can be unpacked into any table -> ``*timestamps()``.\n
    They default to the current moment in time in UTC with ``utcnow()``.
    """
    return (
        sa.Column(
            "created_at",
            DateTime,
            server_default=utcnow(),
            nullable=False,
            index=indexed,
        ),
        sa.Column(
            "updated_at",
            DateTime,
            server_default=utcnow(),
            nullable=False,
            index=indexed,
        ),
    )
