import json

# WiFi Configuration
WIFI_SSID = "YourSSID"  # Replace with your WiFi SSID
WIFI_PASSWORD = "YourPassword"  # Replace with your WiFi password

# Server Configuration
API_HOST = "http://localhost:8000"  # Replace with your server address
API_ENDPOINT = "/api/alarms"

# Hardware Configuration
LED_PIN = const(25)  # Built-in LED
BUZZER_PIN = const(16)
BUTTON_PIN = const(15)

# Timing Configuration
ALARM_CHECK_INTERVAL = 60  # Seconds between alarm checks
MIN_ALARM_DURATION = 1  # Minimum alarm duration in minutes
MAX_ALARM_DURATION = 60  # Maximum alarm duration in minutes

# LED Configuration
MAX_DUTY = const(65535)  # Maximum PWM duty cycle
PWM_FREQ = const(1000)  # PWM frequency for LED

# Buzzer Configuration
BUZZER_BASE_FREQ = const(440)  # A4 note
WAKE_MELODY = [
    (440, 0.5),  # A4
    (554, 0.5),  # C#5
    (659, 0.5),  # E5
    (880, 1.0),  # A5
]
