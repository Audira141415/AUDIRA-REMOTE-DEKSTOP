@echo off
title Audira Desk - Update Installed Service
cd /d "%~dp0"
echo ==============================================================================
echo       Memperbarui Program Files & Windows Service Audira Desk...
echo ==============================================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update_installed_service.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Update exited with error code %errorlevel%
    pause
)
