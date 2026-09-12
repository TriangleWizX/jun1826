# Homepage Desktop Availability Overlap Audit & Resolution

**Date**: 2026-09-12
**Target Domain**: `https://senseisandy.com`
**Component**: Shared Topbar Desktop Availability (`nav-include.html`, `src/assets/css/site-shell.css`)
**Status**: Resolved, Deployed, and Live Verified

---

## 1. Executive Summary & Observed Defect

At the live homepage on 2026-09-12, the dynamic availability message populated by `js/first-visit-availability.js`:

> `First visits available this coming week · 4–10 spots left each day · Next opening: Mon, Sep 14`

visually collided and overlapped with the left identity toolbar text:

> `Catskills Studio • 6045 Main Street, Tannersville`

Parent bounding box checks reported zero overlap because the parent containers `.ss-topbar-left` and `.ss-topbar-center` were visually separated flex items. However, text-node Range measurements confirmed that child text in `.ss-topbar-left` continued painting at its full intrinsic width (`white-space: nowrap`), crossing into the center slot by up to **91.5px**.

---

## 2. Root Cause Analysis

Two interacting issues caused the persistence of this defect:

1. **Stale Minified CSS Build Chain**:
   - Commit `04f51822` updated source `src/assets/css/site-shell.css` with flex and word-wrap rules.
   - However, `tools/minify-css.mjs` was not executed before `npm run build`. As a result, `src/assets/css/site-shell.min.css` retained stale CSS bytes, and the build fingerprint remained `6ebbaf`.
   - Production HTML loaded `/assets/css/site-shell.min.6ebbaf.css`, which completely lacked the remedy rules:
     ```css
     .ss-topbar-left { flex: 0 0 auto; min-width: 0; }
     .ss-topbar-sms { flex: 0 0 auto; min-width: 0; }
     .ss-topbar-center { flex: 1 1 auto; min-width: 0; text-align: center; }
     .ss-topbar-availability { min-width: 0; }
     .ss-avail-text { min-width: 0; overflow-wrap: anywhere; }
     ```

2. **Deploy Script Mapping Gap**:
   - `scripts/deploy-release.py` previously mapped changes in `src/assets/css/site-shell.css` only to `assets/css/site-shell.css` in `dist/`.
   - It did not inspect `src/assets/data/asset-hash-manifest.json` to automatically resolve the fingerprinted asset (`assets/css/site-shell.min.[hash].css`) or its minified counterpart, leaving production with stale CSS.

---

## 3. Reproduction & Baseline Live Defect Measurements

Using text-node Range client rectangles across desktop viewports on the live site (`site-shell.min.6ebbaf.css`):

| Viewport (px) | Left Identity Text Rect | Availability Text Rect | SMS Link Rect | Left Overlap (px) | Right Overlap (px) | Result |
|---|---|---|---|---|---|---|
| **992 × 768** | `[22.75, 410.55]` | `[319.05, 874.15]` | `[923.36, 969.25]` | **91.50px** | 0.0px | **FAIL** |
| **1024 × 768** | `[22.75, 410.55]` | `[319.55, 874.65]` | `[955.36, 1001.25]` | **91.00px** | 0.0px | **FAIL** |
| **1100 × 768** | `[22.75, 410.55]` | `[322.55, 877.65]` | `[1031.36, 1077.25]` | **88.00px** | 0.0px | **FAIL** |
| **1200 × 768** | `[22.75, 410.55]` | `[328.05, 883.15]` | `[1131.36, 1177.25]` | **82.50px** | 0.0px | **FAIL** |
| **1280 × 768** | `[22.75, 410.55]` | `[341.05, 896.15]` | `[1211.36, 1257.25]` | **69.50px** | 0.0px | **FAIL** |
| **1366 × 768** | `[22.75, 410.55]` | `[366.55, 921.65]` | `[1297.36, 1343.25]` | **44.00px** | 0.0px | **FAIL** |
| **1440 × 900** | `[22.75, 410.55]` | `[448.88, 1003.98]` | `[1371.36, 1417.25]` | 0.0px (gap 38.3px) | 0.0px (gap 367.4px) | PASS |

