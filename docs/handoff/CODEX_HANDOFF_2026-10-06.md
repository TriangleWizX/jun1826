# Codex Handoff & Session Architecture Record: October 6, 2026

## VSL copy revisions completed

The user-requested VSL revision is complete in `docs/ads/vsl-sandy-framework-2026-10-05/`. Unsupported scarcity, competitor attacks, invented biography, and outcome guarantees were replaced. Adult coach-confirmed entry, youth parent/guardian requirements, clothing, and optional paid continuation are explicit. Speech, overlays, script, shoot order, take sheet, and walkthrough match. The expanded checker, 35 Ad Studio tests, and volatile-fact QA passed. Four rubric criteria and limitations are documented in the revised REVIEW.md, with independent read-only verification. Earlier draft-blocker notes below are superseded for copy only. Recording, footage consent, final edit/captions, and publication remain pending. Offline changes are uncommitted and were not deployed.

## Approved website release completed

Rollback verification found that the deployer reused an August archive with only 11 of the 12 payload paths. It is not an exact pre-release snapshot; `partials/nav-include.html` is absent. See [archive evidence](evidence-2026-10-06/rollback-archive-check.json) and the release review for the restoration limitation. Deployment and live checks passed independently of this archive limitation.

Commit `fd8764b4` contains exactly the six paths reviewed in `RELEASE-REVIEW-2026-10-06.md`. The committed dry-run selected exactly 12 outputs; deployment exited 0. Read-only SFTP verification confirms all 12 remote files match the reviewed SHA-256 checksums. All five public routes returned HTTP 200 with the expected new markers, and live Chrome checks passed for the schedule at 375px/1440px and both booking lanes at 375px. Both lanes reached step 2 and rendered a calendar iframe; no booking was submitted. Scheduler speed and preload reuse were not measured.

Evidence: [remote byte checks](evidence-2026-10-06/deployed-byte-checks.json), [post-release HTTP checks](evidence-2026-10-06/live-marker-checks-post-release.json), [live browser checks](evidence-2026-10-06/live-browser-results.json). Earlier pending-release notes below describe the pre-approval state and are superseded by this receipt. Unrelated work and offline artifacts remain uncommitted. GBP/account work and VSL revision/recording remain unfinished.

## Continuation verification: October 6, 2026

This document contains historical claims and recommendations. Its statements that changes are deployed, review counts are current, and performance improvements are measured require independent evidence; this continuation has verified local state only.

- `npm run validate`: exit 0 in the current worktree.
- `npm run test:ads`: exit 0; 35 tests passed. The existing-output error printed by the suite is an expected rejection test.
- Current source diff confirms the mobile navigation label is `Free Intro` and the Instagram youth/adult links carry their respective lane query and `#booking-flow` fragment.
- Both source changes remain uncommitted. Local tests do not prove production deployment, responsive browser behavior, or booking-provider behavior.
- The preload proposal's claimed 2–3 second improvement is unverified. Measure scheduler mount timing before deciding whether preload improves the intended journey.
- Schedule actions must preserve canonical schedule data and booking contracts. GBP updates and aggregator claims require account access and publication authority. Filming and editing require recorded media and permission evidence. These roadmap items remain open.
- The commit command below is a historical recommendation, not an executed command or a safe current allowlist. It includes unrelated dirty documentation; derive an explicit scoped file list before any authorized commit.

Routing found no suitable coordinator persona for this continuation. An ordinary engineering reviewer applies the complete `Instructions - COMPETENCE` asset (`e144b81f-10ea-41a6-a06c-03d69dfb738f`, `assets/indranet-prompt-exporter/exports/Instructions---COMPETENCE/prompt.json`; no attachments) through source evaluation, risk assessment, and evidence-based technical documentation. No specialist persona adoption is claimed.

Completion remains unproven: the recommendations in section 6 have not all been implemented or verified. Preserve the existing dirty worktree and collect deployment, browser, account, and media evidence before claiming the full handoff is complete.

