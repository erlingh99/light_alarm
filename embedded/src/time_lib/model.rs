use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct ApiTimeType {
    pub utc_offset: i16,
    pub timestamp: u64,
}
