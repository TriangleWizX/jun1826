(function glossarySystem() {
  const THEME_KEY = 'glossaryTheme';
  const STATE_KEY = 'glossaryLastState';
  const SCROLL_KEY = 'glossaryLastScrollY';

  function normalizeSearchText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\bno\s+gi\b/g, 'nogi')
      .replace(/\bno-gi\b/g, 'nogi')
      .replace(/\br\.n\.c\b/g, 'rnc')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getGlossaryState() {
    const params = new URLSearchParams(window.location.search);
    const letter = (params.get('l') || params.get('letter') || '').trim().toUpperCase();
    let termSlug = (params.get('t') || '').trim();
    if (!termSlug && window.location.hash) {
      termSlug = window.location.hash.replace(/^#/, '').trim();
    }
    return {
      t: normalizeSearchText(termSlug),
      q: normalizeSearchText(params.get('q') || ''),
      cat: (params.get('cat') || 'all').trim(),
      level: (params.get('level') || 'all').trim(),
      context: (params.get('context') || 'all').trim(),
      common: (params.get('common') || 'all').trim(),
      path: (params.get('path') || 'all').trim(),
      l: letter,
      rand: params.get('rand') === '1'
    };
  }

  function setGlossaryState(next) {
    const params = new URLSearchParams();
    if (next.t) params.set('t', next.t);
    if (next.q) params.set('q', next.q);
    if (next.cat && next.cat !== 'all') params.set('cat', next.cat);
    if (next.level && next.level !== 'all') params.set('level', next.level);
    if (next.context && next.context !== 'all') params.set('context', next.context);
    if (next.common && next.common !== 'all') params.set('common', next.common);
    if (next.path && next.path !== 'all') params.set('path', next.path);
    if (next.l) params.set('l', String(next.l).toUpperCase());
    if (next.rand) params.set('rand', '1');
    const qs = params.toString();
    history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(next));
    } catch (error) {}
  }

  function buildBackToResultsUrl() {
    const state = getGlossaryState();
    const params = new URLSearchParams();
    if (state.t) params.set('t', state.t);
    if (state.q) params.set('q', state.q);
    if (state.cat !== 'all') params.set('cat', state.cat);
    if (state.level !== 'all') params.set('level', state.level);
    if (state.context !== 'all') params.set('context', state.context);
    if (state.common !== 'all') params.set('common', state.common);
    if (state.path !== 'all') params.set('path', state.path);
    if (state.l) params.set('l', state.l);
    if (state.rand) params.set('rand', '1');
    const qs = params.toString();
    return qs ? `/bjj-glossary?${qs}` : '/bjj-glossary';
  }

  function buildTermUrl(slug, state) {
    const params = new URLSearchParams();
    if (slug) params.set('t', slug);
    if (state && state.q) params.set('q', state.q);
    if (state && state.cat && state.cat !== 'all') params.set('cat', state.cat);
    if (state && state.level && state.level !== 'all') params.set('level', state.level);
    if (state && state.context && state.context !== 'all') params.set('context', state.context);
    if (state && state.common && state.common !== 'all') params.set('common', state.common);
    if (state && state.l) params.set('l', state.l);
    const qs = params.toString();
    return qs ? `/bjj-glossary?${qs}` : `/bjj-glossary?t=${slug}`;
  }

  function applyTheme(theme) {
    const root = document.querySelector('[data-glossary-theme-root]') || document.body;
    root.setAttribute('data-glossary-theme', 'light');
  }

  function initTheme() {
    applyTheme('light');
    const select = document.getElementById('glossary-theme');
    if (!select) return;
    select.value = 'light';
    select.addEventListener('change', () => {
      applyTheme('light');
    });
  }

  function showToast(message) {
    let toast = document.getElementById('glossary-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'glossary-toast';
      toast.className = 'glossary-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message || 'Link copied to clipboard!';
    toast.classList.add('is-visible');
    window.clearTimeout(toast._timeout);
    toast._timeout = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  function copyText(text, successMessage) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage || 'Link copied to clipboard!');
      }).catch(() => {});
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToast(successMessage || 'Link copied to clipboard!');
      } catch (err) {}
      document.body.removeChild(textarea);
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initIndexPage() {
    const root = document.getElementById('glossary-index');
    if (!root) return;

    // Load data from embedded script
    let terms = [];
    const dataEl = document.getElementById('glossary-data');
    if (dataEl) {
      try {
        terms = JSON.parse(dataEl.textContent || '[]');
      } catch (e) {
        terms = [];
      }
    }

    if (!terms.length) return;

    const termMap = new Map();
    terms.forEach((t) => termMap.set(t.slug, t));

    // Build Autolink dictionary for cross-linking
    const autolinkPairs = [];
    terms.forEach((t) => {
      if (t.rawTerm && t.rawTerm.length >= 3) autolinkPairs.push({ text: t.rawTerm, slug: t.slug });
      if (t.term && t.term !== t.rawTerm && t.term.length >= 3) autolinkPairs.push({ text: t.term, slug: t.slug });
      (t.aliases || []).forEach((a) => {
        if (a && a.length >= 3) autolinkPairs.push({ text: a, slug: t.slug });
      });
    });
    autolinkPairs.sort((a, b) => b.text.length - a.text.length);

    function autolinkText(text, currentSlug) {
      if (!text) return '';
      let safe = escapeHtml(text);
      const filtered = autolinkPairs.filter((p) => p.slug !== currentSlug && p.text.length >= 4);
      if (!filtered.length) return safe;

      // Extract unique patterns up to 60 prominent terms
      const seen = new Set();
      const unique = [];
      for (const item of filtered) {
        const lower = item.text.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          unique.push(item);
          if (unique.length >= 60) break;
        }
      }

      const escapedPatterns = unique.map((u) => u.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const re = new RegExp(`\\b(${escapedPatterns.join('|')})\\b`, 'gi');
      return safe.replace(re, (match) => {
        const found = unique.find((u) => u.text.toLowerCase() === match.toLowerCase());
        if (!found) return match;
        return `<button type="button" class="glossary-inline-chip" data-slug="${found.slug}">${match}</button>`;
      });
    }

    // DOM Elements
    const searchInput = root.querySelector('#glossary-q');
    const clearBtn = root.querySelector('#glossary-search-clear');
    const surpriseButtons = Array.from(root.querySelectorAll('#surprise-me-inline, #surprise-me-az'));
    const copyLinkBtn = root.querySelector('#copy-state-link');
    const filterForm = root.querySelector('#glossary-filter-form');
    const resetBtn = root.querySelector('#reset-filters');
    const emptyResetBtn = root.querySelector('#empty-reset-btn');
    const categoryButtons = Array.from(root.querySelectorAll('[data-filter-category]'));
    const levelButtons = Array.from(root.querySelectorAll('[data-filter-level]'));
    const commonButtons = Array.from(root.querySelectorAll('[data-filter-common]'));
    const contextButtons = Array.from(root.querySelectorAll('[data-filter-context]'));
    const letterLinks = Array.from(root.querySelectorAll('[data-letter-link]'));
    const directoryList = root.querySelector('#glossary-directory');
    let directoryItems = Array.from(root.querySelectorAll('.glossary-directory-item'));
    const resultCountEl = root.querySelector('#result-count');
    const directoryCountEl = root.querySelector('#directory-count');
    const emptyEl = root.querySelector('#glossary-empty');
    const readerCard = root.querySelector('#glossary-active-card');
    const quickTermChips = Array.from(root.querySelectorAll('[data-quick-term]'));

    const state = getGlossaryState();
    let visibleTerms = [];
    let currentSelectedSlug = state.t || 'tap';

    if (!termMap.has(currentSelectedSlug)) {
      currentSelectedSlug = 'tap';
    }

    function renderActiveReader(slug, shouldScrollMobile) {
      const term = termMap.get(slug);
      if (!term || !readerCard) return;

      currentSelectedSlug = slug;
      state.t = slug;
      setGlossaryState(state);
      directoryItems.forEach((item) => {
        const active = item.dataset.slug === slug;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      const index = visibleTerms.findIndex((item) => item.slug === slug);
      const previous = index > 0 ? visibleTerms[index - 1] : null;
      const next = index >= 0 && index < visibleTerms.length - 1 ? visibleTerms[index + 1] : null;
      const related = (term.related || []).slice(0, 3).map((key) => termMap.get(key)).filter(Boolean);

      readerCard.innerHTML = `
        <div class="reader-card-inner">
          <div class="reader-header"><p class="reader-pill reader-pill-cat">${escapeHtml(term.categoryLabel || term.category)}</p><h2 class="reader-title" id="reader-title">${escapeHtml(term.displayTerm || term.term)}</h2></div>
          <div class="reader-body">
            <p class="reader-text reader-text-lead" id="reader-summary">${escapeHtml(term.summary)}</p>
            ${term.beginnerTranslation ? `<p class="callout-text" id="reader-translation">${escapeHtml(term.beginnerTranslation)}</p>` : ''}
            ${term.safetyNote ? `<p class="safety-text" id="reader-safety">${escapeHtml(term.safetyNote)}</p>` : ''}
            ${related.length ? `<h3>More terms</h3><ul id="reader-related-chips">${related.map((item) => `<li><button type="button" data-slug="${escapeHtml(item.slug)}">${escapeHtml(item.displayTerm || item.term)}</button></li>`).join('')}</ul>` : ''}
            <div class="reader-nav-actions">
              ${previous ? `<button type="button" id="reader-prev-btn" data-slug="${escapeHtml(previous.slug)}">Prev</button>` : ''}
              ${next ? `<button type="button" id="reader-next-btn" data-slug="${escapeHtml(next.slug)}">Next</button>` : ''}
              <button type="button" id="reader-copy-btn">Copy link</button>
              <a id="reader-standalone-link" href="/bjj-glossary/${escapeHtml(term.slug)}">Read this term</a>
            </div>
            <div class="reader-cta-actions"><a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Free Intro</a><a class="glossary-btn glossary-btn-secondary" href="/schedule">See times</a></div>
          </div>
        </div>`;

      if (shouldScrollMobile && window.innerWidth < 992) {
        root.querySelector('#glossary-reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function matchesFilters(term) {
      if (state.cat !== 'all' && term.category !== state.cat) return false;
      if (state.level !== 'all' && term.level !== state.level) return false;
      if (state.context !== 'all' && !(term.contexts || []).includes(state.context)) return false;
      if (state.common === 'common' && !term.common) return false;
      if (state.common === 'foundational' && !term.foundational) return false;
      if (state.l && term.letter !== state.l) return false;

      if (!state.q) return true;
      const needle = state.q;
      if (term.slug.includes(needle)) return true;
      if (term.term && term.term.toLowerCase().includes(needle)) return true;
      if (term.searchText && term.searchText.includes(needle)) return true;
      return false;
    }

    function renderDirectoryItem(term) {
      return `<button type="button" class="glossary-directory-item" role="option" data-slug="${escapeHtml(term.slug)}" data-category="${escapeHtml(term.category)}" data-level="${escapeHtml(term.level)}" data-letter="${escapeHtml(term.letter)}" data-common="${term.common ? '1' : '0'}" data-foundational="${term.foundational ? '1' : '0'}" data-contexts="${escapeHtml((term.contexts || []).join(','))}" aria-selected="${term.slug === currentSelectedSlug ? 'true' : 'false'}"><span class="dir-item-top"><span class="dir-item-title">${escapeHtml(term.term)}.</span><span class="dir-item-badge">${escapeHtml(term.categoryLabel)}.</span></span></button>`;
    }

    function syncControls() {
      if (searchInput) {
        searchInput.value = state.q || '';
        if (clearBtn) clearBtn.hidden = !state.q;
      }

      levelButtons.forEach((btn) => {
        const level = btn.dataset.filterLevel || 'all';
        const active = level === state.level;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      categoryButtons.forEach((btn) => {
        const cat = btn.dataset.filterCategory || 'all';
        const isActive = cat === state.cat;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      commonButtons.forEach((btn) => {
        const commonVal = btn.dataset.filterCommon || 'all';
        const isActive = commonVal === state.common;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      contextButtons.forEach((btn) => {
        const ctx = btn.dataset.filterContext || 'all';
        const isActive = ctx === state.context;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      const hasActiveFilters = Boolean(state.q || state.cat !== 'all' || state.level !== 'all' || state.common !== 'all' || state.context !== 'all' || state.l);
      if (resetBtn) resetBtn.hidden = !hasActiveFilters;
    }

    function applyFilters() {
      visibleTerms = [];
      const visibleLetters = new Set();

      terms.forEach((t) => {
        if (matchesFilters(t)) {
          visibleTerms.push(t);
          if (t.letter) visibleLetters.add(t.letter.toUpperCase());
        }
      });

      // Show a short starter list by default. Search and filters reveal matches.
      const isDefaultView = !state.q && state.cat === 'all' && state.level === 'all'
        && state.context === 'all' && state.common === 'all' && !state.l;
      const starterTerms = terms.filter((term) => term.foundational);
      const listedTerms = (isDefaultView && starterTerms.length ? starterTerms : visibleTerms).slice(0, 8);
      if (directoryList) directoryList.innerHTML = listedTerms.map(renderDirectoryItem).join('');
      directoryItems = Array.from(root.querySelectorAll('.glossary-directory-item'));
      const visibleSlugSet = new Set(visibleTerms.map((t) => t.slug));

      // Update counts
      const count = visibleTerms.length;
      if (resultCountEl) resultCountEl.textContent = String(count);
      if (directoryCountEl) directoryCountEl.textContent = `${count} term${count === 1 ? '' : 's'}`;
      if (emptyEl) emptyEl.hidden = count > 0;

      // Update A-Z letters
      letterLinks.forEach((link) => {
        const l = (link.dataset.letterLink || '').toUpperCase();
        const enabled = visibleLetters.has(l) || state.l === l;
        link.classList.toggle('is-disabled', !enabled);
        link.classList.toggle('is-active', state.l === l);
        link.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      });

      // If currently selected term is not visible, select the first visible term
      if (!visibleSlugSet.has(currentSelectedSlug) && visibleTerms.length > 0) {
        renderActiveReader(visibleTerms[0].slug, false);
      } else if (visibleSlugSet.has(currentSelectedSlug)) {
        renderActiveReader(currentSelectedSlug, false);
      }
    }

    function commit(next) {
      Object.assign(state, next);
      setGlossaryState(state);
      syncControls();
      applyFilters();
    }

    function selectTerm(slug, shouldScrollMobile) {
      if (!slug || !termMap.has(slug)) return;
      currentSelectedSlug = slug;
      state.t = slug;
      setGlossaryState(state);
      renderActiveReader(slug, shouldScrollMobile !== false);
    }

    // Keep live search on this page instead of submitting the form.
    if (filterForm) filterForm.addEventListener('submit', (event) => event.preventDefault());

    // Event Listeners: Search
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const text = normalizeSearchText(searchInput.value || '');
        commit({ q: text });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        commit({ q: '' });
      });
    }

    // Event Listeners: Filters
    levelButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const level = btn.dataset.filterLevel || 'all';
        commit({ level });
      });
    });

    categoryButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filterCategory || 'all';
        commit({ cat: state.cat === cat ? 'all' : cat });
      });
    });

    commonButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.filterCommon || 'all';
        commit({ common: state.common === val ? 'all' : val });
      });
    });

    contextButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const ctx = btn.dataset.filterContext || 'all';
        commit({ context: state.context === ctx ? 'all' : ctx });
      });
    });

    letterLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const l = (link.dataset.letterLink || '').toUpperCase();
        commit({ l: state.l === l ? '' : l });
      });
    });

    [resetBtn, emptyResetBtn].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        commit({ q: '', cat: 'all', level: 'all', context: 'all', common: 'all', l: '', rand: false });
      });
    });

    // Event delegation keeps the short result list interactive after search.
    if (directoryList) {
      directoryList.addEventListener('click', (event) => {
        const button = event.target.closest('.glossary-directory-item');
        if (button && directoryList.contains(button)) selectTerm(button.dataset.slug, true);
      });
    }

    // Event Listeners: Day 1 Hero Chips
    quickTermChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const termSlug = chip.dataset.quickTerm;
        selectTerm(termSlug, true);
        const appSection = root.querySelector('#glossary-app');
        if (appSection) {
          appSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Event Delegation: Reader clicks (prev, next, copy, related chips, inline chips)
    if (readerCard) {
      readerCard.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.id === 'reader-copy-btn') {
          const shareUrl = `${window.location.origin}/bjj-glossary?t=${currentSelectedSlug}`;
          copyText(shareUrl, 'Term link copied to clipboard!');
          return;
        }

        const slug = target.dataset.slug;
        if (slug) {
          e.preventDefault();
          selectTerm(slug, true);
        }
      });
    }

    // Top action buttons: Surprise Me & Copy Link
    surpriseButtons.forEach((surpriseBtn) => {
      surpriseBtn.addEventListener('click', () => {
        const pool = visibleTerms.length ? visibleTerms : terms;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        if (picked) {
          selectTerm(picked.slug, true);
          showToast(`Surprise: ${picked.term}!`);
        }
      });
    });

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const shareUrl = `${window.location.origin}/bjj-glossary?t=${currentSelectedSlug}`;
        copyText(shareUrl, 'Term link copied to clipboard!');
      });
    }

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (event) => {
      const active = document.activeElement;
      const activeTag = active && active.tagName ? active.tagName.toLowerCase() : '';

      // '/' to focus search
      if (event.key === '/' && activeTag !== 'input' && activeTag !== 'textarea') {
        event.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Escape to clear search
      if (event.key === 'Escape' && active === searchInput) {
        searchInput.value = '';
        commit({ q: '' });
        searchInput.blur();
        return;
      }

      // Arrow navigation when focused on directory or reader
      if (['ArrowDown', 'ArrowUp'].includes(event.key) && (activeTag !== 'input' && activeTag !== 'textarea')) {
        const currentIndex = visibleTerms.findIndex((t) => t.slug === currentSelectedSlug);
        if (currentIndex < 0) return;
        event.preventDefault();
        const nextIndex = event.key === 'ArrowDown'
          ? Math.min(currentIndex + 1, visibleTerms.length - 1)
          : Math.max(currentIndex - 1, 0);
        if (nextIndex !== currentIndex && visibleTerms[nextIndex]) {
          selectTerm(visibleTerms[nextIndex].slug, false);
        }
      }
    });

    // Hash change listener (browser back / forward)
    window.addEventListener('popstate', () => {
      const freshState = getGlossaryState();
      Object.assign(state, freshState);
      syncControls();
      applyFilters();
      if (freshState.t && termMap.has(freshState.t)) {
        renderActiveReader(freshState.t, false);
      }
    });

    // Initial Hydration
    syncControls();
    applyFilters();
    renderActiveReader(currentSelectedSlug, false);
  }

  function initTermPage() {
    const root = document.getElementById('glossary-term');
    if (!root) return;

    const navDataEl = document.getElementById('glossary-term-nav-data');
    if (!navDataEl) return;

    const state = getGlossaryState();
    const backHref = buildBackToResultsUrl();
    ['back-to-results', 'back-term-results'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('href', backHref);
    });

    const copyBtn = document.getElementById('copy-term-link');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyText(window.location.href, 'Term link copied to clipboard!');
      });
    }

    let navData = null;
    try {
      navData = JSON.parse(navDataEl.textContent || '{}');
    } catch (_error) {
      navData = null;
    }

    if (!navData || !navData.currentSlug) return;

    const prevEl = document.getElementById('prev-term');
    const nextEl = document.getElementById('next-term');

    if (prevEl) prevEl.hidden = true;
    if (nextEl) nextEl.hidden = true;

    const indexSrc = String(navData.indexSrc || '/assets/data/glossary-search.json').trim();
    fetch(indexSrc, { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!Array.isArray(json)) return;
        const terms = json.map((item) => ({
          slug: String(item?.slug || '').trim(),
          term: String(item?.term || '').trim(),
          category: String(item?.category || '').trim(),
          level: String(item?.level || '').trim(),
          letter: String(item?.letter || '').trim().toUpperCase(),
          aliases: Array.isArray(item?.aliases) ? item.aliases : [],
          searchText: normalizeSearchText(item?.searchText || '')
        })).filter((item) => item.slug);

        const index = terms.findIndex((item) => item.slug === navData.currentSlug);
        const prev = index > 0 ? terms[index - 1] : null;
        const next = index >= 0 && index < terms.length - 1 ? terms[index + 1] : null;

        if (prevEl && prev) {
          prevEl.hidden = false;
          prevEl.setAttribute('href', buildTermUrl(prev.slug, state));
          prevEl.textContent = `← ${prev.term}`;
        }
        if (nextEl && next) {
          nextEl.hidden = false;
          nextEl.setAttribute('href', buildTermUrl(next.slug, state));
          nextEl.textContent = `${next.term} →`;
        }
      })
      .catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initIndexPage();
    initTermPage();
  });
})();
