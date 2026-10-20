//! Reference Example: Throttled Metrics Logger
//! Complies with AGENTS.md logging budget: prevents log spamming per-frame.

use std::time::{Duration, Instant};

pub struct ThrottledLatencyLogger {
    last_log_instant: Instant,
    log_interval: Duration,
    accumulated_frames: u32,
    total_latency_ms: f64,
}

impl ThrottledLatencyLogger {
    pub fn new(log_interval: Duration) -> Self {
        Self {
            last_log_instant: Instant::now(),
            log_interval,
            accumulated_frames: 0,
            total_latency_ms: 0.0,
        }
    }

    /// Records latency for a single frame and outputs only once per interval
    pub fn record_frame_latency(&mut self, latency_ms: f64) {
        self.accumulated_frames += 1;
        self.total_latency_ms += latency_ms;

        if self.last_log_instant.elapsed() >= self.log_interval {
            let avg_latency = self.total_latency_ms / self.accumulated_frames as f64;
            // Trace or info once per interval
            println!(
                "[PERF METRIC] Interval Avg Latency: {:.2} ms (over {} frames)",
                avg_latency, self.accumulated_frames
            );

            // Reset accumulator
            self.last_log_instant = Instant::now();
            self.accumulated_frames = 0;
            self.total_latency_ms = 0.0;
        }
    }
}
