# Raspberry Pi Pico W Alarm Controller

This is the embedded component of the alarm project, running on a Raspberry Pi Pico W microcontroller. It fetches alarms from the server and controls an LED and buzzer based on the alarm settings. This is a rust project. The data is fetched from an API endpoint found in the config. The structure of the data is found in /backend/app/models/alarm.py

## Hardware Requirements

- Raspberry Pi Pico W
- PWM-capable LED or LED strip
- Piezo buzzer (optional)
- Push button for alarm control
- USB cable for programming
- Micro USB power supply

## Pin Configuration

- LED: GPIO25 (built-in LED on Pico)
- Buzzer: GPIO16 (PWM capable pin)
- Button: GPIO15 (with internal pull-up)

## Setup




## Features

- 🔄 Automatic alarm fetching from server over WiFi
- 💡 LED intensity control with 4 curve types:
  - Linear: Direct progression
  - S-curve: Smooth transition with configurable sharpness
  - Asymptotic: Gradual approach with configurable decay
  - Custom: Catmull-Rom spline interpolation
- 🔔 Wake-up melody with PWM frequency control
- ⏰ Precise alarm scheduling
- 🔲 Button control for alarm cancellation
- 📝 Detailed logging system

## Development

### Project Structure

```
src/
├── main.py             # Main
├── alarm/
│   ├── types.py        # Data structures
│   ├── scheduler.py    # Alarm timing logic
│   ├── intensity.py    # LED curve calculations
│   ├── manager.py      # Alarm execution
├── hardware/
│   ├── led.py          # LED PWM control
│   ├── buzzer.py       # Sound generation
│   └── button.py       # Input handling
├── http/
│   └── client.py       # Server communication
├── config/
│   └── constants.py    # Configuration
└── log/
    └── log.py          # Logging system
```

### Intensity Curve Implementation

All curve calculations are implemented in `alarm/intensity.py`:

- **Linear**: Simple linear interpolation
- **S-curve**: Customized logistic function with variable steepness
- **Asymptotic**: Exponential approach with configurable rate
- **Custom**: Catmull-Rom spline for smooth interpolation

### Alarm Execution Flow

1. Connect to WiFi network
2. Fetch alarms from server periodically
3. Calculate next alarm trigger time
4. Wait for alarm time
5. Execute intensity curve over alarm duration
6. Activate buzzer wake-up tune
7. Monitor button for cancellation