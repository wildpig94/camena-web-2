/* Prueba del producto "Control de Autos" con Chrome por CDP.
   No toca el archivo: mide y usa la página tal como está.
   Uso: node docs/probar-producto.mjs [url] [ancho] [alto]

   El sistema ya no vive en este repositorio: está en
   ~/productos-camena/control-de-autos/. Hay que servirlo desde ahí, porque la
   página pide sus fuentes y su favicon en ../assets/:

     cd ~/productos-camena && python3 -m http.server 8900 --bind 127.0.0.1
     node docs/probar-producto.mjs http://127.0.0.1:8900/control-de-autos/control-de-autos.html

   La ruta anterior (producto/control-de-autos.html, dentro del sitio) ya no
   existe: se retiró del repositorio público para no regalar el sistema. */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PAGINA = process.argv[2] || "http://127.0.0.1:8900/control-de-autos/control-de-autos.html";
const ANCHO = Number(process.argv[3] || 390);
/* El origen se saca de la URL que se pide: así sirve igual contra el servidor
   local y contra el sitio publicado, sin marcar lo propio como externo. */
const ORIGEN = new URL(PAGINA).origin;
const ALTO = Number(process.argv[4] || 844);
const CHROME = "/home/alexis/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const PERFIL = mkdtempSync(join(tmpdir(), "camena-cda-"));

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox",
  "--disable-gpu", "--disable-software-rasterizer", "--disable-gpu-compositing",
  "--disable-dev-shm-usage", "--hide-scrollbars", "--no-first-run",
  "--remote-debugging-port=0",
  `--user-data-dir=${PERFIL}`,
  "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function puertoReal() {
  let buffer = "";
  return new Promise((res, rej) => {
    const lim = setTimeout(() => rej(new Error("Chrome no anunció su puerto")), 20000);
    chrome.stderr.on("data", (t) => {
      buffer += String(t);
      const m = buffer.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (m) { clearTimeout(lim); res(Number(m[1])); }
    });
    chrome.on("error", rej);
  });
}

const puerto = await puertoReal();

async function objetivo() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
      const p = lista.find((t) => t.type === "page");
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch { /* aún no levanta */ }
    await esperar(200);
  }
  throw new Error("no se pudo conectar");
}

const ws = new WebSocket(await objetivo());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let n = 0;
const pend = new Map();
const consola = [];
const peticiones = [];

ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) {
    const { resolver, rechazar } = pend.get(m.id);
    pend.delete(m.id);
    m.error ? rechazar(new Error(JSON.stringify(m.error))) : resolver(m.result);
  } else if (m.method === "Runtime.exceptionThrown") {
    const ed = m.params.exceptionDetails;
    consola.push("excepción: " + ed.text + " " +
      (ed.exception?.description || "").split("\n")[0]);
  } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    consola.push("console.error: " + m.params.args.map((a) => a.value ?? a.type).join(" "));
  } else if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
    consola.push("log: " + m.params.entry.text + " " + (m.params.entry.url || ""));
  } else if (m.method === "Network.requestWillBeSent") {
    peticiones.push(m.params.request.url);
  }
};

const enviar = (method, params = {}) => new Promise((res, rej) => {
  const id = ++n;
  pend.set(id, { resolver: res, rechazar: rej });
  ws.send(JSON.stringify({ id, method, params }));
});

await enviar("Runtime.enable");
await enviar("Page.enable");
await enviar("Network.enable");
await enviar("Log.enable");
await enviar("Emulation.setDeviceMetricsOverride", {
  width: ANCHO, height: ALTO, deviceScaleFactor: 2, mobile: ANCHO < 600,
});
await enviar("Emulation.setTouchEmulationEnabled", { enabled: ANCHO < 600 });

const evaluar = async (expr) => {
  const r = await enviar("Runtime.evaluate", {
    expression: expr, returnByValue: true, awaitPromise: true,
  });
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    throw new Error((d.exception && d.exception.description) || d.text);
  }
  return r.result.value;
};

const informe = { url: PAGINA, ventana: `${ANCHO}x${ALTO}` };

await enviar("Page.navigate", { url: PAGINA });
await esperar(1800);

