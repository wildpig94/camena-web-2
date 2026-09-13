/* ═══════════════════════════════════════════════════════════════
   CAMENA 2.0 · contacto.js
   El formulario compone un mensaje y lo entrega a WhatsApp (o al
   correo, como alternativa). No hay backend y no lo simulamos:
   el sitio no promete guardar nada en un servidor.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var WHATSAPP = "524435794642";
  var CORREO = "camenalabs@proton.me";

  /* ── Copiar datos de contacto ───────────────────────────────── */
  Array.prototype.slice.call(document.querySelectorAll("[data-copiar]")).forEach(function (boton) {
    boton.addEventListener("click", function () {
      var valor = boton.dataset.copiar;
      var etiqueta = boton.querySelector(".copiar__texto");
      var original = etiqueta ? etiqueta.textContent : "";

      function confirmar() {
        boton.classList.add("is-copiado");
        if (etiqueta) etiqueta.textContent = "Copiado";
        window.setTimeout(function () {
          boton.classList.remove("is-copiado");
          if (etiqueta) etiqueta.textContent = original;
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(valor).then(confirmar, function () {
          /* Si el navegador bloquea el portapapeles no se miente al usuario:
             el dato sigue visible y seleccionable en pantalla. */
          if (etiqueta) etiqueta.textContent = "Copia manual";
          window.setTimeout(function () { if (etiqueta) etiqueta.textContent = original; }, 2600);
        });
      } else if (etiqueta) {
        etiqueta.textContent = "Copia manual";
        window.setTimeout(function () { etiqueta.textContent = original; }, 2600);
      }
    });
  });

  /* ── Formulario ─────────────────────────────────────────────── */
  var formulario = document.getElementById("formulario");
  if (!formulario) return;

  var campos = [
    { id: "campo-nombre", error: "error-nombre" },
    { id: "campo-contacto", error: "error-contacto" },
    { id: "campo-mensaje", error: "error-mensaje" }
  ].map(function (par) {
    return {
      control: document.getElementById(par.id),
      aviso: document.getElementById(par.error),
      caja: document.getElementById(par.id) ? document.getElementById(par.id).closest(".campo") : null
    };
  }).filter(function (par) { return par.control; });

  function marcar(par, hayError) {
    if (par.caja) par.caja.classList.toggle("is-error", hayError);
    if (par.aviso) par.aviso.hidden = !hayError;
    par.control.setAttribute("aria-invalid", hayError ? "true" : "false");
    if (hayError) {
      if (par.aviso && par.aviso.id) par.control.setAttribute("aria-describedby", par.aviso.id);
    } else {
      par.control.removeAttribute("aria-describedby");
    }
  }

  /* Al corregir, el aviso desaparece: no se regaña dos veces */
  campos.forEach(function (par) {
    par.control.addEventListener("input", function () {
      if (par.caja && par.caja.classList.contains("is-error")) marcar(par, false);
    });
  });

  function componerMensaje() {
    var nombre = (document.getElementById("campo-nombre") || {}).value || "";
    var contacto = (document.getElementById("campo-contacto") || {}).value || "";
    var tipo = (document.getElementById("campo-tipo") || {}).value || "";
    var mensaje = (document.getElementById("campo-mensaje") || {}).value || "";

    var lineas = [];
    lineas.push("Hola CAMENA, quiero contarles un proyecto.");
    lineas.push("");
    lineas.push("Nombre: " + nombre.trim());
    if (tipo) lineas.push("Me interesa: " + tipo);
    else lineas.push("Todavía no sé qué necesito exactamente.");
    lineas.push("");
    lineas.push(mensaje.trim());
    lineas.push("");
    lineas.push("Pueden responderme a: " + contacto.trim());
    lineas.push("(Escribo desde su sitio web.)");
    return lineas.join("\n");
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var valido = true;
    var primeroInvalido = null;

    campos.forEach(function (par) {
      var valor = par.control.value.trim();
      var hayError = valor === "";

      /* El dato de contacto debe servir para responder de verdad */
      if (!hayError && par.control.id === "campo-contacto") {
        var pareceContacto = /@/.test(valor) || (valor.replace(/\D/g, "").length >= 8);
        hayError = !pareceContacto;
      }

      marcar(par, hayError);
      if (hayError) {
        valido = false;
        if (!primeroInvalido) primeroInvalido = par.control;
      }
    });

    if (!valido) {
      if (primeroInvalido) primeroInvalido.focus();
      return;
    }

    var texto = componerMensaje();
    var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);

    /* Alternativa por correo por si el navegador bloquea la ventana */
    var enlaceCorreo = document.getElementById("enviadoCorreo");
    if (enlaceCorreo) {
      enlaceCorreo.href = "mailto:" + CORREO +
        "?subject=" + encodeURIComponent("Nuevo proyecto desde el sitio web") +
        "&body=" + encodeURIComponent(texto);
    }

    var abierto = window.open(url, "_blank", "noopener");

    var aviso = document.getElementById("enviado");
    if (aviso) {
      aviso.hidden = false;
      var titulo = aviso.querySelector(".enviado__titulo");
      if (titulo && !abierto) {
        titulo.textContent = "Tu mensaje está listo, pero el navegador bloqueó la ventana.";
      }
    }
  });
})();
