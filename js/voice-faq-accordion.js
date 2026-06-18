(function () {
  const groups = document.querySelectorAll('[data-voice-faq]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const items = Array.from(group.querySelectorAll('details'));
    items.forEach((item, index) => {
      const summary = item.querySelector('summary');
      const panel = item.querySelector('.ss-accordion__content, div, p');
      if (!summary) return;

      const panelId = item.id || `voice-faq-item-${Math.random().toString(36).slice(2, 10)}-${index}`;
      if (!item.id) item.id = panelId;
      const contentId = `${panelId}-content`;

      if (panel && !panel.id) panel.id = contentId;
      summary.setAttribute('role', 'button');
      summary.setAttribute('aria-controls', contentId);
      summary.setAttribute('aria-expanded', item.open ? 'true' : 'false');

      item.addEventListener('toggle', () => {
        summary.setAttribute('aria-expanded', item.open ? 'true' : 'false');
      });
    });
  });
})();
