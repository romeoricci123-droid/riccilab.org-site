
/* Maintenance gate — production only */
(function () {
  if (location.hostname !== 'riccilab.org') return; // skip on localhost and Live Server
  try {
    var path = location.pathname;
    var isHome = path === "/" || path === "/index.html";
    var isMaintenance = path === "/maintenance.html";
    var isAsset = /^(\/assets\/|\/images\/|\/favicon)/.test(path);
    if (!isHome && !isMaintenance && !isAsset) {
      location.replace("/maintenance.html");
    }
  } catch (e) {}
})();
/* assets/nav.js */
(function () {
  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  var mq = window.matchMedia('(min-width: 761px)');
  if (mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      if (e.matches) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  } else if (mq.addListener) {
    mq.addListener(function (e) {
      if (e.matches) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

/* Force the "Funding" label for the sponsors link on every page */
document.addEventListener('DOMContentLoaded', function () {
  var toKey = function (s) { return (s || '').trim().toLowerCase(); };

  var relabel = function (root) {
    var links = root.querySelectorAll('a[href$="sponsors.html"], a[href$="/sponsors.html"]');
    links.forEach(function (a) {
      // Update visible text while keeping any icons
      var hadTextNode = false;
      a.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          hadTextNode = true;
          if (toKey(n.nodeValue) !== 'funding') n.nodeValue = 'Funding';
        }
      });
      if (!hadTextNode && toKey(a.textContent) === 'sponsors') {
        // Safe fallback if the link has only text
        a.textContent = 'Funding';
      }

      // Accessibility and tooltip
      if (toKey(a.getAttribute('aria-label')) !== 'funding') {
        a.setAttribute('aria-label', 'Funding');
      }
      if (toKey(a.getAttribute('title')) !== 'funding') {
        a.setAttribute('title', 'Funding');
      }
    });
  };

  // Initial pass
  relabel(document);

  // Catch late inserts
  var mo = new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1) relabel(n);
      });
    });
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
});
/* External links: open in new tab with rel safety */
document.addEventListener('DOMContentLoaded', function () {
  var here = location.hostname.replace(/^www\./, '');
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    try {
      var u = new URL(a.href);
      var host = u.hostname.replace(/^www\./, '');
      if (host && host !== here) {
        a.setAttribute('target', '_blank');
        var rel = (a.getAttribute('rel') || '').split(/\s+/);
        if (rel.indexOf('noopener') === -1) rel.push('noopener');
        if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
        a.setAttribute('rel', rel.join(' ').trim());
      }
    } catch (e) { /* ignore invalid URLs */ }
  });
});
/* Mark current page in the nav */
document.addEventListener('DOMContentLoaded', function () {
  var file = location.pathname.split('/').pop() || 'index.html';
  var link = document.querySelector('nav a[href$="' + file + '"]');
  if (link && !link.hasAttribute('aria-current')) {
    link.setAttribute('aria-current', 'page');
  }
});
/* Highlight hash target (e.g., news.html#2025-09-30-a) */
document.addEventListener('DOMContentLoaded', function () {
  // inject minimal CSS once
  (function () {
    var style = document.createElement('style');
    style.textContent =
      '.hash-highlight{outline:3px solid rgba(0,0,0,.25);box-shadow:0 0 0 6px rgba(0,0,0,.06);transition:outline-color .4s ease}';
    document.head.appendChild(style);
  })();

  function highlightTarget() {
    var id = decodeURIComponent(location.hash.replace('#', ''));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;

    // reset then apply highlight
    el.classList.remove('hash-highlight');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('hash-highlight');

    // focus for accessibility, but do not jump twice
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });

    // smooth scroll to top of the entry
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // fade the outline after a few seconds
    setTimeout(function () { el.classList.remove('hash-highlight'); }, 4000);
  }

  if (location.hash) highlightTarget();
  window.addEventListener('hashchange', highlightTarget);
});
/* Replace visible em dashes with a middle dot for consistency */
document.addEventListener('DOMContentLoaded', function () {
  var skipTags = new Set(['SCRIPT','STYLE','CODE','PRE','NOSCRIPT','TEXTAREA','SVG']);
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      if (!n.nodeValue || n.nodeValue.indexOf('—') === -1) return NodeFilter.FILTER_REJECT;
      var p = n.parentNode;
      if (!p || skipTags.has(p.nodeName)) return NodeFilter.FILTER_REJECT;
      // avoid changing aria-live regions or hidden elements
      var s = window.getComputedStyle(p);
      if (s && (s.visibility === 'hidden' || s.display === 'none')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function (t) {
    t.nodeValue = t.nodeValue.replace(/ *— */g, ' · ');
  });
});
/* Mobile menu UX: close on Esc, outside click, link click; lock scroll when open */
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  // Add a tiny style once for scroll lock
  if (!document.getElementById('navScrollLockStyle')) {
    var style = document.createElement('style');
    style.id = 'navScrollLockStyle';
    style.textContent = 'body.nav-open{overflow:hidden}';
    document.head.appendChild(style);
  }

  // Keep body scroll lock in sync with nav state
  function syncLock() {
    if (nav.classList.contains('open')) document.body.classList.add('nav-open');
    else document.body.classList.remove('nav-open');
  }
  syncLock();
  new MutationObserver(syncLock).observe(nav, { attributes: true, attributeFilter: ['class'] });

  // Close helpers
  function closeNav() {
    if (!nav.classList.contains('open')) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  // Close on Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('open')) return;
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeNav();
  });

  // Close after choosing a link
  nav.addEventListener('click', function (e) {
    var a = e.target && e.target.closest('a');
    if (a) closeNav();
  });
});
/* Highlight hash target (e.g., news.html#2025-09-30-a) with reduced-motion support */
document.addEventListener('DOMContentLoaded', function () {
  // inject minimal CSS once
  (function () {
    var style = document.createElement('style');
    style.textContent =
      '.hash-highlight{outline:3px solid rgba(0,0,0,.25);box-shadow:0 0 0 6px rgba(0,0,0,.06);transition:outline-color .4s ease}';
    document.head.appendChild(style);
  })();

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function highlightTarget() {
    var id = decodeURIComponent(location.hash.replace('#', ''));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;

    el.classList.remove('hash-highlight');
    void el.offsetWidth;
    el.classList.add('hash-highlight');

    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });

    // Smooth scroll only if the user did not request reduced motion
    if (prefersReduced) el.scrollIntoView({ block: 'start' });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(function () { el.classList.remove('hash-highlight'); }, 4000);
  }

  if (location.hash) highlightTarget();
  window.addEventListener('hashchange', highlightTarget);
});
