# Bio page performance remediation

## Goal and scope

Resolve the findings in `/home/twizss/.codex/attachments/28c34e5a-f840-44b2-b5b7-b18ac3a35b59/pasted-text-1.txt` for the current `/bio` page. Keep the public copy, existing visual design, accessible image text, and unrelated local edits intact. Do not run Lighthouse or PageSpeed; the user will run those checks.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, v4.0.0, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`. Full prompt: `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`; SHA-256 of `text`: `7e9919c2325eb5aba5c645f41b21c977a077a563161de22cea6caf8583ada092`; length 5,803 characters; attachments: none. Fit: multi-agent coordination, systems analysis, code optimization, risk assessment, and verification. Applied by separating stylesheet, image delivery, and render-delay diagnosis; the coordinator owns integration, dirty-tree safety, release mapping, and independent acceptance.
- **Master INSTRUCTIONS asset:** `INSTRUCTIONS - Business Operations`, UUID `c3369696-d996-447e-8973-5f2cd73d33c9`, catalog status complete. Its full 1,896-character text is in `assets/indranet-prompt-exporter/exports/index.json`, SHA-256 `16f3b49fb657ab6a0aa1d566a0adb59e664cd962d6ada7bb03b4d8a6d4bb2c5d`; attachments: none. Fit: execution planning, risk review, performance metrics, and outcome assessment. Applied to release risk and evidence gates. Code-specific implementation follows repository `AGENTS.md` and the compatible portions of `.agents/skills/web-performance-evidence/`.
- **Worker selection and fallbacks:** the selector found no source-backed persona for CSS critical-path analysis or LCP render-delay diagnosis. Its image workstream candidate, Static Site Generator (Markdown to HTML, Blog, Docs, etc.), UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, is partial, lacks `description` and `notes`, and describes authoring a Markdown blog generator rather than image delivery; it was rejected. `Instructions - CODE` (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`) and `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`) are partial and have no complete prompt exports, so they were not adopted. Three distinct ordinary specialist fallbacks are used: CSS request-graph analyst, responsive-image delivery analyst, and browser-rendering root-cause analyst. No persona prompt or worker instruction asset is claimed for them.
- **Implementation persona check (2026-10-31):** `persona_quick.py --plan --json` returned James Burke for the image task with project-management capability evidence only; rejected. The CSS task returned no suitable persona. A full-stack catalog application had no standalone prompt source, and `Instructions - CODE` is partial, so neither is adopted. The existing unique ordinary specialists remain the supported fallbacks.
- **Evidence method:** `.agents/skills/web-performance-evidence/SKILL.md` and its `references/routes.md`, `references/thresholds.md`, and `references/methodology.md` were read. Its Lighthouse phase is excluded by the user. Use its provenance, source-versus-live distinction, and traceability methods without scoring or claiming measured performance gains. Context7 resolved Eleventy to `/11ty/docs`; passthrough-copy documentation confirms that paths inside `src` retain their relative path below the output directory. The code graph MCP service returned `Transport closed` for project listing, indexing, and symbol search; code discovery uses scoped file search and direct source inspection.

## Evidence from the supplied report and current source

- The supplied capture reports six render-blocking stylesheets with 570 ms estimated savings, a 545 ms maximum critical-path latency, no useful preconnect candidates, and a 2,400 ms element-render delay for the first `.bio-hero-copy` paragraph. Its TTFB is 10 ms.
- It reports `/assets/images/20240613_192308_resized.651d6c.jpg` at 203.9 KiB, with 199.2 KiB estimated savings. The source file is 2,213 × 2,210 pixels. The report describes a 335 × 335 rendered image, while both local source and current live HTML declare `width="335" height="165"`; verify the actual rendered box before changing dimensions.
- A current live HTTP read confirms the six stylesheet fingerprints in the report still appear on `/bio`: `bootstrap-icons-local.6444e2.css`, `fonts.min.5ee9a4.css`, `site-shell.min.7f177f.css`, `pages/bio.min.5774c0.css`, `routes/site-18ac9c2704ce.min.css`, and `mobile-foundation.114422.css`. The live promotion image remains lazy-loaded. The first hero paragraph is present in the returned HTML. The separate lead hero photograph is already `loading="eager" fetchpriority="high"`; it is not the 2,213-pixel promotion image.
- The current local generated `dist/bio.html` has the same first five CSS URLs but references `mobile-foundation.d8c863.css`, while live still references `mobile-foundation.114422.css`. Local `dist/bio.html` SHA-256 is `bf61bbca79f8a6be5fc60da0c60b022541ef8f47d26d7da903658aada4ab6d34`. Treat this as a meaningful local/live difference caused by the dirty generated tree; do not deploy the current route wholesale.
- The shared checkout has 381 changed paths. Relevant uncommitted files include `src/_includes/components/head-metadata.njk`, `src/assets/css/site-shell.css`, and `src/assets/css/mobile-foundation.css`. Keep these exact local edits and all generated `dist` state intact. The Bio source page and page CSS are clean at the start of this work.
- No preconnect is planned: the report identifies no additional useful origin, and the listed resources are same-origin.

