package alarm

import (
	"context"
	"time"

	"alarm_project/embedded/src/hardware"
	"alarm_project/embedded/src/log"
)

// AlarmManager handles the execution of an alarm
type AlarmManager struct {
	led    *hardware.LED
	buzzer *hardware.Buzzer
	alarm  Alarm
}

// NewAlarmManager creates a new alarm manager instance
func NewAlarmManager(alarm Alarm) *AlarmManager {
	return &AlarmManager{
		led:    hardware.NewLED(),
		buzzer: hardware.NewBuzzer(),
		alarm:  alarm,
	}
}

// Run executes the alarm sequence
func (r *AlarmManager) Run(ctx context.Context) {
	log.Info("Alarm triggered: %s", r.alarm.Name)
	
	startTime := time.Now()
	ticker := time.NewTicker(50 * time.Millisecond)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			elapsed := time.Since(startTime)
			progress := float64(elapsed) / float64(time.Minute*time.Duration(r.alarm.Length))
			
			if progress >= 1.0 {
				log.Debug("Alarm '%s' intensity curve complete, starting wake-up tune", r.alarm.Name)
				go r.buzzer.PlayWakeUpTune(ctx)
				r.led.SetIntensity(r.alarm.IntensityCurve.EndIntensity)
				
				<-ctx.Done()
				r.cleanup()
				log.Info("Alarm '%s' completed", r.alarm.Name)
				return
			}
			
			intensity := applyIntensityCurve(r.alarm.IntensityCurve, progress)
			r.led.SetIntensity(intensity)
			
		case <-ctx.Done():
			log.Info("Alarm '%s' interrupted", r.alarm.Name)
			r.cleanup()
			return
		}
	}
}

// cleanup ensures all hardware is properly reset
func (r *AlarmManager) cleanup() {
	r.led.SetIntensity(0)
}

