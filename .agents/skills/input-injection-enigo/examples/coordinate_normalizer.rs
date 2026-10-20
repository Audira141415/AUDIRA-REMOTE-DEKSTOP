//! Reference Example: Mouse Coordinate Normalizer across Multi-Display Configurations
//! Translates normalized (0.0 to 1.0) client coordinates to absolute screen pixels.

#[derive(Debug, Clone)]
pub struct DisplayBounds {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub scale_factor: f64,
}

pub struct CoordinateNormalizer {
    pub display: DisplayBounds,
}

impl CoordinateNormalizer {
    pub fn new(display: DisplayBounds) -> Self {
        Self { display }
    }

    /// Converts normalized client floating-point coords (0.0-1.0) into host OS pixel coords
    pub fn to_host_pixels(&self, norm_x: f64, norm_y: f64) -> (i32, i32) {
        let clamped_x = norm_x.clamp(0.0, 1.0);
        let clamped_y = norm_y.clamp(0.0, 1.0);

        let pixel_x = self.display.x + (clamped_x * self.display.width as f64).round() as i32;
        let pixel_y = self.display.y + (clamped_y * self.display.height as f64).round() as i32;

        (pixel_x, pixel_y)
    }
}
