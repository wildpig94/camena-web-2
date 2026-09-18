# Publicar la app del taller en Cloudflare, con puerta

Por qué Cloudflare y no la página de GitHub: aquí la app tiene https —que es lo que
el teléfono exige para instalarla— y además se le puede poner una **puerta** para
que solo entre quien se autorice. En la página de GitHub quedaría descargable para
cualquiera que pase por el repositorio público, que es justo lo que se corrigió el
17 de septiembre.

Documento interno. No se publica.

---

## Antes de empezar

- Una cuenta de Cloudflare (gratis) para el estudio.
- La app probada: `docs/publicar-cloudflare.sh --solo-probar` tiene que salir en
  verde. Ese paso registra un auto, captura piezas, comprueba el precio con el
  factor y verifica que **sin internet abra igual**.
- Decidir el nombre del proyecto: se usará en la dirección
  (`https://<proyecto>.pages.dev`). Por ejemplo `control-autos-maranatha`.

---

## 1 · Subir la app (dos formas, la que te acomode)

**Desde el panel, sin terminal.** En el panel de Cloudflare: **Workers & Pages →
Create application → Get started → Drag and drop your files**. Se le pone nombre al
proyecto y se arrastran **los archivos de adentro** de la carpeta
`~/productos-camena/control-de-autos/` (no la carpeta). Queda servida en
`https://<proyecto>.pages.dev/`.

**Desde la terminal, y repetible.** Es la que conviene cuando hay que actualizar:

```bash
npx wrangler login                      # una sola vez, abre el navegador
npx wrangler pages project create control-autos-maranatha --production-branch=main
npx wrangler pages deploy ~/productos-camena/control-de-autos --project-name=control-autos-maranatha
```

El script `docs/publicar-cloudflare.sh` hace todo esto por ti, con las pruebas
antes y la comprobación después.

La app queda en la **raíz** del sitio a propósito: así `start_url`, el alcance del
service worker y las rutas de sus fuentes funcionan tal cual, sin tocar una línea.

---

## 2 · Poner la puerta (Cloudflare Access)

Sin esto, la dirección es pública: cualquiera que la tenga puede abrir y descargar
el sistema completo.

1. Panel de **Cloudflare Zero Trust** → **Access → Applications → Add an
   application → Self-hosted**.
2. **Application domain**: `<proyecto>.pages.dev` (el dominio exacto que te dio
   Cloudflare; si algún día se conecta un dominio propio, hay que proteger
   **también** ese, o queda una puerta abierta por el otro lado).
3. **Policy**: `Allow`, con la lista de correos que pueden entrar —el tuyo y el de
   la encargada—.
4. **Login method**: **One-time PIN** (un código que llega al correo). No hace
   falta que ella tenga cuenta en ningún lado.
5. Guardar y **probar en una ventana privada**: debe pedir el correo antes de
   mostrar la app, y dejar entrar con un correo de la lista.

---

## 3 · Instalarla en el teléfono de la encargada (Android)

1. Abrir la dirección en Chrome, entrar con su correo y el código.
2. Tocar **«⤓ Instalar en este aparato»** —el botón aparece en el pie de la app— o
   el menú ⋮ → **Instalar aplicación**.
3. Le queda el icono en la pantalla de inicio y abre como cualquier app, **sin
   internet**.

**Cuando la sesión de Access venza** (duran entre 24 horas y un mes, se configura
en la política): la app **sigue abriendo y funcionando** con lo que tiene
guardado, porque el service worker sirve la copia local. Lo único que necesita
volver a entrar es la **actualización**: al abrirla con internet y volver a
poner su correo, recibe la versión nueva.

---

## 4 · Actualizar la app más adelante

```bash
bash docs/publicar-cloudflare.sh            # prueba, publica y comprueba
```

La encargada recibe la versión nueva la próxima vez que abra la app **con
internet** (el service worker pide la app a la red primero y usa lo guardado solo
cuando no hay). Si el cambio toca fuentes, iconos o manifiesto, hay que **subir el
número de versión** en `sw.js`: ahí está escrito por qué.

---

## 5 · Comprobar que quedó bien, ya publicado

```bash
node docs/probar-instalable.mjs https://<proyecto>.pages.dev/
node docs/probar-producto.mjs   https://<proyecto>.pages.dev/ 390 844
```

Las dos pruebas aceptan cualquier dirección, así que sirven igual contra lo
publicado. Si la puerta está puesta, la prueba **no pasa** hasta que le des sesión:
eso es la señal de que la puerta funciona.

Y lo que hay que verificar a mano, en una ventana privada:

- La dirección **pide el correo** antes de mostrar nada.
- Con un correo que no está en la lista, **no deja entrar**.
- En el teléfono, el icono abre la app **en su propia ventana**, sin barra de
  direcciones.
- En modo avión, la app **abre y deja capturar** un auto.

---

## Lo que no se hace

- **No subir la carpeta de la app al repositorio del sitio.** El candado del
  despliegue existe para eso: si un archivo de producto terminado entra a una
  carpeta que sí se copia, la publicación falla a propósito (ver el README).
- **No publicar sin Access** si el sistema no debe poder descargarse.
- **No publicar la versión base** (`plantillas/control-de-autos-base/`) con el
  nombre de otro taller, ni al revés: cada taller con su proyecto y su puerta.

---

## Cómo cerrarla (sin Access, ahora mismo)

Si en algún momento hay que dejar de servir la app —porque se publicó sin puerta,
porque hay que corregir algo, o porque se va a mudar de dominio—, esto la cierra
en un minuto y deja constancia en la propia dirección:

```bash
npx wrangler pages deploy ~/productos-camena/cerrado --project-name=control-autos-maranatha --commit-dirty=true
```

`~/productos-camena/cerrado/` no es una página en blanco: trae el aviso de que el
sistema es privado, **un `sw.js` que se desinstala solo y borra el caché** —para
que un aparato que ya lo tenía instalado se limpie solo—, un manifiesto neutro y
copias en las rutas que usaba la app (`control-de-autos.html`, `sw.js`,
`manifest.webmanifest`).

**Por qué hay que reemplazar las rutas, y no basta con subir otra página.**
Cloudflare guarda los archivos de cada despliegue en su caché de borde, y al
publicar encima **los archivos que desaparecen siguen respondiendo** hasta que
esa copia caduca: comprobado, `sw.js` seguía sirviendo el de la app 47 minutos
después. Si sólo se sube un `index.html` nuevo, el sistema sigue descargable por
sus rutas viejas. Con las rutas reemplazadas, cada una responde al archivo de
cierre.

Y para que no quede nada en el almacén del proyecto:

```bash
# Lista los despliegues y borra los de la app (los que no sean de cierre)
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CUENTA/pages/projects/control-autos-maranatha/deployments" 
curl -X DELETE -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CUENTA/pages/projects/control-autos-maranatha/deployments/$ID"
```

Lo que puede quedar unos días es lo que estaba en caché y **no es el sistema**:
los dos archivos de fuentes y los iconos. Nada de lógica, ni un dato, ni el
nombre del taller.
