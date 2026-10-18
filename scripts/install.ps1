# AUDIRA Remote Desktop - Automated Windows Installer
# Requires Administrator privileges for system service & Program Files setup
param (
    [switch]$Silent,
    [switch]$ServiceOnly,
    [switch]$Gui,
    [string]$InstallPath = "$env:ProgramFiles\Audira Desk"
)

$ErrorActionPreference = "Continue"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "            AUDIRA DESK - Windows System Installer Script                     " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Periksa Hak Akses Administrator (Elevate if needed)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[UAC] Hak akses Administrator diperlukan untuk menginstal ke Program Files & Service Windows." -ForegroundColor Yellow
    Write-Host "Membuka prompt persetujuan Administrator (UAC)..." -ForegroundColor Gray
    
    $argsList = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    if ($Silent) { $argsList += " -Silent" }
    if ($ServiceOnly) { $argsList += " -ServiceOnly" }
    if ($Gui) { $argsList += " -Gui" }
    
    try {
        Start-Process -FilePath "powershell.exe" -ArgumentList $argsList -Verb RunAs
        exit 0
    } catch {
        Write-Host ""
        Write-Host "[ERROR] Gagal meminta elevasi otomatis: $_" -ForegroundColor Red
        Write-Host "Silakan klik kanan pada 'install.bat' dan pilih 'Run as administrator'." -ForegroundColor Yellow
        Write-Host ""
        if (-not $Silent) { Read-Host "Tekan Enter untuk keluar..." }
        exit 1
    }
}

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $rootDir

# 2. Cari Binary Audira Desk Executable
$potentialBinaries = @(
    (Join-Path $rootDir "AudiraDesk.exe"),
    (Join-Path $rootDir "dist\AudiraDesk-v1.5.0-x86_64.exe"),
    (Join-Path $rootDir "dist\AUDIRA-v1.5.0-x86_64.exe"),
    (Join-Path $rootDir "AUDIRA.exe"),
    (Join-Path $rootDir "audira.exe"),
    (Join-Path $rootDir "target\release\audira.exe"),
    (Join-Path $rootDir "rustdesk.exe")
)

$srcExe = $null
foreach ($bin in $potentialBinaries) {
    if (Test-Path $bin) {
        $srcExe = $bin
        break
    }
}

if (-not $srcExe) {
    Write-Host "[ERROR] Binary 'AudiraDesk.exe' tidak ditemukan!" -ForegroundColor Red
    Write-Host "Silakan kompilasi atau jalankan package.ps1 terlebih dahulu." -ForegroundColor Yellow
    Read-Host "Tekan Enter untuk keluar..."
    exit 1
}

Write-Host "[INFO] Menggunakan executable sumber: $srcExe" -ForegroundColor Green
$exeSizeMB = [math]::Round((Get-Item $srcExe).Length / 1MB, 2)
Write-Host "       Ukuran binary mandiri: $exeSizeMB MB" -ForegroundColor Gray
Write-Host ""

