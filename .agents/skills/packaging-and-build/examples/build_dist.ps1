# PowerShell Script: Build & Package Release Executable for Windows
# Used as reference workflow for AUDIRA Remote Desktop distribution.

[CmdletBinding()]
param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

Write-Host ">>> Starting AUDIRA Remote Desktop Packaging Pipeline ($Configuration)..." -ForegroundColor Cyan

# 1. Environment Verification
if (-not (Get-Command "flutter" -ErrorAction SilentlyContinue)) {
    throw "Flutter SDK not found in PATH."
}
if (-not (Get-Command "cargo" -ErrorAction SilentlyContinue)) {
    throw "Rust Cargo not found in PATH."
}

# 2. Build Flutter Bundle
Push-Location "flutter"
try {
    Write-Host ">>> Compiling Flutter Windows Desktop bundle..." -ForegroundColor Yellow
    flutter pub get
    flutter build windows --release
} finally {
    Pop-Location
}

# 3. Verify Output
$OutputFile = "flutter\build\windows\x64\runner\Release\audira.exe"
if (Test-Path $OutputFile) {
    $Size = (Get-Item $OutputFile).Length / 1MB
    Write-Host ">>> Build successful! Output: $OutputFile ($([Math]::Round($Size, 2)) MB)" -ForegroundColor Green
} else {
    throw "Build output file not found at expected path: $OutputFile"
}
