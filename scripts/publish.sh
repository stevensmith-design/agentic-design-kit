#!/usr/bin/env bash
# Assemble a distributable copy of the skills for a consumer repo.
#
# Publishing is a GATE, not a copy. Nothing is written until every suite in the tree is green,
# both mirrors are byte-identical, and the lock matches the working files. A kit that ships with
# a red suite teaches its consumer that red is normal, and the whole enforcement argument dies
# there.
#
#   scripts/publish.sh                 → dist/agentic-design-kit-code-<VERSION>/
#   scripts/publish.sh --out <dir>     → that directory (must not already exist)
#   scripts/publish.sh --check         → run the gate only, write nothing
#
# The gate: frontmatter validity (can this be published at all?), agent-trust patterns (will a
# scanner let anyone install it?), then every skill suite, eval
# definitions, the vocabulary, the mirror, and the lock.
#
# Assembly (development checkouts only) builds the internal acceptance package: .claude/skills/,
# its README, the default CLAUDE.md, acceptance tooling, LICENSE/NOTICE, the lock and checks.
# Public release archives are built by scripts/prepare-public-release.py instead.
# What does NOT ship: evidence/, docs/ (internal plans and handoffs), PROVENANCE.md's working
# notes, and this script. A consumer needs the skills and a way to check them, not the record of
# how they were argued about.
#
# Exit codes: 0 = published (or --check passed), 1 = the gate failed, 2 = usage/output error.

set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

OUT=""
CHECK_ONLY=0
TMP_FIXTURE=""
cleanup() { [ -z "$TMP_FIXTURE" ] || rm -rf "$TMP_FIXTURE"; }
trap cleanup EXIT
while [ $# -gt 0 ]; do
  case "$1" in
    --out)   OUT="${2:-}"; shift 2 || { echo "--out needs a directory"; exit 2; };;
    --check) CHECK_ONLY=1; shift;;
    -h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0;;
    *) echo "unknown argument: $1"; exit 2;;
  esac
done

echo -e "${BOLD}publish gate${RESET}  ·  $KIT"
FAILED=0
note_fail() { echo -e "  ${RED}✘${RESET} $1"; FAILED=$((FAILED + 1)); }
note_ok()   { echo -e "  ${GREEN}✔${RESET} $1"; }

# ── 0. frontmatter is valid against the packaging spec ───────────────────────
# First, because it is the only gate that asks whether the artifact can be PUBLISHED at all.
# Every other check below asks whether it works — and on 2026-09-10 two skills passed all of
# them while being refused at upload. Self-test first: a gate whose own fixtures are broken is
# worth less than no gate.
echo "Frontmatter:"
if [ -f "$KIT/scripts/check-frontmatter.sh" ]; then
  if ! out="$(bash "$KIT/scripts/check-frontmatter.sh" --self-test 2>&1)"; then
    note_fail "the frontmatter gate's own fixtures are failing — the gate below cannot be trusted:"
    printf '%s\n' "$out" | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✘' | head -6 | sed 's|^|      |' || true
  fi
  if out="$(bash "$KIT/scripts/check-frontmatter.sh" 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1 | sed 's/\x1b\[[0-9;]*m//g')"
  else
    note_fail "a skill would be REFUSED on upload (Skills API / claude.ai):"
    printf '%s\n' "$out" | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✘|chars|not allowed|kebab|SKILL.md files' | head -8 | sed 's|^|      |' || true
  fi
else
  note_fail "scripts/check-frontmatter.sh missing — publishability is unverified"
fi

# ── 0b. nothing in the shipped content reads as risky to an agent-trust scanner ──
# Same question as step 0 from the other side: not "will the upload accept it" but "will the
# scanners that rate skills let anyone install it". ui-ux-pro-max was rated High Risk on skills.sh
# for install commands, coercive description wording and prompt-shaped data, with its behaviour
# unchanged (upstream 3da52ff, 2026-07-10). Self-test first, as above.
echo "Agent trust:"
if [ -f "$KIT/scripts/check-agent-trust.sh" ]; then
  if ! out="$(bash "$KIT/scripts/check-agent-trust.sh" --self-test 2>&1)"; then
    note_fail "the agent-trust gate's own fixtures are failing — the gate below cannot be trusted:"
    printf '%s\n' "$out" | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✘' | head -6 | sed 's|^|      |' || true
  fi
  if out="$(bash "$KIT/scripts/check-agent-trust.sh" 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1 | sed 's/\x1b\[[0-9;]*m//g')"
  else
    note_fail "shipped content matches an agent-trust risk pattern (see scripts/check-agent-trust.sh --help):"
    printf '%s\n' "$out" | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✘ (T[1-4]|STALE)' | head -8 | sed 's|^|      |' || true
  fi
