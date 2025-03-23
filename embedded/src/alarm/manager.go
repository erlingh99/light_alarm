package alarm

import (
	"errors"
	"time"

	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/hardware"
)

var (
	ErrNoActiveAlarms = errors.New("no active alarms found")
)

// FindNextAlarm returns the next alarm to trigger, its time until trigger, and any error
func FindNextAlarm(alarms []Alarm) (Alarm, time.Duration, error) {
	var nextAlarm Alarm
	var nextTime time.Duration
	found := false

	for _, alarm := range alarms {
		if !alarm.IsActive {
			continue
		}

		timeUntil, valid := timeUntilNextTrigger(alarm)
		if !valid {
			continue
		}

		if !found || timeUntil < nextTime {
			nextAlarm = alarm
			nextTime = timeUntil
			found = true
		}
	}

	if !found {
		return Alarm{}, 0, ErrNoActiveAlarms
	}

	return nextAlarm, nextTime, nil
}

// Calculate time until next alarm trigger
func timeUntilNextTrigger(alarm Alarm) (time.Duration, bool) {
	// Parse the alarm time (format: "HH:MM")
	targetTime, err := time.Parse("15:04", alarm.Time)
	if err != nil {
		return 0, false
	}

	now := time.Now()
	
	// Create target time for today
	target := time.Date(
		now.Year(),
		now.Month(),
		now.Day(),
		targetTime.Hour(),
		targetTime.Minute(),
		0, 0, time.Local,
	)

	// Handle different recurrence types
	switch alarm.Recurrence.Type {
	case "daily":
		// If the time has already passed today, schedule for tomorrow
		if target.Before(now) {
			target = target.Add(24 * time.Hour)
		}
		return target.Sub(now), true

	case "weekly":
		// If no days specified, treat as daily
		if len(alarm.Recurrence.Days) == 0 {
			if target.Before(now) {
				target = target.Add(24 * time.Hour)
			}
			return target.Sub(now), true
		}

		// Find the next occurrence in the specified days
		currentWeekday := int(now.Weekday())
		nextDay := -1

		// Find the next day in the week
		for _, day := range alarm.Recurrence.Days {
			if day > currentWeekday {
				if nextDay == -1 || day < nextDay {
					nextDay = day
				}
			}
		}

		// If no day found in current week, use the first day of next week
		if nextDay == -1 {
			nextDay = alarm.Recurrence.Days[0]
		}

		// Calculate days until next occurrence
		daysUntil := nextDay - currentWeekday
		if daysUntil <= 0 {
			daysUntil += 7
		}

		// Set target to the next occurrence
		target = target.Add(time.Duration(daysUntil) * 24 * time.Hour)
		return target.Sub(now), true

	case "once":
		// For one-time alarms, check if the time has already passed
		if target.Before(now) {
			return 0, false
		}
		return target.Sub(now), true

	default:
		// Unknown recurrence type
		return 0, false
	}
}

// RunAlarm executes the alarm sequence
func RunAlarm(alarm Alarm) {
	println("Alarm triggered:", alarm.Name)
	
	// Ramp up intensity
	for i := alarm.IntensityCurve.StartIntensity; i <= alarm.IntensityCurve.EndIntensity; i += config.INTENSITY_STEP {
		hardware.ControlLED(i)
		hardware.ControlBuzzer(440, i) // A4 note (440Hz) with current intensity
		time.Sleep(config.INTENSITY_STEP_TIME)
		
		// Check for button press to stop alarm
		if hardware.IsButtonPressed() {
			stopAlarm()
			return
		}
	}

	// Hold at full intensity
	time.Sleep(config.ALARM_HOLD_TIME)

	// Ramp down intensity
	for i := alarm.IntensityCurve.EndIntensity; i >= alarm.IntensityCurve.StartIntensity; i -= config.INTENSITY_STEP {
		hardware.ControlLED(i)
		hardware.ControlBuzzer(440, i) // A4 note (440Hz) with current intensity
		time.Sleep(config.INTENSITY_STEP_TIME)
		
		// Check for button press to stop alarm
		if hardware.IsButtonPressed() {
			stopAlarm()
			return
		}
	}
}

// stopAlarm turns off the LED and buzzer
func stopAlarm() {
	hardware.ControlLED(0)
	hardware.ControlBuzzer(440, 0) // A4 note (440Hz) with 0 intensity
	println("Alarm stopped by button press")
} 