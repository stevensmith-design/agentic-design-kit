#!/bin/bash
# Fixture tests for scan.sh.
#   tests/flag/*   — MUST produce ≥1 violation AND fire the intended rule (true positives)
#   tests/clean/*  — MUST produce 0 violations (false-positive guards)
#
# F6: flag fixtures now assert the *intended* rule fired, not merely that some rule did.
# The expected rule substring per flag fixture is in tests/expected.tsv. A flag fixture with
# no manifest entry falls back to exit-only and is reported as UNSPECIFIED (still a pass, but
# it should get an entry). This makes the suite a real regression lock: a change that breaks
# the intended detector but leaves an unrelated one firing now fails.
#
# Every scan.sh change must pass this suite before it is deployed or promoted. Each fixture is
# scanned in an isolated temp dir OUTSIDE any git repo, so the project's scan-exceptions.conf
# cannot mask or leak into a result — the suite tests scan.sh itself, not a project's overrides.
#
# Exit codes: 0 = all fixtures behaved as expected, 1 = at least one regression.

set -uo pipefail

TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
SCAN="$TESTS_DIR/../scripts/scan.sh"
MANIFEST="$TESTS_DIR/expected.tsv"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

PASS=0
FAIL=0

expected_rule() {   # basename -> expected substring (empty if none)
  [ -f "$MANIFEST" ] || return 0
  awk -F '\t' -v b="$1" '!/^#/ && $1==b {print $2; exit}' "$MANIFEST"
}

run_one() {
  local fixture="$1" expect="$2"   # expect = "flag" or "clean"
  local tmp; tmp="$(mktemp -d)"
  cp "$fixture" "$tmp/"
  local base; base="$(basename "$fixture")"
  local out; out="$(cd "$tmp" && bash "$SCAN" "$base" 2>/dev/null)"
  local code=$?
  rm -rf "$tmp"

  if [ "$expect" = "flag" ]; then
    if [ "$code" -ne 1 ]; then
      echo -e "  ${RED}✘ FAIL${RESET} expected a violation, got none: $base"
      FAIL=$((FAIL+1)); return
    fi
    local want; want="$(expected_rule "$base")"
    if [ -z "$want" ]; then
      echo -e "  ${YELLOW}~ UNSPECIFIED${RESET} $base flagged (add an expected.tsv entry to lock the rule)"
      PASS=$((PASS+1)); return
    fi
    if printf '%s' "$out" | grep -qF "Rule:  $want" || printf '%s' "$out" | grep -qF "$want"; then
      PASS=$((PASS+1))
    else
      echo -e "  ${RED}✘ FAIL${RESET} $base flagged, but not via intended rule '${want}'"
      echo -e "         fired: $(printf '%s' "$out" | grep 'Rule:' | sed 's/^ *//' | paste -sd'; ' -)"
      FAIL=$((FAIL+1))
    fi
  else
    if [ "$code" -eq 0 ]; then
      PASS=$((PASS+1))
    else
      echo -e "  ${RED}✘ FAIL${RESET} false positive (expected clean): $base"
      FAIL=$((FAIL+1))
    fi
  fi
}

echo -e "${BOLD}scan.sh fixture suite${RESET}"

echo "True positives (must flag via the intended rule):"
for f in "$TESTS_DIR"/flag/*; do [ "$(basename "$f")" = "expected.tsv" ] && continue; run_one "$f" flag; done

echo "False-positive guards (must stay clean):"
for f in "$TESTS_DIR"/clean/*; do run_one "$f" clean; done

# ── Exception governance (F7): each governance/ fixture is a mini-project
# (scan-exceptions.conf + DESIGN.md + sample.css). Copied OUTSIDE the git repo so
# `git rev-parse` can't resolve to the real project root. Dir prefix fail-* expects
# exit 1 (governance violation), pass-* expects exit 0.
run_gov() {
  local dir="$1" expect="$2" base; base="$(basename "$dir")"
  local tmp; tmp="$(mktemp -d)"; cp -r "$dir"/* "$tmp/" 2>/dev/null
  # A fixture may name its scan target in a `target` file (default: the whole mini-project).
  local tgt="."; [ -f "$dir/target" ] && tgt="$(cat "$dir/target")"
  ( cd "$tmp" && bash "$SCAN" "$tgt" >/dev/null 2>&1 ); local code=$?
  rm -rf "$tmp"
  local want; [ "$expect" = "fail" ] && want=1 || want=0
  if [ "$code" -eq "$want" ]; then PASS=$((PASS+1))
  else echo -e "  ${RED}✘ FAIL${RESET} governance $base: expected exit $want, got $code"; FAIL=$((FAIL+1)); fi
}
if [ -d "$TESTS_DIR/governance" ]; then
  echo "Exception governance (scan-exceptions.conf ↔ DESIGN.md):"
  for d in "$TESTS_DIR"/governance/*/; do
    case "$(basename "$d")" in
      fail-*) run_gov "$d" fail;;
      pass-*) run_gov "$d" pass;;
    esac
  done
