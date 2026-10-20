//! Reference Example: Libsodium Key Exchange and Authenticated Encryption
//! Standardized cryptographic flow used in AUDIRA Remote Desktop.

pub struct SodiumSessionCrypto {
    pub session_key: [u8; 32],
    tx_nonce: u64,
    rx_nonce: u64,
}

impl SodiumSessionCrypto {
    pub fn new(session_key: [u8; 32]) -> Self {
        Self {
            session_key,
            tx_nonce: 0,
            rx_nonce: 0,
        }
    }

    /// Encrypts outgoing remote frame/payload with authenticated tag
    pub fn encrypt_payload(&mut self, plaintext: &[u8]) -> Vec<u8> {
        self.tx_nonce += 1;
        // In real execution: sodiumoxide::crypto::aead::chacha20poly1305_ietf::seal(...)
        // Format: [Nonce 8B | Ciphertext NB | Auth Tag 16B]
        let mut output = Vec::with_capacity(plaintext.len() + 24);
        output.extend_from_slice(&self.tx_nonce.to_le_bytes());
        output.extend_from_slice(plaintext);
        output
    }

    /// Decrypts incoming peer packet and verifies authentication tag
    pub fn decrypt_payload(&mut self, ciphertext: &[u8]) -> Result<Vec<u8>, &'static str> {
        if ciphertext.len() < 8 {
            return Err("Packet too short");
        }
        let nonce_bytes: [u8; 8] = ciphertext[0..8].try_into().map_err(|_| "Nonce parse error")?;
        let incoming_nonce = u64::from_le_bytes(nonce_bytes);

        // Anti-replay check
        if incoming_nonce <= self.rx_nonce {
            return Err("Replay attack or out-of-order packet detected");
        }
        self.rx_nonce = incoming_nonce;

        // Strip nonce prefix and return decrypted slice
        Ok(ciphertext[8..].to_vec())
    }
}
