#!/usr/bin/env bash
# Scan shipped skill content for the patterns agent-trust scanners rate as risky.
#
# Why this exists: on 2026-07-10 ui-ux-pro-max (a skill this kit interoperates with) was rated
# "High Risk" on skills.sh and fixed it in upstream commit 3da52ff — without changing what the skill
# did. What had tripped the rating was *shape*: install commands handed to the agent, coercive
# invocation wording in the description, prompt-shaped text in data files, and a writer whose
# output path could be steered with ../. Every other gate here asks whether the kit works or can be
# uploaded; this one asks whether it reads as safe to the tools that decide if anyone installs it.
# The kit is clean today — the gate exists because any merge or contribution can bring one of
# these in with every suite still green (the 2026-09-10 vendor simulation showed how).
#
# Checks (each fixture in scripts/tests/agent-trust/ isolates exactly one):
#   T1  install or privilege-escalation instructions — sudo, brew/apt/winget/choco install,
#       curl|wget piped to a shell, pip install, npm install -g, npx -y, Invoke-Expression.
#       Agents follow these; the scanner rates them. Ask the user to install instead.
#   T2  override-shaped text — "ignore previous instructions", "system prompt:", "you are now",
#       <system> tags. Legitimate content never needs these, and data that contains them reads as
#       injection. (A plain role line such as "You are the asset agent" in an agent file is fine.)
#   T3  coercive invocation wording in a SKILL.md *description* — "must use this skill",
#       "always active", "mandatory", "regardless of other instructions". Ordinary trigger language
#       ("use whenever the user asks…") is fine; the body is not scanned for T3.
#   T4  runtime download from a literal remote URL in a script — fetch / http(s).get / urlopen /
#       urlretrieve / requests / curl / wget. Localhost is fine, a URL in a comment is fine
#       (comments are stripped first, CLAUDE.md rule 5), a dynamic URL is out of scope. This kit
#       ships no build step and no fetched binaries.
#   STALE  an allowlist row that matches nothing. A vacuous allowlist is how a gate goes quiet.
#
# Allowlist: scripts/agent-trust-allow.tsv — path (relative to skills/) · exact substring of the
# line · reason. It suppresses that one line, never a file or a pattern.
#
#   scripts/check-agent-trust.sh              scan skills/ + docs/CLAUDE-TEMPLATE.md
#   scripts/check-agent-trust.sh --self-test  run the fixtures in scripts/tests/agent-trust/
#
# Exit codes: 0 = clean, 1 = findings, 2 = usage. Stdlib only.

set -uo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="kit"
case "${1:-}" in
  --self-test) MODE="selftest";;
  -h|--help)   sed -n '2,38p' "$0" | sed 's/^# \{0,1\}//'; exit 0;;
  "")          ;;
  *)           echo "unknown argument: $1"; exit 2;;
esac

python3 - "$MODE" "$KIT" <<'PY'
import os, re, sys

MODE, KIT = sys.argv[1], sys.argv[2]
G, R, B, X = '\033[0;32m', '\033[0;31m', '\033[1m', '\033[0m'

TEXT_EXT = {'.md', '.txt', '.toml', '.json', '.yaml', '.yml', '.csv', '.tsv', '.html',
            '.sh', '.py', '.mjs', '.js', '.cjs', '.ts'}
CODE_EXT = {'.sh', '.py', '.mjs', '.js', '.cjs', '.ts'}
SKIP_DIRS = {'node_modules', '__pycache__', '.git'}

T1 = re.compile(r"""(
      \bsudo\s+[a-z]
    | \b(brew|apt|apt-get|yum|dnf|pacman|winget|choco|scoop)\s+install\b
    | \b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba|z|fi)?sh\b
    | \bpip3?\s+install\b
    | \bnpm\s+(i|install)\s+(-g|--global)\b
    | \bnpx\s+(-y|--yes)\b
    | \bInvoke-Expression\b | \biex\s*\(
)""", re.I | re.X)

T2 = re.compile(r"""(
      \b(ignore|disregard|forget)\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier|preceding)\s+(instructions|prompts|messages|rules)
    | ^\s*system\s+prompt\s*:
    | \byou\s+are\s+now\b
    | </?system>
)""", re.I | re.X | re.M)

T3 = re.compile(r"""(
      \b(must|always|shall)\s+(be\s+)?(use|used|invoke|invoked|load|loaded|consult|consulted)\b[^.]{0,30}\bskill\b
    | \balways[\s-]+active\b
    | \bmandatory\b
    | \bregardless\s+of\s+(any\s+|other\s+|the\s+)*(instructions|skills|tools|requests?)\b
    | \b(do\s+not|never)\s+skip\s+this\s+skill\b
)""", re.I | re.X)

LOCAL = r"(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])"
T4 = re.compile(r"""
    (\bfetch\s*\(|\bhttps?\.(get|request)\s*\(|\baxios(\.\w+)?\s*\(|\burlopen\s*\(|\burlretrieve\s*\(
     |\brequests\.(get|post|put|request)\s*\(|\b(curl|wget)\s)
    [^\n]{0,80}?['"`]https?://(?!""" + LOCAL + r""")[^\s'"`]+""", re.X)


def strip_comments(line, ext):
    if ext in ('.py', '.sh'):
        if re.match(r'^\s*#', line):
            return ''
        return re.sub(r'\s#\s.*$', '', line)
    s = re.sub(r'/\*.*?\*/', '', line)
    if re.match(r'^\s*(//|\*)', s):
        return ''
    return re.sub(r'(?<![:\w"\'`])//\s.*$', '', s)