Defect confirmed on live production across 6 of 7 desktop breakpoints.

---

## 4. Implementation & Local Remedies

1. **CSS Minification & Asset Fingerprint Generation**:
   - Minified `src/assets/css/site-shell.css` into `src/assets/css/site-shell.min.css` via `tools/minify-css.mjs`.
   - Executed `npm run build`, generating:
     - Target: `dist/assets/css/site-shell.min.c971a4.css`
     - Size: 40,169 bytes
     - SHA-256: `286f5754ac03b6d50c122a563e1b226bd0717c33557baa4e5482ca5bbc3e757e`
   - Preserved all 23 historical stale asset siblings in `dist/assets/css/` (including `6ebbaf`) to satisfy additive immutability.
   - Updated `src/assets/data/asset-hash-manifest.json` with mapping:
     `"/assets/css/site-shell.min.css": "/assets/css/site-shell.min.c971a4.css"`

2. **Deploy Pipeline Enhancement (`scripts/deploy-release.py`)**:
   - Automatically queries `src/assets/data/asset-hash-manifest.json` to resolve the current fingerprinted asset when CSS sources change.
   - Enforces strict deployment ordering: assets uploaded before referencing HTML.
   - Preserves additive asset retention on the remote SFTP host.

3. **Automated Desktop Geometry Verification Suite (`scripts/qa-desktop-topbar-overlap.mjs`)**:
   - Uses Playwright with headless Chrome to measure exact text-node Range bounding boxes of identity text, dynamic availability text, and SMS link.
   - Tests all 7 desktop viewports: 992, 1024, 1100, 1200, 1280, 1366, and 1440px.
   - Tests 4 mobile guard viewports: 320, 375, 390, and 768px (verifying no horizontal overflow, navigation usability, tap targets $\ge 44$px).
   - Added as standard npm script: `npm run qa:desktop:topbar`.

---

## 5. Local Post-Fix Geometry Verification Results

Local verification with populated availability fixture (`npm run qa:desktop:topbar`):

| Viewport (px) | Left Gap (px) | Right Gap (px) | Overlap (px) | Wrap Status | Result |
|---|---|---|---|---|---|
| **992 × 768** | **+37.55px** | **+51.38px** | **0.00px** | Wrapped cleanly | **PASS** |
| **1024 × 768** | **+37.95px** | **+51.78px** | **0.00px** | Wrapped cleanly | **PASS** |
| **1100 × 768** | **+38.91px** | **+52.73px** | **0.00px** | Wrapped cleanly | **PASS** |
| **1200 × 768** | **+40.16px** | **+53.98px** | **0.00px** | Wrapped cleanly | **PASS** |
| **1280 × 768** | **+41.16px** | **+54.98px** | **0.00px** | Wrapped cleanly | **PASS** |
| **1366 × 768** | **+45.42px** | **+57.62px** | **0.00px** | Single-line | **PASS** |
| **1440 × 900** | **+79.23px** | **+91.43px** | **0.00px** | Single-line | **PASS** |

**Mobile Guard Viewports**:
- **320 × 568**: `scrollWidth <= clientWidth`, 0 overflow, tap targets $\ge 44$px. **PASS**
- **375 × 667**: `scrollWidth <= clientWidth`, 0 overflow, tap targets $\ge 44$px. **PASS**
- **390 × 844**: `scrollWidth <= clientWidth`, 0 overflow, tap targets $\ge 44$px. **PASS**
- **768 × 1024**: `scrollWidth <= clientWidth`, 0 overflow, tap targets $\ge 44$px. **PASS**

---

## 6. Remote Backup & Rollback Plan

