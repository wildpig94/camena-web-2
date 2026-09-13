/* ═══════════════════════════════════════════════════════════════
   CAMENA 2.0 · animaciones.js
   Aparición de bloques al entrar en pantalla.

   Hay tres mecanismos y ninguno depende de que el anterior funcione:
     1 · IntersectionObserver (el más eficiente)
     2 · Comprobación por scroll y resize con rAF (respaldo real)
     3 · Red de seguridad por tiempo
   Es preferible perder el efecto a perder el contenido: si algo
   falla, el bloque se muestra sin animación.
   Si la persona pidió movimiento reducido, todo aparece de golpe.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var piezas = Array.prototype.slice.call(document.querySelectorAll("[data-revelar]"));
  var maquetas = Array.prototype.slice.call(document.querySelectorAll(".lab-pieza"));
  var todos = piezas.concat(maquetas);
  if (!todos.length) return;

  var movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revelar(elemento) {
    elemento.classList.add("is-visible");
  }

  /* Movimiento reducido: no hay nada que animar */
  if (movimientoReducido) {
    todos.forEach(revelar);
    return;
  }

  /* ── 1 · IntersectionObserver ───────────────────────────────── */
  var observador = null;
  if ("IntersectionObserver" in window) {
    observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          revelar(entrada.target);
          observador.unobserve(entrada.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
    todos.forEach(function (nodo) { observador.observe(nodo); });
  }

  /* ── 2 · Respaldo por scroll ──────────────────────────────────
     Recorre lo que siga oculto y lo revela al entrar en pantalla.
     La lista se va vaciando, así que el coste baja solo conforme
     la persona avanza por la página. */
  var pendientes = todos.slice();
  var enCola = false;

  function revisarVisibles() {
    enCola = false;
    if (!pendientes.length) return;

    var limiteInferior = window.innerHeight - 60;
    pendientes = pendientes.filter(function (nodo) {
      if (nodo.classList.contains("is-visible")) return false;
      var caja = nodo.getBoundingClientRect();
      if (caja.top <= limiteInferior && caja.bottom >= -80) {
        revelar(nodo);
        if (observador) observador.unobserve(nodo);
        return false;
      }
      return true;
    });

    if (!pendientes.length) {
      window.removeEventListener("scroll", pedirRevision);
      window.removeEventListener("resize", pedirRevision);
    }
  }

  function pedirRevision() {
    if (enCola) return;
    enCola = true;
    requestAnimationFrame(revisarVisibles);
  }

  window.addEventListener("scroll", pedirRevision, { passive: true });
  window.addEventListener("resize", pedirRevision, { passive: true });
  pedirRevision();

  /* ── 3 · Red de seguridad ─────────────────────────────────────
     Dos comprobaciones por tiempo. La primera cubre lo que ya está a
     la vista; la segunda es un límite duro: pasados unos segundos no
     puede quedar NADA oculto. Es preferible perder el efecto de
     aparición a perder el contenido. */
  window.setTimeout(function () {
    var limite = window.innerHeight + 40;
    todos.forEach(function (nodo) {
      if (nodo.classList.contains("is-visible")) return;
      if (nodo.getBoundingClientRect().top < limite) revelar(nodo);
    });
  }, 900);

  window.setTimeout(revelarTodo, 3000);
})();
