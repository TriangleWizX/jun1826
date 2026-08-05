import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const makeStorage = () => {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    }
  };
};

const makeBaseContext = ({ pathname = '/', search = '' } = {}) => {
  const listeners = {};
  const storage = makeStorage();
  const events = [];

  const document = {
    body: {
      dataset: {},
      classList: { contains: () => false, add: () => {}, remove: () => {} }
    },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return {
        setAttribute() {},
        appendChild() {},
        className: '',
        textContent: ''
      };
    }
  };

  const window = {
    location: {
      origin: 'https://senseisandy.com',
      hostname: 'senseisandy.com',
      pathname,
      search
    },
    localStorage: storage,
    sessionStorage: storage,
    dataLayer: [],
    gtag(name, eventName, payload) {
      if (name === 'event') events.push({ eventName, payload });
    },
    addEventListener() {},
    SENSEI_CONFIG: {
      bookIntroUrl: 'https://senseisandy.com/free-bjj-intro-tannersville-ny',
      canonicalIntroUrl: 'https://senseisandy.com/free-bjj-intro-tannersville-ny'
    }
  };

  const context = {
    window,
    document,
    localStorage: storage,
    sessionStorage: storage,
    URL,
    URLSearchParams,
    console
  };
  context.globalThis = context;
  context.dataLayer = window.dataLayer;
  return { context, listeners, events, window };
};

const runScript = async (ctx, relPath) => {
  const full = path.join(ROOT, relPath);
  const code = await fs.readFile(full, 'utf8');
  vm.runInNewContext(code, ctx, { filename: relPath });
};

const testAttributionPersistence = async () => {
  const { context, window } = makeBaseContext({
    pathname: '/near/hunter-ny',
    search: '?src=hunter&utm_source=google&utm_medium=cpc&utm_campaign=winter_partner'
  });
  await runScript(context, 'js/site-config.js');

  const built = window.buildBookIntroUrl({
    base: 'https://senseisandy.com/free-bjj-intro-tannersville-ny',
    lane: 'kids'
  });
  const url = new URL(built);

  assert(url.pathname === '/free-bjj-intro-tannersville-ny', 'Expected canonical booking path.');
  assert(url.search === '', 'Expected internal booking URL to stay clean (no query params).');

  const stored = window.SENSEI_LINK_UTILS?.readStoredAttribution?.() || {};
  assert(stored.src === 'hunter', 'Expected src to persist in session attribution.');
  assert(stored.utm_source === 'google', 'Expected utm_source to persist in session attribution.');
  assert(stored.utm_medium === 'cpc', 'Expected utm_medium to persist in session attribution.');
  assert(stored.utm_campaign === 'winter_partner', 'Expected utm_campaign to persist in session attribution.');

  const hasAttributionEvent = Array.isArray(window.dataLayer)
    && window.dataLayer.some((event) => event && event.event === 'ssbjj_attribution');
  assert(hasAttributionEvent, 'Expected ssbjj_attribution event to be pushed to dataLayer.');
};

const makeTarget = ({ introEl = null, linkEl = null, leoEl = null } = {}) => ({
  closest(selector) {
    if (selector.includes('[data-leo-event]')) {
      return leoEl;
    }
    if (selector.includes('[data-event="book_free_intro_click"]') || selector.includes('[data-cta-target="intro"]')) {
      return introEl;
    }
    if (selector === 'a') return linkEl;
    return null;
  }
});

const makeLink = ({ href = '', dataset = {}, textContent = '' } = {}) => ({
  dataset,
  textContent,
  getAttribute(name) {
    if (name === 'href') return href;
    if (name.startsWith('data-')) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_, chr) => chr.toUpperCase());
      return Object.prototype.hasOwnProperty.call(dataset, key) ? String(dataset[key]) : '';
    }
    return '';
  },
  hasAttribute(name) {
    if (name === 'href') return href.length > 0;
    if (!name.startsWith('data-')) return false;
    const key = name
      .slice(5)
      .replace(/-([a-z])/g, (_, chr) => chr.toUpperCase());
    return Object.prototype.hasOwnProperty.call(dataset, key);
  },
  closest() {
    return null;
  }
});

const eventExists = (events, name) => events.some((e) => e.eventName === name);

