const TIME_ZONE = "America/New_York";
const DEFAULT_HORIZON_MONTHS = 6;

const editorialLabels = {
  "best-first-conversation": "Best first conversation",
  "family-friendly": "Family friendly",
  "serious-test": "Serious test",
  "more-matches": "More matches",
  "watch-list": "Later watch list",
  "coach-review": "Coach review"
};

const filterKeys = {
  "best-first-conversation": "first",
  "family-friendly": "family",
  "serious-test": "serious",
  "more-matches": "reps",
  "watch-list": "watch",
  "coach-review": "review"
};

const audienceLabels = {
  kids: "kids",
  teens: "teens",
  adults: "adults"
};

const travelLabels = {
  nearby: "Nearby",
  regional: "Regional",
  "travel-event": "Travel event"
};

export const events = [
  {
    id: "naga-springfield-32991",
    name: "NAGA Springfield Grappling Championship",
    organizer: "NAGA",
    startDate: "2026-10-10",
    endDate: "2026-10-10",
    timezone: TIME_ZONE,
    venueName: "MassMutual Center",
    streetAddress: "1277 Main St",
    city: "Springfield",
    state: "MA",
    postalCode: "01103",
    sourceUrl: "https://naga.smoothcomp.com/en/event/32991",
    thumbnailPath: "/assets/images/tournament-banner-teal.svg",
    thumbnailAlt: "NAGA Springfield Grappling Championship tournament banner — Springfield, MA, October 10, 2026",
    sports: ["bjj-gi", "bjj-nogi"],
    audiences: ["kids", "teens", "adults"],
    matchFormat: "Two-match bracket formats",
    registrationStatus: "open",
    registrationDeadline: "2026-10-09",
    rulesUrl: "https://www.nagafighter.com/naga-rules-divisions/",
    weighInSummary: "Friday weigh-in option; one-pound allowance; no gi required",
    refundSummary: "Future-event credit is available when canceled by noon Friday; refunds are generally not issued",
    uncontestedDivisionSummary: "NAGA may merge age, weight, or skill divisions; competitors can decline a move and receive future-event credit",
    travelTier: "regional",
    editorialTag: "coach-review",
    coachNote: "Use the Friday weigh-in option if helpful, and review the current bracket with Sandy before registering.",
    verificationStatus: "verified",
    verifiedAt: "2026-08-31"
  },
  {
    id: "tap-cancer-out-long-island-28604",
    name: "Tap Cancer Out 2026 Long Island BJJ Open",
    organizer: "Tap Cancer Out",
    startDate: "2026-10-24",
    endDate: "2026-10-24",
    timezone: TIME_ZONE,
    venueName: "Sportime VBC",
    streetAddress: "4105 Hempstead Tpke",
    city: "Bethpage",
    state: "NY",
    postalCode: "11714",
    sourceUrl: "https://smoothcomp.com/en/event/28604",
    thumbnailPath: "/assets/images/tournament-banner-ink.svg",
    thumbnailAlt: "Tap Cancer Out 2026 Long Island BJJ Open tournament banner — Bethpage, NY, October 24, 2026",
    sports: ["bjj-gi"],
    audiences: ["kids", "teens", "adults"],
    matchFormat: "Double elimination",
    registrationStatus: "open",
    registrationDeadline: "2026-10-20",
    rulesUrl: "https://tapcancerout.org/tournament-rules-regulations/",
    weighInSummary: "Optional Friday weigh-in; one-pound allowance; no gi required",
    refundSummary: null,
    uncontestedDivisionSummary: "Youth moves require parent or coach consent; uncontested competitors can change divisions or request money back on site",
    travelTier: "regional",
    editorialTag: "coach-review",
    coachNote: "Gi-only event with youth ages 4–15 and adult divisions; confirm the withdrawal policy before registering.",
    verificationStatus: "needs-review",
    reviewReason: "The exact event page gives internally contradictory withdrawal refund and credit language.",
    verifiedAt: "2026-08-31"
  },
  {
    id: "fuji-middletown-33851",
    name: "FUJI BJJ Middletown Fall Championship",
    organizer: "FUJI BJJ",
    startDate: "2026-10-25",
    endDate: "2026-10-25",
    timezone: TIME_ZONE,
    venueName: "Vale Sports Club",
    streetAddress: "1280 Newfield Street",
    city: "Middletown",
    state: "CT",
    sourceUrl: "https://fujibjj.smoothcomp.com/en/event/33851",
    thumbnailPath: "/assets/images/tournament-banner-teal.svg",
    thumbnailAlt: "FUJI BJJ Middletown Fall Championship tournament banner — Middletown, CT, October 25, 2026",
    sports: ["bjj-gi", "bjj-nogi"],
    audiences: ["kids", "teens", "adults"],
    matchFormat: "Double elimination",
    registrationStatus: "open",
    registrationDeadline: "2026-10-20",
    rulesUrl: "https://fujibjj.com/pages/competition-rules",
    weighInSummary: "Two-pound allowance; weigh in up to one hour before the division starts",
    refundSummary: "Early-registration cancellations can self-refund; later cancellations receive a future-event coupon",
    uncontestedDivisionSummary: "FUJI first moves uncontested competitors by one weight or age class, then contacts them if no suitable merge exists",
    travelTier: "regional",
    editorialTag: "coach-review",
    coachNote: "Check the current division, match length, and weigh-in time with Sandy before registering.",
    verificationStatus: "verified",
    verifiedAt: "2026-08-31"
  },
  {
    id: "good-fight-ny-winter-open-34092",
    name: "GOOD FIGHT: NY Winter Open",
    organizer: "Good Fight",
    startDate: "2026-12-05",
    endDate: "2026-12-05",
    timezone: TIME_ZONE,
    venueName: "JTS Sports Center",
    streetAddress: "115 Torne Valley Rd",
    city: "Hillburn",
    state: "NY",
    postalCode: "10931",
    sourceUrl: "https://goodfight.smoothcomp.com/en/event/34092",
    thumbnailPath: "/assets/images/tournament-banner-ink.svg",
    thumbnailAlt: "GOOD FIGHT NY Winter Open tournament banner — Hillburn, NY, December 5, 2026",
    sports: ["bjj-gi", "bjj-nogi", "submission-grappling"],
    audiences: ["kids", "teens", "adults"],
    matchFormat: "Submission-only; two matches per division guaranteed",
    registrationStatus: "open",
    registrationDeadline: "2026-12-03",
    rulesUrl: "https://www.goodfighttournament.com/rules/",
    weighInSummary: "One-pound allowance; no gi required; no night-before weigh-in",
    refundSummary: "No cash refunds; cancel in Smoothcomp for a future-event coupon before the organizer deadline",
    uncontestedDivisionSummary: "Good Fight first moves uncontested competitors by weight or age, then contacts them if no suitable merge exists",
    travelTier: "regional",
    editorialTag: "coach-review",
    coachNote: "Plan for same-day weigh-ins and ask Sandy whether the submission-only ruleset fits the student.",
    verificationStatus: "verified",
    verifiedAt: "2026-08-31"
  },
  {
    id: "grappling-industries-connecticut-31437",
    name: "Grappling Industries Connecticut",
    organizer: "Grappling Industries",
    startDate: "2026-12-19",
    endDate: "2026-12-19",
    timezone: TIME_ZONE,
    venueName: null,
    streetAddress: null,
    city: null,
    state: "CT",
    postalCode: null,
    sourceUrl: "https://grapplingindustries.smoothcomp.com/en/event/31437",
    thumbnailPath: "/assets/images/tournament-banner-ink.svg",
    thumbnailAlt: "Grappling Industries Connecticut tournament banner — Connecticut, December 19, 2026",
    sports: [],
    audiences: [],
    matchFormat: null,
    registrationStatus: "needs-review",
    registrationDeadline: null,
    rulesUrl: null,
    weighInSummary: null,
    refundSummary: null,
    uncontestedDivisionSummary: null,
    travelTier: "regional",
    editorialTag: "coach-review",
    coachNote: "Keep hidden until the exact event page resolves the New Haven versus Newtown venue conflict.",
    verificationStatus: "conflict",
    reviewReason: "The calendar says New Haven; an indexed event-detail result says NYA Sports & Fitness in Newtown.",
    verifiedAt: "2026-08-31"
  }
];

