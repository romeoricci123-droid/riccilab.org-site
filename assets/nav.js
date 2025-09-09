// nav.js — canonical header behavior (toggle + current-page highlight + a11y closes)
(function () {
  function filename(url) {
    try {
      const u = new URL(url, location.href);
      const last = u.pathname.split('/').pop();
      return (last || 'index.html').toLowerCase();
    } catch {
      return 'index.html';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('navToggle');
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    // --- Toggle
    if (btn) {
      btn.addEventListener('click', function () {
        const open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
    }

    // --- Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (btn) btn.focus();
      }
    });

    // --- Close on outside click (when open)
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      const header = nav.closest('header');
      if (header && !header.contains(e.target)) {
        nav.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    // --- Guard on resize: collapse menu when leaving mobile
    let lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      const w = window.innerWidth;
      // If we grew (likely leaving the mobile breakpoint), ensure closed
      if (w > 760 && lastW <= 760 && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
      lastW = w;
    });

    // --- Current page highlight (primary: filename match)
    const here = filename(location.href);
    nav.querySelectorAll('a[href]').forEach(function (a) {
      const target = filename(a.getAttribute('href'));
      if (target === here) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });

    // --- Fallback: map by body[data-page]
    if (!nav.querySelector('[aria-current="page"]')) {
      const pageKey = (document.body.getAttribute('data-page') || '').toLowerCase();
      const parentByKey = {
        home: 'index.html',
        research: 'research.html',
        team: 'team.html',
        publications: 'publications.html',
        sponsors: 'sponsors.html',
        news: 'news.html',
        contact: 'contact.html',
        join: 'join.html'
      };
      const parentHref = parentByKey[pageKey];
      if (parentHref) {
        const link = nav.querySelector('a[href$="' + parentHref + '"]');
        if (link) link.setAttribute('aria-current', 'page');
      }
    }
  });
})();
