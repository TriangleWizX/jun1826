# CRO opportunities for cold visitors

Date: 2026-10-07  
Route focus: Home, Adult BJJ, Free First Visit, Schedule, and show-up pages  
Main goal: Help a first-time adult visitor book and attend a free first class  
Status: Advisory report. No site code changed.

## The main answer

The site has a good first step. A visitor can meet Sandy, see the room, pick a time, and plan a free first class.

The main chance is to make this path easier to see and easier to trust.

The best first work is:

1. Make the adult path clear on the first screen.
2. State the visit and class steps in plain words.
3. Remove repeat copy around the booking task.
4. Show the right adult time facts from one source.
5. Measure the path from click to show-up.
6. Send one clear show-up plan after each booking.

The site should keep the current offer rules:

- The first step is a 15-minute Free First Visit.
- A visit uses day clothes.
- An adult may train that day after Sandy confirms the class.
- An adult may choose a later day.
- The first class is free.
- Sandy matches the partner and pace.
- A waiver is due before training.

These rules come from [`src/_data/free-intro.json`](../../src/_data/free-intro.json:1) and the public booking page. The report does not change them.

## Persona and expert framework

The project persona selector found no ready persona that fit this full task. I used an ordinary CRO specialist lens with the ready content guide.

- Role: task-specific CRO and funnel analyst
- Persona: none selected
- Instruction asset: `INSTRUCTIONS - CONTENT`
- UUID: `6e94db8f-e23d-4387-8cc6-bac209e890aa`
- Source: `assets/indranet-prompt-exporter/exports/index.json`
- Fit: clear value, simple copy, audience fit, next-step order, fact checks, and mobile use
- Limits: the asset is a content guide. It does not prove user data, booking success, attendance, or revenue.

## What a cold adult visitor needs to know

A new adult visitor asks five short questions:

1. Is this for me?
2. What happens first?
3. Can I start at my pace?
4. Can I fit this into my week?
5. What do I do after I book?

The page should answer one question at a time.

The clean path is:

`adult fit → 15-minute visit → pick a visit time → Sandy confirms → free coached class → paid plan choice`

The current site already has this path in parts. It spreads the message over many cards, links, facts, and repeat blocks. That can make a small first step feel like a large choice.

## Current funnel map

| Step | Current source | What the visitor sees | Evidence class |
| --- | --- | --- | --- |
| 1. Land | Home or Adult BJJ page | Calm adult fit, room, class, schedule, proof | Source fact |
| 2. Choose | Homepage builder or Free First Visit page | “Who’s starting?” | Source fact |
| 3. Pick a visit time | Progressive booking step 2 | Cal.com calendar and Text Sandy help | Source fact |
| 4. Book | Cal.com event | Booking success state | Browser event in code |
| 5. Get ready | Confirmation, waiver, show-up pages | Clothes, place, time, and next step | Source fact |
| 6. Show | Sandy confirms and tracks the real visit | Visit and class | Operational proof needed |
| 7. Continue | Adult Core Culture or another fit | Price and plan choice | Canonical offer data |

The code sends browser events for several steps. The current business data still marks the full intro funnel as `not-yet-measured`. See [`src/_data/academy-metrics.json`](../../src/_data/academy-metrics.json:10) and [`docs/analytics/funnel-tracking-plan.md`](../analytics/funnel-tracking-plan.md:7).

## Ranked opportunity list

Priority uses this scale:

- P0: fix the meaning or proof before sending more cold traffic
- P1: high value and small to medium work
- P2: useful test after the base path is clear
- P3: later work

