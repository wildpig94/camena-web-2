# Valoración: Control de Autos para el taller

Documento interno. No se publica. Es la evaluación honesta del sistema a hoy
(18 de septiembre de 2026), con su historia, lo que se le adaptó y lo que le falta
para poder entregarse y venderse.

---

## 1 · Veredicto en una frase

**Es una herramienta real, terminada y probada en su primer módulo —el registro de
entrada, los días en piso, las salidas y el cotizador—, y todavía no es el sistema
completo que el taller necesita.** Funciona, guarda, cotiza y aguanta sin internet.
Lo que falta no es pulido: son siete módulos de los nueve problemas que el taller
contó, y varios de ellos son los que más dinero mueven.

En corto: **se puede poner a trabajar hoy y sirve; no se puede vender todavía como
«el sistema del taller», porque le falta la mitad de lo que duele.**

---

## 2 · Cómo llegó

**Origen: trece notas de voz.** La encargada del taller contestó diez preguntas en
≈4.7 minutos de audio, transcritas en esta máquina con `faster-whisper`, sin subir
nada a ningún servicio. De ahí salieron **nueve problemas** documentados con sus
palabras (`~/productos-camena/privado/investigacion-taller.md`), ordenados por lo que cuestan.

**El primero que se construyó** fue el que arrastraba a los demás: *no existe
registro de entrada*. El expediente del carro vivía en el papel que trae la
aseguradora y en el teléfono de una persona. De ese problema cuelgan los otros
ocho.

**Cómo era al llegar** (15 de septiembre):

- Un **archivo HTML suelto** que se abría desde un enlace. Sin instalar nada y sin
  internet, pero con los datos viviendo en el navegador de un solo aparato.
- Registraba: descripción, color, placas, aseguradora, folio, notas y fecha.
- Contaba los días en piso, marcaba la salida, movía al historial y permitía
  reingresar.
- Tenía catálogo editable de aseguradoras y respaldo en un archivo JSON.
- **Pedía las fuentes a Google** y traía el favicon del estudio: no era
  autocontenido.
- **No cotizaba nada**: el precio era una persona.

**Su recorrido en el repositorio**, para quien lo busque en la historia:

| Fecha | Qué pasó |
|---|---|
| 15 sep | Entra al repositorio como producto aparte, con sus propias fuentes (`38d43a6`) |
| 15 sep | Se le quita el nombre y la marca: es la herramienta del taller, no un anuncio (`ce84232`) |
| 16 sep | **Sale del repositorio**: estaba publicado y el repositorio es público, así que el sistema completo era descargable (`a1ca8a4`). Se muda a `~/productos-camena/` y el sitio lo sigue enseñando con capturas |
| 18 sep | Vuelve a publicarse, ahora en Cloudflare Pages, y se cierra el mismo día a petición del dueño, con Zero Trust ya activado para ponerle puerta |

---

## 3 · Todo lo que se le adaptó

### Del lado del taller (lo que se ve)

1. **Cotizador por aseguradora.** El taller dijo el dato que faltaba: el precio a
   las aseguradoras es un **factor del 175% sobre el costo de la refacción**, y
   **cada aseguradora trae el suyo**. En el alta del carro se agregan las piezas
   con su costo y el precio aparece solo. El total se ve en la tarjeta del carro.
2. **Cotización lista para WhatsApp.** Un botón arma el texto completo (taller,
   carro, placas, folio, aseguradora, piezas y total). Si el portapapeles no está
   —sin https no existe—, el texto se abre **ya seleccionado** para copiarlo a
   mano; antes eso terminaba en un aviso inútil.
3. **Factores editables.** Cada aseguradora tiene su porcentaje, y se cambia desde
   la propia app; el precio lo sigue al instante (comprobado: 175% → 200% cambia
   $2,625 a $3,000).
4. **Particular con regla propia.** Un carro sin aseguradora no lleva factor: dice
   «el precio lo define el dueño», que es lo que el taller hace hoy.
5. **El nombre del taller dentro.** El encabezado y la cotización dicen **Taller
   comercial del taller** (que no se escribe en este repositorio); su razón social
   ante el SAT queda guardada para recibos y facturas. **Hacia afuera no se nombra a nadie**: el
   sitio sigue diciendo «un taller de hojalatería y pintura».
