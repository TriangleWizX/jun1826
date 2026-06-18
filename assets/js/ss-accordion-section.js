/* assets/js/ss-accordion-section.js */

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('[data-ss-accordion-section]');
  
  sections.forEach((section, sIdx) => {
    const filters = section.querySelectorAll('[data-ss-accordion-filter]');
    const items = section.querySelectorAll('[data-ss-accordion-category]');
    const reassuranceBox = section.querySelector('[data-ss-accordion-reassurance]');
    const reassuranceText = reassuranceBox ? reassuranceBox.querySelector('[data-ss-accordion-reassurance-text]') || reassuranceBox : null;
    const isSingle = section.hasAttribute('data-ss-accordion-single');

    // Load reassurance data if present
    let reassurances = {};
    const rawData = section.getAttribute('data-ss-accordion-reassurance-data');
    if (rawData) {
      try {
        reassurances = JSON.parse(rawData);
      } catch (e) {
        console.error('Failed to parse reassurance data JSON', e);
      }
    }

    let timeoutId = null;
    function transitionReassurance(text) {
      if (!reassuranceBox || !reassuranceText) return;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      reassuranceBox.style.opacity = '0';
      reassuranceBox.style.transform = 'translateY(4px)';

      timeoutId = setTimeout(() => {
        reassuranceText.textContent = text;
        reassuranceBox.style.opacity = '1';
        reassuranceBox.style.transform = 'translateY(0)';
        timeoutId = null;
      }, 150);
    }

    function filterCategory(category) {
      items.forEach(item => {
        const cats = (item.getAttribute('data-ss-accordion-category') || '').split(/\s+/);
        if (cats.includes(category)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      if (reassurances[category]) {
        transitionReassurance(reassurances[category]);
      }
    }

    // Filter event listeners
    filters.forEach(filterBtn => {
      filterBtn.addEventListener('click', () => {
        filters.forEach(f => {
          f.classList.remove('active');
          f.setAttribute('aria-selected', 'false');
        });
        filterBtn.classList.add('active');
        filterBtn.setAttribute('aria-selected', 'true');

        const category = filterBtn.getAttribute('data-ss-accordion-filter');
        filterCategory(category);
      });
    });

    // details/summary sync and single-open behavior
    const detailsElements = section.querySelectorAll('details');
    detailsElements.forEach((details, idx) => {
      const summary = details.querySelector('summary');
      if (!summary) return;

      // Ensure proper aria attributes
      let contentDiv = details.querySelector('.faq-answer-content') || details.querySelector('div');
      if (contentDiv) {
        if (!contentDiv.id) {
          contentDiv.id = `ss-accordion-content-${sIdx}-${idx}-${Math.random().toString(36).substring(2, 9)}`;
        }
        if (!summary.getAttribute('aria-controls')) {
          summary.setAttribute('aria-controls', contentDiv.id);
        }
      }

      // Initial aria state
      summary.setAttribute('aria-expanded', details.hasAttribute('open') ? 'true' : 'false');

      // Listen for toggle
      details.addEventListener('toggle', () => {
        const isOpen = details.hasAttribute('open');
        summary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (isOpen && isSingle) {
          // Close other details in the same section
          detailsElements.forEach(otherDetails => {
            if (otherDetails !== details && otherDetails.hasAttribute('open')) {
              otherDetails.removeAttribute('open');
            }
          });
        }
      });
    });

    // Initialize the default/active tab
    const activeFilter = section.querySelector('[data-ss-accordion-filter].active');
    if (activeFilter) {
      const category = activeFilter.getAttribute('data-ss-accordion-filter');
      filterCategory(category);
    } else if (filters.length > 0) {
      const category = filters[0].getAttribute('data-ss-accordion-filter');
      filterCategory(category);
    }
  });
});
