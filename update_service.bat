@echo off
title AUDIRA DESK - Update Service & Program Files
echo Mengarahkan ke PowerShell Administrator...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%~dp0scripts\update_installed_service.ps1\"\"' -Verb RunAs"
echo Selesai.
timeout /t 3 >nul
