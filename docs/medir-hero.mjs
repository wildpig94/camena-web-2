/* Mide el hero con números: jerarquía, líneas, ritmo, tamaños y colores.
   Uso: node docs/medir-hero.mjs [url] [ancho] [alto] */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PAGINA = process.argv[2] || "http://127.0.0.1:8899/index.html";
const ANCHO = Number(process.argv[3] || 1440);
const ALTO = Number(process.argv[4] || 900);
const CAPTURAS = process.argv[5] || "";
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PERFIL = mkdtempSync(join(tmpdir(), "camena-hero-"));

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
  "--disable-gpu-compositing", "--disable-dev-shm-usage", "--hide-scrollbars",
  "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${PERFIL}`, "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const puerto = await new Promise((res, rej) => {
  let buf = ""; const lim = setTimeout(() => rej(new Error("sin puerto")), 20000);
  chrome.stderr.on("data", (t) => { buf += String(t);
    const m = buf.match(/ws:\/\/127\.0\.0\.1:(\d+)\//); if (m) { clearTimeout(lim); res(Number(m[1])); } });
});
async function objetivo() {
  for (let i = 0; i < 60; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
      const p = l.find((t) => t.type === "page"); if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch {}
    await esperar(200);
  }
  throw new Error("sin objetivo");
}
const ws = new WebSocket(await objetivo());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let n = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { const { resolver, rechazar } = pend.get(m.id); pend.delete(m.id);
    m.error ? rechazar(new Error(JSON.stringify(m.error))) : resolver(m.result); } };
const enviar = (method, params = {}) => new Promise((res, rej) => {
  const id = ++n; pend.set(id, { resolver: res, rechazar: rej });
  ws.send(JSON.stringify({ id, method, params })); });
await enviar("Runtime.enable"); await enviar("Page.enable");
await enviar("Emulation.setDeviceMetricsOverride",
  { width: ANCHO, height: ALTO, deviceScaleFactor: 2, mobile: ANCHO < 700 });
const evaluar = async (e) => { const r = await enviar("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };

await enviar("Page.navigate", { url: PAGINA });
await esperar(2600);
await evaluar(`(() => { const s = document.createElement('style');
  s.textContent='.js [data-revelar]{opacity:1!important;transform:none!important;transition:none!important}';
  document.head.appendChild(s); })()`);
await esperar(900);
if (CAPTURAS) {
  mkdirSync(CAPTURAS, { recursive: true });
  const r = await enviar("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(CAPTURAS, `hero-${ANCHO}.png`), Buffer.from(r.data, "base64"));
}

const m = await evaluar(`(() => {
  const px = (v) => Math.round(parseFloat(v) * 10) / 10;
  const q = (s) => document.querySelector(s);
  const t = q('.hero__titulo'), e = q('.hero__entrada'), s = q('.sello'),
        b = q('.hero__hecho, .hero__hechos'), a = q('.hero__acciones'), c = q('.hero__somos');
  const cs = (el) => el ? getComputedStyle(el) : null;
  const altoLinea = (el) => el ? px(cs(el).lineHeight) : null;
  const tituloAlto = t ? Math.round(t.getBoundingClientRect().height) : 0;
  const lh = t ? parseFloat(cs(t).lineHeight) : 1;
  /* líneas reales del titular: rango de los rects de cada línea de texto */
  let lineas = 0;
  if (t) {
    const r = document.createRange(); r.selectNodeContents(t);
    const rects = [...r.getClientRects()].filter(x => x.height > 4 && x.width > 4);
    lineas = rects.length;
  }
  /* caracteres por línea, medidos con la fuente real */
  let carPorLinea = [];
  if (t) {
    const spans = [...t.querySelectorAll('.hero__linea')];
    spans.forEach((sp) => {
      const r = document.createRange(); r.selectNodeContents(sp);
      const rects = [...r.getClientRects()].filter(x => x.height > 4 && x.width > 4);
      const anchoMedio = rects.reduce((acc, x) => acc + x.width, 0) / (rects.length || 1);
      const anchoCar = (() => { const can = document.createElement('span');
        can.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs(sp).font;
        can.textContent = sp.textContent.trim(); document.body.appendChild(can);
        const w = can.getBoundingClientRect().width / Math.max(1, sp.textContent.trim().length);
        can.remove(); return w; })();
      carPorLinea.push({ texto: sp.textContent.trim(), lineas: rects.length,
                         anchoMedio: Math.round(anchoMedio), carPorLinea: Math.round(anchoMedio / anchoCar) });
    });
  }
  const fs = (el) => el ? px(cs(el).fontSize) : null;
  const colores = new Set(), tamanos = new Set();
  (q('#inicio') ? [...q('#inicio').querySelectorAll('*')] : []).forEach((el) => {
    const st = getComputedStyle(el);
    if (st.display === 'none' || !el.textContent.trim()) return;
    if (el.children.length === 0) { colores.add(st.color); tamanos.add(px(st.fontSize)); }
  });
  const ratio = fs(t) && fs(e) ? Math.round((fs(t) / fs(e)) * 100) / 100 : null;
  const ritmo = [];
  const orden = ['.sello', '.hero__titulo', '.hero__precios-breve', '.hero__entrada', '.hero__acciones', '.hero__hechos', '.hero__somos'];
  let previo = null;
  orden.forEach((sel) => { const el = q(sel); if (!el) return;
    const r = el.getBoundingClientRect();
    if (previo !== null) ritmo.push({ entre: previo + ' → ' + sel, hueco: Math.round(r.top - previo_fin) });
    previo = sel; previo_fin = r.bottom; });
  var previo_fin;
  return {
    titular: { tamano: fs(t), interlineado: cs(t) ? cs(t).lineHeight : null, apretado: cs(t) ? cs(t).letterSpacing : null,
               lineasReales: lineas, alto: tituloAlto, carPorLinea },
    entrada: { tamano: fs(e), lineas: e ? Math.round(e.getBoundingClientRect().height / parseFloat(cs(e).lineHeight)) : null,
               maxAncho: cs(e) ? cs(e).maxWidth : null, palabras: e ? e.textContent.trim().split(/\\s+/).length : null },
    cierre: { tamano: fs(c), palabras: c ? c.textContent.trim().split(/\\s+/).length : null,
              maxAncho: cs(c) ? cs(c).maxWidth : null },
    sello: { tamano: fs(s) },
    proporcionTituloEntrada: ratio,
    tamanosDistintos: [...tamanos].sort((x, y) => y - x),
    coloresDistintos: [...colores],
    altoHero: q('#inicio') ? Math.round(q('#inicio').getBoundingClientRect().height) : null,
    cabenEnPrimeraPantalla: (() => { const h = q('#inicio'); if (!h) return null;
      const r = h.getBoundingClientRect(); return r.height <= window.innerHeight; })(),
    altoVentana: window.innerHeight,
  };
})()`);

console.log(JSON.stringify(m, null, 1));
chrome.kill("SIGKILL");
