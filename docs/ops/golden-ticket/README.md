# The Shiney Ticket: adult friend referral engine

Started October 1; prepared October 2, 2026. Owner: Sandy. Scope: ST01-only pilot from ten existing NTAG215 PVC cards, adult friends first, Android programming, the existing reserved Friend Pass class, and the existing $35 referral credit. These choices were confirmed by Sandy in this conversation.

## Start here

The guest gets four free classes in two weeks. Train with the friend who gave you the card. Sandy starts the pass at the first attended class. That class counts as one of four. That date is day one. Use all four by the end of day 14. Sandy sets each class and gives the guest the end date. The member earns the same $35 credit when the friend's first eligible 12-week plan payment clears.

1. Read [the playbook](PLAYBOOK.md) for the offer, handoffs, economics, and weekly decisions.
2. Rewrite the pilot card with the new `shiney_ticket` link and `utm_content=st01`. Read it back, then tap it with NFC Tools closed. These ST01 checks passed October 2, 2026.
3. Use [the ST01 print sheet](shiney-ticket-ST01.pdf) at actual size. It contains one front/back pair and a scale check. The matching QR and NFC record use the same link.
4. Scan the printed ST01 QR. Leave ST02–ST10 blank and in reserve.
5. Put copies of the blank CSV templates in your existing restricted operations storage before recording people or transactions. Keep this repository's copies blank.
6. Give ST01 to one willing adult member for one friend. Learn from this first handoff before expanding.

## Files

| File | Use |
|---|---|
| `PLAYBOOK.md` | Deep-dive strategy, numbered operations, reward rules, recovery, measurement |
| `ANDROID-SETUP.md` | Write, read back, test, and recover a card |
| `COPY.md` | Member invitation, guest explanation, follow-up, card copy |
| `card-urls.csv` | Ten prepared NFC/QR payloads and capacity calculation; only ST01 active |
| `shiney-ticket-ST01.pdf` | Active pilot: one printable front/back pair |
| `card-labels.pdf` | Optional future expansion: ten pairs, not instructions to issue more cards |
| `qr/ST01.png` through `qr/ST10.png` | Functional QR codes; each matches its card URL |
| `card-register.csv` | ST01 ready for member handoff; nine unprogrammed reserves |
| `issue-cycles.csv` | One row each time a member receives a card |
| `referrals.csv` | One row per unique guest; separate from card custody |
| `class-attendance.csv` | One row per attended class; count four within the guest's own window |
| `rewards.csv` | Earned, redeemed, and outstanding credit transactions |
| `weekly-scorecard.csv` | Blank cohort/count/cost review template |
| `LEDGER-GUIDE.md` | Field definitions, evidence rules, and reward reconciliation |
| `VERIFICATION.md` | Evidence, limitations, copy review, and completion gates |
| `RELEASE.md` | Website scope, tests, and rollback notes |
| `render-kit.py` | Render the labels from approved CSV URLs; leave private ledgers unchanged |

## Name and link

The name is **Shiney Ticket**, with Sandy's exact spelling. All current card labels use ST01–ST10. New links use `utm_campaign=shiney_ticket` and `utm_content=st01` through `st10`. The form maps old GT codes to matching ST codes and keeps the original source URL for the record. Past GT01 hardware checks remain in `history/card-register-before-st.csv`; they do not prove the new ST01 write or scan.

## Current status

The website and kit now share the four-class offer. See RELEASE.md and CARD-CODE-RELEASE.md for release evidence. ST01 rewrite, tap, printed QR, and inbox receipt checks passed. Member handoff and guest results remain operational steps. The form tests use a local mock. This kit sends no messages or real forms.

Adults meet Sandy for a first visit before class. They can choose to train that day. Sandy confirms the class first. Sparring and The Sandy Challenge are choices too. Youth keep their own visit and class plan. A tap or scan opens the page. Sandy starts the pass at the first attended class, using each guest's own record.
