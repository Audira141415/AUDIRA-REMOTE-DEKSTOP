@echo off
setlocal
title AUDIRA Remote Desktop - Web Portal Preview

echo ======================================================================
echo           AUDIRA REMOTE DESKTOP - Official Web Portal                
echo           Created by Agus Dwi R (AUDIRA)                             
echo ======================================================================
echo.
echo [INFO] Membuka web Audira Desk di browser default Anda...

start "" "%~dp0index.html"

echo [SUCCESS] Web telah dibuka di peramban (browser).
echo Tekan sembarang tombol untuk keluar...
pause >nul
