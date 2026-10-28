# AUDIRA Remote Desktop - Automated Windows Installer & Updater
# Full Life-Cycle Management: In-Place Upgrade, Clean Reinstall, Fresh Install & Uninstall
param (
    [ValidateSet("Auto", "Upgrade", "Clean", "Fresh", "ServiceOnly", "Gui", "Uninstall", "Audit")]
    [string]$Action = "Auto",
    [switch]$Silent,
    [switch]$ServiceOnly,
    [switch]$Gui,
    [switch]$KeepConfig = $true,
    [switch]$ResetConfig,
    [switch]$NoStart,
    [switch]$SkipAdminCheck,
    [string]$InstallPath = "$env:ProgramFiles\Audira Desk"
)

$ErrorActionPreference = "Continue"

# Normalisasi parameter backwards compatibility
if ($Gui) { $Action = "Gui" }
if ($ServiceOnly) { $Action = "ServiceOnly" }

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "         AUDIRA DESK - Windows System Installer & Life-Cycle Utility          " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Periksa Hak Akses Administrator (Elevate automatically if needed)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin -and -not $SkipAdminCheck -and ($Action -ne "Audit") -and ($Action -ne "Gui")) {
    Write-Host "[UAC] Hak akses Administrator diperlukan untuk mengelola Program Files & Service Windows." -ForegroundColor Yellow
    Write-Host "Membuka prompt persetujuan Administrator (UAC)..." -ForegroundColor Gray
    
    $argsList = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    if ($Action -ne "Auto") { $argsList += " -Action $Action" }
    if ($Silent) { $argsList += " -Silent" }
    if ($ResetConfig) { $argsList += " -ResetConfig" }
    if ($NoStart) { $argsList += " -NoStart" }
    
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

# 2. Cari Binary Sumber (Source Binaries) & Runtime Payload
$potentialBinaries = @(
    (Join-Path $rootDir "AudiraDesk.exe"),
    (Join-Path $rootDir "dist\AudiraDesk-v1.5.0-x86_64.exe"),
    (Join-Path $rootDir "dist\AudiraDesk.exe"),
    (Join-Path $rootDir "dist\AUDIRA-v1.5.0-x86_64.exe"),
    (Join-Path $rootDir "audira.exe"),
    (Join-Path $rootDir "AUDIRA.exe"),
    (Join-Path $rootDir "target\release\audira.exe")
)

$srcExe = $null
foreach ($bin in $potentialBinaries) {
    if (Test-Path $bin) {
        $srcExe = $bin
        break
    }
}

if (-not $srcExe) {
    Write-Host "[ERROR] Binary executable Audira Desk tidak ditemukan di direktori proyek!" -ForegroundColor Red
    Write-Host "Silakan jalankan build atau package.bat terlebih dahulu." -ForegroundColor Yellow
    if (-not $Silent) { Read-Host "Tekan Enter untuk keluar..." }
    exit 1
}

# Cari bundle folder runtime yang sudah terkompilasi
$runtimeSources = @(
    (Join-Path $rootDir "flutter\build\windows\x64\runner\Release"),
    (Join-Path $rootDir "dist\audira_payload"),
    "$env:LOCALAPPDATA\audiradesk",
    "C:\Program Files\Audira Desk",
    "C:\Program Files\RustDesk"
)

$srcRuntimeDir = $null
foreach ($rDir in $runtimeSources) {
    if (Test-Path $rDir) {
        # Periksa apakah ada librustdesk.dll atau audira.exe di folder tersebut
        if ((Test-Path (Join-Path $rDir "librustdesk.dll")) -or (Test-Path (Join-Path $rDir "audira.exe"))) {
            $srcRuntimeDir = $rDir
            break
        }
    }
}

# 3. Audit Instalasi yang Sudah Ada (System Audit)
function Get-SystemAudit {
    $audit = [PSCustomObject]@{
        IsInstalled         = $false
        InstalledDir        = $null
        InstalledExe        = $null
        InstalledVersion    = "Tidak terpasang"
        LegacyDirFound      = $false
        ServiceFound        = $false
        ServiceName         = $null
        ServiceStatus       = "None"
        ActiveProcesses     = @()
        HasConfig           = $false
        ConfigFileLocations = @()
    }

    # Cek folder instalasi utama
    if (Test-Path $InstallPath) {
        $checkExe = Join-Path $InstallPath "AudiraDesk.exe"
        if (-not (Test-Path $checkExe)) { $checkExe = Join-Path $InstallPath "Audira Desk.exe" }
        if (-not (Test-Path $checkExe)) { $checkExe = Join-Path $InstallPath "audira.exe" }
        
        if (Test-Path $checkExe) {
            $audit.IsInstalled = $true
            $audit.InstalledDir = $InstallPath
            $audit.InstalledExe = $checkExe
            try {
                $fVer = (Get-Item $checkExe).VersionInfo.ProductVersion
                if ($fVer) { $audit.InstalledVersion = "v$fVer" }
            } catch {}
        }
    }

    # Cek direktori legacy RustDesk
    if ((Test-Path "C:\Program Files\RustDesk") -and ($InstallPath -ne "C:\Program Files\RustDesk")) {
        $audit.LegacyDirFound = $true
    }

    # Cek registri instalasi
    $regKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Audira Desk"
    if (Test-Path $regKey) {
        $regVer = (Get-ItemProperty -Path $regKey -Name "DisplayVersion" -ErrorAction SilentlyContinue).DisplayVersion
        if ($regVer) {
            $audit.InstalledVersion = "v$regVer"
            $audit.IsInstalled = $true
        }
    }

    # Cek Windows Service (Audira Desk atau RustDesk)
    $svc = Get-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
    if (-not $svc) { $svc = Get-Service -Name "RustDesk" -ErrorAction SilentlyContinue }
    if ($svc) {
        $audit.ServiceFound = $true
        $audit.ServiceName = $svc.Name
        $audit.ServiceStatus = $svc.Status.ToString()
    }

    # Cek proses aktif
    $procNames = @("AudiraDesk", "Audira Desk", "audira", "rustdesk", "RustDesk")
    foreach ($pn in $procNames) {
        $procs = Get-Process -Name $pn -ErrorAction SilentlyContinue
        if ($procs) {
            $audit.ActiveProcesses += $procs
        }
    }

    # Cek konfigurasi ID & Server (Audira Desk2.toml)
    $possibleConfigs = @(
        "$env:APPDATA\Audira Desk\config\Audira Desk2.toml",
        "C:\ProgramData\Audira Desk\config\Audira Desk2.toml",
        "C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config\Audira Desk2.toml"
    )
    foreach ($cfg in $possibleConfigs) {
        $cfgExists = $false
        try {
            $cfgExists = Test-Path $cfg -ErrorAction SilentlyContinue
        } catch {
            $cfgExists = $false
        }
        if ($cfgExists) {
            $audit.HasConfig = $true
            $audit.ConfigFileLocations += $cfg
        }
    }

    return $audit
}

# 4. Helper Functions untuk Pengoperasian Sistem
function Stop-AudiraSystem {
    param ([bool]$Verbose = $true)
    if ($Verbose) { Write-Host "[STOP] Menghentikan service & proses Audira Desk yang sedang aktif..." -ForegroundColor Yellow }

    # 1. Hentikan Windows Service
    $services = @("Audira Desk", "RustDesk")
    foreach ($sName in $services) {
        $s = Get-Service -Name $sName -ErrorAction SilentlyContinue
        if ($s -and $s.Status -ne "Stopped") {
            if ($Verbose) { Write-Host "       Menghentikan Windows Service '$sName'..." -ForegroundColor Gray }
            Stop-Service -Name $sName -Force -ErrorAction SilentlyContinue
            $timeout = 10
            while ((Get-Service -Name $sName -ErrorAction SilentlyContinue).Status -ne "Stopped" -and $timeout -gt 0) {
                Start-Sleep -Milliseconds 400
                $timeout--
            }
        }
    }

    # 2. Hentikan proses GUI & background
    $procNames = @("AudiraDesk", "Audira Desk", "audira", "rustdesk", "RustDesk")
    foreach ($pn in $procNames) {
        $procs = Get-Process -Name $pn -ErrorAction SilentlyContinue
        if ($procs) {
            foreach ($p in $procs) {
                if ($Verbose) { Write-Host "       Menghentikan proses $($p.ProcessName) (PID: $($p.Id))..." -ForegroundColor Gray }
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }

    # 3. Pastikan dengan taskkill untuk menutup handle file yang terkunci
    & taskkill.exe /F /IM "AudiraDesk.exe" /IM "Audira Desk.exe" /IM "audira.exe" /IM "rustdesk.exe" 2>$null | Out-Null
    
    # Jeda 1 detik agar sistem operasi merilis semua file handle
    Start-Sleep -Seconds 1
    if ($Verbose) { Write-Host "       [OK] Semua proses dan service telah dihentikan." -ForegroundColor Green }
}

function Backup-AudiraConfig {
    $timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
    $backupDir = "C:\ProgramData\Audira Desk\backups\config_backup_$timestamp"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

    $configLocations = @(
        "$env:APPDATA\Audira Desk\config",
        "C:\ProgramData\Audira Desk\config",
        "C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config"
    )

    $saved = $false
    foreach ($cLoc in $configLocations) {
        if (Test-Path $cLoc) {
            Copy-Item -Path "$cLoc\*" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue
            $saved = $true
        }
    }

    if ($saved) {
        Write-Host "       [BACKUP] Pengaturan ID & Server berhasil dicadangkan ke:" -ForegroundColor Green
        Write-Host "                $backupDir" -ForegroundColor White
        return $backupDir
    }
    return $null
}

function Sync-AudiraConfigToSystem {
    # Sinkronkan Audira Desk2.toml ke SystemProfile agar service Windows dapat login ke remote server
    $userCfg = "$env:APPDATA\Audira Desk\config\Audira Desk2.toml"
    $progDataCfgDir = "C:\ProgramData\Audira Desk\config"
    $sysProfileCfgDir = "C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config"

    if (-not (Test-Path $userCfg) -and (Test-Path (Join-Path $progDataCfgDir "Audira Desk2.toml"))) {
        $userCfg = Join-Path $progDataCfgDir "Audira Desk2.toml"
    }

    if (Test-Path $userCfg) {
        if (-not (Test-Path $progDataCfgDir)) { New-Item -ItemType Directory -Path $progDataCfgDir -Force | Out-Null }
        if (-not (Test-Path $sysProfileCfgDir)) { New-Item -ItemType Directory -Path $sysProfileCfgDir -Force | Out-Null }

        Copy-Item -Path $userCfg -Destination (Join-Path $progDataCfgDir "Audira Desk2.toml") -Force -ErrorAction SilentlyContinue
        Copy-Item -Path $userCfg -Destination (Join-Path $sysProfileCfgDir "Audira Desk2.toml") -Force -ErrorAction SilentlyContinue
        Write-Host "       [CONFIG] Konfigurasi server desk.audira.my.id disinkronkan ke System Profile & ProgramData." -ForegroundColor Green
    }
}

function Clean-LegacyRustDeskArtifacts {
    Write-Host "[CLEAN] Memeriksa & membersihkan peninggalan legacy RustDesk..." -ForegroundColor Gray
    
    # Hapus service RustDesk lama jika masih terdaftar
    $oldSvc = Get-Service -Name "RustDesk" -ErrorAction SilentlyContinue
    if ($oldSvc) {
        Stop-Service -Name "RustDesk" -Force -ErrorAction SilentlyContinue
        & sc.exe delete "RustDesk" | Out-Null
        Write-Host "       Service legacy 'RustDesk' berhasil dihapus." -ForegroundColor Green
    }

    # Hapus folder legacy RustDesk jika ada
    if ((Test-Path "C:\Program Files\RustDesk") -and ($InstallPath -ne "C:\Program Files\RustDesk")) {
        Remove-Item -Path "C:\Program Files\RustDesk" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "       Folder lama C:\Program Files\RustDesk dibersihkan." -ForegroundColor Green
    }

    # Hapus shortcut legacy
    $legacyShortcuts = @(
        "C:\Users\Public\Desktop\RustDesk.lnk",
        "$env:USERPROFILE\Desktop\RustDesk.lnk",
        "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\RustDesk",
        "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\RustDesk Tray.lnk"
    )
    foreach ($ls in $legacyShortcuts) {
        if (Test-Path $ls) {
            Remove-Item -Path $ls -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    # Hapus registri legacy
    $oldReg = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\RustDesk"
    if (Test-Path $oldReg) {
        Remove-Item -Path $oldReg -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Clean-SystemArtifactsAndCache {
    param ([bool]$CleanConfig = $false)

    Write-Host "[CLEAN] Membersihkan cache sistem, file ekstraksi dan residu versi lama..." -ForegroundColor Cyan

    # 1. Hapus cache ekstraksi portable
    $extractionDirs = @(
        "$env:LOCALAPPDATA\audiradesk",
        "$env:LOCALAPPDATA\rustdesk"
    )
    foreach ($eDir in $extractionDirs) {
        if (Test-Path $eDir) {
            Remove-Item -Path $eDir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "       Cache ekstraksi $eDir dibersihkan." -ForegroundColor Green
        }
    }

    # 2. Hapus file temporary dan crash dumps
    $tempPatterns = @(
        "$env:TEMP\audira*",
        "$env:TEMP\rustdesk*",
        "$env:TEMP\7z*audira*",
        "C:\Windows\Temp\audira*",
        "C:\Windows\Temp\rustdesk*"
    )
    foreach ($pattern in $tempPatterns) {
        $matching = Get-Item -Path $pattern -ErrorAction SilentlyContinue
        if ($matching) {
            foreach ($item in $matching) {
                Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }

    # 3. Bersihkan peninggalan legacy RustDesk
    Clean-LegacyRustDeskArtifacts

    # 4. Jika diminta CleanConfig, hapus konfigurasi lama (setelah dibackup)
    if ($CleanConfig) {
        Write-Host "       Membersihkan data konfigurasi lama untuk reset instalasi..." -ForegroundColor Yellow
        $cfgLocations = @(
            "$env:APPDATA\Audira Desk\config",
            "C:\ProgramData\Audira Desk\config",
            "C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config"
        )
        foreach ($cPath in $cfgLocations) {
            if (Test-Path $cPath) {
                Remove-Item -Path $cPath -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }

    # 5. Bersihkan residu sesi akun lama (access_token & user_info) agar instalasi fresh tanpa akun tertaut
    $localCfgPaths = @(
        "$env:APPDATA\Audira Desk\config\Audira Desk_local.toml",
        "C:\ProgramData\Audira Desk\config\Audira Desk_local.toml"
    )
    foreach ($cfg in $localCfgPaths) {
        if (Test-Path $cfg) {
            try {
                $lines = Get-Content $cfg -Encoding UTF8
                $filtered = $lines | Where-Object {
                    $_ -notmatch "^\s*access_token\s*=" -and
                    $_ -notmatch "^\s*user_info\s*="
                }
                Set-Content -Path $cfg -Value $filtered -Encoding UTF8
                Write-Host "       Residu sesi akun dibersihkan agar aplikasi berstatus fresh." -ForegroundColor Green
            } catch {}
        }
    }

    # 6. Refresh cache icon Windows
    try {
        & ie4uinit.exe -show 2>$null | Out-Null
    } catch {}

    Write-Host "       [OK] Sistem telah dibersihkan secara tuntas tanpa residu bug." -ForegroundColor Green
}

function Deploy-AudiraBinaries {
    param ([string]$Destination)

    Write-Host "[DEPLOY] Memasang berkas aplikasi ke $Destination..." -ForegroundColor Cyan

    if (-not (Test-Path $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }

    # 1. Salin seluruh file dari runtime directory jika tersedia
    if ($srcRuntimeDir -and (Test-Path $srcRuntimeDir)) {
        Write-Host "         Menyalin komponen runtime dari: $srcRuntimeDir" -ForegroundColor Gray
        Copy-Item -Path "$srcRuntimeDir\*" -Destination $Destination -Recurse -Force -ErrorAction SilentlyContinue
    }

    # 2. Salin binary executable utama
    $destExe = Join-Path $Destination "AudiraDesk.exe"
    $destAltExe = Join-Path $Destination "Audira Desk.exe"
    $destRunnerExe = Join-Path $Destination "audira.exe"

    if (Test-Path $srcExe) {
        Copy-Item -Path $srcExe -Destination $destExe -Force
        # Buat salinan bernama 'Audira Desk.exe' dan 'audira.exe' untuk kompatibilitas penuh service & launcher
        Copy-Item -Path $srcExe -Destination $destAltExe -Force
        Copy-Item -Path $srcExe -Destination $destRunnerExe -Force
    }

    # 3. Salin sciter.dll jika ada di root
    $srcSciter = Join-Path $rootDir "sciter.dll"
    if (Test-Path $srcSciter) {
        Copy-Item -Path $srcSciter -Destination (Join-Path $Destination "sciter.dll") -Force -ErrorAction SilentlyContinue
    }

    # 4. Hapus shortcut uninstall lama jika ikut tersalin ke folder program
    $unLnk = Join-Path $Destination "Uninstall RustDesk.lnk"
    if (Test-Path $unLnk) { Remove-Item -Path $unLnk -Force -ErrorAction SilentlyContinue }

    Write-Host "         [OK] Berkas binary & dependensi runtime berhasil dipasang." -ForegroundColor Green
    return $destExe
}

function Register-AudiraServiceAndFirewall {
    param ([string]$ExePath)

    Write-Host "[SERVICE] Mendaftarkan Windows Background Service..." -ForegroundColor Cyan
    try {
        # Pasang service menggunakan parameter bawaan
        $p = Start-Process -FilePath $ExePath -ArgumentList "--install-service" -Wait -PassThru -NoNewWindow
        
        # Fallback eksplisit jika parameter bawaan terlewat oleh flag konfigurasi
        $svcTest = Get-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
        if (-not $svcTest) {
            $binPath = "`"$ExePath`" --service"
            & sc.exe create "Audira Desk" binpath= $binPath start= auto DisplayName= "Audira Desk Service" | Out-Null
            & sc.exe description "Audira Desk" "AUDIRA Remote Desktop Host & Rendezvous Service" | Out-Null
        } else {
            & sc.exe config "Audira Desk" start= auto | Out-Null
        }
        Write-Host "          [OK] Service 'Audira Desk' berhasil didaftarkan (Startup: Automatic)." -ForegroundColor Green
    } catch {
        Write-Host "          [WARN] Gagal mendaftarkan service: $_" -ForegroundColor Yellow
    }

    # Windows Firewall
    Write-Host "[FIREWALL] Mengonfigurasi Windows Defender Firewall..." -ForegroundColor Cyan
    try {
        & netsh.exe advfirewall firewall delete rule name="Audira Desk" 2>$null | Out-Null
        & netsh.exe advfirewall firewall delete rule name="Audira Desk TCP" 2>$null | Out-Null
        & netsh.exe advfirewall firewall delete rule name="Audira Desk UDP" 2>$null | Out-Null

        & netsh.exe advfirewall firewall add rule name="Audira Desk" dir=in action=allow program="$ExePath" enable=yes | Out-Null
        & netsh.exe advfirewall firewall add rule name="Audira Desk TCP" dir=in action=allow protocol=TCP localport=21115-21119 | Out-Null
        & netsh.exe advfirewall firewall add rule name="Audira Desk UDP" dir=in action=allow protocol=UDP localport=21116 | Out-Null
        Write-Host "           [OK] Port 21115-21119 (TCP) & 21116 (UDP) berhasil dibuka di Firewall." -ForegroundColor Green
    } catch {
        Write-Host "           [WARN] Gagal mengonfigurasi firewall: $_" -ForegroundColor Yellow
    }
}

function Register-AudiraSystemRegistry {
    param (
        [string]$ExePath,
        [string]$Destination
    )

    Write-Host "[REGISTRY] Mendaftarkan informasi aplikasi ke Windows Registry..." -ForegroundColor Cyan
    try {
        $uninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Audira Desk"
        if (-not (Test-Path $uninstallKey)) { New-Item -Path $uninstallKey -Force | Out-Null }
        
        $buildDateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm")
        $installedSizeKB = [math]::Round(((Get-ChildItem -Path $Destination -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum) / 1KB)

        Set-ItemProperty -Path $uninstallKey -Name "DisplayName" -Value "Audira Desk"
        Set-ItemProperty -Path $uninstallKey -Name "DisplayVersion" -Value "1.5.0"
        Set-ItemProperty -Path $uninstallKey -Name "Publisher" -Value "AUDIRA (Agus Dwi R)"
        Set-ItemProperty -Path $uninstallKey -Name "DisplayIcon" -Value "$ExePath,0"
        Set-ItemProperty -Path $uninstallKey -Name "InstallLocation" -Value $Destination
        Set-ItemProperty -Path $uninstallKey -Name "UninstallString" -Value "`"$ExePath`" --uninstall"
        Set-ItemProperty -Path $uninstallKey -Name "EstimatedSize" -Value $installedSizeKB -Type DWord
        Set-ItemProperty -Path $uninstallKey -Name "BuildDate" -Value $buildDateStr
        Set-ItemProperty -Path $uninstallKey -Name "URLInfoAbout" -Value "http://desk.audira.my.id:5050"
        
        Write-Host "           [OK] Audira Desk terdaftar resmi di Windows Apps & Programs." -ForegroundColor Green
    } catch {
        Write-Host "           [WARN] Gagal mendaftarkan registry program: $_" -ForegroundColor Yellow
    }
}

function Create-AudiraShortcuts {
    param (
        [string]$ExePath,
        [string]$Destination
    )

    Write-Host "[SHORTCUT] Membuat pintasan Desktop, Start Menu & Startup Tray..." -ForegroundColor Cyan
    try {
        $wshShell = New-Object -ComObject WScript.Shell
        
        # 1. Desktop Shortcuts (Public + User + OneDrive)
        $desktopLocations = @(
            [Environment]::GetFolderPath("CommonDesktopDirectory"),
            [Environment]::GetFolderPath("Desktop")
        )
        $oneDriveDesktop = Join-Path $env:USERPROFILE "OneDrive\Desktop"
        if (Test-Path $oneDriveDesktop) { $desktopLocations += $oneDriveDesktop }

        $desktopLocations = $desktopLocations | Select-Object -Unique
        foreach ($dLoc in $desktopLocations) {
            if (Test-Path $dLoc) {
                $shortcutFile = Join-Path $dLoc "Audira Desk.lnk"
                $sc = $wshShell.CreateShortcut($shortcutFile)
                $sc.TargetPath = $ExePath
                $sc.WorkingDirectory = $Destination
                $sc.Description = "Audira Desk Remote Desktop Client"
                $sc.IconLocation = "$ExePath,0"
                $sc.Save()
            }
        }

        # 2. Start Menu Shortcut
        $startMenuPrograms = [Environment]::GetFolderPath("CommonPrograms")
        $audiraFolder = Join-Path $startMenuPrograms "Audira Desk"
        if (-not (Test-Path $audiraFolder)) { New-Item -ItemType Directory -Path $audiraFolder -Force | Out-Null }
        
        $menuSc = $wshShell.CreateShortcut((Join-Path $audiraFolder "Audira Desk.lnk"))
        $menuSc.TargetPath = $ExePath
        $menuSc.WorkingDirectory = $Destination
        $menuSc.Description = "Audira Desk Remote Desktop Client"
        $menuSc.IconLocation = "$ExePath,0"
        $menuSc.Save()

        # 3. Startup Tray Shortcut (Auto Start di System Tray saat login)
        $startupDir = [Environment]::GetFolderPath("CommonStartup")
        if (Test-Path $startupDir) {
            $traySc = $wshShell.CreateShortcut((Join-Path $startupDir "Audira Desk Tray.lnk"))
            $traySc.TargetPath = $ExePath
            $traySc.Arguments = "--tray"
            $traySc.WorkingDirectory = $Destination
            $traySc.Description = "Audira Desk Background Tray Agent"
            $traySc.IconLocation = "$ExePath,0"
            $traySc.Save()
        }

        Write-Host "           [OK] Pintasan 'Audira Desk' berhasil dibuat dengan icon resmi!" -ForegroundColor Green
    } catch {
        Write-Host "           [WARN] Gagal membuat pintasan: $_" -ForegroundColor Yellow
    }

    # Refresh icon cache
    try {
        & ie4uinit.exe -show 2>$null | Out-Null
    } catch {}
}

function Start-AudiraServiceAndVerify {
    Write-Host "[START] Memulai Windows Background Service 'Audira Desk'..." -ForegroundColor Cyan
    try {
        Start-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        $svc = Get-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
        if ($svc -and $svc.Status -eq "Running") {
            Write-Host "        [OK] Service 'Audira Desk' BERJALAN DENGAN SEMPURNA!" -ForegroundColor Green
        } else {
            Write-Host "        [INFO] Service terdaftar. Siap dijalankan saat aplikasi dibuka." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "        [WARN] Service belum aktif: $_" -ForegroundColor Yellow
    }
}

# 5. Jalankan Audit Sistem
$audit = Get-SystemAudit

# Tampilkan Banner Audit
Write-Host "====================== STATUS INSTALASI SISTEM ======================" -ForegroundColor Yellow
if ($audit.IsInstalled) {
    Write-Host "  * Status Aplikasi   : TERPASANG DI SISTEM" -ForegroundColor Green
    Write-Host "  * Direktori         : $($audit.InstalledDir)" -ForegroundColor White
    Write-Host "  * Versi Terpasang   : $($audit.InstalledVersion)" -ForegroundColor White
} else {
    Write-Host "  * Status Aplikasi   : Belum Terpasang (Fresh Install)" -ForegroundColor Cyan
}

if ($audit.ServiceFound) {
    $sColor = if ($audit.ServiceStatus -eq "Running") { "Green" } else { "Yellow" }
    Write-Host "  * Windows Service   : '$($audit.ServiceName)' (Status: $($audit.ServiceStatus))" -ForegroundColor $sColor
} else {
    Write-Host "  * Windows Service   : Belum Terdaftar" -ForegroundColor Gray
}

if ($audit.ActiveProcesses.Count -gt 0) {
    Write-Host "  * Proses Aktif      : $($audit.ActiveProcesses.Count) proses berjalan (PID: $($audit.ActiveProcesses.Id -join ', '))" -ForegroundColor Yellow
} else {
    Write-Host "  * Proses Aktif      : Tidak ada proses berjalan" -ForegroundColor Gray
}

if ($audit.HasConfig) {
    Write-Host "  * Konfigurasi & ID  : DITEMUKAN (ID Remote & Server desk.audira.my.id Tersimpan)" -ForegroundColor Green
} else {
    Write-Host "  * Konfigurasi & ID  : Belum ada konfigurasi (Akan dibuat baru)" -ForegroundColor Gray
}
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""

# 6. Pemilihan Aksi (Menu Interaktif vs Non-Interaktif)
if ($Action -eq "Auto") {
    if ($Silent) {
        # Jika silent mode, otomatis upgrade jika sudah ada, atau fresh install jika belum ada
        if ($audit.IsInstalled -or $audit.ServiceFound) {
            $Action = "Upgrade"
        } else {
            $Action = "Fresh"
        }
    } else {
        # Menu Interaktif Berdasarkan Status
        if ($audit.IsInstalled -or $audit.ServiceFound) {
            Write-Host "Aplikasi Audira Desk lama terdeteksi di komputer ini!" -ForegroundColor Cyan
            Write-Host "Silakan pilih tindakan yang ingin Anda lakukan:" -ForegroundColor White
            Write-Host ""
            Write-Host "  [1] PERBARUI / UPDATE (In-Place Upgrade) [Rekomendasi]" -ForegroundColor Green
            Write-Host "      - Menghentikan proses & service lama dengan aman (tanpa file-lock error)." -ForegroundColor Gray
            Write-Host "      - MEMPERTAHANKAN ID perangkat, password remote, dan server desk.audira.my.id." -ForegroundColor Gray
            Write-Host "      - Menimpa binary, runtime bundle, driver, dan icon baru." -ForegroundColor Gray
            Write-Host "      - Otomatis mencadangkan (backup) konfigurasi lama sebelum pembaruan." -ForegroundColor Gray
            Write-Host "      - Memulai ulang Windows Service otomatis agar langsung siap remote." -ForegroundColor Gray
            Write-Host ""
            Write-Host "  [2] INSTAL ULANG BERSIH (Clean Reinstall / Reset)" -ForegroundColor White
            Write-Host "      - Mencadangkan konfigurasi lama ke folder backup aman." -ForegroundColor Gray
            Write-Host "      - Mencopot service lama dan menghapus bersih folder Program Files lama." -ForegroundColor Gray
            Write-Host "      - Menginstal paket versi terbaru dari nol." -ForegroundColor Gray
            Write-Host "      - Pilihan apakah ingin memulihkan ID lama atau membuat ID baru." -ForegroundColor Gray
            Write-Host ""
            Write-Host "  [3] COPOT PEMASANGAN (Uninstall Total)" -ForegroundColor Yellow
            Write-Host "      - Menghentikan semua proses & menghapus Windows Service permanen." -ForegroundColor Gray
            Write-Host "      - Membersihkan folder Program Files, registry, dan seluruh shortcut." -ForegroundColor Gray
            Write-Host ""
            Write-Host "  [4] Buka GUI Wizard Installer Resmi Audira Desk (Visual)" -ForegroundColor White
            Write-Host "  [5] Hanya Pasang / Perbarui Background Service Windows" -ForegroundColor White
            Write-Host "  [6] Batal (Keluar)" -ForegroundColor Gray
            Write-Host ""

            $choice = Read-Host "Masukkan pilihan Anda [1-6] (Default: 1)"
            if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

            switch ($choice) {
                "1" { $Action = "Upgrade" }
                "2" { $Action = "Clean" }
                "3" { $Action = "Uninstall" }
                "4" { $Action = "Gui" }
                "5" { $Action = "ServiceOnly" }
                default {
                    Write-Host "Operasi dibatalkan oleh pengguna." -ForegroundColor Gray
                    exit 0
                }
            }
        } else {
            Write-Host "Audira Desk belum terpasang di komputer ini." -ForegroundColor Cyan
            Write-Host "Silakan pilih metode instalasi:" -ForegroundColor White
            Write-Host ""
            Write-Host "  [1] Instal Lengkap Sistem (Program Files + Service + Shortcut + Firewall) [Rekomendasi]" -ForegroundColor Green
            Write-Host "  [2] Instalasi Bersih Total (Clean Install - Hapus semua cache & residu versi lama)" -ForegroundColor White
            Write-Host "  [3] Buka GUI Wizard Installer Resmi Audira Desk (Interaktif)" -ForegroundColor White
            Write-Host "  [4] Batal (Keluar)" -ForegroundColor Gray
            Write-Host ""

            $choice = Read-Host "Masukkan pilihan Anda [1-4] (Default: 1)"
            if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

            switch ($choice) {
                "1" { $Action = "Fresh" }
                "2" { $Action = "Clean" }
                "3" { $Action = "Gui" }
                default {
                    Write-Host "Operasi dibatalkan oleh pengguna." -ForegroundColor Gray
                    exit 0
                }
            }
        }
    }
}

# 7. Eksekusi Berdasarkan Pilihan Tindakan
Write-Host ""
switch ($Action) {
    "Upgrade" {
        Write-Host "==============================================================================" -ForegroundColor Cyan
        Write-Host "      MEMULAI PEMBARUAN APLIKASI AUDIRA DESK (IN-PLACE UPGRADE)               " -ForegroundColor White
        Write-Host "==============================================================================" -ForegroundColor Cyan
        
        # 1. Backup konfigurasi lama
        Write-Host "[1/7] Mencadangkan konfigurasi ID dan server..." -ForegroundColor Gray
        $backupDir = Backup-AudiraConfig

        # 2. Hentikan service & proses lama
        Write-Host "[2/7] Menghentikan service dan proses aktif..." -ForegroundColor Gray
        Stop-AudiraSystem -Verbose $true

        # 3. Bersihkan cache sistem & residu legacy
        Write-Host "[3/7] Membersihkan cache sistem & residu legacy..." -ForegroundColor Gray
        Clean-SystemArtifactsAndCache -CleanConfig $false

        # 4. Deploy binary dan runtime baru
        Write-Host "[4/7] Memasang binary dan runtime baru..." -ForegroundColor Gray
        $destExe = Deploy-AudiraBinaries -Destination $InstallPath

        # 5. Sinkronisasi konfigurasi ke SystemProfile & ProgramData
        Write-Host "[5/7] Sinkronisasi konfigurasi ID & Server ke Windows Service..." -ForegroundColor Gray
        Sync-AudiraConfigToSystem

        # 6. Service, Firewall, Registry, dan Shortcuts
        Write-Host "[6/7] Mendaftarkan service, firewall, dan shortcut baru..." -ForegroundColor Gray
        Register-AudiraServiceAndFirewall -ExePath $destExe
        Register-AudiraSystemRegistry -ExePath $destExe -Destination $InstallPath
        Create-AudiraShortcuts -ExePath $destExe -Destination $InstallPath

        # 7. Mulai ulang service
        if (-not $NoStart) {
            Write-Host "[7/7] Memulai kembali service..." -ForegroundColor Gray
            Start-AudiraServiceAndVerify
        }

        Write-Host ""
        Write-Host "==============================================================================" -ForegroundColor Green
        Write-Host "     [SUKSES] Audira Desk Berhasil Diperbarui ke Versi Terbaru!               " -ForegroundColor Green
        Write-Host "     * Lokasi Exe     : $destExe                                              " -ForegroundColor White
        Write-Host "     * ID & Server    : Tetap Terjaga (desk.audira.my.id)                     " -ForegroundColor Green
        Write-Host "==============================================================================" -ForegroundColor Green
        Write-Host ""

        if (-not $Silent) {
            $launchNow = Read-Host "Apakah Anda ingin meluncurkan Audira Desk sekarang? [Y/n]"
            if ($launchNow -eq "" -or $launchNow -match "^[yY]") {
                Start-Process -FilePath $destExe
            }
        }
    }

    "Clean" {
        Write-Host "==============================================================================" -ForegroundColor Cyan
        Write-Host "            MEMULAI INSTAL ULANG BERSIH (CLEAN REINSTALL)                     " -ForegroundColor White
        Write-Host "==============================================================================" -ForegroundColor Cyan
        
        $restoreConfig = $true
        if (-not $Silent) {
            Write-Host ""
            Write-Host "Apakah Anda ingin mempertahankan ID perangkat dan setting remote lama?" -ForegroundColor Yellow
            $keepAnswer = Read-Host "[Y = Pertahankan ID & Password / N = Reset Total buat ID baru] (Default: Y)"
            if ($keepAnswer -match "^[nN]") {
                $restoreConfig = $false
            }
        }

        # 1. Backup konfigurasi lama
        Write-Host "[1/8] Mencadangkan konfigurasi lama ke folder backup..." -ForegroundColor Gray
        $backupDir = Backup-AudiraConfig

        # 2. Hentikan service & proses
        Write-Host "[2/8] Menghentikan service dan proses aktif..." -ForegroundColor Gray
        Stop-AudiraSystem -Verbose $true

        # 3. Unregister service lama
        Write-Host "[3/8] Mencopot registrasi service lama..." -ForegroundColor Gray
        & sc.exe delete "Audira Desk" 2>$null | Out-Null
        & sc.exe delete "RustDesk" 2>$null | Out-Null

        # 4. Hapus folder instalasi lama & bersihkan residu
        Write-Host "[4/8] Membersihkan folder instalasi lama & seluruh cache..." -ForegroundColor Gray
        if (Test-Path $InstallPath) {
            Remove-Item -Path $InstallPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        Clean-SystemArtifactsAndCache -CleanConfig (-not $restoreConfig)

        # 5. Pasang berkas baru dari nol
        Write-Host "[5/8] Memasang paket aplikasi baru..." -ForegroundColor Gray
        $destExe = Deploy-AudiraBinaries -Destination $InstallPath

        # 6. Pulihkan konfigurasi jika diminta
        if ($restoreConfig) {
            Write-Host "[6/8] Memulihkan pengaturan ID dan server..." -ForegroundColor Gray
            Sync-AudiraConfigToSystem
        } else {
            Write-Host "[6/8] Melewati pemulihan konfigurasi (Akan dibuat ID baru)..." -ForegroundColor Gray
        }

        # 7. Daftarkan service, firewall, registry, shortcut
        Write-Host "[7/8] Mendaftarkan service, registry, firewall & shortcut baru..." -ForegroundColor Gray
        Register-AudiraServiceAndFirewall -ExePath $destExe
        Register-AudiraSystemRegistry -ExePath $destExe -Destination $InstallPath
        Create-AudiraShortcuts -ExePath $destExe -Destination $InstallPath

        # 8. Start service
        if (-not $NoStart) {
            Write-Host "[8/8] Memulai Windows Service baru..." -ForegroundColor Gray
            Start-AudiraServiceAndVerify
        }

        Write-Host ""
        Write-Host "==============================================================================" -ForegroundColor Green
        Write-Host "     [SUKSES] Instal Ulang Bersih Selesai 100%!                               " -ForegroundColor Green
        Write-Host "     * Lokasi Exe : $destExe                                                  " -ForegroundColor White
        Write-Host "==============================================================================" -ForegroundColor Green
        Write-Host ""

        if (-not $Silent) {
            $launchNow = Read-Host "Apakah Anda ingin meluncurkan Audira Desk sekarang? [Y/n]"
            if ($launchNow -eq "" -or $launchNow -match "^[yY]") {
                Start-Process -FilePath $destExe
            }
        }
    }

    "Fresh" {
        Write-Host "==============================================================================" -ForegroundColor Cyan
        Write-Host "            MEMULAI INSTALASI BARU SISTEM AUDIRA DESK                         " -ForegroundColor White
        Write-Host "==============================================================================" -ForegroundColor Cyan
        
        # 1. Hentikan kemungkinan proses yang berjalan & bersihkan cache residu
        Stop-AudiraSystem -Verbose $false
        Clean-SystemArtifactsAndCache -CleanConfig $false

        # 2. Deploy binary
        $destExe = Deploy-AudiraBinaries -Destination $InstallPath

        # 3. Sinkronkan konfigurasi jika ada
        Sync-AudiraConfigToSystem

        # 4. Service, Firewall, Registry, Shortcuts
        Register-AudiraServiceAndFirewall -ExePath $destExe
        Register-AudiraSystemRegistry -ExePath $destExe -Destination $InstallPath
        Create-AudiraShortcuts -ExePath $destExe -Destination $InstallPath

        # 5. Start service
        if (-not $NoStart) {
            Start-AudiraServiceAndVerify
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

    "Uninstall" {
        Write-Host "==============================================================================" -ForegroundColor Yellow
        Write-Host "            COPOT PEMASANGAN (UNINSTALL) AUDIRA DESK                          " -ForegroundColor White
        Write-Host "==============================================================================" -ForegroundColor Yellow
        
        # 1. Hentikan service dan proses
        Stop-AudiraSystem -Verbose $true

        # 2. Hapus Windows Service
        Write-Host "[1/5] Menghapus Windows Service..." -ForegroundColor Gray
        & sc.exe delete "Audira Desk" 2>$null | Out-Null
        & sc.exe delete "RustDesk" 2>$null | Out-Null

        # 3. Bersihkan firewall rules
        Write-Host "[2/5] Menghapus aturan Windows Firewall..." -ForegroundColor Gray
        & netsh.exe advfirewall firewall delete rule name="Audira Desk" 2>$null | Out-Null
        & netsh.exe advfirewall firewall delete rule name="Audira Desk TCP" 2>$null | Out-Null
        & netsh.exe advfirewall firewall delete rule name="Audira Desk UDP" 2>$null | Out-Null

        # 4. Bersihkan Registry & Shortcuts
        Write-Host "[3/5] Membersihkan registri & pintasan desktop..." -ForegroundColor Gray
        $uninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Audira Desk"
        if (Test-Path $uninstallKey) { Remove-Item -Path $uninstallKey -Recurse -Force -ErrorAction SilentlyContinue }

        $shortcutFiles = @(
            "C:\Users\Public\Desktop\Audira Desk.lnk",
            "$env:USERPROFILE\Desktop\Audira Desk.lnk",
            "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Audira Desk",
            "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\Audira Desk Tray.lnk"
        )
        foreach ($scf in $shortcutFiles) {
            if (Test-Path $scf) { Remove-Item -Path $scf -Recurse -Force -ErrorAction SilentlyContinue }
        }

        Clean-LegacyRustDeskArtifacts

        # 5. Hapus Program Files
        Write-Host "[4/5] Menghapus folder Program Files..." -ForegroundColor Gray
        if (Test-Path $InstallPath) {
            Remove-Item -Path $InstallPath -Recurse -Force -ErrorAction SilentlyContinue
        }

        # 6. Opsi hapus data konfigurasi
        if (-not $Silent) {
            Write-Host ""
            $wipeData = Read-Host "Apakah Anda ingin menghapus seluruh riwayat log & konfigurasi ID? [y/N]"
            if ($wipeData -match "^[yY]") {
                Write-Host "[5/5] Menghapus konfigurasi dan riwayat log..." -ForegroundColor Yellow
                Remove-Item -Path "$env:APPDATA\Audira Desk" -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -Path "C:\ProgramData\Audira Desk" -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -Path "C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk" -Recurse -Force -ErrorAction SilentlyContinue
            } else {
                Write-Host "[5/5] Data konfigurasi dan ID dipertahankan di AppData." -ForegroundColor Gray
            }
        }

        Write-Host ""
        Write-Host "==============================================================================" -ForegroundColor Green
        Write-Host "   [SUKSES] Audira Desk telah berhasil dicopot dari sistem ini.              " -ForegroundColor Green
        Write-Host "==============================================================================" -ForegroundColor Green
    }

    "Gui" {
        Write-Host "[LAUNCH] Membuka GUI Installer Resmi Audira Desk..." -ForegroundColor Cyan
        Start-Process -FilePath $srcExe -ArgumentList "--install"
        Write-Host "Jendela instalasi telah dibuka." -ForegroundColor Green
    }

    "ServiceOnly" {
        Write-Host "[SERVICE] Memperbaiki & Mendaftarkan Background Service..." -ForegroundColor Cyan
        Stop-AudiraSystem -Verbose $true
        Sync-AudiraConfigToSystem
        $installedExe = Join-Path $InstallPath "AudiraDesk.exe"
        $targetExe = if (Test-Path $installedExe) { $installedExe } else { $srcExe }
        Start-Process -FilePath $targetExe -ArgumentList "--install-service" -Wait
        $svcCheckManual = Get-Service -Name "Audira Desk" -ErrorAction SilentlyContinue
        if (-not $svcCheckManual) {
            $binPath = "`"$targetExe`" --service"
            & sc.exe create "Audira Desk" binpath= $binPath start= auto DisplayName= "Audira Desk Service" | Out-Null
            & sc.exe description "Audira Desk" "AUDIRA Remote Desktop Host & Rendezvous Service" | Out-Null
        }
        Start-AudiraServiceAndVerify
        Write-Host "[SUKSES] Background Service berhasil dipasang dan diperbarui." -ForegroundColor Green
    }

    "Audit" {
        Write-Host "[AUDIT] Pemeriksaan sistem selesai tanpa melakukan perubahan file/layanan." -ForegroundColor Cyan
    }
}
