# PRD — AUDIRA Remote Desktop

> **Product:** AUDIRA Remote Desktop  
> **Tagline:** "Ultra-Low Latency. End-to-End Encrypted. Cross-Platform. Autonomous AI Assistance."  
> **Version:** v1.5.0  
> **Target Audience:** Enterprise IT Support, System Administrators, DevOps & NOC Engineers, Remote Workforce  
> **Status:** Production Specification & Architecture Guide  

---

## 1. Problem Statement

Solusi remote desktop konvensional (seperti TeamViewer, AnyDesk, atau RDP bawaan) memiliki kelemahan signifikan:
1. **Ketergantungan Cloud Pihak Ketiga:** Data stream dan kredensial sering kali melalui server proprietary terpusat di luar kendali perusahaan, menimbulkan risiko kebocoran data dan ketidakpatuhan privasi (GDPR/HIPAA).
2. **Latensi Tinggi & Bottleneck Codec:** Pemrosesan video software lama mengakibatkan frame drop, latensi input tinggi pada koneksi bandwidth terbatas, dan artefak kompresi.
3. **Kompleksitas NAT & Firewall:** Sulitnya menembus jaringan enterprise bertingkat (Carrier-Grade NAT, symmetric NAT) tanpa konfigurasi port forwarding yang berisiko.
4. **Keamanan & Kontrol Izin Terfragmentasi:** Kurangnya granularitas dalam izin sesi (view-only, clipboard sync, transfer file, elevasi hak akses UAC Windows) serta ketiadaan audit trail yang tamper-evident.
5. **Ketiadaan AI Copilot:** Pemecahan masalah konektivitas, degradasi frame rate, dan diagnosis error remote machine masih dilakukan manual tanpa bantuan analisis otomatis.

---

## 2. Product Vision & Value Proposition

AUDIRA Remote Desktop mengombinasikan performa tinggi engine biner **Rust** (rendezvous mediator, DXGI/PipeWire screen capture, Enigo input injection, Libsodium crypto) dengan antarmuka modern responsif **Flutter**:
- **Self-Hosted Infrastructure:** Mendukung penuh rendezvous dan relay server privat (`hbbs` dan `hbbr`) mandiri.
- **End-to-End Encryption (E2EE):** Pertukaran kunci asimetris X25519 dan enkripsi simetris ChaCha20-Poly1305 menjamin hanya operator dan host yang dapat mendekripsi audio/video/input.
- **Ultra-Low Latency Streaming:** Akselerasi hardware (NVENC, Intel QSV, AMD AMF, Apple VideoToolbox) dan dukungan codec generasi baru (AV1, VP9, VP8, H.264).
- **Zero-Trust Access Control:** Multi-factor authentication, ID & IP whitelisting, UAC elevation prompt passing, Privacy Mode (screen blackout).
- **Integrated AI Copilot:** Monitoring telemetri koneksi real-time (RTT, loss, jitter, bitrate), auto-tuning codec, dan bantuan automasi diagnostik sesi remote.

---

## 3. Core Feature Specifications

### A. High-Performance Screen Streaming
- **Multi-Backend Capture (`libs/scrap`):**
  - **Windows:** Desktop Duplication API (DXGI / D3D11) dan GDI fallback.
  - **Linux:** Wayland Portal (PipeWire) dan X11 (XShm / XDamage).
  - **macOS:** ScreenCaptureKit dan Quartz Display Services.
- **Adaptive Codec Pipeline:** Negosiasi otomatis antara AV1, VP9, VP8, dan H.264/H.265 berbasis ketersediaan GPU hardware codec (`scrap/hwcodec`).
- **Dynamic Bitrate & Frame Pacing:** Deteksi packet loss dan RTT secara live untuk menurunkan bitrate atau framerate secara mulus tanpa pemutusan sesi.
- **Multi-Monitor Display Switcher:** Mendukung multi-monitor host dengan mode tampilan per-layar, tampilan gabungan (*all-in-one*), dan navigasi virtual desktop.

### B. Precision Input & Interaction Engine
- **Cross-Platform Input Injection (`libs/enigo`):**
  - Simulasi event mouse (klik kiri/kanan/tengah, scroll roda horizontal/vertikal, pergerakan relatif dan absolut).
  - Simulasi keyboard dengan translasi scancode native, tombol modifier (Ctrl, Alt, Shift, Super/Win), dan kombinasi tombol sistem (`Ctrl+Alt+Del`).
