@echo off
setlocal enabledelayedexpansion
title Audira Desk - GitHub Save and Push Utility
cd /d "%~dp0"

echo ==============================================================================
echo                 AUDIRA DESK - GITHUB SAVE AND PUSH UTILITY
echo ==============================================================================
echo Remote URL : https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP.git
echo Branch     : main
echo ==============================================================================
echo.

REM 1. Verifikasi instalasi Git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git tidak ditemukan di PATH sistem.
    echo Silakan instal Git for Windows terlebih dahulu: https://git-scm.com/
    echo.
    pause
    exit /b 1
)

REM 2. Inisialisasi Git jika belum ada
if not exist ".git" (
    echo [*] Menginisialisasi repositori Git lokal...
    git init
    git branch -M main
    echo.
)

REM 3. Konfigurasi Remote Origin
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Menambahkan remote origin...
    git remote add origin https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP.git
) else (
    git remote set-url origin https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP.git
)

REM 4. Minta input pesan commit dari pengguna
set "DEFAULT_MSG=Update Audira Desk v1.5.1 - %DATE% %TIME%"
echo.
set "USER_MSG="
set /p "USER_MSG=Masukkan pesan commit (Tekan Enter untuk default): "
if not defined USER_MSG set "USER_MSG=!DEFAULT_MSG!"
set "TEST_EMPTY=!USER_MSG: =!"
if "!TEST_EMPTY!"=="" set "USER_MSG=!DEFAULT_MSG!"

REM 5. Staging berkas
echo.
echo [*] Melakukan git add (mengabaikan file cache/build sesuai .gitignore)...
git add .

REM 6. Periksa apakah ada perubahan untuk dicommit
git diff --cached --quiet
if %errorlevel% neq 0 (
    echo [*] Menyimpan commit: "!USER_MSG!"...
    git commit -m "!USER_MSG!"
) else (
    echo [INFO] Tidak ada perubahan baru yang perlu di-commit.
)

REM 7. Pastikan branch bernama 'main'
git branch -M main

REM 8. Push ke GitHub
echo.
echo [*] Mengunggah (push) ke GitHub...
git push -u origin main
set "PUSH_STATUS=%errorlevel%"
if !PUSH_STATUS! neq 0 (
    echo.
    echo [WARN] Push pertama ditolak. Kemungkinan remote memiliki commit berbeda.
    echo [*] Mencoba sinkronisasi aman: git pull --rebase origin main...
    git pull --rebase origin main
    echo [*] Mengulang proses push ke GitHub...
    git push -u origin main
    set "PUSH_STATUS=!errorlevel!"
)

REM 9. Status Akhir
echo.
if !PUSH_STATUS! equ 0 (
    echo ==============================================================================
    echo   [SUKSES] Seluruh berkas Audira Desk berhasil di-push ke GitHub!
    echo   Lihat di: https://github.com/Audira141415/AUDIRA-REMOTE-DEKSTOP
    echo ==============================================================================
) else (
    echo ==============================================================================
    echo   [PERHATIAN] Push belum berhasil.
    echo   Jika diminta autentikasi, masukkan Personal Access Token [PAT] atau
    echo   login melalui GitHub Credential Manager di browser Anda.
    echo ==============================================================================
)
echo.
pause
