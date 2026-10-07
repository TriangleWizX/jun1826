# Current VSL verification

## Revision resolved

The subsequent VSL revision replaces the claims identified in this original audit. S03 describes a coaching exchange; S04 uses documented biography; S05 removes competitor attacks; S06/S07 preserve confirmed adult/youth entry; S08/S09 preserve student choice; S10 uses visit planning. The checker now covers overlays and production-document parity as well as spoken/supporting copy. All estimates are below Grade 3, and the rewritten package REVIEW.md documents the four rubric criteria without unsupported performance scores. Independent review found no substantive unresolved copy issues. The findings below are historical and superseded for the revised copy. Recorded delivery, footage permission, final edit/captions, and publication remain separate production work.

Package: `docs/ads/vsl-sandy-framework-2026-10-05/`.

The existing `check-copy.py` was rerun against the current `copy.json`. Its report was redirected to `evidence-2026-10-06/vsl-readability-current.json`, preserving the package's existing readability artifact. The command exited 0. All eleven spoken blocks, their combined master, and both supporting texts meet its Grade 3 threshold and prohibited-token check. The master has 448 words and an estimated grade of 1.79.

## What that check covers

The checker uses CMU pronunciations and explicit overrides to estimate Flesch–Kincaid grade. It checks spoken strings and supporting copy. It does not check overlay text, captions, consistency between JSON and Markdown/take notes, passive voice, factual accuracy, production duration, or rubric scores. The handoff's description of an automated passive-voice check is unsupported by the script.

## Open release blockers

1. S10 asserts a weekly cap on intro spots and first-come allocation. `src/_data/free-intro.json` contains no such policy. Capacity language in `offers.json` concerns paid class placement and does not prove the intro claim. Verify an authoritative intro policy or revise S10 spoken text and overlay before recording or publishing it.
2. S03 says students find balance and quiet strength, move with ease, and smile after each class. These are outcome claims requiring actual supporting evidence and, where student footage is used, permission. The checker cannot establish them.
3. S07 presents the visit and free class without the canonical distinction: adults choose same-day training with Sandy's confirmation; youth follow their own confirmed class plan. Check the complete deliverable copy against `free-intro.json` so it does not imply every viewer receives an automatic same-day class.
4. The review's 48/50, 97/100, and 96/100 scores lack inspectable criterion-by-criterion scoring evidence in this continuation. Do not present the readability pass as verification of those scores or completion of the mandatory four-rubric pipeline.
5. Overlays, captions, media permissions, recorded delivery timing, edit playback, and native publication evidence remain unverified. Filming and publishing remain unfinished.

The existing package was left intact for scoped review. This report records findings and does not authorize publication or claim that a finished video exists.
