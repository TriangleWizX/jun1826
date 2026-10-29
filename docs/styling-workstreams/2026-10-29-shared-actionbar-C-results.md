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

## Production release and alias closeout

Commit `cd1258153fb53a06262650ae3a68744341eb2d74` was deployed with the exact 400-path allowlist in [shared-actionbar-C-paths.txt](evidence/2026-10-29/shared-actionbar-C-paths.txt). The first post-deploy verification matched 398 of the 400 paths. The remaining two clean routes were still returning the older Deer Mountain Inn and Phoenicia Diner directory pages, while the updated root `.html` outputs were present.

The old remote directory indexes did not exist in the current generated tree. Their raw remote paths were updated individually: `deer-mountain-inn/index.html` and `phoenicia-diner/index.html`. The patch changed only the existing action-bar script block. Byte comparisons confirmed all bytes outside that block were identical before and after for both pages. A verified pre-deploy backup was created before either upload. Remote SHA-256 readback matched the exact two patched files.

Fresh live checks now return the current C root output for both clean URLs. Their response hashes match the candidate `deer-mountain-inn.html` and `phoenicia-diner.html` outputs. Isolated browser proof at mobile and desktop widths returned HTTP 200 for both routes, with no horizontal overflow or page errors. Alias hashes, current live response hashes, JSON and screenshots are preserved in [the final live evidence folder](evidence/2026-10-29/shared-actionbar-C-final-live/), alongside the [alias proof table](evidence/2026-10-29/shared-actionbar-C-alias-live-proof.tsv), [raw alias patch manifest](evidence/2026-10-29/shared-actionbar-C-alias-patch-manifest.tsv), and [initial 400-path response manifest](evidence/2026-10-29/shared-actionbar-C-initial-live-verify.tsv).

The shared action-bar release is complete. Lighthouse/PageSpeed, site-wide contrast work, and owner-reserved keyboard acceptance remain excluded. All unrelated dirty source and generated output was preserved.
