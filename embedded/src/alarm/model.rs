//! Alarm data structures and deserialization
// use defmt::Format;
use heapless::{String, Vec};
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct RecurrencePattern {
    pub reccurence_type: String<6>, // "daily", "weekly", "custom"
    pub days: Option<Vec<u8, 7>>,
    pub custom_dates: Option<String<27>>, // ISO date strings
}

#[derive(Deserialize, Debug, Clone)]
pub struct IntensityCurve {
    pub start_intensity: u8,
    pub end_intensity: u8,
    pub curve: String<10>, // "linear", "asymptotic", "s-curve", "custom"
    pub hyper_parameter: Option<u8>,
    pub control_points: Option<Vec<(f32, f32), 5>>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Alarm {
    pub id: String<36>,
    pub created_at: String<27>,
    pub updated_at: String<27>,
    pub name: String<64>,
    pub time: String<5>,
    pub color: String<7>, // Hex color code
    pub length: u16,
    pub is_active: bool,
    pub intensity_curve: IntensityCurve,
    pub recurrence: RecurrencePattern,
}
