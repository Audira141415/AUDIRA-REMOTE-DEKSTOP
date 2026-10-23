import os

config_dirs = [
    os.path.expandvars(r'%APPDATA%\Audira Desk\config'),
    r'C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\config',
    r'C:\ProgramData\Audira Desk\config'
]

SERVER_HOST = 'desk.audira.my.id'
SERVER_PORT = '21116'
DEFAULT_KEY = 'SiWmWlEqQ8xr6zvf59wKFzR4eHN5yABIydqpFouvnb8='

pub_key_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'id_ed25519.pub')
if not os.path.exists(pub_key_path):
    pub_key_path = os.path.join(os.path.dirname(__file__), 'keys', 'id_ed25519.pub')

if os.path.exists(pub_key_path):
    with open(pub_key_path, 'r', encoding='utf-8') as f:
        PUB_KEY = f.read().strip() or DEFAULT_KEY
else:
    PUB_KEY = DEFAULT_KEY

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
    top_level['rendezvous_server'] = f"'{SERVER_HOST}:{SERVER_PORT}'"
    top_level.setdefault('nat_type', '1')
    top_level.setdefault('serial', '0')
    top_level.setdefault('unlock_pin', "''")
    top_level.setdefault('trusted_devices', "''")
    
    options['custom-rendezvous-server'] = f"'{SERVER_HOST}'"
    options['key'] = f"'{PUB_KEY}'"
    options['relay-server'] = f"'{SERVER_HOST}'"
    options['api-server'] = f"'http://{SERVER_HOST}:21114'"
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
