#!/bin/bash
# Workflow-contract guard suite for ui-design-principles.
#
# ui-design-principles governs every build in the kit and had evals but no tests. This suite closes
# it with DETERMINISTIC checks only: the routing contract between quick-rules.md and rules.md.
#
# Deliberately NOT here (see docs/START-HERE-NEXT-SESSION.md → deliberate decisions):
#   · §0's break from the one-pointer-line convention is the fix, not a defect — untested on purpose.
#   · The rules.md byte-mirror is enforced by ui-design-review/tests/check-mirror.sh, invoked below
#     rather than reimplemented.
#   · Anything needing a rendered page or an agent run belongs in evals/evals.json, not here.
#
# Checks:
#   1. Reference integrity — every relative markdown link in the package resolves.
#   2. Routing contract — every decision-point routing row in quick-rules.md names a real rules.md
#      section or a real sibling reference file.
#   3. Pointer contract — every "(→ …)" pointer in quick-rules.md resolves the same way.
#   4. Contents contract — rules.md's own Contents list and its actual headings agree.
#   5. (retired in v2 Phase 5 — rules.md no longer points into a vendored skill)
#   6. Eval definition — evals/evals.json parses, ids unique, named fixtures exist.
#   7. Mirror invariant — delegate to ui-design-review/tests/check-mirror.sh when present.
#
# Section-name resolution is slug-based (case, punctuation and separator insensitive, prefix match)
# because rules.md addresses sub-blocks by short name — "Choosing the canvas" lives inside
# "Surface and elevation", "Japanese/CJK" inside "Platform notes". The check is link integrity,
# not exact-string equality.
#
# Exit codes: 0 = clean, 1 = at least one regression.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$TESTS_DIR/.." && pwd)"
ROOT="$(cd "$SKILL_DIR/.." && pwd)"
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

echo -e "${BOLD}ui-design-principles workflow-contract guard suite${RESET} (skill: $SKILL_DIR)"

python3 - "$SKILL_DIR" "$ROOT" <<'PY'
import json, os, re, sys

SK, ROOT = sys.argv[1], sys.argv[2]
G, R, B, X = '\033[0;32m', '\033[0;31m', '\033[1m', '\033[0m'
fails = []
def ok(msg):  print(f"  {G}✔{X} {msg}")
def bad(msg): fails.append(msg); print(f"  {R}✘ FAIL{X} {msg}")
def read(rel): return open(os.path.join(SK, rel), encoding='utf-8').read()

rules = read('references/rules.md')
quick = read('references/quick-rules.md')

