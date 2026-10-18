# ARCHITECTURE — AUDIRA Remote Desktop

> **System:** AUDIRA Remote Desktop (Enterprise Secure Remote Access Platform)  
> **Tagline:** "Ultra-Low Latency. End-to-End Encrypted. Cross-Platform. Autonomous AI Assistance."  
> **Version:** v1.5.0  
> **Status:** Production Architecture Specification  

---

## 1. System Overview & Layered Architecture

AUDIRA Remote Desktop dibangun dengan arsitektur terpisah berkinerja tinggi: **Rust** menangani logika inti tingkat rendah (networking socket, enkripsi asimetris, penangkapan layar DirectX/Wayland, injeksi input sistem, dan kompresi video/audio), sementara **Flutter** menyajikan antarmuka grafis desktop dan mobile modern melalui FFI bridge (`flutter_rust_bridge`).

```
                    AUDIRA REMOTE DESKTOP
                              │
                    [ FLUTTER CLIENT UI ]
           (Desktop / Mobile / System Tray / Multi-Window)
                              │
                    [ FFI & BRIDGE LAYER ]
        (flutter_rust_bridge / Protobuf DTOs / Tokio Stream)
                              │
                   [ CORE APPLICATION RUNTIME ]
         (Session State Machine, Config, Authorization)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
  [ MEDIA ENGINE ]     [ INPUT & CLIPBOARD ]  [ NETWORK & CRYPTO ]
  • libs/scrap         • libs/enigo           • libs/hbb_common
  • Video Codecs       • libs/clipboard       • Rendezvous Mediator
    (AV1/VP9/H264)     • Touch Emulation      • Libsodium X25519
  • WASAPI/Opus Audio                         • Relay / P2P Tunnel
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                 [ PLATFORM ADAPTATION LAYER ]
              (Windows / Linux / macOS / Android)
                              │
                       PHYSICAL HARDWARE
           (Display GPU / Audio Loopback / HID Input)
```

---

## 2. Architectural Layers

### A. Presentation Layer (`flutter/`)
- **Flutter Framework (Dart 3.x / Flutter 3.10+)**: Multi-platform UI deklaratif.
- **Desktop UI (`flutter/lib/desktop/`)**:
  - `desktop_multi_window`: Memungkinkan pembukaan jendela terpisah untuk setiap sesi remote yang sedang aktif.
  - `window_manager`: Mengontrol ukuran jendela, borderless fullscreen, dan status docking.
  - Sesi Toolbar: Tombol switch display monitor, zoom mode, kualitas video (Speed/Balanced/Quality), privacy mode, transfer file.
- **Mobile UI (`flutter/lib/mobile/`)**:
  - Touch-to-mouse emulation, gesture recognition (pinch, scroll, double-tap).
  - Virtual on-screen toolbar dan software keyboard handler.
- **State Management & Models (`flutter/lib/models/` & `flutter/lib/common/`)**:
  - Provider model yang mengikat state FFI Rust ke reactive widget.

### B. Bridge & FFI Layer (`src/flutter_ffi.rs`)
- **`flutter_rust_bridge`**: Pipa penghubung antara Dart VM dan native Rust binary.
- Mengirimkan event secara asinkron tanpa memblokir thread UI Flutter:
  - Streaming texture frame video ke Flutter Texture Widget.
  - Streaming level audio dan status koneksi peer.
  - Pengiriman event mouse dan keyboard dari UI ke driver input Rust.
- Serialisasi pesan menggunakan Protocol Buffers (`prost` / `protobuf`).

### C. Application Core & Session Manager (`src/` & `libs/base/`)
- **State Machine Koneksi**: Mengelola siklus hidup sesi (Handshake -> Authentication -> Key Exchange -> Media Streaming -> Close).
- **Config Core (`libs/base/src/config/keys.rs`)**: Single import path untuk seluruh opsi konfigurasi aplikasi (ID, relay server, opsi audio/video, whitelisting).
- **Service Process (`src/service.rs`)**: Background daemon (Windows Service / systemd) yang berjalan dengan elevated privilege untuk menangani UAC elevation dan unattended access.

### D. Media Capture & Codec Engine (`libs/scrap/` & `src/server/`)
- **Screen Capture (`libs/scrap/`)**:
  - Windows: Desktop Duplication API (DXGI / D3D11) dengan zero-copy texture sharing dan fallback GDI.
  - Linux: Wayland Portal (PipeWire) dan X11 (XShm / XDamage).
  - macOS: ScreenCaptureKit dan Quartz Display Services.
