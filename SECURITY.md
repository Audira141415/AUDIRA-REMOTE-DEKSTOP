# Kebijakan Keamanan & Kriptografi — Audira Desk

Keamanan dan privasi pengguna adalah prioritas tertinggi dalam perancangan **Audira Desk**. Dokumen ini menjelaskan model keamanan, arsitektur enkripsi, dan prosedur pelaporan kerentanan keamanan.

---

## 1. Versi yang Didukung

Pembaruan keamanan dan patch aktif diterapkan pada versi berikut:

| Versi | Didukung | Status |
| :--- | :--- | :--- |
| **v1.5.x** | ✅ Ya | Versi Produksi Aktif (Direkomendasikan) |
| < v1.5.0 | ❌ Tidak | Versi Lama (Harap perbarui ke rilis terbaru) |

---

## 2. Arsitektur Keamanan Zero-Trust & E2EE

Prinsip keamanan inti Audira Desk adalah **Zero-Trust End-to-End Encryption (E2EE)**:

1. **Pertukaran Kunci Asimetris**:
   - Sesi komunikasi diawali dengan jabat tangan kriptografi berbasis kurva **Curve25519 (X25519)**.
   - Sesi menghasilkan *shared secret* unik yang hanya diketahui oleh kedua perangkat yang terhubung.
2. **Cipher Simetris Terotentikasi**:
   - Seluruh payload aliran data (frame video, audio, masukan mouse/keyboard, dan transfer file) dienkripsi menggunakan cipher **ChaCha20-Poly1305** atau **AES-256-GCM**.
   - Setiap paket dilengkapi nonce unik dan tag autentikasi integritas untuk menangkal serangan pemalsuan maupun *replay attacks*.
3. **Kedaulatan Server Perantara**:
   - Server rendezvous (`hbbs`) maupun server relay (`hbbr`) hanya bertindak sebagai saluran transmisi terenkripsi (*encrypted passthrough*).
   - Server **TIDAK PERNAH memiliki akses ke kunci dekripsi** dan tidak dapat membaca lalu lintas data Anda.
4. **Isolasi Memori & Kunci Rahasia**:
   - Kunci privat disimpan secara lokal di mesin pengguna dengan izin sistem operasi yang ketat.
   - Kunci rahasia dan token autentikasi tidak pernah dicatat ke dalam log sistem.

---

## 3. Pelaporan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan celah atau kerentanan keamanan pada Audira Desk:

1. **Jangan publikasikan issue secara terbuka**: Demi melindungi keamanan seluruh pengguna, jangan membuka publik issue pada GitHub untuk masalah keamanan yang belum diperbaiki.
2. **Kirimkan Laporan Pribadi**:
   - Laporkan melalui fitur **GitHub Private Vulnerability Reporting** pada tab Security di repositori ini, atau
   - Hubungi tim pemelihara **AUDIRA (Agus Dwi R)** secara langsung dengan rincian teknis (*Proof of Concept*, versi yang terdampak, dan langkah reproduksi).
3. **Waktu Tanggap**:
   - Tim akan meninjau laporan Anda dalam waktu maksimal 48 jam dan menyediakan patch perbaikan sesegera mungkin.
