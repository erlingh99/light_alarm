# Raspberry Pi Pico W Alarm Controller

This is the embedded component of the alarm project, implemented in Rust using the Embassy async runtime. It controls a PWM-capable LED strip and optional buzzer, fetching alarm schedules from a FastAPI backend.

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

1. Install Rust and target support:
```bash
rustup target add thumbv6m-none-eabi
```

2. Configure VS Code settings for embedded development:
```json
{
    "rust-analyzer.check.allTargets": false,
    "rust-analyzer.cargo.target": "thumbv6m-none-eabi",
    "editor.defaultFormatter": "rust-lang.rust-analyzer",
    "editor.formatOnSave": true,
    "rust-analyzer.check.command": "clippy"
}
```

3. Configure your WiFi credentials in `src/net/config.rs`

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

## Project Structure

```
src/
├── main.rs                # Main firmware logic
├── logging/              
│   ├── mod.rs            # Logging module root
│   └── usb.rs            # USB logging implementation
├── net/                  
│   ├── mod.rs            # Networking module root
│   ├── config.rs         # Network configuration
│   └── net_logic.rs      # Network communication logic
├── time_lib/             
│   ├── mod.rs            # Time handling module root
│   ├── model.rs          # Time-related data structures
│   └── time.rs           # Time utilities
└── cyw43-firmware/       # WiFi firmware blobs
```

## Development

The project uses Embassy for async Rust on embedded systems. Make sure to:

1. Follow the Rust embedded development guidelines
2. Test WiFi connectivity before deploying
3. Validate alarm parsing and execution
4. Check USB logging output for debugging
5. Use `clippy` for code quality checks