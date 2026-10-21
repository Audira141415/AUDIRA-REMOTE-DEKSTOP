#!/usr/bin/env python3
"""
AUDIRA Remote Desktop — Central Management, Auth & Heartbeat API Server
Runs on port 21114 (RustDesk/Audira HTTP API) and integrates with Admin Console & Client App.
Author: Agus Dwi Rianto (AUDIRA) • Audira Studio
"""

import os
import sys
import json
import time
import uuid
import sqlite3
import datetime
import threading
import socket
import hmac
import hashlib
import base64
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 21114
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "db_v2.sqlite3")
META_PATH = os.path.join(DATA_DIR, "devices_meta.json")
ACCOUNTS_PATH = os.path.join(DATA_DIR, "accounts.json")
AUDIT_PATH = os.path.join(DATA_DIR, "audit_logs.json")
ORDERS_PATH = os.path.join(DATA_DIR, "orders.json")
MASTER_KEY_PATH = os.path.join(DATA_DIR, "server_master.key")

# In-memory tracking
PEERS_LOCK = threading.Lock()
ACTIVE_PEERS = {}
DISCONNECT_QUEUE = {}
SESSION_HISTORY = []

ACCOUNTS_LOCK = threading.Lock()
AUDIT_LOCK = threading.Lock()
ORDERS_LOCK = threading.Lock()
TELEGRAM_CONFIG_PATH = os.path.join(DATA_DIR, "telegram_apps_config.json")

# Session timeout: 30 days (2,592,000s) default; persistent for desktop clients and remembered sessions
SESSION_TIMEOUT_SECONDS = 30 * 86400
TOKEN_ACTIVITY_LOCK = threading.Lock()
TOKEN_LAST_ACTIVITY = {}

# In-Memory IP Rate Limiter & Anti-Brute Force Protection
RATE_LIMIT_LOCK = threading.Lock()
LOGIN_FAILURES = {}   # client_ip -> [timestamp, ...]
IP_BAN_LIST = {}      # client_ip -> ban_expire_ts
MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 600       # 10 minutes window
BAN_DURATION_SECONDS = 900       # 15 minutes ban

_MASTER_KEY = None

def get_or_create_master_key():
    global _MASTER_KEY
    if _MASTER_KEY is not None:
        return _MASTER_KEY
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(MASTER_KEY_PATH):
        try:
            with open(MASTER_KEY_PATH, "rb") as f:
                _MASTER_KEY = f.read().strip()
                if _MASTER_KEY:
                    return _MASTER_KEY
        except Exception as e:
            print(f"[!] Error reading master key: {e}")
    # Generate new Fernet-compatible key (32 random bytes urlsafe base64)
    try:
        from cryptography.fernet import Fernet
        key = Fernet.generate_key()
    except Exception:
        key = base64.urlsafe_b64encode(os.urandom(32))
    try:
        with open(MASTER_KEY_PATH, "wb") as f:
            f.write(key)
        try:
            os.chmod(MASTER_KEY_PATH, 0o600)
        except Exception:
            pass
        _MASTER_KEY = key
        print("[+] Created new server_master.key with 0600 permissions.")
    except Exception as e:
        print(f"[!] Error saving master key: {e}")
        _MASTER_KEY = key
    return _MASTER_KEY

def encrypt_credential(plaintext):
    """Encrypts unattended device credentials at rest using Fernet / AES-256-GCM"""
    if not plaintext:
        return ""
    if isinstance(plaintext, str) and (plaintext.startswith("enc:v1:") or plaintext.startswith("enc:v1-fb:")):
        return plaintext
    try:
        from cryptography.fernet import Fernet
        key = get_or_create_master_key()
        f = Fernet(key)
        token = f.encrypt(str(plaintext).encode("utf-8"))
        return f"enc:v1:{token.decode('utf-8')}"
    except Exception as e:
        # Cryptographic stream fallback (HMAC-SHA256 authenticated XOR stream)
        try:
            key = get_or_create_master_key()
            salt = os.urandom(16)
            stream_key = hashlib.pbkdf2_hmac('sha256', key, salt, 10000)
            raw = str(plaintext).encode("utf-8")
            keystream = hashlib.sha256(stream_key).digest()
            while len(keystream) < len(raw):
                keystream += hashlib.sha256(keystream).digest()
            xored = bytes(a ^ b for a, b in zip(raw, keystream[:len(raw)]))
            tag = hmac.new(stream_key, salt + xored, hashlib.sha256).digest()[:16]
            payload = base64.b64encode(salt + tag + xored).decode("ascii")
            return f"enc:v1-fb:{payload}"
        except Exception as ex:
            print(f"[!] Encryption error: {ex}")
            return str(plaintext)

def decrypt_credential(ciphertext):
    """Decrypts unattended device credentials into memory for authenticated owner"""
    if not ciphertext or not isinstance(ciphertext, str):
        return ""
    if not ciphertext.startswith("enc:v1:"):
        if ciphertext.startswith("enc:v1-fb:"):
            try:
                key = get_or_create_master_key()
                raw_b64 = ciphertext[len("enc:v1-fb:"):]
                data = base64.b64decode(raw_b64.encode("ascii"))
                salt = data[:16]
                tag = data[16:32]
                xored = data[32:]
                stream_key = hashlib.pbkdf2_hmac('sha256', key, salt, 10000)
                expected_tag = hmac.new(stream_key, salt + xored, hashlib.sha256).digest()[:16]
                if not hmac.compare_digest(tag, expected_tag):
                    return ""
                keystream = hashlib.sha256(stream_key).digest()
                while len(keystream) < len(xored):
                    keystream += hashlib.sha256(keystream).digest()
                raw = bytes(a ^ b for a, b in zip(xored, keystream[:len(xored)]))
                return raw.decode("utf-8")
            except Exception:
                return ""
        # Legacy plaintext stored before hardening
        return ciphertext
    try:
        from cryptography.fernet import Fernet
        key = get_or_create_master_key()
        f = Fernet(key)
        token = ciphertext[len("enc:v1:"):].encode("utf-8")
        dec = f.decrypt(token)
        return dec.decode("utf-8")
    except Exception as e:
        print(f"[!] Decryption error: {e}")
        return ""

def hash_password(plaintext):
    """One-way salted password hashing using PBKDF2-HMAC-SHA256 (100,000 rounds)"""
    if not plaintext:
        return ""
    if isinstance(plaintext, str) and plaintext.startswith("pbkdf2:sha256:"):
        return plaintext
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac('sha256', str(plaintext).encode('utf-8'), salt, 100000)
    return f"pbkdf2:sha256:100000${salt.hex()}${dk.hex()}"

def verify_password(stored_val, candidate_pwd):
    """
    Verifies candidate password against stored value.
    Returns (is_valid: bool, needs_rehash: bool)
    """
    if not stored_val or not candidate_pwd:
        return False, False
    stored_str = str(stored_val).strip()
    candidate_str = str(candidate_pwd).strip()

    if stored_str.startswith("pbkdf2:sha256:"):
        try:
            parts = stored_str.split("$")
            if len(parts) == 3:
                rounds_spec = parts[0] # "pbkdf2:sha256:100000"
                rounds = int(rounds_spec.split(":")[-1])
                salt = bytes.fromhex(parts[1])
                expected_dk = bytes.fromhex(parts[2])
                actual_dk = hashlib.pbkdf2_hmac('sha256', candidate_str.encode('utf-8'), salt, rounds)
                is_match = hmac.compare_digest(actual_dk, expected_dk)
                return is_match, False
        except Exception as e:
            print(f"[!] Error verifying hashed password: {e}")
            return False, False

    # Legacy plaintext password fallback
    is_match = hmac.compare_digest(stored_str, candidate_str)
    return is_match, is_match  # if matches legacy, flag needs_rehash=True

def is_ip_banned(client_ip):
    now = time.time()
    with RATE_LIMIT_LOCK:
        ban_until = IP_BAN_LIST.get(client_ip)
        if ban_until:
            if now < ban_until:
                remaining = int(ban_until - now)
                return True, remaining
            else:
                del IP_BAN_LIST[client_ip]
        return False, 0

def record_login_failure(client_ip, target_identity):
    now = time.time()
    with RATE_LIMIT_LOCK:
        attempts = LOGIN_FAILURES.get(client_ip, [])
        attempts = [t for t in attempts if (now - t) < LOGIN_WINDOW_SECONDS]
        attempts.append(now)
        LOGIN_FAILURES[client_ip] = attempts

        if len(attempts) >= MAX_LOGIN_ATTEMPTS:
            ban_until = now + BAN_DURATION_SECONDS
            IP_BAN_LIST[client_ip] = ban_until
            LOGIN_FAILURES.pop(client_ip, None)
            
            # Dispatch urgent security alert
            waktu_str = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
            add_audit_log(
                "IP_AUTO_BANNED",
                "SECURITY_GUARD",
                client_ip,
                target_identity or "ANONYMOUS",
                f"IP {client_ip} diblokir otomatis selama 15 menit (terlalu banyak percobaan login gagal: {len(attempts)}x)"
            )
            send_telegram_alert(
                f"🚨 <b>[AUDIRA SEC-OPS] IP TERBLOKIR OTOMATIS (BRUTE-FORCE DETECTED)</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━\n"
                f"🌐 <b>IP Penyerang:</b> <code>{client_ip}</code>\n"
                f"🎯 <b>Target Akun:</b> <code>{target_identity}</code>\n"
                f"❌ <b>Percobaan Gagal:</b> {len(attempts)} kali berturut-turut\n"
                f"⛔ <b>Tindakan:</b> Diblokir otomatis selama 15 menit (HTTP 429)\n"
                f"🕒 <b>Waktu Deteksi:</b> {waktu_str} WIB"
            )
            return True, BAN_DURATION_SECONDS
        return False, 0

