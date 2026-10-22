/* ==========================================================================
   VOG — Vector Operations Group
   Vanilla JavaScript. No dependencies, no network requests, no storage,
   no cookies. Everything here is progressive enhancement: the page is fully
   readable if this file never runs.
   ========================================================================== */
(function () {
  'use strict';

  // Tells the inline failsafe in <head> that this script loaded.
  window.__vogBooted = true;

  /* ---------- Helpers ---------- */
  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (n, min, max) { return Math.min(max, Math.max(min, n)); };

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktopNavMQ = window.matchMedia('(min-width: 900px)');
  var motionOK = function () { return !reduceMQ.matches; };

  // Every listener / observer / timer is registered here and released on pagehide.
  var cleanups = [];
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    cleanups.push(function () { target.removeEventListener(type, handler, options); });
  }
  function onMQ(mq, handler) {
    if (mq.addEventListener) { mq.addEventListener('change', handler); cleanups.push(function () { mq.removeEventListener('change', handler); }); }
    else if (mq.addListener) { mq.addListener(handler); cleanups.push(function () { mq.removeListener(handler); }); }
  }
  function setInert(list, on) {
    list.forEach(function (el) {
      if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }

  var header = $('.site-header');
  var main = $('#main');
  var footer = $('.site-footer');
  var toTopButton = $('.to-top');

  /* ======================================================================
     1. Entrance: short, skippable intro, then the hero is released
     ====================================================================== */
  function releaseHero() {
    root.classList.add('is-ready');
    $$('[data-hero]').forEach(function (el) { el.classList.add('is-in'); });
  }

  function initIntro() {
    var intro = $('#intro');
    var skip = $('#intro-skip');
    // The <head> script only sets .is-intro when motion is allowed and the URL has no #hash.
    if (!intro || !skip || !root.classList.contains('is-intro')) {
      releaseHero();
      return;
    }

    var DURATION = 4500;
    var finished = false;
    var locked = [header, main, footer, toTopButton];

    setInert(locked, true);
    try { skip.focus({ preventScroll: true }); } catch (e) { skip.focus(); }

    function finish() {
      if (finished) return;
      finished = true;
      root.classList.add('is-intro-leaving');
      setTimeout(releaseHero, 250);
      setTimeout(function () {
        root.classList.remove('is-intro', 'is-intro-leaving');
        setInert(locked, false);
      }, 800);
    }

    listen(skip, 'click', finish);
    listen(document, 'keydown', function (e) {
      if (finished) return;
      if (e.key === 'Escape') { e.preventDefault(); finish(); }
      else if (e.key === 'Tab') { e.preventDefault(); skip.focus(); } // single control: keep focus on it
    });
    var timer = setTimeout(finish, DURATION);
    cleanups.push(function () { clearTimeout(timer); });
  }

  /* ======================================================================
     2. Mobile navigation drawer
     ====================================================================== */
  function initNav() {
    var nav = $('.site-nav');
    var toggle = $('.nav-toggle');
    var label = $('.nav-toggle__label');
    if (!nav || !toggle) return;
    var isOpen = false;

    function set(next, restoreFocus) {
      if (next === isOpen) return;
      isOpen = next;
      nav.classList.toggle('is-open', isOpen);
      root.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (label) label.textContent = isOpen ? 'Close' : 'Menu';
      setInert([main, footer, toTopButton], isOpen);
      if (isOpen) {
        var first = $('.nav-list a', nav);
        if (first) first.focus();
      } else if (restoreFocus) {
        toggle.focus();
      }
    }

    listen(toggle, 'click', function () { set(!isOpen, true); });

    // Choosing a destination closes the drawer; the anchor handler then moves focus to the section.
    listen(nav, 'click', function (e) {
      if (isOpen && e.target.closest('a')) set(false, false);
    });

    listen(document, 'keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); set(false, true); return; }
      if (e.key !== 'Tab') return;
      var items = $$('.brand, .nav-toggle, .nav-list a', header);
      var firstEl = items[0];
      var lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    });

    onMQ(desktopNavMQ, function (mq) { if (mq.matches) set(false, false); });
  }

  /* ======================================================================
     3. In-page anchors: native smooth scroll (CSS) + move focus to target
     ====================================================================== */
  function initAnchors() {
    $$('main section[id]').forEach(function (s) { if (!s.hasAttribute('tabindex')) s.setAttribute('tabindex', '-1'); });
    listen(document, 'click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      setTimeout(function () {
        try { target.focus({ preventScroll: true }); } catch (err) { target.focus(); }
      }, 0);
    });
  }

  /* ======================================================================
     4. Scroll reveals (IntersectionObserver)
     ====================================================================== */
  function initReveal() {
    // Stagger siblings inside [data-stagger] containers.
    $$('[data-stagger]').forEach(function (group) {
      $$(':scope > .reveal', group).forEach(function (child, i) { child.style.setProperty('--i', i); });
    });

    var targets = $$('.reveal:not([data-hero]), .logo-reveal:not([data-hero])');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    cleanups.push(function () { io.disconnect(); });
  }

  /* ======================================================================
     5. Active section in navigation (sections declare their nav entry via data-nav)
     ====================================================================== */
  function initActiveNav() {
    var links = $$('.nav-list a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });

    function setCurrent(id) {
      links.forEach(function (a) {
        if (map[id] === a) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.getAttribute('data-nav') || '');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    $$('main > section').forEach(function (s) { io.observe(s); });
    cleanups.push(function () { io.disconnect(); });
  }

  /* ======================================================================
     6. Scroll progress, header state, back-to-top, history timeline line
     ====================================================================== */
  function initScrollEffects() {
    var progress = $('.scroll-progress');
    var timeline = $('[data-timeline]');
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset;
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      if (progress) progress.style.setProperty('--progress', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
      if (header) header.classList.toggle('is-scrolled', y > 24);
      if (toTopButton) toTopButton.classList.toggle('is-visible', y > vh * 0.8);

      if (timeline && motionOK()) {
        // The line fills as the reader moves down the stages (reaches 100% near the end of the list).
        var r = timeline.getBoundingClientRect();
        var t = clamp((vh * 0.65 - r.top) / Math.max(1, r.height), 0, 1);
        timeline.style.setProperty('--tl', t.toFixed(4));
      } else if (timeline) {
        timeline.style.removeProperty('--tl');
      }
    }
    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    listen(window, 'scroll', requestUpdate, { passive: true });
    listen(window, 'resize', requestUpdate, { passive: true });
    onMQ(reduceMQ, requestUpdate);
    update();
  }

  /* ======================================================================
     7. Organization accordion (accessible: buttons, aria-expanded, arrow keys)
     ====================================================================== */
  function initFramework() {
    var items = $$('.framework__item');
    var buttons = items.map(function (item) { return $('.framework__btn', item); });
    if (!items.length) return;

    function setActive(index) {
      items.forEach(function (item, i) {
        var on = i === index;
        item.classList.toggle('is-active', on);
        buttons[i].setAttribute('aria-expanded', String(on));
      });
    }
    buttons.forEach(function (btn, i) {
      listen(btn, 'click', function () { setActive(items[i].classList.contains('is-active') ? -1 : i); });
      listen(btn, 'keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown') next = (i + 1) % buttons.length;
        else if (e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        if (next !== null) { e.preventDefault(); buttons[next].focus(); }
      });
    });
  }

  /* ======================================================================
     8. Back to top, footer year
     ====================================================================== */
  function initToTop() {
    $$('[data-to-top]').forEach(function (btn) {
      listen(btn, 'click', function () {
        window.scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' });
        var top = document.getElementById('top');
        if (top) { try { top.focus({ preventScroll: true }); } catch (e) { top.focus(); } }
      });
    });
  }

  function initYear() {
    var year = String(new Date().getFullYear());
    $$('[data-year]').forEach(function (el) { el.textContent = year; });
  }

  /* ---------- Boot ---------- */
  initIntro();
  initNav();
  initAnchors();
  initReveal();
  initActiveNav();
  initScrollEffects();
  initFramework();
  initToTop();
  initYear();

  listen(window, 'pagehide', function () {
    cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* noop */ } });
    cleanups.length = 0;
  });
})();
