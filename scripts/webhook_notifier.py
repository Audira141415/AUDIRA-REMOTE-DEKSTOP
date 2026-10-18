#!/usr/bin/env python3
"""
AUDIRA REMOTE DESKTOP — Security Sentinel Webhook Notifier
Dispatches real-time security alerts and session logs to Telegram and Discord.
Author: Agus Dwi Rianto (AUDIRA) — https://audira.my.id
"""

import os
import sys
import json
import urllib.request
import urllib.error
import argparse
from datetime import datetime

# Default environment or config variables
TELEGRAM_BOT_TOKEN = os.getenv("AUDIRA_TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("AUDIRA_TELEGRAM_CHAT_ID", "")
DISCORD_WEBHOOK_URL = os.getenv("AUDIRA_DISCORD_WEBHOOK_URL", "")


def send_telegram_alert(message: str, token: str = None, chat_id: str = None) -> bool:
    """Send text message alert to Telegram Bot API."""
    t = token or TELEGRAM_BOT_TOKEN
    c = chat_id or TELEGRAM_CHAT_ID

    if not t or not c:
        print("[!] Telegram Bot Token or Chat ID not configured.")
        return False

    url = f"https://api.telegram.org/bot{t}/sendMessage"
    payload = {
        "chat_id": c,
        "text": message,
        "parse_mode": "HTML"
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res = json.loads(response.read().decode())
            if res.get("ok"):
                print("[+] Telegram alert dispatched successfully!")
                return True
            else:
                print(f"[-] Telegram error: {res.get('description')}")
                return False
    except Exception as e:
        print(f"[-] Failed to send Telegram alert: {e}")
        return False


def send_discord_alert(title: str, description: str, fields: list = None, color: int = 4322490, webhook_url: str = None) -> bool:
    """Send structured rich embed alert to Discord Webhook."""
    w = webhook_url or DISCORD_WEBHOOK_URL

    if not w:
        print("[!] Discord Webhook URL not configured.")
        return False

    embed = {
        "title": title,
        "description": description,
        "color": color,
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {
            "text": "AUDIRA Remote Desktop • Security Sentinel"
        }
    }

    if fields:
        embed["fields"] = fields

    payload = {
        "username": "Audira Security Sentinel",
        "avatar_url": "https://audira.my.id/favicon.ico",
        "embeds": [embed]
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        w,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "AudiraSentinel/1.5.0"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in [200, 204]:
                print("[+] Discord webhook dispatched successfully!")
                return True
            else:
                print(f"[-] Discord returned status {response.status}")
                return False
    except Exception as e:
        print(f"[-] Failed to send Discord webhook: {e}")
        return False


def notify_session_started(host: str, remote_id: str, operator: str = "Admin", protocol: str = "UDP P2P"):
    """Notify when a new remote desktop session starts."""
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S WIB")

    # Telegram format
    tg_msg = (
        f"🚨 <b>[AUDIRA DESK ALERT] Sesi Baru Terhubung</b>\n"
        f"• <b>Target Host:</b> {host} (<code>{remote_id}</code>)\n"
        f"• <b>Operator:</b> {operator}\n"
        f"• <b>Protocol:</b> {protocol}\n"
        f"• <b>Waktu:</b> {time_str}\n"
        f"• <b>Relay Node:</b> audira-web-hub (192.168.100.175)"
    )
    send_telegram_alert(tg_msg)

    # Discord format
    dc_fields = [
        {"name": "TARGET HOST", "value": host, "inline": True},
        {"name": "REMOTE ID", "value": remote_id, "inline": True},
        {"name": "PROTOCOL", "value": protocol, "inline": True},
        {"name": "OPERATOR", "value": operator, "inline": True},
        {"name": "TIMESTAMP", "value": time_str, "inline": True},
        {"name": "RELAY CLUSTER", "value": "192.168.100.175 : 21116", "inline": True}
    ]
    send_discord_alert(
        title="🛡️ Remote Desktop Session Initiated",
        description="A verified peer-to-peer session has been established through the AUDIRA rendezvous cluster.",
        fields=dc_fields,
        color=4322490  # Emerald Green
    )


def notify_security_alert(incident_type: str, details: str, client_ip: str = "Unknown"):
    """Notify of security incidents or failed auth attempts."""
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S WIB")

    tg_msg = (
        f"⚠️ <b>[AUDIRA SECURITY INCIDENT] {incident_type}</b>\n"
        f"• <b>Source IP:</b> <code>{client_ip}</code>\n"
        f"• <b>Details:</b> {details}\n"
        f"• <b>Time:</b> {time_str}"
    )
    send_telegram_alert(tg_msg)

    dc_fields = [
        {"name": "INCIDENT TYPE", "value": incident_type, "inline": True},
        {"name": "CLIENT IP", "value": client_ip, "inline": True},
        {"name": "SEVERITY", "value": "HIGH", "inline": True},
        {"name": "DETAILS", "value": details, "inline": False}
    ]
    send_discord_alert(
        title=f"⚠️ Security Alert: {incident_type}",
        description="Audira Security Sentinel detected an anomalous or unauthorized access attempt.",
        fields=dc_fields,
        color=16007990  # Rose Red
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AUDIRA Remote Desktop Webhook Alert Dispatcher")
    parser.add_argument("--telegram", action="store_true", help="Send alert to Telegram")
    parser.add_argument("--discord", action="store_true", help="Send alert to Discord")
    parser.add_argument("--test-all", action="store_true", help="Dispatch test notification to both channels")
    parser.add_argument("--message", type=str, default="[AUDIRA] Test notification from security sentinel.")
    parser.add_argument("--host", type=str, default="eng-cad-workstation-11")
    parser.add_argument("--id", type=str, default="512 884 901")

    args = parser.parse_args()

    if args.test_all or (not args.telegram and not args.discord):
        print("[*] Dispatching test notification to all configured channels...")
        notify_session_started(args.host, args.id, operator="Agus Dwi Rianto (Superadmin)")
    elif args.telegram:
        send_telegram_alert(args.message)
    elif args.discord:
        send_discord_alert("AUDIRA Remote Desktop Sentinel", args.message)
