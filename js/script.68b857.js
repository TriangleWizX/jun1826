/**
 * Safe, dependency-free UI helpers.
 * Everything is guarded so pages without matching elements won't throw.
 */

document.addEventListener('DOMContentLoaded', () => {
  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  // Hamburger toggle (if present)
  const hamburger = qs('.hamburger');
  const mainNav = qs('.main-nav');
  if (hamburger && mainNav) {
    const toggleNav = () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isExpanded));
      mainNav.classList.toggle('open', !isExpanded);
      if (!isExpanded) {
        const firstLink = mainNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    };
    hamburger.addEventListener('click', toggleNav);

    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scrolling for on-page anchors
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href') || '';
      if (targetId.length <= 1) return;
      const target = qs(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Fade-in on scroll
  const sections = qsa('section');
  const checkFadeIn = () => {
    sections.forEach((sec) => {
      if (sec.classList.contains('before-animate')) {
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          sec.classList.add('animate');
          sec.classList.remove('before-animate');
        }
      }
    });
  };
  sections.forEach((sec) => sec.classList.add('before-animate'));
  window.addEventListener('scroll', checkFadeIn);
  window.addEventListener('resize', checkFadeIn);
  checkFadeIn();

  // Typewriter effect
  const heroHeadline = qs('#heroHeadline');
  if (heroHeadline) {
    const headlineText = 'SAFE FUN TRAINING';
    let index = 0;
    heroHeadline.textContent = '';
    heroHeadline.style.whiteSpace = 'nowrap';
    heroHeadline.style.overflow = 'hidden';
    heroHeadline.style.borderRight = '2px solid #e63946';
    const typeWriter = () => {
      if (index < headlineText.length) {
        heroHeadline.textContent += headlineText.charAt(index);
        index += 1;
        setTimeout(typeWriter, 150);
      } else {
        heroHeadline.style.borderRight = 'none';
      }
    };
    setTimeout(typeWriter, 500);
  }

  // Scroll-to-top
  const scrollToTop = qs('#scrollToTop');
  if (scrollToTop) {
    const toggleBtn = () => {
      scrollToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    };
    window.addEventListener('scroll', toggleBtn);
    scrollToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    toggleBtn();
  }

  // Navbar shrink
  const siteHeader = qs('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      siteHeader.classList.toggle('shrink', window.scrollY > 100);
    });
  }

  // Scroll progress
  const scrollProgress = qs('#scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      scrollProgress.style.width = `${progress}%`;
    });
  }

  // Parallax background if heroSection exists
  const heroSection = qs('#heroSection');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.5;
      heroSection.style.backgroundPosition = `center calc(50% + ${offset}px)`;
    });
  }
});
