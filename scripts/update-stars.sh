#!/usr/bin/env bash
set -euo pipefail

# Updates the `stars` field for each project in src/lib/consts.ts using
# the GitHub CLI. Requires `gh` to be installed and authenticated
# (`gh auth login`).

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE="$ROOT/src/lib/consts.ts"

if [[ ! -f "$FILE" ]]; then
  echo "error: $FILE not found" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh cli is required" >&2
  exit 1
fi

fetch_stars() {
  local slug="$1"
  gh api "repos/$slug" --jq '.stargazers_count'
}

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

pending_slug=""
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ repo:[[:space:]]+\"https://github\.com/([^\"]+)\" ]]; then
    pending_slug="${BASH_REMATCH[1]}"
    printf '%s\n' "$line"
    continue
  fi

  if [[ -n "$pending_slug" && "$line" =~ ^([[:space:]]*)stars:[[:space:]]+[0-9]+, ]]; then
    indent="${BASH_REMATCH[1]}"
    if count="$(fetch_stars "$pending_slug")" && [[ "$count" =~ ^[0-9]+$ ]]; then
      echo "  $pending_slug -> $count" >&2
      printf '%sstars: %s,\n' "$indent" "$count"
    else
      echo "  $pending_slug: failed, keeping existing value" >&2
      printf '%s\n' "$line"
    fi
    pending_slug=""
    continue
  fi

  printf '%s\n' "$line"
done < "$FILE" > "$tmp"

mv "$tmp" "$FILE"
trap - EXIT
echo "done."
