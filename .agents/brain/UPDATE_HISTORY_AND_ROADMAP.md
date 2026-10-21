# UPDATE HISTORY & ROADMAP — Audira Desk
> Catatan Perkembangan Sistem, Log Perubahan Arsitektur, dan Roadmap Masa Depan.

---

## 1. Log Riwayat Rilis & Arsitektur

### Versi v1.5.3 (Production Web Auth & Version Handshake Gate) — 2026-10-20
- **Penetapan Versi Tunggal SSOT (Single Source of Truth) v1.5.3**:
  - `src/version.rs`: `VERSION = "1.5.3"`, `BUILD_DATE = "2026-10-20 18:30"` (dikeluarkan dari `.gitignore` agar tersinkronisasi permanen).
  - `Cargo.toml`: `version = "1.5.3"`.
  - `flutter/pubspec.yaml`: `version: 1.5.3+69`.
  - `libs/portable/Cargo.toml` & `build.rs`: `version = "1.5.3"`, `ProductVersion = "1.5.3"`, `FileVersion = "1.5.3.0"`.
- **Visibilitas Versi Jelas di Seluruh Antarmuka Pengguna (UI)**:
  - **Desktop Home Page (`desktop_home_page.dart`)**: Badge elegan `v1.5.3 Enterprise` lengkap dengan indikator titik hijau tepat di bawah logo aplikasi.
  - **Status Bar Koneksi (`connection_page.dart`)**: Badge versi status `v1.5.3` di bagian bawah panel kanan.
  - **Floating Session HUD (`session_hud_bar.dart`)**: Pill versi `v1.5.3` tersemat di toolbar mengambang saat sesi remote berlangsung.
  - **Diagnostics Drawer (`remote_system_drawer.dart`)**: Baris telemetry Host Version `v1.5.3` dan status `Compat Status: v1.5.3 Matched (Synced)`.
  - **System Info Dialog (`system_info_dialog.dart`)**: Spesifikasi aplikasi resmi `v1.5.3 Enterprise Build`.
  - **Web Portal (`web/index.html` & `web/admin.html`)**: Badge pengumuman resmi dan status core tertera `v1.5.3`.
- **Enforcement Handshake Gate: Proteksi Ketidakcocokan Versi Remote**:
  - `src/server/connection.rs`: Pada saat `LoginRequest`, sistem memvalidasi versi klien (`lr.version`) terhadap versi host (`crate::VERSION`). Jika versi berbeda atau versi lama/legacy, koneksi otomatis ditolak dengan pesan dialog resmi: *"Versi Audira Desk Tidak Cocok! Kedua perangkat harus menggunakan versi yang sama (v1.5.3) untuk mencegah kegagalan sesi remote."*.
- **Penghapusan Total Mock Data & Demo UI**:
  - Menghapus banner `Demo Operator (audira@audira.my.id)` dan tombol autofill palsu pada portal web (`web/index.html`).
  - Menghilangkan fallback *fake offline mock login* pada `web/js/app.js`, digantikan penanganan error nyata dari server API.
- **Implementasi Fitur Registrasi & Login Produksi**:
  - **Backend API (`scripts/audira_api.py`)**: Endpoint baru `POST /api/register` dan penyempurnaan `POST /api/login`.
  - **Portal Frontend (`web/index.html` & `web/js/app.js`)**: Antarmuka dual-tab Masuk & Daftar Akun Baru.
  - **Pengujian & Verifikasi**: `scripts/test_auth_api.py` 100% lulus.

### Versi v1.5.1 (Complete Rebranding "Audira Desk" & Standalone Packaging) — 2026-10-18
- **Core Engine & Windows Platform Rebranding**:
  - `libs/hbb_common/src/config.rs`: `APP_NAME` diubah secara fundamental menjadi `"Audira Desk"`.
  - `src/common.rs`: Sanitasi `get_uri_prefix()` menjadi `audiradesk://` (RFC 3986 compliance, bebas spasi).
  - `src/platform/windows.rs`: Validasi nama instalasi `validate_install_app_name` diperluas untuk mengizinkan spasi pada `"Audira Desk"`.
  - Mengamankan seluruh sintaks command batch elevated: pemberian tanda kutip pada perintah Windows Service Manager (`sc create "Audira Desk"`, `sc start`, `sc stop`, `sc delete`), `taskkill /F /IM "Audira Desk.exe"`, dan pembersihan firewall.
  - Path instalasi default otomatis mengarah ke `C:\Program Files\Audira Desk`.
