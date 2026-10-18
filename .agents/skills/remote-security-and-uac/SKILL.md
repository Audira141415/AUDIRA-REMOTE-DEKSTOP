---
name: remote-security-and-uac
description: Handling Windows UAC privilege elevation, Secure Desktop interactions via elevated background service (src/service.rs), screen privacy mode, and permission gates.
---

# Remote Security & Windows UAC Elevation Skill

This skill documents how AUDIRA Remote Desktop manages elevated administrator permissions and screen privacy mode on Windows.

## 1. The Windows Session 0 & UAC Challenge
- Standard Windows applications running under user accounts cannot capture or inject keystrokes into the Secure Desktop (e.g. UAC prompts or `Ctrl+Alt+Del`).
- Attempting to interact with an un-elevated session results in a frozen screen until the local host interacts with the prompt.

## 2. Elevated Service Bridge (`src/service.rs`)
AUDIRA Remote Desktop installs a background Windows Service running as `NT AUTHORITY\SYSTEM`:
1. Client requests elevation in remote toolbar.
2. User-mode host process sends IPC token to `src/service.rs`.
3. Service spawns elevated capture and injection worker inside the active desktop session.
4. Remote operator can view and accept Windows UAC dialogs seamlessly.

## 3. Privacy Mode Implementation
To hide work on public screens:
1. Call display driver blackout / monitor standby API.
2. Intercept and block local keyboard and mouse events using Windows low-level input hooks (`WH_KEYBOARD_LL`, `WH_MOUSE_LL`).
3. Maintain safety watchdog: If remote session disconnects unexpectedly, instantly release hooks and restore monitor power.
