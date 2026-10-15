# Blog drafts from Sandy's interview

Eight complete blog drafts, written in Sandy's first-person voice from his interview. Website implementation is complete locally: four new pages and four refreshed pages. Nothing has been committed or deployed. See the [implementation report](implementation-report.md) and [rendered QA results](implementation-qa.json) for current status. The draft measurements below remain historical draft evidence.

## Read the blogs

| Draft | Reading grade | Visible characters |
| --- | ---: | ---: |
| [Kids BJJ Near Hunter: Who Will My Child Train With?](01-kids-bjj-training-partners.md) | 1.96 | 2,138 |
| [What Kids Learn in BJJ Partner Practice](02-what-kids-learn-in-bjj.md) | 2.28 | 2,113 |
| [Teen Self-Defense in Greene County: What We Practice](03-teen-self-defense-practice.md) | 2.43 | 2,332 |
| [Can Parents and Kids Train BJJ Together?](04-family-bjj-training.md) | 2.94 | 2,315 |
| [BJJ for Older Adults: Move, Learn, and Meet People](05-bjj-for-older-beginners.md) | 1.67 | 2,091 |
| [Private BJJ Lessons: Bring One Goal](06-private-bjj-coaching.md) | 2.68 | 2,229 |
| [More Time to Try: How I Teach BJJ](07-how-sandy-teaches-bjj.md) | 2.78 | 2,074 |
| [Why I Teach Jiu-Jitsu on the Mountain](08-bjj-on-the-mountain.md) | 2.80 | 2,230 |

Each file includes an SEO title and description. Author and draft status are editorial metadata, not statements that Sandy has approved the final prose.

## What was checked

- All eight article bodies passed the repository Flesch–Kincaid check at Grade 3 or below. Scores include headings, prose, visible link labels, and CTAs.
- Markdown bodies were converted to standalone HTML reading previews, with YAML and link destinations excluded from the visible-copy score. This measures complete article text, not just selected paragraphs. Metadata is outside those body scores.
- Checks used `node tools/readability-check.mjs <preview.html> --json --max-grade 3`. The checker returned successful exits and an empty banned-language list for all eight.
- Every article exceeds 2,000 visible characters. Each has one H1, and its internal link targets exist in local source or generated output. Local file existence does not prove live HTTP behavior or deployed content.
- A separate agent reviewed all eight for interview fidelity, program boundaries, private-plan eligibility, and unsupported outcome claims. Its Intensive-link clarity concern was addressed by pointing readers to fit rules rather than implying universal access.
- [qa-results.json](qa-results.json) records exact file hashes and measured results. A reading score is a heuristic; editorial review also checked plain wording and defined terms.

No full site build, deployment, external source fetch, live-link test, or browser layout check was needed for these Markdown drafts. Those checks belong to later website implementation.

## How the campaign uses these drafts

This set expands the [campaign outline](../../seo/program-content-campaign-2026-10-15.md) with firsthand information supplied later in the interview. It is a draft library, not a decision to create eight new indexed URLs.

- **01:** Compare with the Hunter town page, kids program, and existing nearby-youth articles before choosing a new article URL.
- **02:** Compare with the existing kids positional-control article. Its dated shoulder-hold example provides a narrower teaching angle.
- **03:** Refresh the existing teen/Catskills self-defense coverage; keep one primary explainer for this intent.
- **04:** Compare the two existing family BJJ articles before assigning a destination.
- **05:** Reuse or refresh the existing adult “near me” and over-40 coverage as appropriate. The older-adult question is a fresh entry point, not proof of demand volume.
- **06:** Refresh the existing adult private-coaching article and link the service page for current terms.
- **07:** A teaching-method story that can support the beginner hub and program pages. Compare existing beginner-evidence coverage first.
- **08:** A local author story. Consider whether it belongs in existing biography or local coverage before creating an indexed article.

The subsequent implementation request authorized use of the first-person copy. Rendered readability, URL mapping, metadata, and local site QA are recorded in the implementation report. Service inclusions remain linked to their authority pages. Deployment and live verification are separate work.

## Four-rubric editorial review

These are internal drafts, not a public release. Editorial checks were applied as follows:

1. **Stop-Slop:** Reviewed for clear language, specificity, active voice, source fidelity, and useful detail. Each draft meets the 40/50 editorial floor; individual subjective scores appear in the source notes. Automated negative-term scans also passed. The score is an editorial judgment rather than an external certification.
2. **Universal Analyzer-Improver:** Checked audience question, local intent, next action, unsupported implications, and factual boundaries. Intensive details stay on their authority pages; family participation retains Sandy's approval gate.
3. **Anything-Enhancer:** Checked concrete movement descriptions, warmth, and realism. Kept the dated observation bounded to one student and omitted submission instructions. During implementation, the full versioned OptiMax source was recovered and read, closing the earlier compressed-source limitation.
4. **Empirical Reach Matrix:** This set is long-form blog copy. Social launch timing, Reel duration, tags, and comment prompts are not applicable to the articles. Any social adaptation requires its own format-specific pass. No reach or performance claim was inferred from the interview.

See [source and review notes](source-notes.md) for evidence status, service conflicts, permissions, and persona provenance.
