from machine import Pin
import time

class Button:
    def __init__(self, pin_number: int):
        self._pin = Pin(pin_number, Pin.IN, Pin.PULL_UP)
        self._last_press = 0
        self._debounce_ms = 100
        
    def is_pressed(self) -> bool:
        """Check if button is currently pressed with debounce"""
        current_time = time.ticks_ms()
        if not self._pin.value():  # Button is active low
            if time.ticks_diff(current_time, self._last_press) > self._debounce_ms:
                self._last_press = current_time
                return True
        return False
    
    def wait_for_press(self, timeout_ms: int = None) -> bool:
        """Wait for button press with optional timeout"""
        start_time = time.ticks_ms()
        while True:
            if self.is_pressed():
                return True
            if timeout_ms is not None:
                if time.ticks_diff(time.ticks_ms(), start_time) > timeout_ms:
                    return False
            time.sleep_ms(10)
