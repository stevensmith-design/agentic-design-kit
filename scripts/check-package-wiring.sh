#!/usr/bin/env bash
# Verify that every @ path in a consumer CLAUDE.md names an exact packaged SKILL.md file.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT="$(cd "$SCRIPT_DIR/.." && pwd)"

references() {
  python3 - "$1" <<'PY'
import re, sys
text = open(sys.argv[1], encoding="utf-8").read()
for value in sorted(set(re.findall(r"@([A-Za-z0-9_./-]+)", text))):
    value = value.rstrip(".,;:!?)]}")
    if "/" in value:
        print(value)
PY
}

realpath_of() {
  python3 - "$1" <<'PY'
import os, sys
print(os.path.realpath(sys.argv[1]))
PY
}

inside_root() {
  python3 - "$1" "$2" <<'PY'
import os, sys
root, path = map(os.path.realpath, sys.argv[1:])
try:
    ok = os.path.commonpath([root, path]) == root
except ValueError:
    ok = False
raise SystemExit(0 if ok else 1)
PY
}

check_fixture() {
  local root="$1" expected="${2:-}"
  local claude="$root/CLAUDE.md" root_real fail=0 refs=0 ref target target_real count

  [ -f "$claude" ] || { echo "INVALID — CLAUDE.md MISSING"; return 1; }
  root_real="$(realpath_of "$root")"
  while IFS= read -r ref; do
    [ -n "$ref" ] || continue
    refs=$((refs + 1))
    case "/$ref/" in
      */../*) echo "  ✘ path traversal is not allowed: @$ref"; fail=$((fail + 1)); continue ;;
    esac
    case "$ref" in
      /*) echo "  ✘ absolute @ path is not package-relative: @$ref"; fail=$((fail + 1)); continue ;;
      */SKILL.md) ;;
      *) echo "  ✘ directory-only or non-SKILL reference: @$ref"; fail=$((fail + 1)); continue ;;
    esac

    target="$root/$ref"
    target_real="$(realpath_of "$target")"
    if ! inside_root "$root_real" "$target_real"; then
      echo "  ✘ @ path escapes the package root: @$ref"
      fail=$((fail + 1)); continue
    fi
    if [ ! -f "$target" ]; then
      echo "  ✘ missing referenced file: @$ref"
      fail=$((fail + 1)); continue
    fi
    if [ -L "$target" ]; then
      echo "  ✘ referenced SKILL.md is a symlink: @$ref"
      fail=$((fail + 1)); continue
    fi
    echo "  ✔ @$ref -> ${target_real#$root_real/}"
  done < <(references "$claude")

  [ "$refs" -gt 0 ] || { echo "  ✘ no @ path references in CLAUDE.md"; fail=$((fail + 1)); }
  if [ -n "$expected" ]; then
    count=$(find "$root/.claude/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" = "$expected" ]; then
      echo "  ✔ consumer fixture contains $count skill directories"
    else
      echo "  ✘ consumer fixture contains $count skill directories; expected $expected"
      fail=$((fail + 1))
    fi
  fi
  [ "$fail" -eq 0 ] || { echo "INVALID — PACKAGE WIRING UNRESOLVED"; return 1; }
  echo "✔ package wiring resolved: $refs explicit SKILL.md reference(s)"
}

write_fixture() {
  local root="$1" ref="$2"
  mkdir -p "$root/.claude/skills/design-build"
  printf '%s\n' "Follow @$ref." > "$root/CLAUDE.md"
  printf '%s\n' '---' 'name: design-build' 'description: fixture' '---' > \
    "$root/.claude/skills/design-build/SKILL.md"
}

expect_reject() {
  local label="$1" root="$2"
  if check_fixture "$root" >/dev/null 2>&1; then
    echo "✘ self-test accepted $label"
    return 1
  fi
}

self_test() {
  local tmp outside
  tmp="$(mktemp -d)"; outside="$(mktemp -d)"
  trap 'rm -rf "${tmp:-}" "${outside:-}"' EXIT

  write_fixture "$tmp/explicit" '.claude/skills/design-build/SKILL.md'
  check_fixture "$tmp/explicit" 1 >/dev/null

  write_fixture "$tmp/directory" '.claude/skills/design-build'
  expect_reject "a directory-only reference" "$tmp/directory"

  write_fixture "$tmp/missing" '.claude/skills/design-build/SKILL.md'
  rm "$tmp/missing/.claude/skills/design-build/SKILL.md"
  expect_reject "a missing SKILL.md" "$tmp/missing"

  mkdir -p "$tmp/escape" "$outside/design-build"
  printf '%s\n' 'Follow @../outside/design-build/SKILL.md.' > "$tmp/escape/CLAUDE.md"
  printf '%s\n' fixture > "$outside/design-build/SKILL.md"
  expect_reject "a package-root escape" "$tmp/escape"

  echo "✔ package-wiring fixtures passed: explicit, directory-only, missing, escape"
}

if [ "${1:-}" = "--self-test" ]; then self_test; exit; fi
ROOT="${1:-.}"; EXPECTED="${2:-}"
ROOT="$(cd "$ROOT" && pwd)"
check_fixture "$ROOT" "$EXPECTED"
