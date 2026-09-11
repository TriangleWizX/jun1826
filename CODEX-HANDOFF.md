# Codex Handoff: Free Intro Funnel, Suite Health & Production Deployment

> **Target Audience**: AI Coding Assistants (Codex / Antigravity / Claude Code) picking up the repository worktree.  
> **Repository**: `TriangleWizX/jun1826` (`https://senseisandy.com`)  
> **Active Branch**: `blackbeltbartender/hyphen-weekend-v1`  
> **Latest Head Commit**: `fba6962` (`feat(cro): fulfill CRO-CALENDLY-FIXES (CAL-00 through CAL-11) and document suite health`)  
> **Production State**: Deployed & Verified Live (LiteSpeed HTTP/2 200 on all endpoints)  
> **Working Tree Status**: Clean (no uncommitted or untracked changes)  
> **Timestamp**: 2026-09-10T23:58:00-04:00

---

## 1. Quick Orientation & Operational Rules

Before executing commands or editing files, obey these strict environment invariants:

1. **CLI Proxy Prefix (`rtk`)**:
   * **Mandatory**: All shell commands must be prefixed with `rtk` (e.g. `rtk npm run ...`, `rtk git status`, `rtk python3 ...`).
   * Direct invocation of `git` or raw tools may be intercepted or rejected by user hooks and sandbox security rules.
2. **Never Propose `cd`**:
   * Execute all commands from the repository root `/home/twizss/Documents/ssbjjweb/tmb`.
