# LogiTrans · memoria interactiva

Web del proyecto LogiTrans (ASIX2C 0379 · Institut F. Vidal i Barraquer): toda la memoria final, el Packet Tracer simulado dentro de la web y un modo presentación para la defensa.
HTML, CSS y JavaScript sin frameworks. Funciona con doble clic sobre `index.html`, sin servidor y sin Internet.

## Tres formas de usarla

- **Navegación libre (por defecto).** Índice lateral con los mismos puntos que el documento final, del 0 al 6. Cada apartado tiene su texto, sus comprobaciones con la captura real y widgets interactivos.
- **LogiTrans Tracer** (`#/tracer`). La topología del Packet Tracer con consola en cada equipo, modo simulación paquete a paquete y 17 escenarios que repiten las pruebas de la memoria. Las ACL usan las líneas y los contadores reales de las capturas.
- **Modo presentación** (`P`). Diapositivas a pantalla completa generadas desde la misma memoria, con los widgets vivos. `S` abre la vista del presentador en otra ventana. `Esc` vuelve al apartado donde estabas.

## Castellano y catalán

El botón `ES | CA` de la barra superior cambia el idioma y lo recuerda en el navegador. También se puede abrir directamente en catalán con `index.html?lang=ca`.

- La memoria en catalán está en `js/doc-ca/` (un archivo por capítulo, más los pies de las capturas). Si se cambia un texto en `js/doc/`, hay que cambiarlo también ahí.
- Los textos de la interfaz, los widgets y el Tracer se traducen con el diccionario `js/i18n/ca.js` desde `js/core/i18n.js`.
- Las salidas de consola de los equipos Cisco no se traducen: son las mismas en los dos idiomas.

## Atajos

| Tecla | Qué hace |
| --- | --- |
| `Ctrl` + `K` o `/` | Buscar en toda la memoria |
| `[` `]` | Apartado anterior y siguiente |
| `T` | Abrir el Tracer |
| `N` | Siguiente paso del escenario abierto |
| `P` | Modo presentación |
| Flechas · Espacio | Siguiente y anterior (en presentación) |
| `G` · `B` · `S` | Todas las diapositivas · pantalla en negro · presentador |
| `Esc` | Cerrar o salir |
| `?` | Ayuda |

En cualquier comprobación de red, el botón «Ejecutar en el Tracer» abre la consola del equipo con el comando ya escrito.

## Estructura

```
index.html            la web
presenter.html        vista del presentador (se sincroniza sola con BroadcastChannel)
css/
  fonts.css           fuentes locales (Archivo, IBM Plex Sans, IBM Plex Mono)
  app.css             paleta, tipografía, layout, portada, presupuesto
  widgets.css         widgets de cada capítulo
  tracer.css          simulador
  present.css         modo presentación
js/
  data/               datos de la memoria, capturas, notas y diapositivas
  core/               utilidades, render de la memoria, portada, buscador, visor, presentación
  doc/                el texto de la memoria por capítulos (0 a 6)
  doc-ca/             la misma memoria en catalán
  i18n/               diccionario de la interfaz en catalán
  widgets/            widgets interactivos por capítulo
  tracer/             modelo de red, CLI de IOS y ASA, consolas de PC y PowerShell, escenarios, interfaz
assets/               imágenes, planos, capturas y fuentes
downloads/            memoria, Packet Tracer y planos para descargar
```

## Nota sobre el Tracer

Es una réplica del Packet Tracer v5: 46 de los 105 equipos, con la misma topología, el mismo direccionamiento y las mismas listas de acceso. Las salidas de consola se reconstruyen a partir de las capturas de la memoria.
