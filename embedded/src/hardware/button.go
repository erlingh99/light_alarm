package hardware

import (
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/machine"
	"time"
)

var (
	buttonState     bool
	lastButtonState bool
	lastDebounceTime time.Time
)

// InitButton initializes the button with pull-up resistor
func InitButton() {
	config.BUTTON_PIN.Configure(machine.PinConfig{
		Mode: machine.PinInputPullup,
	})
}

// IsButtonPressed returns true if the button is pressed (with debouncing)
func IsButtonPressed() bool {
	reading := !config.BUTTON_PIN.Get() // Invert because of pull-up

	// If the button state changed
	if reading != lastButtonState {
		lastDebounceTime = time.Now()
	}

	// If enough time has passed since last change
	if time.Since(lastDebounceTime) > config.BUTTON_DEBOUNCE_TIME {
		// If the button state is different from the last stable state
		if reading != buttonState {
			buttonState = reading
			if buttonState {
				// Button was just pressed, provide visual feedback
				provideButtonFeedback()
			}
		}
	}

	lastButtonState = reading
	return buttonState
}

// provideButtonFeedback gives visual feedback when button is pressed
func provideButtonFeedback() {
	// Save current LED state
	currentPWM := ledPWM.Get()
	currentIntensity := int((currentPWM * 100) / config.PWM_PERIOD)

	// Quick flash pattern
	for i := 0; i < 3; i++ {
		ControlLED(100) // Full brightness
		time.Sleep(50 * time.Millisecond)
		ControlLED(0)   // Off
		time.Sleep(50 * time.Millisecond)
	}

	// Restore previous LED state
	ControlLED(currentIntensity)
} 