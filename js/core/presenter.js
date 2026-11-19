/* Modo presentación: pasos fijos, clicker/flechas, temporizador y vista de ponente sincronizada.
   La vista de ponente (presenter.html) se comunica con postMessage, que funciona también con file:// */
(function () {
  var LT = window.LT;
  var P = LT.pres = { active: false, i: 0, step: 0, t0: 0, win: null };

  function maxStep(el) {
    var m = 0; LT.$$('[data-step]', el).forEach(function (x) { m = Math.max(m, +x.dataset.step); });
    var s = LT.scenes[el.id]; if (s && s.steps) m = Math.max(m, s.steps);
    return m;
  }
  function applySteps() {
    var el = LT.slides[P.i];
    LT.$$('[data-step]', el).forEach(function (x) { x.classList.toggle('shown', +x.dataset.step <= P.step); });
    var s = LT.scenes[el.id]; if (s && s.step) try { s.step(P.step); } catch (e) { console.error(e); }
  }
  function fit(el) {
    var inner = LT.$('.slide-inner', el); if (!inner) return;
    inner.style.transform = '';
    var cs = getComputedStyle(el), availH = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var availW = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var k = Math.min(1, availH / inner.scrollHeight, availW / inner.scrollWidth);
    inner.style.transform = k < 1 ? 'scale(' + k.toFixed(3) + ')' : '';
  }
  function place(animate) {
    var main = LT.$('#main');
    main.style.transition = animate === false ? 'none' : '';
    main.style.transform = 'translateY(' + (-P.i * innerHeight) + 'px)';
  }
  function bar() {
    var el = LT.slides[P.i], n = LT.slides.length;
    LT.$('#pb-n').textContent = String(P.i + 1).padStart(2, '0') + ' / ' + n + ' · ' + el.dataset.title.toUpperCase();
    LT.$('#pb-prog').style.width = ((P.i + 1) / n * 100) + '%';
    var sp = el.dataset.speaker, t = (LT.TEAM || []).find(function (m) { return m.id === sp; });
    LT.$('#pb-who').innerHTML = t ? '<i style="background:var(' + t.color + ')">' + t.initial + '</i>Habla: ' + t.name.split(' ')[0] : (sp === 'all' ? 'Todo el equipo' : '');
  }

  P.go = function (i, step) {
    i = Math.max(0, Math.min(LT.slides.length - 1, i));
    P.i = i; P.step = step || 0;
    LT.setCurrent(i);
    fit(LT.slides[i]);
    place();
    applySteps(); bar(); sync();
  };
  P.next = function () {
    if (!P.active) return;
    if (P.step < maxStep(LT.slides[P.i])) { P.step++; applySteps(); sync(); if (LT.audio) LT.audio.blip(); }
    else if (P.i < LT.slides.length - 1) P.go(P.i + 1, 0);
  };
  P.prev = function () {
    if (!P.active) return;
    if (P.step > 0) { P.step--; applySteps(); sync(); }
    else if (P.i > 0) P.go(P.i - 1, maxStep(LT.slides[P.i - 1]));
  };
  P.start = function () {
    if (P.active) return;
    P.active = true; document.body.classList.add('pres');
    if (!P.t0) P.t0 = Date.now();
    window.scrollTo(0, 0);
    P.go(Math.max(0, LT.current), 0);
    LT.toast('Modo presentación · flechas para avanzar · S abre la vista de ponente · Esc sale', 2600);
    try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {}); } catch (e) {}
  };
  P.stop = function () {
    if (!P.active) return;
    P.active = false; document.body.classList.remove('pres');
    var main = LT.$('#main'); main.style.transform = ''; main.style.transition = '';
    LT.$$('.slide-inner').forEach(function (x) { x.style.transform = ''; });
    LT.$$('[data-step]').forEach(function (x) { x.classList.remove('shown'); });
    var i = P.i;
    requestAnimationFrame(function () { LT.slides[i].scrollIntoView({ behavior: 'auto' }); LT.current = -1; LT.setCurrent(i); });
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    sync();
  };
  P.toggle = function () { P.active ? P.stop() : P.start(); };
  P.blackout = function () { LT.$('#blackout').classList.toggle('on'); };

  /* Vista de ponente */
  P.openPresenter = function () {
    if (P.win && !P.win.closed) { P.win.focus(); return; }
    P.win = window.open('presenter.html', 'lt-presenter', 'width=1180,height=760');
    if (!P.win) { LT.toast('El navegador bloqueó la ventana emergente. Permitila para usar la vista de ponente.', 3500); return; }
    setTimeout(sync, 600); setTimeout(sync, 1500);
  };
  function sync() {
    if (!P.win || P.win.closed) return;
    var i = P.active ? P.i : Math.max(0, LT.current), el = LT.slides[i], nx = LT.slides[i + 1];
    var notes = (LT.NOTES || {})[el.id] || {};
    try {
      P.win.postMessage({ lt: 1, type: 'state', i: i, n: LT.slides.length, id: el.id, title: el.dataset.title, step: P.step, steps: maxStep(el), speaker: el.dataset.speaker,
        notes: notes, next: nx ? { id: nx.id, title: nx.dataset.title, speaker: nx.dataset.speaker } : null, t0: P.t0, active: P.active,
        team: LT.TEAM, all: LT.slides.map(function (s) { return { id: s.id, title: s.dataset.title, speaker: s.dataset.speaker }; }) }, '*');
    } catch (e) {}
  }
  P.sync = sync;
  LT.on('presenter-sync', sync);
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || !d.lt || d.type !== 'cmd') return;
    if (d.cmd === 'hello') return sync();
    if (!P.active && d.cmd !== 'start') P.start();
    if (d.cmd === 'next') P.next();
    else if (d.cmd === 'prev') P.prev();
    else if (d.cmd === 'goto') P.go(d.i, 0);
    else if (d.cmd === 'black') P.blackout();
    else if (d.cmd === 'start') P.start();
  });

  /* Temporizador */
  setInterval(function () {
    if (!P.t0) return;
    var s = Math.floor((Date.now() - P.t0) / 1000);
    LT.$('#pb-timer').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }, 1000);
  addEventListener('resize', function () { if (P.active) { fit(LT.slides[P.i]); place(false); } });

  /* Clic en la pantalla avanza (como un clicker), salvo sobre controles */
  document.addEventListener('click', function (e) {
    if (!P.active) return;
    if (e.target.closest('button, a, input, select, textarea, label, .panel, .term, svg, .desktop, .presbar, .hud, #console, #lightbox, .overlay, .topo-wrap, .owasp, .fixes, .budget, .team, .rack-col, .plan-view, .portal, .disks, .switch, .atk-list')) return;
    P.next();
  });
})();