informe.recursos = await evaluar(`performance.getEntriesByType('resource').map(r => r.name)`);
informe.externos = informe.recursos.filter((u) => !u.startsWith(ORIGEN));
informe.fuentes = await evaluar(`({
  oswald: document.fonts.check('600 16px "Oswald"'),
  plex: document.fonts.check('400 16px "IBM Plex Sans"'),
  detalle: Array.from(document.fonts).map(f => f.family + ' ' + f.weight + ':' + f.status)
})`);
informe.desborde = await evaluar(
  `document.documentElement.scrollWidth - document.documentElement.clientWidth`);
informe.altoDocumento = await evaluar(`document.documentElement.scrollHeight`);
informe.titulo = await evaluar(`document.title`);
informe.h1 = await evaluar(`document.querySelectorAll('h1').length`);
informe.pantallaInicial = await evaluar(
  `document.body.innerText.replace(/\\s+/g,' ').slice(0, 260)`);

/* Uso real: dar de alta un auto como lo haría la encargada. */
informe.alta = await evaluar(`(() => {
  const r = {};
  window.appActions.openAddModal();
  const f = document.getElementById('car-form');
  r.formulario = !!f;
  if (!f) return r;
  const hoy = new Date().toISOString().slice(0, 10);
  f.querySelector('[name=descripcion]').value = 'Prueba automatizada';
  f.querySelector('[name=color]').value = 'Gris';
  f.querySelector('[name=placa]').value = 'PRU-123-A';
  f.querySelector('[name=folio]').value = 'SIN-0001';
  f.querySelector('[name=fechaEntrada]').value = hoy;
  f.querySelector('[name=notas]').value = 'Nota de la prueba';
  const sel = f.querySelector('[name=aseguradora]');
  r.aseguradorasEnSelect = sel ? sel.options.length : 0;
  if (sel && sel.options.length) sel.selectedIndex = 0;
  r.aseguradoraElegida = sel ? sel.value : null;
  f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  r.guardado = JSON.parse(localStorage.getItem('taller_autos_v1') || '[]');
  r.enPantalla = document.body.innerText.includes('Prueba automatizada');
  r.modalCerrado = !document.getElementById('car-form');
  return r;
})()`);

/* El cotizador: piezas por cambiar y el factor de la aseguradora. El taller
   confirmó 175% sobre el costo de la refacción, y que cada aseguradora trae el
   suyo. Aquí se comprueba la cuenta, que el total siga al factor y que el renglón
   quede guardado. */
informe.cotizador = await evaluar(`(() => {
  const r = {};
  window.appActions.openAddModal();
  const f = document.getElementById('car-form');
  if (!f) { r.error = 'no abrió el formulario'; return r; }
  f.querySelector('[name=descripcion]').value = 'Auto con piezas';
  f.querySelector('[name=placa]').value = 'PIE-175';
  const sel = f.querySelector('[name=aseguradora]');
  const conFactor = [...sel.options].find(o => o.value);
  r.aseguradora = conFactor ? conFactor.value : null;
  sel.value = r.aseguradora; sel.dispatchEvent(new Event('change'));

  window.__addPieza(); window.__addPieza();
  const filas = [...document.querySelectorAll('#piezas .pieza-row')];
  r.renglones = filas.length;
  filas[0].querySelector('.pieza-nombre').value = 'Puerta trasera';
  filas[0].querySelector('.pieza-costo').value = '1000';
  filas[0].querySelector('.pieza-costo').dispatchEvent(new Event('input'));
  filas[1].querySelector('.pieza-nombre').value = 'Pintura';
  filas[1].querySelector('.pieza-costo').value = '500';
  filas[1].querySelector('.pieza-costo').dispatchEvent(new Event('input'));

  r.preciosPorPieza = [...document.querySelectorAll('.pieza-precio')].map(e => e.textContent);
  r.totalEnElFormulario = document.getElementById('piezas-total').textContent;

  /* Particular: sin aseguradora no hay factor y el precio lo pone el dueño. */
  sel.value = ''; sel.dispatchEvent(new Event('change'));
  r.avisoDeParticular = document.getElementById('piezas-total').textContent;
  sel.value = r.aseguradora; sel.dispatchEvent(new Event('change'));

  f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  const guardado = JSON.parse(localStorage.getItem('taller_autos_v1') || '[]');
  const nuevo = guardado.find(c => c.descripcion === 'Auto con piezas') || {};
  r.piezasGuardadas = (nuevo.piezas || []).length;
  const tarjeta = [...document.querySelectorAll('.car-card')]
    .find(c => c.textContent.includes('Auto con piezas'));
  r.enLaTarjeta = tarjeta ? (tarjeta.querySelector('.car-piezas') || {}).textContent : null;
  return r;
})()`);

