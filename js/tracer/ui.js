/* LogiTrans Tracer · interfaz
   Mapa lógico en SVG, ventanas de equipo (Físico, Config, CLI, Escritorio), modo tiempo real y simulación,
   herramienta PDU, reproductor de escenarios y la ventana emergente de «Ejecutar en el Tracer». */
(function () {
  var LT = window.LT, N = LT.NET, S = N.state, C = LT.CLI;
  var T = LT.Tracer = { maps: [], sim: false, playing: true, events: [] };
  var NS = 'http://www.w3.org/2000/svg';
  var esc = LT.esc;
  T.can = function (run) { return C.can(run); };

  /* ---------- Iconos (trazo de plano) ---------- */
  function icon(d) {
    var t = d.type, isp = d.site === 'INET';
    if (t === 'rt') return '<circle r="21" class="i-body' + (isp ? ' isp' : '') + '"/><path d="M-11 -4 h22 m-5 -5 l5 5 l-5 5 M11 4 h-22 m5 -5 l-5 5 l5 5" class="i-ln"/>';
    if (t === 'l3') return '<rect x="-26" y="-17" width="52" height="34" rx="3" class="i-body core"/><path d="M-16 -6 h32 m-5 -4 l5 4 l-5 4 M16 6 h-32 m5 -4 l-5 4 l5 4" class="i-ln"/>';
    if (t === 'sw') return '<rect x="-26" y="-12" width="52" height="24" rx="3" class="i-body"/><path d="M-16 -4 h32 m-4 -3 l4 3 l-4 3 M16 4 h-32 m4 -3 l-4 3 l4 3" class="i-ln"/>';
    if (t === 'fw') return '<rect x="-24" y="-17" width="48" height="34" rx="2" class="i-body fw"/><path d="M-24 -6 h48 M-24 5 h48 M-8 -17 v11 M10 -17 v11 M0 -6 v11 M-16 -6 v11 M16 -6 v11 M-8 5 v12 M10 5 v12" class="i-ln thin"/>';
    if (t === 'pc') return '<rect x="-17" y="-15" width="34" height="23" rx="2" class="i-body"/><rect x="-13" y="-11" width="26" height="15" class="i-scr"/><path d="M-6 8 v5 h12 v-5 M-11 13 h22" class="i-ln"/>' + (d.wifi ? '<path d="M18 -18 a7 7 0 0 1 7 7 M18 -23 a12 12 0 0 1 12 12" class="i-ln thin"/>' : '');
    if (t === 'srv') return '<rect x="-13" y="-20" width="26" height="40" rx="2" class="i-body"/><path d="M-8 -12 h16 M-8 -6 h16 M-8 0 h16" class="i-ln thin"/><circle cx="6" cy="12" r="2" class="i-led"/>';
    if (t === 'prn') return '<rect x="-17" y="-6" width="34" height="16" rx="2" class="i-body"/><path d="M-10 -6 v-9 h20 v9 M-10 10 v6 h20 v-6" class="i-ln"/>';
    if (t === 'ap') return '<rect x="-14" y="-5" width="28" height="12" rx="6" class="i-body"/><path d="M-9 -10 a12 12 0 0 1 18 0 M-14 -15 a19 19 0 0 1 28 0" class="i-ln thin"/>';
    return '<circle r="16" class="i-body"/>';
  }
  function pos(id) { var d = N.dev[id]; return d ? [d.x, d.y] : [0, 0]; }
  function linkPath(l) {
    var a = pos(l.a), b = pos(l.b);
    if (l.kind === 'vpn') return 'M' + a[0] + ' ' + a[1] + ' Q 800 -70 ' + b[0] + ' ' + b[1];
    return 'M' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1];
  }
  function findLink(a, b) { for (var i = 0; i < N.links.length; i++) { var l = N.links[i]; if ((l.a === a && l.b === b) || (l.a === b && l.b === a)) return l; } return null; }
  /* Estado de cada extremo: ok, down, blk */
  function endState(l, end) {
    var dev = end === 'a' ? l.a : l.b, ifc = end === 'a' ? l.ai : l.bi;
    if (S.cut && dev === 'BCN-P1-ACC1' && ifc === 'Gi0/1') return 'down';
    if (S.cut && dev === 'BCN-CORE1' && ifc === 'Gi1/0/3') return 'down';
    if (!S.cut && dev === 'BCN-P1-ACC1' && ifc === 'Gi0/2') return 'blk';
    var od = end === 'a' ? l.b : l.a, o = N.dev[od];
    if (N.dev[dev] && N.dev[dev].type === 'sw' && S.err[dev + ':' + ifc]) return 'down';
    if (o && o.sw === dev && S.err[dev + ':' + o.port]) return 'down';
    if (o && o.type === 'sw' && S.err[od + ':' + ifc]) return 'down';
    if (l.kind === 'vpn' && !S.vpnUp) return 'blk';
    return 'ok';
  }

  /* ---------- Mapa ---------- */
  T.map = function (host, o) {
    o = o || {};
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 -20 1600 740'); svg.setAttribute('class', 'tr-map'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Topología lógica de LogiTrans: dos sedes, cuatro ISP y la VPN');
    var h = '<defs><pattern id="trg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="g1"/></pattern><pattern id="trg2" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" class="g2"/></pattern></defs>';
    h += '<rect x="0" y="-20" width="1600" height="740" fill="url(#trg)"/><rect x="0" y="-20" width="1600" height="740" fill="url(#trg2)"/>';
    var zone = function (x, y, w, hh, t, s) { return '<g class="zone"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="10"/><text x="' + (x + 14) + '" y="' + (y + 22) + '">' + t + '</text><text class="z2" x="' + (x + 14) + '" y="' + (y + 38) + '">' + s + '</text></g>'; };
    h += zone(14, 40, 652, 676, 'BARCELONA · SEDE CENTRAL', '10.1.0.0/16 · 350 puestos');
    h += zone(676, 40, 248, 400, 'INTERNET', 'ISP-1 a ISP-4 · OSPF MD5');
    h += zone(934, 40, 652, 676, 'ZARAGOZA · ALMACÉN', '10.2.0.0/16 · 150 puestos');
    h += '<g class="links">';
    N.links.forEach(function (l, i) {
      h += '<path d="' + linkPath(l) + '" class="lk ' + l.kind + '" data-l="' + i + '"/>';
      if (l.kind === 'po') { var a = pos(l.a), b = pos(l.b); h += '<path d="M' + a[0] + ' ' + (a[1] + 6) + ' L' + b[0] + ' ' + (b[1] + 6) + '" class="lk po2"/>'; }
      if (l.kind !== 'vpn' && l.kind !== 'wifi') h += '<circle class="ld" data-l="' + i + '" data-e="a" r="4.2"/><circle class="ld" data-l="' + i + '" data-e="b" r="4.2"/>';
    });
    h += '<text class="vpn-t" x="800" y="-2" text-anchor="middle">TÚNEL GRE SOBRE IPSEC · AES-256 · 10.0.0.0/30</text>';
    h += '</g><g class="devs">';
    Object.keys(N.dev).forEach(function (id) {
      var d = N.dev[id];
      h += '<g class="dv t-' + d.type + '" data-id="' + id + '" transform="translate(' + d.x + ' ' + d.y + ')" tabindex="0" role="button" aria-label="' + id + '">' +
        '<circle r="34" class="hit"/>' + icon(d) +
        '<text class="dn" y="' + (d.type === 'srv' ? 34 : d.type === 'l3' || d.type === 'fw' ? 32 : 30) + '">' + (id === 'P1-ADM-03' && S.intruder ? 'PC intruso' : id) + '</text>' +
        (d.ip ? '<text class="di" y="' + (d.type === 'srv' ? 46 : 42) + '">' + d.ip + (d.vlan ? ' · V' + d.vlan : '') + '</text>' : '') +
        '<g class="mk"></g></g>';
    });
    h += '</g><g class="fx"></g>';
    svg.innerHTML = h;
    host.appendChild(svg);
    var m = { svg: svg, host: host, fx: svg.querySelector('.fx') };
    // Puntos de estado cerca de cada extremo
    LT.$$('.ld', svg).forEach(function (c) {
      var l = N.links[+c.dataset.l], a = pos(l.a), b = pos(l.b), e = c.dataset.e;
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, k = Math.min(30, len * 0.3);
      var p = e === 'a' ? [a[0] + dx / len * k, a[1] + dy / len * k] : [b[0] - dx / len * k, b[1] - dy / len * k];
      c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]);
    });
    LT.$$('.dv', svg).forEach(function (g) {
      var go = function () { if (o.onDevice) o.onDevice(g.dataset.id); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    m.refresh = function () {
      LT.$$('.ld', svg).forEach(function (c) { var l = N.links[+c.dataset.l]; c.setAttribute('class', 'ld ' + endState(l, c.dataset.e)); });
      LT.$$('.lk.vpn', svg).forEach(function (p) { p.classList.toggle('down', !S.vpnUp); });
      var lab = svg.querySelector('[data-id="P1-ADM-03"] .dn'); if (lab) lab.textContent = S.intruder ? 'PC intruso' : 'P1-ADM-03';
      var g = svg.querySelector('[data-id="P1-ADM-03"]'); if (g) g.classList.toggle('intr', !!S.intruder);
      var sw = svg.querySelector('[data-id="BCN-P1-ACC1"] .mk'); if (sw) sw.innerHTML = S.rogueSw ? '<g transform="translate(-58 34)"><rect x="-16" y="-8" width="32" height="16" rx="2" class="rogue"/><text class="rg" y="4">PIRATA</text></g>' : '';
    };
    m.highlight = function (ids) { LT.$$('.dv', svg).forEach(function (g) { g.classList.toggle('hl', ids.indexOf(g.dataset.id) >= 0); }); svg.classList.toggle('focus', ids.length > 0); };
    m.alive = function () { return svg.isConnected; };
    m.refresh();
    T.maps.push(m);
    return m;
  };
  LT.on('net', function () { T.maps = T.maps.filter(function (m) { return m.alive(); }); T.maps.forEach(function (m) { m.refresh(); }); });

  /* ---------- Animación de paquetes ---------- */
  var COL = { icmp: '#F2B416', tcp: '#2B67B3', udp: '#2E8A4C' };
  function envelope(fx, color) {
    var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pdu');
    g.innerHTML = '<rect x="-11" y="-8" width="22" height="16" rx="2" fill="' + color + '"/><path d="M-11 -8 L0 1 L11 -8" fill="none"/>';
    fx.appendChild(g); return g;
  }
  function seg(a, b) {
    var l = findLink(a, b), p = document.createElementNS(NS, 'path');
    if (l) p.setAttribute('d', l.a === a ? linkPath(l) : (l.kind === 'vpn' ? 'M' + pos(a).join(' ') + ' Q 800 -70 ' + pos(b).join(' ') : 'M' + pos(a).join(' ') + ' L' + pos(b).join(' ')));
    else p.setAttribute('d', 'M' + pos(a).join(' ') + ' L' + pos(b).join(' '));
    return p;
  }
  function move(maps, a, b, color, dur) {
    return new Promise(function (res) {
      var items = maps.map(function (m) { var p = seg(a, b); p.setAttribute('visibility', 'hidden'); m.fx.appendChild(p); return { m: m, p: p, len: p.getTotalLength(), e: envelope(m.fx, color) }; });
      var t0 = performance.now();
      (function f(now) {
        var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        items.forEach(function (it) { var pt = it.p.getPointAtLength(it.len * e); it.e.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')'); });
        if (k < 1 && !LT.reduce) requestAnimationFrame(f);
        else { items.forEach(function (it) { it.p.remove(); it.e.remove(); }); res(); }
      })(t0);
    });
  }
  function mark(maps, id, kind) {
    maps.forEach(function (m) {
      var p = pos(id), g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'hitmk ' + kind); g.setAttribute('transform', 'translate(' + (p[0] + 22) + ' ' + (p[1] - 24) + ')');
      g.innerHTML = kind === 'drop' ? '<circle r="13"/><path d="M-5 -5 L5 5 M5 -5 L-5 5"/>' : '<circle r="13"/><path d="M-6 0 L-2 5 L6 -5"/>';
      m.fx.appendChild(g); setTimeout(function () { g.remove(); }, 2600);
    });
  }
  var gateRes = null;
  T.step = function () { if (gateRes) { var r = gateRes; gateRes = null; r(); } };
  function gate() { if (!T.sim) return Promise.resolve(); if (T.playing) return LT.sleep(650); return new Promise(function (r) { gateRes = r; }); }
  var simT = 0, animQ = Promise.resolve();
  T.animate = function (R, kind) {
    if (!R || !R.path || R.path.length < 2) return Promise.resolve();
    animQ = animQ.then(function () { return run(R, kind); });
    return animQ;
  };
  function run(R, kind) {
    T.maps = T.maps.filter(function (m) { return m.alive(); });
    var maps = T.maps; if (!maps.length) return Promise.resolve();
    var proto = (R.proto || (R.ev[0] && /TCP/.test(R.ev[0].info[0]) ? 'tcp' : /UDP/.test(R.ev[0].info[0]) ? 'udp' : 'icmp'));
    var color = COL[proto] || COL.icmp, path = R.path, dur = T.sim ? 520 : 170, i = 0;
    maps.forEach(function (m) { m.highlight(path); });
    var evAt = function (id) { return R.ev.filter(function (e) { return e.at === id; }); };
    var pushEv = function (from, at, info, k) { simT += 0.001; T.events.push({ t: simT, from: from, at: at, proto: proto.toUpperCase(), info: info, kind: k, color: color }); LT.emit('simev', {}); };
    if (T.sim) pushEv('-', path[0], R.ev[0] ? R.ev[0].info : [], 'ok');
    return (function next() {
      if (i >= path.length - 1) {
        if (R.ok) {
          mark(maps, path[path.length - 1], 'ok');
          var back = path.slice().reverse(), j = 0;
          if (T.sim) pushEv(path[path.length - 1], path[0], ['Respuesta de vuelta (' + (proto === 'icmp' ? 'echo reply' : 'ACK') + ') por el mismo camino'], 'ok');
          return (function bk() { if (j >= back.length - 1) { maps.forEach(function (m) { m.highlight([]); }); return Promise.resolve(); } var a = back[j], b = back[++j]; return move(maps, a, b, '#9AA3AD', 110).then(bk); })();
        }
        mark(maps, R.at || path[path.length - 1], 'drop');
        setTimeout(function () { maps.forEach(function (m) { m.highlight([]); }); }, 1600);
        return Promise.resolve();
      }
      var a = path[i], b = path[++i];
      return move(maps, a, b, color, dur).then(function () {
        var ev = evAt(b), drop = ev.some(function (e) { return e.kind === 'drop'; });
        if (T.sim) pushEv(a, b, ev.length ? [].concat.apply([], ev.map(function (e) { return e.info; })) : ['Reenvía la trama hacia el siguiente salto'], drop ? 'drop' : ev.some(function (e) { return e.kind === 'warn'; }) ? 'warn' : 'ok');
        return gate().then(next);
      });
    })();
  }

  /* ---------- Terminal ---------- */
  T.term = function (host, sess, o) {
    o = o || {};
    host.innerHTML = '<div class="term"><div class="t-out" role="log" aria-live="polite"></div><label class="t-in"><span class="t-pr"></span><input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Comando"></label></div>';
    var outEl = LT.$('.t-out', host), inp = LT.$('input', host), pr = LT.$('.t-pr', host), box = LT.$('.term', host);
    var busy = false, ask = null, hi = -1, pwQueue = [], self = {};
    var print = self.print = function (t, cls) { var s = document.createElement('span'); if (cls) s.className = cls; s.textContent = t + '\n'; outEl.appendChild(s); outEl.scrollTop = 1e9; };
    function setPrompt() { pr.textContent = ask ? ask.prompt : sess.prompt(); inp.type = ask && ask.hidden ? 'password' : 'text'; }
    function echo(line) { print((ask ? ask.prompt : sess.prompt()) + (ask && ask.hidden ? '' : line), 't-cmd'); }
    function chunks(list) {
      return list.reduce(function (p, ch) {
        return p.then(function () {
          if (ch.clear) { outEl.innerHTML = ''; return; }
          if (ch.exit) { print('\n[Sesión cerrada. Pulsá Intro para volver a entrar.]', 't-dim'); return; }
          if (ch.browser) { if (o.onBrowser) o.onBrowser(ch.browser); return; }
          var pr2 = ch.trace ? T.animate(ch.trace) : Promise.resolve();
          return LT.sleep(ch.wait || 0).then(function () { if (ch.t) print(ch.t, ch.c); if (ch.ask) { ask = ch.ask; setPrompt(); if (pwQueue.length) return LT.sleep(500).then(function () { return submit(pwQueue.shift()); }); } return ch.trace && !T.sim ? null : pr2; });
        });
      }, Promise.resolve());
    }
    function submit(line) {
      if (busy) return Promise.resolve();
      busy = true; box.classList.add('busy');
      var p;
      if (ask) { var a = ask; ask = null; echo(line); p = chunks(a.cb(line) || []); }
      else { echo(line); p = chunks(sess.exec(line, o.opt || {}) || []); }
      return p.then(function () { busy = false; box.classList.remove('busy'); setPrompt(); if (!ask && pwQueue.length) pwQueue = []; if (o.onRun) o.onRun(line); }, function (e) { console.error(e); busy = false; box.classList.remove('busy'); setPrompt(); });
    }
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var v = inp.value; inp.value = ''; hi = -1; submit(v); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        var hs = sess.history ? sess.history() : []; if (!hs.length) return;
        hi = e.key === 'ArrowUp' ? (hi < 0 ? hs.length - 1 : Math.max(0, hi - 1)) : (hi < 0 ? -1 : hi + 1);
        inp.value = hi >= 0 && hi < hs.length ? hs[hi] : ''; if (hi >= hs.length) hi = -1; e.preventDefault();
      } else if (e.key === 'Tab') { e.preventDefault(); complete(); }
    });
    function complete() {
      if (sess.kind !== 'ios' && sess.kind !== 'asa') return;
      var v = inp.value, words = v.split(' '), last = words.pop().toLowerCase(), pre = words.join(' ');
      var cand = {};
      (sess.kind === 'asa' ? ['show', 'access-list', 'running-config', 'interface', 'brief', 'route', 'configure', 'terminal', 'enable'] : ['show', 'running-config', 'interface', 'interfaces', 'brief', 'route', 'access-lists', 'standby', 'vlan', 'trunk', 'spanning-tree', 'etherchannel', 'summary', 'port-security', 'snooping', 'binding', 'crypto', 'isakmp', 'ipsec', 'ospf', 'neighbor', 'translations', 'statistics', 'configure', 'terminal', 'enable', 'status', 'detail']).forEach(function (k) { if (k.indexOf(last) === 0) cand[k] = 1; });
      var ks = Object.keys(cand); if (ks.length === 1) inp.value = (pre ? pre + ' ' : '') + ks[0] + ' ';
    }
    host.addEventListener('click', function (e) { if (!window.getSelection().toString()) inp.focus(); });
    self.type = function (cmd, opt) {
      opt = opt || {}; pwQueue = (opt.pw || []).slice();
      return (busy ? new Promise(function (r) { var iv = setInterval(function () { if (!busy) { clearInterval(iv); r(); } }, 80); }) : Promise.resolve()).then(function () {
        return new Promise(function (res) {
          var k = 0; inp.value = '';
          (function ch() {
            if (k <= cmd.length && !LT.reduce) { inp.value = cmd.slice(0, k++); setTimeout(ch, 14 + Math.random() * 22); }
            else { inp.value = ''; res(submit(cmd)); }
          })();
        });
      });
    };
    self.focus = function () { inp.focus({ preventScroll: true }); };
    self.sess = sess;
    LT.on('console', function (m) { if (host.isConnected && (m.dev === sess.dev || (sess.remoteDev && sess.remoteDev() === m.dev))) m.lines.forEach(function (l) { print(l, 't-sys'); }); });
    sess.banner().forEach(function (b) { print(b.t, b.c); });
    var pend = S.logs[sess.dev]; if (pend && pend.length) pend.forEach(function (l) { print(l, 't-sys'); });
    setPrompt();
    return self;
  };

  /* ---------- Ventana de equipo ---------- */
  var wins = {}, zTop = 60;
  function layer() { var l = LT.$('#tw-layer'); if (!l) { l = LT.h('div#tw-layer'); document.body.appendChild(l); } return l; }
  var TYPE = { rt: 'Router', l3: 'Switch multicapa', sw: 'Switch de acceso', fw: 'Firewall', pc: 'PC', srv: 'Servidor', prn: 'Impresora', ap: 'Punto de acceso', ps: 'Consola', cmd: 'Consola' };
  T.win = function (id, o) {
    o = o || {};
    var d = N.get(id); if (!d) return null;
    if (!o.dock && wins[id] && wins[id].el.isConnected) { wins[id].front(); return wins[id]; }
    var tabs = [];
    if (N.virt[id]) tabs = [['cli', 'Consola']];
    else if (['rt', 'l3', 'sw', 'fw'].indexOf(d.type) >= 0) tabs = [['phy', 'Físico'], ['cfg', 'Config'], ['cli', 'CLI']];
    else if (d.type === 'srv') tabs = [['phy', 'Físico'], ['cfg', 'Config'], ['svc', 'Servicios'], ['desk', 'Escritorio']];
    else if (d.type === 'pc') tabs = [['phy', 'Físico'], ['cfg', 'Config'], ['desk', 'Escritorio']];
    else tabs = [['phy', 'Físico'], ['cfg', 'Config']];
    var el = LT.h('section.twin' + (o.dock ? '.dock' : ''), { role: 'dialog', 'aria-label': id });
    el.innerHTML = '<header class="tw-h"><span class="tw-ic"></span><b>' + esc(id === 'P1-ADM-03' && S.intruder ? 'PC intruso' : id) + '</b><small>' + esc(N.virt[id] ? d.label : (TYPE[d.type] || '') + (d.model ? ' · ' + d.model : '')) + '</small>' + (o.dock ? '' : '<button class="tw-x" aria-label="Cerrar">×</button>') + '</header>' +
      '<nav class="tw-tabs">' + tabs.map(function (t) { return '<button data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</nav><div class="tw-body"></div>';
    var body = LT.$('.tw-body', el), w = { id: id, el: el, term: null, sess: null };
    if (o.dock) o.dock.appendChild(el);
    else {
      layer().appendChild(el);
      var n = Object.keys(wins).filter(function (k) { return wins[k].el.isConnected; }).length;
      el.style.left = Math.max(12, Math.min(innerWidth - 700, innerWidth - 680 - n * 26)) + 'px'; el.style.top = Math.max(76, 90 + n * 26) + 'px';
      drag(el, LT.$('.tw-h', el));
      LT.$('.tw-x', el).onclick = function () { el.remove(); delete wins[id]; };
      el.addEventListener('mousedown', function () { w.front(); });
      wins[id] = w;
    }
    w.front = function () { el.style.zIndex = ++zTop; };
    w.front();
    var cur = null;
    w.tab = function (t, sub) {
      cur = t;
      LT.$$('.tw-tabs button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); });
      if (t === 'cli') {
        if (!w.cliEl) { w.cliEl = LT.h('div.tw-cli'); w.sess = C.open(id); w.term = T.term(w.cliEl, w.sess, { onBrowser: function (u) { w.tab('desk'); w.app('browser', u); } }); }
        body.innerHTML = ''; body.appendChild(w.cliEl); w.term.focus(); return w;
      }
      if (t === 'desk' && sub === 'cmd') { if (!w.cliEl) { w.cliEl = LT.h('div.tw-cli'); w.sess = C.open(id); w.term = T.term(w.cliEl, w.sess, { onBrowser: function (u) { w.app('browser', u); } }); } }
      body.innerHTML = '';
      if (t === 'phy') physical(body, id);
      if (t === 'cfg') config(body, id);
      if (t === 'svc') services(body, id, sub || 'dhcp');
      if (t === 'desk') { desktop(body, w); if (sub) w.app(sub); }
      return w;
    };
    w.app = function (name, arg) {
      if (cur !== 'desk') { w.tab('desk'); }
      var area = LT.$('.desk', body); if (!area) return;
      area.innerHTML = '';
      var bar = LT.h('div.app-h', { html: '<b>' + { cmd: 'Símbolo del sistema', browser: 'Navegador web', ip: 'Configuración IP', wifi: 'Wireless' }[name] + '</b>' });
      bar.appendChild(LT.h('button.app-x', { text: '×', 'aria-label': 'Cerrar aplicación', onclick: function () { desktop(body, w); } }));
      area.appendChild(bar);
      var app = LT.h('div.app'); area.appendChild(app);
      area.classList.add('open');
      if (name === 'cmd') { if (!w.cliEl) { w.cliEl = LT.h('div.tw-cli'); w.sess = C.open(id); w.term = T.term(w.cliEl, w.sess, { onBrowser: function (u) { w.app('browser', u); } }); } app.appendChild(w.cliEl); w.term.focus(); }
      if (name === 'browser') browser(app, id, arg);
      if (name === 'ip') config(app, id);
      if (name === 'wifi') wifi(app, id);
      return w;
    };
    LT.$$('.tw-tabs button', el).forEach(function (b) { b.onclick = function () { w.tab(b.dataset.t); }; });
    w.tab(o.tab || (tabs.some(function (t) { return t[0] === 'cli'; }) ? 'cli' : tabs.some(function (t) { return t[0] === 'desk'; }) ? 'desk' : 'phy'));
    return w;
  };
  function drag(el, handle) {
    var sx, sy, ox, oy;
    handle.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button') || innerWidth < 760) return;
      sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; handle.setPointerCapture(e.pointerId);
      handle.onpointermove = function (ev) { el.style.left = Math.max(0, Math.min(innerWidth - 120, ox + ev.clientX - sx)) + 'px'; el.style.top = Math.max(56, Math.min(innerHeight - 60, oy + ev.clientY - sy)) + 'px'; };
      handle.onpointerup = function () { handle.onpointermove = null; };
    });
  }

  /* Pestaña Físico: frontal del equipo con sus LED */
  function physical(body, id) {
    var d = N.dev[id], h = '<div class="phy">';
    if (d.type === 'sw') {
      var P = C.PORTS[id] || {}, ports = '';
      for (var i = 1; i <= 24; i++) { var p = 'Fa0/' + i, st = S.err[id + ':' + p] ? 'err' : P[p] ? 'on' : 'off'; ports += '<span class="pt ' + st + '" title="' + p + (P[p] ? ' · VLAN ' + P[p].v : ' · VLAN 998 apagado') + '"><i></i><em>' + i + '</em></span>'; }
      var g1 = S.cut && id === 'BCN-P1-ACC1' ? 'off' : 'on', g2 = !S.cut && id === 'BCN-P1-ACC1' ? 'blk' : 'on';
      h += '<div class="face sw"><b>' + esc(id) + '</b><div class="ports">' + ports + '</div><div class="ports up"><span class="pt ' + g1 + '" title="Gi0/1 troncal al CORE1"><i></i><em>G1</em></span><span class="pt ' + g2 + '" title="Gi0/2 troncal al CORE2"><i></i><em>G2</em></span></div></div>';
      h += '<ul class="leg"><li><i class="on"></i>Conectado</li><li><i class="blk"></i>Bloqueado por STP</li><li><i class="err"></i>err-disabled</li><li><i class="off"></i>Libre (VLAN 998, apagado)</li></ul>';
    } else if (d.type === 'rt' || d.type === 'fw' || d.type === 'l3') {
      var n = d.type === 'rt' ? 3 : d.type === 'fw' ? 8 : 24, pp = '';
      for (var j = 0; j < n; j++) pp += '<span class="pt ' + (j < (d.type === 'l3' ? 6 : d.type === 'fw' ? 4 : 3) ? 'on' : 'off') + '"><i></i><em>' + (d.type === 'rt' ? '0/0/' + j : d.type === 'fw' ? '1/' + (j + 1) : j + 1) + '</em></span>';
      h += '<div class="face ' + d.type + '"><b>' + esc(d.model || '') + '</b><div class="ports">' + pp + '</div></div>';
    } else {
      h += '<div class="face host"><svg viewBox="-40 -30 80 60" width="140">' + icon(d) + '</svg></div>';
    }
    h += '<dl class="kv">';
    if (d.model) h += '<dt>Modelo</dt><dd>' + esc(d.model) + '</dd>';
    if (d.u) h += '<dt>Ubicación</dt><dd>Rack R1 del CPD, U' + d.u + '</dd>';
    if (d.floor) h += '<dt>Planta</dt><dd>' + esc(d.floor) + '</dd>';
    if (d.role) h += '<dt>Función</dt><dd>' + esc(d.role) + '</dd>';
    if (d.sw) h += '<dt>Conectado a</dt><dd>' + esc(d.sw) + ' · ' + esc(d.port) + (d.roseta ? ' · roseta ' + d.roseta : '') + '</dd>';
    if (d.ap) h += '<dt>Conectado a</dt><dd>' + esc(d.ap) + ' por Wi-Fi</dd>';
    h += '</dl></div>';
    body.innerHTML = h;
  }
  /* Pestaña Config */
  function config(body, id) {
    var d = N.dev[id], h = '<div class="cfg">';
    if (d.type === 'pc' || d.type === 'srv' || d.type === 'prn') {
      var v6 = d.v6 || '';
      var intr = id === 'P1-ADM-03' && S.intruder;
      h += '<p class="lbl">' + (d.wifi ? 'Wireless0' : 'FastEthernet0') + ' · ' + (d.site === 'INET' || d.type === 'srv' || d.type === 'prn' ? 'Estática' : 'DHCP') + '</p><dl class="kv">' +
        '<dt>Dirección IPv4</dt><dd>' + d.ip + '</dd><dt>Máscara</dt><dd>' + d.mask + ' (/' + d.cidr + ')</dd><dt>Puerta de enlace</dt><dd>' + d.gw + '</dd>' + (d.dns ? '<dt>Servidor DNS</dt><dd>' + d.dns + '</dd>' : '') +
        (v6 ? '<dt>IPv6 (SLAAC)</dt><dd>' + v6 + '</dd>' : '') + '<dt>MAC</dt><dd>' + (intr ? '000C.8587.538A' : d.mac) + '</dd>' + (d.vlan ? '<dt>VLAN</dt><dd>' + LT.D.vl(d.vlan) + '</dd>' : '') + '</dl>';
    } else if (d.type === 'sw') {
      var P = C.PORTS[id] || {};
      h += '<table class="t mini"><thead><tr><th>Puerto</th><th>Modo</th><th>VLAN</th><th>Port Security</th><th>Estado</th></tr></thead><tbody>';
      Object.keys(P).forEach(function (p) { h += '<tr><td class="m">' + p + '</td><td>access</td><td>' + LT.D.vl(P[p].v) + '</td><td>máx. ' + P[p].max + ' · ' + (P[p].act || 'Shutdown') + '</td><td>' + (S.err[id + ':' + p] ? '<span class="chip bad">err-disabled</span>' : '<span class="chip ok">up</span>') + '</td></tr>'; });
      h += '<tr><td class="m">Gi0/1</td><td>trunk</td><td>nativa 999</td><td>DHCP trusted</td><td>' + (S.cut && id === 'BCN-P1-ACC1' ? '<span class="chip bad">shutdown</span>' : '<span class="chip ok">up</span>') + '</td></tr><tr><td class="m">Gi0/2</td><td>trunk</td><td>nativa 999</td><td>DHCP trusted</td><td><span class="chip ok">up</span></td></tr><tr><td class="m">Fa0/x</td><td>access</td><td>998</td><td>-</td><td><span class="chip">shutdown</span></td></tr></tbody></table><p class="lbl">Gestión: Vlan99 ' + d.mgmt + '</p>';
    } else if (d.type === 'l3') {
      h += '<table class="t mini"><thead><tr><th>SVI</th><th>IP</th><th>HSRP</th><th>ACL</th></tr></thead><tbody>';
      LT.SUBNETS.filter(function (s) { return s.site === d.site; }).forEach(function (s) { var b = s.net.replace(/\.0$/, '.'); h += '<tr><td>' + LT.D.vl(s.vlan) + '</td><td class="m">' + b + d.svi + '/' + s.cidr + '</td><td class="m">' + b + '1 · ' + (d.svi === 2 ? 'Active 110' : 'Standby 100') + '</td><td class="m">' + (s.vlan === 40 ? 'ACL-INVITADOS-IN in' : s.vlan === 30 ? 'ACL-OPERARIOS-IN in' : s.vlan === 99 ? 'ACL-GESTION-OUT out' : '') + '</td></tr>'; });
      h += '</tbody></table>';
    } else if (d.type === 'rt' || d.type === 'fw') {
      var names = d.type === 'fw' ? ['Gi1/2 outside', 'Gi1/3 wanbak', 'Gi1/4 inside', 'Gi1/5 corebak'] : ['Gi0/0/0', 'Gi0/0/1', 'Gi0/0/2', d.site === 'INET' ? 'Gi0/0/3' : 'Tunnel0'];
      h += '<table class="t mini"><thead><tr><th>Interfaz</th><th>IP</th></tr></thead><tbody>' + d.ips.map(function (ip, i) { return '<tr><td class="m">' + names[i] + '</td><td class="m">' + ip + '</td></tr>'; }).join('') + '</tbody></table>' + (d.rid ? '<p class="lbl">OSPF router-id ' + d.rid + '</p>' : '');
    } else if (d.type === 'ap') h += '<dl class="kv"><dt>SSID</dt><dd>' + d.ssid + '</dd><dt>Seguridad</dt><dd>WPA2-PSK</dd><dt>VLAN</dt><dd>' + LT.D.vl(40) + '</dd></dl>';
    body.innerHTML = h + '</div>';
  }
  /* Pestaña Servicios de los servidores */
  function services(body, id, sub) {
    var d = N.dev[id], site = d.site, list = ['dhcp', 'dns', 'aaa', 'http'];
    var h = '<div class="svc"><nav class="svc-n">' + list.map(function (s) { return '<button data-s="' + s + '"' + (s === sub ? ' class="on"' : '') + '>' + s.toUpperCase() + '</button>'; }).join('') + '</nav><div class="svc-b">';
    var dhcpOn = id === 'SRV-HV01' || id === 'SRV-ZGZ01';
    if (sub === 'dhcp') {
      if (!dhcpOn) h += '<p>Servicio <b>Off</b> en este servidor.</p>';
      else { h += '<p>Servicio <b class="on">On</b> · ámbitos de ' + (site === 'BCN' ? 'Barcelona' : 'Zaragoza') + '</p><table class="t mini"><thead><tr><th>Pool</th><th>Puerta de enlace</th><th>DNS</th><th>Inicio</th><th>Máscara</th><th>Máx.</th></tr></thead><tbody>';
        LT.SUBNETS.filter(function (s) { return s.site === site && s.vlan !== 50 && s.vlan !== 99; }).forEach(function (s) { h += '<tr><td class="m">VLAN' + s.vlan + '-' + site + '</td><td class="m">' + s.gw + '</td><td class="m">' + (site === 'BCN' ? '10.1.50.10' : '10.2.50.10') + '</td><td class="m">' + s.net.replace(/\.0$/, '.10') + '</td><td class="m">' + s.mask + '</td><td>' + (s.usable - 10) + '</td></tr>'; });
        h += '</tbody></table>'; }
    }
    if (sub === 'dns') {
      var a = id === 'DNS-PUBLICO' ? '85.100.1.18' : '10.1.50.12';
      h += (id === 'SRV-HV01' || id === 'SRV-ZGZ01' || id === 'DNS-PUBLICO') ? '<p>Servicio <b class="on">On</b></p><table class="t mini"><thead><tr><th>Nombre</th><th>Tipo</th><th>Detalle</th></tr></thead><tbody><tr><td class="m">www.logitrans.com</td><td>A</td><td class="m">' + a + '</td></tr>' + (id !== 'DNS-PUBLICO' ? '<tr><td class="m">srv-ad.logitrans.local</td><td>A</td><td class="m">' + (site === 'BCN' ? '10.1.50.10' : '10.2.50.10') + '</td></tr>' : '') + '</tbody></table>' : '<p>Servicio <b>Off</b> en este servidor.</p>';
    }
    if (sub === 'aaa') {
      if (id !== 'SRV-HV01' && id !== 'SRV-ZGZ01') h += '<p>Servicio <b>Off</b> en este servidor.</p>';
      else { var o = site === 'BCN' ? '10.1' : '10.2';
        h += '<p>Servicio <b class="on">On</b> · RADIUS, puerto 1645</p><p class="lbl">Clientes de red</p><table class="t mini"><thead><tr><th>Cliente</th><th>IP</th><th>Tipo</th><th>Clave</th></tr></thead><tbody>' +
          [[site + '-RT1', o + '.254.1'], [site + '-RT2', o + '.254.5'], [site + '-CORE1', o + '.99.2'], [site + '-CORE2', o + '.99.3']].map(function (c) { return '<tr><td class="m">' + c[0] + '</td><td class="m">' + c[1] + '</td><td>Radius</td><td class="m">********</td></tr>'; }).join('') +
          '</tbody></table><p class="lbl">Usuarios</p><table class="t mini"><thead><tr><th>Usuario</th><th>Contraseña</th><th>Grupo del AD</th></tr></thead><tbody><tr><td class="m">admin.xarxa01</td><td class="m">********</td><td>Grupo-Gestio</td></tr><tr><td class="m">admin.xarxa02</td><td class="m">********</td><td>Grupo-Gestio</td></tr></tbody></table>'; }
    }
    if (sub === 'http') h += id === 'SRV-HV03' ? '<p>HTTP <b class="on">On</b> · HTTPS <b class="on">On</b></p><p>La web corporativa. Desde Internet se publica por el NAT estático 85.100.1.18 y el ASA solo deja entrar 80 y 443.</p>' : '<p>HTTP <b>Off</b> en este servidor.</p>';
    body.innerHTML = h + '</div></div>';
    LT.$$('.svc-n button', body).forEach(function (b) { b.onclick = function () { services(body, id, b.dataset.s); }; });
  }
  /* Escritorio de un PC */
  function desktop(body, w) {
    var d = N.dev[w.id];
    var apps = [['ip', 'Configuración IP'], ['cmd', 'Símbolo del sistema'], ['browser', 'Navegador web']];
    if (d.wifi) apps.push(['wifi', 'Wireless']);
    body.innerHTML = '<div class="desk"><div class="apps">' + apps.map(function (a) { return '<button data-a="' + a[0] + '"><span class="ai ai-' + a[0] + '"></span>' + a[1] + '</button>'; }).join('') + '</div></div>';
    LT.$$('.apps button', body).forEach(function (b) { b.onclick = function () { w.app(b.dataset.a); }; });
  }
  function wifi(app, id) {
    var d = N.dev[id];
    app.innerHTML = '<div class="wifi"><div class="sig"><i></i><i></i><i></i><i></i></div><dl class="kv"><dt>Estado</dt><dd><span class="chip ok">Conectado</span></dd><dt>SSID</dt><dd>' + N.dev[d.ap].ssid + '</dd><dt>Punto de acceso</dt><dd>' + d.ap + '</dd><dt>Canal</dt><dd>6 (2,4 GHz)</dd><dt>Seguridad</dt><dd>WPA2-PSK · AES</dd><dt>VLAN</dt><dd>' + LT.D.vl(40) + ' Convidats</dd><dt>MAC</dt><dd>' + d.mac + '</dd></dl></div>';
  }
  function browser(app, id, url) {
    app.innerHTML = '<div class="brw"><form class="url"><span>URL</span><input value="' + esc(url || 'http://www.logitrans.com') + '" aria-label="Dirección"><button class="btn sm">Ir</button></form><div class="page"><p class="pt-msg">Escribí una dirección y pulsá Ir.</p></div></div>';
    var f = LT.$('form', app), inp = LT.$('input', app), page = LT.$('.page', app);
    f.onsubmit = function (e) {
      e.preventDefault();
      page.innerHTML = '<p class="pt-msg">Conectando con ' + esc(inp.value) + ' …</p>';
      var r = C.browse(id, inp.value);
      var chain = Promise.resolve();
      if (r.R && !r.ok) chain = T.animate(r.R);
      else if (r.ok) chain = T.animate(r.R);
      chain.then(function () { return LT.sleep(T.sim ? 0 : 200); }).then(function () {
        if (!r.ok) { page.innerHTML = '<div class="pt-err"><b>' + esc(r.msg) + '</b><p>' + (r.R && r.R.why ? esc(r.R.why) : 'El servidor no respondió.') + '</p></div>'; return; }
        page.innerHTML = sitePage(id, r);
      });
    };
    if (url) setTimeout(function () { f.requestSubmit ? f.requestSubmit() : f.onsubmit(new Event('submit')); }, 150);
  }
  function sitePage(id, r) {
    return '<div class="lt-site"><header><b>LOGITRANS</b><nav><span>Servicios</span><span>Sedes</span><span>Contacto</span><span class="cta">Área de clientes</span></nav></header>' +
      '<section><p class="k">Transporte y logística</p><h4>Barcelona y Zaragoza, <em>un solo almacén</em>.</h4><p>Seguimiento de cada envío en tiempo real desde el área de clientes.</p></section>' +
      '<div class="st"><span class="chip info">EN ALMACÉN</span><span class="chip fill">EN TRÁNSITO</span><span class="chip ok">ENTREGADO</span></div>' +
      '<footer>Servido por nginx desde SRV-HV03 (10.1.50.12)' + (r.ip !== '10.1.50.12' ? ' a través del NAT ' + r.ip : '') + '</footer></div>';
  }

  /* ---------- Ejecutar una comprobación ---------- */
  function needsEnable(cmd) { return /^(sh\w*\s+(run|start)|clear|conf|copy|wr)/i.test(cmd); }
  T.exec = function (run, w) {
    var r = C.split(run), g = N.get(r.dev);
    C.applyMods(r);
    if (r.cmd === 'dhcp' || r.cmd === 'aaa') { w.tab('svc', r.cmd); return LT.sleep(300); }
    if (r.cmd === 'wireless') { w.tab('desk', 'wifi'); return LT.sleep(300); }
    var cmds = C.macros[r.dev + '|' + r.cmd] || r.parts;
    if (!N.virt[r.dev] && (g.type === 'pc' || g.type === 'srv')) {
      if (/^browser/.test(cmds[0])) { w.tab('desk'); w.app('browser', cmds[0].replace(/^browser\s*/, '')); return LT.sleep(1200); }
      w.tab('desk'); w.app('cmd');
    } else w.tab('cli');
    var chain = Promise.resolve();
    if (w.sess && w.sess.isRemote && w.sess.isRemote()) chain = chain.then(function () { return w.term.type('exit'); });
    if (w.sess && (w.sess.kind === 'ios' || w.sess.kind === 'asa') && /[>]$/.test(w.sess.prompt()) && (cmds.some(needsEnable) || C.macros[r.dev + '|' + r.cmd])) {
      if (!C.macros[r.dev + '|' + r.cmd]) chain = chain.then(function () { return w.term.type('enable'); });
    }
    cmds.forEach(function (c) { chain = chain.then(function () { return w.term.type(c, { pw: /^ssh/.test(c) ? (r.mods.indexOf('bad') >= 0 ? ['abc', 'Gestio.2026'] : ['Gestio.2026']) : [] }); }); });
    return chain;
  };

  /* Ventana emergente desde la memoria */
  T.runInWindow = function (run) {
    var r = C.split(run);
    if (LT.$('.tr-full')) { var w0 = T.win(r.dev); return T.exec(run, w0); }
    T.closePop();
    var pop = LT.h('div#tw-pop', { role: 'dialog', 'aria-label': 'LogiTrans Tracer' });
    pop.innerHTML = '<div class="pop-box"><header class="pop-h"><span class="lbl">LogiTrans Tracer</span><b>' + esc(r.dev) + ' · ' + esc(r.cmd.replace(/^browser /, 'Navegador → ')) + '</b><a class="btn sm ghost" href="#/tracer">Abrir el Tracer completo</a><button class="pop-x" aria-label="Cerrar">×</button></header><div class="pop-in"><div class="pop-map"></div><div class="pop-dev"></div></div><p class="pop-note">Réplica del Packet Tracer v5 de la memoria. Las salidas se reconstruyen a partir de las capturas; las ACL usan las líneas y los contadores reales.</p></div>';
    document.body.appendChild(pop);
    document.body.classList.add('pop-open');
    var mp = T.map(LT.$('.pop-map', pop), { onDevice: function (id) { var w2 = T.win(id); } });
    LT.$('.pop-x', pop).onclick = T.closePop;
    LT.$('.pop-h a', pop).onclick = function () { T.closePop(); };
    pop.addEventListener('click', function (e) { if (e.target === pop) T.closePop(); });
    requestAnimationFrame(function () { pop.classList.add('in'); });
    var w = T.win(r.dev, { dock: LT.$('.pop-dev', pop) });
    return LT.sleep(250).then(function () { return T.exec(run, w); });
  };
  T.closePop = function () { var p = LT.$('#tw-pop'); if (p) { p.remove(); document.body.classList.remove('pop-open'); LT.$$('#tw-layer .twin').forEach(function (x) { x.remove(); }); wins = {}; } };
  T.isPop = function () { return !!LT.$('#tw-pop'); };

  /* ---------- Vista completa #/tracer ---------- */
  var player = null;
  T.render = function (scId) {
    var view = LT.$('#view');
    view.innerHTML = '<div class="tr-full">' +
      '<div class="tr-bar"><div class="tr-ttl"><span class="lbl">Herramienta</span><b>LogiTrans Tracer</b></div>' +
      '<div class="seg" role="group" aria-label="Modo"><button data-m="rt" class="on">Tiempo real</button><button data-m="sim">Simulación</button></div>' +
      '<button class="btn sm ghost" data-a="pdu" title="Elegí origen y destino en el mapa">Añadir PDU</button>' +
      '<button class="btn sm ghost" data-a="reset">Reiniciar la red</button>' +
      '<a class="btn sm ghost tr-guide" href="GUIA.html#tracer" target="_blank">¿Cómo se usa?</a>' +
      '<span class="tr-hint">Clic en un equipo para abrirlo · los escenarios repiten las pruebas de la memoria</span></div>' +
      '<div class="tr-main"><div class="tr-stage"><div class="tr-mapw"></div><div class="tr-pdus"><table class="t mini"><thead><tr><th>Fuego</th><th>Último estado</th><th>Origen</th><th>Destino</th><th>Tipo</th><th>TTL</th></tr></thead><tbody><tr class="empty"><td colspan="6">Sin PDU. Usá «Añadir PDU» y elegí dos equipos.</td></tr></tbody></table></div></div>' +
      '<aside class="tr-side"><nav class="tr-tabs"><button data-p="sc" class="on">Escenarios</button><button data-p="sim">Simulación</button><button data-p="dev">Equipos</button></nav><div class="tr-panel"></div></aside></div>' +
      '<p class="tr-note">Réplica del Packet Tracer v5: 46 equipos de los 105 del fichero, con la misma topología, direccionamiento y listas de acceso. Las salidas de consola se reconstruyen a partir de las capturas de la memoria y los contadores de las ACL arrancan en los valores reales.</p></div>';
    var full = LT.$('.tr-full', view);
    var pdu = null;
    var m = T.map(LT.$('.tr-mapw', view), { onDevice: function (id) {
      if (pdu) {
        if (!pdu.src) { pdu.src = id; LT.toast('Origen: ' + id + '. Ahora el destino.'); return; }
        var src = N.dev[pdu.src], dst = N.dev[id]; pdu = null; full.classList.remove('picking');
        var dip = dst.ip || dst.mgmt || (dst.ips && dst.ips[0]) || (dst.svi ? LT.SUBNETS.filter(function (s) { return s.site === dst.site; })[1].gw : null);
        if (!src.ip) { LT.toast('El origen tiene que ser un PC o un servidor.'); return; }
        var R = N.trace(src.id, dip, { p: 'icmp' }); C.l2(src.id);
        addPdu(src.id, id, dip, R); T.animate(R); return;
      }
      T.win(id);
    } });
    LT.$$('.seg button', view).forEach(function (b) { b.onclick = function () { T.sim = b.dataset.m === 'sim'; LT.$$('.seg button', view).forEach(function (x) { x.classList.toggle('on', x === b); }); full.classList.toggle('sim', T.sim); if (T.sim) panel('sim'); }; });
    LT.$('[data-a="pdu"]', view).onclick = function () { pdu = {}; full.classList.add('picking'); LT.toast('Elegí el equipo de origen en el mapa.'); };
    LT.$('[data-a="reset"]', view).onclick = function () { LT.ACTS.reset(); T.events = []; LT.emit('simev', {}); LT.$$('#tw-layer .twin').forEach(function (x) { x.remove(); }); wins = {}; LT.toast('Red reiniciada: contadores y puertos como en las capturas.'); };
    LT.$$('.tr-tabs button', view).forEach(function (b) { b.onclick = function () { panel(b.dataset.p); }; });
    function addPdu(a, b, ip, R) {
      var tb = LT.$('.tr-pdus tbody', view), e = LT.$('.empty', tb); if (e) e.remove();
      var ttl = R.ok ? (R.fromRouter ? 255 : 128) - (R.hops || 0) : '-';
      var tr = LT.h('tr', { html: '<td><button class="link" title="Repetir">Repetir</button></td><td>' + (R.ok ? '<span class="chip ok">Correcto</span>' : '<span class="chip bad">Fallido</span>') + '</td><td class="m">' + a + '</td><td class="m">' + b + ' (' + ip + ')</td><td>ICMP</td><td class="m">' + ttl + '</td>' });
      LT.$('button', tr).onclick = function () { var R2 = N.trace(a, ip, { p: 'icmp' }); T.animate(R2); };
      tb.insertBefore(tr, tb.firstChild);
      if (!R.ok && R.why) LT.toast(R.why, 4200);
    }
    function panel(p) {
      LT.$$('.tr-tabs button', view).forEach(function (x) { x.classList.toggle('on', x.dataset.p === p); });
      var el = LT.$('.tr-panel', view);
      if (p === 'sc') return scPanel(el, m);
      if (p === 'sim') return simPanel(el);
      if (p === 'dev') {
        var groups = { BCN: 'Barcelona', ZGZ: 'Zaragoza', INET: 'Internet' }, h = '';
        Object.keys(groups).forEach(function (g) { h += '<p class="lbl">' + groups[g] + '</p><div class="devlist">' + Object.keys(N.dev).filter(function (k) { return N.dev[k].site === g; }).map(function (k) { return '<button data-d="' + k + '">' + k + '</button>'; }).join('') + '</div>'; });
        h += '<p class="lbl">Consolas de los servicios</p><div class="devlist">' + Object.keys(N.virt).map(function (k) { return '<button data-d="' + k + '">' + N.virt[k].label + '</button>'; }).join('') + '</div>';
        el.innerHTML = h;
        LT.$$('[data-d]', el).forEach(function (b) { b.onclick = function () { T.win(b.dataset.d); }; });
      }
    }
    panel('sc');
    if (scId && LT.SC[scId]) openScenario(LT.$('.tr-panel', view), m, scId);
  };
  function scPanel(el, m) {
    var by = {};
    LT.SCENARIOS.forEach(function (s) { var ch = LT.chapterOf(s.ref); var k = ch ? ch.n + ' · ' + ch.t : 'Otros'; (by[k] = by[k] || []).push(s); });
    var h = '<p class="intro">Cada escenario repite una prueba de la memoria, paso a paso, en esta red. Sirve para presentar el Packet Tracer sin abrirlo.</p>';
    Object.keys(by).forEach(function (k) { h += '<p class="lbl">' + k + '</p><div class="sclist">' + by[k].map(function (s) { return '<button data-s="' + s.id + '"><i>' + s.ref + '</i><b>' + s.t + '</b><small>' + s.steps.length + ' pasos</small></button>'; }).join('') + '</div>'; });
    el.innerHTML = h;
    LT.$$('[data-s]', el).forEach(function (b) { b.onclick = function () { history.replaceState(null, '', '#/tracer/' + b.dataset.s); openScenario(el, m, b.dataset.s); }; });
  }
  function openScenario(el, m, id) {
    var sc = LT.SC[id], i = 0, busy = false;
    LT.ACTS.reset();
    el.innerHTML = '<div class="player"><button class="link back">Todos los escenarios</button><p class="lbl">' + (LT.lang === 'ca' ? 'Escenari · <a href="#/s/' + sc.ref + '">punt ' + sc.ref + ' de la memòria</a>' : 'Escenario · <a href="#/s/' + sc.ref + '">punto ' + sc.ref + ' de la memoria</a>') + '</p><h3>' + sc.t + '</h3><p>' + sc.d + '</p><ol class="steps">' +
      sc.steps.map(function (s, k) { return '<li data-k="' + k + '"><p>' + s.say + '</p>' + (s.dev ? '<code>' + esc(s.dev) + ' · ' + esc(s.cmd.replace(/^browser /, 'Navegador → ').replace(/ @\w+/, '').replace('conf-ospfv3-auth', 'ipv6 ospf authentication ipsec …').replace(/^(aaa|dhcp)$/, function (x) { return 'Servicios → ' + x.toUpperCase(); }).replace(/^wireless$/, 'Config → Wireless0')) + '</code>' : s.act ? '<code class="act">Acción en la red</code>' : '') + '</li>'; }).join('') +
      '</ol><div class="pl-ctl"><button class="btn sun next">Empezar</button><button class="btn ghost sm all">Reproducir todo</button><button class="btn ghost sm rst">Reiniciar</button></div></div>';
    LT.$('.back', el).onclick = function () { history.replaceState(null, '', '#/tracer'); scPanel(el, m); };
    var nextB = LT.$('.next', el);
    function step() {
      if (busy || i >= sc.steps.length) return Promise.resolve();
      busy = true; nextB.disabled = true;
      var s = sc.steps[i], li = LT.$('[data-k="' + i + '"]', el);
      LT.$$('.steps li', el).forEach(function (x) { x.classList.remove('cur'); }); li.classList.add('cur'); li.scrollIntoView({ block: 'nearest' });
      var p;
      if (s.focus) { m.highlight(s.focus); p = LT.sleep(600); }
      else if (s.act) { m.highlight([]); LT.ACTS[s.act](); LT.toast(s.say.split(':')[0], 2600); p = LT.sleep(500); }
      else { m.highlight([s.dev]); var w = T.win(s.dev); p = T.exec(s.dev + '|' + s.cmd, w); }
      return p.then(function () { li.classList.add('done'); i++; busy = false; nextB.disabled = false; nextB.textContent = i >= sc.steps.length ? 'Terminado' : 'Paso siguiente (' + (i + 1) + '/' + sc.steps.length + ')'; if (i >= sc.steps.length) nextB.disabled = true; });
    }
    nextB.onclick = step;
    LT.$('.all', el).onclick = function () { (function loop() { if (i < sc.steps.length) step().then(function () { return LT.sleep(900); }).then(loop); })(); };
    LT.$('.rst', el).onclick = function () { LT.$$('#tw-layer .twin').forEach(function (x) { x.remove(); }); wins = {}; openScenario(el, m, id); };
    player = { step: step };
  }
  T.nextStep = function () { if (player && LT.$('.player')) player.step(); };
  function simPanel(el) {
    el.innerHTML = '<div class="simp"><p class="intro">En simulación cada paquete avanza salto a salto. Clic en un evento para ver qué decidió cada equipo.</p><div class="sim-ctl"><button class="btn sm play">' + (T.playing ? 'Pausa' : 'Reproducir') + '</button><button class="btn sm ghost fwd">Avanzar</button><button class="btn sm ghost clr">Vaciar</button></div><div class="evl"><table class="t mini"><thead><tr><th></th><th>Tiempo (s)</th><th>Último equipo</th><th>En equipo</th><th>Tipo</th></tr></thead><tbody></tbody></table></div><div class="pdu-info"><p class="lbl">Información del PDU</p><div class="pi">Elegí un evento.</div></div></div>';
    if (!T.sim) LT.$('.intro', el).insertAdjacentHTML('afterend', '<p class="note-s">Activá «Simulación» arriba para capturar eventos.</p>');
    LT.$('.play', el).onclick = function (e) { T.playing = !T.playing; e.target.textContent = T.playing ? 'Pausa' : 'Reproducir'; if (T.playing) T.step(); };
    LT.$('.fwd', el).onclick = function () { T.step(); };
    LT.$('.clr', el).onclick = function () { T.events = []; paintEv(); };
    function paintEv() {
      var tb = LT.$('.evl tbody', el); if (!tb) return;
      tb.innerHTML = T.events.slice(-80).map(function (e, k) { return '<tr data-k="' + k + '" class="' + e.kind + '"><td><i class="sq" style="background:' + e.color + '"></i></td><td class="m">' + e.t.toFixed(3) + '</td><td class="m">' + e.from + '</td><td class="m">' + e.at + '</td><td>' + e.proto + '</td></tr>'; }).join('');
      LT.$('.evl', el).scrollTop = 1e9;
      LT.$$('tr[data-k]', tb).forEach(function (tr) { tr.onclick = function () { var e = T.events.slice(-80)[+tr.dataset.k]; LT.$$('tr', tb).forEach(function (x) { x.classList.remove('sel'); }); tr.classList.add('sel'); LT.$('.pi', el).innerHTML = '<b>' + e.at + '</b>' + (e.kind === 'drop' ? ' <span class="chip bad">descartado</span>' : '') + '<ul>' + e.info.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }; });
    }
    paintEv();
    LT.on('simev', function () { if (el.isConnected && LT.$('.evl', el)) paintEv(); });
  }

  /* ---------- Incrustado en un apartado (widget «tracer») ---------- */
  T.embed = function (el, o) {
    o = o || {};
    el.classList.add('tr-embed');
    el.innerHTML = '<div class="tr-emb-h"><span class="lbl">Topología lógica · clic en un equipo para abrirlo</span><a class="btn sm" href="#/tracer">Abrir el Tracer completo</a></div><div class="tr-emb-m" style="height:' + (o.h || 520) + 'px"></div>';
    T.map(LT.$('.tr-emb-m', el), { onDevice: function (id) { T.win(id); } });
  };
  LT.W = LT.W || {};
  LT.W.tracer = function (el, o) { T.embed(el, o); };
})();
