# 🛡️ AUDIRA SIGNATURE SHIELD (Anti-Tamper & Cryptographic Authorship)

**Audira Signature Shield** adalah sistem tanda tangan digital kriptografis permanen (*immutable digital signature & anti-tamper guard*) yang dirancang khusus untuk melindungi semua aplikasi milik **Agus Dwi R (Audira)**.

Sistem ini memastikan bahwa identitas pembuat **TIDAK AKAN BISA DIHAPUS, DIGANTI, ATAU DI-REBRANDING** oleh orang lain. Jika ada orang lain yang mengambil kode sumber atau binary dan mencoba mengganti nama Anda, aplikasi akan otomatis mendeteksi modifikasi ilegal dan menolak berfungsi atau memunculkan peringatan pembajakan permanen.

---

## 🚀 1. Cara Menghasilkan Tanda Tangan untuk Aplikasi Apa Saja

Buka terminal di folder ini (`scripts/audira_shield`), lalu jalankan:

### Menggunakan Python:
```bash
python audira_signer.py generate "NAMA-APLIKASI-ANDA" [output_file.json]
```
Contoh untuk **AUDIRA-TOPUPGAME**:
```bash
python audira_signer.py generate "AUDIRA-TOPUPGAME" "f:\AUDIRA-TOPUPGAME\audira_signature.json"
```

### Menggunakan PowerShell:
```powershell
.\sign_project.ps1 -AppName "AUDIRA-TOPUPGAME" -OutputDir "f:\AUDIRA-TOPUPGAME"
```

Perintah di atas akan menghasilkan:
1. File tanda tangan `audira_signature.json`.
2. Token ringkas Base64 (bisa disalin langsung ke satu baris variabel kode).

---

## 💻 2. Cara Memasang di Berbagai Bahasa Pemrograman

### A. Untuk Aplikasi Web / Frontend / Node.js (misal: `AUDIRA-TOPUPGAME`)
Cukup salin file `verifiers/audira_shield.js` ke folder proyek web Anda:

**Di Web Browser (HTML / Vue / React):**
```html
<script src="js/audira_shield.js"></script>
<script>
  // Tempelkan token ringkas yang dihasilkan oleh audira_signer.py
  const AUDIRA_TOKEN = "eyJjcmVhdG9yIjogIkFndXMgRHdpIFIgKEF1ZGlyYSkiLC...==";
  
  // Panggil enforce() saat aplikasi dimuat:
  AudiraShield.enforce(AUDIRA_TOKEN, "AUDIRA-TOPUPGAME");
</script>
```
*Jika ada yang mengubah nama Anda di kode/token, layar browser otomatis ditutup oleh watermark merah penuh: "⚠️ PERINGATAN MODIFIKASI ILEGAL: Hak Cipta Sah Agus Dwi R (Audira)".*

**Di Node.js / Express:**
```javascript
const AudiraShield = require('./audira_shield.js');
const signature = require('./audira_signature.json');

// Jika tanda tangan dipalsukan, server otomatis mati (process.exit)
AudiraShield.enforce(signature, "AUDIRA-TOPUPGAME");
```

---

### B. Untuk Aplikasi Python (Bot Discord, AI Brain, Script, Backend)
Salin `verifiers/audira_shield.py` ke proyek Python Anda:

```python
from audira_shield import AudiraShield

# Cek tanda tangan saat startup (bisa via file json atau string token)
AudiraShield.enforce("audira_signature.json", app_name="AUDIRA-BOT-DC", on_tamper="exit")

print("Aplikasi berjalan dengan lisensi resmi Agus Dwi R (Audira).")
```

---

### C. Untuk Aplikasi PHP / Laravel (Kasir, Billing, Web Toko)
Salin `verifiers/audira_shield.php` ke proyek PHP Anda:

```php
use Audira\Shield\AudiraShield;

// Letakkan di index.php atau middleware utama
$token = "eyJjcmVhdG9yIjogIkFndXMgRHdpIFIgKEF1ZGlyYSkiLC...==";
AudiraShield::enforce($token, "AUDIRA-APLIKASI-KASIR");
```

---

### D. Untuk Aplikasi Rust / Desktop (`AUDIRA-REMOTE-DEKSTOP`)
Gunakan verifier di `verifiers/audira_shield.rs`:

```rust
use audira_shield::AudiraShield;

fn main() {
    let token = "...TOKEN_BASE64...";
    if !AudiraShield::enforce(token, Some("AUDIRA-REMOTE-DEKSTOP")) {
        panic!("Unauthorized application modification detected!");
    }
}
```

---

## 🔒 3. Mengapa Tanda Tangan Ini Tidak Bisa Hilang / Dipalsukan?

1. **HMAC-SHA256 Cryptographic Lock**:
   Tanda tangan dihitung menggunakan kunci rahasia (*Master Secret*) yang hanya diketahui oleh Anda. Orang lain tidak bisa membuat tanda tangan baru yang sah atas nama mereka sendiri tanpa kunci rahasia tersebut.

2. **Deteksi Perubahan Karakter Sekecil Apa Pun**:
   Jika orang lain mengubah 1 huruf saja (misal mengubah `"Agus Dwi R (Audira)"` menjadi nama mereka), perhitungan hash otomatis meleset dan verifikasi langsung **GAGAL** (*Invalid Signature*).

3. **Canary Hash (Bukti Hukum / HKI)**:
   Setiap token memiliki `canary_token` terenkripsi. Jika terjadi sengketa hukum atau klaim DMCA di GitHub/hosting, Anda dapat membuktikan secara matematis bahwa aplikasi tersebut dibuat oleh Anda dengan mencocokkan *seed* canary Anda.
