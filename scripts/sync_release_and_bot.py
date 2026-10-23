import os
import sys
import time
import paramiko

HOST = "192.168.100.175"
PORT = 22
USER = "audira"
PASS = "Sigma1993"
REMOTE_DIR = "/home/audira/projects/audira-remote-desktop"

def upload_with_progress(sftp, local_path, remote_path):
    size = os.path.getsize(local_path)
    last_print = [0]
    
    def cb(transferred, total):
        pct = (transferred / total) * 100
        mb_trans = transferred / (1024 * 1024)
        mb_tot = total / (1024 * 1024)
        now = time.time()
        if now - last_print[0] > 1.5 or transferred == total:
            last_print[0] = now
            print(f"    --> Uploading: {mb_trans:.1f} MB / {mb_tot:.1f} MB ({pct:.1f}%)")

    print(f"[*] Uploading {os.path.basename(local_path)} ({size / (1024*1024):.2f} MB)...")
    sftp.put(local_path, remote_path, callback=cb)
    print(f"[+] Successfully uploaded to {remote_path}")

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    print("=" * 70)
    print("  AUDIRA REMOTE DESKTOP - SYNC RELEASE EXE & TELEGRAM BOT TO SERVER")
    print("=" * 70)
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"[*] Connecting to {USER}@{HOST}:{PORT}...")
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)
    print("[+] SSH Connected!")
    
    sftp = ssh.open_sftp()
    
    # 1. Ensure remote directories exist
    ssh.exec_command(f"mkdir -p {REMOTE_DIR}/web/dist {REMOTE_DIR}/data")
    time.sleep(1)
    
    # 2. Upload latest release binaries
    local_dist = r"F:\AUDIRA-REMOTE-DEKSTOP\dist"
    local_exe = os.path.join(local_dist, "AudiraDesk-Full-Installer.exe")
    remote_exe = f"{REMOTE_DIR}/web/dist/AudiraDesk-Full-Installer.exe"
    upload_with_progress(sftp, local_exe, remote_exe)
    
    local_cer = os.path.join(local_dist, "AgusDwiR_Audira.cer")
    if os.path.exists(local_cer):
        upload_with_progress(sftp, local_cer, f"{REMOTE_DIR}/web/dist/AgusDwiR_Audira.cer")
        
    local_bat = os.path.join(local_dist, "Trust_Audira_Certificate.bat")
    if os.path.exists(local_bat):
        upload_with_progress(sftp, local_bat, f"{REMOTE_DIR}/web/dist/Trust_Audira_Certificate.bat")
        
    # 3. Upload updated bot script
    local_bot = r"F:\AUDIRA-REMOTE-DEKSTOP\scripts\audira_apps_bot.py"
    remote_bot = f"{REMOTE_DIR}/audira_apps_bot.py"
    upload_with_progress(sftp, local_bot, remote_bot)
    
    # 4. Remove old mtime tracker to force release announcement
    print("[*] Resetting last_build_mtime.txt on server to trigger announcement...")
    ssh.exec_command(f"rm -f {REMOTE_DIR}/data/last_build_mtime.txt")
    
    # 5. Create audira-bot.service unit file
    bot_service = """[Unit]
Description=AUDIRA Apps & Remote Operations Telegram Bot
After=network.target audira-api.service

[Service]
Type=simple
User=audira
WorkingDirectory=/home/audira/projects/audira-remote-desktop
Environment=PYTHONUNBUFFERED=1
ExecStart=/usr/bin/python3 -u /home/audira/projects/audira-remote-desktop/audira_apps_bot.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"""
    with sftp.file('/tmp/audira-bot.service', 'w') as f:
        f.write(bot_service)
    sftp.close()
    
    # 6. Sudo commands to kill loose bot processes, install service, and start it
    def run_sudo(cmd):
        stdin, stdout, stderr = ssh.exec_command(f"echo {PASS} | sudo -S {cmd}")
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        lines = [line for line in (out + err).splitlines() if "password" not in line.lower() and line.strip()]
        if lines:
            print(f"[{cmd}] " + " | ".join(lines[:3]))

    print("[*] Killing legacy loose bot processes...")
    run_sudo("pkill -9 -f audira_apps_bot.py || true")
    time.sleep(1)

    print("[*] Installing & Starting systemd audira-bot.service...")
    run_sudo("cp /tmp/audira-bot.service /etc/systemd/system/audira-bot.service")
    run_sudo("systemctl daemon-reload")
    run_sudo("systemctl enable audira-bot")
    run_sudo("systemctl restart audira-bot")
    time.sleep(2)
    
    # 7. Check service status
    _, stdout, _ = ssh.exec_command("systemctl is-active audira-bot")
    status = stdout.read().decode().strip()
    print(f"\n[+] audira-bot.service status: {status.upper()}")
    
    # 8. Check journalctl logs
    _, stdout, _ = ssh.exec_command("journalctl -u audira-bot -n 8 --no-pager")
    print("\n=== Bot Systemd Logs ===")
    print(stdout.read().decode('utf-8', errors='replace').strip())
    
    # 9. Verify remote web download endpoint
    _, stdout, _ = ssh.exec_command("curl -sI https://desk.audira.my.id/dist/AudiraDesk-Full-Installer.exe | head -n 5")
    print("\n=== Public Download Header ===")
    print(stdout.read().decode('utf-8', errors='replace').strip())
    
    ssh.close()
    print("\n" + "=" * 70)
    print("  SYNC & INTEGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    main()
