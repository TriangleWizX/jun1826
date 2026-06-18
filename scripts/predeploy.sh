#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

node tools/minify-css.mjs
npm run build:assets
npm run qa:assets:canon
npm run qa:doctype
npm run qa:ssi:integrity
node tools/qa-schedule-literals.mjs
bash scripts/qa-canonical-host-live.sh
bash scripts/qa-analytics-include-live.sh
npm run qa:priority:inlinks
npm run qa:orphans
npm run qa:blog:linkout:rules
npm run qa:links:existence
npm run qa:links:live
