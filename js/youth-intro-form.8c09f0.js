(function () {
  'use strict';
  const form = document.getElementById('youth-intro-form');
  if (!form) return;
  const requestKeyInput = document.createElement('input');
  requestKeyInput.type = 'hidden';
  requestKeyInput.name = 'idempotency_key';
  requestKeyInput.value = sessionStorage.getItem('youthIntroRequestKey') || crypto.randomUUID();
  sessionStorage.setItem('youthIntroRequestKey', requestKeyInput.value);
  form.appendChild(requestKeyInput);
  ['scheduledClassId', 'appointmentDateTime', 'arrivalDateTime'].forEach((name) => { const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.id = name; form.appendChild(input); });
  const steps = [...form.querySelectorAll('[data-step]')];
  const next = document.getElementById('yi-next');
  const back = document.getElementById('yi-back');
  const progress = document.getElementById('yi-progress');
  const label = document.getElementById('yi-step-label');
  const error = document.getElementById('yi-error');
  const routeBox = document.getElementById('yi-route');
  const success = document.getElementById('yi-success');
  const calendarLink = document.createElement('a');
  calendarLink.className = 'btn btn-outline-secondary ms-2';
  calendarLink.textContent = 'Add requested time to calendar';
  calendarLink.download = 'youth-intro-request.ics';
  calendarLink.hidden = true;
  success.querySelector('a')?.after(calendarLink);
  function prepareCalendar() {
    if (!form.appointmentDateTime.value) return;
    const start = new Date(form.appointmentDateTime.value);
    const end = new Date(start.getTime() + (45 * 60 * 1000));
    const stamp = (value) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const escapeIcs = (value) => value.replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sensei Sandy BJJ//Youth Intro//EN', 'BEGIN:VEVENT', `UID:${requestKeyInput.value}@senseisandy.com`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escapeIcs(`Youth intro request for ${form.studentName.value}`)}`, 'LOCATION:6045 Main Street\, 2nd Floor Studio\, Tannersville\, NY 12485', 'DESCRIPTION:Requested time pending Sandy confirmation. Arrive 20 minutes early. Parent or guardian remains on-site.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    calendarLink.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    calendarLink.hidden = false;
  }
  const successObserver = new MutationObserver(() => { if (!success.hidden) prepareCalendar(); });
  successObserver.observe(success, { attributes: true, attributeFilter: ['hidden'] });
  const availabilityBox = document.createElement('div');
  availabilityBox.className = 'alert alert-secondary mt-3 mb-0';
  availabilityBox.setAttribute('role', 'status');
  availabilityBox.hidden = true;
  form.ageLane.closest('.mb-3').appendChild(availabilityBox);
  const classChoiceWrap = document.createElement('div');
  classChoiceWrap.className = 'mb-3';
  classChoiceWrap.innerHTML = '<label for="classChoice">Available class</label><select class="form-select" id="classChoice" name="classChoice" required><option value="">Choose a date and age lane first</option></select><div class="yi-note">Only classes with an available intro seat and approved partner are selectable.</div>';
  form.ageLane.closest('.mb-3').after(classChoiceWrap);
  const classChoice = classChoiceWrap.querySelector('select');
  function setAppointment(slot) {
    if (!slot) {
      form.scheduledClassId.value = '';
      form.appointmentDateTime.value = '';
      form.arrivalDateTime.value = '';
      return;
    }
    form.scheduledClassId.value = slot.classId;
    form.appointmentDateTime.value = `${form.preferredDate.value}T${slot.startTime}:00-04:00`;
    const [hour, minute] = slot.startTime.split(':').map(Number);
    const arrivalMinutes = (hour * 60) + minute - 20;
    form.arrivalDateTime.value = `${form.preferredDate.value}T${String(Math.floor(arrivalMinutes / 60)).padStart(2, '0')}:${String(arrivalMinutes % 60).padStart(2, '0')}:00-04:00`;
  }
  classChoice.addEventListener('change', () => {
    const selected = classChoice._slots?.find((slot) => slot.classId === classChoice.value);
    setAppointment(selected || null);
  });
  async function refreshAvailability() {
    const previousClassId = classChoice.value || form.scheduledClassId.value;
    classChoice.replaceChildren(new Option('Choose an available class', ''));
    classChoice._slots = [];
    setAppointment(null);
    if (!form.preferredDate.value || !form.ageLane.value) return;
    availabilityBox.hidden = false;
    availabilityBox.textContent = 'Checking intro availability…';
    try {
      const response = await fetch(`/api/youth-intro/availability?date=${encodeURIComponent(form.preferredDate.value)}&lane=${encodeURIComponent(form.ageLane.value)}`, { headers: { Accept: 'application/json' } });
      const result = await response.json();
      const statuses = (result.availability || []).map((slot) => `${slot.day} ${slot.startTime}: ${slot.status}`).join(' · ');
      const selectable = (result.availability || []).filter((slot) => slot.status === 'Available');
      classChoice._slots = selectable;
      selectable.forEach((slot) => classChoice.add(new Option(`${slot.day} at ${slot.startTime}`, slot.classId)));
      const restored = selectable.find((slot) => slot.classId === previousClassId);
      if (restored || selectable.length === 1) { classChoice.value = (restored || selectable[0]).classId; setAppointment(restored || selectable[0]); }
      availabilityBox.textContent = statuses || 'No youth intro classes are available for that date and age lane.';
    } catch (_) {
      setAppointment(null);
      availabilityBox.textContent = 'Availability could not be checked. Sandy will review the request manually.';
    }
  }
  let current = Number(sessionStorage.getItem('youthIntroStep') || 1);
  const fields = () => [...steps[current - 1].querySelectorAll('input,select,textarea')];
  function valid() { const ok = fields().every((field) => field.checkValidity()); if (!ok) { form.reportValidity(); return false; } return true; }
  function show(step) { current = step; sessionStorage.setItem('youthIntroStep', String(step)); steps.forEach((node, i) => { node.hidden = i !== step - 1; }); progress.style.width = `${step * 20}%`; label.textContent = `Step ${step} of 5`; back.hidden = step === 1; next.hidden = step === 5; if (step === 4) { const age = Number(form.studentAge.value); form.ageLane.value = age <= 9 ? 'kids' : 'teens'; } }
  function track(name, extra) { const payload = { event: name, page_path: location.pathname, age_band: Number(form.studentAge.value) <= 9 ? '5–9' : '10–17', town: form.town.value, ...extra }; if (window.gtag) window.gtag('event', name, payload); else window.dataLayer?.push(payload); }
  function showAlternativeRoute() {
    const type = form.studentType.value;
    const age = Number(form.studentAge.value);
    if (type === 'returning') { routeBox.innerHTML = 'Returning students should use <a href="sms:+19177368649?body=Hi%20Sandy%2C%20I%27m%20a%20returning%20student%20looking%20to%20re-enter.">Text Sandy for a re-entry request</a>.'; routeBox.hidden = false; return true; }
    if (type === 'visitor') { routeBox.innerHTML = 'Catskills visitors should use the <a href="/catskills-home-base.html">visitor training options</a>.'; routeBox.hidden = false; return true; }
    if (Number.isFinite(age) && (age < 5 || age > 17)) { routeBox.innerHTML = 'This intro is for ages 5–17. Please use <a href="/options-pricing">the alternate options</a> or <a href="sms:+19177368649">text Sandy</a> for help.'; routeBox.hidden = false; return true; }
    routeBox.hidden = true;
    return false;
  }
  form.studentType.addEventListener('change', showAlternativeRoute);
  form.studentAge.addEventListener('input', showAlternativeRoute);
  next.addEventListener('click', () => { if (current === 1 && showAlternativeRoute()) { track('intro_form_error', { step: current, reason: 'alternate_route' }); return; } if (!valid()) { track('intro_form_error', { step: current }); return; } track('intro_form_step_complete', { step: current }); show(current + 1); });
  back.addEventListener('click', () => show(current - 1));
  form.addEventListener('input', () => { sessionStorage.setItem('youthIntroData', JSON.stringify(Object.fromEntries(new FormData(form)))); });
  form.preferredDate.addEventListener('change', refreshAvailability);
  form.ageLane.addEventListener('change', refreshAvailability);
  document.querySelectorAll('[data-cta="reserve-free-intro"]').forEach((link) => link.addEventListener('click', () => track('intro_cta_click', { cta_location: link.dataset.ctaLocation || 'unknown' })));
  form.addEventListener('submit', async (event) => { event.preventDefault(); if (!valid()) return; error.hidden = true; const data = Object.fromEntries(new FormData(form)); data.funnel = 'youth_intro'; data.name = data.guardianName; data.phone = data.mobile; data.contact_method = 'text'; data.interest_lane = 'youth_intro'; data.message = `Youth intro for ${data.studentName}, age ${data.studentAge}. Goal: ${data.mainGoal}. Participation notes: ${data.participationNotes}`; data.source_url = location.href; ['utm_source','utm_medium','utm_campaign'].forEach((key) => { data[key] = new URLSearchParams(location.search).get(key) || ''; }); track('intro_form_submit'); try { const response = await fetch(form.action, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify(data) }); if (!response.ok) throw new Error('Request failed'); document.getElementById('yi-success-name').textContent = data.studentName; form.hidden = true; document.querySelector('.yi-progress').hidden = true; document.getElementById('yi-step-label').hidden = true; document.getElementById('yi-success').hidden = false; sessionStorage.removeItem('youthIntroData'); sessionStorage.removeItem('youthIntroStep'); } catch (submitError) { error.textContent = 'We could not send this request. Please text Sandy at +1 (917) 736-8649.'; error.hidden = false; } });
  try { const saved = JSON.parse(sessionStorage.getItem('youthIntroData') || '{}'); Object.entries(saved).forEach(([key, value]) => { const field = form.elements[key]; if (field) field.value = value; }); } catch (_) {} show(Math.min(Math.max(current, 1), 5)); if (form.preferredDate.value && form.ageLane.value) refreshAvailability(); track('intro_page_view'); track('intro_form_start');
}());
