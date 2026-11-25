/* =========================================================
   LOGITRANS · datos del proyecto
   Todo sale de la memoria final (LogiTrans.docx), del presupuesto
   y del Packet Tracer v5. Un solo sitio para no duplicar nada.
   ========================================================= */
window.LT = window.LT || {};

LT.VLANS = [
  { id: 10, name: 'Direcció', es: 'Dirección', color: '--v10', hosts: 50, plus: 60, access: 'Cable', where: 'Dos sedes',
    purpose: 'Equipo directivo y gerencia', rule: 'Llega a todas las VLAN menos Gestió.' },
  { id: 20, name: 'Administració', es: 'Administración', color: '--v20', hosts: 80, plus: 96, access: 'Cable', where: 'Dos sedes',
    purpose: 'Administración, RRHH, contabilidad, finanzas, tráfico y operaciones', rule: 'Servidores internos e Internet. Sin acceso a Gestió.' },
  { id: 30, name: 'Magatzem', es: 'Almacén', color: '--v30', hosts: 80, plus: 96, access: 'Cable', where: 'Solo Zaragoza',
    purpose: 'Operarios: picking, recepción y expedición', rule: 'ACL estricta: solo DHCP, DNS, base de datos (3306) y web (80/443).' },
  { id: 40, name: 'Convidats', es: 'Invitados', color: '--v40', hosts: 120, plus: 144, access: 'Solo Wi-Fi', where: 'Dos sedes',
    purpose: 'Visitas, proveedores y personal externo', rule: 'Aislada: solo DHCP, DNS, HTTP y HTTPS hacia Internet.' },
  { id: 50, name: 'Servidors', es: 'Servidores', color: '--v50', hosts: 70, plus: 84, access: 'Cable', where: 'Dos sedes',
    purpose: 'AD, DHCP, DNS, web, RADIUS, FOG, streaming', rule: 'Desde Internet solo se llega a la web publicada.' },
  { id: 99, name: 'Gestió', es: 'Gestión', color: '--v99', hosts: 20, plus: 24, access: 'Cable', where: 'Dos sedes',
    purpose: 'Interfaces de gestión de switches, routers, AP y firewalls', rule: 'Solo entra el NOC. Solo SSH v2.' }
];

/* Subredes IPv4 + IPv6 (tablas 13, 14, 17, 18) */
LT.SUBNETS = [
  { site: 'BCN', vlan: 10, net: '10.1.10.0', cidr: 26, mask: '255.255.255.192', hosts: 42, plus: 51, usable: 62, gw: '10.1.10.1', bc: '10.1.10.63', v6: '2001:db8:acad:1010::/64' },
  { site: 'BCN', vlan: 20, net: '10.1.20.0', cidr: 23, mask: '255.255.254.0', hosts: 220, plus: 264, usable: 510, gw: '10.1.20.1', bc: '10.1.21.255', v6: '2001:db8:acad:1020::/64', changed: 'De /25 a /23: todos los open space de tráfico y operaciones van en la VLAN 20 (más de 220 puestos).' },
  { site: 'BCN', vlan: 40, net: '10.1.40.0', cidr: 25, mask: '255.255.255.128', hosts: 100, plus: 120, usable: 126, gw: '10.1.40.1', bc: '10.1.40.127', v6: '2001:db8:acad:1040::/64' },
  { site: 'BCN', vlan: 50, net: '10.1.50.0', cidr: 25, mask: '255.255.255.128', hosts: 58, plus: 70, usable: 126, gw: '10.1.50.1', bc: '10.1.50.127', v6: '2001:db8:acad:1050::/64' },
  { site: 'BCN', vlan: 99, net: '10.1.99.0', cidr: 27, mask: '255.255.255.224', hosts: 17, plus: 21, usable: 30, gw: '10.1.99.1', bc: '10.1.99.31', v6: '2001:db8:acad:1099::/64' },
  { site: 'ZGZ', vlan: 10, net: '10.2.10.0', cidr: 28, mask: '255.255.255.240', hosts: 8, plus: 10, usable: 14, gw: '10.2.10.1', bc: '10.2.10.15', v6: '2001:db8:acad:2010::/64' },
  { site: 'ZGZ', vlan: 20, net: '10.2.20.0', cidr: 27, mask: '255.255.255.224', hosts: 13, plus: 16, usable: 30, gw: '10.2.20.1', bc: '10.2.20.31', v6: '2001:db8:acad:2020::/64' },
  { site: 'ZGZ', vlan: 30, net: '10.2.30.0', cidr: 25, mask: '255.255.255.128', hosts: 80, plus: 96, usable: 126, gw: '10.2.30.1', bc: '10.2.30.127', v6: '2001:db8:acad:2030::/64' },
  { site: 'ZGZ', vlan: 40, net: '10.2.40.0', cidr: 27, mask: '255.255.255.224', hosts: 20, plus: 24, usable: 30, gw: '10.2.40.1', bc: '10.2.40.31', v6: '2001:db8:acad:2040::/64' },
  { site: 'ZGZ', vlan: 50, net: '10.2.50.0', cidr: 27, mask: '255.255.255.224', hosts: 12, plus: 15, usable: 30, gw: '10.2.50.1', bc: '10.2.50.31', v6: '2001:db8:acad:2050::/64' },
  { site: 'ZGZ', vlan: 99, net: '10.2.99.0', cidr: 26, mask: '255.255.255.192', hosts: 26, plus: 32, usable: 62, gw: '10.2.99.1', bc: '10.2.99.63', v6: '2001:db8:acad:2099::/64', changed: 'De /29 a /26: la VLAN de gestión necesita una IP para cada equipo de red (26 con el 20 % de margen salen 32).' }
];

