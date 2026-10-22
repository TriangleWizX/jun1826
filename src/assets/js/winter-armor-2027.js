(() => {
  const page = document.querySelector('.wa-page');
  if (!page) return;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type).value;
  const today = `${value('year')}-${value('month')}-${value('day')}`;
  const state = today < page.dataset.open ? 'before' : today < page.dataset.closed ? 'live' : 'after';
  for (const mode of ['before', 'live', 'after']) {
    page.querySelectorAll(`[data-${mode}]`).forEach((node) => { node.hidden = mode !== state; });
  }
  page.querySelectorAll('[data-order-link]').forEach((node) => { node.hidden = state !== 'live'; });
  page.querySelectorAll('[data-list-link]').forEach((node) => { node.hidden = state !== 'after'; });
  page.querySelector('#wa-order').hidden = state !== 'live';
  page.querySelector('#wa-list').hidden = state !== 'after';
})();
