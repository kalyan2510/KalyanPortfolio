/* ============================================================
   KALYAN KUMAR S. — Portfolio JavaScript (vanilla)
   1. Mobile hamburger menu          6. Hero typing animation
   2. Smooth scrolling               7. Back-to-top button
   3. Active navigation link         8. Project details modal
   4. Navbar scroll effect           9. Resume download check
   5. Scroll reveal (skills, certs, projects, cards)
   10. Profile photo fallback
   ============================================================ */

(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Toast ---------- */
  var toast = $('#toast');
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('show'); }, 5000);
  }

  /* ---------- 1. Mobile hamburger menu ---------- */
  var hamburger = $('#hamburger');
  var navLinks = $('#navLinks');
  var backdrop = $('#navBackdrop');

  function setMenu(open) {
    if (!hamburger || !navLinks) return;
    navLinks.classList.toggle('active', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (backdrop) backdrop.classList.toggle('show', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      setMenu(!navLinks.classList.contains('active'));
    });
    if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); closeModal(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* ---------- 2. Smooth scrolling (+ close mobile menu) ---------- */
  var navbar = $('#navbar');
  function navOffset() { return navbar ? navbar.offsetHeight : 72; }

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      var top = target.getBoundingClientRect().top + window.pageYOffset - navOffset() + 1;
      window.scrollTo({ top: id === '#home' ? 0 : top, behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ---------- 3 / 4 / 7. Scroll handlers: navbar, active link, back-to-top ---------- */
  var sections = $$('main section[id]');
  var navAnchors = $$('.nav-link');
  var backToTop = $('#backToTop');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;

    if (navbar) navbar.classList.toggle('scrolled', y > 30);
    if (backToTop) backToTop.classList.toggle('show', y > 500);

    var marker = y + navOffset() + window.innerHeight * 0.25;
    var current = sections.length ? sections[0].id : '';
    sections.forEach(function (s) { if (s.offsetTop <= marker) current = s.id; });
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4 && sections.length) {
      current = sections[sections.length - 1].id;
    }
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('load', onScroll);
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 5. Scroll reveal ---------- */
  var revealEls = $$('.reveal');

  // Stagger siblings inside grids marked with .stagger
  $$('.stagger').forEach(function (group) {
    $$('.reveal', group).forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.09) + 's';
    });
  });

  // Hero items stagger too
  $$('.hero-content .reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.1) + 's';
  });

  function finishReveal(el) {
    // Remove the reveal transition so the card's own hover transitions work normally
    var done = false;
    function cleanup() {
      if (done) return;
      done = true;
      el.classList.remove('reveal', 'visible');
      el.style.transitionDelay = '';
    }
    el.addEventListener('transitionend', function handler(e) {
      if (e.target === el && e.propertyName === 'transform') {
        el.removeEventListener('transitionend', handler);
        cleanup();
      }
    });
    window.setTimeout(cleanup, 2200);
  }

  function showEl(el) {
    el.classList.add('visible');
    finishReveal(el);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showEl(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 6. Hero typing animation ---------- */
  var typedEl = $('#typedText');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typedEl && !reduceMotion) {
    var phrases = [
      'Python Developer | Web Developer',
      'Python Developer',
      'Web Developer'
    ];
    var p = 0, c = 0, deleting = false;

    (function tick() {
      var text = phrases[p];
      if (!deleting) {
        c++;
        typedEl.textContent = text.slice(0, c);
        if (c === text.length) { deleting = true; return void window.setTimeout(tick, 2000); }
        window.setTimeout(tick, 70);
      } else {
        c--;
        typedEl.textContent = text.slice(0, c);
        if (c === 0) { deleting = false; p = (p + 1) % phrases.length; return void window.setTimeout(tick, 350); }
        window.setTimeout(tick, 35);
      }
    })();
  }

  /* ---------- 8. Project details modal ---------- */
  var projects = {
    parkhaven: {
      title: 'ParkHaven – Smart Parking Management System',
      points: [
        'Developed a smart parking platform designed to help users find and book available parking spaces.',
        'Worked as part of a team to plan and develop the project workflow and user-facing features.',
        'Focused on organizing parking-space information to make the booking process easier for users.'
      ]
    },
    hospital: {
      title: 'Hospital Management System',
      liveUrl: 'https://kalyan2510.github.io/Hospital-Dashboard/',
      points: [
        'Developed a web-based hospital management project using HTML, CSS and JavaScript.',
        'Designed user-friendly pages and interfaces for organizing hospital-related information.',
        'Implemented front-end interactions and page functionality using JavaScript.',
        'Focused on clean UI design, structured pages and practical workflow.'
      ]
    }
  };

  var modal = $('#projectModal');
  var modalTitle = $('#modalTitle');
  var modalList = $('#modalList');
  var modalActions = $('#modalActions');
  var modalClose = $('#modalClose');
  var lastFocus = null;

  function openModal(key) {
    var data = projects[key];
    if (!data || !modal) return;
    lastFocus = document.activeElement;
    modalTitle.textContent = data.title;
    modalList.innerHTML = '';
    data.points.forEach(function (pt) {
      var li = document.createElement('li');
      li.textContent = pt;
      modalList.appendChild(li);
    });
    if (modalActions) {
      modalActions.innerHTML = '';
      if (data.liveUrl) {
        var liveBtn = document.createElement('a');
        liveBtn.href = data.liveUrl;
        liveBtn.target = '_blank';
        liveBtn.rel = 'noopener noreferrer';
        liveBtn.className = 'btn btn-primary modal-live-btn';
        liveBtn.textContent = 'View Live Project →';
        modalActions.appendChild(liveBtn);
      }
    }
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$('[data-project]').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.getAttribute('data-project')); });
  });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  /* ---------- 9. Resume download check ----------
     The button points to assets/KALYAN-KUMAR-RESUME.pdf.
     If the file is missing (HTTP 404) a friendly message is shown instead of a broken download. */
  $$('[data-resume]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (!/^https?:$/.test(window.location.protocol) || !window.fetch) return; // file:// -> let the browser handle it
      e.preventDefault();
      var url = link.getAttribute('href');
      fetch(url, { method: 'HEAD', cache: 'no-store' })
        .then(function (res) {
          if (res.ok) {
            var a = document.createElement('a');
            a.href = url;
            a.download = link.getAttribute('download') || 'KALYAN-KUMAR-RESUME.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
          } else {
            showToast('Resume not found. Copy your PDF to assets/KALYAN-KUMAR-RESUME.pdf');
          }
        })
        .catch(function () { window.location.href = url; });
    });
  });

  /* ---------- 10. Profile photo fallback ----------
     If assets/profile.jpg is missing, a neutral placeholder is shown (no fake photo). */
  var img = $('#profileImg');
  var placeholder = $('#profilePlaceholder');
  function showPlaceholder() {
    if (img) img.hidden = true;
    if (placeholder) placeholder.hidden = false;
  }
  if (img) {
    img.addEventListener('error', showPlaceholder);
    if (img.complete && img.naturalWidth === 0) showPlaceholder();
  }
})();
