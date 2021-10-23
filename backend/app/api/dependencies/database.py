import logging
from typing import Callable, Type

from databases import Database
from fastapi import Depends
from starlette.requests import Request

from app.db.repositories.base import BaseRepository

logger = logging.getLogger(__name__)


def get_database(request: Request) -> Database:
    """
    Database API dependency. It gets called once only when a request is made
    `request` needs not be passed anywhere, FastAPI handles passing that along for us.
    `request.state` is a property of each Request object, and all of them will contain the `_db`
    property we defined in app/db/tasks.py
    References:
        https://www.starlette.io/requests/
        https://fastapi.tiangolo.com/tutorial/sql-databases/?h=request#about-requeststate
    """
    return request.app.state._db


def get_repository(Repo_type: Type[BaseRepository]) -> Callable:
    """
    Database repository API dependency.
    It expects a Repository (all inherit from Base, which contains the database reference)
    The `db` parameter for `get_repo` is a sub-dependency, which by default will use the database
    returned by `get_database`.
    `db` is then passed to the repository constructor.
    """

    def get_repo(db: Database = Depends(get_database)) -> BaseRepository:
        return Repo_type(db)

    return get_repo