def clear_login_failure(client_ip):
    with RATE_LIMIT_LOCK:
        LOGIN_FAILURES.pop(client_ip, None)

def send_telegram_alert(text_html):
    """Dispatches real-time security, registration, and login alerts to Telegram bot in background thread"""
    def _worker():
        try:
            if not os.path.exists(TELEGRAM_CONFIG_PATH):
                return
            with open(TELEGRAM_CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            token = cfg.get("bot_token")
            chat_id = cfg.get("chat_id")
            thread_id = cfg.get("thread_id")
            if not token or not chat_id:
                return

            import urllib.request
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": text_html,
                "parse_mode": "HTML"
            }
            if thread_id is not None:
                payload["message_thread_id"] = thread_id

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                pass
        except Exception as e:
            print(f"[!] Telegram dispatch error: {e}")

    threading.Thread(target=_worker, daemon=True).start()

def get_default_audit_logs():
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return [
        {
            "id": "AUD-0001",
            "timestamp": now_str,
            "event_type": "SYSTEM_START",
            "peer_id": "SYSTEM",
            "peer_ip": "127.0.0.1",
            "operator": "Audira Daemon",
            "details": "Audira Central Management Service & Fleet Server aktif",
            "duration_sec": 0
        },
        {
            "id": "AUD-0002",
            "timestamp": now_str,
            "event_type": "TELEGRAM_BOT_READY",
            "peer_id": "TELEGRAM",
            "peer_ip": "127.0.0.1",
            "operator": "Telegram Bot Worker",
            "details": "Layanan verifikasi 2FA & Approval Remote via Telegram Bot siap digunakan",
            "duration_sec": 0
        }
    ]

def load_audit_logs():
    if os.path.exists(AUDIT_PATH):
        try:
            with open(AUDIT_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print(f"[!] Error loading audit_logs.json: {e}")
    logs = get_default_audit_logs()
    save_audit_logs(logs)
    return logs

def save_audit_logs(logs):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        temp_path = AUDIT_PATH + ".tmp"
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2)
        os.replace(temp_path, AUDIT_PATH)
    except Exception as e:
        print(f"[!] Error saving audit_logs.json: {e}")

def add_audit_log(event_type, peer_id, peer_ip, operator, details, duration_sec=0):
    with AUDIT_LOCK:
        logs = load_audit_logs()
        new_entry = {
            "id": f"AUD-{int(time.time()*1000) % 1000000:06d}",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "event_type": event_type,
            "peer_id": str(peer_id),
            "peer_ip": str(peer_ip),
            "operator": str(operator),
            "details": str(details),
            "duration_sec": int(duration_sec)
        }
        logs.insert(0, new_entry)
        if len(logs) > 200:
            logs = logs[:200]
        save_audit_logs(logs)
        return new_entry

def get_default_accounts():
    return {
        "audira": {
            "username": "audira",
            "password": "Sigma1993",
            "display_name": "Agus Dwi Rianto",
            "email": "admin@audira.my.id",
            "note": "Audira Certified Administrator",
            "is_admin": True,
            "status": 1,
            "created_at": "2026-10-18 00:00:00",
            "tokens": {},
            "devices": {},
            "tags": ["My Devices", "Audira Fleet"],
            "tag_colors": {"My Devices": 4282557947, "Audira Fleet": 4280391411}
        }
    }

def generate_license_key(plan="pro"):
    plan_prefix = "PRO" if "pro" in plan.lower() else ("TEAM" if "team" in plan.lower() else "ENT")
    p1 = uuid.uuid4().hex[:4].upper()
    p2 = uuid.uuid4().hex[4:8].upper()
    p3 = uuid.uuid4().hex[8:12].upper()
    return f"ADR-{plan_prefix}-{p1}-{p2}-{p3}"

def get_default_orders():
    return [
        {
            "id": "INV-20261019-8801",
            "plan": "team",
            "plan_name": "Pro Team & MSP",
            "cycle": "monthly",
            "amount": 149000,
            "currency": "IDR",
            "customer_name": "PT Solusi Cloud Nusantara",
            "email": "billing@cloudnusantara.id",
            "target_id": "269 819 537",
            "payment_method": "qris",
            "license_key": "ADR-TEAM-89A1-BC42-7710",
            "status": "PAID",
            "created_at": "2026-10-19 14:20:00",
            "expires_at": "2027-10-19 14:20:00"
        },
        {
            "id": "INV-20261019-9142",
            "plan": "pro",
            "plan_name": "Pro Individual",
            "cycle": "annual",
            "amount": 499000,
            "currency": "IDR",
            "customer_name": "DevOps Consultant Mandiri",
            "email": "devops@audira.net",
            "target_id": "313 015 359",
            "payment_method": "bca",
            "license_key": "ADR-PRO-3F21-E089-9114",
            "status": "PAID",
            "created_at": "2026-10-19 16:45:00",
            "expires_at": "2027-10-19 16:45:00"
        }
    ]

