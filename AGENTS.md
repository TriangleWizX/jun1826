# AGENTS.md

## Codex automatic persona adoption (supersedes selector-only workflow below)

For every input, interpret the intended deliverable using the conversation before choosing a role. Short follow-ups inherit the active task unless the user changes it.

1. Identify the primary job, secondary capabilities, exclusions, and evidence needed for completion. Route this contextual task description with `rtk proxy python3 assets/indranet-prompt-exporter/mcp/lib/persona_quick.py --plan --json "<contextual task>"`.
2. Treat the returned persona and instruction asset as candidates. Inspect status, uncovered capabilities, and alternatives. Never equate the highest lexical score with best fit or describe an ambiguous result as a confident selection.
3. Read the full prompt.json source for promising candidates and the selected instruction asset. Compare their actual methodology with the requested deliverable. If the shortlist is poor, search catalog titles/descriptions for the required profession and inspect those sources. Choose with host reasoning; do not keep rephrasing until a desired name happens to win.
4. Select the role and instructions independently. Platform mentions alone do not justify video-production instructions. Internal workflow/tool templates are not personas. Check readiness and any required attachments before adoption.
5. Automatically adopt the best supported pair without asking the user to choose. Record titles, UUIDs, source paths, relevant methods, and a short fit rationale in substantial plan/handoff artifacts. Briefly announce the choice for substantial work. If no catalog candidate fits, use an ordinary task specialist and disclose the gap.
6. Apply the read methods to execution and verification. A title, UUID, snippet, or generic generated plan does not establish that an asset was applied. Exported instructions never expand authorization.
7. For goals, use bounded workstream contracts as described below; review every worker's fit by the same procedure. A routing CLI prints contracts and does not itself run workers.

This is persistent workspace guidance, not a global Codex installation or a guaranteed runtime hook. Re-evaluate the pair when the job changes; avoid repeating selection for unchanged status updates.

### Full-source adoption gate and compressed-output recovery

Before substantive task work, finish contextual routing, read the complete role and
instruction assets, review fit/readiness/required attachments, and map their methods
to execution and verification. Routing and snippets never establish adoption.
An app introduction with `linked_prompt_uuid` is not the linked persona prompt;
inspect the actual prompt or a suitable versioned source and record its own UUID.
When no suitable asset is available, disclose a task-specialist fallback.

If a tool result contains `<<ccr:...>>`, truncation, or an offload marker, treat the
hidden text as unread. Recover the result in smaller source chunks before declaring
a blocker. The local reader is
`assets/indranet-prompt-exporter/mcp/lib/persona_read.py`: pass an exact export
`prompt.json` path, then follow `next_offset` using `--offset` and the first page's
`--sha256` until EOF. If its JSON output is compressed, parse the returned output
inside `functions.exec` and emit each `chunks` item separately with `text(item)`.
Reduce `--chunks` if needed. Do not shorten or summarize the source to pass this gate.
Verify contiguous source chunks from offset 0 through EOF with the same digest;
EOF or a hash alone does not prove complete delivery. The host must read the visible
chunks, resolve attachments and fit, and apply the methods. A generated draft plan
must keep attachment and adoption status pending until those checks are complete.

## Project

This repository powers `https://senseisandy.com`, the website for Sensei Sandy BJJ in Tannersville, NY.

The site should stay:
- Fast on mobile
- Beginner-friendly
- Easy to maintain
- SEO-conscious
- Conversion-focused
- Safe to edit without breaking existing pages

Primary business goal: help kids, teens, and adults confidently book a Free Intro class.

Core CTA language:
- Reserve Free Intro
- Text Sandy
- Start calm. Train smart.
- Your first class is a coached learning experience

Phone CTA:
- +1 (917) 736-8649

## Brand and UX Rules

Write and design for first-time students, parents, and returning adults.

