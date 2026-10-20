# Video Codec Matrix & Adaptation Reference

## 1. Supported Codecs Comparison

| Codec | Library / Backend | Latency Profile | CPU Usage | Recommended Network | Hardware Acceleration |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **H.264 (AVC)** | NVENC / AMF / QuickSync / OpenH264 | Ultra Low (<15ms) | Low | High / LAN / WAN | Yes (Broadest compatibility) |
| **H.265 (HEVC)**| NVENC / AMF / QuickSync | Ultra Low (<20ms) | Low (HW) | Constrained WAN | Yes |
| **VP9** | `libvpx` | Medium (25-40ms) | Moderate | Stable Broadband | Partial |
| **AV1** | `aom` / NVENC AV1 / Intel QSV | High quality | High (SW) | High-loss WAN | Yes (RTX 40xx / Intel Arc) |
| **VP8** | `libvpx` | Low (Legacy) | Low-Med | Fallback | No |

## 2. Bitrate Adaptation Strategy
AUDIRA dynamically adjusts video encoder bitrate based on RTT (Round Trip Time) and packet loss metrics reported by the client:

- **Loss Rate < 1% & RTT < 50ms:** Maintain high bitrate (4,000–8,000 kbps), framerate 60 FPS.
- **Loss Rate 1%–5%:** Scale bitrate down by 25%, maintain framerate.
- **Loss Rate > 5% or RTT > 150ms:** Scale bitrate to 1,000–1,500 kbps, drop target framerate to 30 FPS, enforce intra-refresh or periodic keyframe dispatch.
