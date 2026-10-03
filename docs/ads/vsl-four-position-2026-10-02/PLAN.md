> Creative direction superseded by [the outcome-led shoot draft](../vsl-outcome-shoot-order-2026-10-03/SHOOT-ORDER.md). Retain this document as prior planning history; use the new script for recording.

# A clear first class, then four positions in fourteen days

Internal plan, October 2, 2026. Student copy is in [SCRIPT.md](SCRIPT.md). This iteration supersedes the October 1 VSL's arrival, clothing, learning promise and paid-next-step wording. Existing recordings remain useful assets; see the retake map below.

## 1. The decision

Lead with **a coached way to understand the four main positions in Jiu-Jitsu**. The free first class lets a local adult try the teaching. The next three classes belong to the paid plan they choose. The aim is four attended classes within fourteen days of the first class, with a simple learning check for each position.

User decisions for this iteration:

- Beginner Ben is the main viewer. Adult parents and families are supporting viewers.
- Class one is free. Classes two through four use a chosen paid plan. This is not a new four-class free public offer or a stand-alone three-class paid pack.
- The four positions are **standing, guard, chest to chest, chest to back**.
- Student-facing words must be at grade 3 or below.
- Adults complete a required fifteen-minute goal-setting visit. They may choose their free first class that same day, after the visit, once Sandy confirms the arrangement. A later class remains an option.
- Use existing class footage and Sandy's own voice. The user selects footage; this plan does not claim to have reviewed it.

The offer is one clear start and a path to understand the game. Four attendances create four chances to learn. Attendance alone does not prove understanding, so the coach checks both.

## 2. What changed from the first VSL

| Earlier draft | Revised plan | Why it matters |
|---|---|---|
| Broad reassurance about learning at a calm pace | A named learning map: four positions, each with a clear task | Gives Ben something concrete to look for and return to |
| A visit followed by a class on a later day | Required visit, with an elective coach-confirmed class on the same day | Can reduce a second trip; does not solve all family/transport needs |
| Day clothes as the general instruction | Day clothes for visit-only; clean sports clothes plus Sandy's class-specific instructions for training | Prevents a same-day guest arriving unprepared |
| End at “reserve a visit” | Request → Sandy confirms → first class → paid choice → dated classes 2–4 → learning check | Links the video's promise to delivery |
| Fourteen days as an attendance target | Four positions as the learning purpose; attendance and understanding tracked separately | Gives the target a student benefit |
| Generic family overview | Adult learning first; brief separate youth context | Keeps Ben's decision clear |

The new copy still uses the supplied VSL structure: promise and concern, visible proof, plan, five concerns, next action. The concerns are embedded in the learning story: knowing what to do, feeling ready, partner pace, time/cost, and family fit. They are not a measured ranking of local objections.

## 3. Current facts and limits

| Item | Current evidence | Use in this plan |
|---|---|---|
| Required first visit; adult same-day training elective; Sandy confirms | `src/_data/free-intro.json` | Explicit in S02 and S08 |
| Free first class | Same source, `firstClassFree: true` | Explicit in S01 and S06 |
| Consent, waiver, partner matching; live practice optional; pause/end available | Same source, `adultFirstDay` | Delivered before training; pace/choice shown in S05 |
| Adult group choices | `src/_data/schedule.json` | Check actual class/space for every plan; no standing time guarantee in the VSL |
| 1/2/3-per-week paid ladder; older fixed three-per-week terms also remain | `pricing.json`, `offers.json`, `content/offers.json`, offer specification | State paid choice clearly; resolve exact written price/frequency terms before quoting or taking payment |
| Member-invited first-time adults have a separate four-free-class Mountain Tap Card (program label MTP, tracked primarily by referring friend) | `src/_data/referrals.json` | Keep separate from this public one-free-plus-paid offer |
| Intro funnel, completion and renewal data are not yet measured | `src/_data/academy-metrics.json` | Establish counts; make no improvement claim |
| Ben's time/family concerns are owner-reported hypotheses | `docs/ads/paying-customer-avatar-audit-2026-09-28.md` | Useful planning context, not a population survey |

### Source conflicts that must not leak into the video

