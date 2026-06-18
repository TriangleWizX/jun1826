(() => {
  const roots = document.querySelectorAll('[data-proof-carousel]');
  roots.forEach((root) => {
    const slides = Array.from(root.querySelectorAll('[data-proof-slide]'));
    const prevBtn = root.querySelector('[data-proof-prev]');
    const nextBtn = root.querySelector('[data-proof-next]');
    const toggleBtn = root.querySelector('[data-proof-toggle]');
    const status = root.querySelector('[data-proof-status]');
    if (!slides.length || !prevBtn || !nextBtn || !toggleBtn || !status) return;

    let index = 0;
    let paused = false;
    let timer = null;

    const render = () => {
      slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === index));
      status.textContent = `Review ${index + 1} of ${slides.length}`;
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      if (paused) return;
      timer = window.setInterval(() => {
        index = (index + 1) % slides.length;
        render();
      }, 6000);
    };

    prevBtn.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      render();
      start();
    });

    nextBtn.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      render();
      start();
    });

    toggleBtn.addEventListener('click', () => {
      paused = !paused;
      toggleBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      toggleBtn.textContent = paused ? 'Play' : 'Pause';
      toggleBtn.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
      start();
    });

    root.addEventListener('mouseenter', () => {
      if (!paused) stop();
    });

    root.addEventListener('mouseleave', () => {
      if (!paused) start();
    });

    render();
    start();
  });
})();
