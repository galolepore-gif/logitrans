/* Widgets del punto 0 y del capítulo 2: sedes, planos, cableado, etiquetado, SAI, racks y hardware */
(function () {
  var LT = window.LT, W = LT.W = LT.W || {}, esc = LT.esc;
  var vl = function (v) { return v === '--' ? '<span class="vl" style="background:var(--muted)">·</span>' : LT.D.vl(v); };

  /* Las dos sedes */
  W.sites = function (el) {
    var f = LT.FLOORS, bcn = f.filter(function (x) { return x.site === 'BCN'; }), z = f.filter(function (x) { return x.site === 'ZGZ'; })[0];
    var sum = function (a, k) { return a.reduce(function (s, x) { return s + x[k]; }, 0); };
    el.innerHTML = '<div class="w-sites"><a class="site rv" href="#/s/0/0.1"><span class="lbl">Sede central</span><h4>Barcelona</h4><svg viewBox="0 0 120 120" class="bld"><rect x="25" y="14" width="70" height="100" class="b"/>' + [0, 1, 2, 3].map(function (i) { return '<rect x="33" y="' + (90 - i * 24) + '" width="54" height="16" class="fl" style="--d:' + (i * .15) + 's"/><text x="60" y="' + (102 - i * 24) + '">P' + i + '</text>'; }).join('') + '</svg><dl><dt>Puestos</dt><dd>350</dd><dt>Plantas</dt><dd>4</dd><dt>AP Wi-Fi</dt><dd>' + sum(bcn, 'aps') + '</dd><dt>Armarios</dt><dd>R1 + 3 IDF</dd></dl></a>' +
      '<div class="link-vpn"><span>VPN IPsec</span><i></i><small>GRE · AES-256 · 300 km</small></div>' +
      '<a class="site rv" href="#/s/0/0.5"><span class="lbl">Almacén</span><h4>Zaragoza</h4><svg viewBox="0 0 120 120" class="bld"><path d="M8 110 V58 L60 30 L112 58 V110 Z" class="b"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return '<rect x="' + (14 + i * 10.6) + '" y="96" width="8" height="14" class="fl" style="--d:' + (i * .07) + 's"/>'; }).join('') + '<text x="60" y="80">9 muelles</text></svg><dl><dt>Puestos</dt><dd>150</dd><dt>Nave</dt><dd>150 × 60 m</dd><dt>AP Wi-Fi</dt><dd>' + z.aps + '</dd><dt>Armarios</dt><dd>R1 + IDF-02</dd></dl></a></div>';
  };

  /* Plano de una planta con sus zonas */
  W.plan = function (el, o) {
    var F = LT.FLOORS.filter(function (x) { return x.id === (o.f || 'p0'); })[0];
    el.innerHTML = '<div class="w-plan"><figure class="pl-img"><button class="pl-zoom" aria-label="Ampliar el plano"><img src="' + F.img + '" alt="Plano ' + esc(F.name) + '" loading="lazy"></button><figcaption class="figcap"><span>FIG. ' + F.short + ' · ' + esc(F.name) + '</span><span>Clic para ampliar</span></figcaption></figure>' +
      '<div class="pl-side"><span class="lbl">' + esc(F.title) + '</span><div class="pl-k"><div><b>' + F.seats + '</b><small>puestos</small></div><div><b>' + F.aps + '</b><small>AP</small></div><div><b>' + F.sw + '</b><small>switches</small></div></div><ul>' +
      F.zones.map(function (z) { return '<li>' + vl(z[0]) + '<span>' + z[1] + '</span></li>'; }).join('') + '</ul></div></div>';
    var b = LT.$('.pl-zoom', el);
    b.onclick = function () {
      var ov = LT.h('div.pl-ov', { html: '<img src="' + F.img + '" alt=""><button class="btn sm">Cerrar · Esc</button>' });
      document.body.appendChild(ov);
      var close = function () { ov.remove(); document.removeEventListener('keydown', k, true); };
      var k = function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
      ov.onclick = close; document.addEventListener('keydown', k, true);
    };
  };

  /* Topología en estrella */
  W.star = function (el) {
    var nodes = [['CPD · R1', 300, 210, 'core'], ['IDF-P1', 150, 90, 'idf'], ['IDF-P2', 300, 60, 'idf'], ['IDF-P3', 450, 90, 'idf'], ['P0 · rosetas', 160, 320, 'r'], ['RITI', 440, 320, 'riti']];
    var links = [[0, 1, 'fo', 'OM4 · 2 × 10 Gb · ≈ 15 m'], [0, 2, 'fo', 'OM4 · 2 × 10 Gb · ≈ 25 m'], [0, 3, 'fo', 'OM4 · 2 × 10 Gb · ≈ 35 m'], [0, 4, 'cu', 'Cat 6A · hasta 90 m'], [0, 5, 'sm', 'Monomodo de 2 operadores']];
    var h = '<div class="w-star"><svg viewBox="0 0 600 380">';
    links.forEach(function (l, i) { var a = nodes[l[0]], b = nodes[l[1]]; h += '<g class="sl ' + l[2] + '" data-i="' + i + '"><line x1="' + a[1] + '" y1="' + a[2] + '" x2="' + b[1] + '" y2="' + b[2] + '"/><line class="hit" x1="' + a[1] + '" y1="' + a[2] + '" x2="' + b[1] + '" y2="' + b[2] + '"/></g>'; });
    nodes.forEach(function (n, i) { [1, 2, 3].forEach(function (k) { if (n[3] === 'idf') h += '<line class="sl cu thin" x1="' + n[1] + '" y1="' + n[2] + '" x2="' + (n[1] + (k - 2) * 40) + '" y2="' + (n[2] - 46) + '"/><circle class="ro" cx="' + (n[1] + (k - 2) * 40) + '" cy="' + (n[2] - 50) + '" r="4"/>'; }); h += '<g class="nd ' + n[3] + '"><rect x="' + (n[1] - 52) + '" y="' + (n[2] - 16) + '" width="104" height="32" rx="4"/><text x="' + n[1] + '" y="' + (n[2] + 5) + '">' + n[0] + '</text></g>'; });
    h += '</svg><div class="st-info"><span class="lbl">Pasá por un enlace</span><b>Estrella por sede</b><p>Fibra OM4 del CPD a cada IDF; cobre Cat 6A del IDF a cada roseta. En Zaragoza, 135 m de OM4 hasta el IDF-02.</p></div><ul class="leg"><li><i class="fo"></i>Fibra OM4</li><li><i class="cu"></i>Cobre Cat 6A</li><li><i class="sm"></i>Monomodo del operador</li></ul></div>';
    el.innerHTML = h;
    LT.$$('.sl[data-i]', el).forEach(function (g) { g.addEventListener('mouseenter', function () { var l = links[+g.dataset.i]; LT.$('.st-info b', el).textContent = nodes[l[0]][0] + ' → ' + nodes[l[1]][0]; LT.$('.st-info p', el).textContent = l[3]; LT.$$('.sl', el).forEach(function (x) { x.classList.toggle('on', x === g); }); }); });
  };

  /* Medios por tramo */
  W.media = function (el) {
    el.innerHTML = '<div class="w-media">' + LT.MEDIA.map(function (m, i) { return '<div class="md rv" style="--i:' + i + '"><span class="lbl">' + m.tram + '</span><b>' + m.cable + '</b><div class="md-k"><span>' + m.speed + '</span><span>' + m.dist + '</span><span>límite ' + m.limit + '</span></div><i class="md-c ' + (/Fibra|FTTH/.test(m.cable) ? 'fo' : 'cu') + '"></i></div>'; }).join('') + '</div>';
  };

  /* Comparativas Cat 6 / 6A / 7 y OM3 / OM4 / OM5 */
  var CMP = {
    cat: { t: 'Categoría de cobre', pick: 1, cols: [
      ['Cat 6', ['10 Gb solo hasta 55 m', 'Tramos de 70 a 85 m en el almacén: no garantiza la velocidad'], 'Descartado'],
      ['Cat 6A U/FTP', ['10 Gb hasta 100 m', 'Pantalla por par, la opción más extendida', 'Precio razonable'], 'Elegido'],
      ['Cat 7 / 7A', ['Más caro', 'Conectores no estandarizados (GG45, TERA)', 'No aporta nada frente a Cat 6A para 10GBase-T a 100 m'], 'Descartado']] },
    om: { t: 'Fibra multimodo', pick: 1, cols: [
      ['OM3', ['10 Gb hasta 300 m', 'A 40/100 Gb baja a 100 y 70 m', 'El tramo de 135 m al IDF-02 quedaría justo'], 'Descartado'],
      ['OM4', ['10 Gb hasta 400 m', '40/100 Gb hasta 150 m', 'La de todos los troncales corporativos actuales'], 'Elegido'],
      ['OM5', ['100 Gb por varias longitudes de onda (SWDM)', 'Mucho más cara', 'Hoy no se necesita'], 'Descartada']] }
  };
  W.compare = function (el, o) {
    var c = CMP[o.k || 'cat'];
    el.innerHTML = '<div class="w-cmp"><span class="lbl">' + c.t + ' · elegí una opción</span><div class="cmp-cols">' + c.cols.map(function (x, i) { return '<button class="cmp' + (i === c.pick ? ' pick' : '') + '" data-i="' + i + '"><b>' + x[0] + '</b><ul>' + x[1].map(function (y) { return '<li>' + y + '</li>'; }).join('') + '</ul><span class="chip ' + (i === c.pick ? 'ok' : 'bad') + '">' + x[2] + '</span></button>'; }).join('') + '</div></div>';
    LT.$$('.cmp', el).forEach(function (b) { b.onclick = function () { LT.$$('.cmp', el).forEach(function (x) { x.classList.toggle('sel', x === b); }); }; });
  };

  /* Distancias frente a la norma */
  W.dist = function (el) {
    var rows = [['Rack → roseta más lejana (oficina)', 85, 90, 'cobre'], ['Almacén: rack → muelle', 85, 90, 'cobre'], ['CPD → IDF-P3 (montante)', 40, 400, 'OM4'], ['Cuarto de comunicaciones → IDF-02', 135, 400, 'OM4'], ['Lo mismo, si fuese cobre', 135, 90, 'cobre']];
    var max = 420;
    el.innerHTML = '<div class="w-dist">' + rows.map(function (r) { var bad = r[1] > r[2]; return '<div class="ds' + (bad ? ' bad' : '') + '" title="' + (bad ? 'Pasa el límite por ' + (r[1] - r[2]) + ' m' : 'Margen: ' + (r[2] - r[1]) + ' m') + '"><span class="ds-l">' + r[0] + '<small>' + r[3] + '</small></span><div class="ds-b"><i class="real" style="--w:' + (r[1] / max * 100) + '%"></i><i class="lim" style="--x:' + (r[2] / max * 100) + '%"><em>' + r[2] + ' m</em></i></div><b>' + r[1] + ' m</b></div>'; }).join('') +
      '<p class="ds-n">La raya marca el límite de la norma. La última fila explica por qué el almacén necesita el IDF-02.</p></div>';
  };

  /* Código de colores de latiguillo (punto 2.A1.7) */
  W.patch = function (el) {
    var c = [['#2B67B3', 'Azul', 'Puestos de usuario (PC y teléfonos IP)'], ['#F2B416', 'Amarillo', 'Enlaces entre switches (troncales, EtherChannel)'], ['#C23D2E', 'Rojo', 'Servidores y servicios de la VLAN 50'], ['#2E8A4C', 'Verde', 'Puntos de acceso Wi-Fi y cámaras IP'], ['#DD7419', 'Naranja', 'Fibra (latiguillos LC-LC OM4)']];
    el.innerHTML = '<div class="w-patch"><div class="pp"><span class="lbl">PP01 · 24 puertos</span><div class="pp-ports">' + Array.apply(null, Array(24)).map(function (x, i) { var k = [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1, 1, 4, 4][i]; return '<span class="pp-p" style="--c:' + c[k][0] + '" data-k="' + k + '"><i></i></span>'; }).join('') + '</div></div><ul class="pp-leg">' + c.map(function (x, k) { return '<li data-k="' + k + '"><i style="background:' + x[0] + '"></i><b>' + x[1] + '</b><span>' + x[2] + '</span></li>'; }).join('') + '</ul></div>';
    LT.$$('.pp-leg li', el).forEach(function (li) { li.addEventListener('mouseenter', function () { LT.$$('.pp-p', el).forEach(function (p) { p.classList.toggle('dim', p.dataset.k !== li.dataset.k); }); }); li.addEventListener('mouseleave', function () { LT.$$('.pp-p', el).forEach(function (p) { p.classList.remove('dim'); }); }); });
  };

  /* Generador de etiquetas */
  W.label = function (el) {
    var T = {
      roseta: { t: 'Roseta', f: function (v) { return 'P' + v.p + '-R' + pad(v.n) + (v.c ? '-' + v.c : ''); }, d: function (v) { return 'Conector ' + (v.c || 1) + ' de la roseta ' + v.n + ' de la planta ' + v.p; } },
      cs: { t: 'Caja de suelo', f: function (v) { return 'P' + v.p + '-CS' + pad(v.n); }, d: function (v) { return 'Caja de suelo ' + v.n + ' de la planta ' + v.p + ', 6 tomas'; } },
      pp: { t: 'Puerto de panel', f: function (v) { return 'PP' + pad(v.n % 10 || 1) + '-' + pad(v.c * 8 + 1); }, d: function (v) { return 'Puerto ' + (v.c * 8 + 1) + ' del panel ' + (v.n % 10 || 1); } },
      fo: { t: 'Enlace de fibra', f: function (v) { return 'FO-CPD-IDFP' + Math.max(1, v.p) + '-' + pad(v.c || 1); }, d: function (v) { return 'Enlace ' + (v.c || 1) + ' de fibra del CPD al IDF de la planta ' + Math.max(1, v.p); } },
      muelle: { t: 'Toma de muelle', f: function (v) { return 'M' + pad(Math.min(9, v.n)); }, d: function (v) { return 'Terminal del muelle ' + Math.min(9, v.n) + ' del almacén'; } },
      ap: { t: 'Punto de acceso', f: function (v) { return 'AP-' + pad(v.n); }, d: function (v) { return 'AP número ' + v.n + ', igual que en el plano'; } }
    };
    function pad(n) { return ('0' + n).slice(-2); }
    el.innerHTML = '<div class="w-label"><div class="lb-f"><label><span class="lbl">Elemento</span><select class="lb-t">' + Object.keys(T).map(function (k) { return '<option value="' + k + '">' + T[k].t + '</option>'; }).join('') + '</select></label><label><span class="lbl">Planta</span><input type="range" min="0" max="3" value="1" class="lb-p"></label><label><span class="lbl">Número</span><input type="range" min="1" max="24" value="17" class="lb-n"></label><label><span class="lbl">Conector</span><input type="range" min="1" max="2" value="2" class="lb-c"></label></div>' +
      '<div class="lb-out"><div class="tag"><span class="tag-flag">' + '' + '</span></div><p></p></div></div>';
    var upd = function () { var t = T[LT.$('.lb-t', el).value], v = { p: +LT.$('.lb-p', el).value, n: +LT.$('.lb-n', el).value, c: +LT.$('.lb-c', el).value }; LT.$('.tag-flag', el).textContent = t.f(v); LT.$('.lb-out p', el).textContent = t.d(v); };
    LT.$$('select,input', el).forEach(function (x) { x.oninput = upd; });
    upd();
  };

  /* Canalizaciones */
  W.ducts = function (el) {
    var D = [['Bandeja 300 × 60', 'Oficina BCN, pasillos P0 a P3', 320, 'h'], ['Bandeja 400 × 100', 'Nave del almacén, a 6 m', 360, 'h'], ['Bandeja 200 × 60', 'Cuarto de com. → IDF-02 (ZGZ)', 150, 'h'], ['Bandeja 300 × 60', 'Oficinas del almacén', 40, 'h'], ['Bandeja 200 × 60', 'CPD y taller IT', 30, 'h'], ['Tubo acero Ø 125', 'Montante P0 ↔ P3', 16, 'v'], ['Tubo ignífugo Ø 50', 'Entradas RITI', 20, 'v'], ['Corrugado PVC Ø 32', 'Bajadas a cajas de suelo', 600, 'b']];
    var max = 600;
    el.innerHTML = '<div class="w-ducts">' + D.map(function (d) { return '<div class="du"><span class="du-l"><b>' + d[0] + '</b><small>' + d[1] + '</small></span><div class="du-b"><i class="' + d[3] + '" style="--w:' + (d[2] / max * 100) + '%"></i></div><b class="du-v">' + LT.fmt(d[2]) + ' m</b></div>'; }).join('') + '<p class="ds-n">≈ 900 m de bandeja metálica en tres secciones, 16 m de montante, 20 m de tubo ignífugo y ≈ 600 m de corrugado.</p></div>';
  };

  /* Bobinas de cable */
  W.reels = function (el) {
    var Z = [['P0', 96, 50], ['P1', 154, 40], ['P2', 144, 40], ['P3', 144, 40], ['Almacén', 152, 70]];
    var tot = Z.reduce(function (s, z) { return s + z[1] * z[2]; }, 0);
    el.innerHTML = '<div class="w-reels"><div class="rl-z">' + Z.map(function (z) { return '<div><span class="lbl">' + z[0] + '</span><b>' + LT.fmt(z[1] * z[2]) + ' m</b><small>' + z[1] + ' tomas × ' + z[2] + ' m</small></div>'; }).join('') + '</div><div class="rl-sum"><div><span class="lbl">Bruto</span><b>' + LT.fmt(tot) + ' m</b></div><div><span class="lbl">+10 %</span><b>≈ 36.500 m</b></div><div class="rl-n"><span class="lbl">Bobinas de 1.000 m</span><b class="cnt">37</b></div></div><div class="rl-vis">' + Array.apply(null, Array(37)).map(function (x, i) { return '<i style="--d:' + (i * 30) + 'ms"></i>'; }).join('') + '</div></div>';
  };

  /* Carga de cada SAI */
  W.upsload = function (el) {
    var U = [['BCN · CPD R1', 2400, 6000, 15, 'SRT 6000VA'], ['BCN · IDF-P1', 1200, 1980, 18, 'SRT 2200VA'], ['BCN · IDF-P2', 900, 1500, 15, 'SRT 1500VA'], ['BCN · IDF-P3', 900, 1500, 15, 'SRT 1500VA'], ['ZGZ · CPD R1', 1600, 2700, 18, 'SRT 3000VA'], ['ZGZ · IDF-02', 350, 1000, 15, 'SRT 1000VA']];
    el.innerHTML = '<div class="w-ups-l">' + U.map(function (u) { var pc = Math.round(u[1] / u[2] * 100); return '<div class="ul"><span class="ul-l"><b>' + u[0] + '</b><small>APC Smart-UPS ' + u[4] + '</small></span><div class="ul-b"><i style="--w:' + pc + '%"></i><em>' + LT.fmt(u[1]) + ' W de ' + LT.fmt(u[2]) + ' W</em></div><b class="ul-m">' + u[3] + ' min</b></div>'; }).join('') + '<p class="ds-n">Carga con factor de uso ≈ 0,7 y autonomía a esa carga. Objetivo: 15 a 20 minutos.</p></div>';
  };

  /* SAI online frente a línea interactiva */
  W.ups = function (el) {
    el.innerHTML = '<div class="w-ups"><div class="ups-c"><span class="lbl">Línea interactiva</span><svg viewBox="0 0 300 90"><path class="wave a" d="M0 45 Q 15 15 30 45 T 60 45 T 90 45 T 120 45 T 150 45 T 180 45 T 210 45 T 240 45 T 270 45 T 300 45"/></svg><p class="st">Conmuta a batería en 2 a 6 ms</p></div><div class="ups-c"><span class="lbl">Online doble conversión</span><svg viewBox="0 0 300 90"><path class="wave b" d="M0 45 Q 15 15 30 45 T 60 45 T 90 45 T 120 45 T 150 45 T 180 45 T 210 45 T 240 45 T 270 45 T 300 45"/></svg><p class="st">Sin tiempo de transferencia</p></div><button class="btn sun cut">Cortar la luz</button></div>';
    LT.$('.cut', el).onclick = function (e) {
      var w = LT.$('.w-ups', el); w.classList.remove('off'); void w.offsetWidth; w.classList.add('off');
      LT.$$('.st', el)[0].innerHTML = '<b class="bad">Hueco de 4 ms</b>: un core con tensión degradada se puede reiniciar.';
      LT.$$('.st', el)[1].innerHTML = '<b class="ok">Ni un milisegundo</b>: el inversor ya estaba en línea.';
    };
  };

  /* Alzado de rack */
  W.rack = function (el) {
    var keys = Object.keys(LT.RACKS);
    el.innerHTML = '<div class="w-rack"><div class="rk-tabs">' + keys.map(function (k, i) { return '<button data-k="' + k + '"' + (i ? '' : ' class="on"') + '>' + LT.RACKS[k].title + '</button>'; }).join('') + '</div><div class="rk-body"><div class="rk"></div><div class="rk-info"><span class="lbl">Pasá por una U</span><b></b><p></p><dl class="kv rk-meta"></dl></div></div></div>';
    function draw(k) {
      var R = LT.RACKS[k], rk = LT.$('.rk', el), occ = {}, h = '';
      R.items.forEach(function (it) { for (var u = it[0]; u > it[0] - it[1]; u--) occ[u] = it; });
      for (var u = R.size; u >= 1; u--) {
        var it = occ[u];
        if (it && it[0] === u) h += '<div class="ru t-' + it[2] + '" style="--h:' + it[1] + '" data-u="' + u + '"><i>' + u + '</i><span>' + esc(it[3]) + '</span></div>';
        else if (!it) h += '<div class="ru empty" style="--h:1"><i>' + u + '</i><span></span></div>';
      }
      rk.innerHTML = h; rk.classList.toggle('small', R.size < 20);
      LT.$('.rk-info b', el).textContent = R.title; LT.$('.rk-info p', el).textContent = R.occ;
      LT.$('.rk-meta', el).innerHTML = '<dt>SAI</dt><dd>' + R.ups.model + '</dd><dt>Carga</dt><dd>' + LT.fmt(R.ups.load) + ' W · ' + R.ups.min + ' min</dd>';
      LT.$$('.ru[data-u]', rk).forEach(function (r) { r.addEventListener('mouseenter', function () { var it = occ[+r.dataset.u]; LT.$('.rk-info b', el).textContent = 'U' + it[0] + (it[1] > 1 ? '–' + (it[0] - it[1] + 1) : '') + ' · ' + it[3]; LT.$('.rk-info p', el).textContent = it[4] || ''; }); });
    }
    LT.$$('.rk-tabs button', el).forEach(function (b) { b.onclick = function () { LT.$$('.rk-tabs button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); draw(b.dataset.k); }; });
    draw(keys[0]);
  };

  /* Hardware elegido */
  W.hw = function (el) {
    var H = [['Core Barcelona', 'Cisco Catalyst 9500-24Y4C', '2', '24 puertos SFP28 y 4 QSFP28. Enruta las VLAN, HSRP y raíz de STP.', 'core'], ['Core Zaragoza', 'Cisco Catalyst 9300-48P', '2', 'Capa 3 para un almacén de 150 puestos, PoE+.', 'core'],
      ['Acceso', 'Cisco Catalyst 9300L-48P-4X', '14', '48 puertos PoE+ para teléfonos, AP y cámaras, 4 × 10 Gb de subida por fibra.', 'acc'], ['Routers', 'Cisco ISR 4331', '4', 'Uno principal y uno de respaldo por sede, cada uno a un operador distinto. VPN IPsec por hardware.', 'rt'],
      ['Firewall', 'Cisco ASA 5506-X', '2', 'Perímetro de cada sede: outside, wanbak, inside y corebak.', 'fw'], ['Servidores', 'Dell PowerEdge R450', '4', 'Hipervisores con RAID por hardware: AD, DHCP, DNS, RADIUS, web y servicios.', 'srv'],
      ['Wi-Fi', 'AP Wi-Fi 6 + 2 controladoras', '71', 'Cobertura de oficinas y nave; SSID por VLAN.', 'ap'], ['SAI', 'APC Smart-UPS SRT (online)', '6', 'De 1.000 a 6.000 VA, con tarjeta de red y SNMP v3.', 'ups']];
    el.innerHTML = '<div class="w-hw">' + H.map(function (x) { return '<article class="hwc rv t-' + x[4] + '"><span class="lbl">' + x[0] + '</span><b>' + x[1] + '</b><span class="qty">× ' + x[2] + '</span><p>' + x[3] + '</p></article>'; }).join('') + '</div>';
  };
})();
