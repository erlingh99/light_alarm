#![no_std]
#![no_main]

use defmt::info;
use embassy_executor::Spawner;
use embassy_rp::{gpio::{AnyPin, Input, Pull}, Peripherals, Peri};
use embassy_time::Timer;

use defmt_rtt as _;
use panic_probe as _; 


#[embassy_executor::main]
async fn main(spawner: Spawner) {
    info!("Starting");
    let p: Peripherals = embassy_rp::init(Default::default());
    spawner.spawn(button(p.PIN_0.into(), "A")).unwrap();
    spawner.spawn(button(p.PIN_1.into(), "B")).unwrap();

}


#[embassy_executor::task(pool_size = 2)]
async fn button(pin: Peri<'static, AnyPin>, id: &'static str) {
    let mut button = Input::new(pin, Pull::None);

    loop {
        button.wait_for_high().await;
        info!("Button {} pressed!", id);
        Timer::after_millis(200).await; // Debounce delay
        button.wait_for_low().await;
        Timer::after_millis(200).await; // Debounce delay
    }
}
