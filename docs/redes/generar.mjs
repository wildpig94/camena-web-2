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
const SALIDA = process.env.CAMENA_REDES_SALIDA || join(AQUI, "salida");
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";

const datos = JSON.parse(readFileSync(join(AQUI, "contenido.json"), "utf8"));
/* A veces solo hacen falta los textos (cuando las imágenes ya están hechas):
   con CAMENA_REDES_SIN_IMAGENES=1 se salta el dibujado y se escriben nada más
   los .txt, el calendario y la hoja de contactos. */
const SIN_IMAGENES = process.env.CAMENA_REDES_SIN_IMAGENES === "1";
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
  /* La historia es más alta y se ve a pantalla completa, así que el tipo crece más
     que el lienzo (hasta 1.3) y el bloque de texto se centra entre el filete y el
     pie. Medido: con el crecimiento anterior (1.12) y el texto pegado arriba, la
     historia dejaba hasta 906 px de vacío de un total de 1920, casi la mitad de la
     pantalla vacía. */
  const escala = alto / 1350;
  const esHistoria = alto > 1500;
  const t = (px) => Math.round(px * Math.min(esHistoria ? 1.3 : 1.12, Math.max(0.92, escala)));
  const bloque = esHistoria ? ' bloque--centrado' : '';
  const parrafos = String(post.cuerpo || "").split("\n").filter((l) => l.trim())
    .map((l) => `<p>${escapar(l)}</p>`).join("");

  /* Lo que la revisión de las piezas dejó claro, y aquí va aplicado:
     · el pie no se parte (una línea, sin partir el teléfono);
     · una sola clase de filete, del mismo ancho arriba y abajo;
     · el cuerpo sube de 38 a 42 px: en un teléfono, 38 px sobre 1080 se ven como
       12.6 px, y ahí el gris tenue del tema oscuro (#A8A8A2) se lee cansado aunque
       dé 7.3:1 de contraste; el tamaño es lo que lo arregla, no el tono;
     · el ritmo vertical es fijo: el título no flota, así que al deslizar el
       carrusel la mancha no salta de una pieza a otra;
     · la barra del destacado es el acento de la casa y va separada del texto. */
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8">
<style>
  @font-face{font-family:'Jakarta';src:url(${JAKARTA}) format('woff2');font-weight:400 700;font-display:block}
  @font-face{font-family:'Mono';src:url(${MONO}) format('woff2');font-weight:400 700;font-display:block}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${ancho}px;height:${alto}px;overflow:hidden;background:${papel};color:${tinta};
    font-family:'Jakarta',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .pieza{width:100%;height:100%;padding:${margen}px;display:flex;flex-direction:column}
  .arriba{display:flex;justify-content:space-between;align-items:baseline;white-space:nowrap;
    font-family:'Mono';font-size:${t(23)}px;letter-spacing:.12em;text-transform:uppercase;color:${tenue}}
  .arriba b{color:${acento};font-weight:700}
  .filete{border-top:1px solid ${filete};margin-top:${t(18)}px}
  .bloque{display:flex;flex-direction:column}
  .bloque--centrado{margin:auto 0}
  .bloque--centrado .titulo{margin-top:0}
  .titulo{margin-top:${t(120)}px;font-size:${t(96)}px;line-height:1.06;letter-spacing:-.022em;
    font-weight:700;text-wrap:balance;max-width:21ch}
  .cuerpo{margin-top:${t(32)}px;font-size:${t(42)}px;line-height:1.4;color:${tenue};max-width:23ch}
  .cuerpo p + p{margin-top:${t(18)}px}
  .pie{margin-top:${t(34)}px;font-size:${t(34)}px;line-height:1.28;font-weight:700;color:${tinta};
    border-left:4px solid ${acento};padding-left:${t(24)}px;max-width:26ch}
  .abajo{margin-top:auto;padding-top:${t(24)}px;border-top:1px solid ${filete};
    display:flex;justify-content:space-between;align-items:baseline;white-space:nowrap;
    font-family:'Mono';font-size:${t(23)}px;letter-spacing:.06em;color:${tenue}}
  .abajo b{color:${tinta};font-weight:700}
