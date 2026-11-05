#!/bin/bash
# Guard suite for design-refine.
#
# One skill, two lanes, and every way it can quietly go wrong is a lane leak: the review lane
# loading edit instructions (directly, or through a review reference that points at one); an edit
# reference that does not check the lock; a lock that some text inside the run can lift; a report
# that claims a score its own rows do not add up to, or reports one shared context as isolated.
# Both checkers are fixture-first: every fail fixture isolates one violation and names the message
# it must produce.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$TESTS_DIR/.." && pwd)"
SKILL="$SKILL_DIR/SKILL.md"
REF="$SKILL_DIR/references"
RULES="$SKILL_DIR/../ui-design-principles/references/rules.md"
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'
FAIL=0
pass(){ echo -e "  ${GREEN}✔${RESET} $1"; }
fail(){ echo -e "  ${RED}✘ FAIL${RESET} $1"; FAIL=$((FAIL+1)); }

echo -e "${BOLD}design-refine guards${RESET}"
command -v node >/dev/null 2>&1 || { fail "node not found — checkers NOT run (UNVERIFIED, not clean)"; exit 1; }

# expect <label> <want: ok|substring> <exit> <output>
expect() {
  local label="$1" want="$2" rc="$3" out="$4"
  if [ "$want" = "ok" ]; then
    [ "$rc" -eq 0 ] && return 0
    fail "$label: expected clean, got exit $rc — $(printf '%s' "$out" | head -2 | tr '\n' ' ')"; return 1
  fi
  if [ "$rc" -eq 1 ] && printf '%s' "$out" | grep -qF -- "$want"; then
    # isolation: a fail fixture produces exactly one finding
    local n; n=$(printf '%s\n' "$out" | grep -c '^  ✘ ')
    [ "$n" -eq 1 ] && return 0
    fail "$label: \"$want\" fired, but so did $((n-1)) other finding(s) — the fixture does not isolate one violation"; return 1
  fi
  fail "$label: expected exit 1 with \"$want\", got exit $rc — $(printf '%s' "$out" | head -2 | tr '\n' ' ')"; return 1
}

