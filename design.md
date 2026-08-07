# Design — Sensei Sandy BJJ

A locked design system for the full Sensei Sandy site. Every page and shared-surface change reads this file before emitting CSS. Amend this file before introducing a page-local visual exception.

## Genre

Editorial. The custom expression is **Catskills Studio**: Catskills warmth, grounded coaching, and quiet confidence. It should feel composed and local, never precious, combative, or like a generic software template.

## Audience and page job

The primary audience is a first-time student, a parent, or a returning adult deciding whether training feels safe and manageable. The system serves one dominant action: **Reserve Free Intro**. “Text Sandy” stays the clear secondary path.

## Macrostructure family

- Marketing pages: **Split Studio**. An asymmetric promise/action composition with one strong visual or proof surface. Hero height follows content and keeps the primary CTA above the mobile fold.
- Functional pages: **Workbench**. Controls, schedule, form, directions, and booking surfaces are explicit, compact, and state-complete.
- Content pages: **Long Document**. Reading rhythm, visible hierarchy, restrained rules, and narrow measure carry the page.
- Content hubs: **Index-First** is an allowed Long Document variation when scanning and filtering are the page’s real job.

Pages share the same theme and typography. Variety comes from content structure and the allowed family variation, not from changing the theme.

## Shared component voice

- Navigation: an adapted **N6 editorial masthead** using the site’s real information architecture, a compact mobile disclosure, and one visible Reserve Free Intro action. No floating pill, glass panel, or ornamental announcement strip.
- Footer: **Ft3 index columns** are justified because the footer is a genuine sitemap. The composition is asymmetric and closes with the studio’s local identity instead of a generic social-icon tail.
- Buttons: **Nested "Button-in-Button" Island Architecture**. Primary CTAs use pill geometry (`var(--radius-pill)`), solid forest accent surface, and an enclosed circular sub-icon container (`width: 2rem`, `height: 2rem`, `border-radius: 50%`) placed flush against the right inner padding. Sub-icons execute micro diagonal translations (`translate(1px, -1px) scale(1.05)`) on hover/active states. Single-line labels only; minimum 44 px touch target.
- Cards & Containers: **Double-Bezel (Doppelrand) Enclosure System**. Functional cards, schedule widgets, and booking containers use nested architecture to create tactile hardware depth. The outer shell uses `var(--color-paper-2)` with a 1px hairline border (`var(--color-rule)`), outer radius `var(--radius-outer)` (1.25rem), and 0.5rem padding (`var(--space-2xs)`). The inner core uses `var(--color-paper)` with concentric radius `var(--radius-inner)` (0.75rem), subtle top-bezel highlight (`box-shadow: inset 0 1px 1px rgba(255,255,255,0.4)`), and primary content. Decorative micro-cards inside cards are prohibited.
- Rules: warm hairlines and deliberate whitespace carry hierarchy more often than shadows.
- Icons: the existing single local Bootstrap Icon subset. Do not mix icon systems.

## Theme

- `--color-paper`: `oklch(98.53% 0.0029 84.6)`
- `--color-paper-2`: `oklch(95.93% 0.0062 75.4)`
- `--color-paper-3`: `oklch(92.74% 0.0126 75.4)`
- `--color-ink`: `oklch(21.28% 0.0161 53.6)`
- `--color-ink-2`: `oklch(29.92% 0.0205 54.2)`
- `--color-rule`: `oklch(88.20% 0.0116 71.9)`
- `--color-rule-2`: `oklch(75.89% 0.0164 67.6)`
- `--color-muted`: `oklch(46.24% 0.0203 55.8)`
- `--color-accent`: `oklch(46.44% 0.1028 157.7)`
- `--color-accent-ink`: `oklch(98.53% 0.0029 84.6)`
- `--color-focus`: `oklch(12.43% 0.0079 72.5)`
- `--color-focus-inverse`: `oklch(68.13% 0.1159 197.7)`
- `--color-backdrop`: `oklch(12.43% 0.0079 72.5 / 0.62)`

