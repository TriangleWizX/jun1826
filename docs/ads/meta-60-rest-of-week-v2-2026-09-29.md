# Meta 60: production plan, September 29–October 4

This iteration supersedes the Tuesday–Sunday slate in `meta-60-rest-of-week-2026-09-29.md`. It is a production plan, not a publication report.

## Target and count

| Source or state | Unique units |
|---|---:|
| Monday, September 28: owner-reported static Meta feed posts | 5 |
| Tuesday–Sunday still to publish | 55 |
| Weekly target | 60 |

An identical Facebook and Instagram pair is one unit. Stories do not count. The five Monday units remain **owner-reported** until their native post URLs or IDs are entered. Planned, designed, and scheduled units do not earn published credit.

## Format and daily load

| Day | Static | Carousel | Short video (16–30s) | Long video (45–90s) | Daily total |
|---|---:|---:|---:|---:|---:|
| Tue Sep 29 | 3 | 3 | 2 | 1 | 9 |
| Wed Sep 30 | 2 | 2 | 3 | 2 | 9 |
| Thu Oct 1 | 2 | 2 | 2 | 3 | 9 |
| Fri Oct 2 | 2 | 2 | 3 | 2 | 9 |
| Sat Oct 3 | 2 | 2 | 3 | 3 | 10 |
| Sun Oct 4 | 2 | 1 | 2 | 4 | 9 |
| **Total** | **13** | **12** | **15** | **15** | **55** |

The owner confirmed all five Monday posts were static images. The remaining 25 image/carousel units and 30 videos yield an exact 30/30 format split across the full 60-post week. The videos divide into 15 short and 15 longer lessons as requested. The exports do not prove that an even short/long split is optimal; use it as a deliberate test. Tuesday's six image units can be prepared before class, while its three videos can use that evening's footage. Thursday and Sunday have no regular class on the current public schedule, so their video units require footage recorded earlier in the week. All times use America/New_York.

## Source hierarchy and evidence

1. `src/_data/free-intro.json`, `schedule.json`, `contact.json`, and `offers.json` control current offer and class facts. Meet Sandy for 15 minutes. Talk about your goals. Adults can choose a class after the visit that day. Sandy confirms the class before you train. You can choose a later day. For a visit, wear your day clothes. To train, wear clean sports clothes. Follow the class plan Sandy sends you. The specialized youth path may combine orientation and class in one visit. The address is 6045 Main Street, 2nd Floor, Tannersville, NY 12485.
2. The Meta CSV exports in `assets/` support format and hook choices. Reach is directional; the exports do not prove leads, attended intros, paid starts, or an optimal posting time.
3. The five Monday posts are owner-reported. Their themes are first stripe, coached practice, three-step learning, bringing a question, and a calm beginning. New concepts need a distinct teaching point, visual scene, and caption.
4. The payer model in `paying-customer-avatar-audit-2026-09-28.md` is provisional. Ben is the adult beginner priority; Carla is the parent payer; Ian and Tyler are participant lenses; Wendy is a visitor context. Do not imply the current schedule solves household logistics.

The September 21–25 Meta audit belongs to a prior window. Its 31-post count does not roll into this Monday-start ledger.

### What the exports support

The long-window exports `assets/Dec-31-2025_Sep-28-2026_1029143443506924.csv` (Facebook) and `assets/Dec-31-2025_Sep-28-2026_1402593188737430.csv` (Instagram feed) contain 114 Facebook posts (45 video, 66 photo, 3 other) and 150 Instagram feed posts (69 Reels, 36 carousels, 45 images). Their latest publish time is September 25, despite the September 28 export filename. The shorter September 21–25 feed rows are already represented in the long exports, so they do not add new units. Story exports remain outside the 60-post count.

| Format | Long-window median reach | September median reach in the same long export |
|---|---:|---:|
| Facebook video | 132, n=45 | 10, n=4 |
| Facebook photo | 7, n=66 | 5, n=44 |
| Instagram Reel | 374, n=69 | 181.5, n=4 |
| Instagram carousel | 161, n=36 | 89, n=15 |
| Instagram image | 73, n=45 | 39, n=29 |

