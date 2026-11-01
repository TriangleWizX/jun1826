#!/usr/bin/env python3
"""Deploy only generated files changed by a commit, atomically and resumably."""
import argparse, json, pathlib, posixpath, re, shlex, subprocess, tarfile, time
import paramiko

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST_ROOT = ROOT / 'dist'
SKIP_PREFIXES = ('.agents/', 'artifacts/', 'reports/', 'scripts/', 'docs/', '.vscode/', 'package')
DEPLOYABLE_ROOTS = ('_includes/', 'assets/', 'winter-rank-drop/', 'winter-armor-2027/', 'admin/', 'athlete-cross-training/', 'annual-track/', 'alley-bootcamp/', 'bjj-classes/', 'bjj-glossary/', 'bjj-videos/', 'blog/', 'clean/', 'members/', 'near/', 'partials/', 'js/', 'images/', 'img/', 'fonts/', 'downloads/', 'youtube/', 'yam/', 'yams/', 'external/', 'partners/', 'reviews-village/', 'research/', 'scribners-staff-reset-pass/', 'social/', 'instagram/', 'snippets/', 'sources/', 'schedule/', 'tactical-longevity/', 'videos/', 'free-bjj-intro-tannersville-ny/', 'white-belt-foundations/', 'options-pricing/', 'evidence/', 'hyphen-weekend/', '413/', 'api/', 'free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny/', 'school-families-jiu-jitsu/', 'visit/', 'after-school/', 'deer-mountain-inn/', 'phoenicia-diner/', 'parents-guide-kids-bjj/', 'about/', 'what-is-a-jiu-jitsu-sensei/', 'jiu-jitsu-terms/', 'bjj-butterfly-guard/')
ROOT_FILES = {'bio.html', 'nearby-towns.html', 'law-enforcement-bjj.html', 'scribners.html', 'scribners-jiu-jitsu.html', 'scribners-thank-you.html', 'partners-hospitality-hunter-windham.html', 'partners-wellness-pt-referrals.html', 'community-partners.html', 'elite-concierge.html', 'adult-private-coaching-intensive.html', 'bring-a-friend.html', 'guarantee-terms.html', '.htaccess', 'index.html', 'robots.txt', 'sitemap.xml', 'sitemap-core.xml', 'sitemap-programs.xml', 'site-shell.html', 'nav-include.html', 'footer-include.html', 'report-card.html', 'weekly-audit.html', 'daily-checkin.html', 'manifest-daily-checkin.json', 'sw-daily-checkin.js', 'show-up-kit.html', 'contact.html', 'bjj_anatomy_game.html', 'birthday-parties.html', 'private-lessons.html', 'programs.html', 'options-pricing.html', 'bjj-faqs.html', 'how-class-works.html', 'parent-resources.html', 'hyphen-weekend.html', 'student-hub.html', 'catskills-home-base.html', 'friday-night-fanatics.html', 'holiday-schedule.html', 'bjj-stretches.html', 'bjj-tannersville-ny-directions.html', 'local-bjj-tournaments-for-parents.html', 'local-bjj-tournaments-for-families.html', 'success-stories.html', 'sensei-jiu-jitsu.html', 'sensei-studio.html', 'bully-proof-jiu-jitsu-tannersville-ny.html', 'jiu-jitsu-safety-tannersville-ny.html', 'rural-bjj-catskills.html', 'waiver.html', 'schedule.html', 'camp-clinics.html', 'summer-academy.html', 'black-belt-concierge.html', 'inclusion.html'}
BACKUP_NAME = re.compile(r'^senseisandy-predeploy-[0-9TZ-]+\.tar\.gz$')
REQUIRED_BACKUP_MEMBERS = {
    './.htaccess', './index.html', './robots.txt', './sitemap.xml',
    './free-bjj-intro-tannersville-ny/index.html', './options-pricing/index.html',
    './schedule/index.html', './instagram/index.html',
}
ROOT_FILES.add('womens-jiu-jitsu-tannersville.html')
ROOT_FILES.add('pricing-module-fragment.html')
ROOT_FILES.add('halloween-spooktacular.html')
ROOT_FILES.add('llms.txt')
ROOT_FILES.add('pricing.md')
ROOT_FILES.add('school-families-jiu-jitsu.html')
ROOT_FILES.add('deer-mountain-inn.html')
ROOT_FILES.add('phoenicia-diner.html')
ROOT_FILES.add('class-rules.html')
ROOT_FILES.add('parents-guide-kids-bjj.html')
ROOT_FILES.add('about.html')
ROOT_FILES.add('spring-armor-drop.html')
ROOT_FILES.add('giveaway-rules.html')
ROOT_FILES.add('footer-partner.html')
SITEMAP_OUTPUTS = ('sitemap.xml', 'sitemap-core.xml', 'sitemap-programs.xml',
 'sitemap-locations.xml', 'sitemap-blog.xml', 'sitemap-glossary.xml', 'sitemap-research.xml')
RESEARCH_RECORD_OUTPUTS = (
    'sources/research/bjj-ecological-dynamical-2026/index.html',
    'sources/research/games-based-teaching-review/index.html',
    'sources/research/pe-games-review-2026/index.html',
    'sources/research/challenge-point-perspective-2026/index.html',
    'sources/research/bjj-mma-youth-development/index.html',
    'sources/research/bjj-school-rct/index.html',
    'sources/research/youth-martial-arts-attention-rct/index.html',
    'sources/research/open-skill-youth-meta-analysis/index.html',
    'sources/research/bjj-adult-fitness/index.html',
    'sources/research/rugby-ecological-dynamics-2026/index.html',
    'sources/research/ecological-dynamic-learning-review-2026/index.html',
    'sources/research/bjj-injury-2025/index.html',
 'sources/research/bjj-injury-rates-review/index.html',
 'sources/research/combat-sports-injury-epidemiology-review/index.html',
 'sources/research/combat-sports-post-concussion-care/index.html',
 'sources/research/deliberate-practice-expertise/index.html',
 'sources/research/exercise-cognition-neuroplasticity-review/index.html',
 'sources/research/greene-county-child-health-2024/index.html',
 'sources/research/greene-county-community-health-2022-2024/index.html',
 'sources/research/pediatric-bjj-injury-review/index.html',
 'sources/research/youth-sports-injury-prevention/index.html',
)
ROUTE_SCOPED_CSS_INPUTS = {
    'src/assets/css/pages/home.css',
    'src/assets/css/pages/home.min.css',
    'src/assets/css/pages/instagram.css',
    'src/assets/css/pages/schedule.css',
    'src/assets/css/pages/schedule.min.css',
    'src/assets/css/pages/near.css',
    'src/assets/css/pages/options-pricing-highend.css',
    'src/assets/css/pages/law-enforcement.css',
    'src/assets/css/pages/law-enforcement.min.css',
    'src/assets/css/pages/catskills-home-base-touch.css',
    'src/assets/css/pages/everyday-jiu-jitsu.css',
    'src/assets/css/pages/everyday-jiu-jitsu.min.css',
    'src/assets/css/pages/birthday-parties.css',
    'src/assets/css/pages/partners-hospitality-hunter-windham.css',
    'src/assets/css/pages/partners-hospitality-hunter-windham.min.css',
    'src/assets/css/pages/bjj-stretches.css',
    'src/assets/css/pages/bjj-stretches.min.css',
    'src/assets/css/pages/partners-wellness.css',
    'src/assets/css/pages/alley-bootcamp.css',
    'src/assets/css/bjj-glossary.css',
    'src/assets/css/pages/glossary.css',
}


