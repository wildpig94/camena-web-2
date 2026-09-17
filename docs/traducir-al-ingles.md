# Traducir el sitio al inglés (instructivo para Claude Code)

Documento de traspaso **actualizado**. El dueño hará este trabajo con Claude
Code; aquí está todo lo que hace falta para que salga bien y **sin romper el
formato**.

## El problema que hay que resolver

El dueño manda el enlace a personas que no leen español y usan el traductor del
navegador. El traductor **rompe las casillas y el formato**: reescribe nodos de
texto, estira o encoge cajas que estaban medidas, y descuadra las tablas de
precio, las rejillas y los botones.

La solución no es "que se aguante la traducción": es **una versión en inglés de
verdad**, con su propio `lang="en"`, que no necesite traductor.

## Qué hay que traducir

- `index.html` — la página principal (**6 secciones**: hero, diagnóstico, precios,
  ejemplos, preguntas y contacto). Ojo: la sección del proceso ya no está aquí,
  vive completa en `como-trabajamos.html`.
- `servicios.html`, `como-trabajamos.html`, `aviso-de-privacidad.html`,
  `terminos.html`
- `404.html` — la página de error. Se traduce igual que las demás.
- **Ojo:** ya **no** hay páginas dentro de `producto/`. La de Control de Autos
  salió del repo (los sistemas se enseñan solo con capturas), así que no hay nada
  que traducir ahí.
- **`js/contacto.js`** — ver la sección «El texto que arman los scripts», abajo.
  Sin esto, la página en inglés tendrá mensajes en español.

## Qué hacer

1. Crear la carpeta `en/` con una copia traducida de cada página:
   `en/index.html`, `en/servicios.html`, etc.
2. En cada copia: `<html lang="en">` y traducir **solo el texto visible**.
3. Ajustar las rutas relativas: desde `en/`, los enlaces pasan a `../css/…`,
   `../assets/…`, `../js/…`.
4. Poner el conmutador de idioma en la cabecera de **las dos** versiones: en la
   española un enlace a `en/…`, en la inglesa a `../…`. El rótulo se escribe con
   dos letras (`ES` / `EN`) y con `hreflang` y `lang` correctos.
5. Añadir en el `<head>` de ambas:
   ```html
   <link rel="alternate" hreflang="es" href="https://wildpig94.github.io/camena-web-2/">
   <link rel="alternate" hreflang="en" href="https://wildpig94.github.io/camena-web-2/en/">
   <link rel="alternate" hreflang="x-default" href="https://wildpig94.github.io/camena-web-2/">
   ```
6. En los datos estructurados (`application/ld+json`): traducir los **valores** de
   texto y poner `"inLanguage": "en"`. **No** cambiar los nombres de las
   propiedades ni la estructura.
7. Publicar: en `.github/workflows/publicar.yml`, añadir la carpeta `en` al paso
   que copia las páginas (junto a `cp -r assets css js producto publicar/`).
8. Correr `python3 docs/versionar.py` al final: sella la versión del CSS y del JS
   en las URLs, para que el navegador no sirva archivos viejos.

## Lo que NO se toca nunca

- **Nombres de clase, `id`, anclas y atributos `data-*`.** Son el contrato con el
  CSS y con `js/navegacion.js`, `js/animaciones.js`, `js/interacciones.js`,
  `js/contacto.js`, `js/rotador.js` y `js/visor.js`. Si se traduce un `id`, se
  rompen los globos de detalle, el menú, el visor y las anclas del índice.
- **`href="#paquetes"` y demás anclas internas**: se quedan igual.
- **Rutas de imágenes, videos y fuentes**: solo cambia el prefijo `../`.
- **La estructura de las tablas de precio** (`table > thead > tr > th/td`): el
  texto se traduce, las etiquetas no se tocan.
- **El marcado del visor de capturas**: los enlaces `data-visor` y la capa
  `<div class="visor" id="visor" hidden>` van tal cual. Solo se traduce su
  `aria-label` y el texto del botón «Cerrar ✕».
