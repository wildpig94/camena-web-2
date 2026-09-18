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
| `index.html` | Qué se vende con precio, siete diagnósticos, cuatro etapas, tres ejemplos, armador de paquete, preguntas y contacto. El proceso no está aquí: vive completo en `como-trabajamos.html` y solo se ve si alguien lo elige en el menú |
| `servicios.html` | El catálogo completo: los siete servicios en detalle |
| `como-trabajamos.html` | El método paso por paso y la mecánica de pago |
| `aviso-de-privacidad.html` · `terminos.html` | Lo legal |
| `404.html` | La página de dirección equivocada. Va **autocontenida** (sin `css/` ni `js/` del sitio) porque GitHub Pages la sirve en cualquier ruta rota, y ahí los enlaces relativos se resolverían contra esa carpeta. Sus enlaces y fuentes usan ruta absoluta, que es correcta ya con dominio propio |

**Los productos terminados no viven aquí.** `Control de Autos` y el expediente del
taller están en `~/productos-camena/`, fuera del repositorio, y el sitio solo los
enseña con capturas. El motivo está en «Los dos productos».

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

Hay **dos** productos, y **ninguno de los dos vive en este repo**: su código está
en `~/productos-camena/`, para que no se pueda leer ni copiar desde GitHub. El
sitio no los publica ni los deja probar: los enseña **solo con capturas de uso
real**, que es lo que le da valor a la pieza.

| | Expediente del taller | Control de Autos |
|---|---|---|
| Qué es | El **expediente del taller**, reconstruido desde los dolores reales | La app original de **Control de Autos**, tal como la usaba el taller |
| Diseño | El sistema de diseño del sitio (`css/variables.css`) | Propio: fondo oscuro, Oswald + IBM Plex Sans |
| Se muestra | En los ejemplos del inicio, con capturas reales y **sin enlace para abrirlo** | Igual: capturas reales, **sin enlace** |
| Archivos | `~/productos-camena/taller/` (`taller.html` + `taller.js`) | `~/productos-camena/control-de-autos/index.html` |
| Guarda en | `camena:taller:estado` (+ fotos en IndexedDB) | `taller_autos_v1` y `taller_aseguradoras_v1` |

Ninguno de los dos es una maqueta: los dos se abren y se usan. Y ninguno se
presenta como lo que no es — Control de Autos no tiene fotos por etapa, ni
conformidad firmada, ni refacciones detenidas; eso vive en el expediente.

**Dónde vive el código y por qué.** Los dos productos están fuera del repo. Se
sacaron por una razón concreta: este repositorio es **público**, así que cualquier
archivo que entre queda legible para todo el mundo, aunque la página no se
publique. Publicar sin enlazar no protege nada; sacarlo del repo, sí.
El despliegue además lleva un candado: si alguien vuelve a dejar una página de
producto en una carpeta que sí se copia, la publicación **falla** en vez de
regalarla en silencio (ver el paso «Preparar solo lo que se publica»).

> ⚠️ **Hasta el 17 de septiembre de 2026, Control de Autos se publicaba** en
> `producto/index.html` como enlace de trabajo para el taller. Se
> retiró: el sistema ya no se publica, no se enlaza y no se puede probar desde el
> sitio — se enseña con las capturas del tablero y del historial. Queda en la
> historia de git, así que quien mire los commits anteriores todavía puede
> encontrarlo.

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

> ⚠️ **Regla al mantener esto:** ninguna página de producto terminado se publica
> ni se enlaza desde el sitio, y tampoco se deja en el repositorio, que es
> público. Lo que se enseña es la captura y el video; el sistema se entrega
> aparte, al cliente que lo contrata. Si alguna vez hace falta enseñar más,
> se enseña otra captura —nunca algo que se pueda abrir.

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
transcritas en esta máquina y analizadas en `~/productos-camena/privado/investigacion-taller.md`. Ese
documento —interno, no se publica— lista cada dolor con la cita que lo prueba, su
costo y la función que lo resuelve, y marca lo que todavía falta preguntar. Es la
base de la siguiente versión del producto.

#### Control de Autos (`~/productos-camena/control-de-autos/`, fuera del repo)

Es la app que el taller ya conocía, más el cotizador que se le sumó el 18 de
septiembre. **Ya no se publica ni se comparte por enlace**: vive fuera del repositorio y el sitio solo la enseña con dos capturas.
Antes se publicaba en `producto/index.html` para que el encargado la
abriera desde el celular sin instalar nada, pero eso dejaba el sistema completo
descargable para cualquiera —y el repositorio es público—, así que se retiró.
Registra la
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

