package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	"alarm_project/embedded/src/alarm"
	"alarm_project/embedded/src/config"
)

// FetchAlarms retrieves the list of alarms from the server
func FetchAlarms() ([]alarm.Alarm, error) {
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: config.HTTP_TIMEOUT,
	}

	// Create request
	req, err := http.NewRequest("GET", config.SERVER_URL, nil)
	if err != nil {
		return nil, err
	}

	// Add headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	// Send request
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server returned status: %d", resp.StatusCode)
	}

	// Decode response
	var alarms []alarm.Alarm
	if err := json.NewDecoder(resp.Body).Decode(&alarms); err != nil {
		return nil, err
	}

	return alarms, nil
} 