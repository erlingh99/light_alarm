package config

import (
	"alarm_project/embedded/src/machine"
	"time"
)

// Hardware pins
const (
	LED_PIN    = machine.Pin(16) // GPIO16
	BUZZER_PIN = machine.Pin(17) // GPIO17
	BUTTON_PIN = machine.Pin(15) // GPIO15
)

// Server configuration
const (
	SERVER_URL = "http://192.168.1.100:8000/api/alarms" // Update this with your server URL
)

// Timing configuration
const (
	FETCH_INTERVAL     = 5 * time.Minute
	ALARM_HOLD_TIME = 2 * time.Second
	INTENSITY_STEP_TIME = 100 * time.Millisecond
	INTENSITY_STEP = 10
	BUTTON_DEBOUNCE_TIME = 50 * time.Millisecond
)

// PWM configuration
const (
	PWM_PERIOD = 65535 // 16-bit PWM
	BUZZER_DUTY_CYCLE = 0x7fff
)

// HTTP configuration
const (
	HTTP_TIMEOUT = 10 * time.Second
) 