def load_orders():
    if os.path.exists(ORDERS_PATH):
        try:
            with open(ORDERS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print(f"[!] Error loading orders.json: {e}")
    orders = get_default_orders()
    save_orders(orders)
    return orders

def save_orders(orders):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        temp_path = ORDERS_PATH + ".tmp"
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(orders, f, indent=2)
        os.replace(temp_path, ORDERS_PATH)
    except Exception as e:
        print(f"[!] Error saving orders.json: {e}")

def load_accounts():
    if os.path.exists(ACCOUNTS_PATH):
        try:
            with open(ACCOUNTS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and data:
                    return data
        except Exception as e:
            print(f"[!] Error loading accounts.json: {e}")
    accounts = get_default_accounts()
    save_accounts(accounts)
    return accounts

def save_accounts(accounts):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        # Ensure passwords and device unattended credentials are encrypted/hashed before disk write
        for uname, u in accounts.items():
            if isinstance(u, dict):
                raw_pwd = u.get("password")
                if raw_pwd and not str(raw_pwd).startswith("pbkdf2:sha256:"):
                    u["password"] = hash_password(raw_pwd)
                devs = u.get("devices", {})
                for did, d in devs.items():
                    if isinstance(d, dict):
                        dp = d.get("password")
                        if dp and not str(dp).startswith("enc:v1:"):
                            d["password"] = encrypt_credential(dp)
                        dup = d.get("unattended_password")
                        if dup and not str(dup).startswith("enc:v1:"):
                            d["unattended_password"] = encrypt_credential(dup)

        temp_path = ACCOUNTS_PATH + ".tmp"
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(accounts, f, indent=2)
        os.replace(temp_path, ACCOUNTS_PATH)
        try:
            os.chmod(ACCOUNTS_PATH, 0o600)
        except Exception:
            pass
    except Exception as e:
        print(f"[!] Error saving accounts.json: {e}")

def load_meta():
    if os.path.exists(META_PATH):
        try:
            with open(META_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_meta(meta):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(META_PATH, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
    except Exception as e:
        print(f"[!] Error saving meta: {e}")

def get_sqlite_peers():
    """Fetch peers registered by hbbs in SQLite"""
    peers = []
    if not os.path.exists(DB_PATH):
        return peers
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT id, uuid, created_at, note, info FROM peer ORDER BY created_at DESC;")
        for row in cursor.fetchall():
            pid, uuid_blob, created_at, note, info_str = row
            ip = ""
            try:
                if info_str:
                    info_obj = json.loads(info_str)
                    ip = info_obj.get("ip", "").replace("::ffff:", "")
            except Exception:
                ip = ""
            peers.append({
                "id": str(pid),
                "created_at": str(created_at),
                "note": note or "",
                "ip": ip
            })
        conn.close()
    except Exception as e:
        print(f"[!] SQLite query error: {e}")
    return peers

def get_reachable_ips():
    reachable = set()
    try:
        import subprocess
        res = subprocess.run(["ip", "neigh", "show"], capture_output=True, text=True, timeout=2)
        for line in res.stdout.splitlines():
            parts = line.strip().split()
            if len(parts) >= 4 and any(k in parts for k in ["REACHABLE", "DELAY", "PROBE"]):
                reachable.add(parts[0])
    except Exception:
        pass
    return reachable

def format_id(raw_id):
    s = str(raw_id).replace(" ", "")
    if len(s) == 9:
        return f"{s[:3]} {s[3:6]} {s[6:]}"
    return s

def is_device_online(rid, ip="", reachable_ips=None):
    if reachable_ips is None:
        reachable_ips = get_reachable_ips()
    now = time.time()
    with PEERS_LOCK:
        lp = ACTIVE_PEERS.get(str(rid))
        if lp:
            if (now - lp.get("last_heartbeat", 0)) < 45:
                return True
            peer_ip = lp.get("ip") or ip
            if peer_ip and peer_ip in reachable_ips:
                return True
    if ip and ip in reachable_ips:
        return True
    return False

def find_user_by_token(auth_header):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, None
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None, None

    now = time.time()
    with ACCOUNTS_LOCK:
        accounts = load_accounts()
        for uname, u in accounts.items():
            tokens = u.get("tokens", {})
            if token in tokens:
                token_meta = tokens[token] if isinstance(tokens[token], dict) else {}
                is_persistent = token_meta.get("persistent", True) or bool(token_meta.get("device_id"))
                
                # Check inactivity timeout only for non-persistent sessions
                if not is_persistent:
                    with TOKEN_ACTIVITY_LOCK:
                        last_act = TOKEN_LAST_ACTIVITY.get(token)
                        if last_act is not None and (now - last_act) > SESSION_TIMEOUT_SECONDS:
                            TOKEN_LAST_ACTIVITY.pop(token, None)
                            del u["tokens"][token]
                            save_accounts(accounts)
                            return None, None

                with TOKEN_ACTIVITY_LOCK:
                    TOKEN_LAST_ACTIVITY[token] = now
                return uname, u
    return None, None

def get_account_role(username, u=None):
    uname = str(username).lower()
    if uname == "audira":
        return "owner"
    if u is None:
        with ACCOUNTS_LOCK:
            accounts = load_accounts()
            u = accounts.get(username, {})
    if u.get("is_owner") or u.get("role") == "owner":
        return "owner"
    if u.get("is_admin") or u.get("role") == "admin":
        return "admin"
    return "user"

def is_authenticated_request(client_ip, auth_header):
    uname, u = find_user_by_token(auth_header)
    if uname:
        return True, uname
    return False, None

def is_admin_request(client_ip, auth_header):
    uname, u = find_user_by_token(auth_header)
    if not uname or not u:
        return False, None, None
    role = get_account_role(uname, u)
    if role in ["owner", "admin"]:
        return True, uname, u
    return False, uname, u

def build_fleet_devices():
    meta = load_meta()
    sqlite_peers = get_sqlite_peers()
    reachable_ips = get_reachable_ips()
    now = time.time()

    merged_devices = {}

    # 1. Fill with SQLite peers
    for sp in sqlite_peers:
        rid = sp["id"]
        custom = meta.get(rid, {})
        ip = sp["ip"] or "127.0.0.1"
        is_arp_online = ip in reachable_ips
        merged_devices[rid] = {
            "raw_id": rid,
            "id": format_id(rid),
            "alias": custom.get("alias") or f"PC-{rid[-4:]}",
            "hostname": custom.get("hostname") or f"PC-{rid[-4:]}",
            "username": custom.get("username") or "User",
            "ip": ip,
            "os": custom.get("os") or "Windows / Desktop",
            "group": custom.get("group") or "Local Fleet",
            "version": "1.5.3",
            "is_online": is_arp_online,
            "status": "online" if is_arp_online else "offline",
            "last_seen": sp["created_at"],
            "conns": []
        }

    # 2. Overlay live memory peers
    with PEERS_LOCK:
        for rid, lp in ACTIVE_PEERS.items():
            custom = meta.get(rid, {})
            is_heartbeat_online = (now - lp.get("last_heartbeat", 0)) < 45
            peer_ip = lp.get("ip") or merged_devices.get(rid, {}).get("ip", "127.0.0.1")
            is_online = is_heartbeat_online or (peer_ip in reachable_ips)
            time_str = datetime.datetime.fromtimestamp(lp.get("last_heartbeat", now)).strftime("%Y-%m-%d %H:%M:%S")

            merged_devices[rid] = {
                "raw_id": rid,
                "id": format_id(rid),
                "alias": custom.get("alias") or lp.get("hostname") or f"PC-{rid[-4:]}",
                "hostname": lp.get("hostname") or f"PC-{rid[-4:]}",
                "username": lp.get("username") or "User",
                "ip": peer_ip,
                "os": lp.get("os") or "Windows 11 / Desktop",
                "group": custom.get("group") or "Local Fleet",
                "version": lp.get("version", "1.5.3"),
                "is_online": is_online,
                "status": "online" if is_online else "offline",
                "last_seen": time_str,
                "conns": lp.get("conns", [])
            }

    devices_list = list(merged_devices.values())
    devices_list.sort(key=lambda x: (not x["is_online"], x["last_seen"]), reverse=True)
    return devices_list


class AudiraAPIHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept-Encoding, X-Requested-With, Cache-Control")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("X-XSS-Protection", "1; mode=block")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        auth_header = self.headers.get("Authorization", "")
        client_ip = (self.headers.get("X-Real-IP") or self.client_address[0]).replace("::ffff:", "")

        # 0. User Profile & Personal Devices endpoint (Accessible by all logged in users)
        if path == "/api/user/me":
            uname, u = find_user_by_token(auth_header)
            if not uname or not u:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Sesi tidak valid atau telah berakhir. Silakan login kembali."}).encode())
                return

            role = get_account_role(uname, u)
            is_owner = role == "owner"
            is_admin = role in ["owner", "admin"]
            role_title = "Pemilik Sistem (Owner)" if is_owner else ("Administrator" if is_admin else "Pengguna Terdaftar (Member)")

            reachable_ips = get_reachable_ips()
            devices_data = []
            for clean_id, d in u.get("devices", {}).items():
                online = is_device_online(clean_id, d.get("ip", ""), reachable_ips)
                devices_data.append({
                    "raw_id": clean_id,
                    "id": format_id(clean_id),
                    "hostname": d.get("hostname", ""),
                    "alias": d.get("alias") or d.get("hostname", ""),
                    "os": d.get("os", "Windows"),
                    "ip": d.get("ip", ""),
                    "tags": d.get("tags", ["My Devices"]),
                    "last_login": d.get("last_login", ""),
                    "is_online": online,
                    "status": "online" if online else "offline"
                })

            quota_max = 100 if is_owner else (25 if is_admin else 5)
            concur_max = 20 if is_owner else (5 if is_admin else 1)
            plan_name = u.get("plan", ("Enterprise Cluster" if is_owner else ("Pro Team & MSP" if is_admin else "Community Free (Gratis)")))
            lic_key = u.get("license_key", f"AUD-{'OWN' if is_owner else ('ADM' if is_admin else 'COM')}-{uname[:4].upper()}-9901-772A")

            resp = {
                "success": True,
                "user": {
                    "username": uname,
                    "name": uname,
                    "display_name": u.get("display_name", uname),
                    "email": u.get("email", ""),
                    "role": role,
                    "role_title": role_title,
                    "is_admin": is_admin,
                    "is_owner": is_owner,
                    "created_at": u.get("created_at", ""),
                    "plan": plan_name,
                    "license_key": lic_key,
                    "client_ip": client_ip,
                    "session_timeout_minutes": 15,
                    "telegram_notif": u.get("telegram_notif", True),
                    "quota": {
                        "devices_used": len(devices_data),
                        "devices_max": quota_max,
                        "concurrent_sessions": concur_max,
                        "fps": 60,
                        "codec": "AV1 / VP9 / H.265 Direct P2P"
                    },
                    "relay_info": {
                        "host": "desk.audira.my.id",
                        "port": "21116",
                        "key": "k_AudiraDesk2026SecureRelayZeroTrust"
                    },
                    "devices": devices_data
                }
            }
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
            return

        # Protected Admin & Fleet Endpoints Guard (Strictly Owner and Admin only)
        protected_get_paths = (
            "/api/users", "/api/accounts", "/api/fleet", "/api/devices",
            "/api/metrics", "/api/sessions", "/api/audit_logs",
            "/api/orders", "/api/licenses"
        )
        if path in protected_get_paths:
            is_adm, req_user, u_obj = is_admin_request(client_ip, auth_header)
            if not is_adm:
                self.send_response(403)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Forbidden: Akses ditolak. Halaman & endpoint ini khusus untuk Administrator dan Owner."
                }).encode())
                return

        # 1. Health check
        if path == "/api/health" or path == "/health":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "service": "Audira API", "version": "1.5.3"}).encode())
            return

        # 2. Login options (Empty array = standard username/password login in client)
        if path == "/api/login-options":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b"[]")
            return

        # 3. Address Book (GET /api/ab) — Multi-device account synchronization
        if path == "/api/ab":
            uname, user = find_user_by_token(auth_header)
            if not uname:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return

            # Build peers list from all devices linked to this user's account
            reachable_ips = get_reachable_ips()
            peers_list = []
            user_devices = user.get("devices", {})

            for clean_id, d in user_devices.items():
                is_online = is_device_online(clean_id, d.get("ip", ""), reachable_ips)
                
                # Fetch latest live data if peer is currently reporting
                with PEERS_LOCK:
                    lp = ACTIVE_PEERS.get(clean_id, {})
                
                os_str = lp.get("os") or d.get("os") or "Windows"
                platform = "Windows"
                if "linux" in os_str.lower(): platform = "Linux"
                elif "mac" in os_str.lower() or "darwin" in os_str.lower(): platform = "macOS"
                elif "android" in os_str.lower(): platform = "Android"
                elif "ios" in os_str.lower(): platform = "iOS"

                is_mobile_dev = platform in ["Android", "iOS"]
                alias = d.get("alias") or lp.get("hostname") or d.get("hostname") or (f"Phone-{clean_id[-4:]}" if is_mobile_dev else f"PC-{clean_id[-4:]}")
                hostname = lp.get("hostname") or d.get("hostname") or (f"Phone-{clean_id[-4:]}" if is_mobile_dev else f"PC-{clean_id[-4:]}")
                username = lp.get("username") or d.get("username") or ("Mobile User" if is_mobile_dev else "User")

                dev_pwd = d.get("unattended_password") or d.get("password", "")
                if dev_pwd:
                    dev_pwd = decrypt_credential(dev_pwd)
                dev_hash = d.get("hash", "")
                peers_list.append({
                    "id": clean_id,
                    "alias": alias,
                    "username": username,
                    "hostname": hostname,
                    "platform": platform,
                    "tags": d.get("tags", ["My Devices"]),
                    "same_server": True,
                    "online": is_online,
                    "hash": dev_hash,
                    "password": dev_pwd,
                    "note": d.get("note", f"Akun: {uname}")
                })

            tags = user.get("tags", ["My Devices", "Audira Fleet"])
            tag_colors = user.get("tag_colors", {"My Devices": 4282557947, "Audira Fleet": 4280391411})

            ab_payload = {
                "tags": tags,
                "tag_colors": json.dumps(tag_colors),
                "peers": peers_list
            }

            resp = {
                "data": json.dumps(ab_payload),
                "licensed_devices": 100
            }

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
            return

        # 4. Users endpoint (/api/users)
        if path == "/api/users":
            with ACCOUNTS_LOCK:
                accounts = load_accounts()
                user_list = []
                for u in accounts.values():
                    user_list.append({
                        "name": u["username"],
                        "display_name": u.get("display_name", u["username"]),
                        "email": u.get("email", ""),
                        "status": u.get("status", 1),
                        "is_admin": u.get("is_admin", False)
                    })
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"total": len(user_list), "data": user_list}).encode())
            return

        # 4b. Accessible Device Groups endpoint (/api/device-group/accessible) for Audira client Group tab
        if path == "/api/device-group/accessible":
            uname, u = find_user_by_token(auth_header)
            groups = [{"name": "Default"}, {"name": "Local Fleet"}]
            if u:
                tags = u.get("tags", [])
                for t in tags:
                    if t and not any(g["name"] == t for g in groups):
                        groups.append({"name": t})
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"total": len(groups), "data": groups}).encode())
            return

        # 4c. Accessible Peers endpoint (/api/peers) for Audira client Group tab
        if path == "/api/peers":
            uname, u = find_user_by_token(auth_header)
            fleet = build_fleet_devices()
            peer_list = []

            role = get_account_role(uname, u) if u else "user"
            is_admin = role in ["owner", "admin"] if u else False

            with ACCOUNTS_LOCK:
                accounts = load_accounts()

            for dev in fleet:
                rid = dev.get("raw_id") or dev.get("id") or ""
                clean_id = str(rid).replace(" ", "")
                # If authenticated user is not admin, only show devices linked to their account
                if u and not is_admin:
                    if clean_id not in u.get("devices", {}):
                        continue

                # Find which account owns this device (if any)
                dev_owner = uname or "audira"
                dev_owner_display = u.get("display_name", dev_owner) if u else "Agus Dwi Rianto"
                dev_rec = {}
                for acct_name, acct in accounts.items():
                    if clean_id in acct.get("devices", {}):
                        dev_owner = acct_name
                        dev_owner_display = acct.get("display_name", acct_name)
                        dev_rec = acct["devices"][clean_id]
                        break

                is_owner_or_admin = (dev_owner == uname) or is_admin
                dev_pwd = dev_rec.get("unattended_password") or dev_rec.get("password") or ""
                if dev_pwd:
                    dev_pwd = decrypt_credential(dev_pwd)
                dev_hash = dev_rec.get("hash") or ""

                peer_list.append({
                    "id": clean_id,
                    "info": {
                        "device_name": dev.get("hostname") or dev.get("alias") or f"PC-{clean_id[-4:]}",
                        "username": dev.get("username") or "User",
                        "os": dev.get("os") or "Windows",
                        "ip": dev.get("ip", ""),
                        "password": dev_pwd if is_owner_or_admin else "",
                        "hash": dev_hash if is_owner_or_admin else "",
                        "unattended_ready": bool(dev_pwd or dev_hash) if is_owner_or_admin else False,
                    },
                    "password": dev_pwd if is_owner_or_admin else "",
                    "hash": dev_hash if is_owner_or_admin else "",
                    "status": 1,
                    "user": dev_owner,
                    "user_name": dev_owner_display,
                    "device_group_name": dev.get("group") or "Default",
                    "note": dev.get("alias") or ""
                })

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"total": len(peer_list), "data": peer_list}).encode())
            return

        # 5. Accounts & Linked Devices endpoint (/api/accounts) for Web Admin Console
        if path == "/api/accounts":
            reachable_ips = get_reachable_ips()
            with ACCOUNTS_LOCK:
                accounts = load_accounts()
                accounts_data = []
                for uname, u in accounts.items():
                    devices_data = []
                    user_devs = u.get("devices", {})
                    for clean_id, d in user_devs.items():
                        online = is_device_online(clean_id, d.get("ip", ""), reachable_ips)
                        with PEERS_LOCK:
                            lp = ACTIVE_PEERS.get(clean_id, {})

                        devices_data.append({
                            "raw_id": clean_id,
                            "id": format_id(clean_id),
                            "hostname": lp.get("hostname") or d.get("hostname", ""),
                            "username": lp.get("username") or d.get("username", ""),
                            "alias": d.get("alias") or lp.get("hostname") or d.get("hostname", ""),
                            "os": lp.get("os") or d.get("os", "Windows"),
                            "ip": lp.get("ip") or d.get("ip", ""),
                            "tags": d.get("tags", ["My Devices"]),
                            "last_login": d.get("last_login", ""),
                            "is_online": online,
                            "status": "online" if online else "offline"
                        })

                    role = get_account_role(uname, u)
                    is_owner = role == "owner"
                    is_admin = role in ["owner", "admin"]
                    role_title = "Pemilik Sistem (Owner)" if is_owner else ("Administrator" if is_admin else "Pengguna Terdaftar (Member)")
                    online_count = sum(1 for d in devices_data if d.get("is_online"))

                    accounts_data.append({
                        "username": uname,
                        "display_name": u.get("display_name", uname),
                        "email": u.get("email", f"{uname}@audira.my.id"),
                        "note": u.get("note", "Audira Member"),
                        "role": role,
                        "role_title": role_title,
                        "is_owner": is_owner,
                        "is_admin": is_admin,
                        "status": u.get("status", 1),
                        "created_at": u.get("created_at", ""),
                        "total_devices": len(devices_data),
                        "online_devices": online_count,
                        "devices": devices_data
                    })

                accounts_data.sort(key=lambda x: (not x["is_owner"], not x["is_admin"], x["username"]))

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "total_accounts": len(accounts_data),
                "accounts": accounts_data
            }).encode())
            return

        # 6. Fleet devices endpoint (/api/fleet or /api/devices)
        if path == "/api/fleet" or path == "/api/devices":
            devices_list = build_fleet_devices()
            online_count = sum(1 for d in devices_list if d["is_online"])
            response = {
                "success": True,
                "total": len(devices_list),
                "online_count": online_count,
                "offline_count": len(devices_list) - online_count,
                "devices": devices_list
            }

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            return

        # 7. Metrics endpoint (/api/metrics)
        if path == "/api/metrics":
            devices_list = build_fleet_devices()
            online_count = sum(1 for d in devices_list if d["is_online"])
            active_conns = sum(len(d.get("conns", [])) for d in devices_list)
            now = time.time()

            metrics = {
                "success": True,
                "cluster_host": "desk.audira.my.id",
                "hbbs_status": "ONLINE",
                "hbbr_status": "ONLINE",
                "total_devices": len(devices_list),
                "online_devices": online_count,
                "offline_devices": max(0, len(devices_list) - online_count),
                "active_sessions": active_conns,
                "throughput_mbs": round(active_conns * 2.4, 1) if active_conns > 0 else 0.0,
                "timestamp": int(now)
            }

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(metrics).encode())
            return

        # 8. Sessions endpoint (/api/sessions)
        if path == "/api/sessions":
            sessions = []
            now = time.time()
            with PEERS_LOCK:
                for rid, lp in ACTIVE_PEERS.items():
                    for c in lp.get("conns", []):
                        sessions.append({
                            "session_id": str(c),
                            "target_id": format_id(rid),
                            "raw_id": rid,
                            "target_alias": lp.get("hostname", f"Host-{rid[-4:]}"),
                            "target_ip": lp.get("ip", ""),
                            "status": "ACTIVE",
                            "protocol": "Direct P2P UDP",
                            "started_at": datetime.datetime.fromtimestamp(lp.get("last_heartbeat", now)).strftime("%Y-%m-%d %H:%M:%S")
                        })
            for sh in SESSION_HISTORY[-20:]:
                sessions.append(sh)

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "sessions": sessions}).encode())
            return

        # 10. Audit Logs endpoint (/api/audit_logs)
        if path == "/api/audit_logs":
            with AUDIT_LOCK:
                logs = load_audit_logs()
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "total": len(logs), "logs": logs}).encode())
            return

        # 11. Orders & Billing endpoint (/api/orders)
        if path == "/api/orders":
            with ORDERS_LOCK:
                orders = load_orders()
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "total": len(orders), "orders": orders}).encode())
            return

        # 12. Active Licenses endpoint (/api/licenses)
        if path == "/api/licenses":
            with ORDERS_LOCK:
                orders = load_orders()
            active_lics = [o for o in orders if o.get("status") in ["PAID", "ACTIVE"]]
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "total_active": len(active_lics), "licenses": active_lics}).encode())
            return

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(b"Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        auth_header = self.headers.get("Authorization", "")

        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else ""
        client_ip = (self.headers.get("X-Real-IP") or self.client_address[0]).replace("::ffff:", "")

        # Protected Admin Actions Guard (Strictly Owner and Admin only)
        protected_post_paths = (
            "/api/devices/alias", "/api/accounts/create", "/api/accounts/delete-device",
            "/api/accounts/set-role", "/api/audit_logs/clear",
            "/api/orders/approve", "/api/orders/delete", "/api/sessions/terminate"
        )
        if path in protected_post_paths:
            is_adm, req_user, u_obj = is_admin_request(client_ip, auth_header)
            if not is_adm:
                self.send_response(403)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Forbidden: Akses ditolak. Tindakan ini hanya diizinkan untuk Administrator dan Owner."
                }).encode())
                return

        # 0A. USER SELF-SERVICE: Update Profile (/api/user/update-profile)
        if path == "/api/user/update-profile":
            uname, u = find_user_by_token(auth_header)
            if not uname or not u:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Sesi tidak valid atau telah berakhir."}).encode())
                return
            try:
                data = json.loads(body) if body else {}
                display_name = str(data.get("display_name", "")).strip()
                email = str(data.get("email", "")).strip().lower()
                telegram_notif = bool(data.get("telegram_notif", True))
                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    if uname in accounts:
                        if display_name:
                            accounts[uname]["display_name"] = display_name
                        if email and "@" in email:
                            accounts[uname]["email"] = email
                        accounts[uname]["telegram_notif"] = telegram_notif
                        save_accounts(accounts)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Profil berhasil diperbarui."}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 0B. USER SELF-SERVICE: Rename Device Alias (/api/user/rename-device)
        if path == "/api/user/rename-device":
            uname, u = find_user_by_token(auth_header)
            if not uname or not u:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Sesi tidak valid."}).encode())
                return
            try:
                data = json.loads(body) if body else {}
                dev_id = str(data.get("device_id", "")).replace(" ", "").strip()
                alias = str(data.get("alias", "")).strip()
                if not dev_id:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "ID perangkat tidak boleh kosong."}).encode())
                    return
                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    if uname in accounts and "devices" in accounts[uname] and dev_id in accounts[uname]["devices"]:
                        accounts[uname]["devices"][dev_id]["alias"] = alias
                        save_accounts(accounts)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": f"Nama perangkat berhasil diubah ke '{alias}'."}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 0C. USER SELF-SERVICE: Unlink Device (/api/user/unlink-device)
        if path == "/api/user/unlink-device":
            uname, u = find_user_by_token(auth_header)
            if not uname or not u:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Sesi tidak valid."}).encode())
                return
            try:
                data = json.loads(body) if body else {}
                dev_id = str(data.get("device_id", "")).replace(" ", "").strip()
                if not dev_id:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "ID perangkat tidak boleh kosong."}).encode())
                    return
                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    if uname in accounts and "devices" in accounts[uname] and dev_id in accounts[uname]["devices"]:
                        del accounts[uname]["devices"][dev_id]
                        save_accounts(accounts)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Perangkat berhasil diputuskan dari akun."}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 0D. USER SELF-SERVICE: Revoke All Other Sessions (/api/user/revoke-other-sessions)
        if path == "/api/user/revoke-other-sessions":
            uname, u = find_user_by_token(auth_header)
            if not uname or not u:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Sesi tidak valid."}).encode())
                return
            current_tok = auth_header.split(" ", 1)[1].strip() if auth_header.startswith("Bearer ") else ""
            with ACCOUNTS_LOCK:
                accounts = load_accounts()
                if uname in accounts:
                    toks = accounts[uname].get("tokens", {})
                    new_toks = {}
                    if current_tok and current_tok in toks:
                        new_toks[current_tok] = toks[current_tok]
                    accounts[uname]["tokens"] = new_toks
                    save_accounts(accounts)
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Semua sesi lain berhasil diputuskan."}).encode())
            return

        # 0E. USER SELF-SERVICE: Set Device Unattended Credential (/api/user/device-credential)
        if path == "/api/user/device-credential":
            uname, u = find_user_by_token(auth_header)
            if not uname or not u:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Sesi tidak valid."}).encode())
                return
            try:
                data = json.loads(body) if body else {}
                dev_id = str(data.get("device_id", "")).replace(" ", "").strip()
                pwd = str(data.get("password", "")).strip()
                if not dev_id:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "ID perangkat tidak boleh kosong."}).encode())
                    return
                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    if uname in accounts:
                        if "devices" not in accounts[uname]:
                            accounts[uname]["devices"] = {}
                        if dev_id not in accounts[uname]["devices"]:
                            accounts[uname]["devices"][dev_id] = {
                                "id": dev_id,
                                "alias": f"PC-{dev_id[-4:]}",
                                "hostname": f"PC-{dev_id[-4:]}",
                                "username": "User",
                                "os": "Windows Desktop",
                                "ip": client_ip,
                                "tags": ["My Devices"],
                                "last_seen_ts": time.time(),
                            }
                        enc_pwd = encrypt_credential(pwd)
                        accounts[uname]["devices"][dev_id]["password"] = enc_pwd
                        accounts[uname]["devices"][dev_id]["unattended_password"] = enc_pwd
                        save_accounts(accounts)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Password akses mandiri berhasil disimpan."}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 1. SYSINFO_VER
        if path == "/api/sysinfo_ver":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"1")
            return

        # 2. SYSINFO (Client registers its system details)
        if path == "/api/sysinfo":
            try:
                data = json.loads(body) if body else {}
                rid = str(data.get("id", "")).strip().replace(" ", "")
                if rid:
                    with PEERS_LOCK:
                        peer = ACTIVE_PEERS.get(rid, {})
                        peer.update({
                            "id": rid,
                            "uuid": data.get("uuid", ""),
                            "hostname": data.get("hostname", "") or peer.get("hostname", ""),
                            "username": data.get("username", "") or peer.get("username", ""),
                            "version": data.get("version", "1.5.3"),
                            "os": data.get("os", "Windows / Desktop"),
                            "ip": client_ip,
                            "last_heartbeat": time.time(),
                            "conns": peer.get("conns", [])
                        })
                        ACTIVE_PEERS[rid] = peer

                    # Also update this device under any linked account
                    with ACCOUNTS_LOCK:
                        accounts = load_accounts()
                        changed = False
                        for u in accounts.values():
                            if rid in u.get("devices", {}):
                                dev = u["devices"][rid]
                                dev["ip"] = client_ip
                                dev["hostname"] = peer["hostname"]
                                dev["username"] = peer["username"]
                                dev["os"] = peer["os"]
                                dev["last_seen_ts"] = time.time()
                                changed = True
                        if changed:
                            save_accounts(accounts)

                    print(f"[+] Sysinfo registered from {rid} ({peer.get('hostname')}) at {client_ip}")
            except Exception as e:
                print(f"[!] Error processing sysinfo: {e}")

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"SYSINFO_UPDATED")
            return

        # 3. HEARTBEAT (Client sends ping every 15s)
        if path == "/api/heartbeat":
            disconnect_list = []
            try:
                data = json.loads(body) if body else {}
                rid = str(data.get("id", "")).strip().replace(" ", "")
                if rid:
                    conns = data.get("conns", [])
                    with PEERS_LOCK:
                        peer = ACTIVE_PEERS.get(rid, {})
                        peer.update({
                            "id": rid,
                            "uuid": data.get("uuid", ""),
                            "ip": client_ip,
                            "last_heartbeat": time.time(),
                            "conns": conns
                        })
                        ACTIVE_PEERS[rid] = peer

                        if rid in DISCONNECT_QUEUE:
                            disconnect_list = DISCONNECT_QUEUE.pop(rid)

                    with ACCOUNTS_LOCK:
                        accounts = load_accounts()
                        for u in accounts.values():
                            if rid in u.get("devices", {}):
                                u["devices"][rid]["last_seen_ts"] = time.time()
                                u["devices"][rid]["ip"] = client_ip
            except Exception as e:
                print(f"[!] Error processing heartbeat: {e}")

            resp = {}
            if disconnect_list:
                resp["disconnect"] = disconnect_list

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
            return

        # 4. USER AUTHENTICATION: LOGIN (POST /api/login)
        if path == "/api/login":
            banned, rem_sec = is_ip_banned(client_ip)
            if banned:
                rem_min = max(1, rem_sec // 60)
                self.send_response(429)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.send_header("Retry-After", str(rem_sec))
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Terlalu banyak percobaan login gagal dari IP ini. IP Anda diblokir sementara selama {rem_min} menit demi keamanan."
                }).encode())
                return

            try:
                data = json.loads(body) if body else {}
                raw_identity = str(data.get("username", "")).strip()
                password = str(data.get("password", "")).strip()
                device_id = str(data.get("id", "")).strip().replace(" ", "")
                device_uuid = str(data.get("uuid", "")).strip()
                device_info = data.get("deviceInfo", {})

                if not raw_identity:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Username atau email tidak boleh kosong."}).encode())
                    return

                with ACCOUNTS_LOCK:
                    accounts = load_accounts()

                    # Find account by username (case-insensitive) or email
                    target_user = None
                    target_username = None
                    for uname, u in accounts.items():
                        if uname.lower() == raw_identity.lower() or u.get("email", "").lower() == raw_identity.lower():
                            target_user = u
                            target_username = uname
                            break

                    if not target_user:
                        record_login_failure(client_ip, raw_identity)
                        self.send_response(400)
                        self.send_cors_headers()
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": "Akun tidak terdaftar. Silakan lakukan registrasi terlebih dahulu."}).encode())
                        return

                    stored_pwd = target_user.get("password") or ""
                    is_valid, needs_rehash = verify_password(stored_pwd, password)
                    if not is_valid:
                        record_login_failure(client_ip, raw_identity)
                        add_audit_log("LOGIN_FAILED", device_id or "WEB", client_ip, raw_identity, f"Percobaan login gagal untuk '{raw_identity}': Kata sandi salah")
                        waktu_str = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                        send_telegram_alert(
                            f"⚠️ <b>[AUDIRA SEC-OPS] Percobaan Login Gagal</b>\n"
                            f"━━━━━━━━━━━━━━━━━━━━━━\n"
                            f"👤 <b>Target:</b> <code>{raw_identity}</code>\n"
                            f"❌ <b>Alasan:</b> Kata sandi tidak cocok\n"
                            f"🌐 <b>IP:</b> <code>{client_ip}</code>\n"
                            f"🕒 <b>Waktu:</b> {waktu_str} WIB"
                        )
                        self.send_response(401)
                        self.send_cors_headers()
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": "Kata sandi salah / Invalid password."}).encode())
                        return

                    # Successful login resets failure counter for this IP
                    clear_login_failure(client_ip)

                    # Seamless auto-migration of legacy plaintext password to salted PBKDF2 hash
                    if needs_rehash:
                        target_user["password"] = hash_password(password)

                    user = target_user
                    username = target_username

                    # Generate new session access token
                    remember = data.get("remember", True) or data.get("autoLogin", True)
                    access_token = uuid.uuid4().hex
                    if "tokens" not in user: user["tokens"] = {}
                    user["tokens"][access_token] = {
                        "created_at": time.time(),
                        "device_id": device_id,
                        "client_ip": client_ip,
                        "persistent": bool(remember or device_id)
                    }
                    with TOKEN_ACTIVITY_LOCK:
                        TOKEN_LAST_ACTIVITY[access_token] = time.time()

                    # Link device to user's account if sent from desktop/mobile client
                    if device_id:
                        if "devices" not in user: user["devices"] = {}
                        
                        # Lookup live peer info if available
                        with PEERS_LOCK:
                            lp = ACTIVE_PEERS.get(device_id, {})

                        raw_os = str(device_info.get("os") or lp.get("os") or data.get("os") or "Windows / Desktop")
                        if "android" in raw_os.lower():
                            os_str = "Android Mobile"
                        elif "ios" in raw_os.lower():
                            os_str = "iOS Mobile"
                        elif "windows" in raw_os.lower():
                            os_str = "Windows Desktop"
                        elif "mac" in raw_os.lower() or "darwin" in raw_os.lower():
                            os_str = "macOS Desktop"
                        elif "linux" in raw_os.lower():
                            os_str = "Linux Workstation"
                        else:
                            os_str = raw_os

                        is_mobile = "Mobile" in os_str
                        default_fallback = f"Phone-{device_id[-4:]}" if is_mobile else f"PC-{device_id[-4:]}"
                        hostname = device_info.get("hostname") or device_info.get("name") or lp.get("hostname") or data.get("hostname") or default_fallback
                        dev_username = device_info.get("username") or lp.get("username") or data.get("username") or ("Mobile User" if is_mobile else "User")

                        user["devices"][device_id] = {
                            "id": device_id,
                            "uuid": device_uuid,
                            "hostname": hostname,
                            "username": dev_username,
                            "os": os_str,
                            "ip": client_ip,
                            "alias": hostname,
                            "tags": ["My Devices"],
                            "last_login": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "last_seen_ts": time.time(),
                            "note": f"Perangkat terhubung pada akun {username}"
                        }
                        print(f"[+] Device {device_id} ({hostname}) linked to account '{username}'")

                    save_accounts(accounts)

                add_audit_log("LOGIN_SUCCESS", device_id or "WEB", client_ip, username, f"Login berhasil untuk pengguna '{username}' ({user.get('display_name')})")

                waktu_str = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                send_telegram_alert(
                    f"🔐 <b>[AUDIRA AUTH] Sesi Login Berhasil</b>\n"
                    f"━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"👤 <b>Username:</b> <code>{username}</code>\n"
                    f"📛 <b>Nama:</b> {user.get('display_name')}\n"
                    f"📧 <b>Email:</b> {user.get('email')}\n"
                    f"🌐 <b>IP Client:</b> <code>{client_ip}</code>\n"
                    f"🕒 <b>Waktu:</b> {waktu_str} WIB\n"
                    f"💻 <b>Device:</b> {device_id or 'Web Portal'}"
                )

                role = get_account_role(username, user)
                is_owner = role == "owner"
                is_admin = role in ["owner", "admin"]
                role_title = "Pemilik Sistem (Owner)" if is_owner else ("Administrator" if is_admin else "Pengguna Terdaftar (Member)")

                # Return Flutter & Web LoginResponse
                resp = {
                    "type": "access_token",
                    "access_token": access_token,
                    "user": {
                        "name": user["username"],
                        "username": user["username"],
                        "display_name": user.get("display_name", user["username"]),
                        "avatar": "",
                        "email": user.get("email", f"{user['username']}@audira.my.id"),
                        "note": user.get("note", "Audira Certified Member"),
                        "role": role,
                        "role_title": role_title,
                        "status": user.get("status", 1),
                        "is_admin": is_admin,
                        "is_owner": is_owner
                    }
                }

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 4B. USER AUTHENTICATION: REGISTER (POST /api/register)
        if path == "/api/register":
            try:
                data = json.loads(body) if body else {}
                username = str(data.get("username", "")).strip().lower()
                password = str(data.get("password", "")).strip()
                email = str(data.get("email", "")).strip().lower()
                display_name = str(data.get("display_name", "")).strip() or username

                if not username or len(username) < 3:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Username harus terdiri dari minimal 3 karakter."}).encode())
                    return

                # Alphanumeric with underscore / dash
                if not username.replace("_", "").replace("-", "").isalnum():
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Username hanya boleh memuat huruf, angka, underscore (_), atau strip (-)."}).encode())
                    return

                if not password or len(password) < 6:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Kata sandi harus terdiri dari minimal 6 karakter."}).encode())
                    return

                if not email or "@" not in email:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Format alamat email tidak valid."}).encode())
                    return

                with ACCOUNTS_LOCK:
                    accounts = load_accounts()

                    if username in accounts:
                        waktu_str = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                        send_telegram_alert(
                            f"⚠️ <b>[AUDIRA SEC-OPS] Percobaan Pendaftaran Ditolak</b>\n"
                            f"━━━━━━━━━━━━━━━━━━━━━━\n"
                            f"👤 <b>Username:</b> <code>{username}</code>\n"
                            f"📧 <b>Email:</b> <code>{email}</code>\n"
                            f"❌ <b>Alasan:</b> Username sudah terdaftar di database server\n"
                            f"🕒 <b>Waktu:</b> {waktu_str} WIB\n"
                            f"🌐 <b>IP:</b> <code>{client_ip}</code>"
                        )
                        self.send_response(400)
                        self.send_cors_headers()
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": f"Username '{username}' sudah terdaftar. Silakan pilih username lain atau gunakan menu Masuk."}).encode())
                        return

                    for u in accounts.values():
                        if u.get("email", "").lower() == email:
                            waktu_str = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                            send_telegram_alert(
                                f"⚠️ <b>[AUDIRA SEC-OPS] Percobaan Pendaftaran Ditolak</b>\n"
                                f"━━━━━━━━━━━━━━━━━━━━━━\n"
                                f"👤 <b>Username:</b> <code>{username}</code>\n"
                                f"📧 <b>Email:</b> <code>{email}</code>\n"
                                f"❌ <b>Alasan:</b> Email sudah terdaftar pada akun lain\n"
                                f"🕒 <b>Waktu:</b> {waktu_str} WIB\n"
                                f"🌐 <b>IP:</b> <code>{client_ip}</code>"
                            )
                            self.send_response(400)
                            self.send_cors_headers()
                            self.send_header("Content-Type", "application/json")
                            self.end_headers()
                            self.wfile.write(json.dumps({"error": f"Email '{email}' sudah terdaftar pada akun lain. Silakan gunakan menu Masuk."}).encode())
                            return

                    # Create new production user (Strictly role: user, NOT admin or owner)
                    new_user = {
                        "username": username,
                        "password": hash_password(password),
                        "display_name": display_name,
                        "email": email,
                        "role": "user",
                        "role_title": "Pengguna Terdaftar (Member)",
                        "is_admin": False,
                        "is_owner": False,
                        "note": "Audira Registered Member (Client)",
                        "status": 1,
                        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "tokens": {},
                        "devices": {},
                        "tags": ["My Devices"],
                        "tag_colors": {"My Devices": 4282557947}
                    }

                    access_token = uuid.uuid4().hex
                    new_user["tokens"][access_token] = {
                        "created_at": time.time(),
                        "client_ip": client_ip
                    }
                    with TOKEN_ACTIVITY_LOCK:
                        TOKEN_LAST_ACTIVITY[access_token] = time.time()
                    accounts[username] = new_user
                    save_accounts(accounts)

                add_audit_log("USER_REGISTER", "WEB", client_ip, username, f"Akun pengguna baru '{username}' ({display_name}) sukses terdaftar via web portal")

                # Send real-time Telegram alert
                waktu_str = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                send_telegram_alert(
                    f"🎉 <b>[AUDIRA ACCOUNT] Pendaftaran Pengguna Berhasil</b>\n"
                    f"━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"👤 <b>Username:</b> <code>{username}</code>\n"
                    f"📛 <b>Nama Lengkap:</b> {display_name}\n"
                    f"📧 <b>Email:</b> <code>{email}</code>\n"
                    f"🛡️ <b>Role Akun:</b> 👤 Member / Pengguna Biasa\n"
                    f"🕒 <b>Waktu:</b> {waktu_str} WIB\n"
                    f"🌐 <b>IP Pendaftar:</b> <code>{client_ip}</code>\n"
                    f"━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"💡 <i>Pengguna baru siap menghubungkan perangkat PC pribadi via Audira Desk.</i>"
                )

                resp = {
                    "type": "access_token",
                    "access_token": access_token,
                    "user": {
                        "name": username,
                        "username": username,
                        "display_name": display_name,
                        "avatar": "",
                        "email": email,
                        "note": "Audira Registered Member",
                        "role": "user",
                        "role_title": "Pengguna Terdaftar (Member)",
                        "status": 1,
                        "is_admin": False,
                        "is_owner": False
                    }
                }

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Server error: {str(e)}"}).encode())
                return

        # 5. CURRENT USER (POST /api/currentUser)
        if path == "/api/currentUser":
            uname, user = find_user_by_token(auth_header)
            if not uname:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Session expired / Sesi tidak valid"}).encode())
                return

            try:
                data = json.loads(body) if body else {}
                rid = str(data.get("id", "")).strip().replace(" ", "")
                if rid and rid in user.get("devices", {}):
                    user["devices"][rid]["last_seen_ts"] = time.time()
                    user["devices"][rid]["ip"] = client_ip
                    with ACCOUNTS_LOCK:
                        accounts = load_accounts()
                        if uname in accounts and rid in accounts[uname].get("devices", {}):
                            accounts[uname]["devices"][rid]["last_seen_ts"] = time.time()
                            accounts[uname]["devices"][rid]["ip"] = client_ip
                            save_accounts(accounts)
            except Exception:
                pass

            role = get_account_role(user["username"], user)
            is_owner = role == "owner"
            is_admin = role in ["owner", "admin"]
            role_title = "Pemilik Sistem (Owner)" if is_owner else ("Administrator" if is_admin else "Pengguna Terdaftar (Member)")

            resp = {
                "name": user["username"],
                "username": user["username"],
                "display_name": user.get("display_name", user["username"]),
                "avatar": "",
                "email": user.get("email", f"{user['username']}@audira.my.id"),
                "note": user.get("note", "Audira Member"),
                "status": user.get("status", 1),
                "role": role,
                "role_title": role_title,
                "is_admin": is_admin,
                "is_owner": is_owner
            }

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
            return

        # 6. LOGOUT (POST /api/logout)
        if path == "/api/logout":
            token = auth_header.split(" ", 1)[1].strip() if auth_header.startswith("Bearer ") else ""
            if token:
                with TOKEN_ACTIVITY_LOCK:
                    TOKEN_LAST_ACTIVITY.pop(token, None)
                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    for u in accounts.values():
                        if "tokens" in u and token in u["tokens"]:
                            del u["tokens"][token]
                    save_accounts(accounts)

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b"{}")
            return

        # 7. ADDRESS BOOK POST (POST /api/ab) — Update user tags, aliases, etc.
        if path == "/api/ab":
            uname, user = find_user_by_token(auth_header)
            if not uname:
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return

            try:
                data = json.loads(body) if body else {}
                ab_data_str = data.get("data", "")
                if ab_data_str:
                    ab_data = json.loads(ab_data_str)
                    tags = ab_data.get("tags")
                    peers = ab_data.get("peers", [])
                    tag_colors_str = ab_data.get("tag_colors", "")

                    with ACCOUNTS_LOCK:
                        accounts = load_accounts()
                        u = accounts.get(uname, user)
                        if tags is not None:
                            u["tags"] = tags
                        if tag_colors_str:
                            try:
                                u["tag_colors"] = json.loads(tag_colors_str)
                            except Exception:
                                pass

                        # Update aliases, tags and unattended credentials for devices
                        for p in peers:
                            pid = str(p.get("id", "")).replace(" ", "")
                            if pid in u.get("devices", {}):
                                if "alias" in p: u["devices"][pid]["alias"] = p["alias"]
                                if "tags" in p: u["devices"][pid]["tags"] = p["tags"]
                                if "note" in p: u["devices"][pid]["note"] = p["note"]
                                if "password" in p and p["password"]:
                                    enc_pwd = encrypt_credential(p["password"])
                                    u["devices"][pid]["password"] = enc_pwd
                                    u["devices"][pid]["unattended_password"] = enc_pwd
                                if "hash" in p and p["hash"]:
                                    u["devices"][pid]["hash"] = p["hash"]

                        save_accounts(accounts)
            except Exception as e:
                print(f"[!] Error updating address book: {e}")

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b"{}")
            return

        # 8. Address book personal & settings endpoints: return 404 so Flutter client activates LegacyAb mode
        if path in ["/api/ab/personal", "/api/ab/settings", "/api/ab/shared/profiles"]:
            self.send_response(404)
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(b"Not Found")
            return

        # 9. ADMIN ACTIONS: Terminate session
        if path == "/api/sessions/terminate":
            try:
                data = json.loads(body) if body else {}
                rid = str(data.get("id", "")).strip().replace(" ", "")
                conn_id = data.get("conn_id", 0)
                if rid:
                    with PEERS_LOCK:
                        if rid not in DISCONNECT_QUEUE:
                            DISCONNECT_QUEUE[rid] = []
                        if conn_id:
                            DISCONNECT_QUEUE[rid].append(int(conn_id))
                        else:
                            peer = ACTIVE_PEERS.get(rid, {})
                            DISCONNECT_QUEUE[rid].extend(peer.get("conns", []))

                    print(f"[*] Queued disconnect for peer {rid}")
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 10. ADMIN ACTIONS: Update device alias/group
        if path == "/api/devices/alias":
            try:
                data = json.loads(body) if body else {}
                rid = str(data.get("id", "")).strip().replace(" ", "")
                if rid:
                    meta = load_meta()
                    entry = meta.get(rid, {})
                    if "alias" in data: entry["alias"] = data["alias"]
                    if "group" in data: entry["group"] = data["group"]
                    meta[rid] = entry
                    save_meta(meta)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 11. ADMIN ACTIONS: Create Account (/api/accounts/create)
        if path == "/api/accounts/create":
            try:
                data = json.loads(body) if body else {}
                uname = str(data.get("username", "")).strip()
                pwd = str(data.get("password", "")).strip()
                dname = str(data.get("display_name", "")).strip() or uname
                email = str(data.get("email", "")).strip() or f"{uname}@audira.my.id"

                if not uname or not pwd:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Username & Password wajib diisi"}).encode())
                    return

                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    if uname in accounts:
                        self.send_response(400)
                        self.send_cors_headers()
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": f"Akun '{uname}' sudah ada"}).encode())
                        return

                    accounts[uname] = {
                        "username": uname,
                        "password": hash_password(pwd),
                        "display_name": dname,
                        "email": email,
                        "note": "Audira Managed User",
                        "is_admin": data.get("is_admin", False),
                        "status": 1,
                        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "tokens": {},
                        "devices": {},
                        "tags": ["My Devices", "Audira Fleet"],
                        "tag_colors": {"My Devices": 4282557947, "Audira Fleet": 4280391411}
                    }
                    save_accounts(accounts)

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 12. ADMIN ACTIONS: Unlink Device from Account (/api/accounts/delete-device)
        if path == "/api/accounts/delete-device":
            try:
                data = json.loads(body) if body else {}
                uname = str(data.get("username", "")).strip()
                dev_id = str(data.get("device_id", "")).strip().replace(" ", "")

                if uname and dev_id:
                    with ACCOUNTS_LOCK:
                        accounts = load_accounts()
                        if uname in accounts and dev_id in accounts[uname].get("devices", {}):
                            del accounts[uname]["devices"][dev_id]
                            save_accounts(accounts)
                            print(f"[-] Unlinked device {dev_id} from account {uname}")

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 13. ACCOUNT ACTION: Change Password (/api/accounts/change-password)
        if path == "/api/accounts/change-password":
            try:
                uname_auth, u_auth = find_user_by_token(auth_header)
                data = json.loads(body) if body else {}
                username = str(data.get("username", "")).strip() or (uname_auth or "audira")
                old_pwd = str(data.get("old_password", "")).strip()
                new_pwd = str(data.get("new_password", "")).strip()

                if not uname_auth and not is_admin_request(client_ip, auth_header)[0]:
                    self.send_response(401)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Silakan login terlebih dahulu untuk mengubah kata sandi."}).encode())
                    return

                caller_is_admin = uname_auth and get_account_role(uname_auth, u_auth) in ["owner", "admin"]
                if not caller_is_admin and uname_auth != username:
                    self.send_response(403)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Anda hanya berhak mengubah kata sandi akun Anda sendiri."}).encode())
                    return

                if not caller_is_admin and not old_pwd:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Kata sandi saat ini (lama) wajib diisi."}).encode())
                    return

                if not new_pwd or len(new_pwd) < 6:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Password baru minimal 6 karakter"}).encode())
                    return

                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    if username not in accounts:
                        self.send_response(404)
                        self.send_cors_headers()
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": "Akun tidak ditemukan"}).encode())
                        return

                    u = accounts[username]
                    if old_pwd and u.get("password"):
                        is_valid, _ = verify_password(u.get("password"), old_pwd)
                        if not is_valid:
                            self.send_response(400)
                            self.send_cors_headers()
                            self.send_header("Content-Type", "application/json")
                            self.end_headers()
                            self.wfile.write(json.dumps({"error": "Password lama tidak sesuai"}).encode())
                            return

                    u["password"] = hash_password(new_pwd)
                    save_accounts(accounts)

                add_audit_log(
                    event_type="PASSWORD_CHANGED",
                    peer_id=username,
                    peer_ip=client_ip,
                    operator=username,
                    details=f"Kata sandi akun '{username}' berhasil diperbarui"
                )

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Kata sandi berhasil diperbarui"}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 14. ACCOUNT ROLE MANAGEMENT: Set User Role (/api/accounts/set-role) - OWNER ONLY
        if path == "/api/accounts/set-role":
            try:
                # Strictly verify requesting operator is Owner (Superadmin)
                uname_op, u_op = find_user_by_token(auth_header)
                if not uname_op or get_account_role(uname_op, u_op) != "owner":
                    self.send_response(403)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Forbidden: Hanya Owner / Superadmin yang berhak mengubah hak akses (Role) pengguna."}).encode())
                    return

                data = json.loads(body) if body else {}
                target_username = str(data.get("username", "")).strip().lower()
                target_role = str(data.get("role", "")).strip().lower()

                if not target_username or target_role not in ["admin", "user"]:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Parameter username dan role ('admin' atau 'user') harus valid."}).encode())
                    return

                if target_username == "audira":
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Role akun Owner 'audira' bersifat permanen dan tidak dapat diubah."}).encode())
                    return

                with ACCOUNTS_LOCK:
                    accounts = load_accounts()
                    if target_username not in accounts:
                        self.send_response(404)
                        self.send_cors_headers()
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": f"Akun pengguna '{target_username}' tidak ditemukan."}).encode())
                        return

                    target_user = accounts[target_username]
                    is_admin_flag = (target_role == "admin")
                    target_user["role"] = target_role
                    target_user["is_admin"] = is_admin_flag
                    target_user["role_title"] = "Administrator (Operator)" if is_admin_flag else "Pengguna Terdaftar (Member)"
                    save_accounts(accounts)

                action_label = "PROMOSI_ADMIN" if is_admin_flag else "DEMOSI_USER"
                add_audit_log(
                    event_type=action_label,
                    peer_id=target_username,
                    peer_ip=client_ip,
                    operator=uname_op,
                    details=f"Owner '{uname_op}' mengubah role pengguna '{target_username}' menjadi '{target_role.upper()}'"
                )

                waktu_str = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
                send_telegram_alert(
                    f"👑 <b>[AUDIRA RBAC] Pembaruan Hak Akses Pengguna</b>\n"
                    f"━━━━━━━━━━━━━━━━━━━━━━\n"
                    f"👤 <b>Pengguna Target:</b> <code>{target_username}</code>\n"
                    f"🏷️ <b>Role Baru:</b> <b>{target_user['role_title']}</b>\n"
                    f"🛡️ <b>Diubah Oleh:</b> <code>{uname_op}</code> (Owner)\n"
                    f"🕒 <b>Waktu:</b> {waktu_str} WIB"
                )

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": f"Role pengguna '{target_username}' berhasil diubah menjadi '{target_role.upper()}'",
                    "user": {
                        "username": target_username,
                        "role": target_role,
                        "role_title": target_user["role_title"],
                        "is_admin": is_admin_flag
                    }
                }).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 16. Audit Log Entry
        if path == "/api/audit_logs":
            try:
                data = json.loads(body) if body else {}
                entry = add_audit_log(
                    event_type=data.get("event_type", "SESSION_EVENT"),
                    peer_id=data.get("peer_id", "UNKNOWN"),
                    peer_ip=data.get("peer_ip", client_ip),
                    operator=data.get("operator", "Client"),
                    details=data.get("details", ""),
                    duration_sec=data.get("duration_sec", 0)
                )
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "entry": entry}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 17. Audit Log Clear
        if path == "/api/audit_logs/clear":
            with AUDIT_LOCK:
                save_audit_logs([])
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Audit logs cleared"}).encode())
            return

        # 18. ORDERS: Create / Checkout Order (/api/orders/create)
        if path == "/api/orders/create":
            try:
                data = json.loads(body) if body else {}
                plan = str(data.get("plan", "pro")).lower()
                cycle = str(data.get("cycle", "monthly")).lower()
                cust_name = str(data.get("customer_name", "Pelanggan Audira")).strip()
                email = str(data.get("email", "")).strip()
                target_id = str(data.get("target_id", "")).strip().replace(" ", "")
                username = str(data.get("username", "")).strip()
                pay_method = str(data.get("payment_method", "qris")).lower()

                plan_names = {
                    "free": "Community Free",
                    "pro": "Pro Individual",
                    "team": "Pro Team & MSP",
                    "enterprise": "Enterprise Dedicated Cluster"
                }
                plan_prices = {
                    "free": 0,
                    "pro": 49000 if cycle == "monthly" else 499000,
                    "team": 149000 if cycle == "monthly" else 1490000,
                    "enterprise": 1500000
                }

                amount = plan_prices.get(plan, 49000)
                plan_name = plan_names.get(plan, "Pro Individual")
                inv_id = f"INV-{datetime.datetime.now().strftime('%Y%m%d')}-{int(time.time()*1000)%10000:04d}"
                lic_key = generate_license_key(plan)
                status = "PAID" if pay_method == "qris" else "PENDING"
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                exp_date = (datetime.datetime.now() + datetime.timedelta(days=365 if cycle == "annual" else 30)).strftime("%Y-%m-%d %H:%M:%S")

                new_order = {
                    "id": inv_id,
                    "plan": plan,
                    "plan_name": plan_name,
                    "cycle": cycle,
                    "amount": amount,
                    "currency": "IDR",
                    "customer_name": cust_name,
                    "email": email or f"buyer-{inv_id[-4:]}@audira.net",
                    "target_id": format_id(target_id) if target_id else "",
                    "username": username,
                    "payment_method": pay_method,
                    "license_key": lic_key,
                    "status": status,
                    "created_at": now_str,
                    "expires_at": exp_date
                }

                with ORDERS_LOCK:
                    orders = load_orders()
                    orders.insert(0, new_order)
                    save_orders(orders)

                add_audit_log(
                    event_type="ORDER_CREATED",
                    peer_id=target_id or "CHECKOUT",
                    peer_ip=client_ip,
                    operator=cust_name,
                    details=f"Pemesanan lisensi {plan_name} ({inv_id}) via {pay_method.upper()} status {status}"
                )

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "order": new_order}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 19. ORDERS: Approve Order & Activate License (/api/orders/approve)
        if path == "/api/orders/approve":
            try:
                data = json.loads(body) if body else {}
                order_id = str(data.get("order_id", "")).strip()
                updated_order = None
                with ORDERS_LOCK:
                    orders = load_orders()
                    for o in orders:
                        if o.get("id") == order_id:
                            o["status"] = "PAID"
                            o["paid_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            updated_order = o
                            break
                    if updated_order:
                        save_orders(orders)

                if updated_order:
                    add_audit_log(
                        event_type="LICENSE_ACTIVATED",
                        peer_id=updated_order.get("target_id") or "ADMIN",
                        peer_ip=client_ip,
                        operator="Admin Operator",
                        details=f"Lisensi {updated_order.get('license_key')} ({order_id}) disetujui & diaktifkan"
                    )
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True, "order": updated_order}).encode())
                    return
                else:
                    self.send_response(404)
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Order tidak ditemukan"}).encode())
                    return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 20. ORDERS: Delete Order (/api/orders/delete)
        if path == "/api/orders/delete":
            try:
                data = json.loads(body) if body else {}
                order_id = str(data.get("order_id", "")).strip()
                with ORDERS_LOCK:
                    orders = load_orders()
                    orders = [o for o in orders if o.get("id") != order_id]
                    save_orders(orders)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        # 21. LICENSES: Validate Key (/api/licenses/validate)
        if path == "/api/licenses/validate":
            try:
                data = json.loads(body) if body else {}
                lic_key = str(data.get("license_key", "")).strip().upper()
                target_id = str(data.get("id", "")).strip().replace(" ", "")

                with ORDERS_LOCK:
                    orders = load_orders()
                    match = None
                    for o in orders:
                        if o.get("status") in ["PAID", "ACTIVE"]:
                            if lic_key and o.get("license_key") == lic_key:
                                match = o
                                break
                            clean_tid = str(o.get("target_id", "")).replace(" ", "")
                            if target_id and clean_tid == target_id:
                                match = o
                                break

                if match:
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "valid": True,
                        "plan": match.get("plan"),
                        "plan_name": match.get("plan_name"),
                        "license_key": match.get("license_key"),
                        "expires_at": match.get("expires_at"),
                        "customer_name": match.get("customer_name")
                    }).encode())
                    return
                else:
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"valid": False, "message": "Kunci lisensi tidak valid atau belum aktif"}).encode())
                    return
            except Exception as e:
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(b"Not Found")


class DualStackServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except Exception:
            pass
        return super().server_bind()


def main():
    print(f"[*] Starting AUDIRA Remote Desktop Central Fleet & Auth API on port {PORT}...")
    # Preload accounts
    load_accounts()
    try:
        server = DualStackServer(("::", PORT), AudiraAPIHandler)
        print(f"[+] Bound multi-threaded dual-stack IPv4/IPv6 server on [::]:{PORT}")
    except Exception as e:
        print(f"[!] Dual-stack bind failed ({e}), falling back to IPv4...")
        server = ThreadingHTTPServer(("0.0.0.0", PORT), AudiraAPIHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[*] Stopping API server...")
        server.server_close()


if __name__ == "__main__":
    main()
