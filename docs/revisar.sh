#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# docs/revisar.sh — prepara la copia local para revisar con marcador
#
#   bash docs/revisar.sh
#
# Qué hace:
#   1 · Copia el sitio a docs/revision/sitio/ (carpeta ignorada por git).
#   2 · Inyecta el marcador (revisar.css + revisar.js) SOLO en esa copia.
#      El sitio real y el publicado no se tocan: docs/ no se publica.
#   3 · Levanta el servidor local si no está corriendo y muestra la URL.
#
# Para volver a empezar de cero:  bash docs/revisar.sh --limpio
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DESTINO="$RAIZ/docs/revision/sitio"
PUERTO="${PUERTO:-8899}"
PAGINAS=(index.html servicios.html como-trabajamos.html)

if [[ "${1:-}" == "--limpio" ]]; then
  rm -rf "$DESTINO"
  echo "· copia anterior borrada"
fi

mkdir -p "$DESTINO"
cp -r "$RAIZ"/css "$RAIZ"/js "$RAIZ"/assets "$DESTINO"/ 2>/dev/null
cp "$RAIZ"/robots.txt "$RAIZ"/sitemap.xml "$RAIZ"/site.webmanifest "$DESTINO"/ 2>/dev/null
cp "$RAIZ"/docs/revision/revisar.css "$RAIZ"/docs/revision/revisar.js "$DESTINO"/

python3 - "$RAIZ" "$DESTINO" "${PAGINAS[@]}" <<'PY'
import sys, re, os
raiz, destino = sys.argv[1], sys.argv[2]
paginas = sys.argv[3:]

for pagina in paginas:
    origen = os.path.join(raiz, pagina)
    if not os.path.exists(origen):
        print(f"  ✗ no existe {pagina}")
        continue
    html = open(origen, encoding="utf-8").read()

    # El marcador necesita saber en qué página está para guardar sus marcas
    html = html.replace("<html lang=\"es-MX\">", f'<html lang="es-MX" data-rv-pagina="{pagina}">', 1)

    # Inyección antes de cerrar el head; el resto del HTML queda intacto
    inyeccion = (
        '<!-- Marcador de revisión: solo vive en esta copia local -->\n'
        '<link rel="stylesheet" href="revisar.css">\n'
        '<script src="revisar.js" defer></script>\n'
    )
    if "revisar.js" not in html:
        html = html.replace("</head>", inyeccion + "</head>", 1)

    open(os.path.join(destino, pagina), "w", encoding="utf-8").write(html)
    print(f"  ✓ {pagina}")
PY

# Servidor local
if curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PUERTO/index.html"; then
  echo "· el servidor ya estaba corriendo en el puerto $PUERTO"
else
  (cd "$RAIZ" && nohup python3 -m http.server "$PUERTO" --bind 127.0.0.1 >/tmp/camena-server.log 2>&1 &)
  sleep 1.5
  echo "· servidor levantado en el puerto $PUERTO"
fi

cat <<FIN

────────────────────────────────────────────────────────────
 Listo. Abre esta dirección en el navegador:

   http://127.0.0.1:$PUERTO/docs/revision/sitio/index.html

 Cómo se usa:
   · Pulsa «Marcar» (o la tecla M) y pasa el ratón por la página.
   · Haz clic en lo que quieras cambiar y escribe la nota.
   · Elige color: oro, magenta, verde o carbón.
   · «Descargar Marcas.md» guarda la lista para mandarla.
   · Las marcas se quedan guardadas en el navegador por página.

 Nada de esto se publica: docs/ no entra en el despliegue.
────────────────────────────────────────────────────────────
FIN
