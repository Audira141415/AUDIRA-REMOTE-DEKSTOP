# FEATURE CATALOG — Audira Desk
> Katalog Lengkap Fitur Enterprise Remote Access, Lokasi Kode Sumber, Sub-Protokol, dan Cara Kerja.

---

## 1. Remote Desktop Streaming & Media Engine

### 1.1 Real-Time Display Streaming
- **Lokasi Sumber**: [`libs/scrap/`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/scrap), [`src/server/video_service.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/video_service.rs)
- **Fungsi**: Penangkapan layar desktop berkecepatan tinggi dengan latensi sub-frame.
- **Kemampuan**:
  - Dukungan DXGI Desktop Duplication API (DirectX 11) pada Windows.
  - Wayland PipeWire Portal & X11 XShm pada Linux.
  - Negosiasi dinamis antara codec AV1, VP9, VP8, dan H.264/H.265.
  - Multi-Monitor Switcher: Beralih antar monitor fisik host secara instan atau melihat seluruh layar sekaligus.

### 1.2 System Audio Loopback Streaming
- **Lokasi Sumber**: [`src/server/audio_service.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/audio_service.rs)
- **Fungsi**: Menangkap output suara komputer host dan mengalirkannya ke klien.
- **Kemampuan**:
  - Penangkapan audio loopback WASAPI pada Windows dan PulseAudio pada Linux.
  - Kompresi Opus ultra-low delay dengan buffer adaptif 20–40ms.

---

## 2. Remote Input & Clipboard Engine

### 2.1 Hardware-Level Input Injection
- **Lokasi Sumber**: [`libs/enigo/`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/enigo), [`src/server/input_service.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/input_service.rs)
- **Fungsi**: Simulasi interaksi mouse dan keyboard pengguna pada sistem operasi target.
- **Kemampuan**:
  - Konversi koordinat normal (0.0 – 1.0) ke piksel fisik multi-monitor.
  - Injeksi tombol sistem khusus: `Ctrl+Alt+Del`, `Win+L`, `Alt+Tab`.
  - Dukungan scancode native untuk tata letak keyboard non-US/internasional.

### 2.2 Bi-Directional Clipboard Synchronization
- **Lokasi Sumber**: [`libs/clipboard/`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/clipboard), [`src/server/clipboard_service.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/clipboard_service.rs)
- **Fungsi**: Sinkronisasi clipboard otomatis teks dan berkas antara klien dan host.
- **Kemampuan**:
  - Deteksi event perubahan clipboard tanpa polling CPU tinggi.
  - Proteksi privasi: Dapat dinonaktifkan secara sepihak oleh host melalui permission gates.

---

## 3. File Transfer & Sistem Berkas

### 3.1 Dual-Pane File Manager
- **Lokasi Sumber**: [`libs/base/src/fs.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/base/src/fs.rs), [`flutter/lib/desktop/pages/file_manager_page.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/pages/file_manager_page.dart)
- **Fungsi**: Jendela transfer file khusus yang terpisah dari sesi kontrol tampilan.
- **Kemampuan**:
  - Navigasi direktori lokal dan remote secara berdampingan (*split-panel*).
  - Transfer streaming berbasis chunk dengan SHA-256 integrity verification.
  - Resume transfer berkas terputus tanpa perlu mengulang dari awal.
  - Perlindungan path traversal untuk mencegah akses di luar direktori yang diizinkan.

---

## 4. Keamanan & Tata Kelola Sesi

### 4.1 Granular Permission Gates & Consent Window
- **Lokasi Sumber**: [`libs/base/src/config/keys.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/base/src/config/keys.rs), [`src/server/service.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/service.rs)
- **Fungsi**: Kontrol hak akses yang dapat diatur oleh host sebelum atau selama sesi berlangsung.
- **Toggles**: View-only, Mouse/Keyboard, File Transfer, Clipboard Sync, Audio, TCP Tunneling.

### 4.2 Windows UAC Privilege Elevation
- **Lokasi Sumber**: [`src/service.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/service.rs), [`src/platform/windows.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/platform/windows.rs)
- **Fungsi**: Memungkinkan operator berinteraksi dengan dialog Administrator Windows dan Secure Desktop.
- **Mekanisme**: Komunikasi RPC lokal antara aplikasi GUI klien dan background elevated service (`NT AUTHORITY\SYSTEM`).

### 4.3 Privacy Mode (Host Screen Blanking)
- **Lokasi Sumber**: [`src/platform/windows.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/platform/windows.rs)
- **Fungsi**: Menggelapkan layar monitor fisik host dan mengunci input fisik lokal untuk kerahasiaan saat sesi berlangsung.

---

## 5. Networking & Tunneling

### 5.1 NAT Traversal & Encrypted Relay Fallback
- **Lokasi Sumber**: [`src/rendezvous_mediator.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/rendezvous_mediator.rs), [`libs/hbb_common/src/socket_client.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/hbb_common/src/socket_client.rs)
- **Fungsi**: Membuka jalur komunikasi langsung UDP P2P melalui hole punching, dengan fallback ke relay server `hbbr`.

### 5.2 TCP Port Forwarding (Encrypted Tunnels)
- **Lokasi Sumber**: [`src/server/connection.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/connection.rs), [`src/server/port_forward_mux.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/port_forward_mux.rs)
- **Fungsi**: Meneruskan port layanan lokal (misal: port 8080, port 22) di mesin host ke port lokal klien melalui tunnel terenkripsi.

---

## 6. Antarmuka Pengguna & Manajemen Perangkat (Flutter)

### 6.1 Multi-Window Desktop Workspace
- **Lokasi Sumber**: [`flutter/lib/desktop/`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/)
- **Fungsi**: Membuka jendela independen untuk setiap sesi remote aktif menggunakan `desktop_multi_window`.

### 6.2 Address Book & Riwayat Sesi
- **Lokasi Sumber**: [`flutter/lib/common/widgets/address_book.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/common/widgets/address_book.dart)
- **Fungsi**: Menyimpan daftar ID perangkat tujuan, memberi tag, menyimpan password terenkripsi, dan mengecek status online peer.

### 6.3 Lokalisasi Multi-Bahasa
- **Lokasi Sumber**: [`src/lang/`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/lang/)
- **Fungsi**: Mendukung 25+ bahasa dunia dengan template master di `src/lang/template.rs`.