function dateKeyInTimeZone(value, timeZone = TIME_ZONE) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const valueFor = (type) => parts.find((part) => part.type === type)?.value;
  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`;
}

function addMonths(dateKey, months) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

function formatDate(dateKey) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

function isExactEventUrl(value) {
  return /^https:\/\/[^\s]+\/event\/\d+(?:[/?#].*)?$/.test(value);
}

export function validateVerifiedEvent(event) {
  const missing = [];
  const requiredStrings = [
    "id",
    "name",
    "organizer",
    "startDate",
    "endDate",
    "timezone",
    "venueName",
    "streetAddress",
    "city",
    "state",
    "sourceUrl",
    "thumbnailPath",
    "thumbnailAlt",
    "matchFormat",
    "registrationStatus",
    "registrationDeadline",
    "rulesUrl",
    "weighInSummary",
    "refundSummary",
    "uncontestedDivisionSummary",
    "travelTier",
    "editorialTag",
    "coachNote",
    "verifiedAt"
  ];

  requiredStrings.forEach((field) => {
    if (typeof event[field] !== "string" || !event[field].trim()) missing.push(field);
  });
  if (!Array.isArray(event.sports) || !event.sports.length) missing.push("sports");
  if (!Array.isArray(event.audiences) || !event.audiences.length) missing.push("audiences");
  if (!event.audiences?.every((audience) => audienceLabels[audience])) missing.push("known audiences");
  if (!event.sports?.every((sport) => ["bjj-gi", "bjj-nogi", "submission-grappling"].includes(sport))) missing.push("known sports");
  if (!isExactEventUrl(event.sourceUrl)) missing.push("exact sourceUrl");
  if (!/^https:\/\//.test(event.rulesUrl || "")) missing.push("https rulesUrl");
  if (!event.thumbnailPath?.startsWith("/") || /^https?:/i.test(event.thumbnailPath)) missing.push("local thumbnailPath");
  if (event.timezone !== TIME_ZONE) missing.push("timezone");
  for (const field of ["startDate", "endDate", "registrationDeadline", "verifiedAt"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event[field] || "")) missing.push(`${field} ISO date`);
  }
  if (event.endDate < event.startDate) missing.push("endDate on or after startDate");
  if (!editorialLabels[event.editorialTag]) missing.push("known editorialTag");
  if (!travelLabels[event.travelTier]) missing.push("known travelTier");
  if (event.coachNote?.length > 160) missing.push("coachNote <= 160 characters");
  return missing;
}

function decorateEvent(event) {
  const hasGi = event.sports.includes("bjj-gi");
  const hasNoGi = event.sports.includes("bjj-nogi");
  const sportLabel = hasGi && hasNoGi ? "Gi + No-Gi" : hasGi ? "Gi only" : hasNoGi ? "No-Gi only" : "Submission grappling";
  const address = [event.streetAddress, event.city, event.state, event.postalCode].filter(Boolean).join(", ");
  const smsBody = `Hi Sandy, I am considering ${event.name}. Is this event a good fit?`;

  return {
    ...event,
    endDate: event.endDate || event.startDate,
    dateLabel: formatDate(event.startDate),
    registrationDeadlineLabel: formatDate(event.registrationDeadline),
    locationLabel: [event.venueName, address].filter(Boolean).join(", "),
    audienceLabel: event.audiences.map((audience) => audienceLabels[audience] || audience).join(" · "),
    sportLabel,
    travelLabel: travelLabels[event.travelTier],
    editorialLabel: editorialLabels[event.editorialTag],
    filterKey: filterKeys[event.editorialTag],
    smsHref: `sms:+19177368649?body=${encodeURIComponent(smsBody)}`
  };
}

export function getPublishedEvents(records, now = new Date().toISOString(), horizonMonths = DEFAULT_HORIZON_MONTHS) {
  const today = dateKeyInTimeZone(now);
  const horizon = addMonths(today, horizonMonths);

  return records
    .filter((event) => event.verificationStatus === "verified")
    .filter((event) => validateVerifiedEvent(event).length === 0)
    .filter((event) => (event.endDate || event.startDate) >= today)
    .filter((event) => event.startDate <= horizon)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name))
    .map(decorateEvent);
}

const duplicateIds = events.filter((event, index) => events.findIndex((candidate) => candidate.id === event.id) !== index);
if (duplicateIds.length) throw new Error(`Duplicate tournament IDs: ${duplicateIds.map((event) => event.id).join(", ")}`);

const invalidVerified = events
  .filter((event) => event.verificationStatus === "verified")
  .map((event) => ({ event, missing: validateVerifiedEvent(event) }))
  .filter(({ missing }) => missing.length);
if (invalidVerified.length) {
  throw new Error(invalidVerified.map(({ event, missing }) => `${event.id}: ${missing.join(", ")}`).join("\n"));
}

const evaluationNow = process.env.TOURNAMENTS_NOW || new Date().toISOString();
const published = getPublishedEvents(events, evaluationNow);
const publishedIds = new Set(published.map((event) => event.id));
const research = events.filter((event) => !publishedIds.has(event.id));
const lastChecked = events.reduce((latest, event) => event.verifiedAt > latest ? event.verifiedAt : latest, "");
const filterOptions = Object.entries(editorialLabels).map(([tag, label]) => ({
  key: filterKeys[tag],
  label
}));

const schemaJson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: published.map((event, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SportsEvent",
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: event.venueName,
        address: {
          "@type": "PostalAddress",
          streetAddress: event.streetAddress,
          addressLocality: event.city,
          addressRegion: event.state,
          ...(event.postalCode ? { postalCode: event.postalCode } : {}),
          addressCountry: "US"
        }
      },
      url: event.sourceUrl
    }
  }))
});

export default {
  timeZone: TIME_ZONE,
  evaluationNow,
  lastChecked,
  lastCheckedLabel: formatDate(lastChecked),
  events,
  published,
  research,
  filterOptions,
  schemaJson
};
