document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("ssVideoGrid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".ss-video-card-wrap"));
  const laneButtons = Array.from(document.querySelectorAll('[data-filter-group="lane"]'));
  const topicButtons = Array.from(document.querySelectorAll('[data-filter-group="topic"]'));
  const resultsText = document.getElementById("ssVideoResultsText");
  const showMoreBtn = document.getElementById("ssShowMoreVideos");

  if (!resultsText || !showMoreBtn) return;

  let activeLane = "all";
  let activeTopic = "all";
  let visibleCount = getBaseVisibleCount();

  function getBaseVisibleCount() {
    return window.innerWidth < 768 ? 4 : 6;
  }

  function setActiveState(buttons, clickedButton) {
    buttons.forEach(function (button) {
      const isActive = button === clickedButton;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function getFilteredCards() {
    return cards.filter(function (card) {
      const lane = card.getAttribute("data-lane");
      const topic = card.getAttribute("data-topic");
      const laneMatch = activeLane === "all" || lane === activeLane;
      const topicMatch = activeTopic === "all" || topic === activeTopic;
      return laneMatch && topicMatch;
    });
  }

  function render(resetCount) {
    if (resetCount) {
      visibleCount = getBaseVisibleCount();
    }

    cards.forEach(function (card) {
      card.classList.add("is-hidden");
    });

    const filtered = getFilteredCards();
    filtered.slice(0, visibleCount).forEach(function (card) {
      card.classList.remove("is-hidden");
    });

    const shown = Math.min(filtered.length, visibleCount);
    resultsText.textContent = "Showing " + shown + " of " + filtered.length + " videos";
    showMoreBtn.hidden = filtered.length <= visibleCount;
  }

  laneButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeLane = button.getAttribute("data-filter-value") || "all";
      setActiveState(laneButtons, button);
      render(true);
    });
  });

  topicButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeTopic = button.getAttribute("data-filter-value") || "all";
      setActiveState(topicButtons, button);
      render(true);
    });
  });

  showMoreBtn.addEventListener("click", function () {
    visibleCount += getBaseVisibleCount();
    render(false);
  });

  window.addEventListener("resize", function () {
    render(true);
  });

  render(true);
});
