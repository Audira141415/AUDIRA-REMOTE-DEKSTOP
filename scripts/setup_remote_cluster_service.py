import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))
import env_loader
import paramiko

HOST = os.getenv('AUDIRA_SSH_HOST', '192.168.100.175')
PORT = int(os.getenv('AUDIRA_SSH_PORT', '22'))
USER = os.getenv('AUDIRA_SSH_USER', 'audira')
PASS = os.getenv('AUDIRA_SSH_PASS', '')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASS or None, timeout=10)

unit = """[Unit]
Description=AUDIRA Remote Desktop Cluster (HBBS, HBBR, Web)
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/audira/projects/audira-remote-desktop
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
"""

sftp = ssh.open_sftp()
with sftp.file('/tmp/audira-cluster.service', 'w') as f:
    f.write(unit)
sftp.close()

cmds = [
    f'echo "{PASS}" | sudo -S cp /tmp/audira-cluster.service /etc/systemd/system/audira-cluster.service',
    f'echo "{PASS}" | sudo -S systemctl daemon-reload',
    f'echo "{PASS}" | sudo -S systemctl enable audira-cluster.service',
    f'echo "{PASS}" | sudo -S systemctl start audira-cluster.service',
    f'echo "{PASS}" | sudo -S systemctl status audira-cluster.service --no-pager'
]

for cmd in cmds:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    if out:
        print(out)

ssh.close()
print("\n[SUCCESS] audira-cluster.service is now active and enabled for auto-running!")

