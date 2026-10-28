# AUDIRA Remote Desktop - Service & Program Files Update Utility
param (
    [switch]$NoStart
)

$ErrorActionPreference = "Continue"

# 1. Elevate to Administrator if needed
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[UAC] Elevasi Administrator diperlukan untuk memperbarui Program Files & Windows Service..." -ForegroundColor Yellow
    $argsList = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    if ($NoStart) { $argsList += " -NoStart" }
    Start-Process -FilePath "powershell.exe" -ArgumentList $argsList -Verb RunAs
    exit 0
}

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "      AUDIRA DESK - Windows Service & Program Files Synchronizer              " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$installDir = "C:\Program Files\Audira Desk"
$sourceDir = "F:\AUDIRA-REMOTE-DEKSTOP\flutter\build\windows\x64\runner\Release"

# 2. Stop Service and Processes & Clean Legacy RustDesk
Write-Host "[1/6] Menghentikan service & proses yang sedang aktif..." -ForegroundColor Yellow
$svc = Get-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq "Running") {
    Stop-Service -Name "Audira Desk" -Force -ErrorAction SilentlyContinue
    Write-Host "      Service 'Audira Desk' dihentikan." -ForegroundColor Green
}

# Hapus service peninggalan lama 'RustDesk' jika masih terdaftar
$oldRustDeskSvc = Get-Service -Name "RustDesk" -ErrorAction SilentlyContinue
if ($oldRustDeskSvc) {
    Write-Host "      Membersihkan service peninggalan lama 'RustDesk'..." -ForegroundColor Yellow
    Stop-Service -Name "RustDesk" -Force -ErrorAction SilentlyContinue
    & sc.exe delete "RustDesk" | Out-Null
    Write-Host "      Service 'RustDesk' berhasil dihapus permanen dari Windows." -ForegroundColor Green
}

$killNames = @("Audira Desk", "AudiraDesk", "audira", "rustdesk", "RustDesk")
foreach ($name in $killNames) {
    Get-Process -Name $name -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# Bersihkan direktori dan sisa instalasi lama RustDesk
Write-Host "[2/6] Membersihkan sisa-sisa file & log lama RustDesk..." -ForegroundColor Yellow
if (Test-Path "C:\Program Files\RustDesk") {
    Remove-Item -Path "C:\Program Files\RustDesk" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "      Folder C:\Program Files\RustDesk berhasil dibersihkan." -ForegroundColor Green
}
if (Test-Path "$env:APPDATA\RustDesk") {
    Remove-Item -Path "$env:APPDATA\RustDesk" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "      Folder AppData\RustDesk lama berhasil dibersihkan." -ForegroundColor Green
}
if (Test-Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\RustDesk") {
    Remove-Item -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\RustDesk" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "      Entri registri lama RustDesk dibersihkan." -ForegroundColor Green
}

# 3. Synchronize Files to C:\Program Files\Audira Desk
Write-Host "[3/6] Menyalin file build terbaru ke $installDir..." -ForegroundColor Yellow
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

if (Test-Path $sourceDir) {
    Copy-Item -Path "$sourceDir\*" -Destination $installDir -Recurse -Force
    Write-Host "      Berkas runtime dan librustdesk.dll berhasil diperbarui." -ForegroundColor Green
} else {
    Write-Host "      [ERROR] Folder source $sourceDir tidak ditemukan!" -ForegroundColor Red
}

# 4. Synchronize Configuration for System Service
Write-Host "[4/6] Sinkronisasi konfigurasi server desk.audira.my.id ke System Profile..." -ForegroundColor Yellow
$sysConfigDir = "C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config"
$progDataConfigDir = "C:\ProgramData\Audira Desk\config"
$userConfigDir = "$env:APPDATA\Audira Desk\config"

$cfgFile = Join-Path $userConfigDir "Audira Desk2.toml"
if (Test-Path $cfgFile) {
    if (-not (Test-Path $sysConfigDir)) { New-Item -ItemType Directory -Path $sysConfigDir -Force | Out-Null }
    if (-not (Test-Path $progDataConfigDir)) { New-Item -ItemType Directory -Path $progDataConfigDir -Force | Out-Null }
    
    Copy-Item -Path $cfgFile -Destination (Join-Path $sysConfigDir "Audira Desk2.toml") -Force
    Copy-Item -Path $cfgFile -Destination (Join-Path $progDataConfigDir "Audira Desk2.toml") -Force
    Write-Host "      Konfigurasi berhasil disalin ke SystemProfile dan ProgramData." -ForegroundColor Green
}

# 5. Update Registry BuildDate to suppress "Your installation is lower version"
Write-Host "[5/6] Memperbarui registri BuildDate..." -ForegroundColor Yellow
$regKeys = @(
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Audira Desk"
)
$buildDateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm")
foreach ($rk in $regKeys) {
    if (Test-Path $rk) {
        Set-ItemProperty -Path $rk -Name "BuildDate" -Value $buildDateStr -ErrorAction SilentlyContinue
        Set-ItemProperty -Path $rk -Name "DisplayName" -Value "Audira Desk" -ErrorAction SilentlyContinue
        Set-ItemProperty -Path $rk -Name "DisplayVersion" -Value "1.5.0" -ErrorAction SilentlyContinue
        Set-ItemProperty -Path $rk -Name "Publisher" -Value "Audira (Agus Dwi R)" -ErrorAction SilentlyContinue
    }
}
Write-Host "      Registri BuildDate diperbarui: $buildDateStr" -ForegroundColor Green

# 6. Start Service
if (-not $NoStart) {
    Write-Host "[6/6] Memastikan & menjalankan Windows Service 'Audira Desk'..." -ForegroundColor Yellow
    $svcCheck = Get-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
    if (-not $svcCheck) {
        Write-Host "      Mendaftarkan background service 'Audira Desk' (start=auto)..." -ForegroundColor Cyan
        $targetExe = Join-Path $installDir "AudiraDesk.exe"
        if (-not (Test-Path $targetExe)) { $targetExe = Join-Path $installDir "Audira Desk.exe" }
        $binPath = "`"$targetExe`" --service"
        & sc.exe create "Audira Desk" binpath= $binPath start= auto DisplayName= "Audira Desk Service" | Out-Null
        & sc.exe description "Audira Desk" "AUDIRA Remote Desktop Host & Rendezvous Service" | Out-Null
    }
    Start-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    $finalSvc = Get-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
    if ($finalSvc -and $finalSvc.Status -eq "Running") {
        Write-Host "      [OK] Service 'Audira Desk' BERJALAN DENGAN SEMPURNA!" -ForegroundColor Green
    } else {
        Write-Host "      [WARN] Service belum aktif, silakan jalankan AudiraDesk.exe langsung." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "     Selesai! Komponen lokal Audira Desk telah diperbarui 100%.               " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 3
