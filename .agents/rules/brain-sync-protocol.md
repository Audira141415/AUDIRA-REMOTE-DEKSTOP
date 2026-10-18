# BRAIN SYNCHRONIZATION PROTOCOL
> **Rule ID**: `BRAIN-SYNC-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Tujuan Kebijakan

Dokumen [`.agents/brain/`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain) dan [`BRAIN.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/BRAIN.md) merupakan *Single Source of Truth (SSOT)* dan memori jangka panjang dari proyek AUDIRA Remote Desktop. Dokumen ini mencegah halusinasi arsitektur, duplikasi fitur, inkonsistensi protokol rendezvous/relay, atau regresi kode tingkat rendah.

---

## 2. Aturan Sinkronisasi Saat Penambahan / Modifikasi Fitur

Setiap kali Anda (AI Agent atau developer) selesai mengimplementasikan fitur baru, memperbaiki bug, atau mengubah komponen sistem, Anda **wajib** melakukan sinkronisasi sebelum mengakhiri turn:

1. **Periksa Modul Terkait di Brain**:
   - Jika mengubah komponen UI di `flutter/`: Daftarkan perubahannya di [`FEATURE_CATALOG.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/FEATURE_CATALOG.md).
   - Jika mengubah arsitektur crate, FFI bridge, atau threading Tokio: Daftarkan perannya di [`SYSTEM_ARCHITECTURE.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SYSTEM_ARCHITECTURE.md).
   - Jika memodifikasi protokol rendezvous, packet format, atau codec: Update rinciannya di [`PROTOCOLS_AND_CODECS.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PROTOCOLS_AND_CODECS.md).
   - Jika mengubah kebijakan permission gates, enkripsi Libsodium, atau UAC elevation: Update [`SECURITY_AND_PERMISSIONS.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/SECURITY_AND_PERMISSIONS.md).
   - Jika mengubah dukungan platform spesifik (Windows/Linux/macOS/Android): Update [`PLATFORM_INTEGRATION_MATRIX.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/PLATFORM_INTEGRATION_MATRIX.md).
   - Jika mengubah penyimpanan opsi konfigurasi: Update [`DATA_FLOW_AND_STORAGE.md`](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/DATA_FLOW_AND_STORAGE.md).

2. **Perbarui Log Riwayat**:
   - Tambahkan entri ringkas mengenai perubahan yang telah diselesaikan pada [UPDATE_HISTORY_AND_ROADMAP.md](file:///f:/AUDIRA-REMOTE-DEKSTOP/.agents/brain/UPDATE_HISTORY_AND_ROADMAP.md).

3. **Verifikasi Integritas Build**:
   - Pastikan kode lulus verifikasi kompilasi (`cargo check` atau `cargo test`) tanpa error.

---

## 3. Peringatan Pelanggaran

Membiarkan Brain menjadi usang atau menambahkan fitur tanpa memperbarui dokumen Brain akan mengakibatkan AI agent pada sesi berikutnya kehilangan pemahaman arsitektur dan dapat merusak kestabilan engine remote desktop.
