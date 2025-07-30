# Recommended Folder Structure for Embedded Project

```
embedded/
├── src/
│   ├── main.rs                # Main firmware logic
│   ├── alarm/
│   │   ├── mod.rs             # Alarm module root
│   │   ├── model.rs           # Alarm data structures
│   │   ├── scheduler.rs       # Alarm scheduling logic
│   │   ├── intensity.rs       # Intensity curve algorithms
│   ├── led/
│   │   ├── mod.rs             # LED module root
│   │   ├── driver.rs          # LED strip driver
│   │   ├── color.rs           # Color utilities
│   ├── net/
│   │   ├── mod.rs             # Networking module root
│   │   ├── wifi.rs            # WiFi connection logic
│   │   ├── client.rs          # Backend API client
│   ├── config/
│   │   ├── mod.rs             # Configuration module root
│   │   ├── wifi_config.rs     # WiFi credentials
│   ├── util/
│   │   ├── log.rs             # Logging utilities
│   │   ├── error.rs           # Error handling
│   └── main.rs                # Main entry point
├── cyw43-firmware/            # WiFi firmware blobs
├── Cargo.toml
├── memory.x
├── README.md
├── spec.md                    # Requirements specification
├── plan.md                    # Implementation plan
└── folder_structure.md        # This folder structure document
```
