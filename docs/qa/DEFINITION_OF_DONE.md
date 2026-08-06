# Five-Release Definition of Done

This is the authoritative completion gate for Releases 1–5. The machine-readable status record is `docs/qa/release-gate.json`; run it with:

```bash
npm run qa:definition-of-done
```

The command builds the site, runs the Release 5 generated-output validator, and evaluates every release and checklist item. A release is complete only when every item is `PASS`, or is explicitly documented as one of the allowed statuses: `BLOCKED`, `PARTIAL`, `OWNER-ACCEPTED LIMITATION`, or `POST-LAUNCH FOLLOW-UP`. `BLOCKED` and `PARTIAL` remain release-blocking.

## Gate areas

The manifest covers source architecture; business, offer, pricing, schedule, and promotion consistency; Free Intro funnel behavior; archives, redirects, canonicals, links, sitemaps, and robots; JSON-LD, metadata, HTML, assets, secrets, and accessibility; analytics privacy and deduplication; responsive, keyboard, focus, zoom, reduced-motion, sticky overlap, image, CSS, JavaScript, and console checks; cross-device and functional smoke evidence; deployment backup, SFTP, rollback, Search Console, owner authorization, and handoff documentation.

## Evidence separation

- Local source/build gates: `scripts/qa-definition-of-done.mjs`, `scripts/qa-release-5.mjs`, and the existing `npm run qa:*` scripts.
- Browser and accessibility evidence: record dated results in `docs/qa/` and `docs/performance/`.
- Production-only checks: record live URLs, status codes, redirect chains, form/analytics results, and screenshots after authorized deployment in `docs/deployment/` and `docs/seo/`.
- Owner gates: record authorization, backup confirmation, rollback owner, and handoff acceptance in `docs/owner/` and `docs/handoff/`.

## Release audit record

The current worktree contains pre-existing uncommitted and untracked material. It must be inventoried and classified before a release candidate is declared. No reset, clean, deletion, or broad overwrite is part of this gate. Production deployment, backup, remote deletion, and Search Console submission require explicit owner authorization.

## Required evidence sequence

1. Audit the four release tags, Release 5 branch, current worktree, generated output, and existing evidence.
2. Reconcile structured data, pricing, schedule, promotions, funnel copy, archive rules, redirects, and canonicals.
3. Build from a clean temporary clone and run local blocking checks.
4. Complete browser, accessibility, responsive, reduced-motion, zoom, performance, analytics/privacy, and functional smoke evidence.
5. Produce and review the release candidate diff and removal manifest.
6. Stop for explicit owner deployment authorization.
7. Verify backup/SFTP, deploy generated output only, run live validation, then submit Search Console updates.
8. Finish owner guide, technical handoff, manifest, changelog, and final report.

The current manifest intentionally records unresolved work; therefore the repository is not complete.