3. **Tri-File Parity Invariant**:
   * The primary intro booking route exists in three places:
     * Source template: [`src/free-bjj-intro-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html)
     * Build output: [`dist/free-bjj-intro-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/dist/free-bjj-intro-tannersville-ny/index.html)
     * Static root mirror: [`free-bjj-intro-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/free-bjj-intro-tannersville-ny/index.html)
   * Whenever editing this route, always edit `src/`, compile with `rtk npm run build`, copy to root mirror (`cp dist/free-bjj-intro-tannersville-ny/index.html free-bjj-intro-tannersville-ny/index.html`), and update route styles (`rtk node tools/build-route-styles.mjs --write`).
4. **Volatile Facts Contract**:
   * Never hardcode volatile schedules, prices, addresses, or phone numbers in editorial text.
   * Run `rtk npm run qa:volatile-facts` after modifying any schedule or pricing copy.

---

## 2. Work Completed in This Pass

### A. CRO & Calendly Funnel Overhaul ([`CRO-CALENDLY-FIXES.md`](file:///home/twizss/Documents/ssbjjweb/tmb/CRO-CALENDLY-FIXES.md))
Fully implemented items **CAL-00 through CAL-11**:

| Ticket | Scope & Implementation | Key Files Modified |
| :--- | :--- | :--- |
| **CAL-00** | Clean, mobile-first 3-step progressive booking flow (`#pb-step-1`, `#pb-step-2`, `#pb-step-3`) replacing disjointed links. | [`src/free-bjj-intro-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html), [`js/progressive-booking.js`](file:///home/twizss/Documents/ssbjjweb/tmb/js/progressive-booking.js) |
| **CAL-01** | Headline and microcopy alignment on Step 1: *"Who’s starting? Tell us who’s starting so we can explain the right first visit. Your first class is a coached learning experience."* | `src/free-bjj-intro-tannersville-ny/index.html` (L141-143) |
| **CAL-02** | Primary adult card (`data-profile="adult-beginner"`): mounts Calendly for adult intro, advances to Step 2, smooth scrolls into view. | `js/progressive-booking.js` |
| **CAL-03** | Youth progressive disclosure (`data-reveal-youth`): reveals 4 sub-options (*Ages 4–7*, *Ages 8–12*, *Teens 13–17*, *Multiple kids*) without layout jumps. Updates lane note dynamically. | `src/free-bjj-intro-tannersville-ny/index.html`, `js/progressive-booking.js` |
| **CAL-04** | Dynamic Calendly embed using official widget script, prefill params, and parameter forwarding (`utm_source`, `utm_campaign`, `utm_medium`, `gclid`). | `js/progressive-booking.js` |
| **CAL-05** | Standalone escape link (`#calendly-fallback-link`): opens Calendly in new tab if iframe fails or cookies are blocked. | `src/free-bjj-intro-tannersville-ny/index.html`, `js/progressive-booking.js` |
| **CAL-06** | Secondary actions: "Not sure? Get help choosing" (triggers SMS modal/prompt with Sandy) + Community Service / First Responder discount accordion. | `src/free-bjj-intro-tannersville-ny/index.html` |
| **CAL-07** | Step 3 / Confirmation bridge ([`free-bjj-intro-tannersville-ny/confirmation/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/free-bjj-intro-tannersville-ny/confirmation/index.html)): listens for `calendly.event_scheduled`, redirects to confirmation page with booking parameters, calendar invite advice, and SMS fallback. | `dist/free-bjj-intro-tannersville-ny/confirmation/index.html`, `js/progressive-booking.js` |
| **CAL-08** | Analytics event firing: instrumentation added to [`js/analytics-events.js`](file:///home/twizss/Documents/ssbjjweb/tmb/js/analytics-events.js) and minified (`booking_intent`, `profile_selected`, `calendly_view`, `booking_completed`). | `js/analytics-events.js`, `js/analytics-events.min.js` |
| **CAL-09** | Premium visual styling: Instrument Serif headings, bezel card shells (`ss-bezel-shell`, `ss-bezel-core`), active state transitions, mobile bottom sticky bar (`#booking-flow`). | `src/free-bjj-intro-tannersville-ny/index.html`, `src/assets/css/routes/site-1d0842eaa685.min.css` |
| **CAL-10** | Room tour visual proof: clean mat photo ([`sensei-sandy-bjj-mat-space-and-viewing-area-1024.d4d4ef.webp`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-1024.d4d4ef.webp)) and 4 trust badges (*Tour first*, *Safety walkthrough*, *Beginner class*, *Skill-first training*). | `src/free-bjj-intro-tannersville-ny/index.html` (L104-133) |
| **CAL-11** | High-intent FAQ accordion: 4 questions (*"Is my first class going to be a fight?"*, *"What should I wear?"*, *"Do I need to be in shape before I start?"*, *"Can I reschedule if my plans change?"*). | `src/free-bjj-intro-tannersville-ny/index.html` (L360-405) |

### B. Local Icon Fix & Route CSS Generation
* Replaced missing icon `bi-question-circle` with `bi-chat-dots` (which already exists in `src/assets/icons/bootstrap/chat-dots.svg` and `src/assets/css/bootstrap-icons-local.css`).
* Rebuilt route styles: generated active bundle [`src/assets/css/routes/site-1d0842eaa685.min.css`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/routes/site-1d0842eaa685.min.css) (41.8 KB raw, 9.0 KB gzip).
* Verified that `qa:css:assets` has **0 hard issues** on `/free-bjj-intro-tannersville-ny`.

### C. Comprehensive QA Suite Audit ([`PRE-EXISTING-TEST-FAILURES.md`](file:///home/twizss/Documents/ssbjjweb/tmb/PRE-EXISTING-TEST-FAILURES.md))
* Evaluated all **109** QA scripts declared in `package.json`.
* **72 passed**, **37 failed**.
* Authoritatively mapped all 37 failing scripts to 6 root causes (Missing retired files: 10, Copy drift: 10, Asset/styling gaps outside scope: 6, Live HTTP checks: 5, Temporal: 2, Meta runners: 4).
* Verified that **zero failures belong to `/free-bjj-intro-tannersville-ny`**.

### D. Git Commit & Production Deployment
* **Commit**: `fba6962`
* **Deploy Script**: [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py)
* **Payload Uploaded & Verified**:
  * `free-bjj-intro-tannersville-ny/index.html` (37,106 B)
  * `free-bjj-intro-tannersville-ny/confirmation/index.html` (14,272 B)
  * `js/progressive-booking.js` (11,466 B)
  * `js/analytics-events.js` (27,471 B)
  * `js/analytics-events.min.js` (14,687 B)
  * `assets/css/routes/site-1d0842eaa685.css` (47,791 B)
  * `assets/css/routes/site-1d0842eaa685.min.css` (41,771 B)
  * `assets/css/routes/site-18ac9c2704ce.css` & `.min.css`
  * `assets/data/route-style-manifest.json` (6,942,084 B)
  * `assets/data/route-style-rejected-selectors.json` (148,092 B)
* **Live HTTP Telemetry**:
  * `https://senseisandy.com/free-bjj-intro-tannersville-ny` -> `HTTP/2 200 OK`
  * `https://senseisandy.com/free-bjj-intro-tannersville-ny/confirmation` -> `HTTP/2 200 OK`
  * `https://senseisandy.com/js/progressive-booking.js` -> `HTTP/2 200 OK` (11,466 bytes)
  * `https://senseisandy.com/assets/css/routes/site-1d0842eaa685.min.css` -> `HTTP/2 200 OK` (41,771 bytes)

---

## 3. How to Validate Current Health

Run the following composite check to verify that all target gates for the booking funnel remain 100% green:

```bash
rtk npm run qa:funnel && \
rtk npm run qa:first-visit && \
rtk npm run qa:volatile-facts && \
rtk npm run qa:schedule && \
rtk npm run qa:links:static && \
rtk npm run qa:links:existence && \
rtk npm run qa:assets:js-parity && \
rtk npm run qa:assets:fingerprint:additive && \
rtk npm run qa:css:minified && \
rtk npm run qa:css:design-contract && \
rtk npm run qa:css:routes && \
rtk npm run qa:index-surfaces && \
rtk npm run qa:seo && \
rtk npm run qa:schema && \
rtk npm run qa:terminology
```

*(Expected result: all 15 commands exit 0 cleanly.)*

---

## 4. Next Priorities & Actionable Backlog

If continuing development in this worktree, choose from the following prioritized tracks:

### Track 1: Fast Wins on Pre-Existing Test Failures (Estimated: 30-45 mins)
Refer to [**`PRE-EXISTING-TEST-FAILURES.md`**](file:///home/twizss/Documents/ssbjjweb/tmb/PRE-EXISTING-TEST-FAILURES.md) for full context:

1. **Fix `qa:temporal`**:
   * File: [`src/jiu-jitsu-safety-tannersville-ny.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/jiu-jitsu-safety-tannersville-ny.html) (lines 210–226).
   * Issue: Contains expired program string `"Summer Pre-Camp Express"`.
   * Action: Remove or update this expired seasonal section, recompile with `rtk npm run build`, and test with `rtk npm run qa:temporal`.
2. **Fix `qa:weekly-audit`**:
   * File: [`scripts/qa-weekly-audit.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-weekly-audit.mjs).
   * Issue: Current calendar week PDF checksum/path mismatch.
   * Action: Run `rtk node scripts/qa-weekly-audit.mjs --update` or sync the active weekly schedule PDF reference.
3. **Fix `qa:assets:fingerprint` (Strict Mode)**:
   * Run: `rtk node tools/fingerprint-assets.cjs --check`.
   * Issue: 13 stale sibling CSS files left in `dist/assets/css/pages/private-lessons...` from prior builds (`--check-additive` passes, but strict check fails).
   * Action: Clean stale generated files in `dist/assets/css/pages/` or run `rtk node tools/fingerprint-assets.cjs --prune`.
4. **Fix `qa:css:assets` on `/nearby-towns`**:
   * File: [`src/nearby-towns/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/nearby-towns/index.html) or `dist/nearby-towns/index.html`.
   * Issue: Contains external link to `fonts.googleapis.com/css2?family=Plus+Jakarta+Sans`.
   * Action: Replace with self-hosted font declaration or use site standard font stack (`Lexend` / `Geist`).

### Track 2: Systematic Test Suite Cleanup (Phase 1 & 2)
1. **Retire Dead Test Scripts (ENOENT)**:
   * Retire or update test files referencing non-existent files:
     * `scripts/qa-core-culture-end-of-term-review.mjs` (`src/core-culture-review.html`)
     * `scripts/qa-fall-pilot-terms.mjs` (`src/fall-practice-reset.html`)
     * `scripts/qa-citation-phase1.mjs` (`tannersville-ny-jiu-jitsu.html`)
     * `scripts/qa-links-single.mjs`, `qa-links-anchor-text.mjs`, `qa-links-descriptive-text.mjs` (referencing `assets/*20260814.csv`)
2. **Harmonize Copy RegExes**:
   * Update regexes in `scripts/qa-attendance-policy-terms.mjs`, `scripts/qa-flexible-access.mjs`, `scripts/qa-philosophical-hierarchy.mjs`, and `scripts/qa-student-hub.mjs` to match current site copy rather than asserting deprecated slogans.

### Track 3: CRO Opportunities ([`CRO-CALENDLY-OPPORTUNITIES.md`](file:///home/twizss/Documents/ssbjjweb/tmb/CRO-CALENDLY-OPPORTUNITIES.md))
1. **SMS Fallback on Abandonment**:
   * For mobile users who view Step 2 (Calendly iframe) but don't finish booking within 60 seconds, display a subtle helper pill: *"Prefer texting? Tap here to text Sandy your preferred day: (917) 736-8649"*.
2. **Pre-fill Returning Student ID**:
   * When arriving with `?student_id=` or returning cookie, pre-select lane and pre-fill student details into Calendly prefill parameters.

---

## 5. File Inventory & Key Paths

| Path | Purpose / Responsibilities |
| :--- | :--- |
| [`src/free-bjj-intro-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html) | Canonical source template for intro booking funnel. |
| [`free-bjj-intro-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/free-bjj-intro-tannersville-ny/index.html) | Root static mirror (deployed to web server). |
| [`dist/free-bjj-intro-tannersville-ny/confirmation/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/dist/free-bjj-intro-tannersville-ny/confirmation/index.html) | Step 3 post-booking confirmation bridge. |
| [`js/progressive-booking.js`](file:///home/twizss/Documents/ssbjjweb/tmb/js/progressive-booking.js) | Step navigation, profile selection, Calendly mount, postMessage listener. |
| [`js/analytics-events.js`](file:///home/twizss/Documents/ssbjjweb/tmb/js/analytics-events.js) | Funnel events (`booking_intent`, `profile_selected`, `calendly_view`, `booking_completed`). |
| [`src/assets/css/routes/site-1d0842eaa685.min.css`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/routes/site-1d0842eaa685.min.css) | Compiled, minified CSS bundle for intro booking route. |
| [`CRO-CALENDLY-FIXES.md`](file:///home/twizss/Documents/ssbjjweb/tmb/CRO-CALENDLY-FIXES.md) | Original audit checklist (CAL-00 through CAL-11, now complete). |
| [`PRE-EXISTING-TEST-FAILURES.md`](file:///home/twizss/Documents/ssbjjweb/tmb/PRE-EXISTING-TEST-FAILURES.md) | Full diagnostic report of all 37 pre-existing failures outside booking route. |
| [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) | Atomic deployment script with automatic remote backup rotation and byte validation. |
| [`package.json`](file:///home/twizss/Documents/ssbjjweb/tmb/package.json) | Central registry of all build, test, and QA commands. |
