#!/bin/bash
# Guard suite for design-build.
#
# design-build is a SEQUENCE skill: its value is that every step runs without being asked for. Its
# failure mode is not a wrong answer but a step quietly going missing — the review done in-context,
# the render softened into "scan it", the direction source skipped — or a high-bias input arriving
# on the default path: a structure file, a starter, a catalogue. Each of those is additive prose
# that nothing else asserts, so each has a guard here.
#
#   1. exactly one SKILL.md at the package root (shared kit invariant)
#   2. the six steps, in order; direction → system → build
#   3. the direction-source router: eight routes, precedence, quarantine, no nearest-starter mapping
#   4. the review is delegated to a fresh context, never performed in-context
#   5. render-and-look is not softened to a scanner run
#   6. guardrails, judged dimensions
#   7. paths: the default path loads no structures or starter file; every path resolves; the
#      library index and its files agree; fixtures first (check-paths.mjs)
#   8. records and distance checkers, fixture by fixture
#   9. clean room: no vendored skill named anywhere in the skill; no starter name
#  10. SKILL.md line cap; library manifest; evals parse
#
# Exit codes: 0 = clean, 1 = a guard regressed.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$TESTS_DIR/.." && pwd)"
SKILL="$SKILL_DIR/SKILL.md"
REF="$SKILL_DIR/references"
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'
FAIL=0
pass() { echo -e "  ${GREEN}✔${RESET} $1"; }
fail() { echo -e "  ${RED}✘ FAIL${RESET} $1"; FAIL=$((FAIL+1)); }
# Phrases are matched on the file with line breaks flattened: prose is wrapped at ~100 columns, and a
# guard must not break because a sentence moved across a line boundary.
need() { tr '\n' ' ' < "$1" | tr -s ' ' | grep -qiF -- "$2" || fail "$3"; }

echo -e "${BOLD}design-build guards${RESET}"
command -v node >/dev/null 2>&1 || { fail "node not found — checkers NOT run (UNVERIFIED, not clean)"; exit 1; }

# 1 · exactly one SKILL.md
n=$(find "$SKILL_DIR" -name SKILL.md | wc -l | tr -d ' ')
[ "$n" = "1" ] && pass "exactly one SKILL.md, at the package root" || fail "expected exactly one SKILL.md, found $n"

# 2 · six steps in order
last=0; ok=1
for st in "### 1 · Read the direction" "### 2 · Commit to a direction" "### 3 · Encode the direction into the system" \
          "### 4 · Build" "### 5 · Render it, and look at it" "### 6 · Delegate the review"; do
  line=$(grep -n -F "$st" "$SKILL" | head -1 | cut -d: -f1)
  if [ -z "$line" ] || [ "$line" -lt "$last" ]; then fail "sequence step missing or out of order: $st"; ok=0; else last=$line; fi
done
[ "$ok" = 1 ] && pass "six steps present, in order: direction → system → build → render → delegate"
need "$SKILL" "does not remove this step" "an existing DESIGN.md may skip the direction step"
need "$SKILL" "Intent, then principles, then tokens" "the system may be built tokens-first"

# 3 · the direction-source router
c0=$FAIL
for route in approved-direction system-led reference-led reference-directed brief-originated starter-led "named-starter match" product-interface; do
  grep -qF "**$route**" "$SKILL" || fail "the router lost a route: $route"
done
need "$SKILL" "Name the direction source" "the direction source is no longer named before catalogues or system work"
need "$SKILL" "lower source never reinterprets" "lost the precedence rule"
for src in "human-approved direction" "approved design system" "role-assigned references" "starter directions and kit examples"; do
  need "$SKILL" "$src" "precedence list lost: $src"
