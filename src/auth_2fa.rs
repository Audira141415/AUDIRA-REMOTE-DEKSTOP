use hbb_common::{
    anyhow::anyhow,
    bail,
    config::Config,
    get_time,
    log,
    password_security::{decrypt_vec_or_original, encrypt_vec_or_original},
    tokio,
    ResultType,
};
use serde_derive::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicBool, AtomicI32, Ordering},
        Mutex,
    },
    time::{Duration, Instant},
};
use totp_rs::{Algorithm, Secret, TOTP};

#[derive(Clone, Debug)]
struct PendingApproval {
    chat_id: String,
    message_id: i64,
    peer_id: String,
    name: String,
    created_at: Instant,
}

lazy_static::lazy_static! {
    static ref CURRENT_2FA: Mutex<Option<(TOTPInfo, TOTP)>> = Mutex::new(None);
    static ref PENDING_APPROVALS: Mutex<HashMap<i32, PendingApproval>> = Mutex::new(HashMap::new());
}

static LAST_APPROVAL_CONN_ID: AtomicI32 = AtomicI32::new(0);
static TELEGRAM_SERVICE_STARTED: AtomicBool = AtomicBool::new(false);

const ISSUER: &str = "RustDesk";
const TAG_LOGIN: &str = "Connection";

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TOTPInfo {
    pub name: String,
    pub secret: Vec<u8>,
    pub digits: usize,
    pub created_at: i64,
}

impl TOTPInfo {
    fn new_totp(&self) -> ResultType<TOTP> {
        let totp = TOTP::new(
            Algorithm::SHA1,
            self.digits,
            1,
            30,
            self.secret.clone(),
            Some(format!("{} {}", ISSUER, TAG_LOGIN)),
            self.name.clone(),
        )?;
        Ok(totp)
    }

    fn gen_totp_info(name: String, digits: usize) -> ResultType<TOTPInfo> {
        let secret = Secret::generate_secret();
        let totp = TOTPInfo {
            secret: secret.to_bytes()?,
            name,
            digits,
            created_at: get_time(),
            ..Default::default()
        };
        Ok(totp)
    }

    pub fn into_string(&self) -> ResultType<String> {
        let secret = encrypt_vec_or_original(self.secret.as_slice(), "00", 1024);
        let totp_info = TOTPInfo {
            secret,
            ..self.clone()
        };
        let s = serde_json::to_string(&totp_info)?;
        Ok(s)
    }

    pub fn from_str(data: &str) -> ResultType<TOTP> {
        let mut totp_info = serde_json::from_str::<TOTPInfo>(data)?;
        let (secret, success, _) = decrypt_vec_or_original(&totp_info.secret, "00");
        if success {
            totp_info.secret = secret;
            return Ok(totp_info.new_totp()?);
        } else {
            bail!("decrypt_vec_or_original 2fa secret failed")
        }
    }
}

pub fn generate2fa() -> String {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let id = crate::ipc::get_id();
    #[cfg(any(target_os = "android", target_os = "ios"))]
    let id = Config::get_id();
    if let Ok(info) = TOTPInfo::gen_totp_info(id, 6) {
        if let Ok(totp) = info.new_totp() {
            let code = totp.get_url();
            *CURRENT_2FA.lock().unwrap() = Some((info, totp));
            return code;
        }
    }
    "".to_owned()
}

pub fn verify2fa(code: String) -> bool {
    if let Some((info, totp)) = CURRENT_2FA.lock().unwrap().as_ref() {
        if let Ok(res) = totp.check_current(&code) {
            if res {
                if let Ok(v) = info.into_string() {
                    #[cfg(not(any(target_os = "android", target_os = "ios")))]
                    crate::ipc::set_option("2fa", &v);
                    #[cfg(any(target_os = "android", target_os = "ios"))]
                    Config::set_option("2fa".to_owned(), v);
                    return res;
                }
            }
        }
    }
    false
}