LT.WAN = [
  ['Túnel VPN BCN-RT1 ↔ ZGZ-RT1', '10.0.0.0/30', '10.0.0.1', '10.0.0.2', '2001:db8:acad:f001::/64'],
  ['ISP ↔ BCN-RT1 (principal)', '85.100.1.0/30', '85.100.1.1', '85.100.1.2', '2001:db8:acad:f002::/64'],
  ['ISP ↔ BCN-RT2 (respaldo)', '85.100.1.4/30', '85.100.1.5', '85.100.1.6', ''],
  ['ISP ↔ ZGZ-RT1 (principal)', '85.100.2.0/30', '85.100.2.1', '85.100.2.2', '2001:db8:acad:f003::/64'],
  ['ISP ↔ ZGZ-RT2 (respaldo)', '85.100.2.4/30', '85.100.2.5', '85.100.2.6', '']
];

/* Plantas y sedes (punto 0 de la memoria) */
LT.FLOORS = [
  { id: 'p0', site: 'BCN', name: 'Planta baja', short: 'P0', img: 'assets/planos/p0.webp', seats: 30, aps: 12, sw: 2,
    title: 'Acceso y corazón de la red',
    zones: [['40', 'Vestíbulo y recepción (128,29 m²), comedor, office, sala polivalente'], ['20', 'Sala de formación (127,62 m²), archivo, paquetería'], ['50', 'CPD (21,74 m²): un único rack 42U (R1) con cores, firewall, routers y servidores'], ['50', 'Taller IT (15,22 m²) para preparar equipos con FOG'], ['--', 'RITI (30,89 m²): entran las fibras de dos operadores por caminos distintos']] },
  { id: 'p1', site: 'BCN', name: 'Planta primera', short: 'P1', img: 'assets/planos/p1.webp', seats: 117, aps: 14, sw: 4,
    title: 'Tráfico y operaciones',
    zones: [['20', 'Open space de operaciones y flota (381,62 m²)'], ['20', 'Open space de tráfico (254,62 m²), caja de suelo de 6 tomas por bloque'], ['20', 'Sala de planificación de rutas con videowall GPS'], ['10', 'Despacho del jefe de tráfico'], ['40', 'Office y zona café']] },
  { id: 'p2', site: 'BCN', name: 'Planta segunda', short: 'P2', img: 'assets/planos/p2.webp', seats: 93, aps: 14, sw: 3,
    title: 'Administración y finanzas',
    zones: [['20', 'Open space de finanzas y contabilidad (254,62 m²)'], ['20', 'Open space de compras y comercial (254,62 m²)'], ['20', 'RRHH, reuniones, videoconferencia, archivo, reprografía'], ['10', 'Despacho del jefe de administración'], ['40', 'Office']] },
  { id: 'p3', site: 'BCN', name: 'Planta tercera', short: 'P3', img: 'assets/planos/p3.webp', seats: 62, aps: 14, sw: 3,
    title: 'Dirección y NOC',
    zones: [['10', 'Dirección general, subdirección, financiera, comercial, operaciones, sala de juntas'], ['20', 'Open space de control de gestión'], ['99', 'NOC (45,84 m²) y laboratorio IT (62,34 m²): desde acá se administra toda la red'], ['40', 'Office de dirección']] },
  { id: 'zgz', site: 'ZGZ', name: 'Almacén de Zaragoza', short: 'ZGZ', img: 'assets/planos/zgz.webp', seats: 28, aps: 17, sw: 4,
    title: 'Nave de 150 × 60 m, 9 muelles',
    zones: [['30', 'Recepción (1.065,60 m²), expedición (1.434,24 m²) y almacenaje (3.811,50 m²)'], ['30', '9 terminales de muelle, 7 impresoras de etiquetas, 12 cámaras IP'], ['10', 'Dirección local'], ['20', 'Administración y sala de reuniones'], ['99', 'Sala de gestión de red'], ['50', 'Cuarto de comunicaciones (45 m²) con rack R1 de 42U'], ['--', 'IDF-02: armario mural 12U en la otra punta, unido por 135 m de fibra OM4']] }
];

