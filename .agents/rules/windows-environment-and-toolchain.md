# Windows Environment & Toolchain Compilation Rules
> **Rule ID**: `WIN-TOOLCHAIN-01`  
> **Target**: Seluruh AI Agent, Pair Programmer, dan Pengembang di AUDIRA Remote Desktop.  
> **Level**: MANDATORY (Wajib Dipatuhi Tanpa Pengecualian).

---

## 1. Persyaratan Toolchain Kompilasi Windows

AUDIRA Remote Desktop mengandalkan binding C/C++ tingkat rendah (`libvpx`, `libyuv`, `opus`, `aom`, DirectX 11/DXGI, Windows Audio WASAPI). Seluruh build lokal wajib memenuhi environment berikut:

1. **MSVC C++ Build Tools:**
   - Visual Studio 2022 (v143) atau Visual Studio Build Tools dengan komponen:
     - `MSVC v143 - VS 2022 C++ x64/x86 build tools`
     - `Windows 11 SDK (10.0.22621.0)` atau Windows 10 SDK terbaru
     - `C++ CMake tools for Windows`

2. **LLVM & Libclang Requirement:**
   - Crate `scrap` dan FFI generator memerlukan `clang` untuk parsing header native.
   - Variabel lingkungan wajib didefinisikan:
     ```powershell
     $env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"
     ```
   - Verifikasi melalui terminal: `clang --version`.

3. **VCPKG Static Library Integration:**
   - Dependensi C/C++ dikompilasi secara statis via triplet `x64-windows-static`.
   - Variabel lingkungan wajib:
     ```powershell
     $env:VCPKG_ROOT = "C:\vcpkg"
     $env:VCPKGRS_DYNAMIC = "0"
     ```

---

## 2. Flutter & Rust FFI Code Generation Rules

1. **Flutter Rust Bridge CLI Version Lock:**
   - Dilarang memperbarui `flutter_rust_bridge_codegen` secara sembarangan tanpa sinkronisasi versi library di `flutter/pubspec.yaml` dan `Cargo.toml`.
   - Versi generator harus identik bit-for-bit untuk mencegah perbedaan marshaling tipe data.

2. **Dilarang Menghapus Stub FFI yang Masih Direferensikan:**
   - Saat mengubah fungsi FFI yang diekspor ke Dart:
     - Pastikan seluruh binding Dart di `flutter/lib/common/` diperbarui secara simultan.
     - Lakukan `cargo check` sebelum menjalankan `flutter run`.

---

## 3. Eksekusi Script Launcher

1. Gunakan script resmi workspace untuk start/stop aplikasi:
   - [start.bat](file:///f:/AUDIRA-REMOTE-DEKSTOP/start.bat) atau [scripts/start.ps1](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/start.ps1)
   - [stop.bat](file:///f:/AUDIRA-REMOTE-DEKSTOP/stop.bat) atau [scripts/stop.ps1](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/stop.ps1)
2. Jangan meninggalkan orphaned process background `audira.exe` saat melakukan testing berulang.
