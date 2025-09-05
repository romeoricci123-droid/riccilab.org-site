// nav.js — canonical header behavior (toggle + current-page highlight)
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
    // Mobile toggle
    var btn = document.getElementById('navToggle');
    var nav = document.getElementById('site-nav');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
    }
    if (!nav) return;

    // 1) Primary: filename match (e.g., news.html, team.html, etc.)
    var here = filename(location.href);
    nav.querySelectorAll('a[href]').forEach(function (a) {
      var target = filename(a.getAttribute('href'));
      if (target === here) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });

    // 2) Fallback: if nothing matched, map by page “section” (body[data-page])
    if (!nav.querySelector('[aria-current="page"]')) {
      var pageKey = (document.body.getAttribute('data-page') || '').toLowerCase();
      // Map section keys to their parent tab hrefs
      var parentByKey = {
        // top-level pages
        home: 'index.html',
        research: 'research.html',
        team: 'team.html',
        publications: 'publications.html',
        sponsors: 'sponsors.html',
        news: 'news.html',
        contact: 'contact.html',
        join: 'join.html'
      };
      var parentHref = parentByKey[pageKey];
      if (parentHref) {
        var parentLink = nav.querySelector('a[href$="' + parentHref + '"]');
        if (parentLink) parentLink.setAttribute('aria-current', 'page');
      }
    }
  });
})();
