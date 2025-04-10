package main

import (
	"time"
	
	"alarm_project/embedded/src/alarm"
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/hardware"
	"alarm_project/embedded/src/http"
)


func main() {
	println("Starting Alarm Controller...")

	// Create timer for alarm fetching
	fetchTimer := time.NewTimer(time.Second) // Small initial value to fetch immediately
	defer fetchTimer.Stop()

	// Create timer for next alarm
	alarmTimer := time.NewTimer(time.Hour) // Initial value doesn't matter
	alarmTimer.Stop()
	defer alarmTimer.Stop()

	var nextAlarm alarm.Alarm
	var alarmRunning bool = false

	done := make(chan bool)
	buttonPress := make(chan bool)

	hardware.InitLED()
	hardware.InitBuzzer()
	hardware.InitButton(buttonPress)

	for {
		select {
		case <-fetchTimer.C:
			alarms, err := http.FetchAlarms()
			if err != nil {
				println("Error fetching alarms:", err.Error())
				fetchTimer.Reset(config.FETCH_INTERVAL)
				continue
			}

			var nextAlarmTime time.Duration
			nextAlarm, nextAlarmTime, err = alarm.FindNextAlarm(alarms)
			if err != nil {
				println("No active alarms found")
			} else {
				alarmTimer.Reset(nextAlarmTime)
			}
			fetchTimer.Reset(config.FETCH_INTERVAL)

		case <-alarmTimer.C:
			go alarm.RunAlarm(nextAlarm, done) // Start alarm sequence. Reports done via channel
			fetchTimer.Stop() //stop fetching until alarm is finished
			alarmRunning = true

		case <-done: //alarm finished, 
			fetchTimer.Reset(time.Second) //fetch immediately
			alarmRunning = false

		case <-buttonPress:

			if alarmRunning {
				alarmRunning = false
				done <- true //stop running alarm BIG ISSUE HERE done is read by main thread AND coroutine
			}
		}
	}
} 