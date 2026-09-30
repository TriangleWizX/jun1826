(function () {
  'use strict';

  const SKILLS = [
    ['feet_to_floor', 'Standing and falling safely'],
    ['pin_escapes', 'Getting out from the bottom'],
    ['guard', 'Using the legs from the bottom'],
    ['guard_retention', 'Keeping the legs in front'],
    ['submission_escapes', 'Getting safe from a hold'],
    ['pinning', 'Staying on top'],
    ['base_retention', 'Keeping balance on top'],
    ['guard_passing', 'Getting past the legs'],
    ['submissions', 'Finishing a hold safely']
  ];
  const CONTEXTS = ['Game', 'Position', 'Live', 'Drill', 'Other'];
  const $ = (id) => document.getElementById(id);
  const form = {
    student: $('student'), week: $('week-of'), skill: $('main-skill'),
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
    return document.querySelector('input[name="observation-context"]:checked')?.value || '';
  }

  function checkinType() {
    return document.querySelector('input[name="checkin-type"]:checked')?.value || 'adult';
  }

  function checkinTypeLabel() {
    return checkinType() === 'youth' ? 'Youth check-in' : 'Adult check-in';
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

    setPreview('preview-student', name, 'Name');
    setPreview('preview-week', weekLong ? `Week of ${weekLong}` : '', 'Week of …');
    setPreview('preview-skill', skill, 'Pick a skill');
    setPreview('preview-problem', form.problem.value.trim(), 'Coach: What did I see?');
    setPreview('preview-observed', form.observed.value.trim(), 'Student: What did you say?');
    setPreview('preview-next', form.next.value.trim(), 'Coach: What will I help you try next?');
    $('preview-context').textContent = context ? `Where: ${context}` : '';
    $('preview-easier').textContent = form.easier.value.trim();
    $('preview-easier-block').hidden = !form.easier.value.trim();

    $('receipt-type').textContent = checkinTypeLabel();
    $('receipt-blank-type').textContent = `${checkinTypeLabel()} · Name: __________________ · Week of: __________________`;
    $('receipt-student').textContent = name ? `Name: ${name}` : 'Name: __________________';
    $('receipt-week').textContent = weekShort ? `Week of: ${weekShort}` : 'Week of: ______________';
    $('receipt-skill').textContent = skill || '________________';
    $('receipt-problem').textContent = form.problem.value.trim();
    $('receipt-observed').textContent = form.observed.value.trim();
    $('receipt-context').textContent = context ? `☒ ${context}` : '☐ Game　☐ Position　☐ Live　☐ Drill　☐ Other';
    $('receipt-next').textContent = form.next.value.trim();
    $('receipt-easier').textContent = form.easier.value.trim();
    $('receipt-easier-block').hidden = !form.easier.value.trim();
    document.body.dataset.printMode = $('print-mode').value;
    document.querySelector('.checkin-preview').dataset.previewMode = $('print-mode').value;
  }

  function validate() {
    const errors = [];
    if (!form.student.value.trim()) errors.push('Add a name.');
    if (!form.week.value) errors.push('Pick a week.');
    if (!form.skill.value) errors.push('Pick a skill.');
    if (!form.problem.value.trim()) errors.push('Write what you saw.');
    if (!form.observed.value.trim()) errors.push('Write what the student said.');
    if (!form.next.value.trim()) errors.push('Write what you will help the student try next.');
    return errors;
  }

  function reset() {
    form.student.value = '';
    form.skill.value = '';
    form.problem.value = '';
    form.observed.value = '';
    form.next.value = '';
    form.easier.value = '';
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
    CONTEXTS.forEach((label) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'checkin-context';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'observation-context';
      input.value = label;
      const text = document.createElement('span');
      text.textContent = label;
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
      $('save-status').textContent = 'Print dialog opened. Choose 2.2 inch paper or save as PDF.';
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 1000);
    });
    $('new-student').addEventListener('click', () => {
      if (!printInvoked && (form.student.value.trim() || form.problem.value.trim() || form.observed.value.trim() || form.next.value.trim()) && !window.confirm('Start a new check-in and clear this one?')) return;
      reset();
    });
    preview();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