# 3. Mode Menu Interaktif jika tidak ada flag switch
if (-not $Silent -and -not $ServiceOnly -and -not $Gui) {
    Write-Host "Pilih metode instalasi Audira Desk:" -ForegroundColor Cyan
    Write-Host "  [1] Instal Lengkap Sistem (Program Files + Service + Shortcut + Firewall) [Rekomendasi]" -ForegroundColor Green
    Write-Host "  [2] Buka GUI Wizard Installer Resmi Audira Desk (Interaktif)" -ForegroundColor White
    Write-Host "  [3] Hanya Instal / Perbaiki Background Service Windows" -ForegroundColor White
    Write-Host "  [4] Uninstall Audira Desk dari Sistem" -ForegroundColor Yellow
    Write-Host "  [5] Batal" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Masukkan pilihan Anda [1-5] (Default: 1)"
    if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }
} elseif ($Gui) {
    $choice = "2"
} elseif ($ServiceOnly) {
    $choice = "3"
} else {
    $choice = "1"
}

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "=== Memulai Instalasi Sistem Audira Desk ===" -ForegroundColor Cyan
        
        # A. Buat Direktori Instalasi C:\Program Files\Audira Desk
        if (-not (Test-Path $InstallPath)) {
            Write-Host "[1/7] Membuat folder: $InstallPath..." -ForegroundColor Gray
            New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
        }
        
        # B. Hentikan proses yang berjalan sebelum menimpa file
        Write-Host "[2/7] Memeriksa & menghentikan proses Audira Desk yang aktif..." -ForegroundColor Gray
        & (Join-Path $PSScriptRoot "stop.ps1") | Out-Null
        
        # C. Salin Seluruh Bundel Runtime Lengkap (Engine, Plugins, DLL, Drivers)
        Write-Host "[3/7] Menyalin seluruh berkas aplikasi ke $InstallPath..." -ForegroundColor Gray
        $bundleSources = @(
            "C:\Program Files\RustDesk",
            "$env:LOCALAPPDATA\audiradesk",
            (Join-Path $rootDir "dist\audira_payload")
        )
        
        $bundleCopied = $false
        foreach ($bSrc in $bundleSources) {
            if (Test-Path $bSrc) {
                Write-Host "      Menyalin runtime bundle dari: $bSrc" -ForegroundColor Gray
                Copy-Item -Path "$bSrc\*" -Destination $InstallPath -Recurse -Force
                $bundleCopied = $true
                break
            }
        }
        
        # Pastikan AudiraDesk.exe utama disalin
        $destExe = Join-Path $InstallPath "AudiraDesk.exe"
        if (Test-Path $srcExe) {
            Copy-Item -Path $srcExe -Destination $destExe -Force
        }
        
        # Bersihkan direktori legacy C:\Program Files\RustDesk jika ada
        $legacyDir = "C:\Program Files\RustDesk"
        if ((Test-Path $legacyDir) -and ($InstallPath -ne $legacyDir)) {
            Write-Host "      Membersihkan direktori sisa instalasi lama di $legacyDir..." -ForegroundColor Gray
            Remove-Item -Path $legacyDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # Hapus shortcut uninstall lama jika ikut tersalin
        $legacyLnk = Join-Path $InstallPath "Uninstall RustDesk.lnk"
        if (Test-Path $legacyLnk) { Remove-Item -Path $legacyLnk -Force -ErrorAction SilentlyContinue }
        
        # Bersihkan sisa shortcut legacy RustDesk di Desktop & Start Menu
        $legacyDesktopLnk = "C:\Users\Public\Desktop\RustDesk.lnk"
        if (Test-Path $legacyDesktopLnk) { [System.IO.File]::Delete($legacyDesktopLnk) }
        $legacyStartMenu = "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\RustDesk"
        if (Test-Path $legacyStartMenu) { Remove-Item -Path $legacyStartMenu -Recurse -Force -ErrorAction SilentlyContinue }
        
        $srcSciter = Join-Path $rootDir "sciter.dll"
        if (Test-Path $srcSciter) {
            Copy-Item -Path $srcSciter -Destination (Join-Path $InstallPath "sciter.dll") -Force
        }
        
        # D. Daftarkan Service Background Windows
        Write-Host "[4/7] Mendaftarkan Windows Background Service..." -ForegroundColor Gray
        try {
            $serviceProcess = Start-Process -FilePath $destExe -ArgumentList "--install-service" -Wait -PassThru -NoNewWindow
            Write-Host "      Service terdaftar dengan kode keluar: $($serviceProcess.ExitCode)" -ForegroundColor Green
        } catch {
            Write-Host "      [WARN] Gagal mendaftarkan service langsung: $_" -ForegroundColor Yellow
        }
        
        # E. Buat Desktop & Start Menu Shortcut di Semua Lokasi (Public, User, OneDrive)
        Write-Host "[5/7] Membuat pintasan (Shortcut) Desktop & Start Menu..." -ForegroundColor Gray
        try {
            $wshShell = New-Object -ComObject WScript.Shell
            
            # Kumpulkan semua kemungkinan lokasi Desktop pengguna
            $desktopLocations = @(
                [Environment]::GetFolderPath("CommonDesktopDirectory"),
                [Environment]::GetFolderPath("Desktop")
            )
            
            # Cek jika pengguna memakai OneDrive Desktop
            $oneDriveDesktop = Join-Path $env:USERPROFILE "OneDrive\Desktop"
            if (Test-Path $oneDriveDesktop) {
                $desktopLocations += $oneDriveDesktop
            }
            
            # Cari juga folder Desktop di setiap profil user C:\Users\*
            $userFolders = Get-ChildItem "C:\Users" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -notin @("Public", "Default", "All Users") }
            foreach ($u in $userFolders) {
                $uDesktop = Join-Path $u.FullName "Desktop"
                if (Test-Path $uDesktop) { $desktopLocations += $uDesktop }
                $uOneDriveDesktop = Join-Path $u.FullName "OneDrive\Desktop"
                if (Test-Path $uOneDriveDesktop) { $desktopLocations += $uOneDriveDesktop }
            }
            
            # Buat shortcut di setiap lokasi desktop yang valid
            $desktopLocations = $desktopLocations | Select-Object -Unique
            foreach ($dLoc in $desktopLocations) {
                if (Test-Path $dLoc) {
                    $shortcutFile = Join-Path $dLoc "Audira Desk.lnk"
                    $desktopShortcut = $wshShell.CreateShortcut($shortcutFile)
                    $desktopShortcut.TargetPath = $destExe
                    $desktopShortcut.WorkingDirectory = $InstallPath
                    $desktopShortcut.Description = "Audira Desk Remote Desktop Client"
                    $desktopShortcut.Save()
                }
            }
            
            # Start Menu Shortcut
            $startMenuPrograms = [Environment]::GetFolderPath("CommonPrograms")
            $audiraFolder = Join-Path $startMenuPrograms "Audira Desk"
            if (-not (Test-Path $audiraFolder)) { New-Item -ItemType Directory -Path $audiraFolder -Force | Out-Null }
            $menuShortcut = $wshShell.CreateShortcut((Join-Path $audiraFolder "Audira Desk.lnk"))
            $menuShortcut.TargetPath = $destExe
            $menuShortcut.WorkingDirectory = $InstallPath
            $menuShortcut.Description = "Audira Desk Remote Desktop Client"
            $menuShortcut.Save()
            
            Write-Host "      Pintasan 'Audira Desk' berhasil dibuat di Desktop & Start Menu!" -ForegroundColor Green
        } catch {
            Write-Host "      [WARN] Gagal membuat pintasan: $_" -ForegroundColor Yellow
        }
        
        # F. Konfigurasi Windows Defender Firewall
        Write-Host "[6/7] Membuka port Windows Firewall (21115-21119)..." -ForegroundColor Gray
        try {
            netsh advfirewall firewall delete rule name="Audira Desk" | Out-Null
            netsh advfirewall firewall add rule name="Audira Desk" dir=in action=allow program="$destExe" enable=yes | Out-Null
            netsh advfirewall firewall add rule name="Audira Desk TCP" dir=in action=allow protocol=TCP localport=21115-21119 | Out-Null
            netsh advfirewall firewall add rule name="Audira Desk UDP" dir=in action=allow protocol=UDP localport=21116 | Out-Null
            Write-Host "      Aturan firewall berhasil dikonfigurasi!" -ForegroundColor Green
        } catch {
            Write-Host "      [WARN] Gagal mengatur firewall: $_" -ForegroundColor Yellow
        }
        
        # G. Daftarkan Entri Windows Add/Remove Programs & Bersihkan Registry Lama
        Write-Host "[7/7] Mendaftarkan informasi aplikasi ke Windows Registry..." -ForegroundColor Gray
        try {
            # Bersihkan registry lama RustDesk
            $oldUninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\RustDesk"
            if (Test-Path $oldUninstallKey) {
                Remove-Item -Path $oldUninstallKey -Recurse -Force -ErrorAction SilentlyContinue
            }
            
            $uninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Audira Desk"
            if (-not (Test-Path $uninstallKey)) { New-Item -Path $uninstallKey -Force | Out-Null }
            Set-ItemProperty -Path $uninstallKey -Name "DisplayName" -Value "Audira Desk"
            Set-ItemProperty -Path $uninstallKey -Name "DisplayVersion" -Value "1.5.1"
            Set-ItemProperty -Path $uninstallKey -Name "Publisher" -Value "AUDIRA (Agus Dwi R)"
            Set-ItemProperty -Path $uninstallKey -Name "DisplayIcon" -Value "$destExe,0"
            Set-ItemProperty -Path $uninstallKey -Name "InstallLocation" -Value $InstallPath
            Set-ItemProperty -Path $uninstallKey -Name "UninstallString" -Value "`"$destExe`" --uninstall"
            $installedSizeKB = [math]::Round(((Get-ChildItem -Path $InstallPath -Recurse -File | Measure-Object -Property Length -Sum).Sum) / 1KB)
            Set-ItemProperty -Path $uninstallKey -Name "EstimatedSize" -Value $installedSizeKB -Type DWord
            Write-Host "      Registrasi sistem berhasil: Audira Desk terdaftar resmi di Windows Apps!" -ForegroundColor Green
        } catch {
            Write-Host "      [WARN] Gagal mendaftarkan registry program: $_" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "==============================================================================" -ForegroundColor Green
        Write-Host "    [SUKSES] Audira Desk Berhasil Diinstal di C:\Program Files\Audira Desk!  " -ForegroundColor Green
        Write-Host "    Lokasi: $destExe                                                          " -ForegroundColor White
        Write-Host "==============================================================================" -ForegroundColor Green
        Write-Host ""
        
        if (-not $Silent) {
            $launchNow = Read-Host "Apakah Anda ingin meluncurkan Audira Desk sekarang? [Y/n]"
            if ($launchNow -eq "" -or $launchNow -match "^[yY]") {
                Start-Process -FilePath $destExe
            }
        }
    }
    
    "2" {
        Write-Host "[LAUNCH] Membuka GUI Installer Resmi..." -ForegroundColor Cyan
        Start-Process -FilePath $srcExe -ArgumentList "--install"
        Write-Host "Jendela instalasi telah dibuka." -ForegroundColor Green
    }
    
    "3" {
        Write-Host "[SERVICE] Memasang & Memperbarui Background Service..." -ForegroundColor Cyan
        Start-Process -FilePath $srcExe -ArgumentList "--install-service" -Wait
        Write-Host "[SUCCESS] Perintah --install-service telah selesai dieksekusi." -ForegroundColor Green
    }
    
    "4" {
        Write-Host "[UNINSTALL] Menghapus Audira Desk dari Sistem..." -ForegroundColor Yellow
        $installedExe = Join-Path $InstallPath "AudiraDesk.exe"
        if (Test-Path $installedExe) {
            Start-Process -FilePath $installedExe -ArgumentList "--uninstall" -Wait
        } else {
            Start-Process -FilePath $srcExe -ArgumentList "--uninstall-service" -Wait
        }
        
        # Bersihkan Registry dan Shortcut yang tersisa
        $uninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Audira Desk"
        if (Test-Path $uninstallKey) { Remove-Item -Path $uninstallKey -Recurse -Force -ErrorAction SilentlyContinue }
        
        $oldUninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\RustDesk"
        if (Test-Path $oldUninstallKey) { Remove-Item -Path $oldUninstallKey -Recurse -Force -ErrorAction SilentlyContinue }
        
        $desktopLnk = Join-Path ([Environment]::GetFolderPath("CommonDesktopDirectory")) "Audira Desk.lnk"
        if (Test-Path $desktopLnk) { Remove-Item -Path $desktopLnk -Force -ErrorAction SilentlyContinue }
        
        $startMenuFolder = Join-Path ([Environment]::GetFolderPath("CommonPrograms")) "Audira Desk"
        if (Test-Path $startMenuFolder) { Remove-Item -Path $startMenuFolder -Recurse -Force -ErrorAction SilentlyContinue }
        
        Write-Host "[SUCCESS] Uninstallation selesai dan sistem bersih total." -ForegroundColor Green
    }
    
    default {
        Write-Host "Instalasi dibatalkan." -ForegroundColor Gray
        exit 0
    }
}
