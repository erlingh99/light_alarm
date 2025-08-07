use embassy_executor::Spawner;
use embassy_rp::peripherals::USB;
use embassy_rp::usb::{Driver, InterruptHandler};
use embassy_rp::{bind_interrupts, Peri};
use embassy_time::Timer;

bind_interrupts!(struct Irqs {
    USBCTRL_IRQ => InterruptHandler<USB>;
});

pub async fn initialize_logger(spawner: Spawner, p_usb: Peri<'static, USB>) {
    // Create the driver, from the HAL.
    let usb_driver: Driver<'static, USB> = Driver::new(p_usb, Irqs);
    spawner.spawn(logger_task(usb_driver)).unwrap();
    Timer::after_secs(1).await; //some wait is required before logging

    // spawner.spawn(alive_msg_spammer()).unwrap();
}

#[embassy_executor::task]
async fn logger_task(driver: Driver<'static, USB>) -> ! {
    embassy_usb_logger::run!(1024, log::LevelFilter::Debug, driver);
}

#[embassy_executor::task]
async fn alive_msg_spammer() -> ! {
    loop {
        // This task is just to spam the USB with messages.
        // It can be used to test the USB connection.
        log::info!("USB spam");
        Timer::after_secs(10).await;
    }
}
