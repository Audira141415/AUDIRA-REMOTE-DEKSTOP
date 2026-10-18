# DATA FLOW & STORAGE ARCHITECTURE — AUDIRA Remote Desktop
> Alur Data Runtime, Manajemen Konfigurasi `keys.rs`, dan Penyimpanan Lokal.

---

## 1. Single Import Path untuk Konfigurasi (`keys.rs`)

Seluruh opsi preferensi pengguna, server rendezvous kustom, port, dan permission toggles dikelola secara terpusat melalui satu file gerbang impor:

```rust
use base::config::keys::*;
```

**Aturan Arsitektur:** Dilarang mengimpor konstanta opsi konfigurasi langsung dari `hbb_common`. Selalu gunakan `libs/base/src/config/keys.rs` sebagai satu-satunya jalur akses publik untuk memastikan konsistensi re-ekspor.

### Kunci Konfigurasi Utama:
- `KEY_CUSTOM_RENDEZVOUS_SERVER`: Hostname atau IP server perantara privat (`hbbs`).
- `KEY_CUSTOM_RELAY_SERVER`: Hostname atau IP server relay privat (`hbbr`).
- `KEY_SERVER_KEY`: Public key verifikasi server rendezvous (`id_ed25519.pub`).
- `KEY_PERMANENT_PASSWORD`: Salted cryptographic hash password akses tanpa pengawasan.
- `KEY_WHITELIST_ENABLED`: Status aktif filter ID/IP.
- `KEY_ALLOW_ELEVATION`: Izin eskalasi hak administrator Windows (UAC).

---

## 2. Penyimpanan Konfigurasi Lokal di Sistem Operasi

| Platform | Lokasi Penyimpanan Konfigurasi & Kunci |
|---|---|
| **Windows** | `%APPDATA%\RustDesk\config\` & `%PROGRAMDATA%\RustDesk\config\` (Service) |
| **Linux** | `~/.config/rustdesk/` & `/etc/rustdesk/` (Systemd Daemon) |
| **macOS** | `~/Library/Application Support/RustDesk/` |
| **Android** | Internal Private App Storage (`/data/data/com.carriez.flutter_hbb/`) |

- **Pemisahan Kredensial Pengguna vs Service:**
  - Konfigurasi level pengguna menyimpan riwayat sesi, buku alamat (*address book*), dan preferensi UI.
  - Konfigurasi level service menyimpan pasangan kunci privat perangkat (`id_ed25519`), ID permanen host, dan password unattended access.

---

## 3. Flutter Reactive State Binding (FFI Flow)

```
[ Rust Tokio Network Loop ]
          │
          ▼ Packet Received (VideoFrame / Audio / Status)
[ FFI Bridge (flutter_rust_bridge) ]
          │
          ▼ StreamSink.add(Event)
[ Dart StreamController ]
          │
          ▼ StreamSubscription
[ Flutter Provider Models ]
    ├── ConnectionModel: Mengontrol status HUD, FPS, RTT, P2P/Relay
    ├── PeerModel: Menyimpan daftar peer address book dan status online
    ├── ChatModel: Mengelola riwayat percakapan teks sesi aktif
    └── FileModel: Mengontrol daftar direktori lokal & remote
          │
          ▼ notifyListeners()
[ Reactive UI Widgets ] (Multi-Window Canvas & Toolbar)
```

1. **Zero-Copy Video Texturing:** Frame grafis dilewatkan langsung ke Flutter Texture ID di GPU tanpa serialisasi byte berlebih.
2. **Event Isolation:** Event audio dan input dilewatkan melalui lock-free ring buffer untuk meminimalkan jitter.
