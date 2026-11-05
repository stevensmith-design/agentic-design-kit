#!/bin/bash
# ui-design-review — code scan script
# Checks frontend files for banned UI patterns.
# Usage:
#   scan.sh <file-or-dir>...    Scan one or more files or directories
#   scan.sh --staged            Scan git staged files
#   scan.sh --diff <branch>     Scan diff against a branch (e.g. main)
#   (add --tiered to gate on ERROR/REVIEW only; RISK becomes advisory)
#
# Exit codes: 0 = pass, 1 = violations found, 2 = cannot scan (not a git repository, or a
#             --diff branch that does not resolve). 2 exists because the alternative is a
#             clean pass over files that were never read — see the git preflight below.

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BOLD='\033[1m'
RESET='\033[0m'

VIOLATIONS=0
ERRORS=0        # Tier-1 quality/a11y defects (F8)
REVIEWS=0       # Tier-2 gate-able patterns needing a documented rationale
RISKS=0         # Tier-3 co-occurrence risk indicators (advisory)
PRINTED=0
MAX_PRINT=100   # display-only cap: every match is still COUNTED; only printed detail is capped
TIERED=0        # --tiered: only ERROR/REVIEW fail CI; RISK is advisory
FILES=()

# Extract --tiered from anywhere in the args (leave positional target intact).
_args=()
for a in "$@"; do
  if [ "$a" = "--tiered" ]; then TIERED=1; else _args+=("$a"); fi
done
set -- ${_args[@]+"${_args[@]}"}

# ── Collect files to scan ──────────────────────────────────────────────────────

collect_files() {
  local target="$1"
  if [ -f "$target" ]; then
    FILES+=("$target")
  elif [ -d "$target" ]; then
    while IFS= read -r f; do
      FILES+=("$f")
    done < <(find "$target" -mindepth 1 \( -type d \( -name node_modules -o -name .git \
      -o -name .agentic-design-kit \) -prune \) -o \( -type f \( -name "*.tsx" -o -name "*.ts" \
      -o -name "*.vue" -o -name "*.css" -o -name "*.scss" -o -name "*.html" \
      -o -name "*.jsx" -o -name "*.js" \) -print \))
  fi
}

if [ $# -eq 0 ]; then
  echo "Usage: scan.sh <file-or-dir>... | --staged | --diff <branch>"
  exit 1
fi

# ── Git preflight ─────────────────────────────────────────────────────────────
# --staged and --diff read the index and history. When git cannot answer — there is no
# repository, or the branch does not resolve — its error goes to stderr and the file list comes
# back EMPTY, which is indistinguishable from "nothing to scan" and exits 0. A green PASS over
# files that were never read is the silent-pass this scanner exists to prevent (cf. check 20v),
# so refuse with exit 2 and say which mode to use instead.
require_git_repo() {
  git rev-parse --git-dir >/dev/null 2>&1 && return 0
  echo -e "${RED}✘ Not a git repository${RESET} — \`$1\` reads the index/history and there is none here." >&2
  echo "  Scan a path directly instead:  scan.sh <file-or-directory>" >&2
  exit 2
}

case "$1" in
  --staged)
    require_git_repo --staged
    while IFS= read -r f; do
      case "$f" in .agentic-design-kit/*|*/.agentic-design-kit/*) continue;; esac
      [[ "$f" =~ \.(tsx|ts|vue|css|scss|html|jsx|js)$ ]] && FILES+=("$f")
    done < <(git diff --cached --name-only --diff-filter=ACM)
    ;;
  --diff)
    require_git_repo --diff
    BRANCH="${2:-main}"
    if ! git rev-parse --verify --quiet "$BRANCH" >/dev/null 2>&1; then
      echo -e "${RED}✘ Branch '$BRANCH' does not resolve${RESET} — nothing to diff against." >&2
      echo "  Name a branch that exists, or scan a path:  scan.sh <file-or-directory>" >&2
      exit 2
    fi
    while IFS= read -r f; do
      case "$f" in .agentic-design-kit/*|*/.agentic-design-kit/*) continue;; esac
      [[ "$f" =~ \.(tsx|ts|vue|css|scss|html|jsx|js)$ ]] && [ -f "$f" ] && FILES+=("$f")
    done < <(git diff --name-only "$BRANCH"...HEAD --diff-filter=ACM)
    ;;
  *)
    # Every positional target, not only the first: `scan.sh index.html styles.css` once scanned
    # index.html alone and passed, so the stylesheet was never read (Phase 6 real use).
    for t in "$@"; do collect_files "$t"; done
    ;;
esac

if [ ${#FILES[@]} -eq 0 ]; then
  echo -e "${GREEN}✔ No frontend files to scan.${RESET}"
  exit 0
fi

# ── Project exceptions (portable) ──────────────────────────────────────────────
# Optional per-project file: scan-exceptions.conf at the git root (or cwd).
# One extended-regex per line; '#' starts a comment. A flagged line matching any
# pattern is skipped. Every entry must correspond to a DESIGN.md override-log
# entry — this file is the scanner-side mirror of documented overrides.
EXCEPTIONS=()
EXC_IDS=()   # parallel to EXCEPTIONS: the "# id: <slug>" governing each pattern ("" if none)
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
pending_id=""
if [ -f "$ROOT/scan-exceptions.conf" ]; then
  while IFS= read -r raw; do
    # A standalone "# id: slug" comment governs the next pattern line.
    if printf '%s' "$raw" | grep -qE '^[[:space:]]*#[[:space:]]*id:[[:space:]]*[A-Za-z0-9_-]+[[:space:]]*$'; then
      pending_id=$(printf '%s' "$raw" | sed -E 's/^[[:space:]]*#[[:space:]]*id:[[:space:]]*([A-Za-z0-9_-]+).*/\1/')
      continue
    fi
    inline_id=""
    if printf '%s' "$raw" | grep -qE '#[[:space:]]*id:[[:space:]]*[A-Za-z0-9_-]+'; then
      inline_id=$(printf '%s' "$raw" | sed -E 's/.*#[[:space:]]*id:[[:space:]]*([A-Za-z0-9_-]+).*/\1/')
    fi
    pat="${raw%%#*}"
    pat="$(printf '%s' "$pat" | sed -e 's/[[:space:]]*$//')"
    if [ -n "$pat" ]; then
      EXCEPTIONS+=("$pat")
      if [ -n "$inline_id" ]; then EXC_IDS+=("$inline_id"); else EXC_IDS+=("$pending_id"); fi
      pending_id=""
    fi
  done < "$ROOT/scan-exceptions.conf"
fi

# ── Exception governance (F7) ──────────────────────────────────────────────────
# Every active scan-exception must carry a "# id: <slug>" that mirrors a DESIGN.md override-log
# entry. An undocumented or orphaned exception silently suppresses findings, so it is itself a
# violation (counted below, before the file loop). Verified only when a DESIGN.md exists.
DESIGN_MD=""
# The target's own system first: walk up from the scanned path to the nearest DESIGN.md, so a scan
# run from a parent folder is not judged against another page's system (observed 2026-10-14).
# Then the project root, as before.
_find_design_up() {
  local d="$1"
  [ -f "$d" ] && d="$(dirname "$d")"
  d="$(cd "$d" 2>/dev/null && pwd)" || return 1
  while [ -n "$d" ]; do
    for n in DESIGN.md design-system.md DESIGN_SYSTEM.md; do
      [ -f "$d/$n" ] && { printf '%s' "$d/$n"; return 0; }
    done
    [ "$d" = "$ROOT" ] || [ "$d" = "/" ] && return 1
    d="$(dirname "$d")"
  done
  return 1
}
case "${1:-}" in
  --staged|--changed|--since|-*|"") ;;
  *) [ -e "$1" ] && DESIGN_MD="$(_find_design_up "$1" || true)";;
esac
if [ -z "$DESIGN_MD" ]; then
  for cand in "$ROOT/DESIGN.md" "$ROOT/design-system.md" "$ROOT/DESIGN_SYSTEM.md"; do
    [ -f "$cand" ] && { DESIGN_MD="$cand"; break; }
  done
fi

is_excepted() {
  local line="$1" pat
  for pat in ${EXCEPTIONS[@]+"${EXCEPTIONS[@]}"}; do
    if printf '%s' "$line" | grep -qE "$pat"; then
      return 0
    fi
  done
  return 1
}

echo -e "${BOLD}UI Design Review — Code Scan${RESET}"
echo -e "Scanning ${#FILES[@]} file(s)...\n"

