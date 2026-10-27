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

### 2.3 AI Predictive Latency & Mouse Smoothing
- **Lokasi Sumber**: [`libs/base/src/predictive_mouse.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/base/src/predictive_mouse.rs)
- **Fungsi**: Algoritma smoothing adaptif berbasis Kalman dan ekstrapolasi kecepatan kursor untuk memitigasi jitter dan latensi transmisi jaringan.
- **Kemampuan**:
  - Ekstrapolasi arah gerak kursor ke depan sesuai jendela latensi RTT aktif.
  - Adaptasi bobot smoothing otomatis (presisi tinggi pada kecepatan rendah, ultra-responsif pada gerakan cepat).
  - *Overshoot snap prevention* saat terjadi pembalikan arah gerak mouse secara tiba-tiba.


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

### 4.4 Telegram Bot Integration & Remote 2FA Approval
- **Lokasi Sumber**: [`src/auth_2fa.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/auth_2fa.rs), [`flutter/lib/desktop/pages/desktop_setting_page.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/pages/desktop_setting_page.dart)
- **Fungsi**: Asisten cerdas Telegram untuk approval permintaan koneksi masuk, auto-dispatch password sementara, dan remote management (`/pass`, `/status`, `/specs`, `/refresh`).
- **Mekanisme**: Long polling Telegram API dengan verifikasi callback token `approve:<id>` dan `reject:<id>`.

### 4.5 Enterprise Audit Trail & Compliance Logging
- **Lokasi Sumber**: [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py), [`flutter/lib/desktop/widgets/audit_log_dialog.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/audit_log_dialog.dart)
- **Fungsi**: Pencatatan riwayat sesi remote, persetujuan otentikasi Telegram, alamat IP remote peer, durasi koneksi, dan ekspor data audit berformat CSV.

---

## 5. Networking & Tunneling

### 5.1 NAT Traversal & Encrypted Relay Fallback
- **Lokasi Sumber**: [`src/rendezvous_mediator.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/rendezvous_mediator.rs), [`libs/hbb_common/src/socket_client.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/libs/hbb_common/src/socket_client.rs)
- **Fungsi**: Membuka jalur komunikasi langsung UDP P2P melalui hole punching, dengan fallback ke relay server `hbbr`.

### 5.2 TCP Port Forwarding (Encrypted Tunnels)
- **Lokasi Sumber**: [`src/server/connection.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/connection.rs), [`src/server/port_forward_mux.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/server/port_forward_mux.rs)
- **Fungsi**: Meneruskan port layanan lokal (misal: port 8080, port 22) di mesin host ke port lokal klien melalui tunnel terenkripsi.

### 5.3 AI Session Copilot & Live Network Diagnostics
- **Lokasi Sumber**: [`flutter/lib/desktop/widgets/diagnostics_dialog.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/diagnostics_dialog.dart)
- **Fungsi**: Pengukuran latensi socket RTT secara real-time ke Rendezvous server, pengecekan API Gateway, penilaian mutu jaringan (Grade A+ s/d D), dan rekomendasi pintar AI Copilot untuk optimasi bitrate/FPS.

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

### 6.4 Host System Health & Quick Hardware Specs
- **Lokasi Sumber**: [`flutter/lib/desktop/widgets/system_info_dialog.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/system_info_dialog.dart), [`flutter/lib/desktop/pages/desktop_home_page.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/pages/desktop_home_page.dart)
- **Fungsi**: Dialog cepat 1-klik untuk memeriksa spesifikasi perangkat keras, sistem operasi, Remote ID, konfigurasi server aktif, dan menyalin ringkasan sistem ke clipboard.

### 6.5 Interactive On-Screen Whiteboard (Pena & Anotasi Layar)
- **Lokasi Sumber**: [`flutter/lib/desktop/widgets/whiteboard_overlay.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/whiteboard_overlay.dart)
- **Fungsi**: Lapisan kanvas interaktif di atas layar remote session untuk menggambar anotasi panduan secara langsung (pena neon, highlighter, panah penunjuk, undo, clear).

