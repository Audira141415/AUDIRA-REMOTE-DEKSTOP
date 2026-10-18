# PLATFORM INTEGRATION MATRIX — AUDIRA Remote Desktop
> Matriks Kompatibilitas Sistem Operasi, Driver Native, dan Batasan Platform.

---

## 1. Matriks Fitur Lintas Platform

| Fitur / Sub-Sistem | Windows (10/11) | Linux (X11) | Linux (Wayland) | macOS (12+) | Android (8+) | iOS (14+) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Screen Capture Native** | DXGI / D3D11 | X11 XShm | PipeWire Portal | ScreenCaptureKit | MediaProjection | ReplayKit |
| **Hardware Codec (Encode)**| NVENC / QSV / AMF | VA-API / NVENC | VA-API | VideoToolbox | MediaCodec | VideoToolbox |
| **Input Injection** | `SendInput` API | XTest API | `uinput` / RemotePortal | `CGEventPost` | Accessibility | N/A (Client Only) |
| **Audio Loopback Capture** | WASAPI Loopback | PulseAudio / ALSA| PipeWire Monitor | CoreAudio Tap | AudioPlaybackCapture | ReplayKit Audio |
| **UAC / Root Elevation** | Windows Service | `pkexec` / systemd| `pkexec` / systemd | `launchd` Helper | N/A | N/A |
| **Privacy Mode (Blanking)**| Didukung Penuh | Didukung Parsial | Terbatas Compositor | Didukung | N/A | N/A |
| **Bi-directional Clipboard**| Teks & File | Teks & File | Teks Saja | Teks & File | Teks Saja | Teks Saja |
| **Background Daemon** | Windows Service | systemd daemon | systemd daemon | `launchd` daemon | Android Service | Background Audio |

---

## 2. Karakteristik & Penanganan Khusus Per Platform

### A. Windows (Primary Enterprise Platform)
- **Screen Capture:** Menggunakan DirectX 11 DXGI Output Duplication. Menghasilkan throughput zero-copy langsung dari VRAM ke encoder hardware jika GPU mendukung (`scrap/vram`). Fallback ke GDI jika driver DirectX tidak merespons.
- **Session 0 & UAC Elevation:** Dikelola oleh `src/service.rs` yang berjalan sebagai `NT AUTHORITY\SYSTEM`. Menggunakan token impersonation untuk berpindah konteks antara desktop pengguna aktif dan Secure Desktop.
- **Audio Capture:** Menggunakan WASAPI Loopback Client pada default audio rendering endpoint.

### B. Linux (X11 & Wayland Dual Stack)
- **X11:** Menggunakan ekstensi XDamage untuk mendeteksi perubahan area persegi panjang dan XShm untuk transfer memori bersama.
- **Wayland:** Menghormati arsitektur keamanan modern Wayland dengan menggunakan Freedesktop Desktop Portal (`xdg-desktop-portal`) dan streaming frame DMA-BUF via PipeWire.
- **Input Injection:** Menggunakan `/dev/uinput` pada Wayland jika privilege mengizinkan, atau fallback ke simulasi XTest pada sesi X11.

### C. macOS (Apple Silicon & Intel)
- **ScreenCaptureKit:** Diimplementasikan untuk macOS 12.3+ dengan efisiensi konsumsi daya tinggi dan latensi rendah.
- **Izin Sistem:** Memerlukan otorisasi pengguna eksplisit di *System Settings -> Privacy & Security -> Screen Recording* dan *Accessibility*.
- **Retina Display Scaling:** Penyesuaian koordinat kursor mouse berdasarkan faktor skala DPI layar Retina (2.0x).

### D. Mobile Clients (Android & iOS)
- **Virtual Input:** Emulasi trackpad virtual pada layar sentuh, gesture double-tap, right-click dua jari, dan pinch zoom.
- **Manajemen Daya:** Menjaga *Wakelock* (`wakelock_plus`) agar layar ponsel tidak terkunci saat memantau sesi remote yang sedang berlangsung.
