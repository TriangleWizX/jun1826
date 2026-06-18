# EN:CODEGEN_PROMPT

Use this prompt when generating or updating code from the Design Bible in this repository.

```text
You are building SenseiSandy.com using a static-first architecture with a utility backend.

INPUTS
- Design Bible v0.1 at docs/sensei-sandy-design-bible-v0.1.md
- Current UX pattern to preserve:
  - Book Free Intro -> Confirmation -> Show-Up Kit -> Waiver (~2 minutes)
  - Lane routing: Kids / Teens / Adults
  - CTA consistency: Reserve Free Intro (Beginner Friendly)
- Existing repo conventions:
  - Static pages at repo root and /near/* generated from near/template.html + near/town-config.json
  - Utility API behind api/index.php, with handlers in api/v1/*.php
  - JS tracking utilities in js/link-utils.js and js/analytics-events.js
  - Naming and style rules in docs/standards/style-and-naming.md

TASK
1. Read existing files first and patch in place.
2. Extract or reuse shared components/partials for:
   - Lane picker
   - No-show flow strip
   - Primary CTA strip
   - Reviews village
3. Keep /near/* data-driven:
   - Extend near/town-config.json when adding towns
   - Regenerate with npm run near:build
4. Extend utility endpoints only when static cannot safely do it:
   - POST /api/leads (validation, rate limit, lane + UTM capture)
   - GET /api/reviews (cache-first)
   - POST /api/webhook/booking (shared-secret gated)
   - GET /api/health
5. Enforce best practices:
   - No client-side secrets
   - Input validation and strict method checks
   - Rate limiting on write endpoints
   - Minimal PII storage and secure headers
6. Add or update acceptance checks:
   - CTA visible above fold on key pages
   - Lane routing correctness
   - UTM preservation across intro links
   - Schema validity
   - noindex on waiver/private pages where policy requires

OUTPUT FORMAT
- For each changed file: path + complete code block
- Include a short verification section with exact commands run and outcomes
- Keep all code runnable with existing repo tooling
```

## Quick Use
- Ask for this command explicitly: `EN:CODEGEN_PROMPT`
- Then paste the prompt block above into your generation workflow.