## Workstreams and contracts

| DoD | Specialist fallback | Read scope | Write scope | Deliverable / verification |
| --- | --- | --- | --- | --- |
| BIO-CSS-1 | CSS request-graph analyst (ordinary specialist fallback; no suitable complete persona or code-instruction asset) | Bio source, exact CSS links/assets, route-style builder, package build pipeline, isolated generated Bio HTML/CSS | `/tmp/bio-css-audit-20261031/tools/build-bio-delivery-styles.mjs` and its isolated Bio output only | Bundle the ordered Bio page stylesheet, Bio route bundle, then mobile-foundation stylesheet into one fingerprinted Bio asset. Preserve the three shared CSS links (icons, fonts, site-shell), preloads, cascade and URL semantics. Integrate through the build chain as a separate narrow package patch; verify exact output path and no other route/output changes. |
| BIO-IMAGE-2 | Responsive-image delivery analyst (ordinary specialist fallback; no suitable complete image-optimization persona) | Bio markup, source JPEG, fingerprint path, isolated image worktree | `/tmp/bio-image-audit-20261031/src/assets/images/bio-black-belt-promo-670x669.webp` only | Create and visually compare a 670 × 669 WebP candidate with the source. Record dimensions, bytes, crop comparison, and existing fingerprint-path behavior. Do not edit main source or generated output; preserve the original JPEG. |
| BIO-LCP-3 | Browser-rendering root-cause analyst (ordinary specialist fallback) | Bio markup, dirty global CSS, layouts/includes/JS, local and live HTML | None; audit complete | First paragraph is in initial HTML; scripts are deferred, fonts use `font-display: swap`, and no reveal/hide rule was found. Keep paragraph markup and copy unchanged unless new source evidence appears. |

The coordinator independently owns BIO-RELEASE-4: review the isolated stylesheet and image candidates, integrate only supported changes, avoid rebuilding over dirty generated output, run focused non-Lighthouse checks, verify the exact Bio route/assets, deploy only reviewed Bio outputs under the user's existing authorization, and report that Lighthouse performance scores remain for the user to check.

## Constraints and completion checks

- Do not remove same-origin CSS or defer it solely to lower request count. Preserve the first viewport, navigation, mobile layout, no-JavaScript behavior, focus, and font rendering.
- Do not promote the below-fold portrait image to eager loading. Optimize its transferred bytes only after confirming its actual display size and the existing fingerprinting/output path.
- Do not alter marketing copy, canonical facts, URL policy, image meaning/crop, or unrelated dirty files.
- Completion requires the worker reports, a proven minimal fix for supported findings, generated-output mapping that does not overwrite the main dirty tree, focused source/route/browser verification without Lighthouse, exact deploy scope and live content confirmation, and a closed temporary-workspace inventory.

## Status

The scoped source changes were committed, built from a clean snapshot, deployed, and verified in live HTTP and isolated browser checks. Main generated files were restored exactly to their pre-deploy bytes or prior absence. Temporary Bio artifacts and the 1.6 GiB CSS checkout were removed. The only measurement intentionally outstanding is the user's own Lighthouse/PageSpeed run; no performance score or LCP improvement is claimed.

## Workstream results and evidence

- **BIO-CSS-1 — clean build and rendered-route verification passed.** The guarded builder at `tools/build-bio-delivery-styles.mjs` accepts exactly six input stylesheet links; combines Bio page, route, and mobile-foundation CSS in the existing order; and leaves icons, fonts, site-shell, and all preloads intact. It rejects relative CSS URLs, imports, extra links between the selected styles, and stylesheets after mobile-foundation. Candidate output has four stylesheet links. The earlier dirty candidate using mobile-foundation `d8c863` was discarded. The clean committed build uses mobile-foundation `114422` and emits `/assets/css/pages/bio-delivery.eea4bc64a2b1.css`. Its inputs total 81,549 bytes and 16,464 local gzip bytes; the bundle is 81,550 bytes and 15,957 local gzip bytes (507 fewer compressed bytes). The output route has exactly four stylesheet links: icons `6444e2`, fonts `5ee9a4`, site-shell `7f177f`, and the Bio delivery bundle. These local byte/request facts are not measured LCP improvement.
- **BIO-IMAGE-2 — source candidate ready.** The retained-frame 670 × 669 WebP is 27,198 bytes (SHA-256 `5f6f3a01f1e6e82aae4a1017203515cc395e0e6fd1590e7f4083644a5f997716`), compared with the 2,213 × 2,210, 208,795-byte JPEG. The reduction is 87.0%. The `<img>` keeps its alt text, `loading="lazy"`, and async decoding; dimensions now match the source ratio at 335 × 335. The clean build confirms `/assets/images/bio-black-belt-promo-670x669.ebb96d.webp` and the manifest mapping. Local isolated Chromium scrolled to the lazy image and loaded it at natural 670 × 669 and rendered 252 × 252 at 390 px viewport width.
- **BIO-LCP-3 — audit complete; no code change justified.** The first `.bio-hero-copy` paragraph is in initial HTML; scripts are deferred; its CSS contains no reveal/hide rule; local font faces use `font-display: swap`; no preconnect candidate was found. The report's 2,400 ms element-render delay is not attributable to a paragraph-specific source mechanism. Leave paragraph copy and markup unchanged.