These are directional format signals, not causal tests. Most videos in the full export predate September, while most image posts were published in September; post age and changing volume confound the gap. The four recent video records on each platform are too few to establish an optimal mix. The duration comparison is mixed: Facebook's 16–30s videos had median reach 167 (n=15) versus 72 (n=10) for 45–90s; Instagram's medians were 390 (n=25) and 435 (n=13). The exact 15-short/15-long split honors the owner's requested experiment, not a proven winner.

Use specific movement and coaching hooks as a testable creative hypothesis. The exports contain individual technical posts with strong reach, but overlapping captions and publication periods do not isolate a technical-topic effect. Neither feed export contains START-driven DMs, booking requests, confirmed visits, or paid starts.

## Swarm review and adoption record

The catalog router returned ambiguous candidates for these tasks. The coordinator inspected the full available `text` for the selected assets in `assets/indranet-prompt-exporter/exports/index.json`. Each selected role has a `prompt_download.bytes` value equal to the index text byte length; the only missing field is `notes`, and there are no attachments. The local `persona_read.py` named in AGENTS.md is absent, so the versioned index text is the inspected source. `INSTRUCTIONS - CONTENT` has its complete text in the index. `INSTRUCTIONS - Business Operations` is an app entry whose linked prompt is absent, so its available text serves only as limited operations guidance; ordinary source checks provide the remaining method. Persona methods do not authorize publishing or new claims.

| Workstream | Role and UUID | Instruction and UUID | Method applied | Read scope | Write scope | Definition of done |
|---|---|---|---|---|---|---|
| A: export evidence | SMM 4 Analytics and Reporting Specialist, Taylor Reed `150b8f4b-f628-458f-b5c6-9ff87a9f1d19` | INSTRUCTIONS - Business Operations `c3369696-d996-447e-8973-5f2cd73d33c9` | Audit → compare → adjust → monitor; distinguish reach from conversion. | Meta CSVs, prior plan | None | A1 counts/fields; A2 caveats; A3 allocation changes |
| C: content strategy | SMM 2 Content Strategy Specialist, Casey Vireo `a4ab042d-c931-469a-baab-77b3b8fcdbd7` | INSTRUCTIONS - CONTENT `6e94db8f-e23d-4387-8cc6-bac209e890aa` | Audience job → hook → visual story → next step; check variance. | Current slate, Monday themes, avatar audit | None | C1 duplicate scan; C2 replacements; C3 six-day arc |
| O: publishing operations | SMM 1 Account Creation and Maintenance Specialist, Alex Mendon `ba5539e8-a69f-45ff-a7c7-08395d66f8a9` | INSTRUCTIONS - Business Operations `c3369696-d996-447e-8973-5f2cd73d33c9` | Schedule, brand voice, platform receipts, privacy and factual checks. | Current slate, canonical data | None | O1 fact/risk scan; O2 capture workflow; O3 ledger rules |
| I: integration | Coordinator using social publishing and ad creative skills | Same Business Operations asset | Reconcile evidence and edit one executable plan. | All above | This document only | Counts, unique hooks, source-safe copy, workable capture, verification |

## Production rules

