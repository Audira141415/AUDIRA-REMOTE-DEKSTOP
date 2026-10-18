---
name: rust-ffi-flutter-bridge
description: Guidelines and patterns for Flutter Rust Bridge (flutter_rust_bridge), asynchronous stream sink handling, Protobuf DTOs, and memory lifecycle between Rust and Dart.
---

# Rust FFI & Flutter Bridge Skill

This skill provides technical instructions and code patterns for connecting Rust application logic with the Flutter user interface via `flutter_rust_bridge` in AUDIRA Remote Desktop.

## 1. Core Principles
1. **Never Block the Dart UI Thread:** Any operation that takes longer than 1ms must be executed asynchronously in Rust via Tokio tasks or background threads.
2. **Use StreamSink for Event Streaming:** Real-time data streams (connection status, video texture updates, audio frames, latency metrics) should be pushed via `StreamSink<T>`.
3. **Graceful Error Handling:** Never panic across FFI boundaries. Always catch errors and return `Result<T, BridgeError>`.

## 2. Generating & Updating FFI Bindings
When modifying FFI methods in `src/flutter_ffi.rs`:
```powershell
# Jalankan code generator flutter_rust_bridge
flutter_rust_bridge_codegen --rust-input src/flutter_ffi.rs --dart-output flutter/lib/generated_bridge.dart
```

## 3. Idiomatic Rust FFI Function Pattern
```rust
use flutter_rust_bridge::StreamSink;

pub fn start_session_telemetry(
    sink: StreamSink<SessionTelemetryDto>,
    peer_id: String,
) -> Result<(), String> {
    tokio::spawn(async move {
        loop {
            let metrics = match get_peer_metrics(&peer_id).await {
                Ok(m) => m,
                Err(_) => break,
            };
            if !sink.add(metrics.into()) {
                break; // Stream sink closed by Flutter
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
        }
    });
    Ok(())
}
```

## 4. Resource Teardown & Texture Cleanup
When a session closes in Flutter (`onClose`):
1. Dart calls `close_session(peer_id)`.
2. Rust removes session handles from global connection registry.
3. GPU texture buffers registered with `TextureRegistry` are unregistered to avoid memory leaks.
