import fs from 'node:fs';
import path from 'node:path';
import tournaments, { events, getPublishedEvents, validateVerifiedEvent } from '../src/_data/tournaments.js';

const root = process.cwd();
const file = path.join(root, 'dist/local-bjj-tournaments-for-parents.html');
if (!fs.existsSync(file)) throw new Error(`Missing ${file}; run npm run build first.`);

const html = fs.readFileSync(file, 'utf8');
const visibleHtml = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
const cards = [...visibleHtml.matchAll(/<article class="tournament-card"[\s\S]*?<\/article>/g)].map((match) => match[0]);
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const occurrences = (value, needle) => value.split(needle).length - 1;
const exactEventUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.search && !url.hash && /\/event\/\d+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
};

const ids = events.map((event) => event.id);
check(new Set(ids).size === ids.length, 'event IDs are not unique');

const verified = events.filter((event) => event.verificationStatus === 'verified');
check(new Set(verified.map((event) => event.sourceUrl)).size === verified.length, 'verified event URLs are not unique');
const requiredFields = [
  'id', 'name', 'organizer', 'startDate', 'endDate', 'timezone', 'venueName', 'streetAddress',
  'city', 'state', 'sourceUrl', 'thumbnailPath', 'thumbnailAlt', 'matchFormat',
  'registrationStatus', 'registrationDeadline', 'rulesUrl', 'weighInSummary', 'refundSummary',
  'uncontestedDivisionSummary', 'travelTier', 'editorialTag', 'coachNote', 'verifiedAt'
];

