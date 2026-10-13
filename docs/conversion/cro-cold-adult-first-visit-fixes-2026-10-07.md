# Adult first visit: fix plan

Date: 2026-10-07  
Status: Plan and draft copy. Site implementation has not begun.  
Based on: [Cold adult first-visit opportunity report](cro-cold-adult-first-visit-opportunities-2026-10-07.md)

## The first work

Help a new adult see a small, clear first step: meet Sandy for a free visit, then choose a free first class. Keep the class choice, coach approval, and later-day option clear.

Start with these fixes:

1. Correct the booking measures and adult time facts.
2. Make the visit and class steps clear.
3. Show the adult choice once, with a way to change it.
4. Trim repeat text around the calendar.
5. Give booked adults one short arrival plan.
6. Test adult routing and proof after the measures work.

This document covers all 12 audit opportunities. It also corrects findings that changed after source review. Priority reflects risk to visitor understanding and reliable measurement, not a forecast of sales lift.

The grade-three limit applies to proposed public copy, including help, errors, preparation, and conditional states. Internal file names and test instructions use the terms an implementer needs.

## Scope and facts to keep

Primary audience: an adult age 18 or above who is new to the academy. The main task is to book a Free First Visit and know how to reach the first class. Adults who return to training can use the same path. Age ranges in the marketing avatar are research hypotheses, not new eligibility limits.

Primary routes: `/`, `/bjj-classes/adults-tannersville-ny/`, `/free-bjj-intro-tannersville-ny`, `/schedule`, and `/show-up-kit`. Review receipt and arrival links reached from this path. Keep youth, teen, family, community-service, and help paths usable.

| Fact or contract | Current authority | Rule for implementation |
| --- | --- | --- |
| Visit and first-day rules | [free-intro.json](../../src/_data/free-intro.json) | Required 15-minute visit; optional same-day adult class; Sandy confirms before training; later day remains a choice; first class is free |
| Clothes and consent | Same file, `publicCopy` and `adultFirstDay` | Day clothes for the visit; clean sports clothes to train; waiver before training; student choice; matched partner and pace; pause/end rights |
| Main CTA | Same file, `primaryCtaLabel` | Use `Reserve Your Free First Visit`; keep the current route and tracking contracts |
| Adult age | [programs.json](../../src/_data/programs.json), `adults.ageRange` | 18+; do not narrow eligibility to the Ben avatar |
| Class times | [schedule.json](../../src/_data/schedule.json), active `groupClasses` | Monday through Friday adult classes at 6 PM; Saturday at 10:30 AM in this snapshot. Use `/schedule` for current times and exceptions |
| Price and plan | [pricing.json](../../src/_data/pricing.json), `coreCulture.frequencyLadder.adult`; [offers.json](../../src/_data/offers.json) | Current 12-week prices: $275 for one class/week, $550 for two, $715 for three. Render from data; preserve entitlements and terms |
| Contact and place | [contact.json](../../src/_data/contact.json) | Render phone, SMS, address, and city from canonical fields |
| Booking provider | [progressive-booking.js](../../js/progressive-booking.js) | Preserve `senseisandy/first-visit`, lane aliases, campaign allowlist, provider lifecycle, and deduplication |
| Actual attendance and sales | [academy-metrics.json](../../src/_data/academy-metrics.json), `intro-funnel` | Still `not-yet-measured`; use trusted operations records before claiming a rate |

The public schedule is a class schedule. The booking calendar is a visit calendar. Neither is proof of a confirmed same-day class or an open seat. Do not add a Saturday end time from memory: the current canonical slot provides the start time.

Older `.agents/product-marketing.md` text says the first class avoids live practice. Current `free-intro.json` permits elective adult live practice on day one. Follow current data. Do not import older review counts, attendance claims, injury claims, or demographic assumptions into this work.

## Source review: changes to the audit

These are local source findings. This plan does not claim a fresh live-site or provider-admin audit.