/* Racks: [U superior, alto en U, tipo, etiqueta, detalle] (alzados de la memoria, imágenes 8 y 9) */
LT.RACKS = {
  'BCN-R1': { title: 'BCN · CPD · Rack R1', size: 42, occ: '29U útiles + 13U de reserva', ups: { model: 'APC Smart-UPS SRT 6000VA', load: 2282, min: 17 },
    items: [[42,1,'cab','Entrada de cables superior'],[41,1,'fib','Patch panel fibra LC-LC 24p','OM4 a los IDF y monomodo de los operadores'],[40,1,'org','Organizador horizontal'],[39,1,'kvm','Consola KVM retráctil + monitor TFT'],[38,1,'org','Organizador horizontal'],[37,1,'pp','Patch panel Cat 6A 24p (PP01)','Rosetas de la P0'],[36,1,'org','Organizador horizontal'],[35,1,'pp','Patch panel Cat 6A 24p (PP02)','Rosetas de la P0'],[34,1,'org','Organizador horizontal'],[33,1,'acc','BCN-P0-ACC1 · Catalyst 9300L-48P-4X','Acceso de la planta baja'],[32,1,'org','Organizador horizontal'],[31,1,'rt','BCN-RT1 · Cisco ISR 4331','Router principal, sale por ISP-1, extremo de la VPN'],[30,1,'rt','BCN-RT2 · Cisco ISR 4331','Router de respaldo, sale por ISP-2'],[29,1,'org','Organizador horizontal'],[28,1,'fw','BCN-FW · Cisco ASA 5506-X','Firewall perimetral: outside, wanbak, inside, corebak'],[27,1,'org','Organizador horizontal'],[26,2,'core','BCN-CORE1 · Catalyst 9500-24Y4C','Core principal: raíz STP y HSRP activo'],[24,1,'org','Organizador horizontal'],[23,2,'core','BCN-CORE2 · Catalyst 9500-24Y4C','Core de reserva: STP secundario y HSRP standby'],[21,1,'org','Organizador horizontal'],[20,1,'pdu','PDU superior','Regleta de 8 tomas C13'],[19,1,'org','Organizador horizontal'],[18,2,'srv','SRV-HV03 · Dell PowerEdge R450','Hipervisor con la web y los servicios públicos'],[16,1,'org','Organizador horizontal'],[15,2,'srv','SRV-HV02 · Dell PowerEdge R450','AD secundario y servicios internos'],[13,1,'org','Organizador horizontal'],[12,2,'srv','SRV-HV01 · Dell PowerEdge R450','AD principal, DHCP, RADIUS y DNS'],[10,1,'org','Organizador horizontal'],[9,1,'pdu','PDU inferior','Regleta de 8 tomas C13'],[6,3,'bat','Módulo de baterías SRT96RMBP','Alarga la autonomía del SAI'],[3,3,'ups','SAI APC Smart-UPS SRT 6000VA','Online doble conversión. Alimenta los equipos críticos']] },
  'BCN-IDF-P1': { title: 'BCN · IDF-P1', size: 42, occ: '19U útiles + 21U de reserva', ups: { model: 'APC Smart-UPS SRT 2200VA + SRT72RMBP', load: 1531, min: 24 },
    items: [[42,1,'cab','Entrada de cables superior'],[41,1,'fib','Patch panel fibra LC-LC 12p','Dos enlaces OM4 redundantes al CPD'],[40,1,'org','Organizador horizontal'],[39,1,'pp','Patch panel Cat 6A 48p (PP01)'],[38,1,'acc','BCN-P1-ACC1 · Catalyst 9300L-48P-4X'],[37,1,'org','Organizador horizontal'],[36,1,'pp','Patch panel Cat 6A 48p (PP02)'],[35,1,'acc','BCN-P1-ACC2 · Catalyst 9300L-48P-4X'],[34,1,'org','Organizador horizontal'],[33,1,'pp','Patch panel Cat 6A 48p (PP03)'],[32,1,'acc','BCN-P1-ACC3 · Catalyst 9300L-48P-4X'],[31,1,'org','Organizador horizontal'],[30,1,'pp','Patch panel Cat 6A 24p (PP04)'],[29,1,'acc','BCN-P1-ACC4 · Catalyst 9300L-48P-4X'],[28,1,'org','Organizador horizontal'],[27,1,'pdu','PDU','Regleta de 8 tomas C13'],[5,2,'bat','Módulo de baterías APC SRT72RMBP','Lleva la autonomía de ≈ 6 a ≈ 24 min'],[3,2,'ups','SAI APC Smart-UPS SRT 2200VA','Online doble conversión'],[1,1,'cab','Pie del rack']] },
  'ZGZ-R1': { title: 'ZGZ · CPD · Rack R1', size: 42, occ: '24U útiles + 18U de reserva', ups: { model: 'APC Smart-UPS SRT 3000VA + SRT96RMBP', load: 1581, min: 35 },
    items: [[42,1,'cab','Entrada de cables superior'],[41,1,'fib','Patch panel fibra LC-LC 24p'],[40,1,'org','Organizador horizontal'],[39,1,'kvm','Consola KVM + monitor TFT'],[38,1,'org','Organizador horizontal'],[37,1,'pp','Patch panel Cat 6A 48p (PP01)'],[36,1,'acc','ZGZ-ACC1 · Catalyst 9300L-48P-4X','Oficinas del almacén'],[35,1,'org','Organizador horizontal'],[34,1,'pp','Patch panel Cat 6A 48p (PP02)'],[33,1,'acc','ZGZ-ACC2 · Catalyst 9300L-48P-4X','Nave, mitad oeste'],[32,1,'org','Organizador horizontal'],[31,1,'rt','ZGZ-RT1 · Cisco ISR 4331','Router principal, extremo de la VPN'],[30,1,'rt','ZGZ-RT2 · Cisco ISR 4331','Router de respaldo'],[29,1,'org','Organizador horizontal'],[28,1,'fw','ZGZ-FW · Cisco ASA 5506-X'],[27,1,'org','Organizador horizontal'],[26,1,'core','ZGZ-CORE1 · Catalyst 9300-48P','Raíz STP, HSRP activo'],[25,1,'core','ZGZ-CORE2 · Catalyst 9300-48P','Reserva'],[24,1,'org','Organizador horizontal'],[23,1,'pdu','PDU','Regleta de 8 tomas C13'],[9,2,'srv','SRV-ZGZ01 · Dell PowerEdge R450','Segundo controlador de dominio, DHCP, DNS, RADIUS'],[7,1,'org','Organizador horizontal'],[5,2,'bat','Módulo de baterías APC SRT96RMBP','Lleva la autonomía de ≈ 10 a ≈ 35 min'],[3,2,'ups','SAI APC Smart-UPS SRT 3000VA','Online doble conversión'],[1,1,'cab','Pie del rack']] },
  'ZGZ-IDF-02': { title: 'ZGZ · IDF-02 (mural)', size: 12, occ: '7U útiles + 4U de reserva', ups: { model: 'APC Smart-UPS SRT 1000VA', load: 312, min: 41 },
    items: [[12,1,'cab','Entrada de cables superior'],[11,1,'fib','Patch panel fibra LC-LC 6p','135 m de OM4 hasta el CPD'],[10,1,'org','Organizador horizontal'],[9,1,'pp','Patch panel Cat 6A 48p (PP01)'],[8,1,'acc','ZGZ-ACC4 · Catalyst 9300L-48P-4X','Nave, mitad este'],[7,1,'org','Organizador horizontal'],[6,1,'pdu','PDU','Regleta de 6 tomas C13'],[3,2,'ups','SAI APC Smart-UPS SRT 1000VA'],[1,1,'cab','Pie del armario mural']] }
};

