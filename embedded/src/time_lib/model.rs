use defmt::Format;
use heapless::String;
use serde::Deserialize;

#[derive(Deserialize, Format, Clone)]
pub struct ApiTimeType {
    pub timezone: String<64>,
    pub abbreviation: String<6>,
    pub utc_offset: String<6>,
    pub day_of_week: u8, // 0=Sunday, 1=Monday, ..., 6=Saturday
    pub week_number: u8,
    pub day_of_year: u16,
    pub datetime: String<27>,
    pub utc_datetime: String<27>,
    pub unixtime: u64,
    pub raw_offset: i16,
    pub dst: bool,
    pub dst_offset: Option<i16>,
    pub dst_from: Option<String<27>>,
    pub dst_until: Option<String<27>>,
    pub client_ip: String<16>,
}
