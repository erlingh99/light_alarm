// use defmt::Format;
// use heapless::String;
use serde::Deserialize;

#[derive(Deserialize, Debug)] //Clone
pub struct ApiTimeType {
    // pub timezone: String<6>,
    // pub utc_offset: String<6>,
    // pub local_time: String<27>,
    pub timestamp: u64,
}
