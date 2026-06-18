#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-}"

if [[ -n "$BASE_URL" ]]; then
  node scripts/qa-redirects.mjs --base-url "$BASE_URL"
else
  node scripts/qa-redirects.mjs
fi
