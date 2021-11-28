package web

import (
	"os"
	"strconv"

	"github.com/pkg/errors"
)

func IsE2E() bool {
	return os.Getenv("APP_ENV") == "e2e"
}

func IsDev() bool {
	return os.Getenv("APP_ENV") == "development"
}

func IsProd() bool {
	return os.Getenv("APP_ENV") == "production"
}

func IsTesting() bool {
	_, err := getenvBool("TESTING")
	return err == nil
}

func IsCICD() bool {
	_, err := getenvBool("CICD")
	return err == nil
}

var errEnvVarEmpty = errors.New("getenv: environment variable empty")

func getenvStr(key string) (string, error) {
	v := os.Getenv(key)
	if v == "" {
		return v, errors.Wrap(errEnvVarEmpty, key)

	}
	return v, nil
}

func getenvInt(key string) (int, error) {
	s, err := getenvStr(key)
	if err != nil {
		return 0, err
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return 0, err
	}
	return v, nil
}

func getenvBool(key string) (bool, error) {
	s, err := getenvStr(key)
	if err != nil {
		return false, err
	}
	v, err := strconv.ParseBool(s)
	if err != nil {
		return false, err
	}
	return v, nil
}
