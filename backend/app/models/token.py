from datetime import datetime, timedelta

from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, JWT_AUDIENCE
from app.models.core import CoreModel


class JWTMeta(CoreModel):

    iss: str = "myapp.com"
    aud: str = JWT_AUDIENCE
    iat: float = datetime.timestamp(datetime.utcnow())
    exp: float = datetime.timestamp(datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))


class JWTCreds(CoreModel):

    sub: str
    username: str


class JWTPayload(JWTMeta, JWTCreds):

    pass


class AccessToken(CoreModel):

    access_token: str
    token_type: str
