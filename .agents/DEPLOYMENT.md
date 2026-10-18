# DEPLOYMENT — AUDIRA Remote Desktop

> **System:** AUDIRA Remote Desktop (Enterprise Secure Remote Access Platform)  
> **Tagline:** "Ultra-Low Latency. End-to-End Encrypted. Cross-Platform. Autonomous AI Assistance."  
> **Version:** v1.5.0  
> **Status:** Production Infrastructure, Build, & Deployment Guide  

---

## 1. Deployment Topology & Architecture

Infrastruktur AUDIRA Remote Desktop terdiri dari **Client Endpoint Application** (Desktop & Mobile) dan **Self-Hosted Infrastructure Server** (Rendezvous `hbbs` dan Relay `hbbr`):

```
                        [ CLIENT OPERATOR ]
                    (Windows / Linux / macOS)
                                │
                 ┌──────────────┴──────────────┐
                 │ (21116 TCP/UDP)             │ (21117 TCP)
                 ▼                             ▼
      ┌─────────────────────┐       ┌─────────────────────┐
      │  RENDEZVOUS SERVER  │       │    RELAY SERVER     │
      │       (hbbs)        │       │       (hbbr)        │
      │  • ID Registration  │       │  • Encrypted Stream │
      │  • Heartbeat        │       │    Data Fallback    │
      │  • UDP Hole Punch   │       │  • High Bandwidth   │
      └─────────────────────┘       └─────────────────────┘
                 ▲                             ▲
                 │ (21116 TCP/UDP)             │ (21117 TCP)
                 └──────────────┬──────────────┘
                                │
                         [ REMOTE HOST ]
                     (Windows / Linux / macOS)
                 (Elevated Background Service)
```

---

## 2. Infrastructure Port Matrix (Server Side)

| Port | Protokol | Layanan | Fungsi Operasional |
|---|---|---|---|
| **21115** | TCP | `hbbs` | NAT type testing & connection probe |
| **21116** | TCP & UDP | `hbbs` | ID registration, heartbeat, dan UDP hole punching traversal |
| **21117** | TCP | `hbbr` | Relaying encrypted stream traffic saat P2P terhalang NAT |
| **21118** | TCP | `hbbs` (Opsional) | Web client WebSocket streaming |
| **21119** | TCP | `hbbs` (Opsional) | Web client heartbeat & status |

---

## 3. Docker Compose Self-Hosted Deployment (`hbbs` & `hbbr`)

Untuk deployment server mandiri di private cloud atau on-premise data center:

```yaml
version: '3.8'

services:
  hbbs:
    container_name: audira-rendezvous
    image: rustdesk/rustdesk-server:latest
    command: hbbs -r relay.yourdomain.com:21117 -k _
    volumes:
      - ./data:/root
    network_mode: host
    restart: always

  hbbr:
    container_name: audira-relay
    image: rustdesk/rustdesk-server:latest
    command: hbbr -k _
    volumes:
      - ./data:/root
    network_mode: host
    restart: always
```

> **Catatan Kunci Publik (`-k _`):** Flag `-k _` mengharuskan klien menyertakan public key server (`id_ed25519.pub`) agar tidak ada klien tak dikenal yang dapat menyalahgunakan relay server perusahaan Anda.

---

## 4. Build Environment & Prerequisites

### A. Toolchain Requirements
- **Rust Toolchain:** Version 1.75+ (`stable-x86_64-pc-windows-msvc` pada Windows).
- **C/C++ Build Tools:** Visual Studio 2022 C++ Build Tools (MSVC) dengan Windows SDK.
- **Vcpkg Package Manager:** Untuk kompilasi pustaka statis C/C++ dependensi multimedia.
- **Flutter SDK:** Version 3.10+ (Channel stable).
- **LLVM / Clang:** Diperlukan oleh `bindgen` dan `flutter_rust_bridge`.

### B. Vcpkg Dependency Installation
Set environment variable `VCPKG_ROOT` ke direktori repositori vcpkg Anda:

```powershell
# Di dalam direktori vcpkg
git checkout 2023.04.15
./bootstrap-vcpkg.bat

# Install pustaka statis untuk Windows x64
./vcpkg install libvpx:x64-windows-static libyuv:x64-windows-static opus:x64-windows-static aom:x64-windows-static
```

### C. Build Commands

1. **Build Raw Rust Binary:**
   ```powershell
   cargo build --release
   ```

2. **Build dengan Fitur Flutter & Hardware Codec:**
   ```powershell
   cargo build --release --features "flutter,hwcodec"
   ```

3. **Build Menggunakan Script Otomasi Python:**
   ```powershell
   python build.py --hwcodec
   ```

4. **Build Flutter Frontend Bundle:**
   ```powershell
   cd flutter
   flutter build windows --release
   ```

---

## 5. Background Service & System Installation (Windows)

