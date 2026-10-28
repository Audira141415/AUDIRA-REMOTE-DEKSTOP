import os
import sys
import json
import time
import socket

# Force IPv4 resolution to prevent connection reset by peer on broken IPv6 routes
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _ipv4_getaddrinfo

import hashlib
import threading
import urllib.request
import urllib.parse
import subprocess
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent if BASE_DIR.name == "scripts" else BASE_DIR
DATA_DIR = ROOT_DIR / "scripts" / "data" if (ROOT_DIR / "scripts" / "data").exists() else ROOT_DIR / "data"
CONFIG_PATH = DATA_DIR / "telegram_apps_config.json"
DIST_DIR = ROOT_DIR / "web" / "dist"
EXE_PATH = DIST_DIR / "AudiraDesk-Full-Installer.exe"
MTIME_TRACKER = DATA_DIR / "last_build_mtime.txt"

PUBLIC_KEY_RUSTDESK = "SiWmWlEqQ8xr6zvf59wKFzR4eHN5yABIydqpFouvnb8="
RELAY_HOST = "desk.audira.my.id"

def get_public_key():
    pub_file = DATA_DIR / "id_ed25519.pub"
    if pub_file.is_file():
        try:
            with open(pub_file, "r", encoding="utf-8") as f:
                k = f.read().strip()
                if k:
                    return k
        except Exception:
            pass
    return PUBLIC_KEY_RUSTDESK

def load_config():
    if CONFIG_PATH.is_file():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    try:
        import env_loader
    except ImportError:
        pass
    return {
        "bot_token": os.getenv("AUDIRA_TELEGRAM_BOT_TOKEN", ""),
        "chat_id": os.getenv("AUDIRA_TELEGRAM_CHAT_ID", "-1003961181911"),
        "thread_id": int(os.getenv("AUDIRA_TELEGRAM_THREAD_ID", "2")),
        "group_name": "Audira NEXUS | App Operations & Fleet Gateway",
        "api_url": os.getenv("AUDIRA_API_URL", "http://127.0.0.1:5050")
    }

def save_config(cfg):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)

def telegram_api(token, method, payload=None):
    url = f"https://api.telegram.org/bot{token}/{method}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AudiraBot/2.2",
    }
    try:
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
            req = urllib.request.Request(url, data=data, headers=headers)
        else:
            req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[!] Telegram API error ({method}): {e}")
        return None

def send_message(token, chat_id, text, reply_markup=None, thread_id=None, parse_mode="Markdown"):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode
    }
    if thread_id:
        payload["message_thread_id"] = thread_id
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return telegram_api(token, "sendMessage", payload)

def check_tcp_port(host, port, timeout=2.0):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False

def check_http_health(url, timeout=3.0):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False