pub fn get_2fa(raw: Option<String>) -> Option<TOTP> {
    TOTPInfo::from_str(&raw.unwrap_or(Config::get_option("2fa")))
        .map(|x| Some(x))
        .unwrap_or_default()
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TelegramBot {
    #[serde(skip)]
    pub token_str: String,
    pub token: Vec<u8>,
    pub chat_id: String,
}

impl TelegramBot {
    fn into_string(&self) -> ResultType<String> {
        let token = encrypt_vec_or_original(self.token_str.as_bytes(), "00", 1024);
        let bot = TelegramBot {
            token,
            ..self.clone()
        };
        let s = serde_json::to_string(&bot)?;
        Ok(s)
    }

    fn save(&self) -> ResultType<()> {
        let s = self.into_string()?;
        #[cfg(not(any(target_os = "android", target_os = "ios")))]
        crate::ipc::set_option("bot", &s);
        #[cfg(any(target_os = "android", target_os = "ios"))]
        Config::set_option("bot".to_owned(), s);
        Ok(())
    }

    pub fn get() -> ResultType<Option<TelegramBot>> {
        let data = Config::get_option("bot");
        if data.is_empty() {
            return Ok(None);
        }
        let mut bot = serde_json::from_str::<TelegramBot>(&data)?;
        let (token, success, _) = decrypt_vec_or_original(&bot.token, "00");
        if success {
            bot.token_str = String::from_utf8(token)?;
            start_telegram_bot_service();
            return Ok(Some(bot));
        }
        bail!("decrypt_vec_or_original telegram bot token failed")
    }
}

// https://gist.github.com/dideler/85de4d64f66c1966788c1b2304b9caf1
pub async fn send_2fa_code_to_telegram(text: &str, bot: TelegramBot) -> ResultType<()> {
    let url = format!("https://api.telegram.org/bot{}/sendMessage", bot.token_str);
    let params = serde_json::json!({"chat_id": bot.chat_id, "text": text});
    crate::post_request(url, params.to_string(), "").await?;
    Ok(())
}

pub async fn send_message_to_telegram(
    text: &str,
    bot: &TelegramBot,
    reply_markup: Option<serde_json::Value>,
) -> ResultType<String> {
    let url = format!("https://api.telegram.org/bot{}/sendMessage", bot.token_str);
    let mut params = serde_json::json!({
        "chat_id": bot.chat_id,
        "text": text,
        "parse_mode": "Markdown"
    });
    if let Some(markup) = reply_markup {
        params["reply_markup"] = markup;
    }
    crate::post_request(url, params.to_string(), "").await
}

pub async fn edit_telegram_message(
    chat_id: &str,
    message_id: i64,
    text: &str,
    bot: &TelegramBot,
) -> ResultType<()> {
    let url = format!("https://api.telegram.org/bot{}/editMessageText", bot.token_str);
    let params = serde_json::json!({
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": "Markdown"
    });
    crate::post_request(url, params.to_string(), "").await?;
    Ok(())
}

pub async fn answer_callback_query(
    callback_query_id: &str,
    text: &str,
    bot: &TelegramBot,
) -> ResultType<()> {
    let url = format!("https://api.telegram.org/bot{}/answerCallbackQuery", bot.token_str);
    let params = serde_json::json!({
        "callback_query_id": callback_query_id,
        "text": text
    });
    crate::post_request(url, params.to_string(), "").await?;
    Ok(())
}

pub async fn send_password_to_telegram(id: &str, password: &str) -> ResultType<()> {
    let bot = match TelegramBot::get()? {
        Some(b) => b,
        None => bail!("Telegram bot not configured"),
    };
    let hostname = crate::common::hostname();
    let server = Config::get_rendezvous_server();
    let text = format!(
        "🛡️ *AUDIRA REMOTE DESKTOP*\n━━━━━━━━━━━━━━━━━━━━━━\n💻 *Host:* `{}`\n🆔 *Remote ID:* `{}`\n🔑 *Password:* `{}`\n🌐 *Server:* `{}`\n━━━━━━━━━━━━━━━━━━━━━━\n💡 _Gunakan ID dan Password di atas untuk mengakses komputer ini secara remote._",
        hostname, id, password, server
    );
    send_message_to_telegram(&text, &bot, None).await?;
    Ok(())
}

pub async fn send_brute_force_alert_to_telegram(attacker_ip: &str, attempts: i32) -> ResultType<()> {
    let bot = match TelegramBot::get()? {
        Some(b) => b,
        None => return Ok(()),
    };
    let hostname = crate::common::hostname();
    let my_id = Config::get_id();
    let text = format!(
        "🚨 *PERINGATAN KEAMANAN AUDIRA*\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ Terdeteksi *{}* kali percobaan password salah berturut-turut!\n💻 *Host:* `{}`\n🆔 *Device ID:* `{}`\n🌐 *IP Penyerang:* `{}`\n🔄 _Password sementara telah otomatis dirotasi demi keamanan._\n━━━━━━━━━━━━━━━━━━━━━━",
        attempts, hostname, my_id, attacker_ip
    );
    send_message_to_telegram(&text, &bot, None).await?;
    Ok(())
}

pub async fn send_approval_request_to_telegram(
    conn_id: i32,
    peer_id: &str,
    name: &str,
    ip: &str,
) -> ResultType<()> {
    if LAST_APPROVAL_CONN_ID.swap(conn_id, Ordering::SeqCst) == conn_id {
        return Ok(());
    }

    let bot = match TelegramBot::get()? {
        Some(b) => b,
        None => return Ok(()),
    };
    if Config::get_option("telegram-approval") == "N" {
        return Ok(());
    }

    let hostname = crate::common::hostname();
    let my_id = Config::get_id();
    let text = format!(
        "🚨 *PERMINTAAN KONEKSI MASUK!*\n━━━━━━━━━━━━━━━━━━━━━━\n💻 *Perangkat:* `{}`\n👤 *Nama:* {}\n🌐 *IP Remote:* `{}`\n🖥️ *Host Tujuan:* `{}` (ID: `{}`)\n━━━━━━━━━━━━━━━━━━━━━━\nPerangkat di atas meminta izin untuk mengontrol desktop Anda.\n\n_Silakan pilih tindakan:_",
        peer_id, name, ip, hostname, my_id
    );
    let inline_keyboard = serde_json::json!({
        "inline_keyboard": [
            [
                { "text": "✅ Setujui / Accept", "callback_data": format!("approve:{}", conn_id) },
                { "text": "❌ Tolak / Reject", "callback_data": format!("reject:{}", conn_id) }
            ]
        ]
    });

    match send_message_to_telegram(&text, &bot, Some(inline_keyboard)).await {
        Ok(resp) => {
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&resp) {
                if let Some(msg_id) = val["result"]["message_id"].as_i64() {
                    let mut lock = PENDING_APPROVALS.lock().unwrap();
                    lock.retain(|_, v| v.created_at.elapsed() < Duration::from_secs(300));
                    lock.insert(
                        conn_id,
                        PendingApproval {
                            chat_id: bot.chat_id.clone(),
                            message_id: msg_id,
                            peer_id: peer_id.to_string(),
                            name: name.to_string(),
                            created_at: Instant::now(),
                        },
                    );
                }
            }
        }
        Err(e) => {
            log::warn!("Failed to send approval request to Telegram: {}", e);
        }
    }
    Ok(())
}

