// use defmt::*;
use embassy_sync::blocking_mutex::raw::CriticalSectionRawMutex;
use embassy_sync::mutex::Mutex;
use embassy_time::{Instant, Timer};
use time::UtcDateTime;

use crate::net::config::TIME_SYNC_INTERVAL_S;
use crate::net::NetworkManager;

// Static storage for current time
static TIME_SYNC_OFFSET: Mutex<CriticalSectionRawMutex, Option<i64>> = Mutex::new(None);

#[derive(Debug)]
pub enum TimeError {
    NetworkError,
    InvalidResponse,
    NotSynchronized,
}

pub struct TimeManager<'a> {
    network_manager: &'a NetworkManager<'a>,
}

impl TimeManager<'static> {
    pub fn new(network_manager: &'static NetworkManager<'static>) -> Self {
        TimeManager { network_manager }
    }

    /// Synchronize time with time server
    pub async fn sync_time(&self) -> Result<UtcDateTime, TimeError> {
        let time_data = self
            .network_manager
            .get_time()
            .await
            .map_err(|_| TimeError::NetworkError)?;
        log::info!("TIME GOTTEN");

        let utc_time = UtcDateTime::from_unix_timestamp(time_data.timestamp as i64)
            .map_err(|_| TimeError::InvalidResponse)?;

        let mut guard = TIME_SYNC_OFFSET.lock().await;
        *guard = Some(utc_time.unix_timestamp() - Instant::now().as_secs() as i64);

        Ok(utc_time)
    }

    /// Get current time (requires prior sync)
    pub async fn get_current_time() -> Result<UtcDateTime, TimeError> {
        let time_offset = {
            let offset_guard = TIME_SYNC_OFFSET.lock().await;
            offset_guard.ok_or(TimeError::NotSynchronized)?
        };

        let now_secs = Instant::now().as_secs() as i64;
        let actual_time_secs = now_secs + time_offset;

        UtcDateTime::from_unix_timestamp(actual_time_secs).map_err(|_| TimeError::InvalidResponse)
    }
}

/// Background task to periodically sync time
#[embassy_executor::task]
pub async fn time_syncer(time_manager: &'static TimeManager<'static>) -> ! {
    log::info!("Starting time_sync");
    loop {
        match time_manager.sync_time().await {
            Ok(_) => {
                log::info!("Time resync successful");
            }
            Err(e) => {
                log::error!("Time resync failed: {e:?}"); //clippy ignore
            }
        }
        Timer::after_secs(TIME_SYNC_INTERVAL_S).await; // 1 hour
    }
}
