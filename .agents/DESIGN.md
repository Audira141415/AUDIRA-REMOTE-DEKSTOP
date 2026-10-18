# DESIGN — AUDIRA Remote Desktop

> **System:** AUDIRA Remote Desktop (Enterprise Secure Remote Access Platform)  
> **Tagline:** "Ultra-Low Latency. End-to-End Encrypted. Cross-Platform. Autonomous AI Assistance."  
> **Version:** v1.5.0  
> **Status:** Production UI/UX & Design System Specification  

---

## 1. Design Philosophy

AUDIRA Remote Desktop dirancang untuk skenario kontrol jarak jauh berdensitas tinggi, sesi pemecahan masalah kritis, dan pemantauan workstation tanpa jeda. Prinsip desain mengutamakan:
1. **Zero-Distraction Remote Immersion:** Antarmuka sesi remote tidak boleh menghalangi layar kerja yang dikendalikan. Toolbar harus bersifat auto-hide, semi-transparan, atau floating dengan akses cepat 1-klik.
2. **Cyber Dark First (`#0B0F17`):** Menjamin kenyamanan visual operator IT selama berjam-jam pemantauan, mengurangi konsumsi daya pada layar OLED, dan menghadirkan estetika enterprise modern.
3. **Instant Latency & Quality Telemetry:** Operator harus mengetahui kualitas jalur koneksi secara seketika melalui HUD pill status (`🟢 12ms | 60 FPS | 3.2 Mbps | Direct P2P`).
4. **Unambiguous Permission & Security Gates:** Setiap dialog otorisasi (akses keyboard/mouse, transfer file, elevasi hak administrator UAC) menyajikan visual cue tegas dan kontras tinggi.

---

## 2. Color System & Design Tokens

### A. Surface & Canvas Colors
| Token | Hex | Penggunaan di Flutter UI |
|---|---|---|
| `bg-canvas` | `#0B0F17` | Latar belakang jendela utama aplikasi & remote viewport |
| `bg-surface` | `#131926` | Card daftar perangkat, recent sessions, panel address book |
| `bg-elevated` | `#1C2538` | Floating toolbar remote, dialog konfirmasi, modal pengaturan |
| `border-subtle` | `#232F47` | Garis pemisah hairline, border input field, table dividers |
| `border-focus` | `#00D2FF` | Active input ring, selected session tab, highlighted control |

### B. Brand & Interaction Accents
| Token | Hex | Penggunaan di Flutter UI |
|---|---|---|
| `primary-cyan` | `#00D2FF` | Aksen brand utama, tombol connect, indikator P2P aktif |
| `accent-blue` | `#3B82F6` | Tombol sekunder, link navigasi, file transfer indicator |
| `accent-ai-indigo`| `#6366F1` | Badge AI Diagnostics, Copilot smart troubleshooting |

### C. Connection & Health Semantic Colors
| Status | Hex | Visual Pill | Arti Operasional |
|---|---|---|---|
| **P2P DIRECT (Optimal)** | `#10B981` | `🟢 10-25ms` | Koneksi langsung UDP P2P aktif, latensi ultra-rendah |
| **RELAY (Good)** | `#06B6D4` | `🔵 30-70ms` | Trafik melalui encrypted relay server, kualitas stabil |
| **DEGRADED / HIGH RTT** | `#F59E0B` | `🟡 >80ms / Loss` | Latency tinggi atau packet loss > 2%, codec auto-throttled |
| **DISCONNECTED / CRIT** | `#EF4444` | `🔴 Disconnected` | Sesi terputus, peer unreachable, atau autentikasi ditolak |

---

## 3. Remote Session Toolbar & HUD Layout

Toolbar sesi remote dirancang ramping di bagian atas viewport remote desktop:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [● ID: 892-120-441] [🟢 16ms | 60 FPS | 2.8 MB/s | Direct P2P] [🖥️ Disp 1 ▾] [⚡ Auto ▾] │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ [📁 File Transfer] [🔒 Privacy Mode] [⚡ Ctrl+Alt+Del] [💬 Chat (1)] [⚙️ Adjust] [❌ End]  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Session Telemetry Pill:** Menampilkan indikator kesehatan real-time (RTT latensi, FPS aktual, throughput bitrate, dan status P2P vs Relay).
2. **Display Switcher Dropdown:** Pilihan cepat antar monitor target jika host memiliki konfigurasi multi-monitor.
3. **Codec & Quality Preset Switcher:**
   - *Auto (Adaptive):* Menyesuaikan bitrate dan framerate otomatis terhadap kondisi bandwidth.
   - *Speed:* Memprioritaskan respons input (bitrate rendah, frame rate stabil).
   - *Balanced:* Keseimbangan optimal untuk pekerjaan administratif.
   - *Quality:* Preservasi detail warna penuh (4:4:4 color fidelity) untuk desainer atau analisis grafis.
4. **Privacy Mode Button:** Memberikan visual indicator kuning berpendar saat monitor fisik host sedang dalam status dimatikan/digelapkan untuk menjaga kerahasiaan.

---

## 4. File Transfer Split-Panel Interface

Window file transfer (`libs/base/src/fs.rs`) menyajikan layout dual-pane:
- **Left Pane (Local Workstation):** Pohon direktori lokal, drive letter, search bar, list file dengan ukuran & tanggal modifikasi.
- **Center Action Bar:** Tombol transfer bidirectional `[ ➔ Send ]` dan `[ ⬅ Receive ]` dengan progress bar persentase, transfer speed (MB/s), dan estimasi waktu tersisa (ETA).
- **Right Pane (Remote Host):** Pohon direktori remote host dengan indikator izin baca/tulis.
- **Visual Alerting:** Peringatan visual tegas jika mencoba mengakses direktori terproteksi sistem atau jika kuota disk target tidak mencukupi.

---

## 5. Mobile & Tablet Touch Ergonomics (Flutter Mobile)

1. **Dual Interaction Modes:**
   - *Touch Mode:* Layar berfungsi selayaknya touchscreen (tap = klik kiri, long-press = klik kanan).
   - *Trackpad Mode:* Layar menjadi touchpad virtual dengan kursor mouse yang presisi untuk navigasi target UI kecil pada desktop remote.
2. **Floating Radial Quick-Menu:** Tombol melayang semi-transparan yang dapat dipindahkan ke sudut mana pun untuk memunculkan tombol keyboard khusus (Esc, Tab, Ctrl, Alt, Windows, Delete) dan navigasi cepat.
