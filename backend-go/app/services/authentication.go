package services

import (
	"backend/app/models"
	"os"
	"strconv"

	"github.com/golang-jwt/jwt"
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

func CreateToken(userid uint64) (string, error) {
	var err error
	//Creating Access Token
	os.Getenv("UNIQUE_KEY")
	os.Getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
	accessTokenExpireMinutes, err := strconv.Atoi(os.Getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
	if err != nil {
		panic(err)
	}
	// ACCESS_TOKEN_EXPIRE_MINUTES
	atClaims := jwt.MapClaims{}
	atClaims["authorized"] = true
	atClaims["user_id"] = userid
	atClaims["exp"] = accessTokenExpireMinutes
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)
	token, err := at.SignedString([]byte(os.Getenv("ACCESS_SECRET")))
	if err != nil {
		return "", err
	}
	return token, nil
}

func (authService AuthServiceImpl) CreateAccessTokenForUser(user models.UserBase, secretKey string, audience string, expiresIn int) {
}

// func (authService AuthServiceImpl) GetUsernameFromToken(token string, secretKey string) string {

// }
