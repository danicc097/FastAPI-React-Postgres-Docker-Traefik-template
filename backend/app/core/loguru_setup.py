import logging
import sys
from enum import Enum
from pathlib import Path
from typing import Optional

from loguru import logger
from loguru._logger import Logger
from pydantic import BaseSettings


class LoggingLevel(str, Enum):

    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"


class LoggingSettings(BaseSettings):

    level = "DEBUG"
    format: str = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    filepath: Optional[Path] = None
    # TODO dockerfile permissions for logs
    # if is_cicd() or is_testing():
    #     pass
    # elif APP_ENV:
    #     filepath = Path(f"./logs/{APP_ENV}/myapp-logs.log")
    rotation: str = "1 days"
    retention: str = "15 days"

    class Config:
        env_prefix = "logging_"


class InterceptHandler(logging.Handler):
    def emit(self, record):

        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logger(
    level: str,
    format: str,
    filepath: Optional[Path] = None,
    rotation: Optional[str] = None,
    retention: Optional[str] = None,
):

    logger.remove()

    loggers = [logging.getLogger(name) for name in logging.root.manager.loggerDict]

    # Add stdout logger
    logger.add(
        sys.stdout,
        enqueue=True,
        colorize=True,
        backtrace=True,
        level=level.upper(),
        format=format,
    )
    # Optionally add filepath logger
    if filepath:
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        logger.add(
            str(filepath),
            rotation=rotation,
            retention=retention,
            enqueue=True,
            colorize=False,
            backtrace=True,
            level=level.upper(),
            format=format,
        )
    # Overwrite config of standard library root logger
    logging.basicConfig(handlers=[InterceptHandler()], level=0)
    # Overwrite handlers of all existing loggers from standard library logging
    for _logger in loggers:
        _logger.handlers = [InterceptHandler()]
        _logger.propagate = False

    return logger


def setup_logger_from_settings(settings: Optional[LoggingSettings] = None) -> Logger:
    # Parse from env when no settings are given
    if not settings:
        settings = LoggingSettings()

    return setup_logger(
        settings.level,
        settings.format,
        settings.filepath,
        settings.rotation,
        settings.retention,
    )  # type: ignore