**La memoria de refacciones (18 de septiembre).** El taller dijo dónde busca las
piezas —proveedores por WhatsApp, MercadoLibre, plataformas de las aseguradoras para
el precio oficial, y los diagramas que le mandan los proveedores— y con eso se
construyó lo que faltaba: **que el sistema se acuerde**.

- **Cada pieza capturada queda guardada** con su **código, marca, proveedor y
  modelo del carro**, y cuántas veces se ha usado.
- **Autocompletado**: al escribir el nombre de una pieza ya usada, se llenan solos
  el código, la marca, el proveedor, el costo y la casilla de IVA. Es el ahorro de
  verdad: deja de buscarse dos veces lo mismo.
- **Pestaña «Refacciones»** con buscador por pieza, código, marca, proveedor o
  carro; cada resultado trae sus botones para **MercadoLibre** y **Google**, con la
  consulta ya escrita (pieza + carro + código).
- **Costo con IVA y más IVA.** Los proveedores cotizan «+ IVA» buena parte del
  tiempo y el factor de la aseguradora se aplica sobre el costo real: sin esto el
  precio salía 16% abajo. Comprobado: $1,300 + IVA al 175% = **$2,639**.
- La memoria **se va en el respaldo**, y un respaldo viejo —sin refacciones— no
  borra lo que ya hay en el aparato.
- **Arranca sembrada con 19 refacciones reales** sacadas de las capturas que mandó
  el taller el 18 de septiembre (catálogo oficial de Honda y cotizaciones de Durán
  Autopartes), cada una con su precio y su fecha. Se cargan **una sola vez**, solo
  si la memoria está vacía: no fijan precios, dan el primer resultado de búsqueda.
  La versión base para otro taller lleva la siembra vacía.
- **El VIN del carro** (opcional, 17 caracteres): los catálogos de agencia y los
  portales de las aseguradoras buscan por VIN, y guardarlo evita elegir mal el año.
  Se guarda en mayúsculas y sin espacios, se ve como etiqueta en la tarjeta y sale
  en la cotización.
- **El IVA en dos estados**, no una casilla: «ya incluye IVA» y «es + IVA». El
  mismo taller, el mismo día, recibe las dos cosas: el catálogo de agencia trae el
  IVA incluido y el proveedor cotiza más IVA. La lista de refacciones lo dice con
  todas sus letras, y cuando hay piezas + IVA el total avisa que se calcula sobre
  el costo ya con IVA.

Lo que **no** se hizo, a propósito: consultar MercadoLibre desde dentro con su API.
Comprobado que `api.mercadolibre.com/sites/MLM/search` responde 403 sin
credenciales, exige registrar una aplicación y manejar tokens que caducan cada seis
horas, y sus términos no permiten mostrar sus publicaciones en una app de terceros.
El enlace directo hace el mismo trabajo sin depender de nadie.

**Ya es un programa instalable, no un archivo suelto (18 de septiembre).** Un
archivo dentro de la carpeta de Descargas no es un lugar donde vivir: el navegador
puede borrar sus datos cuando le falte espacio y en el teléfono ni siquiera abre
igual. Ahora la carpeta se instala en el aparato como cualquier app:

- **Manifiesto e iconos propios** (`manifest.webmanifest`, tres PNG dibujados con
  un SVG capturado con Chrome: 192, 512 y el recortable de Android). El nombre en
  la pantalla de inicio es «Control de autos».
- **Service worker**: abre **sin internet** y sigue trabajando. La app se pide a la
  red primero y, si no hay, se usa lo guardado; las fuentes y los iconos salen de
  lo guardado. Comprobado con la red cortada: abre, carga sus fuentes y deja
  capturar un auto.
- **Almacenamiento permanente** (`navigator.storage.persist()`): el navegador ya no
  puede tirar los datos por falta de espacio.
- **El pie dice cuándo fue el último respaldo** —«Último respaldo: hace 9 días»— y
  avisa en ámbar cuando pasan siete. Es la única red de seguridad mientras los
  datos vivan en el aparato.
- **La carpeta se puede copiar entera**: las fuentes y el favicon viven dentro de
  `control-de-autos/assets/`, ya no se piden a la carpeta de arriba.
- **El botón de instalar** aparece cuando el aparato lo permite; en iPhone la
  instalación es manual (Compartir → Añadir a pantalla de inicio).

Todo eso se comprueba con `node docs/probar-instalable.mjs`.

