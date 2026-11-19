/* Web y aplicaciones: pila Docker, área de clientes jugable, WAF, repositorio y FOG */
(function () {
  var LT = window.LT, fails = 0, lockT = null, user = null;

  /* ---------- docker compose ---------- */
  function stack(up) {
    var box = LT.$('#stack'); box.innerHTML = '';
    var net = LT.h('div.dk-net.mono', { text: 'red interna de Docker · logitrans_backend' });
    LT.DOCKER.forEach(function (c, i) {
      box.appendChild(LT.h('div.ct' + (c.pub ? '.pub' : '') + (up ? '.up' : ''), { style: { '--d': (i * 260) + 'ms' } }, [
        LT.h('i.ct-led'), LT.h('b.mono', { text: c.name }), LT.h('span.mono.muted', { text: c.image }),
        LT.h('em.mono', { text: c.pub ? c.port + ' publicado' : c.port + ' interno' }), LT.h('small', { text: c.role })
      ]));
    });
    box.appendChild(net);
  }
  function stackUp() {
    stack(false);
    var cts = LT.$$('#stack .ct');
    cts.forEach(function (c, i) {
      c.classList.add('pull');
      setTimeout(function () { c.classList.remove('pull'); c.classList.add('up'); LT.audio && LT.audio.blip(); }, LT.reduce ? 0 : 400 + i * 380);
    });
    setTimeout(function () { LT.toast('5 contenedores healthy · solo nginx escucha hacia fuera'); }, LT.reduce ? 0 : 400 + cts.length * 380);
  }

  /* ---------- Área de clientes ---------- */
  var ENVIOS = [
    ['LT-2026-0114', 'Palés de bebidas (12)', 'Zaragoza → Bilbao', 'En tránsito', 'w'],
    ['LT-2026-0119', 'Electrodomésticos (8)', 'Barcelona → Zaragoza', 'En almacén', 's'],
    ['LT-2026-0097', 'Material de oficina (3)', 'Barcelona → Huesca', 'Entregado', 'ok']
  ];
  function portal(view) {
    var p = LT.$('#portal'); p.innerHTML = '';
    var bar = LT.h('div.pt-bar.mono', {}, [LT.h('i.lock'), LT.h('span', { text: 'https://logitrans.com/clients' + (view === 'panel' ? '/panel' : view === '404' ? '/envio/LT-2026-0201' : '') })]);
    p.appendChild(bar);
    var body = LT.h('div.pt-body');
    p.appendChild(body);
    if (view === 'panel') {
      body.innerHTML = '<div class="pt-h"><div><b>Transportes Norte S.L.</b><span>Contacto: Marta · usuario cliente1</span></div><button class="btn small ghost" id="pt-out">Salir</button></div>' +
        '<div class="pt-stats"><div><b>3</b><span>envíos</span></div><div><b>2</b><span>en curso</span></div><div><b>1</b><span>entregado</span></div></div>' +
        '<table class="w-t pt-t"><thead><tr><th>Referencia</th><th>Mercancía</th><th>Ruta</th><th>Estado</th></tr></thead><tbody>' +
        ENVIOS.map(function (e) { return '<tr><td class="mono">' + e[0] + '</td><td>' + e[1] + '</td><td>' + e[2] + '</td><td><span class="st ' + e[4] + '">' + e[3] + '</span></td></tr>'; }).join('') +
        '</tbody></table><div class="pt-try">Probá cambiar la URL a un envío que no es tuyo: <button class="btn small sig" id="pt-idor">/clients/envio/LT-2026-0201</button></div>';
      LT.$('#pt-out').onclick = function () { user = null; portal('login'); };
      LT.$('#pt-idor').onclick = function () { portal('404'); };
      return;
    }
    if (view === '404') {
      body.innerHTML = '<div class="pt-404"><b>404</b><p>No hemos encontrado lo que buscas.</p><small class="muted">No dice si el envío existe. Es de otro cliente.</small></div>' +
        '<div class="term mt-s"><pre class="mini"><span class="t-dim">PS&gt; docker compose logs clients | Select-String ENVIO_NO_AUTORIZADO</span>\n<span class="t-warn">' + new Date().toISOString().slice(0, 19).replace('T', ' ') + ' ENVIO_NO_AUTORIZADO usuario=cliente1 ref=\'LT-2026-0201\'</span></pre></div>' +
        '<button class="btn small ghost mt-s" id="pt-back">Volver al panel</button>';
      LT.$('#pt-back').onclick = function () { portal('panel'); };
      LT.audio && LT.audio.bad();
      return;
    }
    body.innerHTML = '<div class="pt-login"><b class="pt-logo">LOGITRANS <span>· Clientes</span></b><p class="muted small">Acceso privado. No es el login de WordPress: otra aplicación, otro contenedor, otros usuarios.</p>' +
      '<label>Usuario<input id="pt-u" class="mono" value="cliente1" autocomplete="off"></label><label>Contraseña<input id="pt-p" type="password" class="mono" placeholder="demo" autocomplete="off"></label>' +
      '<button class="btn sig" id="pt-go">Entrar</button><div class="pt-msg" id="pt-msg"></div><p class="muted small">Contraseña de la demo: <span class="mono">demo</span>. Probá equivocarte cinco veces.</p></div>';
    LT.$('#pt-go').onclick = login;
    LT.$('#pt-p').addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });
    if (lockT) lockMsg();
  }
  function login() {
    var msg = LT.$('#pt-msg');
    if (lockT) return;
    var u = LT.$('#pt-u').value.trim(), pw = LT.$('#pt-p').value;
    if (u === 'cliente1' && pw === 'demo') { fails = 0; user = u; LT.audio && LT.audio.ok(); portal('panel'); return; }
    fails++;
    LT.audio && LT.audio.bad();
    LT.$('#pt-p').value = '';
    if (fails >= 5) { lock(60); return; }
    msg.className = 'pt-msg bad'; msg.textContent = 'Usuario o contraseña incorrectos. (' + fails + ' de 5)';
  }
  function lock(s) {
    var left = s;
    lockT = setInterval(function () {
      left--;
      if (left <= 0) { clearInterval(lockT); lockT = null; fails = 0; var m = LT.$('#pt-msg'); if (m) { m.className = 'pt-msg'; m.textContent = 'Ya podés volver a intentarlo.'; } return; }
      lockMsg(left);
    }, 1000);
    lockMsg(left);
  }
  function lockMsg(left) {
    var m = LT.$('#pt-msg'); if (!m) return;
    m.className = 'pt-msg lock';
    m.innerHTML = '<b>Demasiados intentos. Espera 60 segundos.</b>' + (left ? '<span class="mono">' + left + ' s</span>' : '');
  }

  /* ---------- WAF ---------- */
  function waf() {
    var rows = [['Reglas de la comunidad', 70, 'Firewall activado. Versión Free: reglas con 30 días de retraso'], ['Fuerza bruta', 100, 'Protección completa contra intentos de login'], ['WAF', 35, 'Modo básico. Al 100 %: protección ampliada, antes que WordPress']];
    LT.$('#waf').innerHTML = rows.map(function (r, i) {
      return '<div class="wm"><div class="wm-h"><b>' + r[0] + '</b><span class="mono">' + r[1] + ' %</span></div><div class="wm-bar"><i style="--w:' + r[1] + '%;--d:' + (i * 150) + 'ms"></i></div><small class="muted">' + r[2] + '</small></div>';
    }).join('');
  }
  /* ---------- Repositorio ---------- */
  function repo() {
    var dirs = [['Documentos', 'Procedimientos, políticas y plantillas'], ['ImagenesSO', 'Las imágenes que usa FOG'], ['Manuales', 'Acceso al Wi-Fi y a la VPN'], ['Software', 'VLC, 7-Zip: solo lo autorizado'], ['Videos', 'Formación, por Jellyfin']];
    var box = LT.$('#repo');
    box.innerHTML = '<div class="rp-path mono">\\\\SRV-HV02\\Repositorio</div><div class="rp-dirs">' + dirs.map(function (d) { return '<button class="rp-d" data-d="' + d[0] + '"><i></i><b>' + d[0] + '</b><span>' + d[1] + '</span></button>'; }).join('') + '</div>' +
      '<div class="rp-acl mono"><span class="ok">Grupo-Gestio · M</span><span>Usuarios · RX</span><span class="muted">SYSTEM, Admin · F</span></div><pre class="mini rp-out" id="rp-out"></pre>';
    LT.$$('.rp-d', box).forEach(function (b) {
      b.onclick = function () {
        var d = b.dataset.d, out = LT.$('#rp-out');
        if (d === 'Videos') {
          out.innerHTML = '<span class="t-sig">Jellyfin · usuario alm1</span>\n▶ Seguridad en el muelle de carga.mp4  <span class="t-ok">streaming</span>\n<span class="t-bad">Descargar: deshabilitado por el administrador</span>';
        } else {
          out.innerHTML = '<span class="t-dim">PS (operari.picking01)&gt; del C:\\Repositorio\\' + d + '\\*</span>\n<span class="t-bad">Acceso denegado a la ruta de acceso.</span>\n<span class="t-ok">Puede leer y ejecutar, no borrar ni añadir.</span>';
        }
        LT.audio && LT.audio.click();
      };
    });
  }
  /* ---------- FOG ---------- */
  function fog() {
    var box = LT.$('#fog');
    box.innerHTML = '<div class="fog-row"><div class="fog-pc m"><b>master-win</b><span>Capture</span></div><div class="fog-srv"><b>FOG</b><span class="mono">win10-base · 7 GiB</span></div><div class="fog-pc n" id="fog-n"><b>pc-nuevo01</b><span>Deploy</span><i class="fog-bar"><i id="fog-p"></i></i></div></div>' +
      '<div class="fog-log mono" id="fog-log">PXE · Partclone · Multi-Cast si llegan muchos equipos a la vez</div><button class="btn small" id="fog-go">Desplegar en pc-nuevo01</button>';
    LT.$('#fog-go').onclick = deploy;
  }
  function deploy() {
    var p = LT.$('#fog-p'), log = LT.$('#fog-log'), n = LT.$('#fog-n'); if (!p) return;
    var msgs = ['PXE boot · DHCP 192.168.50.x · next-server FOG', 'iPXE · menú FOG · tarea Deploy encontrada', 'Partclone · restaurando /dev/sda2 (NTFS)', 'Imagen restaurada · reiniciando', 'Windows 10 listo · se une al dominio logitrans.local'];
    var k = 0; n.classList.remove('done'); n.classList.add('run');
    (function f() {
      if (!p.isConnected) return;
      p.style.width = (k / (msgs.length - 1) * 100) + '%';
      log.textContent = msgs[k];
      if (++k < msgs.length) setTimeout(f, LT.reduce ? 0 : 900);
      else { n.classList.remove('run'); n.classList.add('done'); LT.audio && LT.audio.ok(); }
    })();
  }

  LT.scene('web', {
    steps: 3,
    init: function () {
      stack(false); portal('login'); waf(); repo(); fog();
      LT.$('#stack-up').onclick = stackUp;
    },
    enter: function () { if (!(LT.pres && LT.pres.active) && !LT.$('#stack .ct.up')) setTimeout(stackUp, 400); },
    step: function (n) {
      if (n === 1) stackUp();
      if (n === 3) { deploy(); }
    }
  });
})();
