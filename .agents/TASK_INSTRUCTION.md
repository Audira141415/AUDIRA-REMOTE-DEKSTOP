# TASK INSTRUCTION — AUDIRA Remote Desktop

> **System:** AUDIRA Remote Desktop (Enterprise Secure Remote Access Platform)  
> **Tagline:** "Ultra-Low Latency. End-to-End Encrypted. Cross-Platform. Autonomous AI Assistance."  
> **Purpose:** Panduan implementasi bertahap untuk Developer & AI Coding Agent  
> **Version:** v1.5.0  

---

## 0. Prerequisite Reading (WAJIB BACA)

Sebelum memodifikasi atau menulis kode baru di repository ini, seluruh developer dan AI coding agent **WAJIB** membaca dan mematuhi:
1. `AGENTS.md` — Aturan fundamental codebase: Rust & Tokio guidelines, editing hygiene, import conventions, minimal diffs, dan review rules.
2. `ARCHITECTURE.md` — Layer sistem, FFI bridge, struktur crate workspace, dan model threading.
3. `SECURITY.md` — E2EE (X25519 & ChaCha20-Poly1305), consent gates, UAC elevation, dan secret redaction.
4. `PRD.md` — Spesifikasi fungsional streaming, input injection, relay/rendezvous, dan file transfer.
5. `DESIGN.md` — Standar antarmuka Flutter desktop/mobile, toolbar sesi, visual feedback, dan status latency.

---

## 1. Golden Rules of Code Generation

### A. Rust & Tokio Mandates (Strict)
1. **Dilarang `unwrap()` / `expect()` pada Kode Produksi:**
   - Gunakan `Result<T, E>` dengan operator `?` atau penanganan error eksplisit (`match`/`if let`).
   - Pengecualian: Unit test atau lock mutex poisoning di mana panic adalah perilaku yang disengaja.
2. **Manajemen Memori Bersih:**
   - Hindari `.clone()` yang tidak perlu. Utamakan borrowing (`&`, `&mut`).
   - Jangan menambah crate dependensi baru di `Cargo.toml` tanpa izin dan kebutuhan mutlak.
3. **Tokio Async Safety:**
   - Asumsikan Tokio runtime global sudah berjalan.
   - **Dilarang keras** membuat runtime bersarang atau memanggil `Runtime::block_on()` di dalam context async.
   - **Dilarang memegang lock Mutex across `.await`**. Gunakan Tokio Mutex atau lepaskan lock sebelum titik `.await`.
   - Gunakan `tokio::task::spawn_blocking` untuk operasi CPU-bound atau blocking I/O (seperti encoding frame atau penulisan disk besar).
   - Dilarang memanggil `std::thread::sleep()` di dalam fungsi `async`. Gunakan `tokio::time::sleep()`.
4. **Logging Throttling:**
   - Event yang berulang per-frame, per-packet, atau dalam loop render/input DILARANG menggunakan `log::debug!` atau `log::info!` tanpa throttling.
   - Gunakan `log::trace!` untuk tracing detail internal, atau `hbb_common::throttled_log!(interval, level, ...)` untuk pelaporan error berulang.

### B. Editing Hygiene & Minimally Invasive Diffs
1. **Perubahan Aditif Murni:**
   - Utamakan diff terkecil yang valid. Hindari refactoring kode yang tidak berhubungan dengan bug/fitur yang diminta.
   - Jangan merombak kode lama hanya agar bisa berbagi abstraksi dengan fitur baru; lebih baik buat fungsi terpisah yang bersih.
   - Jangan membuat perubahan format-only (whitespace, re-indent massal).
2. **Konvensi Import Tunggal Per Crate:**
   - Gunakan satu deklarasi `use` per crate dengan kurung kurawal, bukan multi-line berulang:
     ```rust
     // BENAR
     use base::{fs, message_proto::*};
     // SALAH
     use base::fs;
     use base::message_proto::*;
     ```
3. **Submodule & Workspace Scope Check:**
   - `libs/hbb_common/` adalah git submodule yang digunakan bersama dengan server. Hindari modifikasi jika memungkinkan. Letakkan kode client-only di `libs/base/`.
   - Seluruh opsi konfigurasi diakses via import tunggal: `libs/base/src/config/keys.rs`.
   - Logika spesifik OS diletakkan di `src/platform/` dengan thin hook di file bersama (`src/tray.rs`, `src/server/connection.rs`).

