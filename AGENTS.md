# AGENTS.md

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
- Text Sandy First
- Start calm. Train smart.
- Your first class is a coached learning experience

Phone CTA:
- +1 (917) 736-8649

## Brand and UX Rules

Write and design for nervous beginners, parents, and returning adults.

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

Private Lessons: 4:00 PM
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

Restate the goal briefly.
Inspect the relevant files.
Make the smallest safe change.
Avoid unrelated cleanup.
Run available checks.
Report:
Files changed
What changed
Tests run
Risks or next steps
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


<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->

@RTK.md
