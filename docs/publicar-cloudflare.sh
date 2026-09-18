#!/usr/bin/env bash
#
# docs/publicar-cloudflare.sh — Publicar la app del taller en Cloudflare Pages.
#
# Por qué existe: publicar a mano es fácil de hacer mal —sin probar, sin puerta,
# con la carpeta equivocada—. Esto hace las tres cosas en orden: comprueba que la
# app esté sana, la publica, y verifica que la dirección responde.
#
# Uso:
#   bash docs/publicar-cloudflare.sh --solo-probar     # pruebas, sin publicar
#   bash docs/publicar-cloudflare.sh                   # pruebas, publicar y comprobar
#
# Variables:
#   APP       carpeta de la app (por defecto ~/productos-camena/control-de-autos)
#   PROYECTO  nombre del proyecto en Cloudflare (por defecto control-autos-maranatha)
set -euo pipefail

APP="${APP:-$HOME/productos-camena/control-de-autos}"
PROYECTO="${PROYECTO:-control-autos-maranatha}"
PUERTO="${PUERTO:-8901}"
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

solo_probar=0
[ "${1:-}" = "--solo-probar" ] && solo_probar=1

echo "── 1 · ¿Está completa la carpeta? ─────────────────────────────"
faltan=""
for f in control-de-autos.html manifest.webmanifest sw.js icon-192.png icon-512.png icon-maskable-512.png assets/fonts/oswald-latin.woff2 assets/fonts/ibm-plex-sans-latin.woff2; do
  [ -f "$APP/$f" ] || faltan="$faltan $f"
done
if [ -n "$faltan" ]; then
  echo "✗ Faltan archivos en $APP:$faltan"
  echo "  Sin ellos la app no se instala o no abre sin internet."
  exit 1
fi
echo "  ✓ La carpeta se basta a sí misma ($(find "$APP" -type f | wc -l) archivos)."

echo
echo "── 2 · ¿Lleva el nombre de un taller de verdad? ───────────────"
nombre="$(grep -o "TALLER = { nombre: '[^']*'" "$APP/control-de-autos.html" | sed "s/.*'\(.*\)'/\1/")"
echo "  Taller en el encabezado: «$nombre»"
case "$nombre" in
  "Nombre del taller"|"")
    echo "  ✗ Esta carpeta es la versión base, sin nombre. Ponle el del taller real"
    echo "    antes de publicarla, o estarás sirviendo una plantilla."
    exit 1
    ;;
esac

echo
echo "── 3 · Las pruebas, sirviendo la app como se sirve en internet ─"
( cd "$(dirname "$APP")" && python3 -m http.server "$PUERTO" --bind 127.0.0.1 >/dev/null 2>&1 & echo $! >/tmp/publicar-servidor.pid )
sleep 2
URL_LOCAL="http://127.0.0.1:$PUERTO/$(basename "$APP")/control-de-autos.html"
trap 'kill "$(cat /tmp/publicar-servidor.pid)" 2>/dev/null || true; rm -f /tmp/publicar-servidor.pid' EXIT

node "$AQUI/docs/probar-producto.mjs" "$URL_LOCAL" 390 844 >/tmp/publicar-producto.json
python3 - "$nombre" <<'PY'
import json, sys
d = json.load(open('/tmp/publicar-producto.json'))
c, f = d.get('cotizador', {}), d.get('factorEditable', {})
fallos = []
if c.get('piezasGuardadas') != 2: fallos.append('no guardó las piezas')
if not str(c.get('totalEnElFormulario', '')).endswith('$2,625'): fallos.append('el total con 175% no cuadra')
if f.get('totalCon200') != '$3,000': fallos.append('el factor editable no recalcula')
if d.get('desborde') != 0: fallos.append('desborda a lo ancho')
if d.get('externos'): fallos.append('pide algo a un tercero')
if d.get('consola'): fallos.append('hay errores en la consola')
print(f"  Cotizador: {c.get('preciosPorPieza')} → {c.get('totalEnElFormulario')}")
print(f"  Factor editable: {f.get('antes')}% → {f.get('guardado', {}).get('factor')}% = {f.get('totalCon200')}")
if fallos:
    print("  ✗ " + "; ".join(fallos)); sys.exit(1)
print("  ✓ La app funciona: sin desbordes, sin peticiones externas, consola limpia.")
PY

node "$AQUI/docs/probar-instalable.mjs" "$URL_LOCAL" | tail -4

if [ "$solo_probar" = "1" ]; then
  echo
  echo "  (Solo pruebas: no se publicó nada.)"
  exit 0
fi

echo
echo "── 4 · Publicar en Cloudflare ─────────────────────────────────"
if ! command -v npx >/dev/null 2>&1; then
  echo "✗ No hay npx en esta máquina. Publica desde el panel de Cloudflare:"
  echo "  Workers & Pages → Create application → Drag and drop your files"
  echo "  (arrastra los archivos de adentro de $APP)"
  exit 1
fi
if ! npx --yes wrangler whoami >/dev/null 2>&1; then
  echo "✗ Wrangler no tiene sesión. Corre primero:  npx wrangler login"
  echo "  (o exporta CLOUDFLARE_API_TOKEN si vas a publicar sin navegador)"
  exit 1
fi
npx --yes wrangler pages project create "$PROYECTO" --production-branch=main 2>/dev/null || true
npx --yes wrangler pages deploy "$APP" --project-name="$PROYECTO" --commit-dirty=true

echo
echo "── 5 · ¿Responde la dirección publicada? ──────────────────────"
PUBLICADA="https://$PROYECTO.pages.dev/"
sleep 5
codigo="$(curl -s -o /dev/null -w '%{http_code}' "$PUBLICADA")"
echo "  $PUBLICADA → $codigo"
case "$codigo" in
  200) echo "  ✓ Responde. Si le pusiste Access, en una ventana privada debe pedir el correo." ;;
  302|403) echo "  ✓ Responde con la puerta puesta (Access). Así debe verse desde fuera." ;;
  *) echo "  ✗ Respondió $codigo: revisa el despliegue en el panel de Cloudflare." ;;
esac
echo
echo "Falta lo que no se puede automatizar: la Access policy (ver docs/publicar-en-cloudflare.md)"
echo "y probarla en el teléfono: instalar, modo avión, capturar un auto."
