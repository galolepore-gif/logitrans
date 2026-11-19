/* Punto 3 de la memoria: direccionamiento, VLAN, VPN, OSPF y NAT */
(function () {
  var LT = window.LT, D = LT.D;

  LT.sec({
    id: '3.A1', t: 'Direccionamiento IPv4 con VLSM', short: 'Direccionamiento IPv4 (VLSM)',
    lead: 'Una IP que se lee sola: el segundo octeto es la sede, el tercero la VLAN y el cuarto el equipo. Y cada máscara ajustada a los hosts reales más un 20 %.',
    sc: ['ipv4', 'Comprobá las SVI, las rutas y el HSRP de los cores escribiendo los comandos vos mismo.'],
    subs: [
      ['3.A1.1', 'Decisión de diseño: 10.SEDE.VLAN.HOST',
        D.p('Elegimos el espacio privado 10.0.0.0/8 (RFC 1918) y una convención de tres niveles que hace que cada IP se explique sola:') +
        D.ul(['<b>Segundo octeto → la sede.</b> 1 = oficina central, 2 = almacén. Del 3 al 254 queda libre para futuras delegaciones.', '<b>Tercer octeto → coincide con el ID de la VLAN</b> (10, 20, 30, 40, 50, 99).', '<b>Cuarto octeto → el host.</b>']) +
        D.p('Escribí cualquier IP de la empresa y mirá cómo se lee:') + D.w('ipdecode') +
        D.p('Esto da dos ventajas importantes:') +
        D.ul(['<b>Diagnóstico rápido.</b> Cualquier técnico que vea una IP en un log sabe al momento a qué sede y a qué departamento pertenece, sin consultar ninguna tabla.', '<b>Crecimiento sin reestructurar.</b> Como cada sede solo consume un valor del segundo octeto, se pueden abrir hasta 253 delegaciones nuevas sin tocar nada de lo hecho.']) +
        D.p('Además, cada subred se dimensiona con VLSM ajustando la máscara al número real de hosts más un 20 % de margen, como pidió el cliente.')],
      ['3.A1.2', 'Cambios respecto al Sprint 1',
        D.p('Al montar el Packet Tracer sobre los planos definitivos revisamos los tamaños y dos subredes tuvieron que crecer:') +
        D.note('<b>VLAN 20 de Barcelona: de /25 a /23.</b> En el Sprint 1 contamos solo al personal administrativo (67 puestos). Pero en los planos, como el cliente no define ninguna VLAN propia para tráfico y operaciones, todos los open space de la P1 (operaciones, flota y tráfico, 117 puestos), los de la P2 (finanzas, compras y comercial, 93 puestos), las salas de trabajo de la P0 y el open space de control de gestión de la P3 están en la VLAN 20. Son más de 220 puestos; con el 20 % de margen superan los 254 hosts de una /24, así que la máscara correcta es /23 (510 hosts).', 'fix', 'Cambio 1') +
        D.note('<b>VLAN 99 de Zaragoza: de /29 a /26.</b> En el Sprint 1 contamos solo los ordenadores de la sala de gestión (3). Pero la VLAN de gestión necesita una IP por cada equipo de red que se administra: 17 puntos de acceso, 4 switches de acceso, 2 cores, el firewall y 2 routers, además de los ordenadores de gestión. Son 26 equipos; con el 20 % salen 32, que no caben en una /27 (30 útiles), así que la máscara correcta es /26 (62).', 'fix', 'Cambio 2') +
        D.p('El resto de subredes no cambia. Como cada sede sigue usando un solo valor del segundo octeto, estos cambios no afectan al espacio reservado para futuras delegaciones.')],
      ['3.A1.3', 'Subredes de la oficina central (10.1.X.0)',
        D.p('Siempre se reserva la primera dirección útil (.1) como gateway. Hacé clic en un bloque para ver su detalle:') +
        D.w('vlsm', { site: 'BCN' }) +
        D.tbl(['VLAN', 'Red', 'Máscara', 'Hosts', '+20 %', 'Útiles', 'Gateway', 'Rango útil', 'Broadcast'], [
          [D.vl(10) + ' Direcció', '10.1.10.0/26', '255.255.255.192', '42', '51', '62', '10.1.10.1', '.2 – .62', '10.1.10.63'],
          [D.vl(20) + ' Administració', '10.1.20.0/23', '255.255.254.0', '220+', '264+', '510', '10.1.20.1', '10.1.20.2 – 10.1.21.254', '10.1.21.255'],
          [D.vl(40) + ' Convidats', '10.1.40.0/25', '255.255.255.128', '100', '120', '126', '10.1.40.1', '.2 – .126', '10.1.40.127'],
          [D.vl(50) + ' Servidors', '10.1.50.0/25', '255.255.255.128', '58', '70', '126', '10.1.50.1', '.2 – .126', '10.1.50.127'],
          [D.vl(99) + ' Gestió', '10.1.99.0/27', '255.255.255.224', '17', '21', '30', '10.1.99.1', '.2 – .30', '10.1.99.31']
        ], 'Tabla 13. Subredes IPv4 de la oficina central.', { mono: [1, 2, 6, 7, 8] })],
      ['3.A1.4', 'Subredes del almacén (10.2.X.0)',
        D.p('Mismo criterio, con máscaras más ajustadas porque el almacén tiene menos hosts en cada VLAN, salvo en su propia VLAN 30.') +
        D.w('vlsm', { site: 'ZGZ' }) +
        D.tbl(['VLAN', 'Red', 'Máscara', 'Hosts', '+20 %', 'Útiles', 'Gateway', 'Rango útil', 'Broadcast'], [
          [D.vl(10) + ' Direcció', '10.2.10.0/28', '255.255.255.240', '8', '10', '14', '10.2.10.1', '.2 – .14', '10.2.10.15'],
          [D.vl(20) + ' Administració', '10.2.20.0/27', '255.255.255.224', '13', '16', '30', '10.2.20.1', '.2 – .30', '10.2.20.31'],
          [D.vl(30) + ' Magatzem', '10.2.30.0/25', '255.255.255.128', '80', '96', '126', '10.2.30.1', '.2 – .126', '10.2.30.127'],
          [D.vl(40) + ' Convidats', '10.2.40.0/27', '255.255.255.224', '20', '24', '30', '10.2.40.1', '.2 – .30', '10.2.40.31'],
          [D.vl(50) + ' Servidors', '10.2.50.0/27', '255.255.255.224', '12', '15', '30', '10.2.50.1', '.2 – .30', '10.2.50.31'],
          [D.vl(99) + ' Gestió', '10.2.99.0/26', '255.255.255.192', '26', '32', '62', '10.2.99.1', '.2 – .62', '10.2.99.63']
        ], 'Tabla 14. Subredes IPv4 del almacén.', { mono: [1, 2, 6, 7, 8] })],
      ['3.A1.5', 'Enlaces WAN y direcciones públicas',
        D.p('Para los enlaces entre routers y hacia Internet usamos subredes /30 (justo 2 direcciones útiles, una en cada extremo).') +
        D.tbl(['Enlace', 'Red', 'Extremo A', 'Extremo B'], [
          ['Túnel VPN (oficina ↔ almacén)', '10.0.0.0/30', '10.0.0.1 — BCN-RT1', '10.0.0.2 — ZGZ-RT1'],
          ['ISP ↔ Oficina central (principal)', '85.100.1.0/30', '85.100.1.1 — ISP', '85.100.1.2 — BCN-RT1 (WAN)'],
          ['ISP ↔ Oficina central (respaldo)', '85.100.1.4/30', '85.100.1.5 — ISP', '85.100.1.6 — BCN-RT2 (WAN)'],
          ['ISP ↔ Almacén (principal)', '85.100.2.0/30', '85.100.2.1 — ISP', '85.100.2.2 — ZGZ-RT1 (WAN)'],
          ['ISP ↔ Almacén (respaldo)', '85.100.2.4/30', '85.100.2.5 — ISP', '85.100.2.6 — ZGZ-RT2 (WAN)']
        ], 'Tabla 15. Enlaces WAN.', { mono: [1, 2, 3] }) +
        D.p('Las direcciones 85.100.X.X son públicas simuladas para el entorno del Packet Tracer. En producción las asignaría el proveedor de Internet.',
          'Dentro de cada sede, los enlaces internos entre el core, el firewall y los routers también son /30, y reutilizan el tercer octeto para la infraestructura (253, 254 y 255), que no corresponde a ninguna VLAN de usuario:') +
        D.tbl(['Enlace interno (S = 1 BCN, 2 ZGZ)', 'Red', 'Extremo A', 'Extremo B'], [
          ['Firewall ↔ CORE1', '10.S.253.0/30', '.1 — ASA (inside)', '.2 — CORE1'],
          ['Firewall ↔ CORE2', '10.S.253.4/30', '.5 — ASA (corebak)', '.6 — CORE2'],
          ['CORE1 ↔ CORE2 (VLAN 900)', '10.S.253.8/30', '.9 — CORE1', '.10 — CORE2'],
          ['RT1 ↔ firewall', '10.S.254.0/30', '.1 — RT1', '.2 — ASA (outside)'],
          ['RT2 ↔ firewall', '10.S.254.4/30', '.5 — RT2', '.6 — ASA (wanbak)'],
          ['RT1 ↔ RT2', '10.S.255.0/30', '.1 — RT1', '.2 — RT2']
        ], 'Tabla 16. Enlaces de tránsito dentro de cada sede.', { mono: [1, 2, 3] })],
      ['3.A1.6', 'NAT',
        D.p('En cada sede el router frontera aplica:') +
        D.ul(['<b>NAT de origen (PAT)</b>: todas las VLAN internas salen a Internet con la IP pública de su WAN. Así ninguna IP interna queda expuesta.',
          '<b>NAT estático</b>: el servidor web (10.1.50.12, en la oficina) se publica en Internet con la IP pública <b>85.100.1.18</b> en los puertos 80 y 443, para que cualquier cliente llegue a logitrans.com y a logitrans.com/clients desde fuera. Usamos una IP pública propia para la web (y no la de la WAN del router, como decíamos en el Sprint 1) para no mezclar el tráfico publicado con el PAT de toda la oficina.']) +
        D.p('La configuración y las comprobaciones del NAT están en el punto <a href="#/s/3.C3">3.C3</a>.')],
      ['3.A1.7', 'DHCP',
        D.p('Todas las direcciones de cliente (PC, portátiles, teléfonos IP, impresoras, terminales de muelle) se reparten por DHCP, como pidió el cliente. Solo llevan IP fija:') +
        D.ul(['Routers y switches (interfaz de gestión).', 'Servidores.', 'AP.', 'Impresoras y dispositivos que necesitan reserva fija por DHCP.']) +
        D.p('En el Packet Tracer el servicio DHCP está en los servidores de cada sede (SRV-HV01 en Barcelona y SRV-ZGZ01 en Zaragoza), en la VLAN 50, y no en los switches. Como los PC están en otras VLAN, cada SVI del core lleva un <code>ip helper-address</code> que reenvía las peticiones DHCP al servidor (relay DHCP). Los rangos empiezan en la .11 para dejar las primeras direcciones a la puerta de enlace virtual (.1), a los dos cores (.2 y .3) y a los equipos con IP fija.') +
        D.w('dhcp')],
      ['3.A1.8', 'Consumo total',
        D.p('Entre las dos sedes y los enlaces WAN asignamos unas <b>1.240 direcciones</b> del rango 10.0.0.0/8, que tiene 16.777.214 direcciones útiles. Es decir, usamos <b>menos del 0,01 %</b> del total, con margen de sobra para todas las delegaciones que la empresa pueda abrir.') + D.w('usage')],
      ['3.A1.9', 'Comprobaciones en el Packet Tracer',
        D.chk('BCN-CORE1', 'show ip interface brief', 'Que cada VLAN tiene su SVI con la dirección .2 y está up/up: Vlan10 10.1.10.2, Vlan20 10.1.20.2, Vlan40 10.1.40.2, Vlan50 10.1.50.2 y Vlan99 10.1.99.2, además de los enlaces de tránsito (Vlan900 y Gi1/0/20).', 14) +
        D.chk('BCN-CORE1', 'show ip route', 'Las redes de cada VLAN como conectadas (C) con su máscara: 10.1.10.0/26, 10.1.20.0/23, 10.1.40.0/25, 10.1.50.0/25 y 10.1.99.0/27. Es la prueba de que las máscaras aplicadas son las de la tabla.', 15) +
        D.chk('ZGZ-CORE1', 'show ip route', 'Lo mismo en el almacén: 10.2.10.0/28, 10.2.20.0/27, 10.2.30.0/25, 10.2.40.0/27, 10.2.50.0/27 y 10.2.99.0/26.', 16) +
        D.chk('BCN-CORE1', 'show standby brief', 'Que todas las VLAN tienen el CORE1 como Active con prioridad 110 y la IP virtual .1.', 17) +
        D.chk('SRV-HV01', 'Services → DHCP', 'Los ámbitos de cada VLAN de Barcelona, con su puerta de enlace .1, la máscara y el DNS.', 18, 'SRV-HV01|dhcp') +
        D.chk('P1-ADM-03', 'ipconfig', 'Que el PC recibió por DHCP una IP de la VLAN 20, la máscara 255.255.254.0 y la puerta de enlace 10.1.20.1.', 19)]
    ]
  });

  LT.sec({
    id: '3.A2', t: 'Direccionamiento IPv6 corporativo', short: 'Direccionamiento IPv6',
    lead: 'La red funciona hoy en IPv4, pero queda preparada para IPv6 con doble pila: cada equipo tiene las dos direcciones y se puede migrar servicio a servicio sin parar la empresa.',
    sc: ['ipv6', 'Mirá las direcciones IPv6 de los cores y hacé un ping IPv6 de la VLAN 20 al servidor.'],
    subs: [
      ['3.A2.1', 'Decisión de diseño',
        D.p('Aunque ahora la red funcionará con IPv4, el cliente pidió dejarla preparada para la migración a IPv6. Elegimos la estrategia más sencilla y extendida: <b>doble pila (dual-stack)</b>. Cada router, switch y servidor tiene a la vez dirección IPv4 e IPv6. Así se puede migrar servicio por servicio cuando se decida, sin parar la empresa en ningún momento.')],
      ['3.A2.2', 'Prefijo corporativo y estructura',
        D.p('Para la simulación usamos el prefijo de documentación <code>2001:db8:acad::/48</code>, el habitual en los laboratorios de Cisco y en el Packet Tracer. En un despliegue real, el proveedor asignaría un /48 público o se usaría un prefijo ULA (fd00::/8) para redes internas.',
          'Los 16 bits que identifican la subred (posiciones 48 a 63) los estructuramos como <b>SVVV</b>:') +
        D.ul(['<b>S</b> → número de sede (1 = oficina central, 2 = almacén).', '<b>VVV</b> → ID de VLAN escrito con tres cifras para que coincida visualmente con el decimal (010, 020, 030, 040, 050, 099).']) +
        D.w('v6') +
        D.p('Todas las subredes usan /64, el estándar para cualquier segmento LAN en IPv6 y lo que permite la autoconfiguración SLAAC (los clientes se generan su propia IPv6 sin DHCP).',
          'Mantenemos el mismo criterio que en IPv4 (sede + VLAN) para que cualquier técnico reconozca cada rango de un vistazo. Además, como todo lo de una sede empieza por el mismo dígito, cada sede se resume en un solo prefijo /52 (<code>2001:db8:acad:1000::/52</code> para Barcelona y <code>2001:db8:acad:2000::/52</code> para Zaragoza), que es lo que se anuncia entre sedes.')],
      ['3.A2.3', 'Subredes IPv6 de la oficina central',
        D.tbl(['VLAN', 'Red IPv6', 'CORE1 / CORE2'], [
          [D.vl(10) + ' Direcció', '2001:db8:acad:1010::/64', '…:1010::2 / …:1010::3'], [D.vl(20) + ' Administració', '2001:db8:acad:1020::/64', '…:1020::2 / …:1020::3'], [D.vl(40) + ' Convidats', '2001:db8:acad:1040::/64', '…:1040::2 / …:1040::3'], [D.vl(50) + ' Servidors', '2001:db8:acad:1050::/64', '…:1050::2 / …:1050::3'], [D.vl(99) + ' Gestió', '2001:db8:acad:1099::/64', '…:1099::2 / …:1099::3']
        ], 'Tabla 17. Subredes IPv6 de la oficina central.', { mono: [1, 2] })],
      ['3.A2.4', 'Subredes IPv6 del almacén',
        D.tbl(['VLAN', 'Red IPv6', 'CORE1 / CORE2'], [
          [D.vl(10) + ' Direcció', '2001:db8:acad:2010::/64', '…:2010::2 / …:2010::3'], [D.vl(20) + ' Administració', '2001:db8:acad:2020::/64', '…:2020::2 / …:2020::3'], [D.vl(30) + ' Magatzem', '2001:db8:acad:2030::/64', '…:2030::2 / …:2030::3'], [D.vl(40) + ' Convidats', '2001:db8:acad:2040::/64', '…:2040::2 / …:2040::3'], [D.vl(50) + ' Servidors', '2001:db8:acad:2050::/64', '…:2050::2 / …:2050::3'], [D.vl(99) + ' Gestió', '2001:db8:acad:2099::/64', '…:2099::2 / …:2099::3']
        ], 'Tabla 18. Subredes IPv6 del almacén.', { mono: [1, 2] }) +
        D.note('En el Sprint 1 indicábamos la ::1 como puerta de enlace. En el Packet Tracer los cores tienen la ::2 y la ::3, y los clientes no necesitan ninguna dirección global como puerta de enlace: en IPv6 la puerta de enlace es siempre una dirección link-local (FE80::) que el cliente aprende por el anuncio de router (RA). Para mantener la redundancia también en IPv6, cada VLAN tiene un grupo HSRP de IPv6 que genera una link-local virtual compartida entre los dos cores.', 'fix')],
      ['3.A2.5', 'Enlaces WAN en IPv6',
        D.p('Para los enlaces entre routers y hacia Internet usamos el prefijo f0XX en el campo de subred, para que queden visualmente separados de las VLAN de usuario. Los enlaces internos de cada sede usan SF0X (1F01, 1F02… en Barcelona y 2F01, 2F02… en Zaragoza), dentro del /52 de su sede.') +
        D.tbl(['Enlace', 'Red IPv6'], [
          ['Túnel VPN (oficina ↔ almacén)', '2001:db8:acad:f001::/64'], ['ISP ↔ Oficina central', '2001:db8:acad:f002::/64'], ['ISP ↔ Almacén', '2001:db8:acad:f003::/64'],
          ['Firewall ↔ CORE1 / CORE2', '2001:db8:acad:SF01::/64 y SF02::/64'], ['RT1 ↔ firewall / RT2 ↔ firewall', '2001:db8:acad:SF03::/64 y SF04::/64'], ['RT1 ↔ RT2 / CORE1 ↔ CORE2', '2001:db8:acad:SF05::/64 y SF06::/64']
        ], 'Tabla 19. Enlaces WAN y de tránsito en IPv6 (S = 1 o 2).', { mono: [1] })],
      ['3.A2.6', 'Cómo se reparte IPv6 a los clientes',
        D.p('En IPv6 no hace falta DHCP: los clientes pueden autoconfigurarse con SLAAC a partir del prefijo /64 que anuncia el router. En nuestro entorno usamos esta combinación:') +
        D.ul(['<b>Clientes normales</b> (PC, portátiles, móviles) → SLAAC + DNS por DHCPv6 stateless. No hay que mantener una tabla de concesiones y aun así los clientes reciben el DNS corporativo. En el Packet Tracer lo hace cada SVI del core con <code>ipv6 nd other-config-flag</code> y un pool <code>ipv6 dhcp pool V6-DNS</code> que solo reparte el DNS y el dominio.',
          '<b>Routers, switches y cores</b> → IPv6 fija, como en IPv4.',
          '<b>Servidores</b> → en el diseño real, IPv6 fija. En el Packet Tracer los servidores no guardan la IPv6 estática dentro del archivo, así que usan SLAAC (dirección EUI-64 derivada de la MAC, que no cambia).']) +
        D.p('Así se genera una dirección SLAAC con EUI-64 a partir de la MAC:') + D.w('eui64')],
      ['3.A2.7', 'Tabla maestra IPv4 + IPv6',
        D.p('Todas las subredes del proyecto en una sola tabla, combinando IPv4 e IPv6: es el documento de referencia para configurar interfaces en el Packet Tracer o en cualquier equipo real.') +
        D.tbl(['VLAN', 'Red IPv4', 'Máscara', 'Gateway IPv4', 'Red IPv6'], LT.SUBNETS.map(function (s) {
          return [s.site + ' ' + D.vl(s.vlan) + ' ' + LT.VLANS.filter(function (v) { return v.id === s.vlan; })[0].name, s.net + '/' + s.cidr, s.mask, s.gw, s.v6];
        }).concat([['Túnel VPN', '10.0.0.0/30', '255.255.255.252', '—', '2001:db8:acad:f001::/64'], ['ISP ↔ Oficina', '85.100.1.0/30', '255.255.255.252', '—', '2001:db8:acad:f002::/64'], ['ISP ↔ Almacén', '85.100.2.0/30', '255.255.255.252', '—', '2001:db8:acad:f003::/64']]), 'Tabla maestra IPv4 + IPv6.', { mono: [1, 2, 3, 4] })],
      ['3.A2.8', 'Comprobaciones en el Packet Tracer',
        D.chk('BCN-CORE1', 'show ipv6 interface brief', 'Que cada SVI está up/up con la link-local FE80::2 y su dirección global 2001:DB8:ACAD:1VVV::2. La link-local virtual de HSRP se ve en el show standby brief del punto 3.A1.9.', 20) +
        D.chk('BCN-CORE1', 'show ipv6 route', 'Una ruta conectada (C) 2001:DB8:ACAD:1VVV::/64 para cada VLAN y la ruta por defecto ::/0 hacia el firewall.', 21) +
        D.chk('P1-ADM-03', 'ipconfig', 'Que el PC tiene, además de la IPv4, una dirección IPv6 global 2001:DB8:ACAD:1020:… generada por SLAAC y una puerta de enlace IPv6 link-local (FE80::…).', 22, 'P1-ADM-03|ipconfig /all') +
        D.chk('P1-ADM-03', 'ping 2001:db8:acad:1050:209:30ff:fe23:46ba', 'Que hay conectividad IPv6 entre VLAN: el PC de la VLAN 20 llega al servidor SRV-HV01 de la VLAN 50.', 23) +
        D.chk('ZGZ-MUE-01', 'ipconfig', 'Que los clientes del almacén también reciben una dirección 2001:DB8:ACAD:2030:… por SLAAC.', 24)]
    ]
  });

  LT.sec({
    id: '3.B', t: 'Segmentación en 6 VLAN obligatorias', short: 'Segmentación en 6 VLAN',
    lead: 'Aislar el tráfico por departamento, aplicar políticas de seguridad distintas a cada uno y hacer la red fácil de administrar.',
    sc: ['vlan', 'Probá quién llega a quién: elegí un origen y un destino y mirá qué deja pasar cada VLAN.'],
    subs: [
      ['3.B.1', 'Contexto y criterios',
        D.p('LogiTrans tiene dos sedes físicas unidas por VPN IPsec: una oficina central (350 puestos) y un almacén de distribución (150 puestos). La segmentación en VLAN responde a tres objetivos: aislar el tráfico por departamento, aplicar políticas de seguridad diferenciadas y facilitar la administración de la red.') +
        D.ul(['Cada departamento tiene su propia VLAN, con un ID entre 10 y 99.', 'Todas las VLAN están en las dos sedes salvo Magatzem, que solo existe en el almacén.', 'Los hosts se reparten de forma proporcional: la oficina central dispone de 350 plazas y el almacén de 70 libres (150 en total menos 80 de la VLAN Magatzem).', 'Cada VLAN se dimensiona con un margen de crecimiento del 20 % sobre los hosts actuales.', 'La VLAN de Convidats funciona solo por Wi-Fi, aislada de los servidores internos y con acceso solo a Internet.', 'La VLAN de Gestió se usa únicamente para administrar los equipos de red (switches, routers, AP y firewalls).'])],
      ['3.B.2', 'Tabla resumen de VLAN',
        D.w('vlancards') +
        D.tbl(['ID', 'Nombre', 'Propósito', 'Hosts', '+20 %', 'Acceso', 'Presencia'], LT.VLANS.map(function (v) { return [D.vl(v.id), v.name, v.purpose, v.hosts, v.plus, v.access, v.where]; }), 'Tabla 20. VLAN del proyecto.') +
        D.p('Además de estas seis, en los switches hay tres VLAN técnicas que no llevan usuarios: la <b>999 (Nativa)</b>, que es la VLAN nativa de los troncales y no tiene ningún puerto; la <b>998 (SinUso)</b>, donde van todos los puertos libres, apagados; y la <b>900</b>, que solo existe entre los dos cores para el enlace de tránsito entre ellos.')],
      ['3.B.3', 'Distribución proporcional entre sedes',
        D.p('La VLAN Magatzem (80 hosts) ocupa toda su cuota en el almacén. Las 5 VLAN restantes se reparten entre la oficina central (350 plazas) y las 70 plazas libres del almacén, con una proporción de 350:70, es decir, <b>83,3 % oficina y 16,7 % almacén</b>.') +
        D.w('split') +
        D.tbl(['VLAN', 'Total', 'Oficina central', 'Almacén'], [['Direcció', 50, 42, 8], ['Administració', 80, 67, 13], ['Magatzem', 80, 0, 80], ['Convidats', 120, 100, 20], ['Servidors', 70, 58, 12], ['Gestió', 20, 17, 3], ['!Total', 420, 284, 136]], 'Tabla 21. Distribución proporcional de hosts entre sedes.', { mono: [1, 2, 3] }) +
        D.p('La oficina central queda con 284 puestos asignados de 350 disponibles (66 plazas de reserva física). El almacén queda con 136 de 150 (14 plazas de reserva). Estas plazas libres permiten crecer sin obra.',
          'Este reparto es el de los departamentos que definió el cliente. En los planos definitivos, el personal de tráfico y operaciones (que no tiene VLAN propia) y todos los equipos de red del almacén hacen crecer la VLAN 20 de Barcelona y la 99 de Zaragoza; por eso esas dos subredes son más grandes (punto 3.A1).')],
      ['3.B.4', 'Características especiales y restricciones de seguridad',
        D.ul(['<b>VLAN 10 · Direcció.</b> Acceso completo a servidores internos e Internet. Los equipos directivos llegan a todas las VLAN salvo Gestió (reservada a los administradores de red).',
          '<b>VLAN 20 · Administració.</b> Acceso a servidores internos (AD, archivos, web interna) e Internet. Sin acceso a la VLAN de Gestió.',
          '<b>VLAN 30 · Magatzem.</b> Acceso a los servidores internos necesarios para la operativa (AD, aplicaciones de logística, archivos compartidos). Sin acceso a Gestió. Solo existe en el almacén.',
          '<b>VLAN 40 · Convidats.</b> Red completamente aislada, solo Internet por Wi-Fi. Sin acceso a ningún servidor interno ni a otra VLAN. El Wi-Fi de los empleados usa credenciales de Active Directory por RADIUS (802.1X); los invitados entran por un portal cautivo independiente.',
          '<b>VLAN 50 · Servidors.</b> Aloja todos los servicios centrales: Active Directory, DNS, DHCP, servidor web (logitrans.com y /clients), RADIUS, streaming, repositorio de software y FOG. Los servidores usan RAID 5 y cifrado de disco completo. Desde Internet solo se llega al servidor web mediante NAT y reglas de firewall.',
          '<b>VLAN 99 · Gestió.</b> Acceso exclusivo para los administradores de red. Los switches, routers, AP y firewalls tienen aquí su interfaz de gestión. La autenticación de los equipos Cisco usa AAA contra Active Directory. El acceso se restringe a las cuentas del departamento de TI.']) +
        D.p('Hacé clic en una celda para saber si un origen llega a un destino y por qué:') + D.w('vlanmatrix') +
        D.p('Estas restricciones se aplican en el Packet Tracer con las listas de acceso de los puntos <a href="#/s/4.B1">4.B1</a> (Convidats), <a href="#/s/4.B2">4.B2</a> (Gestió) y <a href="#/s/4.B3">4.B3</a> (operarios del almacén).')],
      ['3.B.5', 'Comprobaciones en el Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show vlan brief', 'Las VLAN 10, 20, 40, 50 y 99 con su nombre, la 998 con todos los puertos libres y la 999 sin puertos. La VLAN 30 no está, porque solo existe en el almacén. Cada puerto ocupado está en la VLAN de su departamento.', 25) +
        D.chk('ZGZ-ACC1', 'show vlan brief', 'Las mismas VLAN y, además, la 30 (Almacen). Es el switch de las oficinas del almacén, por eso la VLAN 30 no tiene puertos: los terminales de los operarios van a los switches de la nave (ZGZ-ACC2 y ZGZ-ACC4). La VLAN está para que pase por los troncales.', 26) +
        D.chk('BCN-P1-ACC1', 'show interfaces trunk', 'Gi0/1 y Gi0/2 en modo trunking, VLAN nativa 999 y solo las VLAN de la sede permitidas.', 27) +
        D.chk('BCN-P1-ACC1', 'show vtp status', 'VTP Operating Mode: Transparent.', 28) +
        D.chk('P1-ADM-03', 'ping 10.1.20.5', 'Conectividad dentro de la misma VLAN: el PC llega a la impresora P0-IMP-02, que está en la VLAN 20 pero en otra planta.', 29) +
        D.chk('P1-ADM-03', 'ping 10.1.50.10', 'Conectividad entre VLAN: el PC de la VLAN 20 llega al servidor de la VLAN 50 pasando por el core (TTL 127).', 30) +
        D.chk('ZGZ-MUE-01', 'ping 10.2.30.5', 'Conectividad dentro de la VLAN 30 del almacén: el terminal del operario llega a la impresora de etiquetas ZGZ-ETQ-02.', 31)]
    ]
  });

  LT.sec({
    id: '3.C1', t: 'Interconexión VPN site-to-site', short: 'VPN site-to-site',
    lead: 'Las dos sedes funcionan como una sola red local. Entre ellas, Internet; encima, un túnel GRE cifrado con IPsec.',
    sc: ['vpn', 'Mandá un ping de Barcelona a Zaragoza y mirá cómo se negocia la VPN y se cifra cada paquete.'],
    subs: [
      ['3.C1.1', 'Qué hicimos y por qué',
        D.p('El cliente quiere que las dos sedes funcionen como una sola red local, con los servicios de una accesibles desde la otra, mediante una VPN IPsec de sitio a sitio fija. La VPN va entre los dos routers principales: <b>BCN-RT1 (85.100.1.2)</b> y <b>ZGZ-RT1 (85.100.2.2)</b>.',
          'Hicimos una <b>VPN GRE sobre IPsec</b>: un túnel GRE (Tunnel0) entre los dos routers, y todo el tráfico de ese túnel cifrado con IPsec. El motivo es que IPsec solo cifra tráfico unicast y no deja pasar el multicast de los protocolos de enrutamiento. Con el túnel GRE por dentro, OSPF funciona a través de la VPN y cada sede aprende sola las redes de la otra (punto 3.C2): si mañana se añade una VLAN, no hay que tocar la VPN.') +
        D.p('Avanzá paso a paso para ver qué le pasa a un paquete de Barcelona a Zaragoza:') + D.w('vpn') +
        D.tbl(['Parámetro', 'Valor', 'Por qué'], [
          ['Fase 1 (IKE / ISAKMP)', 'AES 256, hash SHA, clave precompartida, grupo Diffie-Hellman 5', 'Negocia de forma segura las claves entre los dos routers.'],
          ['Fase 2 (IPsec)', 'ESP con AES 256 y SHA-HMAC (transform-set TS-LOGITRANS)', 'Cifra (AES) y garantiza la integridad (SHA) de cada paquete.'],
          ['Qué se cifra', 'ACL-VPN-GRE: todo el GRE entre 85.100.1.2 y 85.100.2.2', 'Todo lo que va por el túnel queda cifrado.'],
          ['Túnel', 'Tunnel0: 10.0.0.1/30 ↔ 10.0.0.2/30 (IPv6 2001:db8:acad:f001::/64)', 'Red punto a punto entre sedes.'],
          ['Sin NAT', 'ACL-NAT excluye el tráfico 10.1.0.0/16 ↔ 10.2.0.0/16', 'El tráfico entre sedes viaja con las IP privadas originales.']
        ], 'Tabla 22. Parámetros de la VPN.') +
        D.p('Además, los firewalls de cada sede dejan pasar el tráfico entre las dos redes internas (10.1.0.0/16 ↔ 10.2.0.0/16), porque lo que llega por la VPN entra al firewall por la interfaz exterior.')],
      ['3.C1.2', 'Comprobaciones en el Packet Tracer',
        D.note('Antes de mirar la VPN hay que generar tráfico entre sedes (por ejemplo el primer ping de abajo): la VPN se negocia la primera vez que se manda un paquete hacia la otra sede, y por eso el primer paquete se puede perder.') +
        D.chk('P1-ADM-03', 'ping 10.2.50.10', 'Que un PC de Barcelona llega al servidor de Zaragoza a través de la VPN. El TTL de 122 muestra que el paquete atravesó el core, el firewall y el router de cada sede y el túnel.', 32) +
        D.chk('ZGZ-DIR-01', 'ping 10.1.50.10', 'Lo mismo en sentido contrario: un PC de Direcció del almacén llega al servidor de Barcelona. La prueba se hace desde la VLAN 10 porque la VLAN 30 de los operarios tiene bloqueado el ping a los servidores por su ACL (punto 4.B3).', 33) +
        D.chk('BCN-RT1', 'show interfaces tunnel0', 'Tunnel0 is up, line protocol is up, con origen 85.100.1.2, destino 85.100.2.2 y protocolo GRE/IP.', 34) +
        D.chk('BCN-RT1', 'show crypto isakmp sa', 'La fase 1 establecida con ZGZ-RT1: dst 85.100.2.2, src 85.100.1.2, estado QM_IDLE y ACTIVE.', 35) +
        D.chk('BCN-RT1', 'show crypto ipsec sa', 'La fase 2: los contadores #pkts encaps/encrypt y #pkts decaps/decrypt son mayores que 0 (el tráfico entre sedes viaja cifrado) y las SA de entrada y salida son esp-aes 256 esp-sha-hmac.', 36) +
        D.chk('BCN-RT1', 'show crypto map', 'El crypto map CMAP-VPN con el peer 85.100.2.2, el transform-set TS-LOGITRANS y aplicado a GigabitEthernet0/0/0.', 37) +
        D.chk('ZGZ-DIR-01', 'Web Browser → http://www.logitrans.com', 'Que un servicio de Barcelona (la web corporativa, en SRV-HV03) se usa desde Zaragoza: es el requisito del cliente de que los servicios de una sede sean accesibles desde la otra.', 38, 'ZGZ-DIR-01|browser http://www.logitrans.com')]
    ]
  });

  LT.sec({
    id: '3.C2', t: 'Enrutamiento OSPFv2 / OSPFv3 con autenticación', short: 'OSPFv2 / OSPFv3',
    lead: 'Un Internet simulado con cuatro routers en anillo, OSPF con MD5 para que nadie inyecte rutas falsas, y cada sede aprendiendo la otra a través de la VPN.',
    sc: ['ospf', 'Mirá los vecinos OSPF y lo que pasa cuando un router pirata intenta anunciar rutas.'],
    subs: [
      ['3.C2.1', 'Internet simulado',
        D.p('Internet se simula con cuatro routers ISR 4331 (ISP-1 a ISP-4) en anillo: ISP-1 con ISP-2 e ISP-3, e ISP-4 con ISP-2 e ISP-3. Cada router de la empresa se conecta a un ISP distinto (BCN-RT1 a ISP-1, BCN-RT2 a ISP-2, ZGZ-RT1 a ISP-3 y ZGZ-RT2 a ISP-4), así que la caída de un ISP no deja a ninguna sede sin Internet. En ISP-2 hay además una pequeña red de Internet (203.0.113.0/24) con un PC de pruebas (PC-INTERNET) y un DNS público (DNS-PUBLICO), para probar la red desde fuera.') +
        D.tbl(['Enlace', 'Red IPv4', 'Red IPv6'], [['ISP-1 ↔ ISP-2', '200.0.0.0/30', '2001:db8:ffff:1::/64'], ['ISP-1 ↔ ISP-3', '200.0.0.4/30', '2001:db8:ffff:2::/64'], ['ISP-2 ↔ ISP-4', '200.0.0.8/30', '2001:db8:ffff:3::/64'], ['ISP-3 ↔ ISP-4', '200.0.0.12/30', '2001:db8:ffff:4::/64'], ['LAN de Internet (ISP-2)', '203.0.113.0/24', '2001:db8:ffff:100::/64']], 'Tabla 23. Redes del Internet simulado.', { mono: [1, 2] }) +
        D.p('Los cuatro ISP usan OSPFv2 (proceso 1, área 0) para IPv4 y OSPFv3 (proceso 1) para IPv6. Los enlaces entre ISP tienen <b>autenticación MD5</b>: un router solo acepta vecinos OSPF que conozcan la clave, así nadie puede conectar un router e inyectar rutas falsas. Los enlaces hacia los clientes (Gi0/0/0) son pasivos: se anuncian, pero no se forma vecindad con los routers de la empresa. Cada ISP redistribuye sus rutas estáticas hacia los clientes.') +
        D.p('Probalo: conectá un router pirata al anillo, con y sin la clave correcta.') + D.w('ospf')],
      ['3.C2.2', 'Enrutamiento dentro de la empresa',
        D.p('Entre los routers de la empresa también hay OSPF (proceso 10, área 0), en dos sitios:') +
        D.ul(['<b>RT1 ↔ RT2 de cada sede</b> (Gi0/0/2), con autenticación MD5, en OSPFv2 y OSPFv3. Así el router de respaldo conoce las redes de la otra sede.', '<b>RT1 ↔ RT1 a través del túnel de la VPN</b> (Tunnel0), en OSPFv2. Cada RT1 tiene una ruta estática hacia su sede (10.S.0.0/16 hacia el firewall) y la redistribuye en OSPF; así la otra sede la aprende como ruta externa (O E2) por Tunnel0.']) +
        D.p('Los firewalls y los cores no hacen OSPF: tienen rutas estáticas (ruta por defecto hacia el firewall y, en el firewall, ruta por defecto hacia el router). Así el enrutamiento dinámico queda en la frontera y el interior de cada sede es sencillo y previsible.') +
        D.note('En IPv6, OSPFv3 no forma vecindad a través del túnel GRE en el Packet Tracer; por eso entre sedes pusimos rutas estáticas IPv6 que apuntan al túnel (2001:db8:acad:1000::/52 y 2000::/52), que es equivalente porque cada sede se resume en un solo prefijo.', 'lim')],
      ['3.C2.3', 'Autenticación de OSPFv3',
        D.p('La autenticación MD5 es de OSPFv2. OSPFv3 no tiene autenticación propia: usa la cabecera de autenticación de IPsec, que se configura en cada interfaz con <code>ipv6 ospf authentication ipsec spi 256 sha1 &lt;clave&gt;</code>.',
          'Intentamos aplicarla en los enlaces entre ISP y en los enlaces RT1 ↔ RT2 de cada sede, pero el Packet Tracer no acepta el comando y devuelve <code>% Invalid input detected at \'^\' marker</code>. En ISP-1 lo probamos en dos interfaces seguidas (Gi0/0/1 y Gi0/0/2) y las dos lo rechazan; debajo, el <code>show ipv6 ospf interface GigabitEthernet0/0/1</code> tampoco muestra ninguna línea de autenticación, lo que confirma que la función no está disponible en el simulador.') +
        D.chk('ISP-1', 'ipv6 ospf authentication ipsec spi 256 sha1 …', 'El Packet Tracer rechaza la autenticación IPsec de OSPFv3 en las dos interfaces.', 39, 'ISP-1|conf-ospfv3-auth')],
      ['3.C2.4', 'Comprobaciones en el Packet Tracer',
        D.chk('ISP-1', 'show ip ospf neighbor', 'Los vecinos OSPFv2 2.2.2.2 (ISP-2) y 3.3.3.3 (ISP-3) en estado FULL.', 40) +
        D.chk('ISP-1', 'show ip ospf interface GigabitEthernet0/0/1', 'Al final: «Message digest authentication enabled» y «Youngest key id is 1». Es la prueba de la autenticación MD5.', 41) +
        D.chk('ISP-1', 'show ipv6 ospf neighbor', 'Los mismos vecinos en OSPFv3 (IPv6), en estado FULL.', 42) +
        D.chk('ISP-1', 'show ip route ospf', 'Las redes aprendidas por OSPF (O): los enlaces 200.0.0.x, las WAN de las sedes y la LAN de Internet 203.0.113.0/24.', 43) +
        D.chk('BCN-RT1', 'show ip ospf neighbor', 'Dos vecinos en FULL: ZGZ-RT1 (10.255.2.1) por Tunnel0, a través de la VPN, y BCN-RT2 (10.255.1.2) por Gi0/0/2.', 44) +
        D.chk('BCN-RT1', 'show ip route', 'La red de Zaragoza 10.2.0.0/16 como O E2 vía 10.0.0.2, Tunnel0: aprendida por OSPF a través de la VPN.', 45) +
        D.chk('BCN-RT1', 'show ipv6 ospf neighbor', 'BCN-RT2 en FULL en OSPFv3.', 46)]
    ]
  });

  LT.sec({
    id: '3.C3', t: 'Acceso a Internet y NAT (PAT)', short: 'Internet, NAT y firewall',
    lead: 'Todos salen a Internet con una sola IP pública. Desde Internet solo se entra a un sitio: la web.',
    sc: ['nat', 'Navegá a la web desde Internet, intentá entrar a un servidor interno y mirá cómo sube cada contador del ASA.'],
    subs: [
      ['3.C3.1', 'Salida a Internet con PAT',
        D.p('Todas las VLAN salen a Internet por el router de su sede con PAT (NAT con sobrecarga): todos los equipos comparten la IP pública de la WAN del router y el router distingue cada conexión por el puerto. Las IP internas nunca salen a Internet. La lista ACL-NAT dice qué se traduce: toda la red de la sede, salvo el tráfico hacia la otra sede, que va por la VPN sin traducir.',
          'El router de respaldo (RT2) tiene el mismo PAT con su propia IP pública: si cae RT1, la salida a Internet sigue por RT2.') + D.w('nat')],
      ['3.C3.2', 'Publicación de la web',
        D.p('La web corporativa está en SRV-HV03 (10.1.50.12), en la VLAN de servidores de Barcelona. Para que sea accesible desde Internet, BCN-RT1 tiene un NAT estático que la publica en la IP pública 85.100.1.18. Además hay dos DNS: el DNS interno (SRV-HV01) resuelve www.logitrans.com a la IP interna 10.1.50.12, y el DNS público de Internet la resuelve a 85.100.1.18. Así cada usuario llega a la web por el camino más corto.') + D.w('dns')],
      ['3.C3.3', 'Firewall perimetral',
        D.p('Entre los routers y la red interna hay un firewall <b>ASA 5506-X</b> en cada sede. Tiene cuatro interfaces: <code>outside</code> y <code>wanbak</code> (nivel de seguridad 0) hacia los dos routers, e <code>inside</code> y <code>corebak</code> (nivel 100) hacia los dos cores. Por defecto un ASA deja salir el tráfico de un nivel alto a uno bajo y no al revés; nosotros lo cerramos más con dos listas de acceso que solo dejan pasar lo necesario.') +
        D.tbl(['Lista', 'Qué permite', 'Por qué'], [
          ['<b>INSIDE_OUT</b> (de dentro hacia fuera)', 'Tráfico hacia la otra sede; web (80), HTTPS (443), DNS (53) y ping hacia Internet; SSH desde la red de gestión hacia los routers; las respuestas de la web publicada.', 'Los usuarios solo necesitan navegar y resolver nombres. Cualquier otro puerto (FTP, Telnet, etc.) queda cerrado.'],
          ['<b>OUTSIDE_IN</b> (de fuera hacia dentro)', 'Tráfico que viene de la otra sede por la VPN; la web (80 y 443) hacia 10.1.50.12; RADIUS de los routers hacia el servidor; respuestas de ping.', 'Desde Internet solo se llega a la web publicada.']
        ], 'Tabla 24. Listas de acceso del firewall ASA.') +
        D.p('Probá el firewall: elegí qué intenta pasar y mirá qué regla lo decide.') + D.w('asa') +
        D.note('El ASA del Packet Tracer no guarda el estado de las conexiones TCP como un ASA real; por eso hay reglas explícitas para las respuestas (la web publicada, el SSH hacia los routers y el RADIUS). En un ASA real esas reglas no harían falta.', 'lim')],
      ['3.C3.4', 'Comprobaciones en el Packet Tracer',
        D.chk('P1-ADM-03', 'ping 203.0.113.10', 'Que un PC de la empresa llega a Internet (TTL 123).', 47) +
        D.chk('BCN-RT1', 'show ip nat translations', 'La traducción estática 85.100.1.18 ↔ 10.1.50.12. Las traducciones del PAT del ping anterior duran pocos segundos y ya caducaron; en la captura siguiente se ven en el contador «Expired translations: 7».', 48) +
        D.chk('BCN-RT1', 'show ip nat statistics', 'La interfaz exterior Gi0/0/0 y la interior Gi0/0/1, la traducción estática, el contador de Hits mayor que 0 y las 7 traducciones ya caducadas del PAT.', 49) +
        D.chk('PC-INTERNET', 'Web Browser → http://www.logitrans.com', 'Que desde Internet se llega a la web corporativa a través del NAT estático y del firewall.', 50, 'PC-INTERNET|browser http://www.logitrans.com') +
        D.chk('PC-INTERNET', 'nslookup www.logitrans.com', 'Que el DNS público resuelve la web a la IP pública 85.100.1.18.', 51) +
        D.chk('PC-INTERNET', 'ping 10.1.50.10', 'Destination host unreachable: desde Internet no se llega a ninguna IP interna.', 52) +
        D.chk('ISP-1', 'show ip route 10.1.50.10', '«% Network not in table»: Internet no conoce las redes privadas de la empresa, y por eso el NAT es imprescindible.', 53) +
        D.chk('P1-ADM-03', 'ftp 203.0.113.53', 'No conecta (Timed out): el firewall no deja salir el puerto 21 (FTP), porque ningún usuario lo necesita. Solo salen la web, el DNS y el ping.', 54) +
        D.chk('BCN-FW', 'show access-list', 'Las dos listas con el contador (hitcnt) de cada regla. Después de las pruebas anteriores subieron las del tráfico entre sedes, la web (www) y el ping (echo-reply en OUTSIDE_IN e icmp en INSIDE_OUT). Las reglas que no se usan, como el 443 o el DNS hacia fuera, se quedan en 0.', 55)]
    ]
  });
})();
