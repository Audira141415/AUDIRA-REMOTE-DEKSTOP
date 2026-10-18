# SECURITY — AUDIRA Remote Desktop

> **System:** AUDIRA Remote Desktop (Enterprise Secure Remote Access Platform)  
> **Tagline:** "Ultra-Low Latency. End-to-End Encrypted. Cross-Platform. Autonomous AI Assistance."  
> **Version:** v1.5.0  
> **Status:** Production Security Policy & Cryptographic Architecture  

---

## 1. Security Architecture & E2EE Convergence

Prinsip keamanan utama AUDIRA Remote Desktop adalah **Zero-Trust End-to-End Encryption (E2EE)**.  
Server perantara (Rendezvous `hbbs` maupun Relay `hbbr`) **TIDAK PERNAH memiliki kunci enkripsi** dan tidak mampu mendekripsi audio, video, teks clipboard, atau file yang dialirkan antar peer.

```
                  [ CLIENT OPERATOR ]                  [ REMOTE HOST ]
                           │                                  │
                           │ 1. Asymmetric Handshake (X25519) │
                           │◄────────────────────────────────►│
                           │                                  │
                           │ 2. Derived Session Key (E2EE)    │
                           │    (ChaCha20-Poly1305)           │
                           │                                  │
              ┌────────────┼──────────────────────────────────┼────────────┐
              │            │                                  │            │
              ▼            ▼                                  ▼            ▼
     [ RENDVOUS: hbbs ]    │                         [ PERMISSION GATES ]  │
     • Device Discovery    │                         • View Only           │
     • UDP Hole Punching   │                         • Input Injection     │
                           │                         • Clipboard Sync      │
              ┌────────────┘                         • File Transfer       │
              │                                      • UAC Elevation       │
              ▼                                               │            │
     [ RELAY: hbbr ]                                          ▼            ▼
     • Encrypted Passthrough                         [ PRIVACY MODE ]      │
     • Zero-Decryption Guarantee                     • Blank Monitor       │
              │                                      • Lock Local HID      │
              │                                               │            │
              └───────────────────────────────────────────────┴────────────┘
```

---

## 2. Kriptografi & Handshake Sesi (Libsodium)

1. **Pertukaran Kunci Asimetris (X25519):**
   - Setiap instalasi menghasilkan pasangan kunci publik & privat Curve25519.
   - Saat koneksi diinisiasi, kedua pihak bertukar public key melalui jembatan rendezvous dan melakukan kalkulasi ECDH (Elliptic-curve Diffie-Hellman) untuk menyepakati symmetric shared secret.
2. **Symmetric Stream Cipher (ChaCha20-Poly1305 / AES-256-GCM):**
   - Seluruh frame video, sampel audio, event input mouse/keyboard, dan chunk file dienkripsi dengan authenticated encryption cipher.
   - Setiap paket membawa nonce unik untuk mencegah serangan replay (*replay attack protection*).
3. **Penyimpanan Kunci & Kredensial:**
   - Private key tersimpan di storage lokal terisolasi dengan proteksi platform (Windows DPAPI, Linux Secret Service, macOS Keychain).
   - Kunci privat tidak pernah dikirimkan melalui jaringan atau dicatat ke dalam file log.

---

## 3. Autentikasi & Proteksi Akses

1. **Dynamic Session Password:**
   - Kata sandi acak dihasilkan secara lokal di host (default: 6 hingga 10 karakter alfanumerik berkekuatan tinggi).
   - Dapat diatur untuk disegarkan otomatis setelah setiap sesi selesai atau per durasi tertentu.
2. **Permanent Password (Unattended Access):**
   - Kata sandi akses permanen di-hash menggunakan algoritma modern berkekuatan tinggi dengan garam kriptografis (*cryptographic salt*).
   - Nilai hash disimpan di konfigurasi (`libs/base/src/config/keys.rs`). Plaintext password tidak pernah disimpan di disk.
