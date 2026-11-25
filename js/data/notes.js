/* Notas de ponente: lo que hay que decir en cada capítulo. Se ven en la vista de ponente (tecla S). */
window.LT = window.LT || {};
LT.NOTES = {
  inicio: { time: 1, say: [
    'Presentarse: somos LogiTrans, cuatro personas, ASIX2C.',
    'No traemos diapositivas: esto es la red. Todo lo que se ve está hecho con los datos reales del proyecto.',
    'La presentación sigue el viaje de un paquete de Barcelona a Zaragoza. A la izquierda, cada salto es un capítulo.',
    'Si el tribunal quiere comprobar algo en vivo: Ctrl+K abre una consola que responde con la configuración real.'
  ] },
  encargo: { time: 1, say: [
    'El cliente: empresa logística con oficina central en Barcelona (350 puestos) y almacén en Zaragoza (150).',
    'Pide red segura entre las dos sedes, Wi-Fi corporativo y de invitados, Active Directory, web con área de clientes y auditoría.',
    'El tablero de la derecha es la rúbrica del Sprint 2: los 30 puntos, la nota del Sprint 1 y dónde se resuelve cada uno. Clic en cualquiera y vamos ahí.'
  ] },
  sedes: { time: 1, say: [
    'Barcelona: edificio de cuatro plantas. CPD en planta 0, un IDF por planta unido por fibra OM4.',
    'Zaragoza: nave logística con 9 muelles, oficinas y un IDF al fondo de la nave, a unos 135 m del CPD.',
    'Cada sede sale a Internet por dos operadores distintos, más respaldo 4G/5G.'
  ] },
  planos: { time: 1, say: [
    'Los planos son de draw.io y se pueden descargar al final.',
    'Cada color es una zona y una VLAN: se ve qué puesto va a qué red.',
    'Cambiá de planta con las pestañas y hacé zoom sobre el CPD.'
  ] },
  cable: { time: 1.5, say: [
    'Cobre Cat 6A U/FTP LSZH del rack a la roseta: 10 Gb, por debajo de los 90 m del enlace permanente.',
    'Entre plantas, fibra OM4 de 12 fibras: 2 × 10 Gb. Entre sedes, la VPN por FTTH.',
    'Etiquetado: cada roseta dice sede, planta, armario, panel y puerto. Escribí una etiqueta en el decodificador y lo muestra.',
    'Corrección del profe (2.A2): cada caja y toma tiene su derivación en los planos, con metros medidos: 1.053 m de bandeja, tubo Ø 40 a cajas y Ø 32 a tomas.'
  ] },
  rack: { time: 1.5, say: [
    'Este punto (2.B2) en el Sprint 1 fue un 0: no había alzado. Ahora están los cuatro racks, U a U.',
    'Lo pesado abajo (SAI y baterías), servidores, red a la altura de trabajo, acceso con su patch panel, fibra y KVM arriba.',
    'Pulsá «Cortar la luz»: SAI online de doble conversión, 0 ms de transferencia, aviso SNMP v3 al NOC.',
    'SAIs recalculados con el PoE de teléfonos, AP y cámaras: el más cargado es el IDF-P2, al 84 %, y cuatro llevan módulo de baterías para pasar de 15 min.'
  ] },
  red: { time: 2.5, say: [
    'Topología completa del Packet Tracer: 105 equipos. Dos cores con HSRP, ASA, dos routers por sede y la VPN.',
    'El simulador aplica las mismas ACL, NAT y reglas del ASA. Elegí origen, destino y servicio y se ve dónde pasa o dónde muere.',
    'Probar: invitado a servidor (muere en ACL-INVITADOS), operario a MySQL (pasa), Internet a la web (pasa por NAT estático).',
    'STP: cortá el enlace y se ve cómo la red reconverge por el otro core.'
  ] },
  ip: { time: 1.5, say: [
    'Regla 10.SEDE.VLAN.HOST: con leer la IP se sabe dónde está y qué es el equipo.',
    'VLSM con 20 % de margen. El ancho de cada bloque es el tamaño real de la subred.',
    'Cambios respecto al Sprint 1: VLAN 20 de BCN pasa a /23 y VLAN 99 de ZGZ a /26, por los planos definitivos.',
    'IPv6 dual stack: 2001:db8:acad::/48, una /64 por VLAN con SLAAC.'
  ] },
  tunel: { time: 1.5, say: [
    'GRE sobre IPsec entre BCN-RT1 y ZGZ-RT1: AES-256 y SHA-HMAC.',
    'Lo que entra legible al túnel viaja como ESP: escribí algo y mirá lo que vería alguien en Internet.',
    'OSPF sobre el túnel con MD5. Pulsá y se ven los estados hasta FULL.',
    'Honestidad: en PT no se puede autenticar OSPFv3 con IPsec ni llevarlo por GRE. Lo decimos en la memoria.'
  ] },
  nat: { time: 1.5, say: [
    'PAT: todos los equipos salen con 85.100.1.2. NAT estático: la web 10.1.50.12 se publica como 85.100.1.18.',
    'ASA 5506-X con cuatro interfaces: dos hacia los routers (nivel 0), dos hacia los cores (nivel 100).',
    'OUTSIDE_IN e INSIDE_OUT terminan en deny ip any any: lo que no está permitido, no pasa.'
  ] },
  ataque: { time: 2, say: [
    'Atacamos un switch de acceso en vivo. Cada defensa es configuración real del Packet Tracer.',
    'MAC flooding: Port Security apaga el puerto (err-disable).',
    'Switch pirata: BPDU Guard. En el Sprint 1 esto fue un 0 porque habíamos hecho un EtherChannel.',
    'Si el tribunal quiere, que elija cualquiera de los diez y lo lanzamos.'
  ] },
  servicios: { time: 2, say: [
    'Windows Server 2022, dominio logitrans.local. Una OU por departamento con su grupo.',
    'Ocho GPO: contraseñas y bloqueo a los 3 intentos, bloqueo de USB, BitLocker, carpetas redirigidas y unidad S:.',
    'DHCP con 11 ámbitos, uno por VLAN de cada sede. DNS con horizonte dividido para la web.',
    'NPS: 802.1X para el Wi-Fi corporativo y AAA para el SSH a los Cisco. Pulsá «Conectarse» y se ve el diálogo entero.',
    'gpresult /r confirma que las GPO llegan al usuario admin.rrhh.'
  ] },
  datos: { time: 1.5, say: [
    'RAID 5 con Storage Spaces (Parity) en tres discos. Quitamos uno: queda degradado y sigue funcionando.',
    'BitLocker XTS-AES 128 en el servidor y en los clientes. Robamos un disco y lo montamos en Ubuntu: wrong fs type.',
    'Firewall de Windows por GPO, Defender con análisis programados y logs que solo lee Gestió.'
  ] },
  web: { time: 2, say: [
    'Cinco contenedores con docker compose. Solo nginx publica puertos.',
    'Área de clientes en Python, separada de WordPress. Usuario cliente1, contraseña demo.',
    'Probar cinco fallos: bloqueo de 60 s. Pedir el envío de otro cliente: 404 y queda en el log.',
    'Wordfence: fuerza bruta al 100 %. Repositorio de solo lectura para todos menos Gestió. FOG despliega win10-base por PXE.'
  ] },
  auditoria: { time: 1.5, say: [
    'Nmap -sV: 994 puertos cerrados y 6 abiertos. 80 y 443 son la web. 135 y 445 no se ven desde Internet por el ASA.',
    '1042 y 7778 eran programas de ASUS: los bloqueamos con la regla LogiTrans-bloqueo-ASUS.',
    'WPScan con token: cero plugins y temas vulnerables, cero usuarios enumerables.'
  ] },
  mitigacion: { time: 1.5, say: [
    'OWASP Top 10 de 2021 aplicado a la web y al área de clientes.',
    'Cada tarjeta dice la medida y el punto de la memoria donde está la prueba.',
    'Tabla 38: lo que encontró la auditoría, el riesgo y qué hicimos. Lo pendiente es para producción: Wordfence Premium y certificado válido.'
  ] },
  correcciones: { time: 1.5, say: [
    'Lo que nos corrigió el profe en el Sprint 1 y cómo quedó.',
    'Los más importantes: servidores centralizados, Packet Tracer de 800 a 105 equipos, ACL de invitados y operarios con mínimo privilegio.'
  ] },
  presupuesto: { time: 1, say: [
    '914.686 € con IVA. 755.939 € sin IVA.',
    'El bloque más grande son los puestos de trabajo (36 %): 330 PC con monitor, teléfonos IP, impresoras y terminales de muelle.',
    'La red en sí (electrónica, Wi-Fi, cableado, canalizaciones y armarios con SAI) ronda los 287.000 €, algo más de un tercio.'
  ] },
  equipo: { time: 1, say: [
    'Scrum con tres sprints. Galo Scrum Master, Joan Product Owner, Robert y Oliver developers.',
    'Sprint 2 cerrado con las 30 cards de la rúbrica.'
  ] },
  creditos: { time: 0.5, say: [
    'Todo se puede descargar: memoria, Packet Tracer y planos.',
    'El QR abre esta misma web en el móvil.',
    'Gracias. Preguntas.'
  ] }
};