def get_exe_info():
    if not EXE_PATH.is_file():
        return None
    try:
        st = EXE_PATH.stat()
        size_bytes = st.st_size
        size_mb = round(size_bytes / (1024 * 1024), 1)
        mtime_str = time.strftime("%Y-%m-%d %H:%M:%S WIB", time.localtime(st.st_mtime))

        sha256 = hashlib.sha256()
        with open(EXE_PATH, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha256.update(chunk)
        digest = sha256.hexdigest()

        return {
            "name": EXE_PATH.name,
            "version": "v1.5.3 Cyber Enterprise Edition (Windows x64)",
            "size_bytes": size_bytes,
            "size_mb": size_mb,
            "mtime": st.st_mtime,
            "mtime_str": mtime_str,
            "sha256": digest,
            "download_url": "https://desk.audira.my.id/dist/AudiraDesk-Full-Installer.exe",
            "cert_url": "https://desk.audira.my.id/dist/AgusDwiR_Audira.cer",
            "trust_url": "https://desk.audira.my.id/dist/Trust_Audira_Certificate.bat"
        }
    except Exception as e:
        print(f"[!] Error getting exe info: {e}")
        return None

def build_release_card_html(info):
    html_msg = (
        "🚀 <b>RILIS VERSI TERBARU: AUDIRA REMOTE DESKTOP</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "Telah tersedia build executable (.exe) installer terbaru untuk armada workstation &amp; client:\n\n"
        f"📦 <b>Nama File:</b> <code>{info['name']}</code>\n"
        f"🏷️ <b>Versi:</b> <code>{info['version']}</code>\n"
        f"💾 <b>Ukuran File:</b> <code>{info['size_mb']} MB ({info['size_bytes']:,} bytes)</code>\n"
        f"📅 <b>Waktu Build:</b> <code>{info['mtime_str']}</code>\n"
        f"🔒 <b>Integritas SHA-256 Checksum:</b>\n"
        f"<code>{info['sha256']}</code>\n\n"
        "⚡ <b>Konfigurasi Bawaan (Pre-configured):</b>\n"
        f"• 📡 Relay &amp; ID Server: <code>{RELAY_HOST}</code>\n"
        f"• 🔑 Public Key: <code>{PUBLIC_KEY_RUSTDESK}</code>\n"
        "• 🛡️ Digital Signature: <code>AgusDwiR_Audira.cer</code> (Audira Certified)\n\n"
        "✨ <b>Pembaruan &amp; Perbaikan Terbaru:</b>\n"
        "• <b>Penyatuan Toolbar Cepat:</b> Menghilangkan toolbar ganda; HUD Telemetri (Ping &amp; FPS) kini menyatu dalam 1 floating bar terpadu.\n"
        "• <b>Tools Anotasi &amp; Diagnostik:</b> On-Screen Whiteboard dan System Drawer terintegrasi mulus di toolbar utama.\n"
        "• <b>Pusat Kontrol (Control Center):</b> Dilengkapi identitas keamanan enkripsi E2EE dan mode channel P2P/Relay.\n\n"
        "📥 <b>Tautan Unduhan:</b> Klik tombol di bawah untuk mengunduh installer resmi:"
    )
    reply_markup = {
        "inline_keyboard": [
            [
                {"text": f"📥 Download Installer .EXE ({info['size_mb']} MB)", "url": info["download_url"]}
            ],
            [
                {"text": "🔐 Download Sertifikat (.CER)", "url": info["cert_url"]},
                {"text": "📜 Script Trust (.BAT)", "url": info["trust_url"]}
            ]
        ]
    }
    return html_msg, reply_markup

# ==========================================
# 🚨 WATCHDOG & RELEASE BUILD WATCHER
# ==========================================
def watchdog_monitor(cfg):
    token = cfg.get("bot_token")
    chat_id = cfg.get("chat_id")
    health_thread_id = 4   # 🚨 Health & Incident Alerts
    release_thread_id = 10 # 🏷️ App Versions & Releases
    build_thread_id = 3    # 📦 App Builds & Deployments

    last_state = {
        "hbbs": True,
        "hbbr": True,
        "api": True
    }

    # Initialize last mtime tracker
    last_mtime = 0.0
    if MTIME_TRACKER.is_file():
        try:
            with open(MTIME_TRACKER, "r") as f:
                last_mtime = float(f.read().strip())
        except Exception:
            last_mtime = 0.0

    print("[*] Starting Background Watchdog & Build Release Watcher...")
    time.sleep(3) # Short pause on startup
    while True:
        try:
            cur_hbbs = check_tcp_port("127.0.0.1", 21116)
            cur_hbbr = check_tcp_port("127.0.0.1", 21117)
            cur_api = check_http_health(f"{cfg.get('api_url')}/api/health")

            now_str = time.strftime("%Y-%m-%d %H:%M:%S WIB")

            # 1. HBBS Alert
            if not cur_hbbs and last_state["hbbs"]:
                alert = (
                    "🚨 *CRITICAL ALERT: RUSTDESK ID SERVER DOWN!*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "⚠️ *Service:* `hbbs (Port 21116)` TIDAK MERESPONS ❌\n"
                    "📡 *Server:* `audira-web-hub` (192.168.100.175)\n"
                    f"⏰ *Waktu:* {now_str}\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "_Client remote desktop mungkin tidak dapat menemukan ID perangkat._"
                )
                send_message(token, chat_id, alert, thread_id=health_thread_id)
            elif cur_hbbs and not last_state["hbbs"]:
                rec = (
                    "🟢 *RECOVERY: RUSTDESK ID SERVER ONLINE*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "✅ *Service:* `hbbs (Port 21116)` telah kembali NORMAL ✅\n"
                    f"⏰ *Waktu Pulih:* {now_str}"
                )
                send_message(token, chat_id, rec, thread_id=health_thread_id)

            # 2. HBBR Alert
            if not cur_hbbr and last_state["hbbr"]:
                alert = (
                    "🚨 *CRITICAL ALERT: RUSTDESK RELAY SERVER DOWN!*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "⚠️ *Service:* `hbbr (Port 21117)` TIDAK MERESPONS ❌\n"
                    "📡 *Server:* `audira-web-hub` (192.168.100.175)\n"
                    f"⏰ *Waktu:* {now_str}\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "_Koneksi remote desktop melalui relay akan terganggu._"
                )
                send_message(token, chat_id, alert, thread_id=health_thread_id)
            elif cur_hbbr and not last_state["hbbr"]:
                rec = (
                    "🟢 *RECOVERY: RUSTDESK RELAY ONLINE*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "✅ *Service:* `hbbr (Port 21117)` telah kembali NORMAL ✅\n"
                    f"⏰ *Waktu Pulih:* {now_str}"
                )
                send_message(token, chat_id, rec, thread_id=health_thread_id)

            # 3. API Alert
            if not cur_api and last_state["api"]:
                alert = (
                    "🚨 *CRITICAL ALERT: FLEET API GATEWAY DOWN!*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"⚠️ *Service:* `{cfg.get('api_url')}` TIDAK MERESPONS ❌\n"
                    f"⏰ *Waktu:* {now_str}\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "_Permintaan passcode, lisensi, dan approval terhenti._"
                )
                send_message(token, chat_id, alert, thread_id=health_thread_id)
            elif cur_api and not last_state["api"]:
                rec = (
                    "🟢 *RECOVERY: FLEET API GATEWAY ONLINE*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    "✅ *Service:* `Audira API Gateway` telah kembali NORMAL ✅\n"
                    f"⏰ *Waktu Pulih:* {now_str}"
                )
                send_message(token, chat_id, rec, thread_id=health_thread_id)

            last_state["hbbs"] = cur_hbbs
            last_state["hbbr"] = cur_hbbr
            last_state["api"] = cur_api

            # 4. Check for New Executable Release (.exe updated)
            if EXE_PATH.is_file():
                current_mtime = EXE_PATH.stat().st_mtime
                if current_mtime > last_mtime:
                    print(f"[+] Detected new/updated installer .exe! mtime: {current_mtime}")
                    info = get_exe_info()
                    if info:
                        html_text, r_markup = build_release_card_html(info)
                        # Broadcast to Topic 10 (Releases)
                        send_message(token, chat_id, html_text, reply_markup=r_markup, thread_id=release_thread_id, parse_mode="HTML")
                        # Broadcast notice to Topic 3 (Builds & Deployments)
                        build_notice = (
                            "📦 <b>PEMBARUAN ARTEFAK BUILD / INSTALLER BARU!</b>\n"
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                            f"Build baru <code>{info['name']}</code> ({info['size_mb']} MB) telah diunggah ke server.\n"
                            f"Rilis lengkap disiarkan ke topik <b>App Versions &amp; Releases</b>."
                        )
                        send_message(token, chat_id, build_notice, thread_id=build_thread_id, parse_mode="HTML")

                    last_mtime = current_mtime
                    with open(MTIME_TRACKER, "w") as f:
                        f.write(str(last_mtime))

            time.sleep(30)

        except Exception as e:
            print(f"[!] Watchdog thread loop error: {e}")
            time.sleep(10)

def get_device_info(peer_id, client_ip=None):
    acc_path = DATA_DIR / "accounts.json"
    target_name = f"Host ID: `{peer_id}`"
    client_name = f"`{client_ip}`" if client_ip else "Unknown"

    clean_ip = ""
    if client_ip:
        raw = client_ip
        if ']' in raw:
            clean_ip = raw.split(']')[0].replace('[', '')
        elif ':' in raw:
            clean_ip = raw.split(':')[0]
        else:
            clean_ip = raw

    if acc_path.is_file():
        try:
            with open(acc_path, "r", encoding="utf-8") as f:
                accounts = json.load(f)
            for acc in accounts.values():
                devices = acc.get("devices", {})
                for did, dev in devices.items():
                    if str(did) == str(peer_id):
                        h = dev.get("hostname") or dev.get("alias") or ""
                        u = dev.get("username") or ""
                        lbl = f"{h} ({u})".strip() if u else h
                        if lbl:
                            target_name = f"*{lbl}* (ID: `{peer_id}`)"
                        else:
                            target_name = f"ID: `{peer_id}`"

                    if clean_ip and dev.get("ip") == clean_ip:
                        h = dev.get("hostname") or dev.get("alias") or ""
                        u = dev.get("username") or ""
                        lbl = f"{h} ({u})".strip() if u else h
                        if lbl:
                            client_name = f"*{lbl}* (`{clean_ip}`)"
                        else:
                            client_name = f"`{clean_ip}`"
        except Exception as e:
            print(f"[!] Error reading accounts for device info: {e}")

    return target_name, client_name

def format_key_mismatch_alert(client_endpoint, peer_id, reason="invalid key"):
    pub_key = get_public_key()
    target_label, client_label = get_device_info(peer_id, client_endpoint)
    now_str = time.strftime("%Y-%m-%d %H:%M:%S WIB")

    alert_text = (
        "🚨 *PERINGATAN: DETEKSI KEY MISMATCH / AUTH FAILED!*\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "Terdeteksi percobaan koneksi remote yang *DITOLAK* oleh server karena *perbedaan Public Key (Key Mismatch)*!\n\n"
        f"📱 *Perangkat Pemanggil (Klien):*\n"
        f"• {client_label}\n"
        f"💻 *Komputer Tujuan (Host):*\n"
        f"• {target_label}\n"
        f"⏰ *Waktu Kejadian:* `{now_str}`\n"
        f"🔍 *Alasan Penolakan:* `{reason}`\n\n"
        "🔑 *KUNCI PUBLIK RESMI CLUSTER (ED25519):*\n"
        f"`{pub_key}`\n\n"
        "📋 *String Konfigurasi Siap Salin (1-Klik):*\n"
        f"`{RELAY_HOST}:21116?key={pub_key}`\n\n"
        "💡 *Langkah Perbaikan di Perangkat Klien:*\n"
        "1. Buka aplikasi *Audira Desk* di perangkat klien di atas.\n"
        "2. Buka menu *Pengaturan (⚙️)* > tab *ID / Relay Server*.\n"
        "3. Paste kunci publik di atas ke kolom **Key** (pastikan tanpa spasi).\n"
        f"4. Simpan, lalu coba hubungkan kembali ke ID `{peer_id}`.\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    )
    return alert_text

def hbbs_log_monitor(cfg):
    """
    Real-time log stream watcher for audira-hbbs Docker container.
    Detects authentication failures (invalid key) and immediately alerts Telegram.
    """
    token = cfg.get("bot_token")
    chat_id = cfg.get("chat_id")
    health_thread_id = 4   # 🚨 Health & Incident Alerts
    remote_thread_id = 2   # 🖥️ Remote Desktop & Operations

    # Throttling dictionary: (client_endpoint, peer_id) -> last_alert_time
    throttle_map = {}
    THROTTLE_INTERVAL = 45 # seconds

    print("[*] Starting Real-time HBBS Docker Log Watcher for Key Mismatch...")

    while True:
        try:
            cmd = ["docker", "logs", "-f", "--tail", "0", "audira-hbbs"]
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            for line in iter(proc.stdout.readline, ''):
                if not line:
                    break
                line_str = line.strip()

                if "Authentication failed" in line_str and "invalid key" in line_str:
                    print(f"[!] Detected Auth Failure in hbbs log: {line_str}")

                    m = re.search(r"Authentication failed from\s+([^\s]+)\s+for peer\s+(\d+)\s+-\s+([^\r\n]+)", line_str)
                    if m:
                        client_endpoint = m.group(1)
                        peer_id = m.group(2)
                        reason = m.group(3).strip()
                    else:
                        client_endpoint = "Unknown"
                        peer_id = "Unknown"
                        reason = "invalid key"

                    # Throttle check
                    throttle_key = (client_endpoint, peer_id)
                    now_ts = time.time()
                    if throttle_key in throttle_map and (now_ts - throttle_map[throttle_key]) < THROTTLE_INTERVAL:
                        print(f"[-] Throttling alert for {throttle_key} (last alert {now_ts - throttle_map[throttle_key]:.1f}s ago)")
                        continue

                    throttle_map[throttle_key] = now_ts

                    alert_msg = format_key_mismatch_alert(client_endpoint, peer_id, reason)

                    # Send to Topic 4 (Health & Incident)
                    send_message(token, chat_id, alert_msg, thread_id=health_thread_id)

                    # Also send to Topic 2 (Remote Desktop & Operations) if different
                    if remote_thread_id != health_thread_id:
                        send_message(token, chat_id, alert_msg, thread_id=remote_thread_id)

            proc.stdout.close()
            proc.wait()
            time.sleep(3)
        except Exception as e:
            print(f"[!] Error in hbbs_log_monitor loop: {e}")
            time.sleep(5)

# ==========================================
# 🎮 INTERACTIVE HANDLERS (Messages & Buttons)
# ==========================================
def handle_update(update, cfg):
    token = cfg.get("bot_token")
    if not token:
        return

    # Handle Callback Queries (Approve / Reject buttons)
    if "callback_query" in update:
        cq = update["callback_query"]
        cq_id = cq["id"]
        data = cq.get("data", "")
        from_user = cq.get("from", {}).get("first_name", "Admin")
        msg_obj = cq.get("message", {})
        chat_id = msg_obj.get("chat", {}).get("id")
        thread_id = msg_obj.get("message_thread_id") or cfg.get("thread_id", 2)

        if data.startswith("remote_approve_"):
            dev_id = data.replace("remote_approve_", "")
            try:
                post_data = json.dumps({"device_id": dev_id, "admin": from_user}).encode("utf-8")
                req = urllib.request.Request(f"{cfg.get('api_url')}/api/remote/approve", data=post_data, headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=3)
            except Exception as e:
                print(f"[!] Error calling /api/remote/approve: {e}")

            res_text = (
                f"✅ *AKSES REMOTE TELAH DISETUJUI / APPROVED!*\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"💻 *Device ID:* `{dev_id}`\n"
                f"👤 *Disetujui oleh:* *{from_user}*\n"
                f"🔑 *Status Pass:* AKTIF & TERVERIFIKASI ✅\n"
                f"⏰ *Waktu:* {time.strftime('%H:%M:%S WIB')}\n"
                f"🛡️ *Audit:* Sesi remote diizinkan masuk ke host."
            )
            telegram_api(token, "answerCallbackQuery", {
                "callback_query_id": cq_id,
                "text": f"Akses {dev_id} disetujui!"
            })
            send_message(token, chat_id, res_text, thread_id=thread_id)

        elif data.startswith("remote_reject_"):
            dev_id = data.replace("remote_reject_", "")
            try:
                post_data = json.dumps({"device_id": dev_id, "admin": from_user}).encode("utf-8")
                req = urllib.request.Request(f"{cfg.get('api_url')}/api/remote/reject", data=post_data, headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=3)
            except Exception as e:
                print(f"[!] Error calling /api/remote/reject: {e}")

            res_text = (
                f"❌ *AKSES REMOTE DITOLAK / REJECTED!*\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"💻 *Device ID:* `{dev_id}`\n"
                f"🚫 *Ditolak oleh:* *{from_user}*\n"
                f"🔒 *Status:* Sesi remote dibatalkan dan koneksi ditutup.\n"
                f"⏰ *Waktu:* {time.strftime('%H:%M:%S WIB')}"
            )
            telegram_api(token, "answerCallbackQuery", {
                "callback_query_id": cq_id,
                "text": f"Akses {dev_id} ditolak!"
            })
            send_message(token, chat_id, res_text, thread_id=thread_id)

        elif data.startswith("order_approve_"):
            inv_id = data.replace("order_approve_", "")
            try:
                post_data = json.dumps({"order_id": inv_id}).encode("utf-8")
                req = urllib.request.Request(f"{cfg.get('api_url')}/api/orders/approve", data=post_data, headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=4)
            except Exception as e:
                print(f"[!] Error calling /api/orders/approve: {e}")

            res_text = (
                f"✅ *PEMBAYARAN LISENSI DIKONFIRMASI!*\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"🧾 *Invoice:* `{inv_id}`\n"
                f"👤 *Dikonfirmasi oleh:* *{from_user}*\n"
                f"🔑 *Status Lisensi:* AKTIF (PAID) ✅\n"
                f"⏰ *Waktu:* {time.strftime('%H:%M:%S WIB')}\n"
                f"_Client sudah dapat langsung menggunakan lisensi._"
            )
            telegram_api(token, "answerCallbackQuery", {
                "callback_query_id": cq_id,
                "text": f"Invoice {inv_id} disetujui!"
            })
            send_message(token, chat_id, res_text, thread_id=20)

        elif data.startswith("order_cancel_"):
            inv_id = data.replace("order_cancel_", "")
            try:
                post_data = json.dumps({"order_id": inv_id}).encode("utf-8")
                req = urllib.request.Request(f"{cfg.get('api_url')}/api/orders/delete", data=post_data, headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=4)
            except Exception as e:
                print(f"[!] Error calling /api/orders/delete: {e}")

            res_text = (
                f"❌ *PESANAN LISENSI DIBATALKAN!*\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"🧾 *Invoice:* `{inv_id}`\n"
                f"🚫 *Dibatalkan oleh:* *{from_user}*\n"
                f"🔒 *Status:* DIBATALKAN / VOID.\n"
                f"⏰ *Waktu:* {time.strftime('%H:%M:%S WIB')}"
            )
            telegram_api(token, "answerCallbackQuery", {
                "callback_query_id": cq_id,
                "text": f"Invoice {inv_id} dibatalkan!"
            })
            send_message(token, chat_id, res_text, thread_id=20)
        return

    # Handle Messages & Commands
    msg = update.get("message")
    if not msg:
        return

    chat = msg.get("chat", {})
    chat_id = chat.get("id")
    thread_id = msg.get("message_thread_id") or cfg.get("thread_id", 2)
    text = (msg.get("text") or "").strip()

    if text.startswith("/start") or text.startswith("/help"):
        help_text = (
            "🛡️ *AUDIRA NEXUS BOT — COMMAND CENTER*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "Bot operasional resmi untuk aplikasi & Remote Desktop Audira.\n\n"
            "📌 *Perintah Operasional:*\n"
            "• `/status` : Status real-time server relay & API\n"
            "• `/stats` : Statistik armada PC, sesi aktif, dan metrik\n"
            "• `/devices` : Daftar armada perangkat terdaftar\n"
            "• `/latest` : 🚀 Informasi & tautan unduh versi .EXE terbaru\n"
            "• `/pass <device_id>` : Terbitkan tiket passcode darurat\n"
            "• `/kill <device_id>` : 🛑 Putus paksa sesi remote aktif\n"
            "• `/check <serial_key>` : 🔍 Cek status & masa aktif lisensi\n"
            "• `/key` : 🗝️ Kunci publik cluster & konfigurasi 1-klik\n"
            "• `/client_config` : ⚙️ Panduan konfigurasi client RustDesk\n"
            "• `/help` : Panduan bantuan operasional"
        )
        send_message(token, chat_id, help_text, thread_id=thread_id)

    elif any(text.startswith(cmd) for cmd in ["/latest", "/download", "/version", "/app", "/build"]):
        info = get_exe_info()
        if info:
            html_text, r_markup = build_release_card_html(info)
            send_message(token, chat_id, html_text, reply_markup=r_markup, thread_id=thread_id, parse_mode="HTML")
        else:
            send_message(token, chat_id, "⚠️ File installer .exe belum ditemukan di server.", thread_id=thread_id)

    elif text.startswith("/status"):
        hbbs_ok = check_tcp_port("127.0.0.1", 21116)
        hbbr_ok = check_tcp_port("127.0.0.1", 21117)
        api_ok = check_http_health(f"{cfg.get('api_url')}/api/health")

        status_text = (
            "🖥️ *STATUS AUDIRA REMOTE DESKTOP & APPS*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"📡 *Relay Server (hbbr):* `desk.audira.my.id:21117` ({'ONLINE 🟢' if hbbr_ok else 'DOWN ❌'})\n"
            f"🔑 *ID Server (hbbs):* `desk.audira.my.id:21116` ({'ONLINE 🟢' if hbbs_ok else 'DOWN ❌'})\n"
            f"🌐 *Fleet Management API:* `{cfg.get('api_url')}` ({'ONLINE 🟢' if api_ok else 'DOWN ❌'})\n"
            "🔐 *Sistem Approval:* Aktif di Topik 🖥️ Remote Desktop & Passcode\n"
            "🚨 *Watchdog Daemon:* Aktif memantau port & rilis build 24/7\n"
            f"⏰ *Server Time:* {time.strftime('%Y-%m-%d %H:%M:%S WIB')}"
        )
        send_message(token, chat_id, status_text, thread_id=thread_id)

    elif text.startswith("/stats"):
        try:
            req = urllib.request.Request(f"{cfg.get('api_url')}/api/metrics")
            with urllib.request.urlopen(req, timeout=4) as resp:
                m = json.loads(resp.read().decode("utf-8"))
            stats_text = (
                "📊 *STATISTIK ARMARDA & SESI REMOTE*\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"💻 *Total Perangkat:* `{m.get('total_devices', 0)}` unit\n"
                f"🟢 *Perangkat Online:* `{m.get('online_devices', 0)}` unit\n"
                f"⚪ *Perangkat Offline:* `{m.get('offline_devices', 0)}` unit\n"
                f"⚡ *Sesi Remote Aktif:* `{m.get('active_sessions', 0)}` sesi\n"
                f"📶 *Throughput Jaringan:* `{m.get('throughput_mbs', 0.0)} MB/s`\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            )
            send_message(token, chat_id, stats_text, thread_id=thread_id)
        except Exception as e:
            send_message(token, chat_id, f"⚠️ Gagal membaca statistik: {e}", thread_id=thread_id)

    elif text.startswith("/devices"):
        try:
            req = urllib.request.Request(f"{cfg.get('api_url')}/api/fleet")
            with urllib.request.urlopen(req, timeout=4) as resp:
                devices = json.loads(resp.read().decode("utf-8"))
            if isinstance(devices, list) and devices:
                lines = ["💻 *DAFTAR PERANGKAT TERDAFTAR (FLEET)*:", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"]
                for d in devices[:15]:
                    d_id = d.get("id") or d.get("device_id") or "Unknown"
                    d_host = d.get("hostname") or d.get("alias") or "Host"
                    d_ip = d.get("ip") or "N/A"
                    lines.append(f"• `{d_id}` — *{d_host}* (`{d_ip}`)")
                send_message(token, chat_id, "\n".join(lines), thread_id=thread_id)
            else:
                send_message(token, chat_id, "ℹ️ Belum ada perangkat fleet yang aktif di database.", thread_id=thread_id)
        except Exception as e:
            send_message(token, chat_id, f"⚠️ Gagal membaca data fleet: {e}", thread_id=thread_id)

    elif text.startswith("/pass"):
        parts = text.split()
        if len(parts) < 2:
            send_message(token, chat_id, "⚠️ Format salah. Gunakan: `/pass <device_id>`", thread_id=thread_id)
            return
        dev_id = parts[1].strip()
        try:
            req_data = json.dumps({
                "device_id": dev_id,
                "hostname": "Manual-Telegram-Request",
                "operator": msg.get("from", {}).get("first_name", "Operator"),
                "client_ip": "Telegram-Bot"
            }).encode("utf-8")
            req = urllib.request.Request(f"{cfg.get('api_url')}/api/remote/request-approval", data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                res = json.loads(resp.read().decode("utf-8"))
            if res.get("success"):
                send_message(token, chat_id, f"✅ Passcode untuk `{dev_id}` berhasil di-generate: `{res.get('pass_code')}` (Berlaku 5 Menit).", thread_id=thread_id)
            else:
                send_message(token, chat_id, f"❌ Gagal membuat passcode untuk `{dev_id}`.", thread_id=thread_id)
        except Exception as e:
            send_message(token, chat_id, f"⚠️ Error request approval: {e}", thread_id=thread_id)

    elif text.startswith("/kill"):
        parts = text.split()
        if len(parts) < 2:
            send_message(token, chat_id, "⚠️ Format salah. Gunakan: `/kill <device_id>`", thread_id=thread_id)
            return
        dev_id = parts[1].strip()
        from_user = msg.get("from", {}).get("first_name", "Admin")
        try:
            post_data = json.dumps({"device_id": dev_id, "admin": from_user}).encode("utf-8")
            req = urllib.request.Request(f"{cfg.get('api_url')}/api/remote/reject", data=post_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                pass
            kill_msg = (
                "🛑 *EMERGENCY KILL-SWITCH DIAKTIFKAN!*\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"💻 *Device Target:* `{dev_id}`\n"
                f"👤 *Dieksekusi oleh:* *{from_user}*\n"
                "🔒 *Status:* Akses dan passcode dibatalkan seketika.\n"
                f"⏰ *Waktu:* {time.strftime('%H:%M:%S WIB')}"
            )
            send_message(token, chat_id, kill_msg, thread_id=thread_id)
            send_message(token, chat_id, kill_msg, thread_id=12)
        except Exception as e:
            send_message(token, chat_id, f"⚠️ Gagal memutus sesi `{dev_id}`: {e}", thread_id=thread_id)

    elif text.startswith("/check"):
        parts = text.split()
        if len(parts) < 2:
            send_message(token, chat_id, "⚠️ Format salah. Gunakan: `/check <serial_key>`", thread_id=thread_id)
            return
        key = parts[1].strip().upper()
        try:
            req_data = json.dumps({"license_key": key}).encode("utf-8")
            req = urllib.request.Request(f"{cfg.get('api_url')}/api/licenses/validate", data=req_data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                res = json.loads(resp.read().decode("utf-8"))

            if res.get("valid"):
                lic = res.get("license", {})
                info_msg = (
                    "🔑 *STATUS LISENSI DITEMUKAN (VALID)*\n"
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"🔑 *Serial Key:* `{key}`\n"
                    f"📦 *Paket:* *{lic.get('plan_name', 'Pro')}*\n"
                    f"👤 *Pemilik:* *{lic.get('customer_name', 'Pelanggan')}*\n"
                    f"⏳ *Kedaluwarsa:* *{lic.get('expires_at', 'Permanen')}*\n"
                    f"💻 *Device Binding:* `{lic.get('target_id', 'Semua Device')}`\n"
                    f"📌 *Status:* AKTIF (PAID) ✅"
                )
            else:
                info_msg = f"❌ *Lisensi Tidak Valid / Tidak Ditemukan:*\n`{key}`"
            send_message(token, chat_id, info_msg, thread_id=thread_id)
        except Exception as e:
            send_message(token, chat_id, f"⚠️ Error memeriksa lisensi: {e}", thread_id=thread_id)

    elif text.startswith("/key") or text.startswith("/config") or text.startswith("/pubkey") or text.startswith("/relay") or text.startswith("/client_config"):
        pub_key = get_public_key()
        cfg_msg = (
            "🗝️ *KUNCI PUBLIK & KONFIGURASI RELAY CLUSTER AUDIRA*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "Gunakan parameter ini untuk menghubungkan aplikasi client (Desktop / Laptop / Mobile):\n\n"
            f"📡 *ID Server:* `{RELAY_HOST}` (Port: `21116`)\n"
            f"⚡ *Relay Server:* `{RELAY_HOST}` (Port: `21117`)\n"
            f"🌐 *API Server:* `http://{RELAY_HOST}:21114`\n"
            "🔑 *Public Key (Ed25519):*\n"
            f"`{pub_key}`\n\n"
            "📋 *String Konfigurasi 1-Klik (Copy & Paste ke Client):*\n"
            f"`{RELAY_HOST}:21116?key={pub_key}`\n\n"
            "💡 *Cara Input di Aplikasi:*\n"
            "1. Buka *Audira Desk* > *Pengaturan (⚙️)* > *ID/Relay Server*.\n"
            "2. Masukkan Relay Server dan Key di atas lalu klik OK."
        )
        send_message(token, chat_id, cfg_msg, thread_id=thread_id)

    elif text.startswith("/test_key_alert"):
        test_alert = format_key_mismatch_alert("[2001:448a:1021:5bb4:68ff:10db:aeae:603]:63201", "269819537", "invalid key (SIMULASI TEST)")
        send_message(token, chat_id, test_alert, thread_id=thread_id)

def main():
    print("=" * 60)
    print("  🛡️ AUDIRA NEXUS DEDICATED TELEGRAM BOT DAEMON (v2.2)")
    print("=" * 60)
    cfg = load_config()
    token = cfg.get("bot_token", "").strip()

    print(f"[*] Menghubungkan ke Telegram...")
    me = telegram_api(token, "getMe")
    if me and me.get("ok"):
        bot_user = me["result"]["username"]
        print(f"[v] Bot @{bot_user} terhubung!")
    else:
        print(f"[!] Gagal menghubungkan bot token: {token}")

    # Launch background Watchdog & Build Release Watcher thread
    t_watchdog = threading.Thread(target=watchdog_monitor, args=(cfg,), daemon=True)
    t_watchdog.start()

    # Launch background HBBS Docker Log Watcher for Key Mismatch
    t_hbbs = threading.Thread(target=hbbs_log_monitor, args=(cfg,), daemon=True)
    t_hbbs.start()

    last_offset = 0
    while True:
        try:
            updates = telegram_api(token, f"getUpdates?offset={last_offset + 1}&timeout=20")
            if updates and updates.get("ok"):
                for u in updates.get("result", []):
                    last_offset = u["update_id"]
                    handle_update(u, cfg)
        except Exception as e:
            print(f"[!] Polling loop error: {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
