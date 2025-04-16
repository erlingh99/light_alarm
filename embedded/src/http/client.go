package http

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"alarm_project/embedded/src/alarm"
	"alarm_project/embedded/src/config"
	"alarm_project/embedded/src/log"

	"tinygo.org/x/drivers/net"
	"tinygo.org/x/tinywifi"
)

var (
	wifiAdapter = &tinywifi.Adaptor{}
)

func FetchAlarms() ([]alarm.Alarm, error) {
	log.Debug("Fetching alarms from %s", config.API_URL)

	// Create a new HTTP client with timeout
	client := &http.Client{
		Timeout: config.HTTP_TIMEOUT,
		Transport: &http.Transport{
			Dial: func(network, addr string) (net.Conn, error) {
				return wifiAdapter.Dial(network, addr)
			},
		},
	}

	// Create request
	req, err := http.NewRequest("GET", config.API_URL, nil)
	if err != nil {
		log.Error("Failed to create HTTP request: %v", err)
		return nil, err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	// Send request
	resp, err := client.Do(req)
	if err != nil {
		log.Error("HTTP request failed: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		err := fmt.Errorf("server returned status: %d", resp.StatusCode)
		log.Error("HTTP request failed: %v", err)
		return nil, err
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Error("Failed to read response body: %v", err)
		return nil, err
	}

	// Parse JSON response
	var alarms []alarm.Alarm
	if err := json.Unmarshal(body, &alarms); err != nil {
		log.Error("Failed to decode response: %v", err)
		return nil, err
	}

	log.Debug("Successfully fetched %d alarms", len(alarms))
	return alarms, nil
}