| Audit topic | Current evidence | Decision |
| --- | --- | --- |
| Missing Thursday | `programs.json:42` omits it; `schedule.json:109–117` includes it | Fix the derived adult summary and trace its consumers |
| Homepage table | `src/index.html:125` starts an `{% if false %}` block containing the cited table | Treat as dormant source, not a proven visible homepage fault. Keep the current schedule link; avoid another timetable |
| Adult order | Booking step 1 already puts Adult first, `index.html:40`; homepage puts it third, home partial `:721` | Target the homepage/entry experiment; do not redo booking step 1 |
| Adult routing | Adult CTA already has `?lane=adult`; home partial `:1007–1022` already handles preselection | Reuse current mapping to `adult-beginner` and test it |
| Chosen lane | Booking step 2 already has Change, radios, and `[data-current-choice]`, `:69–90` | Simplify those controls; avoid adding a second state system |
| Confirmation telemetry | `funnel-events.js:93` sends `booking_confirmed` when `#booking-confirmation-title` exists; that heading is in hidden step 3 | Add a P0 tracking correction and runtime regression check |
| Real provider success | `progressive-booking.js:167–178` requires UID, `ACCEPTED`, and no payment requirement, then deduplicates by UID | Keep this gate; update stale Calendly documentation |
| Details form | Script looks for `#pb-step-3 form`; current page has only an empty hidden form outside step 3 | Do not count `details_submit_attempt` as an active visitor stage |
| Calendar recovery | New-tab link and text help exist before failure; retry appears on failure | Preserve current access and test all states |
| Copy experiment | Home partial `:1026–1035` runs `hero_cta_copy_v1` | Prevent overlapping tests from obscuring results |
| Class timing copy | Audit draft says Sandy sets the time “after the visit” | Use “Sandy must confirm the class first”; do not invent a timing restriction |
| Price meaning | Adult partial `:36–53` pairs a one-class starting price with up-to-three/up-to-36 benefits | Clarify frequency before a new price-placement test |

Source paths for the abbreviated references: [booking page](../../src/free-bjj-intro-tannersville-ny/index.html), [homepage partial](../../src/partials/home-conversion-shell.html), [homepage source](../../src/index.html), [adult partial](../../src/partials/program-conversion-adults.html), [funnel events](../../src/assets/js/funnel-events.js).

## Adult page and booking flow

| Visitor state | Main question | Content and next action |
| --- | --- | --- |
| Adult landing | Can I start here? | Adult heading, calm coaching, 15-minute visit, free first class; reserve CTA; Text Sandy as help |
| Adult selected | What did I choose? | Adult 18+ state and one Change control |
| Choose time | Is this a visit or a class? | Visit-time heading, calendar, short class-confirmation rule, loading status, recovery links |
| Provider accepts booking | What happens next? | Visit booked, check booking note, short adult preparation list, waiver and directions |
| Staff confirms class | Can I train that day? | Actual class plan from Sandy; same-day or later choice; gear and consent rules |
| First class ends | What does it cost to keep training? | Source-owned plan price and frequency; link to full terms; choice to continue |

Use progressive disclosure for optional detail. Keep the first-day class conditions visible near the calendar and preparation step. A visitor should not need to open an FAQ to learn that Sandy must confirm training.

Before booking, use one short promise, the booking task, one process block, checked room proof, brief prep, and one FAQ. After booking, use one arrival plan. Repeating essential facts in a separate success state is useful; remove adjacent repetition within the same state.

Keep live-practice and Sandy Challenge detail below the main booking task. Any retained Challenge copy must preserve adult-only, elective, coach-led status, agreed rules, the pause signal, and belt release. Do not rewrite safety rules to satisfy a score.

## Fix list and audit coverage

P0 means correct meaning or measurement first. P1 means the core adult experience. P2 means a later experiment. Effort is relative: S = local text/data binding, M = shared state or several consumers, L = operational integration.

| Ticket | Priority / effort | Fix | Audit opportunity | Depends on |
| --- | --- | --- | --- | --- |
| AD-01 | P0 / M | One source for adult class times | 2 | Source baseline |
| AD-02 | P0 / M | Correct success-event meanings | 7 | Source baseline |
| AD-03 | P0 / M | Clear visit and class promise | 1, 6 | Fact contract |
| AD-04 | P1 / M | One selected-lane state and Change path | 5 | AD-02, AD-03 |
| AD-05 | P1 / M | Trim booking copy by state | 4 | AD-03, AD-04 |
| AD-06 | P1 / M | Short preparation and arrival plan | 7, 12 | AD-03 |
| AD-07 | P1 / S–M | Keep help and calendar recovery clear | 10, 11 | AD-02, AD-04 |
| AD-08 | P1 / M | Price matches class frequency | 9 | Price/offer comparison |
| AD-09 | P1 / L | Trusted adult funnel report | 7 | AD-02; operations source |
| AD-10 | P2 / M | Test adult entry order | 3 | AD-01–07; measured baseline |
| AD-11 | P2 / S–M | Test verified adult proof | 8 | Permission/source check; AD-02 |
| AD-12 | P2 / S | Test price placement and help copy | 9, 10 | AD-08, AD-09 |

