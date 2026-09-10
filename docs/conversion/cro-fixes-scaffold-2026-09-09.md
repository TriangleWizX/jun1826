# CRO fixes scaffold: simplify the first decision

Date: 2026-09-09

Status: implementation specification; website changes have not been made

Input: [CRO opportunities from the simplification framework](cro-opportunities-from-simplification-framework-2026-09-09.md)

## 1. Direction

Help a local beginner understand the academy, choose who is starting, and request a Free First Visit. Keep the existing booking flow. Explain the paid program after the visitor understands the first step, and keep visitor and continuation options accessible in their own context.

Start with source and measurement reconciliation, then homepage clarity, pricing hierarchy, and program reassurance. Copy improvements can proceed under existing policy; reservation removal, pack eligibility changes, and new commercial promises require a separate business decision. None of those decisions is needed to finish this scaffold.

The intended outcome is more qualified prospects reaching a confirmed visit and appropriate first class. More button clicks alone would not demonstrate success. Conversion lift, traffic volume, acquisition mix, and attendance performance are unknown in this review.

### Marketing skills applied

| Skill | Application to this scaffold |
| --- | --- |
| [CRO](../../.agents/skills/cro/SKILL.md) | Value clarity, CTA hierarchy, visible objections, and preserving a useful three-step form. Its form reference informs error handling and field review. |
| [Copywriting](../../.agents/skills/copywriting/SKILL.md) | Concrete headline and reassurance drafts, one job per section, and audience-specific expectations. |
| [Offers](../../.agents/skills/offers/SKILL.md) | Reduce perceived effort and delay without changing the underlying product, manufacturing bonuses, or inventing urgency. |
| [Analytics](../../.agents/skills/analytics/SKILL.md) | Reconcile actual event names, origins, lane fields, and operational evidence before choosing a metric. |
| [A/B testing](../../.agents/skills/ab-testing/SKILL.md) | One hypothesis per experiment, predeclared denominators and stopping rules, and an explicit low-volume fallback. |

The product-marketing context was read, but its July snapshot contains older terminology, numeric proof, and competitive assertions. Those are not fresh evidence. No generic skill estimate of conversion lift or field-abandonment percentages is treated as an academy forecast. No new offer, funnel, KPI, form, or experiment platform is proposed during the brief's freeze.

## 2. What the current files change about the original audit

These are local-source findings. The graph service returned `Transport closed` on `search_graph`, so direct file inspection was used. No live HTTP, remote-byte, analytics-account, customer-record, or browser check was performed.

| Finding | Current evidence | Implication |
| --- | --- | --- |
| The current acquisition contract already says Free First Visit. | [free-intro.json](../../src/_data/free-intro.json), [lifecycle.json](../../src/_data/lifecycle.json), [terminology QA](../../scripts/qa-terminology-contract.mjs). | Use `Reserve Your Free First Visit`. Do not reintroduce Free Intro because an older strategy or marketing context uses it. Keep legacy route and internal identifiers. |
| First Visit and First Class remain different for adults. | `free-intro.json` models a general visit with no workout and a separate youth workflow; [programs.html](../../src/programs.html), lines 19–27, already explains the difference. | Simplify the explanation, not the operational sequence. The universal promise “try one class” is inaccurate for the adult visit. |
| The active homepage partial uses mixed CTA verbs. | [home-conversion-shell.html](../../src/partials/home-conversion-shell.html), lines 60–88: Plan, Reserve, and Start With. | A bounded CTA consistency change remains useful. Four audience choices are relevant segmentation, not four paid products. |
| Two pricing sources emit different output paths. | [options-pricing.html](../../src/options-pricing.html) emits `/options-pricing.html`; [options-pricing.njk](../../src/options-pricing.njk) emits `/options-pricing/index.html`. Both declare `/options-pricing` as canonical. | Verify route/output ownership before editing. A single-template change cannot establish consistent pricing behavior. |
| The longer pricing template is already partly segmented. | `options-pricing.html`, lines 63–76 and 295–369, already has `#start`, `#flexible`, `#continue`, and `#annual-track`. | Improve labels and relative prominence; do not scaffold a second router. Preserve fragment destinations used by existing links and redirects. |
| The shorter pricing template introduces a different problem. | `options-pricing.njk` says “Try one class before choosing a training plan,” uses “Book a Free First Visit,” and presents pass/pack choices. | Include both variants in terminology, first-visit, anchor, and offer-hierarchy acceptance. Do not assume the longer template is what a live visitor receives. |
| Current prices match two numbers the audit treated as proposals. | [pricing.json](../../src/_data/pricing.json) currently defines youth `$550`, adult `$715`, and eligible community-service adult `$600` for the first 12 weeks. | These are snapshot values, not new recommendations. Bind to canonical data; retaining them needs no new price decision. A price change still does. |
| The old strategy conflicts with current offer data. | [product-offer-strategy.md](../product-offer-strategy.md) restricts packs and holds Concierge; [offers.json](../../src/_data/offers.json) marks packs public and Elite Concierge qualified/public, and current pricing makes Concierge active for continuation. | Demote competing presentation without silently revoking eligibility, disabling products, or imposing old indexation rules. |
| Guarantee summaries can overgeneralize. | `options-pricing.html`, lines 83–84, lists a generic guarantee before the community-service card; `pricing.productPolicy.guaranteeEligible` excludes that rate. | Place qualification beside the relevant claim. Fewer words must not broaden the guarantee. |
| Measurement documentation and source names diverge. | [tracking plan](../analytics/funnel-tracking-plan.md) names `booking_started` / `booking_submitted`; [funnel-events.js](../../src/assets/js/funnel-events.js) emits `lead_form_started` / `first_visit_submitted`. | Reconcile the existing stages with observed runtime names before calculating conversion. Do not create another parallel event taxonomy. |
| Homepage coverage is not established by the shared tracker. | `funnel-events.js`, lines 126–138, selects booking-page forms, not the homepage form. The homepage has separate inline events; [analytics-events.js](../../src/assets/js/analytics-events.js) contains aliases. | Trace the loaded scripts, payloads, and duplicate listeners. Source presence does not prove a runtime event, successful form delivery, or GA4 ingestion. |

