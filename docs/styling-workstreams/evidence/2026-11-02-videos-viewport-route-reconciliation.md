# `/videos` viewport result route reconciliation — 2026-11-02

The 2026-11-01 local matrix reports a primary-target failure for `/videos` at 320px and 390px. That sample is not the production route served to visitors:

- `dist/videos/index.html` is a noindex fallback page and its source redirects to `/`.
- `.htaccess` has an explicit temporary rule for both `/bjj-videos` and `/videos` that sends the request to `https://www.youtube.com/@SenseiSandyBJJ`.
- A live request confirmed one redirect and ended at that YouTube channel.
- `data/url-registry.json` records `/videos` as a redirect to `/`, which does not match the deployed `.htaccess` behavior.

The viewport failure is therefore a local generated-fallback artifact, not evidence of a small primary control on the live route. No styling change was made. The route registry and server redirect disagree; reconcile that authority separately before changing route behavior. This note does not assert a successful matrix rerun or a change to the live route.
