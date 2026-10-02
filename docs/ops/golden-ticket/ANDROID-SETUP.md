# Shiney Ticket: ST01 on Android

Current scope: ST01 only. Rename the pilot card and write the new link below. The old GT01 link passed Sandy's Android check; ST01 needs a new write, read-back, tap and printed QR scan. Keep the other nine cards blank.

`https://senseisandy.com/bring-a-friend?utm_source=member_referral&utm_medium=offline&utm_campaign=shiney_ticket&utm_content=st01`

Use the free NFC Tools app from Wakdev and an Android phone with NFC. The developer confirms NTAG215 support and URL record writing. An NFC Tasks automation record is unnecessary for this job. Guests need a compatible phone/browser or the QR fallback.

## Do ST01 first

1. Enable NFC in Android settings. Charge/unlock the phone. Remove metal accessories if they interfere. Put nine cards aside so you work with one tag at a time.
2. Open NFC Tools → Read. Hold ST01 near the phone's NFC antenna until detected. Antenna position differs by phone. Verify NTAG215, writable status, and available space. If it is locked or differs from the purchased type, set it aside and record the result.
3. Label it ST01 in plain ink or with the matching nonmetallic label. A gold color is fine; metal foil can interfere with the antenna. Test again after applying any finish.
4. Open Write → Add a record → URL/URI. Enter the exact `url` from ST01's row in `card-urls.csv`. Menu labels can vary by app version. Ensure the saved record has exactly one `https://` prefix.
5. Keep one web-address record. Write it to ST01. Leave the tag rewritable during the pilot. Do not set permanent lock bits or a password as part of these instructions.
6. Read it back. Compare the entire URL, particularly `utm_campaign=shiney_ticket` and `utm_content=st01`. Check the link is `senseisandy.com/bring-a-friend`, not the general first-visit calendar or a third-party shortener.
7. Close the writing screen, unlock the phone, and tap the card as a guest would. Open the browser prompt. Confirm the Shiney Ticket page with four free classes, the code in the address bar, the request form, and the text fallback. A tap opens the page. Sandy confirms the class and starts the pass at the first attended class.
8. Scan ST01's printed QR with the phone camera. It must open the identical URL. Test at the actual printed size, not only on a large computer display.
9. Record Android model, test date, read-back success, browser success, and printed-QR success in the private register. If available, try another NFC-capable phone too. Cross-device behavior remains unverified until tested.
10. Stop at ST01 for this pilot. If Sandy later expands, use each remaining card's own code and matching label.

## Print and physical finish

Print `shiney-ticket-ST01.pdf` at 100% / actual size, with Fit-to-page disabled. Measure the one-inch scale bar. Each panel is 85.6 × 54 mm, a common bank-card size; measure your blank cards before trimming. The sheet places a front and a back beside each other for each code; cut and apply as pairs. It is not a duplex alignment template or an Avery stock template.

Use plain nonmetallic adhesive paper or a sleeve that leaves the card readable. The QR has black modules on white, including its quiet zone. Keep glue, cuts, foil and decoration away from the QR. The functional label is deliberately simple; no image editor or paid printing service is required.

## Why these records fit

NXP's NTAG215 datasheet specifies 504 bytes of user read/write memory. Each CSV row reports the complete UTF-8 URL byte length and conservative NDEF/TLV requirement for one short URI record using the HTTPS prefix code. These payloads fit below that capacity. Actual usable space and writability still need the physical read check.

A permanent tag lock is irreversible. Pilot cards stay rewritable so a route can be corrected later. Card URLs are public and copyable; the business verifies referral eligibility through private records, not through tag possession.

## Request-delivery check

The current Friend Pass source copies the full page URL into the hidden `source_url` field and sends it with the form. Local tests can prove that intended payload; only a real receipt proves delivery.

For the first consenting real guest, use the tagged link, submit the existing request, and check Sandy's actual inbox/system for the request and the full source URL. Compare the card code with the issue register. Record the private receipt reference. Do not submit fabricated guest data or count a staff test as a referral. If the code is missing, ask the guest for the printed code and inviting member; preserve the request and fix the attribution separately.

If a controlled test is preferred, explicitly label it as a staff test, use authorized staff details, exclude it from all metrics, and arrange it through Sandy. This kit has not submitted one.

## Recovery

- Tap fails: verify NFC is enabled; try another phone position; move other tags away; remove interfering case/metal; read in NFC Tools; use QR meanwhile.
- Wrong destination/code: rewrite the one URL record, read it back, and repeat browser and QR checks. Replace the wrong physical label if needed.
- Card lost: mark it lost. Its URL cannot be remotely disabled independently while using this existing page. Confirm referrals manually. Do not treat the code as a redeemable voucher.
- Page unavailable: use the printed phone number or `senseisandy.com/bring-a-friend` when available; Sandy confirms visits manually. Do not hand out additional cards until the link works again.

Sources checked during preparation: [NXP NTAG213/215/216 datasheet](https://www.nxp.com/docs/en/data-sheet/NTAG213_215_216.pdf), especially user memory and irreversible lock bits; [Wakdev NFC Tools for Android](https://www.wakdev.com/en/apps/nfc-tools.html).
