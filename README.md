# CAMENA 2.0

Sitio del estudio creativo y tecnológico **CAMENA**.
Estático, sin dependencias, sin paso de compilación: se sube tal cual.

> **Tu idea. Nuestra solución.**

---

## Estructura: qué va en el inicio y qué no

La página de inicio está pensada para **una sola cosa: que alguien vea qué se
vende, cuánto cuesta y pueda pedir su cotización en menos de un minuto.**
Todo lo demás vive en páginas propias, enlazadas pero fuera del camino:

| Página | Para qué sirve |
|---|---|
| `index.html` | Qué se vende con precio, siete diagnósticos, cuatro etapas, tres prototipos, armador de paquete, preguntas y contacto |
| `servicios.html` | El catálogo completo: los siete servicios en detalle |
| `como-trabajamos.html` | El método paso por paso y la mecánica de pago |
| `producto/control-de-autos.html` | La herramienta del taller, publicada sin marca ni nombre para compartirla por enlace |

**Regla al añadir contenido:** si algo explica pero no ayuda a decidir, va en
una página secundaria. El inicio no es un folleto.

---

## Qué es esto

CAMENA es un **estudio de diseño y sistemas** en Apatzingán: construye
**micro-sistemas y herramientas digitales a partir de la forma de trabajar de
cada negocio**, y trabaja la identidad, las interfaces y el contenido que lo
sostienen. La frase que gobierna el sitio es la del titular: *cada negocio opera
distinto; su software también debería.*

El eje se repite en todas las secciones, y ahí está la prueba de que es el eje:

| Sección | Cómo se ve el eje |
|---|---|
| Hero | Etiqueta de estado con punto verde, titular en dos renglones (`Cada negocio opera distinto.` / `Su software también debería.`, este último en magenta) y la tira de condiciones en mono: `Sin piezas sobrantes · Sin adaptaciones forzadas`. |
| Índice lateral | Sin caja: lista tipográfica con filete vertical. Abre con los cuatro pilares y cierra con las dos líneas aparte. |
| Diagnósticos | La sección se titula **«¿Qué te está costando dinero?»** y cada tarjeta nombra el costo (regateo, ventas que no cuadran, deudas que no se cobran). La tarjeta resaltada es la operativa. |
| Precios | Tres etapas (marca · presencia · **sistemas**) y **dos líneas aparte** (producción de contenido y proyectos especiales). La etapa de sistemas es la banda protagonista, en magenta. |
| `servicios.html` | Tres grupos separados: **sistemas y diseño** (los cuatro pilares), **contenido y producción** y **campañas y proyectos especiales**. Nada se mezcla. |
| `como-trabajamos.html` | Abre con el manifiesto del método y sigue con los seis pasos. |

### Los dos productos

Hay **dos** productos, y no son la misma cosa ni se muestran igual. Uno de ellos
**ya no vive en este repo**: su código se movió fuera, a `~/productos-camena/`,
para que no se pueda leer ni copiar desde GitHub.

| | Expediente del taller | `producto/control-de-autos.html` |
|---|---|---|
| Qué es | El **expediente del taller**, reconstruido desde los dolores reales | La app original de **Control de Autos**, tal como la usaba el taller |
| Diseño | El sistema de diseño del sitio (`css/variables.css`) | Propio: fondo oscuro, Oswald + IBM Plex Sans |
| Se muestra | En los ejemplos del inicio, con capturas reales y **sin enlace para abrirlo** | **No.** Se comparte por enlace con quien la va a usar |
| Archivos | `taller.html` + `taller.js`, **fuera del repo** | Un solo archivo, sin dependencias |
| Guarda en | `camena:taller:estado` (+ fotos en IndexedDB) | `taller_autos_v1` y `taller_aseguradoras_v1` |

Ninguno de los dos es una maqueta: los dos se abren y se usan. Y ninguno se
presenta como lo que no es — Control de Autos no tiene fotos por etapa, ni
conformidad firmada, ni refacciones detenidas; eso vive en el expediente.

**Dónde vive el código y por qué.** El expediente está en
`~/productos-camena/taller/` (`taller.html` + `taller.js`), fuera del repo. Se
saca de aquí por una razón concreta: este repositorio es **público**, así que
cualquier archivo que entre queda legible para todo el mundo, aunque la página
no se publique. Publicar sin enlazar no protege nada; sacarlo del repo, sí.
El despliegue además lleva un candado: si alguien vuelve a dejar un archivo de
producto en `producto/`, la publicación **falla** en vez de regalarlo en
silencio (ver el paso «Preparar solo lo que se publica»).

#### Expediente del taller (fuera del repo, en `~/productos-camena/taller/`)

El expediente del taller no es una maqueta: es un producto completo y funcional.
En los ejemplos del inicio **se muestra con capturas reales, sin enlace para
abrirlo**, y esa decisión es a propósito: el código de una página publicada se
puede descargar entero desde el navegador, así que si el sistema se puede
probar, se puede copiar. El producto se entrega al cliente que lo contrata, no
se regala en la vitrina.

**Qué se enseña en su lugar.** Dos capturas reales del sistema funcionando
—el tablero por etapas y el expediente de un auto— con la etiqueta
«Sistema propio». Eso muestra el trabajo sin entregar el archivo.

> ⚠️ **Regla al mantener esto:** ninguna página de producto terminado se enlaza
> desde el sitio. Lo que se enseña es la captura y el video; el sistema se
> entrega aparte. `Control de Autos` es la excepción porque es la herramienta
> que el taller ya usaba y su enlace es de trabajo, no de vitrina — y aun así
> conviene recordar que su código también es descargable.

**Qué hace.** Registra la entrada de un auto (descripción, color, placa,
aseguradora, folio y notas), cuenta los días que lleva dentro, marca la salida y
lo manda al historial, busca y filtra por aseguradora, permite reingresar y
eliminar, deja ajustar la lista de aseguradoras y descarga un respaldo en JSON
que se puede volver a cargar en otra computadora.

**Cómo está hecho, y por qué así.**

- **Vive en el navegador.** Los datos se guardan en `localStorage` bajo las claves
  `camena:taller:*`. No hay servidor, no hay cuenta y no sale ningún dato de la
  máquina; el precio de eso es que hay que descargar el respaldo si se limpia el
  navegador, y el producto lo dice en su propio pie en lugar de esconderlo.
- **Usa el sistema de diseño del sitio.** Enlaza `css/variables.css` y
  `css/base.css`: los mismos tokens y las mismas fuentes auto-hospedadas, sin
  `@import` de Google Fonts ni un segundo juego de colores que mantener.
- **El estado se dice con palabra y color.** Los días llevan la etiqueta
  «demorado» (7+) o «vencido» (14+) además del color: el color solo no informa a
  todo el mundo.
- **Accesibilidad de serie**: etiquetas asociadas a cada campo, ventanas con
  `role="dialog"` y `aria-modal`, cierre con `Escape`, foco que vuelve al botón
  que abrió, pestañas con `role="tab"` y flechas del teclado, y el aviso flotante
  con `aria-live`.

