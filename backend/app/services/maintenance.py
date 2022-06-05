import sqlalchemy
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

from app.core.errors import BaseAppException
from app.services.base import BaseService


class MaintenanceError(BaseAppException):
    def __init__(self, msg, *, status_code=HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(msg, status_code=status_code)


class MaintenanceService(BaseService):
    def __init__(self, conn: AsyncConnection) -> None:
        super().__init__(conn)
        self.conn = conn
        logger.warning(f"MaintenanceService connection: {id(conn)}")

    async def vacuum_analyze(self):
        try:
            iso_level = await self.conn.get_isolation_level()
            await self.conn.commit()
            await (await self.conn.execution_options(isolation_level="AUTOCOMMIT")).execute(
                sqlalchemy.text("vacuum analyze")
            )
        except Exception as e:
            logger.exception(e)
            raise MaintenanceError("vacuum_analyze failed") from e