### AD-01: Use current adult time data

Trace uses of `programs.adults.scheduleSummary` and hardcoded adult time chips. Derive full summaries from active adult `schedule.groupClasses`, ordered by day. Reuse an existing data helper where suitable; inspect it before adding one. If a view needs only navigation, link to `/schedule` with “See class times.” Keep closure and exception links.

Edit scope: `src/_data/programs.json`, adult partial, and the actual data/render consumers found in the trace. Inspect `src/index.html` but leave its disabled timetable disabled. Schedule data owns the truth; this ticket fixes consumers, not operating hours.

Pass: full adult summaries include all six active slots from current data; Thursday appears; inactive slots stay out. A temporary schedule fixture changes output without a second text edit. Booking help labels these as class times. Check mobile and desktop rendered consumers, including any structured data that uses the summary.

Checks: `rtk npm run qa:schedule`, `rtk npm run qa:volatile-facts`, build and rendered comparison. These checks do not establish that the academy ran a class on a given date.

### AD-02: Correct the measurement contract

Edit scope: `docs/analytics/CRO_METRICS.md`, `docs/analytics/funnel-tracking-plan.md`, `src/assets/js/funnel-events.js`, and focused regression coverage. Inspect `js/progressive-booking.js` and `js/analytics-events.js` for producer/bundle ownership. Keep legacy names while downstream consumers still need them.

1. Define `booking_completed` as the current accepted Cal callback, with the existing UID/status/payment gates.
2. Remove the inference that a confirmation heading proves any booking state. Scope or rename the receipt-view diagnostic so hidden markup and direct receipt visits cannot imply accepted booking or staff approval.
3. Keep `visit_confirmed` for trusted staff confirmation. Explain that the client-side stage helper is an integration hook, not an authenticated operational record by itself.
4. Map names and lanes before reporting. Record legacy aliases, but count one completion per booking/session under the chosen reporting definition.
5. Drop inactive form stages from the current calendar funnel. Keep active homepage lead-form measures as a separate branch.

Pass: initial load, hidden success content, linkReady, failure, missing UID, pending status, payment-required status, and direct receipt reload yield no conversion. Repeated accepted callbacks yield one completion in the intended lifecycle. Lane remount/retry leaves no stale listeners. Test deduplication across reloads separately; an in-memory UID set does not prove cross-session deduplication. Payloads exclude contact details, message text, medical detail, raw provider objects, and booking IDs.

Checks: extend the relevant gap in `scripts/qa-cal-migration.mjs` or focused funnel tests; run `rtk npm run qa:cal-migration` and `rtk npm run qa:unified`. A mocked provider event proves site handling, not provider settings or a real appointment.

### AD-03: Clarify the visit and class

Edit scope: canonical `free-intro.json` public-copy fields and their home, adult, booking, and preparation consumers. Reuse or add a narrow adult-specific field in that authority when needed; do not duplicate policy prose across templates. Trace shared consumers before changing general copy.

Use copy blocks C01–C04 below. Retain the source-owned CTA. Explain the 15-minute visit beside the adult action. Label the calendar as visit times. Keep optional same-day training, coach confirmation, later-day choice, and free first class explicit. Keep youth rules out of an adult-only state, and adult-specific promises out of a youth-only state.

Pass: a reader can state what the calendar books, how long the visit takes, whether the class is free, and who confirms the class. No line promises same-day availability or requires a later date. Rendered public sections and each state meet grade ≤3 and factual review.

Checks: readability by block and rendered state; `rtk npm run qa:volatile-facts`; lane/state review and first-visit checks in unified QA. Do not A/B test a known factual correction.

### AD-04: Simplify the lane state

Edit scope: booking step 2 markup, existing `choose()`/`show()` behavior in `js/progressive-booking.js`, and page CSS only if required.

Keep `[data-current-choice]` as the selected-state announcement. Use the existing Change control to return to step 1. Remove the second full radio choice from the default step-2 presentation only after confirming that all choices, including community service and help, remain reachable through that path. Preserve existing focus return and `aria-pressed` state. Do not add another disclosure plus another back link.

Pass: direct `lane=adult`, supported adult aliases, manual selection, back/change, and browser navigation preserve the intended profile. `audience_lane` and approved campaign fields survive calendar and external-link paths. Keyboard focus lands on the new step heading, returns to the prior trigger where appropriate, and remains visible. Invalid lane recovers to a real choice. Changing to child/teen/family/help/leo updates copy and calendar; no stale adult state remains.

