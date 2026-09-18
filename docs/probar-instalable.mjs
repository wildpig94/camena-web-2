#!/usr/bin/env node
/**
 * docs/probar-instalable.mjs — ¿Esto ya es un programa instalable?
 *
 * Por qué existe: la app del taller nació como un archivo HTML suelto. Un archivo
 * dentro de la carpeta de Descargas no es un lugar donde vivir: el navegador
 * puede borrar sus datos cuando le falte espacio, y en el teléfono ni siquiera
 * abre igual. Convertirla en programa instalable se comprueba o no se comprueba:
 * aquí se piden al navegador sus propias cuentas.
 *
 * Qué revisa, con Chrome:
 *   1. que el manifiesto existe y no tiene errores,
 *   2. que Chrome la considera instalable (su lista de errores viene vacía),
 *   3. que el service worker quedó activo y controlando la página,
 *   4. que pidió almacenamiento permanente,
 *   5. y lo que de verdad importa: que **sin internet abra y deje capturar**.
 *
 * Uso:  node docs/probar-instalable.mjs [url]
 *
 * El servidor tiene que servir la carpeta del producto, porque el service worker
 * solo existe con https o en local:
 *   cd ~/productos-camena && python3 -m http.server 8900 --bind 127.0.0.1
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL = process.argv[2] || "http://127.0.0.1:8900/control-de-autos/control-de-autos.html";
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PERFIL = mkdtempSync(join(tmpdir(), "camena-instalable-"));

const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", "--disable-gpu",
  "--disable-software-rasterizer", "--disable-gpu-compositing", "--disable-dev-shm-usage",
  "--hide-scrollbars", "--remote-debugging-port=0", `--user-data-dir=${PERFIL}`, "about:blank"],
  { stdio: ["ignore", "pipe", "pipe"] });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const puerto = await new Promise((res, rej) => {
  let b = ""; const t = setTimeout(() => rej(new Error("Chrome no anunció su puerto")), 25000);
  chrome.stderr.on("data", (s) => { b += String(s); const m = b.match(/ws:\/\/127\.0\.0\.1:(\d+)\//); if (m) { clearTimeout(t); res(Number(m[1])); } });
  chrome.on("error", rej);
});
const wsUrl = await (async () => {
  for (let i = 0; i < 60; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(); const p = l.find((t) => t.type === "page"); if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl; } catch {}
    await esperar(200);
  }
  throw new Error("no apareció la pestaña");
})();
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map(); const errores = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
};
const env = (me, pa = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: me, params: pa })); });
const ev = async (x) => { const r = await env("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

await env("Runtime.enable"); await env("Page.enable"); await env("Network.enable");
await env("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

/* 1 · Primera visita, con internet: aquí se guarda todo para después. */
await env("Page.navigate", { url: URL });
await esperar(3000);

const manifiesto = await env("Page.getAppManifest");
const datos = manifiesto.data ? JSON.parse(manifiesto.data) : {};
const instalacion = (await env("Page.getInstallabilityErrors")).installabilityErrors || [];
await esperar(1500);

const informe = {
  url: URL,
  manifiesto: { nombre: datos.name || null, corto: datos.short_name || null, inicio: datos.start_url || null, errores: manifiesto.errors || [] },
  erroresDeInstalacion: instalacion,
  serviceWorker: await ev("navigator.serviceWorker.getRegistrations().then(r => r.length ? (r[0].active ? 'activo' : 'instalando') : 'ninguno')"),
  almacenamientoPermanente: await ev("navigator.storage.persisted ? navigator.storage.persisted().then(p => p ? 'concedido' : 'pedido') : 'no aplica'"),
  abrioConInternet: await ev("!!document.querySelector('h1')"),
};

/* 2 · Se corta la red y se recarga: lo que promete un programa instalable. */
await env("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
await env("Page.reload");
await esperar(2600);
informe.sinInternet = {
  abrio: await ev("!!document.querySelector('h1')"),
  fuentesPropias: await ev("document.fonts.check('600 16px Oswald')"),
  dejaCapturar: await ev(`(() => {
    window.appActions.openAddModal();
    const f = document.getElementById('car-form');
    if (!f) return 'no abrió el formulario';
    f.querySelector('[name=descripcion]').value = 'Auto sin internet';
    f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    return document.body.innerText.includes('Auto sin internet') ? 'sí, y quedó en la lista' : 'no';
  })()`),
};
informe.errores = errores;

/* 3 · Veredicto. */
const fallos = [];
if (informe.manifiesto.errores.length) fallos.push("el manifiesto tiene errores");
if (informe.erroresDeInstalacion.length) fallos.push("Chrome no la considera instalable");
if (informe.serviceWorker !== "activo") fallos.push("el service worker no quedó activo");
if (!informe.abrioConInternet) fallos.push("no abrió con internet");
if (!informe.sinInternet.abrio) fallos.push("sin internet no abrió");
if (informe.sinInternet.dejaCapturar !== "sí, y quedó en la lista") fallos.push("sin internet no deja capturar");
if (errores.length) fallos.push("hubo excepciones en la consola");

console.log(`  ${URL}\n`);
console.log(`  manifiesto ......... ${informe.manifiesto.nombre} (${informe.manifiesto.corto}) → abre en ${informe.manifiesto.inicio}`);
console.log(`  instalable ......... ${informe.erroresDeInstalacion.length === 0 ? "sí: Chrome no tiene ninguna objeción" : "no: " + JSON.stringify(informe.erroresDeInstalacion)}`);
console.log(`  service worker ..... ${informe.serviceWorker}`);
console.log(`  almacenamiento ..... ${informe.almacenamientoPermanente}`);
console.log(`  sin internet ....... abrió: ${informe.sinInternet.abrio} · fuentes: ${informe.sinInternet.fuentesPropias} · deja capturar: ${informe.sinInternet.dejaCapturar}`);
console.log(fallos.length === 0
  ? "\n  ✓ Es un programa instalable y funciona sin internet."
  : "\n  ✗ Falta: " + fallos.join("; ") + ".");

chrome.kill("SIGKILL");
process.exit(fallos.length === 0 ? 0 : 1);
