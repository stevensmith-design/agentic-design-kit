#!/bin/bash
# Fixture tests for validate-tokens.py.
#   tests/fail/*.json  — MUST exit 1 AND raise the intended check to FAIL (per expected.tsv)
#   tests/pass/*.json  — MUST exit 0 (coherent systems must not false-positive)
#   tests/fail-dir/*, tests/pass-dir/*  — same, with tokens.json + theme.css together
#
# F6: fail fixtures now assert the *intended* check fired at the intended level (tests/expected.tsv
# + tests/_assert.py), not merely exit==1 — a fixture named for CTA contrast can no longer pass
# because an unrelated relationship failed. Pass fixtures may also carry a level assertion
# (e.g. a body-only scale must SKIP, not WARN).
#
# Every validate-tokens.py change must pass this suite before deploy/promotion; a new check lands
# as a new pass/ + fail/ pair first, then the code. Each fixture is standalone — no project
# DESIGN.md/overrides leak in.
#
# Exit codes: 0 = all fixtures behaved as expected, 1 = at least one regression.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
VALIDATOR="$TESTS_DIR/../scripts/validate-tokens.py"
MANIFEST="$TESTS_DIR/expected.tsv"
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'
PASS=0; FAIL=0

SKILL_MD="$TESTS_DIR/../SKILL.md"
COMPONENT_SPEC="$TESTS_DIR/../references/component-spec-template.md"
MODE_CREATE="$TESTS_DIR/../references/mode-create.md"
if [ ! -f "$COMPONENT_SPEC" ] || ! grep -qF -- "references/component-spec-template.md" "$SKILL_MD"; then
  echo -e "${RED}FAIL${RESET} component specification template is missing or not routed from SKILL.md"
  exit 1
fi
for phrase in "PASS WITH WARNINGS" "After the final token or CSS edit" "consume or retire every orphan token"; do
  if ! grep -qiF -- "$phrase" "$SKILL_MD" "$MODE_CREATE"; then
    echo -e "${RED}FAIL${RESET} final-verification contract missing: $phrase"
    exit 1
  fi
done
for phrase in "Direction precedence" "examples below describe roles and relationships, not a house style" \
              "first visual exploration may precede formal token validation" \
              "tinted ramp is one option, not a default"; do
  if ! tr '\n' ' ' < "$MODE_CREATE" | tr -s ' ' | grep -qiF -- "$phrase"; then
    echo -e "${RED}FAIL${RESET} creative-parity contract missing: $phrase"
    exit 1
  fi
done

manifest_verdict="$(python3 "$TESTS_DIR/_manifest.py" "$TESTS_DIR" 2>&1)"
if [ $? -ne 0 ]; then
  echo -e "${RED}FAIL${RESET} fixture manifest: $manifest_verdict"
  exit 1
fi
echo "$manifest_verdict"

_check() {   # <json> <code> <base> <expect>
  local json="$1" code="$2" base="$3" expect="$4"
  if [ "$code" -eq 2 ]; then
    echo -e "  ${RED}FAIL${RESET} harness error (exit 2 — parse/usage): $base"; FAIL=$((FAIL+1)); return; fi
  local want_code; [ "$expect" = "fail" ] && want_code=1 || want_code=0
  if [ "$code" -ne "$want_code" ]; then
    echo -e "  ${RED}FAIL${RESET} expected exit $want_code, got $code: $base"; FAIL=$((FAIL+1)); return; fi
  local jf; jf="$(mktemp)"; printf '%s' "$json" > "$jf"
  local verdict; verdict="$(python3 "$TESTS_DIR/_assert.py" "$MANIFEST" "$base" "$jf")"; rm -f "$jf"
  case "$verdict" in
    OK) PASS=$((PASS+1));;
    UNSPECIFIED)
      [ "$expect" = "fail" ] && echo -e "  ${YELLOW}~ UNSPECIFIED${RESET} $base (add expected.tsv entry to lock the check)"
      PASS=$((PASS+1));;
    *) echo -e "  ${RED}FAIL${RESET} $base: $verdict"; FAIL=$((FAIL+1));;
  esac
}

run_one() { local json; json="$(python3 "$VALIDATOR" --tokens "$1" --json 2>/dev/null)"; _check "$json" $? "$(basename "$1" .json)" "$2"; }
run_dir() { local json; json="$(python3 "$VALIDATOR" "$1" --json 2>/dev/null)"; _check "$json" $? "$(basename "$1")" "$2"; }
run_strict() { local json; json="$(python3 "$VALIDATOR" --tokens "$1" --strict --json 2>/dev/null)"; _check "$json" $? "$(basename "$1" .json)" "$2"; }

echo -e "${BOLD}validate-tokens.py fixture suite${RESET}"
echo "Broken systems (must FAIL via the intended check):"
for f in "$TESTS_DIR"/fail/*.json; do run_one "$f" fail; done
echo "Coherent systems (must PASS / exit 0):"
for f in "$TESTS_DIR"/pass/*.json; do run_one "$f" pass; done
echo "Directory fixtures (tokens + theme CSS — drift/theme-vs-tokens):"
if [ -d "$TESTS_DIR/fail-dir" ]; then for d in "$TESTS_DIR"/fail-dir/*/; do run_dir "$d" fail; done; fi
if [ -d "$TESTS_DIR/pass-dir" ]; then for d in "$TESTS_DIR"/pass-dir/*/; do run_dir "$d" pass; done; fi
echo "Coverage floor (--strict — required roles must be assessed):"
if [ -d "$TESTS_DIR/fail-strict" ]; then for f in "$TESTS_DIR"/fail-strict/*.json; do run_strict "$f" fail; done; fi
if [ -d "$TESTS_DIR/pass-strict" ]; then for f in "$TESTS_DIR"/pass-strict/*.json; do run_strict "$f" pass; done; fi

echo "----------------------------------------"
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}OK ${PASS}/${PASS} fixtures behaved as expected.${RESET}"; exit 0
else
  echo -e "${RED}${BOLD}${FAIL} regression(s); ${PASS} passed.${RESET}"; exit 1
fi