### Baseline checks performed for this scaffold

| Local command | Result | What the evidence does and does not establish |
| --- | --- | --- |
| `rtk npm run qa:funnel` | Passed. | Tests existing root JS fixtures, attribution behavior, and markup markers. It does not exercise the homepage's rendered three-step flow or prove the documented stage names reach reporting. |
| `rtk npm run qa:product:lifecycle` | Failed at `scripts/qa-product-lifecycle.mjs:21`. | The assertion expects “first Youth or Adult Core Culture term”; current terms say “first Youth or Adult 12-week program term.” The process stops there, so later assertions are unverified. Do not resolve this by changing business terms to satisfy a string test. |
| `rtk npm run qa:terminology` | Failed: `missing after-school.html`. | The existing `dist` snapshot lacks that required route. This is not a result from a fresh build and does not prove a live missing page. |

These failures predate this document's creation. A build was intentionally not run for a documentation deliverable in the heavily modified worktree. Future implementation must resolve or explicitly disposition baseline failures before release; this record is not a waiver.

## 3. Decision path and source rules

| Visitor intent | First useful decision | Destination / treatment |
| --- | --- | --- |
| New local parent | Child or teen; then a suitable first visit | Existing booking route with the correct youth lane; explain possible same-day training. |
| New local adult | Whether the first visit feels approachable | Existing adult booking lane; visit in normal clothes, no workout, coached class scheduled afterward. |
| Several family members | Who wants to start | Keep family selection and staff coordination. Do not promise simultaneous classes or a new family price. |
| Community-service prospect | Adult fit, then existing eligibility | Retain existing qualification/context fields and destination behavior; do not imply guarantee eligibility. |
| Vacationing or seasonal practitioner | Whether suitable visitor access exists | Existing visitor section and `/catskills-home-base`; availability and partner fit still apply. |
| Private-coaching inquiry | Whether one-to-one help fits the request | `/private-lessons`, secondary on acquisition pages; scheduling is request-based. |
| Returning member | Review and next arrangement | Existing member/review destination and continuation content, not an acquisition restart. |

The two paid-program summaries are Youth/Teen and Adult. They do not replace Kids, Teens, Adults, and Family as useful entry choices. Community-service eligibility is a qualification within the adult path, not a reason to lose its routing context.

Use `src/_data/free-intro.json` for the acquisition contract; `src/_data/pricing.json` for prices and entitlement policy; `src/_data/offers.json` for offer references and current visibility flags; and `src/_data/lifecycle.json` for lifecycle links. Check inconsistencies rather than assuming a historical strategy overrides current data. [The entitlement matrix](../product-lifecycle-entitlement-matrix.md) is a supporting interpretation of pricing policy.

For editorial copy, import current schedule/contact facts from their authority or link to `/schedule` and the appropriate contact/location page. Preserve the distinction between class duration, a scheduled window, a requested preference, and an appointment confirmed by Sandy. None of these means inventory is reserved merely because a form was submitted.

## 4. Implementation backlog

Effort is relative implementation size, not a delivery estimate. Evidence confidence means confidence in the observed discrepancy; conversion impact remains a hypothesis.

| ID | Priority / effort | Fix | Dependency | Evidence confidence |
| --- | --- | --- | --- | --- |
| CRO-00 | P0 / medium | Establish pricing output ownership and a trustworthy baseline | None | High: two distinct source permalinks |
| CRO-01 | P0 / medium | Reconcile existing funnel measurement and homepage coverage | CRO-00 before measuring release results | High for source mismatch; runtime unknown |
| CRO-02 | P0 / small | Unify homepage CTA and explain the first action | Current first-visit contract | High |
| CRO-03 | P0 / small–medium | Simplify public first-visit language across selected pages | CRO-02 language decision | High |
| CRO-04 | P0 / medium | Make beginner pricing primary and truthful | CRO-00; current offer policy | High |
| CRO-05 | P1 / medium | Give each program page a clear next step | CRO-02/03 | High |
| CRO-06 | P1 / small–medium | Put selective reassurance beside the decision | CRO-03/05 | High for hidden content; effect unknown |
| CRO-07 | P1 / medium | Verify form recovery, attribution, and confirmation handoff | CRO-01; existing booking behavior | Medium: source concerns need browser reproduction |
| CRO-08 | P2 / medium | Audit secondary links and proprietary vocabulary | CRO-04/05; current lifecycle policy | Medium beyond inspected routes |
| CRO-09 | P1 / policy-dependent | Scaffold entitlement simplification as a separate conditional change | Explicit operating-policy decision | Current policy known; replacement unapproved |
| CRO-10 | P0 before evaluation / small | Record observation, decision, and rollback criteria | CRO-01 | Baseline business data unknown |