- Use the Canva copies linked in [`CANVA-STATIC-CREATIVE-WORKFLOW.md`](../../tools/ads/CANVA-STATIC-CREATIVE-WORKFLOW.md). Each planned static or image/carousel post has a separate copy with post-specific on-image copy, `Comment START for the link.`, and the verified address/offer footer. Replace only the image(s) in that copy after checking permission and source-scene fit; keep both master designs untouched. Visitor-only creatives use paid visitor terms, not a `First Class FREE` footer.
- Give every video its own learning question, opening shot, teaching point, and ending. A short detail cut and a long lesson may share a recording session, but the posts must teach different points and use distinct edits and captions.
- Record Tuesday and Wednesday adult/youth classes, Friday adult/youth classes, and Saturday Adult No-Gi only where recording and publication permission exists. Film hands, feet, coach demonstrations, and anonymous partner angles as alternatives to identifiable youth footage.
- Saturday's scheduled 10:30 AM No-Gi class is adult. Youth and teens require Sandy's approval for that class. The schedule has no Sunday group class. A youth post needs permission for the specific Facebook/Instagram use; if that scene is unavailable, hold the ID and create a different coach-only or approved-adult concept under a new ID.
- Use `Comment START for the link.` as the response CTA and monitor the comments so requesters receive the correct link. Use the four local tags when relevant: `#catskills #bjj #tannersvilleny #hudsonvalley`.
- Reserve `@clockworkbjj` for at most one genuinely relevant flagship technical post this week. Check visitor availability and age-appropriate partner fit before visitor invitations.

Before publishing each final caption and design, run the repository's four copy checks: (1) Stop-Slop: short active sentences, specific human action, positive language, no filler or em dash, and manual score at least 40/50; (2) Universal Analyzer-Improver: a clear first three seconds or first line, a local cue where it fits, one next step, and current-fact QA; (3) Anything-Enhancer: a real visual decision, coach cue, or movement detail that belongs to the chosen avatar; (4) Empirical Reach Matrix: format, four relevant local tags, comment prompt, and the once-weekly collaborator-tag rule. The 55 lines below are draft hooks; a final caption needs the scene and fact check before it can be released.

## Publish and evidence loop

Prepare image units before the day's first posting block. Film class scenes in landscape-safe and portrait-safe framing, edit vertical video with captions, and schedule later posts only after the creative exists. Publish in several manageable blocks across each day; treat the block times as production slots, not proven peak-reach windows. Leave Sunday evening as a catch-up window, with the planned Sunday units ready by late afternoon.

Use these slots as a workload clock, moving a unit within the same day when filming or editing needs more time. Tuesday and Friday put their fresh class videos after the 5 PM youth and 6 PM adult classes. Wednesday can use Tuesday's footage in the morning and Wednesday's footage at night. Saturday's No-Gi footage follows the 10:30 AM adult class. Sunday ends by 5:30 PM, before the evening deadline.

| Day | Image/carousel slots | Video slots | Capture source |
|---|---|---|---|
| Tue | 8:30, 9:45, 11:00 AM; 12:30, 2:00, 3:30 PM | 7:15, 8:15, 9:15 PM | Tuesday classes; prepare six image units first. |
| Wed | 8:30, 10:00 AM; 12:30, 2:00 PM | 11:15 AM, 3:15 PM; 7:15, 8:15, 9:15 PM | Two Tuesday video cuts; three Wednesday cuts. |
| Thu | 8:30, 10:00 AM; 12:30, 2:00 PM | 11:15 AM, 3:15, 5:00, 6:30, 8:00 PM | Tuesday/Wednesday capture only. |
| Fri | 8:30, 10:00 AM; 12:30, 2:00 PM | 11:15 AM, 3:15 PM; 7:15, 8:15, 9:15 PM | Two prior footage cuts; three Friday class cuts. |
| Sat | 8:30, 9:30 AM; 1:00, 2:30 PM | 12:00, 1:45, 3:15, 4:00, 5:00, 7:00 PM | Saturday adult No-Gi plus pre-recorded lessons. |
| Sun | 8:30, 10:30 AM; 1:30 PM | 9:30, 11:30 AM; 12:30, 2:30, 3:45, 5:30 PM | Six edited videos from the week. |

ID order for those slots:

