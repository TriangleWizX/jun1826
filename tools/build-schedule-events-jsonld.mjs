import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SCHEDULE_DATA_PATH = path.join(ROOT, 'assets/data/schedule.json');
const SCHEDULE_PAGE_PATH = path.join(ROOT, 'schedule.html');
const STUDIO_PAGE_PATH = path.join(ROOT, 'sensei-studio.html');
const NEARBY_TOWNS_PATH = path.join(ROOT, 'nearby-towns.html');
const STUDENT_HUB_PATH = path.join(ROOT, 'student-hub.html');
const SCHOOL_FAMILIES_PATH = path.join(ROOT, 'school-families-jiu-jitsu.html');
const TIMEZONE = 'America/New_York';
const HORIZON_DAYS = 28;

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday'
};
const DAY_SHORT = {
  mon: 'MON',
  tue: 'TUE',
  wed: 'WED',
  thu: 'THU',
  fri: 'FRI',
  sat: 'SAT',
  sun: 'SUN'
};
const STUDIO_PLACE = {
  '@type': 'Place',
  name: 'Sensei Sandy BJJ',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '6045 Main Street, 2nd Floor Studio',
    addressLocality: 'Tannersville',
    addressRegion: 'NY',
    postalCode: '12485',
    addressCountry: 'US'
  }
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const pad = (value) => String(value).padStart(2, '0');

const toMinutes = (value) => {
  const [hours, minutes] = String(value).split(':').map(Number);
  return (hours * 60) + minutes;
};

const formatTime = (value) => {
  const [rawHour, rawMinute] = String(value).split(':').map(Number);
  const suffix = rawHour >= 12 ? 'PM' : 'AM';
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(rawMinute).padStart(2, '0')} ${suffix}`;
};

const formatRange = (startTime, endTime) => `${formatTime(startTime)}-${formatTime(endTime)}`;

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const parseShortOffset = (value) => {
  const match = String(value).trim().match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) throw new Error(`Unsupported timezone offset: ${value}`);
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] || '0');
  return sign * ((hours * 60) + minutes);
};

const getOffsetMinutes = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit'
  }).formatToParts(date);
  const zone = parts.find((part) => part.type === 'timeZoneName')?.value;
  if (!zone) throw new Error(`Could not derive offset for timezone ${timeZone}`);
  return parseShortOffset(zone);
};

const getTodayPartsInZone = (now, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const lookup = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
  );
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day)
  };
};

const shiftYmd = (year, month, day, days) => {
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
};

const weekdayFromYmd = (year, month, day) => {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 ? 7 : weekday;
};

const toUtcMillisForZoneLocal = (year, month, day, hour, minute, timeZone) => {
  const approxUtcMillis = Date.UTC(year, month - 1, day, hour, minute);
  const offset = getOffsetMinutes(new Date(approxUtcMillis), timeZone);
  return approxUtcMillis - (offset * 60 * 1000);
};

const loadSchedule = async () => JSON.parse(await fs.readFile(SCHEDULE_DATA_PATH, 'utf8'));

const getActiveSlots = (schedule) => schedule.slots.filter((slot) => slot.active);
const getPublicGroupSlots = (schedule) =>
  schedule.slots.filter((slot) => slot.active && slot.type === 'group');
const getVisibleSlotsForDay = (schedule, day) =>
  schedule.slots
    .filter((slot) => slot.active && slot.day === day)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

const slotBadge = (slot) => {
  if (slot.type === 'private') return { text: 'Private', tone: 'b--mix' };
  if (slot.giNoGi === 'nogi' || slot.notes === 'No-Gi') return { text: 'No-Gi', tone: 'b--nogi' };
  return null;
};

const slotCategory = (slot) => {
  if (slot.type === 'private') return 'morning';
  if (slot.giNoGi === 'nogi' || slot.notes === 'No-Gi') return 'nogi';
  return slot.ageLane === 'youth' ? 'youth' : 'adults';
};

const slotDisplayName = (slot) => {
  if (slot.type === 'private') return 'Private Lesson';
  if (slot.notes === 'No-Gi') return `${slot.displayLabel} No-Gi`;
  return slot.displayLabel;
};

const schedulePageGrid = (schedule) => {
  const days = DAY_ORDER.filter((day) => getVisibleSlotsForDay(schedule, day).length);
  const cards = days.map((day) => {
    const slots = getVisibleSlotsForDay(schedule, day).map((slot) => {
      const badge = slotBadge(slot);
      const visitorText = slot.visitorEligible ? 'Visitor friendly' : 'Private by request';
      return `          <li class="ss-day-slot-item" data-category="${slotCategory(slot)}">
            <div class="ss-slot-time">
              <span class="ss-slot-time-text">${escapeHtml(formatTime(slot.startTime).toLowerCase())}</span>
            </div>
            <div class="ss-slot-main">
              <div class="ss-slot-name-row">
                <p class="ss-slot-name-text">${escapeHtml(slotDisplayName(slot))}</p>
                ${badge ? `<span class="ss-slot-badge ${badge.tone}">${escapeHtml(badge.text)}</span>` : ''}
              </div>
              <p class="ss-slot-meta">${escapeHtml(visitorText)} · ${escapeHtml(formatRange(slot.startTime, slot.endTime))}</p>
            </div>
            <a class="ss-slot-cta" href="${escapeHtml(slot.bookingUrl)}">${slot.type === 'private' ? 'Ask About Private Lessons' : 'Reserve Free Intro'}</a>
          </li>`;
    }).join('\n');
    const note = schedule.days?.[day]?.note || '';
    return `      <article class="ss-day-card">
        <div class="ss-day-card-header">
          <div>
            <p class="ss-day-label">${DAY_LABELS[day]}</p>
            <p class="ss-day-note">${escapeHtml(note)}</p>
          </div>
        </div>
        <ul class="ss-day-slot-list">
