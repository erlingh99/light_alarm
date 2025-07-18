import urequests
import network
import time
from config.constants import WIFI_SSID, WIFI_PASSWORD, API_HOST, API_ENDPOINT

class HTTPClient:
    def __init__(self):
        self._wlan = network.WLAN(network.STA_IF)
        self._is_connected = False
    
    def connect_wifi(self) -> bool:
        """Connect to WiFi network"""
        if self._wlan.isconnected():
            return True
            
        print("Connecting to WiFi...")
        self._wlan.active(True)
        self._wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        
        # Wait for connection with timeout
        max_wait = 10
        while max_wait > 0:
            if self._wlan.status() < 0 or self._wlan.status() >= 3:
                break
            max_wait -= 1
            print("Waiting for connection...")
            time.sleep(1)
            
        if self._wlan.isconnected():
            print("Connected to WiFi")
            return True
        else:
            print("Failed to connect to WiFi")
            return False
    
    def fetch_alarms(self) -> list:
        """Fetch alarms from server"""
        if not self.connect_wifi():
            return []
            
        try:
            url = f"{API_HOST}{API_ENDPOINT}"
            response = urequests.get(url)
            alarms_data = response.json()
            response.close()
            return alarms_data
        except Exception as e:
            print(f"Error fetching alarms: {e}")
            return []
    
    def cleanup(self):
        """Clean up WiFi connection"""
        if self._wlan.isconnected():
            self._wlan.disconnect()
        self._wlan.active(False)
