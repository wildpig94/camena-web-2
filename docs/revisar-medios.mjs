/* ═══════════════════════════════════════════════════════════════
   docs/revisar-medios.mjs — Busca medios deformados y cajas recortadas.

   Uso: node docs/revisar-medios.mjs [base] [páginas] [ancho]

   Por qué existe: la auditoría normal mide desbordes, contraste y tamaño de
   los controles, pero NO mira si una imagen o un video quedó estirado. Así se
   fue un bug a producción: `img, svg, video, canvas` tenían `max-width: 100%`
   sin `height: auto`, así que los videos verticales conservaban el
   height="1280" del HTML y se pintaban de 320×1280 —aplastados— en el celular
   y en el escritorio. Nadie lo vio porque nada se desbordaba: solo se veía mal.

   Compara la proporción pintada contra la del archivo, y reporta las cajas con
   alto fijo cuyo contenido no cabe.
   ═══════════════════════════════════════════════════════════════ */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:8899";
const PAGINAS = (process.argv[3] || "index.html,servicios.html,como-trabajamos.html,producto/control-de-autos.html,aviso-de-privacidad.html,terminos.html").split(",");
const ANCHO = Number(process.argv[4] || 390);
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PERFIL = mkdtempSync(join(tmpdir(), "camena-medios-"));

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
let n = 0; const pend = new Map(); const consola = [];
ws.onmessage = (ev) => { const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { const { resolver, rechazar } = pend.get(m.id); pend.delete(m.id);
    m.error ? rechazar(new Error(JSON.stringify(m.error))) : resolver(m.result); }
  else if (m.method === "Runtime.exceptionThrown") consola.push(m.params.exceptionDetails.text);
  else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
    consola.push(m.params.args.map((a) => a.value ?? a.type).join(" ")); };
const enviar = (method, params = {}) => new Promise((res, rej) => {
  const id = ++n; pend.set(id, { resolver: res, rechazar: rej });
  ws.send(JSON.stringify({ id, method, params })); });
await enviar("Runtime.enable"); await enviar("Page.enable");
await enviar("Emulation.setDeviceMetricsOverride", { width: ANCHO, height: 844, deviceScaleFactor: 2, mobile: true });
const evaluar = async (e) => { const r = await enviar("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };

const informe = {};
for (const p of PAGINAS) {
  await enviar("Page.navigate", { url: `${BASE}/${p}` });
  await esperar(2200);
  /* Todas las imágenes y videos a la vista, para que carguen de verdad */
  await evaluar(`(async () => {
    document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
    for (const i of document.querySelectorAll('img,video')) {
      i.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise(r => setTimeout(r, 90));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(r => setTimeout(r, 400));
  })()`);
  await esperar(1500);

  informe[p] = await evaluar(`(() => {
    const salida = { medios: [], recortados: [], altoDocumento: document.documentElement.scrollHeight,
                     desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    /* 1 · Medios deformados */
    document.querySelectorAll('img, video, canvas, svg').forEach((m) => {
      const r = m.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      let natX = m.naturalWidth || 0, natY = m.naturalHeight || 0;
      if (!natX && m.getAttribute && m.getAttribute('width')) {
        natX = Number(m.getAttribute('width')); natY = Number(m.getAttribute('height'));
      }
      if (!natX || !natY) return;
      const real = natX / natY, pintado = r.width / r.height;
      const desvio = Math.abs(pintado - real) / real;
      if (desvio > 0.06) {
        salida.medios.push({ que: m.tagName.toLowerCase(),
          archivo: String(m.currentSrc || m.src || m.poster || '').split('/').pop().slice(0, 30),
          archivoDice: natX + 'x' + natY, pintado: Math.round(r.width) + 'x' + Math.round(r.height),
          desvio: Math.round(desvio * 100) + '%' });
      }
    });
    /* 2 · Cajas con alto fijo cuyo contenido no cabe */
    document.querySelectorAll('*').forEach((e) => {
      const st = getComputedStyle(e);
      if (st.display === 'none' || st.visibility === 'hidden') return;
      const altoFijo = st.height !== 'auto' && st.maxHeight !== 'none' && e.clientHeight > 0;
      if (!altoFijo) return;
      if (e.scrollHeight > e.clientHeight + 4 && (st.overflow === 'hidden' || st.overflowY === 'hidden')) {
        salida.recortados.push({ etiqueta: e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0],
          alto: st.height, cabe: e.clientHeight, necesita: e.scrollHeight,
          texto: (e.textContent || '').trim().slice(0, 40) });
      }
    });
    salida.recortados = salida.recortados.slice(0, 8);
    return salida;
  })()`);
}
informe.consola = consola;
console.log(JSON.stringify(informe, null, 1));
chrome.kill("SIGKILL");
