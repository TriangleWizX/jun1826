# CRO opportunities: Free Intro → Calendly

## Scope and decision

Target: `https://senseisandy.com/free-bjj-intro-tannersville-ny`

Primary conversion: a qualified visitor schedules the next appropriate Free Intro / first-visit appointment in Calendly. The page currently presents a first visit as a 15-minute Goal Mapping conversation, then asks the visitor to choose the small-group class afterward. This audit optimizes that existing promise and Calendly handoff; it does not authorize a pricing, schedule, eligibility, or offer change.

Audience: first-time adults, parents booking for a child or teen, returning adults, families, and the community-service lane. Traffic source is not supplied, so message-match recommendations are hypotheses until channel data is available.

Design read: this is a functional conversion page for beginners and parents, using the incumbent Catskills Studio editorial/workbench language. The right design direction is calm, explicit, local, and reassuring—not a louder or more decorative redesign.

## Evidence snapshot

Evidence is intentionally separated:

| Layer | Evidence | Implication |
|---|---|---|
| Local source | `free-bjj-intro-tannersville-ny/index.html:741-882` contains five or more profile choices, then a hidden Calendly step. | The visitor must make a classification decision before seeing availability. |
| Local source | `js/progressive-booking.51ee16.js:57-73,95-199` initializes Calendly only after profile selection; mobile opens a popup and desktop uses an inline widget. | Mobile and desktop have materially different booking experiences. |
| Local source | `js/progressive-booking.51ee16.js:104-119,124-138` adds `utm_source=onsite-booking`, `utm_campaign=<profile>`, forwards page parameters, and emits profile selection. | Attribution has a foundation, but event coverage and naming need a contract audit. |
| Live HTTP | Fetched 2026-09-10: HTTP body contains `#booking-flow`, the Calendly URL, Calendly widget CSS/script, and page metadata. | The production page is a real server-rendered booking surface, not merely a local artifact. |
| Live HTTP | Live body has evolved beyond the checked-out source: it shows six lanes, relevant class choices, preferred-day controls, and a Formspree details form after scheduling (`/tmp/free-intro-live.html:739-900`). | Source/dist/live drift is itself a release-risk and must be resolved before implementation claims. |
| Rendered browser | Rendered inspection was attempted, but Chrome paused on its “Allow remote debugging?” permission prompt before DOM interaction could be completed. | No browser claim is made here about actual iframe rendering, popup behavior, viewport fit, or postMessage success. Repeat this audit after permission is granted. |

## Funnel model, step by step

1. **Arrival and promise comprehension.** The visitor must understand what is free, what happens first, how long it takes, and what they are booking.
2. **Trust and fit.** The page must answer “is this safe and appropriate for me/my child?” before asking for a lane choice.
3. **Lane resolution.** The current page asks the visitor to choose among multiple audience paths. This can improve routing, but it can also create an avoidable “which button is me?” pause.
4. **Availability reveal.** Calendly is hidden until lane resolution. The visitor cannot use actual availability to decide whether the offer fits their week until after the extra choice.
5. **Scheduling.** Calendly owns date/time and contact capture. The wrapper must make the handoff feel continuous, preserve context, and avoid competing controls.
6. **Confirmation and next action.** After `calendly.event_scheduled`, the page must clearly confirm the appointment, explain the next step, and offer only useful preparation actions.
7. **Measurement.** Every meaningful transition must be attributable by lane, source, device, and outcome without counting intent as a booking.

## Highest-priority opportunities

### CRO-01 — Make the appointment object unambiguous before Calendly

**Finding:** “Reserve Your Free First Visit” and “Goal Mapping” are not identical mental objects. The live description says “Meet Sandy for 15 minutes,” while the page later describes choosing the free class after that visit.

**Why it matters:** A visitor who expects to book a mat class may hesitate when Calendly shows a Goal Mapping event. A parent may wonder whether the child attends the booked appointment or only the later class.

**Opportunity:** Use one plain-language appointment label consistently at the hero, step heading, Calendly intro, and confirmation: “Free 15-minute First-Visit Planning Call / Studio Visit” only if that is factually the actual Calendly event. If it is in-person, say so. Preserve the distinction between the planning visit and the later coached class.

