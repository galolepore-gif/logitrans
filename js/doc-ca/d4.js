/* Punt 4 de la memòria en català: seguretat de capa 2 i llistes d'accés */
(function () {
  var LT = window.LT, D = LT.D;

  LT.sec({
    id: '4.A1', t: 'Port Security als switches d’accés', short: 'Port Security',
    lead: 'Cada presa sap quin equip hi ha d’haver al darrere. Si n’apareix un altre, el port s’apaga sol.',
    sc: ['intruso', 'Desendolla P1-ADM-03 de la seva roseta, connecta un PC intrús i mira com cau el port.'],
    subs: [
      ['4.A1.1', 'Criteri aplicat',
        D.p('Port Security limita quines adreces MAC es poden connectar a cada port del switch. Si es connecta un equip que no és l’autoritzat, el port es desactiva sol (estat <b>err-disabled</b>) i ningú no pot fer servir aquella presa fins que un administrador el torna a activar. Així s’evita que algú endolli un portàtil propi o un switch en una presa de l’empresa.') +
        D.tbl(['Tipus de port', 'Màxim de MAC', 'Acció', 'Per què'], [
          ['Lloc de treball normal (un PC)', '1 (sticky)', 'Shutdown', 'A cada presa hi va un sol equip. Qualsevol altra MAC és un intrús.'],
          ['Lloc amb telèfon IP (PC connectat al telèfon)', '3 (sticky)', 'Shutdown', 'Hi ha dos equips: el telèfon i el PC que en penja. El telèfon IP ocupa dues entrades a port-security (vegeu més avall), així que el màxim real és 3. Un tercer equip ja supera el límit.'],
          ['Punt d’accés Wi-Fi', '32 (corporatiu) / 64 (convidats)', 'Restrict', 'Al port de l’AP apareixen les MAC de tots els clients sense fil. Amb Restrict, si se supera el límit només es descarten els equips sobrants i no es talla tot el Wi-Fi.'],
          ['Port lliure', '—', 'Apagat (VLAN 998)', 'Un port que no es fa servir no ha d’estar mai actiu.']
        ], 'Taula 25. Criteri de Port Security.') +
        D.p('Les MAC es desen amb <b>sticky</b>: el switch aprèn la MAC del primer equip que es connecta i la desa a la configuració, així que després d’un reinici continua sabent quin és l’equip autoritzat sense escriure cada MAC a mà.') +
        D.note('Al principi vam configurar els ports amb telèfon amb un màxim de 2 (telèfon + PC), però el port es desactivava sol amb els equips legítims. El missatge del switch indicava que la MAC que provocava la violació era la del mateix telèfon (0060.7035.5001): el telèfon IP, a més del trànsit de dades, envia trànsit propi de veu, i el switch el compta com una entrada més. Per això el màxim és 3, que continua sent «un PC i un telèfon» i continua apagant el port si s’hi connecta qualsevol altre equip.', 'fix', 'El que vam aprendre') +
        D.p('Els ports amb telèfon són <code>BCN-P1-ACC1 Fa0/2</code>, <code>BCN-P3-ACC1 Fa0/10</code> i <code>ZGZ-ACC1 Fa0/6</code>. Prova-ho al switch:') +
        D.w('portsec')],
      ['4.A1.2', 'Comprovacions al Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show port-security', 'La taula de ports protegits: Fa0/3 amb màxim 1, Fa0/2 (telèfon) amb màxim 3 i Fa0/1 (AP) amb 32 i acció Restrict. La columna SecurityViolation ha d’estar a 0.', 56) +
        D.chk('BCN-P1-ACC1', 'show port-security interface FastEthernet0/2', 'El port amb telèfon en estat Secure-up, amb les MAC del telèfon i del PC apreses com a sticky i cap violació.', 57) +
        D.chk('BCN-P1-ACC1', 'show running-config interface FastEthernet0/3', 'La configuració del port amb la MAC sticky del PC desada.', 58)],
      ['4.A1.3', 'Prova: connexió d’un equip intrús',
        D.p('Desconnectem P1-ADM-03 de la seva roseta (P1-R02) i connectem un PC nou amb una IP fixa de la VLAN 20. Quan el PC nou envia el primer paquet, el switch veu una MAC que no és l’autoritzada i desactiva el port.') +
        D.p(D.sc('intruso', 'Reproduir la prova al Tracer')) +
        D.chk('PC intrús', 'ping 10.1.20.1', 'El PC nou intenta arribar a la seva porta d’enllaç i no rep resposta: el switch ha tallat el port en veure la seva MAC.', 59, 'PC intruso|ping 10.1.20.1') +
        D.chk('BCN-P1-ACC1', '(missatges a la consola)', '%PORT_SECURITY-2-PSECURE_VIOLATION amb la MAC del PC intrús (000C.8587.538A) i %PM-4-ERR_DISABLE, que posa Fa0/3 en estat err-disabled.', 60) +
        D.chk('BCN-P1-ACC1', 'show port-security interface FastEthernet0/3', 'Port Status: Secure-shutdown, Security Violation Count: 1 i, a Last Source Address, la MAC del PC intrús.', 61) +
        D.chk('BCN-P1-ACC1', 'show interfaces FastEthernet0/3 status', 'El port en estat err-disabled.', 62) +
        D.p('Per tornar-lo a deixar bé es treu el PC intrús, es torna a connectar P1-ADM-03 i al switch es fa <code>shutdown</code> i <code>no shutdown</code> al port.')]
    ]
  });

  LT.sec({
    id: '4.A2', t: 'DHCP Snooping', short: 'DHCP Snooping',
    lead: 'Només el servidor legítim pot repartir adreces. Una oferta DHCP que entra per un port d’usuari es llença.',
    sc: ['rogue', 'Connecta un servidor DHCP pirata en una presa d’usuari i mira com el switch en descarta les ofertes.'],
    subs: [
      ['4.A2.1', 'Què protegeix i com',
        D.p('Tot l’adreçament dels clients és per DHCP. El client vol evitar els dos atacs típics contra el DHCP:') +
        D.ul(['<b>DHCP intrús (rogue DHCP)</b>: algú connecta un servidor DHCP propi i reparteix una porta d’enllaç falsa per interceptar el trànsit. <b>Protecció: DHCP snooping.</b> Al switch només els ports <i>trusted</i> poden enviar respostes DHCP (ofertes); als nostres switches d’accés només ho són els dos troncals cap als cores, que és per on arriben les respostes del servidor legítim. Qualsevol oferta que arribi per un port d’usuari es descarta.',
          '<b>Atac d’esgotament (DHCP starvation)</b>: un equip envia milers de peticions amb MAC inventades fins a esgotar les adreces del servidor. <b>Protecció:</b> <code>ip dhcp snooping limit rate 10</code> a cada port d’usuari (si un port passa de 10 paquets DHCP per segon, es desactiva) i, a més, port-security, que no deixa fer servir més MAC de les permeses.']) +
        D.w('snoop') +
        D.p('A més, el switch apunta a la <b>taula de bindings</b> quina IP ha donat el servidor a cada MAC i a quin port, així se sap en tot moment qui té cada adreça. L’opció 82 està desactivada perquè el servidor DHCP del Packet Tracer no la fa servir i descartaria les peticions.',
          'El servidor DHCP de cada seu és a la VLAN 50 (SRV-HV01 i SRV-ZGZ01) i els cores li reenvien les peticions amb <code>ip helper-address</code> (punt 3.A1).')],
      ['4.A2.2', 'Comprovacions al Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show ip dhcp snooping', 'DHCP snooping activat a les VLAN de la seu, Gi0/1 i Gi0/2 com a trusted sense límit, i els ports d’usuari com a untrusted amb Rate limit 10.', 63) +
        D.chk('BCN-P1-ACC1', 'show ip dhcp snooping binding', 'Una línia per cada PC del switch que ha rebut IP: la seva MAC, la IP que li ha donat el servidor, la VLAN i el port. Si és buida, es fa ipconfig /renew a P1-ADM-03 i es repeteix.', 64) +
        D.chk('P1-ADM-03', 'ipconfig /renew', 'Que el PC rep la IP, la màscara, la porta d’enllaç 10.1.20.1 i el DNS 10.1.50.10 del servidor legítim.', 65)]
    ]
  });

  LT.sec({
    id: '4.A3', t: 'Protecció STP (BPDU Guard i PortFast)', short: 'STP, BPDU Guard i PortFast',
    lead: 'Cap cable no és imprescindible. Spanning Tree deixa un enllaç de reserva bloquejat i BPDU Guard apaga qualsevol switch que algú endolli on no toca.',
    sc: ['trunk', 'Talla el troncal principal de la planta 1 i mira com el de reserva passa a reenviar.'],
    subs: [
      ['4.A3.1', 'Disseny redundant i Spanning Tree',
        D.p('El client no vol que cap part de l’empresa depengui d’un sol cable. Per això cada switch d’accés té dos enllaços troncals, un a cada core, i els dos cores estan units entre ells. Aquests enllaços dobles formen bucles, i Spanning Tree (en la seva versió ràpida, <b>Rapid PVST+</b>) els talla deixant un dels dos enllaços bloquejat de reserva. Si l’enllaç actiu cau, el bloquejat passa a reenviar en un o dos segons.') +
        D.ul(['<b>Arrel fixada</b>: el CORE1 té prioritat 24576 (arrel de totes les VLAN) i el CORE2 28672 (arrel de reserva). Així el camí és sempre el mateix i no depèn de quin switch s’encén primer.', '<b>Resultat</b>: a cada switch d’accés, el troncal cap al CORE1 queda com a <b>Root FWD</b> i el troncal cap al CORE2 com a <b>Altn BLK</b> (bloquejat, de reserva).']) +
        D.w('stp')],
      ['4.A3.2', 'PortFast i BPDU Guard',
        D.p('Als ports on va un usuari (PC, telèfon, impressora, AP) activem dues proteccions:') +
        D.ul(['<b>PortFast</b>: el port passa directament a reenviar en connectar l’equip, sense esperar els estats de Spanning Tree. L’usuari té xarxa a l’instant i el PC rep la IP per DHCP sense errors de temps d’espera.', '<b>BPDU Guard</b>: un port d’usuari no hauria de rebre mai missatges de Spanning Tree (BPDU). Si en rep, és que algú hi ha connectat un switch, i el port es desactiva (err-disabled). Així ningú no pot crear un bucle ni intentar que el seu switch es converteixi en l’arrel de la xarxa.']) +
        D.p('Als troncals no hi ha ni PortFast ni BPDU Guard, perquè allà sí que hi ha d’haver BPDU.')],
      ['4.A3.3', 'EtherChannel entre cores i HSRP',
        D.p('Els dos cores estan units per dos cables agrupats en un <b>EtherChannel LACP (Port-channel 1)</b>. Per a Spanning Tree és un sol enllaç, així que no es bloqueja cap dels dos cables i s’aprofita l’amplada de banda de tots dos; si se’n talla un, l’altre continua. A més, la porta d’enllaç de cada VLAN és una IP virtual <b>HSRP</b> compartida pels dos cores (punt 3.A1). Amb aquestes tres peces (enllaços dobles amb STP, EtherChannel i HSRP), la xarxa de cada seu no depèn de cap cable ni de cap core.') + D.w('hsrp')],
      ['4.A3.4', 'Comprovacions al Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show spanning-tree interface FastEthernet0/3 detail', 'La línia «The port is in the portfast mode»: PortFast actiu al port d’usuari. El 2960 del Packet Tracer no mostra la línia de BPDU Guard en aquesta comanda; la seva configuració es veu a la següent.', 66) +
        D.chk('BCN-P1-ACC1', 'show running-config interface FastEthernet0/3', 'Les línies spanning-tree portfast i spanning-tree bpduguard enable.', 67) +
        D.chk('BCN-P1-ACC1', 'show spanning-tree vlan 20', 'L’arrel és BCN-CORE1 (prioritat 24596), Gi0/1 és Root FWD i Gi0/2 és Altn BLK: hi ha un enllaç bloquejat de reserva, que a l’Sprint 1 no apareixia.', 68) +
        D.chk('BCN-CORE1', 'show spanning-tree vlan 20', '«This bridge is the root»: el CORE1 és l’arrel a propòsit.', 69) +
        D.chk('BCN-CORE1', 'show etherchannel summary', 'Po1(SU) amb protocol LACP i els dos ports Gi1/0/23 i Gi1/0/24 en estat (P).', 70)],
      ['4.A3.5', 'Prova: connexió d’un switch en una presa d’usuari (BPDU Guard)',
        D.p('Desconnectem P1-ADM-03 de la seva roseta i connectem un switch 2960 nou. El switch nou comença a enviar BPDU i el port es desactiva.') + D.p(D.sc('bpdu', 'Reproduir la prova al Tracer')) +
        D.chk('BCN-P1-ACC1', '(missatge a la consola)', 'El missatge %SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port FastEthernet0/3 with BPDU Guard enabled. Disabling port.', 71) +
        D.note('Per veure el missatge del BPDU Guard vam treure abans el Port Security d’aquest port. Si hi és, salta primer la violació per MAC desconeguda i el port cau per Port Security, no per BPDU Guard. En funcionament normal les dues proteccions són actives alhora i qualsevol de les dues apaga el port, que és el que volem.') +
        D.chk('BCN-P1-ACC1', 'show interfaces FastEthernet0/3 status', 'El port en estat err-disabled.', 72)],
      ['4.A3.6', 'Prova: tall d’un enllaç troncal',
        D.p('A BCN-CORE1 apaguem el troncal cap a la planta 1 (<code>interface Gi1/0/3</code> → <code>shutdown</code>). ' + D.sc('trunk', 'Reproduir al Tracer')) +
        D.chk('BCN-P1-ACC1', 'show spanning-tree vlan 20', 'Ara Gi0/2 (cap al CORE2) és Root FWD: l’enllaç que estava bloquejat ha passat a reenviar.', 73, 'BCN-P1-ACC1|show spanning-tree vlan 20 @cut') +
        D.chk('P1-ADM-03', 'ping 10.1.50.10', 'Amb el troncal cap al CORE1 apagat, el PC continua arribant al servidor: el trànsit ja va pel CORE2.', 74, 'P1-ADM-03|ping 10.1.50.10 @cut')]
    ]
  });

  LT.sec({
    id: '4.B1', t: 'ACL VLAN Convidats', short: 'ACL de convidats',
    lead: 'Els convidats naveguen i res més: DHCP, DNS, HTTP i HTTPS. Tota la resta cau al deny final.',
    sc: ['acl-inv', 'Connecta’t al Wi-Fi de convidats i intenta arribar a un servidor intern.'],
    subs: [
      ['4.B1.1', 'Què filtra',
        D.p('La VLAN 40 és el Wi-Fi de convidats. L’enunciat demana que els convidats només puguin sortir a Internet amb els serveis estrictament necessaris per navegar: HTTP, HTTPS i DNS, més el DHCP per rebre la IP. Qualsevol altra cosa queda bloquejada. La llista <b>ACL-INVITADOS-IN</b> s’aplica d’entrada a la SVI de la VLAN 40 dels dos cores, així filtra tot el que surt de la xarxa de convidats abans que arribi a una altra VLAN:') +
        D.ul(['Permet el DHCP (bootps), perquè els convidats rebin adreça.', 'Permet el DNS (UDP 53), per resoldre noms.', 'Permet l’HTTP (80) i l’HTTPS (443), per navegar.', 'Denega tota la resta amb el <code>deny ip any any</code> final: el ping (ICMP), l’SSH, l’FTP i qualsevol altre servei.']) +
        D.p('Els convidats reben com a DNS el DNS públic (203.0.113.53) i no el de l’empresa, perquè no han de consultar cap servei intern. En IPv6, la llista <b>ACL6-INVITADOS-IN</b> bloqueja tot el prefix de l’empresa (2001:db8:acad::/48) i permet la resta.') +
        D.p('Envia paquets des d’un mòbil de convidat i mira quina línia de la llista els decideix:') + D.w('acl', { k: 'inv' })],
      ['4.B1.2', 'Comprovacions al Packet Tracer',
        D.chk('P0-INV-01', 'Config → Wireless0', 'El mòbil del convidat connectat a l’SSID LogiTrans-Invitados.', 75, 'P0-INV-01|wireless') +
        D.chk('P0-INV-01', 'ipconfig', 'Una IP de la VLAN 40 (10.1.40.11), la màscara 255.255.255.128 i la porta d’enllaç 10.1.40.1, a més de l’adreça IPv6 del prefix 2001:DB8:ACAD:1040::/64.', 76) +
        D.chk('P0-INV-01', 'ping 10.1.50.10', 'Destination host unreachable: el convidat no arriba als servidors de Barcelona.', 77) +
        D.chk('P0-INV-01', 'ping 10.2.50.10', 'Tampoc no arriba als de Saragossa.', 78) +
        D.chk('P0-INV-01', 'ping 203.0.113.10', 'Destination host unreachable. Els convidats no tenen ICMP cap a Internet; l’ACL només deixa sortir HTTP, HTTPS i DNS. Abans del canvi (Sprint 2 v4) sí que responia, perquè l’ACL ho permetia tot cap a fora.', 79) +
        D.note('La prova del que sí que passa la donen els comptadors de la llista (captura següent): les línies del DHCP i del DNS tenen coincidències. No posem la prova del navegador cap a la web de l’empresa perquè el Packet Tracer no resol bé el «hairpin NAT»: un equip de dins que va a la IP pública 85.100.1.18 del seu propi router no rep resposta. Des d’Internet la web sí que carrega (punt 3.C3).', 'lim') +
        D.chk('BCN-CORE1', 'show access-lists', 'Les regles d’ACL-INVITADOS-IN amb els comptadors: la 10 (DHCP) té 3 coincidències i la 20 (DNS) 7, que és el trànsit permès; la 50 (deny ip any any) en té moltes més, que són els pings i la resta de trànsit bloquejat.', 80, 'BCN-CORE1|show access-lists ACL-INVITADOS-IN') +
        D.chk('BCN-CORE1', 'show running-config | include access-group|traffic-filter', 'Les línies ip access-group ACL-INVITADOS-IN in i ipv6 traffic-filter ACL6-INVITADOS-IN in, que demostren que la llista està aplicada.', 81) +
        D.note('Al Packet Tracer, la comanda <code>show ip interface Vlan40</code> mostra «Inbound access list is not set» encara que la llista estigui aplicada. Per això la comprovació es fa amb la configuració i amb els comptadors de la llista, que només pugen si la llista està aplicada en alguna interfície.', 'lim')]
    ]
  });

  LT.sec({
    id: '4.B2', t: 'ACL VLAN Gestió', short: 'ACL de gestió',
    lead: 'A la VLAN de gestió només hi entra el NOC. Tres capes: una ACL a la VLAN, una altra a les línies remotes i només SSH.',
    sc: ['acl-ges', 'Intenta administrar el core des d’un PC d’administració i després des del NOC.'],
    subs: [
      ['4.B2.1', 'Què filtra',
        D.p('La VLAN 99 és la de gestió dels equips de xarxa i només hi poden entrar els administradors (el NOC de la P3 i la sala de gestió del magatzem). La protecció té tres capes:') +
        D.ol(['<b>ACL-GESTION-OUT</b>, aplicada de sortida a la SVI de la VLAN 99: només deixa entrar a la VLAN de gestió el trànsit que ve de les xarxes de gestió de les dues seus, les respostes dels servidors (DHCP, DNS, RADIUS), les respostes de ping i les respostes de l’SSH dels routers. Un PC de qualsevol altra VLAN no hi arriba.', '<b>ACL-VTY-GESTION</b>, aplicada a les línies VTY de routers i cores: només s’accepta una connexió remota si ve de les xarxes de gestió.', '<b>Només SSH</b>: les línies VTY tenen <code>transport input ssh</code>, així que Telnet (sense xifrar) no funciona.']) +
        D.note('La regla de l’SSH dels routers (<code>permit tcp 10.S.254.0 0.0.0.255 eq 22 any established</code>, que a la llista apareix com a línia 80) la vam afegir durant les proves: sense ella, l’SSH del NOC als routers no funcionava, perquè la resposta del router (que surt de la xarxa 10.S.254.0) no podia entrar a la VLAN de gestió. Amb <code>established</code> només entren les respostes de connexions que ha obert el NOC; un router no pot obrir cap connexió nova cap a la VLAN de gestió.', 'fix', 'El que vam aprendre') +
        D.w('acl', { k: 'ges' })],
      ['4.B2.2', 'Comprovacions al Packet Tracer',
        D.chk('P1-ADM-03', 'ping 10.1.99.4', 'No respon: un PC d’Administració no arriba a la IP de gestió d’un switch.', 82) +
        D.chk('P1-ADM-03', 'ssh -l noc.admin 10.1.99.2', 'No connecta: les línies VTY només accepten connexions de la xarxa de gestió, encara que l’usuari i la contrasenya siguin bons.', 83) +
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.99.2', 'Des del NOC sí que hi entra, amb l’usuari admin.xarxa01 (prompt BCN-CORE1>).', 84) +
        D.chk('P3-GES-01', 'telnet 10.1.99.2', 'El switch obre la connexió i la tanca a l’instant («Connection closed by foreign host») sense demanar usuari: només s’accepta SSH.', 85) +
        D.chk('BCN-CORE1', 'show access-lists', 'Les regles d’ACL-GESTION-OUT i ACL-VTY-GESTION amb els comptadors: la línia 90 (deny ip any any) té 8 coincidències, que són les proves bloquejades, i la 30 (respostes UDP del servidor) en té 4. La regla de l’SSH dels routers és la línia 80.', 86, 'BCN-CORE1|show access-lists ACL-GESTION-OUT') +
        D.chk('BCN-CORE1', 'show running-config | include access-group|access-class', 'ip access-group ACL-GESTION-OUT out i access-class ACL-VTY-GESTION in.', 87)]
    ]
  });

  LT.sec({
    id: '4.B3', t: 'ACL VLAN Operaris', short: 'ACL d’operaris',
    lead: 'Els operaris del magatzem arriben al just per treballar: la base de dades, la web, el DHCP i el DNS. Res més.',
    sc: ['acl-ope', 'Des d’un terminal de moll, obre la web corporativa i intenta sortir a Internet.'],
    subs: [
      ['4.B3.1', 'Què filtra',
        D.p('La VLAN 30 és la dels operaris del magatzem (terminals de moll, escàners i PC de la nau). L’enunciat demana que els operaris només arribin als serveis estrictament necessaris per treballar: la base de dades i la web corporativa de la VLAN de servidors, més el DHCP i el DNS. La llista <b>ACL-OPERARIOS-IN</b> s’aplica d’entrada a la SVI de la VLAN 30 dels dos cores de Saragossa:') +
        D.ul(['Permet el DHCP (bootps), perquè els terminals rebin adreça.', 'Permet el DNS (UDP 53), només cap al servidor de Saragossa (10.2.50.10).', 'Permet la base de dades (TCP 3306), només cap a SRV-HV02 (10.1.50.11).', 'Permet la web corporativa (HTTP 80 i HTTPS 443), només cap a SRV-HV03 (10.1.50.12).', 'Denega tota la resta amb el <code>deny ip any any</code> final: les altres VLAN, el ping i la sortida a Internet.']) +
        D.w('acl', { k: 'ope' })],
      ['4.B3.2', 'Comprovacions al Packet Tracer',
        D.chk('ZGZ-MUE-01', 'ping 10.2.10.5', '«Reply from 10.2.30.2: Destination host unreachable»: és el core qui respon que el destí (un equip de Direcció) no és accessible.', 88) +
        D.chk('ZGZ-MUE-01', 'ping 10.2.50.10', 'Destination host unreachable. Abans responia; ara, amb l’ACL estricta, l’ICMP cap als servidors no està permès. Només passen DHCP, DNS, 3306 (BD) i 80/443 al servidor web.', 89) +
        D.chk('ZGZ-MUE-01', 'ping 10.1.50.10', 'Destination host unreachable. Els operaris tampoc no arriben per ICMP als servidors de Barcelona; només arriben als ports concrets autoritzats (3306 i 80/443).', 90) +
        D.chk('ZGZ-MUE-01', 'ping 203.0.113.10', 'Destination host unreachable. Abans responia; la nova ACL no permet sortida genèrica a Internet des de la VLAN 30. Els operaris no necessiten navegar lliurement, només fer servir els serveis corporatius.', 91) +
        D.chk('ZGZ-MUE-01', 'Web Browser → http://www.logitrans.com', 'La web corporativa carrega bé: els serveis legítims sí que passen (HTTP al 10.1.50.12), mentre que la navegació lliure per Internet queda bloquejada.', 92, 'ZGZ-MUE-01|browser http://www.logitrans.com') +
        D.chk('ZGZ-CORE1', 'show access-lists', 'Les regles d’ACL-OPERARIOS-IN amb els comptadors: la 10 (DHCP), la 20 (DNS) i la 40 (web a 10.1.50.12) tenen coincidències, que és el trànsit permès, i la 60 (deny ip any any) té totes les proves bloquejades. La 30 (base de dades) no en té perquè al Packet Tracer no hi ha cap aplicació que s’hi connecti.', 93) +
        D.chk('ZGZ-CORE1', 'show running-config | include access-group', 'ip access-group ACL-OPERARIOS-IN in.', 94)]
    ]
  });
})();
