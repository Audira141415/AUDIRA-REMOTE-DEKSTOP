import os
import paramiko
try:
    import env_loader
except ImportError:
    pass

HOST = os.getenv("AUDIRA_SSH_HOST", "192.168.100.175")
PORT = int(os.getenv("AUDIRA_SSH_PORT", "22"))
USER = os.getenv("AUDIRA_SSH_USER", "audira")
PASS = os.getenv("AUDIRA_SSH_PASS", "")
REMOTE_PROJECT_DIR = "/home/audira/projects/audira-remote-desktop"

print(f"[*] Connecting to {USER}@{HOST}:{PORT}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASS or None, timeout=15)
print("[+] SSH connection established successfully!")

# 1. Create directories
commands = [
    f"mkdir -p {REMOTE_PROJECT_DIR}/data",
    f"mkdir -p {REMOTE_PROJECT_DIR}/web/css",
    f"mkdir -p {REMOTE_PROJECT_DIR}/web/js",
    f"mkdir -p {REMOTE_PROJECT_DIR}/web/dist",
    f"ln -sfn {REMOTE_PROJECT_DIR} /home/audira/audira-remote-desktop"
]

for cmd in commands:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    if exit_status != 0:
        print(f"[-] Command failed: {cmd}, Error: {stderr.read().decode()}")
    else:
        print(f"[+] Executed: {cmd}")

# 2. Upload files via SFTP
sftp = ssh.open_sftp()
print("[*] Uploading project files via SFTP...")

local_compose = r"f:\AUDIRA-REMOTE-DEKSTOP\docker-compose.yml"
remote_compose = f"{REMOTE_PROJECT_DIR}/docker-compose.yml"
sftp.put(local_compose, remote_compose)
print(f"[+] Uploaded: {remote_compose}")

files_to_upload = [
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\index.html", f"{REMOTE_PROJECT_DIR}/web/index.html"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\admin.html", f"{REMOTE_PROJECT_DIR}/web/admin.html"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\css\styles.css", f"{REMOTE_PROJECT_DIR}/web/css/styles.css"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\css\admin.css", f"{REMOTE_PROJECT_DIR}/web/css/admin.css"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\js\app.js", f"{REMOTE_PROJECT_DIR}/web/js/app.js"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\js\admin.js", f"{REMOTE_PROJECT_DIR}/web/js/admin.js"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\nginx.conf", f"{REMOTE_PROJECT_DIR}/web/nginx.conf"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\scripts\audira_api.py", f"{REMOTE_PROJECT_DIR}/audira_api.py"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\dist\AudiraDesk-Full-Installer.exe", f"{REMOTE_PROJECT_DIR}/web/dist/AudiraDesk-Full-Installer.exe"),
    (r"f:\AUDIRA-REMOTE-DEKSTOP\web\dist\AudiraDesk-Portable.exe", f"{REMOTE_PROJECT_DIR}/web/dist/AudiraDesk-Portable.exe"),
]

for local_file, remote_file in files_to_upload:
    sftp.put(local_file, remote_file)
    print(f"[+] Uploaded: {remote_file}")

sftp.close()

# 3. Create helper scripts on the server
start_script = f"""#!/bin/bash
cd {REMOTE_PROJECT_DIR}
echo "[*] Menjalankan kluster AUDIRA Remote Desktop (hbbs, hbbr, web)..."
docker compose up -d
docker compose ps
"""

stop_script = f"""#!/bin/bash
cd {REMOTE_PROJECT_DIR}
echo "[*] Menghentikan kluster AUDIRA Remote Desktop..."
docker compose down
"""

ssh.exec_command(f"cat << 'EOF' > {REMOTE_PROJECT_DIR}/start.sh\n{start_script}\nEOF\nchmod +x {REMOTE_PROJECT_DIR}/start.sh")
ssh.exec_command(f"cat << 'EOF' > {REMOTE_PROJECT_DIR}/stop.sh\n{stop_script}\nEOF\nchmod +x {REMOTE_PROJECT_DIR}/stop.sh")
print("[+] Created start.sh and stop.sh helper scripts.")

# 4. Start the stack via docker compose
print("[*] Starting Docker Compose stack on server...")
stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_PROJECT_DIR} && docker compose up -d")
print(stdout.read().decode())
print(stderr.read().decode())

# 5. Check running containers
print("[*] Checking running containers...")
stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_PROJECT_DIR} && docker compose ps")
print(stdout.read().decode())

# 6. Read public key if generated
stdin, stdout, stderr = ssh.exec_command(f"sleep 2 && cat {REMOTE_PROJECT_DIR}/data/id_ed25519.pub || true")
pub_key = stdout.read().decode().strip()
if pub_key:
    print(f"[+] Server Public Key: {pub_key}")
else:
    print("[*] Public key will be generated upon hbbs startup.")

ssh.close()
print("[SUCCESS] All setup completed on audira-web-hub!")
