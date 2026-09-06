# Stop-slop codebase audit

Date: 2026-09-06. Status: review backlog; no website fixes applied.

## Purpose and scope

Review the current worktree using `.agents/skills/stop-slop/SKILL.md` and its phrase, structure, and example references. Give a future model specific problems to inspect, evidence to locate, and conditions for closing each item.

This is a prose audit of the codebase, including public HTML, metadata, templates, data copies, documentation, and the existing prose checker. It is not a security, performance, or runtime correctness audit. The findings describe local source; they do not establish what production currently serves or how copy affects conversions.

Coverage:

- Parsed all 501 `src/**/*.html` files into 37,288 text segments, including front matter and description metadata. Skipped script, style, and SVG body text during this pass. This is source extraction, not browser visibility detection; hidden text and template fragments can appear in the results.
- A targeted phrase/structure scan returned 193 candidate segments in 143 HTML files. These are triage counts, not 193 confirmed defects. Patterns included `journey`, `seamless`, `not just`, `more than`, `the question is`, `readable`, and generic glossary definitions. Reviewed candidate context and selected findings below.
- Scanned 58 source `.njk`, `.js`, and `.md` files, 102 documentation Markdown files, and 126 script `.mjs`, `.py`, and `.sh` files for a narrower filler-word list. No matches appeared in the 58 source files for that list. This does not prove their prose has no structural problems. Script and documentation hits included rule fixtures, reference material, and valid technical wording.
- Checked selected glossary JSON, metadata ownership, homepage copy, and the existing stop-slop checker. Did not enumerate all JSON records or manually read every sentence in the repository.
- Used the indexed codebase graph for orientation. A later graph request failed with `Transport closed`; direct source inspection supplied the evidence below. Literal and non-code searches used local tools.

Excluded from editorial recommendations: dependencies, bundled skills, binary assets, personal records, legal agreements, and third-party quotations. Generated/root HTML received limited comparison, not a second full audit. Existing dirty and untracked work was preserved.

## Instructions for the next model

1. Re-read each cited source and its surrounding section. Line numbers describe this worktree and may move.
2. Treat `confirmed` as a wording or implementation observation. Treat `needs verification` as an unanswered business or evidence question, not a falsehood finding.
3. Fix source owners first. Trace templates, data generators, metadata, and structured-data copies before editing duplicates. Do not patch `dist/` as the only fix.
4. Preserve booking targets, tracking attributes, safety instructions, canonical URLs, and approved program terminology. Do not invent claims, prices, schedules, or customer testimony.
5. Apply the skill with judgment. Preserve genuine FAQ questions, technical terms such as leverage, useful safety repetition, legal wording, quotations, and established brand copy. Do not globally delete adverbs or replace every contrast.
6. Suggested copy below is a draft direction, not authorization to change business facts. Review one finding at a time. Keep an explicit exception when the original wording serves a clear purpose.

Priority: P1 = misleading claim or unreliable audit evidence; P2 = unclear or repetitive customer copy; P3 = maintenance or lower-impact style review. All items remain open.

## Findings

### SS-01 | P1 | Absolute injury claim

- Status: confirmed wording; safety claim needs owner review.
- Evidence: `src/blog/beginners-guide-bjj-human-chess/index.html:98`: “practice dangerous techniques at 100% effort with 0% injury.”
- Rule: avoid unsupported extremes and manufactured emphasis.
- Problem: the paragraph presents tapping as an injury-free guarantee. A tap instruction does not establish that guarantee.
- Check: ask the responsible coach to confirm the intended safety explanation. Inspect the article's metadata and any reused excerpt for the same promise.
- Direction: explain that students tap to ask their partner to stop and must follow the coach's safety instructions. Do not replace this with a different numerical claim.
- Close when: the owner approves a specific safety explanation and no affected output promises zero injury.

### SS-02 | P1 | Generic glossary answers fail to define the term

- Status: confirmed; repeated across 71 source HTML files containing the exact generic sentence pattern.
- Evidence: `src/bjj-glossary/guard-pass/index.html:247`: “Guard Pass is a common BJJ term used in class to describe a key position, movement, or concept.” The same answer appears in embedded JSON-LD at line 85. The front-matter description at line 4 already gives a concrete definition.
- Additional surface: `src/assets/data/glossary-search.json:23` includes the equivalent generic answer in normalized search text for ankle lock.
- Rule: replace vague declaratives with specific information; cut words that do not answer the reader.
- Problem: changing the term name produces another equally empty answer. Search text and structured data can retain it after visible copy changes.
- Check: locate the producer of each affected FAQ and search-data record. Compare each term's existing definition before drafting new instruction. The 71 count covers HTML files, not distinct routes, terms, or published pages.
- Direction: reuse an accurate term-specific definition after coaching review. Keep genuine question headings.
- Close when: each reviewed FAQ defines its own term, visible and structured answers agree, and regenerated search data contains the intended answer.

