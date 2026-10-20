# Packaging & Static VCPKG Triplet Reference

## 1. Static Compilation Triplet (`x64-windows-static`)
To prevent missing DLL runtime errors (`libvpx.dll`, `opus.dll`) on end-user machines, AUDIRA uses static linking for native C/C++ dependencies:
- **Triplet File:** `vcpkg/triplets/x64-windows-static.cmake`
- **Key Parameters:**
  ```cmake
  set(VCPKG_TARGET_ARCHITECTURE x64)
  set(VCPKG_CRT_LINKAGE static)
  set(VCPKG_LIBRARY_LINKAGE static)
  ```

## 2. Release Distribution Checklist
1. Build Rust core libraries with `--release`.
2. Generate Flutter desktop release bundle (`flutter build windows --release`).
3. Copy `audira.exe` and dependent runtime assets into output distribution directory.
4. Execute code signing via Authenticode certificate (`signtool.exe`).
5. Package into standalone installer using NSIS script.
