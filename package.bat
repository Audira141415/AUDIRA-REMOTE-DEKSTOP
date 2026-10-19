@echo off
title Audira Desk - Package for Other PCs
cd /d "%~dp0"

echo ==============================================================================
echo             Audira Desk - Buat Paket Ringan untuk PC Lain
echo ==============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\package.ps1" -Rebuild
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gagal membuat paket distribusi.
    pause
) else (
    echo.
    pause
)
