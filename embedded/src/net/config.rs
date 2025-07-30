/// Network configuration constants and structures

pub static WIFI_SSID: &'static str = "YourNetworkSSID";
pub static WIFI_PASSWORD: &'static str = "YourNetworkPassword";
pub static API_HOST: &'static str = "http://alarm.lan/api/alarms";
pub static TIME_SERVER: &'static str = "http://worldtimeapi.org/api/timezone/Europe/Berlin";

pub static RETRY_DELAY_S: u64 = 5; // Delay in seconds before retrying network operations
pub static API_POLLING_INTERVAL_S: u64 = 3600; // Interval for polling the API for new alarms
pub static TIME_SYNC_INTERVAL_S: u64 = 3600; // Interval for synchronizing time