`pricing.json` has duplicate `frequencyLadder` keys. Adult three-per-week twelve-week pricing is $687.50 in the ladder but $715 in the legacy adult record and older approved content/specification. Annual totals also differ. The older specification declares precedence but does not reflect the newer ladder. This task does not resolve those business records by choosing the convenient price.

Therefore: keep numeric paid prices out of recorded copy; S06 says the plans and prices are reviewed before the student chooses. Before any real enrollment, Sandy must provide one reconciled written offer with price, term, frequency and inclusions. An existing pricing-page link alone does not resolve the source conflict. The publicly described two-per-week ladder is a planning candidate, not proof that any specific seat is available.

The older `docs/ssbjj-show-up-and-intro-playbook.md` includes a 14-Day Mat Guarantee, show-rate guarantees, unsupported outcome claims and access language that conflict with current sources. Do not reuse those promises. The remembered September 22 fourteen-day protocol is absent from this checkout. Its old approval is not used as evidence that this new cadence is running.

The first-term Training Fit Guarantee has separate four-classes-in-thirty-days conditions and eligibility. It is not the fourteen-day learning plan. The free trial is not automatically a qualifying paid-term guarantee attendance. Link to complete current terms during enrollment; omit guarantee sales copy here while source wording remains inconsistent.

## 4. Stack help around the next problem

Present the stack in the order Ben uses it. Each item needs a person, action and proof of delivery. Avoid made-up dollar values and a long list of unrelated extras.

| Ben's problem | Useful part of the offer | When he gets it | Delivery evidence |
|---|---|---|---|
| “What happens when I arrive?” | Fifteen-minute goal-setting visit, room and safety walkthrough | Before class; can be the same trip | Staff visit record and confirmed arrival plan |
| “What do I do on the mat?” | Coach-led first task and suitable partner | Free first class | Observed cue → attempt → feedback |
| “Can I control the pace?” | Explained choices, matched practice, pause/end option | Before and during practice | Coach explains and honors the choice |
| “What am I learning?” | Four-position map with one task per position | Preview in class one, focus across four classes | Position learning record |
| “What comes next?” | Four-date starting plan, including the free first class | After a voluntary paid choice | Actual confirmed dates and one next action |
| “How do I get there prepared?” | Existing directions, waiver and Show-Up Kit | After confirmation, with route-specific clothing | Actual sent details; correct links |
| “Will I know if it makes sense?” | Short show/name/goal/try check with reteaching | During classes and after class four | What the student showed, help used, next task |

The first three rows are grounded in current entry policy. The four-position focus and learning checks implement the user's requested plan; the date card and proposed follow-up timing below are delivery design, not claims of past service. Use existing included class time, not a newly promised private lesson.

Paid Core Culture can add its confirmed class plan, progress feedback and first qualifying enrollment uniform under actual terms. Explain those after the free class as paid inclusions. Practice videos can support paid learning only when the resource and access are actually available. Do not stack laundry, storage, private lessons, extra uniforms, premium video review or an invented bonus value into this starter offer.

The strongest reduction in effort is a clear next date and a known first task. The strongest proof is a real adult being coached. More discount is not required for this iteration.

## 5. Four classes with a learning purpose

Preview all four positions briefly in class one so a student does not leave thinking Jiu-Jitsu is only standing. Each of the four classes then has one main position focus. Sandy chooses the actual game/drill, partners and safe limits. These tasks fit into an appropriate class; they are not a promise to change the entire group curriculum for each new student.

| Class | Main position | Student words | Coach checks |
|---|---|---|---|
| 1, free | Standing | “We are both on our feet. Find your base.” | Recognizes both people standing; states the assigned goal; tries the selected task with suitable help |
| 2, paid | Guard | “Use your legs to make space. Or work to get past the legs.” | Recognizes the leg-based control/barrier; can describe the two roles and try the assigned task |
| 3, paid | Chest to chest | “Hold from the top. Or work to make space.” | Recognizes the demonstrated top/bottom pin; can state the role's goal and try the assigned task |
| 4, paid | Chest to back | “Hold from behind. Or turn to face your partner.” | Recognizes rear control; can state both roles' goals and try a coach-selected task |

