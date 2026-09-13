#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# docs/auditar.sh — Auditoría del sitio sin dependencias.
#
#   bash docs/auditar.sh [url] [ancho] [alto] [nombre]
#
# Cómo funciona: se copia el index.html a un archivo temporal, se le
# inyecta un script de medición que escribe un informe dentro del DOM
# y se lee con `--dump-dom`. La captura se toma aparte con
# `--screenshot`. Así la auditoría no depende de protocolos remotos
# ni de librerías.
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

URL="${1:-http://127.0.0.1:8899/index.html}"
ANCHO="${2:-1440}"
ALTO="${3:-900}"
NOMBRE="${4:-desktop}"

CHROME="/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
SALIDA="/tmp/camena-shots"
TIERRA="$(mktemp -d /tmp/camena-audit-XXXXXX)"
mkdir -p "$SALIDA"

FLAGS=(--headless --no-sandbox --disable-gpu --disable-software-rasterizer
       --disable-gpu-compositing --disable-dev-shm-usage --hide-scrollbars
       --force-device-scale-factor=1)

# ── 1 · Copia local del sitio con el script de medición inyectado ──
if [[ "$URL" == http* ]]; then
  cp -r "$RAIZ"/. "$TIERRA"/
  ARCHIVO="$TIERRA/index.html"
else
  ARCHIVO="$URL"
fi

# AUDITAR_REVELADO=1 fuerza el estado "ya apareció todo", para medir
# contraste y desbordes como los ve una persona que ya recorrió la página.
if [[ "${AUDITAR_REVELADO:-0}" == "1" ]]; then
  cat >> "$ARCHIVO" <<'FORZAR'
<style>
  .js [data-revelar] { opacity: 1 !important; transform: none !important; transition: none !important; }
  .js .hero__linea, .js .hero__panel { opacity: 1 !important; animation: none !important; }
  .flotante[data-visible="false"] { opacity: 1 !important; visibility: visible !important; }
</style>
FORZAR
fi

cat >> "$ARCHIVO" <<'MEDICION'
<script>
window.__fallos = [];
window.addEventListener("error", function (e) {
  window.__fallos.push({ tipo: "error", texto: e.message + " @ " + (e.filename || "") + ":" + e.lineno });
});
window.addEventListener("unhandledrejection", function (e) {
  window.__fallos.push({ tipo: "promesa", texto: String(e.reason) });
});
(function () {
  var errores = console.error;
  console.error = function () {
    window.__fallos.push({ tipo: "console.error", texto: [].join.call(arguments, " ") });
    return errores.apply(console, arguments);
  };
})();

function esperarReal(ms) {
  var fin = Date.now() + ms;
  while (Date.now() < fin) { /* espera activa: el tiempo virtual no avanza solo */ }
}

