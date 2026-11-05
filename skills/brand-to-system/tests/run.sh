#!/usr/bin/env bash
# Deterministic guards for brand-to-system.
#
# The suite proves the shipped Example Studio example is reproducible, the generated token graph clears
# the sibling validator's strict floor, and the two explicit refusal boundaries remain refusals.

set -uo pipefail

TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$TESTS_DIR/.." && pwd)"
SKILLS_DIR="$(cd "$SKILL_DIR/.." && pwd)"
DERIVER="$SKILL_DIR/scripts/derive-system.py"
EXAMPLE="$SKILL_DIR/examples/example-studio"
VALIDATOR="$SKILLS_DIR/ui-design-system/scripts/validate-tokens.py"
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'
PASS=0; FAIL=0

ok() { echo -e "  ${GREEN}✔${RESET} $1"; PASS=$((PASS + 1)); }
bad() { echo -e "  ${RED}✘ FAIL${RESET} $1"; FAIL=$((FAIL + 1)); }

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo -e "${BOLD}brand-to-system guard suite${RESET}"

skill_count="$(find "$SKILL_DIR" -name SKILL.md -type f | wc -l | tr -d ' ')"
if [ "$skill_count" = "1" ] && [ -f "$SKILL_DIR/SKILL.md" ]; then
  ok "exactly one SKILL.md, at the package root"
else
  bad "expected one root SKILL.md; found $skill_count"
fi

if tr '\n' ' ' < "$SKILL_DIR/SKILL.md" | tr -s ' ' | grep -qiF \
   "Those choices must already exist in the machine-readable brand and agree with the human-approved or reference-led direction"; then
  ok "deriver is conditional and cannot override an accepted direction"
else
  bad "deriver may impose its colour model on an accepted direction"
fi

if python3 -m json.tool "$SKILL_DIR/schema/brand.schema.json" >/dev/null 2>&1 \
   && python3 -m json.tool "$EXAMPLE/brand.json" >/dev/null 2>&1; then
  ok "schema and example brand are valid JSON"
else
  bad "schema or example brand does not parse"
fi

OUT="$TMP_DIR/derived"
if python3 "$DERIVER" "$EXAMPLE/brand.json" "$OUT" >/dev/null 2>&1; then
  ok "Example Studio derives successfully"
else
  bad "Example Studio derivation failed"
fi

if [ -f "$OUT/tokens.json" ] && [ -f "$OUT/DESIGN.md" ] \
   && diff -q "$OUT/tokens.json" "$EXAMPLE/derived/tokens.json" >/dev/null \
   && diff -q "$OUT/DESIGN.md" "$EXAMPLE/derived/DESIGN.md" >/dev/null; then
  ok "Example Studio output is deterministic and matches the shipped example"
else
  bad "derived output drifted from the shipped Example Studio example"
fi

if [ -f "$VALIDATOR" ] && python3 "$VALIDATOR" "$OUT" --strict >/dev/null 2>&1; then
  ok "derived Example Studio token graph passes validate-tokens.py --strict"
else
  bad "derived Example Studio token graph did not pass the sibling strict validator"
fi

sed 's/"ground": "light"/"ground": "dark"/' "$EXAMPLE/brand.json" > "$TMP_DIR/dark.json"
if python3 "$DERIVER" "$TMP_DIR/dark.json" "$TMP_DIR/dark-out" >/dev/null 2>&1; then
  bad "dark-ground input was accepted even though derivation is not implemented"
else
  ok "dark-ground input is refused rather than guessed"
fi

sed 's/"chroma": 0.008/"chroma": 0.1/' "$EXAMPLE/brand.json" > "$TMP_DIR/chroma.json"
if python3 "$DERIVER" "$TMP_DIR/chroma.json" "$TMP_DIR/chroma-out" >/dev/null 2>&1; then
  bad "out-of-band neutral chroma was accepted"
else
  ok "out-of-band neutral chroma is refused"
fi

echo "────────────────────────────────────────"
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✔ brand-to-system: $PASS/$PASS guards passed.${RESET}"
  exit 0
fi
echo -e "${RED}${BOLD}✘ $FAIL guard failure(s); $PASS passed.${RESET}"
exit 1
