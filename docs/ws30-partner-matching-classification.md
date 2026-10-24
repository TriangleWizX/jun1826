# WS-30 Classification Audit: "Partner Matching" in `src/`

**Date:** October 24, 2026  
**Context:** WS-30 ("Offer reframe: the teacher leads, partner matching is a mechanic")  
**Objective:** Confirm classification of all remaining occurrences of "partner matching" across `src/` following the offer-level reframing in `src/_data/offers.json`, `src/partials/home-conversion-shell.html`, `src/friday-night-fanatics.html`, and `src/options-pricing.njk`.

---

## Operating Rule

> **Rule:** Change ONLY offer-level placements (includes lists, chips, feature bullets that sell the 12-week term or paid package). Process copy stays untouched — it is honest mechanics.

---

## Classification Summary

Across the 10 audited files containing "partner matching" (12 total occurrences), **all 10 files (100%) represent honest process copy, pedagogical descriptions, or safety reassurance mechanics**. None of them function as offer-level bullets or terms selling a paid program. Consequently, all 10 files are confirmed to remain untouched.

---

## Detailed Audit Table

| # | File Path | Line(s) | Match Text / Snippet | Classification | Detailed Rationale |
|---|-----------|---------|----------------------|----------------|---------------------|
| 1 | `src/how-class-works.html` | 4, 27, 281 | `description: "...Learn how movement games, partner matching, and coached resistance work."`<br>`Each visit is a 60-minute experience with about 45 minutes of calm, coach-led training. Learn how movement games, partner matching, and progressive resistance build real skill step by step.`<br>`Parents are welcome to sit, watch, and enjoy youth classes. Sandy coordinates partner matching, drill pace, and room safety throughout.` | **Process Copy** | Explains daily 45-minute class structure and pedagogical progression. Demonstrates why small-group training is safe and cooperative. Explicitly asserted as process copy by `scripts/qa-coaching-gradient.mjs`. |
| 2 | `src/sensei-bully.html` | 406 | `<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Coach-led partner matching</li>` | **Process Copy** | Hero reassurance checklist alongside "No punching or kicking", "Parents can watch", and "Beginner-safe pacing". Reassures nervous parents regarding room physical safety; does not define a paid term package. |
| 3 | `src/after-school.html` | 702 | `Best for kids and teens ready for a calm class with clear coaching and thoughtful partner matching. Regular attendance builds steady progress.` | **Process Copy** | Program description card clarifying student fit and classroom tone for the ongoing youth program; not an offer bullet or package perk. |
| 4 | `src/blog/schedule-sensei/index.html` | 127 | `<li>Partner matching and coached rounds keep the room calm.</li>` | **Process Copy** | Editorial safety guideline in an educational blog article on training schedules. |
| 5 | `src/blog/safe-bjj-mma-training-tannersville/index.html` | 66 | `<h2>Careful Partner Matching and Class Sizes</h2>` | **Process Copy** | Section heading within an editorial guide explaining mat safety and partner pairing based on size and experience. |
| 6 | `src/bjj-classes/kids-tannersville-ny/index.html` | 66 | `<span>Safe Partner Matching</span>` | **Process Copy** | Hero safety reassurance chip alongside `Coach-Led Rounds` and `Parents Can Watch`. Reassures parents about physical safety during drills rather than selling a membership term. |
| 7 | `src/bjj-classes/teens-tannersville-ny/index.html` | 83 | `<span>Safe Partner Matching</span>` | **Process Copy** | Hero safety reassurance chip alongside `Coach-Led Rounds` and `Grappling-Only Training`. |
| 8 | `src/bjj-classes/family-martial-arts-catskills/index.html` | 421 | `Yes. Kids train in the youth block. Adults train in the adult block. This structure gives each group dedicated coaching and appropriate partner matching under one roof on Tannersville Main Street.` | **Process Copy** | FAQ answer explaining mat logistics and why kids and adults train in separate dedicated blocks under one roof. |
| 9 | `src/beginner-friendly-bjj-tannersville-links/index.html` | 68 | `Beginner class is the simplest way to explain why the first small-group class feels different here. It means tour first, safety walkthrough, partner matching, and skill-based resistance activities begin at the right pace from day one.` | **Process Copy** | Canonical glossary definition explaining the four-part beginner onboarding pedagogy. |
| 10 | `src/free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny/index.html` | 25 | `<div class="yi-card"><h3 class="h5">Partner matching</h3><p class="mb-0 yi-note">Sandy picks a partner and sets the task.</p></div>` | **Process Copy** | Card explaining what happens during the Free First Visit intro session ("What your family receives"). The 12-week term offer in Section 27 uses honest mechanics ("Sandy picks the partner"). |

---

## Verification & Status

- **Status:** Complete & Confirmed
- **Outcome:** 0 additional offer swaps required. All 10 files confirmed as valid process copy and mechanics.