**Lo que NO es.** No tiene respaldo en la nube, no sincroniza entre computadoras,
no maneja varias sucursales y no distingue usuarios: es un micro-sistema de un
solo mostrador. Está dicho así para que nadie lo contrate esperando otra cosa.

**De dónde salió lo que hace.** Antes de programarlo se levantaron los dolores
reales de un taller de hojalatería y pintura: 13 notas de voz de la encargada,
transcritas en esta máquina y analizadas en `docs/investigacion-taller.md`. Ese
documento —interno, no se publica— lista cada dolor con la cita que lo prueba, su
costo y la función que lo resuelve, y marca lo que todavía falta preguntar. Es la
base de la siguiente versión del producto.

#### Control de Autos (`producto/control-de-autos.html`)

Es la app que el taller ya conocía, publicada tal cual para poder pasarla por
enlace —el encargado la abre desde el celular sin instalar nada—. Registra la
entrada de un auto (descripción, color, placa, aseguradora, folio, notas), cuenta
los días que lleva en piso, marca la salida, lo manda al historial, filtra por
aseguradora, deja ajustar la lista de aseguradoras y descarga un respaldo en JSON.

**Va sin marca y sin nombre.** La página no dice CAMENA en ningún lado —ni en el
título de la pestaña, ni en la cabecera, ni en el pie— y **no lleva el nombre de
nadie**: es la herramienta de trabajo del taller, no un anuncio. Si algún día se
quiere volver a firmar, se agrega un renglón al pie; hoy no lo lleva a propósito.

**Cómo vive aquí, y qué se le cambió al subirla:**

- **Se le quitaron las peticiones a Google.** Traía un `@import` de Google Fonts
  (Oswald e IBM Plex Sans). Ahora las dos familias se sirven desde
  `assets/fonts/`: son archivos **variables**, uno por familia, así que un solo
  `@font-face` cubre todos los pesos (Oswald 500–700, IBM Plex Sans 400–700). La
  página ya no pide nada a ningún tercero, igual que el resto del sitio.
- **Se le puso descripción, color de tema y favicon**, para que al compartir el
  enlace no aparezca en blanco y para que la pestaña traiga la marca.
- **No se enlaza desde el sitio y no entra al sitemap.** Es una herramienta, no
  una página de venta: se comparte con quien la va a usar, no se anuncia.

**Lo que NO es.** No tiene fotos por etapa, ni conformidad firmada, ni refacciones
detenidas: eso es el expediente. Los datos viven en el navegador de cada
computadora (claves `taller_autos_v1` y `taller_aseguradoras_v1`), así que no se
sincronizan solos — para eso está el respaldo en JSON.

**Se prueba sola.** `node docs/probar-producto.mjs` abre la página con Chrome,
comprueba que no haga ninguna petición externa, que carguen las fuentes, que no
se desborde a lo ancho, y da de alta un auto para verificar que se guarde y siga
ahí después de recargar. Pasa en 1440, 768, 390 y 320 px.

---

**Los cuatro pilares** (grupo «Sistemas y diseño» en el catálogo):

1. **Arquitectura operativa** — el análisis del flujo real antes de programar.
2. **Micro-sistemas locales** — software propio, cerrado y del cliente, sin cuotas perpetuas.
3. **Interfaces de alta velocidad** — web desde cero, sin plantillas pesadas.
4. **Identidad y presencia** — la traducción visual del negocio.

Tres reglas gobiernan todas las decisiones de aquí:

1. **Honestidad comercial.** No hay clientes, testimonios, cifras, premios ni
   equipo inventados. Donde una agencia normalmente pondría una foto falsa o un
   «+500 clientes», aquí hay trabajo propio etiquetado como tal.
2. **La IA es una herramienta, no el producto.** Si se borrara la palabra «IA»
   del sitio, la propuesta seguiría en pie.
3. **El criterio es humano.** La tecnología acelera, pero decide y revisa una
   persona, y eso se dice con claridad.

---

## Voz y redacción (cómo se escribe aquí)

El sitio pasó por tres correcciones: primero sonaba a agencia genérica, después a
explicación defensiva y al final a estudio que hace sobre todo páginas web. La voz
que quedó es esta, y aplica a cualquier texto nuevo:

| Regla | Se escribe así | No se escribe así |
|---|---|---|
| **Entra por el dolor, no por la justificación.** | «Si tu imagen no está a la altura de tu trabajo, pierdes clientes. Si tu operación vive en un cuaderno, pierdes dinero.» | «Casi nadie llega pidiendo un servicio…» |
| **Frases cortas y en segunda persona.** El sujeto es el negocio del cliente, no el estudio. | «Te ves más pequeño de lo que eres.» | «Un logotipo hecho en una app puede transmitir…» |
| **Un párrafo, una idea.** Máximo dos o tres renglones. | Un renglón por viñeta, en sustantivos concretos. | Párrafos que explican por qué el problema es un problema. |
| **Se dice qué se entrega, no cómo nos sentimos.** | «Cotizaciones que se arman solas.» | «Nos apasiona acompañarte en tu proceso.» |
| **El dolor se cuenta en dinero, tiempo o control.** | «Entregas y no sabes quién te debe ni cuánto.» | «La organización es clave para crecer.» |
| **La honestidad es parte del tono, no una disculpa.** | «No son trabajos de clientes: son problemas de negocio reales, resueltos hasta el final.» | «Todavía no tenemos autorización, pero…» |

**Reglas de estructura de la página que acompañan a la voz:**

- **El titular del hero son dos renglones cortos** —qué es el taller y qué se
  lleva el cliente—, nunca una frase completa: una promesa larga ocupa cinco
  renglones a cuerpo de display y empuja el botón fuera de la primera pantalla.
  Debajo van **las dos mitades del estudio en
  columnas del mismo ancho** —«te ves profesional» y «operas sin enredos»— para
  que ninguna quede en segundo plano; después la línea del dolor, en dos frases
  simétricas (imagen y operación), y el botón de WhatsApp que cierra el primer
  pantallazo. En móvil, el rótulo de cada mitad pasa a ir en línea: esos dos
  renglones son el botón dentro de la pantalla.
- **El panel lateral del hero es un índice, no un protagonista.** Va sobre
  papel, con filete de 1 px, letra menuda y sin subrayados: el ojo debe ir al
  titular y al botón, no a la lista.
- **Los diagnósticos son tarjetas de impacto**: el problema en una frase, tres
  entregables de cuatro palabras y el botón. Nunca tres viñetas de dos
  renglones. La tarjeta resaltada (`.caso-tarjeta--abierta`, la única oscura) es
  la del caso operativo: si el eje del estudio cambia, la tarjeta resaltada
  cambia con él.
- **Evitar el registro de manual de autoayuda**: nada de «no estás solo»,
  «transforma tu negocio» ni promesas de crecimiento.

---

## Estructura del proyecto

