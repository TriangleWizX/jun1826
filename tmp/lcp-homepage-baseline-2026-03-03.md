# Homepage LCP Baseline/Verification Notes (2026-03-03)

## Attempted baseline capture
- Tried `lighthouse --version` and `npx --yes lighthouse --version` locally.
- Result: Lighthouse binary unavailable and npm registry unreachable in this environment (`EAI_AGAIN`), so an automated local Lighthouse run could not be completed here.

## Implemented performance changes for homepage
- Replaced CSS-driven hero background dependency with explicit hero `<picture>/<img>` in `index.html`.
- Added responsive hero sources (`avif/webp/jpg`) with `fetchpriority="high"` and aligned preload to responsive hero image.
- Deferred non-critical third-party resources:
  - Calendly widget CSS/JS now loads on demand from CTA interaction.
  - Ahrefs and Instagram embed scripts now load post-`load` during idle time.
- Removed stale hero video lazy-loader logic tied to missing `#heroVideo`.
- Added `decoding="async"` + `fetchpriority="low"` to below-the-fold images and kept lazy-loading.

## Manual next verification step
- Run Lighthouse Mobile on `https://senseisandy.com/` after deploy and compare:
  - LCP (target <= 2.5s)
  - CLS (target <= 0.1)
  - Render-blocking requests before first paint
  - LCP element/resource URL
