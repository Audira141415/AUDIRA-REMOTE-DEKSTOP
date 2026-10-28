#!/usr/bin/env python3
"""
AUDIRA Remote Desktop — Cloudflare Dynamic DNS (DDNS) Dual-Stack (IPv4 + IPv6) Auto-Updater
Automatically updates Cloudflare DNS A and AAAA Records for 'desk.audira.my.id'.
Author: Agus Dwi Rianto (AUDIRA) • Audira Studio
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
try:
    import env_loader
except ImportError:
    pass

ZONE_NAME = os.getenv("CLOUDFLARE_ZONE", "audira.my.id")
RECORD_NAME = os.getenv("CLOUDFLARE_RECORD", "desk.audira.my.id")
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cloudflare_ddns.json")

def get_current_public_ip():
    """Detect current public IPv4 address"""
    endpoints = [
        "https://api.ipify.org",
        "https://ipv4.icanhazip.com",
        "https://v4.ident.me",
        "https://ifconfig.me/ip"
    ]
    for url in endpoints:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "curl/7.68.0"})
            with urllib.request.urlopen(req, timeout=5) as res:
                ip = res.read().decode().strip()
                if ip and len(ip.split(".")) == 4:
                    return ip
        except Exception:
            continue
    return None

def get_current_public_ipv6():
    """Detect current public IPv6 address"""
    endpoints = [
        "https://api64.ipify.org",
        "https://ipv6.icanhazip.com",
        "https://v6.ident.me"
    ]
    for url in endpoints:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "curl/7.68.0"})
            with urllib.request.urlopen(req, timeout=5) as res:
                ip = res.read().decode().strip()
                if ip and ":" in ip:
                    return ip
        except Exception:
            continue
    return None

def cf_api_request(endpoint, token, method="GET", data=None):
    """Perform request to Cloudflare v4 API"""
    url = f"https://api.cloudflare.com/client/v4/{endpoint}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        return {"success": False, "errors": [{"message": f"HTTP {e.code}: {err_msg}"}]}
    except Exception as e:
        return {"success": False, "errors": [{"message": str(e)}]}

def sync_record(token, zone_id, record_type, name, content):
    rec_res = cf_api_request(f"zones/{zone_id}/dns_records?type={record_type}&name={name}", token)
    records = rec_res.get("result", [])

    if records:
        record = records[0]
        rec_id = record["id"]
        old_val = record["content"]
        proxied = record["proxied"]

        if old_val == content and not proxied:
            print(f"[+] {record_type} record '{name}' is already pointing to {content} (DNS Only). No change needed.")
            return True

        payload = {
            "type": record_type,
            "name": name,
            "content": content,
            "ttl": 1,
            "proxied": False
        }
        put_res = cf_api_request(f"zones/{zone_id}/dns_records/{rec_id}", token, method="PUT", data=payload)
        if put_res.get("success"):
            print(f"[+] Successfully updated {record_type} '{name}' -> {content} (DNS Only)!")
            return True
        else:
            print(f"[!] Failed to update {record_type} record: {put_res.get('errors')}")
            return False
    else:
        payload = {
            "type": record_type,
            "name": name,
            "content": content,
            "ttl": 1,
            "proxied": False
        }
        post_res = cf_api_request(f"zones/{zone_id}/dns_records", token, method="POST", data=payload)
        if post_res.get("success"):
            print(f"[+] Successfully created new {record_type} record '{name}' -> {content} (DNS Only)!")
            return True
        else:
            print(f"[!] Failed to create {record_type} record: {post_res.get('errors')}")
            return False

def update_dns_records(token, record_name=RECORD_NAME, zone_name=ZONE_NAME):
    # 1. Get Zone ID
    zone_res = cf_api_request(f"zones?name={zone_name}", token)
    if not zone_res.get("success") or not zone_res.get("result"):
        print(f"[!] Could not find Cloudflare Zone for '{zone_name}': {zone_res.get('errors')}")
        return False
    zone_id = zone_res["result"][0]["id"]

    # 2. Update IPv4 (A record)
    current_ipv4 = get_current_public_ip()
    if current_ipv4:
        print(f"[*] Detected Public IPv4: {current_ipv4}")
        sync_record(token, zone_id, "A", record_name, current_ipv4)
    else:
        print("[!] No IPv4 detected.")

    # 3. Update IPv6 (AAAA record)
    current_ipv6 = get_current_public_ipv6()
    if current_ipv6:
        print(f"[*] Detected Public IPv6: {current_ipv6}")
        sync_record(token, zone_id, "AAAA", record_name, current_ipv6)
    else:
        print("[*] No public IPv6 detected (skipped AAAA record).")

    return True

def main():
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not token and os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r") as f:
                cfg = json.load(f)
                token = cfg.get("api_token")
        except Exception:
            pass

    if not token:
        print("[!] Cloudflare API Token not found in config or env.")
        sys.exit(1)

    update_dns_records(token)

if __name__ == "__main__":
    main()