const testAnalyticsEvents = async () => {
  const { context, listeners, events, window } = makeBaseContext({ pathname: '/schedule', search: '' });
  await runScript(context, 'js/analytics-events.js');
  const clickHandler = listeners.click;
  assert(typeof clickHandler === 'function', 'Click listener was not registered.');

  const introLink = makeLink({
    href: '/kids',
    dataset: { ctaTarget: 'intro', ctaLane: 'kids', ctaSrc: 'schedule-hero' }
  });
  clickHandler({ target: makeTarget({ introEl: introLink, linkEl: introLink }) });
  assert(eventExists(events, 'book_intro_click'), 'Missing book_intro_click event.');
  assert(eventExists(events, 'cta_book_free_intro_click'), 'Missing cta_book_free_intro_click event.');
  assert(eventExists(events, 'lane_select'), 'Missing lane_select event.');

  clickHandler({ target: makeTarget({ linkEl: makeLink({ href: 'sms:+19177368649', dataset: { ctaTarget: 'text' } }) }) });
  assert(eventExists(events, 'sms_click'), 'Missing sms_click event.');
  assert(eventExists(events, 'cta_text_click'), 'Missing cta_text_click event.');

  clickHandler({ target: makeTarget({ linkEl: makeLink({ href: 'tel:+19177368649', dataset: { ctaTarget: 'phone' } }) }) });
  assert(eventExists(events, 'phone_click'), 'Missing phone_click event.');
  assert(eventExists(events, 'cta_call_click'), 'Missing cta_call_click event.');

  clickHandler({ target: makeTarget({ linkEl: makeLink({ href: '/waiver' }) }) });
  assert(eventExists(events, 'waiver_click'), 'Missing waiver_click event.');

  clickHandler({ target: makeTarget({ linkEl: makeLink({ href: '/show-up-kit' }) }) });
  assert(eventExists(events, 'showup_kit_click'), 'Missing showup_kit_click event.');

  window.location.pathname = '/free-bjj-intro-tannersville-ny';
};

const testLawEnforcementAnalyticsEvents = async () => {
  const { context, listeners, events } = makeBaseContext({ pathname: '/law-enforcement-bjj', search: '' });
  await runScript(context, 'js/analytics-events.js');
  const clickHandler = listeners.click;
  assert(typeof clickHandler === 'function', 'Click listener was not registered for LEO analytics.');

  const leoClicks = [
    makeLink({
      href: '/free-bjj-intro-tannersville-ny',
      textContent: 'Claim $600 Service Rate',
      dataset: {
        leoEvent: 'leo_individual_service_rate_click',
        ctaTarget: 'intro',
        ctaLane: 'leo',
        ctaPlacement: 'hero',
        ctaTier: 'primary'
      }
    }),
    makeLink({
      href: '/contact',
      textContent: 'Request Pilot Squad Proposal',
      dataset: {
        leoEvent: 'leo_department_proposal_click',
        ctaTarget: 'contact',
        ctaLane: 'leo',
        ctaPlacement: 'pilot',
        ctaTier: 'primary'
      }
    }),
    makeLink({
      href: 'sms:+19177368649',
      textContent: 'Text Sandy',
      dataset: {
        leoEvent: 'leo_text_sandy_click',
        ctaTarget: 'text',
        ctaLane: 'leo',
        ctaPlacement: 'final',
        ctaTier: 'tertiary'
      }
    }),
    makeLink({
      href: 'tel:+19177368649',
      textContent: 'Call Sandy',
      dataset: {
        leoEvent: 'leo_call_click',
        ctaTarget: 'phone',
        ctaLane: 'leo',
        ctaPlacement: 'final',
        ctaTier: 'tertiary'
      }
    }),
    makeLink({
      href: '/schedule',
      textContent: 'View Adult Schedule',
      dataset: {
        leoEvent: 'leo_schedule_click',
        ctaTarget: 'schedule',
        ctaLane: 'leo',
        ctaPlacement: 'final',
        ctaTier: 'secondary'
      }
    }),
    makeLink({
      href: '/options-pricing',
      textContent: 'View Community Service Rate',
      dataset: {
        leoEvent: 'leo_pricing_click',
        ctaTarget: 'pricing',
        ctaLane: 'leo',
        ctaPlacement: 'final',
        ctaTier: 'secondary'
      }
    }),
    makeLink({
      textContent: 'View Full 12-Week Pilot Curriculum',
      dataset: {
        leoEvent: 'leo_full_curriculum_expand',
        ctaTarget: 'curriculum',
        ctaLane: 'leo',
        ctaPlacement: 'curriculum',
        ctaTier: 'secondary'
      }
    })
  ];

  for (const el of leoClicks) {
    const href = el.getAttribute('href') || '';
    const isIntro = href === '/free-bjj-intro-tannersville-ny';
    const isAnchor = href.length > 0;
    clickHandler({ target: makeTarget({ leoEl: el, introEl: isIntro ? el : null, linkEl: isAnchor ? el : null }) });
  }

  [
    'leo_individual_service_rate_click',
    'leo_department_proposal_click',
    'leo_text_sandy_click',
    'leo_call_click',
    'leo_schedule_click',
    'leo_pricing_click',
    'leo_full_curriculum_expand'
  ].forEach((eventName) => {
    assert(eventExists(events, eventName), `Missing ${eventName} event.`);
  });
};

