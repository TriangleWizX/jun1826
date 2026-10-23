# WS-29 — Mobile viewports: adaptive, clear, distinct from desktop

**Status:** WRITTEN Oct 23, 2026 (Sassafras, from same-session repo recon).
Not started. Owner request, Oct 23, 2026: "make a workstream to get the
mobile viewports more adaptive, visually clear, and distinct from the
desktop counterpart."

**Goal (one line):** On phone widths the site reads as a layout designed
for phones — one clear column, thumb-sized actions, a sticky way to book —
not as the desktop page squeezed down.

## Recon evidence (Oct 23, 2026, repo source at HEAD)

- **CSS sprawl:** 70+ stylesheets under `src/assets/css/`. The majors:
  components.css 356 KB, ss.css 225 KB, bootstrap-site.css 233 KB,
  base.css 97 KB, site-shell.css 69 KB, styles.css 69 KB, plus dozens of
  page sheets — most with a hand-paired `.min.css` twin.
- **No breakpoint system.** Breakpoints found across the five majors
  scanned (base, site-shell, global-fix, ss, components): 420, 560, 576,
  600, 620, 640, 680, 720, 760, 767, 768, 860, 900, 920, 991, 992, 1100.
  Near-duplicates (767 vs 768, 991 vs 992, 620/640/680/720 cluster) mean
  layouts shift at ragged, page-dependent widths.
- **No catastrophic overflow in the majors:** zero fixed `width:` values
  over 360px in the scanned files; `overflow-x` guards exist. The problem
  is inconsistency and clarity, not a broken site.
- **No visual QA exists.** package.json gates cover facts, ads, schedule,
  and evidence records. Nothing renders a page at a phone width, so every
  mobile check to date has been a manual spot render.
- Shared shell pieces: `src/partials/nav-include.html` (nav),
  `src/partials/home-conversion-shell.html` (homepage hero, per WS-21).
  Viewport meta `width=device-width, initial-scale=1` is present.

## Definitions (what "done" means, measurably)

- **Adaptive:** no horizontal scrolling at 360 / 390 / 430 px on any page
  in scope (`document.scrollingElement.scrollWidth <= innerWidth`), and
  no layout breakage at the in-between widths 361–767.
- **Visually clear:** body text ≥ 16px on mobile; one-column rhythm;
  heading scale steps down by fluid `clamp()`, not by a second squeezed
  desktop scale; images and media never exceed their container.
- **No pinch-zoom needed (owner, Oct 23, 2026):** every page in scope
  is fully readable and usable at 100% scale at 360 px. A visitor never
  has to zoom to read text, tap a control, or make sense of a table or
  price list. Secondary text floors at 14 px; anything smaller is a
  defect. Tables and wide blocks reflow (cards, stacked rows, or their
  own scroll wrapper) — they are never just shrunk.
- **Zoom stays enabled:** the viewport meta must never gain
  `maximum-scale` or `user-scalable=no`, in any file. The requirement is
  a layout nobody needs to zoom, not a page that forbids zooming.
- **Distinct from desktop:** condensed mobile header; a sticky bottom
  action bar on funnel pages (Text Sandy / Reserve Free Intro) that does
  not exist on desktop; schedule and pricing render as stacked cards/rows
  on mobile, not narrowed tables; tap targets ≥ 44px on primary actions.
- **Desktop unchanged:** at 1280 px the rendered layout matches the
  pre-work baseline captures (Phase 0) except for changes the owner
  approves from the defect log.

## Phase 0 — Inventory first (no CSS changes)

Per standing rule: inventory before any fix.

1. Map page families to the sheets they actually load:
   home, /schedule, /options-pricing, /free-intro, /visit, /programs
   (+ kids/adults/teens), one blog post, one /bjj-glossary entry,
   /alley-bootcamp, /winter-armor-2027, /bjj-faqs.
2. Rendered baseline captures at 360 / 390 / 430 / 1280 for each family,
   saved to `docs/ws29/baseline/`.
3. Defect log at `docs/ws29/defect-log.md`: per family — overflow,
   cramped or shrunken components, tap-target sizes, form behavior,
   type sizes, breakpoint oddities — each with severity and the width(s)
   where it appears. Include a dedicated pinch-zoom list: every element
   a visitor would have to zoom to read or use at 360 px (small text,
   shrunk tables, dense link clusters).
