# Flutter & Rust FFI Concurrency & Memory Safety Protocol
> **Rule ID**: `FFI-BRIDGE-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Thread Safety & UI Isolate Non-Blocking

1. **Non-Blocking Dart UI Thread:**
   - Pemanggilan fungsi FFI dari Flutter (`flutter_rust_bridge`) ke runtime Rust **DILARANG KERAS** memblokir thread UI Dart.
   - Operasi yang membutuhkan waktu (seperti negosiasi NAT, resolusi hostname server relay, atau loading file) wajib dieksekusi secara asinkron menggunakan Tokio task atau Dart `Future`.
2. **Streaming Event via StreamSink:**
   - Aliran data berkelanjutan (seperti status koneksi peer, telemetri FPS/latensi, dan log sesi) wajib menggunakan `flutter_rust_bridge::StreamSink` agar event terdorong (*pushed*) secara reaktif ke state listener di Flutter.

---

## 2. Memory Lifecycle & Resource Cleanup

1. **Siklus Hidup Texture Video Buffer:**
   - Frame render video dikirimkan ke Flutter melalui Texture Registry (`TextureId`).
   - Sisi Rust bertanggung jawab memastikan bahwa memory buffer frame sebelumnya dibebaskan atau di-swap dengan aman sebelum frame baru dialokasikan.
2. **Pembersihan Sesi Remote (Teardown):**
   - Saat jendela sesi ditutup oleh pengguna (`onWindowClose`), UI Flutter wajib memicu pemanggilan FFI `close_session(peer_id)`.
   - Runtime Rust wajib mematikan capture thread, melepaskan socket stream, dan menghapus session state dari memori untuk mencegah kebocoran RAM (*memory leak*).

---

## 3. Serialisasi Data & Kontrak Tipe

1. **Gunakan Protocol Buffers / Typed DTO:**
   - Pertukaran data terstruktur antar lapisan Rust dan Dart harus menggunakan kontrak tipe yang jelas atau pesan Protocol Buffers (`libs/base/src/message_proto.rs`).
   - Dilarang membuat serialisasi JSON ad-hoc atau string parsing manual yang rentan kesalahan format di antara Dart dan Rust.
2. **Propagasi Error yang Bersih (No Panic):**
   - Error yang terjadi di native Rust wajib dipetakan menjadi error pengembalian yang dapat ditangkap oleh blok `try / catch` di Dart.
   - Panic di sisi Rust akan meruntuhkan seluruh proses aplikasi (crash), sehingga seluruh fungsi FFI wajib membungkus logika berisiko dalam penanganan `Result`.
