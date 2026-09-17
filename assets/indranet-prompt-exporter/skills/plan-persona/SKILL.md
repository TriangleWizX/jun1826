---
name: plan-persona
description: Guides contextual persona routing, full-source review, host adoption, and evidenced application for plans, goals, and related work.
---

Use this skill for `/plan` requests and for creating, refining, decomposing, or execution-planning a goal. Do not create a goal merely because this skill applies to an ordinary task.

## Workflow Execution Steps

**Pre-work gate:** Interpret short prompts using the active conversation. Routing
returns candidates, not adopted experts. Read each selected full `prompt.json`,
evaluate methodology and readiness, inspect required attachments, and record how
the read methods guide the actual task before substantive implementation.

**Recover unread output:** `<<ccr:...>>`, offload markers, and truncation mean the
source is still unread. Use `rtk proxy python3
assets/indranet-prompt-exporter/mcp/lib/persona_read.py EXACT_EXPORT_PROMPT_JSON`.
Follow `next_offset` with `--offset` and `--sha256` until EOF. If the displayed JSON
is compressed, parse the tool result inside `functions.exec` and emit each chunk
separately with `text(chunk)`. The reader preserves all JSON source fields and
rejects changes between pages. Never count a hash, EOF, or snippet as host adoption.

**Identity:** An app introduction can occupy a root `prompt.json` while the actual
persona exists under `versions/`. Check type, UUID, linked prompt, and actual text;
record the exact versioned path and UUID when chosen. Do not claim the router
selected an unavailable version. Disclose a specialist fallback when necessary.

1. **Select Persona Prompt & INSTRUCTIONS Asset**:
   - For plans and contextual single inputs, run `python3 assets/indranet-prompt-exporter/mcp/lib/persona_quick.py --plan "<task_description>"` to obtain role and instruction candidates. Independently review both before adopting them; score and timing are not evidence of fit.
   - For goals, run `auto_persona.py --plan --brief <brief.json>` to assign a coordinator Master INSTRUCTIONS asset and allocate worker personas with domain-specific INSTRUCTIONS assets across dependency waves.
2. **Record the framework**:
   Add a `## Persona & Expert Framework` section to the plan or goal artifact with:
   - Role Persona title and UUID.
   - Selected INSTRUCTIONS Asset title and UUID.
   - Selection rationale.
   - Relevant rubric, execution methodology, and skillchain.
   - Loaded attachments, or the explicit value `none`.
   - How the persona and instructions change planning, execution, and verification.
3. **Plan work and goals**:
   - For a plan, deliver numbered, concrete INSTRUCTIONS grounded in the selected INSTRUCTIONS asset, and evaluate whether multi-disciplinary scope requires decomposing into a swarm.
   - For a goal, decompose into bounded workstreams with unique Definition of Done (DoD) IDs, explicit read/write paths (avoiding concurrency write conflicts), and empirical checks.
4. **Execute and verify**:
   Apply the selected persona's and INSTRUCTIONS asset's documented principles, rubric, and skillchain during execution and verification. Keep evidence boundaries explicit: distinguish repository facts, user decisions, external checks, analytics, and business outcomes.
5. **Report goal state honestly**:
   Classify a goal as `active` while required work remains, `complete` only when its definition of done and verification evidence are satisfied, or `genuinely blocked` when an external dependency or missing required input prevents meaningful progress. Never mark a goal complete because of elapsed effort, a token or budget limit, or partial progress.

## Current handoff example

For the current handoff backlog, the framework records:

- Selected persona: `Computer Repair Utility - IT Forensics Studio`.
- UUID: `9d73053d-f13d-4972-a15d-cec366c8e94c`.
- Contribution: evidence-first verification, reproducible observations, and separation of environmental failures from site defects.
- Supplementary disciplines: CRO, analytics, SEO, release readiness, and browser verification.
- Loaded attachments: `none`.

The corresponding goal is to produce an evidence-backed release and CRO readiness report. It is done only when authorized live checks are completed, local and browser audits are recorded, analytics instrumentation status is classified, and unknowns are documented. Its non-goals are production edits, deployment, unsupported business claims, and unverified GA4 performance conclusions. Treat this as an example of the framework, not as a hard-coded requirement for unrelated tasks.

Preserve `rtk` conventions, dirty-worktree safety, approval gates, and no-secret rules. Do not run live suites or external checks without the required elevated approval.
