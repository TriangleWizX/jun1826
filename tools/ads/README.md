# SSBJJ Ad Studio — 500 weekly concepts

The standard weekly output is **500 concepts in simple Markdown: 250 static and 250 video**. This user-directed standard supersedes the earlier dormant-volume decision. Concepts are text briefs; finished images and videos are separate production work.

## Quick Commands (from repository root)

```bash
# Generate 500 weekly concepts (250 static + 250 video) in Markdown
npm run ads:weekly
# or: python3 tools/ads/weekly.py --week 2026-W39

# Plan a static ad run
npm run ads:plan -- --count 6 --personas ben --series beginner_questions

# Render static draft ads (PNGs + review.html)
npm run ads:render -- --count 6 --personas ben --series beginner_questions --week run-01

# Generate an optional task brief
npm run ads:brief

# Run test suite
npm run test:ads
```

When running directly with python, commands can be run from repository root or inside `tools/ads`.
This writes `ssbjj-500-concepts-YYYY-Www.md`. To choose the week, use `npm run ads:weekly -- --week 2026-W39` (or `python3 tools/ads/weekly.py --week 2026-W39`). Existing files are protected; use `--output another-name.md` for a revision. Python's standard library is sufficient for concept generation.

Open the Markdown and choose an audience. Every static idea has main words, useful detail, what to show and a next action. Every video idea also has a 10–20-second sequence and words to say or caption.

## Weekly standard

| Audience | Static | Video | Total |
|---|---:|---:|---:|
| Parents | 80 | 80 | 160 |
| Adult beginners | 70 | 70 | 140 |
| Teens and parents | 30 | 30 | 60 |
| Community-service adults | 30 | 30 | 60 |
| Families | 20 | 20 | 40 |
| Visitors | 20 | 20 | 40 |
| Total | 250 | 250 | 500 |

The bank combines 25 topics with 10 different treatments for each medium. These are explicitly labeled variants. The generator changes reading order by week, not substantive content. Refresh `weekly-topics.json` to change the topics; do not describe a reshuffled pack as 500 new ideas. Keep IDs stable for unchanged topics and assign a new ID when replacing a topic. Route and offer authority remains `personas.json`.

The first pack is included. No testimonials or finished video files are fabricated. Scenes describe footage to find or capture; asset matching remains manual. Check current offers before production. Preserve original photos, logo and permissions. No ad is published by this tool.

The old 1–200 PNG renderer remains available for its existing 42 static concepts. It does not automatically consume this 500-concept Markdown bank, and it does not render video. Use the new weekly command for the requested standard output.

## Earlier renderer instructions


For optional finished PNG production, use the renderer below. The 500-concept weekly standard above governs ideation; no separate capture schedule or automatic follow-up is imposed. No website, CRM or ad-account integration is enabled.

## Start here

1. Identify one observed problem. If there is no problem or actual distribution need, stop.
2. Check whether an existing ad, personal answer or page correction solves it.
3. If a new ad is useful, choose one buyer, one message and the number of exports needed.
4. Review the current offer, image permission, readability and destination. Reuse a previously reviewed output unchanged; inspect new or changed outputs and flagged variants.
5. For an actual test, record production time, corrections, attributed attended visits and enrollments. No attribution means unknown, not zero.

## Run from this directory

```bash
pip install -r requirements.txt
python ads.py plan --count 6 --personas ben --series beginner_questions
python ads.py render --count 6 --personas ben --series beginner_questions --week first-question-test
```

The example chooses one concept and produces two layouts in three sizes. Use `--count 1` for a single export; current ordering selects photo_top/square first. The renderer does not yet offer arbitrary placement selection. Count is required: omitting it fails without generating anything. Capacity remains 1–200 exports. A 150-export run is available explicitly, not a recommendation. `--week` is a legacy argument for the run label and deterministic selection; it does not schedule work.

Rendering requires approved assets in assets.json. For original local photos, use local_path and retain the source URL. Do not assume public website availability establishes advertising permission. Optional `python ads.py discover --pages /` discovers IMG sources from specified site pages; it is not a full crawler and does not extract video frames or CSS backgrounds.

Open output/<run label>/review.html. Images remain drafts. Existing folders are protected against overwrite. Failed renders can leave a partial folder; inspect it before removing or retrying. Source fetching can need network access.

## Optional tools and references

- `python workflow.py --output task-brief.md`: optional handoff for a task that needs explanation. Not a prerequisite to rendering. Edit workflow-input.json first; its starter questions are hypotheses, not customer observations. Existing outputs are not overwritten.
- `followups.json`: optional event-based conversation guidance. No missed-session threshold or mandatory question logging. A return request can receive a personal answer without activating a new workflow.
- `DELETION-AUDIT.md`: decisions, protected invariants, validation and restore conditions.
- `archive/`: prior proposals and source analysis, retained for rollback/reference only. Their quotas and calendar routines are superseded by this README.

## One authority per fact

Concept copy and evidence live in concepts.json. Routes, CTA and offer identifiers live in personas.json. Asset source and approval live in assets.json. Do not duplicate these into new trackers. Generated inputs.json is a historical snapshot, not another editable authority: each selected concept appears once. Export manifest rows reference concept_id and retain delivery fields; source/proof text is no longer repeated for every size. Keep the input snapshot beside the exports for inspection.

The 42 concepts are a reusable bank, not 42 obligations. Buyer distinctions remain useful; no separate campaign or landing page is required for each persona. Wendy retains visitor routing; Ian remains an experience lens rather than a child buyer. Offer details inherited from prior work need checking before actual release; this update did not verify live prices or availability.

## Validation and repository integration

Run `npm run test:ads` (or `python3 -m unittest discover -s tools/ads -p 'test_*.py'`). This verifies planning, filtering and selected guardrails across all 14 unit tests; it does not prove campaign effectiveness, current offer accuracy or production photo approval.

The tool suite lives in `tools/ads/`. Renderer dependencies and outputs (`output/`, `cache/`) are kept strictly out of the public website bundle and are ignored by version control. Local assets in `assets.json` resolve to verified project assets in `src/assets/`.
