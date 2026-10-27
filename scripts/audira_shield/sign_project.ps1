# PowerShell Helper: Sign any Audira Project with Cryptographic Signature
param (
    [string]$AppName = "AUDIRA-REMOTE-DEKSTOP",
    [string]$OutputDir = "."
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SignerPy = Join-Path $ScriptDir "audira_signer.py"
$TargetOutput = Join-Path $OutputDir "audira_signature.json"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🛡️ AUDIRA DIGITAL SIGNATURE SHIELD" -ForegroundColor Green
Write-Host "Menandatangani aplikasi: '$AppName'" -ForegroundColor Yellow
Write-Host "Pemilik Sah           : Agus Dwi R (Audira)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

python $SignerPy generate "$AppName" "$TargetOutput"

if (Test-Path $TargetOutput) {
    Write-Host "[+] Tanda tangan digital berhasil dibuat: $TargetOutput" -ForegroundColor Green
    Write-Host "[+] File ini siap disematkan ke dalam proyek '$AppName'." -ForegroundColor Cyan
} else {
    Write-Host "[-] Gagal membuat file tanda tangan digital." -ForegroundColor Red
}
