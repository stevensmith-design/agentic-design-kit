#!/usr/bin/env bash
# One canonical name per concept, across skills.
#
# Why this exists: the 2026-09-10 audit found seven concepts that went by two names, and the
# pattern in every case was the same — the canonical list lives in the file that DEFINES the
# concept, and the file the agent actually WORKS FROM carries a different one. An agent is then
# correct by one file and wrong by another, with no way to tell. Examples found:
#   · gate 4 was "Still-communicates-without-it" in rules.md and "Survives-removal" in the index
#   · the basis classes were five in one file and six in another — the missing "platform
#     convention" bucket made an iOS-44pt finding fail Correctness mechanically
#   · repair field 7 was "acceptance criteria" in two files and "Proof" in the one that owns it
#   · the coherence axes were eleven, with an output spec that asked for seven
#
# None of that is visible to a per-skill suite, because each file is internally consistent. It is
# a CROSS-SKILL invariant, so it lives here beside check-vendor-mods.sh and check-frontmatter.sh
# rather than inside any one skill's tests.
#
# Adding a concept: add a rule below. A rule is canonical-term + banned variants + where each
# applies. Keep the banned list literal — this is a vocabulary check, not a linter.
#
#   scripts/check-vocabulary.sh            verify
#   scripts/check-vocabulary.sh --self-test  prove each rule fails when its term regresses
#
# Exit codes: 0 = one name per concept, 1 = a concept has two names, 2 = unreadable tree.

set -uo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
S="$KIT/skills"
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'
[ -d "$S" ] || { echo "no skills/ at $S"; exit 2; }

FAIL=0
ok()   { echo -e "  ${GREEN}✔${RESET} $1"; }
bad()  { echo -e "  ${RED}✘${RESET} $1"; [ -n "${2:-}" ] && echo -e "      ${YELLOW}$2${RESET}"; FAIL=$((FAIL+1)); }

# must_have <label> <literal> <file...>
must_have() {
  local label="$1" lit="$2"; shift 2
  local missing=""
  for f in "$@"; do
    [ -f "$f" ] || { missing="$missing $(basename "$(dirname "$f")")/$(basename "$f") (absent)"; continue; }
    grep -qF -- "$lit" "$f" || missing="$missing $(basename "$(dirname "$f")")/$(basename "$f")"
  done
  if [ -n "$missing" ]; then
    bad "$label" "expected \"$lit\" in:$missing"
  else
    ok "$label"
  fi
}

# must_not_have <label> <literal> <dir...>  — the retired name, anywhere under these roots
must_not_have() {
  local label="$1" lit="$2"; shift 2
  local hits
  # Options BEFORE operands: BSD grep (macOS) does not parse them afterwards, which silently
  # turned an --include filter into a no-op the first time this ran. -I skips binaries. Every
  # text file is scanned, not just *.md — the first real hit this check found was in an evals.json.
  hits="$(grep -rlFI -- "$lit" "$@" 2>/dev/null | sed "s|$KIT/||" | tr '\n' ' ')"
  if [ -n "$hits" ]; then
    bad "$label" "retired term \"$lit\" still present in: $hits"
  else
    ok "$label"
  fi
}

echo -e "${BOLD}Vocabulary — one canonical name per concept${RESET}"

# 1. Tier-2 gate 4. Canonical in rules.md; the index used to disagree.
must_have "gate 4 is \"Still-communicates-without-it\" in the index and the rulebook" \
  "Still-communicates-without-it" \
  "$S/ui-design-principles/references/quick-rules.md" \
  "$S/ui-design-principles/references/rules.md" \
  "$S/ui-design-principles/SKILL.md"
must_not_have "gate 4's retired name is gone" "Survives-removal" \
  "$S/ui-design-principles" "$S/ui-design-review"

# 2. Basis classes — six, including platform convention. Owner: repair-prescriptions.md field 5.
must_have "basis classes include \"platform convention\" everywhere they are enumerated" \
  "platform convention" \
  "$S/ui-design-review/SKILL.md" \
  "$S/ui-design-review/references/repair-prescriptions.md" \
  "$S/ui-design-system/references/mode-coherence.md"