6. **Instrucciones dentro del programa**, desplegables, incluyendo lo nuevo: las
   piezas, la cotización y cómo instalarlo en Android y en iPhone.

### Del lado técnico (lo que sostiene lo de arriba)

7. **Es un programa instalable, no un archivo suelto.** Manifiesto, iconos propios
   (los tres PNG dibujados con un SVG capturado con Chrome) y un service worker:
   **abre sin internet** y sigue trabajando. Comprobado con la red cortada: abre,
   carga sus fuentes y deja capturar un carro.
8. **Almacenamiento permanente** (`navigator.storage.persist()`): el navegador ya
   no puede tirar los datos por falta de espacio.
9. **Aviso de respaldo en el pie** —«Último respaldo: hace 9 días»— que se pone en
   ámbar a los siete días. Es la única red de seguridad mientras los datos vivan en
   el aparato.
10. **Carpeta autocontenida**: fuentes, iconos y manifiesto viven dentro. Antes se
    pedían a la carpeta de arriba, y esa fue exactamente la razón por la que la
    copia archivada quedó sin tipografía.
11. **Los datos viejos siguen abriendo.** Las aseguradoras se guardaban como texto
    y los carros no tenían piezas; al leerlos se convierten y nadie pierde su
    trabajo. Comprobado con datos de la versión anterior.
12. **Cero peticiones externas.** Se le quitó el `@import` de Google Fonts: el
    programa no le habla a ningún tercero, igual que el sitio del estudio.
13. **Sin marca del estudio.** El favicon dejó de ser el de CAMENA: el icono de la
    pestaña es el de la app. Es la herramienta de un cliente, no un anuncio.
14. **El service worker solo guarda respuestas buenas.** Con una puerta por delante
    (Access), una sesión vencida devuelve la pantalla de entrar; guardarla la
    habría dejado pegada para siempre.

### Herramientas para poder repetirlo y entregarlo

15. **`docs/probar-producto.mjs`** — la usa como una persona: registra un carro,
    captura piezas, comprueba el precio con el factor, cambia el factor, verifica
    la migración y la persistencia tras recargar. Sale en verde en 1440, 1024 y 390.
16. **`docs/probar-instalable.mjs`** — le pregunta al navegador, no supone:
    manifiesto sin errores, Chrome sin objeciones de instalación, service worker
    activo, y con la red cortada abre y deja capturar.
17. **`docs/publicar-cloudflare.sh`** — prueba, publica y verifica; y **frena si le
    pasan la plantilla en vez de la app de un taller real**.
18. **`docs/configurar-puerta.py`** — pone Cloudflare Access (equipo, política
    reutilizable con los correos autorizados, aplicación del dominio) y **verifica
    desde fuera** que una petición sin sesión acabe en la pantalla de entrar.
19. **La memoria de refacciones** con código, marca, proveedor, costo con IVA,
    autocompletado, buscador propio y botones de búsqueda (MercadoLibre y Google)
    con la consulta ya escrita. Nació de lo que el taller contestó: busca en
    MercadoLibre, en proveedores taiwaneses y en las plataformas de las
    aseguradoras, pero **no tiene los diagramas** de las piezas.
20. **La versión base para otro taller** (`~/productos-camena/plantillas/control-de-autos-base/`):
    la misma app sin el nombre de nadie, con las tres cosas que se cambian marcadas
    al principio del archivo y un `LEEME.md`. Probada como app.

---

## 4 · Qué falta para que funcione «correctamente»

En orden de lo que más duele, con lo que necesita cada uno:

