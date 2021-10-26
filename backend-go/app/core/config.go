package core

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"runtime"

	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
)

var validate = validator.New()

// to be synced with json config files fields
type Config struct {
	Authentication struct {
		AccessTokenExpireMinutes int    `json:"accessTokenExpireMinutes" validate:"required"`
		UniqueKey                string `json:"uniqueKey" validate:"required"`
	} `json:"authentication" validate:"required"`
	Database struct {
		DB       string `json:"db" validate:"required"`
		Password string `json:"password" validate:"required"`
		Port     int    `json:"port" validate:"required"`
		Server   string `json:"server" validate:"required"`
		User     string `json:"user" validate:"required"`
	} `json:"database" validate:"required"`
}

var (
	localConfigFilePath    = filepath.Join(GetRuntimeDirectory(), "config/%s.json")
	globalConfigFilePath   = "/etc/%s/config/%s.json"
	unspecifiedEnvironment = ""
	devEnvironment         = "dev"
)

type Options struct {
	AppName            string `validate:"required"`
	Environment        string `validate:"required"`
	LocalPathOverride  string
	GlobalPathOverride string
}

func GetEnvironmentName() string {
	if IsE2E() {
		return "e2e"
	} else if IsProd() {
		return "prod"
	} else if IsCICD() {
		return "ci"
	} else {
		return devEnvironment
	}
}

func LoadConfigForEnvironment(configuration interface{}, options *Options) error {
	if err := validate.Struct(options); err != nil {
		return fmt.Errorf("failed to validate options: %v", err)
	}
	localConfigFilePath, err := getConfigFilePath(options)
	if err != nil {
		return err
	}
	return loadConfig(localConfigFilePath, configuration)
}

func getConfigFilePath(options *Options) (string, error) {
	localFileName := ""
	if options.LocalPathOverride != "" {
		localFileName = options.LocalPathOverride
	} else {
		localFileName = os.Getenv("GOPATH") + getLocalFilePath(options)
	}

	if _, err := os.Stat(localFileName); !os.IsNotExist(err) {
		return localFileName, nil
	}

	globalFileName := ""
	if options.GlobalPathOverride != "" {
		globalFileName = options.GlobalPathOverride
	} else {
		globalFileName = fmt.Sprintf(globalConfigFilePath, options.AppName, options.Environment)
	}

	if _, err := os.Stat(globalFileName); os.IsNotExist(err) {
		return "", err
	}
	return globalFileName, nil
}

func getLocalFilePath(options *Options) string {
	return fmt.Sprintf(localConfigFilePath, options.Environment)
}

func loadConfig(filePath string, configOptions interface{}) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open config file: %v", err)
	}

	decoder := json.NewDecoder(file)

	if err := decoder.Decode(configOptions); err != nil {
		return fmt.Errorf("failed to parse configuration file: %v", err)
	}

	if err := validate.Struct(configOptions); err != nil {
		return fmt.Errorf("failed to validate configuration file: %v", err)
	}

	return nil
}

func GetExecutableDirectory() string {
	ex, _ := os.Executable()
	dir := filepath.Dir(ex)
	return dir
}

func GetCurrentWorkingDirectory() string {
	dir, _ := os.Getwd()
	return dir
}

func GetRuntimeDirectory() string {
	_, b, _, _ := runtime.Caller(0)
	dir := path.Join(path.Dir(b))
	return dir
}

const (
	ProjectName = "MY APP"
	Version     = "1.0.0"
	ApiPrefix   = "/api"
)

func setupLogger() {
	logLevel := logrus.DebugLevel
	if IsProd() {
		logLevel = logrus.InfoLevel
	}
	logrus.SetReportCaller(true)
	logrus.SetLevel(logLevel)
	logrus.SetFormatter(&logrus.TextFormatter{FullTimestamp: true, TimestampFormat: "02/Jan/2006:15:04:05 -0700"})

	filename := fmt.Sprintf("%s/logs/%s.log", GetCurrentWorkingDirectory(), GetEnvironmentName())
	os.MkdirAll(filepath.Dir(filename), 0755)
	f, err := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		logrus.Error("Error opening log file %v: %v", filename, err)
	}
	mw := io.MultiWriter(os.Stdout, f) // output to stdout and file
	logrus.SetOutput(mw)
}

func ConfigureApp() {

	setupLogger()

	options := Options{
		AppName:     "myapp",
		Environment: GetEnvironmentName(),
	}

	cfg := Config{}
	if err := LoadConfigForEnvironment(&cfg, &options); err != nil {
		logrus.Fatal(err)
	}
	logrus.Printf("Config{}: %+v", cfg)
	logrus.Printf("Options{}: %+v", options)
	logrus.Infof("Running myapp in environment: %s", GetEnvironmentName())
	logrus.Info("Current directory: ", os.Getenv("PWD"))
	logrus.Info("Executable directory: ", GetExecutableDirectory())
	logrus.Info("Runtime directory of file: ", GetRuntimeDirectory())
}
