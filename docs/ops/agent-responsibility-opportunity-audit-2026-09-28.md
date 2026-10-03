# Agent Responsibility Opportunity Audit

**Status:** internal decision draft; no integration, message sending, booking, or deployment is authorized  
**Date:** 2026-09-28  
**Scope:** 14-stage lead-to-member workflow, local capabilities, approval gates, and possible GitHub components

## Executive decision

The best first opportunity is an **approval-gated operations queue** beside the existing website, booking, analytics, and attendance tools.

The model can first observe records, find missing work, prepare a brief, and draft a reply. Sandy or an approved human keeps decisions about safety, placement, capacity, price, confirmation, enrollment, cancellation, and sensitive information.

Do not install a GitHub CRM yet. The local evidence shows that the missing function is an operational record and approval queue. It does not yet show that a large external platform is needed. Prove the smallest workflow contract first.

## Persona and expert framework

The requested work needs business operations, workflow design, systems analysis, privacy boundaries, and repository research. The available persona router returned ambiguous general candidates and did not establish a fit for this exact multi-domain goal. The named Business Architect export was not present in the current checkout, so no private persona prompt was adopted.

This audit uses a disclosed task-specialist fallback, guided by the local `hormozi-orchestra` skill and its sequential lenses:

1. **Offers:** increase perceived likelihood and reduce effort by making the next step clear.
2. **Leads and Lead Nurture:** improve response, scheduling, and show-up support through speed, availability, personalization, and bounded follow-up.
3. **Closing:** prepare a fit-based decision packet while keeping the decision human.
4. **Retention and Lifetime Value:** drive a first useful win, track activation signals, and flag risk without claiming measured retention.
5. **Systems and governance:** connect events to an accountable owner, due action, proof, approval, and rollback.

The playbooks are strategy lenses. They do not override canonical offer data, privacy rules, owner approval, or system permissions.

## Current local evidence

The repository already contains:

- Progressive booking and audience-lane routing in `js/progressive-booking.js`.
- CTA, form, attribution, and booking events in `js/analytics-events.js` and related funnel scripts.
- Cal.com booking behavior and legacy provider references that require drift control.
- Formspree lead capture paths.
- Attendance interface and `/api/attendance` references.
- Funnel and privacy QA scripts.
- Canonical offer, pricing, schedule, contact, and Free Intro data.
- Retention guidance and event-based follow-up briefs.

The confirmed gap is the operational spine:

```text
lead record
  -> accountable owner
  -> due action
  -> human approval
  -> confirmed visit
  -> attendance result
  -> follow-up task
  -> continuation decision
  -> closed outcome
```

Browser analytics, a form receipt, or a booking success event does not prove that Sandy saw the inquiry, confirmed the appointment, saw the visitor attend, or recorded a continuation decision.

## Responsibility levels

| Level | Meaning | Allowed first-pilot examples | Required control |
|---|---|---|---|
| R1 — Observe | Read approved records and report state | Find new records, overdue actions, missing outcomes | Read-only access and source links |
| R2 — Prepare | Create a reviewable brief or draft | Draft reply, lane brief, confirmation checklist | Human review before sending or changing state |
| R3 — Execute bounded action | Perform a narrow approved update or send | Mark a non-sensitive task complete; send an approved reminder | Written template, channel, contact limit, audit log, rollback |
| R4 — Decide | Change safety, policy, money, placement, or commitment | None in the first pilot | Reserved for Sandy or an authorized human |

Start at R1 and R2. Move to R3 only after a written approval package and a measured manual sample. Keep R4 human-controlled.

## Opportunity register

### A1 — Inquiry intake and next-action brief

**Stages:** L01–L05  
**Recommended level:** R1, then R2

The model can read an approved inquiry source, deduplicate the record, identify missing facts, assign a proposed stage, and draft a short reply.

**Output:**

```text
Lead: Jamie
Stage: L05 — fit details needed
Known facts: parent asks about a first class
Missing facts: child age, prior experience, preferred days
Owner: Sandy review
Next action: approve one reply
Due: unknown until approved
Reason for stop: youth routing not yet confirmed
```

**Human stop:** youth safety, unclear placement, injury, complaint, sensitive detail, pricing, or unknown state.

**Proof:** original message, source, timestamp, structured record, missing fields, draft, reviewer, approval status.

**Definition of done:** every new record has source, time, known facts, missing facts, owner, stage, next action, and a human-reviewed draft.

### A2 — First-visit lane and offer brief

**Stages:** L05–L07  
**Recommended level:** R1–R2

The model can read the current canonical schedule and Free Intro rules, prepare possible paths, and draft a request. It must distinguish the general first-visit path from the specialized youth path.

**Human stop:** Sandy confirms fit, capacity, partner fit, youth placement, and any unusual request.

**Proof:** source path and revision date, audience lane, rules used, candidate options, open questions, request draft.

**Definition of done:** the packet is reviewable without the model inventing a slot, promise, price, or confirmed appointment.

### A3 — Confirmation and visit-detail packet

**Stages:** L08–L09  
**Recommended level:** R2

After Sandy makes a decision, the model can compare the decision with the lead record, check the exact fields, and draft the message.

**Human stop:** only Sandy or an explicitly authorized person confirms or changes the appointment.

**Proof:** approved decision, day/time comparison, location source, reschedule instruction, draft, approval timestamp, send receipt or `not sent`.

**Definition of done:** every outgoing detail matches the approved record field by field.

### A4 — Visit brief and factual outcome record

**Stages:** L10–L11  
**Recommended level:** R1–R2

The model can prepare a coach brief from approved facts, provide a simple attendance checklist, and turn approved notes into a factual record.

