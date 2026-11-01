# Schedule candidate snapshot deduplication — 2026-11-02

## Scope

Remove only copies from `/tmp/schedule-link-target-fix-1/` that are byte-identical to files in the current checkout and whose corresponding current files match committed `HEAD`. Preserve differing, untracked, and unique evidence files for further review.

## Results

- Removed the candidate's `assets/` directory after checking every regular file against the current checkout. All 14,151 files (955,195,298 bytes) matched; the current checkout also contained 177 additional files. The candidate directory had no symlinks.
- Removed 46 `.vscode/` files (62,894,720 bytes) after each matched the current file and committed `HEAD`. The one untracked `sftp.json` copy remains in the candidate.
- Audited 2,074 regular files under the candidate's `src/` against the 2,080 current files. Removed 1,958 files (521,381,470 bytes) only when each matched both the current file and its committed `HEAD` blob.
- Preserved the 72 `src/` files that differed from current, 11 untracked files, 33 files that did not match `HEAD`, and the unique report, proof JSON, proof script, screenshots, scratch draft, and other nonduplicate output. The remaining snapshot measured 939 MiB after cleanup.
- Total verified committed duplicates removed: 16,155 files and 1,539,471,488 bytes. No project source, generated output, deployment, or live site was changed.

## Verification and disposition

The checks used SHA-256 byte comparisons against current files, then Git blob IDs against `HEAD`; the removal scripts operated only on files that passed both checks (except the `assets/` subtree, whose byte-identical files remain present in the current checkout). `npm run qa:workspace:preflight` passed after updating the workspace inventory. The snapshot remains retained because it still contains differing/untracked files and unique historical evidence. This closes only the duplicate-file cleanup slice, not the broader dirty-worktree goal.