def is_shared_style_input(name):
    return name.startswith(('src/assets/css/', 'src/assets/js/', 'src/js/',
                            'src/partials/', 'src/_includes/', 'src/_data/')) \
        and name not in ROUTE_SCOPED_CSS_INPUTS


def changed_outputs(commit, only=()):
    requested_outputs = set(only)
    requested = lambda rel: not requested_outputs or rel in requested_outputs
    names = subprocess.check_output(['git', 'diff-tree', '--no-commit-id', '--name-only', '-r', commit], cwd=ROOT, text=True).splitlines()
    outputs = set()
    # The Home builder inlines page CSS into its generated root route.
    # Include the homepage HTML when a Home stylesheet changes.
    if {'src/assets/css/pages/home.css', 'src/assets/css/pages/home.min.css'} & set(names):
        home_page = DIST_ROOT / 'index.html'
        if home_page.is_file():
            outputs.add((home_page, 'index.html'))
    # Bio's route-only stylesheet build emits one content-hashed CSS file. Map
    # its exact generated dependencies from the Bio HTML so the release stays
    # scoped even though dist/ is ignored.
    if 'src/bio.html' in names or 'tools/build-bio-delivery-styles.mjs' in names:
        page = DIST_ROOT / 'bio.html'
        if not page.is_file():
            raise ValueError('Bio release requires a generated dist/bio.html')
        html = page.read_text(encoding='utf-8')
        outputs.add((page, 'bio.html'))
        bio_assets = set(re.findall(
            r'''(?:src|href)=["']/?(assets/(?:css/pages/bio-delivery\.[a-f0-9]{12}\.css|images/bio-black-belt-promo-670x669\.[a-f0-9]{6}\.webp))["']''',
            html,
        ))
        required = {
            'assets/css/pages/bio-delivery',
            'assets/images/bio-black-belt-promo-670x669',
        }
        found = {re.sub(r'\.[a-f0-9]+\.(?:css|webp)$', '', asset) for asset in bio_assets}
        if not required.issubset(found):
            raise ValueError('Bio release HTML must reference the fingerprinted delivery CSS and promotion WebP')
        for rel in sorted(bio_assets):
            candidate = DIST_ROOT / rel
            if not candidate.is_file():
                raise ValueError(f'Missing generated Bio dependency: {rel}')
            outputs.add((candidate, rel))
    # Alley Bootcamp directly loads route-owned fingerprinted CSS.
    if 'src/assets/css/pages/alley-bootcamp.css' in names:
        page = DIST_ROOT / 'alley-bootcamp' / 'index.html'
        if not page.is_file():
            raise ValueError('Alley Bootcamp CSS release requires fresh route build')
        page_text = page.read_text(encoding='utf-8')
        fingerprints = re.findall(
            r'''href=["']/?(assets/css/pages/alley-bootcamp\.[a-f0-9]+\.css)["']''',
            page_text,
        )
        if len(fingerprints) != 1:
            raise ValueError('Alley Bootcamp must reference exactly one fingerprinted stylesheet')
        css_rel = fingerprints[0]
        css_path = DIST_ROOT / css_rel
        if not css_path.is_file():
            raise ValueError(f'Missing Alley Bootcamp stylesheet: {css_rel}')
        outputs.add((page, 'alley-bootcamp/index.html'))
        outputs.add((css_path, css_rel))

    # Friday Night Fanatics directly loads its route-owned fingerprinted CSS.
    if 'src/assets/css/pages/friday-night-fanatics.css' in names:
        page = DIST_ROOT / 'friday-night-fanatics.html'
        if not page.is_file():
            raise ValueError('Friday Night Fanatics release requires a fresh route build')
        page_text = page.read_text(encoding='utf-8')
        fingerprints = re.findall(
            r'''href=["']/?(assets/css/pages/friday-night-fanatics\.[a-f0-9]+\.css)["']''',
            page_text,
        )
        if len(fingerprints) != 1:
            raise ValueError('Friday Night Fanatics must reference exactly one fingerprinted stylesheet')
        css_rel = fingerprints[0]
        css_path = DIST_ROOT / css_rel
        if not css_path.is_file():
            raise ValueError(f'Missing Friday Night Fanatics stylesheet: {css_rel}')
        outputs.add((page, 'friday-night-fanatics.html'))
        outputs.add((css_path, css_rel))
    # The partner footer fragment is included by SSI and deployed as its own root file.
    if 'src/footer-partner.html' in names:
        candidate = DIST_ROOT / 'footer-partner.html'
        if candidate.is_file():
            outputs.add((candidate, 'footer-partner.html'))

    # Catskills Home Base owns a route CSS bundle; deploy the fingerprint referenced by its HTML.
    if any(name in names for name in (
        'src/catskills-home-base.html',
        'src/assets/css/pages/catskills-home-base-touch.css',
    )):
        page = DIST_ROOT / 'catskills-home-base.html'
        if page.is_file():
            outputs.add((page, 'catskills-home-base.html'))
            page_text = page.read_text(encoding='utf-8')
            fingerprints = re.findall(
                r'''href=["']/?(assets/css/pages/catskills-home-base-touch\.[a-f0-9]+\.css)["']''',
                page_text,
            )
            if len(fingerprints) != 1:
                raise ValueError('Catskills Home Base must reference exactly one fingerprinted touch stylesheet')
            css_rel = fingerprints[0]
            css_path = DIST_ROOT / css_rel
            if not css_path.is_file():
                raise ValueError(f'Missing Catskills Home Base stylesheet: {css_rel}')
            outputs.add((css_path, css_rel))

    # Law Enforcement page links to the fingerprinted route-owned stylesheet.
    if any(name in names for name in (
        'src/assets/css/pages/law-enforcement.css',
        'src/assets/css/pages/law-enforcement.min.css',
    )):
        candidate = DIST_ROOT / 'law-enforcement-bjj.html'
        if candidate.is_file():
            outputs.add((candidate, 'law-enforcement-bjj.html'))

    # Everyday Jiu-Jitsu owns a directory-index page and a fingerprinted route stylesheet.
    if any(name in names for name in (
        'src/everyday-jiu-jitsu-training.html',
        'src/assets/css/pages/everyday-jiu-jitsu.css',
        'src/assets/css/pages/everyday-jiu-jitsu.min.css',
    )):
        candidate = DIST_ROOT / 'everyday-jiu-jitsu-training' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'everyday-jiu-jitsu-training/index.html'))
            page_text = candidate.read_text(encoding='utf-8')
            fingerprints = re.findall(
                r'''href=["']/?(assets/css/pages/everyday-jiu-jitsu\.[a-f0-9]+\.css)["']''',
                page_text,
            )
            if len(fingerprints) != 1:
                raise ValueError('Everyday Jiu-Jitsu must reference exactly one fingerprinted stylesheet')
            css_rel = fingerprints[0]
            css_path = DIST_ROOT / css_rel
            if not css_path.is_file():
                raise ValueError(f'Missing Everyday Jiu-Jitsu stylesheet: {css_rel}')
            outputs.add((css_path, css_rel))

    # Birthday Parties owns a root HTML page and a fingerprinted route stylesheet.
    if any(name in names for name in (
        'src/birthday-parties.html',
        'src/assets/css/pages/birthday-parties.css',
    )):
        candidate = DIST_ROOT / 'birthday-parties.html'
        if candidate.is_file():
            outputs.add((candidate, 'birthday-parties.html'))
            page_text = candidate.read_text(encoding='utf-8')
            fingerprints = re.findall(
                r'''href=["']/?(assets/css/pages/birthday-parties\.[a-f0-9]+\.css)["']''',
                page_text,
            )
            if len(fingerprints) != 1:
                raise ValueError('Birthday Parties must reference exactly one fingerprinted stylesheet')
            css_rel = fingerprints[0]
            css_path = DIST_ROOT / css_rel
            if not css_path.is_file():
                raise ValueError(f'Missing Birthday Parties stylesheet: {css_rel}')
            outputs.add((css_path, css_rel))

    # Hospitality Partners owns a root HTML page and a fingerprinted route stylesheet.
    if any(name in names for name in (
        'src/partners-hospitality-hunter-windham.html',
        'src/assets/css/pages/partners-hospitality-hunter-windham.css',
        'src/assets/css/pages/partners-hospitality-hunter-windham.min.css',
    )):
        candidate = DIST_ROOT / 'partners-hospitality-hunter-windham.html'
        if candidate.is_file():
            outputs.add((candidate, 'partners-hospitality-hunter-windham.html'))
            page_text = candidate.read_text(encoding='utf-8')
            fingerprints = re.findall(
                r'''href=["']/?(assets/css/pages/partners-hospitality-hunter-windham\.[a-f0-9]+\.css)["']''',
                page_text,
            )
            if len(fingerprints) != 1:
                raise ValueError('Hospitality Partners must reference exactly one fingerprinted stylesheet')
            css_rel = fingerprints[0]
            css_path = DIST_ROOT / css_rel
            if not css_path.is_file():
                raise ValueError(f'Missing Hospitality Partners stylesheet: {css_rel}')
            outputs.add((css_path, css_rel))
    # Wellness Partners owns a root route and fingerprinted stylesheet.
    if 'src/assets/css/pages/partners-wellness.css' in names:
        page = DIST_ROOT / 'partners-wellness-pt-referrals.html'
        if not page.is_file():
            raise ValueError('Wellness Partners CSS release requires dist/partners-wellness-pt-referrals.html')
        page_text = page.read_text(encoding='utf-8')
        fingerprints = re.findall(
            r'href="/?(assets/css/pages/partners-wellness\.[a-f0-9]+\.css)"',
            page_text,
        )
        if len(fingerprints) != 1:
            raise ValueError('Wellness Partners must reference exactly one fingerprinted stylesheet')
        css_rel = fingerprints[0]
        css_path = DIST_ROOT / css_rel
        if not css_path.is_file():
            raise ValueError(f'Missing Wellness Partners stylesheet: {css_rel}')
        outputs.add((page, 'partners-wellness-pt-referrals.html'))
        outputs.add((css_path, css_rel))

    # BJJ Stretches owns a root route and fingerprinted minified stylesheet.
    if any(name in names for name in (
        'src/assets/css/pages/bjj-stretches.css',
        'src/assets/css/pages/bjj-stretches.min.css',
    )):
        page = DIST_ROOT / 'bjj-stretches.html'
        if not page.is_file():
            raise ValueError('BJJ Stretches CSS release requires dist/bjj-stretches.html')
        page_text = page.read_text(encoding='utf-8')
        fingerprints = re.findall(
            r'href="/?(assets/css/pages/bjj-stretches\.min\.[a-f0-9]+\.css)"',
            page_text,
        )
        if len(fingerprints) != 1:
            raise ValueError('BJJ Stretches must reference exactly one fingerprinted minified stylesheet')
        css_rel = fingerprints[0]
        css_path = DIST_ROOT / css_rel
        if not css_path.is_file():
            raise ValueError(f'Missing BJJ Stretches stylesheet: {css_rel}')
        outputs.add((page, 'bjj-stretches.html'))
        outputs.add((css_path, css_rel))

    # Programs consumes canonical Tannersville CSS directly; its generated root
    # route and fingerprinted stylesheet must travel together.
    if 'src/assets/css/pages/tannersville.css' in names:
        page = DIST_ROOT / 'programs.html'
        if not page.is_file():
            raise ValueError('Tannersville stylesheet release requires dist/programs.html')
        page_text = page.read_text(encoding='utf-8')
        fingerprints = re.findall(
            r'''href=["']/?(assets/css/pages/tannersville\.[a-f0-9]{6}\.css)["']''',
            page_text,
        )
        if len(fingerprints) != 1:
            raise ValueError('Programs must reference exactly one fingerprinted Tannersville stylesheet')
        css_rel = fingerprints[0]
        css_path = DIST_ROOT / css_rel
        if not css_path.is_file():
            raise ValueError(f'Missing Programs Tannersville stylesheet: {css_rel}')
        outputs.add((page, 'programs.html'))
        outputs.add((css_path, css_rel))

    # The normal build regenerates the sitemap index and children from source
    # pages and the URL registry. Include their generated dist copies in every
    # source-content release so production cannot retain stale lastmod data.
    sitemap_inputs = ('data/url-registry.json' in names or
                      'tools/build-all-sitemaps.mjs' in names or
                      any(name.startswith('src/') and name.endswith(('.html', '.njk'))
                          for name in names))
    if sitemap_inputs:
        for rel in SITEMAP_OUTPUTS:
            candidate = DIST_ROOT / rel
            if candidate.is_file():
                outputs.add((candidate, rel))
    # Explicit generated outputs are authoritative when shared partials change.
    for name in names:
        if not name.startswith('dist/'):
            continue
        rel = name[5:]
        candidate = ROOT / name
        if candidate.is_file() and (rel in ROOT_FILES or rel.startswith(DEPLOYABLE_ROOTS)):
            outputs.add((candidate, rel))
    # One paginated Nunjucks template emits these research routes; the source
    # template and its data files do not share the generated route paths.
    research_record_inputs = {
        'src/_data/evidence-records.json',
        'src/_data/researchSourcePages.js',
        'src/sources/research/records.njk',
    }
    if any(name in research_record_inputs for name in names):
        for rel in RESEARCH_RECORD_OUTPUTS:
            candidate = DIST_ROOT / rel
            if candidate.is_file():
                outputs.add((candidate, rel))
    if 'src/_data/faqs.json' in names:
        candidate = DIST_ROOT / 'bjj-faqs.html'
        if candidate.is_file():
            outputs.add((candidate, 'bjj-faqs.html'))
    if 'src/winter-rank-drop.html' in names: outputs.add((ROOT / 'dist/winter-rank-drop/index.html', 'winter-rank-drop/index.html'))
    if 'src/family-jiu-jitsu.html' in names:
        candidate = DIST_ROOT / 'family-jiu-jitsu' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'family-jiu-jitsu/index.html'))
    if 'src/rural-bjj-catskills.html' in names:
        candidate = DIST_ROOT / 'rural-bjj-catskills.html'
        if candidate.is_file():
            outputs.add((candidate, 'rural-bjj-catskills.html'))
    for asset in ('assets/730dd3cb-0f20-425a-8771-431897ef21d9.png','assets/730dd3cb-0f20-425a-8771-431897ef21d9.webp'):
        if asset in names: outputs.add((ROOT / asset, asset))
    if 'data/url-registry.json' in names:
        for candidate in (DIST_ROOT / 'bjj-classes').rglob('*.html'):
            if candidate.is_file():
                outputs.add((candidate, candidate.relative_to(DIST_ROOT).as_posix()))
        for candidate in (DIST_ROOT / 'sources').rglob('*.html'):
            if candidate.is_file():
                outputs.add((candidate, candidate.relative_to(DIST_ROOT).as_posix()))
        for candidate in (DIST_ROOT / 'members').rglob('*.html'):
            if candidate.is_file():
                outputs.add((candidate, candidate.relative_to(DIST_ROOT).as_posix()))
        for rf in ('waiver.html', 'scribners-thank-you.html'):
            candidate = DIST_ROOT / rf
            if candidate.is_file():
                outputs.add((candidate, rf))
    if 'tools/build-home-styles.mjs' in names:
        candidate = DIST_ROOT / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('home-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if ('tools/build-schedule-styles.mjs' in names or
            any(name in names for name in ('src/schedule.html',
                                           'src/assets/css/pages/schedule.css',
                                           'src/assets/css/pages/schedule.min.css'))):
        candidate = DIST_ROOT / 'schedule' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'schedule/index.html'))
            outputs.add((candidate, 'schedule.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('schedule-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if 'tools/build-glossary-styles.mjs' in names:
        candidate = DIST_ROOT / 'bjj-glossary' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'bjj-glossary/index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('glossary-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if 'tools/build-directions-styles.mjs' in names:
        candidate = DIST_ROOT / 'bjj-tannersville-ny-directions.html'
        if candidate.is_file():
            outputs.add((candidate, 'bjj-tannersville-ny-directions.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('directions-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if 'tools/build-tannersville-styles.mjs' in names:
        candidate = DIST_ROOT / 'bjj-classes' / 'tannersville-ny' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'bjj-classes/tannersville-ny/index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('tannersville-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if 'tools/build-visit-styles.mjs' in names:
        candidate = DIST_ROOT / 'visit' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'visit/index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('visit-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if ('tools/build-instagram-styles.mjs' in names or
            'src/assets/css/pages/instagram.css' in names):
        candidate = DIST_ROOT / 'instagram' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'instagram/index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('instagram-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if 'tools/build-free-intro-styles.mjs' in names:
        candidate = DIST_ROOT / 'free-bjj-intro-tannersville-ny' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'free-bjj-intro-tannersville-ny/index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('free-intro-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if ('tools/build-options-pricing-styles.mjs' in names or
            'src/assets/css/pages/options-pricing-highend.css' in names):
        html_c = DIST_ROOT / 'options-pricing.html'
        dir_c = DIST_ROOT / 'options-pricing' / 'index.html'
        if html_c.is_file():
            outputs.add((html_c, 'options-pricing.html'))
        if dir_c.is_file():
            outputs.add((dir_c, 'options-pricing/index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('options-pricing-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if 'tools/build-bjj-classes-styles.mjs' in names:
        candidate = DIST_ROOT / 'bjj-classes' / 'index.html'
        if candidate.is_file():
            outputs.add((candidate, 'bjj-classes/index.html'))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('bjj-classes-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    if 'tools/build-article-styles.mjs' in names:
        blog_dir = DIST_ROOT / 'blog'
        if blog_dir.is_dir():
            for blog_cand in blog_dir.rglob('index.html'):
                if blog_cand.is_file():
                    outputs.add((blog_cand, blog_cand.relative_to(DIST_ROOT).as_posix()))
        pages_css_dir = DIST_ROOT / 'assets' / 'css' / 'pages'
        if pages_css_dir.is_dir():
            for css_cand in pages_css_dir.glob('article-delivery.*.css'):
                if css_cand.is_file():
                    outputs.add((css_cand, css_cand.relative_to(DIST_ROOT).as_posix()))
    # Asset fingerprint policy changes rewrite generated HTML sitewide. Include
    # the resulting deployable HTML and JS payload even though dist/ is ignored.
    fingerprint_release = 'tools/fingerprint-assets.cjs' in names
    schema_release = 'src/_includes/components/structured-data.njk' in names
    sitewide_release = ('eleventy.config.js' in names or
                        'footer-include.html' in names or
                        'src/_includes/layouts/base.njk' in names or
                        'src/_includes/components/footer.njk' in names or
                        'src/_includes/components/free-intro-process.njk' in names or
                        'src/_includes/footer-high-intent.html' in names)
    glossary_release = '.gitignore' in names and (ROOT / 'src' / 'bjj-glossary').is_dir()
    manifest_file = DIST_ROOT.parent / 'src/assets/data/asset-hash-manifest.json'
    manifest = json.loads(manifest_file.read_text()).get('assets', {}) if manifest_file.is_file() else {}

    # The shared Near stylesheet is fingerprinted and consumed by all nearby
    # town routes, the legacy nearby-towns page, and the BJJ classes hub's
    # inline delivery bundle. Use the manifest beside the selected build.
    if 'src/assets/css/pages/near.css' in names:
        active_near_css = manifest.get('/assets/css/pages/near.css')
        if not active_near_css:
            raise ValueError('Near CSS release requires its active manifest fingerprint')
        near_css_path = DIST_ROOT / active_near_css.lstrip('/')
        if not near_css_path.is_file():
            raise ValueError(f'Near CSS release is missing active asset {active_near_css}')
        outputs.add((near_css_path, near_css_path.relative_to(DIST_ROOT).as_posix()))
        matched_routes = 0
        for candidate in DIST_ROOT.rglob('*.html'):
            rel = candidate.relative_to(DIST_ROOT).as_posix()
            if rel not in ROOT_FILES and not rel.startswith(DEPLOYABLE_ROOTS):
                continue
            html = candidate.read_text(encoding='utf-8', errors='ignore')
            if active_near_css in html:
                outputs.add((candidate, rel))
                matched_routes += 1
        bjj_classes_page = DIST_ROOT / 'bjj-classes' / 'index.html'
        if not bjj_classes_page.is_file():
            raise ValueError('Near CSS release requires the BJJ classes page with its inline delivery bundle')
        outputs.add((bjj_classes_page, 'bjj-classes/index.html'))
        if not matched_routes:
            raise ValueError('Near CSS release found no deployable routes using its active fingerprint')

    # The shared glossary stylesheet is fingerprinted and consumed by many
    # generated term routes. A source-only CSS change must include every fresh
    # route that references the active fingerprint, not just edited term pages.
    if 'src/assets/css/bjj-glossary.css' in names:
        active_glossary_css = manifest.get('/assets/css/bjj-glossary.css')
        if not active_glossary_css:
            raise ValueError('Glossary CSS release requires its active manifest fingerprint')
        glossary_routes = DIST_ROOT / 'bjj-glossary'
        matched_routes = 0
        if glossary_routes.is_dir():
            for candidate in glossary_routes.rglob('index.html'):
                if candidate.parent == glossary_routes:
                    continue
                html = candidate.read_text(encoding='utf-8', errors='ignore')
                if active_glossary_css in html:
                    outputs.add((candidate, candidate.relative_to(DIST_ROOT).as_posix()))
                    matched_routes += 1
        if not matched_routes:
            raise ValueError('Glossary CSS release found no generated term routes using the active fingerprint')

    # The hub embeds its glossary delivery CSS inline, so a hub stylesheet
    # source change must publish the generated hub page itself.
    if 'src/assets/css/pages/glossary.css' in names:
        candidate = DIST_ROOT / 'bjj-glossary' / 'index.html'
        if not candidate.is_file():
            raise ValueError('Glossary hub CSS release requires a fresh generated hub page')
        outputs.add((candidate, 'bjj-glossary/index.html'))

    for name in names:
        if name.startswith('src/assets/calendar/') and name.endswith('.ics'):
            asset_rel = name[4:]
            candidate = DIST_ROOT / asset_rel
            if candidate.is_file():
                outputs.add((candidate, asset_rel))
        if name in ('src/assets/css/pages/schedule-month-calendar.css', 'src/assets/js/schedule-month-calendar.js'):
            asset_rel = name[4:]
            candidate = DIST_ROOT / asset_rel
            if candidate.is_file():
                outputs.add((candidate, asset_rel))
        if name.startswith('api/'):
            candidate = ROOT / name
            if candidate.is_file():
                outputs.add((candidate, name))
            continue
        if name == 'src/assets/css/pages/options-pricing-highend.css':
            continue
        if name.startswith('src/assets/'):
            asset_rel = name[4:]
            candidate = DIST_ROOT / asset_rel
            if candidate.is_file() and (asset_rel in ROOT_FILES or asset_rel.startswith(DEPLOYABLE_ROOTS)):
                outputs.add((candidate, asset_rel))
            asset_href = '/' + asset_rel
            if asset_href in manifest:
                fingerprinted = manifest[asset_href].lstrip('/')
                candidate_fp = DIST_ROOT / fingerprinted
                if candidate_fp.is_file() and (fingerprinted in ROOT_FILES or fingerprinted.startswith(DEPLOYABLE_ROOTS)):
                    outputs.add((candidate_fp, fingerprinted))
            if asset_rel.endswith('.css') and not asset_rel.endswith('.min.css'):
                min_rel = asset_rel[:-4] + '.min.css'
                candidate_min = DIST_ROOT / min_rel
                if candidate_min.is_file() and (min_rel in ROOT_FILES or min_rel.startswith(DEPLOYABLE_ROOTS)):
                    outputs.add((candidate_min, min_rel))
                min_href = '/' + min_rel
                if min_href in manifest:
                    fingerprinted_min = manifest[min_href].lstrip('/')
                    candidate_min_fp = DIST_ROOT / fingerprinted_min
                    if candidate_min_fp.is_file() and (fingerprinted_min in ROOT_FILES or fingerprinted_min.startswith(DEPLOYABLE_ROOTS)):
                        outputs.add((candidate_min_fp, fingerprinted_min))
            continue
        if name == 'src/partials/pricing-module-fragment.html':
            candidate = DIST_ROOT / 'pricing-module-fragment.html'
            if candidate.is_file(): outputs.add((candidate, 'pricing-module-fragment.html'))
            continue
        if name == 'src/partials/home-conversion-shell.html':
            candidate = DIST_ROOT / 'index.html'
            if candidate.is_file(): outputs.add((candidate, 'index.html'))
            continue
        if name == 'src/partials/program-conversion-adults.html':
            cand = DIST_ROOT / 'bjj-classes' / 'adults-tannersville-ny' / 'index.html'
            if cand.is_file(): outputs.add((cand, 'bjj-classes/adults-tannersville-ny/index.html'))
        if name == 'src/partials/program-conversion-kids.html':
            cand = DIST_ROOT / 'bjj-classes' / 'kids-tannersville-ny' / 'index.html'
            if cand.is_file(): outputs.add((cand, 'bjj-classes/kids-tannersville-ny/index.html'))
        if name == 'src/partials/program-conversion-teens.html':
            cand = DIST_ROOT / 'bjj-classes' / 'teens-tannersville-ny' / 'index.html'
            if cand.is_file(): outputs.add((cand, 'bjj-classes/teens-tannersville-ny/index.html'))
        if name == 'src/partials/footer-include.html':
            candidate = DIST_ROOT / 'footer-include.html'
            if candidate.is_file(): outputs.add((candidate, 'footer-include.html'))
        if name == 'src/partials/nav-include.html':
            candidate = DIST_ROOT / 'nav-include.html'
            if candidate.is_file(): outputs.add((candidate, 'nav-include.html'))
        if name == 'src/partials/cta-footer.html':
            candidate = DIST_ROOT / 'cta-footer.html'
            if candidate.is_file(): outputs.add((candidate, 'cta-footer.html'))
        if name.startswith('src/'):
            if name == 'src/alley-bootcamp/index.html':
                candidate = DIST_ROOT / 'alley-bootcamp' / 'index.html'
                if candidate.is_file(): outputs.add((candidate, 'alley-bootcamp/index.html'))
                continue
            if name == 'src/evidence.html':
                candidate = DIST_ROOT / 'evidence' / 'index.html'
            elif name == 'src/athlete-cross-training.html':
                candidate = DIST_ROOT / 'athlete-cross-training' / 'index.html'
            elif name == 'src/athlete-cross-training/evidence.html':
                candidate = DIST_ROOT / 'athlete-cross-training' / 'evidence' / 'index.html'
            elif name == 'src/schedule.html':
                candidate = DIST_ROOT / 'schedule' / 'index.html'
                if candidate.is_file():
                    outputs.add((candidate, 'schedule/index.html'))
                    outputs.add((candidate, 'schedule.html'))
            elif name in ('src/options-pricing.html', 'src/options-pricing.njk'):
                html_c = DIST_ROOT / 'options-pricing.html'
                dir_c = DIST_ROOT / 'options-pricing' / 'index.html'
                if html_c.is_file():
                    outputs.add((html_c, 'options-pricing.html'))
                if dir_c.is_file():
                    outputs.add((dir_c, 'options-pricing/index.html'))
                continue
            elif name == 'src/about.html':
                html_c = DIST_ROOT / 'about.html'
                dir_c = DIST_ROOT / 'about' / 'index.html'
                if html_c.is_file():
                    outputs.add((html_c, 'about.html'))
                if dir_c.is_file():
                    outputs.add((dir_c, 'about/index.html'))
                continue
            elif name == 'src/fall-practice-reset.html':
                candidate = DIST_ROOT / 'fall-practice-reset' / 'index.html'
            elif name == 'src/hyphen-weekend.html':
                candidate = DIST_ROOT / 'hyphen-weekend' / 'index.html'
            elif name == 'src/school-families-jiu-jitsu.html':
                candidate = DIST_ROOT / 'school-families-jiu-jitsu' / 'index.html'
            elif name == 'src/after-school.html':
                candidate = DIST_ROOT / 'after-school' / 'index.html'
            elif name == 'src/what-is-a-jiu-jitsu-sensei.html':
                candidate = DIST_ROOT / 'what-is-a-jiu-jitsu-sensei' / 'index.html'
            elif name == 'src/jiu-jitsu-terms.html':
                candidate = DIST_ROOT / 'jiu-jitsu-terms' / 'index.html'
            elif name == 'src/bjj-butterfly-guard.html':
                candidate = DIST_ROOT / 'bjj-butterfly-guard' / 'index.html'
            elif name == 'src/bjj-videos.html':
                candidate = DIST_ROOT / 'bjj-videos' / 'index.html'
            elif name == 'src/videos.html':
                candidate = DIST_ROOT / 'videos' / 'index.html'
            elif name == 'src/clean.html':
                candidate = DIST_ROOT / 'clean' / 'index.html'
            elif name == 'src/deer-mountain-inn.html':
                html_c = DIST_ROOT / 'deer-mountain-inn.html'
                dir_c = DIST_ROOT / 'deer-mountain-inn' / 'index.html'
                if html_c.is_file():
                    outputs.add((html_c, 'deer-mountain-inn.html'))
                if dir_c.is_file():
                    outputs.add((dir_c, 'deer-mountain-inn/index.html'))
                continue
            elif name == 'src/phoenicia-diner.html':
                html_c = DIST_ROOT / 'phoenicia-diner.html'
                dir_c = DIST_ROOT / 'phoenicia-diner' / 'index.html'
                if html_c.is_file():
                    outputs.add((html_c, 'phoenicia-diner.html'))
                if dir_c.is_file():
                    outputs.add((dir_c, 'phoenicia-diner/index.html'))
                continue
            elif name == 'src/blog/beginner-friendly-bjj-tannersville-links/index.html':
                candidate = DIST_ROOT / 'blog' / 'beginner-friendly-bjj-tannersville' / 'index.html'
            elif name == 'src/_includes/schedule-master.html':
                candidate = DIST_ROOT / 'schedule' / 'index.html'
                if candidate.is_file():
                    outputs.add((candidate, 'schedule.html'))
            elif name in ('src/_data/tournaments.js', 'src/_includes/partials/tournament-grid.html'):
                cand_fam = DIST_ROOT / 'local-bjj-tournaments-for-families.html'
                if cand_fam.is_file():
                    outputs.add((cand_fam, 'local-bjj-tournaments-for-families.html'))
                cand_par = DIST_ROOT / 'local-bjj-tournaments-for-parents.html'
                if cand_par.is_file():
                    outputs.add((cand_par, 'local-bjj-tournaments-for-parents.html'))
                continue
            elif name.startswith('src/') and name.endswith('.njk'):
                relative = name[4:]
                if relative.endswith('/index.njk'):
                    relative = relative[:-10]
                else:
                    relative = relative[:-4]
                candidate = DIST_ROOT / relative / 'index.html'
            else:
                candidate = DIST_ROOT / name[4:]
        elif name in ROOT_FILES:
            candidate = DIST_ROOT / name
        elif name.startswith(DEPLOYABLE_ROOTS):
            candidate = DIST_ROOT / name
        else:
            continue
        rel = candidate.relative_to(DIST_ROOT).as_posix()
        if rel in ROOT_FILES or rel.startswith(DEPLOYABLE_ROOTS):
            if candidate.is_file(): outputs.add((candidate, rel))
    brand_release = any(
        name.startswith('src/assets/img/brand/') or
        name in ('src/partials/nav-include.html', 'src/partials/footer-include.html',
                 'src/_includes/components/footer.njk', 'src/_includes/footer-high-intent.html')
        for name in names
    )
    if brand_release:
        brand_dir = DIST_ROOT / 'assets' / 'img' / 'brand'
        if brand_dir.is_dir():
            for brand_cand in brand_dir.rglob('*'):
                if brand_cand.is_file():
                    outputs.add((brand_cand, brand_cand.relative_to(DIST_ROOT).as_posix()))
    lineage_release = any(
        name.startswith('src/assets/img/lineage/') or
        name == 'src/blog/bjj-sensei/index.html'
        for name in names
    )
    if lineage_release:
        lineage_dir = DIST_ROOT / 'assets' / 'img' / 'lineage'
        if lineage_dir.is_dir():
            for lineage_cand in lineage_dir.rglob('*'):
                if lineage_cand.is_file():
                    outputs.add((lineage_cand, lineage_cand.relative_to(DIST_ROOT).as_posix()))
    pricing_release = any(
        name in ('src/_data/pricing.json', 'src/options-pricing.njk', 'src/pricing.md')
        for name in names
    )
    if pricing_release:
        for cand_rel in (
            'options-pricing/index.html',
            'options-pricing.html',
            'members/winter-training-plan/index.html',
            'pricing.md',
            'visit/index.html',
        ):
            cand_path = DIST_ROOT / cand_rel
            if cand_path.is_file():
                outputs.add((cand_path, cand_rel))
    if fingerprint_release or sitewide_release:
        for candidate in (DIST_ROOT).rglob('*'):
            if not candidate.is_file(): continue
            rel = candidate.relative_to(DIST_ROOT).as_posix()
            is_js = rel.startswith('js/') or rel.startswith('assets/js/')
            is_css = rel.startswith('assets/css/')
            is_brand = rel.startswith('assets/img/brand/')
            is_site_html = rel.endswith('.html') and (rel in ROOT_FILES or rel.startswith(DEPLOYABLE_ROOTS))
            if is_site_html or is_js or is_css or is_brand or rel == 'assets/data/asset-hash-manifest.json':
                outputs.add((candidate, rel))
    if schema_release:
        for candidate in (DIST_ROOT).rglob('*.html'):
            if not candidate.is_file():
                continue
            rel = candidate.relative_to(DIST_ROOT).as_posix()
            if not (rel in ROOT_FILES or rel.startswith(DEPLOYABLE_ROOTS)):
                continue
            if 'reviewCount' in candidate.read_text(encoding='utf-8', errors='ignore'):
                outputs.add((candidate, rel))

    if glossary_release:
        for candidate in (DIST_ROOT / 'bjj-glossary').rglob('*'):
            if candidate.is_file():
                outputs.add((candidate, candidate.relative_to(DIST_ROOT).as_posix()))
    # Kids CSS is derived from markup, runtime selectors and shared styles, not
    # just kids.css. Conservatively include its page for shared build inputs.
    kids_rel = 'bjj-classes/kids-tannersville-ny/index.html'
    kids_inputs = any(
        name in ('package.json', 'package-lock.json', 'src/tokens.css',
                 'tools/build-kids-styles.mjs', 'tools/build-route-styles.mjs',
                 'tools/materialize-ssi-fragments.mjs') or
        is_shared_style_input(name)
        for name in names
    )
    kids_page = DIST_ROOT / kids_rel
    if requested(kids_rel) and (kids_inputs or any(rel == kids_rel for _, rel in outputs)):
        if not kids_page.is_file():
            raise ValueError('Kids release requires a fresh production build')
        bundles = re.findall(r'href=[\"\']/(assets/css/pages/kids-delivery\.[a-f0-9]{12}\.css)[\"\']',
                             kids_page.read_text(encoding='utf-8'))
        if len(bundles) != 1:
            raise ValueError('Kids release requires exactly one active delivery bundle')
        bundle = DIST_ROOT / bundles[0]
        if not bundle.is_file():
            raise ValueError('Missing active Kids CSS delivery bundle')
        outputs.add((kids_page, kids_rel))
        outputs.add((bundle, bundles[0]))

    # Audience page and route CSS are generated after fingerprinting and are
    # therefore not listed in the source asset manifest. Include each active
    # bundle with its page so an exact release cannot publish a missing link.
    audience_inputs = any(
        name in (
            'package.json', 'package-lock.json',
            'tools/build-audience-styles.mjs', 'tools/build-route-styles.mjs',
            'tools/materialize-ssi-fragments.mjs',
            'src/bjj-classes/teens-tannersville-ny/index.html',
            'src/bjj-classes/adults-tannersville-ny/index.html',
            'src/assets/css/pages/teens.css', 'src/assets/css/pages/adults.css',
        )
        or is_shared_style_input(name)
        for name in names
    )
    if audience_inputs:
        for audience, audience_rel in (
            ('teens', 'bjj-classes/teens-tannersville-ny/index.html'),
            ('adults', 'bjj-classes/adults-tannersville-ny/index.html'),
        ):
            if not requested(audience_rel):
                continue
            audience_page = DIST_ROOT / audience_rel
            if not audience_page.is_file():
                raise ValueError(f'{audience.title()} release requires fresh production build')
            bundles = re.findall(
                rf'href=["\']/(assets/css/pages/{audience}-delivery\.[a-f0-9]{{12}}\.css)["\']',
                audience_page.read_text(encoding='utf-8'),
            )
            if len(bundles) != 1:
                raise ValueError(f'{audience.title()} release requires exactly one active delivery bundle')
            bundle = DIST_ROOT / bundles[0]
            if not bundle.is_file():
                raise ValueError(f'Missing active {audience.title()} CSS delivery bundle')
            route_bundles = re.findall(
                rf'href=["\']/(assets/css/routes/site-{audience}-delivery\.[a-f0-9]{{12}}\.css)["\']',
                audience_page.read_text(encoding='utf-8'),
            )
            if len(route_bundles) != 1:
                raise ValueError(f'{audience.title()} release requires exactly one active route CSS delivery bundle')
            route_bundle = DIST_ROOT / route_bundles[0]
            if not route_bundle.is_file():
                raise ValueError(f'Missing active {audience.title()} route CSS delivery bundle')
            outputs.add((audience_page, audience_rel))
            outputs.add((bundle, bundles[0]))
            outputs.add((route_bundle, route_bundles[0]))
    return sorted(outputs, key=lambda item: (1 if item[1].endswith('.html') else 0, item[1]))

def connect(cfg):
    client = paramiko.SSHClient(); client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(cfg['host'], port=int(cfg['port']), username=cfg['username'], password=cfg['password'], timeout=45, banner_timeout=45, auth_timeout=45)
    return client

def upload_one(client, cfg, local, rel):
    remote = posixpath.join(cfg['remotePath'], rel); temp = remote + '.codex-upload'
    parent = posixpath.dirname(remote)
    command = f"mkdir -p {shlex.quote(parent)} && rm -f {shlex.quote(temp)} && cat > {shlex.quote(temp)} && mv -f {shlex.quote(temp)} {shlex.quote(remote)} && stat -c %s {shlex.quote(remote)}"
    stdin, stdout, stderr = client.exec_command(command, timeout=180)
    try:
        data = local.read_bytes()
        stdin.write(data)
        stdin.flush()
        stdin.close()
        out = stdout.read().decode(errors='replace')
        err = stderr.read().decode(errors='replace')
        if stdout.channel.recv_exit_status() != 0: raise RuntimeError(err or out)
        return out.strip()
    finally:
        try:
            stdout.channel.close()
        except Exception:
            pass

def remote_run(client, command, timeout=600):
    _, stdout, stderr = client.exec_command(command, timeout=600)
    channel = stdout.channel
    deadline = time.monotonic() + timeout
    chunks = []
    while True:
        if channel.recv_ready(): chunks.append(channel.recv(65536))
        if channel.exit_status_ready() and not channel.recv_ready(): break
        if time.monotonic() >= deadline:
            channel.close()
            raise TimeoutError(f'remote command timed out: {command}')
        time.sleep(0.2)
    out = b''.join(chunks).decode(errors='replace')
    err = stderr.read().decode(errors='replace')
    if stdout.channel.recv_exit_status() != 0: raise RuntimeError(err or out)
    return out

def backup_inventory(client, cfg):
    home = '/home/' + cfg['username']
    commands = {
        'home': f"find {shlex.quote(home)} -maxdepth 1 -type f -name 'senseisandy-predeploy-*.tar.gz' -printf '%T@ %s %p\\n' | sort -n",
        'tmp': f"find {shlex.quote(home + '/.cagefs/tmp')} -maxdepth 1 -type f -name 'senseisandy-predeploy-*.tar.gz' -printf '%T@ %s %p\\n' | sort -n",
    }
    inventory = []
    for location, command in commands.items():
        for line in remote_run(client, command).splitlines():
            parts = line.split(' ', 2)
            if len(parts) != 3:
                continue
            mtime, size, path = parts
            if not BACKUP_NAME.fullmatch(pathlib.PurePosixPath(path).name):
                continue
            inventory.append({'location': location, 'mtime': float(mtime), 'size': int(size), 'path': path})
    return inventory

def cleanup_remote_backups(client, cfg, cleanup=False, stale_seconds=86400):
    now = time.time(); inventory = backup_inventory(client, cfg)
    invalid = []
    for item in inventory:
        try:
            members = set(remote_run(client, f"gzip -t {shlex.quote(item['path'])} && tar -tzf {shlex.quote(item['path'])}").splitlines())
            missing = REQUIRED_BACKUP_MEMBERS - members
            if missing:
                raise RuntimeError(f"backup missing required files: {', '.join(sorted(missing))}")
        except RuntimeError:
            invalid.append(item)
    invalid_paths = {item['path'] for item in invalid}
    home = sorted((x for x in inventory if x['location'] == 'home' and x['path'] not in invalid_paths), key=lambda x: x['mtime'], reverse=True)
    remove = []
    for item in invalid:
        remove.append((item, 'invalid-archive'))
    # The provider temp directory is not part of the active web root. Its old
    # predeploy archives are staging leftovers and are safe to clear exactly.
    for item in inventory:
        if item['location'] == 'tmp' and now - item['mtime'] >= stale_seconds:
            remove.append((item, 'stale-provider-temp'))
    # Keep one newest top-level archive as the prior rollback point. The next
    # fresh backup will restore the two-archive rotation after deployment.
    for item in home[1:]:
        remove.append((item, 'older-top-level-rotation'))
    print(f'backup_qa_found={len(inventory)} backup_qa_invalid={len(invalid)} backup_qa_remove={len(remove)} cleanup={cleanup}', flush=True)
    for item, reason in remove:
        print(f"backup_qa_{'removed' if cleanup else 'candidate'}={item['path']} reason={reason} bytes={item['size']}", flush=True)
        if cleanup:
            home_root = '/home/' + cfg['username']
            allowed = (home_root + '/', home_root + '/.cagefs/tmp/')
            if not item['path'].startswith(allowed):
                raise RuntimeError(f"refusing backup path outside account: {item['path']}")
            remote_run(client, f"rm -- {shlex.quote(item['path'])}")
    return inventory, remove

def backup_remote(client, cfg):
    home = '/home/' + cfg['username']; remote = cfg['remotePath']; stamp = time.strftime('%Y%m%dT%H%M%SZ', time.gmtime()); backup = f'{home}/senseisandy-predeploy-{stamp}.tar.gz'; temp = f'{home}/.senseisandy-predeploy-{stamp}.tar.gz.part'
    cleanup_remote_backups(client, cfg, cleanup=True)
    archive_cmd = f"rm -f {shlex.quote(temp)} && trap 'rm -f {shlex.quote(temp)}' EXIT && timeout --signal=TERM --kill-after=30s 900s tar --exclude=./.venv -I 'gzip -1' -cf {shlex.quote(temp)} -C {shlex.quote(remote)} . && gzip -t {shlex.quote(temp)} && tar -tzf {shlex.quote(temp)} >/dev/null && mv -f {shlex.quote(temp)} {shlex.quote(backup)}"
    remote_run(client, archive_cmd, timeout=1200)
    archive_listing = remote_run(client, f"tar -tzf {shlex.quote(backup)}")
    present = set(archive_listing.splitlines())
    missing = sorted(REQUIRED_BACKUP_MEMBERS - present)
    if missing: raise RuntimeError(f'backup missing required files: {", ".join(missing)}')
    print(f'backup_verified={backup} files={len(archive_listing.splitlines())}', flush=True)
    return backup

def newest_verified_home_backup(inventory, removal_candidates):
    removed_paths = {item['path'] for item, _ in removal_candidates}
    candidates = [item for item in inventory
                  if item['location'] == 'home' and item['path'] not in removed_paths]
    return max(candidates, key=lambda item: item['mtime']) if candidates else None

def prepare_deploy_backup(client, cfg, reuse_existing=False):
    if not reuse_existing:
        return backup_remote(client, cfg)
    inventory, removal_candidates = cleanup_remote_backups(client, cfg, cleanup=False)
    selected = newest_verified_home_backup(inventory, removal_candidates)
    if selected is None:
        raise RuntimeError('No currently verified account-level backup exists for --reuse-existing-backup.')
    print(f"backup_reused={selected['path']} mtime={selected['mtime']} bytes={selected['size']}", flush=True)
    return selected['path']

def verify_local_backup(path):
    backup = pathlib.Path(path).expanduser().resolve()
    if not backup.is_file():
        raise RuntimeError(f'local backup not found: {backup}')
    required_sets = ({'./.htaccess', './index.html', './robots.txt', './sitemap.xml'},
                     {'public_html/.htaccess', 'public_html/index.html', 'public_html/robots.txt', 'public_html/sitemap.xml'})
    with tarfile.open(backup, mode='r:gz') as archive:
        present = set(archive.getnames())
    if not any(required <= present for required in required_sets):
        raise RuntimeError('local backup missing required production root files')
    print(f'local_backup_verified={backup} bytes={backup.stat().st_size}', flush=True)

def main():
    global DIST_ROOT
    parser = argparse.ArgumentParser(); parser.add_argument('--commit', default='HEAD'); parser.add_argument('--config', default='.vscode/sftp.json'); parser.add_argument('--dist-dir', default=str(DIST_ROOT), help='generated output directory to deploy from (default: repository dist/)'); parser.add_argument('--dry-run', action='store_true'); parser.add_argument('--retries', type=int, default=3); parser.add_argument('--local-backup', help='use an independently verified full backup when remote quota prevents a second copy'); parser.add_argument('--reuse-existing-backup', action='store_true', help='reuse the newest verified account-level archive instead of creating a fresh snapshot'); parser.add_argument('--qa-backups', action='store_true'); parser.add_argument('--cleanup', action='store_true'); parser.add_argument('--only', action='append', default=[], help='limit upload to these exact deploy-relative paths; repeatable'); args = parser.parse_args()
    DIST_ROOT = pathlib.Path(args.dist_dir).expanduser().resolve()
    if not DIST_ROOT.is_dir():
        parser.error(f'generated output directory does not exist: {DIST_ROOT}')
    if args.local_backup and args.reuse_existing_backup: parser.error('--local-backup and --reuse-existing-backup cannot be combined')
    cfg = json.loads((ROOT / args.config).read_text())
    if args.qa_backups:
        client = connect(cfg)
        try:
            cleanup_remote_backups(client, cfg, cleanup=args.cleanup)
        finally:
            client.close()
        return
    files = changed_outputs(args.commit, args.only)
    if args.only:
        allowed = set(args.only)
        files = [item for item in files if item[1] in allowed]
        if not files and args.commit == 'HEAD':
            staged = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=ROOT, text=True).splitlines()
            if 'src/schedule.html' in staged:
                candidate = DIST_ROOT / 'schedule' / 'index.html'
                if candidate.is_file() and 'schedule/index.html' in allowed:
                    files.append((candidate, 'schedule/index.html'))
            for name in staged:
                if name.startswith('src/assets/calendar/') and name.endswith('.ics') or name in ('src/assets/css/pages/schedule-month-calendar.css', 'src/assets/js/schedule-month-calendar.js'):
                    rel = name[4:]
                    candidate = DIST_ROOT / rel
                    if candidate.is_file() and rel in allowed:
                        files.append((candidate, rel))
            files = sorted(set(files), key=lambda item: (1 if item[1].endswith('.html') else 0, item[1]))
    print(f'payload_files={len(files)} commit={args.commit}')
    for _, rel in files: print(rel)
    if args.dry_run: return
    if not files: raise SystemExit('No deployable generated outputs changed by commit.')
    client = None; backup_done = False
    if args.local_backup:
        verify_local_backup(args.local_backup)
        backup_done = True
    try:
        for local, rel in files:
            for attempt in range(1, args.retries + 1):
                try:
                    if client is None or not client.get_transport() or not client.get_transport().is_active():
                        client = connect(cfg)
                        if not backup_done:
                            prepare_deploy_backup(client, cfg, reuse_existing=args.reuse_existing_backup)
                            backup_done = True
                    print(f'upload {rel} attempt={attempt}', flush=True); print(f'remote_bytes={upload_one(client, cfg, local, rel)}', flush=True); break
                except Exception as error:
                    if client: client.close()
                    client = None
                    if attempt == args.retries: raise
                    print(f'retry {rel}: {error}', flush=True); time.sleep(2)
    finally:
        if client: client.close()

if __name__ == '__main__': main()
