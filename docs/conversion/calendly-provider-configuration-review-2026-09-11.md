# Calendly provider configuration review — 2026-09-11

## Purpose

This is a provider-side review for the `BJJ Goal Mapping Session` event used by `/free-bjj-intro-tannersville-ny`. It separates verified provider behavior from local site behavior and avoids changing operating facts, availability, pricing, class entitlement, or attendee data.

## Evidence reviewed

### Verified in the live provider widget

- Event: **BJJ Goal Mapping Session**
- Duration: **15 minutes**
- Location: **Sensei Sandy BJJ, 6045 Main Street, 2nd Floor Studio**
- Visitor-facing explanation: a goal-and-schedule mapping conversation before the coached first class.
- Current availability includes selected weekday and Saturday appointment slots.
- The booking form requires a name, email, training party, student age(s), main goal, workable weekly windows, and a free-text field for training history, mobility, injuries, preferences, or questions.
- Phone is optional.

### Verified on the local site

- All visitor lanes use the same verified Goal Mapping event.
- The page describes this as a 15-minute normal-clothes visit and does not promise same-day youth participation.
- Desktop/tablet uses an inline provider widget; mobile opens the provider popup.
- Completion is owned by `js/progressive-booking.js` and deduplicated by the provider event reference.

### Not verified

- A real provider appointment was not created during this review.
- Provider confirmation email, calendar-invite delivery, cancellation workflow, attendee notification, fulfillment, attendance, and analytics receipt were not tested.

## Step-by-step assessment

### 1. Keep the one-event model

**Recommendation: no change.**

The same Goal Mapping event correctly gives the academy a single operational intake point while the local page supplies the audience lane as a non-provider parameter. Creating separate child, teen, adult, family, or discount events would multiply inventory, reporting, cancellation, and staff-maintenance risk without verified operational benefit.

### 2. Keep duration and location as configured

**Recommendation: no change.**

Fifteen minutes matches the local page's promise and keeps the appointment scoped to orientation and planning. The verified studio location matches the provider event. Do not alter duration, location, buffers, host assignment, or availability without the academy's operational owner confirming the new contract.

### 3. Reduce required intake to the information needed before a first conversation

**Recommendation: change after staff review.**

The current required questions create a long form before the visitor has established a time. The high-value, scheduling-critical questions are:

1. Who is training?
2. Student age or ages, when a child or teen is involved.
3. Main goal.
4. A realistic weekly window.

Make the long history/mobility/injury/preferences field optional and label it `Anything Sandy should know before your first visit? (optional)`. A free-text medical or injury disclosure should never be framed as required before a first conversation. The academy can collect any essential safety information at the appropriate point with its approved policy and consent flow.

### 4. Use conditional questions by party type

**Recommendation: change if Calendly's current plan supports routing/conditional questions.**

Ask `Student age or ages` only when the visitor chooses child, teen, or more than one family member. Adults should not have to pass an irrelevant age field. If the provider cannot conditionally display it, make the field optional and explain its purpose in the label.

### 5. Preserve email and keep phone optional

**Recommendation: no change.**

Email is necessary for the provider confirmation and calendar invite. An optional phone field respects visitors who prefer not to provide a number in a third-party scheduler; the local confirmation form separately requests a mobile number only when a visitor elects to send preparation details.

### 6. Clarify the confirmation and cancellation contract

**Recommendation: change after confirming the academy's actual process.**

Provider confirmation copy should state:

- This reserves a 15-minute Goal Mapping visit, not a coached class.
- The invite contains the scheduled date and time.
- Visitors can use the provider cancellation/reschedule link, or text Sandy when they need help.

Do not add arrival times, waiver requirements, class promises, rates, or rescheduling penalties unless they come from the canonical operating authority.

### 7. Set a sensible cancellation and rescheduling policy only if it reflects practice

**Recommendation: verify before changing.**

If the provider event currently allows self-service rescheduling, retain it. If it does not, enable it only after staff confirms capacity and notification implications. A restrictive cancellation window should not be added as a conversion tactic; it must reflect a real operating policy and be documented consistently on the public site.

### 8. Protect attribution without collecting sensitive answers in analytics

**Recommendation: no provider-side tracking change required.**

The site already forwards campaign parameters and records only funnel state. Keep provider custom-answer data out of analytics payloads, page URLs, client logs, and exported reports. If Calendly supports provider-side source attribution, restrict it to campaign/source fields rather than free-text answers.

### 9. Test with one controlled appointment before changing live form requirements

**Recommendation: required validation step.**

Use synthetic details and a deliberately cancellable slot:

1. Select a real available slot.
2. Complete every required provider field.
3. Confirm the provider success screen and calendar invite acknowledgement.
4. Confirm the parent page advances to `Your first visit is booked.` exactly once.
5. Submit the optional local preparation form only with synthetic details.
6. Capture whether the provider supplies a cancellation link.
7. Cancel the appointment immediately.

Report provider confirmation, local completion, follow-up acknowledgement, and cancellation as separate observations.

## Prioritized change list

| Priority | Provider change | Why | Approval needed |
| --- | --- | --- | --- |
| P1 | Make the history/mobility/injury free-text question optional. | Lowers first-booking friction and avoids requiring sensitive disclosures. | Staff owner confirms intake policy. |
| P1 | Make age conditional for youth/family selections, or optional when conditional logic is unavailable. | Removes irrelevant adult form friction. | Staff owner confirms provider-plan capability. |
| P2 | Rewrite provider confirmation to distinguish the planning visit from the coached first class. | Keeps appointment expectations aligned across provider and site. | Staff owner confirms operational wording. |
| P2 | Verify self-service cancellation/rescheduling configuration and notification behavior. | Prevents an untested operational promise. | Staff owner confirms policy. |
| P3 | Add provider-side campaign attribution only if it excludes custom-answer content. | Improves acquisition reporting without expanding data collection. | Analytics owner confirms taxonomy. |

## Do not change without operational approval

- Event name, duration, location, timezone, host, buffers, availability, capacity, pricing, cancellation windows, invitee notifications, or reminder cadence.
- Any question that implies medical screening, consent, waiver acceptance, eligibility, or a guarantee.
- Provider integrations, webhooks, routing forms, automated messages, or payment settings.

## Decision

The event architecture itself is sound: one Goal Mapping event, a 15-minute planning appointment, and an optional phone field should remain. The only high-confidence improvement is reducing the required sensitive free-text intake and making youth age conditional where the provider supports it. Make those changes only after the academy confirms the required operational intake and provider-plan capability.