### 6.6 Modern Floating Session HUD Bar
- **Lokasi Sumber**: [`flutter/lib/desktop/widgets/session_hud_bar.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/session_hud_bar.dart)
- **Fungsi**: Floating toolbar bergaya glassmorphism menampilkan metrik real-time (latensi ms, FPS) dan tombol aksi cepat 1-klik (`Ctrl+Alt+Del`, Whiteboard, System Drawer).

### 6.7 Seamless Drag-and-Drop Direct File Transfer
- **Lokasi Sumber**: [`flutter/lib/desktop/pages/remote_page.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/pages/remote_page.dart)
- **Fungsi**: Pengiriman berkas instan dengan menyeret berkas dari desktop lokal langsung ke atas kanvas remote desktop dengan visual drop-zone.

### 6.8 Remote System Diagnostics Drawer
- **Lokasi Sumber**: [`flutter/lib/desktop/widgets/remote_system_drawer.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/remote_system_drawer.dart)
- **Fungsi**: Panel samping geser yang menampilkan spesifikasi perangkat target, performa streaming, verifikasi cipher E2EE, dan tombol ekspor laporan diagnostik IT.

### 6.9 Modern Host Command Center & Pair Device Dashboard (9Remote Parity)
- **Lokasi Sumber**: [`flutter/lib/desktop/widgets/audira_modern_host_dashboard.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/audira_modern_host_dashboard.dart), [`flutter/lib/desktop/pages/desktop_home_page.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/pages/desktop_home_page.dart)
- **Fungsi**: Redesain radikal antarmuka utama desktop klien mengadopsi arsitektur 3-panel modern, minimalis, dan futuristik:
  - **Panel Kiri**: Sidebar ramping gelap (`AudiraDesk CORE`, navigasi `Pair Device`, host status `LOCAL 🟢 online`, tombol `+ Add workspace`, dan akses cepat *Settings*).
  - **Panel Tengah (Pairing Hub)**: Kartu QR Code putih kontras tinggi dengan rounded corner untuk scan instan via mobile/web, *One-Time Key* dengan indikator countdown expired dan tombol refresh `⟳`, *Permanent Key/ID* dengan 1-klik copy, serta status pill `🟢 healthy • rtc direct active`.
  - **Panel Kanan (Command & Management)**:
    - `CONNECT FROM`: Grid 4 kartu platform (iPhone/iPad, Android, PC/Mac, Web Console) untuk panduan download & akses multi-device.
    - `SERVICES`: Toggle Remote Desktop dengan badge status izin (`✔ Screen Capture DXGI`, `✔ UAC Elevated`).
    - `CLIENTS`: Toggle *Auto-approve new devices* dan manajemen sesi remote yang terhubung.
    - `CONTROL REMOTE DESKTOP`: Form input remote ID dengan tombol aksi cepat *Connect*, *File Transfer*, dan *PTY Terminal*.
  - **Dukungan Dual-View**: Kemudahan beralih seketika antara *Modern Dashboard* dan *Classic Peer Table View* tanpa gangguan koneksi aktif.

---

## 7. Web Portal, WebRTC HTML5 Client & Fleet Automation

### 7.1 WebRTC HTML5 Web Client Viewer
- **Lokasi Sumber**: [`web/viewer.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/viewer.html), [`web/index.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/index.html), [`web/js/app.js`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/js/app.js)
- **Fungsi**: Pengendalian remote desktop interaktif langsung dari peramban web modern tanpa instalasi file executable klien (.exe).
- **Kemampuan**:
  - Tampilan kanvas ultra-low latency dengan dukungan Auto-Fit dan 1:1 view modes.
  - Floating Session HUD menampilkan live RTT latency (ms), framerate (FPS), bitrate, dan resolusi.
  - Injeksi interaksi mouse, keyboard, pintasan sistem `Ctrl+Alt+Del`, `Win+L`, dan layar penuh (`F11`).
  - Terminal CLI drawer terintegrasi untuk diagnostik berdampingan dengan layar remote.

### 7.2 Remote Headless Terminal / CLI Console
- **Lokasi Sumber**: [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py), [`web/admin.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/admin.html), [`web/js/admin.js`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/js/admin.js)
- **Fungsi**: Eksekusi perintah command line interaktif (PowerShell, CMD, Bash) pada host tanpa beban kompresi frame video.
- **Kemampuan**:
  - Presets diagnostik 1-klik: `systeminfo`, `Get-Process`, `ipconfig /all`, `netstat -ano`, `Get-PSDrive`, `sc query`.
  - Riwayat perintah console (Up/Down arrow navigation) dan pemfilteran hasil stdout/stderr berwarna.
  - Pencatatan tamper-evident audit log untuk kepatuhan regulasi IT enterprise.

