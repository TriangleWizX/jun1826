# Youth Intro Operations Runbook

## Before launch

1. Confirm the `content/offers.json` `free-youth-intro` entry and `config/youth-intro-availability.json` match the approved offer and current class lanes.
2. Set `OPS_API_KEY` for the protected admin API.
3. Connect the waiver provider so a verified waiver record sets `youth_intro_records.waiver_completed = 1`. The browser acknowledgment and admin checklist cannot substitute for this verification.
4. Set `YOUTH_INTRO_CONFIRM_SECRET` on the SMS provider webhook and send `POST /api/youth-intro/confirm` with `youth_intro_id` and `message` set to `CONFIRM` or `STOP`.
5. Approve message templates through the protected messages endpoint before queueing appointment messages. A delivery worker/provider must consume queued rows and call the failed-delivery action when delivery fails.

## Daily operations

- Use `/admin/youth-intro.html` to review records, approve partner/date overrides, confirm only records with verified waivers, record reschedules, and complete the attended-intro checklist.
- Use `GET /api/youth-intro/report` with the ops key to review funnel counts, non-enrollment reasons, and the first-20-attended cohort.
- Keep accommodation notes inside the protected operational system; never copy them into analytics dimensions, URLs, or outbound merge fields.

## Campaign expiry

Christmas in July remains active through August 2, 2026. On or after August 3, run:

```bash
npm run campaign:expire-christmas -- --apply
```

The script removes campaign surfaces and sitemap entries, archives the offer, adds the historical redirect, and marks the retained campaign page `noindex,nofollow`. Run the youth, SEO, link, and offer validation checks afterward.

## Current deployment dependencies

The repository provides the protected queue, webhook contract, waiver gate, and report, but it does not include a waiver-provider callback, SMS delivery provider, live roster feed, or historical attended-intro cohort. Those must be connected and tested before claiming the controlled-launch and first-20 review phases complete.
