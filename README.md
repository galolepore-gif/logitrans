# LOGITRANS // NETWORK OS

Web de presentación del proyecto LogiTrans (ASIX2C 0379 · Institut F. Vidal i Barraquer).
Una sola página que se recorre con el scroll o se presenta paso a paso delante del tribunal.

## Cómo abrirla

- **Con doble clic:** abrí `index.html`. Funciona sin servidor y sin Internet (sirve para llevarla en un USB).
- **Online:** GitHub Pages publica la raíz del repositorio.
- `index.html?pres` arranca directamente en modo presentación.

## Atajos

| Tecla | Qué hace |
| --- | --- |
| `P` | Modo presentación (pantalla completa, paso a paso) |
| Flechas · Espacio · clic | Siguiente / anterior paso |
| `S` | Vista de ponente en otra ventana (notas, siguiente capítulo, cronómetro) |
| `B` | Pantalla en negro |
| `F` | Pantalla completa |
| `Ctrl` + `K` | Consola de comandos (ping, ssh, show, traceroute… con las reglas reales) |
| `R` | Rúbrica del Sprint 2 |
| `T` | Modo NOC (oscuro) / modo plano (claro, para proyectores flojos) |
| `M` | Sonido |
| `1` … `9`, `0` | Ir a un capítulo |
| `?` | Ayuda |

## Estructura

```
index.html          la presentación completa (20 capítulos)
presenter.html      vista de ponente (se abre con S)
css/
  fonts.css         fuentes locales (Unbounded, IBM Plex Sans, JetBrains Mono)
  base.css          colores, tipografía, paneles, botones, terminal
  hud.css           barra superior, traceroute lateral, arranque, consola, visor, modo presentación
  chapters.css      estilos de cada capítulo, en el orden del recorrido
js/
  data/data.js      todos los datos del proyecto sacados de la memoria (VLAN, subredes, racks, ACL, presupuesto…)
  data/evidence.js  las 164 capturas de la memoria con su pie
  data/notes.js     notas de ponente por capítulo
  core/             motor: utilidades, sonido, visor de evidencias, escenas, modo presentación, consola
  scenes/           un archivo por capítulo o grupo de capítulos
  main.js           arranque, atajos y reloj
assets/
  capturas/         capturas de la memoria (WebP)
  planos/           planos de cada planta (WebP)
  fonts/            fuentes
  img/              favicon y QR
downloads/          memoria (PDF y Word), Packet Tracer y planos draw.io
```

Sin frameworks ni dependencias: HTML, CSS y JavaScript clásico. Los datos están en `js/data/data.js`:
si cambia algo en la memoria, se cambia ahí y se actualiza en toda la web.

## Notas

- El PDF de la memoria se generó desde el Word con LibreOffice. Si hace falta el PDF oficial exportado desde Word, reemplazá `downloads/LogiTrans_Memoria.pdf`.
- El QR apunta a `https://galolepore-gif.github.io/logitrans/`. Si el repositorio tiene otro nombre, hay que regenerar `assets/img/qr.svg` y cambiar `LT.SITE_URL` en `js/scenes/cierre.js`.
- En el área de clientes de la demo, el usuario es `cliente1` y la contraseña `demo`. Los envíos que se ven son datos de ejemplo.
