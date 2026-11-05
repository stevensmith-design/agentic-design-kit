#!/usr/bin/env bash
# Copy a release package into an isolated consumer fixture outside the development repository.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE="$(cd "$SCRIPT_DIR/.." && pwd)"

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

metadata_value() {
  awk -F '\t' -v key="$1" '$1 == key { print $2; exit }' "$PACKAGE/acceptance/package-metadata.tsv"
}

ancestor_contamination() {
  local at="$1" hit="" candidate
  while [ "$at" != "/" ]; do
    for candidate in CLAUDE.md CLAUDE.local.md AGENTS.md GEMINI.md .cursorrules \
      .github/copilot-instructions.md .codex/README.md; do
      [ ! -e "$at/$candidate" ] || hit="${hit}${hit:+$'\n'}$at/$candidate"
    done
    at="$(dirname "$at")"
  done
  [ -z "$hit" ] || { printf '%s\n' "$hit"; return 1; }
}

prepare() {
  local requested="$1" destination parent development commit expected created=0 contamination=""
  [ -f "$PACKAGE/acceptance/package-metadata.tsv" ] || {
    echo "INVALID — PACKAGE METADATA MISSING"; return 1;
  }
  commit="$(metadata_value source_commit)"
  development="$(metadata_value development_repository)"
  [ -n "$commit" ] && [ -n "$development" ] || {
    echo "INVALID — PACKAGE METADATA INCOMPLETE"; return 1;
  }

  destination="$(realpath_of "$requested")"
  parent="$(dirname "$destination")"
  [ -d "$parent" ] || { echo "INVALID — DESTINATION PARENT MISSING: $parent"; return 1; }
  [ ! -e "$destination" ] || { echo "INVALID — DESTINATION ALREADY EXISTS: $destination"; return 1; }
  if inside_root "$development" "$destination"; then
    echo "INVALID — FIXTURE INSIDE DEVELOPMENT REPOSITORY"
    return 1
  fi
  if inside_root "$PACKAGE" "$destination"; then
    echo "INVALID — FIXTURE INSIDE SOURCE PACKAGE"
    return 1
  fi
  if git -C "$parent" rev-parse --show-toplevel >/dev/null 2>&1; then
    echo "INVALID — INHERITED PROJECT GIT ROOT"
    return 1
  fi
  if ! contamination="$(ancestor_contamination "$parent")"; then
    echo "INVALID — ANCESTOR PROJECT INSTRUCTIONS"
    printf '%s\n' "$contamination" | sed 's/^/  /'
    return 1
  fi

  mkdir "$destination"; created=1
  cleanup() { [ "$created" -eq 0 ] || rm -rf "$destination"; }
  trap cleanup RETURN

  mkdir -p "$destination/scripts"
  cp -R "$PACKAGE/.claude" "$destination/.claude"
  cp "$PACKAGE/CLAUDE.md" "$PACKAGE/README.md" "$PACKAGE/skills-lock.json" "$destination/"
  [ ! -f "$PACKAGE/LICENSE" ] || cp "$PACKAGE/LICENSE" "$destination/LICENSE"
  [ ! -f "$PACKAGE/NOTICE" ] || cp "$PACKAGE/NOTICE" "$destination/NOTICE"
  cp -R "$PACKAGE/acceptance" "$destination/acceptance"
  if [ -f "$PACKAGE/scripts/folder-preflight.py" ]; then
    cp "$PACKAGE/scripts/folder-preflight.py" "$destination/scripts/"
  fi
  cp "$PACKAGE/scripts/drift-check.sh" "$PACKAGE/scripts/check-package-wiring.sh" \
    "$PACKAGE/scripts/acceptance-preflight.sh" "$PACKAGE/scripts/prepare-acceptance-fixture.sh" \
    "$destination/scripts/"

  if git -C "$destination" rev-parse --show-toplevel >/dev/null 2>&1; then
    echo "INVALID — INHERITED PROJECT GIT ROOT"
    return 1
  fi
  expected=$(awk -F '\t' '!/^#/ && NF { n++ } END { print n+0 }' \
    "$destination/acceptance/allowed-v2-skills.tsv")
  bash "$destination/scripts/check-package-wiring.sh" "$destination" "$expected" >/dev/null || {
    echo "INVALID — PACKAGE WIRING UNRESOLVED"; return 1;
  }
  if find "$destination" -type d \( -name output -o -name outputs -o -name screenshots \
      -o -name eval-workspaces -o -name portfolio-directions -o -name acceptance-evidence \) \
      -print -quit | grep -q .; then
    echo "INVALID — PRIOR ACCEPTANCE OR GENERATED ARTIFACT COPIED"
    return 1
  fi

  {
    printf '# name\tstatus\trole\tresolved_absolute_origin\townership\n'
    while IFS=$'\t' read -r name role; do
      [ -n "$name" ] || continue; case "$name" in \#*) continue ;; esac
      printf '%s\tavailable\t%s\t%s\tpackaged\n' "$name" "$role" \
        "$destination/.claude/skills/$name/SKILL.md"
    done < "$destination/acceptance/allowed-v2-skills.tsv"
  } > "$destination/active-skills.tsv"

  {
    printf 'source_commit\t%s\n' "$commit"
    printf 'source_package\t%s\n' "$PACKAGE"
    printf 'development_repository\t%s\n' "$(realpath_of "$development")"
    printf 'destination\t%s\n' "$destination"
    printf 'prepared_at_utc\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    printf 'inherited_git_root\tnone\n'
    printf 'ancestor_project_instructions\tnone\n'
    printf 'package_wiring\tpassed\n'
  } > "$destination/acceptance-fixture-receipt.tsv"

  created=0
  trap - RETURN
  echo "READY — ISOLATED ACCEPTANCE FIXTURE"
  echo "  source commit: $commit"
  echo "  source package: $PACKAGE"
  echo "  destination: $destination"
}

