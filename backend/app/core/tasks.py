from typing import Callable

from fastapi import FastAPI

from app.core.config import is_cicd, is_testing
from app.core.loguru_setup import setup_logger_from_settings
from app.db.tasks import close_db_connection, connect_to_db


def create_startup_handler(app: FastAPI) -> Callable:
    async def start_app() -> None:
        connect_to_db(app=app)
        if not is_cicd() and not is_testing():
            app.state._logger = setup_logger_from_settings()

    return start_app


def create_shutdown_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        await close_db_connection(app)
        # TODO stop all running tasks in celery

    return stop_app
