/* ═══════════════════════════════════════════════════════════════
   js/rotador.js — Texto que se escribe y se borra solo.

   Cómo funciona: cualquier elemento con [data-rotador] y una lista de frases
   separadas por «|» en data-frases se va escribiendo letra por letra, se queda
   un momento, se borra y pasa a la siguiente. Sin bibliotecas: solo JavaScript
   nativo y temporizadores.

   Cuatro reglas que no se negocian:

   1 · SIN JAVASCRIPT SE VE. La primera frase está escrita en el HTML, no la
       pone el script. Si el visitante tiene el JavaScript apagado, o el archivo
       no carga, ahí está la frase completa y el diseño no se mueve.
   2 · QUIEN PIDE CALMA, LA TIENE. Con prefers-reduced-motion: reduce el rotador
       se queda quieto en la primera frase. Nada de escribir y borrar para quien
       pidió que no haya movimiento.
   3 · LOS LECTORES DE PANTALLA NO OYEN EL TECLEO. Lo que se anima va marcado
       aria-hidden; al lado hay una versión quieta y oculta a la vista con todo
       el contenido de una vez. Así se lee una frase completa y no cuarenta
       cambios a medias.
   4 · EL DISEÑO NO SALTA. Antes de empezar se reserva el alto de la frase más
       larga, así que lo de abajo no se mueve mientras se escribe. Eso es lo que
       hace que el efecto se sienta cuidado y no tembloroso.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var rotadores = Array.prototype.slice.call(document.querySelectorAll("[data-rotador]"));
  if (!rotadores.length) return;

  var CALMA = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  /* Ritmo: una frase de 70 letras tarda unos tres segundos en escribirse, se
     queda dos y medio y se borra rápido. Si se escribe más despacio se siente
     lento; si se borra despacio, se siente roto. */
  var MS_LETRA = 42;
  var MS_ESCRITA = 2400;
  var MS_BORRADO = 22;
  var pausado = false;

  function frasesDe(el) {
    return (el.getAttribute("data-frases") || "")
      .split("|")
      .map(function (f) { return f.trim(); })
      .filter(Boolean);
  }

  function crearCursor() {
    var c = document.createElement("span");
    c.className = "rotador__cursor";
    c.setAttribute("aria-hidden", "true");
    return c;
  }

  /* Reserva el alto de la frase más larga para que nada de abajo se mueva. */
  function reservarAlto(el, frases) {
    var masLarga = frases.reduce(function (a, b) { return b.length > a.length ? b : a; }, "");
    var copia = window.getComputedStyle(el);
    var medidor = document.createElement("span");
    medidor.setAttribute("aria-hidden", "true");
    medidor.style.cssText = "position:absolute;left:0;right:0;visibility:hidden;pointer-events:none;";
    medidor.style.font = copia.font;
    medidor.style.lineHeight = copia.lineHeight;
    medidor.style.letterSpacing = copia.letterSpacing;
    medidor.style.display = "block";
    medidor.textContent = masLarga;
    el.appendChild(medidor);
    var alto = medidor.getBoundingClientRect().height;
    el.removeChild(medidor);
    if (alto > 0) el.style.minHeight = Math.ceil(alto) + "px";
  }

  rotadores.forEach(function (el) {
    var frases = frasesDe(el);
    if (frases.length < 2) return;

    var salida = document.createElement("span");
    salida.className = "rotador__texto";
    var inicial = (el.textContent || "").trim() || frases[0];
    salida.textContent = inicial;
    el.textContent = "";
    el.appendChild(salida);
    el.appendChild(crearCursor());
    el.classList.add("rotador--activo");
    reservarAlto(el, frases);

    if (CALMA && CALMA.matches) return;   /* se queda quieto en la primera */

    var indice = Math.max(0, frases.indexOf(inicial));
    var posicion = inicial.length;
    var borrando = false;

    function paso() {
      if (pausado) return;
      var frase = frases[indice];
      if (!borrando) {
        posicion += 1;
        salida.textContent = frase.slice(0, posicion);
        if (posicion >= frase.length) {
          borrando = true;
          setTimeout(paso, MS_ESCRITA);
          return;
        }
        setTimeout(paso, MS_LETRA);
      } else {
        posicion -= 1;
        salida.textContent = frase.slice(0, Math.max(0, posicion));
        if (posicion <= 0) {
          borrando = false;
          indice = (indice + 1) % frases.length;
          setTimeout(paso, MS_LETRA * 5);
          return;
        }
        setTimeout(paso, MS_BORRADO);
      }
    }

    /* Con la pestaña en segundo plano se detiene: no tiene sentido gastar
       batería escribiendo para nadie. Al volver, sigue donde iba. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        pausado = true;
      } else if (pausado) {
        pausado = false;
        paso();
      }
    });

    setTimeout(paso, MS_ESCRITA);
  });
})();
