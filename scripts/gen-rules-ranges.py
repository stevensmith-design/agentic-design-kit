#!/usr/bin/env python3
"""Regenerate the line ranges in rules.md's Contents, then re-mirror.

rules.md is ~1,700 lines and is meant to be opened by range rather than read whole — a full read
costs more than the entire intended build path. Markdown anchors are useless to an offset/limit
reader, so the Contents carries `· lines N–M` per entry. Those are facts about the file that any
edit above them invalidates, so this script recomputes them and
`ui-design-principles/tests/run.sh` fails when they drift.

    python3 scripts/gen-rules-ranges.py          # rewrite ranges + re-mirror
    python3 scripts/gen-rules-ranges.py --check  # report drift, write nothing

Run it after ANY edit to rules.md, then `scripts/gen-lock.sh`.
"""
import re, sys, shutil
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
SRC = KIT / 'skills/ui-design-principles/references/rules.md'
MIRROR = KIT / 'skills/ui-design-review/references/rules.md'


def slug(text):
    """GitHub-style anchor slug. Matching on the anchor rather than the link text is what makes
    'Responsive and adaptive layout' resolve to '### Responsive and adaptive layout (web)' —
    the Contents shortens titles, and the anchor is the part that cannot drift silently."""
    s = re.sub(r'[`*_]', '', text.strip().lower())
    s = re.sub(r'[^\w\s-]', '', s)
    return re.sub(r'\s+', '-', s).strip('-')


def spans(lines):
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
    # a duplicated heading (e.g. "Motion" appears as a decision gate and as its own section):
    # the real section is the one with the largest span.
    return {a: sorted(v, key=lambda c: c[1] - c[0], reverse=True)[0] for a, v in by_anchor.items()}


def run(check_only):
    lines = SRC.read_text(encoding='utf-8').split('\n')
    table = spans(lines)
    changed, missing = [], []
    for i, l in enumerate(lines):
        m = re.match(r'^(- \[([^\]]+)\]\(#([^)]+)\).*?)(?:\s+· lines \d+–\d+)?\s*$', l)
        if not m or not l.startswith('- ['):
            continue
        base, anchor = m.group(1).rstrip(), m.group(3)
        key = anchor if anchor in table else slug(m.group(2))
        if key not in table:
            missing.append(m.group(2)); continue
        a, b = table[key]
        new = f"{base}  · lines {a}–{b}"
        if new != l:
            changed.append(m.group(2)); lines[i] = new
    if missing:
        print("  ! no heading matches these Contents entries:", ", ".join(missing))
    if check_only:
        print(f"  {len(changed)} stale range(s)" if changed else "  ranges are current")
        return 1 if (changed or missing) else 0
    SRC.write_text('\n'.join(lines), encoding='utf-8')
    shutil.copyfile(SRC, MIRROR)
    print(f"  rewrote {len(changed)} range(s); re-mirrored to {MIRROR.relative_to(KIT)}")
    return 1 if missing else 0


sys.exit(run('--check' in sys.argv))