**Acceptance criteria:** A first-time visitor can answer, before selecting a time: what is being booked, who attends, duration, location/format, and what happens next. No copy implies that Calendly itself reserves the later class unless that is true.

### CRO-02 — Reduce the pre-Calendly decision burden

**Finding:** The live page exposes six paths, including Community-service adult, Family, and Not sure. The checked-out source shows five paths. This mismatch means the decision surface is not stable.

**Why it matters:** Six equally styled choices turn a high-intent action into a classification task. Parents and families may not know whether to choose “Family,” “Child,” or “Not sure.” Community-service eligibility is important but should not visually compete with the dominant first-time beginner paths.

**Opportunity:** Keep the primary choice set to the minimum required to route Calendly. Test a progressive structure: “I’m booking for an adult,” “I’m booking for a child/teen,” and “I’m booking for more than one person / need help.” Keep service recognition as a secondary question or route it after the core booking intent is established.

**Acceptance criteria:** The page has one visually dominant next action; no more than three top-level choices are required for a normal visitor; every path has an explicit back path; keyboard and screen-reader users receive the same state change.

### CRO-03 — Show a useful availability preview or explain why it is gated

**Finding:** Calendly is hidden until a profile is selected (`progressive-booking.51ee16.js:69-72`).

**Why it matters:** Visitors often decide to book based on whether a workable time exists. Asking for a lane before showing any availability adds uncertainty and can cause abandonment before the actual scheduler.

**Opportunity:** Test either (A) a single Calendly event with a short lane question inside the flow, or (B) a compact, truthful “choose your starting lane so we show the right calendar” explanation immediately above the choices. If Calendly cannot show useful availability before routing, say why in one sentence.

**Acceptance criteria:** The reason for the gate is visible; the visitor does not interpret the first click as a commitment; selecting a lane moves focus to the next step and preserves the selected context.

### CRO-04 — Treat mobile as the primary Calendly handoff, not a fallback

**Finding:** Mobile replaces the inline scheduler with a popup, then auto-triggers it after 200ms (`progressive-booking.51ee16.js:140-177`). Desktop uses an inline iframe (`:178-199`).

**Why it matters:** Auto-opening a popup can feel abrupt, be blocked, move the user away from the explanatory page, and make back/close behavior unclear. The user may see a popup before understanding the appointment. Mobile also has less room for duplicate explanatory copy.

**Opportunity:** On mobile, show a stable, user-initiated “See available times” button with a concise expectation line; do not auto-trigger. On close or failure, return the visitor to the same lane and preserve context. Make the popup’s close/focus behavior and fallback link explicit.

**Acceptance criteria:** No automatic popup; one tap opens Calendly; close returns to the page without losing lane; fallback works when Calendly fails; 320/375/414px widths have no horizontal scroll or clipped scheduler controls; focus returns to the initiating button.

### CRO-05 — Align lane selection with actual Calendly event types

**Finding:** The page’s source `data-calendly-url` is the Goal Mapping session, while the broader site configuration contains separate youth/adult Calendly URLs. The live page currently adds class-choice and preferred-day controls, but the evidence does not prove that each lane reaches the intended event type.

**Why it matters:** A mismatched calendar creates operational friction, incorrect expectations, and poor lead quality. It can also make analytics report a “booking” that staff cannot fulfill as intended.

**Opportunity:** Create a checked, documented mapping table: lane → Calendly event URL → appointment label → eligibility/copy → confirmation path. Test every lane, including `lane=kids`, `lane=teens`, `lane=adults`, family, service, and not-sure.

**Acceptance criteria:** Each supported lane opens the intended event type; query parameters do not overwrite canonical routing parameters; unavailable/invalid lanes fail safely to Not sure; no lane promises a schedule or entitlement that the canonical schedule/offer source does not support.

### CRO-06 — Make the post-booking state operationally complete

**Finding:** Local source describes a Goal Mapping booking and offers a waiver link (`index.html:231-264`); live production instead contains a details form after the Calendly event (`/tmp/free-intro-live.html:888-900`).

**Why it matters:** A scheduled time is not the same as a complete lead record. If the next form is unexpected, long, or required without explanation, the page can turn a successful booking into a second abandonment point.

