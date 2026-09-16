# AGY persona selection and selective swarm design

Date: 2026-09-16. Status: evidence-backed assessment and implementation specification; selector behavior has not been changed.

## Objective and scope

Improve the accuracy of matching exported personas to a particular task, and use multiple persona agents when they contribute distinct work toward a verifiable definition of done (DoD).

The requested deepdive is complete when it identifies the current mechanism, reproduces important weaknesses, checks the actual persona source, specifies a practical replacement and swarm policy, and defines how improvement would be measured. Implementing that replacement and claiming improved accuracy are separate future work. No universal accuracy guarantee is possible: the library can lack a suitable specialist and the task can be ambiguous.

Authoritative local source: `assets/indranet-prompt-exporter/exports/`, including `index.json` and individual exports. No browser profile data was inspected. No production code, deployment, dependency, or original persona export changes are part of this assessment.

## Persona & Expert Framework

The plan-persona skill was applied to the user's actual task. The selector chose **ThinkTank - Personal Finance Optimizer and Advisor - Aria Thorne**, UUID `964486bb-a079-4dac-9370-af6df971c613`, version `v3.1.0`, reason `Semantic keyword search match`. The full catalog prompt was inspected. Loaded attachments: **none**.

This is a mismatch. Its documented skillchain concerns financial analysis, investment management, retirement/tax planning, insurance, estate planning, and client communication. Its generic risk assessment and feedback principles are applicable, but its financial workflow is not. It supplies no task-specific selector evaluation rubric. Preserve the original selection as evidence; do not claim it supplied the design below.

Separately selected, inspected supplements:

