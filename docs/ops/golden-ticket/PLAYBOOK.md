# The Shiney Ticket operating playbook

## 1. The decision

Use GT01 as the single reusable invitation for now, as Sandy requested. Start with one willing adult member and one suitable adult friend. Keep GT02–GT10 blank in reserve; expansion waits for a later decision. The first review is after seven days; the inventory review is after fourteen days; the first pilot review is after thirty days from actual launch. Those review dates are separate from each guest's 14-day pass window.

The member gives their friend an easy first step and a familiar face. The guest receives four free classes within 14 calendar days, starting at their first attended class and activated by Sandy. The first class counts; its local date is day one. Each class and the friend's attendance are confirmed by Sandy. The existing $35 academy credit rewards a qualifying enrollment. Cards rotate back into circulation; the guest's progress continues in a separate record.

**The loop:** good class experience → thoughtful invitation → reserved friend class → welcoming coached experience → suitable enrollment → another good experience → a future invitation. The card supports the handoff. Sandy's welcome and the student's ongoing experience sustain the loop.

## 2. Evidence and offer boundaries

Sandy confirmed: adult friends first; Android; prearranged first class with the referring friend; retain the existing $35 policy.

`src/bring-a-friend.html` and the fetched public `/bring-a-friend` page describe the existing member Friend Pass: active students invite first-time guests; Sandy confirms the appropriate class, available space and arrival time; reservation and waiver are required; the Shiney Ticket includes four free classes within the guest's own 14-day window. Partner matching and capacity still apply. Ask to attend together; Sandy confirms that arrangement. Sharing a class does not promise that the two friends will be paired for every activity.

The global adult policy in `src/_data/free-intro.json` requires the first visit, then allows optional coach-confirmed same-day training or a later class. First-day sparring and The Sandy Challenge are elective. Waiver, consent, partner matching, agreed rules, and a verbal pause remain part of the class plan. Youth retain their own workflow. This pilot requests a class with the inviting friend through the Friend Pass form.

Canonical `src/_data/referrals.json` now records the approved guest offer, activation rules, and existing $35 reward terms. Sandy explicitly reconfirmed them here. This packet preserves them; it does not silently create or remove an incentive. The generic testimonials on that page were not independently substantiated during this task and are not reused as proof in this kit.

## 3. What Hormozi contributes, and what we adapt

| Source lens | Concrete application | Boundary |
|---|---|---|
| Offers: Value Equation | A familiar friend, a clear welcome, one link, and a confirmed class reduce perceived effort and uncertainty | No new fitness, safety, or transformation guarantee |
| Leads: customer referrals and gift cards | Let members give a tangible invitation; ask after a real positive experience | No invented gift-card dollar value or false deadline |
| Leads: relationship risk | Make Sandy's welcome and next step dependable so the member feels good inviting a friend | No harvesting friends' contact lists |
| Lead Nurture | Handle requests at real staffed times, explain the next step, and use a short permissioned follow-up sequence | No automatic high-pressure sequence or unstaffed response promise |
| Retention | Introduce the guest to a suitable second person, establish the next class, and notice attendance changes | An enrollment alone does not prove retention |
| Money Models | Count reward liability, delivery cost, staff time, and contribution before scaling | Membership receipts are not available profit |

The book's gift-card example uses a monetary credit and a deadline. We adapt its tangible-gift and social-status mechanisms. The guest's four-class offer was approved by Sandy, and the member's earned $35 is a separate benefit. We do not call the invitation a prepaid $35 gift for the guest.

## 4. Two objects, two records

**Physical invitation:** GT01–GT10. NFC and QR open an HTTPS page. Anyone with the URL can copy it. The card code is a routing hint, not an identity check, secure voucher, payment instrument, or proof of eligibility.

**Earned credit:** a private ledger entry linked to one unique new referred student and one eligible referring member. It arises only after the qualifying first payment clears. Returning or losing a card does not erase a valid referral or an earned credit.

