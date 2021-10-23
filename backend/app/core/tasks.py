import os
from typing import Callable

from fastapi import FastAPI
from sqlalchemy.orm.session import close_all_sessions

from app.api.loguru_gunicorn import setup_logger_from_settings
from app.core.config import is_cicd
from app.db.tasks import close_db_connection, connect_to_db


def create_start_app_handler(app: FastAPI) -> Callable:
    async def start_app() -> None:
        await connect_to_db(app)
        if not is_cicd():
            setup_logger_from_settings()

    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        await close_db_connection(app)

    return stop_app
