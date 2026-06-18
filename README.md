# SenseiSandy.com Website Repo

Marketing site and support tooling for Sensei Sandy Brazilian Jiu-Jitsu.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build generated assets when needed:
   ```bash
   npm run build
   ```
3. Run QA checks before deploy:
   ```bash
   npm run qa:all
   ```

`qa:all` is the local static suite. Run network-dependent checks separately when internet access is available:

```bash
npm run qa:links:live
npm run qa:sitemaps:live:redirects
```

## Working Tree Hygiene

- Generate temporary QA artifacts under `tmp/` (screenshots, CSV reports, scratch HTML).
- Keep durable source content in repo roots like `assets/`, `blog/`, `near/`, `docs/`, `tools/`, and `scripts/`.
- Run `npm run qa:repo:clean` before commit to catch tracked artifact patterns.
- Use `.git/info/exclude` for machine-local ignores you do not want shared via `.gitignore`.

## Script Bundle Policy

- Retired global legacy bundles: `js/script.js` and `js/script.68b857.js`.
- Supported pattern: use scoped runtime scripts (for example `js/site-ux.js`, `js/glossary-filters*.js`) tied to specific page needs.
- Do not add new generic global behavior bundles unless there is an explicit, reviewed requirement.
- Guardrail: `npm run qa:legacy:script-refs` fails if those retired bundle paths are referenced in runtime files.

## Deploy

Production deploy and rollback steps are documented in:
- `docs/ops/apache-namecheap.md`
- `docs/runbooks/deploy-apache-namecheap.md`

## Documentation Home

Start with `docs/README.md` for the full documentation index.
