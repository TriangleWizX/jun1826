const siteFacts = {
  kidsAges: "5–9",
  teenAges: "10–17",
  adultAges: "18+",
  youthTime: "5:00 PM",
  adultTime: "6:00 PM",
  saturdayTime: "10:30 AM",
  phone: "(917) 736-8649",
  email: "me@senseisandy.com",
  reviewCount: "67",
  youthPrice: "$550",
  adultPrice: "$715",
  primaryCTA: "Reserve Free Intro",
  secondaryCTA: "Text Sandy"
};
window.siteFacts = siteFacts;

const academyData = {
  phone: siteFacts.phone,
  email: siteFacts.email,
  address: "6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485",
  kidsAges: siteFacts.kidsAges,
  teenAges: siteFacts.teenAges,
  youthTime: siteFacts.youthTime,
  adultTime: siteFacts.adultTime,
  saturdayTime: siteFacts.saturdayTime,
  privatePrice: "$195",
  youthSemesterPrice: siteFacts.youthPrice,
  adultSemesterPrice: siteFacts.adultPrice
};
window.academyData = academyData;


const defaultMonthLabel = new Date().toLocaleString('en-US', { month: 'long' });
const CALENDLY_BOOKING_URL = 'https://calendly.com/senseisandy?background_color=f8f8f8&primary_color=68963c&text_color=333';

const defaultDecisionConfig = {
  pricingVisibility: 'site-wide',
  primaryCtaLabel: 'Reserve Free Intro',
  primaryCtaUrl: '/book-free-intro',
  secondaryCtaLabel: 'Text Sandy First',
  secondaryCtaUrl: 'sms:+19177368649'
};

const decisionOverrides = {
  ...defaultDecisionConfig,
  ...(window.SENSEI_DECISIONS || {})
};

window.SENSEI_DECISIONS = decisionOverrides;