def description_of(text):
    m = re.match(r'^---\n(.*?)\n---', text, re.S)
    if not m:
        return ''
    lines, out, on = m.group(1).split('\n'), [], False
    for ln in lines:
        if re.match(r'^description:', ln):
            on = True
            out.append(re.sub(r'^description:\s*[>|]?-?\s*', '', ln))
        elif on and (ln.startswith((' ', '\t')) or not ln.strip()):
            out.append(ln.strip())
        elif on:
            break
    return ' '.join(x for x in out if x).strip('\'" ')


def load_allow(path):
    rows = []
    if path and os.path.isfile(path):
        for i, ln in enumerate(open(path, encoding='utf-8'), 1):
            if not ln.strip() or ln.startswith('#'):
                continue
            parts = ln.rstrip('\n').split('\t')
            if len(parts) < 3 or not parts[2].strip():
                rows.append({'bad': f'{os.path.basename(path)}:{i}: needs path<TAB>substring<TAB>reason'})
                continue
            rows.append({'path': parts[0], 'sub': parts[1], 'used': False})
    return rows


def scan(root, allow_path, extra_files=()):
    findings = []
    allow = load_allow(allow_path)
    for row in allow:
        if 'bad' in row:
            findings.append(('STALE', row['bad'], ''))
    targets = []
    for dp, dns, fns in os.walk(root):
        dns[:] = sorted(d for d in dns if d not in SKIP_DIRS)
        for fn in sorted(fns):
            targets.append(os.path.join(dp, fn))
    targets += [f for f in extra_files if os.path.isfile(f)]

    def allowed(rel, line):
        hit = False
        for row in allow:
            if 'bad' not in row and row['path'] == rel and row['sub'] in line:
                row['used'] = True
                hit = True
        return hit

    for f in targets:
        ext = os.path.splitext(f)[1].lower()
        if ext not in TEXT_EXT or os.path.basename(f) in ('allow.tsv', 'expect'):
            continue
        rel = os.path.relpath(f, root)
        try:
            text = open(f, encoding='utf-8').read()
        except (UnicodeDecodeError, OSError):
            continue
        if os.path.basename(f) == 'SKILL.md':
            d = description_of(text)
            m = T3.search(d)
            if m and not allowed(rel, m.group(0)):
                findings.append(('T3', f'{rel} description', m.group(0)))
        for n, line in enumerate(text.split('\n'), 1):
            if len(line) > 4000:          # minified bundle line: T4 only, on a bounded window
                probe = [line[i:i + 4000] for i in range(0, len(line), 3800)]
            else:
                probe = [line]
            for chunk in probe:
                for cid, rx, src in (('T1', T1, chunk), ('T2', T2, chunk),
                                     ('T4', T4, strip_comments(chunk, ext) if ext in CODE_EXT else '')):
                    if cid != 'T4' and len(line) > 4000:
                        continue
                    m = rx.search(src)
                    if m and not allowed(rel, line):
                        findings.append((cid, f'{rel}:{n}', m.group(0).strip()[:90]))
    for row in allow:
        if 'bad' not in row and not row['used']:
            findings.append(('STALE', f"allowlist row for {row['path']}", row['sub'][:60]))
    # one finding per (check, location)
    seen, uniq = set(), []
    for f in findings:
        if (f[0], f[1]) not in seen:
            seen.add((f[0], f[1])); uniq.append(f)
    return uniq


if MODE == 'selftest':
    base = os.path.join(KIT, 'scripts', 'tests', 'agent-trust')
    print(f'{B}Agent-trust gate — self-test{X}')
    bad = 0
    for expect in ('pass', 'fail'):
        for case in sorted(os.listdir(os.path.join(base, expect))):
            cdir = os.path.join(base, expect, case)
            if not os.path.isdir(cdir):
                continue
            found = scan(cdir, os.path.join(cdir, 'allow.tsv'))
            ids = {f[0] for f in found}
            if expect == 'pass':
                ok = not found
                want = 'clean'
            else:
                want = open(os.path.join(cdir, 'expect')).read().strip()
                ok = ids == {want}       # exactly the one check this fixture isolates
            detail = f' — {found[0][0]} {found[0][2][:60]}' if found else ''
            if ok:
                print(f'  {G}✔{X} {expect}/{case}{detail}')
            else:
                bad += 1
                print(f'  {R}✘{X} {expect}/{case}: expected {want}, got {sorted(ids) or "clean"}')
                for f in found:
                    print(f'      {f[0]} {f[1]} — {f[2]}')
    print('────────────────────────────────────────')
    if bad:
        print(f'{R}{B}✘ agent-trust self-test: {bad} fixture(s) misbehaved.{X}'); sys.exit(1)
    print(f'{G}{B}✔ agent-trust self-test passed.{X}'); sys.exit(0)

found = scan(os.path.join(KIT, 'skills'), os.path.join(KIT, 'scripts', 'agent-trust-allow.tsv'),
             extra_files=[os.path.join(KIT, 'docs', 'CLAUDE-TEMPLATE.md')])
print(f'{B}Agent-trust gate{X}')
for cid, where, what in found:
    print(f'  {R}✘{X} {cid} {where} — {what}')
print('────────────────────────────────────────')
if found:
    print(f'{R}{B}✘ {len(found)} agent-trust finding(s).{X}'); sys.exit(1)
print(f'{G}{B}✔ no agent-trust findings across skills/.{X}'); sys.exit(0)
PY
