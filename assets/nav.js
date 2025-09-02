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

    // aria-current on the active link
    var here = filename(location.href);
    document.querySelectorAll('#site-nav a[href]').forEach(function (a) {
      var target = filename(a.getAttribute('href'));
      if (target === here) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  });
})();
