# Performance Profiling & Metric Definitions Reference

## 1. Key Performance Indicators (KPIs)
- **Round-Trip Time (RTT):** Milliseconds elapsed between sending a ping packet and receiving its corresponding pong. Target: < 40ms on LAN, < 80ms on regional broadband.
- **Capture Latency:** Time taken by DXGI / PipeWire to read surface from GPU VRAM. Target: < 5ms.
- **Encode Latency:** Time taken by NVENC / QuickSync / libvpx to compress the frame into H.264 / AV1 bitstream. Target: < 8ms.
- **Render Latency:** Time taken by client texture pipeline to blit frame to display surface. Target: < 4ms.
- **Total Glass-to-Glass Latency:** Sum of Capture + Encode + Network Transit + Decode + Render. Target: < 50ms.