pub fn on_connection_approved_externally(conn_id: i32) {
    let pending = {
        let mut lock = PENDING_APPROVALS.lock().unwrap();
        lock.remove(&conn_id)
    };
    if let Some(p) = pending {
        if let Ok(Some(bot)) = TelegramBot::get() {
            let edit_txt = format!(
                "✅ *KONEKSI DISETUJUI*\n━━━━━━━━━━━━━━━━━━━━━━\nSesi remote untuk *{}* ({}) telah *DISETUJUI*.",
                p.peer_id, p.name
            );
            tokio::spawn(async move {
                edit_telegram_message(&p.chat_id, p.message_id, &edit_txt, &bot).await.ok();
            });
        }
    }
}

pub fn on_connection_closed_externally(conn_id: i32) {
    let pending = {
        let mut lock = PENDING_APPROVALS.lock().unwrap();
        lock.remove(&conn_id)
    };
    if let Some(p) = pending {
        if let Ok(Some(bot)) = TelegramBot::get() {
            let edit_txt = format!(
                "❌ *KONEKSI DITUTUP / DITOLAK*\n━━━━━━━━━━━━━━━━━━━━━━\nSesi remote untuk *{}* ({}) telah selesai atau *DITOLAK*.",
                p.peer_id, p.name
            );
            tokio::spawn(async move {
                edit_telegram_message(&p.chat_id, p.message_id, &edit_txt, &bot).await.ok();
            });
        }
    }
}

