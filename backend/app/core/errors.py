from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR


class BaseAppException(Exception):
    def __init__(self, msg: str, status_code=HTTP_500_INTERNAL_SERVER_ERROR, user=""):
        super().__init__(msg)
        self.user = user
        self.msg = msg
        self.status_code = status_code