**Human stop:** the coach controls the live class and all safety responses. The model must not coach, diagnose, infer medical facts, or make a youth judgment.

**Proof:** arrival, class delivered, welcome, participation, observed or reported concern, coach approval, next action.

**Definition of done:** the record separates facts from assumptions and marks unknown information as `unknown`.

### A5 — Continuation review and closure packet

**Stages:** L12–L14  
**Recommended level:** R2

The model can assemble attendance facts, retrieve only eligible canonical offers, identify missing decisions, and draft follow-up, hold, continue, pause, or close messages.

**Human stop:** Sandy approves outcome, price, eligibility, guarantee terms, enrollment, cancellation handling, and any personalized or sensitive message.

**Proof:** visit outcome, canonical source checks, offer eligibility, price/term check, decision owner, due date, draft, approval, send receipt, final outcome.

**Definition of done:** every record ends in `continue`, `follow_up`, `hold`, `pause`, or `close`, with owner, date, evidence, and human approval.

## Retention opportunity after membership

The retention playbooks suggest finding the local activation point before automating. Possible hypotheses include a first coached win, first 14 days, a coach check-in, a first milestone, or returning after a short absence. The repository does not prove which behavior predicts longer membership. Keep all such outcomes `unknown` until measured.

The first retention pilot may prepare:

- Day 1, Day 7, and Day 14 checklists.
- A seven-day inactivity report.
- A factual check-in draft.
- A weekly exception list.
- A reactivation draft for human approval.

It must not automatically message members, infer why someone missed class, put youth or accommodation notes into analytics, or claim improved retention.

## Approval package for a first pilot

Approve all of these before R3 work:

- Exact approved intake sources.
- Read-only fields and protected fields.
- Named reviewers and escalation contact.
- Allowed message channels and sender identity.
- Approved templates and contact limit.
- Stop rules for replies, opt-outs, cancellations, complaints, and unknown states.
- Audit-log fields and retention period.
- Rollback method.
- Manual sample size and review date.
- QA commands and acceptance thresholds.

Recommended pilot: R1/R2 only, with a small sample of inquiry records. Produce briefs and drafts. Do not send messages or modify booking, attendance, pricing, or public website data.

## GitHub repository assessment

The following repositories were checked through the official GitHub API on 2026-09-28. Metadata confirms active public repositories, but it does not prove security, feature fit, or production readiness.

| Repository | Possible role | License signal | Fit now |
|---|---|---|---|
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | Workflow orchestration and webhooks | Sustainable Use License with restrictions; Enterprise-marked areas have separate terms | Do not adopt yet; licensing and operating scope need review |
| [activepieces/activepieces](https://github.com/activepieces/activepieces) | Workflow automation | MIT for core areas; enterprise areas have separate terms | Possible later sandbox; broad platform for this gap |
| [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) | Inbox and human conversation queue | MIT for core areas; enterprise areas have separate terms | Possible later inbox study; adds a full messaging system |
| [calcom/cal.diy](https://github.com/calcom/cal.diy) | Scheduler platform | MIT | Poor first choice; the site already has a Cal.com booking contract and provider migration history |
| [twentyhq/twenty](https://github.com/twentyhq/twenty) | CRM and record system | Mostly AGPLv3 with commercial-marked files and an application exception | High license and operating review burden |

### Integration conclusion

No candidate is approved for integration. A repository becomes worth a sandbox trial only when a local gap is written as a testable contract, for example:

```text
Input: approved Formspree or scheduler event
Output: durable lead record with stable ID
Must preserve: source, audience lane, attribution, consent boundary
Must support: owner, stage, next action, approval state, audit log
Must not do: confirm visits, change price, infer attendance, or send unapproved messages
Rollback: export records, disable connector, restore prior queue
```

The likely sequence is: define the contract locally, test a manual queue, then evaluate one narrow connector. Installing a full CRM before this step would add identity, privacy, permissions, backup, migration, and rollback risk.

## Orchestration plan

| Workstream | Read path | Write path | DoD |
|---|---|---|---|
| Workflow contract | `docs/ops/lead-to-member-workflow-map.md`, canonical data | This audit only | All 14 stages map to owner, action, proof, stop |
| Offers and policy | `src/_data/offers.json`, `pricing.json`, `free-intro.json` | None | No agent action crosses price, eligibility, or offer authority |
| Lead and booking | booking JS, form docs, funnel QA | None | Form, booking, receipt, confirmation, and attendance stay separate |
| Retention | retention docs, attendance sources | None | Activation remains a hypothesis until measured |
| Integration | official repository metadata and licenses | None | Candidate has a specific gap, license review, sandbox plan, and rollback |
| Governance | privacy, youth, analytics, deployment rules | None | Approval levels, protected fields, audit trail, and stop rules are explicit |

## Verification plan

Before any implementation:

1. Manually sample the current inquiry-to-visit path.
2. Record which workflow fields exist and which are missing.
3. Confirm the true source for form, scheduler, attendance, and continuation data.
4. Run existing funnel and privacy QA without changing public behavior.
5. Review false positives, missed records, and unsafe drafts.
6. Approve only the smallest next responsibility level.

Before any external repository trial:

1. Freeze a local contract and sample fixtures.
2. Read the complete repository license and data-handling documentation.
3. Run it in an isolated sandbox with synthetic data.
4. Test permissions, audit records, exports, failure behavior, and rollback.
5. Compare its burden with a small local queue.

## Final recommendation

Approve a **read-only and draft-only operations assistant pilot**. It should find missing work, prepare the next-action brief, draft messages, and stop at human decisions. Do not authorize automatic outbound messaging, appointment confirmation, enrollment, pricing decisions, or a GitHub CRM integration until the pilot produces evidence that the local contract and governance controls work.

