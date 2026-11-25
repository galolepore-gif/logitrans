/* Punts 0 i 2 de la memòria en català: plànols i infraestructura física */
(function () {
  var LT = window.LT, D = LT.D;
  var CT = { '0': 'Plànols de les instal·lacions', '2': 'Infraestructura física', '3': 'Adreçament i encaminament', '4': 'Seguretat de la xarxa', '5': 'Serveis', '6': 'Auditoria i mitigació' };
  LT.CHAPTERS.forEach(function (c) { if (CT[c.n]) c.t = CT[c.n]; });

  LT.sec({
    id: '0', t: 'Plànols de les instal·lacions', short: 'Plànols de les instal·lacions',
    lead: 'Abans d’entrar als punts de la rúbrica, les dues seus. Tot el projecte (cablejat, armaris, VLAN i Packet Tracer) parteix d’aquests plànols.',
    subs: [
      ['0.0', 'Les dues seus de LogiTrans',
        D.tbl(['Seu', 'Ubicació', 'Superfície', 'Llocs', 'Ús principal'], [
          ['<b>Oficina central</b>', 'One Parc Central, C/ Marroc 33, 22@, 08018 Barcelona', '4 plantes × 1.000 m² (40 × 25 m)', '302 llocs als plànols', 'Direcció, administració, trànsit i operacions, CPD'],
          ['<b>Magatzem</b>', 'Nau P3 · PLAZA (Plataforma Logística), 50197 Saragossa', '9.000 m² (150 × 60 m) en una planta', '28 d’oficina + terminals de moll i Wi-Fi', 'Recepció, emmagatzematge, preparació i expedició']
        ], 'Taula 1. Les dues seus de LogiTrans.') +
        D.w('sites') +
        D.p('Els dos edificis són naus diàfanes compartimentades amb envans de pladur. A les dues seus el cablejat va en estrella: un armari principal (el CPD a Barcelona i la sala de comunicacions a Saragossa) del qual surt fibra OM4 cap als armaris secundaris (IDF), i d’allà cable Cat 6A fins a cada presa, sense passar mai de 90 m de coure.',
          'Cada sala dels plànols indica la VLAN que li correspon, i és la mateixa VLAN que tenen els equips d’aquella sala al Packet Tracer. Els plànols són els fitxers .drawio que s’entreguen amb el projecte; aquí hi ha una imatge de cada planta amb la seva explicació.')],
      ['0.1', 'Oficina central · Planta baixa (P0)',
        D.p('És la planta d’accés i la que allotja el cor de la xarxa. Té <b>30 llocs de treball, 12 punts d’accés Wi-Fi i 2 switches d’accés</b>.') +
        D.ul(['<b>Zona pública</b> ' + D.vl(40) + ' (Wi-Fi de convidats): vestíbul i recepció amb control d’accés (128,29 m²), menjador i cafeteria (93,84 m²), office i cuina, sala polivalent i sala de visites.',
          '<b>Zona de treball</b> ' + D.vl(20) + ': sala de formació (127,62 m²), arxiu general i paqueteria i missatgeria.',
          '<b>CPD</b> (21,74 m²) ' + D.vl(50) + ': un únic rack de 42U (R1) amb els dos cores, el tallafoc, els dos routers, l’accés de la P0, els servidors i el SAI dels equips crítics. Queda espai per a un segon rack de reserva. D’aquí puja la fibra pel muntant cap als IDF de les altres plantes.',
          '<b>Taller IT</b> (15,22 m²): al costat del CPD, banc per preparar equips nous amb FOG (arrencada per xarxa PXE).',
          '<b>Magatzem IT</b> (22,77 m²) per al material de recanvi, i <b>RITI</b> (30,89 m²), per on entren les dues fibres dels operadors per canalitzacions independents.']) +
        D.w('plan', { f: 'p0' })],
      ['0.2', 'Oficina central · Planta primera (P1)',
        D.p('Planta de trànsit i operacions, la que té més gent: <b>117 llocs de treball, 14 punts d’accés i 4 switches d’accés</b> a l’IDF-P1.') +
        D.ul(['Open space d’operacions i flota (381,62 m²) i open space de trànsit (254,62 m²), tots dos a la VLAN 20, amb una caixa de terra de 6 preses sota cada bloc de 6 llocs.',
          'Sala de planificació de rutes amb videowall per al seguiment GPS de la flota i sala de reunions ' + D.vl(20) + '.',
          'Despatx del cap de trànsit ' + D.vl(10) + ' i office amb zona de cafè ' + D.vl(40) + '.',
          '<b>IDF-P1</b>: rack de 42U al muntant, amb SAI propi i la fibra que baixa al CPD.']) +
        D.w('plan', { f: 'p1' })],
      ['0.3', 'Oficina central · Planta segona (P2)',
        D.p('Planta d’administració i finances: <b>93 llocs de treball, 14 punts d’accés i 3 switches d’accés</b> a l’IDF-P2.') +
        D.ul(['Open space de finances i comptabilitat i open space de compres i comercial (254,62 m² cadascun) ' + D.vl(20) + '.',
          'RRHH i selecció, sala de reunions, videoconferència, arxiu administratiu i reprografia ' + D.vl(20) + '.',
          'Despatx del cap d’administració ' + D.vl(10) + ' i office ' + D.vl(40) + '.']) +
        D.p('La distribució segueix la mateixa retícula que la P1, amb l’IDF-P2 al mateix punt del muntant.') +
        D.w('plan', { f: 'p2' })],
      ['0.4', 'Oficina central · Planta tercera (P3)',
        D.p('Planta de direcció i gestió de la xarxa: <b>62 llocs de treball, 14 punts d’accés i 3 switches d’accés</b> a l’IDF-P3.') +
        D.ul(['<b>Direcció</b> ' + D.vl(10) + ': despatxos de direcció general, subdirecció, direcció financera, comercial i d’operacions, sala de juntes, videoconferència i secretaria de direcció.',
          'Open space de control de gestió, sala de reunions i arxiu de direcció ' + D.vl(20) + '.',
          '<b>NOC</b> (45,84 m²) i <b>laboratori IT</b> amb maqueta de xarxa (62,34 m²) ' + D.vl(99) + ': des d’aquí s’administren tots els equips de xarxa i es proven els canvis abans d’aplicar-los.',
          'Office de direcció ' + D.vl(40) + '.']) +
        D.p('A la dreta del plànol hi ha el NOC i el laboratori IT, que són els únics espais de l’oficina a la VLAN de gestió.') +
        D.w('plan', { f: 'p3' })],
      ['0.5', 'Magatzem de Saragossa',
        D.p('Nau de 150 × 60 m en una sola planta. Té <b>28 llocs d’oficina</b> amb PC i telèfon IP, <b>9 terminals de moll</b>, <b>17 punts d’accés</b> (12 industrials a la nau i 5 a les oficines), <b>12 càmeres IP</b>, 4 impressores d’oficina i 7 d’etiquetes i <b>4 switches</b> repartits entre dos armaris.') +
        D.ul(['<b>Nau</b> ' + D.vl(30) + ': zona de recepció (1.065,60 m²) i d’expedició (1.434,24 m²) al costat dels 9 molls, zona d’emmagatzematge amb prestatgeries (3.811,50 m²), preparació de comandes i embalatge, devolucions i sala de càrrega de bateries dels carretons.',
          '<b>Oficines</b> (a l’extrem oest): direcció local ' + D.vl(10) + ', administració i sala de reunions ' + D.vl(20) + ', oficina de molls ' + D.vl(30) + ', sala de conductors i menjador ' + D.vl(40) + ', sala de gestió de xarxes ' + D.vl(99) + ' i vestidors.',
          '<b>Sala de comunicacions</b> (45 m²) ' + D.vl(50) + ': rack R1 de 42U amb el router, el tallafoc, els cores i el servidor local. <b>IDF-02</b>: armari mural de 12U a l’altra punta de la nau, unit amb fibra OM4 perquè la distància supera els 90 m del coure.']) +
        D.w('plan', { f: 'zgz' })]
    ]
  });

  LT.sec({
    id: '2.A1', t: 'Selecció de mitjans', short: 'Selecció de mitjans',
    lead: 'El cablejat és el que menys es veu i el que més costa d’arreglar un cop posat: obliga a obrir sostres i aturar zones senceres. Per això es tria pensant en quinze anys, no en l’any que ve.',
    subs: [
      ['2.A1.1', 'Criteri de selecció',
        D.p('PC, telèfons, càmeres, AP i servidors depenen del cable que tenen al darrere. Triem el mitjà amb tres criteris:') +
        D.ul(['<b>Durabilitat.</b> Un cablejat ben fet ha de durar de 15 a 20 anys sense tocar-lo, encara que els switches i els PC es canviïn pel camí. Mentre el cable aguanti, la infraestructura es manté.',
          '<b>Normativa.</b> Coberta LSZH obligatòria en edificis de pública concurrència (RD 842/2002 i CTE DB-SI), i respectar els límits de distància de TIA-568 / ISO 11801: màxim 90 m d’enllaç permanent en coure més 10 m de latiguillos.',
          '<b>Marge de creixement.</b> Avui la xarxa va a 1 Gb, però el cable triat ha de permetre pujar a 10 Gb sense canviar-lo.'])],
      ['2.A1.2', 'Esquema general',
        D.p('Cada seu funciona en estrella: un armari principal (el CPD a la planta baixa de Barcelona i la sala de comunicacions a l’oest de la nau de Saragossa) del qual surt fibra OM4 fins als armaris secundaris (IDF), i d’allà coure Cat 6A fins a cada roseta d’usuari. Entre les dues seus, VPN IPsec per Internet.',
          'Es respecta sempre el límit de 90 m de coure de TIA-568; quan la distància és més gran, es passa a fibra OM4.') + D.w('star')],
      ['2.A1.3', 'Tipus de cable per tram',
        D.w('media') +
        D.tbl(['Tram', 'Cable', 'Velocitat', 'Per què'], [
          ['Rack → roseta d’usuari', 'Cat 6A U/FTP, coberta LSZH', '10 Gb', 'Estàndard actual per a instal·lacions noves. Suporta PoE+ (telèfons IP, AP i càmeres) i deixa marge per pujar a 10 Gb sense canviar el cable. LSZH és obligatòria.'],
          ['Troncal entre armaris d’una seu (CPD ↔ IDF)', 'Fibra OM4 multimode, 12 fibres', '2 × 10 Gb per planta', 'Distàncies llargues sense pèrdues. Dos enllaços per planta, per camins diferents, per tenir redundància física.'],
          ['Escomesa de l’operador (RITI → CPD)', 'Fibra monomode de l’operador', '1 Gb per operador', 'La porta el proveïdor d’Internet; nosaltres posem l’ODF al RITI. Dos operadors diferents, una fibra cadascun.'],
          ['Enllaç entre seus (VPN IPsec)', 'FTTH 1 Gb + 4G/5G de reserva', '1 Gb', 'Fibra contractada a l’operador. El 4G/5G és la reserva del magatzem si cau la fibra.']
        ], 'Taula 2. Mitjans triats segons el tram.')],
      ['2.A1.4', 'Per què Cat 6A i no Cat 6 o Cat 7',
        D.w('compare', { k: 'cat' })],
      ['2.A1.5', 'Per què OM4 i no OM3 o OM5',
        D.w('compare', { k: 'om' })],
      ['2.A1.6', 'Distàncies reals davant del límit de la norma',
        D.p('Totes les distàncies del projecte queden clarament per sota dels límits de TIA-568. Passa el ratolí per cada barra per veure el marge que queda.') +
        D.w('dist') +
        D.p('El tram de 135 m entre la sala de comunicacions i l’IDF-02 és el motiu pel qual el magatzem necessita dos armaris: amb un sol armari a l’oest, el coure no arribaria a la meitat est de la nau (passaria del límit de 90 m).')],
      ['2.A1.7', 'Colors de latiguillo',
        D.p('Per distingir d’un cop d’ull què hi ha connectat a cada port del rack, els latiguillos segueixen el mateix codi de colors a les dues seus:') + D.w('patch')]
    ]
  });

  LT.sec({
    id: '2.A2', t: 'Normativa d’etiquetatge i canalització', short: 'Etiquetatge i canalització',
    lead: 'Un cable mal etiquetat obliga a estirar-lo a mà per trobar-lo. Un de ben etiquetat es troba en segons.',
    subs: [
      ['2.A2.1', 'Criteri i format del codi d’etiquetatge',
        D.p('Cada cable porta etiqueta als dos extrems, i cada roseta, panell de connexions i armari també. Tria un element i munta’n l’etiqueta:') +
        D.w('label') +
        D.tbl(['Element', 'Format', 'Exemple', 'Significa'], [
          ['Rack / armari', 'R##', 'R1 · R2 · IDF-P1', 'Rack principal del CPD, rack secundari del CPD, armari de l’IDF de la planta 1'],
          ['Patch panel', 'PP##', 'PP01 · PP02', 'Primer i segon panell del rack que el conté'],
          ['Port d’un panell', 'PP##-###', 'PP02-17', 'Port 17 del segon panell'],
          ['Port de patch (microetiqueta)', '## (01-48)', '39', 'Microetiqueta al port'],
          ['Roseta de paret o caixa de terra', 'P#-R## · P#-CS##', 'P1-R17 · P2-CS07', 'Roseta 17 de la planta 1 · caixa de terra 7 de la planta 2'],
          ['Port de roseta', 'P#-R##-#', 'P1-R17-2', 'Segon connector de la roseta 17 de la planta 1'],
          ['Presa de moll (magatzem)', 'M##', 'M05', 'Terminal del moll 5'],
          ['Enllaç de fibra', 'FO-ORIGEN-DESTÍ-##', 'FO-CPD-IDFP2-01', 'Primer enllaç de fibra del CPD cap a l’IDF-P2'],
          ['Punt d’accés', 'AP-##', 'AP-07', 'AP número 7 (igual que al plànol)'],
          ['Tallafoc', '[rack]-FW##', 'R1-FW01', 'Adhesiu frontal'],
          ['Router', '[rack]-RT##', 'R5-RT01', 'Adhesiu frontal'],
          ['SAI', 'SAI-[zona]#', 'SAI-CPD1 · SAI-IDF2', 'Vinil frontal']
        ], 'Taula 4. Sistema d’etiquetatge.', { mono: [1, 2] })],
      ['2.A2.2', 'On va l’etiqueta',
        D.ul(['<b>Cable de coure</b>: als dos extrems, a 10 cm del connector, amb etiqueta encintada tipus «bandera» (es llegeix per les dues cares).',
          '<b>Fibra</b>: igual, però amb etiqueta termoretràctil resistent al fregament.',
          '<b>Roseta</b>: al frontal, sota el connector.',
          '<b>Panell de connexions</b>: damunt de cada port.',
          '<b>Armari</b>: a la porta frontal, part superior.',
          '<b>Latiguillo</b>: només si no segueix el codi de colors del punt 2.A1.7 (per exemple, un latiguillo blau que per força va en un enllaç troncal perquè s’ha acabat el groc).'])],
      ['2.A2.3', 'Canalitzacions: tipus i recorregut',
        D.p('Separem canalitzacions horitzontals (dins d’una planta, pel fals sostre), verticals (muntant entre plantes) i de magatzem (nau industrial).') +
        D.w('ducts') +
        D.h('Oficina de Barcelona') +
        D.ul(['<b>Horitzontal (P0, P1, P2, P3).</b> Safata metàl·lica perforada tipus rejiband, acer galvanitzat Sendzimir, 300 × 60 mm, penjada del forjat del fals sostre amb suports cada 1,5 m. Recorre els dos passadissos principals de cada planta (nord-sud i est-oest). A cada bloc de 6 llocs, baixada vertical fins a una caixa de terra amb 6 preses RJ45 Cat 6A. Als despatxos individuals i a les sales de reunions, baixada fins a una presa doble de paret.',
          '<b>Muntant vertical (P0 ↔ P1 ↔ P2 ↔ P3).</b> Tub d’acer galvanitzat de 125 mm de diàmetre al patinet tècnic que uneix el CPD de la P0 amb els tres IDF de les plantes superiors. Hi passa només fibra OM4 (2 enllaços redundants per planta).',
          '<b>CPD i taller IT.</b> Safata metàl·lica de 200 × 60 mm per al connexionat interior entre racks i taller, més canalització elevada sota el terra tècnic del CPD.',
          '<b>RITI → CPD.</b> Dues canalitzacions independents, una per operador, amb tub corrugat ignífug de 50 mm i entrades oposades a l’edifici.',
          '<b>Safata → presa.</b> Cada caixa de terra o presa penja de la safata més propera. El cable surt de la safata pel fals sostre dins d’un tub corrugat de PVC lliure d’halògens: <b>Ø 40 mm cap a les caixes de terra</b> (porten 6 cables; així no passem del 40 % d’ocupació de la TIA-569) i <b>Ø 32 mm cap a les preses de paret</b> (en porten 2). Baixa fins a la presa (3 m de baixada a l’oficina).',
          '<b>Com hem mesurat.</b> Les longituds surten del plànol a escala (1 m = 100 px a l’oficina i 50 px al magatzem). La derivació és el recorregut fins a la presa més la baixada. L’enllaç més llarg és el camí complet del rack a la presa: safata + derivació + 2 m de reserva al rack.']) +
        D.h('Magatzem de Saragossa') +
        D.ul(['<b>Nau industrial.</b> Safata metàl·lica perforada de 400 × 100 mm, suspesa a 6 m d’alçada sobre el passadís principal de carretons, el passadís sud i la línia de molls. Travessa tota la nau sense competir amb la il·luminació ni amb les prestatgeries altes. A cada moll, baixada fins a una presa RJ45 per al terminal, protegida amb caixa IP54.',
          '<b>Oficines auxiliars (zona oest).</b> Safata de 300 × 60 mm pel fals sostre, igual que a Barcelona.',
          '<b>Sala de comunicacions → IDF-02.</b> Safata metàl·lica dedicada de 200 × 60 mm suspesa a 6 m, que recorre els 150 m de la nau d’oest a est sobre el passadís principal. Hi passa només la fibra OM4 (2 enllaços redundants).',
          '<b>Baixades de la nau.</b> La safata va a 6 m. La baixada fins a la presa del moll o la caixa es fa amb tub d’acer galvanitzat rígid Ø 32 mm fixat al pilar i acaba en una caixa estanca IP54, perquè hi passen carretons.',
          '<b>Baixada a l’IDF-02 (nova).</b> Safata de 300 × 60 mm pel mur est (35 m). Uneix la safata dels molls i la del passadís principal amb l’armari mural, així la meitat est de la nau es cableja des de l’IDF-02.',
          '<b>Repartiment dels molls.</b> Els molls 1–5 pengen del rack R1 de la sala de comunicacions i els molls 6–9, de l’IDF-02. Així cap enllaç de coure de la nau passa de 90 m (el més llarg ronda els 85 m).']) +
        D.h('Derivacions fins a cada presa i distàncies') +
        D.tbl(['Planta', 'Tram de safata (posició als eixos)', 'Longitud', 'Alimenta', 'Derivació més llarga', 'Enllaç més llarg'], [
          ['P0', 'Vertical a l’eix E–F, fila 2', '2,2 m', '1 caixa', '11,3 m', '17,7 m'],
          ['P0', 'Horitzontal entre files 1–2, eixos A–E', '32,3 m', '1 caixa + 3 preses', '8,9 m', '28,9 m'],
          ['P0', 'Vertical a l’eix C–D, fila 2', '4,1 m', 'Només pas de cable', '—', '—'],
          ['P0', 'Vertical a l’eix A–B, files 2–3', '10,2 m', '5 caixes', '6,4 m', '44,7 m'],
          ['P0', 'Horitzontal entre files 3–4, eixos A–F', '38,8 m', '2 caixes + 6 preses', '9,7 m', '53,2 m'],
          ['P0', 'Vertical a l’eix E–F, files 2–3', '8,3 m', '2 preses', '7,9 m', '11,8 m'],
          ['P0', 'Vertical a l’eix C–D, fila 3', '1,9 m', '1 caixa', '3,9 m', '30,8 m'],
          ['P0', 'Vertical a l’eix D–E, fila 3', '1,9 m', '1 caixa', '3,4 m', '25,2 m'],
          ['P1', 'Vertical a l’eix C–D, fila 2', '4,1 m', 'Només pas de cable', '—', '—'],
          ['P1', 'Horitzontal entre files 1–2, eixos A–F', '38,8 m', '9 caixes + 4 preses', '13,7 m', '35,1 m'],
          ['P1', 'Vertical a l’eix B–C, files 2–4', '16,9 m', '7 caixes', '8,8 m', '41,9 m'],
          ['P1', 'Vertical a l’eix D–E, files 2–4', '16,9 m', '5 caixes + 1 presa', '14,2 m', '29,0 m'],
          ['P1', 'Horitzontal entre files 3–4, eixos C–D', '8,0 m', '2 preses', '7,8 m', '26,4 m'],
          ['P2', 'Vertical a l’eix C–D, fila 2', '4,1 m', 'Només pas de cable', '—', '—'],
          ['P2', 'Horitzontal entre files 1–2, eixos A–F', '38,8 m', '8 caixes + 5 preses', '13,7 m', '35,1 m'],
          ['P2', 'Vertical a l’eix B–C, files 2–4', '16,9 m', '7 caixes', '8,8 m', '41,9 m'],
          ['P2', 'Vertical a l’eix D–E, files 2–4', '16,9 m', '4 caixes + 1 presa', '5,9 m', '20,7 m'],
          ['P2', 'Horitzontal entre files 3–4, eixos C–D', '8,0 m', '2 preses', '7,8 m', '26,4 m'],
          ['P3', 'Vertical a l’eix C–D, fila 2', '4,1 m', 'Només pas de cable', '—', '—'],
          ['P3', 'Horitzontal entre files 1–2, eixos A–F', '38,8 m', '7 caixes + 4 preses', '8,3 m', '35,1 m'],
          ['P3', 'Vertical a l’eix B–C, files 2–4', '16,9 m', '8 caixes', '8,8 m', '41,9 m'],
          ['P3', 'Vertical a l’eix E–F, files 2–3', '10,2 m', '1 caixa + 2 preses', '7,7 m', '34,9 m'],
          ['P3', 'Horitzontal entre files 3–4, eixos C–F', '22,9 m', '3 preses', '6,2 m', '58,4 m'],
          ['P3', 'Vertical a l’eix D–E, fila 3', '1,9 m', '1 caixa + 1 presa', '8,3 m', '53,4 m'],
          ['P3', 'Vertical a l’eix D–E, fila 3', '1,9 m', '1 caixa + 1 presa', '8,3 m', '49,4 m']
        ], 'Taula 5. Trams de safata de l’oficina de Barcelona i preses que alimenta cada un.', { mono: [2, 4, 5] }) +
        D.tbl(['Planta', 'Safata 300 × 60', 'Caixes de terra', 'Preses de paret', 'Derivacions (tub Ø 40 / Ø 32)', 'Enllaç més llarg'], [
          ['P0', '101,7 m', '11', '11', '147,9 m', '53,2 m'],
          ['P1', '86,0 m', '21', '7', '206,1 m', '41,9 m'],
          ['P2', '86,7 m', '19', '8', '200,3 m', '41,9 m'],
          ['P3', '96,8 m', '18', '11', '196,5 m', '58,4 m'],
          ['!Total oficina', '371,2 m', '69', '37', '750,8 m', '≤ 59 m']
        ], 'Taula 6. Resum de canalitzacions per planta de l’oficina.', { mono: [1, 2, 3, 4, 5] }) +
        D.p('Cap enllaç de l’oficina passa de 59 m (el més llarg és a la P3, cap a l’office de direcció), lluny del límit de 90 m.') +
        D.fig(1006, 'Detall de la planta 1: safates (discontínues), derivacions a cada caixa de terra i presa (contínues) i muntant del patinet.') +
        D.p('A la nau hi ha 13 caixes de terra i 16 preses (terminals de moll, oficines i zona de preparació de comandes).') +
        D.tbl(['Tram de safata (posició als eixos)', 'Safata (mm)', 'Longitud', 'Alimenta', 'Derivació més llarga / Enllaç més llarg'], [
          ['Vertical a l’eix B–C, files 2–4', '400 × 100', '22,0 m', '1 presa', '10,0 m / ≈ 38 m'],
          ['Horitzontal entre files 2–3, eixos C–K', '400 × 100', '125,0 m', '2 caixes', '17,0 m / ≈ 90 m'],
          ['Vertical a l’eix B–C, files 4–5', '400 × 100', '9,3 m', 'Només pas de cable', '—'],
          ['Horitzontal entre files 4–5, eixos C–I', '400 × 100', '102,7 m', 'Només pas de cable', '—'],
          ['Vertical a l’eix I–J, files 4–5', '400 × 100', '8,8 m', 'Només pas de cable', '—'],
          ['Horitzontal a la fila 4, eixos I–K', '400 × 100', '22,0 m', '4 caixes', '12,5 m / ≈ 50 m'],
          ['Horitzontal entre files 1–2, eixos B–K', '400 × 100', '129,3 m', '10 preses', '9,5 m / ≈ 85 m'],
          ['Vertical a l’eix B–C, files 1–2', '400 × 100', '18,3 m', '3 preses', '22,1 m / ≈ 55 m'],
          ['Horitzontal entre files 2–3, eixos B–C', '400 × 100', '4,3 m', 'Només pas de cable', '—'],
          ['Horitzontal entre files 4–5, eixos A–C', '300 × 60 (oficines)', '22,0 m', '7 caixes + 2 preses', '11,3 m / ≈ 45 m'],
          ['Vertical a l’eix J–K, files 1–2', '300 × 60 (baixada a l’IDF-02, nova)', '18,3 m', 'Només pas de cable', '—'],
          ['Vertical a l’eix J–K, files 2–4', '300 × 60 (baixada a l’IDF-02, nova)', '16,8 m', 'Només pas de cable', '—']
        ], 'Taula 7. Trams de safata del magatzem i preses que alimenta cada un.', { mono: [2, 4] }) +
        D.fig(1007, 'Detall del magatzem: safata de la línia de molls amb la derivació a la presa de cada moll, i safata del passadís principal.')],
      ['2.A2.4', 'Material de les canalitzacions',
        D.tbl(['Element', 'Material', 'Per què'], [
          ['Safata horitzontal 300 × 60 mm (oficina)', 'Acer galvanitzat Sendzimir, perforada', 'Resistent, lleugera, galvanitzada en calent perquè no s’oxidi, dissipa calor i és fàcil de muntar al fals sostre.'],
          ['Safata horitzontal 400 × 100 mm (magatzem)', 'Acer galvanitzat Sendzimir, perforada', 'La mateixa raó, amb més secció perquè porta més cables i trams més llargs (150 m fins a l’IDF-02 de la nau).'],
          ['Muntant vertical (oficina)', 'Tub d’acer galvanitzat Ø 125 mm', 'Protecció mecànica i continuïtat elèctrica (terra). El patinet tècnic ja té reserva ignífuga EI-120.'],
          ['Derivació i baixada a caixa de terra o presa (oficina)', 'Tub corrugat flexible de PVC lliure d’halògens: Ø 40 mm a caixes de terra, Ø 32 mm a preses de paret', 'Va pel fals sostre des de la safata fins a la presa. Flexible per passar entre bigues; lliure d’halògens perquè la coberta LSZH no té sentit si el tub els desprèn.'],
          ['Baixada a presa de moll o caixa (nau)', 'Tub d’acer galvanitzat rígid Ø 32 mm + caixa estanca IP54', 'Baixa 6 m pel pilar des de la safata fins a la caixa IP54. Ha d’aguantar cops de carretons i la pols de la nau.'],
          ['Baixada a l’IDF-02 (nau)', 'Safata d’acer galvanitzat perforada 300 × 60 mm pel mur est', 'Porta el coure de la meitat est de la nau fins a l’armari mural, separat de la fibra.'],
          ['Entrada RITI', 'Tub corrugat ignífug Ø 50 mm', 'Compleix el RD 346/2011 (ICT) per a entrades d’operador.'],
          ['Caixa de terra', 'Acer inoxidable amb tapa de llautó, 6 connectors RJ45', 'S’hi camina per sobre: ha d’aguantar càrrega i humitat.'],
          ['Presa de paret', 'Marc de PVC amb connector RJ45 Cat 6A', 'Despatxos i sales individuals.']
        ], 'Taula 8. Material de les canalitzacions.')],
      ['2.A2.5', 'Metres de canalització a comprar',
        D.tbl(['Tipus', 'Zona', 'Metres'], [
          ['Safata 300 × 60 mm (acer galvanitzat perforat)', 'Oficina BCN · passadissos P0 a P3', '371,2 m mesurats (P0 102 · P1 86 · P2 87 · P3 97)'],
          ['Safata 400 × 100 mm (acer galvanitzat perforat)', 'Magatzem · nau industrial (3 recorreguts)', '445,0 m mesurats (molls 129 + passadís principal 125 + passadís sud 103 + verticals i unions 88)'],
          ['Safata 300 × 60 mm', 'Magatzem · zona d’oficines auxiliars', '22,0 m'],
          ['Safata 300 × 60 mm', 'Magatzem · baixada pel mur est fins a l’IDF-02 (nova)', '35,1 m'],
          ['Safata 200 × 60 mm', 'Magatzem · tram sala de comunicacions → IDF-02', '150 m'],
          ['Safata 200 × 60 mm', 'CPD i taller IT (BCN)', '30 m'],
          ['Tub d’acer galvanitzat Ø 125 mm', 'Muntant vertical de l’oficina (P0 ↔ P3)', '16 m'],
          ['Tub corrugat ignífug Ø 50 mm', 'Entrades RITI (2 operadors)', '2 × 10 m = 20 m'],
          ['Tub corrugat flexible PVC Ø 40 mm', 'Derivacions a caixes de terra (oficines)', '556,0 m mesurats (oficina BCN 492 + oficines magatzem 64)'],
          ['Tub corrugat flexible PVC Ø 32 mm', 'Derivacions a preses de paret (oficines)', '319,3 m mesurats (oficina BCN 259 + oficines magatzem 61)'],
          ['Tub d’acer galvanitzat Ø 32 mm', 'Baixades a molls i caixes de la nau (14 baixades)', '150,0 m mesurats']
        ], 'Taula 9. Metres de safata i tub a comprar.', { mono: [2] }) +
        D.p('En total: <b>≈ 1.053 m de safata metàl·lica</b> (300 × 60, 400 × 100 i 200 × 60), 16 m de tub de muntant, 20 m de tub ignífug al RITI, <b>≈ 556 m de tub corrugat Ø 40 mm i ≈ 319 m de Ø 32 mm</b> per a les derivacions i <b>150 m de tub d’acer Ø 32 mm</b> per a les baixades de la nau. Són els metres mesurats als plànols; a la compra s’hi suma un 10 % de marge per retalls i corbes.')],
      ['2.A2.6', 'Metres de cable a comprar',
        D.w('reels') +
        D.tbl(['Zona', 'Preses', 'Distància mitjana', 'Metres bruts'], [
          ['Oficina P0', '100', '50 m', '5.000'], ['Oficina P1', '154', '40 m', '6.160'], ['Oficina P2', '144', '40 m', '5.760'], ['Oficina P3', '144', '40 m', '5.760'], ['Magatzem (oest + est)', '152', '70 m', '10.640'],
          ['!Subtotal', '694 preses', '', '33.320 m'], ['!+ 10 % de pèrdues i marge', '', '', '≈ 36.700 m']
        ], 'Taula 10. Metres de cable Cat 6A U/FTP LSZH. Equival a unes 37 bobines de 1.000 m.', { mono: [1, 3] }) +
        D.tbl(['Enllaç', 'Metres'], [
          ['CPD → IDF-P1 (× 2 enllaços redundants)', '≈ 30'], ['CPD → IDF-P2 (× 2)', '≈ 50'], ['CPD → IDF-P3 (× 2)', '≈ 70'], ['Sala de comunicacions → IDF-02 (× 2)', '≈ 320'], ['RITI → CPD (fibra monomode de 2 operadors)', '≈ 30'],
          ['!Subtotal', '≈ 500 m'], ['!+ 15 % de marge i patch de rack', '≈ 575 m']
        ], 'Taula 11. Metres de fibra OM4 multimode (12 fibres).', { mono: [1] }) +
        D.p('Els models exactes de bobines, latiguillos, panells LC-LC i transceptors SFP+ són al pressupost.')]
    ]
  });

  LT.sec({
    id: '2.B1', t: 'Ubicació i dimensions dels racks (MDF/IDF)', short: 'Ubicació de racks i SAI',
    lead: 'Sis armaris operatius i un espai reservat. Cadascun amb la seva sala preparada al voltant i un SAI que no talla ni un mil·lisegon.',
    subs: [
      ['2.B1.1', 'Criteri de dimensionament',
        D.p('Un armari ben dimensionat ha de complir tres coses:') +
        D.ul(['<b>Que hi càpiga tot el d’avui amb el cablejat ordenat</b> (patch panels, organitzadors horitzontals, passos de cable laterals). Un rack ple de cables fa impossible el manteniment.',
          '<b>Deixar unitats lliures per créixer</b> (≈ 30 % de reserva física). Un switch més, un servidor nou o un altre panell de connexions hi han de cabre sense canviar el rack.',
          '<b>Permetre ventilació de davant cap enrere.</b> Els passius (panells, organitzadors) no tenen problema; els switches i els servidors necessiten aire fred al davant i sortida pel darrere.'])],
      ['2.B1.2', 'Inventari d’armaris',
        D.tbl(['Codi', 'Ubicació', 'Tipus', 'Mida', 'Contingut principal'], [
          ['<b>R1 (CPD)</b>', 'BCN · P0 · CPD', 'Rack de peu 19"', '42U, 800 × 1000 mm', 'Cores, tallafoc, routers, 2 switches d’accés P0, servidors, SAI, panells de connexions'],
          ['<b>R2 (reserva)</b>', 'BCN · P0 · CPD', 'Espai reservat', '42U', 'Buit. Reservat físicament al plànol per créixer.'],
          ['<b>IDF-P1</b>', 'BCN · P1 · patinet', 'Rack de peu 19"', '42U, 600 × 800 mm', '4 switches d’accés, patch panels, SAI, patch de fibra'],
          ['<b>IDF-P2</b>', 'BCN · P2 · patinet', 'Rack de peu 19"', '42U, 600 × 800 mm', '3 switches d’accés, patch panels, SAI, patch de fibra'],
          ['<b>IDF-P3</b>', 'BCN · P3 · patinet', 'Rack de peu 19"', '42U, 600 × 800 mm', '3 switches d’accés, patch panels, SAI, patch de fibra'],
          ['<b>R1 (ZGZ)</b>', 'ZGZ · sala de comunicacions', 'Rack de peu 19"', '42U, 800 × 1000 mm', 'Routers, tallafoc, cores, 3 switches d’accés, servidor local, SAI, panells'],
          ['<b>IDF-02</b>', 'ZGZ · extrem est de la nau', 'Armari mural 19"', '12U, 600 × 450 mm', '1 switch d’accés, SAI compacte, patch panel, patch de fibra']
        ], 'Taula 12. Inventari d’armaris. Total: 6 armaris operatius i 1 espai de reserva al CPD de Barcelona.')],
      ['2.B1.3', 'Espais tècnics associats',
        D.p('Els armaris sols no n’hi ha prou: hi ha d’haver sales preparades al voltant.') +
        D.h('Oficina de Barcelona') +
        D.ul(['<b>CPD (21,74 m²).</b> Terra tècnic de 25 cm, climatització de precisió de 3,5 kW redundant 1+1, control d’accés per targeta amb porta EI-120, detecció i extinció per aerosol condensat (FirePro FP-100), sensors d’humitat i temperatura connectats al NOC. Dos circuits elèctrics independents del CGBT, cadascun amb el seu interruptor.',
          '<b>Taller IT (15,22 m²).</b> Al costat del CPD, bancs de treball per preparar equips nous amb FOG (arrencada PXE). No té racks; només preses de corrent i de xarxa.',
          '<b>Magatzem IT (22,77 m²).</b> Material de recanvi, bobines de cable sobrant i latiguillos de reserva.',
          '<b>RITI (30,89 m²).</b> Entrada de les dues fibres dels operadors per canalitzacions independents. Només té l’ODF (repartidor òptic) i la roseta per al router de l’ISP.',
          '<b>IDF-P1, IDF-P2, IDF-P3.</b> Cadascun dins del patinet tècnic de la seva planta (≈ 4 m²). Ventilació natural per reixeta superior, sense refrigeració activa: la càrrega tèrmica d’un rack d’accés amb SAI és baixa.']) +
        D.h('Magatzem de Saragossa') +
        D.ul(['<b>Sala de comunicacions (45 m²).</b> A l’extrem oest de la nau, dins de la zona d’oficines. Climatització de precisió de 2,5 kW, control d’accés per targeta, extinció per aerosol, SAI del rack i SAI dedicat al servidor local.',
          '<b>IDF-02.</b> Armari mural a l’extrem est de la nau, muntat sobre un pilar estructural a 2,5 m d’alçada, amb ventilació forçada per dos ventiladors superiors. El SAI compacte va dins del mateix armari.'])],
      ['2.B1.4', 'Redimensionament dels SAI',
        D.p('El SAI ha de donar continuïtat elèctrica només als equips crítics: electrònica de xarxa (cores, tallafoc, routers, switches d’accés), servidors i AP. No alimenta PC, impressores, pantalles ni la climatització. Els telèfons IP, els AP i les càmeres <b>sí que hi compten</b>, perquè s’alimenten per PoE des dels switches. L’objectiu és <b>de 15 a 20 minuts d’autonomia</b>, el temps necessari per a:') +
        D.ul(['Una aturada controlada dels servidors si el tall és llarg.', 'L’arrencada d’un grup electrogen extern, si l’empresa el contracta més endavant.', 'Absorbir microtalls i transitoris de la xarxa, que és el que passa en el 90 % dels casos.']) +
        D.p('Per saber si cada SAI és el correcte calculem la càrrega real de cada rack: el consum de cada equip segons el seu full de dades, més tot el que els switches entreguen per PoE (telèfons, AP i càmeres), comptant un 10 % de pèrdues de la font en la part PoE. Primer, el consum de cada equip:') +
        D.tbl(['Equip', 'Consum considerat', 'D’on surt'], [
          ['Cisco Catalyst 9500-24Y4C (core BCN)', '250 W', 'Full de dades de Cisco, consum típic'],
          ['Cisco Catalyst 9300-48P (core ZGZ)', '150 W', 'Full de dades de Cisco, sense càrrega PoE (fa de core)'],
          ['Cisco Catalyst 9300L-48P-4X (accés)', '110 W + PoE', 'Full de dades de Cisco. Pressupost PoE de 505 W amb la font de 715 W'],
          ['Cisco ISR 4331 (router)', '70 W', 'Full de dades de Cisco, consum típic'],
          ['Cisco ASA 5506-X (tallafoc)', '25 W', 'Full de dades de Cisco'],
          ['Dell PowerEdge R450 (servidor)', '300 W', 'Configuració del projecte amb càrrega mitjana'],
          ['Consola KVM 1U', '30 W', 'Full de dades del fabricant'],
          ['Telèfon IP (PoE classe 2)', '6 W', 'Classe PoE del telèfon'],
          ['AP Wi-Fi 6 (PoE+)', '20 W (màx. 25,5 W)', 'Consum típic de l’AP; el màxim és el límit PoE+'],
          ['Càmera IP (PoE)', '7 W', 'Classe PoE de la càmera']
        ], 'Taula 13. Consum de cada equip que penja del SAI.', { mono: [1] }) +
        D.w('upsload') +
        D.tbl(['Rack', 'Equips', 'Consum dels equips', 'PoE entregat', 'Càrrega total', 'PoE per switch'], [
          ['BCN · CPD R1', '2 cores + ASA + 2 routers + 3 servidors + KVM + 2 switches d’accés', '1.815 W', '30 tel. + 12 AP = 420 W', '<b>2.282 W</b>', '210 W per switch (42 % de 505 W)'],
          ['BCN · IDF-P1', '4 switches d’accés', '440 W', '117 tel. + 14 AP = 982 W', '<b>1.531 W</b>', '246 W (49 %)'],
          ['BCN · IDF-P2', '3 switches d’accés', '330 W', '93 tel. + 14 AP = 838 W', '<b>1.261 W</b>', '279 W (55 %)'],
          ['BCN · IDF-P3', '3 switches d’accés', '330 W', '62 tel. + 14 AP = 652 W', '<b>1.054 W</b>', '217 W (43 %)'],
          ['ZGZ · CPD R1', '2 routers + ASA + 2 cores + 3 switches d’accés + 1 servidor + KVM', '1.125 W', '28 tel. + 10 AP + 6 càm. = 410 W', '<b>1.581 W</b>', '137 W per switch (27 %)'],
          ['ZGZ · IDF-02', '1 switch d’accés', '110 W', '7 AP + 6 càm. = 182 W', '<b>312 W</b>', '182 W (36 %)']
        ], 'Taula 14. Càrrega real de cada rack.', { mono: [2, 4] }) +
        D.p('Càrrega total = consum dels equips + PoE entregat ÷ 0,9 (rendiment de la font PoE ≈ 90 %). Cap switch arriba al seu pressupost PoE de 505 W, així que el PoE està ben repartit. El càlcul del Sprint 1 no comptava el PoE dels telèfons i els AP, i per això donava càrregues més baixes als IDF.') +
        D.tbl(['Rack', 'Model de SAI', 'Capacitat', 'Càrrega real', 'Autonomia real', 'Mòdul de bateries extra'], [
          ['BCN · CPD R1', 'APC Smart-UPS SRT 6000VA (SRT6KRMXLI)', '6.000 W', '2.282 W (38 %)', '≈ 17 min', 'No cal'],
          ['BCN · IDF-P1', 'APC Smart-UPS SRT 2200VA (SRT2200RMXLI)', '1.980 W', '1.531 W (77 %)', '≈ 6 min → ≈ 24 min', '1 × SRT72RMBP (2U)'],
          ['BCN · IDF-P2', 'APC Smart-UPS SRT 1500VA (SRT1500RMXLI)', '1.500 W', '1.261 W (84 %)', '≈ 8 min → ≈ 35 min', '1 × SRT48RMBP (2U)'],
          ['BCN · IDF-P3', 'APC Smart-UPS SRT 1500VA (SRT1500RMXLI)', '1.500 W', '1.054 W (70 %)', '≈ 11 min → ≈ 43 min', '1 × SRT48RMBP (2U)'],
          ['ZGZ · CPD R1', 'APC Smart-UPS SRT 3000VA (SRT3000RMXLI)', '2.700 W', '1.581 W (59 %)', '≈ 10 min → ≈ 35 min', '1 × SRT96RMBP (2U)'],
          ['ZGZ · IDF-02', 'APC Smart-UPS SRT 1000VA (SRT1000RMXLI)', '1.000 W', '312 W (31 %)', '≈ 41 min', 'No cal']
        ], 'Taula 15. Models de SAI triats i autonomia amb la càrrega real.', { mono: [2, 3, 4] }) +
        D.p('<b>Conclusió:</b> cap SAI queda sobrecarregat (el més carregat és el de l’IDF-P2, al 84 %), però <b>quatre no arribaven als 15 min</b> que ens havíem marcat: els tres IDF de Barcelona i el CPD de Saragossa. En lloc de canviar-los per un model més gran, <b>els afegim un mòdul de bateries extern</b> de la mateixa sèrie. Va a sota del SAI (2U; als IDF i al CPD de Saragossa sobra espai) i en multiplica l’autonomia. Els SAI del CPD de Barcelona i de l’IDF-02 ja arriben al mínim tal com estan.') +
        D.p('<b>Autonomies.</b> Són aproximades, a partir de la corba d’autonomia que publica APC per a la sèrie SRT; la real depèn de l’estat i la temperatura de les bateries.') +
        D.p('<b>Cost.</b> Els quatre mòduls sumen ≈ 3.000 € + IVA i ja són al pressupost.')],
      ['2.B1.5', 'Per què SAI online de doble conversió i no de línia interactiva',
        D.p('El SAI de línia interactiva (el típic de casa o d’una oficina petita) és més barat, però commuta a bateria quan detecta el tall i triga <b>de 2 a 6 ms</b> a fer-ho. Per a un PC d’usuari és invisible, però un servidor o un switch de core amb aquest temps de transferència es pot reiniciar si la tensió d’entrada ja arribava degradada abans del tall.',
          'El SAI online de doble conversió regenera el senyal tot el temps: el corrent sempre passa pel rectificador i l’inversor, les bateries són en línia i <b>no hi ha temps de transferència</b>. És el que es demana per a electrònica crítica i és el que posem a tots els racks del projecte. Talla la llum als dos i compara’ls:') +
        D.w('ups')],
      ['2.B1.6', 'Monitoratge dels SAI',
        D.p('Tots els SAI triats porten targeta de xarxa AP9641 integrada o com a accessori, amb SNMP v3. Es monitoren des del NOC (P3) per la VLAN 99 de gestió i envien alertes per correu quan:') +
        D.ul(['Hi ha un tall de corrent.', 'La bateria baixa del 50 % de càrrega.', 'Cal substituir la bateria (indicador de salut).', 'La temperatura interna supera un llindar.']) +
        D.p('Als racks d’accés (IDF), amb càrregues petites, el monitoratge és només SNMP. Al CPD el SAI també es connecta per USB al servidor SRV-HV01 com a canal de reserva, per si es talla la VLAN de gestió.')]
    ]
  });

  LT.sec({
    id: '2.B2', t: 'Esquema d’alçat del rack (Rack Elevation)', short: 'Alçat dels racks',
    lead: 'Cada U té el seu lloc: el que pesa, a baix; el que més es toca, a l’alçada de les mans; la fibra, a dalt.',
    subs: [
      ['2.B2.1', 'Criteri de distribució',
        D.p('La distribució dins d’un rack segueix sempre aquesta lògica (de baix a dalt):') +
        D.ul(['<b>Zona inferior (U1 a U6)</b>: SAI i les seves bateries extra. Són els elements més pesants; concentrar el pes a baix abaixa el centre de gravetat i facilita el muntatge.',
          '<b>Zona central baixa (U7 a U18)</b>: servidors físics, també pesants i amb cablejat posterior molt dens.',
          '<b>Zona central (U19 a U28)</b>: electrònica de xarxa (cores, routers, tallafoc) amb els seus organitzadors horitzontals. És la zona que més es toca: a una alçada còmoda de treball.',
          '<b>Zona central alta (U29 a U38)</b>: switches d’accés i els seus patch panels. Cada switch va just sota (o sobre) el seu patch panel, amb un organitzador horitzontal al mig.',
          '<b>Zona superior (U39 a U42)</b>: patch panel de fibra, consola/KVM i la safata d’entrada de cables superior.']) +
        D.p('Entre cada parell d’elements actius es deixa un organitzador horitzontal d’1U (amb anelles o amb tapa) perquè els latiguillos quedin ordenats i no tapin el pas de l’aire. Passa el ratolí per cada U:') +
        D.w('rack') +
        D.p('Dels 6 armaris operatius, els més carregats són els dos CPD (BCN R1 al 69 %, ZGZ R1 al 52 %) perquè concentren electrònica i servidors. Els IDF queden clarament per sota (de 14 a 17U de 42), i és a propòsit: un armari d’accés ha de tenir marge per a un switch més o un patch panel sense obrir sostres ni reorganitzar res. L’IDF-02 del magatzem és un armari mural petit perquè allotja un sol switch i va penjat del pilar: un rack de 42U allà no té sentit.') +
        D.evs([6, 7, 8])]
    ]
  });

  LT.sec({
    id: '2.B3', t: 'Selecció i justificació del maquinari de xarxa', short: 'Maquinari de xarxa',
    lead: 'Models reals, de fabricants coneguts i amb disponibilitat al mercat. Ni el més barat ni el més car: el que compleix.',
    subs: [
      ['2.B3.1', 'Criteris',
        D.p('Per a cada peça de la infraestructura busquem models reals, de fabricants coneguts i disponibles al mercat (PCComponentes, Macnet, Landatel, distribuïdors oficials de Cisco, HPE, Ubiquiti, etc.). Els criteris van ser:') +
        D.ul(['<b>Encaix amb les necessitats del client</b> (nombre de ports, PoE, velocitat, cobertura Wi-Fi): no sobredimensionar perquè sí.',
          '<b>Fabricants amb suport i recanvis a llarg termini</b>, per garantir una vida útil de 7 anys o més.',
          '<b>Compatibilitat entre peces</b>: mateixa família de switches i AP on té sentit, SFP compatibles, bastidors estàndard de 19".',
          '<b>Marge de creixement</b>: cada switch deixa ≈ 20 % de ports lliures i cada rack deixa unitats lliures.',
          '<b>Relació qualitat-preu</b>: el que compleix els requisits amb bona reputació.'])],
      ['2.B3.2', 'Equips triats',
        D.w('hw') +
        D.p('La relació completa de models, unitats i preus és al pressupost (full de càlcul), que també es pot veure resumit a la secció <a href="#/presupuesto">Pressupost</a>.')]
    ]
  });

  LT.sec({
    id: '2.C', t: 'Topologia física al Packet Tracer', short: 'Topologia al Packet Tracer',
    lead: 'Vam tornar a muntar el Packet Tracer sobre els plànols nous (un sol rack al CPD) i, com es va demanar a la revisió, amb una versió simplificada: un parell d’equips per VLAN.',
    sc: ['topo', 'Recorre la topologia completa del Packet Tracer, equip per equip.'],
    subs: [
      ['2.C.1', 'Criteri: un Packet Tracer simplificat',
        D.p('A l’Sprint 1 el Packet Tracer tenia tots els equips dels plànols (més de 800 dispositius). A la revisió se’ns va demanar una còpia simplificada amb un parell d’equips per VLAN, per poder configurar i provar-ho tot de debò. El fitxer d’aquest sprint té <b>105 dispositius</b>: tota l’electrònica de xarxa real (cores, routers, tallafocs, un switch d’accés per planta) i, penjant de cada switch, només els equips necessaris per provar cada VLAN.') +
        D.tbl(['Tipus', 'Barcelona', 'Saragossa', 'Internet', 'Model al Packet Tracer'], [
          ['Routers', 'BCN-RT1, BCN-RT2', 'ZGZ-RT1, ZGZ-RT2', 'ISP-1 a ISP-4', 'ISR 4331'],
          ['Tallafoc perimetral', 'BCN-FW', 'ZGZ-FW', '—', 'ASA 5506-X'],
          ['Cores (capa 3)', 'BCN-CORE1, BCN-CORE2', 'ZGZ-CORE1, ZGZ-CORE2', '—', 'Catalyst 3650-24PS'],
          ['Switches d’accés', 'BCN-P0..P3-ACC1 (un per planta)', 'ZGZ-ACC1, ZGZ-ACC2, ZGZ-ACC4', '—', 'Catalyst 2960-24TT'],
          ['Servidors', 'SRV-HV01, SRV-HV02, SRV-HV03', 'SRV-ZGZ01', 'DNS-PUBLICO', 'Server-PT'],
          ['PC, telèfons i impressores', '10 PC, 2 telèfons IP, 2 impressores', '10 PC, 1 telèfon IP, 1 impressora d’etiquetes, 2 càmeres', 'PC-INTERNET', 'PC-PT, 7960, Printer-PT'],
          ['Wi-Fi', '4 AP, 2 mòbils', '3 AP, 2 mòbils, 1 tauleta', '—', 'AccessPoint-PT'],
          ['Cablejat', '4 panells de connexions, rosetes', '3 panells de connexions, rosetes', '—', 'Copper Patch Panel / Wall Mount']
        ], 'Taula 16. Dispositius del Packet Tracer simplificat.') +
        D.p('La nomenclatura segueix sempre el mateix patró: <code>SEU-PLANTA-FUNCIÓ-NÚMERO</code>. Per exemple, <code>P1-ADM-03</code> és el lloc 3 d’administració de la planta 1 i <code>BCN-P1-ACC1</code> és el switch d’accés d’aquella planta.')],
      ['2.C.2', 'Topologia lògica',
        D.p('Cada seu segueix el mateix esquema de tres nivells: <b>accés → core → tallafoc → routers → Internet</b>. Cada switch d’accés té dos enllaços troncals, un a cada core; els dos cores estan units per un EtherChannel de dos cables; el tallafoc ASA té una pota cap a cada core i una altra cap a cada router; i cada router surt a Internet per un ISP diferent. Així cap part de la xarxa depèn d’un sol cable ni d’un sol equip.') +
        D.w('tracer', { h: 520 }) +
        D.p('Tots els enllaços han de tenir els triangles en verd, tret d’un dels dos troncals de cada switch d’accés, que Spanning Tree deixa bloquejat de reserva (punt 4.A3). A la vista de dalt es veuen en taronja.') +
        D.fig(9)],
      ['2.C.3', 'Topologia física sobre els plànols',
        D.p('A la vista física (Physical) carreguem de fons els plànols de cada planta i col·loquem cada equip a la sala on va: els switches d’accés al seu IDF, els cores i els servidors al rack del CPD i cada PC a la seva sala. El cablejat també és el real: el PC va a una roseta de paret o de caixa de terra, la roseta a un panell de connexions de l’armari i el panell al switch.') +
        D.chk('Vista Physical', 'Barcelona → Planta 0', 'Que el fons és el plànol nou de la planta baixa, amb el CPD d’un sol rack, i que els equips són a la seva sala.', 10) +
        D.chk('Vista Physical', 'Barcelona → Planta 0 → CPD → doble clic al rack', 'Que al CPD hi ha un únic rack amb els routers, el tallafoc, els dos cores, els servidors i el panell de connexions.', 11) +
        D.chk('Vista Physical', 'Saragossa → Nau', 'El plànol del magatzem de fons, amb la sala de comunicacions a l’oest, l’IDF-02 a l’est i l’enllaç de fibra entre tots dos.', 12) +
        D.chk('BCN-CORE1', 'show cdp neighbors', 'Que el core veu els quatre switches d’accés (un per planta) i el CORE2 pel Port-channel 1, és a dir, pels dos ports de l’EtherChannel (Gig1/0/23 i Gig1/0/24).', 13)]
    ]
  });
})();
