/* Punto 4 de la memoria: seguridad de capa 2 y listas de acceso */
(function () {
  var LT = window.LT, D = LT.D;

  LT.sec({
    id: '4.A1', t: 'Port Security en los switches de acceso', short: 'Port Security',
    lead: 'Cada toma sabe qué equipo tiene que haber detrás. Si aparece otro, el puerto se apaga solo.',
    sc: ['intruso', 'Desenchufá P1-ADM-03 de su roseta, conectá un PC intruso y mirá cómo cae el puerto.'],
    subs: [
      ['4.A1.1', 'Criterio aplicado',
        D.p('Port Security limita qué direcciones MAC se pueden conectar a cada puerto del switch. Si se conecta un equipo que no es el autorizado, el puerto se desactiva solo (estado <b>err-disabled</b>) y nadie puede usar esa toma hasta que un administrador lo vuelve a activar. Así se evita que alguien enchufe un portátil propio o un switch en una toma de la empresa.') +
        D.tbl(['Tipo de puerto', 'Máximo de MAC', 'Acción', 'Por qué'], [
          ['Puesto de trabajo normal (un PC)', '1 (sticky)', 'Shutdown', 'En cada toma va un solo equipo. Cualquier otra MAC es un intruso.'],
          ['Puesto con teléfono IP (PC conectado al teléfono)', '3 (sticky)', 'Shutdown', 'Hay dos equipos: el teléfono y el PC que cuelga de él. El teléfono IP ocupa dos entradas en port-security (ver abajo), así que el máximo real es 3. Un tercer equipo ya supera el límite.'],
          ['Punto de acceso Wi-Fi', '32 (corporativo) / 64 (invitados)', 'Restrict', 'En el puerto del AP aparecen las MAC de todos los clientes inalámbricos. Con Restrict, si se supera el límite solo se descartan los equipos sobrantes y no se corta todo el Wi-Fi.'],
          ['Puerto libre', '—', 'Apagado (VLAN 998)', 'Un puerto que no se usa no tiene que estar nunca activo.']
        ], 'Tabla 25. Criterio de Port Security.') +
        D.p('Las MAC se guardan con <b>sticky</b>: el switch aprende la MAC del primer equipo que se conecta y la guarda en la configuración, así que después de un reinicio sigue sabiendo cuál es el equipo autorizado sin escribir cada MAC a mano.') +
        D.note('Al principio configuramos los puertos con teléfono con un máximo de 2 (teléfono + PC), pero el puerto se desactivaba solo con los equipos legítimos. El mensaje del switch indicaba que la MAC que provocaba la violación era la del propio teléfono (0060.7035.5001): el teléfono IP, además del tráfico de datos, manda tráfico propio de voz, y el switch lo cuenta como una entrada más. Por eso el máximo es 3, que sigue siendo «un PC y un teléfono» y sigue apagando el puerto si se conecta cualquier otro equipo.', 'fix', 'Lo que aprendimos') +
        D.p('Los puertos con teléfono son <code>BCN-P1-ACC1 Fa0/2</code>, <code>BCN-P3-ACC1 Fa0/10</code> y <code>ZGZ-ACC1 Fa0/6</code>. Probalo en el switch:') +
        D.w('portsec')],
      ['4.A1.2', 'Comprobaciones en el Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show port-security', 'La tabla de puertos protegidos: Fa0/3 con máximo 1, Fa0/2 (teléfono) con máximo 3 y Fa0/1 (AP) con 32 y acción Restrict. La columna SecurityViolation tiene que estar a 0.', 56) +
        D.chk('BCN-P1-ACC1', 'show port-security interface FastEthernet0/2', 'El puerto con teléfono en estado Secure-up, con las MAC del teléfono y del PC aprendidas como sticky y ninguna violación.', 57) +
        D.chk('BCN-P1-ACC1', 'show running-config interface FastEthernet0/3', 'La configuración del puerto con la MAC sticky del PC guardada.', 58)],
      ['4.A1.3', 'Prueba: conexión de un equipo intruso',
        D.p('Desconectamos P1-ADM-03 de su roseta (P1-R02) y conectamos un PC nuevo con una IP fija de la VLAN 20. Cuando el PC nuevo manda el primer paquete, el switch ve una MAC que no es la autorizada y desactiva el puerto.') +
        D.p(D.sc('intruso', 'Reproducir la prueba en el Tracer')) +
        D.chk('PC intruso', 'ping 10.1.20.1', 'El PC nuevo intenta llegar a su puerta de enlace y no recibe respuesta: el switch cortó el puerto al ver su MAC.', 59) +
        D.chk('BCN-P1-ACC1', '(mensajes en la consola)', '%PORT_SECURITY-2-PSECURE_VIOLATION con la MAC del PC intruso (000C.8587.538A) y %PM-4-ERR_DISABLE, que pone Fa0/3 en estado err-disabled.', 60) +
        D.chk('BCN-P1-ACC1', 'show port-security interface FastEthernet0/3', 'Port Status: Secure-shutdown, Security Violation Count: 1 y, en Last Source Address, la MAC del PC intruso.', 61) +
        D.chk('BCN-P1-ACC1', 'show interfaces FastEthernet0/3 status', 'El puerto en estado err-disabled.', 62) +
        D.p('Para volver a dejarlo bien se quita el PC intruso, se vuelve a conectar P1-ADM-03 y en el switch se hace <code>shutdown</code> y <code>no shutdown</code> en el puerto.')]
    ]
  });

  LT.sec({
    id: '4.A2', t: 'DHCP Snooping', short: 'DHCP Snooping',
    lead: 'Solo el servidor legítimo puede repartir direcciones. Una oferta DHCP que entra por un puerto de usuario se tira.',
    sc: ['rogue', 'Conectá un servidor DHCP pirata en una toma de usuario y mirá cómo el switch descarta sus ofertas.'],
    subs: [
      ['4.A2.1', 'Qué protege y cómo',
        D.p('Todo el direccionamiento de los clientes es por DHCP. El cliente quiere evitar los dos ataques típicos contra el DHCP:') +
        D.ul(['<b>DHCP intruso (rogue DHCP)</b>: alguien conecta un servidor DHCP propio y reparte una puerta de enlace falsa para interceptar el tráfico. <b>Protección: DHCP snooping.</b> En el switch solo los puertos <i>trusted</i> pueden mandar respuestas DHCP (ofertas); en nuestros switches de acceso solo lo son los dos troncales hacia los cores, que es por donde llegan las respuestas del servidor legítimo. Cualquier oferta que llegue por un puerto de usuario se descarta.',
          '<b>Ataque de agotamiento (DHCP starvation)</b>: un equipo manda miles de peticiones con MAC inventadas hasta agotar las direcciones del servidor. <b>Protección:</b> <code>ip dhcp snooping limit rate 10</code> en cada puerto de usuario (si un puerto pasa de 10 paquetes DHCP por segundo, se desactiva) y, además, port-security, que no deja usar más MAC de las permitidas.']) +
        D.w('snoop') +
        D.p('Además, el switch apunta en la <b>tabla de bindings</b> qué IP dio el servidor a cada MAC y en qué puerto, así se sabe en todo momento quién tiene cada dirección. La opción 82 está desactivada porque el servidor DHCP del Packet Tracer no la usa y descartaría las peticiones.',
          'El servidor DHCP de cada sede está en la VLAN 50 (SRV-HV01 y SRV-ZGZ01) y los cores le reenvían las peticiones con <code>ip helper-address</code> (punto 3.A1).')],
      ['4.A2.2', 'Comprobaciones en el Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show ip dhcp snooping', 'DHCP snooping activado en las VLAN de la sede, Gi0/1 y Gi0/2 como trusted sin límite, y los puertos de usuario como untrusted con Rate limit 10.', 63) +
        D.chk('BCN-P1-ACC1', 'show ip dhcp snooping binding', 'Una línea por cada PC del switch que recibió IP: su MAC, la IP que le dio el servidor, la VLAN y el puerto. Si está vacía, se hace ipconfig /renew en P1-ADM-03 y se repite.', 64) +
        D.chk('P1-ADM-03', 'ipconfig /renew', 'Que el PC recibe la IP, la máscara, la puerta de enlace 10.1.20.1 y el DNS 10.1.50.10 del servidor legítimo.', 65)]
    ]
  });

  LT.sec({
    id: '4.A3', t: 'Protección STP (BPDU Guard y PortFast)', short: 'STP, BPDU Guard y PortFast',
    lead: 'Ningún cable es imprescindible. Spanning Tree deja un enlace de reserva bloqueado y BPDU Guard apaga cualquier switch que alguien enchufe donde no debe.',
    sc: ['trunk', 'Cortá el troncal principal de la planta 1 y mirá cómo el de reserva pasa a reenviar.'],
    subs: [
      ['4.A3.1', 'Diseño redundante y Spanning Tree',
        D.p('El cliente no quiere que ninguna parte de la empresa dependa de un solo cable. Por eso cada switch de acceso tiene dos enlaces troncales, uno a cada core, y los dos cores están unidos entre sí. Estos enlaces dobles forman bucles, y Spanning Tree (en su versión rápida, <b>Rapid PVST+</b>) los corta dejando uno de los dos enlaces bloqueado de reserva. Si el enlace activo cae, el bloqueado pasa a reenviar en uno o dos segundos.') +
        D.ul(['<b>Raíz fijada</b>: el CORE1 tiene prioridad 24576 (raíz de todas las VLAN) y el CORE2 28672 (raíz de reserva). Así el camino es siempre el mismo y no depende de qué switch se enciende primero.', '<b>Resultado</b>: en cada switch de acceso, el troncal hacia el CORE1 queda como <b>Root FWD</b> y el troncal hacia el CORE2 como <b>Altn BLK</b> (bloqueado, de reserva).']) +
        D.w('stp')],
      ['4.A3.2', 'PortFast y BPDU Guard',
        D.p('En los puertos donde va un usuario (PC, teléfono, impresora, AP) activamos dos protecciones:') +
        D.ul(['<b>PortFast</b>: el puerto pasa directamente a reenviar al conectar el equipo, sin esperar los estados de Spanning Tree. El usuario tiene red al instante y el PC recibe la IP por DHCP sin errores de tiempo de espera.', '<b>BPDU Guard</b>: un puerto de usuario no tendría que recibir nunca mensajes de Spanning Tree (BPDU). Si los recibe, es que alguien conectó un switch, y el puerto se desactiva (err-disabled). Así nadie puede crear un bucle ni intentar que su switch se convierta en la raíz de la red.']) +
        D.p('En los troncales no hay ni PortFast ni BPDU Guard, porque ahí sí tiene que haber BPDU.')],
      ['4.A3.3', 'EtherChannel entre cores y HSRP',
        D.p('Los dos cores están unidos por dos cables agrupados en un <b>EtherChannel LACP (Port-channel 1)</b>. Para Spanning Tree es un solo enlace, así que no se bloquea ninguno de los dos cables y se aprovecha el ancho de banda de ambos; si se corta uno, el otro sigue. Además, la puerta de enlace de cada VLAN es una IP virtual <b>HSRP</b> compartida por los dos cores (punto 3.A1). Con estas tres piezas (enlaces dobles con STP, EtherChannel y HSRP), la red de cada sede no depende de ningún cable ni de ningún core.') + D.w('hsrp')],
      ['4.A3.4', 'Comprobaciones en el Packet Tracer',
        D.chk('BCN-P1-ACC1', 'show spanning-tree interface FastEthernet0/3 detail', 'La línea «The port is in the portfast mode»: PortFast activo en el puerto de usuario. El 2960 del Packet Tracer no muestra la línea de BPDU Guard en este comando; su configuración se ve en el siguiente.', 66) +
        D.chk('BCN-P1-ACC1', 'show running-config interface FastEthernet0/3', 'Las líneas spanning-tree portfast y spanning-tree bpduguard enable.', 67) +
        D.chk('BCN-P1-ACC1', 'show spanning-tree vlan 20', 'La raíz es BCN-CORE1 (prioridad 24596), Gi0/1 es Root FWD y Gi0/2 es Altn BLK: hay un enlace bloqueado de reserva, que en el Sprint 1 no aparecía.', 68) +
        D.chk('BCN-CORE1', 'show spanning-tree vlan 20', '«This bridge is the root»: el CORE1 es la raíz a propósito.', 69) +
        D.chk('BCN-CORE1', 'show etherchannel summary', 'Po1(SU) con protocolo LACP y los dos puertos Gi1/0/23 y Gi1/0/24 en estado (P).', 70)],
      ['4.A3.5', 'Prueba: conexión de un switch en una toma de usuario (BPDU Guard)',
        D.p('Desconectamos P1-ADM-03 de su roseta y conectamos un switch 2960 nuevo. El switch nuevo empieza a mandar BPDU y el puerto se desactiva.') + D.p(D.sc('bpdu', 'Reproducir la prueba en el Tracer')) +
        D.chk('BCN-P1-ACC1', '(mensaje en la consola)', 'El mensaje %SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port FastEthernet0/3 with BPDU Guard enabled. Disabling port.', 71) +
        D.note('Para ver el mensaje del BPDU Guard quitamos antes el Port Security de este puerto. Si está, salta primero la violación por MAC desconocida y el puerto cae por Port Security, no por BPDU Guard. En funcionamiento normal las dos protecciones están activas a la vez y cualquiera de las dos apaga el puerto, que es lo que queremos.') +
        D.chk('BCN-P1-ACC1', 'show interfaces FastEthernet0/3 status', 'El puerto en estado err-disabled.', 72)],
      ['4.A3.6', 'Prueba: corte de un enlace troncal',
        D.p('En BCN-CORE1 apagamos el troncal hacia la planta 1 (<code>interface Gi1/0/3</code> → <code>shutdown</code>). ' + D.sc('trunk', 'Reproducir en el Tracer')) +
        D.chk('BCN-P1-ACC1', 'show spanning-tree vlan 20', 'Ahora Gi0/2 (hacia el CORE2) es Root FWD: el enlace que estaba bloqueado pasó a reenviar.', 73, 'BCN-P1-ACC1|show spanning-tree vlan 20 @cut') +
        D.chk('P1-ADM-03', 'ping 10.1.50.10', 'Con el troncal hacia el CORE1 apagado, el PC sigue llegando al servidor: el tráfico ya va por el CORE2.', 74, 'P1-ADM-03|ping 10.1.50.10 @cut')]
    ]
  });

  LT.sec({
    id: '4.B1', t: 'ACL VLAN Convidats', short: 'ACL de invitados',
    lead: 'Los invitados navegan y nada más: DHCP, DNS, HTTP y HTTPS. Todo lo demás cae en el deny final.',
    sc: ['acl-inv', 'Conectate al Wi-Fi de invitados e intentá llegar a un servidor interno.'],
    subs: [
      ['4.B1.1', 'Qué filtra',
        D.p('La VLAN 40 es el Wi-Fi de invitados. El enunciado pide que los invitados solo puedan salir a Internet con los servicios estrictamente necesarios para navegar: HTTP, HTTPS y DNS, más el DHCP para recibir la IP. Cualquier otra cosa queda bloqueada. La lista <b>ACL-INVITADOS-IN</b> se aplica de entrada en la SVI de la VLAN 40 de los dos cores, así filtra todo lo que sale de la red de invitados antes de que llegue a otra VLAN:') +
        D.ul(['Permite el DHCP (bootps), para que los invitados reciban dirección.', 'Permite el DNS (UDP 53), para resolver nombres.', 'Permite el HTTP (80) y el HTTPS (443), para navegar.', 'Deniega todo lo demás con el <code>deny ip any any</code> final: el ping (ICMP), el SSH, el FTP y cualquier otro servicio.']) +
        D.p('Los invitados reciben como DNS el DNS público (203.0.113.53) y no el de la empresa, porque no tienen que consultar ningún servicio interno. En IPv6, la lista <b>ACL6-INVITADOS-IN</b> bloquea todo el prefijo de la empresa (2001:db8:acad::/48) y permite el resto.') +
        D.p('Mandá paquetes desde un móvil de invitado y mirá qué línea de la lista los decide:') + D.w('acl', { k: 'inv' })],
      ['4.B1.2', 'Comprobaciones en el Packet Tracer',
        D.chk('P0-INV-01', 'Config → Wireless0', 'El móvil del invitado conectado al SSID LogiTrans-Invitados.', 75, 'P0-INV-01|wireless') +
        D.chk('P0-INV-01', 'ipconfig', 'Una IP de la VLAN 40 (10.1.40.11), la máscara 255.255.255.128 y la puerta de enlace 10.1.40.1, además de la dirección IPv6 del prefijo 2001:DB8:ACAD:1040::/64.', 76) +
        D.chk('P0-INV-01', 'ping 10.1.50.10', 'Destination host unreachable: el invitado no llega a los servidores de Barcelona.', 77) +
        D.chk('P0-INV-01', 'ping 10.2.50.10', 'Tampoco llega a los de Zaragoza.', 78) +
        D.chk('P0-INV-01', 'ping 203.0.113.10', 'Destination host unreachable. Los invitados no tienen ICMP hacia Internet; la ACL solo deja salir HTTP, HTTPS y DNS. Antes del cambio (Sprint 2 v4) sí respondía, porque la ACL permitía todo hacia fuera.', 79) +
        D.note('La prueba de lo que sí pasa la dan los contadores de la lista (captura siguiente): las líneas del DHCP y del DNS tienen coincidencias. No ponemos la prueba del navegador hacia la web de la empresa porque el Packet Tracer no resuelve bien el «hairpin NAT»: un equipo de dentro que va a la IP pública 85.100.1.18 de su propio router no recibe respuesta. Desde Internet la web sí carga (punto 3.C3).', 'lim') +
        D.chk('BCN-CORE1', 'show access-lists', 'Las reglas de ACL-INVITADOS-IN con los contadores: la 10 (DHCP) tiene 3 coincidencias y la 20 (DNS) 7, que es el tráfico permitido; la 50 (deny ip any any) tiene muchas más, que son los pings y el resto de tráfico bloqueado.', 80, 'BCN-CORE1|show access-lists ACL-INVITADOS-IN') +
        D.chk('BCN-CORE1', 'show running-config | include access-group|traffic-filter', 'Las líneas ip access-group ACL-INVITADOS-IN in e ipv6 traffic-filter ACL6-INVITADOS-IN in, que demuestran que la lista está aplicada.', 81) +
        D.note('En el Packet Tracer, el comando <code>show ip interface Vlan40</code> muestra «Inbound access list is not set» aunque la lista esté aplicada. Por eso la comprobación se hace con la configuración y con los contadores de la lista, que solo suben si la lista está aplicada en alguna interfaz.', 'lim')]
    ]
  });

  LT.sec({
    id: '4.B2', t: 'ACL VLAN Gestió', short: 'ACL de gestión',
    lead: 'A la VLAN de gestión solo entra el NOC. Tres capas: una ACL en la VLAN, otra en las líneas remotas y solo SSH.',
    sc: ['acl-ges', 'Intentá administrar el core desde un PC de administración y después desde el NOC.'],
    subs: [
      ['4.B2.1', 'Qué filtra',
        D.p('La VLAN 99 es la de gestión de los equipos de red y solo pueden entrar los administradores (el NOC de la P3 y la sala de gestión del almacén). La protección tiene tres capas:') +
        D.ol(['<b>ACL-GESTION-OUT</b>, aplicada de salida en la SVI de la VLAN 99: solo deja entrar en la VLAN de gestión el tráfico que viene de las redes de gestión de las dos sedes, las respuestas de los servidores (DHCP, DNS, RADIUS), las respuestas de ping y las respuestas del SSH de los routers. Un PC de cualquier otra VLAN no llega.', '<b>ACL-VTY-GESTION</b>, aplicada a las líneas VTY de routers y cores: solo se acepta una conexión remota si viene de las redes de gestión.', '<b>Solo SSH</b>: las líneas VTY tienen <code>transport input ssh</code>, así que Telnet (sin cifrar) no funciona.']) +
        D.note('La regla del SSH de los routers (<code>permit tcp 10.S.254.0 0.0.0.255 eq 22 any established</code>, que en la lista aparece como línea 80) la añadimos durante las pruebas: sin ella, el SSH del NOC a los routers no funcionaba, porque la respuesta del router (que sale de la red 10.S.254.0) no podía entrar en la VLAN de gestión. Con <code>established</code> solo entran las respuestas de conexiones que abrió el NOC; un router no puede abrir ninguna conexión nueva hacia la VLAN de gestión.', 'fix', 'Lo que aprendimos') +
        D.w('acl', { k: 'ges' })],
      ['4.B2.2', 'Comprobaciones en el Packet Tracer',
        D.chk('P1-ADM-03', 'ping 10.1.99.4', 'No responde: un PC de Administració no llega a la IP de gestión de un switch.', 82) +
        D.chk('P1-ADM-03', 'ssh -l noc.admin 10.1.99.2', 'No conecta: las líneas VTY solo aceptan conexiones de la red de gestión, aunque el usuario y la contraseña sean buenos.', 83) +
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.99.2', 'Desde el NOC sí entra, con el usuario admin.xarxa01 (prompt BCN-CORE1>).', 84) +
        D.chk('P3-GES-01', 'telnet 10.1.99.2', 'El switch abre la conexión y la cierra al instante («Connection closed by foreign host») sin pedir usuario: solo se acepta SSH.', 85) +
        D.chk('BCN-CORE1', 'show access-lists', 'Las reglas de ACL-GESTION-OUT y ACL-VTY-GESTION con los contadores: la línea 90 (deny ip any any) tiene 8 coincidencias, que son las pruebas bloqueadas, y la 30 (respuestas UDP del servidor) tiene 4. La regla del SSH de los routers es la línea 80.', 86, 'BCN-CORE1|show access-lists ACL-GESTION-OUT') +
        D.chk('BCN-CORE1', 'show running-config | include access-group|access-class', 'ip access-group ACL-GESTION-OUT out y access-class ACL-VTY-GESTION in.', 87)]
    ]
  });

  LT.sec({
    id: '4.B3', t: 'ACL VLAN Operaris', short: 'ACL de operarios',
    lead: 'Los operarios del almacén llegan a lo justo para trabajar: la base de datos, la web, el DHCP y el DNS. Nada más.',
    sc: ['acl-ope', 'Desde un terminal de muelle, abrí la web corporativa e intentá salir a Internet.'],
    subs: [
      ['4.B3.1', 'Qué filtra',
        D.p('La VLAN 30 es la de los operarios del almacén (terminales de muelle, escáneres y PC de la nave). El enunciado pide que los operarios solo lleguen a los servicios estrictamente necesarios para trabajar: la base de datos y la web corporativa de la VLAN de servidores, más el DHCP y el DNS. La lista <b>ACL-OPERARIOS-IN</b> se aplica de entrada en la SVI de la VLAN 30 de los dos cores de Zaragoza:') +
        D.ul(['Permite el DHCP (bootps), para que los terminales reciban dirección.', 'Permite el DNS (UDP 53), solo hacia el servidor de Zaragoza (10.2.50.10).', 'Permite la base de datos (TCP 3306), solo hacia SRV-HV02 (10.1.50.11).', 'Permite la web corporativa (HTTP 80 y HTTPS 443), solo hacia SRV-HV03 (10.1.50.12).', 'Deniega todo lo demás con el <code>deny ip any any</code> final: las otras VLAN, el ping y la salida a Internet.']) +
        D.w('acl', { k: 'ope' })],
      ['4.B3.2', 'Comprobaciones en el Packet Tracer',
        D.chk('ZGZ-MUE-01', 'ping 10.2.10.5', '«Reply from 10.2.30.2: Destination host unreachable»: es el core quien responde que el destino (un equipo de Direcció) no es accesible.', 88) +
        D.chk('ZGZ-MUE-01', 'ping 10.2.50.10', 'Destination host unreachable. Antes respondía; ahora, con la ACL estricta, el ICMP hacia los servidores no está permitido. Solo pasan DHCP, DNS, 3306 (BD) y 80/443 al servidor web.', 89) +
        D.chk('ZGZ-MUE-01', 'ping 10.1.50.10', 'Destination host unreachable. Los operarios tampoco llegan por ICMP a los servidores de Barcelona; solo llegan a los puertos concretos autorizados (3306 y 80/443).', 90) +
        D.chk('ZGZ-MUE-01', 'ping 203.0.113.10', 'Destination host unreachable. Antes respondía; la nueva ACL no permite salida genérica a Internet desde la VLAN 30. Los operarios no necesitan navegar libremente, solo usar los servicios corporativos.', 91) +
        D.chk('ZGZ-MUE-01', 'Web Browser → http://www.logitrans.com', 'La web corporativa carga bien: los servicios legítimos sí pasan (HTTP al 10.1.50.12), mientras que la navegación libre por Internet queda bloqueada.', 92, 'ZGZ-MUE-01|browser http://www.logitrans.com') +
        D.chk('ZGZ-CORE1', 'show access-lists', 'Las reglas de ACL-OPERARIOS-IN con los contadores: la 10 (DHCP), la 20 (DNS) y la 40 (web a 10.1.50.12) tienen coincidencias, que es el tráfico permitido, y la 60 (deny ip any any) tiene todas las pruebas bloqueadas. La 30 (base de datos) no tiene porque en el Packet Tracer no hay ninguna aplicación que se conecte a ella.', 93) +
        D.chk('ZGZ-CORE1', 'show running-config | include access-group', 'ip access-group ACL-OPERARIOS-IN in.', 94)]
    ]
  });
})();
