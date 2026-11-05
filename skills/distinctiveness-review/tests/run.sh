#!/bin/bash
# Guard suite for distinctiveness-review.
#
# The lens fails in four quiet ways: a gate drops out of the list and nothing notices; a
# machine-owned rule gets re-judged by the model (two owners, two answers); a report skips gates
# or reports an unrun browser pass as clean; or the lens starts naming a theme. Each check below
# names one. Both checkers are fixture-first: every fail fixture isolates one violation and names
# the message it must produce.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$TESTS_DIR/.." && pwd)"
SKILL="$SKILL_DIR/SKILL.md"
GATES="$SKILL_DIR/references/gates.md"
REGISTRY="$SKILL_DIR/../ui-design-review/scripts/detect/registry.tsv"
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'
FAIL=0
pass(){ echo -e "  ${GREEN}✔${RESET} $1"; }
fail(){ echo -e "  ${RED}✘ FAIL${RESET} $1"; FAIL=$((FAIL+1)); }

echo -e "${BOLD}distinctiveness-review guards${RESET}"
command -v node >/dev/null 2>&1 || { fail "node not found — checkers NOT run (UNVERIFIED, not clean)"; exit 1; }

# expect <label> <want: ok|substring> <exit> <output>
expect() {
  local label="$1" want="$2" rc="$3" out="$4"
  if [ "$want" = "ok" ]; then
    [ "$rc" -eq 0 ] && return 0
    fail "$label: expected clean, got exit $rc — $(printf '%s' "$out" | head -2 | tr '\n' ' ')"; return 1
  fi
  if [ "$rc" -eq 1 ] && printf '%s' "$out" | grep -qF -- "$want"; then return 0; fi
  fail "$label: expected exit 1 with \"$want\", got exit $rc — $(printf '%s' "$out" | head -2 | tr '\n' ' ')"; return 1
}

# 1. Gate list ↔ registry (fixtures, then the real pair).
echo "Gate list ↔ registry:"
n=0; bad=0
for d in "$TESTS_DIR"/fixtures/gates/*/; do
  want="$(head -1 "$d/expect")"
  out="$(node "$TESTS_DIR/check-gates.mjs" --registry "$d/registry.tsv" --gates "$d/gates.md" 2>&1)"; rc=$?
  expect "gates/$(basename "$d")" "$want" "$rc" "$out" || bad=$((bad+1)); n=$((n+1))
done
[ "$bad" -eq 0 ] && pass "check-gates: $n/$n fixtures behaved"
if [ -f "$REGISTRY" ]; then
  out="$(node "$TESTS_DIR/check-gates.mjs" --registry "$REGISTRY" --gates "$GATES" 2>&1)" \
    && pass "references/gates.md matches every judgement row; all 58 origin gates have an owner" \
    || fail "real gate list: $(printf '%s' "$out" | head -4 | tr '\n' ' ')"
else
  fail "registry not found at $REGISTRY — the gate list is unverified"
fi

# 2. Report checker.
echo "Report checker:"
n=0; bad=0
for f in "$TESTS_DIR"/fixtures/report/*.md; do
  case "$(basename "$f")" in gates.md) continue;; esac
  want="$(head -1 "$f" | sed -n 's/^<!-- expect: \(.*\) -->$/\1/p')"
  [ -n "$want" ] || { fail "$(basename "$f") has no expect line"; bad=$((bad+1)); continue; }
  out="$(node "$SKILL_DIR/scripts/check-report.mjs" --gates "$TESTS_DIR/fixtures/report/gates.md" \
    --registry "$TESTS_DIR/fixtures/report/registry.tsv" "$f" 2>&1)"; rc=$?
  expect "report/$(basename "$f" .md)" "$want" "$rc" "$out" || bad=$((bad+1)); n=$((n+1))
done
[ "$bad" -eq 0 ] && pass "check-report: $n/$n fixtures behaved"

# 3. The skill text carries its contract.
echo "Contract:"
c0=$FAIL
grep -qF "never maps a page to a theme" "$SKILL" || fail "lost the never-map-to-a-theme rule"
grep -qi "not re-judged" "$SKILL" || fail "machine-owned findings may now be re-judged"
grep -qF "findings.mjs" "$SKILL" || fail "the lens no longer reads the merged detector findings"
grep -qF "UNVERIFIED" "$SKILL" || fail "an unrun browser pass may now read as clean"
for v in "CONFIRMED SLOP" "JUSTIFIED" "NEEDS INTENT"; do
  grep -qF "$v" "$SKILL" || fail "verdict not named in SKILL.md: $v"
done
grep -qF "/ui-design-review" "$SKILL" && grep -qF "/design-refine" "$SKILL" \
  || fail "the ensemble no longer names both peer lenses"
grep -qi "do not merge\|don't merge\|never merged" "$SKILL" || fail "lost the keep-the-lenses-separate rule"
grep -qi "read-only" "$SKILL" || fail "the lens is no longer read-only"
[ "$FAIL" -eq "$c0" ] && pass "SKILL.md states the lens contract"

# 4. Theme-free. No catalogue name, no catalogue path, no starter route, in what the lens loads.
echo "Theme-free:"
c0=$FAIL
hits=$(grep -lE '\b(Specimen|Atelier|Brutal|Newsprint|Manifesto|Midnight|Almanac|Riso|Bloom|Cobalt|Aurora|Carnival|Lumen)\b' \
  "$SKILL" "$SKILL_DIR"/references/*.md 2>/dev/null)
[ -z "$hits" ] || fail "a catalogue theme is named in: $hits"
grep -rqiE "themes?/|theme-index|starter-directions|hall""mark" "$SKILL" "$SKILL_DIR/references" \
  && fail "the lens points at a theme catalogue, a starter skill or a vendored skill"
[ "$FAIL" -eq "$c0" ] && pass "no theme, starter or catalogue reference in SKILL.md or references/"

# 5. Lean. The open hypothesis is that always-on volume flattens output; this skill loads only
# when a review runs, but its SKILL.md is still kept short and the gate table lives in references/.
lines=$(wc -l < "$SKILL" | tr -d ' ')
[ "$lines" -le 110 ] && pass "SKILL.md is $lines lines (cap 110)" || fail "SKILL.md grew to $lines lines (cap 110)"

echo
[ "$FAIL" -eq 0 ] && { echo -e "${GREEN}✔ distinctiveness-review guards passed.${RESET}"; exit 0; }
echo -e "${RED}✘ distinctiveness-review: $FAIL guard(s) regressed.${RESET}"; exit 1
