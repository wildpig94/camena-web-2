#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# docs/quitar-extensiones.sh — Deja las direcciones del sitio sin «.html».
#
#   bash docs/quitar-extensiones.sh            → muestra qué cambiaría
#   bash docs/quitar-extensiones.sh --aplicar  → lo cambia
#
# Por qué existe: Cloudflare Pages sirve las páginas sin la extensión
# (/servicios) y redirige la versión con extensión (/servicios.html) hacia
# ella. Si los enlaces, el canonical y el sitemap siguieran diciendo .html,
# el buscador recibiría una redirección donde esperaba la página: Search
# Console lo reporta como «página con redirección» y la vista previa al
# compartir por WhatsApp trabaja de más. Una sola forma de escribir cada
# dirección, y es la que el hospedaje sirve de verdad.
#
# El archivo 404.html se queda como está: su nombre es su dirección.
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
APLICAR="${1:-}"

# Archivos que se publican. Si aparece una página nueva, se agrega aquí.
ARCHIVOS=(
  index.html servicios.html como-trabajamos.html aviso-de-privacidad.html
  terminos.html proyectos.html diagnostico.html sitemap.xml robots.txt site.webmanifest
)

# ── Las reglas, en orden ────────────────────────────────────────
# Van de lo más específico a lo más general: la dirección de la portada
# termina en diagonal, no en palabra. Las de las demás páginas solo pierden
# la extensión, así que sirven igual dentro de una dirección completa
# (https://camena.com.mx/servicios.html → …/servicios).
REGLAS=(
  'href="/index.html|href="/'
  'href="index.html|href="/'
  'https://camena.com.mx/index.html|https://camena.com.mx/'
  'servicios.html|servicios'
  'como-trabajamos.html|como-trabajamos'
  'terminos.html|terminos'
  'aviso-de-privacidad.html|aviso-de-privacidad'
)

echo "── Qué se va a cambiar ──"
total=0
for archivo in "${ARCHIVOS[@]}"; do
  ruta="$RAIZ/$archivo"
  [[ -f "$ruta" ]] || { printf "  %-28s (no existe)\n" "$archivo"; continue; }
  n=0
  for regla in "${REGLAS[@]}"; do
    busca="${regla%%|*}"
    c="$(grep -oF "$busca" "$ruta" | wc -l | tr -d ' ')"
    n=$((n + c))
  done
  total=$((total + n))
  printf "  %-28s %2s cambios\n" "$archivo" "$n"
done
printf "  %-28s %2s en total\n" "TOTAL" "$total"
echo

if [[ "$APLICAR" != "--aplicar" ]]; then
  echo "Esto fue una simulación: no se tocó ningún archivo."
  echo "Para aplicarlo:  bash docs/quitar-extensiones.sh --aplicar"
  exit 0
fi

echo "── Aplicando ──"
for archivo in "${ARCHIVOS[@]}"; do
  ruta="$RAIZ/$archivo"
  [[ -f "$ruta" ]] || continue
  for regla in "${REGLAS[@]}"; do
    busca="${regla%%|*}"
    pon="${regla#*|}"
    # Con | como separador y los puntos escapados: las reglas traen diagonales.
    patron="$(printf '%s' "$busca" | sed 's/[.[\*^$()+?{}|]/\\&/g')"
    reemplazo="$(printf '%s' "$pon" | sed 's/[&|]/\\&/g')"
    sed -i "s|$patron|$reemplazo|g" "$ruta"
  done
done
echo "  ✓ direcciones cambiadas"

echo
echo "── Comprobación ──"
restos=0
for archivo in "${ARCHIVOS[@]}"; do
  ruta="$RAIZ/$archivo"
  [[ -f "$ruta" ]] || continue
  # Ninguna dirección publicada debe seguir terminando en .html. El único
  # .html que sobrevive con sentido es el nombre del archivo 404, que no se
  # enlaza desde ningún lado.
  n="$(grep -oE '(href|content)="[^"]*\.html|https://camena\.com\.mx/[^"< ]*\.html' "$ruta" 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "$n" != "0" ]]; then
    echo "  ✗ $archivo: quedan $n"
    grep -oE '(href|content)="[^"]*\.html|https://camena\.com\.mx/[^"< ]*\.html' "$ruta" | sed 's|^|      |'
    restos=$((restos + n))
  fi
  # Y ninguna dirección debe haber quedado con doble diagonal.
  d="$(grep -oE '(href|content)="[^"]*//[^"]*"' "$ruta" 2>/dev/null | grep -v 'https://' | wc -l | tr -d ' ')"
  if [[ "$d" != "0" ]]; then
    echo "  ✗ $archivo: $d dirección(es) con doble diagonal"
    restos=$((restos + d))
  fi
done
if [[ "$restos" -gt 0 ]]; then
  echo "✗ No quedó limpio: revisa lo de arriba."
  exit 1
fi
echo "  ✓ ninguna dirección termina ya en .html"
echo "  ✓ ninguna dirección con doble diagonal"
echo
echo "Siguiente:  bash docs/preparar-publicacion.sh /tmp/camena-publicar"
