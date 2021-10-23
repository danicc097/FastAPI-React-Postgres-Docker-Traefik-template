from typing import Tuple

import sqlalchemy as sa
from alembic import op


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
    They default to the current moment in time with ``sa.func.now()``.
    """
    return (
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
            index=indexed,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
            index=indexed,
        ),
    )