| # | Falta | Qué necesita para hacerse | Tamaño |
|---|---|---|---|
| 1 | **El cliente**: hoy el carro no tiene dueño con teléfono | Un campo de cliente en el alta (nombre y teléfono), y que se pueda buscar por él | Chico |
| 2 | **Fotos del siniestro** dentro del expediente | Guardar imágenes en el aparato (IndexedDB) + cámara del teléfono + borrar/ordenar | Mediano |
| 3 | **Cobranza**: facturado, pagado y pendiente por siniestro | Campos de factura, pago y saldo por carro + una vista de «qué falta cobrar» | Mediano |
| 4 | **Avisos al cliente** (llegó, ya está listo) | Plantillas de mensaje y el enlace a WhatsApp con el texto armado; automático de verdad solo si hay servidor | Mediano |
| 5 | **Respaldo que no dependa de la memoria** | Recordatorio más insistente y, si el taller quiere, respaldo cifrado a su propia nube | Chico |
| 6 | **Pendientes tipo pizarrón** | Una lista rápida de material detenido, con fecha y quién lo pidió | Mediano |
| 7 | **Más de una persona a la vez** | Deja de ser un archivo local: necesita servidor y cuentas. Es el cambio más grande de todos | Grande |
| 8 | ~~Catálogo de refacciones con costo~~ **Hecho en parte (18 sep):** la memoria guarda cada pieza con código, marca, proveedor y costo, con autocompletado y buscador, y botones de búsqueda con la consulta escrita. **Falta** el catálogo de refacciones *ajeno* (imposible: son datos con derechos) y **guardar los diagramas por modelo** e indexarlos | Los diagramas, con muestras reales | Mediano |
| 9 | **Precio de particular** | Un campo de precio manual por carro cuando no hay aseguradora | Chico |

**Lo que no es un pendiente sino una condición:** el respaldo. Mientras los datos
vivan en un solo teléfono, el respaldo manual es lo único que impide perderlo todo.
Ese es el riesgo real de esta versión, y hay que decirlo así al taller.

---

## 5 · Fortalezas y riesgos, sin adornos

**Fortalezas**

- Hace **una cosa completa** y la hace bien: el registro y el tiempo en piso.
- **Funciona sin internet** y sin depender de ningún proveedor.
- El **cotizador** resuelve el problema que más frena: el precio deja de depender
  de una persona.
- Está **probado con herramientas propias** que se pueden volver a correr; no es
  «se ve que funciona».
- **Se puede clonar para otro taller** en una tarde.

**Riesgos**

- **Los datos viven en un aparato.** Sin respaldo, un teléfono perdido es el
  historial perdido.
- **Lo usa una sola persona.** Si esa persona no está, nadie más ve el estado.
- **No hay fotos ni cobranza**: los dos pedazos donde el taller sigue en papel y en
  Excel.
- **Nada sale del aparato**: lo que hoy se avisa por WhatsApp se sigue avisando a
  mano.
- **No se ha probado en un teléfono real.** Todas las comprobaciones son con Chrome
  automatizado a 390 px. La prueba en el aparato de la encargada es la que falta y
  es indispensable antes de decir que está entregado.

---

## 6 · Precio y encuadre, si se va a vender

El sistema **se entrega y es del taller**: no se renta ni se paga por mes. El
trabajo se cuenta por entregas, como las demás piezas del estudio.

Lo que conviene decir —y lo que no—:

- **Sí:** «un sistema que registra tus carros, te dice cuántos días llevan y cotiza
  para la aseguradora con su porcentaje».
- **Sí:** «se instala en tu teléfono, funciona sin internet y los datos se quedan
  contigo».
- **No:** «ahorra X% de tiempo» o «recupera N fiados». No hay una sola medición que
  lo respalde y el sitio tiene prohibido inventarlas.
- **No:** presentarlo como sistema completo. Es el primer módulo, y el taller lo
  sabe mejor que nadie.

---

## 7 · Lo que sigue, en orden

1. **Poner la puerta** (Cloudflare Access) y volver a publicar la app: falta un
   token de API con permisos de Access —el de wrangler no los tiene— o hacer la
   política desde el panel. Está todo listo en `docs/configurar-puerta.py`.
2. **Probarla en el teléfono de la encargada** (instalar, modo avión, capturar un
   carro). Es la prueba que no se puede hacer desde aquí.
3. **El cliente con teléfono** (módulo 1 de la lista de faltantes): es chico y
   vuelve útil todo lo demás, porque sin a quién avisarle, la mitad del valor se
   queda a medias.
4. **Fotos y cobranza**, en ese orden.
5. **Publicar el sistema en `taller.camena.mx`** cuando el dominio esté comprado.
