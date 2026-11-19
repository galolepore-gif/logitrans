/* Idioma de la web: castellano (por defecto) o catalán.
   En catalán se carga el diccionario de la interfaz (js/i18n/ca.js) y la memoria traducida (js/doc-ca).
   El traductor recorre el DOM y cambia cada texto que tenga en el diccionario, también lo que se pinta después. */
window.LT = window.LT || {};
(function () {
  var LT = window.LT, base = (document.currentScript && document.currentScript.src || '').replace(/js\/core\/i18n\.js.*$/, '');
  var saved = null; try { saved = localStorage.getItem('lt-lang'); } catch (e) { }
  var q = /[?&]lang=(es|ca)\b/.exec(location.search);
  LT.lang = q ? q[1] : (saved === 'ca' ? 'ca' : 'es');
  if (q) try { localStorage.setItem('lt-lang', LT.lang); } catch (e) { }
  document.documentElement.lang = LT.lang;
  LT.setLang = function (l) {
    try { localStorage.setItem('lt-lang', l); } catch (e) { }
    var u = location.href.replace(/([?&])lang=(es|ca)&?/, '$1').replace(/[?&](#|$)/, '$1');
    location.replace(u); location.reload();
  };
  /* Texto suelto desde JS: LT.tr('...') */
  LT.tr = function (s) { return s; };
  if (LT.lang !== 'ca') return;

  document.write('<script src="' + base + 'js/i18n/ca.js"><\/script>');

  var D = null, LONG = null, cache = Object.create(null);
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, CODE: 1 };
  function dict() {
    if (D) return D;
    D = LT.I18N_CA || {};
    LONG = Object.keys(D).filter(function (k) { return k.length >= 12; }).sort(function (a, b) { return b.length - a.length; });
    return D;
  }
  /* Textos que se arman con números: se traducen por patrón */
  var RULES = [
    [/^Imagen (\d+) de la memoria$/, 'Imatge $1 de la memòria'],
    [/^Conector (\d+) de la roseta (\d+) de la planta (\d+)$/, 'Connector $1 de la roseta $2 de la planta $3'],
    [/^Caja de suelo (\d+) de la planta (\d+), 6 tomas$/, 'Caixa de terra $1 de la planta $2, 6 preses'],
    [/^Puerto (\d+) del panel (\d+)$/, 'Port $1 del panell $2'],
    [/^Enlace (\d+) de fibra del CPD al IDF de la planta (\d+)$/, 'Enllaç $1 de fibra del CPD a l’IDF de la planta $2'],
    [/^Terminal del muelle (\d+) del almacén$/, 'Terminal del moll $1 del magatzem'],
    [/^Ver (\d+) capturas reales: /, 'Veure $1 captures reals: '],
    [/(\d+) direcciones necesarias \(con el 20 %\) de (\d+) útiles en (\d+) subredes\. El resto del \/16 queda libre para crecer\./, '$1 adreces necessàries (amb el 20 %) de $2 útils en $3 subxarxes. La resta del /16 queda lliure per créixer.'],
    [/^Usuario o contraseña incorrectos\. Intento (\d+) de 5\.$/, 'Usuari o contrasenya incorrectes. Intent $1 de 5.'],
    [/^Demasiados intentos\. Espera (\d+) segundos\.$/, 'Massa intents. Espera $1 segons.'],
    [/ · máscara /g, ' · màscara '], [/ · puerta /g, ' · porta '], [/ hosts útiles/g, ' hosts útils'],
    [/^en el Tracer$/, 'al Tracer'], [/(^|[ (])línea (\d+)/g, '$1línia $2'], [/(\d+) coincidencias/g, '$1 coincidències'],
    [/ por Wi-Fi$/, ' per Wi-Fi'], [/^(\d+) escenarios$/, '$1 escenaris'], [/^(\d+) capturas$/, '$1 captures'],
    [/^Paso (\d+) de (\d+)$/, 'Pas $1 de $2'], [/^paso (\d+) de (\d+)$/, 'pas $1 de $2'], [/^Punto (\S+)$/, 'Punt $1'], [/^Capítulo (\S+)/, 'Capítol $1']
  ];
  var FRAGS = [["Acción en la red", "Acció a la xarxa"], ["DHCPOFFER descartado en ", "DHCPOFFER descartat a "], [". Los clientes siguen recibiendo la puerta de enlace ", ". Els clients continuen rebent la porta d’enllaç "], [" está en err-disabled", " està en err-disabled"], [" permitida (sticky)", " permesa (sticky)"], [" responde (HSRP: la .1 es la IP virtual del grupo)", " respon (HSRP: la .1 és la IP virtual del grup)"], [" vía Tunnel0", " via Tunnel0"], ["), sale etiquetada por ", "), surt etiquetada per "], ["): el puerto no reenvía nada.", "): el port no reenvia res."], [", destino ", ", destí "], [". El ASA solo deja entrar HTTP y HTTPS hacia el servidor web.", ". L’ASA només deixa entrar HTTP i HTTPS cap al servidor web."], [". Hacia Internet solo salen web, DNS e ICMP.", ". Cap a Internet només surten web, DNS i ICMP."], [". Solo el NOC llega a la red de gestión.", ". Només el NOC arriba a la xarxa de gestió."], [": conmutación de capa 2, sin pasar por ninguna ACL", ": commutació de capa 2, sense passar per cap ACL"], [": las redes privadas no existen en Internet (% Network not in table).", ": les xarxes privades no existeixen a Internet (% Network not in table)."], ["AD principal, DHCP, DNS y RADIUS", "AD principal, DHCP, DNS i RADIUS"], ["Base de datos (MySQL 3306) y AD secundario", "Base de dades (MySQL 3306) i AD secundari"], ["CORE2 no es el activo de HSRP: pasa la trama al CORE1 por el Port-channel 1", "El CORE2 no és l’actiu d’HSRP: passa la trama al CORE1 pel Port-channel 1"], ["Capa 2: entra por ", "Capa 2: entra per "], ["Capa 2: hacia la puerta de enlace ", "Capa 2: cap a la porta d’enllaç "], ["Capa 2: sale por el puerto de acceso de la VLAN ", "Capa 2: surt pel port d’accés de la VLAN "], ["Cliente Windows 10", "Client Windows 10"], ["Cliente Windows 11", "Client Windows 11"], ["DNS público: ", "DNS públic: "], ["Descifra el ESP y quita la cabecera GRE", "Desxifra l’ESP i treu la capçalera GRE"], ["Destino desconocido.", "Destí desconegut."], ["Echo request recibido: responde con echo reply", "Echo request rebut: respon amb echo reply"], ["Echo request recibido: responde", "Echo request rebut: respon"], ["El servidor no tiene ningún servicio en el puerto ", "El servidor no té cap servei al port "], ["Enruta en IPv6 entre las SVI (", "Encamina en IPv6 entre les SVI ("], ["Enrutamiento entre VLAN: ", "Encaminament entre VLAN: "], ["Entrega a BCN-RT1 por Gi0/0/0", "Lliura a BCN-RT1 per Gi0/0/0"], ["Entrega en la LAN de Internet ", "Lliura a la LAN d’Internet "], ["Entrega en la VLAN 50", "Lliura a la VLAN 50"], ["Equipo anfitrión · PowerShell", "Equip amfitrió · PowerShell"], ["Equipo anfitrión", "Equip amfitrió"], ["Equipo de auditoría", "Equip d’auditoria"], ["GRE sobre IPsec: ESP con AES-256 y SHA-HMAC hacia ", "GRE sobre IPsec: ESP amb AES-256 i SHA-HMAC cap a "], ["Gestión de red", "Gestió de xarxa"], [" (Gi0/1 caído)", " (Gi0/1 caigut)"], ["IKE fase 1 (QM_IDLE) y fase 2 negociadas ahora: el primer paquete se pierde mientras se levanta el túnel", "IKE fase 1 (QM_IDLE) i fase 2 negociades ara: el primer paquet es perd mentre s’aixeca el túnel"], ["ISP-2 no tiene ruta hacia ", "ISP-2 no té ruta cap a "], ["Impresora de etiquetas", "Impressora d’etiquetes"], ["Misma VLAN ", "Mateixa VLAN "], ["Móvil invitado", "Mòbil convidat"], ["Portátil invitado", "Portàtil convidat"], ["NAT con sobrecarga (PAT): ", "NAT amb sobrecàrrega (PAT): "], ["NAT estático: ", "NAT estàtic: "], ["Nave este (IDF-02)", "Nau est (IDF-02)"], ["Nave oeste", "Nau oest"], ["Ningún equipo con la IP ", "Cap equip amb la IP "], ["Ningún equipo de Internet tiene la IP ", "Cap equip d’Internet no té la IP "], [" se conoce vía ISP-1", " es coneix via ISP-1"], ["PC intruso", "PC intrús"], ["Recepción", "Recepció"], ["Administración", "Administració"], ["Dirección local", "Direcció local"], ["Dirección", "Direcció"], ["Reenvía la trama", "Reenvia la trama"], ["Ruta por defecto hacia ", "Ruta per defecte cap a "], ["Segundo DC, DHCP, DNS y RADIUS", "Segon DC, DHCP, DNS i RADIUS"], ["Sin respuesta IPv6.", "Sense resposta IPv6."], ["Terminal de muelle", "Terminal de moll"], ["Vuelta: ", "Tornada: "], ["nginx responde en el puerto ", "nginx respon al port "]];
  function trText(s) {
    if (s in cache) return cache[s];
    var d = dict(), t = s.trim(), out = s;
    if (t && /[A-Za-zÀ-ÿ]/.test(t)) {
      if (d[t] != null) out = s.replace(t, d[t]);
      else if (t.length >= 12) {
        var r = t;
        for (var i = 0; i < LONG.length; i++) if (r.indexOf(LONG[i]) >= 0) r = r.split(LONG[i]).join(d[LONG[i]]);
        if (r !== t) out = s.replace(t, r);
      }
      var cur = out.trim(), r2 = cur;
      for (var f = 0; f < FRAGS.length; f++) if (r2.indexOf(FRAGS[f][0]) >= 0) r2 = r2.split(FRAGS[f][0]).join(FRAGS[f][1]);
      for (var k = 0; k < RULES.length; k++) r2 = r2.replace(RULES[k][0], RULES[k][1]);
      if (r2 !== cur) out = out.replace(cur, r2);
    }
    cache[s] = out; cache[out] = out;
    return out;
  }
  LT.tr = function (s) { return s == null ? s : trText(String(s)); };
  var ATTR = ['placeholder', 'title', 'aria-label', 'data-tip', 'alt'];
  function inSkip(n) {
    for (var p = n.parentNode; p && p.nodeType === 1; p = p.parentNode) {
      if (SKIP[p.tagName] || (p.hasAttribute && p.hasAttribute('data-noi18n'))) return true;
    }
    return false;
  }
  function attrs(el) {
    for (var a = 0; a < ATTR.length; a++) { var av = el.getAttribute(ATTR[a]); if (av) { var tv = trText(av); if (tv !== av) el.setAttribute(ATTR[a], tv); } }
  }
  function filt(n) {
    if (n.nodeType === 1 && (n.hasAttribute('data-noi18n') || (SKIP[n.tagName] && n.tagName !== 'INPUT'))) return 2; /* FILTER_REJECT: salta el subárbol */
    return 1;
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { var v0 = trText(root.nodeValue); if (v0 !== root.nodeValue) root.nodeValue = v0; return; }
    if (root.nodeType === 1) { if (filt(root) === 2) return; attrs(root); }
    var tw = document.createTreeWalker(root, 5, { acceptNode: filt }), n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 1) attrs(n);
      else { var v = trText(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    }
  }
  function start() {
    dict();
    walk(document.documentElement);
    var mo = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'characterData') { if (!inSkip(m.target)) { var v = trText(m.target.nodeValue); if (v !== m.target.nodeValue) m.target.nodeValue = v; } }
        else if (m.type === 'attributes') { var el = m.target, av = el.getAttribute(m.attributeName); if (av && !inSkip(el)) { var tv = trText(av); if (tv !== av) el.setAttribute(m.attributeName, tv); } }
        else for (var j = 0; j < m.addedNodes.length; j++) { var an = m.addedNodes[j]; if (!inSkip(an)) walk(an); }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