```
camena-2.0/
├── index.html                  Página principal (7 secciones)
├── servicios.html              Catálogo completo, con precios
├── producto/
│   └── control-de-autos.html   Control de Autos: app de una sola página, con
│                               su propio enlace para el taller. Sin marca y sin
│                               nombre. No se enlaza desde el sitio ni entra al
│                               sitemap: se comparte con quien la va a usar.
│
├── assets/video/               Videos del sitio (720×1280, comprimidos):
│   ├── reel-cliente.mp4        Reel para cliente, con visto bueno
│   └── *.webp                  Pósteres: no se carga nada hasta dar reproducir
├── como-trabajamos.html        El método completo, paso por paso
├── aviso-de-privacidad.html    Página legal
├── terminos.html               Página legal
├── site.webmanifest            Datos de instalación como app
├── robots.txt                  Instrucciones para buscadores
├── sitemap.xml                 Mapa del sitio
│
├── css/
│   ├── variables.css           Tokens: color, tipografía, espacio, movimiento
│   ├── base.css                Reset, tipografía base, accesibilidad, impresión
│   ├── layout.css              Retícula, ritmo y composición de cada sección
│   ├── components.css          Componentes reutilizables
│   ├── animaciones.css         Apariciones y microinteracciones
│   └── responsive.css          Reorganización por ancho (1140 · 900 · 720 · 560 · 400)
│
├── js/
│   ├── navegacion.js           Cabecera, menú móvil, progreso, sección activa
│   ├── animaciones.js          Aparición de bloques al entrar en pantalla
│   ├── interacciones.js        Disciplinas, resolutor de necesidades, proceso, cadena
│   └── contacto.js             Formulario, copiar datos, validación
│
├── assets/
│   ├── marca-camena.svg        La marca: arco abierto + foco
│   ├── icono-camena.svg        Versión de trazo grueso para tamaños pequeños
│   ├── favicon.ico / .png      Juego de íconos
│   ├── apple-touch-icon.png
│   ├── og-camena.png / .webp   Imagen para compartir en redes
│   └── fonts/                  Jakarta Sans + JetBrains Mono auto-hospedadas,
│                               más Oswald e IBM Plex Sans (solo para
│                               Control de Autos: es otro diseño, no el del sitio)
│
└── docs/
    ├── verificar-contraste.py  Comprueba la paleta contra WCAG AA
    ├── auditar.sh              Auditoría del sitio renderizado
    ├── movil.mjs               Auditoría con ancho de móvil real
    ├── probar-producto.mjs     Prueba Control de Autos de punta a punta: que no
    │                           pida nada externo, que carguen las fuentes, que
    │                           no se desborde y que un alta se guarde y siga
    │                           ahí después de recargar
    ├── autorizaciones.md       Qué trabajo de cliente está autorizado y qué cubre
    ├── recetas.md              Recetario para editar el sitio
    ├── laboratorio.html        Colores, texturas y resaltes, con CSS para copiar
    ├── revisar.sh              Prepara la copia local con el marcador
    ├── aplicar.mjs             Pasa los cambios del marcador al sitio real
    ├── capturar-revision.mjs   Capturas de una revisión, con dibujos y notas
    └── revision/               El marcador (css + js); la copia vive aquí y no se versiona
```

El orden de carga de los CSS importa y es el de la lista: tokens → base →
layout → componentes → animaciones → responsive. `responsive.css` va al final
porque reescribe composiciones, no colores ni componentes.

---

## Cómo verlo en local

No hace falta nada especial: es HTML, CSS y JS. Basta con servirlo por HTTP
(abrirlo con `file://` funciona, salvo las fuentes por política de origen).

```bash
cd camena-2.0
python3 -m http.server 8899 --bind 127.0.0.1
# → http://127.0.0.1:8899/
```

---

## Revisar y editar el sitio tú mismo

Tres herramientas de trabajo que viven en `docs/` y **nunca se publican** (el
flujo de despliegue no copia esa carpeta):

| Herramienta | Para qué sirve | Cómo se abre |
|---|---|---|
| `docs/revisar.sh` | **El lápiz.** Copia el sitio a una carpeta local y le inyecta el modo de revisión: se **dibuja encima de la página** con el ratón (encerrar una palabra, subrayar, una flecha) y al soltar se abre sola la ventana para escribir la instrucción. Con «Texto» se escribe el texto nuevo y se ve aplicado al instante. | `bash docs/revisar.sh` → `…/docs/revision/sitio/index.html` |
| `docs/aplicar.mjs` | **El aplicador.** Toma el JSON del marcador y lleva los cambios de texto a los HTML reales, con simulación previa y sin tocar nada si el texto original no aparece exactamente una vez. Las notas y los dibujos quedan en `Revision-pendientes.md`. | `node docs/aplicar.mjs Revision-CAMENA.json [--escribir]` |
| `docs/capturar-revision.mjs` | **El visor.** Abre la copia con una revisión cargada y saca una captura por página con los dibujos y las notas encima: sirve para revisar el trabajo sin abrir el navegador. | `node docs/capturar-revision.mjs Revision-CAMENA.json` |
| `docs/laboratorio.html` | **El laboratorio.** Selectores de color con contraste medido en vivo, seis texturas de fondo y cuatro formas de resaltar un título, cada una con su CSS para copiar. | `http://127.0.0.1:8899/docs/laboratorio.html` |
| `docs/recetas.md` | **El recetario.** Las recetas de una pieza: resaltar un título, cambiar un color, poner una textura, mover un precio… y qué comprobar antes de dar el cambio por bueno. | abrir el archivo |
| `docs/revisar-medios.mjs` | **El que ve lo deforme.** Recorre todas las páginas y compara la proporción pintada de cada imagen y video contra la del archivo; también delata cajas con alto fijo cuyo contenido no cabe. Nació del bug de los videos aplastados. | `node docs/revisar-medios.mjs` |
| `docs/medir-escala.mjs` | **El que cuenta los escalones.** Dice cuántos tamaños y colores de texto distintos se ven de verdad en una página. Nació de un número incómodo: teníamos 21 tamaños donde una referencia usa 8 o 10. | `node docs/medir-escala.mjs http://127.0.0.1:8899/index.html 1440` |
| `docs/medir-hero.mjs` | **El que mide el hero.** Devuelve números en vez de opiniones: tamaño del titular, cuántas líneas usa de verdad, proporción titular/entrada, cuántos tamaños y colores distintos hay, y si el hero cabe en la primera pantalla. | `node docs/medir-hero.mjs http://127.0.0.1:8899/index.html 1440` |
| `docs/versionar.py` | **El que rompe el caché.** Sella la huella del contenido en las URLs de CSS y JS (`css/layout.css?v=17364851`), para que un cambio se vea al instante en el celular y el caché se siga usando cuando nada cambió. Corre solo en cada publicación. | `python3 docs/versionar.py` |
| `docs/probar-producto.mjs` | **El probador del producto.** Abre Control de Autos con Chrome y la usa como una persona: comprueba que no pida nada externo, que las fuentes propias carguen, que no se desborde, y da de alta un auto para ver que se guarde y siga ahí tras recargar. | `node docs/probar-producto.mjs` (con el servidor en 8899) |

