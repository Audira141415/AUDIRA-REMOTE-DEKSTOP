---
name: packaging-and-build
description: Build instructions and scripts for compiling vcpkg static dependencies, Cargo feature flags, and multi-platform packaging (Windows NSIS/MSI, Linux deb/AppImage, macOS DMG, Android APK).
---

# Packaging & Multi-Platform Build Skill

This skill provides step-by-step instructions for setting up build environments, compiling native multimedia dependencies, and generating release installers for AUDIRA Remote Desktop.

## 1. Prerequisites Setup (Windows)
```powershell
# 1. Install vcpkg dependencies
set VCPKG_ROOT=C:\path\to\vcpkg
cd %VCPKG_ROOT%
git checkout 2023.04.15
.\vcpkg.exe install libvpx:x64-windows-static libyuv:x64-windows-static opus:x64-windows-static aom:x64-windows-static

# 2. Build Rust backend with hardware codec
cargo build --release --features "flutter,hwcodec"
```

## 2. Compiling the Flutter Frontend
```powershell
cd flutter
flutter pub get
flutter build windows --release
```

## 3. Automated Packaging with `build.py`
The project includes a comprehensive Python build script (`build.py`):
```powershell
# Compile release binary with hardware codec
python build.py --hwcodec

# Create portable package / installer
python build.py --hwcodec --portable
```

## 4. Linux Packaging
```bash
# Build Debian package
cargo deb

# Build AppImage
python3 build.py --appimage
```
