<#
.SYNOPSIS
    Audira Desk - Virtual Display Driver (VDD) Manager
    Enables true Extended Desktop (Second Screen) on Windows for mobile tablets and laptops.
.DESCRIPTION
    Manages the Microsoft-signed Virtual Display Driver (IddCx) and zero-UAC scheduled tasks
    allowing Audira Remote Desktop to create an extended monitor on-demand.
#>
param(
    [ValidateSet('status', 'install', 'enable', 'disable', 'remove')]
    [string]$Action = 'status',
    [string]$Resolution = '1920x1080'
)

$ErrorActionPreference = 'Stop'
$HwId = 'Root\MttVDD'
$DriverUrl = 'https://github.com/VirtualDrivers/Virtual-Display-Driver/releases/download/v25.10.1/VirtualDisplayDriver_25.10.1.zip'
$DriverSha256 = '8E591295FD6916FE9F70DC5FA23C27BD42E0E733DFF7A16790C9B3C2A95B5B8F'
$CompanionDir = Join-Path $PSScriptRoot '..\tools\audira-companion'
$HelperExe = Join-Path $CompanionDir 'audira-winhelper.exe'

function Get-VDDStatus {
    $dev = Get-PnpDevice -Class Display -ErrorAction SilentlyContinue | Where-Object { $_.HardwareID -contains $HwId } | Select-Object -First 1
    $taskOn = Get-ScheduledTask -TaskPath '\AudiraDesk\' -TaskName 'Extend on' -ErrorAction SilentlyContinue
    $taskOff = Get-ScheduledTask -TaskPath '\AudiraDesk\' -TaskName 'Extend off' -ErrorAction SilentlyContinue

    [PSCustomObject]@{
        Installed     = [bool]$dev
        Status        = if ($dev) { $dev.Status } else { 'NotInstalled' }
        Active        = if ($dev -and $dev.Status -eq 'OK') { $true } else { $false }
        TasksConfigured = [bool]($taskOn -and $taskOff)
        DeviceName    = if ($dev) { $dev.FriendlyName } else { 'None' }
    }
}