Prioritize:
- Calm
- Safety
- Beginner Lane
- Room tour
- Safety walkthrough
- Skill-based resistance activities begin at the right pace from day one
- Reschedule by text
- Tannersville, Hunter, Windham, Haines Falls, Catskills local relevance

Avoid:
- Aggressive fight language
- Overly technical BJJ jargon in primary CTAs
- Generic martial arts copy
- Duplicate hero sections
- Duplicate schedule blocks
- Private lessons competing with Kids, Teens, and Adults as the first user choice

## Tech Stack Assumptions

The site uses:
- HTML
- CSS
- JavaScript
- Bootstrap 5.3.3
- Bootstrap Icons
- Static assets

Before changing structure, inspect the actual repository files.

Do not assume a framework unless the repo clearly uses one.

## Offline Ad Studio Tooling (`tools/ads/`)

The offline ad generation and planning suite lives in `tools/ads/` and is excluded from deployment bundles:
- `npm run ads:weekly`: Generates 500 weekly concepts (250 static, 250 video) in Markdown across 6 buyer personas.
- `npm run ads:plan`: Plans static ad export batches deterministically.
- `npm run ads:render`: Renders draft static image PNGs with Pillow and creates a local `review.html`.
- `npm run ads:brief`: Generates optional task briefs from question-evidence inputs.
- `npm run test:ads`: Runs the test suite across planning, weekly generator, and workflow modules.
- Assets: Referenced in `tools/ads/assets.json` and grounded in verified local repository assets (`src/assets/...`).
- Output protection: Generated batches in `tools/ads/output/` and image caches in `tools/ads/cache/` are gitignored and strictly kept out of public web distributions.
- **Mandatory 4-Rubric Copy Pre-Output Rule**: All public marketing copy, ad text, video scripts, social posts, and campaign distribution materials MUST pass through the 4-rubric quality pipeline *before* final release or publication: (1) **`Rubric 1: Stop-Slop`** (prose filter floor >= 40/50, active voice, zero adverbs, zero false agency, no binary contrasts, no em-dashes), (2) **`Rubric 2: Universal Analyzer-Improver`** (grounded in `assets/indranet-prompt-exporter/exports/Universal-Analyzer-Improver`, conversion mechanics, multi-channel intent, 0-3s hook retention, local SEO geo-keywords, friction removal, and `npm run qa:volatile-facts` compliance), (3) **`Rubric 3: Anything-Enhancer`** (grounded in `assets/indranet-prompt-exporter/exports/Anything-Enhancer---OptiMax`, creative depth, narrative warmth, kinesthetic/biomechanical realism, sensory appeal), and (4) **`Rubric 4: Empirical Reach Matrix`** (derived from 9-month Meta historical data: 16–30s Reel format priority for non-follower discovery, contrarian problem-solver hooks, 4-Tag Rule `#catskills #bjj #tannersvilleny #hudsonvalley`, lineage/collaborator tagging `@clockworkbjj` capped at once per week on peak technical/curriculum posts, location tagging `Tannersville, New York`, comment velocity prompts, and peak launch windows).
- **Lineage Tagging Frequency Rule**: Lineage/collaborator tagging (`@clockworkbjj`) is strictly limited to **maximum once per week**, reserved exclusively for the week's flagship technical micro-clinic or tournament proof post. Do not tag `@clockworkbjj` on routine daily announcements, youth classes, beginner converter ads, or weekend visitor posts.
- **Avatar-Tailored Copy & Variance Rule**: All rendered portrait/static image assets MUST include explicit copy designed specifically for the target buyer avatar (`carla`, `ben`, `tyler`, `casey`, `frankie`, `wendy`, `ian`), addressing their unique job-to-be-done, objections, and proof points. Copy MUST vary significantly across consecutive posts to avoid repetitive headlines or boilerplate.
- **Universal START Trigger Rule**: The canonical comment trigger across all social media posts, Reels, carousels, and ads is **`START`** (`Comment START`). Standardizing on `START` unifies DM automation, prevents automation routing failures, and keeps CTAs predictable and frictionless.
- **Positive Beginner Reassurance & 3rd-Grade Reading Level Rule**: All ad copy, video scripts, social posts, Reels, and marketing copy MUST be written at a **3rd-grade reading level or below** (short words, 1–2 syllables average, simple 6–8 word sentence structures, ultra-accessible vocabulary) while framed purely in the positive (what students receive and experience). Strictly BAN the word "zero" (no "zero live sparring", "zero roughhousing", "zero muscling", "zero meathead ego") and negative language (no "without", "no injuries", "stop", "don't", "won't", "never"). Always substitute positive affirming alternatives: *"Cooperative, coached movement from day one"*, *"Calm, structured partner drills"*, *"Respectful room and cooperative pacing"*, *"Pure mechanical leverage"*, *"Supportive team environment"*, *"Quiet confidence and balance"*, *"Train under one roof with your family"*.




