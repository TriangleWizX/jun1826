---
name: plan-persona
description: Automatically selects and applies the best Indranet persona prompt and reference assets for plans, goals, and related execution or verification work.
---

Use this skill for `/plan` requests and for creating, refining, decomposing, or execution-planning a goal. Do not create a goal merely because this skill applies to an ordinary task.

## Workflow Execution Steps

1. **Select Persona Prompt**:
   Run `python3 assets/indranet-prompt-exporter/mcp/lib/auto_persona.py "<task_description>"` for the actual planning or goal task. Preserve the selector's result; do not invent a persona, rubric, skillchain, or attachment contents.
2. **Record the framework**:
   Add a `## Persona & Expert Framework` section to the plan or goal artifact with:
   - Persona title and UUID.
   - Selection rationale.
   - Relevant rubric and skillchain.
   - Loaded attachments, or the explicit value `none`.
   - How the persona changes planning, execution, and verification.
   If the automatic choice is incomplete or mismatched, keep it for traceability and supplement it with relevant domain skills. Label supplements separately from the selected persona.
3. **Plan work and goals**:
   For a goal, state the concrete objective and definition of done. Separate the desired outcome from implementation tasks, and identify scope, constraints, dependencies, risks, blockers, and measurable verification evidence. For a plan, describe the intended outcome, bounded work, dependencies, and checks at the level needed to execute safely.
4. **Execute and verify**:
   Apply the selected persona's documented principles, rubric, and skillchain during execution and verification. Keep evidence boundaries explicit: distinguish repository facts, user decisions, external checks, analytics, and business outcomes. Do not claim an external or business result from local evidence alone.
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
