@echo off
title Audira Desk - Refresh Windows Icon Cache
echo ======================================================================
echo           AUDIRA DESK - REFRESH WINDOWS ICON CACHE                   
echo ======================================================================
echo.
echo [*] Membersihkan cache thumbnail dan icon Windows Explorer...
taskkill /f /im explorer.exe >nul 2>&1
timeout /t 1 /nobreak >nul
del /f /q "%localappdata%\IconCache.db" >nul 2>&1
del /f /q "%localappdata%\Microsoft\Windows\Explorer\iconcache_*.db" >nul 2>&1
start explorer.exe
echo.
echo [OK] Cache icon berhasil disegarkan! Ikon baru Audira Desk kini tampil di File Explorer.
echo ======================================================================
pause
