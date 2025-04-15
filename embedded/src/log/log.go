package log

import (
	"fmt"
	"time"
)

type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
)

var currentLevel = INFO

func SetLevel(level Level) {
	currentLevel = level
}

func log(level Level, format string, args ...interface{}) {
	if level >= currentLevel {
		now := time.Now().Format("15:04:05")
		levelStr := "INFO"
		switch level {
		case DEBUG:
			levelStr = "DEBUG"
		case WARN:
			levelStr = "WARN"
		case ERROR:
			levelStr = "ERROR"
		}
		fmt.Printf("[%s] %s: %s\n", now, levelStr, fmt.Sprintf(format, args...))
	}
}

func Debug(format string, args ...interface{}) {
	log(DEBUG, format, args...)
}

func Info(format string, args ...interface{}) {
	log(INFO, format, args...)
}

func Warn(format string, args ...interface{}) {
	log(WARN, format, args...)
}

func Error(format string, args ...interface{}) {
	log(ERROR, format, args...)
}