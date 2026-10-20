# Windows Build Troubleshooting & Error Resolution Matrix

| Error Signature | Root Cause | Resolution Action |
| :--- | :--- | :--- |
| `fatal error: 'clang/Basic/Version.h' file not found` or `LIBCLANG_PATH` | LLVM binaries missing from PATH or env variable unset. | Install LLVM 15+ and set `$env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"`. |
| `vcpkg: could not find libvpx` | Static triplet package missing in vcpkg root. | Execute `vcpkg install libvpx:x64-windows-static libyuv:x64-windows-static opus:x64-windows-static aom:x64-windows-static`. |
| `LNK1181: cannot open input file '...lib'` | Target architecture mismatch (x86 vs x64) or CMake generator mismatch. | Ensure Cargo and MSVC build tools target identical 64-bit architecture (`x86_64-pc-windows-msvc`). |
| `flutter_rust_bridge_codegen version mismatch` | Local CLI binary version diverges from `Cargo.toml` dependency. | Run `cargo install flutter_rust_bridge_codegen --version <LOCKED_VERSION> --force`. |
