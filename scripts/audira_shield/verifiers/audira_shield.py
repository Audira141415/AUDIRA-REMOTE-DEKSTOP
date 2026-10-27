#!/usr/bin/env python3
"""
Audira Signature Shield - Python Runtime Verifier & Anti-Tamper Guard
Bisa di-import dan dijalankan langsung di bot, backend, script, atau desktop app Python.
"""

import sys
import json
import hmac
import hashlib
import base64

DEFAULT_SECRET = "AUDIRA_MASTER_SEC_KEY_2026_AGUS_DWI_R_IMMUTABLE_SIGNATURE_9981"
EXPECTED_CREATOR = "Agus Dwi R (Audira)"

class AudiraShield:
    @staticmethod
    def canonical_bytes(payload: dict) -> bytes:
        core_keys = ["creator", "owner_id", "app_name", "issued_date", "canary_token"]
        core_data = {k: payload.get(k, "") for k in core_keys}
        sorted_json = json.dumps(core_data, sort_keys=True, separators=(',', ':'))
        return sorted_json.encode('utf-8')

    @classmethod
    def verify_dict(cls, data: dict, secret: str = DEFAULT_SECRET) -> tuple[bool, str]:
        if not isinstance(data, dict):
            return False, "Payload data tidak valid."
        
        creator = data.get("creator")
        if creator != EXPECTED_CREATOR:
            return False, f"PELANGGARAN HAK CIPTA: Pemilik asli adalah '{EXPECTED_CREATOR}', tetapi terbaca '{creator}'"
            
        sig = data.get("digital_signature")
        if not sig:
            return False, "Tanda tangan digital tidak ditemukan."
            
        expected_bytes = cls.canonical_bytes(data)
        computed_sig = hmac.new(secret.encode('utf-8'), expected_bytes, hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(sig, computed_sig):
            return False, "Tanda tangan digital CACAT/PALSU! Aplikasi telah dimodifikasi secara ilegal."
            
        return True, f"Identitas Sah: {creator} | Aplikasi: {data.get('app_name')}"

    @classmethod
    def verify_token(cls, token_b64: str, secret: str = DEFAULT_SECRET) -> tuple[bool, str, dict]:
        try:
            raw_json = base64.b64decode(token_b64.strip()).decode('utf-8')
            payload = json.loads(raw_json)
            is_valid, msg = cls.verify_dict(payload, secret)
            return is_valid, msg, payload
        except Exception as e:
            return False, f"Gagal membaca token: {str(e)}", {}

    @classmethod
    def enforce(cls, token_or_path: str, app_name: str = None, on_tamper: str = "exit"):
        """
        Penjaga runtime: panggil fungsi ini di awal aplikasi.
        Jika signature tidak valid:
        - 'exit': Matikan aplikasi langsung.
        - 'warn': Cetak peringatan keras di konsol/log.
        """
        payload = {}
        # Cek apakah input berupa path file json atau base64 token
        if token_or_path.endswith(".json"):
            try:
                with open(token_or_path, "r", encoding="utf-8") as f:
                    payload = json.load(f)
                is_valid, msg = cls.verify_dict(payload)
            except Exception as e:
                is_valid, msg = False, f"File signature hilang/rusak: {str(e)}"
        else:
            is_valid, msg, payload = cls.verify_token(token_or_path)

        if is_valid and app_name:
            if payload.get("app_name") != app_name:
                is_valid = False
                msg = f"Ketidaksesuaian nama aplikasi! Terdaftar: {payload.get('app_name')}, Dijalankan pada: {app_name}"

        if not is_valid:
            banner = f"""
========================================================================
[PERINGATAN KERAS / SECURITY SHIELD VIOLATION]
TANDA TANGAN DIGITAL TIDAK VALID ATAU TELAH DIHAPUS / DIMODIFIKASI!
Aplikasi ini adalah Hak Cipta Sah milik: {EXPECTED_CREATOR}
Pesan Error : {msg}
========================================================================
"""
            print(banner, file=sys.stderr)
            if on_tamper == "exit":
                sys.exit(99)
            return False
            
        return True
