@echo off
setlocal
title AUDIRA Remote Desktop - Web Portal Preview

echo ======================================================================
echo           AUDIRA REMOTE DESKTOP - Official Web Portal                
echo           Created by Agus Dwi R (AUDIRA)                             
echo ======================================================================
echo.
echo [*] Menjalankan server lokal di http://localhost:5050 ...
echo [*] Membuka browser default secara otomatis...
echo.

:: Membuka browser dengan jeda 1 detik agar server lokal siap melayani request
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:5050"

python -m http.server 5050 --directory "%~dp0"
if %errorlevel% neq 0 (
    npx -y serve "%~dp0" -l 5050
)
pause
