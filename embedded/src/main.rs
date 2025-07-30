#![no_std]
#![no_main]

mod alarm;
mod net;
mod time_lib;

use defmt::*;
use embassy_executor::Spawner;
use embassy_futures::select::{select, Either};
use embassy_rp::clocks::RoscRng;
use embassy_sync::blocking_mutex::raw::CriticalSectionRawMutex;
use embassy_sync::channel::Channel;
use embassy_time::{Duration, Timer};
use static_cell::StaticCell;
use heapless::Vec;
use time::UtcDateTime;


use crate::time_lib::time::TimeManager;

use {defmt_rtt as _, panic_probe as _};

use alarm::model::Alarm;
use net::{config::API_POLLING_INTERVAL_S, net::NetworkManager};
use time_lib::time::time_syncer;

// Communication channels
static ALARM_CHANNEL: Channel<CriticalSectionRawMutex, Alarm, 4> = Channel::new();
static FETCH_REQUEST_CHANNEL: Channel<CriticalSectionRawMutex, (), 2> = Channel::new();
static NETWORK_MANAGER: StaticCell<NetworkManager<'static>> = StaticCell::new(); // need this as the reference is used from multiple places
static TIME_MANAGER: StaticCell<TimeManager<'static>> = StaticCell::new(); // need this as the reference is used from multiple places


#[embassy_executor::main]
async fn main(spawner: Spawner) {
    info!("Starting Pico W Alarm Clock");

    let p = embassy_rp::init(Default::default());
    let mut rng = RoscRng;
    let seed = rng.next_u64();

    // Initialize networking
    NetworkManager::initialize(
        p.PIO0, p.PIN_23, p.PIN_25, p.PIN_24, p.PIN_29, p.DMA_CH0, &spawner, seed,
    )
    .await;

    info!("Network initialized, connecting to WiFi...");
    let network_manager = NetworkManager::new().await;
    let network_manager_ref = NETWORK_MANAGER.init(network_manager);
    let time_manager = TimeManager::new(network_manager_ref);
    let time_manager_ref = TIME_MANAGER.init(time_manager);

    spawner.spawn(alarm_fetcher(network_manager_ref)).unwrap();
    spawner.spawn(time_syncer(time_manager_ref)).unwrap();
    info!("All tasks started, entering main loop");

    // Main alarm clock logic
    let mut current_alarms: Vec<Alarm, 8> = Vec::new();
    let mut last_minute = 255u8; // Invalid minute to force initial check

    loop {
        // Check for new alarm data from network task
        if let Ok(new_alarm) = ALARM_CHANNEL.try_receive() { //will eventually be blocking and another task will trigger alarms
            info!("Received new alarm: {:?}", new_alarm);

            // Update or add alarm to current list
            if let Some(existing) = current_alarms.iter_mut().find(|a| a.id == new_alarm.id) {
                *existing = new_alarm;
                info!("Updated existing alarm {}", existing.id);
            } else if current_alarms.push(new_alarm.clone()).is_ok() {
                info!("Added new alarm {}", new_alarm.id);
            } else {
                warn!("Alarm list full, couldn't add alarm {}", new_alarm.id);
            }
            //should add logic to only keep the most recent alarms
        }

        // Check current time and trigger alarms
        let now = embassy_time::Instant::now();
        let current_minute = (now.as_secs() / 60) % (24 * 60); // Minutes since midnight
        let hour = (current_minute / 60) as u8;
        let minute = (current_minute % 60) as u8;

        // Only check alarms when minute changes
        if minute != last_minute {
            last_minute = minute;
            info!("Current time: {:02}:{:02}", hour, minute);

            // Check if any alarms should trigger
            for alarm in &current_alarms {
                let now = match TimeManager::get_current_time().await {
                    Ok(time) => time,
                    Err(e) => {
                        error!("Failed to get current time: {:?}", e);
                        break; // Skip this iteration if time fetch fails
                    }
                };

                // Get current time from time manager
                if alarm.is_active && is_now(alarm, now) {
                    info!(
                        "🚨 ALARM TRIGGERED: {} at {:02}:{:02}",
                        alarm.name, hour, minute
                    );
                    trigger_alarm(&alarm);
                }
            }
        }

        // Sleep for a short time
        Timer::after(Duration::from_secs(1)).await;
    }
}

#[embassy_executor::task]
async fn alarm_fetcher(network_manager: &'static NetworkManager<'static>) -> ! {
    loop {
        match select(
            Timer::after(Duration::from_secs(API_POLLING_INTERVAL_S)),
            FETCH_REQUEST_CHANNEL.receive(), // TODO add button to trigger this
        )
        .await
        {
            Either::First(_) => {
                info!("Performing periodic alarm fetch");
                if let Err(e) = network_manager.get_alarms(&ALARM_CHANNEL).await {
                    error!("Failed to fetch alarms: {:?}", e);
                }
            }
            Either::Second(_) => {
                info!("Manual alarm fetch requested");
                if let Err(e) = network_manager.get_alarms(&ALARM_CHANNEL).await {
                    error!("Failed to fetch alarms on request: {:?}", e);
                }
            }
        }
    }
}

fn is_now(_alarm: &Alarm, _now: UtcDateTime) -> bool {
    false
}


fn trigger_alarm(alarm: &Alarm) {
    info!("Triggering alarm: {}", alarm.name);
    // Here you would:
    // - Turn on LEDs
    // - Play sound/buzzer
    // - Send notifications
    // - Update display
    // etc.
}