- **Tue:** 8:30 `tue-01`; 9:45 `tue-03`; 11:00 `tue-04`; 12:30 `tue-05`; 2:00 `tue-06`; 3:30 `tue-07`; 7:15 `tue-09`; 8:15 `tue-02`; 9:15 `tue-08`.
- **Wed:** 8:30 `wed-03`; 10:00 `wed-04`; 11:15 `wed-01`; 12:30 `wed-05`; 2:00 `wed-06`; 3:15 `wed-02`; 7:15 `wed-07`; 8:15 `wed-08`; 9:15 `wed-09`.
- **Thu:** 8:30 `thu-03`; 10:00 `thu-02`; 11:15 `thu-01`; 12:30 `thu-05`; 2:00 `thu-06`; 3:15 `thu-04`; 5:00 `thu-07`; 6:30 `thu-08`; 8:00 `thu-09`.
- **Fri:** 8:30 `fri-03`; 10:00 `fri-04`; 11:15 `fri-02`; 12:30 `fri-06`; 2:00 `fri-05`; 3:15 `fri-07`; 7:15 `fri-01`; 8:15 `fri-08`; 9:15 `fri-09`.
- **Sat:** 8:30 `sat-04`; 9:30 `sat-09`; 12:00 `sat-01`; 1:00 `sat-05`; 1:45 `sat-02`; 2:30 `sat-08`; 3:15 `sat-03`; 4:00 `sat-06`; 5:00 `sat-07`; 7:00 `sat-10`.
- **Sun:** 8:30 `sun-03`; 9:30 `sun-02`; 10:30 `sun-04`; 11:30 `sun-05`; 12:30 `sun-06`; 1:30 `sun-01`; 2:30 `sun-07`; 3:45 `sun-08`; 5:30 `sun-09`.

Minimum capture inventory: Tuesday and Wednesday each need three distinct adult teaching sequences and one permissioned or anonymous youth scene. Friday needs two adult sequences plus one youth coaching scene. Saturday needs three No-Gi sequences. Record Sandy answering four specific prompts across these sessions for longer lessons and Thursday/Sunday inventory. For each sequence, get an opening detail, a wide demonstration, a learner attempt, one coach cue, and a clean end frame. A sequence can support a short detail and a long explanation only if each teaches a different point.

Bank the video material before its posting day:

| Capture deadline | Video IDs that need footage or a coach explanation by then |
|---|---|
| Tuesday night | `tue-02`, `tue-08`, `tue-09`, `wed-01`, `wed-02`; start `thu-08` and `thu-09`. |
| Wednesday night | `wed-07`, `wed-08`, `wed-09`, `thu-01`, `thu-04`, `thu-07`, `thu-08`, `thu-09`, `fri-02`, `fri-07`. |
| Friday night | `fri-01`, `fri-08`, `fri-09`, `sun-02`, `sun-06`, `sun-07`. |
| Saturday afternoon | `sat-01`, `sat-02`, `sat-03`, `sat-06`, `sat-07`, `sat-10`, `sun-05`, `sun-08`, `sun-09`. |

For the 45–90s units, a clear single take from Sandy plus one demonstration can carry the lesson. For the 16–30s units, open on the physical detail and show the result once. Give each unit a separate teaching point and source-clip ID before editing. If a banked clip is missing, substitute a newly recorded coach demonstration with a new brief ID; update the daily forecast if it cannot be made.

Each unit needs a ledger row: `unit_id`, `format`, `theme`, `source clip ID`, `Canva/video asset version`, `caption version`, `status`, `Facebook status/URL/ID/time`, `Instagram status/URL/ID/time`, `same-creative check`, `youth permission scope and approver or anonymous check`, and `unique count credit`. Valid statuses are `planned`, `asset ready`, `scheduled`, `owner reported published`, and `native verified`. Give count credit only to an in-window unique feed/Reel with a native receipt on at least one platform; report the both-platform-verified count separately. The 60 tally is a working owner report until native receipts, including Monday's five, are available. If a planned unit fails, keep its ID and status, then create a new replacement ID with a different creative; never count both versions of one post.

At the daily go/no-go, check that the source scene exists, Sandy has confirmed the technical and first-visit claims, any identifiable person has the right publication permission, and the creative differs in teaching point and edit from other units. A question labeled as received from a student or comment must have a real source; otherwise write it as a general question from the academy. If a planned scene is unavailable, lower the forecast or create a distinct replacement brief. A schedule entry or Canva export is not publication evidence.

