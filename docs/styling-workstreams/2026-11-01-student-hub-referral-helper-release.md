# Student Hub referral copy helper release — 2026-11-01

## Finding and scope

The live `/student-hub/` route returned HTTP 200 and referenced `/assets/js/student-hub-referral-copy.js`, but that asset returned HTTP 404. The source helper already existed locally as an untracked file, and `dist/assets/js/student-hub-referral-copy.js` matched it exactly. The helper copies the existing textarea value with the Clipboard API and, if copying fails, focuses/selects the text and announces the fallback. It makes no network calls.

The live textarea text differs from current source. This release changed only the helper asset; it did not update or overwrite the route or its copy.

## Local checks

- `node --check src/assets/js/student-hub-referral-copy.js` passed.
- Isolated Chromium on the generated local Student Hub page passed both pointer paths: clipboard success copied the textarea value; simulated clipboard rejection selected the entire 158-character textarea and showed the fallback status. No page errors occurred and all off-origin requests were blocked. No form was submitted and no keyboard acceptance was attempted.
- Browser Use doctor found no Chrome or daemon for a task-owned session. System Chromium through Playwright was used as the local fallback.

## Commit and deployment

Commit `d61471b` (`Add Student Hub referral copy helper`) contains only `src/assets/js/student-hub-referral-copy.js`. The exact deploy dry run selected one path: `assets/js/student-hub-referral-copy.js`. Deployment completed with exit code 0 using `--reuse-existing-backup`.

After deployment, `/student-hub/` returned HTTP 200 and still referenced the helper. The helper returned HTTP 200, 906 bytes, SHA-256 `eee1f9cac04b848e2bb08d6a5463e7b2a370ee99ee7bcca4f3d66c871829f1fd`, matching the committed source. The prior live result was HTTP 404.

The user-reserved Lighthouse/PageSpeed, site-wide contrast, and physical keyboard acceptance checks were not performed. The broader dirty-worktree goal remains active.
