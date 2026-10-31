<#
.SYNOPSIS
    Audira Desk - Companion Suite Master Orchestrator
    Overview and management of all adopted TwinDesk capabilities in Audira Remote Desktop.
#>
param(
    [ValidateSet('status', 'install-all')]
    [string]$Action = 'status'
)

$scriptsDir = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AUDIRA DESK - ADVANCED COMPANION WORKSPACE SUITE        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Show-SuiteStatus {
    Write-Host "`n1. [SECURITY] Password Manager Clipboard Protection:" -ForegroundColor Yellow
    Write-Host "   - Status: COMPILED & ACTIVE IN RUST ENGINE (src/clipboard.rs)" -ForegroundColor Green
    Write-Host "   - Formats: 'Clipboard Viewer Ignore', 'ExcludeClipboardContentFromMonitorProcessing'" -ForegroundColor Gray

    Write-Host "`n2. [DISPLAY] Virtual Display Driver (Second Screen / Extended Desktop):" -ForegroundColor Yellow
    & "$scriptsDir\audira_vdd_manager.ps1" -Action status | Out-String | Write-Host -ForegroundColor Gray

    Write-Host "3. [MEDIA] Windows 11 Native Virtual Camera (MFCreateVirtualCamera):" -ForegroundColor Yellow
    & "$scriptsDir\audira_vcam_manager.ps1" -Action status | Out-String | Write-Host -ForegroundColor Gray

    Write-Host "4. [INPUT] Virtual Gamepad Emulation (Xbox 360 Controller via ViGEmBus):" -ForegroundColor Yellow
    & "$scriptsDir\audira_gamepad_manager.ps1" -Action status | Out-String | Write-Host -ForegroundColor Gray

    Write-Host "5. [KVM & TOUCHPAD] KVM Edge Transit & Multi-touch Gesture Engine:" -ForegroundColor Yellow
    $helper = Join-Path $scriptsDir '..\tools\audira-companion\audira-winhelper.exe'
    if (Test-Path $helper) {
        Write-Host "   - Binary: $helper" -ForegroundColor Green
        Write-Host "   - Features: OLE Edge Drop, DWM Single Window Tracking, Precision Touchpad" -ForegroundColor Gray
    } else {
        Write-Host "   - Binary: Not found" -ForegroundColor Red
    }
}

switch ($Action) {
    'status' { Show-SuiteStatus }
    'install-all' {
        Write-Host "[*] Installing all available companion drivers..." -ForegroundColor Cyan
        & "$scriptsDir\audira_vdd_manager.ps1" -Action install
        & "$scriptsDir\audira_vcam_manager.ps1" -Action install
        & "$scriptsDir\audira_gamepad_manager.ps1" -Action install
        Show-SuiteStatus
    }
}
