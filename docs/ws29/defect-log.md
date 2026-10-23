# WS-29 Phase 0 defect log

Status: inventory ready for owner priority review. Phases 1–4 are not started. No website source, CSS, copy, operational data, anchors, metadata, or dependency changes. An isolated fresh build passed. No main-worktree build, website release commit, deployment, or production verification. Phase 0 evidence is committed separately.

## Evidence and limits

The canonical isolated fresh-build `dist/` pages were rendered with recursive local SSI expansion, directory indexes preferred over flat aliases, at 360/390/430/1280 × 900. All 56 primary navigations returned HTTP 200. External requests were blocked and recorded; this excludes provider embeds, analytics and third-party behavior. The final baseline is from the successful isolated build at HEAD `3c16e8c044efcb0875813f452d10703bc95242ae`; the mixed dirty main-worktree output was retained separately in `/tmp/ws29-current-generated-baseline` and is not the acceptance baseline. Production parity is unverified. See [load map](load-map.md), [provenance](provenance.json), and [screenshots](baseline/). Initial unexpanded-SSI samples and the legacy pricing redirect capture were invalidated; diagnostic copies are outside the deliverable in `/tmp`.

Primary `*-WIDTH.json` files record requestedWidth and measuredInnerWidth separately. On pricing and the narrow blog route, mobile layout viewport expansion can make `scrollWidth <= innerWidth` appear true despite exceeding the requested phone width. Acceptance must compare the requested viewport too and inspect clipping/visual scale. The supplemental widthSweep uses resized mobile contexts and is diagnostic only; it is not an exhaustive 361–767 fresh-navigation proof. Genuine desktop baselines use fresh desktop contexts.

Visible text-node parents below 14px are definite size-floor candidates; below-16px items require body/secondary classification before a fix. Counts are text runs, not unique defects. Small controls include inline links; only genuine primary/interactive controls should receive the primary-action floor. CSS visibility tests and initial-state sampling cannot prove every interaction state, occlusion, contrast, focus order, lazy-loaded image or nested submenu. No booking or SMS was submitted; focus was inspected in desktop Chrome mobile emulation, not iOS Safari.

## Proposed priorities for owner confirmation

| ID | Severity | Family / width | Finding and proposed treatment |
| --- | --- | --- | --- |
| P0-01 | High | Pricing, 360/390/430 | Document expands beyond requested phone width (840px at 360). Hero copy/actions are clipped in the 360px top capture. Fix the local layout/min-content cause; preserve every pricing anchor, plan order and payment-details behavior. |
| P0-02 | High | Blog sample, 360 | Main content exceeds requested width (379px). Nested inset panels leave a cramped reading column. Fix its local container; keep article content intact. |
| P0-03 | High | Free Intro, 360 | Five visible fields compute to 13.3333px. Text fields are 185px wide and the lane select is 119px; the form needs full-width inputs at >=16px. Emulated focus is not an iOS zoom proof. |
| P0-04 | High | Schedule, 360 | Calendar date controls measure 28px wide and arrows about 34px. Numerous date/event text runs fall below 14px. Preserve date functionality while providing a readable mobile day/class treatment. |
| P0-05 | High | Programs, 360 | The green hero eyebrow is visibly clipped at the right edge even though the document reports no horizontal overflow. An overflow guard is not sufficient acceptance. |
| P0-06 | Medium | Shared shell, 360/390/430 | Logo, review strip and separate menu/CTA row occupy about 223px before content on the 360px captures. Condense to the requested logo/action/menu pattern. Current top-level open-menu rows already meet 44px; preserve this. |
| P0-07 | Medium | Home, programs, detail pages, landings, FAQs | Text runs below the secondary floor appear across families; the dedicated pinch-zoom inventory lists each sampled element. Use one mobile foundation and local exceptions, without changing copy. |
| P0-08 | Medium | Funnel pages | Current sticky treatment varies; several pages show Text Sandy plus Home, and home/Free Intro lack the requested paired bottom actions in the sampled initial state. Implement the specified Text Sandy / Reserve Free Intro bar with safe-area and content clearance, hidden on desktop. |
| P0-09 | Medium | Glossary, 360 | Copy term link is a native 101×21px control. Breadcrumbs visually run together and nearby utility links are dense. Increase control targets and spacing. |
| P0-10 | Review | Winter landing, 360 | Hero/header leave the poster and price details below the first viewport. Text runs in later content fall below 14px. Review poster, table/price rows and sticky clearance through full-page capture before changes. |