### 7.3 Wake-on-LAN (WoL) Relay Protocol
- **Lokasi Sumber**: [`src/common.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/common.rs), [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py), [`web/admin.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/admin.html)
- **Fungsi**: Membangunkan perangkat komputer host yang sedang tidur (Sleep) atau mati (Shutdown) melalui jaringan lokal via Magic Packet UDP port 9.
- **Kemampuan**:
  - Dukungan transmisi dual broadcast (subnet IP spesifik dan `255.255.255.255:9`).
  - Integrasi 1-klik tombol "Wake" pada tabel perangkat offline di Admin Fleet Console.
  - Validasi ketat format MAC address dan audit logging real-time.

### 7.4 Virtual Display Driver & Headless Server Manager
- **Lokasi Sumber**: [`src/virtual_display_manager.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/virtual_display_manager.rs), [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py), [`web/viewer.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/viewer.html)
- **Fungsi**: Pengelolaan layar monitor virtual mandiri untuk host tanpa monitor fisik (headless servers), mencegah layar hitam dan kegagalan sesi remote.
- **Kemampuan**:
  - Resolusi kustom adaptif (1080p, 1440p, 4K UHD, 720p).
  - Pemasangan dan pelepasan monitor virtual dinamis tanpa restart sistem operasi.

---

## 8. AI Vibe Coding & Next-Gen Cloud Workstation Suite

### 8.1 Every Harness · One UI (AI Agent Gateway)
- **Lokasi Sumber**: [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py) (`/api/dev/agent/run`), [`web/viewer.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/viewer.html)
- **Fungsi**: Antarmuka grafis terpadu membungkus AI coding CLI/TUI (Claude Code, OpenAI Codex, Cursor Agent, Aider, Audira Copilot).
- **Kemampuan**:
  - Eliminasi terminal teks kaku menjadi visual timeline langkah kerja (Thinking, File Inspection, Code Synthesis).
  - Side-by-side dan unified diff visual viewer dengan approval 1-klik untuk perubahan kode host.

### 8.2 In-Browser Remote Monaco IDE
- **Lokasi Sumber**: [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py) (`/api/dev/files`, `/api/dev/file/read`, `/api/dev/file/write`), [`web/viewer.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/viewer.html)
- **Fungsi**: Editor kode modern berbasis Monaco Engine (VS Code) yang tersemat langsung di browser tanpa instalasi klien.
- **Kemampuan**:
  - Tree explorer direktori repositori dengan integrasi badge status Git (`M`, `??`).
  - Hotkey `Ctrl+S` untuk auto-save langsung ke sistem file host.
  - Multi-language syntax highlighting (Rust, Dart, JS, TS, Python, HTML, CSS, JSON, Markdown).

