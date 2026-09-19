#!/usr/bin/env node
/**
 * docs/redes/generar.mjs — Hace las imágenes de las publicaciones.
 *
 * Por qué existe: para subir a redes todos los días hace falta que las piezas
 * salgan con la cara de la casa sin dibujar nada a mano cada vez. Esto toma el
 * texto de `contenido.json`, lo monta sobre la plantilla de CAMENA (sus fuentes,
 * su paleta, sus reglas: sin degradados, un solo acento) y saca el PNG en los
 * tamaños que piden las redes, midiendo si el texto se desborda.
 *
 * Uso:
 *   node docs/redes/generar.mjs                 # todas
 *   node docs/redes/generar.mjs 3 7             # solo los días 3 a 7
 *
 * Salida: docs/redes/salida/<día>-<tema>.png (feed 1080×1350 y historia 1080×1920)
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const SALIDA = join(AQUI, "salida");
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";

const datos = JSON.parse(readFileSync(join(AQUI, "contenido.json"), "utf8"));
const desde = Number(process.argv[2] || 0);
const hasta = Number(process.argv[3] || 9999);

/* Las fuentes van dentro del HTML: así la imagen sale con la tipografía de la casa
   aunque el archivo se abra en cualquier lado, y no depende de que el navegador
   encuentre la carpeta. */
const fuente = (archivo) => "data:font/woff2;base64," +
  readFileSync(join(RAIZ, "assets", "fonts", archivo)).toString("base64");
const JAKARTA = fuente("jakarta-normal-latin.woff2");
const MONO = fuente("jetbrains-mono-latin.woff2");

const escapar = (t) => String(t || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

function plantilla(post, ancho, alto) {
  const oscuro = post.tema === "oscuro";
  const papel = oscuro ? "#111111" : "#F7F6F3";
  const tinta = oscuro ? "#F4F3F0" : "#111111";
  const tenue = oscuro ? "#A8A8A2" : "#5C5C58";
  const filete = oscuro ? "#2B2B2B" : "#E3E1DB";
  const acento = oscuro ? "#E8C766" : "#8A6A0F";
  const margen = Math.round(ancho * 0.089);
  // La historia es más alta: el mismo texto respira más y crece un poco.
  const escala = alto / 1350;
  const t = (px) => Math.round(px * Math.min(1.12, Math.max(0.92, escala)));
  const parrafos = String(post.cuerpo || "").split("\n").filter((l) => l.trim())
    .map((l) => `<p>${escapar(l)}</p>`).join("");

  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8">
<style>
  @font-face{font-family:'Jakarta';src:url(${JAKARTA}) format('woff2');font-weight:400 700;font-display:block}
  @font-face{font-family:'Mono';src:url(${MONO}) format('woff2');font-weight:400 700;font-display:block}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${ancho}px;height:${alto}px;overflow:hidden;background:${papel};color:${tinta};
    font-family:'Jakarta',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .pieza{width:100%;height:100%;padding:${margen}px;display:flex;flex-direction:column}
  .arriba{display:flex;justify-content:space-between;align-items:baseline;
    font-family:'Mono';font-size:${t(24)}px;letter-spacing:.14em;text-transform:uppercase;color:${tenue}}
  .arriba b{color:${acento};font-weight:700}
  .filete{margin-top:${t(20)}px;border-top:1px dotted ${filete}}
  .titulo{margin-top:auto;font-size:${t(92)}px;line-height:1.02;letter-spacing:-.02em;font-weight:700;text-wrap:balance}
  .cuerpo{margin-top:${t(34)}px;font-size:${t(38)}px;line-height:1.42;color:${tenue};max-width:26ch}
  .cuerpo p + p{margin-top:${t(20)}px}
  .pie{margin-top:${t(30)}px;font-size:${t(32)}px;line-height:1.3;font-weight:600;color:${tinta};
    border-left:3px solid ${acento};padding-left:${t(22)}px;max-width:30ch}
  .abajo{margin-top:auto;padding-top:${t(28)}px;border-top:1px solid ${filete};
    display:flex;justify-content:space-between;align-items:baseline;
    font-family:'Mono';font-size:${t(22)}px;letter-spacing:.08em;color:${tenue}}
  .abajo b{color:${tinta};font-weight:700}
</style></head><body>
  <div class="pieza">
    <div class="arriba"><span><b>CAMENA</b> · ${escapar(post.etiqueta)}</span><span>${String(post.dia).padStart(2, "0")}</span></div>
    <div class="filete"></div>
    <h1 class="titulo">${escapar(post.titulo)}</h1>
    <div class="cuerpo">${parrafos}</div>
    <div class="pie">${escapar(post.pie)}</div>
    <div class="abajo"><span>${escapar(datos.pie)}</span><span><b>${escapar(datos.whatsapp)}</b></span></div>
  </div>
</body></html>`;
}

/* ── El navegador, una sola vez para todo el lote ───────────────────────── */
const perfil = mkdtempSync(join(tmpdir(), "redes-"));
const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", "--disable-gpu",
  "--disable-software-rasterizer", "--disable-gpu-compositing", "--disable-dev-shm-usage",
  "--hide-scrollbars", "--allow-file-access-from-files", "--remote-debugging-port=0",
  `--user-data-dir=${perfil}`, "about:blank"], { stdio: ["ignore", "pipe", "pipe"] });
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
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } };
const env = (me, pa = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: me, params: pa })); });
const ev = async (x) => { const r = await env("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };
await env("Runtime.enable"); await env("Page.enable");

mkdirSync(SALIDA, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "redes-html-"));
let hechas = 0, problemas = [];

for (const post of datos.posts) {
  if (post.dia < desde || post.dia > hasta) continue;
  for (const [sufijo, tam] of [["feed", datos.tamano], ["historia", datos.historias]]) {
    const archivo = join(tmp, `p${post.dia}-${sufijo}.html`);
    writeFileSync(archivo, plantilla(post, tam.ancho, tam.alto));
    await env("Emulation.setDeviceMetricsOverride", { width: tam.ancho, height: tam.alto, deviceScaleFactor: 1, mobile: false });
    await env("Page.navigate", { url: "file://" + archivo });
    await esperar(420);
    // ¿Cabe? Si el texto crece más que la pieza, se avisa en vez de sacar un recorte.
    const medida = await ev(`({
      sobra: document.documentElement.scrollHeight - ${tam.alto},
      titulo: document.querySelector('.titulo').getBoundingClientRect().height,
      cuerpo: document.querySelector('.cuerpo').getBoundingClientRect().height,
      pie: document.querySelector('.pie').getBoundingClientRect().height
    })`);
    if (medida.sobra > 2) problemas.push(`día ${post.dia} (${sufijo}): el contenido se pasa ${Math.round(medida.sobra)} px`);
    const r = await env("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: tam.ancho, height: tam.alto, scale: 1 }, captureBeyondViewport: false });
    const destino = join(SALIDA, `${String(post.dia).padStart(2, "0")}-${post.tema}-${sufijo}.png`);
    writeFileSync(destino, Buffer.from(r.data, "base64"));
    hechas++;
  }
}
chrome.kill("SIGKILL");

console.log(`  ${hechas} imágenes en ${SALIDA}`);
if (problemas.length) {
  console.log("\n  ✗ Estas se pasan de alto y hay que acortar el texto:");
  problemas.forEach((p) => console.log("    · " + p));
  process.exit(1);
}
console.log("  ✓ Ninguna se desborda.");
