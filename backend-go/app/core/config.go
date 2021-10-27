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
	"gopkg.in/natefinch/lumberjack.v2"
)

// var validate *validator.Validate // per docs, yet -> SIGSEGV
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
	localConfigPath  = filepath.Join(GetFileRuntimeDirectory(), "config/%s.json")
	globalConfigPath = "/etc/%s/config/%s.json" // default cfg if no local found
	devEnvironment   = "dev"
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

	localConfigPath, err := getConfigFilePath(options)
	if err != nil {
		return err
	}

	return loadConfig(localConfigPath, configuration)
}

func getConfigFilePath(options *Options) (string, error) {
	localFileName := ""
	if options.LocalPathOverride != "" {
		localFileName = options.LocalPathOverride
	} else {
		localFileName = getLocalFilePath(options)
	}

	if _, err := os.Stat(localFileName); !os.IsNotExist(err) {
		return localFileName, nil
	}

	// if no local config present, try global
	globalFileName := ""
	if options.GlobalPathOverride != "" {
		globalFileName = options.GlobalPathOverride
	} else {
		globalFileName = fmt.Sprintf(globalConfigPath, options.AppName, options.Environment)
	}

	if _, err := os.Stat(globalFileName); os.IsNotExist(err) {
		return "", err
	}
	return globalFileName, nil
}

func getLocalFilePath(options *Options) string {
	return fmt.Sprintf(localConfigPath, options.Environment)
}

func loadConfig(filePath string, configOptions interface{}) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open config file: %v", err)
	}

	decoder := json.NewDecoder(file)

	if err := decoder.Decode(configOptions); err != nil {
		return fmt.Errorf("failed to parse config file: %v", err)
	}

	if err := validate.Struct(configOptions); err != nil {
		return fmt.Errorf("failed to validate config file: %v", err)
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

// Returns the directory of the file this function lives in.
func GetFileRuntimeDirectory() string {
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
	mw := io.MultiWriter(os.Stdout, &lumberjack.Logger{
		Filename:   filename,
		MaxSize:    30, // megabytes
		MaxBackups: 3,
		MaxAge:     28,   //days
		Compress:   true, // disabled by default
	})
	// output to both stdout and rotated log file
	logrus.SetOutput(mw)
}

func ConfigureApp() {

	setupLogger()
	logrus.Infof("Loading config from %s", GetFileRuntimeDirectory())

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
}
