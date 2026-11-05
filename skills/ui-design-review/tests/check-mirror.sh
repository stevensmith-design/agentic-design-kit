#!/bin/bash
# Mirror invariant guard (Invariant 2 / Phase 0.4).
#
# Some references are INTENTIONAL byte-for-byte mirrors: each skill ships a self-contained copy so it
# loads without a sibling present. They must never drift. This guard fails if any mirrored pair
# differs (or a copy is missing). When a mirrored file needs a change, edit ONE copy and re-mirror
# the other (cp), then this guard passes again.
#
# Guarded mirrors (path is relative to the design_skills root):
#   1. rules.md                ui-design-review/references  ↔  ui-design-principles/references
#
# A matching pointer note lives at the top of each mirrored file; this script is the enforced check.
#
# Exit codes: 0 = every pair identical, 1 = drift (or a copy is missing) in at least one pair.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$TESTS_DIR/../.." && pwd)"
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

# label | copy A (rel) | copy B (rel)
MIRRORS=(
  "rules.md|ui-design-review/references/rules.md|ui-design-principles/references/rules.md"
)

DRIFT=0
for entry in "${MIRRORS[@]}"; do
  IFS='|' read -r label rela relb <<< "$entry"
  A="$ROOT/$rela"; B="$ROOT/$relb"
  missing=0
  for f in "$A" "$B"; do
    if [ ! -f "$f" ]; then
      echo -e "  ${RED}✘ FAIL${RESET} ($label) mirror copy missing: $f"; missing=1; fi
  done
  if [ "$missing" -eq 1 ]; then DRIFT=1; continue; fi
  if diff -q "$A" "$B" >/dev/null 2>&1; then
    echo -e "  ${GREEN}✔${RESET} $label mirror is byte-identical."
  else
    echo -e "  ${RED}✘ FAIL${RESET} $label mirror DRIFT — the two copies differ:"
    diff "$A" "$B" | head -40
    echo "    Fix: edit one copy, then re-mirror the other (cp) so both are byte-identical."
    DRIFT=1
  fi
done

if [ "$DRIFT" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✔ all mirrors byte-identical.${RESET}"
  exit 0
else
  echo -e "${RED}${BOLD}✘ mirror invariant failed.${RESET}"
  exit 1
fi