/* El factor se puede cambiar por aseguradora, y el precio lo sigue. */
informe.factorEditable = await evaluar(`(async () => {
  const r = {};
  window.appActions.openSettingsModal();
  const inp = document.querySelector('.insurer-factor input');
  if (!inp) { r.error = 'no hay campo de factor'; return r; }
  r.antes = inp.value;
  const tarjeta = () => [...document.querySelectorAll('.car-card')].find(c => c.textContent.includes('Auto con piezas')) || null;
  r.totalCon175 = (tarjeta().querySelector('.car-piezas b') || {}).textContent || null;
  inp.value = '200'; inp.dispatchEvent(new Event('change'));
  r.guardado = JSON.parse(localStorage.getItem('taller_aseguradoras_v1') || '[]')[0];
  window.appActions.closeModal();
  r.totalCon200 = (tarjeta().querySelector('.car-piezas b') || {}).textContent || null;
  /* La cotización que se manda: se copia y el aviso aparece. */
  const btn = [...document.querySelectorAll('.car-actions .btn')]
    .find(b => b.textContent.includes('cotización'));
  r.hayBotonDeCotizacion = !!btn;
  if (btn) {
    btn.click();
    await new Promise(res => setTimeout(res, 400));
    const aviso = document.querySelector('.toast');
    r.aviso = aviso ? aviso.textContent.trim() : null;
    /* Sin https no hay portapapeles. Cuando falla, el texto tiene que aparecer de
       todos modos —ya seleccionado— para poder copiarlo a mano. */
    const caja = document.querySelector('.cotizacion-texto');
        r.respaldoSinPortapapeles = caja ? { traeElEncabezado: caja.value.indexOf('Piezas por cambiar') >= 0, empieza: caja.value.slice(0, 90) } : null;
    const cerrar = document.getElementById('cotizacion-cerrar');
    if (cerrar) cerrar.click();
  }
  return r;
})()`);

/* ¿Se acuerda después de recargar? */
await enviar("Page.reload");
await esperar(1800);
informe.persistencia = await evaluar(`({
  guardado: JSON.parse(localStorage.getItem('taller_autos_v1') || '[]').length,
  enPantalla: document.body.innerText.includes('Prueba automatizada'),
  piezasEnPantalla: JSON.parse(localStorage.getItem('taller_autos_v1') || '[]')
    .map(c => (c.piezas || []).length).reduce((a, b) => a + b, 0),
  externosTrasRecarga: performance.getEntriesByType('resource')
    .map(r => r.name).filter(u => !u.startsWith('${ORIGEN}'))
})`);

/* Datos de la versión anterior: aseguradoras como texto y autos sin piezas.
   Tienen que seguir abriendo, sin un error en la consola. */
await evaluar(`(() => {
  localStorage.setItem('taller_aseguradoras_v1', JSON.stringify(['GNP', 'Qualitas']));
  localStorage.setItem('taller_autos_v1', JSON.stringify([{
    id: 'viejo1', estado: 'en_taller', fechaSalida: null, descripcion: 'Auto de antes',
    color: 'Rojo', placa: 'OLD-1', aseguradora: 'GNP', folio: 'F-9',
    fechaEntrada: '2026-09-01', notas: ''
  }]));
  return 1;
})()`);
await enviar("Page.reload");
await esperar(1500);
informe.migracion = await evaluar(`(() => {
  window.appActions.openSettingsModal();
  return {
    abre: document.querySelectorAll('h1').length,
    elAutoViejoSigue: document.body.innerText.includes('Auto de antes'),
    aseguradorasMigradas: [...document.querySelectorAll('.insurer-row')].map(f => ({
      nombre: f.querySelector('.insurer-name').textContent.trim(),
      factor: f.querySelector('input').value
    }))
  };
})()`);

informe.consola = consola;
informe.peticionesTotales = peticiones.length;

console.log(JSON.stringify(informe, null, 1));
chrome.kill("SIGKILL");