| Rank | Priority | Opportunity | Visitor problem | Best first action | Proof needed |
| --- | --- | --- | --- | --- | --- |
| 1 | P0 | Say what the Free First Visit is | A visit and a class can sound like one step | Use one short adult-first visit line beside the main CTA | Compare booking start and support questions |
| 2 | P0 | Fix adult schedule truth | Adult copy omits Thursday while the schedule data lists it | Bind adult schedule summaries to the schedule source | Build and schedule QA |
| 3 | P1 | Make the adult path stand out | Home gives four equal choices and puts Adult third | Test adult-first order and adult copy for adult traffic | Lane-level funnel data |
| 4 | P1 | Reduce repeat copy before booking | The Free First Visit page says the same story many times | Keep one short promise, one process block, and one FAQ | Mobile task time and completion |
| 5 | P1 | Show the chosen lane in step 2 | A visitor picks Adult, then sees another full lane choice | Show “Adult 18+ selected” with a Change link | Lane change rate and completion |
| 6 | P1 | Make the calendar state clear | “Choose your time” can mean a class time | Say “Choose your Free First Visit time” | Calendar start and completion |
| 7 | P1 | Build a real show-up path | A booking event does not prove a visit or class | Join booking, confirm, show, and class records | Trusted staff or booking ledger data |
| 8 | P1 | Put adult proof near the adult CTA | Adult proof exists, but the first-visit route has mixed proof | Use one checked adult quote or room proof | Permission and source check |
| 9 | P2 | Make price easy to read | Many price views can make the first plan hard to pick | Show the adult first-term range after the first visit promise | Canonical price QA |
| 10 | P2 | Test the help path | Some cold visitors need a person before a calendar | Keep Text Sandy beside the main action | Text clicks and later bookings |
| 11 | P2 | Improve calendar fallback | The external calendar can fail or take time to load | Keep retry, new-tab, and text paths easy to see | `calendar_load_failed` rate |
| 12 | P3 | Add local arrival proof | A second-floor visit can cause day-one doubt | Show Main Street, second floor, and parking near the show-up step | Show-up questions and arrival rate |

## Opportunity 1: Say what the first step is

### What is true now

The home hero says “Meet Sandy for a free visit.” It also says “plan your first class.” The adult route says “Your first BJJ class has a clear path.” The booking page then says “See first-visit times.” The page later says “Your first class is free.”

All of these lines can be true. A cold visitor still has to join them.

Sources:

- Home hero: [`src/partials/home-conversion-shell.html`](../../src/partials/home-conversion-shell.html:640)
- Adult hero: [`src/partials/program-conversion-adults.html`](../../src/partials/program-conversion-adults.html:2)
- Booking steps: [`src/free-bjj-intro-tannersville-ny/index.html`](../../src/free-bjj-intro-tannersville-ny/index.html:139)
- Canonical offer: [`src/_data/free-intro.json`](../../src/_data/free-intro.json:3)

### Why this matters

Cold visitors act when the first step feels small and clear. “Free visit” can sound like a class. “First class free” can sound like the calendar should book the class at once.

### Recommended copy

Use this near the adult CTA:

> Start with a 15-minute Free First Visit. Meet Sandy, see the room, and pick your next step. Adults may train after the visit when Sandy confirms the class. Your first class is free.

Short button:

> Reserve Free First Visit

Small help line:

> Text Sandy if you have a question.

Keep the source data as the owner. Do not make a new copy source for the same rule.

### Test

Test the current copy against the short version above on the home and adult routes.

Primary measure: `lane_resolved` to calendar availability.  
Guardrail: `booking_completed`, staff questions, and confirmed visits.

This is a hypothesis. The source has no lift data.

## Opportunity 2: Fix adult schedule truth

### What is true now

The current schedule source lists adult classes on Monday, Tuesday, Wednesday, Thursday, and Friday at 6:00 PM, plus Saturday Adult No-Gi at 10:30 AM. See [`src/_data/schedule.json`](../../src/_data/schedule.json:43).

The adult program quick links say “6:00 PM Weekdays” and “Saturday 10:30 AM No-Gi.” The adult data summary lists Monday, Tuesday, Wednesday, and Friday, plus Saturday. It leaves out Thursday. See [`src/partials/program-conversion-adults.html`](../../src/partials/program-conversion-adults.html:2), [`src/_data/programs.json`](../../src/_data/programs.json:36), and [`src/index.html`](../../src/index.html:137).

### Why this matters

An adult who can train on Thursday may think the class is closed. An adult who sees two schedule claims may ask which one is right. Cold visitors need one clear answer.

### Recommended action

Use one data path for:

- adult page chips
- home schedule table
- program summary data
- schedule page
- booking help text

Use the wording that the current source supports:

> Adult classes meet at 6:00 PM Monday through Friday. Saturday Adult No-Gi meets at 10:30 AM.

Run the schedule QA after the change. Do not add a Thursday class by hand in one page. The current schedule source is the authority.

### Test

Check the rendered home page, adult page, schedule page, and booking help at mobile and desktop sizes.

Pass rule: the same active adult slots appear in all four views.

## Opportunity 3: Make the adult path stand out

### What is true now

