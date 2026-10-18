---
name: build-troubleshooting-windows
description: Step-by-step resolution runbook for common Windows build and compilation errors in AUDIRA Remote Desktop (LLVM libclang, flutter_rust_bridge FFI, and vcpkg C++ static libraries).
---

# Windows Build Troubleshooting & Resolution Runbook

This skill provides verified procedures to resolve the most common build and compilation failures encountered when developing AUDIRA Remote Desktop on Windows.

## 1. Error: `Unable to find libclang: couldn't find any valid shared libraries matching: ['clang.dll', 'libclang.dll']`
- **Cause:** Crate `kcp-sys` uses `bindgen` to compile C headers into Rust FFI, which requires LLVM / Clang.
- **Resolution:**
  1. Install LLVM via winget or chocolatey:
     ```powershell
     winget install LLVM.LLVM
     ```
  2. Set the environment variable:
     ```powershell
     [System.Environment]::SetEnvironmentVariable('LIBCLANG_PATH', 'C:\Program Files\LLVM\bin', 'User')
     $env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"
     ```

## 2. Error: `'RustdeskImpl' isn't a type` / Missing `generated_bridge.dart`
- **Cause:** Dart code requires code-generated FFI types from `src/flutter_ffi.rs`.
- **Resolution:**
  1. Install `flutter_rust_bridge_codegen` matching the project version:
     ```powershell
     cargo install flutter_rust_bridge_codegen --version 1.80.1
     ```
  2. Generate the bridge file:
     ```powershell
     flutter_rust_bridge_codegen --rust-input src/flutter_ffi.rs --dart-output flutter/lib/generated_bridge.dart
     ```

## 3. Error: Incompatible Flutter Version (Flutter 3.32 vs Flutter 3.16)
- **Cause:** Breaking changes in newer Flutter versions (`google_fonts`, `SelectionHandler`, `DialogThemeData`).
- **Resolution:**
  - **Preferred:** Use Flutter 3.16.x channel for building RustDesk.
  - **Alternative:** Patch `google_fonts` in `pubspec.yaml` to `^6.1.0` or override `extended_text` dependency.

## 4. Error: Missing C++ Static Dependencies (`vcpkg`)
- **Cause:** RustDesk video and audio codecs link statically with vcpkg packages on Windows.
- **Resolution:**
  ```powershell
  git clone https://github.com/microsoft/vcpkg C:\vcpkg
  cd C:\vcpkg; .\bootstrap-vcpkg.bat
  .\vcpkg.exe install libvpx:x64-windows-static libyuv:x64-windows-static opus:x64-windows-static aom:x64-windows-static
  $env:VCPKG_ROOT = "C:\vcpkg"
  ```