(function () {
  esperarReal(2500);
  var d = document.documentElement;

  var nums = function (c) { return (c.match(/[\d.]+/g) || []).map(Number); };
  var alpha = function (c) { var p = nums(c); return c.indexOf("rgba") === 0 && p.length > 3 ? p[3] : 1; };
  var rgb = function (c) { return nums(c).slice(0, 3); };
  var compone = function (frente, fondo) {
    var a = alpha(frente), f = rgb(frente), b = rgb(fondo);
    return "rgb(" + f.map(function (v, i) { return Math.round(v * a + b[i] * (1 - a)); }).join(",") + ")";
  };
  var lum = function (c) {
    var p = rgb(c).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  };
  var fondoReal = function (el) {
    var capas = [], n = el;
    while (n && n !== d) {
      var bg = getComputedStyle(n).backgroundColor;
      if (alpha(bg) > 0) capas.push(bg);
      if (alpha(bg) === 1) break;
      n = n.parentElement;
    }
    var res = "rgb(255,255,255)";
    for (var i = capas.length - 1; i >= 0; i--) res = compone(capas[i], res);
    return res;
  };
  var ratio = function (a, b) {
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  /* Contraste de todo el texto visible */
  var contraste = [];
  var muestra = document.querySelectorAll("p,span,a,li,h1,h2,h3,h4,dt,dd,summary,strong,em,button,label");
  for (var i = 0; i < muestra.length; i++) {
    var el = muestra[i];
    if (!el.textContent.trim()) continue;
    if (el.children.length && !Array.prototype.some.call(el.childNodes, function (n) {
      return n.nodeType === 3 && n.textContent.trim();
    })) continue;
    var cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.55) continue;
    if (alpha(cs.color) === 0 || cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") continue;
    var caja = el.getBoundingClientRect();
    if (!caja.width || !caja.height) continue;
    var bg = fondoReal(el);
    var fg = alpha(cs.color) < 1 ? compone(cs.color, bg) : cs.color;
    var cr = ratio(fg, bg);
    var px = parseFloat(cs.fontSize);
    var grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    var minimo = grande ? 3 : 4.5;
    if (cr < minimo) {
      contraste.push({ texto: el.textContent.trim().slice(0, 46), ratio: Number(cr.toFixed(2)),
                       minimo: minimo, px: Math.round(px), fg: fg, bg: bg });
    }
  }

  /* Desbordes horizontales */
  var desbordes = [];
  var todos = document.querySelectorAll("body *");
  for (var j = 0; j < todos.length; j++) {
    var c = todos[j].getBoundingClientRect();
    if (c.width > 0 && (c.right > d.clientWidth + 2 || c.left < -2)) {
      desbordes.push(todos[j].tagName.toLowerCase() + "." + String(todos[j].className).split(" ").slice(0, 2).join("."));
      if (desbordes.length > 10) break;
    }
  }

  /* Objetivos táctiles pequeños (solo enlaces y botones visibles) */
  var objetivos = [];
  var interactivos = document.querySelectorAll("a,button,summary,input,select");
  for (var k = 0; k < interactivos.length; k++) {
    var r = interactivos[k].getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)) {
      objetivos.push((interactivos[k].textContent.trim().slice(0, 28) || interactivos[k].tagName) + " " +
        Math.round(r.width) + "x" + Math.round(r.height));
    }
  }

  /* Niveles de encabezado */
  var saltos = [];
  var orden = [];
  document.querySelectorAll("h1,h2,h3,h4").forEach(function (n) { orden.push(Number(n.tagName[1])); });
  for (var m = 1; m < orden.length; m++) if (orden[m] - orden[m - 1] > 1) saltos.push(orden[m - 1] + ">" + orden[m]);

  /* Elementos que deben existir siempre. Un contenido que no se genera
     no rompe nada y no da error de consola: sin esta lista, su ausencia
     pasa desapercibida. */
  var esperados = {
    ".paquete__precio": 6,
    ".grupo": 3,
    ".flujo li": 6,
    ".flujo__enlace": 1,
    ".lab-pieza__ficha": 3,
    ".lab-pieza__cita": 1,
    ".disciplina": 7,
    ".lab-pieza": 5,
    ".faq__item": 8,
    ".caso": 7,
    ".enunciado": 1
  };
  var faltantes = [];
  Object.keys(esperados).forEach(function (sel) {
    var hay = document.querySelectorAll(sel).length;
    if (hay < esperados[sel]) faltantes.push(sel + ": " + hay + " de " + esperados[sel]);
  });

  var imagenes = Array.prototype.slice.call(document.images);
  var nav = performance.getEntriesByType("navigation")[0] || {};
  var recursos = performance.getEntriesByType("resource");
  var peso = recursos.reduce(function (s, r) { return s + (r.transferSize || 0); }, 0);

  var informe = {
    altoDocumento: d.scrollHeight,
    anchoVisible: d.clientWidth,
    desbordeHorizontal: d.scrollWidth > d.clientWidth ? d.scrollWidth - d.clientWidth : 0,
    titulo: document.title,
    metaDescripcion: (document.querySelector('meta[name="description"]') || {}).content || "",
    canonical: !!document.querySelector('link[rel="canonical"]'),
    metasOg: document.querySelectorAll('meta[property^="og:"]').length,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    h1: document.querySelectorAll("h1").length,
    h2: document.querySelectorAll("h2").length,
    h3: document.querySelectorAll("h3").length,
    saltosDeNivel: saltos,
    imagenes: imagenes.length,
    imagenesSinAlt: imagenes.filter(function (i) { return !i.hasAttribute("alt"); }).length,
    botonesSinNombre: Array.prototype.filter.call(document.querySelectorAll("button"), function (b) {
      return !b.textContent.trim() && !b.getAttribute("aria-label");
    }).length,
    camposSinEtiqueta: Array.prototype.filter.call(document.querySelectorAll("input,select,textarea"), function (c) {
      if (c.getAttribute("aria-label")) return false;
      if (c.id && document.querySelector('label[for="' + c.id + '"]')) return false;
      return !c.closest("label");
    }).length,
    objetivosPequenos: objetivos.slice(0, 12),
    desbordes: desbordes,
    jsActivo: d.classList.contains("js"),
    reveladas: document.querySelectorAll("[data-revelar].is-visible").length,
    totalRevelar: document.querySelectorAll("[data-revelar]").length,
    secciones: document.querySelectorAll("main section").length,
    fuentesCargadas: document.fonts ? document.fonts.size : 0,
    familiaTitulo: getComputedStyle(document.querySelector("h1")).fontFamily,
    msDomContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
    msCarga: Math.round(nav.loadEventEnd || 0),
    recursos: recursos.length,
    pesoKB: Math.round(peso / 1024),
    enlacesInternosRotos: Array.prototype.filter.call(document.querySelectorAll('a[href^="#"]'), function (a) {
      var h = a.getAttribute("href");
      return h.length > 1 && !document.querySelector(h);
    }).map(function (a) { return a.getAttribute("href"); }),
    elementosFaltantes: faltantes,
    contraste: contraste.slice(0, 20),
    totalFallosContraste: contraste.length,
    fallosJs: window.__fallos
  };

  var salida = document.createElement("script");
  salida.type = "application/json";
  salida.id = "informe-auditoria";
  salida.textContent = JSON.stringify(informe);
  document.body.appendChild(salida);
  document.title = "AUDITORIA-LISTA";
})();
</script>
MEDICION

