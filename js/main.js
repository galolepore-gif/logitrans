/* Arranque, rutas y atajos.
   Navegación libre por defecto (índice lateral, buscador, enlaces). La presentación es un modo aparte. */
(function () {
  var LT = window.LT;
  var app = LT.$('#app');

  /* ---------- Rutas ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, ''), p = h.split('/');
    app.classList.remove('menu');
    if (LT.Tracer && LT.Tracer.isPop()) LT.Tracer.closePop();
    var key = 'home';
    if (p[0] === 's' && p[1]) {
      var r = LT.resolveSec(p[1], p[2]);
      if (r && (r[0] !== p[1] || (r[1] || '') !== (p[2] || ''))) { history.replaceState(null, '', '#/s/' + r[0] + (r[1] ? '/' + r[1] : '')); p = ['s', r[0], r[1]]; }
      LT.renderSection(p[1], p[2]); key = p[1];
    }
    else if (p[0] === 'tracer') { LT.Tracer.render(p[1]); key = 'tracer'; }
    else if (p[0] === 'presupuesto') { LT.renderBudget(); key = 'presupuesto'; }
    else { LT.renderHome(); key = 'home'; }
    app.classList.toggle('full', key === 'home' || key === 'tracer' || key === 'presupuesto');
    app.classList.toggle('is-tracer', key === 'tracer');
    LT.markToc(key);
    LT.$$('.top nav a').forEach(function (a) {
      var n = a.dataset.nav;
      a.classList.toggle('on', n === key || (n === 'planos' && key === '0') || (n === 'home' && /^\d/.test(key) && key !== '0'));
    });
    var S = LT.SECTIONS[key];
    document.title = S ? (key === '0' ? '0' : key) + ' · ' + S.t + ' · LogiTrans' : key === 'tracer' ? 'LogiTrans Tracer' : key === 'presupuesto' ? 'Presupuesto · LogiTrans' : 'LogiTrans · Memoria del proyecto de red';
    LT.current = key;
    if (!p[2]) LT.$('#view').focus({ preventScroll: true });
    if (key !== 'tracer') LT.$$('#tw-layer .twin').forEach(function (x) { x.remove(); });
  }
  LT.go = function (h) { if (location.hash === h) route(); else location.hash = h; };

  /* ---------- Acciones ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.dataset.act;
    if (act === 'menu') { app.classList.toggle('menu'); }
    else if (act === 'search') { LT.palette.open(); }
    else if (act === 'present') { LT.Present.open(); }
    else if (act === 'present-here') { LT.Present.open(LT.current); }
    else if (act === 'help') { e.preventDefault(); LT.$('#help').classList.add('open'); }
    else if (act === 'help-close') { LT.$('#help').classList.remove('open'); }
    else return;
    if (a.tagName === 'A') e.preventDefault();
  });
  LT.$('#help').addEventListener('click', function (e) { if (e.target.id === 'help') e.currentTarget.classList.remove('open'); });
  LT.$('#view').addEventListener('click', function (e) { if (app.classList.contains('menu') && !e.target.closest('.side')) app.classList.remove('menu'); });

  /* ---------- Teclado ---------- */
  function typing(e) { var t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); }
  document.addEventListener('keydown', function (e) {
    if (LT.Present && LT.Present.isOpen()) return; // el modo presentación tiene sus teclas
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); LT.palette.isOpen ? LT.palette.close() : LT.palette.open(); return; }
    if (e.key === 'Escape') {
      if (LT.lightbox.isOpen) return LT.lightbox.close();
      if (LT.palette.isOpen) return LT.palette.close();
      if (LT.$('#help').classList.contains('open')) return LT.$('#help').classList.remove('open');
      if (LT.Tracer.isPop()) return LT.Tracer.closePop();
      var tw = LT.$$('#tw-layer .twin'); if (tw.length && !typing(e)) { tw.sort(function (a, b) { return (+b.style.zIndex) - (+a.style.zIndex); })[0].remove(); return; }
      if (app.classList.contains('menu')) return app.classList.remove('menu');
      return;
    }
    if (typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (LT.lightbox.isOpen || LT.palette.isOpen || LT.Tracer.isPop()) return;
    var k = e.key;
    if (k === 'p' || k === 'P') { e.preventDefault(); LT.Present.open(/^\d/.test(LT.current) ? LT.current : null); }
    else if (k === 't' || k === 'T') { LT.go('#/tracer'); }
    else if (k === '?') { LT.$('#help').classList.add('open'); }
    else if (k === '/') { e.preventDefault(); LT.palette.open(); }
    else if (k === ']' || k === '[') {
      var i = LT.ORDER.indexOf(LT.current);
      var n = k === ']' ? (i < 0 ? 0 : Math.min(LT.ORDER.length - 1, i + 1)) : (i <= 0 ? -1 : i - 1);
      LT.go(n < 0 ? '#/' : '#/s/' + LT.ORDER[n]);
    }
    else if (k === 'n' && LT.current === 'tracer') { LT.Tracer.nextStep(); }
  });

  /* ---------- Arranque ---------- */
  LT.buildToc();
  window.addEventListener('hashchange', route);
  route();
})();