## Measurement and next iteration

Keep two sprint totals: qualifying unique posts with a native receipt on at least one Meta platform, and the subset with both Facebook and Instagram receipts. For creative learning, compare each post at the same age (72 hours, then seven days) on its own platform. Record reach, shares, saves, comments, START replies, and profile/link actions where the export provides them; report shares, saves, comments, and START replies per 1,000 reached alongside raw counts. Record requests for a Free First Visit separately from engagement. The current exports have no feed-level START DM or booking outcome field.

Tag each unit with `format`, `duration`, `hook family`, `buyer lens`, and `teaching point`. After Tuesday and Wednesday, replace any unfilmed or unpermissioned unit with a new concrete concept and ID. After Friday, favor the hook families producing actual replies and useful saves, while preserving the user's 15-short/15-long test. Do not infer a winning posting hour or a booking result from reach alone.

## Revised 55-unit slate

The rows below are the production briefs. Each row specifies the hook, the distinct point to teach or show, the scene to capture, and the audience job. Captions and final on-image copy are written from these briefs when each day's assets are prepared.

Use the quoted lines as the first draft of on-image text, the first video caption, or the first line of the Meta caption. Add `Comment START for the link.` to each finished caption. A `visit` reply sends the current Free First Visit booking path; a `visitor` reply sends current visitor options; an `eligibility` reply provides current Community-Service Adult terms; a `family` reply asks for each learner's age and routes to separate age-fit classes. These are reply directions, not claims that anyone has booked or that automation is active.

### Tuesday, September 29 — how practice starts

| ID / format / lens | Post copy and theme | Scene and proof to capture | START reply |
|---|---|---|---|
| `tue-01` Static / Ben | **“A good partner leaves room to learn.”** A partner starts at a clear pace and listens to the coach. | Primary one-image layout. Two adults at the start of a real partner drill, with the coach and starting space in frame. | visit |
| `tue-02` Short / Ben | **“Watch this grip move.”** Sandy shows one hand detail, then the learner tries it. | One actual grip detail, filmed close and wide. Sandy names the detail after capture so the words match the move. | visit |
| `tue-03` Carousel / Carla | **“Where does the game start?”** A clear boundary helps each child know their task. | Real youth game boundary, start cue, and finish. Use permissioned frames; a coach-only demonstration becomes a newly labeled replacement if needed. | visit |
| `tue-04` Static / Ben | **“Does the trip fit your week?”** Ask Sandy about a day that works for you. | Calendar and blank text draft beside the current class schedule. Leave the actual availability reply open; show no held slot. | visit |
| `tue-05` Carousel / Ben | **“Feet set the path.”** Watch one foot move before the rest of the body follows. | Three sequential views of a Sandy-approved step: start, shift, finish. Use the same adult and move throughout. | visit |
| `tue-06` Carousel / Casey | **“Ask about service rate terms.”** Sandy can explain the current offer and who can use it. | An ordinary adult class image, current eligibility summary, and a plain inquiry panel. Do not infer a job from clothing or a face. | eligibility |
| `tue-07` Static / Wendy | **“Here for one day?”** Ask about a suitable visitor class in Tannersville. | A real adult training or mat detail paired with the canonical Day Pass name. Check class fit and availability before posting. | visitor |
| `tue-08` Long / Ben | **“Can your base move with a partner?”** Sandy shows the start, the partner adds movement, and Sandy points out the adjustment. | Record a complete, real base drill with the same two adults. Show the cue and the next rep; Sandy approves the technique words. | visit |
| `tue-09` Short / Carla | **“What is the goal of this game?”** Sandy names one task and shows its start. | One real youth-game goal from Tuesday's class. Use permissioned footage or replace with a separate coach-only demonstration ID. | visit |

### Wednesday, September 30 — a visible choice in the move