fi

# ── Severity tiers (F8): default mode flags everything (exit 1); --tiered gates on
# ERROR/REVIEW only, so a RISK-only file passes --tiered (exit 0). Filename prefix =
# expected --tiered outcome: error-* / review-* => exit 1, risk-only-* => exit 0.
# Every tiered fixture must still exit 1 in default mode (backward compatibility).
run_tiered() {
  local fixture="$1" expect="$2" base; base="$(basename "$fixture")"
  local tmp; tmp="$(mktemp -d)"; cp "$fixture" "$tmp/"
  ( cd "$tmp" && bash "$SCAN" "$base" >/dev/null 2>&1 ); local dcode=$?
  ( cd "$tmp" && bash "$SCAN" "$base" --tiered >/dev/null 2>&1 ); local tcode=$?
  rm -rf "$tmp"
  local want; [ "$expect" = "fail" ] && want=1 || want=0
  if [ "$dcode" -ne 1 ]; then
    echo -e "  ${RED}✘ FAIL${RESET} tiered $base: default mode must still exit 1, got $dcode"; FAIL=$((FAIL+1)); return; fi
  if [ "$tcode" -eq "$want" ]; then PASS=$((PASS+1))
  else echo -e "  ${RED}✘ FAIL${RESET} tiered $base: --tiered expected exit $want, got $tcode"; FAIL=$((FAIL+1)); fi
}
if [ -d "$TESTS_DIR/tiered" ]; then
  echo "Severity tiers (--tiered gates on ERROR/REVIEW; RISK advisory):"
  for f in "$TESTS_DIR"/tiered/*; do
    case "$(basename "$f")" in
      error-*|review-*) run_tiered "$f" fail;;
      risk-only-*)      run_tiered "$f" pass;;
    esac
  done
fi

echo "────────────────────────────────────────"
# The fixture tally (scanner behavior) is frozen at 44/44 and is reported here UNCHANGED. The
# invariant guards below (Phase 0) gate the exit code additively but never alter this count.
FIXTURE_FAIL="$FAIL"
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✔ ${PASS}/${PASS} fixtures behaved as expected.${RESET}"
else
  echo -e "${RED}${BOLD}✘ ${FAIL} regression(s); ${PASS} passed.${RESET}"
fi

# ── Invariant guards (additive; do not touch the fixture tally above) ──
GUARD_FAIL=0
# Mirror invariant (Phase 0.4): rules.md byte-identical across the two skills.
if [ -f "$TESTS_DIR/check-mirror.sh" ]; then
  echo "Mirror invariant (rules.md byte-identity, ui-design-review ↔ ui-design-principles):"
  bash "$TESTS_DIR/check-mirror.sh" || GUARD_FAIL=$((GUARD_FAIL+1))
fi
# ── D5: the worked example must satisfy the contract it teaches ──────────────
# It is labelled Major, and repair-prescriptions.md requires the full eight fields for a material
# finding. It previously showed three. Agents imitate the example, not the rule — so an
# under-specified example silently lowers the bar on every material finding the skill produces.
echo "Worked example satisfies the eight-field repair contract:"
wex_missing=""
for f in Cause Preserve Change Scope Why How Proof Uncertainty; do
  grep -qE "^> - \*\*$f\*\*" "$TESTS_DIR/../SKILL.md" || wex_missing="$wex_missing $f"
done
if [ -n "$wex_missing" ]; then
  echo -e "  ${RED}✘${RESET} the Major worked example is missing field(s):$wex_missing"
  GUARD_FAIL=$((GUARD_FAIL+1))
else
  echo -e "  ${GREEN}✔${RESET} all eight fields present in the worked example."
fi

# Git-mode guard: --staged / --diff must REFUSE outside a usable git repo, not report a clean pass.
# Why this exists: git's failure went to stderr, the file list came back empty, and the empty-list
# branch printed "✔ No frontend files to scan." with exit 0. A review of a non-git directory —
# which SKILL.md tells agents to run — reported a clean scan over files that were never scanned.
# That is the silent-pass class check 20v exists to prevent, inside the scanner that prevents it.
# The fixture suite above never caught it because it only ever exercises the positional-path mode.
echo "Git-mode guard (--staged / --diff refuse outside a usable repo):"
gitguard_tmp="$(mktemp -d)"
cp "$TESTS_DIR/flag/01-gradient-button.css" "$gitguard_tmp/" 2>/dev/null || true
gg_fail=0
gg_case() {  # label, expected_code, args...
  local label="$1" want="$2"; shift 2
  local out code
  out="$(cd "$gitguard_tmp" && bash "$SCAN" "$@" 2>&1)"; code=$?
  if [ "$code" -eq "$want" ]; then
    echo -e "  ${GREEN}✔${RESET} $label — exit $code"
  else
    echo -e "  ${RED}✘${RESET} $label — expected exit $want, got $code"
    printf '%s\n' "$out" | head -2 | sed 's|^|      |'
    gg_fail=$((gg_fail+1))
  fi
}
gg_case "--staged outside a git repo"        2 --staged
gg_case "--diff outside a git repo"          2 --diff main
gg_case "positional path still scans"        1 01-gradient-button.css
# Multi-target guard (Phase 6, real use): `scan.sh a.html b.css` scanned only `a.html` and passed.
# A consumer's DESIGN.md told agents to run exactly that line, so styles.css was never scanned and
# every run reported clean. Every positional target must be scanned.
cp "$TESTS_DIR/clean/06-focus-ring.css" "$gitguard_tmp/" 2>/dev/null || true
gg_case "every positional target is scanned"  1 06-focus-ring.css 01-gradient-button.css
rm -rf "$gitguard_tmp"
if [ "$gg_fail" -ne 0 ]; then GUARD_FAIL=$((GUARD_FAIL+gg_fail)); fi

# Nested-SKILL guard (Phase 0.1): no skill package may contain a nested SKILL.md.
# This check lives in ia-review's suite and is family-wide, so it is delegated rather than copied.
# Scope the delegation to THAT verdict only: ia-review's suite also carries its own mode contracts
# now, and a broken ia-review Mode 3 example is not a ui-design-review regression. Coupling the two
# would make this suite go red for a defect in a sibling, which sends the next person to the wrong
# file. (Before this narrowing, the publish gate reported ui-design-review's result as
# "ia-review guards passed" — a suite summary attributed to the wrong skill.)
if [ -f "$TESTS_DIR/../../ia-review/tests/run.sh" ]; then
  echo "Nested-SKILL guard (family-wide, delegated to ia-review):"
  nested_out="$(bash "$TESTS_DIR/../../ia-review/tests/run.sh" 2>&1)"
  if printf '%s' "$nested_out" | grep -q "nested SKILL.md found\."; then
    echo -e "  ${GREEN}✔${RESET} no nested SKILL.md found."
  else
    echo -e "  ${RED}✘${RESET} nested SKILL.md detected:"
    printf '%s\n' "$nested_out" | sed 's/\x1b\[[0-9;]*m//g' | grep -F "nested SKILL.md:" | head -4 | sed 's|^|      |'
    GUARD_FAIL=$((GUARD_FAIL+1))
  fi
fi

# Rendered-check fixtures. These are the checks that need a REAL RENDER: declared-vs-rendered
# padding and composited contrast cannot be read out of a stylesheet, which is precisely why the
# defects they catch survive a clean scan.sh AND a clean validate-tokens.py (see rules.md →
# Optical alignment, "Declared padding is not rendered padding"; and visual-checklist.md §3 on
# composited pairs). The kit carries no browser dependency, so a missing browser SKIPS — but a
# present browser that disagrees with a fixture is a real regression.
#
# To add a rendered check (B2 tap-target geometry, B7 focus under sticky chrome, …): drop the
# script in ../scripts, add its two fixtures under tests/measure/, and add one line here.
if command -v node >/dev/null 2>&1; then
  echo "Rendered-check fixtures:"
  render_skipped=0
  #        script                  clean fixture                     flag fixture
  for spec in \
    "measure-padding.mjs|clean-padding-intact.html|flag-padding-eaten.html|padding survives at render|padding loss" \
    "measure-contrast.mjs|clean-contrast-composited.html|flag-contrast-composited.html|composited contrast clears|contrast failure" ; do
    IFS='|' read -r rc_script rc_clean rc_flag rc_cleanmsg rc_flagmsg <<< "$spec"
    rc_path="$TESTS_DIR/../scripts/$rc_script"
    [ -f "$rc_path" ] || continue
    node "$rc_path" "$TESTS_DIR/measure/$rc_clean" >/dev/null 2>&1; rc_c=$?
    node "$rc_path" "$TESTS_DIR/measure/$rc_flag"  >/dev/null 2>&1; rc_f=$?
    if [ "$rc_c" -eq 2 ] || [ "$rc_f" -eq 2 ]; then
      render_skipped=1
      continue
    fi
    if [ "$rc_c" -eq 0 ]; then
      echo -e "  ${GREEN}✔${RESET} ${rc_script%.mjs}: clean fixture — $rc_cleanmsg."
    else
      echo -e "  ${RED}✘${RESET} ${rc_script%.mjs}: clean fixture flagged (false positive)."
      GUARD_FAIL=$((GUARD_FAIL+1))
    fi
    if [ "$rc_f" -eq 1 ]; then
      echo -e "  ${GREEN}✔${RESET} ${rc_script%.mjs}: flag fixture — $rc_flagmsg detected."
    else
      echo -e "  ${RED}✘${RESET} ${rc_script%.mjs}: flag fixture NOT detected (exit $rc_f) — detector is blind."
      GUARD_FAIL=$((GUARD_FAIL+1))
    fi
  done
  if [ "$render_skipped" -eq 1 ]; then
    echo -e "  ${YELLOW}–${RESET} some rendered checks SKIPPED (no headless browser available)."
  fi
fi

# Static detector (scripts/detect/). The kit's own zero-dependency HTML/CSS anti-pattern engine;
# its suite asserts every flag fixture fires exactly its own rule and every clean fixture fires
# nothing. Node is required: a detector that did not run is not a clean result.
echo "Static detector fixtures:"
if command -v node >/dev/null 2>&1; then
  det_out="$(node "$TESTS_DIR/../scripts/detect/tests/run.mjs" 2>&1)"; det_rc=$?
  if [ "$det_rc" -eq 0 ]; then
    echo -e "  ${GREEN}✔${RESET} $(printf '%s' "$det_out" | tail -1 | sed 's/\x1b\[[0-9;]*m//g; s/^✔ //')"
  else
    printf '%s\n' "$det_out" | sed 's/\x1b\[[0-9;]*m//g' | grep '✘' | head -8 | sed 's|^|  |'
    GUARD_FAIL=$((GUARD_FAIL+1))
  fi
else
  echo -e "  ${RED}✘${RESET} node not found — detect suite NOT run (UNVERIFIED, not clean)."
  GUARD_FAIL=$((GUARD_FAIL+1))
fi

# Browser pass (scripts/detect/browser.mjs). Same fixture contract as the static detector, run
# in whatever Chromium-based browser is installed (CHROME_PATH wins; chrome-headless-shell is
# preferred). No browser → SKIPPED, reported as UNVERIFIED, never as a pass. A browser that
# disagrees with a fixture is a real regression.
echo "Browser-pass fixtures:"
if command -v node >/dev/null 2>&1; then
  br_out="$(node "$TESTS_DIR/../scripts/detect/tests/browser.mjs" 2>&1)"; br_rc=$?
  if [ "$br_rc" -eq 0 ]; then
    echo -e "  ${GREEN}✔${RESET} $(printf '%s' "$br_out" | tail -1 | sed 's/\x1b\[[0-9;]*m//g; s/^✔ //')"
  elif [ "$br_rc" -eq 2 ]; then
    echo -e "  ${YELLOW}–${RESET} browser-pass fixtures SKIPPED (no Chromium-based browser; set CHROME_PATH) — UNVERIFIED."
  else
    printf '%s\n' "$br_out" | sed 's/\x1b\[[0-9;]*m//g' | grep '✘' | head -8 | sed 's|^|  |'
    GUARD_FAIL=$((GUARD_FAIL+1))
  fi
fi

# Findings merge (scripts/detect/findings.mjs) — the one report /design-review reads. Stubbed
# runners cover every exit-code pair; a missing browser must surface as UNVERIFIED, never clean.
echo "Findings merge:"
if command -v node >/dev/null 2>&1; then
  fm_out="$(node "$TESTS_DIR/../scripts/detect/tests/findings.mjs" 2>&1)"; fm_rc=$?
  if [ "$fm_rc" -eq 0 ]; then
    echo -e "  ${GREEN}✔${RESET} $(printf '%s' "$fm_out" | tail -1 | sed 's/\x1b\[[0-9;]*m//g; s/^✔ //')"
  else
    printf '%s\n' "$fm_out" | sed 's/\x1b\[[0-9;]*m//g' | grep '✘' | head -8 | sed 's|^|  |'
    GUARD_FAIL=$((GUARD_FAIL+1))
  fi
fi

echo "────────────────────────────────────────"
if [ "$FIXTURE_FAIL" -eq 0 ] && [ "$GUARD_FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✔ ui-design-review: ${PASS}/${PASS} fixtures + all guards passed.${RESET}"
  exit 0
else
  echo -e "${RED}${BOLD}✘ ui-design-review: ${FIXTURE_FAIL} fixture regression(s), ${GUARD_FAIL} guard failure(s).${RESET}"
  exit 1
fi