# 3. Repair contract field 7 is Proof. "acceptance criteria" survives as prose, never as the name.
must_have "repair field 7 is named \"Proof\"" "Proof" \
  "$S/ui-design-review/references/repair-prescriptions.md" \
  "$S/ui-design-review/SKILL.md" \
  "$S/ui-design-review/references/report-and-verdict.md"

# 4. Coherence axes: eleven, not seven. The output spec used to ask for seven.
must_have "the coherence audit reports eleven axes" "eleven" \
  "$S/ui-design-system/references/mode-coherence.md" \
  "$S/ui-design-system/SKILL.md"
must_not_have "the seven-axis output spec is gone" "seven-axis" "$S/ui-design-system"

# 5. Cognitive-load budget is 3–5 (en dash), owned by ia-principles.md.
must_have "the nav budget is stated as 3–5, not just an upper bound" "3–5" \
  "$S/ia-review/SKILL.md" \
  "$S/ia-review/references/ia-principles.md"

# Direction source (2026-10-05; starter routes 2026-10-14). The route names are defined in
# design-build's router and repeated where an agent works from them: the starter routes in
# starter-directions, the reference routes in direction-study, and the hyphenated forms in the two
# scripts that record routes (the build log and the guidance-load diagnostic). The vendored
# catalogue's route names retired in Phase 4 — back in any routed file, they send a build to a
# skill no route may call. The other retired phrases are the unconditional "nearest theme" and
# "catalogue first" instructions the router replaced.
for route in "reference-led" "system-led" "reference-directed" "brief-originated" "starter-led" \
             "named-starter match" "approved-direction" "product-interface"; do
  must_have "direction-source route \"$route\" is named in design-build's router" \
    "**$route**" "$S/design-build/SKILL.md"
done
for route in "starter-led" "named-starter match"; do
  must_have "starter route \"$route\" is named the same in design-build and starter-directions" \
    "**$route**" "$S/design-build/SKILL.md" "$S/starter-directions/SKILL.md"
done
for route in "reference-led" "brief-originated" "starter-led" "named-starter-match"; do
  must_have "route id \"$route\" is spelled the same by the build log and the guidance-load diagnostic" \
    "'$route'" "$S/design-build/scripts/records-lib.mjs"
  must_have "route id \"$route\" is known to the guidance-load diagnostic" \
    "\"$route\"" "$S/direction-study/scripts/guidance-load.py"
done
for retired in "Hallmark-led" "Hallmark theme match" "hallmark-led"; do
  must_not_have "the retired route \"$retired\" is gone from every routed file" "$retired" \
    "$S/design-build" "$S/direction-study" "$S/starter-directions" "$S/design-review" \
    "$KIT/docs/CLAUDE-TEMPLATE.md"
done
# Phase 5: the vendored skills are removed. No skill and no consumer template may name either —
# credit lives in NOTICE. (Guards that must name them split the word so they do not match here.)
for retired in "hallmark" "Hallmark" "impeccable" "Impeccable"; do
  must_not_have "no skill or template names the retired \"$retired\" (Phase 5)" "$retired" \
    "$S" "$KIT/docs/CLAUDE-TEMPLATE.md"
done
must_not_have "the route is \"system-led\", not \"existing-system-led\"" "existing-system-led" \
  "$S" "$KIT/docs/CLAUDE-TEMPLATE.md"
must_not_have "studied DNA is never mapped to the closest catalogue theme" \
  "Pick the closest matching theme" "$S/design-build" "$S/direction-study" "$S/starter-directions" "$KIT/docs/CLAUDE-TEMPLATE.md"
must_not_have "nothing is applied before every visual decision" \
  "before deciding anything visual" "$S/design-build" "$S/direction-study" "$S/starter-directions" "$KIT/docs/CLAUDE-TEMPLATE.md"
