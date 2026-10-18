---
name: screen-capture-scrap
description: Low-level screen capture development with libs/scrap, covering Windows DXGI Desktop Duplication, Linux Wayland PipeWire DMA-BUF, X11 XShm, and macOS ScreenCaptureKit.
---

# Screen Capture (libs/scrap) Skill

This skill documents screen capture architectures and platform backends used across Windows, Linux, and macOS in AUDIRA Remote Desktop.

## 1. Supported Platform Backends
- **Windows:** DXGI Desktop Duplication (`IDXGIOutputDuplication`) via Direct3D 11. Zero-copy VRAM surface capture with GDI fallback for older display adapters.
- **Linux Wayland:** `xdg-desktop-portal` ScreenCast session with PipeWire DMA-BUF buffer sharing.
- **Linux X11:** `XShmGetImage` and `XDamage` extension for dirty rect invalidation.
- **macOS:** `ScreenCaptureKit` (macOS 12.3+) and legacy `CGDisplayStream` / Quartz Display Services.

## 2. Windows DXGI Pipeline
```rust
// Windows DXGI capture loop pattern in libs/scrap/src/common/dxgi.rs
// 1. Acquire next frame from DXGI Output Duplication
// 2. Map resource texture or copy directly to GPU encoder
// 3. Release frame to allow desktop compositor to continue
```

## 3. Handling Display Sleep & Virtual Displays
- When headless without a monitor, DXGI returns `DXGI_ERROR_WAIT_TIMEOUT`.
- The display wake feature (`--features drm-wake` or Windows wake pointer injection) synthesizes input to reactivate power-saving compositors.
- For true headless operation, configure a virtual display driver or software dummy plug.
