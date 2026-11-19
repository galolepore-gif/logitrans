/* Widgets del capítulo 5: Active Directory, RADIUS, GPO, web, área de clientes, RAID, BitLocker, firewall, antivirus, repositorio y FOG */
(function () {
  var LT = window.LT, W = LT.W = LT.W || {}, esc = LT.esc;
  var run = function (r, t) { return '<button class="btn sm ghost tr-run" data-run="' + esc(r) + '">' + (t || 'Ejecutar en la consola') + '</button>'; };
  function bindRuns(el) { LT.$$('.tr-run', el).forEach(function (b) { b.onclick = function () { LT.Tracer.runInWindow(b.dataset.run); }; }); }
  var win = function (title, body, cls) { return '<div class="xwin ' + (cls || '') + '"><div class="xw-h"><i></i><i></i><i></i><span>' + title + '</span></div><div class="xw-b">' + body + '</div></div>'; };

  /* Usuarios y equipos de Active Directory */
  W.aduc = function (el) {
    var tree = '<ul class="ad-t"><li class="dom"><b>logitrans.local</b><ul>' + LT.AD.map(function (o, i) { return '<li><button data-i="' + i + '"' + (o.ou === 'Administracio' ? ' class="on"' : '') + '>' + o.ou + '</button></li>'; }).join('') + '</ul></li></ul>';
    el.innerHTML = win('Active Directory Users and Computers', '<div class="ad">' + tree + '<div class="ad-l"></div></div>', 'w-aduc');
    function show(i) {
      var o = LT.AD[i];
      LT.$('.ad-l', el).innerHTML = '<table class="t mini"><thead><tr><th>Nombre</th><th>Tipo</th><th>Descripción</th></tr></thead><tbody><tr><td><span class="ico g"></span>' + o.group + '</td><td>Grupo de seguridad</td><td>' + o.can + '</td></tr>' + o.users.map(function (u) { return '<tr><td><span class="ico u"></span>' + u[1] + '</td><td>Usuario</td><td class="m">' + u[0] + '@logitrans.local</td></tr>'; }).join('') + '</tbody></table>';
      LT.$$('.ad-t button', el).forEach(function (b) { b.classList.toggle('on', +b.dataset.i === i); });
    }
    LT.$$('.ad-t button', el).forEach(function (b) { b.onclick = function () { show(+b.dataset.i); }; });
    show(1);
  };

  /* Permisos por grupo */
  var PERM = {
    'Grupo-Direccio': { dep: 'm', repo: 'r', video: 'r', ssh: 'n', logs: 'n' }, 'Grupo-Administracio': { dep: 'm', repo: 'r', video: 'r', ssh: 'n', logs: 'n' },
    'Grupo-Magatzem': { dep: 'm', repo: 'r', video: 'r', ssh: 'n', logs: 'n' }, 'Grupo-Gestio': { dep: 'n', repo: 'm', video: 'r', ssh: 'y', logs: 'r' },
    'Grupo-Servidors': { dep: 'n', repo: 'r', video: 'n', ssh: 'n', logs: 'n', srv: 'y' }, 'Grupo-Convidats': { dep: 'n', repo: 'n', video: 'n', ssh: 'n', logs: 'n' }
  };
  W.perm = function (el) {
    var acts = [['dep', 'Carpeta de su departamento', '5.C1'], ['repo', 'Repositorio de medios', '5.D'], ['video', 'Vídeos de formación (Jellyfin)', '5.D'], ['ssh', 'SSH a switches y routers', '5.A2'], ['logs', 'Registros del antivirus', '5.C2']];
    var lab = { m: ['Modificar', 'ok'], r: ['Leer', 'info'], y: ['Sí', 'ok'], n: ['Denegado', 'bad'] };
    el.innerHTML = '<div class="w-perm"><table class="t"><thead><tr><th>Grupo</th>' + acts.map(function (a) { return '<th>' + a[1] + '<small>' + a[2] + '</small></th>'; }).join('') + '</tr></thead><tbody>' + Object.keys(PERM).map(function (g) { return '<tr><th>' + g + '</th>' + acts.map(function (a) { var v = PERM[g][a[0]]; return '<td><span class="chip ' + lab[v][1] + '">' + lab[v][0] + '</span></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    LT.$$('td, th', el).forEach(function (c) { c.addEventListener('mouseenter', function () { var tr = c.parentNode, i = Array.prototype.indexOf.call(tr.children, c); LT.$$('tr', el).forEach(function (r) { Array.prototype.forEach.call(r.children, function (x, k) { x.classList.toggle('col', k === i && i > 0); }); }); }); });
  };

  /* Inicio de sesión en el dominio */
  W.login = function (el) {
    el.innerHTML = '<div class="w-login">' + win('Windows 11 · LOGITRANS', '<div class="lg-s"><div class="av"></div><b class="who">Otro usuario</b><input class="u" value="LOGITRANS\\admin.rrhh" spellcheck="false"><input class="p" type="password" value="********"><button class="btn sm sun go">Iniciar sesión</button><p class="lg-m">Iniciar sesión en: LOGITRANS</p></div>', 'lg') + '<ol class="lg-f"><li>El PC manda las credenciales a SRV-AD (Kerberos).</li><li>El controlador valida la cuenta de la OU Administracio.</li><li>Llegan las GPO de usuario: Bloqueo-Pantalla, Redireccion-Docs y Unidades-Mapeadas.</li><li>Escritorio listo: Documentos en \\\\SRV-AD\\Perfiles y la unidad S:.</li></ol><div class="row-btn">' + run('WIN11|gpresult /r') + '</div></div>';
    LT.$('.go', el).onclick = function () {
      var lis = LT.$$('.lg-f li', el), u = LT.$('.u', el).value;
      LT.$('.who', el).textContent = /admin\.rrhh/i.test(u) ? 'Pablo Martin' : u.split('\\').pop();
      lis.forEach(function (l, i) { l.classList.remove('on'); setTimeout(function () { l.classList.add('on'); }, 450 * (i + 1)); });
      setTimeout(function () { LT.$('.lg', el).classList.add('in'); }, 2000);
    };
    bindRuns(el);
  };

  /* Wi-Fi: SSID por VLAN, PSK en PT y 802.1X en la real */
  W.dot1x = function (el) {
    var S = [['LogiTrans-Corp', 20, 'WPA2-Enterprise (802.1X) contra el NPS', 'WPA2-PSK · AES'], ['LogiTrans-Almacen', 30, 'WPA2-Enterprise (802.1X) contra el NPS', 'WPA2-PSK · AES'], ['LogiTrans-Invitados', 40, 'WPA2-PSK, sin cuenta del dominio', 'WPA2-PSK · AES']];
    el.innerHTML = '<div class="w-dot1x"><div class="seg"><button class="on" data-m="real">Instalación real</button><button data-m="pt">Packet Tracer</button></div><div class="dx-l"></div><div class="dx-f"><span>Portátil</span><i></i><span>AP</span><i></i><span>Controladora</span><i></i><span>NPS (SRV-AD)</span><i></i><span>Active Directory</span></div></div>';
    function paint(m) {
      LT.$$('.seg button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.m === m); });
      LT.$('.dx-l', el).innerHTML = S.map(function (s) { return '<div class="dx"><b>' + s[0] + '</b>' + LT.D.vl(s[1]) + '<span>' + (m === 'real' ? s[2] : s[3]) + '</span></div>'; }).join('');
      LT.$('.dx-f', el).classList.toggle('off', m !== 'real');
    }
    LT.$$('.seg button', el).forEach(function (b) { b.onclick = function () { paint(b.dataset.m); }; }); paint('real');
  };

  /* GPO: a quién se aplica cada una */
  W.gpo = function (el) {
    var G = LT.GPO_FULL || LT.GPOS.map(function (g) { return [g[0], g[1], '', g[2]]; });
    el.innerHTML = '<div class="w-gpo"><div class="gp-l">' + G.map(function (g, i) { return '<button data-i="' + i + '"><b>' + g[0] + '</b><small>' + (g[3] || '') + '</small></button>'; }).join('') + '</div><div class="gp-d"><span class="lbl">Elegí una GPO</span><p>Se enlazan al dominio o a una OU y llegan a cada equipo y usuario al iniciar.</p></div><div class="row-btn">' + run('WIN10|gpupdate /force') + run('WIN11|gpresult /r') + '</div></div>';
    LT.$$('.gp-l button', el).forEach(function (b) { b.onclick = function () { var g = G[+b.dataset.i]; LT.$$('.gp-l button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); LT.$('.gp-d', el).innerHTML = '<span class="lbl">' + g[0] + ' · ' + (g[3] || '') + '</span><p><b>Qué hace.</b> ' + g[1] + '</p>' + (g[2] ? '<p><b>Por qué.</b> ' + g[2] + '</p>' : ''); }; });
    bindRuns(el);
  };

  /* Docker: nginx reparte, nadie más publica puertos */
  W.docker = function (el) {
    var C = LT.DOCKER;
    el.innerHTML = '<div class="w-docker"><div class="dk-net"><span class="lbl">Red interna de Docker</span><div class="dk-in">' + C.map(function (c) { return '<div class="ct ' + (c.pub ? 'pub' : '') + '" data-n="' + c.name + '"><b>' + c.name + '</b><code>' + c.image + '</code><small>' + c.port + '</small></div>'; }).join('') + '</div></div><div class="dk-req"><span class="lbl">Petición desde Internet</span><div class="seg"><button data-u="/">logitrans.com/</button><button data-u="/clients">/clients</button><button data-u=":3306">:3306 (base de datos)</button><button data-u=":8096">:8096 (Jellyfin)</button></div><p class="dk-o">Solo nginx publica 80 y 443. Elegí una petición.</p></div><div class="row-btn">' + run('HOST|docker compose ps') + '</div></div>';
    LT.$$('.dk-req button', el).forEach(function (b) {
      b.onclick = function () {
        var u = b.dataset.u, path = u === '/' ? ['nginx', 'wordpress', 'db'] : u === '/clients' ? ['nginx', 'clients'] : [];
        LT.$$('.ct', el).forEach(function (c) { c.classList.toggle('hit', path.indexOf(c.dataset.n) >= 0); c.classList.remove('blk'); });
        LT.$$('.dk-req button', el).forEach(function (x) { x.classList.toggle('on', x === b); });
        if (!path.length) { LT.$('[data-n="' + (u === ':3306' ? 'db' : 'jellyfin') + '"]', el).classList.add('blk'); }
        LT.$('.dk-o', el).innerHTML = u === '/' ? 'nginx → wordpress (PHP-FPM 9000) → db (3306). La base de datos solo la ve WordPress.' : u === '/clients' ? 'nginx ve que empieza por /clients y lo manda a la aplicación de clientes (Gunicorn 8000).' : '<span class="chip bad">Sin respuesta</span> Ese puerto no está publicado: desde fuera no se llega al contenedor.';
      };
    });
    bindRuns(el);
  };

  /* WAF Wordfence */
  W.waf = function (el) {
    var R = [['GET /?id=1 OR 1=1', 'sqli', 'Inyección SQL'], ['GET /?q=<script>alert(1)</script>', 'xss', 'Cross-site scripting'], ['GET /?page=../../wp-config.php', 'lfi', 'Inclusión de archivos'], ['POST /wp-login.php ×20 (contraseña mala)', 'bf', 'Fuerza bruta'], ['GET /servicios/', 'ok', 'Petición normal']];
    el.innerHTML = '<div class="w-waf"><div class="wf-st"><div><span class="lbl">Firewall</span><b>Modo básico 35 %</b></div><div><span class="lbl">Reglas de la comunidad</span><b>70 %</b></div><div><span class="lbl">Fuerza bruta</span><b>100 %</b></div><div><span class="lbl">Licencia</span><b>Free</b></div></div><div class="wf-r">' + R.map(function (r, i) { return '<button data-i="' + i + '"><code>' + esc(r[0]) + '</code><small>' + r[2] + '</small></button>'; }).join('') + '</div><pre class="wf-log">Wordfence · registro en vivo</pre></div>';
    var log = LT.$('.wf-log', el);
    LT.$$('.wf-r button', el).forEach(function (b) { b.onclick = function () { var r = R[+b.dataset.i], t = new Date().toTimeString().slice(0, 8); log.textContent = t + '  ' + r[0] + '\n' + (r[1] === 'ok' ? '        200 OK · WordPress responde' : r[1] === 'bf' ? '        Bloqueado: «Locked out from logging in for using an invalid username» · IP bloqueada' : '        403 Forbidden · «A potentially unsafe operation has been detected in your request to this site» (' + r[2] + ')') + '\n' + log.textContent.split('\n').slice(0, 6).join('\n'); b.classList.add(r[1] === 'ok' ? 'pass' : 'blk'); }; });
  };

  /* Área de clientes: réplica con la paleta de la web corporativa */
  var SHIP = [
    ['LT-2026-0103', 'Mobiliario de oficina', 'Barcelona', 'Madrid', 'EN ALMACÉN (ZARAGOZA)', 'info', '10 NOV 2026'],
    ['LT-2026-0102', 'Cajas de componentes electrónicos', 'Zaragoza', 'Valencia', 'EN TRÁNSITO', 'fill', '9 NOV 2026'],
    ['LT-2026-0101', 'Palés de material de embalaje', 'Barcelona', 'Zaragoza', 'ENTREGADO', 'ok', '28 OCT 2026']
  ];
  W.portal = function (el) {
    var fails = 0, lockUntil = 0;
    el.innerHTML = '<div class="w-portal"><div class="pt-bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">https://logitrans.com/clients</span></div><div class="pt-v"></div></div>';
    var v = LT.$('.pt-v', el), bar = LT.$('.url', el);
    function login(msg) {
      bar.textContent = 'https://logitrans.com/clients/login';
      v.innerHTML = '<div class="pt-login"><span class="k">Área de clientes</span><h4>Acceso privado</h4><p>Consultá el estado de tus envíos.</p><form><label>Usuario<input name="u" autocomplete="off" value="cliente1"></label><label>Contraseña<input name="p" type="password" autocomplete="off" placeholder="demo"></label>' + (msg ? '<p class="err">' + msg + '</p>' : '') + '<button class="btn sun">Entrar</button></form></div>';
      LT.$('form', v).onsubmit = function (e) {
        e.preventDefault();
        if (Date.now() < lockUntil) return login('Demasiados intentos. Espera ' + Math.ceil((lockUntil - Date.now()) / 1000) + ' segundos.');
        var u = this.u.value.trim(), p = this.p.value;
        if (u === 'cliente1' && p === 'demo') { fails = 0; return panel(); }
        fails++;
        if (fails >= 5) { lockUntil = Date.now() + 60000; fails = 0; return login('Demasiados intentos. Espera 60 segundos.'); }
        login('Usuario o contraseña incorrectos. Intento ' + fails + ' de 5.');
      };
    }
    function panel() {
      bar.textContent = 'https://logitrans.com/clients/panel';
      v.innerHTML = '<div class="pt-panel"><header><div><span class="k">Hola, Marta</span><h4>Transportes Norte S.L.</h4></div><button class="link out">Cerrar sesión</button></header><span class="k">Tus envíos</span><div class="pt-list">' + SHIP.map(function (s) { return '<button class="sh" data-r="' + s[0] + '"><b>' + s[0] + '</b><span>' + s[1] + '</span><small>' + s[2] + ' → ' + s[3] + '</small><span class="chip ' + s[5] + '">' + s[4] + '</span><small class="d">' + s[6] + '</small></button>'; }).join('') + '</div><p class="hint">Probá también un envío que no es tuyo: <button class="link try">LT-2026-0201</button></p></div>';
      LT.$('.out', v).onclick = function () { login(); };
      LT.$$('.sh', v).forEach(function (b) { b.onclick = function () { detail(b.dataset.r); }; });
      LT.$('.try', v).onclick = function () { detail('LT-2026-0201'); };
    }
    function detail(ref) {
      bar.textContent = 'https://logitrans.com/clients/envio/' + ref;
      var s = SHIP.filter(function (x) { return x[0] === ref; })[0];
      if (!s) {
        v.innerHTML = '<div class="pt-404"><b>404</b><p>Este envío no existe.</p><pre>clients-1  | ' + new Date().toISOString().slice(0, 19).replace('T', ' ') + ' WARNING ENVIO_NO_AUTORIZADO usuario=cliente1 ref=\'' + ref + '\'</pre><p class="hint">La aplicación responde como si no existiera y apunta el intento en el registro.</p><button class="link back">Volver al panel</button></div>';
      } else {
        var stp = ['Recogido', 'En almacén', 'En tránsito', 'Entregado'], k = s[5] === 'ok' ? 3 : s[5] === 'fill' ? 2 : 1;
        v.innerHTML = '<div class="pt-det"><span class="k">Envío</span><h4>' + s[0] + '</h4><p>' + s[1] + ' · ' + s[2] + ' → ' + s[3] + '</p><svg class="fig1" viewBox="0 0 300 70"><path d="M10 50 h140 v-26 h40 l20 14 v12 h-200 z" /><circle cx="50" cy="54" r="7"/><circle cx="170" cy="54" r="7"/><path d="M150 32 h28 l12 10" /></svg><span class="lbl">FIG. 1 · ' + s[4] + '</span><ol class="tl">' + stp.map(function (x, i) { return '<li class="' + (i <= k ? 'on' : '') + '">' + x + '</li>'; }).join('') + '</ol><button class="link back">Volver al panel</button></div>';
      }
      LT.$('.back', v).onclick = panel;
    }
    login();
  };

  /* RAID 5 con paridad */
  W.raid = function (el) {
    var blocks = [['A1', 'A2', 'Ap'], ['B1', 'Bp', 'B2'], ['Cp', 'C1', 'C2'], ['D1', 'D2', 'Dp']];
    el.innerHTML = '<div class="w-raid"><div class="rd-v"><span class="lbl">Disco-Datos · Parity · volumen R: (Datos-RAID)</span><b class="rd-st">Correcto</b></div><div class="rd-d">' + [0, 1, 2].map(function (d) { return '<button class="disk" data-d="' + d + '"><span class="lbl">Disco ' + (d + 1) + ' · 5 GB</span>' + blocks.map(function (b) { return '<i class="' + (/p$/.test(b[d]) ? 'p' : '') + '">' + b[d] + '</i>'; }).join('') + '<small>Clic para romperlo</small></button>'; }).join('') + '</div><p class="rd-m">Datos y paridad repartidos entre los tres discos del Pool-RAID. Si falta uno, la paridad reconstruye lo que falta.</p><div class="row-btn">' + run('SRV-AD|Get-PhysicalDisk') + '</div></div>';
    var dead = {};
    LT.$$('.disk', el).forEach(function (b) {
      b.onclick = function () {
        dead[b.dataset.d] = !dead[b.dataset.d]; b.classList.toggle('dead', !!dead[b.dataset.d]);
        var n = Object.keys(dead).filter(function (k) { return dead[k]; }).length, st = LT.$('.rd-st', el), m = LT.$('.rd-m', el);
        LT.$('.w-raid', el).className = 'w-raid s' + n;
        st.textContent = n === 0 ? 'Correcto' : n === 1 ? 'Degradado, pero funcionando' : 'Volumen perdido';
        m.textContent = n === 0 ? 'Datos y paridad repartidos entre los tres discos del Pool-RAID. Si falta uno, la paridad reconstruye lo que falta.' : n === 1 ? 'Es lo que probamos en VirtualBox: quitamos un disco con el servidor encendido y R: siguió abierto. Se cambia el disco y se reconstruye.' : 'RAID 5 aguanta un disco, no dos. Por eso además hay copias de seguridad.';
      };
    });
    bindRuns(el);
  };

  /* Robo del disco cifrado */
  W.theft = function (el) {
    el.innerHTML = '<div class="w-theft">' + win('Ubuntu · Archivos', '<div class="th-s"><div class="th-d"><span class="dsk"></span><b>Volumen de 50 GB</b><small>BitLocker</small></div><div class="th-a"><p>Este volumen está cifrado. Escribí la contraseña para desbloquearlo.</p><input type="password" placeholder="Contraseña"><button class="btn sm">Desbloquear</button><p class="th-m"></p></div><pre class="th-hex"></pre></div>', 'th') + '<div class="row-btn">' + run('WIN10|manage-bde -status') + '</div></div>';
    var hex = function () { var s = ''; for (var i = 0; i < 6; i++) { s += ('0000' + (i * 16).toString(16)).slice(-5) + '  '; for (var j = 0; j < 16; j++) s += ('0' + Math.floor(Math.random() * 256).toString(16)).slice(-2) + ' '; s += '\n'; } return s; };
    LT.$('.th-hex', el).textContent = '-FVE-FS-  (cabecera de BitLocker)\n' + hex();
    LT.$('.th-a button', el).onclick = function () { var m = LT.$('.th-m', el); m.innerHTML = '<span class="chip bad">No se puede montar</span> Sin la contraseña ni la clave de recuperación de 48 dígitos solo hay datos cifrados con XTS-AES 128.'; LT.$('.th-hex', el).textContent = '-FVE-FS-  (cabecera de BitLocker)\n' + hex(); };
    bindRuns(el);
  };

  /* Dónde viven los documentos */
  W.docflow = function (el) {
    el.innerHTML = '<div class="w-doc"><div class="df pc"><span class="lbl">PC del usuario</span><b>Documentos</b><b>S:</b><small>Nada se queda en el disco local</small></div><div class="df ar"><i></i><small>GPO-Redireccion-Docs<br>GPO-Unidades-Mapeadas</small></div><div class="df sv"><span class="lbl">SRV-AD · volumen R:</span><b>\\\\SRV-AD\\Perfiles</b><b>R:\\Departaments</b><div class="tags"><span class="chip ok">RAID 5</span><span class="chip ok">BitLocker</span><span class="chip info">NTFS por grupo</span></div></div><button class="btn sm ghost st">Roban el portátil</button><p class="df-m"></p></div>';
    LT.$('.st', el).onclick = function () { LT.$('.w-doc', el).classList.toggle('stolen'); LT.$('.df-m', el).textContent = LT.$('.w-doc', el).classList.contains('stolen') ? 'El ladrón se lleva un disco cifrado y sin documentos. El usuario entra desde otro PC y encuentra todo igual.' : ''; };
  };

  /* Firewall local */
  W.fwlocal = function (el) {
    var rules = [['DNS (UDP-In)', 'udp', 53, 1], ['DNS (RPC)', 'tcp', 135, 1], ['File and Printer Sharing (SMB-In)', 'tcp', 445, 1], ['File and Printer Sharing (Echo Request)', 'icmp', 0, 1], ['File and Printer Sharing (NB-Session-In)', 'tcp', 139, 1], ['Core Networking (DHCP-In)', 'udp', 68, 1], ['Core Networking (ICMPv6)', 'icmp6', 0, 1], ['Network Policy Server (RADIUS Authentication)', 'udp', 1812, 1]];
    var probes = [['DNS 53/udp', 'udp', 53], ['SMB 445/tcp', 'tcp', 445], ['RADIUS 1812/udp', 'udp', 1812], ['RDP 3389/tcp', 'tcp', 3389], ['HTTP 80/tcp', 'tcp', 80], ['Telnet 23/tcp', 'tcp', 23]];
    el.innerHTML = '<div class="w-fwl"><div class="fw-p"><span><b>Dominio</b><i class="chip ok">Activado</i></span><span><b>Privado</b><i class="chip ok">Activado</i></span><span><b>Público</b><i class="chip ok">Activado</i></span><small>Entrada: bloquear por defecto · llega por GPO-LogiTrans-Seguridad</small></div><ul class="fw-r">' + rules.map(function (r) { return '<li><i></i>' + r[0] + '</li>'; }).join('') + '</ul><div class="fw-t"><span class="lbl">Probá una conexión entrante a SRV-AD</span>' + probes.map(function (p, i) { return '<button class="chip" data-i="' + i + '">' + p[0] + '</button>'; }).join('') + '<p class="fw-o"></p></div></div>';
    LT.$$('.fw-t button', el).forEach(function (b) { b.onclick = function () { var p = probes[+b.dataset.i], hit = rules.filter(function (r) { return r[1] === p[1] && r[2] === p[2]; })[0]; LT.$$('.fw-r li', el).forEach(function (li, i) { li.classList.toggle('on', rules[i] === hit); }); LT.$('.fw-o', el).innerHTML = hit ? '<span class="chip ok">Permitido</span> por «' + hit[0] + '».' : '<span class="chip bad">Bloqueado</span> Ninguna regla lo permite: se aplica la política por defecto.'; }; });
  };

  /* Programación del antivirus */
  W.avsched = function (el) {
    var now = new Date(), next = [];
    for (var d = 0; d < 8; d++) { var x = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 5, 27); if (x > now) next.push([x, 'Diario 5:27']); if (x.getDay() === 5) { var f = new Date(x); f.setHours(20, 30); if (f > now) next.push([f, 'Viernes 20:30']); } }
    next.sort(function (a, b) { return a[0] - b[0]; });
    var days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    el.innerHTML = '<div class="w-av"><div class="av-h"><b>Windows Defender Scheduled Scan</b><span class="chip ok">Ready</span></div><div class="av-week">' + [1, 2, 3, 4, 5, 6, 0].map(function (k) { return '<div class="day' + (k === now.getDay() ? ' today' : '') + '"><span>' + days[k] + '</span><i class="d" style="--t:' + (5.45 / 24 * 100) + '%"></i>' + (k === 5 ? '<i class="w" style="--t:' + (20.5 / 24 * 100) + '%"></i>' : '') + '</div>'; }).join('') + '</div><p class="lbl">Próximos análisis</p><ol class="av-n">' + next.slice(0, 4).map(function (n) { return '<li><b>' + days[n[0].getDay()] + ' ' + n[0].getDate() + '/' + (n[0].getMonth() + 1) + ' ' + ('0' + n[0].getHours()).slice(-2) + ':' + ('0' + n[0].getMinutes()).slice(-2) + '</b><span>' + n[1] + '</span></li>'; }).join('') + '</ol></div>';
  };

  /* Registros del antivirus solo para Gestió */
  W.logs = function (el) {
    var U = [['admin.xarxa01', 'Grupo-Gestio', 99, true], ['admin.rrhh', 'Grupo-Administracio', 20, false], ['director.general', 'Grupo-Direccio', 10, false], ['operari.picking01', 'Grupo-Magatzem', 30, false]];
    el.innerHTML = '<div class="w-logs"><div class="lg-u">' + U.map(function (u, i) { return '<button data-i="' + i + '"><b>' + u[0] + '</b><small>' + u[1] + '</small>' + LT.D.vl(u[2]) + '</button>'; }).join('') + '</div>' + win('Explorador · \\\\SRV-AD\\Logs', '<div class="lg-o"><p class="muted">Elegí con qué usuario abrir la carpeta.</p></div>') + '</div>';
    LT.$$('.lg-u button', el).forEach(function (b) { b.onclick = function () { var u = U[+b.dataset.i]; LT.$$('.lg-u button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); LT.$('.lg-o', el).innerHTML = u[3] ? '<table class="t mini"><thead><tr><th>Nombre</th><th>Modificado</th></tr></thead><tbody><tr><td>MPLog-20261115-052701.log</td><td>15/11/2026 5:31</td></tr><tr><td>MPLog-20261114-203004.log</td><td>14/11/2026 20:41</td></tr><tr><td>MPDetection-20261114.log</td><td>14/11/2026 20:41</td></tr></tbody></table>' : '<div class="deny"><b>Acceso denegado</b><p>No tenés permiso para acceder a \\\\SRV-AD\\Logs. Solo Grupo-Gestio (lectura), SYSTEM y Administrators.</p></div>'; }; });
  };

  /* Repositorio de medios */
  W.repo = function (el) {
    var U = [['operari.picking01', 'Magatzem', false], ['admin.rrhh', 'Administracio', false], ['admin.xarxa01', 'Gestio', true]];
    var A = [['Abrir Manuales\\Manual-de-acceso-Wi-Fi-y-VPN.pdf', 'r'], ['Instalar Software\\vlc-3.0.23-win64.exe', 'r'], ['Borrar el manual', 'w'], ['Crear Software\\prueba', 'w']];
    el.innerHTML = '<div class="w-repo"><div class="rp-c"><label><span class="lbl">Usuario</span><select class="u">' + U.map(function (u, i) { return '<option value="' + i + '">' + u[0] + ' (' + u[1] + ')</option>'; }).join('') + '</select></label><div class="rp-a">' + A.map(function (a, i) { return '<button class="chip" data-i="' + i + '">' + a[0] + '</button>'; }).join('') + '</div></div><pre class="rp-o">PS C:\\Repositorio&gt;</pre><div class="row-btn">' + run('HOST|dir C:\\Repositorio') + '</div></div>';
    LT.$$('.rp-a button', el).forEach(function (b) { b.onclick = function () { var u = U[+LT.$('.u', el).value], a = A[+b.dataset.i], ok = a[1] === 'r' || u[2]; LT.$('.rp-o', el).textContent = 'PS C:\\Repositorio> whoami\nbywaake\\' + u[0] + '\nPS C:\\Repositorio> ' + a[0] + '\n' + (ok ? (a[1] === 'r' ? 'Correcto: todos pueden leer y ejecutar (RX).' : 'Correcto: Grupo-Gestio puede modificar (M).') : 'Acceso denegado a la ruta de acceso. Solo Grupo-Gestio puede modificar.'); LT.$('.rp-o', el).className = 'rp-o ' + (ok ? 'ok' : 'bad'); }; });
    bindRuns(el);
  };

  /* Jellyfin */
  W.jelly = function (el) {
    var libs = { alm1: ['Almacén', 'Formación'], admin: ['Administración', 'Almacén', 'Dirección', 'Formación'] };
    el.innerHTML = '<div class="w-jelly"><div class="seg"><button class="on" data-u="alm1">alm1 (almacén)</button><button data-u="admin">administrador</button></div><div class="jf"><div class="jf-libs"></div><div class="jf-play"><div class="scr"><span class="pl"></span><b>Bienvenida-nuevos-empleados</b><i class="bar"><em></em></i></div><ul class="jf-o"><li>Calidad: automática</li><li>Velocidad de reproducción</li><li>Subtítulos</li><li class="no">Descargar <small>desactivado para alm1</small></li><li class="no">Eliminar <small>sin permiso</small></li></ul></div></div></div>';
    function u(x) { LT.$$('.seg button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.u === x); }); LT.$('.jf-libs', el).innerHTML = ['Administración', 'Almacén', 'Dirección', 'Formación'].map(function (l) { var ok = libs[x].indexOf(l) >= 0; return '<div class="lib' + (ok ? '' : ' hid') + '"><span></span><b>' + l + '</b><small>' + (ok ? 'visible' : 'oculta para este usuario') + '</small></div>'; }).join(''); LT.$$('.jf-o .no', el).forEach(function (li) { li.classList.toggle('adm', x === 'admin'); }); }
    LT.$$('.seg button', el).forEach(function (b) { b.onclick = function () { u(b.dataset.u); }; });
    LT.$('.scr', el).onclick = function () { this.classList.toggle('playing'); };
    u('alm1');
  };

  /* FOG: captura y despliegue */
  W.fog = function (el) {
    el.innerHTML = '<div class="w-fog"><div class="fg-n"><div class="h m"><b>master-win</b><small>equipo maestro · Windows 10</small></div><div class="srv"><b>FOG</b><small>192.168.50.1</small><div class="img"><span>win10-base</span><i></i></div></div><div class="h n"><b>pc-nuevo01</b><small>equipo nuevo · arranque PXE</small></div></div><div class="row-btn"><button class="btn sm sun cap">1. Capture de master-win</button><button class="btn sm ghost dep" disabled>2. Deploy a pc-nuevo01</button></div><ol class="fg-t"></ol></div>';
    var t = LT.$('.fg-t', el), w = LT.$('.w-fog', el);
    function task(name, fn) { var li = LT.h('li', { html: '<b>' + name + '</b><i class="bar"><em></em></i><span>En cola</span>' }); t.appendChild(li); setTimeout(function () { li.classList.add('run'); LT.$('span', li).textContent = 'En curso'; }, 200); setTimeout(function () { li.classList.add('done'); LT.$('span', li).textContent = 'Complete'; fn(); }, LT.reduce ? 300 : 2600); }
    LT.$('.cap', el).onclick = function () { this.disabled = true; w.classList.add('c1'); task('Capture · master-win → win10-base', function () { w.classList.add('img-on'); LT.$('.dep', el).disabled = false; }); };
    LT.$('.dep', el).onclick = function () { this.disabled = true; w.classList.add('c2'); task('Deploy · win10-base → pc-nuevo01', function () { w.classList.add('done'); }); };
  };
})();
