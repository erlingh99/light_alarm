use defmt::*;
use embassy_executor::Spawner;
use embassy_net::dns::DnsSocket;
use embassy_net::tcp::client::{TcpClient, TcpClientState};
use embassy_net::{Config, Stack, StackResources};
use embassy_rp::gpio::{Level, Output};
use embassy_rp::peripherals::{DMA_CH0, PIN_23, PIN_24, PIN_25, PIN_29, PIO0};
use embassy_rp::pio::{InterruptHandler, Pio};
use embassy_rp::{bind_interrupts, Peri};
use embassy_sync::blocking_mutex::raw::CriticalSectionRawMutex;
use embassy_sync::channel::Channel;
use embassy_time::{Duration, Timer};
use heapless::Vec;
use reqwless::client::HttpClient;
use reqwless::request::Method;
use static_cell::StaticCell;

use cyw43::{JoinOptions, NetDriver};
use cyw43_pio::{PioSpi, DEFAULT_CLOCK_DIVIDER};

use crate::alarm::model::Alarm;
use crate::net::config::{API_HOST, RETRY_DELAY_S, TIME_SERVER, WIFI_PASSWORD, WIFI_SSID};
use crate::time_lib::model::ApiTimeType;

bind_interrupts!(struct Irqs {
    PIO0_IRQ_0 => InterruptHandler<PIO0>;
});

static STATE: StaticCell<cyw43::State> = StaticCell::new();
static RESOURCES: StaticCell<StackResources<3>> = StaticCell::new();
static mut STACK: Option<Stack<'static>> = None;

#[derive(Debug, Format)]
pub enum NetworkError {
    // ConnectionFailed,
    RequestFailed,
    ReadError,
    ParseError,
    // Timeout,
    // NotInitialized,
}

pub struct NetworkManager<'a> {
    stack: &'a Stack<'static>,
}

impl<'a> NetworkManager<'a> {
    /// Initialize the network stack and start background tasks
    pub async fn initialize(
        pio_pin: Peri<'static, PIO0>,
        pwr_pin: Peri<'static, PIN_23>,
        cs_pin: Peri<'static, PIN_25>,
        dio_pin: Peri<'static, PIN_24>,
        clk_pin: Peri<'static, PIN_29>,
        dma: Peri<'static, DMA_CH0>,
        spawner: &Spawner,
        seed: u64,
    ) {
        info!("Initializing network stack");

        // Initialize PIO for SPI communication with CYW43
        let pwr = Output::new(pwr_pin, Level::Low);
        let cs = Output::new(cs_pin, Level::High);
        let mut pio = Pio::new(pio_pin, Irqs);
        let spi = PioSpi::new(
            &mut pio.common,
            pio.sm0,
            DEFAULT_CLOCK_DIVIDER,
            pio.irq0,
            cs,
            dio_pin,
            clk_pin,
            dma,
        );

        // CYW43 firmware
        let fw = include_bytes!("../cyw43-firmware/43439A0.bin");
        let clm = include_bytes!("../cyw43-firmware/43439A0_clm.bin");

        // Initialize CYW43 driver
        let state = STATE.init(cyw43::State::new());
        let (net_device, mut control, runner) = cyw43::new(state, pwr, spi, fw).await;
        // Start CYW43 background task
        spawner.spawn(cyw43_task(runner)).unwrap();
        // Init control
        control.init(clm).await;
        control
            .set_power_management(cyw43::PowerManagementMode::PowerSave)
            .await;

        // Configure network stack
        let config = Config::dhcpv4(Default::default());
        let resources = RESOURCES.init(StackResources::<3>::new());
        let (stack, runner) = embassy_net::new(net_device, config, resources, seed);
        // Initialize the static stack reference
        unsafe {
            STACK = Some(stack);
        }

        // Start network task
        spawner.spawn(net_task(runner)).unwrap();

        // Connect to WiFi
        spawner.spawn(wifi_connect_task(control)).unwrap();

        info!("Network stack initialized");
    }

