// Theme toggle (light/dark) with persistence, plus profile-photo fallback.
(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  function current() {
    return root.getAttribute('data-theme') || 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      apply(current() === 'dark' ? 'light' : 'dark');
    });
  }

  // Follow the OS preference only while the user hasn't chosen explicitly.
  try {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem('theme')) apply(e.matches ? 'dark' : 'light');
    });
  } catch (e) {}

  // Hide a broken/missing profile image so the "KW" fallback shows through.
  var photo = document.getElementById('profilePhoto');
  if (photo) {
    photo.addEventListener('error', function () { photo.classList.add('broken'); });
    if (photo.complete && photo.naturalWidth === 0) photo.classList.add('broken');
  }

  // Abstract popup (Research page). No-ops on pages without the modal.
  var modal = document.getElementById('abstractModal');
  if (modal) {
    var content = modal.querySelector('.modal-content');
    var openModal = function (html) {
      content.innerHTML = html;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    var closeModal = function () {
      modal.hidden = true;
      content.innerHTML = '';
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.abstract-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.project-card');
        var src = card && card.querySelector('.abstract-src');
        if (src) openModal(src.innerHTML);
      });
    });
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  // Slideshows (Hobbies page). Each .slideshow is independent.
  document.querySelectorAll('.slideshow').forEach(function (ss) {
    var slides = Array.prototype.slice.call(ss.querySelectorAll('.slide'));
    if (!slides.length) return;
    var dotsWrap = ss.querySelector('.slide-dots');
    var caption = ss.querySelector('.slide-caption');
    var idx = 0, timer = null;
    var delay = parseInt(ss.getAttribute('data-autoplay') || '0', 10);

    var dots = slides.map(function (_, i) {
      if (!dotsWrap) return null;
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function go(n) {
      slides[idx].classList.remove('active');
      if (dots[idx]) dots[idx].classList.remove('active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      if (dots[idx]) dots[idx].classList.add('active');
      if (caption) caption.textContent = slides[idx].getAttribute('data-caption') || '';
    }
    function start() { if (delay > 0) timer = setInterval(function () { go(idx + 1); }, delay); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    var prev = ss.querySelector('.prev'), next = ss.querySelector('.next');
    if (prev) prev.addEventListener('click', function () { go(idx - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(idx + 1); restart(); });
    ss.addEventListener('mouseenter', stop);
    ss.addEventListener('mouseleave', start);

    go(0);
    start();
  });
})();
