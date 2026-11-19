/* Diseño físico: edificio isométrico, nave de Zaragoza, explorador de planos, cableado y etiquetas */
(function () {
  var LT = window.LT, NS = 'http://www.w3.org/2000/svg';

  /* ---------- Edificio de Barcelona en 3D (CSS) ---------- */
  function building() {
    var wrap = LT.$('#iso-bcn');
    var stage = LT.h('div.iso'), stack = LT.h('div.iso-stack');
    LT.FLOORS.filter(function (f) { return f.site === 'BCN'; }).forEach(function (f, i) {
      var fl = LT.h('button.iso-floor', { style: { '--i': i, backgroundImage: 'url(' + f.img + ')' }, title: f.name + ' · ' + f.title, 'aria-label': f.name },
        [LT.h('span.iso-tag', { html: '<b>' + f.short + '</b> ' + f.title + '<i>' + f.seats + ' puestos · ' + f.aps + ' AP · ' + f.sw + ' switches</i>' })]);
      fl.onclick = function () { LT.emit('floor', f.id); LT.goto('planos'); };
      stack.appendChild(fl);
    });
    var core = LT.h('div.iso-riser', { title: 'Montante: fibra OM4, 2 enlaces por planta' });
    stack.appendChild(core);
    stage.appendChild(stack); wrap.appendChild(stage);
    wrap.appendChild(LT.h('div.iso-hint.mono', { text: 'Clic en una planta para abrir su plano' }));
  }

  /* ---------- Nave de Zaragoza (SVG) ---------- */
  function nave() {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 620 300'); s.setAttribute('class', 'nave-svg');
    s.innerHTML =
      '<rect x="10" y="40" width="600" height="240" rx="6" class="nv-shell"/>' +
      '<rect x="10" y="40" width="96" height="240" class="nv-office"/>' +
      '<text x="58" y="160" class="nv-t" text-anchor="middle">OFICINAS</text>' +
      '<rect x="20" y="210" width="52" height="56" rx="4" class="nv-cpd"/><text x="46" y="243" class="nv-t s" text-anchor="middle">CPD</text>' +
      '<rect x="560" y="200" width="36" height="40" rx="4" class="nv-idf"/><text x="578" y="225" class="nv-t s" text-anchor="middle">IDF</text>' +
      '<path d="M72 238 H560" class="nv-fiber"/>' +
      '<text x="316" y="232" class="nv-t f" text-anchor="middle">fibra OM4 · 135 m · bandeja a 6 m</text>' +
      '<rect x="130" y="90" width="460" height="90" class="nv-zone"/><text x="360" y="140" class="nv-t" text-anchor="middle">ALMACENAJE · 3.811,50 m² · VLAN 30</text>' +
      '<text x="310" y="22" class="nv-t" text-anchor="middle">9 MUELLES DE CARGA</text>' +
      '<line x1="10" y1="292" x2="610" y2="292" class="nv-dim"/><text x="310" y="300" class="nv-t s" text-anchor="middle">150 m</text>';
    for (var i = 0; i < 9; i++) { var x = 150 + i * 50; s.innerHTML += '<rect x="' + x + '" y="28" width="30" height="12" rx="2" class="nv-dock"/>'; }
    for (var j = 0; j < 12; j++) { var ax = 140 + (j % 6) * 80, ay = j < 6 ? 70 : 200; s.innerHTML += '<circle cx="' + ax + '" cy="' + ay + '" r="5" class="nv-ap"><title>AP industrial</title></circle>'; }
    s.innerHTML += '<circle class="nv-pk" r="5"><animateMotion dur="2.6s" repeatCount="indefinite" path="M72 238 H560"/></circle>';
    LT.$('#nave-zgz').appendChild(s);
  }

  /* ---------- Explorador de planos ---------- */
  var curFloor = 'p1';
  function showFloor(id) {
    var f = LT.FLOORS.find(function (x) { return x.id === id; }); if (!f) return;
    curFloor = id;
    LT.$$('#floor-tabs .chip').forEach(function (b) { b.classList.toggle('on', b.dataset.f === id); });
    var img = LT.$('#plan-img'), view = LT.$('#plan-view');
    view.classList.remove('scan'); void view.offsetWidth; view.classList.add('scan');
    img.src = f.img; img.alt = 'Plano ' + f.name;
    var zones = f.zones.map(function (z) {
      var col = z[0] === '--' ? 'var(--muted)' : 'var(--v' + z[0] + ')';
      return '<li><span class="tag" style="color:' + col + '">' + (z[0] === '--' ? 'INFRA' : 'VLAN ' + z[0]) + '</span>' + LT.esc(z[1]) + '</li>';
    }).join('');
    LT.$('#plan-info').innerHTML = '<h4>' + (f.site === 'BCN' ? 'Barcelona · ' : '') + f.name + ' <em>' + f.short + '</em></h4>' +
      '<div class="plan-title">' + f.title + '</div>' +
      '<div class="stats mini-stats"><div class="stat"><div class="n">' + f.seats + '</div><div class="l">puestos</div></div><div class="stat"><div class="n">' + f.aps + '</div><div class="l">AP Wi-Fi 6</div></div><div class="stat"><div class="n">' + f.sw + '</div><div class="l">switches</div></div></div>' +
      '<ul class="zones">' + zones + '</ul>' +
      '<p class="muted small">Cada sala del plano indica su VLAN, y es la misma que tienen sus equipos en el Packet Tracer. Bandeja portacables en naranja discontinuo.</p>';
  }
  function plans() {
    var tabs = LT.$('#floor-tabs');
    LT.FLOORS.forEach(function (f) { tabs.appendChild(LT.h('button.chip', { text: f.short, 'data-f': f.id, onclick: function () { showFloor(f.id); } })); });
    showFloor(curFloor);
    var v = LT.$('#plan-view'), img = LT.$('#plan-img');
    v.addEventListener('mousemove', function (e) { var r = v.getBoundingClientRect(); img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; });
    v.addEventListener('click', function () { v.classList.toggle('zoom'); });
    LT.on('floor', function (id) { LT.initScene('planos'); showFloor(id); });
  }

  /* ---------- Recorrido del cable ---------- */
  function cableRun() {
    var hops = [
      ['PC', 'P1-ADM-03', 'host'], ['Roseta', 'P1-R17', 'jack'], ['Bandeja', '300 × 60 mm', 'tray'], ['Patch panel', 'PP02-17', 'pp'], ['Switch', 'BCN-P1-ACC1', 'sw'],
      ['Fibra', 'FO-CPD-IDFP1-01', 'fo'], ['Core', 'BCN-CORE1', 'core'], ['RITI', '2 operadores', 'isp']
    ];
    var segs = [['Cat 6A U/FTP LSZH', '≈ 40 m · máx 90 m', 'cu'], ['', '', 'cu'], ['', '', 'cu'], ['latiguillo', '1 m', 'cu'], ['', '', 'fo'], ['OM4 · 2 × 10 Gb', '≤ 40 m · máx 400 m', 'fo'], ['monomodo', '≈ 15 m', 'sm']];
    var box = LT.$('#cable-run');
    var row = LT.h('div.cr-row');
    hops.forEach(function (h, i) {
      row.appendChild(LT.h('div.cr-hop.cr-' + h[2], { style: { '--d': (i * .18) + 's' } }, [LT.h('i'), LT.h('b', { text: h[0] }), LT.h('span.mono', { text: h[1] })]));
      if (i < hops.length - 1) {
        var sg = segs[i];
        row.appendChild(LT.h('div.cr-seg.cr-' + sg[2], { style: { '--d': (i * .18) + 's' } }, [LT.h('em'), sg[0] ? LT.h('small.mono', { html: sg[0] + '<br>' + sg[1] }) : null]));
      }
    });
    box.appendChild(row);
    box.appendChild(LT.h('div.cr-legend.mono', { html: '<span class="cu">cobre Cat 6A</span><span class="fo">fibra OM4</span><span class="sm">fibra monomodo del operador</span><span>regla: más de 90 m de cobre → fibra</span>' }));
  }

  function compare() {
    LT.$('#cmp-copper').innerHTML = '<h4>Cobre <em>2.A1.4</em></h4>' + cmpRows([
      ['Cat 6', '10 Gb solo hasta 55 m. En los tramos de 70–85 m del almacén no garantiza velocidad.', 0],
      ['Cat 6A U/FTP', '10 Gb hasta 100 m, PoE+, pantalla por par, LSZH. La más extendida y con precio razonable.', 1],
      ['Cat 7 / 7A', 'Más cara, conectores GG45/TERA poco habituales y no aporta nada para 10GBase-T.', 0]]);
    LT.$('#cmp-fiber').innerHTML = '<h4>Fibra <em>2.A1.5</em></h4>' + cmpRows([
      ['OM3', '300 m a 10 Gb, pero el tramo de 135 m al IDF-02 queda justo para 40/100 Gb.', 0],
      ['OM4', '10 Gb hasta 400 m y 40/100 Gb hasta 150 m. El estándar de backbone corporativo.', 1],
      ['OM5', 'Pensada para SWDM a 100 Gb. Mucho más cara y hoy no la necesitamos.', 0]]);
  }
  function cmpRows(rows) {
    return '<div class="cmp">' + rows.map(function (r) { return '<div class="cmp-r ' + (r[2] ? 'win' : '') + '"><b>' + r[0] + '</b><span>' + r[1] + '</span><i>' + (r[2] ? 'ELEGIDA' : 'DESCARTADA') + '</i></div>'; }).join('') + '</div>';
  }

  /* ---------- Decodificador de etiquetas (tabla 4) ---------- */
  var PLACES = { CPD: 'CPD de Barcelona (P0)', IDFP1: 'IDF de la planta 1', IDFP2: 'IDF de la planta 2', IDFP3: 'IDF de la planta 3', IDF02: 'IDF-02 del almacén', RITI: 'RITI (entrada de operadores)' };
  function decodeLabel(raw) {
    var s = raw.trim().toUpperCase(), m, P = [];
    if ((m = s.match(/^FO-([A-Z0-9]+)-([A-Z0-9]+)-(\d+)$/))) P = [['FO', 'Enlace de fibra óptica'], [m[1], 'Origen: ' + (PLACES[m[1]] || m[1])], [m[2], 'Destino: ' + (PLACES[m[2]] || m[2])], [m[3], 'Enlace número ' + (+m[3]) + (+m[3] === 1 ? ' (de los 2 redundantes)' : '')]];
    else if ((m = s.match(/^PP(\d{2})-(\d{1,3})$/))) P = [['PP' + m[1], 'Patch panel ' + (+m[1]) + ' del rack'], [m[2], 'Puerto ' + (+m[2])]];
    else if ((m = s.match(/^PP(\d{2})$/))) P = [['PP' + m[1], 'Patch panel ' + (+m[1]) + ' del rack que lo contiene']];
    else if ((m = s.match(/^P(\d)-(R|CS)(\d{2})(?:-(\d))?$/))) { P = [['P' + m[1], 'Planta ' + m[1]], [m[2] + m[3], (m[2] === 'R' ? 'Roseta de pared ' : 'Caja de suelo ') + (+m[3])]]; if (m[4]) P.push([m[4], 'Conector ' + m[4] + ' de la roseta']); }
    else if ((m = s.match(/^M(\d{2})$/))) P = [['M' + m[1], 'Toma del muelle ' + (+m[1]) + ' del almacén (terminal RF)']];
    else if ((m = s.match(/^AP-(\d{2})$/))) P = [['AP-' + m[1], 'Punto de acceso ' + (+m[1]) + ', mismo número que en el plano']];
    else if ((m = s.match(/^(R\d+)-(FW|RT)(\d{2})$/))) P = [[m[1], 'Rack ' + m[1]], [m[2] + m[3], (m[2] === 'FW' ? 'Firewall ' : 'Router ') + (+m[3]) + ' · pegatina frontal']];
    else if ((m = s.match(/^SAI-([A-Z]+)(\d*)$/))) P = [['SAI', 'Sistema de alimentación ininterrumpida'], [m[1] + m[2], 'Zona: ' + m[1] + (m[2] ? ' · unidad ' + m[2] : '')]];
    else if ((m = s.match(/^(R\d+|IDF-P\d|IDF-\d{2})$/))) P = [[m[1], m[1][0] === 'R' ? 'Rack ' + m[1].slice(1) + (m[1] === 'R1' ? ' (principal del CPD)' : ' (reserva del CPD)') : 'Armario de planta / IDF']];
    else if ((m = s.match(/^(BCN|ZGZ)-(P\d)-(ACC|CORE)(\d)$/))) P = [[m[1], m[1] === 'BCN' ? 'Barcelona' : 'Zaragoza'], [m[2], 'Planta ' + m[2].slice(1)], [m[3], m[3] === 'ACC' ? 'Switch de acceso' : 'Core'], [m[4], 'Número ' + m[4]]];
    else if ((m = s.match(/^(P\d)-([A-Z]{3})-(\d{2})$/))) P = [[m[1], 'Planta ' + m[1].slice(1)], [m[2], { ADM: 'Administración', DIR: 'Dirección', GES: 'Gestión (NOC)', INV: 'Invitado', IMP: 'Impresora' }[m[2]] || m[2]], [m[3], 'Puesto ' + (+m[3])]];
    return P;
  }
  function labels() {
    var inp = LT.$('#lbl-in'), out = LT.$('#lbl-out');
    function upd() {
      var P = decodeLabel(inp.value);
      out.innerHTML = P.length ? P.map(function (p, i) { return '<div class="lb-p" style="--i:' + i + '"><b class="mono">' + LT.esc(p[0]) + '</b><span>' + LT.esc(p[1]) + '</span></div>'; }).join('') : '<div class="muted small">Formato no reconocido. Probá los ejemplos.</div>';
    }
    inp.addEventListener('input', upd);
    ['FO-CPD-IDFP2-01', 'PP02-17', 'P1-R17-2', 'P2-CS07', 'M05', 'AP-07', 'R1-FW01', 'BCN-P1-ACC1', 'P1-ADM-03'].forEach(function (ex) {
      LT.$('#lbl-ex').appendChild(LT.h('button.chip', { text: ex, onclick: function () { inp.value = ex; upd(); } }));
    });
    upd();
    var pc = LT.$('#patch-colors');
    [['Azul', 'puestos de usuario', '#3B82F6'], ['Amarillo', 'troncales y EtherChannel', '#FACC15'], ['Rojo', 'servidores VLAN 50', '#FF3B5C'], ['Verde', 'AP y cámaras', '#2BE38B'], ['Naranja', 'fibra LC-LC', '#FF6B1A']].forEach(function (c) {
      pc.appendChild(LT.h('div.pc', { title: c[0] + ': ' + c[1] }, [LT.h('i', { style: { background: c[2] } }), LT.h('span', { html: '<b>' + c[0] + '</b> ' + c[1] })]));
    });
  }

  LT.scene('sedes', { init: function () { building(); nave(); }, enter: function () { LT.$('#sedes').classList.add('go'); } });
  LT.scene('planos', { init: plans });
  LT.scene('cable', { init: function () { cableRun(); compare(); labels(); }, enter: function () { LT.$('#cable-run').classList.add('go'); }, step: function (n) { if (n >= 1) LT.$('#cable-run').classList.add('go'); } });
})();
