import urllib.request
import json

def test_full_flow():
    print("=== TEST 1: Login Options ===")
    res = urllib.request.urlopen("http://192.168.100.175:21114/api/login-options")
    print("Status:", res.status, "Options:", res.read().decode())

    print("\n=== TEST 2: Login device 1 (desktop-apcuejo) ===")
    payload1 = {
        "username": "audira",
        "password": "Sigma1993",
        "id": "269819537",
        "uuid": "uuid-pc-1",
        "type": "account",
        "deviceInfo": {"hostname": "desktop-apcuejo", "username": "ASUS", "os": "Windows 11 Pro"}
    }
    req1 = urllib.request.Request(
        "http://192.168.100.175:21114/api/login",
        data=json.dumps(payload1).encode(),
        headers={"Content-Type": "application/json"}
    )
    res1 = urllib.request.urlopen(req1)
    login1 = json.loads(res1.read().decode())
    token1 = login1["access_token"]
    print(f"Token: {token1[:10]}... | User: {login1['user']['name']} ({login1['user']['display_name']})")

    print("\n=== TEST 3: Login device 2 (agusdwir) ===")
    payload2 = {
        "username": "audira",
        "password": "Sigma1993",
        "id": "313015359",
        "uuid": "uuid-pc-2",
        "type": "account",
        "deviceInfo": {"hostname": "agusdwir", "username": "agusd", "os": "Windows 11 Pro"}
    }
    req2 = urllib.request.Request(
        "http://192.168.100.175:21114/api/login",
        data=json.dumps(payload2).encode(),
        headers={"Content-Type": "application/json"}
    )
    res2 = urllib.request.urlopen(req2)
    login2 = json.loads(res2.read().decode())
    print(f"Device 2 successfully logged in to account '{login2['user']['name']}'")

    print("\n=== TEST 4: Fetch Address Book for Account 'audira' ===")
    req_ab = urllib.request.Request(
        "http://192.168.100.175:21114/api/ab",
        headers={"Authorization": f"Bearer {token1}"}
    )
    res_ab = urllib.request.urlopen(req_ab)
    ab_body = json.loads(res_ab.read().decode())
    ab_data = json.loads(ab_body["data"])
    print(f"Total Peers in Address Book: {len(ab_data['peers'])}")
    for p in ab_data["peers"]:
        print(f" - Peer ID: {p['id']} | Alias: {p['alias']} | Hostname: {p['hostname']} | OS: {p['platform']} | Online: {p['online']}")

    print("\n=== TEST 5: Admin API /api/accounts ===")
    res_acc = urllib.request.urlopen("http://192.168.100.175:5050/api/accounts")
    acc_json = json.loads(res_acc.read().decode())
    print(f"Total Accounts in Admin Panel: {acc_json['total_accounts']}")
    for acc in acc_json["accounts"]:
        print(f" - Account: @{acc['username']} ({acc['display_name']}) | Total Devices: {acc['total_devices']} | Online: {acc['online_devices']}")
        for dev in acc["devices"]:
            print(f"     * Device: {dev['id']} ({dev['hostname']}) - Status: {dev['status'].upper()} (IP: {dev['ip']})")

if __name__ == "__main__":
    test_full_flow()
