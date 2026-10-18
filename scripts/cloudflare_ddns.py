#!/usr/bin/env python3
"""
AUDIRA Remote Desktop — Cloudflare Dynamic DNS (DDNS) Auto-Updater
Automatically updates Cloudflare DNS A-Record for 'desk.audira.my.id' whenever public IP changes.
Author: Agus Dwi Rianto (AUDIRA) • Audira Studio
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error

# Cloudflare Configuration
ZONE_NAME = "audira.my.id"
RECORD_NAME = "desk.audira.my.id"

# File to store Cloudflare API Token & Record Cache
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cloudflare_ddns.json")

def get_current_public_ip():
    """Detect current public IPv4 address from multiple resilient endpoints"""
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

def update_dns_record(token, record_name=RECORD_NAME, zone_name=ZONE_NAME):
    current_ip = get_current_public_ip()
    if not current_ip:
        print("[!] Failed to detect public IP address.")
        return False

    print(f"[*] Detected Public IPv4: {current_ip}")

    # 1. Get Zone ID
    zone_res = cf_api_request(f"zones?name={zone_name}", token)
    if not zone_res.get("success") or not zone_res.get("result"):
        print(f"[!] Could not find Cloudflare Zone for '{zone_name}': {zone_res.get('errors')}")
        return False
    zone_id = zone_res["result"][0]["id"]

    # 2. Get existing DNS record
    rec_res = cf_api_request(f"zones/{zone_id}/dns_records?type=A&name={record_name}", token)
    records = rec_res.get("result", [])

    if records:
        record = records[0]
        rec_id = record["id"]
        old_ip = record["content"]
        proxied = record["proxied"]

        # Check if already up-to-date and correctly NOT proxied (DNS only)
        if old_ip == current_ip and not proxied:
            print(f"[+] DNS record '{record_name}' is already pointing to {current_ip} (DNS Only). No change needed.")
            return True

        # Update existing record
        payload = {
            "type": "A",
            "name": record_name,
            "content": current_ip,
            "ttl": 1,        # 1 = Auto TTL
            "proxied": False # MANDATORY for RustDesk: Gray cloud / DNS Only
        }
        put_res = cf_api_request(f"zones/{zone_id}/dns_records/{rec_id}", token, method="PUT", data=payload)
        if put_res.get("success"):
            print(f"[+] Successfully updated '{record_name}' -> {current_ip} (DNS Only)!")
            return True
        else:
            print(f"[!] Failed to update DNS record: {put_res.get('errors')}")
            return False
    else:
        # Create new DNS record
        payload = {
            "type": "A",
            "name": record_name,
            "content": current_ip,
            "ttl": 1,
            "proxied": False # DNS Only
        }
        post_res = cf_api_request(f"zones/{zone_id}/dns_records", token, method="POST", data=payload)
        if post_res.get("success"):
            print(f"[+] Successfully created new DNS record '{record_name}' -> {current_ip} (DNS Only)!")
            return True
        else:
            print(f"[!] Failed to create DNS record: {post_res.get('errors')}")
            return False

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
        print("[!] Cloudflare API Token not found.")
        print(f"    Create a token at https://dash.cloudflare.com/profile/api-tokens with 'Zone.DNS - Edit' permission.")
        print(f"    Save it in '{CONFIG_PATH}' as: {{\"api_token\": \"YOUR_TOKEN_HERE\"}}")
        sys.exit(1)

    update_dns_record(token)

if __name__ == "__main__":
    main()
