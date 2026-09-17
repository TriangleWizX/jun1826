# Wave 1 recoverable cleanup

Removed 35 root Python scripts, 10 root CSV reports, `three.min.js`, and 13 exact media/archive targets from AUDIT-02 through AUDIT-05. Originals are preserved in `/tmp/tmb-audit-wave1-6aqGGW/`; this temporary backup is not durable across machine cleanup. All targets were tracked and clean before removal, so Git also preserves committed originals. No package manifests changed in this workstream.

The 93 hashed CSS files in AUDIT-06 are deferred: 58 have references in tracked legacy HTML, CSS, manifests or reports. None matched the current `src/assets/data/asset-hash-manifest.json`; their removal requires the root-source retirement review.

## Exact text targets

- `audit_links.py`
- `clean_blogs.py`
- `fix_all.py`
- `fix_blog.py`
- `fix_calendly.py`
- `fix_links.py`
- `fix_schedule_faq.py`
- `fix_seo.py`
- `fix_show_up.py`
- `global_replace.py`
- `global_replace_cta.py`
- `inject_high_end_css.py`
- `list_ctas.py`
- `patch.py`
- `patch_js.py`
- `process_blogs.py`
- `process_pages.py`
- `process_phase2.py`
- `process_phase3.py`
- `process_programs.py`
- `purge_schedule.py`
- `refactor_phase1.py`
- `refactor_phase2.py`
- `refactor_phase3.py`
- `remove_schedule.py`
- `replace_goal_mapping.py`
- `replace_index.py`
- `restructure.py`
- `strict_replace.py`
- `update_blog.py`
- `update_footer.py`
- `update_nearby_towns.py`
- `update_nearby_towns2.py`
- `update_schedule.py`
- `update_schedule2.py`
- `semi_private_copy_changes.csv`
- `duplicate_meta_descriptions.csv`
- `duplicate_title_tags.csv`
- `long_load_time.csv`
- `low_word_count.csv`
- `no_h1_heading.csv`
- `page_blocked_from_crawling.csv`
- `seo_friendly_url_keywords_check.csv`
- `seo_non_friendly_url.csv`
- `title_tag_too_long.csv`
- `three.min.js`

## Exact binary targets

- `.tmb.zip`
- `tmp-black-belt-concierge-full-after2.png`
- `tmp-black-belt-concierge-full-after.png`
- `tmp-black-belt-concierge-full.png`
- `tmp-black-belt-concierge-desktop-hero-after3.png`
- `tmp-black-belt-concierge-mobile-after3.png`
- `tmp-black-belt-concierge-mobile-after2.png`
- `tmp-black-belt-concierge-mobile-after.png`
- `tmp-black-belt-concierge.png`
- `home-after.png`
- `home-before.png`
- `sensei-sandy-goal-mapping-implementation.zip`
- `ubersuggest site audit senseisandy.com.zip`

## Evidence and boundaries

Preflight counted 35 Python files (64,314 bytes), 10 CSVs (1,075,756 bytes), 13 binaries (71,548,377 bytes), and `three.min.js` (555,650 bytes). No root Python filename appeared in package.json. Targeted searches across src, js, tools, scripts, and Eleventy config found no three.min.js or headroom-ai usage; headroom-ai remains in package.json and package-lock.json for coordinator removal. CSV generation is documented in assets/py/README_semiprivate_copy_fix/index.html. No builds, network, or commits were run by this worker; coordinator owns integrated validation.

Method: ordinary audit specialist fallback after unsuitable lexical routing; fully read Instructions - CODE, UUID 25a8fe8a-c164-4e8e-8236-3a6585bfa165, source assets/indranet-prompt-exporter/exports/Instructions---CODE/prompt.json. Applied code review, system context, dependency and security review. No required attachments.
