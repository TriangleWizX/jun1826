(() => {
  const ATTR_STORAGE_KEY = 'sensei_attribution_v1';

  const readStoredAttribution = () => {
    if (window.SENSEI_LINK_UTILS?.readStoredAttribution) {
      const stored = window.SENSEI_LINK_UTILS.readStoredAttribution();
      return stored && typeof stored === 'object' ? stored : {};
    }
    try {
      const raw = window.sessionStorage?.getItem(ATTR_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const getAttribution = () => {
    const params = new URLSearchParams(window.location.search || '');
    const stored = readStoredAttribution();
    return {
      utm_source: stored.utm_source || params.get('utm_source') || 'website',
      utm_medium: stored.utm_medium || params.get('utm_medium') || 'organic',
      utm_campaign: stored.utm_campaign || params.get('utm_campaign') || 'evergreen',
      utm_content: stored.utm_content || params.get('utm_content') || '',
      src: stored.src || params.get('src') || ''
    };
  };

  const getPageType = () => {
    const body = document.body;
    if (body) {
      if (body.classList.contains('page-book-intro')) return 'booking';
      if (body.classList.contains('page-contact')) return 'contact';
      if (body.classList.contains('page-programs')) return 'programs';
      if (body.classList.contains('page-blog')) return 'blog';
      if (body.classList.contains('page-near')) return 'near';
      if (body.classList.contains('page-home')) return 'home';
    }
    const path = (window.location.pathname || '').toLowerCase();
    if (path.startsWith('/book-free-intro')) return 'booking';
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/programs') || path.startsWith('/bjj-classes-tannersville-ny')) return 'programs';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/near')) return 'near';
    return 'site';
  };

  const sendEvent = (name, params = {}) => {
    const payload = {
      ...params,
      page_type: params.page_type || getPageType(),
      ...getAttribution()
    };
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
      return;
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...payload });
    }
  };

  const normalizeProgram = (value) => {
    const raw = String(value || '').toLowerCase();
    if (!raw) return 'generic';
    if (raw === 'kids' || raw === 'teens' || raw === 'adult' || raw === 'adults') {
      return raw === 'adults' ? 'adult' : raw;
    }
    if (raw === 'youth') return 'kids';
    return 'generic';
  };

  const getProgram = (el) => {
    if (el?.dataset?.program) return normalizeProgram(el.dataset.program);
    const audience = document.body?.dataset?.audience;
    return normalizeProgram(audience);
  };

  const getLocation = (el) => {
    return (
      el?.dataset?.location
      || el?.dataset?.ctaLoc
      || window.SENSEI_BOOKING_LOCATION
      || 'tannersville'
    );
  };

  const getCtaPosition = (el) => {
    const container = el?.closest?.('[data-cta-position]');
    return el?.dataset?.ctaPosition || container?.dataset?.ctaPosition || el?.dataset?.ctaSrc || 'inline';
  };

  const getLane = (el) => {
    const direct = el?.dataset?.ctaLane || el?.dataset?.lane;
    if (direct) return String(direct).toLowerCase();
    const href = el?.getAttribute?.('href') || '';
    if (href.includes('/kids')) return 'kids';
    if (href.includes('/teens')) return 'teens';
    if (href.includes('/teen-jiu-jitsu-tannersville-ny')) return 'teens';
    if (href.includes('/adult-bjj')) return 'adults';
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('/kids')) return 'kids';
    if (path.includes('/teens')) return 'teens';
    if (path.includes('/teen-jiu-jitsu-tannersville-ny')) return 'teens';
    if (path.includes('/adult-bjj')) return 'adults';
    const audience = document.body?.dataset?.audience;
    if (audience) return String(audience).toLowerCase();
    return 'mixed';
  };

  const getCtaTier = (el, fallback = 'primary') => {
    return String(el?.dataset?.ctaTier || fallback).toLowerCase();
  };

  const getScheduleDay = (el) => {
    const raw = String(el?.dataset?.day || '').toLowerCase();
    if (raw === 'mon') return 'monday';
    if (raw === 'tue') return 'tuesday';
    if (raw === 'wed') return 'wednesday';
    if (raw === 'fri') return 'friday';
    if (raw === 'sat') return 'saturday';
    return 'none';
  };

  const normalizeCtaLabel = (value) => {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  };

  const getPage = () => (window.location.pathname || '/').toLowerCase();

  const isPricingPage = () => {
    const path = getPage().replace(/\/+$/, '') || '/';
    return path === '/options-pricing';
  };

  const getPlacement = (el) => (
    el?.dataset?.ctaPlacement
    || el?.dataset?.ctaPosition
    || el?.dataset?.ctaSrc
    || 'inline'
  );

  const normalizePlacementToken = (value) => (
    String(value || 'inline')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      || 'inline'
  );

  const getDay = (el, href = '') => {
    const fromDataset = getScheduleDay(el);
    if (fromDataset !== 'none') return fromDataset;
    try {
      const url = new URL(href || '', window.location.origin);
      const day = String(url.searchParams.get('day') || '').toLowerCase();
      return day || 'none';
    } catch (error) {
      return 'none';
    }
  };

  const buildCanonicalPayload = (el, href = '', overrides = {}) => ({
    page: getPage(),
    placement: getPlacement(el),
    lane: getLane(el),
    day: getDay(el, href),
    cta_label: normalizeCtaLabel(el?.textContent || ''),
    ...overrides
  });

  const isCalendlyHref = (value) => {
    return /(^|\/\/)([^/]+\.)?calendly\.com(\/|$)/i.test(String(value || ''));
  };

  const getPathFromHref = (href) => {
    if (!href) return '';
    try {
      const url = new URL(href, window.location.origin);
      return (url.pathname || '').toLowerCase();
    } catch (error) {
      return '';
    }
  };

  const isBookIntroPath = (pathname) => {
    if (!pathname) return false;
    const normalized = pathname.replace(/\/+$/, '') || '/';
    return normalized === '/book-free-intro'
      || normalized === '/book-free-intro/kids'
      || normalized === '/book-free-intro/teens'
      || normalized === '/book-free-intro/adults';
  };

  const isHomeHeroCta = (el) => {
    if (!el) return false;
    return el.dataset?.ctaPlacement === 'hero' || el.dataset?.ctaSrc === 'home-hero';
  };

  const getCalendlyTarget = (el) => {
    const href = el?.getAttribute?.('href') || '';
    if (isCalendlyHref(href)) return href;

    const popupUrl = el?.getAttribute?.('data-calendly-popup') || '';
    if (isCalendlyHref(popupUrl)) return popupUrl;

    const dataUrl = el?.dataset?.calendlyUrl || '';
    if (isCalendlyHref(dataUrl)) return dataUrl;

    return '';
  };

  const namedCtaEvents = {
    private_lesson: 'private_lesson_cta_click',
    text_sandy: 'text_sandy_click',
    founders_special: 'founders_special_click',
    single_session: 'single_session_click',
    scribners_booking: 'scribners_booking_click',
    black_belt_concierge: 'black_belt_concierge_click'
  };

  document.addEventListener('click', (e) => {
    const leoEventEl = e.target.closest('[data-leo-event]');
    if (leoEventEl) {
      const leoEventName = String(leoEventEl.dataset?.leoEvent || '').trim();
      if (/^leo_[a-z0-9_]+$/.test(leoEventName)) {
        const href = leoEventEl.getAttribute?.('href') || '';
        sendEvent(leoEventName, {
          ...buildCanonicalPayload(leoEventEl, href, { cta_type: 'leo', leo_event: leoEventName }),
          destination: href,
          cta_position: getCtaPosition(leoEventEl),
          cta_tier: getCtaTier(leoEventEl, 'secondary'),
          location: getLocation(leoEventEl),
          page_path: window.location.pathname
        });
      }
    }

    const introBtn = e.target.closest('[data-event="book_free_intro_click"], [data-cta-target="intro"]');
    if (introBtn) {
      const payload = {
        location: getLocation(introBtn),
        cta_position: getCtaPosition(introBtn),
        cta_tier: getCtaTier(introBtn, 'primary'),
        program: getProgram(introBtn),
        lane: getLane(introBtn),
        page_path: window.location.pathname
      };
      sendEvent('cta_click', buildCanonicalPayload(introBtn, introBtn.getAttribute('href') || '', { cta_type: 'book' }));
      sendEvent('book_intro_click', payload);
      sendEvent('cta_book_free_intro_click', payload);
      sendEvent('book_free_intro_click', payload);
      sendEvent('cta_book_click', payload);
      if (isPricingPage()) {
        sendEvent('pricing_free_intro_click', {
          ...buildCanonicalPayload(introBtn, introBtn.getAttribute('href') || '', { cta_type: 'book' }),
          ...payload
        });
      }
      sendEvent(`${normalizePlacementToken(getPlacement(introBtn))}_primary_reserve_free_intro`, {
        ...buildCanonicalPayload(introBtn, introBtn.getAttribute('href') || '', { cta_type: 'book' }),
        ...payload
      });
      if (isHomeHeroCta(introBtn)) {
        sendEvent('hero_primary_reserve_free_intro', {
          ...buildCanonicalPayload(introBtn, introBtn.getAttribute('href') || '', { cta_type: 'book' }),
          ...payload
        });
      }
      if (introBtn.dataset?.event === 'free_intro_after_glossary_click') {
        sendEvent('free_intro_after_glossary_click', {
          ...buildCanonicalPayload(introBtn, introBtn.getAttribute('href') || '', { cta_type: 'book_after_glossary' }),
          ...payload
        });
      }
    }

    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href') || '';
      const pathFromHref = getPathFromHref(href);
      const calendlyTarget = getCalendlyTarget(link);
      const isSms = href.startsWith('sms:');
      const isTel = href.startsWith('tel:');
      const isBookIntro = isBookIntroPath(pathFromHref);
      const instagramBookingEvent = String(link.dataset?.instagramBookingEvent || '').trim();
      const linkEvent = String(link.dataset?.event || '').toLowerCase();
      const namedCtaType = String(link.dataset?.ssCtaType || '').toLowerCase();
      const namedCtaEvent = namedCtaEvents[namedCtaType];

      if (instagramBookingEvent) {
        sendEvent(instagramBookingEvent, {
          ...buildCanonicalPayload(link, href, {
            cta_type: isSms ? 'text' : (href.startsWith('#') ? 'jump' : 'book')
          }),
          destination: href,
          cta_position: getCtaPosition(link),
          cta_tier: getCtaTier(link, isSms ? 'secondary' : 'primary'),
          location: getLocation(link),
          page_path: window.location.pathname
        });
      }

      if (namedCtaEvent) {
        sendEvent(namedCtaEvent, {
          ...buildCanonicalPayload(link, calendlyTarget || href, { cta_type: namedCtaType }),
          destination: calendlyTarget || href,
          cta_position: getCtaPosition(link),
          cta_tier: getCtaTier(link, namedCtaType === 'text_sandy' ? 'secondary' : 'primary'),
          location: getLocation(link),
          page_path: window.location.pathname
        });
      }

      if (linkEvent === 'glossary_home_click') {
        sendEvent('glossary_home_click', {
          ...buildCanonicalPayload(link, href, { cta_type: 'glossary_browse' }),
          term: 'all',
          term_name: 'all'
        });
      }

      if (linkEvent === 'glossary_term_card_click') {
        sendEvent('glossary_term_card_click', {
          ...buildCanonicalPayload(link, href, { cta_type: 'glossary_term' }),
          term: String(link.dataset?.term || '').toLowerCase() || 'unknown',
          term_name: link.dataset?.termName || 'Unknown'
        });
      }

      if (link.dataset.scheduleCta === '1') {
        const rawLane = String(link.dataset.bookLane || link.dataset.satLane || getLane(link) || 'mixed').toLowerCase();
        const lane = rawLane === 'all' ? 'mixed' : rawLane;
        const ctaLabel = normalizeCtaLabel(link.textContent || '');
        sendEvent('schedule_cta_click', {
          cta_label: ctaLabel,
          cta_placement: link.dataset.ctaPlacement || 'unknown',
          source_page: 'schedule',
          lane,
          day: getScheduleDay(link),
          target_url: href,
          page_path: window.location.pathname
        });
        sendEvent('cta_click', buildCanonicalPayload(link, href, { cta_type: 'schedule' }));
      }

      if (link.hasAttribute('data-schedule-table-calendar')) {
        sendEvent('schedule_add_calendar_click', {
          page: getPage(),
          placement: 'schedule_table',
          lane: getLane(link),
          day: getDay(link, href),
          cta_label: normalizeCtaLabel(link.textContent || 'add'),
          target_url: href
        });
        sendEvent('cta_click', buildCanonicalPayload(link, href, { cta_type: 'calendar_add' }));
      }

      if (isSms || isTel) {
        const payload = {
          method: isSms ? 'sms' : 'tel',
          lane: getLane(link),
          cta_position: getCtaPosition(link),
          cta_tier: getCtaTier(link, 'secondary'),
          location: getLocation(link),
          program: getProgram(link),
          page_path: window.location.pathname
        };
        sendEvent(isSms ? 'sms_click' : 'phone_click', payload);
        sendEvent(isSms ? 'text_click' : 'call_click', {
          ...buildCanonicalPayload(link, href, { cta_type: isSms ? 'text' : 'call' }),
          ...payload
        });
        if (isPricingPage() && isSms) {
          sendEvent('pricing_text_click', {
            ...buildCanonicalPayload(link, href, { cta_type: isSms ? 'text' : 'call' }),
            ...payload
          });
        }
        sendEvent(isSms ? 'cta_text_click' : 'cta_call_click', payload);
        sendEvent('cta_click', buildCanonicalPayload(link, href, { cta_type: isSms ? 'text' : 'call' }));
        if (isSms) {
          sendEvent(`${normalizePlacementToken(getPlacement(link))}_secondary_text_pick_lane`, {
            ...buildCanonicalPayload(link, href, { cta_type: 'text' }),
            ...payload
          });
        }
        if (isSms && isHomeHeroCta(link)) {
          sendEvent('hero_secondary_text_pick_lane', {
            ...buildCanonicalPayload(link, href, { cta_type: 'text' }),
            ...payload
          });
        }
        if (isSms && getPage() === '/book-free-intro') {
          sendEvent('book_text_help_click', {
            ...buildCanonicalPayload(link, href, { cta_type: 'text_help' }),
            ...payload
          });
        }
      }

      if (calendlyTarget) {
        sendEvent('booking_start', buildCanonicalPayload(link, calendlyTarget, { cta_type: 'calendly' }));
        sendEvent('calendly_outbound_click', {
          destination: calendlyTarget,
          destination_host: 'calendly.com',
          lane: getLane(link),
          cta_position: getCtaPosition(link),
          cta_tier: getCtaTier(link, 'primary'),
          location: getLocation(link),
          page_path: window.location.pathname,
          transport_type: 'beacon'
        });
      }

      if (isBookIntro && !introBtn) {
        const payload = {
          location: getLocation(link),
          cta_position: getCtaPosition(link),
          cta_tier: getCtaTier(link, 'primary'),
          program: getProgram(link),
          lane: getLane(link),
          page_path: window.location.pathname
        };
        sendEvent('book_intro_click', payload);
        sendEvent('cta_book_free_intro_click', payload);
        sendEvent('cta_click', buildCanonicalPayload(link, href, { cta_type: 'book' }));
        if (isPricingPage()) {
          sendEvent('pricing_free_intro_click', {
            ...buildCanonicalPayload(link, href, { cta_type: 'book' }),
            ...payload
          });
        }
      }

      if (isPricingPage() && pathFromHref === '/schedule') {
        sendEvent('schedule_click', buildCanonicalPayload(link, href, { cta_type: 'schedule' }));
      }

      if (
        pathFromHref === '/kids' || pathFromHref === '/teens' || pathFromHref === '/teen-jiu-jitsu-tannersville-ny' || pathFromHref === '/adult-bjj'
        || pathFromHref === '/book-free-intro/kids' || pathFromHref === '/book-free-intro/teens' || pathFromHref === '/book-free-intro/adults'
      ) {
        const lanePayload = {
          lane: getLane(link),
          location: getLocation(link),
          page_path: window.location.pathname
        };
        sendEvent('lane_select', lanePayload);
        if (getPage() === '/book-free-intro') {
          const lane = lanePayload.lane;
          if (lane === 'kids') sendEvent('book_kids_lane_click', lanePayload);
          if (lane === 'teens') sendEvent('book_teens_lane_click', lanePayload);
          if (lane === 'adults') sendEvent('book_adults_lane_click', lanePayload);
        }
      }

      if (pathFromHref === '/waiver') {
        const payload = {
          location: getLocation(link),
          cta_position: getCtaPosition(link),
          page_path: window.location.pathname
        };
        sendEvent('waiver_click', { ...buildCanonicalPayload(link, href, { cta_type: 'waiver' }), ...payload });
      }

      if (pathFromHref === '/show-up-kit') {
        const payload = {
          location: getLocation(link),
          cta_position: getCtaPosition(link),
          page_path: window.location.pathname
        };
        sendEvent('showupkit_click', { ...buildCanonicalPayload(link, href, { cta_type: 'showup_kit' }), ...payload });
        sendEvent('showup_kit_click', payload);
      }

      if (href.includes('maps.google.') || href.includes('google.com/maps') || href.includes('maps.app.goo.gl')) {
        sendEvent('directions_click', {
          location: getLocation(link),
          page_path: window.location.pathname
        });
        if (isPricingPage()) {
          sendEvent('maps_click', {
            ...buildCanonicalPayload(link, href, { cta_type: 'maps' }),
            location: getLocation(link),
            page_path: window.location.pathname
          });
        }
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.startsWith('/thanks')) {
      sendEvent('booking_complete', buildCanonicalPayload(null, '', { placement: 'page_load', cta_type: 'conversion' }));
    }
    if (window.location.pathname.startsWith('/waiver')) {
      sendEvent('waiver_start', { page_path: window.location.pathname });
    }
    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', () => {
        const action = (form.getAttribute('action') || '').toLowerCase();
        const path = (window.location.pathname || '').toLowerCase();
        const lane = getLane(form);
        const payload = {
          lane,
          cta_position: form.dataset.ctaPosition || 'form',
          page_path: window.location.pathname
        };

        if (form.matches('form[data-waiver-form]')) {
          sendEvent('waiver_submit', payload);
        }

        if (action.includes('formspree.io')) {
          if (path.startsWith('/contact')) {
            sendEvent('contact_form_submit', payload);
          } else if (path.startsWith('/bring-a-friend')) {
            sendEvent('friend_pass_submit', payload);
          } else if (path.startsWith('/friday-night-fanatics')) {
            sendEvent('friday_fanatics_submit', payload);
          } else if (path.startsWith('/book-free-intro') || form.matches('form[data-booking-form]')) {
            sendEvent('book_intro_submit', payload);
          }
        }
      });
    });

    if (isPricingPage()) {
      document.querySelectorAll('[data-pricing-tab], [data-pricing-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
          const lane = String(button.dataset.pricingTab || button.dataset.pricingToggle || '').toLowerCase();
          if (lane === 'adults') {
            sendEvent('adult_tab_click', { page: getPage(), placement: 'pricing_toggle', lane: 'adults' });
          }
          if (lane === 'youth') {
            sendEvent('youth_tab_click', { page: getPage(), placement: 'pricing_toggle', lane: 'youth' });
          }
        });
      });

      const pricingCards = Array.from(document.querySelectorAll('[data-pricing-card]'));
      const seenCards = new Set();
      const sendCardView = (card) => {
        const type = String(card.dataset.pricingCard || '').toLowerCase();
        if (!type || seenCards.has(type)) return;
        seenCards.add(type);
        const eventName = {
          core_culture: 'core_culture_card_view',
          concierge: 'concierge_card_view',
          annual: 'annual_card_view'
        }[type];
        if (!eventName) return;
        const panel = card.closest('[data-pricing-panel]');
        sendEvent(eventName, {
          page: getPage(),
          placement: 'pricing_cards',
          lane: panel?.dataset?.pricingPanel || 'mixed',
          card_type: type
        });
      };

      if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            sendCardView(entry.target);
            cardObserver.unobserve(entry.target);
          });
        }, { threshold: 0.45 });
        pricingCards.forEach((card) => cardObserver.observe(card));
      } else {
        pricingCards.forEach(sendCardView);
      }
    }
  });

  window.addEventListener('message', (e) => {
    if (!e?.data || typeof e.data !== 'object') return;
    if (e.data.event !== 'calendly.event_scheduled') return;
    const lane = getLane();
    sendEvent('calendly_scheduled', {
      location: window.SENSEI_BOOKING_LOCATION || 'tannersville',
      lane,
      page_path: window.location.pathname
    });
    sendEvent('booking_complete', buildCanonicalPayload(null, '', {
      lane,
      placement: 'calendly',
      cta_type: 'conversion'
    }));
    sendEvent('book_intro_submit', {
      location: window.SENSEI_BOOKING_LOCATION || 'tannersville',
      lane,
      cta_position: 'calendly',
      page_path: window.location.pathname
    });
    
    // Redirect to Show-Up Kit confirmation path after 1 second (to allow events to dispatch)
    setTimeout(() => {
      window.location.href = '/show-up-kit?booked=true';
    }, 1000);
  });
})();
