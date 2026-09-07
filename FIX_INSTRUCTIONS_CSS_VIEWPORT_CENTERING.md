# AGY Model Execution Playbook: CSS Viewport Centering & Media Query Remediation

```yaml
playbook_metadata:
  target_repository: "TriangleWizX/jun1826 (Sensei Sandy BJJ)"
  audit_source: "/home/twizss/Documents/ssbjjweb/tmb/AUDIT_CSS_VIEWPORT_CENTERING.md"
  version: "1.0.0"
  target_agent: "Antigravity (AGY Model) / Codex Pair Programmer"
  execution_mode: "Strict, Deterministic, Smallest Safe Change"
  cli_prefix: "rtk"
  safety_invariants:
    - "Never modify volatile operational facts (schedules, prices, phone, addresses)."
    - "Preserve Sensei Sandy palette and design tokens defined in tokens.css."
    - "Do not introduce CSS preprocessors or new npm dependencies."
    - "Keep mobile-first layout integrity; never break desktop centering."
```

---

## 1. Ground-Truth Analysis & Deepdive Reconciliation

Before applying changes, the AGY model must understand the reconciliation between the findings in [AUDIT_CSS_VIEWPORT_CENTERING.md](file:///home/twizss/Documents/ssbjjweb/tmb/AUDIT_CSS_VIEWPORT_CENTERING.md) and the actual live codebase state:

### 1.1 Category 1: Structural Nested Media Queries (Ground-Truth Verified)
- **Active Critical Defect in `base.css`**:
  - [base.css:L457](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/base.css#L457): `@media(max-width: 768px)` is nested inside `@media(min-width: 992px)` (starting at line 319, closing at line 475). In standard CSS, this resolves to `(min-width: 992px) and (max-width: 768px)` which is impossible to satisfy. Consequently, mobile viewports (`< 768px`) never execute the `.showup-hero`, `.showup-grid`, `.showup-card`, and `.cta-alternate` overrides.
  - [base.css:L1637](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/base.css#L1637): `@media(min-width: 600px)` is nested inside `@media(max-width: 991px)` (starting at line 1598, closing at line 1645).
- **Active Critical Defect in `styles.css`**:
  - [styles.css:L374](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/styles.css#L374): `@media(max-width: 768px)` is nested inside `@media(min-width: 992px)` (starting at line 235, closing at line 392).
  - [styles.css:L1422](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/styles.css#L1422): `@media(min-width: 600px)` is nested inside `@media(max-width: 991px)` (starting at line 1388, closing at line 1430).
- **Auditor Note on `videos.css` and `summer-confidence.css`**:
  - Live AST verification indicates that `videos.css` and `summer-confidence.css` currently have balanced braces and do **not** contain nested `@media` blocks. The AGY model must NOT attempt speculative un-nesting edits on `videos.css` or `summer-confidence.css`; focus exclusively on breakpoint boundary normalization (`767px` -> `767.98px`).

### 1.2 Category 2: Container Width Desktop Layout Centering Fragmentation
- **Design System Reference**:
  - [tokens.css](file:///home/twizss/Documents/ssbjjweb/tmb/tokens.css) defines:
    - `--container-standard: 72rem;` (1152px / ~1180px)
    - `--container-narrow: 46rem;` (736px / reading width)
    - `--container-wide: 88rem;` (1408px / panoramic hero frames)
  - [site-shell.css:L52-L54](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/site-shell.css#L52-L54) universally centers main containers:
    ```css
    :where(.ss-main) :where(.container, .ss-container) {
      margin-inline: auto;
    }
    ```
- **Page Container Variance**:
  - Pages like `kids.css`, `teens.css`, and `adults.css` use `max-width: 1180px; margin-inline: auto;`.
  - `pages/schedule.css` and `pages/glossary.css` use `max-width: var(--container-standard); margin-inline: auto;`.
  - In [pages/policies.css:L34](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/pages/policies.css#L34), `.policy-shell` uses `max-width: 1100px;`. This should be harmonized to `max-width: 1180px;` (or `var(--container-standard)`).
  - Note: In `src/assets/css/adults.css:L28`, `max-width: 680px;` belongs to `.adult-yam-lede` (a reading-column paragraph), while the outer container `.adult-yam-inner` correctly has `max-width: 1120px; margin: 0 auto;`. Do not broaden paragraph reading widths to full container bounds.

### 1.3 Category 3: Viewport Bleed & Horizontal Scroll Hazards
- **Site Header Pill Overflow**:
  - In [base.css:L102](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/base.css#L102), `.site-header` sets `width: max-content;`. On viewports narrower than the content width (e.g. 320px - 360px mobile screens), `width: max-content` forces the element wider than the viewport, inducing horizontal panning.
  - Safe fix: `width: min(max-content, calc(100% - 2rem)); max-width: calc(100vw - 2rem);`.
- **Full-Bleed `100vw` Guardrail**:
  - Elements using `width: 100vw` or negative offsets `calc((100% - 100vw) / 2)` trigger horizontal scrollbars on desktop operating systems (Linux/Windows) where the vertical scrollbar consumes ~16px of window width.
  - The project standard is to use `width: 100%; margin-inline: 0;` within unconstrained wrappers, relying on `html, body { overflow-x: clip; }` in [site-shell.css:L8](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/site-shell.css#L8).

### 1.4 Category 4: Centering & Alignment Paradigm Mismatches
- In [base.css:L470-L474](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/base.css#L470-L474), `.cta-alternate` sets `flex-direction: column; align-items: flex-start;` on mobile, while `.hero-cta-group` (L968) and other landing page CTAs center their action buttons. Harmonizing mobile `.cta-alternate` with `align-items: center` ensures CTAs stack centered with clean tap targets.

### 1.5 Category 5: Breakpoint Threshold Fragmentation & Subpixel Gaps
- Subpixel gap hazard: Using `max-width: 767px` alongside `min-width: 768px` leaves a fractional gap (`767.01px` to `767.99px`) where neither condition matches on high-DPI (Retina) displays.
- Standard convention:
  - Mobile max-width: `767.98px`
  - Small mobile max-width: `575.98px`
  - Tablet/desktop boundary: `991.98px`
- Custom breakpoint consolidation:
  - In [components.css:L127](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/components.css#L127), `@media (max-width: 760px)` should be updated to standard `@media (max-width: 767.98px)`.

---

## 2. Step-by-Step Execution Scaffolding for AGY Models

The AGY model must execute these steps sequentially using the designated tools.

### Phase 1: Structural Syntax Un-nesting

#### Step 1.1: Un-nest Media Queries in `src/assets/css/base.css`
- **File**: `src/assets/css/base.css`
- **Action**: Use `replace_file_content` to close `@media(min-width: 992px)` before line 457, and extract the mobile block to root level.
- **StartLine**: 449
- **EndLine**: 476
- **TargetContent**:
```css
    .cta-alternate .btn {
        min-width: 180px
    }

    .showup-card ul li i {
        color: var(--button-color)
    }

    @media(max-width: 768px) {
        .showup-hero {
            text-align:left
        }

        .showup-grid {
            grid-template-columns: 1fr
        }

        .showup-card {
            min-height: auto
        }

        .cta-alternate {
            flex-direction: column;
            align-items: flex-start
        }
    }
}
```
- **ReplacementContent**:
```css
    .cta-alternate .btn {
        min-width: 180px
    }

    .showup-card ul li i {
        color: var(--button-color)
    }
}

@media (max-width: 767.98px) {
    .showup-hero {
        text-align: left;
    }

    .showup-grid {
        grid-template-columns: 1fr;
    }

    .showup-card {
        min-height: auto;
    }

    .cta-alternate {
        flex-direction: column;
        align-items: center;
    }
}
```

#### Step 1.2: Un-nest Floating Review Media Query in `src/assets/css/base.css`
- **File**: `src/assets/css/base.css`
- **Action**: Use `replace_file_content` to close `@media(max-width: 991.98px)` and place the floating review query at root scope.
- **StartLine**: 1630
- **EndLine**: 1648
- **TargetContent**:
```css
    .floating-review {
        display: none
    }

    @media(min-width: 600px) {
        .floating-review {
            display:block;
            left: 50%;
            transform: translateX(-50%);
            bottom: -20px
        }
    }
}
```
- **ReplacementContent**:
```css
    .floating-review {
        display: none;
    }
}

@media (min-width: 600px) and (max-width: 991.98px) {
    .floating-review {
        display: block;
        left: 50%;
        transform: translateX(-50%);
        bottom: -20px;
    }
}
```

#### Step 1.3: Un-nest Media Queries in `src/assets/css/styles.css`
- **File**: `src/assets/css/styles.css`
- **Action**: Mirror the fixes from `base.css` to keep `styles.css` valid.
- **StartLine**: 365
- **EndLine**: 393
- **TargetContent**:
```css
    .cta-alternate .btn {
        min-width: 180px
    }

    .showup-card ul li i {
        color: var(--button-color)
    }

    @media(max-width: 768px) {
        .showup-hero {
            text-align: left
        }

        .showup-grid {
            grid-template-columns: 1fr
        }

        .showup-card {
            min-height: auto
        }

        .cta-alternate {
            flex-direction: column;
            align-items: flex-start
        }
    }
}
```
- **ReplacementContent**:
```css
    .cta-alternate .btn {
        min-width: 180px
    }

    .showup-card ul li i {
        color: var(--button-color)
    }
}

@media (max-width: 767.98px) {
    .showup-hero {
        text-align: left;
    }

    .showup-grid {
        grid-template-columns: 1fr;
    }

    .showup-card {
        min-height: auto;
    }

    .cta-alternate {
        flex-direction: column;
        align-items: center;
    }
}
```

#### Step 1.4: Un-nest Floating Review in `src/assets/css/styles.css`
- **File**: `src/assets/css/styles.css`
- **Action**: Extract nested `@media(min-width: 600px)` outside `@media(max-width: 991px)`.
- **StartLine**: 1417
- **EndLine**: 1432
- **TargetContent**:
```css
    .floating-review {
        display: none
    }

    @media(min-width: 600px) {
        .floating-review {
            display: block;
            left: 50%;
            transform: translateX(-50%);
            bottom: -20px
        }
    }
}
```
- **ReplacementContent**:
```css
    .floating-review {
        display: none;
    }
}

@media (min-width: 600px) and (max-width: 991.98px) {
    .floating-review {
        display: block;
        left: 50%;
        transform: translateX(-50%);
        bottom: -20px;
    }
}
```

---

### Phase 2: Viewport Overflow & Bleed Elimination

#### Step 2.1: Constrain `.site-header` in `src/assets/css/base.css`
- **File**: `src/assets/css/base.css`
- **Action**: Prevent `max-content` from overflowing viewports narrower than 360px.
- **StartLine**: 98
- **EndLine**: 105
- **TargetContent**:
```css
.site-header {
    position: sticky;
    top: 1rem;
    margin: 0 auto;
    width: max-content;
    border-radius: 999px;
```
- **ReplacementContent**:
```css
.site-header {
    position: sticky;
    top: 1rem;
    margin: 0 auto;
    width: min(max-content, calc(100% - 2rem));
    max-width: calc(100vw - 2rem);
    border-radius: 999px;
```

---

### Phase 3: Desktop Layout Centering & Container Harmonization

#### Step 3.1: Harmonize Container Max-Width in `src/assets/css/pages/policies.css`
- **File**: `src/assets/css/pages/policies.css`
- **Action**: Align `.policy-shell` with the desktop container standard (1180px) while maintaining reading width on prose.
- **StartLine**: 32
- **EndLine**: 37
- **TargetContent**:
```css
.policy-shell {
  margin: 0 auto;
  max-width: 1100px;
  padding-inline: clamp(1.2rem, 4vw, 2.5rem);
}
```
- **ReplacementContent**:
```css
.policy-shell {
  margin: 0 auto;
  max-width: 1180px;
  padding-inline: clamp(1.2rem, 4vw, 2.5rem);
}
```

---

### Phase 4: Breakpoint Normalization

#### Step 4.1: Consolidate Custom 760px Breakpoint in `src/assets/css/components.css`
- **File**: `src/assets/css/components.css`
- **Action**: Normalize `@media (max-width: 760px)` to standard `@media (max-width: 767.98px)`.
- **StartLine**: 126
- **EndLine**: 132
- **TargetContent**:
```css
@media (max-width: 760px) {
  .ss-lane-picker-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```
- **ReplacementContent**:
```css
@media (max-width: 767.98px) {
  .ss-lane-picker-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

#### Step 4.2: Normalize 767px Boundary in `src/assets/css/tactical-longevity.css`
- **File**: `src/assets/css/tactical-longevity.css`
- **Action**: Normalize `max-width: 767px` to `767.98px` to eliminate subpixel gaps.
- **StartLine**: 35
- **EndLine**: 41
- **TargetContent**:
```css
@media (max-width: 767px) {
  .page-tactical .section-tactical {
    padding-block: 5rem;
  }
}
```
- **ReplacementContent**:
```css
@media (max-width: 767.98px) {
  .page-tactical .section-tactical {
    padding-block: 5rem;
  }
}
```

---

## 3. Automated Asset Pipeline & QA Verification Gate

Once the code changes are applied, the AGY model must execute the full build and verification sequence.

### Step 3.1: Regenerate Minified CSS Bundles
Regenerate `.min.css` files to reflect the source stylesheet edits:
```bash
rtk npm run styles:min
```
*Expected Output: Logs writing updated minified bundles with exit code 0.*

### Step 3.2: Rebuild & Verify Route-Scoped Style Bundles
Update route style bundles with PurgeCSS:
```bash
rtk npm run styles:routes
```
*Expected Output: "Wrote route styles (... routes, ... bundles)".*

### Step 3.3: Execute Comprehensive QA Validation Suite
Run all relevant QA tests to ensure zero budget overflow or selector regression:
```bash
rtk npm run qa:css:bootstrap && rtk npm run qa:css:routes && rtk npm run qa:css:budget && rtk npm run qa:doctype
```

*Criteria for Passing*:
1. `qa:css:bootstrap`: Bootstrap CSS is current.
2. `qa:css:routes`: Route styles are current and HTML ownership is verified.
3. `qa:css:budget`: Strict gzip budget (< 51,200 bytes per route) passes for all 262 routes.
4. `qa:doctype`: HTML doctype and structural markup valid.

---

## 4. Triage & Rollback Protocols

If any QA script fails:
1. **Budget Overflow**: Check if unnecessary rules or un-purged selectors were added. Restore original scoped classes.
2. **Media Query Check Failure**: Verify that all braces `{` and `}` are strictly balanced.
3. **Emergency Rollback**:
   ```bash
   rtk git checkout -- src/assets/css/base.css src/assets/css/styles.css src/assets/css/pages/policies.css src/assets/css/components.css src/assets/css/tactical-longevity.css
   rtk npm run styles:min
   rtk npm run styles:routes
   ```
