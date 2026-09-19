# Autorizaciones de uso de trabajo de clientes

Registro interno. **No se publica** (todo `docs/` queda fuera del despliegue).

La regla es simple: sin autorización no hay pieza. Un trabajo de cliente solo
puede aparecer en el sitio si se puede contestar «sí» a las dos columnas.

| Pieza en el sitio | Autorización para publicar | Permiso para nombrar al cliente |
|---|---|---|
| Reel para clienta (`assets/video/reel-cliente.mp4`) | **Retirado el 18 de septiembre** a petición del dueño. Salió del sitio y del repositorio; el archivo quedó en `~/productos-camena/privado/video-clienta/` | No aplica |
| Promo de CAMENA (`assets/video/camena-promo.mp4`) | No aplica — es material propio | No aplica |
| Cotizador y expediente del taller | No aplica — son productos de CAMENA | No aplica |

## Qué cubre la autorización

Publicar el video en la sección de ejemplos del sitio, sin nombre del cliente,
sin logotipo y sin datos del negocio. La etiqueta visible es «Se muestra con el
visto bueno del cliente».

## Qué NO está cubierto

- **Nombrar al cliente** (nombre del consultorio o de la doctora) en el sitio,
  en redes o en propuestas.
- Usar el video en **anuncios pagados** (Meta, Google, TikTok), donde el alcance
  es distinto al de la página.
- Ceder el video a **terceros** como muestra de portafolio.

Para cualquiera de esos tres hay que pedir permiso aparte y anotarlo aquí.

## Cómo se retira una pieza

Si en algún momento se retira la autorización:

1. Quitar el bloque de la pieza en `index.html` (buscar `reel-cliente`).
2. Borrar `assets/video/reel-cliente.mp4` y su póster `.webp`.
3. Ajustar el conteo de piezas en el texto de la sección y en el `README.md`.
4. Confirmar que el JSON-LD y el pie no mencionen al cliente.

---

## Historial

- **Reel para clienta** — autorización confirmada por el dueño del estudio.
  Se publica sin nombre y con la etiqueta de visto bueno. Permiso para nombrar:
  pendiente de preguntar.

---

## Retiro del reel de la clienta (18 de septiembre)

A petición del dueño, el video salió del sitio. Se siguió el procedimiento que este
mismo documento tenía escrito:

1. Se quitó la pieza de `index.html` (la figura con el `<video>` y su pie de foto).
2. Se sacaron `assets/video/reel-cliente.mp4` y su póster `.webp` del repositorio, y
   **quedaron guardados fuera**, en `~/productos-camena/privado/video-clienta/`: no se
   borró nada del cliente, solo se dejó de publicar.
3. Se retiró el CSS que quedaba sin uso (`video-pieza`), y con la pieza fuera la
   tabla de esa banda pasó de 227 a 531 px de ancho: los cuatro renglones de
   producción ya llevan su «Incluye», que antes no cabía.

**Lo que hay que saber si algún día se vuelve a publicar:** el repositorio es público,
así que **el video sigue en la historia de git**; volver a ponerlo es copiar el
archivo de la carpeta privada al sitio. Y si se retira otra pieza de cliente, el
camino es el mismo: quitarla del HTML, sacarla del repositorio y dejarla archivada
fuera.
