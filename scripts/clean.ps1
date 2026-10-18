# AUDIRA Remote Desktop - Disk Space Reclamation & Build Cache Cleaner
$ErrorActionPreference = "Continue"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "     AUDIRA Remote Desktop - Disk Space Reclamation & Cache Cleaner          " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $rootDir

# 1. Analisis Penggunaan Ruang Disk
Write-Host "[ANALISIS] Menghitung ukuran folder dalam repositori..." -ForegroundColor Yellow

function Get-DirSizeMB($path) {
    if (-not (Test-Path $path)) { return 0 }
    $size = (Get-ChildItem -Path $path -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if (-not $size) { return 0 }
    return [math]::Round($size / 1MB, 2)
}

$targetDebugMB = Get-DirSizeMB (Join-Path $rootDir "target\debug")
$targetReleaseMB = Get-DirSizeMB (Join-Path $rootDir "target\release")
$toolsMB = Get-DirSizeMB (Join-Path $rootDir "tools")
$flutterMB = Get-DirSizeMB (Join-Path $rootDir "flutter")

$totalTargetGB = [math]::Round(($targetDebugMB + $targetReleaseMB) / 1024, 2)

Write-Host "  * target\debug   (Cache Debug Cargo)   : $([math]::Round($targetDebugMB / 1024, 2)) GB ($targetDebugMB MB)" -ForegroundColor Red
Write-Host "  * target\release (Cache Release Cargo) : $([math]::Round($targetReleaseMB / 1024, 2)) GB ($targetReleaseMB MB)" -ForegroundColor Yellow
Write-Host "  * tools          (Installer & SDK)     : $([math]::Round($toolsMB / 1024, 2)) GB ($toolsMB MB)" -ForegroundColor Yellow
Write-Host "  * flutter        (Cache Flutter)       : $([math]::Round($flutterMB / 1024, 2)) GB ($flutterMB MB)" -ForegroundColor Gray
Write-Host "------------------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "  * TOTAL ESTIMASI RUANG BISA DIHEMAT    : ~$totalTargetGB GB+" -ForegroundColor Green
Write-Host ""
Write-Host "[PENTING] Binary aplikasi 'audira.exe' utama (~32 MB) akan TETAP DIJAGA AMAN!" -ForegroundColor Green
Write-Host ""

Write-Host "Pilih opsi pembersihan disk:" -ForegroundColor Cyan
Write-Host "  [1] Bersihkan Cache Debug Saja (Hapus target\debug -> Hemat ~9.5 GB) [Rekomendasi Cepat]" -ForegroundColor Green
Write-Host "  [2] Bersihkan Semua Cache Kompilasi (Hapus folder target -> Hemat ~13.3 GB)" -ForegroundColor White
Write-Host "  [3] Bersihkan Installer Mentah di tools/ (Hapus .exe & .zip installer -> Hemat ~565 MB)" -ForegroundColor White
Write-Host "  [4] Pembersihan Total Maksimal (Debug + Release Cache + Installer Tools -> Hemat 14+ GB)" -ForegroundColor Yellow
Write-Host "  [5] Batal" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Masukkan pilihan Anda [1-5] (Default: 1)"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

# Pastikan audira.exe di root dicadangkan jika belum ada
$rootExe = Join-Path $rootDir "audira.exe"
$releaseExe = Join-Path $rootDir "target\release\audira.exe"
if (-not (Test-Path $rootExe) -and (Test-Path $releaseExe)) {
    Write-Host "[BACKUP] Menyalin target\release\audira.exe ke root agar aplikasi tetap bisa jalan..." -ForegroundColor Cyan
    Copy-Item $releaseExe $rootExe -Force
}

switch ($choice) {
    "1" {
        Write-Host "[CLEAN] Menghapus target\debug..." -ForegroundColor Cyan
        $debugDir = Join-Path $rootDir "target\debug"
        if (Test-Path $debugDir) {
            Remove-Item -Path $debugDir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "[SUCCESS] target\debug berhasil dibersihkan! Menghemat ~$([math]::Round($targetDebugMB / 1024, 2)) GB." -ForegroundColor Green
        } else {
            Write-Host "[INFO] target\debug sudah bersih." -ForegroundColor Gray
        }
    }
    
    "2" {
        Write-Host "[CLEAN] Menghapus seluruh folder target..." -ForegroundColor Cyan
        $targetDir = Join-Path $rootDir "target"
        if (Test-Path $targetDir) {
            Remove-Item -Path $targetDir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "[SUCCESS] Seluruh folder target dibersihkan! Menghemat ~$totalTargetGB GB." -ForegroundColor Green
        }
    }
    
    "3" {
        Write-Host "[CLEAN] Menghapus installer besar di tools/..." -ForegroundColor Cyan
        $toolsDir = Join-Path $rootDir "tools"
        $filesToClean = @(
            (Join-Path $toolsDir "LLVM-18.1.8-win64.exe"),
            (Join-Path $toolsDir "llvm.zip"),
            (Join-Path $toolsDir "flutter_rust_bridge_codegen.zip")
        )
        foreach ($file in $filesToClean) {
            if (Test-Path $file) {
                $fSize = [math]::Round((Get-Item $file).Length / 1MB, 2)
                Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
                Write-Host "  [-] Menghapus $(Split-Path $file -Leaf) ($fSize MB)" -ForegroundColor Green
            }
        }
        Write-Host "[SUCCESS] File installer mentah berhasil dibersihkan!" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "[CLEAN] Melakukan pembersihan menyeluruh (Deep Clean)..." -ForegroundColor Yellow
        
        # 1. Hapus target
        $targetDir = Join-Path $rootDir "target"
        if (Test-Path $targetDir) {
            Write-Host "  [-] Menghapus direktori target (~$totalTargetGB GB)..." -ForegroundColor Cyan
            Remove-Item -Path $targetDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # 2. Hapus installer zip / exe di tools
        $toolsDir = Join-Path $rootDir "tools"
        $filesToClean = @(
            (Join-Path $toolsDir "LLVM-18.1.8-win64.exe"),
            (Join-Path $toolsDir "llvm.zip"),
            (Join-Path $toolsDir "flutter_rust_bridge_codegen.zip")
        )
        foreach ($file in $filesToClean) {
            if (Test-Path $file) {
                Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
            }
        }
        
        # 3. Hapus flutter intermediate artifacts jika ada
        $flutterBuild = Join-Path $rootDir "flutter\build"
        if (Test-Path $flutterBuild) {
            Remove-Item -Path $flutterBuild -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        Write-Host ""
        Write-Host "[SUCCESS] Pembersihan total selesai! Ruang penyimpanan Anda telah dipulihkan (hemat ~14 GB+)." -ForegroundColor Green
    }
    
    default {
        Write-Host "Pembersihan dibatalkan." -ForegroundColor Gray
        exit 0
    }
}

Write-Host ""
Write-Host "Executable AUDIRA siap pakai tetap tersedia di: $(Join-Path $rootDir 'audira.exe')" -ForegroundColor Green
Write-Host "Anda dapat menjalankannya kapan saja melalui 'start.bat' atau 'install.bat'." -ForegroundColor White
Write-Host ""
