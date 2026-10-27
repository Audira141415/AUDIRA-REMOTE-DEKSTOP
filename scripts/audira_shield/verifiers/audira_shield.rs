// Audira Signature Shield - Rust Verifier & Anti-Tamper Guard
// Dibuat khusus untuk aplikasi native / binary (AUDIRA-REMOTE-DEKSTOP)
// Memverifikasi bahwa aplikasi dijalankan secara sah dan berlisensi atas nama Agus Dwi R (Audira).

use std::collections::BTreeMap;

pub const DEFAULT_SECRET: &str = "AUDIRA_MASTER_SEC_KEY_2026_AGUS_DWI_R_IMMUTABLE_SIGNATURE_9981";
pub const EXPECTED_CREATOR: &str = "Agus Dwi R (Audira)";

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AudiraSignaturePayload {
    pub creator: String,
    pub owner_id: String,
    pub app_name: String,
    pub issued_date: String,
    pub canary_token: String,
    pub legal_notice: Option<String>,
    pub digital_signature: String,
}

pub struct AudiraShield;

impl AudiraShield {
    /// Membuat string kanonikal terurut untuk verifikasi HMAC
    fn canonical_string(payload: &AudiraSignaturePayload) -> String {
        let mut map = BTreeMap::new();
        map.insert("app_name", &payload.app_name);
        map.insert("canary_token", &canary_token_ref(&payload.canary_token));
        map.insert("creator", &payload.creator);
        map.insert("issued_date", &payload.issued_date);
        map.insert("owner_id", &payload.owner_id);

        serde_json::to_string(&map).unwrap_or_default()
    }

    /// Verifikasi apakah tanda tangan digital valid dan belum di-tamper
    pub fn verify(payload: &AudiraSignaturePayload, secret: Option<&str>) -> Result<(), String> {
        if payload.creator != EXPECTED_CREATOR {
            return Err(format!(
                "PELANGGARAN HAK CIPTA: Pembuat asli adalah '{}', tetapi terbaca '{}'",
                EXPECTED_CREATOR, payload.creator
            ));
        }

        if payload.digital_signature.is_empty() {
            return Err("Tanda tangan digital kosong atau tidak ditemukan.".to_string());
        }

        // Verifikasi HMAC-SHA256 jika HMAC dihitung
        let sec = secret.unwrap_or(DEFAULT_SECRET);
        let canonical = Self::canonical_string(payload);
        
        use sha2::Sha256;
        use hmac::{Hmac, Mac};
        type HmacSha256 = Hmac<Sha256>;

        if let Ok(mut mac) = HmacSha256::new_from_slice(sec.as_bytes()) {
            mac.update(canonical.as_bytes());
            let computed_bytes = mac.finalize().into_bytes();
            let computed_hex = hex::encode(computed_bytes);
            
            if computed_hex.to_lowercase() != payload.digital_signature.to_lowercase() {
                return Err("Tanda tangan digital CACAT/PALSU! Aplikasi telah dimodifikasi tanpa izin.".to_string());
            }
        }

        Ok(())
    }

    /// Verifikasi token Base64 ringkas
    pub fn verify_compact_token(token_b64: &str, secret: Option<&str>) -> Result<AudiraSignaturePayload, String> {
        let decoded_bytes = base64::decode(token_b64.trim())
            .map_err(|e| format!("Token Base64 tidak valid: {}", e))?;
            
        let payload: AudiraSignaturePayload = serde_json::from_slice(&decoded_bytes)
            .map_err(|e| format!("Format JSON rusak: {}", e))?;
            
        Self::verify(&payload, secret)?;
        Ok(payload)
    }

    /// Penjaga runtime: hentikan proses atau log jika ada pembajakan
    pub fn enforce(token_or_json: &str, expected_app: Option<&str>) -> bool {
        match Self::verify_compact_token(token_or_json, None) {
            Ok(payload) => {
                if let Some(app) = expected_app {
                    if payload.app_name != app {
                        eprintln!("[AUDIRA SHIELD VIOLATION] Nama aplikasi tidak cocok: {}", payload.app_name);
                        return false;
                    }
                }
                true
            }
            Err(err) => {
                eprintln!("==========================================================");
                eprintln!("[PERINGATAN KERAS / SECURITY SHIELD VIOLATION]");
                eprintln!("APLIKASI TELAH DIMODIFIKASI ATAU DIBUAT DARI HASIL BAJAKAN!");
                eprintln!("Pemilik Sah & Hak Cipta: {}", EXPECTED_CREATOR);
                eprintln!("Detail: {}", err);
                eprintln!("==========================================================");
                false
            }
        }
    }
}

fn canary_token_ref(s: &str) -> &str {
    s
}
