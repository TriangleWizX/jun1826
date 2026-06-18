# Definition Of Done (Docs Required)

Docs updates are required in the same commit/PR for these change types:

- URLs or navigation changed:
  - update `docs/runbooks/redirects.md` (if process changes)
  - update `docs/url-contract.md` and contract config (`config/url-contract.json`, `config/legacy-redirects.json`) as needed
  - run and pass `npm run qa:links:static`
  - update sitemap artifacts and `docs/runbooks/sitemaps.md` notes as needed
- Blog posts changed or added:
  - include at least 2 contextual links to older blog posts
  - include at least 1 link to a money page (`/schedule` or `/book-free-intro`)
  - include at least 1 link to a hub page (`/blog` or guide page)
  - run and pass `npm run qa:blog:linkout:rules`
- Pricing or schedule changed:
  - add `CHANGELOG.md` entry
  - update relevant page spec based on `docs/content/page-spec-template.md`
- Tracking changed:
  - update `docs/analytics/README.md` and event docs
- Integrations/embeds changed:
  - update `docs/integrations/README.md` (or dedicated integration spec)
  - include verification steps and fallback behavior

## PR Checklist

- [ ] Code/content changes complete
- [ ] Docs updated for affected systems
- [ ] Verification steps recorded
- [ ] Rollback path is clear for risky changes