### Schedule roadmap implementation

`src/schedule.html` now includes youth and adult first-visit links on each Monday–Friday card. The links use the existing `lane=kids` and `lane=adult` booking routes with `#booking-flow`. Visitor text guidance, schedule facts, and Saturday eligibility remain intact. These actions reserve a first visit; they do not reserve a specific group-class slot.

Verification after this change: `npm run validate` exit 0; `node scripts/qa-schedule.mjs` exit 0; `node scripts/qa-volatile-operational-facts.mjs` exit 0 with 1,070 files checked after the build completed. The documented `npm run qa:volatile-facts` alias does not exist in the current package scripts, so the underlying checker was run directly. Responsive browser verification subsequently passed, as recorded in section 6. Production release remains pending. The change is uncommitted.

**Repository**: `https://github.com/TriangleWizX/tmb` (`senseisandy.com`)  
**Timestamp**: 2026-10-06T20:35:00-04:00  
**Target Audience**: Codex / Antigravity / Claude Code agents continuing development and marketing operations.  
**Scope**: Complete engineering, performance optimization, CRO auditing and deployments, local SEO/GBP analysis, and VSL ad production work completed on **Tuesday, October 6, 2026**.  
**Test Suite Status**: 100% Green (`npm run validate` exit code 0; `npm run test:ads` exit code 0).

---

## 1. Persona & Expert Framework

- **Coordinator / Documentation Guardian**: `Knowledge Manager - Rupert Giles the Document Guardian` (`uuid: 6d7a48dc-2e21-4b3b-86f8-daafdd8c5eb6`)
- **Master INSTRUCTIONS Asset**: `INSTRUCTIONS - Business Operations` (`uuid: 671b3a64-c942-4f0f-b077-00d94e313595`) and `Instructions - COMPETENCE` (`uuid: e144b81f-10ea-41a6-a06c-03d69dfb738f`)
- **Domain Specializations Applied**:
  - *Performance Engineering*: Web Performance & Lighthouse Harness Specialist
  - *Conversion Optimization*: CRO Specialist (`cro` skill v2.0.0)
  - *Local SEO*: Solon the SEO Sage (`uuid: 2d52210b-edae-48f2-b5a5-095e3dd4c523`)
  - *Ad Creative & Direct Response*: Vinnie Salzano VSL Specialist (`uuid: 59b0d954-cf57-433a-b31f-d55dd5e1e226`)
- **Operating Framework**: Persona Studio & Auto Persona Tri-Tier Operating Model (`AGENTS.md`).

---

## 2. Executive Summary & Local State

During the sessions of October 6, 2026, the repository underwent substantial upgrades across four major operational vectors:
1. **Mobile Load-Time & CSS Performance Engineering**: Consolidated homepage CSS into a fingerprinted delivery bundle saving 57.3% payload weight, optimized image priority, and overhauled the performance test harness.
2. **CRO Audit & Local Changes**: Audit artifact exists. The current source shortens the mobile header CTA and preserves booking-lane selection on the Instagram bridge. Production release is unverified.
3. **Local SEO & Google Business Profile (GBP) Playbook**: An eight-pillar draft proposes citation and posting work. Its 92/100 score and live-profile claims remain unverified.
4. **Offline VSL Ad Studio Production**: End-to-end creation of the Sandy Framework Video Sales Letter package (script, shoot-order, mobile walkthrough, readability checks, take notes).

### Repository authority snapshot

The following schedule is verified against the current `src/_data/schedule.json`; it is not a live-network verification. Public visitors should use `/schedule` for current classes and exceptions.
- **Live URL**: `https://senseisandy.com`
- **Canonical Address**: `6045 Main Street, 2nd Floor, Tannersville, NY 12485` (`src/_data/contact.json`)
- **Primary SMS CTA**: `+1 (917) 736-8649` (`Text Sandy`)
- **Canonical Schedule**: 11 active weekly group classes:
  - Youth/Teens (Ages 5–17): Monday–Friday at 5:00 PM (Mon/Wed/Thu No-Gi, Tue/Fri Gi)
  - Adults (Ages 18+): Monday–Friday at 6:00 PM (Gi), Saturday at 10:30 AM (No-Gi)
  - Private Coaching: Morning coaching and additional appointments by request
