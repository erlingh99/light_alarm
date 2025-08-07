# Light Alarm Embedded Project - Implementation Plan

## Step-by-Step Plan

1. **Project Setup**
   - Initialize Rust project with Embassy and required dependencies.
   - Set up WiFi firmware blobs and configuration files.

2. **WiFi & Network Stack**
   - Implement WiFi connection logic using credentials from config.
   - Integrate Embassy network stack for TCP/IP communication.

3. **Backend API Client**
   - Implement HTTP client to fetch alarm schedules from REST API.
   - Parse JSON responses according to alarm schema.

4. **Alarm Data Model & Scheduler**
   - Define Rust structs matching the alarm schema.
   - Implement logic to schedule alarms, including recurrence handling.

5. **LED Strip Driver**
   - Integrate driver for addressable LED strip (e.g., WS2812B).
   - Implement color and intensity control.
   - Develop intensity curve algorithms (linear, s-curve, asymptotic, custom).

6. **Alarm Execution Logic**
   - Trigger LED strip according to scheduled alarms.
   - Apply color, intensity curve, and duration.
   - Handle overlapping and recurring alarms.

7. **Error Handling & Logging**
   - Add logging for network, scheduling, and LED events.
   - Implement error handling for network and data issues.

8. **Power Management**
   - Integrate power-saving features when idle.

9. **Testing & Validation**
   - Test WiFi, backend communication, and LED control.
   - Simulate alarms and validate behavior.

10. **Documentation**
    - Update README and add code comments.
    - Document configuration and usage.