Coach note: the phrases simplify a rich sport. The demonstration supplies the shape and context. Guard includes many forms; chest-to-chest should be shown with a clear example such as the coach's chosen pin, not defined solely by “one person on top.” Chest-to-back means rear control, not any accidental back contact. These labels do not prescribe a throw, submission, escape, or unsupervised drill.

### Check understanding, not just attendance

After each focus, ask the student to name the position, say their task, and show a coached attempt. At class four, show all four examples in a mixed order with the labels hidden. Ask:

> Show me the four spots. Name each one. What is your goal? Show me one thing you can try.

Record each position as `needs another look`, `can explain with help`, or `can explain and show the assigned task`. Record how much help was used. A rehearsed repeat of Sandy's words is not the same as identifying a new example.

The working understanding check requires recognition and a correct basic role/goal for all four; the practical attempt is observed within Sandy's safe task. No claim of independent mastery, self-defense ability, rank or fitness follows. If a position is unclear, give one cue, show it, let the student try, and check it again in another included training moment. Keep the gap visible. This does not create extra free classes or a results guarantee.

Plan a brief focused check within class time, initially about 3–5 coach minutes per session as a workload estimate. If the actual class cannot support that attention, adjust starts or staffing before advertising a personal promise. The student can pause or opt out of practice; use explanation/observation and record what remains unobserved.

## 6. Build a real fourteen-day calendar

**Day 1 is the first attended class. Day 14 is that New York calendar date plus thirteen days, inclusive.** A form, visit-only appointment, reservation or video view does not start the learning window.

Example only, checked against the current recurring adult schedule: class 1 Monday October 5; class 2 Wednesday October 7; class 3 Monday October 12; class 4 Wednesday October 14. The target window ends Sunday October 18. These are proposed dates, not held seats. Sandy checks class-specific gear, special dates, actual space, placement and the student's comfort before confirming.

| Point | Action | Completion evidence |
|---|---|---|
| Before travel | Confirm the visit arrival time and whether the student chose same-day training; confirm class time separately | Sandy's explicit confirmation |
| At class 1 | Preview the four positions; teach standing focus; record actual attendance | Staff attendance + first learning check |
| After class 1 | Ask what felt clear and what they want help with; review paid terms; let them choose | Actual choice, not an assumed enrollment |
| Once paid continuation is chosen | Plan classes 2–4 inside the target window; confirm permitted frequency and actual space | Written dates linked to valid access |
| Before leaving classes 2 and 3 | Check that the next date still fits; note the next position/task | One confirmed next class |
| After class 4 | Review all four positions and choose the next training rhythm | Learning checks plus attendance count |

Aim to finish before the last day so there is room to request a replacement if needed. A possible replacement is not an extra booked seat or an added class entitlement. A one-per-week plan does not support the proposed four-class rhythm reliably; discuss a suitable confirmed plan rather than giving unapproved extra classes.

Fourteen days is an activation/learning target on this paid path, not a deadline that forfeits paid access. A missed target does not alter the chosen program's term. If work, illness, comfort, weather or class space changes the plan, record the reason, retain the original result and agree a revised schedule under the actual terms. Do not rush or stack difficult sessions to make a metric pass.

## 7. Turn a request into a show

Sandy owns each next step. If another person covers replies, name that person and the actual coverage time. A proposed five-minute response target applies only during real coverage; it is not a public 24/7 service promise.

| Trigger | Action | Proposed timing | Proof |
|---|---|---|---|
| Request arrives | Ask adult goal and workable days; check same-day preference | Next staffed opportunity | Actual reply timestamp |
| Suitable slot found | Send visit time, class time if chosen, clothing, entrance/directions and waiver | Once Sandy confirms | Confirmed details, distinct from request receipt |
| Appointment is tomorrow | One helpful reminder in the agreed channel; avoid duplicating existing reminders | About a day before | Sent record; reply if received |
| Same-day booking | Use the confirmation as the reminder | At confirmation | Clear final plan |
| Student arrives | Greet, complete goal setting and waiver checks; explain training choices | Before class | Visit record and class plan |
| Class ends | Ask one learning question and agree the next step | Before departure where practical | Learning note, decision and next date |
| A confirmed class is missed | Ask whether a new time would help; check real space | Next staffed opportunity | Reply or closed follow-up |
| Class four / day fourteen review | Check attendance, all four positions and next rhythm | At class four, or a welcome follow-up if needed | Review and next step |

