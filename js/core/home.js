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
      '<div class="hero-txt"><span class="kick">ASIX2C · Proyecto final · Sprint 3</span>' +
      '<h1>Una red para mover mercancía entre <em>Barcelona</em> y <em>Zaragoza</em>.</h1>' +
      '<p class="lead">La infraestructura completa de LogiTrans: oficina central de cuatro plantas, almacén de 9.000 m², VPN entre sedes, seguridad por capas y servicios. Toda la memoria, el Packet Tracer y las pruebas, en una sola web.</p>' +
      '<div class="hero-cta"><a class="btn sun" href="#/s/0">Empezar por los planos</a><a class="btn ghost" href="#/tracer">Abrir el Tracer</a><button class="btn ghost" data-act="present">Modo presentación <kbd>P</kbd></button></div></div>' +
      '<figure class="hero-fig"><div class="hero-map"></div><figcaption class="figcap"><span>FIG. 0 · Topología lógica en vivo</span><span>Paquetes reales del simulador</span></figcaption></figure>' +
      '</div>' +
      '<div class="facts">' + [[350, 'puestos en Barcelona'], [150, 'puestos en Zaragoza'], [6, 'VLAN por sede'], [105, 'equipos en el Packet Tracer'], [169, 'capturas de evidencia'], [1034758, 'euros con IVA']].map(function (f) { return '<div class="fact rv"><b data-n="' + f[0] + '">0</b><span>' + f[1] + '</span></div>'; }).join('') + '</div></section>';

    /* Cómo se usa */
    h += '<section class="home-sec how"><div class="how-grid">' +
      card('01', 'Memoria completa', nSecs + (LT.lang === 'ca' ? ' apartats i ' : ' apartados y ') + nSubs + ' puntos, en el mismo orden que el documento final. Navegá libre desde el índice o buscá con <kbd>Ctrl</kbd> <kbd>K</kbd>.', '#/s/0', 'Ir al índice') +
      card('02', 'LogiTrans Tracer', 'El Packet Tracer dentro de la web: consola de cada equipo, simulación paquete a paquete y ' + LT.SCENARIOS.length + ' escenarios que repiten las pruebas de la memoria.', '#/tracer', 'Abrir el simulador') +
      card('03', nChk + ' comprobaciones', 'Cada prueba lleva su comando, lo que demuestra, la captura real y, si es de red, el botón para ejecutarla en vivo.', '#/s/3.C1', 'Ver un ejemplo') +
      card('04', 'Modo presentación', 'Para la defensa: diapositivas a pantalla completa generadas desde la misma memoria, con vista del presentador. <kbd>Esc</kbd> vuelve al mismo punto.', null, 'Presentar', 'present') +
      '</div></section>';

    /* Capítulos */
    h += '<section class="home-sec"><div class="sec-head"><span class="kick">Índice</span><h2>La memoria, punto por punto</h2><p>El mismo índice que el documento final de Joan: de los planos de las instalaciones a la auditoría.</p></div><div class="chapters">';
    LT.CHAPTERS.forEach(function (c) {
      h += '<article class="chapter rv"><span class="ch-n">' + c.n + '</span><h3>' + c.t + '</h3><ol>' + c.s.map(function (id) { var S = LT.SECTIONS[id]; return S ? '<li><a href="#/s/' + id + '"><i>' + (id === '0' ? '0' : id) + '</i>' + (S.short || S.t) + '</a></li>' : ''; }).join('') + '</ol></article>';
    });
    h += '</div></section>';

    /* Tracer */
    h += '<section class="home-sec tracer-teaser"><div class="tt-in"><div><span class="kick">Simulador</span><h2>Presentar el Packet Tracer sin abrir el Packet Tracer</h2><p>Clic en cualquier equipo para abrir su consola. Probá <code>show access-lists</code> en un core, un <code>ping</code> desde un PC o la web desde PC-INTERNET. Las ACL cuentan cada paquete con los contadores reales de las capturas.</p><div class="sc-chips">' +
      LT.SCENARIOS.slice(0, 9).map(function (s) { return '<a href="#/tracer/' + s.id + '"><i>' + s.ref + '</i>' + s.t + '</a>'; }).join('') + '<a href="#/tracer" class="more">y ' + (LT.SCENARIOS.length - 9) + ' más</a></div></div></div></section>';

    /* Equipo y sprints */
    h += '<section class="home-sec"><div class="sec-head"><span class="kick">Equipo ASIX2C 0379</span><h2>Quién hizo qué</h2></div><div class="team">' +
      LT.TEAM.map(function (t) { return '<article class="member rv"><span class="av" style="--c:var(' + t.color + ')">' + t.initial + '</span><div><b>' + t.name + '</b><small>' + t.role + '</small><p>' + t.does + '</p></div></article>'; }).join('') + '</div>' +
      '<div class="sprints">' + LT.SPRINTS.map(function (s) { return '<article class="sprint rv"><span class="lbl">Sprint ' + s.n + ' · ' + s.state + '</span><h4>' + s.name + '</h4><ul>' + s.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></article>'; }).join('') + '</div></section>';

    /* Descargas */
    h += '<section class="home-sec"><div class="sec-head"><span class="kick">Material</span><h2>Descargas</h2></div><div class="dl-grid">' +
      dl('downloads/LogiTrans_Memoria.pdf', 'Memoria completa', 'PDF') + dl('downloads/LogiTrans_Memoria.docx', 'Memoria editable', 'DOCX') +
      dl('downloads/LogiTrans_PacketTracer_PT9.0.1.pkt', 'Packet Tracer 9.0.1', 'PKT') + dl('downloads/LogiTrans_PacketTracer_PT9.0.0.pkt', 'Packet Tracer 9.0.0', 'PKT') +
      dl('downloads/LogiTrans_Planos_drawio.zip', 'Planos editables (draw.io)', 'ZIP') + '<a class="dl" href="#/presupuesto"><span>EUR</span><b>Presupuesto detallado</b><small>855.172 € + IVA</small></a></div></section>';
    h += '<footer class="foot-home"><span>LogiTrans · Institut F. Vidal i Barraquer · ASIX2C 0379 · 2026</span><span>Galo Lepore · Joan Infantes · Robert Purcharea · Oliver Molina</span></footer></div>';
    view.innerHTML = h;
    window.scrollTo(0, 0);
    LT.$$('.fact b', view).forEach(function (b, i) { LT.countUp(b, +b.dataset.n, { delay: 200 + i * 90 }); });
    LT.reveal(view);
    var m = LT.Tracer.map(LT.$('.hero-map', view), { onDevice: function (id) { LT.go('#/tracer'); setTimeout(function () { LT.Tracer.win(id); }, 60); } });
    demo(m);
  };
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
    view.innerHTML = '<div class="budget"><header class="doc-head"><div class="crumbs"><a href="#/">Memoria</a><span>/</span><span>Presupuesto</span></div><span class="num">€</span><h1>Presupuesto del proyecto</h1><p class="lead">Lo que cuesta montar las dos sedes: equipos, electrónica de red, cableado, servidores, software e instalación.</p></header>' +
      '<div class="b-total"><div><span class="lbl">Base imponible</span><b data-n="' + T.net + '">0</b><small>euros</small></div><div><span class="lbl">IVA 21 %</span><b data-n="' + T.iva + '" data-d="2">0</b><small>euros</small></div><div class="big"><span class="lbl">Total</span><b data-n="' + T.total + '" data-d="2">0</b><small>euros</small></div></div>' +
      '<figure class="b-chart"><ol>' + rows.map(function (r) { var pc = r[1] / T.net * 100; return '<li class="rv"><div class="b-l"><b>' + r[0] + '</b><small>' + r[2] + '</small></div><div class="b-bar"><i style="--w:' + (r[1] / max * 100).toFixed(1) + '%"></i></div><div class="b-v"><b>' + LT.fmt(r[1]) + ' €</b><small>' + pc.toFixed(1).replace('.', ',') + ' %</small></div></li>'; }).join('') + '</ol>' +
      '<figcaption class="figcap"><span>FIG. P · Reparto por categoría, sin IVA</span><span>Fuente: presupuesto de la memoria</span></figcaption></figure>' +
      '<p class="b-note">Más de la mitad del dinero se va en los equipos de usuario (460 PC con monitor, terminales RF y cámaras). La red en sí, sumando acceso, core, frontera, Wi-Fi, cableado y armarios, ronda los 218.000 €.</p></div>';
    LT.$$('.b-total b', view).forEach(function (b) { LT.countUp(b, +b.dataset.n, { dec: +(b.dataset.d || 0) }); });
    LT.reveal(view);
    window.scrollTo(0, 0);
  };
})();
