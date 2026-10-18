#!/usr/bin/env python3
"""
Comprehensive Audit & End-to-End Simulation Script
Verifies multi-device synchronization across Web, Desktop, and Phone (Mobile) for Audira Desk.
"""

import sys
import json
import urllib.request
import urllib.error

SERVER_HOST = "192.168.100.175"
API_PORT = 21114
WEB_PORT = 5050

API_BASE = f"http://{SERVER_HOST}:{API_PORT}"
WEB_BASE = f"http://{SERVER_HOST}:{WEB_PORT}"

def http_get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status, res.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', errors='replace')

def http_post(url, data_dict=None, headers=None):
    headers = headers or {}
    if "Content-Type" not in headers:
        headers["Content-Type"] = "application/json"
    body = json.dumps(data_dict).encode('utf-8') if data_dict is not None else b""
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status, res.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', errors='replace')

def main():
    print("=" * 70)
    print("AUDIRA DESK: END-TO-END INTEGRATION AUDIT & SIMULATION")
    print(f"Target Nodes: API -> {API_BASE} | WEB -> {WEB_BASE}")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. Web Portal & Proxy Audit
    # -------------------------------------------------------------
    print("\n[STEP 1] Auditing Web Portal & Nginx Reverse Proxy...")
    status, body = http_get(f"{WEB_BASE}/")
    assert status == 200, f"Web index returned {status}"
    assert "Audira DESK" in body or "AUDIRA" in body, "Audira branding missing in index.html"
    print("  [PASS] Web Portal index.html loaded (HTTP 200)")

    status, body = http_get(f"{WEB_BASE}/admin.html")
    assert status == 200, f"Web admin returned {status}"
    print("  [PASS] Fleet Admin Console admin.html loaded (HTTP 200)")

    status, body = http_get(f"{WEB_BASE}/api/health")
    assert status == 200, f"Web proxy /api/health returned {status}"
    health = json.loads(body)
    assert health.get("status") == "ok", "API health check failed"
    print("  [PASS] Reverse Proxy /api/ -> :21114 routing verified")

    # -------------------------------------------------------------
    # 2. Desktop Client Simulation (Windows 11)
    # -------------------------------------------------------------
    print("\n[STEP 2] Simulating Desktop Client Integration (Windows 11 Workstation)...")
    status, body = http_get(f"{API_BASE}/api/login-options")
    assert status == 200, f"Login options returned {status}"
    print("  [PASS] /api/login-options responds cleanly")

    desktop_id = "269819537"
    desktop_login_payload = {
        "username": "audira",
        "password": "Sigma1993",
        "id": desktop_id,
        "uuid": "desktop-uuid-pc-1",
        "type": "account",
        "deviceInfo": {
            "name": "Audira-Workstation-Pro",
            "hostname": "Audira-Workstation-Pro",
            "username": "ASUS",
            "os": "Windows 11 Pro 64-bit"
        }
    }
    status, body = http_post(f"{API_BASE}/api/login", desktop_login_payload)
    assert status == 200, f"Desktop login failed with {status}: {body}"
    desktop_login_data = json.loads(body)
    desktop_token = desktop_login_data["access_token"]
    print(f"  [PASS] Desktop logged in! Token: {desktop_token[:12]}... (User: {desktop_login_data['user']['display_name']})")

    # Desktop Sysinfo & Heartbeat
    status, _ = http_post(f"{API_BASE}/api/sysinfo", {
        "id": desktop_id,
        "hostname": "Audira-Workstation-Pro",
        "username": "ASUS",
        "os": "Windows 11 Pro",
        "version": "1.5.0"
    })
    assert status == 200, f"Desktop sysinfo failed: {status}"
    status, _ = http_post(f"{API_BASE}/api/heartbeat", {
        "id": desktop_id,
        "uuid": "desktop-uuid-pc-1",
        "conns": []
    })
    assert status == 200, f"Desktop heartbeat failed: {status}"
    print("  [PASS] Desktop Sysinfo & Heartbeat registered (online in memory)")

    # Desktop Verify Current User
    status, body = http_post(f"{API_BASE}/api/currentUser", {"id": desktop_id}, headers={"Authorization": f"Bearer {desktop_token}"})
    assert status == 200, f"currentUser returned {status}"
    cur_user = json.loads(body)
    assert cur_user["name"] == "audira", "Unexpected current user"
    print(f"  [PASS] /api/currentUser session verified for '{cur_user['name']}'")

    # -------------------------------------------------------------
    # 3. Phone / Mobile Client Simulation (Android 14)
    # -------------------------------------------------------------
    print("\n[STEP 3] Simulating Mobile Phone Integration (Android 14)...")
    phone_id = "814920158"
    phone_login_payload = {
        "username": "audira",
        "password": "Sigma1993",
        "id": phone_id,
        "uuid": "phone-uuid-mobile-1",
        "type": "account",
        "deviceInfo": {
            "name": "Audira-Phone-S24",
            "hostname": "Audira-Phone-S24",
            "username": "Mobile User",
            "os": "android"
        }
    }
    status, body = http_post(f"{API_BASE}/api/login", phone_login_payload)
    assert status == 200, f"Phone login failed with {status}: {body}"
    phone_login_data = json.loads(body)
    phone_token = phone_login_data["access_token"]
    print(f"  [PASS] Phone logged in to SAME account! Token: {phone_token[:12]}...")

    # Phone Heartbeat
    status, _ = http_post(f"{API_BASE}/api/heartbeat", {
        "id": phone_id,
        "uuid": "phone-uuid-mobile-1",
        "conns": []
    })
    assert status == 200, f"Phone heartbeat failed: {status}"
    print("  [PASS] Phone Heartbeat registered")

    # -------------------------------------------------------------
    # 4. Address Book (AB) Cross-Device Synchronization
    # -------------------------------------------------------------
    print("\n[STEP 4] Verifying Address Book (AB) Cross-Device Sync...")
    # Fetch Phone's AB
    status, body = http_get(f"{API_BASE}/api/ab", headers={"Authorization": f"Bearer {phone_token}"})
    assert status == 200, f"Phone /api/ab failed with {status}"
    phone_ab_resp = json.loads(body)
    phone_ab_data = json.loads(phone_ab_resp["data"])
    phone_peers = phone_ab_data["peers"]
    peer_ids_seen_by_phone = [p["id"] for p in phone_peers]

    print(f"  Phone Address Book has {len(phone_peers)} devices:")
    for p in phone_peers:
        print(f"   -> [{p['platform']}] {p['alias']} (ID: {p['id']}, Online: {p['online']})")

    assert desktop_id in peer_ids_seen_by_phone, "Phone does NOT see Desktop in Address Book!"
    print("  [PASS] Phone can immediately see and connect to Desktop Workstation!")

    # Fetch Desktop's AB
    status, body = http_get(f"{API_BASE}/api/ab", headers={"Authorization": f"Bearer {desktop_token}"})
    assert status == 200, f"Desktop /api/ab failed with {status}"
    desktop_ab_resp = json.loads(body)
    desktop_ab_data = json.loads(desktop_ab_resp["data"])
    desktop_peers = desktop_ab_data["peers"]
    peer_ids_seen_by_desktop = [p["id"] for p in desktop_peers]

    assert phone_id in peer_ids_seen_by_desktop, "Desktop does NOT see Phone in Address Book!"
    print("  [PASS] Desktop can immediately see Mobile Phone in Address Book!")

    # -------------------------------------------------------------
    # 5. Web Admin Multi-Device Inspection
    # -------------------------------------------------------------
    print("\n[STEP 5] Inspecting Web Admin Multi-Device Account Inventory...")
    status, body = http_get(f"{WEB_BASE}/api/accounts")
    assert status == 200, f"Web /api/accounts failed: {status}"
    accounts_resp = json.loads(body)
    assert accounts_resp["success"] is True

    audira_acc = next((a for a in accounts_resp["accounts"] if a["username"] == "audira"), None)
    assert audira_acc is not None, "Account 'audira' not found in admin console!"
    print(f"  Account @{audira_acc['username']}: Total Devices Linked = {audira_acc['total_devices']}, Online = {audira_acc['online_devices']}")

    linked_ids = [d["raw_id"] for d in audira_acc["devices"]]
    assert desktop_id in linked_ids, "Desktop device not listed under account in Admin console!"
    assert phone_id in linked_ids, "Phone device not listed under account in Admin console!"

    for d in audira_acc["devices"]:
        print(f"   * Device: {d['id']} | Host: {d['hostname']} | OS: {d['os']} | Status: {d['status'].upper()} (IP: {d['ip']})")
    print("  [PASS] Web Admin Console displays all linked devices from the unified account!")

    # -------------------------------------------------------------
    # 6. Security and Negative Test Cases
    # -------------------------------------------------------------
    print("\n[STEP 6] Running Security & Edge Case Validation...")
    # Wrong password test
    status, body = http_post(f"{API_BASE}/api/login", {
        "username": "audira",
        "password": "WrongPassword123",
        "id": "111222333",
        "type": "account"
    })
    assert status == 400, f"Expected 400 for bad password, got {status}"
    print("  [PASS] Incorrect password correctly rejected (HTTP 400)")

    # Invalid token test
    status, _ = http_get(f"{API_BASE}/api/ab", headers={"Authorization": "Bearer bad-token-xyz"})
    assert status == 401, f"Expected 401 for unauthorized token, got {status}"
    print("  [PASS] Unauthorized access correctly blocked (HTTP 401)")

    print("\n" + "=" * 70)
    print("ALL INTEGRATION TESTS PASSED 100%! ZERO ERRORS DETECTED.")
    print("Web, Desktop, and Phone are fully integrated into Audira Desk!")
    print("=" * 70)

if __name__ == "__main__":
    main()
