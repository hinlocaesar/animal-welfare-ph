/* ============================================================
   Paws & Hearts PH — app.js
   Vanilla JS: rendering, filtering, URL sync, detail dialog.
   Data comes from data/organizations.js → window.ORGANIZATIONS
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Constants ---------- */
  var DATA = Array.isArray(window.ORGANIZATIONS) ? window.ORGANIZATIONS : [];

  var CATEGORY_LABELS = {
    'dogs-cats': 'Dogs & cats',
    'wildlife': 'Wildlife',
    'marine': 'Marine',
    'farm': 'Farm animals',
    'drives': 'Drives & clinics',
    'mixed': 'Mixed / community'
  };

  /* Which <symbol> id illustrates each category */
  var CATEGORY_ICON = {
    'dogs-cats': 'i-dogs-cats',
    'wildlife': 'i-wildlife',
    'marine': 'i-marine',
    'farm': 'i-farm',
    'drives': 'i-drives',
    'mixed': 'i-mixed'
  };

  /* ---------- Tiny DOM helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(id, size, cls) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (cls) svg.setAttribute('class', cls);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  /* Icons that are stroke-based (viewBox 0 0 24 24) need their own builder */
  function icon24(id, size, cls) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (cls) svg.setAttribute('class', cls);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function isSafeUrl(url) {
    if (typeof url !== 'string') return false;
    return /^https?:\/\//i.test(url.trim());
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------- Element refs ---------- */
  var grid = $('#entry-index');
  var emptyState = $('#empty-state');
  var countEl = $('#result-count');
  var form = $('#filters');
  var qInput = $('#q');
  var regionSel = $('#region');
  var categorySel = $('#category');
  var animalsSel = $('#animals');
  var resetBtn = $('#reset-filters');
  var emptyResetBtn = $('#empty-reset');
  var dialog = $('#org-dialog');
  var dialogBody = $('#dialog-body');
  var dialogClose = $('#dialog-close');

  /* ---------- Derived collections ---------- */
  var allAnimals = (function () {
    var map = {};
    DATA.forEach(function (org) {
      (org.animals || []).forEach(function (a) {
        if (a) map[a.toLowerCase()] = a;
      });
    });
    return Object.keys(map).sort(function (a, b) {
      return map[a].localeCompare(map[b]);
    }).map(function (k) { return map[k]; });
  })();

  var byId = {};
  DATA.forEach(function (org) { byId[org.id] = org; });

  /* ---------- Populate the animals <select> ---------- */
  allAnimals.forEach(function (animal) {
    var opt = document.createElement('option');
    opt.value = animal;
    opt.textContent = animal;
    animalsSel.appendChild(opt);
  });

  /* ---------- Hero + footer stats ---------- */
  (function fillMeta() {
    var total = $('#stat-total');
    if (total) total.textContent = String(DATA.length);

    var cats = $('#stat-cats');
    if (cats) {
      var seen = {};
      DATA.forEach(function (o) { seen[o.category] = true; });
      cats.textContent = String(Object.keys(seen).length);
    }

    var updated = $('#footer-updated');
    if (updated) {
      var latest = DATA.reduce(function (acc, o) {
        return (o.last_verified && o.last_verified > acc) ? o.last_verified : acc;
      }, '');
      updated.textContent = latest ? formatDate(latest) : '—';
    }

    /* contents line in the lead */
    var copy = $('#stat-total-copy');
    if (copy) copy.textContent = String(DATA.length);

    /* region tally table in the lead */
    var tally = {};
    DATA.forEach(function (o) { tally[o.region] = (tally[o.region] || 0) + 1; });
    $$('[data-region-count]').forEach(function (cell) {
      cell.textContent = String(tally[cell.getAttribute('data-region-count')] || 0);
    });
    var totalCell = $('[data-region-total]');
    if (totalCell) totalCell.textContent = String(DATA.length);
  })();

  function formatDate(iso) {
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    var m = parseInt(parts[1], 10) - 1;
    if (isNaN(m) || !months[m]) return iso;
    return months[m] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  }

  /* ---------- Filtering ---------- */
  function getState() {
    return {
      q: (qInput.value || '').trim().toLowerCase(),
      region: regionSel.value,
      category: categorySel.value,
      animals: animalsSel.value
    };
  }

  function matches(org, state) {
    if (state.region && org.region !== state.region) return false;
    if (state.category && org.category !== state.category) return false;
    if (state.animals) {
      var has = (org.animals || []).some(function (a) {
        return String(a).toLowerCase() === state.animals.toLowerCase();
      });
      if (!has) return false;
    }
    if (state.q) {
      var haystack = [
        org.name, org.city, org.province, org.region,
        org.description, org.category,
        (org.animals || []).join(' '),
        (org.volunteer_activities || []).join(' '),
        org.how_to_join
      ].join(' ').toLowerCase();

      // Every whitespace-separated term must appear somewhere.
      var terms = state.q.split(/\s+/).filter(Boolean);
      var ok = terms.every(function (t) { return haystack.indexOf(t) !== -1; });
      if (!ok) return false;
    }
    return true;
  }

  /* ---------- Rendering ---------- */
  function buildCard(org, index) {
    var entry = el('article', 'entry');
    entry.setAttribute('data-id', org.id);
    entry.style.animationDelay = Math.min(index * 22, 340) + 'ms';

    /* running number down the left rail */
    var no = el('span', 'entry-no', String(index + 1).length < 2
      ? '0' + (index + 1)
      : String(index + 1));
    no.setAttribute('aria-hidden', 'true');
    entry.appendChild(no);

    /* photo (official) or the category icon as fallback */
    var media;
    if (org.photo && org.photo.thumb) {
      media = document.createElement('img');
      media.className = 'entry-thumb';
      media.src = org.photo.thumb;
      media.alt = '';
      media.loading = 'lazy';
      media.decoding = 'async';
      media.width = 400;
      media.height = 400;
      media.addEventListener('error', function () {
        var fallback = iconNode(org, index);
        if (media.parentNode) media.parentNode.replaceChild(fallback, media);
      });
    } else {
      media = iconNode(org, index);
    }
    entry.appendChild(media);

    var body = el('div', 'entry-body');

    var head = el('div', 'entry-head');
    head.appendChild(el('h3', null, org.name));
    body.appendChild(head);

    var loc = el('p', 'entry-loc');
    loc.appendChild(icon24('i-pin', 14));
    var locText = [org.city, org.province].filter(Boolean).join(', ');
    loc.appendChild(el('span', null, locText || org.region));
    body.appendChild(loc);

    var tags = el('div', 'entry-tags');
    tags.appendChild(el('span', 'tag', org.region));
    tags.appendChild(el('span', 'tag tag-cat', CATEGORY_LABELS[org.category] || org.category));
    body.appendChild(tags);

    body.appendChild(el('p', 'entry-desc', org.description || ''));

    var animals = el('p', 'entry-animals');
    animals.appendChild(el('strong', null, 'Animals'));
    animals.appendChild(document.createTextNode(' — '));
    var names = (org.animals || []).slice(0, 5);
    names.forEach(function (a, i) {
      animals.appendChild(document.createTextNode((i ? ', ' : '') + a));
    });
    if ((org.animals || []).length > 5) {
      animals.appendChild(document.createTextNode(' · +' + (org.animals.length - 5) + ' more'));
    }
    body.appendChild(animals);

    var actions = el('div', 'entry-actions');
    var detailBtn = el('button', 'btn btn-line btn-small', 'View details');
    detailBtn.type = 'button';
    detailBtn.setAttribute('data-open', org.id);
    detailBtn.setAttribute('aria-haspopup', 'dialog');
    detailBtn.setAttribute('aria-label', 'View details for ' + org.name);
    actions.appendChild(detailBtn);

    var outbound = isSafeUrl(org.website) ? ['Website', org.website]
      : isSafeUrl(org.facebook) ? ['Facebook', org.facebook]
      : isSafeUrl(org.source_url) ? ['Source', org.source_url] : null;

    if (outbound) {
      var link = el('a', 'entry-link', outbound[0] + ' ↗');
      link.href = outbound[1];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      actions.appendChild(link);
    }
    body.appendChild(actions);

    entry.appendChild(body);
    return entry;
  }

  /* the square that stands in when there is no photo */
  function iconNode(org, index) {
    var wrap = el('div', 'entry-icon');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.appendChild(icon(CATEGORY_ICON[org.category] || 'i-mixed', 28));
    return wrap;
  }

  function render(list) {
    grid.textContent = '';
    var frag = document.createDocumentFragment();
    list.forEach(function (org, i) {
      frag.appendChild(buildCard(org, i));
    });
    grid.appendChild(frag);

    var isEmpty = list.length === 0;
    emptyState.hidden = !isEmpty;
    grid.hidden = isEmpty;
  }

  function updateCount(n) {
    var state = getState();
    var filtering = state.q || state.region || state.category || state.animals;
    var word = n === 1 ? 'organization' : 'organizations';
    var text = filtering
      ? 'Showing ' + n + ' ' + word + ' of ' + DATA.length
      : 'Showing all ' + n + ' ' + word;
    countEl.classList.add('is-updating');
    countEl.textContent = text;
    window.setTimeout(function () {
      countEl.classList.remove('is-updating');
    }, 120);
  }

  function apply(opts) {
    opts = opts || {};
    var state = getState();
    var list = DATA.filter(function (org) { return matches(org, state); });
    render(list);
    updateCount(list.length);
    if (opts.sync !== false) writeHash(state);
  }

  /* ---------- URL hash sync (works from file:// too) ---------- */
  var writingHash = false;

  function writeHash(state) {
    var params = [];
    if (state.q) params.push('q=' + encodeURIComponent(state.q));
    if (state.region) params.push('region=' + encodeURIComponent(state.region));
    if (state.category) params.push('category=' + encodeURIComponent(state.category));
    if (state.animals) params.push('animals=' + encodeURIComponent(state.animals));

    var hash = params.length ? '#' + params.join('&') : '';
    writingHash = true;
    try {
      if (window.history && window.history.replaceState) {
        var base = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', base + (hash || ''));
      } else {
        window.location.hash = params.length ? params.join('&') : ' ';
      }
    } catch (e) {
      /* file:// in some browsers blocks replaceState — fall back silently */
      try {
        if (params.length) window.location.hash = params.join('&');
      } catch (e2) { /* give up quietly */ }
    }
    window.setTimeout(function () { writingHash = false; }, 0);
  }

  function readHash() {
    var raw = window.location.hash || '';
    if (!raw) return null;
    raw = raw.slice(1);
    if (raw.indexOf('=') === -1) return null; // plain anchor, not filter state

    var out = {};
    raw.split('&').forEach(function (pair) {
      var idx = pair.indexOf('=');
      if (idx < 1) return;
      var k = pair.slice(0, idx);
      var v = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }

  function restoreFromHash() {
    var params = readHash();
    if (!params) return false;
    qInput.value = params.q || '';
    if (params.region) regionSel.value = params.region;
    if (params.category) categorySel.value = params.category;
    if (params.animals) animalsSel.value = params.animals;
    apply({ sync: false });
    return true;
  }

  /* ---------- Detail dialog ---------- */
  function section(title, iconId, contentNode) {
    var s = el('div', 'd-section');
    var h = el('h4');
    h.appendChild(icon24(iconId, 15));
    h.appendChild(document.createTextNode(title));
    s.appendChild(h);
    if (contentNode) s.appendChild(contentNode);
    return s;
  }

  function stringList(items, plain) {
    var ul = el('ul', 'd-list' + (plain ? ' d-list-plain' : ''));
    (items || []).forEach(function (item) {
      if (item) ul.appendChild(el('li', null, item));
    });
    return ul;
  }

  function contactLink(url, label, iconId, extraCls) {
    if (isSafeUrl(url)) {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      if (extraCls) a.className = extraCls;
      a.appendChild(icon24(iconId, 17));
      a.appendChild(document.createTextNode(label));
      return a;
    }
    return null;
  }

  function openDialog(id) {
    var org = byId[id];
    if (!org) return;

    dialogBody.textContent = '';

    /* official photo banner + credit */
    if (org.photo && org.photo.large) {
      var photoWrap = el('figure', 'd-photo-wrap');
      var dPhoto = document.createElement('img');
      dPhoto.className = 'd-photo';
      dPhoto.src = org.photo.large;
      dPhoto.alt = 'Official photo of ' + org.name;
      dPhoto.width = org.photo.width || 960;
      dPhoto.height = org.photo.height || 540;
      dPhoto.decoding = 'async';
      dPhoto.addEventListener('error', function () {
        if (photoWrap.parentNode) photoWrap.parentNode.removeChild(photoWrap);
      });
      photoWrap.appendChild(dPhoto);

      if (isSafeUrl(org.photo.credit_url)) {
        var credit = el('figcaption', 'd-credit');
        credit.appendChild(document.createTextNode('Photo from the org’s '));
        var creditA = document.createElement('a');
        creditA.href = org.photo.credit_url;
        creditA.target = '_blank';
        creditA.rel = 'noopener noreferrer';
        creditA.textContent = (org.photo.credit_label || 'official page') + ' ↗';
        credit.appendChild(creditA);
        photoWrap.appendChild(credit);
      }
      dialogBody.appendChild(photoWrap);
    }

    /* head */
    var head = el('div', 'd-head');
    var dIcon = el('div', 'd-icon');
    dIcon.setAttribute('aria-hidden', 'true');
    dIcon.appendChild(icon(CATEGORY_ICON[org.category] || 'i-mixed', 34));
    head.appendChild(dIcon);

    var headText = el('div');
    var h = el('h2', 'd-title', org.name);
    h.id = 'dialog-title';
    headText.appendChild(h);

    var loc = el('p', 'd-loc');
    loc.appendChild(icon24('i-pin', 15));
    loc.appendChild(document.createTextNode(
      [org.city, org.province, org.region].filter(Boolean).join(' · ') || org.region
    ));
    headText.appendChild(loc);

    var tags = el('div', 'd-tags');
    tags.appendChild(el('span', 'tag tag-cat', CATEGORY_LABELS[org.category] || org.category));
    tags.appendChild(el('span', 'tag', org.region));
    headText.appendChild(tags);
    head.appendChild(headText);
    dialogBody.appendChild(head);

    /* description */
    dialogBody.appendChild(section('About this organization', 'i-mixed',
      el('p', null, org.description || 'No description available.')));

    /* activities */
    if ((org.volunteer_activities || []).length) {
      dialogBody.appendChild(section('What volunteers do', 'i-join',
        stringList(org.volunteer_activities, true)));
    }

    /* animals */
    if ((org.animals || []).length) {
      dialogBody.appendChild(section('Animals they work with', 'i-paw',
        stringList(org.animals, false)));
    }

    /* how to join */
    if (org.how_to_join) {
      dialogBody.appendChild(section('How to join', 'i-check', el('p', null, org.how_to_join)));
    }

    /* requirements */
    dialogBody.appendChild(section('Requirements', 'i-check',
      org.requirements ? el('p', null, org.requirements)
                       : el('p', null, 'Not specified — ask the organization directly when you reach out.')));

    /* contacts */
    var contacts = el('div', 'd-contacts');
    var any = false;
    [
      [org.website, 'Visit website', 'i-globe', ''],
      [org.facebook, 'Facebook page', 'i-facebook', 'icon-facebook'],
      [org.email, org.email ? 'Email them' : '', 'i-mail', '']
    ].forEach(function (row) {
      var href = row[0];
      if (row[1] === 'Email them' && !href) return;
      var built = row[1] ? contactLink(href, row[1], row[2], row[3]) : null;
      if (built) { contacts.appendChild(built); any = true; }
    });

    if (!any) {
      var span = el('span', 'is-null', 'No verified contact link — use the source below.');
      contacts.appendChild(span);
    }
    dialogBody.appendChild(section('Contact & links', 'i-globe', contacts));

    /* meta */
    var meta = el('div', 'd-meta');
    if (isSafeUrl(org.source_url)) {
      var srcWrap = document.createElement('span');
      srcWrap.appendChild(document.createTextNode('Source: '));
      var srcA = document.createElement('a');
      srcA.href = org.source_url;
      srcA.target = '_blank';
      srcA.rel = 'noopener noreferrer';
      srcA.textContent = 'verification source ↗';
      srcWrap.appendChild(srcA);
      meta.appendChild(srcWrap);
    }
    if (org.last_verified) {
      meta.appendChild(el('span', null, 'Last verified: ' + formatDate(org.last_verified)));
    }
    meta.appendChild(el('span', null, 'ID: ' + org.id));
    dialogBody.appendChild(meta);

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    dialogBody.scrollTop = 0;
    dialogClose.focus();
  }

  function closeDialog() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  /* ---------- Events ---------- */

  /* filters */
  var searchTimer = null;
  qInput.addEventListener('input', function () {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(function () { apply(); }, 140);
  });

  form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });

  [regionSel, categorySel, animalsSel].forEach(function (sel) {
    sel.addEventListener('change', function () { apply(); });
  });

  function clearFilters() {
    qInput.value = '';
    regionSel.value = '';
    categorySel.value = '';
    animalsSel.value = '';
    apply();
    qInput.focus();
  }
  resetBtn.addEventListener('click', clearFilters);
  emptyResetBtn.addEventListener('click', clearFilters);

  /* entry detail buttons (event delegation) */
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-open]') : null;
    if (btn) openDialog(btn.getAttribute('data-open'));
  });

  dialogClose.addEventListener('click', closeDialog);
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) closeDialog();   // click on backdrop
  });

  /* smooth scrolling for in-page nav (keeps the hash free for filter state) */
  $$('[data-scroll]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      closeNav();
    });
  });

  /* mobile nav */
  var navToggle = $('#nav-toggle');
  var siteNav = $('#site-nav');

  function closeNav() {
    if (!siteNav) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    /* keep the toggle honest when resizing up to the desktop layout */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 760) closeNav();
    });
  }

  /* react to hash changes made by the browser (back/forward, manual edit) */
  window.addEventListener('hashchange', function () {
    if (writingHash) return;
    if (!restoreFromHash()) {
      // A plain anchor was requested — let it scroll naturally.
      var raw = window.location.hash.slice(1);
      var target = raw && document.getElementById(raw);
      if (target) target.scrollIntoView({ block: 'start' });
    }
  });

  /* ---------- Boot ---------- */
  if (!restoreFromHash()) {
    apply({ sync: false });
  }
})();
