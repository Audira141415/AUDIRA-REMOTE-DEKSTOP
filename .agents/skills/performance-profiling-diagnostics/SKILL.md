---
name: performance-profiling-diagnostics
description: Diagnostics and profiling for remote desktop sessions, measuring round-trip time (RTT), frame latency, packet loss, memory leak detection, and throttled logging.
---

# Performance Profiling & Diagnostics Skill

This skill explains how to measure real-time session quality, diagnose performance bottlenecks, and monitor memory usage in AUDIRA Remote Desktop.

## 1. Key Performance Indicators (KPIs)
- **Round-Trip Time (RTT):** Ping duration between client and host (Target: < 30ms for local/regional, < 80ms for cross-region).
- **Frame Latency:** Duration from screen capture -> hardware encode -> network transmit -> client decode -> render (Target: < 40ms total glass-to-glass).
- **Framerate (FPS):** Target 60 FPS under active screen movement; drop to 1-5 FPS on static desktops.
- **Packet Loss:** Acceptable < 1%; loss > 2% requires immediate bitrate throttle.

## 2. Throttled Logging for High-Frequency Events
Per `AGENTS.md` guidelines:
```rust
// Use throttled logging for repetitive errors
use hbb_common::throttled_log;

throttled_log!(
    std::time::Duration::from_secs(5),
    log::Level::Warn,
    "Dropped frame in stream due to buffer congestion: count={}",
    dropped_count
);
```

## 3. Detecting Memory & Handle Leaks
- Check GDI and USER Object count in Task Manager on Windows.
- Ensure all DirectX 11 textures and COM pointers release properly upon monitor resolution changes or session termination.
