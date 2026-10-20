import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.100.175', port=22, username='audira', password='Sigma1993')

test_cmd = """python3 - << 'EOF'
import json, urllib.request

try:
    with open('/home/audira/projects/audira-remote-desktop/data/telegram_apps_config.json') as f:
        cfg = json.load(f)
    token = cfg.get('bot_token')
    chat_id = cfg.get('chat_id')
    thread_id = cfg.get('thread_id')
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": "<b>[AUDIRA HUB] Notifikasi Bot Aktif & Terverifikasi</b>\\nLayanan webhook & live dispatch berjalan normal.",
        "parse_mode": "HTML",
        "message_thread_id": thread_id
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=10) as r:
        print("TELEGRAM API RESPONSE:", r.read().decode())
except Exception as e:
    print("TELEGRAM ERROR:", e)
EOF
"""

stdin, stdout, stderr = ssh.exec_command(test_cmd)
print("OUT:", stdout.read().decode('utf-8', errors='replace').encode('ascii', errors='replace').decode())
print("ERR:", stderr.read().decode('utf-8', errors='replace').encode('ascii', errors='replace').decode())
ssh.close()
