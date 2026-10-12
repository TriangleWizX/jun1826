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
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'America/New_York' });
  const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' });
  const today = new Date(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) + 'T12:00:00');
  let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let focusDate = today;

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

  const render = (focusDate = null) => {
    monthLabel.textContent = monthFmt.format(viewMonth);
    daysRoot.replaceChildren();
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const count = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const rowCount = Math.ceil((dayIndex(first) + count) / 7);
    let number = 1;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const row = document.createElement('div');
      row.className = 'ss-month-row';
      row.setAttribute('role', 'row');
      for (let column = 0; column < 7; column += 1) {
        const cellIndex = rowIndex * 7 + column;
        const dayNumber = cellIndex - dayIndex(first) + 1;
        if (dayNumber < 1 || dayNumber > count) {
          const empty = document.createElement('span');
          empty.className = 'ss-month-empty';
          empty.setAttribute('role', 'gridcell');
          empty.setAttribute('aria-hidden', 'true');
          row.append(empty);
          continue;
        }
        number = dayNumber;
        const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), number, 12);
        const button = document.createElement('button');
        const slots = getSlots(weekNames[dayIndex(date)], date);
        button.type = 'button';
        button.className = 'ss-month-date';
        button.dataset.calendarDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(number).padStart(2, '0')}`;
        button.setAttribute('role', 'gridcell');
        button.setAttribute('aria-label', `${dateFmt.format(date)}${slots.length ? `, ${slots.length} classes` : ', no group classes listed'}`);
        button.setAttribute('aria-pressed', 'false');
        button.tabIndex = -1;
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
        button.addEventListener('keydown', (event) => {
          const weekStartOffset = -dayIndex(date);
          const weekEndOffset = 6 - dayIndex(date);
          const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: Math.max(1 - date.getDate(), weekStartOffset), End: Math.min(count - date.getDate(), weekEndOffset) };
          if (event.key === 'PageUp' || event.key === 'PageDown') {
            event.preventDefault();
            viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + (event.key === 'PageDown' ? 1 : -1), 1);
            focusDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), Math.min(date.getDate(), new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()), 12);
            render();
            root.querySelector('[data-calendar-date][tabindex="0"]')?.focus();
            return;
          }
          if (!(event.key in moves)) return;
          event.preventDefault();
          const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + moves[event.key], 12);
          if (nextDate.getMonth() !== viewMonth.getMonth()) viewMonth = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
          focusDate = nextDate;
          render();
          root.querySelector(`[data-calendar-date="${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}"]`)?.focus();
        });
        row.append(button);
      }
      daysRoot.append(row);
    }
    const target = focusDate.getMonth() === viewMonth.getMonth() && focusDate.getFullYear() === viewMonth.getFullYear()
      ? focusDate
      : new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1, 12);
    const chosen = daysRoot.querySelector(`[data-calendar-date="${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}"]`);
    if (chosen) {
      daysRoot.querySelectorAll('[data-calendar-date]').forEach((button) => { button.tabIndex = -1; });
      chosen.tabIndex = 0;
      focusDate = target;
      selectDate(target, chosen);
    }
  };

  root.querySelector('[data-calendar-prev]').addEventListener('click', () => {
    const day = focusDate.getDate();
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
    focusDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), Math.min(day, new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()), 12);
    render();
  });
  root.querySelector('[data-calendar-next]').addEventListener('click', () => {
    const day = focusDate.getDate();
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    focusDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), Math.min(day, new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()), 12);
    render();
  });
  render();
})();
