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

**Regla al añadir contenido:** si algo explica pero no ayuda a decidir, va en
una página secundaria. El inicio no es un folleto.

---

## Qué es esto

CAMENA dejó de ser «la agencia que hace páginas web». Es un **estudio de diseño y
sistemas operativos para negocios locales**: hace que el negocio se vea del tamaño
de su trabajo y que funcione sin depender de la memoria del dueño. Las dos mitades
pesan igual —marca, página web, video y publicidad por un lado; ventas, cobros,
inventario y automatización por el otro— y el sitio entero está ordenado para que
eso se entienda en los primeros segundos.

**El eje se repite en todas las secciones, y ahí está la prueba de que es el eje:**

| Sección | Cómo se ve el eje |
|---|---|
| Hero | Titular en dos golpes (`Te ves profesional.` / `Operas sin enredos.`) y **dos mitades en columnas del mismo ancho**, una por cada mitad del estudio. El titular nunca se cambia por una frase larga. |
| Datos del hero | Primer dato: diseño desde $1,500. Segundo: sistemas desde $8,000. Mismo peso, mismas cifras publicadas. |
| Índice lateral | Abre con «Sistemas a la medida» y «Automatización»; después, la parte de diseño. |
| Diagnósticos | La sección se titula **«¿Qué te está costando dinero?»** y cada tarjeta nombra el costo (regateo, ventas que no cuadran, deudas que no se cobran). La tarjeta resaltada es la operativa, no la de diseño. |
| Precios | La etapa 3 —sistemas desde $8,000— es la **banda protagonista**: ancho completo, única superficie oscura, sello, filete dorado, título a escala mayor y CTA directo a WhatsApp. Las etapas de diseño quedan sobre papel. El paquete de entrada sigue existiendo, pero ya no es lo que más pesa. |
| `servicios.html` | El catálogo **abre con «Sistemas y operación»** (01 y 02) y sigue con marca, presencia y contenido. |
| `como-trabajamos.html` | Sección propia: «Diseño y sistemas, en el mismo estudio», con las tres piezas del puente entre ambas mitades. |

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
| **Entra por el dolor, no por la justificación.** | «Si tu imagen no está a la altura de tu trabajo, estás perdiendo clientes antes de que te conozcan.» | «Casi nadie llega pidiendo un servicio…» |
| **Frases cortas y en segunda persona.** El sujeto es el negocio del cliente, no el estudio. | «Te ves más pequeño de lo que eres.» | «Un logotipo hecho en una app puede transmitir…» |
| **Un párrafo, una idea.** Máximo dos o tres renglones. | Un renglón por viñeta, en sustantivos concretos. | Párrafos que explican por qué el problema es un problema. |
| **Se dice qué se entrega, no cómo nos sentimos.** | «Cotizaciones que se arman solas.» | «Nos apasiona acompañarte en tu proceso.» |
| **El dolor se cuenta en dinero, tiempo o control.** | «Entregas y no sabes quién te debe ni cuánto.» | «La organización es clave para crecer.» |
| **La honestidad es parte del tono, no una disculpa.** | «No son trabajos de clientes: son problemas de negocio reales, resueltos hasta el final.» | «Todavía no tenemos autorización, pero…» |

**Reglas de estructura de la página que acompañan a la voz:**

- **El titular del hero son dos golpes cortos**, no una frase completa. La
  promesa entera («ayudamos a los negocios locales a verse profesionales y a
  operar sin enredos») ocupa cinco renglones a cuerpo de display y empuja el
  botón fuera de la primera pantalla. Debajo van **las dos mitades del estudio en
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
│   └── fonts/                  Fraunces auto-hospedada (normal + itálica)
│
└── docs/
    ├── verificar-contraste.py  Comprueba la paleta contra WCAG AA
    └── auditar.sh              Auditoría del sitio renderizado
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

## Sistema de diseño

### Color

Paleta de dos superficies con un solo acento. El acento es **oro**, y su tono
cambia según el fondo porque el mismo dorado no sirve en los dos:

| Token | Valor | Uso | Contraste medido |
|---|---|---|---|
| `--ink` | `#191510` | Fondo oscuro, texto sobre claro | 16.75:1 sobre hueso |
| `--paper` | `#F8F3E8` | Fondo principal claro (hueso cálido) | — |
| `--oro` | `#C9962B` | Acento gráfico sobre oscuro | 7.24:1 sobre tinta |
| `--oro-lt` | `#E5BC55` | Acento de **texto** sobre oscuro | 10.70:1 sobre tinta |
| `--oro-tx` | `#7A560F` | Acento de **texto** sobre claro | 5.98:1 sobre hueso |

Detalle que importa: sobre fondo claro el oro de marca **no puede llevar
información** (2.40:1). Ahí solo se usa como filete decorativo de 1 px; para
cualquier marca con significado se usa `--oro-tx`. El acento se resuelve solo:
los bloques oscuros redefinen `--acento`, así que un componente escrito una vez
funciona en claro y en oscuro.

