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


  /* ── Contexto del visitante: los botones «Cuéntanos…» ─────────
     Cada botón de la sección «¿Qué necesitas?» trae en data-prellenar
     el caso que la persona acaba de reconocer como suyo. Antes ese
     dato se perdía: el visitante llegaba al formulario y tenía que
     volver a explicarse. Aquí se conserva y llega escrito. */
  var campoMensaje = document.getElementById("campo-mensaje");
  var botonesContexto = Array.prototype.slice.call(document.querySelectorAll("[data-prellenar]"));
  var ultimoContexto = "";

  if (campoMensaje && botonesContexto.length) {
    botonesContexto.forEach(function (boton) {
      boton.addEventListener("click", function () {
        var contexto = boton.dataset.prellenar;
        if (!contexto) return;
        ultimoContexto = contexto;

        /* No se pisa lo que la persona ya haya escrito a mano: solo se
           reemplaza si el campo está vacío o si lo puso otro botón. */
        var actual = campoMensaje.value.trim();
        var puestoPorNosotros = campoMensaje.dataset.puesto === "1";
        if (actual === "" || puestoPorNosotros) {
          campoMensaje.value = contexto + ". ";
          campoMensaje.dataset.puesto = "1";
        }

        /* El foco va al final del texto para que pueda seguir escribiendo */
        campoMensaje.focus();
        var fin = campoMensaje.value.length;
        try { campoMensaje.setSelectionRange(fin, fin); } catch (e) { /* sin selección */ }

        /* Y se avisa, porque si no el salto parece que no hizo nada */
        var avisar = document.getElementById("contexto-aviso");
        if (avisar) {
          avisar.hidden = false;
          avisar.textContent = "Anotamos tu caso: «" + contexto + "». Complétalo abajo cuando quieras.";
        }
      });
    });

    /* Si la persona borra el texto a mano, se deja de considerar nuestro */
    campoMensaje.addEventListener("input", function () {
      if (campoMensaje.dataset.puesto === "1" && campoMensaje.value.trim() === "") {
        campoMensaje.dataset.puesto = "";
      }
    });
  }


  /* ── Los mismos botones, abriendo WhatsApp con el caso ya escrito ──
     En una cultura que se resuelve por WhatsApp, obligar a llenar un
     formulario pierde ventas. Pero el contexto no se puede perder:
     el mensaje sale redactado con lo que la persona acaba de elegir. */
  Array.prototype.slice.call(document.querySelectorAll("[data-prellenar]")).forEach(function (boton) {
    boton.setAttribute("data-canal", "whatsapp");
  });

  document.addEventListener("click", function (evento) {
    var boton = evento.target.closest ? evento.target.closest("[data-prellenar]") : null;
    if (!boton) return;
    var contexto = boton.dataset.prellenar;
    if (!contexto) return;

    var texto = "Hola CAMENA, vengo de su página. " + contexto + ". "
      + "Quiero saber qué me conviene y cuánto cuesta.";
    var abierto = window.open(
      "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto),
      "_blank", "noopener"
    );

    /* Si el navegador bloquea la ventana, no se deja a la persona sin salida:
       el contexto ya quedó escrito en el formulario, y se le dice dónde. */
    if (!abierto) {
      evento.preventDefault();
      var aviso = document.getElementById("contexto-aviso");
      var destino = document.getElementById("campo-mensaje");
      if (destino) {
        destino.focus();
        destino.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      if (aviso) {
        aviso.hidden = false;
        aviso.textContent = "Tu navegador bloqueó WhatsApp. Anotamos tu caso abajo: "
          + "revísalo y envíalo desde aquí.";
      }
    }
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