**El flujo de revisión completo:**

1. `bash docs/revisar.sh` (levanta el servidor si hace falta y avisa de la URL).
2. Pulsar **Lápiz** (tecla `L`) y dibujar encima de la página: encerrar una
   palabra, subrayar una frase, hacer una flecha. Al soltar el ratón se abre
   sola la ventana: escribir la instrucción y elegir color (magenta = cambio,
   oro = revisar, verde = está bien así, carbón = duda). Con **Texto** (tecla
   `T`) se escribe el texto nuevo de un bloque y se ve aplicado con un ✎ verde.
3. **Descargar revisión** (`Revision-CAMENA.md`, para leer) y **JSON para
   aplicar** (`Revision-CAMENA.json`, para llevar los cambios al sitio).
4. `node docs/aplicar.mjs Revision-CAMENA.json` para simular y
   `… --escribir` para aplicarlo. Después, la auditoría de siempre.

Las marcas se guardan en el navegador (`localStorage`) por página, así que se
puede revisar en varios días y exportar al final. El sitio real no se toca: el
marcador vive en una **copia** dentro de `docs/revision/sitio/` (ignorada por
git), y la copia se regenera con `bash docs/revisar.sh --limpio`.

---

## Sistema de diseño

### El hero: una frase, dos líneas, medidas

El hero se reescribió con tres modelos distintos —uno de posicionamiento, uno de
redacción y uno de diseño editorial— y la decisión final se tomó aquí, no en la
máquina. Lo que quedó:

| | Texto |
|---|---|
| Sello | Estudio de diseño y sistemas · Apatzingán, Michoacán |
| Titular | **Cada negocio opera distinto.** / **Su software también debería.** |
| Entrada | Software y páginas hechos para tu negocio, sin renta mensual. |
| Cierre | Somos un estudio de diseño y sistemas. Trabajamos de forma remota con negocios de cualquier parte del mundo, desde Apatzingán, Michoacán. |

**El titular son dos frases completas, y eso manda sobre todo lo demás.** Se
probó con una versión corta —«Páginas y sistemas / sin plantilla.»— que cabía en
dos líneas a cualquier tamaño; el dueño la rechazó por sonar a eslogan y pidió
volver al eje de software. Dos frases completas ocupan más: por eso la columna
de texto del hero se ensanchó (la rejilla pasa de `1.22fr / 0.78fr` a
`1.6fr / 0.72fr` y el hueco de 80 a 48 px, así que la columna mide 812 px en vez
de 703) y el titular bajó de 60 a 58 px. Con eso entra en **dos líneas de 561 a
1600 px**; por debajo, en teléfono, los `<span>` se vuelven `inline` y el texto
fluye en tres líneas en vez de partirse en cuatro.

**Por qué así.** El párrafo anterior («Hacemos páginas web, logos y sistemas a la
medida…») enumeraba los servicios y a la vez prometía, y eso lo dejaba en el tono
de cualquier despacho. Ahora el titular afirma lo único que un competidor no
puede decir —**sin plantilla**— y la entrada dice el qué y añade el hecho
comprobable que más pesa: el sistema corre en la computadora del cliente y no se
renta por mes. Ninguna de las dos frases usa «soluciones», «transformar»,
«potenciar» ni «a la medida»: están en la lista negra del README.

**La escala, medida y no adivinada.** `--t-n1: clamp(2rem, 1.52rem + 2.34vw,
3.625rem)` da 32 px en 320, 33.4 en 390, 42.3 en 768, 48.3 en 1024 y 58 en
escritorio. Se comprueba con `docs/medir-hero.mjs`, que además vigila la
proporción titular/entrada (2.9 en escritorio) y que el hero quepa en la primera
pantalla: cabe a 1440 px (838 px de alto con ventana de 900).

**Un detalle que se aprende una vez y no se olvida:** en teléfono el titular
fluye porque `.js .hero__linea` de `animaciones.css` declara `display: block`
para la entrada por líneas, y con dos clases le gana a un `.hero__linea` a secas.
La regla de móvil tiene que empatar la especificidad (`.js .hero__linea`) para
que mande. El precio de que el titular fluya es que el `transform` de la
animación no se aplica en un elemento en línea: en teléfono la entrada por líneas
queda en un fundido.

### Color

Base de carbón y hueso, y **tres acentos con trabajo asignado**. Ninguno es
decorativo: cada color significa algo y se usa solo para eso.

| Familia | Rol | Tonos | Contraste medido |
|---|---|---|---|
| **Oro** | Acento principal: marca, precios, CTA | `--oro` `#A8821F` · `--oro-lt` `#E8C766` · `--oro-tx` `#8A6A0F` | 3.31:1 sobre papel · 11.50:1 sobre tinta · 4.68:1 sobre hueso |
| **Magenta** | El eje de sistemas: micro-sistemas, prototipos, operación | `--magenta` `#D6247A` · `--magenta-lt` `#F472B6` · `--magenta-tx` `#A81B5A` | 4.42:1 sobre papel · 7.13:1 sobre tinta · 6.54:1 sobre hueso |
| **Verde** | Estado: disponibilidad, aprobado, lo que funciona | `--verde` `#0E9F6E` · `--verde-lt` `#34D399` · `--verde-tx` `#0A6B4C` | 3.13:1 sobre papel · 9.82:1 sobre tinta · 6.03:1 sobre hueso |
| **Carbón** | Superficies, texto y todo lo que no es acento | `--ink` `#111111` · `--paper` `#F7F6F3` | 17.47:1 |

**Reglas de convivencia** (sin ellas, tres acentos se vuelven feria):

1. **Un elemento, un acento.** Nunca dos en el mismo componente.
2. **El magenta marca el eje.** Aparece en la segunda línea del titular, en la
   banda de sistemas de precios, en los prototipos y en los cuatro pilares del
   catálogo. En ningún otro sitio.
3. **El verde solo informa.** Es el punto de estado del hero y los estados de
   las maquetas («Aprobada», «En proceso»). No se usa como color de marca.
4. **Cero degradados.** Ni entre acentos ni dentro de uno.
5. **Todo pasa por los alias contextuales** (`--acento`, `--acento-grafico`,
   `--acento-suave`, `--acento-linea`), nunca por una familia concreta: así una
   sección cambia de acento —la de sistemas— sin tocar ni un componente.

Cada familia tiene tres tonos porque el mismo color no sirve sobre papel y
sobre carbón: `-tx` para texto sobre claro, `-lt` para texto sobre oscuro, y el
tono base pasa 3:1 **en los dos fondos**, así que sirve para puntos, filetes y
rellenos sin cambiar de token.

### Tipografía

- **Titulares y texto:** Plus Jakarta Sans, auto-hospedada, variable (2 archivos,
  57 KB). Geométrica, ancha y limpia: da autoridad sin la expresividad de una
  serif, que en un negocio de sistemas suena a portada de libro.