Use the exact short messages in SCRIPT.md. They are drafts to send only after their facts are true. Nothing in this task sends a message or installs an automation. Existing `/show-up-kit`, `/bjj-tannersville-ny-directions`, `/waiver` and `/schedule` are useful links, but class-specific confirmation controls clothing and arrival.

For unconfirmed public inquiries, propose one helpful check after one or two days and a final check around day seven if welcomed. Stop when declined or opted out. Avoid five stacked reminders for a simple local visit. A reply saying “yes” is useful preparation; it still is not attendance.

## 8. Local impact and distribution

Lead with Tannersville and the mountaintop in Sandy's spoken opening. Show the real entrance and room. Use Hunter, Windham, Haines Falls and Catskills naturally in the supporting caption/page context when relevant, not as a spoken town list.

Local value is practical: a known person, a known room, a clear route upstairs, a confirmed time, and the option to visit and train in one trip. The academy is on the second floor according to `contact.json`; show the actual entrance/access route. Do not promise parking spaces, short drive times, childcare or a solved parent pickup problem. A parent can discuss separate class needs, but youth are not included in the adult's trial or paid plan.

Proposed distribution order:

1. Finish the long VSL and a 16–30-second adult discovery cut. Lead the short cut with one position and the free first-class invitation.
2. Use the current public Free First Visit route, `/free-bjj-intro-tannersville-ny#booking-flow`. Retain its identifiers and provider contract. Website CTA: `Reserve Your Free First Visit`.
3. For the social cut, use `Comment START for the link.` Have the existing reply owner supply the right public link and confirm what happens next. Use `#catskills #bjj #tannersvilleny #hudsonvalley` and location `Tannersville, New York`. This beginner converter uses no lineage tag.
4. Share the long video through the existing inquiry/confirmation path when useful, with permission. The viewer should not need to watch it to keep an appointment.
5. After delivery works, consider additional local placements. This plan does not authorize paid spend, business outreach, group posting or publication. No unverified “best posting time” is asserted.

Measure requests that become attended classes and learning progress. Local views alone do not establish impact. The existing payer audit supports testing practical time/fit language, not claiming market demand or a demographic result.

The approved Mountain Tap Card (program label MTP, tracked primarily by referring friend) remains separate: first-time adult guests invited by a member have four free classes under its own terms and fixed pass window. It is not the public paid-continuation plan. Its referral attribution is tracked by referring friend name/phone on `/bring-a-friend`. Do not expand it, reset a guest's window, add a child to it or present the member's $35 credit as a guest bonus.

## 9. VSL production and retakes

The new eight-section script is about three minutes before proof pauses. Time Sandy's real read. First film the talking-head sections; use that sound under existing class footage, as in the InShot walkthrough.

| Section | New job | Footage and overlay | Reuse/retake |
|---|---|---|---|
| S01 | Local adult promise: learn four key spots | Sandy + clear adult task; `Learn four key spots` | Retake the new hook |
| S02 | Visit, elective same-day class, correct clothes | Sandy + room/entrance; `Meet Sandy. Plan your first class.` | Retake to correct the old instructions |
| S03 | Standing and guard | Clear wide shot of each with the label visible | New position script; retain old fitness section as optional extra |
| S04 | Chest to chest and chest to back | Clear example of each; preserve both bodies in frame | New position script; old beginner reassurance can be a later clip |
| S05 | Coach, partner, pace and choice | Cue → attempt → feedback; `Your pace. Your choice.` | Existing calm take may work; add the elective/pause line if absent |
| S06 | One free class, paid next three, purpose and dates | Sandy + blank four-date card; `1 free class + 3 on your paid plan` | Retake; paid distinction is essential |
| S07 | Brief family relevance | Separate adult/youth coaching; `A start for each learner` | Earlier family take can work if accurate and permitted |
| S08 | Ask, then Sandy confirms | Sandy looking into lens; canonical CTA | Retake concise same-day invitation |