The home builder gives equal cards to Child, Teen, Adult, and Family. Adult is the third card. The adult card says “Feel capable again” and “Start as a beginner at a calm, coach-guided pace.” See [`src/partials/home-conversion-shell.html`](../../src/partials/home-conversion-shell.html:699).

The site serves more than adults. The home page should keep all main lanes. Adult-first work should focus on the adult visitor’s path.

### Recommended action

Test two versions for adult traffic:

Control:

- Keep the four current choices.
- Keep Adult in its current place.

Test:

- Show Adult first for adult page and adult campaign traffic.
- Use a short line under Adult: “Start with a calm, coached first class.”
- Keep Child, Teen, Family, and help paths easy to find.

Do not claim that adult-first wins until the lane data proves it.

### Test

Use a stable experiment ID. Keep the same booking URL and the same lane value. Compare:

- adult card click rate
- adult calendar view rate
- booking completion
- confirmed visit rate
- first-class attendance

Keep youth and family data as guardrails.

## Opportunity 4: Reduce repeat copy before booking

### What is true now

The Free First Visit route repeats the visit story in the calendar step, confirmation state, visit proof, FAQ, and adult options block. Examples appear at lines 76, 105, 145, 197, and 238 in [`src/free-bjj-intro-tannersville-ny/index.html`](../../src/free-bjj-intro-tannersville-ny/index.html:67).

The repeated copy uses the same source data. That protects fact truth. It can still add reading work.

### Recommended page order

1. Short promise.
2. Adult lane choice.
3. Free First Visit time choice.
4. One three-step visit block.
5. One adult preparation block.
6. One FAQ block.
7. One final CTA.

Keep the room photo near the first decision. Keep the calendar as the main task.

Use one short process block:

1. Meet Sandy for 15 minutes.
2. See the room and talk about your goal.
3. Pick a class plan. Your first class is free.

Add the adult rule below it:

> Adults may train that day when Sandy confirms the class. You can choose a later day.

### Test

Use a mobile first viewport at 390 by 844 pixels. Check:

- the main action is easy to see
- the adult choice is easy to tap
- the page has one clear next step
- the calendar has a clear loading area

Do not turn every hidden section on at once. The page has useful content that can still compete with the task.

## Opportunity 5: Keep the chosen adult lane visible

### What is true now

The visitor picks an adult in step 1. Step 2 shows a second “Who’s starting?” group with Adult, Child, Teen, Family, and Not sure. The code uses this group to change the path. See [`src/free-bjj-intro-tannersville-ny/index.html`](../../src/free-bjj-intro-tannersville-ny/index.html:67) and [`js/progressive-booking.js`](../../js/progressive-booking.js:200).

### Recommended action

For the first view of step 2, show:

> Adult 18+ selected

Then show a small:

> Change who is starting

Keep the full lane choices behind that action. This keeps recovery easy and removes a second full choice from the main path.

### Test

Compare the current group against the selected lane label.

Measure:

- time from lane click to calendar ready
- lane change rate
- calendar view rate
- booking completion

Check keyboard focus after the Change action. The current script already moves focus when the step changes. Preserve that behavior.

## Opportunity 6: Name the calendar time

### What is true now

Step 2 says “Choose your time.” It loads the Cal.com event `senseisandy/first-visit` and sends the selected lane as `audience_lane`. See [`js/progressive-booking.js`](../../js/progressive-booking.js:57).

The success state says “Your first visit is booked.” It then tells adults to ask to train after the visit. See [`src/free-bjj-intro-tannersville-ny/index.html`](../../src/free-bjj-intro-tannersville-ny/index.html:98).

### Recommended copy

Change the step label to:

> Choose your Free First Visit time

Add one short line:

> This time is for your 15-minute visit. Sandy sets the class time after the visit.

Use the exact adult rule when needed:

> Adults may train that day when Sandy confirms the class. You can choose a later day.

This helps the visitor tell a visit time from a class time.

### Test

Confirm the text stays true for adult, family, youth, and help paths. A shared page should not show adult class rules to a youth-only visitor.

## Opportunity 7: Join the booking path to the show-up path

### What is true now

The browser tracks CTA clicks, lane choice, calendar ready, calendar failure, booking success, and the details submit attempt. See [`js/progressive-booking.js`](../../js/progressive-booking.js:126) and [`src/assets/js/funnel-events.js`](../../src/assets/js/funnel-events.js:91).