function Install-VDD {
    $currentStatus = Get-VDDStatus
    if ($currentStatus.Installed -and $currentStatus.TasksConfigured) {
        Write-Host "[+] Audira Virtual Display Driver is already installed." -ForegroundColor Green
        return
    }

    Write-Host "[*] Installing Audira Virtual Display Driver..." -ForegroundColor Cyan
    $workDir = Join-Path $env:ProgramData 'AudiraDesk\vdd'
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
    $zipPath = Join-Path $workDir 'driver.zip'

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Host "[*] Downloading signed driver package..."
    Invoke-WebRequest -Uri $DriverUrl -OutFile $zipPath -UseBasicParsing

    $downloadHash = (Get-FileHash -Algorithm SHA256 $zipPath).Hash
    Write-Host "[+] Download complete. SHA256: $downloadHash"

    Expand-Archive -Path $zipPath -DestinationPath $workDir -Force
    $pkgDir = Join-Path $workDir 'VirtualDisplayDriver'
    $infPath = Join-Path $pkgDir 'MttVDD.inf'
    $catPath = Join-Path $pkgDir 'mttvdd.cat'

    if (Test-Path $catPath) {
        $sig = Get-AuthenticodeSignature $catPath
        if ($sig.Status -eq 'Valid') {
            $store = New-Object Security.Cryptography.X509Certificates.X509Store('TrustedPublisher', 'LocalMachine')
            $store.Open('ReadWrite')
            $store.Add($sig.SignerCertificate)
            $store.Close()
            Write-Host "[+] Driver signature verified and trusted." -ForegroundColor Green
        }
    }

    # Default XML configuration
    $cfgDir = 'C:\VirtualDisplayDriver'
    New-Item -ItemType Directory -Force -Path $cfgDir | Out-Null
    if (-not (Test-Path (Join-Path $cfgDir 'vdd_settings.xml'))) {
        if (Test-Path (Join-Path $pkgDir 'vdd_settings.xml')) {
            Copy-Item (Join-Path $pkgDir 'vdd_settings.xml') $cfgDir
        }
    }

    # Add Root Device using Audira WinHelper
    if (-not (Get-PnpDevice -Class Display -ErrorAction SilentlyContinue | Where-Object { $_.HardwareID -contains $HwId })) {
        Write-Host "[*] Creating root PNP display device..."
        $p = Start-Process -FilePath $HelperExe -ArgumentList '--add-root-device', ('"' + $infPath + '"'), $HwId -Wait -PassThru -WindowStyle Hidden
        if ($p.ExitCode -ne 0) {
            Write-Warning "Device registration exited with code $($p.ExitCode)"
        }
        Start-Sleep -Seconds 2
    }

    # Disable by default so it only turns on when requested
    Get-PnpDevice -Class Display -ErrorAction SilentlyContinue | Where-Object { $_.HardwareID -contains $HwId } | Disable-PnpDevice -Confirm:$false

    # Create Zero-UAC Scheduled Tasks
    $psPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $svc = New-Object -ComObject Schedule.Service
    $svc.Connect()
    $root = $svc.GetFolder('\')
    try { $folder = $root.GetFolder('AudiraDesk') } catch { $folder = $root.CreateFolder('AudiraDesk') }

    $sid = ([System.Security.Principal.WindowsIdentity]::GetCurrent()).User.Value
    $sddl = "D:(A;;FA;;;BA)(A;;FA;;;SY)(A;;GRGX;;;$sid)"

    foreach ($t in @(@('Extend on', 'Enable'), @('Extend off', 'Disable'))) {
        $cmd = "Get-PnpDevice -Class Display | Where-Object { `$_.HardwareID -contains '$HwId' } | $($t[1])-PnpDevice -Confirm:`$false"
        $def = $svc.NewTask(0)
        $def.RegistrationInfo.Description = "Audira Desk: $($t[0]) virtual second screen"
        $def.Settings.ExecutionTimeLimit = 'PT2M'
        $def.Settings.DisallowStartIfOnBatteries = $false
        $def.Settings.StopIfGoingOnBatteries = $false
        $def.Settings.MultipleInstances = 1
        $actionObj = $def.Actions.Create(0)
        $actionObj.Path = $psPath
        $actionObj.Arguments = "-NoProfile -NonInteractive -Command `"$cmd`""
        $folder.RegisterTaskDefinition($t[0], $def, 6, 'SYSTEM', $null, 5, $sddl) | Out-Null
    }

    Write-Host "[SUCCESS] Audira Virtual Display Driver and Zero-UAC tasks installed successfully!" -ForegroundColor Green
}

function Enable-VDD {
    Write-Host "[*] Turning ON Audira Virtual Extended Display..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskPath '\AudiraDesk\' -TaskName 'Extend on' -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    $status = Get-VDDStatus
    if ($status.Active) {
        Write-Host "[+] Virtual Extended Display is now ACTIVE!" -ForegroundColor Green
    } else {
        Write-Warning "Device state pending. Status: $($status.Status)"
    }
}

function Disable-VDD {
    Write-Host "[*] Turning OFF Audira Virtual Extended Display..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskPath '\AudiraDesk\' -TaskName 'Extend off' -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "[+] Virtual Extended Display turned off." -ForegroundColor Green
}

function Remove-VDD {
    Write-Host "[*] Removing Audira Virtual Display Driver..." -ForegroundColor Yellow
    Disable-VDD
    try {
        $svc = New-Object -ComObject Schedule.Service
        $svc.Connect()
        $folder = $svc.GetFolder('\AudiraDesk')
        foreach ($n in 'Extend on', 'Extend off') { try { $folder.DeleteTask($n, 0) } catch {} }
    } catch {}

    $devs = @(Get-PnpDevice -Class Display -ErrorAction SilentlyContinue | Where-Object { $_.HardwareID -contains $HwId })
    foreach ($d in $devs) { & pnputil.exe /remove-device $d.InstanceId | Out-Null }
    Write-Host "[+] Removed Audira Virtual Display Driver." -ForegroundColor Green
}

switch ($Action) {
    'status'  { Get-VDDStatus }
    'install' { Install-VDD }
    'enable'  { Enable-VDD }
    'disable' { Disable-VDD }
    'remove'  { Remove-VDD }
}

