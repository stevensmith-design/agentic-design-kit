#!/usr/bin/env bash
# Normal portable release; acceptance prompts and project evidence stay out.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ "${1:-}" = '--out' ] && [ $# -eq 2 ] || {
  echo 'usage: publish-standalone.sh --out /absolute/new/root'; exit 2;
}
OUT="$2"
case "$OUT" in /*) ;; *) echo 'Output must be an absolute path'; exit 2;; esac
[ ! -e "$OUT" ] || { echo 'Output already exists; refusing to overwrite'; exit 2; }
bash "$KIT/scripts/publish.sh" --check
mkdir -p "$OUT/scripts"
cp -R "$KIT/skills" "$OUT/skills"
cp "$KIT/public/AGENTS.md" "$OUT/AGENTS.md"
cp "$KIT/scripts/create-project.py" "$OUT/scripts/"
cp "$KIT/skills-lock.json" "$KIT/LICENSE" "$KIT/NOTICE" "$KIT/VERSION" "$OUT/"
cp "$KIT/scripts/folder-preflight.py" "$KIT/scripts/drift-check.sh" "$OUT/scripts/"
cp "$KIT/docs/STANDALONE-START-HERE.md" "$OUT/START-HERE.md"
cp "$KIT/docs/STANDALONE-START-HERE.md" "$OUT/CLAUDE.md"
cp "$KIT/docs/STANDALONE-README.md" "$OUT/README.md"
cp "$KIT/public/CHANGELOG.md" "$OUT/RELEASE-NOTES.md"
printf 'version\t%s\nsource_commit\t%s\nmode\tfolder-execution\naccount_installation\tnone\n' \
  "$(cat "$KIT/VERSION")" "$(bash "$KIT/scripts/source-commit.sh")" > "$OUT/package-metadata.tsv"
python3 "$OUT/scripts/folder-preflight.py" --root "$OUT"
bash "$OUT/scripts/drift-check.sh"
python3 "$KIT/skills/direction-study/tests/check-contracts.py" "$OUT"
echo "Packaged standalone V2 release: $OUT"