Checks: controlled browser test at narrow and desktop widths; accessibility tree/state inspection; Cal migration tests. All new controls use button semantics and a visible focus style.

### AD-05: Trim copy around the booking task

Edit scope: booking template, adult partial, and relevant canonical copy. Preserve required IDs, evidence mount, semantic headings, FAQ links, and SEO data contracts.

Inventory content by visible state before deletion. Keep the short orientation next to booking, one below-task process block, one prep block, and one FAQ. Reduce duplicated overview paragraphs, repeated price prompts, and the separate adult-options restatement. Keep the selected lane and time meaning near the calendar. Move optional terms/details behind plain links or native disclosures where suitable.

On the adult page, review the whole visible copy: hero, benefit chips, term section, practice cards, guarantee summary, walkthrough, community-service section, parent section, and final CTA. The grade target is not satisfied by rewriting only the hero. Replace unsupported “every round stays safe” with the supported partner/pace fact. Preserve guarantee eligibility and link to full terms.

Pass: the initial adult view has one dominant task, one H1, visible help, and no accidental hidden-state content. Success content stays hidden before accepted booking. Essential prep and consent survive the trim. Required IDs and evidence mounts still work. At 390×844 the first adult action is visible with the real header; also inspect 320px width and 200% zoom. Do not shrink type to force an above-fold result.

### AD-06: Give booked adults one arrival plan

Edit scope: booking success state and `src/show-up-kit.html`; inspect linked receipt/directions consumers before changing their content. Use canonical contact, clothing, and first-day data. The present Show-Up Kit has a Parent Resources breadcrumb; give adult arrivals a relevant general path while preserving parent access.

Use C06 after an accepted booking. Add the source-owned address, second-floor note, a directions link, waiver, and Text Sandy. Explain the booking note and class plan as distinct. Keep the full Show-Up Kit available for detail; put preparation ahead of a glossary lesson. Adults follow the confirmed plan; avoid deriving adult arrival time from the youth 20-minute rule.

A staff/provider message draft can reuse the same facts after its sender, trigger, and template owner are identified. Drafting a page does not send a reminder. Do not claim reminder delivery or change provider automation as part of a copy edit.

Pass: adult confirmation leads to correct day clothes, sports clothes if training, water, waiver-before-training, exact place, and a way to ask for a new time. Youth preparation remains correct. A direct Show-Up Kit visit gives useful help without claiming the visitor has booked. Inspect the room/entry image before using it as arrival proof; preserve dimensions and accurate alt text. Parking copy offers guidance, not a guaranteed space or an unverified step-free entrance.

### AD-07: Preserve help and recovery

Edit scope: existing status strings and links in `progressive-booking.js`, booking template, home/adult CTA support. Reuse `contact.smsHref`; preserve context when an existing message is useful.

Keep one main booking action with a quieter Text Sandy link. Keep external calendar access available from step 2 and retry on failure. Use C07 for state copy. Avoid “full” or “sold out” when a load fails. Do not remove the no-JavaScript link.

Pass: slow load, script error, linkFailed, timeout, retry, lane change during load, and navigation away all have valid states. A recovered calendar clears stale error text. Retry does not duplicate completion listeners. No-JavaScript visitors can reach provider dates or SMS. New-tab link announces its behavior. Text click records intent only, not a sent message or booking. Do not send an SMS during tests.

### AD-08: Make the price match the plan

Edit scope: adult partial price/benefit presentation and canonical imports. Review `pricing.json`, `offers.json`, and `/options-pricing` before editing. Do not change prices, Saturday inclusion, uniform entitlement, guarantee eligibility, reserved times, or missed-class rules.

Replace the ambiguous “from” price beside three-class benefits with C08. Show the frequency that earns each price. Place the short block after the visit explanation, with a link to full options. If three-class examples remain, label them as that selected plan; do not let $275 imply 36 classes. Keep the uniform attached to eligible first enrollment rather than the free visit.

Pass: a reader can match each displayed 12-week price to one, two, or three planned weekly classes. The selected plan governs benefits. The first class remains free and is not portrayed as a paid-plan obligation. Guarantee summaries remain qualified and linked; any unclear policy goes back to its authority before public copy changes.

### AD-09: Connect bookings to attendance

Deliverable: a private report specification plus an actual report only when trusted input exists. Browser events alone cannot complete this ticket. No production ledger extraction or external system write is authorized by this planning document.

