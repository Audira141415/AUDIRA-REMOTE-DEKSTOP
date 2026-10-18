# AUDIRA Remote Desktop - Automated GitHub Save & Push Script
param (
    [string]$Message = ""
)

$ErrorActionPreference = "Continue"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "                 AUDIRA DESK - GITHUB SAVE & PUSH UTILITY                     " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "Remote URL : https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP.git" -ForegroundColor Gray
Write-Host "Branch     : main" -ForegroundColor Gray
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $rootDir

# 1. Periksa Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git tidak ditemukan di sistem. Harap instal Git for Windows." -ForegroundColor Red
    exit 1
}

# 2. Inisialisasi jika belum
if (-not (Test-Path ".git")) {
    Write-Host "[*] Menginisialisasi repositori Git lokal..." -ForegroundColor Yellow
    git init | Out-Null
    git branch -M main | Out-Null
}

# 3. Konfigurasi Remote
$remoteUrl = "https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP.git"
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[*] Menambahkan remote origin: $remoteUrl" -ForegroundColor Gray
    git remote add origin $remoteUrl
} else {
    git remote set-url origin $remoteUrl
}

# 4. Tentukan pesan commit
if ([string]::IsNullOrWhiteSpace($Message)) {
    $defaultMsg = "Update Audira Desk v1.5.1 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $inputMsg = Read-Host "Masukkan pesan commit (Tekan Enter untuk default: '$defaultMsg')"
    if ([string]::IsNullOrWhiteSpace($inputMsg)) {
        $Message = $defaultMsg
    } else {
        $Message = $inputMsg
    }
}

# 5. Staging & Commit
Write-Host ""
Write-Host "[*] Melakukan git add (mengabaikan build cache sesuai .gitignore)..." -ForegroundColor Gray
git add .

$hasChanges = (git status --porcelain)
if ($hasChanges) {
    Write-Host "[*] Menyimpan commit: '$Message'..." -ForegroundColor Green
    git commit -m "$Message"
} else {
    Write-Host "[INFO] Tidak ada perubahan berkas baru untuk di-commit." -ForegroundColor Yellow
}

# 6. Push
git branch -M main
Write-Host ""
Write-Host "[*] Mengunggah (push) ke GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[WARN] Push pertama ditolak. Mencoba sinkronisasi (git pull --rebase origin main)..." -ForegroundColor Yellow
    git pull --rebase origin main
    Write-Host "[*] Mengulang proses push..." -ForegroundColor Cyan
    git push -u origin main
}

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "==============================================================================" -ForegroundColor Green
    Write-Host "   [SUKSES] Seluruh berkas Audira Desk berhasil di-push ke GitHub!            " -ForegroundColor Green
    Write-Host "   URL: https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP                 " -ForegroundColor White
    Write-Host "==============================================================================" -ForegroundColor Green
} else {
    Write-Host "==============================================================================" -ForegroundColor Red
    Write-Host "   [PERHATIAN] Push belum berhasil. Silakan periksa autentikasi GitHub Anda.  " -ForegroundColor Yellow
    Write-Host "==============================================================================" -ForegroundColor Red
}
