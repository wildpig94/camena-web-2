# Traducir el sitio al inglés (instructivo para Claude Code)

Documento de traspaso. El dueño hará este trabajo con Claude Code; aquí está todo
lo que hace falta para que salga bien y **sin romper el formato**.

## El problema que hay que resolver

El dueño manda el enlace a personas que no leen español y usan el traductor del
navegador. El traductor **rompe las casillas y el formato**: reescribe nodos de
texto y estira o encoge cajas que estaban medidas, mete `<font>` y saltos, y
descuadra las tablas de precio, las rejillas y los botones.

La solución no es "que se aguante la traducción": es **una versión en inglés de
verdad**, con su propio `lang="en"`, que no necesite traductor.

## Dónde está el archivo

- Página principal: `index.html` (raíz del repo)
- Otras páginas: `servicios.html`, `como-trabajamos.html`,
  `aviso-de-privacidad.html`, `terminos.html`
- El producto publicado: `producto/control-de-autos.html` (tiene su propio CSS
  dentro del archivo; si se traduce, va aparte)

## Qué hacer

1. Crear la carpeta `en/` con una copia traducida de cada página:
   `en/index.html`, `en/servicios.html`, etc.
2. En cada copia: `<html lang="en">` y traducir **solo el texto visible**.
3. Ajustar las rutas relativas: desde `en/`, los enlaces pasan a `../css/…`,
   `../assets/…`, `../js/…`.
4. Poner el conmutador de idioma en la cabecera de **las dos** versiones: en la
   española un enlace a `en/…`, en la inglesa a `../…`.
5. Añadir `hreflang` en el `<head>` de ambas:
   ```html
   <link rel="alternate" hreflang="es" href="https://wildpig94.github.io/camena-web-2/">
   <link rel="alternate" hreflang="en" href="https://wildpig94.github.io/camena-web-2/en/">
   <link rel="alternate" hreflang="x-default" href="https://wildpig94.github.io/camena-web-2/">
   ```
6. En los datos estructurados (`application/ld+json`): traducir los **valores** de
   texto y poner `"inLanguage": "en"`. **No** cambiar los nombres de las
   propiedades ni la estructura.
7. Publicar: en `.github/workflows/publicar.yml`, añadir `en` a la línea que
   copia las páginas (`cp index.html … publicar/` → además `cp -r en publicar/`).
8. Correr `python3 docs/versionar.py` al final: sella la versión del CSS y del JS
   en las URLs para que el navegador no sirva archivos viejos.

## Lo que NO se toca nunca

- **Nombres de clase, `id`, anclas y atributos `data-*`.** Son el contrato con el
  CSS y con `js/interacciones.js`, `js/rotador.js` y `js/navegacion.js`. Si se
  traduce un `id`, se rompen los globos, el menú y las anclas del índice.
- **`href="#paquetes"` y demás anclas internas**: se quedan igual.
- **Rutas de imágenes, videos y fuentes**: solo cambia el prefijo `../`.
- **La estructura de las tablas de precio** (`table > thead > tr > th/td`): el
  texto se traduce, las etiquetas no se tocan.
- **Los `data-frases` del rotador**: son las frases que se escriben solas,
  separadas por `|`. Se traducen **dentro** del atributo, conservando los `|` y
  el número de frases (el titular del hero tiene 3; el bloque de negocios, 6).
- **El texto de `.visualmente-oculto`**: también se traduce, y tiene que seguir
  diciendo lo mismo que la versión animada.
- **El `?v=` de los CSS y JS**: lo pone `docs/versionar.py`, no se escribe a mano.

## La voz en inglés (no es traducción literal)

El español del sitio es directo, sin jerga de agencia y sin promesas infladas. El
inglés tiene que sonar igual, no como folleto corporativo:

- Frases cortas. Voz activa. «You» para el cliente.
- **Prohibido** en inglés lo mismo que en español: *solutions*, *seamless*,
  *cutting-edge*, *empower*, *transform your business*, *take it to the next
  level*, *one-stop shop*, *game-changer*, *unlock*.
- **Sin** signos de admiración y sin emojis.
- **Sin** clientes, cifras, premios ni testimonios inventados.
- No traducir «IA» como argumento de venta (la regla vale en los dos idiomas).

### Glosario de oficio (usar estos términos)

| Español | Inglés | Nota |
|---|---|---|
| negocio local | local business | el cliente es de pueblo, no una startup |
| mostrador | counter | es donde trabaja, no «point of sale» |
| fiado / fiar | store credit / to sell on credit | no es «layaway» |
| cuaderno | notebook | el de papel, el dolor del sitio |
| refaccionaria | auto parts store | |
| ferretería | hardware store | |
| hojalatería y pintura | body and paint shop | |
| taller | shop | no «workshop» |
| sistema a la medida | custom system | no «bespoke software» |
| cotizador | quoting tool | |
| expediente | file / record | |
| siniestro | claim | el de la aseguradora |
| se entrega y es tuyo | you own it outright | la ventaja clave |
| sin renta mensual | no monthly fee | |
| precio de partida | starting price | los precios son en pesos: **conservar MXN** |
| Apatzingán, Michoacán | Apatzingán, Michoacán | no traducir topónimos |
| «páginas web» | websites | |

## Cómo comprobar que no se rompió nada

Con el servidor local levantado (`python3 -m http.server 8899` desde la raíz):

```bash
# 1 · Que renderice sin desbordes ni fallos de contraste, en varios anchos
node docs/movil.mjs http://127.0.0.1:8899/en/index.html 1440 900
node docs/movil.mjs http://127.0.0.1:8899/en/index.html 390 844
node docs/movil.mjs http://127.0.0.1:8899/en/index.html 320 844

# 2 · Que las imágenes no se deformen y no haya cajas recortadas
node docs/revisar-medios.mjs http://127.0.0.1:8899 "en/index.html" 390

# 3 · Que la paleta siga cumpliendo contraste
python3 docs/verificar-contraste.py

# 4 · Que el titular del hero siga en el número de líneas correcto
node docs/medir-hero.mjs http://127.0.0.1:8899/en/index.html 1440 900
node docs/medir-hero.mjs http://127.0.0.1:8899/en/index.html 390 844

# 5 · Que no queden referencias rotas (el workflow lo comprueba igual en cada publicación)
```

Qué tiene que salir: `desbordeHorizontal: 0`, `totalFallosContraste: 0`,
`fueraDePantalla: []`, `textoPisado: []` y consola vacía.

## Trampas conocidas de este proyecto

1. **El inglés es más corto o más largo y eso mueve el diseño.** El titular del
   hero está medido: en español usa tres líneas. Si en inglés ocupa dos o cuatro,
   hay que revisar `docs/medir-hero.mjs`, no dejarlo pasar.
2. **La escalera tipográfica son 9 escalones.** No inventar tamaños nuevos para
   que «quepa» una palabra en inglés: se cambia la palabra.
3. **Las tablas de precio** tienen la columna del precio con `width: 1%` para que
   el nombre no pierda ancho. Si el precio en inglés lleva más texto
   («from $9,600 MXN»), revisar que no empuje al nombre a dos líneas de más.
4. **El signo `+` de las filas de precio se dibuja con CSS.** No es texto: no hay
   nada que traducir ahí.
5. **El rotador reserva alto** con la frase más larga. Si la frase más larga en
   inglés es mucho más larga que en español, el bloque crece: es esperado, pero
   hay que mirar que no se coma la pantalla.
6. **`lang="en"` no es opcional.** Sin eso, el navegador vuelve a ofrecer el
   traductor y el problema original regresa.