make_mock_package() {
  local root="$1" development="$2" name role
  mkdir -p "$root/.claude/skills" "$root/acceptance" "$root/scripts" "$root/output"
  cp "$KIT/acceptance/allowed-v2-skills.tsv" "$root/acceptance/allowed-v2-skills.tsv"
  cp "$KIT/acceptance/allowed-v1-skills.tsv" "$root/acceptance/allowed-v1-skills.tsv"
  cp "$KIT/acceptance/README.md" "$root/acceptance/README.md"
  while IFS=$'\t' read -r name role; do
    [ -n "$name" ] || continue; case "$name" in \#*) continue ;; esac
    mkdir -p "$root/.claude/skills/$name"
    printf '%s\n' '---' "name: $name" 'description: fixture' '---' > \
      "$root/.claude/skills/$name/SKILL.md"
  done < "$KIT/acceptance/allowed-v2-skills.tsv"
  printf '%s\n' 'Follow @.claude/skills/design-build/SKILL.md.' \
    'Apply @.claude/skills/ui-design-principles/SKILL.md.' > "$root/CLAUDE.md"
  printf '%s\n' fixture > "$root/README.md"
  printf '%s\n' '{}' > "$root/skills-lock.json"
  printf 'source_commit\ttest-commit\ndevelopment_repository\t%s\n' "$development" > \
    "$root/acceptance/package-metadata.tsv"
  cp "$KIT/scripts/drift-check.sh" "$KIT/scripts/check-package-wiring.sh" \
    "$KIT/scripts/acceptance-preflight.sh" "$0" "$root/scripts/"
}

self_test() {
  local tmp outside package
  tmp="$(mktemp -d)"; outside="$(mktemp -d)"
  trap 'rm -rf "${tmp:-}" "${outside:-}"' EXIT
  package="$tmp/development/package"
  make_mock_package "$package" "$tmp/development"

  if "$package/scripts/prepare-acceptance-fixture.sh" "$tmp/development/inside" >/dev/null 2>&1; then
    echo "✘ self-test allowed a fixture inside the development repository"; return 1
  fi
  mkdir -p "$outside/contaminated"
  printf '%s\n' contamination > "$outside/contaminated/CLAUDE.md"
  if "$package/scripts/prepare-acceptance-fixture.sh" \
      "$outside/contaminated/fixture" >/dev/null 2>&1; then
    echo "✘ self-test allowed ancestor instructions"; return 1
  fi
  "$package/scripts/prepare-acceptance-fixture.sh" "$outside/clean-fixture" >/dev/null
  [ -f "$outside/clean-fixture/acceptance-fixture-receipt.tsv" ]
  [ ! -e "$outside/clean-fixture/output" ]
  bash "$outside/clean-fixture/scripts/check-package-wiring.sh" \
    "$outside/clean-fixture" 11 >/dev/null
  echo "✔ acceptance-fixture fixtures passed: outside, ancestors, whitelist, wiring, receipt"
}

KIT="$PACKAGE"
if [ "${1:-}" = "--self-test" ]; then self_test; exit; fi
[ $# -eq 1 ] || { echo "usage: $0 DESTINATION | --self-test"; exit 2; }
prepare "$1"
