/* Mide la escalera tipográfica de una página: cuántos tamaños y colores de
   texto distintos se ven de verdad, y cuántas veces se sale de la escalera.

   Uso: node docs/medir-escala.mjs [url] [ancho]

   Por qué existe: el número de tamaños distintos es lo que separa una página
   que se ve cuidada de una que se ve improvisada. Una referencia como Stripe
   usa 8 o 10 en toda la página; nosotros llegamos a tener 21. Esta medición es
   la que dice si la escalera se respeta, sin opinar.

   Las maquetas (.mock-*) quedan fuera a propósito: son ilustraciones de
   interfaz y tienen su propia microescala, como cualquier dibujo. */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PAGINA = process.argv[2] || "http://127.0.0.1:8899/index.html";
const ANCHO = Number(process.argv[3] || 1440);
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PERFIL = mkdtempSync(join(tmpdir(), "camena-esc-"));

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
  "--disable-gpu-compositing", "--disable-dev-shm-usage", "--hide-scrollbars",
  "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${PERFIL}`, "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const puerto = await new Promise((res, rej) => {
  let buf = ""; const lim = setTimeout(() => rej(new Error("sin puerto")), 20000);
  chrome.stderr.on("data", (t) => {
    buf += String(t);
    const m = buf.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
    if (m) { clearTimeout(lim); res(Number(m[1])); }
  });
});
async function objetivo() {
  for (let i = 0; i < 60; i++) {
    try {
      const l = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
      const p = l.find((t) => t.type === "page");
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch {}
    await esperar(200);
  }
  throw new Error("sin objetivo");
}
const ws = new WebSocket(await objetivo());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let n = 0; const pend = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) {
    const { resolver, rechazar } = pend.get(m.id); pend.delete(m.id);
    m.error ? rechazar(new Error(JSON.stringify(m.error))) : resolver(m.result);
  }
};
const enviar = (method, params = {}) => new Promise((res, rej) => {
  const id = ++n; pend.set(id, { resolver: res, rechazar: rej });
  ws.send(JSON.stringify({ id, method, params }));
});
await enviar("Runtime.enable"); await enviar("Page.enable");
await enviar("Emulation.setDeviceMetricsOverride",
  { width: ANCHO, height: 900, deviceScaleFactor: 1, mobile: ANCHO < 700 });
const evaluar = async (e) => {
  const r = await enviar("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};
await enviar("Page.navigate", { url: PAGINA });
await esperar(2600);

const informe = await evaluar(`(() => {
  const tam = new Map(), col = new Map();
  document.querySelectorAll('body *').forEach((el) => {
    if (el.closest('.mock, [class*="mock-"]')) return;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return;
    if (!el.textContent.trim() || el.children.length) return;
    const px = Math.round(parseFloat(st.fontSize) * 10) / 10;
    if (!tam.has(px)) tam.set(px, []);
    if (tam.get(px).length < 3 && el.className) {
      tam.get(px).push(String(el.className).split(' ')[0]);
    }
    col.set(st.color, (col.get(st.color) || 0) + 1);
  });
  const tamanos = [...tam.entries()].sort((a, b) => b[0] - a[0]);
  return {
    pagina: location.pathname,
    ancho: window.innerWidth,
    totalTamanos: tamanos.length,
    tamanos: tamanos.map(([px, ejemplos]) => px + ' px  (' + ejemplos.join(', ') + ')'),
    totalColores: col.size,
    colores: [...col.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => c + '  ×' + n),
  };
})()`);

console.log(JSON.stringify(informe, null, 1));
chrome.kill("SIGKILL");
