---
name: e2ee-encryption-sodium
description: Cryptographic implementation patterns using Libsodium, Curve25519 (X25519) key exchange, ChaCha20-Poly1305 symmetric authenticated encryption, and permanent salted password hashing.
---

# End-to-End Encryption (Libsodium) Skill

This skill documents the cryptographic procedures and primitives implemented in AUDIRA Remote Desktop for securing all control and media channels.

## 1. Asymmetric Key Exchange (X25519)
- Client and Host generate ephemeral Curve25519 keypairs.
- Exchange public keys via rendezvous signaling.
- Compute shared secret using `crypto_scalarmult`:
```rust
// Deriving symmetric shared session key
let shared_secret = sodiumoxide::crypto::scalarmult::scalarmult(&my_secret_key, &peer_public_key)?;
let session_key = derive_kdf(&shared_secret, "AUDIRA-SESSION-V1");
```

## 2. Authenticated Symmetric Stream Cipher (ChaCha20-Poly1305)
Every media or control packet is encrypted with:
- **Cipher:** `crypto_secretbox_easy` (ChaCha20-Poly1305)
- **Nonce:** Incremental 24-byte nonce (prevents replay attacks)
- **Tag:** 16-byte Poly1305 authentication tag verified on arrival

## 3. Password Hashing for Unattended Access
- Plaintext passwords must NEVER be saved to disk.
- Use Argon2id or scrypt with a unique per-device salt:
```rust
// Verify incoming password attempt
let is_valid = sodiumoxide::crypto::pwhash::pwhash_verify(&stored_hash, candidate_password.as_bytes());
```