**Dónde vive: Cloudflare, con puerta (18 de septiembre).** Se decidió no
publicarla en la página de GitHub —ahí el sistema queda descargable para cualquiera
que pase por el repositorio público, y su código entra a la historia de git para
siempre— y llevarla a **Cloudflare Pages con una Access policy por correo**: https
para que el teléfono la instale, y una puerta para que solo entre quien se
autorice. El procedimiento completo está en `docs/publicar-en-cloudflare.md`, y
`docs/publicar-cloudflare.sh` hace el trabajo: comprueba que la app esté sana
—incluida la prueba de «sin internet»—, la publica y verifica que la dirección
responda.

Dos cosas que se ajustaron pensando en esa puerta:

- **El service worker solo guarda respuestas buenas.** Con Access por delante,
  cuando la sesión vence lo que llega es la pantalla de entrar: guardarla la
  dejaría pegada para siempre y la app se vería rota. Ahora, si la respuesta no es
  buena, se sirve la copia local y la app sigue funcionando sin internet aunque la
  sesión haya vencido.
- **El icono de la pestaña es el icono de la app**, no el favicon del estudio: es
  la herramienta de un cliente, no un anuncio de CAMENA.

**La versión base para otro taller** vive en `~/productos-camena/plantillas/control-de-autos-base/`:
la misma app **sin el nombre de ningún taller**, con las tres cosas que se cambian
—nombre, aseguradoras con su factor y color de acento— juntas y marcadas al
principio del archivo, más un `LEEME.md` con el checklist. Probada como app: se
instala y funciona sin internet igual que la del taller. Publicarla sin ponerle el
nombre de un taller real hace que el script lo frene: es la diferencia entre
entregar un sistema y entregar una plantilla.

**En qué etapa quedó, y qué le falta.** Es **el primero de los nueve problemas que
el taller contó** en `~/productos-camena/privado/investigacion-taller.md`: el registro de entrada (D1),
que era el más grave porque de él cuelga todo lo demás. Lo que hace hoy está
completo y probado —`node docs/probar-producto.mjs` contra la copia archivada:
registra, guarda, sigue ahí después de recargar y no pide nada a ningún tercero—:

| Hecho | Falta |
|---|---|
| Ficha de recepción: descripción, color, placas, folio del siniestro, aseguradora, fecha de entrada, notas | **El cliente**: hoy el auto no tiene dueño con teléfono, y sin eso no hay a quién avisarle nada |
| Días en piso, contados solos, con etiqueta de demorado | **Fotos por siniestro** (D2): el taller ya las toma, pero viven sueltas en carpetas |
| Salida al historial con fecha, y reingreso si vuelve | **Cobranza** (D4 y D5): facturado, pagado y pendiente por siniestro; hoy es un Excel por mes |
| Catálogo de aseguradoras, **cada una con su factor** | **Catálogo de refacciones con costo**: hoy el costo de cada pieza se teclea cada vez |
| **Cotizador por aseguradora**: se capturan las piezas por cambiar, el precio sale del factor y la cotización se copia para WhatsApp | **Precio de particular**: el del seguro ya se calcula; el de particular lo sigue definiendo el dueño |
| Respaldo en un archivo: se descarga y se vuelve a cargar | **Respaldo automático**: hoy hay que acordarse de bajarlo |
| Instrucciones dentro de la propia app, desplegables | **Avisos al cliente** (D6 y D7) y **WhatsApp** (D8) como aviso automático |
| Un solo archivo HTML, sin dependencias, corre en la computadora del taller | **Pendientes tipo pizarrón** (D9), y **más de una persona a la vez** |

**El cotizador (18 de septiembre).** Con el dato del taller —**175% sobre el costo
de la refacción**, y cada aseguradora con el suyo— se construyó el módulo que
estaba detenido: en el alta del auto se agregan las piezas por cambiar con su
costo, el precio aparece solo con el factor de esa aseguradora, el total se ve en
la tarjeta, y un botón copia la cotización ya escrita para pegarla en WhatsApp. Si
el portapapeles no está —sin https no existe—, el texto se abre seleccionado para
copiarlo a mano. Los factores se editan en el panel de aseguradoras, y **los datos
de antes siguen abriendo**: las aseguradoras se guardaban como texto y los autos no
tenían piezas, así que al leerlos se convierten y nadie pierde su trabajo.

