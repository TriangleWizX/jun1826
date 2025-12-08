/* eslint-disable no-undef */
/* If you're using ESLint, disable or adjust rules as needed */

//////////////////////////////////////////////////////////////
// HAMBURGER MENU & NAV
//////////////////////////////////////////////////////////////
$(document).ready(function() {
  // Toggle hamburger & nav
  $('.hamburger').on('click', function() {
    const $this = $(this);
    const $nav = $('.main-nav');
    const isExpanded = $this.attr('aria-expanded') === 'true';

    $this.attr('aria-expanded', !isExpanded);
    $nav.toggleClass('open');

    // Focus on the first nav link when opened
    if (!isExpanded) {
      $nav.find('a').first().focus();
    }
  });

  // Close nav if clicking outside
  $(document).on('click', function(event) {
    if (!$(event.target).closest('.hamburger, .main-nav').length) {
      $('.main-nav').removeClass('open');
      $('.hamburger').attr('aria-expanded', 'false');
    }
  });

  // Close nav on Escape
  $(document).on('keydown', function(event) {
    if (event.key === 'Escape') {
      $('.main-nav').removeClass('open');
      $('.hamburger').attr('aria-expanded', 'false');
    }
  });


  //////////////////////////////////////////////////////////////
  // SMOOTH SCROLLING FOR ANCHOR LINKS
  //////////////////////////////////////////////////////////////
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    const targetId = $(this).attr('href');
    if ($(targetId).length) {
      $('html, body').animate(
        { scrollTop: $(targetId).offset().top },
        600
      );
    }
  });


  //////////////////////////////////////////////////////////////
  // FADE-IN ANIMATIONS ON SCROLL
  //////////////////////////////////////////////////////////////
  function isInViewport($el) {
    const rect = $el[0].getBoundingClientRect();
    return rect.top < window.innerHeight * 0.85;
  }

  function checkFadeIn() {
    $('section').each(function() {
      const $sec = $(this);
      if ($sec.hasClass('before-animate') && isInViewport($sec)) {
        $sec.addClass('animate').removeClass('before-animate');
      }
    });
  }

  $(window).on('scroll resize', checkFadeIn);
  $('section').addClass('before-animate');
  checkFadeIn();


  //////////////////////////////////////////////////////////////
  // TYPEWRITER EFFECT (Hero Headline)
  //////////////////////////////////////////////////////////////
  const $heroHeadline = $('#heroHeadline');
  const headlineText = 'SAFE FUN TRAINING';
  let index = 0;

  function typeWriter() {
    if (index < headlineText.length) {
      $heroHeadline.text($heroHeadline.text() + headlineText.charAt(index));
      index++;
      setTimeout(typeWriter, 150);
    } else {
      $heroHeadline.css('border-right', 'none');
    }
  }

  if ($heroHeadline.length) {
    // Debugging log
    console.log('Typewriter Effect Initialized');
    $heroHeadline.text('');
    $heroHeadline.css({
      'white-space': 'nowrap',
      overflow: 'hidden',
      'border-right': '2px solid #e63946'
    });
    setTimeout(typeWriter, 500);
  }


  //////////////////////////////////////////////////////////////
  // SCROLL-TO-TOP BUTTON
  //////////////////////////////////////////////////////////////
  const $scrollToTop = $('#scrollToTop');
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 300) {
      $scrollToTop.fadeIn();
    } else {
      $scrollToTop.fadeOut();
    }
  });
  $scrollToTop.on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 600);
  });


  //////////////////////////////////////////////////////////////
  // NAVBAR SHRINK ON SCROLL (optional)
  //////////////////////////////////////////////////////////////
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 100) {
      $('.site-header').addClass('shrink');
    } else {
      $('.site-header').removeClass('shrink');
    }
  });


  //////////////////////////////////////////////////////////////
  // SCROLL PROGRESS BAR
  //////////////////////////////////////////////////////////////
  $(window).on('scroll', function() {
    const totalHeight = $(document).height() - $(window).height();
    const progress = ($(this).scrollTop() / totalHeight) * 100;
    $('#scrollProgress').css('width', progress + '%');
  });


  //////////////////////////////////////////////////////////////
  // MODAL POPUP (Welcome Message)
  //////////////////////////////////////////////////////////////
  const $popupModal = $('#popupModal');
  const $closeModalBtn = $('#closeModal');

  if ($closeModalBtn.length) {
    $closeModalBtn.on('click', function() {
      $popupModal.fadeOut();
    });
  }

  // Show modal after X seconds
  setTimeout(function() {
    if ($popupModal.length) {
      $popupModal.css('display', 'flex'); // or fadeIn
    }
  }, 3000);


  //////////////////////////////////////////////////////////////
  // EXIT INTENT LOGIC
  //////////////////////////////////////////////////////////////
  const $exitPopup = $('#exitPopup');
  const $exitFormClose = $('.close-popup');
  let exitShown = false;

  function showExitPopup() {
    if (!exitShown && $exitPopup.length) {
      $exitPopup.css('display', 'flex');
      exitShown = true;
    }
  }

  // Mouseleave top detection
  $(document).on('mouseout', function(e) {
    if (e.clientY < 50) {
      showExitPopup();
    }
  });

  // Close exit popup
  if ($exitFormClose.length) {
    $exitFormClose.on('click', function() {
      $exitPopup.fadeOut();
    });
  }
});

//////////////////////////////////////////////////////////////
// EXIT-POPUP FORM SUBMIT HANDLER (if needed)
////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
  const exitPopup = document.getElementById('exitPopup');
  const exitForm = document.getElementById('exitEmailForm');
  const exitFeedback = document.getElementById('exitFeedback');

  if (exitForm) {
    exitForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const email = document.getElementById('exitEmail').value;

      // Placeholder fetch
      fetch('https://your-email-api.com/subscribe', { // Update with your real endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            exitFeedback.textContent = 'Success! Check your email for your free guide.';
            exitFeedback.style.color = 'green';
            exitForm.reset();
            setTimeout(() => { exitPopup.style.display = 'none'; }, 3000);
          } else {
            exitFeedback.textContent = 'Oops! Something went wrong.';
            exitFeedback.style.color = 'red';
          }
        })
        .catch(error => {
          exitFeedback.textContent = 'Error: Unable to process request.';
          exitFeedback.style.color = 'red';
        });
    });
  }
});

window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    // Adjust the 0.5 multiplier as desired for a faster/slower parallax
    const offset = scrollY * 0.5; 
    document.getElementById('heroSection').style.backgroundPosition = `center calc(50% + ${offset}px)`;
  });
const popupModal = document.getElementById('popupModal');

// On open:
popupModal.setAttribute('tabindex', '-1');
popupModal.focus();

// On close:
popupModal.removeAttribute('tabindex');

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    popupModal.style.display = 'none';
  }
});
