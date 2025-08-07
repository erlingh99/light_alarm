# Light Alarm Embedded Project - Requirements Specification

## Purpose
Develop firmware for a Raspberry Pi Pico W to control an addressable LED strip as a light alarm, fetching alarm schedules from a backend API and executing them with configurable color, intensity, and duration.

## Functional Requirements
1. **WiFi Connectivity**
   - Connect to a WiFi network using credentials stored in configuration.
2. **Backend Communication**
   - Periodically fetch alarm schedules from a REST API.
   - Parse alarm data according to the schema in `backend/app/models/alarm.py`.
3. **Alarm Scheduling**
   - Schedule alarms based on received data, including time, color, length, intensity curve, and recurrence.
   - Support recurring alarms (daily, weekly, custom dates).
4. **LED Strip Control**
   - Drive an addressable LED strip (e.g., WS2812B).
   - Set color and intensity according to alarm configuration.
   - Implement intensity curves: linear, asymptotic, s-curve, custom.
   - Control alarm duration.
5. **Error Handling & Logging**
   - Log key events and errors for debugging.
   - Handle network failures and invalid data gracefully.
6. **Power Management**
   - Use power-saving features when idle.

## Non-Functional Requirements
- Written in Rust using Embassy for async and embedded support.
- No dependencies on the backend codebase at runtime.
- Modular and maintainable code structure.
- Efficient memory and resource usage.
- MIT License.