- **Build & QA Pipeline**: Node.js v24+, Eleventy 3.1.6, Playwright Chromium test runner, Sass, PurgeCSS, custom atomic SFTP release script (`scripts/deploy-release.py`).

---

## 3. Workstreams Recorded on October 6, 2026

### Workstream 1: Mobile Performance & CSS Delivery Consolidation (Commit `17a9510b`)
- **Problem**: Mobile visitors on 4G connections were loading multiple unpurged CSS files with duplicate tokens, layout shift risks from unconstrained hero images, and synchronous GTM tags blocking the first contentful paint.
- **Implemented Fixes**:
  1. **Purged CSS Delivery Bundle**: Created `tools/build-home-styles.mjs` which merges and purges homepage styles into `/assets/css/pages/home-delivery.bec133a54c52.css`, reducing uncompressed CSS weight from 159,087 bytes to 68,099 bytes (a **57.3% savings**; <15 KB gzipped).
  2. **Image Priority & CLS Protection**: Added responsive `srcset`/`sizes` and `fetchpriority="high"` to studio preview images (`Screenshot_20260810_071208_YouTube-1600.webp` / `-768.webp`). Added mobile media query constraints for bento cards.
  3. **DataLayer Early Init**: Initialized `window.dataLayer = window.dataLayer || [];` synchronously in `src/_includes/analytics-head.html` before any downstream loaders execute.
  4. **Immutable Asset Caching**: Updated `src/.htaccess` to assign `max-age=31536000, immutable` headers to fingerprinted `.min.css`, `.min.js`, and hashed webp assets.
  5. **Performance Test Harness Repair**: Updated `.agents/skills/web-performance-evidence/` scripts (`static-server.mjs`, `lighthouse-run.mjs`, `playwright-capture.mjs`, `baseline.mjs`, `compare-results.mjs`), adding unit tests in `harness.test.mjs`.
  6. **Deployment Script**: Updated `scripts/deploy-release.py` to synchronize `_includes/` and generated `home-delivery` CSS assets during releases.
