#!/usr/bin/env python3
"""
AUDIRA Remote Desktop — Central Management & Heartbeat API Server
Runs on port 21114 (RustDesk/Audira HTTP API) and integrates with Admin Console.
Author: Agus Dwi Rianto (AUDIRA) • Audira Studio
"""

import os
import sys
import json
import time
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

# In-memory peer tracking
PEERS_LOCK = threading.Lock()
ACTIVE_PEERS = {}
DISCONNECT_QUEUE = {}
SESSION_HISTORY = []

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

def build_fleet_devices():
    meta = load_meta()
    sqlite_peers = get_sqlite_peers()
    reachable_ips = get_reachable_ips()
    now = time.time()

    merged_devices = {}

    # First fill with SQLite peers
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

    # Then overlay live memory peers
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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health" or path == "/health":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "service": "Audira API", "version": "1.5.0"}).encode())
            return

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
            # Include history
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

        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else ""
        client_ip = self.client_address[0].replace("::ffff:", "")

        # 1. SYSINFO_VER (Client queries if sysinfo changed)
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
                rid = str(data.get("id", "")).strip()
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
                rid = str(data.get("id", "")).strip()
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

        # 4. ADMIN ACTIONS: Terminate session
        if path == "/api/sessions/terminate":
            try:
                data = json.loads(body) if body else {}
                rid = str(data.get("id", "")).strip()
                conn_id = data.get("conn_id", 0)
                if rid:
                    with PEERS_LOCK:
                        if rid not in DISCONNECT_QUEUE:
                            DISCONNECT_QUEUE[rid] = []
                        if conn_id:
                            DISCONNECT_QUEUE[rid].append(int(conn_id))
                        else:
                            # Disconnect all
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

        # 5. ADMIN ACTIONS: Update device alias/group
        if path == "/api/devices/alias":
            try:
                data = json.loads(body) if body else {}
                rid = str(data.get("id", "")).strip()
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

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(b"Not Found")

def main():
    print(f"[*] Starting AUDIRA Remote Desktop Heartbeat & Fleet API on port {PORT}...")
    server = HTTPServer(("0.0.0.0", PORT), AudiraAPIHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[*] Stopping API server...")
        server.server_close()

if __name__ == "__main__":
    main()
