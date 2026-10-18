# BRAIN MANIFEST — Audira Desk
> **Central Knowledge Repository & Persistent Project Intelligence**  
> *Single Source of Truth (SSOT) untuk Arsitektur Sistem, Protokol Rendezvous & Relay, Pipeline Codec, Keamanan E2EE, dan Matriks Platform.*

---

## 1. Executive Overview

**Audira Desk** adalah platform remote access enterprise generasi modern berkinerja tinggi yang menggabungkan:
- **Rust Core Engine:** Kecepatan native, penanganan konkurensi asinkron berbasis Tokio, zero-copy screen capture via DXGI/PipeWire, dan injeksi input tingkat kernel.
- **Modern Flutter Client:** Antarmuka responsif untuk Windows, Linux, macOS, Android, dan iOS dengan arsitektur multi-window.
- **Self-Hosted / Distributed Infrastructure:** Server perantara rendezvous (`hbbs`) dan relay stream (`hbbr`) privat untuk kedaulatan data penuh.
- **Zero-Trust End-to-End Encryption (E2EE):** Pertukaran kunci X25519 dan cipher ChaCha20-Poly1305 / AES-256-GCM.
- **AI Session Diagnostics Copilot:** Analisis RTT, mitigasi packet loss, dan auto-tuning codec cerdas.

---

## 2. Peta Dokumen Brain (Brain Knowledge Map)

Brain ini diorganisir secara modular agar dapat dibaca, dipahami, dan diperbarui dengan cepat oleh AI Agent maupun pengembang:

| Modul Brain | Lokasi File | Deskripsi & Fokus Konten |
| :--- | :--- | :--- |
| **01. Arsitektur Sistem** | [SYSTEM_ARCHITECTURE.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SYSTEM_ARCHITECTURE.md) | Dekomposisi modul Rust, FFI Bridge, Flutter Client, threadpool Tokio, dan isolasi media capture. |
| **02. Katalog Fitur Lengkap** | [FEATURE_CATALOG.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/FEATURE_CATALOG.md) | Rincian fitur lengkap (Remote Control, File Manager, Audio Loopback, Privacy Mode, Multi-Display, Chat, Port Forward). |
| **03. Keamanan & Izin Sesi** | [SECURITY_AND_PERMISSIONS.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SECURITY_AND_PERMISSIONS.md) | Protokol E2EE X25519, hashing password permanen, UAC Elevation, permission gates, dan sanitasi rahasia. |
| **04. Protokol & Pipeline Codec** | [PROTOCOLS_AND_CODECS.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PROTOCOLS_AND_CODECS.md) | Spesifikasi framing paket, protokol rendezvous `hbbs`/`hbbr`, AV1/VP9/VP8/H.264 video pipeline, dan Opus audio. |
| **05. Matriks Integrasi Platform** | [PLATFORM_INTEGRATION_MATRIX.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PLATFORM_INTEGRATION_MATRIX.md) | Dukungan kapabilitas pada Windows, Linux (X11 & Wayland), macOS, Android, dan iOS. |
| **06. Alur Data & Penyimpanan** | [DATA_FLOW_AND_STORAGE.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/DATA_FLOW_AND_STORAGE.md) | Single import path `keys.rs`, penyimpanan konfigurasi lokal, state Provider Flutter, dan FFI streams. |
| **07. Riwayat Rilis & Roadmap** | [UPDATE_HISTORY_AND_ROADMAP.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/UPDATE_HISTORY_AND_ROADMAP.md) | Log evolusi proyek, catatan rilis v1.5.0, roadmap peningkatan performa, dan checklist sinkronisasi. |

---

## 3. Protokol Pembaruan Brain Otomatis

> **MANDATORY DIRECTIVE FOR ALL AI AGENTS & DEVELOPERS:**  
> Setiap kali terjadi penambahan fitur baru, perbaikan bug arsitektur, modifikasi FFI, atau perubahan konfigurasi:
> 1. **Dilarang keras membiarkan Brain menjadi usang (stale).**
> 2. Buka dan perbarui file terkait di [`.agents/brain/`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain).
> 3. Catat entri perubahan pada [UPDATE_HISTORY_AND_ROADMAP.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/UPDATE_HISTORY_AND_ROADMAP.md).
> 4. Pastikan `cargo check` atau `cargo test` tetap valid.
