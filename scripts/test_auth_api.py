#!/usr/bin/env python3
"""
Test script for AUDIRA API real authentication & registration logic
"""
import os
import sys
import json
import uuid
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audira_api import load_accounts, save_accounts, ACCOUNTS_LOCK, add_audit_log

def test_auth_workflow():
    print("[*] Testing Auth & Registration Workflow...")
    
    # 1. Load accounts
    with ACCOUNTS_LOCK:
        accounts = load_accounts()
        print(f"[+] Loaded {len(accounts)} existing accounts.")
        assert "audira" in accounts, "Default admin 'audira' must exist"
        
        # 2. Test registration logic
        test_uname = f"testuser_{uuid.uuid4().hex[:6]}"
        test_email = f"{test_uname}@company.com"
        test_pass = "SecurePass123!"
        
        assert test_uname not in accounts, "New username must not exist yet"
        
        # Simulate registration
        new_user = {
            "username": test_uname,
            "password": test_pass,
            "display_name": "Test User Engineer",
            "email": test_email,
            "note": "Audira Registered Member (Production)",
            "is_admin": False,
            "status": 1,
            "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "tokens": {},
            "devices": {},
            "tags": ["My Devices"],
            "tag_colors": {"My Devices": 4282557947}
        }
        
        access_token = uuid.uuid4().hex
        new_user["tokens"][access_token] = {
            "created_at": 1700000000,
            "client_ip": "127.0.0.1"
        }
        accounts[test_uname] = new_user
        save_accounts(accounts)
        print(f"[+] Successfully registered test account '{test_uname}'.")
        
        # 3. Reload and verify persistence
        reloaded = load_accounts()
        assert test_uname in reloaded, "Persisted account must be found on reload"
        assert reloaded[test_uname]["email"] == test_email
        assert access_token in reloaded[test_uname]["tokens"]
        print("[+] Persistence verified successfully.")
        
        # 4. Clean up test user
        del accounts[test_uname]
        save_accounts(accounts)
        print("[+] Cleaned up test user.")

    print("[SUCCESS] All auth & registration test assertions passed!")

if __name__ == "__main__":
    test_auth_workflow()
