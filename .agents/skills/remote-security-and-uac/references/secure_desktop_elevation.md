# Windows UAC Elevation & Secure Desktop Architecture Reference

## 1. The Secure Desktop Problem
When a Windows UAC prompt appears, the operating system shifts the active session to the isolated `Winlogon` / `Consent` desktop. Standard user-mode applications cannot:
- Capture the screen (returns black frames).
- Inject mouse clicks or keystrokes into the UAC dialog.

## 2. AUDIRA Elevation Solution (`src/service.rs`)
AUDIRA runs a background Windows Service with `NT AUTHORITY\SYSTEM` privileges:
1. When user requests elevation, client issues IPC command to the elevated service.
2. The service creates an elevated process in the interactive user session via `CreateProcessAsUser` with `uiAccess=true` or attaches to the `Winlogon` desktop.
3. The elevated worker takes over screen capture and input injection until UAC interaction concludes.