### 8.3 Remote Localhost Dev Tunneling Manager
- **Lokasi Sumber**: [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py) (`/api/dev/ports`), [`web/viewer.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/viewer.html)
- **Fungsi**: Deteksi otomatis dan preview instan port server lokal yang sedang berjalan di host (e.g. 3000, 5173, 8080, 5050).
- **Kemampuan**:
  - Active Port Discovery scanner.
  - Viewport switcher responsif (Desktop, iPad/Tablet 768px, Mobile iPhone 390px) untuk testing antarmuka web.

### 8.4 Mobile Emulator Frame & Virtual Touch Bar
- **Lokasi Sumber**: [`web/viewer.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/viewer.html)
- **Fungsi**: Frame bezel smartphone dengan orientasi fleksibel dan dock tombol koding virtual untuk pengguna iPad/tablet.
- **Kemampuan**:
  - Bezel smartphone interaktif dengan tombol navigasi fisik (Back, Home, Recents).
  - Virtual Dev Touch Bar (`Esc`, `Tab`, `Ctrl`, `Alt`, `Shift`, `{}`, `[]`, `=>`, `;`) untuk ergonomi layar sentuh.
  - Crisp Text / Coding Mode 60 FPS untuk rendering font kode subpixel tanpa kompresi blur.

---

## 9. 9Remote-Inspired 3-Panel Host Command Center (100% Real Engine)

- **Lokasi Sumber**: [`flutter/lib/desktop/widgets/audira_modern_host_dashboard.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/audira_modern_host_dashboard.dart), [`flutter/lib/desktop/pages/desktop_home_page.dart`](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/pages/desktop_home_page.dart)
- **Fungsi**: Antarmuka 3-panel ultra-modern terinspirasi dari arsitektur 9Remote, menggantikan tampilan desktop kaku dengan command center real-time bebas dari "AI slop" / mock placeholder.
- **Kemampuan Real & Integrasi Backend**:
  1. **Slim Left Navigation Bar (215px)**:
     - Tab Switcher: `Pair Device`, `LOCAL NODE`, `Security & Access`, `Settings`, `System Specs Dialog`.
     - Live Engine Status Indicator: Membaca status real `_svcStopped` dan `stateGlobal.svcStatus` (🟢 P2P Ready, 🟡 Connecting, 🔴 Stopped).
     - Seamless Dual-View Switcher: Beralih ke antarmuka klasik (`Classic View`) dengan persistensi otomatis ke opsi lokal RustDesk (`ui_modern_dashboard`).
  2. **Center Hero Stage (Dynamic Mode)**:
     - **Pair Device Hub**:
       - Dynamic QR Code Generator: Menghasilkan link sesi langsung (`https://desk.audira.my.id/viewer.html?id=...&pw=...`) dan badge portal web.
       - One-Time Key Countdown (5 menit): Terhubung langsung ke `bind.mainUpdateTemporaryPassword()` dan `model.serverPasswd.text`.
       - Permanent Password Management: Deteksi real `permanent-password-set`, memicu dialog `setPasswordDialog()` langsung dari FFI.
       - Engine Service Switcher Pill: Kontrol langsung layanan Windows background (`start_service(true/false)`).
     - **LOCAL Node Diagnostics Panel**:
       - Hostname, OS Kernel, dan Device ID real-time.
       - Subsystem Health: Rendezvous P2P gateway, DirectX DXGI Screen Capture (jumlah monitor aktif), WASAPI Loopback Audio, Enigo Win32 Input Injection.
       - Elevation Privilege Trigger: Pemicu UAC real via `callMainCheckSuperUserPermission()` untuk mendapatkan hak `SYSTEM / Administrator`.
  3. **Right Management Pane (360px)**:
     - Multiplatform Connect Cards: Pintasan unduhan iPhone/iPad, Android, PC/Mac, dan Web viewer.
     - Remote Desktop Service Row: Saklar layanan real terikat dengan tag `stop-service`.
     - Real Live Client Session Manager:
       - Membaca daftar aktif `model.clients` dari engine C++/Rust FFI.
       - Menampilkan nama perangkat klien, ID peer, dan mode koneksi (Screen, Files, Terminal).
       - Kontrol sesi real-time: Tombol `Accept` / `Dismiss` untuk izin manual dan tombol `Disconnect` yang mengeksekusi `bind.cmCloseConnection(connId)`.
     - Quick Remote Desktop Control: Textbox otomatis memuat ID remote terakhir (`bind.mainGetLastRemoteId()`) dengan tombol koneksi Screen, File Transfer, dan PTY Terminal.