- **Etiquetas, precios y cifras:** JetBrains Mono, auto-hospedada (1 archivo,
  31 KB). Es lo que le da al sitio su aire de terminal y de ficha técnica.
- **Total: 88 KB** en tres archivos, **menos** que la serif anterior (110 KB en
  dos). La variable cubre los pesos 200–800 en un solo archivo.
- La segunda línea del titular se distingue por **color, no por cursiva**: en una
  geométrica la cursiva falsa se nota, y el contraste editorial es más serio.

**La escalera son nueve escalones y ni uno más.** Está en `css/variables.css`
como `--t-n1` … `--t-n5`, `--t-guia`, `--t-cuerpo`, `--t-menudo` y `--t-micro`,
más dos momentos de display (`--t-declara` y `--t-cifra`). Lo que mide cada uno
en un escritorio de 1440 px:

| Token | Mide | Para qué |
|---|---|---|
| `--t-n1` | 60 px | El titular de la página |
| `--t-n2` | 52 px | Título de sección |
| `--t-n3` | 44 px | Título de bloque |
| `--t-n4` | 32 px | Título dentro de un bloque |
| `--t-n5` | 26 px | Nombre de pieza |
| `--t-guia` | 20 px | Párrafo de entrada |
| `--t-cuerpo` | 17 px | Texto corriente |
| `--t-menudo` | 14 px | Letra chica, pies de foto |
| `--t-micro` | 12 px | Etiquetas y rótulos |

**Por qué importa el número de escalones.** Antes cada título traía su propia
fórmula —treinta `clamp` distintos para el mismo nivel de jerarquía— y la página
acababa con **21 tamaños de letra distintos**. Eso es lo que la hacía verse
improvisada aunque cada sección por separado estuviera bien: una referencia como
Stripe usa 8 o 10 en toda la página. Se consolidó a **10**, y los colores de
texto de **15 a 12**, moviendo las etiquetas y los estados fuera de la paleta de
las maquetas (usaban `--mock-*` en interfaz de verdad, que era el error de
fondo). Se comprueba con `node docs/medir-escala.mjs`.

**Las maquetas quedan fuera de la escalera a propósito.** Las ilustraciones
`.mock-*` son dibujos de interfaz y tienen su propia microescala, como cualquier
ilustración; forzarlas a la escalera del texto las deformaría.

**Regla al agregar algo:** si hace falta un tamaño que no está en la tabla, el
error no es que falte el tamaño, es que la pieza está mal clasificada.

### Detalles de taller (craftsmanship digital)

Cuatro cosas que no se ven en una captura de pantalla pero se sienten al usarlo:

1. **Filetes punteados, no líneas perfectas.** Los separadores de listas largas
   (servicios, disciplinas, datos del hero, índice lateral) son punteados de
   1 px: leen como papel y lápiz, no como borde de caja.
2. **Sin cajas por defecto.** Los contenedores se ganan el borde: el índice del
   hero no tiene fondo ni caja, solo un filete vertical de 1 px que lo separa
   del titular. Menos contenedor, más tipografía.
3. **Botones que responden.** Al pasar el mouse crecen un 2 % y levantan una
   sombra profunda; al pulsarlos bajan un 0.5 %. Nada de rebotes ni de bucles, y
   todo desactivado con `prefers-reduced-motion`.
4. **El sello del pie.** «Diseñado píxel a píxel en Apatzingán», con un engrane
   dibujado a mano: dientes de longitud irregular, aro levemente ovalado. Es la
   firma de quien lo hizo, no el logo otra vez.

### Retícula y ritmo

La página alterna fondos (oscuro / papel / blanco cálido) y cambia de
estructura en cada sección a propósito: declaración a dos columnas, disciplinas
como acordeón, necesidades como panel interactivo, proceso con panel fijo,
ecosistema como cadena, paquetes en cuadrícula, CTA a pantalla completa. El
objetivo es que no se lea como «título, texto, tres tarjetas, botón» repetido.

### Qué se queda fuera del home y dónde vive

Todo lo que no ayuda a decidir una compra vive en `como-trabajamos.html`:
el detalle de los seis pasos, los principios de trabajo, la mecánica de pago
y qué pasa después de la entrega. El home conserva el flujo de una línea y un
enlace. Así el scroll principal no obliga a leer un manifiesto.

### Sin sistema de numeración

La página **no** numera las secciones (01, 02, 03…). Numerar cada bloque era
un recurso de plantilla: decoraba sin informar. Los números sobreviven solo
donde ubican algo concreto: las siete disciplinas dentro de su acordeón y las
preguntas plegadas del FAQ.

### Movimiento

Aparece al entrar en pantalla, nunca gira en bucle y siempre respeta
`prefers-reduced-motion`. La aparición tiene **tres mecanismos independientes**
(IntersectionObserver, comprobación por scroll y una red de seguridad por
tiempo): es preferible perder el efecto a que un bloque se quede invisible.

---

## Accesibilidad

- Un solo `h1` y jerarquía de encabezados sin saltos. En `servicios.html` el
  `h1` lleva la clase `encabezado__titulo--pagina`: la página necesita su
  encabezado principal, pero no debe gritar como el del hero. Los rótulos de
  grupo (Marca, Presencia en internet…) son `h2`, y cada disciplina es un `h3`.
- Enlace «Saltar al contenido» y foco visible en todo elemento interactivo.
- Pestañas y acordeones con teclado completo (flechas, Inicio, Fin) y
  `aria-expanded` / `aria-selected` / `aria-controls` correctos.
- Las maquetas del LAB son decorativas (`aria-hidden`) y van acompañadas de una
  descripción para lectores de pantalla.
- Contraste verificado con medición, no a ojo: `docs/verificar-contraste.py`
  comprueba la paleta y `docs/auditar.sh` mide el texto realmente renderizado,
  componiendo fondos semitransparentes capa por capa.
- Funciona sin JavaScript: el menú queda visible y desplegable, los paneles se
  muestran y todo el contenido es legible. El JS solo añade comodidad.

---

### Caché: que un cambio se vea de inmediato

El navegador se guarda el CSS y el JS. Sin nada más, alguien abre la página en el
celular después de un cambio de diseño y sigue viendo la versión vieja —o una
mezcla de las dos— y parece que el trabajo no se hizo.

Por eso las URLs de CSS y JS llevan la **huella del contenido**: `css/
layout.css?v=17364851`. La calcula `docs/versionar.py` con SHA-256, no se escribe
a mano, así que no hay que acordarse de subir ningún número; y solo cambia cuando
el archivo cambia, así que cuando nada se tocó el caché se sigue aprovechando.

Se sella en **cada publicación**, sobre la copia que se sube (ver el paso
«Preparar solo lo que se publica» en `.github/workflows/publicar.yml`). A mano,
si se quiere revisar antes: `python3 docs/versionar.py`.

---
## Rendimiento

