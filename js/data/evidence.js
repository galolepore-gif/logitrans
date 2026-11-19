/* Capturas reales de la memoria (Imatge N), con su pie traducido.
   Formato: número | equipo | qué muestra. El archivo es assets/capturas/ev-NNN.webp */
window.LT = window.LT || {};
LT.EVIDENCE_RAW = `
6|Alzado|Racks de Barcelona: CPD R1 y los IDF de las plantas 1, 2 y 3
7|Alzado|Rack R1 del cuarto de comunicaciones de Zaragoza y armario mural IDF-02
8|Alzado|Leyenda de colores del alzado
9|Packet Tracer|Vista lógica: las dos sedes y, en el medio, los cuatro routers que simulan Internet
10|Packet Tracer|Vista física de la planta 0 de Barcelona con el plano de fondo
11|Packet Tracer|Rack del CPD de Barcelona: routers, firewall, cores, servidores y patch panel
12|Packet Tracer|Vista física del almacén de Zaragoza con el enlace de fibra al IDF-02
13|BCN-CORE1|show cdp neighbors: los cuatro switches de acceso y el CORE2 por el Port-channel 1
14|BCN-CORE1|show ip interface brief: la SVI de cada VLAN con la .2 en up/up
15|BCN-CORE1|show ip route: las redes de cada VLAN con su máscara
16|ZGZ-CORE1|show ip route: las redes del almacén con su máscara
17|BCN-CORE1|show standby brief: CORE1 activo con prioridad 110 en todas las VLAN
18|SRV-HV01|Services, DHCP: los ámbitos de las VLAN de Barcelona
19|P1-ADM-03|ipconfig: dirección de la VLAN 20 recibida por DHCP
20|BCN-CORE1|show ipv6 interface brief
21|BCN-CORE1|show ipv6 route
22|P1-ADM-03|ipconfig con la IPv6 global generada por SLAAC
23|P1-ADM-03|ping IPv6 al servidor SRV-HV01
24|ZGZ-MUE-01|ipconfig con la IPv6 del almacén
25|BCN-P1-ACC1|show vlan brief
26|ZGZ-ACC1|show vlan brief, con la VLAN 30 de paso por los troncales
27|BCN-P1-ACC1|show interfaces trunk: nativa 999 y solo las VLAN de la sede
28|BCN-P1-ACC1|show vtp status: modo Transparent
29|P1-ADM-03|ping dentro de la VLAN 20
30|P1-ADM-03|ping entre VLAN al servidor 10.1.50.10 (TTL 127)
31|ZGZ-MUE-01|ping dentro de la VLAN 30
32|P1-ADM-03|ping a SRV-ZGZ01 a través de la VPN (TTL 122)
33|ZGZ-DIR-01|ping al servidor de Barcelona en sentido contrario
34|BCN-RT1|show interfaces tunnel0: up/up, GRE/IP de 85.100.1.2 a 85.100.2.2
35|BCN-RT1|show crypto isakmp sa: fase 1 establecida (QM_IDLE, ACTIVE)
36|BCN-RT1|show crypto ipsec sa: el tráfico entre sedes viaja cifrado
37|BCN-RT1|show crypto map: CMAP-VPN con el transform-set TS-LOGITRANS
38|ZGZ-DIR-01|La web corporativa de Barcelona abierta desde el almacén
39|ISP-1|Packet Tracer rechaza la autenticación IPsec de OSPFv3 (% Invalid input)
40|ISP-1|show ip ospf neighbor: vecinos en FULL
41|ISP-1|show ip ospf interface Gi0/0/1: autenticación MD5 activa
42|ISP-1|show ipv6 ospf neighbor: OSPFv3 en FULL
43|ISP-1|show ip route ospf
44|BCN-RT1|show ip ospf neighbor: ZGZ-RT1 por Tunnel0 y BCN-RT2 por Gi0/0/2
45|BCN-RT1|show ip route: la red de Zaragoza aprendida por OSPF como O E2
46|BCN-RT1|show ipv6 ospf neighbor
47|P1-ADM-03|ping a PC-INTERNET (TTL 123)
48|BCN-RT1|show ip nat translations: la traducción estática de la web
49|BCN-RT1|show ip nat statistics
50|PC-INTERNET|La web corporativa vista desde Internet
51|PC-INTERNET|nslookup www.logitrans.com resuelve a 85.100.1.18
52|PC-INTERNET|ping a una IP interna sin respuesta
53|ISP-1|show ip route 10.1.50.10: «% Network not in table»
54|P1-ADM-03|FTP hacia Internet bloqueado por el firewall
55|BCN-FW|show access-list con los contadores de cada regla
56|BCN-P1-ACC1|show port-security
57|BCN-P1-ACC1|show port-security interface Fa0/2, el puerto con teléfono
58|BCN-P1-ACC1|Configuración de Fa0/3 con la MAC sticky
59|PC intruso|El ping a la puerta de enlace no recibe respuesta
60|BCN-P1-ACC1|Mensajes de la violación de Port Security en Fa0/3
61|BCN-P1-ACC1|show port-security interface Fa0/3 después de la violación
62|BCN-P1-ACC1|Fa0/3 en estado err-disabled
63|BCN-P1-ACC1|show ip dhcp snooping
64|BCN-P1-ACC1|show ip dhcp snooping binding
65|P1-ADM-03|ipconfig /renew: IP del servidor legítimo
66|BCN-P1-ACC1|show spanning-tree interface Fa0/3 detail: PortFast activo
67|BCN-P1-ACC1|Configuración de Fa0/3 con PortFast y BPDU Guard
68|BCN-P1-ACC1|show spanning-tree vlan 20: Gi0/1 Root FWD y Gi0/2 Altn BLK
69|BCN-CORE1|show spanning-tree vlan 20: el CORE1 es la raíz
70|BCN-CORE1|show etherchannel summary: Po1 en LACP
71|BCN-P1-ACC1|BPDU Guard apaga Fa0/3 al recibir una BPDU
72|BCN-P1-ACC1|Fa0/3 en err-disabled por BPDU Guard
73|BCN-P1-ACC1|Con el troncal al CORE1 apagado, Gi0/2 pasa a Root FWD
74|P1-ADM-03|ping al servidor con el troncal principal apagado
75|P0-INV-01|Wireless0 conectado a LogiTrans-Invitados
76|P0-INV-01|ipconfig en la VLAN 40
77|P0-INV-01|ping a SRV-HV01 bloqueado
78|P0-INV-01|ping a SRV-ZGZ01 bloqueado
79|P0-INV-01|ping a Internet bloqueado
80|BCN-CORE1|show access-lists con los contadores de ACL-INVITADOS-IN
81|BCN-CORE1|show running-config | include access-group|traffic-filter
82|P1-ADM-03|ping a la IP de gestión de un switch bloqueado
83|P1-ADM-03|SSH al core rechazado
84|P3-GES-01|SSH al core desde el NOC
85|P3-GES-01|Telnet al core cerrado sin pedir usuario
86|BCN-CORE1|show access-lists con ACL-GESTION-OUT y ACL-VTY-GESTION
87|BCN-CORE1|show running-config | include access-group|access-class
88|ZGZ-MUE-01|ping a un equipo de Dirección bloqueado
89|ZGZ-MUE-01|ping a SRV-ZGZ01 bloqueado
90|ZGZ-MUE-01|ping a SRV-HV01 bloqueado
91|ZGZ-MUE-01|ping a Internet bloqueado
92|ZGZ-MUE-01|La web corporativa carga (HTTP permitido)
93|ZGZ-CORE1|show access-lists con los contadores de ACL-OPERARIOS-IN
94|ZGZ-CORE1|show running-config | include access-group
95|SRV-AD|Active Directory Users and Computers: una OU por departamento
96|SRV-AD|Consola DHCP con un ámbito por VLAN de las dos sedes
97|SRV-AD|Reserva DHCP de la impresora de etiquetas ZGZ-ETQ-02
98|SRV-AD|Zonas directas: logitrans.local y logitrans.com
99|SRV-AD|Zonas inversas de las redes internas
100|P3-GES-01|SSH a BCN-CORE1 con el usuario RADIUS admin.xarxa01
101|P3-GES-01|SSH a BCN-RT1 con admin.xarxa01
102|P3-GES-01|SSH con contraseña incorrecta: «% Login invalid»
103|BCN-RT1|show running-config | section aaa
104|BCN-RT1|show ip ssh: SSH versión 2.0
105|SRV-HV01|Services, AAA: clientes RADIUS y usuarios
106|SRV-AD|NPS: clientes RADIUS dados de alta
107|SRV-AD|NPS: directivas del Wi-Fi y del acceso a los Cisco
108|Cliente Windows 11|Propiedades del sistema: unido a logitrans.local
109|SRV-AD|Group Policy Management con las ocho GPO
110|Cliente Windows 11|gpresult /r con el usuario del dominio admin.rrhh
111|Equipo anfitrión|docker compose up -d --wait: cinco contenedores Healthy
112|Equipo anfitrión|docker compose ps: solo nginx publica 80 y 443
113|Navegador|Portada de la web corporativa
114|Navegador|Acceso al panel de administración de WordPress
115|WordPress|Instalación de la licencia Free de Wordfence
116|WordPress|Licencia de Wordfence activa
117|WordPress|Panel del firewall de Wordfence activado
118|PC-INTERNET|La web por la IP pública 85.100.1.18
119|Navegador|Página de acceso del área de clientes
120|Navegador|Panel del cliente Transportes Norte S.L.
121|Navegador|Lista de envíos de un cliente
122|Navegador|Bloqueo temporal tras varios intentos fallidos
123|Navegador|Error 404 al pedir el envío de otro cliente
124|Equipo anfitrión|Registro del intento de acceso no autorizado
125|SRV-AD|Storage Pools: Pool-RAID y el disco virtual Disco-Datos en Parity
126|SRV-AD|Get-PhysicalDisk: los tres discos del RAID en buen estado
127|SRV-AD|El RAID 5 degradado después de quitar un disco
128|SRV-AD|El volumen R: del RAID cifrado con BitLocker
129|SRV-AD|Archivo con la clave de recuperación de BitLocker
130|Cliente Windows 11|Clave de recuperación guardada en otro volumen
131|Cliente Windows 10|Directiva que permite BitLocker sin TPM
132|Cliente Windows 10|gpupdate /force
133|Cliente Windows 10|BitLocker activado en la unidad C:
134|Cliente Windows 10|BitLocker pide la contraseña al arrancar
135|Cliente Windows 10|manage-bde -status: C: cifrada al 100 %
136|Máquina Ubuntu|El disco cifrado con BitLocker no se puede montar
137|SRV-AD|Permisos NTFS de la carpeta del departamento Gestio
138|SRV-AD|Firewall de Windows Defender activo en los tres perfiles
139|SRV-AD|Reglas de entrada de DNS y compartición de archivos
140|SRV-AD|Reglas de entrada Core Networking y NPS (RADIUS)
141|SRV-AD|Análisis programado de Microsoft Defender
142|SRV-AD|Permisos de Logs-Defender: solo Grupo-Gestio en lectura
143|Equipo anfitrión|Script que crea el repositorio, aplica permisos y lo comparte
144|Equipo anfitrión|Carpetas del repositorio
145|Equipo anfitrión|Programas de la carpeta Software
146|Equipo anfitrión|operari.picking01 no puede borrar un manual
147|Equipo anfitrión|El manual sigue en el repositorio
148|Equipo anfitrión|operari.picking01 no puede crear carpetas en Software
149|Jellyfin|Bibliotecas y vídeos del usuario del almacén
150|Jellyfin|Reproducción en streaming de un vídeo de formación
151|Jellyfin|Opciones del reproductor sin descarga
152|Jellyfin|Permisos del usuario alm1: sin descargas ni borrado
153|FOG|Panel del servidor de despliegue
154|FOG|Image Management con la plantilla win10-base
155|FOG|Host Management con el equipo maestro y el equipo nuevo
156|FOG|Tareas de captura y despliegue completadas
157|Equipo de auditoría|Resultado del escaneo con Nmap
158|Equipo de auditoría|Proceso que abre cada puerto desconocido
159|Equipo de auditoría|Regla del firewall que bloquea 1042 y 7778
160|PC-INTERNET|ping a una IP interna y a la IP pública de la web
161|BCN-FW|Contadores de las ACL antes y después de las pruebas desde Internet
162|BCN-RT1|Traducción NAT de una conexión web desde Internet
163|Equipo de auditoría|WPScan sin token de API
164|Equipo de auditoría|Comando de WPScan con token de API
165|Equipo de auditoría|Resultado de WPScan con la base de vulnerabilidades
166|BCN-P0-ACC1|Port Security en todos los puertos de usuario de la planta 0
167|BCN-P0-ACC1|Fa0/6 apagado por un equipo no autorizado
168|BCN-P0-ACC1|DHCP snooping y tabla de bindings
169|BCN-RT1|La VPN IPsec con el tráfico entre sedes cifrado
`;
LT.EVIDENCE = {};
LT.EVIDENCE_RAW.trim().split('\n').forEach(function (l) {
  var p = l.split('|');
  var n = +p[0];
  LT.EVIDENCE[n] = { n: n, dev: p[1], txt: p[2], src: 'assets/capturas/ev-' + String(n).padStart(3, '0') + '.webp' };
});
/* Grupos de evidencias por capítulo */
LT.EVIDENCE_GROUPS = {
  rack: [6, 7, 8, 11],
  pt: [9, 10, 11, 12, 13],
  ipv4: [14, 15, 16, 17, 18, 19],
  ipv6: [20, 21, 22, 23, 24],
  vlan: [25, 26, 27, 28, 29, 30, 31],
  vpn: [32, 33, 34, 35, 36, 37, 38, 169],
  ospf: [39, 40, 41, 42, 43, 44, 45, 46],
  nat: [47, 48, 49, 50, 51, 52, 53, 54, 55],
  l2: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 166, 167, 168],
  acl: [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94],
  ad: [95, 96, 97, 98, 99, 108, 109, 110],
  radius: [100, 101, 102, 103, 104, 105, 106, 107],
  web: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124],
  storage: [125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137],
  fwav: [138, 139, 140, 141, 142],
  repo: [143, 144, 145, 146, 147, 148, 149, 150, 151, 152],
  fog: [153, 154, 155, 156],
  audit: [157, 158, 159, 160, 161, 162, 163, 164, 165]
};
