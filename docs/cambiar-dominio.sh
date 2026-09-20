#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# docs/cambiar-dominio.sh — Pasa el sitio de github.io al dominio propio.
#
#   bash docs/cambiar-dominio.sh camena.mx              → muestra qué cambiaría
#   bash docs/cambiar-dominio.sh camena.mx --aplicar    → lo cambia
#   … --aplicar --pages  → además, para Cloudflare Pages: no crea el archivo
#                          CNAME (eso era de GitHub Pages) y cambia las
#                          instrucciones finales.
#
# Por qué existe: la dirección vieja aparece en 42 lugares de 7 archivos
# —canonical, og:url, twitter:image, datos estructurados, sitemap y robots—.
# Cambiarla a mano deja mitades: el buscador y las previsualizaciones al
# compartir por WhatsApp se quedan apuntando al sitio viejo. Esto lo hace de
# una vez y comprueba que no quede ni una aparición.
#
# La publicación frena el despliegue si en la copia que se sube todavía queda
# rastro de la dirección anterior (docs/preparar-publicacion.sh), así que una
# migración a medias no se publica.
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DOMINIO="${1:-}"
APLICAR=""
PARA_PAGES=""
for arg in "$@"; do
  case "$arg" in
    --aplicar) APLICAR="--aplicar" ;;
    --pages|--cloudflare) PARA_PAGES="--pages" ;;
  esac
done

# Archivos que se publican. Si aparece una página nueva, se agrega aquí.
ARCHIVOS=(
  index.html servicios.html como-trabajamos.html aviso-de-privacidad.html
  terminos.html 404.html
  sitemap.xml robots.txt site.webmanifest
)

if [[ -z "$DOMINIO" ]]; then
  echo "Falta el dominio."
  echo "  Uso: bash docs/cambiar-dominio.sh camena.mx [--aplicar]"
  exit 2
fi

# Dominio sin protocolo, sin diagonales, sin www (el www se resuelve en DNS).
DOMINIO="${DOMINIO#http://}"; DOMINIO="${DOMINIO#https://}"; DOMINIO="${DOMINIO%%/*}"
DOMINIO="${DOMINIO#www.}"

if [[ ! "$DOMINIO" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]]; then
  echo "✗ «$DOMINIO» no parece un dominio válido."
  exit 2
fi

# La dirección actual se saca del propio sitio, no de un valor escrito a mano.
BASE_VIEJA="$(grep -o 'https://[a-z0-9.-]*\.github\.io[^"< ]*' "$RAIZ/sitemap.xml" 2>/dev/null | head -1)"
BASE_VIEJA="${BASE_VIEJA%/}"
if [[ -z "$BASE_VIEJA" ]]; then
  echo "✗ No encontré la dirección actual en sitemap.xml."
  echo "  Si ya migraste, revisa que no queden restos: grep -rl github.io ."
  exit 1
fi
BASE_NUEVA="https://$DOMINIO"

echo "── De dónde a dónde ──"
echo "  antes: $BASE_VIEJA"
echo "  ahora: $BASE_NUEVA"
echo

echo "── Qué se va a cambiar ──"
total=0
for archivo in "${ARCHIVOS[@]}"; do
  ruta="$RAIZ/$archivo"
  [[ -f "$ruta" ]] || { printf "  %-28s (no existe)\n" "$archivo"; continue; }
  n="$(grep -o "$BASE_VIEJA" "$ruta" | wc -l | tr -d ' ')"
  total=$((total + n))
  printf "  %-28s %2s apariciones\n" "$archivo" "$n"
done
printf "  %-28s %2s en total\n" "TOTAL" "$total"
echo

# Lo que vive fuera de la lista se avisa, no se toca.
otros="$(grep -rl "$BASE_VIEJA" "$RAIZ" --include="*.md" --include="*.json" --include="*.sh" 2>/dev/null | grep -v '/docs/revision/' | sed "s|$RAIZ/||" || true)"
if [[ -n "$otros" ]]; then
  echo "── Fuera de la lista publicada (revísalo a mano) ──"
  echo "$otros" | sed 's|^|  |'
  echo
