/* Cierre: mitigación OWASP, correcciones del Sprint 1, presupuesto, equipo y créditos */
(function () {
  var LT = window.LT;
  LT.SITE_URL = 'https://galolepore-gif.github.io/logitrans/';

  /* ---------- OWASP + hallazgos ---------- */
  var FINDINGS = [
    ['Puertos 1042 y 7778 abiertos por software de ASUS', 'Medio', 'Regla LogiTrans-bloqueo-ASUS (6.1.2)', 'Aplicado', 'ok'],
    ['Puertos 135 y 445 abiertos en el anfitrión', 'Bajo', 'El ASA solo deja entrar 80 y 443 hacia 10.1.50.12', 'Comprobado desde fuera', 'ok'],
    ['Wordfence Free: reglas con 30 días de retraso y WAF básico', 'Medio', 'Fuerza bruta al 100 %. En producción, protección ampliada y Premium', 'Mejora para producción', 'w'],
    ['Certificado HTTPS autofirmado', 'Bajo', 'Certificado válido en producción', 'Mejora para producción', 'w'],
    ['WPScan: sin vulnerabilidades ni usuarios enumerables', '—', 'Mantener WordPress e imágenes al día', 'Correcto', 'ok'],
    ['Invitados con salida a todo Internet (ACL anterior)', 'Medio', 'ACL-INVITADOS-IN: solo DHCP, DNS, HTTP y HTTPS (4.B1)', 'Aplicado', 'ok'],
    ['Operarios con acceso a toda la VLAN de servidores', 'Medio', 'ACL-OPERARIOS-IN: DHCP, DNS, base de datos y web (4.B3)', 'Aplicado', 'ok']
  ];
  function owasp() {
    var g = LT.$('#owasp');
    LT.OWASP.forEach(function (o, i) {
      var c = LT.h('button.ow', { style: { '--d': (i * 60) + 'ms' }, 'aria-label': o[0] + ' ' + o[1] }, [
        LT.h('div.ow-f', {}, [LT.h('b.mono', { text: o[0] }), LT.h('span', { text: o[1] })]),
        LT.h('div.ow-b', {}, [LT.h('p', { text: o[2] }), LT.h('em.mono', { text: o[3] })])
      ]);
      c.onclick = function () { c.classList.toggle('flip'); };
      g.appendChild(c);
    });
    var f = LT.$('#findings');
    f.innerHTML = '<h4 class="mono">Hallazgos de la auditoría y medidas · Tabla 34</h4><table class="t"><thead><tr><th>Hallazgo</th><th>Riesgo</th><th>Medida</th><th>Estado</th></tr></thead><tbody>' +
      FINDINGS.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="mono">' + r[1] + '</td><td>' + r[2] + '</td><td><span class="tag ' + (r[4] === 'ok' ? 's3' : 's1') + '">' + r[3] + '</span></td></tr>'; }).join('') + '</tbody></table>';
  }
  function flipAll(on) { LT.$$('#owasp .ow').forEach(function (c, i) { setTimeout(function () { c.classList.toggle('flip', on); }, LT.reduce ? 0 : i * 90); }); }

  /* ---------- Correcciones: deslizador antes / después ---------- */
  function fixes() {
    var box = LT.$('#fixes');
    LT.CORRECTIONS.forEach(function (c, i) {
      var card = LT.h('div.fx', { style: { '--k': '0%', '--d': (i * 70) + 'ms' } });
      card.appendChild(LT.h('div.fx-t', { html: '<b>' + c.t + '</b><span class="mono">' + String(i + 1).padStart(2, '0') + '</span>' }));
      var stage = LT.h('div.fx-s', {}, [
        LT.h('div.fx-before', {}, [LT.h('em.mono', { text: 'SPRINT 1' }), LT.h('p', { text: c.before })]),
        LT.h('div.fx-after', {}, [LT.h('em.mono', { text: 'AHORA' }), LT.h('p', { text: c.after })]),
        LT.h('i.fx-h', { 'aria-hidden': 'true' })
      ]);
      card.appendChild(stage);
      card.appendChild(LT.h('small.fx-w', { text: c.why }));
      slider(card, stage);
      box.appendChild(card);
    });
  }
  function slider(card, stage) {
    function set(k) { k = Math.max(0, Math.min(1, k)); card.style.setProperty('--k', (k * 100) + '%'); card.classList.toggle('done', k > .55); }
    stage.addEventListener('pointerdown', function (e) {
      var r = stage.getBoundingClientRect(), moved = false;
      stage.setPointerCapture(e.pointerId);
      function mv(ev) { moved = true; set((ev.clientX - r.left) / r.width); }
      function up(ev) {
        stage.removeEventListener('pointermove', mv); stage.removeEventListener('pointerup', up);
        if (!moved) set(card.classList.contains('done') ? 0 : 1);
      }
      stage.addEventListener('pointermove', mv); stage.addEventListener('pointerup', up);
    });
    card._set = set;
  }
  function revealFixes(on) { LT.$$('#fixes .fx').forEach(function (c, i) { setTimeout(function () { c._set(on ? 1 : 0); }, LT.reduce ? 0 : i * 160); }); }

  /* ---------- Presupuesto ---------- */
  function budget() {
    var box = LT.$('#budget'), max = LT.BUDGET[0][1], sum = LT.BUDGET_TOTAL.net;
    LT.BUDGET.forEach(function (b, i) {
      box.appendChild(LT.h('div.bg-r', { style: { '--w': (b[1] / max * 100) + '%', '--d': (i * 70) + 'ms' } }, [
        LT.h('div.bg-l', {}, [LT.h('b', { text: b[0] }), LT.h('small.muted', { text: b[2] })]),
        LT.h('div.bg-bar', {}, [LT.h('i')]),
        LT.h('div.bg-v.mono', {}, [LT.h('b', { text: LT.fmt(b[1]) + ' €' }), LT.h('small', { text: LT.fmt(b[1] / sum * 100, 1) + ' %' })])
      ]));
    });
    box.appendChild(LT.h('div.bg-tot.mono', { html: '<span>Base imponible</span><b>' + LT.fmt(LT.BUDGET_TOTAL.net) + ' €</b><span>IVA 21 %</span><b>' + LT.fmt(LT.BUDGET_TOTAL.iva, 2) + ' €</b><span>Total</span><b class="brand">' + LT.fmt(LT.BUDGET_TOTAL.total, 2) + ' €</b>' }));
  }
  var counted = false;
  function countTotal() { setTimeout(function () { LT.$('#budget').classList.add('go'); }, 200); if (counted) return; counted = true; LT.countUp(LT.$('#budget-total'), LT.BUDGET_TOTAL.total, { dur: 2200, dec: 2 }); }

  /* ---------- Equipo y sprints ---------- */
  function team() {
    var box = LT.$('#team');
    LT.TEAM.forEach(function (m, i) {
      box.appendChild(LT.h('div.mb', { style: { '--c': 'var(' + m.color + ')', '--d': (i * 120) + 'ms' } }, [
        LT.h('div.mb-a', { text: m.initial }), LT.h('b', { text: m.name }), LT.h('em.mono', { text: m.role }), LT.h('p', { text: m.does })
      ]));
    });
    var sp = LT.$('#sprints');
    LT.SPRINTS.forEach(function (s, i) {
      sp.appendChild(LT.h('div.sp' + (s.n === 3 ? '.now' : '.done'), { style: { '--d': (i * 160) + 'ms' } }, [
        LT.h('div.sp-h', {}, [LT.h('b.mono', { text: 'SPRINT ' + s.n }), LT.h('span', { text: s.name }), LT.h('em.mono', { text: s.state })]),
        LT.h('ul', {}, s.items.map(function (x) { return LT.h('li', { text: x }); }))
      ]));
    });
  }

  /* ---------- Créditos ---------- */
  function credits() {
    var roll = LT.$('#credits-roll');
    var blocks = [
      ['', '<div class="cr-logo">LOGI<span>TRANS</span></div><div class="mono muted">Infraestructura de red · Barcelona y Zaragoza</div>'],
      ['Equipo', LT.TEAM.map(function (m) { return '<div class="cr-p"><b>' + m.name + '</b><span>' + m.role + '</span></div>'; }).join('')],
      ['En números', '<div class="cr-nums"><div><b>105</b><span>equipos en Packet Tracer</span></div><div><b>6</b><span>VLAN</span></div><div><b>11</b><span>subredes en dos sedes</span></div><div><b>164</b><span>capturas de evidencia</span></div><div><b>30 / 30</b><span>puntos de la rúbrica resueltos</span></div></div>'],
      ['Herramientas', '<div class="cr-tools mono">Cisco Packet Tracer 9 · Windows Server 2022 · VirtualBox · Docker · nginx · WordPress · MariaDB · Python + Gunicorn · Jellyfin · FOG Project · Nmap · WPScan · draw.io</div>'],
      ['Centro', '<div class="cr-p"><b>Institut F. Vidal i Barraquer</b><span>ASIX2C · Proyecto final · 2026</span></div>'],
      ['', '<div class="cr-end">Gracias.<br><span class="muted">¿Preguntas?</span></div>']
    ];
    var inner = LT.h('div.cr-in');
    blocks.forEach(function (b) { inner.appendChild(LT.h('div.cr-b', { html: (b[0] ? '<h5 class="mono">' + b[0] + '</h5>' : '') + b[1] })); });
    roll.appendChild(inner);
    var url = /^https?:/.test(location.protocol) ? location.origin + location.pathname.replace(/index\.html$/, '') : LT.SITE_URL;
    LT.$('#qr').innerHTML = '<img src="assets/img/qr.svg" alt="Código QR de la web">';
    LT.$('#qr-url').innerHTML = 'Esta presentación, en tu móvil:<br><b>' + LT.esc(url.replace(/^https?:\/\//, '')) + '</b>';
  }

  LT.scene('mitigacion', {
    steps: 3,
    init: owasp,
    enter: function () { if (!(LT.pres && LT.pres.active)) setTimeout(function () { flipAll(true); setTimeout(function () { flipAll(false); }, 2600); }, 600); },
    step: function (n) { flipAll(n === 2); }
  });
  LT.scene('correcciones', {
    steps: 2,
    init: fixes,
    step: function (n) { revealFixes(n >= 2); }
  });
  LT.scene('presupuesto', {
    init: budget,
    enter: countTotal
  });
  LT.scene('equipo', { init: team });
  LT.scene('creditos', {
    init: credits,
    enter: function () { LT.$('#credits-roll').classList.remove('go'); void LT.$('#credits-roll').offsetWidth; LT.$('#credits-roll').classList.add('go'); }
  });
})();
