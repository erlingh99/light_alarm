package alarm

import "errors"

// Error definitions for alarm package
var (
	ErrNoAlarms          = errors.New("no coming alarms found")
	ErrInvalidWeekly     = errors.New("alarm type weekly, but no days specified")
	ErrNoWeeklyFound     = errors.New("no coming alarm found, type weekly")
	ErrNoCustomFound     = errors.New("all alarms already elapsed, type custom")
	ErrUnknownPattern    = errors.New("unknown recurrence pattern type")
	ErrInvalidTimeFormat = errors.New("invalid time format, expected HH:MM:SS")
)