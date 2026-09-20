# JavaScript, Tags & Tracking Technical Debt Audit (2026-W38)
**Goal ID**: `GOAL-JS-TRACKING-AUDIT-2026-W38`
**Coordinator**: AI SuperExpert Agent Specialist - Dr. Ada Turing
**Framework**: Instructions - COMPETENCE

## Executive Summary
A comprehensive swarm audit of the JavaScript footprint, tracking integrations, and form handlers identified critical tracking failures, payload bloat, and validation inconsistencies. The most severe issue is a silent analytics failure resulting from mismatched GA4/GTM API calls.

---

## 1. Analytics & RevOps Governance (Workstream 1)
* **Finding 1: Silent Tracking Failure (Critical):** The site injects `gtag.js` (GA4), but the custom event helper `SS_TRACK_EVENT` pushes GTM-style object payloads (`dataLayer.push({ event: '...' })`). Because GA4 requires `gtag('event', ...)` calls, custom conversions are currently not being tracked.
* **Finding 2: Duplicated UTM Logic:** Both `attribution.js` and `funnel-events.js` (`enrichLeadForm`) manually parse the URL to extract UTMs. This creates redundant logic and race condition risks.
* **Finding 3: Fragmented Click Listeners:** `analytics-events.js` uses declarative data attributes, while `funnel-events.js` uses an imperative pattern to bind to `href` links.
* **Finding 4: Event Aliasing Debt:** `analytics-events.js` contains a hardcoded event alias dictionary causing naming confusion between markup and dataLayer payloads.

**Remediation Action:**
- Fix `SS_TRACK_EVENT` to route properly to `gtag()` instead of pure `dataLayer.push()`.
- Delete `enrichLeadForm` from `funnel-events.js` and designate `attribution.js` as the single source of truth for UTM storage/injection.
- Standardize event names in the HTML and remove the aliasing object.

---

## 2. Payload Bloat & Inclusion Debt (Workstream 2)
* **Finding 1: Git-Tracked Hashed Files:** As seen previously in the CSS audit, hashed (`analytics-events.63417f.js`) and minified files are tracked in `src/assets/js/` polluting source control.
* **Finding 2: Inline Script Sprawl:** `src/_includes/site-shell.html`, `base.njk`, `footer.njk`, and `form-free-intro.njk` contain massive inline `<script>` blocks (IIFEs, DOMContentLoaded listeners) that bypass browser caching and bloat the HTML.
* **Finding 3: Double Inclusion:** `analytics-events.min.js` and `link-utils.min.js` are loaded explicitly via `<script defer>` in `base.njk`, but are injected a *second time* dynamically by `loadSiteScripts` inside `site-shell.html`.

**Remediation Action:**
- Run `git rm` on `*.[hash].js` and `*.min.js` inside `src/assets/js/`. Add to `.gitignore`.
- Abstract inline scripts from the Nunjucks templates into discrete `.js` modules (e.g., `ui-interactions.js`).
- Delete the redundant `loadSiteScripts` custom loop; rely entirely on `<script defer>`.

---

## 3. Forms & API Integration Debt (Workstream 3)
* **Finding 1: Validation Inconsistency:** `progressive-booking.js` implements excellent, accessible inline validation, while `youth-intro-form.js` relies purely on raw browser `reportValidity()`, and `daily-checkin.js` dumps generic string errors into a banner.
* **Finding 2: Missing Debounce/Abort:** Network requests to `/api/youth-intro/availability` are not debounced, risking overlapping API race conditions.
* **Finding 3: Hardcoded Configurations:** Cal.com configurations (namespace, URL, CSS brand colors) and the physical studio address (in ICS generation) are hardcoded inside individual script files.

**Remediation Action:**
- Refactor the robust validation from `progressive-booking.js` into a shared `validation-utils.js` utility.
- Wrap the `youth-intro-form` fetch calls in an `AbortController`.
- Extract hardcoded Cal.com strings and studio addresses into a central `window.SS_CONFIG` object or build-time config file.

---
**Status**: AUDIT COMPLETE. Awaiting execution phase.
