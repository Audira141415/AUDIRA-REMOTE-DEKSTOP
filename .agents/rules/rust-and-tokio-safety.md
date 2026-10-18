# Rust & Tokio Concurrency Safety Rules
> **Rule ID**: `RUST-TOKIO-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Rust Production Error Handling

1. **Dilarang Keras `unwrap()` / `expect()` pada Kode Produksi:**
   - Seluruh kode yang dapat gagal (I/O soket, deserialisasi protobuf, lookup konfigurasi, interaksi OS) wajib menggunakan `Result<T, E>` dengan operator `?` atau penanganan eksplisit (`match`/`if let`).
   - Pengecualian resmi:
     - Kode unit test (`#[cfg(test)]`).
     - Akuisisi lock mutex di mana kegagalan mengindikasikan poisoning fatal, bukan kontrol alur normal.
2. **Dilarang Mengabaikan Error Secara Diam-Diam:**
   - Dilarang menggunakan pola `let _ = ...` yang menelan error tanpa pencatatan atau penanganan, kecuali pada situasi di mana kegagalan memang terbukti tidak memiliki konsekuensi apapun.
3. **Peminjaman vs Kloning (Borrowing over Cloning):**
   - Hindari pemanggilan `.clone()` yang tidak esensial pada struktur data berukuran besar (frame buffer video, daftar paket, string panjang). Utamakan reference borrowing (`&T`, `&mut T`).
4. **Dependensi Crate:**
   - Dilarang menambahkan dependensi crate baru ke `Cargo.toml` kecuali diminta secara eksplisit atau tidak ada alternatif idiomatik di dalam standard library/workspace.

---

## 2. Tokio Asynchronous Runtime Rules

1. **Tokio Runtime Global:**
   - Selalu asumsikan Tokio runtime sudah ada dan aktif.
   - **Dilarang keras membuat nested runtime** (misalnya memanggil `tokio::runtime::Runtime::new()` di dalam fungsi yang sudah berjalan di bawah Tokio).
   - **Dilarang memanggil `Runtime::block_on()`** di dalam kode async.
2. **Larangan Holding Locks Across `.await`:**
   - Jangan pernah menahan `std::sync::MutexGuard` melintasi titik suspensi `.await`. Hal ini menyebabkan deadlock pada worker threadpool Tokio.
   - Gunakan `tokio::sync::Mutex` jika lock harus dipertahankan antar titik await, atau batasi scope lock menggunakan blok `{}` sebelum `.await`.
3. **Isolasi Kerja Blocking:**
   - Operasi CPU-bound berat (kompresi video/audio software, enkripsi disk besar) atau blocking OS calls wajib dialihkan ke `tokio::task::spawn_blocking` atau dedicated background thread.
   - **Dilarang memanggil `std::thread::sleep()`** di dalam kode async. Gunakan `tokio::time::sleep()`.

---

## 3. Logging & Throttling Hygiene

1. **Level Log & File Output:**
   - Level `log::debug!` ke atas secara otomatis ditulis ke file log.
   - Log yang dapat terpicu berulang kali (per frame display, per paket socket, per pergerakan mouse, atau dalam loop) **DILARANG** menggunakan unthrottled `debug!` atau `info!`.
2. **Pemilihan Log Site:**
   - Gunakan `log::trace!` untuk event internal yang sering terjadi dan hanya dibutuhkan saat debugging aktif.
   - Gunakan `hbb_common::throttled_log!(interval, level, ...)` saat mencatat sinyal kesalahan berulang agar file log tidak membengkak dan membebani I/O disk.
