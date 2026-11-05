#!/bin/bash
# Cross-skill behavioural parity: replacements must occupy V1 integration points without moving
# contracts, detectors or catalogues ahead of reference-led creative exploration.
set -uo pipefail
KIT="$(cd "$(dirname "$0")/.." && pwd)"; FAIL=0
ok(){ printf '  ✔ %s\n' "$1"; }; bad(){ printf '  ✘ %s\n' "$1"; FAIL=$((FAIL+1)); }
line(){ grep -nF "$2" "$1" | head -1 | cut -d: -f1; }
has(){ tr '\n' ' ' < "$1" | tr -s ' ' | grep -qiF "$2"; }

DS="$KIT/skills/direction-study/SKILL.md"
DB="$KIT/skills/design-build/SKILL.md"
DR="$KIT/skills/design-review/SKILL.md"
DD="$KIT/skills/distinctiveness-review/SKILL.md"
RF="$KIT/skills/design-refine/SKILL.md"
ST="$KIT/skills/starter-directions/SKILL.md"
US="$KIT/skills/ui-design-system/references/mode-create.md"
BS="$KIT/skills/brand-to-system/SKILL.md"
CT="$KIT/docs/CLAUDE-TEMPLATE.md"

r=$(line "$DS" "Study the originals and assign bounded responsibilities")
d=$(line "$DS" "Write a lightweight creative brief and propose directions")
c=$(line "$DS" "Freeze provisional contracts after exploration")
p=$(line "$DS" "Build narrow visual proofs")
v=$(line "$DS" "Review similarity, resonance and provenance after the visual exploration")
if [ -n "$r" ] && [ -n "$d" ] && [ -n "$c" ] && [ -n "$p" ] && [ -n "$v" ] \
  && [ "$r" -lt "$d" ] && [ "$d" -lt "$c" ] && [ "$c" -lt "$p" ] && [ "$p" -lt "$v" ]; then
  ok "reference-led creative order matches V1"
else bad "reference-led creative order drifted"; fi

has "$DS" "originals remain directly viewable" && has "$DB" "direct inputs, not abstractions" \
  && ok "original references reach study and implementation" \
  || bad "original references are replaced by abstractions"

has "$CT" "keeps them available through study, direction generation and proof-building" \
  && ! grep -qiE 'references are inspected in isolation|only abstract findings reach|never sit in the context' "$CT" \
  && ok "consumer wiring keeps original references in creative context" \
  || bad "consumer wiring still quarantines or abstracts original references"

for producer in "$DS" "$DB" "$ST"; do
  has "$producer" "INVALID — EXTERNAL DESIGN SKILL ACTIVE" \
    || bad "$(basename "$(dirname "$producer")") lacks the external-producer stop"
done
has "$CT" "INVALID — EXTERNAL DESIGN SKILL ACTIVE" \
  && ok "consumer wiring stops external design producers before generation" \
  || bad "consumer wiring permits an external design producer"

has "$DS" "rejecting every direction and requesting a rerun" \
  && ok "reject-all/rerun outcome survives" || bad "reject-all/rerun outcome missing"

rl=$(line "$DR" "## 2 · Invoke the independent lenses")
rv=$(line "$DR" "## 4 · Verify load-bearing claims")
[ -n "$rl" ] && [ -n "$rv" ] && [ "$rl" -lt "$rv" ] \
  && ok "independent lenses precede detector synthesis" \
  || bad "detector synthesis precedes independent lenses"

has "$DR" "/distinctiveness-review" && has "$DR" "/design-refine" \
  && ok "first-party audit and refinement replacements are wired into review" \
  || bad "a first-party replacement is missing from review"

look=$(line "$DD" "## 1 · Look before machine evidence")
machine=$(line "$DD" "After that first-pass judgement")
[ -n "$look" ] && [ -n "$machine" ] && [ "$look" -lt "$machine" ] \
  && ok "distinctiveness judgement is not detector-anchored" \
  || bad "distinctiveness judgement is detector-anchored"

has "$RF" "Review lane" && has "$RF" "locked read-only" \
  && ok "refinement replacement preserves read-only review integration" \
  || bad "refinement review authority drifted"

has "$ST" "Never:" && has "$ST" "reference-led" \
  && ok "starter catalogue stays out of reference-led work" \
  || bad "starter catalogue may influence reference-led work"

has "$US" "examples below describe roles and relationships, not a house style" \
  && ! grep -qF "never glow" "$US" \
  && ! grep -qF "Derive all neutrals" "$US" \
  && ok "system creation does not impose the removed house style" \
  || bad "system creation still imposes a house style"

has "$DB" "must not override a reference-led or human-approved direction" \
  && has "$BS" "agree with the human-approved or reference-led direction" \
  && ok "machine brand derivation is subordinate to accepted direction" \
  || bad "machine brand derivation may override accepted direction"

if [ "$FAIL" -gt 0 ]; then
  printf '✘ replacement parity failed: %s issue(s)\n' "$FAIL"
  exit 1
fi
printf '✔ replacement parity passed\n'