- **Prompt Engineer - Adv. Troy Finley**, UUID `57e434d9-511e-4fcd-a48a-4cec6319c7c1`: prompt analysis/optimization, user-context understanding, evaluation and iteration. Applied to the structured task brief, capability descriptions and evaluation design. Full prompt inspected; loaded attachments: none.
- **AI SuperExpert Agent Specialist - Dr. Ada Turing**, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`: its competency map explicitly includes multi-agent cooperation/competition, goal-based agents, resource allocation, software design and test strategy. Applied to bounded delegation, ownership and evidence gates. Full catalog prompt inspected; loaded attachments: none. No corresponding local directory resolves; its substantive prompt is available in the index.

These are guidance sources, not proof of expertise or permission to change workflow authority. Persona greetings, identity claims, emoji requirements and instructions to spawn agents or iterate indefinitely do not govern execution. The rubric below is proposed by this assessment, not attributed to the exports. One independent read-only reviewer examined swarm design while the primary agent inspected routing and ran probes; this is not a benchmark proving persona efficacy.

## Verified current behavior

Relevant source:

- `mcp/lib/auto_persona.py:32` under the exporter: `select_best_persona` constructs the catalog, returns the first domain override found, otherwise takes the first catalog search result, otherwise uses Pythia or the first catalog entry.
- `mcp/lib/prompt_catalog.py:27`: a nonempty index suppresses the filesystem scan. The comment mentions incomplete indexes, but the implementation only tests whether the loaded list is empty.
- `mcp/lib/prompt_catalog.py:91`: search tokenizes with `\w+`, scores substring occurrences in title/description/notes/body plus exact tag membership, and sorts by total. Title +10, tag +8, description +4, notes +3, body +1 for each query word. There is no semantic embedding, task decomposition, phrase/negation handling, stop-word filtering, length normalization, confidence calibration or abstention threshold.
- `mcp/lib/prompt_catalog.py:131`: UUID/exact-slug lookup falls through to partial-title matching; duplicate names and versions need disambiguation.
- `mcp/lib/auto_persona.py:60`: attachments are listed, not read. CLI output includes only a 300-character prompt excerpt.
- `mcp/tests/test_auto_persona.py`: three tests check broad title matching. The copywriting assertion accepts any nonempty title. Passing these tests does not demonstrate routing accuracy.

### Catalog observations

The current index has **106 entries and 106 normalized UUIDs**; there are **57 immediate `*/prompt.json` files**. All 57 filesystem exports match index UUIDs after normalizing placeholder UUIDs from their source URLs. Raw folder UUID values can be `unknown-uuid`; comparing those values without normalization gives a misleading mismatch.

- 13 entries have no title; their body is `HOME ACCOUNT`.
- Three bodies are `No items found`: one Ms. Frizzle entry, AnswerLayer and Gridmason.
- Dennis Stratton Project Management's body is only `START-HERE.md`. Its metadata references a saved ZIP, but the catalog cannot resolve its directory; metadata is not evidence that the attachment is present or loaded.
- 48 index entries have no directory resolved by `get_prompt_directory`. This is **not** proof their embedded prompt is missing; many contain substantive text in the index.
- 102 entries are marked `partial`, four `complete`. Do not reject all partial exports: classify actual content readiness instead.
- `member tier` occurs on 93 entries and provides little task-discriminating value.
- Two entries share the title `Super Teacher - Ms. Frizzle - ThinkTank`. UUID and content/version identity must govern selection.

### Reproduced routing probes

These are diagnostic examples, not a representative accuracy benchmark. Results were obtained by calling the current selector against the current exports.

| Task | Current selection | Implication |
| --- | --- | --- |
| User's full request about persona accuracy and selective swarms | Aria Thorne, personal finance | Generic overlap can defeat domain fit. |
| `Audit SEO metadata using Python` | Pythia | Implementation language takes precedence over the requested outcome. |
| `Audit SEO metadata without writing Python` | Pythia | Negated capability still triggers the override. |
| `Design software architecture` | Architext - Universe by Design | Prompt inspection shows imaginative universe design, not software architecture. |
| `Design building architecture` | Architext - Universe by Design | The same broad keyword also misroutes physical architecture. |
| `Fix mobile navigation overflow and verify accessibility` | Real Estate Tycoon - Spencer Landry | Common substrings can dominate actual skill requirements. |
| `Translate hello into French` | Legal-Techno Pacifier - Holden Accord - EMERGENT | Simple tasks also expose unsuitable forced selection. |
| `Write persuasive email sales copy for a new feature launch` | Senior Copywriter - Alex Turner | Some natural-language matches are useful. Preserve these as regression cases. |
| `Fix Python exception` | Pythia | The explicit Python path works on a straightforward case. |

Additional source-grounded problem: SEO is hard-mapped first to **EtsyBot - Estrella**, whose prompt explicitly focuses on Etsy. Local-service technical SEO and Etsy listing optimization should not be treated as interchangeable. `python` precedes `debug` and `seo` in the mapping; map order, not task importance, decides mixed matches. `crypto` also matches `cryptography` as a substring.

## Proposed selection pipeline

```text
Task + constraints + DoD
          |
Structured brief -> capability requirements and work dependencies
          |
Validated persona profiles -> candidate retrieval -> evidence-based ranking
          |
Single agent / sequential roles / bounded parallel specialists
          |