- Sin frameworks, sin dependencias, sin build. Cuatro archivos JS pequeños.
- Tres archivos de fuente auto-hospedados (88 KB), los dos de la primera pantalla
  precargados, con `font-display: swap` y `unicode-range` limitado a latino.
- Las maquetas del LAB son interfaces construidas con CSS, no imágenes: cero
  fotografías y cero peticiones extra.
- JavaScript con `defer`, animaciones por `transform` y `opacity`, y un único
  `listener` de scroll con `requestAnimationFrame`.

---

## Contacto del sitio

Los datos salen del proyecto anterior de CAMENA y son los reales. **No
inventar ninguno**:

- WhatsApp y teléfono: `+52 443 579 4642` → `https://wa.me/524435794642`
- Correo: `camenalabs@proton.me`
- Horario: lunes a sábado, 9:00–20:00 h
- Base: Apatzingán, Michoacán · trabajo remoto en todo México

Aparecen en `index.html`, en `js/contacto.js` (constantes al inicio del archivo)
y en los datos estructurados del `<head>`.

### Lo que el sitio responde y por qué

Un dueño de negocio que va a pagar un anticipo hace tres preguntas antes de
decidir. El sitio las responde de forma explícita, sin inventar nada:

| Pregunta | Dónde se responde |
|---|---|
| ¿Quién eres y me vas a facturar? | Bloque de contacto: quién atiende, base, horario |
| ¿Cuánto cuesta y cómo se paga? | Cuatro etapas de precios con tarifa a la vista, armador de paquete y FAQ |
| ¿Y si no funciona, o después de la entrega qué? | FAQ y «Términos del servicio» |

La prueba que sustituye a un portafolio de clientes que aún no existe es el
propio sitio más los prototipos: **esta página la diseñamos y programamos aquí,
y las piezas del LAB son trabajo propio documentado.** Es verificable y no exige
inventar nada.

### Cómo se agrupa la oferta

El inicio agrupa la oferta en **tres etapas del negocio** y **dos líneas
aparte**, porque «hacemos muchas cosas» no dice qué contratar —y porque video,
audio, publicidad y campañas no son una etapa del camino: se contratan cuando
hacen falta.

| Bloque | Para quién | Qué entra | Tratamiento |
|---|---|---|---|
| 1 · Marca | Todavía no tiene logo ni colores | Logo · identidad · hoja de uso · papelería · etiquetas | Tarjeta sobre papel |
| 2 · Presencia | Ya tiene marca y no lo encuentran | Páginas · catálogos · ficha de Google | Tarjeta sobre papel |
| **3 · Sistemas** | **Ya vende y la información vive en cuadernos** | **Cotizar y cobrar · clientes y ventas · inventario · citas · tablero · automatización** | **Banda a todo el ancho, carbón, acento magenta, sello y CTA a WhatsApp** |
| Aparte · Producción | Ya hay algo que mostrar | Video · audio · publicidad · publicaciones del mes | Tarjeta sobre papel |
| Aparte · Proyectos especiales | Presencia constante y campañas | Marca de campaña · contenido por mes · base de datos · campaña completa | Tarjeta sobre papel |

**Regla de la banda oscura:** es exclusiva de la etapa de sistemas, y es la única
que lleva acento magenta en esa sección. Cuando dos etapas compartían la
superficie oscura, las dos pesaban igual y ninguna destacaba.

`servicios.html` presenta el mismo material en **tres grupos separados**:

1. **Sistemas y diseño** — los cuatro pilares (disciplinas 01 a 04), con acento
   magenta en su número y en el signo de abrir.
2. **Contenido y producción** — video, audio y publicidad (05 a 07).
3. **Campañas y proyectos especiales** — su propia disciplina (08), con la
   advertencia de normativa electoral dentro y no mezclada con el resto.

### Los cinco ejemplos de proyectos

La sección se llamaba «laboratorio» y sonaba a borrador de aficionado. Ahora se
presenta como **ejemplos de proyectos**, con las etiquetas en palabras llanas
—`El problema · Qué hicimos · Por qué así`— y una frase ancla que educa: ninguno
se vende tal cual, cada uno se construye desde cero.

Son **tres piezas y las tres son trabajo real**, sin una sola maqueta de
plantilla:

1. **El cotizador de WhatsApp** de esta misma página, con captura real.
2. **El expediente del taller**, con capturas reales del sistema funcionando.
   Su página no se enlaza: el código de una página publicada se descarga entero.
3. **Un reel para una clienta** (consultorio), publicado con su visto bueno.
   La autorización está confirmada por el dueño del estudio y queda registrada
   en `docs/autorizaciones.md`. Mientras no haya permiso explícito para
   nombrarla, la pieza se queda sin nombre y sin logotipo.

> **El promo propio salió del aire.** Estaba publicado —30 s, vertical, con
> narración— y se retiró porque la voz no quedó: se va a rehacer. El archivo
> vive en `~/camena-video/promo/` (`camena-promo.mp4` + su póster), fuera del
> repo, esperando la nueva versión. Cuando esté, se vuelve a comprimir igual que
> el reel (720×1280, H.264 CRF 26, faststart, `preload="none"` con póster) y se
> agrega su pieza a los ejemplos.

Las maquetas de interfaces hechas con CSS se retiraron a propósito: al lado de
trabajo real, una maqueta bonita se lee como «este vende plantillas». Lo que se
muestra tiene que poder usarse o verse completo.

**Regla al añadir una pieza:** el chip dice lo que la pieza es, no lo que
gustaría que fuera. «Está en vivo» solo se usa si hay algo que la persona pueda
usar ahí mismo —hoy, únicamente el cotizador de esta página—; el resto se marca
por lo que es: «Sistema propio» o «Pieza para cliente». Y nunca se presenta una
maqueta como si fuera un producto funcionando.

**Lo que sí se enlaza y lo que no.** Un enlace para probar un sistema es un
enlace para copiarlo: todo lo que el navegador muestra, el navegador lo puede
guardar. Por eso el producto terminado se enseña en capturas y se entrega al
cliente que lo contrata.

### Precios: dónde se cambian

**⚠️ Los precios viven en el HTML, nunca en JavaScript.** Aparecen dos veces y
hay que mover los dos sitios a la vez:

1. La lista visible de cada etapa:
   ```html
   <li><span class="servicios__que">Programa para cotizar y cobrar</span><span class="servicios__cuanto">desde $8,000</span></li>
   ```
2. La casilla equivalente del armador de paquete, que además suma el total:
   ```html
   <label class="opcion"><input type="checkbox" name="sistema" value="Programa para cotizar y cobrar" data-precio="8000">…</label>
   ```

Así se ven aunque el visitante no cargue el script y las indexa el buscador. Son
precios de partida, no cerrados: el valor real se confirma por escrito.

