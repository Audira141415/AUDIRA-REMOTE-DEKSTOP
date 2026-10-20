# Flutter Rust Bridge (FFI) Integration Patterns

## 1. Threading & Synchronization Rules
- **No Dart UI Thread Blocking:** Never invoke blocking Rust calls (`std::thread::sleep`, heavy crypto loops, blocking disk writes) directly on synchronous FFI functions.
- **Event Streaming via `StreamSink`:** When pushing continuous real-time updates (connection status, remote session latency, file transfer progress, audio PCM), use an asynchronous `StreamSink<T>`.

## 2. StreamSink Memory & Lifecycle Contract
1. **Creation:** Dart passes a listener stream to Rust through an FFI registration call.
2. **Storage:** Rust stores `Option<StreamSink<T>>` protected inside a `RwLock` or `Mutex`.
3. **Destruction & Close:** When the remote window is closed or disconnected, Rust calls `sink.close()` and sets the option back to `None` to prevent memory leaks and broken pipe signals.
