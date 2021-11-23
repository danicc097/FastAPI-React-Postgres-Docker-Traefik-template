from databases import Database
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR


class BaseRepoException(Exception):  # do NOT use BaseException
    def __init__(self, msg="", status_code=HTTP_500_INTERNAL_SERVER_ERROR, *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
        self.msg = msg
        self.status_code = status_code


class BaseRepository:
    """
    Functionality for common actions in the repository layer.
    """

    def __init__(self, db: Database) -> None:
        self.db = db