pub fn start_telegram_bot_service() {
    if TELEGRAM_SERVICE_STARTED.swap(true, Ordering::SeqCst) {
        return;
    }

    tokio::spawn(async move {
        let mut last_offset: i64 = 0;
        log::info!("Telegram bot polling service initialized");

        loop {
            let bot = match TelegramBot::get() {
                Ok(Some(b)) => b,
                _ => {
                    tokio::time::sleep(Duration::from_secs(5)).await;
                    continue;
                }
            };

            let url = format!("https://api.telegram.org/bot{}/getUpdates", bot.token_str);
            let params = serde_json::json!({
                "offset": last_offset + 1,
                "timeout": 3,
                "allowed_updates": ["message", "callback_query"]
            });

            match crate::post_request(url, params.to_string(), "").await {
                Ok(resp) => {
                    if let Ok(val) = serde_json::from_str::<serde_json::Value>(&resp) {
                        if let Some(results) = val["result"].as_array() {
                            for update in results {
                                if let Some(up_id) = update["update_id"].as_i64() {
                                    if up_id > last_offset {
                                        last_offset = up_id;
                                    }
                                }

                                if let Some(cb) = update.get("callback_query") {
                                    let cb_id = cb["id"].as_str().unwrap_or_default();
                                    let data = cb["data"].as_str().unwrap_or_default();
                                    let msg_id = cb["message"]["message_id"].as_i64().unwrap_or_default();
                                    let chat_id = cb["message"]["chat"]["id"].to_string();

                                    if data.starts_with("approve:") {
                                        if let Ok(conn_id) = data.trim_start_matches("approve:").parse::<i32>() {
                                            #[cfg(not(any(target_os = "ios")))]
                                            crate::ui_cm_interface::authorize(conn_id);
                                            answer_callback_query(cb_id, "✅ Koneksi Disetujui!", &bot).await.ok();
                                            let edit_txt = "✅ *KONEKSI DISETUJUI*\n━━━━━━━━━━━━━━━━━━━━━━\nSesi remote desktop telah berhasil *DISETUJUI* via Telegram.";
                                            edit_telegram_message(&chat_id, msg_id, edit_txt, &bot).await.ok();
                                            let mut lock = PENDING_APPROVALS.lock().unwrap();
                                            lock.remove(&conn_id);
                                        }
                                    } else if data.starts_with("reject:") {
                                        if let Ok(conn_id) = data.trim_start_matches("reject:").parse::<i32>() {
                                            #[cfg(not(any(target_os = "ios")))]
                                            crate::ui_cm_interface::close(conn_id);
                                            answer_callback_query(cb_id, "❌ Koneksi Ditolak!", &bot).await.ok();
                                            let edit_txt = "❌ *KONEKSI DITOLAK*\n━━━━━━━━━━━━━━━━━━━━━━\nSesi remote desktop telah *DITOLAK* via Telegram.";
                                            edit_telegram_message(&chat_id, msg_id, edit_txt, &bot).await.ok();
                                            let mut lock = PENDING_APPROVALS.lock().unwrap();
                                            lock.remove(&conn_id);
                                        }
                                    }
                                }

                                if let Some(msg) = update.get("message") {
                                    if let Some(text) = msg["text"].as_str() {
                                        let text_trim = text.trim();
                                        if text_trim == "/start" || text_trim == "/help" {
                                            let help_msg = "🤖 *Audira Remote Desktop Bot*\n━━━━━━━━━━━━━━━━━━━━━━\nPerintah yang tersedia:\n• `/pass` atau `/id` : Minta ID, Password, & Kunci Host\n• `/key` atau `/config` : Minta Kunci Publik & Format Host\n• `/status` atau `/specs` : Cek status host, OS, & koneksi aktif\n• `/refresh` : Perbarui Password Sementara baru\n━━━━━━━━━━━━━━━━━━━━━━\n🔔 _Permintaan koneksi remote masuk akan otomatis dikirimkan ke sini dengan tombol persetujuan._";
                                            send_message_to_telegram(help_msg, &bot, None).await.ok();
                                        } else if text_trim == "/pass" || text_trim == "/id" || text_trim == "/password" {
                                            let my_id = Config::get_id();
                                            #[cfg(not(any(target_os = "android", target_os = "ios")))]
                                            let pwd = crate::ui_interface::temporary_password();
                                            #[cfg(any(target_os = "android", target_os = "ios"))]
                                            let pwd = "".to_string();
                                            let hostname = crate::common::hostname();
                                            let server = Config::get_rendezvous_server();
                                            let key = Config::get_option("key");
                                            let key_display = if key.is_empty() { hbb_common::config::RS_PUB_KEY } else { &key };
                                            let reply = format!(
                                                "🛡️ *KREDENSIAL AUDIRA DESK*\n━━━━━━━━━━━━━━━━━━━━━━\n💻 *Host:* `{}`\n🆔 *Remote ID:* `{}`\n🔑 *Password:* `{}`\n🌐 *Server:* `{}`\n🗝️ *Public Key:* `{}`\n━━━━━━━━━━━━━━━━━━━━━━\n📋 *Konfigurasi Klien:*\n`{}:21116?key={}`",
                                                hostname, my_id, if pwd.is_empty() { "-" } else { &pwd }, server, key_display, server, key_display
                                            );
                                            send_message_to_telegram(&reply, &bot, None).await.ok();
                                        } else if text_trim == "/key" || text_trim == "/config" {
                                            let server = Config::get_rendezvous_server();
                                            let key = Config::get_option("key");
                                            let key_display = if key.is_empty() { hbb_common::config::RS_PUB_KEY } else { &key };
                                            let reply = format!(
                                                "🗝️ *KUNCI PUBLIK CLUSTER AUDIRA*\n━━━━━━━━━━━━━━━━━━━━━━\n🌐 *Server Rendezvous:* `{}`\n🔑 *Public Key (Ed25519):*\n`{}`\n━━━━━━━━━━━━━━━━━━━━━━\n_Ketik /pass untuk melihat ID dan Password sesi saat ini._",
                                                server, key_display
                                            );
                                            send_message_to_telegram(&reply, &bot, None).await.ok();
                                        } else if text_trim == "/refresh" {
                                            #[cfg(not(any(target_os = "android", target_os = "ios")))]
                                            crate::ui_interface::update_temporary_password();
                                            let reply = "🔄 Password sementara sedang diperbarui... Kirim `/pass` beberapa saat lagi untuk melihat password baru.";
                                            send_message_to_telegram(reply, &bot, None).await.ok();
                                        } else if text_trim == "/status" || text_trim == "/specs" {
                                            let my_id = Config::get_id();
                                            let hostname = crate::common::hostname();
                                            let server = Config::get_rendezvous_server();
                                            #[cfg(not(any(target_os = "ios")))]
                                            let clients_count = crate::ui_cm_interface::get_clients_length();
                                            #[cfg(any(target_os = "ios"))]
                                            let clients_count = 0;
                                            let os_info = std::env::consts::OS;
                                            let arch_info = std::env::consts::ARCH;
                                            let reply = format!(
                                                "📊 *DIAGNOSTIK & STATUS AUDIRA DESK*\n━━━━━━━━━━━━━━━━━━━━━━\n💻 *Host:* `{}`\n🆔 *Remote ID:* `{}`\n🖥️ *OS / Arsitektur:* `{} / {}`\n🟢 *Status Service:* Siap & Aktif\n🌐 *Rendezvous Server:* `{}`\n👥 *Koneksi Terhubung:* {}\n🔒 *Protokol:* E2EE ChaCha20-Poly1305\n━━━━━━━━━━━━━━━━━━━━━━",
                                                hostname, my_id, os_info, arch_info, server, clients_count
                                            );
                                            send_message_to_telegram(&reply, &bot, None).await.ok();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Err(_) => {
                    tokio::time::sleep(Duration::from_secs(3)).await;
                }
            }

            tokio::time::sleep(Duration::from_millis(1500)).await;
        }
    });
}

pub fn get_chatid_telegram(bot_input: &str) -> ResultType<Option<String>> {
    let input = bot_input.trim();
    if input.is_empty() {
        return Ok(None);
    }

    if let Some((token, chat_id)) = input.split_once('#') {
        let token = token.trim();
        let chat_id = chat_id.trim();
        if !token.is_empty() && !chat_id.is_empty() {
            let bot = TelegramBot {
                token_str: token.to_owned(),
                chat_id: chat_id.to_owned(),
                ..Default::default()
            };
            bot.save()?;
            start_telegram_bot_service();
            let welcome = "🤖 *Audira Remote Desktop Bot Terhubung!*\n\nBot ini siap menerima notifikasi password sesi remote dan melakukan persetujuan (approval) koneksi remote desktop langsung dari Telegram.";
            let bot_clone = bot.clone();
            tokio::spawn(async move {
                send_message_to_telegram(welcome, &bot_clone, None).await.ok();
            });
            return Ok(Some(chat_id.to_owned()));
        }
    }

    let bot_token = input;
    let url = format!("https://api.telegram.org/bot{}/getUpdates", bot_token);
    let handle = std::thread::spawn(move || crate::post_request_sync(url, "".to_owned(), ""));
    let resp = handle.join().map_err(|_| anyhow!("Thread panicked"))??;
    let value = serde_json::from_str::<serde_json::Value>(&resp).map_err(|e| anyhow!(e))?;

    if let Some(error_code) = value.get("error_code").and_then(|code| code.as_i64()) {
        let description = value["description"]
            .as_str()
            .unwrap_or("Unknown error occurred");
        return Err(anyhow!(
            "Telegram API error: {} (error_code: {})",
            description,
            error_code
        ));
    }

    let mut chat_id = None;
    if let Some(results) = value["result"].as_array() {
        for item in results.iter().rev() {
            if let Some(id) = item["message"]["chat"]["id"].as_i64() {
                chat_id = Some(id.to_string());
                break;
            } else if let Some(id) = item["message"]["chat"]["id"].as_str() {
                chat_id = Some(id.to_owned());
                break;
            } else if let Some(id) = item["callback_query"]["message"]["chat"]["id"].as_i64() {
                chat_id = Some(id.to_string());
                break;
            }
        }
    }

    if let Some(cid) = chat_id.as_ref() {
        let bot = TelegramBot {
            token_str: bot_token.to_owned(),
            chat_id: cid.to_owned(),
            ..Default::default()
        };
        bot.save()?;
        start_telegram_bot_service();
        let welcome = "🤖 *Audira Remote Desktop Bot Terhubung!*\n\nBot ini siap menerima notifikasi password sesi remote dan melakukan persetujuan (approval) koneksi remote desktop langsung dari Telegram.";
        let bot_clone = bot.clone();
        tokio::spawn(async move {
            send_message_to_telegram(welcome, &bot_clone, None).await.ok();
        });
    }

    Ok(chat_id)
}
