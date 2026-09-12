(() => {
  'use strict';

  const SESSION_KEY = 'ss_first_visit_avail_v1';
  const CACHE_TTL_MS = 300000; // 5 minutes

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getNYDateInfo = () => {
    try {
      const now = new Date();
      // Resolve current time and weekday in America/New_York
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      });
      const parts = formatter.formatToParts(now);
      const partMap = {};
      parts.forEach((p) => { partMap[p.type] = p.value; });
      const year = parseInt(partMap.year, 10);
      const monthNumber = parseInt(partMap.month, 10);
      const day = parseInt(partMap.day, 10);
      const weekday = partMap.weekday || '';
      const monthName = MONTHS[monthNumber - 1];

      // Day of week: 1 = Mon, ..., 7 = Sun (ISO 8601)
      const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
      const dayOfWeek = weekdayMap[weekday] || 1;
      const isWeekend = dayOfWeek >= 6;
      const timeframeLabel = (dayOfWeek === 7) ? 'this coming week' : 'this week';
      const daysRemaining = (dayOfWeek === 7) ? 7 : Math.max(1, 8 - dayOfWeek);

      return { year, monthNumber, monthName, day, dayOfWeek, isWeekend, timeframeLabel, daysRemaining };
    } catch (e) {
      const now = new Date();
      const monthNumber = now.getMonth() + 1;
      const monthName = MONTHS[now.getMonth()];
      const year = now.getFullYear();
      const day = now.getDate();
      const jsDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;
      const isWeekend = dayOfWeek >= 6;
      const timeframeLabel = (dayOfWeek === 7) ? 'this coming week' : 'this week';
      const daysRemaining = (dayOfWeek === 7) ? 7 : Math.max(1, 8 - dayOfWeek);
      return { year, monthNumber, monthName, day, dayOfWeek, isWeekend, timeframeLabel, daysRemaining };
    }
  };

  const getDaysLeftLabel = (daysRemaining, monthName) => {
    if (daysRemaining === 0) return `Last day of ${monthName}`;
    if (daysRemaining === 1) return '1 day left';
    return `${daysRemaining} days left`;
  };

  const formatScarcityCopy = (data) => {
    const isWeekly = (data.timeframe === 'week' || !data.month);
    const timeframeLabel = isWeekly ? (data.timeframeLabel || 'this week') : (data.month || 'this month');
    const count = typeof data.availableSlotCount === 'number' ? data.availableSlotCount : null;
    const defaultCtaUrl = '/free-bjj-intro-tannersville-ny#booking-flow';

    // Day-specific requested date formatting
    if (data.requestedDate && typeof data.requestedDateSpots === 'number') {
      const dayLabel = data.requestedDateLabel || data.requestedDate;
      if (data.requestedDateSpots === 0) {
        return {
          text: `${dayLabel} is full · Check other days this week`,
          detail: `${dayLabel} is full`,
          badge: 'Full',
          status: 'full',
          ctaText: 'See Available Days →',
          ctaUrl: defaultCtaUrl
        };
      }
      const spotWord = data.requestedDateSpots === 1 ? 'spot' : 'spots';
      return {
        text: `Only ${data.requestedDateSpots} ${spotWord} left on ${dayLabel} · Reserve your first visit`,
        detail: `${data.requestedDateSpots} ${spotWord} left ${dayLabel}`,
        badge: `${data.requestedDateSpots} Left`,
        status: data.requestedDateSpots <= 2 ? 'low' : 'available',
        ctaText: 'Reserve Your Free First Visit →',
        ctaUrl: defaultCtaUrl
      };
    }

    // Fallback when Cal API is unavailable or count not yet determined
    if (data.status === 'unavailable' || count === null) {
      return {
        text: 'Check available times',
        detail: 'By appointment',
        badge: 'Open',
        status: 'available',
        ctaText: 'Reserve Your Free First Visit →',
        ctaUrl: defaultCtaUrl
      };
    }

    if (data.status === 'full' || count === 0) {
      const isComing = timeframeLabel.includes('coming');
      const fullText = isWeekly
        ? (isComing ? 'This coming week is full · Check next week’s availability' : 'This week is full · Check next week’s availability')
        : `${data.month} is full · See next month availability`;
      const nextCta = isWeekly ? 'See Next Week’s Times →' : 'See Next Month Times →';
      return {
        text: fullText,
        detail: isWeekly ? (isComing ? 'This coming week is full' : 'This week is full') : `${data.month} is full`,
        badge: 'Full',
        status: 'full',
        ctaText: nextCta,
        ctaUrl: defaultCtaUrl
      };
    }

    // Resolve next available day with openings and its spots count
    const nextSpots = typeof data.nextAvailableDaySpots === 'number'
      ? data.nextAvailableDaySpots
      : (Array.isArray(data.dailyAvailability) && data.dailyAvailability.length > 0 && typeof data.dailyAvailability[0].spotsCount === 'number'
          ? data.dailyAvailability[0].spotsCount
          : count);

    const nextDayLabel = data.nextAvailableDayLabel
      || (Array.isArray(data.dailyAvailability) && data.dailyAvailability.length > 0 && data.dailyAvailability[0].dayLabel)
      || data.nextAvailableLabel
      || '';

    const spotWord = nextSpots === 1 ? 'opening' : 'openings';
    const text = nextDayLabel
      ? `${nextSpots} ${spotWord} left on ${nextDayLabel}`
      : `${nextSpots} ${spotWord} left`;

    return {
      text,
      detail: nextDayLabel ? `${nextSpots} ${spotWord} left on ${nextDayLabel}` : `${nextSpots} ${spotWord} left`,
      badge: `${nextSpots} Left`,
      status: nextSpots <= 2 ? 'low' : 'available',
      ctaText: 'Reserve Your Free First Visit →',
      ctaUrl: defaultCtaUrl
    };
  };

  const trackEvent = (name, payload = {}) => {
    try {
      if (typeof window.SS_TRACK_EVENT === 'function') {
        window.SS_TRACK_EVENT(name, payload);
      } else if (typeof window.gtag === 'function') {
        window.gtag('event', name, payload);
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: name, ...payload });
      }
    } catch (_) {}
  };

  const updateDOM = (formatted, rawData) => {
    document.querySelectorAll('[data-availability-strip]').forEach((strip) => {
      const textEl = strip.querySelector('[data-availability-text]') || strip;
      textEl.textContent = formatted.text;
      strip.setAttribute('data-status', formatted.status);
      if (strip.tagName === 'A' && formatted.ctaUrl) {
        strip.setAttribute('href', formatted.ctaUrl);
      }
      if (!strip.hasAttribute('data-has-click-tracking')) {
        strip.setAttribute('data-has-click-tracking', 'true');
        strip.addEventListener('click', () => {
          trackEvent('first_visit_availability_clicked', {
            status: strip.getAttribute('data-status') || 'available',
            destination: strip.getAttribute('href') || formatted.ctaUrl
          });
        });
      }
    });

    document.querySelectorAll('[data-availability-badge]').forEach((badge) => {
      badge.textContent = formatted.badge;
      badge.setAttribute('data-status', formatted.status);
    });

    document.querySelectorAll('[data-availability-cta]').forEach((cta) => {
      if (formatted.status === 'full') {
        cta.textContent = formatted.ctaText;
      }
      if (cta.tagName === 'A' && formatted.ctaUrl) {
        cta.setAttribute('href', formatted.ctaUrl);
      }
    });

    document.querySelectorAll('[data-availability-daily]').forEach((container) => {
      if (rawData && Array.isArray(rawData.dailyAvailability) && rawData.dailyAvailability.length > 0) {
        container.innerHTML = rawData.dailyAvailability.map((d) =>
          `<span class="ss-day-pill" data-date="${d.date}" data-spots="${d.spotsCount}">${d.dayShort}: ${d.spotsLeftLabel}</span>`
        ).join(' ');
        container.hidden = false;
      } else {
        container.hidden = true;
      }
    });

    if (rawData && rawData.status === 'available') {
      trackEvent('first_visit_availability_loaded', {
        available_slot_count: rawData.availableSlotCount,
        availability_level: rawData.availabilityLevel,
        spots_per_day_range: rawData.spotsPerDayRange || 'unknown',
        days_with_slots: rawData.daysWithSlots || 0,
        month: rawData.month,
        days_remaining: rawData.daysRemaining
      });
    }
  };

  const getCachedData = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - (parsed.storedAt || 0) < CACHE_TTL_MS) {
        return parsed.data;
      }
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
    return null;
  };

  const setCachedData = (data) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        storedAt: Date.now(),
        data: data
      }));
    } catch (_) {}
  };

  const initAvailability = () => {
    const ny = getNYDateInfo();
    const initialFallback = {
      status: 'unavailable',
      timeframe: 'week',
      timeframeLabel: ny.timeframeLabel,
      month: ny.monthName,
      monthNumber: ny.monthNumber,
      year: ny.year,
      daysRemaining: ny.daysRemaining,
      availableSlotCount: null
    };

    // Immediate render with local calendar facts to prevent layout shift
    updateDOM(formatScarcityCopy(initialFallback), null);

    // Check session cache first
    const cached = getCachedData();
    if (cached) {
      updateDOM(formatScarcityCopy(cached), cached);
      return;
    }

    // Fetch live availability from server
    fetch('/api/first-visit-availability', {
      headers: { 'Accept': 'application/json' }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          setCachedData(data);
          updateDOM(formatScarcityCopy(data), data);
        }
      })
      .catch((err) => {
        trackEvent('first_visit_availability_failed', { error: err.message || 'unknown' });
        // Fallback remains active, do not display error banner
      });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAvailability, { once: true });
  } else {
    initAvailability();
  }

  const fetchAvailability = (dateParam) => {
    const url = dateParam
      ? `/api/first-visit-availability?date=${encodeURIComponent(dateParam)}`
      : '/api/first-visit-availability';
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
  };

  window.SenseiAvailability = {
    getNYDateInfo,
    formatScarcityCopy,
    initAvailability,
    fetchAvailability,
    getDailyAvailability: () => {
      const cached = getCachedData();
      return (cached && Array.isArray(cached.dailyAvailability)) ? cached.dailyAvailability : [];
    },
    getSpotsForDate: (dateStr) => {
      const cached = getCachedData();
      if (!cached || !cached.slotsByDate) return null;
      return typeof cached.slotsByDate[dateStr] === 'number' ? cached.slotsByDate[dateStr] : 0;
    }
  };
})();
