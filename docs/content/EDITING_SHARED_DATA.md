# Editing Shared Data Guide — SenseiSandy.com

## How to Update Business Information
Edit `src/_data/business.json` or `src/_data/contact.json`. Rebuild the site using `npm run build`.

## How to Update Class Schedules
Edit `src/_data/schedule.json`. Ensure no Thursday class or obsolete 4:00 PM times are added. Run `npm run validate` to verify.

## How to Update Pricing Tiers
Edit `src/_data/pricing.json`. Update the corresponding offer reference in `src/_data/offers.json` if required.

## How to Manage Promotions
Edit `src/_data/promotions.json`. Set `active: true` or `false`, along with `startDate` and `endDate`. Build-time logic automatically suppresses inactive promotions from rendering.
