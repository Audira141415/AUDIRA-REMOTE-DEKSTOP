---
name: desktop-launcher-automation
description: Operational guide for executing, monitoring, and shutting down AUDIRA Remote Desktop using start.bat, stop.bat, and scripts/start.ps1.
---

# Desktop Launcher & Lifecycle Automation Skill

This skill documents how to manage the lifecycle of AUDIRA Remote Desktop using the provided automation scripts.

## 1. Launching the Desktop Application (`start.bat` / `scripts/start.ps1`)
- **Location:** [`start.bat`](file:///f:/AUDIRA-REMOTE-DEKSTOP/start.bat) & [`scripts/start.ps1`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/start.ps1)
- **Execution:** Double-click `start.bat` or run `./start.bat` in PowerShell/CMD.
- **Workflow:**
  1. Checks for running instances of `rustdesk.exe` or `RustDesk.exe`.
  2. Searches prioritized locations for an existing binary:
     - `f:\AUDIRA-REMOTE-DEKSTOP\rustdesk.exe`
     - `target\release\rustdesk.exe`
     - `flutter\build\windows\x64\runner\Release\rustdesk.exe`
     - System installation
  3. If found, launches the application instantly.
  4. If no binary exists, presents an interactive menu:
     - `[1]` Auto-download official v1.5.0 Windows binary directly from GitHub releases.
     - `[2]` Run via Flutter Desktop (`flutter run -d windows`).
     - `[3]` Compile release package (`python build.py --hwcodec`).
     - `[4]` Run backend Rust debug (`cargo run`).

## 2. Installing AUDIRA to System (`install.bat` / `scripts/install.ps1`)
- **Location:** [`install.bat`](file:///f:/AUDIRA-REMOTE-DEKSTOP/install.bat) & [`scripts/install.ps1`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/install.ps1)
- **Execution:** Double-click `install.bat` or run `./install.bat` in PowerShell/CMD (requests Administrator UAC elevation).
- **Workflow:**
  1. Locates binary `audira.exe` and `sciter.dll`.
  2. Installs application into `C:\Program Files\AUDIRA`.
  3. Registers elevated background service (`audira.exe --install-service`) for logon screen and UAC elevation handling.
  4. Generates Desktop & Start Menu shortcuts.
  5. Configures Windows Firewall rules for rendezvous and relay ports (21115-21119).

## 3. Reclaiming Disk Space (`clean.bat` / `scripts/clean.ps1`)
- **Location:** [`clean.bat`](file:///f:/AUDIRA-REMOTE-DEKSTOP/clean.bat) & [`scripts/clean.ps1`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/clean.ps1)
- **Execution:** Double-click `clean.bat` or run `./clean.bat`.
- **Purpose:** Safely cleans massive Cargo debug/release build caches (`target/debug` ~9.5 GB, `target/` ~13.3 GB) and tool archives without deleting the production `audira.exe` binary.

## 4. Terminating the Application Gracefully (`stop.bat` / `scripts/stop.ps1`)
- **Location:** [`stop.bat`](file:///f:/AUDIRA-REMOTE-DEKSTOP/stop.bat) & [`scripts/stop.ps1`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/stop.ps1)
- **Execution:** Double-click `stop.bat` or run `./stop.bat`.
- **Workflow:**
  1. Identifies and terminates processes: `audira`, `rustdesk`, `RustDesk`, `flutter_hbb`, `rustdesk-service`.
  2. Inspects local TCP connections on ports `21115`, `21116`, `21117`, `21118` and frees them.
  3. Verifies that all processes have released their memory and reports status.

## 5. Packaging for Other PCs (`package.bat` / `scripts/package.ps1`)
- **Location:** [`package.bat`](file:///f:/AUDIRA-REMOTE-DEKSTOP/package.bat) & [`scripts/package.ps1`](file:///f:/AUDIRA-REMOTE-DEKSTOP/scripts/package.ps1)
- **Execution:** Double-click `package.bat` or run `./package.bat`.
- **Output:** Creates a ultra-lightweight ZIP file (`dist/AUDIRA-RemoteDesktop-Windows-x64.zip`, **~17.2 MB**) ready to be copied to any other PC via Flashdisk or Cloud without requiring any development tools or source code.
