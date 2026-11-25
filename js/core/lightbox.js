/* Visor de evidencias: capturas reales de la memoria con su pie */
(function () {
  var LT = window.LT, list = [], idx = 0, title = '';
  var TITLES = { rack: 'Alzado de racks', pt: 'Packet Tracer', ipv4: 'Direccionamiento IPv4', ipv6: 'Direccionamiento IPv6', vlan: 'VLAN', vpn: 'VPN IPsec', ospf: 'OSPF', nat: 'NAT y firewall', l2: 'Seguridad de capa 2', acl: 'Listas de acceso', ad: 'Active Directory y GPO', radius: 'RADIUS y AAA', web: 'WordPress y área de clientes', storage: 'RAID 5 y BitLocker', fwav: 'Firewall y antivirus', repo: 'Repositorio y Jellyfin', fog: 'FOG Project', audit: 'Auditoría' };
  LT.EV_TITLES = TITLES;
  function show() {
    var e = list[idx]; if (!e) return;
    var img = LT.$('#lb-img'); img.src = e.src; img.alt = e.txt;
    LT.$('#lb-cap').innerHTML = '<small>' + (LT.lang === 'ca' ? 'IMATGE ' + e.num + ' DE LA MEMÒRIA · ' : 'IMAGEN ' + e.num + ' DE LA MEMORIA · ') + LT.esc(e.dev.toUpperCase()) + '</small>' + LT.esc(e.txt);
    LT.$('#lb-n').textContent = (idx + 1) + ' / ' + list.length;
    LT.$$('#lb-strip img').forEach(function (im, i) { im.classList.toggle('on', i === idx); if (i === idx) im.scrollIntoView({ block: 'nearest', inline: 'center' }); });
  }
  LT.lightbox = {
    open: function (key, start) {
      var ids = Array.isArray(key) ? key : (LT.EVIDENCE_GROUPS[key] || []);
      title = Array.isArray(key) ? 'Evidencias' : (TITLES[key] || 'Evidencias');
      list = ids.map(function (n) { return LT.EVIDENCE[n]; }).filter(Boolean);
      if (!list.length) return;
      idx = start || 0;
      LT.$('#lb-title').textContent = title;
      var strip = LT.$('#lb-strip'); strip.innerHTML = '';
      list.forEach(function (e, i) { strip.appendChild(LT.h('img', { src: e.src, alt: '', loading: 'lazy', onclick: function () { idx = i; show(); } })); });
      LT.$('#lightbox').classList.add('open'); show();
      LT.emit('presenter-sync');
    },
    close: function () { LT.$('#lightbox').classList.remove('open'); },
    get isOpen() { return LT.$('#lightbox').classList.contains('open'); },
    next: function () { idx = (idx + 1) % list.length; show(); },
    prev: function () { idx = (idx - 1 + list.length) % list.length; show(); }
  };
  document.addEventListener('DOMContentLoaded', function () {
    LT.$('#lb-x').onclick = LT.lightbox.close;
    LT.$('#lb-next').onclick = LT.lightbox.next;
    LT.$('#lb-prev').onclick = LT.lightbox.prev;
    LT.$('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox' || e.target.classList.contains('stage')) LT.lightbox.close(); });
    /* Botones de evidencias: muestran cuántas hay y miniaturas */
    LT.$$('[data-ev]').forEach(function (b) {
      var ids = LT.EVIDENCE_GROUPS[b.dataset.ev] || [];
      var label = b.textContent.trim() || TITLES[b.dataset.ev];
      b.innerHTML = '';
      b.appendChild(LT.h('span', { text: label }));
      b.appendChild(LT.h('b', { text: ids.length }));
      var th = LT.h('span.ev-thumbs');
      ids.slice(0, 3).forEach(function (n) { th.appendChild(LT.h('img', { src: LT.EVIDENCE[n].src, alt: '', loading: 'lazy' })); });
      b.appendChild(th);
      b.title = 'Ver ' + ids.length + ' capturas reales: ' + (TITLES[b.dataset.ev] || '');
      b.addEventListener('click', function () { LT.lightbox.open(b.dataset.ev); });
    });
  });
})();
