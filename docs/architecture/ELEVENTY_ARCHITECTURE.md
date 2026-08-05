# Eleventy Static Architecture — SenseiSandy.com

## Overview
Release 2 introduced **Eleventy** (`@11ty/eleventy` v3.1.6) as the static-site generator powering `https://senseisandy.com`.

## Key Architectural Principles
1. **Static HTML Output**: The site builds pure static HTML, CSS, JavaScript, and asset files into the `dist/` directory. No database, server runtime, PHP, or browser-based CMS is used.
2. **URL Parity**: All public URLs match existing production routes (e.g. `/index.html`, `/options-pricing/index.html`, `/bjj-classes/kids-tannersville-ny/index.html`).
3. **Structured Data Separation**: Shared business metadata, schedule, pricing, offers, promotions, programs, and locations live in `src/_data/`.
4. **Archive Exclusion**: Archived campaigns and retired source files in `_archive/` are explicitly ignored by Eleventy (`eleventyConfig.ignores.add("_archive/**")`) and do not enter `dist/`.

## Directory Map
* `src/_data/`: Structured JSON records (`business.json`, `schedule.json`, `pricing.json`, `offers.json`, `promotions.json`, `programs.json`, `locations.json`, `contact.json`, `social-profiles.json`, `site.json`).
* `src/_includes/layouts/`: Nunjucks page layouts (`base.njk`, `home.njk`, `program.njk`, `pricing.njk`, `schedule.njk`, `free-intro.njk`, `location.njk`, `article.njk`, `visitor.njk`, `policy.njk`, `error.njk`).
* `src/_includes/components/`: Reusable site components (`head-metadata.njk`, `header.njk`, `footer.njk`, `promotion-banner.njk`, `free-intro-cta.njk`, `schedule-table.njk`).
* `src/pages/`: Content templates for static pages.
* `dist/`: Generated production output directory.

## Workflow Commands
* `npm run dev`: Starts the local Eleventy preview server with hot reloading.
* `npm run build`: Generates the production static site in `dist/`.
* `npm run clean`: Safely removes the `dist/` output directory.
* `npm run validate`: Runs the automated quality assurance suite (schedule audit, static links, link existence, doctype check).
