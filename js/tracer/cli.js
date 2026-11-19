/* LogiTrans Tracer · consola de los equipos Cisco (IOS y ASA)
   Abreviaturas como en IOS (sh ip int br), filtros | include / | section / | begin,
   modos usuario, privilegiado y configuración. Las salidas siguen el formato del Packet Tracer. */
(function () {
  var LT = window.LT, N = LT.NET, S = N.state;
  var C = LT.CLI = { cmds: {}, macros: {} };
  var pad = C.pad = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
  var lpad = C.lpad = function (s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; };
  var out = C.out = function (txt, o) { o = o || {}; o.t = txt; return o; };

  /* ---------- Nombres de interfaz ---------- */
  C.ifn = function (s) {
    if (!s) return s;
    var m = String(s).match(/^([a-z-]+)\s*([\d/.]+)$/i); if (!m) return s;
    var k = m[1].toLowerCase(), map = [['fa', 'FastEthernet'], ['f', 'FastEthernet'], ['gi', 'GigabitEthernet'], ['g', 'GigabitEthernet'], ['tu', 'Tunnel'], ['po', 'Port-channel'], ['vl', 'Vlan'], ['lo', 'Loopback'], ['se', 'Serial']];
    for (var i = 0; i < map.length; i++) if (map[i][1].toLowerCase().indexOf(k) === 0 || k === map[i][0]) return map[i][1] + m[2];
    return s;
  };
  C.ifs = function (full) { return full.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gi').replace('Port-channel', 'Po').replace('Tunnel', 'Tu'); };

  /* ---------- Árbol de comandos IOS ---------- */
  var IOS = [
    'show ip interface brief', 'show ipv6 interface brief', 'show ip route', 'show ip route ospf', 'show ip route <ip>', 'show ipv6 route',
    'show running-config', 'show running-config interface <if>', 'show startup-config', 'show access-lists', 'show access-lists <w>',
    'show standby brief', 'show standby', 'show vlan brief', 'show vlan', 'show interfaces trunk', 'show interfaces status', 'show interfaces <if> status', 'show interfaces <if>',
    'show vtp status', 'show spanning-tree vlan <n>', 'show spanning-tree interface <if> detail', 'show spanning-tree', 'show etherchannel summary',
    'show port-security', 'show port-security interface <if>', 'show port-security address', 'show ip dhcp snooping', 'show ip dhcp snooping binding',
    'show crypto isakmp sa', 'show crypto ipsec sa', 'show crypto map', 'show ip ospf neighbor', 'show ipv6 ospf neighbor', 'show ip ospf interface <if>', 'show ipv6 ospf interface <if>',
    'show ip nat translations', 'show ip nat statistics', 'show ip ssh', 'show cdp neighbors', 'show version', 'show clock', 'show mac address-table', 'show users', 'show history', 'show logging',
    'enable', 'disable', 'exit', 'end', 'logout', 'configure terminal', 'interface <if>', 'shutdown', 'no shutdown', 'ping <ip>', 'ping ipv6 <ip>', 'traceroute <ip>',
    'clear crypto sa', 'clear crypto isakmp', 'clear ip nat translation *', 'clear port-security sticky', 'errdisable recovery cause all', 'write memory', 'copy running-config startup-config',
    'ipv6 ospf authentication <rest>', 'do <rest>', 'help'
  ];
  var ASA = ['show access-list', 'show access-list <w>', 'show running-config access-group', 'show running-config', 'show nameif', 'show interface ip brief', 'show route', 'show xlate', 'show conn', 'show version',
    'enable', 'disable', 'exit', 'end', 'logout', 'configure terminal', 'ping <ip>', 'help', 'clear access-list counters'];
  function compile(list) { return list.map(function (s) { return { c: s, t: s.split(' ') }; }); }
  var TREES = { ios: compile(IOS), asa: compile(ASA) };

  /* Resuelve una línea abreviada contra el árbol: {c:'show ip route <ip>', args:[...]} */
  C.parse = function (line, kind) {
    var pipe = null, i = line.indexOf('|');
    if (i >= 0) { pipe = line.slice(i + 1).trim(); line = line.slice(0, i); }
    var w = line.trim().split(/\s+/).filter(Boolean); if (!w.length) return null;
    var best = null, bestScore = -1;
    TREES[kind].forEach(function (cm) {
      var t = cm.t, args = [], score = 0;
      if (t[t.length - 1] === '<rest>') { if (w.length < t.length - 1) return; }
      else if (w.length !== t.length) return;
      for (var k = 0; k < t.length; k++) {
        var tk = t[k];
        if (tk === '<rest>') { args.push(w.slice(k).join(' ')); break; }
        if (tk[0] === '<') { if (w[k] == null) return; args.push(w[k]); continue; }
        if (w[k] == null) return;
        var u = w[k].toLowerCase();
        if (tk.indexOf(u) !== 0) return;
        score += u === tk ? 3 : 1;
      }
      // Preferir literales sobre comodines
      score += t.filter(function (x) { return x[0] !== '<'; }).length * 2;
      if (score > bestScore) { best = { c: cm.c, args: args }; bestScore = score; }
    });
    if (best) best.pipe = pipe;
    return best;
  };
  C.filter = function (text, pipe) {
    if (!pipe) return text;
    var m = pipe.match(/^(\S+)\s+(.*)$/); if (!m) return text;
    var k = m[1].toLowerCase(), re; try { re = new RegExp(m[2], 'i'); } catch (e) { re = new RegExp(m[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); }
    var lines = text.split('\n');
    if ('include'.indexOf(k) === 0) return lines.filter(function (l) { return re.test(l); }).join('\n');
    if ('exclude'.indexOf(k) === 0) return lines.filter(function (l) { return !re.test(l); }).join('\n');
    if ('begin'.indexOf(k) === 0) { for (var i = 0; i < lines.length; i++) if (re.test(lines[i])) return lines.slice(i).join('\n'); return ''; }
    if ('section'.indexOf(k) === 0) {
      var r = [], on = false;
      lines.forEach(function (l) {
        if (/^\S/.test(l)) on = re.test(l);
        if (on && l !== '!') r.push(l);
      });
      return r.join('\n');
    }
    return text;
  };

  /* ---------- Ayudantes de salida ---------- */
  var SITE = function (dev) { return N.dev[dev] ? N.dev[dev].site : ''; };
  var oc = function (dev) { return SITE(dev) === 'BCN' ? '10.1' : '10.2'; };
  var siteVlans = function (site) { return LT.SUBNETS.filter(function (s) { return s.site === site; }); };
  var PORTS = {
    'BCN-P0-ACC1': { 'Fa0/1': { v: 40, max: 64, act: 'Restrict', macs: ['00E0.A3C1.2F01'], dev: 'BCN-P0-AP01' }, 'Fa0/5': { v: 20, max: 1, macs: ['0090.2B5C.11E0'], dev: 'P0-IMP-02' }, 'Fa0/6': { v: 20, max: 1, macs: ['0030.BB2E.0743'], dev: 'P0-REC-01' }, 'Fa0/7': { v: 20, max: 1, macs: ['0002.17D4.8A61'] } },
    'BCN-P1-ACC1': { 'Fa0/1': { v: 40, max: 32, act: 'Restrict', macs: ['00E0.A3C1.2F11'] }, 'Fa0/2': { v: 20, max: 3, macs: ['0060.7035.5001', '00D0.BA44.1E92'] }, 'Fa0/3': { v: 20, max: 1, macs: ['00D0.97A1.3C21'], dev: 'P1-ADM-03' } },
    'BCN-P2-ACC1': { 'Fa0/3': { v: 20, max: 1, macs: ['0002.4A7E.90B1'], dev: 'P2-FIN-01' } },
    'BCN-P3-ACC1': { 'Fa0/3': { v: 10, max: 1, macs: ['0005.5E33.0C18'], dev: 'P3-DIR-01' }, 'Fa0/4': { v: 99, max: 1, macs: ['000A.F3B1.2E40'], dev: 'P3-GES-01' } },
    'ZGZ-ACC1': { 'Fa0/3': { v: 10, max: 1, macs: ['0001.C7A4.3B10'], dev: 'ZGZ-DIR-01' }, 'Fa0/4': { v: 99, max: 1, macs: ['0001.C7A4.3B55'], dev: 'ZGZ-GES-01' } },
    'ZGZ-ACC2': { 'Fa0/3': { v: 30, max: 1, macs: ['00E0.B0F1.7A31'], dev: 'ZGZ-MUE-01' }, 'Fa0/5': { v: 30, max: 1, macs: ['00E0.B0F1.7A05'], dev: 'ZGZ-ETQ-02' } },
    'ZGZ-ACC4': { 'Fa0/1': { v: 40, max: 32, act: 'Restrict', macs: ['00E0.A3C1.2F41'] } }
  };
  C.PORTS = PORTS;
  var macColon = function (m) { var h = m.replace(/\./g, ''); return h.match(/../g).join(':').toUpperCase(); };
  function portState(dev, p) { return S.err[dev + ':' + p] ? 'err-disabled' : 'connected'; }
  function bridgeMac(dev) { var h = N.hex(dev).slice(2, 10).toUpperCase(); return '00' + h.slice(0, 2) + '.' + h.slice(2, 6) + '.' + h.slice(6, 8) + '01'; }

  /* ---------- running-config por equipo ---------- */
  C.running = function (dev) {
    var d = N.dev[dev], L = ['Building configuration...', '', 'Current configuration : 4213 bytes', '!', 'version 16.6.4', 'service password-encryption', '!', 'hostname ' + dev, '!', 'enable secret 5 $1$mERr$9cTjUIEqNGurQiFU.ZeCi1', '!'];
    var o = oc(dev);
    if (d.type === 'rt') {
      if (d.site === 'INET') {
        L.push('interface GigabitEthernet0/0/0', ' ip address ' + d.ips[0] + ' 255.255.255.252', '!', 'interface GigabitEthernet0/0/1', ' ip address ' + d.ips[1] + ' 255.255.255.252', ' ip ospf authentication message-digest', ' ip ospf message-digest-key 1 md5 7 0822455D0A16', ' ipv6 ospf 1 area 0', '!', 'router ospf 1', ' router-id ' + d.rid, ' area 0 authentication message-digest', ' passive-interface GigabitEthernet0/0/0', '!', 'ipv6 router ospf 1', ' router-id ' + d.rid, '!');
      } else {
        var rt1 = /RT1$/.test(dev);
        L.push('aaa new-model', '!', 'aaa authentication login default group radius local', 'aaa authentication login CONSOLA local', '!', 'username noc.admin secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0', '!',
          'ip domain-name logitrans.local', 'ip ssh version 2', '!');
        if (rt1) L.push('crypto isakmp policy 10', ' encr aes 256', ' authentication pre-share', ' group 5', 'crypto isakmp key 6 ******** address ' + (d.site === 'BCN' ? '85.100.2.2' : '85.100.1.2'), '!', 'crypto ipsec transform-set TS-LOGITRANS esp-aes 256 esp-sha-hmac', '!', 'crypto map CMAP-VPN 10 ipsec-isakmp', ' set peer ' + (d.site === 'BCN' ? '85.100.2.2' : '85.100.1.2'), ' set transform-set TS-LOGITRANS', ' match address VPN-GRE', '!',
          'interface Tunnel0', ' ip address ' + (d.site === 'BCN' ? '10.0.0.1' : '10.0.0.2') + ' 255.255.255.252', ' ip ospf authentication message-digest', ' ip ospf message-digest-key 1 md5 7 0822455D0A16', ' tunnel source GigabitEthernet0/0/0', ' tunnel destination ' + (d.site === 'BCN' ? '85.100.2.2' : '85.100.1.2'), '!');
        L.push('interface GigabitEthernet0/0/0', ' ip address ' + d.ips[0] + ' 255.255.255.252', ' ip nat outside');
        if (rt1) L.push(' crypto map CMAP-VPN');
        L.push('!', 'interface GigabitEthernet0/0/1', ' ip address ' + d.ips[1] + ' 255.255.255.252', ' ip nat inside', '!', 'interface GigabitEthernet0/0/2', ' ip address ' + d.ips[2] + ' 255.255.255.252', ' ip ospf authentication message-digest', ' ip ospf message-digest-key 1 md5 7 0822455D0A16', '!',
          'router ospf 1', ' router-id ' + d.rid, ' area 0 authentication message-digest', ' redistribute static subnets', '!',
          'ip nat inside source list 1 interface GigabitEthernet0/0/0 overload');
        if (dev === 'BCN-RT1') L.push('ip nat inside source static 10.1.50.12 85.100.1.18');
        L.push('ip route 0.0.0.0 0.0.0.0 ' + (d.ips[0].replace(/\d+$/, function (x) { return +x - 1; })), 'ip route ' + o + '.0.0 255.255.0.0 ' + d.ips[1].replace(/\d+$/, function (x) { return +x + 1; }), '!', 'access-list 1 permit ' + o + '.0.0 0.0.255.255', 'ip access-list extended VPN-GRE', ' permit gre host ' + (d.site === 'BCN' ? '85.100.1.2 host 85.100.2.2' : '85.100.2.2 host 85.100.1.2'), '!',
          'radius server SRV-AD', ' address ipv4 ' + o + '.50.10 auth-port 1645', ' key 7 ********', '!', 'line con 0', ' login authentication CONSOLA', '!', 'line vty 0 4', ' access-class ACL-VTY-GESTION in', ' transport input ssh', '!', 'end');
      }
    } else if (d.type === 'l3') {
      L.push('ip routing', '!', 'ipv6 unicast-routing', '!', 'spanning-tree mode rapid-pvst', 'spanning-tree vlan ' + siteVlans(d.site).map(function (s) { return s.vlan; }).join(',') + ' priority ' + (d.svi === 2 ? '24576' : '28672'), '!', 'interface Port-channel1', ' switchport mode trunk', '!',
        'interface GigabitEthernet1/0/20', ' no switchport', ' ip address ' + d.ips[0] + ' 255.255.255.252', '!', 'interface GigabitEthernet1/0/23', ' channel-group 1 mode active', '!', 'interface GigabitEthernet1/0/24', ' channel-group 1 mode active', '!');
      siteVlans(d.site).forEach(function (s) {
        var b = s.net.replace(/\.0$/, '.');
        L.push('interface Vlan' + s.vlan, ' ip address ' + b + d.svi + ' ' + s.mask, ' ip helper-address ' + o + '.50.10', ' standby version 2', ' standby ' + s.vlan + ' ip ' + b + '1', ' standby ' + s.vlan + ' priority ' + (d.svi === 2 ? 110 : 100), ' standby ' + s.vlan + ' preempt', ' ipv6 address ' + s.v6.replace('::/64', '::' + d.svi + '/64').toUpperCase());
        if (s.vlan === 40) L.push(' ip access-group ACL-INVITADOS-IN in', ' ipv6 traffic-filter ACL6-INVITADOS-IN in');
        if (s.vlan === 30) L.push(' ip access-group ACL-OPERARIOS-IN in');
        if (s.vlan === 99) L.push(' ip access-group ACL-GESTION-OUT out');
        L.push('!');
      });
      L.push('ip route 0.0.0.0 0.0.0.0 ' + o + '.253.1', 'ipv6 route ::/0 ' + (d.site === 'BCN' ? '2001:DB8:ACAD:1253::1' : '2001:DB8:ACAD:2253::1'), '!');
      Object.keys(N.acl[dev] || {}).forEach(function (k) { var a = N.acl[dev][k]; L.push((a.kind === 'v6' ? 'ipv6 access-list ' : a.kind === 'std' ? 'ip access-list standard ' : 'ip access-list extended ') + a.name); a.l.forEach(function (r) { L.push(' ' + r.t); }); L.push('!'); });
      L.push('line vty 0 15', ' access-class ACL-VTY-GESTION in', ' login authentication default', ' transport input ssh', '!', 'end');
    } else if (d.type === 'sw') {
      L.push('ip dhcp snooping vlan ' + siteVlans(d.site).map(function (s) { return s.vlan; }).join(','), 'no ip dhcp snooping information option', 'ip dhcp snooping', '!', 'vtp mode transparent', 'spanning-tree mode rapid-pvst', '!');
      var P = PORTS[dev] || {};
      for (var i = 1; i <= 24; i++) {
        var pn = 'Fa0/' + i, cfg = P[pn];
        L.push('interface FastEthernet0/' + i);
        if (cfg) {
          L.push(' switchport access vlan ' + cfg.v, ' switchport mode access', ' switchport nonegotiate', ' switchport port-security', ' switchport port-security maximum ' + cfg.max);
          if (cfg.act) L.push(' switchport port-security violation restrict');
          L.push(' switchport port-security mac-address sticky');
          cfg.macs.forEach(function (m) { L.push(' switchport port-security mac-address sticky ' + m); });
          L.push(' ip dhcp snooping limit rate 10', ' spanning-tree portfast', ' spanning-tree bpduguard enable');
        } else L.push(' switchport access vlan 998', ' switchport mode access', ' shutdown');
        L.push('!');
      }
      ['GigabitEthernet0/1', 'GigabitEthernet0/2'].forEach(function (g) {
        L.push('interface ' + g, ' switchport trunk native vlan 999', ' switchport trunk allowed vlan ' + siteVlans(d.site).map(function (s) { return s.vlan; }).join(','), ' switchport mode trunk', ' switchport nonegotiate', ' ip dhcp snooping trust');
        if (S.cut && dev === 'BCN-P1-ACC1' && g === 'GigabitEthernet0/1') L.push(' shutdown');
        L.push('!');
      });
      L.push('interface Vlan99', ' ip address ' + d.mgmt + ' ' + (d.site === 'BCN' ? '255.255.255.224' : '255.255.255.192'), '!', 'ip default-gateway ' + o + '.99.1', '!', 'line vty 0 15', ' access-class ACL-VTY-GESTION in', ' transport input ssh', '!', 'end');
    }
    return L.join('\n');
  };
  C.runningIf = function (dev, ifn) {
    var txt = C.running(dev).split('\n'), r = [], on = false;
    txt.forEach(function (l) { if (/^interface /.test(l)) on = l === 'interface ' + ifn; else if (/^\S/.test(l)) on = false; if (on) r.push(l); });
    if (!r.length) return '%Invalid interface type and number';
    return 'Building configuration...\n\nCurrent configuration : ' + (r.join('\n').length + 12) + ' bytes\n!\n' + r.join('\n') + '\nend';
  };

  /* ---------- Salidas de show ---------- */
  var SH = C.show = {};
  SH['show ip interface brief'] = function (dev) {
    var d = N.dev[dev], r = [pad('Interface', 23) + pad('IP-Address', 16) + 'OK? Method Status                Protocol'];
    var row = function (i, ip, st) { st = st || 'up'; r.push(pad(i, 23) + pad(ip || 'unassigned', 16) + 'YES ' + pad(ip ? 'manual' : 'unset', 7) + pad(st, 22) + (st === 'up' ? 'up' : 'down')); };
    if (d.type === 'rt') {
      row('GigabitEthernet0/0/0', d.ips[0]); row('GigabitEthernet0/0/1', d.ips[1]); row('GigabitEthernet0/0/2', d.ips[2]);
      if (d.ips[3] && d.site !== 'INET') row('Tunnel0', d.ips[3]); else if (d.ips[3]) row('GigabitEthernet0/0/3', d.ips[3]);
      row('Vlan1', null, 'administratively down');
    } else if (d.type === 'l3') {
      for (var i = 1; i <= 24; i++) { var gi = 'GigabitEthernet1/0/' + i; if (i === 20) row(gi, d.ips[0]); else if ([2, 3, 4, 5, 10, 11, 12, 23, 24].indexOf(i) >= 0 || (d.site === 'ZGZ' && i <= 4)) row(gi, null); else row(gi, null, 'down'); }
      row('Port-channel1', null); row('Vlan1', null, 'administratively down');
      siteVlans(d.site).forEach(function (s) { row('Vlan' + s.vlan, s.net.replace(/\.0$/, '.' + d.svi)); });
      if (d.ips[1]) row('Vlan900', d.ips[1]);
    } else if (d.type === 'sw') {
      for (var j = 1; j <= 24; j++) { var pn = 'Fa0/' + j, P = (PORTS[dev] || {})[pn]; row('FastEthernet0/' + j, null, P ? (S.err[dev + ':' + pn] ? 'down' : 'up') : 'administratively down'); }
      row('GigabitEthernet0/1', null, S.cut && dev === 'BCN-P1-ACC1' ? 'administratively down' : 'up'); row('GigabitEthernet0/2', null);
      row('Vlan1', null, 'administratively down'); row('Vlan99', d.mgmt);
    }
    return r.join('\n');
  };
  SH['show ipv6 interface brief'] = function (dev) {
    var d = N.dev[dev], r = [];
    if (d.type === 'l3') siteVlans(d.site).forEach(function (s) { r.push(pad('Vlan' + s.vlan, 23) + '[up/up]', '    FE80::' + d.svi, '    ' + s.v6.replace('::/64', '::' + d.svi).toUpperCase()); });
    else if (d.type === 'rt') { r.push(pad('GigabitEthernet0/0/0', 23) + '[up/up]', '    FE80::1', '    ' + (d.site === 'BCN' ? '2001:DB8:ACAD:F002::2' : '2001:DB8:ACAD:F003::2')); r.push(pad('Tunnel0', 23) + '[up/up]', '    FE80::1', '    2001:DB8:ACAD:F001::' + (d.site === 'BCN' ? 1 : 2)); }
    return r.join('\n');
  };
  var CODES = 'Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP\n       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area\n       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2\n       E1 - OSPF external type 1, E2 - OSPF external type 2, E - EGP\n       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area\n       * - candidate default, U - per-user static route, o - ODR\n       P - periodic downloaded static route\n';
  SH['show ip route'] = function (dev, a, ospfOnly) {
    var d = N.dev[dev], r = [];
    if (d.type === 'l3') {
      r.push('Gateway of last resort is ' + oc(dev) + '.253.1 to network 0.0.0.0', '', '     10.0.0.0/8 is variably subnetted, ' + (siteVlans(d.site).length * 2 + 2) + ' subnets, 6 masks');
      siteVlans(d.site).forEach(function (s) { var b = s.net.replace(/\.0$/, '.'); r.push('C       ' + s.net + '/' + s.cidr + ' is directly connected, Vlan' + s.vlan, 'L       ' + b + d.svi + '/32 is directly connected, Vlan' + s.vlan); });
      r.push('C       ' + oc(dev) + '.253.0/30 is directly connected, GigabitEthernet1/0/20', 'L       ' + d.ips[0] + '/32 is directly connected, GigabitEthernet1/0/20', 'S*   0.0.0.0/0 [1/0] via ' + oc(dev) + '.253.1');
    } else if (d.site === 'INET') {
      var ospf = [['85.100.1.0/30', '200.0.0.2'], ['85.100.1.4/30', '200.0.0.2'], ['85.100.1.16/30', '200.0.0.2'], ['85.100.2.0/30', '200.0.0.6'], ['85.100.2.4/30', '200.0.0.6'], ['200.0.0.8/30', '200.0.0.2'], ['200.0.0.12/30', '200.0.0.6'], ['203.0.113.0/24', '200.0.0.2']];
      if (dev !== 'ISP-1') ospf = ospf.map(function (x) { return [x[0], x[1].replace(/\d+$/, function (n) { return +n - 1; })]; });
      r.push('Gateway of last resort is not set', '');
      ospf.forEach(function (x) { if (d.ips.some(function (ip) { return LT.inNet(ip, x[0].split('/')[0], +x[0].split('/')[1]); })) { if (!ospfOnly) r.push('C       ' + x[0] + ' is directly connected, GigabitEthernet0/0/0'); return; } r.push('O' + (x[0] === '85.100.1.16/30' ? ' E2' : '   ') + '    ' + x[0] + ' [110/' + (x[0] === '85.100.1.16/30' ? 20 : 2) + '] via ' + x[1] + ', 01:12:4' + (r.length % 10) + ', GigabitEthernet0/0/' + (x[1] === '200.0.0.6' || x[1] === '200.0.0.5' ? 2 : 1)); });
      if (!ospfOnly) r.push('C       200.0.0.0/30 is directly connected, GigabitEthernet0/0/1', 'C       200.0.0.4/30 is directly connected, GigabitEthernet0/0/2');
    } else {
      var other = d.site === 'BCN' ? '10.2.0.0/16' : '10.1.0.0/16', peer = d.site === 'BCN' ? '10.0.0.2' : '10.0.0.1', gw = d.ips[0].replace(/\d+$/, function (n) { return +n - 1; });
      r.push('Gateway of last resort is ' + gw + ' to network 0.0.0.0', '', '     10.0.0.0/8 is variably subnetted, 9 subnets, 4 masks');
      if (/RT1$/.test(dev)) r.push('C       10.0.0.0/30 is directly connected, Tunnel0', 'L       ' + d.ips[3] + '/32 is directly connected, Tunnel0');
      r.push('S       ' + oc(dev) + '.0.0/16 [1/0] via ' + d.ips[1].replace(/\d+$/, function (n) { return +n + 1; }), 'C       ' + d.ips[1].replace(/\d+$/, function (n) { return +n - 1; }) + '/30 is directly connected, GigabitEthernet0/0/1', 'L       ' + d.ips[1] + '/32 is directly connected, GigabitEthernet0/0/1',
        'C       ' + d.ips[2].replace(/\d+$/, function (n) { return +n - (+n % 4); }) + '/30 is directly connected, GigabitEthernet0/0/2', 'L       ' + d.ips[2] + '/32 is directly connected, GigabitEthernet0/0/2',
        'O E2    ' + other + ' [110/20] via ' + (/RT1$/.test(dev) ? peer + ', 00:41:12, Tunnel0' : d.ips[2].replace(/\d$/, '1') + ', 00:41:12, GigabitEthernet0/0/2'),
        '     85.0.0.0/8 is variably subnetted, 2 subnets, 2 masks', 'C       ' + gw.replace(/\d+$/, function (n) { return +n - 1; }) + '/30 is directly connected, GigabitEthernet0/0/0', 'L       ' + d.ips[0] + '/32 is directly connected, GigabitEthernet0/0/0', 'S*   0.0.0.0/0 [1/0] via ' + gw);
    }
    return CODES + '\n' + r.join('\n');
  };
  SH['show ip route ospf'] = function (dev) { return SH['show ip route'](dev, null, true).split('\n').filter(function (l) { return !/^[CLS]/.test(l); }).join('\n'); };
  SH['show ip route <ip>'] = function (dev, a) {
    var ip = a[0], d = N.dev[dev];
    if (d.site === 'INET' && N.isPrivate(ip)) return '% Network not in table';
    if (d.site === 'INET') return 'Routing entry for ' + ip.replace(/\.\d+$/, '.0') + '/24\n  Known via "ospf 1", distance 110, metric 2, type intra area\n  Routing Descriptor Blocks:\n  * 200.0.0.2, from 2.2.2.2, via GigabitEthernet0/0/1';
    return 'Routing entry for ' + ip + '\n  Known via "connected", distance 0, metric 0 (connected, via interface)';
  };
  SH['show ipv6 route'] = function (dev) {
    var d = N.dev[dev], r = ['IPv6 Routing Table - ' + (siteVlans(d.site).length * 2 + 1) + ' entries', 'Codes: C - Connected, L - Local, S - Static, R - RIP, B - BGP', '       U - Per-user Static route, M - MIPv6', '       O - OSPF intra, OI - OSPF inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2', ''];
    r.push('S   ::/0 [1/0]', '     via ' + (d.site === 'BCN' ? '2001:DB8:ACAD:1253::1' : '2001:DB8:ACAD:2253::1'));
    siteVlans(d.site).forEach(function (s) { r.push('C   ' + s.v6.toUpperCase() + ' [0/0]', '     via Vlan' + s.vlan + ', directly connected', 'L   ' + s.v6.replace('::/64', '::' + d.svi + '/128').toUpperCase() + ' [0/0]', '     via Vlan' + s.vlan + ', receive'); });
    return r.join('\n');
  };
  SH['show standby brief'] = function (dev) {
    var d = N.dev[dev], r = ['                     P indicates configured to preempt.', '                     |', 'Interface   Grp  Pri P State    Active          Standby         Virtual IP'];
    siteVlans(d.site).forEach(function (s) { var b = s.net.replace(/\.0$/, '.'); var me = d.svi === 2; r.push(pad('Vl' + s.vlan, 12) + pad(s.vlan, 5) + pad(me ? 110 : 100, 4) + 'P ' + pad(me ? 'Active' : 'Standby', 9) + pad(me ? 'local' : b + '2', 16) + pad(me ? b + '3' : 'local', 16) + b + '1'); });
    return r.join('\n');
  };
  SH['show standby'] = SH['show standby brief'];
  SH['show vlan brief'] = function (dev) {
    var d = N.dev[dev], P = PORTS[dev] || {}, r = ['VLAN Name                             Status    Ports', '---- -------------------------------- --------- -------------------------------'];
    var names = { 10: 'Direccio', 20: 'Administracio', 30: 'Magatzem', 40: 'Convidats', 50: 'Servidors', 99: 'Gestio' };
    var by = {}; Object.keys(P).forEach(function (p) { (by[P[p].v] = by[P[p].v] || []).push(p); });
    var free = []; for (var i = 1; i <= 24; i++) if (!P['Fa0/' + i]) free.push('Fa0/' + i);
    var row = function (id, name, ports) { var chunks = []; for (var k = 0; k < ports.length; k += 4) chunks.push(ports.slice(k, k + 4).join(', ')); r.push(pad(id, 5) + pad(name, 33) + pad('active', 10) + (chunks[0] || '')); chunks.slice(1).forEach(function (c) { r.push(pad('', 48) + c); }); };
    row(1, 'default', []);
    siteVlans(d.site).forEach(function (s) { row(s.vlan, names[s.vlan], by[s.vlan] || []); });
    row(998, 'NoUsats', free); row(999, 'Nativa', []);
    ['1002 fddi-default                     active    ', '1003 token-ring-default               active    ', '1004 fddinet-default                  active    ', '1005 trnet-default                    active    '].forEach(function (l) { r.push(l); });
    return r.join('\n');
  };
  SH['show vlan'] = SH['show vlan brief'];
  SH['show interfaces trunk'] = function (dev) {
    var d = N.dev[dev], vl = siteVlans(d.site).map(function (s) { return s.vlan; }).join(','), cut = S.cut && dev === 'BCN-P1-ACC1';
    var ports = cut ? ['Gi0/2'] : ['Gi0/1', 'Gi0/2'];
    var r = ['Port        Mode         Encapsulation  Status        Native vlan'];
    ports.forEach(function (p) { r.push(pad(p, 12) + pad('on', 13) + pad('802.1q', 15) + pad('trunking', 14) + '999'); });
    r.push('', 'Port        Vlans allowed on trunk'); ports.forEach(function (p) { r.push(pad(p, 12) + vl); });
    r.push('', 'Port        Vlans allowed and active in management domain'); ports.forEach(function (p) { r.push(pad(p, 12) + vl); });
    r.push('', 'Port        Vlans in spanning tree forwarding state and not pruned'); ports.forEach(function (p, i) { r.push(pad(p, 12) + (cut || i === 0 ? vl : 'none')); });
    return r.join('\n');
  };
  SH['show interfaces <if> status'] = function (dev, a) {
    var f = C.ifn(a[0]), s = C.ifs(f), st = S.err[dev + ':' + s] ? 'err-disabled' : ((PORTS[dev] || {})[s] ? 'connected' : 'disabled');
    var P = (PORTS[dev] || {})[s];
    return 'Port      Name               Status       Vlan       Duplex  Speed Type\n' + pad(s, 10) + pad('', 19) + pad(st, 13) + pad(P ? P.v : 998, 11) + pad('auto', 8) + pad('auto', 6) + '10/100BaseTX';
  };
  SH['show interfaces status'] = function (dev) {
    var r = ['Port      Name               Status       Vlan       Duplex  Speed Type'];
    for (var i = 1; i <= 24; i++) { var s = 'Fa0/' + i, P = (PORTS[dev] || {})[s]; r.push(pad(s, 10) + pad('', 19) + pad(S.err[dev + ':' + s] ? 'err-disabled' : P ? 'connected' : 'disabled', 13) + pad(P ? P.v : 998, 11) + pad('auto', 8) + pad('auto', 6) + '10/100BaseTX'); }
    r.push(pad('Gi0/1', 10) + pad('', 19) + pad(S.cut && dev === 'BCN-P1-ACC1' ? 'disabled' : 'connected', 13) + pad('trunk', 11) + pad('full', 8) + pad('1000', 6) + '10/100/1000BaseTX', pad('Gi0/2', 10) + pad('', 19) + pad('connected', 13) + pad('trunk', 11) + pad('full', 8) + pad('1000', 6) + '10/100/1000BaseTX');
    return r.join('\n');
  };
  SH['show interfaces <if>'] = function (dev, a) {
    var f = C.ifn(a[0]);
    if (/^Tunnel0$/i.test(f) && /RT1$/.test(dev)) {
      var bcn = N.dev[dev].site === 'BCN';
      return 'Tunnel0 is up, line protocol is up (connected)\n  Hardware is Tunnel\n  Internet address is ' + (bcn ? '10.0.0.1' : '10.0.0.2') + '/30\n  MTU 17916 bytes, BW 100 Kbit/sec, DLY 50000 usec,\n     reliability 255/255, txload 1/255, rxload 1/255\n  Encapsulation TUNNEL, loopback not set\n  Keepalive not set\n  Tunnel source ' + (bcn ? '85.100.1.2' : '85.100.2.2') + ' (GigabitEthernet0/0/0), destination ' + (bcn ? '85.100.2.2' : '85.100.1.2') + '\n  Tunnel protocol/transport GRE/IP\n    Key disabled, sequencing disabled\n    Checksumming of packets disabled\n  Tunnel TTL 255\n  Fast tunneling enabled\n  Tunnel transport MTU 1476 bytes\n  Tunnel transmit bandwidth 8000 (kbps)\n  Tunnel receive bandwidth 8000 (kbps)\n  Last input never, output never, output hang never\n  Last clearing of "show interface" counters never\n  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0\n  Queueing strategy: fifo\n  Output queue: 0/0 (size/max)\n  5 minute input rate 32 bits/sec, 0 packets/sec\n  5 minute output rate 32 bits/sec, 0 packets/sec\n     ' + S.ipsec.dec + ' packets input, 11024 bytes, 0 no buffer\n     ' + S.ipsec.enc + ' packets output, 11288 bytes, 0 underruns';
    }
    var s = C.ifs(f), down = S.err[dev + ':' + s];
    return f + ' is ' + (down ? 'down, line protocol is down (err-disabled)' : 'up, line protocol is up (connected)') + '\n  Hardware is Lance, address is ' + bridgeMac(dev + s) + '\n  BW 100000 Kbit, DLY 1000 usec,\n     reliability 255/255, txload 1/255, rxload 1/255\n  Encapsulation ARPA, loopback not set\n  Full-duplex, 100Mb/s';
  };
  SH['show vtp status'] = function (dev) {
    return 'VTP Version capable             : 1 to 2\nVTP version running             : 2\nVTP Domain Name                 : LOGITRANS\nVTP Pruning Mode                : Disabled\nVTP Traps Generation            : Disabled\nDevice ID                       : ' + bridgeMac(dev) + '\nConfiguration last modified by 0.0.0.0 at 3-1-93 00:00:00\n\nFeature VLAN :\n--------------\nVTP Operating Mode                : Transparent\nMaximum VLANs supported locally   : 255\nNumber of existing VLANs          : ' + (siteVlans(N.dev[dev].site).length + 7) + '\nConfiguration Revision            : 0\nMD5 digest                        : 0x2B 0x8A 0x41 0x7C 0x9D 0x02 0xE3 0x55\n                                    0x6F 0x10 0xB2 0x4E 0xA7 0x19 0x3C 0xD8';
  };
  SH['show spanning-tree vlan <n>'] = function (dev, a) {
    var v = +a[0] || 20, d = N.dev[dev], prio = 24576 + v, rootMac = bridgeMac(d.site + '-CORE1');
    var r = ['VLAN' + ('000' + v).slice(-4), '  Spanning tree enabled protocol rstp', '  Root ID    Priority    ' + prio, '             Address     ' + rootMac];
    if (d.type === 'l3' && d.svi === 2) {
      r.push('             This bridge is the root', '             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec', '', '  Bridge ID  Priority    ' + prio + '  (priority 24576 sys-id-ext ' + v + ')', '             Address     ' + rootMac, '             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec', '             Aging Time  20', '', 'Interface        Role Sts Cost      Prio.Nbr Type', '---------------- ---- --- --------- -------- --------------------------------');
      ['Gi1/0/2', 'Gi1/0/3', 'Gi1/0/4', 'Gi1/0/5'].forEach(function (p, i) { if (S.cut && i === 1 && dev === 'BCN-CORE1') return; r.push(pad(p, 17) + 'Desg FWD 4         128.' + (i + 2) + '    P2p'); });
      r.push(pad('Po1', 17) + 'Desg FWD 3         128.27   Shr');
      return r.join('\n');
    }
    var cut = S.cut && dev === 'BCN-P1-ACC1';
    r.push('             Cost        ' + (cut ? 7 : 4), '             Port        ' + (cut ? '26(GigabitEthernet0/2)' : '25(GigabitEthernet0/1)'), '             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec', '', '  Bridge ID  Priority    ' + (32768 + v) + '  (priority 32768 sys-id-ext ' + v + ')', '             Address     ' + bridgeMac(dev), '             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec', '             Aging Time  20', '', 'Interface        Role Sts Cost      Prio.Nbr Type', '---------------- ---- --- --------- -------- --------------------------------');
    var P = PORTS[dev] || {};
    Object.keys(P).forEach(function (p) { if (P[p].v === v && !S.err[dev + ':' + p]) r.push(pad(p, 17) + 'Desg FWD 19        128.' + p.split('/')[1] + '    P2p'); });
    if (!cut) r.push(pad('Gi0/1', 17) + 'Root FWD 4         128.25   P2p');
    r.push(pad('Gi0/2', 17) + (cut ? 'Root FWD 4         128.26   P2p' : 'Altn BLK 4         128.26   P2p'));
    return r.join('\n');
  };
  SH['show spanning-tree'] = function (dev) { return SH['show spanning-tree vlan <n>'](dev, [N.dev[dev].site === 'ZGZ' ? 30 : 20]); };
  SH['show spanning-tree interface <if> detail'] = function (dev, a) {
    var s = C.ifs(C.ifn(a[0])), n = s.split('/')[1], P = (PORTS[dev] || {})[s] || { v: 20 };
    if (S.err[dev + ':' + s]) return 'no spanning tree info available for ' + C.ifn(a[0]);
    return ' Port ' + n + ' (' + C.ifn(a[0]) + ') of VLAN' + ('000' + P.v).slice(-4) + ' is designated forwarding\n   Port path cost 19, Port priority 128, Port Identifier 128.' + n + '.\n   Designated root has priority ' + (24576 + P.v) + ', address ' + bridgeMac(N.dev[dev].site + '-CORE1') + '\n   Designated bridge has priority ' + (32768 + P.v) + ', address ' + bridgeMac(dev) + '\n   Designated port id is 128.' + n + ', designated path cost 4\n   Timers: message age 0, forward delay 0, hold 0\n   Number of transitions to forwarding state: 1\n   Link type is point-to-point by default\n   The port is in the portfast mode\n   BPDU: sent 1243, received 0';
  };
  SH['show etherchannel summary'] = function () {
    return 'Flags:  D - down        P - in port-channel\n        I - stand-alone s - suspended\n        H - Hot-standby (LACP only)\n        R - Layer3      S - Layer2\n        U - in use      f - failed to allocate aggregator\n        u - unsuitable for bundling\n        w - waiting to be aggregated\n        d - default port\n\n\nNumber of channel-groups in use: 1\nNumber of aggregators:           1\n\nGroup  Port-channel  Protocol    Ports\n------+-------------+-----------+----------------------------------------------\n\n1      Po1(SU)           LACP   Gig1/0/23(P) Gig1/0/24(P) ';
  };
  SH['show cdp neighbors'] = function (dev) {
    var d = N.dev[dev], r = ['Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge', '                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone', 'Device ID    Local Intrfce   Holdtme    Capability   Platform    Port ID'];
    var row = function (id, li, cap, pl, pid) { r.push(pad(id, 13) + pad(li, 16) + pad(Math.floor(120 + Math.random() * 50), 11) + pad(cap, 13) + pad(pl, 12) + pid); };
    N.links.forEach(function (l) {
      if (l.a !== dev && l.b !== dev) return;
      var me = l.a === dev ? l.ai : l.bi, ot = l.a === dev ? l.b : l.a, oi = l.a === dev ? l.bi : l.ai, od = N.dev[ot];
      if (!od || ['pc', 'srv', 'prn'].indexOf(od.type) >= 0) return;
      var sh = function (x) { return x.replace('GigabitEthernet', 'Gig ').replace('FastEthernet', 'Fas ').replace(/^Gi/, 'Gig ').replace(/^Fa/, 'Fas '); };
      if (me === 'Po1') { row(ot, 'Gig 1/0/23', 'S', '3650', 'Gig 1/0/23'); row(ot, 'Gig 1/0/24', 'S', '3650', 'Gig 1/0/24'); return; }
      row(ot, sh(me), od.type === 'sw' || od.type === 'l3' ? 'S' : od.type === 'ap' ? 'T' : 'R', od.type === 'sw' ? '2960' : od.type === 'l3' ? '3650' : od.type === 'fw' ? 'ASA5506' : od.type === 'ap' ? 'AccessPoint' : 'ISR4300', sh(oi));
    });
    return r.join('\n');
  };
  SH['show port-security'] = function (dev) {
    var P = PORTS[dev] || {}, r = ['Secure Port MaxSecureAddr CurrentAddr SecurityViolation Security Action', '               (Count)       (Count)        (Count)', '--------------------------------------------------------------------'];
    Object.keys(P).forEach(function (p) { var v = S.viol[dev + ':' + p]; r.push(lpad(p, 13) + lpad(P[p].max, 10) + lpad(P[p].macs.length, 11) + lpad(v ? v.count : 0, 18) + lpad(P[p].act || 'Shutdown', 17)); });
    r.push('----------------------------------------------------------------------');
    return r.join('\n');
  };
  SH['show port-security interface <if>'] = function (dev, a) {
    var s = C.ifs(C.ifn(a[0])), P = (PORTS[dev] || {})[s];
    if (!P) return 'Port Security              : Disabled\nPort Status                : Secure-down';
    var v = S.viol[dev + ':' + s], err = S.err[dev + ':' + s];
    var last = v ? v.mac : P.macs[P.macs.length - 1];
    return 'Port Security              : Enabled\nPort Status                : ' + (err ? 'Secure-shutdown' : 'Secure-up') + '\nViolation Mode             : ' + (P.act || 'Shutdown') + '\nAging Time                 : 0 mins\nAging Type                 : Absolute\nSecureStatic Address Aging : Disabled\nMaximum MAC Addresses      : ' + P.max + '\nTotal MAC Addresses        : ' + P.macs.length + '\nConfigured MAC Addresses   : 0\nSticky MAC Addresses       : ' + P.macs.length + '\nLast Source Address:Vlan   : ' + last + ':' + P.v + '\nSecurity Violation Count   : ' + (v ? v.count : 0);
  };
  SH['show port-security address'] = function (dev) {
    var P = PORTS[dev] || {}, r = ['               Secure Mac Address Table', '-----------------------------------------------------------------------------', 'Vlan    Mac Address       Type                          Ports   Remaining Age', '                                                                   (mins)', '----    -----------       ----                          -----   -------------'];
    Object.keys(P).forEach(function (p) { P[p].macs.forEach(function (m) { r.push(pad(P[p].v, 8) + pad(m, 18) + pad('SecureSticky', 30) + pad(p, 8) + '-'); }); });
    return r.join('\n');
  };
  SH['show ip dhcp snooping'] = function (dev) {
    var d = N.dev[dev], P = PORTS[dev] || {}, r = ['Switch DHCP snooping is enabled', 'DHCP snooping is configured on following VLANs:', siteVlans(d.site).map(function (s) { return s.vlan; }).filter(function (v) { return v !== 50; }).join(','), 'Insertion of option 82 is disabled', 'Option 82 on untrusted port is not allowed', 'Verification of hwaddr field is enabled', 'Interface                  Trusted    Rate limit (pps)', '-----------------------    -------    ----------------'];
    r.push(pad('GigabitEthernet0/1', 27) + pad('yes', 11) + 'unlimited', pad('GigabitEthernet0/2', 27) + pad('yes', 11) + 'unlimited');
    Object.keys(P).forEach(function (p) { r.push(pad(C.ifn(p), 27) + pad('no', 11) + '10'); });
    return r.join('\n');
  };
  SH['show ip dhcp snooping binding'] = function (dev) {
    var P = PORTS[dev] || {}, r = ['MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface', '------------------  ---------------  ----------  -------------  ----  --------------------'], n = 0;
    Object.keys(P).forEach(function (p) {
      var dd = P[p].dev && N.dev[P[p].dev]; if (!dd || !dd.ip || dd.type === 'prn') return;
      if (P[p].dev === 'P1-ADM-03' && !S.dhcpOk['P1-ADM-03']) return;
      if (S.err[dev + ':' + p]) return;
      r.push(pad(macColon(dd.mac), 20) + pad(dd.ip, 17) + pad(86400 - Math.floor(Math.random() * 900), 12) + pad('dhcp-snooping', 15) + pad(dd.vlan, 6) + C.ifn(p)); n++;
    });
    if (dev === 'BCN-P0-ACC1') { r.push(pad('00:60:2F:84:71:A3', 20) + pad('10.1.40.11', 17) + pad('86012', 12) + pad('dhcp-snooping', 15) + pad(40, 6) + 'FastEthernet0/1'); n++; }
    r.push('Total number of bindings: ' + n);
    return r.join('\n');
  };
  SH['show crypto isakmp sa'] = function (dev) {
    var bcn = N.dev[dev].site === 'BCN';
    return 'IPv4 Crypto ISAKMP SA\ndst             src             state          conn-id slot status\n' + (S.vpnUp ? pad(bcn ? '85.100.2.2' : '85.100.1.2', 16) + pad(bcn ? '85.100.1.2' : '85.100.2.2', 16) + pad('QM_IDLE', 18) + '1007    0 ACTIVE\n' : '') + '\nIPv6 Crypto ISAKMP SA\n';
  };
  SH['show crypto ipsec sa'] = function (dev) {
    var bcn = N.dev[dev].site === 'BCN', me = bcn ? '85.100.1.2' : '85.100.2.2', peer = bcn ? '85.100.2.2' : '85.100.1.2';
    var e = bcn ? S.ipsec.enc : S.ipsec.dec, d = bcn ? S.ipsec.dec : S.ipsec.enc;
    if (!S.vpnUp) e = d = 0;
    var spi = function (s) { return N.hex(s + (S.vpnUp ? '' : 'x')).toUpperCase().replace('0X', '0x'); };
    return 'interface: GigabitEthernet0/0/0\n    Crypto map tag: CMAP-VPN, local addr ' + me + '\n\n   protected vrf: (none)\n   local  ident (addr/mask/prot/port): (' + me + '/255.255.255.255/47/0)\n   remote ident (addr/mask/prot/port): (' + peer + '/255.255.255.255/47/0)\n   current_peer ' + peer + ' port 500\n    PERMIT, flags={origin_is_acl,}\n   #pkts encaps: ' + e + ', #pkts encrypt: ' + e + ', #pkts digest: ' + e + '\n   #pkts decaps: ' + d + ', #pkts decrypt: ' + d + ', #pkts verify: ' + d + '\n   #pkts compressed: 0, #pkts decompressed: 0\n   #pkts not compressed: 0, #pkts compr. failed: 0\n   #pkts not decompressed: 0, #pkts decompress failed: 0\n   #send errors 1, #recv errors 0\n\n     local crypto endpt.: ' + me + ', remote crypto endpt.:' + peer + '\n     path mtu 1500, ip mtu 1500, ip mtu idb GigabitEthernet0/0/0\n     current outbound spi: ' + (S.vpnUp ? spi('out' + dev) : '0x0(0)') + '\n' +
      (S.vpnUp ? '\n     inbound esp sas:\n      spi: ' + spi('in' + dev) + '\n        transform: esp-aes 256 esp-sha-hmac ,\n        in use settings ={Tunnel, }\n        conn id: 2004, flow_id: FPGA:1, crypto map: CMAP-VPN\n        sa timing: remaining key lifetime (k/sec): (4525504/3418)\n        IV size: 16 bytes\n        replay detection support: N\n        Status: ACTIVE\n\n     inbound ah sas:\n\n     inbound pcp sas:\n\n     outbound esp sas:\n      spi: ' + spi('out' + dev) + '\n        transform: esp-aes 256 esp-sha-hmac ,\n        in use settings ={Tunnel, }\n        conn id: 2005, flow_id: FPGA:1, crypto map: CMAP-VPN\n        sa timing: remaining key lifetime (k/sec): (4525504/3418)\n        IV size: 16 bytes\n        replay detection support: N\n        Status: ACTIVE\n\n     outbound ah sas:\n\n     outbound pcp sas:' : '\n     inbound esp sas:\n\n     outbound esp sas:');
  };
  SH['show crypto map'] = function (dev) {
    var bcn = N.dev[dev].site === 'BCN', me = bcn ? '85.100.1.2' : '85.100.2.2', peer = bcn ? '85.100.2.2' : '85.100.1.2';
    return 'Crypto Map CMAP-VPN 10 ipsec-isakmp\n        Peer = ' + peer + '\n        Extended IP access list VPN-GRE\n            access-list VPN-GRE permit gre host ' + me + ' host ' + peer + '\n        Current peer: ' + peer + '\n        Security association lifetime: 4608000 kilobytes/3600 seconds\n        PFS (Y/N): N\n        Transform sets={\n                TS-LOGITRANS,\n        }\n        Interfaces using crypto map CMAP-VPN:\n                GigabitEthernet0/0/0';
  };
  SH['show ip ospf neighbor'] = function (dev, a, v6) {
    var d = N.dev[dev], r = [v6 ? 'Neighbor ID     Pri   State           Dead Time   Interface ID    Interface' : 'Neighbor ID     Pri   State           Dead Time   Address         Interface'];
    var nb = [];
    if (dev === 'ISP-1') nb = [['2.2.2.2', '200.0.0.2', 'GigabitEthernet0/0/1', 'BDR'], ['3.3.3.3', '200.0.0.6', 'GigabitEthernet0/0/2', 'BDR']];
    else if (dev === 'ISP-2') nb = [['1.1.1.1', '200.0.0.1', 'GigabitEthernet0/0/1', 'DR'], ['4.4.4.4', '200.0.0.10', 'GigabitEthernet0/0/3', 'BDR']];
    else if (dev === 'ISP-3') nb = [['1.1.1.1', '200.0.0.5', 'GigabitEthernet0/0/2', 'DR'], ['4.4.4.4', '200.0.0.14', 'GigabitEthernet0/0/1', 'BDR']];
    else if (dev === 'ISP-4') nb = [['2.2.2.2', '200.0.0.9', 'GigabitEthernet0/0/3', 'DR'], ['3.3.3.3', '200.0.0.13', 'GigabitEthernet0/0/1', 'DR']];
    else if (d.type === 'rt') {
      var other = d.site === 'BCN' ? '10.255.2.1' : '10.255.1.1', mate = d.rid.replace(/\d$/, function (x) { return x === '1' ? '2' : '1'; });
      if (/RT1$/.test(dev) && !v6) nb.push([other, d.site === 'BCN' ? '10.0.0.2' : '10.0.0.1', 'Tunnel0', '-']);
      nb.push([mate, d.ips[2].replace(/\d$/, function (x) { return x === '1' ? '2' : '1'; }), 'GigabitEthernet0/0/2', /RT1$/.test(dev) ? 'BDR' : 'DR']);
    }
    nb.forEach(function (n) { r.push(pad(n[0], 16) + lpad(n[3] === '-' ? 0 : 1, 3) + '   ' + pad('FULL/' + (n[3] === '-' ? '  -' : n[3]), 16) + pad('00:00:3' + Math.floor(Math.random() * 9), 12) + pad(v6 ? (n[2] === 'Tunnel0' ? 9 : 2) : n[1], 16) + n[2]); });
    return r.join('\n');
  };
  SH['show ipv6 ospf neighbor'] = function (dev) { return SH['show ip ospf neighbor'](dev, null, true); };
  SH['show ip ospf interface <if>'] = function (dev, a) {
    var f = C.ifn(a[0]), d = N.dev[dev], ip = f === 'GigabitEthernet0/0/1' ? d.ips[1] : f === 'GigabitEthernet0/0/2' ? d.ips[2] : d.ips[0];
    return f + ' is up, line protocol is up\n  Internet address is ' + ip + '/30, Area 0\n  Process ID 1, Router ID ' + d.rid + ', Network Type BROADCAST, Cost: 1\n  Transmit Delay is 1 sec, State DR, Priority 1\n  Designated Router (ID) ' + d.rid + ', Interface address ' + ip + '\n  Backup Designated Router (ID) 2.2.2.2, Interface address 200.0.0.2\n  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5\n    Hello due in 00:00:04\n  Index 1/1, flood queue length 0\n  Next 0x0(0)/0x0(0)\n  Last flood scan length is 1, maximum is 1\n  Last flood scan time is 0 msec, maximum is 0 msec\n  Neighbor Count is 1, Adjacent neighbor count is 1\n    Adjacent with neighbor 2.2.2.2  (Backup Designated Router)\n  Suppress hello for 0 neighbor(s)\n  Message digest authentication enabled\n    Youngest key id is 1';
  };
  SH['show ipv6 ospf interface <if>'] = function (dev, a) {
    var f = C.ifn(a[0]), d = N.dev[dev];
    return f + ' is up, line protocol is up\n  Link Local Address FE80::1, Interface ID 2\n  Area 0, Process ID 1, Instance ID 0, Router ID ' + d.rid + '\n  Network Type BROADCAST, Cost: 1\n  Transmit Delay is 1 sec, State DR, Priority 1\n  Designated Router (ID) ' + d.rid + ', local address FE80::1\n  Backup Designated router (ID) 2.2.2.2, local address FE80::2\n  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5\n    Hello due in 00:00:06\n  Index 1/1/1, flood queue length 0\n  Next 0x0(0)/0x0(0)/0x0(0)\n  Last flood scan length is 1, maximum is 1\n  Last flood scan time is 0 msec, maximum is 0 msec\n  Neighbor Count is 1, Adjacent neighbor count is 1\n    Adjacent with neighbor 2.2.2.2  (Backup Designated Router)\n  Suppress hello for 0 neighbor(s)';
  };
  function natExpire() { var now = Date.now(); S.nat.dyn = S.nat.dyn.filter(function (x) { if (now - x.t > 60000) { S.nat.expired++; return false; } return true; }); }
  SH['show ip nat translations'] = function (dev) {
    natExpire();
    var r = ['Pro  Inside global     Inside local       Outside local      Outside global'];
    if (dev === 'BCN-RT1') {
      if (S.webConn) r.push(pad('tcp', 5) + pad('85.100.1.18:80', 18) + pad('10.1.50.12:80', 19) + pad('203.0.113.10:1025', 19) + '203.0.113.10:1025');
      r.push(pad('---', 5) + pad('85.100.1.18', 18) + pad('10.1.50.12', 19) + pad('---', 19) + '---');
      S.nat.dyn.forEach(function (x) { r.push(pad(x.p, 5) + pad(x.out + ':' + x.id, 18) + pad(x.ins + ':' + x.id, 19) + pad(x.dst + ':' + x.id, 19) + x.dst + ':' + x.id); });
    }
    return r.join('\n');
  };
  SH['show ip nat statistics'] = function (dev) {
    natExpire();
    var st = dev === 'BCN-RT1' ? 1 : 0, dy = dev === 'BCN-RT1' ? S.nat.dyn.length + (S.webConn ? 1 : 0) : 0;
    return 'Total translations: ' + (st + dy) + ' (' + st + ' static, ' + dy + ' dynamic, ' + dy + ' extended)\nOutside Interfaces: GigabitEthernet0/0/0\nInside Interfaces: GigabitEthernet0/0/1\nHits: ' + (dev === 'BCN-RT1' ? S.nat.hits : 0) + '  Misses: 0\nExpired translations: ' + (dev === 'BCN-RT1' ? S.nat.expired : 0) + '\nDynamic mappings:\n-- Inside Source\naccess-list 1 interface GigabitEthernet0/0/0 refCount ' + dy;
  };
  SH['show ip ssh'] = function () { return 'SSH Enabled - version 2.0\nAuthentication timeout: 120 secs; Authentication retries: 3'; };
  SH['show access-lists'] = function (dev, a) {
    var all = N.acl[dev] || {}, r = [];
    Object.keys(all).forEach(function (k) {
      var A = all[k]; if (a && a[0] && A.name.toLowerCase() !== a[0].toLowerCase()) return;
      if (A.kind === 'v6') { r.push('IPv6 access list ' + A.name); A.l.forEach(function (x) { r.push('    ' + x.t + (x.h ? ' (' + x.h + ' match(es))' : '') + ' sequence ' + x.s); }); }
      else { r.push((A.kind === 'std' ? 'Standard' : 'Extended') + ' IP access list ' + A.name); A.l.forEach(function (x) { r.push('    ' + x.s + ' ' + x.t + (x.h ? ' (' + x.h + ' match(es))' : '')); }); }
    });
    return r.join('\n');
  };
  SH['show access-lists <w>'] = SH['show access-lists'];
  SH['show mac address-table'] = function (dev) {
    var P = PORTS[dev] || {}, r = ['          Mac Address Table', '-------------------------------------------', '', 'Vlan    Mac Address       Type        Ports', '----    -----------       --------    -----'];
    Object.keys(P).forEach(function (p) { if (S.err[dev + ':' + p]) return; P[p].macs.forEach(function (m) { r.push(pad('  ' + P[p].v, 8) + pad(m.toLowerCase(), 18) + pad('STATIC', 12) + p); }); });
    r.push(pad('  20', 8) + pad(bridgeMac(N.dev[dev].site + '-CORE1').toLowerCase(), 18) + pad('DYNAMIC', 12) + (S.cut && dev === 'BCN-P1-ACC1' ? 'Gi0/2' : 'Gi0/1'));
    return r.join('\n');
  };
  SH['show version'] = function (dev) {
    var d = N.dev[dev];
    return 'Cisco IOS XE Software, Version 16.06.04\nCisco IOS Software [Everest], ' + (d.type === 'rt' ? 'ISR' : 'Catalyst L3 Switch') + ' Software, Version 16.6.4, RELEASE SOFTWARE (fc3)\n\n' + dev + ' uptime is 3 days, 4 hours, 12 minutes\nSystem image file is "flash:packages.conf"\n\ncisco ' + (d.model || '') + ' processor with 1795979K/6147K bytes of memory.\nProcessor board ID FDO21520TGH\n\nConfiguration register is 0x2102';
  };
  SH['show clock'] = function () { var d = new Date(); return '*' + d.toTimeString().slice(0, 8) + '.' + ('00' + d.getMilliseconds()).slice(-3) + ' UTC ' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear(); };
  SH['show users'] = function (dev) { return '    Line       User       Host(s)              Idle       Location\n*  0 con 0                idle                 00:00:00 '; };
  SH['show logging'] = function (dev) { var l = (S.logs && S.logs[dev]) || []; return 'Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)\n    Console logging: level debugging, ' + l.length + ' messages logged\n\n' + l.join('\n'); };
  SH['show running-config'] = function (dev) { return C.running(dev); };
  SH['show startup-config'] = function (dev) { return C.running(dev).replace('Building configuration...\n\n', 'Using 4213 bytes\n'); };
  SH['show running-config interface <if>'] = function (dev, a) { return C.runningIf(dev, C.ifn(a[0])); };

  /* ASA */
  var SA = C.asa = {};
  SA['show access-list'] = function (dev, a) {
    var all = N.acl[dev], r = ['access-list cached ACL log flows: total 0, denied 0 (deny-flow-max 4096)', '            alert-interval 300'];
    ['OUTSIDE_IN', 'INSIDE_OUT'].forEach(function (k) {
      if (a && a[0] && a[0].toUpperCase() !== k) return;
      var A = all[k];
      r.push('access-list ' + k + '; ' + A.l.length + ' elements; name hash: ' + N.hex(dev + k));
      A.l.forEach(function (x) { r.push('access-list ' + k + ' line ' + x.s + ' ' + x.t + ' (hitcnt=' + x.h + ') ' + N.hex(dev + k + x.s)); });
    });
    return r.join('\n');
  };
  SA['show access-list <w>'] = SA['show access-list'];
  SA['show running-config access-group'] = function () { return 'access-group OUTSIDE_IN in interface outside\naccess-group INSIDE_OUT in interface inside'; };
  SA['show nameif'] = function () { return 'Interface                Name                     Security\nGigabitEthernet1/2       outside                    0\nGigabitEthernet1/3       wanbak                     0\nGigabitEthernet1/4       inside                   100\nGigabitEthernet1/5       corebak                  100'; };
  SA['show interface ip brief'] = function (dev) {
    var d = N.dev[dev], n = ['outside', 'wanbak', 'inside', 'corebak'];
    return 'Interface                  IP-Address      OK? Method Status                Protocol\n' + d.ips.map(function (ip, i) { return pad('GigabitEthernet1/' + (i + 2), 27) + pad(ip, 16) + 'YES CONFIG up                    up'; }).join('\n');
  };
  SA['show route'] = function (dev) { var o = oc(dev); return 'Gateway of last resort is ' + o + '.254.1 to network 0.0.0.0\n\nS*       0.0.0.0 0.0.0.0 [1/0] via ' + o + '.254.1, outside\nS        ' + o + '.0.0 255.255.0.0 [1/0] via ' + o + '.253.2, inside\nC        ' + o + '.253.0 255.255.255.252 is directly connected, inside\nC        ' + o + '.254.0 255.255.255.252 is directly connected, outside'; };
  SA['show xlate'] = function () { return '0 in use, 0 most used'; };
  SA['show conn'] = function () { return (S.webConn ? 1 : 0) + ' in use, 3 most used' + (S.webConn ? '\nTCP outside 203.0.113.10:1025 inside 10.1.50.12:80, idle 0:00:04, bytes 1832, flags UIO' : ''); };
  SA['show running-config'] = function (dev) { return ': Saved\n:\nASA Version 9.8(2)\n!\nhostname ' + dev + '\nnames\n!\ninterface GigabitEthernet1/2\n nameif outside\n security-level 0\n!\ninterface GigabitEthernet1/4\n nameif inside\n security-level 100\n!\n' + SA['show access-list'](dev).split('\n').filter(function (l) { return / line /.test(l); }).map(function (l) { return l.replace(/ line \d+/, '').replace(/ \(hitcnt=\d+\) 0x\w+$/, ''); }).join('\n') + '\n!\n' + SA['show running-config access-group']() + '\n: end'; };
  SA['show version'] = function (dev) { return 'Cisco Adaptive Security Appliance Software Version 9.8(2)\n\n' + dev + ' up 3 days 4 hours\n\nHardware:   ASA5506, 4096 MB RAM'; };

  /* ---------- Sesión IOS / ASA ---------- */
  C.ios = function (dev, o) {
    o = o || {};
    var d = N.dev[dev], kind = d.type === 'fw' ? 'asa' : 'ios', mode = o.priv ? 'priv' : 'user', ifc = null;
    var hist = [];
    var sess = {
      dev: dev, kind: kind,
      prompt: function () { return dev + (mode === 'user' ? '>' : mode === 'priv' ? '#' : mode === 'conf' ? '(config)#' : '(config-if)#'); },
      banner: function () { return [out('\n' + dev + ' · ' + (d.model || '') + '\n\nPress RETURN to get started.\n', { c: 't-dim' })]; },
      exec: function (line) {
        line = line.replace(/\s+$/, '');
        if (!line.trim()) return [];
        hist.push(line);
        if (/^\s*\?$/.test(line) || /^help$/i.test(line.trim())) return [out(help(), { c: 't-dim' })];
        var p = C.parse(line, kind);
        if (mode.indexOf('conf') === 0 && p && p.c === 'do <rest>') { var m0 = mode; mode = 'priv'; var r0 = sess.exec(p.args[0]); mode = m0; return r0; }
        if (!p) return [out(invalid(line), { c: 't-err' })];
        return run(p, line);
      },
      history: function () { return hist; }
    };
    function invalid(line) { var w = line.trim().split(/\s+/); var col = sess.prompt().length + line.indexOf(w[Math.min(w.length - 1, 1)] || w[0]); return pad('', col) + '^\n% Invalid input detected at \'^\' marker.'; }
    function help() {
      if (mode === 'user') return 'Exec commands:\n  enable     Turn on privileged commands\n  exit       Exit from the EXEC\n  ping       Send echo messages\n  show       Show running system information\n  traceroute Trace route to destination';
      if (mode === 'priv') return 'Exec commands:\n  clear      Reset functions\n  configure  Enter configuration mode\n  copy       Copy from one file to another\n  disable    Turn off privileged commands\n  exit       Exit from the EXEC\n  ping       Send echo messages\n  show       Show running system information\n  traceroute Trace route to destination\n  write      Write running configuration to memory\n\nPrueba: show running-config, show ip interface brief, show access-lists, show ip route...';
      return 'Configure commands:\n  do         To run exec commands in config mode\n  end        Exit from configure mode\n  exit       Exit from configure mode\n  interface  Select an interface to configure\n  shutdown   Shutdown the selected interface\n  no         Negate a command or set its defaults';
    }
    function run(p, line) {
      var c = p.c, a = p.args, conf = mode.indexOf('conf') === 0;
      if (c === 'enable') { if (mode === 'user') mode = 'priv'; return []; }
      if (c === 'disable') { mode = 'user'; return []; }
      if (c === 'exit' || c === 'logout') { if (mode === 'conf-if') { mode = 'conf'; return []; } if (mode === 'conf') { mode = 'priv'; return []; } return [out('', { exit: true })]; }
      if (c === 'end') { if (conf) { mode = 'priv'; return [out('%SYS-5-CONFIG_I: Configured from console by console', { c: 't-dim' })]; } return [out(invalid(line), { c: 't-err' })]; }
      if (c === 'configure terminal') { if (mode !== 'priv') return [out(invalid(line), { c: 't-err' })]; mode = 'conf'; return [out('Enter configuration commands, one per line.  End with CNTL/Z.')]; }
      if (c === 'interface <if>') { if (!conf) return [out(invalid(line), { c: 't-err' })]; ifc = C.ifn(a[0]); mode = 'conf-if'; return []; }
      if (c === 'shutdown' || c === 'no shutdown') { if (mode !== 'conf-if') return [out(invalid(line), { c: 't-err' })]; return shut(c === 'shutdown'); }
      if (c === 'ipv6 ospf authentication <rest>') {
        if (mode !== 'conf-if') return [out(invalid(line), { c: 't-err' })];
        var col = sess.prompt().length + line.indexOf('authentication');
        return [out(pad('', col) + '^\n% Invalid input detected at \'^\' marker.', { c: 't-err' })];
      }
      if (conf) return [out(invalid(line), { c: 't-err' })];
      if (c === 'write memory' || c === 'copy running-config startup-config') return [out('Building configuration...\n[OK]')];
      if (c === 'clear crypto sa' || c === 'clear crypto isakmp') { if (mode !== 'priv') return [out(invalid(line), { c: 't-err' })]; S.vpnUp = false; LT.emit('net', {}); return [out('%CRYPTO-6-ISAKMP_ON_OFF: ISAKMP is OFF', { c: 't-dim' })]; }
      if (c === 'clear ip nat translation *') { S.nat.dyn = []; S.webConn = false; return []; }
      if (c === 'clear access-list counters') { Object.keys(N.acl[dev]).forEach(function (k) { N.acl[dev][k].l.forEach(function (x) { x.h = 0; }); }); return []; }
      if (c === 'errdisable recovery cause all') return [];
      if (c === 'clear port-security sticky') return [];
      if (c === 'ping <ip>' || c === 'ping ipv6 <ip>') return C.routerPing(dev, a[0]);
      if (c === 'traceroute <ip>') return C.routerTrace(dev, a[0]);
      if (c === 'show history') return [out(hist.slice(-10).map(function (h) { return '  ' + h; }).join('\n'))];
      var tbl = kind === 'asa' ? SA : SH, fn = tbl[c];
      if (!fn) return [out(invalid(line), { c: 't-err' })];
      if (/running-config|startup-config/.test(c) && mode === 'user') return [out(invalid(line), { c: 't-err' })];
      var applicable = true;
      if (/^show (crypto|ip nat|ip ospf|ipv6 ospf|ip ssh|interfaces <if>$)/.test(c) && d.type !== 'rt' && c !== 'show interfaces <if>') applicable = false;
      if (/^show (standby|etherchannel|ipv6 route|ipv6 interface)/.test(c) && d.type !== 'l3' && !(c === 'show ipv6 interface brief' && d.type === 'rt')) applicable = false;
      if (/^show (port-security|ip dhcp snooping|vlan|interfaces trunk|vtp|interfaces status|interfaces <if> status|mac address)/.test(c) && d.type !== 'sw') applicable = false;
      if (c === 'show access-lists' || c === 'show access-lists <w>') applicable = d.type === 'l3';
      if (!applicable) return [out(invalid(line), { c: 't-err' })];
      var txt = fn(dev, a);
      txt = C.filter(txt, p.pipe);
      return [out(txt)];
    }
    function shut(down) {
      var s = C.ifs(ifc), key = dev + ':' + s, r = [];
      if (dev === 'BCN-P1-ACC1' && s === 'Gi0/1') {
        S.cut = down; LT.emit('net', { cut: down });
        if (down) r.push(out('%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down\n%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down', { c: 't-sys' }));
        else r.push(out('%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up', { c: 't-sys' }));
        return r;
      }
      if (!down && S.err[key]) {
        delete S.err[key]; delete S.viol[key];
        if (dev === 'BCN-P1-ACC1' && s === 'Fa0/3') { S.intruder = false; S.rogueSw = false; }
        if (dev === 'BCN-P0-ACC1' && s === 'Fa0/6') { S.p0new = false; }
        LT.emit('net', {});
        return [out('%LINK-5-CHANGED: Interface ' + ifc + ', changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ' + ifc + ', changed state to up', { c: 't-sys' })];
      }
      if (down) return [out('%LINK-5-CHANGED: Interface ' + ifc + ', changed state to administratively down', { c: 't-sys' })];
      return [];
    }
    return sess;
  };

  /* Ping y traceroute desde un router o switch */
  C.routerPing = function (dev, ip) {
    var d = N.dev[dev], ok;
    if (d.site === 'INET') ok = !N.isPrivate(ip) && (!!N.find(ip) || ip === '85.100.1.18');
    else ok = !!N.find(ip);
    var res = ok ? '!!!!!' : '.....';
    return [out('Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ' + ip + ', timeout is 2 seconds:'), out(res, { wait: ok ? 500 : 2500 }),
      out(ok ? 'Success rate is 100 percent (5/5), round-trip min/avg/max = 0/1/' + (2 + Math.floor(Math.random() * 6)) + ' ms' : 'Success rate is 0 percent (0/5)')];
  };
  C.routerTrace = function (dev, ip) {
    return [out('Type escape sequence to abort.\nTracing the route to ' + ip + '\n\n  1   ' + (N.dev[dev].ips ? N.dev[dev].ips[0].replace(/\d+$/, function (x) { return +x - 1; }) : '10.1.253.1') + '   0 msec    0 msec    1 msec\n  2   ' + ip + '   1 msec    0 msec    0 msec')];
  };
})();
