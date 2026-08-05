#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run near:build
npm run glossary:build
npm run sitemaps:pages-blog
npm run sitemaps:index
npm run components:build
npm run styles:min
npm run icons:build
npm run styles:bootstrap
npm run styles:routes
npm run qa:components:bundles
npm run qa:css:minified
npm run qa:icons:local
npm run qa:css:bootstrap
npm run qa:css:routes
npm run qa:css:route-bundles
npm run qa:css:budget
npm run qa:assets:fingerprint:fixture
npm run build:assets:additive
npm run qa:assets:canon
npm run qa:css:assets:baseline
npm run qa:doctype
npm run qa:ssi:integrity
node tools/qa-schedule-literals.mjs
bash scripts/qa-canonical-host-live.sh
npm run qa:priority:inlinks
npm run qa:orphans
npm run qa:blog:linkout:rules
npm run qa:links:existence
npm run qa:links:live
