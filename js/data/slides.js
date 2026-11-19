/* Diapositivas del modo presentación. Se generan desde la misma memoria:
   portada, índice, una portadilla por capítulo y una diapositiva por apartado con su pieza interactiva. */
(function () {
  var LT = window.LT;
  /* Pieza visual de cada apartado en la presentación */
  var VIS = {
    '0': { w: 'plan', o: { f: 'p0' } }, '2.A1': { w: 'compare', o: { k: 'cat' } }, '2.A2': { w: 'label' }, '2.B1': { w: 'upsload' }, '2.B2': { w: 'rack' }, '2.B3': { w: 'hw' }, '2.C': { w: 'tracer', o: { h: 470 } },
    '3.A1': { w: 'vlsm', o: { site: 'BCN' } }, '3.A2': { w: 'eui64' }, '3.B': { w: 'vlanmatrix' }, '3.C1': { w: 'vpn' }, '3.C2': { w: 'ospf' }, '3.C3': { w: 'nat' },
    '4.A1': { w: 'portsec' }, '4.A2': { w: 'snoop' }, '4.A3': { w: 'stp' }, '4.B1': { w: 'acl', o: { k: 'inv' } }, '4.B2': { w: 'acl', o: { k: 'ges' } }, '4.B3': { w: 'acl', o: { k: 'ope' } },
    '5.A1': { w: 'aduc' }, '5.A2': { w: 'dot1x' }, '5.A3': { w: 'gpo' }, '5.B1': { w: 'docker' }, '5.B2': { w: 'portal' }, '5.C1': { w: 'raid' }, '5.C2': { w: 'fwlocal' }, '5.D': { w: 'jelly' }, '5.E': { w: 'fog' },
    '6.1': { w: 'nmap' }, '6.2': { w: 'wpscan' }, '6.3': { w: 'attacks', o: { layer: 2 } }
  };
  LT.VIS = VIS;
  LT.buildSlides = function () {
    var S = [];
    S.push({ kind: 'cover', id: 'cover', t: 'LogiTrans', notes: 'Presentación del equipo y del encargo: una empresa de logística con oficina central en Barcelona (350 puestos) y almacén en Zaragoza (150).' });
    S.push({ kind: 'agenda', id: 'agenda', t: 'Índice', notes: 'El orden es el mismo que el de la memoria. Cada punto tiene su prueba en el Packet Tracer o en los servicios.' });
    LT.CHAPTERS.forEach(function (c) {
      S.push({ kind: 'chapter', id: 'ch' + c.n, ch: c, t: c.n + ' · ' + c.t, notes: (LT.lang === 'ca' ? 'Capítol ' : 'Capítulo ') + c.n + ': ' + c.s.map(function (id) { return id + ' ' + (LT.SECTIONS[id] ? LT.SECTIONS[id].t : ''); }).join(' · ') });
      c.s.forEach(function (id) {
        var sec = LT.SECTIONS[id]; if (!sec) return;
        S.push({ kind: 'sec', id: id, sec: sec, t: (id === '0' ? '0' : id) + ' · ' + sec.t, vis: VIS[id], steps: Math.min((sec.subs || []).length, 7),
          notes: (sec.lead || '').replace(/<[^>]+>/g, '') + (sec.sc ? (LT.lang === 'ca' ? ' Escenari al Tracer: ' : ' Escenario en el Tracer: ') + sec.sc[1] : '') + (LT.lang === 'ca' ? ' Punts: ' : ' Puntos: ') + (sec.subs || []).map(function (s) { return s[0] + ' ' + s[1]; }).join(' · ') });
      });
    });
    S.push({ kind: 'budget', id: 'budget', t: 'Presupuesto', notes: '855.172 € de base y 1.034.758,12 € con IVA. Más de la mitad son los equipos de usuario.' });
    S.push({ kind: 'team', id: 'team', t: 'Equipo', notes: 'Reparto del trabajo y sprints.' });
    S.push({ kind: 'end', id: 'end', t: 'Preguntas', notes: 'Abrir el Tracer si piden ver alguna prueba en vivo: tecla T al salir, o el botón de cada comprobación.' });
    return S;
  };
})();
