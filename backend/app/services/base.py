from sqlalchemy.ext.asyncio import AsyncConnection


class BaseService:
    def __init__(self, conn: AsyncConnection) -> None:
        self.conn = conn
