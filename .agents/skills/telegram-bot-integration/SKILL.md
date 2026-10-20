---
name: telegram-bot-integration
description: Complete guide for Audira Remote Desktop Telegram Bot integration, 2FA credential retrieval, auto-dispatch, and remote connection approval system.
---

# Telegram Bot Integration & Remote Approval Architecture

## Overview
Audira Remote Desktop features native, bidirectional Telegram Bot integration implemented in Rust (`src/auth_2fa.rs`) and Dart/Flutter (`flutter/lib/desktop/pages/desktop_setting_page.dart` and `flutter/lib/common/widgets/dialog.dart`).

The bot performs two critical roles:
1. **Interactive Assistant**: Remote operators and hosts can query temporary passwords (`/pass` or `/id`), host specs (`/status` or `/specs`), and request a new password (`/refresh`).
2. **2FA Consent & Approval Gate**: When an incoming remote desktop session attempts to connect, an interactive message is dispatched with inline buttons (`Approve` / `Reject`). Clicking **Setujui** unlocks the session; clicking **Tolak** terminates the connection immediately.

---

## 1. Architectural Components

```
                          ┌────────────────────────┐
                          │   Telegram Bot API     │
                          │ (api.telegram.org/bot) │
                          └───────────┬────────────┘
                                      │ Long Polling (offset)
                                      ▼
                        ┌───────────────────────────┐
                        │   Rust Bot Background     │
                        │    Worker (auth_2fa.rs)   │
                        └───────┬───────────┬───────┘
                                │           │
              Connection Event  │           │ Interactive Callback
                     ┌──────────┘           └──────────┐
                     ▼                                 ▼
         ┌───────────────────────┐         ┌────────────────────────┐
         │ src/server/connection │         │ ui_cm_interface::      │
         │ - try_start_cm() hook │         │ authorize() / close()  │
         └───────────────────────┘         └────────────────────────┘
```

### 1.1 Credential & Bot State Storage
- The bot configuration (`token` and `chat_id`) is encrypted with Libsodium and stored in the local config under option key `"bot"`.
- Options toggleable via Flutter Settings:
  - `auto-telegram-password`: When enabled (`'Y'`), changes to temporary password are automatically dispatched to the bot.
  - `telegram-remote-approval`: When enabled (`'Y'`), incoming connections require approval via Telegram inline keyboard before screen streaming starts.

### 1.2 Interactive Commands Handled
- `/start` or `/help`: Displays available commands and instructions.
- `/pass` or `/id`: Retrieves Hostname, Remote ID, Temporary Password, and Server.
- `/status` or `/specs`: Returns comprehensive system diagnostics (Host, Remote ID, OS & Architecture, Service status, Server, active client count, and encryption cipher).
- `/refresh`: Generates a new temporary password and updates the client UI.

### 1.3 Inline Callback Approvals
When a peer initiates a connection:
- `send_approval_request_to_telegram(conn_id, peer_id, peer_ip)` is invoked.
- Telegram sends a message with inline buttons:
  - `[✅ Setujui (Approve)]` with callback data `approve:<conn_id>`
  - `[❌ Tolak (Reject)]` with callback data `reject:<conn_id>`
- The long polling worker catches the `callback_query`:
  - For `approve:<conn_id>`: calls `crate::ui_cm_interface::authorize(conn_id)`
  - For `reject:<conn_id>`: calls `crate::ui_cm_interface::close(conn_id)`
  - Acknowledges with `answer_callback_query` and edits the message to show final verdict.

---

## 2. Testing & Verification

An automated verification test script is located at:
`scripts/test_telegram_integration.py`

Run the test suite with:
```bash
python scripts/test_telegram_integration.py
```
This tests:
1. Telegram Bot Token validation (`getMe`)
2. Chat ID accessibility
3. Outbound notification delivery
4. Callback query parsing and approval mapping
5. API Server heartbeat and audit log synchronization

---

## 3. Security Considerations
- Bot token is never saved in plaintext; it is encrypted with local machine secret salt.
- Callback queries enforce strict integer connection ID matching against `PENDING_APPROVALS` mutex map.
- If no response is received before timeout (30 seconds), the connection is rejected by default.
