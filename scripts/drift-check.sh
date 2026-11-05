#!/usr/bin/env bash
# Fail if the source skills/ or packaged .claude/skills/ has drifted from skills-lock.json.
# Exit 0 = clean. Exit 1 = drift (added / removed / modified files listed).
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK="$KIT/skills-lock.json"
[ -f "$LOCK" ] || { echo "no skills-lock.json — run scripts/gen-lock.sh"; exit 2; }
python3 - "$KIT" <<'PY'
import hashlib, json, os, sys
kit = sys.argv[1]
lock = json.load(open(os.path.join(kit, "skills-lock.json")))
source_root = os.path.join(kit, "skills")
consumer_root = os.path.join(kit, ".claude", "skills")
root = consumer_root if os.path.isdir(consumer_root) else source_root
if not os.path.isdir(root):
    print("no skills root — expected .claude/skills/ in a consumer fixture or skills/ in source")
    sys.exit(2)
drift = []
for skill, rec in lock["skills"].items():
    base = os.path.join(root, skill)
    if not os.path.isdir(base):
        drift.append(f"REMOVED SKILL  {skill}"); continue
    actual = {}
    for dp, dirs, fns in os.walk(base):
        dirs[:] = [d for d in dirs if d not in {"__pycache__", "_to_delete"}]
        for fn in fns:
            if fn == ".DS_Store" or fn.endswith(".pyc"): continue
            p = os.path.join(dp, fn)
            actual[os.path.relpath(p, base)] = hashlib.sha256(open(p,'rb').read()).hexdigest()
    expected = rec["files"]
    for f in sorted(set(expected) - set(actual)): drift.append(f"REMOVED  {skill}/{f}")
    for f in sorted(set(actual) - set(expected)): drift.append(f"ADDED    {skill}/{f}")
    for f in sorted(set(actual) & set(expected)):
        if actual[f] != expected[f]: drift.append(f"MODIFIED {skill}/{f}")
for skill in sorted(set(os.listdir(root)) - set(lock["skills"])):
    if os.path.isdir(os.path.join(root, skill)): drift.append(f"ADDED SKILL    {skill}")
if drift:
    print(f"DRIFT: {len(drift)} change(s)")
    print("\n".join(drift))
    sys.exit(1)
print(f"CLEAN: {len(lock['skills'])} skills match skills-lock.json")
PY