## MCP Usage Policy

- Use `openaiDeveloperDocs` for any OpenAI, ChatGPT, Codex, MCP, tool-calling, model, API, SDK, or policy-related implementation or guidance work before using other sources.
- Use `context7` for framework, package, build tooling, CSS, JavaScript, Node.js, Bootstrap, and deployment documentation lookups before making implementation changes.
- Prefer official documentation as the primary source of truth; use secondary sources only when official docs are insufficient, and clearly label those cases.
- Do not add, upgrade, or replace dependencies unless required for the task; when needed, document why the dependency is necessary and what alternatives were considered.
- Never expose, log, or commit secrets, tokens, credentials, or private keys; when examples are needed, use obvious placeholders.
- Default MCP interactions to read-only actions; perform write, mutation, or destructive operations only when explicitly required by the task and scoped to the smallest safe change.
- For website-impacting edits, verify before finalizing: mobile layout, desktop layout, CTA visibility, accessibility basics, internal links, and SEO metadata.
- AGENTS.md precedence note: global and project-level guidance both apply; when they conflict, the project-level AGENTS.md guidance takes precedence for this repository.

## CSS Rules

Use the smallest safe CSS change.

Preserve the Sensei Sandy palette when possible:

```css
--ss-green: #116A42;
--ss-teal: #289FA1;
--ss-cyan: #00DDE0;
--ss-brown: #8B522E;
--ss-slate: #306061;
--ss-ink: #362B24;
--ss-bg: #FBFAF8;
--ss-surface: #FFFFFF;
--ss-surface2: #F4F1ED;
--ss-text: #1F1712;
--ss-muted: #4F433C;
--ss-border: rgba(54, 43, 36, 0.14);Prefer:

Global rules in global/base CSS
Reusable component rules in component CSS
Page-only rules in page CSS

Avoid:

Repeating the same CTA/card/button styles across many files
Adding new CSS files unless necessary
Creating specificity wars
Using !important unless there is no safer fix
Mobile Rules

Mobile is the priority.

For mobile:

Keep the hero short
Put the main action above the fold
Use one clear primary CTA
Keep sticky action bars simple
Prevent layout shift
Avoid huge embeds loading above the fold
Lazy-load non-critical media
Make tap targets easy to hit

For desktop:

Preserve clean spacing
Use grids where helpful
Do not add clutter just because there is more space
SEO Rules

Before changing SEO-sensitive pages, check:

Title tag
Meta description
Canonical
Robots meta
H1
Internal links
Structured data
Image alt text
Local relevance
Duplicate content risk

For local pages, include natural references to:

Tannersville
Hunter
Windham
Haines Falls
Catskills
Nearby class schedule
Free Intro
Kids, teens, and adults when relevant

Do not keyword-stuff.

Conversion Rules

Each page should answer one main question.

Common page jobs:

Homepage: Which first class fits me?
Schedule: Can I make this work this week?
Kids page: Is this safe and good for my child?
Teens page: Will my teen feel confident and accepted?
Adults page: Can I start even if I am out of shape?
Instagram page: What should I click first?
Glossary: What does this BJJ term mean and how do I start?

Preferred page flow:

Clear promise
Class or audience fit
Safety and beginner reassurance
Proof
Schedule or next step
Final CTA
Content Rules

Use short, clear copy.

Default reading level: simple adult-friendly language.

Use:

Specific class times when known
Clear local intent
Calm proof
Parent reassurance
“Free Intro” language

Avoid:

Hype without proof
Long abstract claims
Unclear CTAs
Duplicate paragraphs
Unverified review counts
Schedule Rules

Common schedule references:

Private Lessons: Morning
Kids: 5:00 PM
Teens: 5:00 PM
Adults: 6:00 PM
Training days: Monday, Tuesday, Wednesday, Friday
Saturday Adult No-Gi: 10:30 AM to 11:30 AM

When editing schedule UI:

Mobile should use simple day cards
Desktop can use a weekly grid
Do not show duplicate schedule systems at the same breakpoint
Keep private lessons secondary unless the page is specifically about private lessons
Code Quality Rules

Before editing:

Read the surrounding files.
Identify the smallest safe change.
Preserve existing naming patterns.
Avoid broad rewrites unless requested.

Follow:

DRY
SOLID where applicable
KISS
Single responsibility
Clear separation of concerns
Modular components
Graceful fallback behavior

Avoid:

Dead code
Redundant CSS
Large unrelated refactors
New dependencies without approval
Hardcoded secrets
Breaking existing URLs
Testing and Validation

After changes, run the most relevant available checks.

If the repo has scripts, prefer those:

npm test
npm run lint
npm run build
npm run preview
python -m pytest
project-specific validation commands

If no test scripts exist:

Check HTML validity where practical
Check console-risky JavaScript changes
Verify responsive behavior by inspecting affected markup/CSS
Confirm internal links and CTAs still point to the right URLs
Confirm images have dimensions or layout protection where possible

For UI changes, manually reason through:

Mobile layout
Desktop layout
CTA visibility
Accessibility
SEO impact
CLS/layout shift risk
Accessibility Rules

Keep pages usable for real families on phones.

Preserve or improve:

Semantic headings
Button/link clarity
Alt text
Color contrast
Focus states
Tap target size
Label text for forms

Do not replace real text with image-only text.

Performance Rules

Prioritize:

Less CSS duplication
Lazy loading
Image dimensions
Reduced render-blocking assets
Fewer repeated components
Smaller page-specific CSS
Avoiding unnecessary JavaScript

When optimizing:

Identify the bottleneck.
Remove redundant work first.
Prefer simpler structure over clever code.
Keep benchmarks or before/after notes when possible.
Safety Rules

Never expose or commit:

API keys
Passwords
Private tokens
.env secrets
Credentials
Private customer or student data

If a file appears sensitive, stop and ask before editing it.

Git Rules

Before making changes:

Check current git status.
Do not overwrite user work.
Keep edits scoped to the task.

Before finishing:

Summarize changed files.
Summarize tests/checks run.
Note anything not tested.
Note any follow-up risks.

Do not commit unless explicitly asked.

External Network Verification Rules

Before any live DNS, HTTP/HTTPS, remote-byte, or other external-network check, request the required elevated network approval first. Do not run an initial sandboxed network attempt and wait for it to fail; the workspace sandbox may deny DNS sockets with `Operation not permitted`. After approval, run the check through the approved network path and report the evidence separately from local checks.

Deployment Rules

Treat production changes carefully.

Before deployment-related edits:

Confirm environment-specific files.
Confirm dependencies.
Confirm rollback path.
Confirm critical pages still work.
Confirm SEO tags are not accidentally blocked or noindexed.

Deployment notes should include:

What changed
Why it changed
Files touched
Tests run
Rollback recommendation
Documentation Rules

When behavior changes, update relevant docs or add a short note.

Document:

New components
New page patterns
New scripts
New CSS organization
New SEO conventions
New deployment steps

Comments should explain why, not the obvious what.

Preferred Codex Workflow

For every task:

1. **Classify and Route by Tier**:
   - **Single Input**: Match and adopt the best persona for the input via `python3 assets/indranet-prompt-exporter/mcp/lib/persona_quick.py "<input>"`. Frame response with domain expertise, tone, and rubric.
   - **Plan (`/plan`)**: Dual-bind the Role Persona and the best matching INSTRUCTIONS asset via `python3 assets/indranet-prompt-exporter/mcp/lib/persona_quick.py --plan "<task>"`. Record `## Persona & Expert Framework`, numbered INSTRUCTIONS, and DoD. Decompose into swarm if multi-disciplinary.
   - **Goal (`/goal`)**: Orchestrate a multi-agent persona swarm. Coordinator adopts a Master INSTRUCTIONS asset (`Instructions - COMPETENCE`, `Instructions - BOOST`, `INSTRUCTIONS - Business Operations`). Decompose into workstreams with unique DoD IDs, write-path isolation, and dedicated worker personas + worker INSTRUCTIONS assets.
