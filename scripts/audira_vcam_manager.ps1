<#
.SYNOPSIS
    Audira Desk - Native Windows 11 Virtual Camera Manager
    Redirects remote video / mobile cameras into a system webcam for Zoom, Teams, Meet, and OBS.
.DESCRIPTION
    Leverages Microsoft Windows 11 Media Foundation (MFCreateVirtualCamera) software camera source.
#>
param(
    [ValidateSet('status', 'install', 'add', 'remove')]
    [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'
$CompanionDir = Join-Path $PSScriptRoot '..\tools\audira-companion'
$VcamExe = Join-Path $CompanionDir 'audira-vcam.exe'
$VcamDll = Join-Path $CompanionDir 'audira-vcam-x64.dll'
$SystemDir = Join-Path $env:ProgramData 'AudiraDesk\vcam'

function Get-VcamStatus {
    if (-not (Test-Path $VcamExe)) {
        return [PSCustomObject]@{ Available = $false; Active = $false; Note = 'Helper not found' }
    }
    $res = & $VcamExe status | ConvertFrom-Json
    [PSCustomObject]@{
        Installed = Test-Path (Join-Path $SystemDir 'audira-vcam-x64.dll')
        Active    = [bool]$res.camera
        Name      = 'Audira Desk Camera'
    }
}

function Install-Vcam {
    Write-Host "[*] Installing Audira Virtual Camera DLL for Windows Frame Server..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $SystemDir | Out-Null

    # Frame Server runs as Local Service (S-1-5-19), grant read permissions
    & icacls.exe $SystemDir /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-32-545:(OI)(CI)RX' '*S-1-5-19:(OI)(CI)RX' | Out-Null

    $targetDll = Join-Path $SystemDir 'audira-vcam-x64.dll'
    Copy-Item -LiteralPath $VcamDll -Destination $targetDll -Force

    $reg = Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\regsvr32.exe') -ArgumentList '/s', ('"' + $targetDll + '"') -Wait -PassThru -WindowStyle Hidden
    if ($reg.ExitCode -ne 0) {
        throw "Failed to register DLL via regsvr32 (Code: $($reg.ExitCode))"
    }

    Write-Host "[*] Adding Audira Virtual Camera to Windows Media Foundation..." -ForegroundColor Cyan
    & $VcamExe add

    Write-Host "[SUCCESS] Audira Virtual Camera successfully registered and ready for Zoom/Teams/Meet!" -ForegroundColor Green
}

function Remove-Vcam {
    Write-Host "[*] Removing Audira Virtual Camera..." -ForegroundColor Yellow
    if (Test-Path $VcamExe) {
        & $VcamExe remove | Out-Null
    }
    $targetDll = Join-Path $SystemDir 'audira-vcam-x64.dll'
    if (Test-Path $targetDll) {
        Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\regsvr32.exe') -ArgumentList '/u', '/s', ('"' + $targetDll + '"') -Wait -WindowStyle Hidden
        Remove-Item -Force $targetDll -ErrorAction SilentlyContinue
    }
    Write-Host "[+] Audira Virtual Camera removed." -ForegroundColor Green
}

switch ($Action) {
    'status'  { Get-VcamStatus }
    'install' { Install-Vcam }
    'add'     { & $VcamExe add }
    'remove'  { Remove-Vcam }
}

