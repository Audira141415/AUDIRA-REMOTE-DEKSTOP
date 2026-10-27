import sys
import os
import json
import urllib.request
import re
import difflib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audira_api import DEV_WORKSPACE_DIR

test_file_rel = "test_sample.rs"
test_file_abs = os.path.join(DEV_WORKSPACE_DIR, test_file_rel)

# 1. Setup sample test file
orig_code = "// Audira Desk Test File\npub fn multiply(a: i32, b: i32) -> i32 {\n    a * b\n}\n"
with open(test_file_abs, "w", encoding="utf-8") as f:
    f.write(orig_code)

print(f"[+] Sample file created at: {test_file_abs}")

# 2. Test Ollama DeepSeek-R1 generation
prompt = "Enhance multiply function to return Option<i32> using checked_mul to prevent integer overflow."
ai_prompt = (
    f"You are an expert Rust programmer.\n"
    f"Modify this code in `{test_file_rel}`:\n```rust\n{orig_code}\n```\n"
    f"User Request: {prompt}\n"
    f"Return ONLY the replacement code enclosed inside a single ```rust ... ``` code block."
)

payload = json.dumps({
    "model": "deepseek-r1:8b",
    "prompt": ai_prompt,
    "stream": False
}).encode("utf-8")

req = urllib.request.Request(
    "http://127.0.0.1:11434/api/generate",
    data=payload,
    headers={"Content-Type": "application/json"}
)

print("[*] Calling local Ollama (deepseek-r1:8b) on GPU...")
with urllib.request.urlopen(req, timeout=60) as resp:
    res = json.loads(resp.read().decode("utf-8"))

raw_response = res.get("response", "")
code_blocks = re.findall(r"```(?:rust)?\s*([\s\S]*?)```", raw_response)
new_code = code_blocks[-1].strip() if code_blocks else raw_response.strip()

print("\n--- [GENERATED CODE FROM LOCAL DEEPSEEK-R1] ---")
print(new_code)

# 3. Compute Real Unified Diff
orig_lines = orig_code.splitlines(keepends=True)
new_lines = [l if l.endswith("\n") else l + "\n" for l in new_code.splitlines()]
diff_lines = list(difflib.unified_diff(
    orig_lines,
    new_lines,
    fromfile=f"a/{test_file_rel}",
    tofile=f"b/{test_file_rel}"
))
diff_str = "".join(diff_lines)

print("\n--- [REAL COMPUTED UNIFIED DIFF] ---")
print(diff_str)

# 4. Test Apply Diff to disk
print("\n[*] Testing Apply to Host Filesystem...")
# Backup
import shutil
shutil.copy2(test_file_abs, test_file_abs + ".bak")
with open(test_file_abs, "w", encoding="utf-8") as f:
    f.write(new_code)

with open(test_file_abs, "r", encoding="utf-8") as f:
    applied_content = f.read()

assert "checked_mul" in applied_content
print("[+] File successfully updated on host filesystem with AI code!")

# 5. Test Rollback from .bak
print("[*] Testing Rollback from Backup...")
shutil.copy2(test_file_abs + ".bak", test_file_abs)
os.remove(test_file_abs + ".bak")

with open(test_file_abs, "r", encoding="utf-8") as f:
    restored_content = f.read()

assert restored_content == orig_code
print("[+] Rollback verified! File restored to original state.")

# Clean up
if os.path.exists(test_file_abs):
    os.remove(test_file_abs)

print("\n[RESULT] ALL FUNCTIONAL TESTS PASSED 100%! AI IS ACTIVE, NOT A LOOP/MOCK.")
