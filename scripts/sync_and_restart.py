import os
import sys
import shutil
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

user_cfg = os.path.expandvars(r'%APPDATA%\Audira Desk\config\Audira Desk2.toml')
prog_cfg = r'C:\ProgramData\Audira Desk\config\Audira Desk2.toml'
sys_cfg = r'C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config\Audira Desk2.toml'

if os.path.exists(user_cfg):
    with open(user_cfg, 'r', encoding='utf-8') as f:
        content = f.read()
    print("User config content:")
    for line in content.splitlines():
        if any(k in line for k in ['rendezvous', 'relay', 'api', 'key', 'direct']):
            print("  ", line)

    for target in [prog_cfg, sys_cfg]:
        try:
            target_dir = os.path.dirname(target)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir, exist_ok=True)
            shutil.copy2(user_cfg, target)
            print(f"[+] Synced to: {target}")
        except Exception as e:
            print(f"[-] Could not copy to {target}: {e}")

# Restart Windows Service
try:
    subprocess.run(["powershell", "-Command", "Restart-Service 'Audira Desk' -ErrorAction SilentlyContinue"], check=False)
    res = subprocess.run(["powershell", "-Command", "Get-Service 'Audira Desk' | Select-Object Status, Name, DisplayName"], capture_output=True, text=True)
    print("\nService Status:")
    print(res.stdout)
except Exception as e:
    print("Service error:", e)