**Coherencia obligatoria de las cifras.** Hay dos precios de entrada y aparecen
en cinco sitios: hero (línea de precios y datos), índice lateral, etapas, armador y
la primera respuesta del FAQ, además de los datos estructurados. Hoy son **$1,500
el diseño y $8,000 los sistemas**. Estuvieron desincronizados —el FAQ decía
$3,500— y eso rompe la confianza justo en la pregunta que más se hace.

### Sobre el formulario

El formulario **no tiene backend y no lo simula**: compone el mensaje en el
navegador y lo entrega a WhatsApp para que la persona lo revise antes de
enviarlo. Si el navegador bloquea la ventana, ofrece el mismo mensaje por
correo. Nunca dice «hemos recibido tu mensaje», porque no es cierto.

---

## SEO

- `<title>` y meta description orientados al nuevo posicionamiento.
- Open Graph y Twitter Card completos, con imagen 1200×630 generada para redes.
- Datos estructurados JSON-LD: `ProfessionalService` con catálogo de servicios,
  horario de atención y `FAQPage` con las siete preguntas **en el mismo orden y
  con el mismo texto que se ve en la página** (Google debe indexar lo mismo que
  lee la persona).
- `lang="es-MX"`, `canonical`, favicon completo, manifiesto, `robots.txt` y
  `sitemap.xml`.
- El posicionamiento local (Apatzingán, Michoacán) se conserva como parte de la
  historia de la marca, no como su límite.
- **URL publicada:** https://wildpig94.github.io/camena-web-2/
- El dominio está escrito en `canonical`, Open Graph, JSON-LD, `sitemap.xml` y
  `robots.txt` de las tres páginas. Cuando conectes `camena.mx`, hay que
  reemplazar `https://wildpig94.github.io/camena-web-2` por el dominio nuevo en
  esos cinco archivos, más la constante `NUEVO` si usas el script de abajo:

  ```bash
  grep -rl "wildpig94.github.io/camena-web-2" . | xargs sed -i \
    's|https://wildpig94.github.io/camena-web-2|https://camena.mx|g'
  ```

---

## Auditoría

Antes de dar por bueno un cambio:

```bash
# 1 · Contraste de la paleta
python3 docs/verificar-contraste.py

# 2 · Sitio renderizado: estructura, contraste real, desbordes, errores de JS
bash docs/auditar.sh http://127.0.0.1:8899/index.html 1440 1100 desktop
#    El informe queda en /tmp/camena-shots/informe-desktop.json
#    y la captura de página completa en /tmp/camena-shots/desktop.png

# 3 · Responsive
bash docs/auditar.sh http://127.0.0.1:8899/index.html 390 844 movil
```

Criterios de aceptación: cero fallos de contraste, cero desbordes
horizontales a 320 px, cero errores de consola, jerarquía de encabezados sin
saltos y ningún enlace interno roto.

### Auditoría de móvil (importante)

**Chromium impone un ancho mínimo de ventana de 500 px**, así que
`--window-size=390` **no** da 390 px de verdad. Por eso existe
`docs/movil.mjs`, que usa el protocolo DevTools para emular el ancho exacto:

```bash
node docs/movil.mjs http://127.0.0.1:8899/index.html 390 844
node docs/movil.mjs http://127.0.0.1:8899/index.html 320 844   # el más estrecho
```

Mide lo que `auditar.sh` no puede ver en móvil: elementos que se salen de la
pantalla, texto pisado, objetivos táctiles por debajo de 24 px, contraste real
y errores de consola.

**Antes de medir, fuerza el estado final de las animaciones de entrada.** Si no
se hace, los elementos sin revelar llevan `translateY(22px)` y el detector los
ve montados sobre el siguiente: un falso positivo de exactamente 22 px que ya
provocó una búsqueda larga. Está resuelto en el script.

### Cómo se auditan las páginas secundarias

`docs/auditar.sh` mide **la página que se le pide**, no siempre el inicio:

```bash
bash docs/auditar.sh http://127.0.0.1:8899/servicios.html 1440 1000 servicios
```

Dos cosas que hacía mal y ya no: auditaba `index.html` ignorando la ruta de la
URL, y —si se le pasaba una ruta local— **escribía el código de medición dentro
del archivo del repositorio**, dejándolo mutilado. Ahora todo el trabajo ocurre
sobre una copia temporal y la página auditada es la que se pidió. Si una página
no carga o no hay `h1`, el informe lo dice en lugar de reventar.

### Lo que esta verificación NO detectaba (y ya sí)

Estas 6 comprobaciones faltaban y por eso entraron fallos reales:

1. **Contraste del texto en elementos en línea.** La auditoría recorría
   bloques (`p, h1, h2, h3, li, dt, dd, blockquote, summary`) y **no miraba los
   `<span>`**. Por ese hueco pasó lo que más vergüenza da de todo este proyecto:
   la segunda línea del titular del hero se pintaba a **2.67:1** —magenta oscuro
   sobre tinta, casi ilegible— y la auditoría decía «0 fallos» una y otra vez.
   El color vivía en un `<span class="hero__linea--acento">`, así que el
   medidor nunca lo vio. Lo encontró una revisión externa leyendo el CSS, no una
   medición mía. Ahora la selección incluye los elementos en línea y la regla es
   simple: **si tiene texto, se mide**.

   La causa del bug, para que no se repita: el bloque de contextos de sistemas
   de `variables.css` daba magenta oscuro a `.etapa--destacada`, `#lab` y
   `.hero__titulo`. Cuando el hero pasó de fondo oro a fondo tinta se corrigió
   el magenta para las secciones oscuras… y el titular se quedó fuera de la
   corrección. Lo que era una decisión de color para fondo claro se volvió un
   texto ilegible sobre carbón.

2. **Cajas que se pintan encima de la siguiente.** En móvil los globos de precio
   dejan de flotar y entran en el flujo. Dos cosas se rompían ahí sin que nada
   se desbordara: el globo es un `<span>`, y al quitarle `position: absolute`
   volvía a ser un elemento **en línea**, donde el relleno vertical no cuenta
   para la altura —así que su borde y su fondo se pintaban 12 px encima del
   renglón siguiente, descuadrando las casillas de la lista—; y oculto seguía
   ocupando lugar, porque `visibility: hidden` conserva la caja: la lista de
   precios de campañas medía **919 px cuando debía medir 462**, con un hueco
   invisible del alto del globo después de cada renglón. Se arregla con
   `display: none` / `display: block` (el clic lo decide `interacciones.js`) y
   dejando el `:hover` solo para punteros finos, porque en una pantalla táctil
   el `:hover` se queda pegado después del toque y el globo no se cierra.

3. **Medios deformados.** La auditoría medía desbordes, contraste y tamaño de
   los controles, pero no miraba si una imagen o un video quedó **estirado**.
   Por ahí se fue a producción el peor bug que ha tenido el sitio: los dos
   videos verticales se pintaban de **320×1280** —aplastados— porque
   `img, svg, video, canvas` tenían `max-width: 100%` sin `height: auto`, así
   que el video conservaba el `height="1280"` del HTML. En el celular cada uno
   ocupaba 1280 px de alto y estiraba la página casi mil quinientos píxeles de
   más. Nada se desbordaba, así que ninguna comprobación lo veía: **solo se veía
   mal**. Lo cubre `docs/revisar-medios.mjs`, que compara la proporción pintada
   contra la del archivo en todas las páginas y a varios anchos.

