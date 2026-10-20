# Chunked File Streaming & Path Sanitization Reference

## 1. Chunked Protocol Specification
- **Chunk Size:** 64 KB (65,536 bytes) per chunk payload.
- **Checksum:** SHA-256 computed incrementally per chunk and verified on final file assembly.
- **Resume Protocol:** Client requests resume by sending file size offset `start_offset`. Host seeks file pointer to `start_offset` and streams remaining bytes.

## 2. Directory Traversal Defense
When processing client file browse or write requests:
1. Canonicalize destination root path (`std::fs::canonicalize`).
2. Reject any target path containing relative navigation segments (`..`, `./`, `\\..`).
3. Assert `target_path.starts_with(allowed_root_directory)`.