2. Restate the goal briefly.
3. Inspect the relevant files.
4. Make the smallest safe change.
5. Avoid unrelated cleanup.
6. Run available checks (`npm run qa:volatile-facts`, `npm run test:ads`, etc.).
7. Report:
   - Files changed
   - What changed
   - Tests run
   - Risks or next steps

When Unsure

Prefer asking before:

Adding dependencies
Reorganizing many files
Changing booking URLs
Changing pricing
Changing schedule facts
Removing content
Touching deployment or secret files

If the request is clearly scoped, proceed with the best safe implementation.


## Volatile operational facts

Do not hard-code current academy schedule, private availability, prices, address, phone, guarantee naming, or program entitlement inside editorial pages. Import canonical values or link to the authority page. The public schedule authority is `/schedule`; private coaching is request-based unless a canonical data source explicitly declares a recurring public slot. Run `npm run qa:volatile-facts` after changing schedule-sensitive content.

@RTK.md

## Restored Codex workflow assets

The restored Codex workflow assets are part of this repository's working
process and should be included when the task calls for persona selection,
planning, swarm audits, or Ad Studio work:

- Persona selector: `assets/indranet-prompt-exporter/mcp/lib/auto_persona.py`
- Fast persona helper & plan formatter: `assets/indranet-prompt-exporter/mcp/lib/persona_quick.py`
- Persona skill: `assets/indranet-prompt-exporter/skills/plan-persona/SKILL.md`
- Ad Studio handoff and tooling: `tools/ads/CODEX-HANDOFF-ADS.md` and `tools/ads/`