Lo que sigue detenido no es código: es **el costo de cada refacción**, que tampoco
está en una lista. Un catálogo de refacciones ahorraría teclearlo, pero necesita
que el taller lo arme una vez.

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
├── index.html                  Página principal (6 secciones)
├── servicios.html              Catálogo completo, con precios
│
├── assets/mostrador/           Capturas de Mostrador para la sección de
│                               ejemplos: el sistema funcionando, sin demo
├── assets/producto/            Capturas de Control de Autos (tablero e
│                               historial). El código del producto no está aquí:
│                               vive fuera del repo, en ~/productos-camena/
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
| `docs/cambiar-dominio.sh` | **El de la mudanza.** Pasa el sitio de `github.io` al dominio propio: cambia las 22 apariciones de la dirección vieja repartidas en 7 archivos (canonical, `og:url`, `twitter:image`, datos estructurados, sitemap, robots), crea el `CNAME` y comprueba que no quede ni una. Sin `--aplicar` solo muestra qué haría. | `bash docs/cambiar-dominio.sh camena.mx [--aplicar]` |
| `docs/laboratorio.html` | **El laboratorio.** Selectores de color con contraste medido en vivo, seis texturas de fondo y cuatro formas de resaltar un título, cada una con su CSS para copiar. | `http://127.0.0.1:8899/docs/laboratorio.html` |
| `docs/traducir-al-ingles.md` | **El traspaso de la traducción.** Todo lo que hay que saber para hacer la versión en inglés sin romper el formato: qué se traduce y qué no (clases, anclas, `data-*`, la estructura de las tablas), glosario de oficio, la voz en inglés, cómo publicarla y cómo comprobarla. | abrir el archivo |
| `docs/recetas.md` | **El recetario.** Las recetas de una pieza: resaltar un título, cambiar un color, poner una textura, mover un precio… y qué comprobar antes de dar el cambio por bueno. | abrir el archivo |
| `docs/revisar-medios.mjs` | **El que ve lo deforme.** Recorre todas las páginas y compara la proporción pintada de cada imagen y video contra la del archivo; también delata cajas con alto fijo cuyo contenido no cabe. Nació del bug de los videos aplastados. | `node docs/revisar-medios.mjs` |
| `docs/medir-escala.mjs` | **El que cuenta los escalones.** Dice cuántos tamaños y colores de texto distintos se ven de verdad en una página. Nació de un número incómodo: teníamos 21 tamaños donde una referencia usa 8 o 10. | `node docs/medir-escala.mjs http://127.0.0.1:8899/index.html 1440` |
| `docs/medir-hero.mjs` | **El que mide el hero.** Devuelve números en vez de opiniones: tamaño del titular, cuántas líneas usa de verdad, proporción titular/entrada, cuántos tamaños y colores distintos hay, y si el hero cabe en la primera pantalla. | `node docs/medir-hero.mjs http://127.0.0.1:8899/index.html 1440` |
| `docs/medir-fichas.mjs` | **El que abre lo que está cerrado.** Abre las 28 fichas de precio una por una y mide tres cosas que la auditoría general no puede ver: si alguna tapa la nota o los botones de su banda, si se sale de su tarjeta y **el contraste de cada texto contra su fondo real**. Nació de un texto a 1.07:1 que vivió escondido detrás de un `display: none`. | `node docs/medir-fichas.mjs http://127.0.0.1:8899/index.html 1440` |
| `docs/versionar.py` | **El que rompe el caché.** Sella la huella del contenido en las URLs de CSS y JS (`css/layout.css?v=17364851`), para que un cambio se vea al instante en el celular y el caché se siga usando cuando nada cambió. Corre solo en cada publicación. | `python3 docs/versionar.py` |
| `docs/configurar-puerta.py` | **El de la puerta.** Pone Cloudflare Access delante de la app: crea el equipo de Zero Trust si falta, una política reutilizable con los correos autorizados, la aplicación para el dominio, y **verifica desde fuera** que una petición sin sesión acabe en la pantalla de entrar y no en la app. Sin `--aplicar` solo dice qué haría. | `CLOUDFLARE_API_TOKEN=… python3 docs/configurar-puerta.py --dominio … --correos … [--aplicar]` |
| `docs/publicar-cloudflare.sh` | **El que publica la app del taller.** Comprueba que la carpeta esté completa y que lleve el nombre de un taller de verdad (y no de la plantilla), corre las dos pruebas sirviendo la app como se sirve en internet, publica en Cloudflare Pages y verifica que la dirección responda. Con `--solo-probar` hace todo menos publicar. | `bash docs/publicar-cloudflare.sh --solo-probar` |
| `docs/probar-instalable.mjs` | **El que pregunta si ya es un programa.** Pide al navegador sus propias cuentas: que el manifiesto no tenga errores, que Chrome la considere instalable, que el service worker quede activo —y lo que de verdad importa— que **sin internet abra, cargue sus fuentes y deje capturar**. Nació al convertir la app del taller en programa instalable. | `node docs/probar-instalable.mjs` |
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

