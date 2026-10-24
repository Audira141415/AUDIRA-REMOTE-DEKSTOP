@echo off
setlocal
title AUDIRA Remote Desktop - Web Portal Preview

echo ======================================================================
echo           AUDIRA REMOTE DESKTOP - Official Web Portal                
echo           AUDIRA Multimedia Digital (Open Source)
echo ======================================================================
echo.
echo [*] Menjalankan server lokal di http://localhost:5050 ...
echo [*] Membuka browser default secara otomatis...
echo.

:: Bersihkan proses python lama yang mungkin masih menggantung di port 5050
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5050" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Membuka browser dengan jeda 1 detik agar server lokal siap melayani request
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:5050"

python -m http.server 5050 --bind 0.0.0.0 --directory "%~dp0"
if %errorlevel% neq 0 (
    npx -y serve "%~dp0" -l 5050
)
pause
