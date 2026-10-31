<#
.SYNOPSIS
    Audira Desk - Virtual Gamepad Manager (Xbox 360 via ViGEmBus)
    Enables low-latency remote gaming by injecting virtual Xbox 360 controller inputs.
.DESCRIPTION
    Uses Nefarius ViGEmBus driver and audira-pad.exe feeder.
#>
param(
    [ValidateSet('status', 'install')]
    [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'
$CompanionDir = Join-Path $PSScriptRoot '..\tools\audira-companion'
$PadExe = Join-Path $CompanionDir 'audira-pad.exe'
$BusUrl = 'https://github.com/nefarius/ViGEmBus/releases/download/v1.22.0/ViGEmBus_1.22.0_x64_x86_arm64.exe'
$BusSha256 = '89220A7865076B342892F98865F3499FB7C4CFD673159E89D352C360FD014C6A'

function Get-GamepadStatus {
    if (-not (Test-Path $PadExe)) {
        return [PSCustomObject]@{ Available = $false; DriverActive = $false; Note = 'Pad helper not found' }
    }
    $res = & $PadExe status | ConvertFrom-Json
    [PSCustomObject]@{
        HelperAvailable = $true
        ViGEmBusActive  = [bool]$res.bus
        ControllerType  = 'Microsoft Xbox 360 (Virtual)'
    }
}

function Install-ViGEmBus {
    Write-Host "[*] Checking ViGEmBus status..." -ForegroundColor Cyan
    $status = Get-GamepadStatus
    if ($status.ViGEmBusActive) {
        Write-Host "[+] ViGEmBus driver is already installed and active!" -ForegroundColor Green
        return
    }

    Write-Host "[*] Downloading signed ViGEmBus installer..." -ForegroundColor Cyan
    $workDir = Join-Path $env:ProgramData 'AudiraDesk\vigem'
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
    $setupExe = Join-Path $workDir 'ViGEmBus-setup.exe'

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $BusUrl -OutFile $setupExe -UseBasicParsing

    $downloadHash = (Get-FileHash -Algorithm SHA256 $setupExe).Hash
    if ($downloadHash -ne $BusSha256) {
        throw "ViGEmBus download SHA256 mismatch! Got: $downloadHash"
    }

    Write-Host "[*] Installing driver quietly..." -ForegroundColor Cyan
    $p = Start-Process -FilePath $setupExe -ArgumentList '/exenoui', '/qn', '/norestart' -Wait -PassThru -WindowStyle Hidden
    if ($p.ExitCode -ne 0 -and $p.ExitCode -ne 3010 -and $p.ExitCode -ne 1641) {
        throw "Installer failed with code $($p.ExitCode)"
    }

    Remove-Item -Force $setupExe -ErrorAction SilentlyContinue
    Write-Host "[SUCCESS] ViGEmBus Virtual Gamepad driver installed successfully!" -ForegroundColor Green
}

switch ($Action) {
    'status'  { Get-GamepadStatus | Format-List }
    'install' { Install-ViGEmBus }
}
