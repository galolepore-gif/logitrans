/* Widgets del capítulo 6: Nmap, WPScan, OWASP Top 10 y ataques de capa 2 y 3 */
(function () {
  var LT = window.LT, W = LT.W = LT.W || {}, esc = LT.esc, S = LT.NET.state;
  var run = function (r, t) { return '<button class="btn sm ghost tr-run" data-run="' + esc(r) + '">' + (t || 'Ejecutar en el Tracer') + '</button>'; };
  function bindRuns(el) { LT.$$('.tr-run', el).forEach(function (b) { b.onclick = function () { LT.Tracer.runInWindow(b.dataset.run); }; }); }
  /* '5.B2.2 · 3.C3' → enlaces a cada apartado */
  function refs(s) {
    return String(s).split(/\s*[·–]\s*/).map(function (r) {
      r = r.trim(); var p = r.split('.'), sec = p.slice(0, 2).join('.');
      return '<a class="ref" href="#/s/' + sec + (p.length > 2 ? '/' + r : '') + '">' + r + '</a>';
    }).join(' ');
  }

  /* Nmap: radar con los seis puertos abiertos, vista desde el laboratorio o desde Internet */
  W.nmap = function (el) {
    var view = 'lab';
    el.innerHTML = '<div class="w-nmap"><div class="nm-radar"><svg viewBox="-110 -110 220 220" aria-hidden="true">' +
      '<circle r="100" class="rg"/><circle r="66" class="rg"/><circle r="33" class="rg"/><line x1="-100" x2="100" class="rg"/><line y1="-100" y2="100" class="rg"/>' +
      '<g class="sweep"><path d="M0 0 L0 -100 A100 100 0 0 1 70.7 -70.7 Z"/></g><circle r="7" class="core"/><g class="blips"></g></svg>' +
      '<div class="nm-c"><b class="nm-n">0</b><small>puertos abiertos de 1.000</small></div></div>' +
      '<div class="nm-side"><div class="seg"><button data-v="lab" class="on">Desde el laboratorio</button><button data-v="inet">Desde Internet (ASA)</button></div>' +
      '<table class="t nm-t"><thead><tr><th>Puerto</th><th>Estado</th><th>Servicio</th><th>Versión</th></tr></thead><tbody></tbody></table>' +
      '<div class="nm-why note"><b class="t">Tocá un puerto</b><div>Cada puerto abierto es una puerta. Elegí uno para ver qué es y qué hicimos con él.</div></div>' +
      '<div class="row-btn"><button class="btn sm sun nm-scan">Escanear</button><button class="btn sm nm-fw">Aplicar LogiTrans-bloqueo-ASUS</button>' + run('HOST|nmap -sV 192.168.1.40', 'Nmap en la consola') + run('HOST|Get-NetTCPConnection -LocalPort 1042,7778 -State Listen', 'Ver quién escucha') + '</div></div></div>';
    var tb = LT.$('tbody', el), bl = LT.$('.blips', el), n = LT.$('.nm-n', el), why = LT.$('.nm-why', el);
    function state(p) {
      if (view === 'inet') return /^(80|443)\//.test(p.port) ? 'open' : 'filtered';
      if (S.fwAsus && p.keep === false) return 'filtered';
      return 'open';
    }
    function draw(anim) {
      tb.innerHTML = ''; bl.innerHTML = ''; var open = 0;
      LT.NMAP.forEach(function (p, i) {
        var st = state(p), a = (i / LT.NMAP.length) * Math.PI * 2 + 0.4, r = 40 + (i % 3) * 22;
        var x = Math.cos(a) * r, y = Math.sin(a) * r;
        var tr = LT.h('tr', { className: 'nm-r ' + st + (anim ? ' wait' : '') });
        tr.innerHTML = '<td class="m">' + p.port + '</td><td><span class="chip ' + (st === 'open' ? (p.keep === true ? 'ok' : 'warn') : 'info') + '">' + st + '</span></td><td class="m">' + p.svc + '</td><td>' + p.ver + '</td>';
        tr.onclick = function () { pick(i); };
        tb.appendChild(tr);
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'blip ' + st + (anim ? ' wait' : '')); g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
        g.innerHTML = '<circle r="6"/><text y="-10">' + p.port.split('/')[0] + '</text>';
        g.addEventListener('click', function () { pick(i); });
        bl.appendChild(g);
        if (st === 'open') open++;
        if (anim) setTimeout(function () { tr.classList.remove('wait'); g.classList.remove('wait'); n.textContent = LT.$$('.nm-r.open:not(.wait)', el).length; }, 350 + i * 420);
      });
      if (!anim) n.textContent = open;
    }
    function pick(i) {
      var p = LT.NMAP[i];
      LT.$$('.nm-r', el).forEach(function (r, k) { r.classList.toggle('sel', k === i); });
      LT.$$('.blip', el).forEach(function (r, k) { r.classList.toggle('sel', k === i); });
      why.innerHTML = '<b class="t">' + p.port + ' · ' + p.ver + '</b><div>' + p.why + '</div>';
      why.className = 'nm-why note ' + (p.keep === true ? 'ok' : p.keep === 'asa' ? 'info' : 'warn');
    }
    LT.$$('.seg button', el).forEach(function (b) { b.onclick = function () { view = b.dataset.v; LT.$$('.seg button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); el.firstChild.classList.toggle('inet', view === 'inet'); draw(true); }; });
    LT.$('.nm-scan', el).onclick = function () { el.firstChild.classList.remove('scan'); void el.firstChild.offsetWidth; el.firstChild.classList.add('scan'); draw(true); };
    var fw = LT.$('.nm-fw', el);
    function fwLabel() { fw.textContent = S.fwAsus ? 'Regla aplicada' : 'Aplicar LogiTrans-bloqueo-ASUS'; fw.disabled = !!S.fwAsus; }
    fw.onclick = function () { S.fwAsus = true; LT.emit('net'); fwLabel(); draw(true); pick(4); };
    LT.on('net', function () { if (el.isConnected) { fwLabel(); draw(false); } });
    fwLabel(); draw(false); bindRuns(el);
  };

  /* WPScan: dos pasadas, sin token y con token */
  W.wpscan = function (el) {
    var PASS = {
      no: { cmd: 'wpscan --url https://logitrans.com', req: 1725, sec: 11, items: [['info', 'URL', 'https://logitrans.com/ [85.100.1.18]'], ['info', 'Tema', 'logitrans, versión 2.0 (tema propio)'], ['ok', 'Usuarios', 'No Users Found'], ['warn', 'Base de datos', 'No WPScan API Token given: sin datos de vulnerabilidades']] },
      tok: { cmd: 'wpscan --url https://logitrans.com --disable-tls-checks --no-update --enumerate vp,vt,u --plugins-detection passive --format cli-no-color --api-token [OCULTO]', req: 1980, sec: 14, items: [['ok', 'Plugins vulnerables', 'No plugins Found'], ['ok', 'Temas vulnerables', 'No themes Found'], ['ok', 'Usuarios', 'No Users Found'], ['ok', 'Base de datos', 'WPScan DB API OK · plan free']] }
    };
    el.innerHTML = '<div class="w-wps"><div class="seg"><button data-k="no" class="on">1. Sin token</button><button data-k="tok">2. Con token de API</button></div>' +
      '<div class="wps-cmd m"></div><div class="wps-g"><div class="wps-meter"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="bg"/><circle cx="60" cy="60" r="50" class="fg"/></svg><div><b class="wps-r">0</b><small>peticiones</small><span class="wps-s">0 s</span></div></div><ul class="wps-l"></ul></div>' +
      '<div class="row-btn"><button class="btn sm sun go">Lanzar escaneo</button>' + run('HOST|wpscan --url https://logitrans.com', 'Sin token en la consola') + run('HOST|wpscan --url https://logitrans.com --enumerate vp,vt,u --api-token [OCULTO]', 'Con token en la consola') + '</div></div>';
    var k = 'no', fg = LT.$('.fg', el), L = 2 * Math.PI * 50, timer;
    fg.style.strokeDasharray = L; fg.style.strokeDashoffset = L;
    function show(anim) {
      var p = PASS[k]; clearInterval(timer);
      LT.$('.wps-cmd', el).textContent = '$ ' + p.cmd;
      var ul = LT.$('.wps-l', el); ul.innerHTML = p.items.map(function (it) { return '<li class="' + it[0] + (anim ? ' wait' : '') + '"><span>' + it[1] + '</span><b>' + it[2] + '</b></li>'; }).join('');
      var r = LT.$('.wps-r', el), s = LT.$('.wps-s', el), t = 0, steps = anim ? 40 : 1;
      timer = setInterval(function () {
        t++; var f = t / steps;
        r.textContent = Math.round(p.req * f).toLocaleString('es-ES'); s.textContent = Math.round(p.sec * f) + ' s';
        fg.style.strokeDashoffset = L * (1 - f * p.req / 2000);
        LT.$$('li', ul).forEach(function (li, i) { if (f >= (i + 1) / (p.items.length + 0.5)) li.classList.remove('wait'); });
        if (t >= steps) { clearInterval(timer); LT.$$('li', ul).forEach(function (li) { li.classList.remove('wait'); }); }
      }, 60);
    }
    LT.$$('.seg button', el).forEach(function (b) { b.onclick = function () { k = b.dataset.k; LT.$$('.seg button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); show(true); }; });
    LT.$('.go', el).onclick = function () { show(true); };
    show(false); bindRuns(el);
  };

  /* OWASP Top 10: diez cartas que se dan vuelta */
  W.owasp = function (el) {
    el.innerHTML = '<div class="w-owasp">' + LT.OWASP.map(function (o) {
      return '<button class="ow-c"><span class="ow-f"><b>' + o[0] + '</b><span>' + o[1] + '</span><small>Tocá para ver la defensa</small></span><span class="ow-b"><b>' + o[0] + ' · ' + o[1] + '</b><span>' + o[2] + '</span><small>' + refs(o[3]) + '</small></span></button>';
    }).join('') + '</div><div class="row-btn"><button class="btn sm ghost ow-all">Dar vuelta todas</button></div>';
    LT.$$('.ow-c', el).forEach(function (c) { c.onclick = function (e) { if (e.target.closest('a')) return; c.classList.toggle('flip'); }; });
    LT.$('.ow-all', el).onclick = function () { var any = LT.$$('.ow-c:not(.flip)', el).length; LT.$$('.ow-c', el).forEach(function (c, i) { setTimeout(function () { c.classList.toggle('flip', !!any); }, i * 60); }); };
  };

  /* Ataques de capa 2 y 3: el atacante lanza, la red responde */
  var RUN = { mac: 'BCN-P1-ACC1|show port-security interface fa0/3 @viol', rogue: 'BCN-P0-ACC1|show ip dhcp snooping', starv: 'BCN-P0-ACC1|show ip dhcp snooping', arp: 'BCN-P0-ACC1|show ip dhcp snooping binding', stp: 'BCN-P0-ACC1|show spanning-tree', hop: 'BCN-P1-ACC1|show interfaces trunk', spoof: 'BCN-FW|show access-list', route: 'BCN-RT1|show ip ospf neighbor', mitm: 'BCN-RT1|show crypto ipsec sa', lateral: 'P0-INV-01|ping 10.1.50.10' };
  var SCN = { mac: 'intruso', rogue: 'rogue', starv: 'rogue', stp: 'bpdu', hop: 'trunk', route: 'ospf', mitm: 'vpn', lateral: 'acl-inv', spoof: 'nat', arp: 'l2check' };
  W.attacks = function (el, o) {
    var list = LT.ATTACKS.filter(function (a) { return !o.layer || a.layer === o.layer; });
    el.innerHTML = '<div class="w-atk"><div class="atk-tabs">' + list.map(function (a, i) { return '<button data-i="' + i + '"' + (i ? '' : ' class="on"') + '><small>Capa ' + a.layer + '</small>' + a.name + '</button>'; }).join('') + '</div><div class="atk-stage"></div></div>';
    var st = LT.$('.atk-stage', el), tok = 0;
    function show(i, go) {
      var a = list[i], my = ++tok, can = LT.Tracer && LT.Tracer.can(RUN[a.id]);
      LT.$$('.atk-tabs button', el).forEach(function (b) { b.classList.toggle('on', +b.dataset.i === i); });
      st.innerHTML = '<div class="atk-g"><div class="atk-side bad"><span class="lbl">Ataque</span><h4>' + a.name + '</h4><p>' + a.how + '</p><div class="atk-term"><div class="xw-h"><i></i><i></i><i></i><span>atacante</span></div><pre class="m"><span class="pr">$ </span><span class="ty"></span></pre></div></div>' +
        '<div class="atk-mid"><div class="atk-shield"><svg viewBox="0 0 60 70"><path d="M30 3 L56 13 V34 C56 50 44 62 30 67 C16 62 4 50 4 34 V13 Z"/></svg></div></div>' +
        '<div class="atk-side good"><span class="lbl">Defensa · ' + refs(a.ref) + '</span><h4>' + a.def + '</h4><p>' + a.defHow + '</p><div class="atk-log m"></div></div></div>' +
        '<div class="row-btn"><button class="btn sm sun go">Lanzar el ataque</button>' + (can ? run(RUN[a.id], 'Verlo en el Tracer') : '') + (SCN[a.id] ? '<button class="btn sm ghost" data-sc="' + SCN[a.id] + '">Escenario completo</button>' : '') + '</div>';
      bindRuns(st);
      LT.$$('[data-sc]', st).forEach(function (b) { b.onclick = function () { location.hash = '#/tracer/' + b.dataset.sc; }; });
      LT.$('.go', st).onclick = function () { show(i, true); };
      if (!go) return;
      var ty = LT.$('.ty', st), log = LT.$('.atk-log', st), g = LT.$('.atk-g', st), k = 0;
      g.classList.add('fire');
      (function type() {
        if (my !== tok) return;
        ty.textContent = a.cmd.slice(0, ++k);
        if (k < a.cmd.length) return setTimeout(type, LT.reduce ? 0 : 22);
        g.classList.add('hit');
        /* Los ataques de capa 2 también ocurren en el modelo: el Tracer los ve */
        var C = LT.CLI;
        if (a.id === 'mac') { LT.ACTS.intruder(); C.l2('P1-ADM-03'); }
        if (a.id === 'stp') C.bpdu();
        if (a.id === 'rogue') C.rogueDhcp();
        a.logs.forEach(function (l, j) { setTimeout(function () { if (my !== tok) return; log.appendChild(LT.h('div', { text: l })); if (j === a.logs.length - 1) g.classList.add('held'); }, 500 + j * 650); });
      })();
    }
    LT.$$('.atk-tabs button', el).forEach(function (b) { b.onclick = function () { show(+b.dataset.i); }; });
    show(0);
  };
})();
