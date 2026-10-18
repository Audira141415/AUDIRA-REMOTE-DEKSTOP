---
name: video-codec-tuning
description: Tuning video encoders and decoders (AV1, VP9, VP8, H.264/H.265), hardware acceleration via scrap/hwcodec, adaptive bitrate control, keyframe generation, and frame pacing.
---

# Video Codec Tuning & Adaptation Skill

This skill provides guidelines for configuring hardware/software video codecs and implementing dynamic adaptive bitrate (ABR) controls in AUDIRA Remote Desktop.

## 1. Codec Hierarchy & Selection Strategy
1. **Hardware AV1 (`hwcodec`):** Preferred on high-spec workstations with Intel Arc, NVIDIA RTX 40-series, or AMD RDNA3 GPUs when low bandwidth is detected.
2. **Hardware VP9 / H.264:** Broad compatibility across standard desktop and mobile hardware.
3. **Software Fallback (`libvpx` / `aom`):** Universal software encoding when no supported hardware encoder is detected.

## 2. Adaptive Bitrate (ABR) Policy
- **Low Latency / Stable Link (RTT < 30ms, Loss < 0.5%):**
  - Bitrate: 4.0 – 8.0 Mbps
  - FPS: 60 FPS
  - Color Subsampling: YUV444 (High Quality preset) or YUV420 (Balanced)
- **Degraded Link (RTT > 80ms, Loss > 2.0%):**
  - Automatically throttle bitrate to 1.2 – 2.0 Mbps
  - Drop framerate target to 30 FPS
  - Request on-demand I-frame to repair visual corruption

## 3. Dynamic Keyframe Generation
When client reports missing frames or decode failure:
```rust
// Request host encoder to force IDR/Keyframe
encoder.set_keyframe_request(true);
```