</style></head><body>
  <div class="pieza">
    <div class="arriba"><span><b>CAMENA</b> · ${escapar(post.etiqueta)}</span><span>${String(post.dia).padStart(2, "0")}</span></div>
    <div class="filete"></div>
    <div class="bloque${bloque}">
    <h1 class="titulo">${escapar(post.titulo)}</h1>
    <div class="cuerpo">${parrafos}</div>
    <div class="pie">${escapar(post.pie)}</div>
    </div>
    <div class="abajo"><span>CAMENA · Apatzingán, Michoacán</span><span><b>WhatsApp ${escapar(datos.whatsapp)}</b></span></div>
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
const resumen = [];

for (const post of datos.posts) {
  if (post.dia < desde || post.dia > hasta) continue;
  if (SIN_IMAGENES) break;
  for (const [sufijo, tam] of [["feed", datos.tamano], ["historia", datos.historias]]) {
    const archivo = join(tmp, `p${post.dia}-${sufijo}.html`);
    writeFileSync(archivo, plantilla(post, tam.ancho, tam.alto));
    await env("Emulation.setDeviceMetricsOverride", { width: tam.ancho, height: tam.alto, deviceScaleFactor: 1, mobile: false });
    await env("Page.navigate", { url: "file://" + archivo });
    await esperar(420);
    // Se mide lo que se puede medir sin ver: contraste real, alto, y si algo se sale.
    const m = await ev(`(() => {
      const lum = (rgb) => { const c = rgb.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; };
      const num = (s) => (s.match(/[0-9.]+/g)||[]).map(Number);
      const fondo = (el) => { let n = el; while (n && n !== document.documentElement) { const c = num(getComputedStyle(n).backgroundColor); if (c.length>=3 && (c[3]===undefined||c[3]>0.5)) return c.slice(0,3); n = n.parentElement; } return [255,255,255]; };
      const out = { fallos: [], lineas: {} };
      ['.arriba','.titulo','.cuerpo','.pie','.abajo'].forEach(function(sel){
        const el = document.querySelector(sel); if (!el) return;
        const cs = getComputedStyle(el);
        const a = lum(num(cs.color).slice(0,3)), b = lum(fondo(el));
        const r = (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
        if (r < 4.5) out.fallos.push(sel + ' a ' + r.toFixed(2) + ':1');
        const rect = el.getBoundingClientRect();
        if (rect.right > ${tam.ancho} - 4 || rect.left < 4) out.fallos.push(sel + ' se sale a lo ancho');
        const lh = parseFloat(cs.lineHeight);
        out.lineas[sel] = Math.round(rect.height / (lh || 1));
      });
      out.sobra = document.documentElement.scrollHeight - ${tam.alto};
      return out;
    })()`);
    if (m.sobra > 2) problemas.push(`día ${post.dia} (${sufijo}): el contenido se pasa ${Math.round(m.sobra)} px`);
    if (m.fallos.length) problemas.push(`día ${post.dia} (${sufijo}): ${m.fallos.join("; ")}`);
    if (m.lineas['.titulo'] > 4) problemas.push(`día ${post.dia} (${sufijo}): el titular usa ${m.lineas['.titulo']} líneas`);
    if (sufijo === "feed") resumen.push(`${String(post.dia).padStart(2,"0")} · título ${m.lineas['.titulo']} línea(s) · cuerpo ${m.lineas['.cuerpo']} · destacado ${m.lineas['.pie']}   ${m.fallos.length ? "✗ " + m.fallos.join("; ") : "✓"}`);
    const r = await env("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: tam.ancho, height: tam.alto, scale: 1 }, captureBeyondViewport: false });
    const destino = join(SALIDA, `${String(post.dia).padStart(2, "0")}-${post.tema}-${sufijo}.png`);
    writeFileSync(destino, Buffer.from(r.data, "base64"));
    hechas++;
  }
}
chrome.kill("SIGKILL");

/* ── Lo demás que hace falta para poder publicar sin pensar ────────────────
   Las imágenes solas no sirven de nada si a la hora de subirlas no se tiene a
   mano qué dice la publicación. Así que junto a los PNG se escriben:
     · textos/<día>.txt   — el texto de la publicación, listo para copiar y pegar;
     · calendario.md      — el mes completo en una tabla, para irlo tachando;
     · galeria.html       — la hoja de contactos, para ver el mes de un vistazo. */
const soloTexto = datos.posts.filter((p) => p.dia >= desde && p.dia <= hasta);
const carpetaTexto = join(SALIDA, "textos");
mkdirSync(carpetaTexto, { recursive: true });

for (const p of soloTexto) {
  const n = String(p.dia).padStart(2, "0");
  const cuerpo = [
    `DÍA ${p.dia} · ${p.bloque} · tema ${p.tema}`,
    "",
    `IMAGEN:  ${n}-${p.tema}-feed.png      (publicación, 1080x1350)`,
    `HISTORIA: ${n}-${p.tema}-historia.png  (historia, 1080x1920)`,
    "",
    "─ TEXTO DE LA PUBLICACIÓN ─────────────────────────────────",
    "",
    p.caption,
    "",
    p.etiquetas.join(" "),
    "",
    "─ LO QUE DICE LA IMAGEN ──────────────────────────────────",
    "",
    p.titulo,
    "",
    p.cuerpo,
    "",
    p.pie,
    "",
  ].join("\n");
  writeFileSync(join(carpetaTexto, `${n}-${p.tema}.txt`), cuerpo);
}

/* Las fechas salen del día de inicio que está en contenido.json, para que el
   calendario diga el día real y no un "día 1" abstracto. */
const inicio = datos.inicio ? new Date(datos.inicio + "T12:00:00") : null;
const fecha = (dia) => {
  if (!inicio) return "";
  const f = new Date(inicio.getTime() + (dia - 1) * 86400000);
  const semana = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][f.getDay()];
  const mes = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][f.getMonth()];
  return `${semana} ${f.getDate()} de ${mes}`;
};
const filas = soloTexto.map((p) => {
  const n = String(p.dia).padStart(2, "0");
  return `| ${p.dia} | ${fecha(p.dia)} | ${p.bloque} | ${p.titulo} | \`${n}-${p.tema}-feed.png\` |`;
});
writeFileSync(join(SALIDA, "calendario.md"), [
  "# Un mes de publicaciones",
  "",
  `Son ${soloTexto.length} días, uno por día, en seis bloques. Van alternando fondo oscuro y fondo hueso`,
  "para que el perfil no se vea como una pared del mismo color. Cada día trae la pieza del muro",
  "y la historia vertical, y el texto en `textos/`.",
  "",
  "El orden importa: primero quién es CAMENA, luego los problemas, luego lo que se hace, cómo se",
  "trabaja y cuánto cuesta, y al final el oficio. Los primeros días son para que alguien que no nos",
  "conoce entienda qué hacemos; el día 30 es para que escriba.",
  "",
  soloTexto.length && inicio ? `Empieza el ${fecha(1)} y termina el ${fecha(soloTexto[soloTexto.length - 1].dia)}.` : "",
  "",
  "| Día | Fecha | Bloque | Titular | Archivo |",
  "| --- | --- | --- | --- | --- |",
  ...filas,
  "",
  "## Cómo se publica",
  "",
  "1. Se abre `textos/<día>.txt` y se copia el texto de la publicación.",
  "2. Se sube la imagen `<día>-<tema>-feed.png` al muro con ese texto.",
  "3. La misma imagen vertical, `<día>-<tema>-historia.png`, se sube como historia.",
  "4. Se tacha el día aquí abajo.",
  "",
  soloTexto.map((p) => `- [ ] Día ${p.dia}`).join("\n"),
  "",
].join("\n"));

