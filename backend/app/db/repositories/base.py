from databases import Database


class BaseRepository:
    """
    Functionality for common actions in the repository layer.
    """

    def __init__(self, db: Database) -> None:
        self.db = db
