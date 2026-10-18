# SECURITY & PERMISSIONS — AUDIRA Remote Desktop
> Spesifikasi Arsitektur Kriptografi End-to-End, Tata Kelola Izin Sesi, dan Proteksi Sistem.

---

## 1. Zero-Trust Cryptographic Handshake (Libsodium)

Komunikasi antara operator (klien) dan host yang dikendalikan dilindungi oleh enkripsi ujung-ke-ujung (*End-to-End Encryption* / E2EE):

```
[ KLIEN REMOTE ]                                            [ HOST TERKENDALI ]
       │                                                            │
       │ 1. Kirim Public Key Asimetris (Klien Ephemeral PubKey)    │
       ├───────────────────────────────────────────────────────────►│
       │                                                            │
       │ 2. Balas dengan Public Key Host (Host Ephemeral PubKey)    │
       │◄───────────────────────────────────────────────────────────┤
       │                                                            │
 [ Kalkulasi ECDH ]                                          [ Kalkulasi ECDH ]
   (X25519 Diffie-Hellman)                                     (X25519 Diffie-Hellman)
       │                                                            │
       ▼                                                            ▼
 [ Shared Session Key ] ═════════════════════════════════════► [ Shared Session Key ]
 (ChaCha20-Poly1305)                                          (ChaCha20-Poly1305)
```

1. **X25519 Elliptic-Curve Diffie-Hellman (ECDH):**
   - Menghasilkan symmetric shared key tanpa pernah mentransmisikan kunci rahasia tersebut melalui jaringan.
2. **Authenticated Symmetric Cipher (ChaCha20-Poly1305):**
   - Setiap paket media (video, audio, input, file chunk) membawa 12-byte nonce unik dan 16-byte Poly1305 authentication tag untuk menjamin integritas data serta mencegah *tampering* atau *replay attack*.
3. **Zero-Knowledge Relay Server (`hbbr`):**
   - Server relay hanya bertindak sebagai pipa pengalir biner terenkripsi (*encrypted passthrough*). Tanpa shared key, relay tidak dapat melihat konten yang dialirkan.

---

## 2. Model Autentikasi Kredensial

### 2.1 Dynamic One-Time Password
- Dihasilkan secara acak di sisi host setiap kali aplikasi dimulai atau setelah sesi remote berakhir.
- Format default: Alfanumerik berkekuatan tinggi (6 hingga 10 karakter).
- Mencegah akses berulang tanpa otorisasi baru dari pemilik komputer.

### 2.2 Permanent Password (Unattended Access)
- Digunakan untuk mengelola workstation atau server tanpa kehadiran operator lokal.
- Kredensial disimpan dalam bentuk salted hash menggunakan algoritma resisten brute-force.
- File konfigurasi tidak pernah menyimpan plaintext password.

### 2.3 Anti-Brute-Force & Lockout Policy
- Percobaan password yang salah dicatat:
  - 3 kali berturut-turut: Delay eksekusi 5 detik.
  - 5 kali berturut-turut: Lockout 30 detik.
  - > 10 kali berturut-turut: IP diblokir sementara selama 10 menit dengan log peringatan keamanan tingkat tinggi.

---

## 3. Matriks Permission Gates & Penegakan Izin

Host memiliki kontrol mutlak untuk memberikan atau mencabut izin berikut secara dinamis:

| Permission Flag | Variabel Kunci (`keys.rs`) | Risiko | Dampak Jika Dicabut |
|---|---|---|---|
| **Display View** | `OPTION_ENABLE_VIEW` | Low | Klien tidak menerima streaming video |
| **Input Injection** | `OPTION_ENABLE_INPUT` | Medium | Klien hanya dapat melihat layar (view-only) |
| **File Transfer** | `OPTION_ENABLE_FILE_TRANSFER` | High | Akses modul browser file ditolak |
| **Clipboard Sync** | `OPTION_ENABLE_CLIPBOARD` | Medium | Sinkronisasi copy/paste dinonaktifkan |
| **Audio Loopback** | `OPTION_ENABLE_AUDIO` | Low | Stream suara host dimatikan |
| **TCP Tunneling** | `OPTION_ENABLE_TUNNEL` | High | Port forwarding ke localhost dilarang |
| **UAC Elevation** | `OPTION_ALLOW_ELEVATION` | Critical | Operator tidak dapat mengontrol dialog Administrator |
| **Remote Reboot** | `OPTION_ALLOW_RESTART` | Critical | Tombol restart/shutdown tidak merespons |

---

## 4. Windows UAC Elevation Architecture

1. **Tantangan Session 0:**
   - Aplikasi desktop user biasa di Windows diblokir oleh OS saat berinteraksi dengan Secure Desktop (Layar UAC prompt dan layar `Ctrl+Alt+Del`).
2. **Elevated Service Daemon (`src/service.rs`):**
   - Service sistem AUDIRA Remote Desktop berjalan dengan privilese `NT AUTHORITY\SYSTEM`.
   - Melalui saluran IPC lokal terotentikasi, service ini menangkap frame Secure Desktop dan menginjeksi input mouse/keyboard yang valid atas nama sesi remote yang sah, lalu mengembalikan kendali ke proses pengguna biasa saat dialog selesai.

---

## 5. Privacy Mode & Screen Blanking

- **Display Blanking:** Mengirim perintah ke driver display target untuk mematikan monitor fisik atau menampilkan gambar overlay hitam solid tak bertuan.
- **Local Input Suppression:** Memblokir input fisik dari keyboard dan mouse lokal host untuk mencegah pihak ketiga melihat data rahasia atau mengganggu sesi perbaikan.
- **Auto-Recovery Safe Release:** Jika koneksi jaringan terputus, monitor host dan input fisik otomatis dipulihkan ke status aktif dalam waktu < 2 detik.
