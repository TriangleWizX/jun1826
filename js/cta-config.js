(function () {
  const normalizePhone = (value) => {
    if (!value) return '';
    const digits = value.replace(/[^+\d]/g, '');
    return digits.startsWith('+') ? digits : `+${digits}`;
  };

  const senseiCfg = window.SENSEI_CONFIG || {};
  const defaultPhone = '+19177368649';
  const smsNumber = normalizePhone(senseiCfg.smsNumber || defaultPhone);
  const primaryPhone = normalizePhone(senseiCfg.primaryPhone || senseiCfg.phoneNumber || smsNumber || defaultPhone);
  const smsHref = smsNumber ? `sms:${smsNumber}` : '';
  const callHref = primaryPhone ? `tel:${primaryPhone}` : '';
  const stickyCalendlyUrl = 'https://calendly.com/senseisandy?primary_color=e05500';

  const defaultIntroHref = senseiCfg.introHref
    || senseiCfg.bookIntroUrl
    || senseiCfg.canonicalIntroUrl
    || senseiCfg.calendlyUrl
    || 'https://calendly.com/senseisandy?background_color=f8f8f8&primary_color=68963c&text_color=333';
  const primaryCtaLabel = senseiCfg.primaryCtaLabel || window.PRIMARY_CTA_LABEL || 'Reserve Free Intro';
  const primaryCtaHref = senseiCfg.primaryCtaUrl || window.PRIMARY_CTA_URL || defaultIntroHref;
  const secondaryCtaLabel = senseiCfg.secondaryCtaLabel || window.SECONDARY_CTA_LABEL || 'Text Sandy First';
  const secondaryCtaHref = senseiCfg.secondaryCtaUrl || window.SECONDARY_CTA_URL || smsHref || `sms:${defaultPhone}`;
  const directionsCtaLabel = senseiCfg.directionsLabel || 'Directions';
  const directionsCtaHref = senseiCfg.directionsHref
    || senseiCfg.directionsUrl
    || 'https://www.google.com/maps/dir//Sensei+Sandy+BJJ,+6045+Main+St,+Tannersville,+NY+12485/@42.1954787,-74.13495,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x89ddad923f824fc1:0x7b2f25b6317b39f3!2m2!1d-74.13495!2d42.1954787?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D';
  const defaults = {
    directionsLabel: directionsCtaLabel,
    directionsHref: directionsCtaHref,
    introLabel: primaryCtaLabel,
    introHref: primaryCtaHref,
    call15Label: secondaryCtaLabel,
    call15Href: secondaryCtaHref,
    textLabel: secondaryCtaLabel,
    textHref: secondaryCtaHref,
    scheduleLabel: 'Schedule',
    scheduleHref: '/schedule',
    microcopy: 'Beginner Lane. Reschedule by text. Calm first class.',
    phoneLabel: primaryPhone ? `Call ${primaryPhone}` : 'Call',
    phoneHref: callHref
  };

  window.CTA_CONFIG = {
    ...defaults,
    ...(window.CTA_CONFIG || {})
  };

  const ctaMap = {
    directions: { labelKey: 'directionsLabel', hrefKey: 'directionsHref' },
    intro: { labelKey: 'introLabel', hrefKey: 'introHref' },
    call15: { labelKey: 'call15Label', hrefKey: 'call15Href' },
    text: { labelKey: 'textLabel', hrefKey: 'textHref' },
    schedule: { labelKey: 'scheduleLabel', hrefKey: 'scheduleHref' }
  };

  const mobileQuery = window.matchMedia('(max-width: 991.98px)');
  let footerObserver = null;

  const getPathname = () => {
    const path = (window.location.pathname || '/').replace(/\/$/, '');
    return path || '/';
  };

  const normalizePath = (pathname) => {
    if (!pathname) return '/';
    return pathname.replace(/\/+$/, '').toLowerCase() || '/';
  };

  const isRootBookIntroPath = (pathname) => normalizePath(pathname) === '/book-free-intro';

  const isBookIntroPage = () => {
    const path = normalizePath(window.location.pathname || '/');
    return path === '/book-free-intro'
      || path === '/book-free-intro/kids'
      || path === '/book-free-intro/teens'
      || path === '/book-free-intro/adults';
  };

  const isGlossaryPage = () => {
    const path = normalizePath(window.location.pathname || '/');
    return path === '/bjj-glossary' || path.startsWith('/bjj-glossary/');
  };

  const isPrivateLessonsPage = () => normalizePath(window.location.pathname || '/') === '/private-lessons';

  const isAdultBjjPage = () => normalizePath(window.location.pathname || '/') === '/adult-bjj';

  const shouldEnableLegacySticky = () => false;

  const setText = (el, value) => {
    if (!value) return;
    el.textContent = value;
  };

  const setLink = (el, href, ariaLabel) => {
    if (!href) return;
    el.setAttribute('href', href);
    if (ariaLabel) {
      el.setAttribute('aria-label', ariaLabel);
    }
  };

  const buildIntroHref = (el) => {
    const src = el?.dataset?.trackingSrc || '';
    const loc = el?.dataset?.ctaLoc || '';
    const lane = el?.dataset?.ctaLane || document.body?.dataset?.audience || '';
    if (typeof window.buildBookIntroUrl === 'function') {
      return window.buildBookIntroUrl({ loc, src, lane });
    }

    const base = window.CTA_CONFIG?.introHref || primaryCtaHref || defaultIntroHref;
    try {
      const url = new URL(base, window.location.origin);
      const normalizedLane = window.SENSEI_LINK_UTILS?.normalizeLane?.(lane);
      if (url.hostname === window.location.hostname) {
        url.pathname = '/book-free-intro';
      }
      const hostname = url.hostname.replace(/^www\./i, '').toLowerCase();
      const internalBookIntro = hostname === 'senseisandy.com'
        && url.pathname.replace(/\/+$/, '').startsWith('/book-free-intro');
      if (internalBookIntro) {
        url.search = '';
        if (normalizedLane) {
          url.hash = normalizedLane;
        }
      }
      return url.toString();
    } catch (err) {
      return base;
    }
  };

  const resolveCta = (target, el) => {
    const config = window.CTA_CONFIG;
    const map = ctaMap[target];
    if (!map) return null;
    const label = config[map.labelKey];
    const href = target === 'intro' ? buildIntroHref(el) : config[map.hrefKey];
    return { label, href };
  };

  const applyCtaToNode = (el, target) => {
    if (!el || !target) return;
    const overrideLabel = el.dataset.ctaLabel;
    const overrideHref = el.dataset.ctaHref;
    const overrideAria = el.dataset.ctaAria;
    const resolved = resolveCta(target, el);
    if (!resolved) return;

    const label = overrideLabel || resolved.label;
    const href = overrideHref || resolved.href;
    const ariaLabel = overrideAria || label;
    const textTarget = el.querySelector('[data-cta-text]') || el;
    const existingHref = (el.getAttribute('href') || '').trim();
    const hasExistingPhoneHref = /^sms:|^tel:/i.test(existingHref);
    const shouldPreserveExistingHref = hasExistingPhoneHref && !overrideHref;

    setText(textTarget, label);
    if (!shouldPreserveExistingHref) {
      setLink(el, href, ariaLabel);
    } else if (ariaLabel) {
      el.setAttribute('aria-label', ariaLabel);
    }
    if (target === 'directions') {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  };

  const ensureTextCallPairs = () => {
    const isBlog = document.body?.classList.contains('page-blog')
      || window.location.pathname.startsWith('/blog/');
    if (isBlog) return;

    const groupSelector = [
      'section .hero__cta',
      'section .ss-hero__ctas',
      'section .ss-book__inner',
      'section .lane-card__actions',
      'section .cta-alternate',
      'section [aria-label="Book or text"]',
      'section [aria-label="Text or call"]',
      'section [aria-label="Book or text/call"]'
    ].join(', ');

    document.querySelectorAll(groupSelector).forEach((group) => {
      const textNode = group.querySelector('[data-cta-target="text"], a[href^="sms:"]');
      const phoneNode = group.querySelector('[data-cta-target="phone"], a[href^="tel:"]');

      if (textNode && !phoneNode) {
        const template = textNode.closest('a') || textNode;
        const addPhone = document.createElement('a');
        addPhone.className = template.className || 'btn btn-outline-primary';
        addPhone.setAttribute('data-cta-target', 'phone');
        addPhone.setAttribute('data-auto-cta-pair', 'phone');
        group.appendChild(addPhone);
      }

      if (phoneNode && !textNode) {
        const template = phoneNode.closest('a') || phoneNode;
        const addText = document.createElement('a');
        addText.className = template.className || 'btn btn-outline-primary';
        addText.setAttribute('data-cta-target', 'text');
        addText.setAttribute('data-auto-cta-pair', 'text');
        group.appendChild(addText);
      }
    });
  };

  const applyCtas = () => {
    ensureTextCallPairs();

    document.querySelectorAll('[data-cta-target]').forEach((el) => {
      if (el.classList.contains('js-calendly-open')) return;
      applyCtaToNode(el, el.dataset.ctaTarget);
    });

    document.querySelectorAll('[data-cta-microcopy]').forEach((el) => {
      el.textContent = window.CTA_CONFIG.microcopy || '';
    });

    const phoneTargets = document.querySelectorAll('[data-cta-target="phone"]');
    phoneTargets.forEach((el) => {
      const label = window.CTA_CONFIG.phoneLabel;
      const href = window.CTA_CONFIG.phoneHref;
      setText(el, label);
      setLink(el, href, label);
    });

    const disablePopupOnBookPages = isBookIntroPage();
    document.querySelectorAll('a[href]').forEach((link) => {
      if (link.classList.contains('js-calendly-open')) return;

      const rawHref = link.getAttribute('href') || '';
      if (!rawHref || rawHref.startsWith('#')) return;
      if (rawHref.startsWith('mailto:') || rawHref.startsWith('sms:') || rawHref.startsWith('tel:')) return;

      let parsed;
      try {
        parsed = new URL(rawHref, window.location.origin);
      } catch (error) {
        return;
      }

      const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
      if (host !== 'senseisandy.com' && host !== window.location.hostname.replace(/^www\./i, '').toLowerCase()) return;
      if (!isRootBookIntroPath(parsed.pathname)) return;
      if (parsed.hash) {
        if (link.getAttribute('data-calendly-popup') === stickyCalendlyUrl) {
          link.removeAttribute('data-calendly-popup');
        }
        return;
      }

      if (disablePopupOnBookPages) {
        if (link.getAttribute('data-calendly-popup') === stickyCalendlyUrl) {
          link.removeAttribute('data-calendly-popup');
        }
        return;
      }

      link.setAttribute('data-calendly-popup', stickyCalendlyUrl);
    });
  };

  const removeDesktopBar = () => {
    const existing = document.querySelector('.desktop-sticky-cta');
    if (existing) existing.remove();
  };

  const handleMobileChange = () => {
    if (!shouldEnableLegacySticky()) {
      removeDesktopBar();
      return;
    }
    removeDesktopBar();
  };

  const initSticky = () => {
    handleMobileChange();
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleMobileChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(handleMobileChange);
    }
  };

  const init = () => {
    applyCtas();
    initSticky();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
