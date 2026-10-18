@echo off
title AUDIRA Remote Desktop - Disk Space Cleaner
cd /d "%~dp0"

echo ==============================================================================
echo           AUDIRA Remote Desktop - Disk Space Reclamation Utility
echo ==============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\clean.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Cleaner exited with error code %errorlevel%
    pause
)