/* Medios por tramo (tabla 2 y 3) */
LT.MEDIA = [
  { tram: 'Rack → roseta', cable: 'Cat 6A U/FTP LSZH', speed: '10 Gb', dist: '≈ 40–85 m', limit: '90 m' },
  { tram: 'CPD → IDF (montante)', cable: 'Fibra OM4, 12 fibras', speed: '2 × 10 Gb', dist: '≤ 40 m', limit: '400 m' },
  { tram: 'CPD ZGZ → IDF-02', cable: 'Fibra OM4', speed: '10 Gb', dist: '≈ 135 m', limit: '400 m' },
  { tram: 'RITI → CPD', cable: 'Fibra monomodo (2 operadores)', speed: '1 Gb', dist: '≈ 15 m', limit: '—' },
  { tram: 'Entre sedes', cable: 'FTTH 1 Gb + 4G/5G de respaldo', speed: '1 Gb', dist: 'VPN IPsec', limit: '—' }
];

/* Atacs de capa 2 y 3 (tablas 36 y 37) */
LT.ATTACKS = [
  { id: 'mac', layer: 2, name: 'MAC flooding', how: 'Llenar la tabla CAM del switch con miles de MAC falsas para que reparta el tráfico por todos los puertos.', def: 'Port Security', defHow: '1 MAC por puerto (3 con teléfono IP), aprendida con sticky. Si aparece otra, el puerto se apaga.', ref: '4.A1',
    cmd: 'macof -i eth0 -n 100000', logs: ['%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 000c.8587.538a on port FastEthernet0/3.', '%PM-4-ERR_DISABLE: psecure-violation error detected on Fa0/3, putting Fa0/3 in err-disable state', '%LINK-3-UPDOWN: Interface FastEthernet0/3, changed state to down'] },
  { id: 'rogue', layer: 2, name: 'DHCP intruso', how: 'Conectar un servidor DHCP pirata que reparte una puerta de enlace falsa para interceptar el tráfico.', def: 'DHCP snooping', defHow: 'Solo los dos troncales hacia los cores son trusted. Una oferta DHCP que llega por un puerto de usuario se descarta.', ref: '4.A2',
    cmd: 'dnsmasq --dhcp-range=10.1.20.100,10.1.20.200 --dhcp-option=3,10.1.20.66', logs: ['%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 00e0.f7a1.2b3c', 'DHCPOFFER descartado en Fa0/3 (untrusted)', 'Los clientes siguen recibiendo 10.1.20.1 del servidor legítimo 10.1.50.10'] },
  { id: 'starv', layer: 2, name: 'Agotamiento de DHCP', how: 'Pedir miles de direcciones con MAC inventadas hasta vaciar el ámbito del servidor.', def: 'Rate limit + Port Security', defHow: 'ip dhcp snooping limit rate 10 en cada puerto de usuario. Con más de 10 paquetes DHCP por segundo, el puerto cae.', ref: '4.A2',
    cmd: 'yersinia dhcp -attack 1', logs: ['%DHCP_SNOOPING-4-DHCP_SNOOPING_ERRDISABLE_WARNING: DHCP Snooping received 10 DHCP packets on interface Fa0/3', '%PM-4-ERR_DISABLE: dhcp-rate-limit error detected on Fa0/3, putting Fa0/3 in err-disable state'] },
  { id: 'arp', layer: 2, name: 'ARP spoofing', how: 'Responder a los ARP con la MAC propia para ponerse en medio de una comunicación.', def: 'Port Security + bindings', defHow: 'La tabla de bindings del DHCP snooping ata cada IP a una MAC y a un puerto. En la instalación real se suma Dynamic ARP Inspection.', ref: '4.A1 · 4.A2',
    cmd: 'arpspoof -i eth0 -t 10.1.20.11 10.1.20.1', logs: ['La MAC del atacante no coincide con el binding 10.1.20.11 → Fa0/4', 'Port Security: la MAC sticky de Fa0/3 no cambia, el tráfico falso no se aprende', 'En producción: %SW_DAI-4-DHCP_SNOOPING_DENY: Invalid ARPs (Res) on Fa0/3'] },
  { id: 'stp', layer: 2, name: 'Switch pirata / ataque STP', how: 'Conectar un switch que se proclama raíz para desviar el tráfico o crear un bucle.', def: 'BPDU Guard + PortFast', defHow: 'Un puerto de usuario no debe recibir nunca una BPDU. Si la recibe, se apaga. La raíz está fijada al CORE1 (prioridad 24576).', ref: '4.A3',
    cmd: 'yersinia stp -attack 4', logs: ['%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port FastEthernet0/3 with BPDU Guard enabled. Disabling port.', '%PM-4-ERR_DISABLE: bpduguard error detected on Fa0/3, putting Fa0/3 in err-disable state'] },
  { id: 'hop', layer: 2, name: 'VLAN hopping', how: 'Negociar un troncal (DTP) o usar doble etiqueta para saltar a otra VLAN.', def: 'Sin DTP + nativa 999', defHow: 'Puertos de usuario en modo access con nonegotiate, VLAN nativa 999 sin puertos, puertos libres en la VLAN 998 y apagados.', ref: '3.B · 4.A1',
    cmd: 'yersinia dtp -attack 1', logs: ['Fa0/3: switchport mode access · switchport nonegotiate', 'DTP ignorado: el puerto nunca forma troncal', 'La doble etiqueta no sirve: la nativa 999 no tiene ningún puerto de usuario'] },
  { id: 'spoof', layer: 3, name: 'IP spoofing', how: 'Falsificar la IP de origen para hacerse pasar por otro equipo.', def: 'NAT + ASA + bindings', defHow: 'Desde Internet solo entra el 80 y el 443 hacia la web. Adentro, Port Security y DHCP snooping atan IP, MAC y puerto. En producción, uRPF en la WAN.', ref: '3.C3 · 4.A2',
    cmd: 'hping3 -a 10.1.50.10 85.100.1.18 -S -p 445', logs: ['BCN-FW: Deny tcp src outside:10.1.50.10 dst inside:10.1.50.12/445 by access-group OUTSIDE_IN', 'Un origen privado no puede llegar desde Internet: el ISP ni siquiera tiene ruta (% Network not in table)'] },
  { id: 'route', layer: 3, name: 'Inyección de rutas', how: 'Un router pirata anuncia rutas falsas para desviar el tráfico.', def: 'OSPF con MD5', defHow: 'Todos los vecinos OSPF necesitan la clave MD5. Las interfaces hacia los clientes son pasivas.', ref: '3.C2',
    cmd: 'router ospf 1 · network 0.0.0.0 255.255.255.255 area 0', logs: ['%OSPF-4-ERRRCV: Received invalid packet: mismatched authentication key from 200.0.0.99, GigabitEthernet0/0/1', 'Ninguna adyacencia nueva: la tabla de rutas no cambia'] },
  { id: 'mitm', layer: 3, name: 'Man-in-the-middle entre sedes', how: 'Interceptar el tráfico entre Barcelona y Zaragoza mientras cruza Internet.', def: 'VPN IPsec AES-256', defHow: 'GRE sobre IPsec entre BCN-RT1 y ZGZ-RT1: ESP con AES-256 y SHA-HMAC. Lo que viaja por Internet es ilegible.', ref: '3.C1',
    cmd: 'tcpdump -i eth0 host 85.100.2.2', logs: ['85.100.1.2 > 85.100.2.2: ESP(spi=0x8f3a1c22,seq=0x5b), length 132', 'Carga útil cifrada: 4f 9a e1 07 c2 3d 88 ...', '#pkts encrypt: 91 · #pkts decrypt: 89'] },
  { id: 'lateral', layer: 3, name: 'Movimiento lateral', how: 'Desde un equipo comprometido de una VLAN, atacar a los de otra.', def: 'ACL Convidats, Gestió y Operaris', defHow: 'Cada VLAN sensible tiene su lista de acceso: la de invitados no llega a nada interno, la de operarios solo a tres servicios concretos y a Gestió solo entra el NOC.', ref: '4.B1 – 4.B3',
    cmd: 'nmap -sn 10.1.0.0/16   (desde P0-INV-01)', logs: ['ACL-INVITADOS-IN: 50 deny ip any any (matches subiendo)', 'Reply from 10.1.40.1: Destination host unreachable', 'Ningún host interno responde'] }
];

