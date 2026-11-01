# Core Culture route gate — 2026-10-31

**Audit ID:** `CORE-CULTURE-ROUTE-GATE-20261031`
**Scope:** Read-only release review for `/core-culture-parent-guide/` and its dirty source/CSS.

## Finding

The route is intentionally redirected to `/parent-resources`. The redirect is present in the source disposition, legacy redirect map, root `.htaccess`, and generated `dist/.htaccess`; the live first response is `301` and the one-hop destination returns `200`. The generated directory page still exists behind the redirect, but its Open Graph and Twitter URL values name the retired route while its canonical points to `/parent-resources`.

**Recommendation:** Hold the dirty page and stylesheet edits. They change an output route that is not the canonical public destination. Do not deploy these paths unless the owner reopens the retired route or requests a separate cleanup of the hidden generated page and its social metadata.

## Evidence

| Check | Result |
| --- | --- |
| `src/_data/url-dispositions.json` | `https://senseisandy.com/core-culture-parent-guide/` has `redirect_301` to `/parent-resources`. |
| `config/legacy-redirects.json` | `/core-culture-parent-guide` maps to `/parent-resources`. |
| `src/.htaccess`, root `.htaccess`, and `dist/.htaccess` | Each contains `^core\-culture\-parent\-guide/?$` redirecting to `/parent-resources` with HTTP 301. The generated rule is present. |
| Live first response | HTTP 301 with `Location: https://senseisandy.com/parent-resources`. |
| Live redirect chain | Exactly one redirect; destination `/parent-resources` returns HTTP 200. |
| Generated page | `dist/core-culture-parent-guide/index.html` exists; `dist/core-culture-parent-guide.html` does not. The generated page has canonical `/parent-resources` but Open Graph and Twitter URL metadata still name `/core-culture-parent-guide`. |
| Dirty source paths | `src/core-culture-parent-guide.html` and `src/assets/css/pages/core-culture-parent-guide.css` are modified. No corresponding generated route or CSS path is tracked for deployment. |

No source, redirect, or generated file was changed during this audit. No Lighthouse/PageSpeed, keyboard acceptance, or site-wide contrast work was performed.

## Persona note

The selector found no suitable catalog persona for this route/redirect audit. The worker used an ordinary static-route and release-auditor fallback. `Instructions - CODE` was the read-only method guide; it did not authorize source or production changes.
