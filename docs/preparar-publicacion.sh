#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# docs/preparar-publicacion.sh — Arma la carpeta que se sube a la web.
#
#   bash docs/preparar-publicacion.sh /tmp/camena-publicar
#
# Es la ÚNICA puerta de publicación. La usan este equipo y el flujo de
# GitHub Actions (.github/workflows/publicar.yml): así lo que se comprueba
# aquí es exactamente lo que se comprueba allá, y no hay dos reglas que se
# puedan separar con el tiempo.
#
# Qué entra: las páginas del sitio y lo que el navegador necesita.
# Qué se queda fuera: docs/, README, .github, y cualquier página que no
# esté en la lista. Es a propósito: el repositorio es público y los archivos
# de trabajo no tienen por qué quedar accesibles en la web.
#
# No se toca el repositorio: todo se arma en la carpeta de destino, que por
# lo general es temporal. El sello de versión de CSS y JS (docs/versionar.py)
# también corre sobre la copia.
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DESTINO="${1:-}"

if [[ -z "$DESTINO" ]]; then
  echo "Falta la carpeta de destino."
  echo "  Uso: bash docs/preparar-publicacion.sh /tmp/camena-publicar"
  exit 2
fi

# ── Qué se publica ──────────────────────────────────────────────
# Si cambia el sitio, esta lista cambia: es la misma que usa el candado.
PAGINAS=(
  index.html servicios.html como-trabajamos.html aviso-de-privacidad.html
  terminos.html 404.html proyectos.html diagnostico.html
)
CARPETAS=(assets css js)
SUELTOS=(robots.txt sitemap.xml site.webmanifest .nojekyll)

fallos=0
aviso() { echo "  ✗ $*"; fallos=$((fallos + 1)); }

# ── 1 · Copiar solo lo que va ───────────────────────────────────
echo "── Preparando la copia ──"
rm -rf "$DESTINO"
mkdir -p "$DESTINO"
for carpeta in "${CARPETAS[@]}"; do
  [[ -d "$RAIZ/$carpeta" ]] || { aviso "falta la carpeta $carpeta/"; continue; }
  cp -r "$RAIZ/$carpeta" "$DESTINO/"
done
for pagina in "${PAGINAS[@]}" "${SUELTOS[@]}"; do
  [[ -f "$RAIZ/$pagina" ]] || { aviso "falta $pagina"; continue; }
  cp "$RAIZ/$pagina" "$DESTINO/"
done
[[ "$fallos" -gt 0 ]] && { echo "✗ No se puede publicar: falta contenido."; exit 1; }
echo "  ✓ copiado"

# ── 2 · Sellar la versión de CSS y JS ───────────────────────────
# Va antes de las demás comprobaciones para que se revisen las direcciones
# tal como las va a pedir el navegador.
echo
echo "── Sellando versiones ──"
if ! python3 "$RAIZ/docs/versionar.py" "$DESTINO"; then
  echo "✗ No se puede publicar: hay referencias a archivos que no existen."
  exit 1
fi

# ── 3 · Candado: al sitio solo entran las páginas del sitio ──────
# El repositorio guarda prototipos, laboratorio y páginas de producto. Que
# ninguno se cuele en la copia que se sube, ni por descuido ni por costumbre.
echo
echo "── Candado: páginas permitidas ──"
sobrantes=""
while IFS= read -r f; do
  case " ${PAGINAS[*]} " in
    *" $f "*) ;;
    *) sobrantes="$sobrantes $f" ;;
  esac
done < <(find "$DESTINO" -name "*.html" | sed "s|^$DESTINO/||" | sort)
if [[ -n "$sobrantes" ]]; then
  echo "  ✗ Hay páginas que no deben publicarse:$sobrantes"
  echo "    El sitio muestra los sistemas con capturas: nada que se pueda abrir."
  echo "    Mueve el archivo fuera del repositorio o agrégalo a PAGINAS si la decisión cambió."
  exit 1
fi
echo "  ✓ solo las ${#PAGINAS[@]} páginas del sitio"

# ── 4 · Candado: ni rastro de la dirección vieja ────────────────
# Cambiar de dirección a medias es peor que no cambiarla: el buscador y las
# previsualizaciones al compartir por WhatsApp seguirían apuntando al sitio
# viejo. El sitio ya vive en camena.com.mx: si algo quedara apuntando a
# github.io, no se publica.
echo
echo "── Candado: dirección del sitio ──"
viejas="$(grep -rl "github.io" "$DESTINO" 2>/dev/null || true)"
if [[ -n "$viejas" ]]; then
  echo "  ✗ Todavía queda la dirección vieja en:"
  echo "$viejas" | sed "s|^$DESTINO/|    |"
  echo "    Corrígelo con: bash docs/cambiar-dominio.sh camena.com.mx --aplicar --pages"
  exit 1
