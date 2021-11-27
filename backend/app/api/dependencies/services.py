import logging
from typing import Callable, Type

from databases import Database
from fastapi import Depends
from starlette.requests import Request

from app.api.dependencies.database import get_database
from app.services.base import BaseService


def get_service(Service_type: Type[BaseService]) -> Callable:
    """
    Service API dependency.
    """

    def get_service(db: Database = Depends(get_database)) -> BaseService:
        return Service_type(db)

    return get_service