| ID / format / lens | Post copy and theme | Scene and proof to capture | START reply |
|---|---|---|---|
| `wed-01` Short / Ben | **“See one way up from the mat.”** Sandy shows where one hand and foot go. | A real floor-to-standing movement, side and front angles, captured Tuesday or Wednesday. Show the whole finish. | visit |
| `wed-02` Short / Ben | **“A small turn makes space.”** Watch the hips turn while the partner stays in frame. | One confirmed space-making movement from an adult drill; fixed side angle, then one wide view. | visit |
| `wed-03` Carousel / Tyler | **“Hand. Elbow. Hip.”** See how the three points move together. | Three close frames from one Sandy-approved technique, plus the whole position. Use age-neutral adult hands if teen footage is unavailable. | visit |
| `wed-04` Carousel / Frankie | **“One family. Age-fit classes.”** Ask about the right path for each learner. | Current youth/teen and adult schedule views, with separate placements made clear. Use family context without implying a shared mixed-age class. | family |
| `wed-05` Static / Ben | **“Start from this seated spot.”** Sandy shows one hand-and-hip choice from the mat. | Primary layout; a real adult seated position with coach's cue visible. Keep it separate from `wed-01`'s stand-up movement. | visit |
| `wed-06` Static / Ben | **“Know your mat space.”** Sandy shows where partners pause and turn back in. | A real adult pair near a marked mat edge, or coach-only demonstration of the boundary cue. | visit |
| `wed-07` Short / Carla | **“Watch the pause cue.”** The coach gives a clear signal and the game resets. | Actual youth-game pause signal, cropped to coach and mat if child permission is absent. A staged coach demonstration must be labeled as such. | visit |
| `wed-08` Long / Carla | **“Who gets the next turn?”** Sandy explains the roles in one youth game, then shows a full turn. | Capture a different game or teaching point from `tue-09` and `wed-07`. Permissioned class footage, or a new coach-only demonstration ID. | visit |
| `wed-09` Long / Ben | **“Each partner has a job.”** Sandy names both roles and shows when they switch. | One complete adult drill exchange with a role switch and a coach explanation. This teaches partner roles rather than Monday's generic three-step path. | visit |

### Thursday, October 1 — choose the right entry path

| ID / format / lens | Post copy and theme | Scene and proof to capture | START reply |
|---|---|---|---|
| `thu-01` Short / Tyler | **“See a teen work with a peer.”** One partner starts, the other responds to the cue. | Permissioned Tuesday/Wednesday teen footage from an age-fit drill. If unavailable, use a different approved adult teaching concept under a new ID. | visit |
| `thu-02` Carousel / Carla | **“A youth visit may include class.”** Sandy plans the age-fit first visit with the guardian. | Current youth path: arrival, orientation, coached class when the specialized youth workflow applies. Real room images are enough; no child image is required. | visit |
| `thu-03` Static / Ben | **“Wear normal clothes for the first visit.”** Meet Sandy, see the room, and plan the coached class that follows. | Primary layout with an ordinary-clothes arrival detail. The general first visit is a 15-minute orientation, as stated in `free-intro.json`. | visit |
| `thu-04` Short / Ben | **“Watch the elbow make room.”** Sandy shows one elbow position in a real drill. | Close and wide views of a Sandy-approved elbow detail captured Tuesday/Wednesday. Keep the partner's starting position visible. | visit |
| `thu-05` Carousel / Wendy | **“One visit or a longer stay?”** See the current Day Pass and Vacation Week Pass paths. | Two current product names and terms from `offers.json`, with a real adult training image for each; final panel asks for the travel date. | visitor |
| `thu-06` Static / Tyler | **“Teens train in the youth/teen group.”** A guardian can ask Sandy about the right class fit. | Current youth/teen schedule and a permissioned teen or neutral gear scene. Do not assume an unmeasured sports-season motive. | visit |
| `thu-07` Long / Wendy | **“How do I ask about a visitor class?”** Share your date, training background, and class question. | Sandy speaks over a real studio and current schedule view. State that Saturday's scheduled No-Gi group is adult and that attendance needs class fit. | visitor |
| `thu-08` Long / Ben | **“How do partners set the pace?”** Sandy explains one cooperative adult drill from start to finish. | A Tuesday/Wednesday drill with the coach's real start cue and one change in pace. This is a teaching lesson, not a schedule promise. | visit |
| `thu-09` Long / Ben | **“Why repeat the same move?”** Sandy names one detail that changes across three reps. | Three complete repetitions from approved earlier footage; each rep shows a different observable adjustment. | visit |