No proposed desktop redesign. Freeze the 1280px primary captures; any desktop difference needs a defect entry and owner approval. These priorities do not reorder the brief’s mandated page-family implementation sequence.

## Per-family measured inventory

| Route | Document widths at requested 360 / 390 / 430 / 1280 | <14px text runs at 360 | Inputs | Menu open | Evidence |
| --- | --- | --- | --- | --- | --- |
| `/` | 360 / 390 / 430 / 1280 | 53 | 0 | true | [360 top](baseline/home-360-top.png), [full](baseline/home-360.png), [1280](baseline/home-1280.png), [detail](baseline/home-details.json) |
| `/schedule` | 360 / 390 / 430 / 1280 | 145 | 0 | true | [360 top](baseline/schedule-360-top.png), [full](baseline/schedule-360.png), [1280](baseline/schedule-1280.png), [detail](baseline/schedule-details.json) |
| `/options-pricing` | 840 / 841 / 840 / 1280 | 205 | 0 | true | [360 top](baseline/options-pricing-360-top.png), [full](baseline/options-pricing-360.png), [1280](baseline/options-pricing-1280.png), [detail](baseline/options-pricing-details.json) |
| `/free-bjj-intro-tannersville-ny` | 360 / 390 / 430 / 1280 | 0 | 5 | true | [360 top](baseline/free-bjj-intro-tannersville-ny-360-top.png), [full](baseline/free-bjj-intro-tannersville-ny-360.png), [1280](baseline/free-bjj-intro-tannersville-ny-1280.png), [detail](baseline/free-bjj-intro-tannersville-ny-details.json) |
| `/visit` | 360 / 390 / 430 / 1280 | 0 | 0 | true | [360 top](baseline/visit-360-top.png), [full](baseline/visit-360.png), [1280](baseline/visit-1280.png), [detail](baseline/visit-details.json) |
| `/programs` | 360 / 390 / 430 / 1280 | 12 | 0 | true | [360 top](baseline/programs-360-top.png), [full](baseline/programs-360.png), [1280](baseline/programs-1280.png), [detail](baseline/programs-details.json) |
| `/bjj-classes/kids-tannersville-ny` | 360 / 390 / 430 / 1280 | 24 | 0 | true | [360 top](baseline/bjj-classes--kids-tannersville-ny-360-top.png), [full](baseline/bjj-classes--kids-tannersville-ny-360.png), [1280](baseline/bjj-classes--kids-tannersville-ny-1280.png), [detail](baseline/bjj-classes--kids-tannersville-ny-details.json) |
| `/bjj-classes/adults-tannersville-ny` | 360 / 390 / 430 / 1280 | 27 | 0 | true | [360 top](baseline/bjj-classes--adults-tannersville-ny-360-top.png), [full](baseline/bjj-classes--adults-tannersville-ny-360.png), [1280](baseline/bjj-classes--adults-tannersville-ny-1280.png), [detail](baseline/bjj-classes--adults-tannersville-ny-details.json) |
| `/bjj-classes/teens-tannersville-ny` | 360 / 390 / 430 / 1280 | 27 | 0 | true | [360 top](baseline/bjj-classes--teens-tannersville-ny-360-top.png), [full](baseline/bjj-classes--teens-tannersville-ny-360.png), [1280](baseline/bjj-classes--teens-tannersville-ny-1280.png), [detail](baseline/bjj-classes--teens-tannersville-ny-details.json) |
| `/blog/after-school-jiu-jitsu` | 379 / 390 / 430 / 1280 | 2 | 0 | true | [360 top](baseline/blog--after-school-jiu-jitsu-360-top.png), [full](baseline/blog--after-school-jiu-jitsu-360.png), [1280](baseline/blog--after-school-jiu-jitsu-1280.png), [detail](baseline/blog--after-school-jiu-jitsu-details.json) |
| `/bjj-glossary/arm-drag` | 360 / 390 / 430 / 1280 | 1 | 0 | true | [360 top](baseline/bjj-glossary--arm-drag-360-top.png), [full](baseline/bjj-glossary--arm-drag-360.png), [1280](baseline/bjj-glossary--arm-drag-1280.png), [detail](baseline/bjj-glossary--arm-drag-details.json) |
| `/alley-bootcamp` | 360 / 390 / 430 / 1280 | 25 | 0 | true | [360 top](baseline/alley-bootcamp-360-top.png), [full](baseline/alley-bootcamp-360.png), [1280](baseline/alley-bootcamp-1280.png), [detail](baseline/alley-bootcamp-details.json) |
| `/winter-armor-2027` | 360 / 390 / 430 / 1280 | 10 | 0 | true | [360 top](baseline/winter-armor-2027-360-top.png), [full](baseline/winter-armor-2027-360.png), [1280](baseline/winter-armor-2027-1280.png), [detail](baseline/winter-armor-2027-details.json) |
| `/bjj-faqs` | 360 / 390 / 430 / 1280 | 19 | 0 | true | [360 top](baseline/bjj-faqs-360-top.png), [full](baseline/bjj-faqs-360.png), [1280](baseline/bjj-faqs-1280.png), [detail](baseline/bjj-faqs-details.json) |