### CRO-00 — Establish the pricing output and release baseline

**Problem and hypothesis:** Improving a template that is not served, or checking the other template, can create apparent completion without improving the visitor's experience.

**Implementation scaffold:**

1. Record the two pricing sources, their generated files, canonical tags, inbound fragments, and local routing rules. Inspect both outputs after a scoped build in a preserved checkout. Review rewrite configuration as evidence; do not change deployment configuration for this copy task.
2. Establish which output the intended serving environment resolves for `/options-pricing`, `/options-pricing/`, and `/options-pricing.html`. If live verification is required later, obtain elevated network approval first and record it separately from local serving behavior.
3. Choose one maintained content definition for this route's pricing argument, reusing existing includes where practical. Keep compatibility outputs and anchors until their consumers are accounted for. This is bounded pricing synchronization, not permission to reorganize the repository.
4. Make the QA route list cover the output visitors receive. The lifecycle script currently reads `src/options-pricing.njk`; the longer `.html` is a separate source. Record this distinction in the implementation note.

**Acceptance:** Both emitted variants express the same first-visit and commercial truth. `#start`, `#flexible`, `#continue`, `#visitor-training`, and `#annual-track` resolve wherever existing public links need them. No redirect loop, unintended indexation change, or silent replacement of unrelated dirty content occurs.

**Verification / rollback:** Compare rendered metadata, headings, anchors, and CTA destinations for both variants. Keep a path-scoped before snapshot; revert only the owned pricing content/output change if routing or compatibility regresses.

### CRO-01 — Make existing measurement usable

**Problem:** The brief's metric names cannot currently be assumed to correspond to the browser events. Homepage inline events, the global analytics path, and the shared funnel module need reconciliation.

**Files:** `src/partials/home-conversion-shell.html`, `src/index.html`, `src/assets/js/funnel-events.js`, `src/assets/js/analytics-events.js`, `js/analytics-events.js`, the loaded minified variants, and `docs/analytics/funnel-tracking-plan.md`. These are inspection targets, not a requirement to edit every copy.

**Implementation scaffold:**

1. Inspect the scripts loaded by the actual generated homepage and booking page. The base layout loads `/js/analytics-events.min.js`; the root analytics source contains a funnel-module loader. Do not assume `/src/assets/js/analytics-events.js` defines the active global function just because it contains aliases.
2. Capture one controlled journey's data-layer events at CTA click, first meaningful interaction, valid submit, failed submit, and confirmation-page arrival. Use test values and intercept delivery locally. Repeat with campaign context and each entry lane.
3. Map existing wire names to the existing reporting stages in section 7. Select a single producer for each measured action. Keep aliases only where needed for compatibility; do not count the alias and original as two conversions.
4. If the homepage is absent from the shared integration, extend that integration narrowly or explicitly supply equivalent context through its current handler. Normalize the homepage's `child`, `teen`, `adult`, and `family` profiles; preserve community-service context separately wherever the current contract supplies it.
5. Preserve first-touch/source attribution and consent behavior. Allowlist the needed non-personal properties. Do not forward free text, student names, contact fields, or a full user-supplied URL as analytics context.

**Acceptance:** A deliberate primary CTA action and each measured form stage produce the intended count once per defined attempt/session. Returning via Back does not add starts. Failed validation does not count a valid submit. A request submission, receipt page, staff confirmation, attendance, and purchase remain distinct. Lane/campaign/source values survive the journey or are explicitly recorded as unavailable.

**Verification / rollback:** Run the existing funnel check and add focused behavioral coverage for the new integration, because the current passing test does not cover it. Inspect actual browser payloads before reporting readiness. Restore the owned event adapter if counts duplicate or personal data appears; do not roll back unrelated analytics work.

### CRO-02 — One clear homepage action

**Observed:** The included homepage conversion partial leads with “Get Better at Handling Hard Things,” then “Plan Your Free First Visit.” The form submits with “Reserve Your Free First Visit”; the family block uses another verb. The older homepage hero remains in source but is hidden by the partial's CSS.

**Hypothesis:** A concrete category/location line and a consistent action reduce interpretation before the visitor chooses a lane.

**Proposed default:**

> Jiu-jitsu for kids, teens, and adults in Tannersville.
>
> Start with calm coaching, thoughtful partners, and a clear first step.
>
> **Reserve Your Free First Visit**
>
> Choose who is starting and a preferred time. Sandy confirms your visit before you arrive.

Keep “Start calm. Train smart.” or the existing emotional promise as supporting copy if space allows. Keep `/schedule` as a quieter text action. Reuse the existing builder anchor and canonical CTA label; do not add a new modal, duplicate hero, or fifth audience option.

**Acceptance:** At 390 × 844 and 1440 × 900, the initial viewport shows the main action and a short next-step explanation with the real header present. At 320px wide and 200% zoom, text and actions remain usable without horizontal scrolling. Each repetition of the primary action uses the same visible name and matching accessible label. Secondary links remain usable without equal visual emphasis.

