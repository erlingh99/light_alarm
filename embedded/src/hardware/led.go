package hardware

import (
	"alarm_project/embedded/src/config"
	"machine"
)

var (
	led     machine.Pin
)

// InitLED initializes the LED with PWM control
func InitLED() {
	led = config.LED_PIN
	led.Configure(machine.PinConfig{Mode: machine.PinOutput})
}