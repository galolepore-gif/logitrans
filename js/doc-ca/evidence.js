/* Peus de les captures en català. Substitueix el text de LT.EVIDENCE quan la web és en català. */
(function () {
  var LT = window.LT;
  var RAW = `
6|Alçat|Racks de Barcelona: CPD R1 i els IDF de les plantes 1, 2 i 3
7|Alçat|Rack R1 de la sala de comunicacions de Saragossa i armari mural IDF-02
8|Alçat|Llegenda de colors de l’alçat
9|Packet Tracer|Vista lògica: les dues seus i, al mig, els quatre routers que simulen Internet
10|Packet Tracer|Vista física de la planta 0 de Barcelona amb el plànol de fons
11|Packet Tracer|Rack del CPD de Barcelona: routers, tallafoc, cores, servidors i patch panel
12|Packet Tracer|Vista física del magatzem de Saragossa amb l’enllaç de fibra a l’IDF-02
13|BCN-CORE1|show cdp neighbors: els quatre switches d’accés i el CORE2 pel Port-channel 1
14|BCN-CORE1|show ip interface brief: la SVI de cada VLAN amb la .2 en up/up
15|BCN-CORE1|show ip route: les xarxes de cada VLAN amb la seva màscara
16|ZGZ-CORE1|show ip route: les xarxes del magatzem amb la seva màscara
17|BCN-CORE1|show standby brief: CORE1 actiu amb prioritat 110 a totes les VLAN
18|SRV-HV01|Services, DHCP: els àmbits de les VLAN de Barcelona
19|P1-ADM-03|ipconfig: adreça de la VLAN 20 rebuda per DHCP
20|BCN-CORE1|show ipv6 interface brief
21|BCN-CORE1|show ipv6 route
22|P1-ADM-03|ipconfig amb la IPv6 global generada per SLAAC
23|P1-ADM-03|ping IPv6 al servidor SRV-HV01
24|ZGZ-MUE-01|ipconfig amb la IPv6 del magatzem
25|BCN-P1-ACC1|show vlan brief
26|ZGZ-ACC1|show vlan brief, amb la VLAN 30 de pas pels troncals
27|BCN-P1-ACC1|show interfaces trunk: nativa 999 i només les VLAN de la seu
28|BCN-P1-ACC1|show vtp status: mode Transparent
29|P1-ADM-03|ping dins de la VLAN 20
30|P1-ADM-03|ping entre VLAN al servidor 10.1.50.10 (TTL 127)
31|ZGZ-MUE-01|ping dins de la VLAN 30
32|P1-ADM-03|ping a SRV-ZGZ01 a través de la VPN (TTL 122)
33|ZGZ-DIR-01|ping al servidor de Barcelona en sentit contrari
34|BCN-RT1|show interfaces tunnel0: up/up, GRE/IP de 85.100.1.2 a 85.100.2.2
35|BCN-RT1|show crypto isakmp sa: fase 1 establerta (QM_IDLE, ACTIVE)
36|BCN-RT1|show crypto ipsec sa: el trànsit entre seus viatja xifrat
37|BCN-RT1|show crypto map: CMAP-VPN amb el transform-set TS-LOGITRANS
38|ZGZ-DIR-01|La web corporativa de Barcelona oberta des del magatzem
39|ISP-1|El Packet Tracer rebutja l’autenticació IPsec d’OSPFv3 (% Invalid input)
40|ISP-1|show ip ospf neighbor: veïns en FULL
41|ISP-1|show ip ospf interface Gi0/0/1: autenticació MD5 activa
42|ISP-1|show ipv6 ospf neighbor: OSPFv3 en FULL
43|ISP-1|show ip route ospf
44|BCN-RT1|show ip ospf neighbor: ZGZ-RT1 per Tunnel0 i BCN-RT2 per Gi0/0/2
45|BCN-RT1|show ip route: la xarxa de Saragossa apresa per OSPF com a O E2
46|BCN-RT1|show ipv6 ospf neighbor
47|P1-ADM-03|ping a PC-INTERNET (TTL 123)
48|BCN-RT1|show ip nat translations: la traducció estàtica de la web
49|BCN-RT1|show ip nat statistics
50|PC-INTERNET|La web corporativa vista des d’Internet
51|PC-INTERNET|nslookup www.logitrans.com resol a 85.100.1.18
52|PC-INTERNET|ping a una IP interna sense resposta
53|ISP-1|show ip route 10.1.50.10: «% Network not in table»
54|P1-ADM-03|FTP cap a Internet bloquejat pel tallafoc
55|BCN-FW|show access-list amb els comptadors de cada regla
56|BCN-P1-ACC1|show port-security
57|BCN-P1-ACC1|show port-security interface Fa0/2, el port amb telèfon
58|BCN-P1-ACC1|Configuració de Fa0/3 amb la MAC sticky
59|PC intrús|El ping a la porta d’enllaç no rep resposta
60|BCN-P1-ACC1|Missatges de la violació de Port Security a Fa0/3
61|BCN-P1-ACC1|show port-security interface Fa0/3 després de la violació
62|BCN-P1-ACC1|Fa0/3 en estat err-disabled
63|BCN-P1-ACC1|show ip dhcp snooping
64|BCN-P1-ACC1|show ip dhcp snooping binding
65|P1-ADM-03|ipconfig /renew: IP del servidor legítim
66|BCN-P1-ACC1|show spanning-tree interface Fa0/3 detail: PortFast actiu
67|BCN-P1-ACC1|Configuració de Fa0/3 amb PortFast i BPDU Guard
68|BCN-P1-ACC1|show spanning-tree vlan 20: Gi0/1 Root FWD i Gi0/2 Altn BLK
69|BCN-CORE1|show spanning-tree vlan 20: el CORE1 és l’arrel
70|BCN-CORE1|show etherchannel summary: Po1 en LACP
71|BCN-P1-ACC1|BPDU Guard apaga Fa0/3 en rebre una BPDU
72|BCN-P1-ACC1|Fa0/3 en err-disabled per BPDU Guard
73|BCN-P1-ACC1|Amb el troncal al CORE1 apagat, Gi0/2 passa a Root FWD
74|P1-ADM-03|ping al servidor amb el troncal principal apagat
75|P0-INV-01|Wireless0 connectat a LogiTrans-Invitados
76|P0-INV-01|ipconfig a la VLAN 40
77|P0-INV-01|ping a SRV-HV01 bloquejat
78|P0-INV-01|ping a SRV-ZGZ01 bloquejat
79|P0-INV-01|ping a Internet bloquejat
80|BCN-CORE1|show access-lists amb els comptadors d’ACL-INVITADOS-IN
81|BCN-CORE1|show running-config | include access-group|traffic-filter
82|P1-ADM-03|ping a la IP de gestió d’un switch bloquejat
83|P1-ADM-03|SSH al core rebutjat
84|P3-GES-01|SSH al core des del NOC
85|P3-GES-01|Telnet al core tancat sense demanar usuari
86|BCN-CORE1|show access-lists amb ACL-GESTION-OUT i ACL-VTY-GESTION
87|BCN-CORE1|show running-config | include access-group|access-class
88|ZGZ-MUE-01|ping a un equip de Direcció bloquejat
89|ZGZ-MUE-01|ping a SRV-ZGZ01 bloquejat
90|ZGZ-MUE-01|ping a SRV-HV01 bloquejat
91|ZGZ-MUE-01|ping a Internet bloquejat
92|ZGZ-MUE-01|La web corporativa carrega (HTTP permès)
93|ZGZ-CORE1|show access-lists amb els comptadors d’ACL-OPERARIOS-IN
94|ZGZ-CORE1|show running-config | include access-group
95|SRV-AD|Active Directory Users and Computers: una OU per departament
96|SRV-AD|Consola DHCP amb un àmbit per VLAN de les dues seus
97|SRV-AD|Reserva DHCP de la impressora d’etiquetes ZGZ-ETQ-02
98|SRV-AD|Zones directes: logitrans.local i logitrans.com
99|SRV-AD|Zones inverses de les xarxes internes
100|P3-GES-01|SSH a BCN-CORE1 amb l’usuari RADIUS admin.xarxa01
101|P3-GES-01|SSH a BCN-RT1 amb admin.xarxa01
102|P3-GES-01|SSH amb contrasenya incorrecta: «% Login invalid»
103|BCN-RT1|show running-config | section aaa
104|BCN-RT1|show ip ssh: SSH versió 2.0
105|SRV-HV01|Services, AAA: clients RADIUS i usuaris
106|SRV-AD|NPS: clients RADIUS donats d’alta
107|SRV-AD|NPS: directives del Wi-Fi i de l’accés als Cisco
108|Client Windows 11|Propietats del sistema: unit a logitrans.local
109|SRV-AD|Group Policy Management amb les vuit GPO
110|Client Windows 11|gpresult /r amb l’usuari del domini admin.rrhh
111|Equip amfitrió|docker compose up -d --wait: cinc contenidors Healthy
112|Equip amfitrió|docker compose ps: només nginx publica el 80 i el 443
113|Navegador|Portada de la web corporativa
114|Navegador|Accés al tauler d’administració de WordPress
115|WordPress|Instal·lació de la llicència Free de Wordfence
116|WordPress|Llicència de Wordfence activa
117|WordPress|Tauler del tallafoc de Wordfence activat
118|PC-INTERNET|La web per la IP pública 85.100.1.18
119|Navegador|Pàgina d’accés de l’àrea de clients
120|Navegador|Tauler del client Transportes Norte S.L.
121|Navegador|Llista d’enviaments d’un client
122|Navegador|Bloqueig temporal després de diversos intents fallits
123|Navegador|Error 404 en demanar l’enviament d’un altre client
124|Equip amfitrió|Registre de l’intent d’accés no autoritzat
125|SRV-AD|Storage Pools: Pool-RAID i el disc virtual Disco-Datos en Parity
126|SRV-AD|Get-PhysicalDisk: els tres discos del RAID en bon estat
127|SRV-AD|El RAID 5 degradat després de treure un disc
128|SRV-AD|El volum R: del RAID xifrat amb BitLocker
129|SRV-AD|Fitxer amb la clau de recuperació de BitLocker
130|Client Windows 11|Clau de recuperació desada en un altre volum
131|Client Windows 10|Directiva que permet BitLocker sense TPM
132|Client Windows 10|gpupdate /force
133|Client Windows 10|BitLocker activat a la unitat C:
134|Client Windows 10|BitLocker demana la contrasenya en arrencar
135|Client Windows 10|manage-bde -status: C: xifrada al 100 %
136|Màquina Ubuntu|El disc xifrat amb BitLocker no es pot muntar
137|SRV-AD|Permisos NTFS de la carpeta del departament Gestio
138|SRV-AD|Tallafoc de Windows Defender actiu als tres perfils
139|SRV-AD|Regles d’entrada de DNS i compartició de fitxers
140|SRV-AD|Regles d’entrada Core Networking i NPS (RADIUS)
141|SRV-AD|Anàlisi programada de Microsoft Defender
142|SRV-AD|Permisos de Logs-Defender: només Grupo-Gestio en lectura
143|Equip amfitrió|Script que crea el repositori, aplica permisos i el comparteix
144|Equip amfitrió|Carpetes del repositori
145|Equip amfitrió|Programes de la carpeta Software
146|Equip amfitrió|operari.picking01 no pot esborrar un manual
147|Equip amfitrió|El manual continua al repositori
148|Equip amfitrió|operari.picking01 no pot crear carpetes a Software
149|Jellyfin|Biblioteques i vídeos de l’usuari del magatzem
150|Jellyfin|Reproducció en streaming d’un vídeo de formació
151|Jellyfin|Opcions del reproductor sense descàrrega
152|Jellyfin|Permisos de l’usuari alm1: sense descàrregues ni esborrat
153|FOG|Tauler del servidor de desplegament
154|FOG|Image Management amb la plantilla win10-base
155|FOG|Host Management amb l’equip mestre i l’equip nou
156|FOG|Tasques de captura i desplegament completades
157|Equip d’auditoria|Resultat de l’escaneig amb Nmap
158|Equip d’auditoria|Procés que obre cada port desconegut
159|Equip d’auditoria|Regla del tallafoc que bloqueja l’1042 i el 7778
160|PC-INTERNET|ping a una IP interna i a la IP pública de la web
161|BCN-FW|Comptadors de les ACL abans i després de les proves des d’Internet
162|BCN-RT1|Traducció NAT d’una connexió web des d’Internet
163|Equip d’auditoria|WPScan sense token d’API
164|Equip d’auditoria|Comanda de WPScan amb token d’API
165|Equip d’auditoria|Resultat de WPScan amb la base de vulnerabilitats
166|BCN-P0-ACC1|Port Security a tots els ports d’usuari de la planta 0
167|BCN-P0-ACC1|Fa0/6 apagat per un equip no autoritzat
168|BCN-P0-ACC1|DHCP snooping i taula de bindings
169|BCN-RT1|La VPN IPsec amb el trànsit entre seus xifrat
`;
  RAW.trim().split('\n').forEach(function (l) {
    var p = l.split('|'), n = +p[0], e = LT.EVIDENCE[n];
    if (e) { e.dev = p[1]; e.txt = p.slice(2).join('|'); }
  });
})();
