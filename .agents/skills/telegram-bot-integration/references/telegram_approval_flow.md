# Telegram Remote Connection Approval Protocol Reference

## 1. Approval Handshake Architecture
When an incoming connection arrives and option `telegram-remote-approval` is enabled:
1. `src/server/connection.rs` creates an entry in `PENDING_APPROVALS` mutex map with a 30-second timeout.
2. The Telegram Bot worker sends a message containing the Peer ID, Remote IP, and inline keyboard buttons (`Setujui` / `Tolak`).
3. Screen streaming remains locked until an explicit approval callback is returned.

## 2. Callback Payload Format
- **Approve:** `approve:<conn_id>`
- **Reject:** `reject:<conn_id>`
- **Security Check:** Verifies incoming Telegram `chat_id` against the encrypted `bot` configuration secret.
