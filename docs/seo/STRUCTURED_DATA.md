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
