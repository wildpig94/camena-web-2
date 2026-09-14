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
| `index.html` | Qué se vende con precio, siete casos, cuatro etapas, armador de paquete, preguntas y contacto |
| `servicios.html` | El catálogo completo: los siete servicios en detalle |
| `como-trabajamos.html` | El método paso por paso y la mecánica de pago |

**Regla al añadir contenido:** si algo explica pero no ayuda a decidir, va en
una página secundaria. El inicio no es un folleto.

---

## Qué es esto

CAMENA dejó de ser «la agencia que hace páginas web». Ahora es un estudio que
diseña marcas, produce contenido, arma campañas y construye herramientas
—incluidos sistemas y automatizaciones— para negocios y proyectos. Este sitio
existe para que eso se entienda en los primeros segundos, y para que quien
llegue con un problema —no con una lista de servicios— encuentre por dónde
empezar.

Tres reglas gobiernan todas las decisiones de aquí:

1. **Honestidad comercial.** No hay clientes, testimonios, cifras, premios ni
   equipo inventados. Donde una agencia normalmente pondría una foto falsa o un
   «+500 clientes», aquí hay trabajo propio etiquetado como tal.
2. **La IA es una herramienta, no el producto.** Si se borrara la palabra «IA»
   del sitio, la propuesta seguiría en pie.
3. **El criterio es humano.** La tecnología acelera, pero decide y revisa una
   persona, y eso se dice con claridad.

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

- Un solo `h1` y jerarquía de encabezados sin saltos.
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
| ¿Quién eres y me vas a facturar? | Ficha de «Detrás de CAMENA»: quién atiende, base, facturación, propiedad |
| ¿Cuánto cuesta y cómo se paga? | Bloque de inversión (sección 09) y FAQ |
| ¿Y si no funciona, o después de la entrega qué? | Ficha, FAQ y «Términos del servicio» |

La prueba que sustituye a un portafolio de clientes que aún no existe es el
propio sitio: **está dicho en la sección «Detrás de CAMENA» que esta página la
diseñamos y programamos aquí.** Es verificable y no exige inventar nada.

### Los tres grupos de servicio

La oferta se presenta agrupada, porque «hacemos muchas cosas» no dice qué
contratar. Los siete servicios viven dentro de tres grupos, y **esta es la
única sección donde el marco se explica completo**: las demás solo lo
referencian con una línea.

| Grupo | Qué resuelve | Disciplinas |
|---|---|---|
| **Presencia** | Que te encuentren y te reconozcan | Marca · Web · Google y WhatsApp |
| **Contenido** | Que tengas qué mostrar y a quién mostrarlo | Video · Audio · Publicidad |
| **Operación** | Que el negocio funcione sin tu memoria | Sistemas · Automatización · IA |

### Nombres y precios de los paquetes

Van en el idioma del cliente y sin chocar con el nombre de una disciplina:
**Arranque · Identidad · Sitio · Contenido · Todo junto · Sistema · A la medida**.
Cada uno dice explícitamente qué **no** incluye: sin exclusiones, los seis se
leen como «depende».

**⚠️ Dónde se cambian los precios.** En el HTML, en el bloque de cada paquete:

```html
<p class="paquete__precio">Desde <strong>$8,000 MXN</strong></p>
```

Los precios **no** se generan por JavaScript a propósito: así se ven aunque el
visitante no cargue el script, los indexa el buscador y una tarifa equivocada no
queda escondida detrás de un código que falla. Son precios de partida, no
cerrados: el valor real de cada proyecto se confirma por escrito.

Los `data-precio` de cada tarjeta se conservan solo como referencia de qué
tarifa corresponde a qué paquete.

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
  horario de atención y `FAQPage` con las ocho preguntas **en el mismo orden y
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
- [x] Auditoría en 1440 / 1024 / 390 / 320 px sin hallazgos
- [ ] Conectar `camena.mx` y reemplazar la URL de GitHub Pages (ver arriba)
- [ ] Sumar proyectos reales al LAB cuando haya autorización
- [ ] Páginas individuales por servicio (la estructura ya lo permite)
- [ ] Contenido propio: casos de estudio, recursos y herramientas
