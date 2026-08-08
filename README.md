# SenseiSandy.com Website Repo

Marketing site and support tooling for Sensei Sandy Brazilian Jiu-Jitsu.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run local preview HTTP server:
   ```bash
   npm run dev
   ```
   Preview at `http://localhost:8000`.
3. Build generated assets when needed:
   ```bash
   npm run build
   ```
4. Run validation & QA checks:
   ```bash
   npm run validate
   npm run qa:all
   ```

`validate` runs fast local static checks. Run network-dependent checks separately when internet access is available:

```bash
npm run qa:links:live
npm run qa:sitemaps:live:redirects
```

## Asset ownership

`src/assets/` is the only canonical published-asset tree. Public URLs remain
`/assets/...`; Eleventy copies that source tree to `dist/assets/`.

Before asset cleanup, run `npm run assets:inventory`. It writes a JSON and
Markdown allowlist under `docs/performance/`, including hashes, references,
and duplicate groups. Then use `npm run styles:routes:prune` to remove only
route bundles absent from the current manifest after source/SSI ownership has
been verified. Run `npm run qa:assets:size` after a cleanup.

Keep lossless originals and any media rollback copies outside the repository
and outside the published asset path. Do not delete inventory-listed
legacy-only assets until they have been manually classified.

## Documentation & Deployment Workflow

- [Local Development Guide](file:///home/twizss/Documents/ssbjjweb/tmb/docs/deployment/LOCAL_DEVELOPMENT.md)
- [Production Backup & Rollback Procedure](file:///home/twizss/Documents/ssbjjweb/tmb/docs/deployment/BACKUP_AND_ROLLBACK.md)
- [SFTP Deployment Guide](file:///home/twizss/Documents/ssbjjweb/tmb/docs/deployment/SFTP_DEPLOYMENT.md)

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