### SS-03 | P1 | Stop-slop checker scans a different content tree

- Status: confirmed implementation limitation.
- Evidence: `scripts/qa-stop-slop.mjs:5` sets `ROOT` to `process.cwd()`; lines 99 and 170 resolve and read HTML beneath that root. Lines 157–158 read the root sitemap. Line 167 silently skips unresolved URLs.
- Local evidence: 271 sitemap URLs resolved to root files; 273 resolved under `src/` using equivalent candidate rules. Root copies of `blog/beginners-guide-bjj-human-chess/index.html`, `bjj-glossary/guard-pass/index.html`, and `blog/teen-jiu-jitsu-hunter-ny/index.html` all differed from their source copies. A byte difference alone does not prove a prose difference, but establishes that they are different audit inputs.
- Problem: a root-tree result cannot certify current source or generated output. Sitemap-only discovery also omits non-indexed pages and reusable partials.
- Check: decide whether the command is a source-copy audit or a generated-site audit. Make its input tree explicit, count inspected/skipped files, and report unresolved paths. Include source partials if its contract promises source coverage.
- Close when: the output identifies its scope and coverage, and a controlled source change appears in a source audit without relying on an unrelated root copy.

### SS-04 | P2 | Checker results need interpretation and an explicit exit contract

- Status: confirmed implementation limitation.
- Evidence: `scripts/qa-stop-slop.mjs:231` can print “Clean! No stop-slop violations found.” The final reporting branch prints violations without a failure exit; line 245 exits 1 only on a caught exception. The current local run reported 31 matches and exited 0. No `stop-slop` entry appeared in `package.json`.
- Problem: callers may mistake successful execution for editorial acceptance. Keyword checks also cannot detect an empty term definition or reliably judge claim support. Raw-HTML em-dash checks include text outside visible prose; the script strips metadata attributes and JSON-LD from its text scan.
- Check: document advisory versus gating behavior. If a gate is wanted, distinguish reviewed violations, exceptions, and execution errors. Add meaningful cases for metadata, quotes, technical uses, generic answers, and missing input rather than testing only literal lists.
- Close when: command documentation and exit behavior agree, and a reviewer can distinguish a completed scan from approved copy.

### SS-05 | P2 | Awkward “more than” wording obscures intent

- Status: confirmed grammar/readability problem; cause unknown.
- Evidence: `src/blog/teen-jiu-jitsu-hunter-ny/index.html:28`: “Most families are more than looking for activity.” `src/blog/jiu-jitsu-near-hunter-mountain/index.html:38`: “Most people searching near Hunter Mountain are more than looking for ‘a gym.’” `src/blog/private-jiu-jitsu-lessons-windham-ny/index.html:36`: “Private sessions are more than for advanced students.”
- Rule: state the subject's need directly; avoid formulaic contrasts.
- Check: search other `more than` occurrences and read each sentence. Do not infer that a previous replacement caused these defects or replace valid quantities and comparisons.
- Direction: “Families want clear rules, coaching, and a repeatable routine.” For private coaching, state who can request it without inventing availability.
- Close when: each selected sentence states a clear meaning in ordinary grammar and preserves its original factual scope.

### SS-06 | P2 | Opening paragraph stacks contrasts before the useful information

- Status: confirmed pattern.
- Evidence: `src/blog/jiu-jitsu-near-windham-mountain-club/index.html:25`: “the practical question is not whether…” followed by “The question is whether…” and “It is active, but it is not random. It is social, but it has rules.”
- Rule: cut rhetorical setups, repeated binary contrasts, and mechanical rhythm.
- Problem: the opening delays the practical answer for a visiting family.
- Check: preserve the local context and the actual beginner-class explanation. Confirm the linked schedule remains the authority for availability.
- Direction: lead with a coached indoor activity option, then explain what a beginner does and where to check the schedule.
- Close when: the opening answers the visit-planning question without the chain of contrast statements.

### SS-07 | P2 | Youth article mixes vague praise with universal benefits