- **El `?v=` de los CSS y JS**: lo pone `docs/versionar.py`, no se escribe a mano.

## El rotador: cuidado con los separadores

Hay dos bloques de texto que se escriben solos. Las frases viven en el atributo
`data-frases`, separadas por `|`:

- **Titular del hero** (`index.html`): 3 frases, sin separador interno. Modo
  tecleo.
- **Bloque de negocios** (dentro de la etapa de sistemas): 6 frases, cada una
  partida en dos por **`//`** — antes el problema, después la solución, que se
  pintan de distinto color — y con `data-modo="fundido"`.

**Al traducir hay que conservar el número de frases y los `//`.** El bloque de
negocios reserva su alto con la frase más larga: si en inglés las frases son
mucho más largas, el bloque crece (es esperado, pero hay que mirar que no se coma
la pantalla). En el modo fundido no hay tecleo, así que la longitud no afecta al
ritmo, solo al alto.

## El texto que arman los scripts

Esto es nuevo y es lo más fácil de olvidar: **`js/contacto.js` construye mensajes
en español** que el visitante ve o manda por WhatsApp:

- «Copiado» y «Copia manual» (al copiar el teléfono o el correo)
- «Anotamos tu caso: «…». Complétalo abajo cuando quieras.»
- «Tu navegador bloqueó WhatsApp. Anotamos tu caso abajo: …»
- «Tu mensaje está listo, pero el navegador bloqueó la ventana.»
- Y el texto del mensaje de WhatsApp: «Hola CAMENA, quiero contarles un
  proyecto.», «Me interesa: », «Todavía no sé qué necesito exactamente.»,
  «Presupuesto aproximado: », «Para cuándo: »

Como el script es **uno solo para los dos idiomas**, no se puede duplicar. La
forma limpia: que los textos salgan de atributos en el `<html>` de cada página, y
que el script los lea con respaldo al español.

```html
<html lang="en"
      data-msj-copiado="Copied"
      data-msj-copiado-manual="Copy manually"
      data-msj-anotamos="We noted your case: «"
      data-msj-anotamos-fin="». Finish it below whenever you want."
      data-msj-bloqueado="Your browser blocked WhatsApp. We noted your case below: "
      data-msj-listo="Your message is ready, but the browser blocked the window."
      data-msj-wa-saludo="Hi CAMENA, I want to tell you about a project."
      data-msj-wa-interesa="I'm interested in: "
      data-msj-wa-nose="I don't know exactly what I need yet."
      data-msj-wa-presupuesto="Approximate budget: "
      data-msj-wa-cuando="By when: ">
```

```js
var html = document.documentElement;
var msj = function (clave, respaldo) {
  return html.getAttribute("data-msj-" + clave) || respaldo;
};
// uso: aviso.textContent = msj("copiado", "Copiado");
```

Así la página en español no cambia nada y la inglesa queda completa. **Sin esto,
la versión en inglés se ve bien y habla en español en cuanto alguien copia el
teléfono o manda el formulario.**

## La voz en inglés (no es traducción literal)

El español del sitio es directo, sin jerga de agencia y sin promesas infladas. El
inglés tiene que sonar igual, no como folleto corporativo:

- Frases cortas. Voz activa. «You» para el cliente.
- **Prohibido** en inglés lo mismo que en español: *solutions*, *seamless*,
  *cutting-edge*, *empower*, *transform your business*, *take it to the next
  level*, *one-stop shop*, *game-changer*, *unlock*.
- **Sin** signos de admiración y sin emojis.
- **Sin** clientes, cifras, premios ni testimonios inventados.
- No usar «AI» como argumento de venta (la regla vale en los dos idiomas).

### Glosario de oficio (usar estos términos)

