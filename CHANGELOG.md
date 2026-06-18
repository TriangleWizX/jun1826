# Changelog

All notable site, SEO, pricing, schedule, and integration changes should be recorded here.

This project follows a simple changelog format:
- `Added`: new pages, modules, integrations, automations.
- `Changed`: copy updates, URL shifts, pricing/schedule updates.
- `Fixed`: bugs, broken links, tracking issues, schema errors.
- `Removed`: deprecated content, integrations, or redirects.

## 2026-02-16

### Added
- Initial documentation MVP structure under `docs/`.
- Runbooks for deploy, redirects, and sitemap workflow.
- Page spec template and standards docs (style + Definition of Done).

## 2026-03-18

### Changed
- Rewrote homepage hero to booking-first messaging: new H1, approved support copy, primary `Reserve Free Intro`, and secondary SMS CTA `Text Me to Pick the Right Lane`.
- Removed legacy hero-first-view copy that delayed booking intent, including “Best first class in one tap” and historic-district local proof sentence in the hero area.
- Reduced competing first-view booking actions by removing extra Reserve CTA from immediate follow-on first-view blocks.
- Cleaned early homepage conversion zones by removing essay-style authority blocks (Karate-vs-BJJ/UFC/citation-heavy content) from first-view sections and relocating references to lower-page collapsed `Research and Sources` links (`/bjj-faqs`, `/blog/sanda-vs-jiu-jitsu`, `/blog/beginner-friendly-bjj-tannersville-links`).
- Removed repeated narrative blocks on homepage and private-lessons page (duplicate first-class flow modules, repeated evidence recap/guarantee copy, and redundant framing lines) to enforce a tighter hero-to-CTA story.
- Hardened SSI behavior on homepage and private-lessons page to avoid user-visible directive error output by using silent include error handling.

### Added
- Added homepage hero-specific analytics events: `hero_primary_reserve_free_intro` and `hero_secondary_text_pick_lane`, while preserving existing CTA event stream.
