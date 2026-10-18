# AUDIRA Remote Desktop - Desktop PC Launcher
param (
    [switch]$Install,
    [switch]$Clean
)

$ErrorActionPreference = "Continue"

if ($Install) {
    & (Join-Path $PSScriptRoot "install.ps1")
    exit 0
}

if ($Clean) {
    & (Join-Path $PSScriptRoot "clean.ps1")
    exit 0
}

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "     _   _   _ ____ ___ ____     _      ____  _____ __  __  ___ _____ _____ " -ForegroundColor Cyan
Write-Host "    / \ | | | |  _ \_ _|  _ \   / \    |  _ \| ____|  \/  |/ _ \_   _| ____|" -ForegroundColor Cyan
Write-Host "   / _ \| | | | | | | || |_) | / _ \   | |_) |  _| | |\/| | | | || | |  _|  " -ForegroundColor Cyan
Write-Host "  / ___ \ |_| | |_| | ||  _ < / ___ \  |  _ <| |___| |  | | |_| || | | |___ " -ForegroundColor Cyan
Write-Host " /_/   \_\___/|____/___|_| \_\/_/   \_\ |_| \_\_____|_|  |_|\___/ |_| |_____|" -ForegroundColor Cyan
Write-Host "               ____  _____ ____  _  _______ ___  ____                       " -ForegroundColor Cyan
Write-Host "              |  _ \| ____/ ___|| |/ /_   _/ _ \|  _ \                      " -ForegroundColor Cyan
Write-Host "              | | | |  _| \___ \| ' /  | || | | | |_) |                     " -ForegroundColor Cyan
Write-Host "              | |_| | |___ ___) | . \  | || |_| |  __/                      " -ForegroundColor Cyan
Write-Host "              |____/|_____|____/|_|\_\ |_| \___/|_|                         " -ForegroundColor Cyan
Write-Host ""
Write-Host "     Audira Desk - Ultra-Low Latency. End-to-End Encrypted.      " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $rootDir

# 1. Periksa apakah proses Audira Desk sudah berjalan
$runningProcesses = Get-Process -Name "AudiraDesk", "audira", "rustdesk", "RustDesk" -ErrorAction SilentlyContinue
if ($runningProcesses) {
    Write-Host "[INFO] Audira Desk terdeteksi sudah berjalan (PID: $($runningProcesses.Id -join ', '))." -ForegroundColor Yellow
    Write-Host "Membuka jendela baru atau fokus ke aplikasi yang sudah berjalan..." -ForegroundColor Gray
}

# 2. Periksa keberadaan binary executable Audira Desk yang sudah terkompilasi
$potentialBinaries = @(
    (Join-Path $rootDir "dist\AudiraDesk-v1.5.0-x86_64.exe"),
    (Join-Path $rootDir "AudiraDesk.exe"),
    (Join-Path $rootDir "flutter\build\windows\x64\runner\Release\audira.exe"),
    "C:\Program Files\Audira Desk\AudiraDesk.exe",
    (Join-Path $rootDir "audira.exe")
)

$foundBinary = $null
foreach ($bin in $potentialBinaries) {
    if (Test-Path $bin) {
        $foundBinary = $bin
        break
    }
}

