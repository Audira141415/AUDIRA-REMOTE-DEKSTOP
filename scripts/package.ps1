# AUDIRA Remote Desktop - Production Standalone Single-File Packager
# Menghasilkan file tunggal AudiraDesk.exe murni (seperti AnyDesk) tanpa dependensi luar
$ErrorActionPreference = "Stop"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "     Audira Desk Remote Desktop - Production Standalone Single-EXE Packager   " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $rootDir

$distDir = Join-Path $rootDir "dist"
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force | Out-Null }

$standaloneExe = Join-Path $distDir "AudiraDesk-v1.5.0-x86_64.exe"
$rootExe = Join-Path $rootDir "AudiraDesk.exe"

# 1. Periksa apakah binary produksi sudah terkompilasi
if (Test-Path $standaloneExe) {
    $fSize = [math]::Round((Get-Item $standaloneExe).Length / 1MB, 2)
    Write-Host "[OK] Binary produksi standalone sudah tersedia:" -ForegroundColor Green
    Write-Host "     * File   : $standaloneExe" -ForegroundColor White
    Write-Host "     * Ukuran : $fSize MB (Single-File Standalone murni seperti AnyDesk!)" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[BUILD] Membangun binary produksi standalone via libs/portable..." -ForegroundColor Yellow
    
    # Siapkan staging payload jika belum ada
    $payloadDir = Join-Path $distDir "audira_payload"
    if (-not (Test-Path $payloadDir)) {
        New-Item -ItemType Directory -Path $payloadDir -Force | Out-Null
        Copy-Item -Path "$env:LOCALAPPDATA\rustdesk\*" -Destination $payloadDir -Recurse -Force
        if (Test-Path "$payloadDir\rustdesk.exe") {
            Rename-Item -Path "$payloadDir\rustdesk.exe" -NewName "AudiraDesk.exe" -Force
        }
    }
    
    python (Join-Path $rootDir "libs\portable\generate.py") -f $payloadDir -o (Join-Path $rootDir "libs\portable") -e "AudiraDesk.exe"
    
    $builtExe = Join-Path $rootDir "target\release\rustdesk-portable-packer.exe"
    if (Test-Path $builtExe) {
        Copy-Item -Path $builtExe -Destination $standaloneExe -Force
        Copy-Item -Path $builtExe -Destination $rootExe -Force
        Remove-Item -Path $payloadDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Salin juga ke root jika belum
if (Test-Path $standaloneExe) {
    Copy-Item -Path $standaloneExe -Destination $rootExe -Force -ErrorAction SilentlyContinue
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
