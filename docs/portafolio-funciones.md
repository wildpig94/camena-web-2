# Portafolio de funciones de CAMENA

Catálogo de todo lo que construimos y que **se puede reutilizar en las páginas
siguientes sin volver a inventarlo**. Cada pieza dice qué es, dónde vive, cómo se
usa y qué regla no se puede romper.

Documento interno: no se publica. Cuando alguna de estas piezas cambie, se
actualiza aquí.

---

## 1 · Rotador de texto (escribir y borrar, o fundido)

**Qué es:** un bloque de texto que se escribe letra por letra o que entra y sale
con un fundido, alternando varias frases.

**Dónde vive:** `js/rotador.js` + los estilos `.rotador*` en `css/components.css`.

**Cómo se usa:** cualquier elemento con `data-rotador` y las frases separadas por
`|` en `data-frases`.

```html
<p class="rotador" data-rotador data-modo="fundido"
   data-frases="Frase uno // su solución|Frase dos // su solución">Frase uno // su solución</p>
```

- **Modo tecleo** (por defecto): para frases cortas, hasta unos 40 caracteres.
- **`data-modo="fundido"`**: para frases largas. Escribir 130 letras se siente
  eterno por más rápido que se escriba.
- **`//`** parte la frase en dos colores: lo de antes es el problema (gris) y lo
  de después la solución (acento).
- La primera frase **va escrita en el HTML**, no la pone el script.

**Reglas que no se rompen:** sin JavaScript se ve la primera frase; lo animado va
`aria-hidden` con una versión quieta en `.visualmente-oculto`; y el alto se
reserva con la frase más larga para que nada de abajo se mueva.

**Con `prefers-reduced-motion` el texto SIGUE alternando, pero sin movimiento:**
la frase se sustituye de golpe cada siete segundos, sin tecleo, sin fundido y sin
cursor. Antes se congelaba en la primera frase y eso se veía roto: Android trae
esa preferencia activada por omisión en muchos equipos (la escala de animación en
cero), así que medio mundo veía un texto fijo. Lo que hay que evitar es el
movimiento, no el cambio de información. **No lo vuelvas a congelar.**

---

## 2 · Globo de detalle en una fila (precio o dato)

**Qué es:** una fila que al tocarla o pasar el ratón abre una tarjeta con el
detalle. En escritorio flota; en móvil entra en el flujo y empuja el contenido.

**Dónde vive:** `js/interacciones.js` (clic y teclado) + `.servicios__globo` en
`css/components.css` y su ajuste en `css/responsive.css`.

**Cómo se usa:** un botón con `data-globo="id"` y `aria-expanded`, y el globo con
ese `id`.

**Reglas que no se rompen:** el globo es un `<span>`; al quitarle
`position: absolute` en móvil hay que devolverle `display: block`, o vuelve a ser
elemento en línea y su relleno se pinta encima de la fila siguiente. Y oculto no
puede ocupar lugar: `display: none`, no `visibility: hidden`. El `:hover` solo se
activa con puntero fino, porque en táctil se queda pegado.

---

## 3 · Tabla de precios

**Qué es:** la lista de precios como tabla de verdad (`table`, `thead`,
`th scope`, `td`), con el signo `+` que se dibuja con CSS y se vuelve `−` al
abrir.

**Dónde vive:** `.tarifa*` en `css/components.css`; el patrón de móvil en
`css/responsive.css`.

**Cómo se usa:** `<table class="tarifa">` con `<caption class="visualmente-oculto>`
para el nombre accesible, filas `.tarifa__fila`, celda del nombre `.tarifa__que`
con el botón `.tarifa__boton` y celda del precio `.tarifa__precio`.

**Reglas que no se rompen:** la columna del precio lleva `width: 1%` para
encogerse al contenido y no robarle ancho al nombre; las cifras van con
`font-variant-numeric: tabular-nums` para alinearse; nada de cebra, ni cajas, ni
fondo de color (eso es lo que la hace parecer plantilla).