**Metric / rollback:** Use verified homepage CTA-to-start and start-to-submit stages, with completion and lane mix as guardrails. Restore the owned copy/layout change if it obscures the action, breaks the anchor, or causes expectation-related support problems. Do not interpret an early click increase as proof of better acquisition.

### CRO-03 — Simplify the visit explanation without changing the visit

**Observed:** `programs.html` already has correct adult/youth distinctions, followed by “Your Free First Visit starts with first visit...” and an SMS body asking for a 15-minute call. The old funnel document still describes a separately named Goal Mapping stage. The shorter pricing source promises a class at the first step.

**Implementation scaffold:**

1. Retain internal identifiers such as `goal-mapping`, `data-goal-mapping`, the booking URL, and the internal `generalPath.firstStep`. The current first-visit contract test explicitly expects the internal Goal Mapping string.
2. Replace redundant public process paragraphs with one plain account of meeting Sandy and choosing the right next step. Keep the adult and youth preparation differences adjacent to the relevant booking choice.
3. Update the selected pages' canned SMS text to match a visit request, using the canonical contact mechanism. Do not send any messages during implementation.
4. Bring `docs/conversion/FREE_INTRO_FUNNEL.md` into alignment with the already-established public wording while documenting preserved internal names.

**Draft reassurance:**

> Meet Sandy, see the room, and talk about what you want from training. Sandy helps you choose the right starting point.

For adults, retain the canonical explanation of a 15-minute visit in normal clothes, with no workout and the coached class scheduled afterward. For the specialized youth flow, retain arrival 20 minutes early in clean athletic clothes and possible same-day training. Use the existing data/component for these details rather than another independent operational copy source. Family requests need guidance for each participant; do not imply one preparation rule fits everyone.

**Acceptance:** The selected visible surfaces do not present Goal Mapping as another product or require another decision. Adult and youth paths still say what will happen and what to wear. No draft equates `Free First Visit` with a universal immediate workout. Internal fields and attribution keys are unchanged unless CRO-01/07 specifically repairs their delivery.

**Metric / rollback:** Start-to-submit and confirmed-arrival outcomes, plus existing support questions about what happens next. Restore misleading public wording immediately; retain the staff conversation and operational distinctions throughout.

### CRO-04 — Beginner-first pricing, with conditions intact

**Observed:** The long template repeats “Start with a Free First Visit,” duplicates prices in quick cards and program cards, and gives “I need flexible training” equal weight in its router. It also exposes passes and packs together. The short template has its own competing presentation.

**Hypothesis:** Visitors can understand price and their recommended next step more easily when the first-term decision comes first and alternatives are labeled by audience.

**Target section order:**

1. Short hero: “See the price. Start with a free visit.” One CTA and the confirmation reassurance.
2. Youth/Teen and Adult first-term summaries using canonical name, price, and term. Preserve access to both kids and teen booking context; do not send every teen through the kids lane.
3. Qualified community-service rate as a clearly labeled adult note/section, with its own eligibility and guarantee distinction.
4. A compact explanation of coaching, first qualifying uniform, and progress feedback. State attendance/rescheduling conditions accurately without leading with administrative vocabulary.
5. Conditional guarantee summary next to eligible offers, linked to `/guarantee-terms`.
6. Secondary visitor/private section; continuation review and existing member options afterward.
7. Final first-visit CTA.

Reuse the existing router. Suggested labels are “New to the academy,” “Visiting or training seasonally,” and “Already training here.” Keep `#flexible` as a compatibility anchor even if its visible heading becomes more specific. Irregular-schedule students who are already eligible for packs must still be able to find them.

**Specific repairs:**

- Bind displayed prices/terms to the canonical values; do not manually repeat dollar amounts in quick cards, main cards, and schema.
- Keep pricing visible without requiring a lead submission. Demoting an edge-case offer is not a reason to hide the beginner's price.
- Replace the generic shared guarantee bullet with scoped wording beside eligible Youth/Adult first-term offers. Preserve the four-class/first-30-days conditions and full terms; do not extend the guarantee to community-service, renewals, or visitor/private products.
- Change “Generally scheduled mornings” to request-based private availability unless a current canonical source establishes a public slot.
- Correct local copy defects such as “regular class timees” and “class class” while preserving the approved meaning.
- Condense secondary product promotion within existing sections. Keep material price, eligibility, and availability conditions easy to find. Do not change `public` flags, pack eligibility, product activity, or robots rules based on the older strategy alone.

**Acceptance:** Both pricing outputs meet the same hierarchy and first-visit truth. Core's descriptive first-term presentation dominates the beginner decision. Existing member/visitor anchors still land on relevant content. No added discount, unsupported scarcity, recurring private slot, broader guarantee, or new access promise appears.

**Metric / rollback:** Verified pricing-origin booking starts/submits; inspect visitor/private access and qualification outcomes as guardrails. Secondary-offer click reduction is diagnostic, not a success metric by itself. Restore the owned section order if legitimate visitors or returning members lose their route.

### CRO-05 — Program fit before product administration

**Files:** `src/programs.html`, `src/partials/program-conversion-kids.html`, `src/partials/program-conversion-teens.html`, `src/partials/program-conversion-adults.html`, and their consuming program routes.