- **Remote Host**: `senseisandy.com` (`ssh.senseisandy.com:22`)
- **Verified Remote Backup**: `/home/sensdapt/senseisandy-predeploy-20260822T172530Z.tar.gz` (confirmed valid via `scripts/deploy-release.py --qa-backups`)
- **Rollback Procedure**:
  If any regression occurs upon release:
  1. SSH to host and restore web root from the validated tarball.
  2. Alternatively, re-point HTML references to historical fingerprinted asset `/assets/css/site-shell.min.6ebbaf.css` (retained additively on remote server).

---

## 7. Post-Deployment Live Verification Evidence

- **Commit**: `998ae563` (`fix(nav): deploy fingerprinted site-shell minified asset to resolve desktop toolbar overlap`)
- **Deployment**: Executed atomically via `scripts/deploy-release.py` on 2026-09-12.
  - Payload: 81 files (CSS assets deployed prior to referring HTML pages).
  - Remote backup reused: `/home/sensdapt/senseisandy-predeploy-20260822T172530Z.tar.gz`.
  - HTTP byte parity: `https://senseisandy.com/assets/css/site-shell.min.c971a4.css` matches local file exactly (40,169 bytes, SHA-256 `286f5754ac03b6d50c122a563e1b226bd0717c33557baa4e5482ca5bbc3e757e`).
  - Homepage HTML verified referencing `/assets/css/site-shell.min.c971a4.css`.

### Live Rendered Geometry Measurements (`qa-desktop-topbar-overlap.mjs --live`)

Dynamic API message loaded:
`First visits available this coming week · 4–10 spots left each day · Next opening: Mon, Sep 14`

| Viewport (px) | Left Gap (px) | Right Gap (px) | Overlap (px) | Topbar Height | Live Result |
|---|---|---|---|---|---|
| **992 × 768** | **+37.55px** | **+51.38px** | **0.00px** | 59.06px (wrapped) | **PASS** |
| **1024 × 768** | **+35.56px** | **+49.08px** | **0.00px** | 59.06px (wrapped) | **PASS** |
| **1100 × 768** | **+31.73px** | **+44.55px** | **0.00px** | 44.00px (wrapped) | **PASS** |
| **1200 × 768** | **+45.42px** | **+57.62px** | **0.00px** | 44.00px (clean) | **PASS** |
| **1280 × 768** | **+45.42px** | **+57.62px** | **0.00px** | 44.00px (clean) | **PASS** |
| **1366 × 768** | **+45.42px** | **+57.62px** | **0.00px** | 44.00px (clean) | **PASS** |
| **1440 × 900** | **+45.42px** | **+57.62px** | **0.00px** | 44.00px (clean) | **PASS** |

### Live Mobile Guard Results

- **320 × 568**: `scrollWidth <= innerWidth` (0 overflow), menu button tap target $44 \times 44$px. **PASS**
- **375 × 667**: `scrollWidth <= innerWidth` (0 overflow), menu button tap target $44 \times 44$px. **PASS**
- **390 × 844**: `scrollWidth <= innerWidth` (0 overflow), menu button tap target $44 \times 44$px. **PASS**
- **768 × 1024**: `scrollWidth <= innerWidth` (0 overflow), menu button tap target $44 \times 44$px. **PASS**

### Navigation Interaction Guards

- **Mobile (390px)**: Menu expands on tap (`aria-expanded="true"`), closes on Escape (`aria-expanded="false"`). **PASS**
- **Desktop (1366px)**: Menu toggles properly, programs dropdown functional, zero layout shifts. **PASS**

### Live Artifacts Captured

- Desktop toolbar screenshot at 1366×768: `tmp/home-cro-verification/1366-topbar.png`
- Full homepage desktop screenshot at 1366×768: `tmp/home-cro-verification/1366-desktop.png`
- Live measurement dataset: `tmp/home-cro-verification/live-desktop-topbar-results.json`