    /// Create a new NetworkManager instance
    /// Note: initialize() must be called first
    pub async fn new() -> Self {
        // Get reference to the static stack
        let stack = unsafe {
            STACK.as_ref().expect("Stack not initialized")
        };

        // Wait for network to be ready
        info!("Waiting for network link...");
        stack.wait_link_up().await;
        info!("Network link is up, waiting for DHCP...");

        stack.wait_config_up().await;
        if let Some(_config) = stack.config_v4() {
            info!("Network configured with IP");
        } else {
            info!("Network configured without IPv4");
        }

        Self { stack }
    }

    /// Make an HTTP request to the specified URL
    async fn make_http_request(&self, method: Method, url: &str) -> Result<heapless::String<4096>, NetworkError> {
        let client_state = TcpClientState::<1, 1024, 4096>::new();
        let tcp_client = TcpClient::new(*self.stack, &client_state);
        let dns_client = DnsSocket::new(*self.stack);

        let mut http_client = HttpClient::new(&tcp_client, &dns_client);
        let mut request = http_client
            .request(method, url)
            .await
            .map_err(|_| NetworkError::RequestFailed)?;

        let mut rx_buffer = [0_u8; 4096];
        let response = request
            .send(&mut rx_buffer)
            .await
            .map_err(|_| NetworkError::RequestFailed)?;

        let body_bytes = response
            .body()
            .read_to_end()
            .await
            .map_err(|_| NetworkError::ReadError)?;

        let body_str = core::str::from_utf8(body_bytes).map_err(|_| NetworkError::ParseError)?;
        let mut result = heapless::String::new();
        result.push_str(body_str).map_err(|_| NetworkError::ParseError)?;
        Ok(result)
    }

    /// Fetch alarms from the API and send them via the provided channel
    pub async fn get_alarms(
        &self,
        alarm_channel: &Channel<CriticalSectionRawMutex, Alarm, 4>,
    ) -> Result<(), NetworkError> {
        info!("Fetching alarms from API...");
        let body = self.make_http_request(Method::GET, API_HOST).await?;

        info!("Alarm API response: {:?}", &body);

        // Parse JSON array of alarms
        let alarms = match serde_json_core::de::from_str::<Vec<Alarm, 8>>(body.as_str()) {
            Ok((alarms, _used)) => alarms,
            Err(_e) => {
                error!("Failed to parse alarm JSON");
                return Err(NetworkError::ParseError);
            }
        };

        // Send each alarm to the calling task
        for alarm in alarms {
            info!("Sending alarm via channel: {:?}", alarm.id);
            alarm_channel.send(alarm).await;
        }

        info!("Alarm fetch completed successfully");
        Ok(())
    }

    pub async fn get_time(
        &self,
    ) -> Result<ApiTimeType, NetworkError> {
        info!("Fetching current time from worldtimeapi.org...");
        let body = self.make_http_request(Method::GET, TIME_SERVER).await?;

        info!("Alarm API response: {:?}", &body);

        // Parse JSON array of alarms
        let time = match serde_json_core::de::from_str::<ApiTimeType>(body.as_str()) {
            Ok((time, _used)) => time,
            Err(_e) => {
                error!("Failed to parse alarm datetime response");
                return Err(NetworkError::ParseError);
            }
        };

        info!("Current time fetched successfully");
        Ok(time)
    }
}

// Background tasks
#[embassy_executor::task]
async fn wifi_connect_task(mut control: cyw43::Control<'static>) -> ! {
    loop {
        match control
            .join(WIFI_SSID, JoinOptions::new(WIFI_PASSWORD.as_bytes()))
            .await
        {
            Ok(_) => {
                info!("WiFi connected successfully");
                // Keep the connection alive and monitor status
                loop {
                    Timer::after(Duration::from_secs(30)).await;
                    // add connection health checks here
                    // check if still connected, reconnect if needed
                }
            }
            Err(err) => {
                error!("WiFi connection failed: {}", err.status);
                Timer::after(Duration::from_secs(RETRY_DELAY_S)).await;
                info!("Retrying WiFi connection...");
            }
        }
    }
}

#[embassy_executor::task]
async fn cyw43_task(
    runner: cyw43::Runner<'static, Output<'static>, PioSpi<'static, PIO0, 0, DMA_CH0>>,
) -> ! {
    runner.run().await
}

#[embassy_executor::task]
async fn net_task(mut runner: embassy_net::Runner<'static, NetDriver<'static>>) -> ! {
    runner.run().await
}
