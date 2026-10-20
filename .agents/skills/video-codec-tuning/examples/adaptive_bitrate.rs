//! Reference Example: Dynamic Bitrate & Quality Controller
//! Used for adaptive stream rate control in AUDIRA Remote Desktop.

#[derive(Debug, Clone)]
pub struct NetworkMetrics {
    pub rtt_ms: u32,
    pub packet_loss_ratio: f32, // 0.0 to 1.0
}

#[derive(Debug, PartialEq, Eq)]
pub struct EncoderConfig {
    pub bitrate_kbps: u32,
    pub target_fps: u32,
    pub force_keyframe: bool,
}

pub struct BitrateController {
    current_bitrate: u32,
    max_bitrate: u32,
    min_bitrate: u32,
}

impl BitrateController {
    pub fn new(initial_bitrate: u32, min_bitrate: u32, max_bitrate: u32) -> Self {
        Self {
            current_bitrate: initial_bitrate,
            min_bitrate,
            max_bitrate,
        }
    }

    /// Evaluates current network condition and adjusts encoder bitrate
    pub fn update(&mut self, metrics: &NetworkMetrics) -> EncoderConfig {
        let mut force_keyframe = false;

        if metrics.packet_loss_ratio > 0.08 || metrics.rtt_ms > 200 {
            // Severe congestion: drop bitrate aggressively
            self.current_bitrate = (self.current_bitrate as f32 * 0.70) as u32;
            force_keyframe = true;
        } else if metrics.packet_loss_ratio > 0.02 || metrics.rtt_ms > 100 {
            // Moderate loss: step down gradually
            self.current_bitrate = (self.current_bitrate as f32 * 0.85) as u32;
        } else if metrics.packet_loss_ratio < 0.005 && metrics.rtt_ms < 60 {
            // Excellent network: step up bitrate towards ceiling
            self.current_bitrate = (self.current_bitrate as f32 * 1.10) as u32;
        }

        // Clamp within allowable limits
        self.current_bitrate = self.current_bitrate.clamp(self.min_bitrate, self.max_bitrate);

        let target_fps = if self.current_bitrate < 1500 { 30 } else { 60 };

        EncoderConfig {
            bitrate_kbps: self.current_bitrate,
            target_fps,
            force_keyframe,
        }
    }
}
