/* ═══════════════════════════════════════════════════════════════
   CAMENA · revisar.js — el marcador
   Se carga SOLO en la copia local de revisión (docs/revision/sitio/).
   Nunca se publica: el flujo de publicación no copia docs/.

   Qué hace:
     · Enciende un modo marcador: el ratón se vuelve cruz y al pasar por
       encima de cualquier bloque se resalta con un recuadro y su nombre.
     · Al hacer clic se abre una caja para escribir la nota y elegir color
       (oro, magenta, verde o carbón).
     · Cada marca queda dibujada encima de la página como un subrayador,
       con un globo numerado que se puede volver a abrir.
     · Todo se guarda en el navegador (localStorage) por página, así que
       puedes cerrar y seguir revisando otro día.
     · Exporta la lista en Markdown y en JSON para mandarla tal cual.

   Atajos:  M  enciende/apaga el marcador   ·   Esc  cierra la caja
            Ctrl/Cmd + Enter  guarda la nota
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var PAGINA = document.documentElement.getAttribute("data-rv-pagina") || location.pathname.split("/").pop() || "index.html";
  var CLAVE = "camena:marcas:" + PAGINA;

  var COLORES = [
    { id: "oro",     base: "#A8821F", suave: "rgba(168, 130, 31, 0.30)",  nombre: "Oro" },
    { id: "magenta", base: "#D6247A", suave: "rgba(214, 36, 122, 0.26)",  nombre: "Magenta" },
    { id: "verde",   base: "#0E9F6E", suave: "rgba(14, 159, 110, 0.28)",  nombre: "Verde" },
    { id: "carbon",  base: "#111111", suave: "rgba(17, 17, 17, 0.16)",    nombre: "Carbón" }
  ];

  var marcas = [];
  var activo = false;
  var seleccionado = null;
  var colorActual = "magenta";

  /* ── Utilidades ─────────────────────────────────────────────── */

  function colorDe(id) {
    for (var i = 0; i < COLORES.length; i++) if (COLORES[i].id === id) return COLORES[i];
    return COLORES[1];
  }

  /* Selector legible y razonablemente estable: corta en el primer ancestro
     con id, y solo añade :nth-of-type cuando hace falta para no confundir
     hermanos iguales. */
  function selectorDe(el) {
    if (!el || el === document.body) return "body";
    var partes = [];
    var n = el;
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

  /* El elemento que al usuario le interesa: el más profundo con contenido
     propio, sin bajar a un <span> suelto dentro de un párrafo. */
  function objetivoDesde(el) {
    var n = el;
    while (n && n !== document.body) {
      var interesante = n.matches("h1,h2,h3,h4,p,li,a,button,img,figure,dl,dd,dt,span.etiqueta,.etapa,.caso-tarjeta,.disciplina,.paquete,section,article,aside,div");
      var tieneTexto = (n.textContent || "").trim().length > 0;
      if (interesante && (tieneTexto || n.tagName === "IMG")) return n;
      n = n.parentElement;
    }
    return el;
  }

  function textoDe(el) {
    var t = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (el.tagName === "IMG") return el.getAttribute("alt") || el.getAttribute("src") || "(imagen)";
    return t.length > 120 ? t.slice(0, 117) + "…" : t;
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(marcas)); } catch (e) { /* modo privado */ }
  }

  function cargar() {
    try { marcas = JSON.parse(localStorage.getItem(CLAVE) || "[]") || []; } catch (e) { marcas = []; }
    if (!Array.isArray(marcas)) marcas = [];
  }

  /* ── Capa de dibujo ─────────────────────────────────────────── */

  var capa, resalte, etiqueta, globos = {};

  function crearCapa() {
    capa = document.createElement("div");
    capa.id = "rv-capa";
    document.body.appendChild(capa);

    resalte = document.createElement("div");
    resalte.id = "rv-resalte";
    document.body.appendChild(resalte);

    etiqueta = document.createElement("div");
    etiqueta.id = "rv-etiqueta";
    document.body.appendChild(etiqueta);
  }

  function altoDocumento() {
    return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  }

  function pintarMarca(marca) {
    var el = document.querySelector(marca.selector);
    if (!el) return null;
    var r = el.getBoundingClientRect();
    var c = colorDe(marca.color);

    var div = document.createElement("div");
    div.className = "rv-marca";
    div.dataset.rv = String(marca.id);
    div.style.setProperty("--rv-color", c.base);
    div.style.setProperty("--rv-color-suave", c.suave);
    div.style.left = (r.left + window.scrollX) + "px";
    div.style.top = (r.top + window.scrollY) + "px";
    div.style.width = r.width + "px";
    div.style.height = r.height + "px";

    var globo = document.createElement("button");
    globo.type = "button";
    globo.className = "rv-globo";
    globo.dataset.rv = String(marca.id);
    globo.style.setProperty("--rv-color", c.base);
    globo.style.left = (r.left + window.scrollX + 2) + "px";
    globo.style.top = (r.top + window.scrollY + 2) + "px";
    globo.textContent = String(marca.id);
    globo.title = marca.nota || "(sin nota)";
    globo.addEventListener("click", function (ev) {
      ev.stopPropagation();
      editarMarca(marca.id, r.left + window.scrollX, r.top + window.scrollY + r.height);
    });

    capa.appendChild(div);
    capa.appendChild(globo);
    globos[marca.id] = [div, globo];
    return r;
  }

  function repintar() {
    capa.innerHTML = "";
    globos = {};
    capa.style.height = altoDocumento() + "px";
    marcas.forEach(function (m) { pintarMarca(m); });
    pintarPanel();
    actualizarContador();
  }

  /* ── Modo marcador ──────────────────────────────────────────── */

  function encender(estado) {
    activo = typeof estado === "boolean" ? estado : !activo;
    document.documentElement.classList.toggle("rv-activo", activo);
    boton.setAttribute("aria-pressed", activo ? "true" : "false");
    boton.querySelector(".rv-texto").textContent = activo ? "Marcando…" : "Marcar";
    if (!activo) { resalte.style.display = "none"; etiqueta.style.display = "none"; }
  }

  function seguirRaton(ev) {
    if (!activo) return;
    var el = objetivoDesde(ev.target);
    if (!el || el.closest("#rv-nota, #rv-panel, #rv-boton")) return;
    var r = el.getBoundingClientRect();
    resalte.style.display = "block";
    resalte.style.left = (r.left + window.scrollX) + "px";
    resalte.style.top = (r.top + window.scrollY) + "px";
    resalte.style.width = r.width + "px";
    resalte.style.height = r.height + "px";

    etiqueta.style.display = "block";
    etiqueta.textContent = selectorDe(el);
    etiqueta.style.left = (r.left + window.scrollX) + "px";
    etiqueta.style.top = Math.max(0, r.top + window.scrollY - 22) + "px";
  }

  function capturarClic(ev) {
    if (!activo) return;
    if (ev.target.closest && ev.target.closest("#rv-nota, #rv-panel, #rv-boton, .rv-globo")) return;
    ev.preventDefault();
    ev.stopPropagation();
    seleccionado = objetivoDesde(ev.target);
    abrirNota(ev.pageX, ev.pageY, null);
  }

  /* ── Caja de la nota ────────────────────────────────────────── */

  var caja, campo, tituloCaja, objetivoTexto, filaColores, botonBorrar;
  var editandoId = null;

  function crearCaja() {
    caja = document.createElement("div");
    caja.id = "rv-nota";
    caja.innerHTML =
      '<h4>Nota de la marca</h4>' +
      '<p class="rv-objetivo"></p>' +
      '<textarea placeholder="Ej. Resaltar este título con fondo de marcador, en magenta."></textarea>' +
      '<div class="rv-fila"><div class="rv-colores"></div></div>' +
      '<div class="rv-fila">' +
        '<button type="button" class="rv-accion rv-accion--peligro rv-borrar" hidden>Borrar marca</button>' +
        '<button type="button" class="rv-accion rv-cancelar" style="margin-left:auto">Cancelar</button>' +
        '<button type="button" class="rv-accion rv-accion--principal rv-guardar">Guardar</button>' +
      '</div>' +
      '<p class="rv-ayuda">Enter guarda · Esc cancela · Mayús+Enter hace salto de línea</p>';
    document.body.appendChild(caja);

    campo = caja.querySelector("textarea");
    tituloCaja = caja.querySelector(".rv-objetivo");
    filaColores = caja.querySelector(".rv-colores");
    botonBorrar = caja.querySelector(".rv-borrar");

    COLORES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rv-color";
      b.style.background = c.base;
      b.title = c.nombre;
      b.setAttribute("aria-label", "Color " + c.nombre);
      b.addEventListener("click", function () { elegirColor(c.id); });
      filaColores.appendChild(b);
    });

    caja.querySelector(".rv-cancelar").addEventListener("click", cerrarNota);
    caja.querySelector(".rv-guardar").addEventListener("click", guardarNota);
    botonBorrar.addEventListener("click", function () {
      if (editandoId != null) { borrarMarca(editandoId); cerrarNota(); }
    });

    campo.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); guardarNota(); }
      if (ev.key === "Escape") { ev.preventDefault(); cerrarNota(); }
    });
  }

  function elegirColor(id) {
    colorActual = id;
    Array.prototype.forEach.call(filaColores.children, function (b, i) {
      b.setAttribute("aria-pressed", COLORES[i].id === id ? "true" : "false");
    });
  }

  function abrirNota(x, y, marca) {
    editandoId = marca ? marca.id : null;
    var el = seleccionado || (marca && document.querySelector(marca.selector));
    tituloCaja.textContent = el ? selectorDe(el) : "";
    campo.value = marca ? marca.nota : "";
    elegirColor(marca ? marca.color : colorActual);
    botonBorrar.hidden = !marca;

    var ancho = 320;
    var izquierda = Math.min(Math.max(8, x - ancho / 2), window.scrollX + document.documentElement.clientWidth - ancho - 8);
    var arriba = Math.max(window.scrollY + 8, y + 10);
    caja.style.left = izquierda + "px";
    caja.style.top = arriba + "px";
    caja.setAttribute("data-abierta", "si");
    campo.focus();
  }

  function cerrarNota() {
    caja.removeAttribute("data-abierta");
    editandoId = null;
    seleccionado = null;
  }

  function guardarNota() {
    if (!seleccionado && editandoId == null) { cerrarNota(); return; }
    var nota = campo.value.trim();

    if (editandoId != null) {
      marcas.forEach(function (m) {
        if (m.id === editandoId) { m.nota = nota; m.color = colorActual; m.fecha = new Date().toISOString(); }
      });
    } else {
      var siguiente = marcas.reduce(function (max, m) { return Math.max(max, m.id); }, 0) + 1;
      marcas.push({
        id: siguiente,
        selector: selectorDe(seleccionado),
        nota: nota,
        color: colorActual,
        texto: textoDe(seleccionado),
        fecha: new Date().toISOString()
      });
    }
    guardar();
    cerrarNota();
    repintar();
  }

  function editarMarca(id, x, y) {
    var marca = null;
    marcas.forEach(function (m) { if (m.id === id) marca = m; });
    if (!marca) return;
    var el = document.querySelector(marca.selector);
    seleccionado = el;
    abrirNota(x, y, marca);
  }

  function borrarMarca(id) {
    marcas = marcas.filter(function (m) { return m.id !== id; });
    reenumerar();
    guardar();
    repintar();
  }

  function reenumerar() {
    marcas.sort(function (a, b) { return a.id - b.id; });
    marcas.forEach(function (m, i) { m.id = i + 1; });
  }

  /* ── Panel de la lista ──────────────────────────────────────── */

  var panel, listaPanel, contadorEl;

  function crearPanel() {
    panel = document.createElement("div");
    panel.id = "rv-panel";
    panel.innerHTML =
      '<div class="rv-panel__cabecera">' +
        '<strong>Marcas de esta página</strong>' +
        '<button type="button" class="rv-accion rv-cerrar-panel">Cerrar</button>' +
      '</div>' +
      '<ul class="rv-panel__lista"></ul>' +
      '<div class="rv-panel__pie">' +
        '<button type="button" class="rv-accion rv-accion--principal rv-exportar-md">Descargar Marcas.md</button>' +
        '<button type="button" class="rv-accion rv-copiar">Copiar todo</button>' +
        '<button type="button" class="rv-accion rv-exportar-json">JSON</button>' +
        '<button type="button" class="rv-accion rv-accion--peligro rv-borrar-todo">Vaciar</button>' +
      '</div>';
    document.body.appendChild(panel);
    listaPanel = panel.querySelector(".rv-panel__lista");
    panel.querySelector(".rv-cerrar-panel").addEventListener("click", function () {
      panel.setAttribute("data-abierto", "no");
    });
    panel.querySelector(".rv-exportar-md").addEventListener("click", function () { descargar(markdown(), "Marcas-" + PAGINA.replace(".html", "") + ".md", "text/markdown"); });
    panel.querySelector(".rv-exportar-json").addEventListener("click", function () { descargar(JSON.stringify({ pagina: PAGINA, marcas: marcas }, null, 2), "Marcas-" + PAGINA.replace(".html", "") + ".json", "application/json"); });
    panel.querySelector(".rv-copiar").addEventListener("click", function () {
      copiar(markdown(), panel.querySelector(".rv-copiar"));
    });
    panel.querySelector(".rv-borrar-todo").addEventListener("click", function () {
      if (confirm("¿Vaciar las " + marcas.length + " marcas de esta página?")) { marcas = []; guardar(); repintar(); }
    });
  }

  function pintarPanel() {
    listaPanel.innerHTML = "";
    if (!marcas.length) {
      var v = document.createElement("li");
      v.className = "rv-vacio";
      v.innerHTML = "Todavía no hay marcas.<br>Pulsa <strong>Marcar</strong>, pasa el ratón por la página y haz clic en lo que quieras cambiar.";
      listaPanel.appendChild(v);
      return;
    }
    marcas.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "rv-item";
      var c = colorDe(m.color);
      li.innerHTML =
        '<span class="rv-item__num" style="--rv-color:' + c.base + '">' + m.id + "</span>" +
        '<span><span class="rv-item__nota">' + escapar(m.nota || "(sin nota)") + "</span>" +
        '<span class="rv-item__sel">' + escapar(m.selector) + "</span>" +
        '<span class="rv-item__texto">«' + escapar(m.texto) + "»</span></span>" +
        '<button type="button" class="rv-item__borrar" title="Borrar">×</button>';
      li.addEventListener("click", function (ev) {
        if (ev.target.classList.contains("rv-item__borrar")) { borrarMarca(m.id); return; }
        var el = document.querySelector(m.selector);
        if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); }
      });
      listaPanel.appendChild(li);
    });
  }

  function escapar(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function actualizarContador() {
    contadorEl.textContent = String(marcas.length);
    contadorEl.style.display = marcas.length ? "inline-block" : "none";
  }

  /* ── Exportar ───────────────────────────────────────────────── */

  function markdown() {
    var lineas = [];
    lineas.push("# Marcas de revisión · " + PAGINA);
    lineas.push("");
    lineas.push("Generado el " + new Date().toLocaleString("es-MX") + " · " + marcas.length + " marca(s).");
    lineas.push("");
    if (!marcas.length) { lineas.push("_(sin marcas)_"); return lineas.join("\n"); }
    marcas.forEach(function (m) {
      lineas.push("## " + m.id + " · " + colorDe(m.color).nombre);
      lineas.push("");
      lineas.push("- **Dónde:** `" + m.selector + "`");
      lineas.push("- **Texto:** «" + m.texto + "»");
      lineas.push("- **Quiero:** " + (m.nota || "(sin nota)"));
      lineas.push("");
    });
    return lineas.join("\n");
  }

  function descargar(contenido, nombre, tipo) {
    var blob = new Blob([contenido], { type: tipo + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function copiar(texto, boton) {
    var listo = function () {
      var original = boton.textContent;
      boton.textContent = "¡Copiado!";
      setTimeout(function () { boton.textContent = original; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(listo, function () { respaldoCopiar(texto, listo); });
    } else {
      respaldoCopiar(texto, listo);
    }
  }

  function respaldoCopiar(texto, listo) {
    var ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); listo(); } catch (e) { /* nada */ }
    document.body.removeChild(ta);
  }

  /* ── Botón flotante y aviso ─────────────────────────────────── */

  var boton;

  function crearBoton() {
    boton = document.createElement("button");
    boton.id = "rv-boton";
    boton.type = "button";
    boton.setAttribute("aria-pressed", "false");
    boton.innerHTML = '<span class="rv-punto"></span><span class="rv-texto">Marcar</span><span id="rv-contador">0</span>';
    document.body.appendChild(boton);
    contadorEl = boton.querySelector("#rv-contador");

    boton.addEventListener("click", function (ev) {
      if (ev.altKey || marcas.length === 0) { encender(); return; }
      // Con marcas ya hechas: un clic abre el panel, Alt+clic enciende el marcador
      panel.setAttribute("data-abierto", panel.getAttribute("data-abierto") === "si" ? "no" : "si");
    });
    boton.addEventListener("contextmenu", function (ev) { ev.preventDefault(); encender(); });

    var contexto = document.createElement("button");
    contexto.type = "button";
    contexto.className = "rv-accion";
    contexto.textContent = "Ver marcas";
    contexto.style.position = "fixed";
    contexto.style.left = "18px";
    contexto.style.bottom = "64px";
    contexto.style.zIndex = "10001";
    contexto.addEventListener("click", function () {
      panel.setAttribute("data-abierto", panel.getAttribute("data-abierto") === "si" ? "no" : "si");
    });
    document.body.appendChild(contexto);

    var aviso = document.createElement("div");
    aviso.id = "rv-aviso";
    aviso.textContent = "COPIA DE REVISIÓN · los cambios y las marcas no se publican · M para marcar";
    document.body.appendChild(aviso);
  }

  /* ── Arranque ───────────────────────────────────────────────── */

  function iniciar() {
    cargar();
    crearCapa();
    crearCaja();
    crearPanel();
    crearBoton();
    repintar();

    document.addEventListener("mousemove", seguirRaton, true);
    document.addEventListener("click", capturarClic, true);
    document.addEventListener("keydown", function (ev) {
      if (ev.target.matches("textarea, input")) return;
      if (ev.key === "m" || ev.key === "M") { encender(); }
      if (ev.key === "Escape") { cerrarNota(); }
    });
    window.addEventListener("resize", repintar);
    window.addEventListener("load", repintar);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();

  /* API para automatizar (y para las pruebas) */
  window.Revisar = {
    activo: function () { return activo; },
    encender: encender,
    marcar: function (selector, nota, color) {
      var el = document.querySelector(selector);
      if (!el) return null;
      var id = marcas.reduce(function (max, m) { return Math.max(max, m.id); }, 0) + 1;
      marcas.push({ id: id, selector: selector, nota: nota || "", color: color || "magenta", texto: textoDe(el), fecha: new Date().toISOString() });
      guardar(); repintar();
      return id;
    },
    marcas: function () { return marcas.slice(); },
    markdown: markdown,
    vaciar: function () { marcas = []; guardar(); repintar(); }
  };
})();
