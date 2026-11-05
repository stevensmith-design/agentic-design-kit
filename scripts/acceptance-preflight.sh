#!/usr/bin/env bash
# Authenticate the fixture and every active design skill before or after visual acceptance.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE="$(cd "$SCRIPT_DIR/.." && pwd)"
PROFILE="v2"; PHASE="before"; CATALOG=""; SKILL_ROOT=""; ALLOWED=""

usage() {
  echo "usage: $0 --profile v1|v2 --phase before|after --catalog FILE --skill-root DIR [--allowed FILE]"
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

receipt_value() {
  awk -F '\t' -v key="$2" '$1 == key { print $2; exit }' "$1"
}

ancestor_contamination() {
  local at="$1" candidate
  while [ "$at" != "/" ]; do
    for candidate in CLAUDE.md CLAUDE.local.md AGENTS.md GEMINI.md .cursorrules \
      .github/copilot-instructions.md .codex/README.md; do
      [ ! -e "$at/$candidate" ] || { echo "$at/$candidate"; return 1; }
    done
    at="$(dirname "$at")"
  done
}

lock_matches() {
  python3 - "$1" "$2" "$3" <<'PY'
import hashlib, json, os, sys
lock_path, name, origin = sys.argv[1:]
try:
    lock = json.load(open(lock_path, encoding="utf-8"))
    expected = lock["skills"][name]["files"]["SKILL.md"]
except (OSError, KeyError, json.JSONDecodeError):
    raise SystemExit(1)
actual = hashlib.sha256(open(origin, "rb").read()).hexdigest()
raise SystemExit(0 if actual == expected else 1)
PY
}

catalog_packaged_active() {
  local name="$1" origin="$2"
  awk -F '\t' -v n="$name" -v o="$origin" '
    $1 == n && ($2 == "loaded" || $2 == "invoked") && $4 == o && $5 == "packaged" { found=1 }
    END { exit !found }
  ' "$CATALOG"
}

catalog_packaged_invoked() {
  local name="$1" origin="$2"
  awk -F '\t' -v n="$name" -v o="$origin" '
    $1 == n && $2 == "invoked" && $4 == o && $5 == "packaged" { found=1 }
    END { exit !found }
  ' "$CATALOG"
}

catalog_has_packaged_row() {
  local name="$1"
  awk -F '\t' -v n="$name" '$1 == n && $5 == "packaged" { found=1 } END { exit !found }' \
    "$CATALOG"
}

always_on_refs() {
  python3 - "$1" <<'PY'
import re, sys
text = open(sys.argv[1], encoding="utf-8").read()
for value in sorted(set(re.findall(r"@([A-Za-z0-9_./-]+)", text))):
    value = value.rstrip(".,;:!?)]}")
    if value.endswith("/SKILL.md"):
        print(value)
PY
}

run_check() {
  local skill_root fixture receipt development receipt_dest instruction expected_count
  local name status role origin ownership extra origin_real expected expected_real ref

  [ -f "$CATALOG" ] || { echo "DIAGNOSTIC ONLY — ACTIVE SKILL CATALOG MISSING"; return 3; }
  [ -f "$ALLOWED" ] || { echo "DIAGNOSTIC ONLY — ALLOWED SKILL CATALOG MISSING"; return 3; }
  [ -d "$SKILL_ROOT" ] || { echo "INVALID — PACKAGED SKILL ROOT MISSING"; return 1; }
  skill_root="$(realpath_of "$SKILL_ROOT")"
  [ "$(basename "$skill_root")" = "skills" ] && [ "$(basename "$(dirname "$skill_root")")" = ".claude" ] || {
    echo "INVALID — PACKAGED SKILL ROOT IS NOT .claude/skills"; return 1;
  }
  fixture="$(dirname "$(dirname "$skill_root")")"
  receipt="$fixture/acceptance-fixture-receipt.tsv"
  [ -f "$receipt" ] || { echo "DIAGNOSTIC ONLY — ISOLATED FIXTURE RECEIPT MISSING"; return 3; }
  development="$(receipt_value "$receipt" development_repository)"
  receipt_dest="$(receipt_value "$receipt" destination)"
  [ -n "$development" ] && [ -n "$receipt_dest" ] || {
    echo "DIAGNOSTIC ONLY — ISOLATED FIXTURE RECEIPT INCOMPLETE"; return 3;
  }
  [ "$(realpath_of "$receipt_dest")" = "$fixture" ] || {
    echo "INVALID — FIXTURE RECEIPT DESTINATION MISMATCH"; return 1;
  }
  if inside_root "$development" "$fixture"; then
    echo "INVALID — FIXTURE INSIDE DEVELOPMENT REPOSITORY"; return 1
  fi
  if git -C "$fixture" rev-parse --show-toplevel >/dev/null 2>&1; then
    echo "INVALID — INHERITED PROJECT GIT ROOT"; return 1
  fi
  if ! instruction="$(ancestor_contamination "$(dirname "$fixture")")"; then
    echo "INVALID — ANCESTOR PROJECT INSTRUCTIONS: $instruction"; return 1
  fi
  expected_count=$(awk -F '\t' '!/^#/ && NF { n++ } END { print n+0 }' "$ALLOWED")
  bash "$fixture/scripts/check-package-wiring.sh" "$fixture" "$expected_count" >/dev/null || {
    echo "INVALID — PACKAGE WIRING UNRESOLVED"; return 1;
  }

  while IFS=$'\t' read -r name status role origin ownership extra; do
    [ -n "$name" ] || continue; case "$name" in \#*|name) continue ;; esac
    [ -z "${extra:-}" ] || { echo "DIAGNOSTIC ONLY — ACTIVE SKILL CATALOG MALFORMED"; return 3; }
    case "$status" in available|loaded|invoked) ;; *)
      echo "DIAGNOSTIC ONLY — ACTIVE SKILL STATUS INVALID: $name"; return 3 ;;
    esac
    case "$ownership" in packaged|external) ;; *)
      echo "DIAGNOSTIC ONLY — ACTIVE SKILL OWNERSHIP INVALID: $name"; return 3 ;;
    esac
    case "$origin" in /*) ;; *)
      echo "DIAGNOSTIC ONLY — SKILL ORIGIN IS NOT ABSOLUTE: $name"; return 3 ;;
    esac

    if [ "$ownership" = "external" ]; then
      if { [ "$status" = "loaded" ] || [ "$status" = "invoked" ]; } \
          && { [[ "$role" == design-* ]] || [ "$name" = "frontend-design" ]; }; then
        echo "INVALID — EXTERNAL DESIGN SKILL ACTIVE"
        return 42
      fi
      continue
    fi

    catalog_has_packaged_row "$name" || {
      echo "DIAGNOSTIC ONLY — PACKAGED SKILL CATALOG INCOMPLETE: $name"; return 3;
    }
    expected="$skill_root/$name/SKILL.md"
    [ -f "$expected" ] || { echo "INVALID — PACKAGED SKILL MISSING: $name"; return 1; }
    expected_real="$(realpath_of "$expected")"
    origin_real="$(realpath_of "$origin")"
    [ "$origin" = "$origin_real" ] || {
      echo "INVALID — PACKAGED SKILL ORIGIN IS NOT RESOLVED: $name"; return 1;
    }
    inside_root "$skill_root" "$origin_real" || {
      echo "INVALID — PACKAGED SKILL ORIGIN ESCAPES FIXTURE: $name"; return 1;
    }
    [ "$origin_real" = "$expected_real" ] || {
      echo "INVALID — PACKAGED SKILL ORIGIN MISMATCH: $name"; return 1;
    }
    [ ! -L "$origin" ] || {
      echo "INVALID — PACKAGED SKILL ORIGIN IS A SYMLINK: $name"; return 1;
    }
    lock_matches "$fixture/skills-lock.json" "$name" "$origin" || {
      echo "INVALID — PACKAGED SKILL LOCK MISMATCH: $name"; return 1;
    }
  done < "$CATALOG"

  while IFS=$'\t' read -r name role; do
    [ -n "$name" ] || continue; case "$name" in \#*) continue ;; esac
    catalog_has_packaged_row "$name" || {
      echo "DIAGNOSTIC ONLY — PACKAGED SKILL CATALOG INCOMPLETE: $name"; return 3;
    }
  done < "$ALLOWED"

  while IFS= read -r ref; do
    name="$(basename "$(dirname "$ref")")"
    expected_real="$(realpath_of "$fixture/$ref")"
    catalog_packaged_active "$name" "$expected_real" || {
      echo "DIAGNOSTIC ONLY — ALWAYS-ON SKILL LOAD UNVERIFIED: $name"; return 3;
    }
  done < <(always_on_refs "$fixture/CLAUDE.md")

  if [ "$PROFILE" = "v2" ]; then
    expected_real="$(realpath_of "$skill_root/direction-study/SKILL.md")"
    catalog_packaged_active direction-study "$expected_real" || {
      echo "DIAGNOSTIC ONLY — DIRECTION-STUDY NOT READY"; return 3;
    }
    if awk -F '\t' '$1 == "starter-directions" && ($2 == "loaded" || $2 == "invoked") { bad=1 } END { exit !bad }' "$CATALOG"; then
      echo "INVALID — STARTER-DIRECTIONS ACTIVE FOR REFERENCE-LED REQUEST"; return 1
    fi
    if [ "$PHASE" = "after" ]; then
      catalog_packaged_invoked direction-study "$expected_real" || {
        echo "INVALID — DIRECTION-STUDY WAS NOT INVOKED"; return 1;
      }
    fi
  else
    for name in hallmark impeccable; do
      expected_real="$(realpath_of "$skill_root/$name/SKILL.md")"
      catalog_packaged_active "$name" "$expected_real" || {
        echo "DIAGNOSTIC ONLY — V1 INTEGRATION SKILL NOT READY: $name"; return 3;
      }
      if [ "$PHASE" = "after" ]; then
        catalog_packaged_invoked "$name" "$expected_real" || {
          echo "INVALID — V1 INTEGRATION SKILL WAS NOT INVOKED: $name"; return 1;
        }
      fi
    done
  fi

  echo "VALID — KIT-ONLY DESIGN SKILLS ACTIVE"
}

write_lock() {
  python3 - "$1" <<'PY'
import hashlib, json, os, sys
root = sys.argv[1]
skills = {}
for name in sorted(os.listdir(os.path.join(root, ".claude", "skills"))):
    path = os.path.join(root, ".claude", "skills", name, "SKILL.md")
    if os.path.isfile(path):
        skills[name] = {"files": {"SKILL.md": hashlib.sha256(open(path, "rb").read()).hexdigest()}}
json.dump({"skills": skills}, open(os.path.join(root, "skills-lock.json"), "w"), indent=2)
PY
}

write_catalog() {
  local fixture="$1" external="$2" name role
  fixture="$(realpath_of "$fixture")"
  external="$(realpath_of "$external")"
  {
    printf '# name\tstatus\trole\tresolved_absolute_origin\townership\n'
    while IFS=$'\t' read -r name role; do
      [ -n "$name" ] || continue; case "$name" in \#*) continue ;; esac
      case "$name" in
        design-build|ui-design-principles|direction-study) status=loaded ;;
        *) status=available ;;
      esac
      printf '%s\t%s\t%s\t%s\tpackaged\n' "$name" "$status" "$role" \
        "$fixture/.claude/skills/$name/SKILL.md"
    done < "$fixture/acceptance/allowed-v2-skills.tsv"
    printf 'direction-study\tavailable\tdesign-orchestrator\t%s\texternal\n' \
      "$external/direction-study/SKILL.md"
  } > "$fixture/active-skills.tsv"
}

make_fixture() {
  local fixture="$1" external="$2" name role
  mkdir -p "$fixture/.claude/skills" "$fixture/acceptance" "$fixture/scripts" \
    "$external/direction-study"
  cp "$PACKAGE/acceptance/allowed-v2-skills.tsv" "$fixture/acceptance/"
  cp "$PACKAGE/acceptance/allowed-v1-skills.tsv" "$fixture/acceptance/"
  while IFS=$'\t' read -r name role; do
    [ -n "$name" ] || continue; case "$name" in \#*) continue ;; esac
    mkdir -p "$fixture/.claude/skills/$name"
    printf '%s\n' '---' "name: $name" 'description: fixture' '---' > \
      "$fixture/.claude/skills/$name/SKILL.md"
  done < "$PACKAGE/acceptance/allowed-v2-skills.tsv"
  printf '%s\n' '---' 'name: direction-study' 'description: external fixture' '---' > \
    "$external/direction-study/SKILL.md"
  printf '%s\n' 'Follow @.claude/skills/design-build/SKILL.md.' \
    'Apply @.claude/skills/ui-design-principles/SKILL.md.' > "$fixture/CLAUDE.md"
  cp "$PACKAGE/scripts/check-package-wiring.sh" "$fixture/scripts/"
  write_lock "$fixture"
  printf 'source_commit\ttest\nsource_package\t/mock\ndevelopment_repository\t/definitely/not/the/fixture\ndestination\t%s\npackage_wiring\tpassed\n' \
    "$fixture" > "$fixture/acceptance-fixture-receipt.tsv"
  write_catalog "$fixture" "$external"
}

expect_invalid() {
  local label="$1" expected="$2"; shift 2
  local out rc
  set +e; out=$("$@" 2>&1); rc=$?; set -e
  [ "$rc" -ne 0 ] && grep -qF "$expected" <<< "$out" || {
    echo "✘ self-test did not reject $label"; return 1;
  }
}

self_test() {
  local tmp fixture external catalog origin
  tmp="$(realpath_of "$(mktemp -d)")"; fixture="$tmp/fixture"; external="$tmp/external"
  trap 'rm -rf "${tmp:-}"' EXIT
  make_fixture "$fixture" "$external"
  catalog="$fixture/active-skills.tsv"

  [ "$("$0" --profile v2 --phase before --catalog "$catalog" \
      --skill-root "$fixture/.claude/skills")" = 'VALID — KIT-ONLY DESIGN SKILLS ACTIVE' ]

  cp "$catalog" "$tmp/base.tsv"
  printf 'direction-study\tloaded\tdesign-orchestrator\t%s\texternal\n' \
    "$external/direction-study/SKILL.md" >> "$catalog"
  expect_invalid "same-named external loaded" 'INVALID — EXTERNAL DESIGN SKILL ACTIVE' \
    "$0" --profile v2 --phase before --catalog "$catalog" --skill-root "$fixture/.claude/skills"

  cp "$tmp/base.tsv" "$catalog"
  printf 'direction-study\tinvoked\tdesign-orchestrator\t%s\texternal\n' \
    "$external/direction-study/SKILL.md" >> "$catalog"
  expect_invalid "same-named external invoked" 'INVALID — EXTERNAL DESIGN SKILL ACTIVE' \
    "$0" --profile v2 --phase before --catalog "$catalog" --skill-root "$fixture/.claude/skills"

  cp "$tmp/base.tsv" "$catalog"
  python3 - "$catalog" "$external/direction-study/SKILL.md" <<'PY'
import sys
p, external = sys.argv[1:]
rows = open(p).read().splitlines()
rows = [r if not r.startswith("direction-study\tloaded\t") else r.split("\t")[0] + "\tloaded\tdesign-orchestrator\t" + external + "\tpackaged" for r in rows]
open(p, "w").write("\n".join(rows) + "\n")
PY
  expect_invalid "a packaged-name row at an external path" 'INVALID — PACKAGED SKILL ORIGIN ESCAPES FIXTURE' \
    "$0" --profile v2 --phase before --catalog "$catalog" --skill-root "$fixture/.claude/skills"

  cp "$tmp/base.tsv" "$catalog"
  mv "$fixture/.claude/skills/direction-study/SKILL.md" "$tmp/real-direction-study.md"
  ln -s "$tmp/real-direction-study.md" "$fixture/.claude/skills/direction-study/SKILL.md"
  origin="$fixture/.claude/skills/direction-study/SKILL.md"
  expect_invalid "a symlink escaping the fixture" 'INVALID — PACKAGED SKILL ORIGIN IS NOT RESOLVED' \
    "$0" --profile v2 --phase before --catalog "$catalog" --skill-root "$fixture/.claude/skills"

  echo "✔ origin-aware preflight fixtures passed: packaged, collision available/loaded/invoked, path, symlink"
}

if [ "${1:-}" = "--self-test" ]; then self_test; exit; fi
while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="${2:-}"; shift 2 ;;
    --phase) PHASE="${2:-}"; shift 2 ;;
    --catalog) CATALOG="${2:-}"; shift 2 ;;
    --skill-root) SKILL_ROOT="${2:-}"; shift 2 ;;
    --allowed) ALLOWED="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) usage; exit 2 ;;
  esac
done
[ "$PROFILE" = "v1" ] || [ "$PROFILE" = "v2" ] || { usage; exit 2; }
[ "$PHASE" = "before" ] || [ "$PHASE" = "after" ] || { usage; exit 2; }
[ -n "$CATALOG" ] && [ -n "$SKILL_ROOT" ] || { usage; exit 2; }
[ -n "$ALLOWED" ] || ALLOWED="$PACKAGE/acceptance/allowed-$PROFILE-skills.tsv"
run_check
