# Paying-customer avatar audit — 2026-09-28

> Policy update, October 2, 2026: this is historical analysis. Current adult entry is a required fifteen-minute goal visit, then an elective same-day or later free class confirmed by Sandy. Visit-only guests wear day clothes; training guests follow Sandy’s gear plan. Use `src/_data/free-intro.json` and `docs/ssbjj-show-up-and-intro-playbook.md` for current rules.


## Scope

This audit defines the working avatars around **who pays Sensei Sandy BJJ**, then records separately who trains and which offer they buy. The seven records in `tools/ads/personas.json` are creative hypotheses; their existence, weights, and generated ad volume do not prove seven paying-customer segments.

The owner selected attended Free Intros first and suitable enrollments second as the near-term outcomes, with adult beginners as the learning priority. The owner says intro-to-enrollment and day-30 active outcomes are not tracked. In the latest answer, the owner confirms the current class schedule and separate Free First Visit / coached-class sequence still leave pickup, transport, and family logistics as barriers.

## Working payer model

| Working payer avatar | Who pays / who trains | Current paid path | Evidence and status |
|---|---|---|---|
| **Adult self-payer (Ben)** | Adult pays for and attends their own training. | Adult Core Culture 12-week offer; the schedule has weekday evening and Saturday options. | **Lead hypothesis by owner choice.** Owner reports time/family logistics as the leading barrier, with fatigue/readiness, floor-based activity fit, age/body-image concerns, and cost also reported. No linked intro-to-paid-start or day-30 outcome is tracked, so Ben is not a proven best-value payer segment. |
| **Parent payer (Carla)** | Owner confirms parents pay for youth and teen training; parent is the payer/decision-maker while the child or teen participates. | Youth Core Culture 12-week offer for ages 5–17; teen remains on the age-appropriate youth/teen path. | **Payer identity is owner-confirmed, transaction pattern is not independently audited.** Parent purchase motivation, paid-start volume, and renewal reasons remain unknown. Reviews describe delivered youth experience, not why a parent buys or renews. |
| **Seasonal / second-home payer (Wendy context)** | Adult visitor or seasonal/second-home resident pays for occasional training; adult or family members may participate depending on the offer. | Day pass, vacation-week pass, or class packs for seasonal, second-home, or irregular-schedule students. | Owner says “only here on some weekends” usually describes a seasonal or second-home resident. This is an owner-estimated context; request volume, purchase volume, repeat behavior, and margin by product are unknown. |
| **Community-service adult (Casey overlay)** | Adult pays; eligibility may affect the available price path. | Separate Community-Service Adult Core Culture terms, subject to canonical eligibility. | **Offer eligibility is confirmed; separate payer motivation is not.** Keep it as an adult offer overlay unless purchase/source/continuation evidence shows a distinct customer group. |
| **Multi-person household (Frankie overlay)** | One household may pay for one or more participants; who pays for each enrollment is unknown. | Family inquiry followed by age-appropriate individual program placement. | **Routing context, not yet a distinct payer avatar.** Do not imply one shared mixed-age class or infer one payer from a family inquiry. |
| **Teen participant (Tyler)** | Parent pays; teen participates and may influence the decision. | Teen/youth first-visit path and age-appropriate program placement. | **Participant/co-decision lens, not an independent payer avatar under current owner input.** “Between sports seasons” remains an unvalidated motivation. |
| **Child experience lens (Ian)** | Child trains; guardian is the buyer/payer contact. | Youth first-visit and youth program path. | **Experience lens, not a payer avatar.** Keep follow-up with the guardian and protect youth privacy. |

This model distinguishes recurring local program payers from one-time or occasional visitor purchasers. A person may fit more than one context over time; classify the purchase event first, then evaluate whether the buyer has a repeatable job or motivation.

## Current purchase facts

