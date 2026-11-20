/* Puntos 0 y 2 de la memoria: planos e infraestructura física */
(function () {
  var LT = window.LT, D = LT.D;

  LT.sec({
    id: '0', t: 'Planos de las instalaciones', short: 'Planos de las instalaciones',
    lead: 'Antes de entrar en los puntos de la rúbrica, las dos sedes. Todo el proyecto (cableado, armarios, VLAN y Packet Tracer) parte de estos planos.',
    subs: [
      ['0.0', 'Las dos sedes de LogiTrans',
        D.tbl(['Sede', 'Ubicación', 'Superficie', 'Puestos', 'Uso principal'], [
          ['<b>Oficina central</b>', 'One Parc Central, C/ Marroc 33, 22@, 08018 Barcelona', '4 plantas × 1.000 m² (40 × 25 m)', '302 puestos en los planos', 'Dirección, administración, tráfico y operaciones, CPD'],
          ['<b>Almacén</b>', 'Nave P3 · PLAZA (Plataforma Logística), 50197 Zaragoza', '9.000 m² (150 × 60 m) en una planta', '28 de oficina + terminales de muelle y Wi-Fi', 'Recepción, almacenaje, preparación y expedición']
        ], 'Tabla 1. Las dos sedes de LogiTrans.') +
        D.w('sites') +
        D.p('Los dos edificios son naves diáfanas compartimentadas con tabiques de pladur. En las dos sedes el cableado va en estrella: un armario principal (el CPD en Barcelona y el cuarto de comunicaciones en Zaragoza) del que sale fibra OM4 hacia los armarios secundarios (IDF), y de ahí cable Cat 6A hasta cada toma, sin pasar nunca de 90 m de cobre.',
          'Cada sala de los planos indica la VLAN que le corresponde, y es la misma VLAN que tienen los equipos de esa sala en el Packet Tracer. Los planos son los archivos .drawio que se entregan con el proyecto; aquí va una imagen de cada planta con su explicación.')],
      ['0.1', 'Oficina central · Planta baja (P0)',
        D.p('Es la planta de acceso y la que aloja el corazón de la red. Tiene <b>30 puestos de trabajo, 12 puntos de acceso Wi-Fi y 2 switches de acceso</b>.') +
        D.ul(['<b>Zona pública</b> ' + D.vl(40) + ' (Wi-Fi de invitados): vestíbulo y recepción con control de acceso (128,29 m²), comedor y cafetería (93,84 m²), office y cocina, sala polivalente y sala de visitas.',
          '<b>Zona de trabajo</b> ' + D.vl(20) + ': sala de formación (127,62 m²), archivo general y paquetería y mensajería.',
          '<b>CPD</b> (21,74 m²) ' + D.vl(50) + ': un único rack de 42U (R1) con los dos cores, el firewall, los dos routers, el acceso de la P0, los servidores y el SAI de los equipos críticos. Queda espacio para un segundo rack de reserva. De aquí sube la fibra por el montante hacia los IDF de las otras plantas.',
          '<b>Taller IT</b> (15,22 m²): junto al CPD, banco para preparar equipos nuevos con FOG (arranque por red PXE).',
          '<b>Almacén IT</b> (22,77 m²) para el material de recambio, y <b>RITI</b> (30,89 m²), por donde entran las dos fibras de los operadores por canalizaciones independientes.']) +
        D.w('plan', { f: 'p0' })],
      ['0.2', 'Oficina central · Planta primera (P1)',
        D.p('Planta de tráfico y operaciones, la que tiene más gente: <b>117 puestos de trabajo, 14 puntos de acceso y 4 switches de acceso</b> en el IDF-P1.') +
        D.ul(['Open space de operaciones y flota (381,62 m²) y open space de tráfico (254,62 m²), los dos en la VLAN 20, con una caja de suelo de 6 tomas bajo cada bloque de 6 puestos.',
          'Sala de planificación de rutas con videowall para el seguimiento GPS de la flota y sala de reuniones ' + D.vl(20) + '.',
          'Despacho del jefe de tráfico ' + D.vl(10) + ' y office con zona de café ' + D.vl(40) + '.',
          '<b>IDF-P1</b>: rack de 42U en el montante, con SAI propio y la fibra que baja al CPD.']) +
        D.w('plan', { f: 'p1' })],
      ['0.3', 'Oficina central · Planta segunda (P2)',
        D.p('Planta de administración y finanzas: <b>93 puestos de trabajo, 14 puntos de acceso y 3 switches de acceso</b> en el IDF-P2.') +
        D.ul(['Open space de finanzas y contabilidad y open space de compras y comercial (254,62 m² cada uno) ' + D.vl(20) + '.',
          'RRHH y selección, sala de reuniones, videoconferencia, archivo administrativo y reprografía ' + D.vl(20) + '.',
          'Despacho del jefe de administración ' + D.vl(10) + ' y office ' + D.vl(40) + '.']) +
        D.p('La distribución sigue la misma retícula que la P1, con el IDF-P2 en el mismo punto del montante.') +
        D.w('plan', { f: 'p2' })],
      ['0.4', 'Oficina central · Planta tercera (P3)',
        D.p('Planta de dirección y gestión de la red: <b>62 puestos de trabajo, 14 puntos de acceso y 3 switches de acceso</b> en el IDF-P3.') +
        D.ul(['<b>Dirección</b> ' + D.vl(10) + ': despachos de dirección general, subdirección, dirección financiera, comercial y de operaciones, sala de juntas, videoconferencia y secretaría de dirección.',
          'Open space de control de gestión, sala de reuniones y archivo de dirección ' + D.vl(20) + '.',
          '<b>NOC</b> (45,84 m²) y <b>laboratorio IT</b> con maqueta de red (62,34 m²) ' + D.vl(99) + ': desde aquí se administran todos los equipos de red y se prueban los cambios antes de aplicarlos.',
          'Office de dirección ' + D.vl(40) + '.']) +
        D.p('A la derecha del plano están el NOC y el laboratorio IT, que son los únicos espacios de la oficina en la VLAN de gestión.') +
        D.w('plan', { f: 'p3' })],
      ['0.5', 'Almacén de Zaragoza',
        D.p('Nave de 150 × 60 m en una sola planta. Tiene <b>28 puestos de oficina</b> con PC y teléfono IP, <b>9 terminales de muelle</b>, <b>17 puntos de acceso</b> (12 industriales en la nave y 5 en las oficinas), <b>12 cámaras IP</b>, 4 impresoras de oficina y 7 de etiquetas y <b>4 switches</b> repartidos entre dos armarios.') +
        D.ul(['<b>Nave</b> ' + D.vl(30) + ': zona de recepción (1.065,60 m²) y de expedición (1.434,24 m²) junto a los 9 muelles, zona de almacenaje con estanterías (3.811,50 m²), preparación de pedidos y embalaje, devoluciones y sala de carga de baterías de las carretillas.',
          '<b>Oficinas</b> (en el extremo oeste): dirección local ' + D.vl(10) + ', administración y sala de reuniones ' + D.vl(20) + ', oficina de muelles ' + D.vl(30) + ', sala de conductores y comedor ' + D.vl(40) + ', sala de gestión de redes ' + D.vl(99) + ' y vestuarios.',
          '<b>Cuarto de comunicaciones</b> (45 m²) ' + D.vl(50) + ': rack R1 de 42U con el router, el firewall, los cores y el servidor local. <b>IDF-02</b>: armario mural de 12U en la otra punta de la nave, unido con fibra OM4 porque la distancia supera los 90 m del cobre.']) +
        D.w('plan', { f: 'zgz' })]
    ]
  });

  LT.sec({
    id: '2.A1', t: 'Selección de medios', short: 'Selección de medios',
    lead: 'El cableado es lo que menos se ve y lo que más cuesta arreglar una vez puesto: obliga a abrir techos y parar zonas enteras. Por eso se elige pensando en quince años, no en el año que viene.',
    subs: [
      ['2.A1.1', 'Criterio de selección',
        D.p('PC, teléfonos, cámaras, AP y servidores dependen del cable que tienen detrás. Elegimos el medio con tres criterios:') +
        D.ul(['<b>Durabilidad.</b> Un cableado bien hecho tiene que durar 15 a 20 años sin tocarlo, aunque los switches y los PC se cambien por el camino. Mientras el cable aguante, la infraestructura se mantiene.',
          '<b>Normativa.</b> Cubierta LSZH obligatoria en edificios de pública concurrencia (RD 842/2002 y CTE DB-SI), y respetar los límites de distancia de TIA-568 / ISO 11801: máximo 90 m de enlace permanente en cobre más 10 m de latiguillos.',
          '<b>Margen de crecimiento.</b> Hoy la red va a 1 Gb, pero el cable elegido tiene que permitir subir a 10 Gb sin cambiarlo.'])],
      ['2.A1.2', 'Esquema general',
        D.p('Cada sede funciona en estrella: un armario principal (el CPD en la planta baja de Barcelona y el cuarto de comunicaciones en el oeste de la nave de Zaragoza) del que sale fibra OM4 hasta los armarios secundarios (IDF), y de ahí cobre Cat 6A hasta cada roseta de usuario. Entre las dos sedes, VPN IPsec por Internet.',
          'Se respeta siempre el límite de 90 m de cobre de TIA-568; cuando la distancia es mayor, se pasa a fibra OM4.') + D.w('star')],
      ['2.A1.3', 'Tipo de cable por tramo',
        D.w('media') +
        D.tbl(['Tramo', 'Cable', 'Velocidad', 'Por qué'], [
          ['Rack → roseta de usuario', 'Cat 6A U/FTP, cubierta LSZH', '10 Gb', 'Estándar actual para instalaciones nuevas. Soporta PoE+ (teléfonos IP, AP y cámaras) y deja margen para subir a 10 Gb sin cambiar el cable. LSZH es obligatoria.'],
          ['Troncal entre armarios de una sede (CPD ↔ IDF)', 'Fibra OM4 multimodo, 12 fibras', '2 × 10 Gb por planta', 'Distancias largas sin pérdidas. Dos enlaces por planta, por caminos distintos, para tener redundancia física.'],
          ['Acometida del operador (RITI → CPD)', 'Fibra monomodo del operador', '1 Gb por operador', 'La trae el proveedor de Internet; nosotros ponemos el ODF en el RITI. Dos operadores distintos, una fibra cada uno.'],
          ['Enlace entre sedes (VPN IPsec)', 'FTTH 1 Gb + 4G/5G de respaldo', '1 Gb', 'Fibra contratada al operador. El 4G/5G es el respaldo del almacén si cae la fibra.']
        ], 'Tabla 2. Medios elegidos según el tramo.')],
      ['2.A1.4', 'Por qué Cat 6A y no Cat 6 o Cat 7',
        D.w('compare', { k: 'cat' })],
      ['2.A1.5', 'Por qué OM4 y no OM3 u OM5',
        D.w('compare', { k: 'om' })],
      ['2.A1.6', 'Distancias reales frente al límite de la norma',
        D.p('Todas las distancias del proyecto quedan claramente por debajo de los límites de TIA-568. Pasá el ratón por cada barra para ver el margen que queda.') +
        D.w('dist') +
        D.p('El tramo de 135 m entre el cuarto de comunicaciones y el IDF-02 es el motivo por el que el almacén necesita dos armarios: con un solo armario en el oeste, el cobre no llegaría a la mitad este de la nave (pasaría del límite de 90 m).')],
      ['2.A1.7', 'Colores de latiguillo',
        D.p('Para distinguir de un vistazo qué hay conectado en cada puerto del rack, los latiguillos siguen el mismo código de colores en las dos sedes:') + D.w('patch')]
    ]
  });

  LT.sec({
    id: '2.A2', t: 'Normativa de etiquetado y canalización', short: 'Etiquetado y canalización',
    lead: 'Un cable mal etiquetado obliga a tirar de él a mano para encontrarlo. Uno bien etiquetado se encuentra en segundos.',
    subs: [
      ['2.A2.1', 'Criterio y formato del código de etiquetado',
        D.p('Cada cable lleva etiqueta en los dos extremos, y cada roseta, panel de parcheo y armario también. Elegí un elemento y armá su etiqueta:') +
        D.w('label') +
        D.tbl(['Elemento', 'Formato', 'Ejemplo', 'Significa'], [
          ['Rack / armario', 'R##', 'R1 · R2 · IDF-P1', 'Rack principal del CPD, rack secundario del CPD, armario del IDF de la planta 1'],
          ['Patch panel', 'PP##', 'PP01 · PP02', 'Primer y segundo panel del rack que lo contiene'],
          ['Puerto de un panel', 'PP##-###', 'PP02-17', 'Puerto 17 del segundo panel'],
          ['Puerto de patch (microetiqueta)', '## (01-48)', '39', 'Microetiqueta en el puerto'],
          ['Roseta de pared o caja de suelo', 'P#-R## · P#-CS##', 'P1-R17 · P2-CS07', 'Roseta 17 de la planta 1 · caja de suelo 7 de la planta 2'],
          ['Puerto de roseta', 'P#-R##-#', 'P1-R17-2', 'Segundo conector de la roseta 17 de la planta 1'],
          ['Toma de muelle (almacén)', 'M##', 'M05', 'Terminal del muelle 5'],
          ['Enlace de fibra', 'FO-ORIGEN-DESTINO-##', 'FO-CPD-IDFP2-01', 'Primer enlace de fibra del CPD hacia el IDF-P2'],
          ['Punto de acceso', 'AP-##', 'AP-07', 'AP número 7 (igual que en el plano)'],
          ['Firewall', '[rack]-FW##', 'R1-FW01', 'Pegatina frontal'],
          ['Router', '[rack]-RT##', 'R5-RT01', 'Pegatina frontal'],
          ['SAI', 'SAI-[zona]#', 'SAI-CPD1 · SAI-IDF2', 'Vinilo frontal']
        ], 'Tabla 4. Sistema de etiquetado.', { mono: [1, 2] })],
      ['2.A2.2', 'Dónde va la etiqueta',
        D.ul(['<b>Cable de cobre</b>: en los dos extremos, a 10 cm del conector, con etiqueta encintada tipo «bandera» (se lee por las dos caras).',
          '<b>Fibra</b>: igual, pero con etiqueta termorretráctil resistente al rozamiento.',
          '<b>Roseta</b>: en el frontal, debajo del conector.',
          '<b>Panel de parcheo</b>: encima de cada puerto.',
          '<b>Armario</b>: en la puerta frontal, parte superior.',
          '<b>Latiguillo</b>: solo si no sigue el código de colores del punto 2.A1.7 (por ejemplo, un latiguillo azul que por fuerza va en un enlace troncal porque se acabó el amarillo).'])],
      ['2.A2.3', 'Canalizaciones: tipos y recorrido',
        D.p('Separamos canalizaciones horizontales (dentro de una planta, por el falso techo), verticales (montante entre plantas) y de almacén (nave industrial).') +
        D.w('ducts') +
        D.h('Oficina de Barcelona') +
        D.ul(['<b>Horizontal (P0, P1, P2, P3).</b> Bandeja metálica perforada tipo rejiband, acero galvanizado Sendzimir, 300 × 60 mm, colgada del forjado del falso techo con soportes cada 1,5 m. Recorre los dos pasillos principales de cada planta (norte-sur y este-oeste). En cada bloque de 6 puestos, bajada vertical hasta una caja de suelo con 6 tomas RJ45 Cat 6A. En despachos individuales y salas de reuniones, bajada hasta una toma doble de pared.',
          '<b>Montante vertical (P0 ↔ P1 ↔ P2 ↔ P3).</b> Tubo de acero galvanizado de 125 mm de diámetro en el patinillo técnico que une el CPD de la P0 con los tres IDF de las plantas superiores. Por él pasa solo fibra OM4 (2 enlaces redundantes por planta).',
          '<b>CPD y taller IT.</b> Bandeja metálica de 200 × 60 mm para el conexionado interior entre racks y taller, más canalización elevada bajo el suelo técnico del CPD.',
          '<b>RITI → CPD.</b> Dos canalizaciones independientes, una por operador, con tubo corrugado ignífugo de 50 mm y entradas opuestas en el edificio.']) +
        D.h('Almacén de Zaragoza') +
        D.ul(['<b>Nave industrial.</b> Bandeja metálica perforada de 400 × 100 mm, suspendida a 6 m de altura sobre el pasillo principal de carretillas, el pasillo sur y la línea de muelles. Cruza la nave entera sin competir con la iluminación ni con las estanterías altas. En cada muelle, bajada hasta una toma RJ45 para el terminal, protegida con caja IP54.',
          '<b>Oficinas auxiliares (zona oeste).</b> Bandeja de 300 × 60 mm por falso techo, igual que en Barcelona.',
          '<b>Cuarto de comunicaciones → IDF-02.</b> Bandeja metálica dedicada de 200 × 60 mm suspendida a 6 m, que recorre los 150 m de la nave de oeste a este sobre el pasillo principal. Por ella pasa solo la fibra OM4 (2 enlaces redundantes).'])],
      ['2.A2.4', 'Material de las canalizaciones',
        D.tbl(['Elemento', 'Material', 'Por qué'], [
          ['Bandeja horizontal 300 × 60 mm (oficina)', 'Acero galvanizado Sendzimir, perforada', 'Resistente, ligera, galvanizada en caliente para no oxidarse, disipa calor y es fácil de montar en el falso techo.'],
          ['Bandeja horizontal 400 × 100 mm (almacén)', 'Acero galvanizado Sendzimir, perforada', 'La misma razón, con más sección porque lleva más cables y tramos más largos (90 m hasta el IDF-02).'],
          ['Montante vertical (oficina)', 'Tubo de acero galvanizado Ø 125 mm', 'Protección mecánica y continuidad eléctrica (tierra). El patinillo técnico ya tiene reserva ignífuga EI-120.'],
          ['Bajada a caja de suelo', 'Tubo flexible corrugado de PVC libre de halógenos', 'Flexible para pasar entre las vigas del forjado técnico. Libre de halógenos porque la cubierta LSZH no tiene sentido si el tubo los desprende.'],
          ['Entrada RITI', 'Tubo corrugado ignífugo Ø 50 mm', 'Cumple el RD 346/2011 (ICT) para entradas de operador.'],
          ['Caja de suelo', 'Acero inoxidable con tapa de latón, 6 conectores RJ45', 'Se camina por encima: tiene que aguantar carga y humedad.'],
          ['Toma de pared', 'Marco de PVC con conector RJ45 Cat 6A', 'Despachos y salas individuales.']
        ], 'Tabla 5. Material de las canalizaciones.')],
      ['2.A2.5', 'Metros de canalización a comprar',
        D.tbl(['Tipo', 'Zona', 'Metros estimados'], [
          ['Bandeja 300 × 60 mm (acero galvanizado perforado)', 'Oficina BCN · pasillos P0 a P3', '4 × 80 m = 320 m'],
          ['Bandeja 400 × 100 mm (acero galvanizado perforado)', 'Almacén · nave industrial (3 recorridos)', '150 + 150 + 60 = 360 m'],
          ['Bandeja 300 × 60 mm', 'Almacén · zona de oficinas auxiliares', '40 m'],
          ['Bandeja 200 × 60 mm', 'Almacén · tramo cuarto de comunicaciones → IDF-02', '150 m'],
          ['Bandeja 200 × 60 mm', 'CPD y taller IT (BCN)', '30 m'],
          ['Tubo de acero galvanizado Ø 125 mm', 'Montante vertical de la oficina (P0 ↔ P3)', '16 m'],
          ['Tubo corrugado ignífugo Ø 50 mm', 'Entradas RITI (2 operadores)', '2 × 10 m = 20 m'],
          ['Tubo corrugado flexible PVC Ø 32 mm', 'Bajadas a cajas de suelo (oficina)', '≈ 600 m']
        ], 'Tabla 6. Metros de bandeja y tubo a comprar.', { mono: [2] }) +
        D.p('En total: <b>≈ 900 m de bandeja metálica</b> en tres secciones distintas, 16 m de tubo de montante, 20 m de tubo ignífugo en el RITI y ≈ 600 m de tubo corrugado para las bajadas a las cajas de suelo.')],
      ['2.A2.6', 'Metros de cable a comprar',
        D.w('reels') +
        D.tbl(['Zona', 'Tomas', 'Distancia media', 'Metros brutos'], [
          ['Oficina P0', '96', '50 m', '4.800'], ['Oficina P1', '154', '40 m', '6.160'], ['Oficina P2', '144', '40 m', '5.760'], ['Oficina P3', '144', '40 m', '5.760'], ['Almacén (oeste + este)', '152', '70 m', '10.640'],
          ['!Subtotal', '690 tomas', '', '33.120 m'], ['!+ 10 % de pérdidas y margen', '', '', '≈ 36.500 m']
        ], 'Tabla 7. Metros de cable Cat 6A U/FTP LSZH. Equivale a unas 37 bobinas de 1.000 m.', { mono: [1, 3] }) +
        D.tbl(['Enlace', 'Metros'], [
          ['CPD → IDF-P1 (× 2 enlaces redundantes)', '≈ 30'], ['CPD → IDF-P2 (× 2)', '≈ 50'], ['CPD → IDF-P3 (× 2)', '≈ 70'], ['Cuarto de comunicaciones → IDF-02 (× 2)', '≈ 270'], ['RITI → CPD (fibra monomodo de 2 operadores)', '≈ 30'],
          ['!Subtotal', '≈ 450 m'], ['!+ 15 % de margen y patch de rack', '≈ 520 m']
        ], 'Tabla 8. Metros de fibra OM4 multimodo (12 fibras).', { mono: [1] }) +
        D.p('Los modelos exactos de bobinas, latiguillos, paneles LC-LC y transceptores SFP+ están en el presupuesto.')]
    ]
  });

  LT.sec({
    id: '2.B1', t: 'Ubicación y dimensiones de racks (MDF/IDF)', short: 'Ubicación de racks y SAI',
    lead: 'Seis armarios operativos y un hueco reservado. Cada uno con su sala preparada alrededor y un SAI que no corta ni un milisegundo.',
    subs: [
      ['2.B1.1', 'Criterio de dimensionado',
        D.p('Un armario bien dimensionado tiene que cumplir tres cosas:') +
        D.ul(['<b>Que entre todo lo de hoy con el cableado ordenado</b> (patch panels, organizadores horizontales, pasos de cable laterales). Un rack lleno de cables hace imposible el mantenimiento.',
          '<b>Dejar unidades libres para crecer</b> (≈ 30 % de reserva física). Un switch más, un servidor nuevo u otro panel de parcheo tienen que entrar sin cambiar el rack.',
          '<b>Permitir ventilación de delante hacia atrás.</b> Los pasivos (paneles, organizadores) no tienen problema; los switches y servidores necesitan aire frío delante y salida por detrás.'])],
      ['2.B1.2', 'Inventario de armarios',
        D.tbl(['Código', 'Ubicación', 'Tipo', 'Medida', 'Contenido principal'], [
          ['<b>R1 (CPD)</b>', 'BCN · P0 · CPD', 'Rack de pie 19"', '42U, 800 × 1000 mm', 'Cores, firewall, routers, switch de acceso P0, servidores, SAI, paneles de parcheo'],
          ['<b>R2 (reserva)</b>', 'BCN · P0 · CPD', 'Espacio reservado', '42U', 'Vacío. Reservado físicamente en el plano para crecer.'],
          ['<b>IDF-P1</b>', 'BCN · P1 · patinillo', 'Rack de pie 19"', '42U, 600 × 800 mm', '4 switches de acceso, patch panels, SAI, patch de fibra'],
          ['<b>IDF-P2</b>', 'BCN · P2 · patinillo', 'Rack de pie 19"', '42U, 600 × 800 mm', '3 switches de acceso, patch panels, SAI, patch de fibra'],
          ['<b>IDF-P3</b>', 'BCN · P3 · patinillo', 'Rack de pie 19"', '42U, 600 × 800 mm', '3 switches de acceso, patch panels, SAI, patch de fibra'],
          ['<b>R1 (ZGZ)</b>', 'ZGZ · cuarto de comunicaciones', 'Rack de pie 19"', '42U, 800 × 1000 mm', 'Routers, firewall, cores, switches de acceso de oficina, servidor local, SAI, paneles'],
          ['<b>IDF-02</b>', 'ZGZ · extremo este de la nave', 'Armario mural 19"', '12U, 600 × 450 mm', '1 switch de acceso, SAI compacto, patch panel, patch de fibra']
        ], 'Tabla 9. Inventario de armarios. Total: 6 armarios operativos y 1 espacio de reserva en el CPD de Barcelona.')],
      ['2.B1.3', 'Espacios técnicos asociados',
        D.p('Los armarios por sí solos no alcanzan: tiene que haber salas preparadas alrededor.') +
        D.h('Oficina de Barcelona') +
        D.ul(['<b>CPD (21,74 m²).</b> Suelo técnico de 25 cm, climatización de precisión de 3,5 kW redundante 1+1, control de acceso por tarjeta con puerta EI-120, detección y extinción por aerosol condensado (FirePro FP-100), sensores de humedad y temperatura conectados al NOC. Dos circuitos eléctricos independientes del CGBT, cada uno con su interruptor.',
          '<b>Taller IT (15,22 m²).</b> Junto al CPD, bancos de trabajo para preparar equipos nuevos con FOG (arranque PXE). No tiene racks; solo tomas de corriente y red.',
          '<b>Almacén IT (22,77 m²).</b> Material de recambio, bobinas de cable sobrante y latiguillos de reserva.',
          '<b>RITI (30,89 m²).</b> Entrada de las dos fibras de los operadores por canalizaciones independientes. Solo tiene el ODF (repartidor óptico) y la roseta para el router del ISP.',
          '<b>IDF-P1, IDF-P2, IDF-P3.</b> Cada uno dentro del patinillo técnico de su planta (≈ 4 m²). Ventilación natural por rejilla superior, sin refrigeración activa: la carga térmica de un rack de acceso con SAI es baja.']) +
        D.h('Almacén de Zaragoza') +
        D.ul(['<b>Cuarto de comunicaciones (45 m²).</b> En el extremo oeste de la nave, dentro de la zona de oficinas. Climatización de precisión de 2,5 kW, control de acceso por tarjeta, extinción por aerosol, SAI del rack y SAI dedicado al servidor local.',
          '<b>IDF-02.</b> Armario mural en el extremo este de la nave, montado sobre un pilar estructural a 2,5 m de altura, con ventilación forzada por dos ventiladores superiores. El SAI compacto va dentro del propio armario.'])],
      ['2.B1.4', 'Redimensionado de los SAI',
        D.p('El SAI tiene que dar continuidad eléctrica solo a los equipos críticos: electrónica de red (cores, firewall, routers, switches de acceso), servidores y AP. No alimenta PC, teléfonos IP (que ya llevan su batería), impresoras, pantallas ni la climatización. El objetivo es <b>15 a 20 minutos de autonomía</b>, el tiempo necesario para:') +
        D.ul(['Un apagado controlado de los servidores si el corte es largo.', 'El arranque de un grupo electrógeno externo, si la empresa lo contrata más adelante.', 'Absorber microcortes y transitorios de la red, que es lo que pasa en el 90 % de los casos.']) +
        D.w('upsload') +
        D.tbl(['Rack', 'Equipos críticos', 'Potencia aproximada'], [
          ['BCN · CPD R1', '2 cores + ASA + 2 routers + 1 switch de acceso + 3 servidores físicos', '≈ 2.400 W'],
          ['BCN · IDF-P1', '4 switches de acceso Catalyst 9300L-48P (PoE+)', '≈ 1.200 W'],
          ['BCN · IDF-P2', '3 switches de acceso Catalyst 9300L-48P (PoE+)', '≈ 900 W'],
          ['BCN · IDF-P3', '3 switches de acceso Catalyst 9300L-48P (PoE+)', '≈ 900 W'],
          ['ZGZ · CPD R1', '2 routers + ASA + 2 cores + 2 switches de acceso + 1 servidor', '≈ 1.600 W'],
          ['ZGZ · IDF-02', '1 switch de acceso Catalyst 9300L-48P (PoE+)', '≈ 350 W']
        ], 'Tabla 10. Carga de cada rack (carga real con un factor de uso ≈ 0,7).', { mono: [2] }) +
        D.tbl(['Rack', 'Modelo de SAI', 'Capacidad', 'Tipo', 'Autonomía a plena carga', 'U'], [
          ['BCN · CPD R1', 'APC Smart-UPS SRT 6000VA (SRT6KRMXLI)', '6.000 VA / 6.000 W', 'Online doble conversión', '15 min a 2.400 W', '4U'],
          ['BCN · IDF-P1', 'APC Smart-UPS SRT 2200VA (SRT2200RMXLI)', '2.200 VA / 1.980 W', 'Online doble conversión', '18 min a 1.200 W', '2U'],
          ['BCN · IDF-P2', 'APC Smart-UPS SRT 1500VA (SRT1500RMXLI)', '1.500 VA / 1.500 W', 'Online doble conversión', '15 min a 900 W', '2U'],
          ['BCN · IDF-P3', 'APC Smart-UPS SRT 1500VA (SRT1500RMXLI)', '1.500 VA / 1.500 W', 'Online doble conversión', '15 min a 900 W', '2U'],
          ['ZGZ · CPD R1', 'APC Smart-UPS SRT 3000VA (SRT3000RMXLI)', '3.000 VA / 2.700 W', 'Online doble conversión', '18 min a 1.600 W', '2U'],
          ['ZGZ · IDF-02', 'APC Smart-UPS SRT 1000VA (SRT1000RMXLI)', '1.000 VA / 1.000 W', 'Online doble conversión', '15 min a 350 W', '2U']
        ], 'Tabla 11. Modelos de SAI elegidos.')],
      ['2.B1.5', 'Por qué SAI online de doble conversión y no línea interactiva',
        D.p('El SAI de línea interactiva (el típico de casa o de una oficina pequeña) es más barato, pero conmuta a batería cuando detecta el corte y tarda <b>2 a 6 ms</b> en hacerlo. Para un PC de usuario es invisible, pero un servidor o un switch de core con ese tiempo de transferencia puede reiniciarse si la tensión de entrada ya venía degradada antes del corte.',
          'El SAI online de doble conversión regenera la señal todo el tiempo: la corriente siempre pasa por el rectificador y el inversor, las baterías están en línea y <b>no hay tiempo de transferencia</b>. Es lo que se pide para electrónica crítica y es lo que ponemos en todos los racks del proyecto. Cortá la luz en los dos y comparalos:') +
        D.w('ups')],
      ['2.B1.6', 'Monitorización de los SAI',
        D.p('Todos los SAI elegidos llevan tarjeta de red AP9641 integrada o como accesorio, con SNMP v3. Se monitorizan desde el NOC (P3) por la VLAN 99 de gestión y mandan alertas por correo cuando:') +
        D.ul(['Hay un corte de corriente.', 'La batería baja del 50 % de carga.', 'Hay que sustituir la batería (indicador de salud).', 'La temperatura interna supera un umbral.']) +
        D.p('En los racks de acceso (IDF), con cargas pequeñas, la monitorización es solo SNMP. En el CPD el SAI también se conecta por USB al servidor SRV-HV01 como canal de reserva, por si se corta la VLAN de gestión.')]
    ]
  });

  LT.sec({
    id: '2.B2', t: 'Esquema de alzado del rack (Rack Elevation)', short: 'Alzado de los racks',
    lead: 'Cada U tiene su sitio: lo pesado abajo, lo que más se toca a la altura de las manos, la fibra arriba.',
    subs: [
      ['2.B2.1', 'Criterio de distribución',
        D.p('La distribución dentro de un rack sigue siempre esta lógica (de abajo arriba):') +
        D.ul(['<b>Zona inferior (U1 a U6)</b>: SAI y sus baterías extra. Son los elementos más pesados; concentrar el peso abajo baja el centro de gravedad y facilita el montaje.',
          '<b>Zona central baja (U7 a U18)</b>: servidores físicos, también pesados y con cableado trasero muy denso.',
          '<b>Zona central (U19 a U28)</b>: electrónica de red (cores, routers, firewall) con sus organizadores horizontales. Es la zona que más se toca: a una altura cómoda de trabajo.',
          '<b>Zona central alta (U29 a U38)</b>: switches de acceso y sus patch panels. Cada switch va justo debajo (o encima) de su patch panel, con un organizador horizontal en el medio.',
          '<b>Zona superior (U39 a U42)</b>: patch panel de fibra, consola/KVM y la bandeja de entrada de cables superior.']) +
        D.p('Entre cada par de elementos activos se deja un organizador horizontal de 1U (anillas o con tapa) para que los latiguillos queden ordenados y no tapen el paso del aire. Pasá el ratón por cada U:') +
        D.w('rack') +
        D.p('De los 6 armarios operativos, los más cargados son los dos CPD (BCN R1 al 69 %, ZGZ R1 al 52 %) porque concentran electrónica y servidores. Los IDF están claramente por debajo (14 a 17U de 42), y es a propósito: un armario de acceso tiene que tener margen para un switch más o un patch panel sin abrir techos ni reorganizar nada. El IDF-02 del almacén es un armario mural pequeño porque aloja un solo switch y va colgado del pilar: un rack de 42U ahí no tiene sentido.') +
        D.evs([6, 7, 8])]
    ]
  });

  LT.sec({
    id: '2.B3', t: 'Selección y justificación del hardware de red', short: 'Hardware de red',
    lead: 'Modelos reales, de fabricantes conocidos y con disponibilidad en el mercado. Ni el más barato ni el más caro: el que cumple.',
    subs: [
      ['2.B3.1', 'Criterios',
        D.p('Para cada pieza de la infraestructura buscamos modelos reales, de fabricantes conocidos y disponibles en el mercado (PCComponentes, Macnet, Landatel, distribuidores oficiales de Cisco, HPE, Ubiquiti, etc.). Los criterios fueron:') +
        D.ul(['<b>Encaje con las necesidades del cliente</b> (número de puertos, PoE, velocidad, cobertura Wi-Fi): no sobredimensionar porque sí.',
          '<b>Fabricantes con soporte y recambios a largo plazo</b>, para garantizar una vida útil de 7 años o más.',
          '<b>Compatibilidad entre piezas</b>: misma familia de switches y AP donde tiene sentido, SFP compatibles, bastidores estándar de 19".',
          '<b>Margen de crecimiento</b>: cada switch deja ≈ 20 % de puertos libres y cada rack deja unidades libres.',
          '<b>Relación calidad-precio</b>: lo que cumple los requisitos con buena reputación.'])],
      ['2.B3.2', 'Equipos elegidos',
        D.w('hw') +
        D.p('La relación completa de modelos, unidades y precios está en el presupuesto (hoja de cálculo), que también se puede ver resumido en la sección <a href="#/presupuesto">Presupuesto</a>.')]
    ]
  });

  LT.sec({
    id: '2.C', t: 'Topología física en Packet Tracer', short: 'Topología en Packet Tracer',
    lead: 'Volvimos a montar el Packet Tracer sobre los planos nuevos (un solo rack en el CPD) y, como se pidió en la revisión, con una versión simplificada: un par de equipos por VLAN.',
    sc: ['topo', 'Recorré la topología completa del Packet Tracer, equipo por equipo.'],
    subs: [
      ['2.C.1', 'Criterio: un Packet Tracer simplificado',
        D.p('En el Sprint 1 el Packet Tracer tenía todos los equipos de los planos (más de 800 dispositivos). En la revisión se nos pidió una copia simplificada con un par de equipos por VLAN, para poder configurar y probar todo de verdad. El archivo de este sprint tiene <b>105 dispositivos</b>: toda la electrónica de red real (cores, routers, firewalls, un switch de acceso por planta) y, colgando de cada switch, solo los equipos necesarios para probar cada VLAN.') +
        D.tbl(['Tipo', 'Barcelona', 'Zaragoza', 'Internet', 'Modelo en Packet Tracer'], [
          ['Routers', 'BCN-RT1, BCN-RT2', 'ZGZ-RT1, ZGZ-RT2', 'ISP-1 a ISP-4', 'ISR 4331'],
          ['Firewall perimetral', 'BCN-FW', 'ZGZ-FW', '—', 'ASA 5506-X'],
          ['Cores (capa 3)', 'BCN-CORE1, BCN-CORE2', 'ZGZ-CORE1, ZGZ-CORE2', '—', 'Catalyst 3650-24PS'],
          ['Switches de acceso', 'BCN-P0..P3-ACC1 (uno por planta)', 'ZGZ-ACC1, ZGZ-ACC2, ZGZ-ACC4', '—', 'Catalyst 2960-24TT'],
          ['Servidores', 'SRV-HV01, SRV-HV02, SRV-HV03', 'SRV-ZGZ01', 'DNS-PUBLICO', 'Server-PT'],
          ['PC, teléfonos e impresoras', '10 PC, 2 teléfonos IP, 2 impresoras', '10 PC, 1 teléfono IP, 1 impresora de etiquetas, 2 cámaras', 'PC-INTERNET', 'PC-PT, 7960, Printer-PT'],
          ['Wi-Fi', '4 AP, 2 móviles', '3 AP, 2 móviles, 1 tableta', '—', 'AccessPoint-PT'],
          ['Cableado', '4 paneles de parcheo, rosetas', '3 paneles de parcheo, rosetas', '—', 'Copper Patch Panel / Wall Mount']
        ], 'Tabla 12. Dispositivos del Packet Tracer simplificado.') +
        D.p('La nomenclatura sigue siempre el mismo patrón: <code>SEDE-PLANTA-FUNCIÓN-NÚMERO</code>. Por ejemplo, <code>P1-ADM-03</code> es el puesto 3 de administración de la planta 1 y <code>BCN-P1-ACC1</code> es el switch de acceso de esa planta.')],
      ['2.C.2', 'Topología lógica',
        D.p('Cada sede sigue el mismo esquema de tres niveles: <b>acceso → core → firewall → routers → Internet</b>. Cada switch de acceso tiene dos enlaces troncales, uno a cada core; los dos cores están unidos por un EtherChannel de dos cables; el firewall ASA tiene una pata hacia cada core y otra hacia cada router; y cada router sale a Internet por un ISP distinto. Así ninguna parte de la red depende de un solo cable ni de un solo equipo.') +
        D.w('tracer', { h: 520 }) +
        D.p('Todos los enlaces tienen que tener los triángulos en verde, salvo uno de los dos troncales de cada switch de acceso, que Spanning Tree deja bloqueado de reserva (punto 4.A3). En la vista de arriba se ven en naranja.') +
        D.fig(9)],
      ['2.C.3', 'Topología física sobre los planos',
        D.p('En la vista física (Physical) cargamos de fondo los planos de cada planta y colocamos cada equipo en la sala donde va: los switches de acceso en su IDF, los cores y servidores en el rack del CPD y cada PC en su sala. El cableado también es el real: el PC va a una roseta de pared o de caja de suelo, la roseta a un panel de parcheo del armario y el panel al switch.') +
        D.chk('Vista Physical', 'Barcelona → Planta 0', 'Que el fondo es el plano nuevo de la planta baja, con el CPD de un solo rack, y que los equipos están en su sala.', 10) +
        D.chk('Vista Physical', 'Barcelona → Planta 0 → CPD → doble clic en el rack', 'Que en el CPD hay un único rack con los routers, el firewall, los dos cores, los servidores y el panel de parcheo.', 11) +
        D.chk('Vista Physical', 'Zaragoza → Nave', 'El plano del almacén de fondo, con el cuarto de comunicaciones al oeste, el IDF-02 al este y el enlace de fibra entre los dos.', 12) +
        D.chk('BCN-CORE1', 'show cdp neighbors', 'Que el core ve los cuatro switches de acceso (uno por planta) y el CORE2 por el Port-channel 1, es decir, por los dos puertos del EtherChannel (Gig1/0/23 y Gig1/0/24).', 13)]
    ]
  });
})();
