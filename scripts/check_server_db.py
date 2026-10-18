import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.100.175', port=22, username='audira', password='Sigma1993', timeout=15)

def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(f"=== CMD: {cmd} ===")
    print("OUT:", out)
    if err:
        print("ERR:", err)

remote_py = """import sqlite3
try:
    conn = sqlite3.connect("/home/audira/projects/audira-remote-desktop/data/db_v2.sqlite3")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables:", tables)
    for table_name in tables:
        t = table_name[0]
        cursor.execute("PRAGMA table_info(" + t + ");")
        print("Schema for " + t + ":", cursor.fetchall())
        cursor.execute("SELECT * FROM " + t + " LIMIT 10;")
        print("Data for " + t + ":", cursor.fetchall())
    conn.close()
except Exception as e:
    print("Error:", e)
"""

sftp = ssh.open_sftp()
with sftp.file('/tmp/check_db.py', 'w') as f:
    f.write(remote_py)
sftp.close()

run("python3 /tmp/check_db.py")
ssh.close()