def slug(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

# Addressable anchors in rules.md: headings and bolded sub-block labels, each also indexed by the
# part before an em-dash, a colon, or an opening paren, because that is how they get cited.
anchors = set()
for h in re.findall(r'^#{2,4}\s+(.+?)\s*$', rules, re.M) + re.findall(r'\*\*([^*\n]+)\*\*', rules):
    h = h.strip()
    for variant in (h, re.split(r'\s+[—–]\s+', h)[0], h.split('(')[0], h.split(':')[0]):
        s = slug(variant)
        if s:
            anchors.add(s)

# Sibling references and skills a routing row may legitimately point at instead of a rules.md section.
# Sibling skills a routing row may legitimately point at instead of a rules.md section.
SIBLING_SKILLS = ('ia-review', 'ui-design-system', 'ui-design-review', 'design-refine', 'design-build',
                  'validate-tokens')
# Any reference file that actually exists in this package is a legitimate routing target too —
# resolved from disk rather than a hardcoded list, so adding a reference does not require
# editing this test. (It did once; that friction is the bug this replaces.)
SIBLINGS = SIBLING_SKILLS + tuple(
    f[:-len('.md')] for f in os.listdir(os.path.join(SK, 'references'))
    if f.endswith('.md')
) + tuple(
    f for f in os.listdir(os.path.join(SK, 'references')) if not f.endswith('.md')
)

def resolves(target):
    t = target.strip().strip('*`').strip()
    if not t:
        return True
    if any(sib in t for sib in SIBLINGS):
        return True
    # "A → B": the most specific segment is the one that must resolve.
    seg = [p for p in re.split(r'→|->', t) if p.strip()]
    t = seg[-1] if seg else t
    base = slug(re.split(r'\s+[—–]\s+', t.split('(')[0])[0])
    if not base:
        return True
    return base in anchors or any(a.startswith(base) for a in anchors)

# ── 1. reference integrity ──
print("1. Reference integrity (relative markdown links):")
dangling = []
for dp, dn, fn in os.walk(SK):
    for f in sorted(fn):
        if not f.endswith('.md'):
            continue
        p = os.path.join(dp, f)
        for m in re.finditer(r'\]\(([^)\s]+)\)', open(p, encoding='utf-8').read()):
            t = m.group(1).strip()
            if t.startswith(('http://', 'https://', 'mailto:', '#')):
                continue
            t = t.split('#')[0]
            if t and not os.path.exists(os.path.normpath(os.path.join(dp, t))):
                dangling.append(f"{os.path.relpath(p, SK)} -> {t}")
if dangling:
    for d in sorted(set(dangling)):
        bad(f"dangling link: {d}")
else:
    ok("every relative link resolves.")

# ── 2. routing contract ──
print("2. Routing contract (quick-rules.md decision-point table → rules.md sections):")
rows = re.findall(r'^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$', quick, re.M)
checked = unresolved = 0
for left, right in rows:
    if set(left) <= set('-: ') or slug(left) in ('building', 'buildingâ€¦', slug('Building…')):
        continue
    for target in re.split(r';|\s\+\s', right):
        if not target.strip():
            continue
        checked += 1
        if not resolves(target):
            unresolved += 1
            bad(f"routing row {left.strip('* ')!r} names an unresolvable target: {target.strip()!r}")
if unresolved == 0:
    ok(f"{checked} routing targets across {len(rows)} rows, all resolve.")

# ── 3. pointer contract ──
print("3. Pointer contract (quick-rules.md '(→ …)' pointers → rules.md sections):")
PLACEHOLDERS = {'namedsection'}
ptrs = unresolved = 0
for m in re.finditer(r'\(→\s*([^)]*(?:\([^)]*\))?[^)]*)\)', quick):
    for target in m.group(1).split(';'):
        t = target.strip()
        if not t or slug(t) in PLACEHOLDERS:
            continue
        ptrs += 1
        if not resolves(t):
            unresolved += 1
            bad(f"pointer '(→ {t})' names no rules.md section — renamed or removed?")
if unresolved == 0:
    ok(f"{ptrs} pointers, all resolve.")

# ── 4. contents contract ──
print("4. Contents contract (rules.md Contents ↔ its own headings):")
contents = re.findall(r'^- \[([^\]]+)\]\(#([a-z0-9-]+)\)', rules, re.M)
head_slugs = {slug(h) for h in re.findall(r'^#{2,3}\s+(.+?)\s*$', rules, re.M)}
def listed_ok(name):
    s0 = slug(name)
    return any(h == s0 or h.startswith(s0) for h in head_slugs)
missing = [name for name, _ in contents if not listed_ok(name)]
if missing:
    bad(f"Contents lists entries with no matching heading: {missing}")
# Orphan check covers only the ### sections under '## Design standards' — the block Contents indexes.
tail = rules.split('## Design standards', 1)
standards = {slug(h) for h in re.findall(r'^###\s+(.+?)\s*$', tail[1], re.M)} if len(tail) > 1 else set()
listed = {slug(n) for n, _ in contents}
orphan = sorted(h for h in standards if not any(h == l or h.startswith(l) for l in listed))
if orphan:
    bad(f"Design-standards sections absent from rules.md's own Contents: {orphan}")
if not missing and not orphan:
    ok(f"{len(contents)} Contents entries matched; {len(standards)} design-standards sections all listed.")

# ── 4b. reference reachability — no orphaned references/*.md ──
# The failure mode an extraction introduces: text moves out of SKILL.md into a reference, and the
# pointer that reaches it is later dropped or reworded. The file survives, nothing loads it, and
# every other check stays green.
print("4b. Reference reachability (no orphaned references/*.md):")
corpus = read('SKILL.md')
ref_dir = os.path.join(SK, 'references')
for f in sorted(os.listdir(ref_dir)):
    if f.endswith('.md'):
        corpus += read(os.path.join('references', f))
orphans = []
for f in sorted(os.listdir(ref_dir)):
    if not f.endswith(('.md', '.json')):
        continue
    own = read(os.path.join('references', f)) if f.endswith('.md') else ''
    others = corpus.replace(own, '') if own else corpus
    if f not in others:
        orphans.append(f)
if orphans:
    for o in orphans:
        bad(f"orphaned reference — nothing routes to it: references/{o}")
else:
    ok(f"all {len([f for f in os.listdir(ref_dir)])} references are routed to.")

# ── 6. eval definition ──
print("6. Eval definition:")
before = len(fails)
ev_path = os.path.join(SK, 'evals/evals.json')
if not os.path.exists(ev_path):
    bad("evals/evals.json is missing.")
else:
    try:
        ev = json.load(open(ev_path, encoding='utf-8'))
    except Exception as e:
        ev = None
        bad(f"evals/evals.json does not parse: {e}")
    if ev is not None:
        if ev.get('skill_name') != 'ui-design-principles':
            bad(f"evals.json skill_name is {ev.get('skill_name')!r}.")
        ids = [e['id'] for e in ev.get('evals', [])]
        if len(ids) != len(set(ids)):
            bad(f"duplicate eval ids: {ids}")
        for e in ev.get('evals', []):
            for k in ('id', 'prompt', 'expected_output', 'files', 'expectations'):
                if k not in e:
                    bad(f"eval {e.get('id')} is missing {k!r}.")
            for rel in e.get('files', []):
                if not os.path.exists(os.path.join(SK, rel)):
                    bad(f"eval {e['id']} names a missing fixture: {rel}")
        if len(fails) == before:
            ok(f"{len(ids)} evals, ids unique, every named fixture present.")

print("─" * 40)
sys.exit(1 if fails else 0)
PY
rc=$?

# ── 7. mirror invariant — delegate, do not reimplement ──
echo "7. Mirror invariant (delegated to ui-design-review/tests/check-mirror.sh):"
MIRROR="$ROOT/ui-design-review/tests/check-mirror.sh"
if [ -x "$MIRROR" ] || [ -f "$MIRROR" ]; then
  if bash "$MIRROR" >/dev/null 2>&1; then
    echo -e "  ${GREEN}✔${RESET} rules.md mirror is byte-identical to ui-design-review's copy."
  else
    echo -e "  ${RED}✘ FAIL${RESET} mirror drift — run ui-design-review/tests/check-mirror.sh for the diff."
    rc=1
  fi
else
  echo -e "  ${YELLOW}~ SKIP${RESET} check-mirror.sh not found beside this skill."
fi

# ── P1-3: the Contents line ranges must still match the headings ─────────────
# rules.md is ~1,700 lines and is meant to be opened by range, not read whole (a full read costs
# more than the entire intended build path). Anchors are useless to an offset/limit reader, so the
# Contents carries line ranges — and a line range is a fact about the file that ANY edit above it
# invalidates. Recompute and compare, or the mechanism quietly starts sending readers to the wrong
# section, which is worse than having no ranges at all.
echo "rules.md Contents line ranges (recomputed against the headings):"
if python3 - "$SKILL_DIR/references/rules.md" <<'RANGES'
import re, sys
lines = open(sys.argv[1], encoding='utf-8').read().split('\n')

def slug(text):
    # Match on the ANCHOR, not the link text: the Contents shortens titles (its
    # "Responsive and adaptive layout" points at "### Responsive and adaptive layout (web)"),
    # and the anchor is the half that cannot drift silently. Same rule as
    # scripts/gen-rules-ranges.py — if you change one, change both.
    s = re.sub(r'[`*_]', '', text.strip().lower())
    s = re.sub(r'[^\w\s-]', '', s)
    return re.sub(r'\s+', '-', s).strip('-')

heads = [(i + 1, re.sub(r'^#+\s*', '', l).strip(), len(l) - len(l.lstrip('#')))
         for i, l in enumerate(lines) if re.match(r'^#{2,3} ', l)]
by_anchor = {}
for k, (ln, title, lvl) in enumerate(heads):
    end = len(lines)
    for j in range(k + 1, len(heads)):
        if heads[j][2] <= lvl:
            end = heads[j][0] - 1
            break
    by_anchor.setdefault(slug(title), []).append((ln, end))
# duplicated heading: the real section is the one with the largest span
table = {a: sorted(v, key=lambda c: c[1] - c[0], reverse=True)[0] for a, v in by_anchor.items()}

bad, checked = [], 0
for l in lines:
    m = re.match(r'^- \[([^\]]+)\]\(#([^)]+)\).*?· lines (\d+)–(\d+)\s*$', l)
    if not m:
        continue
    checked += 1
    anchor = m.group(2) if m.group(2) in table else slug(m.group(1))
    a, b = int(m.group(3)), int(m.group(4))
    if anchor not in table:
        bad.append(f"{m.group(1)}: no heading resolves that anchor"); continue
    if (a, b) != table[anchor]:
        bad.append(f"{m.group(1)}: says {a}-{b}, actual {table[anchor][0]}-{table[anchor][1]}")
if not checked:
    print("      no line ranges in Contents — the read-by-range mechanism is gone")
    sys.exit(1)
for e in bad:
    print("      " + e)
sys.exit(1 if bad else 0)
RANGES
then
  echo -e "  ${GREEN}✔${RESET} every Contents line range matches its heading."
else
  echo -e "  ${RED}✘ FAIL${RESET} stale line range(s). Fix: python3 scripts/gen-rules-ranges.py (rewrites and re-mirrors), then scripts/gen-lock.sh."
  rc=1
fi

# ── D6: the validator must be re-run when a new element type adds a token ────
# The Step 1.5 gate runs before the first component — i.e. against a near-empty token graph — while
# component-first token commitment adds tokens for every new element type. Without this line the
# skill can be fully satisfied having validated nothing that actually shipped.
echo "Re-validation loop (the token graph changes after the bootstrap gate):"
if grep -qF "re-run the validator before the next element" "$SKILL_DIR/SKILL.md"; then
  echo -e "  ${GREEN}✔${RESET} re-validation instruction present."
else
  echo -e "  ${RED}✘ FAIL${RESET} the re-validation instruction is gone — a bootstrap PASS would be the only evidence."
  rc=1
fi

echo "────────────────────────────────────────"
if [ "$rc" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✔ ui-design-principles workflow-contract guards passed.${RESET}"; exit 0
else
  echo -e "${RED}${BOLD}✘ workflow-contract regression(s).${RESET}"; exit 1
fi
