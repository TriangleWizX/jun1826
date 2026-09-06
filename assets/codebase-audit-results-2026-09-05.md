# Review results — September 5, 2026

Reviewed: `codebase-audit-2026-09-05.md` in this directory.
Scope: report quality, evidence, conclusions, and remediation priorities. No test reruns or live-site revalidation were performed for this review.

## Verdict

Useful diagnostic inventory, but insufficient for release approval or a claim that customer-facing failures are confirmed. The report appropriately corrects earlier overstatements about sitemap timestamps, CI coverage, sticky controls, and funnel root cause.

## Findings

1. **High: Findings lack durable reproduction evidence.** Counts such as 401 fingerprint issues and 177 redirect issues reference conversation output without attached logs, commit ID, or exact execution timestamps. Preserve the commands, exit statuses, runtime version, relevant output, and audited revision with the report. These counts should remain historical observations until reproduced.

2. **High: Fingerprint severity needs a completed release-build comparison.** Failure after the ordinary build establishes an incomplete asset state, but the report also confirms predeployment generates assets. Verify parity after that intended sequence in isolation before attributing the failure to the release pipeline. Do not regenerate or delete assets in the working tree merely to make an audit pass.

3. **High: Redirect disagreements require policy and live verification.** A one-hop violation, an unexpected destination, and a genuine 404 have different impacts. Recheck representative routes against current approved routing, capture the complete chain and final origin, and group the results. The report correctly avoids calling all 177 observations broken pages.

4. **Medium: QA failures are actionable, but their causes differ.** Missing media-manifest implementation and missing CSV input are concrete tooling dependencies. Funnel initialization needs a stack trace. Footer/index/homepage assertions require reconciliation with approved copy. Sticky behavior requires a rendered test. Do not weaken assertions without establishing the intended behavior.

5. **Medium: CI omissions are not inherently defects.** Require a purpose-based list of mandatory gates and trace nested commands before measuring coverage. Fail-fast correctly fails CI; separate jobs improve diagnostics but are not required for correctness. Never include backup cleanup merely to increase coverage.

6. **Medium: Sitemap documentation mismatch is stronger than the stale-sitemap hypothesis.** Update the documented ownership model to match the active generator. Validate the actual five child sitemaps; the three-file overlap pass and index timestamp do not prove current coverage or drift.

## Recommended next work

1. Preserve reproducible evidence for fingerprint, funnel, and representative redirect failures.
2. Verify final release assets and the booking flow in a working browser environment.
3. Repair missing QA dependencies and reconcile disputed contracts with current requirements.
4. Align mandatory CI gates and sitemap documentation; complete dependency/security and performance checks before issuing release approval.

No source fixes, deployments, or production changes were made in this review. The original report remains unchanged.

## Resolution update

- Homepage synthesis QA now passes after aligning assertions with current homepage copy.
- Footer QA now validates the canonical `/nearby-towns` route without requiring obsolete link wording.
- The missing media-manifest checker was restored; it passes for six manifest groups.
- Funnel QA now passes after the test DOM mock added `document.head` and element `dataset`, required by the funnel loader.

Remaining work includes asset fingerprint parity, redirect-policy reconciliation, sticky mobile browser verification, the missing descriptive-anchor fixture, and release/CI workflow alignment.