// Provide shared URL/UTM helpers without needing a separate script include.
(function ensureLinkUtils() {
  const DEFAULT_BASE = 'https://senseisandy.com';
  const ATTR_STORAGE_KEY = 'sensei_attribution_v1';
  const ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'src'
  ];

  const getSessionStorage = () => {
    try {
      return window.sessionStorage;
    } catch (error) {
      return null;
    }
  };

  const readStoredAttribution = () => {
    try {
      const storage = getSessionStorage();
      if (!storage) return {};
      const raw = storage.getItem(ATTR_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed;
    } catch (error) {
      return {};
    }
  };

  const saveAttribution = (partial) => {
    if (!partial || typeof partial !== 'object') return;
    try {
      const storage = getSessionStorage();
      if (!storage) return;
      const current = readStoredAttribution();
      const merged = { ...current };
      ATTRIBUTION_KEYS.forEach((key) => {
        const value = partial[key];
        if (!value) return;
        merged[key] = value;
      });
      storage.setItem(ATTR_STORAGE_KEY, JSON.stringify(merged));
    } catch (error) {
      // sessionStorage may be blocked in some browsing contexts
    }
  };

  const extractTrackingParams = (search) => {
    const params = new URLSearchParams(search || window.location.search);
    const tracking = {};

    ATTRIBUTION_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) {
        tracking[key] = value;
      }
    });

    return tracking;
  };

  const getTrackingParams = (search) => {
    const stored = readStoredAttribution();
    const current = extractTrackingParams(search);
    return { ...stored, ...current };
  };

  const pushAttributionEvent = (payload) => {
    if (!payload || typeof payload !== 'object') return;
    if (!Object.keys(payload).length) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'ssbjj_attribution',
      ...payload
    });
  };

  const captureAttributionForSession = (search) => {
    const current = extractTrackingParams(search);
    if (!Object.keys(current).length) return {};
    saveAttribution(current);
    const merged = readStoredAttribution();
    pushAttributionEvent(merged);
    return merged;
  };

  const populateAttributionFields = (root = document) => {
    const tracking = getTrackingParams();
    if (!Object.keys(tracking).length) return;
    ATTRIBUTION_KEYS.forEach((key) => {
      const value = tracking[key];
      if (!value) return;
      root.querySelectorAll(`input[name="${key}"], input#${key}`).forEach((el) => {
        el.value = value;
      });
    });
  };

  const normalizeLoc = (loc) => {
    if (!loc) return '';
    const trimmed = String(loc).trim().toLowerCase();
    if (trimmed === 'tannersville') return trimmed;
    return '';
  };

  const normalizeLane = (lane) => {
    if (!lane) return '';
    const trimmed = String(lane).trim().toLowerCase();
    if (['kids', 'kid', 'youth'].includes(trimmed)) return 'kids';
    if (['teens', 'teen'].includes(trimmed)) return 'teens';
    if (['adults', 'adult'].includes(trimmed)) return 'adults';
    return '';
  };

  const resolveIntroPath = (lane) => {
    return '/book-free-intro';
  };

  const normalizeLegacyIntroPath = (pathname) => {
    if (!pathname) return '';
    const normalized = pathname.replace(/\/+$/, '').toLowerCase() || '/';
    const legacyMatch = normalized.match(/^\/book-free-intro(kids|teens|adults)$/);
    if (!legacyMatch) return '';
    return `/book-free-intro/${legacyMatch[1]}`;
  };

  const isSenseiHost = (hostname) => {
    if (!hostname) return false;
    return hostname.replace(/^www\./i, '').toLowerCase() === 'senseisandy.com';
  };

  const isBookIntroPath = (pathname) => {
    if (!pathname) return false;
    const normalized = (normalizeLegacyIntroPath(pathname) || pathname.replace(/\/+$/, '').toLowerCase()) || '/';
    return normalized === '/book-free-intro'
      || normalized === '/book-free-intro/kids'
      || normalized === '/book-free-intro/teens'
      || normalized === '/book-free-intro/adults';
  };

  const buildBookIntroUrl = ({ base, loc, src, lane } = {}) => {
    const cfg = window.SENSEI_CONFIG || {};
    const fallbackUrl = `${DEFAULT_BASE}${resolveIntroPath(lane)}`;
    const target = base || cfg.bookIntroUrl || cfg.canonicalIntroUrl || fallbackUrl;
    const url = new URL(target, DEFAULT_BASE);
    const normalizedLegacyPath = normalizeLegacyIntroPath(url.pathname);
    if (normalizedLegacyPath) {
      url.pathname = normalizedLegacyPath;
    }
    const internalBookIntro = isSenseiHost(url.hostname) && isBookIntroPath(url.pathname);
    const tracking = getTrackingParams();
    const normalizedLoc = normalizeLoc(loc || new URLSearchParams(window.location.search).get('loc'));
    const normalizedSrc = src || tracking.src || new URLSearchParams(window.location.search).get('src');

    if (internalBookIntro) {
      url.pathname = resolveIntroPath(lane);
      url.search = '';
      url.hash = '';
      return url.toString();
    }

    Object.entries(tracking).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    if (normalizedLoc) url.searchParams.set('loc', normalizedLoc);
    if (normalizedSrc) url.searchParams.set('src', normalizedSrc);

    return url.toString();
  };

  captureAttributionForSession(window.location.search);

  window.SENSEI_LINK_UTILS = window.SENSEI_LINK_UTILS || {};
  window.SENSEI_LINK_UTILS.readStoredAttribution = readStoredAttribution;
  window.SENSEI_LINK_UTILS.saveAttribution = saveAttribution;
  window.SENSEI_LINK_UTILS.extractTrackingParams = extractTrackingParams;
  window.SENSEI_LINK_UTILS.getTrackingParams = getTrackingParams;
  window.SENSEI_LINK_UTILS.captureAttributionForSession = captureAttributionForSession;
  window.SENSEI_LINK_UTILS.populateAttributionFields = populateAttributionFields;
  window.SENSEI_LINK_UTILS.normalizeLoc = normalizeLoc;
  window.SENSEI_LINK_UTILS.normalizeLane = normalizeLane;
  window.buildBookIntroUrl = buildBookIntroUrl;
})();

