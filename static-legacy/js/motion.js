/* ============================================================
   Paws & Hearts PH, motion.js
   GSAP + ScrollTrigger + Lenis (all vendored in js/vendor/).
   Everything degrades gracefully: if a library is missing, or the
   visitor prefers reduced motion, the page is simply static and
   fully readable. No content is ever hidden by CSS alone.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var docEl = document.documentElement;

  /* ---------------------------------------------------------
     Always on: scroll progress bar + sticky header state
     --------------------------------------------------------- */
  var bar = document.getElementById('progress-bar');
  var header = document.querySelector('.site-header');
  var queued = false;

  function paint() {
    queued = false;
    var max = docEl.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (header) header.classList.toggle('is-solid', window.scrollY > 30);
  }
  window.addEventListener('scroll', function () {
    if (!queued) { queued = true; window.requestAnimationFrame(paint); }
  }, { passive: true });
  window.addEventListener('resize', paint);
  paint();

  /* ---------------------------------------------------------
     Counters, count up when a stat scrolls into view
     --------------------------------------------------------- */
  function countUp(node) {
    var raw = (node.textContent || '').replace(/[^\d]/g, '');
    var target = parseInt(raw, 10);
    if (isNaN(target) || target < 1) return;
    var start = null;
    var dur = 1200;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
      else node.textContent = String(target);
    }
    window.requestAnimationFrame(step);
  }

  if (!reduced && 'IntersectionObserver' in window) {
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          countUp(en.target);
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (c) { io.observe(c); });
    }
  }

  /* ---------------------------------------------------------
     From here on: real animation. Bail out when motion is off
     or GSAP failed to load, so the page is already complete.
     --------------------------------------------------------- */
  if (reduced) return;
  if (typeof window.gsap === 'undefined') return;

  var gsap = window.gsap;
  var hasST = typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- Lenis smooth scrolling ---------- */
  if (window.Lenis) {
    try {
      var lenis = new window.Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 1
      });
      window.__lenis = lenis;
      docEl.classList.add('has-lenis');
      if (hasST) {
        lenis.on('scroll', window.ScrollTrigger.update);
      }
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (err) {
      window.__lenis = null;
    }
  }

  /* ---------- Split the headline into words for the intro ---------- */
  function splitWords(node) {
    var kids = Array.prototype.slice.call(node.childNodes);
    node.textContent = '';
    kids.forEach(function (kid) {
      if (kid.nodeType === 3) {
        (kid.textContent.split(/(\s+)/) || []).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { node.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span'); w.className = 'w';
          var wi = document.createElement('span'); wi.className = 'wi';
          wi.textContent = part;
          w.appendChild(wi);
          node.appendChild(w);
        });
      } else if (kid.nodeType === 1) {
        var w2 = document.createElement('span'); w2.className = 'w';
        var wi2 = document.createElement('span'); wi2.className = 'wi';
        wi2.appendChild(kid);
        w2.appendChild(wi2);
        node.appendChild(w2);
      }
    });
    return node.querySelectorAll('.wi');
  }

  var title = document.querySelector('[data-split]');
  var words = title ? splitWords(title) : [];

  /* ---------- Intro timeline ---------- */
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (words.length) {
    gsap.set(words, { yPercent: 118 });
    intro.to(words, { yPercent: 0, duration: 1.1, stagger: 0.045 }, 0.15);
  }

  ['.kicker', '.standfirst', '.lead-actions', '.stats'].forEach(function (sel, i) {
    var node = document.querySelector(sel);
    if (!node) return;
    gsap.set(node, { opacity: 0, y: 26 });
    intro.to(node, { opacity: 1, y: 0, duration: 0.9 }, 0.35 + i * 0.11);
  });

  var cards = gsap.utils.toArray('.stack-card');
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 70, scale: 0.9 });
    intro.to(cards, { opacity: 1, y: 0, scale: 1, duration: 1.15, stagger: 0.13 }, 0.5);
  }

  /* ---------- Hero background parallax ---------- */
  if (hasST) {
    gsap.to('.hero-bg', {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    /* photo stack drifts a little as you leave the hero */
    gsap.to('.hero-stack', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ---------- Pointer tilt on the photo stack ---------- */
  var stack = document.querySelector('[data-stack]');
  var hero = document.querySelector('.hero');
  if (stack && hero && cards.length) {
    gsap.set(stack, { transformPerspective: 1100 });
    var tiltX = gsap.quickTo(stack, 'rotationY', { duration: 0.7, ease: 'power3' });
    var tiltY = gsap.quickTo(stack, 'rotationX', { duration: 0.7, ease: 'power3' });
    var cardX = cards.map(function (c) {
      var depth = parseFloat(c.getAttribute('data-depth')) || 14;
      return { fn: gsap.quickTo(c, 'x', { duration: 0.9, ease: 'power3' }), depth: depth };
    });

    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      tiltX(nx * 9);
      tiltY(-ny * 7);
      cardX.forEach(function (c) { c.fn(nx * c.depth); });
    });
    hero.addEventListener('mouseleave', function () {
      tiltX(0); tiltY(0);
      cardX.forEach(function (c) { c.fn(0); });
    });
  }

  /* ---------- Scroll reveals ---------- */
  if (hasST) {
    gsap.utils.toArray('[data-reveal]').forEach(function (node) {
      gsap.from(node, {
        opacity: 0,
        y: 28,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: node, start: 'top 88%', once: true }
      });
    });
  }

  /* ---------- Directory rows: reveal once, then on every re-filter ---------- */
  var indexRoot = document.getElementById('entry-index');
  var revealed = false;

  function animateRows(rows) {
    if (!rows.length) return;
    gsap.fromTo(rows,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power2.out', overwrite: true, immediateRender: false }
    );
  }

  function rowsInView() {
    if (!indexRoot) return false;
    var r = indexRoot.getBoundingClientRect();
    return r.top < window.innerHeight * 0.95 && r.bottom > 0;
  }

  if (indexRoot && hasST && !revealed) {
    window.ScrollTrigger.create({
      trigger: indexRoot,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        revealed = true;
        animateRows(gsap.utils.toArray('#entry-index .entry'));
      }
    });
  }

  document.addEventListener('ph:render', function () {
    if (!revealed) return;              // first paint is handled by ScrollTrigger
    if (!rowsInView()) return;          // off-screen rows are already in place
    animateRows(gsap.utils.toArray('#entry-index .entry'));
  });

  /* ---------- Keep triggers honest as fonts and photos settle ---------- */
  window.addEventListener('load', function () {
    if (hasST) window.ScrollTrigger.refresh();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (hasST) window.ScrollTrigger.refresh();
    });
  }
})();