**Observed:** Program hero buttons use “Plan Their,” “Plan a,” and “Plan My” variants. The hub exposes a seasonal link before the hero, lengthy operational explanations near the first decision, and secondary products after the audience cards.

**Implementation scaffold:** Retain separate Kids, Teens, and Adults pages. Give each the sequence fit → beginner/safety reassurance → relevant existing proof → schedule link → first-visit action. Standardize primary CTA labels without changing lane values. Move the shared-youth-product explanation to a concise placement note near the schedule link or FAQ. Keep the fact that kids and teens can share a scheduled class; do not invent separate hours. Relocate a still-valid seasonal route into the secondary area after checking its current status, rather than placing it before the main page promise.

**Draft page-specific supporting lines:**

- Kids: “Clear boundaries, patient coaching, and a partner task your child can understand.”
- Teens: “Build skill with thoughtful partners and coaching that helps you handle the next challenge.”
- Adults: “You do not need to get in shape first. Meet Sandy and see how a coached start works.”

These are proposed explanations, not guaranteed developmental or health outcomes. Preserve substantive local content and existing evidence links.

**Acceptance:** The first choice remains audience fit. Kids and teens retain distinct booking lanes even when the paid product is shared. Adult and community-service context survives. Private, visitor, and party information stays discoverable with secondary prominence. Each route has one visible primary hero and an accessible main action.

**Metric / rollback:** Verified lane-specific starts/submits and subsequent attendance where recorded. Restore the affected route's presentation if it routes a teen as a child, loses qualification context, or forces a visitor into the beginner form.

### CRO-06 — Show only the reassurance that resolves a decision

**Observed:** `programs.html`, lines 158–276, hides first-visit, shared-benefit, schedule, location, and final-CTA sections with `hidden` and `aria-hidden`. Useful text exists, but unveiling the entire collection would duplicate the visible argument and schedule.

**Proposed visible content:**

| Objection | Placement and proposed answer |
| --- | --- |
| What happens first? | Beside the primary CTA: “Meet Sandy, see the room, and choose your next step.” Add the relevant canonical adult/youth preparation text after lane selection. |
| Do I need experience? | Near the audience choice: “Beginners are welcome. Sandy adjusts the partner, task, and resistance to the student.” |
| Am I committing now? | At the form: “No payment. No membership commitment. Sandy confirms your visit before you arrive.” This already exists in the homepage form. |
| Can I make the visit work? | A visible `/schedule` link plus the existing Show-Up Kit/location destination. Use authority links rather than another schedule block or hard-coded address. |

Keep the first answer visible without disclosure. Put additional detail in the existing FAQ pattern if useful. Reuse one verified, relevant testimonial only if its attribution and wording are supported in current sources; the old marketing context alone does not verify a review count, class cap, membership count, or outcome statistic.

**Acceptance:** Keyboard and screen-reader users can reach every displayed answer; no visible wrapper remains `aria-hidden`. Existing hidden sections are not simply switched on en masse. No duplicate schedule or conflicting preparation instructions appear. Evidence remains attributed and limited to what it supports.

**Metric / rollback:** Form completion and existing confusion/support themes. If the new reassurance pushes the mobile primary action out of view, shorten or reposition it. Do not add scroll-depth instrumentation just to evaluate this change during the freeze.

### CRO-07 — Preserve the form's promises end to end

**Observed concerns to reproduce:** The homepage keeps name, phone, and email required; student first name is shown for minors. Its inspected inline handler populates profile/class but does not populate the additional attribution fields or write `ss_first_visit_details`. The booking-page flow does write that key; the confirmation page reads it. Another loaded script may supply context, so the source observation is a test target, not proof of lost production leads.

**Implementation scaffold:**

1. Keep the three-step structure and current required fields initially. Explain phone use only after verifying the follow-up workflow. Defer removing required email or adding new profiling questions until the delivery requirements are understood.
2. Test selection → Back → different lane → new time → submit. Clear stale dependent selections and update every dependent hidden value at the correct time. Preserve harmless contact input when going Back or recovering from errors.
3. Verify campaign/source fields actually reach the intercepted form payload. Test both query-based attribution and the existing stored-attribution path. Blank hidden inputs are not proof of attribution.
4. Verify the confirmation handoff from the homepage as well as the dedicated booking page. Store only the non-personal context the confirmation needs, consistently with the existing contract. Treat missing, stale, malformed, or unavailable storage as normal recovery cases.
5. Keep adult time choices explicitly described as preferences where they are not confirmed appointments. Do not print an adult class time as a confirmed 15-minute visit without an operational confirmation. Family confirmation must not suppress necessary adult instructions merely because `family` is currently grouped with youth.
6. On invalid submit, reveal and focus the first relevant error, retain entries, and announce the correction. Verify network failure/retry behavior locally without sending a real lead. Do not claim server receipt from client validation alone.

**Acceptance:** Synthetic child, teen, adult, family, and community-service journeys retain intended context and correct preparation. Duplicate submit/retry behavior does not inflate successful receipt claims. Stale prior-session context cannot display another lane's visit instructions. A usable fallback exists when scripts or storage are unavailable. Analytics excludes personal form values.

**Metric / rollback:** Existing start-to-submit/receipt evidence and error/support guardrails. Pause publishing if a lane is misrouted, a submission is lost, or confirmation is misleading. Restore the owned handler change from its scoped snapshot; never reset the worktree.