The business data says the intro funnel is not yet measured. It defines the stages as reserved, attended, first class attended, and Core Culture started. See [`src/_data/academy-metrics.json`](../../src/_data/academy-metrics.json:10).

### The gap

A browser booking event proves that the provider returned success. It does not prove that Sandy confirmed the visit, that the visitor came, or that the visitor took the first class.

The tracking plan knows this. It keeps `visit_confirmed`, `first_visit_showed`, and `first_class_attended` as trusted operational events. See [`docs/analytics/funnel-tracking-plan.md`](../analytics/funnel-tracking-plan.md:9).

### Recommended action

Create one small adult funnel report with these stages:

1. Qualified adult session.
2. Free First Visit CTA click.
3. Adult lane chosen.
4. Calendar ready.
5. Booking accepted.
6. Sandy confirmed.
7. Visitor showed.
8. First class attended.
9. Adult plan started.

Use a lead or booking ID when the trusted system has one. Keep names, email, phone, and free text out of analytics.

### Important measurement check

The current CRO metric note says `booking_completed` needs a confirmed Calendly event. The current booking script uses Cal.com and `bookingSuccessfulV2`. See [`docs/analytics/CRO_METRICS.md`](../analytics/CRO_METRICS.md:13) and [`js/progressive-booking.js`](../../js/progressive-booking.js:167).

This is a measurement contract mismatch. Resolve it before using `booking_completed` as the main rate. Pick one current provider event. Update the docs and QA together.

## Opportunity 8: Put adult proof beside the adult action

### What is true now

The adult route has two adult quotes. The home route has one adult quote among parent quotes. The Free First Visit route has a quote about a welcoming community. See [`src/partials/program-conversion-adults.html`](../../src/partials/program-conversion-adults.html:5), [`src/partials/home-conversion-shell.html`](../../src/partials/home-conversion-shell.html:765), and [`src/free-bjj-intro-tannersville-ny/index.html`](../../src/free-bjj-intro-tannersville-ny/index.html:224).

### Recommended action

Use one adult proof block near the first adult CTA:

- one short quote
- name and adult role
- source or permission record
- one room image with a clear alt line

Simple label:

> Adults start here too.

Do not add review counts, star counts, or outcome claims until the source and permission are checked. The source has proof text. This report does not treat the text as a new permission record.

## Opportunity 9: Make the first paid choice easy to read

### What is true now

The adult page pulls the first term price from canonical pricing data. The current adult ladder is:

- 1 class each week: $275 for 12 weeks
- 2 classes each week: $550 for 12 weeks
- 3 classes each week: $715 for 12 weeks

See [`src/_data/pricing.json`](../../src/_data/pricing.json:226).

The adult page shows the starting price and the 12-week term. See [`src/partials/program-conversion-adults.html`](../../src/partials/program-conversion-adults.html:24).

### Recommended action

Keep one short price block after the Free First Visit promise:

> Adult plans start at $275 for 12 weeks. Pick one, two, or three classes each week.

Link to the full options page. Keep the current frequency and term rules. Make the Free First Visit the first action. Let price help the visitor decide after they understand the start.

The exact line must stay bound to `pricing.json`. Run volatile-facts QA after any change.

## Opportunity 10: Keep Text Sandy as a calm help path

### What is true now

The home, adult, booking, schedule, confirmation, and show-up pages link to Text Sandy. The contact source lists `(917) 736-8649`. See [`src/_data/contact.json`](../../src/_data/contact.json:1).

### Recommended action

Keep the main CTA first. Place this next to it:

> Text Sandy with a question

Use the canonical SMS link. Keep the message short. Track the click without sending the message from the site.

This path helps people who need a human answer. It does not replace the booking path.

## Opportunity 11: Protect the calendar fallback

### What is true now

The booking script loads the calendar after a lane choice. It shows a loading state. After 15 seconds, it shows retry, open-in-new-tab, and Text Sandy paths. See [`js/progressive-booking.js`](../../js/progressive-booking.js:126).

### Recommended action

Keep these three paths easy to see:

- Retry calendar
- Open in new tab
- Text Sandy

Add a short status line near the calendar:

> Times may take a moment to load.

Do not make a calendar error look like a lack of openings. The current script only says that the calendar failed. The visitor needs a human help path.

### Test

Measure `calendar_load_failed` by:

