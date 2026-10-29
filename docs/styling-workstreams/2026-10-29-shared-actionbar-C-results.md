# Shared action-bar workstream C results

Date: 2026-10-29
Scope: shared `.ss-mobile-actionbar` overlap behavior in `src/_includes/components/footer.njk`.

## Persona and workstream record

The coordinator used an ordinary frontend and static-site release specialist fallback because the contextual selector had no suitable persona. Master `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`) and worker `Instructions - CODE` (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`) were reviewed from the local catalog export; each had partial catalog status, no readiness field, and no attachments. The available instruction source and methodology are recorded in the plan. Three read-only contracts (C-01 behavior, C-02 runtime/performance, C-03 release mapping) were independently reviewed; no worker had a write path.

## Local behavior evidence

The current source and isolated candidate source have the same SHA-256: `9bea1f9cabbfc9b002320d90b049140eed22e626630ccbaeddce95e322588390`.

At 390×844 with IntersectionObserver enabled:

- A visible fixed anchor overlapping the action bar hid the bar; removing the anchor restored it.
- Disabled, `hidden`, `inert`, and `aria-disabled="true"` controls did not suppress the bar.
- A plain `tabindex="-1"` element did not suppress the bar. Changing it to `tabindex="0"` hid the bar; removing it restored the bar.

With IntersectionObserver disabled before page load:

- The same overlapping-anchor hide and removal-restore transitions passed.
- Changing a plain `tabindex="-1"` element to `tabindex="0"` hid the bar, confirming that the fallback refreshes its cached targets.
- Thirty synchronous scroll events scheduled one animation frame.

At 1440×900, the action bar had computed `display:none`.

The browser-use 0.1.13 CLI connected to the dedicated isolated Chromium after using the approved elevated local CDP access. No form was submitted and no external page was opened. The earlier isolated browser-proof pass covered Home, Contact, Show Up Kit, Options/Pricing, Free Intro, and Schedule at mobile and desktop viewports; Schedule reported one existing `replaceChildren` null error from its calendar script. That error is recorded as unrelated/uncategorized, not as a C pass.

## Build and exact route mapping

The isolated Eleventy build used clean source at `817f5da` plus only the C footer source. It completed with 507 generated pages. Of those, 400 deployable HTML outputs include the shared scanner. Every listed path exists in both the candidate and the current main `dist/`. Candidate HTML payload size is 24,165,259 bytes.

The exact deploy-relative path allowlist is [shared-actionbar-C-paths.txt](evidence/2026-10-29/shared-actionbar-C-paths.txt). Use this same list for the deployment dry run and upload. Do not deploy the helper's broader inferred payload.

## Local checks

- Extracted footer script passed `node --check`.
- `git diff --check -- src/_includes/components/footer.njk` passed.
- Static `scripts/qa-sticky-overlap.mjs` alone does not assert the live hide/restore transitions; the browser state checks above cover those transitions.

## Release and closeout gates

Deployment, live HTTP/content/browser proof, restoration hashes for the pre-existing dirty `dist/`, and temporary-workspace cleanup are pending. Preserve all unrelated dirty work. Do not run Lighthouse/PageSpeed or the owner-reserved keyboard acceptance check.
