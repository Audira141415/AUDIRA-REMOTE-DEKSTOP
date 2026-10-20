# Input Injection & Keyboard Scancode Mapping Reference

## 1. Multi-Platform Input Simulation
Input injection in AUDIRA is abstracted via `libs/enigo/`.

### Key Platform APIs:
- **Windows:** `SendInput` API using hardware scancodes (`KEYEVENTF_SCANCODE`) to bypass software synthetic event filters in DirectInput / DirectX games.
- **Linux X11:** `XTestFakeKeyEvent` and `XTestFakeMotionEvent`.
- **Linux Wayland:** `libei` (Emulated Input protocol) or virtual device via `/dev/uinput`.
- **macOS:** `CGEventCreateKeyboardEvent` / `CGEventPost(kCGHIDEventTap, ...)`.

## 2. Special Key Combinations (SAS - Secure Attention Sequence)
- **Ctrl+Alt+Delete:** Windows restricts synthetic CAD from standard user processes. Emulation requires elevated service rights (`src/service.rs`) communicating with the winlogon process via `SendSAS`.
