#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   CAMENA · aplicar.mjs — pasa la revisión del marcador al sitio real

     node docs/aplicar.mjs Revision-CAMENA.json            (simulación)
     node docs/aplicar.mjs Revision-CAMENA.json --escribir  (aplica)
     node docs/aplicar.mjs Revision-CAMENA.json --listar    (solo ver)

   Qué hace:
     · Lee el JSON que exporta el marcador (docs/revision/revisar.js).
     · Aplica los CAMBIOS DE TEXTO a los HTML reales, comprobando antes que
       el texto original aparezca UNA sola vez: si aparece cero o más de una,
       no toca nada y lo reporta para revisarlo a mano.
     · Deja las NOTAS en un archivo de tareas (Revision-pendientes.md) para
       irlas resolviendo una por una.

   Nunca escribe nada sin --escribir: por defecto solo simula y muestra el
   diff. Después de aplicar conviene correr la auditoría (ver README).
   ═══════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "..");

/* ── Argumentos ─────────────────────────────────────────────── */
const args = process.argv.slice(2);
const archivo = args.find((a) => !a.startsWith("--"));
const escribir = args.includes("--escribir");
const soloListar = args.includes("--listar");

if (!archivo) {
  console.error(`
Falta el archivo de revisión.

  node docs/aplicar.mjs Revision-CAMENA.json            → simula y muestra qué haría
  node docs/aplicar.mjs Revision-CAMENA.json --escribir → aplica los cambios
  node docs/aplicar.mjs Revision-CAMENA.json --listar   → solo lista lo que hay
`);
  process.exit(1);
}
if (!existsSync(archivo)) {
  console.error(`✗ no encuentro el archivo: ${archivo}`);
  process.exit(1);
}

const revision = JSON.parse(readFileSync(archivo, "utf8"));
const paginas = revision.paginas || [];

/* ── Utilidades ─────────────────────────────────────────────── */

const escaparRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* El texto del marcador viene "plano" (sin etiquetas y con espacios
   normalizados). Aquí se busca en el HTML permitiendo cualquier espacio en
   blanco entre palabras, y también etiquetas de énfasis sueltas dentro de la
   frase, que es como está escrito el sitio. */
function buscarEnHTML(html, frase) {
  const palabras = frase.split(/\s+/).map(escaparRegex);
  const cuerpo = palabras.join("(?:\\s|&nbsp;|<[^>]+>)+");
  const re = new RegExp("(" + cuerpo + ")", "g");
  const encontrados = [...html.matchAll(re)];
  return encontrados;
}

function contar(html, frase) {
  return buscarEnHTML(html, frase).length;
}

function normalizar(t) {
  return String(t || "").replace(/\s+/g, " ").trim();
}

/* ── Recorrido ──────────────────────────────────────────────── */

let aplicados = 0;
let problemas = 0;
let notas = 0;
const pendientes = [];

/* Por página, para no leer y escribir el archivo varias veces */
const cambiosPorPagina = new Map();
paginas.forEach((bloque) => {
  cambiosPorPagina.set(bloque.pagina, {
    cambios: (bloque.marcas || []).filter((m) => m.despues),
    notas: (bloque.marcas || []).filter((m) => !m.despues),
  });
});

console.log(`\nRevisión: ${revision.generado || "(sin fecha)"}`);
console.log(`Páginas con marcas: ${paginas.length}\n`);