const defaultSenseiConfig = {
  currentMonthLabel: defaultMonthLabel,
  newStudentSpots: 3,
  grandSlamSpots: 3,
  calendlyUrl: 'https://calendly.com/senseisandy?background_color=f8f8f8&primary_color=68963c&text_color=333',
  canonicalIntroUrl: 'https://senseisandy.com/book-free-intro',
  bookIntroUrl: 'https://senseisandy.com/book-free-intro',
  kidsCalendlyUrl: 'https://calendly.com/senseisandy/free-first-class-youth-ages-5-17',
  teensCalendlyUrl: 'https://calendly.com/senseisandy/free-first-class-youth-ages-5-17',
  adultsCalendlyUrl: 'https://calendly.com/senseisandy/free-first-class-adult-bjj',
  mixedCalendlyUrl: 'https://calendly.com/senseisandy/',
  tannersvilleCalendlyUrl: 'https://calendly.com/senseisandy?background_color=f8f8f8&primary_color=68963c&text_color=333',
  smsNumber: '+19177368649',
  primaryCtaLabel: 'Reserve Free Intro',
  primaryCtaUrl: '/book-free-intro',
  secondaryCtaLabel: 'Text Sandy First',
  secondaryCtaUrl: 'sms:+19177368649',
  laneAges: {
    kids: academyData.kidsAges,
    teens: academyData.teenAges,
    adults: '18+'
  },
  primaryPhone: '+19177368649',
  primaryPhoneDisplay: academyData.phone
};

window.SENSEI_CONFIG = Object.assign(
  defaultSenseiConfig,
  window.SENSEI_CONFIG || {},
  {
    pricingVisibility: decisionOverrides.pricingVisibility,
    primaryCtaLabel: decisionOverrides.primaryCtaLabel,
    primaryCtaUrl: decisionOverrides.primaryCtaUrl,
    secondaryCtaLabel: decisionOverrides.secondaryCtaLabel,
    secondaryCtaUrl: decisionOverrides.secondaryCtaUrl
  }
);

const normalizePhoneValue = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/[^+\d]/g, '');
  if (!digits) return '';
  return digits.startsWith('+') ? digits : `+${digits}`;
};

const PRIMARY_PHONE_RAW = window.SENSEI_CONFIG.primaryPhone || window.SENSEI_CONFIG.smsNumber || '+19177368649';
const PRIMARY_PHONE = normalizePhoneValue(PRIMARY_PHONE_RAW) || '+19177368649';
const PRIMARY_PHONE_DISPLAY = window.SENSEI_CONFIG.primaryPhoneDisplay || '(917) 736-8649';
const PRIMARY_PHONE_LINK = `tel:${PRIMARY_PHONE}`;
const PRIMARY_SMS_LINK = `sms:${PRIMARY_PHONE}`;
const PRIMARY_CTA_LABEL = window.SENSEI_CONFIG.primaryCtaLabel || 'Reserve Free Intro';
const PRIMARY_CTA_URL = window.SENSEI_CONFIG.primaryCtaUrl
  || window.SENSEI_CONFIG.bookIntroUrl
  || window.SENSEI_CONFIG.canonicalIntroUrl
  || CALENDLY_BOOKING_URL;
const SECONDARY_CTA_LABEL = window.SENSEI_CONFIG.secondaryCtaLabel || 'Text Sandy First';
const SECONDARY_CTA_URL = window.SENSEI_CONFIG.secondaryCtaUrl || `sms:${PRIMARY_PHONE}`;