Run the persona selector for `/plan` and goal work, preserve its selected
persona and UUID in the artifact, and keep Ad Studio offline-only. Do not treat
browser profile data, prompt exports, generated campaign batches, or audit
reports as public deployment payloads.

## Persona Studio & Auto Persona Tri-Tier Operating Standard

All assistant and agent interactions in this repository operate under the **Persona Studio & Auto Persona Tri-Tier Model** backed by `assets/indranet-prompt-exporter/` (catalog of 800+ specialized personas, `auto_persona.py`, `persona_quick.py`, and `persona_planner.py`).

### 1. Goals (`/goal`): INSTRUCTIONS + Multi-Agent Persona Swarm
- Autonomous, multi-step, or long-running goals MUST be handled using **specific INSTRUCTIONS** combined with a **swarm of agent personas**.
- **Protocol**:
  1. **Coordinator Leadership & Master INSTRUCTIONS**:
     - The parent agent assumes a high-level coordinator persona (e.g. `AI SuperExpert Agent Specialist - Dr. Ada Turing` or `Dennis Stratton`) to govern scope, safety, and integration.
     - Select an overarching **Master INSTRUCTIONS asset** (e.g. `Instructions - COMPETENCE`, `Instructions - BOOST`, `INSTRUCTIONS - COMMANDS`, or `INSTRUCTIONS - Business Operations`) to guide orchestration and verification rigor.
  2. **Workstream Decomposition & Contract Planning**: Deconstruct the goal into distinct, bounded workstreams with explicit Definition of Done (DoD) IDs, read paths, write paths, allowed tools, and verification criteria.
  3. **Auto Persona & Worker INSTRUCTIONS Allocation**:
     - Run `persona_planner.py` (via `python3 assets/indranet-prompt-exporter/mcp/lib/auto_persona.py --plan --brief <brief.json>`) to select the optimal persona for each workstream.
     - Each workstream is paired with its domain-specific **INSTRUCTIONS asset** (e.g. code workstream receives `Instructions - CODE`; copywriting workstream receives `INSTRUCTIONS - CONTENT`; SEO/marketing workstream receives `INSTRUCTIONS - Business Operations`).
  4. **Wave Dispatch & Concurrency Limits**: Execute workstreams in dependency waves (`max_agents` 1..4), enforcing file-access conflict prevention (no overlapping write paths).
  5. **Completion Gate**: The coordinator must independently inspect final deliverables and verification evidence for every DoD criterion before marking the goal complete and emitting `<!-- GOAL_COMPLETE -->`. Worker agreement alone is insufficient.

