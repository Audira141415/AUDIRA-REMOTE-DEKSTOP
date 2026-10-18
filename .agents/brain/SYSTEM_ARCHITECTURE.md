# SYSTEM ARCHITECTURE — Audira Desk
> Dekomposisi Rust Core, Workspace Crates, Flutter Client, Threading Model, dan FFI Bridge.

---

## 1. Topologi Repositori & Workspace Crates

Audira Desk dikembangkan menggunakan arsitektur Cargo Workspace modular:

```text
audira-remote-desktop/
├── src/                          # Binary Entrypoints & Core App Runtime
│   ├── main.rs                   # Aplikasi desktop / service launcher
│   ├── service.rs                # Windows Service / System Daemon (Elevated priv)
│   ├── naming.rs                 # Naming binary resolver
│   ├── rendezvous_mediator.rs    # Protokol mediator ke hbbs server
│   ├── flutter_ffi.rs            # Jembatan FFI dengan Flutter engine
│   ├── client.rs                 # State machine sisi klien remote
│   ├── server/                   # Audio, clipboard, input, video server engine
│   ├── platform/                 # Modul spesifik OS (Windows, Linux, macOS, Android)
│   └── lang/                     # Multi-language localization maps (src/lang/*.rs)
├── flutter/                      # Modern Flutter Frontend
│   ├── lib/
│   │   ├── desktop/              # Multi-window remote canvas, toolbar, settings
│   │   ├── mobile/               # Touch gestures, virtual trackpad, QR scan
│   │   ├── common/               # Design tokens, assets, shared widgets
│   │   └── models/               # FFI state bindings & Provider models
│   └── pubspec.yaml              # Dependensi Dart
└── libs/                         # Internal Crates (Submodules & Workspace Members)
    ├── base/                     # Client-only logic: config keys, fs transfer, proto
    │   └── src/config/keys.rs    # Single import path untuk seluruh opsi konfigurasi
    ├── hbb_common/               # Shared with server: rendezvous proto, sockets, core
    ├── scrap/                    # Screen capture: DXGI/D3D11, PipeWire, X11, AVFoundation
    ├── enigo/                    # Keyboard & mouse event synthesis
    └── clipboard/                # Multi-platform clipboard read/write
```

---

## 2. Rincian Workspace Crates

### 1. `libs/base` (Client Logic & Config Keys)
- Crate independen khusus klien (bukan submodule server).
- **`src/config/keys.rs`**: Satu-satunya jalur impor (*single import path*) untuk seluruh kunci opsi konfigurasi client.
- **`src/fs.rs`**: Implementasi aman transfer file terenkripsi berbasis chunk dengan validasi path traversal.
- **`src/message_proto.rs`**: Definisi struktur pesan protobuf yang digunakan dalam komunikasi data.

### 2. `libs/hbb_common` (Shared Protocol Core)
- Git submodule yang digunakan bersama antara client dan server (`rustdesk-server`).
- Mengatur komunikasi socket UDP/TCP, deserialisasi pesan rendezvous, dan negosiasi protokol.
- Mengikuti aturan *minimal intervention* karena perubahan pada submodule ini memerlukan koordinasi dua arah dengan repositori server.

### 3. `libs/scrap` (Low-Level Screen Capture)
- Abstraksi capture frame GPU berkinerja tinggi:
  - **Windows**: DXGI Desktop Duplication API (D3D11 texture capture dengan zero-copy pipeline) dan GDI software fallback.
  - **Linux**: Wayland Desktop Portal via PipeWire DMA-BUF dan X11 XShm.
  - **macOS**: ScreenCaptureKit modern dan Quartz Display Services.
- Terintegrasi dengan flag `hwcodec` untuk feeding frame langsung ke encoder NVENC / Intel QSV / AMD AMF.

### 4. `libs/enigo` (Native Input Simulation)
- Menangani konversi event koordinat mouse absolut dan relatif.
- Memetakan tombol keyboard fisik ke Virtual Keycodes (Windows VK, Linux XKB, macOS KeyCodes) dengan dukungan scancode scancode transparan.

### 5. `libs/clipboard` (Clipboard Synchronizer)
- Mendeteksi perubahan clipboard sistem operasi secara efisien tanpa polling CPU tinggi.
- Mengirimkan teks dan berkas payload ke peer yang terhubung.

---

## 3. Concurrency, Threading & Data Flow Model

```
 ┌──────────────────────┐             ┌──────────────────────┐
 │   Flutter UI Thread  │             │   Tokio Async Loop   │
 │   (Dart Isolate)     │             │  (Network & Events)  │
 └──────────┬───────────┘             └──────────┬───────────┘
            │                                    │
            │ FFI Async Call / StreamPort        │ Async Sockets
            ▼                                    ▼
 ┌───────────────────────────────────────────────────────────┐
 │               Flutter FFI Bridge (Rust)                   │
 └──────────┬────────────────────────────────────┬───────────┘
            │                                    │
            ▼ Frame / Buffer                     ▼ Mutex / Channel
 ┌──────────────────────┐             ┌──────────────────────┐
 │ Screen Capture Loop  │             │ Audio & Input Worker │
 │  (Dedicated Thread)  │             │ (Dedicated Threads)  │
 └──────────────────────┘             └──────────────────────┘
```

1. **Flutter UI Isolate**: Berjalan pada 60/120 Hz render loop; tidak pernah dibebani kalkulasi berat.
2. **Tokio Async Worker Pool**: Menangani I/O non-blocking (koneksi UDP rendezvous, heartbeat, TCP relay tunnel).
3. **Capture & Encoding Thread**: Thread berprioritas tinggi terpisah untuk menjaga target 60 FPS konsisten tanpa terinterupsi latensi jaringan.
4. **Input Injection Worker**: Menjamin penekanan tombol dan pergerakan mouse direspons instan pada sistem operasi target.
