from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR


class BaseAppException(Exception):  # do NOT use BaseException
    """
    Parent class for all custom exceptions in the application.
    """

    def __init__(self, msg: str, status_code=HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(msg)
        self.msg = msg
        self.status_code = status_code
