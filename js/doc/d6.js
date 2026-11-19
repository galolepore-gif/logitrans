/* Punto 6 de la memoria: auditoría y mitigación */
(function () {
  var LT = window.LT, D = LT.D;

  LT.sec({
    id: '6.1', t: 'Escaneo de puertos con Nmap', short: 'Escaneo con Nmap',
    lead: 'Cada puerto abierto es una puerta de entrada. Empezamos la auditoría contándolas.',
    sc: ['expo', 'Repetí la mirada desde Internet: desde PC-INTERNET solo se tiene que llegar a la web.'],
    subs: [
      ['6.1.1', 'Resultado del escaneo',
        D.p('Empezamos la auditoría mirando qué puertos tiene abiertos el servidor de la web, porque cada puerto abierto es una puerta de entrada. Hacemos un escaneo con Nmap con detección de servicios y versiones (<code>-sV</code>) contra el equipo que aloja la web en el laboratorio. Lanzalo:') +
        D.w('nmap') +
        D.chk('Equipo de auditoría', 'nmap -sV <IP del servidor web>', '994 puertos cerrados y seis abiertos: 80 y 443 (nginx), 135 (RPC de Windows), 445 (SMB) y dos desconocidos, el 1042 y el 7778.', 157) +
        D.tbl(['Puerto', 'Servicio', '¿Hace falta?', 'Qué hacemos'], [
          ['80/tcp', 'HTTP (nginx)', 'Sí, es la web', 'Se mantiene. Es lo que publica el NAT (3.C3).'],
          ['443/tcp', 'HTTPS (nginx)', 'Sí, es la web', 'Se mantiene.'],
          ['135/tcp', 'RPC de Windows', 'No para la web', 'Es un servicio del anfitrión Windows del laboratorio. Desde Internet no se llega, porque el ASA solo deja entrar el 80 y el 443 hacia el servidor web.'],
          ['445/tcp', 'SMB de Windows', 'No para la web', 'Igual que el 135.'],
          ['1042/tcp', 'Desconocido (afrog?)', 'No', 'Identificamos el proceso y lo bloqueamos (6.1.2).'],
          ['7778/tcp', 'Desconocido (interwise?)', 'No', 'Igual que el 1042.']
        ], 'Tabla 33. Puertos abiertos y decisión.', { mono: [0] })],
      ['6.1.2', 'Identificación y bloqueo de los puertos desconocidos',
        D.chk('Equipo de auditoría (PowerShell)', 'Get-NetTCPConnection -LocalPort 1042,7778 -State Listen · Get-Process -Id <PID>', 'El puerto 7778 es de ArmouryCrateControlInterface y el 1042 de asus_framework: dos programas del fabricante de la placa base (ASUS), que no tienen nada que ver con la web.', 158, 'HOST|Get-NetTCPConnection -LocalPort 1042,7778 -State Listen') +
        D.chk('Equipo de auditoría (PowerShell como administrador)', 'New-NetFirewallRule -DisplayName "LogiTrans-bloqueo-ASUS" -Direction Inbound -Protocol TCP -LocalPort 1042,7778 -Action Block', 'La regla LogiTrans-bloqueo-ASUS creada: Enabled True, Direction Inbound y Action Block.', 159, 'HOST|New-NetFirewallRule -DisplayName "LogiTrans-bloqueo-ASUS" -Direction Inbound -Protocol TCP -LocalPort 1042,7778 -Action Block')],
      ['6.1.3', 'Exposición desde Internet (Packet Tracer)',
        D.p('En el Packet Tracer repetimos la mirada desde fuera: desde PC-INTERNET solo se tiene que poder llegar a la web publicada. ' + D.sc('expo')) +
        D.chk('PC-INTERNET', 'ping 10.1.20.10 · ping 85.100.1.18', 'La dirección interna 10.1.20.10 no es accesible (Destination host unreachable) y la IP pública de la web no responde al ping (Request timed out), porque el ASA solo deja entrar HTTP y HTTPS hacia el servidor web.', 160, 'PC-INTERNET|ping 85.100.1.18') +
        D.chk('BCN-FW', 'show access-list, antes y después de navegar desde PC-INTERNET', 'Dos salidas seguidas. En la segunda, la regla 6 de OUTSIDE_IN (permit tcp any host 10.1.50.12 eq www) pasa de 0 a 7 coincidencias y la regla 10 (deny ip any any) de 0 a 4. Solo entró el tráfico web; el resto lo paró el deny final.', 161, 'BCN-FW|show access-list') +
        D.chk('BCN-RT1', 'show ip nat translations', 'Una conexión desde Internet: PC-INTERNET (203.0.113.10:1025) contra 85.100.1.18:80, traducida a 10.1.50.12:80, además de la traducción estática de la web.', 162, 'BCN-RT1|show ip nat translations @web')]
    ]
  });

  LT.sec({
    id: '6.2', t: 'Análisis de vulnerabilidades (WPScan)', short: 'Vulnerabilidades (WPScan)',
    lead: 'El escáner específico de WordPress, dos veces: sin token y con la base de datos de vulnerabilidades.',
    subs: [
      ['6.2.0', 'Qué es WPScan',
        D.p('WPScan es el escáner de vulnerabilidades específico de WordPress: detecta la versión, el tema, los plugins y los usuarios, y los compara con la base de datos de vulnerabilidades de WPScan. Para consultar esa base de datos hace falta un token de API gratuito. Lo pasamos dos veces, sin token y con token.') + D.w('wpscan')],
      ['6.2.1', 'Primera pasada, sin token',
        D.chk('Equipo de auditoría', 'wpscan --url https://logitrans.com', 'Detecta el tema propio logitrans (versión 2.0), no encuentra ningún usuario («No Users Found») y avisa de que, sin token, no puede mostrar los datos de vulnerabilidades. 1.725 peticiones en 11 segundos.', 163)],
      ['6.2.2', 'Segunda pasada, con token',
        D.chk('Equipo de auditoría', 'wpscan --url https://logitrans.com --disable-tls-checks --no-update --enumerate vp,vt,u --plugins-detection passive --format cli-no-color --api-token [OCULTO]', 'El comando completo, con el token oculto, y la URL analizada.', 164) +
        D.chk('Equipo de auditoría', 'resultado de la segunda pasada', '«No plugins Found» (ningún plugin vulnerable), «No themes Found» (ningún tema vulnerable), «No Users Found», la consulta a la base de datos con el plan gratuito («WPScan DB API OK») y 1.980 peticiones en 14 segundos.', 165)],
      ['6.2.3', 'Interpretación',
        D.ul(['No hay ningún plugin ni tema con vulnerabilidades conocidas.', 'No se pueden enumerar los usuarios, así que un atacante no sabe qué nombre de usuario atacar. Además, la fuerza bruta la bloquea Wordfence (5.B1.3).', 'El tema propio se detecta, lo que es normal porque sale en el código de la página, y no tiene vulnerabilidades registradas.', 'Usamos <code>--disable-tls-checks</code> porque en el laboratorio el certificado HTTPS es autofirmado. En producción la web tendrá un certificado válido, por ejemplo de Let\'s Encrypt.', 'La dirección que sale en el resultado (192.168.65.254) es la del anfitrión de Docker en el laboratorio, no la del diseño.'])]
    ]
  });

  LT.sec({
    id: '6.3', t: 'Documentación de mitigación (OWASP y C2/C3)', short: 'Mitigación (OWASP, C2, C3)',
    lead: 'Lo que encontró la auditoría, qué hicimos con cada cosa y cómo está protegida la infraestructura frente al OWASP Top 10 y los ataques de capa 2 y 3.',
    sc: ['l2check', 'Repetí las pruebas de capa 2 en otro switch (BCN-P0-ACC1) y comprobá el cifrado de la VPN.'],
    subs: [
      ['6.3.1', 'Hallazgos de la auditoría y medidas aplicadas',
        D.p('Este punto cierra la auditoría. Recoge lo que encontraron las pruebas de los puntos 6.1 y 6.2 y qué hicimos, y después explica cómo está protegida la infraestructura frente al OWASP Top 10 y frente a los ataques más habituales de capa 2 y de capa 3.') +
        D.tbl(['Hallazgo', 'Riesgo', 'Medida', 'Estado'], [
          ['Puertos 1042 y 7778 abiertos por software de ASUS', 'Medio: servicios innecesarios escuchando', 'Regla de firewall LogiTrans-bloqueo-ASUS (6.1.2)', '<span class="chip ok">Aplicado</span> Falta la captura del segundo escaneo.'],
          ['Puertos 135 y 445 abiertos en el anfitrión', 'Bajo: desde Internet no se llega', 'El ASA solo deja entrar el 80 y el 443 hacia 10.1.50.12 (3.C3)', '<span class="chip ok">Comprobado</span> Desde fuera solo se llega a la web (6.1.3).'],
          ['Wordfence en versión Free: reglas con 30 días de retraso y WAF en modo básico', 'Medio', 'Fuerza bruta al 100 %. En producción, protección ampliada y versión Premium', '<span class="chip warn">Mejora</span> Para la puesta en producción.'],
          ['Certificado HTTPS autofirmado', 'Bajo', 'Certificado válido en producción', '<span class="chip warn">Mejora</span> Para la puesta en producción.'],
          ['WPScan: sin vulnerabilidades ni usuarios enumerables', '—', 'Mantener WordPress y las imágenes actualizados', '<span class="chip ok">Correcto</span>'],
          ['Invitados con salida a todo Internet (versión anterior de la ACL)', 'Medio', 'ACL-INVITADOS-IN reducida a DHCP, DNS, HTTP y HTTPS (4.B1)', '<span class="chip ok">Aplicado</span>'],
          ['Operarios con acceso a toda la VLAN de servidores (versión anterior de la ACL)', 'Medio', 'ACL-OPERARIOS-IN reducida a DHCP, DNS, base de datos y web (4.B3)', '<span class="chip ok">Aplicado</span>']
        ], 'Tabla 34. Hallazgos de la auditoría y mitigación.')],
      ['6.3.2', 'Protección frente al OWASP Top 10',
        D.p('El OWASP Top 10 (versión 2021) es la lista de los diez riesgos más importantes de las aplicaciones web. Así protegemos el WordPress y el área de clientes. Girá cada carta:') +
        D.w('owasp') +
        D.tbl(['Riesgo', 'Cómo lo protegemos', 'Punto'], LT.OWASP.map(function (o) { return ['<b>' + o[0] + '</b> · ' + o[1], o[2], o[3]]; }), 'Tabla 35. Protección del WordPress y del área de clientes frente al OWASP Top 10.')],
      ['6.3.3', 'Protección frente a los ataques de capa 2',
        D.p('Elegí un ataque y lanzalo contra el switch de acceso. Cada uno muestra cómo lo frena la red y en qué punto está configurado.') +
        D.w('attacks', { layer: 2 }) +
        D.tbl(['Ataque', 'En qué consiste', 'Cómo lo frenamos', 'Punto'], LT.ATTACKS.filter(function (a) { return a.layer === 2; }).map(function (a) { return ['<b>' + a.name + '</b>', a.how, a.defHow, a.ref]; }), 'Tabla 36. Protección frente a los ataques de capa 2.')],
      ['6.3.4', 'Protección frente a los ataques de capa 3',
        D.w('attacks', { layer: 3 }) +
        D.tbl(['Ataque', 'En qué consiste', 'Cómo lo frenamos', 'Punto'], LT.ATTACKS.filter(function (a) { return a.layer === 3; }).map(function (a) { return ['<b>' + a.name + '</b>', a.how, a.defHow, a.ref]; }), 'Tabla 37. Protección frente a los ataques de capa 3.')],
      ['6.3.5', 'Verificación de las medidas de red',
        D.p('Para cerrar la auditoría volvimos a probar en el Packet Tracer las medidas de capa 2 en un switch distinto del de las pruebas del bloque 4 (BCN-P0-ACC1), y el cifrado de la VPN entre sedes.') +
        D.chk('BCN-P0-ACC1', 'show port-security · show port-security interface fa0/6', 'Arriba, Fa0/1 (punto de acceso) con máximo 64 y Restrict, y Fa0/5, Fa0/6 y Fa0/7 con máximo 1 y Shutdown. Abajo, Fa0/6 en Secure-up con la MAC sticky 0030.BB2E.0743.', 166, 'BCN-P0-ACC1|show port-security') +
        D.chk('BCN-P0-ACC1', 'show port-security interface fa0/6, después de conectar otro equipo', 'Secure-shutdown, Security Violation Count 1 y la MAC del equipo nuevo (0030.BB2E.0742).', 167, 'BCN-P0-ACC1|show port-security interface fa0/6 @viol') +
        D.chk('BCN-P0-ACC1', 'show ip dhcp snooping · show ip dhcp snooping binding', 'Arriba, DHCP snooping en las VLAN 10, 20, 40 y 99, los troncales Gi0/1 y Gi0/2 de confianza y los puertos de usuario con límite de 10. Abajo, la tabla de bindings con tres equipos, cada uno con su MAC, IP, VLAN y puerto.', 168, 'BCN-P0-ACC1|show ip dhcp snooping binding') +
        D.chk('BCN-RT1', 'show crypto isakmp sa · show crypto ipsec sa', 'La VPN con ZGZ-RT1 activa (QM_IDLE y ACTIVE) y los paquetes entre sedes cifrados y descifrados (#pkts encrypt 91 y #pkts decrypt 89).', 169, 'BCN-RT1|show crypto ipsec sa') +
        D.note('Con estas pruebas la auditoría queda cerrada: desde Internet solo se llega a la web, los servicios del servidor web no tienen vulnerabilidades conocidas, los puertos innecesarios se cerraron y las medidas de capa 2 y capa 3 funcionan tanto en los switches de las pruebas como en el resto.', 'fix', 'Conclusión')]
    ]
  });
})();
