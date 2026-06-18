(function () {
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
      // sessionStorage can be blocked
    }
  };

  const extractTrackingParams = (search) => {
    const params = new URLSearchParams(search || window.location.search);
    const tracking = {};
    ATTRIBUTION_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) tracking[key] = value;
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

  const getDeviceType = () => {
    if (!window.matchMedia) return window.innerWidth < 768 ? 'mobile' : 'desktop';
    return window.matchMedia('(max-width: 767.98px)').matches ? 'mobile' : 'desktop';
  };

  const getSourcePage = () => window.location.pathname || '/';

  const readConciergeSource = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      source_page: params.get('source_page') || '',
      source_cta: params.get('source_cta') || '',
      source_placement: params.get('source_placement') || ''
    };
  };

  const populateConciergeFields = (root = document) => {
    const source = readConciergeSource();
    Object.entries(source).forEach(([key, value]) => {
      if (!value) return;
      root.querySelectorAll(`input[name="${key}"], input#${key}`).forEach((el) => {
        el.value = value;
      });
    });
  };

  const getConciergeCtaText = (link) => {
    const explicit = link?.dataset?.conciergeCta;
    if (explicit) return explicit.trim();
    return (link?.textContent || '').replace(/\s+/g, ' ').trim();
  };

  const appendConciergeSourceParams = (link, detail) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('sms:') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch (error) {
      return;
    }
    if (url.origin !== window.location.origin) return;
    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
    if (normalizedPath !== '/black-belt-concierge') return;
    url.searchParams.set('source_page', detail.source_page);
    url.searchParams.set('source_cta', detail.cta_text);
    url.searchParams.set('source_placement', detail.placement_name);
    link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
  };

  const pushConciergeClickEvent = (detail) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'black_belt_concierge_click',
      ...detail
    });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'black_belt_concierge_click', detail);
    }
  };

  const setupConciergeTracking = (root = document) => {
    root.addEventListener('click', (event) => {
      const link = event.target.closest('[data-concierge-link="true"]');
      if (!link) return;
      const detail = {
        source_page: getSourcePage(),
        placement_name: link.dataset.conciergePlacement || link.dataset.ctaPlacement || '',
        cta_text: getConciergeCtaText(link),
        device_type: getDeviceType()
      };
      appendConciergeSourceParams(link, detail);
      pushConciergeClickEvent(detail);
    });
  };

  const normalizeLoc = (loc) => {
    if (!loc) return '';
    const trimmed = String(loc).trim().toLowerCase();
    if (['tannersville', 'kingston'].includes(trimmed)) return trimmed;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      populateConciergeFields(document);
      setupConciergeTracking(document);
    }, { once: true });
  } else {
    populateConciergeFields(document);
    setupConciergeTracking(document);
  }

  window.SENSEI_LINK_UTILS = window.SENSEI_LINK_UTILS || {};
  window.SENSEI_LINK_UTILS.readStoredAttribution = readStoredAttribution;
  window.SENSEI_LINK_UTILS.saveAttribution = saveAttribution;
  window.SENSEI_LINK_UTILS.extractTrackingParams = extractTrackingParams;
  window.SENSEI_LINK_UTILS.getTrackingParams = getTrackingParams;
  window.SENSEI_LINK_UTILS.captureAttributionForSession = captureAttributionForSession;
  window.SENSEI_LINK_UTILS.populateAttributionFields = populateAttributionFields;
  window.SENSEI_LINK_UTILS.populateConciergeFields = populateConciergeFields;
  window.SENSEI_LINK_UTILS.normalizeLoc = normalizeLoc;
  window.SENSEI_LINK_UTILS.normalizeLane = normalizeLane;
  window.buildBookIntroUrl = buildBookIntroUrl;
})();
