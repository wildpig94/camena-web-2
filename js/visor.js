/* ═══════════════════════════════════════════════════════════════
   js/visor.js — Ver una captura en tamaño completo.

   Cómo funciona: cualquier enlace con [data-visor] apunta a la imagen en su
   tamaño real. Al hacer clic, en vez de salir de la página se abre una capa
   encima con la imagen completa. Se cierra con Escape, con el botón, o haciendo
   clic fuera de la imagen.

   Tres reglas:

   1 · SIN JAVASCRIPT TAMBIÉN SIRVE. El enlace apunta al archivo de la imagen,
       así que sin JavaScript se abre en el navegador y se puede ampliar. La capa
       es una mejora, no el único camino.
   2 · SE PUEDE CERRAR SIN RATÓN. Escape cierra, el foco entra al botón de
       cerrar al abrir y vuelve al enlace al cerrar. Quien navega con teclado no
       se queda encerrado.
   3 · NO SE ROMPE EL FONDO. Mientras la capa está abierta, el cuerpo de la
       página no se desplaza, así que al cerrar se vuelve exactamente donde
       estabas.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var enlaces = Array.prototype.slice.call(document.querySelectorAll("[data-visor]"));
  var capa = document.getElementById("visor");
  if (!enlaces.length || !capa) return;

  var imagen = capa.querySelector(".visor__imagen");
  var cerrar = capa.querySelector(".visor__cerrar");
  var disparador = null;
  var scrollPrevio = 0;

  function abrir(url, texto, enlace) {
    disparador = enlace;
    imagen.src = url;
    imagen.alt = texto;
    capa.hidden = false;
    scrollPrevio = window.scrollY;
    document.body.style.overflow = "hidden";
    cerrar.focus();
  }

  function ocultar() {
    if (capa.hidden) return;
    capa.hidden = true;
    imagen.removeAttribute("src");
    document.body.style.overflow = "";
    window.scrollTo(0, scrollPrevio);
    if (disparador) disparador.focus();
    disparador = null;
  }

  enlaces.forEach(function (enlace) {
    enlace.addEventListener("click", function (evento) {
      /* Con Ctrl, Cmd o clic central manda el navegador: así se puede abrir la
         imagen en otra pestaña o guardarla, que es lo que espera quien lo hace. */
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button !== 0) return;
      var img = enlace.querySelector("img");
      if (!img) return;
      evento.preventDefault();
      abrir(enlace.getAttribute("href"), img.getAttribute("alt") || "", enlace);
    });
  });

  cerrar.addEventListener("click", ocultar);

  /* Un clic en el fondo cierra; un clic en la imagen, no. */
  capa.addEventListener("click", function (evento) {
    if (evento.target === capa) ocultar();
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") ocultar();
  });
})();
