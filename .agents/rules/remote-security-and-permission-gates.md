# Remote Security, Access Control & Permission Gates
> **Rule ID**: `SEC-GATE-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Absolute Security Guardrails (Zero-Trust Remote Access)

1. **Larangan Sesi Tanpa Otentikasi Terverifikasi:**
   - Tidak ada koneksi remote yang boleh menerima data video atau menginjeksi input sistem tanpa melalui salah satu dari dua gerbang otorisasi:
     - **Persetujuan Interaktif (Consent Window):** Host mengklik tombol "Accept" secara eksplisit.
     - **Verifikasi Kredensial (Unattended Access):** Klien mengirimkan password terverifikasi yang cocok dengan salted hash di host.
2. **End-to-End Encryption Mandate:**
   - Seluruh payload sesi wajib terenkripsi menggunakan shared key hasil negosiasi X25519 dan authenticated cipher ChaCha20-Poly1305. Relay server dilarang memiliki kemampuan membuka payload teks atau biner.

---

## 2. Granular Permission Gates Matrix

Sebelum mengeksekusi sub-protokol apapun, server host **wajib memverifikasi izin aktif** pada `SessionPermissions`:

| Operasi Target | Pemeriksaan Wajib | Tindakan Jika Izin Non-Aktif |
|---|---|---|
| **Injeksi Mouse / Keyboard** | `permissions.keyboard_mouse` | Buang event input secara hening; log trace |
| **Transfer / Akses File** | `permissions.file_transfer` | Tolak request FS dengan error `PermissionDenied` |
| **Sinkronisasi Clipboard** | `permissions.clipboard` | Jangan kirim atau terima payload clipboard sistem |
| **Audio Streaming** | `permissions.audio` | Matikan loopback audio capturer |
| **TCP Port Forwarding** | `permissions.tunnel` | Tolak pembuatan tunnel socket lokal |
| **Restart / Shutdown Host** | `permissions.restart` | Tolak perintah sistem dengan peringatan keamanan |
| **Windows UAC Elevation** | `permissions.elevation` | Minta konfirmasi pop-up interaktif di host |

---

## 3. Privacy Mode & Screen Blanking Rules

1. **Integritas Privasi:**
   - Saat Privacy Mode diaktifkan oleh operator, display fisik host harus segera digelapkan/dibebaskan dari render desktop asli.
2. **Input Isolation:**
   - Input fisik lokal (keyboard/mouse pengguna di host) harus dinonaktifkan sementara untuk mencegah manipulasi yang tidak disengaja selama sesi administratif berlangsung.
3. **Fail-Safe Release:**
   - Jika sesi remote terputus secara mendadak (disconnect/crash), monitor host dan input lokal **wajib otomatis dipulihkan ke status normal** tanpa memerlukan reboot mesin.

---

## 4. Secret Redaction & Anti-Brute-Force Policy

1. **Redaksi Rahasia (Zero-Leakage):**
   - Password dinamis, password permanen, private key, dan token relay **DILARANG KERAS** dicetak ke log file, output konsol, atau DTO client.
   - String sensitif wajib diganti dengan `********` sebelum dioperasikan ke logger.
2. **Mitigasi Serangan Kamus (Brute-Force):**
   - Kegagalan password berturut-turut wajib memicu time-penalty eksponensial (5s -> 30s -> pemblokiran IP sementara selama 10 menit).