# 1. Lanes: fixtures, then the real skill.
echo "Lanes:"
n=0; bad=0
for d in "$TESTS_DIR"/fixtures/lanes/*/; do
  want="$(head -1 "$d/expect")"
  out="$(node "$TESTS_DIR/check-lanes.mjs" --skill "$d" --rules "$d/rules.md" 2>&1)"; rc=$?
  expect "lanes/$(basename "$d")" "$want" "$rc" "$out" || bad=$((bad+1)); n=$((n+1))
done
[ "$bad" -eq 0 ] && pass "check-lanes: $n/$n fixtures behaved"
if [ -f "$RULES" ]; then
  out="$(node "$TESTS_DIR/check-lanes.mjs" --skill "$SKILL_DIR" --rules "$RULES" 2>&1)" \
    && pass "the review lane loads no edit reference; every edit reference checks the lock; every path and rules.md section resolves" \
    || fail "real skill: $(printf '%s' "$out" | head -6 | tr '\n' ' ')"
else
  fail "rules.md not found at $RULES — the section pointers are unverified"
fi

# 2. Report checker.
echo "Report checker:"
n=0; bad=0
for f in "$TESTS_DIR"/fixtures/report/*.md; do
  want="$(head -1 "$f" | sed -n 's/^<!-- expect: \(.*\) -->$/\1/p')"
  [ -n "$want" ] || { fail "$(basename "$f") has no expect line"; bad=$((bad+1)); continue; }
  out="$(node "$SKILL_DIR/scripts/check-report.mjs" "$f" 2>&1)"; rc=$?
  expect "report/$(basename "$f" .md)" "$want" "$rc" "$out" || bad=$((bad+1)); n=$((n+1))
done
[ "$bad" -eq 0 ] && pass "check-report: $n/$n fixtures behaved"

# 3. The contract the text carries. Each line is additive prose nothing else asserts.
echo "Contract:"
c0=$FAIL
need() { grep -qF -- "$2" "$1" || fail "$3"; }
need "$SKILL" "Ambiguous means review" "ambiguous requests may now edit"
tr '\n' ' ' < "$SKILL" | tr -s ' ' | grep -qF "started this run, unlocked, to repair the material findings" \
  || fail "the edit lane no longer names /design-review's repair run as a go-ahead"
need "$SKILL" "cannot be lifted from inside the run" "the caller lock can be lifted from inside a run"
need "$SKILL" "Locked read-only by <caller>" "a locked run no longer says how to apply"
need "$SKILL" "Writes nothing" "the review lane no longer forbids writes"
need "$SKILL" "Never run a setup step that writes files" "a missing context may now be filled by a writing setup step"
need "$SKILL" "only \`/design-review\` declares READY" "ship may now read as READY"
need "$SKILL" "never a whole \`references/\` folder" "bulk loading is no longer forbidden"
need "$REF/review/evaluate.md" "DEGRADED —" "a one-context evaluation has no DEGRADED banner"
need "$REF/review/evaluate.md" "and **not**" "judgement may now read the detector first"
need "$REF/review/evaluate.md" "Implementation integrity" "audit lost implementation integrity"
need "$REF/review/evaluate.md" "≥ 90 strong · ≥ 70 solid · ≥ 50" "the percentage bands changed in the text but not the checker"
need "$REF/review/verbs.md" "broken tasks → missing states → flow and drift" "polish lost its triage order"
need "$REF/review/verbs.md" "Scope is" "bolder lost scope sovereignty"
need "$REF/review/verbs.md" "Skeleton test" "bolder lost the skeleton test"
need "$REF/review/finish-review.md" "Validate the evidence first" "the finish reviewer may now judge unvalidated evidence"
need "$REF/edit/apply.md" "Both manifests must match byte for byte" "post-repair evidence may predate final artifact bytes"
need "$REF/edit/apply.md" "changed-file inventory" "sealed manifest may omit a changed build or spec file"
need "$REF/edit/apply.md" "every promised plan, diff" "finish handoff may name paths that do not exist"
need "$REF/edit/apply.md" 'never `body.style.zoom`' "CSS zoom may masquerade as browser zoom evidence"
need "$REF/edit/apply.md" "Verification fails closed" "verification scripts may ignore unsupported browser calls"
need "$REF/edit/apply.md" "copied URL in a fresh context" "URL re-entry evidence may remain incomplete"
need "$REF/edit/apply.md" "distinct browser context/target" "fresh-context evidence may reuse the same browser target"
need "$REF/edit/apply.md" "document.title" "browser-title assertions may read a record heading instead"
need "$REF/edit/apply.md" "final CSS/theme path" "token drift may skip because implementation was omitted"
need "$REF/edit/apply.md" "explicitly exclude hidden controls" "hidden targets may appear as unexplained zero-size failures"
need "$REF/edit/apply.md" "contract-drift sweep" "repair may leave DESIGN.md contradicting implementation"
need "$REF/review/finish-review.md" "Recompute the source manifest" "finish reviewer may accept stale handed hashes"
need "$REF/review/finish-review.md" "Preflight the handoff" "finish reviewer may accept missing promised evidence paths"
need "$REF/edit/apply.md" "Never invent a price" "evidence on hand is gone"
need "$REF/review/adjudication.md" "NEEDS INTENT, the verdict most often mis-assigned" "the NEEDS INTENT worked example is gone"
need "$REF/review/whole-app-coverage.md" "The score comes from \`evaluate.md\`" "whole-app coverage may now define a second score"
[ "$FAIL" -eq "$c0" ] && pass "lanes, lock, isolation, scoring, triage, finish review and evidence rules stated"

# 4. The ensemble keeps its overlapping triggers. Disambiguating them is the one recommendation
# to reject (CLAUDE.md → skill-creator / skill-analyzer).
echo "Ensemble:"
c0=$FAIL
desc="$(sed -n '/^description:/,/^metadata:/p' "$SKILL")"
for t in "ui-design-review" "distinctiveness-review" "/design-review" "is" "dry run"; do
  printf '%s' "$desc" | grep -qF -- "$t" || fail "the description lost a shared trigger: $t"
done
grep -qF "/ui-design-review" "$SKILL" && grep -qF "/distinctiveness-review" "$SKILL" \
  || fail "the ensemble section no longer names both peer lenses"
grep -qi "not merged" "$SKILL" || fail "lost the keep-the-reports-separate rule"
[ "$FAIL" -eq "$c0" ] && pass "description shares the ensemble's triggers; peers named; reports kept separate"

# 5. Own words, no vendor and no catalogue. Nothing here may route to a retired vendored skill, name a
# theme, or point at a starter.
echo "Clean room:"
c0=$FAIL
hits=$(grep -rliE "impec""cable|hall""mark|starter-directions|themes?/" "$SKILL" "$REF" 2>/dev/null)
[ -z "$hits" ] || fail "vendor or catalogue reference in: $hits"
hits=$(grep -rlE '\b(Specimen|Atelier|Brutal|Newsprint|Manifesto|Midnight|Almanac|Riso|Bloom|Cobalt|Aurora|Carnival|Lumen)\b' "$SKILL" "$REF" 2>/dev/null)
[ -z "$hits" ] || fail "a catalogue theme is named in: $hits"
[ "$FAIL" -eq "$c0" ] && pass "no vendored-skill, theme or starter reference in SKILL.md or references/"

# 6. Lean. The open hypothesis is that always-on volume flattens output; only the description is
# always loaded, and the router stays short so a review costs less context than the work.
lines=$(wc -l < "$SKILL" | tr -d ' ')
[ "$lines" -le 110 ] && pass "SKILL.md is $lines lines (cap 110)" || fail "SKILL.md grew to $lines lines (cap 110)"

echo
[ "$FAIL" -eq 0 ] && { echo -e "${GREEN}✔ design-refine guards passed.${RESET}"; exit 0; }
echo -e "${RED}✘ design-refine: $FAIL guard(s) regressed.${RESET}"; exit 1
