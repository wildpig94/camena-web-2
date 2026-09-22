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
# Nunca se mide sobre el archivo original: el script AÑADE código al HTML que
# mide, así que apuntar a un archivo del repositorio lo dejaría mutilado (pasó:
# servicios.html y como-trabajamos.html crecieron cientos de líneas). Siempre
# se trabaja sobre la copia temporal, sea la entrada una URL o una ruta local.
cp -r "$RAIZ"/. "$TIERRA"/
PAGINA="index.html"
if [[ "$URL" == http* ]]; then
  # La ruta de la URL importa: auditar /servicios.html no es auditar el inicio.
  RUTA="${URL#*://}"; RUTA="${RUTA#*/}"
  RUTA="${RUTA%%\?*}"; RUTA="${RUTA%%#*}"
  [[ -n "$RUTA" ]] && PAGINA="$RUTA"
else
  PAGINA="$(basename "${URL%%\?*}")"
fi
if [[ ! -f "$TIERRA/$PAGINA" ]]; then
  echo "✗ no existe $PAGINA en el sitio: se audita index.html"
  PAGINA="index.html"
fi
ARCHIVO="$TIERRA/$PAGINA"

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
  var esperados = /index\.html$|\/$/.test(location.pathname) ? {
    /* Los números se volvieron a medir el 21 de septiembre de 2026, en el DOM
       y no en el HTML crudo, porque esta lista llevaba meses por detrás del
       sitio: pedía tres piezas de ejemplo cuando quedan dos, y seis renglones
       de una sección —.flujo— que se retiró. Una auditoría que grita en falso
       deja de leerse, y entonces no avisa cuando de verdad falta algo.
       Lo que cambió desde la medición anterior: los ocho renglones de la banda
       de sistemas son ocho fichas desplegables (.sistema), y el armador ganó la
       casilla del sistema completo, que era el renglón más caro y no se podía
       cotizar. */
    ".etapa": 5,
    /* Las cinco tablas de precio son ahora cinco listas de fichas
       desplegables: los 28 servicios del inicio, contando los ocho de la
       banda de sistemas. Ya no hay una sola tabla de precios. */
    ".sistema": 28,
    ".sistema__cuerpo": 28,
    ".opcion input": 21,
    /* Los ejemplos salieron del inicio el 21 de septiembre: viven completos en
       proyectos.html, y aquí queda el enlace. Las piezas se cuentan en la rama
       de esa página. */
    ".faq__item": 10,
    ".caso-tarjeta": 6,
    ".panel__lista li": 6
  } : /diagnostico/.test(location.pathname) ? {
    /* El diagnóstico: ocho preguntas y 32 opciones. Si se pierde una pregunta
       al editar, este renglón lo dice. */
    ".armar__grupo": 7,
    ".campo__control": 14,
    ".opcion": 7,
    ".armar__leyenda": 7
  } : /proyectos/.test(location.pathname) ? {
    /* La página de proyectos: aquí viven las piezas completas. Si alguna se
       pierde al copiar el siguiente proyecto, este renglón lo dice. */
    ".lab-pieza": 2,
    ".lab-pieza__ficha": 2,
    ".servicios__incluye": 2,
    ".captura": 5
  } : {};
  var faltantes = [];
  Object.keys(esperados).forEach(function (sel) {
    var hay = document.querySelectorAll(sel).length;
    if (hay < esperados[sel]) faltantes.push(sel + ": " + hay + " de " + esperados[sel]);
  });


  /* ── Problemas específicos de móvil ──────────────────────────
     El desborde horizontal no es el único defecto que aparece en
     pantallas chicas: también el texto pisado, lo que se sale del
     borde, los objetivos táctiles juntos y las líneas de texto
     demasiado largas o demasiado cortas. */
  var problemasMovil = [];
  var anchoPantalla = d.clientWidth;

  /* 1 · Elementos que se salen de la pantalla por los lados */
  document.querySelectorAll("body *").forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right > anchoPantalla + 1 || r.left < -1) {
      problemasMovil.push("fuera de pantalla: " + el.tagName.toLowerCase()
        + "." + String(el.className).split(" ")[0]
        + " (izq " + Math.round(r.left) + ", der " + Math.round(r.right) + ")");
    }
  });

  /* 2 · Texto pisado: dos elementos con texto que se encabalgan */
  /* Solo cuenta lo que de verdad se ve: se descartan los paneles de
     acordeón cerrados y lo que está fuera del flujo. El menú fijo se
     excluye aparte porque se superpone al contenido a propósito. */
  function visibleDeVerdad(el) {
    if (el.closest("[hidden]")) return false;
    var detalles = el.closest("details");
    if (detalles && !detalles.open && !el.closest("summary")) return false;
    if (el.closest(".cabecera, .flotante, .saltar")) return false;
    var n = el, cs;
    while (n && n !== document.body) {
      cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      n = n.parentElement;
    }
    return true;
  }

  var conTexto = Array.prototype.filter.call(document.querySelectorAll("p, h1, h2, h3, span, a, li, dt, dd, strong"), function (el) {
    return el.textContent.trim().length > 1 && el.children.length === 0 && visibleDeVerdad(el);
  }).slice(0, 400);
  for (var i = 0; i < conTexto.length; i++) {
    var a = conTexto[i].getBoundingClientRect();
    if (a.width === 0 || a.height === 0) continue;
    for (var j = i + 1; j < conTexto.length; j++) {
      var b = conTexto[j].getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      var solapaX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      var solapaY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      /* Solape real: más de 4px en ambos ejes */
      if (solapaX > 4 && solapaY > 4) {
        /* Que no sean ancestro y descendiente */
        if (conTexto[i].contains(conTexto[j]) || conTexto[j].contains(conTexto[i])) continue;
        problemasMovil.push("texto pisado: «" + conTexto[i].textContent.trim().slice(0, 22)
          + "» y «" + conTexto[j].textContent.trim().slice(0, 22) + "»");
        break;
      }
    }
    if (problemasMovil.length > 14) break;
  }

  /* 3 · Líneas de texto demasiado largas para leer en el celular */
  document.querySelectorAll("p").forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width === 0) return;
    var fs = parseFloat(getComputedStyle(el).fontSize);
    var porLinea = Math.round(r.width / (fs * 0.5));
    if (porLinea > 95) {
      problemasMovil.push("línea muy larga: " + porLinea + " caracteres («"
        + el.textContent.trim().slice(0, 30) + "…»)");
    }
  });

  /* 4 · Elementos que se salen por abajo de su contenedor */
  document.querySelectorAll("section, article, aside").forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width === 0) return;
    if (el.scrollHeight > el.clientHeight + 4 && getComputedStyle(el).overflow === "visible") {
      var hijos = Array.prototype.filter.call(el.children, function (h) {
        var hr = h.getBoundingClientRect();
        return hr.height > 0 && hr.bottom > r.bottom + 4;
      });
      if (hijos.length) {
        problemasMovil.push("contenido desbordado en " + el.tagName.toLowerCase()
          + "." + String(el.className).split(" ")[0]);
      }
    }
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
    familiaTitulo: document.querySelector("h1") ? getComputedStyle(document.querySelector("h1")).fontFamily : null,
    msDomContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
    msCarga: Math.round(nav.loadEventEnd || 0),
    recursos: recursos.length,
    pesoKB: Math.round(peso / 1024),
    enlacesInternosRotos: Array.prototype.filter.call(document.querySelectorAll('a[href^="#"]'), function (a) {
      var h = a.getAttribute("href");
      return h.length > 1 && !document.querySelector(h);
    }).map(function (a) { return a.getAttribute("href"); }),
    elementosFaltantes: faltantes,
    problemasMovil: problemasMovil.slice(0, 14),
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
