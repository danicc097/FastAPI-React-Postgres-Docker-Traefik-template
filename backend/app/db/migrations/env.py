"""
Config for alembic 'offline' and 'online' migrations
"""

import asyncio
import pathlib
import sys

import alembic
from alembic.runtime.migration import MigrationContext
from loguru import logger
from sqlalchemy import create_engine, engine_from_config, pool, text
from sqlalchemy.ext.asyncio import AsyncEngine

sys.path.append(str(pathlib.Path(__file__).resolve().parents[3]))

from app.core.config import (  # noqa
    DATABASE_URL,
    POSTGRES_DATABASE_URL,
    POSTGRES_DB,
    POSTGRES_DB_TEST,
    TEST_DB_URL,
    is_testing,
)

config = alembic.context.config


def process_revision_directives(context, revision, directives):
    migration_script = directives[0]
    head_revision = alembic.context.script.from_config(context.config).get_current_head()

    if head_revision is None:
        # edge case with first migration
        new_rev_id = 1
    else:
        # default branch with incrementation
        last_rev_id = int(head_revision.lstrip("0"))
        new_rev_id = last_rev_id + 1
    migration_script.rev_id = "{0:08}".format(new_rev_id)


async def run_migrations_online() -> None:
    logger.critical(f"{DATABASE_URL=}")
    logger.critical(f"{DATABASE_URL=}")

    if is_testing():
        logger.critical("Running migrations in TESTING mode")
        logger.critical(f"{DATABASE_URL=}")
        logger.critical(f"{POSTGRES_DB=}")
        logger.critical(f"{POSTGRES_DB_TEST=}")
        logger.critical(f"{TEST_DB_URL=}")
        logger.critical(f"{DATABASE_URL=}")

        await cleanup_database()

    connectable = config.attributes.get("connection", None)
    config.set_main_option(
        "sqlalchemy.url",
        TEST_DB_URL if is_testing() else DATABASE_URL,
    )

    if connectable is None:
        connectable = AsyncEngine(
            engine_from_config(
                config.get_section(config.config_ini_section),
                prefix="sqlalchemy.",
                poolclass=pool.NullPool,
                execution_options={
                    "isolation_level": "AUTOCOMMIT",
                },
                future=True,
                connect_args={"server_settings": {"jit": "off"}},
            )
        )

    connected = False
    while not connected:
        try:
            async with connectable.connect() as connection:
                await connection.execute(text("SELECT 1"))
            connected = True
        except Exception as e:
            logger.info("Waiting for database to be ready")
            await asyncio.sleep(1)

    async with connectable.begin() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


async def cleanup_database():
    default_engine = AsyncEngine(
        create_engine(
            str(POSTGRES_DATABASE_URL),
            future=True,
            execution_options={
                "isolation_level": "AUTOCOMMIT",
            },
            poolclass=pool.NullPool,
            connect_args={"server_settings": {"jit": "off"}},
        )
    )
    async with default_engine.connect() as default_conn:
        await default_conn.execute(
            text(
                f"""
                     select pg_terminate_backend(pid)
                     from pg_stat_activity
                     where datname='{POSTGRES_DB_TEST}'
                     """
            )
        )
        await default_conn.execute(text(f"DROP DATABASE IF EXISTS {POSTGRES_DB_TEST}"))
        await default_conn.execute(text(f"CREATE DATABASE {POSTGRES_DB_TEST}"))
        logger.critical("Created test database")
    await default_engine.dispose()


def do_run_migrations(connection):
    alembic.context.configure(
        connection=connection,
        target_metadata=None,
        process_revision_directives=process_revision_directives,
    )
    with alembic.context.begin_transaction():
        alembic.context.run_migrations()
        context = MigrationContext.configure(connection)
        current_rev = context.get_current_revision()
        logger.info(f"Current alembic revision: {current_rev}")


def run_migrations_offline() -> None:

    if is_testing():
        raise Exception("Running testing migrations offline currently not permitted")

    alembic.context.configure(
        url=str(DATABASE_URL),
        process_revision_directives=process_revision_directives,
    )

    with alembic.context.begin_transaction():
        alembic.context.run_migrations()


if alembic.context.is_offline_mode():
    run_migrations_offline()
else:
    logger.info("Running migrations online")
    asyncio.run(run_migrations_online())
    logger.info("Finished migrations online")