LT.OWASP = [
  ['A01', 'Control de acceso roto', 'El área de clientes comprueba que cada envío sea del cliente que lo pide. Si no, responde 404 y registra el intento. En WordPress solo administra el usuario logitrans.', '5.B2.2'],
  ['A02', 'Fallos criptográficos', 'Web por HTTPS (443). WordPress guarda las contraseñas como hash. Discos de servidor y clientes cifrados con BitLocker.', '5.B1 · 5.C1'],
  ['A03', 'Inyección (SQL, XSS)', 'Wordfence filtra los patrones de inyección. La base de datos solo escucha en la red interna de Docker.', '5.B1.3'],
  ['A04', 'Diseño inseguro', 'El área de clientes es una aplicación separada de WordPress, con su contenedor y sus usuarios.', '5.B2'],
  ['A05', 'Configuración insegura', 'Solo nginx publica puertos (80 y 443) y el ASA solo deja entrar esos dos. Firewall local con bloqueo por defecto.', '5.B1.1 · 3.C3 · 5.C2'],
  ['A06', 'Componentes vulnerables', 'Imágenes oficiales y mantenidas. WPScan no encuentra plugins ni temas vulnerables.', '5.B1.1 · 6.2'],
  ['A07', 'Fallos de autenticación', 'Fuerza bruta al 100 % en Wordfence, bloqueo de 60 s en el área de clientes y, en el dominio, 8 caracteres y bloqueo a los 3 intentos.', '5.B1.3 · 5.B2.2 · 5.A3'],
  ['A08', 'Integridad de software y datos', 'Imágenes oficiales de Docker Hub y actualizaciones del repositorio oficial. En el repositorio interno solo Gestió puede añadir programas.', '5.B1.1 · 5.D'],
  ['A09', 'Registro y monitorización', 'El área de clientes registra los accesos no autorizados y Wordfence los bloqueos. Los logs del antivirus solo los lee Gestió.', '5.B2.2 · 5.C2.3'],
  ['A10', 'SSRF', 'La web no hace peticiones a direcciones que escriba el usuario y los contenedores internos no son accesibles desde fuera.', '5.B1.1']
];