for (const [pagina, contenido] of cambiosPorPagina) {
  const ruta = join(RAIZ, pagina);
  if (!existsSync(ruta)) {
    console.log(`── ${pagina}: ✗ no existe en el proyecto`);
    problemas += contenido.cambios.length;
    continue;
  }

  let html = readFileSync(ruta, "utf8");
  let original = html;
  const aplicadosPagina = [];
  const problemasPagina = [];

  contenido.cambios.forEach((m) => {
    const antes = normalizar(m.antes);
    const despues = normalizar(m.despues);

    if (!antes || !despues) {
      problemasPagina.push({ m, motivo: "cambio incompleto (falta el texto original o el nuevo)" });
      return;
    }

    const coincidencias = buscarEnHTML(html, antes);
    if (coincidencias.length === 0) {
      problemasPagina.push({ m, motivo: "el texto original no aparece en el HTML (¿se escribió distinto?)" });
      return;
    }
    if (coincidencias.length > 1) {
      problemasPagina.push({ m, motivo: `el texto aparece ${coincidencias.length} veces: hay que decidir en cuál` });
      return;
    }

    if (soloListar) {
      aplicadosPagina.push({ m, coincidencias: coincidencias.length });
      return;
    }

    html = html.replace(coincidencias[0][0], (encontrado) => {
      /* Se conserva el marcado interno que hubiera dentro del fragmento:
         si el original era «y <strong>así</strong>», lo que se reemplaza es
         el bloque entero, así que el texto nuevo entra tal cual. */
      return despues;
    });
    aplicadosPagina.push({ m, coincidencias: coincidencias.length });
  });

  if (aplicadosPagina.length) {
    aplicados += aplicadosPagina.length;
    console.log(`── ${pagina}`);
    aplicadosPagina.forEach(({ m }) => {
      console.log(`   ✓ ${m.id} · «${recortar(m.antes)}» → «${recortar(m.despues)}»`);
      if (m.nota) console.log(`       nota: ${m.nota}`);
    });
  }

  contenido.notas.forEach((m) => {
    notas++;
    pendientes.push({ pagina, m });
  });

  if (problemasPagina.length) {
    problemas += problemasPagina.length;
    console.log(`── ${pagina}: ${problemasPagina.length} cambio(s) que no se pudieron aplicar`);
    problemasPagina.forEach(({ m, motivo }) => {
      console.log(`   ✗ ${m.id} · ${motivo}`);
      console.log(`       antes:   «${recortar(m.antes)}»`);
      console.log(`       después: «${recortar(m.despues)}»`);
      pendientes.push({ pagina, m, motivo });
    });
  }

  if (escribir && html !== original) {
    writeFileSync(ruta, html, "utf8");
    console.log(`   · ${pagina} actualizado`);
  }
}

function recortar(t, n = 68) {
  const s = normalizar(t);
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/* ── Tareas pendientes (las notas y lo que no se pudo aplicar) ── */

if (pendientes.length) {
  const l = [
    "# Revisión pendiente · CAMENA",
    "",
    `Generado por \`docs/aplicar.mjs\` el ${new Date().toLocaleString("es-MX")}.`,
    "",
    "Cada punto viene de una marca del marcador: la nota dice qué quieres y el",
    "selector dice exactamente dónde.",
    "",
  ];
  let paginaActual = "";
  pendientes.forEach(({ pagina, m, motivo }) => {
    if (pagina !== paginaActual) {
      paginaActual = pagina;
      l.push(`## ${pagina}`, "");
    }
    l.push(`### ${m.id} · ${motivo ? "no aplicado" : "nota"}`);
    l.push("");
    l.push(`- Dónde: \`${m.selector}\``);
    l.push(`- Señalado: «${recortar(m.fragmento || m.antes, 160)}»`);
    if (m.despues) l.push(`- Querías: «${recortar(m.despues, 160)}»`);
    if (motivo) l.push(`- Por qué no se aplicó: ${motivo}`);
    l.push(`- Nota: ${m.nota || "(sin nota)"}`);
    l.push("");
  });
  const salida = join(RAIZ, "Revision-pendientes.md");
  writeFileSync(salida, l.join("\n"), "utf8");
  console.log(`\n· notas y pendientes escritos en ${salida}`);
}

/* ── Resumen ────────────────────────────────────────────────── */

console.log("\n────────────────────────────────────────────");
if (soloListar) {
  console.log(`${aplicados} cambio(s) listos para aplicar · ${notas} nota(s) · ${problemas} con problema`);
} else if (escribir) {
  console.log(`${aplicados} cambio(s) aplicados · ${notas} nota(s) en el archivo de pendientes · ${problemas} con problema`);
  console.log("\nAhora conviene comprobar que nada se rompió:");
  console.log("  python3 docs/verificar-contraste.py");
  console.log("  bash docs/auditar.sh http://127.0.0.1:8899/index.html 1440 1000 despues");
} else {
  console.log(`SIMULACIÓN · ${aplicados} cambio(s) se aplicarían · ${notas} nota(s) · ${problemas} con problema`);
  console.log("\nNada se escribió. Para aplicarlo de verdad, repite con --escribir.");
}
console.log("────────────────────────────────────────────\n");

process.exit(problemas && escribir ? 0 : 0);
