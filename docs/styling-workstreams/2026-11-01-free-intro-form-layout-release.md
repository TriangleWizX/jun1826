# Free Intro form layout release audit — 2026-11-01

## Goal and scope

Continue the active dirty-worktree commit/deploy goal. Audit the two current, user-approved Free Intro form/layout edits and release them only if the exact generated route and any consumed components are proven. Preserve every unrelated dirty path and never build into root `dist/`.

Current input diffs:

- `src/_includes/components/form-free-intro.njk`: change the “Step 1 of 4” kicker to the slate token.
- `src/_includes/critical/free-intro.njk`: increase the first-visit lane note from 0.9375rem to 1rem.

## Persona & Expert Framework

- **Coordinator role:** ordinary static-site responsive-layout and release specialist fallback. The selector ranked “Static Site Generator (Markdown to HTML, Blog, Docs, etc.)” (UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`), but its complete catalog text describes a Markdown-to-website generator and does not fit this task. The prompt export contains no standalone `prompt.json` for it. The “MainFrame” alternative is a wireframe designer and also does not fit. No persona adoption is claimed.
- **Worker role:** ordinary Free Intro source/output mapping reviewer fallback. Selection found no suitable candidate for this narrow consumer-map audit.
- **Instructions asset:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, ready. Its full source was reviewed in the active goal plan. Apply source-to-output tracing, exact diffs, isolated builds, and release dry-runs.
- **Attachments:** none.
- **Evidence standard:** distinguish the source diff, actual generated route and CSS, browser-visible results, deployment payload, and live verification. Existing root `dist/` is not release evidence.

## Workstream contracts

| DoD | Owner and scope | Write paths | Completion criteria |
| --- | --- | --- | --- |
| `FREEINTRO-OUTPUT-MAP-20261101` | Independent read-only reviewer; trace the two templates to their actual consumers and output routes; confirm the two changes are user-approved and no unrelated source hunk is required. | None | Exact include/build chain and affected route list; identify unused inputs; stop if mapping is ambiguous. |
| `FREEINTRO-ISOLATED-BUILD-20261101` | Coordinator; archive current `HEAD`, overlay only the two approved template diffs, build outside the checkout, inspect route/CSS output, and run focused browser checks. | Registered `/tmp/freeintro-form-layout-20261101/`; compact evidence in this directory only if release-ready. | Isolated build and fingerprint gate pass; output bytes contain the two intended changes; no unrelated input changes; focused phone/desktop checks pass; exact deploy dry-run includes only required outputs. |

## Constraints and stop conditions

- Do not stage the unused form partial unless a current template or runtime consumer is proven.
- Keep the broad dirty asset manifest, route output, and unrelated CSS unstaged.
- Do not run Lighthouse/PageSpeed, site-wide contrast checks, or keyboard acceptance; those remain owner-run.
- If the component is unused or the lane-note change fans out beyond the intended page, document the finding and do not deploy that part.
- Close the temporary workspace after preserving only compact evidence; do not keep a second checkout or `node_modules` copy.

## Status

The independent output-map review found that both original template hunks are unused: the form partial has no consumer, and `critical/free-intro.njk` is not loaded by the Free Intro build. The route's active lane-note rule is in `src/assets/css/pages/book-free-intro.css:43`; the selector found no other source consumer. I held both dead hunks from release.

To carry the approved 1rem lane-note intent to the active source, changed only the active CSS declaration and regenerated its minified pair. In the isolated candidate, the route output from the two unused template diffs was byte-identical to output with clean template inputs (`8a040915826e29c1df5cbb5aa880be467e95f801fc85b0851bd6c44fbb11d4f4`). With the active CSS change, the generated route SHA-256 is `64bbec0e4f6734e72b16c9d4cc969ab9c9a6e3b6bfbf05e2453dd06dc80944d5`; its inline delivery stylesheet is `free-intro-delivery.9aaaa799a133.css`. The isolated fingerprint check passed for 157 managed assets.

Focused isolated browser results at 320×720, 390×844, and 1440×900 all show the lane note at 16px, fully within the viewport, with document width equal to viewport width. Off-origin requests were blocked. The Free Intro-specific deployment mapper now treats the active CSS and minified pair as route-owned inputs, requires the generated route and exactly one delivery CSS file, and includes those two outputs. Commit and deployment remain pending exact dry-run review.

The unused template hunks remain in the root worktree, unstaged. No form partial, broad manifest, root `dist/`, contrast, keyboard, Lighthouse, or PageSpeed change is included.
