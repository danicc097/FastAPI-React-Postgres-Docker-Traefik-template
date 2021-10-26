/*from datetime import datetime, timedelta
from typing import Optional, Type

import bcrypt
import jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext
from pydantic import ValidationError

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_AUDIENCE,
    JWT_TOKEN_PREFIX,
    UNIQUE_KEY,
)
from app.models.token import JWTCreds, JWTMeta, JWTPayload
from app.models.user import UserBase, UserInDB, UserPasswordRegistration

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthException(Exception):
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
        # switching to the parent class that both UserInDB and UserPublic inherit from
        # - UserBase. This ensures that our access token is created for instances of
        # both models without failure.
        user: UserBase,
        secret_key: str = str(UNIQUE_KEY),
        audience: str = JWT_AUDIENCE,
        expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES,
    ) -> Optional[str]:
        if not user or not isinstance(user, UserBase):
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
        # NOTE - previous versions of pyjwt ("<2.0") returned the token as bytes insted of a string.
        # That is no longer the case and the `.decode("utf-8")` has been removed.
        access_token = jwt.encode(token_payload.dict(), secret_key, algorithm=JWT_ALGORITHM)

        return access_token

    def get_username_from_token(self, *, token: str, secret_key: str) -> Optional[str]:
        try:
            decoded_token = jwt.decode(
                token,
                str(secret_key),
                audience=JWT_AUDIENCE,
                algorithms=[JWT_ALGORITHM],
            )
            payload = JWTPayload(**decoded_token)
        except (jwt.PyJWTError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate token credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload.username
*/

package services

import (
	"backend/app/models"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	CreateSaltAndHashedPassword(plaintextPassword string) models.UserPasswordRegistration
	HashPassword(password string) string
	VerifyPassword(password string, hashedPw string) bool
	CreateAccessTokenForUser(user models.UserBase, secretKey string, audience string, expiresIn int) string
	GetUsernameFromToken(token string, secretKey string) string
}

type AuthServiceImpl struct {
}

func (authService AuthServiceImpl) CreateSaltAndHashedPassword(plaintextPassword []byte) models.UserPasswordRegistration {
	hashedPw := authService.HashPassword(plaintextPassword)

	return models.UserPasswordRegistration{
		Password: hashedPw,
	}
}

func (authService AuthServiceImpl) HashPassword(password []byte) string {
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	return string(hash)
}

func (authService AuthServiceImpl) VerifyPassword(hashedPw []byte, password []byte) bool {
	err := bcrypt.CompareHashAndPassword(hashedPw, password)
	return err == nil
}

func (authService AuthServiceImpl) CreateAccessTokenForUser(user models.UserBase, secretKey string, audience string, expiresIn int) string {
	// if !user.IsValid() {
	// 	return ""
	// }

	jwtMeta := models.JWTMeta{
		Audience:   audience,
		IssuedAt:   time.Now().Unix(),
		Expiration: time.Now().Unix() + int64(expiresIn),
	}

	jwtCreds := models.JWTCreds{
		Subject:  user.Email,
		Username: user.Username,
	}

	tokenPayload := models.JWTPayload{
		JWTMeta:  jwtMeta,
		JWTCreds: jwtCreds,
	}
	// accessToken := jwt.encode(tokenPayload.dict(), secretKey, algorithm=JWT_ALGORITHM)
	return "TEST "
}

func (authService AuthServiceImpl) GetUsernameFromToken(token string, secretKey string) string {
	// decodedToken := jwt.decode(token, secretKey, audience=JWT_AUDIENCE, algorithms=[JWT_ALGORITHM])
	// payload := JWTPayload(**decodedToken)
	// payload := models.JWTPayload{
	// 	Username: "TEST - " + token,
	// }
	// return payload.Username
	return "TEST "
}