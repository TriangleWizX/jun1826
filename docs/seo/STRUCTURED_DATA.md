# Structured Data Architecture — SenseiSandy.com

## Entity Definitions
Under NO circumstances are distinct entities merged into a single schema block.

1. **Commercial Studio Entity** (`LocalBusiness`):
   - `@id`: `https://senseisandy.com/#business`
   - Name: Sensei Sandy BJJ
   - Address: 6045 Main St, 2nd Floor, Tannersville, NY 12485
   - Telephone: +1 (917) 736-8649

2. **Head Instructor Entity** (`Person`):
   - `@id`: `https://senseisandy.com/#person-sandy`
   - Name: Sandy Nunez (Sensei Sandy)
   - Role: Founder & Head Instructor

3. **Nonprofit Entity** (`EducationalOrganization` / `Organization`):
   - `@id`: `https://senseisandy.com/#nonprofit`
   - Name: Sensei Sandy Community Jiu Jitsu Inc.

## Schema Types Implemented
- `LocalBusiness`: Output on Homepage, Contact, Location, and Program pages.
- `BreadcrumbList`: Generated dynamically on all subpages matching visible breadcrumbs.
- `Article`: Output on all blog posts with headline, author, datePublished, dateModified, and publisher.
- `Offer`: Embedded on `/options-pricing` pulled dynamically from `pricing.json`.

## Generated-output contract

`src/_includes/components/structured-data.njk` is the shared source for the
canonical `LocalBusiness` entity and the targeted rich-result entities used by
the current schema gate. It emits separate JSON-LD blocks so page-specific
entities reference `https://senseisandy.com/#business` instead of redefining
the studio. After editing it, run `npm run build`, synchronize the affected
generated files into the deployment tree, then run `npm run qa:schema`.

The homepage uses `footerSsi: true` in front matter so the generated page keeps
the root-relative `/footer-include.html` deployment contract. Verify it with
`npm run qa:ssi` after a build.
