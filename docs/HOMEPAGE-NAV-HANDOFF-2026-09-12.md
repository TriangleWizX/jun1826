# Homepage and navigation handoff closure

Scope: finish the interrupted AGY changes, prioritizing mobile and preserving the existing Catskills Studio identity. Commit and deploy are explicitly requested in the handoff.

## Requirements and closure evidence

- Hamburger visible and menu initially collapsed at every width; opens/closes with correct ARIA, supports keyboard and dropdown links. Verify rendered mobile and desktop states across shared-nav pages.
- Place hamburger before the review/booking group. Mobile uses a brand row followed by hamburger left and booking right; desktop uses a single toolbar with captured review ticker beside booking. Verify 320, 390, 768, 992, 1366 and 1920px for overflow and visible CTA.
- Preserve the existing three-column desktop hero, audience selector, review content and seven-second captured-review rotation; do not claim static captured reviews are a live Google feed.
- Remove the requested START CALM eyebrow, confidence paragraph and first three subhead sentences; keep H1 and remaining copy. Verify canonical partial and built homepage.
- Remove stretched space between final review and Google reviews action. Verify computed geometry.
- Homepage CTAs use the existing on-page first-visit selector; header links to /#home-first-visit-builder. Preserve analytics identifiers.
- Preserve daily availability implementation; run existing PHP/JS regression suites.
- Verify build, volatile facts, navigation, duplicate nav labels, links and metadata. Keep browser evidence distinct from static checks.
- Review exact deploy payload, commit scoped files, verify rollback before upload, then verify remote bytes and live content separately.

## Implementation

The shared include owns the toolbar layout. ID-scoped collapse rules override legacy route bundles that force desktop navigation open, avoiding changes to every generated CSS bundle. The menu uses existing Bootstrap/fallback behavior. The reviews list no longer flex-grows and its actions follow the content.

## Evidence

Local evidence: build passed; homepage synthesis, volatile facts (1056 files), duplicate navigation, SSI, doctype, static links and link existence passed. PHP and JS availability tests passed. Inline navigation scripts parse successfully. Impeccable detector returned no findings.

Rendered generated output: 320, 390, 768, 992, 1366 and 1920px layouts passed real click checks, initial/closed ARIA, visible 44px hamburger and booking CTA, no clipped toolbar CTA, dropdown visibility, and an 8px final-review/action gap. Built-output shared navigation passed on homepage, schedule, glossary, adults, studio and FAQ pages. The local availability endpoint is intentionally unavailable in static preview; provider behavior is covered only by existing tests, not this browser run.

The old homepage synthesis test required the exact copy the user asked to remove; it now asserts the remaining H1 and absence of deleted copy. Navigation QA now opens the desktop hamburger and resolves the generated schedule path.

Screenshots and raw viewport results: tmp/agy-*.png and tmp/agy-layout-results.json. Real iOS/Android hardware was not tested. No conversion uplift is claimed.

Final keyboard Enter/Escape closure and seven-second review rotation passed. SEO title, description, canonical, robots and JSON-LD are unchanged. Canonical/root partials match; the generated fragment differs only by its expected fingerprinted image URL. Repeatable check: `node scripts/qa-home-nav-layout.mjs`.

Release: runtime commit `6406c86` deployed successfully with exactly `index.html`, `nav-include.html`, and `partials/home-conversion-shell.html`. All three public URLs returned HTTP 200 with expected markers. Live 390px and 1366px browser checks passed menu clicks, keyboard Enter/Escape closure, review rotation, CTA fit and review spacing. Live results: `/tmp/agy-live-layout-results.json`. Working tree was clean after the runtime commit. Rollback: revert this scoped commit and redeploy the same three paths, or restore those paths from the verified server archive.
