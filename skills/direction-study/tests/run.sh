#!/bin/bash
# Behavioural parity guards for direction-study. These assertions protect sequence and ownership
# without prescribing a visual style, concept count, page skeleton or aesthetic vocabulary.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$TESTS_DIR/.." && pwd)"
SKILL="$SKILL_DIR/SKILL.md"
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'
FAIL=0
pass() { echo -e "  ${GREEN}✔${RESET} $1"; }
fail() { echo -e "  ${RED}✘ FAIL${RESET} $1"; FAIL=$((FAIL+1)); }

echo -e "${BOLD}direction-study parity guards${RESET}"

n=$(find "$SKILL_DIR" -name SKILL.md | wc -l | tr -d ' ')
[ "$n" = "1" ] && pass "one package SKILL.md" || fail "expected one SKILL.md, found $n"

last=0; ok=1
for i in 1 2 3 4 5 6 7 8 9 10; do
  line=$(grep -nE "^$i\. \*\*" "$SKILL" | head -1 | cut -d: -f1)
  if [ -z "$line" ] || [ "$line" -lt "$last" ]; then fail "sequence step $i missing or out of order"; ok=0; else last=$line; fi
done
[ "$ok" = 1 ] && pass "ten creative-order steps present"

refs=$(grep -n "Study the originals and assign bounded responsibilities" "$SKILL" | cut -d: -f1)
dirs=$(grep -n "Write a lightweight creative brief and propose directions" "$SKILL" | cut -d: -f1)
contracts=$(grep -n "Freeze provisional contracts after exploration" "$SKILL" | cut -d: -f1)
proofs=$(grep -n "Build narrow visual proofs" "$SKILL" | cut -d: -f1)
review=$(grep -n "Review similarity, resonance and provenance after the visual exploration" "$SKILL" | cut -d: -f1)
if [ -n "$refs" ] && [ -n "$dirs" ] && [ -n "$contracts" ] && [ -n "$proofs" ] && [ -n "$review" ] \
   && [ "$refs" -lt "$dirs" ] && [ "$dirs" -lt "$contracts" ] && [ "$contracts" -lt "$proofs" ] && [ "$proofs" -lt "$review" ]; then
  pass "references → directions → contracts → proofs → review"
else
  fail "creative sequence no longer matches the established order"
fi

grep -qi "originals remain directly viewable" "$SKILL" \
  && grep -qi "never replace the originals" "$SKILL" \
  && pass "original references remain direct inputs" \
  || fail "written abstractions may replace original references"

tr '\n' ' ' < "$SKILL" | tr -s ' ' | grep -qi "choose a useful number from the material rather than enforcing a default" \
  && pass "direction count follows the request and material" \
  || fail "direction count is prescribed"

grep -qi "rejecting every direction and requesting a rerun" "$SKILL" \
  && pass "reject-all and rerun are valid" \
  || fail "reject-all outcome is missing"

grep -qF "STUDY — DECISION REQUIRED" "$SKILL" || fail "study terminal state is missing"
grep -qi "the agent recommends; the person decides" "$SKILL" || fail "agent may assign the verdict"
grep -qi "refinement is an amendment, not a rewrite" "$SKILL" || fail "contract history may be overwritten"

for phrase in "production design system" "production repair pass" "open a starter" \
              "replace original references" "choose the initial aesthetic" "invent product evidence"; do
  sed -n '/^## Never, during a study/,/^## /p' "$SKILL" | grep -qi "$phrase" \
    || fail "never-list lost: $phrase"
done
pass "study boundaries intact"

if grep -qiE 'three is the default|one governing visual mechanism|familiar AI archetype|two to four connected scenes' "$SKILL"; then
  fail "prescriptive aesthetic/process vocabulary remains"
else
  pass "no default concept count, stock mechanism or proof skeleton"
fi

for f in references/reference-study.md references/divergence-check.md references/similarity-review.md \
         references/comparison-report.md references/templates/brief-partition.md \
         references/templates/direction-contract.md references/templates/decision-provenance.md \
         references/templates/contract-amendment.md; do
  [ -f "$SKILL_DIR/$f" ] || fail "missing routed reference: $f"
done
pass "routed references exist"

diag="$SKILL_DIR/scripts/guidance-load.py"; bad_diag=0; total_diag=0
for fixture in "$TESTS_DIR"/fixtures/guidance-load/*.jsonl; do
  total_diag=$((total_diag+1)); base=$(basename "$fixture")
  python3 "$diag" check "$fixture" >/dev/null 2>&1; rc=$?
  case "$base" in
    clean-*) [ "$rc" -eq 0 ] || bad_diag=$((bad_diag+1));;
    leak-*)  [ "$rc" -eq 1 ] || bad_diag=$((bad_diag+1));;
  esac
done
[ "$bad_diag" -eq 0 ] && pass "guidance diagnostic: $total_diag/$total_diag fixtures behaved" \
  || fail "guidance diagnostic: $bad_diag/$total_diag fixtures regressed"

node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' \
  "$SKILL_DIR/evals/evals.json" 2>/dev/null \
  && pass "eval definition parses" || fail "eval definition is invalid JSON"

python3 "$TESTS_DIR/check-contracts.py" || fail "cross-skill invocation wiring regressed"
python3 "$TESTS_DIR/check-orchestration.py" || fail "orchestration negative fixtures regressed"

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}${BOLD}✘ $FAIL guard(s) failed${RESET}"
  exit 1
fi
echo -e "${GREEN}${BOLD}✔ direction-study parity guards passed${RESET}"
