//! Reference Example: Safe StreamSink Lifecycle Pattern for Flutter Rust Bridge
//! Prevents memory leaks and panics on disconnected UI listeners.

use std::sync::RwLock;

// Mock representation of Flutter Rust Bridge StreamSink
pub struct MockStreamSink<T> {
    pub is_closed: bool,
    _marker: std::marker::PhantomData<T>,
}

impl<T> MockStreamSink<T> {
    pub fn add(&self, _value: T) -> bool {
        !self.is_closed
    }

    pub fn close(&mut self) {
        self.is_closed = true;
    }
}

pub struct SessionEventManager {
    sink: RwLock<Option<MockStreamSink<String>>>,
}

impl SessionEventManager {
    pub const fn new() -> Self {
        Self {
            sink: RwLock::new(None),
        }
    }

    /// Register UI event sink from Flutter Dart runtime
    pub fn register_sink(&self, sink: MockStreamSink<String>) {
        if let Ok(mut lock) = self.sink.write() {
            *lock = Some(sink);
        }
    }

    /// Safely broadcast event to Flutter UI thread
    pub fn emit_event(&self, event: String) {
        if let Ok(lock) = self.sink.read() {
            if let Some(sink) = lock.as_ref() {
                sink.add(event);
            }
        }
    }

    /// Teardown and cleanup when window closes
    pub fn unregister_sink(&self) {
        if let Ok(mut lock) = self.sink.write() {
            if let Some(mut sink) = lock.take() {
                sink.close();
            }
        }
    }
}