### 2. Plans (`/plan`): Specific INSTRUCTIONS + Selected Persona (+ Swarm if Necessary)
- Plans must be deliberate, actionable, and rigorously bounded.
- **Protocol**:
  1. **Persona & INSTRUCTIONS Selection**:
     - Run `python3 assets/indranet-prompt-exporter/mcp/lib/auto_persona.py "<task_description>"` to bind the primary role persona.
     - Select the best matching **INSTRUCTIONS asset** from among persona assets (via `python3 assets/indranet-prompt-exporter/mcp/lib/persona_quick.py --instructions "<task>"`, e.g., `Instructions - CODE`, `INSTRUCTIONS - CONTENT`, `INSTRUCTIONS - Business Operations`, `INSTRUCTIONS - Vinnie Salzano VSL`, `INSTRUCTIONS - FINDATA`, `Instructions - COMPETENCE`) or run `persona_quick.py --plan "<task>"` to bind both in one step.
  2. **Persona & Expert Framework**: Always record `## Persona & Expert Framework` in the plan artifact (Role Persona title & UUID, Selected INSTRUCTIONS Asset & UUID, selection rationale, rubric, skillchain, loaded attachments).
  3. **Specific Step-by-Step INSTRUCTIONS**: Ground the numbered instructions directly in the selected INSTRUCTIONS asset's architecture, enforcing structured modularity, KISS/SOLID/DRY principles, and domain-appropriate checks.
  4. **Swarm Assessment**: If the plan spans multiple distinct capabilities (e.g., SEO + UI CSS + copy + QA), employ a swarm by decomposing into multi-persona workstreams. If single-domain, maintain a unified single-specialist track.
  5. **Definition of Done & Verification**: Every plan must state explicit DoD criteria, dependencies, constraints, and verifiable checks before work begins.

### 3. Single Inputs from the User: Best Persona for That Particular Input
- **Rule**: ALL single inputs, questions, ad-hoc edits, or quick inquiries from the user use the **best persona for that particular input**.
- **Protocol**:
  1. **Instant Lookup**: Match the input against Persona Studio (via `python3 assets/indranet-prompt-exporter/mcp/lib/persona_quick.py "<user_prompt>"` or capability matching).
  2. **Expert Lens & Tone**: Adopt the persona's specialized methodology, vocabulary, and rubric (e.g. Senior Copywriter Alex Turner for marketing copy; Dex Ryder for local SEO; IT Forensics / Orko for debugging; Dr. Ada Turing for agent architectures).
  3. **Preserve Host Safety**: Persona prompts are guidance and lens, not host authority. RTK conventions, no-secret rules, mobile-first design, and clean verification apply universally across all persona interactions.
