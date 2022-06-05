from datetime import datetime, timedelta
from typing import Optional, Union

import bcrypt
import jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext
from pydantic import ValidationError

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_AUDIENCE,
    UNIQUE_KEY,
)
from app.core.errors import BaseAppException
from app.db.gen.queries.users import GetUserRow, RegisterNewUserRow
from app.models.token import JWTCreds, JWTMeta, JWTPayload
from app.models.user import UserPasswordRegistration

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthException(BaseAppException):
    pass


class AuthService:
    def create_salt_and_hashed_password(self, *, plaintext_password: str) -> UserPasswordRegistration:
        salt = self.generate_salt()
        hashed_password = self.hash_password(password=plaintext_password, salt=salt)

        return UserPasswordRegistration(salt=salt, password=hashed_password)

    def generate_salt(self) -> str:
        return bcrypt.gensalt().decode()

    def hash_password(self, *, password: str, salt: str) -> str:
        return pwd_context.hash(password + salt)

    def verify_password(self, *, password: str, salt: str, hashed_pw: str) -> bool:
        return pwd_context.verify(password + salt, hashed_pw)

    def create_access_token_for_user(
        self,
        *,
        user: Union[RegisterNewUserRow, GetUserRow],
        secret_key: str = str(UNIQUE_KEY),
        audience: str = JWT_AUDIENCE,
        expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES,
    ) -> Optional[str]:
        if not user:
            return None

        jwt_meta = JWTMeta(
            aud=audience,
            iat=datetime.timestamp(datetime.utcnow()),
            exp=datetime.timestamp(datetime.utcnow() + timedelta(minutes=expires_in)),
        )
        jwt_creds = JWTCreds(sub=user.email, username=user.username)
        token_payload = JWTPayload(
            **jwt_meta.dict(),
            **jwt_creds.dict(),
        )

        return jwt.encode(token_payload.dict(), secret_key, algorithm=JWT_ALGORITHM)

    def get_username_from_token(self, *, token: str, secret_key: str) -> Optional[str]:
        try:
            decoded_token = jwt.decode(token, secret_key, audience=JWT_AUDIENCE, algorithms=[JWT_ALGORITHM])

            payload = JWTPayload(**decoded_token)
        except (jwt.PyJWTError, ValidationError) as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate token credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from e

        return payload.username
