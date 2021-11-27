from databases import Database
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR


class BaseRepository:
    """
    Functionality for common actions in the repository layer.
    """

    def __init__(self, db: Database) -> None:
        self.db = db
