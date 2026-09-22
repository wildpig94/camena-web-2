#!/usr/bin/env node
/**
 * docs/medir-fichas.mjs — ¿La ficha de un renglón tapa lo que tiene debajo?
 *
 * Por qué existe: las auditorías (docs/movil.mjs) revisan la página con las
 * fichas CERRADAS, que es como se ve al cargar. Abiertas son otra página: cada
 * ficha mide entre 220 y 270 px y flota sobre los renglones siguientes. Ya pasó
 * que cinco de las ocho fichas de la banda de sistemas taparan la nota y los
 * botones del pie, y ninguna medición lo vio, porque nadie las abría.
 *
 * Este script abre las fichas una por una, a la medida, y avisa de tres cosas:
 *   1. cuántas fichas pisan la nota o el pie de su propia banda,
 *   2. si alguna se sale de la tarjeta o de la pantalla a lo ancho,
 *   3. si el documento desborda horizontalmente con las fichas abiertas.
 *
 * Uso:  node docs/medir-fichas.mjs <url> [ancho] [alto]
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL = process.argv[2] || "http://127.0.0.1:8899/index.html";
const ANCHO = Number(process.argv[3] || 1440);
const ALTO = Number(process.argv[4] || 900);
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PERFIL = mkdtempSync(join(tmpdir(), "camena-fichas-"));

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox",
  "--disable-gpu", "--disable-software-rasterizer", "--disable-gpu-compositing",
  "--disable-dev-shm-usage", "--hide-scrollbars", "--remote-debugging-port=0",
  `--user-data-dir=${PERFIL}`, "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const puerto = await new Promise((res, rej) => {
  let b = "";
  const t = setTimeout(() => rej(new Error("Chrome no anunció su puerto")), 25000);
  chrome.stderr.on("data", (s) => {
    b += String(s);
    const m = b.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
    if (m) { clearTimeout(t); res(Number(m[1])); }
  });
  chrome.on("error", rej);
});

const wsUrl = await (async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const l = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
      const p = l.find((t) => t.type === "page");
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch {}
    await esperar(200);
  }
  throw new Error("no apareció la pestaña");
})();

const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) {
    const { res, rej } = pend.get(m.id);
    pend.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};
const env = (me, pa = {}) => new Promise((res, rej) => {
  const i = ++id; pend.set(i, { res, rej });
  ws.send(JSON.stringify({ id: i, method: me, params: pa }));
});
const ev = async (expr) => {
  const r = await env("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

await env("Runtime.enable");
await env("Page.enable");
await env("Emulation.setDeviceMetricsOverride", {
  width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: ANCHO < 600,
});
await env("Page.navigate", { url: URL });
await esperar(2800);

const informe = await ev(`(() => {
  document.documentElement.style.scrollBehavior = "auto";
  const solapa = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  const bandas = [];
  const fallosContraste = [];
  let desborde = 0, fueraDeTarjeta = 0, fueraDePantalla = 0, totalFichas = 0, pisan = 0;
  let muestras = [];
  const todas = [];
  let totalMuestras = 0;

  document.querySelectorAll(".etapa").forEach((cont) => {
    /* Las fichas dejaron de ser un botón con aria-expanded y son <details>
       nativos (.sistema): se abren con la propiedad open, no con data-abierto.
       Se aceptan
       las dos formas para que este medidor sirva también en una página que
       todavía tenga el componente viejo. */
    const tabla = cont.querySelector(".tarifa");
    const fichas = [...cont.querySelectorAll(".sistema, .servicios__globo")];
    if (!fichas.length) return;
    const pie = cont.querySelector(".etapa__pie");
    const nota = cont.querySelector(".etapa__nota");
    const rc = cont.getBoundingClientRect();
    let malas = 0;
    const altos = [];
    muestras = [];

    fichas.forEach((g) => {
      if (g.tagName === "DETAILS") g.open = true; else g.setAttribute("data-abierto", "si");
      const b = g.getBoundingClientRect();
      /* Las medidas del pie y de la nota se toman DESPUÉS de abrir: si la ficha
         entra en el flujo, empuja todo lo que viene abajo, y comparar contra la
         posición anterior daría un solape que ya no existe. */
      const rp = pie ? pie.getBoundingClientRect() : null;
      const rn = nota ? nota.getBoundingClientRect() : null;

      /* Contraste DENTRO de la ficha. La auditoría general no puede verlo: con
         la ficha cerrada es display: none, y lo que no se pinta no se mide.
         Aquí se abre y se mide cada texto contra su fondo real. */
      const lum = (rgb) => {
        const c = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      };
      /* Sin \d: la expresión viaja dentro de una plantilla de JavaScript y una
         barra invertida se pierde por el camino. Con [0-9.] no hay duda. */
      const num = (s) => (s.match(/[0-9.]+/g) || []).map(Number);
      const fondo = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = num(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c.slice(0, 3);
          n = n.parentElement;
        }
        return [255, 255, 255];
      };
      g.querySelectorAll("p, li, strong").forEach((el) => {
        if (!el.textContent.trim()) return;
        const a = lum(num(getComputedStyle(el).color).slice(0, 3));
        const b = lum(fondo(el));
        const r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        const px = parseFloat(getComputedStyle(el).fontSize);
        const peso = Number(getComputedStyle(el).fontWeight) || 400;
        const grande = px >= 24 || (px >= 18.66 && peso >= 700);
        const minimo = grande ? 3 : 4.5;
        muestras.push({ que: el.className || el.tagName.toLowerCase(), color: getComputedStyle(el).color, r: Math.round(r * 100) / 100, minimo });
        totalMuestras++;
        if (r < minimo) fallosContraste.push({ donde: cont.className.split(" ")[0] + " › " + g.id, texto: el.textContent.trim().slice(0, 48), r: Math.round(r * 100) / 100, minimo });
      });
      altos.push(Math.round(b.height));
      totalFichas++;
      if ((rp && solapa(b, rp)) || (rn && solapa(b, rn))) { malas++; pisan++; }
      if (b.left < rc.left - 1 || b.right > rc.right + 1) fueraDeTarjeta++;
      if (b.left < -1 || b.right > document.documentElement.clientWidth + 1) fueraDePantalla++;
      const d = document.documentElement;
      desborde = Math.max(desborde, d.scrollWidth - d.clientWidth);
      if (g.tagName === "DETAILS") g.open = false; else g.removeAttribute("data-abierto");
    });

    todas.push(...muestras);
    bandas.push({
      banda: [...cont.classList].filter((c) => c.startsWith("etapa--")).join(","),
      filas: tabla ? tabla.querySelectorAll("tbody tr").length : cont.querySelectorAll(".sistema").length,
      fichas: fichas.length,
      conIncluye: cont.querySelectorAll(".servicios__etiqueta").length,
      altoFicha: altos.length ? Math.min(...altos) + "–" + Math.max(...altos) : "",
      pisanNotaOPie: malas,
    });
  });

  return { ancho: ${ANCHO}, bandas, totalFichas, pisanNotaOPie: pisan, fueraDeTarjeta, fueraDePantalla, desborde, fallosContraste, totalMuestras, peores: todas.sort((a, b) => a.r - b.r).slice(0, 4) };
})()`);

console.log(`  ${informe.ancho} px · ${informe.totalFichas} fichas abiertas una por una\n`);
console.log("  banda                          filas  fichas  con Incluye  alto ficha   pisan nota o pie");
for (const b of informe.bandas) {
  const n = (v, w) => String(v).padEnd(w);
  console.log("  " + n(b.banda, 30) + n(b.filas, 7) + n(b.fichas, 8) + n(b.conIncluye, 13) + n(b.altoFicha, 13) + b.pisanNotaOPie);
}
console.log("");
console.log(`  fichas que pisan la nota o el pie: ${informe.pisanNotaOPie}`);
console.log(`  fichas que se salen de su tarjeta: ${informe.fueraDeTarjeta}`);
console.log(`  fichas que se salen de la pantalla: ${informe.fueraDePantalla}`);
console.log(`  desborde horizontal del documento: ${informe.desborde} px`);
console.log(`  textos medidos dentro de las fichas abiertas: ${informe.totalMuestras}`);
console.log("  los cuatro más apretados: " + informe.peores.map((p) => `${p.que || p.color} ${p.r}:1`).join("  ·  "));
if (informe.fallosContraste.length) {
  console.log("\n  ✗ Texto que no se lee dentro de una ficha:");
  for (const f of informe.fallosContraste) {
    console.log(`     ${f.donde}: ${f.r}:1 (mínimo ${f.minimo}) — «${f.texto}»`);
  }
} else {
  console.log("  ✓ Todo el texto de las fichas cumple AA contra su fondo real.");
}
console.log(informe.pisanNotaOPie + informe.fueraDeTarjeta + informe.fueraDePantalla + informe.desborde + informe.fallosContraste.length === 0
  ? "\n  ✓ Ninguna ficha tapa el pie ni se sale de su caja."
  : "\n  ✗ Hay fichas que tapan o se salen: revisa cuáles y ajusta desde qué renglón abren hacia arriba.");

chrome.kill("SIGKILL");
process.exit(informe.pisanNotaOPie + informe.fueraDeTarjeta + informe.fueraDePantalla + informe.desborde + informe.fallosContraste.length === 0 ? 0 : 1);
