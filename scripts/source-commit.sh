#!/usr/bin/env bash
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -e "$KIT/.git" ]; then
  git -C "$KIT" rev-parse HEAD
elif [ -f "$KIT/SOURCE-COMMIT" ]; then
  cat "$KIT/SOURCE-COMMIT"
else
  git -C "$KIT" rev-parse HEAD
fi
