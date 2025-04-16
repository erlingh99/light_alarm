package main

import (
	"context"
	"time"
	
	"alarm_project/embedded/src/alarm"
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/hardware"
	"alarm_project/embedded/src/http"
	"alarm_project/embedded/src/log"

	"tinygo.org/x/tinywifi"
)

func main() {
	log.Info("Starting Alarm Controller...")

	// Initialize WiFi
	adaptor := &tinywifi.Adaptor{
		SSID: config.WIFI_SSID,
		Password: config.WIFI_PASS,
	}

	log.Info("Connecting to WiFi network: %s", config.WIFI_SSID)
	err := adaptor.Connect()
	if err != nil {
		log.Error("Failed to connect to WiFi: %v", err)
		return
	}
	log.Info("WiFi connected successfully")

	// Create timer for alarm fetching
	fetchTimer := time.NewTimer(time.Second) // Small initial value to fetch immediately
	defer fetchTimer.Stop()

	// Create timer for next alarm
	alarmTimer := time.NewTimer(time.Hour) // Initial value doesn't matter
	alarmTimer.Stop()
	defer alarmTimer.Stop()

	var nextAlarm alarm.Alarm
	var alarmRunning bool = false
	var cancelAlarm context.CancelFunc
	buttonPress := make(chan bool)

	hardware.InitButton(buttonPress)

	for {
		select {
		case <-fetchTimer.C:
			alarms, err := http.FetchAlarms()
			if err != nil {
				log.Error("Error fetching alarms: %v", err)
				fetchTimer.Reset(config.FETCH_INTERVAL)
				continue
			}

			var nextAlarmTime time.Duration
			nextAlarm, nextAlarmTime, err = alarm.FindNextAlarm(alarms)
			if err != nil {
				log.Warn("No alarms found: %v", err)
			} else {
				log.Info("Next alarm '%s' scheduled in %v", nextAlarm.Name, nextAlarmTime)
				alarmTimer.Reset(nextAlarmTime) 
			}
			fetchTimer.Reset(config.FETCH_INTERVAL)

		case <-alarmTimer.C:
			var ctx context.Context
			ctx, cancelAlarm = context.WithCancel(context.Background())
			alarmRunning = true
			fetchTimer.Stop()
			
			go func() {
				defer cancelAlarm()
				manager := alarm.NewAlarmManager(nextAlarm)
				manager.Run(ctx)
				alarmRunning = false
				fetchTimer.Reset(time.Second)
			}()

		case <-buttonPress:
			if alarmRunning {
				log.Info("Alarm cancelled by user")
				cancelAlarm()
				alarmRunning = false
				fetchTimer.Reset(time.Second)
			} else {
				log.Debug("Next alarm: %s at %s (%s)", nextAlarm.Name, nextAlarm.Time, nextAlarm.Recurrence.Type)
			}
		}
	}
}