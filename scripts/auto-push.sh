#!/usr/bin/env bash
set -euo pipefail

message="${1:-}"

if ! command -v git >/dev/null 2>&1; then
  echo "Git is not installed or not in PATH" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository" >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "Nothing to commit. Working tree clean."
  exit 0
fi

if [[ -z "${message}" ]]; then
  message="Auto-commit: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
fi

git add -A
git commit -m "${message}"
git push origin "${branch}"

echo "Successfully pushed to branch '${branch}'."


