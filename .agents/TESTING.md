# TESTING — AUDIRA Remote Desktop

> **System:** AUDIRA Remote Desktop (Enterprise Secure Remote Access Platform)  
> **Tagline:** "Ultra-Low Latency. End-to-End Encrypted. Cross-Platform. Autonomous AI Assistance."  
> **Version:** v1.5.0  
> **Status:** Production QA, Regression Prevention & Testing Standards  

---

## 1. Testing Philosophy & Strategy (AGENTS.md Mandates)

AUDIRA Remote Desktop mengoperasikan komponen sistem tingkat rendah (DirectX/DXGI, hook input kernel, driver loopback audio, dan tunneling soket). Kegagalan pada komponen ini dapat memicu system crash, hang, atau kebocoran akses.

Prinsip pengujian berfokus pada **Preservasi Perilaku & Pencegahan Regresi**:
1. **Regression-Focused:** Uji regresi dirancang khusus untuk perilaku yang dilaporkan (gagal sebelum perbaikan, lulus setelah perbaikan). 1 hingga 3 pengujian adalah standar normal.
2. **Black-Box API / User-Visible Assertion:** Lakukan penegasan (*assert*) pada apa yang dilihat pengguna atau apa yang dikembalikan oleh API publik. Dilarang menguji state privat, urutan langkah algoritma internal, atau kasus sudut (*corner cases*) yang terlalu teoretis.
3. **No Heavy Infrastructure:** Dilarang menambahkan infrastruktur pengujian berat (browser runners baru, golden/screenshot harness eksternal, mock layer berlebihan) kecuali diminta secara eksplisit.
4. **Ukuran Diff Seimbang:** Ukuran diff test tidak boleh melebihi dua kali lipat dari perbaikan implementasi.

---

## 2. Test Execution Commands

### A. Rust Workspace Unit & Integration Tests
```powershell
# Menjalankan unit tests di seluruh workspace crate
cargo test --workspace

# Menjalankan test pada crate tertentu (misal: libs/base)
cargo test -p base

# Menjalankan test tanpa fitur grafis
cargo test --no-default-features
```

### B. Flutter Tests
```powershell
cd flutter
flutter test
```

---

## 3. Scope Test Suites

### A. Cryptography & Key Handshake (`src/rendezvous_mediator.rs` & Libsodium)
1. **X25519 Key Exchange Roundtrip:**
   - Memverifikasi bahwa pasangan public/private key klien dan host menghasilkan shared secret yang identik.
2. **ChaCha20-Poly1305 Cipher Authenticity:**
   - Memastikan paket payload yang terotentikasi dapat didekripsi dengan sukses, dan paket yang dimanipulasi (*tampered*) segera memicu error penolakan (`Err`).

### B. File Transfer Safety (`libs/base/src/fs.rs`)
1. **Path Traversal Sanitization:**
   - Menguji bahwa request path berbahaya seperti `../../Windows/System32` atau `../../../etc/passwd` dinetralkan secara otomatis sebelum operasi baca/tulis disk.
2. **Chunked Stream Integrity:**
   - Memverifikasi rekonstruksi chunk data dengan hashing SHA-256 untuk memastikan file yang diterima identik dengan file sumber.

### C. Configuration Keys & Storage (`libs/base/src/config/keys.rs`)
1. **Option Persistence:**
   - Memverifikasi pembacaan dan penulisan opsi konfigurasi (server relay, port kustom, permission toggles) tanpa kehilangan data.

---

## 4. Mandatory Regression-Surface Check Checklist

Sebelum menyatakan implementasi atau PR selesai, **WAJIB** melakukan verifikasi minimalisasi:

- [ ] **Inspeksi Setiap File yang Dimodifikasi:** Setiap baris perubahan harus strictly necessary untuk task yang diminta. Revert perubahan yang hanya sekadar cleanup, reformat, atau refactoring tanpa fungsi.
- [ ] **Feature-Off Behavior Preservation:** Jika sebuah fitur baru dimatikan (`feature off`), jalur kode lama yang terbukti stabil harus tetap berjalan persis seperti sebelumnya, bukan berjalan melalui abstraksi baru yang ditulis ulang.
- [ ] **No Unrelated Pre-existing Bug Fixes:** Jangan memperbaiki bug lama yang tidak berhubungan di PR yang sama.
- [ ] **Import Single-Block Hygiene:** Pastikan import crate tunggal tetap berada dalam satu block braced `{ ... }`.
- [ ] **No Unwrap in Production Paths:** Pastikan tidak ada `unwrap()` atau `expect()` baru yang ditambahkan di jalur runtime produksi.