must_not_have "a synthesis does not hand back to a default catalogue" \
  "implementation → default Hallmark" "$S" "$KIT/docs/CLAUDE-TEMPLATE.md"

# Exploration lifecycle (2026-10-05). The study's terminal state is quoted verbatim by the skill
# that defines it, the build that routes to it, and the consumer template — one spelling.
must_have "the study's terminal state is \"STUDY — DECISION REQUIRED\" everywhere it is named" \
  "STUDY — DECISION REQUIRED" "$S/direction-study/SKILL.md" "$S/design-build/SKILL.md" \
  "$KIT/docs/CLAUDE-TEMPLATE.md"
must_not_have "reference synthesis lives in direction-study, not hallmark" \
  "reference-synthesis.md" "$S" "$KIT/docs/CLAUDE-TEMPLATE.md"
must_not_have "Hallmark is not preloaded by the consumer template" \
  "@.claude/skills/hallmark" "$KIT/docs/CLAUDE-TEMPLATE.md"

# Reference-led (2026-10-26). Live routing uses the new names. Historical fixture compatibility in
# the record parsers is intentional, so this check targets the files agents follow during work.
must_not_have "the retired live route \"reference-informed\" is gone" "reference-informed" \
  "$S/design-build/SKILL.md" "$S/design-build/references" "$S/design-build/evals" \
  "$S/direction-study/SKILL.md" "$S/direction-study/references" "$S/direction-study/evals"
must_not_have "the retired live route \"brief-derived\" is gone" "brief-derived" \
  "$S/design-build/SKILL.md" "$S/design-build/references" "$S/design-build/evals" \
  "$S/direction-study/SKILL.md" "$S/direction-study/references" "$S/direction-study/evals"

# Always-loaded files carry no theme or starter names and no catalogue compositions. A visual
# example in context is a high-weight prior; these files are in context on every task. Since Phase 4
# the same holds for every review lens, for design-build and its structure library (evals may name a
# starter: a person naming one is a case to test), for direction-study, and for every skill's
# description (descriptions are always loaded). Starter names live only in starter-directions.
NAMES='\b(Specimen|Atelier|Brutal|Newsprint|Manifesto|Midnight|Almanac|Riso|Bloom|Cobalt|Aurora|Carnival|Lumen|Quire|Tabulae|Inkspill|Placard|Nightwatch|Phosphene|Orrery|Kumquat|Waveguide|Gumball|Graticule|Velodrome|Espalier)\b'
ALWAYS="$S/design-build/SKILL.md $S/ui-design-principles/SKILL.md $S/ui-design-principles/references/quick-rules.md $KIT/docs/CLAUDE-TEMPLATE.md"
hits=$(grep -lE "$NAMES" $ALWAYS 2>/dev/null | sed "s|$KIT/||" | tr '\n' ' ')
if [ -n "$hits" ]; then bad "always-loaded files name a theme or starter" "in: $hits"
else ok "always-loaded files name no theme or starter"; fi
hits=$(grep -rlE "$NAMES" "$S/design-build/SKILL.md" "$S/design-build/references" "$S/design-build/scripts" \
  "$S/direction-study/SKILL.md" "$S/direction-study/references" "$S/design-review/SKILL.md" \
  "$S/ui-design-review/SKILL.md" "$S/ia-review/SKILL.md" 2>/dev/null | sed "s|$KIT/||" | tr '\n' ' ')
