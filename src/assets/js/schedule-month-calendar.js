(() => {
  const root = document.querySelector('[data-month-calendar]');
  if (!root) return;
  let schedule;
  try { schedule = JSON.parse(root.dataset.schedule); } catch { return; }
  const days = root.querySelector('[data-calendar-days]');
  const mobileDays = root.querySelector('[data-calendar-mobile-days]');
  const title = root.querySelector('[data-calendar-month]');
  const list = root.querySelector('[data-calendar-selected-list]');
  const nextClassDetails = root.querySelector('[data-calendar-next-class-details]');
  const civil = (year, month, day) => new Date(Date.UTC(year, month, day));
  const iso = (date) => date.toISOString().slice(0, 10);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
  const part = (type) => Number(parts.find((p) => p.type === type).value);
  const today = civil(part('year'), part('month') - 1, part('day'));
  const localClock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  const localPart = (type) => Number(localClock.find((entry) => entry.type === type).value);
  const currentMinutes = localPart('hour') * 60 + localPart('minute');
  const format = (date, options) => new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date);
  const isPhone = () => window.matchMedia('(width < 768px)').matches;
  let selected = today;
  let month = civil(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const name = (item) => item.label || item.publicLabel || (item.format === 'Bootcamp' ? 'Alley Bootcamp' : `${item.audience === 'Youth/Teen' ? 'Kids and teens' : item.audience} ${item.format}`);
  const kind = (item) => item.format === 'Bootcamp' ? 'bootcamp' : item.audience === 'Women' ? 'women' : item.publicLabel === 'White Belt Foundations' ? 'foundations' : item.audience === 'Youth/Teen' ? 'youth' : item.audience ? 'adult' : 'special';
  const isUpcoming = (slot, date) => {
    const match = String(slot.time || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return false;
    const classMinutes = (+match[1] % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + +match[2];
    return iso(date) > iso(today) || (iso(date) === iso(today) && classMinutes > currentMinutes);
  };
  const bookingHref = (slot, date) => {
    const lane = slot.audience === 'Women' || slot.audience === 'Adult' ? 'adult' : slot.audience === 'Youth/Teen' ? 'youth' : '';
    if (!lane || !isUpcoming(slot, date)) return '';
    const params = new URLSearchParams({ lane, class: name(slot), class_date: iso(date), class_time: slot.time || '' });
    return `/free-bjj-intro-tannersville-ny?${params.toString()}#booking-flow`;
  };
  const classes = (date) => {
    const key = iso(date);
    const closed = schedule.closures.find((item) => item.date === key);
    if (closed) return [{ ...closed, label: `${closed.label} · Closed`, time: '' }];
    const special = schedule.specialEvents.filter((item) => item.date === key);
    if (special.length) return special.map((item) => ({ ...item, time: item.time || 'Text Sandy for time' }));
    const regular = key >= schedule.season.effectiveDate ? schedule.groupClasses.filter((item) => item.active && item.dayOrder === date.getUTCDay()) : [];
    return [...regular, ...schedule.datedClasses.filter((item) => item.date === key)].sort((a, b) => {
      const minutes = (item) => { const match = item.time.match(/(\d+):(\d+)\s*(AM|PM)/); return match ? (+match[1] % 12 + (match[3] === 'PM' ? 12 : 0)) * 60 + +match[2] : 0; };
      return minutes(a) - minutes(b);
    });
  };
  const nextClass = () => {
    for (let offset = 0; offset < 45; offset++) {
      const date = civil(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + offset);
      const slot = classes(date).find((item) => isUpcoming(item, date));
      if (slot) return { date, slot };
    }
    return null;
  };
  const renderNextClass = (upcoming) => {
    if (!upcoming || !nextClassDetails) return;
    const { date, slot } = upcoming;
    const day = make('time', 'ss-next-class-date', format(date, { weekday: 'long', month: 'long', day: 'numeric' }));
    day.dateTime = iso(date);
    nextClassDetails.append(day, make('strong', 'ss-next-class-time', slot.endTime ? `${slot.time}–${slot.endTime}` : slot.time), make('span', 'ss-next-class-name', name(slot)));
    if (slot.programUrl) { const link = make('a', '', 'View class plan'); link.href = slot.programUrl; nextClassDetails.append(link); }
    const href = bookingHref(slot, date);
    if (href) { const link = make('a', 'ss-class-booking-link', 'Plan a free visit for this class'); link.href = href; nextClassDetails.append(link); }
  };
  const onDateKeydown = (event, date) => {
    if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); shiftMonth(event.key === 'PageUp' ? -1 : 1, true); return; }
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -date.getUTCDay(), End: 6 - date.getUTCDay() };
    if (!(event.key in moves)) return;
    event.preventDefault();
    selected = civil(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + moves[event.key]);
    month = civil(selected.getUTCFullYear(), selected.getUTCMonth(), 1);
    render(true);
  };
  const mobileDay = (date, slots) => {
    const card = make('article', 'ss-month-mobile-day');
    card.setAttribute('role', 'listitem');
    const button = make('button', 'ss-month-mobile-date');
    button.type = 'button';
    button.dataset.calendarDate = iso(date);
    const closed = slots.length > 0 && slots.every((slot) => !slot.time && String(slot.label || '').includes('Closed'));
    const count = slots.length;
    const summary = closed ? 'Closed' : count ? `${count} ${count === 1 ? 'class' : 'classes'}` : 'Rest day';
    button.append(make('span', 'ss-month-mobile-label', format(date, { weekday: 'short', month: 'short', day: 'numeric' })), make('span', 'ss-month-mobile-count', summary));
    button.setAttribute('aria-label', `${format(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. ${slots.map((item) => `${item.time} ${name(item)}`).join('. ') || 'Rest day'}`);
    button.setAttribute('aria-controls', `ss-mobile-classes-${iso(date)}`);
    button.setAttribute('aria-expanded', 'false');
    if (iso(date) === iso(today)) button.setAttribute('aria-current', 'date');
    button.addEventListener('click', () => select(date));
    button.addEventListener('keydown', (event) => onDateKeydown(event, date));
    card.append(button);
    const entries = make('div', 'ss-month-mobile-classes');
    entries.id = `ss-mobile-classes-${iso(date)}`;
    entries.hidden = true;
    if (!slots.length) entries.append(make('p', 'ss-month-mobile-rest', 'Rest day'));
    for (const slot of slots) {
      const item = make('div', `ss-month-mobile-class is-${kind(slot)}`);
      item.append(make('strong', '', slot.endTime ? `${slot.time}–${slot.endTime}` : slot.time), make('span', '', name(slot)));
      if (slot.focus) item.append(make('small', '', slot.focus));
      if (slot.ages) item.append(make('small', '', `Ages ${slot.ages} · ${slot.format}`));
      if (slot.note) item.append(make('small', '', slot.note));
      if (slot.programUrl) { const link = make('a', '', 'View class plan'); link.href = slot.programUrl; item.append(link); }
      const href = bookingHref(slot, date);
      if (href) { const link = make('a', 'ss-class-booking-link', 'Plan a free visit for this class'); link.href = href; item.append(link); }
      entries.append(item);
    }
    card.append(entries);
    return card;
  };
  const select = (date) => {
    selected = date;
    root.querySelector('[data-calendar-selected-title]').textContent = format(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const slots = classes(date);
    const cardFragment = document.createDocumentFragment();
    if (!slots.length) cardFragment.append(make('p', '', 'Rest day. Pick a class date above.'));
    for (const slot of slots) {
      const card = make('article', `ss-selected-class is-${kind(slot)}`);
      card.append(make('strong', '', slot.endTime ? `${slot.time}–${slot.endTime}` : slot.time), make('span', '', name(slot)));
      if (slot.focus) card.append(make('small', '', slot.focus));
      if (slot.ages) card.append(make('small', '', `Ages ${slot.ages} · ${slot.format}`));
      if (slot.note) card.append(make('small', '', slot.note));
      if (slot.programUrl) { const link = make('a', '', 'View class plan'); link.href = slot.programUrl; card.append(link); }
      const href = bookingHref(slot, date);
      if (href) { const link = make('a', 'ss-class-booking-link', 'Plan a free visit for this class'); link.href = href; card.append(link); }
      cardFragment.append(card);
    }
    list.replaceChildren(cardFragment);
    root.querySelectorAll('[data-calendar-date]').forEach((button) => {
      const active = button.dataset.calendarDate === iso(date);
      button.setAttribute('aria-pressed', String(active));
      button.tabIndex = active ? 0 : -1;
      if (button.classList.contains('ss-month-mobile-date')) {
        button.setAttribute('aria-expanded', String(active));
        button.closest('.ss-month-mobile-day').querySelector('.ss-month-mobile-classes').hidden = !active;
      }
    });
  };
  const shiftMonth = (amount, focus = false) => {
    month = civil(month.getUTCFullYear(), month.getUTCMonth() + amount, 1);
    selected = civil(month.getUTCFullYear(), month.getUTCMonth(), Math.min(selected.getUTCDate(), civil(month.getUTCFullYear(), month.getUTCMonth() + 1, 0).getUTCDate()));
    render(focus);
  };
  const render = (focus = false) => {
    title.textContent = format(month, { month: 'long', year: 'numeric' });
    const fragment = document.createDocumentFragment();
    const mobileFragment = document.createDocumentFragment();
    let currentRow = null;
    const count = civil(month.getUTCFullYear(), month.getUTCMonth() + 1, 0).getUTCDate();
    const offset = month.getUTCDay();
    for (let index = 0; index < Math.ceil((offset + count) / 7) * 7; index++) {
      if (index % 7 === 0) {
        currentRow = document.createElement('tr');
        fragment.append(currentRow);
      }
      const cell = document.createElement('td');
      if (currentRow) currentRow.append(cell);
      const number = index - offset + 1;
      if (number < 1 || number > count) { cell.className = 'ss-month-empty'; continue; }
      const date = civil(month.getUTCFullYear(), month.getUTCMonth(), number);
      const slots = classes(date);
      mobileFragment.append(mobileDay(date, slots));
      const content = make('div', 'ss-month-day');
      const button = make('button', 'ss-month-date', String(number));
      button.type = 'button';
      button.dataset.calendarDate = iso(date);
      button.setAttribute('aria-label', `${format(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. ${slots.map((item) => `${item.time} ${name(item)}`).join('. ') || 'Rest day'}`);
      if (iso(date) === iso(today)) button.setAttribute('aria-current', 'date');
      content.append(button);
      for (const slot of slots) {
        const href = bookingHref(slot, date);
        const card = make(href ? 'a' : 'span', `ss-date-class is-${kind(slot)}${href ? ' ss-date-class-link' : ''}`);
        if (href) {
          card.href = href;
          card.title = `Plan a free visit for ${name(slot)} on ${format(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        card.append(make('strong', '', slot.endTime ? `${slot.time}–${slot.endTime}` : slot.time), make('span', '', name(slot)));
        content.append(card);
      }
      button.addEventListener('click', () => select(date));
      button.addEventListener('keydown', (event) => onDateKeydown(event, date));
      cell.append(content);
    }
    days.replaceChildren(fragment);
    mobileDays.replaceChildren(mobileFragment);
    select(selected);
    if (focus) (isPhone() ? mobileDays : days).querySelector('[tabindex="0"]')?.focus();
  };
  root.querySelector('[data-calendar-prev]').addEventListener('click', () => shiftMonth(-1));
  root.querySelector('[data-calendar-next]').addEventListener('click', () => shiftMonth(1));
  root.querySelector('[data-calendar-today]').addEventListener('click', () => { selected = today; month = civil(today.getUTCFullYear(), today.getUTCMonth(), 1); render(); });
  root.parentElement.querySelectorAll('[data-calendar-jump]').forEach((button) => {
    const date = new Date(`${button.dataset.calendarJump}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(button.dataset.calendarJump) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== button.dataset.calendarJump) return;
    button.textContent = format(date, { month: 'short', day: 'numeric' });
    button.addEventListener('click', () => {
      selected = date;
      month = civil(date.getUTCFullYear(), date.getUTCMonth(), 1);
      render();
      (isPhone() ? mobileDays : days).querySelector(`[data-calendar-date="${iso(date)}"]`)?.focus();
    });
  });
  const mount = () => {
    const upcoming = nextClass();
    renderNextClass(upcoming);
    if (isPhone() && upcoming) {
      selected = upcoming.date;
      month = civil(selected.getUTCFullYear(), selected.getUTCMonth(), 1);
    }
    render();
    root.classList.add('is-ready');
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