Forest green is the anchor and occupies no more than roughly five percent of a typical viewport. Teal, cyan, brown, and gold are supporting notes, not competing themes. Every surface-flipping rule states both its background and foreground colour.

## Typography

- Display: Instrument Serif, weight 400, style normal.
- Body and UI: Lexend, weights 400–700.
- Mono: system monospace only where data or code genuinely requires it.
- Display tracking: `-0.025em`.
- Body measure: normally 45–72 characters.
- Display scale anchor: `clamp(2.75rem, 7vw + 0.5rem, 6rem)`.

Headings remain upright. Italic belongs to emphasis inside running copy, not as a decorative word flip in headlines. Inter, Plus Jakarta Sans, Geist, Cormorant Garamond, and DM Serif Display are outside this system.

## Spacing, layout, and mobile performance engineering

Use the named four-point scale in `tokens.css`; page CSS does not invent raw spacing values. Base styling is mobile-first. Content-driven additions normally occur near 40 rem, 60 rem, and 90 rem. Macro-whitespace padding (`py-16` to `py-32`) allows high-end agency breathing room.

Required viewport checks: 320, 375, 414, 768, and 1440 CSS pixels.
- **Root Overflow:** `html` and `body` use `overflow-x: clip;`, never `hidden`.
- **Viewport Height Stability:** Full-screen heroes use `min-h-[100dvh]` to eliminate layout jumping on iOS Safari and mobile Chrome.
- **Track Protection:** Image-bearing grid columns use `minmax(0, 1fr)`.
- **Text Wrapping:** Display headers specify `overflow-wrap: anywhere; min-width: 0;` to wrap safely on 320px screens. Interactive labels do not wrap.
- **GPU-Safe Performance Guardrails:** Keyframes and transitions animate `transform` and `opacity` ONLY. Layout-triggering properties (`top`, `left`, `width`, `height`) are strictly forbidden in animation loops. `backdrop-blur` is restricted to fixed/sticky nav headers and modal backdrops.
- **Per-Page CSS Payload Budget:** Target a strict **20 KB gzipped** per route. Unused Bootstrap utility classes are selectively purged; legacy route families remain in scope until the contract passes.

Run `npm run qa:css:design-contract` to verify this limit against every active local stylesheet for every sitemapped route. This is the authoritative Catskills Studio budget gate; it is intentionally separate from the repository's existing 50 KB compatibility budget until the legacy route families are reduced to the design-system limit.

## Motion

- Stance: still by default.
- Marketing allowance: one first-load type/media reveal at most, using only opacity and transform and capped at roughly 500 ms total.
- Functional motion: only when it clarifies a state change such as disclosure, validation, or menu position.
- Content pages: no ornamental reveal.
- Easings: `--ease-out`, `--ease-in`, and `--ease-in-out` from `tokens.css`.
- Reduced-motion fallback: spatial motion is removed; necessary fades are at most 150 ms.

Do not use parallax, cursor followers, animated gradients, looping card motion, universal fade-up sections, bounce, or `transition: all`.

## Microinteractions stance & 8-State System

Every interactive element (Buttons, Links, Inputs, Selects, Cards, Modals) must ship explicit styling for all **8 interactive states**:
1. **Default:** Clean token-based styling meeting WCAG 4.5:1 text contrast.
2. **Hover:** Active inside `@media (hover: hover) and (pointer: fine)` only. Micro surface shift, 1px translation, circular sub-icon kinetic shift.
3. **Focus:** Instant focus ring (`2px solid var(--color-focus)` with 2px offset) meeting 3:1 contrast ratio.
4. **Active:** Physical press simulation (`scale(0.98)` or `translateY(1px)`).
5. **Disabled:** 40% opacity, `cursor: not-allowed`, interactive transforms suppressed.
6. **Loading:** Reduced label opacity, inline SVG hardware spinner active.
7. **Error:** Border color `--color-error`, helper error text rendered, `aria-invalid="true"`.
8. **Success:** Border color `--color-success`, confirmation checkmark icon active.

