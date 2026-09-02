(function () {
  'use strict';

  // Canonical skill definitions matching the specification
  const CANONICAL_SKILLS = [
    { key: 'feet_to_floor', label: 'Standing and falling safely', category: 'Feet to Floor' },
    { key: 'pinning', label: 'Staying on top', category: 'Pinning' },
    { key: 'pin_escapes', label: 'Getting out from bottom', category: 'Pin Escapes' },
    { key: 'base_retention', label: 'Keeping balance on top', category: 'Base Retention' },
    { key: 'guard_passing', label: 'Getting past the legs', category: 'Guard Passing' },
    { key: 'guard_retention', label: 'Keeping the legs in front', category: 'Guard Retention' },
    { key: 'guard', label: 'Using the legs from bottom', category: 'Guard' },
    { key: 'submissions', label: 'Finishing a hold safely', category: 'Submissions' },
    { key: 'submission_escapes', label: 'Getting safe from a hold', category: 'Submission Escapes' }
  ];

  const CONTEXTS = [
    { key: 'game', label: 'Game' },
    { key: 'positional_round', label: 'Positional round' },
    { key: 'live_round', label: 'Live round' },
    { key: 'guided_practice', label: 'Guided practice' },
    { key: 'other', label: 'Other' }
  ];

  const HELP_LEVELS = [
    { key: 'none', label: 'None' },
    { key: 'small_reminder', label: 'Small reminder' },
    { key: 'active_coaching', label: 'Active coaching' },
    { key: 'full_help', label: 'Full help' },
    { key: 'need_to_see_again', label: 'Need to see again' }
  ];

  // State
  let opsKey = sessionStorage.getItem('youthOpsKey') || sessionStorage.getItem('opsApiKey') || '';
  let currentWeek = { start: '', end: '', label: '' };
  let pendingTargetWeek = '';
  let students = [];
  let summary = { students_trained: 0, reviewed: 0, remaining: 0, is_complete: false };
  let selectedStudentId = null;
  let isDirty = false;
  let isSaving = false;
  let viewingCompletedList = false;

  // DOM Elements
  const opsKeyInput = document.getElementById('ops-key');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const authBar = document.getElementById('auth-toolbar');
  const authStatus = document.getElementById('auth-status');

  const prevWeekBtn = document.getElementById('prev-week-btn');
  const nextWeekBtn = document.getElementById('next-week-btn');
  const currentWeekLabel = document.getElementById('current-week-label');

  const statsTrained = document.getElementById('stats-trained');
  const statsReviewed = document.getElementById('stats-reviewed');
  const statsRemaining = document.getElementById('stats-remaining');
  const statsIndicator = document.getElementById('stats-indicator');
  const statsProgressFill = document.getElementById('stats-progress-fill');

  const queueContainer = document.getElementById('student-queue-container');
  const queueList = document.getElementById('student-queue-list');
  const emptyAttendanceMsg = document.getElementById('empty-attendance-message');

  const auditSection = document.getElementById('audit-workflow-section');
  const weekCompleteSection = document.getElementById('week-complete-section');
  const weekCompleteTrained = document.getElementById('week-complete-trained');
  const weekCompleteReviewed = document.getElementById('week-complete-reviewed');
  const viewCompletedAuditsBtn = document.getElementById('view-completed-audits-btn');
  const weekCompletePrevBtn = document.getElementById('week-complete-prev-btn');

  const headerStudentName = document.getElementById('header-student-name');
  const headerWeekLabel = document.getElementById('header-week-label');
  const headerClassCount = document.getElementById('header-class-count');
  const headerSessionList = document.getElementById('header-session-list');
  const viewHistoryBtn = document.getElementById('view-history-btn');

  const detailBelt = document.getElementById('detail-belt');
  const detailSchedule = document.getElementById('detail-schedule');
  const detailPrevFocus = document.getElementById('detail-prev-focus');
  const detailLastAudit = document.getElementById('detail-last-audit');
  const detailLastReview = document.getElementById('detail-last-review');

  const lastCheckInDisclosure = document.getElementById('last-checkin-disclosure');
  const lastCheckInWeek = document.getElementById('last-checkin-week');
  const lastCheckInSkill = document.getElementById('last-checkin-skill');
  const lastCheckInObserved = document.getElementById('last-checkin-observed');
  const lastCheckInNext = document.getElementById('last-checkin-next');
  const lastCheckInCoachNote = document.getElementById('last-checkin-coach-note');
  const lastCheckInCoachNoteRow = document.getElementById('last-checkin-coach-note-row');
  const useSameFocusBtn = document.getElementById('use-same-focus-btn');

  const mainSkillContainer = document.getElementById('main-skill-container');
  const problemObservedInput = document.getElementById('problem-observed');
  const observationContextContainer = document.getElementById('observation-context-container');
  const helpLevelContainer = document.getElementById('help-level-container');
  const observedActionInput = document.getElementById('observed-action');
  const nextActionInput = document.getElementById('next-action');
  const gettingEasierInput = document.getElementById('getting-easier');
  const coachNoteInput = document.getElementById('coach-note');

  const saveNextBtn = document.getElementById('save-next-btn');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const needObservationBtn = document.getElementById('need-observation-btn');
  const copyFamilyBtn = document.getElementById('copy-family-btn');
  const copyFamilySidebarBtn = document.getElementById('copy-family-sidebar-btn');
  const saveStatusMsg = document.getElementById('save-status-msg');
  const copyStatusMsg = document.getElementById('copy-status-msg');
  const formErrorList = document.getElementById('form-error-list');

  const familyPreviewStudent = document.getElementById('family-preview-student');
  const familyPreviewWeek = document.getElementById('family-preview-week');
  const familyPreviewObserved = document.getElementById('family-preview-observed');
  const familyPreviewNext = document.getElementById('family-preview-next');
  const familyPreviewEasier = document.getElementById('family-preview-easier');
  const familyPreviewEasierGroup = document.getElementById('family-preview-easier-group');

  const historyModal = document.getElementById('history-modal');
  const historyModalTitle = document.getElementById('history-modal-title');
  const historyModalBody = document.getElementById('history-modal-body');
  const closeHistoryBtn = document.getElementById('close-history-btn');

  const warningModal = document.getElementById('unfinished-warning-modal');
  const warningModalText = document.getElementById('warning-modal-text');
  const stayWeekBtn = document.getElementById('stay-week-btn');
  const proceedOtherWeekBtn = document.getElementById('proceed-other-week-btn');

  // Init
  function init() {
    if (opsKey) {
      opsKeyInput.value = opsKey;
      authStatus.textContent = 'Key saved.';
    }

    renderSkillOptions();
    renderContextOptions();
    renderHelpLevelOptions();
    setupEventListeners();

    // Default to current week
    const monday = getMondayOfCurrentWeek();
    loadWeek(monday);
  }

  function getMondayOfCurrentWeek(baseDate) {
    const d = baseDate ? new Date(baseDate) : new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function getHeaders() {
    const h = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (opsKey) {
      h['X-Ops-Api-Key'] = opsKey;
    }
    return h;
  }

  function renderSkillOptions() {
    mainSkillContainer.replaceChildren();
    CANONICAL_SKILLS.forEach((skill) => {
      const label = document.createElement('label');
      label.className = 'ss-choice-chip';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'main_skill_key';
      radio.value = skill.key;
      radio.addEventListener('change', () => {
        isDirty = true;
        clearErrors();
      });

      const span = document.createElement('span');
      span.className = 'ss-chip-text';
      span.innerHTML = `<strong>${skill.category}</strong> <span class="ss-chip-desc">→ ${skill.label}</span>`;

      label.appendChild(radio);
      label.appendChild(span);
      mainSkillContainer.appendChild(label);
    });
  }

  function renderContextOptions() {
    observationContextContainer.replaceChildren();
    CONTEXTS.forEach((ctx) => {
      const label = document.createElement('label');
      label.className = 'ss-choice-chip ss-choice-pill';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'observation_context';
      radio.value = ctx.key;
      radio.addEventListener('change', () => { isDirty = true; });

      const span = document.createElement('span');
      span.className = 'ss-chip-text';
      span.textContent = ctx.label;

      label.appendChild(radio);
      label.appendChild(span);
      observationContextContainer.appendChild(label);
    });
  }

  function renderHelpLevelOptions() {
    helpLevelContainer.replaceChildren();
    HELP_LEVELS.forEach((hl) => {
      const label = document.createElement('label');
      label.className = 'ss-choice-chip ss-choice-pill';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'help_level';
      radio.value = hl.key;
      radio.addEventListener('change', () => { isDirty = true; });

      const span = document.createElement('span');
      span.className = 'ss-chip-text';
      span.textContent = hl.label;

      label.appendChild(radio);
      label.appendChild(span);
      helpLevelContainer.appendChild(label);
    });
  }

  async function loadWeek(weekStart) {
    clearErrors();
    saveStatusMsg.textContent = 'Loading week…';

    try {
      const res = await fetch(`/api/weekly-audits?action=week&week_start_date=${encodeURIComponent(weekStart)}`, {
        headers: getHeaders()
      });

      if (res.status === 401 || res.status === 503) {
        authStatus.textContent = 'Coach Ops key required.';
        authBar.classList.remove('d-none');
        saveStatusMsg.textContent = 'Enter coach key above to access records.';
        return;
      }

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      currentWeek = {
        start: data.week_start_date,
        end: data.week_end_date,
        label: data.week_label
      };
      students = data.students || [];
      summary = data.summary || { students_trained: 0, reviewed: 0, remaining: 0, is_complete: false };

      updateWeekDisplay();
      renderSummary();
      renderQueue();

      // Check weekly completion
      if (summary.is_complete && !viewingCompletedList) {
        showWeekComplete();
      } else {
        weekCompleteSection.classList.add('d-none');
        if (students.length > 0) {
          auditSection.classList.remove('d-none');
          // Automatically pick first unfinished student, or preserve current selection
          const nextStudent = students.find((s) => !s.is_reviewed) || students[0];
          selectStudent(nextStudent.student_id);
        } else {
          auditSection.classList.add('d-none');
        }
      }

      saveStatusMsg.textContent = '';
      isDirty = false;
    } catch (err) {
      saveStatusMsg.textContent = `Could not load week: ${err.message}`;
    }
  }

  function updateWeekDisplay() {
    currentWeekLabel.textContent = `Week of ${formatDateFriendly(currentWeek.start)}`;
  }

  function formatDateFriendly(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  function renderSummary() {
    statsTrained.textContent = summary.students_trained;
    statsReviewed.textContent = summary.reviewed;
    statsRemaining.textContent = summary.remaining;
    statsIndicator.textContent = `${summary.reviewed} of ${summary.students_trained} reviewed`;

    const pct = summary.students_trained > 0
      ? Math.round((summary.reviewed / summary.students_trained) * 100)
      : 0;
    statsProgressFill.style.width = `${pct}%`;
  }

  function renderQueue() {
    queueList.replaceChildren();

    if (students.length === 0) {
      emptyAttendanceMsg.classList.remove('d-none');
      return;
    }
    emptyAttendanceMsg.classList.add('d-none');

    students.forEach((s) => {
      const card = document.createElement('div');
      card.className = `ss-queue-card ${s.student_id === selectedStudentId ? 'is-active' : ''} ${s.is_reviewed ? 'is-reviewed' : 'is-pending'}`;
      card.dataset.studentId = s.student_id;

      const nameRow = document.createElement('div');
      nameRow.className = 'ss-queue-row-header';

      const nameEl = document.createElement('h3');
      nameEl.className = 'ss-queue-name';
      nameEl.textContent = s.student_name;

      const badge = document.createElement('span');
      badge.className = `ss-audit-badge ss-status-${s.audit_status}`;
      badge.textContent = getStatusLabel(s.audit_status);

      nameRow.appendChild(nameEl);
      nameRow.appendChild(badge);

      const countEl = document.createElement('div');
      countEl.className = 'ss-queue-classes';
      countEl.textContent = `${s.classes_attended} ${s.classes_attended === 1 ? 'class' : 'classes'}`;

      const datesEl = document.createElement('div');
      datesEl.className = 'ss-queue-dates';
      datesEl.textContent = s.class_dates_display;

      const actionRow = document.createElement('div');
      actionRow.className = 'ss-queue-action';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = s.is_reviewed ? 'btn btn-sm btn-outline-secondary' : 'btn btn-sm btn-primary';
      btn.textContent = s.is_reviewed ? 'Edit' : 'Start';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmAndSelect(s.student_id);
      });

      actionRow.appendChild(btn);

      card.appendChild(nameRow);
      card.appendChild(countEl);
      card.appendChild(datesEl);
      card.appendChild(actionRow);

      card.addEventListener('click', () => {
        confirmAndSelect(s.student_id);
      });

      queueList.appendChild(card);
    });
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'complete': return 'Complete';
      case 'needs_observation': return 'Needs another observation';
      case 'draft': return 'Draft';
      case 'not_started':
      default:
        return 'Needs audit';
    }
  }

  function confirmAndSelect(studentId) {
    if (studentId === selectedStudentId) return;
    if (isDirty) {
      const confirmDiscard = window.confirm('You have unsaved changes on this student note. Discard changes and switch student?');
      if (!confirmDiscard) return;
    }
    selectStudent(studentId);
  }

  function selectStudent(studentId) {
    selectedStudentId = studentId;
    const student = students.find((s) => s.student_id === studentId);
    if (!student) return;

    viewingCompletedList = false;
    weekCompleteSection.classList.add('d-none');
    auditSection.classList.remove('d-none');

    // Update Queue highlight
    document.querySelectorAll('.ss-queue-card').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.studentId === studentId);
    });

    // Populate Audit Header
    headerStudentName.textContent = student.student_name;
    headerWeekLabel.textContent = `Week of ${formatDateFriendly(currentWeek.start)}`;
    headerClassCount.textContent = `Classes seen: ${student.classes_attended}`;

    headerSessionList.replaceChildren();
    (student.sessions || []).forEach((sess) => {
      const li = document.createElement('li');
      li.textContent = `${sess.day_name} (${sess.formatted_time}) — ${sess.session_title}`;
      headerSessionList.appendChild(li);
    });

    // Details disclosure
    detailBelt.textContent = student.more_details?.belt || 'White Belt';
    detailSchedule.textContent = student.more_details?.regular_schedule || 'General';
    detailPrevFocus.textContent = student.more_details?.previous_focus || 'None recorded';
    detailLastAudit.textContent = student.more_details?.last_weekly_audit || 'None';
    detailLastReview.textContent = student.more_details?.last_full_progress_review || 'None on record';

    // Last Check-In
    if (student.last_check_in) {
      lastCheckInDisclosure.classList.remove('d-none');
      lastCheckInWeek.textContent = student.last_check_in.week_label;
      lastCheckInSkill.textContent = student.last_check_in.main_skill_label;
      lastCheckInObserved.textContent = student.last_check_in.observed_action;
      lastCheckInNext.textContent = student.last_check_in.next_action;

      if (student.last_check_in.coach_note) {
        lastCheckInCoachNote.textContent = student.last_check_in.coach_note;
        lastCheckInCoachNoteRow.classList.remove('d-none');
      } else {
        lastCheckInCoachNoteRow.classList.add('d-none');
      }

      useSameFocusBtn.onclick = () => {
        const key = student.last_check_in.main_skill_key;
        const radio = document.querySelector(`input[name="main_skill_key"][value="${key}"]`);
        if (radio) radio.checked = true;
        if (student.last_check_in.problem_observed && !problemObservedInput.value.trim()) {
          problemObservedInput.value = student.last_check_in.problem_observed;
        }
        isDirty = true;
        clearErrors();
        updateFamilyPreview();
      };
    } else {
      lastCheckInDisclosure.classList.add('d-none');
    }

    // Populate or reset form fields
    const audit = student.current_audit;
    if (audit) {
      setRadioValue('main_skill_key', audit.main_skill_key);
      problemObservedInput.value = audit.problem_observed || '';
      setRadioValue('observation_context', audit.observation_context);
      setRadioValue('help_level', audit.help_level);
      observedActionInput.value = audit.observed_action || '';
      nextActionInput.value = audit.next_action || '';
      gettingEasierInput.value = audit.getting_easier || '';
      coachNoteInput.value = audit.coach_note || '';
    } else {
      resetRadioValue('main_skill_key');
      problemObservedInput.value = '';
      resetRadioValue('observation_context');
      resetRadioValue('help_level');
      observedActionInput.value = '';
      nextActionInput.value = '';
      gettingEasierInput.value = '';
      coachNoteInput.value = '';
    }

    clearErrors();
    saveStatusMsg.textContent = '';
    copyStatusMsg.textContent = '';
    isDirty = false;
    updateFamilyPreview();

    // Scroll form into view if on small screens
    if (window.innerWidth < 768) {
      auditSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function setRadioValue(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
    } else {
      resetRadioValue(name);
    }
  }

  function resetRadioValue(name) {
    document.querySelectorAll(`input[name="${name}"]`).forEach((r) => { r.checked = false; });
  }

  function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  function updateFamilyPreview() {
    const student = students.find((s) => s.student_id === selectedStudentId);
    const studentName = student ? student.student_name : 'Student';
    const weekFormatted = formatDateFriendly(currentWeek.start);

    familyPreviewStudent.textContent = studentName;
    familyPreviewWeek.textContent = `Week of ${weekFormatted}`;

    const observed = observedActionInput.value.trim();
    const next = nextActionInput.value.trim();
    const easier = gettingEasierInput.value.trim();

    familyPreviewObserved.textContent = observed || '(Record what you saw)';
    familyPreviewNext.textContent = next || '(Record what they should try next)';

    if (easier) {
      familyPreviewEasierGroup.classList.remove('d-none');
      familyPreviewEasier.textContent = easier;
    } else {
      familyPreviewEasierGroup.classList.add('d-none');
    }
  }

  function getFamilyNoteText() {
    const student = students.find((s) => s.student_id === selectedStudentId);
    const studentName = student ? student.student_name : 'Student';
    const weekFormatted = formatDateFriendly(currentWeek.start);
    const observed = observedActionInput.value.trim();
    const next = nextActionInput.value.trim();
    const easier = gettingEasierInput.value.trim();

    let text = `Sandy's Weekly Check-In\n\n`;
    text += `${studentName} — Week of ${weekFormatted}\n\n`;
    text += `This week:\n${observed}\n\n`;
    text += `Next time:\n${next}\n\n`;
    if (easier) {
      text += `Getting easier:\n${easier}\n\n`;
    }
    text += `Ask me:\n"What felt easier?"`;
    return text;
  }

  async function copyFamilyNote() {
    const note = getFamilyNoteText();
    try {
      await navigator.clipboard.writeText(note);
      showCopyFeedback('Family note copied.');
    } catch {
      window.prompt('Copy family note:', note);
    }
  }

  function showCopyFeedback(msg) {
    copyStatusMsg.textContent = msg;
    copyStatusMsg.classList.remove('d-none');
    setTimeout(() => {
      copyStatusMsg.textContent = '';
      copyStatusMsg.classList.add('d-none');
    }, 2500);
  }

  function clearErrors() {
    formErrorList.replaceChildren();
    formErrorList.classList.add('d-none');
  }

  function showErrors(errors) {
    formErrorList.replaceChildren();
    errors.forEach((msg) => {
      const li = document.createElement('li');
      li.textContent = msg;
      formErrorList.appendChild(li);
    });
    formErrorList.classList.remove('d-none');
    formErrorList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function validateCompleteAudit() {
    const errors = [];
    const mainSkill = getRadioValue('main_skill_key');
    const problem = problemObservedInput.value.trim();
    const observed = observedActionInput.value.trim();
    const next = nextActionInput.value.trim();

    if (!mainSkill) errors.push('Choose a main skill.');
    if (!problem) errors.push('Add what were they trying to do.');
    if (!observed) errors.push('Add what you saw.');
    if (!next) errors.push('Add what they should try next.');

    return errors;
  }

  async function saveAudit(status, advanceNext) {
    if (isSaving) return;
    if (!selectedStudentId) return;

    clearErrors();

    if (status === 'complete') {
      const validationErrors = validateCompleteAudit();
      if (validationErrors.length > 0) {
        showErrors(validationErrors);
        return;
      }
    }

    isSaving = true;
    setButtonsDisabled(true);
    saveStatusMsg.textContent = 'Saving…';
    saveStatusMsg.className = 'ss-status-msg text-muted';

    const payload = {
      student_id: selectedStudentId,
      week_start_date: currentWeek.start,
      week_end_date: currentWeek.end,
      status: status,
      main_skill_key: getRadioValue('main_skill_key'),
      problem_observed: problemObservedInput.value.trim(),
      observation_context: getRadioValue('observation_context'),
      help_level: getRadioValue('help_level'),
      observed_action: observedActionInput.value.trim(),
      next_action: nextActionInput.value.trim(),
      getting_easier: gettingEasierInput.value.trim(),
      coach_note: coachNoteInput.value.trim()
    };

    try {
      const res = await fetch('/api/weekly-audits', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          showErrors(Object.values(data.errors));
        } else {
          showErrors([data.error || 'Audit was not saved. Your text is still here. Try again.']);
        }
        saveStatusMsg.textContent = 'Save failed.';
        saveStatusMsg.className = 'ss-status-msg text-danger';
        setButtonsDisabled(false);
        isSaving = false;
        return;
      }

      isDirty = false;
      saveStatusMsg.textContent = 'Saved.';
      saveStatusMsg.className = 'ss-status-msg text-success';

      // Update student in local state
      const s = students.find((item) => item.student_id === selectedStudentId);
      if (s) {
        s.audit_status = status;
        s.is_reviewed = true;
        s.current_audit = {
          ...payload,
          id: data.audit_id
        };
      }

      // Recalculate summary
      const reviewed = students.filter((item) => item.is_reviewed).length;
      summary.reviewed = reviewed;
      summary.remaining = students.length - reviewed;
      summary.is_complete = (students.length > 0 && summary.remaining === 0);

      renderSummary();
      renderQueue();

      if (advanceNext) {
        // Find next unfinished student
        const nextIncomplete = students.find((item) => !item.is_reviewed);
        if (nextIncomplete) {
          selectStudent(nextIncomplete.student_id);
          // Focus first input of audit form
          const firstInput = document.querySelector('input[name="main_skill_key"]');
          if (firstInput) firstInput.focus();
        } else {
          showWeekComplete();
        }
      } else {
        setTimeout(() => {
          saveStatusMsg.textContent = '';
        }, 2000);
      }
    } catch (err) {
      showErrors(['Audit was not saved. Your text is still here. Try again.']);
      saveStatusMsg.textContent = 'Save failed.';
      saveStatusMsg.className = 'ss-status-msg text-danger';
    } finally {
      setButtonsDisabled(false);
      isSaving = false;
    }
  }

  function setButtonsDisabled(disabled) {
    saveNextBtn.disabled = disabled;
    saveNoteBtn.disabled = disabled;
    needObservationBtn.disabled = disabled;
  }

  function showWeekComplete() {
    viewingCompletedList = false;
    auditSection.classList.add('d-none');
    weekCompleteSection.classList.remove('d-none');
    weekCompleteTrained.textContent = `${summary.students_trained} students trained`;
    weekCompleteReviewed.textContent = `${summary.reviewed} reviewed`;
  }

  async function openHistory(studentId) {
    const student = students.find((s) => s.student_id === studentId);
    if (!student) return;

    historyModalTitle.textContent = `${student.student_name} — Audit History`;
    historyModalBody.replaceChildren();

    const loading = document.createElement('p');
    loading.className = 'text-muted';
    loading.textContent = 'Loading audit history…';
    historyModalBody.appendChild(loading);

    historyModal.classList.remove('d-none');

    try {
      const res = await fetch(`/api/weekly-audits?action=history&student_id=${encodeURIComponent(studentId)}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      historyModalBody.replaceChildren();

      if (!data.history || data.history.length === 0) {
        const none = document.createElement('p');
        none.className = 'text-muted';
        none.textContent = 'No previous weekly audits recorded for this student.';
        historyModalBody.appendChild(none);
        return;
      }

      data.history.forEach((h) => {
        const item = document.createElement('div');
        item.className = 'ss-history-entry';

        const title = document.createElement('h4');
        title.innerHTML = `Week of ${formatDateFriendly(h.week_start_date)} <span class="ss-audit-badge ss-status-${h.status}">${getStatusLabel(h.status)}</span>`;

        const skill = document.createElement('p');
        skill.innerHTML = `<strong>Main Skill:</strong> ${h.main_skill_label || 'None'}`;

        const whatHappened = document.createElement('p');
        whatHappened.innerHTML = `<strong>You did this:</strong> ${h.observed_action || '—'}`;

        const nextAction = document.createElement('p');
        nextAction.innerHTML = `<strong>Next time:</strong> ${h.next_action || '—'}`;

        item.appendChild(title);
        item.appendChild(skill);
        item.appendChild(whatHappened);
        item.appendChild(nextAction);

        if (h.coach_note) {
          const note = document.createElement('p');
          note.className = 'text-muted small';
          note.innerHTML = `<em>Coach Note: ${h.coach_note}</em>`;
          item.appendChild(note);
        }

        historyModalBody.appendChild(item);
      });
    } catch (err) {
      historyModalBody.replaceChildren();
      const errEl = document.createElement('p');
      errEl.className = 'text-danger';
      errEl.textContent = `Could not load history: ${err.message}`;
      historyModalBody.appendChild(errEl);
    }
  }

  function tryChangeWeek(targetStartDate) {
    if (summary.remaining > 0 && students.length > 0) {
      pendingTargetWeek = targetStartDate;
      warningModalText.textContent = `${summary.remaining} students still need review for ${currentWeek.label}.`;
      warningModal.classList.remove('d-none');
    } else {
      if (isDirty) {
        const discard = window.confirm('You have unsaved changes on this audit. Discard and change week?');
        if (!discard) return;
      }
      loadWeek(targetStartDate);
    }
  }

  function setupEventListeners() {
    // Auth
    saveKeyBtn.addEventListener('click', () => {
      opsKey = opsKeyInput.value.trim();
      sessionStorage.setItem('youthOpsKey', opsKey);
      sessionStorage.setItem('opsApiKey', opsKey);
      authStatus.textContent = opsKey ? 'Key saved.' : 'Key cleared.';
      loadWeek(currentWeek.start || getMondayOfCurrentWeek());
    });

    // Week navigation
    prevWeekBtn.addEventListener('click', () => {
      const prev = addDays(currentWeek.start, -7);
      tryChangeWeek(prev);
    });

    nextWeekBtn.addEventListener('click', () => {
      const next = addDays(currentWeek.start, 7);
      tryChangeWeek(next);
    });

    weekCompletePrevBtn.addEventListener('click', () => {
      const prev = addDays(currentWeek.start, -7);
      loadWeek(prev);
    });

    viewCompletedAuditsBtn.addEventListener('click', () => {
      viewingCompletedList = true;
      weekCompleteSection.classList.add('d-none');
      auditSection.classList.remove('d-none');
      if (students.length > 0) {
        selectStudent(students[0].student_id);
      }
    });

    // Warning modal
    stayWeekBtn.addEventListener('click', () => {
      warningModal.classList.add('d-none');
      pendingTargetWeek = '';
    });

    proceedOtherWeekBtn.addEventListener('click', () => {
      warningModal.classList.add('d-none');
      if (pendingTargetWeek) {
        loadWeek(pendingTargetWeek);
        pendingTargetWeek = '';
      }
    });

    // Live preview update on text input
    [observedActionInput, nextActionInput, gettingEasierInput].forEach((input) => {
      input.addEventListener('input', () => {
        isDirty = true;
        clearErrors();
        updateFamilyPreview();
      });
    });

    [problemObservedInput, coachNoteInput].forEach((input) => {
      input.addEventListener('input', () => {
        isDirty = true;
        clearErrors();
      });
    });

    // Save actions
    saveNextBtn.addEventListener('click', () => saveAudit('complete', true));
    saveNoteBtn.addEventListener('click', () => saveAudit('complete', false));
    needObservationBtn.addEventListener('click', () => saveAudit('needs_observation', true));

    // Copy actions
    copyFamilyBtn.addEventListener('click', copyFamilyNote);
    copyFamilySidebarBtn.addEventListener('click', copyFamilyNote);

    // History
    viewHistoryBtn.addEventListener('click', () => {
      if (selectedStudentId) openHistory(selectedStudentId);
    });
    closeHistoryBtn.addEventListener('click', () => {
      historyModal.classList.add('d-none');
    });

    // Window navigation unsaved change check
    window.addEventListener('beforeunload', (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
