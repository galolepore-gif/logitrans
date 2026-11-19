/* LogiTrans Tracer · modelo de la red
   Dispositivos, enlaces, direcciones, ACL con sus contadores reales y el motor que decide
   por dónde va un paquete, qué lista lo para y con qué TTL llega.
   Las salidas se reconstruyen a partir de las capturas de la memoria (imágenes 6 a 169). */
(function () {
  var LT = window.LT;
  var N = LT.NET = { dev: {}, links: [], byIp: {}, virt: {} };

  /* ---------- Dispositivos ---------- */
  /* tipo: rt (router), fw (ASA), l3 (core), sw (acceso), ap, pc, srv, prn, cloud */
  function D(id, type, x, y, o) { o = o || {}; o.id = id; o.type = type; o.x = x; o.y = y; N.dev[id] = o; return o; }
  var BCN = 'BCN', ZGZ = 'ZGZ', NET = 'INET';
  // Internet
  D('ISP-1', 'rt', 720, 100, { site: NET, model: 'ISR 4331', rid: '1.1.1.1', ips: ['85.100.1.1', '200.0.0.1', '200.0.0.5'] });
  D('ISP-2', 'rt', 720, 250, { site: NET, model: 'ISR 4331', rid: '2.2.2.2', ips: ['85.100.1.5', '200.0.0.2', '200.0.0.9', '203.0.113.1'] });
  D('ISP-3', 'rt', 880, 100, { site: NET, model: 'ISR 4331', rid: '3.3.3.3', ips: ['85.100.2.1', '200.0.0.6', '200.0.0.13'] });
  D('ISP-4', 'rt', 880, 250, { site: NET, model: 'ISR 4331', rid: '4.4.4.4', ips: ['85.100.2.5', '200.0.0.10', '200.0.0.14'] });
  D('PC-INTERNET', 'pc', 690, 380, { site: NET, ip: '203.0.113.10', mask: '255.255.255.0', cidr: 24, gw: '203.0.113.1', dns: '203.0.113.53', mac: '0001.6438.A1C2', port: 'Gi0/0/2', sw: 'ISP-2' });
  D('DNS-PUBLICO', 'srv', 800, 380, { site: NET, ip: '203.0.113.53', mask: '255.255.255.0', cidr: 24, gw: '203.0.113.1', mac: '0001.6438.A1D9', port: 'Gi0/0/2', sw: 'ISP-2', role: 'DNS público: www.logitrans.com → 85.100.1.18' });
  // Barcelona
  D('BCN-RT1', 'rt', 560, 100, { site: BCN, model: 'ISR 4331', rid: '10.255.1.1', ips: ['85.100.1.2', '10.1.254.1', '10.1.255.1', '10.0.0.1'], u: 31 });
  D('BCN-RT2', 'rt', 560, 250, { site: BCN, model: 'ISR 4331', rid: '10.255.1.2', ips: ['85.100.1.6', '10.1.254.5', '10.1.255.2'], u: 30 });
  D('BCN-FW', 'fw', 430, 175, { site: BCN, model: 'ASA 5506-X', ips: ['10.1.254.2', '10.1.254.6', '10.1.253.1', '10.1.253.5'], u: 28 });
  D('BCN-CORE1', 'l3', 330, 310, { site: BCN, model: 'Catalyst 9500-24Y4C', svi: 2, mgmt: '10.1.99.2', ips: ['10.1.253.2', '10.1.253.9'], u: 26 });
  D('BCN-CORE2', 'l3', 500, 310, { site: BCN, model: 'Catalyst 9500-24Y4C', svi: 3, mgmt: '10.1.99.3', ips: ['10.1.253.6', '10.1.253.10'], u: 23 });
  D('SRV-HV01', 'srv', 90, 230, { site: BCN, vlan: 50, ip: '10.1.50.10', mask: '255.255.255.128', cidr: 25, gw: '10.1.50.1', dns: '10.1.50.10', mac: '0009.3023.46BA', v6: '2001:DB8:ACAD:1050:209:30FF:FE23:46BA', sw: 'BCN-CORE1', port: 'Gi1/0/10', role: 'AD principal, DHCP, DNS y RADIUS' });
  D('SRV-HV02', 'srv', 90, 310, { site: BCN, vlan: 50, ip: '10.1.50.11', mask: '255.255.255.128', cidr: 25, gw: '10.1.50.1', dns: '10.1.50.10', mac: '0009.3023.46C1', sw: 'BCN-CORE1', port: 'Gi1/0/11', role: 'Base de datos (MySQL 3306) y AD secundario' });
  D('SRV-HV03', 'srv', 90, 390, { site: BCN, vlan: 50, ip: '10.1.50.12', mask: '255.255.255.128', cidr: 25, gw: '10.1.50.1', dns: '10.1.50.10', mac: '0009.3023.46D7', sw: 'BCN-CORE1', port: 'Gi1/0/12', role: 'Web corporativa www.logitrans.com (NAT 85.100.1.18)' });
  D('BCN-P0-ACC1', 'sw', 170, 470, { site: BCN, floor: 'P0', model: '2960 (9300L-48P-4X)', mgmt: '10.1.99.4', up: 'Gi1/0/2' });
  D('BCN-P1-ACC1', 'sw', 310, 470, { site: BCN, floor: 'P1', model: '2960 (9300L-48P-4X)', mgmt: '10.1.99.5', up: 'Gi1/0/3' });
  D('BCN-P2-ACC1', 'sw', 450, 470, { site: BCN, floor: 'P2', model: '2960 (9300L-48P-4X)', mgmt: '10.1.99.6', up: 'Gi1/0/4' });
  D('BCN-P3-ACC1', 'sw', 590, 470, { site: BCN, floor: 'P3', model: '2960 (9300L-48P-4X)', mgmt: '10.1.99.7', up: 'Gi1/0/5' });
  D('BCN-P0-AP01', 'ap', 70, 560, { site: BCN, sw: 'BCN-P0-ACC1', port: 'Fa0/1', ssid: 'LogiTrans-Invitados' });
  D('P0-INV-01', 'pc', 70, 660, { site: BCN, vlan: 40, wifi: true, ap: 'BCN-P0-AP01', ip: '10.1.40.11', mask: '255.255.255.128', cidr: 25, gw: '10.1.40.1', dns: '10.1.50.10', mac: '0060.2F84.71A3', v6: '2001:DB8:ACAD:1040:260:2FFF:FE84:71A3', label: 'Móvil invitado' });
  D('P0-IMP-02', 'prn', 160, 600, { site: BCN, vlan: 20, ip: '10.1.20.5', mask: '255.255.254.0', cidr: 23, gw: '10.1.20.1', mac: '0090.2B5C.11E0', sw: 'BCN-P0-ACC1', port: 'Fa0/5' });
  D('P0-REC-01', 'pc', 240, 600, { site: BCN, vlan: 20, ip: '10.1.20.10', mask: '255.255.254.0', cidr: 23, gw: '10.1.20.1', dns: '10.1.50.10', mac: '0030.BB2E.0743', sw: 'BCN-P0-ACC1', port: 'Fa0/6', label: 'Recepción' });
  D('P1-ADM-03', 'pc', 310, 660, { site: BCN, vlan: 20, ip: '10.1.20.11', mask: '255.255.254.0', cidr: 23, gw: '10.1.20.1', dns: '10.1.50.10', mac: '00D0.97A1.3C21', v6: '2001:DB8:ACAD:1020:2D0:97FF:FEA1:3C21', sw: 'BCN-P1-ACC1', port: 'Fa0/3', roseta: 'P1-R02', label: 'Administración' });
  D('P2-FIN-01', 'pc', 450, 600, { site: BCN, vlan: 20, ip: '10.1.20.40', mask: '255.255.254.0', cidr: 23, gw: '10.1.20.1', dns: '10.1.50.10', mac: '0002.4A7E.90B1', sw: 'BCN-P2-ACC1', port: 'Fa0/3', label: 'Finanzas' });
  D('P3-DIR-01', 'pc', 545, 600, { site: BCN, vlan: 10, ip: '10.1.10.11', mask: '255.255.255.192', cidr: 26, gw: '10.1.10.1', dns: '10.1.50.10', mac: '0005.5E33.0C18', sw: 'BCN-P3-ACC1', port: 'Fa0/3', label: 'Dirección' });
  D('P3-GES-01', 'pc', 635, 600, { site: BCN, vlan: 99, ip: '10.1.99.11', mask: '255.255.255.224', cidr: 27, gw: '10.1.99.1', dns: '10.1.50.10', mac: '000A.F3B1.2E40', sw: 'BCN-P3-ACC1', port: 'Fa0/4', label: 'NOC' });
  // Zaragoza (espejo)
  D('ZGZ-RT1', 'rt', 1040, 100, { site: ZGZ, model: 'ISR 4331', rid: '10.255.2.1', ips: ['85.100.2.2', '10.2.254.1', '10.2.255.1', '10.0.0.2'] });
  D('ZGZ-RT2', 'rt', 1040, 250, { site: ZGZ, model: 'ISR 4331', rid: '10.255.2.2', ips: ['85.100.2.6', '10.2.254.5', '10.2.255.2'] });
  D('ZGZ-FW', 'fw', 1170, 175, { site: ZGZ, model: 'ASA 5506-X', ips: ['10.2.254.2', '10.2.254.6', '10.2.253.1', '10.2.253.5'] });
  D('ZGZ-CORE1', 'l3', 1270, 310, { site: ZGZ, model: 'Catalyst 9300-48P', svi: 2, mgmt: '10.2.99.2', ips: ['10.2.253.2'] });
  D('ZGZ-CORE2', 'l3', 1100, 310, { site: ZGZ, model: 'Catalyst 9300-48P', svi: 3, mgmt: '10.2.99.3', ips: ['10.2.253.6'] });
  D('SRV-ZGZ01', 'srv', 1510, 310, { site: ZGZ, vlan: 50, ip: '10.2.50.10', mask: '255.255.255.224', cidr: 27, gw: '10.2.50.1', dns: '10.2.50.10', mac: '0009.7C11.5A02', sw: 'ZGZ-CORE1', port: 'Gi1/0/10', role: 'Segundo DC, DHCP, DNS y RADIUS' });
  D('ZGZ-ACC1', 'sw', 1440, 470, { site: ZGZ, floor: 'Oficinas', model: '2960 (9300L-48P-4X)', mgmt: '10.2.99.4', up: 'Gi1/0/2' });
  D('ZGZ-ACC2', 'sw', 1290, 470, { site: ZGZ, floor: 'Nave oeste', model: '2960 (9300L-48P-4X)', mgmt: '10.2.99.5', up: 'Gi1/0/3' });
  D('ZGZ-ACC4', 'sw', 1140, 470, { site: ZGZ, floor: 'Nave este (IDF-02)', model: '2960 (9300L-48P-4X)', mgmt: '10.2.99.6', up: 'Gi1/0/4' });
  D('ZGZ-DIR-01', 'pc', 1490, 600, { site: ZGZ, vlan: 10, ip: '10.2.10.5', mask: '255.255.255.240', cidr: 28, gw: '10.2.10.1', dns: '10.2.50.10', mac: '0001.C7A4.3B10', sw: 'ZGZ-ACC1', port: 'Fa0/3', label: 'Dirección local' });
  D('ZGZ-GES-01', 'pc', 1400, 600, { site: ZGZ, vlan: 99, ip: '10.2.99.11', mask: '255.255.255.192', cidr: 26, gw: '10.2.99.1', dns: '10.2.50.10', mac: '0001.C7A4.3B55', sw: 'ZGZ-ACC1', port: 'Fa0/4', label: 'Gestión de red' });
  D('ZGZ-MUE-01', 'pc', 1330, 600, { site: ZGZ, vlan: 30, ip: '10.2.30.11', mask: '255.255.255.128', cidr: 25, gw: '10.2.30.1', dns: '10.2.50.10', mac: '00E0.B0F1.7A31', v6: '2001:DB8:ACAD:2030:2E0:B0FF:FEF1:7A31', sw: 'ZGZ-ACC2', port: 'Fa0/3', label: 'Terminal de muelle' });
  D('ZGZ-ETQ-02', 'prn', 1245, 600, { site: ZGZ, vlan: 30, ip: '10.2.30.5', mask: '255.255.255.128', cidr: 25, gw: '10.2.30.1', mac: '00E0.B0F1.7A05', sw: 'ZGZ-ACC2', port: 'Fa0/5', label: 'Impresora de etiquetas' });
  D('ZGZ-AP01', 'ap', 1140, 560, { site: ZGZ, sw: 'ZGZ-ACC4', port: 'Fa0/1', ssid: 'LogiTrans-Invitados' });
  D('ZGZ-INV-01', 'pc', 1140, 660, { site: ZGZ, vlan: 40, wifi: true, ap: 'ZGZ-AP01', ip: '10.2.40.11', mask: '255.255.255.224', cidr: 27, gw: '10.2.40.1', dns: '10.2.50.10', mac: '0060.2F84.72B0', label: 'Portátil invitado' });

  /* Equipos virtuales (no están en el mapa): consolas para las pruebas de servicios */
  N.virt = {
    'HOST': { id: 'HOST', type: 'ps', label: 'Equipo anfitrión · PowerShell', user: 'BYWAAKE\\admin.servidor01', cwd: 'C:\\LogiTrans\\web' },
    'SRV-AD': { id: 'SRV-AD', type: 'ps', label: 'SRV-AD · Windows Server 2022', user: 'LOGITRANS\\Administrator', cwd: 'C:\\Users\\Administrator' },
    'WIN10': { id: 'WIN10', type: 'cmd', label: 'Cliente Windows 10', user: 'LOGITRANS\\admin.xarxa01', cwd: 'C:\\Windows\\system32' },
    'WIN11': { id: 'WIN11', type: 'cmd', label: 'Cliente Windows 11', user: 'LOGITRANS\\admin.rrhh', cwd: 'C:\\Users\\admin.rrhh' }
  };
  N.alias = function (name) {
    name = String(name).replace(/\s*\(.*\)\s*$/, '').trim();
    var m = {
      'PC intruso': 'P1-ADM-03', 'Equipo anfitrión': 'HOST', 'Equipo de auditoría': 'HOST', 'Cliente Windows 10': 'WIN10',
      'Cliente Windows 11': 'WIN11', 'SRV-AD': 'SRV-AD'
    };
    return m[name] || name;
  };
  N.get = function (id) { return N.dev[id] || N.virt[id]; };

  /* ---------- Enlaces ---------- */
  function L(a, ai, b, bi, kind) { N.links.push({ a: a, ai: ai, b: b, bi: bi, kind: kind || 'cu' }); }
  L('ISP-1', 'Gi0/0/1', 'ISP-2', 'Gi0/0/1', 'wan'); L('ISP-2', 'Gi0/0/3', 'ISP-4', 'Gi0/0/3', 'wan');
  L('ISP-4', 'Gi0/0/1', 'ISP-3', 'Gi0/0/1', 'wan'); L('ISP-3', 'Gi0/0/2', 'ISP-1', 'Gi0/0/2', 'wan');
  L('BCN-RT1', 'Gi0/0/0', 'ISP-1', 'Gi0/0/0', 'wan'); L('BCN-RT2', 'Gi0/0/0', 'ISP-2', 'Gi0/0/0', 'wan');
  L('ZGZ-RT1', 'Gi0/0/0', 'ISP-3', 'Gi0/0/0', 'wan'); L('ZGZ-RT2', 'Gi0/0/0', 'ISP-4', 'Gi0/0/0', 'wan');
  L('ISP-2', 'Gi0/0/2', 'PC-INTERNET', 'Fa0'); L('ISP-2', 'Gi0/0/2', 'DNS-PUBLICO', 'Fa0');
  L('BCN-RT1', 'Tunnel0', 'ZGZ-RT1', 'Tunnel0', 'vpn');
  ['BCN', 'ZGZ'].forEach(function (s) {
    L(s + '-RT1', 'Gi0/0/1', s + '-FW', 'Gi1/2', 'fib'); L(s + '-RT2', 'Gi0/0/1', s + '-FW', 'Gi1/3', 'fib');
    L(s + '-RT1', 'Gi0/0/2', s + '-RT2', 'Gi0/0/2');
    L(s + '-FW', 'Gi1/4', s + '-CORE1', 'Gi1/0/20', 'fib'); L(s + '-FW', 'Gi1/5', s + '-CORE2', 'Gi1/0/20', 'fib');
    L(s + '-CORE1', 'Po1', s + '-CORE2', 'Po1', 'po');
  });
  ['BCN-P0-ACC1', 'BCN-P1-ACC1', 'BCN-P2-ACC1', 'BCN-P3-ACC1', 'ZGZ-ACC1', 'ZGZ-ACC2', 'ZGZ-ACC4'].forEach(function (a) {
    var s = a.slice(0, 3), d = N.dev[a];
    L(s + '-CORE1', d.up, a, 'Gi0/1', 'fib'); L(s + '-CORE2', d.up, a, 'Gi0/2', 'fib');
  });
  Object.keys(N.dev).forEach(function (id) {
    var d = N.dev[id];
    if (d.sw && d.site !== NET) L(d.sw, d.port, id, d.type === 'ap' ? 'Gi0' : 'Fa0');
    if (d.ap) L(d.ap, 'Wlan0', id, 'Wireless0', 'wifi');
  });

  /* ---------- Direcciones ---------- */
  var SITEN = { BCN: 1, ZGZ: 2 };
  Object.keys(N.dev).forEach(function (id) {
    var d = N.dev[id];
    if (d.ip) N.byIp[d.ip] = id;
    (d.ips || []).forEach(function (ip) { N.byIp[ip] = id; });
    if (d.mgmt) N.byIp[d.mgmt] = id;
  });
  LT.SUBNETS.forEach(function (s) {
    var p = s.net.split('.'); p[3] = 1; N.byIp[p.join('.')] = s.site + '-CORE1';
    p[3] = 2; N.byIp[p.join('.')] = s.site + '-CORE1'; p[3] = 3; N.byIp[p.join('.')] = s.site + '-CORE2';
  });
  N.byIp['85.100.1.18'] = 'SRV-HV03';
  N.find = function (ip) { return N.byIp[ip]; };
  N.vlanOf = function (ip) { var s = N.subnetOf(ip); return s ? s.vlan : null; };
  N.subnetOf = function (ip) { for (var i = 0; i < LT.SUBNETS.length; i++) { var s = LT.SUBNETS[i]; if (LT.inNet(ip, s.net, s.cidr)) return s; } return null; };
  N.siteOf = function (ip) { if (/^10\.1\./.test(ip)) return 'BCN'; if (/^10\.2\./.test(ip)) return 'ZGZ'; return NET; };
  N.isPrivate = function (ip) { return /^10\./.test(ip); };

  /* ---------- Estado ---------- */
  var S = N.state = {};
  N.reset = function () {
    S.cut = false;            // troncal Gi0/1 de BCN-P1-ACC1 apagado
    S.err = {};               // 'DEV:Fa0/3' -> 'psecure-violation' | 'bpduguard'
    S.viol = {};              // 'DEV:Fa0/3' -> {mac, count}
    S.intruder = false;       // PC intruso conectado en Fa0/3 de BCN-P1-ACC1
    S.rogueSw = false;
    S.vpnUp = true;
    S.ipsec = { enc: 91, dec: 89 };
    S.nat = { hits: 12, misses: 0, expired: 7, dyn: [] };
    S.webConn = false;
    S.dhcpOk = { 'P1-ADM-03': true };
    S.fw6 = false;
    S.logs = {};              // mensajes de consola por equipo
    S.p0new = false; S.fwAsus = false;
    resetAcl();
  };

  /* ---------- ACL (líneas y contadores reales de las capturas 55, 80, 86 y 93) ---------- */
  function A(seq, t, m, h) { return { s: seq, t: t, m: m, h: h || 0 }; }
  var isP = function (pr) { return function (p) { return p.p === pr; }; };
  var hostIs = function (ip) { return function (a) { return a === ip; }; };
  var net = function (n, c) { return function (a) { return a && LT.inNet(a, n, c); }; };
  function resetAcl() {
    var acl = N.acl = {};
    function inv(m50) {
      return { kind: 'ext', name: 'ACL-INVITADOS-IN', l: [
        A(10, 'permit udp any any eq bootps', function (p) { return p.p === 'udp' && p.port === 67; }, m50 ? 3 : 3),
        A(20, 'permit udp any any eq domain', function (p) { return p.p === 'udp' && p.port === 53; }, 7),
        A(30, 'permit tcp any any eq www', function (p) { return p.p === 'tcp' && p.port === 80; }, 0),
        A(40, 'permit tcp any any eq 443', function (p) { return p.p === 'tcp' && p.port === 443; }, 0),
        A(50, 'deny ip any any', function () { return true; }, m50)] };
    }
    function ges(site) {
      var o = site === 'BCN' ? '10.1' : '10.2';
      return { kind: 'ext', name: 'ACL-GESTION-OUT', l: [
        A(10, 'permit ip 10.1.99.0 0.0.0.31 any', function (p) { return LT.inNet(p.src, '10.1.99.0', 27); }),
        A(20, 'permit ip 10.2.99.0 0.0.0.63 any', function (p) { return LT.inNet(p.src, '10.2.99.0', 26); }),
        A(30, 'permit udp host 10.1.50.10 any', function (p) { return p.p === 'udp' && p.src === '10.1.50.10'; }, site === 'BCN' ? 4 : 0),
        A(40, 'permit udp host 10.2.50.10 any', function (p) { return p.p === 'udp' && p.src === '10.2.50.10'; }, site === 'ZGZ' ? 4 : 0),
        A(50, 'permit tcp host 10.1.50.10 any established', function (p) { return p.p === 'tcp' && p.src === '10.1.50.10' && p.est; }),
        A(60, 'permit tcp host 10.2.50.10 any established', function (p) { return p.p === 'tcp' && p.src === '10.2.50.10' && p.est; }),
        A(70, 'permit icmp any any echo-reply', function (p) { return p.p === 'icmp' && p.icmp === 'echo-reply'; }),
        A(80, 'permit tcp ' + o + '.254.0 0.0.0.255 eq 22 any established', function (p) { return p.p === 'tcp' && LT.inNet(p.src, o + '.254.0', 24) && p.sport === 22 && p.est; }),
        A(90, 'deny ip any any', function () { return true; }, site === 'BCN' ? 8 : 0)] };
    }
    function vty() {
      return { kind: 'std', name: 'ACL-VTY-GESTION', l: [
        A(10, 'permit 10.1.99.0 0.0.0.31', function (p) { return LT.inNet(p.src, '10.1.99.0', 27); }),
        A(20, 'permit 10.2.99.0 0.0.0.63', function (p) { return LT.inNet(p.src, '10.2.99.0', 26); }),
        A(30, 'deny any', function () { return true; })] };
    }
    function inv6(h) {
      return { kind: 'v6', name: 'ACL6-INVITADOS-IN', l: [
        A(10, 'deny ipv6 any 2001:DB8:ACAD::/48', function (p) { return p.v6 && /^2001:db8:acad:/i.test(p.dst); }),
        A(20, 'permit ipv6 any any', function (p) { return p.v6; }, h)] };
    }
    acl['BCN-CORE1'] = { 'ACL-INVITADOS-IN': inv(16713), 'ACL-GESTION-OUT': ges('BCN'), 'ACL-VTY-GESTION': vty(), 'ACL6-INVITADOS-IN': inv6(67) };
    acl['ZGZ-CORE1'] = { 'ACL-INVITADOS-IN': inv(100758), 'ACL-GESTION-OUT': ges('ZGZ'), 'ACL-VTY-GESTION': vty(), 'ACL6-INVITADOS-IN': inv6(354),
      'ACL-OPERARIOS-IN': { kind: 'ext', name: 'ACL-OPERARIOS-IN', l: [
        A(10, 'permit udp any any eq bootps', function (p) { return p.p === 'udp' && p.port === 67; }, 17),
        A(20, 'permit udp any host 10.2.50.10 eq domain', function (p) { return p.p === 'udp' && p.dst === '10.2.50.10' && p.port === 53; }, 2),
        A(30, 'permit tcp any host 10.1.50.11 eq 3306', function (p) { return p.p === 'tcp' && p.dst === '10.1.50.11' && p.port === 3306; }),
        A(40, 'permit tcp any host 10.1.50.12 eq www', function (p) { return p.p === 'tcp' && p.dst === '10.1.50.12' && p.port === 80; }, 10),
        A(50, 'permit tcp any host 10.1.50.12 eq 443', function (p) { return p.p === 'tcp' && p.dst === '10.1.50.12' && p.port === 443; }),
        A(60, 'deny ip any any', function () { return true; }, 102082)] } };
    ['BCN-CORE1', 'ZGZ-CORE1'].forEach(function (c) { acl[c.replace('1', '2')] = acl[c]; });
    function fw(site) {
      var me = site === 'BCN' ? '10.1' : '10.2', ot = site === 'BCN' ? '10.2' : '10.1', bcn = site === 'BCN';
      var o = { kind: 'asa', name: 'OUTSIDE_IN', l: [
        A(1, 'extended permit icmp any any echo-reply', function (p) { return p.p === 'icmp' && p.icmp === 'echo-reply'; }, bcn ? 13 : 0),
        A(2, 'extended permit icmp any any unreachable', function (p) { return p.p === 'icmp' && p.icmp === 'unreachable'; }),
        A(3, 'extended permit ip ' + ot + '.0.0 255.255.0.0 ' + me + '.0.0 255.255.0.0', function (p) { return LT.inNet(p.src, ot + '.0.0', 16) && LT.inNet(p.dst, me + '.0.0', 16); }, bcn ? 19 : 0),
        A(4, 'extended permit udp host ' + me + '.254.1 host ' + me + '.50.10 eq 1645', function (p) { return p.src === me + '.254.1' && p.port === 1645; }),
        A(5, 'extended permit udp host ' + me + '.254.5 host ' + me + '.50.10 eq 1645', function (p) { return p.src === me + '.254.5' && p.port === 1645; })] };
      if (bcn) o.l.push(
        A(6, 'extended permit tcp any host 10.1.50.12 eq www', function (p) { return p.p === 'tcp' && p.dst === '10.1.50.12' && p.port === 80; }, 6),
        A(7, 'extended permit tcp any host 10.1.50.12 eq 443', function (p) { return p.p === 'tcp' && p.dst === '10.1.50.12' && p.port === 443; }));
      o.l.push(
        A(bcn ? 8 : 6, 'extended permit icmp6 any any echo-reply', function (p) { return p.v6 && p.icmp === 'echo-reply'; }),
        A(bcn ? 9 : 7, 'extended permit tcp ' + me + '.254.0 255.255.255.0 eq 22 ' + me + '.99.0 255.255.255.' + (bcn ? '224' : '192'), function (p) { return p.sport === 22 && LT.inNet(p.src, me + '.254.0', 24); }),
        A(bcn ? 10 : 8, 'extended deny ip any any', function () { return true; }));
      var i = { kind: 'asa', name: 'INSIDE_OUT', l: [
        A(1, 'extended permit ip ' + me + '.0.0 255.255.0.0 ' + ot + '.0.0 255.255.0.0', function (p) { return LT.inNet(p.src, me + '.0.0', 16) && LT.inNet(p.dst, ot + '.0.0', 16); }, bcn ? 27 : 0),
        A(2, 'extended permit tcp ' + me + '.99.0 255.255.255.0 ' + me + '.254.0 255.255.255.0 eq 22', function (p) { return p.p === 'tcp' && p.port === 22 && LT.inNet(p.dst, me + '.254.0', 24); }),
        A(3, 'extended permit tcp ' + me + '.0.0 255.255.0.0 any eq www', function (p) { return p.p === 'tcp' && p.port === 80; }),
        A(4, 'extended permit udp ' + me + '.0.0 255.255.0.0 any eq domain', function (p) { return p.p === 'udp' && p.port === 53; }),
        A(5, 'extended permit icmp ' + me + '.0.0 255.255.0.0 any', function (p) { return p.p === 'icmp'; }, bcn ? 8 : 0),
        A(6, 'extended permit tcp ' + me + '.0.0 255.255.0.0 any eq 443', function (p) { return p.p === 'tcp' && p.port === 443; })] };
      if (bcn) i.l.push(
        A(7, 'extended permit tcp host 10.1.50.12 eq www any', function (p) { return p.src === '10.1.50.12' && p.sport === 80; }, 6),
        A(8, 'extended permit tcp host 10.1.50.12 eq 443 any', function (p) { return p.src === '10.1.50.12' && p.sport === 443; }));
      i.l.push(
        A(bcn ? 9 : 7, 'extended permit udp host ' + me + '.50.10 eq 1645 ' + me + '.254.0 255.255.255.0', function (p) { return p.src === me + '.50.10' && p.sport === 1645; }),
        A(bcn ? 10 : 8, 'extended deny ip any any', function () { return true; }));
      return { OUTSIDE_IN: o, INSIDE_OUT: i };
    }
    acl['BCN-FW'] = fw('BCN'); acl['ZGZ-FW'] = fw('ZGZ');
  }
  /* Evalúa una lista: devuelve {ok, line} y suma el contador */
  N.check = function (dev, name, p) {
    var a = N.acl[dev] && N.acl[dev][name]; if (!a) return { ok: true };
    for (var i = 0; i < a.l.length; i++) {
      var r = a.l[i];
      if (r.m(p)) { r.h++; return { ok: r.t.indexOf('deny') < 0, line: r, acl: a.name, dev: dev }; }
    }
    return { ok: false, line: { s: '(implícita)', t: 'deny any' }, acl: a.name, dev: dev };
  };
  N.hex = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return '0x' + ('0000000' + h.toString(16)).slice(-8); };

  /* ---------- Caminos ---------- */
  function coreOf(site) { return site + '-CORE1'; }
  function accOf(d) { return d.ap ? N.dev[d.ap].sw : d.sw; }
  /* Del equipo hasta el core que enruta, en orden */
  N.up = function (id) {
    var d = N.dev[id]; if (!d) return [id];
    if (d.type === 'srv' && d.site !== NET) return [id, d.sw];
    if (d.type === 'l3') return d.svi === 3 ? [id, coreOf(d.site)] : [id];
    if (d.type === 'sw') return S.cut && id === 'BCN-P1-ACC1' ? [id, 'BCN-CORE2', 'BCN-CORE1'] : [id, coreOf(d.site)];
    if (d.type === 'fw') return [id];
    if (d.type === 'rt') return [id];
    var acc = accOf(d), p = [id];
    if (d.ap) p.push(d.ap);
    p.push(acc);
    if (S.cut && acc === 'BCN-P1-ACC1') p.push('BCN-CORE2');
    p.push(coreOf(d.site));
    return p;
  };
  N.down = function (id) { return N.up(id).slice().reverse(); };
  function join(a, b) { var r = a.slice(); b.forEach(function (x) { if (r[r.length - 1] !== x) r.push(x); }); return r; }

  /* Cuenta saltos de capa 3 (los dos cores de una sede cuentan como uno) */
  function l3hops(path) {
    var seen = {}, n = 0;
    path.slice(1, -1).forEach(function (id) {
      var d = N.dev[id]; if (!d) return;
      if (d.type === 'l3') { if (seen[d.site]) return; seen[d.site] = 1; n++; }
      else if (d.type === 'rt' || d.type === 'fw') n++;
    });
    return n;
  }
  N.l3hops = l3hops;

  /* Recorre un paquete. p = {src: idOrigen, dst: ip, p:'icmp'|'tcp'|'udp', port, icmp:'echo'}
     Devuelve {path, ok, why, at, reply, unreach, ttl, ev:[{at, from, info:[]}], lost} */
  N.trace = function (srcId, dstIp, o) {
    o = o || {};
    var src = N.dev[srcId], R = { path: [srcId], ev: [], ok: false, dst: dstIp };
    var pkt = { src: src.ip, dst: dstIp, p: o.p || 'icmp', port: o.port, sport: o.sport || 1025, icmp: o.p && o.p !== 'icmp' ? null : 'echo', v6: /:/.test(dstIp) };
    var ev = function (at, info, kind) { R.ev.push({ at: at, info: info, kind: kind || 'ok' }); };
    var drop = function (at, why, unreachFrom) { R.at = at; R.why = why; if (unreachFrom) R.unreach = unreachFrom; ev(at, [why], 'drop'); return R; };
    var proto = pkt.p.toUpperCase() + (o.port ? ' ' + o.port : '');
    ev(srcId, ['Capa 3: origen ' + src.ip + ', destino ' + dstIp + ', ' + proto + (pkt.icmp ? ' echo request' : ''), 'Capa 2: hacia la puerta de enlace ' + (src.gw || '-')]);

    // Puerto apagado (err-disabled)
    var pk = src.sw + ':' + src.port;
    if (S.err[pk]) return drop(src.sw, src.sw + ' ' + src.port + ' está en err-disabled (' + S.err[pk] + '): el puerto no reenvía nada.');

    if (pkt.v6) {
      var d6 = null; Object.keys(N.dev).forEach(function (k) { if (N.dev[k].v6 && N.dev[k].v6.toLowerCase() === dstIp.toLowerCase()) d6 = k; });
      if (!d6) return drop(srcId, 'Sin respuesta IPv6.');
      if (src.vlan === 40) { var c6 = N.check(coreOf(src.site), 'ACL6-INVITADOS-IN', pkt); if (!c6.ok) { R.path = N.up(srcId); return drop(coreOf(src.site), 'ACL6-INVITADOS-IN: ' + c6.line.t); } }
      R.path = join(N.up(srcId), N.down(d6));
      R.path.forEach(function (id, i) { if (i) ev(id, [N.dev[id].type === 'l3' ? 'Enruta en IPv6 entre las SVI (' + id + ')' : 'Reenvía la trama']); });
      R.ok = true; R.hops = l3hops(R.path); R.target = d6; return R;
    }

    var dId = N.find(dstIp);
    var srcSite = src.site, dstSite = N.siteOf(dstIp);

    /* Desde Internet */
    if (srcSite === NET) {
      if (dstIp === '85.100.1.18') {
        R.path = [srcId, 'ISP-2', 'ISP-1', 'BCN-RT1'];
        ev('ISP-2', ['OSPF: 85.100.1.16/30 se conoce vía ISP-1']);
        ev('ISP-1', ['Entrega a BCN-RT1 por Gi0/0/0']);
        ev('BCN-RT1', ['NAT estático: 85.100.1.18 → 10.1.50.12 (ip nat inside source static)']);
        S.nat.hits++;
        R.path.push('BCN-FW');
        var real = { src: pkt.src, dst: '10.1.50.12', p: pkt.p, port: pkt.port, icmp: pkt.icmp };
        var c = N.check('BCN-FW', 'OUTSIDE_IN', real);
        if (!c.ok) return drop('BCN-FW', 'BCN-FW OUTSIDE_IN línea ' + c.line.s + ': ' + c.line.t + '. El ASA solo deja entrar HTTP y HTTPS hacia el servidor web.');
        ev('BCN-FW', ['OUTSIDE_IN línea ' + c.line.s + ': ' + c.line.t + ' (hitcnt=' + c.line.h + ')']);
        R.path = R.path.concat(['BCN-CORE1', 'SRV-HV03']);
        ev('BCN-CORE1', ['Entrega en la VLAN 50']); ev('SRV-HV03', ['nginx responde en el puerto ' + pkt.port]);
        if (pkt.p === 'tcp') { N.check('BCN-FW', 'INSIDE_OUT', { src: '10.1.50.12', dst: pkt.src, p: 'tcp', sport: pkt.port }); S.webConn = true; }
        R.ok = true; R.target = 'SRV-HV03'; R.hops = 5; return R;
      }
      if (N.isPrivate(dstIp)) {
        R.path = [srcId, 'ISP-2'];
        return drop('ISP-2', 'ISP-2 no tiene ruta hacia ' + dstIp + ': las redes privadas no existen en Internet (% Network not in table).', '203.0.113.1');
      }
      if (dId && N.dev[dId].site === NET) { R.path = [srcId, 'ISP-2']; if (dId !== 'ISP-2') R.path.push(dId); R.ok = true; R.target = dId; R.hops = R.path.length - 2; return R; }
      if (dId) { // WAN de una sede
        var rt = dId; R.path = dId.indexOf('BCN') === 0 ? [srcId, 'ISP-2', 'ISP-1', dId] : [srcId, 'ISP-2', 'ISP-4', 'ISP-3', dId];
        R.ok = true; R.target = dId; R.hops = R.path.length - 2; return R;
      }
      R.path = [srcId, 'ISP-2']; return drop('ISP-2', 'Destino desconocido.', '203.0.113.1');
    }

    var up = N.up(srcId), core = coreOf(srcSite);
    R.path = up;
    up.slice(1).forEach(function (id) {
      var d = N.dev[id];
      if (d.type === 'ap') ev(id, ['Wi-Fi: SSID ' + d.ssid + ', etiqueta VLAN ' + src.vlan]);
      else if (d.type === 'sw') ev(id, ['Capa 2: entra por ' + src.port + ' (VLAN ' + src.vlan + '), sale etiquetada por ' + (S.cut && id === 'BCN-P1-ACC1' ? 'Gi0/2 (Gi0/1 caído)' : 'Gi0/1') + ' (802.1Q, nativa 999)', 'Port Security: MAC ' + src.mac + ' permitida (sticky)']);
      else if (d.type === 'l3' && d.svi === 3) ev(id, ['CORE2 no es el activo de HSRP: pasa la trama al CORE1 por el Port-channel 1']);
    });

    /* ACL de entrada en la SVI de origen */
    var inAcl = src.vlan === 40 ? 'ACL-INVITADOS-IN' : (src.vlan === 30 ? 'ACL-OPERARIOS-IN' : null);
    var sviIp = src.gw ? src.gw.replace(/\.1$/, '.2') : null;
    if (inAcl) {
      var ci = N.check(core, inAcl, pkt);
      if (!ci.ok) return drop(core, core + ' · Vlan' + src.vlan + ' · ' + inAcl + ' línea ' + ci.line.s + ': ' + ci.line.t + ' (' + ci.line.h + ' coincidencias).', sviIp);
      ev(core, [inAcl + ' línea ' + ci.line.s + ': ' + ci.line.t]);
    }

    /* Destino: el propio core (puerta de enlace o SVI) */
    if (dId === core || dId === srcSite + '-CORE2') {
      if (dId === srcSite + '-CORE2' && R.path[R.path.length - 1] !== dId) R.path.push(dId);
      ev(dId, ['La SVI ' + dstIp + ' responde (HSRP: la .1 es la IP virtual del grupo)']);
      R.ok = true; R.target = dId; R.hops = 0; R.fromRouter = true; return R;
    }

    /* Mismo sitio */
    if (dstSite === srcSite && dId) {
      var dd = N.dev[dId], dv = N.vlanOf(dstIp);
      if (dd.type === 'fw' || dd.type === 'rt') {
        R.path = join(up, dd.type === 'fw' ? [core, srcSite + '-FW'] : [core, srcSite + '-FW', dId]);
        if (dd.type === 'rt') {
          var cf = N.check(srcSite + '-FW', 'INSIDE_OUT', pkt);
          if (!cf.ok) return drop(srcSite + '-FW', srcSite + '-FW INSIDE_OUT línea ' + cf.line.s + ': ' + cf.line.t);
          ev(srcSite + '-FW', ['INSIDE_OUT línea ' + cf.line.s + ': ' + cf.line.t]);
        }
        R.ok = true; R.target = dId; R.hops = l3hops(R.path); R.fromRouter = true; return R;
      }
      if (dv === src.vlan && dd.type !== 'l3' && dd.type !== 'sw') {
        var sa = accOf(src), da = dd.type === 'srv' ? dd.sw : accOf(dd);
        if (sa === da) R.path = [srcId].concat(src.ap ? [src.ap] : []).concat([sa]).concat(dd.ap ? [dd.ap] : []).concat([dId]);
        else R.path = join(up, N.down(dId));
        ev(R.path[R.path.length - 2], ['Misma VLAN ' + dv + ': conmutación de capa 2, sin pasar por ninguna ACL']);
        if (S.err[dd.sw + ':' + dd.port]) return drop(dd.sw, dd.sw + ' ' + dd.port + ' está en err-disabled.');
        R.ok = true; R.target = dId; R.hops = 0; return R;
      }
      // Entre VLAN: GESTION-OUT al entrar en la 99
      ev(core, ['Enrutamiento entre VLAN: ' + src.gw + ' (Vlan' + src.vlan + ') → Vlan' + dv]);
      if (dv === 99 && src.vlan !== 99) {
        var cg = N.check(core, 'ACL-GESTION-OUT', pkt);
        if (!cg.ok) return drop(core, core + ' · Vlan99 (salida) · ACL-GESTION-OUT línea ' + cg.line.s + ': ' + cg.line.t + '. Solo el NOC llega a la red de gestión.', sviIp);
      }
      R.path = join(up, N.down(dId));
      R.path.slice(up.length).forEach(function (id) { if (N.dev[id].type === 'sw') ev(id, ['Capa 2: sale por el puerto de acceso de la VLAN ' + dv]); });
      if (dd.sw && S.err[dd.sw + ':' + dd.port]) return drop(dd.sw, dd.sw + ' ' + dd.port + ' está en err-disabled.');
      ev(dId, [pkt.icmp ? 'Echo request recibido: responde con echo reply' : 'Servicio ' + pkt.p.toUpperCase() + ' ' + pkt.port + ' recibido']);
      // Respuesta hacia la 99 (por ejemplo, el NOC hace ping a un servidor)
      if (src.vlan === 99 && dv !== 99 && pkt.icmp) N.check(core, 'ACL-GESTION-OUT', { src: dstIp, dst: src.ip, p: 'icmp', icmp: 'echo-reply' });
      R.ok = true; R.target = dId; R.hops = l3hops(R.path); R.fromRouter = dd.type === 'sw' || dd.type === 'l3'; return R;
    }

    /* Otra sede: por la VPN */
    if ((dstSite === 'BCN' || dstSite === 'ZGZ') && dstSite !== srcSite) {
      var fw1 = srcSite + '-FW', rt1 = srcSite + '-RT1', fw2 = dstSite + '-FW', rt2 = dstSite + '-RT1';
      var c1 = N.check(fw1, 'INSIDE_OUT', pkt);
      R.path = join(up, [fw1]);
      if (!c1.ok) return drop(fw1, fw1 + ' INSIDE_OUT línea ' + c1.line.s + ': ' + c1.line.t);
      ev(fw1, ['INSIDE_OUT línea ' + c1.line.s + ': ' + c1.line.t + ' (hitcnt=' + c1.line.h + ')']);
      R.path = join(R.path, [rt1]);
      ev(rt1, ['Ruta OSPF O E2 ' + (dstSite === 'ZGZ' ? '10.2.0.0/16' : '10.1.0.0/16') + ' vía Tunnel0', 'GRE sobre IPsec: ESP con AES-256 y SHA-HMAC hacia ' + (dstSite === 'ZGZ' ? '85.100.2.2' : '85.100.1.2')]);
      if (!S.vpnUp) { S.vpnUp = true; R.lost = 1; ev(rt1, ['IKE fase 1 (QM_IDLE) y fase 2 negociadas ahora: el primer paquete se pierde mientras se levanta el túnel'], 'warn'); }
      S.ipsec.enc++; S.ipsec.dec++;
      R.path = join(R.path, [rt2, fw2]);
      ev(rt2, ['Descifra el ESP y quita la cabecera GRE']);
      var c2 = N.check(fw2, 'OUTSIDE_IN', pkt);
      if (!c2.ok) return drop(fw2, fw2 + ' OUTSIDE_IN línea ' + c2.line.s + ': ' + c2.line.t);
      ev(fw2, ['OUTSIDE_IN línea ' + c2.line.s + ': ' + c2.line.t]);
      var dId2 = dId, dv2 = N.vlanOf(dstIp), core2 = coreOf(dstSite);
      R.path = join(R.path, [core2]);
      if (!dId2) return drop(core2, 'Ningún equipo con la IP ' + dstIp + '.');
      if (dv2 === 99) {
        var cg2 = N.check(core2, 'ACL-GESTION-OUT', pkt);
        if (!cg2.ok) return drop(core2, core2 + ' · ACL-GESTION-OUT línea ' + cg2.line.s + ': ' + cg2.line.t, null);
      }
      R.path = join(R.path, N.down(dId2));
      ev(dId2, [pkt.icmp ? 'Echo request recibido: responde' : 'Servicio ' + pkt.port + ' recibido']);
      // Vuelta
      N.check(fw2, 'INSIDE_OUT', { src: dstIp, dst: src.ip, p: pkt.p, sport: pkt.port, icmp: pkt.icmp ? 'echo-reply' : null });
      N.check(fw1, 'OUTSIDE_IN', { src: dstIp, dst: src.ip, p: pkt.p, sport: pkt.port, icmp: pkt.icmp ? 'echo-reply' : null });
      R.ok = true; R.target = dId2; R.hops = l3hops(R.path); return R;
    }

    /* Internet */
    var fw = srcSite + '-FW', rt = srcSite + '-RT1', isp = srcSite === 'BCN' ? 'ISP-1' : 'ISP-3';
    R.path = join(up, [fw]);
    var cf2 = N.check(fw, 'INSIDE_OUT', pkt);
    if (!cf2.ok) return drop(fw, fw + ' INSIDE_OUT línea ' + cf2.line.s + ': ' + cf2.line.t + '. Hacia Internet solo salen web, DNS e ICMP.');
    ev(fw, ['INSIDE_OUT línea ' + cf2.line.s + ': ' + cf2.line.t + ' (hitcnt=' + cf2.line.h + ')']);
    R.path.push(rt);
    var pub = srcSite === 'BCN' ? '85.100.1.2' : '85.100.2.2';
    ev(rt, ['NAT con sobrecarga (PAT): ' + src.ip + ' → ' + pub, 'Ruta por defecto hacia ' + (srcSite === 'BCN' ? '85.100.1.1 (ISP-1)' : '85.100.2.1 (ISP-3)')]);
    if (srcSite === 'BCN') { S.nat.hits++; S.nat.dyn.push({ t: Date.now(), p: pkt.p, ins: src.ip, out: pub, dst: dstIp, id: 1 + S.nat.dyn.length }); }
    R.path.push(isp);
    if (!dId || N.dev[dId].site !== NET) {
      if (dstIp === '85.100.1.18') { R.path.push('ISP-1', 'BCN-RT1'); R.ok = true; R.target = 'SRV-HV03'; R.hops = 4; return R; }
      return drop(isp, 'Ningún equipo de Internet tiene la IP ' + dstIp + '.');
    }
    if (srcSite === 'BCN') R.path.push('ISP-2'); else R.path.push('ISP-4', 'ISP-2');
    if (dId !== 'ISP-2' && N.dev[dId].type !== 'rt') R.path.push(dId);
    ev('ISP-2', ['Entrega en la LAN de Internet 203.0.113.0/24']);
    if (dId === 'DNS-PUBLICO' && pkt.p === 'tcp') return drop('DNS-PUBLICO', 'El servidor no tiene ningún servicio en el puerto ' + pkt.port + '.');
    if (pkt.icmp) { var cr = N.check(fw, 'OUTSIDE_IN', { src: dstIp, dst: src.ip, p: 'icmp', icmp: 'echo-reply' }); ev(fw, ['Vuelta: OUTSIDE_IN línea ' + cr.line.s + ': ' + cr.line.t + ' (hitcnt=' + cr.line.h + ')']); }
    R.ok = true; R.target = dId; R.hops = l3hops(R.path); return R;
  };

  /* Recursos de las VLAN para el ping virtual de la SVI */
  N.siteNum = SITEN;
  N.reset();
})();
