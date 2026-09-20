#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# docs/comprobar-dominio.sh — Comprueba el sitio publicado desde fuera.
#
#   bash docs/comprobar-dominio.sh                    → camena.com.mx
#   bash docs/comprobar-dominio.sh camena.pages.dev camena.com.mx
#       → comprueba lo que ya se puede comprobar antes de conectar el dominio:
#         el sitio responde y su canonical ya habla del dominio bueno.
#
# Sirve para lo mismo antes y después de conectar el dominio de verdad:
# pregunta lo que ve un desconocido, no lo que uno cree que publicó. Revisa
# que las direcciones del sitio respondan sin redirección, que su canonical
# diga lo mismo que la dirección, que las versiones con .html lleven a su
# dirección sin extensión, que el http lleve al https, que www lleve al
# dominio raíz y —lo que más importa— que el material de trabajo dé 404.
#
# Sale con error si algo falla, para poder encadenarlo:
#   bash docs/comprobar-dominio.sh && echo "todo bien"
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

DOMINIO="${1:-camena.com.mx}"
DOMINIO="${DOMINIO#http://}"; DOMINIO="${DOMINIO#https://}"; DOMINIO="${DOMINIO%%/*}"
BASE="https://$DOMINIO"

# El dominio del que habla el sitio (canonical, sitemap). Antes de conectar el
# dominio de verdad se prueba contra la dirección de Pages, y ahí lo correcto
# es que el canonical siga siendo el dominio bueno.
CANONICO="${2:-$DOMINIO}"
CANONICO="${CANONICO#http://}"; CANONICO="${CANONICO#https://}"; CANONICO="${CANONICO%%/*}"

# El dominio raíz solo tiene sentido si es el nuestro: en pages.dev el www no
# existe y el http no redirige igual.
ES_DOMINIO_PROPIO=0
[[ "$DOMINIO" == "$CANONICO" ]] && ES_DOMINIO_PROPIO=1

PAGINAS=("" servicios como-trabajamos aviso-de-privacidad terminos)

# Material de trabajo: si algo de esto responde, la publicación está regalando
# lo que no debe. La lista no es decorativa: son archivos que existen de verdad
# en el repositorio y que por lo tanto podrían colarse.
PRIVADOS=(
  docs/laboratorio.html docs/pendientes.md docs/quitar-extensiones.sh
  docs/preparar-publicacion.sh README.md .github/workflows/publicar.yml
)

fallos=0
bien()  { echo "  ✓ $*"; }
mal()   { echo "  ✗ $*"; fallos=$((fallos + 1)); }

# Devuelve "código destino" de una dirección, siguiendo o no redirecciones.
respuesta() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' -m 25 "$1"; }
cuerpo()    { curl -s -m 25 "$1"; }

echo "── Comprobando $BASE ──"
echo

echo "── El sitio responde y sin redirecciones ──"
for p in "${PAGINAS[@]}"; do
  lectura="$(respuesta "$BASE/$p?comprobar=1")"
  codigo="${lectura%% *}"
  destino="${lectura#* }"
  if [[ "$codigo" == "200" ]]; then
    bien "/${p:-} → 200"
  else
    mal "/${p:-} → $codigo ${destino:+(redirige a $destino)}"
  fi
done

