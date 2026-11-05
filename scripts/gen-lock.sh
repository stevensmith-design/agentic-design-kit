#!/usr/bin/env bash
# Regenerate skills-lock.json from the current contents of skills/.
# Per-file sha256 + a per-skill rollup hash. Run after any intentional edit.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$KIT/skills"
{
  echo '{'
  echo '  "version": 2,'
  echo "  \"generated\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo '  "provenance": "ported from ~/Desktop/design_skills on 2026-09-08; upstream tree left untouched as archive",'
  echo '  "skills": {'
  first_skill=1
  for s in $(ls -1d */ | sed 's#/##' | sort); do
    [ $first_skill -eq 1 ] || echo ','
    first_skill=0
    files=$(find "$s" -type f \
      ! -name '.DS_Store' \
      ! -name '*.pyc' \
      ! -path '*/__pycache__/*' \
      ! -path '*/_to_delete/*' | sort)
    rollup=$(printf '%s\n' "$files" | while read -r f; do shasum -a 256 "$f"; done | shasum -a 256 | cut -d' ' -f1)
    count=$(printf '%s\n' "$files" | grep -c . || true)
    printf '    "%s": {\n      "fileCount": %s,\n      "rollup": "%s",\n      "files": {\n' "$s" "$count" "$rollup"
    first_file=1
    printf '%s\n' "$files" | while read -r f; do
      h=$(shasum -a 256 "$f" | cut -d' ' -f1)
      rel=${f#"$s"/}
      if [ $first_file -eq 1 ]; then first_file=0; else printf ',\n'; fi
      printf '        "%s": "%s"' "$rel" "$h"
    done
    printf '\n      }\n    }'
  done
  echo ''
  echo '  }'
  echo '}'
} > "$KIT/skills-lock.json"
echo "wrote $KIT/skills-lock.json"
