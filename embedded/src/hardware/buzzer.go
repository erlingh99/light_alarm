package hardware

import (
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/machine"
)

var (
	buzzer    machine.Pin
	buzzerPWM *machine.PWM
)

// InitBuzzer initializes the buzzer with PWM control
func InitBuzzer() {
	buzzer = config.BUZZER_PIN
	buzzer.Configure(machine.PinConfig{Mode: machine.PinOutput})
	buzzerPWM = &machine.PWM{Pin: config.BUZZER_PIN}
	buzzerPWM.Configure(machine.PWMConfig{
		Period: config.PWM_PERIOD,
	})
}

// ControlBuzzer sets the buzzer frequency and intensity
func ControlBuzzer(frequency int, intensity int) {
	// Convert frequency to period
	period := uint32(config.PWM_PERIOD / uint32(frequency))
	
	// Convert 0-100 intensity to PWM value (0-65535)
	duty := uint32((intensity * int(period)) / 100)
	
	// Set PWM period and duty cycle
	buzzerPWM.SetPeriod(period)
	buzzerPWM.Set(duty)
} 