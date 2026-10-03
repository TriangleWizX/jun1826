# The Mountain Tap Card: adult friend referral engine

Started October 1; updated October 3, 2026. Owner: Sandy. Scope: The Mountain Tap Card referral program with program label **MTP**, adult friends first, Android/NFC programming, the existing reserved Friend Pass class, and the existing $35 referral credit.

## Start here

The guest gets four free classes in two weeks. Train with the friend who gave you the card. Sandy starts the pass at the first attended class. That class counts as one of four. That date is day one. Use all four by the end of day 14. Sandy sets each class and gives the guest the end date. The member earns the same $35 credit when the friend's first eligible 12-week plan payment clears.

1. Read [the playbook](PLAYBOOK.md) for the offer, handoffs, economics, and weekly decisions.
2. Program cards with the unified Mountain Tap Card link: `https://senseisandy.com/bring-a-friend?utm_source=member_referral&utm_medium=offline&utm_campaign=mountain_tap_card&utm_content=mtp`. Read it back, then tap it with NFC Tools closed.
3. Use [the MTP print sheet](mountain-tap-card-MTP.pdf) at actual size. It contains one front/back pair and a scale check. The matching QR and NFC record use the same link.
4. Scan the printed MTP QR code.
5. Put copies of the blank CSV templates in your existing restricted operations storage before recording people or transactions. Keep this repository's copies blank.
6. Give Mountain Tap Cards (MTP) to willing adult members for their friends. Tracking sequential numbers like ST02, ST03, etc. is unnecessary; **tracking the friend who is referring is the primary tracking mechanism**.

## Files

| File | Use |
|---|---|
| `PLAYBOOK.md` | Deep-dive strategy, numbered operations, reward rules, recovery, measurement |
| `ANDROID-SETUP.md` | Write, read back, test, and recover an MTP card |
| `COPY.md` | Member invitation, guest explanation, follow-up, card copy |
| `card-urls.csv` | Active MTP NFC/QR payload and capacity calculation |
| `mountain-tap-card-MTP.pdf` | Active program print sheet: front/back pair with scale check |
| `card-labels.pdf` | Optional label sheet, program label MTP |
| `qr/MTP.png` | Functional QR code matching the MTP program URL |
| `card-register.csv` | MTP program active status and transition record |
| `issue-cycles.csv` | One row each time a member receives a card |
| `referrals.csv` | One row per unique guest; tracks referring member as primary key |
| `class-attendance.csv` | One row per attended class; count four within the guest's own window |
| `rewards.csv` | Earned, redeemed, and outstanding credit transactions |
| `weekly-scorecard.csv` | Blank cohort/count/cost review template |
| `LEDGER-GUIDE.md` | Field definitions, evidence rules, and reward reconciliation |
| `VERIFICATION.md` | Evidence, limitations, copy review, and completion gates |
| `RELEASE.md` | Website scope, tests, and rollback notes |
| `render-kit.py` | Render the labels from approved CSV URLs; leave private ledgers unchanged |

## Name, link, and tracking mechanism

The name is **The Mountain Tap Card**. The program label is **MTP** (replacing legacy ST01/GT01 notation). Links use `utm_campaign=mountain_tap_card` and `utm_content=mtp`. The form maps legacy ST and GT codes directly to MTP while preserving the full original source URL for the record.

**Primary tracking mechanism:** Tracking sequential numbers (ST01, ST02, ST03, etc.) on cards is unnecessary. The **referring member (the friend who is referring)** is the primary tracking mechanism. When a guest submits the form or contacts Sandy, Sandy identifies the referrer from the member's name and phone number and attributes the $35 referral credit directly to that member when the guest enrolls.

## Current status

The website and kit share the four-class offer. MTP write, tap, printed QR, and form handling checks passed. Member handoff and guest results remain operational steps. The form tests use a local mock. This kit sends no messages or real forms.

Adults meet Sandy for a first visit before class. They can choose to train that day. Sandy confirms the class first. Sparring and The Sandy Challenge are choices too. Youth keep their own visit and class plan. A tap or scan opens the page. Sandy starts the pass at the first attended class, using each guest's own record.
