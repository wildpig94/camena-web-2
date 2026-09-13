# CAMENA 2.0

Sitio del estudio creativo y tecnológico **CAMENA**.
Estático, sin dependencias, sin paso de compilación: se sube tal cual.

> **Tu idea. Nuestra solución.**

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
├── index.html                  Página principal (13 secciones)
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
| `--ink` | `#0E0E10` | Fondo oscuro, texto sobre claro | 17.38:1 sobre hueso |
| `--paper` | `#F6F3EA` | Fondo principal claro | — |
| `--oro` | `#C9962B` | Acento gráfico sobre oscuro | 7.24:1 sobre tinta |
| `--oro-lt` | `#E5BC55` | Acento de **texto** sobre oscuro | 10.70:1 sobre tinta |
| `--oro-tx` | `#7A560F` | Acento de **texto** sobre claro | 5.98:1 sobre hueso |

Detalle que importa: sobre fondo claro el oro de marca **no puede llevar
información** (2.40:1). Ahí solo se usa como filete decorativo de 1 px; para
cualquier marca con significado se usa `--oro-tx`. El acento se resuelve solo:
los bloques oscuros redefinen `--acento`, así que un componente escrito una vez
funciona en claro y en oscuro.

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

### Nombres de los paquetes

Van en el idioma del cliente y sin chocar con el nombre de una disciplina:
**Arranque · Identidad · Sitio · Contenido · Sistema · A la medida**.
Cada uno dice explícitamente qué **no** incluye: sin exclusiones, los seis se
leen como «depende».

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
  horario de atención y `FAQPage` con las doce preguntas **en el mismo orden y
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

**Limitación conocida del entorno de auditoría:** el Chromium headless de esta
máquina no dispara `IntersectionObserver`, `setTimeout` ni
`requestAnimationFrame` bajo `--dump-dom`, y no permite desplazar la ventana.
Por eso la auditoría no puede comprobar aquí la animación de aparición: se
verifica por revisión de código y por captura de pantalla. Es una limitación
del entorno, no del sitio.

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