# ── 2 · Medición: se espera a que el informe esté listo ──
"$CHROME" "${FLAGS[@]}" --window-size="$ANCHO,$ALTO" \
  --dump-dom "$ARCHIVO" > "$TIERRA/dom.html" 2>/dev/null

python3 - "$TIERRA/dom.html" "$SALIDA/informe-$NOMBRE.json" <<'PY'
import json, re, sys
dom = open(sys.argv[1], encoding="utf-8", errors="replace").read()
m = re.search(r'<script type="application/json" id="informe-auditoria">(.*?)</script>', dom, re.S)
if not m:
    print("✗ No se pudo leer el informe. ¿El script se ejecutó?")
    sys.exit(1)
informe = json.loads(m.group(1).replace("&quot;", '"').replace("&amp;", "&")
                              .replace("&lt;", "<").replace("&gt;", ">"))
json.dump(informe, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("informe:", sys.argv[2])
PY

# ── 3 · Captura de pantalla completa ──
ALTO_REAL=$(python3 -c "
import json,sys
try: print(min(json.load(open('$SALIDA/informe-$NOMBRE.json'))['altoDocumento'] + 40, 40000))
except Exception: print(3000)
")
"$CHROME" "${FLAGS[@]}" --window-size="$ANCHO,$ALTO_REAL" \
  --screenshot="$SALIDA/$NOMBRE.png" "$ARCHIVO" >/dev/null 2>&1

echo "captura: $SALIDA/$NOMBRE.png (${ANCHO}x${ALTO_REAL})"
rm -rf "$TIERRA"
