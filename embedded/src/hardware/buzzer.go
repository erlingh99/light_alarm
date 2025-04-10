package hardware

import (
	"alarm_project/embedded/src/config"
	"machine"
)

var (
	buzzer    machine.Pin
)

// InitBuzzer initializes the buzzer with PWM control
func InitBuzzer() {
	buzzer = config.BUZZER_PIN
	buzzer.Configure(machine.PinConfig{Mode: machine.PinOutput})
}
