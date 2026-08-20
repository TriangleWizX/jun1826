# Fall 2026 Practice Schedule Rollout

Internal draft. Do not send or publish without owner review.

## Member message — send August 25

Subject: Your fall class times stay the same

Hi [Name],

Your class times are staying the same this fall: Youth at 5:00 PM and Adults at 6:00 PM.

The format change is limited to Monday:

- Monday: No-Gi
- Tuesday: Gi
- Wednesday: No-Gi
- Friday: Gi / Friday Gi Lab
- Saturday: Adult No-Gi at 10:30 AM

Placement and orientation week begins September 8. The full Fall Practice Schedule begins Monday, September 14. Please choose three home classes you can protect each week. Text Sandy if school transportation, another sport, or a recurring conflict affects your choices.

Wear the academy gi and belt on Gi days. Wear a rashguard or fitted athletic clothing on No-Gi days; no physical belt is worn for No-Gi.

The goal is a stable routine through October 23 so we can learn what works for families. Reply here if you want help choosing your three days.

— Sandy

## Lead email — send August 29–30

Subject: Build a fall routine they can keep

School begins September 3. A new school year is easier to manage when the after-school plan is clear.

Fall placement begins September 8, and the full Fall Practice Schedule begins September 14. Class times stay steady: Youth at 5:00 PM and Adults at 6:00 PM.

Youth have two Gi and two No-Gi options. Adults have No-Gi Monday, Wednesday, and Saturday, plus Gi Tuesday and Friday. We help each student choose three realistic weekly practices around transportation, school, and other sports.

Book a Free Intro to tour the room, ask questions, and map a first class.

CTA: https://senseisandy.com/free-bjj-intro-tannersville-ny?campaign=fall_reset

## Parent-facing post — publish August 27

### Fall Practice Schedule

The class times are staying the same. The Monday format is changing.

Youth and teens:

- Monday 5:00 PM — No-Gi
- Tuesday 5:00 PM — Gi
- Wednesday 5:00 PM — No-Gi
- Friday 5:00 PM — Friday Gi Lab

Placement begins September 8. The full weekly format begins September 14. The included gi supports Tuesday and Friday training; No-Gi classes use fitted athletic clothing and no physical belt.

See the Fall Schedule: https://senseisandy.com/schedule?campaign=fall_reset

## Athlete version — supporting post

Keep soccer, skiing, wrestling, basketball, or your other primary sport. Add one or two coached mat hours that fit the week.

No-Gi Monday and Wednesday can be a lower-friction entry point. Gi Tuesday and Friday keep uniform practice part of the routine. Class times stay unchanged.

This is the athlete version of the Fall Practice Reset, not a separate discount or enrollment system.

CTA: https://senseisandy.com/athlete-cross-training?campaign=athlete_cross_training

## In-studio sign

FALL PRACTICE SCHEDULE

Placement begins September 8
Full weekly format begins September 14

Times stay the same:
Youth 5:00 PM · Adults 6:00 PM

Monday + Wednesday: No-Gi
Tuesday + Friday: Gi
Saturday: Adult No-Gi, 10:30 AM

Ask Sandy to map your three home classes.

## Instructor script

Monday and Wednesday are No-Gi. Tuesday and Friday are Gi. Class times have not changed. We are keeping the schedule stable through October so we can see which routine families can sustain.

If a family mentions a conflict, record the day, time, transportation issue, whether another sport is involved, and whether the conflict is recurring. Do not promise a different class time during this measurement period.

## Campaign tracking links

Use one source value per link. The booking flow forwards `campaign`, lane, preferred days, sport context, transportation constraints, and recurring time conflicts into the scheduling URL and analytics payload.

| Placement | URL | Source |
| --- | --- | --- |
| Fall Practice Reset | `/free-bjj-intro-tannersville-ny?campaign=fall_reset` | `fall_reset` |
| Athlete Cross-Training | `/athlete-cross-training?campaign=athlete_cross_training` | `athlete_cross_training` |
| Member referral | `/free-bjj-intro-tannersville-ny?campaign=member_referral` | `member_referral` |
| Google Business Profile | `/free-bjj-intro-tannersville-ny?campaign=google_business` | `google_business` |
| Instagram | `/free-bjj-intro-tannersville-ny?campaign=instagram` | `instagram` |
| Email | `/free-bjj-intro-tannersville-ny?campaign=email` | `email` |
| SMS | `/free-bjj-intro-tannersville-ny?campaign=sms` | `sms` |

## Operational timing

- August 24: Studio closed; verify website, booking labels, roster, and scheduled drafts.
- August 25: Tell current members first.
- August 27: Publish the parent-facing explanation.
- August 29–30: Begin the public Fall Practice Reset campaign.
- September 8–12: Placement and orientation week.
- September 14–October 23: Measure the stable schedule.
- October 5: Interim data-quality review; do not change the schedule.
- October 12: Run the regular academy schedule; document the minor-holiday treatment in the hours reference.
- October 26: Review the six-week scorecard and decide what continues.

## Date-specific reminders

### September 3 — first day of school

School starts today. Build the fall routine around the week you can actually protect. Placement begins September 8, and the full Fall Practice Schedule begins September 14. Book a Free Intro to map the right starting class.

### September 5 — Saturday and Labor Day reminder

Adult No-Gi runs Saturday at 10:30 AM. The academy is closed Monday, September 7 for Labor Day. Monday students receive priority makeup space during placement week, September 8–11.

### September 7 — one placement reminder

The academy is closed today for Labor Day. Placement week begins tomorrow. Please text Sandy with the three classes you can protect each week; Monday students receive priority makeup space September 8–11.

### Placement-week staff prompts

- September 8: Confirm home-class choices, campaign source, and Gi clothing expectations.
- September 9: Ask athletes how No-Gi fits beside their primary sport and record recurring conflicts.
- September 11: Follow up with members who still lack three viable home classes.
- September 12: Close initial placement and produce the Monday roster.

## Scorecard command

After exporting the attendance ledger, run:

```bash
node scripts/fall-pilot-scorecard.mjs /path/to/attendance-export.csv
```

The report compares observed pre-pilot Mondays with pilot Mondays, Tuesday/Friday controls, median attendance, fill rate at the 12-person capacity, and late-arrival rate. It fails closed by listing reservation, roster, campaign, and conflict fields that still need to be joined before the October 26 decision.
