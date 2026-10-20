# Localization & Translation Hygiene Rules
> **Rule ID**: `I18N-HYGIENE-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Tata Letak File Lokalisasi (`src/lang/*.rs`)

Setiap file di dalam `src/lang/*.rs` merepresentasikan pasangan key-value string: `HashMap<&'static str, &'static str>`.

1. **`template.rs` (Master Key Catalog):**
   - Berisi daftar master seluruh kunci terjemahan yang didukung aplikasi.
   - **PERINGATAN KERAS:** Dilarang mengedit `template.rs` sebagai bagian dari pekerjaan penerjemahan rutin. `template.rs` hanya diubah ketika menambahkan kunci fitur baru secara global.

2. **`en.rs` (English Overrides):**
   - Hanya memuat kunci yang tampilan bahasa Inggrisnya **berbeda dari string kunci itu sendiri**.
   - Jika kunci sudah berupa teks bahasa Inggris yang jelas (misalnya: `"Privacy Mode"`), kunci tersebut **tidak perlu** dimasukkan ke dalam `en.rs`.

3. **`it.rs` (Italian Translation Reserved):**
   - Dikelola secara manual oleh maintainer bahasa Italia.
   - **Dilarang keras mengisi atau mengubah terjemahan di `it.rs`**. Saat menambahkan kunci baru ke dalam sistem, cukup tambahkan `("key_name", "")` dengan string kosong pada baris akhir `it.rs`.

4. **File Bahasa Lain (`de.rs`, `fr.rs`, `id.rs`, dll.):**
   - Membawa seluruh daftar kunci; entri yang belum diterjemahkan bernilai string kosong: `("key_name", "")`.

---

## 2. Aturan Penambahan Kunci Baru (Feature Work)

1. **Sentence Case vs Title Case:**
   - Kunci baru dengan teks bahasa Inggris wajib menggunakan format **sentence case**, bukan Title Case:
     - `Use ID whitelisting` (**BENAR**)
     - `Use ID Whitelisting` (**SALAH**)
   - Pengecualian: Akronim teknologi tetap kapital penuh (`ID`, `IP`, `2FA`, `UAC`, `NAT`, `E2EE`).
   - Kunci warisan (legacy) lama yang sudah Title Case tidak boleh diubah (hindari regresi).

2. **Format Penambahan:**
   - Tambahkan kunci baru di baris paling akhir file `template.rs` dengan nilai `""`.
   - Tambahkan kunci tersebut ke seluruh file `src/lang/*.rs` (diterjemahkan atau diberi `""`).

---

## 3. Higienitas Terjemahan (Translation Hygiene)

1. **Hanya Mengisi Nilai Kosong:**
   - Hanya ubah baris yang memiliki nilai `""`. Jangan pernah mengubah kunci (`key`) atau mengubah terjemahan lama yang sudah memiliki nilai non-kosong kecuali atas permintaan koreksi spesifik.
2. **Preservasi Placeholder & Escape Sequences:**
   - Simbol placeholder seperti `{}` atau format string serta escape character `\n`, `\"`, `\t` wajib dipertahankan persis seperti aslinya.
3. **Larangan Menerjemahkan Brand & Token Teknis:**
   - Dilarang menerjemahkan kata teknis berikut ke bahasa target:
     `RustDesk`, `AUDIRA`, `Socks5`, `TLS`, `UAC`, `Wayland`, `X11`, `TCP`, `UDP`, `2FA`, `RDP`, `D3D`, `WASAPI`, `Opus`.
4. **URL & Dokumentasi:**
   - Salin nilai URL (misalnya kunci berawalan `doc_*`) persis sama seperti sumbernya.
