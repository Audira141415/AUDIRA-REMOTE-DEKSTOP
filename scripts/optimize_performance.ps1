# Audira Desk - Performance & Realtime Optimization Profile
# Mengonfigurasi parameter koneksi Audira Desk agar berjalan seringan mungkin,
# latensi terendah (real-time P2P UDP), dan visual tetap profesional dan tajam.

$ErrorActionPreference = "Stop"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "      AUDIRA DESK - REALTIME & LOW-OVERHEAD OPTIMIZATION SETUP                " -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$appDataPath = Join-Path $env:APPDATA "Audira Desk\config"
if (-not (Test-Path $appDataPath)) {
    New-Item -ItemType Directory -Path $appDataPath -Force | Out-Null
}

$tomlFile = Join-Path $appDataPath "Audira Desk2.toml"

Write-Host "[1/3] Mengonfigurasi profil koneksi real-time ultra-ringan..." -ForegroundColor Yellow

$optimizations = @{
    "enable-directx-capture"       = "Y"       # DirectX Desktop Duplication (GPU direct frame capture < 2ms)
    "enable-hwcodec"               = "Y"       # Hardware Video Acceleration (NVENC/QSV/AMF)
    "enable-abr"                   = "Y"       # Adaptive Bitrate (ABR) - Menyesuaikan bitrate otomatis dengan RTT jaringan
    "enable-udp-punch"             = "Y"       # P2P UDP Hole Punching (Bypass relay server untuk latensi minimum)
    "enable-tcp-punch"             = "Y"       # P2P TCP Punching
    "enable-ipv6-punch"            = "Y"       # IPv6 P2P direct connection
    "allow-kcp-congestion-control" = "Y"       # KCP Congestion Control (Mencegah packet loss & jitter)
    "image_quality"                = "balanced"# Kualitas 'Balanced' (Teks tajam profesional, konsumsi bandwidth hemat)
    "view_style"                   = "adaptive"# Skala layar adaptif tanpa scrollbar
    "direct-access-port"           = "21118"   # Port LAN Direct IP
    "enable-direct-server"         = "Y"       # Mengaktifkan Direct IP access untuk koneksi LAN/VPN tanpa internet
    "custom-rendezvous-server"     = "desk.audira.my.id"
    "relay-server"                 = "desk.audira.my.id"
    "api-server"                   = "http://desk.audira.my.id:21114"
    "key"                          = "SiWmWlEqQ8xr6zvf59wKFzR4eHN5yABIydqpFouvnb8="
}

# Baca file TOML jika sudah ada
$baseContent = ""
if (Test-Path $tomlFile) {
    $existing = Get-Content $tomlFile -Raw
    # Ambil baris selain [options] dan item options lama
    if ($existing -match '(?ms)^(.*?)(?=\[options\]|\z)') {
        $baseContent = $matches[1].Trim()
    }
}

if ([string]::IsNullOrWhiteSpace($baseContent)) {
    $baseContent = @"
rendezvous_server = 'desk.audira.my.id:21116'
nat_type = 1
serial = 0
unlock_pin = ''
trusted_devices = ''
"@
}

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine($baseContent.Trim())
[void]$sb.AppendLine("")
[void]$sb.AppendLine("[options]")

foreach ($key in $optimizations.Keys | Sort-Object) {
    $val = $optimizations[$key]
    [void]$sb.AppendLine("$key = '$val'")
}

Set-Content -Path $tomlFile -Value $sb.ToString() -Encoding UTF8

Write-Host "[2/3] Konfigurasi berhasil disimpan ke:" -ForegroundColor Green
Write-Host "      $tomlFile" -ForegroundColor Gray
Write-Host ""
Write-Host "[3/3] Ringkasan Profil Performa Audira Desk:" -ForegroundColor Cyan
Write-Host "  * Screen Capture   : DirectX Desktop Duplication (GPU VRAM - < 2ms latency)" -ForegroundColor White
Write-Host "  * Video Encoding   : Hardware Acceleration (H.264 / VP9 / AV1 hwcodec)" -ForegroundColor White
Write-Host "  * Transport Net    : Prioritas P2P UDP Hole Punching (Zero Relay overhead)" -ForegroundColor White
Write-Host "  * Bandwidth Pacing : Adaptive Bitrate (ABR) + KCP Congestion Control" -ForegroundColor White
Write-Host "  * Visual Quality   : Balanced Crisp Mode (Font tajam & jernih profesional)" -ForegroundColor White
Write-Host "  * Direct LAN       : Direct IP Server aktif di port 21118 (Latency < 2ms di LAN)" -ForegroundColor White
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " Optimasi Selesai! Audira Desk kini berjalan seringan & sereal-time mungkin. " -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Cyan
