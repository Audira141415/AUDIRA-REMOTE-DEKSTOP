# Panduan Kontribusi — Audira Desk

Terima kasih atas minat Anda untuk berkontribusi pada pengembangan **Audira Desk**! Dokumen ini memuat panduan gaya penulisan kode, alur kerja pull request, dan standar arsitektur sistem.

---

## 1. Prinsip Utama Pengembangan (Engineering Hygiene)

Proyek ini memiliki standar keandalan tinggi karena beroperasi pada sistem tingkat rendah (*low-level system runtime*). Seluruh kontributor wajib mematuhi aturan berikut:

### Standar Kode Rust
1. **Hindari `unwrap()` / `expect()` pada Kode Produksi**:
   - Gunakan penanganan error eksplisit (`Result<T, E>`, operator `?`, atau `match`).
   - Pengecualian hanya berlaku pada unit test atau lock poisoning di mana kegagalan bersifat fatal.
2. **Keamanan Asinkron Tokio**:
   - Asumsikan Tokio runtime sudah aktif. Dilarang membuat nested runtime atau memanggil `Runtime::block_on()` di dalam kode asinkron.
   - Dilarang memegang lock (`MutexGuard`, `RwLockReadGuard`) melintasi titik `.await`.
   - Gunakan `tokio::task::spawn_blocking` untuk operasi I/O sinkron yang memblokir thread.
   - Jangan gunakan `std::thread::sleep()` di dalam fungsi `async`.
3. **Prinsip Minimal Diff (Be Minimally Invasive)**:
   - Ubah hanya bagian kode yang benar-benar esensial untuk fitur atau perbaikan terkait.
   - Hindari refactoring luas pada modul yang tidak berkaitan.
   - Utamakan perubahan aditif (menambahkan fungsi/modul baru) daripada merombak struktur kode yang sudah stabil.
4. **Kebijakan Logging Terukur**:
   - Jangan gunakan level `log::debug!` atau `log::info!` tanpa throttling pada perulangan per-frame, per-packet, atau input event.
   - Gunakan `log::trace!` untuk debugging aktif atau `hbb_common::throttled_log!` untuk mendokumentasikan fault berulang.

---

## 2. Alur Kerja Kontribusi (Git Workflow)

1. **Fork Repositori**: Buat fork repositori ini ke akun GitHub Anda.
2. **Buat Branch Fitur**:
   ```bash
   git checkout -b feature/nama-fitur-anda
   ```
3. **Tulis & Uji Kode**:
   - Pastikan kode dapat dikompilasi dengan bersih.
   - Jalankan unit test jika menambahkan logika baru:
     ```powershell
     cargo check --lib
     ```
4. **Sinkronisasi Brain Memory (`BRAIN-SYNC-01`)**:
   - Jika mengubah komponen sistem, perbarui modul terkait di `.agents/brain/` dan catat riwayatnya di `UPDATE_HISTORY_AND_ROADMAP.md`.
5. **Commit & Push**:
   - Gunakan pesan commit yang deskriptif dan jelas.
   ```bash
   git commit -m "feat(video): optimize DXGI frame pacing for 120Hz displays"
   git push origin feature/nama-fitur-anda
   ```
6. **Buka Pull Request (PR)**:
   - Jelaskan latar belakang perubahan, alasan teknis, dan verifikasi pengujian yang telah dilakukan.

---

## 3. Lisensi Kontribusi & Hak Cipta

Seluruh kontribusi kode yang Anda kirimkan ke repositori ini akan diatur di bawah ketentuan **AUDIRA Commercial Software License** dan menjadi bagian dari basis kode terpadu yang dikelola secara resmi oleh Agus Dwi Rianto (AUDIRA). Kontributor menyetujui bahwa AUDIRA berhak mendistribusikan, mempublikasikan, dan melisensikan perangkat lunak ini secara komersial.