### CRO-08 — Intent-aware links and plain vocabulary

**Scope:** Audit header/footer, homepage, pricing, programs, shared editorial CTA/rail, blog CTAs, local landing pages, and member entry points. The findings above do not establish that every one of those surfaces is currently wrong.

Create an implementation inventory with columns: source file/component, rendered route, current visible label, href/fragment, intended audience, prominence, proposed change, and verification. Inspect shared component consumers before changing a global label.

Use descriptive language first: “Your first 12 weeks,” “First visit,” and “Review your next term.” Preserve official product names where they identify a contract, policy, or paid option. Do not replace every `Core Culture`, `home class`, or `Goal Mapping` string mechanically. Keep `/free-bjj-intro-tannersville-ny`, identifiers, structured references, and existing lane aliases intact.

Retain direct discovery paths to visitor/private/member destinations. Existing class-pack visibility is broader than the old strategy; making packs approval-only or newly noindexed is a policy/indexation change, not a copy cleanup. Check `/annual-track` fragment redirects before reducing continuation content.

**Acceptance:** Every proposed change has an audience and destination reason. Local beginner pages lead to the current first-visit route; visitor/member pages retain their purpose. No new orphan, broken fragment, unintended redirect, generic link label, or robots change results.

**Metric / rollback:** Existing route clicks where available and verified booking completion by origin; no new catch-all click system. Restore the affected shared component if downstream routes lose relevant access.

### CRO-09 — Conditional entitlement change

**Status:** Fully scaffolded, not approved for implementation by this document. Preserve the current reserved/home-class model while doing CRO-00 through CRO-08.

The framework's “up to three times per week” may sound simpler, but removing recurring reservations changes what students can expect. It is not equivalent to replacing jargon. Neither unlimited attendance nor guaranteed access to any session follows from a weekly allowance.

Before this change, the business decision record must specify: attendance allowance; whether recurring reservations remain; advance booking requirements; capacity and partner-fit handling; no-show/makeup rules; current-member transition; uniform/guarantee effects; and the effective date. Record actual capacity evidence rather than inventing a 12-person threshold or availability promise.

After approval, synchronize `src/_data/pricing.json`, `src/_data/offers.json`, the entitlement matrix, pricing variants, selected program pages, FAQ, `how-class-works`, Show-Up Kit, booking/confirmation expectations, and relevant sections of `docs/tree.md`. Include staff-facing explanations so the website and fulfillment agree. Preserve the distinction between training minutes and the scheduled class window.

**Conditional copy pattern:** “Train [approved allowance] under [approved booking rule]. Sandy helps you build a routine that fits your week.” The placeholders must be resolved from approved policy before publication; they are not website copy.

**Acceptance / rollback:** No contradictory entitlement remains in the affected journey, and existing students are not silently promised or denied different access. Product-lifecycle and volatile-facts checks plus operational review pass. If fulfillment cannot support the rule, stop the policy rollout and follow the recorded transition/rollback plan; a website text revert alone cannot undo promises already made to students.

### CRO-10 — Record decisions using existing measures

Use the section 7 template for each release or later test. The implementation owner records the changed route/component and evidence; the business owner reviews qualification, attendance, and support outcomes already available. Missing operational evidence is recorded as missing, not reconstructed from page views.

Do not adopt the marketing skill's generic experiment-velocity targets. During the freeze, maintain one understandable change record and the existing stages. Observation can expose a technical regression immediately; declaring conversion improvement requires enough comparable evidence.

## 5. Copy alternatives for later evaluation

These are alternatives to choose between, not simultaneous page sections. The canonical primary action remains `Reserve Your Free First Visit` during the consistency work.

| Element | Option A | Option B | Why choose it |
| --- | --- | --- | --- |
| Homepage headline | “Jiu-jitsu for kids, teens, and adults in Tannersville.” | “Start jiu-jitsu with calm coaching in Tannersville.” | A makes category and audience explicit; B emphasizes the beginner's concern. Preserve the audience line with B. |
| Homepage support | “Start with calm coaching, thoughtful partners, and a clear first step.” | “Meet Sandy, see the room, and find the right starting point.” | A explains training style; B explains the immediate action. |
| Pricing headline | “See the price. Start with a free visit.” | “Your first 12 weeks start with a free visit.” | A matches pricing research; B connects the visit to the eventual paid term. |
| CTA support line | “Choose who is starting and a preferred time. Sandy confirms your visit before you arrive.” | “No payment. No membership commitment. Sandy confirms your visit before you arrive.” | A reduces process uncertainty; B addresses commitment. Use the one relevant to the placement. |
| Future CTA test, after terminology review | “Reserve Your Free First Visit” | “Request Your Free First Visit” | Reserve maintains the contract; Request may better communicate staff confirmation. Do not introduce the second variant without testing the intended promise and updating the terminology decision. |

Suggested pricing metadata after both variants are reconciled: title “BJJ Pricing in Tannersville, NY | Sensei Sandy”; description “See first-term jiu-jitsu pricing for kids, teens, and adults in Tannersville. Start with a Free First Visit; find visitor and continuing-student options.” Preserve the canonical URL and existing indexation treatment. Do not change unrelated page metadata as part of CTA standardization.

