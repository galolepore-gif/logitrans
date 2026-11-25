/* Portada y presupuesto */
(function () {
  var LT = window.LT;
  var demoTimer = null;

  LT.renderHome = function () {
    clearInterval(demoTimer);
    var view = LT.$('#view');
    var nSecs = LT.ORDER.length, nSubs = 0, nChk = 0;
    LT.ORDER.forEach(function (id) { var S = LT.SECTIONS[id]; if (!S) return; nSubs += (S.subs || []).length; (S.subs || []).forEach(function (s) { nChk += (s[2].match(/class="chk"/g) || []).length; }); });
    var h = '<div class="home">';
    /* Portada */
    h += '<section class="hero grid-bg"><div class="hero-in">' +
      '<div class="hero-txt"><span class="kick">ASIX2C · Proyecto final</span>' +
      '<h1>Infraestructura de red de <em>LogiTrans</em></h1>' +
      '<p class="lead">Oficina central de cuatro plantas, almacén de 9.000 m², VPN entre sedes, seguridad por capas y servicios. Toda la memoria, el Packet Tracer y las pruebas, en una sola web.</p>' +
      '<div class="hero-cta"><a class="btn sun" href="#/s/0">Empezar por los planos</a><a class="btn ghost" href="#/tracer">Abrir el Tracer</a><button class="btn ghost" data-act="present">Modo presentación <kbd>P</kbd></button></div>' +
      '<a class="hero-guide" href="GUIA.html" target="_blank"><span class="q">?</span><span><b>¿Primera vez en la web?</b><small>Guía de uso con capturas: cómo leer la memoria, usar el Tracer y presentar.</small></span><i>Abrir la guía</i></a></div>' +
      '<figure class="hero-fig"><div class="hero-map"></div><figcaption class="figcap"><span>FIG. 0 · Topología lógica en vivo</span><span>Paquetes reales del simulador</span></figcaption></figure>' +
      '</div>' +
      '<div class="facts">' + [[350, 'puestos en Barcelona'], [150, 'puestos en Zaragoza'], [6, 'VLAN por sede'], [105, 'equipos en el Packet Tracer'], [169, 'capturas de evidencia'], [1034758, 'euros con IVA']].map(function (f) { return '<div class="fact rv"><b data-n="' + f[0] + '">0</b><span>' + f[1] + '</span></div>'; }).join('') + '</div></section>';

    /* Cómo se usa */
    h += '<section class="home-sec how"><div class="how-grid">' +
      card('01', 'Memoria completa', nSecs + (LT.lang === 'ca' ? ' apartats i ' : ' apartados y ') + nSubs + ' puntos, en el mismo orden que el documento final. Navegá libre desde el índice o buscá con <kbd>Ctrl</kbd> <kbd>K</kbd>.', '#/s/0', 'Ir al índice') +
      card('02', 'LogiTrans Tracer', 'El Packet Tracer dentro de la web: consola de cada equipo, simulación paquete a paquete y ' + LT.SCENARIOS.length + ' escenarios que repiten las pruebas de la memoria.', '#/tracer', 'Abrir el simulador') +
      card('03', nChk + ' comprobaciones', 'Cada prueba lleva su comando, lo que demuestra, la captura real y, si es de red, el botón para ejecutarla en vivo.', '#/s/3.C1', 'Ver un ejemplo') +
      card('04', 'Modo presentación', 'Para la defensa: diapositivas a pantalla completa generadas desde la misma memoria, con vista del presentador. <kbd>Esc</kbd> vuelve al mismo punto.', null, 'Presentar', 'present') +
      '</div><div class="guide-strip rv"><div><span class="kick">Guía de uso</span><h3>Todo lo que se puede hacer, paso a paso</h3><p>La memoria y sus comprobaciones, las piezas interactivas, la consola de cada equipo, los escenarios, el modo simulación y la presentación. Con capturas de cada pantalla.</p></div>' +
      '<div class="gs-links"><a class="btn sun" href="GUIA.html" target="_blank">Abrir la guía</a><a href="GUIA.html#tracer" target="_blank">Cómo usar el Tracer</a><a href="GUIA.html#memoria" target="_blank">Cómo leer la memoria</a><a href="GUIA.html#presentacion" target="_blank">Cómo presentar</a></div></div></section>';

    /* Capítulos */
    h += '<section class="home-sec"><div class="sec-head"><span class="kick">Índice</span><h2>La memoria, punto por punto</h2><p>El mismo índice que el documento final de Joan: de los planos de las instalaciones a la auditoría.</p></div><div class="chapters">';
    LT.CHAPTERS.forEach(function (c) {
      h += '<article class="chapter rv"><span class="ch-n">' + c.n + '</span><h3>' + c.t + '</h3><ol>' + c.s.map(function (id) { var S = LT.SECTIONS[id]; return S ? '<li><a href="#/s/' + id + '"><i>' + (id === '0' ? '0' : id) + '</i>' + (S.short || S.t) + '</a></li>' : ''; }).join('') + '</ol></article>';
    });
    h += '</div></section>';

    /* Tracer */
    h += '<section class="home-sec tracer-teaser"><div class="tt-in"><div><span class="kick">Simulador</span><h2>Packet Tracer</h2><p>Clic en cualquier equipo para abrir su consola. Probá <code>show access-lists</code> en un core, un <code>ping</code> desde un PC o la web desde PC-INTERNET. Las ACL cuentan cada paquete con los contadores reales de las capturas.</p><div class="sc-chips">' +
      LT.SCENARIOS.slice(0, 9).map(function (s) { return '<a href="#/tracer/' + s.id + '"><i>' + s.ref + '</i>' + s.t + '</a>'; }).join('') + '<a href="#/tracer" class="more">y ' + (LT.SCENARIOS.length - 9) + ' más</a></div></div></div></section>';

    /* Equipo y sprints */
    h += '<section class="home-sec" id="equipo"><div class="sec-head"><span class="kick">Equipo ASIX2C 0379</span><h2>Quién hizo qué</h2><p>Del 1 de octubre al 19 de noviembre de 2026, punto por punto de la rúbrica. Cada número lleva a su apartado de la memoria.</p></div>' +
      teamGantt() + teamMatrix() +
      '<div class="sprints">' + LT.SPRINTS.map(function (s) { return '<article class="sprint rv"><span class="lbl">Sprint ' + s.n + ' · ' + s.state + '</span><h4>' + s.name + '</h4><ul>' + s.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></article>'; }).join('') + '</div></section>';

    /* Descargas */
    h += '<section class="home-sec"><div class="sec-head"><span class="kick">Material</span><h2>Descargas</h2></div><div class="dl-grid">' +
      dl('downloads/LogiTrans_Memoria.pdf', 'Memoria completa', 'PDF') + dl('downloads/LogiTrans_Memoria.docx', 'Memoria editable', 'DOCX') +
      dl('downloads/LogiTrans_PacketTracer_PT9.0.1.pkt', 'Packet Tracer 9.0.1', 'PKT') + dl('downloads/LogiTrans_PacketTracer_PT9.0.0.pkt', 'Packet Tracer 9.0.0', 'PKT') +
      dl('downloads/LogiTrans_Planos_drawio.zip', 'Planos editables (draw.io)', 'ZIP') + dl('downloads/LogiTrans_Planos_PNG.zip', 'Planos en imagen (PNG)', 'ZIP') +
      '<a class="dl" href="#/presupuesto"><span>EUR</span><b>Presupuesto detallado</b><small>755.939 € + IVA</small></a>' + dl('downloads/LogiTrans_Presupuesto.xlsx', 'Presupuesto (Excel)', 'XLSX') + '</div></section>';
    h += '<footer class="foot-home"><span>LogiTrans · Institut F. Vidal i Barraquer · ASIX2C 0379 · 2026</span><span>Galo Lepore · Joan Infantes · Robert Purcharea · Oliver Molina</span></footer></div>';
    view.innerHTML = h;
    window.scrollTo(0, 0);
    LT.$$('.fact b', view).forEach(function (b, i) { LT.countUp(b, +b.dataset.n, { delay: 200 + i * 90 }); });
    LT.reveal(view);
    var m = LT.Tracer.map(LT.$('.hero-map', view), { onDevice: function (id) { LT.go('#/tracer'); setTimeout(function () { LT.Tracer.win(id); }, 60); } });
    demo(m);
  };
  /* ---------- Equipo: diagrama de Gantt + responsables por punto ---------- */
  function member(id) { return LT.TEAM.filter(function (m) { return m.id === id; })[0]; }
  function rowsByChapter(fn) {
    var h = '';
    LT.CHAPTERS.forEach(function (c) {
      if (c.n === '0') return;
      h += fn(null, c);
      c.s.forEach(function (id) { if (LT.REPARTO[id]) h += fn(id, c); });
    });
    return h;
  }
  function secLink(id) { return '<a href="#/s/' + id + '"><i>' + id + '</i>' + (LT.SECTIONS[id] ? LT.SECTIONS[id].t : '') + '</a>'; }
  function teamGantt() {
    var ca = LT.lang === 'ca', D = 864e5, t0 = Date.parse('2026-10-01'), t1 = Date.parse('2026-11-20'), span = t1 - t0;
    var mes = ca ? ['oct.', 'nov.'] : ['oct', 'nov'];
    function fmt(d) { var x = new Date(d); return x.getUTCDate() + ' ' + mes[x.getUTCMonth() - 9]; }
    function pct(d) { return ((Date.parse(d) - t0) / span * 100).toFixed(2) + '%'; }
    var ticks = '';
    for (var t = t0; t < t1; t += 7 * D) ticks += '<span style="left:' + ((t - t0) / span * 100).toFixed(2) + '%">' + fmt(t) + '</span>';
    var rows = rowsByChapter(function (id, c) {
      if (!id) return '<div class="gt-ch">' + c.n + ' · ' + c.t + '</div>';
      var r = LT.REPARTO[id], who = r[2].split(' ').map(member), n = who.length;
      var bg = n === 1 ? 'var(' + who[0].color + ')' : 'linear-gradient(180deg,' + who.map(function (m, i) { return 'var(' + m.color + ') ' + (i * 100 / n) + '% ' + ((i + 1) * 100 / n) + '%'; }).join(',') + ')';
      var end = new Date(Date.parse(r[1]) + D).toISOString().slice(0, 10);
      return '<div class="gt-row"><div class="gt-l">' + secLink(id) + '</div><div class="gt-t"><span class="gt-bar" style="left:' + pct(r[0]) + ';width:calc(' + pct(end) + ' - ' + pct(r[0]) + ');background:' + bg + '" title="' + fmt(Date.parse(r[0])) + ' – ' + fmt(Date.parse(r[1])) + ' · ' + who.map(function (m) { return m.name.split(' ')[0]; }).join(', ') + '"></span></div></div>';
    });
    return '<div class="gantt rv"><div class="mx-head"><h3>' + (ca ? 'Diagrama de Gantt' : 'Diagrama de Gantt') + '</h3><p class="legend">' + LT.TEAM.map(function (m) { return '<span class="sw" style="--c:var(' + m.color + ')"></span>' + m.name.split(' ')[0]; }).join('') + '</p></div>' +
      '<div class="mx-scroll"><div class="gt"><div class="gt-row gt-axis"><div class="gt-l"></div><div class="gt-t">' + ticks + '</div></div>' + rows + '</div></div></div>';
  }
  function teamMatrix() {
    var ca = LT.lang === 'ca';
    var rows = rowsByChapter(function (id, c) {
      if (!id) return '<tr class="ch"><th colspan="' + (LT.TEAM.length + 1) + '">' + c.n + ' · ' + c.t + '</th></tr>';
      var r = LT.REPARTO[id], resp = r[2].split(' '), col = r[3] ? r[3].split(' ') : [];
      return '<tr><td>' + secLink(id) + '</td>' + LT.TEAM.map(function (t) {
        var on = resp.indexOf(t.id) >= 0, tr = col.indexOf(t.id) >= 0;
        return '<td class="dot' + (on ? ' on' : tr ? ' tr' : '') + '" style="--c:var(' + t.color + ')">' + (on || tr ? '<span title="' + t.name + '"></span>' : '') + '</td>';
      }).join('') + '</tr>';
    });
    return '<div class="matrix rv"><div class="mx-head"><h3>' + (ca ? 'Els 30 punts de la rúbrica' : 'Los 30 puntos de la rúbrica') + '</h3><p class="legend"><span class="dot on"><span></span></span>' + (ca ? 'Responsable' : 'Responsable') + '<span class="dot tr"><span></span></span>' + (ca ? 'Hi va col·laborar' : 'Colaboró') + '</p></div>' +
      '<div class="mx-scroll"><table><thead><tr><th>' + (ca ? 'Punt' : 'Punto') + '</th>' + LT.TEAM.map(function (t) { return '<th style="--c:var(' + t.color + ')"><span class="av">' + t.initial + '</span>' + t.name.split(' ')[0] + '<small>' + t.role + '</small></th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function card(n, t, p, href, cta, act) { return '<article class="how-c rv"><span class="n">' + n + '</span><h3>' + t + '</h3><p>' + p + '</p>' + (href ? '<a class="link" href="' + href + '">' + cta + '</a>' : '<button class="link" data-act="' + act + '">' + cta + '</button>') + '</article>'; }
  function dl(href, t, ext) { return '<a class="dl" href="' + href + '" download><span>' + ext + '</span><b>' + t + '</b><small>Descargar</small></a>'; }

  /* Paquetes de demostración en la portada (no tocan los contadores) */
  var DEMO = [
    { path: ['P1-ADM-03', 'BCN-P1-ACC1', 'BCN-CORE1', 'BCN-FW', 'BCN-RT1', 'ZGZ-RT1', 'ZGZ-FW', 'ZGZ-CORE1', 'SRV-ZGZ01'], ok: true, proto: 'icmp' },
    { path: ['PC-INTERNET', 'ISP-2', 'ISP-1', 'BCN-RT1', 'BCN-FW', 'BCN-CORE1', 'SRV-HV03'], ok: true, proto: 'tcp' },
    { path: ['ZGZ-MUE-01', 'ZGZ-ACC2', 'ZGZ-CORE1'], ok: false, at: 'ZGZ-CORE1', proto: 'icmp' },
    { path: ['P3-DIR-01', 'BCN-P3-ACC1', 'BCN-CORE1', 'SRV-HV01'], ok: true, proto: 'udp' },
    { path: ['P0-INV-01', 'BCN-P0-AP01', 'BCN-P0-ACC1', 'BCN-CORE1'], ok: false, at: 'BCN-CORE1', proto: 'icmp' },
    { path: ['ZGZ-DIR-01', 'ZGZ-ACC1', 'ZGZ-CORE1', 'ZGZ-FW', 'ZGZ-RT1', 'BCN-RT1', 'BCN-FW', 'BCN-CORE1', 'SRV-HV02'], ok: true, proto: 'tcp' }
  ];
  function demo(m) {
    if (LT.reduce) return;
    var i = 0, busy = false;
    var tick = function () {
      if (!m.alive()) { clearInterval(demoTimer); return; }
      if (busy || document.hidden || LT.Tracer.sim) return;
      busy = true; var d = DEMO[i++ % DEMO.length];
      LT.Tracer.animate({ path: d.path, ok: d.ok, at: d.at, proto: d.proto, ev: [] }).then(function () { busy = false; });
    };
    setTimeout(tick, 900); demoTimer = setInterval(tick, 3400);
  }

  /* ---------- Presupuesto ---------- */
  LT.renderBudget = function () {
    clearInterval(demoTimer);
    var view = LT.$('#view'), max = LT.BUDGET[0][1], T = LT.BUDGET_TOTAL;
    var rows = LT.BUDGET.slice().sort(function (a, b) { return b[1] - a[1]; });
    view.innerHTML = '<div class="budget"><header class="doc-head"><div class="crumbs"><a href="#/">Inicio</a><span>/</span><span>Presupuesto</span></div><span class="num">€</span><h1>Presupuesto del proyecto</h1><p class="lead">Lo que cuesta montar las dos sedes: equipos, electrónica de red, cableado, servidores, software e instalación.</p><a class="btn ghost b-xlsx" href="downloads/LogiTrans_Presupuesto.xlsx" download>Descargar Excel</a></header>' +
      '<div class="b-total"><div><span class="lbl">Base imponible</span><b data-n="' + T.net + '">0</b><small>euros</small></div><div><span class="lbl">IVA 21 %</span><b data-n="' + T.iva + '" data-d="2">0</b><small>euros</small></div><div class="big"><span class="lbl">Total</span><b data-n="' + T.total + '" data-d="2">0</b><small>euros</small></div></div>' +
      '<figure class="b-chart"><ol>' + rows.map(function (r) { var pc = r[1] / T.net * 100; return '<li class="rv"><div class="b-l"><b>' + r[0] + '</b><small>' + r[2] + '</small></div><div class="b-bar"><i style="--w:' + (r[1] / max * 100).toFixed(1) + '%"></i></div><div class="b-v"><b>' + LT.fmt(r[1]) + ' €</b><small>' + pc.toFixed(1).replace('.', ',') + ' %</small></div></li>'; }).join('') + '</ol>' +
      '<figcaption class="figcap"><span>FIG. P · Reparto por categoría, sin IVA</span><span>Fuente: presupuesto de la memoria</span></figcaption></figure>' +
      '<p class="b-note">El bloque más grande son los puestos de trabajo (36 %): 330 PC con monitor, teléfonos IP, impresoras y terminales de muelle. La red en sí, sumando electrónica, Wi-Fi, cableado, canalizaciones y armarios con SAI, ronda los 287.000 €.</p></div>';
    LT.$$('.b-total b', view).forEach(function (b) { LT.countUp(b, +b.dataset.n, { dec: +(b.dataset.d || 0) }); });
    LT.reveal(view);
    window.scrollTo(0, 0);
  };
})();