### Friday, October 2 — choices inside a real class

| ID / format / lens | Post copy and theme | Scene and proof to capture | START reply |
|---|---|---|---|
| `fri-01` Short / Carla | **“Watch how a child gets a turn.”** The coach gives the start cue, then one child takes a turn. | One real, permissioned youth game from Friday Gi Lab. Use a separate coach-only demonstration ID if child footage cannot be published. | visit |
| `fri-02` Short / Tyler | **“Hands or feet first?”** See two choices in one teen drill. | Permissioned teen/peer practice from a fixed angle. Sandy names the real choices after capture. Use a different scene from `fri-05`. | visit |
| `fri-03` Static / Ben | **“Set a light starting pace.”** Two partners begin in a clear spot and listen for the cue. | Primary layout with a real adult pair at the start of a cooperative drill. Show the coach's presence, not a generic posed portrait. | visit |
| `fri-04` Carousel / Ben and Wendy | **“First visit or training pass?”** A new learner and a visiting grappler have different entry paths. | Two current paths from `offers.json`, each with an honest image: orientation for a first-timer, adult training for a visitor. End with the right question to ask Sandy. | visit or visitor |
| `fri-05` Static / Tyler | **“See the choice in this move.”** The teen sees two paths and takes one. | A distinct, permissioned teen drill frame at the actual decision point. Name the choice only after Sandy approves it. | visit |
| `fri-06` Carousel / Ben | **“Where does the hand go as the partner turns?”** See the start, the turn, and the new grip. | Three fresh adult drill frames from one technical sequence. Keep this separate from Tuesday's static grip-detail post by teaching the changing position. | visit |
| `fri-07` Short / Wendy | **“Ask about Saturday No-Gi.”** Share your date and training background so Sandy can check fit. | A brief coach-to-camera answer over the current Saturday adult No-Gi class information. State the scheduled time only after checking the live schedule. | visitor |
| `fri-08` Long / Ben | **“Why turn your hips here?”** Sandy answers a real technique question with one full demonstration. | Capture a question and the matching adult drill. If no question is received, Sandy can pose it as an academy lesson; do not claim a student or commenter asked. | visit |
| `fri-09` Long / Ben | **“One drill, two starting spots.”** Sandy shows two appropriate ways adults begin the same drill. | Two consenting adults, two real starting positions, one coach explanation. Keep the technique distinct from Wednesday's partner-role lesson. | visit |

### Saturday, October 3 — No-Gi skill and visitor fit

