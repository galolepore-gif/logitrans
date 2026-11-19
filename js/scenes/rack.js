/* Racks: alzado interactivo construido con los datos de la memoria + simulación de corte de luz */
(function () {
  var LT = window.LT, cur = 'BCN-R1', upsTimer = null;
  var TYPE = { cab: 'Paso de cables', fib: 'Fibra', org: 'Organizador', kvm: 'Consola', pp: 'Patch panel', acc: 'Switch de acceso', rt: 'Router', fw: 'Firewall', core: 'Core', pdu: 'PDU', srv: 'Servidor', bat: 'Baterías', ups: 'SAI', res: 'Reserva' };
  function fill(R) {
    var rows = [], used = {};
    R.items.forEach(function (it) { for (var u = it[0]; u > it[0] - it[1]; u--) used[u] = it; });
    for (var u = R.size; u >= 1; u--) {
      var it = used[u];
      if (!it) { rows.push({ u: u, h: 1, t: 'res', l: 'Reserva' }); continue; }
      if (it[0] === u) rows.push({ u: u, h: it[1], t: it[2], l: it[3], d: it[4] });
    }
    return rows;
  }
  function draw(id) {
    cur = id; stopUps();
    var R = LT.RACKS[id], v = LT.$('#rack-view');
    LT.$$('#rack-tabs .chip').forEach(function (b) { b.classList.toggle('on', b.dataset.r === id); });
    v.innerHTML = '';
    var rack = LT.h('div.rack' + (R.size < 20 ? '.small' : ''), { style: { '--u': R.size } });
    rack.appendChild(LT.h('div.rack-top.mono', { html: '<b>' + R.title + '</b><span>' + R.size + 'U · ' + R.occ + '</span>' }));
    var body = LT.h('div.rack-body');
    fill(R).forEach(function (r, i) {
      var ru = LT.h('button.ru.ru-' + r.t, { style: { '--h': r.h, '--d': (i * 14) + 'ms' }, title: r.l, tabindex: r.t === 'res' || r.t === 'org' ? -1 : 0 },
        [LT.h('span.un.mono', { text: r.u }), LT.h('span.ul', { text: r.l }), r.t === 'acc' || r.t === 'core' || r.t === 'rt' || r.t === 'fw' || r.t === 'srv' ? LT.h('span.leds') : null]);
      ru.onclick = function () { if (r.t === 'res') return; LT.$$('.ru.sel', body).forEach(function (x) { x.classList.remove('sel'); }); ru.classList.add('sel'); detail(r); LT.audio && LT.audio.click(); };
      body.appendChild(ru);
    });
    rack.appendChild(body);
    v.appendChild(rack);
    LT.$('#ups-model').textContent = R.ups.model;
    LT.$('#ups-time').textContent = R.ups.min + ':00';
    LT.$('#ups-fill').style.width = '100%';
    LT.$('#ups-txt').textContent = 'Carga real ≈ ' + LT.fmt(R.ups.load) + ' W. Online de doble conversión: la corriente pasa siempre por rectificador e inversor. Sin tiempo de transferencia.';
    detail(null);
    requestAnimationFrame(function () { rack.classList.add('in'); });
  }
  function detail(r) {
    var d = LT.$('#rack-detail');
    if (!r) {
      d.innerHTML = '<h4>Criterio de distribución <em>2.B2</em></h4><ul class="zones-u">' +
        '<li><b>U1–U6</b> SAI y baterías: lo más pesado abajo, baja el centro de gravedad.</li>' +
        '<li><b>U7–U18</b> Servidores físicos.</li><li><b>U19–U28</b> Cores, routers y firewall, a altura de trabajo.</li>' +
        '<li><b>U29–U38</b> Switches de acceso con su patch panel al lado.</li><li><b>U39–U42</b> Fibra, consola KVM y entrada de cables.</li></ul>' +
        '<p class="muted small">Entre cada par de equipos activos, un organizador de 1U. Los IDF quedan al 55–62 % libres a propósito: margen para crecer sin abrir techos.</p><p class="sig small mono">Clic en cualquier equipo del rack.</p>';
      return;
    }
    d.innerHTML = '<h4>' + (TYPE[r.t] || '') + ' <em>U' + (r.u - r.h + 1) + (r.h > 1 ? '–U' + r.u : '') + '</em></h4><div class="rd-name">' + LT.esc(r.l) + '</div>' + (r.d ? '<p>' + LT.esc(r.d) + '</p>' : '') + (HW[r.t] ? '<p class="muted small">' + HW[r.t] + '</p>' : '');
  }
  var HW = {
    core: 'Capa 3 con 10/25G hacia los IDF por fibra. En Packet Tracer se simula con Catalyst 3650-24PS.',
    acc: '48 puertos PoE+ para teléfonos IP, AP y cámaras, y uplinks de 10G por SFP+. En Packet Tracer: 2960-24TT.',
    rt: 'Router de frontera con módulo IPsec. Cada sede tiene dos, contra ISP distintos, más respaldo 4G/5G.',
    fw: 'Cuatro interfaces: outside y wanbak (nivel 0) a los routers, inside y corebak (nivel 100) a los cores.',
    srv: 'Controladora RAID por hardware. En el laboratorio el RAID 5 se hizo con Storage Spaces.',
    ups: 'Tarjeta de red AP9641 con SNMP v3: avisa al NOC si hay corte, batería baja, batería a cambiar o temperatura alta.',
    pdu: 'Dos circuitos eléctricos independientes desde el cuadro general, cada uno con su interruptor.'
  };
  function stopUps() { if (upsTimer) { clearInterval(upsTimer); upsTimer = null; } LT.$('#rack-view') && LT.$('#rack-view').classList.remove('blackout'); var b = LT.$('#ups-go'); if (b) b.textContent = 'Cortar la luz'; }
  function ups() {
    if (upsTimer) { stopUps(); draw(cur); return; }
    var R = LT.RACKS[cur], total = R.ups.min * 60, left = total;
    LT.$('#rack-view').classList.add('blackout');
    LT.$('#ups-go').textContent = 'Volver la luz';
    LT.$('#ups-txt').innerHTML = '<span class="warn">Corte de red.</span> Transferencia: <b>0 ms</b>. Los equipos ni se enteran. El SAI avisa por SNMP v3 al NOC y hay tiempo para un apagado ordenado o para arrancar un grupo electrógeno.';
    LT.audio && LT.audio.bad();
    upsTimer = setInterval(function () {
      left = Math.max(0, left - 20);
      LT.$('#ups-time').textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      LT.$('#ups-fill').style.width = (left / total * 100) + '%';
      if (left <= total * .5 && !upsTimer.warned) { upsTimer.warned = true; LT.toast('SNMP trap → NOC: batería por debajo del 50 %'); }
      if (!left) { clearInterval(upsTimer); upsTimer = null; LT.$('#ups-txt').textContent = 'Autonomía agotada: a esta altura los servidores ya se apagaron de forma ordenada (SRV-HV01 recibe el aviso por USB como canal de reserva).'; }
    }, 120);
  }
  LT.scene('rack', {
    steps: 1,
    init: function () {
      var tabs = LT.$('#rack-tabs');
      Object.keys(LT.RACKS).forEach(function (id) { tabs.appendChild(LT.h('button.chip', { text: LT.RACKS[id].title.replace(' · Rack', ''), 'data-r': id, onclick: function () { draw(id); } })); });
      LT.$('#ups-go').onclick = ups;
      draw(cur);
    },
    leave: stopUps,
    step: function (n) { if (n === 1 && !upsTimer) ups(); if (n === 0) stopUps(); }
  });
})();