else
  note_fail "scripts/check-agent-trust.sh missing — agent-trust patterns are unverified"
fi

# Both host packages share one source and one lock; test the plugin layout independently.
echo "Cowork plugin package fixtures:"
if out="$(python3 "$KIT/scripts/tests/plugin-package/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "plugin package identity/layout fixtures failed"
  printf '%s\n' "$out"
fi

echo "Cowork native-session preflight fixtures:"
if out="$(python3 "$KIT/scripts/tests/cowork-session/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "Cowork native-session receipt fixtures failed"
  printf '%s\n' "$out"
fi

echo "Local folder discovery fixtures:"
if out="$(python3 "$KIT/scripts/tests/folder-package/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "local folder discovery fixtures failed"
  printf '%s\n' "$out"
fi

echo "Project discovery fixtures:"
if out="$(python3 "$KIT/scripts/tests/project-discovery/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "project discovery fixtures failed"
  printf '%s\n' "$out"
fi

echo "Project workspace fixtures:"
if out="$(python3 "$KIT/scripts/tests/project-workspace/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "project workspace fixtures failed"
  printf '%s\n' "$out"
fi

echo "Source provenance fixtures:"
if out="$(python3 "$KIT/scripts/tests/source-commit/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "source provenance fixtures failed"
  printf '%s\n' "$out"
fi

echo "Public content privacy fixtures:"
if out="$(python3 "$KIT/scripts/tests/content-audit/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "public content privacy fixtures failed"
  printf '%s\n' "$out"
fi

echo "Public release fixtures:"
if out="$(python3 "$KIT/scripts/tests/release-audit/run.py" 2>&1)"; then
  note_ok "$(printf '%s' "$out" | tail -1)"
else
  note_fail "public release audit fixtures failed"
  printf '%s\n' "$out"
fi

# ── 1. every skill's own suite ────────────────────────────────────────────────
echo "Skill suites:"
for d in "$KIT"/skills/*/; do
  s="$(basename "$d")"
  if [ -f "$d/tests/run.sh" ]; then
    if out="$(bash "$d/tests/run.sh" 2>&1)"; then
      note_ok "$s — $(printf '%s' "$out" | tail -1 | sed 's/\x1b\[[0-9;]*m//g')"
    else
      note_fail "$s — suite RED:"
      printf '%s\n' "$out" | sed 's/\x1b\[[0-9;]*m//g' | grep -E 'FAIL|✘' | head -8 | sed 's|^|      |' || true
    fi
  else
    note_fail "$s — no tests/run.sh. Every shipped skill carries its own suite; add one or drop the skill."
  fi
done

# ── 1b. first-party replacements preserve the original creative integration points ──
echo "Replacement parity:"
if [ -f "$KIT/scripts/check-replacement-parity.sh" ]; then
  if out="$(bash "$KIT/scripts/check-replacement-parity.sh" 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1)"
  else
    note_fail "creative order or a replacement integration point drifted:"
    printf '%s\n' "$out" | grep -E '✘' | head -8 | sed 's|^|      |' || true
  fi
else
  note_fail "scripts/check-replacement-parity.sh missing"
fi

# ── 2. every skill ships an eval definition ───────────────────────────────────
echo "Eval definitions:"
missing_evals=""
for d in "$KIT"/skills/*/; do
  s="$(basename "$d")"
  [ -f "$d/evals/evals.json" ] || missing_evals="$missing_evals $s"
done
if [ -n "$missing_evals" ]; then
  note_fail "no evals/evals.json:$missing_evals"
else
  note_ok "all $(ls -1d "$KIT"/skills/*/ | wc -l | tr -d ' ') skills carry an eval definition"
fi

# ── 2c. one canonical name per concept, across skills ────────────────────────
# A per-skill suite cannot see this: each file is internally consistent, and they disagree with
# each other. The 2026-09-10 audit found seven such concepts; the worst made an iOS-44pt finding
# fail Correctness mechanically, because the basis-class list was missing a bucket in one file.
echo "Vocabulary:"
if [ -f "$KIT/scripts/check-vocabulary.sh" ]; then
  if out="$(bash "$KIT/scripts/check-vocabulary.sh" 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1 | sed 's/\x1b\[[0-9;]*m//g')"
  else
    note_fail "a concept goes by more than one name across skills:"
    printf '%s\n' "$out" | sed 's/\x1b\[[0-9;]*m//g' | grep -E '✘|retired|expected' | head -8 | sed 's|^|      |' || true
  fi