Footage to find: four unambiguous position examples plus one coherent adult teach/try/feedback sequence. Labels must match the actual body relationship. Sandy can demonstrate missing positions with an appropriate consenting adult; label that as a demonstration, not a first-timer result. Youth footage is secondary and needs intended-use permission. The optional Sandy Challenge is not needed as the main hook or proof for this beginner learning offer.

Keep the four-position overview visual and short. Use real class sound only where clear and appropriate; maintain Sandy's voice track otherwise. InShot order stays S01–S08. Add the four position names as short labels at the matching shot, and accurate captions for speech. Show the free/paid distinction in S06 for long enough to read, not tiny legal text.

## 10. Score what actually happened

Use the existing restricted customer/attendance records. Add learning observations there; do not create another customer ledger in this repository. The Shiney Ticket uses its existing separate referral/attendance records. Report anonymous counts in shared analysis.

| Measure | Numerator / denominator or record | Important rule |
|---|---|---|
| Request-to-confirmed-first-class | Unique adults with a Sandy-confirmed first class / unique adult requests in the same intake cohort | Visit-only confirmation does not count as class confirmation |
| First-class show | Attended first classes / confirmed first classes whose date has passed | Exclude future bookings; show canceled/rescheduled cases beside the count |
| Visit-only conversion | Visit-only attendees who later attend class / visit-only attendees with sufficient follow-up | Track separately so same-day entry does not hide this gap |
| Paid choice | Starters who choose a paid plan / free-class starters, with observation window stated | Payment/enrollment evidence, not a verbal assumption |
| Four-in-fourteen | Starters with four distinct attended classes in the window / all free-class starters whose window has ended | Include people who did not buy; also show a paid-continuation subset |
| Position understanding | Students who meet the four-position check / students actually assessed | Report assessed / due and missing assessments too |
| Joint success | Mature starters with both four attendances and a completed understanding check / all mature starters | Prevents high attendance masking a learning gap |
| Later continuation | Actual later attendance and chosen plan, at a stated follow-up date | Four-in-fourteen is not proof of long-term retention |

Keep actual class dates, unique session identifiers, help level for each position, paid access choice, next agreed date, and factual reasons a plan changed. A waived/canceled booking or room tour is not a class. Do not put health details, names, contacts or payment data into these public-workspace documents.

Examples to check the definitions:

- October 5, 7, 12 and 14 attended: four-in-fourteen passes; understanding still needs a separate check.
- October 5, 7, 12 and 19 attended: four classes, but the fourteen-day target ending October 18 is missed.
- October 5 first visit only, October 7 first class: learning window begins October 7, ending October 20.
- Three attendances plus a fourth reservation: three attended, not four.
- Four attendances with guard still unclear: attendance target met, learning target pending; reteach under paid access.

Use raw counts before percentages. For a small local pilot, one more person can move the rate sharply. Establish a baseline rather than borrowing the old playbook's 85% show or 75% close claims. Log which script and offer each cohort saw. Start with the feasible free-class flow; change one major element after observing the weakest stage. Do not call a small sequential comparison a proven A/B lift.

## 11. Workload, cost and review

Four classes consume real space and coaching. Before each new start, check not only the free-class seat but the practical paid follow-up choices. The four-position checks add an estimated 12–20 focused coach minutes across four sessions per learner if each takes 3–5 minutes. Measure the real time and whether it fits class staffing; these are planning estimates, not current capacity.

The public path's incremental acquisition cost includes the free class/visit's marginal delivery cost, actual response time and any attributable creative/spend. The next three attendances are paid-program delivery, not three new free trials. Do not count the full paid plan's revenue as profit; subtract refunds, fees, uniform and paid-term delivery costs. Do not invent a three-class price by multiplying an average per-class rate. Keep Shiney reward costs separate from this public flow.

Review once a week for about fifteen minutes: requests, confirmations due, first-class shows, paid choices, mature fourteen-day results, learning gaps, upcoming dates and staff load. Prioritize the earliest weak step:

