/* Consola IOS simulada (Ctrl+K). Maneja la web y responde con los datos reales del proyecto. */
(function () {
  var LT = window.LT, hist = [], hpos = 0, out, input, busy = false;

  function line(t, c) { var s = LT.h('span' + (c ? '.' + c : ''), { text: t }); out.appendChild(s); out.appendChild(document.createTextNode('\n')); out.scrollTop = 1e9; }
  function lines(arr) { arr.forEach(function (l) { if (typeof l === 'string') line(l); else line(l.t, l.c); }); }
  function pad(s, n) { s = String(s); return s.length >= n ? s + ' ' : s + new Array(n - s.length + 1).join(' '); }

  var CH = {}; /* alias de capítulos */
  function chapters() { return LT.slides.map(function (s, i) { return { i: i, id: s.id, title: s.dataset.title }; }); }
  function findHost(q) {
    if (!q) return null; q = q.toLowerCase();
    if (q === 'www.logitrans.com' || q === '85.100.1.18' || q === 'web') return 'WEB';
    var ks = Object.keys(LT.TOPO);
    for (var i = 0; i < ks.length; i++) { var n = LT.TOPO[ks[i]]; if (ks[i].toLowerCase() === q || (n.ip && n.ip === q)) return ks[i]; }
    return null;
  }

  var SHOW = {
    'vlan brief': function () {
      var r = [{ t: 'VLAN Name                 Status    Ports', c: 't-dim' }, { t: '---- -------------------- --------- -------------------------------', c: 't-dim' }];
      LT.VLANS.forEach(function (v) { r.push(pad(v.id, 5) + pad(v.name.normalize('NFD').replace(/[̀-ͯ]/g, ''), 21) + pad('active', 10) + (v.id === 40 ? '(solo Wi-Fi)' : v.id === 30 ? '(solo en ZGZ)' : 'Fa0/x')); });
      r.push('900  Transito-Cores       active    Po1'); r.push('998  SinUso               active    puertos libres, shutdown'); r.push('999  Nativa               active    (sin puertos)');
      return r;
    },
    'ip interface brief': function () {
      var r = [{ t: 'Interface        IP-Address      OK? Method Status   Protocol', c: 't-dim' }];
      LT.SUBNETS.filter(function (s) { return s.site === 'BCN'; }).forEach(function (s) { r.push(pad('Vlan' + s.vlan, 17) + pad(s.net.replace(/\.0$/, '.2'), 16) + 'YES manual up       up'); });
      r.push('Vlan900          10.1.253.10     YES manual up       up'); r.push('Gi1/0/20         10.1.253.2      YES manual up       up'); r.push('Port-channel1    unassigned      YES unset  up       up');
      return r;
    },
    'ip route': function () {
      var r = ['Gateway of last resort is 10.1.253.1 to network 0.0.0.0', ''];
      LT.SUBNETS.filter(function (s) { return s.site === 'BCN'; }).forEach(function (s) { r.push({ t: 'C    ' + s.net + '/' + s.cidr + ' is directly connected, Vlan' + s.vlan, c: 't-ok' }); });
      r.push('C    10.1.253.0/30 is directly connected, GigabitEthernet1/0/20'); r.push('S*   0.0.0.0/0 [1/0] via 10.1.253.1');
      return r;
    },
    'ip ospf neighbor': function () {
      return [{ t: '(BCN-RT1) Neighbor ID  Pri  State      Dead Time  Address     Interface', c: 't-dim' },
        { t: '10.255.2.1             0   FULL/  -   00:00:35   10.0.0.2    Tunnel0', c: 't-ok' },
        { t: '10.255.1.2             1   FULL/DR    00:00:33   10.1.255.2  GigabitEthernet0/0/2', c: 't-ok' },
        { t: '# Autenticación MD5 en todas las adyacencias. ZGZ aprende 10.1.0.0/16 como O E2 por Tunnel0.', c: 't-dim' }];
    },
    'standby brief': function () {
      var r = [{ t: 'Interface   Grp  Pri P State   Active          Standby         Virtual IP', c: 't-dim' }];
      LT.SUBNETS.filter(function (s) { return s.site === 'BCN'; }).forEach(function (s) { r.push(pad('Vl' + s.vlan, 12) + pad(s.vlan, 5) + '110 P Active  local           ' + pad(s.net.replace(/\.0$/, '.3'), 16) + s.gw); });
      return r;
    },
    'etherchannel summary': function () { return ['Flags:  P - bundled in port-channel  S - Layer2  U - in use', '', 'Group  Port-channel  Protocol    Ports', '------+-------------+-----------+---------------------', { t: '1      Po1(SU)         LACP      Gi1/0/23(P) Gi1/0/24(P)', c: 't-ok' }]; },
    'spanning-tree vlan 20': function () {
      return ['VLAN0020', '  Spanning tree enabled protocol rstp', { t: '  Root ID    Priority    24596  (BCN-CORE1, raíz a propósito)', c: 't-ok' }, '', '(BCN-P1-ACC1)', 'Interface        Role Sts Cost      Prio.Nbr Type',
        { t: 'Gi0/1            Root FWD 4         128.25   P2p', c: 't-ok' }, { t: 'Gi0/2            Altn BLK 4         128.26   P2p', c: 't-warn' }, 'Fa0/3            Desg FWD 19        128.3    P2p Edge (PortFast + BPDU Guard)'];
    },
    'port-security': function () {
      return [{ t: '(BCN-P1-ACC1) Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action', c: 't-dim' },
        '              Fa0/1             32            4                0              Restrict   (AP)',
        '              Fa0/2              3            3                0              Shutdown   (PC + teléfono IP)',
        '              Fa0/3              1            1                0              Shutdown   (PC, MAC sticky)',
        { t: '# El teléfono IP ocupa dos entradas (datos y voz): por eso el máximo real es 3.', c: 't-dim' }];
    },
    'ip dhcp snooping': function () {
      return ['Switch DHCP snooping is enabled', 'DHCP snooping is configured on following VLANs: 10,20,40,50,99', 'Insertion of option 82 is disabled', '', 'Interface        Trusted   Rate limit (pps)', '---------------  --------  ----------------',
        { t: 'Gi0/1            yes       unlimited', c: 't-ok' }, { t: 'Gi0/2            yes       unlimited', c: 't-ok' }, 'Fa0/1 - Fa0/24   no        10'];
    },
    'access-lists': function () {
      return ['Extended IP access list ACL-INVITADOS-IN', '    10 permit udp any any eq bootps (3 match(es))', '    20 permit udp any any eq domain (7 match(es))', '    30 permit tcp any any eq www', '    40 permit tcp any any eq 443', { t: '    50 deny ip any any (24 match(es))', c: 't-bad' },
        'Extended IP access list ACL-GESTION-OUT', '    10 permit ip 10.1.99.0 0.0.0.31 any', '    20 permit ip 10.2.99.0 0.0.0.63 any', '    30 permit udp host 10.1.50.10 any (4 match(es))', '    80 permit tcp 10.1.254.0 0.0.0.255 eq 22 any established', { t: '    90 deny ip any any (8 match(es))', c: 't-bad' },
        'Extended IP access list ACL-OPERARIOS-IN  (ZGZ-CORE1)', '    10 permit udp any any eq bootps', '    20 permit udp any host 10.2.50.10 eq domain', '    30 permit tcp any host 10.1.50.11 eq 3306', '    40 permit tcp any host 10.1.50.12 eq www', '    50 permit tcp any host 10.1.50.12 eq 443', { t: '    60 deny ip any any', c: 't-bad' }];
    },
    'crypto isakmp sa': function () { return ['IPv4 Crypto ISAKMP SA', 'dst             src             state          conn-id status', { t: '85.100.2.2      85.100.1.2      QM_IDLE           1001 ACTIVE', c: 't-ok' }]; },
    'crypto ipsec sa': function () { return ['interface: GigabitEthernet0/0/0', '    Crypto map tag: CMAP-VPN, local addr 85.100.1.2', '   local  ident (addr/mask/prot/port): (85.100.1.2/255.255.255.255/47/0)', '   remote ident (addr/mask/prot/port): (85.100.2.2/255.255.255.255/47/0)', { t: '    #pkts encaps: 91, #pkts encrypt: 91, #pkts digest: 91', c: 't-ok' }, { t: '    #pkts decaps: 89, #pkts decrypt: 89, #pkts verify: 89', c: 't-ok' }, '     inbound esp sas:  transform: esp-aes 256 esp-sha-hmac', '     outbound esp sas: transform: esp-aes 256 esp-sha-hmac']; },
    'ip nat translations': function () { return ['Pro  Inside global      Inside local       Outside local      Outside global', { t: '---  85.100.1.18        10.1.50.12         ---                ---', c: 't-ok' }, 'tcp  85.100.1.18:80     10.1.50.12:80      203.0.113.10:1025  203.0.113.10:1025']; },
    'interfaces trunk': function () { return ['Port   Mode   Encapsulation  Status    Native vlan', { t: 'Gi0/1  on     802.1q         trunking  999', c: 't-ok' }, { t: 'Gi0/2  on     802.1q         trunking  999', c: 't-ok' }, '', 'Port   Vlans allowed on trunk', 'Gi0/1  10,20,40,50,99', 'Gi0/2  10,20,40,50,99']; },
    'vtp status': function () { return ['VTP Version capable             : 1 to 2', { t: 'VTP Operating Mode              : Transparent', c: 't-ok' }]; },
    'ip ssh': function () { return [{ t: 'SSH Enabled - version 2.0', c: 't-ok' }, 'Authentication timeout: 120 secs; Authentication retries: 3']; },
    'running-config | section aaa': function () { return ['aaa new-model', 'aaa authentication login default group radius local', 'aaa authentication login CONSOLA local', 'radius server SRV-HV01', ' address ipv4 10.1.50.10 auth-port 1645', ' key 7 ********']; }
  };
  var SHOW_KEYS = Object.keys(SHOW);

  var CMDS = {
    help: function () {
      lines([{ t: 'Comandos de la web', c: 't-sig' },
        '  ir <capítulo|número>       ir a un capítulo  (ej: ir ataque, ir 7)', '  capitulos                  lista de capítulos', '  presentar                  modo presentación', '  ataque <id>                lanzar un ataque (mac, rogue, starv, arp, stp, hop, spoof, route, mitm, lateral)',
        '  evidencias <grupo>         capturas reales (l2, acl, vpn, ospf, nat, ad, radius, web, storage, audit...)', '  rubrica · tema · sonido · clear · exit', '',
        { t: 'Comandos de red', c: 't-sig' },
        '  ping <ip|equipo> [desde <equipo>]      ej: ping 10.2.50.10 desde P0-INV-01', '  ssh | telnet | http | ftp | mysql <destino> [desde <equipo>]', '  traceroute <ip|equipo> [desde <equipo>]',
        '  show ' + SHOW_KEYS.slice(0, 6).join(' | '), '       ' + SHOW_KEYS.slice(6).join(' | '), '  vlan <id> · ip <dirección> · equipos']);
    },
    '?': function () { CMDS.help(); },
    clear: function () { out.innerHTML = ''; }, cls: function () { out.innerHTML = ''; },
    exit: function () { LT.console.close(); }, salir: function () { LT.console.close(); },
    capitulos: function () { chapters().forEach(function (c) { line(pad(String(c.i + 1).padStart(2, '0'), 4) + pad(c.id, 14) + c.title); }); },
    ir: function (a) {
      var q = (a[0] || '').toLowerCase(), list = chapters(), c = null;
      if (/^\d+$/.test(q)) c = list[+q - 1]; else c = list.find(function (x) { return x.id.indexOf(q) === 0 || x.title.toLowerCase().indexOf(q) >= 0; });
      if (!c) return line('% Capítulo desconocido. Probá «capitulos».', 't-bad');
      line('Saltando a ' + c.title + ' …', 't-ok'); LT.goto(c.i); setTimeout(LT.console.close, 300);
    },
    presentar: function () { LT.console.close(); LT.pres.start(); },
    rubrica: function () { LT.console.close(); LT.$('#rubric').classList.add('open'); },
    tema: function () { LT.toggleTheme(); line('Tema: ' + (document.documentElement.dataset.theme === 'plano' ? 'plano' : 'NOC'), 't-ok'); },
    sonido: function () { line('Sonido ' + (LT.audio.toggle() ? 'activado' : 'desactivado'), 't-ok'); },
    evidencias: function (a) {
      var g = (a[0] || '').toLowerCase();
      if (!LT.EVIDENCE_GROUPS[g]) { line('Grupos: ' + Object.keys(LT.EVIDENCE_GROUPS).join(', ')); return; }
      LT.console.close(); LT.lightbox.open(g);
    },
    ataque: function (a) {
      var id = (a[0] || 'mac').toLowerCase(), at = LT.ATTACKS.find(function (x) { return x.id === id; });
      if (!at) return line('% Ataques: ' + LT.ATTACKS.map(function (x) { return x.id; }).join(', '), 't-bad');
      line('Lanzando ' + at.name + ' contra BCN-P1-ACC1 …', 't-bad'); LT.goto('ataque');
      setTimeout(function () { LT.console.close(); LT.emit('attack', id); }, 700);
    },
    equipos: function () { Object.keys(LT.TOPO).forEach(function (k) { var n = LT.TOPO[k]; if (n.ip) line(pad(k, 14) + pad(n.ip, 16) + (n.vlan ? 'VLAN ' + n.vlan : '')); }); },
    vlan: function (a) {
      var v = LT.VLANS.find(function (x) { return x.id === +a[0]; });
      if (!v) return line('% VLAN: 10, 20, 30, 40, 50, 99', 't-bad');
      line('VLAN ' + v.id + ' · ' + v.name + ' (' + v.es + ')', 't-sig'); line('  ' + v.purpose); line('  Hosts ' + v.hosts + ' (+20 % = ' + v.plus + ') · ' + v.access + ' · ' + v.where);
      LT.SUBNETS.filter(function (s) { return s.vlan === v.id; }).forEach(function (s) { line('  ' + s.site + '  ' + s.net + '/' + s.cidr + '  gw ' + s.gw + '  ' + s.v6); });
      line('  ' + v.rule, 't-warn');
    },
    ip: function (a) { var d = LT.decodeIp ? LT.decodeIp(a[0] || '') : null; if (!d) return line('% Dirección no válida', 't-bad'); d.forEach(function (x) { line(x); }); },
    show: function (a) {
      var q = a.join(' ').toLowerCase().replace(/^run(ning)?(-config)?/, 'running-config');
      var k = SHOW_KEYS.find(function (x) { return x === q; }) || SHOW_KEYS.find(function (x) { return x.indexOf(q) === 0; }) || SHOW_KEYS.find(function (x) { return q && x.indexOf(q.split(' ')[0]) === 0 && x.indexOf(q.split(' ').slice(-1)[0]) >= 0; });
      if (!k) return line('% Invalid input detected at \'^\' marker.  Probá: show ' + SHOW_KEYS.join(' | '), 't-bad');
      lines(SHOW[k]());
    },
    traceroute: function (a) { netCmd('icmp', a, true); }
  };
  ['ping', 'ssh', 'telnet', 'http', 'https', 'ftp', 'mysql', 'nslookup'].forEach(function (c) {
    CMDS[c] = function (a) { netCmd({ ping: 'icmp', nslookup: 'dns' }[c] || c, a); };
  });
  CMDS.go = CMDS.ir; CMDS.goto = CMDS.ir; CMDS.present = CMDS.presentar; CMDS.theme = CMDS.tema; CMDS.sound = CMDS.sonido; CMDS.attack = CMDS.ataque;

  function netCmd(svc, a, trace) {
    var args = a.filter(function (x) { return x !== '-l' && x !== 'admin.xarxa01'; });
    var di = args.findIndex(function (x) { return x === 'desde' || x === 'from' || x === 'source'; });
    var dstQ = args[0], srcQ = di >= 0 ? args[di + 1] : 'P1-ADM-03';
    var dst = findHost(dstQ), src = findHost(srcQ);
    if (!dst) return line('% Destino desconocido: «' + (dstQ || '') + '». Probá «equipos».', 't-bad');
    if (!src || LT.SIM_SOURCES.indexOf(src) < 0) return line('% Origen no válido. Orígenes: ' + LT.SIM_SOURCES.join(', '), 't-bad');
    var r = LT.simulate(src, dst, svc);
    if (trace) {
      line('Tracing the route to ' + (dst === 'WEB' ? '85.100.1.18' : LT.TOPO[dst].ip) + ' desde ' + src, 't-cmd');
      r.hops.slice(1).forEach(function (h, i) { line('  ' + (i + 1) + '   ' + (r.drop === h ? '*    *    *   ' : (2 + i) + ' ms   ') + h, r.drop === h ? 't-bad' : ''); });
      if (r.drop) line('# ' + r.reason, 't-dim');
    } else lines(LT.simLines(r));
    if (LT.slides[LT.current] && LT.slides[LT.current].id === 'red') LT.animatePacket(r);
    else line('(Abrí el capítulo «La red» para ver el paquete viajar: ir red)', 't-dim');
  }

  function run(raw) {
    var cmd = raw.trim(); if (!cmd) return;
    hist.push(cmd); hpos = hist.length;
    line(LT.$('#con-prompt').textContent + ' ' + cmd, 't-cmd');
    var p = cmd.split(/\s+/), c = p[0].toLowerCase().replace(/^sh$/, 'show').replace(/^cap.*/, 'capitulos');
    if (c === 'do') { p.shift(); c = p[0].toLowerCase(); }
    var fn = CMDS[c];
    if (!fn) { line('% Unknown command or computer name, or unable to find computer address. Escribí «help».', 't-bad'); LT.audio && LT.audio.bad(); return; }
    try { fn(p.slice(1)); } catch (e) { console.error(e); line('% Error interno', 't-bad'); }
  }

  function complete() {
    var v = input.value, all = Object.keys(CMDS).concat(SHOW_KEYS.map(function (k) { return 'show ' + k; })).concat(chapters().map(function (c) { return 'ir ' + c.id; }));
    var m = all.filter(function (x) { return x.indexOf(v) === 0; });
    if (m.length === 1) input.value = m[0] + ' ';
    else if (m.length > 1) line(m.join('   '), 't-dim');
  }

  LT.console = {
    open: function () {
      var c = LT.$('#console'); c.classList.add('open'); setTimeout(function () { input.focus(); }, 60);
      if (!out.childNodes.length) lines([{ t: 'LogiTrans NOC · consola simulada', c: 't-sig' }, { t: 'Responde con las configuraciones y resultados del Packet Tracer v5. Escribí «help».', c: 't-dim' }, '']);
    },
    close: function () { LT.$('#console').classList.remove('open'); input.blur(); },
    get isOpen() { return LT.$('#console').classList.contains('open'); },
    toggle: function () { this.isOpen ? this.close() : this.open(); },
    run: run
  };

  document.addEventListener('DOMContentLoaded', function () {
    out = LT.$('#con-out'); input = LT.$('#con-in');
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { run(input.value); input.value = ''; }
      else if (e.key === 'ArrowUp') { hpos = Math.max(0, hpos - 1); input.value = hist[hpos] || ''; e.preventDefault(); }
      else if (e.key === 'ArrowDown') { hpos = Math.min(hist.length, hpos + 1); input.value = hist[hpos] || ''; e.preventDefault(); }
      else if (e.key === 'Tab') { e.preventDefault(); complete(); }
      else if (e.key === 'Escape') LT.console.close();
      else if (e.key.length === 1 && LT.audio) LT.audio.key();
      e.stopPropagation();
    });
  });
})();
