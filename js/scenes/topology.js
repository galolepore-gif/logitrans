/* Topología viva + simulador de paquetes.
   Las reglas reproducen las ACL, el NAT y el firewall del Packet Tracer v5 (puntos 3.C, 4.B y 6.1.3). */
(function () {
  var LT = window.LT, NS = 'http://www.w3.org/2000/svg';

  /* ---------- Nodos ---------- */
  var N = {
    'ISP-1': { x: 700, y: 92, t: 'isp', info: 'Router ISR 4331 · OSPF proceso 1 · MD5 entre ISP · conecta BCN-RT1' },
    'ISP-2': { x: 900, y: 92, t: 'isp', info: 'Router ISR 4331 · LAN de Internet 203.0.113.0/24 · conecta BCN-RT2' },
    'ISP-3': { x: 700, y: 214, t: 'isp', info: 'Router ISR 4331 · conecta ZGZ-RT1' },
    'ISP-4': { x: 900, y: 214, t: 'isp', info: 'Router ISR 4331 · conecta ZGZ-RT2' },
    'PC-INTERNET': { x: 1040, y: 40, t: 'host', ip: '203.0.113.10', site: 'NET', info: 'Equipo de pruebas en Internet' },
    'DNS-PUBLICO': { x: 1040, y: 132, t: 'srv', ip: '203.0.113.53', site: 'NET', info: 'DNS público: www.logitrans.com → 85.100.1.18' },
    'BCN-RT1': { x: 450, y: 110, t: 'rt', site: 'BCN', info: 'ISR 4331 · WAN 85.100.1.2 · PAT + NAT estático 10.1.50.12 ↔ 85.100.1.18 · Tunnel0 10.0.0.1 · OSPF 10' },
    'BCN-RT2': { x: 300, y: 110, t: 'rt', site: 'BCN', info: 'ISR 4331 · WAN 85.100.1.6 · respaldo con su propio PAT' },
    'BCN-FW': { x: 375, y: 220, t: 'fw', site: 'BCN', info: 'ASA 5506-X · outside/wanbak (nivel 0) · inside/corebak (nivel 100) · OUTSIDE_IN e INSIDE_OUT' },
    'BCN-CORE1': { x: 300, y: 330, t: 'core', site: 'BCN', ip: '10.1.99.2', info: 'Catalyst 9500 (3650 en PT) · raíz STP 24576 · HSRP activo prioridad 110 · SVI .2 · ACL-INVITADOS-IN · ACL-GESTION-OUT' },
    'BCN-CORE2': { x: 450, y: 330, t: 'core', site: 'BCN', info: 'Catalyst 9500 (3650 en PT) · raíz de reserva 28672 · HSRP standby · SVI .3' },
    'BCN-P0-ACC1': { x: 165, y: 470, t: 'acc', site: 'BCN', info: 'Acceso planta 0 · Port Security, DHCP snooping, PortFast + BPDU Guard' },
    'BCN-P1-ACC1': { x: 290, y: 470, t: 'acc', site: 'BCN', info: 'Acceso planta 1 · Gi0/1 al CORE1 Root FWD · Gi0/2 al CORE2 Altn BLK' },
    'BCN-P2-ACC1': { x: 415, y: 470, t: 'acc', site: 'BCN', info: 'Acceso planta 2' },
    'BCN-P3-ACC1': { x: 540, y: 470, t: 'acc', site: 'BCN', info: 'Acceso planta 3 · NOC y Dirección' },
    'SRV-HV01': { x: 80, y: 255, t: 'srv', site: 'BCN', vlan: 50, ip: '10.1.50.10', info: 'AD principal, DHCP, DNS interno y RADIUS (AAA 1645)' },
    'SRV-HV02': { x: 80, y: 330, t: 'srv', site: 'BCN', vlan: 50, ip: '10.1.50.11', info: 'AD secundario y base de datos (3306)' },
    'SRV-HV03': { x: 80, y: 405, t: 'srv', site: 'BCN', vlan: 50, ip: '10.1.50.12', info: 'Web corporativa www.logitrans.com y /clients · publicada en 85.100.1.18' },
    'P0-INV-01': { x: 135, y: 600, t: 'host', site: 'BCN', vlan: 40, ip: '10.1.40.11', sw: 'BCN-P0-ACC1', info: 'Móvil de un invitado · SSID LogiTrans-Invitados' },
    'P1-ADM-03': { x: 260, y: 600, t: 'host', site: 'BCN', vlan: 20, ip: '10.1.20.11', sw: 'BCN-P1-ACC1', info: 'Puesto de administración de la planta 1' },
    'P2-ADM-01': { x: 385, y: 600, t: 'host', site: 'BCN', vlan: 20, ip: '10.1.20.12', sw: 'BCN-P2-ACC1', info: 'Puesto de finanzas de la planta 2' },
    'P3-DIR-01': { x: 505, y: 600, t: 'host', site: 'BCN', vlan: 10, ip: '10.1.10.11', sw: 'BCN-P3-ACC1', info: 'Despacho de dirección' },
    'P3-GES-01': { x: 585, y: 600, t: 'host', site: 'BCN', vlan: 99, ip: '10.1.99.11', sw: 'BCN-P3-ACC1', info: 'Equipo del NOC: el único que administra la red' },
    'ZGZ-RT1': { x: 1150, y: 110, t: 'rt', site: 'ZGZ', info: 'ISR 4331 · WAN 85.100.2.2 · Tunnel0 10.0.0.2 · OSPF 10' },
    'ZGZ-RT2': { x: 1300, y: 110, t: 'rt', site: 'ZGZ', info: 'ISR 4331 · WAN 85.100.2.6 · respaldo' },
    'ZGZ-FW': { x: 1225, y: 220, t: 'fw', site: 'ZGZ', info: 'ASA 5506-X' },
    'ZGZ-CORE1': { x: 1150, y: 330, t: 'core', site: 'ZGZ', ip: '10.2.99.2', info: 'Catalyst 9300 (3650 en PT) · raíz STP · HSRP activo · ACL-OPERARIOS-IN en la VLAN 30' },
    'ZGZ-CORE2': { x: 1300, y: 330, t: 'core', site: 'ZGZ', info: 'Catalyst 9300 (3650 en PT) · reserva' },
    'ZGZ-ACC1': { x: 1085, y: 470, t: 'acc', site: 'ZGZ', info: 'Oficinas del almacén' },
    'ZGZ-ACC2': { x: 1230, y: 470, t: 'acc', site: 'ZGZ', info: 'Nave, mitad oeste' },
    'ZGZ-ACC4': { x: 1390, y: 470, t: 'acc', site: 'ZGZ', info: 'IDF-02, mitad este · 135 m de fibra OM4' },
    'SRV-ZGZ01': { x: 1515, y: 330, t: 'srv', site: 'ZGZ', vlan: 50, ip: '10.2.50.10', info: 'Segundo DC, DHCP, DNS y RADIUS del almacén' },
    'ZGZ-DIR-01': { x: 1040, y: 600, t: 'host', site: 'ZGZ', vlan: 10, ip: '10.2.10.11', sw: 'ZGZ-ACC1', info: 'Dirección local' },
    'ZGZ-GES-01': { x: 1125, y: 600, t: 'host', site: 'ZGZ', vlan: 99, ip: '10.2.99.11', sw: 'ZGZ-ACC1', info: 'Sala de gestión del almacén' },
    'ZGZ-MUE-01': { x: 1230, y: 600, t: 'host', site: 'ZGZ', vlan: 30, ip: '10.2.30.11', sw: 'ZGZ-ACC2', info: 'Terminal de muelle de un operario' },
    'ZGZ-ETQ-02': { x: 1390, y: 600, t: 'host', site: 'ZGZ', vlan: 30, ip: '10.2.30.20', sw: 'ZGZ-ACC4', info: 'Impresora de etiquetas · reserva DHCP 10.2.30.20' }
  };
  LT.TOPO = N;
  var L = [
    ['ISP-1', 'ISP-2', 'isp'], ['ISP-1', 'ISP-3', 'isp'], ['ISP-2', 'ISP-4', 'isp'], ['ISP-3', 'ISP-4', 'isp'],
    ['ISP-2', 'PC-INTERNET', 'isp'], ['ISP-2', 'DNS-PUBLICO', 'isp'],
    ['BCN-RT1', 'ISP-1', 'wan'], ['BCN-RT2', 'ISP-2', 'wan'], ['ZGZ-RT1', 'ISP-3', 'wan'], ['ZGZ-RT2', 'ISP-4', 'wan'],
    ['BCN-RT1', 'BCN-RT2', 'int'], ['ZGZ-RT1', 'ZGZ-RT2', 'int'],
    ['BCN-RT1', 'BCN-FW', 'int'], ['BCN-RT2', 'BCN-FW', 'int'], ['ZGZ-RT1', 'ZGZ-FW', 'int'], ['ZGZ-RT2', 'ZGZ-FW', 'int'],
    ['BCN-FW', 'BCN-CORE1', 'int'], ['BCN-FW', 'BCN-CORE2', 'int'], ['ZGZ-FW', 'ZGZ-CORE1', 'int'], ['ZGZ-FW', 'ZGZ-CORE2', 'int'],
    ['BCN-CORE1', 'BCN-CORE2', 'po'], ['ZGZ-CORE1', 'ZGZ-CORE2', 'po'],
    ['BCN-CORE1', 'SRV-HV01', 'srv'], ['BCN-CORE1', 'SRV-HV02', 'srv'], ['BCN-CORE1', 'SRV-HV03', 'srv'], ['ZGZ-CORE2', 'SRV-ZGZ01', 'srv'],
    ['BCN-RT1', 'ZGZ-RT1', 'tun']
  ];
  ['BCN-P0-ACC1', 'BCN-P1-ACC1', 'BCN-P2-ACC1', 'BCN-P3-ACC1'].forEach(function (a) { L.push([a, 'BCN-CORE1', 'trk']); L.push([a, 'BCN-CORE2', 'blk']); });
  ['ZGZ-ACC1', 'ZGZ-ACC2', 'ZGZ-ACC4'].forEach(function (a) { L.push([a, 'ZGZ-CORE1', 'trk']); L.push([a, 'ZGZ-CORE2', 'blk']); });
  Object.keys(N).forEach(function (k) { if (N[k].sw) L.push([N[k].sw, k, 'edge']); });

  /* ---------- Servicios por equipo ---------- */
  var SVC = { icmp: 'ping (ICMP)', http: 'HTTP 80', https: 'HTTPS 443', dns: 'DNS 53', ssh: 'SSH 22', telnet: 'Telnet 23', ftp: 'FTP 21', mysql: 'MySQL 3306' };
  var LISTEN = { 'SRV-HV01': ['dns'], 'SRV-HV02': ['mysql'], 'SRV-HV03': ['http', 'https'], 'SRV-ZGZ01': ['dns'], 'BCN-CORE1': ['ssh', 'telnet'], 'ZGZ-CORE1': ['ssh', 'telnet'], 'PC-INTERNET': ['http', 'https', 'ftp'], 'DNS-PUBLICO': ['dns', 'ftp'], 'WEB': ['http', 'https'] };
  var SOURCES = ['P1-ADM-03', 'P3-DIR-01', 'P3-GES-01', 'P0-INV-01', 'ZGZ-DIR-01', 'ZGZ-GES-01', 'ZGZ-MUE-01', 'PC-INTERNET'];
  var TARGETS = ['SRV-HV01', 'SRV-HV02', 'SRV-HV03', 'SRV-ZGZ01', 'BCN-CORE1', 'P2-ADM-01', 'ZGZ-ETQ-02', 'ZGZ-DIR-01', 'PC-INTERNET', 'DNS-PUBLICO', 'WEB'];
  LT.SIM_SOURCES = SOURCES; LT.SIM_TARGETS = TARGETS; LT.SIM_SVC = SVC;

  var state = { cut: false };

  function upPath(h) { /* host → core de su sede */
    var n = N[h];
    if (n.t === 'srv' && n.site === 'BCN') return [h, 'BCN-CORE1'];
    if (h === 'SRV-ZGZ01') return [h, 'ZGZ-CORE2', 'ZGZ-CORE1'];
    if (n.t === 'core') return [h];
    var core = n.site + '-CORE1';
    if (state.cut && n.sw === 'BCN-P1-ACC1') return [h, n.sw, 'BCN-CORE2', 'BCN-CORE1'];
    return [h, n.sw, core];
  }
  function rev(a) { return a.slice().reverse(); }
  function isInternal(ip) { return /^10\./.test(ip); }
  function vlanOfIp(ip) { var m = ip.match(/^10\.(\d+)\.(\d+)\./); return m ? +m[2] : null; }

  /* Evalúa un paquete. Devuelve {ok, hops, drop, reason, rule, ttl, kind} */
  LT.simulate = function (src, dst, svc) {
    var S = N[src], isWeb = dst === 'WEB', D = isWeb ? { ip: '85.100.1.18', site: 'BCN', t: 'web' } : N[dst];
    if (!S || !D) return null;
    var r = { src: src, dst: dst, svc: svc, hops: [], ok: false, drop: null, reason: '', rule: '', ttl: null };
    var sIn = S.site !== 'NET', dIn = !isWeb && D.site !== 'NET';
    var sV = S.vlan, dV = D.vlan || (D.ip && vlanOfIp(D.ip));
    var up = upPath(src);
    function listens() { return (LISTEN[isWeb ? 'WEB' : dst] || []).indexOf(svc) >= 0 || svc === 'icmp'; }
    function finish(hops, ttl) {
      r.hops = hops;
      if (!listens()) { r.ok = false; r.closed = true; r.reason = 'El paquete llega, pero ' + (isWeb ? 'la web' : dst) + ' no ofrece ' + SVC[svc] + ': responde con un RST (puerto cerrado).'; return r; }
      if (svc === 'telnet') { r.ok = false; r.closed = true; r.reason = 'Telnet abre y se cierra al instante («Connection closed by foreign host») sin pedir usuario: las VTY solo aceptan SSH (transport input ssh).'; r.rule = 'line vty 0 15 · transport input ssh'; return r; }
      r.ok = true; r.ttl = ttl; return r;
    }
    function dropAt(hops, node, reason, rule) { r.hops = hops; r.drop = node; r.reason = reason; r.rule = rule || ''; return r; }

    /* 1. Desde Internet */
    if (!sIn) {
      var inet = [src, 'ISP-2', 'ISP-1', 'BCN-RT1'];
      if (isWeb) {
        if (svc === 'http' || svc === 'https') { r.nat = '85.100.1.18:' + (svc === 'http' ? 80 : 443) + ' → 10.1.50.12'; return finish(inet.concat(['BCN-FW', 'BCN-CORE1', 'SRV-HV03']), 123); }
        return dropAt(inet.concat(['BCN-FW']), 'BCN-FW', 'Request timed out. El ASA solo deja entrar HTTP y HTTPS hacia el servidor web; el resto cae en el deny final de OUTSIDE_IN.', 'access-list OUTSIDE_IN extended deny ip any any');
      }
      if (dIn) return dropAt([src, 'ISP-2'], 'ISP-2', 'Destination host unreachable. Internet no conoce las redes privadas de la empresa: ISP-1 responde «% Network not in table». Sin NAT no se llega.', 'show ip route 10.1.50.10 → % Network not in table');
      return finish([src, 'ISP-2', dst], 127);
    }
    /* 2. Hacia la web por su IP pública desde dentro: hairpin NAT */
    if (isWeb) {
      return dropAt(up.concat(S.site === 'BCN' ? ['BCN-FW', 'BCN-RT1'] : ['ZGZ-FW', 'ZGZ-RT1']), S.site + '-RT1', 'Sin respuesta: Packet Tracer no resuelve el hairpin NAT (ir a la IP pública del propio router). Desde dentro se entra por www.logitrans.com, que el DNS interno resuelve a 10.1.50.12.', 'Limitación del simulador');
    }
    var core = S.site + '-CORE1';
    var upToCore = up;
    /* 3. ACL de invitados (entrada en la SVI de la VLAN 40) */
    if (sV === 40) {
      if (dIn) return dropAt(upToCore, core, 'Destination host unreachable. ACL-INVITADOS-IN deniega cualquier destino 10.0.0.0/8: los invitados no ven nada interno.', 'deny ip any 10.0.0.0 0.255.255.255');
      if (['http', 'https', 'dns'].indexOf(svc) < 0) return dropAt(upToCore, core, 'Destination host unreachable. Los invitados solo tienen DHCP, DNS, HTTP y HTTPS: ' + SVC[svc] + ' cae en el deny ip any any final.', 'deny ip any any');
    }
    /* 4. ACL de operarios (entrada en la SVI de la VLAN 30) */
    if (sV === 30) {
      var okOp = (svc === 'dns' && dst === 'SRV-ZGZ01') || (svc === 'mysql' && dst === 'SRV-HV02') || ((svc === 'http' || svc === 'https') && dst === 'SRV-HV03') || (sV === dV && D.site === 'ZGZ');
      if (!okOp) return dropAt(upToCore, 'ZGZ-CORE1', 'Destination host unreachable. ACL-OPERARIOS-IN solo deja DHCP, DNS a SRV-ZGZ01, MySQL a SRV-HV02 y web a SRV-HV03. Ni ping, ni otras VLAN, ni Internet.', 'deny ip any any');
    }
    /* 5. Destino en la VLAN de gestión */
    if (dIn && (dV === 99 || D.t === 'core') && sV !== 99) {
      var vtyMsg = svc === 'ssh' ? 'La conexión no se abre: ACL-GESTION-OUT no deja entrar a la VLAN 99 y además las VTY solo aceptan conexiones de las redes de gestión (ACL-VTY-GESTION), aunque el usuario y la contraseña sean buenos.' : 'Sin respuesta. ACL-GESTION-OUT solo deja entrar a la VLAN 99 el tráfico de las redes de gestión y las respuestas de servidores.';
      return dropAt(upToCore, core, vtyMsg, 'ACL-GESTION-OUT · deny ip any any');
    }
    /* 6. Hacia Internet */
    if (!dIn) {
      var out = upToCore.concat([S.site + '-FW', S.site + '-RT1']).concat(S.site === 'BCN' ? ['ISP-1', 'ISP-2', dst] : ['ISP-3', 'ISP-4', 'ISP-2', dst]);
      if (['icmp', 'http', 'https', 'dns'].indexOf(svc) < 0) return dropAt(upToCore.concat([S.site + '-FW']), S.site + '-FW', 'Timed out. INSIDE_OUT del ASA solo deja salir web, HTTPS, DNS y ping: ' + SVC[svc] + ' no lo necesita ningún usuario.', 'access-list INSIDE_OUT extended deny ip any any');
      r.nat = 'PAT: ' + S.ip + ' → ' + (S.site === 'BCN' ? '85.100.1.2' : '85.100.2.2');
      return finish(out, 123);
    }
    /* 7. Interno */
    var down = rev(upPath(dst));
    if (S.site === D.site) {
      var same = sV === dV;
      var hops = up.concat(down.slice(down[0] === up[up.length - 1] ? 1 : 0));
      if (same && S.sw && D.sw && S.sw === D.sw) hops = [src, S.sw, dst];
      return finish(hops, same ? 128 : 127);
    }
    r.vpn = true;
    var mid = [S.site + '-FW', S.site + '-RT1', D.site + '-RT1', D.site + '-FW'];
    return finish(up.concat(mid).concat(down), 122);
  };

  /* Formato tipo consola del resultado */
  LT.simLines = function (r) {
    var D = r.dst === 'WEB' ? { ip: '85.100.1.18' } : N[r.dst], S = N[r.src], out = [];
    var host = r.src === 'PC-INTERNET' ? 'C:\\>' : 'C:\\>';
    var cmd = { icmp: 'ping ' + D.ip, http: 'http://' + (r.dst === 'WEB' || r.dst === 'SRV-HV03' ? 'www.logitrans.com' : D.ip), https: 'https://' + (r.dst === 'WEB' || r.dst === 'SRV-HV03' ? 'www.logitrans.com' : D.ip), dns: 'nslookup www.logitrans.com ' + D.ip, ssh: 'ssh -l admin.xarxa01 ' + D.ip, telnet: 'telnet ' + D.ip, ftp: 'ftp ' + D.ip, mysql: 'mysql -h ' + D.ip + ' -u logitrans -p' }[r.svc];
    out.push({ t: r.src + ' ' + host + cmd, c: 't-cmd' });
    if (r.ok) {
      if (r.svc === 'icmp') {
        out.push({ t: 'Pinging ' + D.ip + ' with 32 bytes of data:' });
        for (var i = 0; i < 4; i++) out.push({ t: 'Reply from ' + D.ip + ': bytes=32 time=' + (r.vpn ? 2 + i : 1) + 'ms TTL=' + r.ttl, c: 't-ok' });
        out.push({ t: 'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)', c: 't-dim' });
      } else if (r.svc === 'ssh') { out.push({ t: 'Password: ********' }); out.push({ t: r.dst + '>  (validado por RADIUS contra Grupo-Gestio)', c: 't-ok' }); }
      else if (r.svc === 'dns') { out.push({ t: 'Server: ' + D.ip }); out.push({ t: 'Name: www.logitrans.com  Address: ' + (r.src === 'PC-INTERNET' || r.dst === 'DNS-PUBLICO' ? '85.100.1.18' : '10.1.50.12'), c: 't-ok' }); }
      else if (r.svc === 'mysql') out.push({ t: 'Connected to MariaDB 11 on ' + D.ip + ':3306', c: 't-ok' });
      else out.push({ t: 'HTTP/1.1 200 OK · LogiTrans · Transporte y logística', c: 't-ok' });
      if (r.nat) out.push({ t: 'NAT: ' + r.nat, c: 't-sig' });
      if (r.vpn) out.push({ t: 'Cruza la VPN: Tunnel0 10.0.0.1 → 10.0.0.2 · ESP AES-256', c: 't-sig' });
    } else {
      if (r.svc === 'icmp') { out.push({ t: 'Pinging ' + D.ip + ' with 32 bytes of data:' }); out.push({ t: (r.drop && /RT1|FW/.test(r.drop) && /timed/i.test(r.reason) ? 'Request timed out.' : 'Reply from ' + (S.vlan ? S.ip.replace(/\.\d+$/, '.1') : '203.0.113.1') + ': Destination host unreachable.'), c: 't-bad' }); }
      else if (r.svc === 'telnet') { out.push({ t: 'Trying ' + D.ip + ' ...Open' }); out.push({ t: '[Connection to ' + D.ip + ' closed by foreign host]', c: 't-bad' }); }
      else out.push({ t: r.closed ? '% Connection refused by remote host' : '% Connection timed out; remote host not responding', c: 't-bad' });
      if (r.drop) out.push({ t: 'Bloqueado en ' + r.drop + (r.rule ? ' · ' + r.rule : ''), c: 't-warn' });
    }
    out.push({ t: '# ' + (r.ok ? 'Permitido. ' : '') + (r.reason || (r.vpn ? 'Viaja cifrado por la VPN entre sedes. TTL 122: cruza core, firewall y router de cada sede y el túnel.' : r.ttl === 127 ? 'Pasa por el core (TTL 127): routing entre VLAN.' : r.ttl === 123 ? 'Sale a Internet por el router de la sede.' : '')), c: 't-dim' });
    return out;
  };

  /* ---------- Dibujo ---------- */
  var svg, gLinks, gNodes, gFx, linkEls = {}, nodeEls = {};
  function el(t, a, parent) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (parent || svg).appendChild(e); return e; }
  function key(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
  function linkPath(a, b, kind) {
    var A = N[a], B = N[b];
    if (kind === 'tun') return 'M' + A.x + ' ' + A.y + ' C 640 330, 960 330, ' + B.x + ' ' + B.y;
    if (kind === 'po') return 'M' + A.x + ' ' + A.y + ' L' + B.x + ' ' + B.y;
    return 'M' + A.x + ' ' + A.y + ' L' + B.x + ' ' + B.y;
  }
  var ICON = {
    rt: function (g) { el('circle', { r: 17, class: 'n-shape' }, g); el('path', { d: 'M-8 -3h11l-3-3M8 3H-3l3 3', class: 'n-ico' }, g); },
    isp: function (g) { el('circle', { r: 15, class: 'n-shape' }, g); el('path', { d: 'M-7 0h14M0 -7v14', class: 'n-ico' }, g); },
    fw: function (g) { el('path', { d: 'M0 -20 L18 0 L0 20 L-18 0Z', class: 'n-shape' }, g); el('path', { d: 'M-7 -3h14M-7 3h14', class: 'n-ico' }, g); },
    core: function (g) { el('rect', { x: -24, y: -14, width: 48, height: 28, rx: 5, class: 'n-shape' }, g); el('path', { d: 'M-12 -4h24M-12 4h24', class: 'n-ico' }, g); },
    acc: function (g) { el('rect', { x: -18, y: -10, width: 36, height: 20, rx: 4, class: 'n-shape' }, g); el('path', { d: 'M-9 0h18', class: 'n-ico' }, g); },
    srv: function (g) { el('rect', { x: -14, y: -17, width: 28, height: 34, rx: 4, class: 'n-shape' }, g); el('path', { d: 'M-7 -7h14M-7 0h14M-7 7h14', class: 'n-ico' }, g); },
    host: function (g) { el('rect', { x: -13, y: -10, width: 26, height: 18, rx: 3, class: 'n-shape' }, g); el('path', { d: 'M-6 13h12', class: 'n-ico' }, g); }
  };

  function draw() {
    svg = LT.$('#topo'); svg.innerHTML = '';
    var defs = el('defs', {});
    var gr = el('radialGradient', { id: 'pk-glow' }, defs); el('stop', { offset: '0', 'stop-color': '#fff' }, gr); el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': 0 }, gr);
    /* zonas */
    var z = el('g', { class: 'zones' });
    [['BCN · OFICINA CENTRAL · 10.1.0.0/16', 40, 60, 590, 600, 'bcn'], ['INTERNET SIMULADO · 4 ISP · OSPF MD5', 620, 18, 360, 240, 'net'], ['ZGZ · ALMACÉN · 10.2.0.0/16', 1010, 60, 560, 600, 'zgz']].forEach(function (zz) {
      el('rect', { x: zz[1], y: zz[2], width: zz[3], height: zz[4], rx: 18, class: 'zone zone-' + zz[5] }, z);
      el('text', { x: zz[1] + 16, y: zz[2] + zz[4] - 14, class: 'zone-t' }, z).textContent = zz[0];
    });
    gLinks = el('g', { class: 'links' });
    L.forEach(function (l) {
      var p = el('path', { d: linkPath(l[0], l[1], l[2]), class: 'lk lk-' + l[2] }, gLinks);
      linkEls[key(l[0], l[1])] = { el: p, a: l[0], b: l[1], kind: l[2] };
      if (l[2] === 'po') { el('path', { d: linkPath(l[0], l[1]), class: 'lk lk-po2', transform: 'translate(0,6)' }, gLinks); }
    });
    var tl = el('text', { x: 800, y: 300, class: 'tun-t', 'text-anchor': 'middle' }, gLinks); tl.textContent = 'Tunnel0 · GRE sobre IPsec · AES-256';
    var stp = el('text', { x: 372, y: 405, class: 'stp-t', 'text-anchor': 'middle' }, gLinks); stp.textContent = 'troncales al CORE2: Altn BLK (STP)';
    gNodes = el('g', { class: 'nodes' });
    Object.keys(N).forEach(function (k) {
      var n = N[k], g = el('g', { class: 'nd nd-' + n.t, transform: 'translate(' + n.x + ',' + n.y + ')', tabindex: 0, 'data-id': k }, gNodes);
      if (n.vlan) g.style.setProperty('--vc', 'var(--v' + n.vlan + ')');
      ICON[n.t](g);
      var lab = el('text', { y: n.t === 'host' ? 30 : (n.t === 'srv' ? 32 : (n.t === 'isp' || n.t === 'rt' ? -26 : 30)), class: 'n-lbl', 'text-anchor': 'middle' }, g); lab.textContent = k;
      if (n.ip && (n.t === 'host' || n.t === 'srv')) { var ipl = el('text', { y: n.t === 'host' ? 42 : 44, class: 'n-ip', 'text-anchor': 'middle' }, g); ipl.textContent = n.ip; }
      g.addEventListener('click', function () { info(k); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter') info(k); });
      nodeEls[k] = g;
    });
    gFx = el('g', { class: 'fx' });
  }

  function info(k) {
    var n = N[k], box = LT.$('#topo-info');
    var vl = n.vlan ? LT.VLANS.find(function (v) { return v.id === n.vlan; }) : null;
    box.innerHTML = '<div class="ti-h"><b>' + k + '</b>' + (vl ? '<span class="tag" style="color:var(' + vl.color + ')">VLAN ' + vl.id + ' · ' + vl.name + '</span>' : '') + '</div>' +
      (n.ip ? '<div class="mono sig">' + n.ip + '</div>' : '') + '<p>' + LT.esc(n.info || '') + '</p>' +
      (n.t === 'host' || n.t === 'srv' ? '<div class="ti-act"><button class="btn small" data-src="' + k + '">Usar como origen</button><button class="btn small ghost" data-dst="' + k + '">Usar como destino</button></div>' : '');
    box.classList.add('on');
    LT.$$('[data-src]', box).forEach(function (b) { b.onclick = function () { var s = LT.$('#sim-src'); if ([].some.call(s.options, function (o) { return o.value === k; })) s.value = k; }; });
    LT.$$('[data-dst]', box).forEach(function (b) { b.onclick = function () { var s = LT.$('#sim-dst'); if ([].some.call(s.options, function (o) { return o.value === k; })) s.value = k; }; });
    LT.$$('.nd', svg).forEach(function (g) { g.classList.toggle('sel', g.dataset.id === k); });
  }

  /* Animación del paquete a lo largo de los saltos */
  var animToken = 0;
  function segPath(a, b) {
    var l = linkEls[key(a, b)];
    if (!l) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', 'M' + N[a].x + ' ' + N[a].y + ' L' + N[b].x + ' ' + N[b].y); return { el: p, rev: false, tmp: true }; }
    return { el: l.el, rev: l.a !== a };
  }
  LT.animatePacket = function (r) {
    if (!svg) return Promise.resolve();
    var my = ++animToken; gFx.innerHTML = '';
    LT.$$('.lk.hot', svg).forEach(function (x) { x.classList.remove('hot', 'hot-bad'); });
    LT.$$('.nd', svg).forEach(function (g) { g.classList.remove('hop', 'drop', 'dest'); });
    var col = r.ok ? LT.css('--signal') : LT.css('--alert');
    var dot = el('circle', { r: 7, fill: col, class: 'pk' }, gFx);
    var halo = el('circle', { r: 18, fill: 'url(#pk-glow)', opacity: .35 }, gFx);
    var hops = r.hops.map(function (h) { return h === 'WEB' ? 'BCN-RT1' : h; });
    var i = 0;
    return new Promise(function (res) {
      function seg() {
        if (my !== animToken) return res();
        if (nodeEls[hops[i]]) nodeEls[hops[i]].classList.add('hop');
        if (i >= hops.length - 1) {
          var last = nodeEls[hops[hops.length - 1]];
          if (r.drop) { var D = N[r.drop]; boom(D.x, D.y); if (nodeEls[r.drop]) nodeEls[r.drop].classList.add('drop'); LT.audio && LT.audio.bad(); }
          else if (r.ok) { if (last) last.classList.add('dest'); ring(N[hops[hops.length - 1]]); LT.audio && LT.audio.ok(); }
          else { if (last) last.classList.add('drop'); var Z = N[hops[hops.length - 1]]; boom(Z.x, Z.y); LT.audio && LT.audio.bad(); }
          dot.remove(); halo.remove(); return res();
        }
        var a = hops[i], b = hops[i + 1], sp = segPath(a, b), len = sp.el.getTotalLength ? sp.el.getTotalLength() : 100;
        if (!sp.tmp) sp.el.classList.add('hot');
        if (sp.tmp) { gFx.appendChild(sp.el); sp.el.setAttribute('class', 'lk tmp'); len = sp.el.getTotalLength(); }
        var dur = Math.max(260, Math.min(900, len * 2.2)) * (LT.reduce ? 0 : 1), t0 = performance.now();
        if (linkEls[key(a, b)] && linkEls[key(a, b)].kind === 'tun') { dot.setAttribute('fill', LT.css('--brand')); }
        (function f(now) {
          if (my !== animToken) return res();
          var k = Math.min(1, (now - t0) / (dur || 1)), u = sp.rev ? 1 - k : k, pt = sp.el.getPointAtLength(u * len);
          dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y);
          if (k < 1) requestAnimationFrame(f); else { dot.setAttribute('fill', col); i++; LT.audio && LT.audio.blip(); seg(); }
        })(t0);
      }
      seg();
    });
  };
  function boom(x, y) {
    var g = el('g', { transform: 'translate(' + x + ',' + y + ')', class: 'boom' }, gFx);
    el('circle', { r: 26, class: 'boom-r' }, g);
    el('path', { d: 'M-10 -10L10 10M10 -10L-10 10', class: 'boom-x' }, g);
  }
  function ring(n) { var g = el('g', { transform: 'translate(' + n.x + ',' + n.y + ')', class: 'okring' }, gFx); el('circle', { r: 28 }, g); }

  function vlanFilter(v) {
    LT.$$('.nd', svg).forEach(function (g) {
      var n = N[g.dataset.id];
      var on = !v || n.vlan === v || (n.t === 'acc' && Object.keys(N).some(function (k) { return N[k].sw === g.dataset.id && N[k].vlan === v; })) || n.t === 'core';
      g.classList.toggle('dim', !on);
    });
  }

  function stpCut() {
    state.cut = !state.cut;
    var a = linkEls[key('BCN-P1-ACC1', 'BCN-CORE1')], b = linkEls[key('BCN-P1-ACC1', 'BCN-CORE2')];
    a.el.classList.toggle('cut', state.cut);
    var btn = LT.$('#stp-cut');
    btn.textContent = state.cut ? 'Restaurar troncal' : 'Cortar troncal P1 → CORE1';
    if (state.cut) {
      LT.$('#sim-out').innerHTML = '<span class="bad">BCN-CORE1(config-if)# interface Gi1/0/3 · shutdown</span>  Spanning Tree reconverge…';
      setTimeout(function () { b.el.classList.add('fwd'); LT.$('#sim-out').innerHTML = '<span class="ok">Gi0/2 (al CORE2) pasa de Altn BLK a Root FWD.</span> P1-ADM-03 sigue llegando al servidor por el CORE2. Probalo.'; LT.audio && LT.audio.ok(); }, LT.reduce ? 0 : 1300);
    } else { b.el.classList.remove('fwd'); LT.$('#sim-out').textContent = 'Troncal restaurado: Gi0/1 vuelve a Root FWD y Gi0/2 a Altn BLK.'; }
  }

  LT.runSim = function (src, dst, svc) {
    var r = LT.simulate(src, dst, svc); if (!r) return null;
    var lines = LT.simLines(r);
    var out = LT.$('#sim-out');
    if (out) out.innerHTML = lines.map(function (l) { return '<span class="' + (l.c || '') + '">' + LT.esc(l.t) + '</span>'; }).join('<br>');
    LT.animatePacket(r);
    return r;
  };

  var PRESETS = [
    ['Admin → servidor', 'P1-ADM-03', 'SRV-HV01', 'icmp'],
    ['BCN → ZGZ por la VPN', 'P1-ADM-03', 'SRV-ZGZ01', 'icmp'],
    ['Invitado → servidor', 'P0-INV-01', 'SRV-HV01', 'icmp'],
    ['Invitado navega', 'P0-INV-01', 'PC-INTERNET', 'https'],
    ['Operario → web', 'ZGZ-MUE-01', 'SRV-HV03', 'http'],
    ['Operario → ping', 'ZGZ-MUE-01', 'SRV-ZGZ01', 'icmp'],
    ['Admin → SSH al core', 'P1-ADM-03', 'BCN-CORE1', 'ssh'],
    ['NOC → SSH al core', 'P3-GES-01', 'BCN-CORE1', 'ssh'],
    ['Internet → web', 'PC-INTERNET', 'WEB', 'http'],
    ['Internet → IP interna', 'PC-INTERNET', 'SRV-HV01', 'icmp'],
    ['FTP a Internet', 'P1-ADM-03', 'DNS-PUBLICO', 'ftp']
  ];
  LT.SIM_PRESETS = PRESETS;

  LT.scene('red', {
    steps: 1,
    init: function () {
      draw();
      var s = LT.$('#sim-src'), d = LT.$('#sim-dst'), v = LT.$('#sim-svc');
      SOURCES.forEach(function (k) { s.appendChild(LT.h('option', { value: k, text: k + ' · ' + N[k].ip })); });
      TARGETS.forEach(function (k) { d.appendChild(LT.h('option', { value: k, text: k === 'WEB' ? 'www.logitrans.com · 85.100.1.18' : k + ' · ' + (N[k].ip || '') })); });
      Object.keys(SVC).forEach(function (k) { v.appendChild(LT.h('option', { value: k, text: SVC[k] })); });
      s.value = 'P1-ADM-03'; d.value = 'SRV-ZGZ01';
      LT.$('#sim-go').onclick = function () { LT.runSim(s.value, d.value, v.value); };
      var pr = LT.$('#sim-presets');
      PRESETS.forEach(function (p) { pr.appendChild(LT.h('button.chip', { text: p[0], onclick: function () { s.value = p[1]; d.value = p[2]; v.value = p[3]; LT.runSim(p[1], p[2], p[3]); } })); });
      var vc = LT.$('#vlan-chips'), cur = null;
      LT.VLANS.forEach(function (vl) {
        var b = LT.h('button.chip', { text: 'VLAN ' + vl.id, style: { color: 'var(' + vl.color + ')' }, title: vl.name + ' · ' + vl.purpose });
        b.onclick = function () { cur = cur === vl.id ? null : vl.id; LT.$$('.chip', vc).forEach(function (c) { c.classList.toggle('on', c === b && !!cur); }); vlanFilter(cur); };
        vc.appendChild(b);
      });
      LT.$('#stp-cut').onclick = stpCut;
      info('BCN-CORE1');
    },
    enter: function () {
      if (!this._auto) { this._auto = true; var self = this; setTimeout(function () { if (LT.slides[LT.current] && LT.slides[LT.current].id === 'red') LT.runSim('P1-ADM-03', 'SRV-ZGZ01', 'icmp'); }, 900); }
    },
    step: function (n) { if (n === 1) LT.runSim('P0-INV-01', 'SRV-HV01', 'icmp'); }
  });
})();
