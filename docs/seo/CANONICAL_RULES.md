# Canonical URL Specification & Rules — SenseiSandy.com

## Core Directives
1. **Canonical Host & Protocol**: `https://senseisandy.com`
2. **Directory Trailing Slash Convention**: Directory paths MUST end with a trailing slash (`/options-pricing/`, `/schedule/`, `/bjj-classes/kids-tannersville-ny/`).
3. **No Redirect Canonicals**: Canonical URLs MUST point directly to active 200-status pages. Canonicals MUST NEVER point to redirect sources or 404/410 pages.
4. **Noindex Handling**: Confirmation pages (`/free-bjj-intro-tannersville-ny/confirmation/`) specify `<meta name="robots" content="noindex, follow">` and use self-referencing canonicals.

## Canonical Reference Table

| Page Type | Canonical URL Format |
| :--- | :--- |
| Homepage | `https://senseisandy.com/` |
| Options & Pricing | `https://senseisandy.com/options-pricing/` |
| Schedule | `https://senseisandy.com/schedule/` |
| Free Intro Landing | `https://senseisandy.com/free-bjj-intro-tannersville-ny/` |
| Confirmation | `https://senseisandy.com/free-bjj-intro-tannersville-ny/confirmation/` (noindex) |
| Kids Program | `https://senseisandy.com/bjj-classes/kids-tannersville-ny/` |
| Teens Program | `https://senseisandy.com/bjj-classes/teens-tannersville-ny/` |
| Adults Program | `https://senseisandy.com/bjj-classes/adults-tannersville-ny/` |
| Primary Town Page | `https://senseisandy.com/bjj-classes/{town-slug}/` |
| Blog Article | `https://senseisandy.com/blog/{article-slug}/` |
