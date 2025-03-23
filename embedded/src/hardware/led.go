package hardware

import (
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/machine"
)

var (
	led    machine.Pin
	ledPWM *machine.PWM
)

// InitLED initializes the LED with PWM control
func InitLED() {
	led = config.LED_PIN
	led.Configure(machine.PinConfig{Mode: machine.PinOutput})
	ledPWM = &machine.PWM{Pin: config.LED_PIN}
	ledPWM.Configure(machine.PWMConfig{
		Period: config.PWM_PERIOD,
	})
}

// ControlLED sets the LED intensity using PWM
func ControlLED(intensity int) {
	// Convert 0-100 intensity to PWM value (0-65535)
	pwmValue := uint32((intensity * config.PWM_PERIOD) / 100)
	
	// Set PWM duty cycle
	ledPWM.Set(pwmValue)
} 