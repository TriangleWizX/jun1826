# Docs Home

Canonical documentation for SenseiSandy.com lives in this repo.

## If You Want To Change X, Read Y

- Deploy site updates: `docs/runbooks/deploy-apache-namecheap.md`
- Add or edit redirects: `docs/runbooks/redirects.md`
- Apply blog internal-linking rules: `docs/runbooks/redirects.md` and `docs/standards/definition-of-done.md`
- Review canonical URL rules: `docs/url-contract.md`
- Regenerate/submit sitemap: `docs/runbooks/sitemaps.md`
- Update pricing or schedule copy: `docs/content/page-spec-template.md` and `CHANGELOG.md`
- Update integrations (booking, reviews, maps): `docs/integrations/README.md`
- Update tracking/events/UTMs: `docs/analytics/README.md`
- Generate/patch code from Design Bible: `snippets/en-codegen-prompt.md`
- Confirm docs gate for PRs: `docs/standards/definition-of-done.md`

## Glossary

- Lane Picker: Decision UI that routes visitors to kids/teens/adults paths.
- Reserved Spot: Primary conversion intent to claim an intro class time.
- Beginner Lane: New-student path focused on first-class readiness.

## Structure

- `docs/architecture/`: system and file organization docs
- `docs/ops/`: hosting/server and environment operations docs
- `docs/runbooks/`: step-by-step procedures with rollback and verification
- `docs/content/`: page specs, content workflows, and copy constraints
- `docs/seo/`: sitemap, schema, internal linking, and crawl strategy
- `docs/integrations/`: Turneo/Scribner's/maps/reviews/booking integration docs
- `docs/analytics/`: GA4 events, conversions, and UTM governance
- `docs/standards/`: voice/style conventions and Definition of Done

## Working Tree Hygiene

- Write generated QA outputs and one-off debug artifacts to `tmp/`.
- Do not commit caches or machine-local noise (`__pycache__/`, `.DS_Store`, screenshot dumps, ad hoc report files).
- Keep versioned source in expected roots (`blog/`, `near/`, `_includes/`, `assets/`, `docs/`, `tools/`, `scripts/`).
- Run `npm run qa:repo:clean` before opening a PR.
- For local-only exclusions, prefer `.git/info/exclude` over expanding shared `.gitignore`.

## Existing Docs (Pre-MVP)

- `docs/architecture-high-level.md`
- `docs/api-contract.md`
- `docs/contact-delivery-runbook.md`
- `docs/kpi-dashboard.md`
- `docs/partner-scorecard.md`
- `docs/seo-trust-hardening-checklist.md`
- `docs/sensei-sandy-design-bible-v0.1.md`
- `docs/swiftattend-data-model.md`
