document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-class-focus-section]");
  if (!section) return;

  const weeks = (window.SENSEI_SANDY_CLASS_FOCUS_WEEKS || [])
    .filter((week) => week.status === "published")
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  if (!weeks.length) return;

  const tabs = section.querySelector("[data-week-tabs]");
  const panel = section.querySelector("[data-week-panel]");
  const summary = section.querySelector("[data-week-summary]");

  function getLocalDateOnly(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function findDefaultWeek() {
    const today = getLocalDateOnly();

    const activeWeek = weeks.find((week) => {
      return week.startDate <= today && week.endDate >= today;
    });

    if (activeWeek) return activeWeek;

    const mostRecentPastWeek = weeks.find((week) => week.startDate <= today);
    if (mostRecentPastWeek) return mostRecentPastWeek;

    return weeks[weeks.length - 1];
  }

  function getRequestedWeek() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("week");

    if (!requestedId) return null;

    return weeks.find((week) => week.id === requestedId) || null;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getYouTubeId(url) {
    const source = String(url || "");

    const shortsMatch = source.match(/shorts\/([^/?#]+)/);
    if (shortsMatch) return shortsMatch[1];

    const embedMatch = source.match(/embed\/([^/?#]+)/);
    if (embedMatch) return embedMatch[1];

    const vMatch = source.match(/[?&]v=([^&#]+)/);
    return vMatch ? vMatch[1] : null;
  }

  function renderVideos(videos) {
    if (!videos || !videos.length) return "";

    return `
      <div class="focus-video-group">
        ${videos
          .map((video) => {
            const videoId = getYouTubeId(video.href);
            const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";

            return `
              <a
                class="focus-video-card"
                href="${escapeHtml(video.href)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch ${escapeHtml(video.label)} example on YouTube">
                <span class="focus-video-thumb" aria-hidden="true">
                  ${
                    thumbUrl
                      ? `<img src="${thumbUrl}" alt="" loading="lazy" decoding="async">`
                      : ""
                  }
                  <span class="focus-video-play">▶</span>
                </span>
                <span class="focus-video-copy">
                  <span class="focus-video-type">Video example</span>
                  <strong>${escapeHtml(video.label)}</strong>
                  <span class="focus-video-description">${escapeHtml(video.description)}</span>
                </span>
              </a>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderFocusItem(item) {
    return `
      <div class="focus-item">
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
        <p>${escapeHtml(item.description)}</p>
      </div>
    `;
  }

  function renderGlossary(glossary) {
    if (!glossary) return "";

    const youthTerms = glossary.youth || [];
    const adultTerms = glossary.adult || [];

    return `
      <div class="focus-glossary">
        <h3>This Week’s Glossary Terms</h3>

        <div class="focus-glossary-grid">
          <div>
            <h4>Youth Terms</h4>
            <ul>
              ${youthTerms.map((term) => `<li>${escapeHtml(term)}</li>`).join("")}
            </ul>
          </div>

          <div>
            <h4>Adult Terms</h4>
            <ul>
              ${adultTerms.map((term) => `<li>${escapeHtml(term)}</li>`).join("")}
            </ul>
          </div>
        </div>

        <a class="focus-glossary-link" href="/bjj-glossary">
          Open Full BJJ Glossary
        </a>
      </div>
    `;
  }

  function renderWeek(week) {
    if (summary) {
      summary.textContent = `${week.label}. ${week.summary}`;
    }

    panel.innerHTML = `
      <div class="week-panel-header">
        <p class="week-label">${escapeHtml(week.label)}</p>
        <h3>${escapeHtml(week.summary)}</h3>
      </div>

      <div class="focus-grid">
        <div class="focus-card">
          <p class="focus-time">Youth Class ${escapeHtml(week.youth.time)}</p>
          <h3>${escapeHtml(week.youth.title)}</h3>

          ${renderFocusItem(week.youth.word)}
          ${renderFocusItem(week.youth.movement)}
          ${renderFocusItem(week.youth.games)}

          ${renderVideos(week.youth.videos)}

          <p class="focus-cue">
            <strong>Parent cue:</strong> ${escapeHtml(week.youth.parentCue)}
          </p>
        </div>

        <div class="focus-card">
          <p class="focus-time">Adult Class ${escapeHtml(week.adult.time)}</p>
          <h3>${escapeHtml(week.adult.title)}</h3>

          ${renderFocusItem(week.adult.warmup)}
          ${week.adult.movements.map(renderFocusItem).join("")}

          ${renderVideos(week.adult.videos)}

          <p class="focus-cue">
            <strong>Training cue:</strong> ${escapeHtml(week.adult.trainingCue)}
          </p>
        </div>
      </div>

      ${renderGlossary(week.glossary)}
    `;
  }

  function updateTabs(selectedWeekId) {
    const today = getLocalDateOnly();

    tabs.innerHTML = weeks
      .map((week) => {
        const isSelected = week.id === selectedWeekId;
        const isCurrent = week.startDate <= today && week.endDate >= today;
        const isFuture = week.startDate > today;
        const badge = isCurrent ? "This Week" : isFuture ? "Upcoming" : "Archive";

        return `
          <button
            class="week-tab ${isSelected ? "is-active" : ""}"
            type="button"
            role="tab"
            aria-selected="${isSelected ? "true" : "false"}"
            aria-controls="class-focus-panel"
            tabindex="${isSelected ? "0" : "-1"}"
            data-week-id="${escapeHtml(week.id)}"
          >
            <span>${escapeHtml(badge)}</span>
            ${escapeHtml(week.label.replace(", 2026", ""))}
          </button>
        `;
      })
      .join("");
  }

  function selectWeek(weekId, options = {}) {
    const week = weeks.find((item) => item.id === weekId) || findDefaultWeek();

    updateTabs(week.id);
    renderWeek(week);

    if (options.updateUrl) {
      const params = new URLSearchParams(window.location.search);
      params.set("week", week.id);

      const nextUrl = `${window.location.pathname}?${params.toString()}#class-focus`;
      window.history.replaceState(null, "", nextUrl);
      alignClassFocusHash();
    }
  }

  function getStickyOffset() {
    const stickyNav = document.querySelector(".hub-nav.sticky-top, .sticky-top");
    const navHeight = stickyNav ? stickyNav.getBoundingClientRect().height : 0;

    return Math.ceil(navHeight + 24);
  }

  function alignClassFocusHash() {
    if (window.location.hash !== "#class-focus") return;

    window.requestAnimationFrame(() => {
      const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, sectionTop - getStickyOffset()),
        behavior: "auto"
      });
    });
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-week-id]");
    if (!button) return;

    selectWeek(button.dataset.weekId, { updateUrl: true });
  });

  tabs.addEventListener("keydown", (event) => {
    const buttons = Array.from(tabs.querySelectorAll("[data-week-id]"));
    const currentIndex = buttons.indexOf(document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % buttons.length;
    }

    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = buttons.length - 1;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      buttons[nextIndex].focus();
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectWeek(document.activeElement.dataset.weekId, { updateUrl: true });
    }
  });

  const requestedWeek = getRequestedWeek();
  const defaultWeek = requestedWeek || findDefaultWeek();

  selectWeek(defaultWeek.id, { updateUrl: false });
  alignClassFocusHash();
  window.addEventListener("hashchange", alignClassFocusHash);
});
