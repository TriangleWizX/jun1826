# WS-32 — Giveaway Official Rules release

Status: deployed and independently verified by Codex. Closure awaits Sassafras' live read.

## Scope and approval

The source is section 4 of the Giveaway Copy Pack v2 pasted by the owner in this
thread. The owner confirmed that section 4 controls both conflicts: the extension
threshold is checked when the November 1 draw closes, and Halloween paper entry
is an alternate entry method with one entry per person per draw. The owner
confirmed publication of that exact section. Captions and entry flows were not
edited.

The rules appear in `src/giveaway-rules.html`, with only semantic HTML and links
around the approved words. The page uses the existing site shell and mobile
foundation. The canonical path is `/giveaway-rules`, generated as
`dist/giveaway-rules.html`. The URL registry and deployment allowlist include
the new route. The page adds no art, offer, signup form, price, or class time.

## Persona & Expert Framework

Coordinator: Coding Solution - CodeFarm v9.1.0, UUID
`19c0dba7-ee75-4d2d-afd0-2425be1ef819`, source
`assets/indranet-prompt-exporter/exports/Coding-Solution---CodeFarm/versions/v9.1.0/prompt.json`.
Complete source read; no attachments. Applied bounded requirements, lightweight
implementation, review, and concrete verification.

Instructions: Instructions - CODE v1.0.0, UUID
`25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source
`assets/indranet-prompt-exporter/exports/index.json` matching UUID entry.
Full text read; metadata lacks only notes; no attachments. Applied small
modules, source inspection, code review, functional verification, and deployment
scope checks.

Independent read-only reviewer: Orko Debugulator v1, UUID
`d4f92b03-1a52-49e1-8ffa-c7f2ce8cabfa`, source
`assets/indranet-prompt-exporter/exports/Debugger-Analyzer---Orko-the-Debugulator/versions/v1.0.0/prompt.json`,
paired with CODE. Complete source read; no attachments. The reviewer compared
the approved words and checked route, layout, and release scope. Coordinator
independently reviewed the result. Reviewer had no site write paths.

## Verification

The first `qa:volatile-facts` attempt matched the approved giveaway opening
timestamp against a blanket `10:00 AM` class-time pattern. After the owner
asked for the fix, the checker was narrowed to recognize the exact phrase
`Sunday, October 25, 2026 at 10:00 AM ET` in this one rules file. It requires
that phrase once and still scans all other times. The public rules stayed
unchanged.

After the final page edit, the required gates ran in order and passed:

1. `npm run qa:volatile-facts` — 573 files checked.
2. `npm run test:ads` — 35 tests passed.
3. `npm run validate` — generated page and sitemap; all included checks passed.
4. `npm run qa:schedule` — schedule audit passed.

The generated main content matches the approved section 4 after whitespace
normalization: 3,448 characters, SHA-256
`9f7c7d0a38987b8cec71141a42496fcddc8e4ae932acc2db2713c8b8797e016f`.
The local browser returned HTTP 200 with no page errors or overflow at 390px
and 1440px. At 360px, `scrollWidth=360`, body copy was 16px, and the viewport
allowed zoom. Local evidence: `/tmp/ws32-browser-proof-final/` and
`/tmp/ws32-360.png`.

## Deployment and live read

The release used commit `2ff85d22`. The reviewed dry run listed exactly
`sitemap-core.xml` and `giveaway-rules.html`. The same `--only` payload was
uploaded; the script reported 8,958 and 18,942 remote bytes, respectively.

Live `https://senseisandy.com/giveaway-rules` returned HTTP 200 and the same
3,448-character main rules text. The title, canonical, and indexable robots
metadata were correct. Live `sitemap-core.xml` returned HTTP 200, contained
the route, and matched the deployed local file byte-for-byte: SHA-256
`4424a865a3524632bf3ff2f8d618a6a6887a733f68834df11d01c9ac994c3a86`.
Live isolated browser checks returned HTTP 200 at 360px, 390px, and 1440px,
with no horizontal overflow or page errors. The 360px copy was 16px, and all
rules links pointed to the intended routes. Live evidence:
`/tmp/ws32-live-browser/` and `/tmp/ws32-360-live.png`.

The deploy script reused an August 22 backup archive. That old full-site
archive is not a safe current-site rollback. For a scoped rollback, remove the
new `giveaway-rules.html` and restore the prior `sitemap-core.xml` from
`/tmp/ws32-sitemap-core-before.xml` (SHA-256
`ee7ee2a9734e68c14da544048a671c430e2e2b105cca47e00278cf536830db79`).

Sassafras' live read remains the specific closure condition in the WS-32 brief.
