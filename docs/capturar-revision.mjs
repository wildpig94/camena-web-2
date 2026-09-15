#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   CAMENA · capturar-revision.mjs — ver la revisión como la dejó el usuario

     node docs/capturar-revision.mjs Revision-CAMENA.json
     node docs/capturar-revision.mjs Revision-CAMENA.json --salida /tmp/mi-carpeta

   Para qué sirve: cuando alguien manda el JSON del marcador, este script abre
   la copia de revisión con esas marcas cargadas y saca una captura por página.
   Así los dibujos (círculos, flechas, subrayados) y las notas se ven tal como
   quedaron, sin tener que interpretar coordenadas a mano.

   Requisitos: la copia de revisión ya construida (bash docs/revisar.sh) y el
   Chromium de Playwright que usan los demás scripts del repo.
   ═══════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "..");
const SITIO = join(RAIZ, "docs/revision/sitio");
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PUERTO = process.env.PUERTO || "8899";

const args = process.argv.slice(2);
const archivo = args.find((a) => !a.startsWith("--"));
const iSalida = args.indexOf("--salida");
const SALIDA = iSalida >= 0 && args[iSalida + 1] ? args[iSalida + 1] : "/tmp/camena-revision";

if (!archivo) {
  console.error(`
Falta el archivo de la revisión.

  node docs/capturar-revision.mjs Revision-CAMENA.json
  node docs/capturar-revision.mjs Revision-CAMENA.json --salida /tmp/loquesea
`);
  process.exit(1);
}
if (!existsSync(archivo)) {
  console.error(`✗ no encuentro ${archivo}`);
  process.exit(1);
}
if (!existsSync(SITIO)) {
  console.error("✗ no existe la copia de revisión. Corre primero:  bash docs/revisar.sh");
  process.exit(1);
}
if (!existsSync(CHROME)) {
  console.error(`✗ no encuentro Chromium en ${CHROME}`);
  process.exit(1);
}

const revision = JSON.parse(readFileSync(archivo, "utf8"));
const paginas = revision.paginas || [];
if (!paginas.length) {
  console.error("✗ la revisión no trae marcas");
  process.exit(1);
}

/* El marcador carga la revisión desde ?revision=…, así que se deja una copia
   del JSON dentro de la carpeta que sirve el servidor local. */
const destinoJSON = join(SITIO, "revision-actual.json");
copyFileSync(archivo, destinoJSON);
mkdirSync(SALIDA, { recursive: true });

console.log(`\nRevisión: ${archivo}`);
console.log(`Páginas: ${paginas.map((p) => p.pagina).join(", ")}`);
console.log(`Capturas en: ${SALIDA}\n`);

for (const bloque of paginas) {
  const archivoPagina = join(SITIO, bloque.pagina);
  if (!existsSync(archivoPagina)) {
    console.log(`── ${bloque.pagina}: no está en la copia de revisión, se salta`);
    continue;
  }

  /* Alto de la ventana: hasta donde llega la marca más baja, con margen.
     Así la captura no se corta a media página. */
  let masAbajo = 1100;
  bloque.marcas.forEach((m) => {
    (m.trazo || []).forEach((p) => { masAbajo = Math.max(masAbajo, p[1] + 400); });
  });
  const alto = Math.min(20000, Math.round(masAbajo));

  const url = `http://127.0.0.1:${PUERTO}/docs/revision/sitio/${bloque.pagina}?revision=revision-actual.json`;
  const salida = join(SALIDA, bloque.pagina.replace(/\.html$/, "") + "-revision.png");

  try {
    execFileSync(CHROME, [
      "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
      `--window-size=1440,${alto}`,
      `--screenshot=${salida}`,
      "--virtual-time-budget=4000",
      url,
    ], { stdio: "ignore" });

    const dibujos = bloque.marcas.filter((m) => m.trazo && m.trazo.length).length;
    const cambios = bloque.marcas.filter((m) => m.despues).length;
    console.log(`   ✓ ${basename(salida)} · ${bloque.marcas.length} marca(s) · ${dibujos} dibujo(s) · ${cambios} cambio(s)`);
  } catch (e) {
    console.log(`   ✗ ${bloque.pagina}: no se pudo capturar (${e.message})`);
  }
}

console.log(`
Listo. Abre las imágenes para ver la revisión tal como la dejó quien la hizo.
Recuerda que el servidor local debe estar corriendo en el puerto ${PUERTO}.
`);
