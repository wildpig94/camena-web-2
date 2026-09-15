/* ═══════════════════════════════════════════════════════════════
   CAMENA · revisar.js — el marcador (v2)
   Se carga SOLO en la copia local de revisión (docs/revision/sitio/).

   Qué se puede hacer:
     1 · MARCAR UN BLOQUE   — clic en un título, párrafo, botón o tarjeta.
     2 · MARCAR UNA FRASE   — selecciónala con el ratón (o doble clic en una
                              palabra) y la marca queda pegada a esa frase.
     3 · CAMBIAR EL TEXTO   — en la misma caja escribes cómo debe quedar. El
                              cambio se aplica en la copia al instante, así que
                              ves la versión final mientras revisas.
     4 · EXPORTAR TODO      — un archivo con las notas y los cambios de todas
                              las páginas revisadas, listo para aplicar.

   Atajos:  M  enciende/apaga   ·  Esc  cierra la caja
            Enter guarda   ·  Mayús+Enter hace salto de línea
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var PAGINA = document.documentElement.getAttribute("data-rv-pagina") || location.pathname.split("/").pop() || "index.html";
  var CLAVE = "camena:marcas:" + PAGINA;
  var PREFIJO = "camena:marcas:";

  var COLORES = [
    { id: "magenta", base: "#D6247A", suave: "rgba(214, 36, 122, 0.26)", nombre: "Cambio" },
    { id: "oro",     base: "#A8821F", suave: "rgba(168, 130, 31, 0.30)", nombre: "Revisar" },
    { id: "verde",   base: "#0E9F6E", suave: "rgba(14, 159, 110, 0.28)", nombre: "Bien así" },
    { id: "carbon",  base: "#111111", suave: "rgba(17, 17, 17, 0.16)",   nombre: "Duda" }
  ];

  var marcas = [];
  var activo = false;
  var seleccionado = null;
  var colorActual = "magenta";
  var editandoId = null;
  var rangoGuardado = null;

  /* ── Utilidades ─────────────────────────────────────────────── */

  function colorDe(id) {
    for (var i = 0; i < COLORES.length; i++) if (COLORES[i].id === id) return COLORES[i];
    return COLORES[0];
  }

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
        var hermanos = Array.prototype.filter.call(padre.children, function (h) {
          return h.tagName === n.tagName && h.getAttribute("class") === n.getAttribute("class");
        });
        if (hermanos.length > 1) parte += ":nth-of-type(" + (Array.prototype.indexOf.call(padre.children, n) + 1) + ")";
      }
      partes.unshift(parte);
      n = n.parentElement;
    }
    return partes.join(" > ");
  }

  function objetivoDesde(el) {
    var n = el;
    while (n && n !== document.body) {
      var vale = n.matches("h1,h2,h3,h4,p,li,a,button,figcaption,blockquote,dd,dt,summary,.etiqueta,.sello,.hero__promesa,.caso-tarjeta__problema,.etapa__titulo,.disciplina__lema,.servicios__que,section,article,aside,div");
      if (vale && (n.textContent || "").trim().length) return n;
      n = n.parentElement;
    }
    return el;
  }

  function textoDe(el) {
    var t = (el.textContent || "").replace(/\s+/g, " ").trim();
    return t.length > 140 ? t.slice(0, 137) + "…" : t;
  }

  function normalizar(t) { return String(t || "").replace(/\s+/g, " ").trim(); }

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

  /* Busca una frase dentro de un elemento y devuelve el Range que la cubre.
     Tolera saltos de línea (el HTML parte las frases en varias líneas) y, si
     se pide, entra también en el texto ya editado —necesario para volver a
     dibujar el resaltado de un cambio que ya se aplicó—. */
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

  function sustituirRango(rango, nuevoTexto, marca) {
    try {
      var span = document.createElement("span");
      span.className = "rv-editado";
      span.textContent = nuevoTexto;
      if (marca) span.setAttribute("data-rv-original", marca.antes);
      rango.deleteContents();
      rango.insertNode(span);
      return true;
    } catch (e) { return false; }
  }

  function aplicarEnLaCopia(marca) {
    var el = document.querySelector(marca.selector);
    if (!el) return false;
    if (marca.fragmento) {
      // ¿ya está aplicado? (el texto nuevo ya vive en la página)
      if (marca.despues && buscarRango(el, marca.despues, true)) return true;
      var rango = buscarRango(el, marca.antes);
      if (!rango) return false;
      return sustituirRango(rango, marca.despues, marca);
    }
    var nodos = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3; });
    if (!nodos.length) return false;
    nodos[0].nodeValue = marca.despues;
    el.classList.add("rv-editado");
    el.setAttribute("data-rv-original", marca.antes);
    return true;
  }

  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(marcas)); } catch (e) {} }
  function cargar() {
    try { marcas = JSON.parse(localStorage.getItem(CLAVE) || "[]") || []; } catch (e) { marcas = []; }
    if (!Array.isArray(marcas)) marcas = [];
  }

  /* ── Capa de marcas ─────────────────────────────────────────── */

  var capa, resalte;

  function crearCapa() {
    capa = document.createElement("div"); capa.id = "rv-capa"; document.body.appendChild(capa);
    resalte = document.createElement("div"); resalte.id = "rv-resalte"; document.body.appendChild(resalte);
  }

  function rectsDe(marca) {
    var el = document.querySelector(marca.selector);
    if (!el) return [];
    if (marca.fragmento) {
      // Si el cambio ya se aplicó, el texto que está en la página es el nuevo
      var r = marca.despues ? buscarRango(el, marca.despues, true) : buscarRango(el, marca.antes);
      return r ? Array.prototype.slice.call(r.getClientRects()) : [];
    }
    return [el.getBoundingClientRect()];
  }

  function repintar() {
    capa.innerHTML = "";
    capa.style.height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) + "px";

    marcas.forEach(function (m) {
      var c = colorDe(m.color);
      rectsDe(m).forEach(function (r, i) {
        if (!r.width || !r.height) return;
        var div = document.createElement("div");
        div.className = "rv-marca";
        div.style.setProperty("--rv-color", c.base);
        div.style.setProperty("--rv-color-suave", c.suave);
        div.style.left = (r.left + window.scrollX) + "px";
        div.style.top = (r.top + window.scrollY) + "px";
        div.style.width = r.width + "px";
        div.style.height = r.height + "px";
        div.title = m.nota || "";
        capa.appendChild(div);

        if (i === 0) {
          var globo = document.createElement("button");
          globo.type = "button";
          globo.className = "rv-globo";
          globo.style.setProperty("--rv-color", c.base);
          globo.style.left = (r.left + window.scrollX - 7) + "px";
          globo.style.top = (r.top + window.scrollY - 7) + "px";
          globo.textContent = String(m.id);
          globo.title = (m.despues ? "Cambiar a: " + m.despues + "\n" : "") + (m.nota || "(sin nota)");
          globo.addEventListener("click", function (ev) {
            ev.stopPropagation();
            editarMarca(m.id, r.left + window.scrollX, r.top + window.scrollY + r.height);
          });
          capa.appendChild(globo);
        }
      });
    });
    pintarPanel();
    actualizarContador();
  }

  /* ── Modo marcador ─────────────────────────────────────────── */

  var boton, contadorEl, panel, listaPanel;

  function encender(estado) {
    activo = typeof estado === "boolean" ? estado : !activo;
    document.documentElement.classList.toggle("rv-activo", activo);
    boton.setAttribute("aria-pressed", activo ? "true" : "false");
    boton.querySelector(".rv-texto").textContent = activo ? "Marcando…" : "Marcar";
    if (!activo) resalte.style.display = "none";
  }

  function seguirRaton(ev) {
    if (!activo || cajaAbierta() || (ev.target.closest && ev.target.closest("#rv-nota, #rv-panel, #rv-boton, #rv-ver, .rv-globo"))) return;
    var r = objetivoDesde(ev.target).getBoundingClientRect();
    resalte.style.display = "block";
    resalte.style.left = (r.left + window.scrollX) + "px";
    resalte.style.top = (r.top + window.scrollY) + "px";
    resalte.style.width = r.width + "px";
    resalte.style.height = r.height + "px";
  }

  function capturarClic(ev) {
    if (!activo) return;
    if (ev.target.closest && ev.target.closest("#rv-nota, #rv-panel, #rv-boton, #rv-ver, .rv-globo")) return;
    var seleccion = leerSeleccion();
    ev.preventDefault();
    ev.stopPropagation();
    if (seleccion) {
      seleccionado = seleccion.elemento;
      rangoGuardado = seleccion.rango;
      abrirCaja(ev.pageX, ev.pageY, null, seleccion.frase);
      return;
    }
    seleccionado = objetivoDesde(ev.target);
    rangoGuardado = null;
    abrirCaja(ev.pageX, ev.pageY, null, null);
  }

  /* ── Caja de la marca ───────────────────────────────────────── */

  var caja, campoNota, campoTexto, tituloCaja, subCaja, filaColores, botonBorrar, botonDeshacer, bloqueCambio;

  function cajaAbierta() { return caja && caja.getAttribute("data-abierta") === "si"; }

  function crearCaja() {
    caja = document.createElement("div");
    caja.id = "rv-nota";
    caja.innerHTML =
      '<h4 id="rv-titulo">¿Qué quieres aquí?</h4>' +
      '<p class="rv-objetivo"></p>' +
      '<div class="rv-campo">' +
        '<label class="rv-rotulo" for="rv-nota-texto">Tu nota</label>' +
        '<textarea id="rv-nota-texto" class="rv-nota-texto" placeholder="Qué quieres cambiar y por qué. (Ej. Esta frase suena a folleto.)"></textarea>' +
      '</div>' +
      '<div class="rv-campo rv-campo-cambio">' +
        '<label class="rv-rotulo" for="rv-cambio">Cómo debe quedar <span class="rv-opcional">(opcional)</span></label>' +
        '<textarea id="rv-cambio" class="rv-cambio" placeholder="Escribe el texto nuevo y se aplicará en esta copia al guardar."></textarea>' +
      '</div>' +
      '<div class="rv-fila"><div class="rv-colores"></div></div>' +
      '<div class="rv-fila">' +
        '<button type="button" class="rv-accion rv-accion--peligro rv-borrar" hidden>Borrar</button>' +
        '<button type="button" class="rv-accion rv-deshacer" hidden>Deshacer</button>' +
        '<button type="button" class="rv-accion rv-cancelar" style="margin-left:auto">Cancelar</button>' +
        '<button type="button" class="rv-accion rv-accion--principal rv-guardar">Guardar</button>' +
      '</div>' +
      '<p class="rv-ayuda">Enter guarda · Mayús+Enter salto de línea · Esc cierra</p>';
    document.body.appendChild(caja);

    campoNota = caja.querySelector(".rv-nota-texto");
    campoTexto = caja.querySelector(".rv-cambio");
    tituloCaja = caja.querySelector("#rv-titulo");
    subCaja = caja.querySelector(".rv-objetivo");
    filaColores = caja.querySelector(".rv-colores");
    botonBorrar = caja.querySelector(".rv-borrar");
    botonDeshacer = caja.querySelector(".rv-deshacer");
    bloqueCambio = caja.querySelector(".rv-campo-cambio");

    COLORES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rv-color";
      b.style.background = c.base;
      b.title = c.nombre;
      b.setAttribute("aria-label", c.nombre);
      b.addEventListener("click", function () { elegirColor(c.id); });
      filaColores.appendChild(b);
    });

    caja.querySelector(".rv-cancelar").addEventListener("click", cerrarCaja);
    caja.querySelector(".rv-guardar").addEventListener("click", guardarMarca);
    botonBorrar.addEventListener("click", function () {
      if (editandoId != null) { borrarMarca(editandoId); cerrarCaja(); }
    });
    botonDeshacer.addEventListener("click", function () {
      if (editandoId != null) { deshacerCambio(editandoId); cerrarCaja(); }
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
    Array.prototype.forEach.call(filaColores.children, function (b, i) {
      b.setAttribute("aria-pressed", COLORES[i].id === id ? "true" : "false");
    });
  }

  function abrirCaja(x, y, marca, frase) {
    editandoId = marca ? marca.id : null;
    var el = seleccionado || (marca && document.querySelector(marca.selector));
    var esFragmento = !!(marca ? marca.fragmento : (rangoGuardado && frase));

    tituloCaja.textContent = marca
      ? "Marca " + marca.id
      : (esFragmento ? "Cambiar esta frase" : "Cambiar o comentar este bloque");

    subCaja.innerHTML = esFragmento
      ? 'Frase: <strong>«' + escapar(marca ? marca.fragmento : frase) + '»</strong><br>En: ' + escapar(el ? selectorDe(el) : "")
      : escapar(el ? selectorDe(el) : "") + (el && textoDe(el).length < 120 ? '<br>Texto: «' + escapar(textoDe(el)) + '»' : "");

    campoNota.value = marca ? (marca.nota || "") : "";
    campoTexto.value = marca ? (marca.despues || "") : "";
    campoTexto.placeholder = esFragmento
      ? "Cómo quieres que diga esa frase"
      : "Opcional: el texto completo tal como debe quedar";
    elegirColor(marca ? marca.color : colorActual);
    botonBorrar.hidden = !marca;
    botonDeshacer.hidden = !(marca && marca.despues);

    var ancho = 360;
    var izquierda = Math.min(Math.max(8, x - ancho / 2), window.scrollX + document.documentElement.clientWidth - ancho - 8);
    caja.style.left = izquierda + "px";
    caja.style.top = Math.max(window.scrollY + 8, y + 12) + "px";
    caja.setAttribute("data-abierta", "si");
    if (esFragmento) campoTexto.focus(); else campoNota.focus();
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
    var nota = campoNota.value.trim();
    var nuevo = campoTexto.value.trim();
    var previa = editandoId != null ? marcaPorId(editandoId) : null;
    var el = seleccionado || (previa && document.querySelector(previa.selector));
    if (!el) { cerrarCaja(); return; }

    var esFragmento = !!(previa ? previa.fragmento : (rangoGuardado && normalizar(rangoGuardado.toString())));
    var antes = previa ? previa.antes : (esFragmento ? normalizar(rangoGuardado.toString()) : textoDe(el));

    var marca;
    if (previa) {
      marca = previa;
      marca.nota = nota;
      marca.color = colorActual;
      marca.despues = (nuevo && nuevo !== marca.antes) ? nuevo : "";
      marca.fecha = new Date().toISOString();
    } else {
      marca = {
        id: marcas.reduce(function (max, x) { return Math.max(max, x.id); }, 0) + 1,
        selector: selectorDe(el),
        fragmento: esFragmento ? antes : null,
        antes: antes,
        despues: (nuevo && nuevo !== antes) ? nuevo : "",
        nota: nota,
        color: colorActual,
        fecha: new Date().toISOString()
      };
      marcas.push(marca);
    }

    if (marca.despues) {
      if (rangoGuardado && !previa) sustituirRango(rangoGuardado, marca.despues, marca);
      else aplicarEnLaCopia(marca);
    }
    if (window.getSelection) window.getSelection().removeAllRanges();
    guardar();
    cerrarCaja();
    repintar();
  }

  function editarMarca(id, x, y) {
    var m = marcaPorId(id);
    if (!m) return;
    seleccionado = document.querySelector(m.selector);
    rangoGuardado = null;
    abrirCaja(x, y, m, m.fragmento);
  }

  function borrarMarca(id) {
    var m = marcaPorId(id);
    if (m && m.despues) deshacerCambio(id, true);
    marcas = marcas.filter(function (x) { return x.id !== id; });
    marcas.forEach(function (x, i) { x.id = i + 1; });
    guardar();
    repintar();
  }

  function deshacerCambio(id, silencioso) {
    var m = marcaPorId(id);
    if (!m || !m.despues) return;
    var el = document.querySelector(m.selector);
    if (el) {
      Array.prototype.forEach.call(el.querySelectorAll(".rv-editado"), function (s) {
        if (s.getAttribute("data-rv-original") === m.antes) {
          s.parentNode.replaceChild(document.createTextNode(m.antes), s);
        }
      });
      el.classList.remove("rv-editado");
      el.removeAttribute("data-rv-original");
    }
    m.despues = "";
    if (!silencioso) { guardar(); repintar(); }
  }

  function reaplicarCambios() {
    marcas.forEach(function (m) { if (m.despues) aplicarEnLaCopia(m); });
  }

  /* ── Panel ──────────────────────────────────────────────────── */

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
        '<button type="button" class="rv-accion rv-accion--principal rv-exportar-md">Descargar revisión</button>' +
        '<button type="button" class="rv-accion rv-copiar">Copiar todo</button>' +
        '<button type="button" class="rv-accion rv-exportar-json">JSON para aplicar</button>' +
        '<button type="button" class="rv-accion rv-accion--peligro rv-vaciar">Vaciar página</button>' +
      '</div>' +
      '<p class="rv-ayuda" style="padding:0 12px 12px;margin:0">El archivo incluye todas las páginas que hayas revisado.</p>';
    document.body.appendChild(panel);
    panel.querySelector(".rv-pagina").textContent = PAGINA;
    listaPanel = panel.querySelector(".rv-panel__lista");

    panel.querySelector(".rv-cerrar-panel").addEventListener("click", function () { panel.setAttribute("data-abierto", "no"); });
    panel.querySelector(".rv-exportar-md").addEventListener("click", function () { descargar(markdown(), "Revision-CAMENA.md", "text/markdown"); });
    panel.querySelector(".rv-exportar-json").addEventListener("click", function () { descargar(JSON.stringify(paquete(), null, 2), "Revision-CAMENA.json", "application/json"); });
    panel.querySelector(".rv-copiar").addEventListener("click", function () { copiar(markdown(), panel.querySelector(".rv-copiar")); });
    panel.querySelector(".rv-vaciar").addEventListener("click", function () {
      if (confirm("¿Vaciar las " + marcas.length + " marcas de esta página?")) { marcas = []; guardar(); repintar(); }
    });
  }

  function pintarPanel() {
    listaPanel.innerHTML = "";
    if (!marcas.length) {
      var v = document.createElement("li");
      v.className = "rv-vacio";
      v.innerHTML = "Todavía no hay nada marcado.<br><br>" +
        "<strong>1 ·</strong> Pulsa <em>Marcar</em> (o la tecla M).<br>" +
        "<strong>2 ·</strong> Haz clic en un bloque <em>o selecciona una frase con el ratón</em>.<br>" +
        "<strong>3 ·</strong> Escribe la nota y, si quieres cambiarla, la frase nueva.";
      listaPanel.appendChild(v);
      return;
    }
    marcas.forEach(function (m) {
      var c = colorDe(m.color);
      var li = document.createElement("li");
      li.className = "rv-item";
      li.innerHTML =
        '<span class="rv-item__num" style="--rv-color:' + c.base + '">' + m.id + "</span>" +
        '<span><span class="rv-item__nota">' + escapar(m.nota || (m.despues ? "(cambio sin nota)" : "(sin nota)")) + "</span>" +
        (m.despues
          ? '<span class="rv-cambio-linea"><s>' + escapar(m.antes) + "</s> → <strong>" + escapar(m.despues) + "</strong></span>"
          : '<span class="rv-item__texto">«' + escapar(m.fragmento || m.antes) + "»</span>") +
        '<span class="rv-item__sel">' + escapar(m.selector) + "</span></span>" +
        '<button type="button" class="rv-item__borrar" title="Borrar">×</button>';
      li.addEventListener("click", function (ev) {
        if (ev.target.classList.contains("rv-item__borrar")) { borrarMarca(m.id); return; }
        var el = document.querySelector(m.selector);
        if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      listaPanel.appendChild(li);
    });
  }

  function actualizarContador() {
    var cambios = marcas.filter(function (m) { return m.despues; }).length;
    contadorEl.textContent = marcas.length ? (marcas.length + (cambios ? " ✎" + cambios : "")) : "0";
    contadorEl.style.display = marcas.length ? "inline-block" : "none";
  }

  function escapar(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ── Exportar todo ──────────────────────────────────────────── */

  function paginasRevisadas() {
    var salida = [];
    var paginas = ["index.html", "servicios.html", "como-trabajamos.html"];
    if (paginas.indexOf(PAGINA) < 0) paginas.unshift(PAGINA);
    paginas.forEach(function (p) {
      var datos = [];
      if (p === PAGINA) datos = marcas;
      else { try { datos = JSON.parse(localStorage.getItem(PREFIJO + p) || "[]") || []; } catch (e) { datos = []; } }
      if (datos.length) salida.push({ pagina: p, marcas: datos });
    });
    return salida;
  }

  function paquete() {
    return { generado: new Date().toISOString(), sitio: "CAMENA 2.0", paginas: paginasRevisadas() };
  }

  function markdown() {
    var paginas = paginasRevisadas();
    var total = 0, cambios = 0, notas = 0;
    paginas.forEach(function (b) {
      total += b.marcas.length;
      cambios += b.marcas.filter(function (m) { return m.despues; }).length;
      notas += b.marcas.filter(function (m) { return !m.despues; }).length;
    });

    var l = ["# Revisión del sitio · CAMENA", ""];
    l.push("Generado el " + new Date().toLocaleString("es-MX") + ".");
    l.push("");
    l.push("**" + total + " marcas** en " + paginas.length + " página(s) · " + cambios + " cambio(s) de texto · " + notas + " nota(s).");
    l.push("");

    paginas.forEach(function (bloque) {
      var c = bloque.marcas.filter(function (m) { return m.despues; });
      var n = bloque.marcas.filter(function (m) { return !m.despues; });
      l.push("## " + bloque.pagina + " · " + bloque.marcas.length + " marca(s)");
      l.push("");
      if (c.length) {
        l.push("### Cambios de texto (" + c.length + ")");
        l.push("");
        c.forEach(function (m) {
          l.push("**" + m.id + ".** `" + m.selector + "`");
          l.push("");
          l.push("- Antes: «" + m.antes + "»");
          l.push("- Después: «" + m.despues + "»");
          if (m.nota) l.push("- Nota: " + m.nota);
          l.push("");
        });
      }
      if (n.length) {
        l.push("### Notas (" + n.length + ")");
        l.push("");
        n.forEach(function (m) {
          l.push("**" + m.id + ".** `" + m.selector + "` · " + colorDe(m.color).nombre);
          l.push("");
          l.push("- Señalado: «" + (m.fragmento || m.antes) + "»");
          l.push("- Quiero: " + (m.nota || "(sin nota)"));
          l.push("");
        });
      }
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

  /* ── Botones y aviso ────────────────────────────────────────── */

  function crearBoton() {
    boton = document.createElement("button");
    boton.id = "rv-boton";
    boton.type = "button";
    boton.setAttribute("aria-pressed", "false");
    boton.innerHTML = '<span class="rv-punto"></span><span class="rv-texto">Marcar</span><span id="rv-contador">0</span>';
    document.body.appendChild(boton);
    contadorEl = boton.querySelector("#rv-contador");
    boton.addEventListener("click", function () { encender(); });

    var ver = document.createElement("button");
    ver.type = "button";
    ver.id = "rv-ver";
    ver.textContent = "Ver revisión";
    ver.addEventListener("click", function () {
      panel.setAttribute("data-abierto", panel.getAttribute("data-abierto") === "si" ? "no" : "si");
    });
    document.body.appendChild(ver);

    var aviso = document.createElement("div");
    aviso.id = "rv-aviso";
    aviso.innerHTML = "COPIA DE REVISIÓN · nada de esto se publica · <strong>M</strong> marca · selecciona una frase para cambiarla";
    document.body.appendChild(aviso);
  }

  function iniciar() {
    cargar();
    crearCapa();
    crearCaja();
    crearPanel();
    crearBoton();
    reaplicarCambios();
    repintar();

    document.addEventListener("mousemove", seguirRaton, true);
    document.addEventListener("click", capturarClic, true);
    document.addEventListener("keydown", function (ev) {
      if (ev.target.matches("textarea, input")) return;
      if (ev.key === "m" || ev.key === "M") encender();
      if (ev.key === "Escape") cerrarCaja();
    });
    window.addEventListener("resize", repintar);
    window.addEventListener("load", function () { reaplicarCambios(); repintar(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();

  window.Revisar = {
    encender: encender,
    activo: function () { return activo; },
    marcar: function (selector, nota, color) {
      var el = document.querySelector(selector);
      if (!el) return null;
      var id = marcas.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1;
      marcas.push({ id: id, selector: selector, fragmento: null, antes: textoDe(el), despues: "", nota: nota || "", color: color || "magenta", fecha: new Date().toISOString() });
      guardar(); repintar(); return id;
    },
    editar: function (selector, antes, despues, nota, color) {
      var el = document.querySelector(selector);
      if (!el) return null;
      var id = marcas.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1;
      var marca = { id: id, selector: selector, fragmento: antes, antes: antes, despues: despues, nota: nota || "", color: color || "magenta", fecha: new Date().toISOString() };
      marcas.push(marca);
      aplicarEnLaCopia(marca);
      guardar(); repintar(); return id;
    },
    marcas: function () { return marcas.slice(); },
    markdown: markdown,
    json: function () { return JSON.stringify(paquete(), null, 2); },
    vaciar: function () { marcas = []; guardar(); repintar(); }
  };
})();
