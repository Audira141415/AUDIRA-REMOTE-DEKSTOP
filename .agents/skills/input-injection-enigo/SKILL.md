---
name: input-injection-enigo
description: Cross-platform mouse and keyboard event simulation with libs/enigo, handling normalized coordinate translation, system scancodes, modifier keys, and touch emulation.
---

# Input Injection (libs/enigo) Skill

This skill explains how remote mouse and keyboard events are translated and injected into the target operating system via `libs/enigo`.

## 1. Normalized Coordinate Translation
Client transmits mouse coordinates normalized between `0.0` and `1.0`:
```rust
// In host input receiver:
let screen_width = display.width() as f32;
let screen_height = display.height() as f32;

let target_x = (event.x * screen_width) as i32 + display.offset_x();
let target_y = (event.y * screen_height) as i32 + display.offset_y();

enigo.mouse_move_to(target_x, target_y);
```

## 2. Special Key Combinations
To inject privileged keystrokes on Windows:
- `Ctrl+Alt+Del`: Windows intercepts this at kernel level; it must be requested via the elevated system service (`src/service.rs`).
- `Win+L`, `Alt+Tab`: Synthesized via Virtual Keycode sequence with proper modifier state release.

## 3. Keyboard Layout & Scancode Mapping
To avoid layout mismatch (e.g. AZERTY vs QWERTY):
- Pass raw platform scancodes alongside Unicode characters.
- Use `enigo.key_sequence(...)` for direct Unicode text input when IME is involved.