LT.GPOS = [
  ['GPO-LogiTrans-Seguridad', 'Directiva base del dominio. Activa el firewall de Windows Defender en los tres perfiles.', 'Dominio'],
  ['GPO-Contrasenas-Bloqueo', 'Contraseñas de 8 caracteres como mínimo y bloqueo de la cuenta a los 3 intentos fallidos.', 'Dominio'],
  ['GPO-Bloqueo-Pantalla', 'Salvapantallas tras inactividad y contraseña para desbloquear.', 'Usuarios'],
  ['GPO-Bloqueo-USB', 'Deniega lectura y escritura en almacenamiento extraíble.', 'Equipos'],
  ['GPO-BitLocker', 'Permite BitLocker en equipos sin TPM, como las máquinas virtuales.', 'Equipos'],
  ['GPO-Redireccion-Docs', 'Redirige Documentos a \\\\SRV-AD\\Perfiles: los documentos viven cifrados y con RAID.', 'Usuarios'],
  ['GPO-Unidades-Mapeadas', 'Conecta \\\\SRV-AD\\Departaments como unidad S: al iniciar sesión.', 'Usuarios'],
  ['GPO-Carpetas-Magatzem', 'Entorno propio de los equipos de la OU Magatzem.', 'OU Magatzem']
];

LT.AD = [
  { ou: 'Direccio', group: 'Grupo-Direccio', users: [['director.general', 'Oliver Molina'], ['director.financier', 'Rodrigo Hernandez']], can: 'Modificar su carpeta y leer el repositorio' },
  { ou: 'Administracio', group: 'Grupo-Administracio', users: [['admin.comptabilitat', 'Laura Castellanos'], ['admin.rrhh', 'Pablo Martin']], can: 'Modificar su carpeta y leer el repositorio' },
  { ou: 'Magatzem', group: 'Grupo-Magatzem', users: [['operari.picking01', 'Samuel Fernandez'], ['operari.picking02', 'Vlad Bodislav']], can: 'Su carpeta, leer el repositorio y ver los vídeos de formación' },
  { ou: 'Gestio', group: 'Grupo-Gestio', users: [['admin.xarxa01', 'Gonzalo Perez'], ['admin.xarxa02', 'Patricia Rodriguez']], can: 'SSH a switches y routers, modificar el repositorio, leer los logs del antivirus' },
  { ou: 'Servidors', group: 'Grupo-Servidors', users: [['admin.servidor01', 'Jonathan Joestar'], ['admin.servidor02', 'Sebastian Cantillo']], can: 'Administrar los servidores' },
  { ou: 'Convidats', group: 'Grupo-Convidats', users: [['convidat.01', 'Ana Palomares'], ['convidat.02', 'Benito Morientes']], can: 'Ningún acceso a recursos internos' }
];

LT.DOCKER = [
  { name: 'nginx', image: 'nginx:stable', port: '80 · 443', pub: true, role: 'Servidor web y proxy inverso: / a WordPress, /clients a la app de clientes' },
  { name: 'wordpress', image: 'wordpress:6-php8.3-fpm', port: '9000', pub: false, role: 'WordPress con PHP-FPM' },
  { name: 'db', image: 'mariadb:11', port: '3306', pub: false, role: 'Base de datos de WordPress' },
  { name: 'clients', image: 'logitrans-web-clients', port: '8000', pub: false, role: 'Área de clientes en Python (Gunicorn)' },
  { name: 'jellyfin', image: 'jellyfin/jellyfin', port: '8096', pub: false, role: 'Streaming de vídeos corporativos sin descarga' }
];

LT.NMAP = [
  { port: '80/tcp', svc: 'http', ver: 'nginx', keep: true, why: 'Es la web. Se mantiene: es lo que publica el NAT.' },
  { port: '135/tcp', svc: 'msrpc', ver: 'Microsoft Windows RPC', keep: 'asa', why: 'Servicio del anfitrión Windows. Desde Internet no se llega: el ASA solo deja 80 y 443.' },
  { port: '443/tcp', svc: 'ssl/http', ver: 'nginx', keep: true, why: 'Es la web por HTTPS. Se mantiene.' },
  { port: '445/tcp', svc: 'microsoft-ds', ver: 'SMB', keep: 'asa', why: 'Igual que el 135: cerrado en el perímetro.' },
  { port: '1042/tcp', svc: 'afrog?', ver: 'asus_framework', keep: false, why: 'Programa del fabricante de la placa (ASUS). Bloqueado con la regla LogiTrans-bloqueo-ASUS.' },
  { port: '7778/tcp', svc: 'interwise?', ver: 'ArmouryCrateControlInterface', keep: false, why: 'Igual que el 1042. Bloqueado.' }
];