3. **Anti-Brute-Force & Rate Limiting:**
   - Host membatasi percobaan password yang salah:
     - 3 kali salah: Delay 5 detik.
     - 5 kali salah: Lockout sementara 30 detik.
     - > 10 kali salah: Pemblokiran IP otomatis selama 10 menit dengan log peringatan keamanan.
4. **Two-Factor Authentication (2FA / TOTP):**
   - Dukungan autentikasi lapis kedua berbasis TOTP (Google Authenticator / Aegis) untuk akses unattended pada server kritikal.

---

## 4. Granular Permission Gates (Hak Akses Sesi)

Host memiliki kendali mutlak atas apa yang diizinkan kepada klien remote:

| Izin Sesi | Default | Risiko | Deskripsi Kontrol |
|---|---|---|---|
| **View Display** | Wajib | Low | Hak melihat tangkapan layar host |
| **Mouse & Keyboard Control**| Aktif | Medium | Hak menginjeksi klik dan tombol ke sistem |
| **Clipboard Sync** | Aktif | Medium | Sinkronisasi copy-paste teks dua arah |
| **File Transfer** | Tergantung Konfigurasi | High | Hak membaca & menulis direktori file sistem |
| **Audio Playback** | Aktif | Low | Mendengarkan output audio sistem host |
| **Tunnel / TCP Port Forward** | Non-aktif | High | Meneruskan port jaringan internal melalui sesi |
| **Remote Reboot / Shutdown** | Non-aktif | Critical | Menyalakan ulang atau mematikan mesin host |
| **UAC Privilege Elevation** | Meminta Konfirmasi | Critical | Mengeskalasi kontrol ke konteks Administrator |

---

## 5. Privilege Elevation & Windows UAC Architecture

1. **Session 0 Isolation:**
   - Pada Windows, proses pengguna biasa tidak dapat berinteraksi dengan dialog UAC (User Account Control) atau layar login Secure Desktop (`Ctrl+Alt+Del`).
2. **Elevated Service Daemon (`src/service.rs`):**
   - AUDIRA Remote Desktop menyediakan service sistem yang berjalan dengan hak `NT AUTHORITY\SYSTEM`.
   - Saat dialog UAC muncul, proses GUI berkoordinasi dengan background service untuk menangkap Secure Desktop dan menginjeksi input admin secara aman tanpa membuat celah eskalasi privilese bagi pihak ketiga.

---

## 6. Privacy Mode & Screen Blanking

Untuk menjaga kerahasiaan saat teknisi merawat mesin di area publik atau kantor terbuka:
1. **Host Display Blanking:** Mengirimkan sinyal pemadaman ke monitor fisik target atau menampilkan overlay hitam solid fullscreen yang tidak dapat diminimalkan dari lokal.
2. **Local Input Suppression:** Memblokir input dari keyboard dan mouse fisik lokal host selama sesi remote berlangsung agar pihak lokal tidak dapat mengintervensi pekerjaan teknisi.

---

## 7. Perimeter Security & ID/IP Whitelisting

1. **ID Whitelisting (`Use ID whitelisting`):**
   - Host menolak koneksi dari ID manapun yang tidak terdaftar dalam daftar putih otorisasi.
2. **IP / CIDR Filtering:**
   - Membatasi koneksi hanya dari subnet IP VPN perusahaan (contoh: `10.200.0.0/16` atau `192.168.100.0/24`).

---

## 8. Secret Redaction & Log Hygiene

Mengikuti aturan ketat repository di `AGENTS.md`:
1. Dilarang mencatat password sesi, shared secret, private key, atau potongan data clipboard ke dalam file log.
2. Seluruh log jaringan atau transport yang berulang wajib menggunakan `log::trace!` atau `hbb_common::throttled_log!`.
3. String sensitif wajib difilter menjadi `********` sebelum dikeluarkan ke output debug atau konsol.