---

## 4 · Visor de capturas

**Qué es:** una captura que al hacer clic se abre a tamaño completo encima de la
página.

**Dónde vive:** `js/visor.js` + `.visor*`, `.captura__abrir`, `.captura__lupa` en
`css/components.css`.

**Cómo se usa:** la imagen se envuelve en `<a class="captura__abrir" href="ruta"
data-visor>` y en el HTML va una sola capa `<div class="visor" hidden>`.

**Reglas que no se rompen:** sin JavaScript el enlace abre la imagen en el
navegador (es el camino de respaldo, no un extra); Escape cierra y el foco vuelve
al enlace; mientras está abierto, el cuerpo no se desplaza.

---

## 5 · Tarjetas con tono propio y agrandado al pasar el ratón

**Qué es:** una rejilla donde cada tarjeta tiene su tono suave, y la que se queda
bajo el ratón un segundo se agranda un poco para leer cómodo.

**Dónde vive:** tokens `--tinte-0` a `--tinte-7` en `css/variables.css`; reglas
`.caso-tarjeta--tN` en `css/components.css`.

**Cómo se usa:** se añade `caso-tarjeta--tN` a cada tarjeta. El agrandado es
automático con `:hover`.

**Reglas que no se rompen:** los tintes son muy claros (L* > 94) y **cambian el
acento**: sobre ellos el oro normal se queda en 4.41:1 y no pasa, así que el
contexto baja a `--oro-fuerte`. Una tarjeta con fondo oscuro y texto claro
**no puede** recibir un tinte claro: se queda con `--tinte-0`. Y el agrandado va
con `transition-delay: 1s`, para que la rejilla no tiemble al pasar de largo.

---

## 6 · Capturas reales con pie que aclara

**Qué es:** la forma de enseñar un producto sin regalarlo: capturas de uso real,
con un pie que dice qué es y que no es un programa que se descargue.

**Dónde vive:** `.lab-pieza`, `.captura`, `.captura__nota` en `css/components.css`.

**Cómo se usa:** cada ejemplo lleva su captura con `alt` descriptivo y su ficha de
tres renglones: **El problema / Qué hicimos / Por qué así**.

**Reglas que no se rompen:** se muestra trabajo que existe; la maqueta que no se
puede probar no se presenta como producto; y ninguna página de producto terminado
se enlaza desde el sitio (lo que se puede abrir, se puede copiar).

---

## 7 · Sello, etiqueta y encabezado de sección

**Qué es:** los tres rótulos que ordenan la página: `.sello` (dónde está el
estudio), `.etiqueta` (de qué va la sección) y `.encabezado` (título + intro).

**Dónde vive:** `css/layout.css`.

**Regla que no se rompe:** la escalera tipográfica son nueve escalones
(`--t-n1` … `--t-micro`). Si algo no cabe, se cambia la palabra, no se inventa un
tamaño nuevo.

---

## 8 · Publicación: caché, verificación y candado

**Qué es:** las piezas del proceso, que también se reutilizan en cualquier sitio
nuevo.

- **`docs/versionar.py`**: sella la huella del contenido en las URLs de CSS y JS.
  Se corre solo en cada publicación.
- **Candado del despliegue**: si un archivo de producto terminado entra en
  `producto/`, la publicación falla en vez de regalarlo.
- **Verificación**: `docs/movil.mjs` (render, contraste, desborde, objetivos),
  `docs/revisar-medios.mjs` (medios deformados y cajas recortadas),
  `docs/medir-hero.mjs`, `docs/medir-escala.mjs`,
  `docs/verificar-contraste.py` (paleta contra WCAG AA).

**Regla que no se rompe:** nada se publica sin pasar las cinco comprobaciones. Y
toda medición tiene que **aislar lo que mide**: contar rectángulos de un
contenedor con `min-height` reservado y un elemento oculto da un número que no
significa nada (pasó, y llevó a una conclusión falsa).