La tinta es un **marrón muy oscuro** (`#191510`), no negro puro. El público
del estudio son negocios tradicionales; un negro neutro comunica estudio
sofisticado pero puede leerse frío o distante. El fondo cálido mantiene el
contraste (16.75:1) y se acerca más.

**Pendiente de validar con personas reales:** este cambio de temperatura se
decidió por criterio, no por evidencia. Antes de darlo por bueno, conviene
mostrar el sitio a dos o tres dueños de negocio y preguntarles si les da
confianza. Si la respuesta es que prefieren algo más claro, el cambio es
cambiar los tokens de `variables.css`, no rehacer el diseño.

### Tipografía

- **Títulos:** Fraunces, auto-hospedada (107 KB, dos archivos). Una serif con
  carácter en lugar de la sans genérica.
- **Texto:** la fuente del sistema. Cero peticiones, cero parpadeo.
- **Detalle técnico:** pila monoespaciada del sistema para números, etiquetas y
  metadatos. Es lo que le da al sitio su aire de estudio y no de plantilla.

El `h1` ronda 4.5× el tamaño del cuerpo en escritorio, con escala fluida
(`clamp`) para que no haya saltos entre anchos.

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

## Rendimiento

- Sin frameworks, sin dependencias, sin build. Cuatro archivos JS pequeños.
- Dos archivos de fuente auto-hospedados, precargados, con `font-display: swap`
  y `unicode-range` limitado a latino.
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

El inicio agrupa la oferta por **etapa del negocio**, porque «hacemos muchas
cosas» no dice qué contratar:

| Etapa | Para quién | Qué entra | Tratamiento |
|---|---|---|---|
| 1 · Marca | Todavía no tiene logo ni colores | Logo · identidad · hoja de uso · papelería · etiquetas | Tarjeta sobre papel |
| 2 · Presencia | Ya tiene marca y no lo encuentran | Páginas · catálogos · ficha de Google · video · audio · campañas | Tarjeta sobre papel |
| **3 · Operación** | **Ya vende y la información vive en cuadernos** | **Sistemas a la medida · ventas · cobros · inventario · citas · tableros · automatización** | **Banda a todo el ancho, superficie oscura, sello, título grande y CTA a WhatsApp** |
| 4 · Campañas | Necesita presencia constante | Marca de campaña · contenido por mes · piezas · base de datos | Banda a todo el ancho, sobre papel |

**Regla de la banda oscura:** es exclusiva de la etapa de sistemas. Cuando dos
etapas la compartían, las dos pesaban igual y ninguna destacaba. Si algún día se
añade otra etapa, va sobre papel.

`servicios.html` usa el mismo material en cuatro grupos, **en otro orden**: abre
con *Sistemas y operación* (disciplinas 01 y 02), y sigue con *Marca*, *Presencia
en internet* y *Contenido y publicidad*. El catálogo abre por donde está el
trabajo de mayor valor y el que menos se parece a «agencia de páginas web».

### Los tres casos de estudio del LAB

La sección se llamaba «laboratorio» y sonaba a borrador de aficionado. Ahora se
presenta como **casos de estudio y prototipos de innovación**: portafolio de
diseño y de ingeniería, con el problema, el enfoque y la decisión documentados.
La honestidad no cambió —son piezas propias, sin cliente detrás—; lo que cambió
es que ya no se disculpa por serlo. Cada ficha usa `Problema · Enfoque ·
Decisión` (técnica o de diseño) en lugar de un relato.

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

Estas tres comprobaciones faltaban y por eso entraron fallos reales:

1. **HTML incompleto.** Un corte accidental puede dejar la página
   «funcionando» pero mutilada: sin formulario, sin cierres. Se comprobó en
   producción y estuvo horas publicado. Ahora el flujo de publicación cuenta
   etiquetas y campos antes de desplegar.
2. **Contraste de controles.** La auditoría medía texto, no bordes. Un botón
   de contorno con borde a 1.31:1 no se percibe como botón, y no aparecía en
   ningún informe. `docs/movil.mjs` ahora revisa bordes de controles sin fondo
   propio y exige 3:1.
3. **Paleta desincronizada.** `docs/verificar-contraste.py` medía los colores
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
  y sin que el trabajo exista.
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
- [ ] Decidir el lema: «Tu idea. Nuestra solución.» sigue en el pie, en Open
      Graph y en los datos estructurados, y es lo más genérico que queda del
      sitio. Si se cambia, hay que cambiarlo en los tres sitios a la vez
- [ ] Conectar `camena.mx` y reemplazar la URL de GitHub Pages (ver arriba)
- [ ] Sumar proyectos reales al LAB cuando haya autorización
- [ ] Páginas individuales por servicio (la estructura ya lo permite)
- [ ] Contenido propio: casos de estudio, recursos y herramientas