## 6. Delivery sequence and acceptance gates

### Step 1 — Capture and reconcile

Save the scoped dirty-worktree baseline, resolve pricing output ownership (CRO-00), and verify the loaded event path (CRO-01). Reconcile the current first-visit and offer contracts. Leave the optional entitlement branch deferred unless a business decision is provided.

### Step 2 — Ship one coherent clarity change locally

Implement CRO-02 and the directly related CRO-03 text using current contracts. Inspect the real mobile/desktop layout, including the shared header and any sticky actions. Preserve the existing builder and available research/schedule paths.

### Step 3 — Clarify the paid decision

Implement CRO-04 across the actual pricing outputs. Keep prices and material conditions available; reduce duplicate promotional blocks. Reconcile the failing lifecycle assertions against policy meaning without weakening their protection.

### Step 4 — Synchronize fit, reassurance, and the handoff

Implement CRO-05/06 and any reproduced CRO-07 defects. Test the full path from homepage and each program entry, not just an isolated form. This can be a separate release from the headline change when attribution to a single hypothesis matters.

### Step 5 — Audit shared links and vocabulary

Complete the CRO-08 inventory and apply only verified changes. Do not assume a sitewide blind replacement is necessary. Keep the policy-dependent CRO-09 work in a separate decision record.

### Step 6 — Build, verify, then observe

Run the relevant existing commands from the repository after source implementation. Builds and inventory checks can write generated artifacts: preserve the baseline and inspect generated scope before any commit or release.

```sh
rtk npm run build
rtk npm run qa:funnel
rtk npm run qa:first-visit
rtk npm run qa:terminology
rtk npm run qa:volatile-facts
rtk npm run qa:product:lifecycle
rtk npm run qa:seo
rtk npm run qa:links:static
rtk npm run qa:links:existence
rtk git diff --check
```

Use additional route/CSS/asset checks only if those surfaces change. Do not hand-edit generated copies to make the tests pass. Confirm what each check actually covers: static QA is necessary but does not prove rendered interaction, delivery, or production behavior.

| Required scenario | Pass condition |
| --- | --- |
| Mobile 390 × 844; desktop 1440 × 900 | Primary CTA visible initially; one coherent hero; no competing sticky action or image obscures the next step. |
| 320px width; 200% zoom; keyboard | No horizontal page overflow, lost focus, clipped CTA, unlabeled input, inaccessible error, or keyboard trap; touch controls target at least 44px. |
| Homepage child / teen / adult / family | Back/change selections, validation, payload, attribution, and confirmation preparation match the selected context. |
| Program and community-service entries | Existing query and stored lane context survives; no accidental child/teen conflation or loss of eligibility context. |
| Campaign entry | Existing campaign and source fields survive to the intended lead payload; personal fields stay out of analytics. |
| Submission failure / retry / revisit | No false receipt or staff-confirmation claim; data is recoverable and stage counts follow the declared deduplication rule. |
| No/stale/malformed storage | Safe generic confirmation fallback; no stale class or incorrect participant preparation. |
| Visitor / private / member navigation | Relevant direct routes and fragment destinations remain accessible without an acquisition detour. |
| Pricing variants | Same commercial truth, canonical treatment, working legacy fragments, and appropriate audience hierarchy. |
| Changed-route SEO and performance | Correct title, description, canonical, robots, meaningful H1, schema consistency, internal links, alt text, and image dimensions; no duplicate visible schedule or unnecessary above-fold media. |

Use intercepted local submissions with synthetic values to test the browser journey. A production submission or message requires explicit authorization. Later release evidence must separate local checks, deployed bytes, live HTTP/content, browser behavior, and operational outcomes. No deployment is authorized or performed by this scaffold.

## 7. Measurement, observation, and experiment scaffold

### Reconcile existing stages first

| Reporting concept already in the brief | Inspected source name / gap | Definition to verify before using it |
| --- | --- | --- |
| First-visit CTA click | `first_visit_cta_click`; homepage raw `first_visit_started` has an alias in one analytics module | One deliberate action toward booking. Confirm the alias module is loaded and overlapping listeners do not double-count. |
| Booking started | Shared `lead_form_started`; homepage raw `first_visit_start` | First meaningful interaction once per agreed form attempt/session. Do not rename to `booking_started` blindly. |
| Booking submitted | `first_visit_submitted` | Valid client submission attempt. This does not prove delivery or a confirmed appointment. |
| Receipt-page arrival | `booking_confirmed` in the shared module; confirmation source also calls `generate_lead` | Browser arrival only. Direct visits/reloads and stored flags can distort this; do not sum these with submissions as distinct people. |
| Visit confirmed | `visit_confirmed` operational hook | Sandy or the operational system actually confirmed the appointment. Hook availability does not prove an integration supplies records. |
| Show / first class / purchase / activation / renewal | `first_visit_showed`, `first_class_attended`, `core_purchased`, `activated_30d`, `renewed` | Actual operational records. Missing data is unknown, not zero. |

Calculate rates with a consistent existing unit, preferably distinct people/leads where that identity already exists. If only sessions are available, label them as session-level rates and state that cross-device/person conversion is unknown. Do not join through names, phone numbers, or email addresses in analytics.