Keep card custody, invitation cycles, guests, and reward transactions separate. Otherwise a returned card can overwrite a guest who has not yet enrolled.

## 5. The operating sequence

### Prepare

1. GT01 is written with `utm_campaign=shiney_ticket`; Sandy reports successful read-back and browser opening with the correct code. Test the new printed QR next. Keep the other nine cards blank.
2. Keep the links free of names, phone numbers, or member IDs. Use the fixed public code `gt01` through `gt10`.
3. Copy the blank ledgers into restricted operations storage. Use internal member/guest references there, with personal contact data retained in the existing customer system. Do not fill these repository templates with customer information.
4. Confirm actual class space and Sandy's available arrival/welcome window before offering a guest a specific slot. Use the current schedule, not times printed on cards.
5. Brief anyone handling replies on the difference between a request, a confirmed class, an attended class, and a cleared enrollment payment.

### Ask and issue

6. Select one member who has expressed a genuine positive experience and wants to invite someone. A newly enthusiastic member can qualify; seniority is not the selection rule.
7. Ask privately after class, when there is time for a short conversation. Use the invitation in `COPY.md`. Ask for one friend they already know would enjoy this kind of training.
8. Show the member how to tap or scan. Explain that Sandy confirms the class before anyone travels. Explain the $35 policy privately and accurately; lead the invitation with the friend's experience.
9. Record an issue-cycle ID such as `GT01-001`, the internal member reference, issue date, and next check-in. Give the member the card to pass to the friend. Do not require the friend to enroll for the member to receive thanks.

### Pass and request

10. The member offers the card. The friend chooses whether to proceed. The member and friend can complete the existing Friend Pass form together, or use its text option. That form asks for the member's details and the guest's details and includes a required permission-to-share checkbox.
11. If the guest uses text instead, ask them to include the printed card code and who invited them. Contact details remain in the normal private conversation. A member should obtain the friend's agreement before sharing their details or starting a group introduction.
12. Mark a handoff reported by the member as `reported`, not as a verified lead. A verified inbound request or conversation creates the guest record. Multiple taps do not create multiple guests.

### Confirm and welcome

13. Sandy reviews first-time guest eligibility, adult lane, capacity, suitable placement, waiver, and the friend's intended attendance. Then Sandy confirms the specific class and arrival details. Receipt of a form is not confirmation.
14. Ask for the code and inviting member when either is missing. Reconcile against the issue history. A late inquiry from an earlier cycle remains attributed to that earlier invitation if confirmed; never assume the current card holder is the referrer.
15. On arrival, complete the required first visit and waiver check. Offer the adult their training and sparring choices. The Sandy Challenge is optional and coach-led with agreed rules, verbal pause, and belt release at the end. When the guest attends their first class, Sandy records activation, class one, and the final valid date (local start date + 13 days). Give that date to the guest and plan the remaining three classes with the friend. Check expiry and classes used before each attendance. Let Sandy choose partners.
16. Recover the card at the visit if practical. Thank the guest and member. Record the returned card, inspect it, and read back the URL before reissue. A guest who forgot the card can still attend a confirmed visit.

### Next step, reward, repeat

17. After class, ask how it felt and whether the guest wants help with the next step. Discuss the existing suitable program and actual schedule if invited. Record first-class attendance independently of enrollment.
18. When an eligible new referred student enrolls in their first twelve-week program and their first payment clears, create one $35 credit entry. Verify referral attribution, exclusions, payment evidence, and prior reward entries before issuing it.
19. Record every redemption and remaining balance. Thank the referring member without sharing the guest's private enrollment or payment details beyond what is necessary to explain their own earned reward.
20. Confirm the new student's next appropriate class. Track a second attendance and later active status. Ask for a future invitation after a real positive experience and willingness, not as a requirement of joining.
21. Reissue a returned, tested card with a new cycle ID. Keep all earlier guest/reward records. Ten cards can support many cycles.