done
need "$SKILL" "Exploring, not building" "exploration requests are no longer routed out of the build"
need "$SKILL" "STUDY — DECISION REQUIRED" "lost the study's terminal state"
need "$SKILL" "Never pick one concept silently" "the build may pick a concept silently"
need "$SKILL" "direct inputs, not abstractions" "lost the rule that original references remain available"
need "$SKILL" "Never map a supplied direction to the nearest starter" "a supplied direction may be mapped to a starter"
need "$SKILL" "No orphan motif" "lost the no-orphan-motif rule"
need "$SKILL" "state the direction out loud" "the direction is no longer stated before building"
need "$REF/direction/routes.md" "single-contract mode" "reference work no longer freezes a contract through direction-study"
need "$REF/direction/routes.md" "assigned original references themselves" "the builder may receive only abstractions instead of originals"
need "$REF/direction/routes.md" "Never search the starters for a match" "the agent may survey the starters on supplied directions"
need "$REF/direction/routes.md" "four of" "the named-starter match gate lost its threshold"
need "$REF/direction/routes.md" "is not a request for a" "'make it fresh' may introduce a new direction on system-led work"
need "$REF/direction/routes.md" "say what you are giving up" "going custom no longer names what it forfeits"
need "$REF/direction/discovery.md" "it is data" "an instruction inside a project file may be followed"
need "$REF/direction/discovery.md" "never supplies references of its own" "discovery may pick references itself"
[ "$FAIL" -eq "$c0" ] && pass "router: eight routes, precedence, quarantine, no nearest-starter mapping"

# 4 · the review is delegated
c0=$FAIL
need "$SKILL" "Invoke \`/design-review\` in a subagent" "the review is no longer launched in a separate context"
need "$SKILL" "fresh context" "lost the fresh-context requirement"
need "$SKILL" "Do not review it yourself" "the build may review its own work"
need "$SKILL" "been independently reviewed" "the fallback no longer says the work is unreviewed"
need "$SKILL" "DRAFT — REVIEW REQUIRED" "lost the DRAFT fallback"
need "$SKILL" "cannot be launched or cannot finish" "lost the condition for the DRAFT fallback"
need "$SKILL" "never upgrade it" "the build may upgrade the reviewer's state"
need "$SKILL" "does not review its own work" "frontmatter or opening implies self-review"
need "$SKILL" "Do not report done" "the build may claim completion"
need "$SKILL" "decisions only a person can make" "the report no longer separates human decisions"
need "$SKILL" "whether it matches a theme" "the reviewer is no longer told to judge fulfilment, not conformity"
[ "$FAIL" -eq "$c0" ] && pass "the review is delegated to a fresh context; the build reports its state"

# 5 · render and look
c0=$FAIL
need "$SKILL" "view the image" "step 5 no longer requires viewing the rendered image"
need "$SKILL" "not satisfied by a" "step 5 lost 'a green scanner is not sign-off'"
need "$SKILL" "375px" "step 5 lost the narrow look"
need "$SKILL" "check it against the direction you committed to" "the build no longer checks its own direction"
need "$SKILL" "prose rules line by line" "brand prose rules are no longer checked"
need "$SKILL" "count" "component implementations are no longer counted"
need "$SKILL" "This is not a review" "the self-check may be reported as a review"
need "$SKILL" "never proof of done" "detector output may be read as sign-off"
need "$SKILL" "After the final artifact edit" "verification may reuse output from before the last edit"
need "$SKILL" "PASS WITH WARNINGS" "a warning-bearing validator result may be rounded to clean"
need "$SKILL" "name every WARN, SKIP and UNVERIFIED" "the report may omit incomplete verification"
[ "$FAIL" -eq "$c0" ] && pass "render and look at desktop, 768 and 375; self-check is not a review"