/* Rúbrica del Sprint 2: código, título, nota S1, comentario del profe, capítulo de la web */
LT.RUBRIC = [
  ['2.A1', 'Selección de medios', 3, '', 'cable'],
  ['2.A2', 'Normativa de etiquetado y canalización', 2, 'Faltaba concretar tipos y cantidades de canalizaciones', 'cable'],
  ['2.B1', 'Ubicación y dimensiones de racks', 2, 'Redimensionar armarios y ajustar SAIs', 'rack'],
  ['2.B2', 'Alzado del rack (Rack Elevation)', 0, '', 'rack'],
  ['2.B3', 'Selección y justificación del hardware', 3, '', 'rack'],
  ['2.C', 'Topología física en Packet Tracer', 2, 'Ajustar según el apartado 2', 'red'],
  ['3.A1', 'Direccionamiento IPv4 con VLSM', 1, 'Diseño OK pero faltaba comprobar en PT', 'ip'],
  ['3.A2', 'Direccionamiento IPv6 corporativo', 0, '', 'ip'],
  ['3.B', 'Segmentación en 6 VLAN', 1, 'Diseño OK pero faltaba comprobar en PT', 'red'],
  ['3.C1', 'VPN site-to-site', 0, '', 'tunel'],
  ['3.C2', 'OSPFv2 / OSPFv3 con autenticación', 2, 'Faltaba OSPFv3', 'tunel'],
  ['3.C3', 'Acceso a Internet y NAT (PAT)', 0, '', 'nat'],
  ['4.A1', 'Port Security', 2, 'Revisar direcciones por puerto', 'ataque'],
  ['4.A2', 'DHCP Snooping', 2, 'Faltaban los límites de peticiones', 'ataque'],
  ['4.A3', 'Protección STP (BPDU Guard y PortFast)', 0, 'Habían hecho un EtherChannel', 'ataque'],
  ['4.B1', 'ACL VLAN Convidats', 0, '', 'red'],
  ['4.B2', 'ACL VLAN Gestió', 0, '', 'red'],
  ['4.B3', 'ACL VLAN Operaris', 0, '', 'red'],
  ['5.A1', 'Active Directory y OU', 0, '', 'servicios'],
  ['5.A2', 'RADIUS / 802.1X', 0, '', 'servicios'],
  ['5.A3', 'GPO', 0, '', 'servicios'],
  ['5.B1', 'WordPress corporativo', 0, '', 'web'],
  ['5.B2', 'Área de clientes', 0, '', 'web'],
  ['5.C1', 'RAID 5 y cifrado', 0, '', 'datos'],
  ['5.C2', 'Firewall local y antivirus', 0, '', 'datos'],
  ['5.D', 'Repositorio de medios', 0, '', 'web'],
  ['5.E', 'Repositorio de despliegue (FOG)', 0, '', 'web'],
  ['6.1', 'Escaneo de puertos con Nmap', 0, '', 'auditoria'],
  ['6.2', 'Vulnerabilidades (WPScan)', 0, '', 'auditoria'],
  ['6.3', 'Mitigación (OWASP y C2/C3)', 0, '', 'mitigacion']
];

LT.CORRECTIONS = [
  { t: 'Servidores', before: 'Repartidos por plantas, uno por departamento.', after: 'Centralizados en un único rack R1 del CPD, con espacio reservado para un R2.', why: 'Un solo punto que proteger, refrigerar y alimentar con SAI.' },
  { t: 'Packet Tracer', before: 'Más de 800 dispositivos: imposible de configurar y probar.', after: '105 dispositivos: toda la electrónica real y un par de equipos por VLAN.', why: 'Así se configura y se prueba todo de verdad. Los 800 quedan en los planos.' },
  { t: 'ACL Convidats', before: 'Permisiva: los invitados salían a todo Internet, ping incluido.', after: 'Solo DHCP, DNS, HTTP y HTTPS. Todo lo demás, deny ip any any.', why: 'Lo que pide el enunciado: navegar y nada más.' },
  { t: 'ACL Operaris', before: 'Acceso a toda la VLAN de servidores.', after: 'Solo DNS a SRV-ZGZ01, MySQL 3306 a SRV-HV02 y web a SRV-HV03.', why: 'Mínimo privilegio: lo justo para trabajar.' },
  { t: 'SAIs', before: 'Autonomía corta y modelos line-interactive en los IDF.', after: 'Carga calculada con el PoE de teléfonos, AP y cámaras. Todos online doble conversión, de 17 a 43 min de autonomía (4 con módulo de baterías extra), SNMP v3 al NOC.', why: 'Sin contar el PoE, los IDF parecían ir sobrados y no llegaban a 15 min.' },
  { t: 'Canalizaciones', before: 'Metros estimados a ojo y sin marcar las bajadas a cada toma.', after: 'Derivación de cada caja y toma marcada en los planos (capa L_can), metros medidos: 1.053 m de bandeja, tubo Ø 40 a cajas y Ø 32 a tomas.', why: 'Lo pidió el profe en la revisión: qué va a cada roseta, con distancias y material.' },
  { t: 'Presupuesto', before: '855.172 € con equipos del Sprint 1 (3650, 2960X, 460 PC).', after: '755.939 € con los equipos de la memoria: C9500, C9300L, R450, SAIs con baterías y canalizaciones medidas.', why: 'El presupuesto tiene que coincidir con lo que diseñamos.' },
  { t: 'Logs del antivirus', before: 'Guardados en local en cada equipo.', after: 'En \\\\SRV-AD\\Logs (volumen R: cifrado), lectura solo para Grupo-Gestio, que trabaja desde la VLAN 99.', why: 'Lo pide el enunciado: solo Gestión los consulta.' },
  { t: 'WAF', before: 'WordPress sin firewall de aplicación.', after: 'Wordfence instalado, licencia Free activa y fuerza bruta al 100 %.', why: 'Filtra inyección, XSS y fuerza bruta antes de llegar a WordPress.' },
  { t: 'Subredes', before: 'VLAN 20 BCN en /25 y VLAN 99 ZGZ en /29.', after: 'VLAN 20 en /23 (510 hosts) y VLAN 99 en /26 (62 hosts).', why: 'Los planos definitivos tenían más puestos y más equipos de red de los que contamos en el Sprint 1.' }
];