## 6. Preserve the existing $35 policy

The verified page says: $35 toward academy gear, events, or account credit; one reward per new referred student; first twelve-week program enrollment; reward immediately after the first payment clears; no cash value; immediate-family enrollments excluded; credits cannot stack with community-service pricing.

Operational interpretation: verify the enrollment and cleared first payment, then issue the credit. Do not wait twelve weeks or require the full program balance to clear. Do not pay for taps, requests, attendance alone, reviews, or testimonials. Do not add a card-return requirement, expiry, minimum spend, or retroactive clawback.

The published terms do not define whose community-service pricing controls stacking, how competing referrers are resolved, or what happens after a later refund. Flag those specific cases for Sandy before promising a result. Record the decision and update written policy separately if needed. Honor established obligations; this packet does not decide ambiguous cases by inventing exclusions.

Ten qualifying enrollments generate **$350 in face-value credit liability**. Reusable cards do not cap total liability at $350. Track all outstanding credit across cycles. Treat the full face amount as a conservative planning reserve even when merchandise fulfillment cost differs.

## 7. Follow-up and failure recovery

| Situation | Action | Evidence |
|---|---|---|
| Card still with member around day 7 | Ask whether a friend came to mind; offer continued use or return | Member report |
| Unused around day 14 | Offer easy return and reassignment; an unactivated pass has no started window; an activated guest's own 14-day window remains fixed | Physical return or custody update |
| Friend declines | Thank the member; accept the decision | Close cycle without pursuing friend |
| Lost card | Mark lost; serve any confirmed guest through the usual process | Inventory record; no fee invented |
| NFC fails | Use QR or printed site/phone fallback; inspect before reissue | Read-back result |
| Request received | Reply at the next realistic staffed opportunity with the actual next step | Private response record |
| Interested but unbooked | One helpful check after 1–2 days; one final check around day 7 if welcomed | Permissioned message, not an automated campaign |
| Missed confirmed class | One supportive reschedule contact through the existing chosen channel | Reply or closed follow-up |
| Class attended, no next step | Ask what would help them decide; offer an appropriate next class/program | Guest's decision |
| New member disengages | Attendance/service follow-up before another referral ask | Attendance record |
| Duplicate/uncertain referrer | Ask privately; hold reward attribution until resolved | Guest confirmation and decision record |
| Capacity constrained | Slow issuance and offer real future choices | Confirmed availability |

## 8. Scorecard and economic decisions

Review for fifteen minutes once a week. Keep counts next to rates. Separate staff tests from real activity. This single-card pilot gives operational evidence, not a statistically reliable A/B result.

| Measure | Definition |
|---|---|
| Inventory | unprogrammed + rewrite-awaiting-check + programmed-awaiting-print-check + ready + issued + returned-awaiting-check + lost + retired = 10 |
| Invitations | issued cycles and reported passes; one card can have many cycles |
| Engaged guests | unique adults who actually contacted or requested; exclude taps and duplicate contacts |
| Booking rate | confirmed guests / engaged guests in the same invitation cohort |
| Show rate | attended classes / confirmed classes whose scheduled time has passed; exclude future bookings |
| Enrollment | verified new paying students / attended first-class guests, with observation window shown |
| Ticket activation | Sandy-recorded first attended class; first class counts; final valid date is start date + 13 local calendar days |
| Repeat attendance | second attendance and a known next class; operational hypothesis, not a guaranteed retention predictor |
| Thirty-day activity | report only guests whose 30-day window has elapsed; use actual attendance and membership state |
| Reward liability | earned face value minus redeemed value plus signed, separately authorized adjustments |
| Referral CAC | acquisition costs, including earned rewards, / verified new referred paying students |
| Referral contribution to net members | referred paying additions minus member losses, using the same time period and member units |

