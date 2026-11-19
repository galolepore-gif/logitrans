/* VPN IPsec, OSPF y NAT/ASA */
(function () {
  var LT = window.LT, tnTimer = null, cTimer = null;

  /* ---------- Túnel: paquetes que entran legibles y viajan cifrados ---------- */
  var MSGS = ['ICMP 10.1.20.11 → 10.2.50.10', 'DNS www.logitrans.com', 'HTTP GET /clients', 'OSPF Hello 224.0.0.5', 'MySQL 3306 SELECT', 'RADIUS Access-Request'];
  function rnd(n) { var s = ''; for (var i = 0; i < n; i++) s += '0123456789abcdef'[(Math.random() * 16) | 0]; return s; }
  function launchPk() {
    var host = LT.$('#tn-packets'); if (!host) return;
    var m = MSGS[(Math.random() * MSGS.length) | 0], dir = Math.random() < .5 ? 1 : -1;
    var p = LT.h('div.tn-pk' + (dir < 0 ? '.rev' : ''), { text: m });
    host.appendChild(p);
    var t0 = performance.now(), dur = 3600;
    (function f(now) {
      var k = (now - t0) / dur; if (k >= 1 || !p.isConnected) { p.remove(); return; }
      var x = dir > 0 ? k : 1 - k;
      p.style.left = (x * 100) + '%';
      var inside = x > .14 && x < .86;
      p.classList.toggle('enc', inside);
      p.textContent = inside ? 'ESP ' + rnd(16) : m;
      requestAnimationFrame(f);
    })(t0);
  }
  function cipher() {
    var inp = LT.$('#cipher-in'), out = LT.$('#cipher');
    function frame() {
      var t = inp.value || ' ', hex = '';
      for (var i = 0; i < Math.min(48, t.length + 16); i++) hex += rnd(2) + ' ';
      out.innerHTML = '<div><span class="muted">85.100.1.2 &gt; 85.100.2.2: ESP(spi=0x8f3a1c22, seq=0x' + rnd(2) + ')</span></div><div class="hex">' + hex + '</div><div class="muted small">Original: <span class="sig">' + LT.esc(t) + '</span> · lo que viaja por Internet es esto.</div>';
    }
    frame(); cTimer = setInterval(frame, 900); inp.addEventListener('input', frame);
  }
  /* ---------- OSPF ---------- */
  var ST = [['DOWN', 'Sin Hellos todavía'], ['INIT', 'BCN-RT1 recibe un Hello de ZGZ-RT1 por Tunnel0'], ['2-WAY', 'Cada uno se ve en el Hello del otro'], ['EXSTART', 'Eligen quién manda en el intercambio'], ['EXCHANGE', 'Intercambian el resumen de la base de datos (DBD)'], ['LOADING', 'Piden las LSA que les faltan'], ['FULL', 'Adyacencia completa: ZGZ aprende 10.1.0.0/16 como O E2']];
  function ospf(run) {
    var box = LT.$('#ospf'); box.innerHTML = '';
    ST.forEach(function (s, i) { box.appendChild(LT.h('div.os', { 'data-i': i }, [LT.h('b.mono', { text: s[0] }), LT.h('span', { text: s[1] })])); });
    box.appendChild(LT.h('div.os-md5.mono', { html: 'ip ospf authentication message-digest<br>ip ospf message-digest-key 1 md5 ********' }));
    if (!run) return;
    var i = 0;
    (function nx() {
      var els = LT.$$('.os', box); if (!els.length) return;
      els.forEach(function (e, k) { e.classList.toggle('done', k < i); e.classList.toggle('on', k === i); });
      LT.audio && LT.audio.blip();
      if (i === 1) LT.$('.os-md5', box).classList.add('chk');
      if (i++ < ST.length - 1) setTimeout(nx, LT.reduce ? 0 : 520); else LT.audio && LT.audio.ok();
    })();
  }

  LT.scene('tunel', {
    steps: 4,
    init: function () { cipher(); ospf(false); LT.$('#ospf-go').onclick = function () { ospf(true); }; },
    enter: function () { if (!tnTimer) { launchPk(); tnTimer = setInterval(launchPk, 900); } },
    leave: function () { clearInterval(tnTimer); tnTimer = null; },
    step: function (n) { if (n === 3) ospf(true); }
  });

  /* ---------- NAT ---------- */
  var natRows = [['---', '85.100.1.18', '10.1.50.12', '---']];
  function natTable() {
    var tb = LT.$('#nat-table tbody'); tb.innerHTML = '';
    natRows.forEach(function (r, i) { tb.appendChild(LT.h('tr' + (i === natRows.length - 1 && natRows.length > 1 ? '.new' : ''), null, r.map(function (c) { return LT.h('td', { text: c }); }))); });
  }
  function natStage() {
    var st = LT.$('#nat-stage');
    st.innerHTML = '<div class="ns-col"><div class="ns-box in"><b>Red interna</b><span class="mono">10.1.0.0/16 · 10.2.0.0/16</span><small>Nunca sale a Internet</small></div></div>' +
      '<div class="ns-wire"><div class="ns-pk mono" id="ns-pk">10.1.20.11:51234</div></div>' +
      '<div class="ns-col"><div class="ns-box rt"><b>BCN-RT1</b><span class="mono">ip nat inside → outside</span><small>PAT: todos comparten 85.100.1.2<br>Estático: 10.1.50.12 ↔ 85.100.1.18</small></div></div>' +
      '<div class="ns-wire"><div class="ns-pk mono out" id="ns-pk2">85.100.1.2:1025</div></div>' +
      '<div class="ns-col"><div class="ns-box net"><b>Internet</b><span class="mono">203.0.113.0/24</span><small>No conoce las redes 10.x</small></div></div>';
  }
  function natDemo(kind) {
    var a = LT.$('#ns-pk'), b = LT.$('#ns-pk2'), st = LT.$('#nat-stage');
    st.classList.remove('run', 'rev'); void st.offsetWidth;
    if (kind === 'static') {
      a.textContent = '10.1.50.12:80'; b.textContent = '85.100.1.18:80 ← 203.0.113.10:1025';
      st.classList.add('run', 'rev');
      natRows = [['---', '85.100.1.18', '10.1.50.12', '---'], ['tcp', '85.100.1.18:80', '10.1.50.12:80', '203.0.113.10:1025']];
    } else {
      var port = 1024 + ((Math.random() * 30) | 0);
      a.textContent = 'ICMP 10.1.20.11:' + port; b.textContent = 'ICMP 85.100.1.2:' + port;
      st.classList.add('run');
      natRows = [['---', '85.100.1.18', '10.1.50.12', '---'], ['icmp', '85.100.1.2:' + port, '10.1.20.11:' + port, '203.0.113.10:' + port]];
    }
    setTimeout(natTable, LT.reduce ? 0 : 900);
    LT.audio && LT.audio.whoosh();
  }
  function asa() {
    LT.$('#asa').innerHTML =
      '<div class="asa-box"><div class="asa-core mono">ASA 5506-X</div>' +
      '<div class="asa-if o"><b>outside</b><span>nivel 0 · a BCN-RT1</span></div><div class="asa-if o2"><b>wanbak</b><span>nivel 0 · a BCN-RT2</span></div>' +
      '<div class="asa-if i"><b>inside</b><span>nivel 100 · a CORE1</span></div><div class="asa-if i2"><b>corebak</b><span>nivel 100 · a CORE2</span></div></div>' +
      '<div class="asa-acl"><div><b class="mono">OUTSIDE_IN</b><span>Tráfico de la otra sede por la VPN · web 80/443 a 10.1.50.12 · RADIUS de los routers · respuestas de ping · <span class="bad">deny ip any any</span></span></div>' +
      '<div><b class="mono">INSIDE_OUT</b><span>La otra sede · web, HTTPS, DNS, ping · SSH del NOC a los routers · respuestas de la web · <span class="bad">deny ip any any</span></span></div></div>';
  }
  LT.scene('nat', {
    steps: 3,
    init: function () {
      natStage(); natTable(); asa();
      LT.$$('[data-nat]').forEach(function (b) { b.onclick = function () { natDemo(b.dataset.nat); }; });
    },
    enter: function () { setTimeout(function () { natDemo('pat'); }, 500); },
    step: function (n) { if (n === 2) natDemo('static'); }
  });
})();
