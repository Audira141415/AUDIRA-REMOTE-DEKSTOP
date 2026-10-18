# Minimal-Diff & Regression Surface Hygiene
> **Rule ID**: `DIFF-HYGIENE-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Prinsip Perubahan Minimalis (Minimally Invasive)

1. **Utamakan Penambahan Garis (Purely Additive):**
   - Diff yang ideal menambahkan baris baru (`+`) dan memodifikasi/menghapus sesedikit mungkin baris yang sudah ada.
   - Jangan merombak kode yang sudah berjalan hanya agar bisa membagi fungsi dengan fitur baru. Sedikit duplikasi kode jauh lebih baik daripada merusak kestabilan kode yang sudah teruji.
2. **Dilarang Refactoring Tanpa Permintaan:**
   - Dilarang keras melakukan refactoring file, membersihkan formatting kode lama, atau mengubah gaya penulisan di luar lingkup instruksi langsung user.

---

## 2. Aturan Struktur Import Crate

1. **Satu `use` Per Crate:**
   - Semua modul atau tipe yang diimpor dari satu crate yang sama **wajib digabungkan ke dalam satu blok berkurung kurawal**, bukan satu baris per item:
     ```rust
     // SALAH
     use base::fs;
     use base::message_proto::*;

     // BENAR
     use base::{fs, message_proto::*};
     ```
2. **Pengecualian `#[cfg(...)]`:**
   - Pemisahan baris import hanya diizinkan jika terdapat atribut `#[cfg(...)]` berbeda yang tidak berlaku untuk seluruh blok.

---

## 3. Komentar & Dokumentasi Kode

1. **Hindari Komentar Deskriptif Berlebihan:**
   - Jangan menambahkan komentar yang hanya sekadar menceritakan ulang apa yang dilakukan oleh kode.
   - Komentar hanya diizinkan jika menjelaskan alasan non-obvious, batas platform tingkat rendah, atau workaround bug driver OS.

---

## 4. Penanganan Kasus Sudut (Corner Cases)

1. **Hindari Penambahan State yang Berlebihan:**
   - Kasus sudut (*corner case*) yang langka (seperti glitch kosmetik minor saat rotasi layar) sebaiknya didokumentasikan sebagai *known limit*, bukan diperbaiki dengan menambahkan tumpukan state, timer, atau flag baru yang rentan regresi.
2. **Utamakan Kegagalan Bersih (Clean Failure):**
   - Lebih baik sebuah operasi melaporkan error yang jelas (`Result::Err`) daripada membuat mekanisme rumit yang berusaha memaksakan kasus ekstrem agar berhasil.

---

## 5. Verifikasi Permukaan Regresi (Regression Surface Check)

Sebelum menyatakan task selesai:
- [ ] Tinjau seluruh diff git. Pastikan tidak ada modifikasi pada file yang tidak relevan.
- [ ] Pastikan jalur kode lama tetap utuh ketika fitur baru dinonaktifkan (`feature off`).
- [ ] Laporkan ringkasan permukaan regresi secara transparan kepada pengguna.