### El rojo: un acento con un solo trabajo

El rojo ladrillo (`--rojo #B23A2E` y su aclarado `--rojo-lt #D0614F`) existe para
**una sola cosa**: la primera línea del titular del hero, la que no cambia nunca,
mientras la segunda alterna en pistache. Dos tonos, como el resto de la paleta: el
aclarado para la tinta (4.95:1) y el apagado para superficie clara (5.49:1), porque
sobre carbón el ladrillo puro se queda en 3.18:1.

**No es un color de estado ni de alerta**: si algún día se usa para avisar de algo,
habrá que darle otro tono, porque este ya tiene su trabajo. Los pares están en
`docs/verificar-contraste.py`, que es lo que impide que entre un color sin medir.

### El acento en las zonas oscuras

El sitio tiene tres zonas oscuras —el hero, la banda de sistemas y los
prototipos— y ahí el acento **no** es el oro del resto de la página. Hasta ahora
era magenta; hoy es **verde claro** (`--verde-lt`, 9.82:1 sobre tinta), porque el
dueño pidió cambiar el texto rosa por verde.

El cambio se hizo sobre el acento entero y no solo sobre la letra: si el texto va
en verde y los filetes se quedan rosas, la zona se lee descuadrada. Así que en
esos tres contextos cambian las cuatro variables del acento (`--acento`,
`--acento-grafico`, `--acento-suave`, `--acento-linea`) y el magenta deja de
usarse como acento de texto.

El verde claro es **solo para superficie oscura**: sobre papel no se usa, porque
no pasa contraste. Sobre claro el acento es el oro oscuro, como en el resto.

### Jerarquía: nada se destaca sin motivo

Las seis tarjetas del diagnóstico son seis problemas del **mismo valor**: ninguna
va destacada. La primera iba en oscuro y eso sugería «empieza por aquí» sin que
nada lo dijera — una jerarquía inventada por el diseño, no por el contenido. Las
seis comparten peso: mismo borde, mismo tamaño de letra y el mismo tinte claro
(seis tintes distintos, todos del mismo valor de luz, que dan variedad sin
jerarquía). El acento aparece **al pasar el cursor**, que es donde sí comunica
algo: «esta es la que estás a punto de abrir».

La regla general: si algo se ve más importante que lo demás, tiene que haber una
razón escrita en el contenido. Si no la hay, se iguala.

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

### Texto que se escribe solo (el rotador)

Dos lugares de la página tienen texto que se escribe y se borra en ciclo: la
segunda línea del titular del hero y el bloque de negocios de la etapa de
sistemas. Los maneja `js/rotador.js`, con JavaScript nativo y sin bibliotecas.

Cualquier elemento con `data-rotador` y frases separadas por `|` en
`data-frases` entra solo. Cuatro reglas que no se negocian:

1. **Sin JavaScript se ve.** La primera frase está escrita en el HTML, no la pone
   el script. Comprobado cargando la página con el JavaScript desactivado.
2. **Quien pide calma, la tiene — pero el texto sigue alternando.** Con
   `prefers-reduced-motion: reduce` no hay tecleo, ni fundido, ni cursor: la
   frase se sustituye de golpe cada siete segundos. Congelarla del todo fue un
   error: Android trae esa preferencia activada por omisión en muchos equipos (la
   escala de animación en cero), así que el texto se veía fijo en media Android.
   Lo que se evita es el movimiento, no la información.
3. **Los lectores de pantalla no oyen el tecleo.** Lo que se anima va
   `aria-hidden`; al lado hay un `.visualmente-oculto` con todo el contenido de
   una vez, y el titular del hero tiene una frase quieta que cubre las tres
   variantes.
4. **El diseño no salta.** Antes de empezar se reserva el alto de la frase más
   larga. El bloque de negocios queda fijo en 60 px mientras el texto va y viene.

**Dos líneas, y una corrección.** Cuando entró el rotador reporté que el titular
había pasado a tres líneas y que para volver a dos habría que bajarlo a 50 px.
Era falso: la medición contaba el alto reservado del rotador **y** el bloque
oculto para lectores de pantalla, que también devuelve rectángulos. Medido bien
—solo renglones visibles, sin el alto reservado— el titular siempre estuvo en dos
líneas.