- device type
- browser
- source page
- adult lane
- campaign

Use this to find a tech issue. Do not use it as a business conversion rate.

## Opportunity 12: Make arrival easy

### What is true now

The site gives the address, second-floor studio note, Main Street parking, waiver link, clothes, and water guidance. The show-up page gives the same plan in a longer form. See [`src/free-bjj-intro-tannersville-ny/index.html`](../../src/free-bjj-intro-tannersville-ny/index.html:160) and [`src/show-up-kit.html`](../../src/show-up-kit.html:1).

### Recommended action

Send one short adult show-up block after booking:

> Your plan
>
> 1. Meet Sandy for 15 minutes.
> 2. Wear day clothes for the visit.
> 3. Bring water.
> 4. Follow the class time Sandy gives you.
> 5. Fill out the waiver before you train.

Add:

> 6045 Main Street, 2nd Floor, Tannersville

Keep the longer Show-Up Kit for people who want more detail.

## Adult-first copy bank

These lines use short words and short sentences. They are draft copy. Each line still needs fact and source checks before a page change.

### Home hero

> Start your first BJJ class with a clear plan.
>
> Meet Sandy. See the room. Pick your next step.
>
> Adults can start with a 15-minute Free First Visit.
>
> Reserve Free First Visit

### Adult page hero

> Adult BJJ in Tannersville
>
> Start with calm coaching and a clear first class.
>
> You can start at your own pace. Meet Sandy, see the room, and pick a class plan.
>
> Reserve Free First Visit

### Adult lane card

> Adult 18+
>
> Start with a calm, coached first class.

### Booking step 1

> Who is starting?
>
> Pick Adult 18+ to see Free First Visit times.

### Booking step 2

> Choose your Free First Visit time.
>
> This time is for your 15-minute visit. Sandy sets the class time after the visit.

### Confirmation

> Your Free First Visit is booked.
>
> Sandy will confirm the plan. Adults may train that day when Sandy confirms the class.

### Human help

> Have a question? Text Sandy.

Avoid new claims about results, class size, openings, or outcomes in this copy bank.

## Test plan

Run tests in this order. Keep one main change in each test.

### Test A: Visit meaning

Control: current Free First Visit copy.  
Test: short 15-minute visit copy.  
Main measure: adult calendar view.  
Guardrails: booking accepted, confirmed visit, support questions.

### Test B: Adult lane order

Control: current four-card home order.  
Test: adult-first for adult traffic only.  
Main measure: adult lane choice.  
Guardrails: youth and family lane choice, booking accepted.

### Test C: Step 2 state

Control: full second lane group.  
Test: selected adult label plus Change link.  
Main measure: calendar ready.  
Guardrails: lane change, keyboard focus, mobile use.

### Test D: Adult proof

Control: current proof placement.  
Test: one checked adult quote beside the adult CTA.  
Main measure: adult CTA click.  
Guardrails: calendar view, booking accepted, proof permission.

Do not call a test a win from clicks alone. The target is a confirmed adult visit and a first class attended.

## Measurement plan

### Event chain

Use this chain for adult visitors:

`qualified_adult_session → first_visit_cta_click → lane_selected → availability_viewed → booking_completed → visit_confirmed → first_visit_showed → first_class_attended → core_purchased`

Keep the current privacy rule. Do not send names, email, phone, child names, health data, or free text to analytics.

### Fields to keep

- lane
- source page
- campaign
- town when known
- CTA location
- provider event name
- booking reference present
- device class
- experiment ID and variant

### Fields to keep out

- name
- email
- phone
- free text goals
- child name
- medical detail

### Rates

Use distinct sessions or lead IDs when the trusted system has them.

1. CTA click rate = CTA clicks / qualified adult sessions
2. Calendar view rate = calendar views / CTA clicks
3. Booking rate = accepted bookings / calendar views
4. Show rate = showed visits / confirmed visits
5. First-class rate = first classes / showed visits
6. Start rate = Core Culture starts / first classes

Appointments in the future are still open. Do not call them no-shows.

## Facts, hypotheses, and unknowns

### Confirmed in current source

- Sensei Sandy BJJ is at 6045 Main Street, 2nd Floor, Tannersville, NY 12485.
- Adult eligibility is 18+.
- The Free First Visit starts with a 15-minute visit.
- Adults may choose same-day training after Sandy confirms the class.
- Adults may choose a later day.
- The first class is free.
- The current Cal link is `senseisandy/first-visit`.
- Adult pricing is stored in `src/_data/pricing.json`.
- Active schedule slots are stored in `src/_data/schedule.json`.
- Text Sandy uses the canonical contact number.

