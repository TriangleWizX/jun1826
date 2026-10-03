# Private ledger setup

The private working Google Sheet is ready: **The Mountain Tap Card — MTP log**. See PRIVATE-LOG.md for its tabs and verification. Use that sheet for live entries; keep these source CSVs blank.

The guest, issue, reward and scorecard CSVs are blank templates. The card register tracks the active MTP program code and contains no customer data. Past GT01/ST01 hardware proof is saved in `history/`. Import copies into your existing private spreadsheet or operational system. Restrict access to people who handle referrals. Keep names, phone numbers, email, payment details, and health information out of repository files and NFC/QR links. Use opaque internal references in private copies; they can still link to personal records and need access controls.

Dates: ISO format (`2026-10-03`); use full local date/time with offset where appointment ordering matters. Blank means unknown or not yet occurred. A blank is not a failed conversion. Use one internal guest reference per actual person; look for existing records before adding another.

## Program register & tracking mechanism

The active program label is **MTP**. Tracking sequential numbers (ST01, ST02, ST03, etc.) on cards is unnecessary. The **referring member (the friend who is referring)** is the primary tracking mechanism. Cards are physical tokens programmed with the unified MTP program URL (`utm_campaign=mountain_tap_card&utm_content=mtp`).

Record read-back, browser, and printed-QR checks as `pass`, `fail`, or blank. Evidence can identify the operator/date/device in a private record.

## Issue cycles

One row per handoff to a member if tracked. A member's report proves an invitation report, not attendance.

## Guest progress & referring friend attribution

Each unique guest gets one referral row. **The primary tracking key is the referring member's name and phone number.** When the guest submits the form, calls, or texts, Sandy records the referring member. Attribution is confirmed directly with the guest and referring member before assigning reward credit.

`engaged_at`: actual inbound request/conversation. `class_confirmed_at`: Sandy confirmed the arrangement. `scheduled_class_at`: when the class will occur. `class_attended_at`: actual attendance. `joined_at`: accepted enrollment. `first_payment_cleared_at`: verified cleared payment. These are distinct facts.

For staff tests, keep records in a separate test log and exclude them from these operational guest rows. Evidence references point to private requests, booking confirmations, attendance records, and payment records; do not paste their sensitive contents into shared reports.

## Four classes and the end date

Keep one activation per unique guest. `ticket_activated_at` is the first attended class, recorded by Sandy in New York time. `activated_by` is Sandy. `activation_date` is its local calendar date and counts as day one. `last_valid_date` = activation date + 13 calendar days, through the end of that local day. Example: October 2 gives a final date of October 15. Use calendar dates across daylight-saving changes, rather than adding 336 hours.

The first visit, tap, scan, form request, and cancelled class do not activate the pass. A guest who only visits stays unactivated. Give the guest their end date when they first train. Record `classes_used` as 1 at activation, then increase only for actual attended classes, up to 4. `ticket_status` can be `not_started`, `active`, `used`, or `expired`. Sandy confirms each class and the friend's attendance.

Use `class-attendance.csv` for one row per real class. Link `referral_id`; record a unique sequence 1 through 4, attendance time, and confirming staff evidence. Before class, confirm the guest is within their own window and has classes left. Keep that guest's first activation date fixed when ST01 returns, is tapped again, or is handed to another person. Look up existing guest records to prevent a fresh window for the same person. Staff handle this check; the website has no automatic expiry engine.

## Reward transactions

Keep one append-only transaction row for each earned credit or redemption. `transaction_type` is `earned`, `redeemed`, or `authorized_adjustment`. Use positive amounts for earned and redeemed entries; an adjustment uses a signed amount with a specific Sandy decision reference. Do not create adjustments automatically because of returns, lost cards, or refunds.

Before `earned`: confirm one new referred student, first twelve-week enrollment, cleared first payment, eligible referrer, existing exclusions, and no earlier earned reward for the same guest. Enter `$35.00` with the private payment evidence reference. A returned card, form request, or attendance event cannot earn a credit by itself.

Before `redeemed`: check the member's available balance and selected permitted use: `gear`, `event`, or `account`. Record actual value used. Partial redemption leaves a balance. Do not let it go negative. Track fulfillment cost separately if useful; reward face value and merchandise cost are different measures.

Balance = sum(earned) − sum(redeemed) + sum(authorized adjustments). Reconcile across all past periods, not just this week's new rewards. Record all exceptions privately. The template does not automate payments, credit issuance, duplicate prevention, or policy decisions.

## Weekly scorecard

Pick one invitation cohort or clearly label a period activity report. Do not divide unrelated period totals into a claimed cohort conversion rate. Show raw counts first. A later-joining guest updates their original cohort; future classes and immature thirty-day windows stay out of due-event denominators.

Record setup, printing, delivery and follow-up costs using actual amounts and a stated staff-time rate. Include earned credit face value once in acquisition costs. Outstanding liability uses all historical transactions. Review the next action and owner for every open referral, then check physical inventory.

No real customer data, outcomes, revenue, or rewards have been prefilled.
