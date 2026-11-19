/* Escritorio de Windows Server 2022 (SRV-AD) con las herramientas reales del dominio */
(function () {
  var LT = window.LT, z = 10, wins = {}, clockT = null;

  var APPS = {
    aduc: { t: 'Active Directory Users and Computers', ic: 'AD', w: 620, h: 340, build: aduc },
    gpmc: { t: 'Group Policy Management', ic: 'GP', w: 600, h: 330, build: gpmc },
    dhcp: { t: 'DHCP · srv-ad.logitrans.local · IPv4', ic: 'DH', w: 560, h: 330, build: dhcp },
    dns: { t: 'DNS Manager · horizonte dividido', ic: 'DN', w: 560, h: 320, build: dns },
    nps: { t: 'Network Policy Server · 802.1X', ic: 'NP', w: 640, h: 360, build: nps },
    cmd: { t: 'Windows PowerShell · LOGITRANS\\admin.rrhh', ic: '>_', w: 600, h: 330, build: cmd }
  };

  function open(id) {
    var area = LT.$('#dt-area');
    if (wins[id]) { focus(wins[id]); return wins[id]; }
    var A = APPS[id], n = Object.keys(wins).length;
    var W = LT.h('div.dwin', { style: { left: (11 + n * 3.2) + '%', top: (4 + n * 5) + '%', width: 'min(' + A.w + 'px, 92%)', height: 'min(' + A.h + 'px, 84%)' } });
    var bar = LT.h('div.win-bar', {}, [LT.h('span.win-ic.mono', { text: A.ic }), LT.h('span.win-t', { text: A.t }), LT.h('button.win-x', { 'aria-label': 'Cerrar', text: '×', onclick: function (e) { e.stopPropagation(); close(id); } })]);
    var body = LT.h('div.win-body');
    W.appendChild(bar); W.appendChild(body);
    area.appendChild(W);
    W.addEventListener('mousedown', function () { focus(W); });
    drag(W, bar, area);
    wins[id] = W; W._id = id;
    A.build(body);
    focus(W); tasks();
    LT.audio && LT.audio.click();
    requestAnimationFrame(function () { W.classList.add('in'); });
    return W;
  }
  function close(id) { var W = wins[id]; if (!W) return; W.remove(); delete wins[id]; tasks(); }
  function closeAll() { Object.keys(wins).forEach(close); }
  function focus(W) { W.style.zIndex = ++z; LT.$$('.dwin').forEach(function (x) { x.classList.toggle('focus', x === W); }); tasks(); }
  function tasks() {
    var t = LT.$('#dt-tasks'); t.innerHTML = '';
    Object.keys(wins).forEach(function (id) { t.appendChild(LT.h('button.dt-tb' + (wins[id].classList.contains('focus') ? '.on' : ''), { text: APPS[id].ic + '  ' + APPS[id].t.split(' · ')[0], onclick: function () { focus(wins[id]); } })); });
  }
  function drag(W, handle, area) {
    handle.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.win-x')) return;
      var r = area.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, ox = W.offsetLeft, oy = W.offsetTop;
      var scale = r.width / area.offsetWidth || 1;
      handle.setPointerCapture(e.pointerId);
      function mv(ev) {
        W.style.left = Math.max(-W.offsetWidth + 80, Math.min(area.offsetWidth - 80, ox + (ev.clientX - sx) / scale)) + 'px';
        W.style.top = Math.max(0, Math.min(area.offsetHeight - 30, oy + (ev.clientY - sy) / scale)) + 'px';
      }
      function up() { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); }
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up);
    });
  }

  /* ---------- Herramientas ---------- */
  function aduc(b) {
    var tree = LT.h('div.w-tree'), main = LT.h('div.w-main');
    tree.appendChild(LT.h('div.wt-root.mono', { text: 'logitrans.local' }));
    LT.AD.forEach(function (o, i) {
      var it = LT.h('button.wt-i', { html: '<i class="ou"></i>' + o.ou });
      it.onclick = function () { LT.$$('.wt-i', tree).forEach(function (x) { x.classList.remove('on'); }); it.classList.add('on'); show(o); };
      tree.appendChild(it);
      if (!i) setTimeout(function () { it.click(); });
    });
    ['Builtin', 'Computers', 'Domain Controllers'].forEach(function (x) { tree.appendChild(LT.h('div.wt-i.dim', { html: '<i class="fd"></i>' + x })); });
    function show(o) {
      main.innerHTML = '<table class="w-t"><thead><tr><th>Nombre</th><th>Tipo</th><th>Inicio de sesión</th></tr></thead><tbody>' +
        o.users.map(function (u) { return '<tr><td><i class="usr"></i>' + u[1] + '</td><td>Usuario</td><td class="mono">' + u[0] + '</td></tr>'; }).join('') +
        '<tr><td><i class="grp"></i>' + o.group + '</td><td>Grupo de seguridad global</td><td></td></tr></tbody></table>' +
        '<div class="w-note"><b>Qué puede hacer ' + o.group + ':</b> ' + o.can + '.</div>' +
        '<div class="w-path mono">CN=' + o.users[0][1] + ',OU=' + o.ou + ',DC=logitrans,DC=local</div>';
    }
    b.appendChild(LT.h('div.w-split', {}, [tree, main]));
  }
  function gpmc(b) {
    var rows = LT.GPOS.map(function (g) { return '<tr><td><i class="gpo"></i>' + g[0] + '</td><td>' + g[1] + '</td><td class="mono">' + g[2] + '</td></tr>'; }).join('');
    b.innerHTML = '<div class="w-crumb mono">Bosque: logitrans.local › Dominios › logitrans.local › Objetos de directiva de grupo</div><table class="w-t"><thead><tr><th>GPO</th><th>Qué hace</th><th>Vinculada a</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
  function dhcp(b) {
    var rows = LT.SUBNETS.map(function (s) {
      var v = LT.VLANS.find(function (x) { return x.id === s.vlan; });
      return '<tr><td><i class="scope"></i>[' + s.net + '] VLAN ' + s.vlan + ' - ' + (v ? v.name : '') + ' ' + s.site + '</td><td class="mono">' + s.gw + '</td><td class="ok">Activo</td></tr>';
    }).join('');
    b.innerHTML = '<div class="w-crumb mono">srv-ad.logitrans.local › IPv4 · 11 ámbitos · relay ip helper-address en los cores</div><table class="w-t"><thead><tr><th>Ámbito</th><th>Router (003)</th><th>Estado</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="w-note"><b>Reserva:</b> <span class="mono">[10.2.30.20] ZGZ-ETQ-02</span>, la impresora de etiquetas del almacén. Sigue siendo «por DHCP» y la dirección no cambia nunca.</div>';
  }
  function dns(b) {
    b.innerHTML = '<div class="w-split"><div class="w-tree"><div class="wt-root mono">SRV-AD</div><div class="wt-i on"><i class="fd"></i>Forward Lookup Zones</div><div class="wt-i sub"><i class="zn"></i>_msdcs.logitrans.local</div><div class="wt-i sub"><i class="zn"></i>logitrans.local</div><div class="wt-i sub"><i class="zn"></i>logitrans.com</div><div class="wt-i"><i class="fd"></i>Reverse Lookup Zones</div><div class="wt-i sub"><i class="zn"></i>10.in-addr.arpa</div><div class="wt-i sub"><i class="zn"></i>50.1.10.in-addr.arpa</div></div>' +
      '<div class="w-main"><div class="split-h"><div class="sh-c in"><b>Desde dentro</b><span class="mono">nslookup www.logitrans.com</span><em class="mono">10.1.50.12</em><small>El tráfico no sale a Internet</small></div><div class="sh-c out"><b>Desde fuera</b><span class="mono">nslookup www.logitrans.com</span><em class="mono">85.100.1.18</em><small>DNS público → NAT estático</small></div></div>' +
      '<div class="w-note">Dos respuestas para el mismo nombre: <b>DNS de horizonte dividido</b> (3.C3). Así esquivamos la limitación de hairpin NAT del Packet Tracer y en la red real el tráfico interno nunca sale del edificio.</div></div></div>';
  }
  function nps(b) {
    b.innerHTML = '<div class="nps-grid"><div><div class="w-crumb mono">RADIUS Clients</div><table class="w-t"><tbody><tr><td><i class="dev"></i>WLC-BCN</td><td class="mono">10.1.99.20</td><td class="ok">Enabled</td></tr><tr><td><i class="dev"></i>WLC-ZGZ</td><td class="mono">10.2.99.2</td><td class="ok">Enabled</td></tr><tr><td><i class="dev"></i>Core-BCN</td><td class="mono">10.1.99.2</td><td class="ok">Enabled</td></tr></tbody></table>' +
      '<div class="w-crumb mono mt-s">Network Policies</div><table class="w-t"><tbody><tr><td>1</td><td>WiFi-LogiTrans-Corp</td><td>VLAN 20</td></tr><tr><td>2</td><td>WiFi-LogiTrans-Almacen</td><td>VLAN 30</td></tr><tr><td>3</td><td>AAA-Switches-TI</td><td>Grupo-Gestio</td></tr></tbody></table></div>' +
      '<div class="dot1x" id="dot1x"><div class="dx-n"><b>Portátil</b><span>suplicante</span></div><div class="dx-n"><b>AP / WLC</b><span>autenticador</span></div><div class="dx-n"><b>NPS</b><span>SRV-AD</span></div><div class="dx-n"><b>AD</b><span>logitrans.local</span></div><div class="dx-log mono" id="dx-log"></div><button class="btn small sig" id="dx-go">Conectarse a LogiTrans-Corp</button></div></div>';
    LT.$('#dx-go', b).onclick = handshake;
  }
  function handshake() {
    var box = LT.$('#dot1x'), log = LT.$('#dx-log'); if (!box) return;
    var steps = [
      [0, 1, 'EAPOL-Start', 'El portátil pide entrar al SSID LogiTrans-Corp'],
      [1, 0, 'EAP-Request/Identity', 'El AP pregunta quién es'],
      [0, 1, 'EAP-Response: admin.rrhh', 'Responde con su usuario del dominio'],
      [1, 2, 'RADIUS Access-Request', 'El WLC lo reenvía al NPS (UDP 1812)'],
      [2, 3, 'LDAP · Kerberos', 'El NPS valida la cuenta y el grupo contra el AD'],
      [3, 2, 'OK · Grupo-Administracio', 'Cuenta válida, no bloqueada'],
      [2, 1, 'RADIUS Access-Accept', 'Directiva 1: WiFi-LogiTrans-Corp · VLAN 20'],
      [1, 0, 'EAP-Success', 'Conectado. DHCP le da una IP de 10.1.20.0/23']
    ];
    box.classList.add('run'); log.innerHTML = '';
    var i = 0;
    (function nx() {
      if (!box.isConnected) return;
      LT.$$('.dx-pk', box).forEach(function (x) { x.remove(); });
      if (i >= steps.length) { box.classList.add('ok'); LT.audio && LT.audio.ok(); return; }
      var s = steps[i++], pk = LT.h('i.dx-pk' + (s[1] < s[0] ? '.back' : ''), { style: { '--a': s[0], '--b': s[1] } });
      box.appendChild(pk);
      log.appendChild(LT.h('div', {}, [LT.h('b', { text: s[2] }), LT.h('span', { text: s[3] })]));
      log.scrollTop = 1e9;
      LT.audio && LT.audio.blip();
      setTimeout(nx, LT.reduce ? 0 : 750);
    })();
  }
  function cmd(b) {
    var pre = LT.h('pre.ps');
    b.appendChild(pre);
    LT.typeLines(pre, [
      { t: 'PS C:\\Users\\admin.rrhh> gpresult /r', c: 't-cmd', type: true, wait: 500 },
      { t: '', wait: 50 },
      { t: 'CONFIGURACIÓN DE USUARIO', c: 't-sig' },
      { t: '    Nombre CN: CN=Pablo Martin,OU=Administracio,DC=logitrans,DC=local' },
      { t: '    Nombre de dominio: LOGITRANS' },
      { t: '    Sesión iniciada desde: SRV-AD.logitrans.local', c: 't-ok' },
      { t: '', wait: 50 },
      { t: '    Objetos de directiva de grupo aplicados', c: 't-sig' },
      { t: '    ----------------------------------------', c: 't-dim' },
      { t: '        GPO-Bloqueo-Pantalla', c: 't-ok', wait: 200 },
      { t: '        GPO-Redireccion-Docs', c: 't-ok', wait: 200 },
      { t: '        GPO-Unidades-Mapeadas', c: 't-ok', wait: 200 },
      { t: '', wait: 50 },
      { t: 'PS C:\\Users\\admin.rrhh> net use', c: 't-cmd', type: true, wait: 400 },
      { t: 'OK   S:   \\\\SRV-AD\\Departaments   Red de Microsoft Windows' },
      { t: 'PS C:\\Users\\admin.rrhh> copy informe.xlsx E:\\', c: 't-cmd', type: true, wait: 400 },
      { t: 'Acceso denegado. (GPO-Bloqueo-USB)', c: 't-bad' }
    ], { speed: 12, keepCursor: true });
  }

  function icons() {
    var box = LT.$('#dt-icons');
    [['aduc', 'Usuarios y equipos'], ['gpmc', 'Directivas de grupo'], ['dhcp', 'DHCP'], ['dns', 'DNS'], ['nps', 'NPS · RADIUS'], ['cmd', 'PowerShell']].forEach(function (a) {
      box.appendChild(LT.h('button.dt-ic', { ondblclick: function () { open(a[0]); }, onclick: function () { open(a[0]); } }, [LT.h('i.mono', { text: APPS[a[0]].ic }), LT.h('span', { text: a[1] })]));
    });
  }
  function clock() {
    var c = LT.$('#dt-clock'); if (!c) return;
    var d = new Date(); c.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  LT.scene('servicios', {
    steps: 4,
    init: function () {
      icons();
      LT.$('#dt-area').appendChild(LT.h('div.dt-wall', { html: '<b>SRV-AD</b><span class="mono">Windows Server 2022 · logitrans.local<br>10.1.50.10 · AD DS · DNS · DHCP · NPS</span>' }));
      clock();
    },
    enter: function () { clock(); clockT = setInterval(clock, 15000); if (!Object.keys(wins).length && !(LT.pres && LT.pres.active)) open('aduc'); },
    leave: function () { clearInterval(clockT); },
    step: function (n) {
      if (n <= 1) { closeAll(); if (n === 1) open('aduc'); }
      if (n === 2) { open('gpmc'); }
      if (n === 3) { var W = open('nps'); setTimeout(handshake, LT.reduce ? 0 : 500); }
      if (n === 4) { open('cmd'); }
    }
  });
})();
