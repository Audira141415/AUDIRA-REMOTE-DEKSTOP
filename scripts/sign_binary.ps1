# Script to generate Authenticode Certificate for Agus Dwi R (Audira) and sign binaries
$ErrorActionPreference = "SilentlyContinue"

$subject = "CN=Agus Dwi R (Audira), O=Audira Studio, OU=Software Development, C=ID"
$cert = $null
try {
    if (Test-Path "Cert:\CurrentUser\My" -ErrorAction SilentlyContinue) {
        $cert = Get-ChildItem "Cert:\CurrentUser\My" -ErrorAction SilentlyContinue | Where-Object { $_.Subject -like "*Agus Dwi R (Audira)*" } | Select-Object -First 1
    }
} catch {}

if (-not $cert) {
    Write-Host "[*] Creating new Code Signing Certificate for Agus Dwi R (Audira)..." -ForegroundColor Cyan
    try {
        $cert = New-SelfSignedCertificate -Type CodeSigningCert `
            -Subject $subject `
            -KeyUsage DigitalSignature `
            -FriendlyName "Agus Dwi R (Audira) Official Code Signer" `
            -CertStoreLocation "Cert:\CurrentUser\My" `
            -NotAfter (Get-Date).AddYears(10)
    } catch {
        Write-Host "[WARN] Tidak dapat membuat sertifikat self-signed: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "[+] Found existing Code Signing Certificate: $($cert.Thumbprint)" -ForegroundColor Green
}

if ($cert) {
    # Export public certificate (.cer)
    $distDir = "f:\AUDIRA-REMOTE-DEKSTOP\dist"
    if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force }
    $cerPath = Join-Path $distDir "AgusDwiR_Audira.cer"
    try {
        Export-Certificate -Cert $cert -FilePath $cerPath -Force | Out-Null
        Write-Host "[+] Exported Public Certificate to: $cerPath" -ForegroundColor Green
    } catch {}

    # Sign the binaries
    $filesToSign = @(
        "f:\AUDIRA-REMOTE-DEKSTOP\dist\AudiraDesk-v1.5.0-x86_64.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\dist\AudiraDesk.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\dist\AudiraDesk-install.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\dist\AudiraDesk-setup.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\AudiraDesk.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\audira.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\sciter.dll",
        "f:\AUDIRA-REMOTE-DEKSTOP\web\dist\AudiraDesk-v1.5.0-x86_64.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\web\dist\AudiraDesk.exe",
        "f:\AUDIRA-REMOTE-DEKSTOP\web\dist\AudiraDesk-install.exe"
    )

    foreach ($file in $filesToSign) {
        if (Test-Path $file) {
            Write-Host "[*] Signing $file..." -ForegroundColor Yellow
            try {
                $result = Set-AuthenticodeSignature -FilePath $file -Certificate $cert -HashAlgorithm SHA256 -ErrorAction SilentlyContinue
                if ($result) {
                    Write-Host "    Status: $($result.Status) - $($result.StatusMessage)" -ForegroundColor Cyan
                }
            } catch {}
        }
    }
} else {
    Write-Host "[INFO] Lewati penandatanganan kode karena sertifikat tidak tersedia." -ForegroundColor Gray
}
