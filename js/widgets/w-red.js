/* Widgets del capítulo 3: direccionamiento, VLAN, VPN, OSPF, NAT, DNS y firewall */
(function () {
  var LT = window.LT, W = LT.W = LT.W || {}, esc = LT.esc;
  var vl = function (v) { return LT.D.vl(v); };
  var run = function (r) { return '<button class="btn sm ghost tr-run" data-run="' + esc(r) + '">Ejecutar en el Tracer</button>'; };
  function bindRuns(el) { LT.$$('.tr-run', el).forEach(function (b) { b.onclick = function () { LT.Tracer.runInWindow(b.dataset.run); }; }); }

  /* Decodificador 10.SEDE.VLAN.HOST */
  W.ipdecode = function (el) {
    el.innerHTML = '<div class="w-ipd"><label><span class="lbl">Escribí una IP de la empresa</span><input value="10.1.20.11" spellcheck="false"></label><div class="ipd-o"></div><div class="ipd-ex">' + ['10.1.20.11', '10.2.30.5', '10.1.99.2', '10.2.50.10', '10.1.40.11'].map(function (x) { return '<button class="chip">' + x + '</button>'; }).join('') + '</div></div>';
    var inp = LT.$('input', el), o = LT.$('.ipd-o', el);
    function upd() {
      var p = inp.value.trim().split('.');
      if (p.length !== 4 || p.some(function (x) { return !/^\d+$/.test(x) || +x > 255; })) { o.innerHTML = '<p class="muted">Formato: 10.SEDE.VLAN.HOST</p>'; return; }
      var site = { 1: 'Barcelona', 2: 'Zaragoza' }[p[1]], s = LT.NET.subnetOf(inp.value), dev = LT.NET.find(inp.value);
      o.innerHTML = '<div class="ipd-b"><span class="o1"><b>' + p[0] + '</b><small>privada</small></span><span class="o2"><b>' + p[1] + '</b><small>' + (site || 'sede ?') + '</small></span><span class="o3" style="--c:var(--v' + p[2] + ', var(--muted))"><b>' + p[2] + '</b><small>' + (s ? 'VLAN ' + s.vlan : p[1] === '0' ? 'túnel' : 'VLAN ?') + '</small></span><span class="o4"><b>' + p[3] + '</b><small>' + (+p[3] === 1 ? 'puerta HSRP' : +p[3] === 2 ? 'SVI CORE1' : +p[3] === 3 ? 'SVI CORE2' : 'host') + '</small></span></div>' +
        (s ? '<p><b>' + s.net + '/' + s.cidr + '</b> · máscara ' + s.mask + ' · puerta ' + s.gw + ' · broadcast ' + s.bc + ' · ' + s.usable + ' hosts útiles' + (dev ? ' · <b>' + dev + '</b> en el Tracer' : '') + '</p>' : '<p class="muted">Fuera de las redes de usuario.</p>');
    }
    inp.oninput = upd; LT.$$('.ipd-ex button', el).forEach(function (b) { b.onclick = function () { inp.value = b.textContent; upd(); }; });
    upd();
  };

  /* VLSM: necesidad, +20 % y capacidad de cada subred */
  W.vlsm = function (el, o) {
    var site = o.site || 'BCN', rows = LT.SUBNETS.filter(function (s) { return s.site === site; });
    var max = Math.max.apply(0, rows.map(function (r) { return r.usable; }));
    el.innerHTML = '<div class="w-vlsm"><div class="vs-h"><span class="lbl">' + (site === 'BCN' ? 'Barcelona · 10.1.0.0/16' : 'Zaragoza · 10.2.0.0/16') + '</span><ul class="leg"><li><i class="need"></i>Hosts</li><li><i class="plus"></i>+20 %</li><li><i class="cap"></i>Capacidad de la subred</li></ul></div>' +
      rows.map(function (r) { return '<div class="vs-r" tabindex="0"><span class="vs-l">' + vl(r.vlan) + '<b>' + r.net + '/' + r.cidr + '</b></span><div class="vs-b"><i class="cap" style="--w:' + (r.usable / max * 100) + '%"></i><i class="plus" style="--w:' + (r.plus / max * 100) + '%"></i><i class="need" style="--w:' + (r.hosts / max * 100) + '%"></i></div><span class="vs-n">' + r.hosts + ' → ' + r.plus + ' / ' + r.usable + '</span><div class="vs-tip">Máscara ' + r.mask + ' · puerta ' + r.gw + ' · broadcast ' + r.bc + (r.changed ? '<br><b>Cambio:</b> ' + r.changed : '') + '</div></div>'; }).join('') + '</div>';
  };

  /* DHCP: DORA con relay y snooping */
  W.dhcp = function (el) {
    var steps = [['DISCOVER', 0, 3, 'El PC no tiene IP y pregunta por broadcast.'], ['DISCOVER (relay)', 2, 3, 'El core lo reenvía al servidor con ip helper-address 10.1.50.10.'], ['OFFER', 3, 0, 'SRV-HV01 ofrece 10.1.20.11 /23, puerta 10.1.20.1 y DNS 10.1.50.10. Entra por un troncal trusted: el snooping lo deja pasar.'], ['REQUEST', 0, 3, 'El PC acepta la oferta.'], ['ACK', 3, 0, 'Confirmado. El switch apunta MAC, IP, VLAN y puerto en la tabla de bindings.']];
    var nodes = [['P1-ADM-03', 'PC'], ['BCN-P1-ACC1', 'snooping'], ['BCN-CORE1', 'ip helper'], ['SRV-HV01', 'DHCP']];
    el.innerHTML = '<div class="w-dora"><div class="dr-n">' + nodes.map(function (n) { return '<div><b>' + n[0] + '</b><small>' + n[1] + '</small></div>'; }).join('') + '<i class="dr-p"></i></div><ol class="dr-s">' + steps.map(function (s) { return '<li><b>' + s[0] + '</b><span>' + s[3] + '</span></li>'; }).join('') + '</ol><div class="row-btn"><button class="btn sun go">Pedir IP</button>' + run('P1-ADM-03|ipconfig /renew') + '</div></div>';
    var p = LT.$('.dr-p', el), lis = LT.$$('.dr-s li', el), busy = false;
    LT.$('.go', el).onclick = function () {
      if (busy) return; busy = true; lis.forEach(function (l) { l.classList.remove('on'); });
      var i = 0;
      (function nx() {
        if (i >= steps.length) { busy = false; return; }
        var s = steps[i], a = i === 1 ? 1 : s[1], b = s[2];
        lis[i].classList.add('on');
        p.style.transition = 'none'; p.style.left = (a * 33.33 + 8) + '%'; p.className = 'dr-p ' + (i % 2 ? 'r' : '');
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.transition = 'left .9s cubic-bezier(.4,0,.2,1)'; p.style.left = (b * 33.33 + 8) + '%'; }); });
        i++; setTimeout(nx, LT.reduce ? 10 : 1200);
      })();
    };
    bindRuns(el);
  };

  /* Consumo total */
  W.usage = function (el) {
    var sites = ['BCN', 'ZGZ'].map(function (s) { var r = LT.SUBNETS.filter(function (x) { return x.site === s; }); return { s: s, need: r.reduce(function (a, x) { return a + x.plus; }, 0), cap: r.reduce(function (a, x) { return a + x.usable; }, 0), blocks: r.length }; });
    el.innerHTML = '<div class="w-usage">' + sites.map(function (x) { var pc = Math.round(x.need / x.cap * 100); return '<div class="us"><span class="lbl">' + (x.s === 'BCN' ? 'Barcelona' : 'Zaragoza') + '</span><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" class="bg"/><circle cx="60" cy="60" r="48" class="fg" style="--p:' + pc + '"/></svg><b>' + pc + ' %</b><small>' + x.need + ' direcciones necesarias (con el 20 %) de ' + x.cap + ' útiles en ' + x.blocks + ' subredes. El resto del /16 queda libre para crecer.</small></div>'; }).join('') + '</div>';
  };

  /* Estructura del prefijo IPv6 */
  W.v6 = function (el) {
    var parts = [['2001:db8', 'Prefijo de documentación (en producción, el que asigne el operador)'], ['acad', 'Bloque de la empresa: el /48'], ['1', 'Sede: 1 Barcelona, 2 Zaragoza'], ['020', 'VLAN, igual que en IPv4'], ['::/64', 'Interfaz: SLAAC con EUI-64']];
    el.innerHTML = '<div class="w-v6"><div class="v6-a">' + parts.map(function (p, i) { return '<span data-i="' + i + '">' + p[0] + (i < 3 ? (i === 2 ? '' : ':') : '') + '</span>'; }).join('') + '</div><p class="v6-d">Pasá por cada bloque.</p><div class="v6-ex">' + LT.SUBNETS.map(function (s) { return '<span>' + vl(s.vlan) + '<code>' + s.v6.toUpperCase() + '</code><small>' + s.site + '</small></span>'; }).join('') + '</div></div>';
    LT.$$('.v6-a span', el).forEach(function (s) { s.addEventListener('mouseenter', function () { LT.$('.v6-d', el).textContent = parts[+s.dataset.i][1]; LT.$$('.v6-a span', el).forEach(function (x) { x.classList.toggle('on', x === s); }); }); });
  };

  /* EUI-64 paso a paso */
  W.eui64 = function (el) {
    el.innerHTML = '<div class="w-eui"><label><span class="lbl">MAC del equipo</span><input value="0009.3023.46BA" spellcheck="false"></label><ol class="eu-s"></ol><div class="row-btn">' + run('P1-ADM-03|ping 2001:db8:acad:1050:209:30ff:fe23:46ba') + '</div></div>';
    var inp = LT.$('input', el);
    function upd() {
      var h = inp.value.replace(/[^0-9a-f]/gi, '').toUpperCase();
      if (h.length !== 12) { LT.$('.eu-s', el).innerHTML = '<li>Escribí 12 dígitos hexadecimales.</li>'; return; }
      var a = h.slice(0, 6), b = h.slice(6), first = parseInt(h.slice(0, 2), 16), flip = (first ^ 2).toString(16).toUpperCase().padStart(2, '0');
      var eui = flip + h.slice(2, 6) + 'FFFE' + b, grp = eui.match(/..../g).map(function (x) { return x.replace(/^0+(?=.)/, ''); }).join(':');
      LT.$('.eu-s', el).innerHTML = '<li><span>Partir la MAC</span><code>' + a + ' | ' + b + '</code></li><li><span>Meter FFFE en medio</span><code>' + a + '<mark>FFFE</mark>' + b + '</code></li><li><span>Invertir el séptimo bit (' + h.slice(0, 2) + ' → ' + flip + ')</span><code><mark>' + flip + '</mark>' + h.slice(2, 6) + 'FFFE' + b + '</code></li><li><span>Con el prefijo de la VLAN 50</span><code>2001:DB8:ACAD:1050:<mark>' + grp + '</mark></code></li>';
    }
    inp.oninput = upd; upd(); bindRuns(el);
  };

  /* Tarjetas de VLAN */
  W.vlancards = function (el) {
    el.innerHTML = '<div class="w-vlc">' + LT.VLANS.map(function (v) { return '<article class="vlc rv" style="--c:var(' + v.color + ')"><header><b>' + v.id + '</b><span>' + v.name + '<small>' + v.es + '</small></span></header><p>' + v.purpose + '</p><dl><dt>Hosts</dt><dd>' + v.hosts + ' → ' + v.plus + '</dd><dt>Acceso</dt><dd>' + v.access + '</dd><dt>Dónde</dt><dd>' + v.where + '</dd></dl><p class="rule">' + v.rule + '</p></article>'; }).join('') + '</div>';
  };

  /* Reparto entre sedes */
  W.split = function (el) {
    var ids = [10, 20, 30, 40, 50, 99];
    el.innerHTML = '<div class="w-split">' + ids.map(function (v) {
      var b = LT.SUBNETS.filter(function (s) { return s.site === 'BCN' && s.vlan === v; })[0], z = LT.SUBNETS.filter(function (s) { return s.site === 'ZGZ' && s.vlan === v; })[0];
      var bh = b ? b.hosts : 0, zh = z ? z.hosts : 0, t = bh + zh || 1;
      return '<div class="sp">' + vl(v) + '<div class="sp-b"><i class="b" style="--w:' + (bh / t * 100) + '%">' + (bh ? bh : '') + '</i><i class="z" style="--w:' + (zh / t * 100) + '%">' + (zh ? zh : '') + '</i></div></div>';
    }).join('') + '<ul class="leg"><li><i class="b"></i>Barcelona</li><li><i class="z"></i>Zaragoza</li></ul></div>';
  };

  /* Matriz de acceso entre VLAN */
  var MX = {
    10: { 10: 'y', 20: 'y', 30: 'n', 40: 'n', 50: 'y', 99: 'n', I: 'y' },
    20: { 10: 'y', 20: 'y', 30: 'n', 40: 'n', 50: 'y', 99: 'n', I: 'y' },
    30: { 10: 'n', 20: 'n', 30: 'y', 40: 'n', 50: 'p', 99: 'n', I: 'n' },
    40: { 10: 'n', 20: 'n', 30: 'n', 40: 'y', 50: 'p', 99: 'n', I: 'p' },
    50: { 10: 'y', 20: 'y', 30: 'n', 40: 'n', 50: 'y', 99: 'p', I: 'y' },
    99: { 10: 'y', 20: 'y', 30: 'p', 40: 'n', 50: 'y', 99: 'y', I: 'y' }
  };
  var WHY = {
    '30>50': 'Solo DHCP, DNS a SRV-ZGZ01, MySQL 3306 a SRV-HV02 y web a SRV-HV03 (ACL-OPERARIOS-IN).', '40>50': 'Solo DHCP y DNS. Ojo: las líneas 30 y 40 de ACL-INVITADOS-IN dejan www y 443 hacia cualquier destino, también la web interna.',
    '40>I': 'Solo HTTP, HTTPS y DNS. Ni ping.', '30>I': 'Sin salida libre a Internet: los operarios solo usan los servicios corporativos.', '50>99': 'Solo UDP desde los DC, TCP establecido y echo-reply (ACL-GESTION-OUT).',
    '99>30': 'Llega, pero ACL-OPERARIOS-IN tira las respuestas que no son de los servicios permitidos.', 'x>99': 'ACL-GESTION-OUT: a la VLAN 99 solo entra el NOC.', 'x>30': 'Las respuestas de la VLAN 30 las para ACL-OPERARIOS-IN.', 'x>40': 'Las respuestas de los invitados las para ACL-INVITADOS-IN (deny ip any any).', '40>x': 'ACL-INVITADOS-IN: deny ip any any.', '30>x': 'ACL-OPERARIOS-IN: deny ip any any.'
  };
  var PROBE = { 10: 'P3-DIR-01', 20: 'P1-ADM-03', 30: 'ZGZ-MUE-01', 40: 'P0-INV-01', 50: 'SRV-HV01', 99: 'P3-GES-01' };
  var TGT = { 10: '10.1.10.11', 20: '10.1.20.5', 30: '10.2.30.5', 40: '10.1.40.11', 50: '10.1.50.10', 99: '10.1.99.11', I: '203.0.113.10' };
  W.vlanmatrix = function (el) {
    var ids = [10, 20, 30, 40, 50, 99, 'I'];
    var h = '<div class="w-mx"><table><thead><tr><th>Desde ↓ hacia →</th>' + ids.map(function (v) { return '<th>' + (v === 'I' ? 'Internet' : vl(v)) + '</th>'; }).join('') + '</tr></thead><tbody>';
    [10, 20, 30, 40, 50, 99].forEach(function (a) { h += '<tr><th>' + vl(a) + '</th>' + ids.map(function (b) { var c = MX[a][b]; return '<td><button class="mx ' + c + '" data-a="' + a + '" data-b="' + b + '" aria-label="' + a + ' a ' + b + '">' + (c === 'y' ? 'Sí' : c === 'p' ? 'Parcial' : 'No') + '</button></td>'; }).join('') + '</tr>'; });
    h += '</tbody></table><div class="mx-d"><span class="lbl">Elegí una celda</span><p>Lo que pasa cuando un equipo de una VLAN intenta llegar a otra. Cada celda se puede probar en el Tracer.</p></div></div>';
    el.innerHTML = h;
    LT.$$('.mx', el).forEach(function (b) {
      b.onclick = function () {
        LT.$$('.mx', el).forEach(function (x) { x.classList.toggle('sel', x === b); });
        var a = b.dataset.a, t = b.dataset.b, c = MX[a][t];
        var why = WHY[a + '>' + t] || (c === 'y' ? (a === t ? 'Misma VLAN: capa 2, sin pasar por ninguna ACL.' : 'Enrutado por el core sin ninguna ACL en el camino.') : WHY['x>' + t] || WHY[a + '>x'] || '');
        var src = PROBE[a], dst = TGT[t];
        if (a === '30' || a === 30) dst = { 10: '10.2.10.5', 20: '10.1.20.5', 30: '10.2.30.5', 40: '10.2.40.11', 50: '10.2.50.10', 99: '10.2.99.11', I: '203.0.113.10' }[t];
        LT.$('.mx-d', el).innerHTML = '<span class="lbl">VLAN ' + a + ' → ' + (t === 'I' ? 'Internet' : 'VLAN ' + t) + '</span><p><span class="chip ' + (c === 'y' ? 'ok' : c === 'p' ? 'warn' : 'bad') + '">' + (c === 'y' ? 'Permitido' : c === 'p' ? 'Parcial' : 'Bloqueado') + '</span> ' + why + '</p>' + (src && dst && src !== LT.NET.find(dst) ? run(src + '|ping ' + dst) : '');
        bindRuns(el);
      };
    });
  };

  /* VPN: encapsulado y cifrado paso a paso */
  W.vpn = function (el) {
    var st = [
      ['Paquete original', '<span class="pk ip">IP 10.1.20.11 → 10.2.50.10</span><span class="pk data">ICMP echo</span>', 'Sale de P1-ADM-03 hacia SRV-ZGZ01. El ASA lo deja pasar por INSIDE_OUT línea 1.'],
      ['GRE', '<span class="pk ip2">IP 85.100.1.2 → 85.100.2.2</span><span class="pk gre">GRE</span><span class="pk ip">IP 10.1.20.11 → 10.2.50.10</span><span class="pk data">ICMP</span>', 'BCN-RT1 lo mete en el túnel: GRE permite pasar OSPF y multicast entre sedes.'],
      ['IPsec ESP', '<span class="pk ip2">IP 85.100.1.2 → 85.100.2.2</span><span class="pk esp">ESP spi 0x8F3A1C22</span><span class="pk enc">4F 9A E1 07 C2 3D 88 B1 …</span><span class="pk esp">HMAC</span>', 'El crypto map CMAP-VPN lo cifra con AES-256 y lo firma con SHA. Esto es lo que viaja por Internet: ilegible.'],
      ['Llega a Zaragoza', '<span class="pk ip">IP 10.1.20.11 → 10.2.50.10</span><span class="pk data">ICMP echo</span>', 'ZGZ-RT1 descifra, quita el GRE y entrega. TTL 122: core, firewall y router de cada lado.']
    ];
    el.innerHTML = '<div class="w-vpn"><div class="vp-map"><span class="s">BCN-RT1<small>85.100.1.2</small></span><div class="vp-tun"><i class="vp-dot"></i><em>Internet</em></div><span class="s">ZGZ-RT1<small>85.100.2.2</small></span></div><div class="vp-steps">' + st.map(function (s, i) { return '<button data-i="' + i + '"' + (i ? '' : ' class="on"') + '>' + (i + 1) + '. ' + s[0] + '</button>'; }).join('') + '</div><div class="vp-pk"></div><p class="vp-d"></p><div class="row-btn">' + run('P1-ADM-03|ping 10.2.50.10') + run('BCN-RT1|show crypto ipsec sa') + '</div></div>';
    function show(i) { LT.$('.vp-pk', el).innerHTML = st[i][1]; LT.$('.vp-d', el).textContent = st[i][2]; LT.$$('.vp-steps button', el).forEach(function (b) { b.classList.toggle('on', +b.dataset.i === i); }); LT.$('.vp-dot', el).style.left = [2, 30, 60, 96][i] + '%'; LT.$('.w-vpn', el).classList.toggle('enc', i === 2); }
    LT.$$('.vp-steps button', el).forEach(function (b) { b.onclick = function () { show(+b.dataset.i); }; });
    show(0); bindRuns(el);
  };

  /* OSPF: anillo, MD5 y router pirata */
  W.ospf = function (el) {
    var P = { 'ISP-1': [200, 70], 'ISP-3': [400, 70], 'ISP-2': [200, 200], 'ISP-4': [400, 200], 'BCN-RT1': [60, 70], 'BCN-RT2': [60, 200], 'ZGZ-RT1': [540, 70], 'ZGZ-RT2': [540, 200] };
    var E = [['ISP-1', 'ISP-2'], ['ISP-2', 'ISP-4'], ['ISP-4', 'ISP-3'], ['ISP-3', 'ISP-1'], ['BCN-RT1', 'ISP-1', 's'], ['BCN-RT2', 'ISP-2', 's'], ['ZGZ-RT1', 'ISP-3', 's'], ['ZGZ-RT2', 'ISP-4', 's'], ['BCN-RT1', 'BCN-RT2'], ['ZGZ-RT1', 'ZGZ-RT2']];
    var h = '<div class="w-ospf"><svg viewBox="0 0 600 280">' + E.map(function (e) { var a = P[e[0]], b = P[e[1]]; return '<line class="oe ' + (e[2] || '') + '" data-e="' + e[0] + '-' + e[1] + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'; }).join('') +
      '<path class="ot" d="M60 70 Q 300 -40 540 70"/>' + Object.keys(P).map(function (k) { return '<g class="on" data-n="' + k + '" transform="translate(' + P[k][0] + ' ' + P[k][1] + ')"><circle r="20"/><text y="38">' + k + '</text></g>'; }).join('') +
      '<g class="rogue" transform="translate(300 255)"><circle r="16"/><text y="5">?</text></g></svg><div class="os-ctl"><button class="btn sm fl">Inundar LSA</button><button class="btn sm ghost rg">Conectar router pirata</button><button class="btn sm ghost dn">Caída de ISP-1</button></div><pre class="os-log">ISP-1 · área 0 · autenticación message-digest (MD5)</pre><div class="row-btn">' + run('ISP-1|show ip ospf interface GigabitEthernet0/0/1') + run('BCN-RT1|show ip route') + '</div></div>';
    el.innerHTML = h;
    var log = LT.$('.os-log', el), svg = LT.$('svg', el);
    var say = function (t) { log.textContent = t; };
    LT.$('.fl', el).onclick = function () { svg.classList.remove('flood'); void svg.offsetWidth; svg.classList.add('flood'); say('LSA tipo 1 de cada router por todo el anillo. Adyacencias FULL:\nISP-1 ↔ 2.2.2.2 (ISP-2) · 3.3.3.3 (ISP-3)\nBCN-RT1 ↔ 10.255.2.1 (ZGZ-RT1, Tunnel0) · 10.255.1.2 (BCN-RT2)'); };
    LT.$('.rg', el).onclick = function () { svg.classList.add('pir'); say('%OSPF-4-ERRRCV: Received invalid packet: mismatched authentication key from 200.0.0.99, GigabitEthernet0/0/1\nSin la clave MD5 no hay adyacencia: la tabla de rutas no cambia.'); };
    LT.$('.dn', el).onclick = function () { svg.classList.toggle('isp1'); say(svg.classList.contains('isp1') ? 'ISP-1 cae. OSPF recalcula: Internet llega a 85.100.1.0/30 por ISP-2 → BCN-RT2. BCN sigue conectada por el router de respaldo.' : 'ISP-1 vuelve. Las rutas se recalculan en segundos.'); };
    bindRuns(el);
  };

  /* NAT: PAT de salida y estático de la web */
  W.nat = function (el) {
    el.innerHTML = '<div class="w-nat"><div class="nt-row"><div class="nt-c in"><span class="lbl">Dentro</span><b class="a">10.1.20.11:1025</b></div><div class="nt-r"><span class="lbl">BCN-RT1</span><b>NAT</b></div><div class="nt-c out"><span class="lbl">Fuera</span><b class="b">85.100.1.2:1025</b></div></div><table class="t mini"><thead><tr><th>Pro</th><th>Inside global</th><th>Inside local</th><th>Outside global</th></tr></thead><tbody><tr class="st"><td>---</td><td class="m">85.100.1.18</td><td class="m">10.1.50.12</td><td>---</td></tr></tbody></table><div class="row-btn"><button class="btn sm sun o">Un PC sale a Internet</button><button class="btn sm ghost i">Alguien entra a la web</button>' + run('BCN-RT1|show ip nat translations') + '</div></div>';
    var tb = LT.$('tbody', el), n = 1025;
    function add(pro, ig, il, og, cls) { var tr = LT.h('tr.' + cls, { html: '<td>' + pro + '</td><td class="m">' + ig + '</td><td class="m">' + il + '</td><td class="m">' + og + '</td>' }); tb.appendChild(tr); setTimeout(function () { tr.classList.add('old'); }, 6000); }
    LT.$('.o', el).onclick = function () { n++; LT.$('.a', el).textContent = '10.1.20.' + (10 + n % 40) + ':' + n; LT.$('.b', el).textContent = '85.100.1.2:' + n; LT.$('.nt-row', el).className = 'nt-row go-out'; add('icmp', '85.100.1.2:' + n, '10.1.20.' + (10 + n % 40) + ':' + n, '203.0.113.10:' + n, 'dyn'); };
    LT.$('.i', el).onclick = function () { LT.$('.a', el).textContent = '10.1.50.12:80'; LT.$('.b', el).textContent = '85.100.1.18:80'; LT.$('.nt-row', el).className = 'nt-row go-in'; add('tcp', '85.100.1.18:80', '10.1.50.12:80', '203.0.113.10:1025', 'web'); };
    bindRuns(el);
  };

  /* DNS: la misma web vista desde dentro y desde fuera */
  W.dns = function (el) {
    el.innerHTML = '<div class="w-dns"><div class="seg"><button class="on" data-v="in">Desde dentro</button><button data-v="out">Desde Internet</button></div><div class="dn-flow"><span class="q">www.logitrans.com ?</span><i></i><span class="srv"></span><i></i><span class="a"></span></div><div class="row-btn">' + run('PC-INTERNET|nslookup www.logitrans.com') + '</div></div>';
    function v(m) { LT.$$('.seg button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.v === m); }); LT.$('.srv', el).innerHTML = m === 'in' ? 'SRV-HV01<small>10.1.50.10</small>' : 'DNS-PUBLICO<small>203.0.113.53</small>'; LT.$('.a', el).innerHTML = m === 'in' ? '10.1.50.12<small>directo a SRV-HV03</small>' : '85.100.1.18<small>NAT estático de BCN-RT1</small>'; }
    LT.$$('.seg button', el).forEach(function (b) { b.onclick = function () { v(b.dataset.v); }; }); v('in'); bindRuns(el);
  };

  /* ASA: interfaces y probador de reglas (sin sumar contadores) */
  W.asa = function (el) {
    var tests = [['Internet → web (HTTP)', 'OUTSIDE_IN', { src: '203.0.113.10', dst: '10.1.50.12', p: 'tcp', port: 80 }], ['Internet → web (HTTPS)', 'OUTSIDE_IN', { src: '203.0.113.10', dst: '10.1.50.12', p: 'tcp', port: 443 }], ['Internet → ping a la IP pública', 'OUTSIDE_IN', { src: '203.0.113.10', dst: '10.1.50.12', p: 'icmp', icmp: 'echo' }], ['Internet → SMB 445', 'OUTSIDE_IN', { src: '203.0.113.10', dst: '10.1.50.12', p: 'tcp', port: 445 }], ['Zaragoza → Barcelona', 'OUTSIDE_IN', { src: '10.2.30.11', dst: '10.1.50.10', p: 'icmp', icmp: 'echo' }],
      ['PC → web de Internet', 'INSIDE_OUT', { src: '10.1.20.11', dst: '203.0.113.10', p: 'tcp', port: 80 }], ['PC → DNS de Internet', 'INSIDE_OUT', { src: '10.1.20.11', dst: '203.0.113.53', p: 'udp', port: 53 }], ['PC → FTP de Internet', 'INSIDE_OUT', { src: '10.1.20.11', dst: '203.0.113.53', p: 'tcp', port: 21 }]];
    el.innerHTML = '<div class="w-asa"><div class="as-if"><span><b>outside</b><small>Gi1/2 · nivel 0</small></span><span><b>wanbak</b><small>Gi1/3 · nivel 0</small></span><span class="hi"><b>inside</b><small>Gi1/4 · nivel 100</small></span><span class="hi"><b>corebak</b><small>Gi1/5 · nivel 100</small></span></div><label><span class="lbl">Probá un paquete contra las listas</span><select>' + tests.map(function (t, i) { return '<option value="' + i + '">' + t[0] + '</option>'; }).join('') + '</select></label><ol class="as-l"></ol><div class="row-btn">' + run('BCN-FW|show access-list') + '</div></div>';
    var sel = LT.$('select', el);
    function upd() {
      var t = tests[+sel.value], A = LT.NET.acl['BCN-FW'][t[1]], hit = -1;
      for (var i = 0; i < A.l.length; i++) if (A.l[i].m(t[2])) { hit = i; break; }
      LT.$('.as-l', el).innerHTML = '<li class="h">' + t[1] + '</li>' + A.l.map(function (r, i) { return '<li class="' + (i === hit ? (r.t.indexOf('deny') >= 0 ? 'hit bad' : 'hit') : i > hit ? 'skip' : '') + '"><i>' + r.s + '</i><code>' + r.t + '</code><small>hitcnt=' + r.h + '</small></li>'; }).join('');
    }
    sel.onchange = upd; upd(); bindRuns(el);
  };
})();
