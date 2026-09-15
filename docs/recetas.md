# Recetario: editar el sitio tú mismo

Todo lo que sigue son cambios pequeños que puedes hacer sin tocar el diseño
entero. La regla que hace que esto funcione: **el sitio está hecho de piezas con
nombre**, y cada color viene de una sola variable. Si cambias la variable, cambia
todo lo que la usa; si quieres cambiar una sola cosa, le pones un nombre nuevo.

Antes de empezar, dos herramientas que ya están en el repo:

```bash
# Ver el sitio en local (déjalo corriendo en una terminal)
cd camena-2.0 && python3 -m http.server 8899 --bind 127.0.0.1
# → http://127.0.0.1:8899/index.html

# Para revisar y marcar cambios, con el marcador encendido
bash docs/revisar.sh
# → http://127.0.0.1:8899/docs/revision/sitio/index.html

# Para jugar con colores, texturas y formas de resaltar, con contraste en vivo
# → http://127.0.0.1:8899/docs/laboratorio.html
```

---

## 1 · Dónde está cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Un texto, un título, un precio (el contenido) | `index.html`, `servicios.html`, `como-trabajamos.html` |
| Cómo se ve una pieza (color, tamaño, espaciado) | `css/components.css` |
| La retícula, el hero, las columnas | `css/layout.css` |
| Los colores y las letras de todo el sitio | `css/variables.css` |
| Cómo se comporta en celular | `css/responsive.css` |

---

## 2 · Colores: primero el token, después la pieza

**Los colores del sitio viven en `css/variables.css`.** Hay tres familias de
acento, y cada una tiene su trabajo:

| Familia | Para qué | Texto sobre claro | Color puro | Texto sobre oscuro |
|---|---|---|---|---|
| **Oro** | Marca, precios, botones | `--oro-tx` `#8A6A0F` | `--oro` `#A8821F` | `--oro-lt` `#E8C766` |
| **Magenta** | Sistemas | `--magenta-tx` `#A81B5A` | `--magenta` `#D6247A` | `--magenta-lt` `#F472B6` |
| **Verde** | Estado | `--verde-tx` `#0A6B4C` | `--verde` `#0E9F6E` | `--verde-lt` `#34D399` |

**Receta: cambiar el oro por otro dorado en todo el sitio.** Una línea:

```css
/* css/variables.css */
--oro:    #B8912A;   /* el color puro: filetes, puntos, rellenos */
--oro-tx: #7E610D;   /* el que se lee sobre fondo claro */
--oro-lt: #F0D07A;   /* el que se lee sobre fondo oscuro */
```

Después, comprueba que se lee bien:

```bash
python3 docs/verificar-contraste.py
```

Si te dice que un par no llega, sube o baja el tono hasta que pase. **No cambies
solo el color puro y dejes los otros dos**: el puro casi nunca sirve para texto.

---

## 3 · Recetas de una pieza

### 3.1 · Resaltar un título (efecto marcador)

En el HTML, ponle un nombre nuevo:

```html
<h2 class="encabezado__titulo titulo--resaltado">¿Qué te está costando dinero?</h2>
```

En `css/components.css`, al final del archivo:

```css
.titulo--resaltado {
  box-shadow: inset 0 -0.55em 0 rgba(214, 36, 122, 0.30);   /* marcador magenta */
}
```

Cambia `214, 36, 122` por los valores de otro color (los tienes arriba) y
`0.30` por la intensidad: más bajo = más tenue.

### 3.2 · Cambiar el color de un texto suelto

```html
<p class="hero__entrada texto--verde">Diseñamos micro-sistemas…</p>
```

```css
.texto--verde { color: var(--verde-tx); }
```

Sirve para palabras dentro de un párrafo:

```html
<p>Diseñamos <span class="texto--magenta">micro-sistemas</span> a tu medida.</p>
```

### 3.3 · Cambiar el fondo de una sección

Las secciones del inicio llevan `seccion--papel` o `seccion--oscura`. Para una
sola:

