package main

import (
	"time"
	
	"alarm_project/embedded/src/machine" //"machine"
	"alarm_project/embedded/src/alarm"
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/hardware"
	"alarm_project/embedded/src/http"
)

// Initialize hardware
func init() {
	// Initialize LED
	hardware.InitLED()

	// Initialize buzzer
	hardware.InitBuzzer()

	// Initialize button
	hardware.InitButton()

	// Initialize serial for debugging
	machine.Serial.Configure(machine.UARTConfig{
		BaudRate: 115200,
	})
}

// Main loop
func main() {
	println("Starting ESP32 Alarm Controller...")

	// Create timer for alarm fetching
	fetchTimer := time.NewTimer(config.FETCH_INTERVAL)
	defer fetchTimer.Stop()

	// Create timer for next alarm
	alarmTimer := time.NewTimer(time.Hour) // Initial value doesn't matter
	alarmTimer.Stop()
	defer alarmTimer.Stop()

	var alarms []alarm.Alarm
	var nextAlarm alarm.Alarm

	// Initial alarm fetch
	alarms, err := http.FetchAlarms()
	if err != nil {
		println("Error fetching alarms:", err.Error())
	}

	for {
		select {
		case <-fetchTimer.C:
			// Fetch new alarms
			alarms, err = http.FetchAlarms()
			if err != nil {
				println("Error fetching alarms:", err.Error())
				continue
			}

			// Find next alarm
			var nextAlarmTime time.Duration
			nextAlarm, nextAlarmTime, err = alarm.FindNextAlarm(alarms)
			if err != nil {
				println("No active alarms found")
				nextAlarmTime = config.FETCH_INTERVAL
			}

			// Reset fetch timer
			fetchTimer.Reset(config.FETCH_INTERVAL)

			// Set alarm timer if we found a valid next alarm
			if nextAlarmTime < config.FETCH_INTERVAL {
				alarmTimer.Reset(nextAlarmTime)
			}

		case <-alarmTimer.C:
			// Start alarm sequence in a new goroutine
			go alarm.RunAlarm(nextAlarm)

			// Find next alarm
			var nextAlarmTime time.Duration
			nextAlarm, nextAlarmTime, err = alarm.FindNextAlarm(alarms)
			if err != nil {
				println("No active alarms found")
				nextAlarmTime = config.FETCH_INTERVAL
			}

			// Set next alarm timer if we found a valid next alarm
			if nextAlarmTime < config.FETCH_INTERVAL {
				alarmTimer.Reset(nextAlarmTime)
			}
		}
	}
} 