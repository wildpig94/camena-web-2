#!/usr/bin/env node
/**
 * docs/movil.mjs — Verificación en ancho de móvil real.
 *
 * Por qué existe: Chromium impone un ancho mínimo de ventana de 500 px, así
 * que `--window-size=390` no da 390 px de verdad. Este script usa el protocolo
 * DevTools para emular el ancho exacto, que es la única forma fiable aquí.
 *
 * Uso:
 *   node docs/movil.mjs <url> [ancho] [alto]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL = process.argv[2] || "http://127.0.0.1:8899/index.html";
const ANCHO = Number(process.argv[3] || 390);
const ALTO = Number(process.argv[4] || 844);
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PERFIL = mkdtempSync(join(tmpdir(), "camena-movil-"));

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox",
  "--disable-gpu", "--disable-software-rasterizer", "--disable-gpu-compositing",
  "--disable-dev-shm-usage", "--hide-scrollbars",
  "--remote-debugging-port=0",
  `--user-data-dir=${PERFIL}`,
  "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/* El puerto real lo anuncia Chrome en su salida: con --remote-debugging-port=0
   el sistema elige uno libre, y así no choca con auditorías anteriores. */
async function puertoReal() {
  let buffer = "";
  return new Promise((resolver, rechazar) => {
    const limite = setTimeout(() => rechazar(new Error("Chrome no anunció su puerto")), 20000);
    chrome.stderr.on("data", (trozo) => {
      buffer += String(trozo);
      const m = buffer.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (m) { clearTimeout(limite); resolver(Number(m[1])); }
    });
    chrome.on("error", rechazar);
  });
}

let puerto;
try {
  puerto = await puertoReal();
} catch (e) {
  console.error("✗ " + e.message);
  process.exit(2);
}

async function objetivo() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
      const pagina = lista.find((t) => t.type === "page");
      if (pagina?.webSocketDebuggerUrl) return pagina.webSocketDebuggerUrl;
    } catch { /* aún no levantó */ }
    await esperar(200);
  }
  throw new Error("no se pudo conectar en el puerto " + puerto);
}

const ws = new WebSocket(await objetivo());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let n = 0;
const pendientes = new Map();
const consola = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pendientes.has(m.id)) {
    const { resolver, rechazar } = pendientes.get(m.id);
    pendientes.delete(m.id);
    m.error ? rechazar(new Error(JSON.stringify(m.error))) : resolver(m.result);
  } else if (m.method === "Runtime.exceptionThrown") {
    const ed = m.params.exceptionDetails;
    consola.push(JSON.stringify({
      texto: ed.text,
      linea: ed.lineNumber,
      columna: ed.columnNumber,
      archivo: (ed.url || "").split("/").pop(),
      traza: ed.exception && ed.exception.description
        ? ed.exception.description.split("\n").slice(0, 5).join(" | ") : ""
    }));
  } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    consola.push(m.params.args.map((a) => a.value ?? a.type).join(" "));
  }
};
const enviar = (method, params = {}) => new Promise((resolver, rechazar) => {
  const id = ++n;
  pendientes.set(id, { resolver, rechazar });
  ws.send(JSON.stringify({ id, method, params }));
});

await enviar("Runtime.enable");
await enviar("Page.enable");

/* Aquí está el punto: se emula el dispositivo, no se pide una ventana. */
await enviar("Emulation.setDeviceMetricsOverride", {
  width: ANCHO, height: ALTO, deviceScaleFactor: 2, mobile: true,
});
await enviar("Emulation.setTouchEmulationEnabled", { enabled: true });

await enviar("Page.navigate", { url: URL });
await esperar(1200);

/* Estado final de las animaciones, para medir el diseño y no una transición
   a medias. No cambia el sitio: solo fuerza lo que verá la persona que ya
   recorrió la página. */
await enviar("Runtime.evaluate", {
  expression: `(() => {
    const s = document.createElement("style");
    s.textContent = \`
      .js [data-revelar] { opacity: 1 !important; transform: none !important; transition: none !important; }
      .js .hero__linea, .js .hero__panel { opacity: 1 !important; animation: none !important; transform: none !important; }
      .flotante[data-visible="false"] { opacity: 1 !important; visibility: visible !important; }
    \`;
    document.head.appendChild(s);
  })()`,
});
await esperar(1400);

