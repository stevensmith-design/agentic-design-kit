#!/bin/bash
# Guard suite for ia-review.
#
# Nested-SKILL guard (added Phase 0.1): a skill package must contain exactly ONE SKILL.md, at its
# root. A second SKILL.md nested inside the package (e.g. ia-review/ia-review/SKILL.md) silently
# diverges from the canonical copy and is never the file the loader reads. This guard fails on any
# nested SKILL.md anywhere in the skill family, so the divergent-copy bug cannot recur.
#
# Mode-contract guards (added 2026-09-10): the Mode 3 -> Mode 1 return leg, the sub-answers Mode 3
# does not produce, the re-check step, and Mode 3's worked example. All four are prose that closes a
# hole, and nothing else asserts they exist.
#
# Exit codes: 0 = clean, 1 = a nested SKILL.md was found or a mode contract regressed.

set -uo pipefail
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$TESTS_DIR/../.." && pwd)"   # repo root (family of skills)
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

FAIL=0
echo -e "${BOLD}nested-SKILL guard${RESET} (root: $ROOT)"

# A SKILL.md is "nested" if there is another SKILL.md in one of its ancestor directories,
# up to the repo root. Iterate every SKILL.md and check its ancestors.
while IFS= read -r skill; do
  dir="$(dirname "$skill")"
  parent="$(dirname "$dir")"
  while [ "$parent" != "$ROOT" ] && [ "$parent" != "/" ]; do
    if [ -f "$parent/SKILL.md" ]; then
      echo -e "  ${RED}✘ FAIL${RESET} nested SKILL.md: $skill (ancestor already has $parent/SKILL.md)"
      FAIL=$((FAIL+1))
      break
    fi
    parent="$(dirname "$parent")"
  done
done < <(find "$ROOT" -name SKILL.md -not -path '*/node_modules/*' 2>/dev/null)

if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}✔${RESET} no nested SKILL.md found."
fi

# ── Mode-contract guards ─────────────────────────────────────────────────────
# Each of these is a single line of prose that closes a real hole, and prose is what this repo
# loses silently — the 2026-09-10 vendor simulation deleted a whole section with every test green.
# Each guard below was verified to FAIL when its subject is removed; a guard that cannot fail is
# worse than none, because it reports coverage it does not have.
SKILL="$TESTS_DIR/../SKILL.md"
echo "Mode contracts:"
mc() {  # label, literal
  if grep -qF -- "$2" "$SKILL"; then
    echo -e "  ${GREEN}✔${RESET} $1"
  else
    echo -e "  ${RED}✘ FAIL${RESET} $1"; FAIL=$((FAIL+1))
  fi
}
# D7 — the return leg. Without it Mode 1 never asks whether a Mode 3 proposal exists, so a build
# that diverged from its own committed structure audits clean against the checklist.
mc "Mode 1 loads a Mode 3 proposal and diffs against it" "ask whether a structure proposal exists"
# D7 — Mode 3 returns five of Step 1's eight task-structure sub-answers. Silence about the other
# three is how irreversibility goes unscoped.
mc "Mode 3 names the three sub-answers it does not produce" "out of scope here and still owed"
# D6 — all three modes used to end at their output.
mc "the re-check step survives" "## After the fixes — re-checking"
# D5 — Mode 3's four output tables were header-only; the build-time mode had no worked deliverable.
mc "Mode 3 carries a filled worked example" "### Worked example — filled (abridged)"
mc "Mode 3 routes to the optional structure blueprints" "references/structure-blueprints.md"

if [ -f "$TESTS_DIR/../references/structure-blueprints.md" ]; then
  echo -e "  ${GREEN}✔${RESET} structure blueprint reference exists"
else
  echo -e "  ${RED}✘ FAIL${RESET} structure blueprint reference is missing"; FAIL=$((FAIL+1))
fi

echo "────────────────────────────────────────"
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✔ ia-review guards passed.${RESET}"
  exit 0
else
  echo -e "${RED}${BOLD}✘ ${FAIL} guard failure(s).${RESET}"
  exit 1
fi
