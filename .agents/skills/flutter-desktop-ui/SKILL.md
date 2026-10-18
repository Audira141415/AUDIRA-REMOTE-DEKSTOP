---
name: flutter-desktop-ui
description: Patterns for Flutter desktop applications, multi-window orchestration with desktop_multi_window, system tray integration, window management, and custom session toolbars.
---

# Flutter Desktop UI Architecture Skill

This skill explains how desktop-specific features are implemented in the Flutter presentation layer (`flutter/lib/desktop/`).

## 1. Multi-Window Management (`desktop_multi_window`)
Each active remote desktop session runs in its own native OS window:
```dart
// Launching remote session window
final window = await DesktopMultiWindow.createWindow(jsonEncode({
  'peer_id': peerId,
  'session_mode': 'remote_control',
}));
window
  ..setFrame(const Offset(100, 100) & const Size(1280, 800))
  ..setTitle('AUDIRA Remote Desktop - $peerId')
  ..show();
```

## 2. Window Framing & Fullscreen (`window_manager`)
- Control window sizing, minimize to system tray, and fullscreen toggle:
```dart
await windowManager.setFullScreen(isFullScreen);
```

## 3. Remote Session Toolbar Layout
- Auto-hiding floating pill at the top of the viewport.
- Contains:
  - Connection Health HUD (Latency ms, FPS, Bitrate, Direct/Relay badge)
  - Display selector (Monitor 1, 2, All)
  - Codec & Quality selector (Auto, Speed, Balanced, Quality)
  - Privacy Mode toggle
  - Actions (File Transfer, Send Ctrl+Alt+Del, Chat, Disconnect)