LT.BUDGET = [
  ['Puestos de trabajo', 272095, '330 PC con monitor, teléfonos IP, impresoras y terminales de muelle'],
  ['Wi-Fi', 79660, '71 AP Wi-Fi 6 (12 industriales), controladora 9800-L y licencias'],
  ['Electrónica de red', 71840, 'Core C9500/C9300, 16 switches C9300L, ISR 4331, ASA 5506-X y SFP'],
  ['Cableado estructurado', 69860, '36.700 m de Cat 6A, fibra OM4, 694 tomas y latiguillos'],
  ['Servicios e instalación', 67602, 'Tirada y certificación, fibra, montaje, configuración y auditoría'],
  ['Almacén y seguridad', 66268, '44 terminales RF, 10 terminales de carretilla y 12 cámaras IP'],
  ['Licencias y software', 34656, 'Cisco DNA, Windows Server 2022 y 500 CAL'],
  ['Racks, SAI y climatización', 33445, '7 armarios, 6 SAI online con 4 módulos de baterías y climatización'],
  ['Canalizaciones', 32018, 'Bandejas y tubos medidos en los planos + 10 %'],
  ['Servidores', 28495, '4 Dell PowerEdge R450 con RAID 5 y NVR']
];
LT.BUDGET_TOTAL = { net: 755939.13, iva: 158747.22, total: 914686.35 };

LT.TEAM = [
  { id: 'galo', name: 'Galo Lepore Rossi', role: 'Scrum Master', color: '--v99', initial: 'G',
    does: 'Toda la red en Packet Tracer: direccionamiento, OSPF, VPN, NAT, seguridad de capa 2, firewall y ACL. Coordinación Scrum.' },
  { id: 'joan', name: 'Joan Infantes Lopez', role: 'Product Owner', color: '--orange', initial: 'J',
    does: 'Racks y CPD, etiquetado y canalización, alzado de racks, VLAN, informe de mitigación y entrega final.' },
  { id: 'robert', name: 'Robert Purcharea', role: 'Developer', color: '--v20', initial: 'R',
    does: 'Active Directory, GPO, RADIUS y 802.1X, RAID 5 con cifrado, firewall local y antivirus.' },
  { id: 'oliver', name: 'Oliver Molina Montero', role: 'Developer', color: '--v50', initial: 'O',
    does: 'WordPress y área de clientes, repositorio con streaming, FOG y auditoría con Nmap y WPScan.' }
];
/* Reparto por punto de la rúbrica: [inicio, fin, responsables, colaboraron]. Fechas del diagrama de Gantt. */
LT.REPARTO = {
  '2.A1': ['2026-10-01', '2026-10-14', 'galo joan', 'robert oliver'],
  '2.A2': ['2026-10-14', '2026-11-11', 'joan', ''],
  '2.B1': ['2026-10-14', '2026-11-11', 'joan', 'galo robert'],
  '2.B2': ['2026-10-15', '2026-11-12', 'joan', ''],
  '2.B3': ['2026-10-07', '2026-10-29', 'galo robert', 'joan oliver'],
  '2.C': ['2026-10-15', '2026-11-11', 'galo oliver', 'joan'],
  '3.A1': ['2026-10-07', '2026-11-18', 'galo', 'joan'],
  '3.A2': ['2026-10-07', '2026-11-19', 'galo', 'joan'],
  '3.B': ['2026-10-07', '2026-11-19', 'joan', 'galo'],
  '3.C1': ['2026-11-11', '2026-11-18', 'galo', 'joan'],
  '3.C2': ['2026-10-07', '2026-11-19', 'galo', ''],
  '3.C3': ['2026-11-11', '2026-11-18', 'galo', ''],
  '4.A1': ['2026-10-07', '2026-11-19', 'galo', ''],
  '4.A2': ['2026-10-07', '2026-11-19', 'galo', ''],
  '4.A3': ['2026-11-05', '2026-11-19', 'galo', ''],
  '4.B1': ['2026-11-05', '2026-11-18', 'galo joan', ''],
  '4.B2': ['2026-11-05', '2026-11-18', 'galo joan', ''],
  '4.B3': ['2026-11-05', '2026-11-18', 'galo joan', ''],
  '5.A1': ['2026-10-28', '2026-11-15', 'robert', ''],
  '5.A2': ['2026-11-10', '2026-11-19', 'robert', ''],
  '5.A3': ['2026-11-12', '2026-11-18', 'robert', 'galo joan oliver'],
  '5.B1': ['2026-10-29', '2026-11-14', 'oliver', ''],
  '5.B2': ['2026-11-05', '2026-11-18', 'oliver', ''],
  '5.C1': ['2026-11-11', '2026-11-18', 'robert oliver', ''],
  '5.C2': ['2026-11-11', '2026-11-18', 'galo', 'robert'],
  '5.D': ['2026-11-05', '2026-11-11', 'oliver', ''],
  '5.E': ['2026-11-05', '2026-11-11', 'oliver', ''],
  '6.1': ['2026-11-11', '2026-11-18', 'oliver', ''],
  '6.2': ['2026-11-11', '2026-11-19', 'oliver joan', ''],
  '6.3': ['2026-11-11', '2026-11-18', 'joan', 'oliver']
};

LT.SPRINTS = [
  { n: 1, name: 'Diseño', items: ['Ubicaciones y planos', 'VLAN y direccionamiento IPv4/IPv6', 'Hardware, cableado y racks', 'Cobertura Wi-Fi y presupuesto', 'Topología física y capa 2 en PT'], state: 'Entregado' },
  { n: 2, name: 'Servicios y seguridad', items: ['NAT, VPN, OSPFv2/v3 y firewall', 'ACL, Port Security, DHCP snooping, STP', 'AD, GPO, RADIUS, RAID, BitLocker', 'WordPress + WAF, área de clientes, Jellyfin, FOG', 'Auditoría Nmap y WPScan, mitigación'], state: '30 / 30 cards' },
  { n: 3, name: 'Validación y defensa', items: ['Validación final', 'Informe de auditoría', 'Esta web', 'Defensa ante el tribunal'], state: 'En curso' }
];
