(function glossarySystem() {
  const THEME_KEY = 'glossaryTheme';
  const STATE_KEY = 'glossaryLastState';
  const SCROLL_KEY = 'glossaryLastScrollY';
  const VIDEO_VOLUME_KEY = 'glossaryVideoVolume';
  const VIDEO_MUTE_KEY = 'glossaryMuteState';
  const VIDEO_CAPTIONS_KEY = 'glossaryCaptionState';

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
    return {
      t: normalizeSearchText(params.get('t') || ''),
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
    if (state.t) params.set('t', state.t);
    if (state.q) params.set('q', state.q);
    if (state.cat && state.cat !== 'all') params.set('cat', state.cat);
    if (state.level && state.level !== 'all') params.set('level', state.level);
    if (state.context && state.context !== 'all') params.set('context', state.context);
    if (state.common && state.common !== 'all') params.set('common', state.common);
    if (state.path && state.path !== 'all') params.set('path', state.path);
    if (state.l) params.set('l', state.l);
    if (state.rand) params.set('rand', '1');
    const qs = params.toString();
    return qs ? `/bjj-glossary/${slug}?${qs}` : `/bjj-glossary/${slug}`;
  }

  function applyTheme(theme) {
    const root = document.querySelector('[data-glossary-theme-root]') || document.body;
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'auto' ? (systemDark ? 'dark' : 'light') : theme;
    root.setAttribute('data-glossary-theme', resolved);
  }

  function initTheme() {
    const select = document.getElementById('glossary-theme');
    const stored = localStorage.getItem(THEME_KEY) || 'auto';
    applyTheme(stored);
    if (!select) return;
    select.value = ['auto', 'light', 'dark'].includes(stored) ? stored : 'auto';
    select.addEventListener('change', () => {
      const value = select.value || 'auto';
      localStorage.setItem(THEME_KEY, value);
      applyTheme(value);
    });
  }

  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function matchesState(item, state) {
    if (state.cat !== 'all' && item.category !== state.cat) return false;
    if (state.level !== 'all' && item.level !== state.level) return false;
    if (state.context !== 'all' && !(item.contexts || []).includes(state.context)) return false;
    if (state.common === 'common' && !item.common) return false;
    if (state.common === 'foundational' && !item.foundational) return false;
    if (state.path !== 'all' && !(item.paths || []).includes(state.path)) return false;
    if (state.l && item.letter !== state.l) return false;

    if (state.t) {
      const exactNeedle = normalizeSearchText(state.t);
      const exactPool = [item.slug, item.term, ...(item.aliases || []), ...(item.redirectFrom || [])].map(normalizeSearchText);
      return exactPool.includes(exactNeedle);
    }

    if (!state.q) return true;
    return String(item.searchText || '').includes(state.q);
  }

  function buildCardState(card) {
    const contexts = String(card.dataset.contexts || '').split(',').map((x) => x.trim()).filter(Boolean);
    const paths = String(card.dataset.paths || '').split(/\s+/).map((x) => x.trim()).filter(Boolean);
    return {
      slug: card.dataset.slug || '',
      category: card.dataset.category || '',
      level: card.dataset.level || '',
      letter: (card.dataset.letter || '').toUpperCase(),
      term: card.querySelector('h3 a')?.textContent || '',
      aliases: [],
      redirectFrom: [],
      contexts,
      paths,
      common: card.dataset.common === '1',
      foundational: card.dataset.foundational === '1',
      searchText: normalizeSearchText(card.dataset.search || '')
    };
  }

  function initIndexPage() {
    const root = document.getElementById('glossary-index');
    if (!root) return;

    const searchInput = root.querySelector('#glossary-q');
    const cards = Array.from(root.querySelectorAll('[data-glossary-card]'));
    const categoryButtons = Array.from(root.querySelectorAll('[data-filter-category]'));
    const levelButtons = Array.from(root.querySelectorAll('[data-filter-level]'));
    const contextButtons = Array.from(root.querySelectorAll('[data-filter-context]'));
    const categorySelect = root.querySelector('[data-filter-category-select]');
    const levelSelect = root.querySelector('[data-filter-level-select]');
    const contextSelect = root.querySelector('[data-filter-context-select]');
    const quickButtons = Array.from(root.querySelectorAll('[data-filter-common]'));
    const pathButtons = Array.from(root.querySelectorAll('[data-path]'));
    const letterLinks = Array.from(root.querySelectorAll('[data-letter-link]'));
    const rail = root.querySelector('#glossary-az-rail');
    const resultEl = root.querySelector('#result-count');
    const emptyEl = root.querySelector('#glossary-empty');
    const resetBtn = root.querySelector('#reset-filters');
    const mobileResetBtn = root.querySelector('#mobile-reset-filters');
    const copyStateBtn = root.querySelector('#copy-state-link');
    const randomInlineBtn = root.querySelector('#surprise-me-inline');
    const randomAzBtn = root.querySelector('#surprise-me-az');

    if (!searchInput || !cards.length) return;

    const state = getGlossaryState();
    let visibleCards = [];

    function syncControls() {
      searchInput.value = state.t || state.q || '';

      categoryButtons.forEach((button) => {
        const active = (button.dataset.filterCategory || 'all') === state.cat;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (categorySelect) categorySelect.value = state.cat || 'all';

      levelButtons.forEach((button) => {
        const active = (button.dataset.filterLevel || 'all') === state.level;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (levelSelect) levelSelect.value = state.level || 'all';

      contextButtons.forEach((button) => {
        const active = (button.dataset.filterContext || 'all') === state.context;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (contextSelect) contextSelect.value = state.context || 'all';

      quickButtons.forEach((button) => {
        const active = (button.dataset.filterCommon || 'all') === state.common;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      pathButtons.forEach((button) => {
        const active = (button.dataset.path || 'all') === state.path;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      letterLinks.forEach((link) => {
        const letter = (link.dataset.letterLink || '').toUpperCase();
        const active = Boolean(state.l) && state.l === letter;
        link.classList.toggle('is-active', active);
        link.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function resolveExactMatch(items, exactTerm) {
      if (!exactTerm) return null;
      const needle = normalizeSearchText(exactTerm);
      for (const item of items) {
        const exactPool = [item.slug, item.term, ...(item.aliases || []), ...(item.redirectFrom || [])].map(normalizeSearchText);
        if (exactPool.includes(needle)) return item;
      }
      return null;
    }

    function applyFilters() {
      let visibleCount = 0;
      const visibleLetters = new Set();
      const built = cards.map((card) => ({ card, item: buildCardState(card) }));

      visibleCards = [];
      built.forEach(({ card, item }) => {
        const visible = matchesState(item, state);
        card.hidden = !visible;
        if (visible) {
          visibleCards.push({ card, item });
          visibleCount += 1;
          visibleLetters.add(item.letter);
        }
      });

      const exactStateActive = Boolean(state.t) && !state.q;
      if (exactStateActive) {
        const exact = resolveExactMatch(visibleCards.map((x) => x.item), state.t);
        if (exact) {
          const targetUrl = buildTermUrl(exact.slug, state);
          if (`/bjj-glossary/${exact.slug}` !== window.location.pathname) {
            window.location.replace(targetUrl);
            return;
          }
        }
      }

      letterLinks.forEach((link) => {
        const letter = (link.dataset.letterLink || '').toUpperCase();
        const enabled = visibleLetters.has(letter) || state.l === letter;
        link.classList.toggle('is-disabled', !enabled);
        link.setAttribute('aria-disabled', enabled ? 'false' : 'true');
        link.tabIndex = enabled ? 0 : -1;
      });

      if (resultEl) resultEl.textContent = String(visibleCount);
      if (emptyEl) {
        emptyEl.hidden = visibleCount > 0;
        emptyEl.classList.toggle('hidden', visibleCount > 0);
      }

      cards.forEach((card) => {
        const slug = card.dataset.slug;
        if (!slug) return;
        const url = buildTermUrl(slug, state);
        card.querySelectorAll('[data-term-link]').forEach((link) => {
          link.setAttribute('href', url);
        });
      });

      if (state.rand && visibleCards.length) {
        const idx = Math.floor(Math.random() * visibleCards.length);
        const picked = visibleCards[idx];
        if (picked && picked.item && picked.item.slug) {
          const nextState = { ...state, rand: false };
          setGlossaryState(nextState);
          window.location.assign(buildTermUrl(picked.item.slug, nextState));
        }
      }
    }

    function commit(next) {
      Object.assign(state, next);
      setGlossaryState(state);
      syncControls();
      applyFilters();
    }

    function runRandom() {
      applyFilters();
      if (!visibleCards.length) return;
      const idx = Math.floor(Math.random() * visibleCards.length);
      const picked = visibleCards[idx];
      if (!picked || !picked.item || !picked.item.slug) return;
      window.location.assign(buildTermUrl(picked.item.slug, state));
    }

    categoryButtons.forEach((button) => {
      button.addEventListener('click', () => commit({ cat: button.dataset.filterCategory || 'all' }));
    });
    if (categorySelect) {
      categorySelect.addEventListener('change', () => commit({ cat: categorySelect.value || 'all' }));
    }

    levelButtons.forEach((button) => {
      button.addEventListener('click', () => commit({ level: button.dataset.filterLevel || 'all' }));
    });
    if (levelSelect) {
      levelSelect.addEventListener('change', () => commit({ level: levelSelect.value || 'all' }));
    }

    contextButtons.forEach((button) => {
      button.addEventListener('click', () => commit({ context: button.dataset.filterContext || 'all' }));
    });
    if (contextSelect) {
      contextSelect.addEventListener('change', () => commit({ context: contextSelect.value || 'all' }));
    }

    quickButtons.forEach((button) => {
      button.addEventListener('click', () => commit({ common: button.dataset.filterCommon || 'all' }));
    });
    pathButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextPath = button.dataset.path || 'all';
        commit({ path: state.path === nextPath ? 'all' : nextPath });
        const target = root.querySelector('#glossary-results') || root;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    letterLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const clicked = (link.dataset.letterLink || '').toUpperCase();
        commit({ l: state.l === clicked ? '' : clicked });
      });
    });

    searchInput.addEventListener('input', () => {
      const text = normalizeSearchText(searchInput.value || '');
      if (state.t) commit({ t: '', q: text });
      else commit({ q: text });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        commit({ t: '', q: '', cat: 'all', level: 'all', context: 'all', common: 'all', path: 'all', l: '', rand: false });
      });
    }

    if (mobileResetBtn) {
      mobileResetBtn.addEventListener('click', () => {
        commit({ t: '', q: '', cat: 'all', level: 'all', context: 'all', common: 'all', path: 'all', l: '', rand: false });
      });
    }

    if (copyStateBtn) {
      copyStateBtn.addEventListener('click', () => {
        copyText(window.location.href);
        copyStateBtn.textContent = 'Copied link';
        window.setTimeout(() => { copyStateBtn.textContent = 'Copy filtered link'; }, 1600);
      });
    }

    [randomInlineBtn, randomAzBtn].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('click', runRandom);
    });

    document.addEventListener('keydown', (event) => {
      const active = document.activeElement;
      const activeTag = active && active.tagName ? active.tagName.toLowerCase() : '';

      if (event.key === '/' && activeTag !== 'input' && activeTag !== 'textarea') {
        event.preventDefault();
        searchInput.focus();
      }

      if (event.key === 'Escape' && active === searchInput) {
        searchInput.value = '';
        commit({ q: '', t: '' });
      }
    });

    if (rail) {
      rail.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        const focusables = letterLinks.filter((el) => el.tabIndex !== -1);
        const index = focusables.indexOf(document.activeElement);
        if (index < 0) return;
        event.preventDefault();
        const next = event.key === 'ArrowRight'
          ? focusables[Math.min(index + 1, focusables.length - 1)]
          : focusables[Math.max(index - 1, 0)];
        if (next) next.focus();
      });
    }

    const searchParam = state.q || state.t;
    if (searchParam) searchInput.value = searchParam;
    else setTimeout(() => searchInput.focus(), 0);

    syncControls();
    applyFilters();

    root.querySelectorAll('[data-term-link]').forEach((link) => {
      link.addEventListener('click', () => {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
        } catch (error) {}
      });
    });

    try {
      const savedY = Number(sessionStorage.getItem(SCROLL_KEY));
      if (Number.isFinite(savedY) && savedY > 0) {
        window.setTimeout(() => window.scrollTo({ top: savedY, behavior: 'auto' }), 60);
      }
    } catch (error) {}
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
    const hasContext = Boolean(state.t || state.q || state.cat !== 'all' || state.level !== 'all' || state.context !== 'all' || state.common !== 'all' || state.path !== 'all' || state.l);

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
          redirectFrom: Array.isArray(item?.redirectFrom) ? item.redirectFrom : [],
          contexts: Array.isArray(item?.contexts) ? item.contexts : [],
          common: Boolean(item?.common ?? item?.isCommon),
          foundational: Boolean(item?.foundational ?? item?.isFoundational),
          searchText: normalizeSearchText(item?.searchText || '')
        })).filter((item) => item.slug);

        const filtered = hasContext ? terms.filter((item) => matchesState(item, state)) : terms;
        const index = filtered.findIndex((item) => item.slug === navData.currentSlug);
        const prev = index > 0 ? filtered[index - 1] : null;
        const next = index >= 0 && index < filtered.length - 1 ? filtered[index + 1] : null;

        if (prevEl) {
          if (prev) {
            prevEl.hidden = false;
            prevEl.setAttribute('href', buildTermUrl(prev.slug, state));
          } else prevEl.hidden = true;
        }
        if (nextEl) {
          if (next) {
            nextEl.hidden = false;
            nextEl.setAttribute('href', buildTermUrl(next.slug, state));
          } else nextEl.hidden = true;
        }
      })
      .catch(() => {
        if (prevEl) prevEl.hidden = true;
        if (nextEl) nextEl.hidden = true;
      });

    const copyTermButton = document.getElementById('copy-term-link');
    if (copyTermButton) {
      copyTermButton.addEventListener('click', () => {
        copyText(window.location.href);
        copyTermButton.textContent = 'Copied link';
        window.setTimeout(() => { copyTermButton.textContent = 'Copy term link'; }, 1600);
      });
    }
  }

  function initMediaPreferences() {
    const videos = Array.from(document.querySelectorAll('video[data-glossary-video], #glossary-term video'));
    if (!videos.length) return;

    const storedVol = Number(localStorage.getItem(VIDEO_VOLUME_KEY));
    const storedMute = localStorage.getItem(VIDEO_MUTE_KEY);
    const storedCaption = localStorage.getItem(VIDEO_CAPTIONS_KEY);

    videos.forEach((video) => {
      if (Number.isFinite(storedVol) && storedVol >= 0 && storedVol <= 1) video.volume = storedVol;
      if (storedMute === '1' || storedMute === '0') video.muted = storedMute === '1';
      video.autoplay = false;

      Array.from(video.textTracks || []).forEach((track) => {
        if (storedCaption === 'showing') track.mode = 'showing';
        else if (storedCaption === 'hidden') track.mode = 'hidden';
      });

      video.addEventListener('volumechange', () => {
        localStorage.setItem(VIDEO_VOLUME_KEY, String(video.volume));
        localStorage.setItem(VIDEO_MUTE_KEY, video.muted ? '1' : '0');
      });
    });

    document.addEventListener('keydown', (event) => {
      const active = document.activeElement;
      if (!(active instanceof HTMLVideoElement)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        active.currentTime = Math.max(0, active.currentTime - 5);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        active.currentTime = Math.min(active.duration || Number.MAX_SAFE_INTEGER, active.currentTime + 5);
      }
      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        active.muted = !active.muted;
        localStorage.setItem(VIDEO_MUTE_KEY, active.muted ? '1' : '0');
      }
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        const tracks = Array.from(active.textTracks || []);
        if (!tracks.length) return;
        const showing = tracks.some((t) => t.mode === 'showing');
        tracks.forEach((t) => { t.mode = showing ? 'hidden' : 'showing'; });
        localStorage.setItem(VIDEO_CAPTIONS_KEY, showing ? 'hidden' : 'showing');
      }
    });
  }

  initTheme();
  initIndexPage();
  initTermPage();
  initMediaPreferences();
})();