fi

if [[ "$APLICAR" != "--aplicar" ]]; then
  echo "Esto fue una simulación: no se tocó ningún archivo."
  echo "Para aplicarlo:  bash docs/cambiar-dominio.sh $DOMINIO --aplicar"
  exit 0
fi

echo "── Aplicando ──"
# sed con | como separador y los puntos escapados: la dirección trae diagonales.
patron="$(printf '%s' "$BASE_VIEJA" | sed 's/[.[\*^$()+?{}|]/\\&/g')"
for archivo in "${ARCHIVOS[@]}"; do
  ruta="$RAIZ/$archivo"
  [[ -f "$ruta" ]] || continue
  sed -i "s|$patron|$BASE_NUEVA|g" "$ruta"
done

# El CNAME es lo que le dice a GitHub Pages cuál es el dominio. Con Cloudflare
# Pages no se usa: ahí el dominio se conecta desde el panel de Cloudflare, y
# dejar el archivo sería dejar una pieza del hospedaje viejo en la raíz.
if [[ "$PARA_PAGES" == "--pages" ]]; then
  rm -f "$RAIZ/CNAME"
  echo "  ✓ referencias cambiadas"
  echo "  ✓ sin CNAME (el dominio se conecta en Cloudflare Pages)"
else
  printf '%s\n' "$DOMINIO" > "$RAIZ/CNAME"
  echo "  ✓ referencias cambiadas"
  echo "  ✓ CNAME creado con: $DOMINIO"
fi

echo
echo "── Comprobación ──"
restos=0
for archivo in "${ARCHIVOS[@]}" CNAME; do
  [[ -f "$RAIZ/$archivo" ]] || continue
  n="$(grep -o "$BASE_VIEJA" "$RAIZ/$archivo" 2>/dev/null | wc -l | tr -d ' ')"
  [[ "$n" != "0" ]] && { echo "  ✗ $archivo: quedan $n"; restos=$((restos + n)); }
done
if [[ "$restos" -gt 0 ]]; then
  echo "✗ Quedaron $restos apariciones de la dirección vieja."
  exit 1
fi
echo "  ✓ ninguna aparición de $BASE_VIEJA"
echo "  ✓ $(grep -c "$DOMINIO" "$RAIZ/sitemap.xml") direcciones nuevas en el sitemap"

if [[ "$PARA_PAGES" == "--pages" ]]; then
  cat <<FIN

── Lo que sigue, en orden (Cloudflare Pages) ──
 1 · En Cloudflare → Workers & Pages → proyecto «camena» → Custom domains:
       añadir  $DOMINIO  y  www.$DOMINIO
 2 · Los registros DNS los crea Cloudflare Pages (CNAME al proyecto).
     El dominio raíz se aplana solo: no hay que escribir direcciones IP.
 3 · Redirigir www → dominio raíz con un 301:
       Rules → Redirect Rules → si el host es www.$DOMINIO, a https://$DOMINIO
 4 · SSL/TLS en «Full» y activar «Always Use HTTPS»
 5 · Comprueba: bash docs/auditar.sh https://$DOMINIO/index.html 1440 900 dominio
 6 · Publica:  bash docs/preparar-publicacion.sh /tmp/camena-publicar
FIN
else
  cat <<FIN

── Lo que sigue, en orden (GitHub Pages) ──
 1 · DNS en tu registrador:
       A      @    185.199.108.153
       A      @    185.199.109.153
       A      @    185.199.110.153
       A      @    185.199.111.153
       CNAME  www  wildpig94.github.io
     (si usas Cloudflare, deja esos registros en «DNS only», nube gris:
      el proxy naranja estorba al certificado de GitHub Pages)
 2 · En GitHub: Settings → Pages → Custom domain: $DOMINIO
 3 · Espera el certificado y marca «Enforce HTTPS» (tarda minutos u horas)
 4 · Comprueba: bash docs/auditar.sh https://$DOMINIO/index.html 1440 900 dominio
 5 · Publica: git add -A && git commit -m "El sitio pasa a $DOMINIO" && git push
FIN
fi
