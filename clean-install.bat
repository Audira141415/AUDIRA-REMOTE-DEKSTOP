@echo off
setlocal enabledelayedexpansion
title Audira Desk - Clean Reinstall Utility
cd /d "%~dp0"

:: 1. Periksa Hak Akses Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ==============================================================================
    echo                 AUDIRA DESK - CLEAN REINSTALL (ELEVATION)
    echo ==============================================================================
    echo [UAC] Hak akses Administrator diperlukan untuk pembersihan & instalasi bersih.
    echo Membuka prompt Administrator Windows...
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/k cd /d \"%~dp0\" ^&^& \"%~dp0clean-install.bat\"' -Verb RunAs"
    exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install.ps1" -Action Clean
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Clean Reinstall keluar dengan error code %errorlevel%
    pause
)
