#!/usr/bin/env bash
# Build the offline Cowork plugin from the same gated source as the Code project package.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ "${1:-}" = '--out' ] && [ $# -eq 2 ] || {
  echo 'usage: publish-plugin.sh --out /absolute/new/plugin-root'; exit 2;
}
OUT="$2"
[ ! -e "$OUT" ] && [ ! -e "$OUT.zip" ] || { echo 'Output already exists'; exit 2; }
bash "$KIT/scripts/publish.sh" --check
mkdir -p "$OUT/.claude-plugin" "$OUT/scripts"
cp -R "$KIT/skills" "$OUT/skills"
cp "$KIT/public/AGENTS.md" "$OUT/AGENTS.md"
cp "$KIT/scripts/create-project.py" "$OUT/scripts/"
cp "$KIT/plugin/plugin.json" "$OUT/.claude-plugin/plugin.json"
cp "$KIT/skills-lock.json" "$KIT/LICENSE" "$KIT/NOTICE" "$KIT/VERSION" "$OUT/"
cp "$KIT/docs/COWORK-INSTALL.md" "$OUT/README.md"
cp "$KIT/docs/STANDALONE-START-HERE.md" "$OUT/START-HERE.md"
cp "$KIT/docs/COWORK-FOLDER-INSTRUCTIONS.txt" "$OUT/"
cp "$KIT/scripts/drift-check.sh" "$KIT/scripts/check-plugin-package.py" "$KIT/scripts/cowork-session-preflight.py" "$KIT/scripts/folder-preflight.py" "$OUT/scripts/"
printf 'source_commit\t%s\n' "$(bash "$KIT/scripts/source-commit.sh")" > "$OUT/package-metadata.tsv"
find "$OUT" -name '.DS_Store' -delete
python3 "$OUT/scripts/check-plugin-package.py" "$OUT"
bash "$OUT/scripts/drift-check.sh"
python3 - "$OUT" <<'PY'
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys
root=Path(sys.argv[1])
with ZipFile(str(root)+'.zip','x',compression=ZIP_DEFLATED) as archive:
    for p in sorted(root.rglob('*')):
        if p.is_file(): archive.write(p,str(p.relative_to(root)))
print('Packaged offline plugin:', str(root)+'.zip')
PY
