@echo off
title AUDIRA Remote Desktop - Shutdown Utility
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Shutdown script exited with error code %errorlevel%
    pause
)
