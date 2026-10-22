# Workstream 19 — Booking completion: harden the free-intro flow end to end

**Owner:** Codex executes on the laptop; Sandy does the Cal.com dashboard
checks in Task 4 (two minutes, his hands only). Sassafras verifies live in a
rendered browser after deploy.
**Status:** Ready Oct 22, 2026.
**Source:** CRO audit F1 (~/workspace/senseisandy/cro-audit-oct22.md), plus
repo recon Oct 22, 2026 (below).

## RECON — read this first (it corrects the audit's framing)
The booking flow EXISTS and is more built than the audit's text-layer read
could see. Facts from src/free-bjj-intro-tannersville-ny/index.html and
src/_data/contact.json:
- The page runs a 3-step progressive widget: Step 1 "Who's starting?" with
  lanes adult-beginner / child (5–9) / teen (10–17) / family / not-sure;
  Step 2 embeds the Cal.com calendar (cal.com/senseisandy/first-visit) with
  per-lane context copy; Step 3 is a confirmation screen with per-segment
  arrival plans, a waiver CTA, and the "Sandy will reach out!" banner.
- Every "Text Sandy" link renders from `contact.smsHref`, which ALREADY has
  a prefilled body — one generic message for the whole site: "Hi Sandy, I
  have a question."
- contact.json ALREADY contains a Formspree endpoint
  (formspree.io/f/mqazqozk). A hidden `<form id="onsite-booking-form">` sits
  in the booking section, unused by visitors.
So this workstream is NOT "build a booking path." It closes the four real
gaps the trace exposes: the SMS fallback inside the flow is generic and
question-shaped rather than segment-shaped and booking-shaped; nothing
before Step 2 tells the visitor what happens after they book; a visitor who
does not want to pick a time in a calendar has no visible form path despite
the endpoint existing; and it is UNVERIFIED whether the lane a visitor
picks ever reaches Sandy (embed failure modes are likewise untested).
Cal.com is not Calendly: the qa-cal-migration guard bans Calendly embeds
only. Do not introduce any new vendor in this workstream.

## TASK LIST FOR CODEX

### Task 0: Trace the live flow before touching anything
- In a rendered browser (desktop and a mobile viewport), walk all five
  lanes on the live free-intro page. For each: does Step 2's calendar embed
  load and show real times? Does the per-lane context copy swap correctly?
- Complete ONE test booking end to end (label it TEST in every field
  Cal.com offers). Record: what the visitor sees at Step 3; what arrives in
  Sandy's inbox/notification (ask the owner to read it back); what the
  visitor's confirmation email contains; and whether the booking shows
  which lane was picked.
- Also record: does the Cal.com event auto-confirm, or hold for approval?
  What fields does it collect (name, email, phone)?
- **Stop condition:** if the calendar embed fails to load in a clean
  browser on either viewport, that is defect #1 — report it verbatim and
  do Task 5 (fallback hardening) FIRST.

### Task 1: Segment-prefilled SMS inside the booking flow
- Add per-lane SMS bodies and have the bridge JS swap the booking-flow
  "Text Sandy" links to the matching body when a lane is chosen (before any
  choice, and everywhere outside the flow, contact.smsHref stays as-is).
  Bodies (visitor's voice; URL-encode on implementation):
  - Adult: "Hi Sandy, I'd like to book a free first visit for myself (adult)."
  - Child: "Hi Sandy, I'd like to book a free first visit for my child (ages 5-9)."
  - Teen: "Hi Sandy, I'd like to book a free first visit for my teen (ages 10-17)."
  - Family: "Hi Sandy, I'd like to book a free first visit for my family."
  - Not sure: "Hi Sandy, I'd like help picking a free first visit."
- Store the bodies beside the existing free-intro copy data, following the
  repo's canonical-data pattern — not hardcoded in the JS.
- **Acceptance:** after clicking each lane, the flow's Text Sandy link href
  carries that lane's body; the generic link elsewhere is unchanged.

### Task 2: Process-promise line (what happens after you book)
- Add one line directly under the Step 1 intro and a short repeat at
  Step 2, copy finalized from Task 0's facts. Default copy (use unless
  Task 0 contradicts it): "Pick a visit time here. Sandy gets your booking
  right away and reaches out by text before your visit." If Task 0 shows
  bookings hold for Sandy's approval, use: "Pick a visit time here. Sandy
  confirms each visit himself and texts you before your visit."
