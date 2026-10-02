# Shiney Ticket checks

Prepared October 2, 2026. These records show what was checked. Real guest results need their own proof.

## Approved choices

- Use ST01 now. Keep the other nine cards blank.
- Use the name Shiney Ticket and campaign `shiney_ticket`.
- Give a new adult guest four free classes in two weeks with their friend.
- Sandy starts day one at the first attended class. That class counts as one of four. The final date is the local start date plus 13 calendar days.
- The adult first visit stays required. Same-day training, sparring, and The Sandy Challenge are choices. Sandy confirms the class, checks the waiver, and sets the rules.
- Keep the same $35 reward rules.

## Local checks

| Check | Evidence | Result |
|---|---|---|
| Site build | Eleventy and the existing asset tools | Pass |
| Current facts | `npm run qa:volatile-facts` | Pass, 1,061 files |
| First-visit policy | `qa-first-visit-contract.mjs` | Pass, 34 shared includes |
| Terms and youth flow | `qa-terminology-contract.mjs` | Pass, 25 routes |
| Site structure and links | `npm run qa:unified` | Pass |
| Phone and desktop | Chrome at 375 × 900 and 1440 × 1000 | Pass: no side scroll, main button in view, labels and focus states |
| Form | Local intercepted provider requests | Pass: adult age check, code, source URL, offer fields, error/retry, success focus, duplicate guard |
| Real form sends | Provider calls replaced with local replies | None |
| Booking fixture | Existing Cal.com recovery and confirmation fixture, with provider mocked | Pass: loader retry, lanes, accepted booking, deduplicated events, privacy |
| QR and PDFs | OpenCV decoded each PNG and each of ten PDF regions at 200 dpi | Pass: all match the new CSV links |
| Capacity | 128 URL bytes, 128 conservative NDEF/TLV bytes, below 504-byte NTAG215 user memory | Fits on paper |
| Print size | ST01 has one US Letter page; front/back panels 85.6 × 54 mm with scale bar | Digital check; physical print still pending |
| Reading level | Approximate Flesch–Kincaid estimates and manual plain-language review | Offer and changed shared policy prose estimated at grade 3 or below |

The reading estimate uses a small local syllable counter with explicit word overrides. It is not a certified reading test. Brand names, street address, and tiny headings are reviewed as labels; their isolated formula scores do not measure paragraph readability. The longest changed shared prose estimate is 2.94. The four copy rubrics are recorded in RELEASE.md.

The full `qa:cal-migration` scan found an existing missing `/assets/js/analytics-events.min.js` on the unrelated Hyphen Weekend route, plus old CSS references on unrelated routes. The affected booking fixture passes. Those unrelated pages are excluded from this release. `qa:definition-of-done` is not a script in this checkout; the available focused checks were used. No gate was weakened to mask those gaps.

## ST code update

Current codes are ST01–ST10. The site update is deployed and verified. See `CARD-CODE-RELEASE.md` and `card-code-qa.json` for the new QR, form and live checks. Historical release results retain their original GT codes. ST01 hardware checks below remain pending.

## Website release

See RELEASE.md for the exact payload, commit, backup, deployment, and live evidence. Local checks alone do not prove deployment.

## Physical pilot and real guests

| Step | State |
|---|---|
| Prior GT01 write, read-back and Android open | Passed, reported by Sandy; historical evidence only |
| ST01 rewrite to `utm_content=st01` | Pending |
| ST01 read-back and browser open | Pending |
| Actual printed QR scan | Pending |
| Actual inbox receipt with code and source URL | Pending |
| Blank logs copied to private storage | Pending |
| First member handoff | Pending |
| Sandy's activation and attended classes | Future guest outcome |
| Cleared payment and earned $35 | Future qualifying outcome |

A scan does not activate a pass. Staff keep the guest's fixed window and count attendance. Reusing ST01 does not renew that guest's window. Codes are public hints; Sandy confirms the referrer with the guest and handoff records. Backend delivery and staff operations still need real evidence.

No customer records are stored here. The existing deployment tool excludes this folder. Keep customer-filled copies in the private operations system.
