package hardware

import (
	"alarm_project/embedded/src/config"
	"machine"
)

// LED represents a PWM-controlled LED
type LED struct {
	pin       machine.Pin
	pwm       machine.PWM
	intensity uint8
}

// NewLED creates and initializes a new LED instance
func NewLED() *LED {
	led := &LED{
		pin: config.LED_PIN,
	}
	led.init()
	return led
}

// init initializes the LED with PWM control
func (l *LED) init() {
	pwm := machine.PWM{l.pin}
	pwm.Configure(machine.PWMConfig{
		Period: 1e6, // 1MHz frequency
	})
	l.pwm = pwm
	l.SetIntensity(0)
}

// SetIntensity sets the LED intensity using PWM
// intensity: 0-100 where 0 is off and 100 is full intensity
func (l *LED) SetIntensity(intensity int) {
	// Ensure intensity is within bounds
	if intensity < 0 {
		intensity = 0
	} else if intensity > 100 {
		intensity = 100
	}
	
	// Convert 0-100 range to 0-65535 for PWM
	pwmValue := uint16((float64(intensity) * 65535.0) / 100.0)
	l.pwm.Set(pwmValue)
	l.intensity = uint8(intensity)
}

// GetIntensity returns the current LED intensity (0-100)
func (l *LED) GetIntensity() uint8 {
	return l.intensity
}