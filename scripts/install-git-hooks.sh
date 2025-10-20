#!/usr/bin/env bash
set -euo pipefail

repo_path="${1:-.}"
cd "$repo_path"

if [[ ! -d .git ]]; then
  echo "Not a git repository: $repo_path" >&2
  exit 1
fi

hooks_dir=".git/hooks"
mkdir -p "$hooks_dir"

cp scripts/hooks/post-commit "$hooks_dir/post-commit"
cp scripts/hooks/post-merge  "$hooks_dir/post-merge"

chmod +x "$hooks_dir/post-commit" "$hooks_dir/post-merge"

echo "Git hooks installed: post-commit, post-merge"


