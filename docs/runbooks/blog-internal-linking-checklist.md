# Blog Internal Linking Checklist

Run this before deploy for any new or updated blog post.

- `npm run blog:clusters`
- `npm run qa:blog:linkout:rules`
- `npm run qa:priority:inlinks`
- `npm run qa:links:static`

Required outcomes:

- Page is linked from at least 1 existing page (validated via inlink QA thresholds).
- Related posts block is present (`RELATED_POSTS_START` marker).
- Start Training block is present with links to `/kids`, `/teen-jiu-jitsu-tannersville-ny`, `/adult-bjj`, `/schedule`.
- At least 2 contextual blog links are present.
- Page is included in sitemap generation flow.