if ($foundBinary) {
    # Pastikan dependensi runtime (sciter.dll) tersedia jika menggunakan binary Sciter UI
    $binDir = Split-Path -Parent $foundBinary
    $sciterDll = Join-Path $binDir "sciter.dll"
    $rootSciter = Join-Path $rootDir "sciter.dll"
    if (-not (Test-Path $sciterDll) -and -not ($foundBinary -like "*flutter*")) {
        if (Test-Path $rootSciter) {
            Copy-Item $rootSciter $sciterDll -Force
        } else {
            Write-Host "[INFO] Mengunduh runtime sciter.dll yang dibutuhkan..." -ForegroundColor Yellow
            try {
                [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                (New-Object System.Net.WebClient).DownloadFile("https://raw.githubusercontent.com/c-smile/sciter-sdk/master/bin.win/x64/sciter.dll", $sciterDll)
                if (Test-Path $sciterDll) {
                    Copy-Item $sciterDll $rootSciter -Force
                }
            } catch {
                Write-Host "[WARN] Gagal mengunduh sciter.dll secara otomatis: $_" -ForegroundColor Red
            }
        }
    }

    Write-Host "[START] Ditemukan executable: $foundBinary" -ForegroundColor Green
    Write-Host "Meluncurkan AUDIRA Remote Desktop PC Client..." -ForegroundColor Cyan
    Start-Process -FilePath $foundBinary
    Write-Host "[SUCCESS] Aplikasi berhasil diluncurkan!" -ForegroundColor Green
    exit 0
}

# 3. Jika belum ada binary yang terkompilasi, tampilkan opsi build & run
Write-Host "[INFO] Binary executable belum dikompilasi di direktori lokal." -ForegroundColor Yellow
Write-Host "Memeriksa perangkat pengembang yang tersedia..." -ForegroundColor Gray

$hasFlutter = Get-Command "flutter" -ErrorAction SilentlyContinue
$hasCargo = Get-Command "cargo" -ErrorAction SilentlyContinue
$hasPython = Get-Command "python" -ErrorAction SilentlyContinue

Write-Host "  * Rust / Cargo : $(if ($hasCargo) { '[TERSEDIA]' } else { '[TIDAK DITEMUKAN]' })" -ForegroundColor $(if ($hasCargo) { 'Green' } else { 'Red' })
Write-Host "  * Flutter SDK  : $(if ($hasFlutter) { '[TERSEDIA]' } else { '[TIDAK DITEMUKAN]' })" -ForegroundColor $(if ($hasFlutter) { 'Green' } else { 'Red' })
Write-Host "  * Python       : $(if ($hasPython) { '[TERSEDIA]' } else { '[TIDAK DITEMUKAN]' })" -ForegroundColor $(if ($hasPython) { 'Green' } else { 'Yellow' })
Write-Host ""

Write-Host "Pilih metode untuk menjalankan aplikasi:" -ForegroundColor Cyan
Write-Host "  [1] Unduh & Jalankan Binary Siap Pakai v1.5.0 (Paling Cepat / Langsung Jalan)" -ForegroundColor Green
Write-Host "  [2] Jalankan via UI Flutter Desktop (flutter run -d windows)" -ForegroundColor White
Write-Host "  [3] Kompilasi Paket Release Lengkap (python build.py --hwcodec)" -ForegroundColor White
Write-Host "  [4] Jalankan Backend Rust Debug (cargo run)" -ForegroundColor White
Write-Host "  [5] Keluar" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Masukkan pilihan Anda [1-5] (Default: 1)"
if ([string]::IsNullOrWhiteSpace($choice)) {
    $choice = "1"
}

switch ($choice) {
    "1" {
        $targetExe = Join-Path $rootDir "AudiraDesk.exe"
        $downloadUrl = "http://192.168.100.175:5050/dist/AudiraDesk-v1.5.0-x86_64.exe"
        Write-Host "[DOWNLOAD] Mengunduh binary resmi AUDIRA Remote Desktop v1.5.0..." -ForegroundColor Cyan
        Write-Host "Sumber: $downloadUrl" -ForegroundColor Gray
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($downloadUrl, $targetExe)
            Write-Host "[SUCCESS] Berhasil mengunduh $targetExe!" -ForegroundColor Green
            Write-Host "Meluncurkan aplikasi..." -ForegroundColor Cyan
            Start-Process -FilePath $targetExe
            exit 0
        } catch {
            Write-Host "[WARN] Gagal dari server lokal, mencoba unduh dari GitHub Releases..." -ForegroundColor Yellow
            $fallbackUrl = "https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP/releases/download/v1.5.0/AudiraDesk-v1.5.0-x86_64.exe"
            try {
                $webClient.DownloadFile($fallbackUrl, $targetExe)
                Write-Host "[SUCCESS] Berhasil mengunduh $targetExe dari GitHub!" -ForegroundColor Green
                Start-Process -FilePath $targetExe
                exit 0
            } catch {
                Write-Host "[ERROR] Gagal mengunduh binary: $_" -ForegroundColor Red
                Read-Host "Tekan Enter untuk keluar..."
                exit 1
            }
        }
    }
    "2" {
        if (-not $hasFlutter) {
            Write-Host "[ERROR] Flutter SDK tidak ditemukan di PATH sistem!" -ForegroundColor Red
            Read-Host "Tekan Enter untuk keluar..."
            exit 1
        }
        Write-Host "[LAUNCH] Menjalankan Flutter Desktop Windows..." -ForegroundColor Green
        Set-Location (Join-Path $rootDir "flutter")
        flutter pub get
        flutter run -d windows
    }
    "3" {
        if (-not $hasPython) {
            Write-Host "[ERROR] Python tidak ditemukan di PATH sistem!" -ForegroundColor Red
            Read-Host "Tekan Enter untuk keluar..."
            exit 1
        }
        Write-Host "[BUILD] Mengompilasi paket release via build.py..." -ForegroundColor Green
        python build.py --hwcodec
    }
    "4" {
        if (-not $hasCargo) {
            Write-Host "[ERROR] Cargo tidak ditemukan di PATH sistem!" -ForegroundColor Red
            Read-Host "Tekan Enter untuk keluar..."
            exit 1
        }
        Write-Host "[CARGO] Menjalankan cargo run..." -ForegroundColor Green
        cargo run
    }
    default {
        Write-Host "Dibatalkan oleh pengguna." -ForegroundColor Gray
        exit 0
    }
}