**Opportunity:** Confirm the exact post-booking contract. If details are required, state before scheduling that one short follow-up is needed and explain why. If optional, label it optional. Show date/time, lane, location/format, what to wear, rescheduling channel, and one next action. Do not ask the visitor to repeat data Calendly already collected.

**Acceptance criteria:** `calendly.event_scheduled` produces an immediate, visible confirmation; the confirmation contains the booked event details or a reliable Calendly confirmation reference; staff receives the required lane/source fields; duplicate submissions are prevented; errors are inline and recoverable.

### CRO-07 — Build a trustworthy measurement contract

**Finding:** Local JS emits `profile_selected`, but the live body and source differ materially. Existing event names include intent, availability, appointment selection, submitted, and confirmed variants in different script generations.

**Why it matters:** Without a single funnel contract, optimization may “improve” clicks while bookings, qualified arrivals, or show-ups fall. Double-counting is especially likely when Calendly postMessage events and form submission both fire.

**Opportunity:** Define one event taxonomy and parameters: `intro_viewed`, `lane_selected`, `availability_viewed`, `calendar_opened`, `time_selected`, `calendly_scheduled`, `details_submitted`, `intro_confirmed`. Include `lane`, `source_path`, `utm_*`, `device_class`, `calendar_event_type`, and a dedupe/session id. Treat `calendly_scheduled` as the booking conversion; treat earlier events as funnel steps.

**Acceptance criteria:** One test booking in a controlled environment produces exactly one scheduled conversion; lane and campaign survive the Calendly handoff; no PII is sent to analytics; a booking can be joined to staff-side records without exposing private data.

### CRO-08 — Resolve source/dist/live drift before changing CRO behavior

**Finding:** Local source and the live body disagree on lane labels, class-choice controls, confirmation behavior, and the presence of a details form.

**Why it matters:** A CRO change made in the wrong canonical layer can appear fixed locally but never reach production, or overwrite a newer production flow. It also makes test results irreproducible.

**Opportunity:** Identify the generator/deploy authority for this route, diff source → generated output → uploaded bytes, then document the release mapping before implementation.

**Acceptance criteria:** One canonical source is named; generated route and deployable bytes are reproducible; the live page contains the intended version hash/content; rollback is known; no CRO experiment starts while two materially different flows exist.

## Visual, interaction, and accessibility opportunities

These are conversion opportunities through the requested taste/Hallmark/Impeccable lenses, not a call for decorative redesign:

- Preserve the asymmetric “promise + action” composition, but make the booking rail visually dominant once the visitor reaches `#booking-flow`.
- Use one consistent design language. Local inline styles mention Geist/Inter while the documented system uses Instrument Serif + Lexend and the site’s visual system uses nested functional enclosures. This inconsistency can make the booking control feel like a separate product.
- Keep the forest accent for the primary action; avoid competing teal/cyan emphasis inside Calendly unless it is required by the provider. The scheduler should feel embedded, not branded as a second site.
- Replace decorative or repeated cards with a clear step indicator: “1 Choose who is starting → 2 See times → 3 Confirm what happens next.” It should reflect actual state, not merely decorate.
- Ensure each profile button has a visible selected state, a 44px+ target, a clear focus ring, and a concise accessible name. `aria-pressed` is present in the local source; verify the live generated version retains it.
- Do not use animation to conceal a delayed widget. Loading, unavailable, blocked-popup, and Calendly error states need plain-language recovery.
- Keep the “Not sure” path prominent enough to protect unsure visitors, but do not style every lane with equal visual weight if some are secondary.
- At 320, 375, 414, 768, and 1440px, verify no layout shift from Calendly, no clipped iframe controls, and no sticky/header overlap with `#booking-flow`.

## Quick wins, high-impact changes, and tests

### Quick wins (approval still required)

1. Add a one-sentence appointment contract above the lane choices.
2. Rename “Choose your time” to the exact truthful event purpose if Calendly uses a Goal Mapping appointment.
3. Replace mobile auto-popup with a user-initiated button and explicit close/fallback behavior.
4. Add a persistent “Back / change who is starting” control that preserves scroll position and lane context.
5. Make the selected lane visible above Calendly so the user can confirm they chose correctly.
6. Add a controlled no-availability and widget-load-error state.

### High-impact changes

