#!/usr/bin/env bash
# git wrapper for agent sessions that cannot delete files.
#
# The Cowork device bridge mounts this folder without unlink permission, so git
# cannot clean up its own .git/index.lock, .git/HEAD.lock or objects/tmp_obj_*
# after a write. The commit still lands, but the next write op would fail on the
# stale lock. Renaming is permitted, so this parks stale locks in .git/_stale/
# first, then runs git.
#
#   scripts/git.sh add -A
#   scripts/git.sh commit -m "..."
#
# Housekeeping: .git/_stale/ and .git/objects/**/tmp_obj_* accumulate. Delete
# them from Finder or a normal terminal now and then — they are inert.
set -uo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$KIT"
mkdir -p .git/_stale
while IFS= read -r f; do
  mv "$f" ".git/_stale/$(basename "$f").$$.$RANDOM" 2>/dev/null || true
done < <(find .git -name '*.lock' -not -path '.git/_stale/*' 2>/dev/null)
git "$@" 2> >(grep -v "unable to unlink" >&2)
