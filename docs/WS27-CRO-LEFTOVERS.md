# WS-27: CRO leftovers and reading level

## Challenge seat and label

The rendered order was already: adult visit choices, clothing, Partner practice
safety guidance, The Sandy Challenge, waiver note, closing offer. The safety
paragraph includes matched partners, coached pace, and the right to pause or end
a round. It precedes the Challenge at both phone and desktop sizes.

The description's choice sentence came after its round description. The heading
now reads **Your choice: The Sandy Challenge**. Placement and the complete
Challenge description are unchanged. No data, consent rights, or policy changed.

## Visit bottom booking action

The page already had one booking button after the FAQ and above the footer. Its
label now reads **Text Sandy to Book Your Visit**. The existing href is retained
and matches the page's hero booking prefill byte for byte. A second button was
not added.

## Jargon inventory

The complete per-occurrence inventory is [ws27-jargon-inventory.json](qa/ws27-jargon-inventory.json).
It includes file, line, column, matching sentence or context, disposition,
and reason for each occurrence. Long nonvisitor code lines are excerpted around
the match, with their full-line hash and length retained; no hit is omitted.
All readable files under `src/` were searched,
including local ignored previews. Parent independently checked completeness.

| Classification | Occurrences | Action |
| --- | ---: | --- |
| Nonvisitor identifiers, comments, metadata, schema, styles, private metrics, internal previews | 604 | Unchanged; each exclusion explained |
| Ambiguous internal or machine-facing copy | 2 | Unchanged; owner-call notes below |
| Ordinary visible unit conversion | 1 | Unchanged; not maker jargon |
| Clear visitor-facing process self-reference | 0 | No source rewrite needed |

Total: 607 occurrences across 378 matching source lines. No unexplained
visitor-facing process term remains in the search inventory.

Owner-call notes:

- `src/admin/youth-intro.html:21`, “Funnel and cohort report”: internal, noindex
  operational report heading; not a visitor funnel page. Left unchanged.
- `src/llms.txt:15`, “Frequently Asked Questions (AEO & AI Search Summary)”:
  machine-facing public text; not an eyebrow, heading, or body on a visitor page.
  Left unchanged for the owner's call.
- `src/blog/water-before-training-how-much-when/index.html:107`,
  “Quick conversion: 8 oz = 1 cup.”: ordinary unit math; left unchanged.

## Grade 3 requirement

The user required Grade 3 or below. That threshold takes precedence over the
readability skill's looser examples. Changed blocks were checked with the
repository's CMU-based Flesch-Kincaid scorer (`scripts/qa-free-intro-copy.py`):

| Changed block | Grade | Unknown words |
| --- | ---: | ---: |
| Your choice: The Sandy Challenge | 2.88 | 0 |
| Text Sandy to Book Your Visit | 2.48 | 0 |

Whole rendered local pages measured with `tools/readability-check.mjs`:
free intro 1.97; visit 2.47. Final production measurements and browser evidence
are recorded separately after deployment. Existing copy, including protected
Challenge prose, was preserved. Existing negative-word flags in the wider page
were not introduced by these labels and were not rewritten in this bundle.

Copy rubric review: manual Stop-Slop assessment 46/50 (clarity 10, plain words 9,
brevity 9, fidelity 10, brand voice 8). Both labels use direct language, with no
new adverbs, binary contrasts, em-dashes, or unsupported claims. Analyzer review
preserved booking intent and canonical facts. Enhancer review preserved the
Challenge's tone and made choice explicit before its description. Social format,
hashtag, and distribution rules do not apply to these website UI labels.

## Verification and scope

Required gates passed once on final source: `qa:volatile-facts`, `test:ads`
(35 tests), `validate` (build, evidence checks, 15 unified tests, Cal browser
checks), `qa:schedule`. Browser checks cover mobile and desktop geometry, exact
labels and SMS parity, unchanged Challenge text, CTA tap size, and reading order.
No forms or booking requests were submitted.

Routing found no suitable complete role source. The coordinator and independent
inventory reviewer used disclosed ordinary CRO/editorial and content-audit
specialist fallbacks. The CONTENT instructions
`6e94db8f-e23d-4387-8cc6-bac209e890aa` and copy-readability-audit skill supplied
repetition, fact, coherence, and readability checks; no persona adoption claimed.
