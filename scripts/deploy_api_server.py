import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.100.175', port=22, username='audira', password='Sigma1993', timeout=15)
sftp = ssh.open_sftp()

print("[*] Uploading audira_api.py...")
sftp.put(r'f:\AUDIRA-REMOTE-DEKSTOP\scripts\audira_api.py', '/home/audira/projects/audira-remote-desktop/audira_api.py')

print("[*] Uploading web/nginx.conf...")
sftp.put(r'f:\AUDIRA-REMOTE-DEKSTOP\web\nginx.conf', '/home/audira/projects/audira-remote-desktop/web/nginx.conf')

print("[*] Uploading docker-compose.yml...")
sftp.put(r'f:\AUDIRA-REMOTE-DEKSTOP\docker-compose.yml', '/home/audira/projects/audira-remote-desktop/docker-compose.yml')

print("[*] Uploading web/js/app.js and admin.js...")
sftp.put(r'f:\AUDIRA-REMOTE-DEKSTOP\web\js\app.js', '/home/audira/projects/audira-remote-desktop/web/js/app.js')
sftp.put(r'f:\AUDIRA-REMOTE-DEKSTOP\web\js\admin.js', '/home/audira/projects/audira-remote-desktop/web/js/admin.js')

# Write service file to /tmp/audira-api.service
service_unit = """[Unit]
Description=AUDIRA Remote Desktop Fleet & Heartbeat API
After=network.target

[Service]
Type=simple
User=audira
WorkingDirectory=/home/audira/projects/audira-remote-desktop
ExecStart=/usr/bin/python3 /home/audira/projects/audira-remote-desktop/audira_api.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
"""
with sftp.file('/tmp/audira-api.service', 'w') as f:
    f.write(service_unit)

sftp.close()

def run_sudo(cmd):
    full_cmd = f"echo Sigma1993 | sudo -S {cmd}"
    stdin, stdout, stderr = ssh.exec_command(full_cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(f"=== {cmd} ===")
    print("OUT:", out.encode('ascii', errors='replace').decode())
    if err and "password" not in err.lower():
        print("ERR:", err.encode('ascii', errors='replace').decode())

run_sudo("cp /tmp/audira-api.service /etc/systemd/system/audira-api.service")
run_sudo("systemctl daemon-reload")
run_sudo("systemctl enable audira-api")
run_sudo("systemctl restart audira-api")
run_sudo("systemctl status audira-api --no-pager")

# Recreate web container with new nginx reverse proxy
def run_user(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(f"=== {cmd} ===")
    print("OUT:", out)
    if err:
        print("ERR:", err)

run_user("cd /home/audira/projects/audira-remote-desktop && docker compose up -d web")
run_user("curl -s http://127.0.0.1:21114/api/health")
run_user("curl -s http://127.0.0.1:5050/api/health")
run_user("curl -s http://127.0.0.1:5050/api/fleet")

ssh.close()
print("[+] Deployment completed successfully!")
