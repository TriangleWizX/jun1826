(function loadSingleSourceContent() {
  const DATA_URLS = {
    schedule: '/assets/data/schedule.json',
    pricing: '/assets/data/pricing.json',
    funnel: '/assets/data/funnel.json'
  };

  const BADGE_CLASSES = ['b--gi', 'b--nogi', 'b--mix', 'b--bio'];

  const fetchJson = async (url) => {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) {
      throw new Error(`Failed to load ${url}: ${res.status}`);
    }
    return res.json();
  };

  const toMoney = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '';
    return `$${amount.toLocaleString('en-US')}`;
  };

  const textOr = (value, fallback) => {
    if (typeof value === 'string' && value.trim()) return value;
    return fallback;
  };

  // Dynamic link allowlist: only root-relative and absolute HTTP(S) URLs are trusted.
  // This blocks scriptable or malformed schemes (e.g. javascript:, data:) at render boundaries.
  const safeHref = (value) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('/')) return trimmed;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return '';
  };

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const setText = (selector, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
    });
  };

  const toCompactTime = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])[Mm]$/);
    if (!match) return raw;
    const hour = match[1];
    const mins = match[2];
    const meridiem = match[3].toLowerCase();
    if (mins && mins !== '00') return `${hour}:${mins}${meridiem}`;
    return `${hour}${meridiem}`;
  };

  const ensureRangeMeridiem = (value, fallback = 'PM') => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/(am|pm)/i.test(raw)) return raw;
    return `${raw} ${fallback}`;
  };

  const applySchedule = (schedule) => {
    if (!schedule || typeof schedule !== 'object') return {};

    const laneOrder = Array.isArray(schedule.laneOrder) && schedule.laneOrder.length
      ? schedule.laneOrder
      : ['private', 'youth', 'adults'];
    const lanes = schedule.lanes && typeof schedule.lanes === 'object' ? schedule.lanes : {};

    const laneParts = laneOrder
      .map((laneKey) => {
        const lane = lanes[laneKey];
        if (!lane) return '';
        const label = textOr(lane.label, laneKey);
        const time = textOr(lane.time, '');
        return time ? `${label} ${time}` : label;
      })
      .filter(Boolean);

    const timesBullet = laneParts.join(' • ');
    const timesComma = laneParts.join(', ');

    setText('[data-ss-schedule-best-first]', `Best first class: ${timesComma}`);

    document.querySelectorAll('[data-ss-schedule-times]').forEach((el) => {
      const mode = (el.getAttribute('data-ss-schedule-times') || 'bullet').toLowerCase();
      const value = mode === 'comma' ? timesComma : timesBullet;
      if (value) el.textContent = value;
    });

    document.querySelectorAll('[data-ss-schedule-lane-label]').forEach((el) => {
      const key = el.getAttribute('data-ss-schedule-lane-label');
      if (!key) return;
      const lane = lanes[key];
      if (!lane) return;
      const label = textOr(lane.label, key);
      const age = textOr(lane.age, '');
      el.textContent = age ? `${label} ${age}` : label;
    });

    document.querySelectorAll('[data-ss-schedule-lane-time]').forEach((el) => {
      const key = el.getAttribute('data-ss-schedule-lane-time');
      if (!key) return;
      const lane = lanes[key];
      if (!lane) return;
      const mode = (el.getAttribute('data-ss-schedule-lane-time-mode') || 'time').toLowerCase();
      const shortTime = toCompactTime(lane.time);
      const timeValue = mode === 'short' ? textOr(shortTime, lane.time) : lane.time;
      if (timeValue) {
        el.textContent = timeValue;
      }
    });

    const scheduleDays = schedule.days && typeof schedule.days === 'object' ? schedule.days : {};
    const slotMap = {};
    Object.values(scheduleDays).forEach((day) => {
      (day.slots || []).forEach((slot) => {
        if (slot && slot.id) slotMap[slot.id] = slot;
      });
    });

    document.querySelectorAll('[data-ss-schedule-day-label]').forEach((el) => {
      const dayKey = el.getAttribute('data-ss-schedule-day-label');
      const day = dayKey ? scheduleDays[dayKey] : null;
      if (day && day.label) el.textContent = day.label;
    });

    document.querySelectorAll('[data-ss-schedule-day-note]').forEach((el) => {
      const dayKey = el.getAttribute('data-ss-schedule-day-note');
      const day = dayKey ? scheduleDays[dayKey] : null;
      if (day && day.note) el.textContent = day.note;
    });

    document.querySelectorAll('[data-ss-schedule-slot]').forEach((slotEl) => {
      const slotId = slotEl.getAttribute('data-ss-schedule-slot');
      if (!slotId) return;
      const slot = slotMap[slotId];
      if (!slot) return;

      if (slot.lane) {
        slotEl.setAttribute('data-lane', slot.lane);
      }

      const timeEl = slotEl.querySelector('[data-ss-schedule-field="time"]');
      const classEl = slotEl.querySelector('[data-ss-schedule-field="class"]');
      const badgeEl = slotEl.querySelector('[data-ss-schedule-field="badge"]');

      if (timeEl && slot.time) timeEl.textContent = slot.time;
      if (classEl && slot.class) classEl.textContent = slot.class;

      if (badgeEl && slot.badge) {
        badgeEl.textContent = slot.badge;
      }

      if (badgeEl && slot.badgeTone) {
        BADGE_CLASSES.forEach((className) => badgeEl.classList.remove(className));
        badgeEl.classList.add(`b--${slot.badgeTone}`);
      }
    });

    const scheduleCopyRaw = schedule.copy && typeof schedule.copy === 'object' ? schedule.copy : {};
    const laneShort = (laneKey) => {
      const lane = lanes[laneKey] || {};
      return textOr(toCompactTime(lane.time), lane.time || '');
    };
    const slotTime = (slotId) => textOr(slotMap[slotId] && slotMap[slotId].time, '');

    const scheduleCopy = {
      ...scheduleCopyRaw,
      reassuranceStart: `${laneShort('private')} Private Lessons, ${laneShort('youth')} Youth Class, and ${laneShort('adults')} Adult Class are the main weekday lanes.`,
      microFaqStart: `Join the weekday time that fits: ${laneShort('private')} Private Lessons, ${laneShort('youth')} Youth Class, or ${laneShort('adults')} Adult Class in Tannersville. Text Sandy and we will help you pick the best first class.`,
      privateLaneWeekdays: slotTime('mon-private') ? `Available: Mon, Tue, Wed, Fri • ${ensureRangeMeridiem(slotTime('mon-private'))}` : scheduleCopyRaw.privateLaneWeekdays,
      youthLaneAges: scheduleCopyRaw.youthLaneAges,
      youthLaneWeekdays: slotTime('mon-youth') ? `Available: Mon, Tue, Wed, Fri • ${ensureRangeMeridiem(slotTime('mon-youth'))}` : scheduleCopyRaw.youthLaneWeekdays,
      youthLaneNoGi: slotTime('wed-youth') ? `Wednesday: Youth No-Gi` : scheduleCopyRaw.youthLaneNoGi,
      adultsLaneWeekdays: slotTime('mon-adults') ? `Available: Mon, Tue, Wed, Fri • ${ensureRangeMeridiem(slotTime('mon-adults'))}` : scheduleCopyRaw.adultsLaneWeekdays,
      adultsLaneNoGi: slotTime('wed-adults') ? `Wednesday: Adult No-Gi` : scheduleCopyRaw.adultsLaneNoGi,
      kidsLaneGi: slotTime('mon-youth') ? `Youth class Mon, Tue, Wed, Fri - ${ensureRangeMeridiem(slotTime('mon-youth'))}` : scheduleCopyRaw.kidsLaneGi,
      kidsLaneNoGi: slotTime('sat-kids-nogi') ? `No-Gi Kids block Sat - ${ensureRangeMeridiem(slotTime('sat-kids-nogi'))}` : scheduleCopyRaw.kidsLaneNoGi,
      teensLaneGi: slotTime('mon-youth') ? `Youth class Mon, Tue, Wed, Fri - ${ensureRangeMeridiem(slotTime('mon-youth'))}` : scheduleCopyRaw.teensLaneGi,
      teensLaneNoGi: slotTime('wed-youth') ? `No-Gi youth class Wed - ${ensureRangeMeridiem(slotTime('wed-youth'))}` : scheduleCopyRaw.teensLaneNoGi,
      adultsLaneGi: slotTime('mon-adults') ? `Adult Class Mon, Tue, Fri - ${ensureRangeMeridiem(slotTime('mon-adults'))}` : scheduleCopyRaw.adultsLaneGi,
      adultsLaneNoGi: slotTime('wed-adults') ? `Wednesday: Adult No-Gi` : scheduleCopyRaw.adultsLaneNoGi
    };
    document.querySelectorAll('[data-ss-schedule-copy]').forEach((el) => {
      const key = el.getAttribute('data-ss-schedule-copy');
      if (!key) return;
      const value = scheduleCopy[key];
      if (typeof value === 'string' && value.trim()) {
        el.textContent = value;
      }
    });

    return {
      timesBullet,
      timesComma,
      laneOrder,
      lanes,
      copy: scheduleCopy
    };
  };

  const applyPricing = (pricing, scheduleSummary) => {
    if (!pricing || typeof pricing !== 'object') return {};

    const tracks = pricing.tracks && typeof pricing.tracks === 'object' ? pricing.tracks : {};
    const core = tracks.coreCulture12Weeks || {};
    const lifer = tracks.liferAnnual || {};

    const coreName = textOr(core.name, 'Core Culture (12 Weeks)');
    const liferName = textOr(lifer.name, 'Lifer Annual');

    const coreYouth = toMoney(core.prices && core.prices.youth);
    const coreAdult = toMoney(core.prices && core.prices.adult);
    const liferYouth = toMoney(lifer.prices && lifer.prices.youth);
    const liferAdult = toMoney(lifer.prices && lifer.prices.adult);

    const coreLine = `${coreName}: Youth ${coreYouth} • Adult ${coreAdult}`;

    const guarantee = pricing.guarantee && typeof pricing.guarantee === 'object' ? pricing.guarantee : {};
    const guaranteeLabel = textOr(guarantee.label, '30-Day Money-Back Guarantee');
    const guaranteeDetails = textOr(guarantee.details, 'If it is not a fit in the first 30 days, we refund you.');
    const guaranteeLine = `${guaranteeLabel}. ${guaranteeDetails}`;

    const policies = pricing.policies && typeof pricing.policies === 'object' ? pricing.policies : {};
    const reschedule = textOr(policies.reschedule, 'Cancel or reschedule by text');
    const moduleHeading = textOr(pricing.display && pricing.display.moduleHeading, 'After Free Intro');
    const moduleTitle = textOr(pricing.display && pricing.display.moduleTitle, 'Tuition Tracks (Commitment = Savings)');
    const moduleDetails = `${coreName}: Youth ${coreYouth} · Adult ${coreAdult} · ${liferName}: Youth ${liferYouth} · Adult ${liferAdult} · ${reschedule} · ${guaranteeLabel}.`;

    setText('[data-ss-pricing-core-line]', coreLine);
    setText('[data-ss-pricing-guarantee-line]', guaranteeLine);
    setText('[data-ss-pricing-module-heading]', moduleHeading);
    setText('[data-ss-pricing-module-title]', moduleTitle);
    setText('[data-ss-pricing-module-details]', moduleDetails);

    const pricingVars = {
      coreName,
      coreYouth,
      coreAdult,
      liferName,
      liferYouth,
      liferAdult,
      scheduleTimes: scheduleSummary.timesBullet || '',
      reschedule,
      guarantee: guaranteeLabel
    };

    const templates = pricing.templates && typeof pricing.templates === 'object' ? pricing.templates : {};
    const renderTemplate = (template) => {
      if (typeof template !== 'string') return '';
      return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
        const value = pricingVars[key];
        return typeof value === 'string' ? value : '';
      });
    };

    const computedCopy = {
      optionsHeroLead: `${scheduleSummary.timesBullet}. Tour first. Safety walkthrough. Beginner Lane. Skill-first first class. ${reschedule}.`,
      contactValueLine: renderTemplate(templates.contactValueLine),
      quickFaqCost: renderTemplate(templates.quickFaqCost),
      microFaqMoneyBack: `${coreName}: Youth ${coreYouth} / Adult ${coreAdult} with a 30-day guarantee - if it is not a fit, we refund you.`
    };

    document.querySelectorAll('[data-ss-pricing-copy]').forEach((el) => {
      const key = el.getAttribute('data-ss-pricing-copy');
      if (!key) return;
      const value = computedCopy[key];
      if (typeof value === 'string' && value.trim()) {
        el.textContent = value;
      }
    });

    return {
      coreLine,
      guaranteeLine,
      moduleHeading,
      moduleTitle,
      moduleDetails
    };
  };

  const buildFunnelFlowHtml = (funnel) => {
    const steps = Array.isArray(funnel.steps) ? funnel.steps : [];
    if (!steps.length) return '';

    const arrow = ' -> ';
    const parts = steps.map((step) => {
      const label = escapeHtml(step && step.label ? step.label : '');
      if (!label) return '';
      const href = safeHref(step && step.href ? step.href : '');
      if (!href) return label;
      return `<a href="${escapeHtml(href)}">${label}</a>`;
    }).filter(Boolean);

    if (!parts.length) return '';

    const duration = funnel.duration ? ` (${escapeHtml(funnel.duration)})` : '';
    return `${parts.join(arrow)}${duration}`;
  };

  const applyFunnel = (funnel) => {
    if (!funnel || typeof funnel !== 'object') return;

    const flowHtml = buildFunnelFlowHtml(funnel);
    if (flowHtml) {
      document.querySelectorAll('[data-ss-funnel-flow]').forEach((el) => {
        el.innerHTML = flowHtml;
      });
    }

    const copy = funnel.copy && typeof funnel.copy === 'object' ? funnel.copy : {};
    document.querySelectorAll('[data-ss-funnel-copy]').forEach((el) => {
      const key = el.getAttribute('data-ss-funnel-copy');
      if (!key) return;
      const value = copy[key];
      if (typeof value === 'string' && value.trim()) {
        el.textContent = value;
      }
    });

    if (Array.isArray(funnel.offerChecklist) && funnel.offerChecklist.length) {
      document.querySelectorAll('[data-ss-funnel-offer-list]').forEach((listEl) => {
        listEl.innerHTML = '';
        funnel.offerChecklist.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          listEl.appendChild(li);
        });
      });
    }

    const microcopy = textOr(copy.bookMicrocopy, 'Beginner Lane, skill-first first class, reschedule by text.');
    if (microcopy) {
      window.CTA_CONFIG = window.CTA_CONFIG || {};
      window.CTA_CONFIG.microcopy = microcopy;
      document.querySelectorAll('[data-cta-microcopy], [data-ss-funnel-microcopy]').forEach((el) => {
        el.textContent = microcopy;
      });
    }
  };

  const boot = async () => {
    try {
      const [schedule, pricing, funnel] = await Promise.all([
        fetchJson(DATA_URLS.schedule),
        fetchJson(DATA_URLS.pricing),
        fetchJson(DATA_URLS.funnel)
      ]);

      const scheduleSummary = applySchedule(schedule);
      applyPricing(pricing, scheduleSummary);
      applyFunnel(funnel);

      window.SENSEI_CONTENT = {
        schedule,
        pricing,
        funnel
      };
    } catch (error) {
      window.SENSEI_CONTENT_ERROR = error;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