Specify source owner, stable private join key, appointment date/timezone, cancellation/reschedule handling, staff confirmation, visit attendance, first-class attendance, and paid start. Keep the identity join in the trusted private system. Public analytics receive only approved categorical fields and a boolean reference-present flag.

Use the measurement table below. Leave unknown data unknown. Keep future appointments open. Resolve duplicate appointments and reschedules before counting people. Staff must define how a later first class maps to the original visit and the observation window.

Pass: a de-identified reconciliation sample traces records through booking, confirmation, arrival, class, and purchase; totals match each source under documented rules. A missing join reports missing coverage, not a failed visitor. Name the report owner and refresh cadence before operating it. If the operational source is unavailable, deliver the schema and mark the report pending; continue independent copy work.

### AD-10: Test adult entry order

Adult program links already carry a lane. Keep that low-friction path. For homepage adult traffic, compare the current card order with Adult first, using the same design, copy, and destination during the order test. Explicit adult campaign/route signals may define eligibility. Do not infer adult intent from age, health, or an unknown homepage visit.

Edit scope after baseline: existing homepage experiment and audience-selection code. Keep a neutral choice for unknown traffic. Define one stable experiment ID, exposure event, and assignment. Account for `hero_cta_copy_v1` by holding it constant or excluding overlap; keep a record of the choice.

Pass: all four home lanes remain clear, mobile visual order matches keyboard order, returning visitors retain consistent assignment, and campaign/alias behavior remains intact. Adult bookings and downstream attendance guide the decision; child/teen/family access are guardrails.

### AD-11: Test adult proof near the action

Use one permission-checked adult quote or verified room image. Existing Richard Scarponi and Kelly Chan quotes are candidates, not new permission evidence. Check exact wording against its origin, attribution, consent, and image rights. Do not rewrite a quote to force grade three or convert a personal result into a promise. Use a faithful short excerpt if permitted; otherwise use room proof.

Edit scope: the relevant proof block and its source record. Keep booking above optional proof on narrow screens. Use C09 for surrounding copy and accurate alt text after image inspection. Avoid new star/review counts. Existing quotes and star graphics are not a license for a new aggregate rating claim.

Pass: proof source and permission are recorded; quote wording is faithful; nearby public copy passes readability; images have dimensions; CTA stays visible; proof has no unsupported outcome claim. Compare proof placement after the entry test, not at the same time.

### AD-12: Test price placement and help copy

After AD-08, compare the same factual short price block in two positions below the visit promise. In a separate test, compare C10 help variants with the same SMS destination and CTA hierarchy. Do not change price, offer, help prominence, and placement together.

Pass: predefine eligibility, one outcome, guardrails, sample/window, and assignment before exposure. If volume cannot support a useful comparison, use observed task sessions and report qualitative findings. Do not declare a statistical win from a handful of clicks.

## Public copy bank

The `text` blocks below are complete draft units for readability checks. Select the block needed for each state; do not paste them all into the same viewport. Keep dynamic facts source-owned. Amounts and place names here are the verified snapshot used for review, not new hardcoded template constants.

### C01: Adult heading and first action

```text
Adult BJJ in Tannersville
Start with a free visit.
Meet Sandy for 15 minutes. See the room. Talk about your goals. Your first class is free.
Reserve Your Free First Visit
Text Sandy
```

### C02: Adult class choice

```text
You can choose to train that day. Sandy must confirm the class first. You can choose a later day.
```

On shared pages, identify the adult scope through the section heading or use “Adults can choose to train that day.” Do not apply this text to youth class rules.

### C03: Selected adult and calendar

```text
Adult 18+ selected
Change who is starting
Pick your Free First Visit time.
This time is for your visit. Meet Sandy for 15 minutes.
See class times
```

### C04: The visit process

```text
Meet Sandy. See the room and learn the rules.
Talk about your goals and class plan.
Your first class is free. Sandy guides you at your pace.
```

### C05: Class choice and consent

```text
You choose if you try live practice. You can try it on day one. Sandy matches the partner and pace. You can pause or end a round at any time.
```

Keep this in an adult context. It preserves choice and coaching; it does not promise freedom from risk. Keep the approved waiver and detailed safety rules intact.

### C06: Accepted booking and adult preparation

```text
Your Free First Visit is booked.
Check the date and time in your booking note.
Wear your day clothes for the visit. To train, wear clean sports clothes. Bring water.
Follow the class plan Sandy sends you. Sandy must confirm the class before you train.
Fill out the waiver before you train.
6045 Main Street, 2nd Floor, Tannersville
See how to get here
Need a new time? Text Sandy.
```