### Strong source findings

- The adult summary omits Thursday while the current schedule source lists Thursday.
- The Free First Visit page repeats the visit story in several blocks.
- Step 2 repeats the full lane choice after step 1.
- Calendar error, retry, and text fallback paths exist in the script.
- Browser events exist for key booking states.

### Hypotheses to test

- Adult-first home copy may help adult cold traffic.
- A shorter visit promise may help people reach the calendar.
- A selected lane label may lower choice work.
- One adult quote near the adult CTA may build trust.
- A clear visit-time label may lower booking questions.

### Still unknown

- Current adult cold-session volume.
- Current adult CTA-to-booking rate.
- Current booking-to-confirmed rate.
- Current confirmed-to-show rate.
- Current show-to-first-class rate.
- Current first-class-to-paid-start rate.
- Current calendar failure rate by device.
- Which adult copy or proof block performs best.
- Whether every adult quote has current permission for public use.
- Whether the Cal.com event marks a final accepted appointment in every case.

## Suggested work order

### Pass 1: Truth and measurement

1. Fix the schedule source mismatch.
2. Reconcile Cal.com event names with CRO metric docs.
3. Confirm the trusted source for Sandy confirmation and attendance.
4. Build the adult funnel report.

### Pass 2: Small copy and task fixes

1. Add the short visit meaning line.
2. Rename the calendar time step.
3. Show the selected adult lane in step 2.
4. Keep the Text Sandy path beside the main action.

### Pass 3: Adult-first experiment

1. Test adult order for adult traffic.
2. Test one adult proof block.
3. Keep all lane and provider contracts the same.
4. Review confirmed visits and first classes.

### Pass 4: Page trim

1. Reduce repeated visit copy.
2. Keep one process block.
3. Keep one adult prep block.
4. Keep one FAQ block.
5. Recheck mobile and desktop layouts.

## Definition of done

The report is complete when:

- Each recommendation points to a current source.
- Facts, hypotheses, and unknowns stay separate.
- Adult visitors remain the main focus.
- Draft customer copy uses short, plain lines.
- Prices, times, eligibility, contact data, and booking URLs stay source-owned.
- The plan measures booking, confirmation, show-up, and first class as separate stages.
- The report names the Cal.com and metric-doc mismatch.
- The next work has clear test and pass rules.

## Validation used for this report

- Read current worktree source and canonical data.
- Checked current Git status before writing.
- Confirmed the codebase-memory index is ready for `home-twizss-Documents-ssbjjweb-tmb`.
- Attempted graph discovery first. The MCP graph transport closed, so string and non-code source checks used `rg`, `sed`, and line-numbered reads.
- Read the repository CRO, readability, and stop-slop guidance.
- Ran the project persona route. No suitable persona was ready. Used the ordinary task specialist and the ready content asset.
- No live HTTP check was run.
- No browser booking test was run.
- No site code, price, schedule, booking URL, or deployment file was changed.

## Source index

- [`src/_data/free-intro.json`](../../src/_data/free-intro.json:1)
- [`src/_data/schedule.json`](../../src/_data/schedule.json:43)
- [`src/_data/pricing.json`](../../src/_data/pricing.json:226)
- [`src/_data/business.json`](../../src/_data/business.json:1)
- [`src/_data/contact.json`](../../src/_data/contact.json:1)
- [`src/_data/academy-metrics.json`](../../src/_data/academy-metrics.json:1)
- [`src/partials/home-conversion-shell.html`](../../src/partials/home-conversion-shell.html:631)
- [`src/partials/program-conversion-adults.html`](../../src/partials/program-conversion-adults.html:1)
- [`src/free-bjj-intro-tannersville-ny/index.html`](../../src/free-bjj-intro-tannersville-ny/index.html:15)
- [`js/progressive-booking.js`](../../js/progressive-booking.js:1)
- [`src/assets/js/funnel-events.js`](../../src/assets/js/funnel-events.js:1)
- [`docs/analytics/funnel-tracking-plan.md`](../analytics/funnel-tracking-plan.md:1)
- [`docs/analytics/CRO_METRICS.md`](../analytics/CRO_METRICS.md:1)
