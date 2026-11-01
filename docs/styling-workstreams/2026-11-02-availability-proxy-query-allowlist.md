# Availability preview proxy query allowlist — 2026-11-02

## Scope and framework

This is a local QA-tool change. It does not add a production website payload.

- Coordinator: AI SuperExpert Agent Specialist — Dr. Ada Turing, carried forward from the active goal; master `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, previously inspected.
- Reviewer: ordinary `Availability Proxy QA Reviewer` fallback; no suitable Indranet role persona was established for this narrow proxy review. Paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`, previously inspected and marked ready.
- The reviewer found the dirty viewport-runner diff too broad to commit as a proxy-only change. The review also found the dirty variant had removed the GET-only guard and redirect block. Those safeguards remain in clean `HEAD`; they were restored in the local dirty copy. The keyboard probe was removed from that local copy to keep the owner-run keyboard SOP separate.

## Change

The frontend availability helper sends either no query or one optional `date` parameter. The preview proxy now forwards only `date`; unrelated query parameters are dropped. Clean `HEAD` already restricts the proxy to GET, fixes the upstream origin to `https://senseisandy.com`, rejects redirects, applies a five-second timeout, and avoids storing response bodies in diagnostics.

Only the two-line query allowlist is staged. The broader viewport matrix refactor remains unstaged for separate review.

## Verification and limits

- `node --check scripts/qa-viewports.mjs` passed after the local safety edits.
- `git diff --cached --check` passed for the exact staged patch.
- Historical comparison evidence in `evidence/2026-11-01/availability-proxy-comparison-2026-11-01.md` recorded 457/457 clean-baseline and 456/456 dirty-candidate upstream GETs returning HTTP 200 with zero proxy exceptions. That run predates this allowlist change; no new viewport run was made here.
- The owner-reserved keyboard acceptance was not run. The full mixed viewport-runner change is not included in this commit.

## Release status

The allowlist is for local preview QA only and has no deploy payload. Commit the narrow code change and this evidence note; leave the remaining viewport refactor and generated outputs untouched for later reconciliation.
