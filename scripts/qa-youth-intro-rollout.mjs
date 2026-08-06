import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const businessData = JSON.parse(read('data/business-data.json'));
const failures = [];
const requireText = (file, text, label = text) => { if (!read(file).includes(text)) failures.push(`${file}: missing ${label}`); };

const page = 'free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny/index.html';
const form = read(page);
const requiredFields = ['studentType', 'guardianName', 'studentName', 'studentAge', 'town', 'email', 'mobile', 'messageConsent', 'priorExperience', 'mainGoal', 'participationNotes', 'loanerGi', 'preferredDate', 'ageLane', 'onsite', 'arrival', 'mediaChoice', 'reschedule'];
requiredFields.forEach((field) => requireText(page, `name="${field}"`, `required field ${field}`));
['Free Beginner Jiu-Jitsu Intro', '$0', 'No card required', 'One 45-minute class', '60–75 min', '$550 for 12 weeks', 'Reserve Your Free Intro', 'Parent outcomes', 'Access to every scheduled class', 'A reserved Core Culture seat', 'A promise of confidence after one session'].forEach((text) => { if (!form.includes(text)) failures.push(`${page}: missing offer text ${text}`); });
requireText(page, 'rel="canonical"', 'self-referencing canonical');
requireText(page, 'application/ld+json', 'structured data');
requireText(page, 'BreadcrumbList', 'breadcrumb structured data');
requireText(page, 'LocalBusiness', 'local business structured data');
if (form.includes('"@type":"Event"') || form.includes('"@type": "Event"')) failures.push(`${page}: recurring availability must not use Event structured data`);
requireText('js/youth-intro-form.js', "funnel = 'youth_intro'", 'youth funnel marker');
requireText('api/v1/leads.php', 'lead_request_keys', 'idempotency protection');
requireText('api/lib/db.php', 'message_consent_at', 'consent timestamp persistence');
requireText('api/v1/youth_intro_records.php', 'checklist', 'admin checklist gating');
requireText('api/v1/youth_intro_records.php', 'ss_create_intro_booking', 'confirmed booking creation');
requireText('api/v1/youth_intro_records.php', 'verified waiver', 'confirmation waiver gate');
requireText('api/v1/youth_intro_messages.php', 'waiver_completed', 'waiver message gate');
requireText('api/v1/youth_intro_messages.php', 'reschedule_count', 'server-side reschedule gate');
requireText('api/v1/youth_intro_records.php', 'rescheduleCount', 'admin reschedule control');
requireText('js/youth-intro-form.js', 'alternate_route', 'returning and visitor routing');
requireText('js/youth-intro-form.js', "track('intro_form_submit')", 'form submit analytics');
requireText('api/v1/youth_intro_records.php', "intro_appointment_booked", 'operational booking analytics');
requireText('api/v1/youth_intro_records.php', "core_enrolled", 'operational enrollment analytics');
requireText('api/v1/youth_intro_messages.php', 'message_delivery_failed', 'failed-delivery alert path');
requireText('api/v1/youth_intro_confirm.php', "['CONFIRM', 'STOP']", 'inbound confirmation and opt-out gate');
requireText('api/v1/youth_intro_confirm.php', "'STOP'", 'inbound opt-out gate');
requireText('config/youth-intro-message-templates.json', 'Reply STOP', 'message opt-out language');
requireText('api/index.php', "case 'youth-intro/confirm'", 'confirmation webhook route');
requireText('api/index.php', "case 'youth-intro/report'", 'cohort report route');
requireText('api/v1/youth_intro_report.php', 'attendedCount', 'first-20 cohort report');
requireText('api/v1/waivers.php', 'ss_require_ops_auth();', 'protected waiver reads');
requireText('config/youth-intro-availability.json', 'weeklyIntroLimit', 'weekly availability limit');
requireText('content/offers.json', 'free-youth-intro', 'centralized youth offer configuration');
requireText('pages-sitemap.xml', 'free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny', 'sitemap entry');
['bjj-classes/kids-tannersville-ny/index.html', 'bjj-classes/teens-tannersville-ny/index.html', 'after-school.html', 'parent-resources.html', 'index.html'].forEach((file) => requireText(file, 'free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny', 'youth CTA route'));
for (const entry of fs.readdirSync(path.join(root, 'bjj-classes'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const townPage = path.join('bjj-classes', entry.name, 'index.html');
  if (!fs.existsSync(path.join(root, townPage))) continue;
  const townHtml = read(townPage);
  if (/data-cta-src="tannersville-(?:youth|teen)-card"[^>]*href="\/free-bjj-intro-tannersville-ny/.test(townHtml)) failures.push(`${townPage}: youth town lane still routes to general intro`);
}

const expiry = new Date('2026-08-03T00:00:00-04:00');
if (new Date() < expiry && businessData.campaigns?.christmas_in_july?.active !== true) failures.push('data/business-data.json: campaign must remain active before August 3, 2026');
if (new Date() >= expiry && businessData.campaigns?.christmas_in_july?.active === true) failures.push('data/business-data.json: expired campaign remains active after August 2, 2026');
if (new Date() >= expiry) {
  ['index.html', 'bjj-classes/kids-tannersville-ny/index.html', 'bjj-classes/teens-tannersville-ny/index.html', 'options-pricing.html', 'holiday-schedule.html', 'free-bjj-intro-tannersville-ny/index.html', 'catskills-home-base.html'].forEach((file) => {
    if (fs.existsSync(path.join(root, file)) && /christmas in july|christmas-in-july|through august 2/i.test(read(file))) failures.push(`${file}: expired Christmas in July campaign still present`);
  });
}

if (failures.length) { failures.forEach((failure) => console.error(`YOUTH INTRO QA FAIL: ${failure}`)); process.exit(1); }
console.log(`Youth intro rollout QA passed (${requiredFields.length} form fields, CTA routes, API gates, sitemap, and date-aware campaign check).`);
