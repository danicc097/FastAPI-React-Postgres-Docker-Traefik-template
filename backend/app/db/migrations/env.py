"""
Config for alembic 'offline' and 'online' migrations
"""

import os
import pathlib
import sys

import alembic
from alembic.runtime.migration import MigrationContext
from loguru import logger
from psycopg2 import DatabaseError
from sqlalchemy import create_engine, engine_from_config, pool

# we're appending the app directory to our path here so that we can import config easily
sys.path.append(str(pathlib.Path(__file__).resolve().parents[3]))

from app.core.config import DATABASE_URL, POSTGRES_DB, is_testing  # noqa

# Alembic Config object, which provides access to values within the .ini file
config = alembic.context.config


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    pytest_worker = os.environ.get("PYTEST_XDIST_WORKER")
    DB_URL = f"{DATABASE_URL}_test_{pytest_worker}" if is_testing() else str(DATABASE_URL)

    # handle testing config for migrations
    if is_testing():
        logger.critical("Running migrations in TESTING mode")
        logger.critical(f"{DATABASE_URL=}")
        logger.critical(f"{POSTGRES_DB=}")
        logger.critical(f"{DB_URL=}")
        # Sqlalchemy always tries to run queries in a transaction, and postgres does not
        # allow users to create databases inside a transaction, so testing will be run without
        # automatic transaction management.
        # More references (2014): https://www.oddbird.net/2014/06/14/sqlalchemy-postgres-autocommit/
        # default_engine is using the regular database, we simply use this to execute stuff on the testing db
        # Avoid manual transaction management when creating a database by setting AUTOCOMMIT
        default_engine = create_engine(str(DATABASE_URL), isolation_level="AUTOCOMMIT")
        with default_engine.connect() as default_conn:
            # ! drop testing db if it exists and create a fresh one
            DB_NAME = f"{POSTGRES_DB}_test_{pytest_worker}"
            default_conn.execute(f"select pg_terminate_backend(pid) from pg_stat_activity where datname='{DB_NAME}'")
            default_conn.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
            default_conn.execute(f"CREATE DATABASE {DB_NAME}")

    connectable = config.attributes.get("connection", None)
    config.set_main_option("sqlalchemy.url", DB_URL)

    if connectable is None:
        connectable = engine_from_config(
            config.get_section(config.config_ini_section),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )

    with connectable.begin() as connection:
        alembic.context.configure(connection=connection, target_metadata=None)
        with alembic.context.begin_transaction():
            alembic.context.run_migrations()
            context = MigrationContext.configure(connection)
            current_rev = context.get_current_revision()
            logger.info(f"Current alembic revision: {current_rev}")


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """

    if is_testing():
        raise DatabaseError("Running testing migrations offline currently not permitted")

    alembic.context.configure(url=str(DATABASE_URL))

    with alembic.context.begin_transaction():
        alembic.context.run_migrations()


if alembic.context.is_offline_mode():
    logger.info("Running migrations offline")
    run_migrations_offline()
    logger.info("Finished migrations offline")
else:
    logger.info("Running migrations online")
    run_migrations_online()
    logger.info("Finished migrations online")