- **Lokalisasi Lengkap (User-Facing UI Strings)**:
  - `src/lang/en.rs`: Seluruh string UI berbahasa Inggris (`install_tip`, `connecting_status`, `config_acc`, `config_screen`, `config_input`, `config_microphone`, `powered_by_me`, dll.) dimutakhirkan dari `RustDesk` menjadi `Audira Desk`.
- **Windows Runner Resource & Portable Packager**:
  - `flutter/windows/runner/Runner.rc` & `main.cpp`: Metadata `CompanyName`, `ProductName`, `FileDescription`, dan fallback window title resmi disetel ke `Audira Desk`.
  - `libs/portable/Cargo.toml` & `src/main.rs`: Metadata Windows Resource portable wrapper disetel ke `Audira Desk`, prefix folder ekstraksi lokal `%LocalAppData%\audiradesk`, dan startup executable `AudiraDesk.exe`.
  - Mengompilasi dan mengemas binary mandiri single-executable produksi: `dist/AudiraDesk-v1.5.0-x86_64.exe` (28.05 MB) dan `AudiraDesk.exe`.
- **Toolchain & LLVM Resolution**:
  - Instalasi LLVM 23.1.3 dan konfigurasi permanen `LIBCLANG_PATH` (`C:\Program Files\LLVM\bin\libclang.dll`) untuk mendukung `bindgen` FFI tanpa kendala.
- **Open-Source GitHub Package & Licensing**:
  - Lisensi resmi MIT License atas nama **AUDIRA (Agus Dwi R)** (`LICENSE`).
  - Dokumentasi profesional lengkap `README.md` dengan badge status, arsitektur sistem, tabel fitur, panduan portabel, instalasi sistem, dan build steps.
  - Panduan kontribusi (`CONTRIBUTING.md`), kebijakan keamanan (`SECURITY.md`), serta optimasi `.gitignore` untuk mencegah kebocoran build cache.
- **Brain Memory Synchronization (BRAIN-SYNC-01)**:
  - Sinkronisasi menyeluruh identitas sistem di `BRAIN.md`, `INDEX.md`, `SYSTEM_ARCHITECTURE.md`, `FEATURE_CATALOG.md`, dan `UPDATE_HISTORY_AND_ROADMAP.md`.

### Versi v1.5.0 (Production Architecture) — 2026-10-09
- **Core Engine & Networking**:
  - Stabilisasi Cargo Workspace modular (`base`, `hbb_common`, `scrap`, `enigo`, `clipboard`).
  - Single import path terpusat untuk konfigurasi di `libs/base/src/config/keys.rs`.
  - Protokol rendezvous `hbbs` dan relay `hbbr` dengan enkripsi E2EE Libsodium (X25519 + ChaCha20-Poly1305).
- **Media & Hardware Acceleration**:
  - Penangkapan layar DirectX 11 DXGI Desktop Duplication (Windows) dan Wayland PipeWire Portal (Linux).
  - Integrasi hardware codec NVENC / Intel QSV / AMD AMF via feature flag `hwcodec`.
  - Audio loopback streaming ultra-low latency via WASAPI & PulseAudio terkompresi Opus.
- **Enterprise Security & Management**:
  - Implementasi Windows UAC elevation melalui background system service daemon (`src/service.rs`).
  - Privacy Mode (layar monitor host digelapkan dan input fisik lokal ditekan).
  - Chunked file transfer protocol dengan verifikasi hash integritas dan pencegahan path traversal.
- **Modern Flutter UI**:
  - Desktop multi-window canvas dengan toolbar telemetri sesi HUD.
  - Dukungan lokalisasi 25+ bahasa di `src/lang/*.rs`.