| ID / format / lens | Post copy and theme | Scene and proof to capture | START reply |
|---|---|---|---|
| `sat-01` Short / Ben | **“Watch the foot that starts this move.”** Sandy shows one Saturday No-Gi detail from close and wide views. | The week's flagship technical clip from the scheduled adult class. Name the move after capture. This is the only possible `@clockworkbjj` tag and only if relevant. | visit |
| `sat-02` Short / Ben and Wendy | **“One No-Gi grip detail.”** Watch Sandy's hand position change the next step. | A different technical sequence from `sat-01`, showing a sleeve-free grip and the matching foot movement. | visit or visitor |
| `sat-03` Short / Ben | **“Find the balance line.”** A small weight shift sets up the next move. | Coach hand cue plus one adult's shift from start to stable finish. Use a different lesson and source clip from `sat-01` and `sat-02`. | visit |
| `sat-04` Carousel / Wendy | **“Check your Saturday class fit.”** Date, experience, and partner fit shape a visitor plan. | Current adult No-Gi time, a real room image, and a blank date/experience question. Youth or teen participation requires Sandy's approval. | visitor |
| `sat-05` Static / Ben | **“One cue from Saturday’s mat.”** Sandy points to a detail the class practiced. | A fresh, permissioned adult teaching frame with the actual cue written in the large support line. If no Saturday frame is available, use a newly titled evergreen lesson instead. | visit |
| `sat-06` Long / Ben | **“Move when your partner moves.”** Sandy teaches the timing of one real adult drill. | Partner starts, Sandy responds, coach explains the timing, then the pair repeats at normal speed. | visit |
| `sat-07` Long / Ben | **“How do you reset a No-Gi grip?”** Sandy shows one grip lost, a calm reset, and the next attempt. | A complete No-Gi reset lesson, not the initial grip placement shown in `sat-02`. Get a wide shot so the partner's role stays clear. | visit |
| `sat-08` Carousel / Tyler and Ben | **“One move from three views.”** See the same action from the front, side, and learner's angle. | Three angles of a distinct Sandy-approved No-Gi movement. The captions point to one different detail per view. | visit |
| `sat-09` Static / Wendy | **“Share the date you’ll be here.”** Sandy can check the right class for your visit. | Actual adult mat image plus a blank travel-date card. Avoid same-day or walk-in availability claims. | visitor |
| `sat-10` Long / Carla | **“Which youth class fits your child?”** Sandy explains the current youth/teen days and what to ask next. | Coach-to-camera with current schedule and empty-room cutaways recorded earlier in the week. Do not imply there is a regular Saturday youth class. | visit |

### Sunday, October 4 — what to keep and what to ask next

| ID / format / lens | Post copy and theme | Scene and proof to capture | START reply |
|---|---|---|---|
| `sun-01` Carousel / Ben | **“Three skills we saw this week.”** See a grip, a body turn, and a clean finish. | Three genuinely different, permissioned source clips or stills from Tuesday through Saturday. Name only movements Sandy confirms were captured. | visit |
| `sun-02` Short / Tyler | **“One choice from teen practice.”** Watch the learner choose a path in the drill. | A Friday teen scene that differs in move, moment, and edit from `fri-02` and `fri-05`; permission required. If absent, make a new adult skill brief with a new ID. | visit |
| `sun-03` Static / Ben | **“Find us on Main Street.”** Share a day that could work for your first visit. | Primary layout with an actual exterior or map view and the second-floor address from `contact.json`. The image does not imply an open appointment. | visit |
| `sun-04` Static / Carla | **“Check the youth class days.”** A guardian can ask which age-fit visit to plan. | Legible current youth/teen schedule crop and a parent-facing inquiry line. Keep Tuesday Gi, Wednesday No-Gi, and Friday Gi Lab facts current. | visit |
| `sun-05` Long / Ben | **“Why does this drill have a finish?”** Sandy shows the cue that ends one practice round. | A complete adult drill from earlier footage, including finish signal and reset. Use a different drill from `wed-06`'s mat-space still. | visit |
| `sun-06` Long / Carla | **“How does Sandy change a youth game?”** One rule changes while the goal stays clear. | Permissioned Tuesday/Wednesday/Friday youth footage showing a real rule change, or a new coach-only demonstration with its own ID. Sandy confirms what changed. | visit |
| `sun-07` Long / Tyler | **“Try the next choice in this move.”** Sandy shows how a teen responds when the partner takes another path. | Fresh Friday teen footage that adds a real second decision. Do not recut `sun-02` as the same lesson. | visit |
| `sun-08` Long / Ben | **“One move to practice next week.”** Sandy teaches a complete adult movement with one cue to remember. | A distinct Saturday or Friday adult technique, filmed from setup to finish. Use a new lesson, not a recap of `sun-01`. | visit |
| `sun-09` Short / all payer paths | **“Adult, youth, or visitor?”** Tell Sandy which path you want to ask about. | Coach-to-camera points to three current entry cards: adult Free First Visit, youth visit, visitor options. End on `Comment START for the link.` | route by reply |
