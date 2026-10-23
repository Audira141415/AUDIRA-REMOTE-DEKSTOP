import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("192.168.100.175", port=22, username="audira", password="Sigma1993")

test_script = """
import urllib.request
req = urllib.request.Request(
    'https://api.telegram.org/bot8536577910:AAFOwjhdV2TCTgkcLSTGmvslhon7RANJJCM/getMe',
    headers={'User-Agent': 'Mozilla/5.0'}
)
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print("PYTHON USER-AGENT SUCCESS:", response.read().decode())
except Exception as e:
    print("PYTHON ERROR:", e)
"""

import base64
encoded = base64.b64encode(test_script.encode()).decode()
stdin, stdout, stderr = ssh.exec_command(f"python3 -c \"import base64; exec(base64.b64decode('{encoded}').decode())\"")
print(stdout.read().decode())
print(stderr.read().decode())
ssh.close()
