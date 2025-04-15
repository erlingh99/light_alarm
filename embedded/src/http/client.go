package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	"alarm_project/embedded/src/alarm"
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/log"
)

// FetchAlarms retrieves the list of alarms from the server
func FetchAlarms() ([]alarm.Alarm, error) {
	log.Debug("Fetching alarms from %s", config.API_URL)

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: config.HTTP_TIMEOUT,
	}

	// Create request
	req, err := http.NewRequest("GET", config.API_URL, nil)
	if err != nil {
		log.Error("Failed to create HTTP request: %v", err)
		return nil, err
	}

	// Add headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	// Send request
	resp, err := client.Do(req)
	if err != nil {
		log.Error("HTTP request failed: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		err := fmt.Errorf("server returned status: %d", resp.StatusCode)
		log.Error("HTTP request failed: %v", err)
		return nil, err
	}

	// Decode response
	var alarms []alarm.Alarm
	if err := json.NewDecoder(resp.Body).Decode(&alarms); err != nil {
		log.Error("Failed to decode response: %v", err)
		return nil, err
	}

	log.Debug("Successfully fetched %d alarms", len(alarms))
	return alarms, nil
}