Render address from contact data. The success heading belongs only after accepted booking. For a generic Show-Up Kit opening, use “Plan your first visit” instead of claiming a booking.

### C07: Calendar states

```text
Visit times are on the way.
Times may take a moment to load.
Try the dates again or open a new tab. Text Sandy for help.
Retry calendar
Open in new tab
Text Sandy
```

The first two lines are alternatives for loading, not adjacent copy. Use the recovery sentence only in the recovery state. A pending request must use a separate accurate status such as the current request-received message; it must not use C06.

### C08: Adult paid plan

```text
Your first class is free.
If you choose to keep training, pick a plan.
One class each week: $275 for 12 weeks.
Two classes each week: $550 for 12 weeks.
Three classes each week: $715 for 12 weeks.
See plans and terms
```

Bind the rows to `frequencyLadder.adult` and `termWeeks`. This block simplifies price comparison; the linked terms still own attendance, guarantees, uniform, and other benefits.

### C09: Room proof fallback

```text
See the room before you come.
Meet Sandy and talk about your goals.
```

### C10: Copy alternatives for later tests

```text
Start with a free visit.
Meet Sandy. Plan your first class.
Text Sandy with a question.
Have a question? Text Sandy.
```

The two heading variants emphasize the free start or the human/class plan. The two help variants test phrasing. Choose one heading and one help line per surface. Keep the canonical CTA constant.

## Reading and copy review gates

1. Use grade ≤3.0 for each draft block, each visible state, and the whole rendered affected page. The skill's grade-five/seven defaults do not override this request.
2. Aim for five to eight words per sentence; use familiar words. Keep adult grammar and tone. A short headline is not enough evidence for a whole page.
3. Use `tools/readability-check.mjs` with `--json --max-grade 3` on extracted public-copy fixtures. The tool strips HTML/templates and estimates syllables; it is supporting evidence, not proof of comprehension. It does not identify visibility in the browser. Extract the actual state first.
4. Keep proper names, BJJ, Free First Visit, and required policy terms in measured text. Do not remove hard words or negative terms from counts to manufacture a pass. Prices and numbers need a read-aloud check because numeric tokens are not scored as spoken words.
5. Scan for banned negative framing, adverbs, em dashes, unsupported outcomes, and jargon. Use “pause” for consent. Keep faithful quotes and legal documents intact; choose another proof item or link to full terms when needed.
6. Test comprehension with an adult new to the site: ask what they booked, how long it lasts, what to wear, who sets the class plan, and what is free. Record confusion; do not coach the answers.

Four-rubric review for this draft:

| Rubric | Application | Release evidence |
| --- | --- | --- |
| Stop Slop | Plain verbs, concrete steps, positive framing; grade-three requirement wins over advice to use longer rhythm | Human review plus numeric draft check; release target ≥40/50 |
| Analyzer-Improver | Compare source truth, CTA meaning, state order, and friction; keep local place natural | Canonical comparison, volatile-facts QA, task walkthrough |
| Anything-Enhancer | Use real room and human coaching detail; preserve realistic pace and consent | Image/source inspection and first-day fact check |
| Empirical Reach Matrix | Social timing, hashtags, and Reel length do not apply to this website plan | Not applicable; no social post or claimed reach result |

The available Analyzer-Improver and OptiMax top-level exports are app introductions with linked prompts. This plan uses the repository's stated review criteria and does not claim full adoption of missing linked prompts or full publication clearance. Public release still needs the complete applicable rubric review. No social trigger or hashtag belongs on the booking page solely to satisfy a social rubric.

## Measurement specification

Use two connected views: browser sessions for site behavior, private appointments/people for attendance. Never divide one unit by another. A direct adult booking-page visit may lack a qualified commercial entry event; segment it as direct booking entry rather than discarding it or inventing the missing step.

| Stage | Evidence | Counting rule |
| --- | --- | --- |
| Adult eligible entry | Qualified source path plus explicit adult route/lane/campaign signal | Distinct observed sessions; report unknown intent separately |
| CTA click | `first_visit_cta_click` or reconciled legacy producer | Deduplicated session/action under a documented rule |
| Adult resolved | `lane_resolved`; `lane_selected` describes manual change | Include preselected adults; never require a manual click to qualify |
| Calendar ready | `availability_viewed` on `linkReady` | Provider-ready diagnostic, not proof that a slot is available |
| Booking accepted | `booking_completed` gated on current Cal success | One canonical event; do not sum legacy aliases |
| Visit confirmed | Trusted staff/operations record | Distinct appointment in the private ledger |
| Visit showed | Attendance record | Mature appointments with known outcome |
| First class attended | Trusted class attendance joined to visit | Distinct people within a stated follow-up window |
| Paid adult plan started | Verified enrollment/payment record | Defined adult cohort and actual plan start |

