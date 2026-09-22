/* ═══════════════════════════════════════════════════════════════
   CAMENA 2.0 · diagnostico.js
   El instrumento del diagnóstico: mide lo que se le está escapando al negocio.

   Qué hace y qué NO hace:
   · SÍ recoge los datos de la operación —qué se repite, cuántas horas, cuánto
     se echa a perder, cuánto se debe— y hace la aritmética con LOS NÚMEROS DE
     QUIEN CONTESTA: suma horas al mes, dinero que se escapa y mensajes
     repetidos. Eso es aritmética, no diagnóstico.
   · NO reparte servicios ni dictamina. El veredicto no es de la página: el
     diagnóstico lo hace el estudio, por llamada o por WhatsApp, con estos datos
     delante. Aquí solo se ordenan los huecos para no hacerle perder la tarde a
     nadie preguntando lo que ya se puede saber.

   Reglas que no se rompen:
   1 · Ninguna cifra se inventa: todas salen de lo que la persona escribió, y
       cuando no contestó un número, ese renglón no se muestra.
   2 · Se dice también lo que un sistema NO resuelve. Un instrumento que solo
       encuentra lo que él mismo vende no sirve para decidir.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var formulario = document.getElementById("diagnostico");
  if (!formulario) return;

  var resultado = document.getElementById("diagResultado");
  var resumen = document.getElementById("diagResumen");
  var hallazgos = document.getElementById("diagHallazgos");
  var limites = document.getElementById("diagLimites");
  var enviar = document.getElementById("diagEnviar");
  var falta = document.getElementById("diagFalta");
  var otra = document.getElementById("diagOtra");

  var TELEFONO = "524435794642";
  var SEMANAS = 4.33;   /* semanas por mes */
  var DIAS = 26;        /* días laborables al mes, para los mensajes */

  function num(nombre) {
    var campo = formulario.querySelector('[name="' + nombre + '"]');
    if (!campo) return 0;
    var v = parseFloat(String(campo.value).replace(/[^0-9.]/g, ""));
    return isNaN(v) ? 0 : v;
  }
  function texto(nombre) {
    var campo = formulario.querySelector('[name="' + nombre + '"]');
    return campo ? campo.value.trim() : "";
  }
  function elegido(nombre) {
    var campo = formulario.querySelector('[name="' + nombre + '"]:checked');
    return campo ? campo.value : "";
  }
  /* El texto legible de lo que se eligió: en los desplegables el valor es
     corto («no-se») y lo que se lee es la opción («no lo sé»). */
  function elegidoTexto(nombre) {
    var campo = formulario.querySelector('[name="' + nombre + '"]');
    if (!campo) return "";
    if (campo.tagName === "SELECT") {
      var o = campo.options[campo.selectedIndex];
      return o && o.value ? o.textContent.trim() : "";
    }
    var r = formulario.querySelector('[name="' + nombre + '"]:checked');
    if (!r) return "";
    var etiqueta = r.parentElement.querySelector("span:last-child");
    return etiqueta ? etiqueta.textContent.trim() : r.value;
  }
  function pesos(n) {
    return "$" + Math.round(n).toLocaleString("es-MX");
  }

  /* ── La aritmética, con los números de quien contesta ─────────────────── */
  function medir() {
    var dias = num("dias"), horas = num("horas");
    var merma = num("merma"), compras = num("compras"), perdidas = num("perdidas");
    var fiado = num("fiado"), mensajes = num("mensajes"), deCadaDiez = num("mismos");
    var citas = num("citas");

    return {
      dias: dias, horas: horas,
      horasMes: dias && horas ? Math.round(horas * dias * SEMANAS) : 0,
      escapaMes: Math.round((merma + compras) * SEMANAS + perdidas),
      mermaMes: Math.round(merma * SEMANAS),
      comprasMes: Math.round(compras * SEMANAS),
      perdidas: perdidas,
      fiado: fiado,
      mensajesMes: mensajes ? Math.round(mensajes * DIAS) : 0,
      repetidosMes: mensajes && deCadaDiez ? Math.round(mensajes * (deCadaDiez / 10) * DIAS) : 0,
      citas: citas
    };
  }

  /* ── Los huecos que encontró, uno por renglón ─────────────────────────── */
  function encontrar(m) {
    var lista = [];
    var repite = texto("repite");

    if (m.horasMes) {
      lista.push({
        titulo: "≈ " + m.horasMes + " horas al mes en tareas que se repiten",
        detalle: (repite ? "«" + repite + "». " : "") +
          "Son " + m.horas + " horas al día, " + m.dias + " días a la semana. Es tiempo que ya estás pagando y que no aparece en ningún lado.",
        resuelve: "un sistema quita de en medio lo repetitivo: se captura una vez y de ahí salen la nota, el corte y el aviso."
      });
    }

    if (m.escapaMes) {
      var partes = [];
      if (m.mermaMes) partes.push(pesos(m.mermaMes) + " de lo que se echa a perder o desaparece");
      if (m.comprasMes) partes.push(pesos(m.comprasMes) + " de compras de más o de menos");
      if (m.perdidas) partes.push(pesos(m.perdidas) + " de ventas que no se cerraron");
      lista.push({
        titulo: "≈ " + pesos(m.escapaMes) + " al mes que se te escapan",
        detalle: "Sale de sumar " + partes.join(", ") + ".",
        resuelve: "inventario con avisos de reposición y un registro que se lleva solo: lo que hay, lo que falta y lo que se va."
      });
    }

    if (m.fiado) {
      var edad = elegidoTexto("antiguedad");
      lista.push({
        titulo: pesos(m.fiado) + " en la calle, entre fiado y abonos",
        detalle: edad && elegido("antiguedad") !== "no-se"
          ? "El más viejo: " + edad.toLowerCase() + ". Entre más viejo, más difícil de cobrar."
          : "No sabes cuál es el más viejo, y eso es parte del problema: sin fechas no hay a quién cobrarle primero.",
        resuelve: "el cotizador con control de adeudos: cada folio, cada abono y la lista ordenada por antigüedad."
      });
    }

    if (m.citas) {
      lista.push({
        titulo: m.citas + " citas o pedidos que se caen al mes",
        detalle: "Cada uno es un cliente que se fue con alguien más, y casi siempre por un recordatorio que no salió.",
        resuelve: "la agenda con recordatorio automático antes de la cita o de la entrega."
      });
    }

    if (m.repetidosMes) {
      lista.push({
        titulo: "≈ " + m.repetidosMes + " mensajes al mes son la misma pregunta",
        detalle: "De " + m.mensajesMes + " mensajes al mes, " + num("mismos") + " de cada diez son lo de siempre: el precio, el horario, si hay.",
        resuelve: "las respuestas y avisos por WhatsApp: lo repetido se contesta solo, en tu propio número, y tú decides qué."
      });
    }

    var saber = elegido("saber");
    if (saber === "mes" || saber === "no-se") {
      lista.push({
        titulo: "No puedes saber cómo vas hasta que ya pasó",
        detalle: saber === "mes"
          ? "Sabes cuánto vendiste cuando cierra el mes, así que las decisiones se toman tarde."
          : "Nadie sabe cuánto se vendió ni cuánto queda, y eso deja el negocio a ciegas.",
        resuelve: "el tablero del mes: una pantalla con lo vendido, lo que te deben y lo que está por vencerse."
      });
    }

    var hoy = elegido("hoy");
    if (hoy === "cuaderno" || hoy === "memoria") {
      lista.push({
        titulo: hoy === "cuaderno" ? "Todo vive en un cuaderno" : "Todo vive en la memoria de alguien",
        detalle: "Si ese cuaderno se pierde —o esa persona falta un día— el negocio no sabe qué pasó ayer.",
        resuelve: "un registro que se guarda solo y se puede respaldar. El sistema queda en un equipo del negocio y es tuyo."
      });
    }

    if (texto("faltantes")) {
      lista.push({
        titulo: texto("faltantes") + " veces al mes no tienes a la mano algo que sí vendes",
        detalle: "El cliente que lo pidió ya está enfrente, o ya colgó: la venta se pierde aunque el producto exista.",
        resuelve: "el inventario con avisos, armado con tu lista de productos y tus códigos."
      });
    }

    return lista;
  }

  /* ── Lo que un sistema NO resuelve, dicho antes de que lo pregunten ───── */
  function noResuelve(m) {
    var lista = [];
    lista.push("Si el dinero se pierde porque alguien se lo lleva, el problema no es de software: eso se arregla con conteos y con reglas tuyas, y el sistema solo sirve para que el número no se pueda esconder.");
    if (!texto("faltantes") && !m.escapaMes) {
      lista.push("Si nadie registra lo que entra y sale, ningún sistema puede inventar el dato: armar esa lista contigo es parte de la primera entrega.");
    }
    if (elegido("gente") === "mas") {
      lista.push("Con más de cinco personas usándolo, el trabajo no es solo el sistema: hay que acordar quién captura qué, y esa es una decisión tuya.");
    }
    lista.push("Un sistema no te va a traer clientes ni te va a subir el precio. Ordena lo que ya pasa; lo demás se decide en el negocio.");
    return lista;
  }

  function pintarLista(destino, filas, conResuelve) {
    destino.innerHTML = "";
    filas.forEach(function (f) {
      if (typeof f === "string") {
        var p = document.createElement("p");
        p.textContent = f;
        destino.appendChild(p);
        return;
      }
      var caja = document.createElement("div");
      caja.className = "hallazgo";
      var h = document.createElement("h3");
      h.className = "hallazgo__titulo";
      h.textContent = f.titulo;
      var d = document.createElement("p");
      d.className = "hallazgo__detalle";
      d.textContent = f.detalle;
      caja.appendChild(h);
      caja.appendChild(d);
      if (conResuelve && f.resuelve) {
        var r = document.createElement("p");
        r.className = "hallazgo__resuelve";
        r.textContent = "Qué lo resuelve: " + f.resuelve + ".";
        caja.appendChild(r);
      }
      destino.appendChild(caja);
    });
  }

  function sinContestar() {
    var faltan = [];
    ["dias", "horas", "repite"].forEach(function (n) {
      var campo = formulario.querySelector('[name="' + n + '"]');
      if (campo && !String(campo.value).trim()) faltan.push(campo);
    });
    return faltan;
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var faltan = sinContestar();
    if (faltan.length) {
      falta.textContent = "Contesta lo que falta para ver el resultado.";
      faltan[0].focus();
      return;
    }

    var m = medir();
    var lista = encontrar(m);

    resumen.textContent = m.horasMes
      ? "Con lo que contestaste: ≈" + m.horasMes + " horas al mes en tareas repetidas" +
        (m.escapaMes ? " y ≈" + pesos(m.escapaMes) + " al mes que se escapan." : ".")
      : "Con lo que contestaste, esto es lo que se alcanza a ver.";

    if (!lista.length) {
      lista.push({
        titulo: "Con lo que contestaste no se ve un hueco grande",
        detalle: "Puede que tu operación ya esté ordenada, o que falten los números de merma y de deudas para verlo. Esos son los que más pesan.",
        resuelve: ""
      });
    }
    pintarLista(hallazgos, lista, true);
    pintarLista(limites, noResuelve(m), false);

    /* El mensaje que llega por WhatsApp lleva las respuestas y la medición: el
       diagnóstico lo hace el estudio, pero empieza con los datos puestos. */
    var lineas = ["Hola CAMENA, llené el diagnóstico desde tu página."];
    lineas.push("");
    lineas.push("· Días que abro a la semana: " + num("dias"));
    lineas.push("· Horas al día en cosas que repito: " + num("horas"));
    lineas.push("· Lo que más repito: " + texto("repite"));
    if (num("merma")) lineas.push("· Se me echa a perder por semana: " + pesos(num("merma")));
    if (num("compras")) lineas.push("· Compro de más o de menos por semana: " + pesos(num("compras")));
    if (texto("faltantes")) lineas.push("· Veces al mes sin algo que sí vendo: " + texto("faltantes"));
    if (num("fiado")) lineas.push("· Me deben hoy: " + pesos(num("fiado")) + " (el más viejo: " + (elegidoTexto("antiguedad") || "no sé") + ")");
    lineas.push("· Cuánto tardo en saber cuánto vendí: " + (elegidoTexto("saber") || "no contesté"));
    if (num("perdidas")) lineas.push("· Calculo que pierdo al mes: " + pesos(num("perdidas")));
    if (num("mensajes")) lineas.push("· Mensajes al día: " + num("mensajes") + ", y " + num("mismos") + " de cada diez son la misma pregunta");
    if (num("citas")) lineas.push("· Citas o pedidos que se caen al mes: " + num("citas"));
    lineas.push("· Hoy lo llevo: " + (elegidoTexto("hoy") || "no contesté"));
    if (elegidoTexto("gente")) lineas.push("· Lo usamos: " + elegidoTexto("gente"));
    if (texto("intento")) lineas.push("· Ya intenté: " + texto("intento"));
    lineas.push("");
    if (m.horasMes) lineas.push("Sale: ≈" + m.horasMes + " horas al mes en tareas repetidas.");
    if (m.escapaMes) lineas.push("Sale: ≈" + pesos(m.escapaMes) + " al mes que se escapan.");
    lineas.push("");
    lineas.push("Quiero el diagnóstico contigo.");
    enviar.href = "https://wa.me/" + TELEFONO + "?text=" + encodeURIComponent(lineas.join("\n"));

    falta.textContent = "";
    resultado.hidden = false;
    resultado.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  if (otra) {
    otra.addEventListener("click", function () {
      resultado.hidden = true;
      formulario.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }
})();
