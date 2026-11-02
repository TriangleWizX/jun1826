# Category E path review

This reviews only the six E paths in the preserved `hold-before-a11y-release-20261103` stash, after the approved B/C/D paths were removed. No E files were applied, deleted, committed, or deployed. The code graph MCP was unavailable, so route and mapper checks used targeted repository and Git inspection.

## Simple explanation

Some E files are temporary or generated copies. The other CSS files are linked by real pages, but need only their own generated outputs checked. The asset list changed many unrelated files, so it cannot safely ship as one bundle.

## Approve / deny by path

| # | Path | Evidence | Recommendation | Your choice |
|---:|---|---|---|---|
| E1 | `src/assets/css/pages/everyday-jiu-jitsu.min.css` | Untracked 4.6 KB minified file. The live page `src/everyday-jiu-jitsu-training.html` links `everyday-jiu-jitsu.css`; the repository minifier has no job for this `.min.css` path. | **DENY / DELETE** as an unreferenced generated copy. | ______ APPROVE / DENY |
| E2 | `src/assets/css/pages/law-enforcement.css.tmp` | Untracked 412-line temporary file. It differs from the tracked `law-enforcement.css`; the page links `high-end-near.css`, not this temporary path. | **DENY / DELETE** as an unreferenced temporary copy. | ______ APPROVE / DENY |
| E3 | `src/assets/css/pages/near.css` | Six `/near/` pages and the BJJ classes/nearby towns routes link this CSS. The stash adds link colors and allows the narrow-screen eyebrow to wrap. The deploy mapper has explicit handling for its fingerprinted asset. | **APPROVE CSS source only.** Keep its exact generated CSS and referring HTML in a later isolated build/payload review. | ______ APPROVE / DENY |
| E4 | `src/assets/css/pages/spring-armor-drop.css` | `src/spring-armor-drop.html` links it and the deployment mapper recognizes the page. The stash raises the eyebrow/caption sizes and makes inputs inherit font and meet 44px height. This is a seasonal Spring campaign route. | **DENY for this release; keep held.** The route and generated CSS need a fresh current-use decision before release. | ______ APPROVE / DENY |
| E5 | `src/assets/css/pages/winter-armor-2027.css` | `src/winter-armor-2027/index.html` links it. The stash adjusts focus rings and small text sizes. The manifest changes its output fingerprint from `3f3262` to `827d06`, so the route must receive that exact generated file. | **APPROVE CSS source only.** Later verify the exact fingerprinted CSS and page mapping in an isolated build; this does not approve the manifest or a deploy. | ______ APPROVE / DENY |
| E6 | `src/assets/data/asset-hash-manifest.json` | Broad generated change: adds/removes mappings across many CSS and image assets, including removal of the Blog CSS entry. It is not limited to E3–E5. | **DENY as-is.** Regenerate after source choices, then reconcile only the exact approved output references. | ______ APPROVE / DENY |

## Easiest reply

Recommended choices: **E1 approve deletion; E2 approve deletion; E3 approve; E4 deny; E5 approve; E6 deny.**

“Approve” deletion for E1/E2 means remove only those exact untracked paths from the hold. “Approve” E3/E5 means keep those source edits eligible for a later exact build and mapping review; it does not authorize deployment. Blank choices keep the path held.

## Checks and limits

- Confirmed current source references for the `near`, Spring Armor, Winter Armor 2027, and Everyday Jiu-Jitsu stylesheets.
- Confirmed the deploy mapper has explicit `near.css` handling, includes `spring-armor-drop.html`, and recognizes `winter-armor-2027/` output paths.
- Confirmed the stash manifest changes the near, Spring, and Winter CSS fingerprints; Winter's generated path needs to follow the `827d06` mapping if later approved.
- Did not build, run Lighthouse/PageSpeed, check site-wide contrast, or perform keyboard acceptance.
- Do not upload the mixed root `dist/`; construct a clean exact payload only after these path choices.

## Applied choices

The user approved the recommended choices. The hold stash was rewritten to remove E1 and E2, restore E4 and E6 to its base, and retain only the E3 and E5 source edits from this category. The superseded pre-E-decision stash entry was dropped; the separate remediation/workbook stash remains. At that point, E3 and E5 were the only remaining modified E paths and no E changes had been applied to the checkout.

## Release result — 2026-11-03

The user later authorized commit and deployment. Commit `1a1885aa` contains the approved near and Winter CSS, the regenerated two-entry source asset manifest, and the narrow deploy mapper additions for Winter's page/CSS and the generated manifest. The mapper dry-run listed exactly 12 paths. The build passed; local browser checks and live browser checks for Nearby Towns, the BJJ Classes hub, and Winter Armor returned HTTP 200, with no horizontal overflow or page errors at mobile and desktop sizes. Live CSS and manifest bytes matched the generated release files; new stylesheet markers were confirmed on Nearby Towns, the BJJ Classes inline bundle, and Winter Armor. The six legacy `/near/*/` URLs redirect to canonical `/bjj-classes/*/` routes and therefore do not serve the generated legacy route HTML; those redirects were checked separately. No Lighthouse, PageSpeed, keyboard acceptance, or site-wide contrast check was run.

The committed E3/E5 source edits were then removed from the hold stash. The current top hold is `d06c3449dc062b1e081624be13a96a560d863d88`; the separate workbook stash remains `92e19c4ad40231e795e3711eb4f2552a032b49d2`.

## Persona & review method

The contextual selector nominated **Static Site Generator (Markdown to HTML, Blog, Docs, etc.)**, UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`. Its full prompt source was not present in the local exports, so it was not adopted. Review used an ordinary static-site routing and generated-output specialist approach: verify each stylesheet's source reference, mapper route, and manifest fingerprint separately.