Aun así la escala se bajó de 58 a 54 px en escritorio, a pedido del dueño: con
la frase del rotador más larga, 58 px quedaba al filo. Ahora caben las tres
frases en dos renglones en los trece anchos probados (de 320 a 1600) y con aire
de sobra. **La lección para la próxima medición: aislar el texto que se mide.**
Contar rectángulos de un contenedor que además tiene un `min-height` reservado y
un elemento oculto da un número que no significa nada.

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

### Los tres ejemplos de proyectos

La sección se llamaba «laboratorio» y sonaba a borrador de aficionado. Ahora se
presenta como **ejemplos de proyectos**, con las etiquetas en palabras llanas
—`El problema · Qué hicimos · Por qué así`— y una frase ancla que educa: ninguno
se vende tal cual, cada uno se construye desde cero.

Son **tres piezas y las tres son trabajo real**, sin una sola maqueta de
plantilla:

1. **Mostrador**, el cotizador y cobrador de mostrador: con capturas del sistema
   funcionando y sin enlace, porque el código de una página publicada se descarga
   entero. Es la pieza que enseña el sistema que se vende como «programa para
   cotizar y cobrar», y va marcada `Sistema propio` porque todavía no lo opera
   ningún negocio.
2. **El expediente del taller**, con capturas reales del sistema funcionando.
   Su página no se enlaza, por la misma razón.
3. **Un reel para una clienta** (consultorio), publicado con su visto bueno.
   La autorización está confirmada por el dueño del estudio y queda registrada
   en `docs/autorizaciones.md`. Mientras no haya permiso explícito para
   nombrarla, la pieza se queda sin nombre y sin logotipo.

> **La pieza del cotizador de esta misma página salió de los ejemplos.** Se
> retiró al entrar Mostrador: eran dos cotizadores en la misma sección y el
> armador de esta página ya se ve y se usa más abajo, sin necesidad de
> presentarlo como pieza. Su captura quedó sin uso en
> `assets/producto/cotizador.webp`.

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
gustaría que fuera. «Está en vivo» se reserva para cuando hay algo que la persona
pueda usar en ese momento; hoy **ninguna pieza lo lleva**, porque los dos
sistemas se enseñan en capturas y el armador de esta página, que sí se puede
usar, se retiró de los ejemplos. El resto se marca por lo que es: «Sistema
propio» o «Pieza para cliente». Y nunca se presenta una maqueta como si fuera un
producto funcionando.

**Lo que sí se enlaza y lo que no.** Un enlace para probar un sistema es un
enlace para copiarlo: todo lo que el navegador muestra, el navegador lo puede
guardar. Por eso el producto terminado se enseña en capturas y se entrega al
cliente que lo contrata.

### Precios: dónde se cambian

**⚠️ Los precios viven en el HTML, nunca en JavaScript.** Aparecen dos veces y
hay que mover los dos sitios a la vez:

1. La tabla visible de cada etapa (desde el commit de precios en tablas, los
   renglones son filas de tabla, no elementos de lista; el nombre lleva dentro un
   botón que abre el detalle):
   ```html
   <tr class="tarifa__fila">
     <th scope="row" class="tarifa__que">
       <button class="tarifa__boton" type="button" data-globo="…" aria-expanded="false">…</button>
     </th>
     <td class="tarifa__precio">desde $9,600</td>
   </tr>
   ```
2. La casilla equivalente del armador de paquete, que además suma el total:
   ```html
   <label class="opcion"><input type="checkbox" name="sistema" value="Cotizar y cobrar" data-precio="9600">…</label>
   ```

Así se ven aunque el visitante no cargue el script y las indexa el buscador. Son
precios de partida, no cerrados: el valor real se confirma por escrito.

**Datos de personas: fuera del repositorio.** El repositorio es **público**
(comprobado: `wildpig94/camena-web-2` → `"private": false`), así que `docs/` se lee
desde GitHub aunque no se publique en el sitio. Todo lo que nombre o cite a una
persona vive en `~/productos-camena/privado/`: la investigación del taller con sus
citas, las transcripciones de las notas de voz, los contactos y los nombres del
taller. Antes de escribir algo en `docs/`, la pregunta es si le gustaría leerlo a la
persona de la que habla.

**La ficha del renglón.** Una cifra sola («desde $9,600») dice cuánto y no dice
qué, y el dueño que compara precios se queda sin con qué comparar. Hoy **17 de
los 28 renglones de precio** abren una ficha con tres partes:

