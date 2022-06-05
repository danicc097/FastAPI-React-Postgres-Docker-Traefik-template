from loguru import logger
from sqlalchemy.ext.asyncio import AsyncConnection
from starlette.status import (
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_500_INTERNAL_SERVER_ERROR,
)

from app.core.errors import BaseAppException
from app.db.gen.queries import password_reset_requests
from app.db.gen.queries.password_reset_requests import (
    CreatePasswordResetRequestParams,
)
from app.services.base import BaseService


class PwdResetReqError(BaseAppException):
    def __init__(self, msg, *, status_code=HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(msg, status_code=status_code)


class PwdResetReqService(BaseService):
    def __init__(self, conn: AsyncConnection) -> None:
        super().__init__(conn)
        self.prr_querier = password_reset_requests.AsyncQuerier(conn)
        logger.warning(f"PwdResetReqService connection: {id(conn)}")

    async def create_password_reset_request(self, *, reset_request: CreatePasswordResetRequestParams):
        try:
            prr = await self.prr_querier.create_password_reset_request(arg=reset_request)
        except Exception as e:
            raise PwdResetReqError(
                "A request to reset your password already exists.", status_code=HTTP_409_CONFLICT
            ) from e

        if not prr:
            return None
        return prr

    async def list_all_password_request_users(self):
        return [i async for i in self.prr_querier.get_password_reset_requests()]

    async def delete_password_reset_request(self, *, id: int):

        deleted_request = await self.prr_querier.delete_password_reset_request(password_reset_request_id=id)
        if not deleted_request:
            raise PwdResetReqError("The given password reset request does not exist.", status_code=HTTP_404_NOT_FOUND)
        return deleted_request
