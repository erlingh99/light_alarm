package hardware

import (
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/log"
	"machine"
	"time"
	"context"
)

const (
	NOTE_C5  = 523 //Hz
	NOTE_D5  = 587
	NOTE_E5  = 659
	NOTE_F5  = 698
	NOTE_G5  = 784
	NOTE_A5  = 880
	NOTE_B5  = 988
	NOTE_C6  = 1047
)

type Note struct {
	Frequency int
	Duration  time.Duration
}

// Buzzer represents a PWM-controlled buzzer
type Buzzer struct {
	pin       machine.Pin
	pwm       machine.PWM
	pwmCh     uint8    
}

func NewBuzzer() *Buzzer {
	buzzer := &Buzzer{
		pin: config.BUZZER_PIN,
		pwm: machine.PWM0,
	}

	err := buzzer.pwm.Configure(machine.PWMConfig{
		Period: 1e6, // 1MHz frequency
	})
	if err != nil {
		log.Error("Failed to configure PWM for buzzer: %v", err)
		panic(err)
	}

	ch, err := buzzer.pwm.Channel(buzzer.pin)
	if err != nil {
		log.Error("Failed to configure PWM channel for buzzer: %v", err)
		panic(err)
	}
	buzzer.pwmCh = ch
	return buzzer
}

func (b *Buzzer) setFrequency(freq int) {
	if freq == 0 {
		b.pin.Low()
		return
	}
	
	b.pwm.Configure(machine.PWMConfig{
		Period: uint64(1e9 / freq), // Convert frequency to period in nanoseconds
	})
	ch, err := b.pwm.Channel(b.pin)
	if err != nil {
		log.Error("Failed to configure PWM channel for buzzer: %v", err)
		panic(err)
	}
	b.pwmCh = ch
	b.pwm.Set(b.pwmCh, b.pwm.Top()/2) // 50% duty cycle for square wave
}

// SetIntensity sets the buzzer intensity using PWM
// intensity: 0-100 where 0 is off and 100 is full intensity
// func (b *Buzzer) SetIntensity(intensity int) {
// 	if intensity < 0 {
// 		intensity = 0
// 	} else if intensity > 100 {
// 		intensity = 100
// 	}
	
// 	// Convert 0-100 range to 0-Top for PWM
// 	pwmValue := uint16((float64(intensity) * b.pwm.Top()) / 100.0)
// 	b.pwm.Set(b.pwmCh, pwmValue)
// }

func (b *Buzzer) PlayWakeUpTune(ctx context.Context) {
	melody := []Note{
		{NOTE_C5, 200 * time.Millisecond},
		{NOTE_E5, 200 * time.Millisecond},
		{NOTE_G5, 200 * time.Millisecond},
		{NOTE_C6, 400 * time.Millisecond},
		{0, 200 * time.Millisecond}, // Pause
		{NOTE_C6, 200 * time.Millisecond},
		{NOTE_G5, 200 * time.Millisecond},
		{NOTE_E5, 200 * time.Millisecond},
		{NOTE_C5, 400 * time.Millisecond},
	}

	for {
		for _, note := range melody {
			select {
			case <-ctx.Done():
				b.setFrequency(0)
				return
			default:
				b.setFrequency(note.Frequency)
				time.Sleep(note.Duration)
			}
		}
		time.Sleep(500 * time.Millisecond) // Pause between repetitions
	}
}