else
  note_fail "scripts/check-vocabulary.sh missing — cross-skill vocabulary is unverified"
fi

# ── 2d. the assembled consumer fixture resolves every @ reference ────────────
# Checking similarly named source directories is insufficient: the shipped layout is what loads.
echo "Consumer fixture wiring:"
TPL="$KIT/docs/CLAUDE-TEMPLATE.md"
WIRING="$KIT/scripts/check-package-wiring.sh"
if [ -f "$TPL" ] && [ -f "$WIRING" ]; then
  if out="$(bash "$WIRING" --self-test 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1)"
  else
    note_fail "the package-wiring check's own broken fixture was not rejected"
  fi
  TMP_FIXTURE="$(mktemp -d)"
  cp "$TPL" "$TMP_FIXTURE/CLAUDE.md"
  mkdir -p "$TMP_FIXTURE/.claude"
  cp -R "$KIT/skills" "$TMP_FIXTURE/.claude/skills"
  if out="$(bash "$WIRING" "$TMP_FIXTURE" 11 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1)"
  else
    note_fail "a packaged @ path does not resolve in the consumer fixture:"
    printf '%s\n' "$out" | grep -E '✘' | head -8 | sed 's|^|      |' || true
  fi
  rm -rf "$TMP_FIXTURE"; TMP_FIXTURE=""
else
  note_fail "CLAUDE template or package-wiring check missing"
fi

# Internal acceptance tooling exists only in development checkouts; public source omits it.
if [ -d "$KIT/acceptance" ]; then
  echo "Acceptance preflight:"
  PREFLIGHT="$KIT/scripts/acceptance-preflight.sh"
  if [ -f "$PREFLIGHT" ] && out="$(bash "$PREFLIGHT" --self-test 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1)"
  else
    note_fail "acceptance preflight missing or its contamination fixtures failed"
  fi

  echo "Acceptance isolation:"
  PREPARER="$KIT/scripts/prepare-acceptance-fixture.sh"
  if [ -f "$PREPARER" ] && out="$(bash "$PREPARER" --self-test 2>&1)"; then
    note_ok "$(printf '%s' "$out" | tail -1)"
  else
    note_fail "acceptance fixture preparer missing or its isolation fixtures failed"
  fi
fi

# ── 3. mirrors ────────────────────────────────────────────────────────────────
echo "Mirror invariants:"
MIRROR="$KIT/skills/ui-design-review/tests/check-mirror.sh"
if [ -f "$MIRROR" ]; then
  if bash "$MIRROR" >/dev/null 2>&1; then note_ok "rules.md byte-identical in both copies"
  else note_fail "mirror drift — run $MIRROR for the diff"; fi
else
  note_fail "check-mirror.sh missing"
fi

# ── 4. the lock matches the working files ─────────────────────────────────────
echo "Lock:"
if bash "$KIT/scripts/drift-check.sh" >/dev/null 2>&1; then
  note_ok "skills-lock.json matches skills/"
else
  note_fail "skills/ has drifted from skills-lock.json — run scripts/gen-lock.sh, then re-read the diff before publishing"
fi

# ── 4b. public releases must carry explicit reuse terms ──────────────────────
echo "License:"
if [ -f "$KIT/LICENSE" ] && grep -q '^MIT License$' "$KIT/LICENSE"; then
  note_ok "MIT License present"
else
  note_fail "root LICENSE missing or not the expected MIT License — do not publish ambiguous reuse terms"
fi

echo "────────────────────────────────────────"
if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}${BOLD}✘ gate failed — ${FAILED} problem(s). Nothing written.${RESET}"
  exit 1
fi
echo -e "${GREEN}${BOLD}✔ gate passed.${RESET}"
[ "$CHECK_ONLY" -eq 1 ] && exit 0

# Assembly builds the internal acceptance package and needs development-only material.
if [ ! -d "$KIT/acceptance" ] || [ ! -f "$KIT/docs/DIST-README.md" ]; then
  echo "Assembly is available only in a development checkout. Build public release archives with:"
  echo "  python3 scripts/prepare-public-release.py --out /absolute/new/release-directory"
  exit 2
fi

# ── 5. assemble ───────────────────────────────────────────────────────────────
[ -n "$OUT" ] || OUT="$KIT/dist/agentic-design-kit-code-$(cat "$KIT/VERSION")"
if [ -e "$OUT" ]; then
  echo -e "${RED}✘${RESET} $OUT already exists. Pass --out with a fresh path, or remove it yourself —"
  echo "  this script never deletes anything it did not create."
  exit 2
