/* ═══════════════════════════════════════════════════════════════
   CAMENA 2.0 · navegacion.js
   Cabecera, menú móvil, progreso de lectura, sección activa y
   acceso flotante a WhatsApp.
   Todo es mejora progresiva: sin este archivo el sitio sigue
   navegándose y leyéndose completo.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var raiz = document.documentElement;


  /* Los precios de los paquetes viven en el HTML (clase .paquete__precio),
     no aquí: así se ven sin JavaScript, los indexa el buscador y una tarifa
     equivocada no queda escondida detrás de un script. */

  /* ── Cabecera: fondo al desplazar y se oculta al bajar ───────── */
  var cabecera = document.getElementById("cabecera");
  var ultimoY = 0;
  var bajando = false;

  function actualizarCabecera(y) {
    if (!cabecera) return;

    cabecera.classList.toggle("cabecera--pegada", y > 12);

    var menuAbierto = cabecera.classList.contains("cabecera--menu");
    var puedeOcultarse = y > 480 && !menuAbierto;
    cabecera.classList.toggle("cabecera--oculta", puedeOcultarse && bajando);
  }

  /* ── Progreso de lectura ─────────────────────────────────────── */
  var barra = document.getElementById("progresoBarra");

  function actualizarProgreso(y) {
    if (!barra) return;
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    var avance = alto > 0 ? Math.min(y / alto, 1) : 0;
    barra.style.transform = "scaleX(" + avance.toFixed(4) + ")";
  }

  /* ── Acceso flotante: aparece al dejar el hero atrás ─────────── */
  var flotante = document.getElementById("flotante");

  function actualizarFlotante(y) {
    if (!flotante) return;
    var visible = y > window.innerHeight * 0.6;
    flotante.dataset.visible = visible ? "true" : "false";
  }

  /* Un solo listener con requestAnimationFrame: sin trabajo duplicado */
  var pendiente = false;
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      bajando = y > ultimoY;
      ultimoY = y;
      actualizarCabecera(y);
      actualizarProgreso(y);
      actualizarFlotante(y);
      pendiente = false;
    });
  }

  window.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar, { passive: true });

  /* ── Menú móvil ───────────────────────────────────────────────
     Se activa por debajo de 1140 px, el mismo punto que usa el CSS.
     Si se cambia uno, hay que cambiar el otro. */
  var menuBoton = document.getElementById("menuBoton");
  var nav = document.getElementById("nav");

  function cerrarMenu() {
    if (!nav || !menuBoton) return;
    nav.classList.remove("is-abierto");
    menuBoton.setAttribute("aria-expanded", "false");
    menuBoton.setAttribute("aria-label", "Abrir menú de navegación");
    document.body.classList.remove("menu-abierto");
    if (cabecera) cabecera.classList.remove("cabecera--menu");
    alDesplazar();
  }

  function abrirMenu() {
    if (!nav || !menuBoton) return;
    nav.classList.add("is-abierto");
    menuBoton.setAttribute("aria-expanded", "true");
    menuBoton.setAttribute("aria-label", "Cerrar menú de navegación");
    document.body.classList.add("menu-abierto");
    if (cabecera) {
      cabecera.classList.add("cabecera--menu");
      cabecera.classList.remove("cabecera--oculta");
    }
  }

  if (menuBoton && nav) {
    menuBoton.addEventListener("click", function () {
      if (nav.classList.contains("is-abierto")) cerrarMenu();
      else abrirMenu();
    });

    /* Al elegir un destino se cierra y el foco vuelve al contenido */
    nav.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) cerrarMenu();
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && nav.classList.contains("is-abierto")) {
        cerrarMenu();
        menuBoton.focus();
      }
    });

    /* Si el ancho vuelve a escritorio, se limpia el estado del menú */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1140 && nav.classList.contains("is-abierto")) cerrarMenu();
    });
  }

  /* ── Sección activa en la navegación ───────────────────────── */
  var enlaces = Array.prototype.slice.call(document.querySelectorAll(".nav__enlace[href^='#']"));
  var secciones = enlaces
    .map(function (enlace) {
      var destino = document.querySelector(enlace.getAttribute("href"));
      return destino ? { enlace: enlace, seccion: destino } : null;
    })
    .filter(Boolean);

  if (secciones.length && "IntersectionObserver" in window) {
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          secciones.forEach(function (par) {
            var activa = par.seccion === entrada.target;
            par.enlace.classList.toggle("is-actual", activa);
            if (activa) par.enlace.setAttribute("aria-current", "true");
            else par.enlace.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    secciones.forEach(function (par) { observador.observe(par.seccion); });
  }

  /* ── Año del pie ────────────────────────────────────────────── */
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = String(new Date().getFullYear());

  /* Estado inicial */
  actualizarCabecera(window.scrollY || 0);
  actualizarProgreso(window.scrollY || 0);
  actualizarFlotante(window.scrollY || 0);
})();