const fichas = soloTexto.map((p) => {
  const n = String(p.dia).padStart(2, "0");
  return `  <article>
    <img src="${n}-${p.tema}-feed.png" alt="Día ${p.dia}: ${escapar(p.titulo)}" loading="lazy">
    <div>
      <p class="dia">Día ${p.dia} · ${escapar(p.bloque)}</p>
      <h2>${escapar(p.titulo)}</h2>
      <p class="cuerpo">${escapar(p.cuerpo).replace(/\n\n/g, "<br><br>")}</p>
      <p class="destacado">${escapar(p.pie)}</p>
      <p class="texto">${escapar(p.caption).replace(/\n\n/g, "<br><br>")}</p>
      <p class="etiquetas">${escapar(p.etiquetas.join(" "))}</p>
      <p class="archivos">${n}-${p.tema}-feed.png · ${n}-${p.tema}-historia.png</p>
    </div>
  </article>`;
}).join("\n");

writeFileSync(join(SALIDA, "galeria.html"), `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Un mes de publicaciones · CAMENA</title>
<style>
  /* El dorado de la casa (#A8821F) da 3.31:1 sobre el papel: sirve para una barra,
     no para texto chico. Para los renglones de texto va el dorado oscuro. */
  :root { --tinta:#111; --tenue:#5C5B57; --papel:#F7F6F3; --oro:#A8821F; --oro-tx:#8A6A0F; --linea:#DEDCD6 }
  * { margin:0; padding:0; box-sizing:border-box }
  body { background:var(--papel); color:var(--tinta); font:16px/1.55 system-ui,sans-serif; padding:40px 32px 96px }
  header { max-width:1200px; margin:0 auto 40px; border-bottom:2px solid var(--tinta); padding-bottom:20px }
  h1 { font-size:40px; letter-spacing:-.02em }
  header p { color:var(--tenue); margin-top:8px; max-width:70ch }
  main { max-width:1200px; margin:0 auto; display:grid; gap:40px }
  article { display:grid; grid-template-columns:320px 1fr; gap:32px; align-items:start;
    border-top:1px solid var(--linea); padding-top:32px }
  img { width:100%; height:auto; display:block; border:1px solid var(--linea) }
  .dia { font:12px/1 ui-monospace,monospace; letter-spacing:.12em; text-transform:uppercase; color:var(--oro-tx) }
  h2 { font-size:26px; letter-spacing:-.01em; margin:10px 0 14px }
  .cuerpo { color:var(--tenue); max-width:60ch }
  .destacado { margin:18px 0; padding-left:14px; border-left:3px solid var(--oro); font-weight:700; max-width:56ch }
  .texto { max-width:60ch; white-space:normal }
  .etiquetas { margin-top:14px; color:var(--oro-tx); font-size:14px }
  .archivos { margin-top:10px; font:12px/1.6 ui-monospace,monospace; color:var(--tenue) }
  @media (max-width:760px) { article { grid-template-columns:1fr } body { padding:24px 16px 64px } }
</style></head><body>
<header>
  <h1>Un mes de publicaciones</h1>
  <p>Treinta días para las redes de CAMENA: la pieza del muro, la historia vertical y el texto de cada
  publicación. Esto se genera solo desde <code>contenido.json</code>; si se cambia el texto ahí y se
  vuelve a correr el generador, todo se rehace.</p>
</header>
<main>
${fichas}
</main></body></html>
`);

console.log(`  ${hechas} imágenes en ${SALIDA}\n`);
resumen.sort().forEach((l) => console.log("  " + l));
console.log("");
if (problemas.length) {
  console.log("\n  ✗ Estas se pasan de alto y hay que acortar el texto:");
  problemas.forEach((p) => console.log("    · " + p));
  process.exit(1);
}
console.log("  ✓ Ninguna se desborda.");
console.log(`  · ${soloTexto.length} textos en textos/ · calendario.md · galeria.html`);