| Español | Inglés | Nota |
|---|---|---|
| negocio local | local business | el cliente es de pueblo, no una startup |
| mostrador | counter | es donde trabaja, no «point of sale» |
| fiado / fiar | store credit / to sell on credit | no es «layaway» |
| cuaderno | notebook | el de papel, el dolor del sitio |
| refaccionaria | auto parts store | |
| ferretería | hardware store | |
| pollería | chicken shop / rotisserie shop | |
| hojalatería y pintura | body and paint shop | |
| taller | shop | no «workshop» |
| sistema a la medida | custom system | no «bespoke software» |
| cotizador | quoting tool | |
| expediente | file / record | |
| siniestro | claim | el de la aseguradora |
| se entrega y es tuyo | you own it outright | la ventaja clave |
| sin renta mensual | no monthly fee | |
| precio de partida | starting price | los precios son en pesos: **conservar MXN** |
| días en piso | days in the shop | |
| Apatzingán, Michoacán | Apatzingán, Michoacán | no traducir topónimos |
| «páginas web» | websites | |
| «quítate el cuaderno de encima» | get the notebook off your back | conservar el tono, no el calco |

## Cómo comprobar que no se rompió nada

Con el servidor local levantado (`python3 -m http.server 8899` desde la raíz):

```bash
# 1 · Render sin desbordes ni fallos de contraste, en varios anchos
node docs/movil.mjs http://127.0.0.1:8899/en/index.html 1440 900
node docs/movil.mjs http://127.0.0.1:8899/en/index.html 390 844
node docs/movil.mjs http://127.0.0.1:8899/en/index.html 320 844

# 2 · Medios sin deformar y cajas sin recortes
node docs/revisar-medios.mjs http://127.0.0.1:8899 "en/index.html" 390

# 3 · La paleta contra WCAG AA
python3 docs/verificar-contraste.py

# 4 · El titular del hero: tamaño, renglones y si cabe en la primera pantalla
node docs/medir-hero.mjs http://127.0.0.1:8899/en/index.html 1440 900
node docs/medir-hero.mjs http://127.0.0.1:8899/en/index.html 390 844

# 5 · La escalera tipográfica: cuántos tamaños y colores distintos usa la página
node docs/medir-escala.mjs http://127.0.0.1:8899/en/index.html 1440
```

Qué tiene que salir: `desbordeHorizontal: 0`, `totalFallosContraste: 0`,
`fueraDePantalla: []`, `textoPisado: []`, consola vacía, y **10 tamaños de letra**
(la escalera no admite uno más).

Antes de dar el trabajo por terminado: revisar que el conmutador funcione en las
dos direcciones, que el `lang` sea correcto en cada página, y que las anclas del
menú sigan llegando a su sección.

## Trampas conocidas de este proyecto

1. **El inglés cambia de largo y eso mueve el diseño.** El titular del hero está
   medido: en español son dos renglones con 54 px en escritorio. Si en inglés
   ocupa tres o cuatro, hay que revisar con `docs/medir-hero.mjs`, no dejarlo
   pasar.
2. **La escalera tipográfica son nueve escalones.** No inventar tamaños nuevos
   para que «quepa» una palabra en inglés: se cambia la palabra.
3. **Las tablas de precio** tienen la columna del precio con `width: 1%` para que
   el nombre no pierda ancho. Si el precio en inglés lleva más texto («from
   $9,600 MXN»), revisar que no empuje al nombre a más renglones.
4. **El signo `+` de las filas de precio se dibuja con CSS.** No es texto: no hay
   nada que traducir ahí.
5. **Los tonos de las tarjetas de diagnóstico** (`caso-tarjeta--t1` … `--t7`) son
   ambientales: no llevan texto, no se traducen, no se cambian.
6. **`lang="en"` no es opcional.** Sin eso, el navegador vuelve a ofrecer el
   traductor y el problema original regresa.

## Lo que ya está construido y se puede reutilizar

Antes de inventar algo para la versión en inglés, revisar
**`docs/portafolio-funciones.md`**: están documentadas las ocho piezas
reutilizables (rotador, globo de detalle, tabla de precios, visor de capturas,
tarjetas con tono, capturas con pie, rótulos y el proceso de publicación), cada
una con dónde vive, cómo se usa y **la regla que no se puede romper**. Varias de
esas reglas nacieron de errores reales.
