package alarm

import (
	"errors"
	"time"

	"alarm_project/embedded/src/config"
)

var (
	ErrorNoAlarms = errors.New("No coming alarms found")
	ErrorWeeklyBad = errors.New("Alarm type weekly, but no days specified")
	ErrorWeeklyNotFound = errors.New("No coming alarm found, type weekly")
	ErrorCustomNotFound = errors.New("All alarms already elapsed, type custom")
)

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
			println(err)
			continue
		}

		if !found || timeUntil < nextTime {
			nextAlarm = alarm
			nextTime = timeUntil
			found = true
		}
	}

	if !found {
		return Alarm{}, 0, ErrorNoAlarms
	}

	return nextAlarm, nextTime, nil
}

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
			target = target.Add(time.Hour*24)
		}
		return target.Sub(now), nil

	case "weekly":
		if len(alarm.Recurrence.Days) == 0 {
			return 0, ErrorWeeklyBad
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
				target = target.Add(time.Hour*24*7)
			}

			if time_to_alarm := target.Sub(now); !found || time_to_alarm < next_alarm {
				next_alarm = time_to_alarm
				found = true
			}
		}

		if !found {
			return 0, ErrorWeeklyNotFound
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
			return 0, ErrorCustomNotFound
		}
		return closestAlarm, nil

	default:
		return 0, errors.New("Unknown recurrence type: " + alarm.Recurrence.Type)
	}
}

func RunAlarm(alarm Alarm, done chan<- bool) {
	println("Alarm triggered:", alarm.Name)
	config.LED_PIN.Set(true)
	time.Sleep(time.Minute*time.Duration(alarm.Length))
	config.LED_PIN.Set(false)
	done <- true
}

