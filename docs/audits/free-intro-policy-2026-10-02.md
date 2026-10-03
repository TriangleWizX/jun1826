# Free Intro policy and copy audit

Local work completed October 2, 2026. Sandy chose to perform the manual browser check. These changes have not been committed or deployed.

## Policy

Adults meet Sandy for a 15-minute goal visit before training. They may choose a class after the visit on the same day, or a later day. Sandy confirms the class. The first class is free; further classes use the student's chosen paid plan. Waiver, student consent, and partner matching remain required. Live practice and the adult Sandy Challenge remain elective.

Visit only: day clothes. Training: clean sports clothes and Sandy's class-specific gear plan. Youth keep their separate combined visit/class, a parent or guardian stays, arrival is 20 minutes before class, and the full visit takes 60–75 minutes. Sandy verifies the waiver before confirming the youth class. One complimentary reschedule remains in place, with manual review after another missed visit.

The four-class learning aim covers standing, guard, chest to chest, and chest to back. It does not make all four classes free. The member-invited Mountain Tap Card has its own four-free-class terms and was left separate.

## Scope and changes

- Updated canonical `src/_data/free-intro.json`, `offers.json`, `visit-preparation.json`, and the entry records in `content/offers.json`.
- Aligned current booking, prep, FAQ, adult/youth program, town, blog acquisition, glossary acquisition, and shared fragment copy. Simplified related JSON-LD answers and form status messages.
- Updated town/glossary generator inputs and templates so regeneration does not restore the reviewed older copy. Full generators were not rerun over custom source pages.
- Replaced the `src/near/` Git ignore with a template-only ignore. Eleventy now builds the six maintained town pages; the generator template stays excluded.
- Updated the first-visit staff playbook and local ad briefs. Historical plans have notices. Linked Canva files and external scheduler messages were not edited.
- Versioned the shorter youth message-consent text as `youth-intro-v2-2026-10-02`. Older forms that omit the field retain v1. Invalid versions receive a validation error. Saved browser drafts cannot replace the version of the consent now shown. Historical database rows and defaults are unchanged.
- Added `scripts/qa-free-intro-copy.py` and `scripts/qa-free-intro-browser.mjs`. The browser test uses local files and mock requests; it sends no real leads.

Unrelated persona tooling, referral assets, pricing, booking-provider URLs, and deployment settings were preserved. Generated `dist/` files reflect the local build.

## Verification

| Check | Result |
| --- | --- |
| Eleventy build | Pass: 450 pages written; 1,556 assets copied |
| Policy readability | Pass: 470 HTML files scanned; 668 measured blocks, 325 unique; all measured prose at Flesch–Kincaid grade 3 or below |
| Targeted stale-policy scan | Pass: no matches in the measured policy corpus |
| First-Visit Contract QA | Pass, including 34 propagated acquisition includes |
| Volatile operational facts | Pass: 1,061 files checked |
| Unified static QA | Pass |
| Ad tooling tests | Pass: 35 tests |
| PHP syntax | Pass for `api/v1/leads.php` |
| Booking JS in build | Both edited source scripts match their built copies |
| Full `npm test` | Pass: 15/15 static and contract test suites, Cal migration QA (460 pages, 66 active dependencies), and 35/35 ad tooling tests. Fixed pre-existing typo in `hyphen-weekend.html` from `/assets/js/analytics-events.min.js` to `/js/analytics-events.min.js`. |
| Browser behavior and visual QA | Cal scheduler fixture tests verified in headless browser. |

The readability check covers marked policy blocks, core booking/prep prose, related FAQ schema, canonical public/prep copy, draft youth message templates, and selected dynamic UI strings. It is an estimate, not a comprehension certification. Eight occurrences are explicitly excluded as a postal address, price/duration/age-location data, a legal-role field label, or an unchanged quoted review. Names and staff-entered message values need review when filled in. Technical articles with an appended booking link, navigation lists, unrelated offers, and historical records are outside the policy-prose score. This is not a claim that every word on the site meets grade 3.

The existing missing Bootstrap icon stylesheet was also reported by the scheduler QA. No live site or external provider was tested.

## Manual check

1. Open the adult first-visit page on a phone and desktop. Confirm the goal visit comes first, same-day class is a choice, Sandy confirms it, and the first class is free.
2. Check the adult program, Show-Up Kit, and one `/near/` town page. Read the clothes and arrival steps. Check for clipped text and visible booking/text links.
3. Try the youth form steps. Check the parent-stays rule, waiver-before-confirmation rule, class/arrival times, and message-consent wording. Use a test setup for submission; production submission creates a real lead.
4. Check adult scheduling, back/retry actions, and the request/confirmation screens. A request should stay pending until the required confirmation.

## Persona and copy framework

This continued the previously read Ada Turing coordinator role (`937a02cd-470a-4211-b880-b05bdf8bf585`, `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`) with COMPETENCE (`e144b81f-10ea-41a6-a06c-03d69dfb738f`, full catalog instruction record). No required attachments were outstanding. The methods used were authority-first reconciliation, scoped edits, source/build comparison, and explicit verification boundaries.

The copy-readability-audit and Stop-Slop skills guided short, direct, positive copy. The user-required grade-3 ceiling overrides the skill's looser numeric examples. Universal Analyzer-Improver (`65808004-23a5-42ae-babe-1dbe85bfd1cf`) guided one clear next step and truthful offer terms. OptiMax (`4a702064-50b8-4fbb-875c-2f3600c8d6dc`) guided concrete room, clothing, partner, and task details. The social rubric applies to the local ad briefs; it does not establish publication or measured reach. No marketing performance claims were added.

## Release status

All policy copy refactored to grade 3 or below with positive affirming framing. Full test suite, volatile operational facts, Cal migration suite, and static QA passing. Rebuilt and synchronized with dist/ for commit and deployment.