if [ -n "$hits" ]; then bad "a build, study or review file names a theme or starter" "in: $hits"
else ok "design-build (incl. its structure library), direction-study and the review skills name no theme or starter"; fi
hits=""
for f in "$S"/*/SKILL.md; do
  sed -n '/^description:/,/^metadata:/p' "$f" | grep -qE "$NAMES" && hits="$hits $(basename "$(dirname "$f")")"
done
if [ -n "$hits" ]; then bad "a skill description names a theme or starter" "in:$hits"
else ok "no skill description names a theme or starter"; fi

# The slop lens. Its verdicts are the same three words design-refine's adjudication
# uses (moved from impeccable-review in Phase 3) — one adjudication vocabulary across the ensemble — and an unrun pass is "UNVERIFIED" everywhere the
# merged findings report is read. The lens and its gate list carry no theme names at all: it
# never maps a page to a theme.
for v in "CONFIRMED SLOP" "JUSTIFIED" "NEEDS INTENT"; do
  must_have "adjudication verdict \"$v\" is spelled the same in both adjudicating lenses" "$v" \
    "$S/distinctiveness-review/SKILL.md" "$S/distinctiveness-review/references/gates.md" \
    "$S/design-refine/references/review/adjudication.md"
done
must_have "an unrun detector pass is \"UNVERIFIED\" wherever the merged report is read" "UNVERIFIED" \
  "$S/design-review/SKILL.md" "$S/distinctiveness-review/SKILL.md" "$S/ui-design-review/SKILL.md" \
  "$S/ui-design-review/scripts/detect/findings.mjs"
# The whole-product lens. Lens 3 is design-refine in its read-only lane; every file that
# names the ensemble names it the same way, and none still routes a review to impeccable-review
# (it stays on disk until Phase 5, unreachable from any review route). The caller lock and the
# finish reviewer's dispositions are spelled once, in the files that define and read them.
for f in "$S/design-review/SKILL.md" "$S/ui-design-review/SKILL.md" "$S/distinctiveness-review/SKILL.md" \
  "$S/design-build/SKILL.md" "$KIT/docs/CLAUDE-TEMPLATE.md"; do
  must_have "the whole-product lens is \"design-refine\" in $(basename "$(dirname "$f")")/$(basename "$f")" \
    "design-refine" "$f"
done
must_not_have "no review route names impeccable-review" "impeccable-review" \
  "$S/design-review" "$S/ui-design-review/SKILL.md" "$S/distinctiveness-review" "$S/design-build" \
  "$S/design-refine" "$KIT/docs/CLAUDE-TEMPLATE.md"
must_have "the caller lock is \"Locked read-only by\" in the skill that defines it and the checker" \
  "Locked read-only by" "$S/design-refine/SKILL.md" "$S/design-refine/scripts/check-report.mjs"
for d in "ship" "fix" "rebuild" "recapture"; do
  must_have "finish disposition \"$d\" is spelled the same in the finish reviewer and the edit protocol" \
    "**$d**" "$S/design-refine/references/review/finish-review.md" "$S/design-refine/references/edit/apply.md"
done
must_have "an unrun detector pass is \"UNVERIFIED\" in design-refine's evaluation too" "UNVERIFIED" \
  "$S/design-refine/references/review/evaluate.md" "$S/design-refine/scripts/check-report.mjs"
hits=$(grep -lE "$NAMES" \
  "$S/design-refine/SKILL.md" "$S"/design-refine/references/*/*.md 2>/dev/null | sed "s|$KIT/||" | tr '\n' ' ')
if [ -n "$hits" ]; then bad "design-refine names a theme or starter" "in: $hits"
else ok "design-refine and its references name no theme or starter"; fi

hits=$(grep -lE "$NAMES" \
  "$S/distinctiveness-review/SKILL.md" "$S"/distinctiveness-review/references/*.md 2>/dev/null | sed "s|$KIT/||" | tr '\n' ' ')
if [ -n "$hits" ]; then bad "the slop lens names a theme or starter" "in: $hits"
else ok "the slop lens and its gate list name no theme or starter"; fi

echo "────────────────────────────────────────"
if [ "$FAIL" -ne 0 ]; then
  echo -e "${RED}${BOLD}✘ ${FAIL} concept(s) go by more than one name.${RESET}"
  echo "  A per-skill suite cannot see this: each file is internally consistent and they disagree"
  echo "  with each other. Pick the name in the file that DEFINES the concept and quote it verbatim."
  exit 1
fi
echo -e "${GREEN}${BOLD}✔ one name per concept across the kit.${RESET}"
exit 0
