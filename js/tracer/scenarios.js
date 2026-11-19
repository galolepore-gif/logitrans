/* LogiTrans Tracer · escenarios
   Cada escenario repite, paso a paso, una prueba de la memoria: qué se dice, en qué equipo y con qué comando.
   Paso: {say, dev, cmd} ejecuta un comando · {say, act} cambia la red · {say, focus:[...]} solo señala equipos. */
(function () {
  var LT = window.LT, N = LT.NET, S = N.state, C = LT.CLI;
  LT.ACTS = {
    reset: function () { N.reset(); LT.emit('net', {}); },
    intruder: function () { S.intruder = true; LT.emit('net', { intruder: true }); },
    restore: function () { S.intruder = false; S.rogueSw = false; delete S.err['BCN-P1-ACC1:Fa0/3']; delete S.viol['BCN-P1-ACC1:Fa0/3']; LT.emit('net', {}); },
    rogueDhcp: function () { C.rogueDhcp(); },
    rogueSw: function () { C.bpdu(); },
    newP0: function () { C.violP0(); },
    cut: function () { S.cut = true; LT.emit('net', { cut: true }); },
    uncut: function () { S.cut = false; LT.emit('net', { cut: false }); },
    vpnDown: function () { S.vpnUp = false; LT.emit('net', {}); }
  };
  var sc = LT.SCENARIOS = [];
  function add(id, ref, t, d, steps) { sc.push({ id: id, ref: ref, t: t, d: d, steps: steps }); }

  add('topo', '2.C', 'Recorrido por la topología', 'Las dos sedes, el anillo de cuatro ISP y la VPN que las une. El core ve a cada switch de planta y a su pareja por el EtherChannel.', [
    { say: 'Internet se simula con cuatro routers en anillo. Cada router de la empresa sale por un ISP distinto: si cae uno, la sede sigue conectada.', focus: ['ISP-1', 'ISP-2', 'ISP-3', 'ISP-4'] },
    { say: 'Barcelona: dos routers, el firewall ASA, dos cores en HSRP y un switch de acceso por planta. Los servidores cuelgan del CORE1, en el CPD.', focus: ['BCN-RT1', 'BCN-RT2', 'BCN-FW', 'BCN-CORE1', 'BCN-CORE2', 'SRV-HV01', 'SRV-HV02', 'SRV-HV03'] },
    { say: 'Zaragoza es el espejo de Barcelona, con la VLAN 30 de los operarios del almacén.', focus: ['ZGZ-RT1', 'ZGZ-RT2', 'ZGZ-FW', 'ZGZ-CORE1', 'ZGZ-CORE2', 'SRV-ZGZ01'] },
    { say: 'Desde el core vemos los cuatro switches de acceso y el CORE2 por los dos puertos del Port-channel.', dev: 'BCN-CORE1', cmd: 'show cdp neighbors' },
    { say: 'El EtherChannel con LACP: Po1 en uso y los dos puertos dentro.', dev: 'BCN-CORE1', cmd: 'show etherchannel summary' }
  ]);
  add('ipv4', '3.A1', 'Direccionamiento IPv4 y HSRP', 'Cada VLAN con su SVI .2 en el CORE1, la IP virtual .1 de HSRP y un PC que recibe su IP por DHCP.', [
    { say: 'Cada VLAN tiene su SVI: la .2 en el CORE1, la .3 en el CORE2.', dev: 'BCN-CORE1', cmd: 'show ip interface brief' },
    { say: 'HSRP: el CORE1 es Active con prioridad 110 y la puerta de enlace es la .1 virtual.', dev: 'BCN-CORE1', cmd: 'show standby brief' },
    { say: 'El PC recibió su IP de la VLAN 20 por DHCP: máscara /23 y puerta de enlace 10.1.20.1.', dev: 'P1-ADM-03', cmd: 'ipconfig' },
    { say: 'Misma VLAN, otra planta: llega a la impresora sin pasar por el core (TTL 128).', dev: 'P1-ADM-03', cmd: 'ping 10.1.20.5' },
    { say: 'Otra VLAN: pasa por el core y el TTL baja a 127.', dev: 'P1-ADM-03', cmd: 'ping 10.1.50.10' }
  ]);
  add('ipv6', '3.A2', 'IPv6 con SLAAC', 'Doble pila: cada SVI con su prefijo 2001:DB8:ACAD:1VVV::/64 y los PC se configuran solos.', [
    { say: 'Cada SVI está up/up con la link-local FE80::2 y su global.', dev: 'BCN-CORE1', cmd: 'show ipv6 interface brief' },
    { say: 'El PC se generó su IPv6 global por SLAAC, con la MAC dentro (EUI-64).', dev: 'P1-ADM-03', cmd: 'ipconfig /all' },
    { say: 'Ping IPv6 entre VLAN, hasta SRV-HV01.', dev: 'P1-ADM-03', cmd: 'ping 2001:db8:acad:1050:209:30ff:fe23:46ba' }
  ]);
  add('vlan', '3.B', 'VLAN y troncales', 'Las seis VLAN, la 998 para los puertos libres, la 999 como nativa y troncales que solo llevan lo justo.', [
    { say: 'Cada puerto en la VLAN de su departamento; los libres en la 998 y apagados.', dev: 'BCN-P1-ACC1', cmd: 'show vlan brief' },
    { say: 'Troncales con nativa 999 y solo las VLAN de la sede permitidas.', dev: 'BCN-P1-ACC1', cmd: 'show interfaces trunk' },
    { say: 'VTP en modo transparente: nadie puede borrar VLAN desde otro switch.', dev: 'BCN-P1-ACC1', cmd: 'show vtp status' },
    { say: 'En el almacén, el terminal del muelle llega a la impresora de etiquetas de su VLAN.', dev: 'ZGZ-MUE-01', cmd: 'ping 10.2.30.5' }
  ]);
  add('vpn', '3.C1', 'VPN IPsec entre sedes', 'GRE sobre IPsec con AES-256. Bajamos el túnel y lo vemos levantarse con el primer paquete.', [
    { say: 'Borramos las asociaciones de seguridad: el túnel queda sin negociar.', dev: 'BCN-RT1', cmd: 'clear crypto sa' },
    { say: 'Fase 1 vacía.', dev: 'BCN-RT1', cmd: 'show crypto isakmp sa' },
    { say: 'Ping de Barcelona a Zaragoza: el primero se pierde mientras IKE negocia, los demás llegan con TTL 122.', dev: 'P1-ADM-03', cmd: 'ping 10.2.50.10' },
    { say: 'Fase 1 establecida: QM_IDLE y ACTIVE.', dev: 'BCN-RT1', cmd: 'show crypto isakmp sa' },
    { say: 'Fase 2: los contadores de cifrado suben con cada paquete.', dev: 'BCN-RT1', cmd: 'show crypto ipsec sa' },
    { say: 'Y en sentido contrario, desde la dirección del almacén.', dev: 'ZGZ-DIR-01', cmd: 'ping 10.1.50.10' }
  ]);
  add('ospf', '3.C2', 'OSPF con autenticación', 'OSPFv2 con MD5 en todo el anillo y entre sedes. OSPFv3 funciona, pero su autenticación IPsec no existe en el Packet Tracer.', [
    { say: 'ISP-1 ve a ISP-2 e ISP-3 en FULL.', dev: 'ISP-1', cmd: 'show ip ospf neighbor' },
    { say: 'La prueba de MD5: «Message digest authentication enabled».', dev: 'ISP-1', cmd: 'show ip ospf interface GigabitEthernet0/0/1' },
    { say: 'BCN-RT1 tiene a ZGZ-RT1 de vecino por el túnel y a BCN-RT2 por el enlace directo.', dev: 'BCN-RT1', cmd: 'show ip ospf neighbor' },
    { say: 'Zaragoza (10.2.0.0/16) aprendida por OSPF a través de la VPN.', dev: 'BCN-RT1', cmd: 'show ip route' },
    { say: 'La limitación: el simulador rechaza la autenticación IPsec de OSPFv3.', dev: 'ISP-1', cmd: 'conf-ospfv3-auth' }
  ]);
  add('nat', '3.C3', 'Internet, NAT y firewall', 'PAT para salir, NAT estático para publicar la web y el ASA que solo deja pasar lo necesario.', [
    { say: 'Un PC sale a Internet: TTL 123 (core, firewall, router y dos ISP).', dev: 'P1-ADM-03', cmd: 'ping 203.0.113.10' },
    { say: 'La traducción estática de la web y las dinámicas del PAT.', dev: 'BCN-RT1', cmd: 'show ip nat translations' },
    { say: 'Desde Internet se llega a la web por el NAT estático.', dev: 'PC-INTERNET', cmd: 'browser http://www.logitrans.com' },
    { say: 'Pero a una IP interna, no: Internet no conoce las redes privadas.', dev: 'PC-INTERNET', cmd: 'ping 10.1.50.10' },
    { say: 'ISP-1 ni siquiera tiene ruta.', dev: 'ISP-1', cmd: 'show ip route 10.1.50.10' },
    { say: 'Hacia fuera, el ASA no deja pasar FTP: solo web, DNS e ICMP.', dev: 'P1-ADM-03', cmd: 'ftp 203.0.113.53' },
    { say: 'Los contadores del firewall: cada prueba sumó en su línea.', dev: 'BCN-FW', cmd: 'show access-list' }
  ]);
  add('intruso', '4.A1', 'Port Security: un PC intruso', 'Se desenchufa el PC de la roseta P1-R02 y se conecta otro. El switch apaga el puerto.', [
    { say: 'Los puertos protegidos: Fa0/3 admite una MAC, Fa0/2 tres (teléfono y PC) y Fa0/1, el AP, 32.', dev: 'BCN-P1-ACC1', cmd: 'show port-security' },
    { say: 'Desenchufamos P1-ADM-03 y conectamos un PC desconocido (MAC 000C.8587.538A) en la misma roseta.', act: 'intruder' },
    { say: 'El intruso intenta llegar a su puerta de enlace: el switch corta el puerto al ver la MAC.', dev: 'P1-ADM-03', cmd: 'ping 10.1.20.1' },
    { say: 'Secure-shutdown, una violación y la MAC del intruso.', dev: 'BCN-P1-ACC1', cmd: 'show port-security interface FastEthernet0/3' },
    { say: 'El puerto queda en err-disabled hasta que lo levante el NOC.', dev: 'BCN-P1-ACC1', cmd: 'show interfaces FastEthernet0/3 status' },
    { say: 'Volvemos a conectar el PC legítimo y el NOC levanta el puerto (shutdown y no shutdown).', act: 'restore' }
  ]);
  add('rogue', '4.A2', 'DHCP snooping: servidor pirata', 'Solo los troncales hacia los cores son de confianza. Una oferta DHCP por un puerto de usuario se tira.', [
    { say: 'Snooping activo, troncales trusted y los puertos de usuario con límite de 10 paquetes por segundo.', dev: 'BCN-P1-ACC1', cmd: 'show ip dhcp snooping' },
    { say: 'Alguien conecta un servidor DHCP pirata en un puerto de usuario.', act: 'rogueDhcp' },
    { say: 'El PC renueva y recibe los datos del servidor legítimo, 10.1.50.10.', dev: 'P1-ADM-03', cmd: 'ipconfig /renew' },
    { say: 'La tabla de bindings ata cada IP a una MAC, una VLAN y un puerto.', dev: 'BCN-P1-ACC1', cmd: 'show ip dhcp snooping binding' }
  ]);
  add('trunk', '4.A3', 'STP: cae un troncal', 'La raíz es el CORE1 a propósito. Apagamos el troncal Gi0/1 y el enlace de reserva toma el relevo.', [
    { say: 'Gi0/1 es Root FWD y Gi0/2 está bloqueado de reserva.', dev: 'BCN-P1-ACC1', cmd: 'show spanning-tree vlan 20' },
    { say: 'El CORE1 es la raíz.', dev: 'BCN-CORE1', cmd: 'show spanning-tree vlan 20' },
    { say: 'Apagamos el troncal hacia el CORE1.', act: 'cut' },
    { say: 'Ahora Gi0/2, hacia el CORE2, es Root FWD.', dev: 'BCN-P1-ACC1', cmd: 'show spanning-tree vlan 20' },
    { say: 'Y el PC sigue llegando al servidor, ahora por el CORE2.', dev: 'P1-ADM-03', cmd: 'ping 10.1.50.10' },
    { say: 'Levantamos el troncal otra vez.', act: 'uncut' }
  ]);
  add('bpdu', '4.A3', 'BPDU Guard: switch pirata', 'Un puerto de usuario nunca debe recibir una BPDU. Si la recibe, se apaga.', [
    { say: 'PortFast activo en el puerto del usuario.', dev: 'BCN-P1-ACC1', cmd: 'show spanning-tree interface FastEthernet0/3 detail' },
    { say: 'Y BPDU Guard en la configuración.', dev: 'BCN-P1-ACC1', cmd: 'show running-config interface FastEthernet0/3' },
    { say: 'Conectamos un switch en la roseta del usuario: manda BPDU.', act: 'rogueSw' },
    { say: 'Puerto en err-disabled.', dev: 'BCN-P1-ACC1', cmd: 'show interfaces FastEthernet0/3 status' },
    { say: 'Se retira el switch y el NOC levanta el puerto.', act: 'restore' }
  ]);
  add('acl-inv', '4.B1', 'ACL de invitados', 'El móvil de una visita en el SSID de invitados: DHCP, DNS y web, nada más.', [
    { say: 'IP de la VLAN 40 por DHCP.', dev: 'P0-INV-01', cmd: 'ipconfig' },
    { say: 'No llega a los servidores de Barcelona.', dev: 'P0-INV-01', cmd: 'ping 10.1.50.10' },
    { say: 'Ni a los de Zaragoza.', dev: 'P0-INV-01', cmd: 'ping 10.2.50.10' },
    { say: 'Ni hace ping a Internet: la lista no deja ICMP.', dev: 'P0-INV-01', cmd: 'ping 203.0.113.10' },
    { say: 'Navegar sí: DNS y HTTP están permitidos. Ojo: las líneas 30 y 40 dejan www y 443 hacia cualquier destino, también hacia la web interna 10.1.50.12.', dev: 'P0-INV-01', cmd: 'browser http://www.logitrans.com' },
    { say: 'Los contadores de cada línea.', dev: 'BCN-CORE1', cmd: 'show access-lists ACL-INVITADOS-IN' }
  ]);
  add('acl-ges', '4.B2', 'ACL de gestión', 'A la VLAN 99 solo entra el NOC. Y a las líneas VTY, solo por SSH desde la red de gestión.', [
    { say: 'Un PC de Administració no llega a la IP de gestión de un switch.', dev: 'P1-ADM-03', cmd: 'ping 10.1.99.4' },
    { say: 'Ni por SSH, aunque el usuario sea bueno.', dev: 'P1-ADM-03', cmd: 'ssh -l noc.admin 10.1.99.2' },
    { say: 'Desde el NOC sí entra.', dev: 'P3-GES-01', cmd: 'ssh -l admin.xarxa01 10.1.99.2' },
    { say: 'Telnet: el switch abre y cierra al instante, solo acepta SSH.', dev: 'P3-GES-01', cmd: 'telnet 10.1.99.2' },
    { say: 'La línea 90 (deny) sumando los intentos bloqueados.', dev: 'BCN-CORE1', cmd: 'show access-lists ACL-GESTION-OUT' }
  ]);
  add('acl-ope', '4.B3', 'ACL de operarios', 'Los terminales del muelle solo llegan a DHCP, DNS, la base de datos y la web. Mínimo privilegio.', [
    { say: 'Responde el core: Dirección no está entre los destinos permitidos.', dev: 'ZGZ-MUE-01', cmd: 'ping 10.2.10.5' },
    { say: 'Tampoco ICMP a los servidores.', dev: 'ZGZ-MUE-01', cmd: 'ping 10.2.50.10' },
    { say: 'Ni a los de Barcelona.', dev: 'ZGZ-MUE-01', cmd: 'ping 10.1.50.10' },
    { say: 'Ni salida libre a Internet.', dev: 'ZGZ-MUE-01', cmd: 'ping 203.0.113.10' },
    { say: 'Pero la web corporativa carga: es un servicio permitido (línea 40).', dev: 'ZGZ-MUE-01', cmd: 'browser http://www.logitrans.com' },
    { say: 'Los contadores de ACL-OPERARIOS-IN.', dev: 'ZGZ-CORE1', cmd: 'show access-lists ACL-OPERARIOS-IN' }
  ]);
  add('radius', '5.A2', 'RADIUS: login centralizado', 'Los usuarios del NOC no existen en los equipos: los valida SRV-HV01.', [
    { say: 'El servicio AAA del servidor, con los clientes RADIUS y los usuarios.', dev: 'SRV-HV01', cmd: 'aaa' },
    { say: 'Con una contraseña incorrecta, el servidor la rechaza.', dev: 'P3-GES-01', cmd: 'ssh -l admin.xarxa01 10.1.99.2 @bad' },
    { say: 'aaa new-model: primero RADIUS y, si no responde, la base local.', dev: 'BCN-RT1', cmd: 'show running-config | section aaa' },
    { say: 'SSH versión 2.', dev: 'BCN-RT1', cmd: 'show ip ssh' }
  ]);
  add('expo', '6.1', 'Exposición desde Internet', 'La mirada del atacante: desde fuera solo se ve la web.', [
    { say: 'El DNS público resuelve la web a 85.100.1.18.', dev: 'PC-INTERNET', cmd: 'nslookup www.logitrans.com' },
    { say: 'La web abre por la IP pública.', dev: 'PC-INTERNET', cmd: 'browser http://85.100.1.18' },
    { say: 'Pero la IP pública no responde al ping: el ASA solo deja entrar HTTP y HTTPS.', dev: 'PC-INTERNET', cmd: 'ping 85.100.1.18' },
    { say: 'Y una IP interna no existe desde fuera.', dev: 'PC-INTERNET', cmd: 'ping 10.1.20.10' },
    { say: 'En el firewall: la línea 6 (www) sube y la 10 (deny) también.', dev: 'BCN-FW', cmd: 'show access-list' },
    { say: 'La conexión web traducida por el NAT.', dev: 'BCN-RT1', cmd: 'show ip nat translations' }
  ]);
  add('l2check', '6.3', 'Revisión final de capa 2', 'La mitigación aplicada en toda la planta baja: Port Security, DHCP snooping y la VPN cifrando.', [
    { say: 'Todos los puertos de usuario protegidos.', dev: 'BCN-P0-ACC1', cmd: 'show port-security' },
    { say: 'Fa0/6 en Secure-up con su MAC sticky.', dev: 'BCN-P0-ACC1', cmd: 'show port-security interface fa0/6' },
    { say: 'Conectamos otro equipo en Fa0/6.', act: 'newP0' },
    { say: 'Secure-shutdown y la MAC del equipo nuevo.', dev: 'BCN-P0-ACC1', cmd: 'show port-security interface fa0/6' },
    { say: 'Bindings del snooping.', dev: 'BCN-P0-ACC1', cmd: 'show ip dhcp snooping binding' },
    { say: 'Y la VPN con el tráfico entre sedes cifrado.', dev: 'BCN-RT1', cmd: 'show crypto ipsec sa' }
  ]);
  LT.SC = {}; sc.forEach(function (s) { LT.SC[s.id] = s; });
})();
