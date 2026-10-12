(() => {
  const root = document.querySelector('[data-month-calendar]');
  if (!root) return;

  const monthLabel = root.querySelector('[data-calendar-month]');
  const daysRoot = root.querySelector('[data-calendar-days]');
  const selectedTitle = root.querySelector('[data-calendar-selected-title]');
  const selectedList = root.querySelector('[data-calendar-selected-list]');
  const weekly = [...document.querySelectorAll('[data-schedule-day]')];
  const datedClasses = JSON.parse(root.dataset.datedClasses || '[]');
  const closures = JSON.parse(root.dataset.closures || '[]');
  const weekNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'America/New_York' });
  const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' });
  const today = new Date(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) + 'T12:00:00');
  let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const dayIndex = (date) => (date.getDay() + 6) % 7;
  const getSlots = (day, date = null) => {
    const card = weekly.find((item) => item.dataset.scheduleDay === day);
    const slots = card ? [...card.querySelectorAll('.ss-cal-slot')].map((slot) => ({
      time: slot.querySelector('.ss-cal-slot-time')?.textContent.trim() || '',
      name: slot.querySelector('.ss-cal-slot-name')?.textContent.trim() || '',
      note: slot.querySelector('.ss-cal-slot div')?.textContent.trim() || ''
    })) : [];
    if (date) {
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (closures.some((closure) => closure.date === iso)) return [];
      datedClasses.filter((item) => item.date === iso).forEach((item) => slots.push({ time: `${item.time}–${item.endTime}`, name: `${item.label} · ${item.ages} · ${item.format}`, note: 'Women-only class.' }));
    }
    return slots;
  };

  const selectDate = (date, button) => {
    const dayName = weekNames[dayIndex(date)];
    const slots = getSlots(dayName, date);
    selectedTitle.textContent = dateFmt.format(date);
    selectedList.replaceChildren();
    if (!slots.length) {
      const p = document.createElement('p');
      p.textContent = 'No group classes are listed for this day.';
      selectedList.append(p);
    } else {
      for (const slot of slots) {
        const item = document.createElement('article');
        item.className = 'ss-selected-class';
        const time = document.createElement('strong');
        time.textContent = slot.time;
        const name = document.createElement('span');
        name.textContent = slot.name;
        item.append(time, name);
        if (slot.note) {
          const note = document.createElement('small');
          note.textContent = slot.note;
          item.append(note);
        }
        selectedList.append(item);
      }
    }
    root.querySelectorAll('[data-calendar-date]').forEach((dayButton) => {
      dayButton.setAttribute('aria-pressed', String(dayButton === button));
    });
  };

  const render = () => {
    monthLabel.textContent = monthFmt.format(viewMonth);
    daysRoot.replaceChildren();
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const count = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    for (let pad = 0; pad < dayIndex(first); pad += 1) {
      const empty = document.createElement('span');
      empty.className = 'ss-month-empty';
      empty.setAttribute('aria-hidden', 'true');
      daysRoot.append(empty);
    }
    for (let number = 1; number <= count; number += 1) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), number, 12);
      const button = document.createElement('button');
      const slots = getSlots(weekNames[dayIndex(date)], date);
      button.type = 'button';
      button.className = 'ss-month-date';
      button.dataset.calendarDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(number).padStart(2, '0')}`;
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', `${dateFmt.format(date)}${slots.length ? `, ${slots.length} classes` : ', no group classes listed'}`);
      button.setAttribute('aria-pressed', 'false');
      if (date.toDateString() === today.toDateString()) button.classList.add('is-today');
      if (slots.length) button.classList.add('has-classes');
      const numberLabel = document.createElement('span');
      numberLabel.className = 'ss-date-number';
      numberLabel.textContent = String(number);
      button.append(numberLabel);
      if (slots.length) {
        const indicators = document.createElement('span');
        indicators.className = 'ss-date-indicators';
        indicators.setAttribute('aria-hidden', 'true');
        slots.forEach((slot) => {
          const dot = document.createElement('i');
          dot.className = /Women's Foundations/.test(slot.name) ? 'is-women' : /White Belt Foundations/.test(slot.name) ? 'is-foundations' : /^Youth/.test(slot.name) ? 'is-youth' : 'is-adult';
          indicators.append(dot);
        });
        button.append(indicators);
      }
      button.addEventListener('click', () => selectDate(date, button));
      daysRoot.append(button);
    }
    const finalCount = daysRoot.children.length;
    while (finalCount % 7 !== 0) {
      const empty = document.createElement('span');
      empty.className = 'ss-month-empty';
      empty.setAttribute('aria-hidden', 'true');
      daysRoot.append(empty);
    }
    const target = viewMonth.getMonth() === today.getMonth() && viewMonth.getFullYear() === today.getFullYear()
      ? today
      : new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1, 12);
    const chosen = daysRoot.querySelector(`[data-calendar-date="${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}"]`);
    if (chosen) selectDate(target, chosen);
  };

  root.querySelector('[data-calendar-prev]').addEventListener('click', () => {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
    render();
  });
  root.querySelector('[data-calendar-next]').addEventListener('click', () => {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    render();
  });
  render();
})();