AUDIRA Remote Desktop menyediakan skrip instalasi sistem otomatis untuk mendaftarkan service background running as `NT AUTHORITY\SYSTEM` (diperlukan untuk interaksi Secure Desktop, UAC prompt, dan remote login):

### A. Instalasi Otomatis via Script
Cukup jalankan file launcher instalasi:
```cmd
:: Jalankan skrip instalasi sistem terintegrasi (otomatis meminta elevasi UAC)
install.bat
```
Skrip ini akan secara otomatis:
1. Menyalin binary ke `C:\Program Files\AUDIRA`
2. Mendaftarkan dan menjalankan background Windows Service (`audira.exe --install-service`)
3. Membuat shortcut di Desktop dan Start Menu
4. Membuka port inbound Windows Defender Firewall (21115 - 21119)

### B. Instalasi Manual via Command Line
```powershell
# 1. Jalankan instalasi background service sistem
.\audira.exe --install-service

# 2. Atau buka wizard instalasi GUI resmi
.\audira.exe --install

# 3. Verifikasi status service
Get-Service -Name "RustDesk", "AUDIRA" -ErrorAction SilentlyContinue
```

---

## 6. Multi-Platform Packaging Matrix

| Platform | Format Distribusi | Installer Generator | Catatan Khusus |
|---|---|---|---|
| **Windows** | `.exe` / `.msi` | NSIS / Inno Setup | Menyertakan background service dan driver virtual display |
| **Linux** | `.deb`, `.rpm`, AppImage, Flatpak | `cargo-deb`, Flatpak builder | Systemd service `/etc/systemd/system/rustdesk.service` |
| **macOS** | `.dmg` | `create-dmg` | Memerlukan Apple Developer Certificate & Notarization |
| **Android** | `.apk` / `.aab` | `flutter build apk` | Accessibility Service & MediaProjection API permission |
| **iOS** | `.ipa` | Xcode archive | ReplayKit Broadcast Extension untuk screen sharing |

---

## 7. Analisis Ukuran Disk: Mengapa Folder Repositori Mencapai 15+ GB?

Ukuran **15+ GB** di repositori **BUKAN** ukuran aplikasi AUDIRA Remote Desktop (binary executable siap pakai `audira.exe` aslinya hanya **~32 MB**). Ukuran besar ini berasal dari cache kompilasi pengembang lokal:

| Komponen / Direktori | Ukuran | Penjelasan & Isi |
|---|---|---|
| **`target\debug\`** | **~9.5 GB** | Simbol debug (`.pdb`), intermediate object files (`.obj`, `.rlib`), dan cache incremental build Cargo yang belum dioptimasi. |
| **`target\release\`** | **~3.8 GB** | File kompilasi perantara saat menjalankan build release. |
| **`tools\`** | **~1.2 GB** | Installer toolchain dan arsip zip (`LLVM-18.1.8-win64.exe` ~374MB, `llvm.zip` ~190MB, toolchain `llvm-mingw` ~340MB). |
| **`flutter\`** | **~0.5 GB** | Cache Flutter C++ runner (`windows/`) dan `.dart_tool`. |
| **`audira.exe` (Root)** | **~32 MB** | **Binary mandiri siap pakai untuk end-user / produksi.** |

### Cara Menghemat & Mengembalikan 14+ GB Ruang Penyimpanan:
Gunakan utilitas pembersih cache bawaan tanpa merusak `audira.exe`:
```cmd
:: Jalankan utilitas pembersih disk interaktif
clean.bat
```
Atau bersihkan via perintah Cargo:
```powershell
# Menghapus seluruh folder target kompilasi (menghemat ~13.3 GB)
cargo clean
```

---

## 8. Distribusi Binary Tunggal Produksi (Single-File Standalone EXE)

Untuk tahap produksi ke end-user di PC lain tanpa memerlukan zip, file `.bat`, atau `.dll` terpisah (persis seperti AnyDesk):

- **File Executable Produksi:** [`dist/AUDIRA-v1.5.0-x86_64.exe`](file:///f:/AUDIRA-REMOTE-DEKSTOP/dist/AUDIRA-v1.5.0-x86_64.exe) (atau [`AUDIRA.exe`](file:///f:/AUDIRA-REMOTE-DEKSTOP/AUDIRA.exe) di root).
- **Ukuran File:** **24.71 MB**.
- **Karakteristik:**
  1. Mengemas seluruh engine Flutter, plugin desktop, driver virtual display, printer driver, dan aset grafis ke dalam format payload terkompresi Brotli (Level 11).
  2. Saat diklik ganda di PC mana pun, aplikasi langsung mengekstrak dirinya secara otomatis ke `%LocalAppData%\audira` dan meluncurkan antarmuka remote desktop modern dengan latensi ultra-rendah.
  3. Cukup kirim **satu file `.exe` ini saja** ke PC klien.