const testLawEnforcementPageCoverage = async () => {
  const html = await fs.readFile(path.join(ROOT, 'law-enforcement-bjj.html'), 'utf8');
  const requiredEvents = [
    'leo_individual_service_rate_click',
    'leo_department_proposal_click',
    'leo_text_sandy_click',
    'leo_call_click',
    'leo_schedule_click',
    'leo_pricing_click',
    'leo_full_curriculum_expand'
  ];

  for (const eventName of requiredEvents) {
    assert(html.includes(`data-leo-event="${eventName}"`), `law-enforcement-bjj.html: missing ${eventName} data attribute.`);
  }

  assert(!html.includes('leo_youth_service_rate_click'), 'law-enforcement-bjj.html: should not include youth LEO analytics event.');
  assert(!html.includes('Service Family Youth Rate'), 'law-enforcement-bjj.html: youth service-family block should be removed.');
  assert(!html.includes('Ask About Youth Service Rate'), 'law-enforcement-bjj.html: youth service-rate CTA should be removed.');

  const sectionOrder = [
    '<h2 class="reveal-up" style="transition-delay: 100ms;">Two Ways to Start</h2>',
    '<h2 class="mb-4 reveal-up" style="transition-delay: 100ms;">Jiu-Jitsu Foundations Adapted Around Your Responsibilities</h2>',
    '<h2 class="mb-4">Your First Step</h2>',
    '<h2 class="mb-4 reveal-up">What Regular Training Develops</h2>',
    '<h2 class="mb-4">Why Agencies Explore Consistent Grappling Practice</h2>',
    '<h2 class="mb-4">Private Pilot Framework</h2>',
    '<h2 class="mb-4">Community Service Rate</h2>',
    '<h2 class="mb-4">Common Questions</h2>'
  ].map((needle) => html.indexOf(needle));

  sectionOrder.forEach((index, i) => {
    assert(index >= 0, `law-enforcement-bjj.html: missing ordered section ${i + 1}.`);
    if (i > 0) {
      assert(index > sectionOrder[i - 1], `law-enforcement-bjj.html: section ${i + 1} is out of order.`);
    }
  });
};

const testFunnelCoverage = async () => {
  const pages = [
    'index.html',
    'schedule.html',
    'free-bjj-intro-tannersville-ny/index.html'
  ];

  for (const relPath of pages) {
    const html = await fs.readFile(path.join(ROOT, relPath), 'utf8');
    assert(html.includes('/nav-include.html'), `${relPath}: missing nav include.`);
    const hasBookCta = /data-cta-target="intro"|\/free-bjj-intro-tannersville-ny/.test(html);
    assert(hasBookCta, `${relPath}: missing booking CTA.`);
    const hasLegacyLaneLink = /\/free-bjj-intro-tannersville-ny\/(kids|teens|adults)\b/.test(html);
    assert(!hasLegacyLaneLink, `${relPath}: links to deprecated lane booking paths.`);
  }
};

const testBookIntroStructure = async () => {
  const html = await fs.readFile(path.join(ROOT, 'free-bjj-intro-tannersville-ny/index.html'), 'utf8');
  assert(html.includes('id="onsite-booking-form"'), 'free-bjj-intro-tannersville-ny/index.html: missing lead capture form.');
  assert(html.includes('id="calendly-embed-onsite"'), 'free-bjj-intro-tannersville-ny/index.html: missing Calendly embed container.');
  assert(html.includes('editorial-split-container'), 'free-bjj-intro-tannersville-ny/index.html: missing editorial split container.');
  assert(html.includes('id="booking-flow"'), 'free-bjj-intro-tannersville-ny/index.html: missing progressive booking flow container.');
  assert(html.includes('ss-mobile-sticky-cta'), 'free-bjj-intro-tannersville-ny/index.html: missing page-local mobile sticky CTA.');

  // Direct Calendly links should NO LONGER be in the HTML.
  const calendlyUrls = [
    'https://calendly.com/senseisandy/free-first-class-youth-ages-5-17',
    'https://calendly.com/senseisandy/free-first-class-adult-bjj'
  ];

  for (const url of calendlyUrls) {
    assert(!html.includes(url), `free-bjj-intro-tannersville-ny/index.html: should NOT contain direct Calendly link ${url}`);
  }

  const sectionOrder = [
    'editorial-split-container',
    'id="booking-flow"',
    'id="pb-step-1"',
    'id="pb-step-2"',
    'id="calendly-embed-onsite"',
    'ss-book-location',
    'data-ss-evidence-mount',
    'ss-faq-section'
  ];

  let lastIndex = -1;
  for (const marker of sectionOrder) {
    const nextIndex = html.indexOf(marker);
    assert(nextIndex !== -1, `free-bjj-intro-tannersville-ny/index.html: missing section marker ${marker}.`);
    assert(nextIndex > lastIndex, `free-bjj-intro-tannersville-ny/index.html: section order regression at ${marker}.`);
    lastIndex = nextIndex;
  }
};

const main = async () => {
  await testAttributionPersistence();
  await testAnalyticsEvents();
  await testLawEnforcementAnalyticsEvents();
  await testLawEnforcementPageCoverage();
  await testFunnelCoverage();
  await testBookIntroStructure();
  console.log('QA funnel checks passed: event firing + clean internal booking URLs + session attribution + funnel coverage.');
};

main().catch((error) => {
  console.error(`QA funnel failed: ${error.message}`);
  process.exit(1);
});
