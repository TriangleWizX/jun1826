# Codebase Architecture, SEO & Accessibility Technical Debt Audit (2026-W38)
**Goal ID**: `GOAL-ARCH-TECH-DEBT-AUDIT-2026-W38`
**Coordinator**: AI SuperExpert Agent Specialist - Dr. Ada Turing
**Framework**: Instructions - COMPETENCE

## Executive Summary
This comprehensive swarm audit investigated the core SEO architecture, Build Pipeline fragility, and Asset/Accessibility standards. Several critical structural flaws were identified, most notably the violation of source control boundaries by build scripts, malformed structured data schemas, and missing lazy loading across 100+ image assets.

---

## 1. SEO & Metadata Architecture (Workstream 1)
* **Finding 1: Canonical URL Risks**: The Nunjucks concatenation logic for `canonicalHref` inside `head-metadata.njk` lacks a safety check for leading slashes, risking invalid canonical URLs (e.g. `https://senseisandy.comsome-page`).
* **Finding 2: Dead Schema Links**: The JSON-LD `BreadcrumbList` schema in `structured-data.njk` explicitly links to a non-existent parent structure URL (`https://senseisandy.com/nearby-towns` instead of `/nearby-towns.html`), creating dead ends for search crawlers.
* **Finding 3: Malformed FAQ Schema**: The local town FAQ schemas have a typo where the `@` symbol is missing on `"type":"Question"`, which breaks Google's Rich Result parser.
* **Finding 4: Missing Social Alts**: The social graph tags (`og:image`, `twitter:image`) are injected into the head but lack their corresponding accessible alt properties (`og:image:alt`, `twitter:image:alt`).

**Remediation Action:**
- Patch the Nunjucks templates with strict URL concatenation checks.
- Repair the `@type` properties in the FAQ schemas and point the breadcrumbs to the correct `/nearby-towns.html` canonical path.

---

## 2. Build Pipeline & Tooling Debt (Workstream 2)
* **Finding 1: Source Boundary Violations**: Four separate node scripts (`build-all-sitemaps.mjs`, `build-glossary-pages.mjs`, `build-video-watch-pages.mjs`, `build-near-pages.mjs`) write transient generated artifacts directly into `src/` instead of `dist/`, polluting Git history and causing merge conflicts.
* **Finding 2: Heavy I/O Thrashing**: Three post-build scripts (`materialize-ssi-fragments.mjs`, `fingerprint-assets.cjs`, `ensure-glossary-asset-alias.cjs`) sequentially read and rewrite the entire disk output of Eleventy, causing severe performance degradation.
* **Finding 3: Redundant Regex Transforms**: `eleventy.config.js` executes 4 distinct string-replacement `addTransform` sweeps across the site markup, massively inflating build time.

**Remediation Action:**
- Refactor the generator scripts to use Eleventy 3.0 Virtual Templates (`addVirtualTemplates()`) or output to a gitignored `.tmp/` directory.
- Move disk-thrashing post-build modifications into memory via unified `addTransform` lifecycle hooks in Eleventy.

---

## 3. Accessibility & Performance Optimizations (Workstream 3)
* **Finding 1: LCP Blockers (Lazy Loading)**: 117 `<img>` tags across the codebase are missing `loading="lazy"`, which synchronously blocks rendering and harms Largest Contentful Paint (LCP) scores.
* **Finding 2: Missing Alt Text**: 4 images completely lack `alt` text attributes (across safety and kid pages).
* **Finding 3: Missing ARIA Labels**: 415 `<button>` elements and 112 icon-only `<a>` tags lack accessible names. A core dialog modal (`role="dialog"`) in `nav-include.html` also lacks an `aria-label`.

**Remediation Action:**
- Run a codebase-wide sweep to inject `loading="lazy"` on all images except critical hero banners.
- Enforce explicit `alt="[description]"` or `alt="" aria-hidden="true"` on all images.
- Standardize ARIA labels for icon-buttons, social links, and modals.

---
**Status**: AUDIT COMPLETE. Awaiting execution phase.
