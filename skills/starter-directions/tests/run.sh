#!/bin/bash
# Guard suite for starter-directions.
#
# The catalogue is useful exactly as long as it stays opt-in. Its failure modes: a starter
# reachable from a path that already has a direction; a "nearest starter" search creeping back;
# a starter that is incomplete, imitates a brand, or carries the old catalogue's contradictions
# (italic display, an accent with no cap, sizes past the headline brackets).
#
#   1. exactly one SKILL.md
#   2. check-starters.mjs: fixtures first, each fail fixture isolates one finding; then the real
#      catalogue (13 starters, library ids resolved against design-build's index)
#   3. the axes agree with design-build's build log values
#   4. the opt-in contract: never on supplied directions, never a nearest match, never in a study
#      or review, recommend-and-wait, the match gate's four of five
#   5. the description names no starter (descriptions are always loaded)
#   6. evals parse

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$TESTS_DIR/.." && pwd)"
SKILL="$SKILL_DIR/SKILL.md"
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'
FAIL=0
pass(){ echo -e "  ${GREEN}✔${RESET} $1"; }
fail(){ echo -e "  ${RED}✘ FAIL${RESET} $1"; FAIL=$((FAIL+1)); }
flat(){ tr '\n' ' ' < "$1" | tr -s ' '; }
need(){ flat "$1" | grep -qiF -- "$2" || fail "$3"; }

echo -e "${BOLD}starter-directions guards${RESET}"
command -v node >/dev/null 2>&1 || { fail "node not found — checker NOT run (UNVERIFIED, not clean)"; exit 1; }

n=$(find "$SKILL_DIR" -name SKILL.md | wc -l | tr -d ' ')
[ "$n" = 1 ] && pass "exactly one SKILL.md, at the package root" || fail "expected one SKILL.md, found $n"

# 2 · checker
n=0; bad=0
for d in "$TESTS_DIR"/fixtures/starters/*/; do
  want=$(head -1 "$d/expect")
  out=$(node "$SKILL_DIR/scripts/check-starters.mjs" --skill "$d" --index "$TESTS_DIR/fixtures/starters/index.md" 2>&1); rc=$?
  nf=$(printf '%s\n' "$out" | grep -c '^  ✘ ')
  if [ "$want" = ok ]; then [ "$rc" = 0 ] || { fail "$(basename "$d"): expected clean, rc=$rc"; bad=$((bad+1)); }
  elif [ "$rc" = 1 ] && printf '%s' "$out" | grep -qF -- "$want" && [ "$nf" = 1 ]; then :
  else fail "$(basename "$d"): expected one finding \"$want\", got rc=$rc, $nf finding(s)"; bad=$((bad+1)); fi
  n=$((n+1))
done
[ "$bad" = 0 ] && pass "check-starters: $n/$n fixtures behaved"
IDX="$SKILL_DIR/../design-build/references/structures/index.md"
if [ -f "$IDX" ]; then
  out=$(node "$SKILL_DIR/scripts/check-starters.mjs" --skill "$SKILL_DIR" --index "$IDX" 2>&1) \
    && pass "the catalogue: $(printf '%s' "$out" | sed 's/check-starters: //')" \
    || fail "real catalogue: $(printf '%s' "$out" | head -5 | tr '\n' ' ')"
else
  fail "design-build's structure index not found — composition ids NOT checked (UNVERIFIED)"
fi
ns=$(grep -cE '^- `[a-z0-9-]+` — starters/' "$SKILL_DIR/references/catalogue.md")
[ "$ns" = 13 ] && pass "manifest: 13 starters" || fail "manifest changed: $ns starters (expected 13 — update if intended)"

# 3 · axes agree with the build log
LIB="$SKILL_DIR/../design-build/scripts/records-lib.mjs"
if [ -f "$LIB" ]; then
  node --input-type=module -e "
    import { ENUMS } from '$LIB';
    import { AXES } from '$SKILL_DIR/scripts/axes.mjs';
    for (const k of ['ground','display','accent']) if (JSON.stringify(ENUMS[k]) !== JSON.stringify(AXES[k])) { console.log(k); process.exit(1); }
  " >/dev/null 2>&1 \
    && pass "starter axes use the build log's values" || fail "starter axes and design-build's log values disagree"
fi

# 4 · the opt-in contract
c0=$FAIL
need "$SKILL" "scaffolding, not a default" "a starter may read as a default"
need "$SKILL" "to find the nearest starter to a supplied direction" "a nearest-starter search is no longer forbidden"
need "$SKILL" "inside a study, a review or a review lens" "starters may enter a study or a review"
need "$SKILL" "recommend **two or three**" "the offer no longer recommends two or three"
need "$SKILL" "**Wait** for the person" "the offer may build without a choice"
need "$SKILL" "four must match" "the match gate lost its threshold"
need "$SKILL" "human-approved direction" "a chosen starter no longer becomes the approved direction"
need "$SKILL_DIR/references/match-gate.md" "resemblance, not a match" "a shared palette may pass as a match"
need "$SKILL_DIR/references/match-gate.md" "Never run this to *find* a starter" "the gate may be used to search"
need "$SKILL_DIR/references/match-gate.md" "boundary" "a match has no stated boundary"
[ "$FAIL" -eq "$c0" ] && pass "opt-in only; recommend and wait; no nearest match; gate four of five with a boundary"

# 5 · description names no starter
STARTERS='\b(Quire|Tabulae|Inkspill|Placard|Nightwatch|Phosphene|Orrery|Kumquat|Waveguide|Gumball|Graticule|Velodrome|Espalier)\b'
sed -n '/^description:/,/^metadata:/p' "$SKILL" | grep -qE "$STARTERS" \
  && fail "the description names a starter (descriptions are always loaded)" \
  || pass "the description names no starter"
grep -qiE 'hall''mark|impec''cable' -r "$SKILL_DIR" --include=*.md && fail "a vendored skill is named in starter-directions" \
  || pass "no vendored skill named"

python3 - "$SKILL_DIR/evals/evals.json" <<'PY' && pass "eval definition parses, ids unique" || fail "evals/evals.json invalid"
import json, sys
d = json.load(open(sys.argv[1]))
assert d["skill_name"] == "starter-directions"
ids = [e["id"] for e in d["evals"]]
assert ids and len(ids) == len(set(ids))
for e in d["evals"]:
    for k in ("id", "prompt", "expected_output", "files", "expectations"):
        assert k in e, (e.get("id"), k)
PY

echo
[ "$FAIL" -eq 0 ] && { echo -e "${GREEN}✔ starter-directions guards passed.${RESET}"; exit 0; }
echo -e "${RED}✘ starter-directions: $FAIL guard(s) regressed.${RESET}"; exit 1
