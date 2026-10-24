#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AUDIRA REMOTE DESKTOP — Automated Web Portal & 3D Engine Deployment
Deploys updated web files (HTML, CSS, Three.js, 3D Engine) to Production Server
"""

import os
import sys
import time
import paramiko

HOST = "192.168.100.175"
PORT = 22
USER = "audira"
PASS = "Sigma1993"
REMOTE_PROJECT_DIR = "/home/audira/projects/audira-remote-desktop"
LOCAL_WEB_DIR = r"f:\AUDIRA-REMOTE-DEKSTOP\web"

def upload_with_progress(sftp, local_path, remote_path):
    size = os.path.getsize(local_path)
    last_print = [0]
    
    def cb(transferred, total):
        pct = (transferred / total) * 100
        mb_trans = transferred / (1024 * 1024)
        mb_tot = total / (1024 * 1024)
        now = time.time()
        if now - last_print[0] > 1.0 or transferred == total:
            last_print[0] = now
            print(f"    --> {os.path.basename(local_path)}: {mb_trans:.2f} MB / {mb_tot:.2f} MB ({pct:.1f}%)")

    print(f"[*] Uploading {os.path.basename(local_path)} ({size / 1024:.1f} KB)...")
    sftp.put(local_path, remote_path, callback=cb)
    print(f"[+] Synced to {remote_path}")

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    print("=" * 72)
    print("       AUDIRA DESK — WEB PORTAL & 3D ENGINE PRODUCTION DEPLOYMENT")
    print("=" * 72)
    print(f"[*] Target Server : {USER}@{HOST}:{PORT}")
    print(f"[*] Remote Web Dir: {REMOTE_PROJECT_DIR}/web")
    print()

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)
        print("[+] SSH Connection established successfully!")
    except Exception as e:
        print(f"[-] Failed to connect to {HOST}: {e}")
        sys.exit(1)

    # 1. Ensure remote directories exist
    ssh.exec_command(f"mkdir -p {REMOTE_PROJECT_DIR}/web/js {REMOTE_PROJECT_DIR}/web/css {REMOTE_PROJECT_DIR}/web/dist {REMOTE_PROJECT_DIR}/web/images")
    time.sleep(1)

    sftp = ssh.open_sftp()

    # 2. Upload Web Portal Files
    files_to_sync = [
        ("index.html", f"{REMOTE_PROJECT_DIR}/web/index.html"),
        ("admin.html", f"{REMOTE_PROJECT_DIR}/web/admin.html"),
        (r"css\styles.css", f"{REMOTE_PROJECT_DIR}/web/css/styles.css"),
        (r"css\admin.css", f"{REMOTE_PROJECT_DIR}/web/css/admin.css"),
        (r"js\three.min.js", f"{REMOTE_PROJECT_DIR}/web/js/three.min.js"),
        (r"js\hero-3d.js", f"{REMOTE_PROJECT_DIR}/web/js/hero-3d.js"),
        (r"js\audira-glow.js", f"{REMOTE_PROJECT_DIR}/web/js/audira-glow.js"),
        (r"js\app.js", f"{REMOTE_PROJECT_DIR}/web/js/app.js"),
        (r"js\admin.js", f"{REMOTE_PROJECT_DIR}/web/js/admin.js"),
        ("nginx.conf", f"{REMOTE_PROJECT_DIR}/web/nginx.conf"),
    ]

    print("\n[*] Starting SFTP file synchronization...")
    for rel_path, remote_path in files_to_sync:
        local_path = os.path.join(LOCAL_WEB_DIR, rel_path)
        if os.path.exists(local_path):
            upload_with_progress(sftp, local_path, remote_path)
        else:
            print(f"[!] Warning: local file {local_path} not found, skipping.")

    sftp.close()
    print("\n[+] All web assets uploaded successfully!")

    # 3. Reload Nginx / Restart Web Container
    print("\n[*] Reloading Nginx in Docker Compose web container...")
    commands = [
        f"cd {REMOTE_PROJECT_DIR} && docker compose restart web",
        "sleep 2",
        "curl -sI http://127.0.0.1:80/ | head -n 5",
        "curl -sI http://127.0.0.1:80/js/hero-3d.js | head -n 5",
        "curl -sI http://127.0.0.1:80/js/three.min.js | head -n 5",
        f"cd {REMOTE_PROJECT_DIR} && docker compose ps web"
    ]

    full_cmd = " && ".join(commands)
    stdin, stdout, stderr = ssh.exec_command(full_cmd)
    output = stdout.read().decode('utf-8', errors='replace')
    errors = stderr.read().decode('utf-8', errors='replace')

    print("\n--- Server Output ---")
    print(output)
    if errors.strip():
        print("--- Warnings / Notices ---")
        print(errors)

    ssh.close()
    print("\n" + "=" * 72)
    print(" [SUCCESS] AUDIRA Desk Web Portal with 3D Engine Deployed to Server!")
    print(f" Access URL: https://desk.audira.my.id / http://{HOST}:5050")
    print("=" * 72)

if __name__ == "__main__":
    main()
