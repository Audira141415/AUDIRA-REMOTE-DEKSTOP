# Flutter Desktop Multi-Window Lifecycle Reference

## 1. Multi-Window Architecture (`desktop_multi_window`)
AUDIRA manages each remote session as an independent OS window rather than an in-app modal:
- **Main Window (Window ID 0):** Houses the main dashboard, ID display, address book, and configuration settings.
- **Session Windows (Window ID > 0):** Dedicated window running an isolated Flutter engine instance communicating via JSON IPC with the main window and native Rust core.

## 2. Event Dispatching
Sub-windows communicate with the main window using:
```dart
DesktopMultiWindow.invokeMethod(windowId, 'onRemoteDisconnect', {'id': peerId});
```
On window close, the window must broadcast teardown event to release textures, audio streams, and socket channels.
