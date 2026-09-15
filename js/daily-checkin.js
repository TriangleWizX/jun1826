(function () {
  'use strict';

  const SKILLS = [
    ['feet_to_floor', 'Standing and falling safely'],
    ['pin_escapes', 'Getting out from bottom'],
    ['guard', 'Using the legs from bottom'],
    ['guard_retention', 'Keeping the legs in front'],
    ['submission_escapes', 'Getting safe from a hold'],
    ['pinning', 'Staying on top'],
    ['base_retention', 'Keeping balance on top'],
    ['guard_passing', 'Getting past the legs'],
    ['submissions', 'Finishing a hold safely']
  ];

  const CONTEXTS = [
    'Positional Round',
    'Game',
    'Live Round',
    'Guided Practice',
    'Other'
  ];

  const QUICK_PROBLEMS = [
    'Keep elbows inside from bottom',
    'Protect posture & breakfall safely',
    'Stay balanced against sweep attempt',
    'Recover guard knee-elbow space',
    'Pass open guard with pressure',
    'Escape side control to knees'
  ];

  const $ = (id) => document.getElementById(id);

  const f = {
    student: $('student'),
    phone: $('parent-phone'),
    date: $('session-date'),
    program: $('program'),
    skill: $('main-skill'),
    problem: $('problem'),
    observed: $('observed-action'),
    next: $('next-action'),
    easier: $('getting-easier')
  };

  let reportDispatched = false;

  function todayIso() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function selectedContext() {
    return document.querySelector('input[name="observation-context"]:checked')?.value || '';
  }

  function put(id, value, emptyPlaceholder) {
    const el = $(id);
    if (!el) return;
    el.textContent = value || emptyPlaceholder;
    el.classList.toggle('print-empty', !value);
  }

  function updatePreview() {
    const studentName = f.student.value.trim();
    put('preview-student', studentName, 'Student Name');

    const rawDate = f.date.value;
    let formattedDate = 'Today';
    if (rawDate) {
      try {
        formattedDate = new Date(`${rawDate}T12:00:00Z`).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC'
        });
      } catch {
        formattedDate = rawDate;
      }
    }
    put('preview-date', formattedDate, 'Session Date');

    const prog = f.program.value ? f.program.options[f.program.selectedIndex]?.textContent : '';
    put('preview-program', prog, 'Class');

    const skillLabel = f.skill.value ? f.skill.options[f.skill.selectedIndex]?.textContent : '';
    put('preview-skill', skillLabel, 'Choose a main skill');

    put('preview-problem', f.problem.value.trim(), 'What they were trying to solve');
    put('preview-observed', f.observed.value.trim(), 'What you saw them do');

    const c = selectedContext();
    const ctxEl = $('preview-context');
    if (ctxEl) {
      ctxEl.textContent = c ? `Observed during: ${c}` : '';
    }

    put('preview-next', f.next.value.trim(), 'Next step to try');

    const easierVal = f.easier.value.trim();
    put('preview-easier', easierVal, '');
    const easierBlock = $('preview-easier-block');
    if (easierBlock) {
      easierBlock.hidden = !easierVal;
    }
  }

  function validate() {
    const errs = [];
    if (!f.student.value.trim()) errs.push('Enter student name.');
    if (!f.date.value) errs.push('Choose a date.');
    if (!f.skill.value) errs.push('Select a main skill.');
    if (!f.problem.value.trim()) errs.push('Add what they were trying to do.');
    if (!f.observed.value.trim()) errs.push('Add what you saw them do.');
    if (!f.next.value.trim()) errs.push('Add what they should try next.');
    return errs;
  }

  function formatSmsMessage() {
    const student = f.student.value.trim() || 'your student';
    const skill = f.skill.value ? f.skill.options[f.skill.selectedIndex]?.textContent : 'jiu-jitsu';
    const prob = f.problem.value.trim();
    const obs = f.observed.value.trim();
    const nxt = f.next.value.trim();
    const easier = f.easier.value.trim();

    let msg = `Hi! Quick training note from Sandy at Sensei Sandy BJJ regarding ${student}'s class today.\n\n`;
    msg += `• Focus: ${skill}${prob ? ` (${prob})` : ''}\n`;
    msg += `• What we saw: ${obs}\n`;
    msg += `• What to try next: ${nxt}\n`;
    if (easier) {
      msg += `• Getting easier: ${easier}\n`;
    }
    msg += `\nRide-home question to ask: "What problem were you working on today?"\n- Sensei Sandy`;
    return msg;
  }

  function formatFullSummary() {
    const student = f.student.value.trim() || 'Student';
    const date = f.date.value;
    const prog = f.program.value ? f.program.options[f.program.selectedIndex]?.textContent : '';
    const skill = f.skill.value ? f.skill.options[f.skill.selectedIndex]?.textContent : '';
    const prob = f.problem.value.trim();
    const obs = f.observed.value.trim();
    const ctx = selectedContext();
    const nxt = f.next.value.trim();
    const easier = f.easier.value.trim();

    return [
      `Sensei Sandy BJJ - Daily Training Report`,
      `Student: ${student}`,
      `Date: ${date} ${prog ? `(${prog})` : ''}`,
      `Main Skill: ${skill}`,
      `Problem Tested: ${prob || '[Not specified]'}`,
      `Context: ${ctx || '[None]'}`,
      `Observed Action: ${obs || '[Not specified]'}`,
      `Next Step: ${nxt || '[Not specified]'}`,
      easier ? `Getting Easier: ${easier}` : '',
      `Coach: Sandy`
    ].filter(Boolean).join('\n');
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    return Promise.resolve();
  }

  function showStatus(msg, isError) {
    const errEl = $('form-error');
    const statusEl = $('save-status');

    if (isError) {
      errEl.textContent = msg;
      errEl.hidden = false;
      statusEl.textContent = '';
    } else {
      errEl.hidden = true;
      statusEl.textContent = msg;
    }
  }

  const DRAFT_KEY = 'ssbjj_daily_checkin_draft_v1';
  let draftSaveTimer = null;
  let draftIndicatorTimer = null;

  function hasDraftContent(draft) {
    if (!draft) return false;
    return !!(
      (draft.student && draft.student.trim()) ||
      (draft.problem && draft.problem.trim()) ||
      (draft.observed && draft.observed.trim()) ||
      (draft.next && draft.next.trim()) ||
      (draft.easier && draft.easier.trim())
    );
  }

  function saveDraft() {
    try {
      const draft = {
        student: f.student.value,
        phone: f.phone.value,
        date: f.date.value,
        program: f.program.value,
        skill: f.skill.value,
        problem: f.problem.value,
        observed: f.observed.value,
        context: selectedContext(),
        next: f.next.value,
        easier: f.easier.value,
        savedAt: new Date().toISOString()
      };

      if (!hasDraftContent(draft)) {
        localStorage.removeItem(DRAFT_KEY);
        const indicator = $('draft-indicator');
        if (indicator) indicator.classList.remove('visible');
        return;
      }

      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      const indicator = $('draft-indicator');
      if (indicator) {
        indicator.classList.add('visible');
        clearTimeout(draftIndicatorTimer);
        draftIndicatorTimer = setTimeout(() => {
          indicator.classList.remove('visible');
        }, 1800);
      }
    } catch {
      // localStorage may be disabled or full
    }
  }

  function triggerDraftSave() {
    clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(saveDraft, 250);
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!hasDraftContent(draft)) return;

      if (draft.student) f.student.value = draft.student;
      if (draft.phone) f.phone.value = draft.phone;
      if (draft.date) f.date.value = draft.date;
      if (draft.program && f.program) f.program.value = draft.program;
      if (draft.skill && f.skill) f.skill.value = draft.skill;
      if (draft.problem) f.problem.value = draft.problem;
      if (draft.observed) f.observed.value = draft.observed;
      if (draft.next) f.next.value = draft.next;
      if (draft.easier) f.easier.value = draft.easier;

      if (draft.context) {
        const rad = document.querySelector(`input[name="observation-context"][value="${draft.context}"]`);
        if (rad) rad.checked = true;
      }

      updatePreview();

      const alertEl = $('draft-alert');
      const msgEl = $('draft-message');
      if (alertEl && msgEl) {
        let timeStr = 'earlier';
        if (draft.savedAt) {
          try {
            timeStr = new Date(draft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch {}
        }
        msgEl.textContent = `Restored unsaved draft (${timeStr}).`;
        alertEl.hidden = false;
      }
    } catch {
      // Ignore draft parse failure
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    const alertEl = $('draft-alert');
    if (alertEl) alertEl.hidden = true;
    const indicator = $('draft-indicator');
    if (indicator) indicator.classList.remove('visible');
  }

  function updateNetworkStatus() {
    const statusEl = $('connection-status');
    const iconEl = $('connection-icon');
    const textEl = $('connection-text');
    if (!statusEl || !iconEl || !textEl) return;

    if (navigator.onLine) {
      statusEl.className = 'daily-network-badge daily-badge-online';
      iconEl.className = 'bi bi-wifi';
      textEl.textContent = 'Online';
    } else {
      statusEl.className = 'daily-network-badge daily-badge-offline';
      iconEl.className = 'bi bi-wifi-off';
      textEl.textContent = 'Offline (Mat Mode)';
    }
  }

  function renderRoster(students, isCached) {
    const container = $('roster-chips');
    const datalist = $('student-roster');
    if (!container || !students || students.length === 0) return;

    container.innerHTML = '';
    if (datalist) datalist.innerHTML = '';

    const label = document.createElement('span');
    label.className = 'daily-roster-label';
    label.textContent = isCached ? "Checked-in (offline cache):" : "Checked-in today:";
    container.appendChild(label);

    students.forEach((st) => {
      if (datalist) {
        const opt = document.createElement('option');
        opt.value = st.name;
        datalist.appendChild(opt);
      }

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'roster-chip';
      chip.textContent = st.shortName;
      chip.title = `Auto-fill ${st.name}`;
      chip.addEventListener('click', () => {
        f.student.value = st.name;
        if (st.phone && !f.phone.value) {
          f.phone.value = st.phone;
        }
        if (st.sessionTitle && f.program) {
          const titleLower = st.sessionTitle.toLowerCase();
          if (titleLower.includes('kid')) f.program.value = 'kids';
          else if (titleLower.includes('teen')) f.program.value = 'teens';
          else if (titleLower.includes('saturday')) f.program.value = 'saturday';
          else if (titleLower.includes('adult')) f.program.value = 'adults';
          else if (titleLower.includes('private')) f.program.value = 'private';
        }
        updatePreview();
        triggerDraftSave();
        if (f.problem) f.problem.focus();
      });
      container.appendChild(chip);
    });
  }

  async function loadAttendanceRoster(targetDate) {
    const container = $('roster-chips');
    const datalist = $('student-roster');
    if (!container || !targetDate) return;

    container.innerHTML = '';
    if (datalist) datalist.innerHTML = '';

    try {
      const res = await fetch(`/api/attendance?date=${encodeURIComponent(targetDate)}`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      if (!data || !Array.isArray(data.attendance) || data.attendance.length === 0) {
        return;
      }

      const uniqueStudents = [];
      const seen = new Set();
      data.attendance.forEach((rec) => {
        const id = rec.person_id || `${rec.first_name}_${rec.last_name}`;
        if (!seen.has(id)) {
          seen.add(id);
          const fullName = `${rec.first_name || ''} ${rec.last_name || ''}`.trim();
          if (fullName) {
            const shortName = `${rec.first_name || ''} ${rec.last_name ? rec.last_name[0] + '.' : ''}`.trim();
            uniqueStudents.push({
              name: fullName,
              shortName: shortName || fullName,
              phone: rec.phone || '',
              sessionTitle: rec.session_title || ''
            });
          }
        }
      });

      if (uniqueStudents.length > 0) {
        try {
          localStorage.setItem(`ssbjj_roster_${targetDate}`, JSON.stringify(uniqueStudents));
        } catch {}
        renderRoster(uniqueStudents, false);
      }
    } catch {
      // Offline fallback: check local roster cache
      try {
        const raw = localStorage.getItem(`ssbjj_roster_${targetDate}`);
        if (raw) {
          const cached = JSON.parse(raw);
          if (Array.isArray(cached) && cached.length > 0) {
            renderRoster(cached, true);
          }
        }
      } catch {}
    }
  }

  function resetForm() {
    f.student.value = '';
    f.phone.value = '';
    f.skill.value = '';
    f.problem.value = '';
    f.observed.value = '';
    f.next.value = '';
    f.easier.value = '';
    f.date.value = todayIso();
    if (f.program) f.program.selectedIndex = 0;

    document.querySelectorAll('input[name="observation-context"]').forEach(x => { x.checked = false; });
    reportDispatched = false;
    $('new-student').disabled = true;
    $('form-error').hidden = true;
    $('save-status').textContent = '';

    clearDraft();
    loadAttendanceRoster(f.date.value);
    updatePreview();
    f.student.focus();
  }

  function init() {
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    f.date.value = todayIso();
    $('new-student').disabled = true;
    loadAttendanceRoster(f.date.value);

    // Refresh attendance when date changes
    f.date.addEventListener('change', () => {
      loadAttendanceRoster(f.date.value);
      triggerDraftSave();
    });

    // Clear draft button
    $('clear-draft-btn')?.addEventListener('click', () => {
      clearDraft();
      resetForm();
    });

    // Populate skills
    SKILLS.forEach(([key, label]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = label;
      f.skill.appendChild(opt);
    });

    // Populate contexts
    const ctxContainer = $('context-options');
    if (ctxContainer) {
      CONTEXTS.forEach((label) => {
        const wrap = document.createElement('label');
        wrap.className = 'checkin-context';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'observation-context';
        radio.value = label;
        const text = document.createElement('span');
        text.textContent = label;
        wrap.append(radio, text);
        ctxContainer.appendChild(wrap);
      });
      ctxContainer.addEventListener('change', () => {
        updatePreview();
        triggerDraftSave();
      });
    }

    // Populate quick problem chips
    const chipsContainer = $('quick-chips');
    if (chipsContainer) {
      QUICK_PROBLEMS.forEach((text) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'checkin-chip';
        chip.textContent = text;
        chip.addEventListener('click', () => {
          f.problem.value = text;
          updatePreview();
          triggerDraftSave();
        });
        chipsContainer.appendChild(chip);
      });
    }

    // Bind inputs to preview & auto-save
    Object.values(f).forEach(inputEl => {
      if (inputEl) {
        inputEl.addEventListener('input', () => {
          updatePreview();
          triggerDraftSave();
        });
      }
      if (inputEl && inputEl.tagName === 'SELECT') {
        inputEl.addEventListener('change', () => {
          updatePreview();
          triggerDraftSave();
        });
      }
    });

    // Restore any existing draft on startup
    restoreDraft();

    // Send SMS Button
    $('send-sms')?.addEventListener('click', async () => {
      const errs = validate();
      if (errs.length) {
        showStatus(errs.join(' '), true);
        return;
      }

      const smsText = formatSmsMessage();
      const rawPhone = f.phone.value.trim().replace(/[^\d+]/g, '');

      // Copy text to clipboard in all cases
      try {
        await copyToClipboard(smsText);
      } catch (err) {
        console.warn('Clipboard copy failed:', err);
      }

      reportDispatched = true;
      $('new-student').disabled = false;
      clearDraft();

      // Construct SMS url
      // iOS supports `sms:+1234567890&body=...`, Android supports `sms:+1234567890?body=...`
      const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
      const sep = isApple ? '&' : '?';
      const smsUri = rawPhone
        ? `sms:${rawPhone}${sep}body=${encodeURIComponent(smsText)}`
        : `sms:${sep}body=${encodeURIComponent(smsText)}`;

      showStatus(
        rawPhone
          ? 'Opening messaging app and copied note to clipboard.'
          : 'Text copied to clipboard! Opening messaging app.',
        false
      );

      // Attempt SMS link navigation
      window.location.href = smsUri;
    });

    // Copy Summary Button
    $('copy-summary')?.addEventListener('click', async () => {
      const errs = validate();
      if (errs.length) {
        showStatus(errs.join(' '), true);
        return;
      }

      const summary = formatFullSummary();
      try {
        await copyToClipboard(summary);
        showStatus('Summary copied to clipboard!', false);
        reportDispatched = true;
        $('new-student').disabled = false;
        clearDraft();
      } catch {
        window.prompt('Copy this report summary:', summary);
      }
    });

    // Save PDF / Print Button
    $('save-pdf')?.addEventListener('click', () => {
      const errs = validate();
      if (errs.length) {
        showStatus(errs.join(' '), true);
        return;
      }

      const oldTitle = document.title;
      const safe = f.student.value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'Student';
      document.title = `Sensei-Sandy_Daily-Report_${safe}_${f.date.value}`;
      reportDispatched = true;
      $('new-student').disabled = false;
      clearDraft();
      showStatus('Print dialog opened. Your report stays on the page.', false);
      window.print();
      setTimeout(() => { document.title = oldTitle; }, 1000);
    });

    // Next Student Button
    $('new-student')?.addEventListener('click', () => {
      if (
        !reportDispatched &&
        (f.student.value.trim() || f.problem.value.trim() || f.observed.value.trim()) &&
        !window.confirm('This report has not been sent or copied. Start next student anyway?')
      ) {
        return;
      }
      resetForm();
    });

    updatePreview();

    // Register scoped offline service worker
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('/sw-daily-checkin.js', { scope: '/daily-checkin' }).catch(() => {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