if [ ${#EXCEPTIONS[@]} -gt 0 ] && [ -z "$DESIGN_MD" ]; then
  # Ungoverned exceptions: a scan-exceptions.conf with no DESIGN.md can silently suppress
  # findings with nothing to audit it against. That is itself an ERROR (F7/#3).
  VIOLATIONS=$((VIOLATIONS + 1)); ERRORS=$((ERRORS + 1))
  echo -e "  ${RED}✘${RESET} ${BOLD}scan-exceptions.conf${RESET}  [ERROR]"
  echo -e "    Rule:  Ungoverned scan-exceptions (no DESIGN.md)"
  echo -e "    Found: ${YELLOW}${#EXCEPTIONS[@]} exception pattern(s) with no DESIGN.md override log${RESET}"
  echo -e "    Fix:   add a DESIGN.md with an override log so every '# id: <slug>' can be verified\n"
fi
if [ ${#EXCEPTIONS[@]} -gt 0 ] && [ -n "$DESIGN_MD" ]; then
  gi=0
  for pat in "${EXCEPTIONS[@]}"; do
    id="${EXC_IDS[$gi]}"; gi=$((gi+1))
    if [ -z "$id" ]; then
      VIOLATIONS=$((VIOLATIONS + 1)); ERRORS=$((ERRORS + 1))
      echo -e "  ${RED}✘${RESET} ${BOLD}scan-exceptions.conf${RESET}"
      echo -e "    Rule:  Undocumented scan-exception (no id)"
      echo -e "    Found: ${YELLOW}${pat}${RESET}"
      echo -e "    Fix:   add '# id: <slug>' and a matching ${DESIGN_MD##*/} override-log entry\n"
    elif ! grep -qF "$id" "$DESIGN_MD"; then
      VIOLATIONS=$((VIOLATIONS + 1)); ERRORS=$((ERRORS + 1))
      echo -e "  ${RED}✘${RESET} ${BOLD}scan-exceptions.conf${RESET}"
      echo -e "    Rule:  Orphaned scan-exception id"
      echo -e "    Found: ${YELLOW}id: ${id}${RESET}  (pattern: ${pat})"
      echo -e "    Fix:   document override '${id}' in ${DESIGN_MD##*/} override log, or remove the exception\n"
    fi
  done
fi

# ── Pattern checks ─────────────────────────────────────────────────────────────

# F8: map a rule to its decision tier. ERROR = objective correctness/a11y (never overridable);
# REVIEW = context-dependent design or performance pattern; RISK = Tier-3 advisory tell.
rule_tier() {
  case "$1" in
    *"Clickable div"*|*"aria-label"*|*"Broken/placeholder image"*|*"Semantic-palette leak"*|*"Dead placeholder link"*) echo ERROR;;
    *"Numbered section markers"*|*"Em-dash overuse"*|*"Decorative accent border (advisory)"*|*"Oversized display clamp (advisory)"*|*"Eyebrow pattern present (advisory)"*|*"forced-colors not evaluated (advisory)"*) echo RISK;;
    *) echo REVIEW;;
  esac
}

# ── Comment-stripped presence check ───────────────────────────────────────────
# Several detectors ask "is X declared ANYWHERE in this file?" — a viewport meta, a
# reduced-motion block, a forced-colors block. All of them are wrong if a comment
# counts: documentation, TODOs and rule citations quote the very token they describe,
# so a file that only *mentions* the fallback would silently pass as if it had one.
# (Caught FIVE times while building these fixtures — the fixtures' own explanatory comments
# masked their own findings, every time.) Strips /* */, <!-- --> and leading // then greps.
# Usage: has_decl <file> <extended-regex>  → prints a count, 0 when absent.
has_decl() {
  awk '
    { line = $0
      while (match(line, /\/\*/)) {
        pre = substr(line, 1, RSTART - 1); rest = substr(line, RSTART)
        if (match(rest, /\*\//)) { line = pre substr(rest, RSTART + 2) } else { line = pre; inc = 1; break }
      }
      if (inc) { if (match($0, /\*\//)) { line = substr($0, RSTART + 2); inc = 0 } else next }
      while (match(line, /<!--/)) {
        pre = substr(line, 1, RSTART - 1); rest = substr(line, RSTART)
        if (match(rest, /-->/)) { line = pre substr(rest, RSTART + 3) } else { line = pre; inh = 1; break }
      }
      if (inh) { if (match($0, /-->/)) { line = substr($0, RSTART + 3); inh = 0 } else next }
      # Line comments too: JS/TS/JSX files carry rule citations in // comments, and those are
      # not declarations either. Anchored at line start so an https:// URL is never eaten.
      if (line ~ /^[ \t]*\/\//) next
      print line
    }' "$1" 2>/dev/null | grep -ciE "$2" || true
}

flag() {
  local file="$1" line="$2" rule="$3" match="$4" fix="$5"
  # Classify FIRST, then apply exceptions. Tier-1 ERRORs (correctness/a11y) are never
  # overridable — a scan-exception may suppress only REVIEW/RISK, never an ERROR (F8 fix).
  local tier; tier="$(rule_tier "$rule")"
  if [ "$tier" != "ERROR" ] && is_excepted "$match"; then
    return 0
  fi
  # Count every violation. Printing is display-only and capped at MAX_PRINT so a
  # noisy file can't flood the terminal — but the count (and exit code) is complete.
  case "$tier" in
    ERROR)  ERRORS=$((ERRORS + 1));;
    RISK)   RISKS=$((RISKS + 1));;
    *)      REVIEWS=$((REVIEWS + 1));;
  esac
  VIOLATIONS=$((VIOLATIONS + 1))
  if [ "$PRINTED" -lt "$MAX_PRINT" ]; then
    echo -e "  ${RED}✘${RESET} ${BOLD}${file}:${line}${RESET}  [${tier}]"
    echo -e "    Rule:  ${rule}"
    echo -e "    Found: ${YELLOW}${match}${RESET}"
    echo -e "    Fix:   ${fix}\n"
    PRINTED=$((PRINTED + 1))
    if [ "$PRINTED" -eq "$MAX_PRINT" ]; then
      echo -e "  ${YELLOW}… detail cap reached (${MAX_PRINT} shown). Remaining violations are still counted in the total.${RESET}\n"
    fi
  fi
}

for FILE in "${FILES[@]}"; do
  [ -f "$FILE" ] || continue

  # ── 1. Gradient on interactive elements ────────────────────────────────────
  # Floor-fades, scrims, and scroll masks (gradients ending in transparent /
  # zero-alpha) are skill-taught craft, not button gradients — exempt them.
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE 'transparent|rgba\([0-9, .]*[, ]0(\.0*)?\)|\bmask|scrim|floor-?fade|fade-?out'; then
      continue
    fi
    context=$(sed -n "$((lineno > 5 ? lineno - 5 : 1)),${lineno}p" "$FILE" | grep -iE 'button|\.btn|cta|\[role="button"\]|submit' || true)
    if [ -n "$context" ]; then
      flag "$FILE" "$lineno" "No gradient on interactive elements" "$match" "Replace with flat solid color: background: var(--color-primary)"
    fi
  done < <(grep -n "linear-gradient\|radial-gradient" "$FILE" 2>/dev/null || true)

  # ── 2. Oversized border radius on card/container elements (> 16px) ─────────
  # Parse the border-radius value itself — not the first Npx on the line
  # (which may be padding or margin).
  while IFS=: read -r lineno match; do
    px=$(echo "$match" | sed -nE 's/.*[bB]order-?[rR]adius[^:]*:[[:space:]]*['"'"'"]?([0-9]+)px.*/\1/p' | head -1 || true)
    if [ -n "$px" ] && [ "$px" -gt 16 ] 2>/dev/null; then
      context=$(sed -n "$((lineno > 3 ? lineno - 3 : 1)),${lineno}p" "$FILE" | grep -iE 'card|modal|sheet|panel|container|\.box|section' || true)
      if [ -n "$context" ]; then
        flag "$FILE" "$lineno" "Border radius > 16px on card/container" "$match" "Use --radius-md (12px) or --radius-lg (16px) max for cards"
      fi
    fi
  done < <(grep -n "border-radius" "$FILE" 2>/dev/null || true)

  # ── 3. Colored side-stripe borders (border-left/right > 1px with color) ────
  while IFS=: read -r lineno match; do
    px=$(echo "$match" | grep -oE '[0-9]+px' | head -1 | tr -d 'px' || true)
    if [ -n "$px" ] && [ "$px" -gt 1 ] 2>/dev/null; then
      flag "$FILE" "$lineno" "Colored side-stripe border" "$match" "Use background tint, full border, or leading icon instead"
    fi
  done < <(grep -n "border-left\|border-right" "$FILE" 2>/dev/null | grep -v "none\|0px\|0 " || true)

  # ── 4. Ghost-card pattern — border + wide box-shadow on nearby lines ────────
  while IFS=: read -r lineno match; do
    start=$((lineno > 5 ? lineno - 5 : 1))
    end=$((lineno + 10))
    block=$(sed -n "${start},${end}p" "$FILE" 2>/dev/null || true)
    has_border=$(echo "$block" | grep -E '^[^/]*border\s*:' || true)
    has_shadow=$(echo "$block" | grep -oE 'box-shadow[^;]+' | grep -oE '[0-9]+px' | sort -n | tail -1 || true)
    if [ -n "$has_border" ] && [ -n "$has_shadow" ]; then
      blur_px=$(echo "$has_shadow" | tr -d 'px')
      if [ -n "$blur_px" ] && [ "$blur_px" -ge 16 ] 2>/dev/null; then
        flag "$FILE" "$lineno" "Ghost-card pattern (border + wide shadow)" "$match" "Pick one: solid border OR shadow ≤ 8px blur"
      fi
    fi
  done < <(grep -n "box-shadow" "$FILE" 2>/dev/null || true)

  # ── 5. Gradient text ────────────────────────────────────────────────────────
  while IFS=: read -r lineno match; do
    flag "$FILE" "$lineno" "Gradient text (absolute ban)" "$match" "Use solid color. Emphasize with font-weight or size."
  done < <(grep -n "background-clip.*text\|webkit-background-clip.*text" "$FILE" 2>/dev/null || true)

  # ── 6. Warm/cream background tokens by name ─────────────────────────────────
  while IFS=: read -r lineno match; do
    flag "$FILE" "$lineno" "Warm/cream background token" "$match" "Use a true off-white or brand-tinted neutral instead"
  done < <(grep -in "\-\-paper\|\-\-cream\|\-\-sand\|\-\-bone\|\-\-linen\|\-\-parchment\|\-\-ivory\|\-\-warm-white" "$FILE" 2>/dev/null || true)

  # ── 7. Generic font as sole primary font ────────────────────────────────────
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE "font-family\s*:\s*['\"]?(Inter|Roboto|Arial|Geist)['\"]?\s*;"; then
      flag "$FILE" "$lineno" "Generic font as primary design choice" "$match" "Add a distinctive display font. Inter/Roboto/Arial/Geist are fallbacks, not a design decision."
    fi
  done < <(grep -in "font-family" "$FILE" 2>/dev/null || true)

  # ── 7b. Saturated display/mono font (AI training-data default) ──────────────
  # These are the fonts an unguided model reaches for by reflex (an upstream "reflex-reject"
  # list, credited in NOTICE). Flagged only when set as
  # an actual font-family (not merely a fallback further down the stack).
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE "font-family\s*:\s*['\"]?(Space Grotesk|JetBrains Mono|Space Mono|Sora)['\"]?"; then
      flag "$FILE" "$lineno" "Saturated AI-default font (Space Grotesk / JetBrains Mono family)" "$match" "Training-data default that reads as 'AI made this'. Pick a distinctive face for the brand's voice."
    fi
  done < <(grep -in "font-family" "$FILE" 2>/dev/null || true)

  # ── 7c. Acid accent on near-black (dev-tool-brutalist AI lane) ──────────────
  # The single most common unguided-model shape: near-black surface + one acid
  # accent (chartreuse/lime, electric-cyan, hot-magenta). Heuristic: flag the
  # common acid-accent hexes; near-black grounds are the usual companion.
  while IFS=: read -r lineno match; do
    flag "$FILE" "$lineno" "Acid accent (dev-tool-brutalist AI lane)" "$match" "Chartreuse/lime/electric-cyan neon on near-black is a saturated AI default. If the brand isn't a literal terminal/CI tool, choose an accent from its own voice."
  done < <(grep -inE "#c6f24e|#ccff00|#c1ff00|#d4ff00|#adff2f|#00ff[0-9a-f]{2}|#39ff14|#0aff|#ff00ff|#e5ff[0-9a-f]{2}" "$FILE" 2>/dev/null || true)

  # ── 8. Bounce / elastic easing ──────────────────────────────────────────────
  while IFS=: read -r lineno match; do
    flag "$FILE" "$lineno" "Bounce/elastic easing (absolute ban)" "$match" "Use ease-out-quart/quint/expo. No spring physics on UI elements."
  done < <(grep -in "bounce\|elastic\|spring\|wiggle\|wobble" "$FILE" 2>/dev/null | grep -iE "animation|transition|timing-function|keyframe" || true)

  # Also catch cubic-bezier overshoot (4th value > 1 or < 0)
  while IFS=: read -r lineno match; do
    # Extract the 4th parameter of cubic-bezier
    fourth=$(echo "$match" | grep -oE 'cubic-bezier\s*\([^)]+\)' | grep -oE '[-0-9.]+\s*\)' | grep -oE '[-0-9.]+' || true)
    if [ -n "$fourth" ]; then
      # Check if it's outside 0-1 range (overshoot = bounce)
      if echo "$fourth" | awk '{exit ($1 >= 0 && $1 <= 1) ? 0 : 1}' 2>/dev/null; then
        : # within range, ok
      else
        flag "$FILE" "$lineno" "Bounce easing via cubic-bezier overshoot" "$match" "Use ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)"
      fi
    fi
  done < <(grep -n "cubic-bezier" "$FILE" 2>/dev/null || true)

  # ── 9. Layout property animation ────────────────────────────────────────────
  while IFS=: read -r lineno match; do
    # Flag if transition is animating layout properties
    if echo "$match" | grep -qiE "transition\s*:[^;]*(width|height|padding|margin|top|left|right|bottom)"; then
      flag "$FILE" "$lineno" "Layout property animation" "$match" "Animate transform/opacity instead. For height: grid-template-rows: 0fr → 1fr"
    fi
  done < <(grep -in "transition" "$FILE" 2>/dev/null || true)

  # Also catch @keyframes animating layout props
  while IFS=: read -r lineno match; do
    flag "$FILE" "$lineno" "Layout property animation in @keyframes" "$match" "Animate transform/opacity instead to avoid layout thrash"
  done < <(grep -n "from\|to\|[0-9]\+%" "$FILE" 2>/dev/null | grep -iE "^\s*(width|height|padding|margin)\s*:" || true)

  # ── 10. Image hover scale/rotate ────────────────────────────────────────────
  # Scope: images under :hover only. :active press-states (scale on tap) and
  # SVG geometry transforms (progress rings, chart rotation) are legitimate.
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE ':active|active:|<svg|<path|<circle|<rect|<g |stroke-|viewBox'; then
      continue
    fi
    context=$(sed -n "$((lineno > 5 ? lineno - 5 : 1)),${lineno}p" "$FILE" || true)
    if echo "$context" | grep -qiE ':active|<svg|<path|<circle|viewBox'; then
      continue
    fi
    hoverctx=$(echo "$context" | grep -iE ':hover|hover:' || true)
    imgctx=$(echo "$context" | grep -iE '\bimg\b|image|photo|thumb|picture|background-image' || true)
    if [ -n "$hoverctx" ] && [ -n "$imgctx" ]; then
      flag "$FILE" "$lineno" "Image scale/rotate on hover" "$match" "Let imagery sit still. Use a color overlay or caption reveal instead."
    fi
  done < <(grep -n "transform.*scale\|transform.*rotate\|scale(\|rotate(" "$FILE" 2>/dev/null || true)

  # ── 11. Numbered section markers (01/02/03 pattern) ─────────────────────────
  # Date/day/calendar numerals ("08", "09" in a check-in strip) are data,
  # not editorial scaffold — exempt them by context.
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE 'date|day|time|calendar|month|week|clock'; then
      continue
    fi
    context=$(sed -n "$((lineno > 3 ? lineno - 3 : 1)),${lineno}p" "$FILE" | grep -iE 'date|day|calendar|month|week' || true)
    if [ -n "$context" ]; then
      continue
    fi
    flag "$FILE" "$lineno" "Numbered section markers (AI tell)" "$match" "Remove unless content is a true sequence. Use structural hierarchy instead."
  done < <(grep -nE '>\s*0[1-9]\.?\s*<|content:\s*["'"'"']0[1-9]' "$FILE" 2>/dev/null || true)

  # ── 12. All-caps on long text blocks ────────────────────────────────────────
  while IFS=: read -r lineno match; do
    # Only flag on elements that typically contain body text, not labels
    context=$(sed -n "$((lineno > 2 ? lineno - 2 : 1)),${lineno}p" "$FILE" | grep -iE 'p\s*{|\.body|\.text|\.content|\.description|\.prose' || true)
    if [ -n "$context" ]; then
      flag "$FILE" "$lineno" "All-caps on body text" "$match" "Reserve text-transform: uppercase for short labels (4-6 words max)."
    fi
  done < <(grep -n "text-transform\s*:\s*uppercase" "$FILE" 2>/dev/null || true)

  # ── 13. Marketing buzzwords in UI copy ──────────────────────────────────────
  BUZZWORDS="supercharge\|supercharges\|supercharging\|streamline\|streamlines\|streamlining\|enterprise-grade\|world-class\|next-generation\|game-changing\|cutting-edge\|state-of-the-art\|revolutionary\|empower\|empowers"
  while IFS=: read -r lineno match; do
    # Only flag in JSX/HTML string content, not in comments or class names
    if echo "$match" | grep -qvE '^\s*//' && echo "$match" | grep -qvE 'className|class='; then
      flag "$FILE" "$lineno" "Marketing buzzword in UI copy" "$match" "Replace with specific, literal description of what the product does."
    fi
  done < <(grep -in "$BUZZWORDS" "$FILE" 2>/dev/null || true)

  # ── 14. Em-dash overuse (more than 2 per line) ──────────────────────────────
  while IFS=: read -r lineno match; do
    # Count em-dashes in the line
    count=$(echo "$match" | grep -o "—\|&mdash;\|&#8212;" | wc -l || true)
    if [ "$count" -ge 3 ] 2>/dev/null; then
      flag "$FILE" "$lineno" "Em-dash overuse (AI copy tell)" "$match" "Use commas, colons, periods, or parentheses instead. Max 2 em-dashes per text block."
    fi
  done < <(grep -n "—\|&mdash;\|&#8212;" "$FILE" 2>/dev/null || true)

  # ── 15. Translucent content-surface fills ───────────────────────────────────
  # Content cards/panels/rows must be opaque. Native chrome (tab bar, sheet,
  # overlay/scrim/backdrop) is exempt. Project-specific exemptions go in
  # scan-exceptions.conf.
  while IFS=: read -r lineno match; do
    # Exempt native chrome by context on the same line.
    if echo "$match" | grep -qiE 'tab-?bar|nav|sheet|overlay|scrim|backdrop'; then
      continue
    fi
    # Require a content-surface context (card/panel/row/box) on the line.
    if echo "$match" | grep -qiE 'card|panel|\.row|surface|\bbox\b|container'; then
      flag "$FILE" "$lineno" "Translucent content-surface fill" "$match" "Content surfaces are opaque #FFFFFF. Native chrome (tab bar/sheet) is exempt."
    fi
  done < <(grep -niE 'background[^;]*(rgba\(255, ?255, ?255, ?0?\.[0-9]|hsla\([^)]*, ?0?\.[0-9])' "$FILE" 2>/dev/null || true)

  # ── 16. Gradient / glow page background ─────────────────────────────────────
  # Page canvas must be one flat solid colour. Flag gradient/glow behind content
  # and glow/ambient/body-gradient tokens. Committed immersive-screen gradients
  # (documented in DESIGN.md) are registered in scan-exceptions.conf, not here.
  while IFS=: read -r lineno match; do
    # Skip comment-only lines (JS //, /* * , CSS /* */) — they name tokens in prose.
    if echo "$match" | grep -qE '^\s*(//|/?\*)'; then
      continue
    fi
    if echo "$match" | grep -qiE '(body|#root|\.app|\.screen|\.page|canvas)[^;{]*(linear|radial)-gradient'; then
      flag "$FILE" "$lineno" "Gradient/glow page background" "$match" "The canvas is one flat solid colour — use the project's canvas/surface token."
    elif echo "$match" | grep -qiE '\-\-[a-z-]*glow-|gradient-body|gradient-app|gradient-ambient|\.ambient'; then
      flag "$FILE" "$lineno" "Glow/ambient/body-gradient background token" "$match" "Glows and body/app gradients are banned as canvas. Use the flat canvas token, or register a documented exception in scan-exceptions.conf."
    fi
  done < <(grep -niE 'gradient|glow|\.ambient' "$FILE" 2>/dev/null || true)

  # ── 16b. Gradient canvas via CSS custom property (Gap B) ────────────────────
  # A gradient hidden in a var (--x: linear-gradient(...)) then applied with
  # background: var(--x) on a page/screen element must also be caught.
  GRADIENT_VARS=$(grep -oE '\-\-[a-zA-Z0-9_-]+[[:space:]]*:[[:space:]]*(linear|radial)-gradient' "$FILE" 2>/dev/null | grep -oE '^\-\-[a-zA-Z0-9_-]+' | sort -u || true)
  for gv in $GRADIENT_VARS; do
    while IFS=: read -r lineno match; do
      context=$(sed -n "$((lineno > 6 ? lineno - 6 : 1)),${lineno}p" "$FILE" | grep -iE 'body|#root|\.app\b|\.screen|\.page|canvas' || true)
      if [ -n "$context" ]; then
        flag "$FILE" "$lineno" "Gradient canvas via custom property (${gv})" "$match" "${gv} resolves to a gradient. The canvas is one flat solid colour."
      fi
    done < <(grep -nE "background[^;]*var\(${gv}\)" "$FILE" 2>/dev/null || true)
  done

  # ── 17. Coloured / glow elevation ───────────────────────────────────────────
  # Elevation shadows are neutral (near-grey channels). Flag brand-tinted
  # shadows (RGB channel spread > 40 = a hue, not a grey) and glow-as-lift.
  # Documented exceptions (e.g. a committed warm selected-state lift) go in
  # scan-exceptions.conf.
  while IFS=: read -r lineno match; do
    # Only consider lines that actually declare a shadow.
    echo "$match" | grep -qiE 'box-?shadow' || continue
    if echo "$match" | grep -qiE 'box-?shadow[^;]*\-\-[a-z-]*glow-'; then
      flag "$FILE" "$lineno" "Glow used as elevation" "$match" "Elevation is a neutral shadow from the elevation ramp, never a glow."
      continue
    fi
    # Neutrality test: near-equal RGB channels. Spread > 40 = brand-tinted.
    rgb=$(echo "$match" | grep -oE 'box-?shadow[^;]*' | grep -oE 'rgba?\([0-9]+, ?[0-9]+, ?[0-9]+' | head -1 | grep -oE '[0-9]+' | tr '\n' ' ' || true)
    if [ -n "$rgb" ]; then
      set -- $rgb
      r=$1; g=$2; b=$3
      max=$r; min=$r
      for v in "$g" "$b"; do
        if [ "$v" -gt "$max" ]; then max=$v; fi
        if [ "$v" -lt "$min" ]; then min=$v; fi
      done
      if [ $((max - min)) -gt 40 ]; then
        flag "$FILE" "$lineno" "Brand-tinted elevation shadow" "$match" "Elevation shadows are neutral (near-grey rgba). Use the neutral elevation ramp, or register a documented exception in scan-exceptions.conf."
      fi
    fi
  done < <(grep -niE 'box-?shadow' "$FILE" 2>/dev/null || true)

  # ── 18. Offsetless glow shadows (0 0 blur) ──────────────────────────────────
  # A shadow needs a vertical offset (light from above). box-shadow: 0 0 Npx is
  # a glow, banned as elevation. Focus rings (0 0 0 Npx spread-only) are exempt.
  while IFS=: read -r lineno match; do
    # Exempt focus rings: 0 0 0 Npx (zero blur, spread-only)
    if echo "$match" | grep -qE 'box-shadow[^;]*:\s*(inset\s+)?0(px)? 0(px)? 0(px)? [0-9]'; then
      continue
    fi
    # Exempt focus/ring context
    if echo "$match" | grep -qiE 'focus|ring|outline'; then
      continue
    fi
    if echo "$match" | grep -qE 'box-shadow[^;]*:\s*(inset\s+)?0(px)? 0(px)? [1-9][0-9]*px'; then
      flag "$FILE" "$lineno" "Offsetless glow shadow" "$match" "Shadows need a vertical offset (y ≥ blur ÷ 2). Use the --elev ramp, e.g. 0 4px 12px."
    fi
  done < <(grep -niE 'box-?shadow' "$FILE" 2>/dev/null || true)

  # ── 19. Glassmorphism on content surfaces ───────────────────────────────────
  # backdrop-filter blur belongs on native chrome overlaying scroll (nav/tab
  # bar, sheet) — never on content cards/panels/rows.
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE 'tab-?bar|nav|sheet|toast|snackbar|scrim|backdrop-color'; then
      continue
    fi
    context=$(sed -n "$((lineno > 5 ? lineno - 5 : 1)),${lineno}p" "$FILE" | grep -iE 'card|panel|\.row|list|container|\bbox\b' || true)
    if [ -n "$context" ]; then
      flag "$FILE" "$lineno" "Glassmorphism on content surface" "$match" "Blur+translucency only on chrome overlaying scroll (nav/tab bar, sheet). Content cards are opaque."
    fi
  done < <(grep -niE 'backdrop-filter' "$FILE" 2>/dev/null || true)

  # ── 20. Literal high z-index ────────────────────────────────────────────────
  while IFS=: read -r lineno match; do
    zvals=$(echo "$match" | grep -oiE 'z-?index[^0-9-]*[0-9]+' | grep -oE '[0-9]+' || true)
    for zval in $zvals; do
      if [ "$zval" -ge 999 ] 2>/dev/null; then
        flag "$FILE" "$lineno" "Literal high z-index" "$match" "Use the z-index token ramp (content < chrome < dropdown < modal < toast). No 999+ literals."
        break
      fi
    done
  done < <(grep -niE 'z-?index' "$FILE" 2>/dev/null || true)

  # ── 20a. Oversized display clamp (hero-fit root cause, RISK/advisory) ───────
  # Static half of origin slop gate 44 ("Hero fit"). The gate's real test
  # needs a render at 1280x800; the root cause it names — an oversized display
  # clamp() max — is a token value and is checkable here, earlier and for free.
  # Advisory by design: large display type is legitimate for brand/hero registers
  # (aggressive display directions clamp 6.5-9rem for short statements).
  # What is NOT legitimate is shipping it without verifying the fold, so this
  # points at the check rather than failing the build.
  while IFS=: read -r lineno match; do
    # Only font-size declarations and display/hero/text tokens — a width or
    # container clamp with a large max is not this defect.
    if ! echo "$match" | grep -qiE 'font-size|--(text|display|font|type|hero|title|heading|h1)[a-z0-9_-]*[[:space:]]*:'; then
      continue
    fi
    # Third clamp() argument = the maximum.
    cmax=$(echo "$match" | grep -oiE 'clamp\([^)]*\)' | sed -E 's/.*,[[:space:]]*([0-9.]+)(rem|px)[[:space:]]*\)/\1 \2/' || true)
    cval=$(echo "$cmax" | awk '{print $1}')
    cunit=$(echo "$cmax" | awk '{print $2}')
    [ -n "$cval" ] || continue
    px=$(awk -v v="$cval" -v u="$cunit" 'BEGIN{ printf "%.0f", (u=="rem" ? v*16 : v) }' 2>/dev/null || echo 0)
    if [ "$px" -ge 96 ] 2>/dev/null; then
      flag "$FILE" "$lineno" "Oversized display clamp (advisory)" "$match" "clamp() max is ${px}px. Verify hero fit rendered at 1280x800 — headline, lede and primary CTA must all sit above the fold, headline on 2-3 lines. If it overflows, pull this max down first (see rules.md Typography, Hero fit)."
    fi
  done < <(grep -niE 'clamp\(' "$FILE" 2>/dev/null || true)

  # ── 20b. Display line-height below 1.0 ──────────────────────────────────────
  # A hard floor, not a preference: below 1.0 the cap-tops of line N+1 collide
  # with the baseline of line N, so it looks fine in a single-line mock and
  # breaks the moment the headline wraps. Worst on uppercase and condensed faces.
  while IFS=: read -r lineno match; do
    lh=$(echo "$match" | grep -oiE '(line-height|--(lh|leading)[a-z0-9_-]*)[[:space:]]*:[[:space:]]*\.?[0-9.]+' | grep -oE '\.?[0-9.]+$' || true)
    [ -n "$lh" ] || continue
    case "$lh" in .*) lh="0$lh";; esac
    if awk -v v="$lh" 'BEGIN{ exit !(v < 1 && v > 0) }' 2>/dev/null; then
      flag "$FILE" "$lineno" "Display line-height below 1.0" "$match" "1.0 is the floor — caps collide with the line above on wrap. Hero display targets 1.0-1.1; ordinary display/h1 1.1-1.25 (see rules.md Typography)."
    fi
  done < <(grep -niE '(line-height|--(lh|leading)[a-z0-9_-]*)[[:space:]]*:' "$FILE" 2>/dev/null || true)

  # ── 20c. Dead placeholder link ──────────────────────────────────────────────
  # href="#" / href="" renders and styles correctly, so it survives every visual
  # check and ships. An in-page anchor (href="#section") is a real destination
  # and must not flag.
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qE 'href[[:space:]]*=[[:space:]]*("#"|'"''"'#'"''"'|""|'"''"''"''"')'; then
      flag "$FILE" "$lineno" "Dead placeholder link" "$match" "This control goes nowhere. Point it at a real destination (route, mailto:, or an in-page #id), or render it as a <button> if it is an action. Production bar: no dead links."
    fi
  done < <(grep -nE 'href[[:space:]]*=' "$FILE" 2>/dev/null || true)

  # ── 20d. Hardcoded spacing bypassing a declared scale ────────────────────────
  # Fires only where a --space-* scale exists in the same file: the defect is the
  # raw literal bypassing the system, not the number itself, so this stays
  # correct for projects whose scale is not 4/8-based. Sanctioned literals per
  # rules.md (1px hairlines, the 2px segmented-control gap, 0) are exempt.
  if grep -qE '\-\-(space|spacing)[a-z0-9_-]*[[:space:]]*:' "$FILE" 2>/dev/null; then
    while IFS=: read -r lineno match; do
      # Strip custom-property declarations first: `--space-5: 30px` is the scale
      # being defined, not a bypass of it. Works whether :root is one-per-line
      # or compressed inline.
      clean_match=$(echo "$match" | sed -E 's/--[a-zA-Z0-9_-]+[[:space:]]*:[^;}]*[;]?//g')
      for val in $(echo "$clean_match" | grep -oiE '(margin|padding|gap|row-gap|column-gap)[a-z-]*[[:space:]]*:[^;}]*' | grep -oE '[0-9]+px' | grep -oE '[0-9]+'); do
        if [ "$val" -gt 2 ] 2>/dev/null; then
          flag "$FILE" "$lineno" "Hardcoded spacing bypasses the scale" "$match" "This file declares a --space-* scale; ${val}px bypasses it. Use the nearest scale token. Only 0, 1px hairlines and the 2px segmented-control gap are sanctioned literals (rules.md → Spacing system, Sanctioned grid breaks)."
          break
        fi
      done
    done < <(grep -niE '(margin|padding|gap)[a-z-]*[[:space:]]*:[^;]*[0-9]+px' "$FILE" 2>/dev/null || true)
  fi

  # ── 20e. Breakpoint sprawl ──────────────────────────────────────────────────
  # rules.md caps a committed set at 2-3 width breakpoints. More than that is
  # eye-tuned adaptation, not designed. Non-width media queries (reduced-motion,
  # forced-colors, print) are not breakpoints and never count.
  if echo "$FILE" | grep -qiE '\.(css|scss|less)$'; then
    bpcount=$(grep -oiE '@media[^{]*\((min|max)-width:[[:space:]]*[0-9.]+(px|rem|em)' "$FILE" 2>/dev/null \
      | grep -oE '[0-9.]+(px|rem|em)' | sort -u | grep -c . || true)
    if [ "${bpcount:-0}" -gt 3 ] 2>/dev/null; then
      bpline=$(grep -niE '@media[^{]*\((min|max)-width:' "$FILE" 2>/dev/null | head -1 | cut -d: -f1)
      bplist=$(grep -oiE '@media[^{]*\((min|max)-width:[[:space:]]*[0-9.]+(px|rem|em)' "$FILE" 2>/dev/null \
        | grep -oE '[0-9.]+(px|rem|em)' | sort -u | tr '\n' ' ')
      flag "$FILE" "${bpline:-1}" "Breakpoint sprawl" "$bpcount distinct width breakpoints: $bplist" "Collapse to the 2-3 committed breakpoints declared in DESIGN.md and move grids between them. More breakpoints means each was eye-tuned to a viewport rather than designed (rules.md → Responsive and adaptive layout)."
    fi
  fi

  # ── 20f. Nav links hidden with no menu affordance ───────────────────────────
  # The collapse pattern is a PAIR: hide the desktop row, show a toggle at the
  # same breakpoint. Shipping only the first half makes every hidden destination
  # unreachable below the breakpoint — a functional defect, not a style one.
  # Checks the file first, then its sibling files, since the toggle often lives
  # in the markup rather than the stylesheet.
  TOGGLE_RE='toggle|hamburger|burger|menu-btn|menu-button|menu-icon|nav-open|navopen|drawer|off-?canvas|sheet|aria-expanded|<details|disclosure|skip-link'
  navhide=$(grep -niE '\.[a-z0-9_-]*(nav|menu)[a-z0-9_-]*[^{]*\{[^}]*display:[[:space:]]*none' "$FILE" 2>/dev/null | head -1 || true)
  if [ -n "$navhide" ]; then
    if ! grep -qiE "$TOGGLE_RE" "$FILE" 2>/dev/null; then
      # Widen to sibling files before flagging — the toggle is usually in markup.
      sibdir=$(dirname "$FILE")
      if ! grep -rqiE "$TOGGLE_RE" "$sibdir" --include='*.html' --include='*.jsx' --include='*.tsx' --include='*.vue' --include='*.svelte' --include='*.css' 2>/dev/null; then
        lineno=$(echo "$navhide" | cut -d: -f1)
        match=$(echo "$navhide" | cut -d: -f2-)
        flag "$FILE" "$lineno" "Nav links hidden with no menu affordance" "$match" "Hiding the nav row is half the collapse pattern; the other half is a toggle appearing at the same breakpoint (sheet, drawer, or disclosure menu). As written, every hidden destination is unreachable below the breakpoint. Add the toggle, or keep the items in the DOM with hidden=until-found (rules.md → Platform notes → Page navigation (web))."
      fi
    fi
  fi

  # ── 20g. Eyebrow above the hero H1 ──────────────────────────────────────────
  # Every OTHER eyebrow rule in the kit is scoped to repetition ("on every
  # section"), so the single hero instance passes all of them — and the hero is
  # where the one permitted kicker invariably gets spent. Same slot and same job
  # as the banned badge-above-H1. REVIEW tier: it can still clear through the
  # Tier-2 gate with a purpose logged in DESIGN.md.
  EYEBROW_CLASS='eyebrow|kicker|overline|pretitle|pre-title|supertitle|super-title|section-tag|hero-tag|hero-label|hero-kicker'
  while IFS=: read -r lineno _; do
    lo=$(( lineno > 4 ? lineno - 4 : 1 ))
    before=$(sed -n "${lo},$((lineno - 1))p" "$FILE" 2>/dev/null || true)
    if echo "$before" | grep -qiE "class=[\"'][^\"']*($EYEBROW_CLASS)"; then
      hit=$(echo "$before" | grep -iE "class=[\"'][^\"']*($EYEBROW_CLASS)" | head -1)
      flag "$FILE" "$lineno" "Eyebrow above the hero H1" "$hit" "Presumed decorative regardless of whether it repeats — it occupies the same slot as the banned badge-above-H1 and does the same job. Fold the message into the headline or subhead, or cut it. Clears only through the Tier-2 gate with a stated purpose in DESIGN.md, and 'it labels the section' is not a purpose when the H1 below already names it."
      break
    fi
  done < <(grep -niE '<h1[ >]' "$FILE" 2>/dev/null || true)

  # ── 20h. Eyebrow pattern defined in the system (advisory) ───────────────────
  # A named eyebrow/kicker selector means the pattern is in the build. Not a
  # defect on its own — a named brand system may use kickers deliberately — but
  # worth confirming it is systematised and that the hero is not where it lands.
  while IFS=: read -r lineno match; do
    flag "$FILE" "$lineno" "Eyebrow pattern present (advisory)" "$match" "Confirm this is a deliberate, systematic kicker logged in DESIGN.md — and that the hero H1 is not where it is spent (the hero instance is gated separately). If it is decorative editorial grammar, remove it."
    break
  done < <(grep -niE '^[^/]*[.#][a-z0-9_-]*('"$EYEBROW_CLASS"')[a-z0-9_-]*[^{]*\{' "$FILE" 2>/dev/null || true)

  # ── 20i. Nav shipped with no archetype recorded in DESIGN.md ────────────────
  # Governance, not taste. Telling a reflexive nav bar from a deliberately dense
  # one needs judgment a regex can't apply — but whether the decision was RECORDED
  # is mechanical, and an unrecorded nav is default-attractor output by definition.
  if [ -n "$DESIGN_MD" ] && [ "${NAV_ARCHETYPE_FLAGGED:-0}" -eq 0 ]; then
    if grep -qiE '<nav[ >]|class=["'"'"'][^"'"'"']*(site-header|navbar|nav-links|topnav)|role=["'"'"']banner' "$FILE" 2>/dev/null; then
      if ! grep -qiE '^#+[[:space:]]*navigation|nav(igation)?[^a-z0-9]{0,6}(archetype|pattern|shape)|archetype:' "$DESIGN_MD" 2>/dev/null; then
        NAV_ARCHETYPE_FLAGGED=1
        lineno=$(grep -niE '<nav[ >]|class=["'"'"'][^"'"'"']*(site-header|navbar|nav-links|topnav)|role=["'"'"']banner' "$FILE" 2>/dev/null | head -1 | cut -d: -f1)
        flag "$FILE" "${lineno:-1}" "Nav shipped with no archetype in DESIGN.md" "navigation present; ${DESIGN_MD##*/} records no nav archetype" "The nav is the most visible element on the page and the one most often left undecided. Add a Navigation entry to ${DESIGN_MD##*/} naming the archetype, its rationale, the destinations, and the collapse affordance (see ui-design-principles design-system-template.md). A nav no document specifies was templated, not chosen."
      fi
    fi
  fi

  # ── 20m. Zoom disabled in the viewport meta (A1) ────────────────────────────
  # rules.md → Typography: text survives 200% zoom / Dynamic Type. user-scalable=no
  # and maximum-scale=1 defeat the user's own font-size setting outright. The rule
  # bans them; it does not gate them. ERROR tier, and no exception may suppress it.
  if echo "$FILE" | grep -qiE '\.(html|jsx|tsx|vue|svelte|js|ts)$'; then
    while IFS=: read -r lineno match; do
      [ -n "${lineno:-}" ] || continue
      flag "$FILE" "$lineno" "Zoom disabled in the viewport meta" "$(echo "$match" | sed 's/^[[:space:]]*//' | cut -c1-140)" "Remove user-scalable=no and any maximum-scale below 2. A user who needs 200% text is not a layout problem to be prevented; if the layout breaks when they zoom, that is the defect. Correct form: content=\"width=device-width, initial-scale=1\"."
      break
    done < <(grep -niE 'name=["'"'"']?viewport[^>]*(user-scalable[[:space:]]*=[[:space:]]*(no|0)|maximum-scale[[:space:]]*=[[:space:]]*1(\.0+)?([,"'"'"' ]|$))' "$FILE" 2>/dev/null || true)
  fi

  # ── 20n. Missing viewport meta (A8) ─────────────────────────────────────────
  # P0 and trivially greppable: without it mobile renders at a virtual ~980px desktop
  # viewport and EVERY media query in the file goes dead. Observed in a real build.
  # Scoped to full HTML documents only — a fragment or a component legitimately has no
  # <head>, and flagging those would make the check unusable.
  if echo "$FILE" | grep -qiE '\.html?$'; then
    if grep -qiE '<html[ >]|<head[ >]|<!doctype html|<meta[[:space:]]+charset' "$FILE" 2>/dev/null; then
      has_vp=$(has_decl "$FILE" 'name=["'"'"']?viewport')
      if [ "${has_vp:-0}" -eq 0 ]; then
        mqline=$(grep -niE '@media[^{]*\((min|max)-width:' "$FILE" 2>/dev/null | head -1 | cut -d: -f1 || true)
        note="no <meta name=\"viewport\"> in the document"
        [ -n "${mqline:-}" ] && note="$note; width media queries present from line $mqline and all dead on mobile"
        flag "$FILE" "1" "Missing viewport meta" "$note" "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> to the head. Without it the page renders at a virtual ~980px viewport on mobile and every width media query below is inert — the responsive work is present in the file and reaches no user."
      fi
    fi
  fi

  # ── 20o. Base font-size declared in px (A2) ─────────────────────────────────
  # rules.md → Typography: rem/em, never px for the base. A px root or body size
  # defeats the browser and OS font-size setting for every size derived from it.
  # Scoped to html/:root/body ONLY — component px sizes are a different rule and
  # flagging them here would drown the signal.
  if echo "$FILE" | grep -qiE '\.(css|scss|less)$'; then
    while IFS=: read -r lineno match; do
      [ -n "${lineno:-}" ] || continue
      flag "$FILE" "$lineno" "Base font-size in px" "$(echo "$match" | sed 's/^[[:space:]]*//')" "Set the base in a relative unit — html { font-size: 100% } and body { font-size: 1rem } — so the user's browser and OS text-size settings still reach the page. A px base silently pins every rem derived from it, which is the failure mode that makes 200% zoom untestable."
      break
    done < <(grep -niE '^[[:space:]]*(html|body|:root)[^{}]*\{[^{}]*font-size:[[:space:]]*[0-9.]+px' "$FILE" 2>/dev/null || true)
  fi

  # ── 20p. Motion with no reduced-motion fallback (A3) ────────────────────────
  # rules.md → Motion requires the fallback. File-level presence check, the same
  # shape as the nav-toggle pairing check (20f): motion is declared here, so the
  # fallback belongs here. REVIEW, not ERROR — a project may centralise the block in
  # one global stylesheet, and the reviewer can say so; the scanner cannot see it.
  # A file whose ONLY transitions are colour/opacity on hover is not spatial motion
  # and does not trip this: the rule is about movement, not about every transition.
  if echo "$FILE" | grep -qiE '\.(css|scss|less)$'; then
    has_prm=$(has_decl "$FILE" 'prefers-reduced-motion')
    if [ "${has_prm:-0}" -eq 0 ]; then
      motionline=$(grep -niE '(transition[a-z-]*:[^;]*(transform|all)|animation[a-z-]*:[[:space:]]*[a-z]|@keyframes[[:space:]])' "$FILE" 2>/dev/null | head -1 || true)
      if [ -n "${motionline:-}" ]; then
        ml=$(echo "$motionline" | cut -d: -f1)
        mm=$(echo "$motionline" | cut -d: -f2- | sed 's/^[[:space:]]*//' | cut -c1-120)
        flag "$FILE" "${ml:-1}" "Motion with no reduced-motion fallback" "$mm  —  no prefers-reduced-motion block in this file" "Spatial motion is declared here and the fallback is not. Add @media (prefers-reduced-motion: reduce) collapsing movement to a ≤150ms opacity crossfade. For a user with vestibular sensitivity this is not a preference, it is whether the page is usable. If the project centralises the block in one global stylesheet, record that in DESIGN.md — a scanner cannot see another file."
      fi
    fi
  fi

  # ── 20q. Semantic ramp used for decoration in inline styles (A7) ────────────
  # The CSS-side leak is already caught. Inline style objects are the hole that
  # Documentation integrity names: DESIGN.md's absolute claims are checked against
  # tokens, and inline styles bypass tokens entirely. Same rule, same ERROR tier,
  # never waivable — a decorative use of the meaning-carrying palette corrupts the
  # signal wherever it is written. Fires only on DECORATIVE properties: a semantic
  # colour in `color`/`fill` on a status element is the ramp doing its job.
  if echo "$FILE" | grep -qiE '\.(jsx|tsx|vue|svelte|js|ts|html?)$'; then
    while IFS=: read -r lineno match; do
      [ -n "${lineno:-}" ] || continue
      flag "$FILE" "$lineno" "Semantic-palette leak" "$(echo "$match" | sed 's/^[[:space:]]*//' | cut -c1-140)" "The semantic/index ramp is spent here on decoration that encodes nothing — a border, stripe, or fill carrying no meaning. Once the ramp appears where it means nothing, it can no longer be trusted where it means something. Draw decoration from the neutral ramp, surface, weight, or structure. Not waivable by an override, and inline styles do not escape it."
      break
    done < <(grep -niE '(border[a-z-]*|background[a-z-]*|box-shadow|outline)[a-z-]*["'"'"']?[[:space:]]*:[[:space:]]*[^,;}]*var\(--(color-)?(index|status|semantic|state)-' "$FILE" 2>/dev/null || true)
  fi

  # ── 20r. Override contradicts a floor the project's own DESIGN.md declares (A9) ──
  # Observed: `.header-actions .btn` overriding a declared 44px minimum down to 40px.
  # A UNIVERSAL height threshold was rejected on purpose — rules.md sanctions 36px as a
  # compact web button, so a fixed threshold would contradict the rules it enforces.
  # "Contradicts the floor THIS project declared" has no such conflict: the number comes
  # from the project, not from the scanner. Same governance shape as 20i.
  # Reads the SMALLEST minimum the document declares, so a doc naming both a compact and
  # a touch floor is held to the compact one — the permissive reading, deliberately.
  if [ -n "$DESIGN_MD" ] && echo "$FILE" | grep -qiE '\.(css|scss|less)$'; then
    FLOOR=$(grep -oiE '(minimum|min\.?)[^.\n]{0,40}(control|button|target|tap|touch)[^.\n]{0,40}[0-9]+[[:space:]]*px|(control|button|target|tap|touch)[^.\n]{0,40}(minimum|min\.?)[^.\n]{0,40}[0-9]+[[:space:]]*px' "$DESIGN_MD" 2>/dev/null \
      | grep -oE '[0-9]+[[:space:]]*px' | grep -oE '[0-9]+' | sort -n | head -1 || true)
    if [ -n "${FLOOR:-}" ] && [ "${FLOOR:-0}" -gt 0 ] 2>/dev/null; then
      while IFS=: read -r lineno match; do
        [ -n "${lineno:-}" ] || continue
        val=$(echo "$match" | grep -oE '(min-)?height:[[:space:]]*[0-9]+px' | grep -oE '[0-9]+' | head -1 || true)
        [ -n "${val:-}" ] || continue
        if [ "$val" -lt "$FLOOR" ] 2>/dev/null; then
          flag "$FILE" "$lineno" "Override below the floor declared in DESIGN.md" "$(echo "$match" | sed 's/^[[:space:]]*//' | cut -c1-120)  —  ${DESIGN_MD##*/} declares a ${FLOOR}px minimum" "This is not a universal height threshold; it is this project contradicting its own declared floor. Either raise the control to ${FLOOR}px, or change the floor in ${DESIGN_MD##*/} deliberately and record why in the Override Log. A floor a stylesheet quietly undercuts is not a floor, and every later reviewer reads the document rather than the exception."
          break
        fi
      done < <(grep -niE '(min-)?height:[[:space:]]*[0-9]+px' "$FILE" 2>/dev/null | grep -viE 'max-height' 2>/dev/null || true)
    fi
  fi

  # ── 20s. forced-colors not evaluated where a boundary is drawn with shadow (A4) ──
  # Windows High Contrast / forced-colors does not paint box-shadow. A focus ring drawn
  # with box-shadow after `outline: none`, or a surface whose only boundary is a shadow,
  # therefore DISAPPEARS for the users who most need it visible.
  # ADVISORY (RISK) on purpose: rules.md says forced-colors is *evaluated*, not that every
  # page carries a block — a project may handle it globally, or legitimately conclude the
  # default rendering is fine. The finding is "this was probably never considered."
  if echo "$FILE" | grep -qiE '\.(css|scss|less)$'; then
    if [ "$(has_decl "$FILE" 'forced-colors|-ms-high-contrast')" -eq 0 ]; then
      ring=$(grep -niE 'outline:[[:space:]]*(none|0)' "$FILE" 2>/dev/null | head -1 || true)
      hasshadow=$(grep -ciE 'box-shadow:[[:space:]]*[^;]*[0-9]' "$FILE" 2>/dev/null || true)
      if [ -n "${ring:-}" ] && [ "${hasshadow:-0}" -gt 0 ]; then
        rl=$(echo "$ring" | cut -d: -f1)
        flag "$FILE" "${rl:-1}" "forced-colors not evaluated (advisory)" "outline suppressed and boundaries drawn with box-shadow; no forced-colors block in this file" "In forced-colors mode box-shadow is not painted, so a shadow-drawn focus ring or card boundary vanishes for exactly the users who need it most. Evaluate the mode and, where a boundary must survive, use a real border or outline: @media (forced-colors: active) { … outline: 2px solid CanvasText }. Advisory — if the project handles this globally or has decided the default rendering is correct, record that and move on."
      fi
    fi
  fi

  # ── 20t. Animation library with no lifecycle cleanup ────────────────────────
  # rules.md → Motion, implementation point 2 (cleanup scoped to the component, reverted on
  # unmount) and point 4 (complete teardown — no leaked triggers, listeners or inline styles).
  # These are CORRECTNESS, not taste: every remount adds another live timeline and any
  # registered trigger outlives the component. Statically visible because the cleanup idiom
  # is the same file as the animation in every framework convention.
  # Library-agnostic: GSAP context/revert · WAAPI .cancel() · Framer Motion AnimatePresence
  # owning exit · Lenis/Lottie .destroy(). Any one of them counts as cleanup.
  # Comments stripped first (has_decl) — a TODO about cleanup is not cleanup.
  if echo "$FILE" | grep -qiE '\.(jsx|tsx|js|ts|vue|svelte)$'; then
    if [ "$(has_decl "$FILE" 'gsap\.|ScrollTrigger|framer-motion|motion/react|animate\(|new Lenis|lottie')" -gt 0 ]; then
      if [ "$(has_decl "$FILE" 'gsap\.context|\.revert\(|\.cancel\(|\.destroy\(|\.kill\(|AnimatePresence|useReducedMotion|ScrollTrigger\.getAll')" -eq 0 ]; then
        aline=$(grep -niE 'gsap\.(to|from|fromTo|timeline)|ScrollTrigger|new Lenis|lottie\.loadAnimation|\.animate\(' "$FILE" 2>/dev/null | head -1 || true)
        al=$(echo "$aline" | cut -d: -f1)
        am=$(echo "$aline" | cut -d: -f2- | sed 's/^[[:space:]]*//' | cut -c1-110)
        flag "$FILE" "${al:-1}" "Animation library with no lifecycle cleanup" "$am  —  no scoped context, revert, cancel, kill or destroy in this file" "A library animation registered on mount and never torn down leaks: every remount adds another live timeline, and a registered scroll trigger outlives the component that created it. Scope it and revert on unmount — GSAP \`gsap.context()\` → \`.revert()\`; WAAPI keep the Animation handle → \`.cancel()\`; Framer Motion let AnimatePresence own exit; Lenis/Lottie \`.destroy()\`. This is rules.md → Motion implementation points 2 and 4, and it is correctness, not taste."
      fi
    fi
  fi

  # ── 20u. Scroll-linked motion with no reduced-motion branch ─────────────────
  # rules.md → Motion, implementation point 3: an explicit (prefers-reduced-motion: reduce)
  # branch, not a global duration multiplier that still moves things. Scroll-linked motion is
  # the worst case for vestibular sensitivity — the user cannot opt out by not hovering.
  # Independent of 20t: a file may tear down correctly and still have no reduce branch.
  if echo "$FILE" | grep -qiE '\.(jsx|tsx|js|ts|vue|svelte)$'; then
    if [ "$(has_decl "$FILE" 'ScrollTrigger|scrollTrigger|useScroll|animation-timeline|scrub')" -gt 0 ]; then
      if [ "$(has_decl "$FILE" 'prefers-reduced-motion|useReducedMotion|matchMedia')" -eq 0 ]; then
        sline=$(grep -niE 'ScrollTrigger|scrollTrigger|useScroll|scrub' "$FILE" 2>/dev/null | head -1 || true)
        sl=$(echo "$sline" | cut -d: -f1)
        sm=$(echo "$sline" | cut -d: -f2- | sed 's/^[[:space:]]*//' | cut -c1-110)
        flag "$FILE" "${sl:-1}" "Scroll-linked motion with no reduced-motion branch" "$sm  —  no prefers-reduced-motion, useReducedMotion or matchMedia guard in this file" "Scroll-linked motion is the hardest case for vestibular sensitivity: the user cannot avoid it by not interacting. Add an explicit reduce branch — \`gsap.matchMedia()\` with a \`(prefers-reduced-motion: reduce)\` case, Framer Motion \`useReducedMotion()\`, or a plain \`matchMedia\` guard — that removes the movement and keeps the state change. Scaling durations down is not a reduce branch. rules.md → Motion, implementation point 3."
      fi
    fi
  fi

  # ── 20v. DESIGN.md is in a format the governance checks cannot read ─────────
  # Two tools write DESIGN.md at the project root in incompatible formats: this kit's
  # four-layer prose structure (Intent · System principles · Tokens & component rules ·
  # Relationships & rationale), and the google-labs `design.md` spec that other design tools
  # emit (YAML frontmatter, machine-readable tokens).
  #
  # Every governance check in this scanner reads PROSE — an `## Override Log` section, a
  # `### Navigation` archetype entry, a control floor stated in a sentence. Against a
  # spec-format file they all grep, find nothing, and PASS. **A silent pass is the worst
  # outcome available**: the reviewer reads it as coverage that was never performed. Same
  # discipline as validate-tokens.py's degraded mode — report UNVERIFIED, never a clean bill.
  #
  # Not a judgment on either format. The finding is only that the resident format and this
  # scanner's checks do not match, which a human resolves by choosing an owner.
  if [ -n "$DESIGN_MD" ] && [ "${DESIGNMD_FORMAT_FLAGGED:-0}" -eq 0 ]; then
    if head -1 "$DESIGN_MD" 2>/dev/null | grep -qE '^---[[:space:]]*$'; then
      # Frontmatter present. Kit-format files never open with it; the spec format always does.
      if ! grep -qiE '^#{1,3}[[:space:]]*(override[[:space:]]log|navigation|intent|system principles|relationships)' "$DESIGN_MD" 2>/dev/null; then
        DESIGNMD_FORMAT_FLAGGED=1
        flag "$DESIGN_MD" "1" "DESIGN.md format unreadable by the governance checks" "${DESIGN_MD##*/} opens with YAML frontmatter and carries none of the prose sections the checks read" "This looks like the google-labs \`design.md\` spec format (what other design tools emit), not this kit's four-layer DESIGN.md. Every governance check here reads prose — the override log, the nav archetype entry, a declared control floor — so against this file they all find nothing and pass silently. Treat nav-archetype, override-log and declared-floor coverage as UNVERIFIED for this project, not clean. Resolve it by choosing an owner: ui-design-system owns DESIGN.md + tokens.json for this kit, or keep the spec format deliberately and accept that these checks do not apply. Converting is a decision for the user, never a side effect of a build."
      fi
    fi
  fi

  # ── 20k. Generic catch-all failure copy ─────────────────────────────────────
  # rules.md → Behaviour, states and recovery requires network / data / permission
  # errors to be distinguishable; rules.md → AI and agentic interfaces requires the
  # SIX model-failure families to be distinguishable and names "Something went wrong"
  # verbatim as the string none of them may render as. The root cause is static: the
  # literal is in the source. REVIEW rather than ERROR because a scanner cannot see
  # whether this is the product's only error copy or a genuine last-resort boundary
  # sitting behind six specific ones — that judgment is the reviewer's.
  # Comment lines are skipped: a rule quoted in a comment is not shipped copy.
  if echo "$FILE" | grep -qiE '\.(html|jsx|tsx|vue|js|ts|svelte)$'; then
    while IFS=: read -r lineno match; do
      [ -n "${lineno:-}" ] || continue
      flag "$FILE" "$lineno" "Generic catch-all failure copy" "$(echo "$match" | sed 's/^[[:space:]]*//')" "One string cannot carry network, data and permission failures, let alone the six model-failure families (incorrect output · no result · refusal · low quality · tool failure · unavailable evidence). Each needs its own copy — what happened, in what state the work now is — and its own recovery action. If this genuinely is the last-resort boundary behind six specific states, log it in DESIGN.md as such; an unexamined catch-all is the state design that was never done."
      break
    done < <(grep -niE '(something went wrong|an error (has )?occurred|an unexpected error|oops[,!]? *(something|an error)|unknown error occurred)' "$FILE" 2>/dev/null | grep -vE ':[[:space:]]*(//|\*|/\*|<!--|#)' 2>/dev/null || true)
  fi

  # ── 20l. Dropdown used for a set that fits inline ───────────────────────────
  # rules.md → Behaviour, states and recovery → Control-type semantics: a dropdown
  # means "a set too long or too rare to show inline" and costs an interaction to
  # reveal — never correct for 2–3 options that fit as radios or a segmented control.
  # Statically decidable only for LITERAL option lists; a select whose options are
  # mapped from data is unknowable at rest and is deliberately not flagged.
  # Placeholder options (empty value, or disabled) do not count toward the total.
  if echo "$FILE" | grep -qiE '\.(html|jsx|tsx|vue|svelte)$'; then
    while IFS='|' read -r lineno n; do
      [ -n "${lineno:-}" ] || continue
      flag "$FILE" "$lineno" "Dropdown for a set that fits inline" "<select> with $n literal option(s)" "A select hides a set the user could have seen at rest, and costs a click to reveal it. With $n options, use radios (one from a set, shown at once) or a segmented control (peer views). Keep the select only if the list is about to grow past what fits inline — and if so, say so in DESIGN.md, because the control type is a promise about behaviour."
    done < <(awk '
      !insel && /<select([ >]|$)/ { insel=1; start=NR; n=0; ph=0; dyn=0 }
      insel {
        line = $0
        if (line ~ /\.map\(|\.forEach\(|v-for|#each|\{\{#|repeat\(/) dyn = 1
        n  += gsub(/<option/, "&", line)
        ph += gsub(/<option[^>]*value=""/, "&", line)
        ph += gsub(/<option[^>]*disabled/, "&", line)
        if (line ~ /<\/select>/) {
          real = n - ph
          if (!dyn && real >= 2 && real <= 3) print start "|" real
          insel = 0
        }
      }
    ' "$FILE" 2>/dev/null || true)
  fi

  # ── 20j. Forced height + space-between = a void ─────────────────────────────
  # Two things that are each fine alone. A height the content did not ask for
  # (aspect-ratio, height:100%, or a min-height acting as a dimension) leaves
  # slack; justify-content: space-between then pools that slack into one gap in
  # the middle instead of letting it fall as trailing space. Flagged only on the
  # CO-OCCURRENCE inside one rule block — a min-height floor with natural flow is
  # the correct shape and must not fire.
  if echo "$FILE" | grep -qiE '\.(css|scss|less)$'; then
    while IFS='|' read -r lineno forced; do
      [ -n "${lineno:-}" ] || continue
      flag "$FILE" "$lineno" "Forced height with space-between" "$forced  +  justify-content: space-between" "A content container's height comes from its content. Here the layout sets it and space-between pools the surplus into one void in the middle. Fix the height first — reduce it, or give the container real content that earns it — then decide distribution. A min-height used as a floor is fine; one used as a dimension is this defect, and aspect-ratio belongs to media slots (rules.md → Spacing system)."
    done < <(awk '
      /\{/ && !inblock { inblock=1; start=NR; block=""; }
      inblock { block = block " " $0 }
      /\}/ && inblock {
        inblock=0
        if (block ~ /justify-content:[ \t]*space-between/) {
          f=""
          if (match(block, /aspect-ratio:[^;]*/))    f=substr(block, RSTART, RLENGTH)
          else if (match(block, /height:[ \t]*100%/)) f=substr(block, RSTART, RLENGTH)
          else if (match(block, /min-height:[^;]*/))  f=substr(block, RSTART, RLENGTH)
          if (f != "") { gsub(/^[ \t]+|[ \t]+$/, "", f); print start "|" f }
        }
      }
    ' "$FILE" 2>/dev/null || true)
  fi

  # ── 21. Clickable div/span ──────────────────────────────────────────────────
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE 'role=["'"'"']?(button|link)|<button|<a[ >]|tabIndex'; then
      continue
    fi
    if echo "$match" | grep -qE '<(div|span)[^>]*onClick'; then
      flag "$FILE" "$lineno" "Clickable div/span" "$match" "Use a real <button>/<a> — focus, keyboard activation, and semantics come free."
    fi
  done < <(grep -nE '<(div|span)[^>]*onClick' "$FILE" 2>/dev/null || true)

  # ── 22. Icon-only button without aria-label (heuristic, same-line only) ─────
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qiE 'aria-label|aria-labelledby'; then
      continue
    fi
    # Only flag when the button visibly contains just an icon on this line: strip every tag
    # between <button …> and </button>; any visible text left over is a label.
    if echo "$match" | grep -qE '<button[^>]*>[[:space:]]*<(svg|img|[A-Z][A-Za-z]*Icon)'; then
      inner="$(printf '%s' "$match" | sed -E 's/.*<button[^>]*>//; s/<\/button>.*//; s/<[^>]*>//g; s/[[:space:]]+//g')"
      [ -n "$inner" ] && continue
      flag "$FILE" "$lineno" "Icon-only button without aria-label" "$match" "Add aria-label — an unlabelled icon button doesn't exist for screen readers."
    fi
  done < <(grep -nE '<button' "$FILE" 2>/dev/null || true)

  # ── 23. Emoji as chrome icons ───────────────────────────────────────────────
  # Emoji is banned in chrome (buttons, nav/tab bar, toolbars, notification
  # icons). Content emoji (mood categories, posts, labels) is a legitimate,
  # documented JP consumer convention and is NOT flagged — detection requires a
  # chrome context on the line. Limited to 4-byte emoji (U+1F000+, the 😀🔔👥
  # class); ✓/→-class symbols are ignored to avoid false positives.
  EMOJI_BYTES=$'\xf0\x9f'
  while IFS=: read -r lineno match; do
    if echo "$match" | LC_ALL=C grep -qE "<[A-Za-z]*[Bb]utton[^>]*>[^<]*${EMOJI_BYTES}"; then
      flag "$FILE" "$lineno" "Emoji as chrome icon (button label)" "$match" "Chrome uses the SVG icon set; emoji stays in content (rules.md → Emoji as system/chrome icons)."
      continue
    fi
    if echo "$match" | grep -qiE 'tab-?bar|<nav\b|navbar|toolbar|menu-?item|notif[a-z-]*-?icon|role=["'"'"']?(button|tab|menuitem)'; then
      flag "$FILE" "$lineno" "Emoji as chrome icon" "$match" "Chrome uses the SVG icon set; emoji stays in content (rules.md → Emoji as system/chrome icons)."
    fi
  done < <(LC_ALL=C grep -n "$EMOJI_BYTES" "$FILE" 2>/dev/null || true)

  # ── 24. Broken / placeholder image src ──────────────────────────────────────
  # An <img> with an empty or placeholder src ships as a broken-image box.
  # Only same-line empty/placeholder values are flagged (multi-line tags and
  # dynamic src={expr} are left alone — no false positives on JSX).
  while IFS=: read -r lineno match; do
    if echo "$match" | grep -qE 'src=["'"'"'][[:space:]]*["'"'"']|src=["'"'"']#["'"'"']|src=["'"'"'](placeholder|TODO|FIXME|about:blank)'; then
      flag "$FILE" "$lineno" "Broken/placeholder image src" "$match" "Use a real image, a generated asset, or remove the tag — empty src ships a broken-image box."
    fi
  done < <(grep -n '<img' "$FILE" 2>/dev/null || true)

  # ── 25. Override-citation integrity ─────────────────────────────────────────
  # A code comment that cites a DESIGN.md override ("per DESIGN.md override
  # 2026-07-11", "override: gradient-cta", "id: gradient-cta") must resolve to a
  # real entry in the DESIGN.md override log. A bogus citation launders a Tier-2
  # pattern past review — a whole-product review found a gradient CTA citing a
  # non-existent 2026-07-11 override. Mechanises the scan-exceptions↔override-log
  # governance for inline code citations. Verified only when a DESIGN.md exists
  # (nothing to resolve against otherwise).
  if [ -n "$DESIGN_MD" ]; then
    while IFS=: read -r lineno match; do
      # comment context only
      echo "$match" | grep -qE '(//|/\*|\*/|[[:space:]]\*[[:space:]]|#|<!--)' || continue
      # a citation references the design doc or uses the id:/override: convention
      echo "$match" | grep -qiE 'design[-_]?system|design\.md|\bid:[[:space:]]*[a-z0-9-]|override:' || continue
      cite=""
      if echo "$match" | grep -qiE '\bid:[[:space:]]*[a-z0-9-]{3,}'; then
        cite=$(echo "$match" | sed -nE 's/.*[iI][dD]:[[:space:]]*([a-zA-Z0-9-]{3,}).*/\1/p' | head -1)
      elif echo "$match" | grep -qiE 'override[s]?:?[[:space:]]+[a-z][a-z0-9-]{2,}'; then
        cite=$(echo "$match" | sed -nE 's/.*[oO]verride[s]?:?[[:space:]]+([a-zA-Z][a-zA-Z0-9-]{2,}).*/\1/p' | head -1)
      fi
      dcite=$(echo "$match" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1 || true)
      if [ -n "$cite" ] && ! grep -qiF "$cite" "$DESIGN_MD"; then
        flag "$FILE" "$lineno" "Override citation not in DESIGN.md override log" "$match" "Cited override '$cite' has no matching entry in ${DESIGN_MD##*/} override log. Add the entry, fix the citation, or remove the pattern."
      elif [ -n "$dcite" ] && ! grep -qF "$dcite" "$DESIGN_MD"; then
        flag "$FILE" "$lineno" "Override citation not in DESIGN.md override log" "$match" "Cited override date '$dcite' has no matching entry in ${DESIGN_MD##*/} override log. Add the entry, fix the citation, or remove the pattern."
      fi
    done < <(grep -niE 'override' "$FILE" 2>/dev/null || true)
  fi

  # ── 26. Semantic-palette leak — meaning-carrying ramp used for decoration ────
  # The semantic/index ramp (--index-*, --status-*, --semantic-*, --category-*, or
  # a project-declared ramp) exists to *mean* something. Using it in a border /
  # accent stripe / box-shadow — a decorative slot that encodes nothing — corrupts
  # the signalling layer. This is a Tier-1 correctness failure (ERROR), not a
  # waivable Tier-2 gate, so scan-exceptions cannot suppress it.
  # A project may extend the ramp-name pattern via a "# semantic-ramp: <regex>"
  # line in scan-exceptions.conf (read below as SEMANTIC_RAMP_RE).
  SEMANTIC_RAMP_RE='\-\-(index|status|semantic|category|meaning)-'
  if [ -f "$ROOT/scan-exceptions.conf" ]; then
    _extra=$(grep -iE '^[[:space:]]*#[[:space:]]*semantic-ramp:' "$ROOT/scan-exceptions.conf" 2>/dev/null \
      | sed -E 's/^[[:space:]]*#[[:space:]]*semantic-ramp:[[:space:]]*//' | head -1 || true)
    [ -n "$_extra" ] && SEMANTIC_RAMP_RE="${SEMANTIC_RAMP_RE}|${_extra}"
  fi
  while IFS=: read -r lineno match; do
    # Only decorative slots: a border / accent stripe / shadow declaration.
    echo "$match" | grep -qiE 'border(-top|-right|-bottom|-left)?[[:space:]]*:|box-?shadow[[:space:]]*:|outline[[:space:]]*:' || continue
    # …carrying a semantic-ramp token.
    echo "$match" | grep -qiE "var\([[:space:]]*(${SEMANTIC_RAMP_RE})" || continue
    # Chips/badges/pills legitimately carry a status colour — but as a *fill*, not
    # a border; a bordered chip drawing its ring from the ramp is still a leak, so
    # only exempt when the same line is clearly a fill context, handled by grep of
    # 'background'. Here we are already on a border/shadow line, so no fill exempt.
    flag "$FILE" "$lineno" "Semantic-palette leak (meaning ramp used as decoration)" "$match" "The semantic/index ramp must carry real encoded meaning, never decoration. Use the neutral ramp, surface, or weight for borders/accents; reserve the semantic ramp for status/category fills. Tier-1 — not overridable."
  done < <(grep -niE "var\([[:space:]]*(${SEMANTIC_RAMP_RE})" "$FILE" 2>/dev/null || true)

  # ── 27. Decorative accent border/stripe (advisory, RISK) ────────────────────
  # Lower-confidence: a saturated coloured border-top/left stripe (2–4px) on a
  # card/section, regardless of token source. Surfaces for sign-off; not a hard
  # fail on its own (a real bordered callout may be legitimate).
  while IFS=: read -r lineno match; do
    px=$(echo "$match" | grep -oE '[0-9]+px' | head -1 | tr -d 'px' || true)
    [ -n "$px" ] || continue
    if [ "$px" -ge 2 ] && [ "$px" -le 4 ] 2>/dev/null; then
      # Skip neutral hairline tokens / greys (not an accent) and focus contexts.
      echo "$match" | grep -qiE 'var\([[:space:]]*\-\-border|#(fff|000|[0-9a-f]{3}\b)|transparent|currentcolor|focus|ring' && continue
      context=$(sed -n "$((lineno > 3 ? lineno - 3 : 1)),${lineno}p" "$FILE" | grep -iE 'card|panel|section|\.box|container|phase|roadmap' || true)
      if [ -n "$context" ]; then
        flag "$FILE" "$lineno" "Decorative accent border (advisory) — encodes no data?" "$match" "A coloured top/side accent stripe reads as decoration unless it maps to real status. Carry order/hierarchy with structure/weight/surface, or map + document it."
      fi
    fi
  done < <(grep -niE 'border-(top|left)[[:space:]]*:' "$FILE" 2>/dev/null || true)

done

# ── Summary ────────────────────────────────────────────────────────────────────

echo "────────────────────────────────────────"
if [ "$VIOLATIONS" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✔ Static scan passed — no detectable prohibited patterns.${RESET}"
  echo -e "  ${BOLD}This is not visual or accessibility approval.${RESET} The scanner is regex-only: it"
  echo -e "  cannot judge contrast, coherence, hierarchy, or context. Run @skills/ui-design-review"
  echo -e "  (visual review) before sign-off."
  exit 0
fi

echo -e "  ${BOLD}Tiers:${RESET} ${RED}ERROR ${ERRORS}${RESET} (Tier-1 defects) · ${YELLOW}REVIEW ${REVIEWS}${RESET} (Tier-2, need a documented rationale) · RISK ${RISKS} (Tier-3, advisory)"
if [ "$TIERED" -eq 1 ]; then
  if [ "$ERRORS" -gt 0 ] || [ "$REVIEWS" -gt 0 ]; then
    echo -e "${RED}${BOLD}✘ NEEDS FIXES (--tiered) — ${ERRORS} ERROR + ${REVIEWS} REVIEW.${RESET}"
    echo -e "  ERROR = correctness/a11y; REVIEW = a Tier-2 pattern with no documented override. Run @skills/ui-design-review."
    exit 1
  else
    echo -e "${YELLOW}${BOLD}~ RISK-only (${RISKS}) — passes --tiered; advisory, review recommended.${RESET}"
    echo -e "  Tier-3 co-occurrence tells are not a hard failure alone. Run @skills/ui-design-review to weigh them."
    exit 0
  fi
else
  echo -e "${RED}${BOLD}✘ NEEDS FIXES — ${VIOLATIONS} violation(s) found.${RESET}"
  echo -e "  Resolve before merging (or pass --tiered to gate on ERROR/REVIEW only). Run @skills/ui-design-review for full visual review."
  exit 1
fi
