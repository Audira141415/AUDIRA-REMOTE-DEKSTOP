# PowerShell Script: Verify Windows Toolchain Prerequisites
# Audits compilers, LLVM, CMake, and environment variables.

Write-Host ">>> Checking Windows Development Environment for AUDIRA..." -ForegroundColor Cyan

$Tools = @(
    @{ Name = "Rust Cargo"; Command = "cargo"; Args = "--version" },
    @{ Name = "Flutter SDK"; Command = "flutter"; Args = "--version" },
    @{ Name = "LLVM Clang"; Command = "clang"; Args = "--version" },
    @{ Name = "CMake"; Command = "cmake"; Args = "--version" }
)

foreach ($T in $Tools) {
    if (Get-Command $T.Command -ErrorAction SilentlyContinue) {
        $Ver = (& $T.Command ($T.Args -split ' ') 2>&1 | Select-Object -First 1)
        Write-Host "  [OK] $($T.Name): $Ver" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $($T.Name) command not found in PATH." -ForegroundColor Red
    }
}

if ($env:LIBCLANG_PATH) {
    Write-Host "  [OK] LIBCLANG_PATH set to: $env:LIBCLANG_PATH" -ForegroundColor Green
} else {
    Write-Host "  [WARN] LIBCLANG_PATH environment variable is not defined!" -ForegroundColor Yellow
}