Cost categories: card consumption/replacement, print materials, setup and follow-up staff time at a stated rate, incremental guest-class cost, and earned reward face value. Report existing-card sunk cost separately from new cash spent. Allocate costs once: guest visit/class delivery belongs in acquisition cost; paid-program fulfillment belongs in program contribution. Count earned reward liability when earned, and do not count its later redemption again as a second acquisition cost.

First-term contribution before acquisition = collected enrollment revenue minus refunds, payment fees, gi cost, and all relevant paid-term delivery costs. Contribution after acquisition = that amount minus allocated acquisition cost. Prepaid cash must still fund future service. If no referred students have paid, CAC is undefined; show total spend and the observed funnel instead of dividing by zero.

Scaling decision after thirty days: keep circulating cards if promises are being fulfilled, attribution is recoverable, guests receive appropriate care, and conservative contribution supports the cost. Fix the bottleneck first. Low passes suggest an ask/fit issue; requests with poor confirmation suggest response/scheduling friction; low shows suggest unclear arrival or reminder needs; weak repeat attendance suggests experience/fit. Do not try to solve every weak stage with a larger discount.

## 9. Persona & Expert Framework

Contextual routing was run before substantive work. The initial candidate was Solon the SEO Sage (`2d52210b-edae-48f2-b5a5-095e3dd4c523`), an ambiguous SEO match that did not fit referral operations. The selected app-level business instructions pointed to a linked prompt unavailable in the local exports. Dennis Stratton's available prompt referred to `START-HERE.md` without the needed executable guidance. No catalog coordinator adoption is claimed.

Coordinator and workers used disclosed ordinary specialists. Read-only worker contracts were: O1/O2 offer evidence and economics; L1/L2 referral and retention workflow; T1/T2/T3 current attribution, limits, and local verification. Parent alone owns writes under `docs/ops/golden-ticket/`; workers owned no write paths. External messages and form submissions were excluded. The parent independently checked canonical files, the live Friend Pass offer, the reward text, book excerpts, and source-url capture evidence.

Applied instruction methods: source-based tradeoff review, prioritized low-friction changes, cost/benefit checks, and iterative verification from the full versioned Universal Analyzer-Improver (`65808004-23a5-42ae-babe-1dbe85bfd1cf`, `exports/Universal-Analyzer-Improver/versions/v2.2.0/prompt.json`); creative refinement within constraints from full OptiMax (`4a702064-50b8-4fbb-875c-2f3600c8d6dc`, `exports/Anything-Enhancer---OptiMax/versions/v1.0.0/prompt.json`). Both list no attachments. These sources supplied review methods, not permissions or evidence of business results.

## 10. Sources and definition of done

Hormozi sources are in `/home/twizss/.codex/skills/hormozi-orchestra/knowledge/`. Source anchors: *$100M Offers*, Value Equation, lines 1892–1955; Trim & Stack, 2848–2871; Scarcity, 3410–3461. *$100M Leads*, customer referrals, 6442–6496 and 6784–6916. *Lead Nurture*, 155–210 and 958–1000. *Retention*, 501–598 and 786–798. *Money Models*, 484–514 and 4313–4335. These are source frameworks, not academy performance evidence.

Operational authorities: `src/bring-a-friend.html`; `src/_data/referrals.json`, `free-intro.json`, `offers.json`, `pricing.json`, `contact.json`; current user decisions; live `/bring-a-friend`. Product-marketing context was used for audience orientation only where consistent with current sources.

Kit completion requires ten matching URL/QR pairs, writable-capacity checks, usable print layout, blank ledgers, Android steps, preserved reward terms, truthful copy, and verified source capture. The active launch scope is GT01 only; the other nine payloads are optional future inventory. Launch completion additionally requires physical read/scan tests, a confirmed operational receipt path, real member assignments, and Sandy's actual class arrangements. Referral results require actual request, attendance, payment, and retention evidence. See `VERIFICATION.md`; unperformed stages remain pending.