1. Reduce or regroup the lane taxonomy (CRO-02).
2. Map every lane to a verified Calendly event and operational owner (CRO-05).
3. Reconcile the post-booking contract and remove repeated data capture (CRO-06).
4. Establish the event taxonomy and booking conversion definition (CRO-07).
5. Resolve source/dist/live drift before experimentation (CRO-08).

### Test backlog

| Test | Hypothesis | Primary metric | Guardrails |
|---|---|---|---|
| T1: current six lanes vs three grouped paths | Fewer top-level decisions increase Calendly opens. | `calendar_opened / intro_viewed` | Lane mix, scheduled bookings, qualified arrival rate |
| T2: immediate availability explanation vs no explanation | Explaining the gate reduces hesitation. | `lane_selected` and `calendar_opened` | Back clicks, error rate |
| T3: mobile manual open vs auto-popup | User control increases completed scheduling. | `calendly_scheduled / calendar_opened` | Popup close, fallback clicks, page exits |
| T4: appointment contract copy variants | Clear separation of planning visit vs later class improves trust. | Scheduled bookings | Reschedule requests, “what am I booking?” messages |
| T5: one event type vs lane-specific event types | Simpler routing reduces mismatch and operational cleanup. | Scheduled bookings that staff can fulfill | Lane accuracy, no-show/show-up rate |
| T6: post-booking details form optional vs required | Removing a second hard gate preserves completed bookings. | `calendly_scheduled` and details completion | Lead completeness, staff follow-up time |

Do not call an experiment successful on Calendly opens alone. The business outcome should be a scheduled, correctly routed, attended Free Intro, with a comparable time window and enough volume to avoid over-reading noise.

## Copy directions (truth-preserving options)

These are alternatives to test only after confirming the actual appointment format:

1. **“Start with a calm 15-minute first-visit plan.”** Supporting line: “Meet Sandy, tour the studio, talk through your goal and week, and choose the right first class.”
2. **“Choose a time to meet Sandy before your first class.”** Supporting line: “This appointment is the planning visit—not the class itself. We’ll make the class step clear.”
3. **“Find your first class without guessing.”** Supporting line: “Tell us who is starting, then see the appointment times that fit that lane.”

Preferred CTA direction: “See available first-visit times” after lane resolution; use “Reserve Your Free First Visit” where the visitor is still at the page-level action. Avoid “Book now” unless the appointment object is already clear.

## Measurement and acceptance checklist

Before shipping any CRO change:

- [ ] Canonical route source, generated output, and deployable bytes are identified.
- [ ] Title, description, canonical, robots, H1, local relevance, and structured data remain intentional.
- [ ] Actual Calendly event URL and appointment format are verified for every lane.
- [ ] Desktop inline and mobile popup paths are tested in a rendered browser.
- [ ] Mobile widths 320/375/414 and desktop 768/1440 are checked.
- [ ] Keyboard focus, selected state, screen-reader names, focus return, and error recovery are checked.
- [ ] Calendly load failure, no availability, popup close, back navigation, and duplicate submission are checked.
- [ ] One scheduled test produces one conversion event with lane/source attribution and no PII in analytics.
- [ ] `npm run qa:volatile-facts` is run if schedule-sensitive copy or controls change.
- [ ] Existing CTA routes, phone CTA, schedule authority, offer economics, and safety claims remain intact.
- [ ] Results distinguish local QA, live HTTP, rendered-browser behavior, and later commercial/Search Console evidence.

## Marketing strategy cross-check

### Job to be done

The visitor is not primarily trying to “use Calendly.” They are trying to make a safe, low-risk decision about starting BJJ:

> “Help me figure out whether this is right for me or my child, find a workable first step, and avoid feeling unprepared or pressured.”

Calendly is only the scheduling mechanism. Any optimization that increases scheduler interaction while making the visitor less certain about safety, fit, appointment purpose, or the next class is a local metric win and a marketing failure.

### Offer value equation

The current Free Intro offer should be evaluated without inventing bonuses, scarcity, or guarantees:

