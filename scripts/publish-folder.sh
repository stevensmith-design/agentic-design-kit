#!/usr/bin/env bash
# Build a portable file-execution kit. No account settings or native registrations are changed.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ "${1:-}" = '--out' ] && [ $# -eq 2 ] || { echo 'usage: publish-folder.sh --out /absolute/new/root'; exit 2; }
OUT="$2"
[ ! -e "$OUT" ] || { echo 'Output already exists; refusing to overwrite'; exit 2; }
bash "$KIT/scripts/publish.sh" --check
mkdir -p "$OUT/scripts"
cp -R "$KIT/skills" "$OUT/skills"
cp "$KIT/public/AGENTS.md" "$OUT/AGENTS.md"
cp "$KIT/scripts/create-project.py" "$OUT/scripts/"
cp "$KIT/skills-lock.json" "$KIT/LICENSE" "$KIT/NOTICE" "$KIT/VERSION" "$OUT/"
cp "$KIT/scripts/folder-preflight.py" "$KIT/scripts/drift-check.sh" "$OUT/scripts/"
cp "$KIT/docs/FOLDER-START-HERE.md" "$OUT/START-HERE.md"
cp "$KIT/docs/FOLDER-START-HERE.md" "$OUT/CLAUDE.md"
cp "$KIT/docs/FOLDER-TEST-SETUP.txt" "$OUT/TEST-SETUP.txt"
cp "$KIT/acceptance/ORIGINAL-RC3-PROMPT.txt" "$OUT/ORIGINAL-RC3-PROMPT.txt"
find "$OUT" -name '.DS_Store' -delete
python3 - "$OUT" <<'PY'
from pathlib import Path
import sys
root=Path(sys.argv[1]).resolve()
original=(root/'ORIGINAL-RC3-PROMPT.txt').read_text()
assert original.count('"design-skills-kit-v2-acceptance-rc3"')==1
(root/'TEST-PROMPT.txt').write_text(original.replace('"design-skills-kit-v2-acceptance-rc3"', '"'+root.name+'"'))
(root/'README.md').write_text('''# Local folder test — no installation

Read START-HERE.md. Select this folder in the host and use TEST-SETUP.txt as the separate test
setup instruction, then attach the same original reference images/assets and submit TEST-PROMPT.txt.
Only the quoted attached-folder name differs from ORIGINAL-RC3-PROMPT.txt. Keep the creative prompt
otherwise unchanged and preserve the untouched first delivery before coaching or repair.

This uses folder-execution, not native skill activation. No account/plugin installation or enabling
is needed. Existing native skill/plugin registrations are not changed. If outside design guidance is
already active, report it rather than silently using it or claiming an isolated pass.

Normal use: direct the agent to this folder and ask broadly to use the kit. The local entry routes
by phase; you do not name each supporting workflow. If you relocate/copy the folder, local paths
still resolve. Update only the quoted folder label in TEST-PROMPT.txt if its name changes.

The isolated test adds a folder-only restriction. Files cannot make a host read them before it has
been directed to the folder; automatic host discovery and native registration are separate tests.
File checks authenticate payloads and evidence shape, not originality, truthful execution or hidden
host state. Native, requested Figma and existing-app outputs are not forced into standalone HTML.
''')
PY
printf 'source_commit\t%s\nmode\tfolder-execution\naccount_installation\tnone\n' \
  "$(bash "$KIT/scripts/source-commit.sh")" > "$OUT/package-metadata.tsv"
python3 "$OUT/scripts/folder-preflight.py" --root "$OUT"
bash "$OUT/scripts/drift-check.sh"
echo "Packaged portable folder workflows: $OUT"
