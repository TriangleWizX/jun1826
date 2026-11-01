# Accessibility/UI release mapper gap: approve or deny

The user-approved A cohort is ready in source review, and its exact build was tested in a clean temporary checkout. **No production commit or deployment has been made.** The working checkout is clean apart from the workspace record and this report; the other 835 paths remain preserved in `stash@{0}`.

## What the exact check found

- Clean baseline: 2,220 generated files. A candidate: 2,221.
- Candidate difference: 15 added, 14 removed, and 462 changed outputs.
- The committed deployment mapper selects 59 paths. Four changed page outputs required by approved A source changes are missing:

  - `core-culture-parent-guide/index.html`
  - `front-headlock-series/index.html`
  - `practice-vault/index.html`
  - `tactical-longevity/index.html`

The larger difference includes many pages whose shared stylesheet hash reference changed. Those unrelated pages are not in the proposed payload. Full path evidence is in [the output map folder](evidence/2026-11-03/a11y-release-output-map/).

## Decision

### Approve — add these four output mappings

I’ll make a small change to `scripts/deploy-release.py` so these four approved routes are selected when their corresponding A sources change. The script remains private build/deploy tooling and will **not** be uploaded to the public site. Then I’ll rerun the isolated build, mapper dry-run, and focused route proof. Deployment will use only the exact A payload once each required page and stylesheet is covered.

### Deny — keep the mapper unchanged

I’ll leave the A cohort in the local hold stash and will not commit or deploy it. The current mapper would omit those four pages.

## Reply

Reply **APPROVE mapper fix** or **DENY mapper fix**. Your prior A-cohort approval remains in place; this asks only about the four missing deployment mappings.