Session rates: CTA sessions / eligible entry sessions; ready sessions / resolved adult sessions; accepted-booking sessions / ready sessions. Report stage counts too, with missing-event coverage. Class schedule clicks and text clicks are diagnostics.

Operational rates: attended visits / confirmed visits due in the cohort; first-class attendees / visit attendees with the same follow-up window; paid starts / first-class attendees in that cohort. Publish counts, dates, join coverage, cancellations, reschedules, and still-open outcomes beside rates. Future appointments and missing records are not no-shows. A paid start does not prove retention or a personal training result.

Experiments need a stable assignment, exposure definition, baseline, minimum useful effect, sample-size calculation, and planned duration before launch. Current traffic and rates are unknown, so this plan sets no invented sample size or lift promise. Run one main experiment at a time. Correct facts and broken state handling before testing persuasion.

## Implementation order and checks

### Wave 0: Capture the baseline

Record current git status and source revision, rendered adult states, current experiment assignment, and canonical facts. Confirm source/generated ownership before edits. Keep unrelated dirty files. Inspect actual responsive behavior before diagnosing CSS. Save enough before/after evidence to show which state changed.

### Wave 1: Truth and event fixes

Implement AD-01, AD-02, AD-03, and the misleading price/frequency correction in AD-08. Run focused checks. If a business rule is ambiguous, keep that item pending; do not invent a new policy. Event-doc reconciliation and clear copy can proceed while operations data is unavailable.

### Wave 2: Adult task and arrival

Implement AD-04–07. Use existing components, state, and page CSS. Review all adult-page copy and conditional booking text against grade three. Keep prices and advanced proof below the visit task. Complete browser, links, and accessibility checks.

### Wave 3: Report and experiments

Complete AD-09 when trusted input exists. Then run AD-10, AD-11, and AD-12 as separate trials. An implemented page is not a measured conversion gain. A message draft is not a delivered reminder.

### Required later verification

| Area | Pass evidence |
| --- | --- |
| Source and build | Changed-file review; `rtk npm run qa:volatile-facts`; `rtk npm run qa:schedule`; `rtk npm run qa:cal-migration`; `rtk npm test` (includes build, unified QA, Cal QA, ad tests) |
| Reading | Grade ≤3 per public section and state; whole affected rendered-page check; banned-term scan; adult read-aloud and comprehension review |
| Mobile | 320, 375, 390, 414, and 768px; 390×844 first action; no horizontal scroll; readable type; sticky CTA avoids keyboard, footer, and focused controls |
| Desktop | 1280 and 1440px; clear reading order; one dominant action; calendar usable |
| Access | Keyboard-only selection/change/retry; focus return; live status; contrast; labels; at least 44px tap targets; 200% zoom |
| Booking | All lanes and aliases; accepted/pending/payment/missing UID; retry, timeout, remount, back, stale callbacks, direct receipt; consent/privacy checks |
| Links and SEO | Correct CTA/SMS/waiver/directions/options/schedule targets; one H1; title, description, canonical, robots, structured data and alt text match the rendered route |
| Speed | No new eager media/embed work; existing dimensions and deferred loading preserved; distinguish a byte change from measured speed improvement |
| Operations | Accepted booking, staff confirmation, arrival, first class, and purchase reconciled as separate facts |

Use current package scripts; avoid inventing absent `qa:first-visit` or `qa:seo` npm aliases. Inspect unified test coverage and invoke an actual standalone check if needed. Do not run a second full build solely to repeat `npm test`'s build. Builds can change generated files: identify those changes before release and keep the task's diff scoped.

Provider/browser verification should use controlled mocks for state errors and an authorized test path for real appointment behavior. Avoid real student messages or appointments during passive QA. Live network checks need the workspace's elevated network approval. This plan authorizes neither a deployment nor an external message.

Rollback during later implementation: keep source changes grouped by ticket, retain a pre-change snapshot, and regenerate assets from reverted sources. Revert a tested experiment through its existing assignment mechanism. Do not restore old false confirmation telemetry to improve a dashboard count. Review shared copy consumers when rolling back data fields. Deployment and its exact payload/rollback plan require a separate release step.

