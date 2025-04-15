package alarm

import (
	"time"
	"alarm_project/embedded/src/log"
)

// calculateTarget creates a time.Time for a given alarm time
func calculateTarget(now time.Time, alarm Alarm) (time.Time, error) {
	targetTime, err := time.Parse("15:04:05", alarm.Time)
	if err != nil {
		return time.Time{}, ErrInvalidTimeFormat
	}
	return time.Date(
		now.Year(),
		now.Month(),
		now.Day(),
		targetTime.Hour(),
		targetTime.Minute(),
		0, 0, time.Local,
	).Add(-time.Duration(alarm.Length) * time.Minute), nil
}

// findNextDailyTrigger calculates the next trigger time for daily alarms
func findNextDailyTrigger(now time.Time, alarm Alarm) (time.Duration, error) {
	target, err := calculateTarget(now, alarm)
	if err != nil {
		return 0, err
	}
	if target.Before(now) {
		target = target.Add(24 * time.Hour)
	}
	return target.Sub(now), nil
}

// findNextWeeklyTrigger calculates the next trigger time for weekly alarms
func findNextWeeklyTrigger(now time.Time, alarm Alarm) (time.Duration, error) {
	if len(alarm.Recurrence.Days) == 0 {
		return 0, ErrInvalidWeekly
	}

	target, err := calculateTarget(now, alarm)
	if err != nil {
		return 0, err
	}

	currentWeekday := int(now.Weekday()) - 1 // Monday is 0 not 1
	var nextAlarm time.Duration
	found := false

	for _, day := range alarm.Recurrence.Days {
		daysToAlarm := day - currentWeekday
		targetWithDays := target.Add(time.Duration(daysToAlarm) * 24 * time.Hour)

		if targetWithDays.Before(now) {
			targetWithDays = targetWithDays.Add(7 * 24 * time.Hour)
		}

		if timeToAlarm := targetWithDays.Sub(now); !found || timeToAlarm < nextAlarm {
			nextAlarm = timeToAlarm
			found = true
		}
	}

	if !found {
		return 0, ErrNoWeeklyFound
	}
	return nextAlarm, nil
}

// findNextCustomTrigger calculates the next trigger time for custom date alarms
func findNextCustomTrigger(now time.Time, alarm Alarm) (time.Duration, error) {
	target, err := calculateTarget(now, alarm)
	if err != nil {
		return 0, err
	}

	var closestAlarm time.Duration
	found := false

	for _, date := range alarm.Recurrence.CustomDates {
		targetWithDate := time.Date(
			date.Year(),
			date.Month(),
			date.Day(),
			target.Hour(),
			target.Minute(),
			0, 0, time.Local,
		)

		if timeToAlarm := targetWithDate.Sub(now); timeToAlarm > 0 && (!found || timeToAlarm < closestAlarm) {
			closestAlarm = timeToAlarm
			found = true
		}
	}

	if !found {
		return 0, ErrNoCustomFound
	}
	return closestAlarm, nil
}

// timeUntilNextTrigger calculates when the next alarm should trigger
func timeUntilNextTrigger(alarm Alarm) (time.Duration, error) {
	now := time.Now()

	switch alarm.Recurrence.Type {
	case "daily":
		return findNextDailyTrigger(now, alarm)
	case "weekly":
		return findNextWeeklyTrigger(now, alarm)
	case "custom":
		return findNextCustomTrigger(now, alarm)
	default:
		return 0, ErrUnknownPattern
	}
}

// FindNextAlarm finds the next alarm that should trigger
func FindNextAlarm(alarms []Alarm) (Alarm, time.Duration, error) {
	var nextAlarm Alarm
	var nextTime time.Duration
	found := false

	for _, alarm := range alarms {
		if !alarm.IsActive {
			continue
		}

		timeUntil, err := timeUntilNextTrigger(alarm)
		if err != nil {
			log.Debug("Skipping alarm '%s': %v", alarm.Name, err)
			continue
		}

		if !found || timeUntil < nextTime {
			nextAlarm = alarm
			nextTime = timeUntil
			found = true
		}
	}

	if !found {
		return Alarm{}, 0, ErrNoAlarms
	}

	return nextAlarm, nextTime, nil
}