- **Video Encoders / Decoders (`scrap/hwcodec`)**:
  - Hardware Acceleration: NVENC (NVIDIA), Intel QSV, AMD AMF, Apple VideoToolbox.
  - Software Fallback: `libvpx` (VP8, VP9), `aom` (AV1), OpenH264.
- **Audio Capture & Codec**:
  - System loopback capture (WASAPI pada Windows, PulseAudio/ALSA pada Linux).
  - Kompresi Opus real-time ultra-low delay.

### E. Input Injection & Clipboard (`libs/enigo/` & `libs/clipboard/`)
- **Input Injection (`libs/enigo/`)**:
  - Konversi koordinat normalisasi (0.0–1.0) ke resolusi fisik display target.
  - Translasi keyboard scancode cross-platform dengan dukungan layout internasional.
- **Clipboard Management (`libs/clipboard/`)**:
  - Sinkronisasi clipboard dua arah teks dan file payload.

### F. Network & Cryptography Layer (`src/rendezvous_mediator.rs` & `libs/hbb_common/`)
- **Rendezvous Protocol**:
  - Pendaftaran ID klien ke server perantara (`hbbs`).
  - Pemrosesan sinyal NAT traversal (UDP hole punching) untuk membuka jalur langsung P2P.
- **Encrypted Relay Fallback (`hbbr`)**:
  - Jika P2P gagal karena symmetric NAT atau corporate firewall, stream dialihkan melalui relay berkecepatan tinggi tanpa mendekripsi payload.
- **Cryptographic Security (Libsodium)**:
  - Asymmetric X25519 key exchange untuk negosiasi kunci simetris sesi.
  - Enkripsi transport berbasis ChaCha20-Poly1305 authenticated cipher.

---

## 3. Directory Structure

```text
f:/AUDIRA-REMOTE-DEKSTOP/
├── src/                          # Rust Application Core
│   ├── main.rs                   # Entry point aplikasi utama
│   ├── service.rs                # Background elevated service (Windows Service / Daemon)
│   ├── naming.rs                 # Naming binary entrypoint
│   ├── rendezvous_mediator.rs    # Rendezvous protocol & server mediator
│   ├── flutter_ffi.rs            # Jembatan FFI dengan Flutter
│   ├── client.rs                 # Remote desktop client session controller
│   ├── server/                   # Audio / clipboard / input / video / network streaming
│   ├── platform/                 # Platform-specific native logic (Windows, Linux, macOS)
│   ├── ui/                       # Legacy Sciter UI (deprecated)
│   └── lang/                     # Lokalisasi multi-bahasa (src/lang/*.rs)
├── flutter/                      # Modern Flutter UI
│   ├── lib/
│   │   ├── desktop/              # Antarmuka desktop multi-window
│   │   ├── mobile/               # Antarmuka smartphone/tablet
│   │   ├── common/               # Komponen UI bersama, styling, assets
│   │   └── models/               # State provider & model data FFI
│   └── pubspec.yaml              # Dependensi Flutter (window_manager, ffi, provider)
├── libs/                         # Workspace Crates (Submodules & Internal Libraries)
│   ├── base/                     # (crate `base`) Client config, option keys, fs transfer
│   │   └── src/config/keys.rs    # Single import path untuk seluruh opsi konfigurasi
│   ├── hbb_common/               # Shared rendezvous proto, sockets, Config core
│   ├── scrap/                    # Screen capture (DXGI, PipeWire, X11, AVFoundation)
│   ├── enigo/                    # Input simulation (Keyboard, Mouse, Wheel)
│   └── clipboard/                # System clipboard access & sync
├── Cargo.toml                    # Rust workspace manifest & feature flags
└── build.rs                      # Native build script (vcpkg, C++ headers, protobuf)
```

---

## 4. Threading & Concurrency Model (Tokio)

1. **Async Runtime (Tokio)**:
   - Satu runtime global Tokio mengelola seluruh operasi I/O socket, rendezvous heartbeat, dan framing pesan.
   - Dilarang membuat runtime bersarang (*nested runtime*) atau memanggil `Runtime::block_on()` di dalam kode async.
2. **Dedicated Threads untuk Media**:
   - Thread penangkapan layar (*Screen Capture Thread*) berjalan dengan prioritas tinggi terisolasi untuk menjamin target 60 FPS tanpa terpengaruh beban I/O.
   - Thread encoding video berjalan terpisah memanfaatkan threadpool encoder hardware/software.
3. **UI Isolation**:
   - Thread Flutter UI berjalan mandiri pada isolate Dart dan hanya berkomunikasi via FFI asynchronous stream ports.
