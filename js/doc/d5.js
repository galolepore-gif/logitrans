/* Punto 5 de la memoria: servicios */
(function () {
  var LT = window.LT, D = LT.D;
  /* Tabla 34 completa de la memoria: GPO, qué hace, por qué */
  LT.GPO_FULL = [
    ['GPO-LogiTrans-Seguridad', 'Directiva base de seguridad del dominio. Entre otras cosas, activa el firewall de Windows Defender en los tres perfiles (5.C2).', 'Que ningún equipo del dominio quede sin la configuración mínima.', 'Dominio'],
    ['GPO-Contrasenas-Bloqueo', 'Contraseñas de 8 caracteres como mínimo y bloqueo de la cuenta después de 3 intentos fallidos.', 'Evita contraseñas débiles y ataques de fuerza bruta.', 'Dominio'],
    ['GPO-Bloqueo-Pantalla', 'Activa el salvapantallas después de un tiempo sin actividad y pide la contraseña para desbloquear.', 'Si un usuario se levanta del puesto, nadie puede usar su sesión.', 'Usuario'],
    ['GPO-Bloqueo-USB', 'Deniega la lectura y la escritura en los dispositivos de almacenamiento extraíbles.', 'Evita la fuga de información y la entrada de malware por USB.', 'Equipo'],
    ['GPO-BitLocker', 'Permite activar BitLocker en equipos sin chip TPM, como las máquinas virtuales.', 'Para que los discos de los clientes se puedan cifrar (5.C1).', 'Equipo'],
    ['GPO-Redireccion-Docs', 'Redirige la carpeta Documentos del usuario a la carpeta de red \\\\SRV-AD\\Perfiles.', 'Los documentos quedan en el servidor, cifrados y protegidos por el RAID, y no en el PC (5.C1).', 'Usuario'],
    ['GPO-Unidades-Mapeadas', 'Conecta \\\\SRV-AD\\Departaments en la letra S: al iniciar sesión.', 'Cada usuario encuentra la carpeta de su departamento sin configurar nada.', 'Usuario'],
    ['GPO-Carpetas-Magatzem', 'Configuración propia de los equipos de la OU Magatzem, como la carpeta compartida del departamento.', 'Los terminales del almacén tienen su propio entorno.', 'OU Magatzem']
  ];

  LT.sec({
    id: '5.A1', t: 'Active Directory (logitrans.local) y OU', short: 'Active Directory y OU',
    lead: 'Un solo punto de autenticación para toda la empresa: el inicio de sesión, el Wi-Fi corporativo y hasta los equipos Cisco validan contra el mismo directorio.',
    subs: [
      ['5.A1.0', 'Punto de partida',
        D.p('El cliente quiere que el Active Directory sea el punto central de autenticación: los usuarios inician sesión en el sistema operativo con su cuenta del dominio, el Wi-Fi corporativo valida contra el mismo directorio y los equipos Cisco también (punto 5.A2). Instalamos el rol AD DS en un Windows Server 2022 (SRV-AD) y creamos el dominio <b>logitrans.local</b>.')],
      ['5.A1.1', 'Entorno de laboratorio de los servicios',
        D.p('El Packet Tracer no puede ejecutar un Windows Server, un WordPress ni un FOG. Por eso los servicios de este bloque los montamos en máquinas virtuales (VirtualBox) y en contenedores Docker, y en el Packet Tracer simulamos solo la parte de red (DHCP, DNS, RADIUS y web en SRV-HV01 y SRV-HV03). La tabla relaciona cada servicio con dónde lo montamos y con el equipo del diseño que lo hará en la instalación real.') +
        D.tbl(['Servicio', 'Dónde lo montamos en el laboratorio', 'Equipo del diseño'], [
          ['Active Directory, DNS, DHCP, NPS (RADIUS) y carpetas de red', 'Máquina virtual Windows Server 2022 SRV-AD', 'SRV-HV01 (10.1.50.10) en Barcelona; SRV-ZGZ01 (10.2.50.10) como segundo controlador de dominio en el almacén'],
          ['Clientes del dominio', 'Máquina virtual Windows 11 unida a logitrans.local y máquina virtual Windows 10 para la prueba de BitLocker', 'Puestos de trabajo de las dos sedes'],
          ['WordPress, área de clientes y streaming (Jellyfin)', 'Cinco contenedores Docker (docker compose) en un equipo anfitrión Windows', 'SRV-HV03 (10.1.50.12), publicado en Internet por 85.100.1.18'],
          ['Repositorio de medios', 'Carpeta compartida C:\\Repositorio en el equipo anfitrión (BYWAAKE), con grupos locales que se llaman igual que los del AD', 'SRV-HV02, con los grupos del dominio'],
          ['FOG (despliegue de imágenes)', 'Máquina virtual Ubuntu con FOG Project en una red interna aislada (192.168.50.0/24)', 'Taller IT de la planta 0, en la VLAN 50'],
          ['Auditoría (Nmap y WPScan)', 'Desde el equipo anfitrión contra la web del laboratorio', '—']
        ], 'Tabla 30. Entorno de laboratorio y equipo del diseño de cada servicio.') +
        D.p('Los nombres de los grupos, de los usuarios y de las carpetas son los mismos que tendrá la instalación real, así que la configuración se puede llevar a los servidores del diseño sin cambiar nada.')],
      ['5.A1.2', 'Unidades organizativas, grupos y usuarios',
        D.p('Creamos una OU por departamento, con su grupo de seguridad y dos usuarios de ejemplo, como pedía el cliente (no hace falta dar de alta a los 500 usuarios). Los permisos nunca se dan a un usuario suelto: se dan al grupo del departamento, y el usuario los hereda por ser miembro. Cuando entra una persona nueva, solo hay que meterla en el grupo que toca.') +
        D.w('aduc') +
        D.tbl(['OU', 'Grupo de seguridad', 'Usuarios de ejemplo'], LT.AD.map(function (o) { return [o.ou, o.group, o.users.map(function (u) { return '<code>' + u[0] + '</code> (' + u[1] + ')'; }).join(', ')]; }), 'Tabla 31. Unidades organizativas, grupos y usuarios de ejemplo.') +
        D.chk('SRV-AD', 'Server Manager → Tools → Active Directory Users and Computers', 'El dominio logitrans.local con las OU Administracio, Convidats, Direccio, Gestio, Magatzem y Servidors. Con la OU Administracio seleccionada se ven el grupo Grupo-Administracio y los dos usuarios de ejemplo, Laura Castellanos y Pablo Martin.', 95)],
      ['5.A1.3', 'Permisos de cada departamento',
        D.p('El cliente nos pedía pensar qué permisos tiene cada departamento. Los resumimos aquí; cada uno se aplica en el punto que se indica. Elegí un grupo y una acción:') +
        D.w('perm') +
        D.tbl(['Grupo', 'Qué puede hacer', 'Dónde se aplica'], [
          ['Grupo-Direccio', 'Modificar la carpeta de su departamento y leer el repositorio.', 'Permisos NTFS (5.C1) y repositorio (5.D)'],
          ['Grupo-Administracio', 'Modificar la carpeta de su departamento y leer el repositorio.', 'Permisos NTFS (5.C1) y repositorio (5.D)'],
          ['Grupo-Magatzem', 'Modificar la carpeta de su departamento, leer el repositorio y ver los vídeos de formación del almacén.', 'Permisos NTFS (5.C1), repositorio y Jellyfin (5.D)'],
          ['Grupo-Gestio', 'Administrar los switches y routers por SSH, modificar el repositorio y leer los registros del antivirus.', 'NPS (5.A2), repositorio (5.D) y carpeta de registros (5.C2)'],
          ['Grupo-Servidors', 'Administrar los servidores.', 'Administradores de los servidores'],
          ['Grupo-Convidats', 'Ningún acceso a recursos internos.', 'Wi-Fi de invitados en la VLAN 40 (4.B1)']
        ], 'Tabla 32. Permisos por grupo.')],
      ['5.A1.4', 'Equipos unidos al dominio e inicio de sesión',
        D.p('El cliente Windows 11 está unido al dominio y el usuario entra con su cuenta del AD, por ejemplo <code>LOGITRANS\\admin.rrhh</code> (Pablo Martin, de Administració). Lo comprobamos con <code>gpresult /r</code> (punto 5.A3.2): muestra el usuario <code>CN=Pablo Martin,OU=Administracio,DC=logitrans,DC=local</code>, el dominio LOGITRANS y las directivas que le mandó SRV-AD. Es decir, el equipo es del dominio y la sesión la validó el controlador de dominio, no el equipo local.') +
        D.w('login')],
      ['5.A1.5', 'DHCP y DNS del dominio',
        D.p('SRV-AD también hace de servidor DHCP y DNS. Creamos un ámbito por cada VLAN de las dos sedes con las mismas redes y puertas de enlace que en el Packet Tracer (punto 3.A1). Las peticiones de los clientes llegan a través de los cores con <code>ip helper-address</code> (relay DHCP), igual que en el Packet Tracer.') +
        D.chk('SRV-AD', 'Server Manager → Tools → DHCP → IPv4', 'Los once ámbitos: VLAN 10, 20, 40, 50 y 99 de Barcelona (10.1.X.0) y VLAN 10, 20, 30, 40, 50 y 99 de Zaragoza (10.2.X.0).', 96) +
        D.p('Los equipos que tienen que tener siempre la misma dirección pero no son de red, como las impresoras, tienen una reserva en el DHCP en lugar de una IP puesta a mano. Así siguen siendo «por DHCP», como pide el cliente, y la dirección no cambia nunca.') +
        D.chk('SRV-AD', 'DHCP → Scope [10.2.30.0] VLAN 30 - Magatzem ZGZ → Reservations', 'La reserva [10.2.30.20] ZGZ-ETQ-02, la impresora de etiquetas del almacén.', 97) +
        D.p('En el DNS, además de la zona del dominio (logitrans.local), creamos la zona <b>logitrans.com</b>, que resuelve www.logitrans.com a la IP interna del servidor web (10.1.50.12). Es el DNS de horizonte dividido del punto 3.C3: desde dentro la web se resuelve a la IP privada y el tráfico no sale a Internet; desde fuera, el DNS público la resuelve a 85.100.1.18.') +
        D.chk('SRV-AD', 'Server Manager → Tools → DNS → Forward Lookup Zones', 'Las zonas _msdcs.logitrans.local, logitrans.local y logitrans.com, integradas en el Active Directory y en estado Running.', 98) +
        D.chk('SRV-AD', 'DNS → Reverse Lookup Zones', 'Las zonas inversas 10.in-addr.arpa y 50.1.10.in-addr.arpa, para que una consulta inversa (PTR) de una dirección interna devuelva el nombre del equipo.', 99)]
    ]
  });

  LT.sec({
    id: '5.A2', t: 'Autenticación de red RADIUS / 802.1X', short: 'RADIUS / 802.1X',
    lead: 'Ni los switches ni los routers guardan las contraseñas de los administradores: se las preguntan al servidor RADIUS, que valida contra el Active Directory.',
    sc: ['radius', 'Entrá por SSH al core con un usuario que solo existe en el servidor RADIUS.'],
    subs: [
      ['5.A2.1', 'Autenticación centralizada de los equipos Cisco (AAA)',
        D.p('El cliente quiere que la autenticación de los switches y routers no sea local sino contra el Active Directory. Los equipos Cisco lo hacen con <b>AAA</b>: en lugar de comprobar el usuario y la contraseña en su propia configuración, se lo preguntan a un servidor RADIUS. En la instalación real ese servidor es el NPS de SRV-AD, que valida contra el Active Directory (punto 5.A2.4). En el Packet Tracer lo simulamos con el servicio AAA de SRV-HV01 (Barcelona) y SRV-ZGZ01 (Zaragoza), donde dimos de alta los mismos usuarios de la OU Gestio.') +
        D.tbl(['Elemento', 'Configuración'], [
          ['Equipos que autentican por RADIUS', 'Los routers de cada sede (RT1 y RT2) y los cores (CORE1 y CORE2)'],
          ['Servidor RADIUS', 'SRV-HV01 10.1.50.10 (Barcelona) y SRV-ZGZ01 10.2.50.10 (Zaragoza), puerto 1645 y clave compartida'],
          ['Orden de autenticación', 'Primero RADIUS; si el servidor no responde, el usuario local de emergencia (admin.local)'],
          ['Consola', 'Siempre local, para poder entrar aunque la red esté caída'],
          ['Usuarios en el servidor', 'admin.xarxa01 y admin.xarxa02, los dos usuarios de la OU Gestio del Active Directory'],
          ['Acceso remoto', 'Solo SSH v2 y solo desde la red de gestión (punto 4.B2)']
        ], 'Tabla 33. Autenticación AAA de los equipos Cisco.') +
        D.note('Los switches de acceso 2960 del Packet Tracer no tienen los comandos de AAA con servidor RADIUS, así que usan el usuario local. En los switches reales (Catalyst 9300) la configuración sería la misma que en los cores.', 'lim')],
      ['5.A2.2', 'Wi-Fi corporativo',
        D.p('En el Packet Tracer los tres SSID (<b>LogiTrans-Corp</b> en la VLAN 20, <b>LogiTrans-Almacen</b> en la VLAN 30 y <b>LogiTrans-Invitados</b> en la VLAN 40) están configurados con WPA2-PSK y cifrado AES, porque los puntos de acceso del simulador no hacen bien el 802.1X. En la instalación real, los dos SSID corporativos usan <b>WPA2-Enterprise (802.1X)</b> contra el NPS, y cada empleado entra al Wi-Fi con su usuario del Active Directory (punto 5.A2.4). El SSID de invitados se queda con WPA2-PSK, porque los invitados no tienen cuenta en el dominio; está aislado por la VLAN 40 y su ACL (4.B1).') +
        D.w('dot1x')],
      ['5.A2.3', 'Comprobaciones en el Packet Tracer',
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.99.2', 'El NOC entra al core con el usuario admin.xarxa01, que no existe en el switch sino solo en el servidor RADIUS: la contraseña la validó SRV-HV01.', 100) +
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.254.1', 'Lo mismo contra el router BCN-RT1 (prompt BCN-RT1>).', 101) +
        D.chk('P3-GES-01', 'ssh -l admin.xarxa01 10.1.99.2 (contraseña incorrecta)', '«% Login invalid»: el servidor rechaza la contraseña y la vuelve a pedir.', 102, 'P3-GES-01|ssh -l admin.xarxa01 10.1.99.2 @bad') +
        D.chk('BCN-RT1', 'show running-config | section aaa', 'aaa new-model y las listas de autenticación: la default con RADIUS y, si no responde, local; la CONSOLA, local.', 103) +
        D.chk('BCN-RT1', 'show ip ssh', 'SSH Enabled - version 2.0.', 104) +
        D.chk('SRV-HV01', 'Services → AAA', 'El servicio activado en el puerto 1645, los equipos de Barcelona dados de alta como clientes RADIUS con su IP y la clave, y los usuarios admin.xarxa01 y admin.xarxa02.', 105, 'SRV-HV01|aaa')],
      ['5.A2.4', 'Servidor RADIUS real (NPS) y 802.1X',
        D.p('En la instalación real el servidor RADIUS es el rol <b>Network Policy Server (NPS)</b> de SRV-AD, registrado en el Active Directory para poder leer las cuentas y los grupos. Dimos de alta como clientes RADIUS los equipos que le hacen las preguntas: los controladores Wi-Fi de las dos sedes y el core de Barcelona.') +
        D.chk('SRV-AD', 'Network Policy Server → RADIUS Clients', 'Los clientes WLC-BCN (10.1.99.20), WLC-ZGZ (10.2.99.2) y Core-BCN (10.1.99.2), todos en estado Enabled. Todas las direcciones son de la VLAN 99 de gestión.', 106) +
        D.p('Las directivas de red del NPS deciden quién puede entrar y adónde:') +
        D.ul(['<b>WiFi-LogiTrans-Corp</b>: da acceso al SSID corporativo (VLAN 20) a los usuarios del dominio que se identifican con su usuario y contraseña por 802.1X.', '<b>WiFi-LogiTrans-Almacen</b>: lo mismo para el SSID del almacén (VLAN 30).', '<b>AAA-Switches-TI</b>: autoriza la entrada por SSH a los switches y routers solo a los miembros de Grupo-Gestio, que son los mismos usuarios que usamos en el Packet Tracer (5.A2.3).']) +
        D.chk('SRV-AD', 'Network Policy Server → Policies → Network Policies', 'Las tres directivas activadas (Enabled), con el orden de procesamiento 1, 2 y 3 y el tipo de acceso Grant Access.', 107) +
        D.chk('Cliente Windows 11', 'Inicio → Sistema → Configuración avanzada', 'En la pestaña «Nombre de equipo», el valor «Dominio:» es logitrans.local: el equipo está unido al dominio.', 108)]
    ]
  });

  LT.sec({
    id: '5.A3', t: 'Políticas de grupo (GPO)', short: 'Políticas de grupo (GPO)',
    lead: 'Ocho directivas que configuran la seguridad de todos los equipos y usuarios a la vez, sin ir equipo por equipo.',
    subs: [
      ['5.A3.1', 'GPO aplicadas',
        D.p('Con las directivas de grupo (GPO) aplicamos la misma configuración de seguridad a todos los equipos y usuarios sin ir equipo por equipo. Creamos ocho GPO y las vinculamos al dominio o a la OU que toca. Hacé clic en cada una:') +
        D.w('gpo') +
        D.tbl(['GPO', 'Qué hace', 'Por qué'], LT.GPO_FULL.map(function (g) { return ['<code>' + g[0] + '</code>', g[1], g[2]]; }), 'Tabla 34. GPO de LogiTrans.') +
        D.chk('SRV-AD', 'Group Policy Management → Group Policy Objects', 'Las ocho GPO creadas en Group Policy Objects y, arriba del árbol, las que están vinculadas directamente al dominio logitrans.local.', 109)],
      ['5.A3.2', 'Comprobación en el cliente',
        D.p('Para comprobar que las GPO llegan, iniciamos sesión en el cliente Windows 11 con <code>LOGITRANS\\admin.rrhh</code> (Pablo Martin, OU Administracio) y hacemos <code>gpresult /r</code>.') +
        D.chk('Cliente Windows 11', 'gpresult /r', 'El usuario CN=Pablo Martin,OU=Administracio,DC=logitrans,DC=local, el dominio LOGITRANS, el controlador SRV-AD.logitrans.local y, en «Objetos de directiva de grupo aplicados», GPO-Bloqueo-Pantalla, GPO-Redireccion-Docs y GPO-Unidades-Mapeadas. Son las GPO de la parte de usuario; el resto se aplican a la configuración del equipo.', 110, 'WIN11|gpresult /r')]
    ]
  });

  LT.sec({
    id: '5.B1', t: 'WordPress corporativo (LAMP/LEMP)', short: 'WordPress corporativo',
    lead: 'Cinco contenedores, una sola puerta: solo nginx publica puertos hacia fuera.',
    subs: [
      ['5.B1.0', 'Arquitectura',
        D.p('La web corporativa es un WordPress sobre una pila <b>LEMP</b> (Linux, Nginx, MariaDB y PHP-FPM). En lugar de instalarlo todo en una sola máquina, cada pieza va en su contenedor Docker y se levantan juntas con <code>docker compose</code>. Así cada servicio está aislado, se puede actualizar por separado y toda la web se lleva a SRV-HV03 copiando la carpeta del proyecto.')],
      ['5.B1.1', 'Pila de contenedores',
        D.w('docker') +
        D.tbl(['Contenedor', 'Imagen', 'Puerto', 'Función'], LT.DOCKER.map(function (c) { return ['<b>' + c.name + '</b>', '<code>' + c.image + '</code>', c.port + (c.pub ? ' (publicados)' : ' (interno)'), c.role]; }), 'Tabla 35. Contenedores de la web.') +
        D.p('Solo nginx publica puertos hacia fuera (80 y 443). La base de datos, el WordPress, la aplicación de clientes y el Jellyfin solo escuchan en la red interna de Docker, así que desde fuera no se llega a ellos directamente.') +
        D.chk('Equipo anfitrión', 'docker compose up -d --wait', 'Los cinco contenedores levantados y en estado Healthy.', 111, 'HOST|docker compose up -d --wait') +
        D.chk('Equipo anfitrión', 'docker compose ps', 'Los cinco contenedores Up (healthy) y la columna de puertos: solo logitrans-web-nginx-1 tiene 0.0.0.0:80->80/tcp y 0.0.0.0:443->443/tcp; el resto solo tiene el puerto interno.', 112, 'HOST|docker compose ps')],
      ['5.B1.2', 'Web corporativa',
        D.p('La portada presenta LogiTrans (transporte y logística entre Barcelona y Zaragoza), los servicios, las sedes y el contacto, y tiene el botón «Área de clientes» que lleva a /clients. El contenido solo lo puede editar el usuario administrador <code>logitrans</code>.') +
        D.chk('Navegador', 'https://logitrans.com', 'La portada de la web, con la sesión del administrador abierta (arriba, «Hola, logitrans»).', 113) +
        D.chk('Navegador', 'Página de acceso de WordPress (wp-admin)', 'El acceso al panel de administración de WordPress con el usuario logitrans.', 114)],
      ['5.B1.3', 'Firewall de aplicación (WAF) con Wordfence',
        D.p('El enunciado pide un módulo de firewall de aplicación en el WordPress. Instalamos <b>Wordfence</b> en su versión gratuita y lo registramos con una licencia Free. Wordfence filtra las peticiones antes de que lleguen a WordPress y bloquea los patrones de ataque conocidos (inyección SQL, XSS, inclusión de archivos) y los intentos de adivinar contraseñas. Mandale peticiones:') +
        D.w('waf') +
        D.chk('WordPress', 'Wordfence → registro de la licencia', 'La página de instalación de la licencia Free para https://logitrans.com. Avisa de que, con la versión gratuita, las reglas del firewall y las firmas de malware llegan con 30 días de retraso.', 115) +
        D.chk('WordPress', 'Wordfence → All Options → Wordfence License', 'License Status: Free License Active.', 116) +
        D.chk('WordPress', 'Wordfence → Firewall', '«Wordfence Firewall Activated», las reglas de la comunidad (70 %, con el retraso de 30 días de la versión Free), la protección contra fuerza bruta al 100 % y la lista de bloqueo de IP en tiempo real desactivada, que solo está en la versión Premium.', 117) +
        D.p('El WAF está en modo básico (35 %). Para llegar al 100 % hay que activar la protección ampliada, que hace que Wordfence se ejecute antes que el propio WordPress.')],
      ['5.B1.4', 'Comprobación en el Packet Tracer',
        D.p('En el Packet Tracer la web se simula con el servicio HTTP de SRV-HV03, publicado en Internet por el NAT estático (punto 3.C3).') +
        D.chk('PC-INTERNET', 'Web Browser → http://85.100.1.18', 'La página de LogiTrans servida por SRV-HV03 a través de la IP pública 85.100.1.18, con el enlace al área de clientes.', 118, 'PC-INTERNET|browser http://85.100.1.18')]
    ]
  });

  LT.sec({
    id: '5.B2', t: 'Configuración del área de clientes', short: 'Área de clientes',
    lead: 'Mismo dominio, aplicación independiente. Un ataque al WordPress no toca el área de clientes, y al revés.',
    subs: [
      ['5.B2.0', 'Cómo está hecha',
        D.p('El área de clientes está en <b>logitrans.com/clients</b>, en el mismo dominio que la web, pero es una aplicación independiente: está hecha en Python, corre con Gunicorn en su propio contenedor (clients) y tiene sus propios usuarios, que no tienen nada que ver con los de WordPress. Nginx es quien reparte: lo que empieza por /clients va a la aplicación de clientes y el resto a WordPress. Es lo que pedía el cliente: se entra desde el mismo sitio, pero se gestiona por separado.')],
      ['5.B2.1', 'Acceso privado y panel de envíos',
        D.p('Esta es una réplica funcional del área de clientes. Entrá con el usuario <code>cliente1</code> y la contraseña <code>demo</code>:') +
        D.w('portal') +
        D.chk('Navegador', 'https://logitrans.com/clients', 'La página de acceso privado, con su propio formulario de usuario y contraseña y un enlace para volver a la web corporativa. No es el login de WordPress.', 119) +
        D.chk('Navegador', 'Acceso con el usuario cliente1', 'El panel del cliente: la empresa Transportes Norte S.L. (contacto Marta) con 3 envíos, 2 en curso y 1 entregado.', 120) +
        D.chk('Navegador', 'Panel → Tus envíos', 'La lista de envíos del cliente, cada uno con la referencia, la mercancía, la ruta, el estado (en almacén, en tránsito o entregado) y la fecha de actualización.', 121)],
      ['5.B2.2', 'Medidas de seguridad',
        D.p('La aplicación de clientes tiene dos protecciones propias, además de las de la web:') +
        D.ul(['<b>Fuerza bruta</b>: después de varios intentos fallidos, el acceso queda bloqueado unos segundos, y un programa no puede probar contraseñas a toda velocidad. Probalo en la réplica de arriba con una contraseña mala.', '<b>Control de acceso</b>: cada cliente solo ve sus envíos. Si pide un envío que no es suyo, la aplicación responde como si no existiera y apunta el intento en el registro.']) +
        D.chk('Navegador', 'varios intentos de acceso con una contraseña incorrecta', '«Demasiados intentos. Espera 60 segundos.»', 122) +
        D.chk('Navegador (sesión de cliente1)', 'https://logitrans.com/clients/envio/LT-2026-0201', 'Error 404 «No hemos encontrado lo que buscas»: el envío LT-2026-0201 es de otro cliente, y la aplicación ni siquiera dice si existe.', 123) +
        D.chk('Equipo anfitrión (PowerShell)', 'docker compose logs clients | Select-String ENVIO_NO_AUTORIZADO', 'La entrada del registro con la fecha y la hora: ENVIO_NO_AUTORIZADO usuario=cliente1 ref=\'LT-2026-0201\'. El intento queda apuntado para la auditoría.', 124)]
    ]
  });

  LT.sec({
    id: '5.C1', t: 'Almacenamiento RAID 5 y cifrado', short: 'RAID 5 y BitLocker',
    lead: 'Si falla un disco, la empresa sigue. Si roban un disco, no se llevan nada legible.',
    subs: [
      ['5.C1.0', 'Qué pide el cliente',
        D.p('El cliente quiere dos cosas: que si falla un disco de un servidor la empresa siga funcionando, y que si alguien roba un equipo no pueda sacar ninguna información. La primera la resolvemos con <b>RAID 5</b> y la segunda con <b>BitLocker</b>, tanto en el servidor como en los clientes.')],
      ['5.C1.1', 'RAID 5 con Storage Spaces',
        D.p('Los servidores reales (Dell PowerEdge R450, punto 2.B2) llevan controladora RAID de hardware. La máquina virtual no tiene, así que hicimos el RAID 5 con <b>Storage Spaces</b>, el almacenamiento por software de Windows Server: un grupo de discos (<b>Pool-RAID</b>) con tres discos de 5 GB y, encima, un disco virtual (<b>Disco-Datos</b>) con distribución <b>Parity</b>. Parity es el RAID 5 de Storage Spaces: reparte los datos y la paridad entre los tres discos, y si falla uno el volumen sigue funcionando. Sobre el disco virtual creamos el volumen <b>R: (Datos-RAID)</b>, donde van las carpetas de la empresa.') +
        D.w('raid') +
        D.chk('SRV-AD', 'Server Manager → File and Storage Services → Storage Pools', 'El grupo Pool-RAID y el disco virtual Disco-Datos de 6 GB con layout Parity y aprovisionamiento Fixed.', 125) +
        D.note('Después de reiniciar, el Server Manager de la máquina virtual solo muestra uno de los tres discos físicos del grupo (en la imagen anterior, VBOX HARDDISK). Es un problema de visualización del Server Manager en VirtualBox; el estado real de los discos lo miramos desde PowerShell.', 'lim', 'Nota') +
        D.chk('SRV-AD (PowerShell)', 'Get-PhysicalDisk', 'Los cuatro discos del servidor: el 0 de 50 GB, que es el del sistema, y los tres de 5 GB del RAID, todos con OperationalStatus OK y HealthStatus Healthy.', 126, 'SRV-AD|Get-PhysicalDisk')],
      ['5.C1.2', 'Prueba: fallo de un disco',
        D.p('Con el servidor encendido quitamos uno de los tres discos en VirtualBox, que es lo que pasaría si se rompiera. Hacé lo mismo en el esquema de arriba: tocá un disco.') +
        D.chk('SRV-AD', 'Server Manager → Storage Pools, con un disco desconectado', 'Pool-RAID, Disco-Datos y el disco físico salen con el aviso amarillo: el RAID queda degradado, pero no se para. Para volver a la normalidad se añade un disco nuevo al grupo y se repara el disco virtual (Repair-VirtualDisk).', 127)],
      ['5.C1.3', 'Cifrado con BitLocker',
        D.p('Todo lo sensible se cifra con BitLocker: el volumen R: del servidor, donde están los datos de la empresa, y el disco C: de los clientes. Si alguien se lleva un disco, sin la contraseña o la clave de recuperación solo encuentra datos cifrados.') +
        D.chk('SRV-AD', 'Explorador de archivos → This PC', 'El volumen Datos-RAID (R:) con el candado de BitLocker. Sale abierto porque el servidor lo está usando.', 128) +
        D.p('Al activar BitLocker, Windows genera una clave de recuperación. La exportamos a un archivo de texto y la guardamos fuera del disco cifrado. En la instalación real también se guarda en el objeto del equipo en el Active Directory, para que TI la pueda recuperar si un usuario olvida la contraseña.') +
        D.chk('SRV-AD', 'Explorador de archivos → Desktop', 'El archivo de la clave de recuperación del servidor («BitLocker Recovery Key ADD742A9-…»).', 129) +
        D.chk('Cliente Windows 11', 'Explorador → Volumen datos secundario (T:) → textos', 'La clave de recuperación del cliente («Clave de recuperación de BitLocker B18E…») guardada en un volumen distinto del cifrado.', 130) +
        D.p('Las máquinas virtuales de los clientes no tienen chip TPM, y BitLocker por defecto no se deja activar sin él. Por eso la GPO-BitLocker activa la opción «Permitir BitLocker sin un TPM compatible», que en lugar del TPM pide una contraseña al arrancar. Lo probamos en un cliente Windows 10.') +
        D.chk('Cliente Windows 10', 'Directivas → Equipo → Plantillas administrativas → Componentes de Windows → Cifrado de unidad BitLocker → Unidades del sistema operativo → Requerir autenticación adicional al iniciar', 'La directiva Habilitada, con la casilla «Permitir BitLocker sin un TPM compatible» marcada.', 131) +
        D.chk('Cliente Windows 10 (cmd como administrador)', 'gpupdate /force', 'Las directivas de equipo y de usuario actualizadas correctamente, sin esperar el refresco automático.', 132, 'WIN10|gpupdate /force') +
        D.chk('Cliente Windows 10', 'Panel de control → Sistema y seguridad → Cifrado de unidad BitLocker', 'El cifrado activado en la unidad C:, que pide reiniciar para terminar.', 133) +
        D.chk('Cliente Windows 10', 'arranque del equipo', 'Antes de cargar Windows, BitLocker pide la contraseña para desbloquear la unidad.', 134) +
        D.chk('Cliente Windows 10 (cmd como administrador)', 'manage-bde -status', 'El volumen C: cifrado al 100 % con XTS-AES 128, la protección activada y los protectores de clave Contraseña y Contraseña numérica, que es la clave de recuperación.', 135, 'WIN10|manage-bde -status')],
      ['5.C1.4', 'Prueba: robo del disco',
        D.p('Para simular un robo, conectamos el disco cifrado del cliente a una máquina con Ubuntu e intentamos abrirlo desde el explorador de archivos. Hacé vos de ladrón:') +
        D.w('theft') +
        D.chk('Máquina Ubuntu', 'Archivos → Otras ubicaciones → volumen del disco cifrado', '«No se pudo acceder al lugar»: Ubuntu no reconoce ningún sistema de archivos (wrong fs type, bad superblock), porque el contenido está cifrado. Sin la contraseña no se puede leer nada.', 136)],
      ['5.C1.5', 'Dónde guardan los documentos los usuarios',
        D.p('El enunciado nos pide decidir dónde tienen los usuarios los documentos de trabajo. La decisión es que <b>no se guardan en el PC, sino en el servidor</b>:') +
        D.ul(['La carpeta Documentos de cada usuario se redirige a <code>\\\\SRV-AD\\Perfiles</code> con la GPO-Redireccion-Docs.', 'Cada departamento tiene su carpeta en <code>R:\\Departaments</code>, que los usuarios ven como unidad S: (GPO-Unidades-Mapeadas).']) +
        D.w('docflow') +
        D.p('Así los documentos de la empresa están siempre en el volumen R:, cifrado con BitLocker y protegido por el RAID 5. Si se roba o se rompe un PC no se pierde ni se expone ningún documento, y si un usuario cambia de puesto encuentra sus documentos igual.',
          'Cada carpeta de departamento tiene la herencia desactivada y solo tiene acceso el grupo del departamento (Modificar), además de SYSTEM, Administrators y CREATOR OWNER (Control total). El resto de usuarios no puede entrar.') +
        D.chk('SRV-AD', 'R:\\Departaments\\Gestio → Propiedades → Seguridad → Opciones avanzadas', 'Los permisos de la carpeta Gestio: Grupo-Gestio (LOGITRANS\\Grupo-Gestio) con Modify, y CREATOR OWNER, SYSTEM y Administrators con Full control, sin herencia.', 137)]
    ]
  });

  LT.sec({
    id: '5.C2', t: 'Firewall local del SO y antivirus', short: 'Firewall local y antivirus',
    lead: 'Además del ASA perimetral, cada equipo tiene su firewall, un antivirus con análisis programado y unos registros que solo puede leer Gestión.',
    subs: [
      ['5.C2.0', 'Qué usamos',
        D.p('Además del firewall perimetral (ASA, punto 3.C3), cada equipo tiene su firewall local y un antivirus que analiza el sistema de forma periódica. Usamos las herramientas de Windows: el <b>firewall de Windows Defender</b> y <b>Microsoft Defender Antivirus</b>.')],
      ['5.C2.1', 'Firewall local',
        D.p('El firewall está activado en los tres perfiles (Dominio, Privado y Público) con la política de bloquear por defecto: todo lo que entra y no coincide con una regla se bloquea. La configuración llega por la <b>GPO-LogiTrans-Seguridad</b>, y por eso Windows avisa de que algunos parámetros los controla la directiva de grupo.') +
        D.w('fwlocal') +
        D.chk('SRV-AD', 'Windows Defender Firewall with Advanced Security', 'Domain, Private y Public con «Windows Defender Firewall is on» e «Inbound connections that do not match a rule are blocked», y el aviso «some settings are controlled by Group Policy».', 138) +
        D.p('En el servidor solo están habilitadas las reglas de entrada de los servicios que presta: DNS, compartición de archivos (SMB, para las carpetas de los departamentos), los servicios básicos de red (Core Networking) y el NPS (RADIUS). Windows crea estas reglas al instalar cada rol; por eso salen habilitadas las del NPS: son las que necesita el servidor RADIUS para recibir las peticiones de los equipos de red, y no hay ninguna más.') +
        D.chk('SRV-AD', 'Windows Defender Firewall → Inbound Rules', 'Las reglas de DNS (UDP y RPC) y de File and Printer Sharing (SMB-In, ping y NetBIOS) habilitadas.', 139) +
        D.chk('SRV-AD', 'Windows Defender Firewall → Inbound Rules (continuación)', 'Arriba, las reglas Core Networking (DHCP, IPv6, ICMPv6 y Teredo); debajo, la regla Network Policy Server (RADIUS Authentication), todas habilitadas.', 140) +
        D.p('Cuando un puerto no hace falta, se cierra con una regla de bloqueo. Lo hicimos durante la auditoría con dos puertos que abría un programa del fabricante de la placa base (punto <a href="#/s/6.1">6.1.2</a>).')],
      ['5.C2.2', 'Antivirus con análisis programado',
        D.p('El antivirus es Microsoft Defender, que ya viene con Windows y se actualiza solo. El análisis periódico lo hace la tarea <b>«Windows Defender Scheduled Scan»</b> del Programador de tareas, con dos desencadenadores: uno cada día a las 5:27 y otro cada viernes a las 20:30.') +
        D.w('avsched') +
        D.chk('SRV-AD', 'Task Scheduler → Library → Microsoft → Windows → Windows Defender', 'La tarea Windows Defender Scheduled Scan en estado Ready y, en la pestaña Triggers, los desencadenadores Daily a las 5:27 y Weekly los viernes a las 20:30.', 141)],
      ['5.C2.3', 'Registros del antivirus solo para Gestió',
        D.p('El enunciado pide que los registros de los análisis solo se puedan consultar desde la VLAN de Gestió. Los guardamos en una carpeta compartida del servidor (<code>\\\\SRV-AD\\Logs</code>) con los permisos de compartición y NTFS solo para <b>Grupo-Gestio</b> (lectura), además de SYSTEM y Administrators. Las cuentas de Grupo-Gestio son las de los técnicos de red, que trabajan desde el NOC de la planta 3 y la sala de gestión del almacén, los dos en la VLAN 99. Cualquier otro usuario recibe «Acceso denegado».') +
        D.w('logs') +
        D.chk('SRV-AD', 'R:\\Logs-Defender → Propiedades → Seguridad → Opciones avanzadas', 'Grupo-Gestio con permiso de lectura y ejecución (Read & execute), más SYSTEM, Administrators y CREATOR OWNER con control total (Full control), sin permisos heredados (Inherited from: None).', 142)]
    ]
  });

  LT.sec({
    id: '5.D', t: 'Repositorio de medios corporativos', short: 'Repositorio y Jellyfin',
    lead: 'Programas, documentos, manuales, imágenes del sistema y vídeos. Todos leen, solo Gestión escribe, y los vídeos se ven pero no se descargan.',
    subs: [
      ['5.D.0', 'Qué pide el cliente',
        D.p('El cliente quiere un repositorio con el material de la empresa (programas, documentos, manuales, imágenes del sistema y vídeos) y que los vídeos se puedan ver en streaming pero no descargar, para que no salgan del servidor.')],
      ['5.D.1', 'Estructura y permisos',
        D.p('Creamos el repositorio con un script de PowerShell (<code>repositorio-comun.ps1</code>) que hace tres cosas: crea las carpetas, les aplica los permisos y comparte la carpeta en la red. En el laboratorio lo montamos en el equipo anfitrión (BYWAAKE) con grupos locales que se llaman igual que los del AD; en la instalación real va en SRV-HV02 con los grupos del dominio.') +
        D.tbl(['Carpeta', 'Contenido'], [['Documentos', 'Documentos corporativos: procedimientos, políticas y plantillas.'], ['ImagenesSO', 'Imágenes del sistema operativo, las que usa FOG (punto 5.E).'], ['Manuales', 'Manuales de uso, por ejemplo el de acceso al Wi-Fi y a la VPN.'], ['Software', 'Instaladores de los programas autorizados.'], ['Videos', 'Vídeos de formación y presentaciones, que se ven por streaming con Jellyfin.']], 'Tabla 36. Carpetas del repositorio.') +
        D.p('El criterio de permisos es sencillo: <b>todos pueden leer</b> (ver los manuales y usar los instaladores), pero <b>solo Grupo-Gestio puede modificar</b>. Así un usuario no puede borrar nada ni añadir programas no autorizados.') +
        D.chk('Equipo anfitrión (PowerShell)', 'powershell -ExecutionPolicy Bypass -File .\\repositorio-comun.ps1 -CrearUsuariosPrueba', 'Las cinco carpetas creadas, los permisos de la raíz (Grupo-Gestio Modificar (M), Usuarios lectura y ejecución (RX), SYSTEM y Administradores control total (F)) y el recurso compartido \\\\BYWAAKE\\Repositorio.', 143) +
        D.chk('Equipo anfitrión', 'Explorador de archivos → C:\\Repositorio', 'Las carpetas Documentos, ImagenesSO, Manuales, Software y Videos.', 144) +
        D.chk('Equipo anfitrión', 'Explorador de archivos → C:\\Repositorio\\Software', 'Arriba, la carpeta Software del repositorio con VLC y 7-Zip; debajo, la carpeta del proyecto de donde sale el instalador de VLC (vlc-3.0.23-win64.exe). El 7-Zip es un acceso directo porque ya estaba instalado en el equipo antes de montar el repositorio.', 145)],
      ['5.D.2', 'Prueba de permisos',
        D.p('Abrimos una consola con el usuario <code>operari.picking01</code>, del grupo Magatzem, e intentamos modificar el repositorio. Probalo con distintos usuarios:') +
        D.w('repo') +
        D.chk('Equipo anfitrión', 'runas /user:BYWAAKE\\operari.picking01 powershell · del C:\\Repositorio\\Manuales\\Manual-de-acceso-Wi-Fi-y-VPN.pdf', 'whoami confirma que somos operari.picking01, y el borrado falla con «Acceso denegado a la ruta de acceso».', 146) +
        D.chk('Equipo anfitrión (sesión de operari.picking01)', 'dir C:\\Repositorio\\Manuales\\Manual-de-acceso-Wi-Fi-y-VPN.pdf', 'El manual sigue en su sitio: el usuario lo puede ver y leer, pero no borrar.', 147) +
        D.chk('Equipo anfitrión (sesión de operari.picking01)', 'mkdir C:\\Repositorio\\Software\\prueba', '«Acceso denegado»: un usuario normal tampoco puede añadir nada a la carpeta de software.', 148)],
      ['5.D.3', 'Vídeos en streaming con Jellyfin',
        D.p('Para los vídeos usamos <b>Jellyfin</b>, un servidor multimedia de código abierto que va en el contenedor jellyfin (5.B1). Los vídeos están organizados en bibliotecas (Administración, Almacén, Dirección y Formación) y cada usuario solo ve las suyas. El usuario de ejemplo <code>alm1</code>, del almacén, ve la biblioteca Almacén y la de Formación, que es para todo el personal.') +
        D.w('jelly') +
        D.chk('Navegador (usuario alm1)', 'Jellyfin → Inicio', '«Mis contenidos» con las bibliotecas Almacén y Formación, y los vídeos recientes de cada una: Manejo-de-carretillas, Seguridad-informatica y Bienvenida-nuevos-empleados.', 149) +
        D.chk('Navegador (usuario alm1)', 'reproducción de Bienvenida-nuevos-empleados', 'El vídeo se reproduce por streaming dentro del navegador.', 150) +
        D.chk('Navegador (usuario alm1)', 'reproductor → configuración', 'Las opciones del reproductor (relación de aspecto, velocidad, calidad, repetición y datos de reproducción): ninguna permite descargar el archivo.', 151) +
        D.chk('Jellyfin (administrador)', 'Panel de control → Usuarios → alm1', '«Permitir descargas de medios» desmarcado. En «Permitir borrar contenido desde» se ven las cuatro bibliotecas sin marcar: el usuario no puede borrar ningún vídeo.', 152) +
        D.p('Con la descarga desactivada, el usuario solo recibe el flujo del vídeo mientras lo mira; el archivo no sale del servidor.')]
    ]
  });

  LT.sec({
    id: '5.E', t: 'Repositorio de despliegue de software', short: 'Despliegue con FOG',
    lead: 'Si llegan diez equipos nuevos, se ponen a trabajar en minutos: una imagen plantilla y arranque por red.',
    subs: [
      ['5.E.0', 'Cómo funciona',
        D.p('El cliente quiere que, si llegan diez equipos nuevos, se puedan poner a trabajar enseguida con una plantilla preparada. Lo hacemos con <b>FOG Project</b>: preparamos un equipo maestro con Windows y todo lo que necesita, capturamos su imagen y la desplegamos por red (PXE) en los equipos nuevos.',
          'En el laboratorio FOG corre en una máquina Ubuntu dentro de una red interna aislada (192.168.50.0/24), porque hace de servidor de arranque por red y no queríamos que interfiriera con las otras redes. En la instalación real va en el taller IT de la planta 0 (punto 0.1), conectado a la VLAN 50.') +
        D.w('fog')],
      ['5.E.1', 'Panel de FOG',
        D.chk('Navegador', 'http://192.168.50.1/fog/management', 'El panel de FOG: el servidor web 192.168.50.1, el nodo de almacenamiento con 30 GiB libres y 7 GiB ocupados (la imagen capturada) y la gráfica de imágenes de los últimos 30 días, con las tareas del 15 de noviembre.', 153)],
      ['5.E.2', 'Imagen plantilla',
        D.p('El equipo maestro es un Windows 10 ya configurado. Su imagen se llama <b>win10-base</b> y es la plantilla de todos los despliegues.') +
        D.chk('Navegador', 'FOG → Image Management → All Images', 'La imagen win10-base (x86_64, sector 512n/512e), activada, protegida contra borrado y capturada el 15/11/2026.', 154)],
      ['5.E.3', 'Equipos y despliegue',
        D.p('Cada equipo se registra en FOG por su dirección MAC. Después se lanza la tarea: <b>Capture</b> en el equipo maestro para crear la imagen, y <b>Deploy</b> en los equipos nuevos, que arrancan por red y la restauran. Si llegan muchos equipos a la vez, el botón <b>Multi-Cast</b> manda la imagen a todos de golpe.') +
        D.chk('Navegador', 'FOG → Host Management → All Hosts', 'Los dos equipos registrados: master-win, que es el equipo maestro, y pc-nuevo01, el equipo nuevo.', 155) +
        D.chk('Navegador', 'FOG → Task Management → Recent', 'Las dos tareas terminadas (Complete): el Capture de master-win y el Deploy de win10-base en pc-nuevo01.', 156) +
        D.p('Cuando termina el Deploy, pc-nuevo01 arranca con el mismo Windows que el equipo maestro y ya se puede poner a trabajar.')]
    ]
  });
})();