4. Determine the cascade: sheet load order per family, and how `.min.css`
   twins are produced by the build (never hand-edit a min file).

Deliverable: the defect log + load map. Owner (via Sassafras) confirms
priorities before Phase 1 starts.

## Phase 1 — One foundation

1. Adopt ONE breakpoint scale, chosen from the values the codebase
   already leans on (recon suggests 640 / 768 / 992 / 1100 as the spine);
   document it at the top of the foundation file. New mobile work uses
   only the scale. (Migrating every legacy query is NOT this phase.)
2. A single mobile foundation layer, loaded so it applies site-wide
   without a specificity war: container padding standard, media
   max-width guard, fluid type for hero/heading scales via `clamp()`,
   `-webkit-text-size-adjust: 100%`, tap-target floor for primary
   buttons/links, form inputs at ≥ 16px font size (stops iOS
   focus-zoom).
3. Fix every Phase 0 overflow defect at its source where the cause is
   local; where the cause is a shared component, fix it in the
   component's own sheet.

## Phase 2 — Shell and navigation

1. Condensed mobile header: logo, one call/text action, menu. Desktop
   header untouched.
2. Sticky bottom action bar on funnel pages (home, /visit, /free-intro,
   /options-pricing, /programs): "Text Sandy" + "Reserve Free Intro",
   thumb height, safe-area inset padding, hidden ≥ 768 px, and never
   covering the footer or form submit buttons (add body bottom padding
   where it renders).
3. Mobile menu: full-width rows, ≥ 44px targets, current-page state
   visible, no desktop dropdown behavior carried over.

## Phase 3 — Page-family passes (in this order)

1. **/schedule** — day/class tables become stacked cards per day;
   "next class" information readable without sideways scroll.
2. **/options-pricing** — pricing modules stack in the WS-20 order;
   every section id preserved (171 repo files deep-link to its
   anchors); the WS-20 payment details block behavior unchanged.
3. **Home** — hero (home-conversion-shell) type scale and CTA row at
   phone widths; proof strip stacks cleanly.
4. **/free-intro + /visit** — booking steps and the visible form:
   fields full-width, ≥ 16px inputs, SMS buttons full-width.
5. **Blog + glossary** — reading measure (no edge-to-edge text),
   embedded media contained, tables (if any) scroll inside their own
   wrapper, never the page.
6. **Landing pages** — /alley-bootcamp and /winter-armor-2027 checked
   against the foundation; winter poster and pricing modules at
   360 px specifically.

## Phase 4 — A viewport gate (proposal, owner approves before wiring)

- `scripts/qa-viewports.mjs`: headless-render the Phase 0 page list at
  360 / 390 / 430, assert no horizontal overflow AND no main-content
  text under the size floors (body ≥ 16 px, secondary ≥ 14 px, computed
  styles sampled from paragraphs, list items, table cells, and prices),
  write a screenshot set + one-line-per-page report to
  `docs/ws29/runs/`.
- Ship it as a runnable script first. Adding it to the CI gate chain
  (qa:volatile-facts → test:ads → validate → qa:schedule) is a separate
  owner decision.

## Hard constraints

- No copy changes. No layout change that alters text, prices, times,
  JSON-LD, or canonical data (pricing.json / schedule.json / contact).
- No section id or anchor changes anywhere; deep links must survive.
- Never hand-edit `.min.css`; regenerate through the build.
- All existing deploy gates must pass, in order.
- A change that only looks right in a local render is not done:
  verification is on production after deploy, at the three widths,
  with desktop regression compared to the Phase 0 baseline.

## Verification protocol

- Executing agent: per phase, screenshot set (360/390/430/1280) for the
  families it touched + the overflow assertions, committed under
  `docs/ws29/`.
- Sassafras: spot live reads after deploy. NOTE: her text extractor is
  blind to layout — it cannot verify this workstream. Closure rests on
  the rendered captures plus the owner's own phone check of the top
  pages (home, /schedule, /options-pricing).
- Report per phase: commit hash, gates, families touched, captures
  path, and any defect-log items deliberately deferred, with reasons.
