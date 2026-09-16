# Release Allowlist — 2026-09-15

## Purpose

This is a pre-commit and pre-deployment boundary for the current dirty
worktree. It is an audit artifact, not authorization to stage, commit, clean,
upload, or deploy files.

## Current evidence

- Worktree entries at audit time: 105.
- `src/`: 30 entries.
- `dist/`: 8 entries.
- `tools/ads/`: 11 entries.
- `reports/`: 3 entries.
- `scripts/`: 4 entries.
- `crawl-reports/`: 1 entry.
- Root or other paths: 48 entries.
- No files are approved solely because a local QA command passed.

Passing local gates do not establish product ownership, release intent, live
deployment scope, analytics outcomes, or business outcomes.

## Proposed release candidates — owner confirmation required

These paths match the previously reported CRO remediation surfaces and may be
reviewed as one bounded candidate. They are not approved until their diffs,
source-to-generated lineage, and intended release scope are confirmed:

- `src/instagram/index.html`
- `src/assets/css/pages/instagram.css`
- `src/options-pricing.njk`
- `src/assets/css/pages/pricing.css`
- `src/assets/css/pages/book-free-intro.css`
- `src/options-pricing.html`
- `src/free-bjj-intro-tannersville-ny/index.html`
- Corresponding generated `dist/` files only after a clean, deterministic
  rebuild proves they are outputs of the approved source set.

## Explicitly exclude from a website deployment payload

- `tools/ads/**` and Ad Studio caches or generated campaign batches.
- `reports/**`, `crawl-reports/**`, and local audit artifacts.
- `scripts/audit-money-pages-perf-cro.mjs` unless separately approved as a
  tooling change.
- `assets/indranet-prompt-exporter/**`; the plan-persona documentation change
  is already committed and is not a public website payload.

## Hold for separate review

The following categories are not safe to include by inference:

- `AGENTS.md`, `CODEX-HANDOFF.md`, `package.json`, `eleventy.config.js`, and
  `config/route-policy.json`.
- Pricing, offers, schedule, eligibility, guarantee, booking, or analytics
  files.
- Broad source-page changes outside the candidate surfaces above.
- Existing `dist/` changes whose source owner or generation timestamp is not
  proven.
- Any untracked image, data file, or campaign asset.

## Required promotion gates

Before any commit or deployment, the owner must confirm:

1. The candidate paths represent the intended release and no unrelated dirty
   work is included.
2. Whitespace-only changes are fixed or explicitly excluded.
3. Canonical source files are approved before generated `dist/` files.
4. A clean rebuild and targeted QA reproduce the generated outputs.
5. Booking URLs, pricing, schedule, eligibility, analytics identifiers, SEO
   metadata, and deployment payload are unchanged or explicitly approved.
6. Ad Studio remains offline-only; local Ad Studio tests do not prove campaign
   publication or performance.
7. Exact deployment bytes, rollback location, and remote/live verification are
   recorded before release.

## Current decision

**Not release-ready.** The allowlist remains provisional because the worktree
contains broad mixed changes and owner intent has not been established for the
candidate set. Do not clean or deploy the remaining changes as a batch.
