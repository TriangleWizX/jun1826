# VSL plan verification

Checked October 2, 2026, against the current local checkout.

## Deliverables

- [PLAN.md](PLAN.md): offer, four-position learning checks, attendance target, confirmation and follow-up flow, footage needs, retakes, and measurement.
- [SCRIPT.md](SCRIPT.md): all eight recording sections, overlays, social cut, short messages, and learning prompts.
- [copy.json](copy.json): exact student-facing copy used for the script and checks.
- [check-copy.py](check-copy.py) and [readability.json](readability.json): reproducible reading-level estimates.

The October 1 production, objection-led, InShot walkthrough, and Sandy recording documents now point to this iteration. Their earlier content remains as recording history.

## Adult first-day policy

Verified in `src/_data/free-intro.json` and the public entry offer in `src/_data/offers.json`:

1. The required fifteen-minute goal-setting visit happens before training.
2. An adult can elect a class that same day, subject to Sandy's confirmation, or choose a later class.
3. Visit-only guests wear day clothes. Training guests use clean sports clothes and Sandy's class-specific instructions.
4. Consent, waiver, and suitable partner matching apply before training. Live partner practice remains elective.

The VSL counts an attended same-day first class as the free class, class one of four. The goal-setting visit alone does not count as a class. Classes two through four use the student's chosen paid plan. The fourteen-day learning window begins at the first attended class.

## Checks

| Check | Result |
|---|---|
| `python3 docs/ads/vsl-four-position-2026-10-02/check-copy.py` | Passed. Master: 381 words, Flesch-Kincaid grade estimate 0.26. Highest full block/support message: 1.22. |
| `node scripts/qa-first-visit-contract.mjs` | Passed, including 34 propagated acquisition includes and the shared partial. |
| `npm run qa:volatile-facts` | Passed, 1,061 files checked. |
| Manual script and plan review | Same-day order, elective choice, clothing, free/paid distinction, four positions, and learning checks agree. |

Reading scores are estimates. Short labels were reviewed manually. Recheck messages after replacing their placeholders, and captions after recording. The four-position assessment checks actual student understanding separately from attendance.

## Remaining production work and limits

Record the new takes, select the real footage, edit the video, and review the final cut. Retake S02 and S06 first; capture S03 and S04 with one matching clip for each position. Youth footage requires permission for its intended use.

Paid-price sources conflict; the plan documents the specific records. Sandy needs consistent written price, term, frequency, and inclusion details before enrollment. The price-free script does not resolve those records.

This work completes the plan and recording-copy iteration. It does not establish a recorded or published video, live website verification, attendance gains, or delivered learning outcomes. No canonical policy, price, website, deployment, booking, or customer message was changed by this planning iteration.
