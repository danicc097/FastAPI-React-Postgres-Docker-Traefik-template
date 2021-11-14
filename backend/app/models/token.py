from datetime import datetime, timedelta

from pydantic import EmailStr

from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, JWT_AUDIENCE
from app.models.core import CoreModel


class JWTMeta(CoreModel):
    """
    ``iss`` - the issuer of the token (that's us).
    ``aud`` - who this token is intended for.
    ``iat`` - when this token was issued at.
    ``exp`` - when this token expires and is no longer valid proof that the requesting user is logged in.
    """

    iss: str = "myapp.com"
    aud: str = JWT_AUDIENCE
    iat: float = datetime.timestamp(datetime.utcnow())
    exp: float = datetime.timestamp(datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))


class JWTCreds(CoreModel):
    """
    How we'll identify users
    """

    sub: EmailStr
    username: str


class JWTPayload(JWTMeta, JWTCreds):
    """
    JWT Payload right before it's encoded - combine meta and username.
    To be attached to an access_token and sent to the user once we've successfully authenticated them
    """

    pass


class AccessToken(CoreModel):
    """
    ``access_token``: allows for flexibility to modify our authentication system.
    """

    access_token: str
    token_type: str
