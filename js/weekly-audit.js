(function () {
  'use strict';

  const SKILLS = [
    ['feet_to_floor', 'Fall safely'],
    ['pin_escapes', 'Get free when held down'],
    ['guard', 'Use legs to keep space'],
    ['guard_retention', 'Keep legs in front'],
    ['submission_escapes', 'Get free from a hold'],
    ['pinning', 'Stay on top'],
    ['base_retention', 'Keep balance on top'],
    ['guard_passing', 'Get past the legs'],
    ['submissions', 'Finish with a safe hold']
  ];
  const CONTEXTS = [
    { value: 'Game', label: 'Game' },
    { value: 'Position', label: 'Position (start in one spot)' },
    { value: 'Live', label: 'Live (move and choose)' },
    { value: 'Drill', label: 'Drill (repeat a move)' },
    { value: 'Other', label: 'Other' }
  ];
  const $ = (id) => document.getElementById(id);
  const form = {
    student: $('student'), week: $('week-of'), phase: $('training-phase'), skill: $('main-skill'),
    problem: $('problem'), observed: $('observed-action'), next: $('next-action'), easier: $('getting-easier')
  };
  let printInvoked = false;

  function monday() {
    const date = new Date();
    const day = date.getDay();
    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    return date.toISOString().slice(0, 10);
  }

  function selectedContext() {
    const selected = document.querySelector('input[name="observation-context"]:checked');
    return selected?.closest('label')?.querySelector('span')?.textContent || '';
  }

  function checkinType() {
    return document.querySelector('input[name="checkin-type"]:checked')?.value || 'adult';
  }

  function checkinTypeLabel() {
    return checkinType() === 'youth' ? 'Youth check-in · Grown-up can help' : 'Adult check-in';
  }

  function setPreview(id, value, emptyText) {
    const element = $(id);
    element.textContent = value || emptyText;
    element.classList.toggle('print-empty', !value);
  }

  function preview() {
    const name = form.student.value.trim();
    const week = form.week.value;
    const skill = form.skill.selectedOptions[0]?.textContent || '';
    const context = selectedContext();
    const weekLong = week ? new Date(`${week}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
    const weekShort = week ? new Date(`${week}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';

    setPreview('preview-student', name, 'Student name');
    setPreview('preview-week', weekLong ? `Week of ${weekLong}` : '', 'Week of …');

    const phaseSelect = $('training-phase');
    const phaseText = phaseSelect && phaseSelect.value !== 'weekly' ? phaseSelect.options[phaseSelect.selectedIndex]?.textContent : '';
    const prevPhase = $('preview-phase');
    if (prevPhase) {
      prevPhase.textContent = phaseText ? `Phase: ${phaseText}` : '';
      prevPhase.hidden = !phaseText;
    }

    setPreview('preview-skill', skill, 'Pick a skill');
    setPreview('preview-problem', form.problem.value.trim(), 'I saw you…');
    setPreview('preview-observed', form.observed.value.trim(), 'I learned…');
    setPreview('preview-next', form.next.value.trim(), 'My next step');
    $('preview-context').textContent = context ? `Where: ${context}` : '';
    $('preview-easier').textContent = form.easier.value.trim();
    $('preview-easier-block').hidden = !form.easier.value.trim();

    $('receipt-type').textContent = checkinTypeLabel();
    $('receipt-blank-type').textContent = checkinTypeLabel();
    $('receipt-student').textContent = name ? `Student name: ${name}` : 'Student name: __________________';
    $('receipt-week').textContent = weekShort ? `Week of: ${weekShort}` : 'Week of: ______________';

    const recPhase = $('receipt-phase');
    if (recPhase) {
      recPhase.textContent = phaseText ? `Phase: ${phaseText}` : '';
      recPhase.hidden = !phaseText;
    }

    $('receipt-skill').textContent = skill || '________________';
    $('receipt-problem').textContent = form.problem.value.trim();
    $('receipt-observed').textContent = form.observed.value.trim();
    $('receipt-context').textContent = context ? `☒ ${context}` : '☐ Game　☐ Set spot　☐ Choose moves　☐ Repeat move　☐ Other';
    $('receipt-next').textContent = form.next.value.trim();
    $('receipt-easier').textContent = form.easier.value.trim();
    $('receipt-easier-block').hidden = !form.easier.value.trim();
    $('youth-help').hidden = checkinType() !== 'youth';
    document.body.dataset.printMode = $('print-mode').value;
    document.querySelector('.checkin-preview').dataset.previewMode = $('print-mode').value;
  }

  function validate() {
    const errors = [];
    if (!form.student.value.trim()) errors.push('Add a name.');
    if (!form.week.value) errors.push('Pick a week.');
    if (!form.skill.value) errors.push('Pick a skill.');
    if (!form.problem.value.trim()) errors.push('Write what you saw.');
    if (!form.observed.value.trim()) errors.push('Add the student’s words.');
    if (!form.next.value.trim()) errors.push('Write your next step.');
    return errors;
  }

  function reset() {
    form.student.value = '';
    form.skill.value = '';
    form.problem.value = '';
    form.observed.value = '';
    form.next.value = '';
    form.easier.value = '';
    if ($('training-phase')) $('training-phase').selectedIndex = 0;
    document.querySelectorAll('input[name="observation-context"]').forEach((input) => { input.checked = false; });
    printInvoked = false;
    $('new-student').disabled = true;
    $('form-error').hidden = true;
    $('save-status').textContent = '';
    preview();
    form.student.focus();
  }

  function init() {
    form.week.value = monday();
    $('new-student').disabled = true;
    SKILLS.forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      form.skill.appendChild(option);
    });
    CONTEXTS.forEach((context) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'checkin-context';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'observation-context';
      input.value = context.value;
      const text = document.createElement('span');
      text.textContent = context.label;
      wrapper.append(input, text);
      $('context-options').appendChild(wrapper);
    });

    Object.values(form).forEach((element) => {
      element.addEventListener('input', preview);
      element.addEventListener('change', preview);
    });
    document.querySelectorAll('input[name="checkin-type"]').forEach((input) => input.addEventListener('change', preview));
    $('context-options').addEventListener('change', preview);
    $('print-mode').addEventListener('change', preview);
    $('save-pdf').addEventListener('click', () => {
      const errors = validate();
      if (errors.length) {
        $('form-error').textContent = errors.join(' ');
        $('form-error').hidden = false;
        return;
      }
      const originalTitle = document.title;
      const safeName = form.student.value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'Student';
      document.title = `Sensei-Sandy_Check-In_${safeName}_${form.week.value}`;
      printInvoked = true;
      $('new-student').disabled = false;
      $('save-status').textContent = 'Choose your printer or save as PDF.';
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 1000);
    });
    $('new-student').addEventListener('click', () => {
      if (!printInvoked && (form.student.value.trim() || form.problem.value.trim() || form.observed.value.trim() || form.next.value.trim()) && !window.confirm('Start a new check-in? Your words will be cleared.')) return;
      reset();
    });
    preview();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
