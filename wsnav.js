/* ProjectPal workspace menu: Dashboard, Resources, Academic Area, Final Project Lab */
(function () {
  var items = [
    ['dashboard.html', '▦', 'Dashboard'],
    ['resources.html', '▤', 'Resources'],
    ['workspace.html', '📖', 'Academic Area'],
    ['final-lab.html', '✦', 'Final Project Lab']
  ];
  var key = function (p) { return (p || '').replace(/\.html$/, ''); };
  var here = key(location.pathname.split('/').pop());
  function side() {
    return items.map(function (i) {
      var on = key(i[0]) === here;
      return '<a href="' + i[0] + '" style="display:flex;gap:.75rem;align-items:center;padding:.75rem 1rem;border-radius:.75rem;font-size:.875rem;text-decoration:none;color:' + (on ? '#fff' : '#E2E8F0') + ';font-weight:' + (on ? 700 : 400) + ';background:' + (on ? 'rgba(255,255,255,.15)' : 'transparent') + '">' + i[1] + ' ' + i[2] + '</a>';
    }).join('');
  }
  function bottom() {
    return items.map(function (i) {
      var on = key(i[0]) === here;
      return '<a href="' + i[0] + '" style="flex:1;text-align:center;padding:.55rem .25rem;font-size:.7rem;text-decoration:none;color:' + (on ? '#1E3A8A' : '#64748B') + ';font-weight:' + (on ? 700 : 500) + '"><span style="display:block;font-size:1.1rem">' + i[1] + '</span>' + i[2] + '</a>';
    }).join('');
  }
  function init() {
    var css = document.createElement('style');
    css.textContent = '#wsBar{display:none}@media(max-width:1023px){#wsBar{display:flex;position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid #E2E8F0;z-index:40}body{padding-bottom:64px}#wsSide{display:none!important}}#wsWrap{display:flex;min-height:100vh}#wsMain{flex:1;min-width:0}';
    document.head.appendChild(css);
    var nav = document.querySelector('aside nav');
    if (nav) {
      nav.innerHTML = side();
    } else {
      var wrap = document.createElement('div'); wrap.id = 'wsWrap';
      var aside = document.createElement('aside'); aside.id = 'wsSide';
      aside.style.cssText = 'width:256px;flex-shrink:0;padding:1.5rem;background:#0F172A;color:#fff;position:sticky;top:0;height:100vh';
      aside.innerHTML = '<a href="welcome-hub.html" style="color:#fff;font-weight:700;font-size:1.1rem;text-decoration:none">ProjectPal</a><p style="margin:2rem 0 .75rem;font-size:.7rem;letter-spacing:.15em;color:#99F6E4;font-weight:600">WORKSPACE</p><nav>' + side() + '</nav>';
      var main = document.createElement('div'); main.id = 'wsMain';
      while (document.body.firstChild) main.appendChild(document.body.firstChild);
      wrap.appendChild(aside); wrap.appendChild(main); document.body.appendChild(wrap);
    }
    var bar = document.createElement('nav'); bar.id = 'wsBar'; bar.innerHTML = bottom(); document.body.appendChild(bar);
    // Dashboard covers every workspace area
    if (here === 'dashboard') {
      var host = document.querySelector('.dot-grid');
      if (host) {
        var d = [['resources.html', '▤', 'Resources', 'Books, materials and similar projects to learn from.'], ['workspace.html', '📖', 'Academic Area', 'Where the real work happens: scope, literature, methodology and drafting.'], ['final-lab.html', '✦', 'Final Project Lab', 'Check readiness and export when everything is done.']];
        var sec = document.createElement('section'); sec.className = 'mt-8';
        sec.innerHTML = '<h2 class="text-xl font-extrabold text-ink">Your workspace</h2><div class="mt-4 grid gap-4 sm:grid-cols-3">' + d.map(function (x) {
          return '<a href="' + x[0] + '" class="rounded-xl border border-slate-200 bg-white p-5 shadow-soft hover:border-ocean"><p class="text-2xl">' + x[1] + '</p><h3 class="mt-2 font-bold text-ink">' + x[2] + '</h3><p class="mt-1 text-sm text-slate-500">' + x[3] + '</p></a>';
        }).join('') + '</div>';
        host.appendChild(sec);
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