Keep the existing click → start, start → submit, submit → showed, showed → purchased, and purchased → activated rates. Filter by source route, lane, and campaign where verified. Include numerators and denominators, use the same cohort and follow-up window, and do not count appointments whose date has not arrived as no-shows. Community-service and family normalization require explicit inspection because the source modules do not all use the same lane vocabulary.

### Observation rule during the freeze

Proposed operating cadence: record at least two complete weeks before and two after a release when usable data exists, with enough follow-up for scheduled visits and enrollment decisions. The weeks are a review cadence, not a significance threshold. If data is absent or incomparable, first establish a baseline and mark conclusions inconclusive. Do not hold obvious accuracy/accessibility repairs hostage to an unavailable A/B sample.

The source currently references the September 14 fall schedule transition. Record that transition, holidays, campaign changes, and changes in lane mix as potential confounders. A before/after movement across this date cannot establish that the copy caused the change.

Rollback immediately for a broken primary action, wrong preparation, failed lead delivery, personal-data leakage, or unsupported commercial claim. For business guardrails, choose a tolerable decline after observing the baseline and record it before evaluating results. Do not fabricate a universal percentage threshold for this academy. Repeated confusion reports merit investigation even with a small sample; they do not establish a conversion effect size.

### Later test ideas, only when measurement and volume support them

| Test | Single changed factor | Primary existing outcome | Guardrails / interpretation |
| --- | --- | --- | --- |
| T1: category clarity | Concrete category/location headline versus current emotional headline; hold layout and CTA fixed | Eligible homepage visitors reaching a verified booking submission, if existing exposure data supports the denominator | Starts, qualification, show rate, lane mix. Inadequate exposure data means no defensible conversion test yet. |
| T2: commitment reassurance | Same truthful reassurance near the first action versus only at the last form step | Existing start-to-submit rate | Errors, wrong expectations, show rate. Do not alter fields at the same time. |
| T3: pricing intent label | “Visiting or training seasonally” versus current “I need flexible training,” holding availability/content constant | Verified pricing-origin booking completion | Visitor/seasonal access, support questions, returning-member access. Fewer pack clicks alone does not win. |

Before a randomized test, record baseline rate, eligible weekly traffic, minimum worthwhile absolute effect, randomization unit, allocation, required sample, maximum duration, and guardrail stop rule. Use a sample-size calculation with a declared method (for example, two-sided 5% significance and 80% power); those settings do not supply the missing baseline. Keep assignment stable and use an existing experiment capability only if one is verified. Do not add a platform during the freeze.

Do not stop at the first favorable result or promote a post-hoc segment as the winner. A significance result is not the probability that the hypothesis is true. If the necessary sample is unrealistic, use observed usability problems and operational feedback to make a documented judgment, and describe conversion results as directional or inconclusive.

### Reusable decision record

```markdown
### CRO-[ID] — [change]
Status: planned / implemented locally / released / observing / retained / reverted
Owner and release date:
Hypothesis and observed friction:
Routes, source owners, generated outputs:
Before and after copy/layout evidence:
Existing policy used; any separately approved policy change:
Primary existing stage/rate; exact numerator, denominator, and cohort:
Verified event names and data source:
Lane/campaign normalization and deduplication rule:
Baseline counts and observation dates:
Minimum observation/sample requirement and follow-up window:
Guardrails; available operational records; missing evidence:
Predeclared rollback/stop conditions:
Known confounders (schedule, campaigns, seasonality):
Local checks and browser scenarios:
Deployment/live evidence, if separately authorized:
Results with counts and uncertainty:
Decision, rationale, and unresolved questions:
Owned files/snapshot needed for rollback:
```

## 8. Coverage of the original opportunities

| Original opportunity | Scaffold coverage | Completion evidence for eventual implementation |
| --- | --- | --- |
| P0 primary decision unmistakable | CRO-02, CRO-07 | Visible consistent action, clear next step, working builder journey. |
| P0 collapse public Goal Mapping stage | CRO-03 | Plain public wording; unchanged staff discovery and adult/youth contract. |
| P0 pricing competition | CRO-00, CRO-04 | Actual pricing outputs share beginner-first hierarchy; secondary access and conditions survive. |
| P1 reserved-seat simplification if approved | CRO-09 | Explicit operating policy plus synchronized entitlement surfaces and fulfillment review. Deferred under current policy, not silently omitted. |
| P1 two-lane paid decision | CRO-04, CRO-05 | Youth/Teen and Adult paid summaries; Kids, Teens, Family, and qualification routing retained. |
| P1 hidden reassurance | CRO-06 | Selected answers visible at decision points without duplicated hidden sections/schedules. |
| P2 segmentation without catalog exposure | CRO-08 | Reviewed link inventory and verified visitor/private/member paths. |
| P2 proprietary vocabulary | CRO-03, CRO-08 | Phrase-by-phrase visible copy review with internal/contract names preserved. |
| P2 measurement decision record | CRO-01, CRO-10, section 7 | Verified stage mapping, observation record, defined denominators, and operational guardrails. |

### Handoff boundary

This file completes the requested research and fix scaffold. The tickets describe future implementation and are not claims that the website has been fixed. The recommended first implementation slice is CRO-00/01 reconciliation followed by CRO-02/03 clarity under current policy. The optional entitlement and eligibility decisions are fully identified without preventing the other work from proceeding.