### C. Flutter & FFI Safety
1. **Isolasi UI Thread:**
   - Thread Dart UI tidak boleh menunggu operasi synchronous Rust yang memakan waktu. Semua interaksi FFI harus berbasis async port atau message callback.
2. **Memory Leak Prevention:**
   - Pointer memory atau texture buffer yang dialokasikan di sisi Rust wajib memiliki lifecycle yang jelas dan didestruksi saat jendela remote ditutup.

---

## 2. Phase-by-Phase Implementation Checklist

### Phase 1: Core Architecture & Workspace Setup
- [x] Task 1.1: Pemetaan crates workspace (`base`, `hbb_common`, `scrap`, `enigo`, `clipboard`).
- [x] Task 1.2: Konfigurasi dependencies vcpkg (`libvpx`, `libyuv`, `opus`, `aom`) untuk build statis.
- [x] Task 1.3: Pengaturan single import path untuk konfigurasi di `libs/base/src/config/keys.rs`.

### Phase 2: Security, Cryptography & Privilege Elevation
- [x] Task 2.1: Implementasi pertukaran kunci X25519 dan stream cipher ChaCha20-Poly1305 via Libsodium.
- [x] Task 2.2: Implementasi hashing kata sandi permanen (unattended access) dan proteksi brute-force.
- [x] Task 2.3: Windows UAC elevation bridge via elevated service daemon (`src/service.rs`).
- [x] Task 2.4: Mekanisme Privacy Mode (blackout monitor lokal host) dan input locking.

### Phase 3: Media Capture & Streaming Engine
- [x] Task 3.1: Penangkapan layar multi-backend di `libs/scrap` (DXGI/D3D11, PipeWire, X11, AVFoundation).
- [x] Task 3.2: Pipeline video codec adaptif (AV1, VP9, VP8, H.264) dengan akselerasi hardware (`hwcodec`).
- [x] Task 3.3: Dynamic bitrate adaptation & frame pacing berdasarkan metrik packet loss / RTT.
- [x] Task 3.4: Audio loopback streaming ultra-low latency (WASAPI / PulseAudio) terkompresi Opus.

### Phase 4: Input Injection & Interaction
- [x] Task 4.1: Cross-platform input injection di `libs/enigo` (mouse coordinates normalizer, scancode mapping).
- [x] Task 4.2: Dukungan kombinasi tombol sistem (`Ctrl+Alt+Del`, `Win+L`, `Alt+Tab`).
- [x] Task 4.3: Sinkronisasi clipboard dua arah (teks dan file) di `libs/clipboard`.
- [x] Task 4.4: Touch emulation dan virtual trackpad untuk mobile Flutter client.

### Phase 5: Network Traversal & Rendezvous Protocol
- [x] Task 5.1: Protokol komunikasi rendezvous ke `hbbs` di `src/rendezvous_mediator.rs`.
- [x] Task 5.2: UDP hole-punching NAT traversal untuk direct peer-to-peer (P2P).
- [x] Task 5.3: Fallback ke encrypted relay server (`hbbr`) saat P2P terhalang symmetric NAT.
- [x] Task 5.4: TCP Tunneling & Port Forwarding untuk akses service internal host.

### Phase 6: Bi-Directional File Transfer
- [x] Task 6.1: Chunked file streaming protocol di `libs/base/src/fs.rs`.
- [x] Task 6.2: Verifikasi hash integritas file dan dukungan resume transfer.
- [x] Task 6.3: Sanitasi path direktori untuk mencegah serangan directory traversal (`../`).

### Phase 7: Modern Flutter UI (Desktop & Mobile)
- [x] Task 7.1: Setup Flutter desktop multi-window (`desktop_multi_window`) dan window manager.
- [x] Task 7.2: Remote session toolbar (display switch, quality switcher, privacy mode, chat drawer).
- [x] Task 7.3: File Transfer split-panel UI di Flutter.
- [x] Task 7.4: System tray integration dan daemon status monitor.
- [x] Task 7.5: UI Lokalisasi multi-bahasa via `src/lang/*.rs`.

### Phase 8: Quality Assurance & Release Verification
- [ ] Task 8.1: Verifikasi unit tests workspace via `cargo test --workspace`.
- [ ] Task 8.2: Verifikasi Flutter tests via `flutter test`.
- [ ] Task 8.3: Pemeriksaan regression-surface check pada diff yang dimodifikasi.
- [ ] Task 8.4: Validasi build release executable pada target platform.
