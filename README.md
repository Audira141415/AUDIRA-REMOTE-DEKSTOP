<div align="center">

# 🚀 Audira Desk

### High-Performance, Ultra-Low Latency & End-to-End Encrypted Remote Desktop

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Rust](https://img.shields.io/badge/Rust-1.75%2B-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![Flutter](https://img.shields.io/badge/Flutter-Desktop%20%26%20Mobile-02569B.svg?logo=flutter)](https://flutter.dev/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS%20%7C%20Android-lightgrey.svg)](https://github.com/)
[![Security](https://img.shields.io/badge/Security-E2EE%20(X25519%20%2B%20ChaCha20)-green.svg)](SECURITY.md)
[![Release](https://img.shields.io/badge/Version-v1.5.1-blue.svg)](dist/)

**Audira Desk** adalah solusi remote desktop modern generasi baru yang dirancang untuk kecepatan native, latensi minimal, dan keamanan tingkat enterprise. Dibangun di atas arsitektur asinkron **Rust (Tokio)** dan antarmuka desktop **Flutter**, Audira Desk menghadirkan pengalaman kontrol jarak jauh yang mulus, ringan, dan mandiri tanpa ketergantungan pada layanan pihak ketiga.

[Fitur Utama](#-fitur-utama) • [Struktur Proyek](#-struktur-proyek) • [Panduan Memulai](#-panduan-memulai-cepat) • [Kompilasi Sumber](#-kompilasi-dari-sumber) • [Keamanan](#-keamanan--e2ee) • [Kontribusi](#-kontribusi) • [Lisensi](#-lisensi)

</div>

---

## ✨ Fitur Utama

- 🖥️ **Streaming Desktop 60 FPS Ultra-Low Latency**  
  Penangkapan layar GPU-accelerated menggunakan **DirectX 11 DXGI Desktop Duplication API** (Windows) dan **Wayland PipeWire DMA-BUF / X11 XShm** (Linux) dengan latensi sub-frame.
- 📦 **Binary Standalone Portabel & Ringan (~28 MB)**  
  Dapat langsung dijalankan di PC manapun tanpa instalasi rumit (mirip kepraktisan AnyDesk). Kompresi payload Brotli mandiri yang mengekstrak runtime bersih dan aman.
- 🔐 **End-to-End Encryption (E2EE) Zero-Trust**  
  Pertukaran kunci menggunakan kurva kriptografi **Curve25519 (X25519)** dan cipher simetris terotentikasi **ChaCha20-Poly1305**. Tidak ada pihak ketiga yang dapat mengintip lalu lintas data Anda.
- 🔊 **Loopback Audio Streaming Real-Time**  
  Menangkap audio sistem secara mulus via WASAPI Loopback (Windows) & PulseAudio (Linux) dengan kompresi **Opus** adaptif 20–40ms.
- ⌨️ **Injeksi Input Tingkat Perangkat Keras**  
  Simulasi mouse dan keyboard tingkat rendah (`libs/enigo`) dengan translasi scancode native untuk mendukung tombol sistem (`Ctrl+Alt+Del`, `Win+L`, `Alt+Tab`) dan tata letak internasional.
- 📂 **Dual-Pane Chunked File Manager**  
  Eksplorasi sistem berkas remote dan lokal secara berdampingan. Mendukung resume transfer terputus, verifikasi integritas hash SHA-256 per-chunk, dan proteksi path traversal.
- 🛡️ **Integrasi Windows UAC & Secure Desktop**  
  Dapat mengontrol prompt elevasi hak Administrator Windows (UAC) melalui elevated background service daemon (`NT AUTHORITY\SYSTEM`).
- 🕶️ **Privacy Mode (Layar Gelap & Kunci Input Lokal)**  
  Menggelapkan monitor fisik host dan mengunci mouse/keyboard lokal saat sesi berlangsung untuk menjaga kerahasiaan data di lingkungan kerja terbuka.
- 🌐 **NAT Traversal & Encrypted Relay Fallback**  
  Koneksi P2P langsung via UDP Hole Punching. Jika firewall ketat memblokir P2P, koneksi secara otomatis dialihkan melalui relay terenkripsi (`hbbr`).

---

## 🏛️ Arsitektur Sistem

Audira Desk memisahkan engine pemrosesan berkecepatan tinggi di sisi Rust dengan antarmuka pengguna responsif di sisi Flutter melalui FFI (*Foreign Function Interface*):

```
┌────────────────────────────────────────────────────────┐
│             Audira Desk - Modern Flutter UI            │
│  (Desktop Multi-Window, Session Toolbar, Address Book) │
└───────────────────────────▲────────────────────────────┘
                            │ Flutter-Rust Bridge (FFI)
┌───────────────────────────▼────────────────────────────┐
│                    Rust Core Engine                    │
│  ┌──────────────────────┐      ┌────────────────────┐  │
│  │   Tokio Async Net    │      │  Security / Crypto │  │
│  │ (Rendezvous / Relay) │      │  (X25519 + ChaCha) │  │
│  └──────────┬───────────┘      └─────────┬──────────┘  │
│             │                            │             │
│  ┌──────────▼───────────┐      ┌─────────▼──────────┐  │
│  │   libs/scrap (DXGI)  │      │ libs/enigo (Input) │  │
│  │   Screen Capture     │      │ Event Synthesis    │  │
│  └──────────────────────┘      └────────────────────┘  │
│  ┌──────────────────────┐      ┌────────────────────┐  │
│  │ libs/base (Keys/FS)  │      │ libs/clipboard     │  │
│  │ Transfer & Config    │      │ Bi-Directional     │  │
│  └──────────────────────┘      └────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Struktur Proyek

```text
AUDIRA-REMOTE-DEKSTOP/
├── src/                          # Rust Core Entrypoint & Platform Services
│   ├── main.rs                   # Aplikasi utama desktop / launcher
│   ├── service.rs                # Windows elevated service daemon
│   ├── rendezvous_mediator.rs    # Protokol mediator rendezvous & relay
│   ├── flutter_ffi.rs            # Jembatan komunikasi FFI dengan Flutter
│   ├── platform/windows.rs       # Integrasi Windows (Service, Registry, Firewall, UAC)
│   └── lang/en.rs                # Lokalisasi dan teks UI resmi Audira Desk
├── flutter/                      # Modern Flutter Frontend
│   ├── lib/desktop/              # Jendela remote, pengaturan, dan toolbar
│   ├── lib/models/               # Provider model & bindings FFI
│   └── windows/runner/           # Runner C++ Windows & Runner.rc metadata
├── libs/                         # Modular Workspace Crates
│   ├── base/                     # Client logic, single-import config keys, chunked FS
│   ├── hbb_common/               # Shared protocol definitions & sockets
│   ├── scrap/                    # Screen capture (DirectX 11 DXGI / PipeWire)
│   ├── enigo/                    # Cross-platform mouse & keyboard injection
│   ├── clipboard/                # Sinkronisasi clipboard multi-platform
│   └── portable/                 # Single-file portable runtime packer (Brotli compression)
├── scripts/                      # Skrip Otomasi Operasional & Deployment
│   ├── package.ps1               # Pembuat binary produksi standalone mandiri
│   ├── install.ps1               # Windows System Installer (Service + Program Files)
│   ├── start.ps1                 # Peluncur desktop otomatis
│   └── stop.ps1                  # Utilitas graceful shutdown seluruh proses
├── dist/                         # Direktori Output Binary Distribusi
│   └── AudiraDesk-v1.5.0-x86_64.exe # File produksi tunggal siap pakai
├── AudiraDesk.exe                # Binary standalone root
├── install.bat                   # Pintasan instalasi sistem sekali klik
├── package.bat                   # Pintasan packaging produksi sekali klik
├── start.bat                     # Pintasan menjalankan aplikasi
├── stop.bat                      # Pintasan menghentikan aplikasi
├── LICENSE                       # Lisensi Resmi MIT
└── README.md                     # Dokumentasi Proyek
```

---

## ⚡ Panduan Memulai Cepat

### 1. Menjalankan Langsung (Mode Standalone Portabel)
Cukup jalankan file binary tunggal tanpa instalasi:
```cmd
AudiraDesk.exe
```
*Aplikasi akan langsung terbuka dan siap menghubungkan atau menerima koneksi remote.*

### 2. Menginstal Permanen ke Sistem Windows
Untuk dukungan penuh hak akses **UAC Administrator** dan service latar belakang otomatis:
1. Klik kanan pada **`install.bat`** lalu pilih **Run as Administrator** (atau jalankan perintah PowerShell berikut):
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
   ```
2. Skrip secara otomatis akan:
   - Menyalin binary ke `C:\Program Files\Audira Desk\AudiraDesk.exe`.
   - Mendaftarkan Windows Service (`Audira Desk Service`) agar selalu siap menerima koneksi saat booting.
   - Mengonfigurasi aturan Windows Defender Firewall (Port TCP/UDP 21115–21119).
   - Membuat pintasan di Desktop dan Start Menu.
   - Mendaftarkan informasi aplikasi di Windows *Add/Remove Programs* secara akurat (~41 MB).

### 3. Menghentikan Semua Proses Aktif
Untuk membersihkan dan menghentikan seluruh background service dan GUI yang aktif:
```cmd
stop.bat
```

### 4. Membuat Paket Distribusi untuk PC Lain
Untuk mengemas kembali seluruh perubahan ke dalam satu file tunggal yang sangat ringan (~28 MB):
```cmd
package.bat
```
Hasil binary portabel akan otomatis tersedia di `dist/AudiraDesk-v1.5.0-x86_64.exe` dan `AudiraDesk.exe`.

---

## 🛠️ Kompilasi dari Sumber (Build from Source)

### Prasyarat Lingkungan (Windows)
1. **Rust Toolchain**: `rustup` dengan target `stable-x86_64-pc-windows-msvc`.
2. **LLVM / Clang**: Diperlukan untuk kompilasi FFI `bindgen`.
   ```powershell
   winget install --id LLVM.LLVM -e
   $env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"
   ```
3. **Python 3.10+**: Untuk skrip packaging portabel (`libs/portable/generate.py`).
4. **Flutter SDK (3.16+)**: Untuk antarmuka pengguna frontend.

### Langkah Kompilasi
```powershell
# 1. Clone repositori
git clone https://github.com/USERNAME/audira-desk.git
cd audira-desk

# 2. Setup environment LLVM
$env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"

# 3. Kompilasi portable single executable
.\package.bat
```

---

## 🛡️ Keamanan & E2EE

- **Kriptografi Asimetris**: Pertukaran kunci sesi menggunakan Curve25519 (`X25519`).
- **Autentikasi Simetris**: Enkripsi payload data sesi menggunakan `ChaCha20-Poly1305` dengan nonce unik per paket.
- **Password Hashing**: Password unattended access disimpan menggunakan hashing bergaram (*salted hash*) permanen.
- **Permission Gates**: Host memegang kendali penuh atas izin transfer berkas, input mouse/keyboard, clipboard, dan audio.

Kebijakan keamanan mendalam dan prosedur pelaporan kerentanan dapat dibaca pada [**SECURITY.md**](SECURITY.md).

---

## 🤝 Kontribusi

Kontribusi dari komunitas sangat disambut! Silakan baca [**CONTRIBUTING.md**](CONTRIBUTING.md) untuk panduan alur kerja Git, standar kode Rust (prinsip minimal-diff, penanganan error tanpa `unwrap()`, Tokio async safety), dan sinkronisasi memori Brain.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **[MIT License](LICENSE)**.

```text
Copyright (c) 2026 AUDIRA (Agus Dwi R)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

Dibuat dengan ❤️ dan dedikasi oleh **AUDIRA (Agus Dwi R)**.