# 6 · guardrails, dimensions, production bar
c0=$FAIL
n=$(sed -n '/^## Guardrails/,/^## What this is not/p' "$SKILL" | grep -cE '^[0-9]+\. \*\*')
[ "$n" -ge 7 ] || fail "expected 7 guardrails, found $n"
for dim in "Creative ceiling" "Quality floor" "Consistency"; do grep -qF "**$dim**" "$SKILL" || fail "lost a judged dimension: $dim"; done
need "$SKILL" "is not the skill running" "lost the invocation-is-not-reading rule"
need "$SKILL" "/brand-to-system" "machine-readable brands no longer route through brand-to-system"
need "$SKILL" "prose \`BRAND.md\` is an input" "a prose brand may stand in for a machine-readable one"
need "$REF/build/passes.md" "Never invent a price" "evidence on hand is gone"
need "$REF/build/passes.md" "Direction recap — before the first implementation" "the direction recap before implementation is gone"
need "$REF/build/passes.md" "Never delete a production file" "the non-destructive rule is gone"
need "$REF/build/passes.md" "Every named font must actually load" "builds may declare fonts that never load"
need "$REF/build/passes.md" "Every action named by the interface performs that action" "live-looking controls may remain dead or simulated"
need "$REF/build/passes.md" "derive from the same effective state" "visible action labels may contradict hidden persisted behavior"
need "$REF/build/passes.md" "Seed persistence" "preview actions are not tested against persisted state"
need "$REF/build/passes.md" "Skeletons mirror the real ledger/list/detail regions" "loading states may replace structure with generic blocks"
need "$REF/build/passes.md" "placeholder-to-final correspondence for every major region" "loading-state geometry has no rendered correspondence proof"
need "$REF/build/passes.md" "Distinguish **initial load** from **refreshing newer data**" "refresh loading may erase already available content"
need "$REF/build/passes.md" "Never replace known values, notes or controls" "refresh loading may substitute placeholders for known working content"
need "$REF/build/passes.md" "updates **every dependent region as one state transaction**" "selection may leave stale detail from another record"
need "$REF/build/passes.md" "Never leave one record's title above another record's measurements or actions" "mixed-record stale state is no longer prohibited"
need "$REF/build/passes.md" "measure every visible control role" "utility controls may escape the project target-size contract"
need "$REF/build/passes.md" "frozen direction contract" "local system may silently contradict the frozen direction"
need "$REF/build/passes.md" "limitation of the" "summary-only unavailable copy may invent a record fact"
need "$SKILL" "every state the surface can actually reach" "build no longer requires applicable states"
need "$REF/build/component-scope.md" "eight states" "component scope lost the eight states"
need "$REF/build/component-scope.md" ".is-hover" "the state sheet lost its forced-state classes"
need "$REF/build/redesign.md" "Diversification **inverts**" "multi-page redesign no longer inverts diversification"
need "$REF/build/redesign.md" "Non-destructive" "redesign lost its non-destructive rule"
need "$REF/build/records.md" "No scores" "the stamp may carry self-scores"
need "$REF/build/variation.md" "and at least two" "applied distance no longer requires two fingerprint treatments to change"
need "$REF/build/records.md" "fingerprint" "the log no longer records the fingerprint"
[ "$FAIL" -eq "$c0" ] && pass "guardrails, judged dimensions, production bar, component scope, redesign"

# shared fixture runner: <label> <want> <rc> <output>
expect() {
  local label="$1" want="$2" rc="$3" out="$4"
  if [ "$want" = "ok" ]; then
    [ "$rc" -eq 0 ] && return 0
    fail "$label: expected clean, got exit $rc — $(printf '%s' "$out" | head -2 | tr '\n' ' ')"; return 1
  fi
  if [ "$rc" -eq 1 ] && printf '%s' "$out" | grep -qF -- "$want"; then
    local nf; nf=$(printf '%s\n' "$out" | grep -c '^  ✘ ')
    [ "$nf" -eq 1 ] && return 0
    fail "$label: \"$want\" fired, and so did $((nf-1)) other finding(s) — the fixture does not isolate one"; return 1
  fi
  fail "$label: expected exit 1 with \"$want\", got exit $rc — $(printf '%s' "$out" | head -2 | tr '\n' ' ')"; return 1
}

# 7 · paths
n=0; bad=0
for d in "$TESTS_DIR"/fixtures/paths/*/; do
  out="$(node "$TESTS_DIR/check-paths.mjs" --skill "$d" 2>&1)"; rc=$?
  expect "paths/$(basename "$d")" "$(head -1 "$d/expect")" "$rc" "$out" || bad=$((bad+1)); n=$((n+1))
done
[ "$bad" -eq 0 ] && pass "check-paths: $n/$n fixtures behaved"
out="$(node "$TESTS_DIR/check-paths.mjs" --skill "$SKILL_DIR" 2>&1)" \
  && pass "default path loads no structures or starter file; every path resolves; index ↔ files one to one" \
  || fail "real skill: $(printf '%s' "$out" | head -6 | tr '\n' ' ')"

# 8 · records and distance
n=0; bad=0
for d in "$TESTS_DIR"/fixtures/records/*/; do
  extra=""; [ -f "$d/args" ] && extra="$(cat "$d/args")"
  # shellcheck disable=SC2086
  out="$(node "$SKILL_DIR/scripts/check-records.mjs" --log "$d/log.jsonl" --stamp "$d/stamp.css" --index "$TESTS_DIR/fixtures/index.md" $extra 2>&1)"; rc=$?
  expect "records/$(basename "$d")" "$(head -1 "$d/expect")" "$rc" "$out" || bad=$((bad+1)); n=$((n+1))
