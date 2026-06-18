# Open Mat Ecosystem Blueprint (Digital Dojo)

## Summary
This internal blueprint defines the implementation path for the Sensei Sandy Open Mat Ecosystem. This document is the engineering specification for Phase 0 through Phase 5.

## Goals
- Build a linked technique knowledge system, not isolated pages.
- Improve student retention between classes with drill chains and fast lookups.
- Create embeddable technique cards that route authority and traffic back to Sensei Sandy.
- Keep safety constraints explicit in data and drill logic.

## Scope
- In scope: content model, graph rendering inputs, drill generator constraints, embed route requirements, media pipeline standards, JSON metadata contract.
- Out of scope in this document: production deployment scripts, authentication, and paid partner onboarding legal docs.

## Phase 0: Glossary MVP
### Goal
Each important technique becomes a page-level entity with enough metadata to connect across the site.

### Minimum data per technique
- `id`
- `term`
- `aliases[]`
- `type` (Position, Sweep, Pass, Submission, Escape, Takedown)
- 1 to 2 sentence definition
- one short loop and poster
- `connections.parents[]`
- `connections.children[]`
- `connections.counters[]`
- `drill_logic.success_rate`
- `drill_logic.beginner_safe`

### Acceptance
- Search by exact term and common alias resolves to the same canonical node.
- Each technique entity links to at least 3 related techniques.

## Phase 1: Technique Topology (Graph Visualization)
### Objective
Expose relationship structure visually using Cytoscape.

### Rendering model
- Nodes:
  - size by importance score
  - color by `type`
- Edges:
  - transition edges (solid)
  - counter edges (dashed)
- Interaction:
  - click node to highlight closed neighborhood
  - fade non-neighborhood nodes/edges
  - optional recenter/fit behavior

### Constellation Mode
- `on`: neighborhood highlighting enabled
- `off`: full graph without fade filtering

### UX constraints
- Keep labels readable on mobile.
- Do not trap keyboard focus.
- Provide fallback text when JS/data fails.

## Phase 2: Infinite Kumite (Drill Mode)
### Objective
Generate safe, useful drill chains via a constrained random walk.

### Algorithm constraints
- max depth: 3 to 5
- disallow loops in single chain unless explicitly enabled
- enforce beginner safety filters when lane requires it
- block unsafe transitions by age/lane/experience
- include "escape hatch" endpoint to stable position

### Required filters
- Gi / No-Gi
- Kids / Teens / Adults
- beginner-safe only
- curated `top_10_chains`

### Suggested output contract
- `start_id`
- `path[]`
- `lane`
- `gi_mode`
- `difficulty`
- `safe_exit_id`

## Phase 3: Sensei Card Protocol (Embeds)
### Objective
Partner sites can embed technique cards that maintain brand attribution and backlink flow.

### Minimum card UI
- title
- two-sentence definition
- 8 to 20 second loop
- one CTA: "Learn more at Sensei Sandy"
- subtle watermark/brand mark

### Security requirements
- CORS allowlist only for approved partner domains
- per-IP and per-origin rate limiting
- sanitized term routing (no path traversal)
- cache headers tuned for embed performance

### Route pattern
- `/embed/{term}` for canonical embed card render

## Phase 4: Media Refinery
### Objective
Convert raw clips into lightweight loops with consistent visual behavior.

### Output requirements
- WebM loop
- WebP poster
- normalized width and predictable aspect behavior
- no audio for loops unless explicitly required

### Pipeline notes
- Keep source files archived separately from optimized outputs.
- Track derivation metadata so stale outputs are detectable.

## Phase 5: JSON 4.0 (Graph + Drill Metadata)
### Objective
Unify data model so graph, drill mode, embeds, and glossary pages consume the same canonical structure.

### Recommended schema keys
- `id`
- `term`
- `aliases[]`
- `type`
- `meta.rank_min`
- `meta.gi`
- `meta.ruleset_legal`
- `graph_coords.x`
- `graph_coords.y`
- `connections.parents[]`
- `connections.children[]`
- `connections.counters[]`
- `drill_logic.success_rate`
- `drill_logic.beginner_safe`
- `drill_logic.combo_starter`

### JSON example
```json
{
  "id": "scissor-sweep",
  "term": "Scissor Sweep",
  "aliases": ["cross-collar scissor sweep"],
  "type": "Sweep",
  "meta": {
    "rank_min": "white",
    "gi": true,
    "ruleset_legal": true
  },
  "graph_coords": {
    "x": 120,
    "y": 260
  },
  "connections": {
    "parents": ["closed-guard"],
    "children": ["mount"],
    "counters": ["knee-cut-pass"]
  },
  "drill_logic": {
    "success_rate": "high",
    "beginner_safe": true,
    "combo_starter": false
  }
}
```

## Internal Linking And Auto-Linker Hardening
- Skip existing `<a>` tags.
- Avoid nested anchors.
- Respect code blocks and structured data script tags.
- Prefer first safe mention per section rather than over-linking.

## Engineering Checklist
1. Build/validate technique entities for MVP coverage.
2. Render graph with deterministic fallback layout.
3. Implement constrained random-walk drill generator with lane filters.
4. Add `/embed/{term}` route with allowlist CORS and rate limiting.
5. Run media refinery pipeline for loops and posters.
6. Validate JSON 4.0 fields across all consumers.
7. Run link QA to ensure no broken internal references.

## Evidence Notes Used In Public Companion Page
- Injury prevalence study (BJJ): Amsterdam UMC record for publication dated March 12, 2025.
- CDC MRSA athlete guidance: reviewed January 18, 2024.
- Mat cleaning/hygiene context: StatPearls wrestling skin infection review (2024 update).

## Companion Public Entry
- Purpose: parent/new-student orientation and safety-first framing.
- This doc is the implementation reference for builders.
