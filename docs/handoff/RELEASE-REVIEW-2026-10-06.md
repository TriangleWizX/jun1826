# October 6 release review

## Release receipt

**Rollback limitation:** the deployer reused `senseisandy-predeploy-20260822T172530Z.tar.gz`. Its archive listing is readable and contains 11 of the 12 payload paths, but lacks `partials/nav-include.html`. It is a historical baseline, not a snapshot of the state immediately before this release. Do not restore it wholesale or claim exact pre-release rollback coverage. If rollback becomes necessary, prepare and validate a prior-source build in isolation and review the exact restoration payload. See `evidence-2026-10-06/rollback-archive-check.json`.

The user approved this six-path scope. Commit `fd8764b4` was created and its exact 12-output dry-run was deployed successfully. All 12 remote files match the reviewed checksums. Post-release HTTP marker checks and live mobile/desktop browser checks passed; both booking lanes rendered their calendar iframe. No booking was submitted. See `evidence-2026-10-06/deployed-byte-checks.json`, `live-marker-checks-post-release.json`, and `live-browser-results.json`. The pending language below records the original review state and is superseded by this receipt. No GBP or VSL publication occurred.

Status: prepared locally; no commit, upload, or production verification performed.
Update: read-only production response checks subsequently completed. All five routes returned HTTP 200, but every expected change marker was absent, including the short navigation label and booking-script preload. See `evidence-2026-10-06/live-marker-checks.json`. No upload was performed.

## Proposed commit scope

- `src/partials/nav-include.html`: mobile `Free Intro` label.
- `dist/nav-include.html`: generated shared navigation fragment.
- `src/instagram/index.html`: preserve youth/adult booking lanes and booking anchor.
- `src/schedule.html`: weekday first-visit links for youth and adults.
- `src/free-bjj-intro-tannersville-ny/index.html`: preload the existing Cal embed script.
- `scripts/deploy-release.py`: recognize the `instagram/` deployable route.

Existing unrelated documentation, daemon state, and VSL files are excluded. The handoff and evidence remain review artifacts outside this proposed website commit.

## Verification

Full build/validation and targeted browser results are recorded in `evidence-2026-10-06/`. The release mapper was exercised with a mocked source-name list, without secrets or remote connections. This is a proposed payload simulation, not the CLI dry-run for a real commit. The exact filtered payload has 12 paths; checksums and source locations are recorded in `proposed-release-payload.json`.

Changing the deployment script activates its existing glossary expansion rule. An unfiltered release would therefore exceed this scope. Use all of the exact filters below, then inspect the actual committed dry-run before uploading.

```sh
python3 scripts/deploy-release.py --commit <approved-commit> --dry-run \
  --only free-bjj-intro-tannersville-ny/index.html \
  --only instagram/index.html \
  --only nav-include.html \
  --only partials/nav-include.html \
  --only schedule.html \
  --only schedule/index.html \
  --only sitemap.xml \
  --only sitemap-core.xml \
  --only sitemap-programs.xml \
  --only sitemap-locations.xml \
  --only sitemap-blog.xml \
  --only sitemap-glossary.xml
```

After explicit release authorization, commit only the proposed paths, verify the actual dry-run matches the reviewed payload and current checksums, then repeat the command without `--dry-run`. Use the deployer's verified predeploy backup workflow. Roll back by restoring these exact remote paths from the predeploy archive, preserving any unrelated remote changes.

## Live checks after release

Verify response status and markers on `/schedule`, `/schedule.html`, `/instagram`, and `/free-bjj-intro-tannersville-ny`. Confirm the deployed shared navigation fragment contains the short label, both schedule representations contain the ten lane links, Instagram preserves both lanes, and the booking page contains the preload. Compare deployed bytes with the reviewed payload. Browser-check the live mobile and desktop navigation and lane transitions; measure scheduler timing and preload reuse separately before claiming a speed gain. External checks require the elevated network path specified by `AGENTS.md`.

## Limitations

The local browser check blocks external traffic, so it proves neither live scheduler availability nor preload cache reuse. Validation reports an existing Bootstrap Icons CSS reference gap. GBP account changes, directory claims, VSL filming/editing, and publication remain separate unfinished requirements.