fi
mkdir -p "$OUT/.claude"
sed 's/START-HERE.md/KIT-START-HERE.md/g' "$KIT/public/AGENTS.md" > "$OUT/AGENTS.md"

cp -R "$KIT/skills" "$OUT/.claude/skills"
cp "$KIT/skills-lock.json" "$OUT/skills-lock.json"
mkdir -p "$OUT/scripts"
cp "$KIT/scripts/drift-check.sh" "$OUT/scripts/drift-check.sh"
cp "$KIT/scripts/folder-preflight.py" "$OUT/scripts/folder-preflight.py"
cp "$KIT/scripts/create-project.py" "$OUT/scripts/create-project.py"
cp "$KIT/docs/STANDALONE-START-HERE.md" "$OUT/KIT-START-HERE.md"
cp "$KIT/VERSION" "$OUT/VERSION"
cp "$KIT/scripts/check-package-wiring.sh" "$OUT/scripts/check-package-wiring.sh"
cp "$KIT/scripts/acceptance-preflight.sh" "$OUT/scripts/acceptance-preflight.sh"
cp "$KIT/scripts/prepare-acceptance-fixture.sh" "$OUT/scripts/prepare-acceptance-fixture.sh"
cp -R "$KIT/acceptance" "$OUT/acceptance"
[ -f "$KIT/LICENSE" ] && cp "$KIT/LICENSE" "$OUT/LICENSE"
[ -d "$KIT/licenses" ] && cp -R "$KIT/licenses" "$OUT/licenses"
[ -f "$KIT/NOTICE" ] && cp "$KIT/NOTICE" "$OUT/NOTICE"
if [ -f "$KIT/docs/DIST-README.md" ]; then
  cp "$KIT/docs/DIST-README.md" "$OUT/README.md"
else
  note_fail "docs/DIST-README.md missing — the consumer README is not optional"; exit 1
fi
# The default CLAUDE.md is the wiring, not documentation: without its @-references the consumer
# gets whichever single skill they happen to name, and the other six never load.
if [ -f "$KIT/docs/CLAUDE-TEMPLATE.md" ]; then
  cp "$KIT/docs/CLAUDE-TEMPLATE.md" "$OUT/CLAUDE.md"
else
  note_fail "docs/CLAUDE-TEMPLATE.md missing — the default CLAUDE.md is not optional"; exit 1
fi
source_commit="$(bash "$KIT/scripts/source-commit.sh")"
development_repository="$(python3 - "$KIT" <<'PY'
import os, subprocess, sys
kit = sys.argv[1]
if os.path.isfile(os.path.join(kit, "SOURCE-COMMIT")):
    print(os.path.realpath(kit)); sys.exit(0)
common = subprocess.check_output(
    ["git", "-C", kit, "rev-parse", "--git-common-dir"], text=True
).strip()
if not os.path.isabs(common):
    common = os.path.join(kit, common)
common = os.path.realpath(common)
print(os.path.dirname(common) if os.path.basename(common) == ".git" else common)
PY
)"
{
  printf 'source_commit\t%s\n' "$source_commit"
  printf 'development_repository\t%s\n' "$development_repository"
} > "$OUT/acceptance/package-metadata.tsv"
find "$OUT" -name '.DS_Store' -delete 2>/dev/null || true

if ! bash "$OUT/scripts/check-package-wiring.sh" "$OUT" 11 >/dev/null 2>&1; then
  echo -e "${RED}✘${RESET} the assembled consumer fixture has an unresolved @ path."
  exit 1
fi

# The consumer's copy must verify against the lock it was shipped with.
if bash "$OUT/scripts/drift-check.sh" >/dev/null 2>&1; then
  verify="verified against skills-lock.json"
else
  echo -e "${RED}✘${RESET} the assembled copy does not match its own lock — this is a packaging bug, not a drift."
  exit 1
fi

nskills=$(ls -1d "$OUT"/.claude/skills/*/ | wc -l | tr -d ' ')
nfiles=$(find "$OUT/.claude/skills" -type f | wc -l | tr -d ' ')
echo
echo -e "${BOLD}published${RESET}  ·  $OUT"
echo "  $nskills skills · $nfiles files · $verify"
echo
echo "  This directory is a package source. Do not run acceptance here."
echo "  Review $OUT/README.md, then create a clean outside fixture with:"
echo "    bash scripts/prepare-acceptance-fixture.sh /absolute/new/destination"
echo "  Verify @ paths with: bash scripts/check-package-wiring.sh ."
echo "  The consumer can re-verify at any time with: bash scripts/drift-check.sh"
