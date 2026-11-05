#!/usr/bin/env bash
# Validate every skill's SKILL.md frontmatter against the packaging spec.
#
# Why this exists: Claude Code loads skills off the filesystem loosely; the packaging path
# (Skills API / claude.ai upload) validates strictly. So a skill can be green locally, in every
# suite, in the lock and in the mirrors — and be REFUSED at upload. On 2026-09-10 two were:
# ia-review's description was 1,058 characters against a 1,024 cap, and a vendored skill carried a
# top-level `version:` key that is not an allowed property. Both shipped into dist/ twice.
# Nothing in the publish gate could see either, because nothing in the publish gate read
# frontmatter. This is that check.
#
# What it enforces (the spec, as implemented by skill-creator's quick_validate.py):
#   · exactly one packaged SKILL.md per skill  (evals/, __pycache__/, node_modules/ excluded)
#   · frontmatter present and parseable
#   · allowed keys only: name, description, license, allowed-tools, metadata, compatibility
#   · name: kebab-case [a-z0-9-], no leading/trailing/doubled hyphen, <= 64 chars
#   · description: present, non-empty, no angle brackets, <= 1024 chars SERIALISED
#   · compatibility: <= 500 chars
#
# The word SERIALISED is load-bearing. Several skills write the description as a
# folded scalar (`description: >`), which renders 1,058 characters as thirteen short, innocuous
# lines. Measuring source lines instead of the serialised value is how the defect stayed invisible
# for two releases. The parser below folds before it measures, and pass/04 asserts it.
#
#   scripts/check-frontmatter.sh              validate skills/*/
#   scripts/check-frontmatter.sh <dir>        validate one skill directory
#   scripts/check-frontmatter.sh --self-test  run the fixtures in scripts/tests/frontmatter/
#
# Exit codes: 0 = every skill valid, 1 = at least one invalid, 2 = usage/unreadable.
#
# Stdlib only, like validate-tokens.py — no PyYAML. The frontmatter subset in play is small
# (bare, quoted, folded and literal scalars, plus one level of nested mapping) and a dependency
# on a package a consumer may not have is a worse trade than 60 lines of parser with fixtures.

set -uo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

MODE="skills"; TARGET=""
case "${1:-}" in
  --self-test) MODE="selftest";;
  -h|--help)   sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'; exit 0;;
  "")          ;;
  -*)          echo "unknown argument: $1"; exit 2;;
  *)           MODE="one"; TARGET="$1";;
esac

python3 - "$MODE" "$TARGET" "$KIT" <<'PY'
import os, re, sys

MODE, TARGET, KIT = sys.argv[1], sys.argv[2], sys.argv[3]
G, R, Y, B, X = '\033[0;32m', '\033[0;31m', '\033[1;33m', '\033[1m', '\033[0m'

ALLOWED = {'name', 'description', 'license', 'allowed-tools', 'metadata', 'compatibility'}
EXCLUDED_ANY_DEPTH = {'__pycache__', 'node_modules'}
EXCLUDED_AT_ROOT = {'evals'}
MAX_DESC, MAX_NAME, MAX_COMPAT = 1024, 64, 500


def parse_frontmatter(text):
    """Top-level keys of a YAML frontmatter block. Returns (dict, error_or_None).

    Handles the scalar forms that occur in skill frontmatter: bare, single/double quoted,
    folded (>, >-) and literal (|, |-) blocks, and one level of nested mapping. A folded
    block is joined with single spaces, which is what the platform measures.
    """
    if not text.startswith('---'):
        return None, 'no YAML frontmatter (file does not start with ---)'
    m = re.match(r'^---\n(.*?)\n---(?:\n|$)', text, re.S)
    if not m:
        return None, 'frontmatter opened with --- but never closed'
    lines = m.group(1).split('\n')
    out, i = {}, 0
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith('#'):
            i += 1
            continue
        km = re.match(r'^([A-Za-z_][A-Za-z0-9_-]*):[ \t]*(.*)$', line)
        if not km:
            return None, f'cannot parse frontmatter line {i + 1}: {line!r}'
        key, val = km.group(1), km.group(2).strip()
        if val in ('>', '>-', '|', '|-'):
            folded = val.startswith('>')
            block, i = [], i + 1
            while i < len(lines) and (not lines[i].strip() or lines[i].startswith((' ', '\t'))):
                block.append(lines[i].strip())
                i += 1
            out[key] = ' '.join(b for b in block if b) if folded else '\n'.join(block)
            continue
        if val == '':
            nested, i = {}, i + 1
            while i < len(lines) and (not lines[i].strip() or lines[i].startswith((' ', '\t'))):
                nm = re.match(r'^\s+([A-Za-z_][A-Za-z0-9_-]*):[ \t]*(.*)$', lines[i])
                if nm:
                    nested[nm.group(1)] = nm.group(2).strip()
                i += 1
            out[key] = nested
            continue
        if len(val) >= 2 and val[0] == val[-1] and val[0] in '"\'':
            val = val[1:-1]
        out[key] = val
        i += 1
    return out, None


