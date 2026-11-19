/* Widgets del capítulo 4: Port Security, DHCP snooping, STP, HSRP y ACL.
   Usan el mismo estado que el Tracer: lo que pasa acá se ve en las consolas y al revés. */
(function () {
  var LT = window.LT, W = LT.W = LT.W || {}, esc = LT.esc, N = LT.NET, S = N.state, C = LT.CLI;
  var run = function (r, t) { return '<button class="btn sm ghost tr-run" data-run="' + esc(r) + '">' + (t || 'Ejecutar en el Tracer') + '</button>'; };
  function bindRuns(el) { LT.$$('.tr-run', el).forEach(function (b) { b.onclick = function () { LT.Tracer.runInWindow(b.dataset.run); }; }); }
  function feed(el, dev) {
    var pre = LT.$('.con', el);
    LT.on('console', function (m) { if (pre.isConnected && m.dev === dev) { m.lines.forEach(function (l) { var s = LT.h('span', { text: l + '\n' }); pre.appendChild(s); }); pre.scrollTop = 1e9; } });
  }

  /* Port Security */
  W.portsec = function (el) {
    el.innerHTML = '<div class="w-ps"><div class="ps-sw"><span class="lbl">BCN-P1-ACC1</span><div class="ps-ports"><div class="pp" data-p="Fa0/1"><i></i><b>Fa0/1</b><small>AP · máx. 32 · Restrict</small></div><div class="pp" data-p="Fa0/2"><i></i><b>Fa0/2</b><small>Teléfono + PC · máx. 3</small></div><div class="pp" data-p="Fa0/3"><i></i><b>Fa0/3</b><small>P1-ADM-03 · máx. 1</small></div></div></div>' +
      '<div class="ps-pc"><div class="pc legit"><b>P1-ADM-03</b><small>00D0.97A1.3C21 · sticky</small></div><div class="pc intr"><b>PC intruso</b><small>000C.8587.538A</small></div></div>' +
      '<div class="row-btn"><button class="btn sm sun x">Conectar el intruso en P1-R02</button><button class="btn sm ghost r">El NOC levanta el puerto</button>' + run('BCN-P1-ACC1|show port-security interface FastEthernet0/3') + '</div><pre class="con"></pre></div>';
    function paint() { var e = !!S.err['BCN-P1-ACC1:Fa0/3']; LT.$('[data-p="Fa0/3"]', el).classList.toggle('err', e); LT.$('.w-ps', el).classList.toggle('intr-on', !!S.intruder); LT.$('.con', el).classList.toggle('on', e); }
    LT.$('.x', el).onclick = function () { LT.ACTS.intruder(); C.l2('P1-ADM-03'); N.trace('P1-ADM-03', '10.1.20.1'); paint(); };
    LT.$('.r', el).onclick = function () { LT.ACTS.restore(); C.log('BCN-P1-ACC1', ['%LINK-5-CHANGED: Interface FastEthernet0/3, changed state to up', '%LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/3, changed state to up']); paint(); };
    feed(el, 'BCN-P1-ACC1'); LT.on('net', function () { if (el.isConnected) paint(); }); paint(); bindRuns(el);
  };

  /* DHCP snooping */
  W.snoop = function (el) {
    el.innerHTML = '<div class="w-sn"><div class="sn-d"><div class="n srv"><b>SRV-HV01</b><small>servidor legítimo</small></div><div class="n sw"><b>BCN-P1-ACC1</b><small>Gi0/1, Gi0/2 trusted · Fa0/x untrusted, 10 pps</small></div><div class="n rog"><b>Servidor pirata</b><small>puerta falsa 10.1.20.66</small></div><div class="n pc"><b>PC</b><small>pide IP</small></div><i class="pk"></i></div>' +
      '<div class="row-btn"><button class="btn sm sun lg">Oferta del servidor legítimo</button><button class="btn sm ghost rg">Oferta del pirata</button><button class="btn sm ghost fl">Ráfaga de 50 DISCOVER</button>' + run('BCN-P1-ACC1|show ip dhcp snooping binding') + '</div><pre class="con"></pre></div>';
    var d = LT.$('.sn-d', el), pre = LT.$('.con', el);
    function go(cls, lines) { d.className = 'sn-d'; void d.offsetWidth; d.className = 'sn-d ' + cls; pre.textContent = lines.join('\n'); pre.classList.add('on'); }
    LT.$('.lg', el).onclick = function () { go('legit', ['DHCPOFFER entra por Gi0/1 (trusted): reenviado.', 'Binding: 00:D0:97:A1:3C:21  10.1.20.11  dhcp-snooping  VLAN 20  FastEthernet0/3']); };
    LT.$('.rg', el).onclick = function () { C.rogueDhcp(); go('rogue', S.logs['BCN-P1-ACC1'].slice(-2)); };
    LT.$('.fl', el).onclick = function () { go('flood', ['%DHCP_SNOOPING-4-DHCP_SNOOPING_ERRDISABLE_WARNING: DHCP Snooping received 10 DHCP packets on interface Fa0/7', '%PM-4-ERR_DISABLE: dhcp-rate-limit error detected on Fa0/7, putting Fa0/7 in err-disable state', 'El ámbito del servidor no se vacía: el puerto cae antes.']); };
    bindRuns(el);
  };

  /* STP: raíz, bloqueo y corte del troncal */
  W.stp = function (el) {
    el.innerHTML = '<div class="w-stp"><svg viewBox="0 0 520 260"><g class="nd c1"><rect x="60" y="30" width="140" height="44" rx="5"/><text x="130" y="50">BCN-CORE1</text><text class="s" x="130" y="65">raíz · 24576</text></g><g class="nd c2"><rect x="320" y="30" width="140" height="44" rx="5"/><text x="390" y="50">BCN-CORE2</text><text class="s" x="390" y="65">28672</text></g>' +
      '<line class="po" x1="200" y1="52" x2="320" y2="52"/><text class="po-t" x="260" y="44">Po1 · LACP</text><g class="nd acc"><rect x="190" y="190" width="140" height="44" rx="5"/><text x="260" y="210">BCN-P1-ACC1</text><text class="s" x="260" y="225">32768</text></g>' +
      '<line class="g1" x1="130" y1="74" x2="230" y2="190"/><line class="g2" x1="390" y1="74" x2="290" y2="190"/><text class="t1" x="150" y="140">Gi0/1</text><text class="t2" x="350" y="140">Gi0/2</text><g class="rog"><rect x="20" y="200" width="100" height="34" rx="4"/><text x="70" y="221">switch pirata</text></g><line class="rl" x1="120" y1="217" x2="190" y2="214"/></svg>' +
      '<div class="stp-st"></div><div class="row-btn"><button class="btn sm sun cut">Cortar el troncal Gi0/1</button><button class="btn sm ghost bp">Conectar un switch en una roseta</button><button class="btn sm ghost rs">Restaurar</button>' + run('BCN-P1-ACC1|show spanning-tree vlan 20') + '</div><pre class="con"></pre></div>';
    function paint() {
      var w = LT.$('.w-stp', el); w.classList.toggle('cut', !!S.cut); w.classList.toggle('bpdu', !!S.rogueSw);
      LT.$('.stp-st', el).innerHTML = S.cut ? '<span class="chip bad">Gi0/1 caído</span> <span class="chip ok">Gi0/2 Root FWD</span> El tráfico sigue por el CORE2 sin cortar nada.' : '<span class="chip ok">Gi0/1 Root FWD</span> <span class="chip warn">Gi0/2 Altn BLK</span> Sin bucle: el enlace de reserva espera bloqueado.';
    }
    LT.$('.cut', el).onclick = function () { S.cut ? LT.ACTS.uncut() : LT.ACTS.cut(); C.log('BCN-P1-ACC1', [S.cut ? '%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down' : '%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up']); };
    LT.$('.bp', el).onclick = function () { C.bpdu(); };
    LT.$('.rs', el).onclick = function () { LT.ACTS.uncut(); LT.ACTS.restore(); };
    feed(el, 'BCN-P1-ACC1'); LT.on('net', function () { if (el.isConnected) { paint(); LT.$('.cut', el).textContent = S.cut ? 'Levantar Gi0/1' : 'Cortar el troncal Gi0/1'; LT.$('.con', el).classList.toggle('on', true); } }); paint(); bindRuns(el);
  };

  /* HSRP */
  W.hsrp = function (el) {
    el.innerHTML = '<div class="w-hsrp"><div class="hs"><div class="c c1"><b>BCN-CORE1</b><small>10.1.20.2 · prioridad 110</small><span class="chip ok st">Active</span></div><div class="vip"><span class="lbl">Puerta de enlace virtual</span><b>10.1.20.1</b><small>0000.0C9F.F014</small></div><div class="c c2"><b>BCN-CORE2</b><small>10.1.20.3 · prioridad 100</small><span class="chip st">Standby</span></div></div><div class="row-btn"><button class="btn sm sun f">Apagar el CORE1</button>' + run('BCN-CORE1|show standby brief') + '</div><p class="hs-d">Los PC solo conocen la .1. Si el CORE1 cae, el CORE2 toma la IP y la MAC virtuales en unos segundos y nadie cambia nada.</p></div>';
    var down = false;
    LT.$('.f', el).onclick = function (e) {
      down = !down; el.querySelector('.w-hsrp').classList.toggle('down', down); e.target.textContent = down ? 'Encender el CORE1' : 'Apagar el CORE1';
      var s1 = LT.$('.c1 .st', el), s2 = LT.$('.c2 .st', el);
      s1.textContent = down ? 'Caído' : 'Active'; s1.className = 'chip st ' + (down ? 'bad' : 'ok');
      s2.textContent = down ? 'Active' : 'Standby'; s2.className = 'chip st ' + (down ? 'ok' : '');
      LT.$('.hs-d', el).textContent = down ? '%HSRP-6-STATECHANGE: Vlan20 Grp 20 state Standby -> Active. El CORE2 responde por 10.1.20.1. Con preempt, cuando vuelva el CORE1 recupera el papel de Active.' : 'Los PC solo conocen la .1. Si el CORE1 cae, el CORE2 toma la IP y la MAC virtuales en unos segundos y nadie cambia nada.';
    };
    bindRuns(el);
  };

  /* ACL con probador en vivo: manda paquetes reales por el modelo y marca la línea que coincide */
  var ACLS = {
    inv: { dev: 'BCN-CORE1', name: 'ACL-INVITADOS-IN', src: 'P0-INV-01', where: 'Vlan40 · entrada', tests: [['Ping a SRV-HV01', '10.1.50.10', 'icmp'], ['Ping a Zaragoza', '10.2.50.10', 'icmp'], ['Ping a Internet', '203.0.113.10', 'icmp'], ['DNS a SRV-HV01', '10.1.50.10', 'udp', 53], ['Web de Internet (HTTP)', '203.0.113.10', 'tcp', 80], ['Web interna 10.1.50.12 (HTTP)', '10.1.50.12', 'tcp', 80], ['SMB a SRV-HV01', '10.1.50.10', 'tcp', 445]] },
    ges: { dev: 'BCN-CORE1', name: 'ACL-GESTION-OUT', src: 'P1-ADM-03', where: 'Vlan99 · salida', alt: 'P3-GES-01', tests: [['Ping a un switch (10.1.99.4)', '10.1.99.4', 'icmp'], ['SSH al switch (10.1.99.4)', '10.1.99.4', 'tcp', 22], ['Ping desde el NOC a SRV-HV01', '10.1.50.10', 'icmp', null, 'P3-GES-01'], ['Ping desde el NOC a un switch', '10.1.99.4', 'icmp', null, 'P3-GES-01']] },
    ope: { dev: 'ZGZ-CORE1', name: 'ACL-OPERARIOS-IN', src: 'ZGZ-MUE-01', where: 'Vlan30 · entrada', tests: [['Ping a Dirección (10.2.10.5)', '10.2.10.5', 'icmp'], ['Ping a SRV-ZGZ01', '10.2.50.10', 'icmp'], ['DNS a SRV-ZGZ01', '10.2.50.10', 'udp', 53], ['MySQL a SRV-HV02 (3306)', '10.1.50.11', 'tcp', 3306], ['Web corporativa (HTTP)', '10.1.50.12', 'tcp', 80], ['Ping a Internet', '203.0.113.10', 'icmp'], ['SMB a SRV-HV01', '10.1.50.10', 'tcp', 445]] }
  };
  W.acl = function (el, o) {
    var A = ACLS[o.k || 'inv'];
    el.innerHTML = '<div class="w-acl"><div class="acl-h"><span class="lbl">' + A.dev + ' · ' + A.where + '</span><b>' + A.name + '</b></div><ol class="acl-l"></ol><div class="acl-t"><span class="lbl">Mandá un paquete desde ' + A.src + '</span><div class="acl-b">' + A.tests.map(function (t, i) { return '<button class="chip" data-i="' + i + '">' + t[0] + '</button>'; }).join('') + '</div><p class="acl-r">Cada paquete pasa por el mismo modelo que el Tracer y suma en su línea.</p></div><div class="row-btn">' + run(A.dev + '|show access-lists ' + A.name, 'Ver la lista en la consola') + '</div></div>';
    function lines(hit) { var L = N.acl[A.dev][A.name].l; LT.$('.acl-l', el).innerHTML = L.map(function (r) { return '<li class="' + (hit === r ? (r.t.indexOf('deny') >= 0 ? 'hit bad' : 'hit') : '') + '"><i>' + r.s + '</i><code>' + r.t + '</code><b>' + LT.fmt(r.h) + '</b></li>'; }).join(''); }
    LT.$$('.acl-b button', el).forEach(function (b) {
      b.onclick = function () {
        var t = A.tests[+b.dataset.i], src = t[4] || A.src, L = N.acl[A.dev][A.name].l, before = L.map(function (r) { return r.h; });
        var R = N.trace(src, t[1], { p: t[2], port: t[3] });
        var hit = null; L.forEach(function (r, i) { if (r.h !== before[i] && !hit) hit = r; });
        lines(hit);
        LT.$('.acl-r', el).innerHTML = '<span class="chip ' + (R.ok ? 'ok' : 'bad') + '">' + (R.ok ? 'Llega' : 'Bloqueado') + '</span> ' + esc(src) + ' → ' + t[1] + (t[3] ? ':' + t[3] : '') + ' · ' + (hit ? 'línea ' + hit.s + ': <code>' + hit.t + '</code>' : 'no pasa por esta lista') + (R.ok ? '' : (R.why ? '<br><small>' + esc(R.why) + '</small>' : ''));
      };
    });
    lines(null); bindRuns(el);
  };
})();