- **Clipboard Bi-Directional Synchronization (`libs/clipboard`):**
  - Sinkronisasi teks instan antara client dan host.
  - Dukungan copy-paste file melalui virtual clipboard integration.
- **Touch & Mobile Virtual Trackpad:**
  - Emulasi mouse presisi untuk klien mobile Flutter (Android & iOS) dengan gesture pinch-to-zoom, two-finger scroll, dan on-screen soft keyboard lengkap.

### C. Networking & NAT Traversal Protocol
- **Custom Rendezvous Architecture (`src/rendezvous_mediator.rs`):**
  - Registrasi ID perangkat berbasis UUID terenkripsi ke server rendezvous.
  - NAT punch-through (UDP hole punching) untuk koneksi langsung peer-to-peer (P2P).
- **Encrypted Relay Fallback:**
  - Jika koneksi langsung P2P terhalang oleh symmetric NAT / corporate firewall, trafik dialihkan secara transparan melalui relay server tanpa membuka payload terenkripsi.
- **TCP Tunneling & Port Forwarding:**
  - Fitur remote port forwarding untuk mengakses layanan lokal host (web server lokal, database, SSH internal) secara aman melalui tunnel terenkripsi.

### D. End-to-End Encryption & Security Gates
- **Cryptographic Handshake:** Libsodium / Curve25519 (X25519) key exchange untuk menghasilkan symmetric session key sekali pakai.
- **Symmetric Transport Cipher:** Enkripsi stream biner menggunakan ChaCha20-Poly1305 authenticated encryption atau AES-256-GCM.
- **Authentication Modes:**
  - *Dynamic Password:* Kata sandi acak satu kali pakai yang disegarkan setiap sesi atau interval waktu tertentu.
  - *Permanent Password (Unattended Access):* Kata sandi tetap terenkripsi dan di-hash aman untuk akses server tanpa pengawasan.
  - *Consent Window:* Dialog konfirmasi interaktif di host saat klien mencoba terhubung (Diterima / Ditolak / Hanya Lihat).
- **Security Guardrails:**
  - **ID & IP Whitelisting:** Pembatasan koneksi hanya dari ID klien atau rentang subnet IP terverifikasi.
  - **Privacy Mode:** Opsi menggelapkan layar monitor fisik host dan mengunci input lokal untuk menjaga kerahasiaan data saat sesi aktif.
  - **Windows UAC Elevation:** Kemampuan mengeskalasi sesi ke hak administrator Windows melalui background service (`src/service.rs`).

### E. Bi-Directional Chunked File Transfer
- **Dedicated File Manager Window (`libs/base/src/fs.rs`):**
  - Tampilan split-panel (Local Filesystem vs Remote Filesystem).
  - Navigasi direktori, upload, download, rename, delete, dan pembuatan direktori baru.
  - Transfer data berbasis chunk dengan verifikasi checksum, dukungan resume transfer terputus, dan proteksi anti-directory traversal.

### F. Real-Time Audio Streaming
- **System Audio Loopback:**
  - Windows: WASAPI loopback audio capture.
  - Linux: PulseAudio / PipeWire / ALSA monitor source.
  - macOS: CoreAudio tap capture.
- **Opus Codec Compression:** Streaming audio mono/stereo ultra-low delay (20ms buffer) terkompresi Opus.

### G. Modern Cross-Platform Flutter Interface
- **Flutter UI Desktop (`flutter/lib/desktop/`):**
  - Multi-window canvas (`desktop_multi_window`) untuk memisahkan jendela kontrol remote, file transfer, dan panel obrolan (chat).
  - System Tray integration dengan status online/offline dan kontrol background service.
  - Address Book terintegrasi dengan tag, status online peer, dan catatan sesi.
- **Flutter UI Mobile (`flutter/lib/mobile/`):**
  - Tampilan responsif untuk ponsel dan tablet.
  - Quick Connect via QR Code scan.

### H. AI Session Copilot & Diagnostics
- **Live Stream Diagnostics:** Deteksi otomatis lonjakan latensi, frame dropping, atau network degradation.
- **Automated Root Cause Advisory:** Rekomendasi otomatis peralihan codec (e.g. "Peralihan dari AV1 ke VP8 disarankan karena keterbatasan decoder hardware").
- **Incident Session Summary:** Ringkasan telemetri sesi untuk audit kepatuhan IT enterprise.