for (const event of verified) {
  const missing = requiredFields.filter((field) => typeof event[field] !== 'string' || !event[field].trim());
  check(missing.length === 0, `${event.id}: missing required fields ${missing.join(', ')}`);
  const validationFailures = validateVerifiedEvent(event);
  check(validationFailures.length === 0, `${event.id}: model validation failed (${validationFailures.join(', ')})`);
  check(exactEventUrl(event.sourceUrl), `${event.id}: source URL is not an exact HTTPS event URL`);
  check(event.thumbnailPath.startsWith('/') && !/^https?:/i.test(event.thumbnailPath), `${event.id}: thumbnail is not local`);
  check(fs.existsSync(path.join(root, 'src', event.thumbnailPath.replace(/^\//, ''))), `${event.id}: local thumbnail does not exist`);
  check(event.thumbnailAlt.length >= 20, `${event.id}: thumbnail alt text is not descriptive`);
}

const hiddenStatuses = new Set(['needs-review', 'conflict']);
for (const event of events.filter((candidate) => hiddenStatuses.has(candidate.verificationStatus))) {
  check(!tournaments.published.some((published) => published.id === event.id), `${event.id}: review/conflict event was published`);
  check(!html.includes(event.name), `${event.id}: review/conflict event leaked into rendered HTML`);
}

const fixture = verified[0];
const atBoundary = {
  ...fixture,
  id: 'qa-end-boundary',
  name: 'QA End Boundary',
  startDate: '2026-08-30',
  endDate: '2026-08-31'
};
check(getPublishedEvents([atBoundary], '2026-09-01T02:00:00Z').length === 1, 'event expired before its Eastern-time end-date boundary');
check(getPublishedEvents([atBoundary], '2026-09-01T05:00:00Z').length === 0, 'event remained published after its Eastern-time end-date boundary');

const horizonFixture = (id, name, date) => ({ ...fixture, id, name, startDate: date, endDate: date });
const horizonResults = getPublishedEvents([
  horizonFixture('qa-horizon-last', 'QA Horizon Last', '2027-02-28'),
  horizonFixture('qa-horizon-out', 'QA Horizon Out', '2027-03-01')
], '2026-08-31T12:00:00-04:00');
check(horizonResults.map((event) => event.id).join(',') === 'qa-horizon-last', 'six-month calendar horizon boundary is incorrect');

const sorted = getPublishedEvents([
  horizonFixture('qa-sort-z', 'Zulu Event', '2026-09-15'),
  horizonFixture('qa-sort-a', 'Alpha Event', '2026-09-15'),
  horizonFixture('qa-sort-first', 'First Event', '2026-09-10')
], '2026-08-31T12:00:00-04:00');
check(sorted.map((event) => event.id).join(',') === 'qa-sort-first,qa-sort-a,qa-sort-z', 'events are not sorted by date then name');

const schemaMatches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
const schemas = schemaMatches.map((match, index) => {
  try {
    return JSON.parse(match[1]);
  } catch {
    failures.push(`JSON-LD block ${index + 1} is invalid`);
    return null;
  }
});
const itemLists = schemas.filter((candidate) => candidate?.['@type'] === 'ItemList');
check(itemLists.length === 1, `expected exactly one ItemList, found ${itemLists.length}`);
const schemaItems = itemLists[0]?.itemListElement ?? [];

check(cards.length === tournaments.published.length, `card/model count mismatch (${cards.length}/${tournaments.published.length})`);
check(schemaItems.length === tournaments.published.length, `JSON-LD/model count mismatch (${schemaItems.length}/${tournaments.published.length})`);

for (const [index, event] of tournaments.published.entries()) {
  const card = cards[index] ?? '';
  const schemaItem = schemaItems[index];
  check(card.includes(`data-tournament-id="${event.id}"`), `card ${index + 1}: model ID/order mismatch`);
  check(card.includes(`data-tournament-type="${event.filterKey}"`), `card ${index + 1}: filter key mismatch`);
  check(card.includes(event.name) && card.includes(event.dateLabel), `card ${index + 1}: name/date mismatch`);
  check(card.includes(event.registrationDeadlineLabel), `card ${index + 1}: registration deadline mismatch`);
  check(occurrences(card, `href="${event.sourceUrl}"`) === 1, `card ${index + 1}: expected one exact official event link`);
  check(/target="_blank"[^>]+rel="noopener noreferrer"/.test(card), `card ${index + 1}: safe external-link attributes missing`);
  check(card.includes(`href="${event.smsHref}"`), `card ${index + 1}: SMS body/link mismatch`);
  const escapedThumbnail = event.thumbnailPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/(\\\.[a-z0-9]+)$/i, '(?:\\.[0-9a-f]{6})?$1');
  const thumbnailPattern = new RegExp(`src="${escapedThumbnail}"`);
  check(thumbnailPattern.test(card), `card ${index + 1}: thumbnail path mismatch`);
  check(card.includes(`alt="${event.thumbnailAlt}"`), `card ${index + 1}: thumbnail alt mismatch`);
  check(/<img[^>]+width="343"[^>]+height="127"/.test(card), `card ${index + 1}: thumbnail dimensions missing`);
  check(!/<img[^>]+src="https?:/i.test(card), `card ${index + 1}: remote image detected`);
  check(/class="[^"]*tournament-action[^"]*"/.test(card), `card ${index + 1}: action target class missing`);
  check(schemaItem?.position === index + 1, `JSON-LD item ${index + 1}: position mismatch`);
  check(schemaItem?.item?.name === event.name, `JSON-LD item ${index + 1}: name mismatch`);
  check(schemaItem?.item?.url === event.sourceUrl, `JSON-LD item ${index + 1}: URL mismatch`);
  check(schemaItem?.item?.startDate === event.startDate && schemaItem?.item?.endDate === event.endDate, `JSON-LD item ${index + 1}: date mismatch`);
}

const expectedFilters = ['all', ...tournaments.filterOptions.map((option) => option.key)];
const filterButtons = [...visibleHtml.matchAll(/<button[^>]+data-tournament-filter="([^"]+)"[^>]*>/g)];
check(filterButtons.map((match) => match[1]).join(',') === expectedFilters.join(','), 'rendered filters do not match published editorial tags');
check(filterButtons.every((match) => /type="button"/.test(match[0]) && /tournament-filter/.test(match[0])), 'filter button contract is incomplete');
check(html.includes("tournament-result-count") && html.includes("Showing ${visible} verified event"), 'filter result count is not updated');
check(/\.page-tournament-guide \.tournament-action,\s*\.page-tournament-guide \.tournament-filter\s*\{[\s\S]*?min-height:\s*44px/.test(visibleHtml), '44px action/filter target rule is missing');
check(/\.page-tournament-guide \.he-reveal\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*none;/.test(visibleHtml), 'no-JavaScript reveal fallback is missing');

const tapCancerOut = events.find((event) => event.id.startsWith('tap-cancer-out'));
check(!tapCancerOut || !html.includes(tapCancerOut.name), 'Tap Cancer Out needs-review record is visible');
for (const marker of ['TOURNAMENT_DATA', 'tournament-grid-do-not-render', 'he-stretched-link', 'FOOD_BY_KEY', 'daysAway']) {
  check(!html.includes(marker), `legacy tournament marker remains: ${marker}`);
}
check(!/\b(?:Today|Tomorrow|Yesterday|\d+ days away)\b/.test(visibleHtml), 'relative-day tournament copy remains');

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Tournament QA passed (${cards.length} published cards; one synchronized ItemList; model, filters, links, SMS actions, thumbnails, and date boundaries verified).`);
