# Release Allowlist — 2026-09-18

## Scope

Approved review boundary for the glossary and offer/pricing work. This file does not authorize staging, commit, deletion, upload, or deployment.

## Include for review

- `data/glossary-terms.json`
- `scripts/qa-glossary.mjs`
- `tools/build-glossary-pages.mjs`
- `assets/css/pages/glossary.css`
- `assets/css/pages/glossary.min.css`
- `src/assets/css/bjj-glossary.css`
- `src/assets/css/pages/glossary.css`
- `src/assets/css/pages/glossary.min.css`
- `src/bjj-glossary/**`
- `dist/bjj-glossary/**` — generated output corresponding to the approved glossary source
- `src/assets/data/asset-hash-manifest.json` — generated asset-manifest update required by the build
- `content/offers.json`
- `src/_data/offers.json`
- `src/_data/pricing.json`
- `src/options-pricing.njk`
- `src/free-bjj-intro-tannersville-ny/index.html`
- `dist/options-pricing/**` and `dist/options-pricing.html` — generated pricing output
- `dist/free-bjj-intro-tannersville-ny/**` — generated booking-page output
- `docs/offers/glossary-flywheel-grandslam-spec.md` — offline specification

## Explicitly exclude

- `tools/ads/**` — offline-only Ad Studio work
- `src/_includes/components/footer.njk`, `src/practice-vault.njk`, `src/_data/vault-curriculum.json`, `assets/tatami-order-confirmations/**`, and `tools/pullups/**` — separate Practice Vault / tatami / pullups workstream
- `config/legacy-redirects.json` — routing/configuration review held separately; current diff is ordering-only
- `AGENTS.md` — workspace instructions, not website payload
- `.codegraph/daemon.pid` — live local daemon metadata, not website payload
- CSV exports, `assets/ebooks/**`, persona exports, scraper artifacts, `.vscode/**`, and `scratch/**` — offline workspace material
- All other modified or untracked files outside the paths above

## Verification recorded

- `node tools/build-glossary-pages.mjs` passed
- `npm run build` passed
- Glossary QA passed
- Unified QA passed
- Volatile-facts QA passed
- Redirect check passed
- Schedule audit passed
- `npm run test:ads` passed separately; it does not authorize publication

## Release status

Review-ready allowlist only. Deployment remains unperformed pending final source-to-generated diff review and release authorization.
