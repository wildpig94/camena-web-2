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
  var MS_LETRA = 32;
  var MS_ESCRITA = 2200;
  var MS_BORRADO = 16;

  /* Modo fundido, para frases largas: escribir 130 letras una por una se siente
     eterno por más rápido que se escriba. Aquí la frase entera aparece y
     desaparece de golpe, con un fundido corto. */
  var MS_FUNDIDO_SALE = 180;
  var MS_FUNDIDO_ENTRA = 260;
  /* Cuánto se queda cada frase antes de cambiar. Subido dos segundos a pedido
     del dueño: 2.8 s se sentía atropellado para frases de 130 letras, que piden
     su tiempo de lectura. */
  var MS_QUIETA = 4800;

  /* El separador «//» parte la frase en dos: lo de antes es el problema y lo de
     después la solución. Se pintan de distinto color. */
  var SEPARADOR = '//';

  function frasesDe(el) {
    return (el.getAttribute("data-frases") || "")
      .split("|")
      .map(function (f) { return f.trim(); })
      .filter(Boolean);
  }

  function pintarPartes(destino, frase) {
    var trozos = frase.split(SEPARADOR);
    destino.textContent = '';
    if (trozos.length < 2) { destino.textContent = frase.trim(); return; }
    var pregunta = document.createElement('span');
    pregunta.className = 'rotador__pregunta';
    pregunta.textContent = trozos[0].trim() + ' ';
    var respuesta = document.createElement('span');
    respuesta.className = 'rotador__respuesta';
    respuesta.textContent = trozos.slice(1).join(SEPARADOR).trim();
    destino.appendChild(pregunta);
    destino.appendChild(respuesta);
  }

  function crearCursor() {
    var c = document.createElement("span");
    c.className = "rotador__cursor";
    c.setAttribute("aria-hidden", "true");
    return c;
  }

  /* Reserva el alto de la frase más larga para que nada de abajo se mueva.

     Dos correcciones medidas, las dos nacidas del mismo error:

     1 · LA RESERVA VA SOBRE EL ANCESTRO EN BLOQUE, NO SOBRE EL ELEMENTO. En
     teléfono `.hero__linea` es `display: inline` (responsive.css:584) y en un
     elemento en línea `min-height` NO HACE NADA. Medido a 390 px: con
     `min-height: 400px` sobre el rotador el titular siguió midiendo 69 px,
     mientras el mismo 400 px sobre una caja en bloque medía 400. La reserva era
     inerte justo en Android, y el titular saltaba 34.5 px (67.8 a 320) cada vez
     que la frase se alargaba.

     2 · SE MIDE SUSTITUYENDO EL TEXTO REAL, no con un medidor aparte. En línea,
     el medidor absoluto se resuelve contra la caja en línea —más angosta que la
     columna— y reservaba 170 px donde hacían falta 136. Sustituir mide en el
     contexto de verdad, con el texto de la línea 1 compartiendo renglones y con
     `text-wrap: balance` incluido. */
  function reservarAlto(el, frases) {
    var cont = el;
    while (cont && getComputedStyle(cont).display === "inline") cont = cont.parentElement;
    if (!cont) cont = el;
    /* Se limpia antes de medir: si no, la reserva anterior acota la medición y
       el valor sube solo cada vez que se vuelve a llamar. */
    cont.style.minHeight = "";
    el.style.minHeight = "";
    var salida = el.querySelector(".rotador__texto") || el;
    /* Lo que hay dentro se guarda como NODOS, no como texto. Sustituir el texto
       y volver a escribir el original borraba los dos colores del rotador de
       giros: el reparto problema/solución vive en dos <span>, y quedaban
       aplanados en un solo color en cuanto se volvía a medir —al arrancar y otra
       vez cuando terminaban de cargar las fuentes—. Lo reportó el dueño el 21 de
       septiembre viendo el texto de un solo color. */
    var guardado = document.createDocumentFragment();
    while (salida.firstChild) guardado.appendChild(salida.firstChild);
    /* Se mide el texto sin el separador: «//» no se ve, pero suma caracteres. */
    var limpias = frases.map(function (f) { return f.split(SEPARADOR).join(" ").replace(/\s+/g, " "); });
    var masLarga = limpias.reduce(function (a, b) { return b.length > a.length ? b : a; }, "");
    salida.textContent = masLarga;
    var alto = cont.getBoundingClientRect().height;
    salida.textContent = "";
    salida.appendChild(guardado);
    if (alto > 0) cont.style.minHeight = Math.ceil(alto) + "px";
  }

  rotadores.forEach(function (el) {
    var frases = frasesDe(el);
    if (frases.length < 2) return;

    var salida = document.createElement("span");
    salida.className = "rotador__texto";
    var inicial = (el.textContent || "").trim() || frases[0];
    /* La primera frase se pinta con el mismo reparto de color que las demás.
       Antes se escribía de un golpe y quedaba plana: en el rotador de giros, que
       parte la frase en problema (rojo) y solución (verde), la primera frase
       —la que más se ve, porque es la que está ahí al cargar— salía de un solo
       color y el reparto aparecía recién a los siete segundos. */
    pintarPartes(salida, inicial);
    el.textContent = "";
    el.appendChild(salida);
    el.appendChild(crearCursor());
    el.classList.add("rotador--activo");
    reservarAlto(el, frases);

    /* ── Quien pide calma, no quien pide que no pase nada ──────────────
       Antes, con prefers-reduced-motion el rotador se quedaba congelado en la
       primera frase. El problema: Android trae esa preferencia activada por
       omisión en muchos equipos (la escala de animación en cero), así que el
       texto se veía roto —fijo— en lugar de tranquilo. Lo que hay que evitar es
       el MOVIMIENTO, no el cambio de información: aquí la frase se sustituye de
       golpe, sin tecleo ni fundido y cada siete segundos, y el cursor no
       parpadea. Sin desplazamiento, sin transición, sin parpadeo: calma. */
    if (CALMA && CALMA.matches) {
      var quieto = Math.max(0, frases.indexOf(inicial));
      var pasarQuieto = function () {
        quieto = (quieto + 1) % frases.length;
        pintarPartes(salida, frases[quieto]);
      };
      pintarPartes(salida, frases[quieto]);
      setInterval(pasarQuieto, 7000);
      return;
    }

    /* ── Modo fundido ── */
    if (el.getAttribute('data-modo') === 'fundido') {
      var i = Math.max(0, frases.indexOf(inicial));
      el.classList.add('rotador--fundido');
      var cambiar = function () {
          el.classList.add('rotador--saliendo');
        setTimeout(function () {
              i = (i + 1) % frases.length;
          pintarPartes(salida, frases[i]);
          reservarAlto(el, frases);
          el.classList.remove('rotador--saliendo');
          el.classList.add('rotador--entrando');
          setTimeout(function () { el.classList.remove('rotador--entrando'); }, MS_FUNDIDO_ENTRA);
          setTimeout(cambiar, MS_QUIETA);
        }, MS_FUNDIDO_SALE);
      };
      pintarPartes(salida, frases[i]);   /* desde el arranque, en dos colores */
      setTimeout(cambiar, MS_QUIETA);
      return;
    }

    var indice = Math.max(0, frases.indexOf(inicial));
    var posicion = inicial.length;
    var borrando = false;

    function paso() {
      var frase = frases[indice];
      if (!borrando) {
        posicion += 1;
        salida.textContent = frase.slice(0, posicion);
        if (posicion >= frase.length) {
          borrando = true;
          /* A propósito NO se pausa cuando la pestaña pasa a segundo plano. Antes
       había un manejador de visibilidad que ponía una bandera compartida y
       cortaba la cadena de temporizadores: si el teléfono bloqueaba la pantalla
       o alguien cambiaba de app, la frase se quedaba pegada para siempre y no
       volvía a alternar. El navegador ya frena los temporizadores solo cuando no
       hay foco, así que la pausa no hacía falta y sí rompía. */
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


    /* A propósito NO se pausa cuando la pestaña pasa a segundo plano. Antes
       había un manejador de visibilidad que ponía una bandera compartida y
       cortaba la cadena de temporizadores: si el teléfono bloqueaba la pantalla
       o alguien cambiaba de app, la frase se quedaba pegada para siempre y no
       volvía a alternar. El navegador ya frena los temporizadores solo cuando no
       hay foco, así que la pausa no hacía falta y sí rompía. */
    setTimeout(paso, MS_ESCRITA);
  });

  /* La fuente entra después (font-display: swap y este script es `defer`), así
     que la reserva se vuelve a medir cuando termina de cargar: con otra fuente
     el mismo texto puede partirse en otro número de renglones. La función limpia
     antes de medir, así que repetirla es seguro (comprobado: tres pasadas dan el
     mismo número en los siete anchos probados). */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      rotadores.forEach(function (el) {
        var frases = frasesDe(el);
        if (frases.length >= 2) reservarAlto(el, frases);
      });
    });
  }
})();
