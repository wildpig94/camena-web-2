/* ═══════════════════════════════════════════════════════════════
   CAMENA · revisar.js — el marcador v3 (lápiz sobre la página)
   Se carga SOLO en la copia local de revisión (docs/revision/sitio/).

   Cómo se usa (esto es todo):
     1 · Se pulsa «Lápiz» y se dibuja encima de la página con el ratón:
         se encierra una palabra, se subraya una frase, se hace una flecha.
     2 · Al soltar el ratón se abre sola una ventana para escribir qué se
         quiere: el texto nuevo, un color, lo que sea.
     3 · Con «Texto» se hace clic en un bloque (o se selecciona un fragmento)
         y se escribe el texto nuevo, que se aplica al instante.
     4 · Al final: «Descargar revisión» (para leer) y «JSON» (para aplicar).

   Todo se guarda en el navegador por página, así que se puede revisar en
   varios días. Nada de esto se publica: docs/ no entra en el despliegue.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var PAGINA = document.documentElement.getAttribute("data-rv-pagina") || location.pathname.split("/").pop() || "index.html";
  var CLAVE = "camena:marcas:" + PAGINA;
  var PREFIJO = "camena:marcas:";

  var COLORES = [
    { id: "magenta", base: "#D6247A", suave: "rgba(214, 36, 122, 0.26)", texto: "Cambiar" },
    { id: "oro",     base: "#A8821F", suave: "rgba(168, 130, 31, 0.30)", texto: "Revisar" },
    { id: "verde",   base: "#0E9F6E", suave: "rgba(14, 159, 110, 0.28)", texto: "Está bien" },
    { id: "carbon",  base: "#111111", suave: "rgba(17, 17, 17, 0.16)",   texto: "Duda" }
  ];

  var ATAJOS = ["más grande", "más chico", "más corto", "quitarlo", "en magenta", "en oro", "en verde", "subirlo", "bajarlo"];

  var marcas = [];
  var modo = null;
  var colorActual = "magenta";
  var editandoId = null;
  var rangoGuardado = null;
  var trazoActual = null;
  var seleccionado = null;

  /* ── Utilidades ─────────────────────────────────────────────── */

  function colorDe(id) {
    for (var i = 0; i < COLORES.length; i++) if (COLORES[i].id === id) return COLORES[i];
    return COLORES[0];
  }
  function normalizar(t) { return String(t || "").replace(/\s+/g, " ").trim(); }
  function escapar(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function textoDe(el) {
    var t = normalizar(el && el.textContent);
    return t.length > 140 ? t.slice(0, 137) + "…" : t;
  }
  function recortar(t, n) {
    var s = normalizar(t);
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  function selectorDe(el) {
    if (!el || el === document.body) return "body";
    var partes = [], n = el;
    while (n && n.nodeType === 1 && n !== document.body && partes.length < 6) {
      if (n.id) { partes.unshift("#" + n.id); break; }
      var parte = n.tagName.toLowerCase();
      var clases = (n.getAttribute("class") || "").split(/\s+/).filter(function (c) {
        return c && c.indexOf("rv-") !== 0 && !/^(is-|js)/.test(c);
      });
      if (clases.length) parte += "." + clases.slice(0, 2).join(".");
      var padre = n.parentElement;
      if (padre) {
        var iguales = Array.prototype.filter.call(padre.children, function (h) {
          return h.tagName === n.tagName && h.getAttribute("class") === n.getAttribute("class");
        });
        if (iguales.length > 1) parte += ":nth-of-type(" + (Array.prototype.indexOf.call(padre.children, n) + 1) + ")";
      }
      partes.unshift(parte);
      n = n.parentElement;
    }
    return partes.join(" > ");
  }

  function objetivoDesde(el) {
    var n = el;
    while (n && n !== document.body) {
      var vale = n.matches("h1,h2,h3,h4,p,li,a,button,figcaption,blockquote,dd,dt,summary,span,section,article,aside,div");
      if (vale && (n.textContent || "").trim().length) return n;
      n = n.parentElement;
    }
    return el;
  }

  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(marcas)); } catch (e) {} }
  function cargar() {
    try { marcas = JSON.parse(localStorage.getItem(CLAVE) || "[]") || []; } catch (e) { marcas = []; }
    if (!Array.isArray(marcas)) marcas = [];
  }

  /* ── Lienzos: dibujo encima de la página y capa de globos ───── */

  var lienzo, ctx, capa, resalte;

  function altoDoc() { return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight); }
  function anchoDoc() { return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth); }

  function crearLienzos() {
    capa = document.createElement("div"); capa.id = "rv-capa"; document.body.appendChild(capa);
    resalte = document.createElement("div"); resalte.id = "rv-resalte"; document.body.appendChild(resalte);
    lienzo = document.createElement("canvas"); lienzo.id = "rv-lienzo"; document.body.appendChild(lienzo);
    ctx = lienzo.getContext("2d");
    ajustarLienzo();
  }

  function ajustarLienzo() {
    var dpr = window.devicePixelRatio || 1;
    var w = anchoDoc(), h = altoDoc();
    lienzo.width = Math.round(w * dpr);
    lienzo.height = Math.round(h * dpr);
    lienzo.style.width = w + "px";
    lienzo.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function pintarLienzo() {
    ctx.clearRect(0, 0, anchoDoc(), altoDoc());
    marcas.forEach(function (m) {
      if (!m.trazo || !m.trazo.length) return;
      var c = colorDe(m.color);
      ctx.strokeStyle = c.base;
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      m.trazo.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    if (trazoActual && trazoActual.length) {
      ctx.strokeStyle = colorDe(colorActual).base;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      trazoActual.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function anclaDe(m) {
    if (m.trazo && m.trazo.length) {
      var minX = Infinity, minY = Infinity;
      m.trazo.forEach(function (p) { minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); });
      return { x: minX, y: minY };
    }
    if (m.selector) {
      var el = document.querySelector(m.selector);
      if (!el) return null;
      var r = el.getBoundingClientRect();
      if (m.fragmento) {
        var rango = buscarRango(el, m.despues || m.antes, true);
        if (rango) r = rango.getBoundingClientRect();
      }
      return { x: r.left + window.scrollX, y: r.top + window.scrollY };
    }
    return null;
  }

  function pintarGlobos() {
    capa.innerHTML = "";
    capa.style.height = altoDoc() + "px";
    marcas.forEach(function (m) {
      var a = anclaDe(m);
      if (!a) return;
      var c = colorDe(m.color);
      var g = document.createElement("button");
      g.type = "button";
      g.className = "rv-globo";
      g.style.setProperty("--rv-color", c.base);
      g.style.left = (a.x - 8) + "px";
      g.style.top = (a.y - 8) + "px";
      g.textContent = String(m.id);
      g.title = (m.nota || "(sin instrucción)") + (m.selector ? "\n" + m.selector : "");
      g.addEventListener("click", function (ev) { ev.stopPropagation(); reabrir(m.id); });
      capa.appendChild(g);
    });
    pintarPanel();
    actualizarContador();
  }

  function repintar() {
    ajustarLienzo();
    pintarLienzo();
    pintarGlobos();
  }

  /* ── Herramientas ───────────────────────────────────────────── */

  var barra, botonLapiz, botonTexto, botonVer, contadorEl, filaColores;

  function activar(nuevoModo) {
    modo = modo === nuevoModo ? null : nuevoModo;
    document.documentElement.classList.toggle("rv-lapiz", modo === "lapiz");
    document.documentElement.classList.toggle("rv-texto", modo === "texto");
    botonLapiz.setAttribute("aria-pressed", modo === "lapiz" ? "true" : "false");
    botonTexto.setAttribute("aria-pressed", modo === "texto" ? "true" : "false");
    resalte.style.display = "none";
    if (modo !== "lapiz") trazoActual = null;
    pintarLienzo();
  }

  /* ── Dibujo con el ratón ────────────────────────────────────── */

  function enLaInterfaz(ev) {
    return ev.target.closest && ev.target.closest("#rv-nota, #rv-panel, #rv-barra, .rv-globo");
  }

  function empezarTrazo(ev) {
    if (modo !== "lapiz" || ev.button !== 0 || enLaInterfaz(ev)) return;
    ev.preventDefault();
    trazoActual = [[ev.pageX, ev.pageY]];
    cerrarCaja();
  }

  function seguirTrazo(ev) {
    if (modo === "texto" && !cajaAbierta() && !enLaInterfaz(ev)) {
      var r = objetivoDesde(ev.target).getBoundingClientRect();
      resalte.style.display = "block";
      resalte.style.left = (r.left + window.scrollX) + "px";
      resalte.style.top = (r.top + window.scrollY) + "px";
      resalte.style.width = r.width + "px";
      resalte.style.height = r.height + "px";
    }
    if (!trazoActual) return;
    var p = [ev.pageX, ev.pageY];
    var u = trazoActual[trazoActual.length - 1];
    if (Math.abs(p[0] - u[0]) + Math.abs(p[1] - u[1]) >= 3) {
      trazoActual.push(p);
      pintarLienzo();
    }
  }

  function terminarTrazo(ev) {
    if (!trazoActual) return;
    var trazo = trazoActual;
    trazoActual = null;
    var caja2 = limites(trazo);
    if (caja2.w < 10 && caja2.h < 10) { pintarLienzo(); return; }
    if (ev) ev.preventDefault();

    var cx = caja2.x + caja2.w / 2, cy = caja2.y + caja2.h / 2;
    var bajo = elementoEn(cx - window.scrollX, cy - window.scrollY);
    seleccionado = objetivoDesde(bajo || document.body);
    rangoGuardado = null;

    abrirCaja(caja2.x + caja2.w + 12, caja2.y + caja2.h, null, "trazo", trazo, null);
    pintarLienzo();
  }

  function limites(trazo) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    trazo.forEach(function (p) {
      minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]);
      maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]);
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function elementoEn(clientX, clientY) {
    var antes = lienzo.style.pointerEvents;
    lienzo.style.pointerEvents = "none";
    var el = document.elementFromPoint(clientX, clientY);
    lienzo.style.pointerEvents = antes;
    return el;
  }

  /* ── Modo texto ─────────────────────────────────────────────── */

  function leerSeleccion() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    var rango = sel.getRangeAt(0);
    var frase = normalizar(rango.toString());
    if (frase.length < 2) return null;
    var contenedor = rango.startContainer;
    var el = contenedor.nodeType === 1 ? contenedor : contenedor.parentElement;
    var bloque = el.closest("p,li,h1,h2,h3,h4,dd,dt,summary,button,a,figcaption,blockquote,div,span") || el;
    var completo = normalizar(bloque.textContent) === frase;
    return { elemento: bloque, frase: frase, rango: completo ? null : rango.cloneRange() };
  }

  function clicTexto(ev) {
    if (modo !== "texto" || enLaInterfaz(ev)) return;
    var s = leerSeleccion();
    ev.preventDefault();
    ev.stopPropagation();
    if (s) {
      seleccionado = s.elemento;
      rangoGuardado = s.rango;
      abrirCaja(ev.pageX, ev.pageY, null, "texto", null, s.frase);
      return;
    }
    seleccionado = objetivoDesde(ev.target);
    rangoGuardado = null;
    abrirCaja(ev.pageX, ev.pageY, null, "texto", null, null);
  }

  function buscarRango(el, frase, incluirEditados) {
    var buscada = normalizar(frase);
    if (!buscada) return null;
    var nodos = [];
    (function recorrer(n) {
      for (var i = 0; i < n.childNodes.length; i++) {
        var c = n.childNodes[i];
        if (c.nodeType === 3) nodos.push(c);
        else if (c.nodeType === 1 && (incluirEditados || !c.classList.contains("rv-editado"))) recorrer(c);
      }
    })(el);
    var patron = new RegExp(buscada.split(/\s+/).map(function (p) {
      return p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("\\s+"), "i");
    for (var i = 0; i < nodos.length; i++) {
      var m = patron.exec(nodos[i].nodeValue);
      if (m) {
        var r = document.createRange();
        r.setStart(nodos[i], m.index);
        r.setEnd(nodos[i], m.index + m[0].length);
        return r;
      }
    }
    return null;
  }

  function aplicarEnLaCopia(m) {
    var el = document.querySelector(m.selector);
    if (!el || !m.antes || !m.despues) return false;
    if (m.fragmento) {
      if (buscarRango(el, m.despues, true)) return true;
      var rango = buscarRango(el, m.antes);
      if (!rango) return false;
      var span = document.createElement("span");
      span.className = "rv-editado";
      span.textContent = m.despues;
      span.setAttribute("data-rv-original", m.antes);
      rango.deleteContents();
      rango.insertNode(span);
      return true;
    }
    var nodos = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3; });
    if (!nodos.length) return false;
    nodos[0].nodeValue = m.despues;
    el.classList.add("rv-editado");
    el.setAttribute("data-rv-original", m.antes);
    return true;
  }

  function reaplicarCambios() {
    marcas.forEach(function (m) { if (m.despues) aplicarEnLaCopia(m); });
  }

  /* ── Ventana de la instrucción ──────────────────────────────── */

  var caja, campoNota, campoTexto, titulo, sub, bloqueTexto, bloqueAtajos, filaCajaColores, bBorrar;

  function cajaAbierta() { return caja && caja.getAttribute("data-abierta") === "si"; }

  function crearCaja() {
    caja = document.createElement("div");
    caja.id = "rv-nota";
    caja.innerHTML =
      '<h4 id="rv-titulo">¿Qué hago aquí?</h4>' +
      '<p class="rv-objetivo"></p>' +
      '<textarea class="rv-nota-texto" placeholder="Escríbeme la instrucción como se te ocurra: «cambia esta palabra por Clientes», «este título en magenta», «quítalo», «más grande»…"></textarea>' +
      '<div class="rv-atajos"></div>' +
      '<div class="rv-campo rv-campo-texto" hidden>' +
        '<label class="rv-rotulo">Cómo debe quedar el texto</label>' +
        '<textarea class="rv-cambio" placeholder="Escribe el texto nuevo y se aplica en esta copia al guardar."></textarea>' +
      '</div>' +
      '<div class="rv-fila"><div class="rv-colores"></div></div>' +
      '<div class="rv-fila">' +
        '<button type="button" class="rv-accion rv-accion--peligro rv-borrar" hidden>Borrar</button>' +
        '<button type="button" class="rv-accion rv-cancelar" style="margin-left:auto">Cancelar</button>' +
        '<button type="button" class="rv-accion rv-accion--principal rv-guardar">Guardar</button>' +
      '</div>' +
      '<p class="rv-ayuda">Enter guarda · Esc cierra</p>';
    document.body.appendChild(caja);

    campoNota = caja.querySelector(".rv-nota-texto");
    campoTexto = caja.querySelector(".rv-cambio");
    titulo = caja.querySelector("#rv-titulo");
    sub = caja.querySelector(".rv-objetivo");
    bloqueTexto = caja.querySelector(".rv-campo-texto");
    bloqueAtajos = caja.querySelector(".rv-atajos");
    filaCajaColores = caja.querySelector(".rv-colores");
    bBorrar = caja.querySelector(".rv-borrar");

    COLORES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rv-color";
      b.style.background = c.base;
      b.title = c.texto;
      b.setAttribute("aria-label", c.texto);
      b.addEventListener("click", function () { elegirColor(c.id); });
      filaCajaColores.appendChild(b);
    });

    ATAJOS.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rv-atajo";
      b.textContent = t;
      b.addEventListener("click", function () {
        campoNota.value = (campoNota.value.trim() + " " + t).trim();
        campoNota.focus();
      });
      bloqueAtajos.appendChild(b);
    });

    caja.querySelector(".rv-cancelar").addEventListener("click", cerrarCaja);
    caja.querySelector(".rv-guardar").addEventListener("click", guardarMarca);
    bBorrar.addEventListener("click", function () {
      if (editandoId != null) { borrarMarca(editandoId); cerrarCaja(); }
    });

    [campoNota, campoTexto].forEach(function (campo) {
      campo.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") { ev.preventDefault(); cerrarCaja(); }
        if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); guardarMarca(); }
      });
    });
  }

  function elegirColor(id) {
    colorActual = id;
    Array.prototype.forEach.call(filaCajaColores.children, function (b, i) {
      b.setAttribute("aria-pressed", COLORES[i].id === id ? "true" : "false");
    });
    if (filaColores) {
      Array.prototype.forEach.call(filaColores.children, function (b, i) {
        b.setAttribute("aria-pressed", COLORES[i].id === id ? "true" : "false");
      });
    }
    pintarLienzo();
  }

  function abrirCaja(x, y, marca, tipo, trazo, frase) {
    editandoId = marca ? marca.id : null;
    var el = seleccionado || (marca && marca.selector ? document.querySelector(marca.selector) : null);
    var esTexto = (marca && marca.tipo === "texto") || tipo === "texto";
    var esTrazo = (marca && marca.tipo === "trazo") || tipo === "trazo";

    titulo.textContent = marca
      ? "Marca " + marca.id + " · editar"
      : (esTrazo ? "Dibujo · ¿qué quieres aquí?" : "¿Qué cambio en este texto?");

    var lineas = [];
    if (esTrazo && el) lineas.push("Señalado: «" + recortar(textoDe(el), 110) + "»");
    if (frase) lineas.push("Frase: «" + recortar(frase, 110) + "»");
    if (el) lineas.push(selectorDe(el));
    sub.innerHTML = lineas.map(escapar).join("<br>");

    campoNota.value = marca ? (marca.nota || "") : "";
    campoTexto.value = marca ? (marca.despues || "") : "";
    bloqueTexto.hidden = !esTexto;
    elegirColor(marca ? marca.color : colorActual);
    bBorrar.hidden = !marca;

    caja.dataset.pendiente = JSON.stringify({
      tipo: marca ? marca.tipo : (esTrazo ? "trazo" : "texto"),
      trazo: marca ? marca.trazo : (trazo || null),
      frase: frase || null
    });

    var ancho = 380;
    var izq = Math.min(Math.max(8, x - ancho / 2), window.scrollX + document.documentElement.clientWidth - ancho - 8);
    caja.style.left = izq + "px";
    caja.style.top = Math.max(window.scrollY + 8, y + 14) + "px";
    caja.setAttribute("data-abierta", "si");
    if (esTexto) campoTexto.focus(); else campoNota.focus();
  }

  function cerrarCaja() {
    caja.removeAttribute("data-abierta");
    editandoId = null;
    seleccionado = null;
    rangoGuardado = null;
  }

  function marcaPorId(id) {
    for (var i = 0; i < marcas.length; i++) if (marcas[i].id === id) return marcas[i];
    return null;
  }

  function guardarMarca() {
    var pendiente = JSON.parse(caja.dataset.pendiente || "{}");
    var nota = campoNota.value.trim();
    var nuevo = campoTexto.value.trim();
    var previa = editandoId != null ? marcaPorId(editandoId) : null;
    var el = seleccionado || (previa && previa.selector ? document.querySelector(previa.selector) : null);

    var m;
    if (previa) {
      m = previa;
      m.nota = nota;
      m.color = colorActual;
      if (m.tipo === "texto" && nuevo && nuevo !== m.antes) {
        m.despues = nuevo;
        aplicarEnLaCopia(m);
      }
    } else {
      m = {
        id: marcas.reduce(function (max, x) { return Math.max(max, x.id); }, 0) + 1,
        tipo: pendiente.tipo || "nota",
        trazo: pendiente.trazo || null,
        selector: el ? selectorDe(el) : null,
        texto: el ? textoDe(el) : "",
        fragmento: pendiente.frase || null,
        antes: pendiente.frase || (el ? textoDe(el) : ""),
        despues: "",
        nota: nota,
        color: colorActual,
        fecha: new Date().toISOString()
      };
      if (m.tipo === "texto" && nuevo && nuevo !== m.antes) {
        m.despues = nuevo;
        if (rangoGuardado) {
          var span = document.createElement("span");
          span.className = "rv-editado";
          span.textContent = nuevo;
          span.setAttribute("data-rv-original", m.antes);
          rangoGuardado.deleteContents();
          rangoGuardado.insertNode(span);
        } else if (el) {
          aplicarEnLaCopia(m);
        }
      }
      marcas.push(m);
    }
    m.fecha = new Date().toISOString();
    if (window.getSelection) window.getSelection().removeAllRanges();
    guardar();
    cerrarCaja();
    repintar();
  }

  function reabrir(id) {
    var m = marcaPorId(id);
    if (!m) return;
    seleccionado = m.selector ? document.querySelector(m.selector) : null;
    rangoGuardado = null;
    var a = anclaDe(m) || { x: window.scrollX + 40, y: window.scrollY + 40 };
    abrirCaja(a.x, a.y, m, m.tipo, m.trazo, m.fragmento);
  }

  function borrarMarca(id) {
    marcas = marcas.filter(function (x) { return x.id !== id; });
    marcas.forEach(function (x, i) { x.id = i + 1; });
    guardar();
    repintar();
  }

  /* ── Panel de la revisión ───────────────────────────────────── */

  var panel, lista;

  function crearPanel() {
    panel = document.createElement("div");
    panel.id = "rv-panel";
    panel.innerHTML =
      '<div class="rv-panel__cabecera">' +
        '<strong>Revisión · <span class="rv-pagina"></span></strong>' +
        '<button type="button" class="rv-accion rv-cerrar-panel">Cerrar</button>' +
      '</div>' +
      '<ul class="rv-panel__lista"></ul>' +
      '<div class="rv-panel__pie">' +
        '<button type="button" class="rv-accion rv-accion--principal rv-md">Descargar revisión</button>' +
        '<button type="button" class="rv-accion rv-copiar">Copiar</button>' +
        '<button type="button" class="rv-accion rv-json">JSON para aplicar</button>' +
        '<button type="button" class="rv-accion rv-accion--peligro rv-vaciar">Vaciar página</button>' +
      '</div>' +
      '<p class="rv-ayuda" style="padding:0 12px 12px;margin:0">El archivo incluye todas las páginas revisadas.</p>';
    document.body.appendChild(panel);
    panel.querySelector(".rv-pagina").textContent = PAGINA;
    lista = panel.querySelector(".rv-panel__lista");

    panel.querySelector(".rv-cerrar-panel").addEventListener("click", function () { panel.setAttribute("data-abierto", "no"); });
    panel.querySelector(".rv-md").addEventListener("click", function () { descargar(markdown(), "Revision-CAMENA.md", "text/markdown"); });
    panel.querySelector(".rv-json").addEventListener("click", function () { descargar(JSON.stringify(paquete(), null, 2), "Revision-CAMENA.json", "application/json"); });
    panel.querySelector(".rv-copiar").addEventListener("click", function () { copiar(markdown(), panel.querySelector(".rv-copiar")); });
    panel.querySelector(".rv-vaciar").addEventListener("click", function () {
      if (confirm("¿Vaciar las " + marcas.length + " marcas de esta página?")) { marcas = []; guardar(); repintar(); }
    });
  }

  function pintarPanel() {
    lista.innerHTML = "";
    if (!marcas.length) {
      var v = document.createElement("li");
      v.className = "rv-vacio";
      v.innerHTML = "Todavía no hay nada marcado.<br><br>" +
        "<strong>1 ·</strong> Pulsa <em>Lápiz</em> y dibuja encima de la página: encierra una palabra, subraya una frase, haz una flecha.<br>" +
        "<strong>2 ·</strong> Al soltar el ratón se abre la ventana: escribe qué quieres.<br>" +
        "<strong>3 ·</strong> Con <em>Texto</em> escribes el texto nuevo y lo ves aplicado al instante.";
      lista.appendChild(v);
      return;
    }
    marcas.forEach(function (m) {
      var c = colorDe(m.color);
      var li = document.createElement("li");
      li.className = "rv-item";
      var detalle = m.tipo === "trazo"
        ? '<span class="rv-item__texto">dibujo sobre «' + escapar(recortar(m.texto, 70)) + "»</span>"
        : (m.despues
          ? '<span class="rv-cambio-linea"><s>' + escapar(recortar(m.antes, 60)) + "</s> → <strong>" + escapar(recortar(m.despues, 60)) + "</strong></span>"
          : '<span class="rv-item__texto">«' + escapar(recortar(m.fragmento || m.antes, 70)) + "»</span>");
      li.innerHTML =
        '<span class="rv-item__num" style="--rv-color:' + c.base + '">' + m.id + "</span>" +
        '<span><span class="rv-item__nota">' + escapar(m.nota || "(sin instrucción)") + "</span>" + detalle +
        (m.selector ? '<span class="rv-item__sel">' + escapar(m.selector) + "</span>" : "") + "</span>" +
        '<button type="button" class="rv-item__borrar" title="Borrar">×</button>';
      li.addEventListener("click", function (ev) {
        if (ev.target.classList.contains("rv-item__borrar")) { borrarMarca(m.id); return; }
        if (m.trazo && m.trazo.length) window.scrollTo({ top: Math.max(0, m.trazo[0][1] - 220), behavior: "smooth" });
        else if (m.selector) {
          var el = document.querySelector(m.selector);
          if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      });
      lista.appendChild(li);
    });
  }

  function actualizarContador() {
    var cambios = marcas.filter(function (m) { return m.despues; }).length;
    contadorEl.textContent = marcas.length ? (marcas.length + (cambios ? " ✎" + cambios : "")) : "0";
    contadorEl.style.display = marcas.length ? "inline-block" : "none";
  }

  /* ── Exportar ───────────────────────────────────────────────── */

  function paginasRevisadas() {
    var out = [];
    var paginas = ["index.html", "servicios.html", "como-trabajamos.html"];
    if (paginas.indexOf(PAGINA) < 0) paginas.unshift(PAGINA);
    paginas.forEach(function (p) {
      var datos;
      if (p === PAGINA) datos = marcas;
      else { try { datos = JSON.parse(localStorage.getItem(PREFIJO + p) || "[]") || []; } catch (e) { datos = []; } }
      if (datos.length) out.push({ pagina: p, marcas: datos });
    });
    return out;
  }

  function paquete() {
    return { generado: new Date().toISOString(), sitio: "CAMENA 2.0", paginas: paginasRevisadas() };
  }

  function markdown() {
    var paginas = paginasRevisadas();
    var total = 0;
    paginas.forEach(function (b) { total += b.marcas.length; });
    var l = ["# Revisión del sitio · CAMENA", ""];
    l.push("Generado el " + new Date().toLocaleString("es-MX") + " · " + total + " marca(s) en " + paginas.length + " página(s).");
    l.push("");
    paginas.forEach(function (bloque) {
      l.push("## " + bloque.pagina + " · " + bloque.marcas.length + " marca(s)", "");
      bloque.marcas.forEach(function (m) {
        l.push("### " + m.id + " · " + colorDe(m.color).texto + (m.tipo === "trazo" ? " (dibujo)" : ""));
        l.push("");
        if (m.selector) l.push("- Dónde: `" + m.selector + "`");
        if (m.texto) l.push("- Texto señalado: «" + recortar(m.texto, 160) + "»");
        if (m.fragmento) l.push("- Frase: «" + m.fragmento + "»");
        if (m.antes && m.despues) l.push("- Cambio de texto: «" + m.antes + "» → «" + m.despues + "»");
        l.push("- **Quiero:** " + (m.nota || "(sin instrucción escrita)"));
        l.push("");
      });
    });
    return l.join("\n");
  }

  function descargar(contenido, nombre, tipo) {
    var blob = new Blob([contenido], { type: tipo + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function copiar(texto, boton) {
    var hecho = function () {
      var antes = boton.textContent;
      boton.textContent = "¡Copiado!";
      setTimeout(function () { boton.textContent = antes; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(hecho, function () { respaldo(texto, hecho); });
    } else respaldo(texto, hecho);
  }
  function respaldo(texto, hecho) {
    var ta = document.createElement("textarea");
    ta.value = texto; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); hecho(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ── Barra de herramientas ──────────────────────────────────── */

  function crearBarra() {
    barra = document.createElement("div");
    barra.id = "rv-barra";
    barra.innerHTML =
      '<button type="button" id="rv-lapiz" aria-pressed="false"><span class="rv-ico">✎</span> Lápiz</button>' +
      '<button type="button" id="rv-texto-btn" aria-pressed="false"><span class="rv-ico">T</span> Texto</button>' +
      '<span class="rv-sep"></span>' +
      '<span class="rv-barra__colores"></span>' +
      '<span class="rv-sep"></span>' +
      '<button type="button" id="rv-ver">Ver revisión</button>' +
      '<span id="rv-contador">0</span>';
    document.body.appendChild(barra);

    botonLapiz = barra.querySelector("#rv-lapiz");
    botonTexto = barra.querySelector("#rv-texto-btn");
    botonVer = barra.querySelector("#rv-ver");
    contadorEl = barra.querySelector("#rv-contador");
    filaColores = barra.querySelector(".rv-barra__colores");

    COLORES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rv-color rv-color--barra";
      b.style.background = c.base;
      b.title = c.texto;
      b.setAttribute("aria-label", c.texto);
      b.addEventListener("click", function () { elegirColor(c.id); });
      filaColores.appendChild(b);
    });

    botonLapiz.addEventListener("click", function () { activar("lapiz"); });
    botonTexto.addEventListener("click", function () { activar("texto"); });
    botonVer.addEventListener("click", function () {
      panel.setAttribute("data-abierto", panel.getAttribute("data-abierto") === "si" ? "no" : "si");
    });

    var aviso = document.createElement("div");
    aviso.id = "rv-aviso";
    aviso.innerHTML = "COPIA DE REVISIÓN · nada de esto se publica · <strong>L</strong> lápiz · <strong>T</strong> texto";
    document.body.appendChild(aviso);

    elegirColor(colorActual);
  }

  /* ── Cargar una revisión guardada (?revision=archivo.json) ──── */

  function cargarRevisionDeURL() {
    var param = new URLSearchParams(location.search).get("revision");
    if (!param) return;
    fetch(param).then(function (r) { return r.json(); }).then(function (datos) {
      (datos.paginas || []).forEach(function (bloque) {
        localStorage.setItem(PREFIJO + bloque.pagina, JSON.stringify(bloque.marcas || []));
      });
      cargar();
      reaplicarCambios();
      repintar();
    }).catch(function () { /* sin revisión que cargar */ });
  }

  /* ── Arranque ───────────────────────────────────────────────── */

  function iniciar() {
    cargar();
    crearLienzos();
    crearCaja();
    crearPanel();
    crearBarra();
    reaplicarCambios();
    repintar();

    lienzo.addEventListener("mousedown", empezarTrazo);
    document.addEventListener("mousemove", seguirTrazo, true);
    document.addEventListener("mouseup", terminarTrazo, true);
    document.addEventListener("click", clicTexto, true);
    document.addEventListener("keydown", function (ev) {
      if (ev.target.matches("textarea, input")) return;
      if (ev.key === "l" || ev.key === "L") activar("lapiz");
      if (ev.key === "t" || ev.key === "T") activar("texto");
      if (ev.key === "Escape") { cerrarCaja(); if (modo) activar(modo); }
    });

    window.addEventListener("resize", repintar);
    window.addEventListener("load", function () { reaplicarCambios(); repintar(); });

    cargarRevisionDeURL();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();

  window.Revisar = {
    activar: activar,
    modo: function () { return modo; },
    dibujar: function (puntos, nota, color, selectorSugerido) {
      var el = selectorSugerido ? document.querySelector(selectorSugerido) : null;
      var m = {
        id: marcas.reduce(function (max, x) { return Math.max(max, x.id); }, 0) + 1,
        tipo: "trazo", trazo: puntos,
        selector: el ? selectorDe(el) : null,
        texto: el ? textoDe(el) : "",
        fragmento: null, antes: "", despues: "",
        nota: nota || "", color: color || "magenta", fecha: new Date().toISOString()
      };
      marcas.push(m); guardar(); repintar(); return m.id;
    },
    marcar: function (selector, nota, color) {
      var el = document.querySelector(selector);
      if (!el) return null;
      var m = { id: marcas.reduce(function (max, x) { return Math.max(max, x.id); }, 0) + 1,
        tipo: "nota", trazo: null, selector: selector, texto: textoDe(el), fragmento: null,
        antes: textoDe(el), despues: "", nota: nota || "", color: color || "oro", fecha: new Date().toISOString() };
      marcas.push(m); guardar(); repintar(); return m.id;
    },
    editar: function (selector, antes, despues, nota, color) {
      var el = document.querySelector(selector);
      if (!el) return null;
      var m = { id: marcas.reduce(function (max, x) { return Math.max(max, x.id); }, 0) + 1,
        tipo: "texto", trazo: null, selector: selector, texto: textoDe(el), fragmento: antes,
        antes: antes, despues: despues, nota: nota || "", color: color || "magenta", fecha: new Date().toISOString() };
      marcas.push(m); aplicarEnLaCopia(m); guardar(); repintar(); return m.id;
    },
    marcas: function () { return marcas.slice(); },
    markdown: markdown,
    json: function () { return JSON.stringify(paquete(), null, 2); },
    vaciar: function () { marcas = []; guardar(); repintar(); }
  };
})();