Additional Microinteraction Stances:
- Silent success when the result is already visible.
- Press feedback may translate by one pixel; cards do not universally lift.
- Tooltip delay: 800–1000 ms on hover and 0 ms on focus.
- Form validation begins on blur, preserves border width, and pairs colour with text and ARIA state.
- Touch targets are at least 44 by 44 CSS pixels across all viewports.

## CTA voice

- Primary: solid forest, paper text, medium radius, verb-led label. Default label: **Reserve Free Intro**.
- Secondary: paper or transparent surface with an ink hairline. Default label: **Text Sandy**.
- Supporting line: **Start calm. Train smart.**
- First-class reassurance: **Your first class is a coached learning experience.**

Private lessons remain secondary unless the page is explicitly about private lessons.

## Per-page allowances

- Marketing pages may use one real photograph or existing proof artifact with an asymmetric crop. No generated decorative blobs or fake device chrome.
- Functional pages may use tactile framing for a schedule, form, booking widget, or map. Function determines the frame.
- Content pages use typography, rules, citations, and genuine media. They do not add decorative cards to create activity.
- Hubs may use indexed controls, but the controls must remain accessible without hover.

## What pages must share

- Wordmark, forest accent placement, type pairing, button voice, focus treatment, spacing scale, shared masthead, and shared footer.
- Warm paper and brown-black ink as the dominant field.
- One local icon family.
- Beginner-friendly, local, proof-led copy.

## What pages may differ on

- Macrostructure inside the page-type family.
- Hero media crop and the position of the proof/action rail.
- Content density and reading measure.
- Functional component archetype where the page’s job genuinely differs.

## Anti-pattern contract

Do not ship gradient headlines, aurora backgrounds, glassmorphism, card-in-card, side-stripe cards, full-viewport centred heroes, section eyebrows used as decoration, generic three-column icon grids, fake metrics, emoji feature icons, mixed icon systems, straight-up AI nav/footer patterns, or two-line clickable labels.

## Exports

`tokens.css` is the live source of truth. The portable blocks below mirror all 77 Catskills Studio design tokens that precede the compatibility bridges in that file. The live `--ss-*` migration aliases and `--bs-*` Bootstrap bridges are runtime integration contracts, not portable design tokens, so they intentionally remain in the live file only. This vanilla project does not install Tailwind or shadcn.

Tailwind keeps the Hallmark source names and adds framework namespace aliases where Tailwind v4 needs them. DTCG uses fixed portable anchors for the responsive display and gutter tokens (`6rem` and `3rem`); their `clamp(...)` expressions remain in CSS. The shadcn block retains every Hallmark token alongside shadcn's canonical component roles.

### tokens.css