echo
echo "── El canonical dice la misma dirección que se sirve ──"
for p in "${PAGINAS[@]}"; do
  esperado="https://$CANONICO/${p}"
  obtenido="$(cuerpo "$BASE/$p" | grep -oE '<link rel="canonical" href="[^"]*"' | head -1 | sed 's/.*href="//;s/"$//')"
  if [[ "$obtenido" == "$esperado" ]]; then
    bien "/${p:-} → $obtenido"
  else
    mal "/${p:-} → canonical «$obtenido» (se esperaba «$esperado»)"
  fi
done

echo
echo "── Las versiones con .html llevan a su dirección sin extensión ──"
for p in servicios como-trabajamos aviso-de-privacidad terminos; do
  lectura="$(respuesta "$BASE/$p.html")"
  codigo="${lectura%% *}"
  destino="${lectura#* }"
  if [[ "$codigo" =~ ^30[18]$ && "$destino" == *"/$p"* ]]; then
    bien "/$p.html → $codigo → /$p"
  else
    mal "/$p.html → $codigo ${destino:+(va a $destino)}"
  fi
done

echo
echo "── El sitemap apunta a direcciones que existen ──"
mapa="$(cuerpo "$BASE/sitemap.xml")"
if [[ -z "$mapa" ]]; then
  mal "el sitemap no responde"
else
  # Se comprueba cada dirección del sitemap contra el hospedaje de verdad
  # (la ruta, sin el dominio), y aparte que el sitemap hable del dominio
  # bueno: así sirve también antes de conectar el dominio.
  while IFS= read -r u; do
    ruta="${u#https://$CANONICO}"
    [[ "$ruta" == "$u" ]] && ruta="/"
    lectura="$(respuesta "$BASE$ruta")"
    codigo="${lectura%% *}"
    if [[ "$codigo" == "200" ]]; then
      bien "$u → 200"
    else
      mal "$u → $codigo (probado en $BASE$ruta)"
    fi
  done < <(printf '%s' "$mapa" | grep -oE '<loc>[^<]*</loc>' | sed 's|</\?loc>||g')
  if printf '%s' "$mapa" | grep -q "https://$CANONICO"; then
    bien "el sitemap habla de $CANONICO"
  else
    mal "el sitemap no menciona $DOMINIO"
  fi
fi

echo
echo "── Ni rastro de la dirección vieja ──"
rastros=0
for p in "${PAGINAS[@]}"; do
  if cuerpo "$BASE/$p" | grep -q "github.io"; then
    mal "/${p:-} todavía menciona github.io"
    rastros=$((rastros + 1))
  fi
done
[[ "$rastros" == "0" ]] && bien "ninguna página menciona github.io"

echo
echo "── El material de trabajo está fuera de la web ──"
for p in "${PRIVADOS[@]}"; do
  codigo="$(respuesta "$BASE/$p")"
  codigo="${codigo%% *}"
  if [[ "$codigo" == "404" ]]; then
    bien "/$p → 404"
  else
    mal "/$p → $codigo (¡está accesible!)"
  fi
done

echo
echo "── La página que no existe muestra la del sitio ──"
codigo="$(respuesta "$BASE/esto-no-existe-$RANDOM")"
codigo="${codigo%% *}"
titulo="$(cuerpo "$BASE/esto-no-existe-$RANDOM" | grep -oE '<title>[^<]*</title>' | head -1)"
if [[ "$codigo" == "404" && "$titulo" == *CAMENA* ]]; then
  bien "404 con la página propia ($titulo)"
else
  mal "404 devolvió $codigo $titulo"
fi

if [[ "$ES_DOMINIO_PROPIO" == "1" ]]; then
  echo
  echo "── El http lleva al https ──"
  lectura="$(respuesta "http://$DOMINIO/")"
  codigo="${lectura%% *}"
  destino="${lectura#* }"
  if [[ "$codigo" =~ ^30[18]$ && "$destino" == https://* ]]; then
    bien "http://$DOMINIO → $codigo → $destino"
  else
    mal "http://$DOMINIO → $codigo ${destino:+(va a $destino)}"
  fi

  echo
  echo "── www lleva al dominio raíz ──"
  lectura="$(respuesta "https://www.$DOMINIO/")"
  codigo="${lectura%% *}"
  destino="${lectura#* }"
  if [[ "$codigo" =~ ^30[18]$ && "$destino" == "https://$DOMINIO/"* ]]; then
    bien "www → $codigo → $destino"
  else
    mal "www → $codigo ${destino:+(va a $destino)}"
  fi

  echo
  echo "── El certificado cubre el dominio ──"
  # Si el certificado no cubriera el nombre, curl fallaría con error 60.
  if curl -s -o /dev/null -m 25 "https://$DOMINIO/" ; then
    emisor="$(echo | timeout 25 openssl s_client -connect "$DOMINIO:443" -servername "$DOMINIO" 2>/dev/null | grep -m1 'issuer=' | sed 's/^ *//')"
    bien "certificado válido ${emisor:+($emisor)}"
  else
    mal "el certificado no cubre $DOMINIO"
  fi
fi

echo
if [[ "$fallos" -gt 0 ]]; then
  echo "✗ $fallos comprobación(es) fallaron."
  exit 1
fi
echo "✓ Todo bien: $BASE"
