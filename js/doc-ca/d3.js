/* Punt 3 de la memòria en català: adreçament, VLAN, VPN, OSPF i NAT */
(function () {
  var LT = window.LT, D = LT.D;

  LT.sec({
    id: '3.A1', t: 'Adreçament IPv4 amb VLSM', short: 'Adreçament IPv4 (VLSM)',
    lead: 'Una IP que es llegeix sola: el segon octet és la seu, el tercer la VLAN i el quart l’equip. I cada màscara ajustada als hosts reals més un 20 %.',
    sc: ['ipv4', 'Comprova les SVI, les rutes i l’HSRP dels cores escrivint tu mateix les comandes.'],
    subs: [
      ['3.A1.1', 'Decisió de disseny: 10.SEU.VLAN.HOST',
        D.p('Triem l’espai privat 10.0.0.0/8 (RFC 1918) i una convenció de tres nivells que fa que cada IP s’expliqui sola:') +
        D.ul(['<b>Segon octet → la seu.</b> 1 = oficina central, 2 = magatzem. Del 3 al 254 queda lliure per a futures delegacions.', '<b>Tercer octet → coincideix amb l’ID de la VLAN</b> (10, 20, 30, 40, 50, 99).', '<b>Quart octet → el host.</b>']) +
        D.p('Escriu qualsevol IP de l’empresa i mira com es llegeix:') + D.w('ipdecode') +
        D.p('Això dona dos avantatges importants:') +
        D.ul(['<b>Diagnòstic ràpid.</b> Qualsevol tècnic que vegi una IP en un registre sap a l’instant a quina seu i a quin departament pertany, sense consultar cap taula.', '<b>Creixement sense reestructurar.</b> Com que cada seu només consumeix un valor del segon octet, es poden obrir fins a 253 delegacions noves sense tocar res del que ja està fet.']) +
        D.p('A més, cada subxarxa es dimensiona amb VLSM ajustant la màscara al nombre real de hosts més un 20 % de marge, com va demanar el client.')],
      ['3.A1.2', 'Canvis respecte a l’Sprint 1',
        D.p('En muntar el Packet Tracer sobre els plànols definitius vam revisar les mides i dues subxarxes van haver de créixer:') +
        D.note('<b>VLAN 20 de Barcelona: de /25 a /23.</b> A l’Sprint 1 vam comptar només el personal administratiu (67 llocs). Però als plànols, com que el client no defineix cap VLAN pròpia per a trànsit i operacions, tots els open space de la P1 (operacions, flota i trànsit, 117 llocs), els de la P2 (finances, compres i comercial, 93 llocs), les sales de treball de la P0 i l’open space de control de gestió de la P3 són a la VLAN 20. Són més de 220 llocs; amb el 20 % de marge superen els 254 hosts d’una /24, així que la màscara correcta és /23 (510 hosts).', 'fix', 'Canvi 1') +
        D.note('<b>VLAN 99 de Saragossa: de /29 a /26.</b> A l’Sprint 1 vam comptar només els ordinadors de la sala de gestió (3). Però la VLAN de gestió necessita una IP per a cada equip de xarxa que s’administra: 17 punts d’accés, 4 switches d’accés, 2 cores, el tallafoc i 2 routers, a més dels ordinadors de gestió. Són 26 equips; amb el 20 % en surten 32, que no caben en una /27 (30 útils), així que la màscara correcta és /26 (62).', 'fix', 'Canvi 2') +
        D.p('La resta de subxarxes no canvia. Com que cada seu continua fent servir un sol valor del segon octet, aquests canvis no afecten l’espai reservat per a futures delegacions.')],
      ['3.A1.3', 'Subxarxes de l’oficina central (10.1.X.0)',
        D.p('Sempre es reserva la primera adreça útil (.1) com a porta d’enllaç. Fes clic en un bloc per veure’n el detall:') +
        D.w('vlsm', { site: 'BCN' }) +
        D.tbl(['VLAN', 'Xarxa', 'Màscara', 'Hosts', '+20 %', 'Útils', 'Porta d’enllaç', 'Rang útil', 'Broadcast'], [
          [D.vl(10) + ' Direcció', '10.1.10.0/26', '255.255.255.192', '42', '51', '62', '10.1.10.1', '.2 – .62', '10.1.10.63'],
          [D.vl(20) + ' Administració', '10.1.20.0/23', '255.255.254.0', '220+', '264+', '510', '10.1.20.1', '10.1.20.2 – 10.1.21.254', '10.1.21.255'],
          [D.vl(40) + ' Convidats', '10.1.40.0/25', '255.255.255.128', '100', '120', '126', '10.1.40.1', '.2 – .126', '10.1.40.127'],
          [D.vl(50) + ' Servidors', '10.1.50.0/25', '255.255.255.128', '58', '70', '126', '10.1.50.1', '.2 – .126', '10.1.50.127'],
          [D.vl(99) + ' Gestió', '10.1.99.0/27', '255.255.255.224', '17', '21', '30', '10.1.99.1', '.2 – .30', '10.1.99.31']
        ], 'Taula 13. Subxarxes IPv4 de l’oficina central.', { mono: [1, 2, 6, 7, 8] })],
      ['3.A1.4', 'Subxarxes del magatzem (10.2.X.0)',
        D.p('Mateix criteri, amb màscares més ajustades perquè el magatzem té menys hosts a cada VLAN, tret de la seva pròpia VLAN 30.') +
        D.w('vlsm', { site: 'ZGZ' }) +
        D.tbl(['VLAN', 'Xarxa', 'Màscara', 'Hosts', '+20 %', 'Útils', 'Porta d’enllaç', 'Rang útil', 'Broadcast'], [
          [D.vl(10) + ' Direcció', '10.2.10.0/28', '255.255.255.240', '8', '10', '14', '10.2.10.1', '.2 – .14', '10.2.10.15'],
          [D.vl(20) + ' Administració', '10.2.20.0/27', '255.255.255.224', '13', '16', '30', '10.2.20.1', '.2 – .30', '10.2.20.31'],
          [D.vl(30) + ' Magatzem', '10.2.30.0/25', '255.255.255.128', '80', '96', '126', '10.2.30.1', '.2 – .126', '10.2.30.127'],
          [D.vl(40) + ' Convidats', '10.2.40.0/27', '255.255.255.224', '20', '24', '30', '10.2.40.1', '.2 – .30', '10.2.40.31'],
          [D.vl(50) + ' Servidors', '10.2.50.0/27', '255.255.255.224', '12', '15', '30', '10.2.50.1', '.2 – .30', '10.2.50.31'],
          [D.vl(99) + ' Gestió', '10.2.99.0/26', '255.255.255.192', '26', '32', '62', '10.2.99.1', '.2 – .62', '10.2.99.63']
        ], 'Taula 14. Subxarxes IPv4 del magatzem.', { mono: [1, 2, 6, 7, 8] })],
      ['3.A1.5', 'Enllaços WAN i adreces públiques',
        D.p('Per als enllaços entre routers i cap a Internet fem servir subxarxes /30 (just 2 adreces útils, una a cada extrem).') +
        D.tbl(['Enllaç', 'Xarxa', 'Extrem A', 'Extrem B'], [
          ['Túnel VPN (oficina ↔ magatzem)', '10.0.0.0/30', '10.0.0.1 — BCN-RT1', '10.0.0.2 — ZGZ-RT1'],
          ['ISP ↔ Oficina central (principal)', '85.100.1.0/30', '85.100.1.1 — ISP', '85.100.1.2 — BCN-RT1 (WAN)'],
          ['ISP ↔ Oficina central (reserva)', '85.100.1.4/30', '85.100.1.5 — ISP', '85.100.1.6 — BCN-RT2 (WAN)'],
          ['ISP ↔ Magatzem (principal)', '85.100.2.0/30', '85.100.2.1 — ISP', '85.100.2.2 — ZGZ-RT1 (WAN)'],
          ['ISP ↔ Magatzem (reserva)', '85.100.2.4/30', '85.100.2.5 — ISP', '85.100.2.6 — ZGZ-RT2 (WAN)']
        ], 'Taula 15. Enllaços WAN.', { mono: [1, 2, 3] }) +
        D.p('Les adreces 85.100.X.X són públiques simulades per a l’entorn del Packet Tracer. En producció les assignaria el proveïdor d’Internet.',
          'Dins de cada seu, els enllaços interns entre el core, el tallafoc i els routers també són /30, i reutilitzen el tercer octet per a la infraestructura (253, 254 i 255), que no correspon a cap VLAN d’usuari:') +
        D.tbl(['Enllaç intern (S = 1 BCN, 2 ZGZ)', 'Xarxa', 'Extrem A', 'Extrem B'], [
          ['Tallafoc ↔ CORE1', '10.S.253.0/30', '.1 — ASA (inside)', '.2 — CORE1'],
          ['Tallafoc ↔ CORE2', '10.S.253.4/30', '.5 — ASA (corebak)', '.6 — CORE2'],
          ['CORE1 ↔ CORE2 (VLAN 900)', '10.S.253.8/30', '.9 — CORE1', '.10 — CORE2'],
          ['RT1 ↔ tallafoc', '10.S.254.0/30', '.1 — RT1', '.2 — ASA (outside)'],
          ['RT2 ↔ tallafoc', '10.S.254.4/30', '.5 — RT2', '.6 — ASA (wanbak)'],
          ['RT1 ↔ RT2', '10.S.255.0/30', '.1 — RT1', '.2 — RT2']
        ], 'Taula 16. Enllaços de trànsit dins de cada seu.', { mono: [1, 2, 3] })],
      ['3.A1.6', 'NAT',
        D.p('A cada seu el router frontera aplica:') +
        D.ul(['<b>NAT d’origen (PAT)</b>: totes les VLAN internes surten a Internet amb la IP pública de la seva WAN. Així cap IP interna queda exposada.',
          '<b>NAT estàtic</b>: el servidor web (10.1.50.12, a l’oficina) es publica a Internet amb la IP pública <b>85.100.1.18</b> als ports 80 i 443, perquè qualsevol client arribi a logitrans.com i a logitrans.com/clients des de fora. Fem servir una IP pública pròpia per a la web (i no la de la WAN del router, com dèiem a l’Sprint 1) per no barrejar el trànsit publicat amb el PAT de tota l’oficina.']) +
        D.p('La configuració i les comprovacions del NAT són al punt <a href="#/s/3.C3">3.C3</a>.')],
      ['3.A1.7', 'DHCP',
        D.p('Totes les adreces de client (PC, portàtils, telèfons IP, impressores, terminals de moll) es reparteixen per DHCP, com va demanar el client. Només porten IP fixa:') +
        D.ul(['Routers i switches (interfície de gestió).', 'Servidors.', 'AP.', 'Impressores i dispositius que necessiten reserva fixa per DHCP.']) +
        D.p('Al Packet Tracer el servei DHCP és als servidors de cada seu (SRV-HV01 a Barcelona i SRV-ZGZ01 a Saragossa), a la VLAN 50, i no als switches. Com que els PC són en altres VLAN, cada SVI del core porta un <code>ip helper-address</code> que reenvia les peticions DHCP al servidor (relay DHCP). Els rangs comencen a la .11 per deixar les primeres adreces a la porta d’enllaç virtual (.1), als dos cores (.2 i .3) i als equips amb IP fixa.') +
        D.w('dhcp')],
      ['3.A1.8', 'Consum total',
        D.p('Entre les dues seus i els enllaços WAN assignem unes <b>1.240 adreces</b> del rang 10.0.0.0/8, que té 16.777.214 adreces útils. És a dir, fem servir <b>menys del 0,01 %</b> del total, amb marge de sobres per a totes les delegacions que l’empresa pugui obrir.') + D.w('usage')],
      ['3.A1.9', 'Comprovacions al Packet Tracer',
        D.chk('BCN-CORE1', 'show ip interface brief', 'Que cada VLAN té la seva SVI amb l’adreça .2 i està up/up: Vlan10 10.1.10.2, Vlan20 10.1.20.2, Vlan40 10.1.40.2, Vlan50 10.1.50.2 i Vlan99 10.1.99.2, a més dels enllaços de trànsit (Vlan900 i Gi1/0/20).', 14) +
        D.chk('BCN-CORE1', 'show ip route', 'Les xarxes de cada VLAN com a connectades (C) amb la seva màscara: 10.1.10.0/26, 10.1.20.0/23, 10.1.40.0/25, 10.1.50.0/25 i 10.1.99.0/27. És la prova que les màscares aplicades són les de la taula.', 15) +
        D.chk('ZGZ-CORE1', 'show ip route', 'El mateix al magatzem: 10.2.10.0/28, 10.2.20.0/27, 10.2.30.0/25, 10.2.40.0/27, 10.2.50.0/27 i 10.2.99.0/26.', 16) +
        D.chk('BCN-CORE1', 'show standby brief', 'Que totes les VLAN tenen el CORE1 com a Active amb prioritat 110 i la IP virtual .1.', 17) +
        D.chk('SRV-HV01', 'Services → DHCP', 'Els àmbits de cada VLAN de Barcelona, amb la seva porta d’enllaç .1, la màscara i el DNS.', 18, 'SRV-HV01|dhcp') +
        D.chk('P1-ADM-03', 'ipconfig', 'Que el PC ha rebut per DHCP una IP de la VLAN 20, la màscara 255.255.254.0 i la porta d’enllaç 10.1.20.1.', 19)]
    ]
  });

  LT.sec({
    id: '3.A2', t: 'Adreçament IPv6 corporatiu', short: 'Adreçament IPv6',
    lead: 'La xarxa funciona avui en IPv4, però queda preparada per a IPv6 amb doble pila: cada equip té les dues adreces i es pot migrar servei a servei sense aturar l’empresa.',
    sc: ['ipv6', 'Mira les adreces IPv6 dels cores i fes un ping IPv6 de la VLAN 20 al servidor.'],
    subs: [
      ['3.A2.1', 'Decisió de disseny',
        D.p('Tot i que ara la xarxa funcionarà amb IPv4, el client va demanar deixar-la preparada per a la migració a IPv6. Triem l’estratègia més senzilla i estesa: <b>doble pila (dual-stack)</b>. Cada router, switch i servidor té alhora adreça IPv4 i IPv6. Així es pot migrar servei per servei quan es decideixi, sense aturar l’empresa en cap moment.')],
      ['3.A2.2', 'Prefix corporatiu i estructura',
        D.p('Per a la simulació fem servir el prefix de documentació <code>2001:db8:acad::/48</code>, l’habitual als laboratoris de Cisco i al Packet Tracer. En un desplegament real, el proveïdor assignaria un /48 públic o es faria servir un prefix ULA (fd00::/8) per a xarxes internes.',
          'Els 16 bits que identifiquen la subxarxa (posicions 48 a 63) els estructurem com a <b>SVVV</b>:') +
        D.ul(['<b>S</b> → número de seu (1 = oficina central, 2 = magatzem).', '<b>VVV</b> → ID de VLAN escrit amb tres xifres perquè coincideixi visualment amb el decimal (010, 020, 030, 040, 050, 099).']) +
        D.w('v6') +
        D.p('Totes les subxarxes fan servir /64, l’estàndard per a qualsevol segment LAN en IPv6 i el que permet l’autoconfiguració SLAAC (els clients es generen la seva pròpia IPv6 sense DHCP).',
          'Mantenim el mateix criteri que en IPv4 (seu + VLAN) perquè qualsevol tècnic reconegui cada rang d’un cop d’ull. A més, com que tot el d’una seu comença pel mateix dígit, cada seu es resumeix en un sol prefix /52 (<code>2001:db8:acad:1000::/52</code> per a Barcelona i <code>2001:db8:acad:2000::/52</code> per a Saragossa), que és el que s’anuncia entre seus.')],
      ['3.A2.3', 'Subxarxes IPv6 de l’oficina central',
        D.tbl(['VLAN', 'Xarxa IPv6', 'CORE1 / CORE2'], [
          [D.vl(10) + ' Direcció', '2001:db8:acad:1010::/64', '…:1010::2 / …:1010::3'], [D.vl(20) + ' Administració', '2001:db8:acad:1020::/64', '…:1020::2 / …:1020::3'], [D.vl(40) + ' Convidats', '2001:db8:acad:1040::/64', '…:1040::2 / …:1040::3'], [D.vl(50) + ' Servidors', '2001:db8:acad:1050::/64', '…:1050::2 / …:1050::3'], [D.vl(99) + ' Gestió', '2001:db8:acad:1099::/64', '…:1099::2 / …:1099::3']
        ], 'Taula 17. Subxarxes IPv6 de l’oficina central.', { mono: [1, 2] })],
      ['3.A2.4', 'Subxarxes IPv6 del magatzem',
        D.tbl(['VLAN', 'Xarxa IPv6', 'CORE1 / CORE2'], [
          [D.vl(10) + ' Direcció', '2001:db8:acad:2010::/64', '…:2010::2 / …:2010::3'], [D.vl(20) + ' Administració', '2001:db8:acad:2020::/64', '…:2020::2 / …:2020::3'], [D.vl(30) + ' Magatzem', '2001:db8:acad:2030::/64', '…:2030::2 / …:2030::3'], [D.vl(40) + ' Convidats', '2001:db8:acad:2040::/64', '…:2040::2 / …:2040::3'], [D.vl(50) + ' Servidors', '2001:db8:acad:2050::/64', '…:2050::2 / …:2050::3'], [D.vl(99) + ' Gestió', '2001:db8:acad:2099::/64', '…:2099::2 / …:2099::3']
        ], 'Taula 18. Subxarxes IPv6 del magatzem.', { mono: [1, 2] }) +
        D.note('A l’Sprint 1 indicàvem la ::1 com a porta d’enllaç. Al Packet Tracer els cores tenen la ::2 i la ::3, i els clients no necessiten cap adreça global com a porta d’enllaç: en IPv6 la porta d’enllaç és sempre una adreça link-local (FE80::) que el client aprèn per l’anunci de router (RA). Per mantenir la redundància també en IPv6, cada VLAN té un grup HSRP d’IPv6 que genera una link-local virtual compartida entre els dos cores.', 'fix')],
      ['3.A2.5', 'Enllaços WAN en IPv6',
        D.p('Per als enllaços entre routers i cap a Internet fem servir el prefix f0XX al camp de subxarxa, perquè quedin visualment separats de les VLAN d’usuari. Els enllaços interns de cada seu fan servir SF0X (1F01, 1F02… a Barcelona i 2F01, 2F02… a Saragossa), dins del /52 de la seva seu.') +
        D.tbl(['Enllaç', 'Xarxa IPv6'], [
          ['Túnel VPN (oficina ↔ magatzem)', '2001:db8:acad:f001::/64'], ['ISP ↔ Oficina central', '2001:db8:acad:f002::/64'], ['ISP ↔ Magatzem', '2001:db8:acad:f003::/64'],
          ['Tallafoc ↔ CORE1 / CORE2', '2001:db8:acad:SF01::/64 i SF02::/64'], ['RT1 ↔ tallafoc / RT2 ↔ tallafoc', '2001:db8:acad:SF03::/64 i SF04::/64'], ['RT1 ↔ RT2 / CORE1 ↔ CORE2', '2001:db8:acad:SF05::/64 i SF06::/64']
        ], 'Taula 19. Enllaços WAN i de trànsit en IPv6 (S = 1 o 2).', { mono: [1] })],
      ['3.A2.6', 'Com es reparteix IPv6 als clients',
        D.p('En IPv6 no cal DHCP: els clients es poden autoconfigurar amb SLAAC a partir del prefix /64 que anuncia el router. Al nostre entorn fem servir aquesta combinació:') +
        D.ul(['<b>Clients normals</b> (PC, portàtils, mòbils) → SLAAC + DNS per DHCPv6 stateless. No cal mantenir una taula de concessions i tot i així els clients reben el DNS corporatiu. Al Packet Tracer ho fa cada SVI del core amb <code>ipv6 nd other-config-flag</code> i un pool <code>ipv6 dhcp pool V6-DNS</code> que només reparteix el DNS i el domini.',
          '<b>Routers, switches i cores</b> → IPv6 fixa, com en IPv4.',
          '<b>Servidors</b> → al disseny real, IPv6 fixa. Al Packet Tracer els servidors no desen la IPv6 estàtica dins del fitxer, així que fan servir SLAAC (adreça EUI-64 derivada de la MAC, que no canvia).']) +
        D.p('Així es genera una adreça SLAAC amb EUI-64 a partir de la MAC:') + D.w('eui64')],
      ['3.A2.7', 'Taula mestra IPv4 + IPv6',
        D.p('Totes les subxarxes del projecte en una sola taula, combinant IPv4 i IPv6: és el document de referència per configurar interfícies al Packet Tracer o en qualsevol equip real.') +
        D.tbl(['VLAN', 'Xarxa IPv4', 'Màscara', 'Porta d’enllaç IPv4', 'Xarxa IPv6'], LT.SUBNETS.map(function (s) {
          return [s.site + ' ' + D.vl(s.vlan) + ' ' + LT.VLANS.filter(function (v) { return v.id === s.vlan; })[0].name, s.net + '/' + s.cidr, s.mask, s.gw, s.v6];
        }).concat([['Túnel VPN', '10.0.0.0/30', '255.255.255.252', '—', '2001:db8:acad:f001::/64'], ['ISP ↔ Oficina', '85.100.1.0/30', '255.255.255.252', '—', '2001:db8:acad:f002::/64'], ['ISP ↔ Magatzem', '85.100.2.0/30', '255.255.255.252', '—', '2001:db8:acad:f003::/64']]), 'Taula mestra IPv4 + IPv6.', { mono: [1, 2, 3, 4] })],
      ['3.A2.8', 'Comprovacions al Packet Tracer',
        D.chk('BCN-CORE1', 'show ipv6 interface brief', 'Que cada SVI està up/up amb la link-local FE80::2 i la seva adreça global 2001:DB8:ACAD:1VVV::2. La link-local virtual d’HSRP es veu al show standby brief del punt 3.A1.9.', 20) +
        D.chk('BCN-CORE1', 'show ipv6 route', 'Una ruta connectada (C) 2001:DB8:ACAD:1VVV::/64 per a cada VLAN i la ruta per defecte ::/0 cap al tallafoc.', 21) +
        D.chk('P1-ADM-03', 'ipconfig', 'Que el PC té, a més de la IPv4, una adreça IPv6 global 2001:DB8:ACAD:1020:… generada per SLAAC i una porta d’enllaç IPv6 link-local (FE80::…).', 22, 'P1-ADM-03|ipconfig /all') +
        D.chk('P1-ADM-03', 'ping 2001:db8:acad:1050:209:30ff:fe23:46ba', 'Que hi ha connectivitat IPv6 entre VLAN: el PC de la VLAN 20 arriba al servidor SRV-HV01 de la VLAN 50.', 23) +
        D.chk('ZGZ-MUE-01', 'ipconfig', 'Que els clients del magatzem també reben una adreça 2001:DB8:ACAD:2030:… per SLAAC.', 24)]
    ]
  });

  LT.sec({
    id: '3.B', t: 'Segmentació en 6 VLAN obligatòries', short: 'Segmentació en 6 VLAN',
    lead: 'Aïllar el trànsit per departament, aplicar polítiques de seguretat diferents a cadascun i fer la xarxa fàcil d’administrar.',
    sc: ['vlan', 'Prova qui arriba a qui: tria un origen i un destí i mira què deixa passar cada VLAN.'],
    subs: [
      ['3.B.1', 'Context i criteris',
        D.p('LogiTrans té dues seus físiques unides per VPN IPsec: una oficina central (350 llocs) i un magatzem de distribució (150 llocs). La segmentació en VLAN respon a tres objectius: aïllar el trànsit per departament, aplicar polítiques de seguretat diferenciades i facilitar l’administració de la xarxa.') +
        D.ul(['Cada departament té la seva pròpia VLAN, amb un ID entre 10 i 99.', 'Totes les VLAN són a les dues seus tret de Magatzem, que només existeix al magatzem.', 'Els hosts es reparteixen de manera proporcional: l’oficina central disposa de 350 places i el magatzem de 70 de lliures (150 en total menys 80 de la VLAN Magatzem).', 'Cada VLAN es dimensiona amb un marge de creixement del 20 % sobre els hosts actuals.', 'La VLAN de Convidats funciona només per Wi-Fi, aïllada dels servidors interns i amb accés només a Internet.', 'La VLAN de Gestió es fa servir únicament per administrar els equips de xarxa (switches, routers, AP i tallafocs).'])],
      ['3.B.2', 'Taula resum de VLAN',
        D.w('vlancards') +
        D.tbl(['ID', 'Nom', 'Propòsit', 'Hosts', '+20 %', 'Accés', 'Presència'], LT.VLANS.map(function (v) { return [D.vl(v.id), v.name, LT.tr(v.purpose), v.hosts, v.plus, LT.tr(v.access), LT.tr(v.where)]; }), 'Taula 20. VLAN del projecte.') +
        D.p('A més d’aquestes sis, als switches hi ha tres VLAN tècniques que no porten usuaris: la <b>999 (Nativa)</b>, que és la VLAN nativa dels troncals i no té cap port; la <b>998 (SinUso)</b>, on van tots els ports lliures, apagats; i la <b>900</b>, que només existeix entre els dos cores per a l’enllaç de trànsit entre ells.')],
      ['3.B.3', 'Distribució proporcional entre seus',
        D.p('La VLAN Magatzem (80 hosts) ocupa tota la seva quota al magatzem. Les 5 VLAN restants es reparteixen entre l’oficina central (350 places) i les 70 places lliures del magatzem, amb una proporció de 350:70, és a dir, <b>83,3 % oficina i 16,7 % magatzem</b>.') +
        D.w('split') +
        D.tbl(['VLAN', 'Total', 'Oficina central', 'Magatzem'], [['Direcció', 50, 42, 8], ['Administració', 80, 67, 13], ['Magatzem', 80, 0, 80], ['Convidats', 120, 100, 20], ['Servidors', 70, 58, 12], ['Gestió', 20, 17, 3], ['!Total', 420, 284, 136]], 'Taula 21. Distribució proporcional de hosts entre seus.', { mono: [1, 2, 3] }) +
        D.p('L’oficina central queda amb 284 llocs assignats de 350 disponibles (66 places de reserva física). El magatzem queda amb 136 de 150 (14 places de reserva). Aquestes places lliures permeten créixer sense obra.',
          'Aquest repartiment és el dels departaments que va definir el client. Als plànols definitius, el personal de trànsit i operacions (que no té VLAN pròpia) i tots els equips de xarxa del magatzem fan créixer la VLAN 20 de Barcelona i la 99 de Saragossa; per això aquestes dues subxarxes són més grans (punt 3.A1).')],
      ['3.B.4', 'Característiques especials i restriccions de seguretat',
        D.ul(['<b>VLAN 10 · Direcció.</b> Accés complet a servidors interns i Internet. Els equips directius arriben a totes les VLAN tret de Gestió (reservada als administradors de xarxa).',
          '<b>VLAN 20 · Administració.</b> Accés a servidors interns (AD, fitxers, web interna) i Internet. Sense accés a la VLAN de Gestió.',
          '<b>VLAN 30 · Magatzem.</b> Accés als servidors interns necessaris per a l’operativa (AD, aplicacions de logística, fitxers compartits). Sense accés a Gestió. Només existeix al magatzem.',
          '<b>VLAN 40 · Convidats.</b> Xarxa completament aïllada, només Internet per Wi-Fi. Sense accés a cap servidor intern ni a cap altra VLAN. El Wi-Fi dels empleats fa servir credencials d’Active Directory per RADIUS (802.1X); els convidats entren per un portal captiu independent.',
          '<b>VLAN 50 · Servidors.</b> Allotja tots els serveis centrals: Active Directory, DNS, DHCP, servidor web (logitrans.com i /clients), RADIUS, streaming, repositori de programari i FOG. Els servidors fan servir RAID 5 i xifratge de disc complet. Des d’Internet només s’arriba al servidor web mitjançant NAT i regles de tallafoc.',
          '<b>VLAN 99 · Gestió.</b> Accés exclusiu per als administradors de xarxa. Els switches, routers, AP i tallafocs hi tenen la seva interfície de gestió. L’autenticació dels equips Cisco fa servir AAA contra Active Directory. L’accés es restringeix als comptes del departament de TI.']) +
        D.p('Fes clic en una cel·la per saber si un origen arriba a un destí i per què:') + D.w('vlanmatrix') +
        D.p('Aquestes restriccions s’apliquen al Packet Tracer amb les llistes d’accés dels punts <a href="#/s/4.B1">4.B1</a> (Convidats), <a href="#/s/4.B2">4.B2</a> (Gestió) i <a href="#/s/4.B3">4.B3</a> (operaris del magatzem).')],
      ['3.B.5', 'Comprovacions al Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show vlan brief', 'Les VLAN 10, 20, 40, 50 i 99 amb el seu nom, la 998 amb tots els ports lliures i la 999 sense ports. La VLAN 30 no hi és, perquè només existeix al magatzem. Cada port ocupat és a la VLAN del seu departament.', 25) +
        D.chk('ZGZ-ACC1', 'show vlan brief', 'Les mateixes VLAN i, a més, la 30 (Almacen). És el switch de les oficines del magatzem, per això la VLAN 30 no té ports: els terminals dels operaris van als switches de la nau (ZGZ-ACC2 i ZGZ-ACC4). La VLAN hi és perquè passi pels troncals.', 26) +
        D.chk('BCN-P1-ACC1', 'show interfaces trunk', 'Gi0/1 i Gi0/2 en mode trunking, VLAN nativa 999 i només les VLAN de la seu permeses.', 27) +
        D.chk('BCN-P1-ACC1', 'show vtp status', 'VTP Operating Mode: Transparent.', 28) +
        D.chk('P1-ADM-03', 'ping 10.1.20.5', 'Connectivitat dins de la mateixa VLAN: el PC arriba a la impressora P0-IMP-02, que és a la VLAN 20 però en una altra planta.', 29) +
        D.chk('P1-ADM-03', 'ping 10.1.50.10', 'Connectivitat entre VLAN: el PC de la VLAN 20 arriba al servidor de la VLAN 50 passant pel core (TTL 127).', 30) +
        D.chk('ZGZ-MUE-01', 'ping 10.2.30.5', 'Connectivitat dins de la VLAN 30 del magatzem: el terminal de l’operari arriba a la impressora d’etiquetes ZGZ-ETQ-02.', 31)]
    ]
  });

  LT.sec({
    id: '3.C1', t: 'Interconnexió VPN site-to-site', short: 'VPN site-to-site',
    lead: 'Les dues seus funcionen com una sola xarxa local. Entre elles, Internet; a sobre, un túnel GRE xifrat amb IPsec.',
    sc: ['vpn', 'Envia un ping de Barcelona a Saragossa i mira com es negocia la VPN i es xifra cada paquet.'],
    subs: [
      ['3.C1.1', 'Què vam fer i per què',
        D.p('El client vol que les dues seus funcionin com una sola xarxa local, amb els serveis d’una accessibles des de l’altra, mitjançant una VPN IPsec de lloc a lloc fixa. La VPN va entre els dos routers principals: <b>BCN-RT1 (85.100.1.2)</b> i <b>ZGZ-RT1 (85.100.2.2)</b>.',
          'Vam fer una <b>VPN GRE sobre IPsec</b>: un túnel GRE (Tunnel0) entre els dos routers, i tot el trànsit d’aquest túnel xifrat amb IPsec. El motiu és que IPsec només xifra trànsit unicast i no deixa passar el multicast dels protocols d’encaminament. Amb el túnel GRE a dins, OSPF funciona a través de la VPN i cada seu aprèn sola les xarxes de l’altra (punt 3.C2): si demà s’afegeix una VLAN, no cal tocar la VPN.') +
        D.p('Avança pas a pas per veure què li passa a un paquet de Barcelona a Saragossa:') + D.w('vpn') +
        D.tbl(['Paràmetre', 'Valor', 'Per què'], [
          ['Fase 1 (IKE / ISAKMP)', 'AES 256, hash SHA, clau precompartida, grup Diffie-Hellman 5', 'Negocia de manera segura les claus entre els dos routers.'],
          ['Fase 2 (IPsec)', 'ESP amb AES 256 i SHA-HMAC (transform-set TS-LOGITRANS)', 'Xifra (AES) i garanteix la integritat (SHA) de cada paquet.'],
          ['Què es xifra', 'ACL-VPN-GRE: tot el GRE entre 85.100.1.2 i 85.100.2.2', 'Tot el que va pel túnel queda xifrat.'],
          ['Túnel', 'Tunnel0: 10.0.0.1/30 ↔ 10.0.0.2/30 (IPv6 2001:db8:acad:f001::/64)', 'Xarxa punt a punt entre seus.'],
          ['Sense NAT', 'ACL-NAT exclou el trànsit 10.1.0.0/16 ↔ 10.2.0.0/16', 'El trànsit entre seus viatja amb les IP privades originals.']
        ], 'Taula 22. Paràmetres de la VPN.') +
        D.p('A més, els tallafocs de cada seu deixen passar el trànsit entre les dues xarxes internes (10.1.0.0/16 ↔ 10.2.0.0/16), perquè el que arriba per la VPN entra al tallafoc per la interfície exterior.')],
      ['3.C1.2', 'Comprovacions al Packet Tracer',
        D.note('Abans de mirar la VPN cal generar trànsit entre seus (per exemple, el primer ping de sota): la VPN es negocia la primera vegada que s’envia un paquet cap a l’altra seu, i per això el primer paquet es pot perdre.') +
        D.chk('P1-ADM-03', 'ping 10.2.50.10', 'Que un PC de Barcelona arriba al servidor de Saragossa a través de la VPN. El TTL de 122 mostra que el paquet ha travessat el core, el tallafoc i el router de cada seu i el túnel.', 32) +
        D.chk('ZGZ-DIR-01', 'ping 10.1.50.10', 'El mateix en sentit contrari: un PC de Direcció del magatzem arriba al servidor de Barcelona. La prova es fa des de la VLAN 10 perquè la VLAN 30 dels operaris té bloquejat el ping als servidors per la seva ACL (punt 4.B3).', 33) +
        D.chk('BCN-RT1', 'show interfaces tunnel0', 'Tunnel0 is up, line protocol is up, amb origen 85.100.1.2, destí 85.100.2.2 i protocol GRE/IP.', 34) +
        D.chk('BCN-RT1', 'show crypto isakmp sa', 'La fase 1 establerta amb ZGZ-RT1: dst 85.100.2.2, src 85.100.1.2, estat QM_IDLE i ACTIVE.', 35) +
        D.chk('BCN-RT1', 'show crypto ipsec sa', 'La fase 2: els comptadors #pkts encaps/encrypt i #pkts decaps/decrypt són més grans que 0 (el trànsit entre seus viatja xifrat) i les SA d’entrada i de sortida són esp-aes 256 esp-sha-hmac.', 36) +
        D.chk('BCN-RT1', 'show crypto map', 'El crypto map CMAP-VPN amb el peer 85.100.2.2, el transform-set TS-LOGITRANS i aplicat a GigabitEthernet0/0/0.', 37) +
        D.chk('ZGZ-DIR-01', 'Web Browser → http://www.logitrans.com', 'Que un servei de Barcelona (la web corporativa, a SRV-HV03) es fa servir des de Saragossa: és el requisit del client que els serveis d’una seu siguin accessibles des de l’altra.', 38, 'ZGZ-DIR-01|browser http://www.logitrans.com')]
    ]
  });

  LT.sec({
    id: '3.C2', t: 'Encaminament OSPFv2 / OSPFv3 amb autenticació', short: 'OSPFv2 / OSPFv3',
    lead: 'Un Internet simulat amb quatre routers en anell, OSPF amb MD5 perquè ningú no injecti rutes falses, i cada seu aprenent l’altra a través de la VPN.',
    sc: ['ospf', 'Mira els veïns OSPF i què passa quan un router pirata intenta anunciar rutes.'],
    subs: [
      ['3.C2.1', 'Internet simulat',
        D.p('Internet se simula amb quatre routers ISR 4331 (ISP-1 a ISP-4) en anell: ISP-1 amb ISP-2 i ISP-3, i ISP-4 amb ISP-2 i ISP-3. Cada router de l’empresa es connecta a un ISP diferent (BCN-RT1 a ISP-1, BCN-RT2 a ISP-2, ZGZ-RT1 a ISP-3 i ZGZ-RT2 a ISP-4), així que la caiguda d’un ISP no deixa cap seu sense Internet. A ISP-2 hi ha a més una petita xarxa d’Internet (203.0.113.0/24) amb un PC de proves (PC-INTERNET) i un DNS públic (DNS-PUBLICO), per provar la xarxa des de fora.') +
        D.tbl(['Enllaç', 'Xarxa IPv4', 'Xarxa IPv6'], [['ISP-1 ↔ ISP-2', '200.0.0.0/30', '2001:db8:ffff:1::/64'], ['ISP-1 ↔ ISP-3', '200.0.0.4/30', '2001:db8:ffff:2::/64'], ['ISP-2 ↔ ISP-4', '200.0.0.8/30', '2001:db8:ffff:3::/64'], ['ISP-3 ↔ ISP-4', '200.0.0.12/30', '2001:db8:ffff:4::/64'], ['LAN d’Internet (ISP-2)', '203.0.113.0/24', '2001:db8:ffff:100::/64']], 'Taula 23. Xarxes de l’Internet simulat.', { mono: [1, 2] }) +
        D.p('Els quatre ISP fan servir OSPFv2 (procés 1, àrea 0) per a IPv4 i OSPFv3 (procés 1) per a IPv6. Els enllaços entre ISP tenen <b>autenticació MD5</b>: un router només accepta veïns OSPF que coneguin la clau, així ningú no pot connectar un router i injectar rutes falses. Els enllaços cap als clients (Gi0/0/0) són passius: s’anuncien, però no es forma veïnatge amb els routers de l’empresa. Cada ISP redistribueix les seves rutes estàtiques cap als clients.') +
        D.p('Prova-ho: connecta un router pirata a l’anell, amb la clau correcta i sense.') + D.w('ospf')],
      ['3.C2.2', 'Encaminament dins de l’empresa',
        D.p('Entre els routers de l’empresa també hi ha OSPF (procés 10, àrea 0), en dos llocs:') +
        D.ul(['<b>RT1 ↔ RT2 de cada seu</b> (Gi0/0/2), amb autenticació MD5, en OSPFv2 i OSPFv3. Així el router de reserva coneix les xarxes de l’altra seu.', '<b>RT1 ↔ RT1 a través del túnel de la VPN</b> (Tunnel0), en OSPFv2. Cada RT1 té una ruta estàtica cap a la seva seu (10.S.0.0/16 cap al tallafoc) i la redistribueix a OSPF; així l’altra seu l’aprèn com a ruta externa (O E2) per Tunnel0.']) +
        D.p('Els tallafocs i els cores no fan OSPF: tenen rutes estàtiques (ruta per defecte cap al tallafoc i, al tallafoc, ruta per defecte cap al router). Així l’encaminament dinàmic queda a la frontera i l’interior de cada seu és senzill i previsible.') +
        D.note('En IPv6, OSPFv3 no forma veïnatge a través del túnel GRE al Packet Tracer; per això entre seus vam posar rutes estàtiques IPv6 que apunten al túnel (2001:db8:acad:1000::/52 i 2000::/52), que és equivalent perquè cada seu es resumeix en un sol prefix.', 'lim')],
      ['3.C2.3', 'Autenticació d’OSPFv3',
        D.p('L’autenticació MD5 és d’OSPFv2. OSPFv3 no té autenticació pròpia: fa servir la capçalera d’autenticació d’IPsec, que es configura a cada interfície amb <code>ipv6 ospf authentication ipsec spi 256 sha1 &lt;clau&gt;</code>.',
          'Vam intentar aplicar-la als enllaços entre ISP i als enllaços RT1 ↔ RT2 de cada seu, però el Packet Tracer no accepta la comanda i retorna <code>% Invalid input detected at \'^\' marker</code>. A ISP-1 ho vam provar en dues interfícies seguides (Gi0/0/1 i Gi0/0/2) i totes dues la rebutgen; a sota, el <code>show ipv6 ospf interface GigabitEthernet0/0/1</code> tampoc no mostra cap línia d’autenticació, cosa que confirma que la funció no és disponible al simulador.') +
        D.chk('ISP-1', 'ipv6 ospf authentication ipsec spi 256 sha1 …', 'El Packet Tracer rebutja l’autenticació IPsec d’OSPFv3 a les dues interfícies.', 39, 'ISP-1|conf-ospfv3-auth')],
      ['3.C2.4', 'Comprovacions al Packet Tracer',
        D.chk('ISP-1', 'show ip ospf neighbor', 'Els veïns OSPFv2 2.2.2.2 (ISP-2) i 3.3.3.3 (ISP-3) en estat FULL.', 40) +
        D.chk('ISP-1', 'show ip ospf interface GigabitEthernet0/0/1', 'Al final: «Message digest authentication enabled» i «Youngest key id is 1». És la prova de l’autenticació MD5.', 41) +
        D.chk('ISP-1', 'show ipv6 ospf neighbor', 'Els mateixos veïns en OSPFv3 (IPv6), en estat FULL.', 42) +
        D.chk('ISP-1', 'show ip route ospf', 'Les xarxes apreses per OSPF (O): els enllaços 200.0.0.x, les WAN de les seus i la LAN d’Internet 203.0.113.0/24.', 43) +
        D.chk('BCN-RT1', 'show ip ospf neighbor', 'Dos veïns en FULL: ZGZ-RT1 (10.255.2.1) per Tunnel0, a través de la VPN, i BCN-RT2 (10.255.1.2) per Gi0/0/2.', 44) +
        D.chk('BCN-RT1', 'show ip route', 'La xarxa de Saragossa 10.2.0.0/16 com a O E2 via 10.0.0.2, Tunnel0: apresa per OSPF a través de la VPN.', 45) +
        D.chk('BCN-RT1', 'show ipv6 ospf neighbor', 'BCN-RT2 en FULL en OSPFv3.', 46)]
    ]
  });

  LT.sec({
    id: '3.C3', t: 'Accés a Internet i NAT (PAT)', short: 'Internet, NAT i tallafoc',
    lead: 'Tothom surt a Internet amb una sola IP pública. Des d’Internet només s’entra a un lloc: la web.',
    sc: ['nat', 'Navega a la web des d’Internet, intenta entrar a un servidor intern i mira com puja cada comptador de l’ASA.'],
    subs: [
      ['3.C3.1', 'Sortida a Internet amb PAT',
        D.p('Totes les VLAN surten a Internet pel router de la seva seu amb PAT (NAT amb sobrecàrrega): tots els equips comparteixen la IP pública de la WAN del router i el router distingeix cada connexió pel port. Les IP internes no surten mai a Internet. La llista ACL-NAT diu què es tradueix: tota la xarxa de la seu, tret del trànsit cap a l’altra seu, que va per la VPN sense traduir.',
          'El router de reserva (RT2) té el mateix PAT amb la seva pròpia IP pública: si cau RT1, la sortida a Internet continua per RT2.') + D.w('nat')],
      ['3.C3.2', 'Publicació de la web',
        D.p('La web corporativa és a SRV-HV03 (10.1.50.12), a la VLAN de servidors de Barcelona. Perquè sigui accessible des d’Internet, BCN-RT1 té un NAT estàtic que la publica a la IP pública 85.100.1.18. A més hi ha dos DNS: el DNS intern (SRV-HV01) resol www.logitrans.com a la IP interna 10.1.50.12, i el DNS públic d’Internet la resol a 85.100.1.18. Així cada usuari arriba a la web pel camí més curt.') + D.w('dns')],
      ['3.C3.3', 'Tallafoc perimetral',
        D.p('Entre els routers i la xarxa interna hi ha un tallafoc <b>ASA 5506-X</b> a cada seu. Té quatre interfícies: <code>outside</code> i <code>wanbak</code> (nivell de seguretat 0) cap als dos routers, i <code>inside</code> i <code>corebak</code> (nivell 100) cap als dos cores. Per defecte un ASA deixa sortir el trànsit d’un nivell alt a un de baix i no a l’inrevés; nosaltres el tanquem més amb dues llistes d’accés que només deixen passar el necessari.') +
        D.tbl(['Llista', 'Què permet', 'Per què'], [
          ['<b>INSIDE_OUT</b> (de dins cap a fora)', 'Trànsit cap a l’altra seu; web (80), HTTPS (443), DNS (53) i ping cap a Internet; SSH des de la xarxa de gestió cap als routers; les respostes de la web publicada.', 'Els usuaris només necessiten navegar i resoldre noms. Qualsevol altre port (FTP, Telnet, etc.) queda tancat.'],
          ['<b>OUTSIDE_IN</b> (de fora cap a dins)', 'Trànsit que ve de l’altra seu per la VPN; la web (80 i 443) cap a 10.1.50.12; RADIUS dels routers cap al servidor; respostes de ping.', 'Des d’Internet només s’arriba a la web publicada.']
        ], 'Taula 24. Llistes d’accés del tallafoc ASA.') +
        D.p('Prova el tallafoc: tria què intenta passar i mira quina regla ho decideix.') + D.w('asa') +
        D.note('L’ASA del Packet Tracer no desa l’estat de les connexions TCP com un ASA real; per això hi ha regles explícites per a les respostes (la web publicada, l’SSH cap als routers i el RADIUS). En un ASA real aquestes regles no caldrien.', 'lim')],
      ['3.C3.4', 'Comprovacions al Packet Tracer',
        D.chk('P1-ADM-03', 'ping 203.0.113.10', 'Que un PC de l’empresa arriba a Internet (TTL 123).', 47) +
        D.chk('BCN-RT1', 'show ip nat translations', 'La traducció estàtica 85.100.1.18 ↔ 10.1.50.12. Les traduccions del PAT del ping anterior duren pocs segons i ja han caducat; a la captura següent es veuen al comptador «Expired translations: 7».', 48) +
        D.chk('BCN-RT1', 'show ip nat statistics', 'La interfície exterior Gi0/0/0 i la interior Gi0/0/1, la traducció estàtica, el comptador de Hits més gran que 0 i les 7 traduccions ja caducades del PAT.', 49) +
        D.chk('PC-INTERNET', 'Web Browser → http://www.logitrans.com', 'Que des d’Internet s’arriba a la web corporativa a través del NAT estàtic i del tallafoc.', 50, 'PC-INTERNET|browser http://www.logitrans.com') +
        D.chk('PC-INTERNET', 'nslookup www.logitrans.com', 'Que el DNS públic resol la web a la IP pública 85.100.1.18.', 51) +
        D.chk('PC-INTERNET', 'ping 10.1.50.10', 'Destination host unreachable: des d’Internet no s’arriba a cap IP interna.', 52) +
        D.chk('ISP-1', 'show ip route 10.1.50.10', '«% Network not in table»: Internet no coneix les xarxes privades de l’empresa, i per això el NAT és imprescindible.', 53) +
        D.chk('P1-ADM-03', 'ftp 203.0.113.53', 'No connecta (Timed out): el tallafoc no deixa sortir el port 21 (FTP), perquè cap usuari no el necessita. Només surten la web, el DNS i el ping.', 54) +
        D.chk('BCN-FW', 'show access-list', 'Les dues llistes amb el comptador (hitcnt) de cada regla. Després de les proves anteriors han pujat les del trànsit entre seus, la web (www) i el ping (echo-reply a OUTSIDE_IN i icmp a INSIDE_OUT). Les regles que no es fan servir, com el 443 o el DNS cap a fora, es queden a 0.', 55)]
    ]
  });
})();