window.PRIMARY_PHONE = PRIMARY_PHONE;
window.PRIMARY_PHONE_DISPLAY = PRIMARY_PHONE_DISPLAY;
window.PRIMARY_PHONE_LINK = PRIMARY_PHONE_LINK;
window.PRIMARY_SMS_LINK = PRIMARY_SMS_LINK;
window.PRIMARY_CTA_LABEL = PRIMARY_CTA_LABEL;
window.PRIMARY_CTA_URL = PRIMARY_CTA_URL;
window.SECONDARY_CTA_LABEL = SECONDARY_CTA_LABEL;
window.SECONDARY_CTA_URL = SECONDARY_CTA_URL;

(function applySenseiConfig() {
  const cfg = window.SENSEI_CONFIG || {};

  const setText = (selector, value, options = {}) => {
    if (!value) return;
    const { skipIfHasChildSelector } = options;
    document.querySelectorAll(selector).forEach((el) => {
      if (skipIfHasChildSelector && el.querySelector(skipIfHasChildSelector)) return;
      el.textContent = value;
    });
  };

  const setAttr = (selector, attr, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach((el) => { el.setAttribute(attr, value); });
  };

  const getPageId = () => {
    const rawPath = (window.location.pathname || '/').replace(/\.html?$/i, '');
    const trimmed = rawPath === '/' ? '/' : rawPath.replace(/\/$/, '');
    if (trimmed === '/' || trimmed === '') return 'home';

    const parts = trimmed.split('/').filter(Boolean);
    if (parts[0] === 'near' && parts[1]) return `near_${parts[1]}`;
    return parts[0] || 'page';
  };

  const withUtm = (rawUrl, campaign) => {
    if (!rawUrl || !campaign) return rawUrl;
    try {
      const url = new URL(rawUrl, window.location.origin);
      url.searchParams.set('utm_source', 'website');
      const isCalendly = url.hostname.includes('calendly.com');
      url.searchParams.set('utm_medium', isCalendly ? 'calendly' : 'booking');
      url.searchParams.set('utm_campaign', campaign);
      return url.toString();
    } catch {
      return rawUrl;
    }
  };

  const encodeQueryParam = (value) => encodeURIComponent(String(value)).replace(/%20/g, '+');

  const toGoogleMapsSearchUrl = (query) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeQueryParam(query)}`;

  const normalizeBookPath = (pathname) => {
    if (!pathname) return '';
    const normalized = pathname.replace(/\/+$/, '').toLowerCase() || '/';
    const legacyMatch = normalized.match(/^\/book-free-intro(kids|teens|adults)$/);
    if (legacyMatch) return `/book-free-intro/${legacyMatch[1]}`;
    return normalized;
  };

  const getLaneFromBookPath = (pathname) => {
    const normalized = normalizeBookPath(pathname);
    if (normalized === '/book-free-intro/kids') return 'kids';
    if (normalized === '/book-free-intro/teens') return 'teens';
    if (normalized === '/book-free-intro/adults') return 'adults';
    return '';
  };

  const isBookIntroPath = (pathname) => {
    const normalized = normalizeBookPath(pathname);
    return normalized === '/book-free-intro'
      || normalized === '/book-free-intro/kids'
      || normalized === '/book-free-intro/teens'
      || normalized === '/book-free-intro/adults';
  };

  const buildLocationRegex = (phrases) => {
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sorted = [...phrases].sort((a, b) => b.length - a.length);
    return new RegExp(`\\b(?:${sorted.map(escapeRegex).join('|')})\\b`, 'g');
  };

  const autoLinkLocations = () => {
      const locationQueries = {
      Tannersville: '5VW8+52 Tannersville, New York',
      'Haines Falls': 'Haines Falls, NY',
      Hunter: 'Hunter, NY',
      'Elka Park': 'Elka Park, NY',
      'Onteora Park': 'Onteora Park, NY',
      Lanesville: 'Lanesville, NY',
      Windham: 'Windham, NY',
      Palenville: 'Palenville, NY',
      Jewett: 'Jewett, NY',
      Lexington: 'Lexington, NY',
      Catskill: 'Catskill, NY',
      Saugerties: 'Saugerties, NY',
      Phoenicia: 'Phoenicia, NY',
      Woodstock: 'Woodstock, NY',
      'Hunter Mountain': 'Hunter Mountain, NY',
      'Windham Mountain Club': 'Windham Mountain Club, Windham, NY',
      'Kaaterskill Falls': 'Kaaterskill Falls, NY',
      'North-South Lake': 'North-South Lake, NY',
      'Kaaterskill Falls & North-South Lake': 'Kaaterskill Falls, NY',
      'Kaaterskill Falls and North-South Lake': 'Kaaterskill Falls, NY',
      'Esopus Creek': 'Esopus Creek, NY',
      'Esopus Creek & Phoenicia': 'Esopus Creek, Phoenicia, NY',
      'Esopus Creek and Phoenicia': 'Esopus Creek, Phoenicia, NY'
    };

    const phrases = Object.keys(locationQueries);
    if (!phrases.length) return;

    const regex = buildLocationRegex(phrases);
    const excludedSelector = 'a,script,style,textarea,input,select,option,code,pre,noscript,svg';

    const roots = [...document.querySelectorAll('main, footer')];
    const scopes = roots.length ? roots : [document.body];

    scopes.forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];

      let node;
      while ((node = walker.nextNode())) {
        const text = node.nodeValue;
        if (!text || !text.trim()) continue;

        const parent = node.parentElement;
        if (!parent) continue;
        if (parent.closest(excludedSelector)) continue;
        if (parent.closest('[data-ss-no-location-links]')) continue;

        if (!regex.test(text)) {
          regex.lastIndex = 0;
          continue;
        }
        regex.lastIndex = 0;
        nodes.push(node);
      }

      nodes.forEach((textNode) => {
        const text = textNode.nodeValue;
        if (!text) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const matchText = match[0];
          const index = match.index;

          if (index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
          }

          const query = locationQueries[matchText] || matchText;
          const link = document.createElement('a');
          link.className = 'ss-location-link';
          link.href = toGoogleMapsSearchUrl(query);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = matchText;
          fragment.appendChild(link);

          lastIndex = index + matchText.length;
        }

        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        textNode.parentNode?.replaceChild(fragment, textNode);
      });
    });
  };

  const applyPrimaryPhoneFields = () => {
    document.querySelectorAll('[data-primary-phone]').forEach((el) => {
      el.textContent = PRIMARY_PHONE_DISPLAY;
    });
    document.querySelectorAll('[data-primary-phone-sms-link]').forEach((el) => {
      if (PRIMARY_SMS_LINK) {
        el.setAttribute('href', PRIMARY_SMS_LINK);
      }
    });
    document.querySelectorAll('[data-primary-phone-link]').forEach((el) => {
      if (PRIMARY_PHONE_LINK) {
        el.setAttribute('href', PRIMARY_PHONE_LINK);
      }
    });
    document.querySelectorAll('[data-primary-phone-aria]').forEach((el) => {
      const template = el.getAttribute('data-primary-phone-aria') || '';
      if (template) {
        el.setAttribute('aria-label', template.replace('{phone}', PRIMARY_PHONE_DISPLAY));
      }
    });
    document.querySelectorAll('[data-primary-phone-aria-text]').forEach((el) => {
      const template = el.getAttribute('data-primary-phone-aria-text') || '';
      if (template) {
        el.setAttribute('aria-label', template.replace('{phone}', PRIMARY_PHONE_DISPLAY));
      }
    });
    document.querySelectorAll('[data-primary-phone-aria-call]').forEach((el) => {
      const template = el.getAttribute('data-primary-phone-aria-call') || '';
      if (template) {
        el.setAttribute('aria-label', template.replace('{phone}', PRIMARY_PHONE_DISPLAY));
      }
    });
  };

  const updateJsonLdTelephones = () => {
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      try {
        const text = script.textContent;
        if (!text) return;
        const updated = text.replace(/"telephone"\s*:\s*"[^"]*"/g, `"telephone":"${PRIMARY_PHONE}"`);
        if (updated !== text) {
          script.textContent = updated;
        }
      } catch (error) {
        // ignore invalid JSON
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const laneAges = cfg.laneAges || { kids: '5–9', teens: '10–17', adults: '18+' };
    applyPrimaryPhoneFields();
    updateJsonLdTelephones();

    const applyAcademyDataElements = () => {
      // Email
      document.querySelectorAll('[data-academy-email]').forEach((el) => {
        if (el.tagName === 'A') {
          el.setAttribute('href', `mailto:${academyData.email}`);
          if (el.textContent.includes('@')) {
            el.textContent = academyData.email;
          }
        } else {
          el.textContent = academyData.email;
        }
      });
      // Address
      document.querySelectorAll('[data-academy-address]').forEach((el) => {
        el.textContent = academyData.address;
      });
      // Times
      document.querySelectorAll('[data-academy-youth-time]').forEach((el) => {
        el.textContent = academyData.youthTime;
      });
      document.querySelectorAll('[data-academy-adult-time]').forEach((el) => {
        el.textContent = academyData.adultTime;
      });
      document.querySelectorAll('[data-academy-saturday-time]').forEach((el) => {
        el.textContent = academyData.saturdayTime;
      });
      // Prices
      document.querySelectorAll('[data-academy-private-price]').forEach((el) => {
        el.textContent = academyData.privatePrice;
      });
      document.querySelectorAll('[data-academy-youth-semester-price]').forEach((el) => {
        el.textContent = academyData.youthSemesterPrice;
      });
      document.querySelectorAll('[data-academy-adult-semester-price]').forEach((el) => {
        el.textContent = academyData.adultSemesterPrice;
      });
    };
    applyAcademyDataElements();

    const applySiteFactsElements = () => {
      document.querySelectorAll('[data-site-fact]').forEach((el) => {
        const factKey = el.getAttribute('data-site-fact');
        if (siteFacts[factKey] !== undefined) {
          const value = siteFacts[factKey];
          if (el.tagName === 'A') {
            if (factKey === 'phone') {
              el.setAttribute('href', `tel:+1${value.replace(/\D/g, '')}`);
            } else if (factKey === 'email') {
              el.setAttribute('href', `mailto:${value}`);
            }
          }
          el.textContent = value;
        }
      });
    };
    applySiteFactsElements();


    if (window.SENSEI_LINK_UTILS?.populateAttributionFields) {
      window.SENSEI_LINK_UTILS.populateAttributionFields(document);
    }

    const pageId = getPageId();
    const smsHref = cfg.smsNumber ? `sms:${cfg.smsNumber}` : '';
    const textHref = cfg.secondaryCtaUrl || SECONDARY_CTA_URL || smsHref || window.PRIMARY_PHONE_LINK || '';
    const ctaLabel = PRIMARY_CTA_LABEL;
    const canonicalIntroBase = cfg.bookIntroUrl || cfg.canonicalIntroUrl || PRIMARY_CTA_URL;
    const canonicalIntro = typeof window.buildBookIntroUrl === 'function'
      ? window.buildBookIntroUrl({ base: canonicalIntroBase })
      : canonicalIntroBase;
    const sharedMicrocopy = 'Tour first. Safety walkthrough. Beginner Lane. Skill-first first class. Reschedule by text.';
    window.CTA_CONFIG = window.CTA_CONFIG || {};
    window.CTA_CONFIG.introHref = canonicalIntro;
    window.CTA_CONFIG.introLabel = PRIMARY_CTA_LABEL;
    window.CTA_CONFIG.textHref = textHref;
    window.CTA_CONFIG.textLabel = SECONDARY_CTA_LABEL;
    window.CTA_CONFIG.microcopy = sharedMicrocopy;
    setText('[data-cta-microcopy]', sharedMicrocopy);
    setAttr('[data-cta-target="intro"]:not(.js-calendly-open)', 'href', canonicalIntro);
    setAttr('[data-cta-target="intro"]', 'aria-label', `${PRIMARY_CTA_LABEL} - opens booking page`);
    setAttr('[data-cta-target="text"]', 'href', textHref);
    setAttr('[data-cta-target="text"]', 'aria-label', `${SECONDARY_CTA_LABEL} - fastest replies`);

    setText('[data-lane-age="kids"]', laneAges.kids);
    setText('[data-lane-age="teens"]', laneAges.teens);
    setText('[data-lane-age="adults"]', laneAges.adults);

    // Keep internal /book-free-intro links canonical (clean URL, no tracking params).
    if (typeof window.buildBookIntroUrl === 'function') {
      document.querySelectorAll('a[href]').forEach((link) => {
        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#')) return;
        if (rawHref.startsWith('mailto:') || rawHref.startsWith('sms:') || rawHref.startsWith('tel:')) return;
        try {
          const parsed = new URL(rawHref, window.location.origin);
          if (parsed.hostname.replace(/^www\./i, '').toLowerCase() !== 'senseisandy.com') return;
          if (!isBookIntroPath(parsed.pathname)) return;
          const lane = (link.dataset.ctaLane || getLaneFromBookPath(parsed.pathname) || '').toLowerCase();
          const src = link.dataset.trackingSrc || '';
          const loc = link.dataset.ctaLoc || '';
          link.setAttribute('href', window.buildBookIntroUrl({
            base: parsed.toString(),
            lane,
            src,
            loc
          }));
        } catch (error) {
          // ignore invalid link values
        }
      });
    }

    // Hero / CTA buttons
    setText('[data-sensei-apply-text]', ctaLabel, { skipIfHasChildSelector: '[data-sensei-apply-text]' });
    setAttr('[data-sensei-apply-cta]', 'aria-label', `${ctaLabel} - opens scheduling popup`);
    setAttr('[data-sensei-apply-cta]', 'href', canonicalIntro);
    setAttr('[data-sensei-calendly]', 'href', canonicalIntro);

    // UTM-tag all Calendly links (per page + CTA type)
    const detectCtaType = (el) => {
      const explicit = (el.getAttribute('data-ss-cta-type') || '').trim().toLowerCase();
      if (explicit) return explicit;
      if (el.hasAttribute('data-sensei-apply-cta')) return 'grand_slam';

      const label = `${el.getAttribute('aria-label') || ''} ${el.textContent || ''}`.toLowerCase();
      if (label.includes('grand slam')) return 'grand_slam';
      if (label.includes('intro pack')) return 'intropack';
      if (label.includes('intro week')) return 'intro_week';
      if (label.includes('intro')) return 'grand_slam';
      if (label.includes('free')) return 'grand_slam';
      if (label.includes('annual') || label.includes('black belt')) return 'annual';
      if (label.includes('core') || label.includes('young leader') || label.includes('executive') || label.includes('longevity') || label.includes('culture')) return 'core';
      if (label.includes('apply')) return 'grand_slam';
      return 'cta';
    };

    document.querySelectorAll('a[href*="calendly.com/"]').forEach((link) => {
      const type = detectCtaType(link);
      const campaign = `${pageId}_${type}`;
      const updated = withUtm(link.getAttribute('href') || '', campaign);
      if (updated) link.setAttribute('href', updated);
    });

    // Month + scarcity
    const monthLabel = cfg.currentMonthLabel || defaultMonthLabel || '';
    setText('[data-sensei-month-label]', monthLabel);

    // SMS link
    if (cfg.smsNumber) {
      const smsHref = `sms:${cfg.smsNumber}`;
      setAttr('[data-sensei-sms]', 'href', smsHref);
      setText('[data-sensei-sms-text]', cfg.smsNumber);
    }

    autoLinkLocations();
    });
  })();
