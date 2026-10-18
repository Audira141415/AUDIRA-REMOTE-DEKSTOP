import os, re

files_to_check = [
    r'flutter/lib/desktop/pages/desktop_setting_page.dart',
    r'flutter/lib/desktop/pages/server_page.dart',
    r'flutter/lib/desktop/pages/install_page.dart',
    r'flutter/lib/desktop/pages/desktop_home_page.dart',
    r'flutter/lib/common.dart',
    r'Cargo.toml',
]

keywords = ['rustdesk', 'purslane', 'pte. ltd', 'pt ', 'copyright', 'github.com/rustdesk', 'rustdesk.com']

for fpath in files_to_check:
    if os.path.exists(fpath):
        print(f"\n=== Checking {fpath} ===")
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            for idx, line in enumerate(f):
                lower = line.lower()
                for kw in keywords:
                    if kw in lower:
                        print(f"  Line {idx+1} [{kw}]: {line.strip()[:120]}")
                        break
