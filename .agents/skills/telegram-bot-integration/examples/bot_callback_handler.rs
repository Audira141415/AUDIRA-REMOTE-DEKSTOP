//! Reference Example: Telegram Inline Callback Dispatcher Pattern
//! Used by `src/auth_2fa.rs` for remote session 2FA approval.

pub enum ApprovalDecision {
    Approved(i32),
    Rejected(i32),
    InvalidPayload,
}

pub struct TelegramCallbackParser;

impl TelegramCallbackParser {
    /// Parses inline keyboard callback data safely
    pub fn parse_callback(data: &str) -> ApprovalDecision {
        let parts: Vec<&str> = data.split(':').collect();
        if parts.len() != 2 {
            return ApprovalDecision::InvalidPayload;
        }

        let action = parts[0];
        let conn_id = match parts[1].parse::<i32>() {
            Ok(id) => id,
            Err(_) => return ApprovalDecision::InvalidPayload,
        };

        match action {
            "approve" => ApprovalDecision::Approved(conn_id),
            "reject" => ApprovalDecision::Rejected(conn_id),
            _ => ApprovalDecision::InvalidPayload,
        }
    }
}
