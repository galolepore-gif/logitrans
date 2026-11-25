/* Estructura de la memoria, ayudantes para escribir el contenido y renderizado de cada apartado.
   El índice sigue el documento final de la memoria (puntos 0 a 6), sin saltarse ninguno. */
(function () {
  var LT = window.LT;
  LT.CHAPTERS = [
    { n: '0', t: 'Planos de las instalaciones', s: ['0'] },
    { n: '2', t: 'Infraestructura física', s: ['2.A1', '2.A2', '2.B1', '2.B2', '2.B3', '2.C'] },
    { n: '3', t: 'Direccionamiento y enrutamiento', s: ['3.A1', '3.A2', '3.B', '3.C1', '3.C2', '3.C3'] },
    { n: '4', t: 'Seguridad de la red', s: ['4.A1', '4.A2', '4.A3', '4.B1', '4.B2', '4.B3'] },
    { n: '5', t: 'Servicios', s: ['5.A1', '5.A2', '5.A3', '5.B1', '5.B2', '5.C1', '5.C2', '5.D', '5.E'] },
    { n: '6', t: 'Auditoría y mitigación', s: ['6.1', '6.2', '6.3'] }
  ];
  LT.SECTIONS = {};
  LT.ORDER = [];
  LT.CHAPTERS.forEach(function (c) { c.s.forEach(function (id) { LT.ORDER.push(id); }); });
  LT.sec = function (def) { LT.SECTIONS[def.id] = def; };
  /* Acepta cualquier forma razonable de enlace: «3» (capítulo), «3.c1» (minúsculas), «3.C1.2» (punto dentro de un apartado).
     Devuelve [apartado, punto] o null. */
  LT.resolveSec = function (raw, sub) {
    if (!raw) return null;
    var id = decodeURIComponent(raw).trim().toUpperCase().replace(/\.$/, '');
    if (LT.SECTIONS[id]) return [id, sub];
    for (var i = 0; i < LT.CHAPTERS.length; i++) if (LT.CHAPTERS[i].n === id) return [LT.CHAPTERS[i].s[0], null];
    var best = null;
    LT.ORDER.forEach(function (k) { if (id.indexOf(k + '.') === 0 && (!best || k.length > best.length)) best = k; });
    if (best) return [best, sub || id];
    return null;
  };
  LT.chapterOf = function (id) { for (var i = 0; i < LT.CHAPTERS.length; i++) if (LT.CHAPTERS[i].s.indexOf(id) >= 0) return LT.CHAPTERS[i]; };

  /* ---------- Ayudantes para escribir contenido ---------- */
  var esc = function (s) { return LT.esc(s); };
  var tblN = 0;
  var D = LT.D = {
    p: function () { return [].slice.call(arguments).map(function (t) { return '<p>' + t + '</p>'; }).join(''); },
    ul: function (items) { return '<ul>' + items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>'; },
    ol: function (items) { return '<ol>' + items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>'; },
    h: function (t) { return '<h3>' + t + '</h3>'; },
    /* Tabla: cabecera, filas, pie («Tabla N. …»), opciones {mono:[índices], cls} */
    tbl: function (head, rows, cap, o) {
      o = o || {};
      var mono = o.mono || [];
      var h = '<div class="tbl-wrap"><table class="t' + (o.cls ? ' ' + o.cls : '') + '"><thead><tr>' + head.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>';
      rows.forEach(function (r) {
        var tot = r[0] && String(r[0]).indexOf('!') === 0;
        h += '<tr' + (tot ? ' class="tot"' : '') + '>' + r.map(function (c, i) { c = String(c); if (i === 0 && tot) c = c.slice(1); return '<td' + (mono.indexOf(i) >= 0 ? ' class="m"' : '') + '>' + c + '</td>'; }).join('') + '</tr>';
      });
      h += '</tbody></table></div>';
      if (cap) h = h.replace('</table></div>', '</table></div><div class="tbl-cap">' + cap + '</div>');
      return h;
    },
    note: function (txt, kind, title) {
      var t = title || { lim: 'Limitación del simulador', fix: 'Corrección', info: 'Nota' }[kind || 'info'] || 'Nota';
      return '<div class="note ' + (kind || '') + '"><b class="t">' + t + '</b><div>' + txt + '</div></div>';
    },
    /* Widget interactivo */
    w: function (name, opts) { return '<div class="w wide" data-w="' + name + '"' + (opts ? " data-o='" + esc(JSON.stringify(opts)).replace(/'/g, '&#39;') + "'" : '') + '></div>'; },
    /* Comprobación: equipo, comando, qué muestra, número(s) de captura */
    chk: function (dev, cmd, txt, ev, run) {
      var evs = [].concat(ev || []);
      var first = evs.length && LT.EVIDENCE[evs[0]];
      var data = ' data-dev="' + esc(dev) + '" data-cmd="' + esc(cmd) + '"' + (run ? ' data-run="' + esc(run) + '"' : '') + ' data-ev="' + evs.join(',') + '"';
      return '<div class="chk"' + data + '><div class="c-body"><div class="c-top"><span class="c-dev">' + esc(dev) + '</span><span class="c-cmd">' + esc(cmd) + '</span></div><p>' + txt + '</p><div class="c-act"></div></div>' +
        (first ? '<div class="c-img" style="background-image:url(' + first.src + ')"><span>' + (LT.lang === 'ca' ? 'IMATGE ' : 'IMAGEN ') + evs.map(function (n) { return LT.EVIDENCE[n] ? LT.EVIDENCE[n].num : n; }).join(' · ') + '</span></div>' : '') + '</div>';
    },
    fig: function (n, cap) {
      var e = LT.EVIDENCE[n]; if (!e) return '';
      return '<figure class="fig"><div class="fig-frame" data-evn="' + n + '"><img src="' + e.src + '" alt="' + esc(e.txt) + '" loading="lazy"></div><figcaption class="figcap"><span>FIG. ' + e.num + ' · ' + esc(cap || e.txt) + '</span><span>' + (LT.lang === 'ca' ? 'Imatge ' + e.num + ' de la memòria' : 'Imagen ' + e.num + ' de la memoria') + '</span></figcaption></figure>';
    },
    evs: function (list) {
      return '<div class="ev-grid">' + list.map(function (n) { var e = LT.EVIDENCE[n]; return e ? '<button data-evn="' + n + '" data-evl="' + list.join(',') + '"><img src="' + e.src + '" alt="" loading="lazy"><span>' + e.num + ' · ' + esc(e.txt) + '</span></button>' : ''; }).join('') + '</div>';
    },
    vl: function (id) { return '<span class="vl" style="background:var(--v' + id + ')">' + id + '</span>'; },
    sc: function (id, label) { return '<button class="link" data-sc="' + id + '">' + (label || 'Reproducir en el Tracer') + '</button>'; }
  };

  /* ---------- Renderizado de un apartado ---------- */
  LT.renderSection = function (id, subId) {
    var S = LT.SECTIONS[id];
    var view = LT.$('#view');
    if (!S) {
      view.innerHTML = '<div class="doc"><div class="doc-main"><header class="doc-head"><span class="num">?</span><h1>Este punto no existe</h1><p class="lead">El enlace apunta a «' + LT.esc(id) + '». Elegí un apartado del índice o volvé a la portada.</p></header><p><a class="btn sun" href="#/">Ir a la portada</a></p></div></div>';
      return;
    }
    var ch = LT.chapterOf(id), i = LT.ORDER.indexOf(id);
    var prev = LT.SECTIONS[LT.ORDER[i - 1]], next = LT.SECTIONS[LT.ORDER[i + 1]];
    var h = '<div class="doc"><article class="doc-main">';
    h += '<header class="doc-head"><div class="crumbs"><a href="#/">Inicio</a><span>/</span><a href="#/s/0">Memoria</a><span>/</span><span>' + ch.n + ' · ' + ch.t + '</span></div>';
    h += '<span class="num">' + (id === '0' ? '0.' : id) + '</span><h1>' + S.t + '</h1>';
    if (S.lead) h += '<p class="lead">' + S.lead + '</p>';
    if (S.meta) h += '<div class="meta">' + S.meta + '</div>';
    h += '</header>';
    (S.subs || []).forEach(function (s) {
      h += '<section class="sub" id="s-' + s[0].replace(/\./g, '-') + '"><h2><small>' + s[0] + '</small><span>' + s[1] + '</span></h2><div class="prose">' + s[2] + '</div></section>';
    });
    h += '<nav class="pager">' + (prev ? '<a class="prev" href="#/s/' + prev.id + '"><small>Anterior · ' + prev.id + '</small><b>' + prev.t + '</b></a>' : '<span></span>') +
      (next ? '<a class="next" href="#/s/' + next.id + '"><small>Siguiente · ' + next.id + '</small><b>' + next.t + '</b></a>' : '<a class="next" href="#/"><small>Fin de la memoria</small><b>Volver a la portada</b></a>') + '</nav>';
    h += '</article><aside class="rail"><span class="lbl">En este punto</span><ol>';
    (S.subs || []).forEach(function (s) { h += '<li><a href="#/s/' + id + '/' + s[0] + '" data-sub="' + s[0] + '"><i>' + s[0] + '</i>' + s[1] + '</a></li>'; });
    h += '</ol>';
    var evc = (h.match(/data-ev="\d/g) || []).length;
    if (S.sc) h += '<div class="rail-box"><span class="lbl">LogiTrans Tracer</span><p>' + S.sc[1] + '</p><button class="btn sm" data-sc="' + S.sc[0] + '">Abrir escenario</button></div>';
    h += '<div class="rail-box"><span class="lbl">Presentar este punto</span><p>Abre el modo presentación en este apartado.</p><button class="btn sm ghost" data-act="present-here">Presentar</button></div>';
    h += '</aside></div>';
    view.innerHTML = h;
    LT.hydrate(view);
    if (subId) {
      var t = document.getElementById('s-' + subId.replace(/\./g, '-'));
      if (t) setTimeout(function () { t.scrollIntoView({ block: 'start' }); }, 30);
    } else window.scrollTo(0, 0);
    LT.watchSubs(view);
  };

  /* Activa widgets, comprobaciones, figuras y botones de un bloque recién pintado */
  LT.hydrate = function (root) {
    LT.$$('.w[data-w]', root).forEach(function (el) {
      var fn = LT.W && LT.W[el.dataset.w];
      if (!fn) { el.innerHTML = '<div class="note"><b class="t">Pendiente</b><div>Widget ' + el.dataset.w + '</div></div>'; return; }
      var o = {}; try { o = el.dataset.o ? JSON.parse(el.dataset.o) : {}; } catch (e) { }
      try { fn(el, o); } catch (e) { console.error('widget', el.dataset.w, e); }
    });
    LT.$$('.chk', root).forEach(function (c) {
      var act = LT.$('.c-act', c), evs = c.dataset.ev ? c.dataset.ev.split(',').map(Number) : [];
      var run = c.dataset.run || (c.dataset.dev + '|' + c.dataset.cmd);
      if (LT.Tracer && LT.Tracer.can(run)) act.appendChild(LT.h('button.run', { text: 'Ejecutar en el Tracer', onclick: function () { LT.Tracer.runInWindow(run); } }));
      if (evs.length) act.appendChild(LT.h('button', { text: evs.length > 1 ? 'Ver capturas reales' : 'Ver captura real', onclick: function () { LT.lightbox.open(evs); } }));
      var img = LT.$('.c-img', c); if (img) img.onclick = function () { LT.lightbox.open(evs); };
    });
    LT.$$('[data-evn]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var l = b.dataset.evl ? b.dataset.evl.split(',').map(Number) : [+b.dataset.evn];
        LT.lightbox.open(l, l.indexOf(+b.dataset.evn));
      });
    });
    LT.$$('[data-sc]', root).forEach(function (b) { b.addEventListener('click', function () { location.hash = '#/tracer/' + b.dataset.sc; }); });
    LT.reveal(root);
  };

  /* Resalta en el índice lateral el subapartado visible */
  var subObs;
  LT.watchSubs = function (root) {
    if (subObs) subObs.disconnect();
    if (!('IntersectionObserver' in window)) return;
    subObs = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sid = e.target.id.slice(2).replace(/-/g, '.');
        LT.$$('[data-sub]').forEach(function (a) { a.classList.toggle('cur', a.dataset.sub === sid); });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    LT.$$('.sub', root).forEach(function (s) { subObs.observe(s); });
  };

  var revObs;
  LT.reveal = function (root) {
    if (!('IntersectionObserver' in window) || LT.reduce) { LT.$$('.rv', root).forEach(function (e) { e.classList.add('in'); }); return; }
    revObs = revObs || new IntersectionObserver(function (ents) { ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    LT.$$('.rv', root).forEach(function (e) { revObs.observe(e); });
  };

  /* ---------- Índice lateral ---------- */
  LT.buildToc = function () {
    var ul = LT.$('#toc'); ul.innerHTML = '';
    ul.appendChild(LT.h('li', null, LT.h('a', { href: '#/', 'data-id': 'home', html: '<i>·</i>Portada' })));
    LT.CHAPTERS.forEach(function (c) {
      ul.appendChild(LT.h('li.ch', null, LT.h('a', { href: '#/s/' + c.s[0], text: c.n + ' · ' + c.t })));
      c.s.forEach(function (id) {
        var S = LT.SECTIONS[id]; if (!S) return;
        var li = LT.h('li');
        li.appendChild(LT.h('a', { href: '#/s/' + id, 'data-id': id, html: '<i>' + id + '</i>' + (S.short || S.t) }));
        var subs = LT.h('div.subs');
        (S.subs || []).forEach(function (s) { subs.appendChild(LT.h('a', { href: '#/s/' + id + '/' + s[0], 'data-sub': s[0], text: s[0] + ' ' + s[1] })); });
        li.appendChild(subs);
        ul.appendChild(li);
      });
    });
    ul.appendChild(LT.h('li.ch', { text: 'Herramientas' }));
    ul.appendChild(LT.h('li', null, LT.h('a', { href: '#/tracer', 'data-id': 'tracer', html: '<i>PT</i>LogiTrans Tracer' })));
  };
  LT.markToc = function (id) {
    LT.$$('#toc > li > a').forEach(function (a) { a.classList.toggle('on', a.dataset.id === id); });
    var on = LT.$('#toc a.on'); if (on) { var r = on.getBoundingClientRect(), s = LT.$('.side').getBoundingClientRect(); if (r.top < s.top + 60 || r.bottom > s.bottom - 40) on.scrollIntoView({ block: 'center' }); }
  };

  /* ---------- Buscador ---------- */
  var idx = null;
  function buildIndex() {
    idx = [];
    LT.ORDER.forEach(function (id) {
      var S = LT.SECTIONS[id]; if (!S) return;
      idx.push({ k: id, t: S.t, h: '#/s/' + id, kind: 'Apartado', txt: (S.t + ' ' + (S.lead || '')).toLowerCase() });
      (S.subs || []).forEach(function (s) {
        var plain = s[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        idx.push({ k: s[0], t: s[1], h: '#/s/' + id + '/' + s[0], kind: 'Punto', txt: (s[1] + ' ' + plain).toLowerCase() });
      });
    });
    (LT.SCENARIOS || []).forEach(function (sc) { idx.push({ k: 'PT', t: sc.t, h: '#/tracer/' + sc.id, kind: 'Escenario', txt: (sc.t + ' ' + sc.d).toLowerCase() }); });
    Object.keys(LT.EVIDENCE || {}).forEach(function (n) { var e = LT.EVIDENCE[n]; idx.push({ k: 'IMG ' + e.num, t: e.dev + ' · ' + e.txt, ev: +n, kind: 'Captura', txt: (e.dev + ' ' + e.txt).toLowerCase() }); });
  }
  var sel = 0, res = [];
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function search(q) {
    if (!idx) buildIndex();
    q = norm(q.trim().toLowerCase());
    if (!q) { res = idx.filter(function (r) { return r.kind === 'Apartado' || r.kind === 'Escenario'; }).slice(0, 40); }
    else {
      var words = q.split(/\s+/);
      res = idx.map(function (r) {
        var t = norm(r.txt), tt = norm(r.t.toLowerCase()), sc = 0;
        for (var i = 0; i < words.length; i++) { if (t.indexOf(words[i]) < 0 && norm(r.k.toLowerCase()).indexOf(words[i]) < 0) return null; if (tt.indexOf(words[i]) >= 0) sc += 3; if (norm(r.k.toLowerCase()) === words[i]) sc += 10; }
        if (r.kind === 'Apartado') sc += 2; if (r.kind === 'Punto') sc += 1;
        return { r: r, s: sc };
      }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 40).map(function (x) { return x.r; });
    }
    sel = 0; paint(q);
  }
  function paint(q) {
    var ul = LT.$('#pal-list'); ul.innerHTML = '';
    res.forEach(function (r, i) {
      var t = LT.esc(r.t);
      ul.appendChild(LT.h('li' + (i === sel ? '.sel' : ''), { html: '<i>' + LT.esc(r.k) + '</i><span>' + t + '</span><small>' + r.kind + '</small>', onclick: function () { sel = i; go(); }, onmousemove: function () { if (sel !== i) { sel = i; mark(); } } }));
    });
    if (!res.length) ul.appendChild(LT.h('li', { html: '<i>—</i><span>Sin resultados</span>' }));
  }
  function mark() { LT.$$('#pal-list li').forEach(function (li, i) { li.classList.toggle('sel', i === sel); if (i === sel) li.scrollIntoView({ block: 'nearest' }); }); }
  function go() { var r = res[sel]; if (!r) return; LT.palette.close(); if (r.ev) LT.lightbox.open([r.ev]); else location.hash = r.h; }
  LT.palette = {
    open: function () { LT.$('#palette').classList.add('open'); var i = LT.$('#pal-in'); i.value = ''; search(''); setTimeout(function () { i.focus(); }, 10); },
    close: function () { LT.$('#palette').classList.remove('open'); },
    get isOpen() { return LT.$('#palette').classList.contains('open'); }
  };
  document.addEventListener('DOMContentLoaded', function () {
    var i = LT.$('#pal-in');
    i.addEventListener('input', function () { search(i.value); });
    i.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { sel = Math.min(res.length - 1, sel + 1); mark(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); mark(); e.preventDefault(); }
      else if (e.key === 'Enter') go();
      else if (e.key === 'Escape') LT.palette.close();
    });
    LT.$('#palette').addEventListener('click', function (e) { if (e.target.id === 'palette') LT.palette.close(); });
  });
})();
