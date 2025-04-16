package config

import (
	"time"
	"machine"
)

// Hardware pins
const (
	LED_PIN    = machine.LED      // GPIO25 on Pico W
	BUZZER_PIN = machine.GPIO16   // PWM-capable pin
	BUTTON_PIN = machine.GPIO15   // With internal pull-up
)

// Server configuration
const (
	API_URL = "http://alarm.lan/api/alarms"
)

// WiFi configuration - These values should be overridden by wifi_config.go
var (
	WIFI_SSID = "default_ssid"
	WIFI_PASS = "default_password"
)

// Timing configuration
const (
	FETCH_INTERVAL     		= 5 * time.Minute
	BUTTON_DEBOUNCE_TIME 	= 50 * time.Millisecond
	HTTP_TIMEOUT 			= 10 * time.Second
)