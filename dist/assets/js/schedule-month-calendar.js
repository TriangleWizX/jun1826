(() => {
  const root = document.querySelector('[data-month-calendar]');
  if (!root) return;
  let schedule;
  try { schedule = JSON.parse(root.dataset.schedule); } catch { return; }
  const days = root.querySelector('[data-calendar-days]');
  const title = root.querySelector('[data-calendar-month]');
  const list = root.querySelector('[data-calendar-selected-list]');
  const civil = (year, month, day) => new Date(Date.UTC(year, month, day));
  const iso = (date) => date.toISOString().slice(0, 10);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
  const part = (type) => Number(parts.find((p) => p.type === type).value);
  const today = civil(part('year'), part('month') - 1, part('day'));
  const format = (date, options) => new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date);
  let selected = today;
  let month = civil(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const name = (item) => item.label || item.publicLabel || `${item.audience === 'Youth/Teen' ? 'Kids and teens' : item.audience} ${item.format}`;
  const kind = (item) => item.audience === 'Women' ? 'women' : item.publicLabel === 'White Belt Foundations' ? 'foundations' : item.audience === 'Youth/Teen' ? 'youth' : item.audience ? 'adult' : 'special';
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
  const select = (date) => {
    selected = date;
    root.querySelector('[data-calendar-selected-title]').textContent = format(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    list.replaceChildren();
    const slots = classes(date);
    if (!slots.length) list.append(make('p', '', 'Rest day. Pick a class date above.'));
    for (const slot of slots) {
      const card = make('article', `ss-selected-class is-${kind(slot)}`);
      card.append(make('strong', '', slot.time), make('span', '', name(slot)));
      if (slot.ages) card.append(make('small', '', `Ages ${slot.ages} · ${slot.format}`));
      if (slot.note) card.append(make('small', '', slot.note));
      if (slot.programUrl) { const link = make('a', '', 'View class plan'); link.href = slot.programUrl; card.append(link); }
      list.append(card);
    }
    days.querySelectorAll('[data-calendar-date]').forEach((button) => {
      const active = button.dataset.calendarDate === iso(date);
      button.setAttribute('aria-pressed', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  };
  const shiftMonth = (amount, focus = false) => {
    month = civil(month.getUTCFullYear(), month.getUTCMonth() + amount, 1);
    selected = civil(month.getUTCFullYear(), month.getUTCMonth(), Math.min(selected.getUTCDate(), civil(month.getUTCFullYear(), month.getUTCMonth() + 1, 0).getUTCDate()));
    render(focus);
  };
  const render = (focus = false) => {
    title.textContent = format(month, { month: 'long', year: 'numeric' });
    days.replaceChildren();
    const count = civil(month.getUTCFullYear(), month.getUTCMonth() + 1, 0).getUTCDate();
    const offset = month.getUTCDay();
    for (let index = 0; index < Math.ceil((offset + count) / 7) * 7; index++) {
      if (index % 7 === 0) days.append(document.createElement('tr'));
      const cell = document.createElement('td');
      days.lastChild.append(cell);
      const number = index - offset + 1;
      if (number < 1 || number > count) { cell.className = 'ss-month-empty'; continue; }
      const date = civil(month.getUTCFullYear(), month.getUTCMonth(), number);
      const slots = classes(date);
      const button = make('button', 'ss-month-date');
      button.type = 'button';
      button.dataset.calendarDate = iso(date);
      button.setAttribute('aria-label', `${format(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. ${slots.map((item) => `${item.time} ${name(item)}`).join('. ') || 'Rest day'}`);
      if (iso(date) === iso(today)) button.setAttribute('aria-current', 'date');
      button.append(make('span', 'ss-date-number', number));
      for (const slot of slots) {
        const card = make('span', `ss-date-class is-${kind(slot)}`);
        card.append(make('strong', '', slot.time), make('span', '', name(slot)));
        button.append(card);
      }
      if (slots.length) button.append(make('span', 'ss-date-count', slots.length));
      button.addEventListener('click', () => select(date));
      button.addEventListener('keydown', (event) => {
        if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); shiftMonth(event.key === 'PageUp' ? -1 : 1, true); return; }
        const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -date.getUTCDay(), End: 6 - date.getUTCDay() };
        if (!(event.key in moves)) return;
        event.preventDefault();
        selected = civil(date.getUTCFullYear(), date.getUTCMonth(), number + moves[event.key]);
        month = civil(selected.getUTCFullYear(), selected.getUTCMonth(), 1);
        render(true);
      });
      cell.append(button);
    }
    select(selected);
    if (focus) days.querySelector('[tabindex="0"]').focus();
  };
  root.querySelector('[data-calendar-prev]').addEventListener('click', () => shiftMonth(-1));
  root.querySelector('[data-calendar-next]').addEventListener('click', () => shiftMonth(1));
  root.querySelector('[data-calendar-today]').addEventListener('click', () => { selected = today; month = civil(today.getUTCFullYear(), today.getUTCMonth(), 1); render(); });
  render();
  root.hidden = false;
  document.querySelector('.ss-weekly-fallback').open = false;
})();