## Delivery and verification record

### Build and local browser checks

- The committed snapshot was built in `/tmp/bio-css-audit-20261031` after first verifying that the copied dirty CSS/head overlays exactly matched main, then resetting them. The checkout was expanded from its prior sparse file set and used a symlink to the main `node_modules`; no dependency tree was copied. `npm run clean` followed by `npm run build` completed with exit code 0.
- The generated Bio page has four stylesheet links: `bootstrap-icons-local.6444e2.css`, `fonts.min.5ee9a4.css`, `site-shell.min.7f177f.css`, and `bio-delivery.eea4bc64a2b1.css`. The merged input fingerprints are Bio `5774c0`, route `18ac9c2704ce`, and mobile-foundation `114422`; original order is preserved.
- The separate inputs are 81,549 bytes and total 16,464 gzip bytes locally. The merged output is 81,550 bytes and 15,957 gzip bytes, a 507-byte compressed reduction. This does not prove an LCP improvement.
- The generated WebP is 27,198 bytes with SHA-256 `5f6f3a01f1e6e82aae4a1017203515cc395e0e6fd1590e7f4083644a5f997716`. Generated HTML uses the matching `.ebb96d.webp` fingerprint, 335 × 335 dimensions, original alt text, async decoding, and lazy loading.
- Isolated Chromium at 390 × 844 and 1440 × 1000 returned HTTP 200 for `/bio.html` and `/schedule/`, with no horizontal overflow, page errors, or failed requests. Off-origin requests were blocked. After scrolling, the Bio image loaded at natural dimensions 670 × 669 and rendered dimensions 252 × 252 at the mobile viewport.

### Commits and deployment

- `e4d51dc` — removed the separate “Kids classes · Teen classes” links from the Schedule class-fit card. The class names remain linked inline after each time.
- `7c52d51` — added the Bio WebP, Bio CSS builder, build command, fingerprint manifest entry, and exact generated-output mapping. Its Bio payload dry run listed four files: `bio.html`, `assets/css/pages/bio-delivery.eea4bc64a2b1.css`, `assets/images/bio-black-belt-promo-670x669.ebb96d.webp`, and `assets/data/asset-hash-manifest.json`.
- The Schedule payload dry run listed only `schedule/index.html`. Both approved deployments returned exit code 0. The Bio deployment log confirmed the four exact paths and their remote byte sizes. Both deployments reused the previously verified remote backup; no remote backup cleanup was attempted.

### Live verification

- `/bio?codex_release=7c52d51` returned HTTP 200 (90,263 response bytes) with exactly four stylesheet links and the new promotion WebP URL.
- The live Bio delivery CSS returned HTTP 200, 81,550 bytes, SHA-256 `eea4bc64a2b134e892c15b711f2a35c07fcdec75aa6d09b7ebb370b273f1dffa`.
- The live WebP returned HTTP 200, 27,198 bytes, SHA-256 `5f6f3a01f1e6e82aae4a1017203515cc395e0e6fd1590e7f4083644a5f997716`. The live asset manifest returned HTTP 200 and maps the source image to `.ebb96d.webp`.
- Live isolated Chromium at 390 × 844 and 1440 × 1000 returned HTTP 200 on both routes, with no horizontal overflow, page errors, or failed requests. The rendered Schedule DOM shows `5:00 PM` followed directly by linked “Kids” and “Teens”; the separate “Kids classes” and “Teen classes” labels are absent. A live browser scroll loaded the lazy WebP at 670 × 669 natural and 252 × 252 rendered dimensions.

### Local generated-tree restoration and remaining metric boundary

- Before staging release outputs, the prior main `dist` state was saved in `/tmp/bio-css-audit-20261031/.release-backup/restore-map.json`. After live verification, existing `dist/bio.html`, `dist/assets/data/asset-hash-manifest.json`, and `dist/schedule/index.html` were restored to their exact recorded SHA-256 values. The new Bio CSS and WebP paths were returned to their prior absent state.
- No Lighthouse or PageSpeed checks were run, per the user’s instruction. The source report’s 570 ms estimate and 2,400 ms paragraph render delay are not claimed as measured improvements. The paragraph finding remains source-unexplained; no copy or markup change was made. PageSpeed measurement remains for the user.
- Same-session cleanup is complete: the local server, browser/build artifacts, restore snapshot, and 1.6 GiB CSS checkout were removed. The inventory row is closed and the read-only workspace audit passed.
