/* ═══════════════════════════════════════════════════════════════
   CAMENA 2.0 · contacto.js

   Tres cosas independientes, cada una en su propia función de arranque:
     1 · Copiar los datos de contacto
     2 · Conservar el contexto que la persona declaró al elegir su caso
     3 · El formulario que compone el mensaje y lo entrega a WhatsApp

   Van separadas a propósito: un `return` temprano en una no puede
   abortar las otras. Ese error ya ocurrió dos veces en este proyecto
   y dejó funciones muertas sin que se notara.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var WHATSAPP = "524435794642";
  var CORREO = "camenalabs@proton.me";

  /* ═══ 1 · Copiar datos de contacto ═══════════════════════════ */
  function iniciarCopiar() {
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
            /* Si el navegador bloquea el portapapeles no se miente:
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
  }

  /* ═══ 2 · El contexto que la persona ya declaró ══════════════
     Cada botón de «¿Qué necesitas?» trae en data-prellenar el caso que
     la persona acaba de reconocer como suyo. Antes ese dato se perdía:
     llegaba al formulario y tenía que volver a explicarse. */
  function iniciarContexto() {
    var campoMensaje = document.getElementById("campo-mensaje");
    var botones = Array.prototype.slice.call(document.querySelectorAll("[data-prellenar]"));
    if (!campoMensaje || !botones.length) return;

    botones.forEach(function (boton) {
      boton.addEventListener("click", function () {
        var contexto = boton.dataset.prellenar;
        if (!contexto) return;

        /* No se pisa lo que la persona escribió a mano: solo se reemplaza
           si el campo está vacío o si lo puso otro botón. */
        var actual = campoMensaje.value.trim();
        var puestoPorNosotros = campoMensaje.dataset.puesto === "1";
        if (actual === "" || puestoPorNosotros) {
          campoMensaje.value = contexto + ". ";
          campoMensaje.dataset.puesto = "1";
        }

        var aviso = document.getElementById("contexto-aviso");
        if (aviso) {
          aviso.hidden = false;
          aviso.textContent = "Anoté tu caso: «" + contexto + "». Puedes afinarlo abajo.";
        }
      });
    });

    /* Si la persona borra el texto a mano, deja de ser nuestro */
    campoMensaje.addEventListener("input", function () {
      if (campoMensaje.dataset.puesto === "1" && campoMensaje.value.trim() === "") {
        campoMensaje.dataset.puesto = "";
      }
    });
  }

  /* ═══ 3 · Los mismos botones, abriendo WhatsApp ══════════════
     En una cultura que se resuelve por WhatsApp, obligar a llenar un
     formulario pierde ventas. El contexto viaja en el mensaje. */
  function iniciarWhatsAppConContexto() {
    var botones = Array.prototype.slice.call(document.querySelectorAll("[data-prellenar]"));
    if (!botones.length) return;

    document.addEventListener("click", function (evento) {
      var boton = evento.target.closest ? evento.target.closest("[data-prellenar]") : null;
      if (!boton) return;
      var contexto = boton.dataset.prellenar;
      if (!contexto) return;

      var texto = "Hola CAMENA, vengo de tu página. " + contexto
        + ". Quiero saber qué me conviene y cuánto cuesta.";
      var abierto = window.open(
        "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto),
        "_blank", "noopener"
      );

      /* Si el navegador bloquea la ventana no se deja a la persona sin salida:
         el texto ya quedó escrito en el formulario y se le dice dónde. */
      if (!abierto) {
        evento.preventDefault();
        var destino = document.getElementById("campo-mensaje");
        var aviso = document.getElementById("contexto-aviso");
        if (destino) {
          destino.focus();
          destino.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        if (aviso) {
          aviso.hidden = false;
          aviso.textContent = "Tu navegador bloqueó WhatsApp. Anoté tu caso abajo: "
            + "revísalo y envíalo desde aquí.";
        }
      }
    });
  }

  /* ═══ 4 · El formulario ══════════════════════════════════════ */
  function iniciarFormulario() {
    var formulario = document.getElementById("formulario");
    if (!formulario) return;

    var campos = [
      { id: "campo-nombre", error: "error-nombre" },
      { id: "campo-contacto", error: "error-contacto" },
      { id: "campo-mensaje", error: "error-mensaje" }
    ].map(function (par) {
      var control = document.getElementById(par.id);
      return {
        control: control,
        aviso: document.getElementById(par.error),
        caja: control ? control.closest(".campo") : null
      };
    }).filter(function (par) { return par.control; });

    function marcar(par, hayError) {
      if (par.caja) par.caja.classList.toggle("is-error", hayError);
      if (par.aviso) par.aviso.hidden = !hayError;
      par.control.setAttribute("aria-invalid", hayError ? "true" : "false");
      if (hayError && par.aviso && par.aviso.id) {
        par.control.setAttribute("aria-describedby", par.aviso.id);
      } else {
        par.control.removeAttribute("aria-describedby");
      }
    }

    campos.forEach(function (par) {
      par.control.addEventListener("input", function () {
        if (par.caja && par.caja.classList.contains("is-error")) marcar(par, false);
      });
    });

    function valorDe(id) {
      var el = document.getElementById(id);
      return el ? el.value : "";
    }

    function componerMensaje() {
      var nombre = valorDe("campo-nombre");
      var contacto = valorDe("campo-contacto");
      var tipo = valorDe("campo-tipo");
      var presupuesto = valorDe("campo-presupuesto");
      var plazo = valorDe("campo-plazo");
      var mensaje = valorDe("campo-mensaje");

      var lineas = [];
      lineas.push("Hola CAMENA, quiero contarte un proyecto.");
      lineas.push("");
      lineas.push("Nombre: " + nombre.trim());
      lineas.push(tipo
        ? "Me interesa: " + tipo
        : "Todavía no sé qué necesito exactamente.");
      if (presupuesto) lineas.push("Presupuesto aproximado: " + presupuesto);
      if (plazo) lineas.push("Para cuándo: " + plazo);
      lineas.push("");
      lineas.push(mensaje.trim());
      lineas.push("");
      lineas.push("Respóndeme a: " + contacto.trim());
      return lineas.join("\n");
    }

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      var valido = true;
      var primeroInvalido = null;

      campos.forEach(function (par) {
        var valor = par.control.value.trim();
        var hayError = valor === "";

        /* El dato de contacto tiene que servir para responder de verdad */
        if (!hayError && par.control.id === "campo-contacto") {
          hayError = !(/@/.test(valor) || valor.replace(/\D/g, "").length >= 8);
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

      /* Alternativa por correo, por si el navegador bloquea la ventana */
      var enlaceCorreo = document.getElementById("enviadoCorreo");
      if (enlaceCorreo) {
        enlaceCorreo.href = "mailto:" + CORREO
          + "?subject=" + encodeURIComponent("Nuevo proyecto desde el sitio web")
          + "&body=" + encodeURIComponent(texto);
      }

      var abierto = window.open(
        "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto),
        "_blank", "noopener"
      );

      var confirmacion = document.getElementById("enviado");
      if (confirmacion) {
        confirmacion.hidden = false;
        var titulo = confirmacion.querySelector(".enviado__titulo");
        if (titulo && !abierto) {
          titulo.textContent = "Tu mensaje está listo, pero el navegador bloqueó la ventana.";
        }
      }
    });
  }


  /* ═══ 5 · Armar el paquete y cotizar al momento ══════════════
     La persona marca lo que necesita y ve la suma mientras elige.
     El botón arma el mensaje con la lista y el total, para que la
     cotización salga sin una ida y vuelta. */
  function iniciarArmador() {
    var formulario = document.getElementById("armarFormulario");
    var total = document.getElementById("armarTotal");
    var nota = document.getElementById("armarNota");
    var enlace = document.getElementById("armarEnviar");
    if (!formulario || !total || !enlace) return;

    var casillas = Array.prototype.slice.call(formulario.querySelectorAll('input[type="checkbox"]'));

    function miles(n) {
      return "$" + n.toLocaleString("es-MX");
    }

    function calcular() {
      var elegidos = casillas.filter(function (c) { return c.checked; });
      var suma = elegidos.reduce(function (t, c) { return t + Number(c.dataset.precio || 0); }, 0);

      total.textContent = miles(suma);

      if (!elegidos.length) {
        nota.textContent = "Marca lo que necesitas para ver el total.";
      } else {
        nota.textContent = elegidos.length === 1
          ? "Un servicio. El precio final depende del tamaño del proyecto."
          : elegidos.length + " servicios. El precio final depende del tamaño del proyecto.";
      }

      /* El mensaje sale armado: la persona no tiene que volver a explicarse */
      var lineas = ["Hola CAMENA, armé mi paquete desde tu página:"];
      lineas.push("");
      elegidos.forEach(function (c) {
        lineas.push("· " + c.value + " (" + miles(Number(c.dataset.precio || 0)) + ")");
      });
      lineas.push("");
      lineas.push(elegidos.length
        ? "Suma aproximada: " + miles(suma) + " MXN"
        : "Todavía no sé qué necesito: ¿me orientas?");
      lineas.push("");
      lineas.push("¿Me confirmas el precio y el tiempo de entrega?");

      enlace.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lineas.join("\n"));
    }

    casillas.forEach(function (c) { c.addEventListener("change", calcular); });
    calcular();
  }

  /* ═══ Arranque ═══════════════════════════════════════════════
     Cada bloque por separado: si uno falla o no encuentra su parte en
     la página, los demás siguen funcionando. */
  iniciarCopiar();
  iniciarContexto();
  iniciarWhatsAppConContexto();
  iniciarFormulario();
  iniciarArmador();
})();
