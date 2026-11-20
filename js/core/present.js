/* Modo presentación: un modo aparte, a pantalla completa, sobre la misma memoria.
   Teclas: flechas o espacio, Inicio/Fin, G (todas), B (negro), S (presentador), Esc (salir al mismo punto). */
(function () {
  var LT = window.LT;
  var deck = null, slides = [], cur = 0, step = 0, open = false, bc = null, t0 = 0;
  try { bc = new BroadcastChannel('lt-present'); } catch (e) { bc = null; }

  function stageHtml(s, i) {
    var h = '<section class="slide k-' + s.kind + '" data-i="' + i + '"><div class="sl-in">';
    if (s.kind === 'cover') {
      h += '<div class="cv grid-bg"><span class="kick">ASIX2C · Proyecto final · Institut F. Vidal i Barraquer</span><h1>Logi<em>Trans</em></h1><p class="sl-lead">Infraestructura de red para una empresa de logística: Barcelona y Zaragoza, una sola red.</p>' +
        '<div class="cv-team">' + LT.TEAM.map(function (t) { return '<span><b>' + t.name + '</b><small>' + t.role + '</small></span>'; }).join('') + '</div>' +
        '<div class="cv-facts"><span><b>350</b> puestos BCN</span><span><b>150</b> puestos ZGZ</span><span><b>6</b> VLAN</span><span><b>105</b> equipos en PT</span></div></div>';
    } else if (s.kind === 'agenda') {
      h += '<span class="kick">Índice</span><h2>Lo que vamos a ver</h2><ol class="ag">' + LT.CHAPTERS.map(function (c) { return '<li><b>' + c.n + '</b><span>' + c.t + '</span><small>' + c.s.length + ' apartado' + (c.s.length > 1 ? 's' : '') + '</small></li>'; }).join('') + '</ol>';
    } else if (s.kind === 'chapter') {
      h += '<div class="chd"><span class="chd-n">' + s.ch.n + '</span><div><span class="kick">Capítulo</span><h2>' + s.ch.t + '</h2><ul>' + s.ch.s.map(function (id) { var x = LT.SECTIONS[id]; return x ? '<li><i>' + id + '</i>' + x.t + '</li>' : ''; }).join('') + '</ul></div></div>';
    } else if (s.kind === 'sec') {
      var sec = s.sec;
      h += '<div class="ss"><div class="ss-l"><span class="ss-n">' + (s.id === '0' ? '0.' : s.id) + '</span><h2>' + sec.t + '</h2>' + (sec.lead ? '<p class="sl-lead">' + sec.lead + '</p>' : '') +
        '<ol class="pts">' + (sec.subs || []).slice(0, 7).map(function (x, k) { return '<li data-st="' + (k + 1) + '"><i>' + x[0] + '</i>' + x[1] + '</li>'; }).join('') + ((sec.subs || []).length > 7 ? '<li data-st="7" class="more">y ' + ((sec.subs.length) - 7) + ' puntos más en la memoria</li>' : '') + '</ol>' +
        (sec.sc ? '<p class="ss-sc"><span class="lbl">En el Tracer</span>' + sec.sc[1] + '</p>' : '') + '</div><div class="ss-r"><div class="vis">' + s.panes.map(function (p, k) { return p == null ? '' : '<div class="vp" data-vp="' + k + '"></div>'; }).join('') + '</div></div></div>';
    } else if (s.kind === 'budget') {
      var T = LT.BUDGET_TOTAL;
      h += '<span class="kick">Presupuesto</span><h2>1.034.758 € con IVA</h2><div class="bd">' + LT.BUDGET.slice().sort(function (a, b) { return b[1] - a[1]; }).map(function (r) { return '<div class="bd-r"><span>' + r[0] + '</span><i style="--w:' + (r[1] / LT.BUDGET[0][1] * 100).toFixed(1) + '%"></i><b>' + LT.fmt(r[1]) + ' €</b></div>'; }).join('') + '</div><p class="sl-lead">Base ' + LT.fmt(T.net) + ' € · IVA ' + LT.fmt(T.iva, 2) + ' €</p>';
    } else if (s.kind === 'team') {
      h += '<span class="kick">Equipo ASIX2C 0379</span><h2>Quién hizo qué</h2><div class="tm">' + LT.TEAM.map(function (t) { return '<div><span class="av" style="--c:var(' + t.color + ')">' + t.initial + '</span><b>' + t.name + '</b><small>' + t.role + '</small><p>' + t.does + '</p></div>'; }).join('') + '</div>';
    } else if (s.kind === 'end') {
      h += '<div class="cv grid-bg end"><span class="kick">Gracias</span><h1>¿Preguntas?</h1><p class="sl-lead">Toda la memoria, el simulador y las capturas siguen disponibles en esta web.</p></div>';
    }
    h += '</div><footer class="sl-foot"><span>LOGITRANS</span><span>' + LT.esc(s.t) + '</span><span>' + (i + 1) + ' / ' + slides.length + '</span></footer></section>';
    return h;
  }
  /* Pieza visual de cada subapartado: su widget, si no su figura, sus comprobaciones con la captura o su tabla. */
  function subPane(sub) {
    var d = document.createElement('div'); d.innerHTML = sub[2] || '';
    var w = LT.$('.w[data-w]', d); if (w) return w.outerHTML;
    var f = LT.$('figure.fig', d); if (f) return f.outerHTML;
    var c = LT.$$('.chk', d);
    if (c.length) return '<div class="vp-chk">' + c.slice(0, 4).map(function (x) { return x.outerHTML; }).join('') + (c.length > 4 ? '<p class="vp-more">' + (LT.lang === 'ca' ? '+ ' + (c.length - 4) + ' comprovacions més a la memòria' : '+ ' + (c.length - 4) + ' comprobaciones más en la memoria') + '</p>' : '') + '</div>';
    var e = LT.$('.ev-grid', d); if (e) return e.outerHTML;
    var t = LT.$('.tbl-wrap', d) || LT.$('table', d);
    if (t) return '<div class="vp-tbl">' + t.outerHTML + '</div>';
    return null;
  }
  function subNote(sub) {
    var d = document.createElement('div'); d.innerHTML = sub[2] || '';
    var p = LT.$('p', d), tx = p ? p.textContent.replace(/\s+/g, ' ').trim() : '';
    return sub[0] + ' · ' + sub[1] + (tx ? '. ' + (tx.length > 320 ? tx.slice(0, 317) + '…' : tx) : '');
  }
  function build() {
    slides = LT.buildSlides();
    slides.forEach(function (s) {
      if (s.kind !== 'sec') return;
      var subs = (s.sec.subs || []).slice(0, s.steps);
      s.panes = [s.vis ? LT.D.w(s.vis.w, s.vis.o) : null].concat(subs.map(subPane));
      s.stepNotes = [s.notes].concat(subs.map(subNote));
    });
    deck = LT.$('#deck');
    deck.innerHTML = '<div class="dk-stage"><div class="dk-frame"></div></div><div class="dk-bar"><i></i></div>' +
      '<div class="dk-ctl"><button data-k="prev" aria-label="Anterior">‹</button><span class="dk-n"></span><button data-k="next" aria-label="Siguiente">›</button><button data-k="grid">Todas <kbd>G</kbd></button><button data-k="pres">Presentador <kbd>S</kbd></button><button data-k="exit">Salir <kbd>Esc</kbd></button></div>' +
      '<div class="dk-grid"></div><div class="dk-black"></div>';
    LT.$('.dk-frame', deck).innerHTML = slides.map(stageHtml).join('');
    LT.$('.dk-grid', deck).innerHTML = slides.map(function (s, i) { return '<button data-go="' + i + '"><i>' + (i + 1) + '</i><b>' + LT.esc(s.t) + '</b></button>'; }).join('');
    LT.$$('.dk-ctl button', deck).forEach(function (b) { b.onclick = function () { var k = b.dataset.k; if (k === 'prev') prev(); if (k === 'next') next(); if (k === 'grid') deck.classList.toggle('grid'); if (k === 'pres') presenter(); if (k === 'exit') close(); }; });
    LT.$$('.dk-grid button', deck).forEach(function (b) { b.onclick = function () { deck.classList.remove('grid'); go(+b.dataset.go, 0); }; });
    fit();
  }
  function fit() { if (!deck) return; var f = LT.$('.dk-frame', deck), k = Math.min(innerWidth / 1600, (innerHeight - 8) / 900); f.style.transform = 'translate(-50%,-50%) scale(' + k + ')'; }
  function go(i, st) {
    cur = Math.max(0, Math.min(slides.length - 1, i)); step = st || 0;
    LT.$$('.slide', deck).forEach(function (el, k) { el.classList.toggle('on', k === cur); el.classList.toggle('past', k < cur); });
    var el = LT.$('.slide.on', deck), s = slides[cur];
    paintStep();
    LT.$('.dk-n', deck).textContent = (cur + 1) + ' / ' + slides.length;
    LT.$('.dk-bar i', deck).style.width = ((cur + 1) / slides.length * 100) + '%';
    if (s.kind === 'sec') history.replaceState(null, '', '#/s/' + s.id);
    sync();
  }
  function paintStep() {
    var el = LT.$('.slide.on', deck), s = slides[cur];
    LT.$$('[data-st]', el).forEach(function (x) { x.classList.toggle('in', +x.dataset.st <= step); x.classList.toggle('now', +x.dataset.st === step); });
    if (s.kind !== 'sec') return;
    /* Un subapartado sin pieza propia sigue mostrando la última que hubo */
    var k = step; while (k > 0 && s.panes[k] == null) k--;
    LT.$$('.vp', el).forEach(function (vp) {
      var on = +vp.dataset.vp === k;
      if (on && !vp.dataset.done) { vp.dataset.done = 1; vp.innerHTML = s.panes[k]; LT.hydrate(vp); }
      vp.classList.toggle('on', on);
    });
    var vis = LT.$('.vis', el); if (vis) vis.scrollTop = 0;
  }
  function next() { var s = slides[cur]; if (s.steps && step < s.steps) { step++; paintStep(); sync(); return; } if (cur < slides.length - 1) go(cur + 1, 0); }
  function prev() { if (step > 0) { step--; paintStep(); sync(); return; } if (cur > 0) { var p = slides[cur - 1]; go(cur - 1, p.steps || 0); } }
  function sync() {
    if (!bc) return;
    var s = slides[cur], n = slides[cur + 1];
    bc.postMessage({ t: 'state', i: cur, n: slides.length, step: step, steps: s.steps || 0, title: s.t, notes: (s.stepNotes && s.stepNotes[step]) || s.notes || '', next: n ? n.t : 'Fin', t0: t0 });
  }
  function presenter() { var w = window.open('presenter.html', 'lt-presenter', 'width=1100,height=720'); if (!w) LT.toast('El navegador bloqueó la ventana del presentador.'); setTimeout(sync, 800); }
  function key(e) {
    if (!open) return;
    if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Escape') e.target.blur(); return; }
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0, 0);
    else if (k === 'End') go(slides.length - 1, 0);
    else if (k === 'g' || k === 'G') deck.classList.toggle('grid');
    else if (k === 'b' || k === 'B' || k === '.') deck.classList.toggle('black');
    else if (k === 's' || k === 'S') presenter();
    else if (k === 'Escape') { if (deck.classList.contains('grid')) deck.classList.remove('grid'); else if (LT.lightbox.isOpen) LT.lightbox.close(); else close(); }
    else return;
    e.stopPropagation();
  }
  function openDeck(at) {
    if (!deck || !LT.$('.slide', deck)) build();
    open = true; t0 = t0 || Date.now();
    deck.classList.add('open'); deck.setAttribute('aria-hidden', 'false'); document.body.classList.add('presenting');
    var i = 0;
    if (at) slides.forEach(function (s, k) { if (s.id === at && s.kind === 'sec') i = k; });
    go(i, 0);
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () { });
  }
  function close() {
    open = false; deck.classList.remove('open', 'grid', 'black'); deck.setAttribute('aria-hidden', 'true'); document.body.classList.remove('presenting');
    if (document.fullscreenElement) document.exitFullscreen().catch(function () { });
    var s = slides[cur];
    if (s && s.kind === 'sec') LT.go('#/s/' + s.id); else LT.go('#/');
  }
  if (bc) bc.onmessage = function (m) { var d = m.data; if (!open || !d) return; if (d.t === 'next') next(); if (d.t === 'prev') prev(); if (d.t === 'go') go(d.i, 0); if (d.t === 'hello') sync(); };
  window.addEventListener('keydown', key, true);
  window.addEventListener('resize', fit);
  LT.Present = { open: openDeck, close: close, isOpen: function () { return open; } };
})();
