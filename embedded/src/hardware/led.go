package hardware

import (
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/log"
	"machine"
)

type LED struct {
	pin       machine.Pin
	pwm       machine.PWM
	pwmCh	  uint8
}

func NewLED() *LED {
	led := &LED{
		pin: config.LED_PIN,
		pwm: machine.PWM4,
	}
	led.pwm.Configure(machine.PWMConfig{
		Period: 1e6, // 1MHz frequency
	})
	ch, err := led.pwm.Channel(led.pin)
	if err != nil {
		log.Error("Failed to configure PWM channel for LED: %v", err)
		panic(err)
	}
	led.pwmCh = ch
	led.SetIntensity(0)
	return led
}

// intensity: 0-100 where 0 is off and 100 is full intensity
func (l *LED) SetIntensity(intensity int) {
	// Ensure intensity is within bounds
	if intensity < 0 {
		intensity = 0
	} else if intensity > 100 {
		intensity = 100
	}
	
	// Convert 0-100 range to 0-pwm.Top for PWM
	pwmValue := uint32((float64(intensity) * l.pwm.Top()) / 100.0)
	l.pwm.Set(l.pwmCh, pwmValue)
}