${slots}
        </ul>
      </article>`;
  }).join('\n');

  return `<div class="ss-filter-explainer-wrapper">
  <p class="ss-filter-explainer" id="ss-filter-explainer-text">Morning availability is private lessons only. Evening youth and adult classes, plus Saturday Adult No-Gi, are open to visitors.</p>
</div>
<div class="ss-schedule-grid-shell">
${cards}
</div>`;
};

const studioBento = (schedule) => {
  const rows = DAY_ORDER.filter((day) => getVisibleSlotsForDay(schedule, day).length).map((day) => {
    const visible = getVisibleSlotsForDay(schedule, day).map((slot) => {
      const suffix = slot.notes === 'No-Gi' ? ' No-Gi' : '';
      const label = slot.type === 'private' ? 'Private Lesson' : `${slot.displayLabel}${suffix}`;
      return `${formatTime(slot.startTime)} ${label}`;
    }).join(' · ');
    return `<div class="bento-schedule-row"><span class="bento-sched-day">${DAY_SHORT[day]}</span><span class="bento-sched-class">${escapeHtml(visible)}</span></div>`;
  }).join('');

  return `<div class="bento-schedule-list">${rows}</div>`;
};

const studioCurrentSchedule = (schedule) => {
  const days = DAY_ORDER.filter((day) => getVisibleSlotsForDay(schedule, day).length).map((day) => {
    const items = getVisibleSlotsForDay(schedule, day).map((slot) => {
      const label = slot.type === 'private'
        ? 'Private Lesson'
        : slot.notes === 'No-Gi'
          ? `${slot.displayLabel} No-Gi`
          : slot.ageLane === 'youth'
            ? 'Youth'
            : 'Adults';
      return `<li><span class="event-time">${escapeHtml(formatTime(slot.startTime))}</span><span class="event-name">${escapeHtml(label)}</span></li>`;
    }).join('');
    return `<div class="ss-schedule-day"><div class="ss-day-header">${DAY_SHORT[day]}</div><ul class="ss-day-events">${items}</ul></div>`;
  }).join('');

  return `<!-- 4. CURRENT SCHEDULE SECTION --><section class="ss-schedule-section" aria-labelledby="schedule-title"><div class="ss-section-header"><h2 id="schedule-title">Current Schedule</h2></div><div class="ss-schedule-grid">${days}</div><div class="ss-schedule-footer"><a href="/schedule" class="ss-schedule-link" data-leo-event="leo_nearby_full_schedule_click"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>View full schedule</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px; margin-left: 0.15rem;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a></div></section>`;
};

const scheduleBlock = (schedule) => {
  const rows = DAY_ORDER.filter((day) => getVisibleSlotsForDay(schedule, day).length).map((day) => {
    const items = getVisibleSlotsForDay(schedule, day).map((slot) => {
      const label = slot.type === 'private'
        ? 'Private Lesson'
        : slot.notes === 'No-Gi'
          ? `${slot.displayLabel} No-Gi`
          : slot.displayLabel;
      return `<li class="mb-1"><span class="fw-semibold">${escapeHtml(formatTime(slot.startTime))}</span> ${escapeHtml(label)}</li>`;
    }).join('');
    return `<div class="col-md-6 col-lg-4"><div class="border rounded-4 h-100 p-3 bg-white"><h3 class="h6 text-uppercase text-muted mb-3">${DAY_LABELS[day]}</h3><ul class="list-unstyled mb-0">${items}</ul></div></div>`;
  }).join('');

  return `<section class="schedule-block py-4"><div class="container"><div class="row g-3">${rows}</div><p class="small text-muted mt-3 mb-0">Morning availability is private lessons only. Youth and adult evening classes plus Saturday Adult No-Gi remain visitor-eligible.</p></div></section>`;
};

const currentSchedulePartial = (schedule) =>
  DAY_ORDER.filter((day) => getVisibleSlotsForDay(schedule, day).length).map((day) => {
    const items = getVisibleSlotsForDay(schedule, day).map((slot) => {
      const label = slot.type === 'private'
        ? 'Private Lesson'
        : slot.notes === 'No-Gi'
          ? `${slot.displayLabel} No-Gi`
          : slot.displayLabel;
      return `${formatTime(slot.startTime)} ${label}`;
    }).join(', ');
    return `<p>${DAY_LABELS[day]}: ${escapeHtml(items)}</p>`;
  }).join('\n');

const faqJson = `{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What are the BJJ class times in Tannersville, NY?","acceptedAnswer":{"@type":"Answer","text":"Youth classes run Monday, Tuesday, Wednesday, and Friday at 5:00 PM. Adult classes run Monday, Tuesday, Wednesday, and Friday at 6:00 PM. Saturday Adult No-Gi starts at 10:30 AM. Morning availability is private lessons only on Tuesday and Thursday at 6:30 AM and Wednesday and Friday at 10:00 AM."}},{"@type":"Question","name":"Which classes are visitor-eligible?","acceptedAnswer":{"@type":"Answer","text":"Visitors can join all active evening youth and adult classes plus Saturday Adult No-Gi. Morning availability is reserved for private lessons."}},{"@type":"Question","name":"Can I reschedule?","acceptedAnswer":{"@type":"Answer","text":"Yes. Text Sandy anytime if your plans shift."}},{"@type":"Question","name":"What should I wear to Brazilian Jiu-Jitsu class?","acceptedAnswer":{"@type":"Answer","text":"Wear athletic gear you can move in. If you have a gi, bring it. If not, start in a t-shirt and shorts and we will guide you on day one."}}]}`;

const buildEventsJsonLd = (schedule) => {
  const now = new Date();
  const today = getTodayPartsInZone(now, TIMEZONE);
  const slotsByDow = new Map();

  for (const slot of getPublicGroupSlots(schedule)) {
    const dow = DAY_ORDER.indexOf(slot.day) + 1;
    if (!slotsByDow.has(dow)) slotsByDow.set(dow, []);
    slotsByDow.get(dow).push(slot);
  }

  const events = [];

  for (let dayOffset = 0; dayOffset < HORIZON_DAYS; dayOffset += 1) {
    const current = shiftYmd(today.year, today.month, today.day, dayOffset);
    const weekday = weekdayFromYmd(current.year, current.month, current.day);
    const slots = slotsByDow.get(weekday) || [];

    for (const slot of slots) {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      const startUtcMillis = toUtcMillisForZoneLocal(
        current.year,
        current.month,
        current.day,
        startHour,
        startMinute,
        TIMEZONE
      );
      if (startUtcMillis <= now.getTime()) continue;
      const endUtcMillis = toUtcMillisForZoneLocal(
        current.year,
        current.month,
        current.day,
        endHour,
        endMinute,
        TIMEZONE
      );
      const startOffset = getOffsetMinutes(new Date(startUtcMillis), TIMEZONE);
      const endOffset = getOffsetMinutes(new Date(endUtcMillis), TIMEZONE);
      const ymd = `${current.year}${pad(current.month)}${pad(current.day)}`;
      const name = slotDisplayName(slot);
      const slug = slugify(name);
      const isoDate = `${current.year}-${pad(current.month)}-${pad(current.day)}`;
      const toIso = (utcMillis, offsetMinutes) => {
        const offsetSign = offsetMinutes >= 0 ? '+' : '-';
        const absOffset = Math.abs(offsetMinutes);
        const offsetHours = pad(Math.floor(absOffset / 60));
        const offsetMins = pad(absOffset % 60);
        const zoned = new Date(utcMillis + (offsetMinutes * 60 * 1000));
        return `${zoned.getUTCFullYear()}-${pad(zoned.getUTCMonth() + 1)}-${pad(zoned.getUTCDate())}T${pad(zoned.getUTCHours())}:${pad(zoned.getUTCMinutes())}:00${offsetSign}${offsetHours}:${offsetMins}`;
      };

      events.push({
        '@type': 'Event',
        '@id': `https://senseisandy.com/schedule#event-${ymd}-${slug}`,
        name,
        startDate: toIso(startUtcMillis, startOffset),
        endDate: toIso(endUtcMillis, endOffset),
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: STUDIO_PLACE,
        organizer: { '@id': 'https://senseisandy.com/#localbusiness' },
        url: 'https://senseisandy.com/schedule',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: slot.bookingUrl.startsWith('http') ? slot.bookingUrl : `https://senseisandy.com${slot.bookingUrl}`
        }
      });
    }
  }

  return `<!-- SCHEDULE_EVENTS_JSONLD_START -->
<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': events }, null, 2)}
</script>
<!-- SCHEDULE_EVENTS_JSONLD_END -->`;
};

