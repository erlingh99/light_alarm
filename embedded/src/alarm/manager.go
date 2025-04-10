package alarm

import (
	"errors"
	"fmt"
	"time"

	"alarm_project/embedded/src/config"
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

		timeUntil, err := timeUntilNextTrigger(alarm)
		if err != nil {
			fmt.Println(err)
			continue
		}

		if !found || timeUntil < nextTime {
			nextAlarm = alarm
			nextTime = timeUntil
			found = true
		}
	}

	if !found {
		return Alarm{}, 0, errors.New("no active alarms found")
	}

	return nextAlarm, nextTime, nil
}

// Calculate time until next alarm trigger
func timeUntilNextTrigger(alarm Alarm) (time.Duration, error) {
	// Parse the alarm time (format: "hh:mm:ss")
	targetTime, err := time.Parse("15:04:05", alarm.Time)
	if err != nil {
		return 0, err
	}

	now := time.Now()
	
	switch alarm.Recurrence.Type {
	case "daily":
		target := time.Date(
			now.Year(),
			now.Month(),
			now.Day(),
			targetTime.Hour(),
			targetTime.Minute(),
			0, 0, time.Local,
		).Add(-time.Duration(alarm.Length)*time.Minute)

		if target.Before(now) {
			target.Add(time.Hour*24)
		}
		return target.Sub(now), nil

	case "weekly":
		if len(alarm.Recurrence.Days) == 0 {
			return 0, errors.New("Alarm type weekly, but no days specified")
		}

		currentWeekday := int(now.Weekday()) - 1 //Monday is 0 not 1
		var next_alarm time.Duration
		found := false

		for _, day := range alarm.Recurrence.Days {
			days_to_alarm := day - currentWeekday
			target := time.Date(
				now.Year(),
				now.Month(),
				now.Day(),
				targetTime.Hour(),
				targetTime.Minute(),
				0, 0, time.Local,
			).Add(-time.Duration(alarm.Length)*time.Minute + time.Duration(days_to_alarm)*time.Hour*24)

			if target.Before(now) {
				target.Add(time.Hour*24*7)
			}

			if time_to_alarm := target.Sub(now); !found || time_to_alarm < next_alarm {
				next_alarm = time_to_alarm
			}
		}

		if !found {
			return 0, errors.New("No alarm coming alaram found, type weekly")
		}
		return next_alarm, nil

	case "custom":
		var closestAlarm time.Duration
		found := false
		for _, day := range alarm.Recurrence.CustomDates { //assume not sorted
			target := time.Date(
				day.Year(),
				day.Month(),
				day.Day(),
				targetTime.Hour(),
				targetTime.Minute(),
				0, 0, time.Local,
			).Add(-time.Duration(alarm.Length)*time.Minute)

			if time_to_alarm := target.Sub(now); time_to_alarm > 0 && (!found || time_to_alarm < closestAlarm) {
				closestAlarm = time_to_alarm
				found = true
			}
		}
		
		if !found {
			return 0, errors.New("All alarms already elapsed, type custom")
		}
		return closestAlarm, nil

	default:
		return 0, errors.New("Unknown recurrence type: " + alarm.Recurrence.Type)
	}
}

// RunAlarm executes the alarm sequence
func RunAlarm(alarm Alarm, done chan<- bool) {
	println("Alarm triggered:", alarm.Name)
	config.LED_PIN.Set(true)
	time.Sleep(time.Minute*time.Duration(alarm.Length))
	config.LED_PIN.Set(false)
	done <- true
}

