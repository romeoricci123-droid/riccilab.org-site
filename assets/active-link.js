// /assets/active-link.js
(function(){
  function normalizePath(p) {
    p = (p || '').split('#')[0].split('?')[0];
    if (!p.startsWith('/')) p = '/' + p;
    p = p.replace(/\/{2,}/g, '/');
    if (p === '/' || p === '') p = '/index.html';
    return p;
  }
  function basename(p) {
    var b = p.substring(p.lastIndexOf('/') + 1);
    return b || 'index.html';
  }
  function markActive() {
    var current = normalizePath(location.pathname);
    var currentBase = basename(current);

    var desktopLinks = document.querySelectorAll('#site-nav a');
    var mobileLinks  = document.querySelectorAll('.mnav-panel a'); // existiert später

    function apply(links){
      links.forEach(function(a){
        var href = a.getAttribute('href') || '';
        var target = normalizePath(href);
        var targetBase = basename(target);
        if (target === current || targetBase === currentBase) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      });
    }
    if (desktopLinks.length) apply(desktopLinks);
    if (mobileLinks.length)  apply(mobileLinks);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markActive);
  } else {
    markActive();
  }
})();
