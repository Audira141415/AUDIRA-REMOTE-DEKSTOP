@echo off
title Audira Desk - System Installer
cd /d "%~dp0"

echo ==============================================================================
echo                    Audira Desk - System Installer
echo ==============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install.ps1" %*
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Installer exited with error code %errorlevel%
    pause
)