- Status: confirmed language; outcome claims need verification.
- Evidence: `src/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html:63`: “we take pride,” “we ensure that every child feels secure and supported,” and “fostering a genuine love for movement and learning.” Line 65 adds “a culture of excellence that benefits the entire community.”
- Rule: cut self-praise, filler, vague abstractions, and lazy extremes.
- Problem: the paragraph promises internal feelings and community-wide benefits without showing their basis in the passage.
- Check: separate coaching practices the academy can confirm from outcomes that vary by child. Do not infer that no supporting evidence exists elsewhere.
- Direction: describe how the coach sets the task, chooses partners, or adjusts pace using verified practices already documented on the site.
- Close when: the paragraph gives observable practices and qualifies or removes unsupported universal outcomes.

### SS-08 | P2 | Camp page uses vague promises and an uncertain testimonial label

- Status: wording confirmed; testimonial category needs verification.
- Evidence: `src/camp-clinics.html:9`, anchors “Seamless coordination and clear communication,” “Simple for you. Impactful for your camp,” and “What Camp Directors Say.” The testimonials under that heading describe children's regular classes and family routines.
- Rule: replace jargon and punchy abstractions with specific actions; check implied proof.
- Problem: coordination copy omits the concrete responsibility. The heading implies a reviewer role that the displayed excerpts do not establish.
- Check: confirm the testimonial authors' roles and the approved source of each quote. Read-only inspection of the public page does not establish whether they are camp directors.
- Direction: name the verified booking responsibilities. Use an accurate testimonial heading after verification; preserve quoted wording and attribution.
- Close when: the copy names the next action and the testimonial heading matches documented provenance.

### SS-09 | P2 | Metadata contains a duplicated program phrase and a cut-off ending

- Status: confirmed source defect; rendered-head impact not verified.
- Evidence: `src/blog/catskills-gym-alternative-jiu-jitsu/index.html:4`: “Start the 12-week 12-week program … Beginner Lane pa...”
- Rule: remove redundancy and write complete, specific prose.
- Problem: the description repeats a phrase and ends mid-word. It also embeds commercial facts that may drift.
- Check: follow metadata through `src/_includes/components/head-metadata.njk`; inspect the generated title, description, canonical, and any social descriptions. Verify commercial wording against canonical sources rather than this report.
- Direction: write one complete description about the page's actual purpose; import canonical facts or link to their authority as project rules require.
- Close when: the rendered head contains a complete description with no duplicate phrase, and any retained facts match their authority.

### SS-10 | P2 | Glossary CTA inserts a sentence into a noun list

- Status: confirmed syntax problem.
- Evidence: `src/bjj-glossary/bottom-position/index.html:9` and `src/bottom-position/index.html:9`, anchor: “Beginner class means calm coaching, skill-based resistance activities begin at the right pace from day one, and a simple first-class plan.”
- Rule: clear sentence structure; avoid repetitive template prose.
- Problem: “activities begin” breaks the surrounding list. Two source files contain the same passage.
- Check: trace source ownership and route behavior before changing either duplicate. Preserve the authorized beginner-training statement.
- Direction: split the explanation into complete sentences, retaining the same safety and pacing meaning.
- Close when: both affected outputs read correctly and the shared source, if any, generates the corrected text.

### SS-11 | P3 | Passive and abstract glossary reassurance hides the action

- Status: confirmed style candidate.
- Evidence: `src/bjj-glossary/bottom-position/index.html:9`: “Beginners are taught structure before intensity so bottom position feels less overwhelming and more readable.”
- Rule: name the actor and replace abstractions with a specific action.
- Problem: a first-time reader may not understand “structure” or “readable” in this context.
- Check: obtain a coach-approved description of what the beginner practices from bottom position. Keep the distinction between instruction and a promised feeling.
- Direction: explain what Sandy asks the student to do, using a verified example from the lesson.
- Close when: the reader can identify the coach's action and the student's task without specialist interpretation.

### SS-12 | P3 | Journey language weakens otherwise clear next steps

- Status: confirmed style candidates; existing voice may justify an exception.
- Evidence: `src/local-bjj-tournaments-for-parents.html:511`: “Start the Journey. We'll Guide the Rest.” `src/blog/bjj-belts-stripes-promotions/index.html:221`: “Ready to Start Your First Belt Journey?” `src/sources/cdc-physical-activity/index.html:71`: “Ready to Start Your Training Journey?”
- Rule: cut generic metaphors, quotables, and rhetorical setups.
- Check: inspect the CTA beneath each heading and align the heading to that actual action. Preserve approved CTA terminology and destinations.
- Direction: name the first visit, class, or question the reader can act on. Do not introduce a new booking label across the site as part of this style task.
- Close when: each retained heading helps explain its next action or has a documented voice rationale.