- Requests but few confirmations: clarify response and actual times.
- Confirmations but low shows: inspect arrival instructions and expectation match.
- Shows but low continuation: listen for goal/schedule/price fit; inspect teaching experience.
- Paid starts but missed repeats: confirm realistic dates and follow-through.
- Attendance but weak recognition: change demonstration/task/check, not just reminders.

## 12. Concrete next actions

1. Use SCRIPT.md as the current recording copy. Retake S02 and S06 first because they change the offer facts; then the four-position blocks and hook.
2. Choose one clear clip for each position. Use the existing shortlist; keep private source details on the user's device.
3. Sandy prepares a real same-day arrival/class example and a four-date continuation example, with confirmed paid terms and availability.
4. Prepare the date/learning card below and the confirmation message. Test with an internal fictional example; do not submit a live booking as a test.
5. Build and review the cut in InShot. Publication and actual operational delivery remain later work.

### Simple private starting card

```text
MY FIRST FOUR CLASSES

1. Standing       Date: ______  First class: free
2. Guard          Date: ______  Paid plan: ______
3. Chest to chest Date: ______
4. Chest to back  Date: ______

Sandy confirms each class and space.
My fourteen-day check date: ______
My next class: ______

Show the spot. Name it. Say your goal.
Try one task with Sandy's help.
```

Dates are confirmed only when Sandy has checked them. This card summarizes the chosen plan; it is not a voucher, new product or promise of added access.

## 13. Persona & Expert Framework and verification

Contextual routing returned no suitable overall coordinator role. The host uses a disclosed conversion/operations specialist approach, retaining the fully read Alex Turner copy role (`a9519f7d-8247-4bee-9075-72420110c5bf`, versioned export), Vinnie VSL instructions (`59b0d954-cf57-433a-b31f-d55dd5e1e226`, full index record), and COMPETENCE (`e144b81f-10ea-41a6-a06c-03d69dfb738f`, full index record). Sources live under `assets/indranet-prompt-exporter/exports/`; exact source paths were recorded in the October 1 production plan. All list no required attachments. The index instructions are usable full text despite partial export status for absent notes.

Three read-only workstreams: E2 current evidence/constraints; H3 Hormozi Offers/Closing value and choice; H4 Lead Nurture/Retention delivery and learning checks. Workers wrote no files. Host owns this folder and the narrow superseded notices in earlier VSL documents. Source discovery MCP was unavailable (`Transport closed`); local source inspection supplied evidence. Framework methods were applied through source comparison, a free/paid boundary, visible process proof, concrete next dates, and actual attendance/understanding checks.

Hormozi sources: Offers, Value Equation and Trim & Stack; Closing, understanding concerns and the game plan; Lead Nurture, real response coverage and next appointment; Retention, personal start and early attendance follow-up. These are source methods, not SSBJJ performance data. Full Universal Analyzer-Improver and OptiMax assets were read earlier in the thread and applied to the copy's source checks, friction, warmth and honest footage.

Copy review: Stop-Slop editorial score 44/50 (directness 9, rhythm 8, trust 9, authenticity 9, density 9); no outcome guarantees, false scarcity, negative beginner framing or em-dash copy. Universal Analyzer confirms offer/route/paid distinction; OptiMax connects words to real position footage; Reach Matrix supplies the 16–30-second social cut, START, four tags, location and lineage limit. These are editorial assessments, not audience-tested performance.

Readability uses the saved `check-copy.py`, local CMU pronunciations with visible overrides, and the Flesch-Kincaid formula. Names are included. All spoken blocks and supporting prose must score at or below grade 3 before delivery. Short labels receive manual review. This estimate is not a certified comprehension test; Sandy's show/name/goal/try checks test the learning itself.

Definition of done for this planning task: current policy verified; user-selected free/paid offer preserved; four positions and checks defined; local value and footage strategy specified; full updated S01–S08 and reply copy supplied; show/return cadence and metrics defined; reading estimates and relevant policy QA recorded. This task does not claim a recorded video, attendance improvement, deployed policy change, reconciled paid prices, or delivered learning outcomes.
