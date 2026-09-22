# Instrucciones para trabajar en este repositorio

Este archivo lo lee solo cualquier agente que abra una sesión aquí. Es corto a
propósito: el detalle está en `README.md` (el mapa del proyecto) y en los
documentos que se nombran abajo.

## Los textos: primero el editor

**Antes de escribir o cambiar una sola palabra, lee `docs/editor.md`.** Ahí está
el criterio de redacción —las seis familias que rechinan, las frases aprobadas,
el proceso y la bitácora del entrenamiento—. Aplica a **todo texto visible de
cualquier página, en español**, incluidos los mensajes que arma JavaScript, el
pie, los datos estructurados y las publicaciones de redes. Las páginas en inglés
se rigen por `docs/traducir-al-ingles.md`.

Lo que nunca se escribe aquí:

- **No se menciona la inteligencia artificial** en ninguna forma. El sitio vende
  problemas de negocio resueltos, nunca la tecnología con que se resuelven.
- **No se menciona cómo se construye el sitio** ni el proceso interno.
- **Primera persona del singular.** Nunca plural de equipo ni «nosotros».
- **«Sin costo», nunca «gratis».**
- **Nada inventado**: ni testimonios, ni cifras, ni plazos, ni credenciales. Si
  falta un dato, se deja el hueco y se anota en `docs/pendientes.md`.
- **Los precios viven en el HTML**, nunca los calcula JavaScript.

## Antes de publicar

```bash
bash docs/preparar-publicacion.sh /tmp/camena-publicar   # la puerta: si falla, no se publica
python3 docs/verificar-contraste.py                      # contraste WCAG AA
bash docs/auditar.sh <url> 1440                          # desborde, contraste, errores, faltantes
bash docs/auditar.sh <url> 390                           # y en teléfono
```

Publicar es subir a `main`: el flujo de GitHub publica en Cloudflare Pages. Si
toca el hero, una ficha de precio o el alto de una página, vuelve a medir
(`docs/medir-hero.mjs`, `docs/medir-fichas.mjs`) antes de decir que quedó.

**Página nueva:** hay cinco listas que hay que actualizar o la página no se
publica, no se le quitan las extensiones, no se le pone la versión, no se le
cambia el dominio o no entra a la revisión con el lápiz: `docs/preparar-publicacion.sh`,
`docs/quitar-extensiones.sh`, `docs/cambiar-dominio.sh`, `docs/versionar.py` y
`docs/revisar.sh`.

## Lo demás

- `README.md` — el mapa: qué es el proyecto, qué se vende, cómo está hecho el
  sitio, el sistema de diseño y la tabla de herramientas.
- `docs/pendientes.md` — lo que espera decisión del dueño.
- La voz del sitio está en `README.md` (estructura de la página) y el criterio
  frase por frase en `docs/editor.md`.
