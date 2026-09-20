#!/usr/bin/env node
/**
 * docs/capturar-prototipo.mjs — Saca las capturas del sistema desde el prototipo.
 *
 * Por qué existe: en la página publicada estaban las capturas del sistema que se
 * construyó para un cliente, con datos de su operación (coches, placas y folios de
 * siniestro). Este repositorio es de CAMENA y es público, así que aquí no va nada
 * de un cliente. Lo que se enseña es el prototipo —el que no lleva el nombre de
 * ningún taller— con datos de ejemplo inventados y marcados como tales.
 *
 * Uso:
 *   node docs/capturar-prototipo.mjs            # deja los PNG y los webp listos
 *   node docs/capturar-prototipo.mjs --probar   # solo mide, no escribe en el sitio
 *
 * Salida: docs/capturas-prototipo/<nombre>.png (2480×1800) y
 *         assets/producto/<nombre>.webp (1240×900, el tamaño que usa la página).
 *
 * Las capturas se toman al doble de resolución y se reducen: así el texto sale con
 * antialiasing gris y sin las franjas de color que deja el subpíxel al reescalar.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const PROTOTIPO = "/home/alexis/productos-camena/plantillas/control-de-autos-base";
const SALIDA = join(AQUI, "capturas-prototipo");
const DESTINO = join(RAIZ, "assets", "producto");
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PUERTO = 8931;
const ANCHO = 1240, ALTO = 900, ESCALA = 2;
const PROBAR = process.argv.includes("--probar");

/* Datos de ejemplo. A propósito se ven como de ejemplo: las placas son AAA-000-A y
   los folios dicen DEMO, para que nadie confunda una captura con el coche de
   alguien. Las fechas se calculan contra hoy para que el conteo de días tenga
   sentido en la pantalla. */
const hoy = new Date();
const hace = (dias) => new Date(hoy.getTime() - dias * 86400000).toISOString().slice(0, 10);
const EJEMPLO = [
  { id: "e1", estado: "en_taller", descripcion: "Sedán 2021, golpe en salpicadera derecha", color: "Gris plata",
    placa: "AAA-000-A", aseguradora: "GNP", folio: "DEMO-0001", vin: "", fechaEntrada: hace(12), fechaSalida: null, notas: "", piezas: [] },
  { id: "e2", estado: "en_taller", descripcion: "Camioneta 2019, defensa delantera y cofre", color: "Rojo",
    placa: "BBB-111-B", aseguradora: "AXA", folio: "DEMO-0002", vin: "", fechaEntrada: hace(8), fechaSalida: null, notas: "", piezas: [] },
  { id: "e3", estado: "en_taller", descripcion: "Compacto 2022, puerta trasera izquierda", color: "Blanco",
    placa: "CCC-222-C", aseguradora: "HDI", folio: "DEMO-0003", vin: "", fechaEntrada: hace(3), fechaSalida: null, notas: "", piezas: [] },
  { id: "e4", estado: "entregado", descripcion: "Sedán 2020, espejo y costado derecho", color: "Azul",
    placa: "DDD-333-D", aseguradora: "GNP", folio: "DEMO-0004", vin: "", fechaEntrada: hace(35), fechaSalida: hace(9), notas: "", piezas: [] },
];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── El servidor de archivos, para que la app corra como corre de verdad ──── */
const servidor = spawn("python3", ["-m", "http.server", String(PUERTO), "--bind", "127.0.0.1"], {
  cwd: PROTOTIPO, stdio: "ignore", detached: false,
});
await esperar(900);

/* ── El navegador ────────────────────────────────────────────────────────── */
const perfil = mkdtempSync(join(tmpdir(), "captura-prototipo-"));
const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", "--disable-gpu",
  "--disable-software-rasterizer", "--disable-dev-shm-usage", "--hide-scrollbars",
  "--disable-lcd-text", "--remote-debugging-port=0",
  `--user-data-dir=${perfil}`, "about:blank"], { stdio: ["ignore", "pipe", "pipe"] });
const puertoCdp = await new Promise((res, rej) => {
  let b = ""; const t = setTimeout(() => rej(new Error("Chrome no anunció su puerto")), 25000);
  chrome.stderr.on("data", (s) => { b += String(s); const m = b.match(/ws:\/\/127\.0\.0\.1:(\d+)\//); if (m) { clearTimeout(t); res(Number(m[1])); } });
  chrome.on("error", rej);
});
const ws = new WebSocket((await (await fetch(`http://127.0.0.1:${puertoCdp}/json/list`)).json()).find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } };
const env = (me, pa = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: me, params: pa })); });
const ev = async (x) => { const r = await env("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };

await env("Page.enable"); await env("Runtime.enable");
await env("Emulation.setDeviceMetricsOverride", { width: ANCHO, height: ALTO, deviceScaleFactor: ESCALA, mobile: false });

/* El prototipo trae «Nombre del taller» como marcador, para que quien lo instale lo
   llene. En una captura publicada eso se lee como descuido, así que en las capturas
   dice «Taller de ejemplo»: es el prototipo, no el taller de nadie. Hay que
   aplicarlo antes de cada captura, porque la app repinta el encabezado cada vez que
   cambia de pestaña. */
const arreglarEncabezado = `(() => {
  const h = document.querySelector('.brand h1');
  if (h && h.firstChild) h.firstChild.textContent = 'Taller de ejemplo';
  document.querySelectorAll('[class*=instalar]').forEach((e) => e.remove());
  return true;
})()`;

const capturar = async (nombre, pasos = "") => {
  await esperar(500);
  if (pasos) { await ev(pasos); await esperar(500); }
  await ev(arreglarEncabezado);
  await esperar(120);
  const r = await env("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: ANCHO, height: ALTO, scale: 1 }, captureBeyondViewport: false });
  writeFileSync(join(SALIDA, `${nombre}.png`), Buffer.from(r.data, "base64"));
  console.log(`  · ${nombre}.png`);
};

mkdirSync(SALIDA, { recursive: true });
await env("Page.navigate", { url: `http://127.0.0.1:${PUERTO}/index.html` });
await esperar(1200);

// Los datos de ejemplo entran antes de que la app lea: se siembran y se recarga.
await ev(`(() => {
  localStorage.setItem('taller_autos_v1', ${JSON.stringify(JSON.stringify(EJEMPLO))});
  return true;
})()`);
await env("Page.reload");
await esperar(1400);

/* El encabezado se arregla dentro de cada captura (ver arriba). */
await capturar("autos-tablero");

await capturar("autos-historial", "window.__setTab('historial')");
await capturar("autos-aseguradoras", "window.appActions.openSettingsModal()");

chrome.kill("SIGKILL");
servidor.kill("SIGKILL");

/* ── Los webp que usa la página: 1240×900, reducidos desde el doble ──────── */
if (!PROBAR) {
  const py = spawn("python3", ["-c", `
from PIL import Image
import pathlib
salida = pathlib.Path("${SALIDA}")
destino = pathlib.Path("${DESTINO}")
for p in sorted(salida.glob("*.png")):
    im = Image.open(p).convert("RGB").resize((${ANCHO}, ${ALTO}), Image.LANCZOS)
    d = destino / (p.stem + ".webp")
    im.save(d, "WEBP", quality=88, method=6)
    print(f"  · {d.name} {im.size} {d.stat().st_size // 1024} KB")
`], { stdio: "inherit" });
  await new Promise((r) => py.on("exit", r));
}
rmSync(perfil, { recursive: true, force: true });
console.log(`\n  Capturas en ${SALIDA}`);