def packaged_skill_mds(root):
    hits = []
    for dp, dns, fns in os.walk(root):
        rel = os.path.relpath(dp, root)
        parts = [] if rel == '.' else rel.split(os.sep)
        if any(p in EXCLUDED_ANY_DEPTH for p in parts):
            continue
        if parts and parts[0] in EXCLUDED_AT_ROOT:
            continue
        if 'SKILL.md' in fns:
            hits.append(os.path.join(dp, 'SKILL.md'))
    return sorted(hits)


def validate(skill_dir):
    """Returns a list of problem strings. Empty means valid."""
    errs = []
    top = os.path.join(skill_dir, 'SKILL.md')
    if not os.path.isfile(top):
        return ['no SKILL.md at the skill root']

    packaged = packaged_skill_mds(skill_dir)
    if len(packaged) > 1:
        extra = [os.path.relpath(p, skill_dir) for p in packaged
                 if os.path.abspath(p) != os.path.abspath(top)]
        errs.append(f'{len(packaged)} packaged SKILL.md files; upload accepts exactly one. '
                    f'Extra: {", ".join(extra)}')

    fm, err = parse_frontmatter(open(top, encoding='utf-8').read())
    if err:
        return errs + [err]

    unexpected = sorted(set(fm) - ALLOWED)
    if unexpected:
        errs.append(f'frontmatter key(s) not allowed: {", ".join(unexpected)}. '
                    f'Allowed: {", ".join(sorted(ALLOWED))}. '
                    f'(A version belongs under `metadata:`.)')

    name = fm.get('name')
    if name is None:
        errs.append('missing `name`')
    elif not isinstance(name, str):
        errs.append('`name` must be a string')
    else:
        name = name.strip()
        if not re.match(r'^[a-z0-9-]+$', name):
            errs.append(f'name {name!r} is not kebab-case (lowercase letters, digits, hyphens)')
        elif name.startswith('-') or name.endswith('-') or '--' in name:
            errs.append(f'name {name!r} cannot start/end with a hyphen or contain "--"')
        if len(name) > MAX_NAME:
            errs.append(f'name is {len(name)} chars; the maximum is {MAX_NAME}')

    desc = fm.get('description')
    if desc is None:
        errs.append('missing `description`')
    elif not isinstance(desc, str):
        errs.append('`description` must be a string')
    else:
        desc = desc.strip()
        if not desc:
            errs.append('`description` is empty')
        if '<' in desc or '>' in desc:
            errs.append('description contains an angle bracket (< or >), which upload rejects. '
                        'Note: a leading `>` on the description line is YAML\'s folded-scalar '
                        'marker, not part of the value — this check reads the parsed value.')
        if len(desc) > MAX_DESC:
            errs.append(f'description is {len(desc)} chars serialised; the maximum is {MAX_DESC} '
                        f'({len(desc) - MAX_DESC} over)')

    compat = fm.get('compatibility')
    if isinstance(compat, str) and len(compat.strip()) > MAX_COMPAT:
        errs.append(f'compatibility is {len(compat.strip())} chars; the maximum is {MAX_COMPAT}')

    return errs


def report(label, errs):
    if errs:
        print(f'  {R}✘{X} {label}')
        for e in errs:
            print(f'      {Y}{e}{X}')
        return 1
    print(f'  {G}✔{X} {label}')
    return 0


if MODE == 'selftest':
    base = os.path.join(KIT, 'scripts', 'tests', 'frontmatter')
    if not os.path.isdir(base):
        print(f'{R}no fixtures at {base}{X}')
        sys.exit(2)
    print(f'{B}Frontmatter gate — self-test{X}')
    bad = 0
    for expect in ('pass', 'fail'):
        d = os.path.join(base, expect)
        for case in sorted(os.listdir(d)):
            cdir = os.path.join(d, case)
            if not os.path.isdir(cdir):
                continue
            errs = validate(cdir)
            got = 'fail' if errs else 'pass'
            if got == expect:
                detail = f' — {errs[0][:72]}' if errs else ''
                print(f'  {G}✔{X} {expect}/{case}{detail}')
            else:
                print(f'  {R}✘{X} {expect}/{case} — expected {expect}, got {got}')
                for e in errs:
                    print(f'      {Y}{e}{X}')
                bad += 1
    print('─' * 40)
    if bad:
        print(f'{R}{B}✘ {bad} fixture(s) behaved unexpectedly.{X}')
        sys.exit(1)
    print(f'{G}{B}✔ frontmatter gate self-test passed.{X}')
    sys.exit(0)

if MODE == 'one':
    sys.exit(1 if report(os.path.basename(os.path.normpath(TARGET)), validate(TARGET)) else 0)

print(f'{B}Frontmatter (packaging spec){X}')
skills_root = os.path.join(KIT, 'skills')
bad = 0
for s in sorted(os.listdir(skills_root)):
    d = os.path.join(skills_root, s)
    if os.path.isdir(d) and os.path.isfile(os.path.join(d, 'SKILL.md')):
        bad += report(s, validate(d))
print('─' * 40)
if bad:
    print(f'{R}{B}✘ {bad} skill(s) would be REFUSED on upload.{X}')
    print('  These pass every other gate. Claude Code\'s filesystem loader is more permissive')
    print('  than the packaging path, so local green proves nothing about publishability.')
    sys.exit(1)
print(f'{G}{B}✔ all skills valid against the packaging spec.{X}')
sys.exit(0)
PY
