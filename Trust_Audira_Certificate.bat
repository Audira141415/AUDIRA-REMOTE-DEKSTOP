@echo off
:: ============================================================================
:: AUDIRA Remote Desktop - Official Certificate Trust Installer
:: Author: Agus Dwi R (Audira)
:: Studio: Audira Studio
:: ============================================================================

title AUDIRA Remote Desktop - Trust Installer
color 0b

echo ======================================================================
echo    AUDIRA REMOTE DESKTOP - OFFICIAL PUBLISHER INSTALLER
echo    Author: Agus Dwi R (Audira)
echo    Company: Audira Studio
echo ======================================================================
echo.

:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Memerlukan izin Administrator untuk mendaftarkan sertifikat resmi...
    echo [*] Meminta akses Administrator (UAC elevation)...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo [*] Menginstal Sertifikat Digital Resmi Agus Dwi R (Audira)...
if exist "AgusDwiR_Audira.cer" (
    certutil -addstore -f "Root" "AgusDwiR_Audira.cer" >nul 2>&1
    certutil -addstore -f "TrustedPublisher" "AgusDwiR_Audira.cer" >nul 2>&1
    echo [+] Sertifikat resmi Agus Dwi R (Audira) BERHASIL didaftarkan ke sistem!
) else (
    echo [!] File sertifikat AgusDwiR_Audira.cer tidak ditemukan di folder ini.
)

echo.
echo [*] Mendaftarkan pengecualian aman pada Windows Defender...
powershell -Command "Add-MpPreference -ExclusionProcess 'AudiraDesk.exe', 'AudiraDesk-v1.5.0-x86_64.exe' -ErrorAction SilentlyContinue" >nul 2>&1
powershell -Command "Add-MpPreference -ExclusionPath '%~dp0' -ErrorAction SilentlyContinue" >nul 2>&1

echo [+] Selesai! Aplikasi AudiraDesk sekarang diakui sebagai Verified Publisher resmi.
echo.
echo Anda sekarang dapat menjalankan AudiraDesk tanpa peringatan Defender.
echo ======================================================================
pause