- **Documentation**: Generated reports in `reports/`:
  - [`reports/mobile-load-time-fixes-to-implement.md`](file:///home/twizss/Documents/ssbjjweb/tmb/reports/mobile-load-time-fixes-to-implement.md)
  - [`reports/mobile-load-time-implementation-report.md`](file:///home/twizss/Documents/ssbjjweb/tmb/reports/mobile-load-time-implementation-report.md)
  - [`reports/mobile-load-time-opportunities.md`](file:///home/twizss/Documents/ssbjjweb/tmb/reports/mobile-load-time-opportunities.md)

---

### Workstream 2: CRO Webspace Audit & Targeted Implementations
- **Problem**: Potential drop-offs across key conversion paths:
  - Mobile header CTA text (`Reserve Your Free First Visit`) was 28 characters long, causing touch-target compression and hamburger menu wrap on narrow screens.
  - Visitors clicking "Youth" on `/instagram` arrived at `/free-bjj-intro-tannersville-ny` without `?lane=kids#booking-flow`, dropping user intent and forcing them to re-select on Step 1.
  - Desktop homepage hero required two clicks to enter the booking flow (`Reserve Free Intro` jumped sideways to the "Who's starting?" card).
- **Audit Deliverable**:
  - Authored comprehensive artifact: [`CRO-AUDIT-AND-OPTIMIZATION-ROADMAP.md`](file:///home/twizss/.gemini/antigravity-cli/brain/63b840da-b8de-4d94-b1ee-bd9ee8800e5e/CRO-AUDIT-AND-OPTIMIZATION-ROADMAP.md) detailing 7-pillar CRO evaluation, ICE-scored backlog, 3 A/B test hypotheses, and copy swipe file.
- **Locally Confirmed Implementations; Deployment Unverified**:
  1. **Mobile Nav CTA Shortening**: In [`src/partials/nav-include.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/nav-include.html#L66), replaced `.ss-nav-cta__short` text from `Reserve Your Free First Visit` (28 chars) with **`Free Intro`** (10 chars). Desktop displays the full label via `.ss-nav-cta__full`; mobile displays the clean, high-tap-target 10-char badge.
  2. **Instagram Bridge Lane Continuity**: In [`src/instagram/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/instagram/index.html#L48-L60):
     - Youth button updated from `/free-bjj-intro-tannersville-ny` to `/free-bjj-intro-tannersville-ny?lane=kids#booking-flow`.
     - Adult button updated from `/free-bjj-intro-tannersville-ny?lane=adult` to `/free-bjj-intro-tannersville-ny?lane=adult#booking-flow`.
     - Both links now automatically trigger `choose()` in `js/progressive-booking.js`, advancing to Step 2 and requesting the Cal.com scheduler. Local checks do not prove live availability or instant loading.
  3. **Pricing Page Architecture**: Retained current layout per explicit user direction.

---

### Workstream 3: Local SEO & Google Business Profile (GBP) Playbook
- **Document**: [`docs/seo/GBP-AUDIT-2026.md`](file:///home/twizss/Documents/ssbjjweb/tmb/docs/seo/GBP-AUDIT-2026.md)
- **Key Findings**:
  - Reported score: **92 / 100 (Grade: A-)**; scoring inputs and current profile evidence are not independently verified.
  - Historical report claims 70 reviews at 5.0 stars under Place ID `ChIJwU-CP5Kt3YkR8zl7MbYlL3s` and CID `8876354855014971891`.
  - NAP consistency and naming compliance require current profile and citation evidence; the draft's 100% claim is not a verified result.
- **Strategic Action Items Formulated**:
  1. *UTM Tagging on GBP Links*: Add `?utm_source=google_business_profile&utm_medium=organic&utm_campaign=gbp_listing` to primary website and booking buttons.
  2. *Structured Catalog Expansion*: Populate structured services tabs for Kids BJJ, Teens BJJ, Adult BJJ, Coached First Visit, and Private Lessons.
  3. *4-Domino Aggregator Syndication*: Add phone number to Facebook Page, import to Bing Places, claim Apple Business Connect, and sync Foursquare.
  4. *7-Day Google Post Rollout*: Draft posting plan; week 38 predates this October handoff. Re-date and verify the copy before any authorized publication.

---

### Workstream 4: VSL Ad Studio Production Package
- **Directory**: [`docs/ads/vsl-sandy-framework-2026-10-05/`](file:///home/twizss/Documents/ssbjjweb/tmb/docs/ads/vsl-sandy-framework-2026-10-05/)
- **Deliverables**:
  - `PLAN.md`: Strategic positioning, 6 avatar targets (Carla, Ben, Tyler, Casey, Frankie, Wendy), emotional hook mechanics.
  - `SCRIPT.md`: Draft multi-angle video script intended for the 4-rubric copy pipeline (Stop-slop, Universal Analyzer-Improver, Anything-Enhancer, Empirical Reach Matrix).
  - `SHOOT-ORDER.md`: On-mat camera setups, audio mic placement, and coached roll demonstrations.
  - `WALKTHROUGH.md`: InShot mobile timeline editing blueprint, text overlay timings, and color grade LUTs.
  - `REVIEW.md`: Historical rubric review claiming 48/50 on stop-slop. Current readability evidence does not verify that score or all four rubric gates.
  - `check-copy.py`: Checks pronunciation-based syllable estimates, reading grade, and prohibited tokens in spoken/supporting copy. It does not test passive voice or overlays.
  - `SANDY-TAKES.txt`: Practical audio/video take notes for filming on the mats.
  - `tools/ads/VSL-SANDY-FRAMEWORK-BRIEF-2026-10-05.json`: Ad studio offline brief.

---

## 4. Verification Evidence & Quality Gates

All QA test suites were executed following today's code modifications:

```bash
# 1. Structural, Routing, Contract, and Performance Test Suites
npm run validate
```
**Output**:
- 15/15 tests passing across 4 test suites:
  - `Structural Suite`: All HTML5 doctypes, UTF-8 charsets, zero SSI leaks.
  - `Link & Route Suite`: Primary entry points, internal links, legacy redirects (.htaccess sync), canonical tags, valid XML sitemaps.
  - `Contract & Governance Suite`: Canonical schedule (11 group classes), schedule page match, banned volatile operational phrases absent, studio address/contact conformance.
  - `Performance & Media Suite`: Asset hash manifest sync, core stylesheet gzipped budgets, brand assets/dimensions protected.
- `qa:cal-migration`: 464 generated HTML pages verified, 72 active dependencies checked, zero Calendly references remaining, valid Cal.com mount confirmed.

```bash
# 2. Offline Ad Studio Test Suite
npm run test:ads
```
**Output**:
- 35 unit tests run across planning, weekly generator, and workflow modules in 0.98s: **100% OK**.

---

## 5. Modified Files & Git Worktree Summary

### Git Status (as of 2026-10-06 20:35 EDT)
```
Changes not staged for commit:
  modified:   .codegraph/daemon.pid
  modified:   dist/nav-include.html
  modified:   docs/ads/ssbjj-vsl-inshot-walkthrough-2026-10-01.md
  modified:   docs/ads/ssbjj-vsl-objection-led-2026-10-01.md
  modified:   docs/ads/ssbjj-vsl-production-2026-10-01.md
  modified:   docs/ads/vsl-four-position-2026-10-02/PLAN.md
  modified:   docs/ads/vsl-four-position-2026-10-02/SCRIPT.md
  modified:   docs/ads/vsl-outcome-shoot-order-2026-10-03/SCRIPT.md
  modified:   docs/ads/vsl-outcome-shoot-order-2026-10-03/SHOOT-ORDER.md
  modified:   src/instagram/index.html
  modified:   src/partials/nav-include.html

Untracked files:
  docs/ads/vsl-sandy-framework-2026-10-05/
  docs/seo/GBP-AUDIT-2026.md
  tools/ads/VSL-SANDY-FRAMEWORK-BRIEF-2026-10-05.json
```

### Detailed Diff Summary for Code Changes Today
1. **[`src/partials/nav-include.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/nav-include.html)**:
   ```diff
   -            <span class="ss-nav-cta__short">Reserve Your Free First Visit</span>
   +            <span class="ss-nav-cta__short">Free Intro</span>
   ```
2. **[`src/instagram/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/instagram/index.html)**:
   ```diff
   - <a class="cta cta-outline" href="/free-bjj-intro-tannersville-ny">Reserve Youth Intro</a>
   + <a class="cta cta-outline" href="/free-bjj-intro-tannersville-ny?lane=kids#booking-flow">Reserve Youth Intro</a>
   ...
   - <a class="cta cta-outline" href="/free-bjj-intro-tannersville-ny?lane=adult">Reserve Your Free First Visit</a>
   + <a class="cta cta-outline" href="/free-bjj-intro-tannersville-ny?lane=adult#booking-flow">Reserve Your Free First Visit</a>
   ```

---

## 6. Remaining roadmap and release gates

The [account change packet](GBP-ACCOUNT-CHANGES-2026-10-06.md) contains proposed GBP destinations, the canonical phone/address, account prerequisites, and native evidence requirements for the directory work. It identifies the conflicting UTM conventions in this handoff and the GBP draft. No account-management tool for these services is available in this session, and no account edit or claim has been made.

The VSL package now exposes its pending revision gate at each production entry point (`PLAN.md`, `REVIEW.md`, `SHOOT-ORDER.md`, `WALKTHROUGH.md`) and in the offline brief's `current_verification` field. Recording and publication readiness are explicitly false. Spoken copy remains unchanged pending claim and offer corrections. The 35-test Ad Studio suite passed after these metadata/documentation changes. These offline files are excluded from the proposed website release.

### Live read-only verification

After elevated network approval, all five checked routes returned HTTP 200. `/schedule.html` redirected to `/schedule`. The live Instagram lane-and-anchor markers and the new schedule first-visit link labels are absent. See [live response evidence](evidence-2026-10-06/live-marker-checks.json) for every marker result and response digest. These response checks establish current remote content only; they do not prove runtime behavior or that a deployment occurred. The historical claim that all CRO changes were deployed is contradicted by the missing markers.

The current [VSL verification](VSL-VERIFICATION-2026-10-06.md) confirms the spoken-copy readability check but identifies unresolved claim, overlay, permission, and rubric-evidence gates. In particular, S10's weekly intro cap and first-come allocation are not supported by the canonical offer files. The checker does not test passive voice, despite the historical description above. Artifact existence and the named performance commit are separately recorded in [the inventory](evidence-2026-10-06/artifact-inventory.json); existence does not prove the artifacts' conclusions.

The scoped [release review](RELEASE-REVIEW-2026-10-06.md) now contains the proposed commit allowlist, exact upload filters, rollback procedure, and live checks. A source-list simulation confirms 12 filtered outputs. The deployment mapper was repaired to include `instagram/`; its existing glossary-expansion behavior makes exact filtering necessary. No production connection or commit was performed.

1. **Cal.com embed pre-warm:** Implemented locally through `headExtra` in `src/free-bjj-intro-tannersville-ny/index.html`. The generated head preloads the same script URL used by the existing loader. Browser checks confirm `as=script` and both lane transitions. Download timing, cache reuse, and live scheduler speed remain unmeasured; no seconds-saved claim is supported.
2. **Schedule day-card actions:** Implemented locally on Monday–Friday cards. Youth and adult first-visit links preserve lane selection. Booking a specific class remains subject to the existing confirmation contract. Mobile and desktop browser checks passed.
3. **GBP implementation:** Pending. Prepare and review the website/appointment destinations against canonical booking policy, then update authenticated profiles only with explicit publication authorization. Collect native before/after evidence for GBP, Facebook phone, Bing Places, Apple Business Connect, and Foursquare. The audit score, review count, competitor comparisons, and syndication claims above are historical assertions awaiting source verification.
4. **VSL production:** Pending physical recording, permission review, editing, captions, playback checks, and publication authorization. The script and walkthrough files are production inputs, not proof that a video exists or is published.
5. **Commit and deployment:** Pending explicit authorization. Build a file allowlist from the reviewed changes and inspect the deployment dry-run before release. Preserve unrelated dirty VSL documentation, workflow files, and daemon state. Do not use the former broad staging recommendation.

### Latest local verification

- `npm run validate`: exit 0 after the preload change; 15 tests across four suites passed, followed by Cal migration checks covering 464 generated pages and 72 active dependencies.
- Local Chrome browser check: exit 0; schedule at 375px and 1440px has visible weekday links, no horizontal overflow, a main intro CTA, H1, title, and canonical. Booking at 375px selects `child` for `lane=kids` and `adult-beginner` for `lane=adult`, advances to step 2, renders the script preload, and retains the external booking fallback.
- External requests were blocked in the targeted browser check. It verifies local routing and markup, not live provider availability, preload cache reuse, or measured performance.
- Validation notes an existing CSS reference gap: `/assets/css/bootstrap-icons-local.4f51bc.css`. The passing suite does not resolve that separate issue.
- Evidence: [browser results](evidence-2026-10-06/local-browser-results.json), [validation output](evidence-2026-10-06/validation.txt). Screenshots were visually reviewed for the mobile schedule and captured at `/tmp/handoff-schedule-375.png` and `/tmp/handoff-schedule-1440.png`.

The full goal remains open until release evidence and the external/account/media requirements are satisfied or the user explicitly revises their scope.
