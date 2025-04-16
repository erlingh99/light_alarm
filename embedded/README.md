# Raspberry Pi Pico W Alarm Controller

This is the embedded component of the alarm project, running on a Raspberry Pi Pico W microcontroller. It fetches alarms from the server and controls an LED and buzzer based on the alarm settings.

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

1. Install TinyGo:
   ```bash
   wget https://github.com/tinygo-org/tinygo/releases/download/v0.27.0/tinygo_0.27.0_amd64.deb
   sudo dpkg -i tinygo_0.27.0_amd64.deb
   ```

2. Configure WiFi:
   Create `src/config/wifi_config.go` with your credentials:
   ```go
   package config

   const (
       WIFI_SSID = "your_ssid"
       WIFI_PASS = "your_password"
   )
   ```

3. Build the project:
   ```bash
   tinygo build -o firmware.uf2 -target=pico ./src/main.go
   ```

4. Flash to Pico W:
   1. Hold the BOOTSEL button while connecting the Pico to your computer
   2. It will appear as a USB mass storage device
   3. Copy the firmware.uf2 file to the Pico
   4. The Pico will automatically reboot and run the firmware

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
├── main.go              # Main application loop
├── alarm/
│   ├── types.go        # Data structures
│   ├── scheduler.go     # Alarm timing logic
│   ├── intensity.go     # LED curve calculations
│   ├── manager.go       # Alarm execution
│   └── errors.go       # Error definitions
├── hardware/
│   ├── led.go          # LED PWM control
│   ├── buzzer.go       # Sound generation
│   └── button.go       # Input handling
├── http/
│   └── client.go       # Server communication
├── config/
│   └── constants.go    # Configuration
└── log/
    └── log.go          # Logging system
```

### Intensity Curve Implementation

All curve calculations are implemented in `alarm/intensity.go`:

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

## Troubleshooting

1. If the Pico is not recognized:
   - Make sure to hold BOOTSEL while connecting
   - Try a different USB cable
   - Check USB port functionality

2. If flashing fails:
   - Verify the firmware.uf2 file exists
   - Make sure the Pico appears as a USB drive
   - Try re-entering bootloader mode

3. If LED/buzzer doesn't work:
   - Verify pin connections
   - Check PWM configuration
   - Test with blink example first

4. If WiFi doesn't connect:
   - Verify credentials in wifi_config.go
   - Check signal strength
   - Monitor serial output for connection status
   - Make sure you're using a Pico W (not a regular Pico)