const evaluar = async (expr) => {
  const r = await enviar("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

const informe = await evaluar(`(() => {
  const d = document.documentElement;
  const ancho = d.clientWidth;

  function visible(el) {
    if (el.closest("[hidden]")) return false;
    /* Se recorre toda la cadena de <details>: un acordeón anidado dentro de
       otro cerrado tampoco se ve, y el más cercano no basta para saberlo. */
    let nodo = el;
    while (nodo && nodo !== document.body) {
      if (nodo.tagName === "DETAILS" && !nodo.open) {
        const resumen = nodo.querySelector(":scope > summary");
        if (!resumen || !resumen.contains(el)) return false;
      }
      nodo = nodo.parentElement;
    }
    if (el.closest(".cabecera, .flotante, .saltar")) return false;
    let n = el;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      n = n.parentElement;
    }
    return true;
  }

  /* 1 · Lo que se sale de la pantalla */
  const fuera = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right > ancho + 1 || r.left < -1) {
      fuera.push(el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0]
        + " [" + Math.round(r.left) + "→" + Math.round(r.right) + "]");
    }
  });

  /* 2 · Texto que se pisa */
  /* Solo se comparan elementos de BLOQUE con texto propio.
     Comparar elementos en línea produce falsos positivos: un <strong> que se
     parte en dos renglones tiene una caja envolvente que se solapa con la del
     que viene, aunque el texto nunca se pise. */
  const textos = Array.prototype.filter.call(
    document.querySelectorAll("p,h1,h2,h3,li,dt,dd,blockquote,summary"),
    (el) => {
      if (el.textContent.trim().length < 2) return false;
      if (!visible(el)) return false;
      return getComputedStyle(el).display !== "inline";
    }
  ).slice(0, 400);
  const pisados = [];
  for (let i = 0; i < textos.length; i++) {
    const a = textos[i].getBoundingClientRect();
    if (!a.width || !a.height) continue;
    for (let j = i + 1; j < textos.length; j++) {
      const b = textos[j].getBoundingClientRect();
      if (!b.width || !b.height) continue;
      const sx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const sy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (sx > 4 && sy > 4) {
        if (textos[i].contains(textos[j]) || textos[j].contains(textos[i])) continue;
        pisados.push({
          a: textos[i].tagName + "." + String(textos[i].className).split(" ")[0] + " «" + textos[i].textContent.trim().replace(/\s+/g, " ").slice(0, 16) + "»",
          b: textos[j].tagName + "." + String(textos[j].className).split(" ")[0] + " «" + textos[j].textContent.trim().replace(/\s+/g, " ").slice(0, 16) + "»",
          cajaA: Math.round(a.top) + "–" + Math.round(a.bottom) + " x " + Math.round(a.left) + "–" + Math.round(a.right),
          cajaB: Math.round(b.top) + "–" + Math.round(b.bottom) + " x " + Math.round(b.left) + "–" + Math.round(b.right),
          solapeY: Math.round(sy), solapeX: Math.round(sx)
        });
        break;
      }
    }
    if (pisados.length > 10) break;
  }

  /* 3 · Objetivos táctiles */
  const pequenos = [];
  document.querySelectorAll("a,button,summary,input,select").forEach((el) => {
    if (!visible(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)) {
      const cs2 = getComputedStyle(el);
      pequenos.push({
        texto: el.textContent.trim().slice(0, 30) || el.tagName,
        tag: el.tagName, clase: String(el.className).slice(0, 30),
        ancho: Math.round(r.width), alto: Math.round(r.height),
        display: cs2.display, padTop: cs2.paddingTop, padBottom: cs2.paddingBottom,
        padre: el.parentElement ? el.parentElement.className : ""
      });
    }
  });

  /* 4 · Contraste del texto renderizado, con fondos compuestos */
  const nums = (c) => (c.match(/[\\d.]+/g) || []).map(Number);
  const alpha = (c) => { const p = nums(c); return c.indexOf("rgba") === 0 && p.length > 3 ? p[3] : 1; };
  const rgb = (c) => nums(c).slice(0, 3);
  const compone = (f, b) => { const a = alpha(f), x = rgb(f), y = rgb(b);
    return "rgb(" + x.map((v, i) => Math.round(v * a + y[i] * (1 - a))).join(",") + ")"; };
  const lum = (c) => { const p = rgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]; };
  const fondoReal = (el) => { const capas = []; let n = el;
    while (n && n !== document.documentElement) { const bg = getComputedStyle(n).backgroundColor;
      if (alpha(bg) > 0) capas.push(bg); if (alpha(bg) === 1) break; n = n.parentElement; }
    let r = "rgb(255,255,255)";
    for (let i = capas.length - 1; i >= 0; i--) r = compone(capas[i], r);
    return r; };

  const contraste = [];
  textos.forEach((el) => {
    const cs = getComputedStyle(el);
    if (alpha(cs.color) === 0 || cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") return;
    const bg = fondoReal(el);
    const fg = alpha(cs.color) < 1 ? compone(cs.color, bg) : cs.color;
    const l1 = lum(fg), l2 = lum(bg);
    const cr = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    const min = grande ? 3 : 4.5;
    if (cr < min) contraste.push({ texto: el.textContent.trim().slice(0, 40), ratio: Number(cr.toFixed(2)), px: Math.round(px), fg, bg });
  });

  const vistos = new Set();
  const contrasteUnico = contraste.filter((f) => { const k = f.texto + f.ratio; if (vistos.has(k)) return false; vistos.add(k); return true; });

  return {
    anchoEmulado: ancho,
    altoEmulado: window.innerHeight,
    anchoDocumento: d.scrollWidth,
    desbordeHorizontal: d.scrollWidth > ancho ? d.scrollWidth - ancho : 0,
    altoDocumento: d.scrollHeight,
    fueraDePantalla: fuera.slice(0, 12),
    textoPisado: pisados,
    objetivosPequenos: pequenos.slice(0, 10),
    totalObjetivosPequenos: pequenos.length,
    contraste: contrasteUnico.slice(0, 12),
    totalFallosContraste: contrasteUnico.length,
    medidaEnlace: (() => {
      const a = document.querySelector(".flujo__enlace a");
      if (!a) return "no existe";
      const cs = getComputedStyle(a), r = a.getBoundingClientRect();
      return { alto: Math.round(r.height), display: cs.display,
               padTop: cs.paddingTop, padBottom: cs.paddingBottom, lh: cs.lineHeight };
    })(),
  };
})()`);

const captura = process.env.SHOT;
if (captura) {
  mkdirSync("/tmp/camena-shots", { recursive: true });
  await enviar("Emulation.setDeviceMetricsOverride", {
    width: ANCHO, height: Math.min(informe.altoDocumento, 20000), deviceScaleFactor: 1, mobile: true,
  });
  await esperar(900);
  const { data } = await enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  writeFileSync(`/tmp/camena-shots/${captura}.png`, Buffer.from(data, "base64"));
  informe.captura = `/tmp/camena-shots/${captura}.png`;
}

console.log(JSON.stringify({ informe, consola }, null, 2));

ws.close();
chrome.kill("SIGKILL");
process.exit(0);
