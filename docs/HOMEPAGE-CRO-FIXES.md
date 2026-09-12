# Homepage CRO fixes

Implemented locally on 2026-09-12. No deployment or conversion-uplift claim.
Baseline revision: `235f858420953c5feb436e262e2a4c092a616382` (initial worktree clean).

## Scope and evidence

The active owner is `src/partials/home-conversion-shell.html`. Preserve the existing H1, supporting sentence, Child/Teen/Adult/Family selector, adult default, desktop three-column composition, attributed reviews, Google destination, seven-second navigation ticker, and hamburger navigation. Historical handoffs are not current measurements.

Local Chromium uses generated `dist` with SSI resolved through `readHtmlWithSsi`. External requests are blocked: this is local rendered evidence, not production HTTP or external service verification. Baseline and verification JSON are in `docs/evidence/homepage-cro/`; screenshots are retained locally under `/tmp/home-cro-evidence`. Reproduce with `npm run build` then `node scripts/qa-home-cro.mjs`; artifacts are written to `tmp/home-cro-verification/`.

| Viewport | Original CTA bottom | Updated CTA bottom |
|---|---:|---:|
| 320×568 | 1097px | 564px |
| 375×667 | 981px | 547px |
| 390×844 | 981px | 547px |
| 414×896 | 981px | 547px |
| 768×1024 | 729px | 439px |
| 992×768 | 967px | 525px |
| 1366×768 | 947px | 600px |
| 1440×900 | 947px | 600px |

Navigation height: 223px below 992px and 187px at desktop widths. Mobile availability strip: 68px, reduced to 48px below 360px. No text-size reduction or content clipping was used. At 320px there is little fold margin, so browser font differences remain relevant.

## Ordered tickets

- **HOME-FIX-01:** Captured initial view, open menu, four selections, continuation/sticky area and footer at all eight requested sizes. Baseline confirms action below fold; this is a layout observation, not a measured conversion defect.
- **HOME-FIX-02:** Moved hero booking, contact/schedule and no-payment reassurance before the outcome panel and academy facts. Guarantee remains after the facts. No entitlement claims rewritten.
- **HOME-FIX-03:** Visible hero/reviews/sticky labels are `Reserve Free Intro`; continuation is `Choose Your Time`; research link is `View Schedule`. Existing analytics label attributes remain stable. Continuation precedes the unchanged photo and caption.
- **HOME-FIX-04:** Added a 44px Text Sandy link with the existing SMS destination and event convention. Found overlapping homepage/shared analytics listeners; an event marker prevents duplicate handling, and shared initialization is idempotent. Other legacy contact event names remain present.
- **HOME-FIX-05:** Native buttons retain aria-pressed, hidden-radio synchronization and focus. Outcome heading is H2. A separate polite status announces the selected audience without reading the outcome panel. Initialization remains silent.
- **HOME-FIX-06:** Reviews, attribution, ticker and photograph unchanged. Loaded image is the fingerprinted 1600×720 WebP with intrinsic dimensions retained; no LCP or resource-size improvement claimed.
- **HOME-FIX-07:** Sticky action remains hidden initially and near the footer. It also hides while the menu is open, continuation is visible, or it would cover a focused control. A homepage-only override suppresses the competing shared actionbar; `!important` is needed to override its existing important display rule. The inverse shared rule also suppressed the homepage bar merely because the shared bar existed; an ID-scoped visible-state override resolves that conflict. Safe-area padding and selector scroll margin retained/added.
- **HOME-FIX-08:** Canonical age ranges, adult term number and address now render from existing data. Remaining factual reconciliation is documented below as a separate content follow-up.

## Routing and event contracts

| Choice | Outgoing lane |
|---|---|
| Child | kids |
| Teen | teens |
| Adult | adults |
| Family | family |

Hero links target `#home-first-visit-builder`; continuation targets `/free-bjj-intro-tannersville-ny?lane=…#booking-flow`. Selecting never submits or books. Incoming child/kids, teen/teens, adult/adults, family and invalid fallback are checked. No-JavaScript calendar and SMS links remain.

Preserved events: `first_visit_cta_clicked`, `audience_selected`, `first_visit_started`, `schedule_clicked`, `text_sandy_clicked`. The shared tracker has a pre-existing alias from `first_visit_started` to `first_visit_cta_click`; homepage listener retains its existing raw event. No booking is created by these checks.

## Factual authority map and remaining content work

| Claim | Authority and disposition |
|---|---|
| Age ranges | `src/_data/programs.json`; imported into static and dynamic badges and facts |
| First term | `programs.adults.term`; rendered numeric value, current 12 weeks |
| Address | `src/_data/business.json` address.street; imported |
| 15-minute visit | `src/_data/free-intro.json` goalMappingDurationMinutes confirms current copy; import remains follow-up because this partial has no freeIntro alias |
| 3× classes/week | `src/_data/offers.json` says **up to** three appropriate classes with recurring reservations; the terse existing statistic is not equivalent to public schedule frequency. Retained pending separate wording reconciliation |
| Family 5/6 PM | `src/_data/schedule.json` groupClasses and `/schedule` are authority. Conditional family routine should not be derived from an arbitrary first schedule row; existing static and dynamic copy retained pending day-aware treatment |
| Guarantee | `src/_data/offers.json` contains eligibility/minimum-attendance conditions, not a dedicated display-name field. Current name retained; do not strip conditions from authority or infer broader coverage |

No new data schemas, dependencies, provider URLs or operational policies introduced. Factual reconciliation is not fully complete.

## Verification and limits

Build, homepage synthesis, SSI homepage, volatile facts, static links, link existence, CSS links, additive fingerprints and CSS design contract pass. Existing `qa-home-nav-layout.mjs` passes including menu/Escape, dropdowns, review rotation and desktop spacing. Strict fingerprint check fails on 22 stale managed siblings already present in generated output; the exact list is in [HOMEPAGE-CRO-STALE-ASSETS.md](HOMEPAGE-CRO-STALE-ASSETS.md). No stale assets deleted.

Browser script covers requested sizes plus 667×375 landscape, four lane destinations/events, query aliases, Enter/Space focus retention, initial/sticky states, SMS event count including reloading the analytics module, no-JavaScript calendar fallback, reduced-motion rendering and 200% root text enlargement. Text enlargement is an approximation of browser text-only zoom. Human screen-reader speech and real-device safe areas are not verified. External availability endpoint is blocked in local QA. Metadata/H1/structured-data source markup is preserved; only the scoped shell, analytics handling and generated homepage change.

## Conversion evaluation

`js/progressive-booking.js` handles Cal bookingSuccessfulV2 and emits booking completion events, but source inspection cannot prove reliable homepage-session attribution in analytics. Treat homepage-to-booking continuation as a proxy until reporting confirms the session-to-completion join. No traffic baseline, sample requirement or uplift has been established. After release, test reassurance placement alone with a predefined meaningful effect and sample size based on actual traffic; do not declare a winner from a short before/after comparison.

Rollback: revert this scoped source diff and rebuild. No production deployment performed and no commit created.
