/* ═══════════════════════════════════════════════════════════════
   CAMENA 2.0 · interacciones.js
   Los tres componentes que necesitan comportamiento propio:
   · Disciplinas (acordeón, varias abiertas a la vez)
   · Resolutor de necesidades (pestañas con teclado completo)
   · Proceso (pestañas) y cadena de ecosistema
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── 1 · Disciplinas: acordeón ────────────────────────────── */
  var disciplinas = Array.prototype.slice.call(document.querySelectorAll("[data-disciplina]"));

  disciplinas.forEach(function (disciplina) {
    var boton = disciplina.querySelector(".disciplina__boton");
    var cuerpo = disciplina.querySelector(".disciplina__cuerpo");
    if (!boton || !cuerpo) return;

    boton.addEventListener("click", function () {
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", abierto ? "false" : "true");
      cuerpo.hidden = abierto;
      disciplina.classList.toggle("is-abierta", !abierto);

      /* Al abrir, acercamos el bloque a la vista sin secuestrar el scroll */
      if (!abierto) {
        requestAnimationFrame(function () {
          var arriba = disciplina.getBoundingClientRect().top;
          var limite = 120;
          if (arriba < 0 || arriba > limite) {
            disciplina.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        });
      }
    });
  });

  /* ── 2 · Patrón de pestañas accesible, reutilizable ───────── */
  /* Se usa en el resolutor de necesidades y en el proceso. */
  function activarPestanas(contenedor, opciones) {
    if (!contenedor) return;
    var selectorBoton = opciones.selectorBoton;
    var selectorPanel = opciones.selectorPanel;
    var botones = Array.prototype.slice.call(contenedor.querySelectorAll(selectorBoton));
    if (!botones.length) return;

    function activar(indice, conFoco) {
      botones.forEach(function (boton, i) {
        var activo = i === indice;
        boton.classList.toggle(opciones.claseActiva, activo);
        boton.setAttribute("aria-selected", activo ? "true" : "false");
        boton.tabIndex = activo ? 0 : -1;

        var panel = document.getElementById(boton.getAttribute("aria-controls"));
        if (panel) {
          panel.hidden = !activo;
          panel.classList.toggle(opciones.claseActiva, activo);
        }
      });
      if (conFoco && botones[indice]) botones[indice].focus();
      if (opciones.alActivar) opciones.alActivar(botones[indice]);
    }

    botones.forEach(function (boton, indice) {
      boton.addEventListener("click", function () { activar(indice, false); });

      boton.addEventListener("keydown", function (evento) {
        var tecla = evento.key;
        var salto = 0;

        if (tecla === "ArrowDown" || tecla === "ArrowRight") salto = 1;
        else if (tecla === "ArrowUp" || tecla === "ArrowLeft") salto = -1;
        else if (tecla === "Home") { evento.preventDefault(); activar(0, true); return; }
        else if (tecla === "End") { evento.preventDefault(); activar(botones.length - 1, true); return; }
        else return;

        evento.preventDefault();
        activar((indice + salto + botones.length) % botones.length, true);
      });
    });

    /* Estado inicial coherente con el HTML */
    var inicial = botones.findIndex(function (boton) {
      return boton.getAttribute("aria-selected") === "true";
    });
    activar(inicial < 0 ? 0 : inicial, false);
  }

  /* Proceso */
  activarPestanas(document.getElementById("proceso-lista"), {
    selectorBoton: ".paso",
    selectorPanel: ".detalle",
    claseActiva: "is-activo"
  });

  /* ── 3 · Tarjetas de la franja de precios ───────────────────
     Cada dato del hero abre su detalle. Con ratón ya se abre al pasar por
     encima (eso lo hace el CSS); aquí se resuelve el clic y el teclado, que es
     lo que necesitan el dedo y quien navega sin ratón. */
  var hechos = Array.prototype.slice.call(document.querySelectorAll(".hecho__boton"));

  function cerrarHechos(excepto) {
    hechos.forEach(function (boton) {
      if (boton === excepto) return;
      boton.setAttribute("aria-expanded", "false");
      var globo = document.getElementById(boton.getAttribute("aria-controls"));
      if (globo) globo.removeAttribute("data-abierto");
    });
  }

  hechos.forEach(function (boton) {
    var globo = document.getElementById(boton.getAttribute("aria-controls"));
    if (!globo) return;

    boton.addEventListener("click", function () {
      var abierto = boton.getAttribute("aria-expanded") === "true";
      cerrarHechos(boton);
      boton.setAttribute("aria-expanded", abierto ? "false" : "true");
      if (abierto) globo.removeAttribute("data-abierto");
      else globo.setAttribute("data-abierto", "si");
    });
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") cerrarHechos(null);
  });

  document.addEventListener("click", function (evento) {
    if (!evento.target.closest || !evento.target.closest(".hecho")) cerrarHechos(null);
  });

  /* ── 4 · Cadena del ecosistema ────────────────────────────── */
  var cadena = document.getElementById("cadena");
  if (cadena) {
    var eslabones = Array.prototype.slice.call(cadena.querySelectorAll(".eslabon"));
    var nota = document.getElementById("eslabon-nota");

    function seleccionar(indice) {
      eslabones.forEach(function (eslabon, i) {
        eslabon.classList.toggle("is-activo", i === indice);
      });
      var boton = eslabones[indice] && eslabones[indice].querySelector(".eslabon__boton");
      if (nota && boton && boton.dataset.nota) {
        /* El texto sale de un atributo escrito en el HTML del propio sitio
           (contenido estático, no proviene de terceros), por eso puede
           contener marcado simple como <strong>. */
        nota.innerHTML = boton.dataset.nota;
      }
    }

    eslabones.forEach(function (eslabon, indice) {
      var boton = eslabon.querySelector(".eslabon__boton");
      if (!boton) return;
      boton.addEventListener("click", function () { seleccionar(indice); });
      boton.addEventListener("mouseenter", function () { seleccionar(indice); });
      boton.addEventListener("focus", function () { seleccionar(indice); });
    });
  }
})();