| Lever | Current evidence | Marketing opportunity | Guardrail |
|---|---|---|---|
| Desired outcome | Tour, safety conversation, goal/schedule mapping, and a starting class are described. | Make the immediate outcome concrete: “leave knowing your next step.” | Do not promise enrollment, confidence, fitness, or a reserved class unless the offer guarantees it. |
| Perceived likelihood | Beginner Lane, safety walkthrough, and coached learning language support trust. | Put the strongest truthful reassurance beside the scheduling action; add named proof only if verified. | Do not add review counts, student outcomes, or “no-pressure” claims without evidence/approval. |
| Time delay | The first appointment is framed as 15 minutes; the class follows later. | Show exactly what happens at the appointment and when the class decision is made. | Do not imply same-day training or immediate class placement if that is not operationally true. |
| Effort and risk | Profile choice, Calendly, and potentially a post-booking form create effort. | Reduce unnecessary classification and repeated data entry; make rescheduling by text visible. | Do not remove operationally necessary information collection without staff confirmation. |

The likely binding constraint is not price. It is uncertainty plus avoidable effort at the handoff. That is why appointment clarity, lane simplification, and mobile control should precede stronger persuasion language.

### Objection map

| Visitor concern | What must be answered | Current audit coverage | Remaining action |
|---|---|---|---|
| “Is this actually for a beginner?” | No prior experience, calm coaching, safety, and the pace of the first class. | Partially covered. | Place one concise beginner reassurance beside the lane choices. |
| “Am I booking a class or a conversation?” | Exact appointment object and next step. | CRO-01. | Treat as P0/P1 copy and flow work. |
| “What if the time does not work?” | Availability, alternatives, and rescheduling. | CRO-03/CRO-04. | Add a truthful fallback and Text Sandy route. |
| “Is this right for my child?” | Parent role, age lane, safety, clothing, and who attends. | Partially covered. | Validate child/teen wording and parent-facing confirmation. |
| “Will I be pressured to buy?” | What the visit includes and does not require. | Not explicit enough. | Add only if operationally true; test calm expectation-setting, not a guarantee. |
| “What do I need to do after booking?” | Confirmation, location/format, clothing, waiver/details, and arrival timing. | CRO-06. | Reconcile the live post-booking contract first. |

### Proof and message-match gap

No traffic source, search-query set, ad copy, referral context, or voice-of-customer sample was supplied. Therefore the headline and copy alternatives in this document are hypotheses, not validated message match.

Before choosing a winner, collect:

1. Landing-page entry paths and UTM distribution.
2. Search terms or referring-page language for organic visitors.
3. Calendly starts, scheduled bookings, reschedules, show-ups, and lane mix by source/device.
4. The questions visitors ask Sandy before booking and after booking.
5. A small set of real parent/adult/returning-student phrases, with identifying details removed.

Use that evidence to select language. Do not optimize toward generic CRO vocabulary such as “frictionless,” “transform,” or “unlock.” The page should mirror the visitor’s concrete concern: starting safely, knowing what happens, and finding a workable next step.

### Ethical persuasion check

The audit should use clarity, progress, and risk reduction—not manufactured urgency. Do not add countdowns, “only a few spots” language, fake scarcity, inflated value comparisons, invented guarantees, or pressure-based popup behavior. A truthful progress indicator is useful because the flow has real steps; it should never imply that a visitor is almost finished when a required form or operational decision still remains.

## Revised implementation sequence

The marketing review changes the order of work:

1. **Reconcile the live offer and route authority** (CRO-08, prerequisite). Establish which flow is real.
2. **Clarify the appointment object and next step** (CRO-01, CRO-06). Fix the largest trust gap.
3. **Verify lane-to-event mapping and operational fulfillment** (CRO-05). Prevent qualified-but-misrouted bookings.
4. **Repair mobile control and failure recovery** (CRO-04). Protect the highest-friction device path.
5. **Reduce lane choice only after mapping is known** (CRO-02). Do not simplify by deleting a needed business path.
6. **Instrument the funnel contract** (CRO-07). Make outcomes measurable before testing copy.
7. **Run copy and lane experiments** (T1–T6) against scheduled, correctly routed, attended intros—not only clicks.

This sequence follows the constraint principle: resolve truth and handoff reliability before polishing persuasion.

## Approval boundaries

This document recommends opportunities only. Do not change Calendly event URLs, schedule facts, lane eligibility, prices, offer entitlement, required fields, post-booking promises, analytics names, or production bytes without explicit approval and a verified canonical source.
