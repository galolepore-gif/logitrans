/* Punt 6 de la memòria en català: auditoria i mitigació */
(function () {
  var LT = window.LT, D = LT.D;
  var tr = function (s) { return LT.tr(s); };

  LT.sec({
    id: '6.1', t: 'Escaneig de ports amb Nmap', short: 'Escaneig amb Nmap',
    lead: 'Cada port obert és una porta d’entrada. Comencem l’auditoria comptant-les.',
    sc: ['expo', 'Repeteix la mirada des d’Internet: des de PC-INTERNET només s’ha d’arribar a la web.'],
    subs: [
      ['6.1.1', 'Resultat de l’escaneig',
        D.p('Comencem l’auditoria mirant quins ports té oberts el servidor de la web, perquè cada port obert és una porta d’entrada. Fem un escaneig amb Nmap amb detecció de serveis i versions (<code>-sV</code>) contra l’equip que allotja la web al laboratori. Llança’l:') +
        D.w('nmap') +
        D.chk('Equip d’auditoria', 'nmap -sV <IP del servidor web>', '994 ports tancats i sis d’oberts: 80 i 443 (nginx), 135 (RPC de Windows), 445 (SMB) i dos de desconeguts, l’1042 i el 7778.', 157, 'Equipo de auditoría|nmap -sV <IP del servidor web>') +
        D.tbl(['Port', 'Servei', 'Cal?', 'Què fem'], [
          ['80/tcp', 'HTTP (nginx)', 'Sí, és la web', 'Es manté. És el que publica el NAT (3.C3).'],
          ['443/tcp', 'HTTPS (nginx)', 'Sí, és la web', 'Es manté.'],
          ['135/tcp', 'RPC de Windows', 'No per a la web', 'És un servei de l’amfitrió Windows del laboratori. Des d’Internet no s’hi arriba, perquè l’ASA només deixa entrar el 80 i el 443 cap al servidor web.'],
          ['445/tcp', 'SMB de Windows', 'No per a la web', 'Igual que el 135.'],
          ['1042/tcp', 'Desconegut (afrog?)', 'No', 'Identifiquem el procés i el bloquegem (6.1.2).'],
          ['7778/tcp', 'Desconegut (interwise?)', 'No', 'Igual que l’1042.']
        ], 'Taula 33. Ports oberts i decisió.', { mono: [0] })],
      ['6.1.2', 'Identificació i bloqueig dels ports desconeguts',
        D.chk('Equip d’auditoria (PowerShell)', 'Get-NetTCPConnection -LocalPort 1042,7778 -State Listen · Get-Process -Id <PID>', 'El port 7778 és d’ArmouryCrateControlInterface i l’1042 d’asus_framework: dos programes del fabricant de la placa base (ASUS), que no tenen res a veure amb la web.', 158, 'HOST|Get-NetTCPConnection -LocalPort 1042,7778 -State Listen') +
        D.chk('Equip d’auditoria (PowerShell com a administrador)', 'New-NetFirewallRule -DisplayName "LogiTrans-bloqueo-ASUS" -Direction Inbound -Protocol TCP -LocalPort 1042,7778 -Action Block', 'La regla LogiTrans-bloqueo-ASUS creada: Enabled True, Direction Inbound i Action Block.', 159, 'HOST|New-NetFirewallRule -DisplayName "LogiTrans-bloqueo-ASUS" -Direction Inbound -Protocol TCP -LocalPort 1042,7778 -Action Block')],
      ['6.1.3', 'Exposició des d’Internet (Packet Tracer)',
        D.p('Al Packet Tracer repetim la mirada des de fora: des de PC-INTERNET només s’ha de poder arribar a la web publicada. ' + D.sc('expo')) +
        D.chk('PC-INTERNET', 'ping 10.1.20.10 · ping 85.100.1.18', 'L’adreça interna 10.1.20.10 no és accessible (Destination host unreachable) i la IP pública de la web no respon al ping (Request timed out), perquè l’ASA només deixa entrar HTTP i HTTPS cap al servidor web.', 160, 'PC-INTERNET|ping 85.100.1.18') +
        D.chk('BCN-FW', 'show access-list, abans i després de navegar des de PC-INTERNET', 'Dues sortides seguides. A la segona, la regla 6 d’OUTSIDE_IN (permit tcp any host 10.1.50.12 eq www) passa de 0 a 7 coincidències i la regla 10 (deny ip any any) de 0 a 4. Només ha entrat el trànsit web; la resta l’ha aturat el deny final.', 161, 'BCN-FW|show access-list') +
        D.chk('BCN-RT1', 'show ip nat translations', 'Una connexió des d’Internet: PC-INTERNET (203.0.113.10:1025) contra 85.100.1.18:80, traduïda a 10.1.50.12:80, a més de la traducció estàtica de la web.', 162, 'BCN-RT1|show ip nat translations @web')]
    ]
  });

  LT.sec({
    id: '6.2', t: 'Anàlisi de vulnerabilitats (WPScan)', short: 'Vulnerabilitats (WPScan)',
    lead: 'L’escàner específic de WordPress, dues vegades: sense token i amb la base de dades de vulnerabilitats.',
    subs: [
      ['6.2.0', 'Què és WPScan',
        D.p('WPScan és l’escàner de vulnerabilitats específic de WordPress: detecta la versió, el tema, els plugins i els usuaris, i els compara amb la base de dades de vulnerabilitats de WPScan. Per consultar aquesta base de dades cal un token d’API gratuït. El passem dues vegades, sense token i amb token.') + D.w('wpscan')],
      ['6.2.1', 'Primera passada, sense token',
        D.chk('Equip d’auditoria', 'wpscan --url https://logitrans.com', 'Detecta el tema propi logitrans (versió 2.0), no troba cap usuari («No Users Found») i avisa que, sense token, no pot mostrar les dades de vulnerabilitats. 1.725 peticions en 11 segons.', 163, 'Equipo de auditoría|wpscan --url https://logitrans.com')],
      ['6.2.2', 'Segona passada, amb token',
        D.chk('Equip d’auditoria', 'wpscan --url https://logitrans.com --disable-tls-checks --no-update --enumerate vp,vt,u --plugins-detection passive --format cli-no-color --api-token [OCULT]', 'La comanda completa, amb el token ocult, i la URL analitzada.', 164, 'Equipo de auditoría|wpscan --url https://logitrans.com --disable-tls-checks --no-update --enumerate vp,vt,u --plugins-detection passive --format cli-no-color --api-token [OCULTO]') +
        D.chk('Equip d’auditoria', 'resultat de la segona passada', '«No plugins Found» (cap plugin vulnerable), «No themes Found» (cap tema vulnerable), «No Users Found», la consulta a la base de dades amb el pla gratuït («WPScan DB API OK») i 1.980 peticions en 14 segons.', 165)],
      ['6.2.3', 'Interpretació',
        D.ul(['No hi ha cap plugin ni tema amb vulnerabilitats conegudes.', 'No es poden enumerar els usuaris, així que un atacant no sap quin nom d’usuari atacar. A més, la força bruta la bloqueja Wordfence (5.B1.3).', 'El tema propi es detecta, cosa normal perquè surt al codi de la pàgina, i no té vulnerabilitats registrades.', 'Fem servir <code>--disable-tls-checks</code> perquè al laboratori el certificat HTTPS és autosignat. En producció la web tindrà un certificat vàlid, per exemple de Let\'s Encrypt.', 'L’adreça que surt al resultat (192.168.65.254) és la de l’amfitrió de Docker al laboratori, no la del disseny.'])]
    ]
  });

  LT.sec({
    id: '6.3', t: 'Documentació de mitigació (OWASP i C2/C3)', short: 'Mitigació (OWASP, C2, C3)',
    lead: 'El que va trobar l’auditoria, què vam fer amb cada cosa i com està protegida la infraestructura davant l’OWASP Top 10 i els atacs de capa 2 i 3.',
    sc: ['l2check', 'Repeteix les proves de capa 2 en un altre switch (BCN-P0-ACC1) i comprova el xifratge de la VPN.'],
    subs: [
      ['6.3.1', 'Troballes de l’auditoria i mesures aplicades',
        D.p('Aquest punt tanca l’auditoria. Recull el que van trobar les proves dels punts 6.1 i 6.2 i què vam fer, i després explica com està protegida la infraestructura davant l’OWASP Top 10 i davant els atacs més habituals de capa 2 i de capa 3.') +
        D.tbl(['Troballa', 'Risc', 'Mesura', 'Estat'], [
          ['Ports 1042 i 7778 oberts per programari d’ASUS', 'Mitjà: serveis innecessaris escoltant', 'Regla de tallafoc LogiTrans-bloqueo-ASUS (6.1.2)', '<span class="chip ok">Aplicat</span> Falta la captura del segon escaneig.'],
          ['Ports 135 i 445 oberts a l’amfitrió', 'Baix: des d’Internet no s’hi arriba', 'L’ASA només deixa entrar el 80 i el 443 cap a 10.1.50.12 (3.C3)', '<span class="chip ok">Comprovat</span> Des de fora només s’arriba a la web (6.1.3).'],
          ['Wordfence en versió Free: regles amb 30 dies de retard i WAF en mode bàsic', 'Mitjà', 'Força bruta al 100 %. En producció, protecció ampliada i versió Premium', '<span class="chip warn">Millora</span> Per a la posada en producció.'],
          ['Certificat HTTPS autosignat', 'Baix', 'Certificat vàlid en producció', '<span class="chip warn">Millora</span> Per a la posada en producció.'],
          ['WPScan: sense vulnerabilitats ni usuaris enumerables', '—', 'Mantenir WordPress i les imatges actualitzats', '<span class="chip ok">Correcte</span>'],
          ['Convidats amb sortida a tot Internet (versió anterior de l’ACL)', 'Mitjà', 'ACL-INVITADOS-IN reduïda a DHCP, DNS, HTTP i HTTPS (4.B1)', '<span class="chip ok">Aplicat</span>'],
          ['Operaris amb accés a tota la VLAN de servidors (versió anterior de l’ACL)', 'Mitjà', 'ACL-OPERARIOS-IN reduïda a DHCP, DNS, base de dades i web (4.B3)', '<span class="chip ok">Aplicat</span>']
        ], 'Taula 34. Troballes de l’auditoria i mitigació.')],
      ['6.3.2', 'Protecció davant l’OWASP Top 10',
        D.p('L’OWASP Top 10 (versió 2021) és la llista dels deu riscos més importants de les aplicacions web. Així protegim el WordPress i l’àrea de clients. Gira cada carta:') +
        D.w('owasp') +
        D.tbl(['Risc', 'Com el protegim', 'Punt'], LT.OWASP.map(function (o) { return ['<b>' + o[0] + '</b> · ' + tr(o[1]), tr(o[2]), o[3]]; }), 'Taula 35. Protecció del WordPress i de l’àrea de clients davant l’OWASP Top 10.')],
      ['6.3.3', 'Protecció davant els atacs de capa 2',
        D.p('Tria un atac i llança’l contra el switch d’accés. Cadascun mostra com l’atura la xarxa i en quin punt està configurat.') +
        D.w('attacks', { layer: 2 }) +
        D.tbl(['Atac', 'En què consisteix', 'Com l’aturem', 'Punt'], LT.ATTACKS.filter(function (a) { return a.layer === 2; }).map(function (a) { return ['<b>' + tr(a.name) + '</b>', tr(a.how), tr(a.defHow), a.ref]; }), 'Taula 36. Protecció davant els atacs de capa 2.')],
      ['6.3.4', 'Protecció davant els atacs de capa 3',
        D.w('attacks', { layer: 3 }) +
        D.tbl(['Atac', 'En què consisteix', 'Com l’aturem', 'Punt'], LT.ATTACKS.filter(function (a) { return a.layer === 3; }).map(function (a) { return ['<b>' + tr(a.name) + '</b>', tr(a.how), tr(a.defHow), a.ref]; }), 'Taula 37. Protecció davant els atacs de capa 3.')],
      ['6.3.5', 'Verificació de les mesures de xarxa',
        D.p('Per tancar l’auditoria vam tornar a provar al Packet Tracer les mesures de capa 2 en un switch diferent del de les proves del bloc 4 (BCN-P0-ACC1), i el xifratge de la VPN entre seus.') +
        D.chk('BCN-P0-ACC1', 'show port-security · show port-security interface fa0/6', 'A dalt, Fa0/1 (punt d’accés) amb màxim 64 i Restrict, i Fa0/5, Fa0/6 i Fa0/7 amb màxim 1 i Shutdown. A sota, Fa0/6 en Secure-up amb la MAC sticky 0030.BB2E.0743.', 166, 'BCN-P0-ACC1|show port-security') +
        D.chk('BCN-P0-ACC1', 'show port-security interface fa0/6, després de connectar un altre equip', 'Secure-shutdown, Security Violation Count 1 i la MAC de l’equip nou (0030.BB2E.0742).', 167, 'BCN-P0-ACC1|show port-security interface fa0/6 @viol') +
        D.chk('BCN-P0-ACC1', 'show ip dhcp snooping · show ip dhcp snooping binding', 'A dalt, DHCP snooping a les VLAN 10, 20, 40 i 99, els troncals Gi0/1 i Gi0/2 de confiança i els ports d’usuari amb límit de 10. A sota, la taula de bindings amb tres equips, cadascun amb la seva MAC, IP, VLAN i port.', 168, 'BCN-P0-ACC1|show ip dhcp snooping binding') +
        D.chk('BCN-RT1', 'show crypto isakmp sa · show crypto ipsec sa', 'La VPN amb ZGZ-RT1 activa (QM_IDLE i ACTIVE) i els paquets entre seus xifrats i desxifrats (#pkts encrypt 91 i #pkts decrypt 89).', 169, 'BCN-RT1|show crypto ipsec sa') +
        D.note('Amb aquestes proves l’auditoria queda tancada: des d’Internet només s’arriba a la web, els serveis del servidor web no tenen vulnerabilitats conegudes, els ports innecessaris s’han tancat i les mesures de capa 2 i capa 3 funcionen tant als switches de les proves com a la resta.', 'fix', 'Conclusió')]
    ]
  });
})();
