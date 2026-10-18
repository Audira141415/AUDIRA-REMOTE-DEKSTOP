import os

config_dirs = [
    os.path.expandvars(r'%APPDATA%\Audira Desk\config'),
    r'C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config',
    r'C:\ProgramData\Audira Desk\config'
]

SERVER_IP = '192.168.100.175'
SERVER_PORT = '21116'
PUB_KEY = 'SiWmWlEqQ8xr6zvf59wKFzR4eHN5yABIydqpFouvnb8='

def fix_cfg2(file_path):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    lines = []
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    
    # Parse existing options
    in_options = False
    options = {}
    top_level = {}
    
    for l in lines:
        stripped = l.strip()
        if stripped.startswith('[options]'):
            in_options = True
            continue
        elif stripped.startswith('['):
            in_options = False
            continue
        
        if '=' in stripped:
            k, v = stripped.split('=', 1)
            k = k.strip()
            v = v.strip()
            if in_options:
                options[k] = v
            else:
                top_level[k] = v
    
    # Set required values
    top_level['rendezvous_server'] = f"'{SERVER_IP}:{SERVER_PORT}'"
    top_level.setdefault('nat_type', '1')
    top_level.setdefault('serial', '0')
    top_level.setdefault('unlock_pin', "''")
    top_level.setdefault('trusted_devices', "''")
    
    options['custom-rendezvous-server'] = f"'{SERVER_IP}'"
    options['key'] = f"'{PUB_KEY}'"
    options['relay-server'] = f"'{SERVER_IP}'"
    options['api-server'] = f"'http://{SERVER_IP}:5050'"
    options.setdefault('direct-server', "'Y'")
    options.setdefault('allow-lan', "'Y'")
    
    # Reconstruct
    out = []
    for k, v in top_level.items():
        out.append(f"{k} = {v}")
    out.append("")
    out.append("[options]")
    for k, v in options.items():
        out.append(f"{k} = {v}")
    out.append("")
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(out))
        print(f"[+] Fixed config: {file_path}")
    except Exception as e:
        print(f"[-] Could not write {file_path}: {e}")

for cd in config_dirs:
    try:
        cfg2 = os.path.join(cd, 'Audira Desk2.toml')
        fix_cfg2(cfg2)
    except Exception as e:
        print(f"[-] Error processing {cd}: {e}")
