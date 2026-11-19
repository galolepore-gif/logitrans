/* LogiTrans Tracer · símbolo del sistema de los PC, navegador, servicios y consolas de Windows */
(function () {
  var LT = window.LT, N = LT.NET, S = N.state, C = LT.CLI, out = C.out, pad = C.pad;

  /* ---------- Seguridad de capa 2 antes de que salga el paquete ---------- */
  S.logs = S.logs || {};
  C.log = function (dev, lines) {
    (S.logs[dev] = S.logs[dev] || []).push.apply(S.logs[dev], lines);
    LT.emit('console', { dev: dev, lines: lines });
  };
  C.l2 = function (id) {
    var d = N.dev[id];
    if (id === 'P1-ADM-03' && S.intruder && !S.err['BCN-P1-ACC1:Fa0/3']) {
      S.err['BCN-P1-ACC1:Fa0/3'] = 'psecure-violation';
      S.viol['BCN-P1-ACC1:Fa0/3'] = { mac: '000C.8587.538A', count: 1 };
      C.log('BCN-P1-ACC1', ['%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 000C.8587.538A on port FastEthernet0/3.', '%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0/3, putting Fa0/3 in err-disable state', '%LINK-5-CHANGED: Interface FastEthernet0/3, changed state to administratively down', '%LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/3, changed state to down']);
      LT.emit('net', {});
    }
    if (id === 'P0-REC-01' && S.p0new && !S.err['BCN-P0-ACC1:Fa0/6']) C.violP0();
    return d;
  };
  C.violP0 = function () {
    S.p0new = true;
    S.err['BCN-P0-ACC1:Fa0/6'] = 'psecure-violation';
    S.viol['BCN-P0-ACC1:Fa0/6'] = { mac: '0030.BB2E.0742', count: 1 };
    C.log('BCN-P0-ACC1', ['%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0030.BB2E.0742 on port FastEthernet0/6.', '%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0/6, putting Fa0/6 in err-disable state']);
    LT.emit('net', {});
  };
  C.bpdu = function () {
    S.rogueSw = true;
    S.err['BCN-P1-ACC1:Fa0/3'] = 'bpduguard';
    C.log('BCN-P1-ACC1', ['%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port FastEthernet0/3 with BPDU Guard enabled. Disabling port.', '%PM-4-ERR_DISABLE: bpduguard error detected on Fa0/3, putting Fa0/3 in err-disable state', '%LINK-5-CHANGED: Interface FastEthernet0/3, changed state to administratively down']);
    LT.emit('net', {});
  };
  C.rogueDhcp = function () {
    C.log('BCN-P1-ACC1', ['%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 00E0.F7A1.2B3C', 'DHCPOFFER descartado en Fa0/7 (untrusted). Los clientes siguen recibiendo la puerta de enlace 10.1.20.1 del servidor legítimo 10.1.50.10.']);
  };

  /* ---------- ping ---------- */
  function ms(R) { var far = R.hops >= 4; var t = far ? 1 + Math.floor(Math.random() * 12) : (Math.random() < 0.8 ? 0 : 1); return t; }
  C.ping = function (id, ip, n) {
    n = n || 4;
    var d = N.dev[id];
    if (!ip) return [out('Ping request could not find host. Please check the name and try again.')];
    if (!/^[\d.]+$/.test(ip) && !/:/.test(ip)) { var res = C.resolve(id, ip); if (!res.ip) return [out('Ping request could not find host ' + ip + '. Please check the name and try again.')]; ip = res.ip; }
    C.l2(id);
    var r = [out('\nPinging ' + ip + ' with 32 bytes of data:\n')], rec = 0, times = [];
    for (var i = 0; i < n; i++) {
      var R = N.trace(id, ip, { p: 'icmp' });
      var o = { wait: 0 };
      if (i === 0) o.trace = R;
      if (R.ok && !(R.lost && i === 0)) {
        var ttl = (R.fromRouter || (N.dev[R.target] && ['rt', 'l3', 'sw', 'fw'].indexOf(N.dev[R.target].type) >= 0) ? 255 : 128) - (R.hops || 0);
        var t = ms(R); times.push(t); rec++;
        o.t = 'Reply from ' + (/:/.test(ip) ? ip.toUpperCase() : ip) + ': bytes=32 ' + (t === 0 ? 'time<1ms' : 'time=' + t + 'ms') + ' TTL=' + ttl; o.wait = 700;
      } else if (R.unreach) { o.t = 'Reply from ' + R.unreach + ': Destination host unreachable.'; o.wait = 900; o.c = 't-err'; }
      else { o.t = 'Request timed out.'; o.wait = 1800; o.c = 't-err'; }
      r.push(o);
    }
    r.push(out('\nPing statistics for ' + ip + ':\n    Packets: Sent = ' + n + ', Received = ' + rec + ', Lost = ' + (n - rec) + ' (' + Math.round((n - rec) / n * 100) + '% loss),' + (rec ? '\nApproximate round trip times in milli-seconds:\n    Minimum = ' + Math.min.apply(0, times) + 'ms, Maximum = ' + Math.max.apply(0, times) + 'ms, Average = ' + Math.round(times.reduce(function (a, b) { return a + b; }, 0) / times.length) + 'ms' : '')));
    return r;
  };
  C.tracert = function (id, ip) {
    var R = N.trace(id, ip, { p: 'icmp' }), r = [out('\nTracing route to ' + ip + ' over a maximum of 30 hops: \n')], n = 1;
    var hopIp = function (dev) {
      var d = N.dev[dev], src = N.dev[id];
      if (d.type === 'l3') return src.gw || d.ips[0];
      if (d.type === 'fw') return d.ips[2];
      if (d.type === 'rt') return d.site === 'INET' ? d.ips[0] : d.ips[1];
      return d.ip;
    };
    var seenCore = {};
    R.path.slice(1).forEach(function (dev) {
      var d = N.dev[dev]; if (!d || ['sw', 'ap'].indexOf(d.type) >= 0) return;
      if (d.type === 'l3') { if (seenCore[d.site]) return; seenCore[d.site] = 1; }
      r.push(out(C.lpad(n++, 3) + '   0 ms      0 ms      ' + (Math.random() < 0.5 ? 0 : 1) + ' ms      ' + hopIp(dev), { wait: 400 }));
    });
    if (!R.ok) { r.push(out(C.lpad(n, 3) + '   *         *         *         Request timed out.', { wait: 1500 })); }
    r[0].trace = R;
    r.push(out('\nTrace complete.'));
    return r;
  };

  /* ---------- DNS y web ---------- */
  C.resolve = function (id, name) {
    var d = N.dev[id]; name = name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (/^[\d.]+$/.test(name)) return { ip: name };
    if (name !== 'www.logitrans.com' && name !== 'logitrans.com') return { ip: null };
    if (d.site === 'INET') return { ip: '85.100.1.18', server: '203.0.113.53' };
    var R = N.trace(id, d.dns, { p: 'udp', port: 53 });
    if (!R.ok) return { ip: null, R: R };
    return { ip: '10.1.50.12', server: d.dns, R: R };
  };
  C.browse = function (id, url) {
    C.l2(id);
    var host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, ''), https = /^https:/.test(url);
    var res = C.resolve(id, host);
    if (!res.ip) return { ok: false, msg: 'Host Name Unresolved', R: res.R };
    var R = N.trace(id, res.ip, { p: 'tcp', port: https ? 443 : 80 });
    if (!R.ok) return { ok: false, msg: 'Request Timeout', R: R, ip: res.ip };
    return { ok: true, ip: res.ip, R: R, url: url };
  };
  C.nslookup = function (id, name) {
    var d = N.dev[id], res = C.resolve(id, name || 'www.logitrans.com');
    if (!res.ip) return [out('Server: [' + d.dns + ']\nAddress:  ' + d.dns + '\n\nDNS request timed out.\n    timeout was 15000 milli seconds.', { c: 't-err' })];
    return [out('\nServer: [' + res.server + ']\nAddress:  ' + res.server + '\n\n' + (d.site === 'INET' ? 'Non-authoritative answer:\n' : '') + 'Name:   www.logitrans.com\nAddress:  ' + res.ip, { trace: res.R })];
  };

  /* ---------- ipconfig ---------- */
  function ll(mac) { var h = mac.replace(/\./g, '').toUpperCase(); var b = (parseInt(h.slice(0, 2), 16) ^ 2).toString(16).toUpperCase(); return 'FE80::' + (b === '0' ? '' : b) + h.slice(2, 4).replace(/^0/, '') + ':' + h.slice(4, 6) + 'FF:FE' + h.slice(6, 8) + ':' + h.slice(8, 12).replace(/^0+/, ''); }
  C.ipconfig = function (id, all) {
    var d = N.dev[id], ifn = d.wifi ? 'Wireless0' : 'FastEthernet0';
    var intr = id === 'P1-ADM-03' && S.intruder;
    var v6 = d.v6 || (d.site === 'INET' ? '::' : (N.subnetOf(d.ip) || {}).v6 ? (N.subnetOf(d.ip).v6.replace('::/64', ':') + ll(d.mac).slice(6)).toUpperCase() : '::');
    var r = ['', ifn + ' Connection:(default port)', '', '   Connection-specific DNS Suffix..: ' + (d.site === 'INET' ? '' : 'logitrans.local')];
    if (all) r.push('   Physical Address................: ' + (intr ? '000C.8587.538A' : d.mac));
    r.push('   Link-local IPv6 Address.........: ' + ll(d.mac), '   IPv6 Address....................: ' + v6, '   IPv4 Address....................: ' + d.ip, '   Subnet Mask.....................: ' + d.mask, '   Default Gateway.................: ' + (d.site === 'INET' ? '::' : 'FE80::1'), '                                     ' + d.gw);
    if (all) r.push('   DHCP Servers....................: ' + (d.site === 'INET' ? '0.0.0.0' : d.dns), '   DHCPv6 IAID.....................: ', '   DHCPv6 Client DUID..............: 00-01-00-01-' + d.mac.replace(/\./g, '').match(/../g).join('-'), '   DNS Servers.....................: ::', '                                     ' + (d.dns || '0.0.0.0'));
    r.push('', 'Bluetooth Connection:', '', '   Connection-specific DNS Suffix..: ', '   Link-local IPv6 Address.........: ::', '   IPv6 Address....................: ::', '   IPv4 Address....................: 0.0.0.0', '   Subnet Mask.....................: 0.0.0.0', '   Default Gateway.................: ::', '                                     0.0.0.0');
    return [out(r.join('\n'))];
  };

  /* ---------- Sesión del símbolo del sistema de un PC ---------- */
  C.pc = function (id) {
    var d = N.dev[id], remote = null, hist = [];
    var sess = {
      dev: id, kind: 'pc',
      prompt: function () { return remote ? remote.prompt() : 'C:\\>'; },
      banner: function () { return [out('\nCisco Packet Tracer PC Command Line 1.0', { c: 't-dim' })]; },
      exec: function (line, opt) {
        opt = opt || {};
        if (remote) {
          var r = remote.exec(line);
          if (r.length && r[r.length - 1].exit) { var ip = remote.ip; remote = null; return [out('\n[Connection to ' + ip + ' closed by foreign host]')]; }
          return r;
        }
        line = line.trim(); if (!line) return [];
        hist.push(line);
        var w = line.split(/\s+/), c = w[0].toLowerCase();
        if (c === '?' || c === 'help') return [out('Available Commands:\n?         Display the list of available commands\narp       Display the arp table\nftp       ftp\nhelp      Display the list of available commands\nipconfig  Display network configuration\nnslookup  DNS Lookup\nping      Send echo messages\nssh       Ssh client\ntelnet    Telnet client\ntracert   Trace route to destination', { c: 't-dim' })];
        if (c === 'ipconfig') {
          if (/\/renew/i.test(line)) { S.dhcpOk[id] = true; return [out('\n   IP Address......................: ' + d.ip + '\n   Subnet Mask.....................: ' + d.mask + '\n   Default Gateway.................: ' + d.gw + '\n   DNS Server......................: ' + d.dns, { trace: N.trace(id, d.dns, { p: 'udp', port: 67 }) })]; }
          if (/\/release/i.test(line)) { S.dhcpOk[id] = false; return [out('\n   IP Address......................: 0.0.0.0\n   Subnet Mask.....................: 0.0.0.0\n   Default Gateway.................: 0.0.0.0\n   DNS Server......................: 0.0.0.0')]; }
          return C.ipconfig(id, /\/all/i.test(line));
        }
        if (c === 'ping') { var ip = w.filter(function (x, i) { return i && x[0] !== '-'; }).pop(); return C.ping(id, ip); }
        if (c === 'tracert') return C.tracert(id, w[1]);
        if (c === 'nslookup') return C.nslookup(id, w[1]);
        if (c === 'arp') return [out('  Internet Address      Physical Address      Type\n  ' + pad(d.gw, 22) + pad('0000.0C9F.F' + ('00' + (d.vlan || 0).toString(16)).slice(-3), 22) + 'dynamic')];
        if (c === 'ftp') {
          var R = N.trace(id, w[1], { p: 'tcp', port: 21 });
          return [out('Trying to connect...' + w[1], { trace: R }), out(R.ok ? 'Connected to ' + w[1] + '\n220- Welcome to PT Ftp server\nUsername:' : '%Error opening ftp://' + w[1] + '/ (Timed out)\n.\n(Disconnecting from ftp server)', { wait: R.ok ? 300 : 2500, c: R.ok ? '' : 't-err' })];
        }
        if (c === 'telnet') {
          var ipT = w[1], Rt = N.trace(id, ipT, { p: 'tcp', port: 23 }), tgt = N.find(ipT);
          var vt = Rt.ok && tgt && N.acl[tgt] ? N.check(tgt, 'ACL-VTY-GESTION', { src: d.ip }) : { ok: true };
          if (!Rt.ok || !vt.ok) return [out('Trying ' + ipT + ' ...', { trace: Rt }), out('% Connection timed out; remote host not responding', { wait: 2500, c: 't-err' })];
          return [out('Trying ' + ipT + ' ...Open', { trace: Rt }), out('\n[Connection to ' + ipT + ' closed by foreign host]', { wait: 500 })];
        }
        if (c === 'ssh') {
          var li = w.indexOf('-l'), user = li >= 0 ? w[li + 1] : null, ipS = w[w.length - 1];
          if (!user) return [out('\nUsage: SSH -l username target', { c: 't-err' })];
          var Rs = N.trace(id, ipS, { p: 'tcp', port: 22 }), dev = N.find(ipS);
          var ok = Rs.ok && dev && ['rt', 'l3', 'sw'].indexOf(N.dev[dev].type) >= 0;
          var vty = ok && N.acl[dev] && N.acl[dev]['ACL-VTY-GESTION'] ? N.check(dev, 'ACL-VTY-GESTION', { src: d.ip }) : (ok && N.dev[dev].type === 'rt' && N.dev[dev].site !== 'INET' ? (LT.inNet(d.ip, '10.1.99.0', 27) || LT.inNet(d.ip, '10.2.99.0', 26) ? { ok: true } : { ok: false }) : { ok: ok });
          if (!ok || !vty.ok) return [out('\nTrying ' + ipS + ' ...', { trace: Rs }), out('% Connection refused by remote host', { wait: 1800, c: 't-err' })];
          var tries = 0;
          var ask = function (pw) {
            var good = /^(admin\.xarxa0[12]|noc\.admin)$/i.test(user) && pw && pw.length >= 6 && !opt.bad;
            if (!good) { tries++; if (tries >= 3) return [out('% Login invalid\n\n[Connection to ' + ipS + ' closed by foreign host]', { c: 't-err' })]; return [out('% Login invalid\n', { c: 't-err' }), out('', { ask: { prompt: 'Password: ', hidden: true, cb: function (p2) { opt.bad = false; return ask(p2); } } })]; }
            remote = C.ios(dev); remote.ip = ipS;
            return [out('\n')];
          };
          return [out('\nTrying ' + ipS + ' ...Open', { trace: Rs }), out('', { ask: { prompt: 'Password: ', hidden: true, cb: ask } })];
        }
        if (c === 'browser') return [out('', { browser: w.slice(1).join(' ') || 'http://www.logitrans.com' })];
        if (c === 'cls' || c === 'clear') return [out('', { clear: true })];
        return [out('Invalid Command.', { c: 't-err' })];
      },
      history: function () { return hist; },
      isRemote: function () { return !!remote; },
      remoteDev: function () { return remote && remote.dev; }
    };
    return sess;
  };

  /* ---------- Consolas de Windows (anfitrión, SRV-AD, clientes) ---------- */
  var PS = {};
  PS[/^docker compose up -d --wait$/i] = function () { return ['[+] Running 6/6', ' - Network logitrans-web_default          Created      0.1s', ' - Container logitrans-web-db-1           Healthy     12.4s', ' - Container logitrans-web-jellyfin-1     Healthy      9.8s', ' - Container logitrans-web-wordpress-1    Healthy     15.2s', ' - Container logitrans-web-clients-1      Healthy     14.7s', ' - Container logitrans-web-nginx-1        Healthy     17.1s']; };
  PS[/^docker compose ps$/i] = function () {
    var r = [pad('NAME', 27) + pad('IMAGE', 25) + pad('SERVICE', 11) + pad('STATUS', 25) + 'PORTS'];
    LT.DOCKER.forEach(function (c) { r.push(pad('logitrans-web-' + c.name + '-1', 27) + pad(c.image, 25) + pad(c.name, 11) + pad('Up 4 minutes (healthy)', 25) + (c.pub ? '0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp' : c.port.split(' ')[0] + '/tcp')); });
    return r;
  };
  PS[/^docker compose logs clients/i] = function () { return ['clients-1  | 2026-11-12 10:41:07,318 WARNING ENVIO_NO_AUTORIZADO usuario=cliente1 ref=\'LT-2026-0201\' ip=172.18.0.6']; };
  PS[/^Get-NetTCPConnection/i] = function () { return ['', 'LocalAddress  LocalPort RemoteAddress RemotePort State  AppliedSetting OwningProcess', '------------  --------- ------------- ---------- -----  -------------- -------------', '0.0.0.0       7778      0.0.0.0       0          Listen                5124', '0.0.0.0       1042      0.0.0.0       0          Listen                4380', '']; };
  PS[/^Get-Process -Id (\d+)/i] = function (m) { var n = m[1] === '5124' ? 'ArmouryCrateControlInterface' : m[1] === '4380' ? 'asus_framework' : null; if (!n) return ['Get-Process : Cannot find a process with the process identifier ' + m[1] + '.']; return ['', 'Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName', '-------  ------    -----      -----     ------     --  -- -----------', '    412      27    18932      31420       2,41   ' + m[1] + '   1 ' + n, '']; };
  PS[/^New-NetFirewallRule .*LogiTrans-bloqueo-ASUS/i] = function () { S.fwAsus = true; return ['', 'Name                          : {4f2a9c7e-1b55-4d0e-9a3c-7d18e2b6f041}', 'DisplayName                   : LogiTrans-bloqueo-ASUS', 'Description                   :', 'DisplayGroup                  :', 'Group                         :', 'Enabled                       : True', 'Profile                       : Any', 'Platform                      : {}', 'Direction                     : Inbound', 'Action                        : Block', 'EdgeTraversalPolicy           : Block', 'LooseSourceMapping            : False', 'LocalOnlyMapping              : False', 'Owner                         :', 'PrimaryStatus                 : OK', 'Status                        : The rule was parsed successfully from the store. (65536)', 'EnforcementStatus             : NotApplicable', 'PolicyStoreSource             : PersistentStore', 'PolicyStoreSourceType         : Local', '']; };
  PS[/^nmap(?: -sV)? (.+)$/i] = function (m) {
    var r = ['Starting Nmap 7.95 ( https://nmap.org ) at 2026-11-12 10:12 Hora estándar romance', 'Nmap scan report for ' + m[1], 'Host is up (0.00040s latency).', 'Not shown: 994 closed tcp ports (reset)', 'PORT     STATE SERVICE       VERSION'];
    LT.NMAP.forEach(function (p) { var blocked = S.fwAsus && /1042|7778/.test(p.port); r.push(pad(p.port, 9) + pad(blocked ? 'filtered' : 'open', 6) + pad(p.svc, 14) + p.ver); });
    r.push('Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows', '', 'Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .', 'Nmap done: 1 IP address (1 host up) scanned in 31.42 seconds');
    return r;
  };
  PS[/^wpscan --url (\S+)(.*)$/i] = function (m) {
    var tok = /api-token/.test(m[2]);
    var r = ['_______________________________________________________________', '         __          _______   _____', '         \\ \\        / /  __ \\ / ____|', '          \\ \\  /\\  / /| |__) | (___   ___  __ _ _ __ (R)', '           \\ \\/  \\/ / |  ___/ \\___ \\ / __|/ _` | \'_ \\', '            \\  /\\  /  | |     ____) | (__| (_| | | | |', '             \\/  \\/   |_|    |_____/ \\___|\\__,_|_| |_|', '', '         WordPress Security Scanner by the WPScan Team', '_______________________________________________________________', '', '[+] URL: ' + m[1] + '/', '[+] Started: Thu Nov 12 11:02:14 2026', '', '[+] Headers', ' | Interesting Entry: server: nginx', '', '[+] WordPress theme in use: logitrans', ' | Version: 2.0 (80% confidence)', '', '[+] Enumerating Vulnerable Plugins (via Passive Methods)', '[i] No plugins Found.', '', '[+] Enumerating Users (via Passive and Aggressive Methods)', '[i] No Users Found.', ''];
    if (tok) r.push('[+] WPScan DB API OK', ' | Plan: free', ' | Requests Done (during the scan): 2', ' | Requests Remaining: 23', '', '[+] Finished: Thu Nov 12 11:02:28 2026', '[+] Requests Done: 1980', '[+] Elapsed time: 00:00:14');
    else r.push('[!] No WPScan API Token given, as a result vulnerability data has not been output.', '[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register', '', '[+] Finished: Thu Nov 12 10:58:03 2026');
    return r;
  };
  PS[/repositorio-comun\.ps1/i] = function () { return ['Creando C:\\Repositorio ...', '  + C:\\Repositorio\\Documentos', '  + C:\\Repositorio\\ImagenesSO', '  + C:\\Repositorio\\Manuales', '  + C:\\Repositorio\\Software', '  + C:\\Repositorio\\Videos', 'Permisos de la raíz:', '  BYWAAKE\\Grupo-Gestio:(OI)(CI)(M)', '  BUILTIN\\Usuarios:(OI)(CI)(RX)', '  NT AUTHORITY\\SYSTEM:(OI)(CI)(F)', '  BUILTIN\\Administradores:(OI)(CI)(F)', 'Recurso compartido creado: \\\\BYWAAKE\\Repositorio', 'Usuarios de prueba: operari.picking01, admin.xarxa01']; };
  PS[/^runas \/user:(\S+)/i] = function (m, st) { st.user = m[1]; return ['Enter the password for ' + m[1] + ':', 'Attempting to start powershell as user "' + m[1] + '" ...']; };
  PS[/^whoami$/i] = function (m, st) { return [st.user.toLowerCase()]; };
  PS[/^del (.+)$/i] = function (m, st) { if (/operari/i.test(st.user)) return ['del : Acceso denegado a la ruta de acceso \'' + m[1] + '\'.', '    + CategoryInfo          : PermissionDenied: (' + m[1] + ':FileInfo) [Remove-Item], UnauthorizedAccessException']; return ['']; };
  PS[/^dir (C:\\Repositorio\S*)$/i] = function (m) {
    if (/Manual-de-acceso/i.test(m[1])) return ['', '    Directorio: C:\\Repositorio\\Manuales', '', 'Mode                 LastWriteTime         Length Name', '----                 -------------         ------ ----', '-a----        11/11/2026     18:22         412873 Manual-de-acceso-Wi-Fi-y-VPN.pdf', ''];
    if (/Software/i.test(m[1])) return ['', '    Directorio: C:\\Repositorio\\Software', '', 'Mode                 LastWriteTime         Length Name', '----                 -------------         ------ ----', '-a----        11/11/2026     18:30           1286 7-Zip.lnk', '-a----        11/11/2026     18:29       44612904 vlc-3.0.23-win64.exe', ''];
    return ['', '    Directorio: C:\\Repositorio', '', 'Mode                 LastWriteTime         Length Name', '----                 -------------         ------ ----', 'd-----        11/11/2026     18:14                Documentos', 'd-----        11/11/2026     18:14                ImagenesSO', 'd-----        11/11/2026     18:14                Manuales', 'd-----        11/11/2026     18:14                Software', 'd-----        11/11/2026     18:14                Videos', ''];
  };
  PS[/^mkdir (.+)$/i] = function (m, st) { if (/operari/i.test(st.user)) return ['mkdir : Acceso denegado a la ruta de acceso \'' + m[1] + '\'.']; return ['', '    Directorio: ' + m[1].replace(/\\[^\\]+$/, ''), '', 'd-----        ' + new Date().toLocaleDateString('es-ES') + '                ' + m[1].split('\\').pop()]; };
  PS[/^Get-PhysicalDisk$/i] = function () { return ['', 'Number FriendlyName            SerialNumber MediaType   CanPool OperationalStatus HealthStatus Usage            Size', '------ ------------            ------------ ---------   ------- ----------------- ------------ -----            ----', '0      Msft Virtual Disk                     Unspecified False   OK                Healthy      Auto-Select     50 GB', '1      Msft Virtual Disk                     Unspecified False   OK                Healthy      Auto-Select      5 GB', '2      Msft Virtual Disk                     Unspecified False   OK                Healthy      Auto-Select      5 GB', '3      Msft Virtual Disk                     Unspecified False   OK                Healthy      Auto-Select      5 GB', '']; };
  PS[/^Get-StoragePool/i] = function () { return ['', 'FriendlyName OperationalStatus HealthStatus IsPrimordial IsReadOnly   Size AllocatedSize', '------------ ----------------- ------------ ------------ ----------   ---- -------------', 'Primordial   OK                Healthy      True         False      65 GB         65 GB', 'Pool-RAID    OK                Healthy      False        False      14.5 GB       13.5 GB', '']; };
  PS[/^Get-ADOrganizationalUnit/i] = function () { return ['', 'Name          DistinguishedName'].concat(LT.AD.map(function (o) { return pad(o.ou, 14) + 'OU=' + o.ou + ',DC=logitrans,DC=local'; })).concat(['']); };
  PS[/^Get-ADUser/i] = function () { var r = ['', 'SamAccountName       Name                 Enabled'], ou = []; LT.AD.forEach(function (o) { o.users.forEach(function (u) { r.push(pad(u[0], 21) + pad(u[1], 21) + 'True'); }); }); return r.concat(['']); };
  PS[/^Get-GPO -All/i] = function () { return [''].concat(LT.GPOS.map(function (g) { return 'DisplayName      : ' + g[0] + '\nDomainName       : logitrans.local\nGpoStatus        : AllSettingsEnabled\n'; })); };
  PS[/^gpupdate( \/force)?$/i] = function () { return ['Actualizando directiva...', '', 'La actualización de la directiva de equipo se completó correctamente.', 'La actualización de la directiva de usuario se completó correctamente.', '']; };
  PS[/^manage-bde -status/i] = function () { return ['Cifrado de unidad BitLocker: versión de la herramienta de configuración 10.0.19041', 'Copyright (C) 2013 Microsoft Corporation. Todos los derechos reservados.', '', 'Estado del volumen de disco para volúmenes con BitLocker', 'Volúmenes en los que se puede usar la protección de Cifrado de unidad BitLocker:', 'Volumen C: []', '[Volumen del sistema operativo]', '', '    Tamaño:                       49,39 GB', '    Versión de BitLocker:         2.0', '    Estado de conversión:         Cifrado totalmente', '    Porcentaje cifrado:           100,0%', '    Método de cifrado:            XTS-AES 128', '    Estado de protección:         Protección activada', '    Estado de bloqueo:            Desbloqueado', '    Campo de identificación:      Desconocido', '    Protectores de clave:', '        Contraseña', '        Contraseña numérica', '']; };
  PS[/^gpresult \/r$/i] = function (m, st) {
    return ['', 'Herramienta del sistema operativo Microsoft (R) Windows (R) - Resultados de directiva de grupo', '', 'CONFIGURACIÓN DE USUARIO', '-------------------------', '    CN=Pablo Martin,OU=Administracio,DC=logitrans,DC=local', '    Última aplicación de la directiva de grupo: 12/11/2026 a las 9:47:02', '    Directiva de grupo se aplicó desde:          SRV-AD.logitrans.local', '    Nombre de dominio:                           LOGITRANS', '    Tipo de dominio:                             Windows 2008 o posterior', '', '    Objetos de directiva de grupo aplicados', '    ----------------------------------------', '        GPO-Bloqueo-Pantalla', '        GPO-Redireccion-Docs', '        GPO-Unidades-Mapeadas', '', '    El usuario es parte de los siguientes grupos de seguridad', '    ---------------------------------------------------------', '        Usuarios del dominio', '        Grupo-Administracio', ''];
  };
  PS[/^Get-BitLockerVolume/i] = function () { return ['', 'MountPoint EncryptionMethod VolumeStatus      ProtectionStatus EncryptionPercentage', '---------- ---------------- ------------      ---------------- --------------------', 'C:         XtsAes128        FullyEncrypted    On               100', 'R:         XtsAes128        FullyEncrypted    On               100', '']; };
  PS[/^Get-DhcpServerv4Scope/i] = function () { return ['', 'ScopeId         SubnetMask      Name                    State    StartRange      EndRange', '-------         ----------      ----                    -----    ----------      --------'].concat(LT.SUBNETS.filter(function (s) { return s.site === 'ZGZ'; }).map(function (s) { return pad(s.net, 16) + pad(s.mask, 16) + pad('VLAN ' + s.vlan + ' ZGZ', 24) + pad('Active', 9) + pad(s.net.replace(/\.0$/, '.10'), 16) + s.bc.replace(/\d+$/, function (x) { return +x - 1; }); })).concat(['']); };
  PS[/^(cls|clear)$/i] = function () { return null; };
  PS[/^(help|\?)$/i] = function (m, st) { return ['Comandos de esta réplica:', '  docker compose up -d --wait · docker compose ps · docker compose logs clients | Select-String ENVIO_NO_AUTORIZADO', '  nmap -sV <ip> · wpscan --url https://logitrans.com [--api-token ...]', '  Get-NetTCPConnection -LocalPort 1042,7778 -State Listen · Get-Process -Id <PID>', '  New-NetFirewallRule -DisplayName "LogiTrans-bloqueo-ASUS" ...', '  Get-PhysicalDisk · Get-StoragePool · Get-ADUser -Filter * · Get-GPO -All · Get-BitLockerVolume', '  gpupdate /force · gpresult /r · manage-bde -status', '  powershell -ExecutionPolicy Bypass -File .\\repositorio-comun.ps1 -CrearUsuariosPrueba', '  runas /user:BYWAAKE\\operari.picking01 powershell · whoami · dir · del · mkdir']; };
  var PSK = Object.keys(PS).map(function (k) { var src = k.slice(1, k.lastIndexOf('/')), fl = k.slice(k.lastIndexOf('/') + 1); return { re: new RegExp(src, fl), fn: PS[k] }; });
  C.psKnows = function (line) { line = line.replace(/^powershell\s+(?=runas)/i, ''); return PSK.some(function (x) { return x.re.test(line.trim()); }); };
  C.ps = function (id) {
    var v = N.virt[id], st = { user: v.user };
    return {
      dev: id, kind: v.type,
      prompt: function () { return (v.type === 'ps' ? 'PS ' : '') + v.cwd + '>'; },
      banner: function () { return [out(v.type === 'ps' ? 'Windows PowerShell\nCopyright (C) Microsoft Corporation. Todos los derechos reservados.\n' : 'Microsoft Windows [Versión 10.0.19045]\n(c) Microsoft Corporation. Todos los derechos reservados.\n', { c: 't-dim' })]; },
      exec: function (line) {
        line = line.trim(); if (!line) return [];
        var parts = line.split(/\s+·\s+/);
        var res = [];
        parts.forEach(function (pl) {
          for (var i = 0; i < PSK.length; i++) {
            var m = pl.match(PSK[i].re);
            if (m) { var r = PSK[i].fn(m, st); if (r === null) { res.push(out('', { clear: true })); return; } res.push(out(r.join('\n'), { wait: 200 })); return; }
          }
          res.push(out((v.type === 'ps' ? pl.split(' ')[0] + ' : El término \'' + pl.split(' ')[0] + '\' no se reconoce como nombre de un cmdlet, función, archivo de script o programa ejecutable.' : '"' + pl.split(' ')[0] + '" no se reconoce como un comando interno o externo,\nprograma o archivo por lotes ejecutable.'), { c: 't-err' }));
        });
        return res;
      }
    };
  };

  /* ---------- Abrir la sesión que corresponda ---------- */
  C.open = function (id) {
    if (N.virt[id]) return C.ps(id);
    var d = N.dev[id]; if (!d) return null;
    if (['rt', 'l3', 'sw', 'fw'].indexOf(d.type) >= 0) return C.ios(id);
    if (['pc', 'srv'].indexOf(d.type) >= 0) return C.pc(id);
    return null;
  };

  /* ¿Este comando se puede ejecutar? (para los botones «Ejecutar en el Tracer») */
  var SPECIAL = { dhcp: 1, aaa: 1, wireless: 1, 'conf-ospfv3-auth': 1 };
  C.split = function (run) {
    var i = run.indexOf('|'), dev = N.alias(run.slice(0, i)), cmd = run.slice(i + 1).trim(), mods = [];
    cmd = cmd.replace(/\s+@(\w+)/g, function (m, k) { mods.push(k); return ''; }).trim();
    cmd = cmd.replace(/^Web Browser → /, 'browser ');
    return { dev: dev, cmd: cmd, mods: mods, parts: cmd.split(/\s+·\s+/) };
  };
  C.can = function (run) {
    if (!run || run.indexOf('|') < 0) return false;
    var r = C.split(run), g = N.get(r.dev); if (!g) return false;
    if (SPECIAL[r.cmd]) return true;
    if (N.virt[r.dev]) return r.parts.every(function (p) { return C.psKnows(p); });
    if (['rt', 'l3', 'sw', 'fw'].indexOf(g.type) >= 0) return r.parts.every(function (p) { var x = C.parse(p, g.type === 'fw' ? 'asa' : 'ios'); return x && x.c !== 'do <rest>'; });
    if (['pc', 'srv'].indexOf(g.type) >= 0) return r.parts.every(function (p) { return /^(ping|ipconfig|tracert|nslookup|ssh|telnet|ftp|arp|browser)\b/i.test(p) && !/[<(]/.test(p); });
    return false;
  };
  C.macros = {
    'ISP-1|conf-ospfv3-auth': ['enable', 'configure terminal', 'interface GigabitEthernet0/0/1', 'ipv6 ospf authentication ipsec spi 256 sha1 1234567890ABCDEF1234567890ABCDEF12345678', 'interface GigabitEthernet0/0/2', 'ipv6 ospf authentication ipsec spi 257 sha1 1234567890ABCDEF1234567890ABCDEF12345678', 'end', 'show ipv6 ospf interface GigabitEthernet0/0/1']
  };
  /* Prepara el estado que pide cada modificador */
  C.applyMods = function (r) {
    r.mods.forEach(function (m) {
      if (m === 'cut') { S.cut = true; LT.emit('net', { cut: true }); }
      if (m === 'viol') { if (!S.err['BCN-P0-ACC1:Fa0/6']) C.violP0(); }
      if (m === 'web') { if (!S.webConn) { N.trace('PC-INTERNET', '85.100.1.18', { p: 'tcp', port: 80 }); } }
    });
  };
})();