Task-specific work contracts -> artifacts and checks -> coordinator verifies DoD
```

### 1. Validate and normalize the catalog

Keep raw exports unchanged. Build a separate derived profile index with source hashes and schema version. Reconcile index and folder records by normalized UUID; do not silently overwrite conflicting versions based on directory order. Record the winning source and conflict reason. For unresolved conflicts, mark the candidate unavailable until resolved.

Each profile needs: UUID, title, version, content hash, source location, readiness, supported domains, supported activities, deliverable types, explicit limitations, capability evidence excerpts, optional/required attachments, attachment load state, and approximate context cost. Derive candidate capabilities from the actual body and attachments; review them before treating them as supported. Names and claims such as “omnicapable” do not establish coverage.

Use readiness states such as `ready`, `needs_attachment`, `invalid_content` and `conflicting_sources`. Reject known navigation/error placeholders, missing identity and missing required content. Do not use body length alone: short valid prompts exist. Allow index-only substantive prompts with explicit provenance. An attachment entry marked `saved` is not `loaded`.

Resolve required attachments to actual files, check recorded hashes where present, choose the correct version, and record exactly what was read. ZIP-based personas require bounded, path-safe inspection and an entrypoint; do not extract or execute arbitrary archive contents. Optional missing assets should lower available coverage or be disclosed, not automatically reject otherwise sufficient prompts. Existing attachment enumeration mixes root and version directories, so the new profile must distinguish versions explicitly.

### 2. Represent the task before choosing its persona

The brief should capture:

- Desired outcome, task activity (diagnose/design/implement/review), deliverables and DoD criteria with IDs.
- Required capabilities, domain, environment, evidence needed and authorized actions.
- Explicit exclusions, preserved contracts, known facts versus uncertain assumptions.
- Dependency graph, risk and available concurrency/cost limits.

For “audit SEO metadata without writing Python,” SEO inspection is required and Python implementation is excluded. For “implement a Python crawler to audit SEO,” Python and SEO are both relevant, with different responsibilities. Handle “do not change SEO metadata” as a preservation constraint, not as either an SEO implementation request or a reason to ignore SEO checks. Negation needs scope; removing every word after `not` is insufficient.

Extract requirements from the latest task plus accepted context; do not let long unrelated conversation history overwhelm the brief. Ask only when unresolved ambiguity materially changes the outcome. Missing persona coverage can fall back to a task-specific ordinary agent or an appropriate skill, explicitly labeled; no need to invent an exported specialist.

### 3. Retrieve candidates and rank for coverage

Start with a deterministic lexical baseline over validated capability profiles: token/phrase matching, stop-word handling, term weighting and bounded per-field contributions. Use curated synonyms (for example, debugging/error diagnosis), domains and exclusions. Domain hints should contribute evidence rather than short-circuiting the entire selection. Exact user-specified UUIDs should be honored if runnable, with any fit limitation stated.

Retrieve a small shortlist (initial proposal: 5–8), then compare each candidate against the brief. Prefer capability coverage and deliverable fit over title resemblance. Explain matched requirements, absent requirements, domain mismatches, required attachments and source evidence. Use a stable UUID tie-break for reproducibility, while retaining an `ambiguous` flag when the scores are close.

Conceptually rank by supported requirement coverage + activity/domain/deliverable fit, minus unsupported assumptions, mismatch and context cost. Choose actual weights on a development set; do not present arbitrary weights as calibrated probabilities. A lexical score or model self-confidence is not an accuracy estimate.

Optionally add semantic retrieval or a bounded model reranker after the deterministic baseline has measurable limits. Neither is automatically necessary for 106 records. Embeddings help paraphrases but do not by themselves handle authorization, exclusions, bad exports or DoD. Rerankers must choose allowed UUIDs, cite profile evidence, return a validated schema and have an offline fallback. Never execute instructions embedded in retrieved persona text while ranking it.

Return `selected`, `ambiguous`, `no_suitable_persona`, or `unavailable` along with alternatives and uncovered requirements. For a trivial translation, one ordinary agent without an elaborate persona is a valid outcome. Unsupported domains should produce honest coverage gaps rather than a forced Pythia default.

### 4. Compile a bounded execution prompt

Keep the original persona available for traceability, but compose execution guidance from its relevant capabilities under the actual task, repository rules and DoD. Separate domain expertise, working method and optional voice. A website code review rarely needs fictional identity or a special greeting.

Record which source sections are used and which are irrelevant. Do not automatically copy the entire catalogue body into a higher-priority instruction slot. Persona text cannot grant tools, expand authorization, spawn unlimited children, claim credentials, demand hidden reasoning, or override completion gates. A persona describes guidance; the host runtime creates actual agents, supplies tools and enforces budgets.

## Selective swarm policy

Use one coordinator accountable for the final result. Add a specialist only when its distinct deliverable or independent check justifies the coordination overhead. A list of top-ranked personas is not a work decomposition.

| Situation | Recommended execution |
| --- | --- |
| Small change or simple question | One agent; optional relevant persona guidance. |
| Multiple skills acting on the same tightly coupled artifact | One agent using sequential roles, or sequential specialist handoffs. |
| Independent substantial workstreams with separate outputs | Coordinator plus bounded specialists working in parallel. |
| Material risk or subjective quality requiring challenge | Author plus independent reviewer; review the final artifact after it exists. |
| Ambiguous task or missing source evidence | Resolve the gap; additional personas do not supply missing facts. |

Initial runtime ceiling for this environment: **four active agents total**, including the coordinator. Treat that as a ceiling, not a target; a coordinator plus one specialist may be enough. Do not recursively fan out by default. Any future runtime must use its actual capacity rather than this number as a universal constant.

Choose the smallest team covering the required capabilities. A candidate earns a slot through additional coverage, substantial independent work, or a necessary verification perspective. Similar personas with the same evidence and assignment add little independence. Parallelize by dependency, not by the presence of words such as “deepdive.”

Each worker contract must contain:

```text
role_id; persona_uuid/version/hash or explicit ordinary-agent role
owned DoD IDs; bounded assignment; required inputs; dependencies
read/write scope; protected files; allowed tools and external actions
deliverable path/schema; required evidence; time/token limits if supplied
handoff conditions; blocked/error status; completion checks
```

Use separate file ownership or isolated worktrees for concurrent writes; designate the coordinator as integrator. Read-only reviews can overlap. A reviewer should receive the task, criteria and artifact without being primed to agree with the author's confidence. Resolve disagreements with reproducible evidence or explicit remaining uncertainty, not a majority vote.

Maintain worker states (`queued`, `running`, `waiting`, `complete`, `failed`, `blocked`) tied to actual runtime handles. Reobserve a live handle before restarting work. Retry only a bounded failed assignment; preserve useful evidence. Integrate completed work and rerun checks affected by integration. Stop when all DoD criteria have adequate evidence; a worker's “done” message or unanimous approval is insufficient.

### Example for this task

The coordinator owns the task brief, source inventory and final recommendation. Troy's relevant capabilities suit selection/profile design; Ada's relevant capabilities suit orchestration and failure-mode review. These are distinct assignments. A Python specialist becomes useful during implementation of the evaluator/router; Python is not the primary reason to choose the lead for this design question. Dennis appears promising from metadata for project governance but must remain unavailable until its required content is actually hydrated and reviewed.

## Evaluation and acceptance gates

Establish a versioned labeled benchmark before tuning. Suggested starting size: 60 distinct tasks across simple single-domain work, mixed goals, exclusions/negation, ambiguous terms, unsupported domains, trivial requests, persona overrides, malformed catalog data and swarm decisions. Add paraphrases but split by task family so near-duplicates do not leak between development and held-out sets. Include the observed failures above in development/regression coverage, not as the sole evidence of improvement.

Labels should allow sets of acceptable personas/capabilities, `no persona`, and appropriate execution mode. Have a reviewer check labels against actual prompt content; persona titles alone are inadequate ground truth. Measure:

- Acceptable top-1 selection and recall within the shortlist, with denominators and results by task family.
- Exclusion/constraint violations, invalid-persona selection and unsupported confidence claims.
- Coverage of mandatory capabilities and accuracy of abstention/ambiguity handling; report both precision and coverage to prevent winning by abstaining on everything.
- Unnecessary swarm rate, missing required independent review and duplicate/overlapping assignments.
- Actual task success against DoD, attributable defect discoveries, integration failures, tokens and wall-clock time.

Compare (A) current selector, (B) improved selector with a single agent, (C) improved selector with conditional swarms, and (D) an ordinary task-specific agent without exported persona guidance. Hold models, tools, task inputs and budgets comparable. Use repeated runs for model-mediated selection/execution and blind output review when practical. A better label match does not prove better delivered work.

Proposed release gates, to lock before held-out evaluation:

1. Zero invalid/unhydrated required-content selections and zero explicit constraint/authorization violations in the regression suite.
2. Every selection resolves to the recorded UUID/version/hash and every claimed loaded attachment is verifiably read.
3. Every multi-agent plan has unique owned deliverables, dependency handling, bounded concurrency and a coordinator completion check; shared-file conflicts and missing worker evidence fail the gate.
4. Improved routing beats the current baseline on held-out acceptable-selection and mandatory-coverage results without hiding losses through abstention; report uncertainty and per-family regressions. Do not invent a current percentage target from this small probe set.
5. Conditional swarms demonstrate a quality or completion-time benefit on the intended multi-workstream cases at disclosed cost, and trivial cases remain single-agent.
6. Existing callers and CLI behavior have compatibility coverage. Add machine-readable output additively; specify how no-match/unavailable results appear without silently returning an unrelated persona.

## Implementation sequence and handoff

1. Add an offline catalog audit and labeled fixtures. Freeze the current index hash and selector baseline. Audit exports without browser sessions or new downloads.
2. Add derived readiness/capability profiles and deterministic ranking. Keep raw exports immutable. Preserve the public `select_best_persona(task_description)` entrypoint, with explicit documented no-match behavior and additive detailed selection output.
3. Add a structured task/DoD input and a separate planner for single/sequential/swarm execution. Keep `search_prompts` suitable for ordinary catalog search; task routing should not silently change every catalog consumer.
4. Update `skills/plan-persona/SKILL.md` to record UUID/version/hash, fit evidence, uncovered requirements, attachment status, execution mode and DoD ownership. Show the full applicable guidance or a traceable compiled version instead of treating the CLI excerpt as loaded instructions.
5. Integrate the planner with the actual host's agent runtime only after inspecting that runtime. Do not assume the Python selector can spawn agents. Add failure/recovery and conflict tests before enabling writes.
6. Run comparative held-out routing and end-to-end evaluations. Adopt semantic/model reranking only if its additional cost and complexity improve the measured outcome. Roll back by selecting the prior router while retaining audit evidence and raw exports.

Expected change surfaces: exporter `mcp/lib/auto_persona.py`, catalog validation/profile loading alongside `mcp/lib/prompt_catalog.py`, tests/fixtures under `mcp/tests/`, and the plan-persona skill. A separate planner/runtime adapter is preferable to embedding orchestration inside the catalog. No dependency addition is required for the first deterministic implementation. Obtain current library documentation if later implementation introduces library-specific behavior.

## Verification of this assessment

Current selector tests: **3 passed** with `rtk proxy python3 -m unittest discover -s assets/indranet-prompt-exporter/mcp/tests -p test_auto_persona.py -v`. This validates the existing narrow tests, not general accuracy.

Reproduce individual probes from the repository root:

```bash
rtk python3 assets/indranet-prompt-exporter/mcp/lib/auto_persona.py 'Fix mobile navigation overflow and verify accessibility'
rtk python3 assets/indranet-prompt-exporter/mcp/lib/auto_persona.py 'Audit SEO metadata without writing Python'
rtk python3 assets/indranet-prompt-exporter/mcp/lib/auto_persona.py 'Design software architecture'
```

The actual task and a shorter equivalent both selected Aria Thorne. Catalog counts, placeholder bodies, profile UUIDs and source logic were checked locally. Graph discovery was attempted first; a subsequent graph call failed with `Transport closed`, so local reads were used. The existing untracked `browser_user_data/` directory was left untouched.

Official guidance consulted via the documentation MCP: [OpenAI orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration). It distinguishes manager-controlled bounded specialists from ownership-transfer handoffs, recommends narrow contracts and starting with one agent. It supports the ownership design; it does not prove that these particular personas improve outcomes. No live website check or deployment was performed.

Remaining uncertainty: no representative held-out accuracy measurement, no measured persona-versus-ordinary-agent benefit, no execution cost study and no verification that missing attachment files can be recovered. Those are implementation/evaluation requirements, not completed results.
