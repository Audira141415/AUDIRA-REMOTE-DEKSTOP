@echo off
setlocal enabledelayedexpansion
title Audira Desk - System Installer & Life-Cycle Utility
cd /d "%~dp0"

:: 1. Periksa Hak Akses Administrator (Elevate automatically if double-clicked)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ==============================================================================
    echo                 AUDIRA DESK - SYSTEM INSTALLER (ELEVATION)
    echo ==============================================================================
    echo [UAC] Hak akses Administrator diperlukan untuk mengelola Program Files & Service.
    echo Membuka prompt Administrator Windows...
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/k cd /d \"%~dp0\" ^&^& \"%~dp0install.bat\" %*' -Verb RunAs"
    exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install.ps1" %*
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Installer keluar dengan error code %errorlevel%
    pause
)
