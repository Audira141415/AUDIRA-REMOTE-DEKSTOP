@echo off
title Audira Desk - Launcher
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Launcher exited with error code %errorlevel%
    pause
)