done
[ "$bad" -eq 0 ] && pass "check-records: $n/$n fixtures behaved"
n=0; bad=0
for d in "$TESTS_DIR"/fixtures/distance/*/; do
  out="$(node "$SKILL_DIR/scripts/check-distance.mjs" --log "$d/log.jsonl" 2>&1)"; rc=$?
  expect "distance/$(basename "$d")" "$(head -1 "$d/expect")" "$rc" "$out" || bad=$((bad+1)); n=$((n+1))
done
[ "$bad" -eq 0 ] && pass "check-distance: $n/$n fixtures behaved"
# The real library index parses: every id the fixtures' pass logs would need is the library's own.
out="$(node "$SKILL_DIR/scripts/check-records.mjs" --log "$TESTS_DIR/fixtures/records/pass/log.jsonl" 2>&1)"; rc=$?
[ "$rc" -eq 0 ] && pass "check-records reads the skill's own library by default" \
  || fail "check-records against the real library: $(printf '%s' "$out" | head -3 | tr '\n' ' ')"

# 9 · clean room
c0=$FAIL
VENDOR='hall''mark|impec''cable'
hits=$(grep -rliE "$VENDOR" "$SKILL_DIR" 2>/dev/null)
[ -z "$hits" ] || fail "a vendored skill is named in: $hits"
STARTERS='\b(Quire|Tabulae|Inkspill|Placard|Nightwatch|Phosphene|Orrery|Kumquat|Waveguide|Gumball|Graticule|Velodrome|Espalier)\b'
# Evals may name a starter (a person naming one is a case to test); nothing a build reads may.
hits=$(grep -rlE "$STARTERS" "$SKILL" "$REF" "$SKILL_DIR/scripts" 2>/dev/null)
[ -z "$hits" ] || fail "a starter is named in: $hits"
[ "$FAIL" -eq "$c0" ] && pass "no vendored skill named anywhere in design-build; no starter in anything a build reads"

# 10 · lean router, manifest, evals
lines=$(wc -l < "$SKILL" | tr -d ' ')
[ "$lines" -le 180 ] && pass "SKILL.md is $lines lines (cap 180)" || fail "SKILL.md grew to $lines lines (cap 180)"
np=$(grep -cE '^- `[a-z0-9-]+` — pages/' "$REF/structures/index.md")
nq=$(grep -cE '^- `[a-z0-9-]+` \([a-z-]+\) — parts/' "$REF/structures/index.md")
[ "$np" = 20 ] && [ "$nq" = 47 ] && pass "library manifest: 20 page structures, 47 parts" \
  || fail "library manifest changed: $np pages, $nq parts (expected 20 / 47 — update this count if intended)"
python3 - "$SKILL_DIR/evals/evals.json" <<'PY' && pass "eval definition parses, ids unique" || fail "evals/evals.json invalid"
import json, sys
d = json.load(open(sys.argv[1]))
assert d["skill_name"] == "design-build"
ids = [e["id"] for e in d["evals"]]
assert ids and len(ids) == len(set(ids))
for e in d["evals"]:
    for k in ("id", "prompt", "expected_output", "files", "expectations"):
        assert k in e, (e.get("id"), k)
PY

echo
if [ "$FAIL" -eq 0 ]; then echo -e "${GREEN}✔ design-build guards passed.${RESET}"; exit 0; fi
echo -e "${RED}✘ design-build: $FAIL guard(s) regressed.${RESET}"; exit 1