- House copy rules apply (positive framing, grade 3 or below, no
  em-dashes, no banned tokens). Do not promise a reply TIME (no "within an
  hour") — the owner has not set one.

### Task 3: Visible form fallback — "Send a visit request instead"
- Under the booking flow, add a secondary block: "Rather send a note? Tell
  Sandy who is starting and a day that fits. He will text you back."
- The form posts to the EXISTING endpoint (contact.formspreeEndpoint — read
  it from the data file, never hardcode it). Fields, in order: Your name
  (required); Mobile number (required — label it "Mobile for Sandy's reply
  text"); Who is starting (select mirroring the lanes: Adult 18+ / Child
  5-9 / Teen 10-17 / Family / Help me choose); A day that fits (text,
  optional); Anything Sandy should know (short text, optional). Include a
  hidden source field with the value "free-intro-form".
- Youth privacy by design: the form asks for the PARENT's name and the
  child's age band only — no field asks for a child's name.
- Success state: replace the form with the "Sandy will reach out!" line
  plus one sentence ("Sandy replies by text to the number you gave.").
  Error state: show the segment SMS link as the fallback action.
- Retire or repurpose the hidden onsite-booking-form element as part of
  this task — do not leave two form mechanisms in the section.
- **Acceptance:** one TEST submission (every field marked TEST) arrives by
  email at me@senseisandy.com and the success state renders.

### Task 4: Lane carry-through into the booking record
- From Task 0's evidence: if Sandy's booking notification does NOT show
  the lane, wire it through — pass the selected lane into the Cal.com
  embed/link using Cal.com's supported prefill/metadata mechanism, mapped
  to a "Who is starting" booking question on the event if one must exist.
- **Acceptance:** a second TEST booking (after the fix) shows the lane in
  the notification Sandy receives. If the lane already carried through at
  Task 0, this task is a no-op — say so in the report.

### Task 5: Embed-failure fallback at Step 2
- If the calendar embed has not loaded within a few seconds, Step 2 must
  surface, in place: the external Cal.com link (already present — promote
  it), the current lane's Text Sandy button (Task 1), and a link down to
  the Task 3 form. A visitor must never face a silent empty box.
- Keep the existing <noscript> path working unchanged.

### Task 6: Cal.com dashboard checklist (OWNER — Sandy's hands, ~2 minutes)
Codex prints these for the owner; the owner performs them in Cal.com:
1. Event "first-visit": note whether bookings auto-confirm or need
   approval; tell Codex which (feeds Task 2's copy choice).
2. Booking questions: a mobile/phone field must be collected (Sandy's
   reach-out is a text). Add it if missing.
3. Confirmation email content: must include the directions page link
   (senseisandy.com/bjj-tannersville-ny-directions) and the waiver link
   (senseisandy.com/waiver). Add both if missing.
4. Host notifications: email on new booking must be ON.

### Task 7: Gates, commit, deploy
- Run `npm run qa:volatile-facts`, `npm run test:ads`, `npm run validate`,
  `npm run qa:schedule` — all pass. qa-cal-migration inside validate must
  still pass: no Calendly anything, and the "Sandy will reach out!" marker
  stays intact.
- Commit in logical groups, push, deploy green.
- Report: the Task 0 trace (per lane, per viewport, with the test-booking
  evidence), which Task 2 copy variant was used and why, the Task 3 test
  submission result, the Task 4 verdict, commit hashes.

## ACCEPTANCE (Sassafras verifies live, rendered browser)
- Each lane click updates the flow's Text Sandy href to that lane's
  prefilled booking body.
- The promise line appears at Step 1 and Step 2 and matches the real
  Cal.com behavior recorded in Task 0.
- The visit-request form is visible without interacting with the calendar,
  submits to the existing endpoint, and shows the reach-out success state.
- A test booking's notification to Sandy shows the lane.
- All four gates pass in CI on the deploy run.
