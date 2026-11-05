#!/bin/bash
# Replacement-parity guards. They assert integration order and authority without scoring an aesthetic.
set -uo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"; SKILL="$DIR/SKILL.md"; FAIL=0
pass(){ printf '  ✔ %s\n' "$1"; }; fail(){ printf '  ✘ FAIL %s\n' "$1"; FAIL=$((FAIL+1)); }

echo "design-review replacement-parity guards"
render=$(grep -n '^## 1 · Render and look' "$SKILL" | cut -d: -f1)
lenses=$(grep -n '^## 2 · Invoke the independent lenses' "$SKILL" | cut -d: -f1)
verify=$(grep -n '^## 4 · Verify load-bearing claims' "$SKILL" | cut -d: -f1)
repair=$(grep -n '^## 6 · Repair once' "$SKILL" | cut -d: -f1)
if [ -n "$render" ] && [ -n "$lenses" ] && [ -n "$verify" ] && [ -n "$repair" ] \
  && [ "$render" -lt "$lenses" ] && [ "$lenses" -lt "$verify" ] && [ "$verify" -lt "$repair" ]; then
  pass "render → independent lenses → verification → repair"
else
  fail "review order changed"
fi

grep -q '/distinctiveness-review.*theme-free anti-slop audit' "$SKILL" \
  && pass "anti-slop audit replacement occupies its V1 review point" \
  || fail "anti-slop audit replacement mapping missing"
grep -q '/design-refine.*read-only refinement review' "$SKILL" \
  && pass "refinement replacement occupies its V1 review point" \
  || fail "refinement replacement mapping missing"
grep -q '/ui-design-review' "$SKILL" || fail "UI rules lens missing"
grep -q '/ia-review' "$SKILL" || fail "conditional IA lens missing"
grep -qi "original references directly" "$SKILL" || fail "similarity reviewer may lose originals"
tr '\n' ' ' < "$SKILL" | tr -s ' ' | grep -qi "detectors and provenance validate the design after initial visual exploration" \
  || fail "verification may shape initial exploration"
grep -qi "Do not merge conflicting judgements" "$SKILL" || fail "lens disagreements may be erased"
grep -qi "One bounded pass" "$SKILL" || fail "repair is not bounded"

for state in REVIEWED 'READY WITH PROPOSALS' READY; do grep -q "$state" "$SKILL" || fail "state missing: $state"; done
node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$DIR/evals/evals.json" 2>/dev/null \
  && pass "eval definition parses" || fail "eval definition invalid"

[ "$FAIL" -eq 0 ] || exit 1
pass "design-review replacement parity passed"
