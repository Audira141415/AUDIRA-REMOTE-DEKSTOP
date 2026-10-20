# Git Submodule & Workspace Scope Governance
> **Rule ID**: `WORKSPACE-SCOPE-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Aturan Pemisahan Submodule vs Workspace Member

1. **Status `libs/hbb_common` (Git Submodule):**
   - `libs/hbb_common` adalah git submodule eksternal yang dibagi bersama server rendezvous/relay (`hbbs`/`hbbr`).
   - Perubahan di dalam `libs/hbb_common` membutuhkan commit terpisah di repo submodule, push ke upstream remote, dan bump hash commit di parent repository.
   - **Aturan:** Dilarang meletakkan logika khusus klien (client-only code) di dalam `libs/hbb_common`.

2. **Peran `libs/base` (Crate Workspace Klien):**
   - Seluruh logika, struktur data, pesan protobuf, transfer file, dan konfigurasi khusus client **wajib diletakkan di `libs/base/`**.
   - `libs/base` adalah regular member dari Cargo workspace AUDIRA Remote Desktop.

3. **Single Import Path untuk Opsi Konfigurasi:**
   - Semua opsi konfigurasi client maupun server diakses **hanya melalui satu jalur impor**:
     ```rust
     use base::config::keys;
     ```
   - `base::config::keys` mengekspor ulang (re-export) key yang masih dibaca oleh `hbb_common`, sehingga pemanggil tidak perlu mengimpor dari banyak path yang terfragmentasi.

---

## 2. Pemeriksaan Lingkup Sebelum Mengubah Shared Code

1. **Cek Fungsi dan Trait Bersama:**
   - Sebelum mengubah shared trait, struct bersama, atau signature fungsi yang banyak dipanggil (`src/server/connection.rs`, `src/rendezvous_mediator.rs`), pastikan apakah perubahan tersebut spesifik untuk satu platform atau satu fitur saja.
   - Jika spesifik (misal hanya untuk Windows atau hanya untuk Telegram approval), tempatkan perubahan di module fitur tersebut (`src/platform/windows/`, `src/auth_2fa.rs`).

2. **Larangan Modifikasi Signature dengan Dummy Value:**
   - Jika pemanggil yang tidak berhubungan terpaksa menambahkan `Default::default()`, `None`, atau placeholder kosong hanya untuk memenuhi signature fungsi yang baru diubah, **diff tersebut terlalu luas**.
   - Solusi: Buat fungsi baru berdampingan atau gunakan pola builder/opsional yang tidak memecah signature lama.

3. **Thin Hook Call Sites:**
   - Call site di shared core files (`src/tray.rs`, `src/core_main.rs`, `src/server/connection.rs`) harus berupa **thin one-line hook** yang memanggil fungsi mandiri di modul fiturnya masing-masing.

---

## 3. Submodule Bump Review Hygiene

1. Saat melakukan bump git submodule, periksa daftar commit range secara teliti.
2. Pastikan tidak ada commit yang tidak berhubungan yang ikut terbawa ke dalam branch atau PR.
3. Selalu laporkan perubahan hash submodule dalam deskripsi perubahan.