```html
<div class="servicios__globo" id="g-…" role="region" aria-label="Qué incluye: …">
  <p class="servicios__resumen">Del presupuesto al pago: …</p>   <!-- qué es -->
  <p class="servicios__etiqueta">Incluye</p>                      <!-- rótulo -->
  <ul class="servicios__incluye"><li>…</li>…</ul>                 <!-- qué trae -->
  <p class="servicios__nota"><strong>Es tuyo: …</strong></p>      <!-- si toca -->
</div>
```

Están en las bandas de marca (5), presencia (4) y sistemas (8). Las cuatro de
producción y las siete de campañas siguen con una frase, por lo que se explica
abajo.

Reglas de esta ficha, aprendidas a golpes:

- **Cosas, no promesas.** Puntos concretos y técnicos. «Lista de adeudos ordenada
  por antigüedad» se puede construir; «más ventas» no se puede firmar.
- **El globo es un `div`, no un `span`.** Una lista dentro de un `span` no es
  HTML válido. Se cambiaron al agregarles el «Incluye».
- **La ficha va en el flujo, no flotando.** Nació como globo de una línea que
  flotaba sobre los renglones de abajo: cabía porque medía 99 px. Con el
  «Incluye» mide entre 200 y 270 px, y flotando **tapaba la nota y los botones
  del pie en 16 de 28 fichas** (medido con `docs/medir-fichas.mjs`). Ahora se
  abre en su propio renglón y empuja lo que sigue, igual que ya hacía en el
  celular: ninguna ficha esconde nada.
- **Se abre al tocar, no al pasar el ratón.** Con fichas de este tamaño, mover
  el cursor por la tabla la reacomodaría entera. El renglón conserva el cambio
  de color como pista de que se puede tocar, y el teclado la abre al enfocarlo.
- **Donde la columna es angosta, no hay lista.** En la banda de producción la
  tabla vive en una columna de 120 px (la tarjeta mide 605 y el video ocupa 272
  al lado): una lista de tres puntos ahí mide **566 px de alto y 120 de ancho**,
  ilegible. Esos cuatro renglones llevan el mismo contenido en una frase.
- **El fondo oscuro de la ficha es solo para la banda oscura**
  (`.etapa--destacada .servicios__globo`). Ver la lección 8 de auditoría: estaba
  escrito como regla global y sin efecto, y dejaba texto claro sobre papel claro.

