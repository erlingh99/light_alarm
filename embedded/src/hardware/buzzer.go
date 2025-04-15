package hardware

import (
	"alarm_project/embedded/src/config"
	"machine"
	"time"
	"context"
)

// Note frequencies in Hz
const (
	NOTE_C5  = 523
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
	intensity uint8
}

// NewBuzzer creates and initializes a new Buzzer instance
func NewBuzzer() *Buzzer {
	buzzer := &Buzzer{
		pin: config.BUZZER_PIN,
	}
	buzzer.init()
	return buzzer
}

// init initializes the buzzer with PWM control
func (b *Buzzer) init() {
	b.pin.Configure(machine.PinConfig{Mode: machine.PinOutput})
}

// setFrequency sets the buzzer frequency in Hz
func (b *Buzzer) setFrequency(freq int) {
	if freq == 0 {
		b.pin.Low()
		return
	}
	
	pwm := machine.PWM{b.pin}
	pwm.Configure(machine.PWMConfig{
		Period: uint64(1e9 / freq), // Convert frequency to period in nanoseconds
	})
	pwm.Set(32767) // 50% duty cycle for square wave
	b.pwm = pwm
}

// SetIntensity sets the buzzer intensity using PWM
// intensity: 0-100 where 0 is off and 100 is full intensity
func (b *Buzzer) SetIntensity(intensity int) {
	// Ensure intensity is within bounds
	if intensity < 0 {
		intensity = 0
	} else if intensity > 100 {
		intensity = 100
	}
	
	// Convert 0-100 range to 0-65535 for PWM
	pwmValue := uint16((float64(intensity) * 65535.0) / 100.0)
	b.pwm.Set(pwmValue)
	b.intensity = uint8(intensity)
}

// GetIntensity returns the current buzzer intensity (0-100)
func (b *Buzzer) GetIntensity() uint8 {
	return b.intensity
}

// PlayWakeUpTune plays a predefined wake-up melody
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
		select {
		case <-ctx.Done():
			b.setFrequency(0)
			return
		default:
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
}