const replaceOrThrow = (source, pattern, replacement, label) => {
  if (!pattern.test(source)) throw new Error(`Could not update ${label}`);
  return source.replace(pattern, replacement);
};

const updateSchedulePage = async (schedule) => {
  let html = await fs.readFile(SCHEDULE_PAGE_PATH, 'utf8');

  html = html.replace(
    /View the Sensei Sandy BJJ class schedule in Tannersville NY with youth and evening classes, Before Work BJJ, Morning BJJ, and Saturday Adult No-Gi\./g,
    'View the Sensei Sandy BJJ class schedule in Tannersville NY with youth evening classes, adult evening classes, Saturday Adult No-Gi, and fixed morning private-lesson availability.'
  );

  html = replaceOrThrow(
    html,
    /<div[^>]*class="[^"]*ss-filter-explainer-wrapper[^"]*"[^>]*>[\s\S]*?<div class="ss-double-bezel-inner ss-first-visit-card h-100">/,
    `${schedulePageGrid(schedule)}
            <div class="ss-double-bezel-inner ss-first-visit-card h-100">`,
    'schedule page grid'
  );

  html = replaceOrThrow(
    html,
    /<script type="application\/ld\+json">\s*[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>/,
    `<script type="application/ld+json">
${faqJson}
</script>`,
    'schedule FAQ schema'
  );

  html = replaceOrThrow(
    html,
    /<!-- SCHEDULE_EVENTS_JSONLD_START -->[\s\S]*?<!-- SCHEDULE_EVENTS_JSONLD_END -->/,
    buildEventsJsonLd(schedule),
    'schedule event schema'
  );

  html = html
    .replace(/Before Work BJJ/g, 'Private Lesson')
    .replace(/Morning BJJ/g, 'Private Lesson');

  await fs.writeFile(SCHEDULE_PAGE_PATH, html);
};

const updateStudioPage = async (schedule) => {
  let html = await fs.readFile(STUDIO_PAGE_PATH, 'utf8');

  html = html.replace('Confidence Starts Here.', 'Confidence Starts Here.');

  html = replaceOrThrow(
    html,
    /<div class="bento-schedule-list">[\s\S]*?<\/div><\/div><a href="\/book-free-intro" class="bento-sched-promo"/,
    `${studioBento(schedule)}</div><a href="/book-free-intro" class="bento-sched-promo"`,
    'studio bento schedule'
  );

  await fs.writeFile(STUDIO_PAGE_PATH, html);
};

const updateNearbyTownsPage = async (schedule) => {
  let html = await fs.readFile(NEARBY_TOWNS_PATH, 'utf8');
  html = replaceOrThrow(
    html,
    /<!-- 4\. CURRENT SCHEDULE SECTION -->[\s\S]*?<!-- Shared reviews-village section -->/,
    `${studioCurrentSchedule(schedule)}<!-- Shared reviews-village section -->`,
    'nearby towns current schedule'
  );
  await fs.writeFile(NEARBY_TOWNS_PATH, html);
};

const updateStudentHub = async () => {
  let html = await fs.readFile(STUDENT_HUB_PATH, 'utf8');
  html = html.replace(
    /if \(className === 'Adult Morning Class'\) \{\s*if \(dayKey === 'tue' \|\| dayKey === 'thu'\) return 'Before Work BJJ';\s*if \(dayKey === 'wed' \|\| dayKey === 'fri'\) return 'Morning BJJ';\s*\}/,
    `if (className === 'Adult Morning Class' || className === 'Private Lesson') {
          return 'Private Lesson';
        }`
  );
  await fs.writeFile(STUDENT_HUB_PATH, html);
};

const updateSchoolFamilies = async () => {
  let html = await fs.readFile(SCHOOL_FAMILIES_PATH, 'utf8');
  html = html.replace(/Adult Morning Class/g, 'Private Lesson');
  html = html.replace(/Before Work BJJ/g, 'Private Lesson');
  html = html.replace(/Morning BJJ/g, 'Private Lesson');
  await fs.writeFile(SCHOOL_FAMILIES_PATH, html);
};

const writeFragments = async (schedule) => {
  await fs.writeFile(path.join(ROOT, '_includes/schedule-master.html'), schedulePageGrid(schedule));
  await fs.writeFile(path.join(ROOT, '_includes/schedule-studio-bento.html'), studioBento(schedule));
  await fs.writeFile(path.join(ROOT, '_includes/schedule-studio-current.html'), studioCurrentSchedule(schedule));
  await fs.writeFile(path.join(ROOT, 'schedule-block.html'), scheduleBlock(schedule));
  await fs.writeFile(path.join(ROOT, 'partials/current-schedule.html'), currentSchedulePartial(schedule));
};

const main = async () => {
  const schedule = await loadSchedule();
  await writeFragments(schedule);
  await updateSchedulePage(schedule);
  await updateStudioPage(schedule);
  await updateNearbyTownsPage(schedule);
  await updateStudentHub();
  await updateSchoolFamilies();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
