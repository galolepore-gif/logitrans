/* Ataques de capa 2 y 3 lanzados en vivo contra un switch de acceso */
(function () {
  var LT = window.LT, cur = null, token = null, running = false, flood = null;
  var ATK_PORT = 3;

  function buildSwitch() {
    var sw = LT.$('#switch'); sw.innerHTML = '';
    var face = LT.h('div.sw-face');
    face.appendChild(LT.h('div.sw-brand.mono', { html: '<b>CISCO</b><span>Catalyst 2960 · BCN-P1-ACC1</span>' }));
    var ports = LT.h('div.sw-ports');
    for (var i = 1; i <= 24; i++) {
      var used = [1, 2, 4, 5, 6, 7, 9, 10, 12, 14, 15, 17].indexOf(i) >= 0 || i === ATK_PORT;
      var p = LT.h('div.sw-p' + (used ? '.up' : '.off'), { 'data-p': i, title: 'Fa0/' + i + (used ? '' : ' · shutdown, VLAN 998') }, [LT.h('i'), LT.h('span.mono', { text: i })]);
      ports.appendChild(p);
    }
    face.appendChild(ports);
    var up = LT.h('div.sw-up');
    ['Gi0/1', 'Gi0/2'].forEach(function (g) { up.appendChild(LT.h('div.sw-p.trunk', { title: g + ' · troncal trusted hacia CORE' + g.slice(-1) }, [LT.h('i'), LT.h('span.mono', { text: g })])); });
    face.appendChild(up);
    sw.appendChild(face);
    sw.appendChild(LT.h('div.sw-flood', { id: 'sw-flood' }));
    sw.appendChild(LT.h('div.sw-hacker.mono', { html: '<b>ATACANTE</b><span>Fa0/3 · VLAN 20</span>' }));
  }
  function port(n) { return LT.$('.sw-p[data-p="' + n + '"]', LT.$('#switch')); }

  function list() {
    var box = LT.$('#atk-list'); box.innerHTML = '';
    [2, 3].forEach(function (layer) {
      box.appendChild(LT.h('div.atk-h.mono', { text: 'CAPA ' + layer }));
      LT.ATTACKS.filter(function (a) { return a.layer === layer; }).forEach(function (a) {
        var b = LT.h('button.atk-i', { 'data-a': a.id }, [LT.h('b', { text: a.name }), LT.h('span', { text: a.def })]);
        b.onclick = function () { select(a.id); };
        box.appendChild(b);
      });
    });
  }

  function select(id) {
    reset();
    cur = LT.ATTACKS.find(function (a) { return a.id === id; }) || LT.ATTACKS[0];
    LT.$$('.atk-i').forEach(function (b) { b.classList.toggle('on', b.dataset.a === cur.id); });
    LT.$('#atk-desc').innerHTML = '<div class="ad-row"><b class="bad">Ataque</b><p>' + LT.esc(cur.how) + '</p></div><div class="ad-row"><b class="ok">Defensa · ' + cur.ref + '</b><p><strong>' + LT.esc(cur.def) + '.</strong> ' + LT.esc(cur.defHow) + '</p></div>';
    LT.$('#atk-title').textContent = cur.layer === 2 ? 'BCN-P1-ACC1 · Fa0/1–24' : (cur.id === 'mitm' ? 'Internet · entre BCN-RT1 y ZGZ-RT1' : cur.id === 'route' ? 'BCN-RT1 · OSPF área 0' : cur.id === 'spoof' ? 'BCN-FW · ASA 5506-X' : 'BCN-CORE1 · ACL de VLAN');
    LT.$('#atk-term-t').textContent = 'kali@atacante · ' + cur.cmd.split(' ')[0];
    LT.$('#atk-log').innerHTML = '';
    LT.typeLines(LT.$('#atk-log'), [{ t: '# ' + cur.name + ' preparado. Pulsá «Lanzar ataque».', c: 't-dim' }]);
  }

  function reset() {
    if (token) token.cancel = true;
    running = false; clearInterval(flood);
    var sw = LT.$('#switch'); if (!sw) return;
    sw.className = 'switch';
    LT.$$('.sw-p', sw).forEach(function (p) { p.classList.remove('atk', 'err', 'blocked'); });
    LT.$('#sw-flood').innerHTML = '';
    var st = LT.$('#atk-state'); st.textContent = 'EN ESPERA'; st.className = '';
    LT.$('#atk-go').disabled = false;
  }

  function particles(kind) {
    var host = LT.$('#sw-flood');
    flood = setInterval(function () {
      if (!host.isConnected) return clearInterval(flood);
      var p = LT.h('i.fp.' + kind, { text: kind === 'enc' ? Math.random().toString(16).slice(2, 6) : kind === 'mac' ? Math.random().toString(16).slice(2, 6) + '.' + Math.random().toString(16).slice(2, 6) : '' });
      p.style.left = (8 + Math.random() * 84) + '%';
      p.style.animationDuration = (0.9 + Math.random() * 0.8) + 's';
      host.appendChild(p);
      setTimeout(function () { p.remove(); }, 1800);
    }, LT.reduce ? 400 : 60);
  }

  function launch() {
    if (!cur || running) return;
    reset(); running = true;
    var sw = LT.$('#switch'), st = LT.$('#atk-state'), pre = LT.$('#atk-log');
    LT.$('#atk-go').disabled = true;
    token = { cancel: false };
    st.textContent = 'ATAQUE EN CURSO'; st.className = 'bad';
    sw.classList.add('under', 'k-' + cur.id);
    var p = port(ATK_PORT); if (p) p.classList.add('atk');
    particles(cur.id === 'mitm' ? 'enc' : cur.id === 'mac' ? 'mac' : 'pk');
    LT.audio && LT.audio.bad();
    var lines = [{ t: 'root@kali:~# ' + cur.cmd, c: 't-cmd', type: true, wait: 500 }, { t: '[*] enviando...', c: 't-warn', wait: 900 }];
    cur.logs.forEach(function (l, i) { lines.push({ t: l, c: i === 0 ? 't-bad' : 't-sig', wait: 520 }); });
    LT.typeLines(pre, lines, { token: token, speed: 14 }).then(function (ok) {
      if (!ok) return;
      clearInterval(flood);
      sw.classList.remove('under'); sw.classList.add('safe');
      if (p) p.classList.add(cur.layer === 2 && cur.id !== 'hop' && cur.id !== 'arp' ? 'err' : 'blocked');
      st.textContent = cur.layer === 2 && cur.id !== 'hop' && cur.id !== 'arp' ? 'ERR-DISABLED · BLOQUEADO' : 'BLOQUEADO'; st.className = 'ok';
      LT.typeLines(pre, [{ t: '', wait: 100 }, { t: '>> ' + cur.def + ': ataque neutralizado. El resto de la red ni se enteró.', c: 't-ok' }], { append: true });
      LT.audio && LT.audio.ok();
      running = false; LT.$('#atk-go').disabled = false;
    });
  }

  LT.scene('ataque', {
    steps: 3,
    init: function () {
      buildSwitch(); list(); select('mac');
      LT.$('#atk-go').onclick = launch;
      LT.$('#atk-reset').onclick = function () { select(cur.id); };
    },
    leave: function () { if (running) select(cur.id); },
    step: function (n) {
      if (n === 2) { if (cur.id !== 'mac') select('mac'); launch(); }
      if (n === 3) { select('stp'); setTimeout(launch, 300); }
    }
  });
  LT.on('attack', function (id) {
    LT.goto('ataque');
    LT.initScene('ataque');
    setTimeout(function () { select(id); launch(); }, LT.reduce ? 0 : 900);
  });
})();
