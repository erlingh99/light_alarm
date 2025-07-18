import time
from alarm.intensity import get_intensity
from log.log import log

class AlarmManager:
    def __init__(self, led, buzzer, button):
        self.led = led
        self.buzzer = buzzer
        self.button = button

    def run_alarm(self, alarm):
        log(f"Alarm '{alarm.name}' triggered!")
        duration = alarm.length * 60  # minutes to seconds
        start = alarm.intensity_curve.start_intensity
        end = alarm.intensity_curve.end_intensity
        curve_type = alarm.intensity_curve.curve
        hyper = alarm.intensity_curve.hyper_parameter
        points = alarm.intensity_curve.control_points
        t0 = time.time()
        cancelled = False
        while True:
            elapsed = time.time() - t0
            t = min(1.0, elapsed / duration)
            intensity = int(get_intensity(curve_type, start, end, t, hyper, points))
            self.led.set_intensity(intensity)
            if self.button.is_pressed():
                log("Alarm cancelled by button press.")
                cancelled = True
                break
            if elapsed >= duration:
                break
            time.sleep(0.1)
        self.led.set_intensity(end)
        if not cancelled:
            self.buzzer.play_melody()
        self.led.off()
        self.buzzer.stop()
        log(f"Alarm '{alarm.name}' finished.")
