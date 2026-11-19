/* Direccionamiento: decodificador 10.SEU.VLAN.HOST, bloques VLSM a escala e IPv6 dual stack */
(function () {
  var LT = window.LT, mode = 4, sel = null;
  LT.decodeIp = function (ip) {
    var m = String(ip).trim().match(/^10\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return null;
    var site = +m[1] === 1 ? 'Barcelona (oficina central)' : +m[1] === 2 ? 'Zaragoza (almacén)' : (+m[1] === 0 ? 'enlace WAN / túnel' : 'delegación futura ' + m[1]);
    var v = LT.VLANS.find(function (x) { return x.id === +m[2]; });
    var vl = v ? 'VLAN ' + v.id + ' · ' + v.name : (+m[2] >= 253 ? 'infraestructura (enlaces /30 entre core, firewall y routers)' : 'sin VLAN asignada');
    return ['10        → espacio privado RFC 1918', m[1] + (m[1].length < 2 ? ' ' : '') + '        → ' + site, m[2] + '       → ' + vl, m[3] + '       → host ' + m[3] + (+m[3] === 1 ? ' (puerta de enlace virtual HSRP)' : +m[3] === 2 ? ' (CORE1)' : +m[3] === 3 ? ' (CORE2)' : '')];
  };
  function decoder() {
    var box = LT.$('#ipdecode');
    box.innerHTML = '<label class="mono muted">Escribí una IP de LogiTrans</label><input class="lbl-in mono" id="ip-in" value="10.2.30.15" spellcheck="false" aria-label="Dirección IP"><div class="ipd" id="ipd"></div>';
    var inp = LT.$('#ip-in');
    function upd() {
      var m = inp.value.trim().match(/^10\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/), o = LT.$('#ipd');
      if (!m) { o.innerHTML = '<span class="muted small">Formato 10.SEU.VLAN.HOST</span>'; return; }
      var site = +m[1] === 1 ? 'Barcelona' : +m[1] === 2 ? 'Zaragoza' : 'sede ' + m[1];
      var v = LT.VLANS.find(function (x) { return x.id === +m[2]; });
      o.innerHTML = '<div class="ipseg"><b>10</b><span>privada</span></div><i>.</i><div class="ipseg s"><b>' + m[1] + '</b><span>' + site + '</span></div><i>.</i><div class="ipseg v" style="--c:' + (v ? 'var(' + v.color + ')' : 'var(--muted)') + '"><b>' + m[2] + '</b><span>' + (v ? 'VLAN ' + v.name : '—') + '</span></div><i>.</i><div class="ipseg h"><b>' + m[3] + '</b><span>host</span></div>';
    }
    inp.addEventListener('input', upd); upd();
  }
  function blocks() {
    var box = LT.$('#vlsm'); box.innerHTML = '';
    ['BCN', 'ZGZ'].forEach(function (site) {
      var subs = LT.SUBNETS.filter(function (s) { return s.site === site; }).slice().sort(function (a, b) { return a.cidr - b.cidr; });
      var row = LT.h('div.vl-row'), track = LT.h('div.vl-track');
      row.appendChild(LT.h('div.vl-site.mono', { html: '<b>' + site + '</b><span>' + (mode === 4 ? (site === 'BCN' ? '10.1.0.0/16' : '10.2.0.0/16') : (site === 'BCN' ? '2001:db8:acad:1000::/52' : '2001:db8:acad:2000::/52')) + '</span>' }));
      subs.forEach(function (s, i) {
        var size = Math.pow(2, 32 - s.cidr), w = mode === 4 ? size / 1024 * 100 : 100 / 6;
        var b = LT.h('button.vl-b', { style: { width: w + '%', '--c': 'var(--v' + s.vlan + ')', '--fill': (s.plus / s.usable * 100) + '%', '--d': (i * 70) + 'ms' }, title: 'VLAN ' + s.vlan + ' · ' + s.net + '/' + s.cidr },
          [LT.h('i.vl-fill'), LT.h('b.mono', { text: mode === 4 ? '/' + s.cidr : ':' + s.v6.split(':')[3] + '::' }), LT.h('span.mono', { text: 'V' + s.vlan })]);
        b.onclick = function () { sel = s; detail(); LT.$$('.vl-b', box).forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); };
        if (sel && sel.site === s.site && sel.vlan === s.vlan) b.classList.add('sel');
        track.appendChild(b);
      });
      row.appendChild(track); box.appendChild(row);
    });
    box.appendChild(LT.h('div.vl-note.mono', { text: mode === 4 ? 'Ancho = tamaño real de la subred. El relleno es lo que ocupa con el 20 % de margen.' : 'Prefijo 2001:db8:acad::/48 · campo de subred SVVV: S = sede, VVV = VLAN con tres cifras. Todas /64 (SLAAC).' }));
    LT.$('#vlsm-mode').textContent = mode === 4 ? 'IPv4 · VLSM' : 'IPv6 · DUAL STACK';
  }
  function detail() {
    var s = sel || LT.SUBNETS[1], v = LT.VLANS.find(function (x) { return x.id === s.vlan; }), d = LT.$('#vlsm-detail');
    d.innerHTML = '<h4>' + s.site + ' · VLAN ' + s.vlan + ' <em style="color:var(' + v.color + ')">' + v.name + '</em></h4>' +
      '<div class="big-net mono">' + (mode === 4 ? s.net + '<span>/' + s.cidr + '</span>' : s.v6.replace('/64', '<span>/64</span>')) + '</div>' +
      '<table class="t mono"><tbody>' +
      (mode === 4 ? '<tr><td class="muted">Máscara</td><td>' + s.mask + '</td></tr><tr><td class="muted">Hosts de la sede</td><td>' + s.hosts + ' → con +20 %: <b>' + s.plus + '</b></td></tr><tr><td class="muted">Útiles</td><td>' + s.usable + '</td></tr><tr><td class="muted">Gateway (HSRP)</td><td>' + s.gw + '</td></tr><tr><td class="muted">CORE1 / CORE2</td><td>' + s.net.replace(/\.0$/, '.2') + ' / ' + s.net.replace(/\.0$/, '.3') + '</td></tr><tr><td class="muted">Broadcast</td><td>' + s.bc + '</td></tr><tr><td class="muted">DHCP desde</td><td>.11 (relay ip helper-address)</td></tr>'
        : '<tr><td class="muted">CORE1 / CORE2</td><td>' + s.v6.replace('::/64', '::2') + ' / ::3</td></tr><tr><td class="muted">Puerta de enlace</td><td>link-local FE80:: aprendida por RA (HSRP v6)</td></tr><tr><td class="muted">Clientes</td><td>SLAAC + DNS por DHCPv6 stateless</td></tr><tr><td class="muted">Servidores en PT</td><td>SLAAC EUI-64 (PT no guarda IPv6 fijas)</td></tr><tr><td class="muted">IPv4 equivalente</td><td>' + s.net + '/' + s.cidr + '</td></tr>') +
      '</tbody></table>' + (s.changed ? '<p class="chg"><b>Cambio respecto al Sprint 1.</b> ' + s.changed + '</p>' : '<p class="muted small">' + v.purpose + '. ' + v.rule + '</p>');
  }
  LT.scene('ip', {
    init: function () {
      decoder(); sel = LT.SUBNETS[1]; blocks(); detail();
      LT.$('#v4btn').onclick = function () { mode = 4; this.classList.add('on'); LT.$('#v6btn').classList.remove('on'); blocks(); detail(); };
      LT.$('#v6btn').onclick = function () { mode = 6; this.classList.add('on'); LT.$('#v4btn').classList.remove('on'); blocks(); detail(); };
    },
    step: function (n) { if (n === 2 && mode === 4) LT.$('#v6btn').click(); if (n < 2 && mode === 6) LT.$('#v4btn').click(); }
  });
})();
