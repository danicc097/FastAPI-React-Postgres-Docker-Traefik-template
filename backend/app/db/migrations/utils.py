from typing import Tuple

import sqlalchemy as sa
from alembic import op
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import expression
from sqlalchemy.types import Date, DateTime


class utcnow(expression.FunctionElement):
    type = DateTime().with_variant(DateTime, "postgresql")


@compiles(utcnow, "postgresql")  # utcnow will now compile to the return value
def pg_utcnow(element, compiler, **kw):
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"


class datetoday(expression.FunctionElement):
    type = Date().with_variant(Date, "postgresql")


@compiles(datetoday, "postgresql")  # datetoday will now compile to the return value
def pg_datetoday(element, compiler, **kw):
    return "DATE(CURRENT_TIMESTAMP)"


def create_updated_at_trigger() -> None:

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
