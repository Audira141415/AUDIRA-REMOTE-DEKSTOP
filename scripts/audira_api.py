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
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 21114
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "db_v2.sqlite3")
META_PATH = os.path.join(DATA_DIR, "devices_meta.json")
ACCOUNTS_PATH = os.path.join(DATA_DIR, "accounts.json")

# In-memory tracking
PEERS_LOCK = threading.Lock()
ACTIVE_PEERS = {}
DISCONNECT_QUEUE = {}
SESSION_HISTORY = []

ACCOUNTS_LOCK = threading.Lock()

def get_default_accounts():
    return {
        "audira": {
            "username": "audira",
            "password": "Sigma1993",
            "display_name": "Agus Dwi Rianto (AUDIRA)",
            "email": "agus@audira.my.id",
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
        temp_path = ACCOUNTS_PATH + ".tmp"
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(accounts, f, indent=2)
        os.replace(temp_path, ACCOUNTS_PATH)
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
    with ACCOUNTS_LOCK:
        accounts = load_accounts()
        for uname, u in accounts.items():
            tokens = u.get("tokens", {})
            if token in tokens:
                return uname, u
    return None, None

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
            "version": "1.5.0",
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
                "version": lp.get("version", "1.5.0"),
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

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        auth_header = self.headers.get("Authorization", "")

        # 1. Health check
        if path == "/api/health" or path == "/health":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "service": "Audira API", "version": "1.5.0"}).encode())
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

                peers_list.append({
                    "id": clean_id,
                    "alias": alias,
                    "username": username,
                    "hostname": hostname,
                    "platform": platform,
                    "tags": d.get("tags", ["My Devices"]),
                    "same_server": True,
                    "online": is_online,
                    "hash": d.get("hash", ""),
                    "password": d.get("password", ""),
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

                    online_count = sum(1 for x in devices_data if x["is_online"])
                    accounts_data.append({
                        "username": uname,
                        "display_name": u.get("display_name", uname),
                        "email": u.get("email", f"{uname}@audira.my.id"),
                        "note": u.get("note", "Audira Member"),
                        "is_admin": u.get("is_admin", False),
                        "status": u.get("status", 1),
                        "created_at": u.get("created_at", ""),
                        "total_devices": len(devices_data),
                        "online_devices": online_count,
                        "devices": devices_data
                    })

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
                "cluster_host": "192.168.100.175",
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
        client_ip = self.client_address[0].replace("::ffff:", "")

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
                            "version": data.get("version", "1.5.0"),
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
            try:
                data = json.loads(body) if body else {}
                username = str(data.get("username", "")).strip()
                password = str(data.get("password", "")).strip()
                device_id = str(data.get("id", "")).strip().replace(" ", "")
                device_uuid = str(data.get("uuid", "")).strip()
                device_info = data.get("deviceInfo", {})

                if not username:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Username tidak boleh kosong"}).encode())
                    return

                with ACCOUNTS_LOCK:
                    accounts = load_accounts()

                    # Authenticate or auto-register account
                    if username in accounts:
                        user = accounts[username]
                        if user.get("password") and user.get("password") != password:
                            self.send_response(400)
                            self.send_cors_headers()
                            self.send_header("Content-Type", "application/json")
                            self.end_headers()
                            self.wfile.write(json.dumps({"error": "Kata sandi salah / Invalid password"}).encode())
                            return
                    else:
                        # Auto-create user account if not existing
                        user = {
                            "username": username,
                            "password": password,
                            "display_name": username,
                            "email": f"{username}@audira.my.id",
                            "note": "Audira Registered Member",
                            "is_admin": False,
                            "status": 1,
                            "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "tokens": {},
                            "devices": {},
                            "tags": ["My Devices", "Audira Fleet"],
                            "tag_colors": {"My Devices": 4282557947, "Audira Fleet": 4280391411}
                        }
                        accounts[username] = user

                    # Generate new session access token
                    access_token = uuid.uuid4().hex
                    if "tokens" not in user: user["tokens"] = {}
                    user["tokens"][access_token] = {
                        "created_at": time.time(),
                        "device_id": device_id
                    }

                    # Link device to user's account
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

                # Return Flutter LoginResponse
                resp = {
                    "type": "access_token",
                    "access_token": access_token,
                    "user": {
                        "name": user["username"],
                        "display_name": user.get("display_name", user["username"]),
                        "avatar": "",
                        "email": user.get("email", f"{user['username']}@audira.my.id"),
                        "note": user.get("note", "Audira Certified Member"),
                        "status": user.get("status", 1),
                        "is_admin": user.get("is_admin", True)
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

            resp = {
                "name": user["username"],
                "display_name": user.get("display_name", user["username"]),
                "avatar": "",
                "email": user.get("email", f"{user['username']}@audira.my.id"),
                "note": user.get("note", "Audira Certified Member"),
                "status": user.get("status", 1),
                "is_admin": user.get("is_admin", True)
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

                        # Update aliases and tags for devices
                        for p in peers:
                            pid = str(p.get("id", "")).replace(" ", "")
                            if pid in u.get("devices", {}):
                                if "alias" in p: u["devices"][pid]["alias"] = p["alias"]
                                if "tags" in p: u["devices"][pid]["tags"] = p["tags"]
                                if "note" in p: u["devices"][pid]["note"] = p["note"]

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
                        "password": pwd,
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

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(b"Not Found")


def main():
    print(f"[*] Starting AUDIRA Remote Desktop Central Fleet & Auth API on port {PORT}...")
    # Preload accounts
    load_accounts()
    server = HTTPServer(("0.0.0.0", PORT), AudiraAPIHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[*] Stopping API server...")
        server.server_close()

if __name__ == "__main__":
    main()
