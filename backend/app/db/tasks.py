import logging
import os
from time import sleep

from databases import Database
from fastapi import FastAPI
from loguru import logger

from app.core.config import DATABASE_URL, is_testing


async def connect_to_db(app: FastAPI) -> None:

    pytest_worker = os.environ.get("PYTEST_XDIST_WORKER")
    DB_URL = f"{DATABASE_URL}_test_{pytest_worker}" if is_testing() else DATABASE_URL
    # set min and max n. of connections
    database = Database(DB_URL, min_size=2, max_size=10)
    connected = False
    while not connected:
        try:
            await database.connect()
            app.state._db = database
            connected = True
        except Exception as e:
            logger.warning("--- DB CONNECTION ERROR ---")
            logger.warning(e)
            logger.warning("--- END DB CONNECTION ERROR ---")
            sleep(5)


async def close_db_connection(app: FastAPI) -> None:
    try:
        await app.state._db.disconnect()
    except Exception as e:
        logger.warning("--- DB DISCONNECT ERROR ---")
        logger.warning(e)
        logger.warning("--- END DB DISCONNECT ERROR ---")