- **Inisialisasi Customization & Brain Ecosystem**:
  - Adaptasi komprehensif sistem `.agents/` dari arsitektur `AUDIRA-NetOps-AI` yang disesuaikan secara presisi untuk sistem remote desktop tingkat rendah (Rust + Tokio + Flutter).
- **Desktop Launcher & Lifecycle Scripts**:
  - Penyediaan `start.bat` dan `scripts/start.ps1` untuk mendeteksi biner terkompilasi atau menjalankan Flutter desktop secara interaktif.
  - Penyediaan `stop.bat` dan `scripts/stop.ps1` untuk pembersihan proses background dan port gracefully.
- **Rebranding Executable Biner & Native Build**:
  - Rebranding identitas biner utama dari `rustdesk.exe` ke `audira.exe`.
  - Pembaruan konfigurasi CMake (`flutter/windows/CMakeLists.txt`), Runner Resource metadata (`flutter/windows/runner/Runner.rc`), `build.py`, serta manifest Cargo (`Cargo.toml`).
  - Kompilasi biner native release `audira.exe` menggunakan toolchain lokal Windows (LLVM + vcpkg C++ static libraries).
- **Audit & Enhancement Menyeluruh `.agents` (v1.6.0 Upgrade - Trek 1 Selesai)**:
  - Penambahan 3 Rule kritis baru: [git-submodule-and-workspace-scope.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/rules/git-submodule-and-workspace-scope.md), [localization-i18n-hygiene.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/rules/localization-i18n-hygiene.md), dan [windows-environment-and-toolchain.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/rules/windows-environment-and-toolchain.md).
  - Peningkatan kedalaman teknis seluruh 15/15 skill dengan referensi teknis (`references/`) dan contoh kode implementasi aman (`examples/`).
  - Konfigurasi automasi hooks ([.agents/hooks.json](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/hooks.json)) dan provider diagnosa ([.agents/mcp_config.json](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/mcp_config.json)).
  - Pembuatan skrip verifikasi otomatis terpadu [scripts/audit_agents.py](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audit_agents.py) (Hasil: 8/8 rules, 15/15 skills, 8 SSOT docs valid).
