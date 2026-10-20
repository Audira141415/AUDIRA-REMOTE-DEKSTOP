//! AI Predictive Latency & Mouse Smoothing Engine
//! Provides Kalman-inspired adaptive extrapolation and velocity-aware smoothing
//! for remote mouse movement under high latency and jitter conditions.

use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy)]
pub struct MousePoint {
    pub x: f64,
    pub y: f64,
    pub timestamp: Instant,
}

#[derive(Debug, Clone)]
pub struct PredictiveMouseConfig {
    /// Minimum smoothing factor at low velocities (0.0 to 1.0)
    pub min_smoothing: f64,
    /// Maximum smoothing factor at high velocities
    pub max_smoothing: f64,
    /// Velocity threshold in pixels/sec where responsiveness takes precedence
    pub high_speed_threshold: f64,
    /// Maximum prediction lookahead duration
    pub max_prediction_window: Duration,
    /// Deadzone threshold in pixels to ignore sub-pixel micro-jitter
    pub deadzone_px: f64,
}

impl Default for PredictiveMouseConfig {
    fn default() -> Self {
        Self {
            min_smoothing: 0.15,
            max_smoothing: 0.65,
            high_speed_threshold: 1200.0,
            max_prediction_window: Duration::from_millis(50),
            deadzone_px: 0.5,
        }
    }
}

pub struct PredictiveMouseSmoother {
    config: PredictiveMouseConfig,
    last_raw_point: Option<MousePoint>,
    prev_raw_point: Option<MousePoint>,
    filtered_x: f64,
    filtered_y: f64,
    velocity_x: f64,
    velocity_y: f64,
    initialized: bool,
}

impl PredictiveMouseSmoother {
    pub fn new(config: PredictiveMouseConfig) -> Self {
        Self {
            config,
            last_raw_point: None,
            prev_raw_point: None,
            filtered_x: 0.0,
            filtered_y: 0.0,
            velocity_x: 0.0,
            velocity_y: 0.0,
            initialized: false,
        }
    }

    /// Resets filter state (e.g., when mouse button is clicked or focus is lost)
    pub fn reset(&mut self) {
        self.initialized = false;
        self.last_raw_point = None;
        self.prev_raw_point = None;
        self.velocity_x = 0.0;
        self.velocity_y = 0.0;
    }

    /// Ingests a new raw cursor point from network or local input
    pub fn push_point(&mut self, x: f64, y: f64, timestamp: Instant) -> (f64, f64) {
        if !self.initialized {
            self.filtered_x = x;
            self.filtered_y = y;
            self.last_raw_point = Some(MousePoint { x, y, timestamp });
            self.initialized = true;
            return (x, y);
        }

        let last = self.last_raw_point.unwrap();
        let dt = timestamp.saturating_duration_since(last.timestamp).as_secs_f64();

        if dt > 0.0001 {
            // Compute instantaneous velocity
            let raw_vx = (x - last.x) / dt;
            let raw_vy = (y - last.y) / dt;

            // Detect sharp direction reversal (dot product of velocity vectors < 0)
            let is_reversal = (raw_vx * self.velocity_x + raw_vy * self.velocity_y) < -500.0;

            if is_reversal {
                // Abrupt change: snap immediately to prevent overshooting
                self.velocity_x = raw_vx;
                self.velocity_y = raw_vy;
                self.filtered_x = x;
                self.filtered_y = y;
            } else {
                // Smooth velocity update
                self.velocity_x = self.velocity_x * 0.4 + raw_vx * 0.6;
                self.velocity_y = self.velocity_y * 0.4 + raw_vy * 0.6;

                let speed = (self.velocity_x * self.velocity_x + self.velocity_y * self.velocity_y).sqrt();

                // Dynamic alpha: less smoothing at higher speeds for minimal input lag
                let speed_ratio = (speed / self.config.high_speed_threshold).clamp(0.0, 1.0);
                let alpha = self.config.max_smoothing - speed_ratio * (self.config.max_smoothing - self.config.min_smoothing);

                let dx = x - self.filtered_x;
                let dy = y - self.filtered_y;

                if dx.abs() > self.config.deadzone_px {
                    self.filtered_x += dx * (1.0 - alpha);
                }
                if dy.abs() > self.config.deadzone_px {
                    self.filtered_y += dy * (1.0 - alpha);
                }
            }
        }

        self.prev_raw_point = self.last_raw_point;
        self.last_raw_point = Some(MousePoint { x, y, timestamp });

        (self.filtered_x, self.filtered_y)
    }

    /// Predicts future cursor coordinate ahead by `latency_window`
    pub fn predict_ahead(&self, latency_window: Duration) -> (f64, f64) {
        if !self.initialized {
            return (0.0, 0.0);
        }

        let clamped_window = latency_window.min(self.config.max_prediction_window);
        let dt = clamped_window.as_secs_f64();

        // Linear extrapolation with damped velocity
        let predicted_x = self.filtered_x + self.velocity_x * dt * 0.75;
        let predicted_y = self.filtered_y + self.velocity_y * dt * 0.75;

        (predicted_x, predicted_y)
    }

    pub fn current_position(&self) -> (f64, f64) {
        (self.filtered_x, self.filtered_y)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_predictive_mouse_initialization() {
        let mut smoother = PredictiveMouseSmoother::new(PredictiveMouseConfig::default());
        let now = Instant::now();
        let (x, y) = smoother.push_point(100.0, 200.0, now);
        assert_eq!(x, 100.0);
        assert_eq!(y, 200.0);
    }

    #[test]
    fn test_predictive_extrapolation() {
        let mut smoother = PredictiveMouseSmoother::new(PredictiveMouseConfig::default());
        let t0 = Instant::now();
        smoother.push_point(100.0, 100.0, t0);

        let t1 = t0 + Duration::from_millis(20);
        smoother.push_point(120.0, 100.0, t1);

        let (pred_x, pred_y) = smoother.predict_ahead(Duration::from_millis(30));
        assert!(pred_x > 115.0, "Predicted X should extrapolate in direction of motion");
        assert!((pred_y - 100.0).abs() < 1.0, "Predicted Y should remain stable for horizontal motion");
    }

    #[test]
    fn test_direction_reversal_snap() {
        let mut smoother = PredictiveMouseSmoother::new(PredictiveMouseConfig::default());
        let t0 = Instant::now();
        smoother.push_point(100.0, 100.0, t0);

        let t1 = t0 + Duration::from_millis(20);
        smoother.push_point(200.0, 100.0, t1); // Fast rightwards

        let t2 = t1 + Duration::from_millis(20);
        smoother.push_point(50.0, 100.0, t2); // Sharp leftward reversal

        let (curr_x, _) = smoother.current_position();
        // Should snap without extreme overshoot towards the right
        assert!(curr_x <= 150.0);
    }
}
