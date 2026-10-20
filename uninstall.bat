@echo off
setlocal enabledelayedexpansion
title Audira Desk - System Uninstaller
cd /d "%~dp0"

:: 1. Periksa Hak Akses Administrator (Elevate automatically if double-clicked)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ==============================================================================
    echo                 AUDIRA DESK - UNINSTALLER (ELEVATION)
    echo ==============================================================================
    echo [UAC] Hak akses Administrator diperlukan untuk mencopot instalasi Audira Desk.
    echo Membuka prompt Administrator Windows...
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/k cd /d \"%~dp0\" ^&^& \"%~dp0uninstall.bat\" %*' -Verb RunAs"
    exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install.ps1" -Action Uninstall %*
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Uninstaller keluar dengan error code %errorlevel%
    pause
)