```html
<section class="seccion seccion--papel seccion--arena" id="soluciones">
```

```css
.seccion--arena { background: #F3EFE4; }
```

Si el fondo es oscuro, la sección necesita además el bloque de tokens oscuros
para que el texto no quede ilegible. Cópialo de la regla `.seccion--oscura` que
está en `css/variables.css`.

### 3.4 · Poner una textura de fondo

```css
.seccion--arena {
  background-color: #F7F6F3;
  background-image: radial-gradient(rgba(17, 17, 17, 0.10) 1px, transparent 1px);
  background-size: 18px 18px;
}
```

En `docs/laboratorio.html` tienes seis texturas listas (puntos, cuadrícula,
papel con fibra, grano de taller, líneas de plano y trama de sello) con su CSS
para copiar.

### 3.5 · Cambiar el color de un botón

```css
.boton--solido { background: var(--magenta); color: #fff; }
```

Ojo: los botones sólidos llevan texto claro encima. Si eliges un color claro de
fondo, cambia también el color del texto.

### 3.6 · Cambiar un texto o un precio

Los textos están escritos directamente en el HTML: se busca la frase y se
cambia. **Los precios aparecen en cinco sitios** y hay que moverlos todos:

1. La línea de precios del hero (solo se ve en tablet y celular).
2. El índice lateral, en el pie del panel.
3. La lista de la etapa que corresponda.
4. La casilla equivalente del armador de paquete (`data-precio`).
5. La primera respuesta del FAQ, y el bloque `FAQPage` de los datos
   estructurados en el `<head>`.

---

## 4 · Antes de dar un cambio por bueno

```bash
python3 docs/verificar-contraste.py                  # ¿se lee bien la paleta?
bash docs/auditar.sh http://127.0.0.1:8899/index.html 1440 1000 prueba
node docs/movil.mjs http://127.0.0.1:8899/index.html 390 844
```

Las tres tienen que salir en verde: cero fallos de contraste, cero desbordes
horizontales, cero errores de consola y un solo `h1` por página.

---

## 5 · Cómo revisar el sitio tú mismo

1. **Prepara la copia:** `bash docs/revisar.sh` (te dice la dirección para abrir).
2. **Enciende el marcador:** botón **Marcar** o la tecla `M`.
3. **Para cambiar una palabra o una frase:** selecciónala con el ratón (o doble
   clic en una palabra) y haz clic. En **«Cómo debe quedar»** escribes el texto
   nuevo; al guardar, el cambio se aplica en la copia al instante. Así vas
   viendo la versión final mientras revisas.

   ```
   Antes:   Sin adaptaciones forzadas
   Después: Sin forzar nada        ← se ve aplicado, en verde con ✎
   ```

4. **Para solo comentar algo:** haz clic en un bloque sin seleccionar nada y
   escribe la nota. Color: **magenta** (cambio), **oro** (revisar), **verde**
   (está bien así) o **carbón** (duda).
5. **Al terminar:** en el panel, **Descargar revisión** (Markdown para leer) y
   **JSON para aplicar** (el archivo que lleva los cambios al sitio real).

### Pasar la revisión al sitio real

```bash
# 1 · Simular: dice qué haría, sin escribir nada
node docs/aplicar.mjs Revision-CAMENA.json

# 2 · Aplicar de verdad
node docs/aplicar.mjs Revision-CAMENA.json --escribir

# 3 · Comprobar que nada se rompió
python3 docs/verificar-contraste.py
bash docs/auditar.sh http://127.0.0.1:8899/index.html 1440 1000 despues
```

El aplicador es cuidadoso a propósito: **si el texto original aparece cero
veces o más de una, no toca nada** y lo apunta en `Revision-pendientes.md` para
revisarlo a mano. Las notas también van a ese archivo, ordenadas por página.

> Nada de esto se publica: todo lo de `docs/` queda fuera del despliegue. El
> sitio solo cambia cuando el aplicador corre con `--escribir` (o cuando yo
> edito el HTML directamente).