## Persona & Expert Framework

Coordinator: ordinary CRO planning lead. Contextual routing returned an ambiguous SEO shortlist; bounded goal routing returned `no_suitable_persona`. Dennis Stratton's top-level record requires a separate package, so this plan does not claim Dennis adoption. The coordinator applies `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, full text inspected from `assets/indranet-prompt-exporter/exports/index.json`. Selector readiness: ready; export metadata: partial/missing notes; attachments: none. Methods used: source checks, explicit risk, clear documentation, and independent acceptance review.

Copy lens: `Senior Copywriter - Alex Turner`, UUID `a9519f7d-8247-4bee-9075-72420110c5bf`, full versioned source at `assets/indranet-prompt-exporter/exports/Senior-Copywriter---Alex-Turner/versions/v1.0.0/prompt.json`. Host reviewed fit: usable for audience, voice, clarity, and revision; source complete; attachments empty. This is the versioned persona's identity, not the current app introduction's UUID. Its methods informed the draft; persona style decorations do not override the user's plain-language request.

Copy instruction: `INSTRUCTIONS - CONTENT`, UUID `6e94db8f-e23d-4387-8cc6-bac209e890aa`, full text inspected from the same export index. Selector readiness: ready; export metadata: partial/missing notes; attachments: none. Applied audience fit, next-step ordering, mobile task clarity, fact checks, and coherence.

Skills applied in order: CRO for hierarchy and friction; copy-readability-audit for plain public copy; Stop Slop for prose review. Grade ≤3 overrides looser skill thresholds. The local `persona_read.py` was absent; exact JSON/source reads supplied the text instead. No private prompt body is reproduced here.

Bounded workstreams used for this plan:

| Workstream | Owner and method | Read scope | Write scope | Done proof |
| --- | --- | --- | --- | --- |
| AD-DOD-01 integration | Coordinator; COMPETENCE and reviewed copy lens | Audit, canonical data, templates, worker findings | This Markdown only | All 12 opportunities mapped, ordered tickets, dependency and acceptance review |
| AD-DOD-02 source review | Ordinary funnel-contract analyst fallback; COMPETENCE | Referenced `src`, `js`, analytics docs | None | Source findings checked again by coordinator; hidden-table and false-confirmation corrections |
| AD-DOD-03 copy review | Ordinary adult-journey copy specialist fallback; CONTENT | Audit and first-visit data; readability skills | None | Meaning/consent review; coordinator numeric draft check |

Workers used read-only local tools and graph discovery, returned evidence, and did not edit files or spawn children. The coordinator alone integrates the artifact. Bounded planner contracts were generated with distinct DoD owners; the host ran the two independent reviews together and integrated after review. The planner is not execution or acceptance evidence.

## Plan completion and implementation handoff

Plan acceptance requires: full audit coverage; current source corrections; adult-first draft copy; grade-three draft checks; ordered fixes with scoped edit targets, dependencies, and pass criteria; factual/measurement/permission unknowns named; only the new Markdown changed by this task.

Implementation remains open for AD-01–12. Proof permission, trusted operational reporting, actual provider settings, full rendered-page readability, browser layout, and live conversion outcomes remain future checks. They do not block this planning artifact, and this artifact does not claim them complete.

Documentation verification completed on 2026-10-08:

- All 12 audit opportunities map to the 12 detailed tickets above. Each ticket has a scoped action and acceptance evidence; the implementation waves show dependencies.
- All 14 local Markdown links resolve to existing files.
- All 10 fenced public-copy units pass the repository readability checker at `--max-grade 3`, with no banned terms detected. The checker was run in memory on each exact block using the unchanged `tools/readability-check.mjs` logic. Estimated grades: C01 1.98; C02 0.54; C03 1.95; C04 -0.37; C05 0.32; C06 1.29; C07 2.33; C08 -1.12; C09 1.47; C10 0.95. Negative scores are formula results, not a literal grade claim. Short labels, numbers, and proper names still need human reading review in the final layout.
- Source and copy reviews preserve the required visit, optional same-day class, coach confirmation, later-day choice, free first class, clothing distinction, waiver, and consent. Unsupported timing language from the audit was corrected.
- Worktree review shows this new fix-plan Markdown as the only task-created repository file. The pre-existing audit, Android walkthrough, and scratch JSON remain untouched. No tracked site files changed.
- Site build, browser QA, real bookings, live network checks, and deployment were not run for this documentation-only deliverable. Their later acceptance requirements are listed above; this plan makes no runtime or conversion-improvement claim.