**Coherencia obligatoria de las cifras.** Hay dos precios de entrada y aparecen
en cinco sitios: hero (línea de precios y datos), índice lateral, etapas, armador y
la primera respuesta del FAQ, además de los datos estructurados. Hoy son **$1,800
el diseño y $9,600 los sistemas**. Estuvieron desincronizados —el FAQ decía
$3,500— y eso rompe la confianza justo en la pregunta que más se hace. Comprobado
el 16 de septiembre: cero apariciones de las cifras viejas en las tres páginas
públicas, y las 28 filas de las cinco tablas dicen lo mismo.

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
   anteriores y pasaba en verde. Y había algo peor, encontrado al revisar esto:
   si un par nombraba un token que la lista de colores no tenía —el magenta se
   quedó fuera cuando se agregó el rojo— el script **moría con un `KeyError` a
   media tabla**. Un guardián que revienta no avisa de nada: deja de proteger y
   nadie se entera. Ahora el script compara **token por token** contra
   `css/variables.css`, falla nombrando la diferencia («aquí #FF0000, en el
   sitio #D0614F») y rechaza cualquier par que use un color ausente de la
   paleta, en lugar de caerse. Comprobado metiendo un color falso a propósito.

7. **Una columna de la rejilla vacía.** Ninguna comprobación mira si el espacio
   se está usando: se mide lo que desborda, no lo que falta. En la banda de
   sistemas, de 1226 px de ancho, la tabla de precios ocupaba 506 en la columna
   izquierda y **720 px de la derecha quedaban en blanco**, porque el bloque
   animado de negocios va a todo lo ancho y, al colocarse solo en la rejilla,
   empujaba los precios a la fila siguiente. La regla que quería decir «el
   problema a la izquierda, los entregables y el precio a la derecha» llevaba
   quién sabe cuánto tiempo sin decirse. Lo vio el dueño mirando la página, no
   un script. Se arregla con `grid-column` y `grid-row` explícitos: cuando una
   rejilla tiene una pieza que ocupa todo el ancho, **las demás hay que
   colocarlas a mano**.

8. **Lo que está escondido no se mide.** La ficha de un renglón solo se pinta al
   abrirla, y la auditoría general mide la página como se ve al cargar: con las
   fichas cerradas. Así vivió sin que nadie lo viera un texto **a 1.07:1** —
   gris claro sobre papel claro, ilegible— en la banda oscura: la regla que le
   daba fondo oscuro a la ficha estaba escrita como `.servicios__globo` a secas,
   en medio de la tabla de precios, y hacía dos cosas malas a la vez: le daba
   fondo oscuro a las fichas de todas las bandas y, como la regla base viene más
   abajo en el archivo, ni siquiera se aplicaba. De ahí el nombre de
   `docs/medir-fichas.mjs`: **abre las 28 fichas una por una y mide el contraste
   de cada texto contra su fondo real**, además de avisar si alguna tapa el pie
   de su banda. Dos reglas: si algo se abre, se mide abierto; y una regla de
   contexto (`.banda .pieza`) escrita sin su contexto no es una regla, es una
   trampa.

9. **La herramienta de medir también se equivoca.** La primera versión de
   `medir-fichas.mjs` daba **todo por bueno**. Dentro de una plantilla de
   JavaScript, `/[\d.]+/g` pierde la barra invertida al viajar, así que el
   navegador recibía `/[d.]+/g`: no encontraba un solo dígito, los contrastes
   salían `NaN` y `NaN < 4.5` es falso, así que **ningún texto fallaba nunca**.
   Se descubrió rompiendo un color a propósito: el medidor dijo que todo estaba
   bien. Se arregló con una clase explícita (`[0-9.]`) y ahora informa los cuatro
   textos más apretados, para que un `NaN` o un cero no puedan pasar por un
   visto bueno. **Un medidor que no se puede hacer fallar a propósito no sirve.**

   La trampa volvió dos veces más, las dos en `docs/probar-producto.mjs`: dentro
   de una plantilla de JavaScript `\$` se convierte en `$` y `\d` en `d`, así que
   una medida escrita con expresión regular devuelve nada y **parece un cero**.
   Regla que queda: en las expresiones que viajan dentro de una plantilla **no se
   usan escapes** — se lee del DOM (`querySelector('.car-piezas b').textContent`)
   en vez de recortar texto con una expresión regular. Si de plano no se puede
   evitar, se escribe la barra doble.

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
- [x] Sistemas enseñados **solo con capturas**, con su ficha en los ejemplos y
      **fuera del repositorio**: el expediente del taller y Control de Autos viven
      en `~/productos-camena/`, y la publicación frena si un archivo de producto
      terminado entra a una carpeta que sí se copia
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
      nota del 15 de septiembre y está en `~/productos-camena/privado/investigacion-taller.md`, D9)
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

---

## El dominio propio

El sitio vive hoy en `https://wildpig94.github.io/camena-web-2/`. La mudanza a un
dominio propio **no se hace a mano**: la dirección vieja aparece 22 veces en 7
archivos —canonical, `og:url`, `twitter:image`, datos estructurados, sitemap y
robots— y cambiarla a medias deja al buscador y a las previsualizaciones de
WhatsApp apuntando al sitio viejo.

```bash
bash docs/cambiar-dominio.sh camena.mx              # muestra qué cambiaría
bash docs/cambiar-dominio.sh camena.mx --aplicar    # lo hace y crea el CNAME
```

Después: DNS en el registrador (cuatro registros `A` a `185.199.108-111.153` y un
`CNAME` para `www` hacia `wildpig94.github.io`), el dominio en Settings → Pages, y
«Enforce HTTPS». Si el DNS lo lleva Cloudflare, los registros van en **DNS only**
(nube gris): el proxy naranja estorba al certificado de GitHub Pages.

**Dos candados en el flujo de publicación**, porque los dos errores caros ya
pasaron una vez:

1. **Lista blanca de páginas.** Si aparece una página que no sea del sitio en una
   carpeta que se copia, la publicación **falla** en vez de regalarla en silencio.
   (Nació de que el sistema del taller se publicaba por una excepción en la lista.)
2. **Mudanza completa.** Con `CNAME` presente, si queda una sola aparición de
   `wildpig94.github.io` en lo que se publica, la publicación **falla** y dice el
   comando para arreglarlo.

Se comprueban con la simulación local antes de subir: los pasos del flujo corren
igual en la terminal (`docs/auditar.sh`, y el candado se replica a mano).
