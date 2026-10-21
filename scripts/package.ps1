# AUDIRA Remote Desktop - Production Standalone Single-File Packager
# Menghasilkan file tunggal AudiraDesk.exe murni (seperti AnyDesk) tanpa dependensi luar
param (
    [switch]$Rebuild
)
$ErrorActionPreference = "Stop"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "     Audira Desk Remote Desktop - Production Standalone Single-EXE Packager   " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $rootDir

$distDir = Join-Path $rootDir "dist"
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force | Out-Null }

$standaloneExe = Join-Path $distDir "AudiraDesk-Full-Installer.exe"
$rootExe = Join-Path $rootDir "AudiraDesk-Full-Installer.exe"

# 1. Periksa apakah binary produksi sudah terkompilasi
$runnerReleaseDir = Join-Path $rootDir "flutter\build\windows\x64\runner\Release"
$runnerExe = Join-Path $runnerReleaseDir "audira.exe"
$needRebuild = $Rebuild -or (-not (Test-Path $standaloneExe))
if (-not $needRebuild -and (Test-Path $runnerExe) -and (Test-Path $standaloneExe)) {
    if ((Get-Item $runnerExe).LastWriteTime -gt (Get-Item $standaloneExe).LastWriteTime) {
        $needRebuild = $true
    }
}

if (-not $needRebuild) {
    $fSize = [math]::Round((Get-Item $standaloneExe).Length / 1MB, 2)
    Write-Host "[OK] Binary produksi full installer sudah tersedia:" -ForegroundColor Green
    Write-Host "     * File   : $standaloneExe" -ForegroundColor White
    Write-Host "     * Ukuran : $fSize MB (Full Installation)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[BUILD] Membangun binary produksi standalone via libs/portable..." -ForegroundColor Yellow
    
    # Ambil payload dari flutter release build
    $payloadDir = Join-Path $distDir "audira_payload"
    if (Test-Path $payloadDir) { Remove-Item -Path $payloadDir -Recurse -Force -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $payloadDir -Force | Out-Null
    
    if ($Rebuild -or (-not (Test-Path $runnerExe))) {
        Write-Host "[BUILD] Mengompilasi Flutter UI release terbaru (Modern Dark Enterprise)..." -ForegroundColor Cyan
        Push-Location (Join-Path $rootDir "flutter")
        try {
            & flutter build windows --release
        } catch {
            Write-Host "[WARN] flutter build windows gagal atau dilewati: $_" -ForegroundColor Yellow
        } finally {
            Pop-Location
        }
    }

    if (Test-Path $runnerReleaseDir) {
        Copy-Item -Path "$runnerReleaseDir\*" -Destination $payloadDir -Recurse -Force
        # Sinkronkan mentahan exe di root
        if (Test-Path "$runnerReleaseDir\audira.exe") {
            Copy-Item -Path "$runnerReleaseDir\audira.exe" -Destination (Join-Path $rootDir "audira.exe") -Force
        }
    } else {
        Write-Host "[WARN] Runner release belum terkompilasi di $runnerReleaseDir, menggunakan cache appdata..." -ForegroundColor Yellow
        Copy-Item -Path "$env:LOCALAPPDATA\audiradesk\*" -Destination $payloadDir -Recurse -Force
    }
    
    if (Test-Path "$payloadDir\audira.exe") {
        Copy-Item -Path "$payloadDir\audira.exe" -Destination "$payloadDir\AudiraDesk.exe" -Force
        Copy-Item -Path "$payloadDir\audira.exe" -Destination "$payloadDir\Audira Desk.exe" -Force
    }
    
    python (Join-Path $rootDir "libs\portable\generate.py") -f $payloadDir -o (Join-Path $rootDir "libs\portable") -e "AudiraDesk.exe"
    cargo build --release -p rustdesk-portable-packer
    
    $builtExe = Join-Path $rootDir "target\release\rustdesk-portable-packer.exe"
    if (Test-Path $builtExe) {
        Copy-Item -Path $builtExe -Destination $standaloneExe -Force
        Copy-Item -Path $builtExe -Destination $rootExe -Force
        Remove-Item -Path $payloadDir -Recurse -Force -ErrorAction SilentlyContinue
        # Bersihkan cache ekstraksi localappdata agar langsung menggunakan versi baru
        Remove-Item -Path "$env:LOCALAPPDATA\audiradesk" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Salin juga ke root dan folder web/dist
$webDist = Join-Path $rootDir "web\dist"
if (-not (Test-Path $webDist)) { New-Item -ItemType Directory -Path $webDist -Force | Out-Null }

if (Test-Path $standaloneExe) {
    Copy-Item -Path $standaloneExe -Destination $rootExe -Force -ErrorAction SilentlyContinue
    Copy-Item -Path $standaloneExe -Destination (Join-Path $webDist "AudiraDesk-Full-Installer.exe") -Force -ErrorAction SilentlyContinue
}

# Sign the binaries with official certificate
$signScript = Join-Path $rootDir "scripts\sign_binary.ps1"
if (Test-Path $signScript) {
    try {
        & $signScript
    } catch {
        Write-Host "[WARN] Penandatanganan sertifikat dilewati: $_" -ForegroundColor Yellow
    }
}

Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "         FILE EXE PRODUKSI SIAP DIGUNAKAN DI PC LAIN (STANDALONE)             " -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "Lokasi File : $standaloneExe" -ForegroundColor Cyan
Write-Host "Ukuran File : $([math]::Round((Get-Item $standaloneExe).Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "PETUNJUK DISTRIBUSI:" -ForegroundColor Yellow
Write-Host "  1. Ambil HANYA file '$standaloneExe' ini." -ForegroundColor White
Write-Host "  2. Kirim ke PC mana pun (via Flashdisk, WhatsApp, Telegram, Drive)." -ForegroundColor White
Write-Host "  3. Di PC lain, cukup KLIK DUA KALI file tersebut. Selesai! (Persis seperti AnyDesk)." -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
