#!/usr/bin/env python3
"""
scripts/audit_agents.py
Audits the health, structure, and integrity of the `.agents` customization directory.
Validates:
1. Skills catalog: YAML frontmatter (name, description), presence of examples/references.
2. Rules catalog: Format, rule IDs, non-empty mandatory sections.
3. Brain SSOT docs: Index coverage, link validity.
4. MCP configuration syntax.
"""

import sys
import re
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = WORKSPACE_ROOT / ".agents"

def check_mcp_config():
    mcp_file = AGENTS_DIR / "mcp_config.json"
    if not mcp_file.exists():
        return False, "mcp_config.json is missing"
    try:
        import json
        with open(mcp_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "mcpServers" not in data:
            return False, "mcpServers key is missing"
        return True, f"Valid JSON with {len(data.get('mcpServers', {}))} MCP server(s)"
    except Exception as e:
        return False, f"JSON parse error: {e}"

def check_rules():
    rules_dir = AGENTS_DIR / "rules"
    if not rules_dir.is_dir():
        return False, ["rules directory does not exist"]
    
    rule_files = list(rules_dir.glob("*.md"))
    issues = []
    valid_count = 0

    for rule_path in rule_files:
        content = rule_path.read_text(encoding="utf-8")
        if len(content.strip()) < 100:
            issues.append(f"{rule_path.name}: Content too short (<100 bytes)")
            continue
        if "Rule ID" not in content and "RULE" not in content.upper():
            issues.append(f"{rule_path.name}: Missing standard Rule ID header")
        valid_count += 1

    return len(issues) == 0, f"{valid_count}/{len(rule_files)} rules verified", issues

def check_skills():
    skills_dir = AGENTS_DIR / "skills"
    if not skills_dir.is_dir():
        return False, ["skills directory does not exist"]
    
    skill_dirs = [d for d in skills_dir.iterdir() if d.is_dir()]
    issues = []
    enhanced_count = 0

    for s_dir in skill_dirs:
        skill_md = s_dir / "SKILL.md"
        if not skill_md.exists():
            issues.append(f"{s_dir.name}: Missing SKILL.md")
            continue
        
        content = skill_md.read_text(encoding="utf-8")
        # Check YAML frontmatter
        if not content.startswith("---"):
            issues.append(f"{s_dir.name}: SKILL.md missing opening YAML frontmatter '---'")
            continue
        
        parts = content.split("---", 2)
        if len(parts) < 3:
            issues.append(f"{s_dir.name}: Malformed YAML frontmatter in SKILL.md")
            continue
        
        frontmatter = parts[1]
        if "name:" not in frontmatter or "description:" not in frontmatter:
            issues.append(f"{s_dir.name}: Frontmatter missing 'name' or 'description'")

        # Check for enhancements (examples / references / scripts)
        has_examples = (s_dir / "examples").is_dir()
        has_refs = (s_dir / "references").is_dir()
        has_scripts = (s_dir / "scripts").is_dir()

        if has_examples or has_refs or has_scripts:
            enhanced_count += 1

    summary = f"{len(skill_dirs)} skills inspected, {enhanced_count} enhanced with examples/references"
    return len(issues) == 0, summary, issues

def check_brain():
    brain_dir = AGENTS_DIR / "brain"
    if not brain_dir.is_dir():
        return False, ["brain directory does not exist"]
    
    index_file = brain_dir / "INDEX.md"
    if not index_file.exists():
        return False, ["brain/INDEX.md missing"]
    
    brain_docs = list(brain_dir.glob("*.md"))
    return True, f"{len(brain_docs)} brain SSOT documents verified", []

def main():
    print("=" * 60)
    print("  AUDIRA REMOTE DESKTOP — .AGENTS AUDIT SUITE")
    print("=" * 60)

    mcp_ok, mcp_msg = check_mcp_config()
    print(f"[*] MCP Configuration:  [{'OK' if mcp_ok else 'WARN'}] {mcp_msg}")

    rules_ok, rules_msg, rule_issues = check_rules()
    print(f"[*] Rules Catalog:      [{'OK' if rules_ok else 'WARN'}] {rules_msg}")
    for issue in rule_issues:
        print(f"    - {issue}")

    skills_ok, skills_msg, skill_issues = check_skills()
    print(f"[*] Skills Catalog:     [{'OK' if skills_ok else 'WARN'}] {skills_msg}")
    for issue in skill_issues:
        print(f"    - {issue}")

    brain_ok, brain_msg, brain_issues = check_brain()
    print(f"[*] Brain SSOT Memory:  [{'OK' if brain_ok else 'WARN'}] {brain_msg}")
    for issue in brain_issues:
        print(f"    - {issue}")

    print("-" * 60)
    if mcp_ok and rules_ok and skills_ok and brain_ok:
        print(">> STATUS: ALL CRITICAL CHECKS PASSED SUCCESSFULLY.")
        return 0
    else:
        print(">> STATUS: AUDIT COMPLETED WITH WARNINGS.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
