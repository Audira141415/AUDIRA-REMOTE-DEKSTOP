# End-to-End Encryption (E2EE) Specification & Libsodium

## 1. Cryptographic Primitives
- **Key Exchange (KEX):** X25519 (Elliptic Curve Diffie-Hellman over Curve25519).
- **Authenticated Encryption:** ChaCha20 stream cipher with Poly1305 MAC authenticator (IETF RFC 8439).
- **Key Derivation (KDF):** Blake2b or Argon2id for deriving permanent authentication keys from host password.
- **Nonce Strategy:** 64-bit or 96-bit monotonically incrementing counter per connection direction to prevent replay attacks.

## 2. Handshake Message Exchange
1. Client generates ephemeral keypair `(pk_client, sk_client)`.
2. Host generates ephemeral keypair `(pk_host, sk_host)`.
3. Client sends `pk_client` in initial rendezvous handshake message.
4. Host responds with `pk_host` and encrypted challenge verification token.
5. Both compute shared secret `ss = crypto_scalarmult(sk, pk_peer)`.
6. Symmetric session keys are derived using `crypto_kdf(ss)`.
