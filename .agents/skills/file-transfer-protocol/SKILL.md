---
name: file-transfer-protocol
description: Secure chunked file transfer protocol in libs/base/src/fs.rs, directory enumeration, SHA-256 chunk integrity verification, resume capability, and path traversal prevention.
---

# Secure File Transfer Protocol Skill

This skill explains how AUDIRA Remote Desktop safely enumerates filesystems and streams chunked file payloads between peers in `libs/base/src/fs.rs`.

## 1. Directory Traversal Security Guardrails
Never accept unchecked paths from remote peers:
```rust
// Canonicalize path and ensure it does not escape boundary
pub fn sanitize_remote_path(base: &Path, requested: &str) -> Result<PathBuf, std::io::Error> {
    let clean = requested.trim_start_matches('/').trim_start_matches('\\');
    let candidate = base.join(clean);
    if candidate.starts_with(base) {
        Ok(candidate)
    } else {
        Err(std::io::Error::new(
            std::io::ErrorKind::PermissionDenied,
            "Illegal path traversal attempt detected",
        ))
    }
}
```

## 2. Chunked Streaming Protocol
- Files are split into sequential chunks of 64 KB – 256 KB.
- Each chunk payload packet carries:
  - `file_id`: UUID of transfer session
  - `chunk_offset`: Byte position in target file
  - `data`: Binary payload
  - `is_last_chunk`: Boolean flag
  - `checksum`: CRC32 or SHA-256 slice hash

## 3. Resume Broken Transfers
Before uploading:
1. Sender queries `GetFileSize(path)`.
2. Receiver checks existing temporary file size.
3. If partial file exists, transfer resumes at `current_bytes_offset` rather than restarting from zero.
