import os, sys, glob, socket, subprocess

print("=== DIAGNOSING AUDIRA REMOTE DESKTOP LOCAL ENVIRONMENT ===")

# 1. Log files
log_dirs = [
    os.path.expandvars(r"%APPDATA%\Audira Desk\log"),
    os.path.expandvars(r"%LOCALAPPDATA%\Audira Desk\log"),
    r"C:\Windows\System32\config\systemprofile\AppData\Roaming\Audira Desk\log",
]

for ld in log_dirs:
    if os.path.exists(ld):
        print(f"\n[+] Found log dir: {ld}")
        logs = glob.glob(os.path.join(ld, "*.log"))
        for log in sorted(logs, key=os.path.getmtime, reverse=True)[:5]:
            print(f"  Log file: {os.path.basename(log)} (Size: {os.path.getsize(log)} bytes)")
            try:
                with open(log, "r", encoding="utf-8", errors="ignore") as f:
                    lines = f.readlines()
                    print(f"  --- Last 20 lines of {os.path.basename(log)} ---")
                    for l in lines[-20:]:
                        print("   ", l.strip())
            except Exception as e:
                print("   Error reading log:", e)
    else:
        print(f"[-] Log dir not found: {ld}")

# 2. Check open ports on 192.168.100.175
print("\n=== Testing Connection to AUDIRA Server (192.168.100.175) ===")
ports = [21115, 21116, 21117, 21118, 5050]
for p in ports:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2.0)
    try:
        s.connect(('192.168.100.175', p))
        print(f"  [+] Port {p} is OPEN and REACHABLE")
    except Exception as e:
        print(f"  [-] Port {p} FAILED: {e}")
    finally:
        s.close()