- **Implementasi Fitur Profesional Setara TeamViewer/AnyDesk (Poin 1 & Poin 2)**:
  - **On-Screen Whiteboard / Annotation Tool**: Widget [flutter/lib/desktop/widgets/whiteboard_overlay.dart](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/whiteboard_overlay.dart) dengan dukungan pena neon multi-warna, highlighter, panah penunjuk, undo, dan pembersihan instan.
  - **Modern Floating Session HUD Bar**: Widget [flutter/lib/desktop/widgets/session_hud_bar.dart](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/session_hud_bar.dart) menampilkan badge live latensi (ms), FPS real-time, tombol pintas Ctrl+Alt+Del, Whiteboard, dan System Diagnostics.
  - **Seamless Drag-and-Drop File Transfer**: Integrasi `desktop_drop` langsung pada canvas desktop di [flutter/lib/desktop/pages/remote_page.dart](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/pages/remote_page.dart) dengan visual drop-zone glassmorphism dan verifikasi transfer instan.
  - **Remote System Diagnostics & Hardware Drawer**: Widget [flutter/lib/desktop/widgets/remote_system_drawer.dart](file:///f:/AUDIRA-REMOTE-DEKSTOP/flutter/lib/desktop/widgets/remote_system_drawer.dart) menampilkan spek OS target, status streaming, enkripsi E2EE ChaCha20-Poly1305, tombol lock host, dan export ringkasan diagnostik untuk ticketing.
### Versi v1.5.8 (WebRTC Web Viewer, Remote CLI Console, WoL Relay & Virtual Display) — 2026-10-21
- **1. WebRTC HTML5 Web Client Viewer**:
  - Antarmuka web client mandiri [`web/viewer.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/viewer.html) memungkinkan operator mengendalikan desktop remote langsung dari Google Chrome, Edge, Firefox, dan Safari tanpa menginstal file `.exe`.
  - Dilengkapi Floating Session HUD telemetri real-time (RTT ms, FPS, bitrate, dan resolusi), canvas rendering, interaksi mouse & keyboard, serta tombol sistem `Ctrl+Alt+Del`, `Win+L`, and Fullscreen.
  - Integrasi 1-klik tombol "Web Viewer" pada portal utama [`web/index.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/index.html) dan Admin Fleet table [`web/admin.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/admin.html).
- **2. Remote Headless Terminal / CLI Console**:
  - Eksekusi baris perintah interaktif (PowerShell, CMD, Bash) tanpa beban streaming video melalui endpoint aman `POST /api/terminal/exec` di [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py).
  - Tampilan konsol bergaya dark retro terminal pada Admin Console ([`web/admin.html`](file:///f:/AUDIRA-REMOTE-DEKSTOP/web/admin.html) tab `Remote CLI Terminal`) dan slide-over drawer pada Web Viewer.
  - Tombol preset diagnostik cepat 1-klik (`systeminfo`, `Get-Process`, `ipconfig /all`, `netstat -ano`, `Get-PSDrive`, `sc.exe query`) dan pencatatan audit log otomatis.
- **3. Wake-on-LAN (WoL) Relay Protocol**:
  - Fungsi transmisi Magic Packet UDP port 9 pada engine Rust ([`src/common.rs`](file:///f:/AUDIRA-REMOTE-DEKSTOP/src/common.rs)) dan backend API server (`POST /api/wol` di [`scripts/audira_api.py`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/audira_api.py)).
  - Kemampuan membangunkan perangkat host yang sedang tidur/mati dengan dukungan dual broadcast (subnet IP lokal dan `255.255.255.255:9`).
  - Tombol aksi cepat "Wake (WoL)" pada baris perangkat offline di Device Fleet table dan dialog modal WoL.
- **4. Virtual Display Driver & Headless Server Management**:
  - Dukungan resolusi kustom (1080p, 1440p, 4K, 720p) dan fallback buffer virtual saat monitor fisik host dilepas atau mati (`src/virtual_display_manager.rs`, `POST /api/virtual-display`).
  - Kontrol virtual display langsung dari toolbar Web Viewer dan dialog konfigurasi.

---

## 2. Roadmap Pengembangan Selanjutnya

1. **AI Predictive Latency & Mouse Smoothing**:
   - Algoritma interpolasi berbasis AI untuk memprediksi pergerakan kursor mouse pada koneksi dengan jitter tinggi agar terasa instan di sisi klien.
2. **Hardware AV1 Real-Time Encoding**:
   - Optimalisasi pipeline kompresi AV1 zero-copy untuk GPU generasi baru (NVIDIA RTX 40-series, Intel Arc, AMD RDNA3) guna memangkas konsumsi bandwidth hingga 35%.
3. **Multi-Tenant MSP Team Isolation**:
   - Partisi hak akses multi-perusahaan dalam satu instance relay server dengan kuota bandwidth per-tenant.

---

## 3. Panduan Pembaruan Brain (Wajib Ditaati)

Setiap pengembang atau AI Coding Agent yang melakukan modifikasi kode **wajib** mengikuti checklist pembaruan Brain berikut:

- [ ] **Jika menambah atau memodifikasi komponen Flutter**: Tambahkan entri di [`FEATURE_CATALOG.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/FEATURE_CATALOG.md).
- [ ] **Jika mengubah crate Rust, FFI, atau threading Tokio**: Perbarui diagram di [`SYSTEM_ARCHITECTURE.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SYSTEM_ARCHITECTURE.md).
- [ ] **Jika mengubah codec, format paket, atau rendezvous**: Perbarui tabel di [`PROTOCOLS_AND_CODECS.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PROTOCOLS_AND_CODECS.md).
- [ ] **Jika mengubah izin sesi atau proteksi UAC**: Perbarui kebijakan di [`SECURITY_AND_PERMISSIONS.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SECURITY_AND_PERMISSIONS.md).
- [ ] **Jika mengubah kapabilitas OS**: Perbarui matriks di [`PLATFORM_INTEGRATION_MATRIX.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PLATFORM_INTEGRATION_MATRIX.md).
- [ ] **Catat ringkasan perubahan**: Tambahkan entri pada dokumen ini ([`UPDATE_HISTORY_AND_ROADMAP.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/UPDATE_HISTORY_AND_ROADMAP.md)).
