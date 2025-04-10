package config

import (
	"time"
	"machine"
)

// Hardware pins
const (
	LED_PIN    = machine.Pin(16) // GPIO16
	BUZZER_PIN = machine.Pin(17) // GPIO17
	BUTTON_PIN = machine.Pin(15) // GPIO15
)

// Server configuration
const (
	API_URL = "http://alarm.lan/api/alarms"
)

// Timing configuration
const (
	FETCH_INTERVAL     		= 5 * time.Minute
	BUTTON_DEBOUNCE_TIME 	= 50 * time.Millisecond
)

// HTTP configuration
const (
	HTTP_TIMEOUT = 10 * time.Second
) 