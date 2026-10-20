//! Reference Example: Real-time Audio Frame Buffer and Silence Detection Pattern
//! Used for host audio capture in AUDIRA Remote Desktop.

pub struct AudioPcmFrame {
    pub samples: Vec<f32>,
    pub channels: u16,
    pub sample_rate: u32,
}

impl AudioPcmFrame {
    pub fn new(channels: u16, sample_rate: u32) -> Self {
        Self {
            samples: Vec::with_capacity(960 * channels as usize),
            channels,
            sample_rate,
        }
    }

    /// Evaluates if the 20ms audio frame is silent to avoid redundant encoding
    pub fn is_silent(&self, silence_threshold: f32) -> bool {
        if self.samples.is_empty() {
            return true;
        }
        let max_amp = self.samples.iter().fold(0.0f32, |acc, &val| acc.max(val.abs()));
        max_amp < silence_threshold
    }
}
