from machine import Pin, PWM
import time
from config.constants import WAKE_MELODY

class Buzzer:
    def __init__(self, pin_number: int):
        self._pwm = PWM(Pin(pin_number))
        self._pwm.duty_u16(0)
    
    def play_tone(self, frequency: int, duration: float):
        """Play a single tone for the specified duration"""
        self._pwm.freq(frequency)
        self._pwm.duty_u16(32768)  # 50% duty cycle
        time.sleep(duration)
        self._pwm.duty_u16(0)
    
    def play_melody(self):
        """Play wake-up melody"""
        for freq, duration in WAKE_MELODY:
            self.play_tone(freq, duration)
            time.sleep(0.1)  # Small pause between notes
    
    def stop(self):
        """Stop sound"""
        self._pwm.duty_u16(0)
    
    def cleanup(self):
        """Clean up resources"""
        self._pwm.deinit()
