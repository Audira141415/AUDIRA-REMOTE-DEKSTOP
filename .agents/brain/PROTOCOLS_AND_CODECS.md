# PROTOCOLS & CODECS SPECIFICATION — AUDIRA Remote Desktop
> Spesifikasi Protokol Jaringan, Format Pesan Protobuf, dan Pipeline Kompresi Video/Audio.

---

## 1. Network Protocol & Rendezvous State Machine

AUDIRA Remote Desktop menggunakan protokol komunikasi berjenjang untuk memastikan konektivitas maksimum melintasi NAT bertingkat dan firewall:

```
                  [ CLIENT ]              [ RENDEZVOUS (hbbs) ]              [ HOST ]
                      │                            │                            │
                      │ 1. RegisterPeer(ID, PubKey)│                            │
                      ├───────────────────────────►│                            │
                      │                            │ 2. RegisterPeer(ID, PubKey)│
                      │                            │◄───────────────────────────┤
                      │                            │                            │
                      │ 3. RequestConnection(HostID)                            │
                      ├───────────────────────────►│                            │
                      │                            │ 4. PunchHoleRequest(ClientIP)
                      │                            ├───────────────────────────►│
                      │                            │                            │
                      │ 5. UDP Hole Punch          │ 6. UDP Hole Punch          │
                      ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
                      ▼                            │                            ▼
           [ Direct P2P Success? ]                 │                 [ Direct P2P Success? ]
                 /        \                        │                       /        \
             (YES)        (NO: Symmetric NAT)      │                   (YES)        (NO)
              /              \                     │                    /              \
             ▼                ▼                    ▼                   ▼                ▼
     [ Establish P2P ]    [ Connect Relay (hbbr) ] ════════════ [ Establish P2P ]  [ Connect Relay ]
```

### A. Tahapan Koneksi:
1. **Registrasi ID & Heartbeat:** Klien dan host secara berkala mengirimkan paket heartbeat UDP ke `hbbs` (port 21116) untuk menjaga pemetaan port NAT router tetap terbuka (*keep-alive*).
2. **Uji Tipe NAT:** Memverifikasi apakah router menggunakan Full Cone NAT, Restricted Cone NAT, Port Restricted NAT, atau Symmetric NAT.
3. **UDP Hole Punching:** Jika kedua pihak berada di belakang NAT yang kompatibel, koneksi langsung P2P terbentuk tanpa perantara.
4. **Relay Server Fallback (`hbbr`):** Jika salah satu pihak berada di belakang Symmetric NAT atau strict corporate firewall, trafik dialihkan secara otomatis ke relay server (port 21117).

---

## 2. Message Framing & Protocol Buffers (`libs/base/src/message_proto.rs`)

Seluruh pesan transport dibungkus dalam frame biner terenkripsi dengan struktur Protobuf:

| Tipe Pesan | Deskripsi Isi Paket | Prioritas Pengiriman |
|---|---|---|
| `IdExchange` | UUID perangkat, public key X25519, versi software | Highest (Handshake) |
| `AuthRequest` | Hash password, dynamic token, izin yang diminta | Highest (Handshake) |
| `VideoFrame` | Biner bitstream frame video (I-frame / P-frame), timestamp, resolusi | High (UDP/TCP streaming) |
| `AudioFrame` | Bitstream terkompresi Opus (paket 20ms) | Real-time |
| `MouseEvent` | Koordinat normalisasi (X, Y), tombol ditekan, delta scroll | Ultra-low latency |
| `KeyEvent` | Scancode tombol fisik, modifier mask (Ctrl/Alt/Shift), key-up/down | Ultra-low latency |
| `FileTransfer` | Chunk data biner (64KB–256KB), offset, digest hash | Bandwidth-limited |
| `Clipboard` | Konten teks clipboard UTF-8 atau metadata daftar file | Normal |

---

## 3. Video Codec Pipeline & Adaptive Bitrate (ABR)

### A. Matriks Dukungan Codec
| Codec | Efisiensi Kompresi | Kebutuhan CPU | Akselerasi Hardware | Rekomendasi Penggunaan |
|---|---|---|---|---|
| **AV1** | Maksimal (~30% lebih hemat dari HEVC) | Tinggi (Software) | NVENC 40-series, Intel Arc, AMD 7000 | Koneksi bandwidth rendah (< 1 Mbps) |
| **VP9** | Sangat Tinggi | Menengah | Broad hardware decode support | Default codec performa seimbang |
| **H.264 (AVC)** | Standar | Rendah | Hampir semua GPU / CPU (QuickSync, NVENC) | Mesin legacy atau workstation tanpa AV1 |
| **VP8** | Kompatibilitas luas | Sangat Rendah | Software fallback universal | Mesin virtual / CPU lama |

### B. Dynamic Rate Control & Pacing:
1. **Pendeteksian RTT & Frame Drop:** Jika RTT melompat > 100ms atau terdeteksi packet loss > 3%, bitrate encoder otomatis diturunkan.
2. **Keyframe On-Demand:** Host secara otomatis menghasilkan intra-frame (I-frame) baru saat klien mendeteksi frame korup atau perubahan resolusi mendadak.
3. **Target Framerate:** Mengunci 60 FPS pada koneksi stabil, dan otomatis melambat ke 30 FPS saat bandwidth terdegradasi.

---

## 4. Audio Codec Pipeline (Opus)

- **Frekuensi Sampling:** 48.000 Hz (48 kHz) standar high-fidelity.
- **Kanal:** Stereo / Mono dengan downsampling otomatis.
- **Frame Size:** 20 milidetik (960 sampel per paket).
- **Bitrate:** 32 kbps – 64 kbps (ultra-hemat bandwidth namun menghasilkan kualitas suara jernih).

---

## 5. Chunked File Transfer Protocol

- **Ukuran Chunk:** Default 64 KB hingga 256 KB bergantung kondisi latensi link.
- **Integritas:** Setiap chunk memiliki offset dan verifikasi digest SHA-256.
- **Resume Capability:** Jika transfer terputus di tengah jalan (misal: 70% dari 2 GB), klien cukup mengirimkan byte offset terakhir yang berhasil disimpan untuk melanjutkan transmisi tanpa mengulang dari awal.
