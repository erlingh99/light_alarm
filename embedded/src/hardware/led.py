from machine import Pin, PWM
from config.constants import MAX_DUTY, PWM_FREQ

class LED:
    def __init__(self, pin_number: int):
        self._pwm = PWM(Pin(pin_number))
        self._pwm.freq(PWM_FREQ)
        self._pwm.duty_u16(0)
        self._current_intensity = 0
        
    def set_intensity(self, intensity: int):
        """Set LED intensity from 0-100"""
        self._current_intensity = max(0, min(100, intensity))
        duty = int((self._current_intensity / 100) * MAX_DUTY)
        self._pwm.duty_u16(duty)
    
    def get_intensity(self) -> int:
        """Get current intensity 0-100"""
        return self._current_intensity
    
    def off(self):
        """Turn off the LED"""
        self.set_intensity(0)
    
    def cleanup(self):
        """Clean up resources"""
        self._pwm.deinit()
