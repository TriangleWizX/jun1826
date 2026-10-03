# The Mountain Tap Card: Android NFC Setup

Scope: Program cards with program label **MTP**. All cards share the unified Mountain Tap Card link:

`https://senseisandy.com/bring-a-friend?utm_source=member_referral&utm_medium=offline&utm_campaign=mountain_tap_card&utm_content=mtp`

Use the free NFC Tools app from Wakdev and an Android phone with NFC. The developer confirms NTAG215 support and URL record writing. An NFC Tasks automation record is unnecessary for this job. Guests need a compatible phone/browser or the QR fallback.

## Programming cards (MTP)

1. Enable NFC in Android settings. Charge/unlock the phone. Remove metal accessories if they interfere.
2. Open NFC Tools → Read. Hold the card near the phone's NFC antenna until detected. Antenna position differs by phone. Verify NTAG215, writable status, and available space.
3. Label it **MTP** or use the matching nonmetallic print label.
4. Open Write → Add a record → URL/URI. Enter the exact URL: `https://senseisandy.com/bring-a-friend?utm_source=member_referral&utm_medium=offline&utm_campaign=mountain_tap_card&utm_content=mtp`. Ensure the saved record has exactly one `https://` prefix.
5. Keep one web-address record. Write it to the card. Leave the tag rewritable. Do not set permanent lock bits or a password.
6. Read it back. Compare the entire URL, particularly `utm_campaign=mountain_tap_card` and `utm_content=mtp`. Check the link is `senseisandy.com/bring-a-friend`.
7. Close the writing screen, unlock the phone, and tap the card as a guest would. Open the browser prompt. Confirm The Mountain Tap Card page with four free classes, MTP in the program label field, the request form, and the text fallback.
8. Scan the printed MTP QR with the phone camera. It must open the identical URL.
9. Hand cards to members. Tracking sequential numbers like ST02, ST03 is unnecessary; **tracking the friend who is referring is the primary tracking mechanism**.

## Print and physical finish

Print `mountain-tap-card-MTP.pdf` at 100% / actual size, with Fit-to-page disabled. Measure the one-inch scale bar. Each panel is 85.6 × 54 mm, a common bank-card size; measure your blank cards before trimming. The sheet places a front and a back beside each other with program label MTP.

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
