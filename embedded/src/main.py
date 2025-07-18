import time
from config.constants import LED_PIN, BUZZER_PIN, BUTTON_PIN, ALARM_CHECK_INTERVAL
from hardware.led import LED
from hardware.buzzer import Buzzer
from hardware.button import Button
from http.client import HTTPClient
from alarm.scheduler import AlarmScheduler
from alarm.manager import AlarmManager
from log.log import log


def main():
    log("Booting alarm controller...")
    led = LED(LED_PIN)
    buzzer = Buzzer(BUZZER_PIN)
    button = Button(BUTTON_PIN)
    http = HTTPClient()
    scheduler = AlarmScheduler()
    manager = AlarmManager(led, buzzer, button)

    while True:
        log("Fetching alarms from server...")
        alarms_data = http.fetch_alarms()
        scheduler.update_alarms(alarms_data)
        next_alarm = scheduler.next_alarm
        if next_alarm:
            t_wait = scheduler.time_until_next()
            log(f"Next alarm: {next_alarm.name} in {int(t_wait)} seconds.")
            if t_wait > 0:
                # Poll for button press to allow cancellation before alarm
                for _ in range(int(t_wait)):
                    if button.is_pressed():
                        log("Alarm cancelled before start by button press.")
                        break
                    time.sleep(1)
            # Run alarm if not cancelled
            if not button.is_pressed():
                manager.run_alarm(next_alarm)
        else:
            log("No active alarms. Sleeping...")
            time.sleep(ALARM_CHECK_INTERVAL)

if __name__ == "__main__":
    main()
