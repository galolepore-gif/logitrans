/* Punt 5 de la memòria en català: serveis */
(function () {
  var LT = window.LT, D = LT.D;
  LT.GPO_FULL = [
    ['GPO-LogiTrans-Seguridad', 'Directiva base de seguretat del domini. Entre altres coses, activa el tallafoc de Windows Defender als tres perfils (5.C2).', 'Que cap equip del domini quedi sense la configuració mínima.', 'Domini'],
    ['GPO-Contrasenas-Bloqueo', 'Contrasenyes de 8 caràcters com a mínim i bloqueig del compte després de 3 intents fallits.', 'Evita contrasenyes febles i atacs de força bruta.', 'Domini'],
    ['GPO-Bloqueo-Pantalla', 'Activa l’estalvi de pantalla després d’un temps sense activitat i demana la contrasenya per desbloquejar.', 'Si un usuari s’aixeca del lloc, ningú no pot fer servir la seva sessió.', 'Usuari'],
    ['GPO-Bloqueo-USB', 'Denega la lectura i l’escriptura als dispositius d’emmagatzematge extraïbles.', 'Evita la fuita d’informació i l’entrada de programari maliciós per USB.', 'Equip'],
    ['GPO-BitLocker', 'Permet activar BitLocker en equips sense xip TPM, com les màquines virtuals.', 'Perquè els discos dels clients es puguin xifrar (5.C1).', 'Equip'],
    ['GPO-Redireccion-Docs', 'Redirigeix la carpeta Documents de l’usuari a la carpeta de xarxa \\\\SRV-AD\\Perfiles.', 'Els documents queden al servidor, xifrats i protegits pel RAID, i no al PC (5.C1).', 'Usuari'],
    ['GPO-Unidades-Mapeadas', 'Connecta \\\\SRV-AD\\Departaments a la lletra S: en iniciar la sessió.', 'Cada usuari troba la carpeta del seu departament sense configurar res.', 'Usuari'],
    ['GPO-Carpetas-Magatzem', 'Configuració pròpia dels equips de l’OU Magatzem, com la carpeta compartida del departament.', 'Els terminals del magatzem tenen el seu propi entorn.', 'OU Magatzem']
  ];

  LT.sec({
    id: '5.A1', t: 'Active Directory (logitrans.local) i OU', short: 'Active Directory i OU',
    lead: 'Un sol punt d’autenticació per a tota l’empresa: l’inici de sessió, el Wi-Fi corporatiu i fins i tot els equips Cisco validen contra el mateix directori.',
    subs: [
      ['5.A1.0', 'Punt de partida',
        D.p('El client vol que l’Active Directory sigui el punt central d’autenticació: els usuaris inicien sessió al sistema operatiu amb el seu compte del domini, el Wi-Fi corporatiu valida contra el mateix directori i els equips Cisco també (punt 5.A2). Instal·lem el rol AD DS en un Windows Server 2022 (SRV-AD) i creem el domini <b>logitrans.local</b>.')],
      ['5.A1.1', 'Entorn de laboratori dels serveis',
        D.p('El Packet Tracer no pot executar un Windows Server, un WordPress ni un FOG. Per això els serveis d’aquest bloc els muntem en màquines virtuals (VirtualBox) i en contenidors Docker, i al Packet Tracer simulem només la part de xarxa (DHCP, DNS, RADIUS i web a SRV-HV01 i SRV-HV03). La taula relaciona cada servei amb on el muntem i amb l’equip del disseny que el farà a la instal·lació real.') +
        D.tbl(['Servei', 'On el muntem al laboratori', 'Equip del disseny'], [
          ['Active Directory, DNS, DHCP, NPS (RADIUS) i carpetes de xarxa', 'Màquina virtual Windows Server 2022 SRV-AD', 'SRV-HV01 (10.1.50.10) a Barcelona; SRV-ZGZ01 (10.2.50.10) com a segon controlador de domini al magatzem'],
          ['Clients del domini', 'Màquina virtual Windows 11 unida a logitrans.local i màquina virtual Windows 10 per a la prova de BitLocker', 'Llocs de treball de les dues seus'],
          ['WordPress, àrea de clients i streaming (Jellyfin)', 'Cinc contenidors Docker (docker compose) en un equip amfitrió Windows', 'SRV-HV03 (10.1.50.12), publicat a Internet per 85.100.1.18'],
          ['Repositori de mitjans', 'Carpeta compartida C:\\Repositorio a l’equip amfitrió (BYWAAKE), amb grups locals que es diuen igual que els de l’AD', 'SRV-HV02, amb els grups del domini'],
          ['FOG (desplegament d’imatges)', 'Màquina virtual Ubuntu amb FOG Project en una xarxa interna aïllada (192.168.50.0/24)', 'Taller IT de la planta 0, a la VLAN 50'],
          ['Auditoria (Nmap i WPScan)', 'Des de l’equip amfitrió contra la web del laboratori', '—']
        ], 'Taula 26. Entorn de laboratori i equip del disseny de cada servei.') +
        D.p('Els noms dels grups, dels usuaris i de les carpetes són els mateixos que tindrà la instal·lació real, així que la configuració es pot portar als servidors del disseny sense canviar res.')],
      ['5.A1.2', 'Unitats organitzatives, grups i usuaris',
        D.p('Creem una OU per departament, amb el seu grup de seguretat i dos usuaris d’exemple, com demanava el client (no cal donar d’alta els 500 usuaris). Els permisos no es donen mai a un usuari solt: es donen al grup del departament, i l’usuari els hereta pel fet de ser-ne membre. Quan entra una persona nova, només cal posar-la al grup que toca.') +
        D.w('aduc') +
        D.tbl(['OU', 'Grup de seguretat', 'Usuaris d’exemple'], LT.AD.map(function (o) { return [o.ou, o.group, o.users.map(function (u) { return '<code>' + u[0] + '</code> (' + u[1] + ')'; }).join(', ')]; }), 'Taula 27. Unitats organitzatives, grups i usuaris d’exemple.') +
        D.chk('SRV-AD', 'Server Manager → Tools → Active Directory Users and Computers', 'El domini logitrans.local amb les OU Administracio, Convidats, Direccio, Gestio, Magatzem i Servidors. Amb l’OU Administracio seleccionada es veuen el grup Grupo-Administracio i els dos usuaris d’exemple, Laura Castellanos i Pablo Martin.', 95)],
      ['5.A1.3', 'Permisos de cada departament',
        D.p('El client ens demanava pensar quins permisos té cada departament. Els resumim aquí; cadascun s’aplica al punt que s’indica. Tria un grup i una acció:') +
        D.w('perm') +
        D.tbl(['Grup', 'Què pot fer', 'On s’aplica'], [
          ['Grupo-Direccio', 'Modificar la carpeta del seu departament i llegir el repositori.', 'Permisos NTFS (5.C1) i repositori (5.D)'],
          ['Grupo-Administracio', 'Modificar la carpeta del seu departament i llegir el repositori.', 'Permisos NTFS (5.C1) i repositori (5.D)'],
          ['Grupo-Magatzem', 'Modificar la carpeta del seu departament, llegir el repositori i veure els vídeos de formació del magatzem.', 'Permisos NTFS (5.C1), repositori i Jellyfin (5.D)'],
          ['Grupo-Gestio', 'Administrar els switches i els routers per SSH, modificar el repositori i llegir els registres de l’antivirus.', 'NPS (5.A2), repositori (5.D) i carpeta de registres (5.C2)'],
          ['Grupo-Servidors', 'Administrar els servidors.', 'Administradors dels servidors'],
          ['Grupo-Convidats', 'Cap accés a recursos interns.', 'Wi-Fi de convidats a la VLAN 40 (4.B1)']
        ], 'Taula 28. Permisos per grup.')],
      ['5.A1.4', 'Equips units al domini i inici de sessió',
        D.p('El client Windows 11 està unit al domini i l’usuari entra amb el seu compte de l’AD, per exemple <code>LOGITRANS\\admin.rrhh</code> (Pablo Martin, d’Administració). Ho comprovem amb <code>gpresult /r</code> (punt 5.A3.2): mostra l’usuari <code>CN=Pablo Martin,OU=Administracio,DC=logitrans,DC=local</code>, el domini LOGITRANS i les directives que li ha enviat SRV-AD. És a dir, l’equip és del domini i la sessió l’ha validat el controlador de domini, no l’equip local.') +
        D.w('login')],
      ['5.A1.5', 'DHCP i DNS del domini',
        D.p('SRV-AD també fa de servidor DHCP i DNS. Creem un àmbit per cada VLAN de les dues seus amb les mateixes xarxes i portes d’enllaç que al Packet Tracer (punt 3.A1). Les peticions dels clients arriben a través dels cores amb <code>ip helper-address</code> (relay DHCP), igual que al Packet Tracer.') +
        D.chk('SRV-AD', 'Server Manager → Tools → DHCP → IPv4', 'Els onze àmbits: VLAN 10, 20, 40, 50 i 99 de Barcelona (10.1.X.0) i VLAN 10, 20, 30, 40, 50 i 99 de Saragossa (10.2.X.0).', 96) +
        D.p('Els equips que han de tenir sempre la mateixa adreça però no són de xarxa, com les impressores, tenen una reserva al DHCP en lloc d’una IP posada a mà. Així continuen sent «per DHCP», com demana el client, i l’adreça no canvia mai.') +
        D.chk('SRV-AD', 'DHCP → Scope [10.2.30.0] VLAN 30 - Magatzem ZGZ → Reservations', 'La reserva [10.2.30.20] ZGZ-ETQ-02, la impressora d’etiquetes del magatzem.', 97) +
        D.p('Al DNS, a més de la zona del domini (logitrans.local), creem la zona <b>logitrans.com</b>, que resol www.logitrans.com a la IP interna del servidor web (10.1.50.12). És el DNS d’horitzó dividit del punt 3.C3: des de dins la web es resol a la IP privada i el trànsit no surt a Internet; des de fora, el DNS públic la resol a 85.100.1.18.') +
        D.chk('SRV-AD', 'Server Manager → Tools → DNS → Forward Lookup Zones', 'Les zones _msdcs.logitrans.local, logitrans.local i logitrans.com, integrades a l’Active Directory i en estat Running.', 98) +
        D.chk('SRV-AD', 'DNS → Reverse Lookup Zones', 'Les zones inverses 10.in-addr.arpa i 50.1.10.in-addr.arpa, perquè una consulta inversa (PTR) d’una adreça interna retorni el nom de l’equip.', 99)]
    ]
  });

  LT.sec({
    id: '5.A2', t: 'Autenticació de xarxa RADIUS / 802.1X', short: 'RADIUS / 802.1X',
    lead: 'Ni els switches ni els routers desen les contrasenyes dels administradors: les pregunten al servidor RADIUS, que valida contra l’Active Directory.',
    sc: ['radius', 'Entra per SSH al core amb un usuari que només existeix al servidor RADIUS.'],
    subs: [
      ['5.A2.1', 'Autenticació centralitzada dels equips Cisco (AAA)',
        D.p('El client vol que l’autenticació dels switches i els routers no sigui local sinó contra l’Active Directory. Els equips Cisco ho fan amb <b>AAA</b>: en lloc de comprovar l’usuari i la contrasenya a la seva pròpia configuració, ho pregunten a un servidor RADIUS. A la instal·lació real aquest servidor és l’NPS de SRV-AD, que valida contra l’Active Directory (punt 5.A2.4). Al Packet Tracer ho simulem amb el servei AAA de SRV-HV01 (Barcelona) i SRV-ZGZ01 (Saragossa), on hem donat d’alta els mateixos usuaris de l’OU Gestio.') +
        D.tbl(['Element', 'Configuració'], [
          ['Equips que autentiquen per RADIUS', 'Els routers de cada seu (RT1 i RT2) i els cores (CORE1 i CORE2)'],
          ['Servidor RADIUS', 'SRV-HV01 10.1.50.10 (Barcelona) i SRV-ZGZ01 10.2.50.10 (Saragossa), port 1645 i clau compartida'],
          ['Ordre d’autenticació', 'Primer RADIUS; si el servidor no respon, l’usuari local d’emergència (admin.local)'],
          ['Consola', 'Sempre local, per poder entrar encara que la xarxa estigui caiguda'],
          ['Usuaris al servidor', 'admin.xarxa01 i admin.xarxa02, els dos usuaris de l’OU Gestio de l’Active Directory'],
          ['Accés remot', 'Només SSH v2 i només des de la xarxa de gestió (punt 4.B2)']
        ], 'Taula 29. Autenticació AAA dels equips Cisco.') +
        D.note('Els switches d’accés 2960 del Packet Tracer no tenen les comandes d’AAA amb servidor RADIUS, així que fan servir l’usuari local. Als switches reals (Catalyst 9300) la configuració seria la mateixa que als cores.', 'lim')],
      ['5.A2.2', 'Wi-Fi corporatiu',
        D.p('Al Packet Tracer els tres SSID (<b>LogiTrans-Corp</b> a la VLAN 20, <b>LogiTrans-Almacen</b> a la VLAN 30 i <b>LogiTrans-Invitados</b> a la VLAN 40) estan configurats amb WPA2-PSK i xifratge AES, perquè els punts d’accés del simulador no fan bé el 802.1X. A la instal·lació real, els dos SSID corporatius fan servir <b>WPA2-Enterprise (802.1X)</b> contra l’NPS, i cada empleat entra al Wi-Fi amb el seu usuari de l’Active Directory (punt 5.A2.4). L’SSID de convidats es queda amb WPA2-PSK, perquè els convidats no tenen compte al domini; està aïllat per la VLAN 40 i la seva ACL (4.B1).') +
        D.w('dot1x')],
      ['5.A2.3', 'Comprovacions al Packet Tracer',
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.99.2', 'El NOC entra al core amb l’usuari admin.xarxa01, que no existeix al switch sinó només al servidor RADIUS: la contrasenya l’ha validat SRV-HV01.', 100) +
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.254.1', 'El mateix contra el router BCN-RT1 (prompt BCN-RT1>).', 101) +
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.99.2 (contrasenya incorrecta)', '«% Login invalid»: el servidor rebutja la contrasenya i la torna a demanar.', 102, 'P3-GES-01|ssh -l admin.xarxa01 10.1.99.2 @bad') +
        D.chk('BCN-RT1', 'show running-config | section aaa', 'aaa new-model i les llistes d’autenticació: la default amb RADIUS i, si no respon, local; la CONSOLA, local.', 103) +
        D.chk('BCN-RT1', 'show ip ssh', 'SSH Enabled - version 2.0.', 104) +
        D.chk('SRV-HV01', 'Services → AAA', 'El servei activat al port 1645, els equips de Barcelona donats d’alta com a clients RADIUS amb la seva IP i la clau, i els usuaris admin.xarxa01 i admin.xarxa02.', 105, 'SRV-HV01|aaa')],
      ['5.A2.4', 'Servidor RADIUS real (NPS) i 802.1X',
        D.p('A la instal·lació real el servidor RADIUS és el rol <b>Network Policy Server (NPS)</b> de SRV-AD, registrat a l’Active Directory per poder llegir els comptes i els grups. Hem donat d’alta com a clients RADIUS els equips que li fan les preguntes: els controladors Wi-Fi de les dues seus i el core de Barcelona.') +
        D.chk('SRV-AD', 'Network Policy Server → RADIUS Clients', 'Els clients WLC-BCN (10.1.99.20), WLC-ZGZ (10.2.99.2) i Core-BCN (10.1.99.2), tots en estat Enabled. Totes les adreces són de la VLAN 99 de gestió.', 106) +
        D.p('Les directives de xarxa de l’NPS decideixen qui pot entrar i on:') +
        D.ul(['<b>WiFi-LogiTrans-Corp</b>: dona accés a l’SSID corporatiu (VLAN 20) als usuaris del domini que s’identifiquen amb el seu usuari i contrasenya per 802.1X.', '<b>WiFi-LogiTrans-Almacen</b>: el mateix per a l’SSID del magatzem (VLAN 30).', '<b>AAA-Switches-TI</b>: autoritza l’entrada per SSH als switches i els routers només als membres de Grupo-Gestio, que són els mateixos usuaris que fem servir al Packet Tracer (5.A2.3).']) +
        D.chk('SRV-AD', 'Network Policy Server → Policies → Network Policies', 'Les tres directives activades (Enabled), amb l’ordre de processament 1, 2 i 3 i el tipus d’accés Grant Access.', 107) +
        D.chk('Client Windows 11', 'Inici → Sistema → Configuració avançada', 'A la pestanya «Nom de l’equip», el valor «Domini:» és logitrans.local: l’equip està unit al domini.', 108)]
    ]
  });

  LT.sec({
    id: '5.A3', t: 'Polítiques de grup (GPO)', short: 'Polítiques de grup (GPO)',
    lead: 'Vuit directives que configuren la seguretat de tots els equips i usuaris alhora, sense anar equip per equip.',
    subs: [
      ['5.A3.1', 'GPO aplicades',
        D.p('Amb les directives de grup (GPO) apliquem la mateixa configuració de seguretat a tots els equips i usuaris sense anar equip per equip. Creem vuit GPO i les vinculem al domini o a l’OU que toca. Fes clic a cadascuna:') +
        D.w('gpo') +
        D.tbl(['GPO', 'Què fa', 'Per què'], LT.GPO_FULL.map(function (g) { return ['<code>' + g[0] + '</code>', g[1], g[2]]; }), 'Taula 30. GPO de LogiTrans.') +
        D.chk('SRV-AD', 'Group Policy Management → Group Policy Objects', 'Les vuit GPO creades a Group Policy Objects i, a dalt de l’arbre, les que estan vinculades directament al domini logitrans.local.', 109)],
      ['5.A3.2', 'Comprovació al client',
        D.p('Per comprovar que les GPO arriben, iniciem sessió al client Windows 11 amb <code>LOGITRANS\\admin.rrhh</code> (Pablo Martin, OU Administracio) i fem <code>gpresult /r</code>.') +
        D.chk('Client Windows 11', 'gpresult /r', 'L’usuari CN=Pablo Martin,OU=Administracio,DC=logitrans,DC=local, el domini LOGITRANS, el controlador SRV-AD.logitrans.local i, a «Objectes de directiva de grup aplicats», GPO-Bloqueo-Pantalla, GPO-Redireccion-Docs i GPO-Unidades-Mapeadas. Són les GPO de la part d’usuari; la resta s’apliquen a la configuració de l’equip.', 110, 'WIN11|gpresult /r')]
    ]
  });

  LT.sec({
    id: '5.B1', t: 'WordPress corporatiu (LAMP/LEMP)', short: 'WordPress corporatiu',
    lead: 'Cinc contenidors, una sola porta: només nginx publica ports cap a fora.',
    subs: [
      ['5.B1.0', 'Arquitectura',
        D.p('La web corporativa és un WordPress sobre una pila <b>LEMP</b> (Linux, Nginx, MariaDB i PHP-FPM). En lloc d’instal·lar-ho tot en una sola màquina, cada peça va al seu contenidor Docker i s’aixequen juntes amb <code>docker compose</code>. Així cada servei està aïllat, es pot actualitzar per separat i tota la web es porta a SRV-HV03 copiant la carpeta del projecte.')],
      ['5.B1.1', 'Pila de contenidors',
        D.w('docker') +
        D.tbl(['Contenidor', 'Imatge', 'Port', 'Funció'], LT.DOCKER.map(function (c) { return ['<b>' + c.name + '</b>', '<code>' + c.image + '</code>', c.port + (c.pub ? ' (publicats)' : ' (intern)'), LT.tr(c.role)]; }), 'Taula 31. Contenidors de la web.') +
        D.p('Només nginx publica ports cap a fora (80 i 443). La base de dades, el WordPress, l’aplicació de clients i el Jellyfin només escolten a la xarxa interna de Docker, així que des de fora no s’hi arriba directament.') +
        D.chk('Equip amfitrió', 'docker compose up -d --wait', 'Els cinc contenidors aixecats i en estat Healthy.', 111, 'HOST|docker compose up -d --wait') +
        D.chk('Equip amfitrió', 'docker compose ps', 'Els cinc contenidors Up (healthy) i la columna de ports: només logitrans-web-nginx-1 té 0.0.0.0:80->80/tcp i 0.0.0.0:443->443/tcp; la resta només té el port intern.', 112, 'HOST|docker compose ps')],
      ['5.B1.2', 'Web corporativa',
        D.p('La portada presenta LogiTrans (transport i logística entre Barcelona i Saragossa), els serveis, les seus i el contacte, i té el botó «Àrea de clients» que porta a /clients. El contingut només el pot editar l’usuari administrador <code>logitrans</code>.') +
        D.chk('Navegador', 'https://logitrans.com', 'La portada de la web, amb la sessió de l’administrador oberta (a dalt, «Hola, logitrans»).', 113) +
        D.chk('Navegador', 'Pàgina d’accés de WordPress (wp-admin)', 'L’accés al tauler d’administració de WordPress amb l’usuari logitrans.', 114)],
      ['5.B1.3', 'Tallafoc d’aplicació (WAF) amb Wordfence',
        D.p('L’enunciat demana un mòdul de tallafoc d’aplicació al WordPress. Instal·lem <b>Wordfence</b> en la seva versió gratuïta i el registrem amb una llicència Free. Wordfence filtra les peticions abans que arribin a WordPress i bloqueja els patrons d’atac coneguts (injecció SQL, XSS, inclusió de fitxers) i els intents d’endevinar contrasenyes. Envia-li peticions:') +
        D.w('waf') +
        D.chk('WordPress', 'Wordfence → registre de la llicència', 'La pàgina d’instal·lació de la llicència Free per a https://logitrans.com. Avisa que, amb la versió gratuïta, les regles del tallafoc i les signatures de programari maliciós arriben amb 30 dies de retard.', 115) +
        D.chk('WordPress', 'Wordfence → All Options → Wordfence License', 'License Status: Free License Active.', 116) +
        D.chk('WordPress', 'Wordfence → Firewall', '«Wordfence Firewall Activated», les regles de la comunitat (70 %, amb el retard de 30 dies de la versió Free), la protecció contra força bruta al 100 % i la llista de bloqueig d’IP en temps real desactivada, que només és a la versió Premium.', 117) +
        D.p('El WAF està en mode bàsic (35 %). Per arribar al 100 % cal activar la protecció ampliada, que fa que Wordfence s’executi abans que el mateix WordPress.')],
      ['5.B1.4', 'Comprovació al Packet Tracer',
        D.p('Al Packet Tracer la web se simula amb el servei HTTP de SRV-HV03, publicat a Internet pel NAT estàtic (punt 3.C3).') +
        D.chk('PC-INTERNET', 'Web Browser → http://85.100.1.18', 'La pàgina de LogiTrans servida per SRV-HV03 a través de la IP pública 85.100.1.18, amb l’enllaç a l’àrea de clients.', 118, 'PC-INTERNET|browser http://85.100.1.18')]
    ]
  });

  LT.sec({
    id: '5.B2', t: 'Configuració de l’àrea de clients', short: 'Àrea de clients',
    lead: 'Mateix domini, aplicació independent. Un atac al WordPress no toca l’àrea de clients, i a l’inrevés.',
    subs: [
      ['5.B2.0', 'Com està feta',
        D.p('L’àrea de clients és a <b>logitrans.com/clients</b>, al mateix domini que la web, però és una aplicació independent: està feta en Python, corre amb Gunicorn al seu propi contenidor (clients) i té els seus propis usuaris, que no tenen res a veure amb els de WordPress. Nginx és qui reparteix: el que comença per /clients va a l’aplicació de clients i la resta a WordPress. És el que demanava el client: s’entra des del mateix lloc, però es gestiona per separat.')],
      ['5.B2.1', 'Accés privat i tauler d’enviaments',
        D.p('Aquesta és una rèplica funcional de l’àrea de clients. Entra amb l’usuari <code>cliente1</code> i la contrasenya <code>demo</code>:') +
        D.w('portal') +
        D.chk('Navegador', 'https://logitrans.com/clients', 'La pàgina d’accés privat, amb el seu propi formulari d’usuari i contrasenya i un enllaç per tornar a la web corporativa. No és l’inici de sessió de WordPress.', 119) +
        D.chk('Navegador', 'Accés amb l’usuari cliente1', 'El tauler del client: l’empresa Transportes Norte S.L. (contacte Marta) amb 3 enviaments, 2 en curs i 1 lliurat.', 120) +
        D.chk('Navegador', 'Tauler → Els teus enviaments', 'La llista d’enviaments del client, cadascun amb la referència, la mercaderia, la ruta, l’estat (al magatzem, en trànsit o lliurat) i la data d’actualització.', 121)],
      ['5.B2.2', 'Mesures de seguretat',
        D.p('L’aplicació de clients té dues proteccions pròpies, a més de les de la web:') +
        D.ul(['<b>Força bruta</b>: després de diversos intents fallits, l’accés queda bloquejat uns segons, i un programa no pot provar contrasenyes a tota velocitat. Prova-ho a la rèplica de dalt amb una contrasenya dolenta.', '<b>Control d’accés</b>: cada client només veu els seus enviaments. Si demana un enviament que no és seu, l’aplicació respon com si no existís i apunta l’intent al registre.']) +
        D.chk('Navegador', 'diversos intents d’accés amb una contrasenya incorrecta', '«Demasiados intentos. Espera 60 segundos.» (l’aplicació està en castellà)', 122) +
        D.chk('Navegador (sessió de cliente1)', 'https://logitrans.com/clients/envio/LT-2026-0201', 'Error 404 «No hemos encontrado lo que buscas»: l’enviament LT-2026-0201 és d’un altre client, i l’aplicació ni tan sols diu si existeix.', 123) +
        D.chk('Equip amfitrió (PowerShell)', 'docker compose logs clients | Select-String ENVIO_NO_AUTORIZADO', 'L’entrada del registre amb la data i l’hora: ENVIO_NO_AUTORIZADO usuario=cliente1 ref=\'LT-2026-0201\'. L’intent queda apuntat per a l’auditoria.', 124, 'Equipo anfitrión (PowerShell)|docker compose logs clients | Select-String ENVIO_NO_AUTORIZADO')]
    ]
  });

  LT.sec({
    id: '5.C1', t: 'Emmagatzematge RAID 5 i xifratge', short: 'RAID 5 i BitLocker',
    lead: 'Si falla un disc, l’empresa continua. Si roben un disc, no s’enduen res de llegible.',
    subs: [
      ['5.C1.0', 'Què demana el client',
        D.p('El client vol dues coses: que si falla un disc d’un servidor l’empresa continuï funcionant, i que si algú roba un equip no en pugui treure cap informació. La primera la resolem amb <b>RAID 5</b> i la segona amb <b>BitLocker</b>, tant al servidor com als clients.')],
      ['5.C1.1', 'RAID 5 amb Storage Spaces',
        D.p('Els servidors reals (Dell PowerEdge R450, punt 2.B2) porten controladora RAID de maquinari. La màquina virtual no en té, així que vam fer el RAID 5 amb <b>Storage Spaces</b>, l’emmagatzematge per programari de Windows Server: un grup de discos (<b>Pool-RAID</b>) amb tres discos de 5 GB i, a sobre, un disc virtual (<b>Disco-Datos</b>) amb distribució <b>Parity</b>. Parity és el RAID 5 de Storage Spaces: reparteix les dades i la paritat entre els tres discos, i si en falla un el volum continua funcionant. Sobre el disc virtual vam crear el volum <b>R: (Datos-RAID)</b>, on van les carpetes de l’empresa.') +
        D.w('raid') +
        D.chk('SRV-AD', 'Server Manager → File and Storage Services → Storage Pools', 'El grup Pool-RAID i el disc virtual Disco-Datos de 6 GB amb layout Parity i aprovisionament Fixed.', 125) +
        D.note('Després de reiniciar, el Server Manager de la màquina virtual només mostra un dels tres discos físics del grup (a la imatge anterior, VBOX HARDDISK). És un problema de visualització del Server Manager a VirtualBox; l’estat real dels discos el mirem des de PowerShell.', 'lim', 'Nota') +
        D.chk('SRV-AD (PowerShell)', 'Get-PhysicalDisk', 'Els quatre discos del servidor: el 0 de 50 GB, que és el del sistema, i els tres de 5 GB del RAID, tots amb OperationalStatus OK i HealthStatus Healthy.', 126, 'SRV-AD|Get-PhysicalDisk')],
      ['5.C1.2', 'Prova: fallada d’un disc',
        D.p('Amb el servidor encès vam treure un dels tres discos a VirtualBox, que és el que passaria si es trenqués. Fes el mateix a l’esquema de dalt: toca un disc.') +
        D.chk('SRV-AD', 'Server Manager → Storage Pools, amb un disc desconnectat', 'Pool-RAID, Disco-Datos i el disc físic surten amb l’avís groc: el RAID queda degradat, però no s’atura. Per tornar a la normalitat s’afegeix un disc nou al grup i es repara el disc virtual (Repair-VirtualDisk).', 127)],
      ['5.C1.3', 'Xifratge amb BitLocker',
        D.p('Tot el que és sensible es xifra amb BitLocker: el volum R: del servidor, on hi ha les dades de l’empresa, i el disc C: dels clients. Si algú s’endú un disc, sense la contrasenya o la clau de recuperació només hi troba dades xifrades.') +
        D.chk('SRV-AD', 'Explorador de fitxers → This PC', 'El volum Datos-RAID (R:) amb el cadenat de BitLocker. Surt obert perquè el servidor l’està fent servir.', 128) +
        D.p('En activar BitLocker, Windows genera una clau de recuperació. La vam exportar a un fitxer de text i la vam desar fora del disc xifrat. A la instal·lació real també es desa a l’objecte de l’equip a l’Active Directory, perquè TI la pugui recuperar si un usuari oblida la contrasenya.') +
        D.chk('SRV-AD', 'Explorador de fitxers → Desktop', 'El fitxer de la clau de recuperació del servidor («BitLocker Recovery Key ADD742A9-…»).', 129) +
        D.chk('Client Windows 11', 'Explorador → Volum de dades secundari (T:) → textos', 'La clau de recuperació del client («Clave de recuperación de BitLocker B18E…») desada en un volum diferent del xifrat.', 130) +
        D.p('Les màquines virtuals dels clients no tenen xip TPM, i BitLocker per defecte no es deixa activar sense. Per això la GPO-BitLocker activa l’opció «Permetre BitLocker sense un TPM compatible», que en lloc del TPM demana una contrasenya en arrencar. Ho vam provar en un client Windows 10.') +
        D.chk('Client Windows 10', 'Directives → Equip → Plantilles administratives → Components de Windows → Xifratge d’unitat BitLocker → Unitats del sistema operatiu → Requerir autenticació addicional en iniciar', 'La directiva Habilitada, amb la casella «Permetre BitLocker sense un TPM compatible» marcada.', 131) +
        D.chk('Client Windows 10 (cmd com a administrador)', 'gpupdate /force', 'Les directives d’equip i d’usuari actualitzades correctament, sense esperar el refresc automàtic.', 132, 'WIN10|gpupdate /force') +
        D.chk('Client Windows 10', 'Tauler de control → Sistema i seguretat → Xifratge d’unitat BitLocker', 'El xifratge activat a la unitat C:, que demana reiniciar per acabar.', 133) +
        D.chk('Client Windows 10', 'arrencada de l’equip', 'Abans de carregar Windows, BitLocker demana la contrasenya per desbloquejar la unitat.', 134) +
        D.chk('Client Windows 10 (cmd com a administrador)', 'manage-bde -status', 'El volum C: xifrat al 100 % amb XTS-AES 128, la protecció activada i els protectors de clau Contrasenya i Contrasenya numèrica, que és la clau de recuperació.', 135, 'WIN10|manage-bde -status')],
      ['5.C1.4', 'Prova: robatori del disc',
        D.p('Per simular un robatori, vam connectar el disc xifrat del client a una màquina amb Ubuntu i vam intentar obrir-lo des de l’explorador de fitxers. Fes tu de lladre:') +
        D.w('theft') +
        D.chk('Màquina Ubuntu', 'Fitxers → Altres ubicacions → volum del disc xifrat', '«No s’ha pogut accedir a la ubicació»: Ubuntu no reconeix cap sistema de fitxers (wrong fs type, bad superblock), perquè el contingut està xifrat. Sense la contrasenya no es pot llegir res.', 136)],
      ['5.C1.5', 'On desen els documents els usuaris',
        D.p('L’enunciat ens demana decidir on tenen els usuaris els documents de treball. La decisió és que <b>no es desen al PC, sinó al servidor</b>:') +
        D.ul(['La carpeta Documents de cada usuari es redirigeix a <code>\\\\SRV-AD\\Perfiles</code> amb la GPO-Redireccion-Docs.', 'Cada departament té la seva carpeta a <code>R:\\Departaments</code>, que els usuaris veuen com a unitat S: (GPO-Unidades-Mapeadas).']) +
        D.w('docflow') +
        D.p('Així els documents de l’empresa són sempre al volum R:, xifrat amb BitLocker i protegit pel RAID 5. Si es roba o es trenca un PC no es perd ni s’exposa cap document, i si un usuari canvia de lloc troba els seus documents igual.',
          'Cada carpeta de departament té l’herència desactivada i només hi té accés el grup del departament (Modificar), a més de SYSTEM, Administrators i CREATOR OWNER (Control total). La resta d’usuaris no hi pot entrar.') +
        D.chk('SRV-AD', 'R:\\Departaments\\Gestio → Propietats → Seguretat → Opcions avançades', 'Els permisos de la carpeta Gestio: Grupo-Gestio (LOGITRANS\\Grupo-Gestio) amb Modify, i CREATOR OWNER, SYSTEM i Administrators amb Full control, sense herència.', 137)]
    ]
  });

  LT.sec({
    id: '5.C2', t: 'Tallafoc local del SO i antivirus', short: 'Tallafoc local i antivirus',
    lead: 'A més de l’ASA perimetral, cada equip té el seu tallafoc, un antivirus amb anàlisi programada i uns registres que només pot llegir Gestió.',
    subs: [
      ['5.C2.0', 'Què fem servir',
        D.p('A més del tallafoc perimetral (ASA, punt 3.C3), cada equip té el seu tallafoc local i un antivirus que analitza el sistema de manera periòdica. Fem servir les eines de Windows: el <b>tallafoc de Windows Defender</b> i <b>Microsoft Defender Antivirus</b>.')],
      ['5.C2.1', 'Tallafoc local',
        D.p('El tallafoc està activat als tres perfils (Domini, Privat i Públic) amb la política de bloquejar per defecte: tot el que entra i no coincideix amb una regla es bloqueja. La configuració arriba per la <b>GPO-LogiTrans-Seguridad</b>, i per això Windows avisa que alguns paràmetres els controla la directiva de grup.') +
        D.w('fwlocal') +
        D.chk('SRV-AD', 'Windows Defender Firewall with Advanced Security', 'Domain, Private i Public amb «Windows Defender Firewall is on» i «Inbound connections that do not match a rule are blocked», i l’avís «some settings are controlled by Group Policy».', 138) +
        D.p('Al servidor només hi ha habilitades les regles d’entrada dels serveis que presta: DNS, compartició de fitxers (SMB, per a les carpetes dels departaments), els serveis bàsics de xarxa (Core Networking) i l’NPS (RADIUS). Windows crea aquestes regles en instal·lar cada rol; per això surten habilitades les de l’NPS: són les que necessita el servidor RADIUS per rebre les peticions dels equips de xarxa, i no n’hi ha cap més.') +
        D.chk('SRV-AD', 'Windows Defender Firewall → Inbound Rules', 'Les regles de DNS (UDP i RPC) i de File and Printer Sharing (SMB-In, ping i NetBIOS) habilitades.', 139) +
        D.chk('SRV-AD', 'Windows Defender Firewall → Inbound Rules (continuació)', 'A dalt, les regles Core Networking (DHCP, IPv6, ICMPv6 i Teredo); a sota, la regla Network Policy Server (RADIUS Authentication), totes habilitades.', 140) +
        D.p('Quan un port no cal, es tanca amb una regla de bloqueig. Ho vam fer durant l’auditoria amb dos ports que obria un programa del fabricant de la placa base (punt <a href="#/s/6.1">6.1.2</a>).')],
      ['5.C2.2', 'Antivirus amb anàlisi programada',
        D.p('L’antivirus és Microsoft Defender, que ja ve amb Windows i s’actualitza sol. L’anàlisi periòdica la fa la tasca <b>«Windows Defender Scheduled Scan»</b> del Programador de tasques, amb dos activadors: un cada dia a les 5:27 i un altre cada divendres a les 20:30.') +
        D.w('avsched') +
        D.chk('SRV-AD', 'Task Scheduler → Library → Microsoft → Windows → Windows Defender', 'La tasca Windows Defender Scheduled Scan en estat Ready i, a la pestanya Triggers, els activadors Daily a les 5:27 i Weekly els divendres a les 20:30.', 141)],
      ['5.C2.3', 'Registres de l’antivirus només per a Gestió',
        D.p('L’enunciat demana que els registres de les anàlisis només es puguin consultar des de la VLAN de Gestió. Els desem en una carpeta compartida del servidor (<code>\\\\SRV-AD\\Logs</code>) amb els permisos de compartició i NTFS només per a <b>Grupo-Gestio</b> (lectura), a més de SYSTEM i Administrators. Els comptes de Grupo-Gestio són els dels tècnics de xarxa, que treballen des del NOC de la planta 3 i la sala de gestió del magatzem, tots dos a la VLAN 99. Qualsevol altre usuari rep «Accés denegat».') +
        D.w('logs') +
        D.chk('SRV-AD', 'R:\\Logs-Defender → Propietats → Seguretat → Opcions avançades', 'Grupo-Gestio amb permís de lectura i execució (Read & execute), més SYSTEM, Administrators i CREATOR OWNER amb control total (Full control), sense permisos heretats (Inherited from: None).', 142)]
    ]
  });

  LT.sec({
    id: '5.D', t: 'Repositori de mitjans corporatius', short: 'Repositori i Jellyfin',
    lead: 'Programes, documents, manuals, imatges del sistema i vídeos. Tothom llegeix, només Gestió escriu, i els vídeos es veuen però no es descarreguen.',
    subs: [
      ['5.D.0', 'Què demana el client',
        D.p('El client vol un repositori amb el material de l’empresa (programes, documents, manuals, imatges del sistema i vídeos) i que els vídeos es puguin veure en streaming però no descarregar, perquè no surtin del servidor.')],
      ['5.D.1', 'Estructura i permisos',
        D.p('Vam crear el repositori amb un script de PowerShell (<code>repositorio-comun.ps1</code>) que fa tres coses: crea les carpetes, els aplica els permisos i comparteix la carpeta a la xarxa. Al laboratori el vam muntar a l’equip amfitrió (BYWAAKE) amb grups locals que es diuen igual que els de l’AD; a la instal·lació real va a SRV-HV02 amb els grups del domini.') +
        D.tbl(['Carpeta', 'Contingut'], [['Documentos', 'Documents corporatius: procediments, polítiques i plantilles.'], ['ImagenesSO', 'Imatges del sistema operatiu, les que fa servir FOG (punt 5.E).'], ['Manuales', 'Manuals d’ús, per exemple el d’accés al Wi-Fi i a la VPN.'], ['Software', 'Instal·ladors dels programes autoritzats.'], ['Videos', 'Vídeos de formació i presentacions, que es veuen per streaming amb Jellyfin.']], 'Taula 32. Carpetes del repositori.') +
        D.p('El criteri de permisos és senzill: <b>tothom pot llegir</b> (veure els manuals i fer servir els instal·ladors), però <b>només Grupo-Gestio pot modificar</b>. Així un usuari no pot esborrar res ni afegir programes no autoritzats.') +
        D.chk('Equip amfitrió (PowerShell)', 'powershell -ExecutionPolicy Bypass -File .\\repositorio-comun.ps1 -CrearUsuariosPrueba', 'Les cinc carpetes creades, els permisos de l’arrel (Grupo-Gestio Modificar (M), Usuaris lectura i execució (RX), SYSTEM i Administradors control total (F)) i el recurs compartit \\\\BYWAAKE\\Repositorio.', 143, 'Equipo anfitrión (PowerShell)|powershell -ExecutionPolicy Bypass -File .\\repositorio-comun.ps1 -CrearUsuariosPrueba') +
        D.chk('Equip amfitrió', 'Explorador de fitxers → C:\\Repositorio', 'Les carpetes Documentos, ImagenesSO, Manuales, Software i Videos.', 144) +
        D.chk('Equip amfitrió', 'Explorador de fitxers → C:\\Repositorio\\Software', 'A dalt, la carpeta Software del repositori amb VLC i 7-Zip; a sota, la carpeta del projecte d’on surt l’instal·lador de VLC (vlc-3.0.23-win64.exe). El 7-Zip és un accés directe perquè ja estava instal·lat a l’equip abans de muntar el repositori.', 145)],
      ['5.D.2', 'Prova de permisos',
        D.p('Obrim una consola amb l’usuari <code>operari.picking01</code>, del grup Magatzem, i intentem modificar el repositori. Prova-ho amb diferents usuaris:') +
        D.w('repo') +
        D.chk('Equip amfitrió', 'runas /user:BYWAAKE\\operari.picking01 powershell · del C:\\Repositorio\\Manuales\\Manual-de-acceso-Wi-Fi-y-VPN.pdf', 'whoami confirma que som operari.picking01, i l’esborrat falla amb «Acceso denegado a la ruta de acceso».', 146, 'Equipo anfitrión|runas /user:BYWAAKE\\operari.picking01 powershell · del C:\\Repositorio\\Manuales\\Manual-de-acceso-Wi-Fi-y-VPN.pdf') +
        D.chk('Equip amfitrió (sessió d’operari.picking01)', 'dir C:\\Repositorio\\Manuales\\Manual-de-acceso-Wi-Fi-y-VPN.pdf', 'El manual continua al seu lloc: l’usuari el pot veure i llegir, però no esborrar.', 147, 'Equipo anfitrión (sesión de operari.picking01)|dir C:\\Repositorio\\Manuales\\Manual-de-acceso-Wi-Fi-y-VPN.pdf') +
        D.chk('Equip amfitrió (sessió d’operari.picking01)', 'mkdir C:\\Repositorio\\Software\\prueba', '«Acceso denegado»: un usuari normal tampoc no pot afegir res a la carpeta de programari.', 148, 'Equipo anfitrión (sesión de operari.picking01)|mkdir C:\\Repositorio\\Software\\prueba')],
      ['5.D.3', 'Vídeos en streaming amb Jellyfin',
        D.p('Per als vídeos fem servir <b>Jellyfin</b>, un servidor multimèdia de codi obert que va al contenidor jellyfin (5.B1). Els vídeos estan organitzats en biblioteques (Administració, Magatzem, Direcció i Formació) i cada usuari només veu les seves. L’usuari d’exemple <code>alm1</code>, del magatzem, veu la biblioteca Magatzem i la de Formació, que és per a tot el personal.') +
        D.w('jelly') +
        D.chk('Navegador (usuari alm1)', 'Jellyfin → Inici', '«Mis contenidos» amb les biblioteques Almacén i Formación, i els vídeos recents de cadascuna: Manejo-de-carretillas, Seguridad-informatica i Bienvenida-nuevos-empleados.', 149) +
        D.chk('Navegador (usuari alm1)', 'reproducció de Bienvenida-nuevos-empleados', 'El vídeo es reprodueix per streaming dins del navegador.', 150) +
        D.chk('Navegador (usuari alm1)', 'reproductor → configuració', 'Les opcions del reproductor (relació d’aspecte, velocitat, qualitat, repetició i dades de reproducció): cap no permet descarregar el fitxer.', 151) +
        D.chk('Jellyfin (administrador)', 'Tauler de control → Usuaris → alm1', '«Permitir descargas de medios» desmarcat. A «Permitir borrar contenido desde» es veuen les quatre biblioteques sense marcar: l’usuari no pot esborrar cap vídeo.', 152) +
        D.p('Amb la descàrrega desactivada, l’usuari només rep el flux del vídeo mentre el mira; el fitxer no surt del servidor.')]
    ]
  });

  LT.sec({
    id: '5.E', t: 'Repositori de desplegament de programari', short: 'Desplegament amb FOG',
    lead: 'Si arriben deu equips nous, es posen a treballar en minuts: una imatge plantilla i arrencada per xarxa.',
    subs: [
      ['5.E.0', 'Com funciona',
        D.p('El client vol que, si arriben deu equips nous, es puguin posar a treballar de seguida amb una plantilla preparada. Ho fem amb <b>FOG Project</b>: preparem un equip mestre amb Windows i tot el que necessita, en capturem la imatge i la despleguem per xarxa (PXE) als equips nous.',
          'Al laboratori FOG corre en una màquina Ubuntu dins d’una xarxa interna aïllada (192.168.50.0/24), perquè fa de servidor d’arrencada per xarxa i no volíem que interferís amb les altres xarxes. A la instal·lació real va al taller IT de la planta 0 (punt 0.1), connectat a la VLAN 50.') +
        D.w('fog')],
      ['5.E.1', 'Tauler de FOG',
        D.chk('Navegador', 'http://192.168.50.1/fog/management', 'El tauler de FOG: el servidor web 192.168.50.1, el node d’emmagatzematge amb 30 GiB lliures i 7 GiB ocupats (la imatge capturada) i la gràfica d’imatges dels últims 30 dies, amb les tasques del 15 de novembre.', 153)],
      ['5.E.2', 'Imatge plantilla',
        D.p('L’equip mestre és un Windows 10 ja configurat. La seva imatge es diu <b>win10-base</b> i és la plantilla de tots els desplegaments.') +
        D.chk('Navegador', 'FOG → Image Management → All Images', 'La imatge win10-base (x86_64, sector 512n/512e), activada, protegida contra l’esborrat i capturada el 15/11/2026.', 154)],
      ['5.E.3', 'Equips i desplegament',
        D.p('Cada equip es registra a FOG per la seva adreça MAC. Després es llança la tasca: <b>Capture</b> a l’equip mestre per crear la imatge, i <b>Deploy</b> als equips nous, que arrenquen per xarxa i la restauren. Si arriben molts equips alhora, el botó <b>Multi-Cast</b> envia la imatge a tots de cop.') +
        D.chk('Navegador', 'FOG → Host Management → All Hosts', 'Els dos equips registrats: master-win, que és l’equip mestre, i pc-nuevo01, l’equip nou.', 155) +
        D.chk('Navegador', 'FOG → Task Management → Recent', 'Les dues tasques acabades (Complete): el Capture de master-win i el Deploy de win10-base a pc-nuevo01.', 156) +
        D.p('Quan acaba el Deploy, pc-nuevo01 arrenca amb el mateix Windows que l’equip mestre i ja es pot posar a treballar.')]
    ]
  });
})();
