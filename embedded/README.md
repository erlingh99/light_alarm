# ESP32 Alarm Controller

This is the embedded component of the alarm project, running on an ESP32 microcontroller. It fetches alarms from the server and controls an LED and buzzer based on the alarm settings.

## Hardware Requirements

- ESP32 development board (e.g., ESP32-DevKitC)
- LED (built-in or external)
- Buzzer
- USB cable for programming

## Pin Configuration

- LED: GPIO2 (built-in LED on most ESP32 boards)
- Buzzer: GPIO4 (PWM capable pin)

## Setup

1. Install TinyGo:
   ```bash
   wget https://github.com/tinygo-org/tinygo/releases/download/v0.27.0/tinygo_0.27.0_amd64.deb
   sudo dpkg -i tinygo_0.27.0_amd64.deb
   ```

2. Install ESP32 toolchain:
   ```bash
   sudo apt-get install gcc-riscv64-unknown-elf
   ```

3. Build the project:
   ```bash
   tinygo build -o firmware.bin -target=esp32 ./src/main.go
   ```

4. Flash to ESP32:
   ```bash
   esptool.py --port /dev/ttyUSB0 write_flash 0x10000 firmware.bin
   ```

## Features

- Fetches alarms from the server
- Controls LED intensity based on alarm settings
- Controls buzzer for alarm sound
- Supports different intensity curves
- Handles alarm recurrence patterns
- Serial debugging output

## TODO

- [ ] Implement HTTP client for alarm fetching
- [ ] Implement proper PWM control for LED
- [ ] Add WiFi configuration
- [ ] Add error handling for network issues
- [ ] Implement proper time synchronization
- [ ] Add configuration for LED and buzzer pins

## Development

The project uses TinyGo, which is a Go compiler for small places. The main code is in `src/main.go`.

To modify the code:

1. Edit `src/main.go`
2. Build using `tinygo build`
3. Flash to the device
4. Monitor output using:
   ```bash
   screen /dev/ttyUSB0 115200
   ```

## Troubleshooting

1. If the device is not recognized:
   - Check USB connection
   - Verify USB permissions: `sudo usermod -a -G dialout $USER`
   - Try a different USB cable

2. If flashing fails:
   - Put the ESP32 in bootloader mode (hold BOOT button while pressing RESET)
   - Verify the correct port is being used
   - Check if the firmware file exists and is valid

3. If the LED/buzzer doesn't work:
   - Verify pin connections
   - Check if the pins are correctly configured in the code
   - Test with a simple blink program first 