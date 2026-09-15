> Superseded for concept volume: the user now requires 500 weekly Markdown concepts, split 250 static / 250 video. The retired implicit 150-PNG export default remains retired. Other protections still apply.

# Constraint deletion audit — September 14, 2026

## 1. Constraint statement

Make useful, accurate ads without creating a standing founder workload. No supplied results establish weekly creative volume or reporting as the bottleneck. This pass changes the offline studio only.

## 2. Existing requirements: baseline

Before this pass: CLI default 150 exports; weekday routine about 80 minutes; generated brief always added retention review; follow-up guidance called for question logging and a two-missed-session trigger; evidence text repeated in every export row and concepts repeated in snapshots. These were scaffold proposals, not evidence of actual academy practice. No scheduling or messaging automation existed.

## 3. Four-question interrogation

| Requirement | What does it mean? | How do we know it is needed? | So what if removed? | Why care? |
|---|---|---|---|---|
| Implicit batch of 150 | Omitting a number selects 150 files | Original volume request; no need for implicit default | User selects actual count | Less unrequested production and review |
| Weekday routine | Owner performs five marketing blocks irrespective of need | Workshop ideas, no measured lift | Work begins with a real problem | Protect founder time |
| Mandatory brief | Owner writes planning material before a small creative task | No demonstrated handoff failure | Renderer still works directly | Reduce explanation burden |
| Retention review in every brief | Every ad question triggers a student-attendance task | No necessary relationship | Handle retention when relevant | Keep task scope narrow |
| Two-missed-session rule | Count absences and create a check-in task | Proposed threshold; expected schedules unverified | Personal judgment remains available | Avoid incorrect triggers |
| Repeated proof fields | Copy the same evidence into every size's manifest row | Export inspection convenience | Reference one concept snapshot | Reduce duplicate data |
| Review unchanged exports | Recheck an identical artifact every reuse | No observed failure from approved reuse | Review when content/context changes | Save routine effort |
| Offer/permission/destination checks | Confirm promises, image use and customer next step | Required for accurate usable advertising | Errors can reach customers | Protect reliability and customer value |

## 4. Classification and rubric

Scores are provisional judgments, not measurements. Vector order: evidence, outcome impact, safety/compliance, customer value, operational leverage, frequency, failure cost, reversibility. A high reversibility score means hard to restore. Scope scores to the requirement itself, not the importance of marketing in general.

| Requirement | Vector | Total | State and interpretation |
|---|---|---:|---|
| Implicit 150 count | 0,0,0,0,0,2,0,0 | 2 | RETIRED default; bulk capacity DORMANT until requested |
| Fixed weekday routine | 0,1,0,1,0,2,0,0 | 4 | RETIRED |
| Required brief | 0,1,0,1,0,1,1,0 | 4 | RETIRED mandate; optional mechanism DORMANT |
| Universal retention appendix | 0,1,0,1,0,2,0,0 | 4 | RETIRED |
| Two-session trigger | 0,1,0,1,1,1,1,0 | 5 | DORMANT override: potentially useful, evidence missing |
| Repeated proof text | 0,0,0,1,0,2,0,0 | 3 | RETIRED duplication; canonical evidence ACTIVE |
| Review unchanged files | 0,1,0,1,0,2,1,0 | 5 | DORMANT blanket review; changed-output review ACTIVE |
| Accuracy/use/destination checks | 1,2,2,2,1,2,2,1 | 13 | ACTIVE override: direct rights and accuracy obligations |

An obligation need not wait for an incident to be protected. Do not use low local measurement as a reason to delete asset permission or truthful offer checks.

## 5. Smallest viable change: implemented

- Require an explicit count in plan/render; retain capacity and existing selection logic.
- Replace calendar instructions with problem → reuse or answer → create only if needed → verify → observe results.
- Keep brief command available, remove the automatic retention appendix, and change its default filename to task-brief.md.
- Remove mandatory question-capture and missed-session events from followup guidance; retain personal response to a return request.
- Store each selected concept once in inputs.json; reference it from export rows rather than repeating source/proof text.
- Archive earlier documents and make README the operating authority. No new automation, CRM fields or weekly tracker.

## 6. Protected invariants

42-concept bank; existing concept/creative IDs; buyer destinations and offers; visitor distinction; Ian's lens; image permission controls; current photo layouts, font and logo behavior; draft status; existing-output protection; 1–200 capacity. No customer terms, availability, pricing or live booking behavior changed. No student data added.

## 7. Validation

Use existing allocation/routing tests plus explicit-count and optional-brief checks. Confirm missing count fails before rendering. Confirm valid requested batches retain the intended count. Confirm invalid brief data fails before opening an output, and existing brief files are protected. Image layout was not changed; no new large render is justified solely to prove instruction edits.

Business validation remains prospective: next actual task records minutes to usable asset and correction count. Compare with a comparable prior task if available; otherwise establish a baseline. Observe attributed attended visits and enrollments without inventing attribution or declaring causality from small samples.

## 8. Restore triggers and rollback

These are proposed decision thresholds, not discovered laws:

| Mechanism | Restore condition | Smallest restoration |
|---|---|---|
| Bulk batch | Actual placement plan lists more outputs than the small run supplies | Explicit --count; do not restore implicit 150 |
| Written brief | Two tasks need avoidable rework because essential instructions were absent | Short optional handoff for that class of task |
| Recurring review | Two documented time-sensitive marketing tasks are missed within 30 days | One calendar reminder for the actual task |
| Missed-session trigger | Expected schedules and closures are reliable, and two absences needing attention were missed by manual review within 30 days | Trial a review flag, not automatic messages |
| Repeated evidence in export | A downstream consumer cannot resolve concept_id to the accompanying snapshot | Generate a compatibility export; do not create a second editable authority |
| Full reuse review | An unchanged approved output is released incorrectly because context changed | Add a context-change check; inspect affected variants |

Earlier documentation is in archive; it is reference only. For a full code rollback use the preceding saved package version. The legacy --week flag remains to avoid unnecessary migration; changing its label is not required to remove the weekly obligation.