## Family review notes

- Home: 360px hero and CTA fit; small proof/process text requires the foundation pass. Preserve its distinct mobile hero behavior.
- Schedule: month calendar remains seven-column on mobile; the measured narrow buttons and small text need a deliberate phone treatment. Do not remove date navigation or alter schedule data.
- Pricing: clipping affects both the shared navigation region and pricing content in the isolated fresh inline-delivery artifact. The fresh build reproduces this; use the source/cascade map to choose a fix.
- Free Intro: booking-choice cards fit. The visible request form is narrow with sub-16px fonts. Provider booking embeds were blocked; no successful booking is claimed.
- Visit: lead text and SMS action fit at 360. Current fixed bar does not provide the required booking pair. No visible form in this sampled page.
- Programs: hero badge is clipped; large nested framing reduces the useful content width. The lead CTA remains visible.
- Kids / Adults / Teens: primary actions stack and are >=44px in sampled state; eyebrow/proof text needs the size pass. Desktop structure remains a baseline.
- Blog: 360px content exceeds requested width. Concentric panels consume reading space. Embedded external media remains outside this local check.
- Glossary: main reading cards fit, but the utility breadcrumb/Copy term link cluster needs spacing and target improvements.
- Alley Bootcamp: hero image is contained and main CTA fits; later text has size-floor defects.
- Winter Armor: main heading and Text Sandy fit; poster/price detail readability and fixed-bar clearance remain explicit later-pass checks.
- FAQs: phone hero stacks and CTAs fit; smaller supporting text appears later. No copy edits are authorized.

## Verification and remaining gates

- Primary matrix: 56 JSON records and 56 full-page screenshots. All responses 200; failures and page errors remain in individual records.
- Supplement: 14 initial 360px top captures, 14 open-menu captures, per-family input/text/target measurements, and seven diagnostic resized widths.
- Repository browser-proof helper: corrected SSI-aware homepage at its built-in 390/1440 widths; auxiliary evidence, not a substitute for the specified 1280 baseline.
- No zoom-blocking viewport setting was added. Captured viewport strings are retained in JSON. The isolated build passed; no release gate sequence was run because no website changes or deployment are being made.
- Pending: owner priorities; Phases 1–3 changes; approved standalone Phase 4 script; all ordered deploy gates; scoped commits/deployment; live 360/390/430 and desktop comparison; owner phone checks on home/schedule/pricing. CI wiring is a separate owner decision.

Approval requested by the original brief: “Owner (via Sassafras) confirms priorities before Phase 1 starts.” Approve P0-01 through P0-10 as the working priorities, or identify changes. No Phase 1 CSS work has started.

Fresh-build runtime note: the sole local HTTP failure in each primary sample is `/api/first-visit-availability` (56 total), which the static audit preview does not implement. It is not evidence of a production API failure. The missing glossary script in the earlier mixed output is resolved in the fresh build. All primary samples have zero JavaScript page errors.