- The general Free First Visit is a 15-minute orientation in normal clothes; no workout is required. The coached adult first class is scheduled afterward. The specialized youth path may combine the visit and class in one visit.
- Adult and youth Core Culture are paid 12-week offers with a frequency ladder. Current prices and eligibility remain governed by `src/_data/pricing.json` and `src/_data/offers.json`.
- The Community-Service Adult offer has separate eligibility and terms. Eligibility alone does not establish a distinct customer avatar.
- Visitor products distinguish a single visit, a vacation-week option, and packs for seasonal, second-home, or irregular-schedule students. Availability and suitable partner fit apply.
- The owner reports that the schedule and separate adult intro/class steps do **not** resolve pickup, transport, and family logistics. Do not position the existing path as solving those constraints.

## Evidence status against a payer framework

| Question | Current read |
|---|---|
| What need causes a payer to buy? | Adult time/family logistics is the owner's estimated leading barrier. Other adult concerns are owner-reported but unranked. Parent and visitor purchase motivations remain unknown. |
| Who can and does pay for the current offer? | Canonical offers and prices are defined. Actual payer by participant, product choice, paid-start counts, refunds, and continuation by avatar are not available in the current audit sources. Do not infer willingness or ability from age, occupation, attendance, or price alone. |
| Can the academy reach them? | Youth/adult are the reliable owner-identified lanes. Source-to-attended-intro and source-to-paid-start outcomes are not tracked. Seasonal/second-home context is owner-estimated. |
| Is the payer segment growing? | The supplied owner narrative previously identified Nov–May as a high-attendance period, but current attendance/revenue-by-payer evidence is not present here. One attendance season does not establish recurring demand or growth. |
| Who stays or buys again? | Intro funnel, suitable starts, and day-30 activity are not tracked. Renewal and term completion remain `not-yet-measured` in `src/_data/academy-metrics.json`. |

## Recommended next evidence

If an enrollment/payment source is available, start with privacy-reviewed aggregate counts by **paid product and payer relationship**: adult self, guardian/youth, community-service adult, visitor/seasonal, and multi-person household where reliably recorded. Keep people, households, and transactions as separate denominators. Add attended intro and continuation only when the stages can be linked reliably. Suppress small cells; never use named student or child rows for this audit.

If no such source is available, keep the payer model provisional and use a few brief adult and guardian conversations. Record the payer’s own reason for buying, the paid offer selected, the schedule/logistics constraint, and whether the purchase continues. Label recollection separately from observed payment or attendance behavior.

## Owner questions for the next iteration

1. For an adult who enrolls in Core Culture, is the adult usually the payer, or does someone else commonly pay?
2. For youth and teen enrollments, does the guardian pay in the usual case? If teens sometimes pay, what evidence identifies that reliably?
3. Among paying adults, does the time/family logistics issue usually prevent purchase, reduce planned frequency, or lead to a short-term/visitor product? Estimates are useful if marked as estimates.
4. Do seasonal/second-home buyers usually purchase day/week access or a multi-class pack? If unknown, keep the purchase mix unmeasured.
5. Is an enrollment or payment report available for aggregate counts by paid product and payer relationship, even though intro-to-enrollment and day-30 status are not tracked?

## Sources and limits

- `tools/ads/personas.json` — current seven creative hypotheses and offer IDs. Current Ben weight is 7; weights are static planner allocation, not payer value.
- `src/_data/offers.json`, `src/_data/pricing.json`, `src/_data/schedule.json`, `src/_data/free-intro.json` — current purchase paths, prices, eligibility, and schedule.
- `src/_data/academy-metrics.json` — tracking definitions and current `not-yet-measured` status.
- Owner input in this conversation — adult-beginner priority and barriers, seasonal/second-home interpretation, confirmation that current visit/schedule arrangements do not resolve family logistics, and that parents pay for youth/teen training. These are owner-reported, not linked transaction records.
- The previously referenced attendance workbook and review inventory are absent from the current worktree, so their detailed contents were not re-audited in this pass.