```css
:root {
  --color-paper: oklch(98.53% 0.0029 84.6);
  --color-paper-2: oklch(95.93% 0.0062 75.4);
  --color-paper-3: oklch(92.74% 0.0126 75.4);
  --color-rule: oklch(88.20% 0.0116 71.9);
  --color-rule-2: oklch(75.89% 0.0164 67.6);
  --color-muted: oklch(46.24% 0.0203 55.8);
  --color-neutral: oklch(36.19% 0.0185 50.4);
  --color-ink-2: oklch(29.92% 0.0205 54.2);
  --color-ink: oklch(21.28% 0.0161 53.6);
  --color-accent: oklch(46.44% 0.1028 157.7);
  --color-accent-strong: oklch(40.50% 0.0886 158.0);
  --color-accent-deep: oklch(35.32% 0.0760 158.5);
  --color-accent-soft: oklch(95.45% 0.0134 167.2);
  --color-accent-ink: var(--color-paper);
  --color-focus: oklch(12.43% 0.0079 72.5);
  --color-focus-inverse: oklch(68.13% 0.1159 197.7);
  --color-backdrop: oklch(12.43% 0.0079 72.5 / 0.62);
  --color-teal: oklch(64.13% 0.0999 196.7);
  --color-cyan: oklch(81.37% 0.1386 196.5);
  --color-brown: oklch(49.70% 0.0914 51.5);
  --color-gold: oklch(70.05% 0.1272 80.7);
  --color-error: oklch(49.75% 0.1396 28.1);
  --color-success: var(--color-accent);

  --font-display: "Instrument Serif", ui-serif, Georgia, "Times New Roman", serif;
  --font-body: "Lexend", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-outlier: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --display-weight: 400;
  --display-style: normal;
  --tracking-display: -0.025em;
  --tracking-body: -0.008em;
  --tracking-label: 0.08em;
  --leading-tight: 0.96;
  --leading-heading: 1.08;
  --leading-body: 1.62;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5625rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
  --text-display: clamp(2.75rem, 7vw + 0.5rem, 6rem);

  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4.5rem;
  --space-3xl: 7rem;
  --space-4xl: 8rem;
  --space-5xl: 12rem;

  --container-narrow: 46rem;
  --container-standard: 72rem;
  --container-wide: 88rem;
  --gutter: clamp(1rem, 3.6vw, 3rem);

  --rule-hair: 1px;
  --rule-fine: 2px;
  --radius-card: 0.75rem;
  --radius-button: 0.5rem;
  --radius-input: 0.5rem;
  --radius-pill: 999px;
  --shadow-card: 0 1px 0 oklch(21.28% 0.0161 53.6 / 0.08), 0 1rem 2.5rem oklch(21.28% 0.0161 53.6 / 0.06);
  --shadow-raised: 0 1.25rem 3.5rem oklch(21.28% 0.0161 53.6 / 0.12);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;

  --z-base: 0;
  --z-raised: 10;
  --z-sticky: 100;
  --z-nav: 200;
  --z-overlay: 300;
  --z-modal: 400;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(98.53% 0.0029 84.6);
  --color-paper-2: oklch(95.93% 0.0062 75.4);
  --color-paper-3: oklch(92.74% 0.0126 75.4);
  --color-rule: oklch(88.20% 0.0116 71.9);
  --color-rule-2: oklch(75.89% 0.0164 67.6);
  --color-muted: oklch(46.24% 0.0203 55.8);
  --color-neutral: oklch(36.19% 0.0185 50.4);
  --color-ink-2: oklch(29.92% 0.0205 54.2);
  --color-ink: oklch(21.28% 0.0161 53.6);
  --color-accent: oklch(46.44% 0.1028 157.7);
  --color-accent-strong: oklch(40.50% 0.0886 158.0);
  --color-accent-deep: oklch(35.32% 0.0760 158.5);
  --color-accent-soft: oklch(95.45% 0.0134 167.2);
  --color-accent-ink: var(--color-paper);
  --color-focus: oklch(12.43% 0.0079 72.5);
  --color-focus-inverse: oklch(68.13% 0.1159 197.7);
  --color-backdrop: oklch(12.43% 0.0079 72.5 / 0.62);
  --color-teal: oklch(64.13% 0.0999 196.7);
  --color-cyan: oklch(81.37% 0.1386 196.5);
  --color-brown: oklch(49.70% 0.0914 51.5);
  --color-gold: oklch(70.05% 0.1272 80.7);
  --color-error: oklch(49.75% 0.1396 28.1);
  --color-success: var(--color-accent);

  --font-display: "Instrument Serif", ui-serif, Georgia, "Times New Roman", serif;
  --font-body: "Lexend", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-outlier: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --display-weight: 400;
  --display-style: normal;
  --font-weight-display: var(--display-weight);
  --tracking-display: -0.025em;
  --tracking-body: -0.008em;
  --tracking-label: 0.08em;
  --leading-tight: 0.96;
  --leading-heading: 1.08;
  --leading-body: 1.62;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5625rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
  --text-display: clamp(2.75rem, 7vw + 0.5rem, 6rem);

  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4.5rem;
  --space-3xl: 7rem;
  --space-4xl: 8rem;
  --space-5xl: 12rem;
  --spacing-3xs: 0.25rem;
  --spacing-2xs: 0.5rem;
  --spacing-xs: 0.75rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4.5rem;
  --spacing-3xl: 7rem;
  --spacing-4xl: 8rem;
  --spacing-5xl: 12rem;

  --container-narrow: 46rem;
  --container-standard: 72rem;
  --container-wide: 88rem;
  --gutter: clamp(1rem, 3.6vw, 3rem);
  --spacing-gutter: var(--gutter);

  --rule-hair: 1px;
  --rule-fine: 2px;
  --radius-card: 0.75rem;
  --radius-button: 0.5rem;
  --radius-input: 0.5rem;
  --radius-pill: 999px;
  --shadow-card: 0 1px 0 oklch(21.28% 0.0161 53.6 / 0.08), 0 1rem 2.5rem oklch(21.28% 0.0161 53.6 / 0.06);
  --shadow-raised: 0 1.25rem 3.5rem oklch(21.28% 0.0161 53.6 / 0.12);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
  --duration-micro: var(--dur-micro);
  --duration-short: var(--dur-short);
  --duration-long: var(--dur-long);

  --z-base: 0;
  --z-raised: 10;
  --z-sticky: 100;
  --z-nav: 200;
  --z-overlay: 300;
  --z-modal: 400;
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(98.53% 0.0029 84.6)", "$type": "color" },
    "paper-2": { "$value": "oklch(95.93% 0.0062 75.4)", "$type": "color" },
    "paper-3": { "$value": "oklch(92.74% 0.0126 75.4)", "$type": "color" },
    "rule": { "$value": "oklch(88.20% 0.0116 71.9)", "$type": "color" },
    "rule-2": { "$value": "oklch(75.89% 0.0164 67.6)", "$type": "color" },
    "muted": { "$value": "oklch(46.24% 0.0203 55.8)", "$type": "color" },
    "neutral": { "$value": "oklch(36.19% 0.0185 50.4)", "$type": "color" },
    "ink-2": { "$value": "oklch(29.92% 0.0205 54.2)", "$type": "color" },
    "ink": { "$value": "oklch(21.28% 0.0161 53.6)", "$type": "color" },
    "accent": { "$value": "oklch(46.44% 0.1028 157.7)", "$type": "color" },
    "accent-strong": { "$value": "oklch(40.50% 0.0886 158.0)", "$type": "color" },
    "accent-deep": { "$value": "oklch(35.32% 0.0760 158.5)", "$type": "color" },
    "accent-soft": { "$value": "oklch(95.45% 0.0134 167.2)", "$type": "color" },
    "accent-ink": { "$value": "{color.paper}", "$type": "color" },
    "focus": { "$value": "oklch(12.43% 0.0079 72.5)", "$type": "color" },
    "focus-inverse": { "$value": "oklch(68.13% 0.1159 197.7)", "$type": "color" },
    "backdrop": { "$value": "oklch(12.43% 0.0079 72.5 / 0.62)", "$type": "color" },
    "teal": { "$value": "oklch(64.13% 0.0999 196.7)", "$type": "color" },
    "cyan": { "$value": "oklch(81.37% 0.1386 196.5)", "$type": "color" },
    "brown": { "$value": "oklch(49.70% 0.0914 51.5)", "$type": "color" },
    "gold": { "$value": "oklch(70.05% 0.1272 80.7)", "$type": "color" },
    "error": { "$value": "oklch(49.75% 0.1396 28.1)", "$type": "color" },
    "success": { "$value": "{color.accent}", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Instrument Serif, ui-serif, Georgia, Times New Roman, serif", "$type": "fontFamily" },
    "body": { "$value": "Lexend, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace", "$type": "fontFamily" }
  },
  "typography": {
    "display-weight": { "$value": 400, "$type": "fontWeight" },
    "display-style": { "$value": "normal", "$type": "string" },
    "tracking-display": { "$value": "-0.025em", "$type": "dimension" },
    "tracking-body": { "$value": "-0.008em", "$type": "dimension" },
    "tracking-label": { "$value": "0.08em", "$type": "dimension" },
    "leading-tight": { "$value": 0.96, "$type": "number" },
    "leading-heading": { "$value": 1.08, "$type": "number" },
    "leading-body": { "$value": 1.62, "$type": "number" }
  },
  "size": {
    "text-xs": { "$value": "0.75rem", "$type": "dimension" },
    "text-sm": { "$value": "0.875rem", "$type": "dimension" },
    "text-md": { "$value": "1rem", "$type": "dimension" },
    "text-lg": { "$value": "1.25rem", "$type": "dimension" },
    "text-xl": { "$value": "1.5625rem", "$type": "dimension" },
    "text-2xl": { "$value": "1.953rem", "$type": "dimension" },
    "text-3xl": { "$value": "2.441rem", "$type": "dimension" },
    "text-display": { "$value": "6rem", "$type": "dimension" }
  },
  "space": {
    "3xs": { "$value": "0.25rem", "$type": "dimension" },
    "2xs": { "$value": "0.5rem", "$type": "dimension" },
    "xs": { "$value": "0.75rem", "$type": "dimension" },
    "sm": { "$value": "1rem", "$type": "dimension" },
    "md": { "$value": "1.5rem", "$type": "dimension" },
    "lg": { "$value": "2rem", "$type": "dimension" },
    "xl": { "$value": "3rem", "$type": "dimension" },
    "2xl": { "$value": "4.5rem", "$type": "dimension" },
    "3xl": { "$value": "7rem", "$type": "dimension" },
    "4xl": { "$value": "8rem", "$type": "dimension" },
    "5xl": { "$value": "12rem", "$type": "dimension" }
  },
  "container": {
    "narrow": { "$value": "46rem", "$type": "dimension" },
    "standard": { "$value": "72rem", "$type": "dimension" },
    "wide": { "$value": "88rem", "$type": "dimension" },
    "gutter": { "$value": "3rem", "$type": "dimension" }
  },
  "rule": {
    "hair": { "$value": "1px", "$type": "dimension" },
    "fine": { "$value": "2px", "$type": "dimension" }
  },
  "radius": {
    "card": { "$value": "0.75rem", "$type": "dimension" },
    "button": { "$value": "0.5rem", "$type": "dimension" },
    "input": { "$value": "0.5rem", "$type": "dimension" },
    "pill": { "$value": "999px", "$type": "dimension" }
  },
  "shadow": {
    "card": { "$value": "0 1px 0 oklch(21.28% 0.0161 53.6 / 0.08), 0 1rem 2.5rem oklch(21.28% 0.0161 53.6 / 0.06)", "$type": "shadow" },
    "raised": { "$value": "0 1.25rem 3.5rem oklch(21.28% 0.0161 53.6 / 0.12)", "$type": "shadow" }
  },
  "easing": {
    "out": { "$value": [0.16, 1, 0.3, 1], "$type": "cubicBezier" },
    "in": { "$value": [0.7, 0, 0.84, 0], "$type": "cubicBezier" },
    "in-out": { "$value": [0.65, 0, 0.35, 1], "$type": "cubicBezier" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "220ms", "$type": "duration" },
    "long": { "$value": "420ms", "$type": "duration" }
  },
  "z": {
    "base": { "$value": 0, "$type": "number" },
    "raised": { "$value": 10, "$type": "number" },
    "sticky": { "$value": 100, "$type": "number" },
    "nav": { "$value": 200, "$type": "number" },
    "overlay": { "$value": 300, "$type": "number" },
    "modal": { "$value": 400, "$type": "number" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 98.53% 0.0029 84.6;
  --foreground: 21.28% 0.0161 53.6;
  --card: 95.93% 0.0062 75.4;
  --card-foreground: 21.28% 0.0161 53.6;
  --popover: 95.93% 0.0062 75.4;
  --popover-foreground: 21.28% 0.0161 53.6;
  --primary: 46.44% 0.1028 157.7;
  --primary-foreground: 98.53% 0.0029 84.6;
  --secondary: 92.74% 0.0126 75.4;
  --secondary-foreground: 29.92% 0.0205 54.2;
  --muted: 88.20% 0.0116 71.9;
  --muted-foreground: 46.24% 0.0203 55.8;
  --accent: 46.44% 0.1028 157.7;
  --accent-foreground: 98.53% 0.0029 84.6;
  --destructive: 49.75% 0.1396 28.1;
  --destructive-foreground: 98.53% 0.0029 84.6;
  --border: 88.20% 0.0116 71.9;
  --input: 88.20% 0.0116 71.9;
  --ring: 12.43% 0.0079 72.5;
  --overlay: 12.43% 0.0079 72.5 / 0.62;
  --radius: 0.75rem;

  /* Hallmark source tokens retained for Catskills Studio extensions. */
  --color-paper: oklch(98.53% 0.0029 84.6);
  --color-paper-2: oklch(95.93% 0.0062 75.4);
  --color-paper-3: oklch(92.74% 0.0126 75.4);
  --color-rule: oklch(88.20% 0.0116 71.9);
  --color-rule-2: oklch(75.89% 0.0164 67.6);
  --color-muted: oklch(46.24% 0.0203 55.8);
  --color-neutral: oklch(36.19% 0.0185 50.4);
  --color-ink-2: oklch(29.92% 0.0205 54.2);
  --color-ink: oklch(21.28% 0.0161 53.6);
  --color-accent: oklch(46.44% 0.1028 157.7);
  --color-accent-strong: oklch(40.50% 0.0886 158.0);
  --color-accent-deep: oklch(35.32% 0.0760 158.5);
  --color-accent-soft: oklch(95.45% 0.0134 167.2);
  --color-accent-ink: var(--color-paper);
  --color-focus: oklch(12.43% 0.0079 72.5);
  --color-focus-inverse: oklch(68.13% 0.1159 197.7);
  --color-backdrop: oklch(12.43% 0.0079 72.5 / 0.62);
  --color-teal: oklch(64.13% 0.0999 196.7);
  --color-cyan: oklch(81.37% 0.1386 196.5);
  --color-brown: oklch(49.70% 0.0914 51.5);
  --color-gold: oklch(70.05% 0.1272 80.7);
  --color-error: oklch(49.75% 0.1396 28.1);
  --color-success: var(--color-accent);

  --font-display: "Instrument Serif", ui-serif, Georgia, "Times New Roman", serif;
  --font-body: "Lexend", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-outlier: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --display-weight: 400;
  --display-style: normal;
  --tracking-display: -0.025em;
  --tracking-body: -0.008em;
  --tracking-label: 0.08em;
  --leading-tight: 0.96;
  --leading-heading: 1.08;
  --leading-body: 1.62;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5625rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
  --text-display: clamp(2.75rem, 7vw + 0.5rem, 6rem);

  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4.5rem;
  --space-3xl: 7rem;
  --space-4xl: 8rem;
  --space-5xl: 12rem;

  --container-narrow: 46rem;
  --container-standard: 72rem;
  --container-wide: 88rem;
  --gutter: clamp(1rem, 3.6vw, 3rem);

  --rule-hair: 1px;
  --rule-fine: 2px;
  --radius-card: 0.75rem;
  --radius-button: 0.5rem;
  --radius-input: 0.5rem;
  --radius-pill: 999px;
  --shadow-card: 0 1px 0 oklch(21.28% 0.0161 53.6 / 0.08), 0 1rem 2.5rem oklch(21.28% 0.0161 53.6 / 0.06);
  --shadow-raised: 0 1.25rem 3.5rem oklch(21.28% 0.0161 53.6 / 0.12);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;

  --z-base: 0;
  --z-raised: 10;
  --z-sticky: 100;
  --z-nav: 200;
  --z-overlay: 300;
  --z-modal: 400;
}
```