### SS-13 | P3 | Dramatic framing can crowd out practical safety instruction

- Status: confirmed style candidate.
- Evidence: `src/blog/how-to-fall-safely-bjj-breakfalls/index.html:47`: “Gravity is undefeated” and “the ground is waiting.” `src/blog/wrestle-ups-scramble/index.html:48`: “Getting up is more than a scramble. It is a weapon.”
- Rule: avoid false agency, manufactured punchlines, and formulaic contrast.
- Check: distinguish intentional author voice from a beginner-facing instruction barrier. Review the surrounding safety context before changing a technical article.
- Direction: lead with the skill the reader will learn and the need for coached practice where applicable. Avoid writing new safety instruction without review.
- Close when: the introduction serves the article's practical purpose and the owner accepts any retained metaphor.

### SS-14 | P2 | A glossary test preserves wording the skill flags

- Status: confirmed maintenance constraint, not a proven test defect.
- Evidence: `scripts/qa-glossary.mjs:274` requires the literal sentence “Guard is not just holding on. Good guard uses movement, distance, frames, grips, and timing.”
- Rule: review additive contrasts in context.
- Problem: editing that sentence can fail a test that intentionally protects supplied copy. Passing the test does not establish editorial quality; changing the assertion without review could discard an approved requirement.
- Check: inspect the surrounding test and the source requirement. Decide whether the current contrast teaches something useful and deserves an exception.
- Close when: the wording and assertion reflect the same reviewed requirement. Preserve meaningful glossary validation; do not delete the check just to make tests pass.

### SS-15 | P3 | Internal metadata guidance can reintroduce stale copy

- Status: confirmed mismatch in wording; current business facts not audited.
- Evidence: `docs/internal-catskills-gym-metadata.md:4` recommends “Ready for capability, not just equipment?” and embeds a named program, prices, and entitlement text. Current article metadata differs; see SS-09.
- Rule: direct prose and maintainable, specific guidance.
- Problem: a future model may paste this standalone note into public metadata and restore an obsolete offer or rhetorical contrast.
- Check: identify whether this file remains an active instruction or a historical record. Compare its business details to current canonical data without treating the document as authority.
- Direction: mark historical material as historical or update active guidance to reference canonical facts and the source metadata owner.
- Close when: the document's status and authority are explicit, and it no longer invites unverified commercial copy into the page.

## Exceptions and false positives

- Keep “leverage” when it describes grappling mechanics. CSS `transform`, icon names such as `bi-unlock`, and JavaScript identifiers are not marketing prose.
- Do not rewrite testimonials because they contain “game-changer” or a contrast. Verify quotation provenance and surrounding claims instead.
- Preserve legal language in waivers and guarantees. This audit does not recommend contract edits.
- Keep meaningful FAQ questions, lists of actual class audiences, and essential safety qualifiers. The skill's ban on all adverbs and question openers is not a safe bulk-edit rule for this site.
- “More than one class” in the report-card instructions expresses a useful quantity. It is not the grammar problem in SS-05.
- Treat skill reference files, imported strategy material, and test word lists as examples or fixtures unless they feed customer copy.
- Preserve “Start calm. Train smart.” and other approved brand language unless a separate request changes it.

## Verification and follow-up

Completed local checks: source inventory and text extraction; candidate context review; exact generic-FAQ pattern count; source/root comparison; checker source inspection; `node scripts/qa-stop-slop.mjs` execution (31 matches, exit 0); package script lookup; report evidence and worktree checks.

No website files changed for this audit. No build, browser, deployment, live HTTP, or external claim verification ran. Those checks would not prove a report-only wording review complete, and a build could alter unrelated generated work.

After approved copy fixes, run the relevant checks defined in `package.json`: `npm run build`, `npm run qa:seo`, `npm run qa:glossary` for glossary edits, and `npm run qa:volatile-facts` for schedule-sensitive content. Check command scope and any output writes before running them in a dirty worktree. These checks supplement editorial review; they do not certify natural prose or business truth.

Inspect affected pages on mobile and desktop after implementation. Verify CTA visibility and destinations, headings, focus and labels, internal links, metadata, structured answers, and overflow caused by changed text. Request the required network approval before live checks and report local and production evidence separately.

Suggested work order: SS-01 and SS-02; define checker scope with SS-03 and SS-04; fix the grammar and metadata defects; review remaining style candidates with the owner. Close each item only against its stated condition. This report completes the audit deliverable; it does not close the listed problems.
