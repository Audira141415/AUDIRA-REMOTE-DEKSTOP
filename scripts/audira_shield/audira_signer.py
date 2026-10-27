#!/usr/bin/env python3
"""
Audira Signature Shield - Master Signer & Management CLI
Created for: Agus Dwi R (Audira)
Purpose: Menghasilkan tanda tangan digital kriptografis permanen yang anti-tamper
         untuk disematkan di SEMUA aplikasi Audira (Web, Desktop, Bot, Server, Mobile).
"""

import os
import sys
import json
import hmac
import hashlib
import base64
from datetime import datetime, timezone

# Kunci Rahasia Utama (Master Secret Key) milik Agus Dwi R
# Kunci ini digunakan untuk menandatangani secara kriptografis semua aplikasi Audira.
DEFAULT_MASTER_SECRET = "AUDIRA_MASTER_SEC_KEY_2026_AGUS_DWI_R_IMMUTABLE_SIGNATURE_9981"
DEFAULT_CREATOR = "Agus Dwi R (Audira)"
DEFAULT_LEGAL = "Hak Cipta Dilindungi Undang-Undang. Hak Kepemilikan Eksklusif Agus Dwi R."

def canonical_bytes(payload: dict) -> bytes:
    """Serialisasi data ke format kanonikal byte yang deterministik (terurut rapi)."""
    # Hanya sertakan field inti tanda tangan untuk verifikasi integritas
    core_keys = ["creator", "owner_id", "app_name", "issued_date", "canary_token"]
    core_data = {k: payload.get(k, "") for k in core_keys}
    sorted_json = json.dumps(core_data, sort_keys=True, separators=(',', ':'))
    return sorted_json.encode('utf-8')

def generate_canary_token(app_name: str, secret: str) -> str:
    """Membuat token canary unik berbasis hash rahasia aplikasi."""
    seed = f"{app_name}:{secret}:CANARY_SAFEGUARD_ORIGIN"
    return hashlib.sha256(seed.encode('utf-8')).hexdigest()[:24]

def sign_application(app_name: str, secret: str = DEFAULT_MASTER_SECRET, custom_fields: dict = None) -> dict:
    """Menandatangani aplikasi dan menghasilkan paket identitas digital anti-tamper."""
    canary = generate_canary_token(app_name, secret)
    issued_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    payload = {
        "creator": DEFAULT_CREATOR,
        "owner_id": "AUDIRA-ORIGIN-AGUS-DWI-R",
        "app_name": app_name,
        "issued_date": issued_date,
        "canary_token": canary,
        "legal_notice": DEFAULT_LEGAL,
    }
    
    if custom_fields:
        payload.update(custom_fields)
        
    data_to_sign = canonical_bytes(payload)
    sig = hmac.new(secret.encode('utf-8'), data_to_sign, hashlib.sha256).hexdigest()
    
    payload["digital_signature"] = sig
    payload["signature_algorithm"] = "HMAC-SHA256-AUD-V1"
    
    # Kemas juga dalam format base64 string tunggal yang siap di-copas langsung ke kode
    compact_token = base64.b64encode(json.dumps(payload).encode('utf-8')).decode('utf-8')
    payload["compact_token"] = compact_token
    
    return payload

def verify_signature(payload: dict, secret: str = DEFAULT_MASTER_SECRET) -> tuple[bool, str]:
    """
    Verifikasi integritas tanda tangan digital.
    Mengembalikan (is_valid, reason).
    """
    if not isinstance(payload, dict):
        return False, "Payload tanda tangan tidak valid."
        
    sig = payload.get("digital_signature")
    if not sig:
        return False, "Field 'digital_signature' tidak ditemukan (Tanda tangan hilang)."
        
    # Pastikan nama pembuat tidak diganti oleh orang lain
    if payload.get("creator") != DEFAULT_CREATOR:
        return False, f"Pembuat telah diubah secara ilegal! Ditemukan: '{payload.get('creator')}'. Seharusnya: '{DEFAULT_CREATOR}'"

    # Periksa HMAC SHA-256
    expected_bytes = canonical_bytes(payload)
    computed_sig = hmac.new(secret.encode('utf-8'), expected_bytes, hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(sig, computed_sig):
        return False, "Tanda tangan digital TIDAK COCOK! Kode/Data telah dimodifikasi atau dibajak."
        
    return True, "Tanda tangan digital VALID dan Asli milik Agus Dwi R (Audira)."

def export_signature_file(output_path: str, payload: dict):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"[+] File tanda tangan tersimpan di: {output_path}")

def print_help():
    print("""
======================================================================
  AUDIRA SIGNATURE SHIELD - CLI GENERATOR
  Pembuat & Pelindung Tanda Tangan Digital Kriptografis
======================================================================
Penggunaan:
  python audira_signer.py generate <Nama-Aplikasi> [output_file.json]
  python audira_signer.py verify <file_signature.json>
  python audira_signer.py print-token <Nama-Aplikasi>

Contoh:
  python audira_signer.py generate AUDIRA-TOPUPGAME audira_signature.json
  python audira_signer.py generate AUDIRA-REMOTE-DEKSTOP audira_signature.json
  python audira_signer.py verify audira_signature.json
======================================================================
""")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        sys.exit(0)
        
    cmd = sys.argv[1].lower()
    
    if cmd == "generate":
        app_name = sys.argv[2] if len(sys.argv) > 2 else "AUDIRA-APP"
        out_file = sys.argv[3] if len(sys.argv) > 3 else "audira_signature.json"
        
        print(f"[*] Menghasilkan tanda tangan digital untuk: '{app_name}'...")
        sig_data = sign_application(app_name)
        export_signature_file(out_file, sig_data)
        
        valid, msg = verify_signature(sig_data)
        print(f"[*] Verifikasi Mandiri: {msg}")
        print("\n--- TOKEN RINGKAS (Bisa dicopy langsung ke variabel kode) ---")
        print(sig_data["compact_token"])
        print("-------------------------------------------------------------\n")
        
    elif cmd == "verify":
        target_file = sys.argv[2] if len(sys.argv) > 2 else "audira_signature.json"
        if not os.path.exists(target_file):
            print(f"[!] File tidak ditemukan: {target_file}")
            sys.exit(1)
            
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        valid, msg = verify_signature(data)
        if valid:
            print(f"[SUKSES] {msg}")
            print(f"Aplikasi : {data.get('app_name')}")
            print(f"Pemilik  : {data.get('creator')}")
            print(f"Tanggal  : {data.get('issued_date')}")
        else:
            print(f"[BAHAYA/PEMALSUAN] {msg}")
            sys.exit(1)
            
    elif cmd == "print-token":
        app_name = sys.argv[2] if len(sys.argv) > 2 else "AUDIRA-APP"
        sig_data = sign_application(app_name)
        print(sig_data["compact_token"])
        
    else:
        print_help()