4. **HTML incompleto.** Un corte accidental puede dejar la página
   «funcionando» pero mutilada: sin formulario, sin cierres. Se comprobó en
   producción y estuvo horas publicado. Ahora el flujo de publicación cuenta
   etiquetas y campos antes de desplegar.
5. **Contraste de controles.** La auditoría medía texto, no bordes. Un botón
   de contorno con borde a 1.31:1 no se percibe como botón, y no aparecía en
   ningún informe. `docs/movil.mjs` ahora revisa bordes de controles sin fondo
   propio y exige 3:1.
6. **Paleta desincronizada.** `docs/verificar-contraste.py` medía los colores
   anteriores y pasaba en verde. Ahora el script compara sus valores con
   `css/variables.css` y avisa si no coinciden.

Y una cuarta, de método: **las animaciones de entrada falsean las mediciones.**
Un elemento sin revelar lleva `translateY(22px)` y el detector de solapes lo ve
montado sobre el siguiente. Los auditores fuerzan el estado final antes de medir.

### Comprobación de estructura del HTML

Un corte accidental deja la página «funcionando» pero mutilada: sin formulario,
sin cierres, con el pie anidado dentro de otro elemento. Ya pasó una vez y
estuvo publicado. El flujo de publicación ahora cuenta etiquetas, campos y
cierres antes de desplegar, y falla si algo no cuadra.

### Limitaciones conocidas del entorno de auditoría

- El Chromium headless de esta máquina **no dispara `IntersectionObserver`,
  `setTimeout` ni `requestAnimationFrame`** bajo `--dump-dom`, y no permite
  desplazar la ventana. Por eso la animación de aparición se verifica por
  revisión de código y captura, no por ejecución.
- **Los errores de JavaScript solo aparecen al escuchar la consola con
  emulación de móvil.** Así se encontró un `ReferenceError` que rompía las
  animaciones y dejaba secciones invisibles en el teléfono: en escritorio no se
  manifestaba. Conviene revisar `consola` en la salida de `movil.mjs`.

---

## Honestidad comercial: qué NO debe aparecer nunca

Al mantener este sitio, no agregues:

- Clientes, logotipos de empresas, testimonios o casos de éxito sin autorización
  y sin que el trabajo exista. Cada permiso se anota en
  `docs/autorizaciones.md`: autorizar que se publique un video no es autorizar
  que se nombre al cliente.
- Cifras de resultados, años de experiencia, premios o certificaciones.
- Fotos de personas que no forman parte del estudio.
- Métricas o resultados de proyectos que no se hayan medido.

Cuando existan proyectos publicables, el camino ya está previsto: en
`components.css` hay etiquetas listas (`chip--proyecto`, `chip--caso`) y la
sección del LAB está construida para admitir piezas reales, casos de estudio y
resultados **sin rearmar la página**.

---

## Estado del proyecto

- [x] Reposicionamiento completo y arquitectura de contenido
- [x] Sistema de diseño con tokens y contraste verificado
- [x] Marca, favicons e imagen para redes
- [x] Sitio completo en español, responsive, accesible y sin dependencias
- [x] Páginas legales (aviso de privacidad y términos)
- [x] Copy revisado contra el test «agencia genérica» y el test «IA»
- [x] Segunda pasada de voz: titular en dos golpes, párrafos a la mitad,
      diagnósticos como tarjetas de impacto, LAB reencuadrado como casos de
      estudio e índice del hero en tono menor
- [x] Auditoría en 1440 / 1024 / 390 / 320 px sin hallazgos
- [x] Eje reposicionado a **estudio de diseño y sistemas operativos**: hero con
      dos mitades, diagnósticos por costo, etapa de sistemas como protagonista,
      catálogo de servicios abierto por sistemas y tesis en «Cómo trabajamos»
- [x] Producto en vivo publicado (expediente del taller), con su ficha en los
      ejemplos y entrada en el sitemap
- [x] Sección de ejemplos solo con trabajo real: cotizador, producto y dos
      videos; retiradas las maquetas de plantilla
- [x] Precios de campañas y eventos a nivel de estudio, con el alcance explicado
- [x] Hero en oscuro, descripción del estudio al pie y trabajo remoto en todo el
      mundo dicho en el hero, el contacto, el FAQ y los datos estructurados
- [x] Herramientas de trabajo: marcador de revisión, laboratorio de estilos y
      recetario de edición (todo en `docs/`, fuera del sitio publicado)
- [x] Arquitectura de oferta en cuatro pilares de sistemas y diseño, con
      contenido y campañas en grupos aparte
- [x] Paleta de cuatro colores (oro, magenta, verde y carbón) con roles
      asignados y alias contextuales; el magenta marca el eje de sistemas
- [x] Rediseño editorial: paleta neutra con un solo acento verde, tipografía
      geométrica auto-hospedada (Jakarta Sans + JetBrains Mono, 88 KB), índice
      del hero sin caja, etiqueta de estado con punto verde, filetes punteados,
      botones con escala contenida y sello de taller en el pie
- [ ] Decidir el lema: «Tu idea. Nuestra solución.» sigue en el pie, en Open
      Graph y en los datos estructurados, y es lo más genérico que queda del
      sitio. Si se cambia, hay que cambiarlo en los tres sitios a la vez
- [ ] Conectar `camena.mx` y reemplazar la URL de GitHub Pages (ver arriba)
- [x] Sumar proyectos reales a los ejemplos cuando haya autorización: cuatro
      piezas reales, con el reel de la clienta autorizado y registrado en
      `docs/autorizaciones.md`
- [ ] Pedir permiso para **nombrar** al cliente del reel, y anotarlo en
      `docs/autorizaciones.md`
- [ ] Preguntar al taller por los **precios por aseguradora** (la única pregunta de
      la primera ronda que sigue abierta; la de refacciones ya se contestó en la
      nota del 15 de septiembre y está en `docs/investigacion-taller.md`, D9)
- [ ] Páginas individuales por servicio (la estructura ya lo permite)
- [ ] Contenido propio: casos de estudio, recursos y herramientas

---

## Identidad de los commits

Los commits de este repo van firmados como **`CAMENA <camenalabs@proton.me>`**,
no con el nombre de una persona. La identidad está puesta en la config **local**
del repo (`.git/config`), no en la global, así que no afecta a otros proyectos:

```bash
git config --local user.name  "CAMENA"
git config --local user.email "camenalabs@proton.me"
```

El historial se reescribió una vez para dejar de firmarlo con un nombre
personal. Si algún día se vuelve a clonar el repo, **hay que volver a poner esa
config local** antes de hacer commits, o los nuevos saldrán con el nombre del
sistema. Se comprueba con `git log -1 --format='%an <%ae>'`.
