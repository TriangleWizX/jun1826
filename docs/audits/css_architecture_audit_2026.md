# CSS Architecture & Layout Consistency Audit (2026-W38)
**Goal ID**: `GOAL-CSS-AUDIT-2026-W38`
**Coordinator**: AI SuperExpert Agent Specialist - Dr. Ada Turing
**Framework**: Instructions - COMPETENCE

## Executive Summary
A comprehensive swarm audit of the `src/assets/css/` directory (397 files) was conducted across three parallel workstreams: Build Systems, Layout/Specificity, and Design System Integrity. The audit identified significant technical debt resulting from legacy migrations, specificity escalation, and design token abandonment.

---

## 1. Build System & File Redundancy (Workstream 1)
* **Finding 1: Git-Tracked Build Artifacts:** The `tools/fingerprint-assets.cjs` script is writing fingerprinted files (e.g., `base.bfd8e4.css`) directly back into the `src/` directory instead of the `dist/` output. This has resulted in hundreds of stale hashed files polluting version control.
* **Finding 2: Hardcoded Hashes:** Global layouts (`head-metadata.njk`) contain hardcoded legacy hashed files (e.g., `bootstrap-icons-local.4f51bc.css`).
* **Finding 3: Overlapping Monoliths:** `ss.css` (228KB), `base.css` (97KB), and `styles.css` (69KB) are legacy monoliths that overlap with the new `components.css` (361KB) and `bootstrap-site.css` (250KB) pipeline.

**Remediation Action:**
- Run `git rm` on all `*.[a-f0-9]{6}.css` files inside `src/`. Update `.gitignore`.
- Update build pipelines to write assets exclusively to the Eleventy output directory.
- Deprecate `ss.css`, `base.css`, and `styles.css`, shifting fully to the PurgeCSS component bundler (`tools/build-component-bundles.mjs`).

---

## 2. Layout Fragility & Specificity Wars (Workstream 2)
* **Finding 1: `!important` Explosion:** There are over 1,000 instances of `!important` declarations across `components.css` and `site-shell.css`, fundamentally breaking the CSS cascade.
* **Finding 2: Desktop-First Anti-Pattern:** The codebase uses 167 `max-width` (desktop-first) media queries compared to only 32 `min-width` (mobile-first) queries, significantly hurting mobile rendering performance.
* **Finding 3: Deep Coupling:** Component styling is tightly bound to page-level parent classes (e.g., `.page-programs .hero-content-card`), preventing UI reuse.
* **Finding 4: Rigid Grids:** Widespread use of static column grids (e.g., `120px 1fr`) without `auto-fit` scaling.

**Remediation Action:**
- Invert the CSS to mobile-first architecture (`min-width` scaling).
- Enforce BEM-lite component isolation (remove `.page-*` prefixes from reusable cards).
- Sweep and remove `!important` declarations by fixing the cascade depth.
- Refactor grids to `repeat(auto-fit, minmax(..., 1fr))`.

---

## 3. Design System & Token Integrity (Workstream 3)
* **Finding 1: Hex Code Hardcoding:** Widespread circumvention of the core brand palette variables. `base.css`, `adults.css`, and `high-end-near.css` constantly use raw hex codes (`#116A42`, `#FFFFFF`, `#1f2937`) instead of `--ss-green`, `--ss-surface`, and `--ss-ink`.
* **Finding 2: Static Pixel Typography:** Arbitrary pixel values (`12px`, `13px`, `14px`, `16px`) are heavily hardcoded across components, destroying fluid responsive scaling and overriding browser accessibility preferences.

**Remediation Action:**
- Run a global replacement mapping raw hex values back to the `var(--ss-*)` token system.
- Refactor all static `px` fonts to relative `rem` units (e.g., `16px` -> `1rem`).
- Introduce CSS linting rules (Stylelint) to explicitly block raw hex codes and static `px` font sizes in CI.

---
**Status**: AUDIT COMPLETE. Awaiting execution phase.
