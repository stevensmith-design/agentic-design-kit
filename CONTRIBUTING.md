# Contributing

Use the source archive or repository checkout. Keep source changes separate from generated dist/
outputs. New app/project requests from the opened kit belong in a separate project folder;
kit maintenance and explicitly scoped examples stay in this checkout. Do not commit user projects, account settings, credentials, generated study assets or local
runtime paths. Tests and synthetic fixtures belong with the skill that owns their behaviour.

Use Bash, Python 3 and Node.js 22+. Supply a local Chromium browser for rendered checks:

    export CHROME_PATH=/absolute/path/to/chrome
    bash scripts/publish.sh --check

No browser means unverified rendered checks, not a passing publication check. The CI workflow
fails if a browser is unavailable. Evaluation JSON is a definition, not an executed model eval.

Keep skills concise and supporting guidance on demand. Preserve accepted design intent; a single
project's failure is not automatically a new universal design restriction. For checker changes,
add a focused failing fixture before implementation, then verify the intended finding and its
false-positive guard. Keep rules.md byte-identical in the principles and review skills; after
editing it, run scripts/gen-rules-ranges.py. Regenerate and verify skills-lock.json:

    bash scripts/gen-lock.sh
    bash scripts/drift-check.sh

Build publication artifacts from a clean source checkout:

    python3 scripts/prepare-public-release.py --out /absolute/new/release-directory

The builder exports an allowlisted public source tree, validates that exported source, authenticates
portable/plugin/Code payloads, audits the trees for local data, and writes archives plus SHA256SUMS.
It never installs a plugin, publishes remotely or overwrites an existing output directory.

Before publication, review all prose, inline comments, fixtures, filenames and links for private
client/project context. Use neutral calibration examples and generic paths. Run
`python3 scripts/check-public-content.py <publication-tree-or-archive>` on the actual public tree
and rebuilt downloads. The checker traverses hidden folders and nested archives; it detects known
private labels/lineage and personal checkout paths, not every possible client name or secret.
Regression fixtures construct rejected labels in memory so the tests do not redistribute them.
