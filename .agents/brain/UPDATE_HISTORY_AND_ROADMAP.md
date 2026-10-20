# UPDATE HISTORY & ROADMAP — Audira Desk
> Catatan Perkembangan Sistem, Log Perubahan Arsitektur, dan Roadmap Masa Depan.

---

## 1. Log Riwayat Rilis & Arsitektur

### Versi v1.5.3 (Production Web Auth & Account Registration Engine) — 2026-10-20
- **Penghapusan Total Mock Data & Demo UI**:
  - Menghapus banner `Demo Operator (audira@audira.my.id)` dan tombol autofill palsu pada portal web (`web/index.html`).
  - Menghilangkan fallback *fake offline mock login* pada `web/js/app.js`, digantikan penanganan error nyata dari server API.
- **Implementasi Fitur Registrasi & Login Produksi**:
  - **Backend API (`scripts/audira_api.py`)**:
    - Endpoint baru `POST /api/register`: Validasi username unik (min 3 karakter, alfanumerik), validasi format email, validasi password (min 6 karakter), penyimpanan aman tersinkronisasi (`ACCOUNTS_LOCK`) ke `accounts.json`, pencatatan audit log `USER_REGISTER`, dan penerbitan token sesi UUID nyata.
    - Pembaruan `POST /api/login`: Mendukung login dengan username atau email, verifikasi kata sandi ketat (menolak sandi salah dengan 401 dan akun tidak ada dengan 400), pencatatan audit log `LOGIN_SUCCESS` dan `LOGIN_FAILED`.
  - **Portal Frontend (`web/index.html` & `web/js/app.js`)**:
    - Antarmuka dual-tab: **Masuk** dan **Daftar Akun Baru** dengan navigasi instan antar tab.
    - Form registrasi lengkap: Username, Nama Lengkap (Display Name), Email, Password, dan Konfirmasi Password.
    - Fungsi `handleAdminRegister()` dan `handleAdminLogin()` dengan validasi real-time dan notifikasi toast profesional.
  - **Pengujian & Verifikasi**:
    - Dibuat dan dijalankan script tes otomasi `scripts/test_auth_api.py` yang memvalidasi seluruh siklus registrasi, persistensi token, pencegahan duplikasi, dan audit log (100% lulus).

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
  - Verifikasi kode `flutter analyze` lulus 100% tanpa error.



---

## 2. Roadmap Pengembangan Selanjutnya

1. **AI Predictive Latency & Mouse Smoothing**:
   - Algoritma interpolasi berbasis AI untuk memprediksi pergerakan kursor mouse pada koneksi dengan jitter tinggi agar terasa instan di sisi klien.
2. **WebRTC Web Client Viewer**:
   - Kemampuan bagi operator untuk mengendalikan remote desktop langsung dari browser web modern (Chrome/Edge/Firefox) tanpa instalasi aplikasi klien lokal.
3. **Hardware AV1 Real-Time Encoding**:
   - Optimalisasi pipeline kompresi AV1 zero-copy untuk GPU generasi baru (NVIDIA RTX 40-series, Intel Arc, AMD RDNA3) guna memangkas konsumsi bandwidth hingga 35%.
4. **Virtual Display Driver Integration**:
   - Driver tampilan virtual headless mandiri untuk Windows dan Linux, memungkinkan resolusi kustom tanpa monitor fisik terpasang di host (*headless server management*).

---

## 3. Panduan Pembaruan Brain (Wajib Ditaati)

Setiap pengembang atau AI Coding Agent yang melakukan modifikasi kode **wajib** mengikuti checklist pembaruan Brain berikut:

- [ ] **Jika menambah atau memodifikasi komponen Flutter**: Tambahkan entri di [`FEATURE_CATALOG.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/FEATURE_CATALOG.md).
- [ ] **Jika mengubah crate Rust, FFI, atau threading Tokio**: Perbarui diagram di [`SYSTEM_ARCHITECTURE.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SYSTEM_ARCHITECTURE.md).
- [ ] **Jika mengubah codec, format paket, atau rendezvous**: Perbarui tabel di [`PROTOCOLS_AND_CODECS.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PROTOCOLS_AND_CODECS.md).
- [ ] **Jika mengubah izin sesi atau proteksi UAC**: Perbarui kebijakan di [`SECURITY_AND_PERMISSIONS.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SECURITY_AND_PERMISSIONS.md).
- [ ] **Jika mengubah kapabilitas OS**: Perbarui matriks di [`PLATFORM_INTEGRATION_MATRIX.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PLATFORM_INTEGRATION_MATRIX.md).
- [ ] **Catat ringkasan perubahan**: Tambahkan entri pada dokumen ini ([`UPDATE_HISTORY_AND_ROADMAP.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/UPDATE_HISTORY_AND_ROADMAP.md)).