fi
echo "  ✓ ninguna aparición de la dirección vieja"

# ── 5 · Que no falte ninguna referencia local ───────────────────
# Cada HTML se revisa contra SU carpeta: así funcionan igual las rutas
# relativas (css/base.css) y las de la raíz del dominio (/servicios.html).
echo
echo "── Referencias locales ──"
refs_rotas=0
while IFS= read -r archivo; do
  dir="$(dirname "$archivo")"
  [[ "$dir" == "." ]] && dir=""
  while IFS= read -r ref; do
    limpio="${ref%%#*}"; limpio="${limpio%%\?*}"
    [[ -z "$limpio" ]] && continue
    # Una ruta que empieza con / se resuelve contra la raíz del sitio.
    if [[ "$limpio" == /* ]]; then
      objetivo="$DESTINO$limpio"
    else
      objetivo="$DESTINO/$dir/$limpio"
    fi
    # Una dirección sin extensión la sirve el hospedaje desde su archivo
    # .html (Cloudflare Pages: /servicios se sirve desde servicios.html).
    if [[ ! -e "$objetivo" && ! -e "$objetivo.html" ]]; then
      echo "  ✗ falta: ${dir:+$dir/}$limpio (referenciado en $archivo)"
      refs_rotas=$((refs_rotas + 1))
    fi
  done < <(grep -ohE '(src|href)="[^"#][^"]*"' "$DESTINO/$archivo" \
             | sed -E 's/.*="([^"]*)".*/\1/' \
             | grep -vE '^(https?:|mailto:|tel:|//|#)' | sort -u)
done < <(find "$DESTINO" -name "*.html" | sed "s|^$DESTINO/||" | sort)
if [[ "$refs_rotas" -gt 0 ]]; then
  echo "  ✗ $refs_rotas referencia(s) rota(s). No se publica."
  exit 1
fi
echo "  ✓ todas las referencias locales existen"

# ── 6 · El HTML y sus datos estructurados, completos ─────────────
echo
echo "── HTML y JSON-LD ──"
if ! DESTINO="$DESTINO" python3 - <<'PY'
import glob, json, os, re, sys

destino = os.environ["DESTINO"]
pares = ["main", "section", "div", "form", "article", "aside", "ul", "ol",
         "li", "dl", "details", "footer", "header", "nav"]
fallos = 0

for archivo in sorted(glob.glob(os.path.join(destino, "*.html"))):
    nombre = os.path.basename(archivo)
    html = open(archivo, encoding="utf-8").read()

    for bloque in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            json.loads(bloque)
        except json.JSONDecodeError as e:
            print(f"  ✗ {nombre}: JSON-LD inválido → {e}")
            fallos += 1

    problemas = []
    # Los comentarios se quitan antes de contar: ahí se nombran etiquetas
    # —«el desplegable nativo <details>»— y contarlas daba por roto un HTML
    # que está completo. Este candado tiene que fallar por defectos, no por
    # la documentación que explica el propio archivo.
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    for etiqueta in pares:
        a = len(re.findall(r"<" + etiqueta + r"[\s>]", html))
        c = len(re.findall(r"</" + etiqueta + r">", html))
        if a != c:
            problemas.append(f"{etiqueta}: {a} abiertas / {c} cierres")
    if "<form" in html:
        if not re.search(r"<input|<textarea|<select", html):
            problemas.append("hay un <form> sin ningún campo")
        if "</form>" not in html:
            problemas.append("hay un <form> sin cerrar")
    if problemas:
        print(f"  ✗ {nombre}")
        for p in problemas:
            print("      " + p)
        fallos += 1
    else:
        print(f"  ✓ {nombre}")

sys.exit(1 if fallos else 0)
PY
then
  echo "✗ No se puede publicar: el HTML está incompleto."
  exit 1
fi

# ── 7 · Lo que se va a subir, a la vista ────────────────────────
echo
echo "── Contenido que se publica ──"
find "$DESTINO" -type f | sort | sed "s|^$DESTINO/|  |"
echo "  ($(find "$DESTINO" -type f | wc -l | tr -d ' ') archivos)"
echo
echo "✓ Listo en: $DESTINO"
