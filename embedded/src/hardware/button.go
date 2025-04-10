package hardware

import (
	"alarm_project/embedded/src/config"
	"machine"
	"time"
)

var lastDebounceTime = time.Now()

// InitButton initializes the button with pull-up resistor and sets the interrupt function
func InitButton(buttonPress chan<- bool) {
	config.BUTTON_PIN.Configure(machine.PinConfig{
		Mode: machine.PinInputPullup,
	})

	//setup interrupt
	config.BUTTON_PIN.SetInterrupt(machine.PinFalling,
		func(p machine.Pin) {
			if time.Since(lastDebounceTime) > config.BUTTON_DEBOUNCE_TIME {
				select { //non blocking send
				case buttonPress <- true:
				default:
				}
			}
			lastDebounceTime = time.Now()
		})
}